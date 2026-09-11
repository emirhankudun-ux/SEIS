# MARIA Intelligence Fabric v1

## Status

Foundation slice. Provider metadata, verified model-discovery conversion, safe MCP import preview, and a trust/approval MCP gateway evaluator are implemented. No live provider or MCP process execution is enabled by this document or its companion runtime modules.

## Purpose

MARIA is the human-facing intelligence of SEIS. The Intelligence Fabric is the provider and integration boundary that lets MARIA reason about multiple AI providers, local runtimes, and MCP integrations without hard-wiring the product to one vendor or pretending an integration is usable before it has been verified.

The initial logical provider families are:

- OpenAI
- Codex
- DeepSeek
- Qwen
- Gemini
- Abacus AI
- Ollama
- LM Studio

These entries are routing metadata, not authenticated connections and not model-version claims. Every default provider starts in `discovery-required` state.

## Architecture boundary

```text
MARIA
  |
  +-- Project Context / Continuation
  |
  +-- Intelligence Fabric
  |     +-- Provider Registry (metadata only)
  |     +-- Provider Discovery Adapter (verified redacted facts -> ModelSpec)
  |     +-- Model Registry / Router (verified model facts)
  |     +-- MCP Config Import Preview (redacted, disabled)
  |     +-- MCP Gateway (trust/schema/provenance/approval evaluation)
  |     +-- Capability Registry (verified tools)
  |
  +-- Permission Engine (per action)
  +-- Verification / Evidence
```

Provider metadata answers: "Which provider families could satisfy this class of work?"

Discovery facts answer: "What has the current environment actually verified about a concrete model endpoint?"

Model metadata answers: "Which concrete discovered model is currently usable, with what context, reliability, latency, cost, locality, and capability facts?"

The router must choose from verified model facts. The default provider catalog must never be interpreted as a permanent ranking or a claim that a remote account is connected.

## Provider registry rules

`ProviderRegistry` is intentionally small and deterministic:

- provider IDs are stable internal identifiers;
- capability labels are broad routing intents;
- local runtimes are explicitly marked local;
- connection state is explicit;
- secret values are not represented by the provider metadata schema;
- public manifests are safe for UI/debug display;
- the registry does not perform network calls;
- the registry does not select a permanent winner.

A discovery adapter may derive another state only from verified environment evidence. The registry's default catalog remains discovery-first rather than pretending that a provider is connected.

## Provider discovery rules

`ProviderDiscoveryAdapter` is a side-effect-free conversion boundary. It does not probe a network, launch a local runtime, resolve secrets, or mutate provider configuration.

A separate discovery source must collect a redacted `ModelDiscoveryFact`. The adapter then applies fail-closed rules:

1. unknown provider IDs are rejected;
2. unverified facts stay `discovery-required` and cannot create an available model;
3. verified but unreachable endpoints become `unavailable`;
4. verified reachable cloud endpoints without confirmed authentication become `auth-required`;
5. only verified, reachable, authentication-ready facts become routable `ModelSpec` records;
6. local discovered models are marked with local privacy metadata;
7. only routing metadata is accepted: credentials, tokens, headers, and secret values have no field in the discovery schema.

This separates *observation* from *routing*. A later adapter may inspect Ollama, LM Studio, a cloud provider SDK, or another source, but it must return redacted facts before the central runtime can use them.

## MCP import rules

`MCPConfigImporter` accepts MCP JSON and creates a review preview. It deliberately does not execute or install anything.

The importer:

1. validates the root and `mcpServers` shapes;
2. validates command, argument, environment-key, and transport types;
3. retains environment variable names but drops all environment values;
4. identifies secret-like environment keys for secure resolution later;
5. flags shell-wrapper launchers for manual review;
6. exposes each imported server as a disabled discovery-only `ToolSpec`;
7. leaves health, authentication, version, and capability discovery unresolved.

This means importing a configuration cannot silently create execution authority.

## MCP gateway rules

`MCPGateway` consumes a redacted `MCPDiscoveryFact`; it does not start a process or call a tool. Discovery sources remain separate from trust decisions.

The gateway fails closed:

- descriptor/discovery server-name mismatches are rejected;
- shell-wrapper/manual-review descriptors cannot be enabled by an approval flag alone;
- unverified discovery remains disabled;
- unreachable servers become unavailable;
- invalid or empty schemas become incompatible;
- unverified provenance remains disabled;
- duplicate discovered capabilities are rejected;
- a fully verified server is still disabled until explicit enablement approval is recorded;
- after enablement, every discovered method retains its own `ActionClass` mapping for the `PermissionEngine` to evaluate again at call time.

There are therefore two distinct approval boundaries: **server enablement** and **per-action execution**. Enabling a server never grants blanket mutation authority.

## Secret boundary

Secret values must not be committed to repository configuration or returned in public manifests. Future live adapters should resolve credentials through an external secure secret store (for macOS, Keychain is the preferred native direction) and pass only the minimum required credential material to a provider process or request.

The current MCP importer intentionally discards environment values even when they are present in imported JSON. Provider discovery similarly accepts only an `auth_present` boolean rather than credential material.

## Why MCP process execution remains disabled

A healthy MCP descriptor plus discovery evidence still does not itself provide a process supervisor, credential resolver, retry/circuit-breaker runtime, or per-call executor. Those are separate implementation surfaces that must preserve the trust decisions above.

The current foundation can determine whether a server is eligible for explicit enablement and how each discovered method must be permission-classified, but it intentionally does not launch or invoke the server.

## Next slices

1. Provider-specific discovery sources for Ollama, LM Studio, and selected cloud providers that emit redacted `ModelDiscoveryFact` records.
2. MCP process supervisor with bounded launch, health probes, schema capture, retries/circuit breakers, and evidence recording.
3. Per-call MCP executor that re-checks `PermissionEngine` before every invocation.
4. Unified capability routing that combines model requirements with verified tool requirements.
5. Project-aware policy profiles for SEIS, Deadly Evil, Eleni-Neferi, Pantechnoepistemonoesis, PANTECHNOSYNI, and Portfolio.
6. SwiftUI Integration Center for provider/MCP status, import preview, approvals, and health evidence.

## Non-goals of v1

This slice does not include provider API calls, OAuth, model downloads, MCP process launch, plugin installation, filesystem mutation, Git mutation, Unreal/Blender mutation, GUI automation, deployment, publication, billing actions, or uncontrolled background agents.
