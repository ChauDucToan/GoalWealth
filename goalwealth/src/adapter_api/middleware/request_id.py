from __future__ import annotations

from typing import Any

from ..constants import REQUEST_ID_CONTEXT_KEY, REQUEST_ID_HEADER
from ..utils.ids import generate_request_id


def install(app: Any) -> None:
    """Install request-id middleware.

    Current behavior:
    - reads X-Request-Id if provided
    - generates one otherwise
    - stores it on request.state
    - echoes it back on the response headers
    """
    if not hasattr(app, "middleware"):
        return

    @app.middleware("http")
    async def request_id_middleware(request: Any, call_next: Any) -> Any:
        request_id = request.headers.get(REQUEST_ID_HEADER) or generate_request_id()
        setattr(request.state, REQUEST_ID_CONTEXT_KEY, request_id)
        response = await call_next(request)
        try:
            response.headers[REQUEST_ID_HEADER] = request_id
        except Exception:
            pass
        return response
