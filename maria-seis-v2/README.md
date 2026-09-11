# MARIA × SEIS — 4.0.0-alpha.8

A premium web simulation plus a **real, narrowly scoped local MCP host check**. This is an engineering alpha, not a finished desktop operator. The SEIS Apple-first / Swift-first product direction is unchanged; this Node host is a small integration reference, not a replacement native architecture.

## Run the real local check

Use Node.js 22 or newer. No npm installation, model download, account, API key or runtime dependency is required for this command.

```sh
npm test
npm run mcp:check
```

Run these commands inside this package (`maria-seis-v2/` on GitHub). `mcp:check` starts the included MCP server in a separate Node process, negotiates protocol 2025-06-18, discovers `package.inspect`, authorizes that exact operation, and reads this package's `package.json`. The parent independently compares its bytes and SHA-256. It prints a JSON report and exits with status zero only when verification and child-process cleanup both succeed.

This is real subprocess communication and real read-only filesystem inspection, **not an injected HTTP response**. It is not validation of a third-party MCP server, an LM Studio/Ollama installation, or macOS/Unreal/Blender control. No arbitrary CLI arguments, shell commands, user-selected file paths or network endpoints are accepted by the check.

## Preview the interface

```sh
npm run dev
```

The existing Python 3 development server binds to `http://127.0.0.1:4173`. The browser remains explicitly in simulation mode. Running the host check does not silently turn on live browser controls. Do not expose this development server to the public internet.

## What changed

- Bounded Node stdio transport with JSON-RPC framing, response correlation, cancellation, timeouts, crash handling and process cleanup.
- Modern 2026-07-28 discovery/per-request metadata retained from the concurrent update, with explicit legacy version pinning, initialized notification, bounded atomic discovery and host authorization. The reference CLI pins 2025-06-18.
- Host authorization defaults to deny. A discovered tool is not automatically authorized.
- Malformed/empty results fail closed. Transport success and independently verified outcomes remain distinct.
- Old discovery replies cannot replace newer discovery state; disconnect invalidates pending results.
- Known host credential values are redacted from returned MCP data. Child environment does not inherit the parent's secrets.
- Local-model receipts now preserve their provider, run, project and intent identity. Local-model network tests still use injected responses.

Existing provider supervision, preferences, plugin contracts, journal, source-of-truth resolver and simulation UI are preserved. A plugin contract is not an OS sandbox, and a health check is not task completion.

## Verification and limits

The alpha.8 local package passed **152 Node tests** and **17 offline Chromium acceptance checks**. The included reference MCP server was launched and checked through real OS pipes and real files. Desktop and mobile screenshots show the actual rendered simulation UI.

HTTP browser navigation was attempted but blocked by the execution environment (`ERR_BLOCKED_BY_ADMINISTRATOR`); it is not reported as passing. macOS/Windows native execution, cloud providers, real local-model inference, third-party MCP interoperability and deployment are not verified here.

See [the alpha.8 verification record](docs/ALPHA8-MCP-STDIO.md), [architecture](ARCHITECTURE.md), [security](SECURITY.md) and [roadmap](docs/ROADMAP.md). Historical verification documents describe their named releases, not the current one. GitHub CI is a separate gate; local checks do not imply repository-wide security readiness.

The Creative & Advertising Agency layer remains after core platform acceptance. ChatGPT app connections and credentials are not imported by this code. MIT license.
