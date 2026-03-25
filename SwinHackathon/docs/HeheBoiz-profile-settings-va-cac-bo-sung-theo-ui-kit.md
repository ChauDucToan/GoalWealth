# HeheBoiz - Flow `Profile Settings` Và Các Bổ Sung Theo UI Kit

## 1. Mục tiêu của tài liệu

Tài liệu này mô tả phần `Profile Settings` sau các đợt mở rộng gần đây, với trọng tâm:

- đối chiếu với board `finpal_ AI Finance Assistant App UI Kit (Community)/🔒 Profile Settings.png`
- giải thích các route hiện có trong nhóm `/(profile)`
- nêu rõ những gì đã được giữ nguyên để không phá flow cũ
- ghi lại các thành phần mới được bổ sung để màn `Profile` và các màn con gần board hơn

## 2. Cấu trúc hiện tại của flow `Profile Settings`

### 2.1. Entry chính

Tab chính:

- `app/(tabs)/profile.tsx`

Đây là hub của toàn bộ khu vực cài đặt hồ sơ.

### 2.2. Route group con

Nhóm màn chi tiết:

- `app/(profile)/account.tsx`
- `app/(profile)/preferences.tsx`
- `app/(profile)/notifications.tsx`
- `app/(profile)/security.tsx`
- `app/(profile)/password.tsx`
- `app/(profile)/passcode.tsx`
- `app/(profile)/linked-accounts.tsx`
- `app/(profile)/support.tsx`
- `app/(profile)/result.tsx`

Layout:

- `app/(profile)/_layout.tsx`

Toàn bộ route group này dùng `Stack` không header để đồng bộ với phần finance/assistant detail flow.

## 3. State nền của `Profile Settings`

File:

- `context/profileSettingsContext.tsx`

Những nhóm state chính:

- `profile`
- `notifications`
- `security`
- `display`
- `linkedAccounts`
- `invite`
- `appRating`
- `exportStatusLabel`
- `feedbackDraft`

Ý nghĩa:

- đủ để render profile hub, account info, notification toggles, security toggles, linked account list, support/rating/invite
- hiện vẫn là mock/frontend state, chưa nối backend thật

## 4. Shared primitive đã được bổ sung

File:

- `components/profile-settings/ui.tsx`

Các primitive mới đáng chú ý:

- `ProfileSettingsPill`
- `ProfileSettingsStat`
- `ProfileSettingsBanner`

Các primitive cũ tiếp tục được dùng:

- `ProfileSettingsCard`
- `ProfileSettingsRow`
- `ProfileSettingsSwitchRow`
- `ProfileOptionChip`
- `ProfilePrimaryActions`

Ý nghĩa:

- không cần thay button hay route để làm màn đẹp hơn
- có thể bổ sung visual density bằng banner, stat, pill và card summary
- giữ cho toàn bộ flow cùng một ngôn ngữ thị giác

## 5. Data phụ thêm cho `Profile Settings`

File:

- `components/profile-settings/data.ts`

Các nhóm data mới:

- `premiumPerks`
- `aboutHighlights`
- `exportFormats`

Vai trò:

- làm card membership/account rõ hơn
- làm section `About Us` bớt chỉ có text
- làm export/data card gần kit hơn

## 6. Quyết định UX quan trọng

### 6.1. Giữ nguyên hệ button chính ở hub `Profile`

Theo yêu cầu hiện tại:

- không thay button nếu không bắt buộc
- ưu tiên bổ sung thay vì đổi hành vi

Vì vậy:

- quick actions vẫn giữ `Account`, `Preferences`, `Security`, `Support`
- các nhóm section vẫn giữ logic điều hướng cũ
- không đẻ thêm route vụn mới chỉ để bám 1:1 từng board state

### 6.2. Chỉ làm giàu phần hiển thị

Những gì được bổ sung chủ yếu là:

- banner
- stat cards
- pill
- preview rows
- section có thông tin dày hơn

Những gì cố ý không làm:

- không đổi CTA chính
- không chuyển group setting thành flow wizard
- không tạo thêm nhiều screen nhỏ chỉ để show loading hoặc confirm state

## 7. Những thay đổi ở màn hub `Profile`

File:

- `app/(tabs)/profile.tsx`

### 7.1. Những thứ được giữ nguyên

- các quick action card hiện có
- các nhóm section chính: `Workspace`, `Protection`, `Support & Rewards`, `Danger Zone`
- hướng điều hướng của từng row

### 7.2. Những gì được bổ sung

- `ProfileSettingsPill` cho phần plan/member status
- metric grid được đổi từ khối chia cột cứng sang stat card giàu thông tin hơn
- thêm `ProfileSettingsBanner` sau hero card để làm rõ trạng thái workspace
- phần đầu màn trở nên gần board hơn nhưng không thay button

