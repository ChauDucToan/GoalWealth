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

Sau khi sửa file này, chạy lại:
```bash
bash scripts/aws/seed_feed_registry.sh <stack-name> <region>
```

Lưu ý:
- script seed hiện tại là **upsert theo `feed_id`**
- thêm feed mới: OK
- sửa feed cũ: OK
- xóa feed khỏi JSON: **không tự xóa khỏi DynamoDB**

Nếu muốn dừng một feed cũ, cách an toàn là cập nhật item trong DynamoDB thành:
- `status = inactive`

## Dự án dùng uv nhưng deploy đang package từ requirements.txt
Hiện tại Lambda packaging script build từ:
- `src/requirements.txt`

Nếu anh/em quản lý local env bằng `uv`, hãy đảm bảo dependency thực tế được phản ánh vào `src/requirements.txt` trước khi deploy.

Nói ngắn gọn:
- local/dev có thể dùng `uv`
- deploy script hiện tại vẫn lấy dependency từ `src/requirements.txt`

## Tài liệu chi tiết
Xem runbook đầy đủ tại:
- `aws-guide/trien-khai-va-cap-nhat-goalwealth.md`
- `aws-guide/awscli-runbook-goalwealth.md`
