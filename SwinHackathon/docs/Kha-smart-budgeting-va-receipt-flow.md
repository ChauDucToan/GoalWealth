# Kha - Smart Budgeting Và Receipt Flow

## 1. Mục tiêu của tài liệu

Đây là tài liệu chi tiết nhất trong bộ `Kha-*`, vì `Smart Budgeting` là phần thay đổi lớn nhất và có nhiều vòng refactor nhất trong đợt làm việc này.

Tài liệu này mô tả:

- vì sao module này được tổ chức lại
- những màn nào đã được dựng
- flow setup hiện hoạt động ra sao
- receipt flow đang được tách như thế nào
- state cục bộ đang hoạt động ở mức nào
- các quyết định UX/route nào đã được thay đổi sau khi test

## 2. Bối cảnh

Feature này được dựng dựa trên file thiết kế:

- `finpal_ AI Finance Assistant App UI Kit (Community)/Smart_Budgeting.png`

Khác với một số màn lẻ khác, `Smart Budgeting` trong ảnh là cả một chuỗi flow dài, không phải một screen đơn.

Vì vậy hướng làm hợp lý không phải là:

- nhồi tất cả state vào một file

mà là:

- tách thành module route riêng
- chia theo từng màn hoặc từng nhóm flow
- tách data mock, state cục bộ và scaffold suy luận theo domain

## 3. Cấu trúc hiện tại của module

### 3.1. Route group và file chính

Các file hiện có:

- `app/(finance)/smart-budgeting/_layout.tsx`
- `app/(finance)/smart-budgeting/_data.ts`
- `app/(finance)/smart-budgeting/_navigation.ts`
- `app/(finance)/smart-budgeting/index.tsx`
- `app/(finance)/smart-budgeting/monthly-budget.tsx`
- `app/(finance)/smart-budgeting/budget-insights.tsx`
- `app/(finance)/smart-budgeting/manage-categories.tsx`
- `app/(finance)/smart-budgeting/edit-category.tsx`
- `app/(finance)/smart-budgeting/delete-category.tsx`
- `app/(finance)/smart-budgeting/share-budget.tsx`
- `app/(finance)/smart-budgeting/add-member.tsx`
- các route setup trong `setup/*`

### 3.2. State cục bộ của module

Các file:

- `context/smartBudgetingContext.tsx`
- `hooks/use-smart-budgeting.tsx`

Provider của module bọc toàn bộ flow `smart-budgeting`.

Điều này cho phép:

- setup flow
- receipt flow
- monthly budget
- budget insights

cùng đọc và ghi một state cục bộ chung, thay vì mỗi màn là một island tách biệt.

## 4. Vì sao phải tạo context riêng cho `Smart Budgeting`

Nếu chỉ dựng UI tĩnh, không cần context riêng.

Nhưng ngay khi muốn:

- hoàn tất setup một lần
- ghi nhớ rằng setup đã xong
- import receipt rồi phản ánh vào monthly budget
- xem budget insights dựa trên dữ liệu đã thay đổi

thì local state trong từng screen không còn đủ nữa.

Context riêng giúp giải quyết:

- `hasCompletedSetup`
- `activeReceiptDraft`
- `importedReceipts`
- category spending đã thay đổi
- total budget được chia sẻ trong cả module

## 5. Cấu trúc flow setup

### 5.1. Entry

- `app/(finance)/smart-budgeting/setup/index.tsx`

### 5.2. Câu hỏi setup chính

- `app/(finance)/smart-budgeting/setup/[step].tsx`

Dựa trên `_data.ts`, flow câu hỏi chính hiện gồm 5 bước:

- goal
- review
- pressure
- cushion
- household

### 5.3. Các bước nhập dữ liệu quan trọng

Sau chuỗi câu hỏi chính, đã được thêm các màn:

- `categories-members.tsx`
- `amount.tsx`
- `review-period.tsx`
- `start-date.tsx`

Đây là các bước có ý nghĩa thực tế hơn đối với budget setup, thay vì chỉ hỏi định tính.

### 5.4. Các màn setup phụ khác

Ngoài ra còn có các màn:

- `score.tsx`
- `status.tsx`
- `stepper.tsx`
- `details.tsx`
- `housing.tsx`
- `planning.tsx`

