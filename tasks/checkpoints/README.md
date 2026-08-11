# Checkpoint Contract

This directory holds durable, file-based run checkpoints for the
**Universal Goal-Tracking Runtime** described in
`docs/governance/goal-tracking-runtime.md` (Section 11). A checkpoint is how
one agent session hands off verified, evidenced state to the next — human or
AI — without relying on conversation memory.

## When to write a checkpoint

- The run ends without the primary goal reaching full completion.
- The run reaches a milestone worth preserving, even if the goal continues.
- Context is at risk of running out mid-work-package.
- The run is blocked and needs human input before it can continue.

A run that fully completes a goal in one pass may still write a closing
checkpoint for the historical record, but it is mandatory whenever the goal
is *not* fully complete at run end.

## File naming

```
tasks/checkpoints/<YYYY-MM-DD>--<goal-id-or-slug>--<short-description>.md
```

Example: `2026-08-01--runtime-scaffold--install-goal-tracking-runtime.md`

Use the ISO date the checkpoint was written, the resolved Goal ID (or a
short descriptive slug if no formal ID exists), and a few words describing
the checkpoint's content. If a goal spans multiple checkpoints, keep the
goal-id/slug segment identical across them so they sort and group together.

## Required fields

Every checkpoint file must contain all of the following sections, in this
order. If a section has nothing to report, say so explicitly (e.g. "None
identified this run") rather than omitting it.

1. **Objective** — the resolved Goal ID/title and the specific work package
   this checkpoint covers.
2. **Completed work** — what was actually done, described in evidenced,
   verifiable terms (not aspirational language).
3. **Files changed** — exact repository-relative paths, each with a
   one-line description of what changed and why.
4. **Tests executed + results** — exact commands run in this session and
   their exact outcomes (pass/fail counts, key output lines). Never report
   a test as passing without having run it in the session that wrote the
   checkpoint.
5. **Unresolved issues** — anything left broken, incomplete, ambiguous, or
   unverified.
6. **Decisions** — significant choices made this run and the reasoning
   behind them (a `decision_record` per the runtime's evidence classes).
7. **Risks** — anything that could go wrong as a downstream consequence of
   this checkpoint's changes.
8. **Rollback notes** — the concrete steps to undo this checkpoint's
   changes if they turn out to be wrong (e.g. `git revert <sha>`, or "delete
   file X, restore Y from git history").
9. **Continuation instructions** — exactly what a future session should
   read first and do first to pick this back up with no other context.
10. **Next safe action** — one concrete, low-risk, immediately actionable
    next step. Never leave this blank or vague.

## Rules

- Checkpoints are append-only history, not a single mutable file — write a
  new file per checkpoint rather than overwriting a previous one, so the
  chain of checkpoints for a goal remains a traceable history.
- A checkpoint's claims must be backed by evidence gathered in the same
  session that wrote it (see the runtime's evidence classes: `repo_fact`,
  `command_result`, `test_result`, `artifact`, `decision_record`,
  `blocker_record`).
- Never write "complete" in a checkpoint's Objective/status unless the full
  goal's acceptance criteria are evidenced — partial progress is reported
  as partial.
- When resuming work on a goal, read its most recent checkpoint before
  doing anything else, and read the checkpoint it says to continue from if
  this is not the first one for that goal.
