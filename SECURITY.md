# SEIS Security Policy

## Purpose

This policy defines the current security boundary for SEIS repository work. It
is a repository governance document, not a claim that SEIS is production-ready
or externally security-certified.

## Supported Status

SEIS is currently an internal closed-code operating repository. Public release,
deployment, live provider integrations, SSH execution, and repository visibility
changes remain approval-gated until readiness evidence exists.

## Secret Handling Rules

- Do not commit API keys, tokens, passwords, cookies, service accounts, private
  keys, `.env` files, production configs, or private user data.
- Use `.env.local` for local secrets and deployment secret managers for hosted
  environments.
- Keep `.env.example` tracked with placeholders or empty values only.
- Never put provider credentials in `VITE_`, `NEXT_PUBLIC_`, `PUBLIC_`,
  `REACT_APP_`, `NUXT_PUBLIC_`, `EXPO_PUBLIC_`, or similar browser-exposed
  variables.
- Browser code must not receive cloud provider or deployment credentials.
- Logs, reports, audits, issue templates, and PR descriptions must not include
  secret values or partial secret values.

## AI Provider Boundary

SEIS AI Core must be provider-neutral and must boot with zero cloud model
provider keys. Missing keys disable only the related provider or live inference
feature. They must not break non-AI product surfaces, docs, static views, local
records, or Goal Tracking OS.

Live model-provider integrations require:

- server-only credentials
- redacted audit report
- provider status model
- no-key startup behavior
- visible fallback identity
- client-bundle secret exposure check
- tests or documented manual validation

Provider routing, prompt engineering, retrieval, and local demos are not SEIS
foundation-model ownership claims.

## SSH And Cloud Boundary

- Do not execute SSH commands without explicit approval.
- Do not store SSH private keys in the repository, docs, browser storage,
  prompts, logs, or audit artifacts.
- Deployment tokens are server-only.
- Dry-run cloud checks must not claim live deployment success.
- GitHub remains the source of truth; cloud and SSH hosts are execution planes.

## Vulnerability Reporting

Until a public vulnerability disclosure channel is approved, report findings to
the repository owner through the private project channel used for SEIS work.

When reporting a suspected secret exposure, include:

- file path
- line number
- secret type or provider category
- tracked/untracked status if known
- recommended rotation/remediation

Do not include the secret value, prefix, suffix, screenshot, or reversible
encoding.

## Required Response For Suspected Secret Exposure

1. Stop printing or copying the value.
2. Remove the value from the current source tree where safe.
3. Replace runtime usage with a server-only environment variable reference.
4. Update ignore rules or templates if needed.
5. Mark the credential for rotation or revocation.
6. Search docs, tests, fixtures, generated reports, and committed artifacts for
   duplicate exposure.
7. Do not rewrite Git history or rotate credentials without explicit approval.

## Current Validation

Run the current redacted AI provider and credential audit:

```bash
npm run audit:ai-providers
```

Run existing repository checks where safe:

```bash
npm run check:workspace
npm run check:goal-tracking
npm run check:cloud-environment
```

`npm run check:foundation` may remain blocked until repository hygiene recovery
resolves pre-existing tracked deletions.

## Related Documents

- [docs/security/security-baseline.md](docs/security/security-baseline.md)
- [docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md](docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md)
- [docs/ai/seis-ai-core.md](docs/ai/seis-ai-core.md)
- [docs/operations/seis-cloud-foundation.md](docs/operations/seis-cloud-foundation.md)
