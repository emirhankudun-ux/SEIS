# SEIS Linux Replica Live Demo Review

## Scope

This review packet covers the browser-local `apps/web/seis-linux-replica.html`
demo route and its supplied reference-bank integration.

The slice is intentionally narrow:

- preserve all supplied ZIP/reference-bank code
- keep the demo static and local-first
- avoid SSH, deployment, provider calls, and host shell execution
- prove desktop and mobile usability with the focused browser smoke check

## Demo Route

Run locally:

```bash
cd apps/web
python3 -m http.server 50951 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:50951/seis-linux-replica.html
```

Public-demo deep link:

```text
http://127.0.0.1:50951/seis-linux-replica.html?demo=live
```

Public reviewer entry route:

```text
http://127.0.0.1:50951/seis-linux-replica-public-demo.html
```

The deep link auto-enters the browser-local shell and starts the live tour. It
does not enable SSH, deployment, provider calls, API keys, or host shell access.
The main landing page primary OS CTAs and SEIS OS product page CTA point at
this deep link so a public demo viewer can enter the live Linux-like route
directly.

## Public Walkthrough

The public operator walkthrough is maintained at
[`docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md`](../demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md).

It defines the seven minute review flow, what a public viewer should click,
which surfaces are real browser-local behavior, which panels are mock-safe, and
which actions are explicitly disabled. It is intentionally written for GitHub
reviewers who do not have SSH, provider keys, deployment access, or private
vault access.

## Current Evidence

Focused validation command:

```bash
npm run check:seis-linux-replica-browser-smoke
```

Static demo package validation command:

```bash
node scripts/check-seis-static-demo-routes.mjs
```

Public walkthrough validation command:

```bash
node scripts/check-seis-linux-replica-public-walkthrough.mjs
```

Latest verified evidence from the focused smoke check:

| Evidence | Result |
| --- | --- |
| Overall smoke status | `ok: true` |
| Static route package | `10` routes, `15` precache assets |
| Public demo entry route | `seis-linux-replica-public-demo.html` |
| Public demo entry CTA clickthrough | `seis-linux-replica-public-demo.html` -> `/seis-linux-replica.html?demo=live` |
| Public demo entry CTA shell auto-enter | `true` |
| Landing live-demo CTA | `./seis-linux-replica.html?demo=live` |
| Landing hero CTA clickthrough | `index.html` -> `/seis-linux-replica.html?demo=live` |
| Landing CTA shell auto-enter | `true` |
| SEIS OS product page CTA | `../seis-linux-replica.html?demo=live` |
| Desktop app count | `286` |
| Supplied reference modules | `219` |
| Reference sources | `stitch_web_based_linux_desktop: 148`, `stitch_yapay_zeka_web_platformu: 71` |
| Bridge targets | `8` |
| Live Demo Console | `1` |
| Demo Readiness panel | `1` |
| Demo Readiness gates | `6` |
| Demo Readiness actions | `3` |
| Live demo flow steps | `8` |
| Visible reference tiles | `80` |
| Open reference iframe | `1` |
| Open desktop windows | `14` |
| Taskbar apps | `14` |
| Desktop horizontal overflow | `false` |
| Desktop relevant issue count | `0` |
| Deep-link demo intent | `true` |
| Deep-link shell auto-enter | `true` |
| Deep-link Live Demo Console | `1` |
| Deep-link Demo Readiness | `1` |
| Deep-link SSH/host-shell boundary | `true` |
| Product page CTA clickthrough | `seis-os.html` -> `/seis-linux-replica.html?demo=live` |
| Product page CTA shell auto-enter | `true` |
| Mobile viewport | `390 x 844` |
| Mobile widest window | `370` |
| Mobile oversized windows | `0` |
| Mobile side rail fit | `true` |
| Mobile taskbar fit | `true` |
| Mobile horizontal overflow | `false` |

Generated screenshots are written by the smoke check under:

```text
dist/qa/seis-linux-replica-smoke/desktop.png
dist/qa/seis-linux-replica-smoke/mobile.png
```

The smoke check also writes a machine-readable evidence report:

```text
dist/qa/seis-linux-replica-smoke/summary.json
```

The screenshots and JSON summary are validation artifacts, not source assets.

## What Is Real

- Boot and login flow
- SEIS top system bar
- pinned side rail
- taskbar and launcher
- draggable/resizable window shell
- Live Demo Console
- Demo Readiness evidence board
- browser-local terminal UI
- browser-local VFS state
- Search Gateway scopes
- Code, Design, Cloud, Store, Music, AI Core, Website bridge panels
- Reference Vault catalog
- iframe-backed reference module opening
- desktop and mobile smoke evidence

## What Is Local Demo / Mock-Safe

- AI Core provider state
- Cloud health refresh
- Store install state
- Music player state
- Design token save state
- Code local check output

These features update browser-local state only and do not call external
providers, SSH, deployment endpoints, or host shell commands.

## Explicitly Disabled

- SSH execution
- `sudo`
- host OS shell access
- deployment
- live provider/API-key calls from the browser
- secret storage in frontend state

## Reference-Bank Integrity

The focused smoke check now evaluates
`apps/web/reference-banks/reference-apps.js` and validates every populated route
and thumbnail path from the `apps/web` static serving root.

This protects the demo from silently shipping broken Reference Vault cards.

## Mobile Readiness

The mobile smoke pass opens the Live Demo Console, Reference Vault, and
Terminal at a `390 x 844` viewport, verifies the launcher, and asserts that:

- windows fit inside the viewport
- no oversized window remains
- side rail fits
- taskbar fits
- no horizontal overflow is present
- local-only boundary copy remains visible

## Security Notes

- No real API keys were added.
- No provider calls were implemented.
- No SSH commands were executed.
- No deployment commands were executed.
- No supplied ZIP/reference-bank code was deleted or rewritten.

## Rollback Plan

This review slice can be reverted by reverting:

- `README.md`
- `apps/web/seis-linux-replica.html`
- `scripts/check-seis-linux-replica-browser-smoke.mjs`
- `scripts/check-seis-static-demo-routes.mjs`
- `scripts/check-seis-linux-replica-public-walkthrough.mjs`
- `docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md`
- `docs/reviews/SEIS_LINUX_REPLICA_LIVE_DEMO_REVIEW.md`

Do not remove `apps/web/reference-banks/` as part of this rollback; those files
are supplied demo inputs.

## PR Recommendation

Suggested PR title:

```text
fix(seis): harden Linux replica live demo evidence
```

Suggested verification checklist:

- [ ] `node --check scripts/check-seis-linux-replica-browser-smoke.mjs`
- [ ] `node --check scripts/check-seis-linux-replica-public-walkthrough.mjs`
- [ ] `node scripts/check-seis-linux-replica-public-walkthrough.mjs`
- [ ] `node scripts/check-seis-static-demo-routes.mjs`
- [ ] `npm run check:seis-linux-replica-browser-smoke`
- [ ] `git diff --check`

## Remaining Work

- isolate this slice from unrelated dirty worktree changes before PR
- wire the static route checker into package scripts or CI after unrelated
  `package.json` worktree changes are isolated
- decide whether screenshot artifacts should be attached to release notes,
  retained in generated reports, or left untracked
- promote the public walkthrough into a release note or GitHub Pages entry after
  the broader public demo release gate is green
