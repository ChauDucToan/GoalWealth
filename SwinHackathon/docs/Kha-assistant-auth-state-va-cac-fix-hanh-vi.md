# Kha - Assistant, Auth, State Và Các Fix Hành Vi

## 1. Mục tiêu của tài liệu

Tài liệu này ghi lại các hạng mục không thuần dựng UI, mà thiên về state, auth và behavior fix.

Phạm vi chính:

- reducer/user state
- OAuth2 sign-in
- assistant chat behavior
- safe area và keyboard fix
- cách bottom tab được điều khiển trong app

## 2. User reducer và payload typing

### 2.1. Các file liên quan

- `context/user.types.ts`
- `context/user.reducer.ts`
- `context/myUserContext.ts`

### 2.2. Những gì đã được bổ sung

Tầng user state được chuyển theo hướng typed reducer rõ ràng hơn.

Các phần đã có:

- `UserState`
- `UserProfile`
- `UserPreferences`
- mapping payload theo action
- union `UserAction`
- reducer xử lý state
- provider và hook dùng trong app

### 2.3. Ý nghĩa kỹ thuật

Việc tách `types` và `reducer` ra riêng có lợi ở các điểm:

- action rõ hơn
- payload type-safe hơn
- dễ mở rộng thêm auth flow, preferences hoặc user profile về sau
- bớt phụ thuộc vào local state rời rạc trong từng màn

## 3. `signIn` và OAuth2

### 3.1. Các file liên quan

- `app/(auth)/signIn.tsx`
- `services/oauth2.ts`
- `app/_layout.tsx`

### 3.2. Hướng triển khai

`signIn` đã được nối theo hướng OAuth2 cho form email/password hiện tại.

Các phần chính:

- validate input
- kiểm tra env cần thiết
- gọi OAuth2 password flow ở service layer
- điều hướng về `/(tabs)/home` khi thành công

### 3.3. Các bổ sung để phục vụ test

Trong quá trình test có nhu cầu vào app nhanh, nên đã thêm:

- nút `Go Home (Test)` ở `signIn`

Điều này giúp:

- test UI nhanh hơn
- không bị chặn bởi env OAuth2 chưa cấu hình

### 3.4. Lưu ý

Flow này hiện vẫn là frontend integration/mock-friendly:

- phụ thuộc env
- chưa phải một hệ auth production đầy đủ có refresh token, secure storage, backend validation end-to-end trong repo này

## 4. Assistant tab và các màn chat

### 4.1. Các file liên quan

- `app/(tabs)/assistant.tsx`
- `app/(assistant)/chat/[scenario].tsx`
- `context/assistantContext.tsx`

### 4.2. Các vấn đề đã gặp

Trong assistant flow đã xuất hiện nhiều lỗi thực tế khi test:

- CTA `Skip for now` bị bottom tab che
- ở return thứ hai của `assistant` tab, khi cuộn xuống cuối vẫn bị bottom tab che nội dung
- bấm vào chat composer thì keyboard lên nhưng input bị che
- sau khi keyboard ẩn thì để lại khoảng trống thừa ở dưới

### 4.3. Cách đã xử lý

Các hướng sửa đã được áp dụng gồm:

- thêm `useSafeAreaInsets()` ở các màn cần chừa đáy
- tăng `paddingBottom` cho content phù hợp với bottom tab
- chỉnh `KeyboardAvoidingView`
- bỏ absolute dock không cần thiết ở composer chat
- thêm focus handling rõ ràng cho input
- chỉnh lại scroll/content padding khi keyboard đóng mở

### 4.4. Ý nghĩa

Đây là loại công việc quan trọng nhưng thường không thấy ngay nếu chỉ nhìn ảnh thiết kế.

Một màn chat nhìn đúng chưa đủ. Muốn usable thật trên mobile thì phải xử lý:

- keyboard
- focus
- safe area
- scroll
- composer placement

## 5. Logic bottom tab hiện tại

### 5.1. File điều khiển chính

- `app/(tabs)/_layout.tsx`
- `components/navigation/AppTabBar.tsx`

### 5.2. Cách hoạt động

`Tabs` của Expo Router dùng custom tab bar. Các tab chính được khai báo ở `app/(tabs)/_layout.tsx`, còn logic bấm để navigate nằm trong `AppTabBar.tsx`.

Hệ quả quan trọng:

- chỉ các screen nằm trong navigator tab mới giữ được bottom tab thật
- nếu push sang route group khác, tab bar sẽ biến mất

### 5.3. Vì sao điều này quan trọng

Nó ảnh hưởng trực tiếp tới các tranh luận và chỉnh sửa ở `news-resources`, `assistant`, và các flow cần giữ tab bar hay không.

## 6. Cách triển khai các fix hành vi

Trong nhóm assistant/auth/state, cách làm được lặp lại khá rõ:

1. xem lại hành vi runtime thay vì chỉ nhìn code tĩnh
2. tìm đúng lớp gây lỗi:
   - navigator
   - keyboard avoiding
   - safe area
   - state reducer
   - service/auth
3. sửa ở tầng đúng nhất có thể
4. chạy lint hoặc test lại luồng tương ứng

## 7. Kết luận

Nhóm công việc này là phần kéo app từ mức “có màn hình” sang mức “có hành vi dùng được”.

Điểm quan trọng nhất ở đây là:

- state đã rõ hơn
- auth đã có hướng tích hợp rõ hơn
- assistant đã bớt các lỗi khó chịu khi dùng thật trên mobile
