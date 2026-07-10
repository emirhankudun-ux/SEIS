# SEIS Public Demo Reviewer Quickstart

## Purpose

This quickstart gives GitHub reviewers a short, safe path for opening the
current SEIS public demo without needing API keys, SSH access, deployment
access, provider accounts, private vaults, or host shell execution.

Use this page when the reviewer needs a fast entry point. Use
[`SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md`](./SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md)
when the reviewer needs the full seven-minute operator script.

## Start The Demo

From the repository root:

```bash
python3 -m http.server 50951 --bind 127.0.0.1 --directory apps/web
```

Open the reviewer landing route:

```text
http://127.0.0.1:50951/seis-linux-replica-public-demo.html
```

Open the live shell directly:

```text
http://127.0.0.1:50951/seis-linux-replica.html?demo=live
```

The `?demo=live` route auto-enters the browser-local SEIS shell and starts the
guided live demo surface.

## Reviewer Path

1. Confirm the boot/login sequence completes without an account prompt.
2. Open `Live Demo Console` and use it as the guided launcher.
3. Open `Demo Readiness` and review the local evidence gates.
4. Open `Reference Vault` and launch one supplied local reference module.
5. Open `Terminal` and run `live`, `readiness`, and `sources`.
6. Open Search, Code, Design, Cloud, Store, Music, and AI Core from the dock,
   side rail, launcher, or Live Demo Console.
7. Confirm the UI labels live/local/mock/disabled states instead of claiming
   unavailable production integrations.
8. On mobile width, confirm windows stay inside the viewport and the launcher
   remains usable.

## What Is Real

- Browser-local boot/login, shell, dock, launcher, taskbar, windows, and session
  state.
- Live Demo Console and Demo Readiness panels.
- Reference Vault catalog backed by supplied local reference-bank routes.
- Browser-local terminal history and demo commands.
- Local static routes under `apps/web`.

## What Is Local Demo Or Mock-Safe

- AI provider and model-router status.
- Cloud/SSH health and deployment panels.
- Store install state.
- Music player state.
- Code check output and design token save flows.

## What Is Disabled

- Real SSH execution.
- `sudo` and host shell access.
- Deployment commands.
- Live provider calls from the browser.
- Frontend API-key storage.
- Secret or credential handling.

## Supplied Asset Boundary

The supplied ZIP/reference-bank assets are production demo inputs. Do not delete,
rewrite, or replace them during demo polish.

Current public-demo evidence expects:

- `219` supplied reference modules.
- `148` modules from `stitch_web_based_linux_desktop`.
- `71` modules from `stitch_yapay_zeka_web_platformu`.
- Route and thumbnail paths valid from the `apps/web` static root.

If these counts change, document why and rerun the focused route checks before
claiming public-demo readiness.

## Focused Checks

Use the fast static checks first:

```bash
node scripts/check-seis-linux-replica-public-walkthrough.mjs
node scripts/check-seis-static-demo-routes.mjs
```

Use the browser smoke check when local browser/server permissions are available:

```bash
npm run check:seis-linux-replica-browser-smoke
```

Do not claim a public release, deployment, GitHub Pages publication, live AI,
live SSH, or production cloud readiness from this quickstart alone.

## Reviewer Decision

The quickstart supports demo review if:

- the local routes open,
- the guided panels are visible,
- supplied reference modules load,
- the terminal demo commands respond,
- local/mock/disabled states are explicit,
- no credentials are required,
- no host shell, SSH, deployment, or provider call is executed.

If any item fails, keep the demo in review mode and record the failure in the
next PR queue instead of claiming public readiness.
