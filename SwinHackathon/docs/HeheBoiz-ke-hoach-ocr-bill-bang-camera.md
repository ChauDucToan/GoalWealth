# HeheBoiz - Kế Hoạch OCR Bill Bằng Camera

## 1. Mục tiêu

Tài liệu này mô tả kế hoạch triển khai tính năng quét OCR bill bằng camera điện thoại trong app `GoalWealth`, theo hướng phù hợp với kiến trúc Expo/React Native hiện tại.

Phạm vi của kế hoạch này là:

- Chụp ảnh bill bằng camera điện thoại.
- Trích xuất text từ bill bằng OCR.
- Parse các trường quan trọng như:
  - Tên cửa hàng
  - Ngày giao dịch
  - Tổng tiền
  - Danh mục gợi ý
- Hiển thị màn review để người dùng kiểm tra hoặc sửa lại dữ liệu OCR.
- Sau khi xác nhận, đưa kết quả vào flow assistant hoặc flow tài chính.

Phạm vi chưa bao gồm trong kế hoạch này:

- OCR trực tiếp từ file PDF.
- OCR tài liệu nhiều trang.
- OCR hóa đơn điện tử phức tạp có layout đặc biệt.
- Đồng bộ backend hoặc lưu trữ cloud OCR.

## 2. Kết luận kỹ thuật ban đầu

Với mục tiêu quét bill bằng camera điện thoại, hướng phù hợp hơn là dùng OCR native trên mobile, thay vì `Tesseract.js`.

### Lý do không chọn `Tesseract.js`

`Tesseract.js` phù hợp hơn cho môi trường browser hoặc Node.js. Với app Expo/React Native đang chạy theo hướng mobile-first, dùng OCR native sẽ hợp lý hơn về:

- tốc độ xử lý trên thiết bị
- trải nghiệm camera
- độ ổn định khi triển khai với hóa đơn chụp từ điện thoại
- độ phù hợp với flow quét ảnh thực tế

### Hướng đề xuất

Dùng bộ thư viện `react-native-mlkit` cho Expo dev build:

- `@infinitered/react-native-mlkit-text-recognition`
- có thể cân nhắc thêm `@infinitered/react-native-mlkit-document-scanner`

Hướng này phù hợp hơn với use case:

- người dùng mở camera
- chụp bill
- app OCR text ngay trên thiết bị
- hiển thị kết quả để review

## 3. Scope tính năng V1

Để tối ưu UX/UI và tránh làm flow quá nặng, bản V1 nên gói gọn vào một luồng ngắn:

1. Người dùng vào `Receipt Upload`
2. Chọn `Take photo`
3. App mở camera hoặc scanner
4. Chụp bill
5. OCR text
6. Parse dữ liệu chính
7. Hiển thị màn review
8. Người dùng xác nhận
9. Đẩy dữ liệu sang assistant hoặc finance flow

Đây là bản đủ dùng để kiểm chứng:

- độ chính xác OCR
- độ mượt của flow
- mức chấp nhận của người dùng với trải nghiệm scan bill

## 4. Flow UX đề xuất

### 4.1. Màn `Receipt Upload`

File hiện có:

- [receipt-upload.tsx](/home/heheboiz/data/GoalWealth/SwinHackathon/app/(assistant)/receipt-upload.tsx)

Vai trò sau khi triển khai:

- giữ nguyên là màn vào flow
- thêm logic thật cho:
  - `Take photo`
  - `Browse files`
  - `Gallery`

V1 nên ưu tiên:

- `Take photo`
- `Gallery`

`Browse files` có thể để cho giai đoạn sau.

### 4.2. Màn `Receipt Scan`

File hiện có:

- [receipt-scan.tsx](/home/heheboiz/data/GoalWealth/SwinHackathon/app/(assistant)/receipt-scan.tsx)

Hiện tại màn này đang là demo scan. Sau khi triển khai thật, màn này sẽ đảm nhận:

- hiển thị trạng thái scanning
- hiển thị trạng thái OCR progress
- hiển thị raw text hoặc kết quả parse sơ bộ
- chuyển sang màn review

### 4.3. Màn `Receipt Review`

Màn này chưa có trong repo và nên được thêm mới.

Nhiệm vụ:

- hiển thị các field OCR tách ra
- cho người dùng chỉnh sửa nhanh
- xác nhận import

Các field cần có:

- Merchant
- Date
- Total
- Category suggestion
- Note hoặc raw text rút gọn

### 4.4. Màn `Import Result`

Sau khi review xong:

- đẩy sang assistant chat
- hoặc lưu như một expense draft

V1 nên ưu tiên:

- import vào assistant

V2 có thể mở rộng:

- tạo transaction draft
- map thẳng vào finance categories

## 5. Kiến trúc kỹ thuật đề xuất

### 5.1. Native OCR layer

Thêm một lớp OCR tách riêng khỏi UI, ví dụ:

- `components/assistant/ocr/`
- hoặc `lib/ocr/`

Module này nên tách thành 2 phần:

1. OCR engine wrapper
2. Receipt parser

### 5.2. OCR engine wrapper

Chịu trách nhiệm:

- nhận ảnh đầu vào
- gọi native OCR
- trả về raw text

Ví dụ hàm:

- `scanReceiptText(imageUri: string): Promise<string>`

### 5.3. Receipt parser

Chịu trách nhiệm:

