# @seis/repository-assistant

Status: Local read-only prototype

This package defines the first SEIS Repository Assistant prototype. It explains
repository state from local evidence only and does not call external providers,
write to GitHub, execute SSH commands, deploy, or mutate the repository.

## Current Prototype Evidence

- `schemas/local-readonly-repository-assistant.schema.json` defines the local
  assistant run shape.
- `fixtures/local-readonly-repository-assistant.json` records a synthetic,
  reviewable assistant output with source links, validation summaries, risks,
  and next safe action.
- `npm run check:repository-assistant-prototype` validates read-only boundaries,
  source-link coverage, non-claims, forbidden actions, and secret/path hygiene.

## Allowed Inputs

- local git metadata
- changed file paths
- official docs
- local validation summaries
- package and app evidence paths

## Forbidden Behavior

- staging, committing, pushing, merging, deleting branches, rewriting history,
  deployment, SSH execution, credential access, provider routing, or printing
  secrets
- using private, leaked, proprietary, or restricted archives as implementation
  source
- claiming tests, provider readiness, model training, benchmarks, or deployment
  success without observed evidence

See `docs/product/repository-assistant.md`.
