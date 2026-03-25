from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone
from typing import Iterable

ALLOWED_SECTIONS = {
    "user_profile",
    "goals",
    "risk_profile",
    "ocr_summaries",
    "conversation_summary",
}


def _now() -> datetime:
    return datetime.now(timezone.utc)



def _iso(dt: datetime) -> str:
    return dt.replace(microsecond=0).isoformat().replace("+00:00", "Z")



def _seed(value: str) -> int:
    return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:8], 16)



def _empty_goals() -> dict:
    return {
        "total_active_goals": 0,
        "total_goals": 0,
        "active_goals": [],
        "completed_goals": [],
        "paused_goals": [],
        "archived_goals": [],
    }



def _empty_ocr_summaries() -> dict:
    return {
        "total_summaries": 0,
        "recent_summaries": [],
        "by_type": {},
    }



def _empty_conversation_summary(now: datetime) -> dict:
    return {
        "last_turn_date": _iso(now),
        "total_turns": 0,
        "last_topic": "goal_alignment",
        "user_intent": "financial_planning",
        "last_message": "User context stub is available.",
        "context_needs": [],
        "pending_actions": [],
    }



def _normalize_sections(include_sections: Iterable[str] | None) -> set[str] | None:
    if include_sections is None:
        return None
    normalized = {str(item).strip() for item in include_sections if str(item).strip()}
    filtered = {item for item in normalized if item in ALLOWED_SECTIONS}
    return filtered or None



