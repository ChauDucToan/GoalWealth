# Triển khai và cập nhật GoalWealth backend

Tài liệu này dành cho người mới vào project và muốn:
- deploy stack lên AWS
- seed RSS feeds
- chạy warm sync
- test Smart Agent
- update stack khi code đổi
- update danh sách RSS feeds
- biết xử lý một số lỗi thường gặp

---

## 1. Thành phần chính của hệ thống

### Hạ tầng
- `goalwealth/infra/sam/template.yaml` — CloudFormation/SAM template
- `goalwealth/infra/seeds/sample-feeds.json` — danh sách RSS seed ban đầu

### Code
- `goalwealth/src/lambdas/rss_crawler/handler.py` — RSS crawler Lambda
- `goalwealth/src/lambdas/smart_agent/handler.py` — Smart Agent Lambda
- `goalwealth/src/shared/*` — logic dùng chung
- `src/requirements.txt` — Python dependencies để đóng gói Lambda

### Script vận hành
- `goalwealth/scripts/aws/package_and_deploy.sh`
- `goalwealth/scripts/aws/seed_feed_registry.sh`
- `goalwealth/scripts/aws/run_warm_sync.sh`
- `goalwealth/scripts/aws/test_smart_agent.sh`

---

## 2. Luồng hoạt động ngắn gọn

1. RSS feeds được khai báo trong `goalwealth/infra/seeds/sample-feeds.json`
2. Seed script đẩy danh sách đó vào DynamoDB `FeedRegistryTable`
3. Warm sync hoặc targeted refresh gọi `RssCrawlerFunction`
4. Crawler fetch RSS, parse item, dedupe, embed, upsert vào OpenSearch Serverless
5. `SmartAgentFunction` query OpenSearch và có thể trigger refresh nền
6. `SmartAgentFunction` trả JSON sạch cho orchestrator

---

## 3. Prerequisites

Cần có:
- AWS CLI đã cấu hình (`aws configure`)
- Python 3
- `python3 -m pip`
- S3 bucket để chứa CloudFormation packaging artifacts
- AWS region phù hợp với model embedding đang dùng

Nếu máy có `uv`, deploy script sẽ tự thử dùng `uv` trước rồi fallback về `pip`.

---

## 4. Chọn region đúng

Embedding model hiện tại là:
- `amazon.titan-embed-text-v2:0`

Vì vậy cần kiểm tra region có hỗ trợ Titan embeddings cho account hiện tại hay không.

Ví dụ check ở Tokyo:

```bash
aws bedrock list-foundation-models --region ap-northeast-1 | grep titan
```

Nếu không thấy Titan trong region bạn định deploy, semantic search/crawler embedding sẽ fail với lỗi kiểu:
- `ValidationException: The provided model identifier is invalid`

Khuyến nghị:
- test trước bằng `aws bedrock list-foundation-models`
- chỉ deploy vào region thực sự liệt kê model cần dùng

---

## 5. Deploy lần đầu

### Bước 1: tạo S3 artifact bucket

```bash
aws s3 mb s3://<artifact-bucket-name> --region <region>
```

Ví dụ:

```bash
aws s3 mb s3://goalwealth-artifacts-osla-apne1 --region ap-northeast-1
```

### Bước 2: deploy stack

```bash
bash goalwealth/scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
```

Ví dụ:

```bash
bash goalwealth/scripts/aws/package_and_deploy.sh goalwealth-artifacts-osla-apne1 goalwealth-dev-apne1 ap-northeast-1 dev
```

Script này sẽ:
1. nếu có `uv` thì thử `uv pip install` vào `.build/lambda-src`
2. nếu `uv` không có hoặc fail thì fallback sang `python3 -m pip install`
3. copy source code vào `.build/lambda-src`
4. package Lambda artifact lên S3
5. deploy/update CloudFormation stack

### Bước 3: seed RSS feeds

```bash
bash goalwealth/scripts/aws/seed_feed_registry.sh goalwealth-dev-apne1 ap-northeast-1
```

### Bước 4: chạy warm sync

```bash
bash goalwealth/scripts/aws/run_warm_sync.sh goalwealth-dev-apne1 ap-northeast-1
```

### Bước 5: test Smart Agent

