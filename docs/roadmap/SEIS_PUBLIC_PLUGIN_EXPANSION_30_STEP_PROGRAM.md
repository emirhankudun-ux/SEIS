# SEIS Public Plugin Expansion — 30-Step Program

**Goal:** `SEIS-GOAL-021`

**Status:** Completed

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
| Subsequent expansion | Five waves of 100 steps | Waves 4–5 use the gated 100-step template; activation still requires current validation, scope, and risk review. |

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

All thirty steps have current evidence. The public regression, marketplace,
release, registry, project-manifest, and baseline SEIS checks reconciled 70
application packages and 376 public `SEIS Repo` entries at release
`0.00000002` / `0.0.20`. That is the completed initial-program baseline; Wave 1 may add a separately validated package without rewriting this historical evidence. Steps 27–28 passed the diff, secret-boundary,
worktree, and cached-commit review. Step 29 delivered the validated checkpoint
to `plugins/seis-plugin-root-20260715`; remote reference verification confirmed
`27e1bb8e57c7e23f7853ac5015b4327fc270de4f`. No protected default branch was
written.

## Next Five Waves

Wave 1 is completed with a current repository-local handoff at
`content/development/seis-public-plugin-wave-1-handoff.json`. It closed bounded
static, no-key source gaps and added one public evidence package without
claiming a live provider or runtime transition. Wave 2 is now **completed**
with its 100-step record at
`content/development/seis-public-plugin-wave-2-program.json` and a public-only
candidate decision at
`content/development/seis-public-plugin-wave-2-capability-decision.json`.
Its completed rounds cover the read-only Apple/Swift Package readiness audit,
its bounded resilience review (depth/file/text limits, direct source-area
symlink refusal, focused fixtures, and framed MCP path refusal), public
distribution maintenance, and an explicit decision not to add a duplicate
follow-up card. The repository-local handoff is
`content/development/seis-public-plugin-wave-2-handoff.json`. At that handoff,
the historical contract was 72 packages / 378 `SEIS Repo` cards, and the
interrupted SwiftPM test remains neither a compiled-Swift nor a test-pass claim.
Wave 3 is now **in progress** at
`content/development/seis-public-plugin-wave-3-program.json`: the bounded
`seis-swift-concurrency-audit` package has 79 completed steps and an active
handoff-preparation step. The current contract is 73 packages / 379 `SEIS
Repo` cards, without an independent installation, native-runtime, provider,
deployment, or public-release claim. Waves 4–5 are now **planned-gated** with
one reusable 100-step template at
`content/development/seis-public-plugin-continuity-cadence.json`; they are
not activated until their own scope, risk, validation, and rollback decisions
exist. Continuation remains evidence-led, reversible, and delivered through
the current GitHub feature branch rather than claimed as background execution.

## Completion Rule

Step 30 is a planning/reporting boundary, not automatic execution of the next
500 steps. The five-wave shape is now explicit, while every individual future
wave remains gated by current evidence and user authority. After Wave 5, a new
30-step scope review starts the next five-wave series.
