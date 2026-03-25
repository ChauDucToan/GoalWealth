from __future__ import annotations

from typing import Any, Iterable

from .base import BaseApiClient


class SmartAgentClient(BaseApiClient):
    """Client for the GoalWealth Smart Agent query endpoint.

    Contract reference:
    - POST /v1/smart-agent/query
    - Response shape aligned with goalwealth/contracts/api/openclaw-backend-api.openapi.yaml
    """

    def query(
        self,
        query: str,
        *,
        user_id: str | None = None,
        top_k: int | None = None,
        categories: Iterable[str] | None = None,
        freshness_threshold_minutes: int | None = None,
        locale: str | None = None,
        timezone: str | None = None,
        trace_id: str | None = None,
        caller: str = "openclaw_orchestrator",
    ) -> dict[str, Any]:
        cleaned_query = query.strip()
        if not cleaned_query:
            raise ValueError("query is required")

        payload: dict[str, Any] = {
            "query": cleaned_query,
            "caller": caller,
        }
        if user_id is not None:
            payload["user_id"] = user_id
        if top_k is not None:
            payload["top_k"] = top_k
        if categories is not None:
            payload["categories"] = list(categories)
        if freshness_threshold_minutes is not None:
            payload["freshness_threshold_minutes"] = freshness_threshold_minutes
        if locale is not None:
            payload["locale"] = locale
        if timezone is not None:
            payload["timezone"] = timezone
        if trace_id is not None:
            payload["trace_id"] = trace_id

        return self._post_json("/v1/smart-agent/query", payload=payload)
