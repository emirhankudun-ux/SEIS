# MARIA × SEIS — 4.0.0-alpha.9

A premium web simulation plus narrowly scoped **real local host verification** for MCP and execution recovery. This is an engineering alpha, not a finished desktop operator. The SEIS Apple-first / Swift-first direction is unchanged; the Node host remains an integration reference rather than the final native architecture.

## Run the verified local checks

Use Node.js 22 or newer. No npm installation, model download, account or API key is required.

```sh
npm test
npm run mcp:check
npm run recovery:check
```

`mcp:check` launches the included read-only MCP server over OS pipes, authorizes only `package.inspect`, independently checks this package's `package.json` bytes and SHA-256, then reaps the child process.

`recovery:check` launches a separate process that durably records a live run as `running` and exits before terminal completion. A new journal instance then detects the interrupted run, keeps `resumeAllowed: false`, records an explicit reconciliation result, reloads the journal and verifies that no interrupted run remains. The check never replays or resumes the interrupted action automatically.

These are real subprocess and filesystem checks, not injected transport responses. They do not validate a third-party MCP server, real LM Studio/Ollama inference, macOS automation, Unreal, Blender or deployment.

## Alpha.9 recovery and audit hardening

- Persistent execution journal contract with redact-before-write behavior.
- Atomic file-backed host store with bounded size and existing-target symlink refusal.
- Corrupt audit history fails closed instead of silently resetting.
- Journal start and terminal completion are a lifecycle: successful completion replaces the in-progress marker; an interrupted process leaves a recoverable `running` marker.
- Live execution refuses to start when its audit-start record cannot be persisted.
- If a live result is externally verified but the terminal audit commit fails, the orchestrator downgrades the public status to `unverified` and requires reconciliation rather than claiming clean completion.
- Recovery scanning never auto-resumes side effects; candidates are marked `resumeAllowed: false`.
- The existing MCP authorization, protocol negotiation, receipt identity and simulation/live separation remain intact.

## Preview the interface

```sh
npm run dev
```

The Python 3 development server binds to `http://127.0.0.1:4173`. The browser remains simulation-first and is not connected to the host recovery or MCP acceptance commands.

## Verification boundaries

Local verification for alpha.9 covers the Node suite, the real read-only MCP subprocess path, the real crash-marker/reload/reconciliation path, and the existing offline Chromium acceptance suite. HTTP browser navigation remains subject to the execution environment policy and is not claimed as verified when blocked.

A persistent journal is an audit/recovery primitive, not a full resumable workflow engine. Automatic side-effect replay is intentionally absent. Real local-model inference, third-party MCP interoperability, native Apple permissions, durable user memory, voice, vision, computer control, Unreal/Blender adapters and production deployment remain separate gates.

See [alpha.9 recovery verification](docs/ALPHA9-RECOVERY-JOURNAL.md), [alpha.8 MCP verification](docs/ALPHA8-MCP-STDIO.md), [architecture](ARCHITECTURE.md), [security](SECURITY.md) and [roadmap](docs/ROADMAP.md).

The Creative & Advertising Agency layer remains gated behind the core platform acceptance criteria. MIT license.
