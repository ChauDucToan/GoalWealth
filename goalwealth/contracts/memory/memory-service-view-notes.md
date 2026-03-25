# GoalWealth Memory Service View - Notes

## File
- `goalwealth/contracts/memory/memory-service-view.schema.json`

## Mục đích
Schema này là bản tối giản mà OpenClaw orchestrator nên đọc từ external structured memory backend.

OpenClaw **không nên** đọc trực tiếp:
- raw OCR text đầy đủ
- memory markdown files
- parser internals

Thay vào đó, OpenClaw nên đọc:
- user profile
- goals
- OCR summaries
- risk profile
- conversation summary

## Tư duy sử dụng
Có 2 layer memory:

### 1. Full parse memory
- lưu trong PostgreSQL
- phục vụ audit/debug/reprocessing

### 2. Memory service view
- dùng để OpenClaw orchestrator đọc
- tránh kéo noise vào orchestration layer
- có structured facts, không có unstructured text

## Các field quan trọng em đã chọn

### Core
- `schema_version`
- `user_id`
- `last_updated`

### User profile
- `full_name`
- `email`
- `phone`
- `location.city`
- `location.country`
- `location.timezone`

### Goals
- `total_active_goals`
- `total_goals`
- `active_goals[]` (có goal_id, title, type, status, priority, target_amount, current_progress, target_date, description, milestones[])
- `completed_goals[]`
- `paused_goals[]`
- `archived_goals[]`

### Risk profile
- `risk_tolerance` (conservative, moderate, balanced, growth, aggressive)
- `calculated_score` (0-100)
- `investment_horizon{