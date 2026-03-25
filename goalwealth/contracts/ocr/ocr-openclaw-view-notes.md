# GoalWealth OCR OpenClaw View - Notes

## File
- `goalwealth/contracts/ocr/ocr-openclaw-view.schema.json`

## Mục đích
Schema này là bản rút gọn để OpenClaw đọc.

OpenClaw **không nên** đọc trực tiếp:
- raw OCR text đầy đủ
- block-level OCR noise
- parser internals

Lưu ý: OCR ingress hiện tại được chốt rất tối giản, chỉ có `raw_text`. Vì vậy việc phân loại document, parse field, confidence và validation đều thuộc lớp normalize/backend phía sau OCR, không thuộc chính OCR ingress response.

Thay vào đó, OpenClaw chỉ nên đọc:
- summary ngắn
- facts đã normalize
- confidence / warnings
- orchestration hint

## Tư duy sử dụng
Có 2 schema OCR:

### 1. Full parse schema
- `goalwealth/contracts/ocr/ocr-parse-output.schema.json`
- dùng để lưu record đầy đủ vào PostgreSQL
- phục vụ audit / debug / reprocessing

### 2. OpenClaw view schema
- `goalwealth/contracts/ocr/ocr-openclaw-view.schema.json`
- dùng để OpenClaw đọc và reasoning an toàn hơn
- tránh kéo raw OCR noise vào orchestration layer

## Các field quan trọng

### `summary_text`
- một câu/tóm tắt ngắn để OpenClaw hiểu nhanh nội dung document
- ví dụ:
  - "Sao kê MB Bank từ 2026-03-01 đến 2026-03-24, số dư cuối kỳ 15,320,000 VND, có 12 giao dịch được nhận diện."

### `usable`
- record có đủ tốt để dùng tiếp hay không

### `manual_review_required`
- nếu `true`, OpenClaw nên rất cẩn thận và không được coi record là dữ liệu chắc chắn để apply ngay

### `auto_apply_allowed`
- nếu `false`, OpenClaw có thể dùng record cho context/coaching nhưng không nên tự động cập nhật hồ sơ tài chính

### `facts.document_summary`
- thông tin tóm tắt document như institution, currency, statement period, merchant, broker...

### `facts.financial_updates`
- các financial facts chính mà downstream services có thể dùng
- ví dụ:
  - closing_balance
  - gross_income
  - transactions_count
  - transaction_candidates
  - holding_candidates

### `orchestration_hint.recommended_action`
4 action được gợi ý:
- `use_for_context_only`
- `ask_user_confirmation_before_apply`
- `manual_review_before_apply`
- `ignore_for_now`

### `orchestration_hint.safe_for_context_use`
- `true`: OpenClaw có thể dùng record để hiểu user/context
- `false`: ngay cả việc đưa vào context cũng nên tránh hoặc hạn chế

### `orchestration_hint.apply_targets`
Cho biết nếu record được apply thì nó sẽ ảnh hưởng tới phần nào:
- `cashflow`
- `income_profile`
- `expense_profile`
- `asset_snapshot`
- `liability_snapshot`
- `goal_context`
- `portfolio_snapshot`

## Khuyến nghị orchestration

### Nếu `usable=false`
- OpenClaw không nên dựa vào record này cho quyết định quan trọng
- có thể hỏi user upload lại hoặc xác nhận thủ công

### Nếu `manual_review_required=true`
- OpenClaw nên giải thích có điểm chưa chắc chắn
- nên yêu cầu xác nhận trước khi update dữ liệu tài chính

### Nếu `auto_apply_allowed=false`
- dùng để hiểu bối cảnh là được
- không tự động cập nhật state

## Rule thực dụng cho V1
- OpenClaw chỉ đọc schema view này
- PostgreSQL giữ cả full parse schema và view schema nếu muốn
- không dùng local markdown memory để thay cho structured OCR memory
