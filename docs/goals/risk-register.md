# Goal Risk Register

The Goal Risk Register keeps important Goal Tracking OS risks visible as
structured records instead of burying them inside prose.

## Source

- `content/development/seis-goal-risk-register.json`

## Current Risks

| ID | Status | Severity | Risk | Next action |
| --- | --- | --- | --- | --- |
| `SEIS-RISK-001` | active | high | Repository hygiene drift enters Goal Tracking commits. | Prepare repository hygiene review before resolving or staging merge-conflict changes. |
| `SEIS-RISK-002` | active | medium | Progress overclaim from planned review records. | Record performed reviews only with current-period evidence. |
| `SEIS-RISK-003` | active | medium | Generated Goal Tracking Center becomes stale. | Keep `npm run check:goal-command-center-view` in validation. |

## Rules

- Risk records are not blockers unless they prevent safe work.
- Risk severity must use the goal registry risk levels.
- Risks must link to goals, evidence, related paths, mitigation, and next
  action.
- Risks must not expose secrets, private paths, private hostnames, or unsupported
  readiness claims.

## Next Safe Action

Keep risk records synchronized with `docs/STATUS.md`,
`docs/roadmap/MASTER_BACKLOG.md`, and the generated Goal Tracking Center.
