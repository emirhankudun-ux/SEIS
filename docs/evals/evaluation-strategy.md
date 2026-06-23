# Evaluation Strategy

Status: foundation strategy recovered from PR #44

## Purpose

Define how SEIS should evaluate AI Core, model routing, prompt behavior, agent
runtime behavior, app states, retrieval boundaries, and future SEIS Universe
research without creating fake benchmark, safety, model-ownership, or
production-readiness claims.

This recovery branch restores the strategy document only. It does not restore
the PR #44 package fixtures, browser QA scripts, generated evaluation reports,
or GitHub Actions artifact workflow. Those implementation artifacts are future
recovery slices.

## Evaluation Layers

| Layer | Purpose | Current recovery status |
| --- | --- | --- |
| Prompt regression | Detect behavior drift across prompt versions. | Documented; fixtures pending re-port. |
| Router contracts | Verify privacy mode, task class, provider status, and fallback rules. | Documented; fixtures pending re-port. |
| Agent safety | Verify approval gates, forbidden actions, validation claims, and bounded subagents. | Documented; lifecycle fixtures pending re-port. |
| Tool and MCP safety | Verify schema, permission, timeout, redaction, and error handling. | Documented; implementation pending. |
| App state evaluation | Verify ready, blocked, degraded, unknown, approval-needed, failed, and validated states. | Documented; Command Center fixture pending re-port. |
| Retrieval and knowledge | Verify source class, freshness, privacy mode, no-content transcripts, and blocked archives. | Documented; local fixtures pending re-port. |
| Browser evidence | Verify real UI navigation and artifact integrity for Command Center AI Core surfaces. | Documented; browser QA workflow pending re-port. |
| Research evaluations | Measure future tokenizer, fine-tune, nano-model, and SEIS Universe experiments. | Research-only; no training evidence in this slice. |

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

This document recovers the evaluation strategy from PR #44 as a docs-only slice.
The following PR #44 implementation assets remain intentionally out of scope
for this branch:

- prompt regression fixtures
- model-router contract fixtures
- agent-runtime lifecycle fixtures
- shared AI Core / Command Center app-state fixtures
- retrieval and knowledge-source fixtures
- token feed budget fixtures
- browser QA scripts
- generated AI Core fixture evaluation reports
- manual browser evidence workflow

Those artifacts should be re-ported in smaller slices after this documentation
foundation is reviewed against current `main`.

## Next Safe Action

Recover the prompt-engine, model-router, agent-runtime, and shared-type
contract fixtures as a separate branch after this docs-only AI Core foundation
slice is reviewed. Keep all provider calls disabled, keep browser keys absent,
and preserve local-only or metadata-only behavior until explicit approval and
validation evidence exist.
