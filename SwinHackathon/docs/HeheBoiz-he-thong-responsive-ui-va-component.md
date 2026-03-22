# HeheBoiz - Hệ Thống Responsive, UI Và Component Dùng Chung

## 1. Mục tiêu của tài liệu

Tài liệu này tập trung vào phần “cách app được làm để hiển thị ổn trên mobile”, đặc biệt là các đợt tối ưu responsive đã thực hiện gần đây.

Phạm vi:

- hook responsive
- theme token
- button/input/scaffold dùng chung
- grid responsive
- các pattern layout đang được áp dụng

## 2. Theme system

### 2.1. Nguồn màu

File:

- `constants/theme.ts`

Màu đang được dùng nhiều:

- `text`
- `textLight`
- `textSecondary`
- `background`
- `backgroundSoft`
- `darkBackground`
- `card`
- `border`
- `primary`
- `primaryDark`
- `secondary`
- `success`
- `warning`
- `error`

### 2.2. Tình trạng hiện tại

Theme token đã có cả `light` và `dark`, nhưng:

- `ThemeProvider` hiện đang trả `Colors.light` cho cả hai chế độ

Điều này có nghĩa:

- app đang có hệ màu khá ổn cho light mode
- dark mode về mặt logic có tồn tại, nhưng chưa thực sự được kích hoạt bằng palette riêng

## 3. Responsive foundation

### 3.1. `hooks/use-responsive.ts`

Đây là lớp nền quan trọng nhất cho responsive.

Vai trò:

- tính `width`
- scale theo màn hình
- scale theo chiều dọc
- scale font
- nhận biết thiết bị compact

Các đợt chỉnh trước đây đã làm cho hook này trở thành nền chung cho:

- `ThemeButton`
- `FinanceScaffold`
- `AssistantScaffold`
- `AppTabBar`
- các màn tab chính

### 3.2. Nguyên tắc responsive đang được dùng

Các pattern được áp dụng nhiều:

- ưu tiên `flexWrap`
- dùng `minWidth: 0` để text được co
- dùng `flexBasis` khi 2 nút/2 card cần nằm cùng hàng nhưng vẫn phải tự xuống hàng
- giảm hoặc bỏ `width` cứng
- dùng spacing scale thay vì set số lớn cố định

## 4. Shared component nền

### 4.1. `ThemeButton`

File:

- `components/ThemeButton.tsx`

Điểm chính:

- dùng animation scale nhỏ khi bấm
- có responsive scale cho padding và font
- phù hợp cho nhiều loại CTA trong app

Lợi ích:

- nút giữ được cảm giác đồng nhất
- bớt bị quá to hoặc quá chật trên màn nhỏ

### 4.2. `InputField`

File:

- `components/InputField.tsx`

Vai trò:

- là primitive input của auth và một số flow khác
- đã từng được tinh chỉnh trong các đợt welcome/responsive trước đó

### 4.3. `AuthKit`

File:

- `components/auth/AuthKit.tsx`

Vai trò:

- chứa scaffold và helper UI cho auth
- cung cấp `hexToRgba(...)` đang được dùng rộng trong repo

## 5. Scaffold theo domain

### 5.1. `FinanceScaffold`

File:

- `components/finance/FinanceScaffold.tsx`

Vai trò:

- chuẩn hóa header finance
- chuẩn hóa back button
- chuẩn hóa khoảng cách phần content
- chuẩn hóa `FinanceCard`

Những lợi ích sau các đợt chỉnh:

- card co giãn tốt hơn
- title/subtitle ổn hơn trên mobile nhỏ
- các màn finance cùng một visual structure

### 5.2. `AssistantScaffold`

File:

- `components/assistant/AssistantScaffold.tsx`

Vai trò:

- tương tự finance nhưng dành riêng cho assistant domain

Lợi ích:

- giữ các màn assistant có chung khung nhìn
- đỡ lệch spacing khi mỗi màn có nội dung khác nhau

## 6. `ResponsiveGrid` là gì và tại sao quan trọng

### 6.1. File

- `components/ResponsiveGrid.tsx`

### 6.2. Lý do cần component này

Trước đây nhiều cụm card thường dùng:

- `flexDirection: 'row'`
- `flexWrap: 'wrap'`
- `width: '48%'`

Kiểu này dễ gặp vấn đề:

- card không đều nhau
- text dài dễ vỡ
- khi màn nhỏ hơn một chút là bố cục xấu ngay

### 6.3. Cách `ResponsiveGrid` hoạt động

Component này:

- nhận `minItemWidth`
- nhận `gap`
- nhận `maxColumns`
- nhận `horizontalPadding`
- dựa trên `width` hiện tại để tự tính số cột

Kết quả:

- màn nhỏ -> 1 cột
- màn vừa -> 2 cột
- màn rộng hơn -> 3 hoặc nhiều hơn tùy cấu hình

### 6.4. Những nơi đã áp dụng grid đáng chú ý

- `app/(tabs)/home.tsx`
- `app/(tabs)/search-notifications.tsx`
- `app/(finance)/select-category.tsx`
- `app/(assistant)/receipt-upload.tsx`
- `app/(finance)/investments.tsx`
- `app/(finance)/subscriptions.tsx`
- `app/(finance)/subscription-add.tsx`

## 7. Các đợt responsive đã diễn ra theo tiến trình

### 7.1. Đợt responsive sớm cho `welcome`

Các commit liên quan:

- `6f52aaa`
- `b577787`

Phạm vi:

- `app/welcome.tsx`
- `InputField`
- `ThemeButton`
- `use-responsive`
- `AssistantScaffold`
- `FinanceScaffold`
- `AppTabBar`

Ý nghĩa:

- đây là đợt đặt nền responsive đầu tiên rõ ràng

### 7.2. Đợt responsive lớn cho mobile toàn app

Commit:

- `6364fb5`

Phạm vi lớn:

- tabs
- assistant screens
- finance screens
- shared scaffold
- `ResponsiveGrid`

Ý nghĩa:

- đây là đợt làm cho app đồng đều hơn trên điện thoại nhỏ

## 8. Các màn đã được hưởng lợi rõ từ đợt responsive gần đây

### Nhóm tabs

- `home`
- `transactions`
- `insights`
- `assistant`
- `achievements`
- `profile`
- `search-notifications`

### Nhóm finance

- `add-transaction`
- `investments`
- `select-category`

### Nhóm assistant

- `receipt-upload`
- `receipt-scan`
- `voice`

## 9. Pattern UI nên tiếp tục dùng về sau

Nếu tiếp tục mở rộng app, nên giữ các nguyên tắc sau:

1. Với cụm card nhiều item, ưu tiên `ResponsiveGrid`.
2. Với hàng có text dài, luôn cân nhắc `minWidth: 0`.
3. Với 2 CTA cạnh nhau, dùng `flexWrap` và `flexBasis`.
4. Với shared screen, đi qua scaffold domain thay vì tự viết layout mới hoàn toàn.
5. Với màu, đi qua `useTheme()` và `constants/theme.ts`, tránh hardcode màu mới nếu không thật cần thiết.

## 10. Liên hệ với flow `Subscription Management`

Flow `Subscription Management` mới cũng đang đi theo đúng pattern này:

- dùng `FinanceScreen` và `FinanceCard`
- dùng `ThemeButton`
- dùng `ResponsiveGrid`
- lấy màu từ `constants/theme.ts`

Điều này giúp flow mới không bị “lệch tông” khỏi app hiện có.
