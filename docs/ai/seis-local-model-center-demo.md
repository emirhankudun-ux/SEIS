# SEIS Local Model Center Demo

## Purpose

`apps/web/seis-local-model-center.html` is a standalone browser-local demo for the SEIS Local AI / Ollama layer. It makes local model planning visible without requiring cloud provider keys, paid APIs, model downloads, real inference, SSH or network access.

## What exists

- local model registry with Ollama, Small Model Mode, Long Context Local Lane, Local Router Fallback, Model Card Gate and Offline Demo Fixture.
- local model status labels for `available`, `mock`, `planned`, `blocked`, `disabled` and `local-demo`.
- Local endpoint documentation for `http://localhost:11434` without connecting to it.
- Offline/demo mode prompt testing with deterministic mock AI responses.
- Local model router fallback that keeps `cloudFallback=false`.
- Local AI task lanes for repo summarization, prompt generation, documentation generation, architecture planning, code review assistance, SEIS memory reconstruction, design critique drafts, PR summaries, command explanations and mock AI responses.
- Long context continuation protocol using `CONTINUE_FROM` and `DEVAM`.
- Browser-local state under `seis.local.model.center.demo.v1`.

## What is real

- The HTML/CSS/JavaScript page loads without a build step.
- Tabs, search, cards, prompt testing, drawer, quick actions, toasts and local activity logs are interactive.
- State is stored in browser `localStorage` only.
- The demo requires no API keys or local model install.

## What is mock or planned

- Model registry entries are readiness metadata, not installed model evidence.
- Prompt output is deterministic mock output, not live Ollama inference.
- The Ollama endpoint is documented but not contacted.
- Small Model Mode and Long Context Local Lane are planning lanes until local runtime evidence exists.

## What is blocked

- Model downloads.
- Real local inference claims.
- Cloud fallback from local/private mode.
- SSH, provider calls or GitHub mutation.
- Model promotion without model cards, license review, safety notes, hardware benchmarks and human approval.

## Source alignment

This demo is aligned with existing local AI notes:

- `seis-brain/vault/04_AI/Ollama.md`
- `seis-brain/vault/08_Prompts/Ollama Continuation Protocol.md`
- `docs/development/local-ai-workbench.md`
- `apps/web/wow-pages/imported/SEIS_WOW_MORE_PAGES_PART5/html/121_local_model_center.html`
- `apps/web/wow-pages/imported/SEIS_WOW_MORE_PAGES_PART5/html/122_ollama_manager.html`

Those files remain authoritative reference material. This page is a browser-local product demo surface.

## How to run

```sh
open apps/web/seis-local-model-center.html
```

No dependency install, provider key, SSH key, local model runtime or network access is required.

## How to validate

```sh
node scripts/check-seis-local-model-center-demo.mjs
```

Recommended focused checks:

```sh
node --check scripts/check-seis-local-model-center-demo.mjs
node scripts/check-seis-local-model-center-demo.mjs
git diff --check -- apps/web/seis-local-model-center.html docs/ai/seis-local-model-center-demo.md scripts/check-seis-local-model-center-demo.mjs
```

## Security notes

- No secrets are embedded.
- No API keys are required.
- No private keys are referenced.
- No network calls are made.
- No `localhost` request is made.
- No model download, inference, SSH, provider call, deployment or GitHub mutation path exists.
- Browser state is disposable and not authoritative evidence of local runtime readiness.

## Next safe action

After this page lands, link it from the unified demo launcher or Command Center. A real Ollama adapter should wait for explicit approval, local-only privacy rules, user-controlled endpoint checks, model card/license review, hardware benchmarks, redacted logs and human review.
