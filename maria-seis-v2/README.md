# MARIA × SEIS — 4.0.0-alpha.3

A modular **web simulation** of the MARIA personal-intelligence experience. This is an engineering alpha, not a finished desktop operator. The existing SEIS Apple-first / Swift-first direction is unchanged.

## What works

The command interface, project context, role catalog, advisory intent classification, fail-closed permission checks, provider eligibility checks, cancellable simulation, bounded execution timeout, event isolation, source conflict detection and plugin-manifest validator run locally. Keyboard navigation and responsive views are included.

Alpha.3 also adds explicit provider lifecycle state transitions, safe allowlisted preference persistence, a permission-enforced Plugin Host v2 with bounded invocation timeout, and a bounded execution journal that records truthful terminal outcomes while redacting secret-shaped fields.

A simulation result is **not** a completed build, AI answer, file edit or external action. Voice, vision, model inference, MCP, macOS control, Unreal, Blender, durable project memory and scheduling remain unconnected. Their presence in the catalog does not enable them.

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

Fresh alpha.3 evidence: 64/64 Node tests passed and 17/17 offline Chromium acceptance checks passed. HTTP navigation was blocked by the execution environment administrator policy and is not claimed as verified. See `docs/VERIFICATION-ALPHA3.md`.

## Release behavior

`runCommand` returns `simulated`, not `complete`, for the demo. The simulator's verifier exposes `contractVerified` for structural checks; `verified` remains false because no external outcome was verified. Other outcomes include `approval`, `blocked`, `unavailable`, `invalid`, `unverified`, `cancelled`, `timed-out` and `error`.

The execution journal records terminal status, execution mode, selected provider where applicable, verification evidence and whether an external action was actually verified. Simulation records always keep `verifiedExternalAction:false`.

Safe preferences persist only allowlisted non-secret values such as selected project, mode and routing preferences. Credentials, tokens, arbitrary memory and prompts are not persisted by this layer.

## Extending it

Keep provider behavior behind adapters. Do not convert a catalog flag into a connection, execute arbitrary plugins, or place credentials in the browser. A real adapter requires a trusted host, scoped authorization, cancellation/reconciliation and independently checked results.

Plugin Host v2 validates API compatibility, declared capabilities and permissions. Invocation requires explicit permission grants and uses bounded timeouts, but this is still not an OS sandbox for arbitrary third-party code.

ChatGPT app connections are not imported by this code. Future integrations need their own supported authorization flow. See [architecture](ARCHITECTURE.md), [security](SECURITY.md) and [roadmap](docs/ROADMAP.md).

MIT license. No deployment or production readiness is claimed by this package.
