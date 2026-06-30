# Gitleaks History Remediation

## Status

SEIS Guardian currently runs Gitleaks as a full-history scan. The live failure
is tied to an old generated bundle path that is no longer present in the
working tree:

- `sources/github-unified-source/_generated/github-code-bundle.txt`
- historical commit: `f3d385d6`
- detected rule classes include sourcegraph token patterns, private-key
  patterns, curl authorization headers, and generic API-key patterns

Do not copy detected values into issues, PR comments, docs, logs, prompts, or
agent handoff files. Treat all findings as sensitive until an owner confirms
they are synthetic or already rotated.

## Current Decision

This remediation note does not weaken `.gitleaks.toml`, does not allowlist the
findings, and does not rewrite repository history. It records the public-safe
state and adds a guard so generated unified-source bundles do not return to the
tracked tree.

## Required Owner Review

Before changing the security workflow scope or rewriting history, a maintainer
should choose one of these paths:

1. Rotate any real credentials that may have appeared in the historical bundle,
   then run an owner-approved history rewrite and coordinate protected-branch
   recovery.
2. Keep scheduled full-history scanning as the long-term reminder, and with
   explicit owner approval scan pull requests and pushes by changed commit range
   only.
3. Archive this finding as synthetic only after reviewing the original source
   privately without exposing the values.

## Guardrail

`npm run check:generated-source-bundles` verifies that
`sources/github-unified-source/_generated/` is not tracked and that this
remediation note remains present. `npm run check:workspace` also runs that
guard.

## Security Notes

- No secret values are included in this document.
- No SSH private keys, API keys, tokens, or host credentials are added.
- SEIS-SSH remains credential-free in Git.
- The web demo remains no-key.