Những màn này được dựng để bám flow thiết kế tổng thể, nhưng không còn nằm trong chuỗi bắt buộc của setup lần đầu.

## 6. Vòng refactor quan trọng của setup flow

### 6.1. Vấn đề ban đầu

Ban đầu sau khi qua các bước setup đầu tiên, user vẫn bị đẩy tiếp qua nhiều màn setup phụ và cuối cùng chạm tới receipt flow.

Điều này gây vấn đề UX:

- setup lần đầu quá dài
- người dùng cảm giác không bao giờ “hoàn tất setup”
- receipt bị biến thành phần bắt buộc thay vì hành động tùy chọn

### 6.2. Cách đã sửa

Hiện tại flow đã được rút gọn:

- `start-date.tsx` là điểm cuối của chuỗi setup chính
- từ đây đi thẳng sang `budget-generated.tsx`

### 6.3. Kết quả

Setup lần đầu bây giờ:

1. vào setup
2. đi qua chuỗi câu hỏi
3. nhập vài thông tin budget chính
4. tới `Budget Set up!`
5. từ đó chọn:
   - mở `Monthly Budget`
   - hoặc `Import Receipt`

Receipt không còn là phần bị ép phải đi qua nữa.

## 7. `budget-generated` và cơ chế đánh dấu setup hoàn tất

### 7.1. File

- `app/(finance)/smart-budgeting/setup/budget-generated.tsx`

### 7.2. Vai trò

Màn này không chỉ là success UI. Nó còn là điểm đánh dấu:

- `completeSetup()`

Nghĩa là khi user tới màn này, module biết rằng setup đã hoàn thành.

### 7.3. Hệ quả ở các màn khác

Sau khi `hasCompletedSetup = true`:

- hub `smart-budgeting/index.tsx` đổi CTA
- `setup/index.tsx` không còn rủ user chạy onboarding lại như ban đầu
- flow operational như `Monthly Budget` và `Import Receipt` trở thành entry chính

## 8. Receipt flow hiện tại

### 8.1. Các file liên quan

- `setup/receipt-gallery.tsx`
- `setup/receipt-scan.tsx`
- `setup/receipt-processing.tsx`
- `setup/receipt-review.tsx`

### 8.2. Flow hiện tại

1. mở gallery receipt preset
2. chọn receipt
3. mở scan preview
4. processing
5. review extracted data
6. apply to budget
7. quay về `Monthly Budget`

### 8.3. Mức độ “thật” của flow này

Flow này đã vượt qua mức demo tĩnh, nhưng chưa phải backend thật hoàn chỉnh.

Hiện tại đã có:

- receipt preset data
- draft receipt active trong context
- review screen
- commit dữ liệu vào budget category
- latest import hiện lại ở `Monthly Budget`

Chưa có:

- camera thật
- OCR thật
- upload file thật
- parsing hóa đơn thật từ backend

### 8.4. Ý nghĩa

Đây là kiểu triển khai rất phù hợp cho prototype nâng cao:

- UI có thể test end-to-end
- state có tính liên tục giữa nhiều màn
- sau này có thể thay phần preset/mock bằng integration thật mà không cần phá toàn bộ route structure

## 9. `Monthly Budget`

### 9.1. File

- `app/(finance)/smart-budgeting/monthly-budget.tsx`

### 9.2. Vai trò

Màn này là workspace chính sau setup.

Nội dung đã có:

- budget ring/status
- total left
- highlighted category
- latest imported receipt
- category status list
- entry sang import receipt và manage categories

### 9.3. Một thay đổi quan trọng

Nút back của màn này đã được chỉnh để quay thẳng về:

- `/(finance)/smart-budgeting`

Điều này giúp khi user đi qua setup hoặc receipt flow xong, trở lại hub một cách rõ ràng hơn.

## 10. Chính sách điều hướng back mới trong `Smart Budgeting`

### 10.1. Vấn đề trước khi sửa

Trước đó một số màn trong `Smart Budgeting` dùng:

- `router.back()`

thuần theo history stack.

Điều này dẫn tới trải nghiệm không ổn định:

- hoàn tất flow rồi nhưng back vẫn lần ngược qua màn trung gian
- một số route vào thẳng từ deep link hoặc từ nhánh `replace()` thì back không nhất quán
- cùng một màn nhưng hành vi back thay đổi tùy đường đi trước đó

