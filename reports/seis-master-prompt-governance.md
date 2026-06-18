# SEIS Master Prompt Governance Report

This report is generated from:

- `data/seis-master-prompt-implementation-map.json`
- `data/seis-master-prompt-acceptance-criteria.json`
- `data/seis-master-prompt-github-controls.json`
- `data/ssh-hardening-operation-contract.json`

It tracks how the SEIS Master Prompt is represented in the repository. It is
intentionally short, reviewable, and tied to a dedicated quality gate so the
operating contract does not remain chat-only context.

## Goal

Keep architecture, security, documentation, AI, cloud, automation, design, and
product strategy aligned through a central SEIS operating contract.

## Priority

| Priority | Area | Evidence |
| --- | --- | --- |
| 1 | architecture | main-only repository policy; Master Prompt CODEOWNERS review ownership; GitHub branch protection and required check controls; architecture map; quality:governance script chain; operational goal tracking contract; goal tracker quality check; Master Objective coverage matrix; objective coverage quality check |
| 2 | security | least privilege policy; SSH hardening operation contract; SEIS Security Review repo skill; SSH hardening credential-handling contract; SSH hardening mode-isolation contract; firewall and port-knock lockout safety contract; rollback, idempotency, and fail-fast operation evidence contract; no secret/private-key patterns in Master Prompt surfaces; SSH and cloud readiness checks |
| 3 | documentation | governance documents; Master Prompt governance report; generated reports; first-run contributor path; goal, priority, status, risk, validation, and next-step tracking; objective-to-evidence coverage matrix; generated objective coverage report |
| 4 | ai-and-agent-systems | agent operating instructions; SEIS GitHub workflow repo skill; SEIS Master Prompt repo skill; SEIS Security Review repo skill; SEIS plugin manifest capability; MCP server surfaces; plugin and skill lanes |
| 5 | cloud-and-automation | quality gates; Master Prompt review ownership; GitHub settings control manifest; dedicated Master Prompt CI workflow; SSH hardening operation contract; SSH hardening contract check; Master Prompt change checklist; cloud readiness commands; dry-run and recovery-first operational policy; operational goal tracker check; objective coverage check; objective coverage report check |
| 6 | product-and-design | public repository positioning; design-driven platform strategy; technology stack reporting |

## Status

| Surface | Status | Evidence |
| --- | --- | --- |
| Master Prompt document | Active | docs/governance/seis-master-prompt.md |
| Decision record | Active | docs/governance/adr-0001-seis-master-prompt-operating-contract.md |
| Change checklist | Active | docs/governance/seis-master-prompt-change-checklist.md |
| Review ownership | Active | .github/CODEOWNERS |
| GitHub controls manifest | Active | data/seis-master-prompt-github-controls.json |
| GitHub controls documentation | Active | docs/governance/seis-master-prompt-github-controls.md |
| SEIS plugin manifest | Active | plugins/seis/.codex-plugin/plugin.json |
| SEIS GitHub workflow skill | Active | plugins/seis/skills/seis-github-workflow/SKILL.md |
| SEIS Security Review skill | Active | plugins/seis/skills/seis-security-review/SKILL.md |
| SEIS Master Prompt skill | Active | plugins/seis/skills/seis-master-prompt/SKILL.md |
| Agent-facing instructions | Active | AGENTS.md links the active Master Prompt |
| README positioning | Active | README.md links the Master Prompt surfaces |
| Implementation map | Active | data/seis-master-prompt-implementation-map.json |
| Acceptance criteria | Active | data/seis-master-prompt-acceptance-criteria.json |
| Objective coverage matrix | Active | data/seis-master-objective-coverage.json |
| Objective coverage check | Active | scripts/check-seis-master-objective-coverage.mjs |
| Objective coverage report | Active | reports/seis-master-objective-coverage.md |
| Objective coverage report generator | Active | scripts/create-seis-master-objective-coverage-report.mjs |
| Operational goal tracker | Active | data/seis-operational-goal-tracker.json |
| Operational goal tracker check | Active | scripts/check-seis-operational-goal-tracker.mjs |
| Dedicated quality check | Active | npm run check:seis-master-prompt |
| Dedicated CI workflow | Active | .github/workflows/seis-master-prompt-governance.yml |
| Generated governance report | Active | reports/seis-master-prompt-governance.md |
| Full governance chain | Active | quality:governance includes the dedicated check |

## Domain Coverage

