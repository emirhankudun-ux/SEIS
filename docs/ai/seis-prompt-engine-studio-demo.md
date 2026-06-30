# SEIS Prompt Engine Studio Demo

## Purpose

`apps/web/seis-prompt-engine-studio.html` is a standalone browser-local Prompt Engine Studio for SEIS AI Core. It exposes versioned prompt packs, schema fields, allowed actions, forbidden actions, safety boundaries and review gates without executing prompts, calling providers, reading credentials, promoting archived prompts or claiming model training.

## What exists

- Prompt packs for base SEIS identity prompt, repo audit prompt, foundation repair prompt, design system prompt, AI provider audit prompt, PR rescue prompt, CI diagnosis prompt, demo packaging prompt, Web Desktop generation prompt, SEIS Code IDE prompt, security review prompt, accessibility review prompt, Cursor Free efficient prompt, Ollama continuation prompt, Claude Code deep implementation prompt and Codex PR-safe implementation prompt.
- Prompt-pack schema fields: id, title, version, owner area, intended capability, allowed context, denied context, provider capability requirements, output schema, evaluation fixture, rollback note, allowed actions, forbidden actions, safety boundaries and validation method.
- Metadata builder that emits local JSON with `promptExecuted=false`, `providerCalled=false`, `credentialRead=false` and `archivePromoted=false`.
- Search, prompt cards, schema cards, evidence gates, quick actions, activity log and browser-local state under `seis.prompt.engine.studio.demo.v1`.

## What is real

- The static HTML/CSS/JavaScript page loads without a build step.
- Prompt cards, builder fields, search, quick actions, schema cards, gates and localStorage persistence are interactive.
- Prompt pack metadata is generated locally.
- Prompt rules are visible and reviewable.

## What is mock or metadata-only

- Prompt packs are metadata previews, not executed instructions.
- Prompt bodies are not sent to any provider.
- Archive prompts remain reference material until reviewed and promoted later.
- No golden conversation tests or prompt injection tests are implemented by this page.

## What is blocked

- Live provider calls.
- Credential reads.
- Secret-bearing prompts.
- Private key, token, cookie or private-host prompt content.
- Copied proprietary or leaked system prompts.
- Prompt engineering, RAG or provider routing being described as model training.
- Prompt Engine being marked implemented until schema, fixtures, golden tests, injection tests, compact-context tests, redaction tests and archive-promotion notes exist.

## Source alignment

This demo is aligned with existing prompt-engine sources:

- `docs/ai/prompt-engine.md`
- `docs/ai/seis-ai-core.md`
- `docs/ai/model-router.md`
- `seis-brain/vault/02_Architecture/Prompt Engine.md`
- `seis-brain/vault/08_Prompts/Ollama Continuation Protocol.md`

Those files remain the authoritative contract sources. This page is a browser-local product demo surface.

## How to run

```sh
open apps/web/seis-prompt-engine-studio.html
```

No dependency install, provider key, SSH key, network access or local model runtime is required.

## How to validate

```sh
node scripts/check-seis-prompt-engine-studio-demo.mjs
```

Recommended focused checks:

```sh
node --check scripts/check-seis-prompt-engine-studio-demo.mjs
node scripts/check-seis-prompt-engine-studio-demo.mjs
git diff --check -- apps/web/seis-prompt-engine-studio.html docs/ai/seis-prompt-engine-studio-demo.md scripts/check-seis-prompt-engine-studio-demo.mjs
```

## Security notes

- No secrets are embedded.
- No API keys are required.
- No private keys are referenced.
- No provider calls are made.
- No credential reads are performed.
- No prompt bodies are executed or sent externally.
- No archive prompt is promoted.
- Browser state is disposable and not authoritative runtime evidence.

## Next safe action

After this page lands, link it from the unified demo launcher or Command Center. Real Prompt Engine implementation should wait for prompt-pack schema validation, reviewed fixtures, golden conversation tests, prompt injection tests, compact-context tests, redaction tests, archive-promotion review notes and human approval.
