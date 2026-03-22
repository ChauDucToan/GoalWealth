# HeheBoiz - Flow `Subscription Management`

## 1. Mục tiêu của tài liệu

Tài liệu này mô tả riêng feature `Subscription Management` đang được dựng ở worktree hiện tại.

Mục tiêu:

- giải thích vì sao feature này được thêm
- chỉ ra các file liên quan
- mô tả data, screen, điều hướng và trạng thái hiện tại

## 2. Bối cảnh

Feature này được dựng theo cảm hứng từ file thiết kế:

- `finpal_ AI Finance Assistant App UI Kit (Community)/🔒 Subscription Management.png`

Ràng buộc khi triển khai:

- không tạo palette màu mới tách biệt
- phải dùng màu từ `constants/theme.ts`

## 3. Các file liên quan

### 3.1. Dữ liệu

- `components/finance/subscription-data.ts`

### 3.2. Màn hình

- `app/(finance)/subscriptions.tsx`
- `app/(finance)/subscription/[id].tsx`
- `app/(finance)/subscription-add.tsx`
- `app/(finance)/subscription-result.tsx`

### 3.3. Entry point được nối vào flow

- `app/(tabs)/home.tsx`

## 4. Dữ liệu mock của feature

### 4.1. Các kiểu dữ liệu

File `subscription-data.ts` định nghĩa:

- `SubscriptionTone`
- `SubscriptionCycle`
- `SubscriptionStatus`
- `SubscriptionCharge`
- `SubscriptionItem`

### 4.2. Các item mẫu

Hiện có các subscription mẫu:

- Netflix Entertainment
- Spotify
- Notion AI
- Pulse Gym

Mỗi item có:

- icon
- tone màu
- plan
- category
- amount
- cycle
- status
- nextPayment
- startedOn
- paymentMethod
- autoRenew
- description
- charges

### 4.3. Dữ liệu phụ trợ

Ngoài item chính còn có:

- `subscriptionCalendar`
- `subscriptionInsights`
- `subscriptionRecommendations`
- `subscriptionCategories`
- `subscriptionCycles`
- `subscriptionPaymentMethods`

## 5. Màn overview: `subscriptions.tsx`

Đây là màn entry chính của feature.

### 5.1. Nội dung chính của màn

- hero card tổng quan recurring spend
- yearly projection
- active count / paused count / nearest charge
- upcoming renewals
- stats & insights
- optimization section
- active subscriptions list
- recent payments list
- recommendation block

### 5.2. Pattern UI đang dùng

- `FinanceScreen`
- `FinanceCard`
- `ThemeButton`
- `ResponsiveGrid`
- màu từ `useTheme()`

### 5.3. Điều hướng từ overview

- `Add Subscription` -> `/(finance)/subscription-add`
- `Open First Plan` -> `/(finance)/subscription/[id]`
- bấm từng row subscription -> `/(finance)/subscription/[id]`

## 6. Màn detail: `subscription/[id].tsx`

Màn này hiển thị chi tiết một subscription cụ thể.

### 6.1. Các khối chính

- hero card có icon, plan, category, description
- status pill
- amount theo cycle
- progress/timeline minh họa
- mini metrics:
  - next payment
  - started on
  - auto renew
- billing setup
- recent charges

### 6.2. Các action chính

- `Change Plan` -> `subscription-add?preset=id`
- `Pause Subscription` -> `subscription-result?mode=paused`
- `Activate Again` -> `subscription-result?mode=reactivated`
- `Cancel Subscription` -> `subscription-result?mode=cancelled`

## 7. Màn add/edit: `subscription-add.tsx`

Đây là màn vừa dùng để tạo mới, vừa dùng để sửa.

### 7.1. Cơ chế create vs edit

- nếu có `preset` trong query params thì xem như edit
- nếu không có `preset` thì xem như tạo mới

### 7.2. Cấu trúc màn

- hero card theo service đang chọn
- khu vực `Choose service`
- search input
- service picker grid
- form setup:
  - amount
  - next payment due
  - billing cycle
  - category
  - payment method
  - coupon code
  - description
  - auto renew
  - smart reminder
- preview card cuối màn

### 7.3. Cách state đang vận hành

Hiện màn này dùng local state:

- `search`
- `selectedId`
- `amount`
- `nextPayment`
- `cycle`
- `category`
- `paymentMethod`
- `couponCode`
- `notes`
- `autoRenew`
- `smartReminder`

Điều đó có nghĩa:

- đây là form UI/frontend mock
- chưa ghi vào global state thật

### 7.4. Điều hướng từ màn add/edit

- save create -> `subscription-result?mode=added`
- save edit -> `subscription-result?mode=updated`
- cancel -> `router.back()`

## 8. Màn result: `subscription-result.tsx`

Màn này dùng để hiển thị trạng thái sau hành động.

### 8.1. Các mode đang hỗ trợ

- `added`
- `updated`
- `paused`
- `reactivated`
- `cancelled`

### 8.2. Nội dung hiển thị

- icon lớn
- title theo mode
- body theo mode
- summary card gồm:
  - subscription
  - plan
  - next payment

### 8.3. Điều hướng từ result

- `Open Details`
- `Back to subscriptions`
- `Add another subscription`

## 9. Entry point từ dashboard

Trong `app/(tabs)/home.tsx`, quick action:

- `receipt`
- label hiển thị là `Bills`

đã được đổi sang:

- `router.push('/(finance)/subscriptions')`

Ý nghĩa:

- feature này không bị “mồ côi”
- có đường vào trực tiếp từ dashboard

## 10. Cách feature này dùng theme

Feature này tuân theo yêu cầu:

- chỉ dùng màu từ `constants/theme.ts`
- truy cập qua `useTheme()`
- khi cần alpha thì dùng `hexToRgba(...)`

Các tone đang dùng:

- `primaryDark`
- `success`
- `warning`
- `error`
- `card`
- `backgroundSoft`
- `darkBackground`
- `text`
- `border`

## 11. Trạng thái hiện tại

### 11.1. Đã xong

- overview screen
- detail screen
- add/edit screen
- result screen
- entry từ home
- lint pass

### 11.2. Chưa xong hoàn toàn

- chưa gắn vào `FinanceContext`
- chưa có CRUD persistence thật
- chưa có lưu subscription vào source of truth
- chưa có sync ngược lại danh sách overview khi add/edit/cancel

## 12. Hướng nên làm tiếp nếu muốn đẩy feature này xa hơn

1. Tạo `subscriptions` state trong `FinanceContext` hoặc tạo context riêng.
2. Chuyển mock item thành initial state thay vì source tĩnh.
3. Cho `subscription-add` thật sự update/create item.
4. Cho `subscription-result` phản ánh trạng thái mới từ state đã cập nhật.
5. Nếu cần product-ready hơn, thêm notifications/reminders logic và payment history thực.
