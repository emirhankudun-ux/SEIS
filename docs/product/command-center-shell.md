# SEIS Command Center Shell

Date: 2026-06-20

The Command Center shell is the static, non-LLM app root for the SEIS platform
foundation. It gives the repository a local operating surface before any live
GitHub, SSH, deployment, model-provider, release, or external automation
integration exists.

Generated app root:
[`../../apps/command-center/index.html`](../../apps/command-center/index.html)

Structured source:
[`../../content/development/seis-command-center-shell.json`](../../content/development/seis-command-center-shell.json)

Generator and check:
[`../../scripts/create-command-center-shell.mjs`](../../scripts/create-command-center-shell.mjs)

## Current Scope

| Module | Status | Evidence |
| --- | --- | --- |
| Goal Tracking Center | active | Generated local page and view model exist. |
| Repository Hygiene | blocked | Missing governance files and tracked deletions remain unresolved. |
| Roadmap Center | active | Master backlog and next PR queue exist. |
| Evidence Locker | active | Structured evidence ledger exists. |
| Approval Center | planned | Approval workflow docs exist; no live controls are exposed. |
| Release And Public Readiness | blocked | Dry-run system exists, but readiness is blocked by repository hygiene. |
| AI Core Foundation | planned | AI Core review exists without provider or model overclaims. |
| Documentation Hub | active | Docs index and status are current navigation surfaces. |

## Guardrails

- The shell links only to local docs and generated local pages.
- It does not perform external API calls.
- It does not run SSH, deployment, release, model training, benchmarks, or
  dataset downloads.
- It does not expose fake live controls.
- Blocked readiness states remain visible.

## Validation

Run:

```bash
npm run automation:command-center-shell
npm run check:command-center-shell
```

The checker validates the shell source, required modules, blocked-state
visibility, repo-relative paths, generated HTML freshness, and absence of fake
progress controls.
