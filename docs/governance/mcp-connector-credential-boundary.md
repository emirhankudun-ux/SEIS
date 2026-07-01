---
type: governance
module: mcp-connectors
status: active-public-safe
priority: critical
visibility: public
owner: SEIS
---

# MCP Connector Credential Boundary

SEIS may document MCP servers, connector lanes, and task-specific helper tools,
but real connector credentials stay outside the repository. This boundary covers
Stitch-style MCP servers, Google API-key headers, model-provider connectors,
design tooling connectors, and future local or cloud MCP endpoints.

## Public-Safe Rule

Tracked files may include connector names, public documentation links, demo
metadata, and placeholder environment variable names. Tracked files must not
include API keys, OAuth tokens, private headers, session cookies, SSH keys, real
host credentials, private Obsidian note bodies, or local desktop credential
caches.

## Local-Only Placement

Use local-only config files for real connector auth:

- `.env.local`
- `.seis-secrets/`
- `mcp.local.toml`
- `.mcp.local.toml`
- `.codex/mcp.local.toml`
- `.codex/environments/*.local.toml`

These paths are ignored and must not become source-controlled setup examples.
Public examples should use placeholders only.

## Current Codex MCP Connector Set

The user-local Codex config may include MCP entries that are intentionally not
stored in this repository. As of this boundary pass, the public-safe intended
set is:

| MCP server | Status | Credential boundary |
| --- | --- | --- |
| `seis` | Enabled local stdio server | No provider key; runs the repo MCP server from the local workspace. |
| `github` | Enabled remote HTTP server | Auth or account approval happens outside the repo. |
| `figma` | Enabled remote HTTP server | Auth or account approval happens outside the repo. |
| `stripe` | Enabled remote HTTP server | Auth or account approval happens outside the repo. |
| `stitch` | Enabled remote HTTP server | API key must come from local `STITCH_API_KEY`; never inline the key. |
| `azure` | Configured but disabled | Enable only after local runtime and Azure auth are reviewed. |

Remote entries can appear in `codex mcp list` before account login is complete.
Do not claim account-level access, live mutation, or production integration
until the relevant auth flow and a scoped tool smoke test pass.

## Apple-First Boundary

Apple-native SEIS work may model connector availability, provider metadata, and
human approval states in Swift. It must not embed real connector credentials in
Swift Package sources, tests, plist templates, screenshots, generated fixtures,
or Xcode project settings. Native live connector work remains blocked until a
backend or local credential store is intentionally designed and verified.

## SEIS Brain Boundary

SEIS Brain and Obsidian-compatible notes may record sanitized connector
decisions, public-safe runbooks, allowed actions, forbidden actions, and
verification commands. They must not contain real API keys, copied private
prompt payloads, credential-bearing request headers, private vault exports, or
assistant transcripts that include secrets.

## SEIS-SSH Boundary

SEIS-SSH may describe sample MCP-assisted remote workflows, but connector
credentials must never be copied to remote shell history, SSH config, deployment
logs, bootstrap scripts, or public readiness reports. Live remote connector
setup requires explicit human approval, local-only storage, and a path-only
security review.

## If A Credential Is Exposed

1. Do not commit, paste, summarize, or reprint the value.
2. Remove it from any local tracked file before staging.
3. Rotate or revoke the credential in the provider console if it may be live.
4. Record only the affected path and credential category in public notes.
5. Run the relevant public-readiness and security checks before opening a PR.

## Verification

Use targeted checks before claiming this boundary is clean:

```bash
git status --short
git diff --check
rg -l "X-Goog-Api-Key|BEGIN OPENSSH PRIVATE KEY|BEGIN RSA PRIVATE KEY|github_pat_|ghp_|sk-|OPENAI_API_KEY=.+|ANTHROPIC_API_KEY=.+|GEMINI_API_KEY=.+" . -g '!node_modules/**' -g '!dist/**' -g '!build/**' -g '!.git/**'
npm run check:foundation
npm run check:seis-ssh-access-model
npm run check:seis-second-brain
```

Secret scans should report only path and category when a real finding appears.
Do not print the secret value into terminal logs, screenshots, public docs, or
agent reports.
