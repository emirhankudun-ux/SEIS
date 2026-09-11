# MARIA Local Model Readiness

## Status

Active read-only presentation contract for local inference readiness.

`LocalModelReadinessBuilder` combines already-routed `ModelSpec` metadata with the current redacted `LocalRuntimeStatusSnapshot`. It performs no network I/O, no model loading, no runtime launch, no inference, and no provider authentication.

## Purpose

A model being discovered or present in a registry is not enough to claim it is safe to invoke. The Integration Center needs one deterministic UI-safe answer for whether the currently selected local model is actually eligible for explicit text inference.

The builder therefore keeps these concerns separate:

```text
verified discovery evidence
        +
current runtime probe state
        +
model availability/locality/capability
        |
        v
LocalModelReadinessRecord
```

## States

- `ready` — current evidence supports explicit invocation through the implemented local text adapter.
- `warming` — provider health evidence is absent, unknown, or still warming.
- `degraded` — the relevant provider probe is currently degraded or its latest normalized outcome is not successful.
- `unavailable` — the routed `ModelSpec` is no longer marked available.
- `evidence-required` — the model lacks the exact discovery provenance/sample evidence required for its provider, or current snapshot evidence is older/weaker than the model claims.
- `unsupported` — the model is non-local, uses an unsupported provider family, or lacks canonical `chat` capability.

Only `ready` sets `invokable=True`.

## Provider evidence binding

Current explicit local text adapters are intentionally limited to:

| Provider | Required runtime probe | Required model evidence source |
| --- | --- | --- |
| Ollama | `ollama/show` | `local-health:ollama/show` |
| LM Studio | `lm-studio/models` | `local-health:lm-studio/models` |

The builder does not infer readiness from model names, parameter counts, publisher strings, installed files, or provider family guesses.

A `READY` runtime state is still rejected as degraded if its latest normalized probe outcome is not `SUCCESS`. If the current runtime snapshot has fewer evidence samples than the `ModelSpec` claims, readiness fails closed to `evidence-required`.

## Output contract

`LocalModelReadinessRecord` is immutable and presentation-safe. It includes only:

- provider id;
- model name;
- readiness state;
- canonical routing capabilities;
- context size;
- evidence sample count;
- derived `invokable` boolean.

It does not contain prompts, request bodies, model output, URLs, HTTP headers, credentials, raw probe payloads, exception text, or provider response bodies.

Records are sorted deterministically by `(provider_id, model_name)`. Duplicate provider/model identities and duplicate runtime probe identities are rejected instead of silently overriding one another.

## Integration Center use

The future SwiftUI Integration Center can consume these records as a read-only view model source. UI presentation may show readiness and supporting normalized evidence, but it must not treat the record itself as execution authority.

Actual invocation still passes through:

1. routed `ModelSpec`;
2. `ModelWorkStepBinding`;
3. `ModelWorkStepRunner` validation;
4. the explicit Ollama or LM Studio adapter;
5. the bounded literal-loopback transport.

Readiness is therefore a visibility boundary, not a permission bypass.
