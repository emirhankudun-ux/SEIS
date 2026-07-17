---
name: seis-topic-cybersecurity-security-auditing
description: Read-only Security Auditing context and bounded repository evidence for SEIS work.
---

# Security Auditing

Use this public SEIS topic skill when the task is specifically about **Security Auditing** within the **Cybersecurity** family.

## Workflow

1. Read the repository instructions, project manifest, active goal, and nearby architecture docs.
2. Classify the request as Security Auditing evidence, design, implementation planning, validation, or documentation.
3. Inspect only bounded repository paths that are in scope for the active goal.
4. Produce an explicit result with observed evidence, limitations, risks, rollback, and next action.
5. Run the smallest relevant validation command and disclose skipped or unavailable checks.

## Permission boundary

- Read: bounded local repository evidence only.
- Write: none by default.
- Network: disabled by design.
- Secrets: never read or requested.
- External or destructive actions: approval-gated outside this topic package.

A local-ready result is not a claim of provider connectivity, deployment, public release, or production maturity.
