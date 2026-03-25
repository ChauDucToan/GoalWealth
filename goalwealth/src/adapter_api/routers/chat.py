from __future__ import annotations

from typing import Any

from ..dependencies import get_current_user, get_services
from ..schemas.chat import ChatRespondRequest
from ..schemas.http_models import PYDANTIC_AVAILABLE
from ..utils.responses import error_response, success_response



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



def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE:
        try:
            from fastapi import Request
        except ImportError:
            app.add_api_route("/v1/chat/respond", respond, methods=["POST"], tags=["chat"])
            return

        from ..schemas.http_models import ApiEnvelopeModel, ChatRespondRequestModel

        async def respond_fastapi(request: Request, payload: ChatRespondRequestModel) -> dict[str, Any]:
            model_dump = getattr(payload, "model_dump", None)
            payload_dict = model_dump() if callable(model_dump) else payload.dict()
            return respond(request=request, payload=payload_dict)

        app.add_api_route(
            "/v1/chat/respond",
            respond_fastapi,
            methods=["POST"],
            tags=["chat"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/chat/respond", respond, methods=["POST"], tags=["chat"])
