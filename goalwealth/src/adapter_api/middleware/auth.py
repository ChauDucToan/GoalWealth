from __future__ import annotations

from typing import Any

from ..constants import AUTHORIZATION_HEADER, USER_CONTEXT_KEY
from ..dependencies import build_services
from ..services.persistence_bridge import sync_authenticated_user
from ..utils.responses import error_response


def install(app: Any) -> None:
    """Install auth-related middleware or dependencies.

    Current skeleton behavior:
    - reads Authorization header if present
    - parses/verifies placeholder bearer tokens via AuthService
    - attaches user context to request.state
    - returns 401 JSON if the Authorization header is malformed/invalid
    """
    if not hasattr(app, "middleware"):
        return

    try:
        from fastapi.responses import JSONResponse
    except ImportError:
        return

    services = getattr(app.state, "services", None) or build_services(getattr(app.state, "config", None))

    @app.middleware("http")
    async def auth_context_middleware(request: Any, call_next: Any) -> Any:
        authorization_header = request.headers.get(AUTHORIZATION_HEADER)
        try:
            user_claims = services.auth_service.optional_user_from_header(authorization_header)
        except ValueError as exc:
            return JSONResponse(
                status_code=401,
                content=error_response(
                    "INVALID_AUTH_HEADER",
                    str(exc),
                    request=request,
                ),
            )

        if user_claims is not None and services.persistence_service is not None:
            try:
                sync_authenticated_user(services.persistence_service, user_claims)
            except Exception as exc:
                return JSONResponse(
                    status_code=500,
                    content=error_response(
                        "PERSISTENCE_AUTH_SYNC_FAILED",
                        f"Authenticated user could not be synchronized into persistence: {exc}",
                        request=request,
                    ),
                )

        setattr(request.state, USER_CONTEXT_KEY, user_claims)
        if user_claims is None and not services.config.auth_optional:
            return JSONResponse(
                status_code=401,
                content=error_response(
                    "AUTH_REQUIRED",
                    "Bearer token is required",
                    request=request,
                ),
            )

        return await call_next(request)
