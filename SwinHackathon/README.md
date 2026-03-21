# GoalWealth / SwinHackathon

Ứng dụng mobile frontend viết bằng `Expo + React Native + Expo Router`, đang được dựng dựa trên bộ UI kit Finpal và đã được đổi sang palette riêng trong [`constants/theme.ts`](./constants/theme.ts).

Document này mô tả trạng thái hiện tại của project để bạn có thể nắm nhanh:
- app đang có gì
- route nào đang chạy
- file nào chịu trách nhiệm phần nào
- cơ chế test tạm hiện tại
- cấu trúc thư mục

## 1. Tổng quan hiện tại

Project hiện có 3 phần chính:

1. `Splash / Loading flow`
   File: [`app/index.tsx`](./app/index.tsx)

2. `Authentication flow`
   Files trong [`app/(auth)`](./app/%28auth%29)

3. `Main app flow`
   Files trong [`app/(tabs)`](./app/%28tabs%29)

Luồng hiện tại của app:

`index` -> splash/loading -> `signIn` -> `home`

Lưu ý:
- Hiện tại `sign in` đang có `test bypass`, nên bấm đăng nhập sẽ vào thẳng `home`.
- Chưa có backend thật.
- Chưa có auth thật.
- Dữ liệu `home / transactions` đang là mock data.

## 2. Tech Stack

- `Expo`
- `React Native`
- `Expo Router`
- `TypeScript`
- `@expo/vector-icons`
- `React Navigation` thông qua `expo-router`

Scripts hiện có trong [`package.json`](./package.json):

- `npm run start`: chạy dev server
- `npm run android`: mở app trên Android
- `npm run ios`: mở app trên iOS
- `npm run web`: mở app trên web
- `npm run lint`: chạy eslint

## 3. Cấu trúc thư mục

```text
SwinHackathon/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── signIn.tsx
│   │   ├── signUp.tsx
│   │   ├── forgetPassword.tsx
│   │   └── passwordResent.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── home.tsx
│       ├── transactions.tsx
│       ├── insights.tsx
│       └── profile.tsx
├── assets/
│   └── images/
│       ├── loading-budget-photo.png
│       ├── icon.png
│       ├── splash-icon.png
│       └── các asset Expo mặc định khác
├── components/
│   ├── InputField.tsx
│   ├── ThemeButton.tsx
│   ├── UnorderedList.tsx
│   ├── auth/
│   │   └── AuthKit.tsx
│   └── home/
│       └── mock-data.ts
├── constants/
│   └── theme.ts
├── context/
│   └── themeContext.ts
├── hooks/
│   └── use-theme-colors.tsx
├── finpal_ AI Finance Assistant App UI Kit (Community)/
│   ├── Authentication.png
│   ├── Splash & Loading Screen.png
│   ├── Welcome Screen.png
│   ├── 🔒 Home & Transactions.png
│   └── các PNG reference khác từ Figma/UI kit
├── app.json
├── package.json
├── tsconfig.json
├── eslint.config.js
└── README.md
```

## 4. Giải thích từng phần

### 4.1 `app/`

Đây là nơi định nghĩa route bằng `expo-router`.

#### `app/_layout.tsx`

Root layout của app:
- bọc toàn bộ app bằng `ThemeProvider`
- khai báo các route group chính:
  - `index`
  - `(auth)`
  - `(tabs)`

#### `app/index.tsx`

Màn mở app hiện tại.

Chức năng:
- chạy splash/loading theo nhiều phase
- dùng màu từ theme hiện tại
- dùng ảnh crop [`assets/images/loading-budget-photo.png`](./assets/images/loading-budget-photo.png) cho phase loading giữa
- sau khi loading xong thì tự chuyển sang `/(auth)/signIn`

#### `app/(auth)/`

Nhóm route xác thực.

Gồm:
- `signIn.tsx`
- `signUp.tsx`
- `forgetPassword.tsx`
- `passwordResent.tsx`

Auth UI được dựng lại từ `Authentication.png`.

#### `app/(tabs)/`

Nhóm route chính sau khi vào app.

Gồm:
- `home.tsx`
- `transactions.tsx`
- `insights.tsx`
- `profile.tsx`

`app/(tabs)/_layout.tsx` chịu trách nhiệm dựng bottom tab bar.

### 4.2 `components/`

#### `components/InputField.tsx`

Input dùng chung cho auth.

Có hỗ trợ:
- label
- icon
- toggle password
- trạng thái `default / error / success`
- helper text

#### `components/ThemeButton.tsx`

Button dùng chung.

Có hỗ trợ:
- màu nền
- màu chữ
- style ngoài
- textStyle
- disabled

#### `components/auth/AuthKit.tsx`

Bộ component/foundation dùng riêng cho auth:
- `AuthScaffold`
- `RobotIllustration`
- `ShieldIllustration`
- `PasswordResetIllustration`
- `RememberMe`
- `PasswordStrengthMeter`
- `AuthSupportText`
- `AuthPrimaryButton`
- `hexToRgba`

File này giúp các màn auth có layout và visual thống nhất.

#### `components/home/mock-data.ts`

Mock data cho home module.

Bao gồm:
- overview stats
- quick actions
- budget categories
- transaction list
- spending insights
- profile action items

Hiện tại chưa có API thật, nên `home` và `transactions` đang đọc dữ liệu từ đây.

### 4.3 `constants/`

#### `constants/theme.ts`

Đây là file màu chủ đạo của project.

