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

Reference-bank integrity validation command:

```bash
npm run check:seis-reference-banks
```

Static contract validation command for machines without Chrome/Chromium:

```bash
node scripts/check-seis-linux-replica-browser-smoke.mjs --static
```

Latest verified evidence from the focused smoke check:

| Evidence | Result |
| --- | --- |
| Overall smoke status | `ok: true` |
| Static route package | `10` routes, `15` precache assets |
| Landing live-demo CTA | `./seis-linux-replica.html?demo=live` |
| Landing hero CTA clickthrough | `index.html` -> `/seis-linux-replica.html?demo=live` |
| Landing CTA shell auto-enter | `true` |
| SEIS OS product page CTA | `../seis-linux-replica.html?demo=live` |
| Desktop app count | `291` |
| Functional core apps | `67` |
| Enhanced app slots | `35` |
| Enhanced workbenches | `34` |
| SEIS AI Chat alias | `1` |
| Playable local games | `8` |
| Visible functional audit panels | `2` |
| Functional audit metrics | `18` |
| All functional app audit | `67` passed, `0` failed |
| Workbench state flow | `34` snapshots, `34` resets |
| Playable game state flow | `8` resets |
| Supplied reference modules | `219` |
| Reference sources | `Ubuntu Web Desktop: 148`, `Website / AI Platform: 71` |
| Source-focused lane links | `?demo=live&source=website`, `?demo=live&source=ubuntu` |
| Reference thumbnail fallback | `4` missing thumbnails render SEIS placeholders |
| Bridge targets | `8` |
| Live Demo Console | `1` |
| Demo Readiness panel | `1` |
| Demo Readiness gates | `6` |
| Demo Readiness actions | `3` |
| Live demo flow steps | `9` |
| Apple Native Shell capsule | `1`, contained in Linux Replica |
| Apple Native dock symbols | one semantic symbol per compact capsule control |
| Visible Apple Native dock text codes | `0` |
| Window header symbols | one semantic symbol per open window, raw text-glyph marks `0` |
| Launcher category symbols | one semantic symbol per category filter, visible labels `0` |
| Launcher chrome symbols | close, lock, and route controls use semantic icons, visible text codes `0` |
| Topbar action symbols | App Switcher, Search, SEIS App Library, and Arrange Windows use semantic icons, visible text codes `0` |
| Window arrangement | crowded sessions stage at most `6` visible windows; contained Apple Native Shell stays visible when open; overflow remains available from the taskbar |
| SEIS App Library action symbols | hero, tile, index, and detail actions use semantic icons, visible text codes `0` |
| Local utility action symbols | Settings, To-Do, and System Monitor actions use semantic icons, visible text codes `0` |
| Code/SSH action symbols | SEIS Code AI and SEIS SSH Control actions use semantic icons, visible text codes `0` |
| Bridge workspace action symbols | Code, Design, Cloud, Store, Music, AI Core, Website, and bridge hero actions use semantic icons, visible text codes `0` |
| Launchpad quick action symbols | `6`, visible text codes `0` |
| Launchpad card symbols | `96` semantic card symbols (`72` core, `24` Website / Ubuntu sample) |
| SEIS AGI Control panel | `1` |
| SEIS SSH Control panel | `1` |
| Terminal `apps` functional coverage | `true` |
| Terminal `sources` lane coverage | `true` |
| Terminal `live` tour command | `true` |
| Visible reference tiles | `80` |
| Open reference iframe | `1` |
| Open desktop windows | `28` |
| Taskbar apps | `28` |
| Desktop horizontal overflow | `false` |
| Desktop relevant issue count | `0` |
| Deep-link demo intent | `true` |
| Deep-link shell auto-enter | `true` |
| Deep-link Live Demo Console | `1` |
| Deep-link Demo Readiness | `1` |
| Deep-link terminal ready | `true` |
| Deep-link SSH/host-shell boundary | `true` |
| Product page CTA clickthrough | `seis-os.html` -> `/seis-linux-replica.html?demo=live` |
| Product page CTA shell auto-enter | `true` |
| Mobile viewport | `390 x 844` |
| Mobile widest window | `370` |
| Mobile oversized windows | `0` |
| Mobile side rail fit | `true` |
| Mobile taskbar fit | `true` |
| Mobile horizontal overflow | `false` |
| Icon-first side rail | `true` |
| Side rail app symbols | one semantic symbol per pinned app |
| Visible side rail text codes | `0` |
| Icon-first quick actions | About, Demo Readiness, Live Demo, and Launchpad action strips |
| Visible quick action text codes | `0` |
| SEIS AI Chat intent symbols | one semantic symbol per first-interaction chip |
| SEIS AI Chat dock symbols | one semantic symbol per compact dock control |
| Visible AI Chat dock text codes | `0` |

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
- icon-first pinned side rail with semantic app symbols
- icon-first topbar quick actions and browser-local window arrangement
- icon-first About, Demo Readiness, and Live Demo quick actions
- icon-first Files, Editor, App Switcher, and Logs action strips
- icon-first Settings, To-Do, System Monitor, SEIS Code AI, SEIS SSH Control,
  and bridge workspace action strips
