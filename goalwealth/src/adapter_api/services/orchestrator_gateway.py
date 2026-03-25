from __future__ import annotations

import json
from typing import Any
from urllib import error, request

from ..config import AdapterApiConfig
from ..utils.ids import generate_request_id


class OrchestratorGateway:
    def __init__(self, config: AdapterApiConfig):
        self.config = config

    def respond(self, payload: dict[str, Any]) -> dict[str, Any]:
        if self._live_gateway_enabled():
            try:
                return self._respond_via_openclaw_gateway(payload)
            except Exception as exc:
                fallback = self._placeholder_response(payload)
                fallback["warnings"] = [
                    f"OpenClaw gateway call failed, using placeholder response: {exc.__class__.__name__} - {exc}",
                    *list(fallback.get("warnings") or []),
                ]
                fallback["meta"] = {
                    **dict(fallback.get("meta") or {}),
                    "gateway": "openclaw_gateway_fallback",
                    "gateway_error_type": exc.__class__.__name__,
                }
                return fallback

        return self._placeholder_response(payload)

    def _live_gateway_enabled(self) -> bool:
        return bool(self.config.openclaw_base_url and self.config.openclaw_token)

    def _placeholder_response(self, payload: dict[str, Any]) -> dict[str, Any]:
        session_id = payload.get("session_id") or f"gw-session-{generate_request_id()[:8]}"
        user_id = payload.get("user_id")
        message = str(payload.get("message") or "").strip()
        context_sources = list(payload.get("context_sources") or [])
        memory_context = payload.get("memory_context")
        smart_agent_context = payload.get("smart_agent_context")
        context_diagnostics = dict(payload.get("context_diagnostics") or {})
        initial_warnings = list(payload.get("warnings") or [])
        smart_agent_results = list(((payload.get("smart_agent_context") or {}).get("results") or []))

        return {
            "session_id": session_id,
            "reply": (
                "Adapter chat skeleton đã nhận request và chuẩn bị payload cho OpenClaw. "
                f"User={user_id or 'anonymous'}, message_length={len(message)}, "
                f"memory_loaded={bool(memory_context)}, smart_agent_loaded={bool(smart_agent_context)}."
            ),
            "warnings": [
                "OpenClaw real orchestration chưa được nối ở bước này.",
                *initial_warnings,
            ],
            "used_context": {
                "memory": "memory" in context_sources,
                "ocr_records": payload.get("ocr_record_ids", []),
                "smart_agent": "smart_agent" in context_sources,
                "smart_agent_result_count": len(smart_agent_results),
                "user_present": bool(user_id),
                "context_diagnostics": context_diagnostics,
            },
            "meta": {
                "gateway": "orchestrator_placeholder",
                "openclaw_config_present": bool(self.config.openclaw_base_url and self.config.openclaw_token),
                "environment": self.config.environment,
                "memory_summary_present": bool(memory_context),
                "smart_agent_summary_present": bool(smart_agent_context),
            },
        }

    def _respond_via_openclaw_gateway(self, payload: dict[str, Any]) -> dict[str, Any]:
        endpoint = self._gateway_endpoint_url()
        request_body = self._build_gateway_request(payload)
        headers = {
            "Authorization": f"Bearer {self.config.openclaw_token}",
            "Content-Type": "application/json",
            "x-openclaw-agent-id": self.config.openclaw_agent_id,
        }

        session_key = self._build_session_key(payload)
        if session_key:
            headers["x-openclaw-session-key"] = session_key

        req = request.Request(
            url=endpoint,
            data=json.dumps(request_body, ensure_ascii=False).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        with request.urlopen(req, timeout=30) as response:
            raw = response.read().decode("utf-8")
            data = json.loads(raw)

        reply_text = self._extract_gateway_reply_text(data)
        context_sources = list(payload.get("context_sources") or [])
        smart_agent_results = list(((payload.get("smart_agent_context") or {}).get("results") or []))
        context_diagnostics = dict(payload.get("context_diagnostics") or {})

        return {
            "session_id": payload.get("session_id") or session_key,
            "reply": reply_text,
            "warnings": list(payload.get("warnings") or []),
            "used_context": {
                "memory": "memory" in context_sources,
                "ocr_records": payload.get("ocr_record_ids", []),
                "smart_agent": "smart_agent" in context_sources,
                "smart_agent_result_count": len(smart_agent_results),
                "user_present": bool(payload.get("user_id")),
                "context_diagnostics": context_diagnostics,
            },
            "meta": {
                "gateway": "openclaw_gateway_http",
                "openclaw_endpoint": endpoint,
                "openclaw_agent_id": self.config.openclaw_agent_id,
                "openclaw_session_key": session_key,
                "environment": self.config.environment,
                "raw_gateway_response_keys": sorted(data.keys()),
            },
        }

    def _gateway_endpoint_url(self) -> str:
        base = (self.config.openclaw_base_url or "").rstrip("/")
        endpoint_kind = (self.config.openclaw_http_endpoint or "chat_completions").strip().lower()
        if endpoint_kind == "responses":
            return f"{base}/v1/responses"
        return f"{base}/v1/chat/completions"

    def _build_session_key(self, payload: dict[str, Any]) -> str:
        session_id = str(payload.get("session_id") or "").strip()
        user_id = str(payload.get("user_id") or "anonymous").strip() or "anonymous"
        if session_id:
            return f"{self.config.openclaw_session_prefix}:{user_id}:{session_id}"
        return f"{self.config.openclaw_session_prefix}:{user_id}:chat"

    def _build_gateway_request(self, payload: dict[str, Any]) -> dict[str, Any]:
        message = str(payload.get("message") or "").strip()
        memory_context = payload.get("memory_context")
        smart_agent_context = payload.get("smart_agent_context")
        context_diagnostics = payload.get("context_diagnostics")
        locale = payload.get("locale") or "vi-VN"
        user_id = payload.get("user_id")
        subject = payload.get("subject")

        system_instruction = self._build_system_instruction()
        user_prompt = self._build_user_prompt(
            message=message,
            user_id=user_id,
            subject=subject,
            locale=locale,
            memory_context=memory_context,
            smart_agent_context=smart_agent_context,
            context_diagnostics=context_diagnostics,
        )

        endpoint_kind = (self.config.openclaw_http_endpoint or "chat_completions").strip().lower()
        if endpoint_kind == "responses":
            return {
                "model": "openclaw",
                "instructions": system_instruction,
                "user": str(user_id or "anonymous"),
                "input": [
                    {
                        "type": "message",
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": user_prompt,
                            }
                        ],
                    }
                ],
            }

        return {
            "model": "openclaw",
            "user": str(user_id or "anonymous"),
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt},
            ],
        }

    def _build_system_instruction(self) -> str:
        return (
            "You are the GoalWealth OpenClaw orchestrator. "
            "You operate as orchestration only. "
            "Do not create, read, depend on, or update local markdown memory files such as memory.md, MEMORY.md, or memory/*.md. "
            "Use only the structured context provided in this request. "
            "If context is missing, say so briefly instead of inventing details. "
            "Respond with the user-facing assistant reply only, in plain text."
        )

    def _build_user_prompt(
        self,
        *,
        message: str,
        user_id: Any,
        subject: Any,
        locale: Any,
        memory_context: Any,
        smart_agent_context: Any,
        context_diagnostics: Any,
    ) -> str:
        context_payload = {
            "user_id": user_id,
            "subject": subject,
            "locale": locale,
            "memory_context": memory_context,
            "smart_agent_context": smart_agent_context,
            "context_diagnostics": context_diagnostics,
        }
        return (
            "GoalWealth adapter request.\n\n"
            f"Structured context JSON:\n{json.dumps(context_payload, ensure_ascii=False)}\n\n"
            f"User message:\n{message}"
        )

    def _extract_gateway_reply_text(self, data: dict[str, Any]) -> str:
        choices = data.get("choices")
        if isinstance(choices, list) and choices:
            message = choices[0].get("message") or {}
            content = message.get("content")
            if isinstance(content, str):
                return content.strip()
            if isinstance(content, list):
                text_parts: list[str] = []
                for item in content:
                    if isinstance(item, dict):
                        text = item.get("text") or item.get("content")
                        if isinstance(text, str):
                            text_parts.append(text)
                    elif isinstance(item, str):
                        text_parts.append(item)
                if text_parts:
                    return "\n".join(part.strip() for part in text_parts if part.strip())

        output = data.get("output")
        if isinstance(output, list):
            text_parts: list[str] = []
            for item in output:
                if not isinstance(item, dict):
                    continue
                content = item.get("content")
                if isinstance(content, list):
                    for part in content:
                        if isinstance(part, dict):
                            text = part.get("text")
                            if isinstance(text, str):
                                text_parts.append(text)
            if text_parts:
                return "\n".join(part.strip() for part in text_parts if part.strip())

        raise ValueError("Could not extract assistant reply text from OpenClaw gateway response")
