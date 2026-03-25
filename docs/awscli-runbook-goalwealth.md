# GoalWealth AWS CLI Runbook

This runbook helps you package, deploy, seed, and test the current GoalWealth serverless stack using AWS CLI.

## Files
- Template: `infra/template.yaml`
- Sample feeds: `infra/sample-feeds.json`
- Deploy script: `scripts/aws/package_and_deploy.sh`
- Seed script: `scripts/aws/seed_feed_registry.sh`
- Warm sync test: `scripts/aws/run_warm_sync.sh`
- Smart agent test: `scripts/aws/test_smart_agent.sh`

## Where are the RSS feeds defined?
Right now, the initial RSS sources are defined in:
- `infra/sample-feeds.json`

They are not hardcoded inside the crawler itself.
The crawler reads feed definitions from DynamoDB `FeedRegistryTable`, and the seed script loads the sample JSON into that table.

Current sample feeds include:
- international sources
- verified Vietnam news sources (Tuổi Trẻ, Thanh Niên, Dân Trí, Vietnamnet, 24h)
- experimental/inactive entries for VnExpress and CafeF due to anti-bot/header restrictions seen in testing

Flow:
1. edit `infra/sample-feeds.json`
2. run `scripts/aws/seed_feed_registry.sh`
3. crawler reads from DynamoDB

## Prerequisites
- AWS CLI configured (`aws configure`)
- Python 3 available locally
- `python3 -m pip` available locally
- An S3 bucket for CloudFormation packaging artifacts
- Region chosen (example: `ap-northeast-1`)

## Important packaging note
The Lambda functions depend on Python packages such as:
- `feedparser`
- `requests`
- `opensearch-py`

So deploy is a 2-step packaging flow inside the script:
1. install dependencies into `.build/lambda-src`
2. copy project source into that folder
3. package and upload the built Lambda artifact to S3

If `uv` is installed locally, the deploy script will try:
- `uv pip install ...`

If that fails or `uv` is not installed, it falls back to:
- `python3 -m pip install ...`

Dependency source of truth for Lambda packaging is still:
- `src/requirements.txt`

If you change Python dependencies, redeploy with:

```bash
bash scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
```

## AWS CLI v1 vs v2 note
The invoke scripts use `fileb://payload.json` so they work with both:
- AWS CLI v1
- AWS CLI v2

You should not need `--cli-binary-format raw-in-base64-out` anymore for these scripts.

## 1. Package and deploy

```bash
bash scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]
```

Example:

```bash
bash scripts/aws/package_and_deploy.sh my-goalwealth-artifacts goalwealth-dev ap-northeast-1 dev
```

## 2. Seed sample feeds into DynamoDB

```bash
bash scripts/aws/seed_feed_registry.sh <stack-name> <region>
```

Example:

```bash
bash scripts/aws/seed_feed_registry.sh goalwealth-dev ap-northeast-1
```

## 3. Run a warm sync manually

```bash
bash scripts/aws/run_warm_sync.sh <stack-name> <region>
```

Example:

```bash
bash scripts/aws/run_warm_sync.sh goalwealth-dev ap-northeast-1
```

## 4. Test Smart Agent directly

```bash
bash scripts/aws/test_smart_agent.sh <stack-name> <region> "<query>"
```

Examples:

```bash
bash scripts/aws/test_smart_agent.sh goalwealth-dev ap-northeast-1 "tin AI mới nhất hôm nay"
bash scripts/aws/test_smart_agent.sh goalwealth-dev ap-northeast-1 "phân tích các bài về Nvidia và AI"
```

## Suggested first test order
1. Deploy the stack
2. Seed feeds
3. Run warm sync
4. Test smart agent with a fresh-news query
5. Test smart agent with a semantic-search query

## Important notes
- Current infra/template is still a development-oriented v2, not a hardened production template.
- OpenSearch Serverless access is still relatively broad for now.
- `OpenSearchAllowFromPublic` is currently left available for easier testing.
- Smart Agent refresh dedupe is currently in-memory best-effort only.
- If a collection/index is empty, the Smart Agent now tries to ensure the search index exists and can trigger async refresh as a bootstrap-safe fallback.
- VnExpress and CafeF are present in the seed file as experimental/inactive entries for later work, but are not recommended as default active sources yet.
