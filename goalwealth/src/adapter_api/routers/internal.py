from __future__ import annotations

from typing import Any


def ping_internal() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "Internal router skeleton is present.",
    }


def register(app: Any) -> None:
    if hasattr(app, "add_api_route"):
        app.add_api_route("/internal/ping", ping_internal, methods=["GET"], tags=["internal"])
