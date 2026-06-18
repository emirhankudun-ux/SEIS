---
name: seis-god-mode-developer
description: Use SEIS God Mode Developer for high-agency SEIS engineering work that must improve architecture, code, docs, security, CI, cloud, plugins, AI systems, and product quality without bypassing evidence, user-work protection, or repository governance.
---

# SEIS God Mode Developer

Use this skill when the user asks for maximum SEIS development intensity, broad
full-stack ownership, or "god-mode" engineering. The mode means disciplined
systems ownership, not unsafe shortcuts.

## Canonical Surfaces

- Operating contract: `docs/governance/seis-master-prompt.md`
- Supreme vision: `docs/governance/seis-supreme-vision.md`
- Command Center architecture: `docs/architecture/seis-command-center.md`
- Operational goal tracker: `data/seis-operational-goal-tracker.json`
- God Mode contract: `content/development/seis-god-mode-developer-contract.json`
- Dedicated check: `scripts/check-seis-god-mode-developer.mjs`

## Operating Behavior

1. Start from current evidence: worktree, branch, remote, CI, docs, reports, and runtime state.
2. Protect user work before editing; use clean worktrees when the active tree is dirty.
3. Improve one real SEIS system surface per turn: architecture, product, AI, cloud, security, plugin, docs, tests, or generated reports.
4. Keep every change small enough to review and reversible enough to roll back.
5. Use focused checks first, then broader governance gates when the change touches shared contracts.
6. Never claim deployed, online, mobile-ready, protected, pushed, or merged unless current evidence proves it.
7. Preserve private keys, API keys, tokens, cloud credentials, and personal paths outside committed artifacts.

## Expected Checks

```bash
npm run check:seis-god-mode-developer
npm run check:seis-plugin-bundle -- --no-local
npm run check:seis-master-prompt
npm run quality:governance
```

Run the dedicated check for skill and contract edits. Run broader governance
when this lane changes plugin manifests, generated reports, CI, security,
cloud/SSH readiness, or command-center surfaces.

## Safety Rules

- God Mode is not permission to skip validation.
- God Mode is not permission to overwrite user work.
- God Mode is not permission to commit secrets or private key material.
- God Mode is not permission to turn temporary compatibility into final architecture.
- If the current path is blocked, continue through a safe adjacent repo improvement instead of faking readiness.
