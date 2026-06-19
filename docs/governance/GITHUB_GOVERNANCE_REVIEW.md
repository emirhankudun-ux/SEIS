# SEIS GitHub Governance Review

Date: 2026-06-19

This review records local GitHub-governance evidence without contacting GitHub.
External PR, branch protection, Actions, and code-scanning status require human
approval for GitHub API/CLI access.

## Local Evidence

| Item | Observed State |
| --- | --- |
| Current branch | `codex/sync-icloud-seis-20260619` |
| Default protected branch assumption | `main` is treated as sacred by README and AGENTS. |
| Remote | `origin` points to `https://github.com/emirhankudun-ux/SEIS.git`. |
| Local branch cleanliness | Dirty, with pre-existing deletions and untracked nested repo material. |
| Local merged PR evidence | Git log includes merged PR references such as `#17` and `#18`. |
| Live PR status | Unknown; not inspected. |
| Live branch protection | Unknown; not inspected. |
| GitHub Actions status | Unknown; not inspected. |
| Code scanning/security alerts | Unknown; not inspected. |

## Required Governance Rules

- Do not push to `main`.
- Do not merge without approval.
- Do not force-push or rewrite history.
- Do not delete branches without approval.
- Do not stage unrelated files.
- Do not stage nested `.git` directories, local snapshots, archives, or secrets.
- Keep one PR scoped to one coherent objective.
- Report validation honestly, including checks not run.

## PR Rescue Requirements

Before recovering old PR work:

1. Get approval for GitHub API/CLI access.
2. List open PRs.
3. List closed PRs.
4. For each PR, record number, title, state, merge status, risk, recoverability,
   likely closure reason, and recommended action.
5. Recover useful messy work through a clean replacement PR, not a blind reopen
   or cherry-pick.

## Current Blockers

| Blocker | Impact | Next Step |
| --- | --- | --- |
| Dirty worktree | Blocks clean PR confidence. | Resolve or isolate pre-existing deletions. |
| Missing/deleted validators | Blocks CI confidence. | Restore or replace without weakening checks. |
| External GitHub status unknown | Blocks PR rescue and public-readiness claims. | Request approval for GitHub inspection. |
| Historical docs conflict with current branch model | Confuses maintainers and agents. | Align active docs and label historical records. |

## Current Decision

Local repository state is ready for internal review documentation, but not ready
for push, PR merge, public-readiness claims, or release governance claims.
