from __future__ import annotations

from typing import Any

from ..dependencies import get_current_user, get_services
from ..schemas.http_models import PYDANTIC_AVAILABLE
from ..utils.responses import error_response, success_response


def get_me(request: Any = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response(
            "AUTH_REQUIRED",
            "Bearer token is required",
            request=request,
        )

    try:
        payload, warnings = services.me_service.build_me_payload(current_user)
    except ValueError as exc:
        return error_response(
            "AUTH_REQUIRED",
            str(exc),
            request=request,
        )

    return success_response(
        payload,
        request=request,
        warnings=warnings,
        meta={
            "route": "me.get_me",
        },
    )


def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE:
        try:
            from fastapi import Request
        except ImportError:
            app.add_api_route("/v1/me", get_me, methods=["GET"], tags=["me"])
            return

        from ..schemas.http_models import ApiEnvelopeModel

        async def get_me_fastapi(request: Request) -> dict[str, Any]:
            return get_me(request=request)

        app.add_api_route(
            "/v1/me",
            get_me_fastapi,
            methods=["GET"],
            tags=["me"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/me", get_me, methods=["GET"], tags=["me"])
