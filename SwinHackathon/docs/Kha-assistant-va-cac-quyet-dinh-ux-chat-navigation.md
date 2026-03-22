# Kha - Assistant Và Các Quyết Định UX, Chat, Navigation

## 1. Mục tiêu của tài liệu

Tài liệu này mô tả riêng flow `Assistant` trong app, tập trung vào những phần đã được chỉnh trong đợt làm việc này.

Phạm vi:

- kiến trúc route của assistant
- intro flow trong tab assistant
- mối quan hệ giữa tab `assistant` và nhóm route `(assistant)`
- context/state của assistant
- các vấn đề UX đã gặp ở màn chat
- các quyết định sửa liên quan tới keyboard, bottom tab, safe area và composer

## 2. Kiến trúc hiện tại của flow assistant

### 2.1. Entry point ở tab

File:

- `app/(tabs)/assistant.tsx`

Vai trò:

- là màn tab chính của assistant
- đóng vai trò inbox/launcher của toàn bộ flow
- là nơi user nhìn thấy intro lần đầu hoặc danh sách thread sau khi intro đã được xem

### 2.2. Nhóm route phụ

Các file chính trong group `(assistant)`:

- `app/(assistant)/chat/[scenario].tsx`
- `app/(assistant)/settings.tsx`
- `app/(assistant)/upgrade.tsx`
- `app/(assistant)/voice.tsx`
- `app/(assistant)/receipt-upload.tsx`
- `app/(assistant)/receipt-scan.tsx`
- `app/(assistant)/reset-memory.tsx`
- `app/(assistant)/out-of-tokens.tsx`

Ý nghĩa:

- tab root không chứa hết mọi thứ
- nó đóng vai trò màn launcher, còn chat/settings/voice/receipt là các route con

## 3. Tầng state của assistant

### 3.1. File chính

- `context/assistantContext.tsx`

### 3.2. Những state quan trọng

Assistant context hiện quản lý các phần chính sau:

- `hasSeenAssistantIntro`
- `activeScenarioId`
- `conversation`
- `assistantSettings`

### 3.3. Các hành vi quan trọng

Các function quan trọng hiện có:

- `markAssistantIntroSeen()`
- `selectAssistantScenario(id)`
- `sendAssistantMessage(text)`
- `setAssistantSettings(patch)`
- `resetAssistantMemory()`
- `getAssistantScenario(id)`

### 3.4. Ý nghĩa kiến trúc

Cách tổ chức này cho thấy assistant hiện đang ở mức:

- frontend demo/prototype có state nội bộ tương đối rõ
- chưa là assistant backed by live LLM/session persistence thật
- nhưng đã đủ cho nhiều route trong cùng module chia sẻ một trạng thái conversation và scenario hiện tại

## 4. Intro flow trong `app/(tabs)/assistant.tsx`

### 4.1. Hành vi

Khi `hasSeenAssistantIntro = false`, tab assistant không vào inbox ngay mà hiển thị một chuỗi intro slide.

Màn intro gồm:

- artwork trung tâm
- title/body theo từng slide
- progress dots
- CTA chính của slide
- `Skip for now` nếu chưa ở slide cuối

### 4.2. Vì sao phần này quan trọng

Phần intro là nơi dễ phát sinh lỗi do layout nhiều, nội dung dài, và nằm trong tab có bottom tab bar ở dưới.

Trong quá trình test, đã có lỗi:

- nút `Skip for now` bị bottom tab che

### 4.3. Cách đã xử lý

Hướng sửa là:

- tăng khoảng chừa đáy hợp lý cho intro content
- căn chỉnh lại layout để CTA cuối không rơi vào vùng tab bar

### 4.4. Ý nghĩa

Đây là một fix nhỏ nhưng quan trọng, vì nếu một nút phụ như `Skip for now` bị che thì onboarding sẽ có cảm giác lỗi ngay từ đầu.

## 5. Màn inbox sau intro trong `app/(tabs)/assistant.tsx`

### 5.1. Vai trò

Khi `hasSeenAssistantIntro = true`, tab assistant trở thành `Conversation Inbox`.

Các khối chính hiện có:

- header giới thiệu inbox
- hero card với thread đang active
- quick CTA tiếp tục chat hoặc upgrade/manage plan
- danh sách recent conversations

### 5.2. Vấn đề từng gặp

Ở trạng thái này, khi cuộn xuống cuối, nội dung cũng từng bị bottom tab che.

### 5.3. Cách đã xử lý

- tăng phần chừa đáy cho scroll content
- để block cuối không chạm vào vùng bottom tab

### 5.4. Ý nghĩa

Assistant tab là một màn danh sách dài. Nếu phần cuối luôn bị che, trải nghiệm dùng thread list sẽ khó chịu và nhìn giống layout chưa hoàn thiện.

## 6. Logic điều hướng từ tab assistant sang chat/settings/upgrade

### 6.1. Các route chính

Từ `app/(tabs)/assistant.tsx`, có các điều hướng nổi bật:

- settings -> `/(assistant)/settings`
- upgrade/manage plan -> `/(assistant)/upgrade`
- open active thread -> `/(assistant)/chat/[scenario]`

### 6.2. Ý nghĩa

Điều này cho thấy tab assistant là lớp entry, còn chat detail là route tách riêng.

Hệ quả:

- khi user rời tab root để vào `(assistant)/chat/[scenario]`, họ đang đi sang route group khác ngoài `(tabs)`
- vì vậy bottom tab không còn hiện ở chat detail là hành vi bình thường theo cấu trúc navigator hiện tại