Ví dụ query fresh news:

```bash
bash goalwealth/scripts/aws/test_smart_agent.sh goalwealth-dev-apne1 ap-northeast-1 "tin AI mới nhất hôm nay"
```

Ví dụ query semantic:

```bash
bash goalwealth/scripts/aws/test_smart_agent.sh goalwealth-dev-apne1 ap-northeast-1 "AWS machine learning feed"
```

---

## 6. Update stack khi code đổi

### Khi nào cần redeploy stack?
Cần chạy lại `package_and_deploy.sh` khi đổi một trong các thứ sau:
- `goalwealth/infra/sam/template.yaml`
- bất kỳ file nào trong `src/`
- `src/requirements.txt`

### Lệnh update stack

```bash
bash goalwealth/scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
```

Ví dụ:

```bash
bash goalwealth/scripts/aws/package_and_deploy.sh goalwealth-artifacts-osla-apne1 goalwealth-dev-apne1 ap-northeast-1 dev
```

### Vì sao phải redeploy?
Vì Lambda trên AWS chỉ dùng artifact đã package/upload trước đó.
Sửa file local xong mà không redeploy thì Lambda trên AWS **không tự cập nhật**.

---

## 7. Update RSS feeds

### RSS feeds đang được định nghĩa ở đâu?
Ở đây:
- `goalwealth/infra/seeds/sample-feeds.json`

### Hiện đang có những nhóm feed nào?
#### Feed active đã verify được từ môi trường test
- Tuổi Trẻ
- Thanh Niên
- Dân Trí
- Vietnamnet
- 24h
- cùng với các feed quốc tế như TechCrunch/AWS/NVIDIA/The Verge/NYT

#### Feed experimental đang để inactive
- VnExpress
- CafeF

Lý do:
- VnExpress trả HTTP 406 trong môi trường test hiện tại
- CafeF redirect sang anti-bot/sorry page

Chúng vẫn nằm trong file seed để dễ bật sau khi có adapter phù hợp, nhưng không nên crawl mặc định lúc này.

### Muốn thêm feed mới
1. mở `goalwealth/infra/seeds/sample-feeds.json`
2. thêm item mới theo format:

```json
{
  "feed_id": "my-feed",
  "feed_url": "https://example.com/feed.xml",
  "source_name": "My Feed",
  "category": "ai",
  "status": "active",
  "priority": 80,
  "tags": ["ai", "news"],
  "keywords": ["ai", "machine learning"]
}
```

3. chạy lại seed script:

```bash
bash goalwealth/scripts/aws/seed_feed_registry.sh <stack-name> <region>
```

### Muốn sửa feed cũ
1. sửa đúng item có `feed_id` tương ứng trong `goalwealth/infra/seeds/sample-feeds.json`
2. chạy lại seed script

Vì seed hiện là upsert theo `feed_id`, feed cũ sẽ được cập nhật.

### Muốn dừng một feed
Cách tốt nhất hiện tại:
- set trong JSON:

```json
"status": "inactive"
```

rồi seed lại.

### Seed script mode mới
Seed script giờ hỗ trợ 3 mode:

#### 1. `upsert` (mặc định)
- thêm feed mới
- cập nhật feed đã có
- **không đụng** những feed đang có trong DynamoDB nhưng không còn trong JSON

```bash
bash goalwealth/scripts/aws/seed_feed_registry.sh <stack-name> <region>
```

hoặc:

```bash
bash goalwealth/scripts/aws/seed_feed_registry.sh <stack-name> <region> upsert
```

#### 2. `sync-inactive`
- thêm/cập nhật feed từ JSON
- những feed đang có trong DynamoDB nhưng **không còn trong JSON** sẽ bị set:
  - `status = inactive`

```bash
bash goalwealth/scripts/aws/seed_feed_registry.sh <stack-name> <region> sync-inactive
```

#### 3. `sync-delete`
- thêm/cập nhật feed từ JSON
- những feed đang có trong DynamoDB nhưng **không còn trong JSON** sẽ bị xóa khỏi table

```bash
bash goalwealth/scripts/aws/seed_feed_registry.sh <stack-name> <region> sync-delete
```

