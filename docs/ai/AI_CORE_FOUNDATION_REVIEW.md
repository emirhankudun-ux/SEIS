# SEIS AI Core Foundation Review

Date: 2026-06-19

SEIS AI Core is the application layer for model routing, prompt governance,
agent runtime, evaluation, memory, and tool orchestration. This review prevents
overclaiming and defines the safe foundation path.

## Current Evidence

| Surface | Status | Notes |
| --- | --- | --- |
| `packages/seis-ai/` | Present but partially impacted | Some package files are deleted in the current worktree. |
| `mcp/seis-mcp-server.mjs` | Present | MCP entrypoint exists; not validated in this pass. |
| `content/development/llm-task-routing-policy.json` | Present | Defines routing policy data. |
| `content/development/llm-adapter-readiness.json` | Present | Defines planned/ready adapter statuses. |
| `reports/ai-release-manifest.*` | Present | Evidence records exist; not refreshed in this pass. |
| Original SEIS foundation model | Not proven | No training, checkpoint, dataset, tokenizer, or evaluation evidence was reviewed. |

## Required Boundaries

| Boundary | Rule |
| --- | --- |
| Provider keys | Server-side only; never expose to browser clients or docs. |
| Model router | Provider-neutral interface; adapters replaceable. |
| Prompt engine | Versioned prompts, no secrets, no copied proprietary system prompts. |
| Agent runtime | Human-supervised roles, permissions, forbidden actions, validation gates. |
| Memory/knowledge | Privacy-aware storage; no secrets or restricted material. |
| Evaluation | No benchmark or capability claims without measured runs. |
| SEIS Universe research | Clearly separate original model research from provider routing, RAG, prompts, and fine-tunes. |

## Foundation Components

| Component | Next Documentation Needed |
| --- | --- |
| Model Router | Provider interface, routing policy, model profiles, privacy-aware logging, error contract. |
| Prompt Engine | Prompt format, versioning, templates, provenance, clean-room restrictions. |
| Agent Runtime | Agent roles, permission boundaries, approval requirements, run/audit schema. |
| Evaluation | Prompt regression, routing tests, agent safety checks, model evaluation smoke plan. |
| Knowledge Layer | Data classification, retention, redaction, provenance, retrieval boundaries. |
| Local Model Support | Optional local-model lane with hardware limits and no frontier-model claims. |

## Current Risks

- Deleted runtime/package files block implementation readiness claims.
- Existing routing records should not be treated as live external model
  integration evidence.
- No provider API calls were made in this pass.
- No model training, benchmark, or dataset download was performed.

## Safe Next PR

Create a documentation-only AI Core foundation PR that adds:

- `packages/model-router/README.md`
- `packages/model-router/provider-interface.md`
- `packages/model-router/routing-policy.md`
- `packages/prompt-engine/README.md`
- `packages/agent-runtime/README.md`
- `docs/ai/SEIS_MODEL_BASELINE.md`

Only add code after deleted package files and validation scripts are resolved.
