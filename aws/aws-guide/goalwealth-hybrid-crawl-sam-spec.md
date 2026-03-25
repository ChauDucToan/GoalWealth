# GoalWealth Hybrid Crawl - SAM/CloudFormation Design Spec

## 1. Scope

This spec covers only the serverless/backend pieces for the GoalWealth hybrid crawl architecture:
- RSS feed ingestion
- Feed state tracking
- OpenSearch indexing and retrieval
- Smart Agent routing layer
- EventBridge Scheduler warm sync
- Optional public HTTP API entry point

Out of scope for this spec:
- EC2 hosting OpenClaw
- container hosting of OpenClaw
- frontend/UI
- CI/CD pipelines
- VPC network hardening details beyond placeholders

---

## 2. Target Architecture

### Core idea
Use a hybrid crawl strategy:
- Light scheduled warm sync keeps the index warm
- On-demand refresh runs only when a query requires fresher data
- Smart Agent does not directly reply to users; it returns structured JSON only
- OpenClaw main (out of scope here) reads the JSON and renders the user-facing answer

### High-level components
1. FeedRegistryTable (DynamoDB)
2. NewsSearchCollection (Amazon OpenSearch Serverless)
3. RssCrawlerFunction (Lambda)
4. SmartAgentFunction (Lambda)
5. WarmSyncSchedule (EventBridge Scheduler via SAM ScheduleV2)
6. Optional QueryHttpApi (SAM HttpApi)
7. Supporting IAM roles/policies
8. Optional DLQ queue(s)
9. Optional Secrets Manager secrets for external providers

---

## 3. Why SAM here

SAM is a good fit because:
- Lambda-heavy architecture
- Scheduler support via `ScheduleV2`
- Easy optional HTTP API via `AWS::Serverless::HttpApi`
- Easier packaging for Python functions than raw CloudFormation

Recommended pattern:
- Use `Transform: AWS::Serverless-2016-10-31`
- Keep OpenSearch Serverless as native CloudFormation resources (`AWS::OpenSearchServerless::Collection`, `AWS::OpenSearchServerless::SecurityPolicy`, `AWS::OpenSearchServerless::AccessPolicy`)
- Use SAM only where it helps most: functions, APIs, scheduler wiring

---

## 4. Template layout

Suggested files:

```text
infra/
  template.yaml
  parameters/
    dev.toml
    prod.toml
src/
  rss_crawler/
    app.py
    requirements.txt
  smart_agent/
    app.py
    requirements.txt
  shared/
    normalization.py
    dedupe.py
    feeds.py
    opensearch_client.py
```

---

## 5. Parameters

Recommended template parameters:

- ProjectName
- EnvironmentName
- FeedRegistryTableName
- OpenSearchCollectionName
- OpenSearchCollectionType
- WarmSyncScheduleExpression
- FeedFetchTimeoutSeconds
- MaxArticlesPerFeed
- EmbeddingProviderMode
  - `bedrock`
  - `external`
- BedrockEmbeddingModelId
  - default: `amazon.titan-embed-text-v2:0`
- SmartAgentModelMode
  - `bedrock`
  - `external`
- ExternalProviderSecretArn
- QueryApiEnabled
- PublicApiAuthMode
  - `none`
  - `oidc_jwt`
  - `iam`
- OidcIssuerUrl
- OidcAudience
- OidcRequiredScopes

Optional parameters:
- AllowedOrigins
- LogRetentionDays
- MobileAuthFlowNote
  - recommended value: `authorization_code_pkce`

---

## 6. Global SAM config

Recommended SAM globals:

```yaml
Globals:
  Function:
    Runtime: python3.12
    Timeout: 30
    MemorySize: 512
    Tracing: Active
    Architectures:
      - arm64
    Environment:
      Variables:
        PROJECT_NAME: !Ref ProjectName
        ENVIRONMENT_NAME: !Ref EnvironmentName
```

Notes:
- `arm64` is cheaper and usually fine for Python Lambda
- enable tracing for debugging crawl failures and routing latency
- use structured JSON logs in application code

---

## 7. Resources

### 7.1 FeedRegistryTable

Resource type:
- `AWS::DynamoDB::Table`

Purpose:
- store per-feed crawl state
- support conditional fetch headers and operational health

