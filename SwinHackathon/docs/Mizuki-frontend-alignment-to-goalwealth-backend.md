# Mizuki - Frontend Alignment Guide for GoalWealth Backend

## Mục đích
Tài liệu này dành cho team frontend `SwinHackathon/` để **bỏ bớt các assumption không còn đúng** và **chỉnh lại flow/frontend contract** theo hướng backend GoalWealth hiện tại.

Đây không phải là proposal mới.
Đây là tài liệu **alignment**: cái gì trong proposal hoặc frontend demo hiện tại còn giữ được, cái gì cần đổi, và frontend nên code theo “nguồn sự thật” nào.

---

## 0. Kết luận ngắn gọn

Nếu phải tóm tắt GoalWealth backend direction hiện tại trong 6 dòng thì là:

1. **Frontend chỉ nói chuyện với Adapter API public**, không nói chuyện trực tiếp với OpenClaw.
2. **Auth hướng Google OIDC-first**, không lấy `password grant + public client secret` làm hướng chính.
3. **OpenClaw chỉ là orchestration layer**, không phải nơi giữ business data gốc.
4. **OCR ingress từ frontend là raw_text-first**, frontend không cần parse sâu thành financial object trước.
5. **Product memory / OCR normalized data phải sống ở structured backend**, không sống trong markdown memory local hay state mơ hồ của assistant.
6. **Smart Agent / backend tools trả JSON sạch**, frontend không nên giả định agent sẽ tự ý làm side effects.

---

## 1. Nguồn sự thật kiến trúc hiện tại

Khi frontend cần quyết định “nên làm theo cái nào?”, ưu tiên theo thứ tự này:

### Ưu tiên 1 - current backend direction
- `aws-guide/goalwealth-frontend-integration-guide.md`
- `aws-guide/goalwealth-google-oidc-setup-guide.md`
- `aws-guide/goalwealth-current-architecture-diagrams.md`
- `goalwealth/contracts/api/goalwealth-adapter-public-api.openapi.yaml`

### Ưu tiên 2 - backend implementation shape hiện tại
- `goalwealth/src/adapter_api/*`
- `goalwealth/src/orchestrator_clients/*`

### Ưu tiên 3 - proposal / hackathon concept
- proposal giúp định hướng product
- **nhưng không được override current backend contract**

Nói ngắn:
**proposal là product vision, còn adapter contract + architecture docs là implementation truth hiện tại.**

---

## 2. Những chỗ proposal có thể gây frontend hiểu sai nếu bám quá chặt

Proposal có nhiều ý tốt, nhưng frontend không nên suy diễn thành implementation assumption ngay.

### 2.1. “API Gateway + Cognito (hoặc IAM)”
Trong proposal đây là một phương án hạ tầng hợp lý.

Nhưng với GoalWealth direction hiện tại, frontend nên hiểu là:
- auth public hiện đang đi theo **Google OIDC-first**
- adapter public là entrypoint thật
- backend verify token ở adapter side

## Frontend không nên assume
- app sẽ login trực tiếp theo Cognito flow ngay bây giờ
- mobile app sẽ gọi nhiều backend riêng lẻ theo từng service
- frontend được bỏ qua adapter để gọi OpenClaw/tool services

## Frontend nên assume
- frontend nhận token hợp lệ từ Google sign-in flow
- frontend gửi `Authorization: Bearer <token>` vào adapter
- adapter mới là chỗ verify và attach user context

---

### 2.2. “OCR via Textract”
Proposal nêu Textract là một lựa chọn backend/service hợp lý.

Nhưng frontend không nên hiểu thành:
- frontend phải biết Textract response shape
- frontend phải upload trực tiếp sang Textract/S3
- frontend phải parse bill thành object tài chính hoàn chỉnh trước khi gửi backend

## Backend truth hiện tại
Frontend side chỉ cần đi theo boundary này:

```json
{
  "raw_text": "..."
}
```

