from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class StoredUserLocation:
    city: str | None = None
    country: str | None = None
    timezone: str | None = None

    @classmethod
    def from_payload(cls, payload: dict[str, Any] | None) -> StoredUserLocation | None:
        if not isinstance(payload, dict):
            return None

        location = cls(
            city=_as_optional_str(payload.get("city")),
            country=_as_optional_str(payload.get("country")),
            timezone=_as_optional_str(payload.get("timezone")),
        )

        if not any((location.city, location.country, location.timezone)):
            return None

        return location

    def to_payload(self) -> dict[str, str]:
        payload: dict[str, str] = {}

        if self.city:
            payload["city"] = self.city
        if self.country:
            payload["country"] = self.country
        if self.timezone:
            payload["timezone"] = self.timezone

        return payload


@dataclass(slots=True)
class StoredUserBasicProfile:
    user_id: str
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: StoredUserLocation | None = None
    created_at: str | None = None
    updated_at: str | None = None
    raw_profile: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_memory_profile(
        cls,
        user_id: str,
        payload: dict[str, Any] | None,
    ) -> StoredUserBasicProfile:
        normalized_payload = payload if isinstance(payload, dict) else {}

        return cls(
            user_id=user_id,
            full_name=_as_optional_str(normalized_payload.get("full_name")),
            email=_as_optional_str(normalized_payload.get("email")),
            phone=_as_optional_str(normalized_payload.get("phone")),
            location=StoredUserLocation.from_payload(
                normalized_payload.get("location")
                if isinstance(normalized_payload.get("location"), dict)
                else None
            ),
            created_at=_as_optional_str(normalized_payload.get("created_at")),
            updated_at=_as_optional_str(normalized_payload.get("updated_at")),
            raw_profile=dict(normalized_payload),
        )

    def to_memory_profile_payload(self) -> dict[str, Any]:
        payload: dict[str, Any] = {}

        if self.full_name:
            payload["full_name"] = self.full_name
        if self.email:
            payload["email"] = self.email
        if self.phone:
            payload["phone"] = self.phone
        if self.location:
            location_payload = self.location.to_payload()
            if location_payload:
                payload["location"] = location_payload
        if self.created_at:
            payload["created_at"] = self.created_at
        if self.updated_at:
            payload["updated_at"] = self.updated_at

        return payload


@dataclass(slots=True)
class StoredUserRecord:
    schema_version: str
    user_id: str
    profile: StoredUserBasicProfile
    last_synced_at: str | None = None
    source: str = "memory-service-view"
    raw_view: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_memory_view(cls, payload: dict[str, Any]) -> StoredUserRecord:
        if not isinstance(payload, dict):
            raise TypeError("memory view payload must be a dictionary")

        user_id = _as_required_str(payload.get("user_id"), field_name="user_id")
        schema_version = _as_required_str(
            payload.get("schema_version"),
            field_name="schema_version",
        )
        profile_payload = payload.get("user_profile")

        if profile_payload is not None and not isinstance(profile_payload, dict):
            raise TypeError("user_profile must be an object when present")

        return cls(
            schema_version=schema_version,
            user_id=user_id,
            profile=StoredUserBasicProfile.from_memory_profile(user_id, profile_payload),
            last_synced_at=_as_optional_str(payload.get("last_updated")),
            raw_view=dict(payload),
        )

    def to_storage_payload(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "user_id": self.user_id,
            "user_profile": self.profile.to_memory_profile_payload(),
            "last_updated": self.last_synced_at,
        }


def _as_optional_str(value: Any) -> str | None:
    if value is None:
        return None

    normalized = str(value).strip()
    return normalized or None


def _as_required_str(value: Any, *, field_name: str) -> str:
    normalized = _as_optional_str(value)

    if normalized is None:
        raise ValueError(f"{field_name} is required")

    return normalized
