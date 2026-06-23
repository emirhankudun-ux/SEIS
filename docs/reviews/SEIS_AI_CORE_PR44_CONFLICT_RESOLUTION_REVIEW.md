# SEIS AI Core PR44 Conflict Resolution Review

Date: 2026-06-23

Status: conflict-resolution planning review

## Purpose

Classify the current PR #44 conflict before any merge, rebase, force-push,
branch deletion, workflow dispatch, or branch-protection decision.

This review is intentionally read-only. It does not resolve conflicts, merge
PR #44, change `main`, run SSH, deploy, call model providers, train models,
publish checkpoints, or claim production readiness.

## Evidence Snapshot

| Evidence | Value |
| --- | --- |
| Pull request | #44 |
| PR URL | `https://github.com/emirhankudun-ux/SEIS/pull/44` |
| Base | `main` |
| Head | `seis/ai-core-app-foundation-continuation` |
| Latest head commit inspected | `d215d1c docs: record ai core pr conflict review` |
| Merge base inspected | `ec77b6422ef2ce108fc097d87b526ddf2239c9d1` |
| Current `origin/main` inspected | `f8c0c5a097c23a4b1275174d177203b6bf287349` |
| GitHub mergeability | `CONFLICTING` |

## Diff Scope Summary

| Comparison | Changed paths | Dominant areas |
| --- | ---: | --- |
| Merge base to PR branch | 133 | `docs`, `packages`, `scripts`, `apps`, `reports`, `roadmap` |
| Merge base to current main | 307 | `scripts`, `docs`, `packages`, `content`, `plugins`, `reports`, `server`, `apps` |
| Paths changed by both sides | 17 | workflows, `apps/seis-core`, generated reports, package scripts, Command Center docs |
| Branch-only paths | 116 | AI Core foundation docs, fixture schemas, QA scripts, browser evidence workflow |
| Main-only paths | 290 | governance, SEIS Universe seed-model lane, plugin lanes, SSH/cloud, god-mode operating system artifacts |

The conflict is broad enough that a whole-branch merge is unsafe without a
file-classification pass.

## Shared Conflict Hotspots

| Area | Paths | Conflict Type | Recommended Handling |
| --- | --- | --- | --- |
| CI workflow | `.github/workflows/ci.yml` | both modified | Manual line-level review. Keep metadata-safe checks, avoid adding browser-required gates before artifact evidence. |
| Public docs | `README.md` | both modified | Merge message-level content only after current public status language is reconciled. |
| Command Center app | `apps/seis-core/README.md`, `apps/seis-core/index.html`, `apps/seis-core/script.js`, `apps/seis-core/styles.css`, `apps/seis-core/test/seis-core-static.test.js` | both modified | Treat as highest-risk product conflict. Compare current main router surfaces with branch AI Core fixture panels before editing. |
| Browser app tests | `apps/web/test/scripts.test.js` | both modified | Preserve current main expectations unless AI Core tests are re-ported with passing evidence. |
| Architecture docs | `docs/architecture/seis-command-center.md` | both modified | Consolidate, do not overwrite. Main governance language and branch AI Core evidence language both need review. |
| Package scripts | `package.json` | both modified | Manually merge scripts; do not remove main checks or branch AI Core checks without replacement evidence. |
| Generated reports | `reports/language-distribution.*`, `reports/seis-technology-stack.*`, `content/development/seis-technology-stack.json` | both modified | Regenerate after final file decisions; do not hand-merge generated counters. |
| Validator scripts | `scripts/check-seis-command-center.mjs`, `scripts/create-language-distribution-report.py` | both modified | Manual review required; preserve main validators and port branch evidence checks only if still relevant. |

## Branch Assets To Keep Or Re-Port

| Category | Representative Paths | Recommended Action |
| --- | --- | --- |
| AI Core foundation docs | `docs/ai/seis-ai-core.md`, `docs/ai/model-router.md`, `docs/ai/prompt-engine.md`, `docs/ai/agent-runtime.md`, `docs/ai/provider-routing-policy.md` | Keep conceptually. Re-port into current main docs if missing or superseded. |
| Provider and model safety docs | `docs/security/model-provider-data-policy.md`, `docs/ai/checkpoint-governance.md`, `docs/ai/model-card-template.md` | Keep or merge into main security/model governance docs. Preserve non-claim language. |
| Evaluation foundation | `docs/evals/evaluation-strategy.md`, `docs/evals/benchmark-integrity.md`, `docs/evals/ai-core-browser-evidence-gates.md` | Keep if current main lacks equivalent eval gates. Reconcile with current main validation system. |
| Prompt/router/runtime contracts | `packages/model-router/**`, `packages/prompt-engine/**`, `packages/agent-runtime/**`, `packages/shared-types/**`, `packages/tool-registry/**` | Extract into a smaller PR or port into current main package architecture. Do not mix with unrelated governance changes. |
| Local fixture evidence | `packages/data/fixtures/**`, `reports/evals/**`, `scripts/check-*-contracts.mjs` | Preserve as branch-local evidence. Regenerate or rename if main has newer evidence lanes. |
| Manual browser evidence workflow | `.github/workflows/ai-core-browser-evidence.yml` | Keep only after workflow review. It must remain `workflow_dispatch`, provider-free, SSH-free, deployment-free, and non-required until first artifact evidence exists. |

