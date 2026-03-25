# GoalWealth OCR Ingress - Notes

## File
- `goalwealth/contracts/ocr/ocr-ingress.schema.json`

## Mục đích
Đây là ingress contract tối giản cho OCR/frontend.

OCR layer chỉ có trách nhiệm trả về:

```json
{
  "raw_text": "..."
}
```

## Boundary đã chốt
OCR ingress **không** chịu trách nhiệm trả về:
- document type
- confidence
- blocks
- field extraction
- validation result
- normalized financial JSON

Các bước đó thuộc lớp normalize/backend phía sau OCR.

## Flow đúng
1. OCR/frontend trả `raw_text`
2. normalization service parse `raw_text`
3. validation layer kiểm tra business rules
4. PostgreSQL lưu structured record
5. OpenClaw chỉ đọc OCR normalized/OpenClaw view

## Vì sao giữ tối giản?
- dễ thay OCR engine
- boundary rõ
- OCR không gánh logic nghiệp vụ tài chính
- backend dễ evolve mà không đổi OCR ingress contract
