# MARIA × SEIS — 4.0.0-alpha.4

A modular **web simulation** of the MARIA personal-intelligence experience. This is an engineering alpha, not a finished desktop operator. The existing SEIS Apple-first / Swift-first direction is unchanged.

## Alpha.3 reliability foundation

This checkpoint adds four bounded platform contracts without pretending live integrations exist:

- provider lifecycle state machine (`unconfigured → connecting → ready/degraded/failed/disabled`) with verified health metadata;
- allowlisted preference persistence for project/mode/routing choices only — credentials are never persisted by this layer;
- Plugin Host v2 with API-version checks, declared capability checks, explicit permission grants, duplicate registration protection, crash isolation and bounded invocation timeout;
- bounded execution journal with secret-key redaction and truthful terminal outcomes from the orchestrator.

The UI remains simulation-first. OpenAI, local models, MCP, macOS, Unreal and Blender still require real adapters plus reproducible verification before they can be presented as live.

## What works

The command interface, project context, role catalog, advisory intent classification, fail-closed permission checks, provider eligibility checks, cancellable simulation, bounded execution timeout, event isolation, source conflict detection and plugin-manifest validator run locally. Alpha.4 also adds a provider supervisor contract for bounded health probes, capability discovery, health-expiry and adapter isolation. Keyboard navigation and responsive views are included.

A simulation result is **not** a completed build, AI answer, file edit or external action. Voice, vision, model inference, MCP, macOS control, Unreal, Blender, persistent memory and scheduling remain unconnected. Their presence in the catalog does not enable them.

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

See [verification evidence and limitations](docs/VERIFICATION.md). The browser harness replaces only module import specifiers with an import map in offline mode; it does not supply fake application logic.

## Release behavior changes

`runCommand` now returns `simulated`, not `complete`, for the demo. The simulator's verifier exposes `contractVerified` for structural checks; `verified` remains false because no external outcome was verified. Other outcomes include `approval`, `blocked`, `unavailable`, `invalid`, `unverified`, `cancelled`, `timed-out` and `error`.

The source-of-truth resolver defaults to factual evidence. A desired user instruction does not rewrite an observed result. Equal-ranked conflicting values remain unresolved. An explicit `{domain:'instruction'}` is available for instruction selection, not for permission bypasses.

## Extending it

Keep provider behavior behind adapters. Do not convert a catalog flag into a connection, execute arbitrary plugins, or place credentials in the browser. A real adapter requires a trusted host, scoped authorization, cancellation/reconciliation and independently checked results. `createProviderSupervisor` may establish *readiness evidence* for a registered adapter, but readiness is not execution permission and it expires after a bounded health TTL. `defineMariaPlugin` validates metadata only; it is not a sandbox.

ChatGPT app connections are not imported by this code. Future integrations need their own supported authorization flow. See [architecture](ARCHITECTURE.md), [security](SECURITY.md) and [roadmap](docs/ROADMAP.md).

MIT license. No deployment or production readiness is claimed by this package.
