# AI Core Browser Evidence Gates

## Purpose

Define how SEIS validates browser-run AI Core evidence and browser-run AI Core
QA evidence without making CI depend on a local Chrome/Chromium binary or any
live AI provider.

Canonical validator phrase: browser-run AI Core QA evidence.

## Scope

This document covers the `apps/seis-core` AI Core panel navigation evidence
path, the metadata-only CI gate, the local browser artifact gate, and the
manual GitHub Actions browser evidence workflow.

## Current Status

| Gate | Command | Environment | Browser Required | Writes Reports | Provider Access |
| --- | --- | --- | --- | --- | --- |
| Metadata drift gate | `npm run check:ai-core-browser-qa-evidence` | CI and local | No | No | No |
| Aggregate metadata gate | `npm run check:ai-core-eval-evidence` | CI and local | No | No | No |
| Browser artifact gate | `npm run qa:seis-core:ai-core-evidence` | Local or browser-enabled runner | Yes | Ignored `reports/tmp/` only | No |
| Manual browser workflow | `.github/workflows/ai-core-browser-evidence.yml` | `workflow_dispatch` only | Yes | Uploaded ignored `reports/tmp/` artifact | No |
| Browser runner only | `npm run qa:seis-core:ai-core-panels` | Local or browser-enabled runner | Yes | Ignored `reports/tmp/` only | No |

## CI Policy

The default GitHub workflow runs `npm run quality:governance`. That chain may
include `npm run check:ai-core-browser-qa-evidence` because it is metadata-only:
it checks committed reports, scripts, schema, generated fixture reports, docs,
and ignored-artifact policy without launching a browser.

Default CI must not run `npm run qa:seis-core:ai-core-evidence`. The separate
manual browser workflow may run it only through `workflow_dispatch`, with
Chrome/Chromium verification, read-only repository permission, mock/local-only
environment, pinned actions, bounded timeout, and short artifact retention.
The browser-enabled workflow is documented in
`docs/evals/ai-core-browser-ci-proposal.md`,
`docs/evals/ai-core-browser-ci-workflow-draft.md`,
`docs/evals/ai-core-browser-ci-activation-approval.md`, and
`.github/workflows/ai-core-browser-evidence.yml`.

## Local Browser Policy

For local browser evidence, run:

```bash
npm run qa:seis-core:ai-core-evidence
```

The command starts a local HTTP server, opens a Chrome/Chromium-compatible
browser, writes DOM/JSON/manifest artifacts under
`reports/tmp/seis-core-ai-core-panel-navigation/`, then validates those
artifacts with `--require-artifacts`.

If Chrome/Chromium is not auto-detected, set:

```bash
SEIS_BROWSER_BIN=/path/to/chrome npm run qa:seis-core:ai-core-evidence
```

## Evidence Requirements

The browser artifact gate must prove:

- Desktop scenario `desktop-ai-core-panel-navigation` runs at `1440x900`.
- Mobile scenario `mobile-ai-core-panel-navigation` runs at `390x844`.
- Step order is `initial-dashboard`, `sidebar-ai-core`,
  `command-palette-ai-core`, `global-search-ai-core`.
- AI Core view and navigation state are active after every AI Core navigation
  step.
- Model route, prompt, agent task, approval, retrieval, no-content transcript,
  and evidence panels contain fixture-backed cards.
- Safety flags remain false for provider calls, raw-content return, persistent
  memory writes, and privileged actions.
- The validator-facing phrase `persistent memory writes` remains present in
  this document so evidence gates fail fast if the memory-write boundary is
  removed or softened.
- Artifacts stay under ignored `reports/tmp/` paths.
- Non-claims explicitly exclude live providers, live retrieval, embeddings,
  memory writes, raw content, GitHub writes, SSH, deployment, payment, and
  infrastructure mutation.

## Failure Handling

- If `npm run check:ai-core-browser-qa-evidence` fails, fix stale reports or
  broken metadata before running the browser path.
- If the browser artifact gate fails because no browser is available, do not
  mark the product broken; record browser availability as an environment
  limitation and continue with metadata gates.
- If the browser artifact gate fails after a browser run, treat it as evidence
  drift and inspect the generated JSON report under `reports/tmp/`.

## Non-Claims

These gates do not prove live provider routing, live retrieval, backend
integration, cross-browser certification, benchmark performance, model safety,
SEIS-owned model training, checkpoint validity, deployment readiness, or
production availability.

## Related Documents

- `reports/evals/ai-core-panel-navigation-browser-qa.md`
- `.github/workflows/ai-core-browser-evidence.yml`
- `docs/evals/ai-core-browser-ci-proposal.md`
- `docs/evals/ai-core-browser-ci-activation-approval.md`
- `docs/evals/ai-core-browser-ci-workflow-draft.md`
- `docs/evals/evaluation-strategy.md`
- `apps/seis-core/README.md`
- `packages/evals/README.md`
- `roadmap/seis-ai-core-command-center-5-year-development-program.md`

## Next Safe Action

Run `.github/workflows/ai-core-browser-evidence.yml` manually with
`workflow_dispatch`, review the uploaded artifact package, and keep it out of
branch protection until first-run evidence is accepted.
