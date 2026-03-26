# OpenAPI Summary Cho Các Endpoint Live Hiện Tại

## Mục tiêu

File này không thay thế OpenAPI đầy đủ.

Nó chỉ tóm tắt nhanh 3 nhóm endpoint mà frontend đang dùng thật:

1. `ready`
2. `chat`
3. `ocr`

## Chuẩn envelope

Mọi response frontend đang kỳ vọng theo dạng:

```yaml
ok: boolean
data: object | null
error: object | null
meta:
  request_id: string | null
warnings:
  - string
```

## 1. `GET /ready`

### Purpose

Cho frontend biết adapter đã sống và đang ở trạng thái config nào.

### Response `200`

```yaml
ok: true
data:
  status: ready
  service: string
  checks:
    config_loaded: boolean
    docs_mode_known: boolean
    oidc_config_present: boolean
    openclaw_config_present: boolean
  runtime:
    environment: string
error: null
meta:
  request_id: string | null
warnings: []
```

## 2. `POST /v1/chat/respond`

### Purpose

Nhận message từ assistant và trả lại reply đã qua adapter/orchestrator.

### Request body

```yaml
message: string
session_id: string?
locale: string?
timezone: string?
attachments:
  - string
```

### Response `200`

```yaml
ok: true
data:
  session_id: string
  reply: string
  warnings:
    - string
  used_context:
    memory: boolean?
    ocr_records:
      - string
    smart_agent: boolean?
    smart_agent_result_count: number?
    user_present: boolean?
  meta:
    gateway: string?
error: null
meta:
  request_id: string | null
warnings:
  - string
```

## 3. `POST /v1/ocr/ingress`

### Purpose

Nhận raw OCR text từ frontend.

### Request body

```yaml
raw_text: string
```

### Response `200`

```yaml
ok: true
data:
  ocr_record_id: string
  status: accepted
  message: string
  meta: {}
error: null
meta:
  request_id: string | null
warnings:
  - string
```

## 4. `GET /v1/ocr/records/{ocr_record_id}`

### Purpose

Cho frontend polling trạng thái OCR record sau khi ingress.

### Path params

```yaml
ocr_record_id: string
```

### Response `200`

```yaml
ok: true
data:
  ocr_record_id: string
  status: pending_user_context | pending_backend | ready
  warnings:
    - string
  data:
    summary_text: string?
    document_type: string?
    amount_involved: number?
    institution_name: string?
    created_at: string?
error: null
meta:
  request_id: string | null
warnings:
  - string
```

## Ghi chú cho backend

### Bắt buộc

1. giữ outer envelope ổn định
2. `request_id` nên luôn có nếu được
3. `warnings` phải luôn là array
4. `reply` ở chat phải là string sẵn sàng render
5. `raw_text` ở OCR ingress chỉ là text thô, frontend chưa gửi parsed merchant/date/amount lên route này

### Không nên làm frontend phụ thuộc

- không bắt frontend đoán trạng thái từ message text
- không thay đổi shape `used_context` tùy hứng
- không trả `warnings = null`
- không bỏ `data` khỏi envelope success

## Kết luận

Nếu backend muốn làm frontend chạy ổn ở phạm vi live hiện tại, chỉ cần đảm bảo 4 route trên bám đúng summary này là đủ.
