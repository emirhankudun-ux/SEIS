# MARIA Local Runtime Probes

## Status

Implemented as a bounded discovery slice for MARIA Intelligence Fabric v1.

The probe layer can inspect already-running LM Studio and Ollama services on the local machine. It does **not** start, install, download, authenticate to, or mutate a runtime.

## Trust boundary

`LocalRuntimeProbe` deliberately exposes only three operations:

- `probe_lm_studio_models()` → `GET http://127.0.0.1:<port>/api/v1/models`
- `probe_ollama_tags()` → `GET http://127.0.0.1:<port>/api/tags`
- `probe_ollama_show(model_name)` → `POST http://127.0.0.1:<port>/api/show`

Callers cannot supply an arbitrary host, URL, path, HTTP method, request header set, or credential through this API. Configurable ports are validated to the TCP range and the built-in transport independently requires the literal IPv4 loopback address.

## Bounded behavior

Every probe has:

- an explicit positive timeout;
- an explicit maximum response size;
- no redirect following;
- no authentication headers;
- JSON-only response acceptance;
- a required HTTP 200 status;
- a JSON-object root requirement;
- measured monotonic latency;
- a redacted result containing only provider ID, endpoint, parsed payload, latency, and response size.

The built-in HTTP transport reads at most `max_response_bytes + 1`, which lets the policy layer detect an oversized response without buffering an unbounded body.

## Ollama inventory and show policy

The Ollama tags request is a body-free GET. `OllamaTagsDiscoverySource` converts its response into `LocalModelCandidate` records containing only provider ID, model name, digest, size, and modified timestamp. These candidates intentionally have no context or capability fields and are **not routable models**.

Candidate names can then be inspected through the bounded show request. The Ollama show request body contains exactly one user-derived field: the normalized model name. Empty names, control characters, and names longer than 512 characters are rejected before transport. No token, API key, arbitrary option map, or generation prompt is accepted.

The tags parser rejects duplicate model names, missing identity metadata, non-positive sizes, and mismatched `name` / `model` identifiers. This prevents inventory data from silently becoming ambiguous capability evidence.

## LM Studio request policy

The LM Studio models request is a body-free GET with only an `Accept: application/json` header. It is intended for local model metadata discovery, not inference.

## Failure behavior

Redirects, non-200 responses, non-JSON media types, invalid UTF-8/JSON, array/scalar roots, oversized responses, invalid configuration, transport errors, and timeouts fail closed through `LocalProbeError` or configuration `ValueError`.

Raw transport exceptions are not surfaced as trusted discovery evidence.

## Relationship to discovery parsers

The probe and parser layers remain separate:

```text
already-running local runtime
        ↓
LocalRuntimeProbe
        ↓
LocalProbeResult
        ↓
LM Studio: LMStudioV1DiscoverySource
        ↓
ModelDiscoveryFact

Ollama: OllamaTagsDiscoverySource
        ↓
LocalModelCandidate
        ↓
probe_ollama_show(candidate.name)
        ↓
OllamaShowDiscoverySource
        ↓
ModelDiscoveryFact

ModelDiscoveryFact
        ↓
ProviderDiscoveryAdapter
        ↓
ModelSpec
        ↓
ModelRouter / UnifiedCapabilityRouter
```

This separation prevents HTTP reachability or inventory presence from being mistaken for model capability. The show/models parsers still require explicit runtime-reported context/capability metadata, and routing still requires verified discovery facts.

Reliability history is intentionally not invented from one successful probe. A later health/evidence layer should aggregate repeated observations and supply reliability to the parser.

## Security non-goals

This slice does not:

- bind a listening socket;
- contact non-loopback hosts;
- resolve DNS names;
- follow redirects;
- launch LM Studio or Ollama;
- download or load models;
- perform inference;
- read or write credentials;
- mutate filesystem, Git, Unreal, Blender, or external services.

## Verification

The focused test suite verifies fixed loopback targets, request method/body/header minimality, timeout and size propagation, latency measurement, malformed/oversized/redirect/non-success failure behavior, port validation, model-name validation, Ollama inventory parsing, duplicate/incomplete candidate rejection, and the non-routable candidate boundary.

Two test-first cycles cover this slice:

1. the hosted MARIA Intelligence Fabric workflow failed because `maria_runtime.local_probe` did not exist, then passed after the bounded probe implementation was added;
2. the hosted workflow failed because `LocalModelCandidate` / `OllamaTagsDiscoverySource` did not exist, then passed after inventory parsing and `probe_ollama_tags()` were added.

## Next safe slice

The next highest-value local-runtime step is health and provenance evidence:

1. record repeated probe observations in a bounded redacted evidence ledger;
2. derive reliability from recent evidence rather than a guessed constant;
3. require inventory-to-show provenance so automatic Ollama `/api/show` probes only target names returned by verified enumeration (or an explicitly user-selected model);
4. expose verified local model state to the Integration Center without auto-launching runtimes;
5. keep inference and model loading as separately permissioned capabilities.
