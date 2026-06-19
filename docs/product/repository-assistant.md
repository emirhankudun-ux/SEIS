# Repository Assistant

Status: Product foundation

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

Foundation contract. The assistant may be implemented after shared contracts and
approval-state fixtures exist.
