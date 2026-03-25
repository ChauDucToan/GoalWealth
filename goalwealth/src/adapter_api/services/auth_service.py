from __future__ import annotations

import json
import time
from typing import Any
from urllib import error, parse, request

from ..config import AdapterApiConfig
from ..schemas.auth import UserClaims


class AuthService:
    def __init__(self, config: AdapterApiConfig):
        self.config = config

    def extract_bearer_token(self, authorization_header: str | None) -> str | None:
        if not authorization_header:
            return None

        value = authorization_header.strip()
        if not value:
            return None

        scheme, _, token = value.partition(" ")
        if scheme.lower() != "bearer" or not token.strip():
            raise ValueError("Authorization header must use Bearer <token>")
        return token.strip()

    def verify_bearer_token(self, token: str) -> UserClaims:
        """Verify a bearer token for GoalWealth adapter use.

        Current behavior:
        - accepts `dev-token:<user_id>` when allow_dev_tokens is enabled
        - otherwise verifies Google OIDC ID tokens via the tokeninfo endpoint

        This is a practical bridge step for frontend/login integration.
        Later we can replace tokeninfo verification with local JWT/JWKS verification.
        """
        cleaned = token.strip()
        if not cleaned:
            raise ValueError("Bearer token is required")

        if self.config.allow_dev_tokens and cleaned.startswith("dev-token:"):
            user_id = cleaned.split(":", 1)[1].strip()
            if not user_id:
                raise ValueError("dev-token must include a user id, e.g. dev-token:user-123")
            return UserClaims(
                user_id=user_id,
                subject=f"dev:{user_id}",
                issuer="goalwealth-dev-token",
                audience=self.config.oidc_audience,
                scopes=["dev"],
                raw_claims={"token_type": "dev-token"},
            )

        if not self._has_google_oidc_config():
            raise ValueError(
                "Google OIDC verification is not configured. Set GOALWEALTH_OIDC_ISSUER and GOALWEALTH_OIDC_AUDIENCE, or use dev-token:<user_id> in dev mode."
            )

        return self._verify_google_oidc_token(cleaned)

    def optional_user_from_header(self, authorization_header: str | None) -> UserClaims | None:
        token = self.extract_bearer_token(authorization_header)
        if token is None:
            return None
        return self.verify_bearer_token(token)

    def _has_google_oidc_config(self) -> bool:
        return bool(self.config.oidc_issuer and self.config.oidc_audience)

    def _verify_google_oidc_token(self, token: str) -> UserClaims:
        claims = self._fetch_google_tokeninfo(token)
        issuer = str(claims.get("iss") or "").strip()
        audience = str(claims.get("aud") or "").strip()
        subject = str(claims.get("sub") or "").strip()
        expiry_raw = claims.get("exp")

        if not issuer:
            raise ValueError("Google tokeninfo response did not include issuer")
        if issuer not in self._allowed_google_issuers():
            raise ValueError(f"Unexpected Google token issuer: {issuer!r}")

        expected_audience = str(self.config.oidc_audience or "").strip()
        if not audience or audience != expected_audience:
            raise ValueError(
                f"Token audience mismatch. Expected {expected_audience!r}, got {audience!r}"
            )

        if not subject:
            raise ValueError("Google tokeninfo response did not include sub")

        expiry = self._coerce_expiry(expiry_raw)
        now = int(time.time())
        if expiry is not None and expiry <= now:
            raise ValueError("Google token is expired")

        scopes = self._extract_scopes(claims)
        return UserClaims(
            user_id=subject,
            subject=subject,
            issuer=issuer,
            audience=audience,
            scopes=scopes,
            raw_claims=claims,
        )

    def _fetch_google_tokeninfo(self, token: str) -> dict[str, Any]:
        url = f"{self.config.oidc_tokeninfo_url}?{parse.urlencode({'id_token': token})}"
        req = request.Request(
            url=url,
            headers={
                "Accept": "application/json",
                "User-Agent": "GoalWealthAdapterAuth/0.1",
            },
            method="GET",
        )

        try:
            with request.urlopen(req, timeout=self.config.oidc_timeout_seconds) as response:
                payload = response.read().decode("utf-8")
        except error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            message = self._extract_google_error_message(body) or exc.reason
            raise ValueError(f"Google token verification failed: {message}") from exc
        except error.URLError as exc:
            raise ValueError(f"Google token verification unreachable: {exc.reason}") from exc

        try:
            data = json.loads(payload)
        except json.JSONDecodeError as exc:
            raise ValueError("Google token verification returned invalid JSON") from exc

        if not isinstance(data, dict):
            raise ValueError("Google token verification returned an unexpected payload shape")
        return data

    def _allowed_google_issuers(self) -> set[str]:
        configured = str(self.config.oidc_issuer or "").strip()
        return {
            issuer
            for issuer in {
                configured,
                "https://accounts.google.com",
                "accounts.google.com",
            }
            if issuer
        }

    @staticmethod
    def _coerce_expiry(value: Any) -> int | None:
        if value in (None, ""):
            return None
        try:
            return int(str(value))
        except (TypeError, ValueError) as exc:
            raise ValueError(f"Invalid token expiry value: {value!r}") from exc

    @staticmethod
    def _extract_scopes(claims: dict[str, Any]) -> list[str]:
        scope_value = claims.get("scope")
        if isinstance(scope_value, str) and scope_value.strip():
            return [part for part in scope_value.split() if part]
        return []

    @staticmethod
    def _extract_google_error_message(body: str) -> str | None:
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            return body.strip() or None

        if isinstance(payload, dict):
            for key in ("error_description", "error", "message"):
                value = payload.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()
        return None
