# SEIS AI App LLM Review

Date: 2026-06-19
Status: Foundation review

## What This Review Covers

This review records the app-level LLM operating layer for SEIS AI App. It ties
LLM behavior to Command Center surfaces, model routing, prompt engine, agent
runtime, knowledge/retrieval, tool registry, evaluations, approvals, evidence,
goal tracking, and security boundaries.

## Added Or Improved Surfaces

- `docs/product/seis-ai-app.md`
- `docs/product/ai-chat-interface.md`
- `docs/product/ai-command-palette.md`
- `docs/product/ai-app-surfaces.md`
- `docs/product/goal-tracking-assistant.md`
- `docs/product/repository-assistant.md`
- `docs/product/security-review-assistant.md`
- `docs/product/release-review-assistant.md`
- `docs/architecture/ai-core-app-shared-contracts.md`
- existing AI Core policy docs under `docs/ai/`

## Boundary Decisions

- The LLM operates through app and API boundaries.
- Provider keys remain server-side.
- SSH private keys never reach browser or model context.
- Dangerous actions create approval requests.
- Execution modes must be explicit and visible.
- Goal completion and validation claims require evidence.
- Archive, mock, planned, generated, live, and official data are distinguished.

## Requirement Coverage

| Requirement | Evidence |
| --- | --- |
| App-bound LLM architecture | `docs/product/seis-ai-app.md` defines the app -> API boundary -> router -> prompt engine -> agent runtime -> knowledge/tools/eval/audit/approval chain. |
| Core AI App systems | `docs/product/seis-ai-app.md` lists app interface, LLM intelligence, model-router, prompt-engine, agent-runtime, retrieval, tool registry, evaluation, approval, evidence, goal tracking, and security boundaries. |
| LLM-powered app surfaces | `docs/product/ai-app-surfaces.md` defines every named surface from the objective. |
| Per-surface fields | `docs/product/ai-app-surfaces.md` includes purpose, user input, allowed context, forbidden context, allowed tools, forbidden tools, required approval, output format, evidence requirement, audit requirement, and current status for each surface. |
| Execution modes | `docs/ai/provider-routing-policy.md`, `docs/product/ai-chat-interface.md`, and `docs/architecture/ai-core-app-shared-contracts.md` define `local-only`, `local-preferred`, `external-provider-allowed`, `external-provider-redacted`, `metadata-only`, `offline`, `disabled`, and `research-only`. |
| Chat product definition | `docs/product/ai-chat-interface.md` defines supported tasks, required answer metadata, failure states, and forbidden behavior. |
| Goal tracking connection | `docs/product/goal-tracking-assistant.md` defines how the LLM can support goal progress without marking goals complete or validated without evidence. |
| Repository intelligence boundary | `docs/ai/context-memory-boundary.md` and `docs/architecture/ai-core-app-shared-contracts.md` define repository intelligence sources and distinguish official, review, archive, mock, scan-generated, live, planned, and unknown data. |
| Provider and secret safety | `docs/security/model-provider-data-policy.md`, `docs/ai/provider-routing-policy.md`, and `docs/product/seis-ai-app.md` block secrets, provider credentials, SSH private keys, and unsafe provider routing. |
| Required deliverable set | All files listed in the objective exist in the current branch. |

## Validation Evidence

Focused checks run for this foundation:

- `git diff --check`
- `npm run check:foundation`
- `npm run seis:check`
- `npm run check:open-source-governance`
- `npm run check:seis-master-prompt`
- `npm run check:ai-stack`
- `npm run check:seis-command-center`
- `npm run test:seis-command-center`
- `npm run check:seis-platform-language-policy`
- `npm run check:seis-active-mission-board`

Known local validation limitation:

- `npm run seis:test` passes 122 of 125 tests and fails only the MCP smoke tests
  because `@modelcontextprotocol/sdk` is not installed in the local worktree.

## Current Gaps

- No live AI App API implementation is added.
- No live provider adapter is added.
- No goal-completion automation is added.
- No repository write action is added.
- No model training, benchmark, dataset download, or checkpoint is created.

## Decision

Safe to treat as foundation architecture: yes.

Safe to claim a complete LLM-powered app implementation: no.

Safe to claim live provider routing or trained SEIS model ownership: no.