def build_memory_service_view(
    user_id: str,
    *,
    include_sections: Iterable[str] | None = None,
    ocr_summary_limit: int | None = None,
) -> dict:
    now = _now()
    seed = _seed(user_id)
    selected_sections = _normalize_sections(include_sections)
    risk_score = 35 + (seed % 40)
    timezone_name = "Asia/Ho_Chi_Minh"
    created_at = now - timedelta(days=90 + (seed % 30))
    updated_at = now - timedelta(hours=2)
    target_date = (now + timedelta(days=180)).date().isoformat()
    emergency_target = 25000000 + ((seed % 8) * 1000000)
    emergency_progress = emergency_target * 0.42
    laptop_target = 18000000 + ((seed % 5) * 1000000)
    laptop_progress = laptop_target * 0.15
    ocr_limit = max(1, min(ocr_summary_limit or 3, 10))

    full_view = {
        "schema_version": "1.0.0",
        "user_id": user_id,
        "user_profile": {
            "full_name": f"GoalWealth User {user_id}",
            "email": f"{user_id.replace(':', '-')}@example.goalwealth.local",
            "phone": "+84-000-000-000",
            "location": {
                "city": "Ho Chi Minh City",
                "country": "Vietnam",
                "timezone": timezone_name,
            },
            "created_at": _iso(created_at),
            "updated_at": _iso(updated_at),
        },
        "goals": {
            "total_active_goals": 2,
            "total_goals": 2,
            "active_goals": [
                {
                    "goal_id": f"goal-emergency-{user_id}",
                    "title": "Emergency fund",
                    "type": "emergency_fund_goal",
                    "status": "active",
                    "priority": 1,
                    "target_amount": emergency_target,
                    "current_progress": emergency_progress,
                    "target_date": (now + timedelta(days=120)).date().isoformat(),
                    "description": "Maintain a 4-6 month emergency buffer.",
                    "created_at": _iso(created_at),
                    "updated_at": _iso(updated_at),
                    "milestones": [
                        {
                            "milestone_id": f"ms-emergency-1-{user_id}",
                            "title": "Reach month-1 buffer",
                            "target_amount": round(emergency_target * 0.25, 2),
                            "current_progress": round(emergency_progress * 0.8, 2),
                            "target_date": (now + timedelta(days=30)).date().isoformat(),
                            "created_at": _iso(created_at),
                            "updated_at": _iso(updated_at),
                        }
                    ],
                },
                {
                    "goal_id": f"goal-laptop-{user_id}",
                    "title": "Laptop replacement",
                    "type": "savings_goal",
                    "status": "active",
                    "priority": 2,
                    "target_amount": laptop_target,
                    "current_progress": laptop_progress,
                    "target_date": target_date,
                    "description": "Prepare for planned productivity upgrade.",
                    "created_at": _iso(created_at),
                    "updated_at": _iso(updated_at),
                    "milestones": [],
                },
            ],
            "completed_goals": [],
            "paused_goals": [],
            "archived_goals": [],
        },
        "risk_profile": {
            "risk_tolerance": "balanced" if risk_score < 60 else "growth",
            "calculated_score": risk_score,
            "investment_horizon": "medium_term" if risk_score < 60 else "long_term",
            "knowledge_level": "intermediate",
            "liquidity_needs": "medium",
            "created_at": _iso(created_at),
            "updated_at": _iso(updated_at),
            "constraints": {
                "max_loss": 12,
                "min_return": 6,
                "sector_exclusions": [],
                "asset_class_limits": {
                    "crypto": 10,
                    "equities": 65,
                    "cash": 35,
                },
            },
        },
        "ocr_summaries": {
            "total_summaries": 3,
            "recent_summaries": [
                {
                    "ocr_record_id": f"ocr-receipt-{user_id}",
                    "document_type": "receipt",
                    "summary_text": "Recent food receipt captured and available for review.",
                    "usable": True,
                    "overall_confidence": 0.91,
                    "document_date": now.date().isoformat(),
                    "amount_involved": 185000,
                    "institution_name": "Highlands Coffee",
                    "created_at": _iso(now - timedelta(days=1)),
                    "related_goal_ids": [f"goal-emergency-{user_id}"],
                },
                {
                    "ocr_record_id": f"ocr-salary-{user_id}",
                    "document_type": "salary_slip",
                    "summary_text": "Salary slip indicates recurring monthly income.",
                    "usable": True,
                    "overall_confidence": 0.95,
                    "document_date": (now - timedelta(days=10)).date().isoformat(),
                    "amount_involved": 25000000,
                    "institution_name": "GoalWealth Payroll",
                    "created_at": _iso(now - timedelta(days=10)),
                    "related_goal_ids": [f"goal-laptop-{user_id}"],
                },
                {
                    "ocr_record_id": f"ocr-bank-{user_id}",
                    "document_type": "bank_statement",
                    "summary_text": "Bank statement summary is available for context use.",
                    "usable": True,
                    "overall_confidence": 0.88,
                    "document_date": (now - timedelta(days=20)).date().isoformat(),
                    "amount_involved": 15320000,
                    "institution_name": "MB Bank",
                    "created_at": _iso(now - timedelta(days=20)),
                    "related_goal_ids": [],
                },
            ][:ocr_limit],
            "by_type": {
                "receipt": 1,
                "salary_slip": 1,
                "bank_statement": 1,
            },
        },
        "conversation_summary": {
            "last_turn_date": _iso(now - timedelta(minutes=15)),
            "total_turns": 12,
            "last_topic": "goal-based planning",
            "user_intent": "prioritize_goals_and_review_market_context",
            "last_message": "Tôi nên ưu tiên mục tiêu nào trước trong tháng này?",
            "context_needs": ["goals", "risk_profile", "recent_ocr_summaries"],
            "pending_actions": [
                {
                    "action_type": "recommend_action",
                    "target": "goal-emergency-priority",
                    "priority": 1,
                    "created_at": _iso(now - timedelta(hours=3)),
                }
            ],
        },
        "last_updated": _iso(updated_at),
    }

    if selected_sections is None:
        return full_view

    view = dict(full_view)
    if "user_profile" not in selected_sections:
        view["user_profile"] = {}
    if "goals" not in selected_sections:
        view["goals"] = _empty_goals()
    if "risk_profile" not in selected_sections:
        view["risk_profile"] = {}
    if "ocr_summaries" not in selected_sections:
        view["ocr_summaries"] = _empty_ocr_summaries()
    if "conversation_summary" not in selected_sections:
        view["conversation_summary"] = _empty_conversation_summary(now)
    return view
