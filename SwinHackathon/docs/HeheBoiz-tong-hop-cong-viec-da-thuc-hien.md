# HeheBoiz - Tài Liệu Tổng Hợp Toàn Bộ Công Việc Đã Thực Hiện Trong Repo `SwinHackathon`

## 1. Mục đích của tài liệu

Tài liệu này được viết để tổng hợp lại một cách đầy đủ, chi tiết và có hệ thống toàn bộ các phần việc đã được thực hiện trong repo `SwinHackathon` trong quá trình làm việc gần đây.

Mục tiêu của tài liệu:

- Ghi lại rõ ràng những gì đã được sửa, thêm mới, cải tiến hoặc thay đổi.
- Giúp xem lại lịch sử thay đổi mà không cần phải dò từng file hoặc từng commit.
- Làm tài liệu bàn giao nội bộ để tiếp tục phát triển hoặc rà soát sau này.
- Nêu rõ những phần đã hoàn tất, những phần còn đang nằm ở worktree chưa commit, và các lưu ý quan trọng về mặt hành vi giao diện.

Tài liệu này hiện đã được mở rộng để bao toàn bộ các mốc công việc chính còn thấy rõ trong lịch sử git và worktree hiện tại, gồm:

1. Giai đoạn nền backend/AWS/test/CI ở các commit sớm.
2. Giai đoạn tạo `home`, cập nhật login/auth và đặt nền cho app shell.
3. Giai đoạn mở rộng lớn cho `AI Assistant` và module `Finance`.
4. Giai đoạn thêm `OAuth2`, `Search & Notifications`, `Profile`, `News & Resources`, `Achievements` và chỉnh `Transactions`.
5. Giai đoạn tinh chỉnh tổng thể giao diện, theme, layout, tab bar và nhiều màn hình hiện có.
6. Giai đoạn tối ưu `welcome` và tạo nền responsive dùng chung.
7. Đợt cải thiện responsive cho mobile và bổ sung cơ chế layout dạng grid linh hoạt.
8. Đợt bổ sung luồng `Finance Community`, làm mới `News & Resources` và dựng flow `Subscription Management`.

## 2. Bối cảnh kỹ thuật và trạng thái repo tại thời điểm viết tài liệu

### 2.1. Thông tin repo

- Tên repo: `SwinHackathon`
- Thư mục làm việc: `/home/heheboiz/data/GoalWealth/SwinHackathon`
- Branch hiện tại: `develop`

### 2.2. Các commit nổi bật liên quan trực tiếp đến công việc lần này

#### Commit 1

- Hash: `6364fb59474e52a592635ea7958fab62004fc62f`
- Message: `feat(ui): improve mobile responsiveness and add responsive grid`
- Thời gian: `19:41:10`, ngày `22/03/2026`

#### Commit 2

- Hash: `f9e859193b04c192ab0173853392b31d76c1f8ba`
- Message: `feat(community): add finance community and refresh news resources`
- Thời gian: `19:44:13`, ngày `22/03/2026`

### 2.3. Trạng thái worktree hiện tại tại thời điểm viết tài liệu

Các thay đổi hiện đang có trong worktree và chưa commit:

- `app/(tabs)/home.tsx`
- `app/(finance)/subscriptions.tsx`
- `app/(finance)/subscription/[id].tsx`
- `app/(finance)/subscription-add.tsx`
- `app/(finance)/subscription-confirm.tsx`
- `app/(finance)/subscription-history.tsx`
- `app/(finance)/subscription-payments.tsx`
- `app/(finance)/subscription-result.tsx`
- `app/(finance)/subscription-stats.tsx`
- `app/(finance)/subscription-upcoming.tsx`
- `components/finance/subscription-data.ts`

Nói ngắn gọn:

- Hai commit lớn trước đó đã nằm trong lịch sử git.
- Riêng flow `Subscription Management` hiện tại đang là phần frontend mới trong worktree, chưa được commit vào git ở thời điểm tài liệu này được tạo.

### 2.4. Ghi chú về cách tổng hợp các mốc cũ hơn

Phần mở rộng “trước hai commit gần nhất” trong phiên bản cập nhật của tài liệu này được tổng hợp dựa trên:

- lịch sử commit hiện còn trong branch `develop`
- danh sách file thay đổi ở từng commit
- cấu trúc source code hiện còn tồn tại trong repo

Điều này có nghĩa là:

- các phần gần hiện tại có thể mô tả rất cụ thể theo đúng quá trình làm việc
- các phần xa hơn trong lịch sử được mô tả lại theo git history, nên sẽ bám rất sát phạm vi file và ý nghĩa kỹ thuật, thay vì bám theo từng câu trao đổi cũ

## 2.5. Các giai đoạn trước hai commit lớn gần nhất trong lịch sử repo

### 2.5.1. Giai đoạn nền backend/AWS/test/CI

Đây là nhóm commit cũ hơn thuộc phần backend và hạ tầng, nhưng vẫn là một phần của tiến trình phát triển tổng thể.

#### Commit `c209fa5` - `feat: List instance in aws`

Các file nổi bật:

- `goalwealth/main.py`
- `goalwealth/routers/base_aws/__init__.py`
- `goalwealth/routers/base_aws/ec2.py`
- `goalwealth/routers/main.py`
- `pyproject.toml`
- `uv.lock`

Ý nghĩa:

- Thêm router/backend logic liên quan tới AWS EC2.
- Đặt nền cho việc expose endpoint hoặc logic backend để liệt kê instance.
- Cập nhật dependency tương ứng trong `pyproject.toml` và `uv.lock`.

#### Commit `1e3a084` - `feat: Making test for aws connection`

Các file nổi bật:

- `goalwealth/test/test_aws.py`
- `goalwealth/test/test_root.py`

Ý nghĩa:

- Thêm test cho kết nối AWS.
- Bổ sung test cho route/root.
- Cho thấy repo ở thời điểm này không chỉ có frontend mà đã bắt đầu có test layer cho backend.

#### Commit `36e6b1b` - `feat: create github ci`

File:

- `.github/workflows/goalwealth-tests.yml`

Ý nghĩa:

- Thiết lập GitHub Actions workflow để chạy test.
- Đánh dấu bước đầu chuẩn hóa CI cho repo.

#### Commit `f356d00` - `feat: update pyproject.toml`

File:

- `pyproject.toml`

Ý nghĩa:

- Tinh chỉnh cấu hình dependency hoặc build backend/Python layer.
- Đây là thay đổi nhỏ nhưng mang tính ổn định cấu hình môi trường.

