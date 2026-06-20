# Repository Assistant

Status: Local read-only prototype

The repository assistant explains and reviews repository state through SEIS AI
App boundaries.

## Purpose

Support repository analysis, branch review, PR review preparation, validation
summary, file navigation, folder classification, and next safe action planning.

## User Input

- repository question
- branch or PR reference
- file path
- validation request
- cleanup or rescue objective

## Allowed Context

- official docs
- source files
- Git branch and diff state
- PR metadata from approved read-only checks
- validation output
- review reports

## Forbidden Context

- secrets
- private key material
- raw `.env` contents
- unreviewed restricted archives
- private provider credentials

## Allowed Tools

Read-only file inspection, `git status`, `git diff`, `git log`, path-only
security scans, and approved read-only GitHub metadata checks.

## Forbidden Tools

Staging, committing, pushing, merging, branch deletion, history rewrite,
deployments, SSH, and destructive cleanup without explicit approval.

## Output Format

Return repository condition, evidence, risks, validation status, recommended
branch/commit/PR plan, and excluded material.

## Current Status

Local-alpha prototype evidence now lives under `packages/repository-assistant/`:

- `schemas/local-readonly-repository-assistant.schema.json`
- `fixtures/local-readonly-repository-assistant.json`
- `npm run check:repository-assistant-prototype`

The prototype is local-only and read-only. It may return repository condition,
source-linked evidence, risks, validation status, recommended branch plan,
excluded material, and next safe action. It does not enable external provider
routing, GitHub write actions, SSH execution, deployment, destructive cleanup,
model training, benchmark claims, or secret access.
