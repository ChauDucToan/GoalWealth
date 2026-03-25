from __future__ import annotations

from typing import Any

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
        """Placeholder JWT/OIDC verification.

        Current dev behavior:
        - accepts `dev-token:<user_id>` when allow_dev_tokens is enabled
        - otherwise returns a generic placeholder identity for non-empty tokens

        Real implementation should validate issuer, audience, signature, and expiry.
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

        return UserClaims(
            user_id="placeholder-user",
            subject="placeholder-subject",
            issuer=self.config.oidc_issuer,
            audience=self.config.oidc_audience,
            scopes=[],
            raw_claims={"token_type": "placeholder"},
        )

    def optional_user_from_header(self, authorization_header: str | None) -> UserClaims | None:
        token = self.extract_bearer_token(authorization_header)
        if token is None:
            return None
        return self.verify_bearer_token(token)
