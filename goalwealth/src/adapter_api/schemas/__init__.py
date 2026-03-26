"""Adapter API request/response schema definitions."""

from .user import StoredUserBasicProfile, StoredUserLocation, StoredUserRecord

__all__ = [
    "StoredUserBasicProfile",
    "StoredUserLocation",
    "StoredUserRecord",
]