Tức là:
- frontend có thể OCR local
- hoặc về sau dùng camera/document service
- nhưng điểm chạm với GoalWealth adapter vẫn nên là **raw_text ingress**

## Frontend nên bỏ bớt
- assumption rằng OCR result phải gồm nhiều block/confidence/structured field mới được gửi
- assumption rằng frontend phải tự build “financial truth” từ hóa đơn

## Frontend nên giữ
- review UX
- ảnh gốc nếu cần preview cục bộ
- raw OCR text
- trạng thái scan / error / retry

---

### 2.3. “Dữ liệu: S3 (thô), Aurora/RDS, DynamoDB, OpenSearch”
Proposal mô tả một bức tranh hạ tầng rộng.

Nhưng frontend không nên couple vào bức tranh này.

## Backend truth hiện tại
Cho current scope, frontend chỉ nên biết:
- adapter public API
- response envelope chuẩn
- auth header
- chat request shape
- OCR ingress shape
- OCR record status shape

Frontend **không nên** hardcode hoặc thiết kế flow dựa trên giả định rằng:
- phải có S3 upload step mới đúng
- phải có DynamoDB session API riêng cho frontend
- phải biết OpenSearch/Aurora/Textract trực tiếp

Đó là internal backend concern.

---

### 2.4. “Agent dùng nhiều tool và giữ trạng thái”
Điểm này đúng về product vision, nhưng dễ làm frontend nghĩ rằng agent là trung tâm của tất cả state.

## Backend truth hiện tại
OpenClaw là:
- orchestration
- tool calling
- response synthesis

OpenClaw **không phải**:
- source of truth cho user financial data
- nơi frontend gửi raw OCR artifacts để lưu bừa
- nơi frontend kỳ vọng business state được giữ theo kiểu bí ẩn

## Frontend nên hiểu đúng
- user/profile/goals/risk/OCR normalized data thuộc structured backend
- assistant chat là một capability nằm trên adapter + orchestration
- “memory” phía product không đồng nghĩa với `assistantContext.memoryNotes` hay markdown memory local

---

## 3. Những thứ frontend hiện tại nên bỏ hoặc hạ ưu tiên

# A. Bỏ assumption: password grant là hướng auth chính

Hiện repo đang có:
- `services/oauth2.ts`
- `app/(auth)/signIn.tsx`
- `.env.example` có `EXPO_PUBLIC_OAUTH_CLIENT_SECRET`

## Đây là vấn đề gì?
- password grant không phải hướng mobile-safe chính cho GoalWealth hiện tại
- public env chứa client secret là sai hướng về lâu dài
- frontend đang gọi token endpoint trực tiếp theo assumption quá thấp tầng

## Team frontend nên làm gì?
- ngừng xem flow này là “target architecture”
- nếu giữ thì chỉ giữ như **temporary dev bridge**
- đánh dấu rõ trong code/docs là transitional only

## Nên thay bằng gì?
- Google OIDC-first
- adapter là public entrypoint backend
- token verification là backend concern

---

# B. Bỏ assumption: assistant chat là trung tâm giữ product memory

Hiện frontend có:
- `context/assistantContext.tsx`
- `assistantSettings.memoryNotes`
- mock thread state

Cái này dùng tốt cho UI demo, nhưng không được hiểu nhầm là product memory thật.

## Nên bỏ bớt
- việc dùng assistant local state như nguồn sự thật lâu dài cho goals/risk/profile/product memory
- assumption rằng reset assistant memory == reset product memory

## Nên giữ
- UI preferences
- temporary draft state
- thread-local UX state
- onboarding/intro flags

## Product memory thật về sau nên nằm ở đâu?
- structured backend
- memory service view
- OCR normalized records
- goal/risk/profile entities

---

# C. Bỏ assumption: frontend phải tự parse sâu receipt thành transaction truth

Hiện `receipt-scan.tsx` đã có một số heuristic như:
- đoán category
- bóc amount từ raw text
- tạo spending draft

