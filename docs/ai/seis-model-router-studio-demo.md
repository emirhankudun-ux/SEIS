# SEIS Model Router Decision Studio Demo

## Purpose

`apps/web/seis-model-router-studio.html` is a standalone browser-local decision studio for the SEIS read-only model router contract. It explains provider-neutral routing decisions without sending prompts, validating credentials, calling providers, exposing browser secrets, routing private Obsidian content, executing SSH or mutating GitHub.

## What exists

- Task type coverage for repo audit, coding, debugging, refactoring, architecture, UI/UX design, design critique, documentation, security review, accessibility review, prompt refinement, local/offline mode, quick summary, long planning, PR summary, CI failure diagnosis, GitHub governance, design system generation, search indexing, creative concepting, motion/3D planning and demo packaging.
- task type and capability label are explicit fields in every generated decision.
- Capability label, privacy mode, provider state, selected provider, selected model, route eligibility, fallback policy and blocked reasons for every generated decision.
- Provider states for `Available`, `Missing Key`, `Disabled`, `Rate Limited`, `Error` and `Unknown`.
- Local-only mode with `localOnlyCanUseCloud=false`.
- Explicit `silentFallback=false` and `executionPerformed=false` decision integrity.
- Evidence gates before live routing: backend-only provider mediation, server-only provider registry, typed environment validation, no-key startup fixture, local-only fallback fixture, rate-limit fixture, invalid credential fixture, redacted routing decision log, client bundle secret exposure check, safety eval evidence and human approval.
- Browser-local state under `seis.model.router.studio.demo.v1`.

## What is real

- The static HTML/CSS/JavaScript page loads without a build step.
- Task cards, decision inputs, quick actions, search, gates, logs and localStorage persistence are interactive.
- Every generated decision keeps `executionPerformed=false`.
- Missing Key is distinct from Error.
- Local-only mode blocks cloud fallback.

## What is mock or read-only

- Decisions are deterministic local explanations, not runtime route execution.
- Provider state is selected as a fixture value, not fetched from any provider.
- No prompt body is accepted or stored.
- No provider credential is accepted or checked.

## What is blocked

- Live provider calls.
- Credential validation.
- Browser provider secrets.
- Silent fallback.
- Private Obsidian vault routing.
- 20B, 70B, 150B, 300B+, 512B or future model-class routing.
- Live routing without backend-only mediation, redacted logs, safety evidence and human approval.

## Source alignment

This demo is aligned with existing model router contracts:

- `docs/ai/model-router.md`
- `docs/ai/read-only-model-router-contract.md`
- `content/development/seis-read-only-model-router-contract.json`
- `reports/seis-public-demo/read-only-model-router-decision-latest.md`

Those files remain the authoritative contract sources. This page is a browser-local product demo surface.

## How to run

```sh
open apps/web/seis-model-router-studio.html
```

No dependency install, provider key, SSH key, network access or local model runtime is required.

## How to validate

```sh
node scripts/check-seis-model-router-studio-demo.mjs
```

Recommended focused checks:

```sh
node --check scripts/check-seis-model-router-studio-demo.mjs
node scripts/check-seis-model-router-studio-demo.mjs
git diff --check -- apps/web/seis-model-router-studio.html docs/ai/seis-model-router-studio-demo.md scripts/check-seis-model-router-studio-demo.mjs
```

## Security notes

- No secrets are embedded.
- No API keys are required.
- No private keys are referenced.
- No network calls are made.
- No provider calls are made.
- No credential validation is performed.
- No prompt body, private Obsidian content, SSH data, deployment path or GitHub mutation path exists.
- Browser state is disposable and not authoritative runtime evidence.

## Next safe action

After this page lands, link it from the unified demo launcher or Command Center. Real model router runtime work should wait for backend-only provider mediation, no-key startup tests, local-only fallback tests, redacted routing decision logs, client bundle secret checks, safety eval evidence and human approval.
