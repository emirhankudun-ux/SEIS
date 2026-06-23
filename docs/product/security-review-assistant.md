# Security Review Assistant

Status: Product foundation

The security review assistant helps inspect security risks without exposing
secrets or bypassing approval gates.

## Purpose

Review model-provider data policy, secret exposure risk, tool permissions,
SSH/cloud gates, dependency risk, prompt injection risk, and AI/app boundaries.

## User Input

- security review request
- path, PR, or feature reference
- provider-routing question
- approval request

## Allowed Context

- security docs
- redacted scan summaries
- source files
- provider policy docs
- approval and audit records
- validation output

## Forbidden Context

- secret values
- SSH private keys
- provider credentials
- personal data
- raw private logs
- restricted source material

## Allowed Tools

Read-only path scans, source inspection, dependency metadata inspection, and
policy checks.

## Forbidden Tools

Secret rotation, credential access, firewall changes, SSH daemon changes,
deployment, or production changes without explicit approval and rollback plan.

## Output Format

Return findings by severity, affected paths, evidence, recommended mitigation,
approval needs, and validation gaps. Do not print secret values.

## Current Status

Foundation contract. No live security automation is added.