Phần này **vẫn hữu ích cho UX review**, nhưng không nên trở thành truth layer.

## Nên giữ
- preview nhanh
- prefill nhẹ để user đỡ nhập tay
- manual correction UX

## Nên bỏ bớt
- tham vọng biến heuristic frontend thành nguồn dữ liệu chuẩn
- parse business rules ngày càng phình ở React Native layer

## Hướng đúng
- frontend tạo raw_text và local preview
- backend normalize / validate / summarize
- frontend render kết quả normalized khi backend sẵn sàng

---

# D. Bỏ assumption: assistant route group có receipt flow riêng thật

Hiện:
- `app/(assistant)/receipt-upload.tsx` redirect
- `app/(assistant)/receipt-scan.tsx` redirect
- flow thật nằm trong `/(finance)/smart-budgeting/*`

## Nên chốt rõ
assistant chỉ là launcher/deep-link cho receipt flow,
không phải một implementation flow riêng biệt nữa.

Nếu không chốt, team frontend sẽ rất dễ tiếp tục duplicate logic.

---

## 4. Những thứ frontend nên chỉnh lại để khớp backend GoalWealth

# 4.1. Chỉnh auth theo “backend-first contract”

## Target frontend contract
Frontend nên gửi:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Nếu có request tracing thì thêm:

```http
X-Request-Id: <uuid>
```

## Frontend cần đổi mindset
Không hỏi:
- “token endpoint nào cho màn sign in?”

Mà hỏi:
- “frontend cần lấy token kiểu nào để adapter verify được?”
- “frontend cần lưu session/token ra sao cho mobile-safe?”

## Cần chỉnh cụ thể
- tách auth UI khỏi low-level OAuth password implementation hiện tại
- loại bỏ `EXPO_PUBLIC_OAUTH_CLIENT_SECRET` khỏi env mẫu chính
- nếu còn `Go Home (Test)` thì phải khóa bằng dev flag rõ ràng

---

# 4.2. Chỉnh assistant từ mock engine sang adapter client

## Backend contract cần bám
`POST /v1/chat/respond`

Request body hiện tại:

```json
{
  "message": "...",
  "session_id": "optional",
  "locale": "vi-VN",
  "timezone": "Asia/Ho_Chi_Minh",
  "attachments": []
}
```

## Frontend nên làm
- tạo service layer riêng cho chat adapter
- persist `session_id` theo thread live
- gửi `timezone` thật từ device/user settings
- đọc outer envelope chuẩn `{ ok, data, error, meta, warnings }`

## Frontend không nên làm
- append hardcoded assistant reply như engine chính
- coi scenario mock là backend truth
- nuốt mất `warnings` và `meta.request_id`

## Scenario mock nên trở thành gì?
- seed prompt
- empty/demo mode
- fallback preview content

Chứ không phải “assistant runtime thật”.

---

# 4.3. Chỉnh OCR flow theo raw_text-first

## Current good news
Flow hiện tại đã gần đúng backend nhất ở điểm này.

## Frontend nên đi theo nhịp
1. user import/chụp receipt
2. frontend OCR local nếu tiện
3. frontend gửi `POST /v1/ocr/ingress` với `{ raw_text }`
4. nhận `ocr_record_id`
5. nếu cần thì gọi `GET /v1/ocr/records/{ocr_record_id}`
6. render state backend:
   - `accepted`
   - `pending_user_context`
   - `pending_backend`
   - `ready`

## Frontend nên tránh
- tự invent contract kiểu `blocks`, `confidence`, `fields`, `vendor`, `line_items` ở public adapter layer nếu backend chưa chốt
- nhồi parse logic vào mobile code vì sẽ khó maintain hơn backend nhiều

---

# 4.4. Chỉnh cách nhìn về product data vs UX draft

Frontend nên phân biệt rõ:

