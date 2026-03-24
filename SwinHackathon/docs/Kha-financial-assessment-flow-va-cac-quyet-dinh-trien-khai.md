# Kha - Financial Assessment Flow Và Các Quyết Định Triển Khai

## 1. Mục tiêu của hạng mục

Hạng mục này được triển khai để bổ sung phần `Comprehensive Financial Assessment` vốn trước đó chưa có module tương ứng rõ trong source hiện tại, dù đã xuất hiện trong thư mục thiết kế `fin/`.

Mục tiêu ban đầu không phải là làm ra một hệ khảo sát tài chính đầy đủ logic sản phẩm thật, mà là:

- dựng được chuỗi màn hình đủ để xem UI trong app
- tổ chức code theo route group riêng để dễ mở rộng
- giữ được state cục bộ của flow
- để sau này có thể refactor UX tốt hơn mà không phải viết lại từ đầu

## 2. Cấu trúc module đã tạo

Module assessment được đặt tại:

- `app/(finance)/financial-assessment`

Các file nền tảng:

- `app/(finance)/financial-assessment/_layout.tsx`
- `app/(finance)/financial-assessment/_shared.tsx`
- `app/(finance)/financial-assessment/_data.ts`
- `context/financialAssessmentContext.tsx`
- `hooks/use-financial-assessment.tsx`

Ý nghĩa của cách tổ chức này:

- `_layout.tsx` giữ toàn bộ flow trong một stack riêng
- `_shared.tsx` gom shell, progress UI, button pattern, spacing pattern để các màn đồng nhất
- `_data.ts` chứa option lists và text dùng lặp lại cho nhiều bước
- `financialAssessmentContext.tsx` giữ câu trả lời xuyên suốt flow
- `use-financial-assessment.tsx` giúp screen code gọn hơn khi đọc/ghi state

## 3. Những screen đã được tạo

Toàn bộ flow hiện tại gồm 21 màn chính:

1. `full-name.tsx`
2. `purpose.tsx`
3. `occupation.tsx`
4. `income-source.tsx`
5. `monthly-income.tsx`
6. `savings-rate.tsx`
7. `pay-frequency.tsx`
8. `spending-categories.tsx`
9. `outstanding-debt.tsx`
10. `financial-goal.tsx`
11. `goal-deadline.tsx`
12. `expense-tracking.tsx`
13. `retirement-age.tsx`
14. `dependents.tsx`
15. `finance-situation.tsx`
16. `emergency-fund.tsx`
17. `emergency-months.tsx`
18. `spending-behaviour.tsx`
19. `biggest-challenge.tsx`
20. `commitment-words.tsx`
21. `voice-confirmation.tsx`

Ngoài ra có thêm:

- `index.tsx` làm entry screen để giới thiệu flow và review block

## 4. Cách nối flow vào app

Flow này được nối vào `Home` thông qua Quick Action `Assess`.

Các file liên quan:

- `components/home/mock-data.ts`
- `app/(tabs)/home.tsx`

Lý do chọn `Home` làm entry:

- dễ test nhất
- hợp ngữ nghĩa với assessment hơn việc nhét vào `Profile`
- không làm tăng số lượng tab hay route root không cần thiết

## 5. Phương pháp dựng flow

### 5.1. Chia làm nhiều block

Flow được làm theo từng block thay vì cố dựng toàn bộ trong một lượt. Đây là quyết định có chủ ý để tránh:

- viết sai route sequence quá dài
- thiếu kiểm thử trung gian
- khó xác định bước nào đang lỗi khi lint hoặc runtime có vấn đề

Thứ tự làm thực tế:

1. block 1: basic identity và income setup
2. block 2: spending, debt, goal
3. block 3: retirement, dependents, emergency, spending behavior
4. block cuối: challenge, commitment, voice confirmation

### 5.2. Dùng context cục bộ

Flow này không dùng global app state vì:

- dữ liệu chỉ phục vụ nội bộ assessment
- chưa có yêu cầu backend hoặc persistence thật
- không cần khiến các context toàn app phình thêm

### 5.3. Dùng shell chung cho từng screen

Tất cả các màn đều bọc bằng `ProfileSetupShell` tương ứng của module assessment, giúp:

- progress bar đồng bộ
- header/back đồng bộ
- spacing và safe area nhất quán
- giảm lặp code layout

## 6. Những quyết định UX đã được đưa ra

### 6.1. Chấp nhận bám board thiết kế trước, chưa tối ưu UX thật

Sau khi hoàn tất flow, một điểm đã được nêu ra là việc hỏi `21` câu, gần như `1 câu = 1 màn`, là khá mệt cho người dùng. Đây là nhận định đúng nếu nhìn theo sản phẩm thật.

Tuy nhiên, ở pha triển khai này, mục tiêu ưu tiên là:

- dựng được đúng cụm screen đang còn thiếu trong thư mục `fin/`
- giữ chúng thành các route thật để có thể test UI
- tạo nền tảng refactor sau này

Tức là module hiện tại ưu tiên `coverage theo design board` nhiều hơn `conversion-optimized onboarding UX`.

### 6.2. Entry screen dùng để chặn cảm giác vào thẳng survey dài

Thay vì đẩy người dùng vào câu hỏi đầu tiên ngay lập tức, `index.tsx` được dùng như màn đệm. Màn này có vai trò:

- giải thích phạm vi assessment
- cho phép bắt đầu hoặc review lại block đầu
- giảm cảm giác bị áp vào khảo sát quá dài ngay từ first render

### 6.3. Voice confirmation được dựng như một state frontend

Màn `voice-confirmation.tsx` chỉ mô phỏng UI waveform/voice confirmation, chưa nối microphone thật. Đây là quyết định hợp lý vì:

- thiết kế yêu cầu có frame đó
- nhưng logic mic thật sẽ kéo theo permission, recording state, waveform thật, file handling
- chưa cần cho mục tiêu hiện tại là code frontend flow

## 7. Những gì đã được kiểm tra

Các bước kiểm tra đã thực hiện trong lúc triển khai:

- đảm bảo toàn bộ route trong module có thể navigate theo đúng thứ tự
- sửa lại entry screen để tránh CTA bị đè hoặc sát nội dung phía trên
- đối chiếu lại số lượng screen với board thiết kế
- chạy lint sau khi hoàn tất module

Kết quả:

- module được commit trong commit `f1e0341`
- commit message đã được chuẩn hóa theo format `feat: ...`

## 8. Hạn chế hiện tại

Flow hiện tại có những hạn chế đã biết:

1. chưa phải UX onboarding tối ưu cho sản phẩm thật
2. chưa có skip logic thông minh giữa các nhóm câu hỏi
3. chưa có submit thật lên backend
4. chưa có summary/final recommendation screen dựa trên dữ liệu đã điền
5. chưa persist dữ liệu nếu người dùng rời flow giữa chừng

## 9. Nếu tiếp tục mở rộng

Các hướng mở rộng hợp lý nhất là:

1. gộp `21` màn thành 4 phase lớn hơn để giảm mỏi thao tác
2. thêm summary screen cuối để chuyển từ data input sang recommendation
3. dùng kết quả assessment để prefill cho `Smart Budgeting` hoặc `Financial Goals`
4. thêm persistence local nếu flow này cần resume later

## 10. Kết luận

`Financial Assessment` là phần mở rộng lớn nhất của ngày làm việc này. Giá trị chính của nó không nằm ở việc đã hoàn thiện logic sản phẩm, mà ở chỗ:

- đã có module thật trong source
- đã có route thật để test UI
- đã có context riêng để giữ state
- đã có cấu trúc đủ tốt để refactor UX ở bước sau