### 2.5.2. Giai đoạn tạo `home` và cập nhật login/auth foundation

Commit tiêu biểu:

- `3fcc9f4 feat: create home and update login`

Đây là mốc rất quan trọng vì nó đặt nền cho app phía frontend.

Các khu vực thay đổi chính:

- `app/(auth)/forgetPassword.tsx`
- `app/(auth)/passwordResent.tsx`
- `app/(auth)/signIn.tsx`
- `app/(auth)/signUp.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/home.tsx`
- `app/(tabs)/insights.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/transactions.tsx`
- `app/index.tsx`
- `components/InputField.tsx`
- `components/ThemeButton.tsx`
- `components/auth/AuthKit.tsx`
- `components/home/mock-data.ts`
- `assets/images/loading-budget-photo.png`
- `README.md`

Những gì có thể kết luận từ commit này:

- Tạo ra màn `home` đầu tiên ở nhánh tab.
- Bổ sung các màn tab nền gồm `transactions`, `insights`, `profile`.
- Cập nhật mạnh phần authentication:
  - sign in
  - sign up
  - quên mật khẩu
  - password resent
- Hình thành `AuthKit`, `InputField`, `ThemeButton` như các thành phần tái sử dụng cho auth UI.
- Cập nhật `app/index.tsx` và app shell để định tuyến phù hợp hơn.
- Thêm mock data cho home.
- Cập nhật `README` khá lớn.

Vai trò của commit này:

- Có thể xem như điểm khởi tạo rõ ràng đầu tiên của phần frontend app theo hướng sản phẩm hoàn chỉnh.

### 2.5.3. Giai đoạn mở rộng lớn cho `AI Assistant` và module `Finance`

Commit tiêu biểu:

- `55734eb feat: update home and create ai ssisstant`

Đây là một trong những commit lớn nhất trong lịch sử gần đây của repo, cả về số file lẫn mức độ định hình tính năng.

Các nhóm thay đổi chính:

#### Nhóm tài liệu

- `AI_ASSISTANT_GUIDE.md`
- `INVESTMENTS_GUIDE.md`
- `README.md`

Ý nghĩa:

- Bổ sung tài liệu hướng dẫn cho assistant và investments.
- Tiếp tục mở rộng tài liệu sử dụng repo.

#### Nhóm route/layout mới

- `app/(assistant)/_layout.tsx`
- `app/(finance)/_layout.tsx`

Ý nghĩa:

- Tách riêng hai flow lớn là `assistant` và `finance`.
- Đặt nền routing rõ ràng hơn cho Expo Router.

#### Nhóm `AI Assistant`

Các màn được thêm:

- `app/(assistant)/chat/[scenario].tsx`
- `app/(assistant)/out-of-tokens.tsx`
- `app/(assistant)/receipt-scan.tsx`
- `app/(assistant)/receipt-upload.tsx`
- `app/(assistant)/reset-memory.tsx`
- `app/(assistant)/settings.tsx`
- `app/(assistant)/upgrade.tsx`
- `app/(assistant)/voice.tsx`
- `app/(tabs)/assistant.tsx`

Các thành phần và state đi kèm:

- `components/assistant/AssistantScaffold.tsx`
- `components/assistant/AssistantWidgets.tsx`
- `components/assistant/mock-data.ts`
- `context/assistantContext.tsx`
- `hooks/use-assistant.tsx`

Ý nghĩa:

- Tạo ra gần như toàn bộ hệ tính năng AI Assistant của app ở mức frontend mock tương đối đầy đủ.
- Có nhiều scenario chat, receipt OCR flow, voice flow, settings, upgrade state và out-of-tokens state.

#### Nhóm `Finance`

Các màn được thêm hoặc mở rộng mạnh:

- `app/(finance)/account.tsx`
- `app/(finance)/add-category.tsx`
- `app/(finance)/add-note.tsx`
- `app/(finance)/add-transaction.tsx`
- `app/(finance)/buy-stock.tsx`
- `app/(finance)/categories.tsx`
- `app/(finance)/date-range.tsx`
- `app/(finance)/ignore-transaction.tsx`
- `app/(finance)/investments.tsx`
- `app/(finance)/merchant-edit.tsx`
- `app/(finance)/merchant/[merchant].tsx`
- `app/(finance)/select-category.tsx`
- `app/(finance)/select-type.tsx`
- `app/(finance)/send-money.tsx`
- `app/(finance)/sending.tsx`
- `app/(finance)/set-recurring.tsx`
- `app/(finance)/sort-transactions.tsx`
- `app/(finance)/split-transaction.tsx`
- `app/(finance)/stock/[symbol].tsx`
- `app/(finance)/transaction/[id].tsx`
- `app/(finance)/transactions-filters.tsx`
- `app/(finance)/transactions-search.tsx`
- `app/(finance)/transfer-result.tsx`

Các thành phần và state đi kèm:

- `components/finance/FinanceScaffold.tsx`
- `components/finance/MarketDisplayControls.tsx`
- `components/finance/StockTrendChart.tsx`
- `components/finance/finance-utils.ts`
- `context/financeContext.tsx`
- `hooks/use-finance.tsx`

Ý nghĩa:

- Đây là mốc hình thành gần như toàn bộ module finance frontend.
- Bao gồm:
  - transactions flow
  - category flow
  - merchant flow
  - send money / transfer flow
  - stock detail / buy stock / investments flow

#### Nhóm tab và home

- `app/(tabs)/home.tsx`
- `app/(tabs)/insights.tsx`
- `app/(tabs)/transactions.tsx`
- `components/home/mock-data.ts`

Ý nghĩa:

- Nâng cấp rất mạnh màn `home`.
- Làm giàu dashboard, mock data và phần hiển thị tài chính.
- Tiếp tục mở rộng `insights` và `transactions`.

Vai trò của commit này:

- Đây là cột mốc biến app từ mức khung cơ bản sang một sản phẩm demo giàu tính năng hơn rất nhiều.

### 2.5.4. Giai đoạn thêm `OAuth2`, `News & Resources`, `Search & Notifications`, `Profile`, `Achievements`

Commit tiêu biểu:

- `576bdc0 feat: add feature Oauth2 Sign in, screens search-notification, profiles, news-resources, edditing transactions`

Các nhóm thay đổi chính:

#### OAuth2 sign-in

Các file:

- `.env.example`
- `app/(auth)/signIn.tsx`
- `services/oauth2.ts`
- `context/myUserContext.ts`
- `context/user.reducer.ts`
- `context/user.types.ts`

Ý nghĩa:

- Thêm tích hợp OAuth2 sign-in ở tầng frontend/service/context.
- Bổ sung cấu trúc state cho user.

#### `News & Resources`

Các file:

- `app/(news-resources)/_data.ts`
- `app/(news-resources)/_layout.tsx`
- `app/(news-resources)/news-resources-article-detail.tsx`
- `app/(news-resources)/news-resources-articles.tsx`
- `app/(news-resources)/news-resources-instructor.tsx`
- `app/(news-resources)/news-resources-workshop-detail.tsx`
- `app/(news-resources)/news-resources-workshops.tsx`
- `app/(tabs)/news-resources.tsx`
- `components/news/SupportBubble.tsx`

Ý nghĩa:

- Tạo gần như toàn bộ cụm tính năng `News & Resources`.
- Có layout riêng, data riêng, articles, workshops, instructor và detail screens.
- Đây là nền của nhóm màn news trước khi community được bổ sung về sau.

#### `Search & Notifications`

File:

- `app/(tabs)/search-notifications.tsx`

Ý nghĩa:

- Tạo mới màn `search-notifications` với quy mô khá lớn.

#### `Profile` và `Achievements`

Các file:

- `app/(tabs)/profile.tsx`
- `app/(tabs)/achievements.tsx`

Ý nghĩa:

- Thêm hoặc hoàn thiện mạnh nhóm màn cá nhân hóa người dùng.

#### `Insights` và `Transactions`

Các file:

- `app/(tabs)/insights.tsx`
- `app/(tabs)/transactions.tsx`

Ý nghĩa:

- Tiếp tục nâng cấp luồng transactions và insights đã có từ trước.

Vai trò của commit này:

- Mở rộng rõ rệt bề ngang tính năng của app.
- Đưa app tiến gần hơn tới bộ màn hình sản phẩm hoàn chỉnh.

### 2.5.5. Giai đoạn refine lớn trên theme, layout, navigation và nhiều màn hình hiện có

Commit tiêu biểu:

- `c8fdbe1 feat: new updates`

Đây là commit “polish / integration refinement” rất lớn, chạm vào `62 files`.

Những thay đổi mang tính hệ thống:

- cập nhật `app/_layout.tsx`
- cập nhật `app/(tabs)/_layout.tsx`
- cập nhật `constants/theme.ts`
- cập nhật `components/ThemeButton.tsx`
- cập nhật `components/navigation/AppTabBar.tsx`
- cập nhật `components/InputField.tsx`
- cập nhật `components/auth/AuthKit.tsx`

Các khu vực được tinh chỉnh mạnh:

- `app/welcome.tsx`
- `app/(tabs)/home.tsx`
- `app/(tabs)/achievements.tsx`
- `app/(tabs)/insights.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/search-notifications.tsx`
- `app/(tabs)/transactions.tsx`
- nhiều màn assistant
- nhiều màn finance
- nhiều màn news-resources

Ý nghĩa:

- Không phải chỉ thêm tính năng mới, mà còn là một đợt tinh chỉnh rộng:
  - theme token
  - navigation
  - layout gốc
  - app tab bar
  - welcome screen
  - nhiều màn đang tồn tại

Điểm đáng chú ý:

- `search-notifications.tsx` thay đổi rất lớn, cho thấy màn này đã được làm lại hoặc polish mạnh.
- `AppTabBar.tsx` có mức thay đổi lớn, nghĩa là trải nghiệm điều hướng ở đáy màn hình đã được đầu tư rõ ràng.
- `welcome.tsx`, `home.tsx`, `achievements.tsx`, `profile.tsx` cũng đều được làm lại mạnh tay.

Vai trò của commit này:

- Đây là giai đoạn tinh chỉnh để hợp nhất visual language và hành vi giao diện trên toàn app sau khi đã có nhiều module lớn.

### 2.5.6. Giai đoạn tối ưu `welcome` và đặt nền responsive dùng chung

Commit tiêu biểu:

- `6f52aaa feat: update welcome and reponsive`

Các file:

- `app/welcome.tsx`
- `components/InputField.tsx`
- `components/ThemeButton.tsx`
- `components/assistant/AssistantScaffold.tsx`
- `components/finance/FinanceScaffold.tsx`
- `components/navigation/AppTabBar.tsx`
- `hooks/use-responsive.ts`

Ý nghĩa:

- Đây là đợt chỉnh có chủ đích về responsive trước khi tới commit responsive lớn hơn sau đó.
- `welcome.tsx` được làm lại khá mạnh để hiển thị tốt hơn.
- `use-responsive.ts` được bổ sung rõ nét hơn, tạo nền cho các đợt responsive tiếp theo.
- Các shared component như `ThemeButton`, `AssistantScaffold`, `FinanceScaffold`, `AppTabBar` cũng được cập nhật theo hướng co giãn tốt hơn.

### 2.5.7. Giai đoạn refine responsive riêng cho `welcome`

Commit tiêu biểu:

- `b577787 feat: responsive`

File:

- `app/welcome.tsx`

Ý nghĩa:

- Là một đợt refine tiếp theo tập trung riêng vào `welcome`.
- Số dòng thay đổi lớn cho thấy màn welcome được tối ưu sâu để thích ứng tốt hơn với nhiều kích thước màn hình.

### 2.5.8. Mốc merge tích hợp nhánh

Commit:

- `084afcb Merge branch 'develop' of github.com:ChauDucToan/GoalWealth into feature/handle-conflict`

Ý nghĩa:

- Đây không phải một feature commit độc lập theo nghĩa thông thường.
- Nó là mốc tích hợp các thay đổi từ nhiều hướng phát triển:
  - backend/AWS/test/CI
  - assistant
  - finance
  - welcome/home
  - navigation

Vai trò:

- Giúp gom các phần phát triển lại với nhau trong lịch sử trước khi tiếp tục các vòng chỉnh sửa sau đó.

## 3. Giai đoạn 1: Cải thiện responsive cho mobile và bổ sung responsive grid

### 3.1. Vấn đề ban đầu

Mục tiêu ban đầu là đọc lại source code hiện có và tối ưu giao diện để hiển thị tốt hơn trên điện thoại, đặc biệt là màn hình nhỏ.

Các vấn đề được nhắm tới:

