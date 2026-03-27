from __future__ import annotations

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import sessionmaker

from .config import PersistenceConfig


def _normalize_database_url(url: str) -> str:
    cleaned = url.strip()
    if cleaned.startswith("postgresql+psycopg://"):
        return cleaned
    if cleaned.startswith("postgresql://"):
        return "postgresql+psycopg://" + cleaned[len("postgresql://"):]
    if cleaned.startswith("postgres://"):
        return "postgresql+psycopg://" + cleaned[len("postgres://"):]
    return cleaned


def build_engine(config: PersistenceConfig) -> Engine:
    return create_engine(
        _normalize_database_url(config.require_database_url()),
        echo=config.echo_sql,
        pool_pre_ping=config.pool_pre_ping,
    )


def build_session_factory(engine: Engine) -> sessionmaker:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
