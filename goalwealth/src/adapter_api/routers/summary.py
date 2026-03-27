from __future__ import annotations

from typing import Any

from ..dependencies import get_current_user, get_services
from ..schemas.http_models import PYDANTIC_AVAILABLE
from ..utils.responses import error_response, success_response

if PYDANTIC_AVAILABLE:
    try:
        from fastapi import Request
        from ..schemas.http_models import ApiEnvelopeModel
    except ImportError:  # pragma: no cover - optional dependency path
        Request = Any  # type: ignore[assignment]
        ApiEnvelopeModel = Any  # type: ignore[assignment]


def get_summary(request: Any = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        payload, warnings = services.summary_service.build_summary_payload(current_user)
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "summary.get"})

    return success_response(payload, request=request, warnings=warnings, meta={"route": "summary.get"})


if PYDANTIC_AVAILABLE:
    async def get_summary_fastapi(request: Request) -> dict[str, Any]:
        return get_summary(request=request)


def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE:
        app.add_api_route(
            "/v1/summary",
            get_summary_fastapi,
            methods=["GET"],
            tags=["summary"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/summary", get_summary, methods=["GET"], tags=["summary"])