- Một số component/card bị tràn chữ khi màn hình hẹp.
- Nhiều hàng nút, hàng thống kê, hàng metadata không tự xuống hàng tốt.
- Có chỗ đang dùng chiều rộng cứng hoặc bố cục quá lạc quan với màn hình lớn.
- Một số cụm card hiển thị dạng nhiều cột nhưng không đủ linh hoạt khi thu nhỏ chiều ngang.
- Trải nghiệm nhìn trên mobile nhỏ bị vỡ bố cục, xấu và không đồng đều giữa các màn.

### 3.2. Hướng xử lý tổng quát

Thay vì chỉ vá từng chỗ riêng lẻ, hướng xử lý được chọn là:

- Sửa các helper responsive và shared scaffold trước.
- Loại bớt các ràng buộc gây tràn như `width` cứng, `minWidth` không hợp lý.
- Bổ sung `flexWrap`, `minWidth: 0`, `flexBasis`, card co giãn mềm hơn.
- Thêm một helper grid có khả năng tự tính số cột theo chiều ngang thực tế của màn hình.
- Sau đó áp dụng lại ở các màn hình chính và các cụm card thường bị vỡ bố cục.

### 3.3. Thành phần dùng chung đã được sửa hoặc bổ sung

#### `hooks/use-responsive.ts`

File:

- `hooks/use-responsive.ts`

Vai trò:

- Đây là hook nền để tính toán tỉ lệ co giãn theo kích thước màn hình.
- Hook này được chỉnh để hỗ trợ việc scale hợp lý hơn cho thiết bị nhỏ, giúp toàn bộ UI có hệ số co mượt hơn.

Tác động:

- Giảm hiện tượng UI giữ kích thước quá lớn trên điện thoại nhỏ.
- Tạo nền cho các component khác scale đồng đều hơn.

#### `components/ResponsiveGrid.tsx`

File:

- `components/ResponsiveGrid.tsx`

Đây là phần bổ sung quan trọng nhất của đợt responsive.

Mục đích:

- Tạo một primitive layout kiểu grid cho React Native.
- Dù React Native không có CSS Grid như web, component này mô phỏng hành vi “tự đổi số cột” theo bề ngang còn lại.

Cơ chế:

- Nhận các props như:
  - `minItemWidth`
  - `gap`
  - `maxColumns`
  - `horizontalPadding`
- Tính `availableWidth`.
- Từ đó suy ra số cột hợp lệ.
- Tự chia `width` của từng item theo tỉ lệ `%`.

Lợi ích:

- Trên màn hẹp, grid tự rơi về 1 cột.
- Trên màn lớn hơn, có thể tự lên 2 hoặc 3 cột.
- Không phải lặp lại logic `flexWrap` + `width: '48%'` ở nhiều nơi.

#### `components/ThemeButton.tsx`

File:

- `components/ThemeButton.tsx`

Điều chỉnh chính:

- Cải thiện khả năng co giãn của button.
- Cho text/button chịu ảnh hưởng của responsive scale tốt hơn.
- Hỗ trợ hiển thị ổn hơn trên màn hình nhỏ khi nút nằm cạnh nhau hoặc khi text dài hơn.

#### `components/assistant/AssistantScaffold.tsx`

File:

- `components/assistant/AssistantScaffold.tsx`

Điều chỉnh:

- Tinh chỉnh scaffold để spacing và kích thước header linh hoạt hơn.
- Giúp các màn assistant không bị bí chiều ngang khi chữ dài hoặc có nhiều action.

#### `components/assistant/AssistantWidgets.tsx`

File:

- `components/assistant/AssistantWidgets.tsx`

Điều chỉnh:

- Làm cho các widget trong assistant xuống hàng, co lại và xử lý text tốt hơn trên mobile.

#### `components/finance/FinanceScaffold.tsx`

File:

- `components/finance/FinanceScaffold.tsx`

Điều chỉnh:

- Tinh chỉnh padding, header, kích thước nút back, tiêu đề và subtitle.
- Cho layout finance screen co giãn tốt hơn ở máy nhỏ.
- Đây là scaffold nền mà rất nhiều màn finance sử dụng, nên tác động lan rộng.

#### `components/finance/MarketDisplayControls.tsx`

File:

- `components/finance/MarketDisplayControls.tsx`

Điều chỉnh:

- Sửa để nhóm control hiển thị ổn hơn trên màn hẹp, không bị dồn hoặc quá chật.

#### `components/navigation/AppTabBar.tsx`

File:

- `components/navigation/AppTabBar.tsx`

Điều chỉnh:

- Tối ưu tab bar cho mobile nhỏ.
- Cân lại spacing và trình bày icon/text để tránh cảm giác chật chội.

### 3.4. Các màn hình đã được sửa trong đợt responsive

#### Nhóm tab chính

Các file:

- `app/(tabs)/home.tsx`
- `app/(tabs)/transactions.tsx`
- `app/(tabs)/insights.tsx`
- `app/(tabs)/assistant.tsx`
- `app/(tabs)/achievements.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/search-notifications.tsx`

##### `app/(tabs)/home.tsx`

Đây là một trong những file được chỉnh nhiều nhất.

Những phần được xử lý:

- Các cụm card overview được làm linh hoạt hơn.
- `Quick Actions` được chuyển sang hướng grid responsive để tự đổi số cột.
- Các khối thống kê, account cards, activity highlights, resource cards và các vùng chứa nhiều item được làm co giãn tốt hơn.
- Cải thiện hiển thị cho text dài trong card.
- Giảm nguy cơ tràn chữ hoặc vỡ hàng ở điện thoại nhỏ.

##### `app/(tabs)/transactions.tsx`

Điều chỉnh:

- Tối ưu list item transaction để merchant name, amount, metadata và trạng thái không đè lên nhau.
- Giúp các hàng transaction hiển thị cân hơn trên màn hẹp.

##### `app/(tabs)/insights.tsx`

Điều chỉnh:

- Cân lại các card thống kê và biểu đồ tóm tắt.
- Hạn chế vỡ layout khi hiển thị nhiều thông tin trong cùng một hàng.

##### `app/(tabs)/assistant.tsx`

Điều chỉnh:

- Cải thiện cấu trúc các widget/card trong màn assistant để xuống hàng tốt hơn.

##### `app/(tabs)/achievements.tsx`

Điều chỉnh:

- Làm cho các badge/card thành tích hiển thị ổn hơn trên chiều ngang nhỏ.

##### `app/(tabs)/profile.tsx`

Điều chỉnh:

- Giảm tình trạng bó cứng card và các row thông tin profile.