## UX draft state
Ví dụ:
- text đang gõ trong chat
- selected category tạm
- imported receipt preview
- intro seen flags
- current tab / current thread UI

## Product/system truth
Ví dụ:
- user profile chuẩn
- goals
- risk score / risk view
- OCR normalized result
- memory service view
- smart-agent result contracts

Rule:
**frontend state có thể nhanh, mềm, tạm; nhưng product truth phải đến từ backend contract.**

---

## 5. Response handling chuẩn frontend nên áp dụng

Frontend nên chuẩn hóa mọi adapter call theo envelope này:

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "meta": {
    "request_id": "req-123"
  },
  "warnings": []
}
```

## Rule xử lý
1. check `ok`
2. nếu `ok = false` thì đọc `error.code`, `error.message`
3. luôn giữ lại `meta.request_id`
4. `warnings` không phải crash condition, nhưng không được bỏ qua trong dev

## Vì sao quan trọng?
Vì backend GoalWealth hiện đang chủ động degrade mềm ở nhiều path:
- memory chưa sẵn
- smart agent chưa sẵn
- OCR backend chưa sẵn
- OpenClaw live path chưa fully wired

Frontend mà xử lý cứng kiểu “không có data như mong đợi = fail hẳn” thì sẽ làm UX xấu hơn thực tế.

---

## 6. Frontend checklist: giữ / sửa / bỏ

# Giữ
- UI flows đã dựng tốt cho assistant, finance, receipt review
- local OCR để lấy `raw_text`
- context/reducer cho UX state
- scenario demo làm seed/fallback
- smart budgeting receipt review experience

# Sửa
- auth direction
- assistant send behavior
- API integration layer
- request/response envelope handling
- receipt flow mapping sang adapter statuses
- dev/test bypass gating

# Bỏ hoặc hạ ưu tiên mạnh
- password grant làm đường chính
- public client secret trong Expo env chính
- frontend parse receipt sâu thành truth layer
- assistant local state như product memory thật
- duplicate receipt flow giữa assistant và finance
- assumption rằng frontend sẽ gọi trực tiếp nhiều backend/tool services ngoài adapter

---

## 7. Đề xuất file-level impact cho frontend team

## Nên sửa sớm
- `SwinHackathon/.env.example`
- `SwinHackathon/services/oauth2.ts`
- `SwinHackathon/app/(auth)/signIn.tsx`
- `SwinHackathon/context/assistantContext.tsx`
- `SwinHackathon/app/(assistant)/chat/[scenario].tsx`
- `SwinHackathon/app/(finance)/smart-budgeting/receipt-scan.tsx`
- `SwinHackathon/app/(assistant)/receipt-upload.tsx`
- `SwinHackathon/app/(assistant)/receipt-scan.tsx`

## Nên thêm mới
- `SwinHackathon/services/api/config.ts`
- `SwinHackathon/services/api/http.ts`
- `SwinHackathon/services/api/chat.ts`
- `SwinHackathon/services/api/ocr.ts`
- có thể thêm `services/auth/session.ts` hoặc tương đương

---

## 8. Thứ tự triển khai frontend nên bám

### Bước 1
Dựng lớp API foundation chung.

### Bước 2
Sửa auth theo hướng GoalWealth backend truth.

### Bước 3
Nối assistant chat thật vào adapter.

### Bước 4
Nối OCR ingress thật vào adapter.

### Bước 5
Dọn duplication giữa assistant receipt entry và finance receipt flow.

### Bước 6
Hardening + feature flags + cleanup.

---

## 9. Một câu chốt cho team frontend

Nếu cần một nguyên tắc duy nhất để khỏi lệch hướng thì dùng câu này:

> **Frontend GoalWealth không build quanh OpenClaw, Cognito, Textract hay S3 trực tiếp; frontend build quanh public adapter contract, Google OIDC auth, raw_text OCR ingress, và structured backend truth.**

Đó là hướng đúng với backend GoalWealth hiện tại.
