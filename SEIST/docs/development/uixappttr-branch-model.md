# UIXAppTTR Branch Model

## Rule

`UIXAppTTR` is the single active development branch.

The repository identity is `UIXApps`; all local branch work is consolidated into `UIXAppTTR`.

Other workstreams should not become long-lived Git branches. They operate as sub-agent lanes inside this branch:

| Sub-Agent | Lane | Responsibility |
| --- | --- | --- |
| Interface Agent | interface-polish | UI hierarchy, responsive rhythm, accessibility, and premium interaction polish. |
| Motion Agent | motion-tuning | Cinematic motion, reduced-motion support, mobile-safe timing, and tactile feedback. |
| Release Agent | release-safety | Static package, SHA-256 manifest, release backup, server handoff, and rollback readiness. |
| Polyglot Agent | polyglot-growth | Lightweight language contracts without dependency bloat. |
| Governance Agent | development-governance | Backlog, decisions, summaries, and branch policy. |
| Premium Local Foundation Agent | premium-local-foundation | Absorb `codex/premium-local-foundation` intent inside `UIXAppTTR` without reviving it as a branch. |

## Why

A single branch keeps the release history understandable while still allowing specialized workstreams. The sub-agent model gives each lane ownership without fragmenting Git history.

## Guardrails

- Main stays protected.
- `UIXAppTTR` receives incremental commits.
- Local branch checks expect only `UIXAppTTR`.
- `codex/premium-local-foundation` is a sub-agent lane, not a Git branch.
- Server upload remains blocked until target details are confirmed.
- Sub-agents update their allowed surfaces only.
- Every meaningful change runs the static checks and release-ready flow.

## Operating Files

- `content/development/sub-agent-runs.json`
- `content/development/branch-consolidation.json`
- `content/development/premium-local-foundation-subagent.json`
- `docs/development/premium-local-foundation-agent.md`
- `docs/development/agents/README.md`
- `docs/development/uixapps-repository-model.md`
- `scripts/create-subagent-briefs.mjs`
