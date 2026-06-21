---
name: seis-security
description: Use SEIS Security for threat modeling, secret-safety review, dependency and permission risk, rollback security, CI/security gates, cloud access safety, SSH/VPN hardening, and release-blocking security checks inside the SEIS repository and SEIS-Agent workflow.
---

# SEIS Security

Use this skill when a SEIS task touches security posture, secrets, permissions,
remote access, cloud infrastructure, SSH/VPN, dependency risk, authentication,
authorization, data exposure, or release readiness.

## Workflow

1. Inspect repository safety first: `git status --short`, branch, and remotes.
2. Identify the security surface: secrets, dependency, code path, cloud target,
   SSH/VPN, plugin/connector permission, data handling, CI gate, or release.
3. Read the nearest source of truth before editing: `SECURITY.md`,
   `docs/governance`, `docs/deployment`, `content/development`, `deploy`,
   `server/cloud`, plugin manifests, and relevant check scripts.
4. Check for secret leakage without printing secret values.
5. Prefer least privilege, explicit approval gates, reversible changes, and
   narrow provider/tool scope.
6. Validate with the smallest reliable command, then scale checks only when the
   blast radius requires it.
7. Report security status as pass, blocked, or unverified. Do not claim safe or
   ready without evidence.

## Guardrails

- Never expose API keys, tokens, private keys, certificates, provisioning files,
  `.env` contents, or private personal data.
- Never weaken security controls for speed or convenience.
- Never run destructive or mutating remote actions without explicit approval.
- Do not treat installed plugins or visible connector cards as authenticated.
- Keep public cloud and team/workplace VPN cloud access models separate.
- Record unresolved risks, rollback steps, and validation gaps.

## Default Checks

Prefer existing SEIS gates when present:

- `npm run check:seis-agent-plugin-integration`
- `npm run check:seis-specialist-plugins`
- `npm run check:cloud-access-policy`
- `npm run check:ssh-hardening-contract`
- `npm run check:seis-ssh-access-model`
- `npm run check:seis-god-mode-release-readiness`
- package-local tests for touched security code
