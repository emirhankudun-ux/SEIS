# SEIS Public Readiness

This checklist defines the minimum public GitHub readiness boundary for SEIS.
It is a review aid, not a claim that every long-term SEIS platform feature is
complete.

## Readiness Principle

SEIS is public-ready only when a new person can understand the project, run the
no-key demo path, inspect the Apple-first direction, review the Second Brain
boundary, understand SEIS-SSH safety, and see honest evidence for what is live,
demo-only, planned, blocked, or auth-gated.

The machine-readable status source is
`content/development/seis-public-readiness-status.json`, with the human summary
at `docs/governance/public-readiness-status.md`. Its current status is
`active-review-matrix-not-release-claim`.

## Required Public Surface

| Surface | Required Evidence |
| --- | --- |
| Identity | `README.md`, `AGENTS.md`, `docs/governance/seis-master-prompt.md` |
| Getting started | `docs/GETTING_STARTED.md`, `docs/development/first-run-quickstart.md` |
| Troubleshooting | `docs/TROUBLESHOOTING.md`, `SUPPORT.md`, `SECURITY.md` |
| Apple-first | `SEIS_APPLE_FIRST.md`, `apps/apple/README.md`, `packages/seis_platform_swift/README.md`, `docs/apple/APPLE_PUBLIC_READINESS.md`, `npm run check:seis-public-readiness-lanes` |
| Web demo | no-key local demo docs and route evidence |
| SEIS Brain | `docs/OBSIDIAN_SECOND_BRAIN.md`, `seis-brain/README.md`, public-safe context packs, public/private boundary note, `npm run check:seis-public-readiness-lanes` |
| Local AI | `docs/LOCAL_AI_SETUP.md`, optional Ollama/local assistant rules, single-writer boundary |
| AI Core | provider metadata with no browser secrets, no fake live claims, and redacted provider audit evidence |
| SEIS-SSH | `docs/SEIS_SSH_SETUP.md`, credential-free docs, demo-only metadata, strict live-claim gates, `npm run check:seis-public-readiness-lanes` |
| GitHub governance | `.github/` templates, CodeQL workflow, branch and contribution docs, `docs/governance/branch-policy-reconciliation.md`, `npm run check:branch-policy-reconciliation` |
| Environment | `.env.example`, `npm run check:seis-env-example`, blank server-only provider slots |
| Security | `SECURITY.md`, no real keys, no private host credentials, no private vault material, redacted provider/credential audit, redacted Git history scan |
| Public indexing | `docs/seo/metadata-plan.md`, `content/site/metadata.json`, `apps/web/robots.txt`, `apps/web/sitemap.xml`, `npm run check:seo` |
| Release artifacts | `docs/deployment/release-artifact-retention-policy.md`, `releases/latest.json`, retained `seis-static.zip` + `server-upload-manifest.json` pairs, `npm run check:release-artifact-policy` |

## No-Key Demo Gate

The public demo path must work without:

- API keys
- paid provider accounts
- real SSH credentials
- production cloud accounts
- database setup
- authentication
- private Obsidian vault content

`.env.example` must preserve this boundary: blank provider key slots are allowed
as documentation, but they must not enable live providers, expose browser
secrets, or pin unverified current model aliases.

Allowed demo evidence includes static fixtures, browser-local state, local demo
responses, mock provider metadata, planned integration records, and clearly
labeled sample SSH profiles.

## Apple-First Gate

Apple-first readiness means SEIS has a real native direction, not filler files.
Swift and SwiftUI work should use shared models, design tokens, native shell
surfaces, Apple platform policy, and tests where practical.

Do not claim macOS, iPadOS, iOS, provider, GitHub, local AI, or SSH native
features are complete unless the current code and checks prove them.

## Second Brain Gate

The public SEIS Brain must stay Markdown-first, Obsidian-compatible, searchable,
and public-safe. It may include context packs, architecture notes, public
boundaries, agent handoff rules, roadmap notes, and demo notes.

It must not include private notes, private vault bodies, private paths, personal
sensitive data, real host credentials, provider keys, tokens, or SSH private
keys.

## Local AI Gate

Local AI and Ollama are optional helper lanes. They may draft, summarize, or
review sanitized context, but they do not replace Codex as the default writer,
do not prove live model routing, and do not make local model output canonical
without repository evidence.

## SEIS-SSH Gate

SEIS-SSH is safe for public GitHub when it documents architecture, dry-run
checks, demo-only profiles, deployment readiness, rollback readiness, and
dangerous-command warnings without exposing credentials or implying live access.

Live SSH claims require current strict check evidence and explicit human review.

## Public Indexing Gate

SEIS stays in `pre-production-noindex` mode until the final domain, public
release window, and GitHub Pages/custom-domain posture are reviewed. Static
crawl assets may exist for route and metadata validation, but page-level robots
metadata must remain `noindex, nofollow` before production approval.

The source of truth is `content/site/metadata.json`, with the human plan at
`docs/seo/metadata-plan.md`. `npm run check:seo` must verify that the sitemap,
robots file, home canonical URL, Open Graph URL, and page-level noindex policy
all match before any publish attempt.

## Release Artifact Gate

Retained static release packages under `releases/` are recovery and handoff
evidence, not public release approval. Existing tracked zips stay
`tracked-retained` until explicit maintainer approval chooses deletion, Git LFS,
GitHub Releases, object storage, or manifest-only migration.

`npm run check:release-artifact-policy` must pass before cleanup, packaging
handoff, or release-readiness review. The check must not upload, delete, rewrite,
or move artifacts.

## Branch Policy Gate

SEIS uses a `main`-centered branch policy. UIXAppTTR-era records may remain as
legacy migration or archive material, but they must not be presented as the
current target branch for new SEIS work.

`npm run check:branch-policy-reconciliation` must pass before public-readiness
claims. It validates the active branch policy surfaces and the classified legacy
boundary without mutating GitHub settings.

## Verification Commands

Run only commands that match the changed lane and available toolchain:

```bash
npm run check:seis-public-readiness
npm run check:ai-provider-audit
npm run check:git-secret-history
npm run check:seo
npm run check:release-artifact-policy
npm run check:branch-policy-reconciliation
npm run check:public-doc-command-wiring
npm run check:seis-public-readiness-docs
npm run check:seis-public-readiness-status
npm run check:seis-public-readiness-lanes
npm run check:seis-public-readiness-evidence
npm run check:seis-public-readiness-sensitive-boundary
npm run check:seis-public-readiness-symlink-escape
npm run check:seis-public-readiness-script-file-wiring
npm run check:open-source-governance
npm run check:foundation
npm run check:seis-env-example
npm run check:seis-brain-context-packs
swift test --package-path packages/seis_platform_swift
git diff --check
```

If `npm` is unavailable, use direct Node invocations for single-file scripts.
Redacted provider audit, redacted Git history scan, SEO/noindex validation,
release artifact retention, and branch policy reconciliation remain required
for a later public-launch hardening review, not for this small foundation PR.

## Pull Request Report

Every readiness PR should report:

- files changed
- why each change was made
- commands run and results
- failures or blockers
- security notes
- rollback notes
- suggested PR title and body
- next recommended PRs

## Not Ready Means Not Ready

If a check fails, a live integration is unverified, a provider key is missing, an
SSH route is offline, or a demo surface depends on private setup, say so
directly. Honest blocked status is part of SEIS quality.
