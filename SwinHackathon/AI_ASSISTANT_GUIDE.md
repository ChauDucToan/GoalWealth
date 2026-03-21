# AI Assistant Guide

Guide này mô tả phần `AI Finance Assistant` vừa được dựng từ board:

`finpal_ AI Finance Assistant App UI Kit (Community)/🔒 AI Finance Assisstant.png`

## Vị trí trong app

Đường vào chính:

- mở app
- đăng nhập test như hiện tại
- vào tab [`assistant.tsx`](./app/%28tabs%29/assistant.tsx)

Tab `Assistant` nằm trong [`app/(tabs)/_layout.tsx`](./app/%28tabs%29/_layout.tsx) với icon `smart-toy`.

## Những gì đã có

### 1. Intro assistant

Ngay lần mở đầu tiên, tab `Assistant` sẽ hiện 2 slide:

- `Meet Your Personal Finance Assistant`
- `Precautions & Limitations`

State này nằm trong [`context/assistantContext.tsx`](./context/assistantContext.tsx) qua biến:

- `hasSeenAssistantIntro`

### 2. Main assistant chat

File chính:

- [`app/(tabs)/assistant.tsx`](./app/%28tabs%29/assistant.tsx)

Màn này hiện là inbox / danh sách conversation, không phải chat view trực tiếp.

Nó có:

- hero card tóm tắt assistant
- danh sách nhiều conversation thread
- mở từng thread riêng ra route chat riêng

## Prompt / Scenario hiện có

Nguồn data:

- [`components/assistant/mock-data.ts`](./components/assistant/mock-data.ts)

Hiện có các scenario:

- `overview`
- `subscriptions`
- `reminder`
- `recurring`
- `categorize`
- `transfer`
- `inspiration`
- `spending-pattern`
- `projection`
- `resources`
- `nearby`
- `receipt`

Khi bấm một chip trong `Prompt Library`, app sẽ đổi toàn bộ conversation demo sang scenario đó.

Trong bản mới, mỗi scenario được hiển thị như một thread riêng trong inbox.

## Các màn phụ

Nhóm route:

- [`app/(assistant)`](./app/%28assistant%29)

Các màn hiện có:

- [`chat/[scenario].tsx`](./app/%28assistant%29/chat/%5Bscenario%5D.tsx)
- [`voice.tsx`](./app/%28assistant%29/voice.tsx)
- [`receipt-upload.tsx`](./app/%28assistant%29/receipt-upload.tsx)
- [`receipt-scan.tsx`](./app/%28assistant%29/receipt-scan.tsx)
- [`settings.tsx`](./app/%28assistant%29/settings.tsx)
- [`reset-memory.tsx`](./app/%28assistant%29/reset-memory.tsx)
- [`out-of-tokens.tsx`](./app/%28assistant%29/out-of-tokens.tsx)
- [`upgrade.tsx`](./app/%28assistant%29/upgrade.tsx)

### Chat Thread

File:

- [`chat/[scenario].tsx`](./app/%28assistant%29/chat/%5Bscenario%5D.tsx)

Màn này chứa:

- conversation renderer đầy đủ
- nút `+` cạnh ô chat để mở nhanh `Voice` và `Receipt`
- `Settings` ở góc trên cùng bên phải
- `Upgrade` nằm ở inbox assistant, không nằm trong thread chat
- composer nằm sát đáy hơn

### Voice

Màn `voice` là demo:

- orb microphone
- waveform listening
- chọn scenario sẽ trả về tab `Assistant`

### Receipt

Flow receipt:

1. `receipt-upload`
2. `receipt-scan`
3. `Send to assistant`

Khi gửi xong, app sẽ quay lại tab `Assistant` và load scenario `receipt`.

### Settings

Màn `settings` có 3 tab:

- `General`
- `Customize`
- `Privacy`

Cho phép đổi:

- assistant name
- voice
- language
- response type
- model
- custom instructions
- memory notes
- privacy toggles

### Upgrade / Limit

Có 2 màn riêng để test UI:

- `out-of-tokens`
- `upgrade`

Màn `upgrade` có thể đổi tạm plan trong context từ `free` sang `pro`.

## Shared state

Nguồn:

- [`context/assistantContext.tsx`](./context/assistantContext.tsx)
- [`hooks/use-assistant.tsx`](./hooks/use-assistant.tsx)

Hiện đang giữ:

- `activeScenarioId`
- `conversation`
- `assistantSettings`
- `hasSeenAssistantIntro`

Và các action:

- `markAssistantIntroSeen`
- `selectAssistantScenario`
- `sendAssistantMessage`
- `setAssistantSettings`
- `resetAssistantMemory`

## Component foundation

Các component dùng chung cho assistant:

- [`components/assistant/AssistantScaffold.tsx`](./components/assistant/AssistantScaffold.tsx)
- [`components/assistant/AssistantWidgets.tsx`](./components/assistant/AssistantWidgets.tsx)

`AssistantWidgets.tsx` đang render các card như:

- budget snapshot
- subscriptions
- action suggestions
- calendar reminder
- confirmation state
- transfer summary
- quote
- spending bar chart
- budget projection line chart
- resource recommendation
- nearby map mock
- receipt result

## Cách test nhanh

1. chạy app
2. sign in bằng bypass hiện tại
3. mở tab `Assistant`
4. bấm một conversation thread
5. trong màn chat thử:
   - mở `Voice`
   - mở `Receipt`
   - mở `Settings`
6. quay lại inbox assistant để mở `Upgrade`

## Giới hạn hiện tại

Phần này hiện vẫn là frontend mock:

- chưa có voice thật
- chưa có OCR thật
- chưa có AI backend thật
- chưa có token usage thật
- chưa có lưu persistent storage

Nó đang được dựng để bám UI board và test flow frontend trước.
