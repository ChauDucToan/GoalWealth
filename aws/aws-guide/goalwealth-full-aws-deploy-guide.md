# GoalWealth Full AWS Deployment Guide

This guide describes the most practical **AWS-only** deployment shape for the current GoalWealth architecture.

## Target outcome
Run the whole current GoalWealth stack on AWS with the fewest moving parts:
- AWS-hosted Smart Agent / RSS crawl/search infrastructure
- AWS-hosted OpenClaw runtime
- AWS-hosted adapter API
- AWS-hosted internal backend stub

This is the recommended current deployment mode because it matches the codebase and avoids unnecessary platform churn.

---

# 1. Recommended AWS topology right now

## Keep it simple

### Deploy these on one ARM EC2 instance
- OpenClaw runtime
- GoalWealth adapter API
- GoalWealth internal backend stub

### Deploy these via AWS infrastructure stack
- DynamoDB feed registry
- OpenSearch Serverless collection
- RSS crawler Lambda
- Smart Agent Lambda
- EventBridge Scheduler for warm sync

## Why this shape is best right now
- OpenClaw already fits naturally on EC2
- adapter + internal stub are small Python HTTP services and easiest to run on the same box
- Smart Agent crawl/search infra is already modeled in `goalwealth/infra/sam/template.yaml`
- this gives a realistic AWS-only deployment without prematurely splitting every service

---

# 2. Final runtime picture

```text
User / Frontend
   |
   | HTTPS
   v
Public EC2 or ALB
   |
   +--> GoalWealth Adapter API (:8080)
            |
            +--> OpenClaw local/nearby runtime
            |
            +--> Internal backend stub (:8090)
                       |
                       +--> structured memory view
                       +--> OCR openclaw view
                       +--> Smart Agent stub

AWS SAM stack
   +--> RSS crawler Lambda
   +--> Smart Agent Lambda
   +--> DynamoDB FeedRegistry
   +--> OpenSearch Serverless
   +--> EventBridge warm sync
```

---

# 3. Current deployment phases

Use these phases in order.

## Phase A
Deploy AWS infra for crawl/search using the existing SAM stack.

## Phase B
Launch one ARM EC2 instance for GoalWealth runtime.

## Phase C
Install and run on that EC2:
- OpenClaw
- adapter API
- internal backend stub

## Phase D
Wire adapter to internal stub.

## Phase E
Smoke test end-to-end.

---

# 4. AWS prerequisites

Before starting, prepare:
- AWS CLI configured
- permissions for:
  - CloudFormation
  - S3
  - Lambda
  - DynamoDB
  - OpenSearch Serverless
  - EventBridge Scheduler
  - IAM
  - EC2
  - SSM Parameter Store (recommended)
  - Secrets Manager (recommended)
- an S3 bucket for CloudFormation packaging artifacts
- one VPC/subnet/security group for the EC2 runtime

Optional but recommended:
- Route 53 domain or subdomain
- ACM certificate if you later put the adapter behind HTTPS/ALB

---

# 5. Phase A - Deploy the AWS SAM stack

The current infra file is:
- `goalwealth/infra/sam/template.yaml`

It provisions the search/crawl backbone.

## What it currently creates
- DynamoDB table for feed registry
- OpenSearch Serverless vector/search collection
- RSS crawler Lambda
- Smart Agent Lambda
- EventBridge Scheduler for warm sync

## Use the provided packaging script
Script:
- `goalwealth/scripts/aws/package_and_deploy.sh`

Usage:

```bash
bash goalwealth/scripts/aws/package_and_deploy.sh <s3-artifact-bucket> <stack-name> <region> [environment-name]
```

Example:

```bash
bash goalwealth/scripts/aws/package_and_deploy.sh my-goalwealth-artifacts goalwealth-dev ap-northeast-1 dev
```

## Notes
This script installs dependencies from:
- `goalwealth/src/requirements.txt`

Then packages and deploys the SAM template.

## Important current limitation
The helper script only passes:
- `EnvironmentName`

If you need to override more CloudFormation parameters such as:
- `QueryApiEnabled`
- `OidcAudience`
- `SmartAgentModelMode`
- `OpenSearchAllowFromPublic`
- `RecencyThresholdMinutes`

then use manual `aws cloudformation deploy` after packaging, or extend the script.

---

# 6. Phase B - Launch the GoalWealth runtime EC2

Use the provided script:
- `goalwealth/scripts/aws/launch_goalwealth_runtime_ec2.sh`

Usage:

```bash
bash goalwealth/scripts/aws/launch_goalwealth_runtime_ec2.sh <name> <region> <subnet-id> <security-group-id> [key-name] [instance-profile-name] [instance-type] [user-data-file]
```

Example:

```bash
bash goalwealth/scripts/aws/launch_goalwealth_runtime_ec2.sh \
  goalwealth-runtime-dev \
  ap-northeast-1 \
  subnet-abc123 \
  sg-abc123 \
  my-key \
  GoalWealthEc2Role \
  t4g.medium
```

