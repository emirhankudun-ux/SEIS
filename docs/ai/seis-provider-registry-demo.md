# SEIS Provider Registry Demo

## Purpose

`apps/web/seis-provider-registry.html` is a standalone browser-local provider registry wall for SEIS AI Core. It makes provider metadata visible without calling providers, validating credentials, performing network health checks, executing SSH, deploying, training models or mutating GitHub.

## What exists

- provider id and provider name for SEIS Local Demo Runtime, Codex Operator Session, OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Mistral, Groq, Cohere, Hugging Face, Replicate, Together, Perplexity and Qwen.
- Type labels for `local`, `cloud`, `hybrid`, `local-or-cloud` and `supervised` providers.
- type labels for `local`, `cloud`, `hybrid`, `local-or-cloud` and `supervised` providers.
- requires key values for every provider profile.
- demo status and live status using `Available`, `Missing Key`, `Disabled`, `Rate Limited` and `Error` semantics.
- Environment variable name metadata such as `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`, `GROQ_API_KEY`, `COHERE_API_KEY`, `HF_TOKEN`, `REPLICATE_API_TOKEN`, `TOGETHER_API_KEY` and `PERPLEXITY_API_KEY`.
- Supported tasks, unavailable reasons, safety notes, frontend exposure risk, backend requirement and future integration notes.
- Search, state filters, selectable provider cards, selected-provider detail panel and browser-local activity log.
- Local state under `seis.provider.registry.demo.v1`.

## What is real

- The static HTML/CSS/JavaScript page loads without a build step.
- Search, filters, provider cards, state cards, quick actions and local state are interactive.
- The UI distinguishes Missing Key from Error.
- Provider metadata is displayed without exposing secrets.

## What is mock or metadata-only

- Provider statuses are demo metadata for review.
- Cloud providers are not contacted.
- Credential presence is not validated.
- Local Ollama is not contacted.
- Rate Limited and Error are future live-adapter states, not active runtime evidence.

## What is blocked

- Browser-exposed provider secrets.
- Direct frontend live provider calls.
- Silent fallback from local/private mode to cloud.
- Live provider routing without server-only adapters, redacted logs, no-key startup tests and human approval.

## Source alignment

This demo is aligned with existing provider registry sources:

- `content/development/seis-ai-core-provider-registry.json`
- `docs/ai/seis-ai-core.md`
- `docs/ai/model-router.md`
- `docs/audits/ai-provider-audit.json`
- `scripts/check-seis-ai-core-provider-registry.mjs`

Those files remain the authoritative registry and validation sources. This page is a browser-local product demo surface.

## How to run

```sh
open apps/web/seis-provider-registry.html
```

No dependency install, provider key, SSH key, network access or local model runtime is required.

## How to validate

```sh
node scripts/check-seis-provider-registry-demo.mjs
```

Recommended focused checks:

```sh
node --check scripts/check-seis-provider-registry-demo.mjs
node scripts/check-seis-provider-registry-demo.mjs
git diff --check -- apps/web/seis-provider-registry.html docs/ai/seis-provider-registry-demo.md scripts/check-seis-provider-registry-demo.mjs
```

## Security notes

- No secrets are embedded.
- No API keys are required.
- No private keys are referenced.
- No provider calls are made.
- No credential validation is performed.
- No network, SSH, deployment, inference or GitHub mutation path exists.
- Browser state is disposable and not authoritative provider readiness evidence.

## Next safe action

After this page lands, link it from the unified demo launcher or Command Center. Real provider adapter work should wait for backend-only validation, redacted logs, no-key startup tests, local-only fallback tests, client bundle secret checks and human approval.
