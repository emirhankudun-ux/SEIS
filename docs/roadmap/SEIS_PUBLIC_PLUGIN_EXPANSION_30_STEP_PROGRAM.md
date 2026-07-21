# SEIS Public Plugin Expansion — 30-Step Program

**Goal:** `SEIS-GOAL-021`

**Status:** In progress

**Scope:** Public `SEIS Repo` marketplace only

This is a bounded delivery program, not a claim that agents run in the
background. It contains thirty reviewable steps in five rounds of six. Every
step needs current evidence before it is marked complete.

The first program starts with the current public plugin implementation state.
Any GitHub delivery remains subject to branch policy, network availability,
and explicit approval. The personal marketplace is outside this program and
must not be read or modified.

## Cadence

| Phase | Shape | Rule |
| --- | --- | --- |
| Initial program | 30 steps / 5 rounds / 6 steps per round | Work only from current repository evidence. |
| Subsequent expansion | Five waves of 100 steps | Create each wave only after the previous wave has validation, scope, and risk review. |

Every validated, coherent round checkpoint is committed and sent to the current
SEIS GitHub feature branch when the environment permits. Protected default
branches remain excluded. A network, approval, or platform limit is reported as
an external delivery blocker rather than represented as a successful push.

## Rounds

| Round | Focus | Steps |
| --- | --- | --- |
| 1 | Program and UI-state foundation | 1–6 |
| 2 | Public package integration | 7–12 |
| 3 | Evidence and regression validation | 13–18 |
| 4 | Second evidence-backed capability | 19–24 |
| 5 | Release-quality handoff | 25–30 |

## Current Evidence Boundary

- Marketplace: `seis-repo` only.
- Personal marketplace read/mutation: prohibited.
- Plugin runtime: local, bounded, read-only by default.
- Public availability must never be represented as a live release, installation,
  or independent-runner proof without that external evidence.
- The detailed machine-readable record is
  `content/development/seis-public-plugin-expansion-program.json`.

## Current Checkpoint

Steps 1–26 have current evidence. The public regression, marketplace, release,
registry, project-manifest, and baseline SEIS checks reconcile 70 application
packages and 376 public `SEIS Repo` entries at release `0.00000002` / `0.0.20`.
Steps 27–28 have passed the diff, secret-boundary, worktree, and cached-commit
review. Step 29 is the active feature-branch delivery and remote-reference
verification; the next-wave report remains deliberately pending until that
delivery result is known.

## Completion Rule

Step 30 is a planning/reporting boundary, not automatic permission for the
next 500 steps. It creates five *not-planned* 100-step wave placeholders. A
new wave requires a fresh portfolio audit, acceptance criteria, validation
plan, risk review, and current user authority before implementation starts.
