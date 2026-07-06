# SEIS Public Readiness Status

This document summarizes the machine-readable public-readiness matrix at
`content/development/seis-public-readiness-status.json`.

Current status: active-review-matrix-not-release-claim.

The matrix is not a release approval. It records which SEIS surfaces are
public-safe to document today, which checks guard them, and which live claims
remain blocked until current evidence exists.

## Status Summary

| Surface | Status | Claim boundary |
| --- | --- | --- |
| Identity and governance | documented | No remote GitHub settings claim. |
| Public onboarding | validator-backed | No live provider, SSH, or release claim. |
| Environment template | validator-backed | Provider key slots stay blank and model aliases stay empty. |
| Web demo | local-demo-review-required | No provider, SSH, deployment, or GitHub mutation. |
| Apple-first | scaffolded-validator-backed | No native completion or live integration claim. |
| Second Brain | validator-backed-local-demo | Private Obsidian import remains planned-gated. |
| Local AI | optional-metadata-only | Local model output is draft until reviewed. |
| AI Core | metadata-only-no-live-claims | No live provider call or credential validation. |
| SEIS-SSH | metadata-only-strict-live-gated | Live SSH needs current strict online evidence. |
| GitHub governance | documented-local-checks | Local `main` branch policy reconciliation is validator-backed; branch protection and Actions state need remote verification. |
| Security | validator-backed-local-history-scan | Local redacted Git history scan is passing; external scanner and credential-provider logs remain release blockers. |
| Public indexing | pre-production-noindex-validator-backed | Crawl assets are metadata-aligned, but page-level robots stay noindex until production approval. |
| Release artifacts | tracked-retained-approval-gated | Retained zips are recovery evidence, not release approval; deletion or migration needs explicit approval. |
| Publication | blocked-human-review-required | Public launch, Pages publication, merge, deployment, and release need approval. |

## Required Gate

```bash
npm run check:seis-public-readiness
npm run check:ai-provider-audit
npm run check:git-secret-history
npm run check:seo
npm run check:release-artifact-policy
npm run check:branch-policy-reconciliation
npm run check:public-doc-command-wiring
npm run check:seis-env-example
npm run check:seis-public-readiness-docs
npm run check:seis-public-readiness-status
npm run check:seis-public-readiness-lanes
npm run check:seis-public-readiness-evidence
npm run check:seis-public-readiness-sensitive-boundary
npm run check:seis-brain-context-packs
```

The aggregate check for this foundation PR runs the environment template,
public docs command wiring, public-readiness docs, public-readiness status, and
Apple-first / SEIS Brain / SEIS-SSH lane validators plus SEIS Brain
context-pack validators. It also verifies that matrix evidence paths exist and
that matrix npm checks resolve to package scripts, then scans matrix evidence
files for sensitive-value patterns without printing matched values. Broader
release/public-launch hardening still needs redacted AI provider audit,
redacted Git history scan, SEO metadata/noindex policy, release artifact
retention policy, and branch policy reconciliation checks in a
separate PR. The status check validates the matrix shape, no-key boundary,
live-claim blockers, required surface coverage, documentation links, package
script wiring, and basic sensitive-pattern rules.

The open-source governance workflow also runs the aggregate gate, and the pull
request template carries the matching public-readiness checklist. Pull requests
that touch public onboarding, environment templates, or readiness status records
must keep both governance and readiness checks green.

## Operating Rule

Use this matrix before public GitHub announcements, release notes, demo
publication, Pages publication, or broad contributor outreach. A surface may be
documented as public-safe while still blocking production, live AI, live SSH,
GitHub mutation, or release claims.

## Security Boundary

The matrix must never include real API keys, SSH private keys, private host
credentials, private vault material, provider tokens, or personal sensitive
data. It may reference credential variable names only as blank, server-only
configuration concepts.
