# HeheBoiz - Snapshot Worktree Và Các Thay Đổi Gần Đây

## 1. Mục tiêu của tài liệu

Tài liệu này được tạo để gom lại toàn bộ các thay đổi lớn của worktree trong giai đoạn làm việc gần đây, thay vì để thông tin bị rải rác ở nhiều file riêng lẻ.

Mục tiêu:

- ghi lại các thay đổi mới nhất chưa được phản ánh đầy đủ trong các tài liệu cũ
- mô tả theo module và theo tác động UX/UI
- giúp kiểm tra nhanh xem “nãy giờ đã đổi những gì”
- làm cầu nối giữa file tổng hợp lịch sử và các tài liệu chuyên đề sâu hơn

## 2. Bức tranh tổng quan của đợt thay đổi gần đây

Trong snapshot worktree hiện tại, các nhóm thay đổi lớn tập trung vào:

1. hoàn thiện `Financial Assessment`
2. hoàn thiện `Financial Goals`
3. đưa `Smart Budgeting` ra vị trí dễ vào hơn và giữ được `AppTabBar`
4. xử lý khoảng đệm an toàn để nội dung cuối không bị `AppTabBar` che
5. tinh gọn `Assistant` inbox để scale tốt hơn khi có nhiều conversation
6. refactor lại toàn bộ `Profile Setup & Account Completion`
7. bổ sung tiếp `Profile Settings` theo board thiết kế nhưng không phá hệ button hiện có
8. cập nhật docs `HeheBoiz-*` để phản ánh đúng snapshot mới

## 3. Nhóm thay đổi về `AppTabBar`, safe area và trải nghiệm tab

### 3.1. Hook tránh tab bar che nội dung

File mới:

- `hooks/use-tab-bar-clearance.ts`

Hook này được dùng để:

- tính khoảng đệm đáy an toàn theo floating `AppTabBar`
- tránh việc nút cuối, CTA cuối hoặc phần content cuối bị tab bar che

Các tab root đã được áp dụng:

- `app/(tabs)/assistant.tsx`
- `app/(tabs)/home.tsx`
- `app/(tabs)/transactions.tsx`
- `app/(tabs)/insights.tsx`
- `app/(tabs)/achievements.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/search-notifications.tsx`
- `app/(tabs)/news-resources.tsx`

### 3.2. Tác động trực tiếp tới UX

Các lỗi đã được giải quyết:

- `Skip for now` trong intro assistant không còn bị che
- các section cuối trong tab root dễ đọc và dễ bấm hơn
- không còn phải vá riêng từng màn bằng `paddingBottom` cứng

## 4. Nhóm thay đổi về `Assistant`

### 4.1. Intro assistant

File:

- `app/(tabs)/assistant.tsx`

Điểm thay đổi:

- intro screen được bọc theo cách cho phép cuộn tự nhiên hơn
- CTA cuối không còn rơi vào vùng `AppTabBar`

### 4.2. Conversation inbox

File:

- `app/(tabs)/assistant.tsx`

Điểm thay đổi:

- bỏ kiểu mỗi conversation card một accent/một icon khác nhau
- thống nhất tất cả thread card dùng một icon `forum`
- dùng cùng một tông màu hệ thống
- bỏ hẳn hàng tag/chip phụ ở cuối card

Ý nghĩa UX:

- khi số lượng thread tăng nhiều, inbox sẽ đỡ loạn màu
- không cần nghĩ bài toán “thẻ mới chọn màu gì, icon gì”
- chỉ còn tên conversation là điểm khác biệt chính

## 5. Nhóm thay đổi về `Smart Budgeting`

### 5.1. Đưa `Smart Budgeting` ra tab hub riêng

Files liên quan:

- `app/(tabs)/smart-budgeting.tsx`
- `components/smart-budgeting/SmartBudgetingHomeScreen.tsx`
- `app/(finance)/smart-budgeting/index.tsx`
- `app/(tabs)/_layout.tsx`
- `components/navigation/AppTabBar.tsx`
- `app/_layout.tsx`

Những gì đã làm:

- tạo tab route mới cho hub `Smart Budgeting`
- tách hub thành component dùng chung
- lift `SmartBudgetingProvider` lên root
- action `Smart Budgeting` ở nút giữa của `AppTabBar` mở đúng tab route mới

Kết quả:

- vào `Smart Budgeting` từ hub mới vẫn giữ `AppTabBar`
- trải nghiệm giống hơn với `Community`

