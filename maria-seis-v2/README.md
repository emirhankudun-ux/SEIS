# MARIA × SEIS — 4.0.0-alpha.10

A premium web simulation plus narrowly scoped **real local host transport checks** for MCP, execution recovery, and OpenAI-compatible model plumbing. This is an engineering alpha, not a finished desktop operator. The SEIS Apple-first / Swift-first direction is unchanged; the Node host remains an integration reference rather than the final native architecture.

## Run the verified local checks

Use Node.js 22 or newer. No npm installation, model download, account or API key is required for the included checks.

```sh
npm test
npm run mcp:check
npm run recovery:check
npm run local-model:check
```

`mcp:check` launches the included read-only MCP server over OS pipes, authorizes only `package.inspect`, independently checks this package's `package.json` bytes and SHA-256, then reaps the child process.

`recovery:check` launches a separate process that durably records a live run as `running` and exits before terminal completion. A new journal instance detects the interrupted run, keeps `resumeAllowed: false`, records explicit reconciliation, reloads the journal, and verifies that no interrupted run remains. It never replays the interrupted action automatically.

`local-model:check` launches a loopback-only **OpenAI-compatible reference server** in a separate Node process, discovers its declared model, routes a real HTTP request through `LocalOpenAICompatibleAdapter → HostAdapterManager → LiveRuntimeAdapter → orchestrator → verifier`, checks exact provider/run/project/intent/model/receipt identity, verifies cancellation, and reaps the child process.

The reference server is deliberately **not an AI model**. This check proves the local HTTP/OpenAI-compatible transport contract and receipt attribution only. It does not prove LM Studio/Ollama availability, model intelligence, answer correctness, or production readiness.

## Alpha.10 verification-scope hardening

- Live verification now separates **transport verification** from **independently checked external outcomes**.
- `verifiedTransport` requires matching runtime/provider/run/project/intent identity, non-empty evidence, and an adapter-declared verified transport.
- `verifiedExternalAction` additionally requires `verificationScope: external-outcome` plus a host-verified outcome.
- Local model responses use `verificationScope: model-response-transport`, `transportVerified: true`, and `outcomeVerified: false`.
- The local OpenAI-compatible adapter rejects a completion whose returned `model` does not exactly match the configured model.
- MCP receipts use `tool-response-transport` unless a trusted host verifier independently validates the tool outcome, in which case the scope becomes `external-outcome`.
- Alpha.9 durable audit/recovery and alpha.8 MCP authorization/lifecycle boundaries remain intact.

## Preview the interface

```sh
npm run dev
```

The Python 3 development server binds to `http://127.0.0.1:4173`. The browser remains simulation-first and is not connected to the host acceptance commands.

## Verification boundaries

Local verification for alpha.10 covers the Node suite, the real read-only MCP subprocess path, the real crash-marker/reload/reconciliation path, the real loopback OpenAI-compatible reference transport, and the offline Chromium acceptance suite. A passing reference transport is not a claim that a real local model is installed or that its generated content is semantically correct.

Real LM Studio/Ollama inference, maintained third-party MCP interoperability, native Apple permissions, durable user memory, voice, vision, computer control, Unreal/Blender adapters and production deployment remain separate gates.

See [alpha.10 local-model transport verification](docs/ALPHA10-LOCAL-MODEL-TRANSPORT.md), [alpha.9 recovery verification](docs/ALPHA9-RECOVERY-JOURNAL.md), [alpha.8 MCP verification](docs/ALPHA8-MCP-STDIO.md), [architecture](ARCHITECTURE.md), [security](SECURITY.md) and [roadmap](docs/ROADMAP.md).

The Creative & Advertising Agency layer remains gated behind the core platform acceptance criteria. MIT license.
