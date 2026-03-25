from __future__ import annotations

from typing import Any

from ..schemas.auth import UserClaims
from ..schemas.chat import ChatRespondRequest
from .memory_gateway import MemoryGateway
from .orchestrator_gateway import OrchestratorGateway
from .smart_agent_gateway import SmartAgentGateway


class ChatFlowService:
    """Builds adapter-side chat context before orchestration.

    This keeps routers thin and centralizes best-effort context assembly.
    """

    def __init__(
        self,
        *,
        orchestrator_gateway: OrchestratorGateway,
        memory_gateway: MemoryGateway,
        smart_agent_gateway: SmartAgentGateway,
    ):
        self.orchestrator_gateway = orchestrator_gateway
        self.memory_gateway = memory_gateway
        self.smart_agent_gateway = smart_agent_gateway

    def handle_chat(
        self,
        request_model: ChatRespondRequest,
        *,
        current_user: UserClaims | None,
    ) -> dict[str, Any]:
        user_id = getattr(current_user, "user_id", None)
        subject = getattr(current_user, "subject", None)

        warnings: list[str] = []
        context_sources: list[str] = []
        memory_context: dict[str, Any] | None = None
        smart_agent_context: dict[str, Any] | None = None
        context_diagnostics: dict[str, str] = {
            "auth": "attached" if current_user is not None else "anonymous",
            "memory": "skipped",
            "smart_agent": "skipped",
        }

        if current_user is not None:
            context_sources.append("auth")

        if user_id:
            memory_result = self.memory_gateway.try_get_user_view(
                user_id,
                include_sections=["user_profile", "goals", "risk_profile", "conversation_summary"],
                ocr_summary_limit=5,
            )
            if memory_result["ok"]:
                memory_context = memory_result["data"]
                context_sources.append("memory")
                context_diagnostics["memory"] = "loaded"
            else:
                context_diagnostics["memory"] = "unavailable"
                error = memory_result["error"] or {}
                warnings.append(
                    f"Memory context unavailable: {error.get('type', 'UnknownError')} - {error.get('message', 'unknown error')}"
                )

        if self.smart_agent_gateway.should_query(request_model.message):
            smart_agent_result = self.smart_agent_gateway.try_query(
                request_model.message,
                user_id=user_id,
                top_k=5,
                freshness_threshold_minutes=180,
                locale=request_model.locale or "vi-VN",
                timezone=request_model.timezone or "Asia/Ho_Chi_Minh",
            )
            if smart_agent_result["ok"]:
                smart_agent_context = smart_agent_result["data"]
                context_sources.append("smart_agent")
                context_diagnostics["smart_agent"] = "loaded"
            else:
                context_diagnostics["smart_agent"] = "unavailable"
                error = smart_agent_result["error"] or {}
                warnings.append(
                    f"Smart Agent unavailable: {error.get('type', 'UnknownError')} - {error.get('message', 'unknown error')}"
                )

        normalized_payload = {
            "message": request_model.message,
            "session_id": request_model.session_id,
            "locale": request_model.locale,
            "attachments": request_model.attachments,
            "user_id": user_id,
            "subject": subject,
            "context_sources": context_sources,
            "context_diagnostics": context_diagnostics,
            "memory_context": memory_context,
            "smart_agent_context": smart_agent_context,
            "ocr_record_ids": [],
            "warnings": warnings,
        }
        return self.orchestrator_gateway.respond(normalized_payload)
