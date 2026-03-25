# HeheBoiz - Kiến Trúc Tổng Quan Và Cấu Trúc Repo

## 1. Mục tiêu của tài liệu

Tài liệu này tập trung mô tả kiến trúc hiện tại của app theo đúng source code trong repo, thay vì mô tả theo lịch sử commit.

Mục tiêu chính:

- Giải thích app được tổ chức như thế nào.
- Chỉ ra các tầng route, state, shared UI và dữ liệu mock.
- Giúp người đọc hiểu repo từ góc nhìn triển khai thực tế.

## 2. Kiến trúc tổng thể

Repo hiện tại có hai phần đáng chú ý:

- phần frontend/app chính nằm trong `SwinHackathon`
- phần backend/Python nằm trong thư mục `goalwealth`

Tuy nhiên ở giai đoạn hiện tại, phần được đầu tư nhiều nhất về giao diện và luồng sử dụng là frontend React Native/Expo.

Frontend đang dùng:

- `Expo Router`
- `React`
- `React Native`
- context state nội bộ
- mock data cho phần lớn flow

## 3. Root app architecture

### 3.1. Root layout

File:

- `app/_layout.tsx`

Root layout đang bọc app theo thứ tự:

1. `ThemeProvider`
2. `MyUserProvider`
3. `ProfileSettingsProvider`
4. `SmartBudgetingProvider`
5. `IntroPreferencesProvider`
6. `AssistantProvider`
7. `FinanceProvider`
8. `Stack`

Điều này cho thấy:

- theme là lớp ngoài cùng
- state user, profile settings, smart budgeting, intro preferences, assistant và finance đều có scope toàn app
- routing được quản lý bằng `Stack` của Expo Router

### 3.2. Các nhóm route chính

Từ `app/_layout.tsx`, app hiện có các tuyến lớn:

- `index`
- `welcome`
- `(auth)`
- `(tabs)`
- `(finance)`
- `(assistant)`
- `(profile)`

Nói ngắn gọn:

- `index` là màn loading/intro vào app
- `welcome` là onboarding/landing flow
- `(auth)` là nhóm xác thực
- `(tabs)` là vùng sử dụng chính của app
- `(finance)` là nhóm flow chi tiết của nghiệp vụ tài chính
- `(assistant)` là nhóm flow chi tiết của trợ lý AI
- `(profile)` là nhóm detail screen của `Profile Settings`

## 4. Cấu trúc route theo nhóm

### 4.1. Nhóm `app/(auth)`

Layout:

- `app/(auth)/_layout.tsx`

Các màn:

- `signIn`
- `signUp`
- `forgetPassword`
- `passwordResent`

Vai trò:

- Chứa toàn bộ flow đăng nhập/đăng ký/quên mật khẩu.
- Đây là tuyến vào app sau màn `welcome`.

### 4.2. Nhóm `app/(tabs)`

Layout:

- `app/(tabs)/_layout.tsx`

App đang dùng `Tabs` với custom tab bar:

- `AppTabBar`

Các tab hiện có:

- `home`
- `transactions`
- `achievements`
- `news-resources`
- `search-notifications`
- `insights`
- `assistant`
- `profile`

Vai trò:

- Đây là vùng entry chính sau khi người dùng vào app.
- Các tab thể hiện cấu trúc sản phẩm thiên về demo đa tính năng.

### 4.3. Nhóm `app/(finance)`

Layout:

- `app/(finance)/_layout.tsx`

Đặc điểm:

- Dùng `Stack`
- `headerShown: false`
- `presentation: 'card'`

Nhóm này chứa hầu hết flow chi tiết của nghiệp vụ tài chính, ví dụ:

- transaction detail
- search/filter transactions
- add transaction
- select category/type
- send money
- investments
- stock detail
- merchant editing
- subscription management

### 4.4. Nhóm `app/(assistant)`

Layout:

- `app/(assistant)/_layout.tsx`

Đặc điểm:

- dùng `Stack`
- `headerShown: false`
- `presentation: 'card'`

Nhóm này chứa các flow phụ của AI Assistant:

- chat
- receipt upload
- receipt scan
- voice
- upgrade
- settings
- out-of-tokens
- reset-memory

### 4.5. Nhóm `app/(news-resources)`

Layout:

- `app/(news-resources)/_layout.tsx`

Đây là nhóm route cho:

- article
- workshops
- instructor
- community child screens

Lưu ý kiến trúc quan trọng:

- các màn `news-resources` cũ vẫn còn trong nhóm route này
- nhưng tab root `app/(tabs)/news-resources.tsx` hiện đang render community flow

### 4.6. Nhóm `app/(profile)`

Layout:

- `app/(profile)/_layout.tsx`

Nhóm này hiện chứa:

- `account`
- `preferences`
- `notifications`
- `security`
- `password`
- `passcode`
- `linked-accounts`
- `support`
- `result`

Vai trò:

- giữ các detail screen của tab `Profile`
- tách phần hub `profile` và phần stack settings ra rõ ràng
- cho phép mở rộng `Profile Settings` mà không làm tab root phình to quá mức

## 5. Tầng state management

### 5.1. `ThemeProvider`

File:

- `hooks/use-theme-colors.tsx`
- `context/themeContext.ts`
- `constants/theme.ts`

Vai trò:

- Cung cấp `colors` và `isDark` cho toàn app.

Điểm đáng chú ý:

- Hiện tại `ThemeProvider` đang trả về `Colors.light` cho cả khi dark mode lẫn light mode.
- Nghĩa là app có cờ `isDark`, nhưng màu thực tế vẫn đang cố định theo light palette.

Hệ quả:

- Việc hỗ trợ dark theme mới ở mức cấu trúc, chưa hoàn chỉnh ở phần token thực tế.

### 5.2. `MyUserProvider`

File:

- `context/myUserContext.ts`
- `context/user.reducer.ts`
- `context/user.types.ts`

Vai trò:

- Quản lý user state bằng `useReducer`.
- Được dùng cho auth/login/OAuth2 state.

Đặc điểm:

- Có `state`
- có `dispatch`
- có `actions`

Nghĩa là tầng user đang theo hướng reducer-driven, hợp với các flow auth hơn là chỉ dùng local state rời rạc.

### 5.3. `AssistantProvider`

File:

- `context/assistantContext.tsx`

Vai trò:

- Quản lý state cho assistant ở phạm vi toàn app.

Những state chính:

- `hasSeenAssistantIntro`
- `activeScenarioId`
- `conversation`
- `assistantSettings`

Các hành vi chính:

- chọn scenario
- gửi tin nhắn mới
- cập nhật settings
- reset memory

Đặc trưng:

- Hiện vẫn thiên về mock/demo logic.
- Conversation được build từ `assistantScenarios` trong mock data.

### 5.4. `ProfileSettingsProvider`

File:

- `context/profileSettingsContext.tsx`

Vai trò:

- quản lý toàn bộ state cho flow `Profile Settings`

Những state chính:

- `profile`
- `notifications`
- `security`
- `display`
- `linkedAccounts`
- `invite`
- `appRating`
- `exportStatusLabel`
- `feedbackDraft`

Ý nghĩa:

- tab `profile` và các màn trong `/(profile)` chia sẻ một nguồn state duy nhất
- phù hợp với hướng app đang đi: dùng context mock để đẩy nhanh frontend flow

### 5.5. `IntroPreferencesProvider`

File:

- `context/introPreferencesContext.tsx`

Vai trò:

- lưu các cờ “đã xem intro chưa” bằng `AsyncStorage`

Các cờ hiện có:

- `hasSeenWelcome`
- `hasSeenAssistantIntro`
- `hasSeenSubscriptionIntro`
- `hasSeenFinancialGoalsIntro`
- `hasSeenCommunityIntro`
- `hasSeenSmartBudgetSetupIntro`

Ý nghĩa:

- các màn landing/intro không lặp lại ở mỗi lần mở app
- cải thiện UX cho các flow như `welcome`, `assistant`, `subscriptions`, `financial goals`, `community`, `smart budgeting`

### 5.6. `FinanceProvider`

File:

- `context/financeContext.tsx`

Vai trò:

- Là state hub của các nghiệp vụ finance frontend.

Những state chính:

- `transactions`
- `categories`
- `stocks`
- `stockHoldings`
- `watchlistSymbols`
- `defaultStockSymbol`
- `displayCurrency`
- `displayUnit`
- `transactionDraft`

Các hành vi chính:

- thêm transaction
- đổi trạng thái transaction
- thêm category
- đổi tên merchant
- mua stock
- thêm/xóa stock khỏi watchlist
- đổi stock mặc định
- tìm transaction theo id/merchant
- update/reset transaction draft

Lưu ý:

- `Subscription Management` hiện chưa được tích hợp vào `FinanceContext`.
- Flow subscription vẫn đang dùng mock data riêng, tách khỏi context này.

## 6. Tầng hooks

