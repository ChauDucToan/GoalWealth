from __future__ import annotations

from typing import Any

from ..dependencies import get_current_user, get_services
from ..schemas.chat import ChatRespondRequest
from ..schemas.http_models import PYDANTIC_AVAILABLE
from ..utils.responses import error_response, success_response

if PYDANTIC_AVAILABLE:
    try:
        from fastapi import Body, Request
        from ..schemas.http_models import ApiEnvelopeModel, ChatRespondRequestModel
    except ImportError:  # pragma: no cover - optional dependency path
        Body = None  # type: ignore[assignment]
        Request = Any  # type: ignore[assignment]
        ApiEnvelopeModel = Any  # type: ignore[assignment]
        ChatRespondRequestModel = Any  # type: ignore[assignment]



def respond(request: Any = None, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    try:
        request_model = ChatRespondRequest.from_payload(payload)
    except ValueError as exc:
        return error_response(
            "INVALID_REQUEST",
            str(exc),
            request=request,
        )

    result = services.chat_flow_service.handle_chat(
        request_model,
        current_user=current_user,
    )
    return success_response(
        result,
        request=request,
        warnings=list(result.get("warnings") or []),
        meta={
            "route": "chat.respond",
        },
    )



if PYDANTIC_AVAILABLE and Body is not None:
    async def respond_fastapi(request: Request, payload: ChatRespondRequestModel = Body(...)) -> dict[str, Any]:
        model_dump = getattr(payload, "model_dump", None)
        payload_dict = model_dump() if callable(model_dump) else payload.dict()
        return respond(request=request, payload=payload_dict)


def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE and Body is not None:
        app.add_api_route(
            "/v1/chat/respond",
            respond_fastapi,
            methods=["POST"],
            tags=["chat"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/chat/respond", respond, methods=["POST"], tags=["chat"])
