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

    def list_recommendations(self, current_user: UserClaims | None) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")

        warnings: list[str] = []
        items: list[dict[str, Any]] = []

        if self.persistence_service is None:
            warnings.append(
                "Persistence is not configured; /v1/recommendations is returning minimal onboarding recommendations only."
            )
            items.append(
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
            )
            return {
                "items": items,
                "summary": {
                    "total": len(items),
                    "high_priority": sum(1 for item in items if item["priority"] == "high"),
                    "medium_priority": sum(1 for item in items if item["priority"] == "medium"),
                    "low_priority": sum(1 for item in items if item["priority"] == "low"),
                },
                "meta": {
                    "market_included": False,
                    "generated_at": self._now_iso(),
                    "freshness": "realtime",
                    "sources_used": ["auth_fallback"],
                },
            }, warnings

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
            review_ids = [getattr(record, "ocr_record_id", None) for record in review_records if getattr(record, "ocr_record_id", None)]
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

        priority_rank = {"high": 0, "medium": 1, "low": 2}
        items.sort(key=lambda item: (priority_rank.get(item["priority"], 99), -float(item.get("score", 0))))

        return {
            "items": items,
            "summary": {
                "total": len(items),
                "high_priority": sum(1 for item in items if item["priority"] == "high"),
                "medium_priority": sum(1 for item in items if item["priority"] == "medium"),
                "low_priority": sum(1 for item in items if item["priority"] == "low"),
            },
            "meta": {
                "market_included": False,
                "generated_at": self._now_iso(),
                "freshness": "realtime",
                "sources_used": ["profile", "risk_profile", "goals", "ocr_records", "summary_snapshot"],
            },
        }, warnings