### 7.3. Tác động UX

- thông tin quan trọng lên ngay đầu màn
- ít cảm giác “chỉ là list settings khô”
- vẫn không làm user phải học lại các nút cũ

## 8. Những thay đổi ở các màn con quan trọng

### 8.1. `account.tsx`

Điểm bổ sung:

- thêm `ProfileSettingsBanner` cho khu vực account
- thêm stat card cho `Membership` và `Latest export`
- thêm pill cho `CSV / PDF / JSON`
- thêm block `Premium perks active`

Giá trị:

- gần hơn với các account/export state trong board
- vẫn giữ nguyên hai CTA `Export Data` và `Manage Plan`

### 8.2. `notifications.tsx`

Điểm bổ sung:

- thêm stat card cho số lượng toggle đang bật
- thêm card hiển thị trạng thái `Quiet hours`, `Bill reminders`, `Digest cadence`
- thêm banner preview notification
- thêm pill nhóm `Billing`, `Security`, `Digest`

Giá trị:

- màn không còn chỉ là list switch
- gần hơn các state notification trong board mà không cần tách nhiều route

### 8.3. `security.tsx`

Điểm bổ sung:

- thêm security score stat
- thêm stat cho `2FA`, `Biometrics`, `Trusted devices`
- thêm security banner
- thêm pill nhỏ ở phần trusted devices

Giá trị:

- phản ánh rõ “security center” hơn
- hỗ trợ các màn `password` và `passcode` bằng một hub mạnh hơn

### 8.4. `linked-accounts.tsx`

Điểm bổ sung:

- thêm stat `Active sources` và `Pending sources`
- thêm banner `Connection Health`
- đổi trạng thái account từ text plain sang `ProfileSettingsPill`

Giá trị:

- dễ scan nhanh hơn
- gần bộ kit ở phần account/card management hơn

### 8.5. `support.tsx`

Điểm bổ sung:

- thêm banner `Premium Member`
- thêm pill cho referral code và số invite
- thêm stat card ở `About Us`

Giá trị:

- support screen không còn chỉ là một chuỗi card tách rời
- rating, live chat, invite và about gắn kết hơn

## 9. Những màn đã có sẵn và hiện vẫn hợp lý

### `preferences.tsx`

Màn này đã khá ổn vì:

- đã gộp `appearance`, `language`, `currency`
- có preview card
- không cần tách thêm các route nhỏ kiểu `Language`, `Currency` như board

### `password.tsx`

Màn này vẫn đang là bản tinh gọn hợp lý vì:

- input + confirm + result đã được nén còn một flow ngắn
- không cần bẻ lại thành nhiều step

### `passcode.tsx`

Màn này giữ keypad và confirm logic trong cùng screen:

- vừa gần board
- vừa ít friction hơn so với tách `Choose new passcode` và `Confirm your passcode`

### `result.tsx`

Shared result screen vẫn được giữ vì:

- tránh nhân bản quá nhiều success screen chỉ khác copy
- vẫn đủ tốt cho `profile`, `export`, `password`, `passcode`, `feedback`, `invite`

## 10. Những gì còn là bản tinh gọn, không phải 1:1 board

- không tạo từng màn độc lập cho mọi micro-state trong `Profile Settings`
- không tách `About Us`, `Invite`, `Rate App`, `Live Chat` thành từng route đơn lẻ
- không đổi hệ button hiện có trên tab `Profile`
- không dựng thêm các success/loading riêng nếu shared result hiện tại đã đủ

Đây là lựa chọn có chủ đích vì:

- app hiện tại đã có flow khá dày
- user quen với các button cũ
- ưu tiên bổ sung chất lượng hiển thị thay vì nở route và nở tap-count

## 11. Liên hệ với kiến trúc tổng thể

Các điểm kỹ thuật quan trọng:

- `ProfileSettingsProvider` được bọc ở `app/_layout.tsx`
- route group `/(profile)` đã được thêm vào root stack
- tab `profile` đóng vai trò hub, các màn con đi theo stack detail

Điều này giúp:

- state dùng chung xuyên suốt profile hub và các màn con
- không cần rehydrate riêng từng route
- dễ bổ sung tiếp nếu sau này muốn nối API thật

## 12. Kiểm tra sau khi cập nhật

Đã kiểm tra bằng:

- `pnpm lint`
- `npx expo export --platform android --clear`

Kết luận:

- `Profile Settings` hiện đã gần bộ kit hơn về nhịp card, stat và banner
- các button chính vẫn được giữ nguyên như trước
- flow không bị phân mảnh thêm, đúng hướng “bổ sung chứ không phá”
