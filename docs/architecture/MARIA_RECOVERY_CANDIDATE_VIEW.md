# MARIA Recovery Candidate View

## Purpose

`RecoveryCandidateInspector` is the read-only presentation boundary between durable recovery evidence and current-context reconciliation.

It combines:

1. `DurableWorkCheckpointStore.load_record()` — strict, versioned checkpoint + optional anchor evidence;
2. `RecoveryReconciler` — comparison of checkpoint-time identity with current verified project context.

It does **not** resume work, construct an execution plan, authorize a model/tool, mutate the durable record, or write current context back into historical evidence.

## Public-safe dispositions

`RecoveryCandidateView` reports one of:

- `not-found` — no durable record exists;
- `complete` — the persisted checkpoint is already complete;
- `anchor-missing` — incomplete recovery evidence exists but schema v1 or anchorless v2 provides no checkpoint-time identity;
- `evidence-required` — an anchor exists but required current verified context is missing;
- `drift-detected` — checkpoint-time identity differs from current verified context;
- `aligned-replan-required` — no bounded identity drift was detected, but a fresh plan is still mandatory.

`execution_authorized` is always `False`.

`replan_required` is true only for the four incomplete candidate states: anchor missing, evidence required, drift detected, and aligned replan required.

## Data minimization

The view intentionally exposes only:

- project id;
- work id;
- schema version when a record exists;
- disposition;
- next step identifier for incomplete work;
- bounded drift-field names;
- bounded missing-context field names.

The view does not expose:

- the full `WorkPlanCheckpoint`;
- the persisted `RecoveryAnchor` values;
- prompts, model outputs, tool arguments, credentials, permission targets, raw provider/tool output, or arbitrary workspace content.

This makes the view suitable for a future SwiftUI Integration/Recovery Center without duplicating recovery-policy logic in UI code.

## Ordering rules

Inspection deliberately checks states in this order:

1. missing durable record → `not-found`;
2. completed checkpoint → `complete` even if no anchor exists;
3. incomplete checkpoint without anchor → `anchor-missing`;
4. anchored incomplete checkpoint → delegate to `RecoveryReconciler`.

A completed record does not need current identity evidence because it is not a continuation candidate.

An incomplete anchorless record cannot safely reconstruct historical identity from current context. It therefore reports an explicit evidence gap instead of pretending alignment.

## Read-only boundary

Inspection calls `load_record()` only. It performs no migration write-back, cleanup, checkpoint repair, context mutation, provider call, subprocess launch, tool invocation, or filesystem mutation.

The focused test captures the checkpoint file bytes before and after inspection and requires them to remain identical.

Filesystem corruption and schema corruption continue to fail closed through `DurableWorkCheckpointStore`; the candidate view does not catch and downgrade those errors into a trusted status.

## Execution boundary

`aligned-replan-required` means only that the persisted bounded identity and current verified identity match for the fields checked by `RecoveryReconciler`.

It does **not** mean safe-to-resume.

Before any work can execute, MARIA must still:

- construct a fresh current plan;
- route each step against current capability/model/tool state;
- pass current permission policy;
- obtain fresh MCP/tool authorization per attempt where required;
- respect current retry/idempotency policy;
- produce new execution evidence.

Automatic resume remains outside this slice.

## Verification

Focused contract: `test/maria-recovery-candidate-view.test.py`.

The test contract was committed before implementation. Hosted MARIA regression CI failed while `maria_runtime.recovery_candidate` did not exist. The minimal read-only inspector then restored the regression suite.

Coverage includes missing, complete, anchor-missing, aligned, drift, unverified-evidence, data-minimization, no-execution-authority, and byte-for-byte read-only behavior.
