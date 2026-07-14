# SEIS Enterprise Expansion V3: 10-Year Stewardship

Status: planned continuation contract, specification maturity, public-safe

This document turns the request to keep developing SEIS for ten years into a
source-backed stewardship system. It does not claim that ten years have
elapsed, that agents run after a session stops, or that any provider, plugin,
MCP server, deployment, or account remains active in the background.

The machine-readable source is
[`data/seis-enterprise-expansion-v3.json`](../../data/seis-enterprise-expansion-v3.json).
The structural contract is
[`schemas/seis-enterprise-expansion-v3.schema.json`](../../schemas/seis-enterprise-expansion-v3.schema.json).
Validate it with:

```bash
npm run check:seis-enterprise-expansion-v3
```

## Continuation Model

The ten-year target uses `continuation_mode: session-based-continuation` and is
a sequence of evidence-backed sessions. Each session
must read the repository instructions and current Goal state, inspect the
worktree, select one unblocked task, produce a reviewable artifact, run real
checks, update evidence, and leave a next action. The next session repeats
this protocol from the recorded state.

The continuation model deliberately has no hidden daemon, indefinite process,
automatic agent swarm, or fabricated elapsed-time claim. A session stops when
approval is missing, external state is unavailable, a security boundary is at
risk, validation contradicts the change, or unrelated dirty work could be
overwritten.

Required state between sessions:

- active Goal ID;
- current ten-year phase ID;
- last review date;
- last commit hash;
- exact validation results;
- open blockers;
- next action.

## Annual Phases

| Year | Phase | Primary focus | Exit evidence |
| --- | --- | --- | --- |
| 1 | Evidence and Ownership Foundation | ownership, schemas, security, rollback | canonical owners and evidence-backed active tasks |
| 2 | Contracts and Compatibility | contracts, dependencies, storage, migrations | compatibility tests and reversible migrations |
| 3 | Native and Web Product Surfaces | platform roles, design system, human experience | accessible native/web workflows and budgets |
| 4 | AI Governance and Evaluation | routing, safety, evaluation, human review | explainable decisions and current evaluation evidence |
| 5 | Knowledge Graph and Retrieval | provenance, nodes, relationships, retrieval | privacy-classified source-backed knowledge records |
| 6 | Observability and Reliability | metrics, traces, audit trails, recovery | tested recovery and privacy-safe timelines |
| 7 | Extension and Integration Governance | plugins, MCP, providers, approvals | source review, permissions, revocation, rollback |
| 8 | Accessibility, Performance, and Sustainability | inclusive experience and resource budgets | current accessibility, performance, and sustainability reviews |
| 9 | Public Platform and Interoperability | releases, localization, compatibility | public compatibility and deprecation evidence |
| 10 | Renewal, Deprecation, and Next-Horizon Stewardship | retirement, risk, research, renewal | ten-year retrospective and next-horizon proposal |

Every phase is `planned` until its own Goal, task, evidence, validation, and
rollback records exist. A phase cannot become `completed` because its year is
current, because a prompt mentions it, or because a future plan is long.

## Stewardship Metrics

The long-term rule is measured through trend evidence, not file count or agent
count:

- architecture ownership conflicts: decrease;
- evidence freshness: decrease in age;
- open security findings: decrease;
- unowned maintainability debt: decrease;
- open accessibility gaps: decrease;
- performance budget pass rate: increase;
- human experience blockers: decrease;
- sustainability review coverage: increase.

Metrics may be unavailable in a given session. In that case, record the
unavailable state and an unblock condition rather than inventing a value.

## Current Phase State

The current continuation state is intentionally explicit:

- active Goal: `SEIS-GOAL-003`;
- phase: `SEIS-10Y-Y01`, Evidence and Ownership Foundation;
- phase status: planned;
- last reviewed: `2026-07-14`;
- last validated stewardship commit: `16fbd03e`;
- validation: Enterprise Expansion V3, Goal Tracking Update Prompt, Goal Tracking,
  Goal Command Center View, and 104-term capability matrix checks passed;
- open blocker: the pre-existing repository hygiene blocker remains unresolved
  in the shared dirty worktree;
- next action: read the repository instructions, project manifest, this registry,
  capability matrix, and latest Goal evidence, then select one highest-priority
  unblocked Year 1 term or measurement contract for a scoped implementation
  Goal.

This state is a handoff record, not a claim that the annual phase has been
completed or that work continues without a new supported session.

## Session Handoff

Use this continuation instruction at the start of a future session:

```text
Read AGENTS.md, project.ecosystem.yaml, the SEIS Enterprise Expansion V3
registry, the active Goal, and the latest evidence first. Continue only the
highest-priority unblocked phase task. Produce a real reviewable artifact,
run applicable validation, update Goal/evidence/rollback records, preserve
unrelated dirty work, and finish with the exact repository-state line. Do not
claim background execution, elapsed ten-year progress, live integrations, or
completion without current evidence.
```

## Governance Boundary

The ten-year plan strengthens Architecture, Knowledge, Security,
Maintainability, Accessibility, Performance, Human Experience, and Long-Term
Sustainability together. It does not authorize production deployment, secret
changes, protected-branch writes, external connector writes, destructive
migrations, or autonomous execution. Those require separate scoped Goals and
human approval under `AGENTS.md`.

## Related Records

- [Enterprise Expansion V3 registry](../../data/seis-enterprise-expansion-v3.json)
- [Enterprise Expansion V3 governance](seis-enterprise-expansion-v3.md)
- [Goal Tracking operations](../goals/goal-tracking.md)
- [Goal Tracking evidence](../../content/development/seis-goal-evidence.json)
- [Goal Tracking validation](../../content/development/seis-goal-validation-steps.json)
- [10-year capability matrix](seis-10-year-capability-matrix.md)