## Why ARM?
The current direction already fits ARM/Graviton well and the helper script launches Amazon Linux 2023 ARM.

## Recommended EC2 size
For dev/staging:
- `t4g.medium` is a reasonable starting point

For lighter tests:
- `t4g.small` may work, but `t4g.medium` is safer

---

# 7. Security group guidance

## Public inbound
Allow only what you need:
- `22` from your IP only (if using SSH)
- `8080` only if exposing adapter directly for testing

## Keep these private / loopback only
Do **not** expose publicly:
- `8090` internal backend stub
- any OpenClaw local-only ports unless you deliberately front them another way

## Recommended current stance
- expose adapter only
- keep internal stub loopback-only
- keep OpenClaw loopback/local-only

---

# 8. Instance role guidance

The EC2 instance should ideally have an instance profile that can read:
- SSM Parameter Store config
- Secrets Manager values

If you later want the instance to call AWS services directly beyond basic deployment/runtime, add the minimum permissions required.

At minimum for configuration retrieval, allow:
- `ssm:GetParameter`
- `ssm:GetParameters`
- `secretsmanager:GetSecretValue`
- `kms:Decrypt` where relevant

---

# 9. Phase C - Install runtime software on the EC2

SSH into the instance, then install:
- Python 3
- pip / venv tools
- git
- Node.js (for OpenClaw runtime if needed in your setup)

## Recommended deployment directory
For example:

```bash
/opt/goalwealth
```

or clone into a service user home directory.

## Basic bootstrap outline

```bash
sudo dnf update -y
sudo dnf install -y git python3 python3-pip
python3 -m venv /opt/goalwealth/.venv
source /opt/goalwealth/.venv/bin/activate
pip install -r /opt/goalwealth/goalwealth/src/requirements.txt
```

Also install or configure OpenClaw on that host according to your existing runtime setup.

---

# 10. Phase D - Run the internal backend stub on AWS

The new internal stub code lives at:
- `goalwealth/src/internal_backend_api/`

The helper run script is:
- `goalwealth/scripts/local/run_internal_backend_stub.sh`

Even though the path says `local`, it works fine on EC2 as long as the env is set.

## Internal stub env

```bash
export PYTHONPATH="/opt/goalwealth/goalwealth/src"

export GOALWEALTH_INTERNAL_BACKEND_ENV=dev
export GOALWEALTH_INTERNAL_BACKEND_HOST=127.0.0.1
export GOALWEALTH_INTERNAL_BACKEND_PORT=8090
export GOALWEALTH_INTERNAL_BACKEND_ENABLE_DOCS=false
export GOALWEALTH_INTERNAL_BACKEND_AUTH_OPTIONAL=false
export GOALWEALTH_INTERNAL_BACKEND_BEARER_TOKEN="replace-me-in-aws"
export GOALWEALTH_INTERNAL_BACKEND_SMART_AGENT_MODE=stub
export GOALWEALTH_INTERNAL_BACKEND_NEWS_BASE_URL="https://news.goalwealth.example.com"
```

## Start it

```bash
cd /opt/goalwealth
source .venv/bin/activate
bash goalwealth/scripts/local/run_internal_backend_stub.sh
```

## Recommended binding
Use:
- `127.0.0.1:8090`

so it is not externally reachable.

---

# 11. Phase E - Run the adapter API on AWS

Adapter code lives at:
- `goalwealth/src/adapter_api/`

## Adapter env

```bash
export PYTHONPATH="/opt/goalwealth/goalwealth/src"

export GOALWEALTH_ADAPTER_ENV=dev
export GOALWEALTH_ADAPTER_HOST=0.0.0.0
export GOALWEALTH_ADAPTER_PORT=8080
export GOALWEALTH_ADAPTER_ENABLE_DOCS=false

export GOALWEALTH_ADAPTER_AUTH_OPTIONAL=true
export GOALWEALTH_ADAPTER_ALLOW_DEV_TOKENS=true

export GOALWEALTH_INTERNAL_API_BASE_URL="http://127.0.0.1:8090"
export GOALWEALTH_INTERNAL_API_BEARER_TOKEN="replace-me-in-aws"
export GOALWEALTH_INTERNAL_API_TIMEOUT_SECONDS="10"
```

If you already have Google OIDC details ready, also set:

```bash
export GOALWEALTH_OIDC_ISSUER="https://accounts.google.com"
export GOALWEALTH_OIDC_AUDIENCE="<google-client-id>"
export GOALWEALTH_OIDC_JWKS_URL="https://www.googleapis.com/oauth2/v3/certs"
export GOALWEALTH_OIDC_TOKENINFO_URL="https://oauth2.googleapis.com/tokeninfo"
export GOALWEALTH_OIDC_TIMEOUT_SECONDS="10"
```

## Start it

```bash
cd /opt/goalwealth
source .venv/bin/activate
python3 -m uvicorn adapter_api.app:app --host 0.0.0.0 --port 8080
```

