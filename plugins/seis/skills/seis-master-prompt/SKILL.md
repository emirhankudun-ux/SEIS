---
name: seis-master-prompt
description: Govern SEIS Master Prompt work inside the SEIS GitHub repository. Use when changing architecture, security, documentation, AI/agent workflows, cloud/automation, product/design strategy, governance checks, generated reports, GitHub controls, CODEOWNERS, PR/issue templates, or any SEIS operating-contract artifact.
---

# SEIS Master Prompt

Use this skill to keep SEIS Master Prompt work tied to the canonical GitHub repo,
the SEIS plugin bundle, and the dedicated governance quality gates.

## Canonical Surfaces

- Contract: `docs/governance/seis-master-prompt.md`
- ADR: `docs/governance/adr-0001-seis-master-prompt-operating-contract.md`
- Checklist: `docs/governance/seis-master-prompt-change-checklist.md`
- GitHub controls: `docs/governance/seis-master-prompt-github-controls.md`
- Implementation map: `data/seis-master-prompt-implementation-map.json`
- Acceptance criteria: `data/seis-master-prompt-acceptance-criteria.json`
- GitHub controls manifest: `data/seis-master-prompt-github-controls.json`
- Generated report: `reports/seis-master-prompt-governance.md`
- Report generator: `scripts/create-seis-master-prompt-governance-report.mjs`
- Dedicated check: `scripts/check-seis-master-prompt.mjs`
- CI workflow: `.github/workflows/seis-master-prompt-governance.yml`
- Review ownership: `.github/CODEOWNERS`

## Workflow

1. Classify the change by domain: architecture, security, documentation,
   AI/agent systems, cloud/automation, product/design, or quality gates.
2. Use `docs/governance/seis-master-prompt-change-checklist.md` before editing
   broad governance surfaces.
3. Update source manifests before generated outputs:
   - `data/seis-master-prompt-implementation-map.json`
   - `data/seis-master-prompt-acceptance-criteria.json`
   - `data/seis-master-prompt-github-controls.json`
4. Refresh `reports/seis-master-prompt-governance.md` from the generator when
   source manifests change.
5. Keep PR/issue/CI/CODEOWNERS surfaces aligned with the same contract.
6. State validation honestly; do not claim checks, GitHub readiness, deploy,
   merge, push, or branch protection unless actually verified.

## Expected Checks

```bash
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
npm run check:open-source-governance
npm run quality
```

Run the lightest focused check first. Escalate to the full quality chain when
the change affects package scripts, generated reports, GitHub workflows,
repository governance, or public docs.

## Safety Rules

- Do not expose secrets, tokens, private keys, credentials, or `.env` contents.
- Do not deploy, merge, push, delete, or rewrite history without explicit
  maintainer approval.
- Treat CODEOWNERS and workflow files as intended governance evidence, not proof
  that GitHub branch protection settings are active.
- Verify GitHub settings or check runs before claiming external readiness.
