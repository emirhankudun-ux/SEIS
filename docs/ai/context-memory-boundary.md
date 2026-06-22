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

## Knowledge Source Classification Fixture

The first retrieval and knowledge-source boundary fixture is
`packages/data/fixtures/knowledge-source-classification.json`, with its schema in
`packages/data/schemas/knowledge-source-classification.schema.json`. It is
validated by `npm run check:knowledge-source-classification`.

This fixture keeps official docs, generated reports, and local contract fixtures
available as local metadata-backed sources while blocking discarded assistant
archive material from retrieval, memory writes, provider routing, and
implementation copying. Unsafe concepts such as automatic push/merge, active
countermeasures, poisoned data injection, memetic manipulation, autonomous
payment or infrastructure provisioning, fake BCI claims, and fake model
ownership claims are exclusion records, not implementation plans.

## Local Read-Only Retrieval Query Adapter

The first query adapter fixture is
`packages/data/fixtures/local-readonly-retrieval-query-adapter.json`, with its
schema in `packages/data/schemas/retrieval-query-adapter.schema.json`. It is
validated by `npm run check:retrieval-query-adapter`.

This adapter is a local Command Center contract for metadata lookup only. It can
select approved/local knowledge-source ids, return source metadata, and show
repository-relative evidence links. It cannot return raw archive content, create
embeddings, write persistent memory, call providers, expose provider keys,
execute GitHub writes, run SSH/deployment/payment/infrastructure actions, or
claim model training. The discarded assistant archive remains blocked through a
disabled guard adapter.

## Local Retrieval Result Cards And No-Content Search Transcripts

The first local retrieval-result surface is
`packages/data/fixtures/local-readonly-retrieval-search-transcript.json`, with
its schema in `packages/data/schemas/retrieval-search-transcript.schema.json`.
It is validated by `npm run check:retrieval-search-transcript`.

This fixture gives Command Center a safe way to display approved metadata
results and blocked/empty search transcripts. Result cards expose source class,
retrieval state, freshness, privacy mode, summary, and evidence links only.
No-content transcripts keep `resultCount` at `0` and explain why a query is
empty or blocked. The fixture does not return raw content, search secrets,
create embeddings, write persistent memory, call providers, route data
externally, mutate GitHub, execute SSH, deploy, pay, provision infrastructure,
or claim model training.

## SEIS 10,000,000 Token Feed Budget

The first token-feed capacity contract is
`packages/data/fixtures/seis-10m-token-feed-budget.json`, with its schema in
`packages/data/schemas/token-feed-budget.schema.json`. It is validated by
`npm run check:token-feed-budget`.

This fixture gives SEIS a 10,000,000 token metadata-only budget plan across
official docs, generated reports, local fixture contracts, and future approved
metadata-only sources. It keeps blocked archive material at 0 planned tokens,
sets `tokensExecuted` to `0`, and records no raw-content storage, embedding
index, persistent memory write, provider call, browser-side provider key, or
model training. The budget feeds Command Center evidence and model-router
planning; it is not an executed ingestion claim.