##### `app/(tabs)/search-notifications.tsx`

Điều chỉnh:

- Đây là một màn được áp dụng grid tương đối rõ.
- Các card tìm kiếm/thông báo đã được gom và cho tự đổi bố cục theo chiều ngang.

#### Nhóm finance

Các file:

- `app/(finance)/add-transaction.tsx`
- `app/(finance)/investments.tsx`
- `app/(finance)/select-category.tsx`

##### `app/(finance)/add-transaction.tsx`

Điều chỉnh:

- Form add transaction được làm responsive hơn.
- Các hàng field, helper button, nhóm tùy chọn và switch bớt chật trên mobile.

##### `app/(finance)/investments.tsx`

Điều chỉnh:

- Một số cụm card trong investments được chuyển sang logic gần kiểu grid hơn để tự thay đổi số cột.
- Giảm hiện tượng text/metric đè nhau.

##### `app/(finance)/select-category.tsx`

Điều chỉnh:

- Cải thiện cách hiển thị danh sách category trên màn nhỏ.

#### Nhóm assistant

Các file:

- `app/(assistant)/receipt-upload.tsx`
- `app/(assistant)/receipt-scan.tsx`
- `app/(assistant)/voice.tsx`

##### `app/(assistant)/receipt-upload.tsx`

Điều chỉnh:

- Các khối `Import source` và `Recent receipts` đã được tổ chức lại theo `ResponsiveGrid`.
- Trên màn nhỏ, card có thể rơi về 1 cột hoặc 2 cột tùy không gian.

##### `app/(assistant)/receipt-scan.tsx`

Điều chỉnh:

- Tối ưu card, spacing và bố cục để bớt chật khi hiển thị trên điện thoại nhỏ.

##### `app/(assistant)/voice.tsx`

Điều chỉnh:

- Tinh chỉnh layout tổng thể để không bị nén xấu trên mobile.

### 3.5. Những cải tiến nổi bật về bố cục ở đợt này

Các kỹ thuật được áp dụng nhiều:

- Dùng `ResponsiveGrid` thay cho chia card kiểu phần trăm thủ công.
- Thêm `flexWrap: 'wrap'`.
- Thêm `minWidth: 0` cho các vùng text để text có thể co và xuống hàng đúng.
- Dùng `flexBasis` cho button/card khi cần responsive theo row.
- Giảm chiều rộng cứng gây vỡ layout.
- Sắp lại hierarchy spacing để card đỡ bí trên màn nhỏ.

### 3.6. Kết quả của đợt responsive

Kết quả đạt được:

- Giao diện thích ứng với màn hình điện thoại tốt hơn.
- Nhiều card có thể tự đổi từ 2 cột về 1 cột khi cần.
- Giảm đáng kể tình trạng tràn chữ.
- Các hàng nút và hàng metadata bớt gãy xấu.
- Nhìn tổng thể đồng đều hơn giữa các màn.

### 3.7. Thông tin commit và quy mô thay đổi

Commit:

- `6364fb5 feat(ui): improve mobile responsiveness and add responsive grid`

Thống kê:

- `21 files changed`
- `457 insertions`
- `109 deletions`

## 4. Giai đoạn 2: Bổ sung Finance Community và làm mới nhóm News & Resources

### 4.1. Mục tiêu của đợt này

Sau phần responsive, phần tiếp theo là bổ sung luồng community về tài chính và đồng thời làm mới một số màn thuộc cụm `News & Resources`.

Mục tiêu:

- Tạo một flow `Finance Community`.
- Xây bộ UI và mock data dùng chung cho community.
- Thêm các màn con cho community.
- Đồng thời làm mới các màn article/workshop/instructor trong cụm news-resources.

### 4.2. Các file đã thay đổi hoặc thêm mới

Danh sách file trong commit này:

- `app/(assistant)/settings.tsx`
- `app/(news-resources)/community-chat.tsx`
- `app/(news-resources)/community-delete-post.tsx`
- `app/(news-resources)/community-filter-posts.tsx`
- `app/(news-resources)/community-guidelines.tsx`
- `app/(news-resources)/community-post-success.tsx`
- `app/(news-resources)/news-resources-article-detail.tsx`
- `app/(news-resources)/news-resources-articles.tsx`
- `app/(news-resources)/news-resources-instructor.tsx`
- `app/(news-resources)/news-resources-workshop-detail.tsx`
- `app/(news-resources)/news-resources-workshops.tsx`
- `app/(tabs)/news-resources.tsx`
- `components/community/mock-data.ts`
- `components/community/ui.tsx`
- `context/assistantContext.tsx`

### 4.3. Những gì đã được thêm mới trong community

#### `components/community/ui.tsx`

Vai trò:

- Đây là bộ UI dùng chung cho toàn bộ flow community.
- Quy mô file rất lớn, cho thấy nhiều primitive giao diện đã được gom lại ở đây.

Các nhóm thành phần có thể suy ra từ import và cách dùng:

- avatar component
- card component
- illustration component
- post card component
- primary button riêng cho community
- tag chip
- rule / intro block / feed block

Ý nghĩa:

- Giúp flow community có visual language riêng nhưng vẫn dùng theme chung của app.
- Giảm lặp code giữa các màn community.

#### `components/community/mock-data.ts`

Vai trò:

- Chứa toàn bộ mock data cho community:
  - author
  - rules
  - feed tags
  - posts
  - intro points

Ý nghĩa:

- Cho phép dựng flow community có cảm giác hoàn chỉnh mà chưa cần backend thật.

### 4.4. Các màn mới trong community

#### `app/(news-resources)/community-chat.tsx`

Chức năng:

- Màn hội thoại hoặc phần thảo luận của community post.

#### `app/(news-resources)/community-delete-post.tsx`

Chức năng:

- Màn xác nhận xóa post hoặc thao tác xóa bài.

#### `app/(news-resources)/community-filter-posts.tsx`

Chức năng:

- Màn lọc bài viết community theo điều kiện, tag hoặc category.

#### `app/(news-resources)/community-guidelines.tsx`

Chức năng:

- Màn hiển thị guideline/rules cho community.

#### `app/(news-resources)/community-post-success.tsx`

Chức năng:

- Màn trạng thái sau khi đăng bài thành công.

### 4.5. Làm mới các màn `News & Resources`

Các file được làm mới:

