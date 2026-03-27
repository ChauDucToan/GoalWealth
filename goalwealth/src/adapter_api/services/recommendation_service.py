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

    def _build_recommendation_state(
        self,
        current_user: UserClaims | None,
        *,
        include_dismissed: bool = False,
    ) -> tuple[list[dict[str, Any]], dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")

        if self.persistence_service is None:
            fallback_payload, warnings = self._build_fallback_payload()
            return fallback_payload["items"], fallback_payload["meta"], warnings

        warnings: list[str] = []
        items: list[dict[str, Any]] = []

        snapshot = self.persistence_service.build_user_bootstrap_snapshot(current_user.user_id)
        risk_profile = self.persistence_service.get_risk_profile(current_user.user_id)
        goals = self.persistence_service.list_goals_for_user(current_user.user_id)
        recent_ocr = self.persistence_service.list_recent_ocr_for_user(current_user.user_id, limit=10)

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
                    rec_id="complete-risk-profile",
                    rec_type="next_action",
                    category="risk",
                    priority="high",
                    title="Complete your risk profile",
                    message="Personalized planning is still limited because your risk profile is incomplete.",
                    preview=f"Missing: {', '.join(missing_risk_fields)}",
                    action={"type": "navigate", "target": "/risk-profile"},
                    score=0.96,
                    why=[f"{field} is missing" for field in missing_risk_fields],
                    context={"missing_fields": missing_risk_fields},
                )
            )

        if snapshot.total_goals == 0:
            items.append(
                self._build_item(
                    rec_id="create-first-goal",
                    rec_type="next_action",
                    category="goals",
                    priority="high",
                    title="Create your first financial goal",
                    message="Goals make planning concrete and help GoalWealth personalize future recommendations.",
                    preview="No goals have been created yet.",
                    action={"type": "navigate", "target": "/goals"},
                    score=0.94,
                    why=["total_goals is 0"],
                    context={"total_goals": snapshot.total_goals},
                )
            )
        elif snapshot.total_active_goals == 0:
            paused_or_archived_ids = [str(getattr(goal, "id", "")) for goal in goals]
            items.append(
                self._build_item(
                    rec_id="activate-a-goal",
                    rec_type="next_action",
                    category="goals",
                    priority="medium",
                    title="Activate at least one goal",
                    message="You have goals saved, but none are currently active for planning and progress tracking.",
                    preview="Existing goals are paused, completed, or archived.",
                    action={"type": "navigate", "target": "/goals"},
                    score=0.83,
                    why=["total_goals is greater than 0", "total_active_goals is 0"],
                    context={"total_goals": snapshot.total_goals, "total_active_goals": snapshot.total_active_goals},
                    source_refs={"goal_ids": paused_or_archived_ids},
                )
            )

        review_records = [
            record
            for record in recent_ocr
            if getattr(record, "manual_review_required", False)
            or getattr(record, "parse_status", None) in {"needs_review", "validation_failed"}
        ]
        if review_records:
            review_ids = [
                getattr(record, "ocr_record_id", None)
                for record in review_records
                if getattr(record, "ocr_record_id", None)
            ]
            items.append(
                self._build_item(
                    rec_id="review-ocr-records",
                    rec_type="warning",
                    category="documents",
                    priority="high" if len(review_records) >= 2 else "medium",
                    title="Review OCR documents that need attention",
                    message="Some uploaded documents still need review before they can fully support planning or automation.",
                    preview=f"{len(review_records)} OCR record(s) need review.",
                    action={"type": "navigate", "target": "/ocr/records?parse_status=needs_review"},
                    score=0.9 if len(review_records) >= 2 else 0.78,
                    why=["manual_review_required is true or parse_status indicates review needed"],
                    context={"needs_review_count": len(review_records)},
                    source_refs={"ocr_record_ids": review_ids},
                )
            )

        if snapshot.recent_document_count == 0:
            items.append(
                self._build_item(
                    rec_id="upload-financial-document",
                    rec_type="opportunity",
                    category="documents",
                    priority="medium",
                    title="Upload a financial document",
                    message="Receipts, salary slips, or statements can provide more grounded context for future planning.",
                    preview="No OCR-backed financial documents have been captured yet.",
                    action={"type": "navigate", "target": "/ocr"},
                    score=0.7,
                    why=["recent_document_count is 0"],
                    context={"recent_document_count": snapshot.recent_document_count},
                )
            )

        if (
            snapshot.total_active_goals > 0
            and getattr(risk_profile, "risk_tolerance", None) is not None
            and getattr(risk_profile, "investment_horizon", None) is not None
        ):
            items.append(
                self._build_item(
                    rec_id="start-planning-chat",
                    rec_type="opportunity",
                    category="planning",
                    priority="medium",
                    title="Start a planning chat",
                    message="You already have enough core context for GoalWealth to generate more tailored planning guidance.",
                    preview="Profile, risk, and goals are ready for a first planning pass.",
                    action={"type": "navigate", "target": "/chat"},
                    score=0.82,
                    why=[
                        "at least one active goal exists",
                        "risk_tolerance is present",
                        "investment_horizon is present",
                    ],
                    context={
                        "total_active_goals": snapshot.total_active_goals,
                        "recent_document_count": snapshot.recent_document_count,
                    },
                )
            )

        dismissed_ids = self.persistence_service.list_dismissed_recommendation_ids_for_user(current_user.user_id)
        enriched_items = [
            {
                **item,
                "status": "dismissed" if item["id"] in dismissed_ids else item.get("status", "open"),
            }
            for item in items
        ]
        response_items = enriched_items if include_dismissed else [item for item in enriched_items if item["id"] not in dismissed_ids]

        return self._sorted_items(response_items), {
            "market_included": False,
            "generated_at": self._now_iso(),
            "freshness": "realtime",
            "sources_used": ["profile", "risk_profile", "goals", "ocr_records", "summary_snapshot", "recommendation_state"],
            "dismissed_count": len(dismissed_ids),
        }, warnings

    def list_recommendations(self, current_user: UserClaims | None) -> tuple[dict[str, Any], list[str]]:
        items, meta, warnings = self._build_recommendation_state(current_user)
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

    def _known_recommendation_ids(self) -> set[str]:
        return {
            "complete-profile-basics",
            "complete-risk-profile",
            "create-first-goal",
            "activate-a-goal",
            "review-ocr-records",
            "upload-financial-document",
            "start-planning-chat",
        }

    def dismiss_recommendation(self, current_user: UserClaims | None, recommendation_id: str) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        if self.persistence_service is None:
            raise ValueError("Persistence is not configured")

        all_items, _meta, warnings = self._build_recommendation_state(current_user)
        visible_ids = {item["id"] for item in all_items}
        if recommendation_id not in self._known_recommendation_ids() and recommendation_id not in visible_ids:
            raise LookupError("Recommendation not found")

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

        undismissed = self.persistence_service.undismiss_recommendation_for_user(current_user.user_id, recommendation_id)
        if not undismissed:
            raise LookupError("Recommendation is not dismissed")

        return {
            "recommendation_id": recommendation_id,
            "status": "open",
            "undismissed_at": self._now_iso(),
        }, []

    def get_recommendation_detail(self, current_user: UserClaims | None, recommendation_id: str) -> tuple[dict[str, Any], list[str]]:
        items, meta, warnings = self._build_recommendation_state(current_user, include_dismissed=True)
        selected = next((item for item in items if item["id"] == recommendation_id), None)
        if selected is None:
            raise LookupError("Recommendation not found")

        detail_map: dict[str, dict[str, Any]] = {
            "complete-profile-basics": self._build_detail(
                selected,
                full_reasoning="Profile persistence is currently unavailable, so GoalWealth cannot yet ground recommendations in durable profile, risk, goal, and document state.",
                impact=["onboarding", "personalization"],
                confidence="high",
                supporting_data=selected.get("context", {}),
                actions=[
                    selected["action"],
                    {"type": "navigate", "target": "/risk-profile"},
                ],
            ),
            "complete-risk-profile": self._build_detail(
                selected,
                full_reasoning="Your recommendation set is limited because key risk fields are missing. Completing risk tolerance, investment horizon, and knowledge level helps GoalWealth align goals, planning prompts, and future market-aware insights.",
                impact=["risk_alignment", "planning_quality"],
                confidence="high",
                supporting_data=selected.get("context", {}),
                actions=[
                    selected["action"],
                    {"type": "navigate", "target": "/summary"},
                ],
            ),
            "create-first-goal": self._build_detail(
                selected,
                full_reasoning="Without at least one goal, GoalWealth has no explicit target to optimize around. Creating a first goal improves prioritization, recommendation relevance, and future plan generation.",
                impact=["goal_setting", "planning_readiness"],
                confidence="high",
                supporting_data=selected.get("context", {}),
                actions=[
                    selected["action"],
                    {"type": "navigate", "target": "/chat"},
                ],
            ),
            "activate-a-goal": self._build_detail(
                selected,
                full_reasoning="You already have stored goals, but none are active. That means current planning sessions may not have a live objective to track against. Activating one goal restores a clear short-term planning focus.",
                impact=["goal_tracking", "planning_focus"],
                confidence="medium",
                related_entities={"goal_ids": selected.get("source_refs", {}).get("goal_ids", [])},
                supporting_data=selected.get("context", {}),
                actions=[selected["action"]],
            ),
            "review-ocr-records": self._build_detail(
                selected,
                full_reasoning="One or more OCR documents are flagged for review because parsing confidence or validation state suggests they should be checked before being relied on for planning or automation. Reviewing them improves trust in downstream recommendations.",
                impact=["document_quality", "automation_safety"],
                confidence="high" if selected.get("priority") == "high" else "medium",
                related_entities={"ocr_record_ids": selected.get("source_refs", {}).get("ocr_record_ids", [])},
                supporting_data=selected.get("context", {}),
                actions=[
                    selected["action"],
                    {"type": "navigate", "target": "/ocr/records"},
                ],
            ),
            "upload-financial-document": self._build_detail(
                selected,
                full_reasoning="You do not have any OCR-backed financial documents yet. Uploading receipts, salary slips, or bank statements can add real-world grounding to budget, affordability, and planning recommendations.",
                impact=["document_coverage", "planning_grounding"],
                confidence="medium",
                supporting_data=selected.get("context", {}),
                actions=[selected["action"]],
            ),
            "start-planning-chat": self._build_detail(
                selected,
                full_reasoning="You already have enough core context for an initial planning session: at least one active goal plus a minimally complete risk profile. That means GoalWealth can move from setup guidance into more personalized planning dialogue.",
                impact=["planning_readiness", "engagement"],
                confidence="medium",
                supporting_data=selected.get("context", {}),
                actions=[
                    selected["action"],
                    {"type": "navigate", "target": "/recommendations"},
                ],
            ),
        }

        detail = detail_map.get(recommendation_id)
        if detail is None:
            raise LookupError("Recommendation detail is not available")

        return {
            "item": detail,
            "meta": meta,
        }, warnings