Recommended schema:

Partition key:
- `feed_id` (string)

Attributes:
- `feed_id`
- `feed_url`
- `source_name`
- `category`
- `etag`
- `last_modified`
- `last_fetch_at`
- `last_success_at`
- `fetch_interval_minutes`
- `status`
- `priority`
- `error_count`
- `last_error`

Optional GSI:
- GSI1PK = `status`
- GSI1SK = `priority`

Use cases:
- get all active feeds
- prioritize important feeds for on-demand refresh

Recommended settings:
- `BillingMode: PAY_PER_REQUEST`
- `PointInTimeRecoverySpecification: enabled`
- `SSESpecification: enabled`

---

### 7.2 NewsSearchCollection

Resource types:
- `AWS::OpenSearchServerless::Collection`
- `AWS::OpenSearchServerless::SecurityPolicy`
- `AWS::OpenSearchServerless::AccessPolicy`

Chosen direction:
- prefer OpenSearch Serverless over a provisioned domain to reduce operational overhead
- use a vector search collection for semantic retrieval and hybrid search

Purpose:
- store normalized article documents
- support keyword search, filtering, vector search, and hybrid search

Recommended collection settings:
- `Type: VECTORSEARCH`
- encryption policy present before collection creation
- network policy explicitly defined
- data access policy scoped to crawler, smart agent, and optional adapter principals

Suggested index:
- `news_articles`

Suggested fields:
- `article_id` keyword
- `canonical_url` keyword
- `title` text
- `summary` text
- `content` text
- `source` keyword
- `category` keyword
- `published_at` date
- `crawled_at` date
- `content_hash` keyword
- `tags` keyword[]
- `embedding` knn_vector

Important design note:
- keep `article_id` as an explicit field for application-level dedupe
- if the chosen Serverless collection/API path supports explicit document IDs for your ingest flow, map `_id = article_id`
- if explicit `_id`/upsert semantics are constrained for the chosen vector collection path, enforce dedupe in the crawler before indexing and treat `article_id` as the stable business key

---

### 7.3 RssCrawlerFunction

Resource type:
- `AWS::Serverless::Function`

Purpose:
- perform warm sync and targeted refresh
- fetch feeds with conditional request headers
- parse and normalize RSS items
- dedupe and upsert into OpenSearch

Modes:
- `warm_sync`
- `targeted_refresh`

Input contract:

```json
{
  "mode": "warm_sync | targeted_refresh",
  "feed_ids": ["optional", "list"],
  "query": "optional original user query",
  "max_feeds": 10,
  "max_articles_per_feed": 20
}
```

Environment variables:
- `FEED_REGISTRY_TABLE`
- `OPENSEARCH_COLLECTION_ENDPOINT`
- `OPENSEARCH_INDEX`
- `EMBEDDING_PROVIDER_MODE`
- `BEDROCK_EMBEDDING_MODEL_ID` (chosen default: `amazon.titan-embed-text-v2:0`)
- `EXTERNAL_PROVIDER_SECRET_ARN`
- `FETCH_TIMEOUT_SECONDS`
- `MAX_ARTICLES_PER_FEED`

IAM / access requirements:
- DynamoDB read/write on FeedRegistryTable
- OpenSearch Serverless data access policy for index/document write and read operations
- IAM permission such as `aoss:APIAccessAll` as required by the chosen access pattern
- Secrets Manager read if external provider used
- Bedrock invoke if Bedrock used
- CloudWatch Logs basic execution

Recommended event source:
- warm sync from `ScheduleV2`
- async invoke by SmartAgentFunction for on-demand refresh

---

### 7.4 SmartAgentFunction

Resource type:
- `AWS::Serverless::Function`

Purpose:
- classify query intent
- decide whether to query existing index or request targeted refresh
- perform OpenSearch retrieval and reranking
- trigger crawler asynchronously when freshness-sensitive queries need refresh
- return structured JSON only

Important boundary:
- no user-facing messaging capability
- no direct channel/plugin permissions
- no side-effecting tools outside retrieval/refresh scope

Supported routes:
- `semantic_search`
- `fresh_news`
- `hybrid_search`

