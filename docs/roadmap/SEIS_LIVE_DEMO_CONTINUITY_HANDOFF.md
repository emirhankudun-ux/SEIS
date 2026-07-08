# SEIS Live Demo Continuity Handoff

Status: Local Demo continuity record
Owner: human maintainer
Date: 2026-07-08

This handoff keeps SEIS demo work portable across machines without restarting
from the supplied ZIP bundles or rewriting existing demo assets.

## Primary Continuation Path

1. Work from GitHub `main` after approved pull requests merge.
2. If a PR has auto-merge enabled but is still blocked, inspect that PR before
   rebuilding the same feature.
3. Preserve the existing browser demo and `apps/web/reference-banks/` assets.
4. Continue with small `agent/*` branches, focused commits, PR review, and
   auto-merge when checks pass.

## Demo Routes To Continue From

| Route | Purpose | Status |
| --- | --- | --- |
| `apps/web/desktop.html` | SEIS Desktop OS entry point | real browser-local demo |
| `apps/web/seis-linux-replica.html` | Linux-like SEIS OS shell | real browser-local demo |
| `apps/web/seis-linux-replica.html?demo=live` | live demo deep link | real browser-local demo path |
| `apps/web/seis-linux-replica-public-demo.html` | public reviewer walkthrough entry | real browser-local route when present |
| `apps/web/website/index.html` | product website hub | real static website route when present |

## Local Run Path

Use the existing local static server path:

```bash
cd apps/web
python3 -m http.server 50951 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:50951/seis-linux-replica.html?demo=live
```

The core demo must remain zero-key and local-first. No provider key is required
for the browser-local demo path.

## What Must Be Preserved

- Do not delete supplied ZIP/reference-bank assets.
- Do not delete screenshots, route thumbnails, `.app` bundles, pinned files, or
  existing user work.
- Do not replace the Linux-like demo with a generic dashboard.
- Do not remove Local Demo labels for AI, SSH, deployment, provider, or cloud
  features unless live evidence exists.
- Do not commit `.env`, private keys, API keys, tokens, service accounts,
  cookies, or host credentials.

## SEIS Product Surface Checklist

The continuation path should keep these modules connected:

- SEIS Desktop OS
- SEIS AI Core
- SEIS Search
- SEIS Code IDE
- SEIS Design Studio
- SEIS Cloud
- SEIS Store
- SEIS Music
- SEIS Launchpad
- SEIS Files
- SEIS Terminal / SSH Center
- SEIS Website
- SEIS Agents
- SEIS Plugins
- SEIS Command Center

## Mock vs Real Status

| Capability | Required label | Current continuation rule |
| --- | --- | --- |
| Desktop shell | real browser-local | may use localStorage/session state |
| AI Core | Local Demo mode | no live provider claim without backend evidence |
| Search | mock or browser-local | label mock results clearly |
| Code IDE | browser-local or mock-safe | do not claim repository mutation unless wired |
| Design Studio | browser-local or mock-safe | export/save actions may be local-only |
| Cloud | mock, disabled, planned, or verified | only show connected when verified |
| Terminal / SSH Center | local demo, disabled, or planned | No SSH is executed without approval |
| Provider routing | Missing Key, Disabled, Error, or Available | do not confuse Missing Key with Error |
| Deployment | disabled or approval-needed | no deployment claim without approval |

## Auto-Merge Continuity

The GitHub workflow exists so machine changes do not reset progress:

1. Create a focused `agent/*` branch from a clean `main`.
2. Commit only the intended files.
3. Push the branch to GitHub.
4. Open a PR against `main`.
5. Enable auto-merge when the PR is safe and checks can decide final merge.
6. If auto-merge is blocked, leave the PR open and record the blocker instead
   of duplicating work in another checkout.

Never push directly to `main`, force push, or manually merge without explicit
human approval.

## Validation To Run For This Handoff

```bash
node scripts/check-seis-live-demo-continuity-handoff.mjs
```

Useful follow-up checks when the corresponding files are present:

```bash
node scripts/check-seis-static-demo-routes.mjs
node scripts/check-seis-linux-replica-public-walkthrough.mjs
npm run check:seis-linux-replica-browser-smoke
```

Only claim checks that were actually run.

## Human Approval Needed

- Live SSH execution.
- Deployment or DNS changes.
- Provider API key setup.
- Real model routing or live AI inference.
- Browser smoke approval for public demo release.
- Any destructive cleanup of old clones, worktrees, screenshots, `.app`
  bundles, ZIP bundles, or reference-bank assets.
- Manual merge if auto-merge is blocked.

## Recommended Next PR Queue

1. Keep open auto-merge PRs moving by resolving only their reported blockers.
2. Add a no-key browser smoke snapshot for `seis-linux-replica.html?demo=live`.
3. Promote the public reviewer route once its checks are green on `main`.
4. Add mobile viewport evidence for Launchpad, Files, Terminal, AI Core,
   Search, Code, Design, Cloud, Store, Music, and Website modules.
5. Add one small premium UI improvement at a time instead of rebuilding the
   whole shell.

## Final Decision

Ready for internal review.
