# Evaluation Strategy

Status: Foundation strategy

SEIS evaluations measure AI Core behavior, prompt quality, routing decisions,
agent safety, documentation quality, and future model experiments.

## Evaluation Layers

| Layer | Purpose |
| --- | --- |
| Prompt regression | Detect behavior drift across prompt versions. |
| Router tests | Verify privacy, task class, and provider selection. |
| Agent safety | Verify approvals, forbidden actions, and validation claims. |
| Tool tests | Verify tool schemas, redaction, error handling, and timeouts. |
| App state tests | Verify ready, blocked, degraded, unknown, and approval states. |
| Research evals | Measure future tokenizer, fine-tune, and model experiments. |

## Minimum Record

Each evaluation run should capture:

- evaluation id
- target version
- dataset or fixture source
- privacy class
- metric or rubric
- pass/fail criteria
- observed output summary
- limitations
- reviewer
- timestamp

## Non-Claims

SEIS must not publish benchmark, safety, or model capability claims without
actual evaluation runs and reviewable records.
