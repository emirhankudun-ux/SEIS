---
type: context-pack
module: seis-demo
status: active-public-safe
priority: high
visibility: public
owner: SEIS
allowed_destinations:
  - Codex
  - Public GitHub
forbidden_destinations:
  - live provider prompt with secrets
  - deployment without approval
  - private vault import
---

# SEIS Demo Context

## Purpose

SEIS Web remains the public demo, GitHub showcase, and browser preview for the
ecosystem. Demo mode must work without provider keys, SSH credentials,
deployment accounts, databases, or authentication.

## Current Rule

Demo mode may use browser-local state, local demo responses, mock provider metadata,
sample SSH metadata, and planned integrations. It must label real, mock,
planned, disabled, and manual states honestly.

## Source Records

- `README.md`
- `docs/product/seis-demo-status.md`
- `docs/product/seis-second-brain.md`
- `docs/reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md`
- `content/development/seis-second-brain-system.json`

## Allowed Actions

- Improve public-safe demo docs and metadata.
- Add validators that check no-key and no-live-claim boundaries.
- Run local static checks and browser-local smoke checks when environment
  access allows.
- Add context packs that explain current demo behavior.

## Forbidden Actions

- Require API keys for the core demo.
- Claim live AI, live SSH, deployment, or production readiness from mock data.
- Hide failed checks.
- Ship broken CTAs or missing assets knowingly.
- Add private vault content or credentials.

## Verification Commands

```bash
npm run check:seis-second-brain
npm run check:seis-brain-context-packs
git diff --check
```

## Handoff Output

When reporting demo work, list the local evidence that was actually run and
name any browser-smoke, deployment, provider, or SSH checks that were not run in
the current turn.
