# HeheBoiz - Flow `Subscription Management`

## 1. Mục tiêu của tài liệu

Tài liệu này mô tả riêng feature `Subscription Management` đang có trong worktree hiện tại.

Mục tiêu:

- chỉ ra các file liên quan trực tiếp tới feature
- mô tả data mock, cấu trúc màn hình và điều hướng
- giải thích quyết định tinh gọn flow `Add Plan`
- ghi lại trạng thái thực tế hiện tại của phần frontend này

## 2. Bối cảnh triển khai

Feature này được dựng theo cảm hứng từ file thiết kế:

- `finpal_ AI Finance Assistant App UI Kit (Community)/🔒 Subscription Management.png`

Ràng buộc khi triển khai:

- không tạo palette màu mới
- chỉ dùng token màu đang có trong `constants/theme.ts`
- phải giữ cảm giác đồng bộ với phong cách hiện tại của app thay vì bê nguyên một bộ visual riêng

## 3. Quyết định UX quan trọng

Ở một giai đoạn trước, flow `Add Plan` đã từng được tách thành wizard nhiều bước để bám sát ý tưởng từ bộ kit hơn.

Sau khi rà lại trải nghiệm sử dụng trên mobile, quyết định hiện tại là:

- bỏ flow `subscription-create/*` nhiều bước
- gom lại thành một màn `subscription-add.tsx` duy nhất
- giữ các trường quan trọng nhất để thao tác nhanh hơn
- cắt bớt các field và state ít giá trị để form bớt dài, ít rối hơn

Lý do:

- ít thao tác hơn cho người dùng trên điện thoại
- giảm cảm giác “điền form quá dài”
- tránh tạo thêm nhiều route phụ chỉ để nhập từng field nhỏ
- thân thiện hơn với flow demo/frontend hiện tại

## 4. Các file liên quan

### 4.1. Data và helper

- `components/finance/subscription-data.ts`

### 4.2. Các màn chính

- `app/(finance)/subscriptions.tsx`
- `app/(finance)/subscription/[id].tsx`
- `app/(finance)/subscription-add.tsx`
- `app/(finance)/subscription-result.tsx`

### 4.3. Các màn phụ trợ

- `app/(finance)/subscription-upcoming.tsx`
- `app/(finance)/subscription-payments.tsx`
- `app/(finance)/subscription-history.tsx`
- `app/(finance)/subscription-stats.tsx`
- `app/(finance)/subscription-confirm.tsx`

### 4.4. Điểm vào từ dashboard

- `app/(tabs)/home.tsx`

## 5. Dữ liệu mock của feature

### 5.1. Các kiểu dữ liệu chính

Trong `subscription-data.ts`, feature này định nghĩa:

- `SubscriptionTone`
- `SubscriptionCycle`
- `SubscriptionStatus`
- `SubscriptionCharge`
- `SubscriptionItem`
- `SubscriptionPaymentRow`

### 5.2. Các subscription mẫu

Hiện đang có 4 item mẫu:

- Netflix Entertainment
- Spotify
- Notion AI
- Pulse Gym

Mỗi item có các thuộc tính chính:

- `id`
- `name`
- `icon`
- `tone`
- `plan`
- `category`
- `amount`
- `cycle`
- `status`
- `nextPayment`
- `startedOn`
- `paymentMethod`
- `autoRenew`
- `description`
- `charges`

### 5.3. Dữ liệu phụ trợ

Ngoài danh sách chính, file data còn cung cấp:

- `subscriptionCalendar`
- `subscriptionInsights`
- `subscriptionRecommendations`
- `subscriptionCategories`
- `subscriptionCycles`
- `subscriptionPaymentMethods`
- `subscriptionDueDateOptions`
- `getSubscriptionById(...)`
- `getSubscriptionPayments()`

Vai trò của các helper này:

- chuẩn hóa dữ liệu cho các màn phụ
- tránh lặp logic tìm item theo `id`
- gom lịch sử thanh toán từ nhiều subscription thành một list duy nhất

## 6. Màn overview: `subscriptions.tsx`

Đây là entry screen chính của flow.

### 6.1. Nội dung chính của màn

Trước khi vào overview chính, route này hiện có một intro landing chỉ hiện ở lần đầu trong phiên chạy hiện tại.

Intro landing này:

- giới thiệu nhanh value của feature
- cho user chọn `Create Subscription` hoặc `Open Existing Plan`
- có nút bỏ qua để vào dashboard subscription chính

Sau khi intro được đánh dấu là đã xem, màn overview mới hiển thị đầy đủ các section bên dưới:

