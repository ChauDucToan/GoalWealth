# Kha - Phương Pháp Triển Khai Và Nguyên Tắc Thực Thi

## 1. Mục tiêu của tài liệu

Tài liệu này không mô tả từng màn riêng lẻ, mà mô tả cách công việc đã được triển khai trong suốt đợt làm việc này.

Mục tiêu:

- giải thích tư duy triển khai
- nêu rõ các pattern đã lặp lại trong code
- chỉ ra vì sao một số quyết định được chọn
- giúp người phát triển tiếp theo giữ được cùng chuẩn thực thi

## 2. Nguyên tắc số 1: bám source hiện có của app

Một nguyên tắc nhất quán trong đợt triển khai này là:

- không dựng màn mới theo kiểu “sống riêng”
- phải gắn vào architecture hiện có của repo

Điều này thể hiện ở các điểm:

- dùng `Expo Router` route groups hiện tại
- dùng `ThemeProvider` và `constants/theme.ts`
- dùng scaffold dùng chung như `FinanceScreen`, `FinanceCard`, `AssistantScaffold`
- nối vào các entry point đã có như `home`, `tabs`, `assistant`, `finance`

## 3. Nguyên tắc số 2: không phá theme hiện có

Một yêu cầu quan trọng đã lặp lại nhiều lần là:

- không được sửa màu trong `constants/theme.ts`

Do đó cách làm phù hợp là:

- thay màu hardcode trong screen bằng `useTheme().colors`
- khi cần alpha thì dùng `hexToRgba(...)`
- khi `StyleSheet` cần truy cập màu theme thì chuyển sang `createStyles(colors)`

Lợi ích:

- không làm app lệch palette chung
- các màn mới hòa vào hệ UI hiện có
- về sau dễ đổi palette tập trung hơn

## 4. Nguyên tắc số 3: UI kit nhiều state thì không nên để nguyên kiểu demo mãi mãi

Nhiều ảnh thiết kế trong bộ `finpal` thực chất là:

- một màn hình với nhiều trạng thái song song
- hoặc một flow dài trải trên nhiều artboard

Nếu dựng y nguyên thành một màn demo thì có lợi cho việc xem nhanh, nhưng không tốt cho app thật.

Vì vậy đã có hai kiểu triển khai khác nhau tùy bài toán:

### 4.1. Kiểu demo state-driven

Dùng khi:

- cần xem nhanh nhiều trạng thái trong một màn
- hoặc chưa đủ ngữ cảnh để tách thành flow thật

Ví dụ ban đầu của:

- `Utility & Helper`
- `Search & Notifications`
- `News & Resources`

### 4.2. Kiểu route-driven

Dùng khi:

- flow đã đủ lớn
- user cần navigate thật
- có state hoặc context đi kèm

Ví dụ:

- `News & Resources` sau refactor
- `Smart Budgeting`
- receipt flow

## 5. Nguyên tắc số 4: ưu tiên sửa đúng vấn đề UX thực tế

Nhiều việc trong đợt này đến từ phản hồi test, ví dụ:

- keyboard che input
- bottom tab che button
- header dính notch
- modal không kéo được
- nội dung cuộn xuống cuối bị tab bar che

Những việc này được xử lý theo tư duy:

1. xác định đúng lớp gây lỗi
2. sửa ở lớp đó, không vá bằng workaround tạm bợ nếu tránh được

Ví dụ:

- lỗi keyboard thường sửa ở `KeyboardAvoidingView`, scroll, dock placement
- lỗi bottom tab thường sửa bằng padding/insets hoặc cấu trúc navigator
- lỗi notch thường sửa bằng `SafeAreaView` và spacing top hợp lý

## 6. Nguyên tắc số 5: khi flow lớn lên thì tách state theo domain

Một bài học rõ nhất đến từ `Smart Budgeting`.

Nếu tất cả chỉ là UI tĩnh thì mỗi màn có thể tự sống bằng local state.
Nhưng khi cần:

- setup complete
- receipt import
- apply receipt vào budget
- monthly budget phản ánh số mới
- insights phản ánh theo state hiện tại

thì local state rời rạc không còn đủ.

Do đó đã chọn cách:

- tạo `SmartBudgetingContext`
- tạo hook `useSmartBudgeting()`
- bọc provider ngay trong route group của module

Đây là hướng vừa đủ:

- không kéo state này lên global toàn app khi chưa cần
- nhưng đủ chia sẻ cho toàn bộ module

## 7. Nguyên tắc số 6: route structure phải phục vụ UX thật, không chỉ đẹp về cây thư mục

Một số điều chỉnh ở `news-resources` cho thấy một thực tế:

- route tree “đẹp” chưa chắc cho UX đúng
- bottom tab là một phần của navigator, không phải chỉ là một component UI

Do đó khi xử lý route, cần cân nhắc đồng thời:

- user có cần giữ bottom tab không
- screen đó có nên ở trong tab navigator không
- có cần group riêng không
- folder có quá lặp hoặc quá sâu không

Từ đó mới chọn cấu trúc phù hợp.

## 8. Nguyên tắc số 7: refactor theo phản hồi, không cố bảo vệ bản dựng đầu tiên

Trong đợt này có nhiều màn đã phải đi qua vài vòng chỉnh:

- `News & Resources`
- `Assistant chat`
- `Smart Budgeting setup`
- `Budget Insights`

Điều này là bình thường.

Cách làm đã áp dụng là:

- dựng bản đầu để có thứ test được
- nghe feedback cụ thể
- chỉnh luồng, bố cục, route hoặc state theo feedback đó
- không cố giữ cấu trúc cũ nếu nó không còn phù hợp

## 9. Cách kiểm tra sau mỗi đợt sửa

Kiểm tra được thực hiện theo hai lớp:

### 9.1. Kiểm tra cấu trúc code

- đọc lại file đã sửa
- rà chỗ route push/replace
- rà scope dùng `colors`
- rà warning như duplicate key, unused vars, wrong style scope

### 9.2. Kiểm tra công cụ

Trong nhiều bước đã chạy:

- `npm run lint -- --no-cache`

Mục tiêu:

- tránh để các refactor UI nhỏ tạo warning/error không đáng có
- giữ worktree đủ sạch để tiếp tục phát triển

## 10. Những pattern kỹ thuật đã dùng lặp lại

### 10.1. `createStyles(colors)`

Dùng khi screen cần theme-aware styles.

### 10.2. `hexToRgba(...)`

Dùng để tạo background nhẹ, border alpha, badge tone.

### 10.3. Data-driven arrays

Dùng cho:

- quick actions
- state presets
- category lists
- alert lists
- segmented content
- mock receipt presets

### 10.4. Domain scaffold

Dùng để các màn cùng domain có header/spacing/visual nhất quán.

### 10.5. Route alias hoặc entry duplication có kiểm soát

Một số nơi thêm route trung gian hoặc alias để:

- giữ path đang dùng không bị gãy
- chuyển dần sang cấu trúc mới mà vẫn test được

## 11. Kết luận

Cách triển khai trong đợt này có thể tóm gọn như sau:

- dựng nhanh để có thứ test
- refactor khi flow đủ lớn
- bám theme, bám scaffold, bám route hiện có
- sửa theo vấn đề UX thật trên mobile
- chỉ thêm state/domain layer khi thực sự bắt đầu cần liên thông giữa nhiều màn

Đây là hướng làm phù hợp với một repo prototype/product demo đang tăng dần độ thực tế mà chưa cần xây toàn bộ backend production ngay từ đầu.
