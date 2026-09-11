# MARIA Local Runtime Probes

## Status

Implemented as a bounded discovery, provenance-binding, capability-normalization, and redacted health-evidence slice for MARIA Intelligence Fabric v1.

The local runtime layer can inspect already-running LM Studio and Ollama services on the local machine. It does **not** start, install, download, authenticate to, perform inference through, or mutate a runtime.

## Trust boundary

`LocalRuntimeProbe` deliberately exposes only three operations:

- `probe_lm_studio_models()` → `GET http://127.0.0.1:<port>/api/v1/models`
- `probe_ollama_tags()` → `GET http://127.0.0.1:<port>/api/tags`
- `probe_ollama_show(model_name)` → `POST http://127.0.0.1:<port>/api/show`

Callers cannot supply an arbitrary host, URL, path, HTTP method, request header set, or credential through this API. Configurable ports are validated to the TCP range and the built-in transport independently requires the literal IPv4 loopback address.

`LocalDiscoveryCoordinator` is the orchestration boundary above the raw probe. It binds transport evidence to provider-specific parsers, health evidence, and current inventory provenance before a local model can become a `ModelDiscoveryFact`.

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

## Typed failure evidence

`LocalProbeError` carries a bounded `LocalProbeFailureKind` instead of forcing callers to interpret exception text. Supported kinds are:

- timeout;
- transport error;
- HTTP error;
- policy rejection;
- invalid response.

The coordinator maps those values directly to the redacted `ProbeOutcome` schema. Raw response bodies, exception messages, request headers, tokens, prompts, and model output are not copied into health evidence.

Redirects and oversized responses are treated as policy rejections. Non-200 responses are HTTP errors. Invalid media types, JSON, UTF-8, or root shapes are invalid responses. Transport timeouts are distinguished from other transport failures.

## Ollama inventory and show policy

The Ollama tags request is a body-free GET. `OllamaTagsDiscoverySource` converts its response into `LocalModelCandidate` records containing only provider ID, model name, digest, size, and modified timestamp. These candidates intentionally have no context or capability fields and are **not routable models**.

`LocalDiscoveryCoordinator.refresh_ollama_inventory()` is the only automatic path that marks an inventory as current. A refresh first revokes the prior in-memory inventory, then repopulates it only after both the bounded HTTP probe and the tags parser succeed. Therefore a failed refresh cannot silently leave an older inventory trusted as current.

Automatic `discover_ollama_model(name)` calls are permitted only when `name` exists in that current verified inventory. A caller may bypass inventory membership only by explicitly setting the user-selection boundary; this is intended for a model name the user deliberately chose rather than autonomous probing of arbitrary names.

The Ollama show request body contains exactly one user-derived field: the normalized model name. Empty names, control characters, and names longer than 512 characters are rejected before transport. No token, API key, arbitrary option map, or generation prompt is accepted.

The tags parser rejects duplicate model names, missing identity metadata, non-positive sizes, and mismatched `name` / `model` identifiers. This prevents inventory data from silently becoming ambiguous capability evidence.

Ollama `/api/show` native capability labels are normalized through an explicit allowlisted map before they become SEIS routing authority. Unknown labels remain discovery evidence but are not promoted to routable capabilities, and no model-name or family-name heuristic is used.

## LM Studio request and capability policy

The LM Studio models request is a body-free GET with only an `Accept: application/json` header. It is intended for local model metadata discovery, not inference.

LM Studio v1 explicitly reports both `llm` and `embedding` model types from `/api/v1/models`. `LMStudioV1DiscoverySource` now treats those provider-declared types separately:

- an `llm` receives the canonical `chat` route plus only the explicitly reported `vision`, `trained_for_tool_use`, and public `reasoning` capabilities;
- an `embedding` receives only the canonical `embedding` route;
- an unknown future model type is ignored rather than guessed into a route;
- publisher, display name, architecture, parameter count, and model key text never create capabilities.

The endpoint's `max_context_length` remains required for either supported model type. Embedding models do not inherit chat, coding, reasoning, vision, or tool-use authority from their names or from LLM-only metadata.

