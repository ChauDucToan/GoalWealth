from __future__ import annotations

from typing import Any

from orchestrator_clients import MemoryClient

from ..config import AdapterApiConfig
from ..schemas.user import StoredUserRecord


class MemoryGateway:
    def __init__(self, config: AdapterApiConfig):
        self.config = config
        self._client: MemoryClient | None = None

    def _client_or_create(self) -> MemoryClient:
        if self._client is None:
            self._client = MemoryClient.from_env(prefix=self.config.internal_api_prefix)
        return self._client

    def get_user_view(self, user_id: str, **kwargs: Any) -> dict[str, Any]:
        return self._client_or_create().get_user_view(user_id, **kwargs)

    def get_user_record(self, user_id: str) -> StoredUserRecord:
        data = self.get_user_view(user_id, include_sections=["user_profile"])
        return StoredUserRecord.from_memory_view(data)

    def try_get_user_view(self, user_id: str, **kwargs: Any) -> dict[str, Any]:
        try:
            data = self.get_user_view(user_id, **kwargs)
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

    def try_get_user_record(self, user_id: str) -> dict[str, Any]:
        try:
            record = self.get_user_record(user_id)
            return {
                "ok": True,
                "data": record,
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
