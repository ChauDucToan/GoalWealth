from __future__ import annotations

from typing import Any

from ..dependencies import get_current_user, get_services
from ..schemas.http_models import PYDANTIC_AVAILABLE
from ..schemas.profile import RiskProfileUpsertRequest
from ..utils.responses import error_response, success_response

if PYDANTIC_AVAILABLE:
    try:
        from fastapi import Body, Request
        from ..schemas.http_models import ApiEnvelopeModel, RiskProfileUpsertRequestModel
    except ImportError:  # pragma: no cover - optional dependency path
        Body = None  # type: ignore[assignment]
        Request = Any  # type: ignore[assignment]
        ApiEnvelopeModel = Any  # type: ignore[assignment]
        RiskProfileUpsertRequestModel = Any  # type: ignore[assignment]


def get_risk_profile(request: Any) -> dict[str, Any]:
    current_user = get_current_user(request)
    services = get_services(request)
    try:
        payload, warnings = services.risk_profile_service.get_risk_profile(current_user)
    except ValueError as exc:
        return error_response(
            code="BAD_REQUEST",
            message=str(exc),
            request=request,
            status=400,
            meta={"route": "risk_profile.get"},
        )
    return success_response(payload, request=request, meta={"route": "risk_profile.get"}, warnings=warnings)


def put_risk_profile(request: Any, payload: dict[str, Any]) -> dict[str, Any]:
    current_user = get_current_user(request)
    services = get_services(request)
    try:
        request_model = RiskProfileUpsertRequest(**payload)
        response_payload, warnings = services.risk_profile_service.put_risk_profile(current_user, request_model)
    except TypeError as exc:
        return error_response(
            code="BAD_REQUEST",
            message=f"Invalid request payload: {exc}",
            request=request,
            status=400,
            meta={"route": "risk_profile.put"},
        )
    except ValueError as exc:
        return error_response(
            code="BAD_REQUEST",
            message=str(exc),
            request=request,
            status=400,
            meta={"route": "risk_profile.put"},
        )
    return success_response(response_payload, request=request, meta={"route": "risk_profile.put"}, warnings=warnings)


if PYDANTIC_AVAILABLE and Body is not None:
    async def get_risk_profile_fastapi(request: Request) -> dict[str, Any]:
        return get_risk_profile(request=request)

    async def put_risk_profile_fastapi(request: Request, payload: RiskProfileUpsertRequestModel = Body(...)) -> dict[str, Any]:
        model_dump = getattr(payload, "model_dump", None)
        payload_dict = model_dump() if callable(model_dump) else payload.dict()
        return put_risk_profile(request=request, payload=payload_dict)


def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE and Body is not None:
        app.add_api_route(
            "/v1/risk-profile",
            get_risk_profile_fastapi,
            methods=["GET"],
            tags=["risk-profile"],
            response_model=ApiEnvelopeModel,
        )
        app.add_api_route(
            "/v1/risk-profile",
            put_risk_profile_fastapi,
            methods=["PUT"],
            tags=["risk-profile"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/risk-profile", get_risk_profile, methods=["GET"], tags=["risk-profile"])
    app.add_api_route("/v1/risk-profile", put_risk_profile, methods=["PUT"], tags=["risk-profile"])
