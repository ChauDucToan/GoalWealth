# Investments Guide

File này giải thích nhanh phần `cổ phiếu / investments` hiện đang nằm ở đâu trong app và cách test.

## 1. Mở phần cổ phiếu từ đâu

Có 3 cách vào:

1. Từ `Home`
   - vào tab `home`
   - kéo xuống section `Investments`
   - bấm `Portfolio`, `Buy stock`, hoặc `Open chart`

2. Từ `Insights`
   - vào tab `insights`
   - phần đầu màn có `Portfolio Snapshot`
   - bấm `Open`, `Buy stock`, hoặc chọn từng mã trong `Watchlist`

3. Đi sâu trong finance routes
   - [`app/(finance)/investments.tsx`](./app/%28finance%29/investments.tsx)
   - [`app/(finance)/buy-stock.tsx`](./app/%28finance%29/buy-stock.tsx)
   - [`app/(finance)/stock/[symbol].tsx`](./app/%28finance%29/stock/%5Bsymbol%5D.tsx)

## 2. Các màn cổ phiếu hiện có

- `Investments`
  - xem tổng danh mục
  - xem watchlist
  - xem top holding
  - mở chi tiết từng mã

- `Stock Detail`
  - xem giá hiện tại
  - xem line chart mock
  - thêm / bỏ watchlist
  - đặt mã làm `default stock`
  - xem vị thế đang nắm giữ

- `Buy Stock`
  - chọn ticker
  - nhập số lượng
  - mua mock để cập nhật portfolio

## 3. Currency và Unit

Hiện tại phần stock có 2 control nằm cạnh nhau:

- `Currency`
  - `USD`
  - `AUD`
  - `VND`

- `Unit`
  - `Share`
  - `Lot`

Ý nghĩa:

- đổi `Currency` sẽ đổi cách hiển thị giá/portfolio trong phần investments
- đổi `Unit` sẽ đổi cách hiển thị số lượng nắm giữ
- nếu chọn `Lot` thì `1 lot = 100 shares`

Các control này đang có mặt ở:

- `Investments`
- `Stock Detail`
- `Buy Stock`

## 4. Cách test nhanh

### 4.1 Mua cổ phiếu

1. vào `Home`
2. kéo xuống `Investments`
3. bấm `Buy stock`
4. chọn mã như `NVDA`, `AAPL`, `MSFT`
5. nhập số lượng
6. bấm `Confirm purchase`

Kết quả:

- app sẽ quay sang `Stock Detail`
- số lượng nắm giữ tăng lên
- `Portfolio` tăng theo
- `Transactions` có thêm một dòng `Buy <SYMBOL>`

### 4.2 Theo dõi cổ phiếu

1. mở `Stock Detail`
2. bấm icon bookmark ở góc phải header hoặc nút `Track`

Kết quả:

- mã đó được thêm hoặc bỏ khỏi `Watchlist`
- watchlist hiển thị lại trong `Investments` và `Insights`

### 4.3 Xem chart

1. từ `Home` bấm `Open chart`
2. hoặc từ `Insights` chọn một mã trong `Watchlist`
3. hoặc từ `Investments` bấm vào card / row của mã

### 4.4 Chọn mã mặc định

Bạn có thể đổi mã mặc định theo 2 cách:

1. vào `Investments`
2. trong `Watchlist`, bấm `Set default`

hoặc:

1. mở `Stock Detail`
2. bấm nút `Set default`

Kết quả:

- mã đó sẽ được ưu tiên hiển thị ở `Home`
- mã đó sẽ được ưu tiên hiển thị ở `Insights`
- mã đó sẽ được ưu tiên dùng ở hero của `Investments`

## 5. Lưu ý hiện tại

- đây là `mock flow`, chưa có API giá thật
- giá cổ phiếu và chart đang lấy từ mock data trong [`components/home/mock-data.ts`](./components/home/mock-data.ts)
- đổi currency hiện chỉ là quy đổi mock để test UI
- `default stock` hiện đang là state local trong app, chưa persist
- `Market cap`, `Volume`, `P/E` vẫn đang hiển thị theo mock text tĩnh

## 6. File chính liên quan

- [`context/financeContext.tsx`](./context/financeContext.tsx)
- [`components/finance/finance-utils.ts`](./components/finance/finance-utils.ts)
- [`components/finance/MarketDisplayControls.tsx`](./components/finance/MarketDisplayControls.tsx)
- [`app/(finance)/investments.tsx`](./app/%28finance%29/investments.tsx)
- [`app/(finance)/buy-stock.tsx`](./app/%28finance%29/buy-stock.tsx)
- [`app/(finance)/stock/[symbol].tsx`](./app/%28finance%29/stock/%5Bsymbol%5D.tsx)
- [`app/(tabs)/home.tsx`](./app/%28tabs%29/home.tsx)
- [`app/(tabs)/insights.tsx`](./app/%28tabs%29/insights.tsx)
