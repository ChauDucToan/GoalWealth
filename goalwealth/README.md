# GoalWealth

This directory is the project root for the GoalWealth backend work inside the OpenClaw workspace.

## Main folders
- `src/` application code
- `scripts/` operational scripts
- `infra/` infrastructure and seed files
- `contracts/` API/schema contracts

## Current layout
```text
goalwealth/
├── src/
│   ├── lambdas/
│   ├── orchestrator_clients/
│   └── shared/
├── scripts/
│   ├── aws/
│   ├── local/
│   └── validate/
├── infra/
│   ├── sam/
│   ├── seeds/
│   └── environments/
└── contracts/
    ├── api/
    ├── ocr/
    └── memory/
```

## Quick commands
From the workspace root:
- `bash goalwealth/scripts/aws/package_and_deploy.sh <artifact-bucket> <stack-name> <region> [environment-name]`
- `bash goalwealth/scripts/aws/seed_feed_registry.sh <stack-name> <region> [mode]`
- `bash goalwealth/scripts/aws/run_warm_sync.sh <stack-name> <region>`
- `bash goalwealth/scripts/aws/test_smart_agent.sh <stack-name> <region> "<query>"`