Palette hiện tại đang thiên xanh:
- `primary`
- `primaryDark`
- `primaryLight`
- `backgroundSoft`
- `card`
- `border`
- `success / warning / error`

Các màn mới đều đang cố bám palette này.

### 4.4 `hooks/` và `context/`

#### `context/themeContext.ts`

Tạo `ThemeContext` mặc định.

#### `hooks/use-theme-colors.tsx`

Expose:
- `ThemeProvider`
- `useTheme()`

Lưu ý quan trọng:
- file này có kiểm tra `useColorScheme()`
- nhưng hiện tại cả dark và light đều đang trả về `Colors.light`

Tức là:
- app đang chạy thực tế bằng theme sáng
- chưa thực sự bật dark mode

Nếu sau này muốn hỗ trợ dark mode thật, đây là chỗ cần sửa đầu tiên.

## 5. Luồng màn hình hiện tại

### 5.1 Splash / Loading

Nguồn: [`app/index.tsx`](./app/index.tsx)

Flow:
- splash nền xanh
- loading phần trăm
- loading với ảnh full-screen
- loading message
- chuyển sang `signIn`

### 5.2 Authentication

Nguồn: [`app/(auth)`](./app/%28auth%29)

Các màn đang có:
- `signIn`
- `signUp`
- `forgetPassword`
- `passwordResent`

Các state UI đã có:
- password error
- password strength bar
- email invalid state
- remember me
- outlined secondary button

### 5.3 Main App

Nguồn: [`app/(tabs)`](./app/%28tabs%29)

Các tab đang có:
- `home`
- `transactions`
- `insights`
- `profile`

#### `home.tsx`

Đang có:
- hero balance section
- quick actions
- budget highlights
- recent transactions
- insights CTA

#### `transactions.tsx`

Đang có:
- summary cards
- filter chip
- grouped transaction list
- transaction detail bottom sheet
- modal add transaction để test tạm

#### `insights.tsx`

Màn insight placeholder nhưng có UI thật:
- weekly activity chart
- top categories
- CTA button

#### `profile.tsx`

Màn profile placeholder nhưng có UI thật:
- profile card
- menu list
- nút back về sign in

## 6. Cơ chế test tạm hiện tại

Hiện tại ở [`app/(auth)/signIn.tsx`](./app/%28auth%29/signIn.tsx) có:

```ts
const ENABLE_HOME_TEST_BYPASS = true;
```

Ý nghĩa:
- khi bấm sign in, app sẽ `router.replace('/(tabs)/home')`
- không kiểm tra auth thật
- mục đích là để test flow home nhanh trong giai đoạn build UI

Muốn tắt cơ chế này:

1. mở [`app/(auth)/signIn.tsx`](./app/%28auth%29/signIn.tsx)
2. đổi:

```ts
const ENABLE_HOME_TEST_BYPASS = false;
```

Sau đó bạn có thể thay `handleSubmit()` bằng auth logic thật.

## 7. Design reference đang nằm ở đâu

Thư mục:

[`finpal_ AI Finance Assistant App UI Kit (Community)`](./finpal_%20AI%20Finance%20Assistant%20App%20UI%20Kit%20%28Community%29)

Đây là nơi chứa các PNG export từ Figma/UI kit để dựng frontend.

Những file đã được dùng trực tiếp để code hiện tại:
- `Authentication.png`
- `Splash & Loading Screen.png`
- `🔒 Home & Transactions.png`

## 8. Dữ liệu thật hay giả

Trạng thái hiện tại:

- `Auth`: giả
- `Home`: giả
- `Transactions`: giả
- `Insights`: giả
- `Profile`: giả

Tất cả đang là frontend prototype chạy được, chưa có:
- API integration
- state management global
- persistent storage
- user session thật
- database

## 9. Cách chạy project

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

Hoặc nếu emulator đã mở sẵn, có thể chạy:

```bash
npx expo start
```

rồi bấm `a`.

### Kiểm tra code

```bash
npm run lint
npx tsc --noEmit
```

## 10. Những gì đã ổn

- Có routing rõ ràng bằng `expo-router`
- Có auth UI tương đối đồng bộ
- Có loading flow riêng
- Có main app flow để demo
- Có data mock đủ để test UI
- `lint` và `typecheck` đang sạch

## 11. Những gì chưa có hoặc nên làm tiếp

- auth thật
- API thật cho home/transactions
- lưu state và session
- dark mode thật
- search/filter thật trong transactions
- edit/delete transaction
- profile settings thật
- onboarding / welcome screen riêng
- tách thêm component cho home module để code gọn hơn

## 12. Gợi ý mở rộng tiếp theo

Nếu tiếp tục phát triển project này, thứ tự hợp lý là:

1. Tạo `services/` hoặc `lib/` để chuẩn bị API layer
2. Tạo `types/` riêng cho model dữ liệu
3. Tách `home.tsx` và `transactions.tsx` thành nhiều component nhỏ
4. Bỏ `test bypass` và thay bằng login flow thật
5. Thêm persistence như AsyncStorage hoặc backend session
6. Hoàn thiện thêm các board còn lại từ UI kit

## 13. Tóm tắt ngắn

Đây là một frontend prototype cho app tài chính cá nhân:
- có splash/loading
- có auth flow
- có home/tabs flow
- dùng theme xanh riêng
- đang ưu tiên dựng UI trước
- chưa nối backend

Nếu cần, bước tiếp theo mình có thể viết tiếp:
- `ARCHITECTURE.md`
- `ROUTING.md`
- `API_PLAN.md`
- hoặc tài liệu tiếng Việt chi tiết hơn cho từng màn hình.
