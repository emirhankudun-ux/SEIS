---
name: seis-cloud
description: Use SEIS Cloud for cloud deployment readiness, public cloud targets, team/workplace VPN cloud targets, provider preflight, GCP Compute planning, static hosting handoff, secrets hygiene, rollback contracts, and infrastructure automation inside SEIS. Trigger when Codex needs to plan, validate, document, or execute cloud work while preserving user confirmation, security, provider neutrality, access policy, and repository governance.
---

# SEIS Cloud

## Overview

Use this skill as the SEIS cloud and deployment lane. It keeps hosting, server, provider, VPN, and infrastructure work explicit, reversible, secret-safe, and validated instead of turning deployment into hidden state or one-off commands.

## Workflow

1. Inspect repo safety first: `git status --short`, `git branch --show-current`, and `git remote -v`.
2. Classify the access audience first: public cloud for everyone, or team/workplace VPN cloud for approved organizations and teams.
3. Classify the cloud surface: static hosting, server target, container host, edge worker, database/backend, cloud CLI, CI/CD, observability, or rollback.
4. Read source-of-truth deployment records before editing: `deploy`, `server`, `docs/deployment`, `reports`, and related scripts.
5. Verify provider assumptions, authentication state, selected target, public URL, rollback owner, access policy, and required secrets without printing secret values.
6. Prefer plan/preflight commands before mutation. Keep apply/deploy commands gated by explicit user confirmation.
7. Update provider-neutral records and paired reports when cloud capability changes.
8. Validate with the relevant cloud checks and document blockers, risks, rollback, and next actions.

## Cloud Lanes

- Provider-neutral readiness: `deploy/cloud-environment.json`, `deploy/provider-matrix.json`, `deploy/server-targets.json`, and generated cloud activation reports.
- Public cloud: everyone-facing product, documentation, release, preview, and static hosting surfaces that do not require VPN.
- Team VPN cloud: workplace/team-only cloud workspaces, GCP Compute + WireGuard, private Codex remote hosts, private VPS/container hosts, and approved peer access.
- Server and runtime targets: Node static server, Docker static package, GCP Compute VM, SFTP/VPS, edge worker, and static hosting adapters.
- Cloud provider helpers: Cloudflare, Vercel, Netlify, Render, Firebase, Supabase, Neon, Convex, GitHub Pages, and Google Cloud when authenticated and scoped.
- Security and rollback: secret stores, scoped SSH, deployment tokens, rollback owner, release manifest, health routes, and no-secret reporting.
- Observability: Sentry, Datadog, Statsig, Vantage, and provider-native checks only when access is explicit and relevant.

## Guardrails

- Never expose API keys, tokens, credentials, certificates, `.env` values, SSH private keys, or provisioning secrets.
- Never run mutating cloud commands unless the user explicitly confirms the provider, project/site, path, public URL, and rollback owner.
- Never model team/workplace VPN cloud as an everyone-facing surface.
- Never use broad VPN source ranges such as `0.0.0.0/0` or `::/0`.
- Do not claim deployment, cloud, GitHub, provider, or connector readiness until a real local or authenticated check verifies it.
- Keep broad plugin availability separate from actual authentication; installed or visible does not mean connected.
- Prefer narrow provider-specific changes that remain traceable through provider-neutral SEIS records.

## Helper Routing

Use helper plugins only when they directly support the cloud task:

- GitHub, CircleCI, CodeRabbit, Codex Security, Sentry, and Datadog for source, CI, security, review, and runtime evidence.
- Cloudflare, Vercel, Netlify, Render, Supabase, Neon Postgres, Convex, Firebase, and Vantage for scoped cloud, hosting, database, and FinOps work.
- Build Web Apps and Browser for local static/runtime verification before deployment.
- OpenAI Developers only when cloud work touches OpenAI API, agents, MCP, or ChatGPT app infrastructure.

## Validation

Prefer checks already wired into SEIS:

- `npm run check:cloud-environment`
- `npm run check:cloud-access-policy`
- `npm run check:server-cloud-report`
- `npm run check:server-target`
- `npm run check:gcp-cloud-server`
- provider-specific CLI dry-runs only after authentication and project scope are explicit
