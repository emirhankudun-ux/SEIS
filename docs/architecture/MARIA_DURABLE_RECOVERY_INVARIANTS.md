# MARIA Durable Recovery Invariants v1

## Purpose

Durable recovery evidence is useful only if it still describes a structurally possible work plan. Strict JSON and filesystem checks protect the storage envelope; this layer protects the internal work graph and step-state evidence represented by `WorkPlanCheckpoint`.

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

## Enforced step-state evidence invariants

The durable validator also mirrors the evidence shapes emitted by `WorkPlanExecutor`:

- `SUCCEEDED` requires at least one execution attempt and cannot carry failure evidence;
- `FAILED` requires at least one execution attempt and a bounded failure category;
- `BLOCKED` must have zero execution attempts and must carry a bounded blocking/failure category;
- `CANCELLED` may have zero or more attempts, because cancellation can happen before a step starts or between retry attempts, but it must always carry a bounded cancellation/failure category;
- unknown step states fail closed.

This prevents a syntactically valid JSON document from claiming impossible runtime histories such as a successful step that never ran, a failed step with no reason, or a dependency-blocked step that nevertheless consumed an execution attempt.

## Why first-cancelled matters

`WorkPlanExecutionResult.checkpoint()` selects the first cancelled step as the resumability boundary. Accepting a later cancelled step from persisted JSON could present misleading recovery metadata and appear to skip unfinished work. The durable validator preserves the same invariant on save and load.

## Failure behavior

Invalid in-memory checkpoints are rejected before persistence with `ValueError`. Invalid persisted checkpoints are rejected during load with `CheckpointCorruptError`. No partial recovery assessment is returned and no automatic repair is attempted.

## Verification

Focused contract: `test/maria-work-checkpoint-invariants.test.py`.

The graph tests were committed before implementation. Hosted MARIA regression CI first failed because the previous validator accepted forward dependencies, duplicate dependency identifiers, and a later cancelled `next_step_id`. After those graph rules were implemented, the same focused contract exposed seven remaining invalid state/attempt/failure combinations that were still accepted. The validator was tightened to match real `WorkPlanExecutor` evidence without changing execution authority or recovery semantics.
