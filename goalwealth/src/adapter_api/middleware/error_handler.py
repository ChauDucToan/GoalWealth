from __future__ import annotations

from typing import Any

from ..utils.responses import error_response


def install(app: Any) -> None:
    """Install adapter-wide exception handlers.

    Current behavior:
    - catches unexpected exceptions
    - returns a normalized JSON error envelope
    """
    if not hasattr(app, "exception_handler"):
        return

    try:
        from fastapi.responses import JSONResponse
    except ImportError:
        return

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Any, exc: Exception) -> Any:
        return JSONResponse(
            status_code=500,
            content=error_response(
                "INTERNAL_SERVER_ERROR",
                "Unhandled adapter exception",
                request=request,
                details={
                    "type": exc.__class__.__name__,
                    "message": str(exc),
                },
            ),
        )
