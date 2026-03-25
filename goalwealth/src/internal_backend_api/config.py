from __future__ import annotations

import os
from dataclasses import asdict, dataclass
from typing import Any


@dataclass(slots=True)
class InternalBackendApiConfig:
    service_name: str = "goalwealth-internal-backend-api"
    version: str = "0.1.0"
    environment: str = "dev"
    host: str = "0.0.0.0"
    port: int = 8090
    log_level: str = "INFO"
    enable_docs: bool = True
    auth_optional: bool = True
    bearer_token: str | None = None
    smart_agent_mode: str = "stub"
    news_base_url: str = "https://news.goalwealth.local"
    default_locale: str = "vi-VN"
    default_timezone: str = "Asia/Ho_Chi_Minh"

    @classmethod
    def from_env(cls) -> "InternalBackendApiConfig":
        port_raw = os.environ.get("GOALWEALTH_INTERNAL_BACKEND_PORT", "8090").strip()
        try:
            port = int(port_raw)
        except ValueError as exc:
            raise ValueError(
                f"Invalid GOALWEALTH_INTERNAL_BACKEND_PORT: {port_raw!r}"
            ) from exc

        enable_docs_raw = os.environ.get("GOALWEALTH_INTERNAL_BACKEND_ENABLE_DOCS", "true").strip().lower()
        auth_optional_raw = os.environ.get("GOALWEALTH_INTERNAL_BACKEND_AUTH_OPTIONAL", "true").strip().lower()

        return cls(
            service_name=os.environ.get(
                "GOALWEALTH_INTERNAL_BACKEND_SERVICE_NAME",
                "goalwealth-internal-backend-api",
            ),
            version=os.environ.get("GOALWEALTH_INTERNAL_BACKEND_VERSION", "0.1.0"),
            environment=os.environ.get("GOALWEALTH_INTERNAL_BACKEND_ENV", "dev"),
            host=os.environ.get("GOALWEALTH_INTERNAL_BACKEND_HOST", "0.0.0.0"),
            port=port,
            log_level=os.environ.get("GOALWEALTH_INTERNAL_BACKEND_LOG_LEVEL", "INFO"),
            enable_docs=enable_docs_raw in {"1", "true", "yes", "on"},
            auth_optional=auth_optional_raw in {"1", "true", "yes", "on"},
            bearer_token=(os.environ.get("GOALWEALTH_INTERNAL_BACKEND_BEARER_TOKEN") or "").strip() or None,
            smart_agent_mode=os.environ.get("GOALWEALTH_INTERNAL_BACKEND_SMART_AGENT_MODE", "stub"),
            news_base_url=os.environ.get("GOALWEALTH_INTERNAL_BACKEND_NEWS_BASE_URL", "https://news.goalwealth.local"),
            default_locale=os.environ.get("GOALWEALTH_INTERNAL_BACKEND_DEFAULT_LOCALE", "vi-VN"),
            default_timezone=os.environ.get("GOALWEALTH_INTERNAL_BACKEND_DEFAULT_TIMEZONE", "Asia/Ho_Chi_Minh"),
        )

    def public_runtime_summary(self) -> dict[str, Any]:
        return {
            "service_name": self.service_name,
            "version": self.version,
            "environment": self.environment,
            "host": self.host,
            "port": self.port,
            "enable_docs": self.enable_docs,
            "auth_optional": self.auth_optional,
            "has_bearer_token": bool(self.bearer_token),
            "smart_agent_mode": self.smart_agent_mode,
            "news_base_url": self.news_base_url,
            "default_locale": self.default_locale,
            "default_timezone": self.default_timezone,
        }

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)