- `app/(news-resources)/news-resources-article-detail.tsx`
- `app/(news-resources)/news-resources-articles.tsx`
- `app/(news-resources)/news-resources-instructor.tsx`
- `app/(news-resources)/news-resources-workshop-detail.tsx`
- `app/(news-resources)/news-resources-workshops.tsx`

Ý nghĩa:

- Các màn article/workshop/instructor không bị xóa.
- Chúng vẫn còn tồn tại trong repo.
- Chúng đã được làm lại hoặc mở rộng đáng kể về mặt giao diện và nội dung mock.

### 4.6. Thay đổi ở `app/(tabs)/news-resources.tsx`

Đây là lưu ý quan trọng nhất của đợt community.

File:

- `app/(tabs)/news-resources.tsx`

Thực tế:

- File này đã bị chuyển sang render màn `Finance Community`.
- Tức là entry screen của tab `news-resources` hiện tại không còn là màn news/resources gốc theo nghĩa cũ nữa.

Điều này đồng nghĩa:

- Code các màn news cũ vẫn còn.
- Nhưng route tab chính đang mở community thay vì news.

Đây là điểm đã được xác nhận lại trong quá trình trao đổi.

### 4.7. Điều chỉnh liên quan ở settings/context

Hai file:

- `app/(assistant)/settings.tsx`
- `context/assistantContext.tsx`

Mục đích:

- Cập nhật các text hoặc ngữ nghĩa liên quan để tương thích với luồng community/news-resources mới.

### 4.8. Lưu ý quan trọng cần ghi nhớ

Phần này rất quan trọng để tránh hiểu sai tình trạng codebase:

- Màn/news flow cũ không bị xóa khỏi repo.
- Nhưng tab root `news-resources` hiện tại đã đổi hành vi hiển thị.
- Nếu muốn giữ tab đó làm hub news/resources đúng như trước, cần có một đợt chỉnh tiếp theo để restore entry screen hoặc tách community sang route riêng.

### 4.9. Thông tin commit và quy mô thay đổi

Commit:

- `f9e8591 feat(community): add finance community and refresh news resources`

Thống kê:

- `15 files changed`
- `3422 insertions`
- `400 deletions`

## 5. Giai đoạn 3: Dựng frontend flow `Subscription Management` theo UI kit `Finpal`

### 5.1. Yêu cầu đặt ra

Mục tiêu ở giai đoạn này là dựng frontend theo ảnh:

- `finpal_ AI Finance Assistant App UI Kit (Community)/🔒 Subscription Management.png`

Ràng buộc đi kèm:

- Không dùng màu tùy ý.
- Phải lấy màu từ `constants/theme.ts`.

### 5.2. Cách tiếp cận

Thay vì dựng một màn đơn lẻ, hướng đi được chọn là dựng một flow đủ dùng theo đúng tinh thần của bộ UI kit:

- Overview screen
- Detail screen
- Add/Edit subscription screen
- Result/status screen

Điểm quan trọng:

- Vẫn bám layout tinh thần của kit.
- Nhưng visual token được lấy từ hệ màu thật của app thông qua `useTheme`.
- Không bẻ app thành một design language mới tách rời theme hiện có.

### 5.3. Dữ liệu mock dùng cho flow subscriptions

File:

- `components/finance/subscription-data.ts`

Đây là file dữ liệu nền cho toàn bộ flow subscription.

Những gì được thêm vào:

- `SubscriptionTone`
- `SubscriptionCycle`
- `SubscriptionStatus`
- `SubscriptionCharge`
- `SubscriptionItem`

Mock data cụ thể:

- `Netflix Entertainment`
- `Spotify`
- `Notion AI`
- `Pulse Gym`

Mỗi item có:

- `id`
- `name`
- `icon`
- `tone`
- `plan`
- `category`
- `amount`
- `cycle`
- `status`
- `nextPayment`
- `startedOn`
- `paymentMethod`
- `autoRenew`
- `description`
- `charges`

Ngoài danh sách subscription chính, file này còn cung cấp:

- `subscriptionCalendar`
- `subscriptionInsights`
- `subscriptionRecommendations`
- `subscriptionCategories`
- `subscriptionCycles`
- `subscriptionPaymentMethods`

Ý nghĩa:

- Tạo được toàn bộ UI flow khá đầy đủ mà không cần backend.
- Dữ liệu đủ để render overview, detail, payments, optimization, form chọn category/payment method.

### 5.4. Màn overview: `app/(finance)/subscriptions.tsx`

Đây là màn hình chính của flow subscriptions.

Chức năng:

- Hiển thị tổng quan subscription management.
- Tóm tắt recurring spend.
- Hiển thị upcoming renewals.
- Hiển thị stats/insights.
- Hiển thị danh sách active subscriptions.
- Hiển thị recent payments.
- Hiển thị recommendation card ở cuối màn.

Điểm nổi bật của màn này:

#### Hero card

- Dùng tông màu success nhưng được lấy từ theme.
- Hiển thị:
  - monthly recurring spend
  - yearly projection
  - số plan active
  - số plan paused
  - nearest charge

#### Upcoming renewals

- Render các thẻ lịch thanh toán sắp tới.
- Có xử lý card đang tới hạn theo tone nổi bật hơn.

#### Stats & Insights

- Có card dạng vòng tròn/tỷ lệ để mô phỏng visual trong bộ design.
- Có card optimization hiển thị các insight/savings point.

#### Active subscriptions

- Mỗi subscription là một card/row có:
  - icon
  - tên
  - trạng thái
  - plan/category
  - ngày charge tiếp theo
  - amount

- Nhấn vào từng item sẽ đi tới màn detail của subscription tương ứng.

#### Recent payments

- Dựng danh sách thanh toán gần nhất từ các charge mới nhất của từng subscription.

#### Recommendation block

- Card nền đậm hơn để tạo điểm nhấn cuối màn.
- Chứa danh sách gợi ý tối ưu.

### 5.5. Màn detail: `app/(finance)/subscription/[id].tsx`

Màn này hiện có 2 vai trò:

- detail screen khi `id` hợp lệ
- plan selector khi `id` không hợp lệ hoặc `id = select`

Ở chế độ detail, màn có:

- Hero section với icon, tên service, category, plan, description.
- Status pill hiển thị `Active` hoặc `Paused`.
- Price row hiển thị amount và chu kỳ tính phí.
- Timeline progress bar kiểu minh họa.
- Các mini metric:
  - next payment
  - started on
  - auto renew
- `Billing setup`
- `Recent charges`

Nhóm hành động:

- `Change Plan`
  - đẩy sang màn add/edit với preset tương ứng
