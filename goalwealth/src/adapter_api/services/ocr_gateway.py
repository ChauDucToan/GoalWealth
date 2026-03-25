from __future__ import annotations

from typing import Any

from orchestrator_clients import OcrClient

from ..config import AdapterApiConfig
from ..utils.ids import generate_request_id


class OcrGateway:
    def __init__(self, config: AdapterApiConfig):
        self.config = config
        self._client: OcrClient | None = None

    def _client_or_create(self) -> OcrClient:
        if self._client is None:
            self._client = OcrClient.from_env(prefix=self.config.internal_api_prefix)
        return self._client

    def get_openclaw_view(self, ocr_record_id: str, *, user_id: str) -> dict[str, Any]:
        return self._client_or_create().get_openclaw_view(ocr_record_id, user_id=user_id)

    def try_get_openclaw_view(self, ocr_record_id: str, *, user_id: str) -> dict[str, Any]:
        try:
            data = self.get_openclaw_view(ocr_record_id, user_id=user_id)
            return {
                "ok": True,
                "data": data,
                "error": None,
            }
        except Exception as exc:
            return {
                "ok": False,
                "data": None,
                "error": {
                    "type": exc.__class__.__name__,
                    "message": str(exc),
                },
            }

    def submit_ingress(self, payload: dict[str, Any]) -> dict[str, Any]:
        raw_text = str(payload.get("raw_text") or "")
        user_id = payload.get("user_id")
        ocr_record_id = f"ocr-{generate_request_id()[:12]}"
        return {
            "ocr_record_id": ocr_record_id,
            "status": "accepted",
            "message": "OCR ingress skeleton accepted the raw_text payload. Downstream normalization service is not wired yet.",
            "meta": {
                "user_id": user_id,
                "raw_text_length": len(raw_text),
                "forwarded": False,
                "environment": self.config.environment,
            },
            "diagnostics": {
                "auth": "attached" if user_id else "anonymous",
                "normalization": "not_wired",
            },
        }
