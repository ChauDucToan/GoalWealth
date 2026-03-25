from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ChatRespondRequest:
    message: str
    session_id: str | None = None
    locale: str | None = None
    attachments: list[str] = field(default_factory=list)


@dataclass(slots=True)
class ChatRespondResponse:
    session_id: str
    reply: str
    warnings: list[str] = field(default_factory=list)
    used_context: dict[str, Any] = field(default_factory=dict)
    meta: dict[str, Any] = field(default_factory=dict)
