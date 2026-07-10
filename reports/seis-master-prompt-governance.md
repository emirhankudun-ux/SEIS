# SEIS Master Prompt Governance Report

This report is generated from:

- `data/seis-master-prompt-implementation-map.json`
- `data/seis-master-prompt-acceptance-criteria.json`
- `data/seis-master-prompt-github-controls.json`
- `data/ssh-hardening-operation-contract.json`

It tracks how the root SEIS Enterprise Constitution and its Master Prompt
compatibility surfaces are represented in the repository. It is intentionally
short, reviewable, and tied to a dedicated quality gate.

## Goal

Keep architecture, security, documentation, AI, cloud, automation, design, and
product strategy aligned through a central SEIS operating contract.

## Priority

| Priority | Area | Evidence |
| --- | --- | --- |
| 1 | architecture | Root constitutional authority and compatibility decisions are captured in AGENTS and ADR surfaces. |
| 2 | security | SSH hardening, secret handling, and readiness claims are checked by dedicated gates. |
| 3 | documentation | Source data generates reviewable governance reports. |
| 4 | ai-and-agent-systems | Plugin skills expose agent-facing governance instructions. |
| 5 | cloud-and-automation | Cloud SSH readiness and CI governance are tracked as automated surfaces. |
| 6 | product-and-design | Product, design, and experience principles are covered by the Supreme Vision and objective coverage matrix. |

## Status

| Surface | Status | Evidence |
| --- | --- | --- |
| Enterprise Constitution | Active | AGENTS.md |
| Master Prompt companion | Compatibility | docs/governance/seis-master-prompt.md |
| Decision record | Superseded | docs/governance/adr-0001-seis-master-prompt-operating-contract.md |
| Change checklist | Active | docs/governance/seis-master-prompt-change-checklist.md |
| Review ownership | Active | .github/CODEOWNERS |
| GitHub controls manifest | Active | data/seis-master-prompt-github-controls.json |
| GitHub controls documentation | Active | docs/governance/seis-master-prompt-github-controls.md |
| SEIS plugin manifest | Active | plugins/seis/.codex-plugin/plugin.json |
| SEIS GitHub workflow skill | Active | plugins/seis/skills/seis-github-workflow/SKILL.md |
| SEIS Security Review skill | Active | plugins/seis/skills/seis-security-review/SKILL.md |
| SEIS Master Prompt skill | Active | plugins/seis/skills/seis-master-prompt/SKILL.md |
| Agent-facing instructions | Active | AGENTS.md is the constitutional authority and links focused expansion documents |
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
| architecture | AGENTS.md; docs/governance/seis-master-prompt.md; docs/governance/adr-0001-seis-master-prompt-operating-contract.md | Root constitutional authority and compatibility decisions are captured in AGENTS and ADR surfaces. |
| security | data/ssh-hardening-operation-contract.json; plugins/seis/skills/seis-security-review/SKILL.md | SSH hardening, secret handling, and readiness claims are checked by dedicated gates. |
| documentation | docs/governance/seis-master-prompt-change-checklist.md; reports/seis-master-prompt-governance.md | Source data generates reviewable governance reports. |
| ai-and-agent-systems | plugins/seis/.codex-plugin/plugin.json; plugins/seis/skills/seis-master-prompt/SKILL.md | Plugin skills expose agent-facing governance instructions. |
| cloud-and-automation | docs/deployment/ssh-wireguard-vps-cloud-server.md; .github/workflows/seis-master-prompt-governance.yml | Cloud SSH readiness and CI governance are tracked as automated surfaces. |
| product-and-design | docs/governance/seis-supreme-vision.md; data/seis-master-objective-coverage.json | Product, design, and experience principles are covered by the Supreme Vision and objective coverage matrix. |

## Acceptance Criteria