Các hook hiện có:

- `hooks/use-assistant.tsx`
- `hooks/use-finance.tsx`
- `hooks/use-profile-setup.tsx`
- `hooks/use-responsive.ts`
- `hooks/use-tab-bar-clearance.ts`
- `hooks/use-theme-colors.tsx`

Ý nghĩa:

- `use-assistant` và `use-finance` đóng vai trò wrapper để truy cập context tương ứng.
- `use-profile-setup` là wrapper cho flow onboarding `Profile Setup & Account Completion`.
- `use-theme-colors` là nguồn theme thực tế cho UI.
- `use-responsive` là nền tảng cho toàn bộ logic scale/responsive được tăng cường ở các đợt sau.
- `use-tab-bar-clearance` giúp các tab root có khoảng đệm an toàn để nội dung cuối không bị `AppTabBar` che.

## 7. Tầng component

### 7.1. Shared UI foundation

Các file tiêu biểu:

- `components/ThemeButton.tsx`
- `components/InputField.tsx`
- `components/auth/AuthKit.tsx`

Vai trò:

- Tạo ra các primitive UI dùng lại giữa auth và các flow khác.

### 7.2. Shared scaffold theo domain

Các file:

- `components/assistant/AssistantScaffold.tsx`
- `components/finance/FinanceScaffold.tsx`

Vai trò:

- Chuẩn hóa header, spacing, card shell, kiểu hiển thị cho từng domain.

### 7.3. Component domain-specific

Ví dụ:

- `components/assistant/AssistantWidgets.tsx`
- `components/finance/MarketDisplayControls.tsx`
- `components/finance/StockTrendChart.tsx`
- `components/home/mock-data.ts`
- `components/community/ui.tsx`

Ý nghĩa:

- Mỗi domain đang có các component riêng, thay vì nhồi toàn bộ vào shared base.
- Đây là hướng tách lớp khá hợp lý cho một repo demo nhiều màn hình.

### 7.4. Component grid và responsive

File:

- `components/ResponsiveGrid.tsx`

Vai trò:

- Đây là primitive giúp nhiều cụm card tự đổi bố cục theo chiều ngang màn hình.
- Là thành phần quan trọng trong đợt tối ưu mobile gần đây.

## 8. Tầng dữ liệu và mock

Repo hiện dùng mock data khá nhiều:

- `components/home/mock-data.ts`
- `components/assistant/mock-data.ts`
- `components/community/mock-data.ts`
- `components/finance/subscription-data.ts`
- `app/(news-resources)/_data.ts`

Điều này cho thấy:

- app hiện thiên về product demo / interactive prototype
- backend thật chưa phải nguồn dữ liệu chính cho toàn bộ frontend
- nhiều flow được dựng để thể hiện UI, state chuyển màn và trải nghiệm người dùng

## 9. Sơ đồ cấu trúc thư mục frontend ở mức khái quát

```text
app/
  _layout.tsx
  index.tsx
  welcome.tsx
  (auth)/
  (tabs)/
  (finance)/
  (assistant)/
  (news-resources)/

components/
  auth/
  assistant/
  finance/
  community/
  navigation/
  home/

context/
  assistantContext.tsx
  financeContext.tsx
  myUserContext.ts
  themeContext.ts
  user.reducer.ts
  user.types.ts

hooks/
  use-assistant.tsx
  use-finance.tsx
  use-responsive.ts
  use-theme-colors.tsx

constants/
  theme.ts
```

## 10. Những điểm mạnh của kiến trúc hiện tại

- Đã tách route theo domain khá rõ.
- Có context riêng cho `assistant`, `finance`, `user`.
- Có scaffold riêng theo domain.
- Có shared responsive primitive.
- Dễ mở rộng thêm màn demo mà không phải đập cấu trúc nền.

## 11. Những điểm cần lưu ý nếu tiếp tục phát triển

### 11.1. Dark theme chưa hoàn tất

- `isDark` có nhưng palette thực tế chưa đổi theo dark.

### 11.2. Subscription flow chưa vào state trung tâm

- `Subscription Management` hiện vẫn tách riêng khỏi `FinanceContext`.

### 11.3. Tab `news-resources` đang mang hành vi community

- Kiến trúc route vẫn còn news screens cũ.
- Nhưng entry tab hiện tại là community.

### 11.4. Nhiều flow vẫn là mock/demo

- Đây là lợi thế cho UI prototyping.
- Nhưng nếu đi tiếp sang production thì cần chuẩn hóa state source và persistence.