Environment variables:
- `OPENSEARCH_COLLECTION_ENDPOINT`
- `OPENSEARCH_INDEX`
- `SMART_AGENT_MODEL_MODE`
- `BEDROCK_AGENT_MODEL_ID`
- `EXTERNAL_PROVIDER_SECRET_ARN`
- `CRAWLER_FUNCTION_NAME`
- `RECENCY_THRESHOLD_MINUTES` (chosen value: 180)
- `DEFAULT_RESULT_LIMIT`

IAM / access requirements:
- async invoke `RssCrawlerFunction`
- query OpenSearch Serverless
- read secrets if external LLM provider used
- invoke Bedrock if Bedrock used
- CloudWatch Logs basic execution

Output contract:

```json
{
  "status": "ok | partial | error",
  "route": "semantic_search | fresh_news | hybrid_search",
  "results": [
    {
      "id": "article_xxx",
      "type": "article",
      "title": "...",
      "url": "...",
      "source": "...",
      "published_at": "2026-03-25T07:10:00Z",
      "summary": "...",
      "score": 0.91,
      "freshness_score": 0.88
    }
  ],
  "summary": {
    "text": "...",
    "highlights": ["..."]
  },
  "meta": {
    "query": "...",
    "total_results": 3,
    "freshness": "fresh | cached | mixed | unknown",
    "took_ms": 842,
    "trace_id": "trace-abc-123"
  },
  "error": null
}
```

Validation rule:
- orchestrator or adapter must reject responses outside this schema

---

### 7.5 WarmSyncSchedule

Preferred implementation:
- SAM `ScheduleV2` event on `RssCrawlerFunction`

Purpose:
- lightweight periodic warm sync only
- not a full expensive recrawl every run

Recommended schedule examples:
- dev: `rate(30 minutes)`
- prod: `rate(15 minutes)` or tuned per load

Warm sync behavior:
- fetch only active feeds
- send conditional headers
- stop early on `304 Not Modified`
- only re-embed/reindex when content truly changed

Recommended config:
- include DLQ
- include retry policy
- possibly disable flexible time window if strict cadence matters

---

### 7.6 Optional QueryHttpApi

Resource types:
- `AWS::Serverless::HttpApi`
- `AWS::Serverless::Function` integration event on SmartAgentFunction or thin adapter function

Use only if you want a public API later.

Since current scope excludes OpenClaw hosting, treat this as optional and disabled by default.

Recommended:
- make it conditional on `QueryApiEnabled`
- require auth in real deployments
- prefer OAuth/OIDC for Android/mobile login, typically Authorization Code + PKCE
- let the identity provider issue access tokens, and let API Gateway validate those tokens with an OIDC/JWT authorizer
- avoid exposing raw Smart Agent internals directly unless schema is stable
- if the public API is added, prefer a thin adapter function in front of Smart Agent rather than exposing Smart Agent directly

---

### 7.7 Optional queues / resilience resources

Recommended optional resources:
- Scheduler DLQ (SQS)
- Lambda DLQ or failure destination
- Log groups with retention

Useful if:
- feed providers are unstable
- you want auditability for failed refreshes

---

## 8. Dedupe strategy

This is the heart of the design.

### 8.1 Feed-level dedupe
Store and reuse:
- `etag`
- `last_modified`

Send on next request:
- `If-None-Match`
- `If-Modified-Since`

If response is `304 Not Modified`:
- update only operational metadata (`last_fetch_at`)
- skip parsing
- skip embedding
- skip indexing

### 8.2 Item-level dedupe
Compute deterministic `article_id` using this priority:
1. normalized GUID if trustworthy
2. canonicalized URL
3. hash of title + source + published_at

### 8.3 Index-level dedupe
Preferred behavior:
- store `article_id` in every document
- when the chosen collection/API mode supports explicit IDs, map document `_id` to `article_id`
- when Serverless vector collection write semantics limit custom IDs/upserts, enforce dedupe in crawler/application logic before indexing

Effect:
- repeated crawl should converge on one logical article record
- duplicate detection must not depend solely on server-side upsert semantics

### 8.4 Content-level change detection
Store:
- `content_hash`

Behavior:
- if same `article_id` and same `content_hash` => skip
- if same `article_id` but new `content_hash` => update and re-embed

### 8.5 Query-level dedupe
When merging multiple search branches:
- unique by `article_id`
- fallback to `canonical_url`

