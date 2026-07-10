# SEIS Remote Codex CLI Bridge

This runbook binds the local SEIS SSH surface to the remote Codex CLI available
inside the cloud workspace.

The bridge is intentionally read-only by default. It proves that `SEIS-SSH`
reaches a cloud runtime where `/workspaces/SEIS`, `git`, and `codex` are
available. It does not run a Codex prompt, mutate the remote repo, push a
branch, deploy, or publish anything.

## Bridge Shape

```text
local Codex / ChatGPT
  -> SEIS-SSH
  -> cloud workspace
  -> /workspaces/SEIS
  -> codex --version
```

The default target stays:

```text
SEIS-SSH
```

The remote repo path stays:

```text
/workspaces/SEIS
```

## Status Commands

Use the status command for a read-only JSON bridge report:

```bash
npm run cloud:ssh:remote-codex:status
```

Use the strict command when a handoff needs a pass/fail gate:

```bash
npm run cloud:ssh:remote-codex:strict
```

The strict command may open a live SSH session to run only safe status checks:

- `hostname`
- `whoami`
- `test -d /workspaces/SEIS`
- `git status --short --branch --untracked-files=no`
- `git remote get-url origin` classified as GitHub/missing/other
- `codex --version`

It does not execute `codex` with a prompt.

## Allowed Claims

- `SEIS-SSH` can reach a cloud runtime when the strict bridge passes.
- The remote SEIS checkout exists when `/workspaces/SEIS` is present.
- Remote Codex CLI is available when the report includes a `codexVersion`.

## Blocked Claims

- Do not claim autonomous remote work was performed from this status check.
- Do not claim prompt execution unless a separate, approval-gated command ran.
- Do not claim branch publication unless GitHub push or PR evidence exists.
- Do not claim mobile 24/7 direct-cloud readiness unless the direct-cloud
  doctor passes.

## Approval Gates

Human approval is still required for:

- running a remote Codex prompt
- editing files on the remote workspace
- committing, pushing, merging, or opening releases from the remote runtime
- installing packages or changing the remote runtime
- printing or exporting any credential-bearing environment

## Validation

```bash
npm run cloud:ssh:remote-codex:strict
npm run check:seis-ssh-closed-runtime
npm run check:seis-ssh-public-access
git diff --check
```