## Branch Assets To Extract Into Smaller PRs

| Slice | Representative Paths | Reason |
| --- | --- | --- |
| AI Core docs only | `docs/ai/**`, `docs/security/model-provider-data-policy.md`, `docs/evals/evaluation-strategy.md` | Lowest-risk first recovery slice; mostly documentation and non-claim policy. |
| Contract fixtures | `packages/model-router/**`, `packages/prompt-engine/**`, `packages/agent-runtime/**`, `packages/shared-types/**` | Needs package-script reconciliation before merge. |
| Command Center UI projection | `apps/seis-core/**`, `scripts/check-seis-command-center.mjs` | Highest app conflict; should be ported after current main app shape is inspected. |
| Browser QA evidence | `.github/workflows/ai-core-browser-evidence.yml`, `scripts/capture-seis-core-ai-core-panel-navigation.mjs`, `scripts/check-ai-core-browser-qa-evidence.mjs`, `reports/evals/ai-core-panel-navigation-browser-qa.md` | Should follow UI projection slice; browser artifacts depend on final app surface. |

## Current Main Assets To Preserve

| Category | Representative Paths | Reason |
| --- | --- | --- |
| Governance and operating-system lane | `docs/governance/seis-god-mode-*`, `content/development/seis-god-mode-*`, `roadmap/seis-next-steps-implementation-pack.md` | Current main appears to carry a newer governance/product lane. Do not delete through PR #44. |
| SEIS Universe seed-model lane | `packages/seis-ai/**`, `SEIS_UNIVERSE_*`, `scripts/check-seis-universe-*` | Main has a separate model-research/scaffold lane. Branch AI Core docs must not overwrite it. |
| Plugin and MCP lane | `plugins/seis-ai-agent/**`, `plugins/seis/**`, `docs/platform/**` | Current main contains plugin/skill integration work that must remain source-of-truth until reviewed separately. |
| SSH/cloud lane | `server/cloud/ssh-ai-shell/**`, `scripts/check-seis-ssh-*`, `docs/deployment/**` | Requires separate security review; PR #44 should not modify these. |
| Public readiness and repo governance | `.env.example`, `.gitignore`, `.github/PULL_REQUEST_TEMPLATE.md`, root `AGENTS.md`, `ARCHITECTURE.md`, `ROADMAP.md` | Source-of-truth governance files from main should not be replaced by branch-era text. |

## Generated Or Stale Candidates

These should be regenerated only after the final conflict decisions are made:

- `reports/language-distribution.json`
- `reports/language-distribution.md`
- `reports/seis-technology-stack.json`
- `reports/seis-technology-stack.md`
- `content/development/seis-technology-stack.json`
- `release/web/index.html`

Do not hand-edit generated counters as the conflict-resolution mechanism.

## Exclude From Automatic Merge

- Any change that deletes current main governance, SEIS Universe, plugin, SSH,
  or public-readiness work without source-of-truth review.
- Any workflow change that makes browser evidence required before first
  GitHub artifact evidence exists.
- Any provider, key, deployment, SSH, training, benchmark, checkpoint, or model
  ownership claim not backed by current evidence.
- Any generated report change that has not been regenerated after final file
  selection.

## Recommended Resolution Order

1. Create a fresh conflict-resolution branch from current `main`.
2. Re-port the AI Core foundation docs and safety policies first.
3. Run documentation and source-of-truth checks.
4. Re-port model-router, prompt-engine, agent-runtime, shared-types, and tool
   registry contract fixtures as a second slice.
5. Reconcile package scripts and validators.
6. Re-port Command Center AI Core UI projection only after inspecting current
   main `apps/seis-core` shape.
7. Re-port browser QA and manual workflow last.
8. Regenerate language and technology-stack reports after final file selection.
9. Open a clean replacement PR or update PR #44 with a deliberate
   conflict-resolution commit.

## Human Approval Needed

- Merge PR #44 or any replacement PR.
- Resolve conflicts by deleting current main files.
- Force-push, rebase, or rewrite PR history.
- Add branch-protection requirements.
- Dispatch workflow as default-branch evidence after merge.
- Run SSH, deployment, provider calls, training, benchmarks, dataset downloads,
  or checkpoint/model-card publication.

## Final Decision

- Safe to auto-merge PR #44: no.
- Safe to recover branch content through smaller slices: yes.
- Highest priority recovery slice: AI Core foundation docs and safety policies.
- Highest-risk recovery slice: Command Center app UI and validator merge.
- Required next action: create a fresh main-based conflict-resolution branch or
  a deliberate PR #44 conflict-resolution commit with the file classes above.