| Domain | Repository surfaces | Evidence |
| --- | --- | --- |
| architecture | README.md; AGENTS.md; .github/CODEOWNERS; data/seis-master-prompt-github-controls.json; data/seis-master-prompt-acceptance-criteria.json; .github/workflows/seis-master-prompt-governance.yml; docs/governance/adr-0001-seis-master-prompt-operating-contract.md; docs/governance/seis-master-prompt-change-checklist.md; docs/governance/seis-master-prompt-github-controls.md; docs/governance/seis-master-prompt.md; docs/governance/open-source-governance.md; docs/governance/branch-policy.md; data/seis-operational-goal-tracker.json; scripts/check-seis-operational-goal-tracker.mjs; data/seis-master-objective-coverage.json; scripts/check-seis-master-objective-coverage.mjs | main-only repository policy; Master Prompt CODEOWNERS review ownership; GitHub branch protection and required check controls; architecture map; quality:governance script chain; operational goal tracking contract; goal tracker quality check; Master Objective coverage matrix; objective coverage quality check |
| security | SECURITY.md; CODEX.md; data/ssh-hardening-operation-contract.json; docs/deployment/ssh-wireguard-vps-cloud-server.md; plugins/seis/skills/seis-security-review/SKILL.md; scripts/check-ssh-hardening-contract.mjs; scripts/check-seis-master-prompt.mjs; scripts/ultra_ssh_manager.py | least privilege policy; SSH hardening operation contract; SEIS Security Review repo skill; SSH hardening credential-handling contract; SSH hardening mode-isolation contract; firewall and port-knock lockout safety contract; rollback, idempotency, and fail-fast operation evidence contract; no secret/private-key patterns in Master Prompt surfaces; SSH and cloud readiness checks |
| documentation | README.md; data/seis-master-prompt-acceptance-criteria.json; docs/governance/adr-0001-seis-master-prompt-operating-contract.md; docs/governance/seis-master-prompt-change-checklist.md; docs/governance/seis-master-prompt.md; docs/development/first-run-quickstart.md; reports/seis-master-prompt-governance.md; reports; data/seis-operational-goal-tracker.json; data/seis-master-objective-coverage.json; reports/seis-master-objective-coverage.md; scripts/create-seis-master-objective-coverage-report.mjs | governance documents; Master Prompt governance report; generated reports; first-run contributor path; goal, priority, status, risk, validation, and next-step tracking; objective-to-evidence coverage matrix; generated objective coverage report |
| ai-and-agent-systems | AGENTS.md; CODEX.md; CLAUDE.md; plugins/seis/.codex-plugin/plugin.json; plugins/seis/skills/seis-github-workflow/SKILL.md; plugins/seis/skills/seis-master-prompt/SKILL.md; plugins/seis/skills/seis-security-review/SKILL.md; mcp; plugins; packages/seis-ai | agent operating instructions; SEIS GitHub workflow repo skill; SEIS Master Prompt repo skill; SEIS Security Review repo skill; SEIS plugin manifest capability; MCP server surfaces; plugin and skill lanes |
| cloud-and-automation | package.json; .github/CODEOWNERS; .github/workflows/seis-master-prompt-governance.yml; data/seis-master-prompt-github-controls.json; docs/governance/seis-master-prompt-github-controls.md; data/ssh-hardening-operation-contract.json; scripts; docs/deployment; scripts/check-ssh-hardening-contract.mjs; reports/seis-master-prompt-governance.md; server/cloud; scripts/check-seis-operational-goal-tracker.mjs; scripts/check-seis-master-objective-coverage.mjs; scripts/create-seis-master-objective-coverage-report.mjs | quality gates; Master Prompt review ownership; GitHub settings control manifest; dedicated Master Prompt CI workflow; SSH hardening operation contract; SSH hardening contract check; Master Prompt change checklist; cloud readiness commands; dry-run and recovery-first operational policy; operational goal tracker check; objective coverage check; objective coverage report check |
| product-and-design | apps/web; docs/governance/github-market-readiness.md; reports/seis-technology-stack.md | public repository positioning; design-driven platform strategy; technology stack reporting |

## Acceptance Criteria