`LocalDiscoveryCoordinator.discover_lm_studio_models()` validates the runtime payload before recording a successful health sample and only returns model facts after the configured minimum reliability evidence exists.

## Redacted health evidence

`LocalHealthEvidenceLedger` keeps a bounded in-memory history per supported probe. `ProbeObservation` intentionally has no raw body, header, prompt, model output, exception-message, or credential field.

Supported normalized outcomes are limited to success, timeout, transport error, HTTP error, policy rejection, and invalid response. The ledger:

- keeps only the latest configured number of samples per probe;
- never invents reliability from insufficient data;
- exposes `reliability=None` until a minimum sample threshold is met;
- derives reliability from the observed success ratio once enough samples exist;
- derives median latency only from successful observations;
- keeps provider/probe combinations on an explicit allowlist.

The coordinator validates provider-specific payloads before recording an HTTP 200 result as a health success. A structurally invalid tags/show/models payload becomes `INVALID_RESPONSE`, not a success.

For model discovery, a successful parsed payload is first represented with provisional routing metadata, then the coordinator records the successful observation and reads the ledger summary. If the minimum evidence threshold has not been reached, discovery raises `LookupError` and the model remains non-routable. Once the threshold is reached, the evidence-backed reliability value is written into the returned `ModelDiscoveryFact`.

This prevents a single lucky localhost response from being treated as durable model reliability.

## Failure behavior

Redirects, non-200 responses, non-JSON media types, invalid UTF-8/JSON, array/scalar roots, oversized responses, invalid configuration, transport errors, timeouts, malformed provider metadata, stale inventory provenance, and insufficient health evidence all fail closed.

Raw transport exceptions are not surfaced as trusted discovery evidence.

## Relationship to discovery parsers

The runtime path is now:

```text
already-running local runtime
        ↓
LocalRuntimeProbe
        ↓
LocalProbeResult / typed LocalProbeError
        ↓
LocalDiscoveryCoordinator
        ├──────────────→ LocalHealthEvidenceLedger
        │                       ↓
        │                evidence-backed reliability
        │
        ├── LM Studio models parser
        │       ├── llm → explicit LLM capabilities
        │       └── embedding → embedding only
        │                       ↓
        │                ModelDiscoveryFact
        │
        └── Ollama tags parser
                ↓
          current verified inventory
                ↓
        provenance check / explicit selection
                ↓
          bounded Ollama show probe
                ↓
          Ollama show parser
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

This separation prevents HTTP reachability, inventory presence, or a suggestive model name from being mistaken for capability. LLM routes require explicit runtime metadata, embedding routes require LM Studio's explicit embedding model type, and routing still requires verified discovery facts with sufficient reliability evidence.

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
- persist raw response bodies or exception messages in health evidence;
- mutate filesystem, Git, Unreal, Blender, or external services.

## Verification

The focused test suite verifies fixed loopback targets, request method/body/header minimality, timeout and size propagation, latency measurement, malformed/oversized/redirect/non-success failure behavior, port validation, model-name validation, typed failure categories, Ollama inventory parsing, duplicate/incomplete candidate rejection, the non-routable candidate boundary, current-inventory provenance, stale-inventory revocation, explicit user-selection override, bounded health history, minimum-evidence routing gates, redacted observation schemas, native-to-canonical Ollama capability normalization, and LM Studio embedding-only routing without model-name heuristics.

The LM Studio embedding regression specifically covers a deliberately misleading model key containing `vision`, `coder`, and `chat`: the verified `type: embedding` record remains `embedding`-only and can be selected only for the canonical embedding capability.

## Next safe slice

The next highest-value local-runtime step should expand observability before execution authority:

1. wire `LocalRuntimeStatusSnapshot` plus route explanations into the read-only SwiftUI Integration Center;
2. surface whether a fact came from LM Studio LLM metadata, LM Studio embedding type, or Ollama show capability normalization without exposing raw payloads;
3. keep model loading/download and inference adapters behind separate explicit contracts and permission boundaries;
4. add execution readiness evidence only when the concrete LM Studio/Ollama adapter semantics are defined, instead of equating model inventory with execution authority.
