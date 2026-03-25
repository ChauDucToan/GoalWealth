from __future__ import annotations

from typing import Any

from ..schemas.auth import UserClaims
from ..schemas.ocr import OcrIngressRequest
from .ocr_gateway import OcrGateway


class OcrFlowService:
    """Builds adapter-side OCR flow behavior before real OCR backend wiring.

    Keeps OCR routers thin and centralizes ingress + record-fetch logic.
    """

    def __init__(self, *, ocr_gateway: OcrGateway):
        self.ocr_gateway = ocr_gateway

    def handle_ingress(
        self,
        request_model: OcrIngressRequest,
        *,
        current_user: UserClaims | None,
    ) -> dict[str, Any]:
        payload = {
            "raw_text": request_model.raw_text,
            "user_id": getattr(current_user, "user_id", None),
            "subject": getattr(current_user, "subject", None),
        }
        return self.ocr_gateway.submit_ingress(payload)

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

        result = self.ocr_gateway.try_get_openclaw_view(ocr_record_id, user_id=user_id)
        if result["ok"]:
            diagnostics["ocr_view"] = "loaded"
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
