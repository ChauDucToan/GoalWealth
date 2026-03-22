# Kha - File By File Reference Cho Các Hạng Mục Đã Triển Khai

## 1. Mục tiêu của tài liệu

Tài liệu này dùng để tra cứu nhanh theo kiểu:

- file nào đã được đụng tới
- file đó giữ vai trò gì
- đã thay đổi hoặc mở rộng ở điểm nào
- về sau nếu cần sửa tiếp thì nên đọc file nào trước

Đây là tài liệu bổ sung cho các file `Kha-*` khác. Nếu các file kia mô tả theo nhóm tính năng hoặc phương pháp, thì file này mô tả theo từng file source quan trọng.

## 2. Nhóm `(tabs)`

### 2.1. `app/(tabs)/_layout.tsx`

Vai trò:

- khai báo các tab chính của app
- bọc `Tabs` bằng custom tab bar `AppTabBar`

Ý nghĩa trong đợt triển khai này:

- là điểm tham chiếu khi cần xác định bottom tab còn hay mất ở từng flow
- là nơi xác nhận chính xác những tab nào đang thuộc bottom tab navigator

### 2.2. `app/(tabs)/profile.tsx`

Vai trò:

- màn `Profile Settings`

Những gì đã được làm:

- dựng giao diện profile/settings theo ảnh thiết kế
- nhóm các mục theo section
- có item row, switch, danger zone
- chỉnh lại màu để dùng `constants/theme.ts`
- căn chỉnh lại alignment của text/icon trong `section.items`

Khi sửa tiếp nên chú ý:

- đây là màn khá nhạy với alignment row
- nếu thay icon size hoặc padding, cần test lại row có switch và row có arrow

### 2.3. `app/(tabs)/insights.tsx`

Vai trò:

- tab `Insights`
- đồng thời từng được dùng để render `Utility & Helper`

Những gì đã được làm:

- dựng các utility states theo UI kit
- sau đó đổi lại hành vi để chỉ hiện utility state khi có `issue`
- nối một số CTA sang `Smart Budgeting`

Khi sửa tiếp nên chú ý:

- tránh để nó quay lại kiểu demo luôn-hiện mọi state
- nếu nối với network state thật thì giữ cùng interface `issue` để giảm chi phí refactor

### 2.4. `app/(tabs)/achievements.tsx`

Vai trò:

- màn `Achievements`

Những gì đã được làm:

- dựng 3 segment `Badges / Leaderboard / Stats`
- đổi từ segment tĩnh sang nội dung thay đổi thật
- đồng bộ lại header/back theo cùng pattern với các màn khác

Khi sửa tiếp nên chú ý:

- file này đã từng có warning biến unused
- nếu tiếp tục mở rộng, nên tách view theo từng segment thay vì tăng một file lớn quá mức

### 2.5. `app/(tabs)/search-notifications.tsx`

Vai trò:

- tổng hợp flow `Search & Notifications`

Những gì đã được làm:

- dựng nhiều state khác nhau trong một flow
- sửa lỗi title/input bị che
- tăng font-size categories và chip labels

Khi sửa tiếp nên chú ý:

- file này phù hợp để tách component nếu tiếp tục mở rộng
- phần category/suggestion đang là nơi dễ phát sinh lệch layout khi đổi typography

### 2.6. `app/(tabs)/transactions.tsx`

Vai trò:

- tab transactions
- nơi chứa `Add transaction` action và modal nhập transaction

Những gì đã được làm:

- bỏ shadow của nút add
- đổi nút thành FAB dấu `+`
- chỉnh vị trí nút để tránh bottom tab
- sửa modal để kéo, cuộn và đóng tốt hơn

Khi sửa tiếp nên chú ý:

- phần modal/keyboard và gesture là nơi dễ vỡ UX nhất
- nếu modal này còn lớn lên, nên cân nhắc tách thành component riêng

### 2.7. `app/(tabs)/assistant.tsx`