---

## 9. Retrieval strategy

### semantic_search
- vector search or hybrid search on OpenSearch
- no forced refresh

### fresh_news
- query recent index first
- if freshness below threshold, trigger async `targeted_refresh`
- return current best result set immediately, while allowing refreshed data to land shortly after

### hybrid_search
- mix semantic relevance and recency
- may trigger targeted refresh for selected feeds/categories

Suggested freshness rule:
- if newest strong hit is older than 180 minutes (3 hours) for a freshness-sensitive query, trigger refresh

---

## 10. Security boundaries

Important design principle:
Do not rely only on Smart Agent prompt instructions.

Enforce safety at four layers:

1. System prompt
- instruct route-only behavior
- instruct JSON-only output

2. IAM permissions
- Smart Agent must not have channel send permissions
- Smart Agent only gets OpenSearch Serverless read + async crawler invoke + optional model invoke

3. Output validation
- adapter/orchestrator validates JSON schema strictly
- reject malformed output

4. Service boundary
- OpenClaw main is the only component that renders user-facing content

5. Public API auth boundary
- for Android/mobile clients, prefer OAuth/OIDC rather than a JWT-first mental model
- practical implementation can still use API Gateway HTTP API JWT authorizers, because the OIDC/OAuth provider commonly issues JWT access tokens
- recommended mobile flow: Authorization Code + PKCE using external browser/custom tabs, not embedded WebView

---

## 11. Suggested SAM resource map

```text
Parameters
  ├─ ProjectName
  ├─ EnvironmentName
  ├─ WarmSyncScheduleExpression
  ├─ OpenSearchCollectionName
  ├─ OpenSearchCollectionType
  ├─ EmbeddingProviderMode
  ├─ SmartAgentModelMode
  ├─ ExternalProviderSecretArn
  ├─ QueryApiEnabled
  ├─ PublicApiAuthMode
  ├─ OidcIssuerUrl
  ├─ OidcAudience
  └─ OidcRequiredScopes

Resources
  ├─ FeedRegistryTable                         (DynamoDB)
  ├─ NewsSearchEncryptionPolicy               (OpenSearch Serverless)
  ├─ NewsSearchNetworkPolicy                  (OpenSearch Serverless)
  ├─ NewsSearchAccessPolicy                   (OpenSearch Serverless)
  ├─ NewsSearchCollection                     (OpenSearch Serverless)
  ├─ RssCrawlerFunction                        (SAM Function)
  │   └─ WarmSyncEvent                         (ScheduleV2)
  ├─ SmartAgentFunction                        (SAM Function)
  ├─ SchedulerDlq                              (optional SQS)
  ├─ QueryHttpApi                              (optional SAM HttpApi)
  ├─ CrawlerLogGroup                           (optional)
  ├─ SmartAgentLogGroup                        (optional)
  └─ Secrets / IAM roles / policies

Outputs
  ├─ FeedRegistryTableName
  ├─ OpenSearchCollectionEndpoint
  ├─ RssCrawlerFunctionName
  ├─ SmartAgentFunctionName
  └─ QueryApiUrl (optional)
```

---

## 12. Skeleton SAM template

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: GoalWealth hybrid crawl architecture

Parameters:
  ProjectName:
    Type: String
    Default: goalwealth
  EnvironmentName:
    Type: String
    Default: dev
  FeedRegistryTableName:
    Type: String
    Default: goalwealth-feed-registry
  OpenSearchCollectionName:
    Type: String
    Default: goalwealth-news-search
  OpenSearchCollectionType:
    Type: String
    Default: VECTORSEARCH
    AllowedValues: [VECTORSEARCH, SEARCH]
  WarmSyncScheduleExpression:
    Type: String
    Default: rate(30 minutes)
  EmbeddingProviderMode:
    Type: String
    Default: bedrock
    AllowedValues: [bedrock, external]
  BedrockEmbeddingModelId:
    Type: String
    Default: amazon.titan-embed-text-v2:0
  SmartAgentModelMode:
    Type: String
    Default: bedrock
    AllowedValues: [bedrock, external]
  ExternalProviderSecretArn:
    Type: String
    Default: ''
  QueryApiEnabled:
    Type: String
    Default: 'false'
    AllowedValues: ['true', 'false']
  PublicApiAuthMode:
    Type: String
    Default: oidc_jwt
    AllowedValues: [none, oidc_jwt, iam]
  OidcIssuerUrl:
    Type: String
    Default: https://accounts.google.com
  OidcAudience:
    Type: String
    Default: ''
  OidcRequiredScopes:
    Type: CommaDelimitedList
    Default: goalwealth.read

