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
            "goal-add-emergency-fund-next",
            "goal-add-debt-payoff-next",
            "goal-add-retirement-next",
            "goal-add-investment-next",
            "resume-paused-goal",
            "mark-goal-completed",
            "review-goal-progress",
        }

    def _goal_recommendation_ids(self) -> set[str]:
        return {
            "goal-emergency-fund-starter",
            "goal-debt-payoff-starter",
            "goal-retirement-starter",
            "goal-investment-starter",
            "goal-add-emergency-fund-next",
            "goal-add-debt-payoff-next",
            "goal-add-retirement-next",
            "goal-add-investment-next",
            "resume-paused-goal",
            "mark-goal-completed",
            "review-goal-progress",
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
            "goal-add-emergency-fund-next": {
                "title": "Emergency Fund",
                "goal_type": "emergency_fund_goal",
                "status": "active",
                "priority": 8,
                "target_amount": None,
                "current_progress": 0,
                "target_date": None,
                "description": "Add an emergency fund goal to strengthen your financial safety net.",
            },
            "goal-add-debt-payoff-next": {
                "title": "Debt Payoff Plan",
                "goal_type": "debt_payoff_goal",
                "status": "active",
                "priority": 9,
                "target_amount": None,
                "current_progress": 0,
                "target_date": None,
                "description": "Add a debt payoff goal to reduce outstanding balances with a focused plan.",
            },
            "goal-add-retirement-next": {
                "title": "Retirement Goal",
                "goal_type": "retirement_goal",
                "status": "active",
                "priority": 7,
                "target_amount": None,
                "current_progress": 0,
                "target_date": None,
                "description": "Add a retirement goal aligned with your long-term planning horizon.",
            },
            "goal-add-investment-next": {
                "title": "Investment Goal",
                "goal_type": "investment_goal",
                "status": "active",
                "priority": 7,
                "target_amount": None,
                "current_progress": 0,
                "target_date": None,
                "description": "Add an investment goal aligned with your growth-oriented profile.",
            },
        }
        prefill = mapping.get(recommendation_id)
        if prefill is None:
            raise LookupError("Recommendation complete payload is not available")
        return prefill

    def _build_goal_candidates(
        self,
        current_user: UserClaims,
        snapshot: Any,
        risk_profile: Any,
        recent_ocr: list[Any],
        goals: list[Any],
    ) -> list[dict[str, Any]]:
        debt_signal = any(getattr(record, "document_type", None) == "bank_statement" for record in recent_ocr)
        existing_goal_types = {
            str(goal_type)
            for goal_type in (getattr(goal, "goal_type", None) for goal in goals)
            if goal_type is not None
        }
        candidates: list[dict[str, Any]] = []

        if snapshot.total_goals == 0:
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

        active_goals = [goal for goal in goals if getattr(goal, "status", None) == "active"]
        paused_goals = [goal for goal in goals if getattr(goal, "status", None) == "paused"]
        maintenance_candidates: list[dict[str, Any]] = []

        if snapshot.total_active_goals == 0 and paused_goals:
            paused_goal = sorted(
                paused_goals,
                key=lambda goal: (
                    -(int(getattr(goal, "priority", 0) or 0)),
                    str(getattr(goal, "updated_at", "") or ""),
                ),
            )[0]
            maintenance_candidates.append(
                self._build_item(
                    rec_id="resume-paused-goal",
                    rec_type="next_action",
                    category="goals",
                    priority="high",
                    title="Resume a paused goal",
                    message="You already have goals, but none are active right now. Resume a paused goal to get momentum back.",
                    preview=f"Suggested goal to resume: {getattr(paused_goal, 'title', 'Paused goal')}",
                    action={"type": "complete", "target": "/v1/recommendations/resume-paused-goal/complete"},
                    score=0.99,
                    why=["no active goals exist", "at least one paused goal exists"],
                    context={
                        "goal_flow": True,
                        "goal_id": str(getattr(paused_goal, "id", "")),
                        "goal_title": getattr(paused_goal, "title", None),
                        "current_status": getattr(paused_goal, "status", None),
                    },
                    source_refs={"goal_id": str(getattr(paused_goal, "id", ""))},
                )
            )
            return maintenance_candidates

        completable_goals = [
            goal
            for goal in active_goals
            if getattr(goal, "target_amount", None) is not None
            and getattr(goal, "current_progress", None) is not None
            and float(getattr(goal, "current_progress", 0) or 0) >= float(getattr(goal, "target_amount", 0) or 0)
        ]
        if completable_goals:
            goal_to_complete = sorted(
                completable_goals,
                key=lambda goal: (
                    -(int(getattr(goal, "priority", 0) or 0)),
                    str(getattr(goal, "updated_at", "") or ""),
                ),
            )[0]
            maintenance_candidates.append(
                self._build_item(
                    rec_id="mark-goal-completed",
                    rec_type="next_action",
                    category="goals",
                    priority="high",
                    title="Mark a goal as completed",
                    message="One of your active goals appears to have reached its target amount. You can mark it completed to keep your goal list clean.",
                    preview=f"Suggested goal to complete: {getattr(goal_to_complete, 'title', 'Goal')}",
                    action={"type": "complete", "target": "/v1/recommendations/mark-goal-completed/complete"},
                    score=0.97,
                    why=["an active goal has reached or exceeded its target amount", "goal status is still active"],
                    context={
                        "goal_flow": True,
                        "goal_id": str(getattr(goal_to_complete, "id", "")),
                        "goal_title": getattr(goal_to_complete, "title", None),
                        "target_amount": float(getattr(goal_to_complete, "target_amount", 0) or 0),
                        "current_progress": float(getattr(goal_to_complete, "current_progress", 0) or 0),
                    },
                    source_refs={"goal_id": str(getattr(goal_to_complete, "id", ""))},
                )
            )

        stale_review_goals = []
        for goal in active_goals:
            updated_at = getattr(goal, "updated_at", None)
            if updated_at is None:
                continue
            if getattr(goal, "current_progress", None) not in {0, 0.0}:
                continue
            age_days = (datetime.now(timezone.utc) - updated_at.astimezone(timezone.utc)).days
            if age_days >= 14:
                stale_review_goals.append((goal, age_days))
        if stale_review_goals:
            goal_to_review, age_days = sorted(stale_review_goals, key=lambda entry: -entry[1])[0]
            maintenance_candidates.append(
                self._build_item(
                    rec_id="review-goal-progress",
                    rec_type="next_action",
                    category="goals",
                    priority="medium",
                    title="Review goal progress",
                    message="One of your active goals has had no progress updates for a while. Reviewing it now could keep the plan realistic.",
                    preview=f"Suggested goal to review: {getattr(goal_to_review, 'title', 'Goal')}",
                    action={"type": "complete", "target": "/v1/recommendations/review-goal-progress/complete"},
                    score=0.84,
                    why=["an active goal has zero progress", f"last update was about {age_days} days ago"],
                    context={
                        "goal_flow": True,
                        "goal_id": str(getattr(goal_to_review, "id", "")),
                        "goal_title": getattr(goal_to_review, "title", None),
                        "age_days": age_days,
                    },
                    source_refs={"goal_id": str(getattr(goal_to_review, "id", ""))},
                )
            )

        if maintenance_candidates:
            return maintenance_candidates
        if snapshot.total_active_goals == 0:
            return []

        if debt_signal and "debt_payoff_goal" not in existing_goal_types:
            candidates.append(
                self._build_item(
                    rec_id="goal-add-debt-payoff-next",
                    rec_type="next_action",
                    category="goals",
                    priority="high",
                    title="Add a debt payoff goal next",
                    message="You already have active goals, and your current context suggests debt reduction may be the next goal worth adding.",
                    preview="Suggested next goal: debt payoff.",
                    action={"type": "complete", "target": "/v1/recommendations/goal-add-debt-payoff-next/complete"},
                    score=0.98,
                    why=["active goals already exist", "bank_statement OCR signal suggests debt-related planning may matter", "no existing debt_payoff_goal found"],
                    context={
                        "goal_flow": True,
                        "debt_signal": True,
                        "total_goals": snapshot.total_goals,
                        "total_active_goals": snapshot.total_active_goals,
                        "existing_goal_types": sorted(existing_goal_types),
                    },
                )
            )

        if "emergency_fund_goal" not in existing_goal_types:
            candidates.append(
                self._build_item(
                    rec_id="goal-add-emergency-fund-next",
                    rec_type="next_action",
                    category="goals",
                    priority="high",
                    title="Add an emergency fund goal next",
                    message="You already have at least one active goal. Adding an emergency fund goal could strengthen your overall financial setup.",
                    preview="Suggested next goal: emergency fund.",
                    action={"type": "complete", "target": "/v1/recommendations/goal-add-emergency-fund-next/complete"},
                    score=0.95 if not debt_signal else 0.88,
                    why=["active goals already exist", "no existing emergency_fund_goal found"],
                    context={
                        "goal_flow": True,
                        "total_goals": snapshot.total_goals,
                        "total_active_goals": snapshot.total_active_goals,
                        "existing_goal_types": sorted(existing_goal_types),
                    },
                )
            )

        if (
            "retirement_goal" not in existing_goal_types
            and getattr(risk_profile, "investment_horizon", None) == "long_term"
        ):
            candidates.append(
                self._build_item(
                    rec_id="goal-add-retirement-next",
                    rec_type="next_action",
                    category="goals",
                    priority="medium",
                    title="Add a retirement goal next",
                    message="You already have active goals, and your long-term planning horizon suggests a retirement goal could be a good next addition.",
                    preview="Suggested next goal: retirement.",
                    action={"type": "complete", "target": "/v1/recommendations/goal-add-retirement-next/complete"},
                    score=0.83,
                    why=["active goals already exist", "investment_horizon is long_term", "no existing retirement_goal found"],
                    context={
                        "goal_flow": True,
                        "investment_horizon": getattr(risk_profile, "investment_horizon", None),
                        "total_goals": snapshot.total_goals,
                        "existing_goal_types": sorted(existing_goal_types),
                    },
                )
            )

        if (
            "investment_goal" not in existing_goal_types
            and getattr(risk_profile, "risk_tolerance", None) in {"balanced", "growth", "aggressive"}
            and getattr(risk_profile, "investment_horizon", None) in {"medium_term", "long_term"}
        ):
            candidates.append(
                self._build_item(
                    rec_id="goal-add-investment-next",
                    rec_type="next_action",
                    category="goals",
                    priority="medium",
                    title="Add an investment goal next",
                    message="You already have active goals, and your current risk and horizon profile suggest an investment goal could be the next fit.",
                    preview="Suggested next goal: investment.",
                    action={"type": "complete", "target": "/v1/recommendations/goal-add-investment-next/complete"},
                    score=0.8,
                    why=[
                        "active goals already exist",
                        f"risk_tolerance is {getattr(risk_profile, 'risk_tolerance', None)}",
                        f"investment_horizon is {getattr(risk_profile, 'investment_horizon', None)}",
                        "no existing investment_goal found",
                    ],
                    context={
                        "goal_flow": True,
                        "risk_tolerance": getattr(risk_profile, "risk_tolerance", None),
                        "investment_horizon": getattr(risk_profile, "investment_horizon", None),
                        "total_goals": snapshot.total_goals,
                        "existing_goal_types": sorted(existing_goal_types),
                    },
                )
            )

        return candidates

    def _build_goal_state_only_item(self, recommendation_id: str, *, status: str) -> dict[str, Any]:
        title_map = {
            "goal-emergency-fund-starter": "Start with an emergency fund goal",
            "goal-debt-payoff-starter": "Start with a debt payoff goal",
            "goal-retirement-starter": "Start with a retirement goal",
            "goal-investment-starter": "Start with an investment goal",
            "goal-add-emergency-fund-next": "Add an emergency fund goal next",
            "goal-add-debt-payoff-next": "Add a debt payoff goal next",
            "goal-add-retirement-next": "Add a retirement goal next",
            "goal-add-investment-next": "Add an investment goal next",
            "resume-paused-goal": "Resume a paused goal",
            "mark-goal-completed": "Mark a goal as completed",
            "review-goal-progress": "Review goal progress",
        }
        message_map = {
            recommendation_id_value: "This recommendation was previously accepted or dismissed in the goals flow."
            for recommendation_id_value in title_map
        }
        goal_prefill = None
        try:
            goal_prefill = self._goal_prefill_for_recommendation(recommendation_id)
        except LookupError:
            goal_prefill = None
        context = {"goal_flow": True}
        if goal_prefill is not None:
            context["goal_prefill"] = goal_prefill
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
            context=context,
            status=status,
        )

    def _goal_creation_recommendation_ids(self) -> set[str]:
        return {
            "goal-emergency-fund-starter",
            "goal-debt-payoff-starter",
            "goal-retirement-starter",
            "goal-investment-starter",
            "goal-add-emergency-fund-next",
            "goal-add-debt-payoff-next",
            "goal-add-retirement-next",
            "goal-add-investment-next",
        }

    def _goal_maintenance_recommendation_ids(self) -> set[str]:
        return {
            "resume-paused-goal",
            "mark-goal-completed",
            "review-goal-progress",
        }

    def _maintenance_complete_payload(self, recommendation_id: str, selected_item: dict[str, Any]) -> dict[str, Any]:
        goal_id = selected_item.get("source_refs", {}).get("goal_id") or selected_item.get("context", {}).get("goal_id")
        goal_title = selected_item.get("context", {}).get("goal_title")
        if not goal_id:
            raise LookupError("Recommendation action payload is not available")

        if recommendation_id == "resume-paused-goal":
            payload = {"status": "active"}
            return {
                "recommendation_id": recommendation_id,
                "status": "completed",
                "target_goal_id": goal_id,
                "goal_update_request": {
                    "method": "PATCH",
                    "endpoint": f"/v1/goals/{goal_id}",
                    "content_type": "application/json",
                    "payload": payload,
                },
                "next_action": {"type": "navigate", "target": f"/goals/{goal_id}"},
                "target_goal": {"goal_id": goal_id, "title": goal_title},
            }

        if recommendation_id == "mark-goal-completed":
            payload = {"status": "completed"}
            return {
                "recommendation_id": recommendation_id,
                "status": "completed",
                "target_goal_id": goal_id,
                "goal_update_request": {
                    "method": "PATCH",
                    "endpoint": f"/v1/goals/{goal_id}",
                    "content_type": "application/json",
                    "payload": payload,
                },
                "next_action": {"type": "navigate", "target": f"/goals/{goal_id}"},
                "target_goal": {"goal_id": goal_id, "title": goal_title},
            }

        if recommendation_id == "review-goal-progress":
            return {
                "recommendation_id": recommendation_id,
                "status": "completed",
                "target_goal_id": goal_id,
                "next_action": {"type": "navigate", "target": f"/goals/{goal_id}"},
                "target_goal": {"goal_id": goal_id, "title": goal_title},
            }

        raise LookupError("Recommendation action payload is not available")

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
        goals = self.persistence_service.list_goals_for_user(current_user.user_id)

        if scope == "goals":
            items = self._build_goal_candidates(current_user, snapshot, risk_profile, recent_ocr, goals)
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

        if recommendation_id in self._goal_creation_recommendation_ids():
            goal_prefill = self._goal_prefill_for_recommendation(recommendation_id)
            create_goal_payload = {
                **goal_prefill,
                "recommendation_id": recommendation_id,
            }
            return {
                "recommendation_id": recommendation_id,
                "status": "completed",
                "goal_prefill": goal_prefill,
                "create_goal_payload": create_goal_payload,
                "create_goal_request": {
                    "method": "POST",
                    "endpoint": "/v1/goals",
                    "content_type": "application/json",
                    "payload": create_goal_payload,
                },
                "next_action": {
                    "type": "navigate",
                    "target": "/goals/create",
                },
            }, []

        if recommendation_id in self._goal_maintenance_recommendation_ids():
            items, _meta, _warnings = self._build_recommendation_state(
                current_user,
                include_dismissed=True,
                scope="goals",
                status_filter="all",
            )
            selected = next((item for item in items if item["id"] == recommendation_id), None)
            if selected is None:
                raise LookupError("Recommendation not found")
            return self._maintenance_complete_payload(recommendation_id, selected), []

        raise LookupError("Recommendation complete payload is not available")

    def get_recommendation_detail(self, current_user: UserClaims | None, recommendation_id: str) -> tuple[dict[str, Any], list[str]]:
        scope = "goals" if recommendation_id in self._goal_recommendation_ids() else None
        items, meta, warnings = self._build_recommendation_state(
            current_user,
            include_dismissed=True,
            scope=scope,
            status_filter="all",
        )
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
            "goal-add-emergency-fund-next": self._build_detail(
                selected,
                full_reasoning="You already have active goals, but you do not yet have an emergency fund goal. Adding one next would improve overall resilience and diversify your goal setup with a safety-focused objective.",
                impact=["goal_expansion", "financial_resilience"],
                confidence="high",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": "/goals/create"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/goal-add-emergency-fund-next/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/goal-add-emergency-fund-next/complete"},
                    ]
                ),
            ),
            "goal-add-debt-payoff-next": self._build_detail(
                selected,
                full_reasoning="You already have active goals, and the available document context suggests debt-related planning may matter. Because you do not yet have a debt payoff goal, this is a plausible next goal to add.",
                impact=["goal_expansion", "debt_management"],
                confidence="medium",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": "/goals/create"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/goal-add-debt-payoff-next/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/goal-add-debt-payoff-next/complete"},
                    ]
                ),
            ),
            "goal-add-retirement-next": self._build_detail(
                selected,
                full_reasoning="You already have active goals and a long-term planning horizon, but no retirement goal yet. Adding retirement next would extend your goal portfolio toward a long-range outcome.",
                impact=["goal_expansion", "retirement_planning"],
                confidence="medium",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": "/goals/create"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/goal-add-retirement-next/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/goal-add-retirement-next/complete"},
                    ]
                ),
            ),
            "goal-add-investment-next": self._build_detail(
                selected,
                full_reasoning="You already have active goals, and your current risk tolerance and planning horizon suggest that adding an investment goal next could complement your existing setup with a growth-oriented objective.",
                impact=["goal_expansion", "investment_planning"],
                confidence="medium",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": "/goals/create"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/goal-add-investment-next/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/goal-add-investment-next/complete"},
                    ]
                ),
            ),
            "resume-paused-goal": self._build_detail(
                selected,
                full_reasoning="You currently have paused goals but no active ones. Resuming one paused goal is the fastest way to restart progress without creating new planning overhead.",
                impact=["goal_maintenance", "momentum_recovery"],
                confidence="high",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": f"/goals/{selected.get('source_refs', {}).get('goal_id', '')}"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/resume-paused-goal/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/resume-paused-goal/complete"},
                    ]
                ),
            ),
            "mark-goal-completed": self._build_detail(
                selected,
                full_reasoning="An active goal appears to have already reached its target amount. Marking it completed would keep your current goal list accurate and reduce stale active items.",
                impact=["goal_maintenance", "state_cleanup"],
                confidence="high",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": f"/goals/{selected.get('source_refs', {}).get('goal_id', '')}"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/mark-goal-completed/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/mark-goal-completed/complete"},
                    ]
                ),
            ),
            "review-goal-progress": self._build_detail(
                selected,
                full_reasoning="An active goal has not received a progress update for a while. Reviewing it now can help decide whether to update progress, adjust expectations, or pause the goal.",
                impact=["goal_maintenance", "progress_review"],
                confidence="medium",
                supporting_data=selected.get("context", {}),
                actions=(
                    [{"type": "navigate", "target": f"/goals/{selected.get('source_refs', {}).get('goal_id', '')}"}]
                    if selected.get("status") == "completed"
                    else [
                        {"type": "dismiss", "target": "/v1/recommendations/review-goal-progress/dismiss"},
                        {"type": "complete", "target": "/v1/recommendations/review-goal-progress/complete"},
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
