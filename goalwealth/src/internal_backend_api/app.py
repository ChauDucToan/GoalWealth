from __future__ import annotations

from typing import Any

from adapter_api.utils.logging import configure_logging
from persistence import build_optional_persistence_bundle

from .config import InternalBackendApiConfig
from .errors import ApiHttpError
from . import routes

try:
    from fastapi import Body, FastAPI, Request
    from fastapi.responses import JSONResponse
except ImportError:  # pragma: no cover - optional dependency path
    Body = None  # type: ignore[assignment]
    FastAPI = None  # type: ignore[assignment]
    Request = Any  # type: ignore[assignment]
    JSONResponse = Any  # type: ignore[assignment]


async def root_handler(request: Request) -> dict[str, Any]:
    return routes.root(request=request)


async def health_handler(request: Request) -> dict[str, Any]:
    return routes.health(request=request)


async def ready_handler(request: Request) -> dict[str, Any]:
    return routes.ready(request=request)


async def memory_view_handler(
    userId: str,
    request: Request,
    includeSections: str | None = None,
    ocrSummaryLimit: int | None = None,
) -> dict[str, Any]:
    return routes.get_memory_user_view(
        userId,
        includeSections=includeSections,
        ocrSummaryLimit=ocrSummaryLimit,
        request=request,
    )


async def ocr_view_handler(
    ocrRecordId: str,
    request: Request,
    userId: str | None = None,
) -> dict[str, Any]:
    return routes.get_ocr_openclaw_view(ocrRecordId, userId=userId, request=request)


if Body is not None:
    async def smart_agent_query_handler(request: Request, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        return routes.post_smart_agent_query(request=request, payload=payload)
else:
    async def smart_agent_query_handler(request: Request, payload: dict[str, Any]) -> dict[str, Any]:
        return routes.post_smart_agent_query(request=request, payload=payload)



def create_app() -> Any:
    if FastAPI is None:
        return None

    config = InternalBackendApiConfig.from_env()
    configure_logging(config.log_level)

    docs_url = "/docs" if config.enable_docs else None
    redoc_url = "/redoc" if config.enable_docs else None
    openapi_url = "/openapi.json" if config.enable_docs else None

    application = FastAPI(
        title="GoalWealth Internal Backend API",
        version=config.version,
        description="Practical internal stub service for OpenClaw orchestration and adapter end-to-end testing.",
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )
    application.state.config = config
    persistence_bundle = build_optional_persistence_bundle()
    application.state.persistence_service = persistence_bundle[3] if persistence_bundle is not None else None

    @application.exception_handler(ApiHttpError)
    async def handle_api_http_error(_: Request, exc: ApiHttpError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content=exc.to_payload())

    application.add_api_route("/", root_handler, methods=["GET"], tags=["meta"])
    application.add_api_route("/health", health_handler, methods=["GET"], tags=["health"])
    application.add_api_route("/ready", ready_handler, methods=["GET"], tags=["health"])
    application.add_api_route(
        "/v1/memory/users/{userId}/view",
        memory_view_handler,
        methods=["GET"],
        tags=["memory-service"],
    )
    application.add_api_route(
        "/v1/ocr/records/{ocrRecordId}/openclaw-view",
        ocr_view_handler,
        methods=["GET"],
        tags=["ocr-service"],
    )
    application.add_api_route(
        "/v1/smart-agent/query",
        smart_agent_query_handler,
        methods=["POST"],
        tags=["smart-agent"],
    )

    return application


app = create_app()