### 5.2. Header của hub `Smart Budgeting`

Các chỉnh sửa:

- ẩn nút back ở header hub
- thêm icon/badge ở vùng đầu để header bớt trống
- tăng bottom inset spacing riêng để máy thấp/lùn không bị tab bar che phần cuối

Files liên quan:

- `components/finance/FinanceScaffold.tsx`
- `components/smart-budgeting/SmartBudgetingHomeScreen.tsx`

### 5.3. Điều hướng cũ vẫn còn

Entry cũ từ `Insights` vẫn được giữ:

- `app/(tabs)/insights.tsx`

Ý nghĩa:

- vừa có entry mới dễ thấy hơn
- vừa không làm hỏng đường vào cũ

## 6. Nhóm thay đổi về `Financial Assessment`

### 6.1. Tình trạng trước đó

Flow assessment cũ bám board khá sát về số lượng câu hỏi nhưng bị quá vụn:

- gần như `1 câu hỏi = 1 màn`
- tổng cộng hơn 20 route nhỏ

### 6.2. Hướng refactor mới

Flow chính đã được gom lại thành 5 block lớn hơn:

- `essentials.tsx`
- `income-profile.tsx`
- `planning.tsx`
- `resilience.tsx`
- `commitment.tsx`

File entry:

- `app/(finance)/financial-assessment/index.tsx`

Files dùng chung:

- `components/financial-assessment/shared.tsx`
- `components/financial-assessment/data.ts`

### 6.3. Những gì được giữ và những gì được tối ưu

Giữ:

- gần đủ nội dung của assessment board
- hero/summary card, grouped choice card, waveform confirmation

Tối ưu:

- bớt số lần bấm `Continue`
- giảm mệt mỏi khi đi assessment trên điện thoại
- gom các câu liên quan logic vào cùng block

## 7. Nhóm thay đổi về `Financial Goals`

### 7.1. Flow mới hiện tại

Các file chính:

- `app/(finance)/financial-goals/index.tsx`
- `app/(finance)/financial-goals/create.tsx`
- `app/(finance)/financial-goals/[goalId].tsx`
- `app/(finance)/financial-goals/account.tsx`
- `app/(finance)/financial-goals/transfer.tsx`
- `app/(finance)/financial-goals/history.tsx`
- `app/(finance)/financial-goals/delete.tsx`
- `app/(finance)/financial-goals/result.tsx`
- `components/financial-goals/data.ts`
- `components/financial-goals/ui.tsx`

### 7.2. Những gì đã thay đổi theo UX

- thêm intro first-time-only cho goals
- hub goals mạnh hơn, có overview rõ hơn
- create goal được giữ ở một màn gộp thay vì wizard quá vụn
- detail goal có ring, milestones, activity, add money, recurring transfer, delete

### 7.3. Cách vào app

Từ `Home`:

- bấm `Track` trong section `Goals`
- hoặc bấm trực tiếp vào goal card

## 8. Nhóm thay đổi về `Profile Setup & Account Completion`

### 8.1. Refactor lớn nhất ở vùng auth gần đây

Các file chính:

- `app/(auth)/profile-setup/avatar.tsx`
- `app/(auth)/profile-setup/link-bank.tsx`
- `app/(auth)/profile-setup/face-id.tsx`
- `app/(auth)/profile-setup/confirm-account.tsx`
- `app/(auth)/profile-setup/financial-score.tsx`
- `app/(auth)/profile-setup/pick-plan.tsx`
- `app/(auth)/profile-setup/premium-success.tsx`

Files nền:

- `components/profile-setup/shared.tsx`
- `components/profile-setup/data.ts`
- `context/profileSetupContext.tsx`

### 8.2. Hướng refactor

Từ bản cũ nhiều route nhỏ:

- avatar
- upload
- invalid
- bank search
- bank linking
- bank success
- savings
- face id
- otp
- passcode
- biometric
- privacy
- notifications
- score
- report
- trial
- plan processing

đã chuyển thành flow tinh gọn:

1. avatar
2. link bank + savings
3. security
4. account review + privacy + notifications
5. score + report + trial
6. plan
7. success

### 8.3. Redirect tương thích ngược

Các route cũ như:

- `choose-avatar`
- `bank-search`
- `otp`
- `privacy-policy`
- `free-trial`
- `plan-processing`

vẫn còn nhưng được đổi thành redirect về flow mới.

## 9. Nhóm thay đổi về `Profile Settings`

