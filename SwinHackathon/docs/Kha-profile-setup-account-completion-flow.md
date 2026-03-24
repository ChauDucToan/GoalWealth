# Kha - Profile Setup & Account Completion Flow

## 1. Mục tiêu của hạng mục

`Profile Setup & Account Completion` là một board dài trong thư mục `fin/` nhưng trước đó chưa có module tương ứng rõ trong source. Phần việc của ngày hôm nay là dựng lại flow này dưới nhánh `auth`, để sau khi người dùng `Sign Up` thành công có thể đi tiếp vào một onboarding/account completion flow hoàn chỉnh hơn.

## 2. Kiến trúc đã dùng

Flow được đặt tại:

- `app/(auth)/profile-setup`

Các file hạ tầng:

- `app/(auth)/profile-setup/_layout.tsx`
- `app/(auth)/profile-setup/_shared.tsx`
- `app/(auth)/profile-setup/_data.ts`
- `context/profileSetupContext.tsx`
- `hooks/use-profile-setup.tsx`

Ý nghĩa:

- `_layout.tsx` bọc toàn flow bằng `ProfileSetupProvider`
- `_shared.tsx` cung cấp shell chung, progress bar, back button, CTA style
- `_data.ts` chứa avatar options, bank list, notification options, plan options
- context giữ state onboarding đang chọn giữa nhiều màn

## 3. Cách flow được nối vào auth

Điểm nối chính nằm ở:

- `app/(auth)/signUp.tsx`

Sau khi validate email/password thành công, `handleCreateAccount` không còn dừng ở `console.log`, mà chuyển sang:

- `/(auth)/profile-setup/avatar`

Đây là một quyết định quan trọng vì nếu không nối vào `signUp`, toàn bộ flow mới sẽ chỉ tồn tại như route rời để test thủ công, chứ chưa thật sự là một phần của trải nghiệm đăng ký tài khoản.

## 4. Toàn bộ các screen đã dựng

Flow hiện tại gồm 24 bước:

1. `avatar.tsx`
2. `choose-avatar.tsx`
3. `avatar-uploading.tsx`
4. `avatar-invalid.tsx`
5. `link-bank.tsx`
6. `bank-search.tsx`
7. `bank-empty.tsx`
8. `bank-linking.tsx`
9. `bank-success.tsx`
10. `savings-account.tsx`
11. `face-id.tsx`
12. `otp.tsx`
13. `passcode.tsx`
14. `biometric.tsx`
15. `confirm-account.tsx`
16. `data-secure.tsx`
17. `privacy-policy.tsx`
18. `notifications.tsx`
19. `financial-score.tsx`
20. `finance-report.tsx`
21. `free-trial.tsx`
22. `pick-plan.tsx`
23. `plan-processing.tsx`
24. `premium-success.tsx`

## 5. Cách chia nhóm flow

### 5.1. Nhóm profile/avatar

- `avatar`
- `choose-avatar`
- `avatar-uploading`
- `avatar-invalid`

Nhóm này giải quyết phần đầu board thiết kế: chọn avatar, mô phỏng state uploading, và state ảnh lỗi.

### 5.2. Nhóm bank linking

- `link-bank`
- `bank-search`
- `bank-empty`
- `bank-linking`
- `bank-success`
- `savings-account`

Nhóm này mô phỏng lựa chọn ngân hàng, tìm kiếm tổ chức tài chính, trạng thái không tìm thấy kết quả, loading liên kết, thành công và chọn savings account.

### 5.3. Nhóm security setup

- `face-id`
- `otp`
- `passcode`
- `biometric`

Đây là cụm bảo mật. Mục tiêu là bám theo board thiết kế chứ chưa nối với biometric hay OTP thật.

### 5.4. Nhóm account completion và consent

- `confirm-account`
- `data-secure`
- `privacy-policy`
- `notifications`

Nhóm này được dùng để tạo cảm giác onboarding hoàn chỉnh hơn, đi từ xác nhận tài khoản sang consent/privacy rồi tới notifications.

### 5.5. Nhóm scoring, report và premium

- `financial-score`
- `finance-report`
- `free-trial`
- `pick-plan`
- `plan-processing`
- `premium-success`

Đây là nửa sau của board thiết kế, nơi onboarding được đẩy tới financial score, analysis, free trial explanation, chọn gói và success state.

## 6. State được giữ trong context

`profileSetupContext.tsx` hiện giữ những state đủ dùng cho frontend flow:

- `selectedAvatarId`
- `linkedBankId`
- `selectedSavingsAccountId`
- `notificationsEnabled`
- `selectedPlanId`

Lý do chọn phạm vi state như vậy:

- đủ để các màn có dữ liệu xuyên suốt thay vì chỉ là UI chết
- chưa cần kéo thêm field không ảnh hưởng tới hiển thị hiện tại
- giữ context nhỏ và dễ hiểu

## 7. Những vấn đề đã được phát hiện và sửa trong quá trình làm

### 7.1. `signUp` chưa nối flow

Ban đầu `Create Account` chỉ đi tới `console.log`. Việc này khiến flow mới dựng không thể vào theo trải nghiệm người dùng thật. Đã sửa bằng cách điều hướng thẳng sang route đầu của onboarding.

### 7.2. Progress bị lệch

Nửa đầu flow đang dùng `totalSteps={19}`, còn nửa sau dùng `24`. Đây là lỗi dễ gây cảm giác flow bị gãy. Đã chuẩn hóa toàn bộ về `24` bước.

### 7.3. Warnings import thừa

Một số screen phát sinh import thừa sau khi dựng nhanh nhiều state tương tự nhau. Đã dọn sạch để lint không còn cảnh báo cho module mới này.

## 8. Điều đã được kiểm tra

- route từ `Sign Up` sang `profile-setup` hoạt động
- back button trong shell có fallback hợp lý về `signUp`
- toàn bộ screen mới có progress thống nhất
- lint pass sau khi dọn warnings

Commit chứa phần này:

- `f5b987a` — `feat: add profile setup and financial goals flows`

## 9. Hạn chế hiện tại

1. chưa có upload ảnh thật
2. chưa có bank API hay institution search thật
3. chưa có OTP/passcode/biometric thực tế
4. plan selection và premium processing vẫn là mock flow
5. chưa persist onboarding progress nếu người dùng thoát giữa chừng

## 10. Nếu tiếp tục mở rộng

Hướng đi đúng nếu phát triển tiếp:

1. thêm persistence local cho tiến độ onboarding
2. nối sign up payload thật sang profile setup data
3. thay mock institution search bằng data service thật
4. tách một số screen loading/error thành reusable state component
5. nối phần plan selection sang subscription module nếu feature đó quay lại source

## 11. Kết luận

`Profile Setup & Account Completion` đã được đưa từ trạng thái chưa có module rõ ràng lên thành một auth flow hoàn chỉnh với 24 bước, có state nội bộ, có đường vào thật từ `Sign Up`, và có chất lượng source đủ sạch để tiếp tục mở rộng.
