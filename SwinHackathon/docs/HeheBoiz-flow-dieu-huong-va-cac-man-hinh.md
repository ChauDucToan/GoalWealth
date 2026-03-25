# HeheBoiz - Flow Điều Hướng Và Các Màn Hình

## 1. Mục tiêu của tài liệu

Tài liệu này mô tả app theo góc nhìn “người dùng đi từ đâu sang đâu”, thay vì theo góc nhìn kiến trúc code.

Mục tiêu:

- Hiểu luồng vào app.
- Hiểu tuyến chính từ `welcome` sang `auth`, từ `auth` sang `tabs`.
- Hiểu các đường đi quan trọng từ `home` sang `finance`, `assistant`, `community/news`.
- Ghi rõ các flow mới như `Subscription Management`.

## 2. Luồng khởi động app

### 2.1. `app/index.tsx`

Đây là entry screen đầu tiên khi app mở.

Luồng hiển thị:

1. splash
2. progress
3. photo
4. message
5. `router.replace('/welcome')`

Ý nghĩa:

- App không nhảy thẳng vào login.
- Có một lớp loading/branding intro trước khi vào `welcome`.

## 3. Luồng `welcome`

### 3.1. Vai trò của `app/welcome.tsx`

Màn này là landing/onboarding screen.

Chức năng:

- giới thiệu visual và concept của app
- làm cầu nối từ intro/loading sang auth

### 3.2. Điều hướng nổi bật

Theo source hiện tại:

- có điều hướng sang `/(auth)/signUp`
- có điều hướng sang `/(auth)/signIn`

Ý nghĩa:

- `welcome` là nơi người dùng chọn vào `sign in` hoặc `sign up`

## 4. Luồng `auth`

### 4.1. `signIn`

File:

- `app/(auth)/signIn.tsx`

Flow chính:

1. nhập email
2. nhập password
3. kiểm tra env OAuth2
4. gọi `signInWithOAuth2Password(...)`
5. thành công thì `router.replace('/(tabs)/home')`

Các đường đi phụ:

- `Create New Account` -> `/(auth)/signUp`
- `Forgot Password` -> `/(auth)/forgetPassword`
- `Go Home (Test)` -> `/(tabs)/home`

Ý nghĩa:

- Ngoài luồng OAuth2 chính, màn sign-in còn có test path để vào nhanh home.

### 4.2. `signUp`

Vai trò:

- màn tạo tài khoản mới

### 4.3. `forgetPassword` và `passwordResent`

Vai trò:

- xử lý nhánh quên mật khẩu / xác nhận đã gửi yêu cầu reset

## 5. Luồng chính sau khi vào app: `(tabs)`

Sau khi đăng nhập hoặc đi bằng đường test, app vào:

- `/(tabs)/home`

Các tab hiện có:

1. `home`
2. `transactions`
3. `achievements`
4. `news-resources`
5. `search-notifications`
6. `insights`
7. `assistant`
8. `profile`

## 6. Flow từ `home`

### 6.1. Vai trò của `home`

`app/(tabs)/home.tsx` đang là dashboard trung tâm.

Từ màn này, người dùng có thể đi sang rất nhiều flow khác.

### 6.2. Quick actions

Theo source hiện tại:

- `send` -> `/(finance)/send-money`
- `budget` -> `/(finance)/categories`
- `request` -> `/(finance)/add-transaction`
- `receipt` (label `Bills`) -> `/(finance)/subscriptions`

Lưu ý:

- `Bills` hiện không còn đi về transactions chung.
- Nó đã được nối sang flow `Subscription Management`.

### 6.3. Các đường đi khác từ home

Một số đường đi nổi bật:

- profile -> `/(tabs)/profile`
- transactions -> `/(tabs)/transactions`
- insights -> `/(tabs)/insights`
- investments -> `/(finance)/investments`
- buy stock -> `/(finance)/buy-stock`
- stock detail -> `/(finance)/stock/[symbol]`
- transaction detail -> `/(finance)/transaction/[id]`

Ý nghĩa:

- `home` là hub điều hướng lớn nhất của app.

## 7. Flow `transactions`

Nhóm flow này trải giữa tab và route con trong `(finance)`.

Luồng phổ biến:

1. vào `/(tabs)/transactions`
2. mở transaction detail `/(finance)/transaction/[id]`
3. có thể đi tiếp sang:
   - search transactions
   - filters
   - split payment
   - ignore transaction
   - merchant detail/edit
   - add note
   - set recurring
   - date range

Ý nghĩa:

- Flow transaction hiện khá đầy đủ ở mức frontend prototype.

## 8. Flow `investments`

Các điểm vào:

- từ `home`
- từ các màn finance liên quan

Các màn chính:

- `/(finance)/investments`
- `/(finance)/stock/[symbol]`
- `/(finance)/buy-stock`

Các mục đích:

- xem portfolio
- xem watchlist
- xem chi tiết cổ phiếu
- mua cổ phiếu mô phỏng

## 9. Flow `AI Assistant`

### 9.1. Điểm vào chính

Tab:

- `/(tabs)/assistant`

### 9.2. Những đường đi từ tab assistant

Theo source:

- mở settings -> `/(assistant)/settings`
- mở upgrade -> `/(assistant)/upgrade`
- mở các scenario chat -> `/(assistant)/chat/[scenario]`
- mở receipt tools
- mở voice tools

### 9.3. Receipt flow

Điểm vào:

- `/(assistant)/receipt-upload`

Các đường đi nổi bật:

- `Start demo scan` -> `/(assistant)/receipt-scan`
- các source tile cũng đẩy sang `receipt-scan`
- `Use demo result` -> thay scenario assistant rồi `router.replace('/(assistant)/chat/[scenario]')`

Ý nghĩa:

- Receipt flow được thiết kế để vừa có demo scan, vừa có đường gửi kết quả về chat assistant.

### 9.4. Voice flow

Điểm vào:

- `/(assistant)/voice`

Vai trò:

- mô phỏng tương tác voice assistant
- có điều hướng quay lại chat/scenario sau khi chọn hành động tương ứng

### 9.5. Các màn phụ của assistant

- `out-of-tokens`
- `reset-memory`
- `settings`
- `upgrade`

Ý nghĩa:

- Flow assistant không chỉ có chat mà còn có trạng thái plan, memory và giới hạn sử dụng.

## 10. Flow `News & Resources` và `Finance Community`

### 10.1. Trạng thái hiện tại của tab root

File:

- `app/(tabs)/news-resources.tsx`

Theo source hiện tại:

- tab này đang render `Finance Community`
- không còn là news landing kiểu cũ ở root tab

### 10.2. Flow community hiện tại

Trong tab root hiện có các stage:

- landing
- rules
- feed

Ngoài ra có điều hướng sang các màn:

- `community-filter-posts`
- `community-chat`
- `community-delete-post`
- `community-post-success`
- `community-guidelines`

### 10.3. News screens cũ vẫn còn

Các màn vẫn còn trong repo:

- `news-resources-articles`
- `news-resources-article-detail`
- `news-resources-workshops`
- `news-resources-workshop-detail`
- `news-resources-instructor`

Điều này có nghĩa:

- code news cũ chưa bị xóa
- nhưng entry từ tab đang không mở vào news cũ nữa

## 11. Flow `Profile`, `Achievements`, `Search & Notifications`, `Insights`

### 11.1. `profile`

- là tab riêng
- đóng vai trò màn thông tin người dùng / cài đặt cá nhân

### 11.2. `achievements`

- là tab riêng
- phục vụ hiển thị thành tích/tiến độ kiểu gamification

### 11.3. `search-notifications`

- là tab riêng
- có quy mô màn lớn
- mang tính utility / discovery / alerts

### 11.4. `insights`

- là tab riêng
- phục vụ phân tích, thống kê, summary dữ liệu tài chính

## 12. Flow `Subscription Management`

Đây là flow mới hiện đang nằm ở worktree.

### 12.1. Điểm vào

Từ `home`:

- quick action `Bills` -> `/(finance)/subscriptions`

### 12.2. Flow hiện tại

1. `subscriptions` - intro landing lần đầu, sau đó là overview
2. `subscription/[id]` - detail
3. `subscription-add` - add/edit
4. `subscription-upcoming` - renewal timeline
5. `subscription-payments` - payment history
6. `subscription-history` - tracked plans history
7. `subscription-stats` - overview stats
8. `subscription-confirm` - confirm pause / activate / cancel
9. `subscription-result` - result state

### 12.3. Các đường đi chính

Từ overview:

- `Add Plan` -> `subscription-add`
- `Open Plan` -> `subscription/[id]` ở chế độ chọn plan
- bấm vào từng subscription -> `subscription/[id]`
- `Upcoming renewals` -> `subscription-upcoming`
- `Recent payments` -> `subscription-payments`
- `History` -> `subscription-history`
- `Stats` -> `subscription-stats`

Lần đầu mở `subscriptions`:

- route sẽ hiện intro landing trước
- sau khi chọn CTA hoặc skip, intro được đánh dấu là đã xem trong phiên chạy hiện tại

Từ detail:

- `Change Plan` -> `subscription-add?preset=...`
- `Pause Subscription` hoặc `Activate Again` -> `subscription-confirm`
- `Cancel Subscription` -> `subscription-confirm`

Từ add/edit:

- `Save Plan` hoặc `Save Changes` -> `subscription-result`
- `Cancel` -> quay lại màn trước

Lưu ý:

- Đã thử một flow wizard `subscription-create/*` nhiều bước cho `Add Plan`.
- Flow đó đã được gỡ bỏ để quay về một màn `subscription-add` duy nhất, thân thiện hơn trên mobile và ít thao tác hơn.

Từ result:

- `Open Details` -> `subscription/[id]`
- `Back to subscriptions` -> `subscriptions`
- `Add another subscription` -> `subscription-add`

## 13. Kết luận ngắn cho phần flow

Nếu nhìn app dưới góc độ điều hướng, hiện có thể chia ra 5 tuyến sử dụng lớn:

1. tuyến intro/welcome/auth
2. tuyến dashboard + tabs
3. tuyến finance chi tiết
4. tuyến assistant chi tiết
5. tuyến news/community

Flow subscription mới đang nằm trong tuyến finance và đã được nối trực tiếp từ dashboard `home`.