- hero card tổng hợp recurring spend hàng tháng
- yearly projection
- mini metric cho active, paused, nearest charge
- cụm action `Add Plan` và `Open Plan`
- section `Upcoming renewals`
- section `Stats & insights`
- section `Active subscriptions`
- section `Recent payments`
- recommendation block cuối màn

### 6.2. Cách các action đang được nối

- nút add ở header -> `/(finance)/subscription-add`
- `Add Plan` -> `/(finance)/subscription-add`
- `Open Plan` -> `/(finance)/subscription/[id]` với `id = select`
- `Upcoming renewals` -> `/(finance)/subscription-upcoming`
- `Stats` -> `/(finance)/subscription-stats`
- `Add New` trong danh sách active -> `/(finance)/subscription-add`
- `Recent payments` -> `/(finance)/subscription-payments`
- CTA cuối màn -> `/(finance)/subscription-history`

### 6.3. Quyết định layout

Màn này dùng:

- `FinanceScreen`
- `FinanceCard`
- `ThemeButton`
- `ResponsiveGrid`

Mục tiêu là giữ được nhịp card của app hiện tại, nhưng vẫn cho phép các block co giãn ổn định trên mobile nhỏ.

## 7. Màn detail + chọn plan: `subscription/[id].tsx`

Màn này hiện có 2 vai trò trong cùng một route.

### 7.1. Trường hợp có `id` hợp lệ

Màn hiển thị chi tiết của subscription tương ứng:

- hero card với icon, category, plan và mô tả
- status pill `Active` hoặc `Paused`
- amount theo cycle
- progress bar minh họa
- mini metric:
  - next payment
  - started on
  - auto renew
- block `Billing setup`
- block `Recent charges`

Các action chính:

- `Change Plan` -> `subscription-add?preset=...`
- `Pause Subscription` hoặc `Activate Again` -> `subscription-confirm`
- `Cancel Subscription` -> `subscription-confirm`

Ngoài ra nút edit ở header cũng mở:

- `subscription-add?preset=...`

### 7.2. Trường hợp không có `id` hợp lệ

Nếu route được mở với `id = select` hoặc `id` không khớp item nào, màn này sẽ không tự nhảy vào một plan mặc định.

Thay vào đó:

- hiển thị danh sách plan để user tự chọn
- sau khi chọn mới `replace` sang detail của plan tương ứng

Ý nghĩa:

- tránh ép user vào một subscription bất kỳ
- hợp với hành vi của nút `Open Plan`

## 8. Màn add/edit duy nhất: `subscription-add.tsx`

Đây là màn quan trọng nhất sau đợt tinh gọn gần nhất.

### 8.1. Vai trò

Màn này vừa dùng cho:

- tạo mới plan
- chỉnh sửa plan đang có

Phân biệt create/edit bằng query param:

- có `preset` -> edit
- không có `preset` -> add mới

### 8.2. Những phần hiện đang giữ lại

- hero card theo service đang chọn
- khu vực `Choose service`
- search input để lọc service
- service grid để chọn nhanh plan mẫu
- empty state khi search không khớp service nào
- form setup với các field cốt lõi:
  - amount
  - next payment due
  - billing cycle
  - category
  - payment method
  - auto renew
- card cuối màn để xác nhận lưu:
  - `Save Plan` hoặc `Save Changes`
  - `Cancel`

### 8.3. Những gì đã bị cắt bỏ để gọn hơn

Trong bản tinh gọn hiện tại, các phần dưới đây đã được loại khỏi màn add/edit:

- flow wizard nhiều bước `subscription-create/*`
- field `Coupon code`
- field `Description`
- switch `Smart reminder`

Lý do cắt:

- các field này làm form dài ra nhanh
- giá trị sử dụng trong frontend demo hiện tại không cao
- nhiều thông tin đã có ở hero hoặc màn detail nên không cần lặp lại

### 8.4. State hiện tại của form

Màn add/edit dùng local state:

- `search`
- `selectedId`
- `amount`
- `nextPayment`
- `cycle`
- `category`
- `paymentMethod`
- `autoRenew`

Điều này có nghĩa:

- đây vẫn là frontend mock flow
- chưa có persistence thật
- save hiện chủ yếu để điều hướng sang result screen

### 8.5. Hành vi khi user chọn service

Khi bấm một card service:

- `selectedId` được cập nhật
- `amount`, `nextPayment`, `cycle`, `category`, `paymentMethod`, `autoRenew` được đổ theo dữ liệu mẫu
- hero card và phần summary cuối màn đổi theo service mới

