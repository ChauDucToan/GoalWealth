from __future__ import annotations

from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

from .config import PersistenceConfig
from .services import GoalWealthPersistenceService
from .session import build_engine, build_session_factory


def build_persistence_bundle() -> tuple[PersistenceConfig, Engine, sessionmaker, GoalWealthPersistenceService]:
    config = PersistenceConfig.from_env()
    engine = build_engine(config)
    session_factory = build_session_factory(engine)
    service = GoalWealthPersistenceService(session_factory)
    return config, engine, session_factory, service


def build_optional_persistence_bundle() -> tuple[PersistenceConfig, Engine, sessionmaker, GoalWealthPersistenceService] | None:
    config = PersistenceConfig.from_env()
    if not config.database_url:
        return None
    engine = build_engine(config)
    session_factory = build_session_factory(engine)
    service = GoalWealthPersistenceService(session_factory)
    return config, engine, session_factory, service
