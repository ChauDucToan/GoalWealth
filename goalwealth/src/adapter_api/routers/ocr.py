from __future__ import annotations

from typing import Any

from ..dependencies import get_current_user, get_services
from ..schemas.http_models import PYDANTIC_AVAILABLE
from ..schemas.ocr import OcrIngressRequest
from ..utils.responses import error_response, success_response



def ingest(request: Any = None, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    try:
        request_model = OcrIngressRequest.from_payload(payload)
    except ValueError as exc:
        return error_response(
            "INVALID_REQUEST",
            str(exc),
            request=request,
        )

    result = services.ocr_flow_service.handle_ingress(
        request_model,
        current_user=current_user,
    )
    return success_response(
        result,
        request=request,
        meta={
            "route": "ocr.ingest",
        },
    )



def get_record(ocr_record_id: str, request: Any = None) -> dict[str, Any]:
    services = get_services(request)
    current_user = get_current_user(request)

    result, warnings = services.ocr_flow_service.handle_get_record(
        ocr_record_id,
        current_user=current_user,
    )
    return success_response(
        result,
        request=request,
        warnings=warnings,
        meta={
            "route": "ocr.get_record",
        },
    )



def register(app: Any) -> None:
    if not hasattr(app, "add_api_route"):
        return

    if PYDANTIC_AVAILABLE:
        try:
            from fastapi import Request
        except ImportError:
            app.add_api_route("/v1/ocr/ingress", ingest, methods=["POST"], tags=["ocr"])
            app.add_api_route("/v1/ocr/records/{ocr_record_id}", get_record, methods=["GET"], tags=["ocr"])
            return

        from ..schemas.http_models import ApiEnvelopeModel, OcrIngressRequestModel

        async def ingest_fastapi(request: Request, payload: OcrIngressRequestModel) -> dict[str, Any]:
            model_dump = getattr(payload, "model_dump", None)
            payload_dict = model_dump() if callable(model_dump) else payload.dict()
            return ingest(request=request, payload=payload_dict)

        async def get_record_fastapi(ocr_record_id: str, request: Request) -> dict[str, Any]:
            return get_record(ocr_record_id=ocr_record_id, request=request)

        app.add_api_route(
            "/v1/ocr/ingress",
            ingest_fastapi,
            methods=["POST"],
            tags=["ocr"],
            response_model=ApiEnvelopeModel,
        )
        app.add_api_route(
            "/v1/ocr/records/{ocr_record_id}",
            get_record_fastapi,
            methods=["GET"],
            tags=["ocr"],
            response_model=ApiEnvelopeModel,
        )
        return

    app.add_api_route("/v1/ocr/ingress", ingest, methods=["POST"], tags=["ocr"])
    app.add_api_route("/v1/ocr/records/{ocr_record_id}", get_record, methods=["GET"], tags=["ocr"])