Nếu search không khớp service nào:

- màn hiển thị empty state riêng
- có nút `Clear Search`
- không đẩy user sang route khác

### 8.6. Hành vi khi save

- create -> `subscription-result?mode=added`
- edit -> `subscription-result?mode=updated`
- nếu chưa chọn plan thì nút save bị disable

## 9. Các màn phụ trợ

### 9.1. `subscription-upcoming.tsx`

Màn này tách riêng danh sách upcoming renewals:

- sort theo `subscriptionDueDateOptions`
- hiển thị dạng timeline/list card
- bấm vào từng item để sang detail
- có CTA sang `subscription-payments`

### 9.2. `subscription-payments.tsx`

Màn này đóng vai trò lịch sử thanh toán:

- có ô search
- list payment lấy từ `getSubscriptionPayments()`
- bấm vào row sẽ mở detail của subscription tương ứng
- có empty state khi không tìm thấy kết quả

### 9.3. `subscription-history.tsx`

Màn này là trang tổng hợp lịch sử các plan đã theo dõi:

- thiên về overview/history
- dùng để mở rộng flow mà không dồn hết mọi thứ vào overview screen

### 9.4. `subscription-stats.tsx`

Màn này tách riêng phần thống kê:

- giữ cho `subscriptions.tsx` không phải nhồi quá nhiều insight chi tiết
- phù hợp khi user muốn xem số liệu sâu hơn

### 9.5. `subscription-confirm.tsx`

Màn confirm này dùng cho các action nhạy cảm:

- `pause`
- `activate`
- `cancel`

Sau confirm, màn sẽ chuyển sang `subscription-result.tsx` với `mode` tương ứng.

## 10. Màn result: `subscription-result.tsx`

Đây là màn trạng thái sau thao tác.

### 10.1. Các mode đang hỗ trợ

- `added`
- `updated`
- `paused`
- `reactivated`
- `cancelled`

### 10.2. Nội dung hiển thị

- icon lớn ở giữa
- title theo mode
- body theo mode
- summary card gồm:
  - subscription
  - plan
  - next payment

### 10.3. Các action trên màn result

- `Open Details`
- `Back to subscriptions`
- `Add another subscription`

Điểm quan trọng:

- `Add another subscription` hiện đã quay lại `subscription-add`
- không còn đi vào wizard nhiều bước nữa

## 11. Entry point từ dashboard

Trong `app/(tabs)/home.tsx`, quick action:

- `receipt`
- label hiển thị là `Bills`

đã được nối sang:

- `router.push('/(finance)/subscriptions')`

Ý nghĩa:

- feature này có đường vào trực tiếp từ dashboard
- không bị “mồ côi” trong app

## 12. Cách feature dùng theme và responsive

### 12.1. Theme

Feature này dùng màu theo nguyên tắc:

- lấy `colors` từ `useTheme()`
- nguồn gốc token là `constants/theme.ts`
- khi cần alpha thì dùng `hexToRgba(...)`

Các tone chính đang dùng:

- `primaryDark`
- `success`
- `warning`
- `error`
- `card`
- `backgroundSoft`
- `text`
- `border`

### 12.2. Responsive

Các pattern responsive chính:

- `ResponsiveGrid` cho các cụm card/grid
- `minWidth: 0` và `flexWrap` cho các row dễ vỡ
- button row bọc bằng wrapper `flex: 1` để tự giãn đều theo chiều ngang
- giảm scale font ở màn nhỏ qua `useResponsive`

Mục tiêu:

- giảm tràn chữ
- tránh card bị quá hẹp
- giữ layout ổn định trên điện thoại nhỏ

## 13. Trạng thái hiện tại

Trạng thái hiện tại của flow:

- đã có intro landing cho lần đầu mở route subscription trong phiên chạy hiện tại
- đã có overview, detail, add/edit, result
- đã có thêm các màn phụ trợ như upcoming, payments, history, stats, confirm
- đã bỏ wizard `subscription-create/*`
- đã tối giản màn `Add Plan` để thân thiện hơn với mobile
- vẫn đang là frontend mock, chưa có persistence thật

## 14. Ghi chú kỹ thuật ngắn

Nếu sau này muốn nâng cấp feature này thành flow thật, các bước hợp lý tiếp theo là:

1. tạo store/context cho subscription thay vì chỉ dùng mock data
2. tách phần save/update/pause/cancel khỏi điều hướng giả
3. lưu payment history và trạng thái plan theo dữ liệu thật
4. quyết định rõ `Bills` có tiếp tục là entry phù hợp hay cần đổi label sang `Subscriptions`
