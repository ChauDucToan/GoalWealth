from __future__ import annotations

from typing import Any

from ..dependencies import get_current_user, get_services
from ..schemas.http_models import PYDANTIC_AVAILABLE
from ..schemas.profile import GoalCreateRequest, GoalUpdateRequest
from ..utils.responses import error_response, success_response

if PYDANTIC_AVAILABLE:
    try:
        from fastapi import Body, Request
        from ..schemas.http_models import ApiEnvelopeModel, GoalCreateRequestModel, GoalUpdateRequestModel
    except ImportError:  # pragma: no cover - optional dependency path
        Body = None  # type: ignore[assignment]
        Request = Any  # type: ignore[assignment]
        ApiEnvelopeModel = Any  # type: ignore[assignment]
        GoalCreateRequestModel = Any  # type: ignore[assignment]
        GoalUpdateRequestModel = Any  # type: ignore[assignment]


def list_goals(request: Any = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)
    status = None
    query_params = getattr(request, "query_params", None)
    if query_params is not None:
        status = query_params.get("status")

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        payload, warnings = services.goal_service.list_goals(current_user, status=status)
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "goals.list"})

    return success_response(payload, request=request, warnings=warnings, meta={"route": "goals.list"})


def create_goal(request: Any = None, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        request_model = GoalCreateRequest(**(payload or {}))
        response_payload, warnings = services.goal_service.create_goal(current_user, request_model)
    except TypeError as exc:
        return error_response(
            "BAD_REQUEST",
            f"Invalid request payload: {exc}",
            request=request,
            status=400,
            meta={"route": "goals.create"},
        )
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "goals.create"})

    return success_response(response_payload, request=request, warnings=warnings, meta={"route": "goals.create"})


def get_goal(request: Any = None, goal_id: str = "") -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        payload, warnings = services.goal_service.get_goal(current_user, goal_id)
    except LookupError as exc:
        return error_response("NOT_FOUND", str(exc), request=request, status=404, meta={"route": "goals.get"})
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "goals.get"})

    return success_response(payload, request=request, warnings=warnings, meta={"route": "goals.get"})


def patch_goal(request: Any = None, goal_id: str = "", payload: dict[str, Any] | None = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        request_model = GoalUpdateRequest(**(payload or {}))
        response_payload, warnings = services.goal_service.update_goal(current_user, goal_id, request_model)
    except TypeError as exc:
        return error_response(
            "BAD_REQUEST",
            f"Invalid request payload: {exc}",
            request=request,
            status=400,
            meta={"route": "goals.patch"},
        )
    except LookupError as exc:
        return error_response("NOT_FOUND", str(exc), request=request, status=404, meta={"route": "goals.patch"})
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "goals.patch"})

    return success_response(response_payload, request=request, warnings=warnings, meta={"route": "goals.patch"})


if PYDANTIC_AVAILABLE and Body is not None:
    async def list_goals_fastapi(request: Request) -> dict[str, Any]:
        return list_goals(request=request)

    async def create_goal_fastapi(request: Request, payload: GoalCreateRequestModel = Body(...)) -> dict[str, Any]:
        model_dump = getattr(payload, "model_dump", None)
        payload_dict = model_dump() if callable(model_dump) else payload.dict()
        return create_goal(request=request, payload=payload_dict)

    async def get_goal_fastapi(goal_id: str, request: Request) -> dict[str, Any]:
        return get_goal(request=request, goal_id=goal_id)

    async def patch_goal_fastapi(request: Request, goal_id: str, payload: GoalUpdateRequestModel = Body(...)) -> dict[str, Any]:
        model_dump = getattr(payload, "model_dump", None)
        payload_dict = model_dump() if callable(model_dump) else payload.dict()
        return patch_goal(request=request, goal_id=goal_id, payload=payload_dict)


def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE and Body is not None:
        app.add_api_route(
            "/v1/goals",
            list_goals_fastapi,
            methods=["GET"],
            tags=["goals"],
            response_model=ApiEnvelopeModel,
        )
        app.add_api_route(
            "/v1/goals",
            create_goal_fastapi,
            methods=["POST"],
            tags=["goals"],
            response_model=ApiEnvelopeModel,
        )
        app.add_api_route(
            "/v1/goals/{goal_id}",
            get_goal_fastapi,
            methods=["GET"],
            tags=["goals"],
            response_model=ApiEnvelopeModel,
        )
        app.add_api_route(
            "/v1/goals/{goal_id}",
            patch_goal_fastapi,
            methods=["PATCH"],
            tags=["goals"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/goals", list_goals, methods=["GET"], tags=["goals"])
    app.add_api_route("/v1/goals", create_goal, methods=["POST"], tags=["goals"])
    app.add_api_route("/v1/goals/{goal_id}", get_goal, methods=["GET"], tags=["goals"])
    app.add_api_route("/v1/goals/{goal_id}", patch_goal, methods=["PATCH"], tags=["goals"])
