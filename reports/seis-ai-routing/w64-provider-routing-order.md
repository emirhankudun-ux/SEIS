# W64 Provider Routing Order

Date: 2026-07-07

## Scope

Create a durable policy-level routing order for configured AI helpers without
reading credentials, calling providers, validating quota, or claiming live model
execution.

## Routing Order

1. Adequate local provider.
2. Owner-selected provider.
3. Capability-compatible approved cloud provider.
4. Lowest-risk approved cloud provider.
5. Lowest-cost approved cloud provider.
6. SEIS Local Demo.
7. Feature disabled.

## Required Provider Readiness Axes

- installed
- credentialed
- quotaReady
- ownerApproved
- verified
- blocked

A provider may route only when the first five axes are true and `blocked` is
false. Cloud credentials and quota must be proven later by server-only,
redacted adapters; this packet does not inspect secrets.

## Repository Evidence

- Source fixture: `content/development/seis-ai-core-provider-registry.json`
- Local read-only status tool: `seis_ai_core_provider_status`
- MCP resource: `seis://ai/provider-registry.json`
- Validator: `npm run check:seis-ai-core-provider-registry`

## Result Ledger

- Owner signal: the owner requested broad installed-AI / subagent participation,
  but repository authority stays with Codex as the single writer until a future
  explicit writer-handoff policy changes that.
- Prompt class: public-safe policy review packet.
- Secrets: none requested, read, typed, or recorded.
- Provider calls: not claimed by this repo ledger.
- Live execution claim: none.
- Model output used as evidence: none.
- Repo-only result: keep the routing contract and readiness-axis validator as
  the durable result.
