from __future__ import annotations

from typing import Any

from orchestrator_clients import SmartAgentClient

from ..config import AdapterApiConfig


SMART_AGENT_HINT_KEYWORDS = {
    "tin",
    "news",
    "thị trường",
    "thi truong",
    "market",
    "cổ phiếu",
    "co phieu",
    "stock",
    "etf",
    "vnindex",
    "chứng khoán",
    "chung khoan",
    "giá vàng",
    "gia vang",
    "bitcoin",
    "crypto",
    "lãi suất",
    "lai suat",
    "fed",
    "usd",
    "oil",
    "dầu",
    "dau",
    "ai",
    "nvidia",
}


class SmartAgentGateway:
    def __init__(self, config: AdapterApiConfig):
        self.config = config
        self._client: SmartAgentClient | None = None

    def _client_or_create(self) -> SmartAgentClient:
        if self._client is None:
            self._client = SmartAgentClient.from_env(prefix=self.config.internal_api_prefix)
        return self._client

    def should_query(self, message: str) -> bool:
        haystack = message.strip().lower()
        if not haystack:
            return False
        return any(keyword in haystack for keyword in SMART_AGENT_HINT_KEYWORDS)

    def query(self, query: str, **kwargs: Any) -> dict[str, Any]:
        return self._client_or_create().query(query, **kwargs)

    def try_query(self, query: str, **kwargs: Any) -> dict[str, Any]:
        try:
            data = self.query(query, **kwargs)
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
