#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))

from orchestrator_clients import DEFAULT_ENV_PREFIX  # noqa: E402
from orchestrator_clients.demo_flow import (  # noqa: E402
    run_full_demo,
    safe_memory_view,
    safe_ocr_view,
    safe_smart_agent_query,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Test GoalWealth orchestrator clients against internal backend APIs."
    )
    parser.add_argument(
        "--prefix",
        default=DEFAULT_ENV_PREFIX,
        help=f"Environment variable prefix (default: {DEFAULT_ENV_PREFIX})",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    memory_parser = subparsers.add_parser("memory", help="Call memory service view")
    memory_parser.add_argument("--user-id", required=True)
    memory_parser.add_argument("--include-sections", nargs="*")
    memory_parser.add_argument("--ocr-summary-limit", type=int)

    ocr_parser = subparsers.add_parser("ocr", help="Call OCR OpenClaw view")
    ocr_parser.add_argument("--user-id", required=True)
    ocr_parser.add_argument("--ocr-record-id", required=True)

    smart_parser = subparsers.add_parser("smart-agent", help="Call Smart Agent query")
    smart_parser.add_argument("--query", required=True)
    smart_parser.add_argument("--user-id")
    smart_parser.add_argument("--top-k", type=int)
    smart_parser.add_argument("--categories", nargs="*")
    smart_parser.add_argument("--freshness-threshold-minutes", type=int)
    smart_parser.add_argument("--locale")
    smart_parser.add_argument("--timezone")
    smart_parser.add_argument("--trace-id")
    smart_parser.add_argument("--caller", default="openclaw_orchestrator")

    full_parser = subparsers.add_parser("full", help="Run the full orchestrator client demo flow")
    full_parser.add_argument("--user-id", required=True)
    full_parser.add_argument("--query")
    full_parser.add_argument("--ocr-record-id")
    full_parser.add_argument("--include-sections", nargs="*")
    full_parser.add_argument("--ocr-summary-limit", type=int)
    full_parser.add_argument("--top-k", type=int)
    full_parser.add_argument("--categories", nargs="*")
    full_parser.add_argument("--freshness-threshold-minutes", type=int)
    full_parser.add_argument("--locale")
    full_parser.add_argument("--timezone")
    full_parser.add_argument("--trace-id")
    full_parser.add_argument("--caller", default="openclaw_orchestrator")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "memory":
        result = safe_memory_view(
            args.user_id,
            include_sections=args.include_sections,
            ocr_summary_limit=args.ocr_summary_limit,
            prefix=args.prefix,
        )
    elif args.command == "ocr":
        result = safe_ocr_view(
            args.ocr_record_id,
            user_id=args.user_id,
            prefix=args.prefix,
        )
    elif args.command == "smart-agent":
        result = safe_smart_agent_query(
            args.query,
            user_id=args.user_id,
            top_k=args.top_k,
            categories=args.categories,
            freshness_threshold_minutes=args.freshness_threshold_minutes,
            locale=args.locale,
            timezone=args.timezone,
            trace_id=args.trace_id,
            caller=args.caller,
            prefix=args.prefix,
        )
    else:
        result = run_full_demo(
            user_id=args.user_id,
            query=args.query,
            ocr_record_id=args.ocr_record_id,
            include_sections=args.include_sections,
            ocr_summary_limit=args.ocr_summary_limit,
            top_k=args.top_k,
            categories=args.categories,
            freshness_threshold_minutes=args.freshness_threshold_minutes,
            locale=args.locale,
            timezone=args.timezone,
            trace_id=args.trace_id,
            caller=args.caller,
            prefix=args.prefix,
        )

    print(json.dumps(result, ensure_ascii=False, indent=2))

    if isinstance(result, dict) and result.get("summary", {}).get("all_ok") is False:
        return 2
    if isinstance(result, dict) and result.get("ok") is False:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
