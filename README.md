# GoalWealth Hybrid Crawl Backend

Backend AWS/serverless cho GoalWealth, tập trung vào:
- RSS crawler bằng Lambda
- Feed Registry bằng DynamoDB
- OpenSearch Serverless cho retrieval
- Smart Agent trả JSON sạch cho OpenClaw orchestrator
- Hybrid crawl: warm sync + on-demand refresh

## Stack hiện tại
- AWS Lambda
- DynamoDB
- OpenSearch Serverless
- EventBridge Scheduler
- Amazon Bedrock (embedding)
- OIDC-first auth direction (Google), chưa wiring public API ở phase này

## Kiến trúc ngắn gọn
1. RSS feeds được khai báo trong `infra/sample-feeds.json`
2. Seed script nạp feeds vào `FeedRegistryTable`
3. `RssCrawlerFunction` đọc feed từ DynamoDB, crawl RSS, embed, và upsert vào OpenSearch
4. `SmartAgentFunction` query OpenSearch và trigger refresh nền khi cần
5. Smart Agent chỉ trả JSON; OpenClaw main mới là nơi render trả lời cho user

## Region note cực quan trọng
Model embedding hiện tại là:
- `amazon.titan-embed-text-v2:0`

Vì vậy **phải chọn AWS region có hỗ trợ Titan V2 cho account của bạn**.
Trong quá trình test thực tế, `ap-southeast-1` không liệt kê Titan embeddings cho account hiện tại, nên deploy/test nên ưu tiên region phù hợp như `ap-northeast-1` nếu model xuất hiện ở đó.

Check nhanh:

```bash
aws bedrock list-foundation-models --region ap-northeast-1 | grep titan
```

## RSS feed sources
Danh sách seed ban đầu nằm ở:
- `infra/sample-feeds.json`

Hiện file này gồm:
- feed quốc tế (TechCrunch, AWS ML Blog, NVIDIA, The Verge, NYT)
- feed báo Việt đã verify được từ môi trường test:
  - Tuổi Trẻ
  - Thanh Niên
  - Dân Trí
  - Vietnamnet
  - 24h
- feed experimental đang để `inactive`:
  - VnExpress
  - CafeF

Lý do để `inactive` cho VnExpress/CafeF:
- VnExpress trả HTTP 406 từ môi trường test hiện tại
- CafeF redirect sang anti-bot/sorry page

Nên hiện tại chúng được giữ trong seed file để dễ bật sau, nhưng không crawl mặc định.

## Triển khai nhanh
### 1. Tạo S3 artifact bucket
```bash
aws s3 mb s3://<artifact-bucket-name> --region <region>
```

### 2. Deploy stack
```bash
bash scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
```

Ví dụ:
```bash
bash scripts/aws/package_and_deploy.sh goalwealth-artifacts-osla-apne1 goalwealth-dev-apne1 ap-northeast-1 dev
```

### 3. Seed RSS feeds
```bash
bash scripts/aws/seed_feed_registry.sh <stack-name> <region>
```

Ví dụ:
```bash
bash scripts/aws/seed_feed_registry.sh goalwealth-dev-apne1 ap-northeast-1
```

### 4. Chạy warm sync
```bash
bash scripts/aws/run_warm_sync.sh <stack-name> <region>
```

### 5. Test Smart Agent
```bash
bash scripts/aws/test_smart_agent.sh <stack-name> <region> "tin AI mới nhất hôm nay"
```

## Cập nhật stack
Mỗi khi đổi một trong các thứ sau, hãy redeploy stack:
- `infra/template.yaml`
- code trong `src/`
- dependencies trong `src/requirements.txt`

Lệnh:
```bash
bash scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
```

## Cập nhật RSS feeds
RSS sources ban đầu nằm ở:
- `infra/sample-feeds.json`

Sau khi sửa file này, chạy lại seed script với mode phù hợp:

```bash
bash scripts/aws/seed_feed_registry.sh <stack-name> <region>
```

hoặc:

```bash
bash scripts/aws/seed_feed_registry.sh <stack-name> <region> sync-inactive
```

hoặc:

```bash
bash scripts/aws/seed_feed_registry.sh <stack-name> <region> sync-delete
```

Mode hiện có:
- `upsert` (mặc định): thêm/cập nhật feed từ JSON, không đụng feed cũ ngoài JSON
- `sync-inactive`: thêm/cập nhật feed từ JSON, feed cũ ngoài JSON sẽ bị set `status = inactive`
- `sync-delete`: thêm/cập nhật feed từ JSON, feed cũ ngoài JSON sẽ bị xóa khỏi DynamoDB

Khuyến nghị:
- dùng `sync-inactive` cho vận hành hằng ngày
- chỉ dùng `sync-delete` khi thật sự muốn cleanup mạnh tay

## Dự án dùng uv nhưng deploy có thể tự chọn uv hoặc pip
Deploy script hiện sẽ:
1. nếu máy có `uv` → thử `uv pip install ...`
2. nếu `uv` không có hoặc fail → fallback sang `python3 -m pip install ...`

Tuy nhiên input dependency vẫn đang lấy từ:
- `src/requirements.txt`

Nói ngắn gọn:
- local/dev có thể dùng `uv`
- deploy script hiện auto-detect `uv` vs `pip`
- nhưng dependency source of truth cho Lambda package vẫn là `src/requirements.txt`

## Tài liệu chi tiết
Xem runbook đầy đủ tại:
- `aws-guide/trien-khai-va-cap-nhat-goalwealth.md`
- `aws-guide/awscli-runbook-goalwealth.md`
