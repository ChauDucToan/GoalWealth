from __future__ import annotations

from typing import Any

from ..utils.responses import success_response


def health(request: Any = None) -> dict[str, Any]:
    config = getattr(getattr(request, "app", None), "state", None)
    adapter_config = getattr(config, "config", None)
    if adapter_config is None:
        return success_response(
            {
                "status": "ok",
                "service": "goalwealth-adapter-api",
            },
            request=request,
        )
    return success_response(
        {
            "status": "ok",
            "service": adapter_config.service_name,
            "version": adapter_config.version,
            "environment": adapter_config.environment,
        },
        request=request,
    )


def ready(request: Any = None) -> dict[str, Any]:
    config = getattr(getattr(request, "app", None), "state", None)
    adapter_config = getattr(config, "config", None)
    if adapter_config is None:
        return success_response(
            {
                "status": "ready",
                "service": "goalwealth-adapter-api",
                "checks": {
                    "config_loaded": False,
                },
            },
            request=request,
        )

    return success_response(
        {
            "status": "ready",
            "service": adapter_config.service_name,
            "checks": {
                "config_loaded": True,
                "docs_mode_known": True,
                "oidc_config_present": bool(adapter_config.oidc_issuer and adapter_config.oidc_audience),
                "openclaw_config_present": bool(adapter_config.openclaw_base_url),
            },
            "runtime": adapter_config.public_runtime_summary(),
        },
        request=request,
    )


def register(app: Any) -> None:
    if hasattr(app, "add_api_route"):
        app.add_api_route("/health", health, methods=["GET"], tags=["health"])
        app.add_api_route("/ready", ready, methods=["GET"], tags=["health"])
