from __future__ import annotations

from typing import Any

from .config import AdapterApiConfig
from .middleware import auth, error_handler, request_id
from .routers import chat, health, internal, ocr
from .utils.logging import configure_logging


def create_app() -> Any:
    """Create the adapter application.

    When FastAPI is available, returns a configured FastAPI app.
    Otherwise returns None so the module still imports cleanly in minimal environments.
    """
    try:
        from fastapi import FastAPI
    except ImportError:
        return None

    config = AdapterApiConfig.from_env()
    configure_logging(config.log_level)

    docs_url = "/docs" if config.enable_docs else None
    redoc_url = "/redoc" if config.enable_docs else None
    openapi_url = "/openapi.json" if config.enable_docs else None

    application = FastAPI(
        title="GoalWealth Adapter API",
        version=config.version,
        description="Thin public-facing adapter in front of OpenClaw and backend domain services.",
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )
    application.state.config = config

    @application.get("/", tags=["meta"])
    def root(request: Any = None) -> dict[str, Any]:
        from .utils.responses import success_response

        return success_response(
            {
                "service": config.service_name,
                "version": config.version,
                "environment": config.environment,
                "docs_enabled": config.enable_docs,
            },
            request=request,
            meta={
                "route": "root",
            },
        )

    request_id.install(application)
    error_handler.install(application)
    auth.install(application)

    for module in (health, chat, ocr, internal):
        module.register(application)

    return application


app = create_app()
