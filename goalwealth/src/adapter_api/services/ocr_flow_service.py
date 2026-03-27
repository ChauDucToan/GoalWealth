from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from persistence import GoalWealthPersistenceService
from persistence.service_models import OcrRecordCreateInput, OcrRecordUpdateInput

from internal_backend_api.services.ocr_stub_service import build_openclaw_view
from internal_backend_api.services.persistence_views import build_openclaw_view_from_persistence

from ..schemas.auth import UserClaims
from ..schemas.ocr import OcrIngressRequest
from ..utils.ids import generate_request_id
from .ocr_gateway import OcrGateway


class OcrFlowService:
    """Builds adapter-side OCR flow behavior before real OCR backend wiring.

    Keeps OCR routers thin and centralizes ingress + record-fetch logic.
    """

    @staticmethod
    def _normalize_inline(*, ocr_record_id: str, user_id: str) -> dict[str, Any]:
        return build_openclaw_view(ocr_record_id, user_id=user_id)

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
        normalized_inline: bool,
    ) -> dict[str, Any]:
        return {
            "ocr_record_id": ocr_record_id,
            "status": "accepted",
            "message": (
                "OCR ingress accepted, normalized inline, and stored for downstream retrieval."
                if persisted and normalized_inline
                else "OCR ingress accepted and stored for downstream normalization."
                if persisted
                else "OCR ingress skeleton accepted the raw_text payload. Downstream normalization service is not wired yet."
            ),
            "meta": {
                "user_id": user_id,
                "raw_text_length": len(raw_text),
                "persisted": persisted,
                "normalized_inline": normalized_inline,
                "environment": self.ocr_gateway.config.environment,
            },
            "diagnostics": {
                "auth": "attached" if user_id else "anonymous",
                "normalization": "inline_completed" if normalized_inline else "not_wired",
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

            normalized_view = self._normalize_inline(ocr_record_id=ocr_record_id, user_id=user_id)
            facts = normalized_view.get("facts") if isinstance(normalized_view.get("facts"), dict) else {}
            warnings = normalized_view.get("warnings") if isinstance(normalized_view.get("warnings"), list) else []
            missing_fields = normalized_view.get("missing_fields") if isinstance(normalized_view.get("missing_fields"), list) else []
            validation_payload = {
                "warnings": warnings,
                "missing_fields": missing_fields,
            }
            orchestration_hint = (
                normalized_view.get("orchestration_hint")
                if isinstance(normalized_view.get("orchestration_hint"), dict)
                else {}
            )
            processed_at_raw = normalized_view.get("updated_at") or normalized_view.get("created_at")
            processed_at = None
            if isinstance(processed_at_raw, str):
                try:
                    processed_at = datetime.fromisoformat(processed_at_raw.replace("Z", "+00:00"))
                except ValueError:
                    processed_at = datetime.now(timezone.utc)
            if processed_at is None:
                processed_at = datetime.now(timezone.utc)

            parse_status = str(normalized_view.get("status") or "processed")
            ingest_status = "failed" if parse_status == "validation_failed" else "ready"

            self.persistence_service.update_ocr_record(
                user_id,
                ocr_record_id,
                OcrRecordUpdateInput(
                    ingest_status=ingest_status,
                    parse_status=parse_status,
                    document_type=str(normalized_view.get("document_type") or "unknown"),
                    raw_text=request_model.raw_text,
                    summary_text=str(normalized_view.get("summary_text") or ""),
                    is_usable=bool(normalized_view.get("usable")),
                    overall_confidence=normalized_view.get("overall_confidence"),
                    normalization_confidence=normalized_view.get("overall_confidence"),
                    manual_review_required=bool(normalized_view.get("manual_review_required")),
                    auto_apply_allowed=bool(normalized_view.get("auto_apply_allowed")),
                    normalized_data_jsonb=facts,
                    validation_jsonb=validation_payload,
                    orchestration_hint_jsonb=orchestration_hint,
                    normalizer_version="inline-stub-v1",
                    processed_at=processed_at,
                ),
            )
            return self._build_accepted_response(
                ocr_record_id=ocr_record_id,
                raw_text=request_model.raw_text,
                user_id=user_id,
                persisted=True,
                normalized_inline=True,
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
