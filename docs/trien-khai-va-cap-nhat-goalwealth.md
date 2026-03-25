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
- `infra/template.yaml` — CloudFormation/SAM template
- `infra/sample-feeds.json` — danh sách RSS seed ban đầu

### Code
- `src/rss_crawler/app.py` — RSS crawler Lambda
- `src/smart_agent/app.py` — Smart Agent Lambda
- `src/shared/*` — logic dùng chung
- `src/requirements.txt` — Python dependencies để đóng gói Lambda

### Script vận hành
- `scripts/aws/package_and_deploy.sh`
- `scripts/aws/seed_feed_registry.sh`
- `scripts/aws/run_warm_sync.sh`
- `scripts/aws/test_smart_agent.sh`

---

## 2. Luồng hoạt động ngắn gọn

1. RSS feeds được khai báo trong `infra/sample-feeds.json`
2. Seed script đẩy danh sách đó vào DynamoDB `FeedRegistryTable`
3. Warm sync hoặc targeted refresh gọi `RssCrawlerFunction`
4. Crawler fetch RSS, parse item, dedupe, embed, upsert vào OpenSearch Serverless
5. `SmartAgentFunction` query OpenSearch và có thể trigger refresh nền
6. Smart Agent trả JSON sạch cho orchestrator

---

## 3. Prerequisites

Cần có:
- AWS CLI đã cấu hình (`aws configure`)
- Python 3
- `python3 -m pip`
- S3 bucket để chứa CloudFormation packaging artifacts
- AWS region phù hợp với model embedding đang dùng

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
bash scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
```

Ví dụ:

```bash
bash scripts/aws/package_and_deploy.sh goalwealth-artifacts-osla-apne1 goalwealth-dev-apne1 ap-northeast-1 dev
```

Script này sẽ:
1. cài dependencies từ `src/requirements.txt` vào `.build/lambda-src`
2. copy source code vào `.build/lambda-src`
3. package Lambda artifact lên S3
4. deploy/update CloudFormation stack

### Bước 3: seed RSS feeds

```bash
bash scripts/aws/seed_feed_registry.sh goalwealth-dev-apne1 ap-northeast-1
```

### Bước 4: chạy warm sync

```bash
bash scripts/aws/run_warm_sync.sh goalwealth-dev-apne1 ap-northeast-1
```

### Bước 5: test Smart Agent

Ví dụ query fresh news:

```bash
bash scripts/aws/test_smart_agent.sh goalwealth-dev-apne1 ap-northeast-1 "tin AI mới nhất hôm nay"
```

Ví dụ query semantic:

```bash
bash scripts/aws/test_smart_agent.sh goalwealth-dev-apne1 ap-northeast-1 "AWS machine learning feed"
```

---

## 6. Update stack khi code đổi

### Khi nào cần redeploy stack?
Cần chạy lại `package_and_deploy.sh` khi đổi một trong các thứ sau:
- `infra/template.yaml`
- bất kỳ file nào trong `src/`
- `src/requirements.txt`

### Lệnh update stack

```bash
bash scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
```

Ví dụ:

```bash
bash scripts/aws/package_and_deploy.sh goalwealth-artifacts-osla-apne1 goalwealth-dev-apne1 ap-northeast-1 dev
```

### Vì sao phải redeploy?
Vì Lambda trên AWS chỉ dùng artifact đã package/upload trước đó.
Sửa file local xong mà không redeploy thì Lambda trên AWS **không tự cập nhật**.

---

## 7. Update RSS feeds

### RSS feeds đang được định nghĩa ở đâu?
Ở đây:
- `infra/sample-feeds.json`

### Muốn thêm feed mới
1. mở `infra/sample-feeds.json`
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
bash scripts/aws/seed_feed_registry.sh <stack-name> <region>
```

### Muốn sửa feed cũ
1. sửa đúng item có `feed_id` tương ứng trong `infra/sample-feeds.json`
2. chạy lại seed script

Vì seed hiện là upsert theo `feed_id`, feed cũ sẽ được cập nhật.

### Muốn dừng một feed
Có 2 cách:

#### Cách an toàn nhất
Đổi feed đó trong `infra/sample-feeds.json` thành:

```json
"status": "inactive"
```

rồi seed lại.

#### Cách thủ công trên DynamoDB
Vào AWS Console hoặc CLI và update item trực tiếp:
- `status = inactive`

### Muốn xóa hoàn toàn một feed
Hiện tại seed script **không tự delete** những feed bị xóa khỏi `infra/sample-feeds.json`.

Nghĩa là:
- xóa khỏi file JSON thôi là chưa đủ
- item cũ vẫn còn trong DynamoDB nếu chưa bị xóa/disable

Khuyến nghị hiện tại:
- ưu tiên set `status = inactive`
- chỉ delete hẳn nếu thực sự muốn cleanup

---

## 8. Dự án dùng uv thì cần lưu ý gì?

Hiện project/local env có thể dùng `uv`, nhưng Lambda packaging script hiện đang build từ:
- `src/requirements.txt`

Điều đó có nghĩa là:
- local/dev workflow: có thể dùng `uv`
- deploy workflow: vẫn phụ thuộc vào `src/requirements.txt`

### Quy tắc nên nhớ
Nếu dependency local đã đổi nhưng `src/requirements.txt` chưa đổi, thì Lambda artifact build ra có thể thiếu package.

Ví dụ lỗi kiểu:
- `No module named 'feedparser'`
- `No module named 'opensearchpy'`

thường là dấu hiệu package deploy chưa chứa dependency đúng.

### Khuyến nghị
Giữ `src/requirements.txt` phản ánh đúng dependency dùng thật trong code trước khi redeploy.

---

## 9. Các lỗi thường gặp

### Lỗi 1: `Unknown options: --cli-binary-format`
Nguyên nhân:
- dùng AWS CLI v1 với script cũ

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
bash scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
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
bash scripts/aws/seed_feed_registry.sh <stack-name> <region>
```

---

## 10. Checklist vận hành ngắn

### Sau khi sửa code
- [ ] cập nhật dependency nếu cần
- [ ] redeploy stack
- [ ] test warm sync
- [ ] test smart agent

### Sau khi sửa RSS feeds
- [ ] update `infra/sample-feeds.json`
- [ ] seed lại Feed Registry
- [ ] chạy warm sync
- [ ] kiểm tra logs hoặc test smart agent

---

## 11. Lệnh mẫu đầy đủ

```bash
aws s3 mb s3://goalwealth-artifacts-osla-apne1 --region ap-northeast-1

bash scripts/aws/package_and_deploy.sh goalwealth-artifacts-osla-apne1 goalwealth-dev-apne1 ap-northeast-1 dev

bash scripts/aws/seed_feed_registry.sh goalwealth-dev-apne1 ap-northeast-1

bash scripts/aws/run_warm_sync.sh goalwealth-dev-apne1 ap-northeast-1

bash scripts/aws/test_smart_agent.sh goalwealth-dev-apne1 ap-northeast-1 "tin AI mới nhất hôm nay"
```
