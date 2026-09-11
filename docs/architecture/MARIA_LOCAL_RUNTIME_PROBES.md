# MARIA Local Runtime Probes

## Status

Implemented as a bounded discovery slice for MARIA Intelligence Fabric v1.

The probe layer can inspect already-running LM Studio and Ollama services on the local machine. It does **not** start, install, download, authenticate to, or mutate a runtime.

## Trust boundary

`LocalRuntimeProbe` deliberately exposes only two operations:

- `probe_lm_studio_models()` → `GET http://127.0.0.1:<port>/api/v1/models`
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

## Ollama request policy

The Ollama show request body contains exactly one user-derived field: the normalized model name. Empty names, control characters, and names longer than 512 characters are rejected before transport. No token, API key, arbitrary option map, or generation prompt is accepted.

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
LMStudioV1DiscoverySource / OllamaShowDiscoverySource
        ↓
ModelDiscoveryFact
        ↓
ProviderDiscoveryAdapter
        ↓
ModelSpec
        ↓
ModelRouter / UnifiedCapabilityRouter
```

This separation prevents HTTP reachability from being mistaken for model capability. The parser still requires explicit runtime-reported context/capability metadata, and routing still requires verified discovery facts.

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

The focused test suite verifies fixed loopback targets, request method/body/header minimality, timeout and size propagation, latency measurement, malformed/oversized/redirect/non-success failure behavior, port validation, and model-name validation.

The feature was developed test-first: the hosted MARIA Intelligence Fabric workflow first failed because `maria_runtime.local_probe` did not exist, then passed after the bounded implementation was added.

## Next safe slice

The next highest-value local-runtime step is model enumeration and health evidence:

1. add a bounded Ollama `GET /api/tags` enumeration contract;
2. probe `/api/show` only for names returned by that verified enumeration or explicitly selected by the user;
3. keep repeated health observations in a redacted evidence ledger;
4. derive reliability from evidence rather than a guessed constant;
5. expose the resulting verified local models to the Integration Center without auto-launching runtimes.
