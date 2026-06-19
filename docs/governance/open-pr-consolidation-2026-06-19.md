# Open PR Consolidation Review

Date: 2026-06-19

This review turns the current open pull request backlog into one controlled
replacement path before SEIS starts the next specialist plugins, SEIS AI, MCP,
and SSH integration pass.

## Objective

Keep `main` as the source of truth, avoid merging stale or duplicate branches
one by one, and use this consolidation PR as the canonical review artifact for
the open PR queue.

This PR does not merge old branches directly. It records what should be
superseded, what should be extracted later, and what must remain gated until a
dedicated follow-up PR exists.

## Baseline

| Item | Current state |
|---|---|
| Base branch | `main` |
| Replacement branch | `seis/open-pr-consolidation-20260619` |
| Repository | `emirhankudun-ux/SEIS` |
| Live SSH operations | Excluded |
| Deployment operations | Excluded |
| Main branch merge | Requires review and explicit approval |

## Consolidation Policy

1. Use this PR as the single replacement review path for the old open PR queue.
2. Do not merge stale branches wholesale.
3. Do not close old PRs automatically; close or supersede them only after human
   approval.
4. Extract code only through small follow-up PRs when the code is still needed.
5. Keep SSH, cloud, private infrastructure, and deployment work in a separate
   approval-gated lane.
6. Keep portfolio/PWA work separate from core SEIS foundation work.
7. Keep SEIS specialist plugins, SEIS AI, MCP, and SSH integration as the next
   implementation PR after this queue is cleaned up.

## Open PR Decisions

| PR | Title | Decision | Reason |
|---:|---|---|---|
| #37 | `ci: stabilize main governance and secret scans` | Supersede through this consolidation path; extract conflict-free security changes later if still needed. | Small and useful, but currently `DIRTY`; direct cherry-pick conflicts in generated language reports. |
| #33 | `Codex/sync icloud seis 20260619` | Supersede; do not merge wholesale. | Very large PR; CodeRabbit skipped review because it exceeded file limits. |
| #32 | `Codex/publish local seis 20260618 163043` | Supersede after diffing against merged foundation work. | Older publish/local SEIS work overlaps with merged foundation branches. |
| #28 | `Update from task 03e00d7b-7588-43dc-b46c-c02de97972b8` | Keep separate; SSH/cloud follow-up only. | SSH/cloud work is high risk and requires an approval-gated implementation lane. |
| #27 | `Main-first governance, language-boundary policy, and polyglot capability kernel` | Supersede after checking for unique docs or validators. | Foundation, governance, and polyglot areas now overlap with merged main. |
| #24 | `feat(seis): stabilize swift diagnostics and align language-governance artifacts` | Supersede after checking for unique Swift/language governance changes. | Likely overlapped by current Apple-first platform and language policy records. |
| #23 | `feat: portfolio as app + website - installable PWA + macOS demo` | Keep separate as draft app/portfolio work. | Portfolio/PWA work should not block core foundation cleanup. |
| #22 | `Harden SEIS cloud readiness guards` | Supersede or extract into later cloud readiness PR. | Cloud readiness belongs in a scoped, provider-neutral follow-up. |
| #20 | `Consolidate all open PRs` | Supersede with this PR. | Too broad to merge as-is; useful only as an index signal. |
| #19 | `Codex/seis platform polyglot kernel` | Supersede after checking for unique polyglot changes. | Older branch overlaps with merged polyglot/foundation work. |
| #16 | `Add SEIS evolution model, publish-gate, and aggressive execution safety tooling + UI` | Supersede with a canonical evolution-model follow-up if needed. | Duplicate evolution-model family. |
| #12 | `feat: register all 179 installed Codex plugins across lanes and categories` | Extract only if it matches current installed-plugin audit records. | Plugin registry data must be evidence-backed and current. |
| #11 | `Add CLAUDE.md: operating instructions + test improvement roadmap` | Summarize into governance docs only if still needed. | AGENTS and SEIS governance docs remain authoritative. |
| #10 | `Introduce SEIS evolution model, publish-gate, aggressive execution plan, UI panels and validation scripts` | Supersede with the duplicate evolution-model group. | Duplicate of #16/#9/#8/#7/#6/#5/#2/#1 family. |
| #9 | `Introduce SEIS evolution model, publish-gate, aggressive execution plan, UI panels and validation scripts` | Supersede with the duplicate evolution-model group. | Duplicate evolution-model family. |
| #8 | `Add SEIS evolution model, publish-gate & aggressive execution plan with UI and validation scripts` | Supersede with the duplicate evolution-model group. | Duplicate evolution-model family. |
| #7 | `Add SEIS evolution model, publish-gate and GitHub-remote artifacts with UI and validation checks` | Supersede with the duplicate evolution-model group. | Duplicate evolution-model family. |
| #6 | `Add SEIS evolution model, publish-gate and GitHub-remote artifacts with UI and validation checks` | Supersede with the duplicate evolution-model group. | Duplicate evolution-model family. |
| #5 | `Add SEIS evolution model, publish-gate and GitHub-remote artifacts with UI and validation checks` | Supersede with the duplicate evolution-model group. | Duplicate evolution-model family. |
| #3 | `Add portfolio content and UI, resilient JSON loading, service-worker cache bump, and build fallback` | Keep separate as app/portfolio work. | Portfolio content should not be merged into the foundation cleanup PR. |
| #2 | `Add SEIS evolution model, documentation, and validation script` | Supersede with the duplicate evolution-model group. | Duplicate evolution-model family. |
| #1 | `Add GitHub SEIS operating model` | Supersede with current governance docs. | Current main already contains newer governance material. |

## Follow-Up PR Sequence

1. Merge this consolidation PR after review.
2. With explicit approval, close or mark superseded old PRs that this record
   replaces.
3. Open a scoped `seis/specialist-ai-mcp-ssh-integration` PR for:
   - SEIS specialist plugin package alignment,
   - SEIS AI package and agent runtime alignment,
   - MCP bundle validation,
   - SSH/cloud documentation and dry-run checks only.
4. Open separate PRs for SSH live operations, portfolio/PWA work, and any
   unique polyglot or Swift changes that remain valuable.

## Excluded From This PR

- No direct merge from open PR branches.
- No SSH connection, host mutation, firewall change, key rotation, or sudo
  operation.
- No deployment, release, or cloud provider mutation.
- No branch deletion or PR closure.
- No dependency installation.
- No generated report conflict resolution from stale branches.

## Validation Plan

Run the lightest reliable checks:

```bash
npm run check:foundation
npm run seis:check
npm run check:open-source-governance
git diff --check
```

Specialist plugin and SSH/cloud checks belong to the next scoped integration
PR unless this PR touches those files.
