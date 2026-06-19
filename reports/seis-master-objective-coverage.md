# SEIS Master Objective Coverage Report

This report is generated from `data/seis-master-objective-coverage.json`.

It maps the active SEIS Master Prompt objective to concrete repository evidence,
focused checks, coverage status, and remaining gaps. It does not claim
completion; it makes incompleteness reviewable.
It also summarizes `data/ssh-hardening-operation-contract.json` because SSH and
firewall changes are lockout-sensitive security operations.

## Status

| Field | Value |
| --- | --- |
| Contract | SEIS Master Objective Coverage |
| Status | active |
| Coverage source | data/seis-master-objective-coverage.json |
| SSH hardening operation contract | data/ssh-hardening-operation-contract.json |
| Coverage report | reports/seis-master-objective-coverage.md |
| Coverage items | 9 |
| Completion rule | Coverage is complete only when required checks pass or the maintainer explicitly waives them with evidence. |

## Coverage Matrix

| ID | Status | Requirement | Evidence | Checks | Gap |
| --- | --- | --- | --- | --- | --- |
| user-work-protection | active | Protect user work, preserve dirty worktrees, and keep changes reversible. | docs/governance/seis-master-prompt.md; docs/governance/seis-master-prompt-change-checklist.md | npm run check:seis-master-prompt | Requires current diff review before every commit. |
| security-and-privacy | active | Prevent secrets exposure and govern SSH hardening risk. | data/ssh-hardening-operation-contract.json; docs/deployment/ssh-wireguard-vps-cloud-server.md | npm run check:ssh-hardening-contract; npm run check:seis-master-prompt | Track mode-isolation, lockout-safety, and fail-fast validation until direct-cloud SSH is proven. |
| architecture-and-maintainability | active | Keep governance and implementation surfaces mapped to a single operating contract. | data/seis-master-prompt-implementation-map.json; docs/governance/adr-0001-seis-master-prompt-operating-contract.md | npm run check:seis-master-prompt | Continue reducing duplicated governance text. |
| documentation-traceability | active | Make governance evidence reproducible through generated reports. | reports/seis-master-prompt-governance.md; reports/seis-master-objective-coverage.md | npm run check:seis-master-prompt-report; npm run check:seis-master-objective-coverage-report | Reports must be regenerated after source JSON changes. |
| apple-first-platform | mapped | Preserve Apple-first platform direction while keeping cross-platform checks realistic. | docs/governance/seis-supreme-vision.md; AGENTS.md | npm run check:seis-master-prompt | Apple-native runtime checks remain platform-specific. |
| design-accessibility-experience | mapped | Treat design, accessibility, and product experience as engineering systems. | docs/governance/seis-supreme-vision.md; data/seis-operational-goal-tracker.json | npm run check:seis-operational-goal-tracker | Needs ongoing product-surface validation. |
| ai-data-cloud-automation | active | Keep AI, data, cloud, SSH, and automation work governed and measurable. | data/ssh-hardening-operation-contract.json; docs/deployment/ssh-wireguard-vps-cloud-server.md | npm run check:ssh-vpn-cloud-server; npm run check:seis-master-prompt | Direct cloud mobile SSH remains blocked until strict readiness passes. |
| open-source-github-readiness | active | Keep GitHub, community, governance, and CI readiness visible. | data/seis-master-prompt-github-controls.json; .github/workflows/seis-master-prompt-governance.yml | npm run check:open-source-governance; npm run check:seis-master-prompt | External GitHub branch settings must be verified before claiming enforcement. |
| god-mode-every-topic-feature-growth | active | Treat God Mode as incomplete unless Dashboard, Goals, Repos, Docs, Agents, security, AI policy, rollback, validation, and handoff all receive explicit feature or governance improvement evidence. | content/development/seis-god-mode-module-coverage.json; content/development/seis-god-mode-completion-audit.json; roadmap/seis-next-steps-implementation-pack.md; docs/governance/seis-god-mode-module-coverage.md | npm run check:seis-god-mode-module-coverage; npm run check:seis-god-mode-completion-audit; npm run check:seis-god-mode-work-package | Commit, push, CI, and final staged-boundary evidence are still required before the broad God Mode objective can be marked complete. |

## SSH Hardening Operation Coverage

| Area | Contract evidence | Covered objective areas |
| --- | --- | --- |
| Mode isolation | hardenDisallowsNormalUserCreation=true; fullSetupRequiresUserSetupStep=true; auditMutatesHost=false; dashboardMutatesHost=false; verifyMutatesHost=false; dryRunMutatesHost=false | Security and privacy; user-work protection; reliability |
| Firewall and lockout safety | portKnockApplyDefault=false; liveApplyPreflightConfirmationRequired=true; liveApplyRequiresPlanAndRecoveryReview=true; mutatingApplyRequiresInteractiveConfirmOrExplicitCliFlag=true; nonInteractiveLiveApplyRequiresExplicitCliFlag=--confirm-live-apply-safety; planMustExposeLiveApplySafetyPolicy=true; operationReportMustExposeLiveApplySafetyEvidence=true; verificationReportMustExposeLiveApplySafetyEvidence=true; liveApplySafetyEvidenceMustExposeConfirmationStatus=true; secondAccessPathRequired=true; maintenanceWindowRequired=true | Security and privacy; cloud automation; operational reliability |
| Idempotency and failure handling | singleOperationReportRequired=true; managedWritesMustBeIdempotent=true; criticalMutationMustFailFast=true; rollbackEvidenceRequiredOnFailure=true | Maintainability; rollback readiness; testability |

## Required Validation Path

```bash
npm run check:seis-master-objective-coverage
npm run check:seis-master-objective-coverage-report
npm run check:seis-god-mode-module-coverage
npm run check:seis-god-mode-work-package
npm run check:seis-god-mode-completion-audit
npm run check:seis-operational-goal-tracker
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
npm run quality
```

## Completion Rule

Coverage is complete only when required checks pass or the maintainer explicitly waives them with evidence.

## Current Limitation

The coverage items are mapped, not validated, until the required checks are run
or explicitly waived by the maintainer.
