from __future__ import annotations

from typing import Any

from ..dependencies import get_current_user, get_services
from ..schemas.http_models import PYDANTIC_AVAILABLE
from ..schemas.profile import MeUpdateRequest
from ..utils.responses import error_response, success_response

if PYDANTIC_AVAILABLE:
    try:
        from fastapi import Body, Request
        from ..schemas.http_models import ApiEnvelopeModel, MeUpdateRequestModel
    except ImportError:  # pragma: no cover - optional dependency path
        Body = None  # type: ignore[assignment]
        Request = Any  # type: ignore[assignment]
        ApiEnvelopeModel = Any  # type: ignore[assignment]
        MeUpdateRequestModel = Any  # type: ignore[assignment]


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


def patch_me(request: Any = None, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response(
            "AUTH_REQUIRED",
            "Bearer token is required",
            request=request,
        )

    try:
        request_model = MeUpdateRequest(**(payload or {}))
        response_payload, warnings = services.me_service.update_me_profile(current_user, request_model)
    except TypeError as exc:
        return error_response(
            "BAD_REQUEST",
            f"Invalid request payload: {exc}",
            request=request,
            status=400,
            meta={"route": "me.patch_me"},
        )
    except ValueError as exc:
        return error_response(
            "BAD_REQUEST",
            str(exc),
            request=request,
            status=400,
            meta={"route": "me.patch_me"},
        )

    return success_response(
        response_payload,
        request=request,
        warnings=warnings,
        meta={"route": "me.patch_me"},
    )


if PYDANTIC_AVAILABLE and Body is not None:
    async def get_me_fastapi(request: Request) -> dict[str, Any]:
        return get_me(request=request)

    async def patch_me_fastapi(request: Request, payload: MeUpdateRequestModel = Body(...)) -> dict[str, Any]:
        model_dump = getattr(payload, "model_dump", None)
        payload_dict = model_dump() if callable(model_dump) else payload.dict()
        return patch_me(request=request, payload=payload_dict)


def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE and Body is not None:
        app.add_api_route(
            "/v1/me",
            get_me_fastapi,
            methods=["GET"],
            tags=["me"],
            response_model=ApiEnvelopeModel,
        )
        app.add_api_route(
            "/v1/me",
            patch_me_fastapi,
            methods=["PATCH"],
            tags=["me"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/me", get_me, methods=["GET"], tags=["me"])
    app.add_api_route("/v1/me", patch_me, methods=["PATCH"], tags=["me"])
