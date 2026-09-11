# MARIA × SEIS — 4.0.0-alpha.7

A modular **web simulation and trusted-host adapter foundation** for the MARIA personal-intelligence experience. This is an engineering alpha, not a finished desktop operator. The existing SEIS Apple-first / Swift-first direction is unchanged.

## Alpha.7 MCP lifecycle hardening

This checkpoint makes the MCP client contract current and fail-closed across both modern and legacy protocol eras:

- defaults to MCP `2026-07-28` discovery through `server/discover`;
- stamps modern requests with protocol/client capability metadata;
- falls back to the legacy initialize lifecycle only when discovery is unsupported;
- sends the required `notifications/initialized` notification for legacy sessions;
- validates negotiated protocol versions instead of accepting arbitrary downgrade responses;
- rejects malformed `tools/list` results;
- requires a valid `CallToolResult` shape before a tool response can be marked successful;
- preserves discovered-tool-only execution, host-side auth forwarding and cancellation;
- includes the negotiated MCP protocol in attributable execution evidence.

The browser UI still starts in simulation mode. No real external MCP server, local model process, OpenAI endpoint, macOS automation bridge, Unreal instance or Blender instance is claimed connected by this package.

## Existing platform foundation

- provider lifecycle state machine with verified health metadata;
- provider supervisor with bounded probes, capability anti-escalation, health TTL, cancellation and probe deduplication;
- allowlisted preference persistence for project/mode/routing choices only;
- Plugin Host v2 with API-version checks, declared capability checks, explicit permission grants, crash isolation and bounded invocation timeout;
- bounded execution journal with secret-key redaction and truthful terminal outcomes;
- versioned host-adapter API (`connect`, `health`, `execute`, `disconnect`);
- dependency-injected `LiveRuntimeAdapter` plus strict attributed live-receipt verification;
- OpenAI-compatible local-model adapter contract with model discovery, completion transport, timeout and cancellation;
- MCP tool discovery and execution contract with modern/legacy lifecycle negotiation.

## Run

Use Node.js 22 or newer for tests and Python 3 for local serving. No runtime npm dependencies or API keys are required.

```sh
npm test
npm run dev
```

Then open `http://127.0.0.1:4173`. The development server binds only to loopback.

## Test

```sh
npm test
python3 tests/browser_smoke.py --offline --output ./qa-artifacts
```

Fresh local verification for alpha.7: **96/96 Node tests** and **17/17 offline Chromium acceptance checks**. These MCP tests use deterministic injected transports; they verify protocol behavior and fail-closed boundaries, not a real remote MCP server or external side effect.

## Execution truth

The default `runCommand` instance uses only the simulator. Live execution is possible only through explicit dependency injection of a live runtime and a verified provider registry. There is no silent fallback from live mode to simulation.

`verifyPrototype` validates only the simulator contract. `verifyLiveReceipt` requires host-runtime identity, provider attribution, matching run/project/intent identity, explicit external verification evidence and a verified receipt before returning `verified`.

Keep provider behavior behind trusted-host adapters. Do not convert a catalog flag into a connection, execute arbitrary plugins, or place credentials in the browser. MCP discovery is capability discovery, not authorization; consequential tool calls still require the surrounding permission policy.

See [architecture](ARCHITECTURE.md), [security](SECURITY.md), and [roadmap](docs/ROADMAP.md).

MIT license. No deployment or production readiness is claimed by this package.
