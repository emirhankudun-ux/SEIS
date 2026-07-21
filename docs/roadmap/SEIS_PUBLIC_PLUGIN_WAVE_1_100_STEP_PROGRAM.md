# SEIS Public Plugin Expansion — Wave 1 / 100 Steps

**Goal:** `SEIS-GOAL-021`

**Status:** Completed repository-local handoff

**Scope:** Public `SEIS Repo` marketplace and Command Center source only

Wave 1 follows the delivered 30-step program. It is a bounded 100-step
execution record, not a background-work claim or permission for an unbounded
plugin expansion. The first evidence review selected a concrete source gap:
four missing Command Center state boundaries for degraded capability,
rate-limited, provider-failed, and approval-required behavior.

## Boundary

- Personal marketplace read/mutation: prohibited.
- Live providers, credentials, activation, and external writes: out of scope.
- Default branch writes: prohibited.
- Static source evidence: useful, but never browser, provider, or release proof.
- Every coherent checkpoint: commit and send the current feature branch when
  the environment and user authorization permit.

## Rounds

| Round | Steps | Focus | Current status |
| --- | --- | --- | --- |
| 1 | 1–20 | State-boundary foundation | Completed in the first Wave 1 checkpoint |
| 2 | 21–40 | Interaction and recovery semantics | Completed in the second Wave 1 checkpoint |
| 3 | 41–60 | Public evidence and contract clarity | Completed in the third Wave 1 checkpoint |
| 4 | 61–80 | Next capability selection | Completed with the public `seis-evidence-index` package |
| 5 | 81–100 | Release-quality handoff | Completed with current regression and handoff evidence |

## Current Checkpoint

Rounds 1–3 create an explicit, accessible Command Center panel for the four
state boundaries, correct the visible app-plugin filter to its 70-package
baseline, bind
semantic, focus, no-provider, no-storage, and filter-isolation source evidence
to generated records, and add a deterministic Wave 1 evidence index. The state
copy is deliberately no-key: it distinguishes catalog fallback, reduced static
posture, future provider failure, rate limits, and human approval without
claiming that a live provider has been called. The remaining desktop-web gaps
are recorded separately in the UI-state evidence; they are not silently
absorbed into this Command Center checkpoint.

Round 4 audits overlap before adding one package, promotes the former plan-only
`seis-evidence-index` slot into a public SEIS Repo source package, adds a
bounded local MCP surface and deterministic fixtures, and records its scope,
non-goals, rollback, public-only placement, and no-personal/no-network/no-write
boundary. The current contract is 71 app-owned public packages and 377 public
`SEIS Repo` cards. Round 5 reruns the source, catalog, matrix, UI-state, focus,
manifest, integration, lifecycle, provenance, fresh-task, unified-suite,
registry, and baseline-web checks; it then records the focused feature-branch
handoff. It remains local evidence only: no external installation,
provider, publication, deployment, or public-release approval is claimed.

The machine-readable 100-step source of truth is
`content/development/seis-public-plugin-wave-1-program.json`. Validate it with
`npm run check:seis-public-plugin-wave-1-program`.

The cross-contract index is
`content/development/seis-public-plugin-wave-1-evidence-index.json`. It keeps
the current 377-card public marketplace contract, release labels, deny-by-default MCP
boundary, generated evidence safety scan, and known desktop UI-state gap in one
read-only record. Validate it with
`npm run check:seis-public-plugin-wave-1-evidence-index`.

The completed release-quality handoff is
`content/development/seis-public-plugin-wave-1-handoff.json`. It records the
current validation contract, known attention state, skipped external checks,
risk, rollback, and the Wave 2 planning gate. Validate it with
`npm run check:seis-public-plugin-wave-1-handoff`.

## Wave 2 Gate

Wave 2 is planned because Wave 1 now has a current, validated handoff and a
fresh scope and risk review. No Wave 2 implementation has begun: a separate
100-step record and candidate-overlap review are required before another public
package is created. Waves 3 through 5 remain unplanned until their preceding
wave passes the same gate. This keeps the requested ongoing cadence evidence-led
and reversible rather than turning it into claimed autonomous background
execution.
