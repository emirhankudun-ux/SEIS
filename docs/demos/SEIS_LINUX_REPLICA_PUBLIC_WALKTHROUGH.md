# SEIS Linux Replica Public Walkthrough

## Purpose

This walkthrough is the public operator script for the browser-local SEIS Linux
Replica demo. It exists so a reviewer can run the demo from GitHub/local files
without needing SSH, API keys, provider accounts, deployment access, private
vaults, or host shell execution.

The walkthrough preserves the supplied ZIP/reference-bank material. It does not
replace, delete, or rewrite the source assets under `apps/web/reference-banks/`.

## Demo Entry

From the repository root:

```bash
python3 -m http.server 50951 --bind 127.0.0.1 --directory apps/web
```

Open:

```text
http://127.0.0.1:50951/seis-linux-replica.html?demo=live
```

The `?demo=live` deep link auto-enters the browser-local shell and opens the
guided live demo surface.

Reviewer landing route:

```text
http://127.0.0.1:50951/seis-linux-replica-public-demo.html
```

Use this route when a public reviewer needs a concise entry page before opening
the live shell. It summarizes the demo flow, safety boundaries, current evidence,
and supplied asset contract from inside the static `apps/web` site.

## Interactive Reviewer Console

The public route includes an Interactive Reviewer Console before the seven-minute
script. It is a browser-local helper for reviewers, not a release approval gate.
It persists only the local checklist state in
`seis.publicDemoReviewerConsole.v1`.

Console actions:

- `Open live SEIS shell` opens `seis-linux-replica.html?demo=live` in a new tab
  and marks that reviewer step complete.
- `Copy local server command` copies
  `python3 -m http.server 50951 --bind 127.0.0.1 --directory apps/web`.
- `Verify Reference Vault`, `Run terminal commands`, and `Read safety boundary`
  toggle reviewer evidence steps without touching repository files.
- `Export reviewer note` copies a compact note that separates real, Local Demo,
  mock-safe, and disabled surfaces.
- `Reset local checklist` clears only the browser-local reviewer checklist.

The console does not execute SSH, call AI providers, approve public release,
deploy, mutate supplied assets, write to GitHub, or validate host credentials.

## Seven Minute Demo Script

1. Open the reviewer landing route and use the Interactive Reviewer Console to
   copy the local server command, open the live shell, and track progress.
2. Open the live deep link and wait for the SEIS boot/login sequence.
3. Confirm the shell opens with the top system bar, pinned side rail, taskbar,
   launcher, and multiple app windows.
4. Start in `Live Demo Console` and use the step buttons to open the connected
   SEIS surfaces.
5. Open `Demo Readiness` and review the evidence gates, source coverage, local
   mode boundaries, and remaining safe actions.
6. Open `Reference Vault` and launch at least one iframe-backed supplied module.
7. Open `Terminal` and run the browser-local demo commands:

```text
live
readiness
sources
```

8. Open `Search`, `Code`, `Design`, `Cloud`, `Store`, `Music`, and `AI Core`
   from the dock, side rail, launcher, or Live Demo Console.
9. Resize or move windows on desktop. On mobile, verify the shell keeps windows
   within the viewport.
10. Export the reviewer note from the public route if a compact handoff is
   needed.
11. Close with the local-only statement: no SSH, no provider calls, no secrets,
   no deployment, and no host shell access are enabled by this route.

## What Reviewers Should See

| Surface | Expected public-demo behavior |
| --- | --- |
| Boot/login | Real browser UI, no account or network credential required |
| Live Demo Console | Real guided launcher for the connected demo surfaces |
| Demo Readiness | Real browser-local evidence board with readiness gates |
| Reference Vault | Real local catalog backed by supplied reference-bank routes |
| Terminal | Browser-local command simulation only |
| Search | Connected local demo results and module jump surface |
| Code | SEIS-branded IDE demo surface with local/mock-safe state |
| Design | Design studio/tokens demo surface with local/mock-safe state |
| Cloud/SSH | Status concept only, no real SSH execution |
| AI Core | Provider/model-router concept only, no frontend provider keys |

## Real, Local, Mock, Disabled

Real in this route:

- boot/login interaction
- SEIS Linux-like shell
- dock, side rail, launcher, taskbar, windows, and session behavior
- Live Demo Console
- Demo Readiness
- Reference Vault catalog and iframe-backed local module opening
- browser-local terminal UI and demo command history
- Interactive Reviewer Console progress and reviewer note export
- desktop and mobile browser smoke evidence

Local demo or mock-safe:

- AI provider/model-router status
- Cloud/SSH health panels
- Store install state
- Music player state
- Design token save state
- Code local check output

Explicitly disabled:

- real SSH execution
- `sudo`
- host OS shell access
- deployment commands
- live provider/API-key calls from the browser
- secret storage in frontend state

## Supplied Asset Boundary

The supplied ZIP/reference-bank assets are production demo inputs. Do not delete
or overwrite them as part of public-demo polish.

Current review evidence expects:

- `219` supplied reference modules
- `148` modules from `stitch_web_based_linux_desktop`
- `71` modules from `stitch_yapay_zeka_web_platformu`
- valid route and thumbnail paths from the `apps/web` static root

If those counts change, update the review packet with a reason and rerun the
focused smoke check.

## Focused Validation

Use these checks for this walkthrough slice:

```bash
node scripts/check-seis-linux-replica-public-walkthrough.mjs
node scripts/check-seis-static-demo-routes.mjs
npm run check:seis-linux-replica-browser-smoke
```

The browser smoke check starts a local server and headless browser. It may
require local execution permissions that simple syntax checks do not require.

## Public Demo Acceptance Criteria

- The live deep link opens the browser-local shell.
- Live Demo Console is visible.
- Demo Readiness is visible.
- Reference Vault opens local supplied modules.
- Terminal responds to `live`, `readiness`, and `sources`.
- Landing and SEIS OS product CTAs route to `seis-linux-replica.html?demo=live`.
- Mobile smoke evidence shows no horizontal overflow.
- The demo states local/mock/disabled boundaries clearly.
- The Interactive Reviewer Console works without backend services and labels
  its state as browser-local reviewer progress, not release approval.
- No real credentials, provider calls, SSH commands, or deployment actions are
  required.

## PR Notes

Suggested PR title:

```text
docs(seis): add Linux replica public walkthrough
```

Suggested PR scope:

- public walkthrough document
- narrow walkthrough validation script
- README and live-demo review packet links

Rollback is safe by reverting this walkthrough document, the walkthrough check,
and the README/review packet link updates. Do not remove `apps/web/reference-banks/`.
