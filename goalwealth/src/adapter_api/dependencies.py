from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .config import AdapterApiConfig
from .constants import REQUEST_ID_CONTEXT_KEY, USER_CONTEXT_KEY
from .schemas.auth import UserClaims
from .services.auth_service import AuthService
from .services.memory_gateway import MemoryGateway
from .services.ocr_gateway import OcrGateway
from .services.orchestrator_gateway import OrchestratorGateway
from .services.smart_agent_gateway import SmartAgentGateway


@dataclass(slots=True)
class ServiceContainer:
    config: AdapterApiConfig
    auth_service: AuthService
    orchestrator_gateway: OrchestratorGateway
    memory_gateway: MemoryGateway
    ocr_gateway: OcrGateway
    smart_agent_gateway: SmartAgentGateway


def build_services(config: AdapterApiConfig | None = None) -> ServiceContainer:
    config = config or AdapterApiConfig.from_env()
    return ServiceContainer(
        config=config,
        auth_service=AuthService(config),
        orchestrator_gateway=OrchestratorGateway(config),
        memory_gateway=MemoryGateway(config),
        ocr_gateway=OcrGateway(config),
        smart_agent_gateway=SmartAgentGateway(config),
    )


def get_current_user(request: Any) -> UserClaims | None:
    return getattr(getattr(request, "state", None), USER_CONTEXT_KEY, None)


def get_request_id(request: Any) -> str | None:
    return getattr(getattr(request, "state", None), REQUEST_ID_CONTEXT_KEY, None)
