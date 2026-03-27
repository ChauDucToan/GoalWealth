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


def list_recommendations(request: Any = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        payload, warnings = services.recommendation_service.list_recommendations(current_user)
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "recommendations.list"})

    return success_response(payload, request=request, warnings=warnings, meta={"route": "recommendations.list"})


def get_recommendation_detail(recommendation_id: str, request: Any = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        payload, warnings = services.recommendation_service.get_recommendation_detail(current_user, recommendation_id)
    except LookupError as exc:
        return error_response("NOT_FOUND", str(exc), request=request, status=404, meta={"route": "recommendations.get"})
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "recommendations.get"})

    return success_response(payload, request=request, warnings=warnings, meta={"route": "recommendations.get"})


def dismiss_recommendation(recommendation_id: str, request: Any = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        payload, warnings = services.recommendation_service.dismiss_recommendation(current_user, recommendation_id)
    except LookupError as exc:
        return error_response("NOT_FOUND", str(exc), request=request, status=404, meta={"route": "recommendations.dismiss"})
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "recommendations.dismiss"})

    return success_response(payload, request=request, warnings=warnings, meta={"route": "recommendations.dismiss"})


def undismiss_recommendation(recommendation_id: str, request: Any = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        payload, warnings = services.recommendation_service.undismiss_recommendation(current_user, recommendation_id)
    except LookupError as exc:
        return error_response("NOT_FOUND", str(exc), request=request, status=404, meta={"route": "recommendations.undismiss"})
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "recommendations.undismiss"})

    return success_response(payload, request=request, warnings=warnings, meta={"route": "recommendations.undismiss"})


if PYDANTIC_AVAILABLE:
    async def list_recommendations_fastapi(request: Request) -> dict[str, Any]:
        return list_recommendations(request=request)

    async def get_recommendation_detail_fastapi(recommendation_id: str, request: Request) -> dict[str, Any]:
        return get_recommendation_detail(recommendation_id=recommendation_id, request=request)

    async def dismiss_recommendation_fastapi(recommendation_id: str, request: Request) -> dict[str, Any]:
        return dismiss_recommendation(recommendation_id=recommendation_id, request=request)

    async def undismiss_recommendation_fastapi(recommendation_id: str, request: Request) -> dict[str, Any]:
        return undismiss_recommendation(recommendation_id=recommendation_id, request=request)


def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE:
        app.add_api_route(
            "/v1/recommendations",
            list_recommendations_fastapi,
            methods=["GET"],
            tags=["recommendations"],
            response_model=ApiEnvelopeModel,
        )
        app.add_api_route(
            "/v1/recommendations/{recommendation_id}",
            get_recommendation_detail_fastapi,
            methods=["GET"],
            tags=["recommendations"],
            response_model=ApiEnvelopeModel,
        )
        app.add_api_route(
            "/v1/recommendations/{recommendation_id}/dismiss",
            dismiss_recommendation_fastapi,
            methods=["POST"],
            tags=["recommendations"],
            response_model=ApiEnvelopeModel,
        )
        app.add_api_route(
            "/v1/recommendations/{recommendation_id}/undismiss",
            undismiss_recommendation_fastapi,
            methods=["POST"],
            tags=["recommendations"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/recommendations", list_recommendations, methods=["GET"], tags=["recommendations"])
    app.add_api_route("/v1/recommendations/{recommendation_id}", get_recommendation_detail, methods=["GET"], tags=["recommendations"])
    app.add_api_route("/v1/recommendations/{recommendation_id}/dismiss", dismiss_recommendation, methods=["POST"], tags=["recommendations"])
    app.add_api_route("/v1/recommendations/{recommendation_id}/undismiss", undismiss_recommendation, methods=["POST"], tags=["recommendations"])
