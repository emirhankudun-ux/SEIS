# Evaluation Strategy

Status: foundation strategy recovered from PR #44

## Purpose

Define how SEIS should evaluate AI Core, model routing, prompt behavior, agent
runtime behavior, app states, retrieval boundaries, and future SEIS Universe
research without creating fake benchmark, safety, model-ownership, or
production-readiness claims.

This recovery branch restores the strategy document and the local AI Core
contract fixture layer. It does not perform live provider calls, benchmark
runs, model training, GitHub writes, SSH execution, deployments, or browser
artifact publication.

## Evaluation Layers

| Layer | Purpose | Current recovery status |
| --- | --- | --- |
| Prompt regression | Detect behavior drift across prompt versions. | Fixture-backed by `packages/prompt-engine/fixtures/assistant-surface-regression-suite.json`; checked by `check:prompt-regression-fixtures`. |
| Router contracts | Verify privacy mode, task class, provider status, and fallback rules. | Fixture-backed by `packages/model-router/fixtures/model-router-route-contracts.json`; checked by `check:model-router-contracts`. |
| Agent safety | Verify approval gates, forbidden actions, validation claims, and bounded subagents. | Fixture-backed by `packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json`; checked by `check:agent-runtime-lifecycle`. |
| Tool and MCP safety | Verify schema, permission, timeout, redaction, and error handling. | Fixture-backed by `packages/tool-registry/fixtures/tool-registry-permissions.json`; checked by `check:tool-registry-permissions`. |
| App state evaluation | Verify ready, blocked, degraded, unknown, approval-needed, failed, and validated states. | Fixture-backed by `packages/shared-types/fixtures/ai-core-command-center-foundation.json`; checked by `check:ai-core-app-contracts`. |
| Retrieval and knowledge | Verify source class, freshness, privacy mode, no-content transcripts, and blocked archives. | Fixture-backed by local data fixtures; checked by `check:knowledge-source-classification`, `check:retrieval-query-adapter`, `check:retrieval-search-transcript`, and `check:token-feed-budget`. |
| Browser evidence | Verify real UI navigation and artifact integrity for Command Center AI Core surfaces. | Documented; browser QA workflow pending re-port. |
| Research evaluations | Measure future tokenizer, fine-tune, nano-model, and SEIS Universe experiments. | Research-only; no training evidence in this slice. |

The retrieval fixtures are `local-readonly-retrieval-query-adapter` and
`local-readonly-retrieval-search-transcript`. They are metadata-only local
contracts for Command Center evidence browsing; they do not execute live
retrieval, provider routing, embeddings, raw-content storage, or memory writes.

## Minimum Evaluation Record

Every evaluation record should include:

- evaluation id
- target version
- dataset or fixture source
- privacy class
- metric or rubric
- pass/fail/blocked/unknown criteria
- observed output summary
- limitations
- reviewer
- timestamp
- source evidence
- non-claims

## Evidence Rules

- A fixture pass proves only the fixture contract that was actually validated.
- A browser QA pass proves only the captured scenario and viewport coverage.
- A generated report is evidence only when its generator and source fixtures are
  present and validated in the same branch.
- A green metadata check does not prove live provider quality, safety, or
  production readiness.
- A model benchmark claim requires benchmark configuration, dataset provenance,
  run logs, outputs, metrics, and contamination review.
- A trained-model claim requires dataset provenance, training logs,
  checkpoints, eval reports, and a model card.

## Required Non-Claims

SEIS evaluation documents must not claim:

- live provider routing unless a provider call was actually performed through
  an approved backend boundary
- benchmark performance unless a benchmark was actually run
- trained SEIS model ownership unless real weights, logs, data provenance,
  checkpoints, evaluations, and model cards exist
- model safety certification unless the relevant safety evaluation was run
- production readiness from fixture-only or docs-only evidence
- default-branch GitHub Actions evidence from a feature-branch-only workflow

## Recovery Scope

This branch recovers the evaluation strategy plus local fixture-backed AI Core
contracts. The following PR #44 implementation assets remain intentionally out
of scope for this branch:

- live provider adapters
- backend provider gateway execution
- browser QA artifact workflow activation
- manual browser evidence workflow dispatch
- external API calls
- model benchmarks
- model training, checkpoint publication, or model-card completion claims

## Next Safe Action

Validate and review this local fixture recovery branch, then recover the
Command Center UI projection and browser QA workflow as a separate slice. Keep
all provider calls disabled, keep browser keys absent, and preserve local-only
or metadata-only behavior until explicit approval and validation evidence
exist.
