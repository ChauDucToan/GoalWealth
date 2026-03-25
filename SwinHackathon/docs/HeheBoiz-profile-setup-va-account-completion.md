# HeheBoiz - Flow `Profile Setup & Account Completion`

## 1. Mục tiêu của tài liệu

Tài liệu này ghi lại riêng phần `Profile Setup & Account Completion` sau đợt refactor gần đây để:

- đối chiếu với board `finpal_ AI Finance Assistant App UI Kit (Community)/🔒 Profile Setup & Account Completion.png`
- giải thích vì sao flow cũ bị đánh giá là quá vụn
- mô tả rõ các màn mới đã được gom bước như thế nào
- ghi lại các quyết định UX/UI để nếu cần chỉnh tiếp vẫn giữ đúng tinh thần hiện tại

## 2. Trạng thái trước khi refactor

Trước đợt refactor, repo đã có rất nhiều route con trong:

- `app/(auth)/profile-setup/avatar.tsx`
- `app/(auth)/profile-setup/choose-avatar.tsx`
- `app/(auth)/profile-setup/avatar-uploading.tsx`
- `app/(auth)/profile-setup/avatar-invalid.tsx`
- `app/(auth)/profile-setup/link-bank.tsx`
- `app/(auth)/profile-setup/bank-search.tsx`
- `app/(auth)/profile-setup/bank-empty.tsx`
- `app/(auth)/profile-setup/bank-linking.tsx`
- `app/(auth)/profile-setup/bank-success.tsx`
- `app/(auth)/profile-setup/savings-account.tsx`
- `app/(auth)/profile-setup/face-id.tsx`
- `app/(auth)/profile-setup/otp.tsx`
- `app/(auth)/profile-setup/passcode.tsx`
- `app/(auth)/profile-setup/biometric.tsx`
- `app/(auth)/profile-setup/confirm-account.tsx`
- `app/(auth)/profile-setup/data-secure.tsx`
- `app/(auth)/profile-setup/privacy-policy.tsx`
- `app/(auth)/profile-setup/notifications.tsx`
- `app/(auth)/profile-setup/financial-score.tsx`
- `app/(auth)/profile-setup/finance-report.tsx`
- `app/(auth)/profile-setup/free-trial.tsx`
- `app/(auth)/profile-setup/pick-plan.tsx`
- `app/(auth)/profile-setup/plan-processing.tsx`
- `app/(auth)/profile-setup/premium-success.tsx`

Nhận xét quan trọng:

- số lượng route bám board khá tốt về mặt “state coverage”
- nhưng trải nghiệm thực tế quá nhiều bước
- nhiều màn chỉ để hiện một trạng thái ngắn như `uploading`, `invalid`, `success`, `otp`, `privacy`
- điều này làm flow mất nhịp, nhất là trên điện thoại

## 3. Hướng refactor đã chọn

Thay vì cố bám 1:1 từng state như board, flow đã được gom thành 6 bước chính và 1 màn kết thúc:

1. `avatar`
2. `link-bank`
3. `face-id`
4. `confirm-account`
5. `financial-score`
6. `pick-plan`
7. `premium-success`

Lý do:

- giữ được phần visual quan trọng của bộ kit
- giảm số lần bấm `Continue`
- gom các state phụ thành inline state hoặc card trong cùng màn
- dễ đọc hơn cho user mới
- code maintainable hơn so với 20+ route vụn

## 4. Các file nền đã được mở rộng

### 4.1. Context

File:

- `context/profileSetupContext.tsx`

Những state mới được thêm:

- `avatarMode`
- `faceIdEnabled`
- `otpCode`
- `passcode`
- `biometricEnabled`

Ý nghĩa:

- flow không còn chỉ giữ avatar/bank/plan
- các màn bảo mật mới có state thật để render đồng bộ
- dữ liệu đủ để build lại preview, badge và code boxes theo đúng tinh thần UI kit

### 4.2. Data mock

File:

- `components/profile-setup/data.ts`

Những nhóm data mới:

- `avatarHighlights`
- `bankHighlights`
- `securityHighlights`
- `financeReportHighlights`
- `trialBenefits`

Vai trò:

- làm các card phụ, stat nhỏ, highlight bar và report section trông đầy hơn
- tránh hardcode text rải rác trong từng màn

### 4.3. Shared primitive

File:

- `components/profile-setup/shared.tsx`

Những primitive mới:

- `SetupSurface`
- `SetupPill`
- `SetupSectionTitle`
- `SetupCodePreview`

Ngoài ra:

- header progress được đổi sang dạng badge + progress track gọn hơn
- `ProfileSetupShell` giữ layout thống nhất cho toàn flow

## 5. Mô tả chi tiết từng màn mới

### 5.1. `avatar.tsx`

File:

- `app/(auth)/profile-setup/avatar.tsx`

Vai trò mới:

- gộp màn giới thiệu avatar
- gộp lựa chọn `Use avatar` và `Upload image`
- gộp luôn phần chọn avatar cụ thể
- thay phần `uploading` và `invalid` bằng trạng thái inline

Điểm nổi bật:

- hero preview lớn ở nửa trên
- switch giữa `avatar` và `upload`
- grid avatar bên dưới
- card highlight để giữ cảm giác “profile identity” từ kit

Quyết định UX:

- không ép người dùng đi qua `choose-avatar` rồi lại `avatar-uploading`
- nếu sau này wire ảnh thật, upload success/error có thể hiển thị tại chỗ

### 5.2. `link-bank.tsx`

File:

- `app/(auth)/profile-setup/link-bank.tsx`

Vai trò mới:

- gộp bank intro
- gộp bank search
- gộp bank empty state
- gộp bank success state
- gộp luôn chọn `savings account`

Điểm nổi bật:

