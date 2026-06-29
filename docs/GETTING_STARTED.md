# Getting Started with SEIS

## What SEIS is

SEIS is an AI-native creative engineering ecosystem with premium web demo surfaces and a long-horizon operating model. The local demo is usable without API keys and is designed for safe contributor onboarding.

## Requirements

- macOS / Linux / Windows machine for local repo work
- Node.js only if you run local scripts that require it
- `git`
- Any modern browser

## Clone

```bash
git clone <repository-url>
cd SEIS
```

## Install

For plain web demo routes, no install is required unless you run repo scripts.

```bash
cd apps/web
python3 -m http.server 50951 --bind 127.0.0.1
```

## Run dev server

- Open `http://127.0.0.1:50951/desktop.html`
- Preferred deep link: `http://127.0.0.1:50951/seis-linux-replica.html?demo=live`

## Build / validation (repo scripts)

- `npm run check:desktop-os`
- `npm run check:seis-second-brain`
- `npm run check:seis-obsidian-safe-import-dry-run`
- `npm run check:seis-second-brain-readiness-contracts`

Run these only where dependencies are available in your checkout.

## Demo mode

SEIS local demo includes labeled **Local Demo Mode** for AI and terminal surfaces. If provider keys are not configured, core interactions continue as demo/safety mode.

## Optional local AI / Ollama

Ollama is optional. If installed, you can route local-only docs/reasoning workflows through separate local tooling. No setup is required for the core demo.

## Optional Obsidian vault

Open `seis-brain/vault` in Obsidian for repository memory context. Use plain Markdown and internal links. No plugins are required.

## Optional SEIS-SSH docs

Read and use `SEIS_SSH.md` and `docs/SEIS_SSH_SETUP.md` for remote-work concepts. Real credentials are never committed.

## Troubleshooting quick starts

- Missing route: verify you are serving from `apps/web` and using correct file path.
- Broken links/assets: run the local script checks above.
- Script missing: check `package.json` scripts and environment, then report in `docs/TROUBLESHOOTING.md`.

## Next steps

- Read `SEIS_SECOND_BRAIN.md` and `SEIS_OBSIDIAN_VAULT.md`
- Review `docs/PUBLIC_READINESS.md`
- Continue with roadmap-linked phase notes under `roadmap/`