Conditions:
  EnableQueryApi: !Equals [!Ref QueryApiEnabled, 'true']

Globals:
  Function:
    Runtime: python3.12
    Timeout: 30
    MemorySize: 512
    Tracing: Active
    Architectures: [arm64]

Resources:
  FeedRegistryTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Ref FeedRegistryTableName
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: feed_id
          AttributeType: S
      KeySchema:
        - AttributeName: feed_id
          KeyType: HASH

  NewsSearchEncryptionPolicy:
    Type: AWS::OpenSearchServerless::SecurityPolicy
    Properties:
      Name: !Sub ${ProjectName}-${EnvironmentName}-enc
      Type: encryption
      Policy: >-
        {"Rules":[{"ResourceType":"collection","Resource":["collection/${OpenSearchCollectionName}"]}],"AWSOwnedKey":true}

  NewsSearchNetworkPolicy:
    Type: AWS::OpenSearchServerless::SecurityPolicy
    Properties:
      Name: !Sub ${ProjectName}-${EnvironmentName}-net
      Type: network
      Policy: >-
        [{"Rules":[{"ResourceType":"collection","Resource":["collection/${OpenSearchCollectionName}"]},{"ResourceType":"dashboard","Resource":["collection/${OpenSearchCollectionName}"]}],"AllowFromPublic":true}]

  NewsSearchCollection:
    Type: AWS::OpenSearchServerless::Collection
    DependsOn:
      - NewsSearchEncryptionPolicy
    Properties:
      Name: !Ref OpenSearchCollectionName
      Type: !Ref OpenSearchCollectionType

  RssCrawlerFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ../src/rss_crawler/
      Handler: app.lambda_handler
      Timeout: 300
      MemorySize: 1024
      Environment:
        Variables:
          FEED_REGISTRY_TABLE: !Ref FeedRegistryTable
          OPENSEARCH_COLLECTION_ENDPOINT: !GetAtt NewsSearchCollection.CollectionEndpoint
          OPENSEARCH_INDEX: news_articles
          EMBEDDING_PROVIDER_MODE: !Ref EmbeddingProviderMode
          BEDROCK_EMBEDDING_MODEL_ID: !Ref BedrockEmbeddingModelId
          EXTERNAL_PROVIDER_SECRET_ARN: !Ref ExternalProviderSecretArn
      Events:
        WarmSyncEvent:
          Type: ScheduleV2
          Properties:
            ScheduleExpression: !Ref WarmSyncScheduleExpression
            Input: '{"mode":"warm_sync"}'

  SmartAgentFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ../src/smart_agent/
      Handler: app.lambda_handler
      Timeout: 60
      MemorySize: 1024
      Environment:
        Variables:
          OPENSEARCH_COLLECTION_ENDPOINT: !GetAtt NewsSearchCollection.CollectionEndpoint
          OPENSEARCH_INDEX: news_articles
          SMART_AGENT_MODEL_MODE: !Ref SmartAgentModelMode
          CRAWLER_FUNCTION_NAME: !Ref RssCrawlerFunction
          RECENCY_THRESHOLD_MINUTES: 180

  NewsSearchAccessPolicy:
    Type: AWS::OpenSearchServerless::AccessPolicy
    Properties:
      Name: !Sub ${ProjectName}-${EnvironmentName}-data
      Type: data
      Policy: !Sub >-
        [{"Rules":[{"ResourceType":"index","Resource":["index/${OpenSearchCollectionName}/*"],"Permission":["aoss:CreateIndex","aoss:DescribeIndex","aoss:ReadDocument","aoss:WriteDocument"]},{"ResourceType":"collection","Resource":["collection/${OpenSearchCollectionName}"],"Permission":["aoss:DescribeCollectionItems"]}],"Principal":["${RssCrawlerFunctionRole.Arn}","${SmartAgentFunctionRole.Arn}"]}]

  QueryHttpApi:
    Type: AWS::Serverless::HttpApi
    Condition: EnableQueryApi
    Properties:
      StageName: $default

