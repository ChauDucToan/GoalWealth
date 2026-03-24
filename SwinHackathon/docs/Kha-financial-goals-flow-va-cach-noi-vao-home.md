# Kha - Financial Goals Flow Và Cách Nối Vào Home

## 1. Mục tiêu của hạng mục

`Financial Goals` là một trong các board còn thiếu rõ ràng trong thư mục `fin/`. Mục tiêu của phần này là bổ sung một module goals độc lập trong nhóm `(finance)` để app có:

- màn hub xem các mục tiêu tài chính
- màn detail cho từng goal
- màn tạo goal mới
- đường vào thật từ `Home`

## 2. Cấu trúc module

Module được tạo tại:

- `app/(finance)/financial-goals/_layout.tsx`
- `app/(finance)/financial-goals/_data.ts`
- `app/(finance)/financial-goals/index.tsx`
- `app/(finance)/financial-goals/[goalId].tsx`
- `app/(finance)/financial-goals/create.tsx`

Ý nghĩa từng phần:

- `_layout.tsx`: giữ flow goals trong stack riêng, không làm bẩn `tabs`
- `_data.ts`: chứa mock goal data, category metadata, progress data
- `index.tsx`: hub tổng quan goals
- `[goalId].tsx`: detail route cho từng goal đang active
- `create.tsx`: form tạo goal mới theo frontend mock

## 3. Cách module này được nối vào app

Module goals được nối từ `Home` ở 2 chỗ:

1. action `Track` trong section `Goals`
2. bấm trực tiếp vào từng goal card

File liên quan:

- `app/(tabs)/home.tsx`

Lý do chọn cách nối này:

- phù hợp kỳ vọng người dùng vì `Goals` đã tồn tại về mặt content trên `Home`
- không cần thêm tab mới
- đảm bảo người dùng nhìn thấy ngay UI sau khi code xong mà không phải nhớ route thủ công

## 4. Mô tả từng screen

### 4.1. `index.tsx`

Vai trò:

- màn hub `Financial Goals`
- hiển thị trạng thái tổng quát của các goal đang active
- có CTA sang detail hoặc create goal

Nội dung chính:

- hero summary của toàn bộ goals
- active goal list
- milestone/next action
- progress bars

### 4.2. `[goalId].tsx`

Vai trò:

- màn xem chi tiết một goal cụ thể

Nội dung chính:

- progress summary
- target amount
- monthly contribution rhythm
- milestone blocks
- phần gap còn lại để hoàn thành

Lý do dùng dynamic route `[goalId]`:

- scale tốt hơn nếu số goal tăng
- tránh tạo file riêng cho từng goal mock
- phù hợp với cách Expo Router tổ chức detail screen

### 4.3. `create.tsx`

Vai trò:

- màn tạo goal mới theo hướng frontend-only

Nội dung chính:

- chọn category goal
- chọn target amount
- chọn monthly contribution
- preview draft goal trước khi tạo

## 5. Phương pháp triển khai

### 5.1. Data-driven từ `_data.ts`

Thay vì hardcode nhiều khối UI rải rác, goals được đưa về một nguồn `_data.ts`. Cách này giúp:

- detail screen và hub screen dùng cùng dữ liệu
- dễ đổi text/mock numbers theo board thiết kế
- sau này có thể thay dần bằng dữ liệu thật mà không phải đập cả UI

### 5.2. Không dùng context riêng ở bước này

Khác với `Smart Budgeting`, module goals hiện chưa có context riêng. Lý do:

- phạm vi hiện tại chủ yếu là hiển thị và điều hướng
- chưa có yêu cầu state xuyên nhiều bước đủ phức tạp
- giữ module nhẹ, không mở context sớm khi chưa cần

## 6. Điều đã được kiểm tra

- route hub goals vào được từ `Home`
- route detail goals đọc được `goalId`
- route create goal vào được từ các CTA chính
- lint pass trước khi commit

Commit chứa phần này:

- `f5b987a` — `feat: add profile setup and financial goals flows`

## 7. Hạn chế hiện tại

1. goal data vẫn là mock
2. chưa có create goal persistence
3. chưa có edit/delete goal
4. chưa nối với `Smart Budgeting` hoặc savings thật
5. chưa có progress cập nhật theo transaction thực tế

## 8. Nếu tiếp tục mở rộng

Các bước hợp lý tiếp theo:

1. nối create goal vào local context hoặc backend payload thật
2. đồng bộ goal progress với transaction/budget data
3. thêm goal recommendation dựa trên assessment hoặc smart budgeting state
4. thêm edit goal và archive flow

## 9. Kết luận

`Financial Goals` đã được đưa từ trạng thái `missing` lên mức có module thật, route thật và entry thật từ `Home`. Đây là nền đủ tốt để sau này nối logic sản phẩm mà không cần viết lại phần UI cơ bản.
