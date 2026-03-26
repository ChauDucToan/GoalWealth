# Frontend -> Backend Data Needs (Current Scope)

## Mục tiêu của file này

File này chốt lại một câu hỏi thực dụng:

- frontend `SwinHackathon` hiện tại đang cần backend cấp những dữ liệu gì để chạy thật
- dữ liệu nào đã đi qua backend thật
- dữ liệu nào vẫn đang là local state hoặc mock data

Phạm vi ở đây là **trước mắt**.
Không cố bao hết mọi domain của app ở mức production-complete.

## Kết luận nhanh

Hiện tại frontend chỉ đang cần backend thật cho 3 nhóm chính:

1. `meta / readiness`
2. `assistant chat`
3. `ocr ingestion + ocr record status`

Ngoài ra, nếu muốn giảm mock ở auth/profile thì nên có thêm:

4. `user profile`
5. `user memory view`

Phần còn lại của app vẫn đang dựa rất nhiều vào mock data hoặc local context.

## Các endpoint frontend đang dùng thật

Nguồn đọc:

- `SwinHackathon/services/api/meta.ts`
- `SwinHackathon/services/api/chat.ts`
- `SwinHackathon/services/api/ocr.ts`
- `SwinHackathon/context/assistantContext.tsx`
- `SwinHackathon/app/(finance)/smart-budgeting/receipt-scan.tsx`

### 1. `GET /`

Frontend dùng để đọc metadata cơ bản của adapter.

Backend cần trả tối thiểu với outer envelope:

```json
{
  "ok": true,
  "data": {
    "service": "goalwealth-adapter-api",
    "version": "0.1.0",
    "environment": "dev",
    "docs_enabled": true
  },
  "error": null,
  "meta": {
    "request_id": "..."
  },
  "warnings": []
}
```

Kiểu dữ liệu phần `data`:

- `service`
- `version`
- `environment`
- `docs_enabled`

### 2. `GET /health`

Frontend dùng cho health/liveness.

Backend cần trả tối thiểu với outer envelope:

```json
{
  "ok": true,
  "data": {
    "status": "ok",
    "service": "goalwealth-adapter-api",
    "version": "0.1.0",
    "environment": "dev"
  },
  "error": null,
  "meta": {
    "request_id": "..."
  },
  "warnings": []
}
```

Kiểu dữ liệu phần `data`:

- `status`
- `service`
- `version?`
- `environment?`

### 3. `GET /ready`

Frontend dùng để biết adapter có đang sẵn sàng hay không.

Backend cần trả tối thiểu với outer envelope:

```json
{
  "ok": true,
  "data": {
    "status": "ready",
    "service": "goalwealth-adapter-api",
    "checks": {
      "config_loaded": true,
      "docs_mode_known": true,
      "oidc_config_present": true,
      "openclaw_config_present": false
    },
    "runtime": {
      "environment": "dev"
    }
  },
  "error": null,
  "meta": {
    "request_id": "..."
  },
  "warnings": []
}
```

Kiểu dữ liệu phần `data`:

- `status`
- `service`
- `checks`
  - `config_loaded?`
  - `docs_mode_known?`
  - `oidc_config_present?`
  - `openclaw_config_present?`
- `runtime?`

### 4. `POST /v1/chat/respond`

Đây là endpoint live quan trọng nhất cho `Assistant`.

Frontend gửi:

- `message`
- `session_id?`
- `locale?`
- `timezone?`
- `attachments?`

Backend cần trả với outer envelope:

```json
{
  "ok": true,
  "data": {
    "session_id": "gw-session-123",
    "reply": "....",
    "warnings": [],
    "used_context": {
      "memory": true,
      "ocr_records": [
        "ocr-123"
      ],
      "smart_agent": true,
      "smart_agent_result_count": 3,
      "user_present": true
    },
    "meta": {
      "gateway": "openclaw_gateway_http"
    }
  },
  "error": null,
  "meta": {
    "request_id": "..."
  },
  "warnings": []
}
```

Kiểu dữ liệu phần `data`:

- `session_id`
- `reply`
- `warnings`
- `used_context`
  - `memory?`
  - `ocr_records?`
  - `smart_agent?`
  - `smart_agent_result_count?`
  - `user_present?`
- `meta`

### 5. `POST /v1/ocr/ingress`

Đây là endpoint nhận đầu ra OCR thô từ frontend.

Frontend gửi:

```json
{
  "raw_text": "..."
}
```

Backend cần trả với outer envelope:

```json
{
  "ok": true,
  "data": {
    "ocr_record_id": "ocr-123",
    "status": "accepted",
    "message": "OCR ingress accepted",
    "meta": {}
  },
  "error": null,
  "meta": {
    "request_id": "..."
  },
  "warnings": []
}
```

