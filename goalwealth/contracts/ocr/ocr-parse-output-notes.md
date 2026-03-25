# GoalWealth OCR Parse Output - Notes

## File
- `goalwealth/contracts/ocr/ocr-parse-output.schema.json`

## Mục đích
Schema này dùng cho bản ghi OCR sau khi:
1. frontend/OCR layer trả một JSON tối giản chỉ gồm `raw_text`
2. model/service parse raw text thành JSON chuẩn
3. validation layer kiểm tra business rules
4. kết quả được lưu vào PostgreSQL

OpenClaw không nên đọc raw OCR trực tiếp; nó nên đọc bản đã normalize/validated.

## OCR ingress decision (current)
Ở boundary đầu vào, OCR/frontend hiện được chốt theo dạng tối giản:

```json
{
  "raw_text": "..."
}
```

Điều này có nghĩa là các field như `blocks`, `raw_text_confidence`, `document_type_hint` chỉ là tùy chọn mở rộng về sau, không phải yêu cầu bắt buộc của ingress contract hiện tại.

## Các field validation quan trọng

### `is_usable`
- `true`: record có thể dùng cho downstream services
- `false`: record không nên dùng trực tiếp

### `overall_confidence`
- điểm tin cậy tổng thể của toàn record
- range: `0.0 -> 1.0`

### `normalization_confidence`
- độ tin cậy riêng của bước parse/normalize từ raw text sang structured JSON

### `manual_review_required`
- `true` nếu cần con người hoặc user xác nhận lại trước khi áp dụng vào hồ sơ tài chính

### `auto_apply_allowed`
- `true` nếu backend cho phép tự dùng record này để cập nhật financial state
- `false` nếu chỉ nên dùng để gợi ý/xin xác nhận

### `warnings`
- cảnh báo mềm
- ví dụ: thiếu một vài field phụ, số liệu hơi mơ hồ, confidence chưa cao

### `missing_fields`
- danh sách các field kỳ vọng nhưng chưa parse ra được

### `failed_rules`
- những validation/business rules bị fail
- ví dụ:
  - receipt total không khớp line items
  - opening + inflow - outflow không gần closing balance
  - gross income < net income

## Rule gợi ý theo loại document

### Receipt
- tổng line items gần bằng total_amount
- transaction_date có format hợp lệ

### Bank statement
- opening_balance + inflow - outflow gần closing_balance
- transaction_date hợp lệ
- direction của transaction hợp logic

### Salary slip
- gross_income >= net_income
- deductions không âm

### Investment statement
- quantity > 0
- market_value gần quantity * market_price nếu có đủ field

## Khuyến nghị dùng trong flow
- lưu full record vào PostgreSQL
- OpenClaw chỉ đọc normalized summary + validation outcome
- nếu `manual_review_required = true`, không nên tự động cập nhật hồ sơ tài chính
