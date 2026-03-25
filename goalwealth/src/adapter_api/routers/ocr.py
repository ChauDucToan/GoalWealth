from __future__ import annotations

from typing import Any

from ..dependencies import build_services, get_current_user
from ..utils.responses import error_response, success_response


def ingest(request: Any = None, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    payload = payload or {}
    config = getattr(getattr(request, "app", None), "state", None)
    adapter_config = getattr(config, "config", None)
    services = build_services(adapter_config)
    current_user = get_current_user(request)

    raw_text = str(payload.get("raw_text") or "").strip()
    if not raw_text:
        return error_response(
            "INVALID_REQUEST",
            "raw_text is required",
            request=request,
        )

    normalized_payload = {
        "raw_text": raw_text,
        "user_id": getattr(current_user, "user_id", None),
        "subject": getattr(current_user, "subject", None),
    }
    result = services.ocr_gateway.submit_ingress(normalized_payload)
    return success_response(
        result,
        request=request,
        meta={
            "route": "ocr.ingest",
        },
    )


def get_record(ocr_record_id: str, request: Any = None) -> dict[str, Any]:
    config = getattr(getattr(request, "app", None), "state", None)
    adapter_config = getattr(config, "config", None)
    services = build_services(adapter_config)
    current_user = get_current_user(request)

    warnings: list[str] = []
    user_id = getattr(current_user, "user_id", None)
    if not user_id:
        warnings.append("User context is missing; OCR OpenClaw view fetch was skipped.")
        return success_response(
            {
                "ocr_record_id": ocr_record_id,
                "status": "pending_user_context",
                "warnings": warnings,
                "data": {},
            },
            request=request,
            warnings=warnings,
            meta={
                "route": "ocr.get_record",
            },
        )

    result = services.ocr_gateway.try_get_openclaw_view(ocr_record_id, user_id=user_id)
    if result["ok"]:
        return success_response(
            {
                "ocr_record_id": ocr_record_id,
                "status": "ready",
                "warnings": [],
                "data": result["data"],
            },
            request=request,
            meta={
                "route": "ocr.get_record",
            },
        )

    error = result["error"] or {}
    warnings.append(
        f"OCR view unavailable: {error.get('type', 'UnknownError')} - {error.get('message', 'unknown error')}"
    )
    return success_response(
        {
            "ocr_record_id": ocr_record_id,
            "status": "pending_backend",
            "warnings": warnings,
            "data": {},
        },
        request=request,
        warnings=warnings,
        meta={
            "route": "ocr.get_record",
        },
    )


def register(app: Any) -> None:
    if hasattr(app, "add_api_route"):
        app.add_api_route("/v1/ocr/ingress", ingest, methods=["POST"], tags=["ocr"])
        app.add_api_route("/v1/ocr/records/{ocr_record_id}", get_record, methods=["GET"], tags=["ocr"])