Kiểu dữ liệu phần `data`:

- `ocr_record_id`
- `status`
- `message`
- `meta`

### 6. `GET /v1/ocr/records/{ocr_record_id}`

Frontend dùng để đọc trạng thái xử lý OCR sau khi đã ingest.

Backend cần trả với outer envelope:

```json
{
  "ok": true,
  "data": {
    "ocr_record_id": "ocr-123",
    "status": "ready",
    "warnings": [],
    "data": {
      "summary_text": "..."
    }
  },
  "error": null,
  "meta": {
    "request_id": "..."
  },
  "warnings": []
}
```

Kiểu dữ liệu phần `data`:

- `ocr_record_id`
- `status`
  - `pending_user_context`
  - `pending_backend`
  - `ready`
- `warnings`
- `data`

## Những màn frontend đang dùng backend thật

### Assistant

File chính:

- `SwinHackathon/context/assistantContext.tsx`

Luồng:

1. user gửi message
2. frontend gọi `POST /v1/chat/respond`
3. backend trả `reply`, `session_id`, `used_context`
4. frontend đẩy reply vào thread runtime

### Smart Budgeting OCR / Add Spending OCR

File chính:

- `SwinHackathon/app/(finance)/smart-budgeting/receipt-scan.tsx`

Luồng:

1. frontend lấy `raw_text` từ ML Kit OCR
2. gửi `raw_text` lên `POST /v1/ocr/ingress`
3. nhận `ocr_record_id`
4. gọi `GET /v1/ocr/records/{ocr_record_id}`
5. dùng status record để phản ánh lên UI

## Dữ liệu frontend đang cần nhưng chưa gọi backend thật

### User profile

Hiện frontend đang có shape user cơ bản ở:

- `SwinHackathon/context/user.types.ts`

Tối thiểu backend nên có kiểu dữ liệu:

```json
{
  "id": "user-123",
  "name": "Jane Doe Watson",
  "email": "jane@example.com",
  "avatarUrl": "https://...",
  "phone": "+84...",
  "language": "vi-VN",
  "currency": "USD"
}
```

Tương ứng các field:

- `id`
- `name`
- `email`
- `avatarUrl?`
- `phone?`
- `language?`
- `currency?`

### Profile settings

Hiện phần này chủ yếu đang là local state trong:

- `SwinHackathon/context/profileSettingsContext.tsx`

Nếu backend muốn cấp thật, nên có thêm:

- `memberSince`
- `city`
- `avatarUri`
- `coverUri`
- notification settings
- security settings
- display settings
- referral / invite info
- export status

## Memory view mà frontend đã chuẩn bị type sẵn

Nguồn:

- `SwinHackathon/services/api/types.ts`
- `goalwealth/contracts/memory/memory-service-view.schema.json`

Frontend đã có shape cho:

- `user_profile`
- `goals`
- `risk_profile`
- `ocr_summaries`
- `conversation_summary`

Tức là backend nếu trả memory view đầy đủ sẽ có shape tổng thể như:

```json
{
  "schema_version": "1.0.0",
  "user_id": "user-123",
  "user_profile": {},
  "goals": {},
  "risk_profile": {},
  "ocr_summaries": {},
  "conversation_summary": {},
  "last_updated": "2026-03-26T10:00:00Z"
}
```

Điều đó có nghĩa là nếu backend bắt đầu cấp memory view thật, frontend đã có nền type để dùng tiếp.

## Những domain lớn vẫn đang là mock

Các nhóm sau hiện chưa live bằng backend:

1. `Home / Dashboard`
2. `Transactions`
3. `Budgets / categories`
4. `Financial Goals`
5. `Subscriptions`
6. `News / Community`
7. `Investments`
8. `Profile settings chi tiết`

Nguồn mock chính:

- `SwinHackathon/components/home/mock-data.ts`
- `SwinHackathon/components/community/mock-data.ts`
- `SwinHackathon/components/financial-goals/data.ts`
- `SwinHackathon/components/finance/subscription-data.ts`
- `SwinHackathon/context/financeContext.tsx`

## Thứ tự backend nên cấp tiếp theo

Nếu chỉ ưu tiên những gì giúp frontend bớt mock nhanh nhất:

1. user profile read/update
2. memory view
3. goals
4. transaction list + dashboard summary
5. budget categories + spending summary

## Kết luận

Trước mắt, backend **không cần** cố cấp toàn bộ app.

Chỉ cần cấp tốt các phần sau là frontend đã có thể chạy live ở những flow chính:

1. `GET /ready`
2. `POST /v1/chat/respond`
3. `POST /v1/ocr/ingress`
4. `GET /v1/ocr/records/{ocr_record_id}`
5. user profile tối thiểu

Phần còn lại có thể triển khai dần theo domain.