Outputs:
  FeedRegistryTableName:
    Value: !Ref FeedRegistryTable
  OpenSearchCollectionEndpoint:
    Value: !GetAtt NewsSearchCollection.CollectionEndpoint
  RssCrawlerFunctionName:
    Value: !Ref RssCrawlerFunction
  SmartAgentFunctionName:
    Value: !Ref SmartAgentFunction
```

Notes about skeleton:
- It is intentionally incomplete for production and should be treated as a design skeleton, not a ready-to-deploy template.
- For OpenSearch Serverless, remember that data access policies and IAM both matter.
- If the chosen vector collection write path constrains custom `_id`/upsert semantics, keep application-level dedupe authoritative.
- For Android/mobile-facing public API design, prefer OAuth/OIDC login with Authorization Code + PKCE, and let API Gateway validate OIDC-issued JWT access tokens.
- The public API is optional and left detached from function routes until schema is finalized.

---

## 13. Recommended implementation order

Phase 1:
- FeedRegistryTable
- NewsSearchCollection (OpenSearch Serverless)
- RssCrawlerFunction warm sync only
- deterministic article IDs
- conservative canonical URL normalization
- content hash dedupe

Phase 2:
- SmartAgentFunction semantic search only
- Amazon Titan Text Embeddings V2 integration
- JSON schema validation

Phase 3:
- async on-demand targeted refresh
- hybrid retrieval
- optional public HTTP API through a thin adapter

Phase 4:
- auth (prefer OAuth/OIDC + PKCE for mobile/public API), DLQ, alarms, VPC hardening, cost tuning

---

## 14. Decisions currently locked for the next draft

These choices are currently preferred for implementation unless later testing proves otherwise:
1. OpenSearch Serverless instead of a provisioned OpenSearch domain
2. Amazon Titan Text Embeddings V2 (`amazon.titan-embed-text-v2:0`) as the embedding model
3. Smart Agent triggers crawler asynchronously for freshness-sensitive paths, so semantic search can return faster
4. Freshness threshold: about 3 hours (`RECENCY_THRESHOLD_MINUTES = 180`)
5. Deterministic article ID rule: trustworthy GUID -> canonical URL -> hash(source + normalized title + published_at)
6. Canonical URL normalization should be conservative: remove tracking params/fragments, normalize host/trailing slash, but keep meaningful query params such as article IDs
7. Future public API should use a thin adapter in front of Smart Agent, not expose Smart Agent directly
8. Initial OIDC provider target: Google

Items still worth validating during implementation:
- whether the chosen OpenSearch Serverless collection/write path supports the exact document-ID behavior you want
- whether Titan V2 should use 1024 or 512 dimensions for the first cost/quality tradeoff
- whether the eventual public API should use API Gateway native JWT authorizer directly against Google-issued tokens, or sit behind a brokered identity layer

---

## 15. Reference docs

- AWS SAM ScheduleV2:
  https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-property-function-schedulev2.html
- AWS::OpenSearchServerless::Collection:
  https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-opensearchserverless-collection.html
- AWS::OpenSearchServerless::AccessPolicy:
  https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-opensearchserverless-accesspolicy.html
- AWS::OpenSearchServerless::SecurityPolicy:
  https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-opensearchserverless-securitypolicy.html
- AWS SAM HttpApi:
  https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-httpapi.html
- AWS Lambda + EventBridge Scheduler:
  https://docs.aws.amazon.com/lambda/latest/dg/with-eventbridge-scheduler.html
- OpenSearch Serverless vector search collections:
  https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-vector-search.html
- OpenSearch Serverless overview:
  https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-overview.html
- OpenSearch Serverless data access:
  https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-data-access.html
- OpenSearch hybrid search:
  https://docs.opensearch.org/latest/vector-search/ai-search/hybrid-search/index/
- Amazon Titan Text Embeddings V2:
  https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html
- Google OpenID Connect:
  https://developers.google.com/identity/openid-connect/openid-connect
- OpenSearch index document API:
  https://docs.opensearch.org/latest/api-reference/document-apis/index-document/
- MDN ETag:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag
- MDN If-None-Match:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-None-Match
