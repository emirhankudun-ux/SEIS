# Installed AI Tools Registry

## Purpose

SEIS keeps a public-safe registry of local development tools and AI assistant
surfaces so agents can coordinate work without inventing availability,
credentials, or live integration status.

Machine-readable source:
`content/development/seis-installed-ai-tools-registry.json`.

Validation:

```bash
npm run check:seis-installed-ai-tools-registry
```

This registry does not store credentials, validate provider accounts, execute
SSH, push to GitHub, import a private Obsidian vault, or claim live model
access. It records only public-safe operating metadata.

## Current Registered Tools

This slice is the public-safe SEIS AI Tools Bridge: installed apps and CLIs are
visible to SEIS as routes, roles, and handoff boundaries before any live
provider use is claimed.

| Tool | Status | Default role | Evidence | Boundary |
| --- | --- | --- | --- | --- |
| Codex | Available | Primary writer and validator | Active supervised repo session | No push, merge, deploy, SSH, or secret handling without approval. |
| Xcode | Available | Apple-native IDE | Xcode 26.6 shows `packages/seis_platform_swift` as the recent package | Xcode presence is not build evidence; SwiftPM or Xcode build checks are still required. |
| Claude Code CLI | Available | Architecture and refactor review | `claude 2.1.195` installed at `~/.local/bin/claude`; local `claude auth status` reports `loggedIn true`; sanitized smoke returned `CLAUDE_OK` | Uses local Claude Code auth; review output is candidate evidence only. |
| Gemini CLI | Manual/auth-gated | Research and documentation validation | `gemini 0.49.0` installed at `~/.local/bin/gemini`; Google OAuth completes, then Gemini Code Assist for individuals reports the CLI client is no longer supported | Use Antigravity, supported Google/Vertex auth, or another approved route before claiming Gemini access. |
| Kimi Code CLI | Manual/login-gated | Moonshot/Kimi multilingual review | `kimi 0.20.2` installed at `~/.kimi-code/bin/kimi`; `kimi doctor` is valid, provider list is empty, and login reports membership benefits cannot be verified | Requires a valid Kimi/Moonshot membership or provider entitlement; no live Moonshot/Kimi model access is claimed yet. |
| Cursor | Available | Secondary IDE/review surface | Cursor 3.9.16 installed at `~/Applications/Cursor.app` with `cursor` CLI | Must not become a second writer without explicit handoff and `git status`. |
| LM Studio | Available | Local model lab | `~/Applications/LM Studio.app` and `lms` CLI are installed | Installation does not prove a model is downloaded, loaded, or safe for private data. |
| OpenAI CLI | Manual/auth-gated | Provider utility candidate | `openai 2.20.0` installed at `~/.local/bin/openai` | Requires external `OPENAI_API_KEY`; no key belongs in Git or frontend code. |
| Aider | Manual/auth-gated | Bounded patch helper | `aider 0.86.2` installed in an isolated user venv | Can modify files, so it is non-writer by default until a human-visible handoff. |
| Goose | Manual/auth-gated | Automation helper candidate | `goose 1.39.0` installed at `~/.local/bin/goose` | Configuration and provider auth stay outside the repo; dry-run first. |
| Hermes | Available | Secondary review and MCP gateway candidate | Hermes Agent v0.17.0 CLI is installed; local config uses the OpenAI Codex provider and sanitized smoke returned `HERMES_OK` | Nous Portal is still not logged in; Hermes stays non-writer and receives sanitized context only. |

## Handoff Rules

- Codex remains the only writer unless a human explicitly transfers writer role.
- Xcode may inspect or run the Swift package, but native readiness claims need
  command output or Xcode build evidence.
- Claude and Hermes are available through local user auth/config as bounded
  helper or review routes, not autonomous writers.
- Gemini, Kimi, OpenAI, Aider, Goose, Cursor, and LM Studio are connected
  through SEIS as bounded helper or review routes, not autonomous writers.
- Hermes receives only sanitized context through local user configuration.
- No tool receives provider keys, SSH private keys, tokens, private Obsidian
  notes, real host credentials, or personal sensitive data.
- API keys, desktop app state, local model caches, provider sessions, and chat
  logs stay outside the repository.
- Secondary tool output is candidate evidence until Codex verifies it against
  repository state.

## Public Readiness

This registry strengthens GitHub readiness by making tool status explicit:
available local tooling is separate from live AI, live SSH, deployment,
provider authentication, or production readiness.

The current bridge is intentionally metadata-first: it lets SEIS expose routes,
roles, and safety boundaries without claiming live AI, background autonomy,
provider credential validation, or local model readiness.
