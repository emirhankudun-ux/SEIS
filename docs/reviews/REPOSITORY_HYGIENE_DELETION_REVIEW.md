# Repository Hygiene Deletion Review

Date: 2026-06-19

This review records the 47 tracked paths that are deleted in the current
worktree. It does not approve deletion, restoration, or replacement. It exists
to make the repository hygiene blocker inspectable before any destructive or
history-changing action.

## Current State

| Check | Result |
| --- | --- |
| Branch | `codex/sync-icloud-seis-20260619` |
| Remote state | Local branch is ahead of origin. |
| Deleted tracked paths | 47 |
| Deletions staged | No |
| Deletions committed in this review | No |
| Foundation impact | `npm run check:foundation` fails because required governance docs and `scripts/check-open-source-governance.mjs` are missing. |

## Action Classes

| Action | Meaning |
| --- | --- |
| Restore or replace before merge | The path is required by current validators, package scripts, or source references. |
| Review caller contract | The path may be removable only after callers, scripts, docs, and tests are updated. |
| Archive or summarize | The content may be historical/generated, but should be intentionally preserved or summarized before removal. |
| Requires human approval if deleting | Intentional deletion must be approved because file deletion is a dangerous action under SEIS policy. |

## Deletion Classification

| Path | Classification | Evidence | Recommended next safe action |
| --- | --- | --- | --- |
| `docs/architecture/case-study-detail-route-proposal.md` | Architecture proposal | Deleted tracked doc; likely tied to case-study route checks. | Review with `scripts/check-case-study-detail-route-proposal.mjs`; restore, replace, or archive intentionally. |
| `docs/decisions/framework-decision-record.md` | Architecture decision | Deleted tracked decision doc; likely tied to framework validation. | Review with `scripts/check-framework-decision.mjs`; restore or replace before removing validator references. |
| `docs/deployment/cloud-environment.md` | Deployment governance | Deleted tracked deployment doc. | Restore or replace before claiming cloud/deploy readiness. |
| `docs/development/agents/interface-agent.md` | Agent documentation | Deleted tracked agent doc. | Review against active agent-runtime direction before removal. |
| `docs/development/ai-cli-stack.md` | AI/developer workflow documentation | Deleted tracked development doc. | Archive or merge useful content into active AI Core/governance docs before removal. |
| `docs/development/llm-role-routing-blueprint.md` | AI Core planning documentation | Deleted tracked routing doc. | Compare with current AI Core foundation docs; archive or merge provider-neutral ideas. |
| `docs/governance/branch-policy.md` | P0 foundation blocker | Required by `scripts/check-foundation.mjs`; currently missing. | Restore or replace before foundation checks can pass. |
| `docs/governance/open-source-governance.md` | P0 foundation blocker | Required by `scripts/check-foundation.mjs`; currently missing. | Restore or replace before foundation checks can pass. |
| `docs/governance/seis-supreme-v12-constitution.md` | P0 source-of-truth blocker | Linked from `AGENTS.md` and required by `scripts/check-foundation.mjs`; currently missing. | Restore or replace with current SEIS constitution before merge. |
| `docs/plans/long-development-roadmap.md` | Roadmap/history documentation | Deleted tracked planning doc. | Merge useful active items into `docs/roadmap/MASTER_BACKLOG.md` or archive as historical. |
| `docs/polyglot/language-balance-plan.md` | Polyglot/platform planning | Deleted tracked doc. | Review with language-distribution reports before removal. |
| `docs/quality/experience-budget.md` | Quality/performance governance | Deleted tracked quality doc; package still has `check:run-budget`. | Restore or replace if quality budget remains active. |
| `handoff/local-md-inventory-and-cleanup-2026-06-16.md` | Handoff/provenance | Deleted tracked handoff record. | Archive or summarize before intentional removal. |
| `packages/seis-ai/src/agent/loop.mjs` | Runtime source | Deleted tracked source file. | Review package callers and tests before deletion; restore if `seis:agent` still depends on it. |
| `packages/seis-ai/test/agent.test.mjs` | Test source | Deleted tracked test file. | Restore or replace tests before claiming agent-runtime validation. |
| `packages/seis_kernel/capabilities.py` | Kernel source | Referenced by `scripts/check-seis-nonjs-kernel.py`; currently missing. | Restore or update kernel validator and package contract together. |
| `packages/seis_kernel/execution_runway.py` | Kernel source | Referenced by `scripts/check-seis-nonjs-kernel.py`; currently missing. | Restore or update kernel validator and execution runway docs together. |
| `reports/desktop-app-integration.md` | Generated/report evidence | Deleted tracked report. | Archive or regenerate only if still part of readiness evidence. |
| `reports/language-distribution.md` | Generated/report evidence | Deleted tracked report. | Restore/regenerate if language-distribution checks remain active. |
| `reports/requested-plugin-trace.md` | Generated/report evidence | Deleted tracked report. | Restore/regenerate if requested-plugin trace remains part of plugin readiness. |
| `reports/seis-execution-packages.md` | Generated/report evidence | Deleted tracked report. | Restore/regenerate with execution-package script if still active. |
| `reports/seis-execution-runway.md` | Generated/report evidence | Deleted tracked report. | Restore/regenerate with execution-runway script if still active. |
| `reports/seis-platform-language-policy.md` | Generated/report evidence | Deleted tracked report. | Restore/regenerate if language-policy checks remain active. |
| `reports/seis/100-question-implementation-log.md` | Historical report | Deleted tracked report. | Archive as historical or summarize useful implementation evidence. |
| `reports/third-party-adaptation-plan.md` | Third-party governance report | Deleted tracked report. | Review for clean-room/provenance relevance before removal. |
| `reports/third-party-intake-blueprint.md` | Third-party governance report | Deleted tracked report. | Review for clean-room/provenance relevance before removal. |
| `reports/toolchain-runtime-readiness.md` | Toolchain readiness report | Deleted tracked report. | Restore/regenerate if used as readiness evidence. |
| `scripts/build-static.mjs` | Package script blocker | Referenced by `package.json` as `build:static`. | Restore or replace before static build claims. |
| `scripts/check-case-study-detail-model.mjs` | Validation script | Deleted tracked validator. | Restore or remove related check references after review. |
| `scripts/check-case-study-detail-route-proposal.mjs` | Validation script | Deleted tracked validator. | Restore or remove related check references after review. |
| `scripts/check-code-automation-plan.cjs` | Validation script | Referenced by `package.json` as `check:code-automation-plan`. | Restore or replace before automation readiness claims. |
| `scripts/check-framework-decision.mjs` | Validation script | Deleted tracked validator. | Restore or remove related decision check after review. |
| `scripts/check-open-source-governance.mjs` | P0 foundation blocker | Referenced by `package.json`, CI/governance flow, and `scripts/check-foundation.mjs`; currently missing. | Restore or replace before foundation checks can pass. |
| `scripts/check-seis-closed-code.mjs` | Validation script | Deleted tracked validator. | Review with `SEIS_CLOSED_CODE.md` before removal. |
| `scripts/check-seis-plugin-bundle.mjs` | Plugin validation script | Referenced by package plugin checks; currently missing. | Restore or update plugin bundle scripts together. |
| `scripts/check-server-targets.mjs` | Server/dry-run validation script | Referenced by package server scripts. | Restore or replace before server handoff/readiness claims. |
| `scripts/check-static-build.mjs` | Static build validation script | Referenced by shipping flow. | Restore or replace before release/public readiness claims. |
| `scripts/check-uixappttr-branch.mjs` | Historical branch validation | Referenced by package as `check:uixappttr-topology` indirectly through publish checks. | Review historical naming and replace with current SEIS wording if still needed. |
| `scripts/check-workspace.cjs` | Workspace validation script | Referenced by `package.json` and automation scripts. | Restore or replace before workspace automation is claimed ready. |
| `scripts/create-ai-release-manifest.cjs` | Report generator | Referenced by package release manifest checks. | Restore/regenerate path or remove package script after review. |
| `scripts/create-development-summary.mjs` | Report generator | Deleted tracked generator. | Restore if development summaries remain active; otherwise archive intentionally. |
| `scripts/create-language-distribution-report.py` | Report generator | Referenced by package language-distribution check. | Restore or replace before language-distribution validation claims. |
| `scripts/create-seis-ecosystem-intake.cjs` | Report generator | Referenced by package ecosystem-intake check. | Restore or replace before ecosystem-intake validation claims. |
| `scripts/create-seis-platform-language-policy.py` | Report generator | Referenced by package language-policy check. | Restore or replace before language-policy validation claims. |
| `scripts/create-server-drop.mjs` | Server handoff generator | Deleted tracked generator. | Restore or replace before server-drop workflows are claimed ready. |
| `scripts/create-server-handoff.mjs` | Server handoff generator | Deleted tracked generator. | Restore or replace before server handoff workflows are claimed ready. |
| `scripts/scan-icloud-personal-assets.cjs` | Sensitive/local asset scanner | Deleted tracked scanner; may touch personal workspace inventory. | Review privacy behavior before restoring or removing. |

## Summary By Risk

| Risk level | Paths | Reason |
| --- | --- | --- |
| P0 foundation blockers | 4 | Directly block `npm run check:foundation`. |
| Runtime/test/kernel blockers | 4 | Deleted package/kernel source or tests referenced by validators. |
| Other script/validator/generator deletions | 19 | Deleted scripts need restore, replacement, package-script updates, or intentional removal review. |
| Documentation/report/handoff hygiene | 20 | Docs, reports, and handoff files need archive, merge, regenerate, or intentional removal decision. |

## Recommended Recovery Order

1. Restore or replace the P0 governance docs and `scripts/check-open-source-governance.mjs`.
2. Re-run `npm run check:foundation`.
3. Review package scripts that point to deleted validators/generators.
4. Review deleted runtime/test files before any implementation-readiness claim.
5. Decide which reports should be regenerated, archived, or intentionally removed.

## Human Approval Needed

Human approval is required before intentionally deleting any of these tracked
files. This review does not grant that approval.

## Final Decision

Not ready for merge. The safe next action is a focused repository hygiene PR
that restores or replaces the P0 governance files before broader cleanup.
