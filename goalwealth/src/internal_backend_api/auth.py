from __future__ import annotations

from typing import Any

from .config import InternalBackendApiConfig
from .errors import ApiHttpError



def ensure_internal_auth(request: Any | None, config: InternalBackendApiConfig) -> None:
    if config.auth_optional or not config.bearer_token:
        return

    header = None
    if request is not None:
        headers = getattr(request, "headers", None)
        if headers is not None:
            header = headers.get("authorization") or headers.get("Authorization")

    if not header:
        raise ApiHttpError(401, "UNAUTHORIZED", "Missing Authorization header")

    value = str(header).strip()
    scheme, _, token = value.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise ApiHttpError(401, "UNAUTHORIZED", "Authorization header must use Bearer <token>")

    if token.strip() != config.bearer_token:
        raise ApiHttpError(401, "UNAUTHORIZED", "Invalid internal bearer token")
