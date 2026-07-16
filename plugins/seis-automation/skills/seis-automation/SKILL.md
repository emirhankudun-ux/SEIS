---
name: seis-automation
description: Use SEIS Automation for designing, implementing, documenting, and validating repeatable SEIS workflows, scripts, checks, scheduled jobs, runbooks, CI steps, agent loops, and human-approved automation gates.
---

# SEIS Automation

Use this skill when a SEIS task should become repeatable instead of remaining a
one-off chat or manual command sequence.

## Workflow

1. Classify the automation: local script, CI check, report generator, cloud
   preflight, install flow, agent loop, scheduled job, or runbook.
2. Identify inputs, outputs, owner, rollback path, and failure mode before
   writing code.
3. Prefer existing scripts and package commands over new frameworks.
4. Keep automation deterministic, idempotent where practical, and safe by
   default. Use dry-run or plan-only modes for mutating workflows.
5. Never bake secrets or machine-specific credentials into scripts, docs, or
   generated reports.
6. Add or update documentation when automation changes how SEIS is operated.
7. Validate syntax and the lightest representative execution path before
   reporting completion.

## Automation Contract

Every durable SEIS automation should define:

- purpose
- command or entrypoint
- required inputs
- generated outputs
- safety gates
- rollback or cleanup
- validation command
- known blockers

## Default Checks

Use relevant existing gates:

- `bash -n <script>` for shell scripts
- `node --check <script>` for JavaScript scripts
- `npm run check:seis-agent-plugin-integration`
- `npm run check:seis-command-center`
- `npm run check:seis-god-mode-validation-plan`
- package-local tests for touched automation code
