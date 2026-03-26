from __future__ import annotations

from typing import Any

from persistence import GoalWealthPersistenceService
from persistence.service_models import OcrRecordCreateInput

from internal_backend_api.services.persistence_views import build_openclaw_view_from_persistence

from ..schemas.auth import UserClaims
from ..schemas.ocr import OcrIngressRequest
from ..utils.ids import generate_request_id
from .ocr_gateway import OcrGateway


class OcrFlowService:
    """Builds adapter-side OCR flow behavior before real OCR backend wiring.

    Keeps OCR routers thin and centralizes ingress + record-fetch logic.
    """

    def __init__(
        self,
        *,
        ocr_gateway: OcrGateway,
        persistence_service: GoalWealthPersistenceService | None = None,
    ):
        self.ocr_gateway = ocr_gateway
        self.persistence_service = persistence_service

    def _build_accepted_response(
        self,
        *,
        ocr_record_id: str,
        raw_text: str,
        user_id: str | None,
        persisted: bool,
    ) -> dict[str, Any]:
        return {
            "ocr_record_id": ocr_record_id,
            "status": "accepted",
            "message": (
                "OCR ingress accepted and stored for downstream normalization."
                if persisted
                else "OCR ingress skeleton accepted the raw_text payload. Downstream normalization service is not wired yet."
            ),
            "meta": {
                "user_id": user_id,
                "raw_text_length": len(raw_text),
                "persisted": persisted,
                "environment": self.ocr_gateway.config.environment,
            },
            "diagnostics": {
                "auth": "attached" if user_id else "anonymous",
                "normalization": "not_wired",
                "persistence": "stored" if persisted else "not_configured",
            },
        }

    def handle_ingress(
        self,
        request_model: OcrIngressRequest,
        *,
        current_user: UserClaims | None,
    ) -> dict[str, Any]:
        user_id = getattr(current_user, "user_id", None)

        if self.persistence_service is not None and user_id:
            ocr_record_id = f"ocr-{generate_request_id()[:12]}"
            self.persistence_service.create_ocr_record(
                user_id,
                OcrRecordCreateInput(
                    ocr_record_id=ocr_record_id,
                    source_type="frontend_sdk",
                    document_type="unknown",
                    ingest_status="pending_backend",
                    language="vi",
                    raw_text=request_model.raw_text,
                    raw_text_confidence=None,
                    summary_text=None,
                    is_usable=None,
                    overall_confidence=None,
                    normalization_confidence=None,
                    manual_review_required=False,
                    auto_apply_allowed=False,
                    normalized_data_jsonb={},
                    validation_jsonb={},
                    orchestration_hint_jsonb={},
                ),
            )
            return self._build_accepted_response(
                ocr_record_id=ocr_record_id,
                raw_text=request_model.raw_text,
                user_id=user_id,
                persisted=True,
            )

        payload = {
            "raw_text": request_model.raw_text,
            "user_id": user_id,
            "subject": getattr(current_user, "subject", None),
        }
        fallback = self.ocr_gateway.submit_ingress(payload)
        fallback.setdefault("diagnostics", {})
        fallback["diagnostics"]["persistence"] = "not_configured"
        return fallback

    def handle_get_record(
        self,
        ocr_record_id: str,
        *,
        current_user: UserClaims | None,
    ) -> tuple[dict[str, Any], list[str]]:
        warnings: list[str] = []
        diagnostics: dict[str, str] = {
            "auth": "attached" if current_user is not None else "anonymous",
            "ocr_view": "skipped",
            "persistence": "not_configured" if self.persistence_service is None else "enabled",
        }

        user_id = getattr(current_user, "user_id", None)
        if not user_id:
            warnings.append("User context is missing; OCR OpenClaw view fetch was skipped.")
            diagnostics["ocr_view"] = "pending_user_context"
            return (
                {
                    "ocr_record_id": ocr_record_id,
                    "status": "pending_user_context",
                    "warnings": warnings,
                    "data": {},
                    "diagnostics": diagnostics,
                },
                warnings,
            )

        if self.persistence_service is not None:
            persisted_record = self.persistence_service.get_ocr_record(user_id, ocr_record_id)
            if persisted_record is not None:
                diagnostics["persistence"] = "hit"
                if persisted_record.ingest_status in {"pending_backend", "pending_user_context"}:
                    diagnostics["ocr_view"] = "pending_from_persistence"
                    return (
                        {
                            "ocr_record_id": ocr_record_id,
                            "status": persisted_record.ingest_status,
                            "warnings": [],
                            "data": {
                                "document_type": persisted_record.document_type,
                                "summary_text": persisted_record.summary_text,
                                "created_at": persisted_record.created_at.isoformat() if persisted_record.created_at else None,
                                "updated_at": persisted_record.updated_at.isoformat() if persisted_record.updated_at else None,
                            },
                            "diagnostics": diagnostics,
                        },
                        [],
                    )

                persisted_view = build_openclaw_view_from_persistence(
                    self.persistence_service,
                    ocr_record_id,
                    user_reference=str(user_id),
                )
                if persisted_view is not None:
                    diagnostics["ocr_view"] = "loaded_from_persistence"
                    return (
                        {
                            "ocr_record_id": ocr_record_id,
                            "status": "ready",
                            "warnings": [],
                            "data": persisted_view,
                            "diagnostics": diagnostics,
                        },
                        [],
                    )
            else:
                diagnostics["persistence"] = "miss"

        result = self.ocr_gateway.try_get_openclaw_view(ocr_record_id, user_id=user_id)
        if result["ok"]:
            diagnostics["ocr_view"] = "loaded_from_gateway"
            return (
                {
                    "ocr_record_id": ocr_record_id,
                    "status": "ready",
                    "warnings": [],
                    "data": result["data"],
                    "diagnostics": diagnostics,
                },
                [],
            )

        diagnostics["ocr_view"] = "unavailable"
        error = result["error"] or {}
        warnings.append(
            f"OCR view unavailable: {error.get('type', 'UnknownError')} - {error.get('message', 'unknown error')}"
        )
        return (
            {
                "ocr_record_id": ocr_record_id,
                "status": "pending_backend",
                "warnings": warnings,
                "data": {},
                "diagnostics": diagnostics,
            },
            warnings,
        )
