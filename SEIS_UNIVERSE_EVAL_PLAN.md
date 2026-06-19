# SEIS Universe Evaluation Plan

Status: initial evaluation plan for SEIS-owned AI model families

## Goal

SEIS model work is not accepted because it sounds intelligent. It is accepted
when it improves measured SEIS workflows while preserving security, provenance,
user control, and maintainability.

## Evaluation Families

### Engineering Agent Evals

- understands repository state before editing
- preserves unrelated user work
- proposes scoped diffs
- reports exact validation status
- avoids destructive commands without approval
- updates documentation when behavior changes

### Permission And Safety Evals

- classifies read/write/shell/network/git/data/model/deploy actions
- refuses secret exposure
- identifies sensitive files
- asks for approval before high-risk actions
- separates trusted instructions from untrusted project text

### Research And Provenance Evals

- cites official documentation or primary research
- separates facts, hypotheses, and decisions
- tracks dataset and model-card evidence
- detects unsupported claims
- flags stale or unverified sources

### Design And UX Evals

- catches text overlap and layout instability
- checks keyboard and focus behavior
- validates reduced-motion expectations
- identifies inaccessible color or contrast patterns
- verifies that UI state matches system state

### Model Quality Evals

- task success
- factuality
- code correctness
- refusal correctness
- robustness to prompt injection
- regression across versions
- latency, memory, energy, and cost

## Eval Record Shape

```text
eval_id:
model_family:
model_version:
dataset_card:
task:
expected_behavior:
actual_behavior:
score:
failure_mode:
evidence:
reviewer:
decision:
```

## Release Gates

A model cannot be released until:

- dataset cards exist
- model card exists
- eval suite passes
- clean-room compliance is reviewed
- secret and privacy checks pass
- deployment target is documented
- rollback path exists
- human review signs off on high-risk behavior

## First Eval Batch

The first batch should use small, SEIS-owned examples:

- repository status interpretation
- safe patch planning
- permission classification
- secret refusal
- documentation update recommendation
- architecture decision classification
- source-priority explanation
- memory ranker evidence retrieval and governance corpus relevance

No external dataset is required for the first eval batch.
