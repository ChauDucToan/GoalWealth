from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from persistence import GoalWealthPersistenceService

from ..schemas.auth import UserClaims


class RecommendationService:
    def __init__(self, *, persistence_service: GoalWealthPersistenceService | None = None):
        self.persistence_service = persistence_service

    @staticmethod
    def _now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

    def _build_item(
        self,
        *,
        rec_id: str,
        rec_type: str,
        category: str,
        priority: str,
        title: str,
        message: str,
        preview: str,
        action: dict[str, Any],
        score: float,
        why: list[str],
        context: dict[str, Any] | None = None,
        source_refs: dict[str, Any] | None = None,
        source_type: str = "user_state",
        generated_by: str = "rules_v1",
        status: str = "open",
    ) -> dict[str, Any]:
        return {
            "id": rec_id,
            "type": rec_type,
            "category": category,
            "priority": priority,
            "source_type": source_type,
            "generated_by": generated_by,
            "title": title,
            "message": message,
            "preview": preview,
            "why": why,
            "action": action,
            "context": context or {},
            "source_refs": source_refs or {},
            "status": status,
            "score": score,
            "updated_at": self._now_iso(),
        }

    def _build_detail(
        self,
        item: dict[str, Any],
        *,
        full_reasoning: str,
        impact: list[str],
        confidence: str,
        related_entities: dict[str, Any] | None = None,
        supporting_data: dict[str, Any] | None = None,
        actions: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        detail = dict(item)
        detail.update(
            {
                "full_reasoning": full_reasoning,
                "impact": impact,
                "confidence": confidence,
                "related_entities": related_entities or {},
                "supporting_data": supporting_data or {},
                "actions": actions or ([item["action"]] if item.get("action") else []),
                "freshness": {
                    "generated_at": self._now_iso(),
                    "market_included": False,
                    "sources_used": ["profile", "risk_profile", "goals", "ocr_records", "summary_snapshot"],
                },
            }
        )
        return detail

    def _sorted_items(self, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        priority_rank = {"high": 0, "medium": 1, "low": 2}
        return sorted(items, key=lambda item: (priority_rank.get(item["priority"], 99), -float(item.get("score", 0))))

    def _build_fallback_payload(self) -> tuple[dict[str, Any], list[str]]:
        warnings = [
            "Persistence is not configured; /v1/recommendations is returning minimal onboarding recommendations only."
        ]
        items = [
            self._build_item(
                rec_id="complete-profile-basics",
                rec_type="next_action",
                category="onboarding",
                priority="high",
                title="Complete your profile basics",
                message="Add profile and risk information to unlock more personalized planning recommendations.",
                preview="Profile persistence is not configured yet.",
                action={"type": "navigate", "target": "/me"},
                score=0.95,
                why=["persistence is unavailable", "personalization data is incomplete"],
                context={"missing_sections": ["profile", "risk_profile", "goals", "documents"]},
            )
        ]
        return {
            "items": items,
            "summary": {
                "total": len(items),
                "high_priority": 1,
                "medium_priority": 0,
                "low_priority": 0,
            },
            "meta": {
                "market_included": False,
                "generated_at": self._now_iso(),
                "freshness": "realtime",
                "sources_used": ["auth_fallback"],
            },
        }, warnings

    def _known_recommendation_ids(self) -> set[str]:
        return {
            "complete-profile-basics",
            "goal-emergency-fund-starter",
            "goal-debt-payoff-starter",
            "goal-retirement-starter",
            "goal-investment-starter",
        }

    def _goal_recommendation_ids(self) -> set[str]:
        return {
            "goal-emergency-fund-starter",
            "goal-debt-payoff-starter",
            "goal-retirement-starter",
            "goal-investment-starter",
        }

    def _goal_prefill_for_recommendation(self, recommendation_id: str) -> dict[str, Any]:
        mapping: dict[str, dict[str, Any]] = {
            "goal-emergency-fund-starter": {
                "title": "Emergency Fund",
                "goal_type": "emergency_fund_goal",
                "status": "active",
                "priority": 8,
                "target_amount": None,
                "current_progress": 0,
                "target_date": None,
                "description": "Build an emergency fund to cover unexpected expenses.",
            },
            "goal-debt-payoff-starter": {
                "title": "Debt Payoff Plan",
                "goal_type": "debt_payoff_goal",
                "status": "active",
                "priority": 9,
                "target_amount": None,
                "current_progress": 0,
                "target_date": None,
                "description": "Reduce outstanding debt with a structured payoff goal.",
            },
            "goal-retirement-starter": {
                "title": "Retirement Starter Goal",
                "goal_type": "retirement_goal",
                "status": "active",
                "priority": 7,
                "target_amount": None,
                "current_progress": 0,
                "target_date": None,
                "description": "Start a long-term retirement goal aligned with your planning horizon.",
            },
            "goal-investment-starter": {
                "title": "Investment Starter Goal",
                "goal_type": "investment_goal",
                "status": "active",
                "priority": 7,
                "target_amount": None,
                "current_progress": 0,
                "target_date": None,
                "description": "Build an investment goal aligned with your medium- to long-term growth objectives.",
            },
        }
        prefill = mapping.get(recommendation_id)
        if prefill is None:
            raise LookupError("Recommendation complete payload is not available")
        return prefill

    def _build_goal_candidates(self, current_user: UserClaims, snapshot: Any, risk_profile: Any, recent_ocr: list[Any]) -> list[dict[str, Any]]:
        if snapshot.total_goals > 0:
            return []

        debt_signal = any(getattr(record, "document_type", None) == "bank_statement" for record in recent_ocr)
        candidates: list[dict[str, Any]] = []

        if debt_signal:
            candidates.append(
                self._build_item(
                    rec_id="goal-debt-payoff-starter",
                    rec_type="next_action",
                    category="goals",
                    priority="high",
                    title="Start with a debt payoff goal",
                    message="Your current context suggests debt reduction may be the best first goal to focus on.",
                    preview="Suggested first goal: structured debt payoff.",
                    action={"type": "complete", "target": "/v1/recommendations/goal-debt-payoff-starter/complete"},
                    score=0.98,
                    why=["no goals exist yet", "bank_statement OCR signal suggests debt-related planning may matter"],
                    context={"goal_flow": True, "debt_signal": True},
                )
            )

        candidates.append(
            self._build_item(
                rec_id="goal-emergency-fund-starter",
                rec_type="next_action",
                category="goals",
                priority="high",
                title="Start with an emergency fund goal",
                message="Based on your current setup, an emergency fund is the safest and most useful first goal.",
                preview="Suggested first goal: emergency fund starter.",
                action={"type": "complete", "target": "/v1/recommendations/goal-emergency-fund-starter/complete"},
                score=0.95 if not debt_signal else 0.88,
                why=["no goals exist yet", "emergency fund is the safest default starting point"],
                context={"goal_flow": True, "total_goals": snapshot.total_goals},
            )
        )

        if getattr(risk_profile, "investment_horizon", None) == "long_term":
            candidates.append(
                self._build_item(
                    rec_id="goal-retirement-starter",
                    rec_type="next_action",
                    category="goals",
                    priority="medium",
                    title="Start with a retirement goal",
                    message="Your planning horizon looks long-term, so a retirement starter goal could fit well.",
                    preview="Suggested first goal: retirement starter.",
                    action={"type": "complete", "target": "/v1/recommendations/goal-retirement-starter/complete"},
                    score=0.83,
                    why=["no goals exist yet", "investment_horizon is long_term"],
                    context={"goal_flow": True, "investment_horizon": getattr(risk_profile, "investment_horizon", None)},
                )
            )

        if (
            getattr(risk_profile, "risk_tolerance", None) in {"balanced", "growth", "aggressive"}
            and getattr(risk_profile, "investment_horizon", None) in {"medium_term", "long_term"}
        ):
            candidates.append(
                self._build_item(
                    rec_id="goal-investment-starter",
                    rec_type="next_action",
                    category="goals",
                    priority="medium",
                    title="Start with an investment goal",
                    message="Your current risk and horizon profile suggest you may be ready for a first investment goal.",
                    preview="Suggested first goal: investment starter.",
                    action={"type": "complete", "target": "/v1/recommendations/goal-investment-starter/complete"},
                    score=0.8,
                    why=[
                        "no goals exist yet",
                        f"risk_tolerance is {getattr(risk_profile, 'risk_tolerance', None)}",
                        f"investment_horizon is {getattr(risk_profile, 'investment_horizon', None)}",
                    ],
                    context={
                        "goal_flow": True,
                        "risk_tolerance": getattr(risk_profile, "risk_tolerance", None),
                        "investment_horizon": getattr(risk_profile, "investment_horizon", None),
                    },
                )
            )

        return candidates

    def _build_goal_state_only_item(self, recommendation_id: str, *, status: str) -> dict[str, Any]:
        prefill = self._goal_prefill_for_recommendation(recommendation_id)
        title_map = {
            "goal-emergency-fund-starter": "Start with an emergency fund goal",
            "goal-debt-payoff-starter": "Start with a debt payoff goal",
            "goal-retirement-starter": "Start with a retirement goal",
            "goal-investment-starter": "Start with an investment goal",
        }
        message_map = {
            "goal-emergency-fund-starter": "This recommendation was previously accepted or dismissed in the goals flow.",
            "goal-debt-payoff-starter": "This recommendation was previously accepted or dismissed in the goals flow.",
            "goal-retirement-starter": "This recommendation was previously accepted or dismissed in the goals flow.",
            "goal-investment-starter": "This recommendation was previously accepted or dismissed in the goals flow.",
        }
        return self._build_item(
            rec_id=recommendation_id,
            rec_type="next_action",
            category="goals",
            priority="medium",
            title=title_map[recommendation_id],
            message=message_map[recommendation_id],
            preview=f"Stored recommendation state: {status}.",
            action={"type": "navigate", "target": "/goals/create"} if status == "completed" else {"type": "navigate", "target": "/goals"},
            score=0.5,
            why=[f"recommendation state is {status}"],
            context={"goal_flow": True, "goal_prefill": prefill},
            status=status,
        )

    def _build_general_candidates(self, current_user: UserClaims, snapshot: Any, risk_profile: Any, recent_ocr: list[Any]) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []

        missing_risk_fields: list[str] = []
        if getattr(risk_profile, "risk_tolerance", None) is None:
            missing_risk_fields.append("risk_tolerance")
        if getattr(risk_profile, "investment_horizon", None) is None:
            missing_risk_fields.append("investment_horizon")
        if getattr(risk_profile, "knowledge_level", None) is None:
            missing_risk_fields.append("knowledge_level")

        if missing_risk_fields:
            items.append(
                self._build_item(
                    rec_id="complete-profile-basics",
                    rec_type="next_action",
                    category="onboarding",
                    priority="high",
                    title="Complete your profile basics",
                    message="Add profile and risk information to unlock more personalized planning recommendations.",
                    preview=f"Missing: {', '.join(missing_risk_fields)}",
                    action={"type": "navigate", "target": "/risk-profile"},
                    score=0.96,
                    why=[f"{field} is missing" for field in missing_risk_fields],
                    context={"missing_fields": missing_risk_fields},
                )
            )

        return items

    def _build_recommendation_state(
        self,
        current_user: UserClaims | None,
        *,
        include_dismissed: bool = False,
        scope: str | None = None,
        limit: int | None = None,
        status_filter: str = "open",
    ) -> tuple[list[dict[str, Any]], dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")

        if self.persistence_service is None:
            fallback_payload, warnings = self._build_fallback_payload()
            items = fallback_payload["items"]
            if limit is not None:
                items = items[: max(1, limit)]
            meta = dict(fallback_payload["meta"])
            if scope is not None:
                meta["scope"] = scope
            return items, meta, warnings

        warnings: list[str] = []
        snapshot = self.persistence_service.build_user_bootstrap_snapshot(current_user.user_id)
        risk_profile = self.persistence_service.get_risk_profile(current_user.user_id)
        recent_ocr = self.persistence_service.list_recent_ocr_for_user(current_user.user_id, limit=10)

        if scope == "goals":
            items = self._build_goal_candidates(current_user, snapshot, risk_profile, recent_ocr)
        else:
            items = self._build_general_candidates(current_user, snapshot, risk_profile, recent_ocr)

        dismissed_ids = self.persistence_service.list_dismissed_recommendation_ids_for_user(current_user.user_id)
        completed_ids = self.persistence_service.list_completed_recommendation_ids_for_user(current_user.user_id)
        enriched_items = []
        for item in items:
            if item["id"] in completed_ids:
                status = "completed"
            elif item["id"] in dismissed_ids:
                status = "dismissed"
            else:
                status = item.get("status", "open")
            enriched_items.append({**item, "status": status})

        if scope == "goals" and status_filter in {"dismissed", "completed", "all"}:
            present_ids = {item["id"] for item in enriched_items}
            for recommendation_id in self._goal_recommendation_ids():
                if recommendation_id in present_ids:
                    continue
                if recommendation_id in completed_ids:
                    enriched_items.append(self._build_goal_state_only_item(recommendation_id, status="completed"))
                elif recommendation_id in dismissed_ids:
                    enriched_items.append(self._build_goal_state_only_item(recommendation_id, status="dismissed"))

        if status_filter == "open":
            response_items = [item for item in enriched_items if item["status"] == "open"]
        elif status_filter == "dismissed":
            response_items = [item for item in enriched_items if item["status"] == "dismissed"]
        elif status_filter == "completed":
            response_items = [item for item in enriched_items if item["status"] == "completed"]
        else:
            response_items = enriched_items if include_dismissed or status_filter == "all" else [
                item for item in enriched_items if item["status"] == "open"
            ]

        sorted_items = self._sorted_items(response_items)
        if limit is not None:
            sorted_items = sorted_items[: max(1, limit)]

        meta = {
            "market_included": False,
            "generated_at": self._now_iso(),
            "freshness": "realtime",
            "sources_used": ["profile", "risk_profile", "goals", "ocr_records", "summary_snapshot", "recommendation_state"],
            "dismissed_count": len(dismissed_ids),
            "completed_count": len(completed_ids),
        }
        if scope is not None:
            meta["scope"] = scope

        return sorted_items, meta, warnings

    def list_recommendations(
        self,
        current_user: UserClaims | None,
        *,
        scope: str | None = None,
        limit: int | None = None,
        status_filter: str = "open",
    ) -> tuple[dict[str, Any], list[str]]:
        items, meta, warnings = self._build_recommendation_state(current_user, scope=scope, limit=limit, status_filter=status_filter)
        return {
            "items": items,
            "summary": {
                "total": len(items),
                "high_priority": sum(1 for item in items if item["priority"] == "high"),
                "medium_priority": sum(1 for item in items if item["priority"] == "medium"),
                "low_priority": sum(1 for item in items if item["priority"] == "low"),
            },
            "meta": meta,
        }, warnings

    def dismiss_recommendation(self, current_user: UserClaims | None, recommendation_id: str) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        if self.persistence_service is None:
            raise ValueError("Persistence is not configured")

        all_items, _meta, warnings = self._build_recommendation_state(current_user, include_dismissed=True)
        visible_ids = {item["id"] for item in all_items}
        if recommendation_id not in self._known_recommendation_ids() and recommendation_id not in visible_ids:
            raise LookupError("Recommendation not found")

        current_state = self.persistence_service.get_recommendation_state_for_user(current_user.user_id, recommendation_id)
        if current_state is not None and getattr(current_state, "status", None) == "completed":
            raise RuntimeError("Completed recommendation cannot be dismissed.")

        record = self.persistence_service.dismiss_recommendation_for_user(current_user.user_id, recommendation_id)
        return {
            "recommendation_id": recommendation_id,
            "status": "dismissed",
            "dismissed_at": getattr(record, "dismissed_at", None).isoformat() if getattr(record, "dismissed_at", None) is not None else self._now_iso(),
        }, warnings

    def undismiss_recommendation(self, current_user: UserClaims | None, recommendation_id: str) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        if self.persistence_service is None:
            raise ValueError("Persistence is not configured")
        if recommendation_id not in self._known_recommendation_ids():
            raise LookupError("Recommendation not found")

        current_state = self.persistence_service.get_recommendation_state_for_user(current_user.user_id, recommendation_id)
        if current_state is not None and getattr(current_state, "status", None) == "completed":
            raise RuntimeError("Completed recommendation cannot be undismissed.")

        undismissed = self.persistence_service.undismiss_recommendation_for_user(current_user.user_id, recommendation_id)
        if not undismissed:
            raise LookupError("Recommendation is not dismissed")

        return {
            "recommendation_id": recommendation_id,
            "status": "open",
            "undismissed_at": self._now_iso(),
        }, []

    def complete_recommendation(self, current_user: UserClaims | None, recommendation_id: str) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        if recommendation_id not in self._known_recommendation_ids():
            raise LookupError("Recommendation not found")
        if self.persistence_service is None:
            raise ValueError("Persistence is not configured")

        self.persistence_service.complete_recommendation_for_user(current_user.user_id, recommendation_id)
        goal_prefill = self._goal_prefill_for_recommendation(recommendation_id)
        return {
            "recommendation_id": recommendation_id,
            "status": "completed",
            "goal_prefill": goal_prefill,
            "next_action": {
                "type": "navigate",
                "target": "/goals/create",
            },
        }, []

    def get_recommendation_detail(self, current_user: UserClaims | None, recommendation_id: str) -> tuple[dict[str, Any], list[str]]:
        items, meta, warnings = self._build_recommendation_state(current_user, include_dismissed=True)
        selected = next((item for item in items if item["id"] == recommendation_id), None)
        if selected is None:
            raise LookupError("Recommendation not found")

        detail_map: dict[str, dict[str, Any]] = {
            "complete-profile-basics": self._build_detail(
                selected,
                full_reasoning="Profile persistence is currently unavailable or incomplete, so GoalWealth cannot yet ground recommendations in durable profile, risk, goal, and document state.",
                impact=["onboarding", "personalization"],
                confidence="high",
                supporting_data=selected.get("context", {}),
                actions=[
                    selected["action"],
                    {"type": "navigate", "target": "/risk-profile"},
                ],
            ),
            "goal-emergency-fund-starter": self._build_detail(
                selected,
                full_reasoning="Because you do not have any goals yet, an emergency fund is the safest first objective. It improves resilience and gives GoalWealth a concrete baseline planning target.",
                impact=["goal_setting", "financial_resilience"],
                confidence="high",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": "/goals/create"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/goal-emergency-fund-starter/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/goal-emergency-fund-starter/complete"},
                    ]
                ),
            ),
            "goal-debt-payoff-starter": self._build_detail(
                selected,
                full_reasoning="Your available context suggests debt reduction may deserve priority before other goal types. This recommendation is intended to turn that signal into a concrete debt payoff plan starter.",
                impact=["debt_management", "cashflow_relief"],
                confidence="medium",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": "/goals/create"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/goal-debt-payoff-starter/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/goal-debt-payoff-starter/complete"},
                    ]
                ),
            ),
            "goal-retirement-starter": self._build_detail(
                selected,
                full_reasoning="Your planning horizon looks long-term, so a retirement-oriented starter goal is a plausible first structured objective. This helps GoalWealth anchor later planning in a long-range outcome.",
                impact=["retirement_planning", "long_term_goals"],
                confidence="medium",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": "/goals/create"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/goal-retirement-starter/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/goal-retirement-starter/complete"},
                    ]
                ),
            ),
            "goal-investment-starter": self._build_detail(
                selected,
                full_reasoning="Your current risk tolerance and investment horizon suggest that a first investment-focused goal may be suitable. This recommendation helps translate that profile into a concrete goal setup starting point.",
                impact=["investment_planning", "growth_objectives"],
                confidence="medium",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": "/goals/create"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/goal-investment-starter/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/goal-investment-starter/complete"},
                    ]
                ),
            ),
        }

        detail = detail_map.get(recommendation_id)
        if detail is None:
            raise LookupError("Recommendation detail is not available")

        return {
            "item": detail,
            "meta": meta,
        }, warnings
