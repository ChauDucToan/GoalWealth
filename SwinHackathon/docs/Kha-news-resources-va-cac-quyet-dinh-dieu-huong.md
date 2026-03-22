# Kha - News & Resources Và Các Quyết Định Điều Hướng

## 1. Mục tiêu của tài liệu

`News & Resources` là một trong những nhóm flow bị chỉnh nhiều nhất trong đợt làm việc này. Lý do không chỉ nằm ở UI, mà còn ở cách route group, bottom tab và navigator tương tác với nhau.

Tài liệu này được viết riêng để:

- ghi lại quá trình chuyển từ demo UI sang navigation thật
- mô tả cấu trúc hiện tại của nhóm `news-resources`
- giải thích vì sao đã phải thử nhiều cách tổ chức route
- nêu rõ những bài học áp dụng cho các flow tương tự sau này

## 2. Điểm xuất phát

Ban đầu `News & Resources` được dựng theo hướng:

- một màn có nhiều state hoặc nhiều chế độ demo

Cách này có lợi ở giai đoạn đầu:

- nhìn nhanh được nhiều trạng thái của design
- code dựng nhanh
- không phải quyết route tree quá sớm

Nhưng nó có nhược điểm rõ ràng:

- user không thật sự navigate như flow sản phẩm
- khó hiểu màn nào là article list, màn nào là detail, màn nào là workshop
- khó nối với các hành vi hoặc route sâu hơn

## 3. Chuyển sang navigation thật

Sau đó flow được refactor để có route thật cho từng màn:

- articles
- workshops
- article detail
- workshop detail
- instructor

Đây là bước nâng rất quan trọng, vì nó biến module từ “bảng demo artboards” sang “flow có thể dùng”.

## 4. Vấn đề bottom tab

Ngay khi tách route thật, một vấn đề xuất hiện:

- các màn con khi navigate qua thì mất bottom tab

Đây không phải lỗi CSS hay layout, mà là hệ quả của navigator structure:

- tab bar chỉ tồn tại trong navigator của `(tabs)`
- nếu màn con nằm ở group khác ngoài tab navigator thì bottom tab biến mất là hành vi bình thường

## 5. Những phương án đã đi qua

### 5.1. Phương án giữ tất cả trong demo tab

Ưu điểm:

- bottom tab không mất

Nhược điểm:

- flow không thật
- code khó mở rộng

### 5.2. Phương án tách module riêng hoàn toàn

Ưu điểm:

- route tree rõ
- dễ quản lý từng màn

Nhược điểm:

- bottom tab mất khi đi vào màn con

### 5.3. Phương án thử đưa màn con về gần `(tabs)` hơn

Ưu điểm:

- có thể giữ bottom tab nếu screen còn nằm trong tab navigator

Nhược điểm:

- cấu trúc file dễ xấu đi
- tên file/route có thể bị gượng ép
- tree không còn đẹp hoặc dễ hiểu như mong muốn

### 5.4. Kết luận rút ra

Với Expo Router, không thể nhìn route tree như một bài toán đặt tên thư mục đơn giản. Nó ảnh hưởng trực tiếp tới trải nghiệm điều hướng.

## 6. Cấu trúc hiện tại trong source

Những file hiện có liên quan tới flow này gồm:

### 6.1. Tab root

- `app/(tabs)/news-resources.tsx`

### 6.2. Route group phụ

- `app/(news-resources)/_layout.tsx`
- `app/(news-resources)/news-resources-articles.tsx`
- `app/(news-resources)/news-resources-workshops.tsx`
- `app/(news-resources)/news-resources-article-detail.tsx`
- `app/(news-resources)/news-resources-workshop-detail.tsx`
- `app/(news-resources)/news-resources-instructor.tsx`

### 6.3. Community subflows

- `community-chat.tsx`
- `community-delete-post.tsx`
- `community-filter-posts.tsx`
- `community-guidelines.tsx`
- `community-post-success.tsx`

Điều này cho thấy module hiện không chỉ là `news`, mà là một mix giữa:

- editorial/resources
- workshops/instructor
- finance community

## 7. Các loại chỉnh sửa UI/UX đã làm trong module này

### 7.1. Header và safe area

Có nhiều chỉnh sửa nhằm tránh việc title/header bị dính notch:

- tăng padding top hợp lý
- dùng safe area đúng chỗ
- đồng bộ header row/back button

### 7.2. Đồng bộ với `Achievements`

Một yêu cầu rõ đã xuất hiện là:

- header/back giữa `Achievements` và `News & Resources` đang không đồng bộ

Do đó các màn trong module này đã được ép về cùng pattern header hơn:

- size nút back
- chiều cao header row
- kiểu title ở giữa

### 7.3. Support bubble thay cho chat demo

Ban đầu phần chat được nhìn như một màn demo trong flow.

Sau đó đã đổi hướng:

- biến nó thành support bubble/floating support component

Điều này hợp lý hơn về mặt sản phẩm, vì:

- chat hỗ trợ thường là một lớp phụ trợ
- không nhất thiết phải chiếm một artboard riêng như flow chính

### 7.4. FAB `Add New Post`

Ở tab root đã có chỉnh sửa:

- đổi `Add New Post` từ nút text/button sang FAB dấu `+`
- đẩy vị trí FAB lên khỏi vùng bottom tab

Ý nghĩa:

- gọn hơn về visual
- gần với mobile pattern quen thuộc hơn
- tránh bị chồng lấn với tab bar

## 8. Vấn đề style scope và theme

Một lỗi cụ thể từng xuất hiện là:

- style trong `news-resources.tsx` gọi `colors` ở ngoài scope hợp lệ

Điều này cho thấy một pattern quan trọng:

- nếu file cần style bám theme, tốt nhất nên chuyển sang `createStyles(colors)`
- không nên vừa dùng `StyleSheet.create(...)` ở module scope vừa trông chờ truy cập biến `colors` lấy từ hook trong component

Đây là lý do một phần của file đã được refactor theo hướng theme-aware style đúng cách hơn.

## 9. Bài học áp dụng cho các flow khác

`News & Resources` là case study tốt cho các module tương lai có cả:

- tab entry
- detail routes
- subflow dạng community
- nhu cầu giữ hoặc không giữ bottom tab

Những bài học nên giữ lại:

1. quyết định navigator trước khi mở rộng flow quá xa
2. nếu một màn buộc phải giữ bottom tab, phải để nó ở đúng navigator
3. đừng cố làm route tree đẹp trên giấy nhưng UX sai trong app thật
4. khi module lớn dần, nên tách tài liệu riêng cho quyết định điều hướng

## 10. Kết luận

`News & Resources` là một flow mà độ khó không nằm ở từng component nhỏ, mà nằm ở việc:

- phối hợp route group
- điều hướng người dùng
- giữ consistency của header/safe area
- cân bằng giữa cấu trúc repo và trải nghiệm tab/navigation

Vì vậy mọi thay đổi tiếp theo ở module này nên được xem như thay đổi điều hướng sản phẩm, không chỉ là chỉnh UI đơn thuần.
