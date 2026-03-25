from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone

from ..errors import ApiHttpError



def _now() -> datetime:
    return datetime.now(timezone.utc)



def _iso(dt: datetime) -> str:
    return dt.replace(microsecond=0).isoformat().replace("+00:00", "Z")



def _seed(value: str) -> int:
    return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:8], 16)



def build_openclaw_view(ocr_record_id: str, *, user_id: str) -> dict:
    cleaned_id = ocr_record_id.strip()
    if not cleaned_id:
        raise ApiHttpError(400, "INVALID_REQUEST", "ocrRecordId is required")
    if not user_id.strip():
        raise ApiHttpError(400, "INVALID_REQUEST", "userId is required")

    lowered = cleaned_id.lower()
    if any(keyword in lowered for keyword in {"missing", "notfound", "404"}):
        raise ApiHttpError(404, "OCR_RECORD_NOT_FOUND", f"OCR record not found: {cleaned_id}")
    if any(keyword in lowered for keyword in {"queued", "processing", "awaiting"}):
        raise ApiHttpError(
            409,
            "OCR_RECORD_NOT_READY",
            f"OCR record is not ready for OpenClaw yet: {cleaned_id}",
            details={
                "status": "processing",
                "retryable": True,
            },
        )

    seed = _seed(cleaned_id)
    now = _now()
    created_at = now - timedelta(minutes=20 + (seed % 30))
    updated_at = now - timedelta(minutes=5)

    document_type = "receipt"
    summary_text = "Receipt summary is available for budgeting context."
    facts = {
        "document_summary": {
            "merchant_name": "Highlands Coffee",
            "currency": "VND",
            "document_date": now.date().isoformat(),
        },
        "financial_updates": {
            "total_amount": 185000,
            "transactions_count": 1,
            "transaction_candidates": [
                {
                    "transaction_date": now.date().isoformat(),
                    "description": "Coffee and snacks",
                    "amount": 185000,
                    "direction": "out",
                    "category_hint": "food",
                    "confidence": 0.9,
                }
            ],
            "holding_candidates": [],
        },
    }
    warnings = []
    status = "processed"
    usable = True
    overall_confidence = 0.9
    manual_review_required = False
    auto_apply_allowed = False
    orchestration_hint = {
        "recommended_action": "ask_user_confirmation_before_apply",
        "safe_for_context_use": True,
        "next_question_hint": "Ask whether this expense should update the user cashflow.",
        "apply_targets": ["cashflow", "expense_profile"],
    }
    missing_fields: list[str] = []

    if any(keyword in lowered for keyword in {"salary", "income", "payroll"}):
        document_type = "salary_slip"
        summary_text = "Salary slip indicates recurring monthly income and can inform affordability checks."
        facts = {
            "document_summary": {
                "institution_name": "GoalWealth Payroll",
                "currency": "VND",
                "document_date": now.date().isoformat(),
            },
            "financial_updates": {
                "gross_income": 28000000,
                "net_income": 25000000,
                "transactions_count": 0,
                "transaction_candidates": [],
                "holding_candidates": [],
            },
        }
        overall_confidence = 0.96
        orchestration_hint = {
            "recommended_action": "ask_user_confirmation_before_apply",
            "safe_for_context_use": True,
            "next_question_hint": "Ask whether the salary slip should update the monthly income profile.",
            "apply_targets": ["income_profile", "cashflow", "goal_context"],
        }
    elif any(keyword in lowered for keyword in {"bank", "statement"}):
        document_type = "bank_statement"
        summary_text = "Bank statement summary is available for cashflow context but should be reviewed before apply."
        facts = {
            "document_summary": {
                "institution_name": "MB Bank",
                "currency": "VND",
                "statement_period": {
                    "from": (now - timedelta(days=30)).date().isoformat(),
                    "to": now.date().isoformat(),
                },
                "document_date": now.date().isoformat(),
            },
            "financial_updates": {
                "opening_balance": 12300000,
                "closing_balance": 15320000,
                "transactions_count": 12,
                "transaction_candidates": [],
                "holding_candidates": [],
            },
        }
        manual_review_required = True
        overall_confidence = 0.87
        status = "needs_review"
        warnings = [
            {
                "code": "MANUAL_REVIEW_RECOMMENDED",
                "message": "Statement summary should be reviewed before it updates durable financial records.",
                "severity": "warning",
            }
        ]
        orchestration_hint = {
            "recommended_action": "manual_review_before_apply",
            "safe_for_context_use": True,
            "next_question_hint": "Ask whether the user wants to review balances and transactions before applying any updates.",
            "apply_targets": ["cashflow", "asset_snapshot"],
        }
    elif any(keyword in lowered for keyword in {"invest", "portfolio", "broker"}):
        document_type = "investment_statement"
        summary_text = "Investment statement suggests an updated portfolio snapshot and is safe for context use."
        facts = {
            "document_summary": {
                "broker_name": "VCBS",
                "currency": "VND",
                "document_date": now.date().isoformat(),
            },
            "financial_updates": {
                "total_market_value": 152300000,
                "holding_count": 2,
                "transaction_candidates": [],
                "holding_candidates": [
                    {
                        "ticker": "FPT",
                        "quantity": 20,
                        "avg_cost": 118000,
                        "market_price": 124000,
                        "market_value": 2480000,
                        "confidence": 0.88,
                    },
                    {
                        "ticker": "VN30F",
                        "quantity": 5,
                        "avg_cost": 1550000,
                        "market_price": 1580000,
                        "market_value": 7900000,
                        "confidence": 0.73,
                    },
                ],
            },
        }
        orchestration_hint = {
            "recommended_action": "ask_user_confirmation_before_apply",
            "safe_for_context_use": True,
            "next_question_hint": "Ask whether the portfolio snapshot should update the investment context.",
            "apply_targets": ["portfolio_snapshot", "goal_context"],
        }
    if any(keyword in lowered for keyword in {"review", "manual"}):
        status = "needs_review"
        manual_review_required = True
        auto_apply_allowed = False
        warnings.append(
            {
                "code": "LOW_CONFIDENCE_FIELDS",
                "message": "One or more fields should be confirmed manually before any update.",
                "severity": "warning",
            }
        )
        missing_fields = ["document_date"]
        orchestration_hint["recommended_action"] = "manual_review_before_apply"
    if any(keyword in lowered for keyword in {"reject", "invalid", "failed"}):
        status = "validation_failed"
        usable = False
        manual_review_required = True
        overall_confidence = 0.42
        warnings.append(
            {
                "code": "VALIDATION_FAILED",
                "message": "The OCR result is too weak to apply automatically.",
                "severity": "error",
            }
        )
        orchestration_hint = {
            "recommended_action": "ignore_for_now",
            "safe_for_context_use": False,
            "next_question_hint": "Ask the user to upload a clearer document.",
            "apply_targets": [],
        }

    return {
        "schema_version": "1.0.0",
        "ocr_record_id": cleaned_id,
        "user_id": user_id,
        "document_type": document_type,
        "status": status,
        "summary_text": summary_text,
        "usable": usable,
        "overall_confidence": overall_confidence,
        "manual_review_required": manual_review_required,
        "auto_apply_allowed": auto_apply_allowed,
        "warnings": warnings,
        "missing_fields": missing_fields,
        "facts": facts,
        "orchestration_hint": orchestration_hint,
        "created_at": _iso(created_at),
        "updated_at": _iso(updated_at),
    }