- `InputField` search institution
- danh sách bank có active selection
- empty state hiển thị inline
- success card `Bank Linked`
- ngay phía dưới là danh sách savings account

Quyết định UX:

- thay vì `search -> loading -> success -> savings account`, toàn bộ được gom thành một màn thao tác liên tục
- điều này đúng hơn với user intent: “liên kết tài khoản và chọn nơi dùng cho savings”

### 5.3. `face-id.tsx`

File:

- `app/(auth)/profile-setup/face-id.tsx`

Vai trò mới:

- gộp `Face ID`
- gộp `Fingerprint`
- gộp `OTP`
- gộp `Passcode`

Điểm nổi bật:

- hero `fingerprint` lớn
- hai switch riêng cho Face ID và fingerprint
- code boxes cho OTP
- code boxes cho passcode
- các security highlight card ở cuối

Quyết định UX:

- user không cần đi qua từng route nhỏ chỉ để nhập 4 số rồi `Continue`
- vẫn giữ được phần card/code visual của bộ kit
- dữ liệu bảo mật trở nên dễ review hơn trong cùng một block

### 5.4. `confirm-account.tsx`

File:

- `app/(auth)/profile-setup/confirm-account.tsx`

Vai trò mới:

- gộp review account
- gộp `data secure`
- gộp `privacy summary`
- gộp `notifications`

Điểm nổi bật:

- hero profile summary
- pill hiển thị bank và savings account đang chọn
- security summary nhỏ
- danh sách trust/privacy rows
- switch notification tổng và notification detail cards
- hàng xác nhận privacy trước khi cho qua bước tiếp

Quyết định UX:

- tránh bắt user đi qua nhiều màn toàn text
- legal/trust content vẫn còn, nhưng được đóng gói ngắn và hữu dụng hơn

### 5.5. `financial-score.tsx`

File:

- `app/(auth)/profile-setup/financial-score.tsx`

Vai trò mới:

- gộp `financial score`
- gộp `finance report`
- gộp `free trial explanation`

Điểm nổi bật:

- ring score lớn
- breakdown rows
- finance report cards
- trial benefit block cuối màn

Quyết định UX:

- đây là “payoff moment” sau khi setup xong
- thay vì 3 màn nối tiếp nhau chỉ để đọc thông tin, mọi thứ được gom vào một màn tổng kết giàu visual hơn

### 5.6. `pick-plan.tsx`

File:

- `app/(auth)/profile-setup/pick-plan.tsx`

Vai trò mới:

- giữ plan selection là một màn riêng
- bỏ màn `plan-processing`

Điểm nổi bật:

- trial summary ở đầu
- plan card bám phong cách kit
- badge `Popular` / `Best Value`
- bullet list rõ ràng

Quyết định UX:

- processing giả lập bị bỏ vì không tạo thêm giá trị thật cho user
- giữ một màn chọn plan + một màn success là đủ

### 5.7. `premium-success.tsx`

File:

- `app/(auth)/profile-setup/premium-success.tsx`

Vai trò:

- kết thúc flow
- xác nhận trial/premium active
- dẫn người dùng về `home`

Điểm nổi bật:

- hero badge premium
- danh sách unlocks
- hai CTA cuối: về `home` hoặc về `signIn`

## 6. Tương thích ngược với route cũ

Các route cũ không bị xóa trắng. Chúng được đổi thành redirect để:

- link cũ không hỏng
- expo-router không báo route thiếu
- người test cũ vẫn vào đúng flow mới

Các file redirect tiêu biểu:

- `choose-avatar.tsx`
- `avatar-uploading.tsx`
- `avatar-invalid.tsx`
- `bank-search.tsx`
- `bank-empty.tsx`
- `bank-linking.tsx`
- `bank-success.tsx`
- `savings-account.tsx`
- `otp.tsx`
- `passcode.tsx`
- `biometric.tsx`
- `data-secure.tsx`
- `privacy-policy.tsx`
- `notifications.tsx`
- `finance-report.tsx`
- `free-trial.tsx`
- `plan-processing.tsx`

Ý nghĩa:

- flow chính đã sạch hơn
- nhưng compatibility vẫn được giữ

## 7. Điểm vào của flow

Điểm vào từ app:

- `app/welcome.tsx` -> `Get Started`
- `app/(auth)/signIn.tsx` -> `Create New Account`
- `app/(auth)/signUp.tsx` -> `Create Account`

Route chính của flow:

- `/(auth)/profile-setup/avatar`

Thứ tự điều hướng hiện tại:

1. `avatar`
2. `link-bank`
3. `face-id`
4. `confirm-account`
5. `financial-score`
6. `pick-plan`
7. `premium-success`

## 8. Những gì đã giống kit hơn

- có nhiều hero card và preview lớn hơn
- có pill/badge và stat nhỏ thay vì chỉ list text
- có ring score
- có plan card giàu thông tin
- có security block và code preview gần board hơn
- có cảm giác “hoàn tất account setup” rõ hơn

## 9. Những gì vẫn là bản tinh gọn, không bám 1:1

- không giữ mọi loading/progress screen giả lập
- không tách OTP/passcode thành nhiều route độc lập
- không tách privacy/notification thành nhiều màn riêng
- không giữ plan processing screen riêng

Đây là quyết định có chủ đích để:

- giảm friction
- giữ flow ngắn
- tránh cảm giác demo bị kéo lê quá lâu

## 10. Kiểm tra sau khi triển khai

Đã kiểm tra bằng:

- `pnpm lint`
- `npx expo export --platform android --clear`

Kết luận:

- flow `Profile Setup & Account Completion` hiện tại đã gần board hơn nhiều về visual
- đồng thời hợp lý hơn về UX so với bản route cũ quá phân mảnh
