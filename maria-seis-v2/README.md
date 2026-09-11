# MARIA × SEIS — 4.0.0-alpha.4

A modular **web simulation and host-adapter contract** for the MARIA personal-intelligence experience. This is an engineering alpha, not a finished desktop operator. The existing SEIS Apple-first / Swift-first direction is unchanged.

## Current alpha.4 foundation

This checkpoint adds bounded platform contracts without pretending concrete live integrations already exist:

- provider lifecycle state machine with verified health metadata;
- provider supervisor with bounded probes, capability anti-escalation, health TTL, cancellation and probe deduplication;
- allowlisted preference persistence for project/mode/routing choices only — credentials are never persisted by this layer;
- Plugin Host v2 with API-version checks, declared capability checks, explicit permission grants, duplicate registration protection, crash isolation and bounded invocation timeout;
- bounded execution journal with secret-key redaction and truthful terminal outcomes;
- versioned host-adapter API (`connect`, `health`, `execute`, `disconnect`);
- dependency-injected `LiveRuntimeAdapter` plus strict attributed live-receipt verification.

The shipped browser UI still starts in simulation mode. OpenAI, local models, MCP, macOS, Unreal and Blender require concrete trusted-host adapters plus reproducible verification before they can be presented as live.

## What works

The command interface, project context, role catalog, advisory intent classification, fail-closed permission checks, provider eligibility checks, cancellable simulation, bounded execution timeout, event isolation, source conflict detection and plugin-manifest validator run locally. A future trusted host can inject a live runtime, but live routing succeeds only when provider readiness is fresh and the returned receipt is attributed to the selected provider, matches run/project/intent identity, and carries non-empty external verification evidence.

A simulation result is **not** a completed build, AI answer, file edit or external action. Adapter health is also **not** proof that a requested task succeeded.

## Run

Use Node.js 22 or newer for tests and Python 3 for local serving. No runtime npm dependencies or API keys are required.

From this package directory (`maria-seis-v2` on the GitHub branch):

```sh
npm test
npm run dev
```

Then open `http://127.0.0.1:4173`. The server binds only to loopback. Do not expose this development server as a production service.

## Test

```sh
npm test
# Optional: requires Python Playwright and Chromium
python3 tests/browser_smoke.py
# Network-free rendering of the same local modules
python3 tests/browser_smoke.py --offline --output ./qa-artifacts
```

Fresh combined verification for this checkpoint: **80/80 Node tests** and **17/17 offline Chromium acceptance checks**. HTTP serving remains outside verified scope in the execution sandbox because loopback navigation has been blocked by environment policy.

## Execution truth

The default `runCommand` instance uses only the simulator. Live execution is possible only through explicit dependency injection of a live runtime and a verified provider registry. There is no silent fallback from live mode to simulation.

`verifyPrototype` validates only the simulator contract. `verifyLiveReceipt` is stricter: it requires host-runtime identity, provider attribution, matching run/project/intent identity, an explicit external verification flag and non-empty evidence before returning `verified`.

The source-of-truth resolver defaults to factual evidence. A desired user instruction does not rewrite an observed result. Equal-ranked conflicting values remain unresolved.

## Extending it

Keep provider behavior behind trusted-host adapters. Do not convert a catalog flag into a connection, execute arbitrary plugins, or place credentials in the browser. `createProviderSupervisor` establishes time-bounded readiness evidence; `createHostAdapterManager` controls connect/health/execute/disconnect state; `LiveRuntimeAdapter` bridges a ready host adapter into orchestration. These layers are intentionally separate so readiness, authorization, execution and outcome verification cannot be conflated.

ChatGPT app connections are not imported by this code. Future integrations need their own supported authorization flow. See [architecture](ARCHITECTURE.md), [security](SECURITY.md) and [roadmap](docs/ROADMAP.md).

MIT license. No deployment or production readiness is claimed by this package.
