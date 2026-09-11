# MARIA Contextual Continuation

## Purpose

MARIA already resolves a compact set of continuation fields such as the active goal, repository, branch, blocker, last verification result, and next safe action. That exact-field path remains authoritative.

This slice adds a second, bounded recall lane for natural continuation requests. A request such as `SEIS Qwen routing tarafına devam` can now carry a few verified project facts that are lexically relevant to the request and the active goal without loading the complete project history.

## Data flow

1. `ProjectRegistry` resolves the requested project.
2. `ProjectContextEngine.get()` resolves the canonical core continuation fields using the existing policy: verified evidence, then recency, then confidence.
3. `ProjectContextRetriever` performs deterministic BM25 retrieval over the same project scope.
4. Related recall is restricted to verified facts and uses the retriever's default current-fact resolution, so stale values for the same key do not leak into normal continuation briefs.
5. Core continuation keys are filtered out of the related-context section to avoid duplication.
6. At most `related_context_limit` items are attached to the brief. Setting the limit to `0` disables semantic recall completely.

## Trust boundary

Context recall is advisory metadata only. It does not:

- execute a model or tool;
- grant a permission;
- alter project context;
- promote unverified evidence;
- read another project's facts;
- perform network I/O;
- persist a transcript;
- train or fine-tune a model.

The continuation resolver still declares `ready_to_resume` only from the required verified core fields. Related context cannot make an otherwise incomplete brief ready.

## Public result shape

`ContinuationBrief.to_dict()` now includes `related_context`. Each item carries:

- `key`
- `value`
- `source`
- `fact_type`
- `observed_at`
- `confidence`
- `verified`
- BM25 `score`

This keeps provenance visible to downstream presentation or planning layers.

## Testing

`test/maria-contextual-continuation.test.py` covers:

- verified related recall;
- exclusion of fixed continuation fields;
- stale-value suppression for duplicate keys;
- rejection of unverified related facts;
- serialization through `ContinuationBrief.to_dict()`;
- disabling recall with `related_context_limit=0`.

The implementation is intentionally small and depends on the existing context and BM25 modules instead of creating another memory subsystem.
