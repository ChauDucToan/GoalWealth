# Kha - Subscription Management Flow Và Các Refine Gần Đây

## 1. Mục tiêu của tài liệu

Tài liệu này ghi lại trạng thái hiện tại của module `Subscription Management` sau khi đã:

- dựng đủ module từ board `Subscription Management`
- mở rộng coverage cho setup, overview, detail, add/edit, payments, history, stats
- refine thêm các state còn thiếu để module gần board hơn

Tài liệu này ưu tiên trạng thái source hiện tại hơn các mô tả lịch sử cũ.

## 2. Các file chính của module

### 2.1. Màn chính

- `app/(finance)/subscriptions.tsx`
- `app/(finance)/subscription/[id].tsx`
- `app/(finance)/subscription-add.tsx`
- `app/(finance)/subscription-result.tsx`
- `app/(finance)/subscription-payments.tsx`
- `app/(finance)/subscription-history.tsx`
- `app/(finance)/subscription-stats.tsx`

### 2.2. Setup flow

- `app/(finance)/subscription-setup/index.tsx`
- `app/(finance)/subscription-setup/provider.tsx`
- `app/(finance)/subscription-setup/type.tsx`
- `app/(finance)/subscription-setup/amount.tsx`
- `app/(finance)/subscription-setup/next-payment.tsx`
- `app/(finance)/subscription-setup/cycle.tsx`
- `app/(finance)/subscription-setup/added.tsx`
- `app/(finance)/subscription-setup/_shared.tsx`
- `app/(finance)/subscription-setup/_layout.tsx`

### 2.3. Data và state

- `components/finance/subscription-data.ts`
- `context/subscriptionSetupContext.tsx`
- `hooks/use-subscription-setup.tsx`

## 3. Entry point hiện tại

Module đang được nối từ:

- `app/(tabs)/home.tsx`

Đường vào:

- `Home`
- `Quick Actions`
- `Bills`

## 4. Những gì đã có trong module

### 4.1. Overview workspace

`subscriptions.tsx` hiện đã có:

- hero tổng quan recurring spend
- yearly projection
- active count
- paused count
- upcoming renewals
- signal card
- payments entry
- stats entry
- active subscriptions list
- recent payments list
- optimization recommendations

### 4.2. Detail screen

`subscription/[id].tsx` hiện đã có:

- hero card
- status pill
- amount theo cycle
- timeline charges
- started on
- tracked total
- plan summary
- billing setup
- recent charges
- action buttons

### 4.3. Add/Edit screen

`subscription-add.tsx` hiện đã có:

- service selection
- search
- billing detail form
- category / cycle / payment method
- coupon / notes
- auto renew / smart reminder
- preview card
- create mode
- edit mode qua query param `preset`

### 4.4. Payments, history, stats

`subscription-payments.tsx` hiện đã có:

- hero summary
- search bar
- filter chips
- visible payment list
- empty/search-not-found state

`subscription-history.tsx` hiện đã có:

- ledger hero
- filter chips
- history rows với status

`subscription-stats.tsx` hiện đã có:

- total recurring
- ring summary
- KPI cards
- costly subscriptions
- optimization recommendations

### 4.5. Setup flow

7 bước đầu hiện đã có:

1. intro
2. provider
3. type
4. amount
5. next payment
6. cycle
7. added

## 5. Các refine mới nhất đã làm

Đây là phần bổ sung quan trọng so với bản dựng đầu tiên.

### 5.1. Add/Edit: bổ sung chooser state

`subscription-add.tsx` đã được mở rộng thêm:

- `Open library`
- service library dạng overlay/sheet
- `search not found` state trong library
- frequency chooser overlay riêng

Ý nghĩa:

- board gốc có các frame lựa chọn rõ hơn
- không còn cảm giác mọi thứ bị nhồi vào một form duy nhất

### 5.2. Detail: bổ sung confirm state cho lifecycle actions

`subscription/[id].tsx` hiện không còn bấm một phát sang result.

Các action:

- pause
- activate
- cancel

đều mở confirm overlay trước khi điều hướng sang result.

Ý nghĩa:

- khớp hơn với board có các frame xác nhận riêng
- hợp lý hơn về UX, vì đây là hành động trạng thái

### 5.3. Result: phân tông rõ hơn

`subscription-result.tsx` đã được refine để:

- có tone riêng theo mode
- có result pill
- bớt cảm giác generic

### 5.4. Payments và history: chuyển từ list đơn giản sang workspace rõ hơn

`subscription-payments.tsx` đã được làm lại để:

- có hero
- có search/filter thật
- có empty state giàu action hơn

`subscription-history.tsx` đã được làm lại để:

- có hero ledger
- có filter `All / Paid / Pending`
- có row/status rõ hơn

### 5.5. Setup flow: đồng bộ visual giữa 7 bước

Cụm `subscription-setup/*` đã được refine:

- shell spacing đồng đều hơn
- intro có metric row
- provider có summary card
- type có icon và mô tả
- amount có projection summary
- next payment có preview card
- cycle có preview và mô tả từng interval
- added có completion summary

## 6. Quyết định triển khai

### 6.1. Không dựng modal rời tách module

Các state confirm/chooser được giữ trong chính route liên quan bằng `Modal`.

Lý do:

- giảm số route vụn
- giữ context tương tác gần nơi sử dụng
- đủ để bám board mà không làm navigator phình thêm không cần thiết

### 6.2. Vẫn giữ data mock cục bộ

Module hiện chưa ghi vào global finance store thật.

Lý do:

- mục tiêu hiện tại là frontend parity và flow rõ ràng
- chưa cần kéo thêm complexity từ persistence layer

### 6.3. Ưu tiên state “dùng được” hơn là chỉ chụp ảnh màn

Các refine gần nhất đều đi theo hướng:

- có entry point rõ
- có search/filter usable
- có confirm state trước hành động
- có route hoặc overlay để test

thay vì chỉ dựng 1 frame tĩnh giống board.

## 7. Trạng thái hiện tại

So với giai đoạn trước:

- module này không còn là khu vực thiếu screen nữa
- phần còn lại chủ yếu là pixel tuning và rà parity frame-by-frame

Nếu tiếp tục làm sâu hơn, việc hợp lý nhất là:

1. rà 1:1 từng frame của board
2. tinh chỉnh spacing/iconography/typography
3. cân nhắc nối module vào finance state thật nếu feature được nâng lên mức product logic
