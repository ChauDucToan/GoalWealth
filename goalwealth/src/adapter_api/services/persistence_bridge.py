from __future__ import annotations

from typing import Any

from persistence import GoalWealthPersistenceService
from persistence.service_models import IdentityUpsertInput, UserProfileUpsertInput

from ..schemas.auth import UserClaims

_GOOGLE_ISSUERS = {"https://accounts.google.com", "accounts.google.com"}


def _provider_from_claims(user_claims: UserClaims) -> str:
    issuer = str(user_claims.issuer or "").strip()
    if issuer in _GOOGLE_ISSUERS:
        return "google"
    if issuer == "goalwealth-dev-token":
        return "dev"
    return "external"


def _profile_from_claims(user_claims: UserClaims) -> UserProfileUpsertInput | None:
    raw = user_claims.raw_claims or {}
    full_name = raw.get("name") or raw.get("given_name")
    email = raw.get("email")
    if full_name is None and email is None:
        return None
    return UserProfileUpsertInput(
        full_name=str(full_name).strip() if full_name is not None else None,
        email=str(email).strip() if email is not None else None,
    )


def sync_authenticated_user(
    persistence_service: GoalWealthPersistenceService,
    user_claims: UserClaims,
) -> str:
    external_subject = str(user_claims.subject or user_claims.user_id).strip()
    identity = IdentityUpsertInput(
        provider=_provider_from_claims(user_claims),
        provider_subject=external_subject,
        issuer=str(user_claims.issuer or "unknown").strip() or "unknown",
        provider_email=(
            str((user_claims.raw_claims or {}).get("email")).strip()
            if (user_claims.raw_claims or {}).get("email") is not None
            else None
        ),
        email_verified=bool((user_claims.raw_claims or {}).get("email_verified") in {True, "true", "True", "1", 1}),
    )
    resolved = persistence_service.resolve_or_create_user(identity, profile=_profile_from_claims(user_claims))
    internal_user_id = str(resolved.user_id)
    user_claims.raw_claims["goalwealth_internal_user_id"] = internal_user_id
    user_claims.raw_claims["goalwealth_external_subject"] = external_subject
    user_claims.user_id = internal_user_id
    return internal_user_id
