# SEIS Sub-Agent Long-Horizon Audit

## Purpose

Capture the first repository-local audit for developing SEIS over a five-year
horizon with bounded sub-agents. This report does not claim autonomous runtime
implementation. It records the source basis, gaps, and safe next actions.

## Scope

Reviewed areas:

- root operating instructions
- AI workforce assignments
- agent runtime documentation
- long-horizon mission reports
- active mission board
- existing sub-agent brief tooling
- dirty-worktree constraints

This report intentionally avoids editing existing dirty agent runtime,
plugin-integration, and roadmap queue files.

## Sub-Agent Used

Sub-agent `Boole` ran a read-only audit for the updated objective:

`alt otonom ajanları kullanarak 5 yıl boyunca geliştir`

The sub-agent did not edit files, did not inspect `.env` values, and returned a
bounded gap analysis for autonomous-agent, workforce, and long-horizon planning.

## Source Basis

High-signal existing files:

| File | Why it matters |
| --- | --- |
| `AGENTS.md` | Defines one-writer policy, multi-assistant role boundaries, and credential safety. |
| `docs/ai/agent-runtime.md` | States that runtime orchestration is documented but not implemented. |
| `docs/development/agents/ai-workforce-assignments.md` | Defines Codex, Claude, Qwen, Gemini, CodeRabbit, Ollama, OpenDesign, GitHub Actions, Kimi, and OpenCode roles. |
| `content/development/ai-workforce-assignments.json` | Machine-readable workforce assignment contract. |
| `reports/seis-long-horizon-missions.md` | 52-week mission kernel with 12 waves and 120 missions. |
| `packages/seis_kernel/long_horizon.py` | Source generator for the long-horizon mission kernel. |
| `reports/seis-active-mission-board.md` | First 90-day execution board derived from the long-horizon plan. |
| `docs/governance/seis-agent-lane-status.md` | Agent lane safety contract and evidence-bound status. |
| `scripts/create-subagent-briefs.mjs` | Existing sub-agent brief generator; lacks check-only validation. |
| `roadmap/seis-18-60-month-long-horizon-ops-blueprint.md` | Existing 18-60 month governance blueprint. |

## 5-Year Gap

The repository has strong one-year and 90-day planning evidence, but it lacked a
single validated five-year sub-agent execution contract. The main gaps were:

- no typed sub-agent five-year plan connecting years, quarters, lanes, outcomes,
  and validation gates
- no check-only validator for a five-year sub-agent plan
- agent runtime remains documented rather than implemented
- no runtime scheduler, permission registry, bounded recursion model, or
  cancellation model is currently proven
- workforce assignments define assistant roles, but not a five-year sub-agent
  lifecycle or WIP planning model
- existing sub-agent brief generation is write-oriented rather than check-only

## Safe Changes

Applied in this pass:

- created `content/development/seis-sub-agent-5-year-plan.json`
- created `scripts/check-sub-agent-5-year-plan.mjs`
- created `scripts/create-sub-agent-five-year-demo-evidence.mjs`
- created `scripts/run-sub-agent-five-year-demo.mjs`
- created `reports/seis-sub-agent-five-year-demo-evidence.json`
- created `reports/seis-sub-agent-five-year-demo-evidence.md`
- created `reports/seis-sub-agent-five-year-demo-run.json`
- created `reports/seis-sub-agent-five-year-demo-run.md`
- created this review report
- exposed `npm run check:seis-sub-agent-5-year-plan` and added it to
  `quality:governance`
- exposed `npm run demo:seis-sub-agent-five-year` for a terminal-runnable
  deterministic dry-run transcript
- exposed `npm run check:seis-sub-agent-five-year-demo-run` and added it to
  `quality:governance`
- exposed `npm run check:seis-sub-agent-five-year-demo-evidence` and added it
  to `quality:governance`
- added read-only validation for generated UIXAppTTR sub-agent briefs through
  `npm run check:uixappttr-sub-agent-briefs`
- formalized `memories-agent` in the source contract and run ledger so the
  generated agent index no longer drifts from machine-readable governance data
- added the browser-local 3D SEIS AI Core map with rotate, sync, pause, canvas,
  diagnostics, and `seis_demo_ai_core_3d_interacted` telemetry coverage

The new plan is deliberately marked `documented`. It does not claim runtime
autonomy, scheduler implementation, background execution, provider access,
deployment authority, or model-training capability.

## Safety Rules Preserved

- Codex remains the default single writer.
- Sub-agents are bounded reviewers, explorers, workers, and validators.
- Sub-agents do not receive deployment, merge, secret, SSH, public visibility,
  history rewrite, or model-training authority.
- Every quarter includes validation gates and multiple responsible lanes.
- Privileged work remains approval-gated.

## Validation

New check:

```bash
npm run check:seis-sub-agent-5-year-plan
npm run demo:seis-sub-agent-five-year
npm run check:seis-sub-agent-five-year-demo-run
npm run check:seis-sub-agent-five-year-demo-evidence
npm run check:product-experience-browser-smoke
```

Related checks from the existing repository:

```bash
npm run check:seis-long-horizon-missions
npm run check:seis-active-mission-board
node scripts/check-ai-workforce-assignments.mjs
npm run check:seis-agent-lane-status
npm run check:seis-long-horizon-throttle
node --check scripts/create-subagent-briefs.mjs
```

## Deferred Work

- Define a minimal agent role schema and permission matrix.
- Add scheduler dry-run fixtures, cancellation fixtures, and bounded recursion
  tests before enabling any autonomous write-capable runtime.
- Fix local absolute path style in clean roadmap docs during a separate
  repository hygiene pass.
- Avoid editing dirty agent/plugin/runtime files until the current diff is
  reviewed.

## Human Approval Needed

Approval is required before:

- enabling background autonomous execution
- giving sub-agents write authority outside a bounded branch/task scope
- running SSH or deployment work
- collecting provider credentials
- training models or downloading datasets
- pushing, merging, or changing repository settings

## Final Decision

Ready for internal review.
