# SEIS AI Core Contract Fixture Recovery Review

Date: 2026-06-23

Status: local fixture-backed recovery review

## Purpose

Record the second current-main recovery slice for PR #44. This slice ports the
local AI Core contract fixtures, schemas, and validator scripts onto
`origin/main` without merging the conflicting PR wholesale.

## Scope

Recovered local contract layers:

- model-router route contracts
- prompt-engine regression fixtures
- repository-assistant local read-only prototype fixture
- agent-runtime task lifecycle fixture
- tool-registry permission fixture
- knowledge-source classification fixture
- local read-only retrieval query adapter fixture
- local no-content retrieval transcript fixture
- metadata-only 10,000,000-token feed budget fixture
- shared AI Core / Command Center app-state fixture
- static app fixture projection for `apps/seis-core`

## Safe Changes Applied

- Added package-level README files, JSON schemas, JSON fixtures, and local
  validators.
- Added narrow `.gitignore` exceptions for only the selected fixture/schema
  paths.
- Added package scripts for the local validators.
- Updated AI Core, evaluation, and review documents so they describe this
  branch as fixture-backed instead of docs-only.

## Validation Performed

The local contract chain passed:

- `npm run check:model-router-contracts`
- `npm run check:prompt-regression-fixtures`
- `npm run check:repository-assistant-prototype`
- `npm run check:agent-runtime-lifecycle`
- `npm run check:tool-registry-permissions`
- `npm run check:knowledge-source-classification`
- `npm run check:retrieval-query-adapter`
- `npm run check:retrieval-search-transcript`
- `npm run check:token-feed-budget`
- `npm run check:ai-core-app-contracts`

## Non-Claims

This recovery slice does not claim:

- live provider execution
- provider quality or benchmark performance
- trained SEIS model ownership
- fine-tuning completion
- checkpoint publication
- model-card completion for real weights
- browser QA workflow activation
- GitHub write actions beyond this local branch workflow
- deployment, SSH execution, dataset ingestion, or infrastructure mutation

## Excluded Material

Still excluded from this branch:

- Command Center UI projection changes from PR #44
- browser QA scripts and artifact workflow activation
- CI workflow rewrites from PR #44
- live provider adapters and backend gateway behavior
- generated browser evidence reports from old PR44 context

## Recommended Next Slice

Recover the Command Center AI Core UI projection against the current
`apps/seis-core` shape. After the UI projection is reviewed, recover browser QA
evidence as a separate workflow-gated slice.

## Final Decision

- Safe to treat as local contract fixture recovery: yes.
- Safe to claim live AI application implementation: no.
- Safe to claim SEIS-owned model training: no.
- Safe to merge PR #44 wholesale: no.
