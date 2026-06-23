# Goal Validation Steps

Goal Validation Steps describe the repeatable checks that support Goal Tracking
OS evidence. They are not proof unless the named command or review has actually
been performed.

## Source

- `content/development/seis-goal-validation-steps.json`

## Current Steps

| ID | Status | Validation | Evidence rule |
| --- | --- | --- | --- |
| `SEIS-VAL-001` | active | `npm run check:goal-tracking` | Passing output supports source-record consistency only. |
| `SEIS-VAL-002` | active | `npm run check:goal-command-center-view` | Passing output supports generated-view freshness only. |
| `SEIS-VAL-003` | active | scoped sensitive-pattern scan | No matches supports scoped exposure hygiene only. |

## Rules

- A validation step must name its command or manual review method.
- A validation step must state its success condition.
- A validation step must not imply broader public, release, security, live
  provider, deployment, SSH, benchmark, or dataset readiness.
- Failed, skipped, or unavailable checks stay visible.

## Next Safe Action

Run the active validation steps after source-record updates and record only the
observed result.
