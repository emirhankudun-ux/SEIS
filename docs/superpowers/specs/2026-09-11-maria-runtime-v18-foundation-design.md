# MARIA × SEIS Runtime v18 Foundation Design

## Goal

Evolve the user-provided MARIA v17 single-file prototype into a SEIS-native, modular, standard-library-first runtime foundation without copying its unsafe execution shortcuts into the production architecture.

## Product identity

MARIA is the primary human-facing intelligence of SEIS. SEIS owns orchestration beneath the interface. The visible experience should remain coherent while the runtime separates context, permissions, capability discovery, model routing, memory provenance, tool safety, verification, and adapters.

## First foundation slice

This PR deliberately implements only the shared contracts that every future MARIA feature depends on:

1. **Project Context Engine** — provenance-aware facts with current verified evidence outranking stale or inferred memory.
2. **Capability Registry** — tool metadata, health state, reliability, latency, cost, supported capabilities, and deterministic resolution.
3. **Permission Engine** — explicit READ, SAFE_EXECUTE, MODIFY, EXTERNAL, DESTRUCTIVE, FINANCIAL, and PRIVACY_SENSITIVE action classes.
4. **Model Registry + Router** — capability/context-aware routing with local-first preference for sensitive work when an adequate local model exists.
5. **Prompt Cache v2** — SHA-256 cache identity over the entire request plus model and generation parameters, replacing the v17 first-two-message MD5 shortcut.
6. **Safe Command Policy** — argv-based parsing that rejects shell composition and destructive command families before any terminal adapter is allowed to execute.
7. **Thin MARIA launcher** — `apps/maria-desktop/maria.py` exposes status/doctor/context/route commands without network or mutation authority.

## Deliberately not implemented yet

- live provider calls;
- microphone or camera capture;
- wake word;
- GUI automation;
- Unreal or Blender mutation;
- Git writes;
- external publication/deployment;
- automatic recurring processes;
- cloud memory sync.

The original v17 code remains design input, not a claim that all of its integrations are production-ready.

## Security corrections from v17

- `shell=True` is not permitted by the runtime foundation;
- filesystem access is not implicitly unrestricted;
- approval is evaluated at action/tool-call level, not only from LLM intent classification;
- tool health is explicit rather than a boolean only;
- cache keys include the full request and model parameters;
- memory facts carry source, project, confidence, verification, and observation time;
- local-first routing is explicit for sensitive work;
- no Unreal UDP protocol is labeled a verified MCP until capability discovery proves compatibility.

## Architecture

```text
Emirhan
  ↓
MARIA Interface
  ↓
SEIS Runtime Foundation
  ├── ProjectContextEngine
  ├── CapabilityRegistry
  ├── PermissionEngine
  ├── ModelRegistry / ModelRouter
  ├── PromptCache
  └── CommandPolicy
  ↓
Future adapters: macOS · GitHub · Unreal · Blender · Xcode · Figma · Browser
  ↓
Observation · Verification · Evidence
```

## Acceptance criteria

- standard library only;
- deterministic behavior;
- current verified evidence outranks stale unverified context;
- unavailable/degraded tools cannot outrank healthy structured integrations;
- sensitive work prefers an adequate local model;
- mutating, external, destructive, financial, and privacy-sensitive actions require approval by default;
- shell composition/destructive command strings fail closed;
- focused tests and checker pass in GitHub Actions;
- no network call or external write occurs in the foundation.
