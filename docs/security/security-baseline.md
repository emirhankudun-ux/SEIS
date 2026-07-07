# SEIS Security Baseline

## Purpose

Capture the current security baseline for this foundation pass without exposing
secrets or claiming unverified compliance.

## Scope

This baseline covers:

- secret-file ignore rules
- environment template handling
- provider credential boundaries
- MCP and connector credential boundaries
- cloud token boundaries
- SSH approval boundaries
- public-readiness blockers

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Root security policy | Added | `SECURITY.md` | Public readiness is still blocked until repository hygiene, external secret scanning, and provider/runtime checks are complete. | Keep policy reviewed with every provider or deployment change. |
| Ignore rules | Improved | `.gitignore` includes env, key, service-account, and secret-folder patterns. | Local redacted Git history scan passed, but external scanner evidence was not collected. | Run approved external secret scanner before broad release claims. |
| Env template | Validator-backed | `.env.example`, `scripts/check-seis-env-example.mjs`, `npm run check:seis-env-example` keep no-key demo defaults, blank provider key slots, no browser-visible secrets, and no unverified model aliases aligned. | No runtime provider validation was performed. | Keep environment validation passing before live adapters. |
| MCP and connector credentials | Local-only | `docs/governance/mcp-connector-credential-boundary.md`, `.gitignore` local MCP patterns | No live connector auth was verified, and pasted credentials must be treated as exposed. | Keep real connector config in ignored local files and rotate any live credential that left the local boundary. |
| Cloud credentials | Server-only planned | `.env.example`, `deploy/cloud-environment.json` | No live credentials verified. | Keep deployment tokens out of browser and Git. |
| AI provider keys | Audited statically | `docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md`, `docs/audits/ai-provider-audit.json`, `npm run check:ai-provider-audit`, `npm run check:seis-env-example` | No runtime provider verification was performed. | Keep provider keys server-only and blank in public templates before live adapters. |
| Git secret history | Local redacted scan passed | `docs/audits/GIT_SECRET_HISTORY_SCAN.md`, `docs/audits/git-secret-history-scan.json`, `npm run check:git-secret-history` | External scanner, provider audit logs, and credential rotation review were not performed. | Keep local history scan passing and run external review before public release claims. |
| SSH | Approval-gated | `docs/operations/seis-cloud-foundation.md` | No SSH runbook in this pass. | Add SSH security runbook before any connection. |

## Rules / Policy

- Never print or commit secret values.
- Real `.env` files stay untracked.
- Browser public variables must not contain provider or deployment secrets.
- MCP connector headers and API keys must stay in ignored local config only.
- SSH private keys never enter repo, docs, prompts, logs, or browser storage.
- Missing credentials disable only the related capability.
- Unknown security state is not safe or passed.

## Evidence Requirements

Security claims need:

- scanner output or path-only finding
- validation command
- review note
- remediation record
- rotation note when a credential was exposed

## Related Documents

- [../SEIS_MASTER_INDEX.md](../SEIS_MASTER_INDEX.md)
- [../ai/seis-ai-core.md](../ai/seis-ai-core.md)
- [../operations/seis-cloud-foundation.md](../operations/seis-cloud-foundation.md)
- [../roadmap/NEXT_PR_QUEUE.md](../roadmap/NEXT_PR_QUEUE.md)

## Next Safe Action

Keep `npm run audit:ai-providers`, `npm run check:ai-provider-audit`,
`npm run check:git-secret-history`, and `npm run check:seis-env-example`
passing before live provider adapters. Do not run history rewriting or
credential rotation without explicit approval.
