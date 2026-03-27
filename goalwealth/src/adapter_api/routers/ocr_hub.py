from __future__ import annotations

from typing import Any

from ..dependencies import get_current_user, get_services
from ..schemas.http_models import PYDANTIC_AVAILABLE
from ..utils.responses import error_response, success_response

if PYDANTIC_AVAILABLE:
    try:
        from fastapi import Request
        from ..schemas.http_models import ApiEnvelopeModel
    except ImportError:  # pragma: no cover - optional dependency path
        Request = Any  # type: ignore[assignment]
        ApiEnvelopeModel = Any  # type: ignore[assignment]


def list_ocr_records(request: Any = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)
    query_params = getattr(request, "query_params", None)
    document_type = query_params.get("document_type") if query_params is not None else None
    ingest_status = query_params.get("ingest_status") if query_params is not None else None
    parse_status = query_params.get("parse_status") if query_params is not None else None
    limit_raw = query_params.get("limit") if query_params is not None else None

    if current_user is None:
        return error_response("AUTH_REQUIRED", "Bearer token is required", request=request)

    try:
        limit = int(limit_raw) if limit_raw is not None else 10
    except ValueError:
        return error_response("BAD_REQUEST", "limit must be an integer", request=request, status=400, meta={"route": "ocr.list_records"})

    try:
        payload, warnings = services.ocr_hub_service.list_records(
            current_user,
            document_type=document_type,
            ingest_status=ingest_status,
            parse_status=parse_status,
            limit=limit,
        )
    except ValueError as exc:
        return error_response("BAD_REQUEST", str(exc), request=request, status=400, meta={"route": "ocr.list_records"})

    return success_response(payload, request=request, warnings=warnings, meta={"route": "ocr.list_records"})


if PYDANTIC_AVAILABLE:
    async def list_ocr_records_fastapi(request: Request) -> dict[str, Any]:
        return list_ocr_records(request=request)


def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE:
        app.add_api_route(
            "/v1/ocr/records",
            list_ocr_records_fastapi,
            methods=["GET"],
            tags=["ocr"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/ocr/records", list_ocr_records, methods=["GET"], tags=["ocr"])
