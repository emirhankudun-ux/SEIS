# MARIA Learning Dataset Plan v1

## Purpose

This slice turns reviewed Learning Fabric metadata into a deterministic plan for a future fine-tuning or distillation dataset. It exists between source admission and any future private dataset builder/trainer.

It is deliberately narrower than the earlier MARIA prototype ideas. It does not ingest conversation transcripts, copy arbitrary model outputs, read source files, serialize private content, call a provider, allocate compute, start training, publish weights, or grant tool authority.

The implementation is `packages/maria-runtime/python/maria_runtime/learning_dataset.py`.

## Input boundary

Every candidate contains only:

- a `LearningSource` identity;
- its SHA-256 content revision;
- a source kind;
- an origin/provenance group;
- the exact `LearningApproval` already defined by the Learning Fabric.

The planner receives one common:

- training purpose (`finetune` or `distillation`);
- project;
- exact target model identity and revision;
- reviewed `TrainingSupport` record;
- current trusted host time.

The planner re-runs `LearningAdmissionPolicy` for every candidate. A source cannot enter a plan merely because a previous caller says it was reviewed.

`knowledge` access is not a training purpose and therefore cannot create a dataset plan.

## Fail-closed admission

The planner rejects a candidate set when any of the following is true:

- a source approval is absent, mismatched, revoked, expired, or has incomplete rights/privacy/quality review;
- the target does not have current verified support for the requested training purpose;
- model output is presented as normal fine-tuning material instead of explicitly reviewed distillation material;
- the same content revision appears more than once;
- fewer than three independent provenance origins exist;
- project, time, candidate container, purpose, target, or support types are malformed.

Contract validation happens before semantic early exits. Invalid project identifiers and invalid/non-finite timestamps cannot bypass validation by selecting a non-training purpose.

## Split isolation

The plan creates three explicit splits:

- `train`;
- `validation`;
- `test`.

All sources sharing one `origin_id` remain in the same split. This prevents a single provenance group from leaking into both training and held-out evidence.

At least three independent origins are therefore required. The two smallest provenance groups become held-out test and validation groups; remaining groups become training data. SHA-256 of the origin identifier is used only as a deterministic tie-breaker. Candidate input order does not affect the result.

This is a conservative v1 rule, not a claim of statistically optimal sampling. A later private dataset builder may introduce stratification only with explicit evidence that it preserves provenance isolation.

`origin_id` must be chosen as the real independence boundary: for example, a distinct source collection, session, repository subset, teacher run, or other provenance unit. Artificially assigning a unique origin per row defeats the leakage protection and is outside this module's trust boundary.

## Manifest identity

A successful plan contains metadata entries and a SHA-256 `manifest_digest` over a canonical JSON representation containing:

- project;
- target provider/model/revision;
- purpose;
- source identifiers and revisions;
- provenance origin;
- source kind;
- assigned split.

The digest detects changes to the planned source set or split assignment. It is not a signature and does not prove reviewer identity, consent, licensing, or that source bytes really match the supplied digest. Those remain trusted-host responsibilities.

The dataclasses containing source identifiers use redacted diagnostic `repr` behavior, but ordinary serialization can still reveal their fields. Callers must not treat `repr=False` as a privacy sandbox.

## Execution boundary

`DatasetPlanner` has no training method and the decision/plan records expose `training_started == False`.

A successful `dataset-plan-ready` result means only:

> these reviewed metadata records can be assembled into a provenance-isolated manifest for a later authorized data-building stage.

It does **not** mean:

- source bytes were read;
- a dataset exists on disk;
- a provider accepted the data;
- a training job started;
- the target model improved;
- the resulting weights are safe to deploy.

Those claims require later implementation and separate evidence.

## Relationship to earlier MARIA Python prototypes

Earlier conversation prototypes explored monolithic training folders, generic memory dumps, direct provider calls, dynamic plugins, desktop automation and scheduled jobs. Those drafts are useful as product ideas but are not copied into this runtime wholesale.

This slice keeps only the safe underlying concept relevant here: reviewed material should be organized deterministically with evidence and held-out evaluation boundaries. Existing bounded SEIS/MARIA runtime, MCP, permission and Learning Fabric contracts remain authoritative.

## Verification

The work was developed test-first on draft PR #208.

Red state 1:

- the new dataset-plan tests failed because `maria_runtime.learning_dataset` did not exist.

Green state 1:

- implementation added deterministic provenance grouping, admission revalidation, duplicate-content rejection and manifest hashing;
- the focused dataset tests passed together with the existing MARIA regression scripts.

Red state 2:

- adversarial contract tests showed that malformed project/time values could reach the non-training-purpose early return before validation.

Green state 2:

- contract validation was moved ahead of semantic exits;
- the new adversarial tests and existing suite passed.

The GitHub workflow `MARIA Learning Fabric` runs both the original Learning Fabric contract suite and every `test/maria-*.test.py` regression script on the PR merge checkout.

## Next safe step

Build a **private content materialization boundary** that accepts only a frozen `DatasetPlan`, verifies the real source bytes against the approved SHA-256 revisions, performs explicit secret/personal-data checks, and writes only to a user-approved private destination. It should still stop before provider upload or training-job execution.
