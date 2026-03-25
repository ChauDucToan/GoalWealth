from __future__ import annotations

from typing import Any, Iterable
from urllib.parse import quote

from .base import BaseApiClient


class MemoryClient(BaseApiClient):
    """Client for the GoalWealth memory service view endpoint.

    Contract reference:
    - GET /v1/memory/users/{userId}/view
    - Schema: goalwealth/contracts/memory/memory-service-view.schema.json
    """

    def get_user_view(
        self,
        user_id: str,
        *,
        include_sections: Iterable[str] | None = None,
        ocr_summary_limit: int | None = None,
    ) -> dict[str, Any]:
        if not user_id.strip():
            raise ValueError("user_id is required")

        query: dict[str, Any] = {}
        if include_sections is not None:
            query["includeSections"] = list(include_sections)
        if ocr_summary_limit is not None:
            query["ocrSummaryLimit"] = ocr_summary_limit

        encoded_user_id = quote(user_id, safe="")
        return self._get_json(f"/v1/memory/users/{encoded_user_id}/view", query=query)