- `Pause Subscription` hoặc `Activate Again`
  - đẩy sang màn confirm rồi mới sang result
- `Cancel Subscription`
  - chỉ hiện khi subscription đang active
  - cũng đi qua màn confirm

Ở chế độ chọn plan:

- user được tự chọn subscription muốn mở
- tránh mở mặc định vào một plan bất kỳ
- hợp hơn với hành vi của nút `Open Plan`

### 5.6. Màn add/edit: `app/(finance)/subscription-add.tsx`

Đây là màn add/edit chính hiện tại của flow.

Mục tiêu:

- dùng một màn duy nhất cho create và edit
- tối ưu thao tác trên mobile
- gom các field quan trọng vào một chỗ thay vì bắt user đi nhiều bước

Các phần chính:

#### Hero card

- Hiển thị service đang chọn.
- Cho thấy trạng thái đây là màn tạo mới hay cập nhật.
- Hiển thị amount và chu kỳ thanh toán hiện tại.
- Có mini card cho:
  - next payment
  - category
  - renewal mode

#### Choose service

- Có ô search `Search plan or service`.
- Có lưới card service để chọn nhanh service mẫu.
- Khi đổi service, các field cốt lõi bên dưới được cập nhật theo preset của item đó.

#### Subscription setup

Bao gồm các field cốt lõi:

- amount
- next payment due
- billing cycle
- category
- payment method
- auto renew

#### Card hành động cuối màn

- Tóm tắt ngắn cấu hình hiện tại.
- Có 2 action:
  - `Save Plan` hoặc `Save Changes`
  - `Cancel`

Hành vi:

- Nếu đang sửa một subscription có sẵn, save sẽ đẩy sang result screen với mode `updated`.
- Nếu là tạo mới, save sẽ đẩy sang result screen với mode `added`.
- Nếu chưa chọn service, nút save sẽ bị disable.

Lưu ý:

- Đây là frontend flow/mock UI.
- Chưa ghi vào persistent state thật.
- Chủ yếu phục vụ hiển thị, tương tác giao diện và điều hướng demo.

#### Cập nhật tinh gọn mới nhất

Đã có một lần thử tách `Add Plan` thành wizard nhiều bước.

Sau khi rà lại UX mobile, flow đó đã được gỡ bỏ để:

- quay về 1 màn add/edit duy nhất
- giảm số lần điều hướng
- tránh cảm giác form bị rời rạc

Các phần đã cắt:

- `Coupon code`
- `Description`
- `Smart reminder`
- toàn bộ route `subscription-create/*`

### 5.7. Màn trạng thái kết quả: `app/(finance)/subscription-result.tsx`

Màn này được thêm để hoàn thiện các flow sau thao tác.

Các mode đang hỗ trợ:

- `added`
- `updated`
- `paused`
- `reactivated`
- `cancelled`

Mỗi mode có:

- icon riêng
- title riêng
- body mô tả riêng
- accent color riêng lấy từ theme

Nội dung màn:

- icon state lớn ở giữa
- title
- body
- summary card hiển thị:
  - subscription
  - plan
  - next payment

Button:

- `Open Details`
- `Back to subscriptions`
- `Add another subscription`

Cập nhật mới:

- `Add another subscription` hiện quay về `subscription-add`
- không còn đi sang wizard nhiều bước

### 5.8. Các màn phụ trợ mới

Ngoài 4 màn chính, flow hiện còn có các màn phụ trợ:

- `app/(finance)/subscription-upcoming.tsx`
- `app/(finance)/subscription-payments.tsx`
- `app/(finance)/subscription-history.tsx`
- `app/(finance)/subscription-stats.tsx`
- `app/(finance)/subscription-confirm.tsx`

Vai trò:

- tách các trạng thái phụ như lịch thanh toán, lịch sử, thống kê và confirm action
- tránh dồn tất cả mọi thứ vào `subscriptions.tsx`

### 5.9. Nối entry từ home

File:

- `app/(tabs)/home.tsx`

Thay đổi:

- Quick action `Bills` với `action.id === 'receipt'` đã được nối sang:
  - `/(finance)/subscriptions`

Ý nghĩa:

- Từ dashboard có thể đi trực tiếp vào flow subscription mới.
- Không cần truy cập route thủ công.

### 5.10. Nguyên tắc dùng màu

Đây là điểm quan trọng theo đúng yêu cầu.

Tất cả màu được lấy theo hướng:

- dùng `useTheme()`
- đọc `colors` từ `constants/theme.ts`
- kết hợp `hexToRgba(...)` khi cần alpha

Các màu accent được dùng từ theme:

- `primaryDark`
- `success`
- `warning`
- `error`
- `card`
- `backgroundSoft`
- `text`
- `border`
- `darkBackground`

Điều này đảm bảo:

- Flow subscription không bị lệch khỏi palette chung của app.
- Có thể thay đổi theme token về sau mà màn này vẫn đồng bộ.

### 5.11. Kiểm tra chất lượng

Đã chạy lệnh:

```bash
pnpm lint
```

Kết quả:

- Pass

### 5.12. Trạng thái hiện tại của flow subscription

Các file liên quan:

- `components/finance/subscription-data.ts`
- `app/(finance)/subscriptions.tsx`
- `app/(finance)/subscription/[id].tsx`
- `app/(finance)/subscription-add.tsx`
- `app/(finance)/subscription-confirm.tsx`
- `app/(finance)/subscription-history.tsx`
- `app/(finance)/subscription-payments.tsx`
- `app/(finance)/subscription-result.tsx`
- `app/(finance)/subscription-stats.tsx`
- `app/(finance)/subscription-upcoming.tsx`
- `app/(tabs)/home.tsx`

Trạng thái:

- Đã dựng UI flow đủ để demo.
- Đã route được từ home.
- Đã bỏ flow wizard nhiều bước cho `Add Plan`.
- Đã rút gọn form add/edit để dễ dùng hơn.
- Đã lint pass.
- Chưa commit vào git tại thời điểm viết tài liệu này.

## 6. Tóm tắt theo mốc thời gian

### Mốc 1: Tối ưu responsive mobile

Đã làm:

- Đọc lại nhiều phần trong repo.
- Sửa helper responsive.
- Thêm `ResponsiveGrid`.
- Tối ưu shared scaffold.
- Tối ưu nhiều tab và màn finance/assistant cho mobile nhỏ.

Kết quả:

- Có commit `6364fb5`.

