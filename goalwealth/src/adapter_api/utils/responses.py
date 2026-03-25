from __future__ import annotations

from typing import Any

from ..constants import REQUEST_ID_CONTEXT_KEY


def _request_id_from_request(request: Any | None) -> str | None:
    return getattr(getattr(request, "state", None), REQUEST_ID_CONTEXT_KEY, None)


def success_response(
    data: Any,
    *,
    request: Any | None = None,
    warnings: list[str] | None = None,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    response_meta = {
        "request_id": _request_id_from_request(request),
        **(meta or {}),
    }
    return {
        "ok": True,
        "data": data,
        "error": None,
        "meta": response_meta,
        "warnings": list(warnings or []),
    }


def error_response(
    code: str,
    message: str,
    *,
    request: Any | None = None,
    details: dict[str, Any] | None = None,
    warnings: list[str] | None = None,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    response_meta = {
        "request_id": _request_id_from_request(request),
        **(meta or {}),
    }
    return {
        "ok": False,
        "data": None,
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
        },
        "meta": response_meta,
        "warnings": list(warnings or []),
    }
