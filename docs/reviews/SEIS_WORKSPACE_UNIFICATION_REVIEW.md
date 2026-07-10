# SEIS Workspace Unification Review

Date: 2026-06-23

## Purpose

This review reduces SEIS workspace confusion by defining one canonical local
working root and classifying nearby SEIS-like folders as review-only inputs,
worktrees, archives, backups, or separate repositories.

It does not merge, delete, move, push, deploy, or rewrite history.

## Scope

Inspected from the workspace parent using read-only filesystem and Git commands:

- top-level folders whose names contain `SEIS` or `seis`
- Git worktree metadata visible from the canonical repository
- current branches and dirty-state counts where Git could inspect them
- existing integration policy, status, backlog, and next PR queue documents

## Current Status

| Area | Status | Evidence | Next Safe Action |
| --- | --- | --- | --- |
| Canonical writable root | `SEIS/` | `git worktree list --porcelain` shows this root on `codex/plugin-interface-handoff-20260623`; `origin` points to `emirhankudun-ux/SEIS`. | Continue all new SEIS repo work from `SEIS/` unless the user explicitly selects a different checkout. |
| Protected source of truth | GitHub repository `emirhankudun-ux/SEIS` | `git remote -v` in `SEIS/` points to the GitHub repository. | Use scoped branches and PRs; do not push to `main`. |
| Active branch during this pass | `codex/plugin-interface-handoff-20260623` | `git status --short --branch` and `git worktree list --porcelain`. | Keep current changes review-scoped; push only if explicitly approved. |
| Existing worktree set | Multiple SEIS worktrees exist | `SEIS-ai-core-app-foundation-continuation/`, `SEIS-ai-model-env-defaults/`, `SEIS-ai-workforce-assignments-20260623/`, `SEIS-download-assets-app-integration/`, `SEIS-goal-tracking-os-foundation/`. | Treat each as a PR candidate, not a second source of truth. |
| Legacy/broken worktree folders | Present | `SEIS-ai-core-app-foundation/`, `SEIS-ai-demo-app-worktree/`, and `SEIS-open-pr-consolidation-20260619/` contain `.git` markers but were not inspectable as healthy Git repositories through `git -C`. | Do not bulk import. Review metadata and recover only specific files through a dedicated rescue PR. |
| Separate SEIS-like repo | Present | `seis-digital-experience-foundation/` was not inspectable as the same Git repository in this pass. | Keep separate until explicitly selected for intake. |
| Secondary checkout | Present | `Github/SEIS/` points to the same GitHub repository but uses a different local branch. | Do not edit unless the user explicitly selects the SSH-AI workstream. |

## Canonical Path Rule

From the shared workspace parent, the canonical local SEIS working root is:

```text
SEIS/
```

Operational rule:

1. Start all general SEIS work in `SEIS/`.
2. Treat every other SEIS-like folder as read-only until its diff is reviewed.
3. Extract one coherent workstream at a time into `SEIS/` through a named branch
   and PR queue entry.
4. Never bulk-copy a worktree, archive, generated folder, backup, nested repo,
   or media folder into `SEIS/`.
5. Never delete or retire another folder without explicit approval and a
   rollback note.

## Workspace Classification

| Relative path | Classification | Reason | Action |
| --- | --- | --- | --- |
| `SEIS/` | Canonical writable root | Main inspected repository, current branch, GitHub origin, active docs and product surface. | Continue here. |
| `SEIS-ai-core-app-foundation-continuation/` | Reviewable worktree | Healthy worktree for AI Core continuation branch. | Compare diff, extract AI Core contracts into a dedicated PR. |
| `SEIS-ai-model-env-defaults/` | Reviewable worktree | Healthy worktree with clean status in this pass. | Keep available for provider/env workstream review. |
| `SEIS-ai-workforce-assignments-20260623/` | Reviewable worktree | Healthy worktree with clean status in this pass. | Keep available for workforce/agent assignment review. |
| `SEIS-download-assets-app-integration/` | Reviewable worktree | Healthy worktree with clean status in this pass. | Review asset provenance before integration. |
| `SEIS-goal-tracking-os-foundation/` | Reviewable worktree | Healthy worktree with clean status in this pass. | Use only for targeted Goal Tracking comparison. |
| `SEIS-ai-core-app-foundation/` | Legacy/broken worktree candidate | `.git` marker exists but Git inspection did not resolve it as a healthy repo in this pass. | Do not import; repair or archive only after review. |
| `SEIS-ai-demo-app-worktree/` | Legacy/broken worktree candidate | `.git` marker exists but Git inspection did not resolve it as a healthy repo in this pass. | Do not import; recover specific useful files only after review. |
| `SEIS-open-pr-consolidation-20260619/` | Legacy/broken worktree candidate | `.git` marker exists but Git inspection did not resolve it as a healthy repo in this pass. | Keep as review reference; do not treat as current source. |
| `seis-digital-experience-foundation/` | Separate repo/intake candidate | Not confirmed as the same Git repository in this pass. | Keep separate unless a dedicated intake task is approved. |
| `Github/SEIS/` | Secondary checkout / SSH-AI workstream | Same GitHub project with a different local branch and dirty state. | Do not edit for general SEIS work; use only when SSH-AI workstream is explicitly selected. |

## Integration Flow

Use this order for every future SEIS consolidation step:

1. Open `SEIS/`.
2. Run `git status --short --branch`.
3. Identify the target workstream and compare only that workstream.
4. Create a narrow branch or use the current review branch.
5. Copy or reimplement only reviewed, non-secret, non-generated source.
6. Link the work from `docs/STATUS.md`, `docs/roadmap/MASTER_BACKLOG.md`, and
   `docs/roadmap/NEXT_PR_QUEUE.md`.
7. Run the smallest reliable validation already available.
8. Commit only the coherent slice.

## Deferred Dangerous Actions

The following were intentionally not performed:

- folder deletion
- branch deletion
- history rewrite
- bulk copying from other SEIS folders
- cherry-picking whole branches
- pushing to GitHub
- merging PRs
- SSH execution
- deployment
- secret rotation

## Human Approval Needed

Approval is required before:

- deleting or archiving any SEIS-like folder
- repairing broken worktree metadata if it may remove local work
- moving work between checkouts with file deletion
- pushing any branch
- merging, closing, or reopening PRs
- changing repository settings or branch protection

## Validation Performed

| Check | Result | Notes |
| --- | --- | --- |
| `jq empty content/development/seis-integration-map.json` | Passed | The machine-readable integration map remains valid JSON. |
| `git diff --check` | Passed | No whitespace errors were reported in the current diff. |
| `npm run check:foundation` | Passed | The repository foundation check completed successfully. |

## Validation Not Performed

- No physical folder merge.
- No branch cleanup.
- No deletion or archive move.
- No push, PR open, merge, or GitHub write action.
- No SSH, deployment, external provider call, secret rotation, model training,
  benchmark, or dataset download.

## Final Decision

Ready for internal review.

The canonical working path is now documented as `SEIS/`. Other SEIS folders are
not discarded; they are queued as reviewable inputs that must be integrated one
workstream at a time through GitHub.