- taskbar and launcher
- draggable/resizable window shell
- Live Demo Console
- Demo Readiness evidence board
- Local Functional Audit evidence board
- 67 browser-local functional core apps
- 35 enhanced app slots, split into 34 stateful workbenches and 1 SEIS AI Chat
  compatibility alias
- 34 enhanced workbenches with primary action, VFS snapshot, and reset coverage
- 1 SEIS AI Chat compatibility alias for the legacy `chat` id
- 8 playable local games with action and reset coverage
- browser-local terminal UI
- browser-local VFS state
- Search Gateway scopes
- Code, Design, Cloud, Store, Music, AI Core, Website bridge panels
- icon-first SEIS AI Chat intent chips and dock controls
- SEIS App Library catalog
- contained Apple Native Shell capsule
- icon-first Apple Native capsule dock controls
- Website / AI Platform and Ubuntu Web Desktop reference lanes
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

This protects the demo from silently shipping broken SEIS App Library cards.

The source labels intentionally translate the supplied Stitch ZIP names into
product lanes: `stitch_yapay_zeka_web_platformu` feeds the Website / AI
Platform direction, and `stitch_web_based_linux_desktop` feeds the Ubuntu Web
Desktop route.

## Functional App Integrity

The focused smoke check also evaluates `apps/web/seis-linux-functional-apps.js`
as a separate functional runtime contract. It verifies that the Linux Replica
loads the runtime, delegates generic apps and games to it, exposes
`window.__SEIS_LINUX_REPLICA__.functionalAppIds()`, and renders visible
`Local Functional Audit` evidence in both `Live Demo Console` and
`Demo Readiness`.

Current functional evidence:

- `67` functional core apps are audited.
- `35` enhanced app slots remain in the manifest for compatibility.
- `34` enhanced workbenches render preview, primary action, snapshot, and reset
  controls.
- `1` SEIS AI Chat compatibility alias resolves the legacy `chat` id to the
  Conversation Center instead of a duplicate generic chat surface.
- `8` playable local games render boards, action controls, and reset controls.
- `25` native/local SEIS surfaces expose real controls or runtime markers,
  including the AI Chat alias.
- `34` workbench snapshots, `34` workbench resets, and `8` game resets passed.
- The in-app audit explicitly repeats the no-key boundary: no SSH, sudo,
  provider key, host shell, deployment, private token, or credential action runs
  from this route.

## Mobile Readiness

The mobile smoke pass opens the Live Demo Console, SEIS App Library, and
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
- `scripts/check-seis-reference-banks.mjs`
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
- [ ] `node --check scripts/check-seis-reference-banks.mjs`
- [ ] `npm run check:seis-reference-banks`
- [ ] `node scripts/check-seis-linux-replica-public-walkthrough.mjs`
- [ ] `node scripts/check-seis-linux-replica-browser-smoke.mjs --static`
- [ ] `node scripts/check-seis-static-demo-routes.mjs`
- [ ] `git diff --check`
- [ ] `npm run check:seis-linux-replica-browser-smoke`

## Remaining Work

- isolate this slice from unrelated dirty worktree changes before PR
- wire the static route checker into package scripts or CI after unrelated
  `package.json` worktree changes are isolated
- decide whether screenshot artifacts should be attached to release notes,
  retained in generated reports, or left untracked
- promote the public walkthrough into a release note or GitHub Pages entry after
  the broader public demo release gate is green
