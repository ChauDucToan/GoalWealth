# Mizuki Batch Plan - SwinHackathon Frontend Integration (for humans)

## Mục tiêu
Đưa `SwinHackathon/` từ trạng thái **frontend mock + demo flow** sang trạng thái **frontend tích hợp được với GoalWealth adapter backend** mà không làm vỡ UX hiện tại.

Plan này được viết sau khi đọc sâu các phần quan trọng của repo, đặc biệt là:
- `app/(auth)/signIn.tsx`
- `services/oauth2.ts`
- `app/(tabs)/assistant.tsx`
- `app/(assistant)/chat/[scenario].tsx`
- `app/(finance)/smart-budgeting/add-spending.tsx`
- `app/(finance)/smart-budgeting/receipt-scan.tsx`
- `context/assistantContext.tsx`
- `context/user.reducer.ts`
- `context/user.types.ts`
- `.env.example`
- các docs assistant/auth/OCR trong `docs/`

---

## Kết luận nhanh sau khi đọc repo

### 1. Auth hiện tại đang lệch với hướng GoalWealth
Hiện frontend đang đi theo:
- `OAuth2 password grant`
- env public có cả `EXPO_PUBLIC_OAUTH_CLIENT_SECRET`
- `signIn` gọi thẳng token endpoint từ app

Trong khi hướng GoalWealth hiện tại là:
- **Google OIDC-first**
- adapter public là entrypoint chính
- mobile/public client không nên dựa vào password grant + client secret public

=> Đây là **điểm lệch kiến trúc lớn nhất**.

### 2. Assistant chat vẫn đang mock hoàn toàn
Hiện `sendAssistantMessage()` trong `context/assistantContext.tsx` chỉ:
- append user message
- append assistant reply cố định

Chưa có:
- API client cho `/v1/chat/respond`
- request lifecycle thật
- session id ổn định
- error/loading state kiểu production

=> Đây là **điểm tích hợp lớn thứ hai**.

### 3. OCR local lại đang khá hợp với backend mới
Ở `app/(finance)/smart-budgeting/receipt-scan.tsx`:
- app đã OCR local bằng ML Kit
- output local đang được gom thành `raw_text`

Đây lại khớp rất tốt với quyết định backend mới:
- OCR ingress chỉ cần `{ raw_text }`
- parse/normalize nên để backend xử lý tiếp

=> Đây là **chỗ dễ nối thật nhất**.

### 4. Repo có nhiều flow, nên không được sửa đại trà
Repo này không chỉ có auth + assistant, mà còn có:
- tabs/home/profile/news
- smart budgeting
- financial assessment
- finance subflows
- profile setup

=> Nếu sửa không chia batch nhỏ, rất dễ bị vỡ điều hướng/state.

---

## Em đề xuất thứ tự làm

# Batch 1 - dựng lớp integration foundation

## Mục tiêu
Tạo lớp gọi API chung để frontend không còn gọi lung tung từng màn.

## Làm gì
- tạo `services/api/` hoặc `lib/api/`
- thêm config env cho adapter base URL
- thêm HTTP wrapper chung
- normalize response envelope `{ ok, data, error, meta, warnings }`
- gắn `Authorization` nếu đã có token
- giữ chỗ cho `X-Request-Id` / debug meta nếu cần

## Vì sao làm trước
Nếu chưa có lớp này mà nối thẳng từ từng screen:
- auth sẽ viết 1 kiểu
- assistant sẽ viết 1 kiểu
- OCR sẽ viết 1 kiểu
- debug rất mệt

## Output mong đợi
Frontend có một chỗ chuẩn để gọi:
- `chat.respond(...)`
- `ocr.ingest(...)`
- `ocr.getRecord(...)`
- về sau có thể thêm profile/me/preferences

---

# Batch 2 - sửa auth theo hướng đúng kiến trúc

## Mục tiêu
Bỏ dần hướng password grant public-client, thay bằng flow phù hợp hơn với GoalWealth.

## Thực tế đọc từ repo
Hiện có mấy vấn đề:
- `.env.example` có `EXPO_PUBLIC_OAUTH_CLIENT_SECRET`
- `services/oauth2.ts` gọi token endpoint trực tiếp từ mobile app
- `signIn.tsx` còn nút `Go Home (Test)`
- token hiện chỉ nằm trong reducer memory, chưa có persistence an toàn

## Hướng làm practical
### Giai đoạn A - bridge để dev nhanh
- vẫn cho app sign in được theo mode dev/backend bridge
- nhưng phải dồn logic auth về service layer chuẩn hơn
- thêm session bootstrap + sign out sạch

### Giai đoạn B - auth đúng hướng product
- chuyển sang Google OIDC/mobile-safe flow
- không để `client_secret` ở `EXPO_PUBLIC_*`
- adapter/backend mới là nơi verify token rõ ràng
- app chỉ giữ access token/id token đúng vai trò mobile client

## Output mong đợi
- bỏ phụ thuộc vào password grant như flow chính
- có session state rõ hơn
- bỏ hoặc khóa `Go Home (Test)` bằng dev flag

---

# Batch 3 - nối assistant chat thật vào adapter

## Mục tiêu
Biến assistant từ mock demo thành chat client thật.

## Thực tế hiện tại
- `app/(tabs)/assistant.tsx` là inbox/entry tốt rồi
- `app/(assistant)/chat/[scenario].tsx` có UI chat usable rồi
- nhưng `assistantContext` vẫn chỉ mock reply