### Mốc 2: Dựng `Finance Community` và làm mới `News & Resources`

Đã làm:

- Tạo bộ `components/community`.
- Tạo mock data cho community.
- Thêm các màn community.
- Làm lại một số màn article/workshop/instructor.
- Đổi root của tab `news-resources` sang community.

Kết quả:

- Có commit `f9e8591`.

### Mốc 3: Dựng flow `Subscription Management`

Đã làm:

- Tạo mock data cho subscription.
- Dựng overview screen.
- Dựng detail screen.
- Dựng add/edit screen.
- Dựng result screen.
- Nối quick action `Bills` từ home.
- Chạy lint và pass.

Kết quả:

- Đang nằm ở worktree, chưa commit.

## 7. Các lưu ý quan trọng cần nhớ khi tiếp tục phát triển

### 7.1. Lưu ý về `News & Resources`

Hiện trạng:

- Code news cũ vẫn còn.
- Nhưng tab root `news-resources` đang render community.

Nếu mục tiêu sản phẩm là:

- `News & Resources` vẫn phải là khu vực news/workshop chính

thì cần làm thêm một bước:

- restore entry screen của `app/(tabs)/news-resources.tsx`
- hoặc tách `Finance Community` sang route/tab riêng

### 7.2. Lưu ý về `Subscription Management`

Hiện trạng:

- Flow subscription hiện là frontend mock có điều hướng tốt.
- Chưa được gắn với state quản lý subscription thật.
- Chưa có CRUD persistence.
- Các thao tác add/update/pause/cancel hiện mới mang tính trình diễn UI.

Nếu muốn đẩy tiếp:

- cần tạo source of truth cho subscriptions
- đồng bộ với context/store
- bổ sung thao tác ghi dữ liệu
- cập nhật danh sách subscriptions theo dữ liệu mới thay vì mock tĩnh

### 7.3. Lưu ý về kiểm thử

Hiện đã làm:

- chạy `pnpm lint`

Chưa thấy ghi nhận trong đợt này:

- chạy simulator để soi trực quan tất cả màn
- snapshot test
- e2e flow test

Vì vậy:

- Về mặt code/style/lint hiện ổn
- Nhưng về cảm quan hình ảnh cuối cùng trên thiết bị thật vẫn nên kiểm tra thêm

## 8. Danh sách file theo từng nhóm thay đổi

### 8.1. Nhóm responsive / mobile

- `app/(assistant)/receipt-scan.tsx`
- `app/(assistant)/receipt-upload.tsx`
- `app/(assistant)/voice.tsx`
- `app/(finance)/add-transaction.tsx`
- `app/(finance)/investments.tsx`
- `app/(finance)/select-category.tsx`
- `app/(tabs)/achievements.tsx`
- `app/(tabs)/assistant.tsx`
- `app/(tabs)/home.tsx`
- `app/(tabs)/insights.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/search-notifications.tsx`
- `app/(tabs)/transactions.tsx`
- `components/ResponsiveGrid.tsx`
- `components/ThemeButton.tsx`
- `components/assistant/AssistantScaffold.tsx`
- `components/assistant/AssistantWidgets.tsx`
- `components/finance/FinanceScaffold.tsx`
- `components/finance/MarketDisplayControls.tsx`
- `components/navigation/AppTabBar.tsx`
- `hooks/use-responsive.ts`

### 8.2. Nhóm community / news-resources

- `app/(assistant)/settings.tsx`
- `app/(news-resources)/community-chat.tsx`
- `app/(news-resources)/community-delete-post.tsx`
- `app/(news-resources)/community-filter-posts.tsx`
- `app/(news-resources)/community-guidelines.tsx`
- `app/(news-resources)/community-post-success.tsx`
- `app/(news-resources)/news-resources-article-detail.tsx`
- `app/(news-resources)/news-resources-articles.tsx`
- `app/(news-resources)/news-resources-instructor.tsx`
- `app/(news-resources)/news-resources-workshop-detail.tsx`
- `app/(news-resources)/news-resources-workshops.tsx`
- `app/(tabs)/news-resources.tsx`
- `components/community/mock-data.ts`
- `components/community/ui.tsx`
- `context/assistantContext.tsx`

### 8.3. Nhóm subscription management hiện đang ở worktree

- `app/(tabs)/home.tsx`
- `app/(finance)/subscriptions.tsx`
- `app/(finance)/subscription/[id].tsx`
- `app/(finance)/subscription-add.tsx`
- `app/(finance)/subscription-confirm.tsx`
- `app/(finance)/subscription-history.tsx`
- `app/(finance)/subscription-payments.tsx`
- `app/(finance)/subscription-result.tsx`
- `app/(finance)/subscription-stats.tsx`
- `app/(finance)/subscription-upcoming.tsx`
- `components/finance/subscription-data.ts`

## 9. Kết luận tổng quát

Tổng thể, khối lượng công việc đã thực hiện trong đợt này là tương đối lớn và trải trên nhiều lớp:

- lớp hạ tầng responsive
- lớp shared UI/scaffold
- lớp screen ở nhiều module khác nhau
- lớp feature/community
- lớp feature mới cho subscription management

Nếu tóm gọn thành kết quả thực tế đã đạt được, có thể nói như sau:

1. Giao diện app đã thích ứng với mobile tốt hơn đáng kể nhờ đợt tối ưu responsive và cơ chế `ResponsiveGrid`.
2. Một hệ `Finance Community` khá đầy đủ đã được thêm vào repo, cùng với việc làm mới các màn liên quan tới `News & Resources`.
3. Một flow `Subscription Management` theo cảm hứng từ bộ UI kit `Finpal` đã được dựng ra ở mức frontend demo khá hoàn chỉnh, dùng đúng hệ màu từ `constants/theme.ts`, sau đó đã được tinh gọn lại để `Add Plan` quay về một màn duy nhất thân thiện hơn với mobile.

Điểm cần nhớ nhất sau khi đọc xong tài liệu này:

- `News & Resources` hiện đang có thay đổi hành vi ở root tab và cần quyết định rõ có giữ community tại đó hay không.
- `Subscription Management` hiện đã usable về mặt giao diện, đã có thêm các màn phụ trợ, nhưng vẫn chưa có persistence thật.

---

Tài liệu được tạo trong thư mục:

- `docs/HeheBoiz-tong-hop-cong-viec-da-thuc-hien.md`

Tài liệu này có thể tiếp tục cập nhật ở các đợt sau để làm changelog kỹ thuật nội bộ cho repo.
