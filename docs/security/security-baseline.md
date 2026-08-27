# SEIS Security Baseline

## Purpose

Capture the current security baseline for this foundation pass without exposing
secrets or claiming unverified compliance.

## Scope

This baseline covers:

- secret-file ignore rules
- environment template handling
- provider credential boundaries
- cloud token boundaries
- SSH approval boundaries
- public-readiness blockers

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Root security policy | Added | `SECURITY.md` | Public readiness is still blocked until repository hygiene and secret-history checks are complete. | Keep policy reviewed with every provider or deployment change. |
| Ignore rules | Improved | `.gitignore` includes env, key, service-account, and secret-folder patterns. | Historical tracked secrets were not scanned in this pass. | Run approved secret scanner later. |
| Env template | Added | `.env.example` uses placeholders and empty optional token slots. | No typed env validator exists. | Add environment validation later. |
| Cloud credentials | Server-only planned | `.env.example`, `deploy/cloud-environment.json` | No live credentials verified. | Keep deployment tokens out of browser and Git. |
| AI provider keys | Audited statically (re-run 2026-08-26) | `docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md`, `docs/audits/ai-provider-audit.json` | No runtime verification or history scan was performed. The re-run inspected 2663 files (vs. 1921 previously) and now flags 12 providers with "Frontend Direct Call" references (Anthropic, Cohere, Gemini, Groq, Hugging Face, Mistral, Ollama, OpenAI, OpenRouter, Perplexity, Replicate, Together AI) — up from 0 in the previous committed snapshot. These are static reference counts, not confirmed live calls or exposed keys (0 secret values found); each needs manual review per-location before any adapter is enabled. | Add typed server-only environment validation before live adapters. Review the new Frontend Direct Call locations named above before enabling any of those providers. |
| SSH | Approval-gated | `docs/operations/seis-cloud-foundation.md` | No SSH runbook in this pass. | Add SSH security runbook before any connection. |

## Rules / Policy

- Never print or commit secret values.
- Real `.env` files stay untracked.
- Browser public variables must not contain provider or deployment secrets.
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

Keep `npm run audit:ai-providers` passing and add typed environment validation
before live provider adapters. Do not run history rewriting or credential
rotation without explicit approval.