## Hướng làm
- tạo assistant API service gọi `POST /v1/chat/respond`
- gửi lên:
  - `message`
  - `session_id`
  - `timezone`
  - `attachments` nếu có
- giữ scenario/demo data làm seed/fallback chứ không để là engine chính
- thêm state:
  - sending
  - error
  - retry
  - current session id
- render warnings/diagnostics nhẹ nhàng trong UI dev nếu cần

## Output mong đợi
- chat thật trả lời từ adapter/OpenClaw path
- session thread ổn định hơn
- mock scenario vẫn dùng được cho empty/demo mode

---

# Batch 4 - nối receipt OCR flow thật vào adapter

## Mục tiêu
Tận dụng OCR local đang có, nhưng đưa OCR ingress/record lifecycle về GoalWealth backend shape.

## Điểm hay của repo hiện tại
`app/(finance)/smart-budgeting/receipt-scan.tsx` đã:
- lấy ảnh
- chạy ML Kit local
- có `ocrRawText`
- có `ocrStatus`
- có `ocrError`

Cái này rất hợp với backend hiện tại.

## Hướng làm
- giữ OCR local để ra `raw_text`
- sau đó gọi `POST /v1/ocr/ingress` với `{ raw_text }`
- lưu `ocr_record_id`
- nếu cần thì gọi `GET /v1/ocr/records/{ocr_record_id}` để lấy normalized/openclaw view
- map các trạng thái backend vào UI:
  - `accepted`
  - `pending_user_context`
  - `pending_backend`
  - `ready`
- không nhét parse business logic phức tạp tiếp vào frontend nữa

## Output mong đợi
Frontend chỉ làm:
- import ảnh
- OCR local raw_text
- gửi raw_text lên backend
- review + confirm

Backend làm tiếp normalize/structured interpretation.

---

# Batch 5 - hợp nhất assistant receipt entry với finance receipt flow

## Mục tiêu
Giảm duplication giữa assistant routes và finance routes.

## Em thấy hiện tại
- `app/(assistant)/receipt-upload.tsx` chỉ redirect
- `app/(assistant)/receipt-scan.tsx` chỉ redirect
- flow receipt thật nằm ở `/(finance)/smart-budgeting/*`

## Hướng làm
- chốt 1 flow thật duy nhất cho receipt import
- assistant entry chỉ là deep-link/launcher vào flow đó
- khi hoàn tất, quyết định rõ return target:
  - về assistant thread
  - hoặc về add transaction

## Output mong đợi
Không còn cảm giác “assistant có receipt flow riêng nhưng thật ra redirect vòng”.

---

# Batch 6 - hardening + cleanup trước khi coi là integration usable

## Mục tiêu
Làm app bớt demo-ish.

## Làm gì
- secure/persist auth state tử tế
- env docs rõ ràng hơn
- bỏ public client secret khỏi docs/env mẫu
- thêm offline/timeout/error messaging đủ dùng
- audit lại các màn đang dùng data mock nhưng trông như data thật
- thêm feature flags:
  - mock assistant on/off
  - mock auth bypass on/off
  - OCR backend integration on/off

## Output mong đợi
App có thể chạy theo 2 mode rõ ràng:
- demo/mock mode
- integrated/dev mode

---

## Thứ tự em khuyên chốt với anh
Nếu anh muốn vừa practical vừa ít risk, em khuyên thứ tự là:

1. **Batch 1 - integration foundation**
2. **Batch 2 - auth correction / bridge**
3. **Batch 3 - assistant chat live**
4. **Batch 4 - OCR ingress live**
5. **Batch 5 - unify receipt entry**
6. **Batch 6 - hardening**

---

## Batch nào đáng làm ngay nhất?
Nếu hỏi em chọn đúng 1 batch để bắt đầu code ngay, em chọn:

## **Batch 1 + Batch 2 trước**
Vì:
- auth hiện tại đang lệch kiến trúc nhất
- nếu chưa có API foundation thì chat/OCR sẽ nối kiểu chắp vá

Còn nếu anh muốn “thấy kết quả nhanh” thì:
- **Batch 3 hoặc Batch 4** sẽ nhìn wow hơn
- nhưng về nền móng thì vẫn nên có Batch 1 trước

---

## Rủi ro cần nhớ
- Không nên tiếp tục xem `OAuth2 password grant + EXPO_PUBLIC client secret` là hướng chính
- Không nên cho assistant screen tự phát minh request shape khác adapter contract
- Không nên để frontend parse sâu OCR business logic nếu backend đã chốt raw_text-only ingress
- Không nên sửa đồng loạt nhiều route group trong cùng một batch

---

## Kết luận của em
Repo `SwinHackathon` hiện tại **khá tốt cho việc nối thật theo từng nhịp nhỏ**, vì:
- UI/flow đã dựng nhiều rồi
- assistant UI usable rồi
- OCR local đã có rồi
- state layer cũng không quá tệ

Nhưng để nối GoalWealth đúng hướng, phải chốt lại 3 thứ:
- **auth đúng kiến trúc**
- **assistant có API client thật**
- **OCR raw_text gửi lên backend thay vì parse sâu ở frontend**

Nếu anh muốn, bước sau em có thể viết tiếp một bản:
- **implementation map theo từng file cụ thể trong SwinHackathon**
- tức là mỗi batch sẽ liệt kê file nào tạo mới, file nào sửa, file nào không được đụng.
