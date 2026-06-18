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
| Coverage items | 8 |
| Completion rule | Do not mark the SEIS Master Prompt objective complete unless every coverage item is validated or explicitly waived by the maintainer and the required quality path has current evidence. |

## Coverage Matrix

| ID | Status | Requirement | Evidence | Checks | Gap |
| --- | --- | --- | --- | --- | --- |
| user-work-protection | mapped | Protect user work and avoid destructive operations without explicit approval. | AGENTS.md; .github/CODEOWNERS; data/seis-operational-goal-tracker.json; docs/governance/seis-master-prompt-change-checklist.md | npm run check:seis-operational-goal-tracker; npm run check:seis-master-prompt | Validation has not been run in the current editing turn. |
| security-and-privacy | mapped | Prioritize security and privacy; never expose secrets, credentials, tokens, or private keys. | SECURITY.md; data/ssh-hardening-operation-contract.json; plugins/seis/skills/seis-security-review/SKILL.md; scripts/check-ssh-hardening-contract.mjs; scripts/check-seis-master-prompt.mjs; docs/deployment/ssh-wireguard-vps-cloud-server.md | npm run check:ssh-hardening-contract; npm run check:seis-master-prompt | Secret-pattern, mode-isolation, lockout-safety, rollback, idempotency, and fail-fast checks are defined but were not run in the current editing turn. |
| architecture-and-maintainability | mapped | Preserve architecture, simplicity, maintainability, and long-term ecosystem value. | data/seis-master-prompt-implementation-map.json; docs/governance/adr-0001-seis-master-prompt-operating-contract.md; docs/governance/branch-policy.md; data/seis-operational-goal-tracker.json | npm run check:seis-master-prompt; npm run check:foundation; npm run quality | Architecture checks are listed but were not run in the current editing turn. |
| documentation-traceability | mapped | Ground work in documentation, evidence, traceability, and generated reports. | README.md; docs/governance/seis-master-prompt.md; reports/seis-master-prompt-governance.md; data/seis-master-prompt-acceptance-criteria.json | npm run check:seis-master-prompt-report; npm run check:seis-master-prompt; npm run check:seis-master-objective-coverage | Generated report freshness must be checked before claiming current status. |
| apple-first-platform | mapped | Keep SEIS Apple-first while preserving practical web, backend, infrastructure, and AI support. | data/seis-operational-goal-tracker.json; reports/language-distribution.md; content/development/seis-technology-stack.json; packages | npm run check:seis-platform-language-policy; npm run check:seis-platform-kernel; npm run check:language-distribution; npm run check:seis-technology-stack | Platform and generated technology reports must be refreshed/checked after source-surface changes. |
| design-accessibility-experience | mapped | Improve product/design quality, accessibility, responsive behavior, UX, and user experience. | apps/web; data/seis-operational-goal-tracker.json; reports/seis-technology-stack.md | npm run check:web; npm run check:motion-evidence; npm run check:mobile-ergonomics | Design and accessibility checks were not run in the current editing turn. |
| ai-data-cloud-automation | mapped | Keep AI, agent, MCP, data, automation, and cloud strategy concrete, secure, and tied to repository artifacts. | plugins/seis/.codex-plugin/plugin.json; plugins/seis/skills; mcp; data/seis-operational-goal-tracker.json; data/ssh-hardening-operation-contract.json; docs/deployment/ssh-wireguard-vps-cloud-server.md | npm run check:ai-stack; npm run check:seis-repos-llm-bridge; npm run check:cloud-access-policy; npm run check:ssh-vpn-cloud-server | AI, MCP, and cloud checks were not run in the current editing turn. |
| open-source-github-readiness | mapped | Keep GitHub as source of truth with open-source readiness, main-centered governance, and no unverified readiness claims. | README.md; CODEX.md; .github/workflows/seis-master-prompt-governance.yml; data/seis-master-prompt-github-controls.json; data/seis-operational-goal-tracker.json | npm run check:open-source-governance; npm run check:github-remote-configuration; npm run check:seis-unified-github-visibility | GitHub external state must be verified before claiming pushed, protected, ready, or current. |

## SSH Hardening Operation Coverage

| Area | Contract evidence | Covered objective areas |
| --- | --- | --- |
| Mode isolation | hardenDisallowsNormalUserCreation=true; fullSetupRequiresUserSetupStep=true; auditMutatesHost=false; dashboardMutatesHost=false; verifyMutatesHost=false; dryRunMutatesHost=false | Security and privacy; user-work protection; reliability |
| Firewall and lockout safety | secondAccessPathRequiredBeforeApply=true; portKnockApplyDefault=false; ufwAndFirewalldMustRemainExplicitlySeparated=true; strictFirewalldKnockGuardUnsupportedWithoutOperatorReview=true; serviceRestartRequiresReviewedPlan=true; liveApplyRequiresMaintenanceWindow=true; liveApplyPreflightConfirmationRequired=true; liveApplyRequiresPlanAndRecoveryReview=true; mutatingApplyRequiresInteractiveConfirmOrExplicitCliFlag=true; nonInteractiveLiveApplyRequiresExplicitCliFlag=--confirm-live-apply-safety; planMustExposeLiveApplySafetyPolicy=true; operationReportMustExposeLiveApplySafetyEvidence=true; verificationReportMustExposeLiveApplySafetyEvidence=true; liveApplySafetyEvidenceMustExposeConfirmationStatus=true | Security and privacy; cloud automation; operational reliability |
| Idempotency and failure handling | managedConfigBlocksRequired=true; dedupeManagedLinesRequired=true; packageInstallFailureMustStopApply=true; serviceRestartFailureMustStopApplyWhenRestartEnabled=true; retryCountsMustBeConfigDriven=true; singleOperationReportRequired=true; verificationReportRequired=true | Maintainability; rollback readiness; testability |

## Required Validation Path

```bash
npm run check:seis-master-objective-coverage
npm run check:seis-master-objective-coverage-report
npm run check:seis-operational-goal-tracker
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
npm run quality
```

## Completion Rule

Do not mark the SEIS Master Prompt objective complete unless every coverage item is validated or explicitly waived by the maintainer and the required quality path has current evidence.

## Current Limitation

The coverage items are mapped, not validated, until the required checks are run
or explicitly waived by the maintainer.