### 9.1. Kiến trúc đã có

Các file chính:

- `app/(tabs)/profile.tsx`
- `app/(profile)/*`
- `components/profile-settings/ui.tsx`
- `components/profile-settings/data.ts`
- `context/profileSettingsContext.tsx`

### 9.2. Những gì đã bổ sung gần đây

Ở hub `Profile`:

- thêm stat card cho phần đầu
- thêm banner premium/workspace
- làm profile card giàu thông tin hơn
- giữ nguyên quick action và các button chính như trước

Ở các màn con:

- `account.tsx`: thêm export format pill, premium perks, data/membership stat
- `notifications.tsx`: thêm alert stats, banner preview, pill group
- `security.tsx`: thêm security score, trusted device stats, security banner
- `linked-accounts.tsx`: thêm active/pending stats, banner, pill trạng thái
- `support.tsx`: thêm premium banner, referral pill, about stat

### 9.3. Quy tắc quan trọng được giữ

- không thay hệ button hiện tại nếu không bắt buộc
- ưu tiên bổ sung card/preview/state hiển thị
- không tách thêm quá nhiều route nhỏ

## 10. Nhóm thay đổi về intro lần đầu

File chính:

- `context/introPreferencesContext.tsx`

Hiện đã có persistence bằng `AsyncStorage` cho các cờ:

- `hasSeenWelcome`
- `hasSeenAssistantIntro`
- `hasSeenSubscriptionIntro`
- `hasSeenFinancialGoalsIntro`
- `hasSeenCommunityIntro`
- `hasSeenSmartBudgetSetupIntro`

Ý nghĩa:

- các màn intro/landing không lặp lại ở mỗi lần mở app
- app bớt cảm giác demo lặp đi lặp lại

## 11. Nhóm thay đổi về `Subscription Management`

Flow này không phải phần mới nhất của đợt này, nhưng vẫn là một phần quan trọng của snapshot hiện tại.

Những gì còn đáng lưu ý:

- `Add Plan` đã được gom về một màn thay vì wizard dài
- có intro landing first-time-only
- có các màn phụ như `history`, `payments`, `stats`, `confirm`
- phần `Stats & Insights` đã được dọn lại để chart nổi bật hơn

Tài liệu chi tiết:

- `docs/HeheBoiz-flow-subscription-management.md`

## 12. Nhóm thay đổi về tài liệu

Trong đợt gần đây, bộ `HeheBoiz-*` đã được mở rộng thêm:

- `HeheBoiz-profile-setup-va-account-completion.md`
- `HeheBoiz-profile-settings-va-cac-bo-sung-theo-ui-kit.md`
- file này: `HeheBoiz-cap-nhat-worktree-va-cac-thay-doi-gan-day.md`

Ngoài ra:

- `README.md` trong `docs` đã được cập nhật để trỏ tới các tài liệu mới
- các file `HeheBoiz-*` cũ như `flow`, `kien-truc`, `responsive`, `tong-hop` cũng đã được chỉnh lại để phản ánh snapshot mới hơn

## 13. Những gì chưa triển khai nhưng đã có kế hoạch

Một kế hoạch đã được ghi tài liệu nhưng chưa code ở vòng này:

- OCR bill bằng camera điện thoại

Tài liệu:

- `docs/HeheBoiz-ke-hoach-ocr-bill-bang-camera.md`

Lưu ý:

- đây hiện là kế hoạch triển khai sau
- chưa phải trạng thái đã code xong trong repo

## 14. Kiểm tra kỹ thuật đã làm trong đợt gần đây

Các bước verify đã được dùng lặp lại:

- `pnpm lint`
- `npx expo export --platform android --clear`

Những bước này đã được dùng sau các đợt refactor lớn như:

- `Profile Setup`
- `Profile Settings`
- `Financial Assessment`
- các fix route/import

## 15. Kết luận

Snapshot worktree hiện tại không chỉ là vài chỉnh sửa giao diện nhỏ, mà là một đợt làm dày lại khá nhiều flow quan trọng của app:

- onboarding/auth rõ hơn
- profile/settings hoàn chỉnh hơn
- assessment/goals usable hơn
- smart budgeting dễ vào hơn
- assistant/tab experience gọn hơn
- hệ thống UI chung mạnh hơn

Đây là lý do cần có tài liệu snapshot riêng này: để nhìn được toàn cảnh thay đổi gần đây mà không phải tự nối ghép từ nhiều file rời.
