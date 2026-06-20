# Release Review Assistant

Status: Product foundation

The release review assistant checks whether SEIS is ready for release or public
readiness claims.

## Purpose

Summarize release blockers, validation status, security posture, docs freshness,
artifact status, deployment readiness, rollback readiness, and PR readiness.

## User Input

- release target
- branch or PR reference
- artifact reference
- readiness question

## Allowed Context

- release docs
- validation output
- CI status
- source-of-truth docs
- artifact manifests
- deployment runbooks
- security review records

## Forbidden Context

- secrets
- production credentials
- SSH private keys
- private deployment logs without approval
- unreviewed generated archives

## Allowed Tools

Read-only checks, dry-run validation, release manifest inspection, and GitHub
status reads.

## Forbidden Tools

Tagging, publishing, deployment, artifact deletion, branch deletion, or
production changes without explicit approval.

## Output Format

Return release decision, blockers, validation evidence, rollback notes, excluded
material, and next safe action.

## Current Status

Foundation contract. No release action is added.
