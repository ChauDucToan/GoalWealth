# Bộ Tài Liệu Trong Thư Mục `docs`

Thư mục `docs` hiện đã được tách thành nhiều tài liệu để dễ đọc hơn thay vì dồn toàn bộ vào một file duy nhất.

## Thứ tự nên đọc

1. [Tài liệu tổng hợp lịch sử thay đổi và các mốc công việc](./HeheBoiz-tong-hop-cong-viec-da-thuc-hien.md)
2. [Snapshot worktree và các thay đổi gần đây](./HeheBoiz-cap-nhat-worktree-va-cac-thay-doi-gan-day.md)
3. [Kiến trúc tổng quan và cấu trúc repo](./HeheBoiz-kien-truc-tong-quan-va-cau-truc-repo.md)
4. [Flow điều hướng và các màn hình](./HeheBoiz-flow-dieu-huong-va-cac-man-hinh.md)
5. [Hệ thống responsive, UI và component dùng chung](./HeheBoiz-he-thong-responsive-ui-va-component.md)
6. [Flow Profile Setup & Account Completion](./HeheBoiz-profile-setup-va-account-completion.md)
7. [Flow Profile Settings và các bổ sung theo UI kit](./HeheBoiz-profile-settings-va-cac-bo-sung-theo-ui-kit.md)
8. [Flow Subscription Management chi tiết](./HeheBoiz-flow-subscription-management.md)

## Mục đích của từng file

### `HeheBoiz-tong-hop-cong-viec-da-thuc-hien.md`

- Là file timeline lớn nhất.
- Ghi lại các commit/mốc đã làm từ giai đoạn cũ cho tới hiện tại.
- Bao gồm cả những thay đổi đang còn ở worktree chưa commit.

### `HeheBoiz-kien-truc-tong-quan-va-cau-truc-repo.md`

- Tập trung vào kiến trúc hiện tại của app.
- Giải thích route group, provider, context, hook và tầng component.

### `HeheBoiz-cap-nhat-worktree-va-cac-thay-doi-gan-day.md`

- Là file snapshot mới nhất của worktree hiện tại.
- Ghi lại đầy đủ các thay đổi lớn gần đây theo module như `Financial Assessment`, `Financial Goals`, `Smart Budgeting`, `Profile Setup`, `Profile Settings`, `Assistant`, `AppTabBar`.
- Phù hợp khi cần đọc nhanh “đợt làm việc vừa rồi đã thay gì”.

### `HeheBoiz-flow-dieu-huong-va-cac-man-hinh.md`

- Mô tả các flow đi màn hình chính.
- Giúp xem nhanh đường đi giữa `welcome`, `auth`, `tabs`, `finance`, `assistant`, `news/community`.

### `HeheBoiz-he-thong-responsive-ui-va-component.md`

- Tập trung vào cách app đang làm responsive.
- Ghi lại shared component/scaffold đã được tinh chỉnh.
- Mô tả những pattern nên tiếp tục dùng để giữ UI ổn định trên mobile.

### `HeheBoiz-flow-subscription-management.md`

- Tài liệu riêng cho feature `Subscription Management`.
- Mô tả data mock, intro landing lần đầu, các màn chính, các màn phụ trợ, quyết định tinh gọn flow `Add Plan` và trạng thái hiện tại của feature.

### `HeheBoiz-profile-setup-va-account-completion.md`

- Tài liệu riêng cho flow `Profile Setup & Account Completion`.
- Mô tả cách flow cũ nhiều màn nhỏ đã được gom lại thành 6 bước chính.
- Giải thích từng màn mới, các redirect tương thích ngược và các quyết định tối ưu UX/UI theo board design.

### `HeheBoiz-profile-settings-va-cac-bo-sung-theo-ui-kit.md`

- Tài liệu riêng cho flow `Profile Settings`.
- Mô tả tab `Profile`, route group `/(profile)`, các shared primitive mới và các màn con đã được bổ sung để gần bộ kit hơn mà không phá vỡ hệ button hiện tại.

## Tài liệu bổ sung

8. [Bộ tài liệu `Kha-*` cho đợt triển khai gần đây](./Kha-README.md)
9. Nhóm `Kha-*` hiện đã được mở rộng thêm tài liệu riêng cho `Financial Assessment`, `Financial Goals`, `Profile Setup & Account Completion`, và phần `frontend <-> backend data/contracts`.

## Ghi chú

- Phần timeline lịch sử được tổng hợp từ git history hiện còn trong branch `develop`.
- Phần kiến trúc và flow được đối chiếu lại trực tiếp với source code hiện có trong repo.
- `Subscription Management` trong docs đã được cập nhật theo hướng dùng một màn `Add Plan` duy nhất thay vì wizard nhiều bước.
- Bộ tài liệu `HeheBoiz-*` hiện đã bao gồm riêng cả `Profile Setup` và `Profile Settings`, không còn chỉ nhắc lại ngắn trong file tổng hợp.
