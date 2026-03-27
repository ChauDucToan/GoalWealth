from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from persistence import GoalWealthPersistenceService, build_optional_persistence_bundle

from .config import AdapterApiConfig
from .constants import REQUEST_ID_CONTEXT_KEY, USER_CONTEXT_KEY
from .schemas.auth import UserClaims
from .services.auth_service import AuthService
from .services.chat_flow_service import ChatFlowService
from .services.goal_service import GoalService
from .services.me_service import MeService
from .services.memory_gateway import MemoryGateway
from .services.ocr_flow_service import OcrFlowService
from .services.ocr_gateway import OcrGateway
from .services.orchestrator_gateway import OrchestratorGateway
from .services.risk_profile_service import RiskProfileService
from .services.smart_agent_gateway import SmartAgentGateway
from .services.summary_service import SummaryService


@dataclass(slots=True)
class ServiceContainer:
    config: AdapterApiConfig
    auth_service: AuthService
    orchestrator_gateway: OrchestratorGateway
    memory_gateway: MemoryGateway
    ocr_gateway: OcrGateway
    smart_agent_gateway: SmartAgentGateway
    chat_flow_service: ChatFlowService
    ocr_flow_service: OcrFlowService
    me_service: MeService
    goal_service: GoalService
    risk_profile_service: RiskProfileService
    summary_service: SummaryService
    persistence_service: GoalWealthPersistenceService | None = None



def build_services(config: AdapterApiConfig | None = None) -> ServiceContainer:
    config = config or AdapterApiConfig.from_env()
    auth_service = AuthService(config)
    orchestrator_gateway = OrchestratorGateway(config)
    memory_gateway = MemoryGateway(config)
    ocr_gateway = OcrGateway(config)
    smart_agent_gateway = SmartAgentGateway(config)
    chat_flow_service = ChatFlowService(
        orchestrator_gateway=orchestrator_gateway,
        memory_gateway=memory_gateway,
        smart_agent_gateway=smart_agent_gateway,
    )
    persistence_bundle = build_optional_persistence_bundle()
    persistence_service = persistence_bundle[3] if persistence_bundle is not None else None
    ocr_flow_service = OcrFlowService(
        ocr_gateway=ocr_gateway,
        persistence_service=persistence_service,
    )
    me_service = MeService(persistence_service=persistence_service)
    goal_service = GoalService(persistence_service=persistence_service)
    risk_profile_service = RiskProfileService(persistence_service=persistence_service)
    summary_service = SummaryService(persistence_service=persistence_service)
    return ServiceContainer(
        config=config,
        auth_service=auth_service,
        orchestrator_gateway=orchestrator_gateway,
        memory_gateway=memory_gateway,
        ocr_gateway=ocr_gateway,
        smart_agent_gateway=smart_agent_gateway,
        chat_flow_service=chat_flow_service,
        ocr_flow_service=ocr_flow_service,
        me_service=me_service,
        goal_service=goal_service,
        risk_profile_service=risk_profile_service,
        summary_service=summary_service,
        persistence_service=persistence_service,
    )



def get_services(request: Any) -> ServiceContainer:
    state = getattr(getattr(request, "app", None), "state", None)
    services = getattr(state, "services", None)
    if services is not None:
        return services

    config = getattr(state, "config", None)
    services = build_services(config)
    if state is not None:
        setattr(state, "services", services)
    return services



def get_current_user(request: Any) -> UserClaims | None:
    return getattr(getattr(request, "state", None), USER_CONTEXT_KEY, None)



def get_request_id(request: Any) -> str | None:
    return getattr(getattr(request, "state", None), REQUEST_ID_CONTEXT_KEY, None)
