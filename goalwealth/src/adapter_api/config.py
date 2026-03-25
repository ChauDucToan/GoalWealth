from __future__ import annotations

import os
from dataclasses import asdict, dataclass
from typing import Any


@dataclass(slots=True)
class AdapterApiConfig:
    service_name: str = "goalwealth-adapter-api"
    version: str = "0.1.0"
    environment: str = "dev"
    host: str = "0.0.0.0"
    port: int = 8080
    log_level: str = "INFO"
    enable_docs: bool = True
    oidc_issuer: str | None = None
    oidc_audience: str | None = None
    oidc_jwks_url: str | None = None
    oidc_tokeninfo_url: str = "https://oauth2.googleapis.com/tokeninfo"
    oidc_timeout_seconds: float = 10.0
    auth_optional: bool = True
    allow_dev_tokens: bool = True
    internal_api_prefix: str = "GOALWEALTH_INTERNAL_API_"
    openclaw_base_url: str | None = None
    openclaw_token: str | None = None
    openclaw_agent_id: str = "main"
    openclaw_session_prefix: str = "goalwealth"
    openclaw_http_endpoint: str = "chat_completions"

    @classmethod
    def from_env(cls) -> "AdapterApiConfig":
        port_raw = os.environ.get("GOALWEALTH_ADAPTER_PORT", "8080")
        try:
            port = int(port_raw)
        except ValueError as exc:
            raise ValueError(f"Invalid GOALWEALTH_ADAPTER_PORT: {port_raw!r}") from exc

        enable_docs_raw = os.environ.get("GOALWEALTH_ADAPTER_ENABLE_DOCS", "true").strip().lower()
        enable_docs = enable_docs_raw in {"1", "true", "yes", "on"}

        auth_optional_raw = os.environ.get("GOALWEALTH_ADAPTER_AUTH_OPTIONAL", "true").strip().lower()
        auth_optional = auth_optional_raw in {"1", "true", "yes", "on"}
        allow_dev_tokens_raw = os.environ.get("GOALWEALTH_ADAPTER_ALLOW_DEV_TOKENS", "true").strip().lower()
        allow_dev_tokens = allow_dev_tokens_raw in {"1", "true", "yes", "on"}
        oidc_timeout_raw = os.environ.get("GOALWEALTH_OIDC_TIMEOUT_SECONDS", "10").strip()
        try:
            oidc_timeout_seconds = float(oidc_timeout_raw)
        except ValueError as exc:
            raise ValueError(f"Invalid GOALWEALTH_OIDC_TIMEOUT_SECONDS: {oidc_timeout_raw!r}") from exc

        return cls(
            service_name=os.environ.get("GOALWEALTH_ADAPTER_SERVICE_NAME", "goalwealth-adapter-api"),
            version=os.environ.get("GOALWEALTH_ADAPTER_VERSION", "0.1.0"),
            environment=os.environ.get("GOALWEALTH_ADAPTER_ENV", "dev"),
            host=os.environ.get("GOALWEALTH_ADAPTER_HOST", "0.0.0.0"),
            port=port,
            log_level=os.environ.get("GOALWEALTH_ADAPTER_LOG_LEVEL", "INFO"),
            enable_docs=enable_docs,
            oidc_issuer=os.environ.get("GOALWEALTH_OIDC_ISSUER"),
            oidc_audience=os.environ.get("GOALWEALTH_OIDC_AUDIENCE"),
            oidc_jwks_url=os.environ.get("GOALWEALTH_OIDC_JWKS_URL"),
            oidc_tokeninfo_url=os.environ.get("GOALWEALTH_OIDC_TOKENINFO_URL", "https://oauth2.googleapis.com/tokeninfo"),
            oidc_timeout_seconds=oidc_timeout_seconds,
            auth_optional=auth_optional,
            allow_dev_tokens=allow_dev_tokens,
            internal_api_prefix=os.environ.get("GOALWEALTH_INTERNAL_API_PREFIX", "GOALWEALTH_INTERNAL_API_"),
            openclaw_base_url=os.environ.get("GOALWEALTH_OPENCLAW_BASE_URL"),
            openclaw_token=os.environ.get("GOALWEALTH_OPENCLAW_TOKEN"),
            openclaw_agent_id=os.environ.get("GOALWEALTH_OPENCLAW_AGENT_ID", "main"),
            openclaw_session_prefix=os.environ.get("GOALWEALTH_OPENCLAW_SESSION_PREFIX", "goalwealth"),
            openclaw_http_endpoint=os.environ.get("GOALWEALTH_OPENCLAW_HTTP_ENDPOINT", "chat_completions"),
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
            "allow_dev_tokens": self.allow_dev_tokens,
            "has_oidc_config": bool(self.oidc_issuer and self.oidc_audience),
            "oidc_verify_mode": "google_tokeninfo",
            "has_openclaw_config": bool(self.openclaw_base_url and self.openclaw_token),
            "openclaw_agent_id": self.openclaw_agent_id,
            "openclaw_session_prefix": self.openclaw_session_prefix,
            "openclaw_http_endpoint": self.openclaw_http_endpoint,
            "internal_api_prefix": self.internal_api_prefix,
        }

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)
