# Context And Memory Boundary

Status: Foundation policy

SEIS separates temporary context, retrieval, persistent memory, prompts,
application logic, provider model capability, and trained model weights.

## Definitions

| Surface | Definition | Ownership claim |
| --- | --- | --- |
| Temporary context | Data passed into a task session. | Not model training. |
| Retrieval | Documents found and injected for a task. | Not model training. |
| Persistent memory | Approved durable notes or records. | Application data, not weights. |
| Prompt | Instruction and task template. | Application behavior. |
| Provider model | External model capability. | Provider-owned unless documented otherwise. |
| SEIS-owned model | Trained model with dataset, checkpoint, eval, and model card evidence. | Future research only. |

## Boundary Rules

- Do not store secrets in memory.
- Do not store restricted reference material as embeddings or memory.
- Do not treat retrieval as evidence of model training.
- Do not route private memory to providers without approval.
- Record provenance for durable knowledge.

## Command Center States

Memory and context surfaces should render as:

- approved
- pending review
- local-only
- redacted
- restricted
- expired
- blocked

Unknown state must not be shown as ready.

## Repository Intelligence Boundary

Repository intelligence may provide file structure, official docs, review
reports, roadmap items, security findings, validation status, PR status, branch
status, module maturity, evidence links, and stale-data warnings.

It must label each source as official, review, archive, mock, scan-generated,
live, planned, or unknown. Archive material is historical reference and must not
override official docs.