### Khuyến nghị vận hành
- dev/test nhẹ: dùng `upsert`
- muốn đồng bộ an toàn với lịch sử cũ: dùng `sync-inactive`
- chỉ dùng `sync-delete` khi thật sự muốn cleanup mạnh tay

---

## 8. Dự án dùng uv thì cần lưu ý gì?

Hiện project/local env có thể dùng `uv`, và deploy script đã tự thử:
- `uv pip install ...`
- nếu fail thì fallback sang `python3 -m pip install ...`

Tuy nhiên input dependency hiện tại vẫn lấy từ:
- `src/requirements.txt`

Điều đó có nghĩa là:
- local/dev workflow: có thể dùng `uv`
- deploy workflow: auto-detect `uv` hay `pip`
- nhưng dependency source of truth cho Lambda package vẫn là `src/requirements.txt`

### Quy tắc nên nhớ
Nếu dependency local đã đổi nhưng `src/requirements.txt` chưa đổi, thì Lambda artifact build ra có thể thiếu package.

Ví dụ lỗi kiểu:
- `No module named 'feedparser'`
- `No module named 'opensearchpy'`

thường là dấu hiệu package deploy chưa chứa dependency đúng.

---

## 9. Các lỗi thường gặp

### Lỗi 1: `Unknown options: --cli-binary-format`
Nguyên nhân:
- dùng AWS CLI v1 với script invoke cũ

Trạng thái hiện tại:
- đã sửa script invoke để dùng `fileb://payload.json`
- hỗ trợ tốt hơn cho cả AWS CLI v1/v2

### Lỗi 2: `No module named feedparser` / `No module named opensearchpy`
Nguyên nhân:
- Lambda artifact thiếu dependency
- thường xảy ra khi deploy package chưa vendor dependencies

Cách xử lý:
- chạy lại:

```bash
bash goalwealth/scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
```

### Lỗi 3: `The provided model identifier is invalid`
Nguyên nhân thường gặp:
- region không hỗ trợ model embedding đang cấu hình
- hoặc region/account hiện tại không liệt kê model đó trong Bedrock

Cách xử lý:
- check model trong region:

```bash
aws bedrock list-foundation-models --region <region> | grep titan
```

- nếu không thấy model cần dùng, đổi sang region phù hợp hoặc đổi model

### Lỗi 4: Warm sync chạy nhưng không crawl gì
Nguyên nhân thường gặp:
- Feed Registry table đang rỗng
- hoặc tất cả feed đang `inactive`

Cách xử lý:
- seed lại feeds:

```bash
bash goalwealth/scripts/aws/seed_feed_registry.sh <stack-name> <region>
```

### Lỗi 5: VnExpress/CafeF không crawl được
Nguyên nhân thường gặp:
- anti-bot / header restrictions từ phía publisher

Tình trạng hiện tại:
- VnExpress và CafeF đang được giữ ở trạng thái `inactive` trong sample seed
- chỉ nên bật sau khi có custom fetch strategy phù hợp

---

## 10. Checklist vận hành ngắn

### Sau khi sửa code
- [ ] cập nhật dependency nếu cần
- [ ] redeploy stack
- [ ] test warm sync
- [ ] test smart agent

### Sau khi sửa RSS feeds
- [ ] update `goalwealth/infra/seeds/sample-feeds.json`
- [ ] chọn mode seed phù hợp (`upsert` / `sync-inactive` / `sync-delete`)
- [ ] seed lại Feed Registry
- [ ] chạy warm sync
- [ ] kiểm tra logs hoặc test smart agent

---

## 11. Lệnh mẫu đầy đủ

```bash
aws s3 mb s3://goalwealth-artifacts-osla-apne1 --region ap-northeast-1

bash goalwealth/scripts/aws/package_and_deploy.sh goalwealth-artifacts-osla-apne1 goalwealth-dev-apne1 ap-northeast-1 dev

bash goalwealth/scripts/aws/seed_feed_registry.sh goalwealth-dev-apne1 ap-northeast-1 sync-inactive

bash goalwealth/scripts/aws/run_warm_sync.sh goalwealth-dev-apne1 ap-northeast-1

bash goalwealth/scripts/aws/test_smart_agent.sh goalwealth-dev-apne1 ap-northeast-1 "tin AI mới nhất hôm nay"
```