### 10.2. Cách đã sửa

Module hiện dùng helper:

- `app/(finance)/smart-budgeting/_navigation.ts`

Helper này chuẩn hóa back theo route đích cố định bằng `replace()`, thay vì tin vào stack history.

### 10.3. Ý nghĩa UX

Quy tắc hiện tại là:

- nếu đang ở một bước setup thì back về bước trước của setup
- nếu đã hoàn tất một quy trình như setup hoặc receipt import thì back quay về điểm đầu phù hợp, không lùi qua các màn đã hoàn tất
- `Monthly Budget` luôn back về hub `Smart Budgeting`

### 10.4. Các khu vực đã áp dụng

Chính sách này đã được áp dụng cho:

- `monthly-budget`
- `budget-insights`
- `manage-categories`
- `share-budget`
- `edit-category`
- `add-member`
- `delete-category`
- toàn bộ cụm `setup/*`
- cụm `receipt-gallery`, `receipt-scan`, `receipt-review`

### 10.5. Kết quả

Điều hướng trong `Smart Budgeting` hiện mang tính quyết định hơn:

- user không bị “kẹt trong stack cũ”
- các flow sau khi hoàn tất quay về đầu rõ ràng hơn
- trải nghiệm test trên thiết bị thật dễ dự đoán hơn

## 10. `Budget Insights`

### 10.1. File

- `app/(finance)/smart-budgeting/budget-insights.tsx`

### 10.2. Tình trạng ban đầu

Ban đầu màn này còn khá đơn giản:

- một hero card
- một vùng alert list

### 10.3. Refactor gần đây

Màn này đã được làm lại theo hướng product UI mạnh hơn, gồm:

- hero forecast lớn
- projected finish
- spent so far
- weekly trend chart
- KPI row
- category pressure board
- recommended moves
- action buttons cuối màn

### 10.4. Cách tính dữ liệu

Màn hiện không chỉ bám data mock tĩnh. Nó đã đọc từ `useSmartBudgeting()` để phản ánh:

- category spending hiện tại
- imported receipts
- total budget
- projected finish dựa trên pace hiện tại

## 11. Category management và sharing

Ngoài setup và receipt, module còn có các màn để bám phần phải của thiết kế:

- `manage-categories.tsx`
- `edit-category.tsx`
- `delete-category.tsx`
- `share-budget.tsx`
- `add-member.tsx`
- route alias như `share-qr.tsx`, `invite-members.tsx`, `create-category.tsx`

Các màn này giúp module không chỉ có setup, mà còn có cả phần vận hành và collaboration.

## 12. Cách triển khai trong toàn module

Các nguyên tắc đã được dùng xuyên suốt:

1. chia screen theo vai trò thay vì theo “khối code”
2. dùng `_data.ts` cho mock data và static presets
3. dùng context riêng cho state cục bộ của domain
4. không ép receipt phụ thuộc cứng vào setup
5. dùng `FinanceScreen` và `FinanceCard` để giữ visual consistency
6. sửa flow theo phản hồi test thực tế thay vì giữ nguyên chuỗi mô phỏng ban đầu

## 13. Những vấn đề đã gặp và đã sửa

Một số issue thực tế trong module này:

- duplicate key ở weekday/calendar
- setup flow bị dài quá mức cần thiết
- setup hoàn tất nhưng user vẫn có cảm giác bị ném vào setup khác
- receipt ban đầu bị cảm giác là flow bắt buộc
- `Monthly Budget` back behavior chưa phù hợp
- `Budget Insights` nhìn còn quá đơn giản

Các issue này đã được xử lý trực tiếp trong source hiện tại.

## 14. Trạng thái hiện tại

Ở thời điểm hiện tại, `Smart Budgeting` đã ở trạng thái:

- có module riêng
- có nhiều route thật
- có local domain state
- có flow setup rõ hơn
- có operational flow tách khỏi onboarding
- có receipt import bán-thật
- có monthly budget và insights đủ dùng để test UX

Nói ngắn gọn:

đây không còn là một màn demo đơn lẻ, mà đã là một module frontend có cấu trúc và có logic nội bộ tương đối rõ.