---

# 12. OpenClaw on AWS

Current architecture assumption:
- OpenClaw stays on EC2 as orchestration-only runtime

## What to remember
- adapter is still the frontend-facing public backend
- OpenClaw is not exposed as the frontend API
- internal backend stub is also not exposed publicly

## Current status of the GoalWealth chat path
Even after wiring the internal stub, the adapter may still return:
- `gateway = orchestrator_placeholder`

That is expected until the next phase where adapter-to-OpenClaw live response wiring is enabled fully.

But once the internal stub is in place, these should improve:
- memory: `unavailable -> loaded`
- smart agent: `unavailable -> loaded`
- OCR view: `unavailable -> loaded`

---

# 13. Recommended process model on EC2

For real use, run these as managed services instead of raw terminal sessions:
- internal backend stub
- adapter API
- OpenClaw runtime (however you already manage it)

## Recommended service manager
Use `systemd` units for:
- automatic restart
- boot-time startup
- log separation

Suggested units:
- `goalwealth-internal-backend.service`
- `goalwealth-adapter.service`
- optionally an OpenClaw-related unit if not already managed elsewhere

---

# 14. Recommended config storage on AWS

## Put non-secrets in SSM Parameter Store
Examples:
- service environment names
- base URLs
- OIDC issuer
- OIDC audience
- feature flags
- timeout values

## Put secrets in Secrets Manager
Examples:
- internal bearer token
- OpenClaw tokens
- any future service credentials

## Keep only runtime exports or rendered env files on the instance
Do not hardcode long-lived secrets directly into scripts committed to git.

---

# 15. Example AWS env split

## SSM Parameter Store candidates
- `/goalwealth/dev/adapter/env`
- `/goalwealth/dev/oidc/issuer`
- `/goalwealth/dev/oidc/audience`
- `/goalwealth/dev/internal/base-url`

## Secrets Manager candidates
- `goalwealth/dev/internal-backend-bearer-token`
- `goalwealth/dev/openclaw-token`

---

# 16. Smoke test checklist on AWS

Once EC2 services are up, test in this order.

## Internal stub readiness

```bash
curl http://127.0.0.1:8090/ready
```

## Adapter readiness

```bash
curl http://127.0.0.1:8080/ready
```

## Adapter chat test

```bash
curl -s -X POST "http://127.0.0.1:8080/v1/chat/respond" \
  -H "Authorization: Bearer dev-token:user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tin AI mới nhất hôm nay là gì?",
    "timezone": "Asia/Ho_Chi_Minh"
  }'
```

## Adapter OCR ingress test

```bash
curl -s -X POST "http://127.0.0.1:8080/v1/ocr/ingress" \
  -H "Authorization: Bearer dev-token:user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "Thu nhập tháng 25 triệu, chi 8 triệu"
  }'
```

## Adapter OCR record test

```bash
curl -s "http://127.0.0.1:8080/v1/ocr/records/ocr-aws-001" \
  -H "Authorization: Bearer dev-token:user-123"
```

## Expected current good result
- adapter chat context diagnostics show:
  - `memory = loaded`
  - `smart_agent = loaded`
- OCR get record shows:
  - `status = ready`
  - `ocr_view = loaded`

Even if chat still uses placeholder orchestration response, this means the internal backend path is working.

---

# 17. HTTPS / exposure recommendation

## Current quickest dev/staging path
- public EC2 IP + adapter on `8080` for short-lived testing

## Better next step
- front adapter with an ALB or reverse proxy
- terminate TLS with ACM/ALB or nginx/Caddy on the instance
- expose standard HTTPS instead of raw `:8080`

## Still keep internal stub private
Do not front `:8090` publicly.

---

# 18. What not to do right now

Do not overcomplicate this first AWS deployment by splitting into too many services immediately.

Avoid this for now unless you have a strong reason:
- separate ECS service for adapter
- separate ECS service for internal stub
- public OCR service endpoint
- frontend direct calls to OpenClaw
- frontend direct calls to internal backend services

The simplest working AWS deployment is better at this stage.

---

# 19. Minimum viable AWS deployment summary

If you want the shortest path, do exactly this:

## Step 1
Deploy SAM stack for crawler + smart agent infra.

## Step 2
Launch one ARM EC2 instance.

## Step 3
Install Python deps and OpenClaw on that instance.

## Step 4
Run internal backend stub on `127.0.0.1:8090`.

## Step 5
Run adapter on `0.0.0.0:8080` and point it to `http://127.0.0.1:8090`.

## Step 6
Smoke test chat and OCR.

That is the cleanest current AWS-only deployment for GoalWealth.

---

# 20. Recommended next step after this deployment works

Once this AWS deployment is healthy, the next backend milestone should be:
- enable adapter -> OpenClaw live orchestration path

Why:
- internal data/context path is then already working
- the remaining major gap is replacing `orchestrator_placeholder` with live orchestration responses

That is the correct next backend step after successful AWS deployment.
