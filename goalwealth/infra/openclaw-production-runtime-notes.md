# GoalWealth OpenClaw Production Runtime Notes

## Deployment stance
- Use **ARM/Graviton** instances for the OpenClaw EC2 runtime.
- Recommended starting family for MVP: `t4g.small` or `t4g.medium`.
- Keep the Gateway and adapter on private ingress only.

## Critical boundary: no markdown memory in production
For GoalWealth production, OpenClaw must **not** create, depend on, or update:
- `memory.md`
- `MEMORY.md`
- `memory/*.md`

### Why
GoalWealth production memory must be external and structured:
- PostgreSQL / domain services are the source of truth
- OpenClaw is orchestration only
- local markdown memory can drift, leak, or bias responses

## Operational guardrails
1. Use a **dedicated production workspace** for GoalWealth.
   - Do not reuse the personal assistant workspace.
   - Do not copy AGENTS/SOUL/USER/MEMORY files from the personal assistant runtime.
2. Keep `MEMORY.md`, `memory.md`, and `memory/` absent from the production workspace.
3. Set memory config to avoid default memory indexing:
   - `memory.qmd.includeDefaultMemory = false`
   - `agents.defaults.memorySearch.extraPaths = []`
4. Route product memory through structured services only:
   - memory service
   - OCR normalization service
   - PostgreSQL-backed domain services
5. When calling OpenClaw through the adapter, include explicit system instructions forbidding local markdown memory use.

## Gateway HTTP endpoint for adapter
The adapter can call OpenClaw Gateway over HTTP using:
- `POST /v1/chat/completions`
- Bearer auth with the Gateway token
- `x-openclaw-agent-id: main` (or another dedicated GoalWealth agent id)
- `x-openclaw-session-key` for stable per-user/per-session routing

## Suggested env vars for adapter -> OpenClaw
```bash
export GOALWEALTH_OPENCLAW_BASE_URL="http://127.0.0.1:18789"
export GOALWEALTH_OPENCLAW_TOKEN="..."
export GOALWEALTH_OPENCLAW_AGENT_ID="main"
export GOALWEALTH_OPENCLAW_SESSION_PREFIX="goalwealth"
export GOALWEALTH_OPENCLAW_HTTP_ENDPOINT="chat_completions"
```

## Suggested EC2 target
- Architecture: ARM64 / Graviton
- Example AMI family: Ubuntu ARM64 or Amazon Linux 2023 ARM64
- Keep the Gateway on loopback, tailnet, or private subnet ingress only
