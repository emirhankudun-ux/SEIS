# SEIS AI Core Foundation Demo

## Purpose

`apps/web/seis-ai-core-foundation.html` is a standalone browser-local AI Core foundation demo. It makes the existing SEIS AI Core contracts visible as an interactive surface without changing the provider registry, calling providers, validating credentials, executing SSH, training models or claiming live AI.

## What exists

- Provider registry cards for Local Demo, supervised Codex session, OpenAI, Anthropic, Gemini and Ollama/local model lanes.
- Model router simulator for repo audit, coding, design critique, security review, local/private mode and future live cloud requests.
- Prompt engine preview with versioned prompt-pack metadata.
- Safety gates for no-key startup, local-only fallback, server-only environment validation, redacted routing logs, client secret scans, prompt-pack schema and human approval.
- Browser-local activity log.
- Local state persistence under `seis.ai.core.foundation.demo.v1`.
- Honest state labels for `Available`, `Missing Key`, `Disabled`, `planned`, `blocked`, `demo-only` and `local-demo`.

## What is real

- The static HTML/CSS/JavaScript page loads without a build step.
- Tabs, search, provider cards, route decisions, prompt cards, gate cards, drawer, quick actions and toasts are interactive.
- The page uses `localStorage` for disposable browser-local state.
- The demo works with zero cloud provider keys.

## What is mock or demo-only

- Provider registry status shown in the page is explanatory demo metadata.
- Model router decisions are deterministic local explanations, not live model execution.
- Prompt engine cards are metadata previews, not executed prompts.
- Activity logs are local UI events only.

## What is blocked

- Live cloud AI routing.
- Credential validation.
- Provider health checks.
- SSH or deployment execution.
- Model downloads, inference, fine-tuning or foundation-model claims.
- Silent fallback from local/private mode to cloud providers.

## Source alignment

This page is aligned with existing source-of-truth contracts:

- `docs/ai/seis-ai-core.md`
- `docs/ai/model-router.md`
- `docs/ai/prompt-engine.md`
- `content/development/seis-ai-core-provider-registry.json`

Those files remain authoritative for the current AI Core status. This page is a demo/readiness surface only.

## How to run

Open the static file directly:

```sh
open apps/web/seis-ai-core-foundation.html
```

No dependency install, provider key, SSH key or network access is required.

## How to validate

Run the focused validator:

```sh
node scripts/check-seis-ai-core-foundation-demo.mjs
```

Recommended focused checks for this change:

```sh
node --check scripts/check-seis-ai-core-foundation-demo.mjs
node scripts/check-seis-ai-core-foundation-demo.mjs
git diff --check -- apps/web/seis-ai-core-foundation.html docs/ai/seis-ai-core-foundation-demo.md scripts/check-seis-ai-core-foundation-demo.mjs
```

## Security notes

- No secrets are embedded.
- No API keys are required.
- No private keys are referenced.
- No network calls are made by the page.
- No provider, SSH, deployment, training or inference execution path is present.
- Browser state is disposable and must not be treated as authoritative evidence.

## Next safe action

After this page lands, connect it from the unified demo launcher or Command Center. Live provider work should wait for backend-only environment validation, redacted routing decision logs, no-key startup tests, local-only fallback tests and human approval.
