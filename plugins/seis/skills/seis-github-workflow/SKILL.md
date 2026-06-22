---
name: seis-github-workflow
description: Govern SEIS GitHub source-of-truth workflows. Use when planning or changing branches, pull requests, CODEOWNERS, GitHub Actions checks, required review expectations, issue templates, PR templates, repo readiness, no-push handoff, or any SEIS GitHub governance task.
---

# SEIS GitHub Workflow

Use this skill when SEIS work needs to stay aligned with GitHub as the source of
truth. This skill complements `seis-master-prompt`: Master Prompt defines the
operating contract; this skill routes the GitHub workflow that proves or hands
off that contract safely.

## Canonical Surfaces

- Repository: `emirhankudun-ux/SEIS`
- Permanent branch: `main`
- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- Master Prompt issue template: `.github/ISSUE_TEMPLATE/master_prompt_governance.md`
- Review ownership: `.github/CODEOWNERS`
- Master Prompt CI: `.github/workflows/seis-master-prompt-governance.yml`
- Open-source governance check: `scripts/check-open-source-governance.mjs`
- Master Prompt check: `scripts/check-seis-master-prompt.mjs`
- Master Prompt report check: `scripts/create-seis-master-prompt-governance-report.mjs --check`
- GitHub controls doc: `docs/governance/seis-master-prompt-github-controls.md`

## Workflow

1. Identify whether the task affects local source only, GitHub-visible source,
   branch/PR governance, CI checks, ownership, deployment, or cloud readiness.
2. Keep `main` as the only permanent branch. Use short-lived branches or PRs
   only as review/integration staging.
3. Before claiming GitHub readiness, inspect the relevant GitHub evidence:
   branch protection settings, PR state, check runs, workflow runs, or maintainer
   approval.
4. For Master Prompt or governance changes, route through:
   - `.github/ISSUE_TEMPLATE/master_prompt_governance.md`
   - `.github/PULL_REQUEST_TEMPLATE.md`
   - `.github/CODEOWNERS`
   - `.github/workflows/seis-master-prompt-governance.yml`
5. Keep local checks and GitHub checks separate in reports. A local pass is not
   proof that GitHub checks passed.
6. When auth or GitHub API evidence is unavailable, leave an explicit no-push or
   no-readiness gate instead of claiming completion.

## Expected Local Checks

```bash
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
npm run check:open-source-governance
npm run quality
```

Use the focused checks first. Escalate to `npm run quality` when package
scripts, generated reports, workflows, plugin metadata, or public docs change.

## GitHub Evidence Rules

- Do not claim pushed, merged, deployed, connected, ready, or protected without
  inspecting current external state.
- For check-run verification, prefer GitHub workflow runs or commit check-runs
  over unavailable code-scanning endpoints.
- Do not delete branches or source repositories without verified merge/import
  evidence and explicit maintainer approval.
- Do not expose tokens, API keys, secrets, private keys, or personal data in
  prompts, issue bodies, PR bodies, logs, or reports.
