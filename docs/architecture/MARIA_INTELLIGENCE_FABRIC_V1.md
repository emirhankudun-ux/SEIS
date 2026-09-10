# MARIA Intelligence Fabric v1

## Status

Foundation slice. Metadata and safe import preview only. No live provider or MCP execution is enabled by this document or its companion runtime modules.

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
  |     +-- Model Registry / Router (verified model facts)
  |     +-- MCP Config Import Preview (redacted, disabled)
  |     +-- Capability Registry (verified tools)
  |
  +-- Permission Engine
  +-- Verification / Evidence
```

Provider metadata answers: "Which provider families could satisfy this class of work?"

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

A later discovery adapter may promote an entry from `discovery-required` to another state only after it has verified the real environment.

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

## Secret boundary

Secret values must not be committed to repository configuration or returned in public manifests. Future live adapters should resolve credentials through an external secure secret store (for macOS, Keychain is the preferred native direction) and pass only the minimum required credential material to a provider process or request.

The current importer intentionally discards environment values even when they are present in imported JSON.

## Why MCP servers remain disabled

An MCP server definition only describes how a process might be launched. It does not prove that:

- the executable exists;
- the package/version is trusted;
- authentication is configured;
- the server is compatible;
- its schemas are valid;
- its capabilities match its claims;
- it is safe for the active project;
- the user has approved requested mutation authority.

Therefore imported servers become disabled discovery records until a later gateway performs health checks, schema discovery, permission mapping, provenance review, and explicit enablement.

## Next slices

1. Provider Discovery adapters that populate verified `ModelSpec` records without exposing credentials.
2. MCP Gateway v2 with process health, schema discovery, retries, circuit breakers, provenance, and per-call permissions.
3. Unified capability routing that combines model requirements with verified tool requirements.
4. Project-aware policy profiles for SEIS, Deadly Evil, Eleni-Neferi, Pantechnoepistemonoesis, PANTECHNOSYNI, and Portfolio.
5. SwiftUI Integration Center for provider/MCP status, import preview, approvals, and health evidence.

## Non-goals of v1

This slice does not include provider API calls, OAuth, model downloads, MCP process launch, plugin installation, filesystem mutation, Git mutation, Unreal/Blender mutation, GUI automation, deployment, publication, billing actions, or background agents.
