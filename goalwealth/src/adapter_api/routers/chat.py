from __future__ import annotations

from typing import Any

from ..dependencies import build_services, get_current_user
from ..utils.responses import error_response, success_response


def respond(request: Any = None, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    payload = payload or {}
    config = getattr(getattr(request, "app", None), "state", None)
    adapter_config = getattr(config, "config", None)
    services = build_services(adapter_config)
    current_user = get_current_user(request)

    message = str(payload.get("message") or "").strip()
    if not message:
        return error_response(
            "INVALID_REQUEST",
            "message is required",
            request=request,
        )

    user_id = getattr(current_user, "user_id", None)
    warnings: list[str] = []
    context_sources: list[str] = []
    memory_context: dict[str, Any] | None = None
    smart_agent_context: dict[str, Any] | None = None

    if current_user is not None:
        context_sources.append("auth")

    if user_id:
        memory_result = services.memory_gateway.try_get_user_view(
            user_id,
            include_sections=["user_profile", "goals", "risk_profile", "conversation_summary"],
            ocr_summary_limit=5,
        )
        if memory_result["ok"]:
            memory_context = memory_result["data"]
            context_sources.append("memory")
        else:
            error = memory_result["error"] or {}
            warnings.append(
                f"Memory context unavailable: {error.get('type', 'UnknownError')} - {error.get('message', 'unknown error')}"
            )

    if services.smart_agent_gateway.should_query(message):
        smart_agent_result = services.smart_agent_gateway.try_query(
            message,
            user_id=user_id,
            top_k=5,
            freshness_threshold_minutes=180,
            locale=payload.get("locale") or "vi-VN",
            timezone=payload.get("timezone") or "Asia/Ho_Chi_Minh",
        )
        if smart_agent_result["ok"]:
            smart_agent_context = smart_agent_result["data"]
            context_sources.append("smart_agent")
        else:
            error = smart_agent_result["error"] or {}
            warnings.append(
                f"Smart Agent unavailable: {error.get('type', 'UnknownError')} - {error.get('message', 'unknown error')}"
            )

    normalized_payload = {
        "message": message,
        "session_id": payload.get("session_id"),
        "locale": payload.get("locale"),
        "attachments": list(payload.get("attachments") or []),
        "user_id": user_id,
        "subject": getattr(current_user, "subject", None),
        "context_sources": context_sources,
        "memory_context": memory_context,
        "smart_agent_context": smart_agent_context,
        "ocr_record_ids": [],
        "warnings": warnings,
    }

    result = services.orchestrator_gateway.respond(normalized_payload)
    return success_response(
        result,
        request=request,
        warnings=list(result.get("warnings") or []),
        meta={
            "route": "chat.respond",
        },
    )


def register(app: Any) -> None:
    if hasattr(app, "add_api_route"):
        app.add_api_route("/v1/chat/respond", respond, methods=["POST"], tags=["chat"])
