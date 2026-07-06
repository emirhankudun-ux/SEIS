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
| Claude Code CLI | Manual/auth-gated | Architecture and refactor review | `claude 2.1.195` installed at `~/.local/bin/claude`; a 2026-07-03 local snapshot recorded `loggedIn true`, sanitized `CLAUDE_OK`, official `claude-plugins-official` marketplace setup, 16 project-local plugins, and `seis-local` MCP; on 2026-07-06 `npm run check:ai-stack` marked Claude `not-ready` because the current runtime auth check failed | Uses local Claude Code auth; re-auth is required before review use. Project `.mcp.json` `seis` still waits for human trust approval. |
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
- Claude and Hermes are bounded helper or review routes only when current local
  auth/config checks pass, not autonomous writers.
- Gemini, Kimi, OpenAI, Aider, Goose, Cursor, and LM Studio are connected
  through SEIS as bounded helper or review routes, not autonomous writers.
- Hermes receives only sanitized context through local user configuration.
- No tool receives provider keys, SSH private keys, tokens, private Obsidian
  notes, real host credentials, or personal sensitive data.
- API keys, desktop app state, local model caches, provider sessions, and chat
  logs stay outside the repository.
- Secondary tool output is candidate evidence until Codex verifies it against
  repository state.

## Claude Code Local Activation

On 2026-07-03, Claude Code was refreshed from the official
[`anthropics/claude-code`](https://github.com/anthropics/claude-code) direction
without storing credentials in SEIS. The official `claude-plugins-official`
marketplace was configured in local user settings, and these project-local
plugins were enabled in that snapshot:

This is historical local-tool evidence, not current live authorization. On
2026-07-06, `npm run check:ai-stack` reported Claude as `not-ready` because the
runtime auth check failed. Re-run the checker and re-authenticate locally before
using Claude as a bounded reviewer.

| Area | Enabled plugins | Boundary |
| --- | --- | --- |
| Setup and repo instructions | `claude-code-setup`, `claude-md-management` | Read/recommend only unless a human hands off writer role. |
| MCP, plugin, and skill authoring | `mcp-server-dev`, `plugin-dev`, `skill-creator` | Scaffold proposals must be reviewed by Codex and validated before entering the repo. |
| Review and governance | `code-review`, `pr-review-toolkit`, `security-guidance`, `commit-commands`, `session-report`, `feature-dev` | Review output is candidate evidence; no push, merge, or release action is implied. |
| Design and platform code intelligence | `frontend-design`, `swift-lsp`, `typescript-lsp` | `sourcekit-lsp` is available; `typescript-language-server 5.3.0` and `tsc 6.0.3` are available after local global tool install. |
| MCP helpers | `context7`, `playwright` | Useful for docs lookup and browser QA; both remain bounded local Claude Code plugins and must not receive secrets. |
| Creative and design companies | `adobe-for-creativity`, `canva`, `figma` | Enabled locally; account-backed MCP actions require the human owner's OAuth/auth approval outside the repo. |
| Collaboration and knowledge companies | `airtable`, `asana`, `atlassian`, `linear`, `notion`, `slack`, `zapier` | Enabled locally; workspace data access stays auth-gated and is not a public-repo capability. |
| Developer platforms | `github`, `gitlab`, `vercel`, `cloudflare`, `firebase`, `supabase`, `appwrite`, `base44`, `shopify` | Enabled locally; live repo, deploy, database, or store mutations require explicit account connection and review. |
| Cloud and infrastructure | `aws-core`, `aws-serverless`, `aws-agents`, `aws-agents-for-devsecops`, `aws-amplify`, `aws-dev-toolkit`, `azure`, `azure-cosmos-db-assistant`, `terraform` | Enabled locally; cloud credentials and write scopes are not stored in SEIS. |
| Data, API, payments, and observability | `apollo-skills`, `mongodb`, `prisma`, `posthog`, `stripe`, `twilio-developer-kit`, `sentry` | Enabled locally; production data, payment, analytics, and incident access remain auth-gated. |
| Identity and enterprise auth | `auth0`, `workos` | Enabled locally for implementation guidance; tenant access and secrets remain outside the repository. |

Claude MCP state is intentionally split:

- `seis-local` is connected through private local Claude config for this
  project and runs `node packages/seis-ai/bin/seis-mcp.mjs`.
- The shared project `.mcp.json` server named `seis` remains `Pending approval`
  until the human owner trusts the workspace in Claude Code.
- The 2026-07-03 `claude plugin list` snapshot verified 53 local plugins were
  visible and `enabled`.
- The 2026-07-03 `claude mcp list` snapshot verified connected MCP routes for
  Playwright, AWS knowledge,
  Firebase, Terraform, Twilio docs, Apollo GraphOS, Appwrite docs, Cloudflare
  docs, Prisma local, and `seis-local`.
- Adobe, Airtable, Asana, Atlassian, GitLab, Linear, Notion, PostHog, Sentry,
  Slack, Stripe, Supabase, Vercel, Zapier, Canva, Cloudflare account routes,
  Figma, and Prisma remote are enabled but require authentication before live use.
- Context7, several AWS package-runner routes, Azure, GitHub Copilot MCP,
  MongoDB, Shopify MCP, and Appwrite API did not connect in this check and stay
  blocked until local dependencies, auth, and command permissions are reviewed.

Enabled plugins are local Claude Code visibility, not proof of live account
authorization. Token-backed MCP plugins require explicit secret-scope review
outside the public repository before any live workspace, cloud, deploy, payment,
database, or messaging action is treated as ready.

## Public Readiness

This registry strengthens GitHub readiness by making tool status explicit:
available local tooling is separate from live AI, live SSH, deployment,
provider authentication, or production readiness.

The current bridge is intentionally metadata-first: it lets SEIS expose routes,
roles, and safety boundaries without claiming live AI, background autonomy,
provider credential validation, or local model readiness.
