# SEIS Public Plugin Continuity Cadence

**Goal:** `SEIS-GOAL-021`
**Audience:** Public `SEIS Repo` work only
**Status:** Active, evidence-led cadence

## Delivery Shape

| Segment | Shape | Current state |
| --- | --- | --- |
| Bootstrap | 30 steps / 5 rounds / 6 steps | Completed |
| Wave 1 | 100 steps / 5 rounds / 20 steps | Completed |
| Wave 2 | 100 steps / 5 rounds / 20 steps | Completed |
| Wave 3 | 100 steps / 5 rounds / 20 steps | In progress: 99 complete, step 100 active |
| Wave 4 | 100 steps / 5 rounds / 20 steps | Planned-gated |
| Wave 5 | 100 steps / 5 rounds / 20 steps | Planned-gated |

The machine-readable cadence is
`content/development/seis-public-plugin-continuity-cadence.json`. It defines
the 100-step reusable template for Waves 4–5 without selecting a capability,
adding a card, or claiming that future work has started.

## Current Wave 3 Evidence

Steps 47–60 are reconciled by
`content/development/seis-public-plugin-wave-3-round-3-checkpoint.json`.
They cover the one approved public static Swift concurrency package, public
card, source/catalog/matrix reconciliation, deny-by-default permissions,
documentation, local tests, and feature-branch delivery.

Steps 61–79 are reconciled by
`content/development/seis-public-plugin-wave-3-round-4-review.json`. That
review confirms bounded source traversal, path refusal, no raw-source return,
empty write/network/secret permissions, no public UI change, no compiler or
runtime claim, public-release gating, deterministic tests, and a focused
checkpoint-diff review.

Step 80 is reconciled by
`content/development/seis-public-plugin-wave-3-handoff-readiness.json`.
It proves readiness for the final validation round without completing Wave 3
or activating Wave 4. Step 81 is reconciled by
`content/development/seis-public-plugin-wave-3-final-validation.json`; it
validates the current Wave 3 tracker and capability decision without claiming
external installation or release. Steps 82–91 are reconciled by
`content/development/seis-public-plugin-wave-3-final-preflight.json`. That
preflight verifies the current package, source/catalog/matrix, integration,
lifecycle, security/provenance, fresh-task and installation gates, release
limits, public terminology policy, and static input safety while keeping final
handoff, independent installation, native runtime, and public release false.
Steps 92–96 are reconciled by
`content/development/seis-public-plugin-wave-3-delivery-evidence.json`. That
record binds the preflight checkpoint's clean worktree review, whitespace
check, focused commit, feature-branch push, and remote reference verification
to the prior SHA without treating it as a final handoff, protected-branch
write, merge, or release. Step 97 is reconciled by
`content/development/seis-public-plugin-wave-3-repository-local-handoff.json`.
It records the current scope, evidence, risks, rollback, limits, and next
decision without completing Wave 3 or activating Wave 4. Step 98 is completed
by `content/development/seis-public-plugin-wave-3-following-wave-review.json`.
That review identifies a fixed-manifest, read-only
`seis-swift-package-topology` candidate for later planning while keeping its
package and public card absent, activation false, and every SwiftPM/compiler/
runtime/release claim false. Step 99 is completed by
`content/development/seis-public-plugin-wave-4-program.json`, which defines
five explicit rounds and 100 planned steps for the candidate without starting
implementation. Step 100 is active to close Wave 3 with current evidence;
Wave 4 remains planned-gated.

## GitHub Delivery Rule

Each validated, reviewable, reversible checkpoint is committed and pushed to
the current feature branch:

`plugins/seis-plugin-root-20260715`

Protected default branches are excluded. A GitHub push, repository-local
validation, or public card is never treated as independent installation,
native-runtime, provider, deployment, signing, or public-release proof.

## Continuation After Wave 5

After the five 100-step waves, the next series starts with a new 30-step
scope, dependency, risk, rollback, and evidence review. That next series
requires current user authority and is not background execution.

## Public Boundary

- Marketplace: `seis-repo` / **SEIS Repo**
- Audience: everyone
- Personal marketplace read/mutation: prohibited
- Writes, network, and secrets: deny-by-default
- Public release: blocked pending independent evidence and human approval

## Validation

```bash
npm run check:seis-public-plugin-continuity-cadence
npm run check:seis-public-plugin-wave-3-round-3-checkpoint
npm run check:seis-public-plugin-wave-3-round-4-review
npm run check:seis-public-plugin-wave-3-final-validation
npm run check:seis-public-plugin-wave-3-final-preflight
npm run check:seis-public-plugin-wave-3-delivery-evidence
npm run check:seis-public-plugin-wave-3-repository-local-handoff
npm run check:seis-public-plugin-wave-3-following-wave-review
npm run check:seis-public-plugin-wave-4-program
npm run check:seis-public-plugin-expansion-program
```