## 7. Màn `app/(assistant)/chat/[scenario].tsx`

### 7.1. Vai trò

Đây là màn chat detail chính của assistant.

Nó gồm các phần lớn:

- header có back/settings
- summary card mô tả thread hiện tại
- conversation view
- tool menu
- composer/input để gửi tin nhắn

### 7.2. Liên hệ với context

Màn này đọc state từ assistant context để lấy:

- scenario đang active
- conversation hiện tại
- assistant settings
- hàm gửi message

Ngoài ra màn cũng dùng route param `scenario` để đồng bộ scenario đang mở với context.

## 8. Các vấn đề UX từng xuất hiện ở chat screen

### 8.1. Keyboard có hiện nhưng input bị che

Vấn đề:

- user bấm vào ô nhập
- keyboard bật lên
- nhưng composer/input không đi lên theo đúng cách, bị bàn phím che mất

Nguyên nhân gốc:

- composer từng có cấu trúc dễ xung đột với layout đáy màn
- phần scroll và phần dock chưa phối hợp đúng với `KeyboardAvoidingView`

### 8.2. Keyboard đóng xong để lại khoảng trắng thừa

Sau khi sửa để input không bị che, lại phát sinh vấn đề khác:

- đóng keyboard xong, dưới composer còn dư một khoảng trống lớn

Nguyên nhân:

- padding đáy được chừa quá tay để né keyboard/tab area

### 8.3. Focus input không luôn rõ ràng

Một vấn đề khác là tap vào vùng composer nhưng input chưa chắc được focus ngay theo mong muốn.

## 9. Cách đã xử lý chat UX

### 9.1. Điều chỉnh `KeyboardAvoidingView`

Màn chat hiện dùng `KeyboardAvoidingView` với behavior phụ thuộc platform.

Ý nghĩa:

- khi keyboard lên, toàn layout đáy có thể dịch lên cùng input tốt hơn

### 9.2. Chỉnh lại flow layout của composer

Composer hiện đã được kéo về flow layout dễ kiểm soát hơn, thay vì tiếp tục phụ thuộc vào một dock absolute dễ lỗi.

### 9.3. Tăng khả năng focus input

Đã thêm:

- `inputRef`
- gọi `focus()` khi bấm vào composer hoặc vùng input
- giữ `showSoftInputOnFocus`

### 9.4. Tinh chỉnh padding đáy

Sau khi keyboard handling tốt hơn, phần padding đáy đã được giảm lại để tránh khoảng trắng dư khi keyboard đóng.

### 9.5. Giữ tool menu đi cùng composer

Tool menu của voice/receipt nằm sát composer nên các chỉnh sửa này cũng phải đảm bảo:

- tool menu không bị đứt khỏi input
- khi mở tool menu vẫn không phá layout đáy

## 10. Vì sao phần chat cần tài liệu riêng

Assistant chat là một ví dụ điển hình cho loại màn:

- nhìn qua thì tưởng là UI đơn giản
- nhưng thực tế rất nhạy với runtime behavior

Những thứ cần đúng đồng thời gồm:

- route param
- context state
- scroll
- keyboard
- safe area
- bottom spacing
- composer focus
- action menu

Vì vậy nếu chỉ xem nó như “một màn chat nữa” thì rất dễ sửa hỏng.

## 11. Những quyết định UX đáng chú ý

### 11.1. Intro và inbox ở cùng một tab root

Quyết định này giúp:

- user không cần đi qua thêm route riêng chỉ để xem intro
- logic `hasSeenAssistantIntro` đơn giản hơn

Nhưng đổi lại:

- file `app/(tabs)/assistant.tsx` phải quản hai trạng thái màn khá khác nhau

### 11.2. Chat detail tách khỏi tab root

Quyết định này giúp:

- thread chat có thể được coi như màn detail riêng
- dễ nối thêm settings/voice/receipt trong cùng nhóm assistant

Nhưng đổi lại:

- bottom tab không còn khi user vào chat detail

### 11.3. Settings và upgrade tách khỏi nội dung chat

Đây là hướng đúng vì:

- chat không nên ôm quá nhiều thứ không liên quan trực tiếp tới hội thoại
- settings/plan là route phụ trợ, nên có màn riêng

## 12. Nếu tiếp tục mở rộng assistant thì nên đi theo hướng nào

Các hướng hợp lý tiếp theo:

1. tách composer thành component riêng để giảm độ phức tạp của `chat/[scenario].tsx`
2. thêm auto-scroll xuống cuối khi có message mới
3. thêm persistence cho conversation theo scenario thay vì chỉ giữ state nội bộ đơn giản
4. tách intro slides ra thành component hoặc file riêng nếu tiếp tục mở rộng onboarding
5. nếu cần giữ bottom tab trong chat thì phải xem lại toàn bộ cấu trúc navigator, không chỉ sửa UI

## 13. Kết luận

Flow `Assistant` trong app hiện đã vượt qua mức demo screen đơn lẻ.

Nó đã có:

- entry tab rõ
- intro logic rõ
- inbox logic rõ
- route detail rõ
- context state riêng
- các fix runtime quan trọng cho mobile

Điểm quan trọng nhất là phần assistant không chỉ được làm cho “đúng ảnh”, mà đã được sửa để dùng đỡ khó chịu hơn trên thiết bị thật.