| Criterion | Priority | Requirement | Evidence | Verification |
| --- | --- | --- | --- | --- |
| user-work-protection | 1 | Repository work must protect existing user changes and avoid destructive operations without explicit approval. | AGENTS.md; .github/CODEOWNERS; data/seis-master-prompt-github-controls.json; docs/governance/adr-0001-seis-master-prompt-operating-contract.md; docs/governance/seis-master-prompt-change-checklist.md; docs/governance/seis-master-prompt.md; reports/seis-master-prompt-governance.md; data/seis-operational-goal-tracker.json | Governance docs require explicit approval before deploy, merge, push, delete, or history rewrite, CODEOWNERS keeps Master Prompt files reviewable, and GitHub controls document external enforcement expectations. The operational goal tracker keeps status, risks, validation, and next steps explicit before work is treated as complete. |
| security-and-privacy | 2 | Master Prompt surfaces must prioritize least privilege and must not contain secrets, private keys, API keys, or inline credentials. | data/ssh-hardening-operation-contract.json; scripts/check-seis-master-prompt.mjs; scripts/check-ssh-hardening-contract.mjs; SECURITY.md; plugins/seis/skills/seis-security-review/SKILL.md; docs/governance/seis-master-prompt.md | Dedicated checks scan Master Prompt surfaces and SSH hardening surfaces for private-key and credential patterns, and the SEIS plugin exposes a security review skill for secret-safety, least-privilege, SSH/cloud, rollback, and validation-claim reviews. The SSH hardening operation contract also tracks mode isolation, lockout safety, rollback evidence, idempotency, and fail-fast expectations before any live host operation is treated as safe. |
| architecture-integrity | 3 | Master Prompt governance must map architecture decisions to concrete repository surfaces. | data/seis-master-prompt-implementation-map.json; README.md; .github/CODEOWNERS; data/seis-master-prompt-github-controls.json; AGENTS.md; data/seis-master-objective-coverage.json | Implementation map includes architecture, security, documentation, AI/agent, cloud/automation, and product/design domains. The coverage matrix keeps broad objective areas connected to concrete repository surfaces. |
| documentation-and-traceability | 4 | The operating contract must be discoverable from README, AGENTS, a governance document, an implementation map, and a report. | README.md; AGENTS.md; docs/governance/adr-0001-seis-master-prompt-operating-contract.md; docs/governance/seis-master-prompt-change-checklist.md; docs/governance/seis-master-prompt.md; data/seis-master-prompt-implementation-map.json; reports/seis-master-prompt-governance.md; data/seis-operational-goal-tracker.json; scripts/check-seis-operational-goal-tracker.mjs; data/seis-master-objective-coverage.json; scripts/check-seis-master-objective-coverage.mjs; reports/seis-master-objective-coverage.md; scripts/create-seis-master-objective-coverage-report.mjs | Dedicated check requires all canonical links and tracking sections. The goal tracker check requires explicit goal, priority, status, risks, validation, and next-step fields. The objective coverage check maps each Master Prompt requirement to evidence, checks, status, and remaining gaps. The generated objective coverage report makes broad objective coverage readable for review. |
| quality-gate-integration | 5 | Master Prompt alignment must be checked by a dedicated command and included in the normal governance quality chain. | package.json; .github/CODEOWNERS; .github/workflows/seis-master-prompt-governance.yml; data/ssh-hardening-operation-contract.json; data/seis-master-prompt-github-controls.json; scripts/check-ssh-hardening-contract.mjs; scripts/check-seis-master-prompt.mjs; scripts/check-seis-operational-goal-tracker.mjs; scripts/check-seis-master-objective-coverage.mjs; scripts/create-seis-master-objective-coverage-report.mjs | package.json exposes check:seis-master-prompt and check:ssh-hardening-contract, quality:governance includes them, GitHub Actions runs the focused governance checks, and GitHub controls define the required external settings. package.json also exposes check:seis-operational-goal-tracker and quality:governance includes it. package.json also exposes check:seis-master-objective-coverage and quality:governance includes it. package.json also exposes check:seis-master-objective-coverage-report and quality:governance includes it. |
| ai-cloud-product-coverage | 6 | Master Prompt governance must cover AI/agent systems, cloud/automation, and product/design strategy. | data/seis-master-prompt-implementation-map.json; reports/seis-master-prompt-governance.md; plugins/seis/.codex-plugin/plugin.json; plugins/seis/skills/seis-github-workflow/SKILL.md; plugins/seis/skills/seis-master-prompt/SKILL.md; plugins/seis/skills/seis-security-review/SKILL.md; README.md | Implementation map includes AI/agent, cloud/automation, and product/design domains with concrete surfaces, and the SEIS plugin exposes Master Prompt, GitHub workflow, and security review governance skills. |

## GitHub Controls

