from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ChatRespondRequest:
    message: str
    session_id: str | None = None
    locale: str | None = None
    timezone: str | None = None
    attachments: list[str] = field(default_factory=list)

    @classmethod
    def from_payload(cls, payload: dict[str, Any] | None) -> "ChatRespondRequest":
        payload = payload or {}
        message = str(payload.get("message") or "").strip()
        if not message:
            raise ValueError("message is required")

        attachments_raw = payload.get("attachments") or []
        if not isinstance(attachments_raw, list):
            raise ValueError("attachments must be a list when provided")

        attachments = [str(item) for item in attachments_raw]
        session_id = str(payload.get("session_id") or "").strip() or None
        locale = str(payload.get("locale") or "").strip() or None
        timezone = str(payload.get("timezone") or "").strip() or None
        return cls(
            message=message,
            session_id=session_id,
            locale=locale,
            timezone=timezone,
            attachments=attachments,
        )


@dataclass(slots=True)
class ChatRespondResponse:
    session_id: str
    reply: str
    warnings: list[str] = field(default_factory=list)
    used_context: dict[str, Any] = field(default_factory=dict)
    meta: dict[str, Any] = field(default_factory=dict)