Vai trò:

- tab root của assistant

Những gì đã được làm:

- sửa khoảng chừa đáy để nút cuối không bị bottom tab che
- sửa phần return thứ hai để cuộn cuối không bị bottom tab đè
- là entry mở sang các màn trong `(assistant)`

Khi sửa tiếp nên chú ý:

- đây là màn chịu ảnh hưởng trực tiếp từ bottom tab height và safe area
- nếu tiếp tục thêm block ở cuối màn thì nên giữ dynamic padding theo insets

### 2.8. `app/(tabs)/news-resources.tsx`

Vai trò:

- tab root của `News & Resources` / `Finance Community`

Những gì đã được làm:

- từng được refactor qua nhiều giai đoạn
- sửa title/notch
- sửa nút `Add New Post` thành FAB dấu `+`
- sửa lỗi style đang gọi `colors` sai scope

Khi sửa tiếp nên chú ý:

- đây là file đã trải qua nhiều lần đổi cấu trúc route xung quanh nó
- nếu muốn chỉnh điều hướng, nên kiểm tra cùng nhóm `(news-resources)` chứ không chỉ sửa file root

## 3. Nhóm `(news-resources)`

### 3.1. `app/(news-resources)/_layout.tsx`

Vai trò:

- route group cho các màn phụ của news/community

Ý nghĩa:

- là mốc phân tách giữa tab root và các màn con có stack riêng

### 3.2. `news-resources-articles.tsx`, `news-resources-workshops.tsx`, `news-resources-article-detail.tsx`, `news-resources-workshop-detail.tsx`, `news-resources-instructor.tsx`

Vai trò:

- các màn bài viết, workshop, detail và instructor

Những gì đã được làm:

- dựng route thật thay cho multi-state demo ban đầu
- đồng bộ header/back
- sửa safe area cho notch
- cập nhật path và import khi cấu trúc route thay đổi

### 3.3. `community-chat.tsx`, `community-delete-post.tsx`, `community-filter-posts.tsx`, `community-guidelines.tsx`, `community-post-success.tsx`

Vai trò:

- các nhánh phụ của finance community

Ý nghĩa:

- cho thấy module này đã đi xa hơn mức “news reader” đơn thuần, mà có cả community behaviors

## 4. Nhóm `(assistant)`

### 4.1. `app/(assistant)/chat/[scenario].tsx`

Vai trò:

- màn chat chi tiết theo scenario

Những gì đã được làm:

- sửa focus input
- sửa keyboard che input
- sửa khoảng trắng thừa sau khi đóng keyboard
- điều chỉnh composer và scroll behavior

Khi sửa tiếp nên chú ý:

- đây là file nhạy với mobile runtime hơn là static UI
- mọi thay đổi về dock/composer nên test với keyboard thật

### 4.2. `app/(assistant)/settings.tsx`, `upgrade.tsx`, `voice.tsx`, `receipt-scan.tsx`, `receipt-upload.tsx`, `reset-memory.tsx`, `out-of-tokens.tsx`

Vai trò:

- các màn phụ của assistant

Ý nghĩa trong đợt triển khai này:

- chủ yếu là điểm điều hướng liên quan khi phân tích assistant flow và bottom tab behavior

## 5. Nhóm auth và state

### 5.1. `app/(auth)/signIn.tsx`

Vai trò:

- màn sign in chính

Những gì đã được làm:

- nối OAuth2 theo hướng service layer
- kiểm tra env bắt buộc
- thêm nút `Go Home (Test)`

### 5.2. `services/oauth2.ts`

Vai trò:

- tách logic OAuth2 khỏi UI screen

Ý nghĩa:

- giúp `signIn` đỡ phình logic gọi API hoặc validate env

### 5.3. `context/user.types.ts`, `context/user.reducer.ts`, `context/myUserContext.ts`

Vai trò:

- tầng user state theo reducer

Những gì đã được làm:

- định nghĩa action/payload rõ hơn
- tạo reducer typed hơn
- giữ provider/hook cho toàn app

## 6. Nhóm `Smart Budgeting`

### 6.1. `app/(finance)/smart-budgeting/_layout.tsx`

Vai trò:

- bọc toàn module bằng provider riêng

Ý nghĩa:

- là điểm then chốt để state setup/receipt/budget được chia sẻ giữa nhiều màn

### 6.2. `app/(finance)/smart-budgeting/_data.ts`

Vai trò:

- chứa mock data, setup steps, category data, receipt presets

Ý nghĩa:

- là nguồn data-driven cho gần như toàn bộ module
- giúp tách UI khỏi dữ liệu cứng nhét trong từng screen

### 6.3. `context/smartBudgetingContext.tsx`

Vai trò:

- state nội bộ của module

Các state/hành vi chính:

- `hasCompletedSetup`
- `activeReceiptDraft`
- `importedReceipts`
- mutate category spend
- complete setup
- confirm receipt import

### 6.4. `hooks/use-smart-budgeting.tsx`

Vai trò:

- hook truy cập context

Ý nghĩa:

- giữ API dùng trong screen gọn hơn
- tránh import context trực tiếp ở khắp nơi

### 6.5. `app/(finance)/smart-budgeting/index.tsx`

Vai trò:

- hub chính của module

Những gì đã được làm:

- đổi CTA theo `hasCompletedSetup`
- phân biệt onboarding mode và operational mode
- giữ các quick destinations đi vào từng flow con

### 6.6. `setup/index.tsx` và `setup/[step].tsx`

Vai trò:

- intro setup và chuỗi câu hỏi chính

Những gì đã được làm:

- setup step flow data-driven
- reset option state theo từng step
- sau khi setup hoàn tất thì intro đổi nội dung, không tiếp tục rủ onboarding lại

### 6.7. `setup/categories-members.tsx`, `amount.tsx`, `review-period.tsx`, `start-date.tsx`

Vai trò:

- các bước setup quan trọng thực tế hơn

Những gì đã được làm:

- number stepper/preset
- nhập budget amount
- chọn review period
- chọn start date
- sửa lỗi key trùng ở weekday/start date

### 6.8. `setup/budget-generated.tsx`

Vai trò:

- success screen của setup
- đánh dấu setup hoàn tất

Những gì đã được làm:

- chuyển từ hướng ép sang receipt thành 2 CTA rõ ràng:
  - `Open Monthly Budget`
  - `Import Receipt`

### 6.9. `setup/receipt-gallery.tsx`, `receipt-scan.tsx`, `receipt-processing.tsx`, `receipt-review.tsx`

Vai trò:

- flow import receipt

Những gì đã được làm:

- chọn preset receipt
- tạo active draft
- processing
- review trước khi apply
- commit spending vào category budget

### 6.10. `monthly-budget.tsx`

Vai trò:

- workspace chính sau setup

Những gì đã được làm:

- đọc state thật từ smart budgeting context
- hiện latest import
- cập nhật category status theo dữ liệu đã apply
- custom back về hub của module

### 6.11. `budget-insights.tsx`

Vai trò:

- màn analytics/insights của smart budgeting

Những gì đã được làm:

- nâng từ layout đơn giản thành màn insight mạnh hơn
- hero forecast
- weekly trend
- KPI row
- category pressure section
- recommended moves và CTA cuối màn

## 7. Kết luận

Nếu cần hiểu nhanh “file nào giữ trách nhiệm gì” trong đợt triển khai này, file reference này là điểm vào phù hợp nhất.

Nếu cần hiểu sâu hơn về một module cụ thể, nên đọc cùng các file:

- `Kha-tabs-community-va-cac-man-ui-theo-design.md`
- `Kha-assistant-auth-state-va-cac-fix-hanh-vi.md`
- `Kha-smart-budgeting-va-receipt-flow.md`