| Control | Required | Setting | Reason | Local evidence | External evidence |
| --- | --- | --- | --- | --- | --- |
| main-branch-protection | required | Protect main branch | Main is the only permanent SEIS branch and must not accept unreviewed governance changes. | docs/governance/branch-policy.md; README.md | GitHub repository branch protection settings for main |
| required-master-prompt-checks | required | Require SEIS Master Prompt Governance workflow before merge | Generated governance report and Master Prompt contract checks must pass on relevant pull requests. | .github/workflows/seis-master-prompt-governance.yml; package.json | GitHub branch protection required status checks |
| codeowners-review | required | Require CODEOWNERS review for Master Prompt governance files | Operating-contract changes should be reviewed by the maintainer before merge. | .github/CODEOWNERS | GitHub branch protection code owner review setting |
| no-direct-deploy-or-push-assumption | required | Do not treat local edits as deployed, merged, pushed, or GitHub-ready without explicit evidence | The Master Prompt forbids unverified readiness claims and requires explicit approval for deploy, merge, push, delete, or history rewrite. | docs/governance/seis-master-prompt.md; docs/governance/seis-master-prompt-change-checklist.md; .github/PULL_REQUEST_TEMPLATE.md | Maintainer approval plus GitHub PR/check state |

## SSH Hardening Operation Contract

| Area | Contract evidence | Governance effect |
| --- | --- | --- |
| Mode isolation | harden disallows normal user creation: true; full-setup requires user setup: true; audit mutates host: false; dashboard mutates host: false; verify mutates host: false; dry-run mutates host: false | Keep audit/dashboard/verify/dry-run non-mutating and keep harden separate from full setup. |
| Mode expectations | audit: Collect system information and write reports without applying hardening.; dashboard: Observe local state without applying hardening.; verify: Run non-mutating checks and write a verification report.; harden: Apply package, SSH, kernel, fail2ban, firewall, and service hardening without creating normal users.; full-setup: Apply the harden flow plus approved user creation and rescue-user setup.; dry-run: Create a plan and recovery playbook without running host-mutating commands. | Make operator intent explicit before applying SSH or firewall changes. |
| Firewall and lockout safety | secondAccessPathRequiredBeforeApply: true; portKnockApplyDefault: false; ufwAndFirewalldMustRemainExplicitlySeparated: true; strictFirewalldKnockGuardUnsupportedWithoutOperatorReview: true; serviceRestartRequiresReviewedPlan: true; liveApplyRequiresMaintenanceWindow: true; liveApplyPreflightConfirmationRequired: true; liveApplyRequiresPlanAndRecoveryReview: true; mutatingApplyRequiresInteractiveConfirmOrExplicitCliFlag: true; nonInteractiveLiveApplyRequiresExplicitCliFlag: --confirm-live-apply-safety; planMustExposeLiveApplySafetyPolicy: true; operationReportMustExposeLiveApplySafetyEvidence: true; verificationReportMustExposeLiveApplySafetyEvidence: true; liveApplySafetyEvidenceMustExposeConfirmationStatus: true | Require a reviewed plan, second access path, and backend-specific port-knock review before live apply. |
| Rollback and failure handling | managedConfigBlocksRequired: true; dedupeManagedLinesRequired: true; packageInstallFailureMustStopApply: true; serviceRestartFailureMustStopApplyWhenRestartEnabled: true; retryCountsMustBeConfigDriven: true; singleOperationReportRequired: true; verificationReportRequired: true | Keep live hardening reviewable, idempotency-aware, and fail-fast when critical host mutation fails. |

## Risks

| Risk | Mitigation |
| --- | --- |
| Governance text drifts away from implementation | Keep the implementation map, acceptance criteria, generated report, and dedicated check in the quality chain. |
| Agent instructions become stale | Require `AGENTS.md` to link the active Master Prompt. |
| Security principles stay aspirational | Check Master Prompt surfaces for private-key and inline credential patterns. |
| SSH hardening causes lockout or unsafe host mutation | Keep mode isolation, lockout safety, rollback evidence, and fail-fast behavior tied to the SSH operation contract. |
| Documentation becomes theater | Track concrete surfaces, evidence, validation, acceptance criteria, and next steps in this report. |
| Quality claims are overstated | Do not mark validation as passing unless the related command was actually run. |

## Validation

Expected validation path:

```bash
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
npm run check:seis-master-objective-coverage-report
npm run check:seis-master-objective-coverage
npm run check:seis-operational-goal-tracker
npm run check:ssh-hardening-contract
npm run check:open-source-governance
npm run quality
```

Current report status: not locally verified in this editing turn.

## Next Step

Run `npm run check:seis-master-prompt-report`, then
`npm run check:seis-master-prompt`, then escalate to
`npm run check:open-source-governance` and `npm run quality` if the focused
checks pass.

## Acceptance Criteria Source

Canonical criteria are maintained in
`data/seis-master-prompt-acceptance-criteria.json`. Completion must not be claimed unless those
criteria have current evidence and validation has been run or explicitly waived
by the maintainer.