- nhận raw text từ OCR
- suy ra dữ liệu có cấu trúc

Ví dụ output:

```ts
type ParsedReceipt = {
  merchant: string;
  date: string;
  total: number | null;
  subtotal?: number | null;
  tax?: number | null;
  suggestedCategory?: string;
  rawText: string;
};
```

Parser không nên cố làm quá thông minh ở V1. Chỉ cần ổn với bill phổ biến:

- siêu thị
- cafe
- cửa hàng tiện lợi
- hóa đơn dịch vụ đơn giản

## 6. Tổ chức code đề xuất trong repo

### 6.1. Dependencies

Sẽ cần thêm các dependency OCR/camera phù hợp với Expo dev build.

Tối thiểu dự kiến:

- `@infinitered/react-native-mlkit-text-recognition`
- camera hoặc image picker tương ứng với cách lấy ảnh

Nếu muốn scan tài liệu đẹp hơn:

- `@infinitered/react-native-mlkit-document-scanner`

### 6.2. File mới nên thêm

Đề xuất:

- `components/assistant/ocr/scan-receipt.ts`
- `components/assistant/ocr/parse-receipt.ts`
- `components/assistant/ocr/types.ts`
- `app/(assistant)/receipt-review.tsx`

### 6.3. File hiện có cần sửa

- [receipt-upload.tsx](/home/heheboiz/data/GoalWealth/SwinHackathon/app/(assistant)/receipt-upload.tsx)
- [receipt-scan.tsx](/home/heheboiz/data/GoalWealth/SwinHackathon/app/(assistant)/receipt-scan.tsx)

Nếu muốn đẩy dữ liệu vào chat:

- các phần liên quan tới assistant scenario hoặc assistant context

## 7. Trình tự triển khai đề xuất

### Giai đoạn 1: Khung hạ tầng OCR

Mục tiêu:

- cài dependency
- làm OCR wrapper
- test OCR được với một ảnh bill mẫu

Output mong đợi:

- truyền ảnh vào
- nhận được raw text

### Giai đoạn 2: Parser bill cơ bản

Mục tiêu:

- parse merchant
- parse total
- parse date
- trả về object có cấu trúc

Output mong đợi:

- màn hình đã có dữ liệu đọc được, không chỉ raw text

### Giai đoạn 3: Review UI

Mục tiêu:

- thêm màn review
- cho phép sửa field OCR
- xác nhận import

Output mong đợi:

- người dùng không bị phụ thuộc hoàn toàn vào OCR

### Giai đoạn 4: Nối vào assistant

Mục tiêu:

- sau khi confirm, đưa dữ liệu sang assistant flow hiện có

Output mong đợi:

- assistant chat nhận được payload receipt đã được OCR

### Giai đoạn 5: Nâng chất lượng scan

Mục tiêu:

- thêm document scanning
- crop bill tốt hơn
- giảm noise

Output mong đợi:

- độ chính xác tăng lên với ảnh chụp thực tế

## 8. Tối ưu UX/UI

Để tính năng này thân thiện hơn, không nên ép user đi qua quá nhiều step. Flow tối ưu nên là:

1. Upload
2. Scan
3. Review
4. Confirm

Chỉ 4 bước là đủ.

Không nên tách thêm:

- màn riêng chỉ để hiển thị raw text
- màn riêng chỉ để chọn category
- màn riêng chỉ để xác nhận thành công

Những phần đó có thể gộp vào review và confirm để flow gọn hơn.

## 9. Rủi ro cần lưu ý

### 9.1. OCR không chính xác 100%

Hóa đơn thực tế thường có:

- font nhỏ
- góc chụp lệch
- ánh sáng kém
- bill nhàu hoặc mờ

Vì vậy màn review là bắt buộc.

### 9.2. Camera và native OCR không phù hợp với Expo Go thuần

Nếu đi theo native ML Kit, cần chuẩn bị theo hướng:

- dev build
- test trên máy thật

Không nên kỳ vọng Expo Go sẽ là môi trường cuối cùng cho tính năng này.

### 9.3. Parse total/date có thể sai

Parser cần ưu tiên:

- an toàn
- dễ sửa tay

Không nên cố tự động hóa quá mức ở V1.

## 10. Acceptance criteria cho V1

Tính năng được xem là đạt V1 nếu:

- người dùng chụp bill bằng camera
- app OCR ra text
- app parse được ít nhất:
  - merchant
  - total
  - date
- người dùng sửa được field nếu OCR sai
- người dùng confirm và gửi được kết quả vào assistant

## 11. Hướng mở rộng V2

Sau khi V1 ổn định, có thể mở rộng:

- scan từ gallery/file
- scan từ PDF hoặc document nhiều trang
- category suggestion tốt hơn
- tự tạo transaction draft
- lưu lịch sử bill đã OCR
- export dữ liệu sang transaction/add-expense flow

## 12. Kết luận

Kế hoạch phù hợp nhất cho app hiện tại là:

- không dùng `Tesseract.js` làm hướng chính
- dùng native OCR cho camera bill
- giữ flow ngắn và dễ kiểm soát
- thêm màn review để bù lại sai số OCR

Nếu triển khai theo đúng kế hoạch trên, tính năng OCR bill sẽ vừa hợp với mobile UX, vừa ăn khớp với kiến trúc assistant hiện có trong repo.