| Criterion | Priority | Requirement | Evidence | Verification |
| --- | --- | --- | --- | --- |
| user-work-protection | P0 | Changes protect user work and avoid destructive git or filesystem operations. | docs/governance/seis-master-prompt-change-checklist.md; .github/PULL_REQUEST_TEMPLATE.md | Confirm worktree state, review diff, and avoid unrelated overwrites. |
| security-and-privacy | P0 | Secrets, SSH keys, credentials, lockout-sensitive SSH flows, mode isolation, lockout safety, rollback evidence, and fail-fast expectations are governed. | data/ssh-hardening-operation-contract.json; scripts/check-ssh-hardening-contract.mjs; plugins/seis/skills/seis-security-review/SKILL.md | Run npm run check:ssh-hardening-contract and secret scans before commit. |
| architecture-integrity | P1 | Governance surfaces remain mapped, maintainable, and source-of-truth oriented. | data/seis-master-prompt-implementation-map.json; docs/governance/adr-0001-seis-master-prompt-operating-contract.md | Run npm run check:seis-master-prompt. |
| documentation-and-traceability | P1 | Documentation links Master Prompt, objective coverage, operational tracking, generated reports, and change checklist. | reports/seis-master-prompt-governance.md; reports/seis-master-objective-coverage.md; data/seis-master-objective-coverage.json | Run report checks and confirm generated reports are current. |
| quality-gate-integration | P1 | Dedicated checks are wired into governance quality scripts. | package.json; scripts/check-seis-master-prompt.mjs; scripts/check-seis-operational-goal-tracker.mjs | Run npm run check:seis-master-prompt-report and npm run check:seis-master-prompt. |
| ai-cloud-product-coverage | P2 | AI, cloud, product, design, and mobile SSH readiness stay tracked without overstated readiness claims. | data/seis-operational-goal-tracker.json; data/seis-master-objective-coverage.json; docs/deployment/ssh-wireguard-vps-cloud-server.md | Run objective coverage and operational goal tracker checks before claiming readiness. |
| god-mode-every-topic-feature-growth | P1 | The active God Mode objective is incomplete unless Dashboard, Goals, Repos, Docs, Agents, security, AI policy, rollback, validation, and handoff all have explicit feature or governance improvement evidence. | data/seis-master-objective-coverage.json; content/development/seis-god-mode-feature-growth-ledger.json; content/development/seis-god-mode-module-coverage.json; content/development/seis-god-mode-completion-audit.json; roadmap/seis-next-steps-implementation-pack.md | Run God Mode feature growth ledger, module coverage, work package, and completion audit checks before claiming the broad objective is complete. |

## GitHub Controls

| Control | Required | Setting | Reason | Local evidence | External evidence |
| --- | --- | --- | --- | --- | --- |
| main-branch-protection | required | Protect main with review and status checks before normal merge. | Main is the GitHub source of truth and should stay rollback-ready. | .github/CODEOWNERS; .github/workflows/seis-master-prompt-governance.yml | Verify branch protection in GitHub before claiming active protection. |
| required-master-prompt-checks | required | Require npm run check:seis-master-prompt-report and npm run check:seis-master-prompt for governance changes. | Master Prompt changes must stay tied to generated evidence and a dedicated quality gate. | package.json; scripts/check-seis-master-prompt.mjs | Verify current GitHub check runs before claiming green readiness. |
| codeowners-review | required | CODEOWNERS review covers governance, plugin, workflow, report, and SSH hardening surfaces. | Operating-contract changes need explicit maintainer review. | .github/CODEOWNERS | Verify CODEOWNERS review requirement in GitHub branch settings before claiming enforcement. |
| no-direct-deploy-or-push-assumption | required | Do not claim pushed, merged, deployed, connected, ready, or protected without current command or GitHub evidence. | SEIS readiness claims must match actual observed state. | docs/governance/seis-master-prompt.md; plugins/seis/skills/seis-security-review/SKILL.md | Verify deployment, SSH, GitHub, or check-run state before readiness claims. |

## SSH Hardening Operation Contract

| Area | Contract evidence | Governance effect |
| --- | --- | --- |
| Mode isolation | harden disallows normal user creation: true; full-setup requires user setup: true; audit mutates host: false; dashboard mutates host: false; verify mutates host: false; dry-run mutates host: false | Keep audit/dashboard/verify/dry-run non-mutating and keep harden separate from full setup. |
| Mode expectations | audit: observe only; dashboard: observe only; verify: observe only; dry-run: plan only; harden: mutating SSH hardening without normal user creation; full-setup: mutating setup with explicit user setup step | Make operator intent explicit before applying SSH or firewall changes. |
| Firewall and lockout safety | portKnockApplyDefault: false; liveApplyPreflightConfirmationRequired: true; liveApplyRequiresPlanAndRecoveryReview: true; mutatingApplyRequiresInteractiveConfirmOrExplicitCliFlag: true; nonInteractiveLiveApplyRequiresExplicitCliFlag: --confirm-live-apply-safety; planMustExposeLiveApplySafetyPolicy: true; operationReportMustExposeLiveApplySafetyEvidence: true; verificationReportMustExposeLiveApplySafetyEvidence: true; liveApplySafetyEvidenceMustExposeConfirmationStatus: true; secondAccessPathRequired: true; maintenanceWindowRequired: true | Require a reviewed plan, second access path, and backend-specific port-knock review before live apply. |
| Rollback and failure handling | singleOperationReportRequired: true; managedWritesMustBeIdempotent: true; criticalMutationMustFailFast: true; rollbackEvidenceRequiredOnFailure: true | Keep live hardening reviewable, idempotency-aware, and fail-fast when critical host mutation fails. |

## Risks

| Risk | Mitigation |
| --- | --- |
| Governance text drifts away from implementation | Keep the implementation map, acceptance criteria, generated report, and dedicated check in the quality chain. |
| Agent instructions become stale | Require root `AGENTS.md` authority markers and focused canonical-document links. |
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
npm run check:seis-god-mode-feature-growth-ledger
npm run check:seis-god-mode-module-coverage
npm run check:seis-god-mode-work-package
npm run check:seis-god-mode-completion-audit
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
