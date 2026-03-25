from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Mapping
from urllib import error, parse, request

DEFAULT_ENV_PREFIX = "GOALWEALTH_INTERNAL_API_"


@dataclass(slots=True)
class ApiClientConfig:
    base_url: str
    bearer_token: str | None = None
    timeout_seconds: float = 10.0
    user_agent: str = "GoalWealthOrchestratorClient/1.0"

    @classmethod
    def from_env(cls, *, prefix: str = DEFAULT_ENV_PREFIX) -> "ApiClientConfig":
        base_url = (os.environ.get(f"{prefix}BASE_URL") or "").strip()
        if not base_url:
            raise ValueError(
                f"Missing required environment variable: {prefix}BASE_URL"
            )

        bearer_token = (os.environ.get(f"{prefix}BEARER_TOKEN") or os.environ.get(f"{prefix}TOKEN") or "").strip() or None
        timeout_raw = (os.environ.get(f"{prefix}TIMEOUT_SECONDS") or "10").strip()
        user_agent = (os.environ.get(f"{prefix}USER_AGENT") or "GoalWealthOrchestratorClient/1.0").strip()

        try:
            timeout_seconds = float(timeout_raw)
        except ValueError as exc:
            raise ValueError(
                f"Invalid float for {prefix}TIMEOUT_SECONDS: {timeout_raw!r}"
            ) from exc

        return cls(
            base_url=base_url,
            bearer_token=bearer_token,
            timeout_seconds=timeout_seconds,
            user_agent=user_agent,
        )


class ApiClientError(RuntimeError):
    """Base error for internal backend API client failures."""


class ApiRequestError(ApiClientError):
    def __init__(self, status_code: int, message: str, payload: Any | None = None):
        super().__init__(f"API request failed with status={status_code}: {message}")
        self.status_code = status_code
        self.message = message
        self.payload = payload


class ApiNotFoundError(ApiRequestError):
    """Raised for 404 responses."""


class ApiConflictError(ApiRequestError):
    """Raised for 409 responses."""


class BaseApiClient:
    def __init__(self, config: ApiClientConfig):
        self.config = config

    @classmethod
    def from_env(cls, *, prefix: str = DEFAULT_ENV_PREFIX) -> "BaseApiClient":
        return cls(ApiClientConfig.from_env(prefix=prefix))

    def _get_json(self, path: str, query: Mapping[str, Any] | None = None) -> dict[str, Any]:
        return self._request_json(method="GET", path=path, query=query)

    def _post_json(
        self,
        path: str,
        payload: Mapping[str, Any],
        query: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        return self._request_json(method="POST", path=path, query=query, payload=payload)

    def _request_json(
        self,
        *,
        method: str,
        path: str,
        query: Mapping[str, Any] | None = None,
        payload: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        url = self._build_url(path=path, query=query)
        body = None
        headers = {
            "Accept": "application/json",
            "User-Agent": self.config.user_agent,
        }

        if self.config.bearer_token:
            headers["Authorization"] = f"Bearer {self.config.bearer_token}"

        if payload is not None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = request.Request(url=url, data=body, headers=headers, method=method)

        try:
            with request.urlopen(req, timeout=self.config.timeout_seconds) as response:
                raw = response.read().decode("utf-8")
                return self._decode_json(raw)
        except error.HTTPError as exc:
            response_body = exc.read().decode("utf-8", errors="replace")
            parsed_payload = self._decode_json(response_body, fallback={"message": response_body})
            message = self._extract_error_message(parsed_payload, default=exc.reason)
            if exc.code == 404:
                raise ApiNotFoundError(exc.code, message, payload=parsed_payload) from exc
            if exc.code == 409:
                raise ApiConflictError(exc.code, message, payload=parsed_payload) from exc
            raise ApiRequestError(exc.code, message, payload=parsed_payload) from exc
        except error.URLError as exc:
            raise ApiClientError(f"Failed to reach internal backend API: {exc.reason}") from exc

    def _build_url(self, *, path: str, query: Mapping[str, Any] | None = None) -> str:
        base_url = self.config.base_url.rstrip("/")
        normalized_path = path if path.startswith("/") else f"/{path}"
        if not query:
            return f"{base_url}{normalized_path}"

        encoded_query = self._encode_query(query)
        return f"{base_url}{normalized_path}?{encoded_query}" if encoded_query else f"{base_url}{normalized_path}"

    @staticmethod
    def _encode_query(query: Mapping[str, Any]) -> str:
        normalized: dict[str, str] = {}
        for key, value in query.items():
            if value is None:
                continue
            if isinstance(value, (list, tuple, set)):
                parts = [str(item) for item in value if item is not None]
                if not parts:
                    continue
                normalized[key] = ",".join(parts)
            else:
                normalized[key] = str(value)
        return parse.urlencode(normalized)

    @staticmethod
    def _decode_json(raw: str, fallback: dict[str, Any] | None = None) -> dict[str, Any]:
        if not raw:
            return fallback or {}
        try:
            decoded = json.loads(raw)
            return decoded if isinstance(decoded, dict) else {"data": decoded}
        except json.JSONDecodeError:
            return fallback or {"message": raw}

    @staticmethod
    def _extract_error_message(payload: Mapping[str, Any], *, default: str) -> str:
        for key in ("message", "error", "detail", "error_code"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value
        return default
