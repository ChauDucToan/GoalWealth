from __future__ import annotations

import os
from dataclasses import asdict, dataclass
from typing import Any


@dataclass(slots=True)
class PersistenceConfig:
    database_url: str | None = None
    echo_sql: bool = False
    pool_pre_ping: bool = True

    @classmethod
    def from_env(cls) -> "PersistenceConfig":
        echo_raw = os.environ.get("GOALWEALTH_DATABASE_ECHO_SQL", "false").strip().lower()
        pre_ping_raw = os.environ.get("GOALWEALTH_DATABASE_POOL_PRE_PING", "true").strip().lower()
        return cls(
            database_url=os.environ.get("GOALWEALTH_DATABASE_URL"),
            echo_sql=echo_raw in {"1", "true", "yes", "on"},
            pool_pre_ping=pre_ping_raw in {"1", "true", "yes", "on"},
        )

    def require_database_url(self) -> str:
        if not self.database_url:
            raise ValueError("GOALWEALTH_DATABASE_URL is required for persistence usage")
        return self.database_url

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)
