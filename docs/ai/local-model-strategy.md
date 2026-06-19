# Local Model Strategy

Status: Foundation strategy

Local models are an optional SEIS privacy and experimentation lane. They are
not the default proof that SEIS owns a model.

## Goals

- support local-only workflows for sensitive drafts
- reduce external provider dependency where quality is acceptable
- support offline experimentation
- prepare future tokenizer, fine-tune, and evaluation work
- keep hardware and quality limits visible

## Modes

| Mode | Purpose | Rule |
| --- | --- | --- |
| Local draft | Private ideation and summarization. | No public capability claim. |
| Local review assist | Secondary review or cross-check. | Human verifies output. |
| Local retrieval | Query local approved knowledge. | Provenance required. |
| Local experiment | Test small models, prompts, or adapters. | Logs and configs required. |

## Boundaries

- Local model output is not trusted automatically.
- Local config secrets are not committed.
- Local models are not renamed as SEIS-owned models.
- Hardware assumptions must be documented before heavy runs.
- Expensive or long training requires explicit approval.

## First Implementation Shape

Use local models as optional adapters behind the model router. Start with
metadata and evaluation fixtures before adding runtime integrations.
