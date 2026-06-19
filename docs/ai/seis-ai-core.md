# SEIS AI Core

Status: Foundation architecture

SEIS AI Core is the intelligence layer for the SEIS ecosystem. It defines how
SEIS uses large language models, local models, agents, prompts, tools,
retrieval, memory, evaluations, and approval gates without claiming ownership of
the underlying provider models.

SEIS AI Core is application-layer AI first. It may route to external providers
or local models, but the SEIS-owned value in this phase is the behavior layer:
contracts, prompts, roles, policies, tests, provenance, safety boundaries, and
Command Center integration.

## Mission

SEIS AI Core should support:

- repository assistance
- architecture review
- security review
- documentation strategy
- pull request review
- roadmap planning
- Command Center operation
- design-system assistance
- AI research assistance
- automation assistance
- release and public readiness review

## Architecture

| Layer | Responsibility | Current rule |
| --- | --- | --- |
| AI App API boundary | Connect app surfaces to AI Core without exposing raw credentials. | Browser clients never receive provider keys or SSH private keys. |
| Model router | Select provider profile and privacy mode for a task. | No provider keys in browser clients or docs. |
| Prompt engine | Store versioned prompts, behavior packs, review prompts, and safety prompts. | No copied proprietary prompts or secrets. |
| Agent runtime | Run supervised roles with permission boundaries and approval gates. | Agents do not expand their own authority. |
| Tool registry | Describe tools, plugins, MCP surfaces, permissions, and risk class. | Tool output is untrusted until validated. |
| Knowledge layer | Provide retrieval and project context with provenance. | Secrets and restricted material are excluded. |
| Evaluation lab | Test prompts, routing, regression, safety, and task quality. | No benchmark claims without measured runs. |
| Audit layer | Record safe metadata, decisions, approvals, and validation evidence. | Logs redact secrets and private data. |

The intended app operating chain is:

```text
SEIS AI App / Command Center
  -> AI App API Boundary
  -> Model Router
  -> Prompt Engine
  -> Agent Runtime
  -> Knowledge / Retrieval System
  -> Tool and Plugin Registry
  -> Evaluation / Audit / Approval Layer
```

## Current Evidence

- `packages/seis-ai` contains the current AI toolkit and MCP/test surface.
- `mcp/seis-mcp-server.mjs` contains a repository MCP bridge.
- `content/development/llm-task-routing-policy.json` records existing routing
  policy data.
- `content/development/llm-adapter-readiness.json` records provider/helper
  readiness.
- `docs/ai/policy.md` defines the existing AI policy baseline.
- `docs/architecture/seis-command-center.md` describes the current Command
  Center shell.

## Non-Claims

SEIS does not claim in this foundation pass that it has trained a foundation
model, produced a checkpoint, run benchmarks, created a model card for a real
trained model, or connected live providers. Prompt engineering, retrieval, and
provider routing are not model ownership.

## Integration With The App

SEIS AI Core and the Command Center share contracts for model routes, prompt
versions, agent tasks, approval requests, evaluation results, audit events,
repository findings, documentation status, security findings, roadmap items,
and module maturity. The app exposes the AI Core safely; the AI Core interprets
app states and actions through typed contracts.

## App Execution Requirements

Every AI action in the app should expose data mode, privacy mode, selected
route, prompt version, context source, assumptions, tools used, approval state,
evidence, and validation status where possible. Dangerous actions must be
converted into approval requests rather than executed directly by the LLM.

See also:

- `docs/architecture/ai-core-app-shared-contracts.md`
- `docs/product/seis-ai-app.md`
- `docs/product/ai-core-center.md`
- `docs/security/model-provider-data-policy.md`
- `docs/evals/evaluation-strategy.md`
