# SEIS AI Core Review

Date: 2026-06-19
Status: Foundation review

## What Exists

- `packages/seis-ai` provides the current AI package surface.
- `mcp/seis-mcp-server.mjs` provides the repository MCP bridge.
- `content/development/llm-task-routing-policy.json` records current routing
  policy data.
- `content/development/llm-adapter-readiness.json` records adapter readiness.
- `docs/ai/policy.md` provides the existing AI policy baseline.

## What This Foundation Adds

- AI Core architecture and non-claims.
- Model-router contract.
- Prompt-engine contract.
- Agent-runtime contract.
- SEIS assistant behavior and SEIS Language v0.1 vocabulary.
- Local model and provider routing policy.
- Context, memory, and tool-use boundaries.
- Evaluation and prompt regression strategy.
- Model-provider data policy.

## Current Gaps

- No live provider adapter is added in this pass.
- No prompt loader or runtime registry is added in this pass.
- No model training, benchmark, dataset download, fine-tune, or checkpoint is
  performed in this pass.
- Existing package checks must remain the implementation validation source.

## Safe Next Steps

1. Add schema fixtures for shared AI Core and app contracts.
2. Add prompt-regression fixtures with synthetic examples.
3. Add pure model-router tests before provider adapters.
4. Add Command Center evidence views that consume contract fixtures.

## Decision

Safe to treat as architecture foundation: yes.

Safe to claim trained SEIS model: no.

Safe to claim live provider integration: no.
