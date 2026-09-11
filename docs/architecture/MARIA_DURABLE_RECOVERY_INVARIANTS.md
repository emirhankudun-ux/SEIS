# MARIA Durable Recovery Invariants v1

## Purpose

Durable recovery evidence is useful only if it still describes a structurally possible work plan. Strict JSON and filesystem checks protect the storage envelope; this layer protects the internal work graph represented by `WorkPlanCheckpoint`.

The validation remains advisory. Passing these invariants does not authorize a model call, tool call, resume, rollback, or external mutation.

## Enforced graph invariants

For every persisted or newly saved checkpoint:

- step identifiers remain unique;
- every dependency identifier is unique within its step;
- every dependency must reference a step that appears earlier in checkpoint order;
- forward, self, and unknown dependencies therefore fail closed;
- aggregate state counters must match retained step evidence;
- the completion flag must agree with the presence of cancelled steps;
- when recovery is incomplete, `next_step_id` must identify the **first** cancelled step rather than a later cancelled step.

The earlier-step rule mirrors the topologically ordered contract already enforced by `WorkPlanExecutor`. Durable storage therefore cannot silently accept a graph that the live executor itself would reject.

## Why first-cancelled matters

`WorkPlanExecutionResult.checkpoint()` selects the first cancelled step as the resumability boundary. Accepting a later cancelled step from persisted JSON could present misleading recovery metadata and appear to skip unfinished work. The durable validator now preserves the same invariant on save and load.

## Failure behavior

Invalid in-memory checkpoints are rejected before persistence with `ValueError`. Invalid persisted checkpoints are rejected during load with `CheckpointCorruptError`. No partial recovery assessment is returned and no automatic repair is attempted.

## Verification

Focused contract: `test/maria-work-checkpoint-invariants.test.py`.

The tests were committed before implementation. Hosted MARIA regression CI failed on the test-only head because the previous validator accepted forward dependencies, duplicate dependency identifiers, and a later cancelled `next_step_id`. The validator was then tightened without changing execution authority or recovery semantics.
