# GoalWealth - Missing Pieces Checklist

Updated against the current implementation and latest architecture decisions.

## What is already in place
- RSS crawler Lambda with warm sync and targeted refresh path
- OpenSearch Serverless + Titan embeddings integration
- Smart Agent Lambda with semantic/fresh/hybrid routing
- Relevance hardening for fresh-news responses (dedupe, no broad fallback for specific queries, acronym handling)
- OCR contract set:
  - ingress (`goalwealth/contracts/ocr/ocr-ingress.schema.json`)
  - normalized/full parse (`goalwealth/contracts/ocr/ocr-parse-output.schema.json`)
  - OpenClaw view (`goalwealth/contracts/ocr/ocr-openclaw-view.schema.json`)
- Memory service view schema (`goalwealth/contracts/memory/memory-service-view.schema.json`)
- Internal OpenAPI contract (`goalwealth/contracts/api/openclaw-backend-api.openapi.yaml`)
- Orchestrator client skeletons + local demo flow/scripts
- Project structure reorganized under `goalwealth/`

## Highest-priority missing pieces

### P1 - Required to make the full app architecture real
- Thin API adapter / internal HTTP service implementation
- PostgreSQL schema + migration plan for:
  - user profile
  - goals
  - OCR normalized records
  - conversation summaries
  - audit trail
- Memory service implementation behind `/v1/memory/users/{userId}/view`
- OCR normalization service implementation behind OCR ingress and OCR OpenClaw view
- Google OIDC auth wiring for MVP
- User/session isolation model across app -> adapter -> orchestrator

### P2 - Core financial intelligence layer
- Dynamic risk profile engine
- Multi-goal planner engine
- Backtesting service (>=5 years historical data)
- Recommendation/ranking service for products/stocks
- Portfolio allocation + rebalancing engine

### P3 - Product completion / governance
- Explainability layer for recommendations and plans
- Compliance/audit service implementation
- Notification pipeline for alerts and async jobs
- Discipline score / badges / habit coaching system
- Human review workflow for ambiguous OCR or risky actions

## Proposal sections that should be updated
- OpenClaw on EC2 should be described as orchestration only
- OCR ingress should be described as raw_text-only, with normalization downstream
- PostgreSQL/RDS should be the source of truth for structured product memory
- S3 should not be described as part of the main OCR/user-memory path for current scope
- Smart Agent should be described as internal JSON-only behind a thin adapter, not public-facing directly
- Auth should be framed as OAuth/OIDC-first with Google OIDC for MVP

## Current practical next steps
1. Implement the thin adapter/internal HTTP service
2. Implement PostgreSQL-backed memory service
3. Implement OCR normalization + OCR OpenClaw view service
4. Wire Google OIDC validation in adapter/API boundary
5. Keep using AWS CLI tests for crawler/smart-agent while the adapter is still missing

## Deployment constraints now locked in
- OpenClaw EC2 runtime should use ARM/Graviton instances
- GoalWealth production runtime must not create or depend on `memory.md`, `MEMORY.md`, or `memory/*.md`
- Product memory should stay external and structured only
