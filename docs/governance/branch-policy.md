# Branch Policy

## Main-first Rule

`main` is the canonical public product branch for SEIS. It should be the branch that a GitHub visitor, contributor, market reviewer, or AI assistant treats as the source of truth.

## Branch Classes

| Branch class | Policy |
| --- | --- |
| `main` | Sacred, reviewed, reversible, market-facing branch. |
| Assistant branches | Temporary workspaces only; merge or archive their useful decisions under `main`. |
| Source/import branches | Audit inputs only; preserve as docs/data/source snapshots when needed for rollback or provenance. |
| Experimental branches | Short-lived; close with merge, archive, or deletion decision. |

## Desired Repository Presentation

SEIS should converge toward a single visible `main` product surface. Other branch knowledge should live under `main` as:

- governance docs;
- source/import audit records;
- handoff notes;
- migration inventories;
- reversible implementation plans.

## Commit Size

Prefer small commits:

- docs and policy;
- platform language contracts;
- marketplace readiness records;
- security and contribution governance;
- focused source or app changes.

Avoid mixing extracted legacy dumps, generated archives, private media, dependency expansion, and application code in the same commit.
