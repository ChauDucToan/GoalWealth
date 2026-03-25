# Kha - Tabs, Community Và Các Màn UI Theo Design

## 1. Mục tiêu của tài liệu

Tài liệu này tập trung riêng vào các màn hình tab, community và các màn UI đã được dựng theo bộ thiết kế `finpal_ AI Finance Assistant App UI Kit (Community)`.

Mục tiêu:

- ghi lại những màn nào đã được dựng
- mô tả cách chúng được triển khai
- nêu các chỉnh sửa sau khi test
- chỉ ra các quyết định điều hướng hoặc kiến trúc liên quan

## 2. `Profile Settings`

### 2.1. File chính

- `app/(tabs)/profile.tsx`

### 2.2. Những gì đã được triển khai

Màn này được dựng lại theo hướng settings page đầy đủ, gồm:

- header `Profile`
- profile card
- cover/avatar/name/status
- block streak hoặc thành tích cá nhân
- các nhóm settings theo section
- toggle cho notification/preference
- danger zone và sign out

### 2.3. Các tinh chỉnh đã làm thêm

Sau khi dựng, màn này được chỉnh thêm ở các điểm:

- bỏ màu xanh lá cũ còn sót lại, chuyển sang dùng token từ `constants/theme.ts`
- căn chỉnh lại row trong `section.items` để chữ, icon, switch và arrow thẳng hàng hơn
- chuẩn hóa spacing và alignment của từng item

### 2.4. Phương pháp triển khai

Phương pháp ở màn này là:

- dựng theo section data
- dùng `useTheme()` để lấy màu
- dùng `createStyles(colors)` để tránh style tĩnh không truy cập được theme
- dùng row layout đơn giản, dễ tinh chỉnh sau khi test trên thiết bị thật

## 3. `Utility & Helper`

### 3.1. File chính

- `app/(tabs)/insights.tsx`

### 3.2. Hướng triển khai ban đầu

Ban đầu màn này được làm theo kiểu demo nhiều state trong một màn, để có thể xem nhanh các trạng thái:

- not found
- server error
- no internet
- maintenance
- not allowed
- feature locked

### 3.3. Tinh chỉnh sau đó

Sau phản hồi kiểm thử, màn này được đổi hành vi:

- không còn render sẵn toàn bộ kiểu demo
- chỉ hiện utility screen khi thật sự có `issue`
- bình thường tab `Insights` trở về trạng thái nội dung chuẩn

### 3.4. Ý nghĩa

Thay đổi này quan trọng vì nó kéo màn từ “bảng demo UI” sang “screen tình huống có điều kiện”, đúng với cách app thật sẽ hoạt động.

## 4. `Achievements`

### 4.1. File chính

- `app/(tabs)/achievements.tsx`

### 4.2. Những gì đã dựng

Màn `Achievements` được làm theo kiểu segmented screen gồm 3 nhóm:

- `Badges`
- `Leaderboard`
- `Stats`

Các block nổi bật:

- header với icon trái/phải
- số lượng achievements unlocked
- grid badge lock/unlock
- active achievements với progress bar
- leaderboard summary
- my statistics

### 4.3. Những gì đã tinh chỉnh thêm

- không chỉ dừng ở segment giả, mà nội dung đã đổi thật khi bấm segment
- header/back được đồng bộ với flow `News & Resources`
- typography và icon button được chuẩn hóa hơn giữa các màn cùng loại

## 5. `Search & Notifications`

### 5.1. File chính

- `app/(tabs)/search-notifications.tsx`

### 5.2. Phạm vi triển khai

Màn này được dựng theo nhiều trạng thái UI trong ảnh thiết kế:

- inbox
- empty
- search
- no result
- suggest
- loading
- results
- filter

### 5.3. Các lỗi UX đã xử lý

Sau khi dựng, có các lỗi được sửa:

- chữ `Search` hoặc input title bị che
- categories quá nhỏ nên tăng font size
- spacing của chip/category list được nâng lên để dễ đọc hơn

### 5.4. Phương pháp làm

Màn này được làm theo kiểu state-driven:

