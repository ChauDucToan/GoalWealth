# GoalWealth Internal Backend API - Notes

## Files
- `goalwealth/contracts/api/openclaw-backend-api.openapi.yaml`
- `goalwealth/contracts/memory/memory-service-view.schema.json`
- `goalwealth/contracts/ocr/ocr-openclaw-view.schema.json`

## Mizuki vừa làm gì?
Em chốt API contract đầu tiên cho 3 call mà OpenClaw sẽ cần sớm nhất:

1. `GET /v1/memory/users/{userId}/view`
2. `GET /v1/ocr/records/{ocrRecordId}/openclaw-view?userId=...`
3. `POST /v1/smart-agent/query`

Mục tiêu là để sau đó code client theo kiểu contract-first:
- `memory_client`
- `ocr_client`
- `smart_agent_client`

## Vì sao em chốt 3 API này trước?
Vì đây là 3 luồng đọc chính của orchestrator:

### 1. Memory service
OpenClaw cần đọc context người dùng:
- profile
- goals
- risk profile
- OCR summaries
- conversation summary

### 2. OCR service
Khi user upload/tạo OCR record, OpenClaw chỉ nên đọc bản `openclaw-view`, không đọc raw OCR.

### 3. Smart agent
OpenClaw cần gọi một service JSON-only để lấy kết quả semantic/fresh/hybrid search cho news/query routing.

## Tư duy boundary
- OpenClaw = orchestration only
- PostgreSQL/external services = source of truth
- OCR raw data không chảy thẳng vào OpenClaw
- Smart Agent không tự trả lời người dùng, chỉ trả JSON

## Call order em đề xuất cho V1

### Case A: user hỏi về tình hình tài chính/cần context cá nhân
1. gọi memory view
2. nếu cần chứng từ cụ thể thì gọi OCR openclaw view
3. nếu cần news/market context thì gọi smart agent
4. OpenClaw tổng hợp response cuối

### Case B: user vừa upload document
1. polling/lookup OCR openclaw view theo `ocr_record_id`
2. kiểm tra `manual_review_required`, `auto_apply_allowed`
3. nếu an toàn thì dùng cho context hoặc xin user confirm
4. sau đó mới cập nhật workflow/domain service

### Case C: user hỏi tin tức / phân tích thị trường
1. gọi smart agent
2. nếu cần cá nhân hóa thì merge thêm memory view
3. OpenClaw trả lời cuối cùng

## Những gì em cố tình chưa làm trong contract này
- chưa mở write/update endpoints
- chưa mở admin endpoints
- chưa chốt pagination sâu
- chưa chốt webhook/event contracts
- chưa chốt auth mode cuối cùng cho internal service-to-service traffic

## Bước tiếp theo hợp lý
Sau contract này, mình có thể code 3 client skeleton trước:
- `goalwealth/src/orchestrator_clients/memory_client.py`
- `goalwealth/src/orchestrator_clients/ocr_client.py`
- `goalwealth/src/orchestrator_clients/smart_agent_client.py`

Em nghĩ đây là bước đẹp nhất trước khi lao vào implementation business logic.
