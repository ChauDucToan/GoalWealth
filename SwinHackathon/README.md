# GoalWealth / SwinHackathon

Frontend mobile app viết bằng `Expo + React Native + Expo Router`, đang được dựng theo bộ UI kit Finpal nhưng đã đổi sang palette riêng trong [`constants/theme.ts`](./constants/theme.ts).

Tài liệu này mô tả trạng thái hiện tại của project:
- app đang có những flow nào
- route nào đang chịu trách nhiệm phần nào
- cấu trúc thư mục hiện tại
- mock data và state đang nằm ở đâu
- cơ chế test tạm để đi từ auth vào home

Guide riêng cho phần cổ phiếu:
- [`INVESTMENTS_GUIDE.md`](./INVESTMENTS_GUIDE.md)

Guide riêng cho phần AI assistant:
- [`AI_ASSISTANT_GUIDE.md`](./AI_ASSISTANT_GUIDE.md)

## 1. Tổng quan hiện tại

Project hiện có 5 lớp flow chính:

1. `Splash / Loading`
2. `Welcome / Onboarding`
3. `Authentication`
4. `Main app + Finance subflows`
5. `AI Assistant`

Luồng chạy hiện tại:

`index` -> `welcome` -> `signIn` -> `/(tabs)/home`

Lưu ý:
- `signIn` vẫn đang bật test bypass để vào thẳng `home`
- chưa có backend thật
- chưa có auth thật
- toàn bộ `home / transactions / finance subflows` đang chạy bằng mock data nhưng đã có shared state

## 2. Tech Stack

- `Expo`
- `React Native`
- `Expo Router`
- `TypeScript`
- `@expo/vector-icons`
- `React Context` cho theme và finance state

Scripts trong [`package.json`](./package.json):

- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`

Typecheck đang dùng:

```bash
npx tsc --noEmit
```

## 3. Cấu trúc thư mục

```text
SwinHackathon/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── welcome.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── signIn.tsx
│   │   ├── signUp.tsx
│   │   ├── forgetPassword.tsx
│   │   └── passwordResent.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── transactions.tsx
│   │   ├── insights.tsx
│   │   ├── assistant.tsx
│   │   └── profile.tsx
│   ├── (assistant)/
│   │   ├── _layout.tsx
│   │   ├── chat/
│   │   │   └── [scenario].tsx
│   │   ├── voice.tsx
│   │   ├── receipt-upload.tsx
│   │   ├── receipt-scan.tsx
│   │   ├── settings.tsx
│   │   ├── reset-memory.tsx
│   │   ├── out-of-tokens.tsx
│   │   └── upgrade.tsx
│   └── (finance)/
│       ├── _layout.tsx
│       ├── account.tsx
│       ├── add-category.tsx
│       ├── add-note.tsx
│       ├── add-transaction.tsx
│       ├── categories.tsx
│       ├── buy-stock.tsx
│       ├── date-range.tsx
│       ├── ignore-transaction.tsx
│       ├── merchant-edit.tsx
│       ├── send-money.tsx
│       ├── select-category.tsx
│       ├── select-type.tsx
│       ├── sending.tsx
│       ├── set-recurring.tsx
│       ├── sort-transactions.tsx
│       ├── split-transaction.tsx
│       ├── stock/
│       │   └── [symbol].tsx
│       ├── transaction/
│       │   └── [id].tsx
│       ├── investments.tsx
│       ├── merchant/
│       │   └── [merchant].tsx
│       ├── transactions-filters.tsx
│       ├── transactions-search.tsx
│       └── transfer-result.tsx
├── assets/
│   └── images/
├── components/
│   ├── InputField.tsx
│   ├── ThemeButton.tsx
│   ├── UnorderedList.tsx
│   ├── auth/
│   │   └── AuthKit.tsx
│   ├── assistant/
│   │   ├── AssistantScaffold.tsx
│   │   ├── AssistantWidgets.tsx
│   │   └── mock-data.ts
│   ├── finance/
│   │   ├── FinanceScaffold.tsx
│   │   ├── MarketDisplayControls.tsx
│   │   ├── StockTrendChart.tsx
│   │   └── finance-utils.ts
│   └── home/
│       └── mock-data.ts
├── constants/
│   └── theme.ts
├── context/
│   ├── financeContext.tsx
│   └── themeContext.ts
├── hooks/
│   ├── use-finance.tsx
│   └── use-theme-colors.tsx
├── finpal_ AI Finance Assistant App UI Kit (Community)/
│   ├── Authentication.png
│   ├── Splash & Loading Screen.png
│   ├── Welcome Screen.png
│   ├── Home & Transactions.png
│   └── các PNG reference khác
├── app.json
├── AI_ASSISTANT_GUIDE.md
├── INVESTMENTS_GUIDE.md
├── package.json
├── tsconfig.json
├── eslint.config.js
└── README.md
```

## 4. App Architecture

### 4.1 `app/_layout.tsx`

Root stack của app.

Hiện tại file này:
- bọc app bằng `ThemeProvider`
- bọc tiếp bằng `FinanceProvider`
- khai báo 4 route group chính:
  - `index`
  - `welcome`
  - `(auth)`
  - `(tabs)`
  - `(finance)`

### 4.2 `ThemeProvider`

Nguồn:
- [`context/themeContext.ts`](./context/themeContext.ts)
- [`hooks/use-theme-colors.tsx`](./hooks/use-theme-colors.tsx)

Chịu trách nhiệm:
- cấp màu theme cho toàn app
- expose `useTheme()`

Lưu ý:
- hiện tại cả dark và light đều đang trả về `Colors.light`
- app thực tế vẫn đang chạy bằng theme sáng

### 4.3 `FinanceProvider`

Nguồn:
- [`context/financeContext.tsx`](./context/financeContext.tsx)
- [`hooks/use-finance.tsx`](./hooks/use-finance.tsx)

Đây là phần refactor mới cho finance flow.

Nó giữ shared state cho:
- `transactions`
- `categories`
- `stocks`
- `stockHoldings`
- `watchlistSymbols`
- `defaultStockSymbol`
- `displayCurrency`
- `displayUnit`
- `transactionDraft`

Và expose các action:
- `addTransaction`
- `markTransactionCompleted`
- `addCategory`
- `renameMerchant`
- `buyStock`
- `toggleStockWatch`
- `setDefaultStockSymbol`
- `setDisplayCurrency`
- `setDisplayUnit`
- `updateTransactionDraft`
- `resetTransactionDraft`
- `getTransactionById`
- `getTransactionsByMerchant`
- `getStockBySymbol`
- `getHoldingBySymbol`

Ý nghĩa:
- các màn trong `home`
- `transactions`
- và toàn bộ group `/(finance)`

đều đang đọc/ghi cùng một nguồn data mock, không còn tách rời theo từng màn nữa.

### 4.4 `AssistantProvider`

Nguồn:
- [`context/assistantContext.tsx`](./context/assistantContext.tsx)
- [`hooks/use-assistant.tsx`](./hooks/use-assistant.tsx)

Chịu trách nhiệm:
- giữ `assistantSettings`
- giữ `conversation`
- giữ `activeScenarioId`
- giữ `hasSeenAssistantIntro`

Và expose action cho:
- đổi scenario demo
- gửi message test
- đổi settings
- reset memory

## 5. Các nhóm route

### 5.1 `app/index.tsx`

Splash / loading flow.

Các phase hiện tại:
- splash màu chủ đạo
- loading phần trăm
- loading với ảnh full-screen
- loading text
- chuyển sang [`welcome.tsx`](./app/welcome.tsx)

### 5.2 `app/welcome.tsx`

Onboarding / welcome flow dựng lại từ `Welcome Screen.png`.

Đã có:
- intro slide
- các slide feature
- footer cố định
- `Get Started`
- `Sign In`

### 5.3 `app/(auth)`

Auth flow dựng từ `Authentication.png`.

Gồm:
- [`signIn.tsx`](./app/%28auth%29/signIn.tsx)
- [`signUp.tsx`](./app/%28auth%29/signUp.tsx)
- [`forgetPassword.tsx`](./app/%28auth%29/forgetPassword.tsx)
- [`passwordResent.tsx`](./app/%28auth%29/passwordResent.tsx)

### 5.4 `app/(tabs)`

Main tab flow sau khi vào app.

Gồm:
- [`home.tsx`](./app/%28tabs%29/home.tsx)
- [`transactions.tsx`](./app/%28tabs%29/transactions.tsx)
- [`insights.tsx`](./app/%28tabs%29/insights.tsx)
- [`assistant.tsx`](./app/%28tabs%29/assistant.tsx)
- [`profile.tsx`](./app/%28tabs%29/profile.tsx)

Hiện tại:
- `home` đã có thêm card `Investments`
- `insights` đã được mở rộng thành màn `spending + investments`
- `default stock` do user chọn sẽ được ưu tiên hiển thị ở các màn này
- `assistant` là inbox riêng cho nhiều AI conversation threads

### 5.5 `app/(assistant)`

Đây là stack cho toàn bộ AI assistant subflow.

Các màn hiện có:
- [`chat/[scenario].tsx`](./app/%28assistant%29/chat/%5Bscenario%5D.tsx)
- [`voice.tsx`](./app/%28assistant%29/voice.tsx)
- [`receipt-upload.tsx`](./app/%28assistant%29/receipt-upload.tsx)
- [`receipt-scan.tsx`](./app/%28assistant%29/receipt-scan.tsx)
- [`settings.tsx`](./app/%28assistant%29/settings.tsx)
- [`reset-memory.tsx`](./app/%28assistant%29/reset-memory.tsx)
- [`out-of-tokens.tsx`](./app/%28assistant%29/out-of-tokens.tsx)
- [`upgrade.tsx`](./app/%28assistant%29/upgrade.tsx)

### 5.6 `app/(finance)`

Đây là stack mới để tách các finance subflow ra khỏi `transactions.tsx` thay vì dồn hết vào modal.

Các màn hiện có:
- [`account.tsx`](./app/%28finance%29/account.tsx)
- [`add-note.tsx`](./app/%28finance%29/add-note.tsx)
- [`add-transaction.tsx`](./app/%28finance%29/add-transaction.tsx)
- [`buy-stock.tsx`](./app/%28finance%29/buy-stock.tsx)
- [`investments.tsx`](./app/%28finance%29/investments.tsx)
- [`send-money.tsx`](./app/%28finance%29/send-money.tsx)
- [`sending.tsx`](./app/%28finance%29/sending.tsx)
- [`transfer-result.tsx`](./app/%28finance%29/transfer-result.tsx)
- [`stock/[symbol].tsx`](./app/%28finance%29/stock/%5Bsymbol%5D.tsx)
- [`transaction/[id].tsx`](./app/%28finance%29/transaction/%5Bid%5D.tsx)
- [`split-transaction.tsx`](./app/%28finance%29/split-transaction.tsx)
- [`ignore-transaction.tsx`](./app/%28finance%29/ignore-transaction.tsx)
- [`merchant/[merchant].tsx`](./app/%28finance%29/merchant/%5Bmerchant%5D.tsx)
- [`merchant-edit.tsx`](./app/%28finance%29/merchant-edit.tsx)
- [`transactions-search.tsx`](./app/%28finance%29/transactions-search.tsx)
- [`transactions-filters.tsx`](./app/%28finance%29/transactions-filters.tsx)
- [`sort-transactions.tsx`](./app/%28finance%29/sort-transactions.tsx)
- [`date-range.tsx`](./app/%28finance%29/date-range.tsx)
- [`categories.tsx`](./app/%28finance%29/categories.tsx)
- [`add-category.tsx`](./app/%28finance%29/add-category.tsx)
- [`select-category.tsx`](./app/%28finance%29/select-category.tsx)
- [`select-type.tsx`](./app/%28finance%29/select-type.tsx)
- [`set-recurring.tsx`](./app/%28finance%29/set-recurring.tsx)

Đây là phần bám trực tiếp hơn vào board `Home & Transactions.png`.

## 6. Trạng thái từng màn chính

### 6.1 Home

Nguồn: [`app/(tabs)/home.tsx`](./app/%28tabs%29/home.tsx)

Hiện có:
- hero balance section
- account snapshot list
- quick actions
- activity highlights
- budget highlights
- goals
- savings target
- upcoming bills
- investment snapshot + watchlist chips
- merchant activity
- news & resources
- finpal tip card
- recent transactions

Đã nối sang finance screens mới:
- account detail
- merchant detail
- transaction detail
- send money
- add transaction
- categories

### 6.2 Transactions

Nguồn: [`app/(tabs)/transactions.tsx`](./app/%28tabs%29/transactions.tsx)

Sau refactor, màn này là transaction dashboard/list.

Hiện có:
- search bar mở ra search screen riêng
- summary cards
- quick finance actions
- merchant chips
- quick filter chips
- buttons sang `filters / sort / date`
- top categories
- grouped transaction list

Không còn nhồi nhiều modal lớn trong file này nữa.

### 6.3 Insights

Nguồn: [`app/(tabs)/insights.tsx`](./app/%28tabs%29/insights.tsx)

Hiện có:
- portfolio snapshot
- featured stock chart
- watchlist list
- spending activity chart
- top categories
- CTA sang investment center

### 6.4 Assistant

Nguồn:
- [`app/(tabs)/assistant.tsx`](./app/%28tabs%29/assistant.tsx)

Hiện có:
- 2 intro slide cho assistant
- hero card cho `Finpal AI`
- danh sách nhiều assistant threads
- `settings` ở góc trên cùng bên phải
- `upgrade` nằm ở inbox assistant
- mở từng thread sang màn chat riêng

Nối sang subflow:
- chat thread riêng
- voice assistant
- receipt upload
- receipt scan
- chat settings
- clear chatbot data
- out-of-token state
- upgrade state

### 6.5 Finance Subflows

Các state đã có để test UI:
- add transaction
- add note
- type picker
- category picker
- recurring picker
- transfer form
- transfer recipient picker
- sending state
- transfer success
- transfer failed
- transaction detail
- split payment
- ignore transaction
- merchant detail
- merchant rename
- transaction search
- empty search result
- advanced filters
- sort state
- date selection state
- category list
- add category
- account detail
- investments overview
- stock detail
- buy stock flow

## 7. Mock Data và UI Foundation

### 7.1 `components/home/mock-data.ts`

Chứa:
- type definitions cho finance models
- overview stats
- wallet accounts
- goals
- bills
- stock quotes
- stock holdings seed
- stock watchlist seed
- resource cards
- activity highlights
- merchant highlights
- recipients
- recurring options
- sort options
- category icon/color options
- transaction seeds

### 7.2 `components/finance/FinanceScaffold.tsx`

Foundation mới cho finance routes.

Chứa:
- `FinanceScreen`
- `FinanceCard`
- `StockTrendChart`

Mục tiêu:
- thống nhất spacing/header/card giữa các finance screen
- giảm lặp code khi thêm màn theo board

### 7.3 `components/assistant/*`

Assistant foundation mới.

Chứa:
- `AssistantScaffold.tsx`
- `AssistantWidgets.tsx`
- `mock-data.ts`

Mục tiêu:
- thống nhất scaffold và card shell cho assistant screens
- gom renderer cho conversation card types
- giữ toàn bộ demo scenario ở một chỗ

### 7.4 `components/finance/finance-utils.ts`

Helper dùng chung:
- `formatCurrency`
- `formatCompactCurrency`
- `groupTransactionsByDate`
- `makeReference`

## 8. Cơ chế test tạm hiện tại

Ở [`app/(auth)/signIn.tsx`](./app/%28auth%29/signIn.tsx):

```ts
const ENABLE_HOME_TEST_BYPASS = true;
```

Ý nghĩa:
- bấm sign in sẽ vào thẳng `/(tabs)/home`
- không check auth thật
- dùng để test UI nhanh

Muốn tắt:

```ts
const ENABLE_HOME_TEST_BYPASS = false;
```

## 9. Design Reference

Thư mục reference:

[`finpal_ AI Finance Assistant App UI Kit (Community)`](./finpal_%20AI%20Finance%20Assistant%20App%20UI%20Kit%20%28Community%29)

Những file đang được bám nhiều nhất:
- `Authentication.png`
- `Splash & Loading Screen.png`
- `Welcome Screen.png`
- `Home & Transactions.png`
- `🔒 AI Finance Assisstant.png`

## 10. Dữ liệu thật hay giả

Hiện tại:
- `Auth`: giả
- `Home`: giả nhưng có shared state
- `Transactions`: giả nhưng có shared state
- `Finance subflows`: giả nhưng có shared state
- `Insights`: giả nhưng đã nối với stock/investment mock data
- `Assistant`: giả nhưng đã có shared state + nhiều state UI
- `Profile`: giả

Chưa có:
- API thật
- persistent storage
- auth/session thật
- backend integration

## 11. Cách chạy project

### Cài dependencies

```bash
npm install
```

### Chạy dev server

```bash
npm run start
```

### Chạy Android

```bash
npm run android
```

Hoặc mở Expo dev server rồi bấm `a`.

### Kiểm tra code

```bash
npm run lint
npx tsc --noEmit
```

## 12. Tình trạng hiện tại

Đã ổn:
- routing rõ ràng hơn
- auth / welcome / splash có flow đầy đủ
- home và transactions đã dùng chung finance state
- assistant đã có tab riêng + subflow riêng
- nhóm subflow trong board `Home & Transactions` đã được tách thành stack riêng
- lint và typecheck sạch

Chưa có hoặc nên làm tiếp:
- auth thật
- persistence cho finance state
- persistence cho assistant state
- API thật cho transactions/home
- AI backend thật
- edit/delete transaction thật
- split payment logic thật
- merchant/category CRUD đầy đủ
- dark mode thật
- tách `home.tsx` thành nhiều component nhỏ hơn

## 13. Tóm tắt ngắn

Project hiện là một frontend prototype chạy được với:
- splash/loading
- onboarding
- auth flow
- tab flow
- finance stack riêng cho các subflow chi tiết
- shared mock state cho transaction/category

Nếu cần, bước tiếp theo hợp lý là:
- thêm persistence
- nối API
- hoặc tiếp tục dựng các board còn lại từ UI kit.
