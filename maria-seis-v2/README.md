# MARIA × SEIS — 4.0.0-alpha.5

A modular **web simulation and trusted-host adapter foundation** for the MARIA personal-intelligence experience. This is an engineering alpha, not a finished desktop operator. The existing SEIS Apple-first / Swift-first direction is unchanged.

## Alpha.5 local-model adapter foundation

This checkpoint adds the first concrete OpenAI-compatible **local model adapter contract** for trusted-host use:

- `/v1/models` discovery with configured-model fail-closed behavior;
- `/v1/chat/completions` inference;
- bounded timeout and cancellation forwarding;
- canonical `local` provider-id binding;
- attributable provider receipts;
- end-to-end coverage through `HostAdapterManager → LiveRuntimeAdapter → orchestrator → verifyLiveReceipt`.

The shipped browser UI still starts in simulation mode and does **not** auto-connect to LM Studio, Ollama, OpenAI, MCP, macOS, Unreal or Blender. A real local endpoint must be explicitly configured by a trusted host. Successful model transport proves provider attribution, not the factual correctness of the model's answer. No browser-side API keys are introduced.

## Existing platform foundation

- provider lifecycle state machine with verified health metadata;
- provider supervisor with bounded probes, capability anti-escalation, health TTL, cancellation and probe deduplication;
- allowlisted preference persistence for project/mode/routing choices only;
- Plugin Host v2 with API-version checks, declared capability checks, explicit permission grants, crash isolation and bounded invocation timeout;
- bounded execution journal with secret-key redaction and truthful terminal outcomes;
- versioned host-adapter API (`connect`, `health`, `execute`, `disconnect`);
- dependency-injected `LiveRuntimeAdapter` plus strict attributed live-receipt verification.

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

Fresh local verification for alpha.5: **87/87 Node tests** and **17/17 offline Chromium acceptance checks**. The local-model transport tests use deterministic injected HTTP responses; this environment has not verified a real LM Studio/Ollama process or HTTP loopback browser navigation.

## Execution truth

The default `runCommand` instance uses only the simulator. Live execution is possible only through explicit dependency injection of a live runtime and a verified provider registry. There is no silent fallback from live mode to simulation.

`verifyPrototype` validates only the simulator contract. `verifyLiveReceipt` requires host-runtime identity, provider attribution, matching run/project/intent identity, explicit external verification evidence and a verified receipt before returning `verified`.

Keep provider behavior behind trusted-host adapters. Do not convert a catalog flag into a connection, execute arbitrary plugins, or place credentials in the browser.

See [architecture](ARCHITECTURE.md), [security](SECURITY.md), [roadmap](docs/ROADMAP.md), and [alpha.5 verification](docs/ALPHA5-VERIFICATION.md).

MIT license. No deployment or production readiness is claimed by this package.
