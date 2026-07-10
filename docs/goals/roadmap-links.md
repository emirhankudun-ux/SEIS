# Goal Roadmap Links

Goal Roadmap Links connect every tracked goal to roadmap, PR queue, and status
records. They make roadmap alignment explicit without requiring live GitHub
issue or project-board sync.

## Source

- `content/development/seis-goal-roadmap-links.json`

## Rules

- Every `SEIS-GOAL-*` record must have exactly one roadmap-link record.
- Roadmap references are evidence pointers, not proof of completion.
- Duplicate or legacy backlog ids must stay visible until repository hygiene
  work resolves them.
- PR queue references are planning records, not opened or merged PRs.
- Status references must remain repo-relative and must not use private paths.

## Current Coverage

The current source file links all 20 tracked goals to:

- `docs/roadmap/MASTER_BACKLOG.md`
- `docs/roadmap/NEXT_PR_QUEUE.md`
- `docs/STATUS.md`

## Next Safe Action

Keep roadmap links synchronized whenever a goal, backlog item, PR queue entry,
or status section changes.
