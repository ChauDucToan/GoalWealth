from __future__ import annotations

from typing import Any
from urllib.parse import quote

from .base import BaseApiClient


class OcrClient(BaseApiClient):
    """Client for the GoalWealth OCR OpenClaw view endpoint.

    Contract reference:
    - GET /v1/ocr/records/{ocrRecordId}/openclaw-view
    - Schema: goalwealth/contracts/ocr/ocr-openclaw-view.schema.json
    """

    def get_openclaw_view(self, ocr_record_id: str, *, user_id: str) -> dict[str, Any]:
        if not ocr_record_id.strip():
            raise ValueError("ocr_record_id is required")
        if not user_id.strip():
            raise ValueError("user_id is required")

        encoded_record_id = quote(ocr_record_id, safe="")
        return self._get_json(
            f"/v1/ocr/records/{encoded_record_id}/openclaw-view",
            query={"userId": user_id},
        )