- mỗi state là một nhánh render riêng
- tránh hardcode chung một layout cho mọi trạng thái
- dễ tách thành component nhỏ về sau nếu cần

## 6. `Transactions`

### 6.1. File chính

- `app/(tabs)/transactions.tsx`

### 6.2. Các chỉnh sửa đã thực hiện

Những gì được sửa theo feedback:

- bỏ shadow của nút `Add transaction`
- đổi nút thành FAB chỉ có dấu `+`
- hạ nút xuống cuối màn nhưng không để đè bottom tab
- sửa modal add transaction:
  - có thể kéo
  - có thể scroll nội dung
  - có nút đóng rõ ràng
- làm lại `Add New Transaction` theo hướng gọn hơn:
  - bỏ 3 tab type lớn
  - thêm selector type gọn
  - thêm input trực tiếp
  - validate `Amount`
- làm lại khu vực `Filters` ở `My Transactions`
- bỏ `Sort` và `Date` ở màn ngoài vì đã được gom vào `transactions-filters.tsx`
- chuyển `Sort` và `Date Range` trong `transactions-filters.tsx` thành lựa chọn trực tiếp, không còn là link sang route khác

### 6.3. Ý nghĩa

Đây là ví dụ điển hình của kiểu cải tiến không phải “dựng lại UI” mà là chỉnh interaction để usable hơn trên mobile.

## 7. `News & Resources` và `Finance Community`

### 7.1. File root tab

- `app/(tabs)/news-resources.tsx`

### 7.2. Nhóm route phụ

- `app/(news-resources)/news-resources-articles.tsx`
- `app/(news-resources)/news-resources-workshops.tsx`
- `app/(news-resources)/news-resources-article-detail.tsx`
- `app/(news-resources)/news-resources-workshop-detail.tsx`
- `app/(news-resources)/news-resources-instructor.tsx`
- và các màn community khác trong cùng group

### 7.3. Những giai đoạn đã trải qua

Flow này đã đi qua nhiều vòng điều chỉnh:

1. ban đầu là multi-state demo trong một màn
2. sau đó được tách thành navigation thật theo từng màn
3. tiếp theo thử nhiều cấu trúc folder/route khác nhau để giải quyết chuyện bottom tab
4. cuối cùng chốt về cấu trúc đang có trong source hiện tại

### 7.4. Những gì đã tinh chỉnh

- đổi chat trong module này thành support bubble/floating style
- sửa title bị dính notch
- đồng bộ header/back với `Achievements`
- chỉnh lại vị trí title và safe area cho nhiều màn con
- sửa nút `Add New Post` thành FAB dấu `+` và đẩy cao khỏi bottom tab
- sửa tham chiếu sai `colors` trong style scope của file root

### 7.5. Bài học kiến trúc từ flow này

Phần này cho thấy rõ một bài toán thực tế của Expo Router:

- nếu screen con đi ra khỏi navigator chứa tab bar thì bottom tab biến mất
- nếu cố giữ mọi thứ trong tab navigator thì cấu trúc route có thể xấu đi
- vì vậy cần cân bằng giữa tính đúng về điều hướng và tính rõ ràng của cây route

## 8. Màu sắc và theme trong các màn UI này

Một yêu cầu lặp đi lặp lại trong đợt làm là:

- không đổi màu đang có của `constants/theme.ts`
- nhưng các màn mới phải dùng đúng theme token đó

Các màn trong nhóm này đã được chỉnh theo hướng:

- bỏ màu hardcode
- dùng `useTheme().colors`
- nếu cần độ trong suốt thì dùng `hexToRgba(...)`
- hạn chế tối đa việc tạo palette màu tách biệt cho một screen

## 9. Kết luận

Nhóm màn tab/community là phần có số lượng feedback UI nhiều nhất trong đợt này.

Điểm quan trọng không chỉ là số màn đã dựng, mà là:

- nhiều màn đã được đưa từ demo screen sang flow usable hơn
- nhiều vấn đề mobile thật như notch, bottom tab, keyboard, safe area đã được xử lý
- cấu trúc code đã được ép bám theme và navigator của app thay vì viết tách rời
