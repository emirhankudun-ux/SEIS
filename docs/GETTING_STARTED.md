# Getting Started With SEIS

SEIS is an AI-native, Apple-first creative engineering operating system. This
guide is the public entry point for people who want to inspect the repository,
run the lightest useful checks, and choose a development lane without installing
unrelated tools.

## What You Can Do Without Secrets

You can safely inspect SEIS, read the docs, run governance checks, review the
web demo files, and explore the public-safe Second Brain context packs without
API keys, SSH credentials, provider accounts, or private vault material.

Demo mode must remain no-key. If a feature needs a provider, remote host, or
account before it works, document it as planned, manual, blocked, or
auth-gated. Do not present it as live.

## First Commands

```bash
git status --short
git branch --show-current
git remote -v
```

Then run the lightweight public checks that match the local toolchain available
on your machine:

```bash
npm run check:open-source-governance
npm run check:foundation
npm run check:seis-public-readiness
```

If `npm` is not available but Node.js is available, run the underlying scripts
directly:

```bash
node scripts/check-open-source-governance.mjs
node scripts/check-foundation.mjs
node scripts/check-seis-public-readiness.mjs
```

The aggregate readiness gate includes `npm run check:seis-env-example`,
`npm run check:seis-public-readiness-docs`,
`npm run check:seis-public-readiness-status`, and
`npm run check:seis-brain-context-packs`.

For the full first-run lane selector, use
[`docs/development/first-run-quickstart.md`](./development/first-run-quickstart.md).

## Pick A Lane

| Lane | Use When | First Check |
| --- | --- | --- |
| Web demo | You are changing browser routes, UI, static assets, or demo behavior. | `npm run seis:check` |
| Apple native | You are changing Swift models, SwiftUI surfaces, or Apple metadata. | `swift test --package-path packages/seis_platform_swift` |
| SEIS Brain | You are changing Obsidian-compatible context packs or public/private boundaries. | `npm run check:seis-brain-context-packs` |
| AI Core | You are changing provider metadata, model routing docs, or assistant handoff rules. | `npm run check:seis-ai-core-provider-registry` |
| SEIS-SSH | You are changing SSH/cloud docs or metadata. | `npm run check:seis-ssh-access-model` |
| Public indexing | You are changing SEO metadata, robots, sitemap, or publication posture. | `npm run check:seis-website-pages` |
| GitHub readiness | You are changing onboarding, contribution, security, or public release docs. | `npm run check:seis-public-readiness` |

Do not install Xcode, Swift, Android Studio, cloud CLIs, local model runtimes, or
other large toolchains unless your selected lane requires them.

## Apple-First Path

For Apple-native work, use the existing Swift package at
`packages/seis_platform_swift`. Xcode can open the package for local Apple
development, but repository truth still comes from reviewed files, tests, and
the Git diff.

Start with:

- [`SEIS_APPLE_FIRST.md`](../SEIS_APPLE_FIRST.md)
- [`SEIS_APPLE_PLATFORM_STRATEGY.md`](../SEIS_APPLE_PLATFORM_STRATEGY.md)
- [`packages/seis_platform_swift/README.md`](../packages/seis_platform_swift/README.md)
- [`docs/apple/APPLE_PUBLIC_READINESS.md`](./apple/APPLE_PUBLIC_READINESS.md)

Do not add Swift filler just to change language percentages.

## Second Brain Path

Public-safe SEIS Brain files live under `seis-brain/`. They are
Obsidian-compatible Markdown records for architecture, context packs, public
boundaries, and handoff notes.

Start with:

- [`seis-brain/README.md`](../seis-brain/README.md)
- [`docs/OBSIDIAN_SECOND_BRAIN.md`](./OBSIDIAN_SECOND_BRAIN.md)
- [`docs/product/seis-second-brain.md`](./product/seis-second-brain.md)
- [`seis-brain/vault/13_Public_Private_Boundaries/Public Safe Boundary.md`](../seis-brain/vault/13_Public_Private_Boundaries/Public%20Safe%20Boundary.md)

Never commit private notes, private vault contents, real host details, API keys,
or SSH private keys.

## SEIS-SSH Path

SEIS-SSH is metadata-first unless a live connection has been explicitly
configured and verified outside the public repository. Sample profiles,
readiness checklists, and cloud plans must not include real credentials or real
private host details.

Start with:

- [`docs/SEIS_SSH_SETUP.md`](./SEIS_SSH_SETUP.md)
- [`docs/operations/seis-cloud-foundation.md`](./operations/seis-cloud-foundation.md)
- [`server/cloud/ssh-ai-shell/README.md`](../server/cloud/ssh-ai-shell/README.md)
- [`SEIS SSH Context`](../seis-brain/vault/12_Context_Packs/SEIS%20SSH%20Context.md)

## Local AI Path

Local AI is optional. Start with
[`docs/LOCAL_AI_SETUP.md`](./LOCAL_AI_SETUP.md) before handing sanitized context
to Ollama or another local assistant. Codex remains the default writer unless a
handoff explicitly changes that role.

## Before A Pull Request

Use a small scope and report:

- files changed
- why each file changed
- checks run and results
- security notes
- rollback path
- remaining risks

If checks fail, keep the failure visible and explain the blocker.
