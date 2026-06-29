# Big Tech MCP And Skill Inventory

Date: 2026-06-29

This record tracks the current SEIS operating posture for Google ecosystem and
major technology platform MCP tools, Codex skills, plugins, and connectors. It
does not claim live cloud access, provider credentials, production deployment,
SSH access, or ownership of external systems.

## Current Result

The 2026-06-29 install pass installed 38 curated Codex skills into the local
Codex skills directory:

- `aspnet-core`
- `chatgpt-apps`
- `cli-creator`
- `cloudflare-deploy`
- `define-goal`
- `figma`
- `figma-code-connect-components`
- `figma-create-design-system-rules`
- `figma-create-new-file`
- `figma-generate-design`
- `figma-generate-library`
- `figma-implement-design`
- `figma-use`
- `gh-address-comments`
- `gh-fix-ci`
- `jupyter-notebook`
- `linear`
- `migrate-to-codex`
- `netlify-deploy`
- `notion-knowledge-capture`
- `notion-meeting-intelligence`
- `notion-research-documentation`
- `notion-spec-to-implementation`
- `openai-docs`
- `pdf`
- `playwright`
- `playwright-interactive`
- `render-deploy`
- `screenshot`
- `security-best-practices`
- `security-ownership-map`
- `security-threat-model`
- `sentry`
- `speech`
- `transcribe`
- `vercel-deploy`
- `winui-app`
- `yeet`

The only curated skill left uninstalled is `hatch-pet`; it is not related to
the requested Google, Kimi, Claude, Apple, Windows, or major technology platform
integration scope.

Restart Codex to pick up new skills.

The same pass also verified and configured the named AI/developer tools that
the user explicitly requested:

- Kimi Code CLI: official `@moonshot-ai/kimi-code` package installed and
  verified with `kimi --version` returning `0.20.2`.
- Claude Code CLI: pre-existing local CLI verified with `claude --version`
  returning `2.1.177`; current npm metadata observed `2.1.195`.
- Apple/XcodeBuildMCP: `npx -y xcodebuildmcp --version` returned `2.6.2`;
  XcodeBuildMCP is registered in both `.mcp.json` and `.kimi-code/mcp.json`.
- Kimi project Skill: `.kimi-code/skills/seis-integration-guardian/SKILL.md`
  is installed as a secrets-free SEIS project Skill.

Kimi provider setup remains intentionally empty: `kimi provider list` returned
`No providers configured.` OAuth, Kimi API-key setup, and official Kimi
Datasource plugin installation are user-owned steps.

## Google Coverage

| Surface | Current status | Notes |
| --- | --- | --- |
| Gmail | Callable MCP plus existing Gmail skill | Use only for bounded search/read/draft/send/archive/trash/label work when the user explicitly asks. |
| Google Calendar | Callable MCP plus existing Calendar skill | Calendar writes require explicit target event and user intent. |
| Google Drive | Callable MCP plus existing Drive skill | Drive writes require exact file/folder/audience and user intent. |
| Google Docs | Covered through Google Drive MCP and skill | Native Docs reads/edits are available through Drive-backed tooling. |
| Google Sheets | Covered through Google Drive MCP and skill | Native Sheets reads/edits are available through Drive-backed tooling. |
| Google Slides | Covered through Google Drive MCP and skill | Native Slides reads/edits are available through Drive-backed tooling. |
| Google Meet | Indirect through Calendar | Calendar event creation can request a Meet link; no standalone Meet MCP was verified. |
| Gemini | Not configured as standalone MCP or curated skill in this pass | Keep planned until a specific callable connector or approved setup path exists. |
| BigQuery | Connector install candidate found; install requested but not user-confirmed | Requires user approval of the connector install/auth flow before it becomes callable. |
| Google Cloud / Firebase / Vertex AI | Not configured as standalone MCP or curated skill in this pass | Treat as planned and approval-gated. |
| YouTube / Google Ads / Chat / Tasks / Keep / Forms | Not configured in current MCP discovery | Treat as planned or disabled until specific connectors are installed and verified. |

## Kimi And Claude Coverage

| Surface | Current status | Notes |
| --- | --- | --- |
| Claude / Anthropic | `Claude.app` and Claude Code CLI are installed locally. Claude Code sees the project `seis` and `xcodebuildmcp` MCP servers as pending approval. | User must run `claude` and approve project MCP servers before Claude Code connects them. No standalone Codex Anthropic connector was found. |
| Kimi / Moonshot AI | Official Kimi Code CLI is installed and path verified. SEIS also has `.kimi-code/mcp.json` and a Kimi project Skill. | No Kimi provider is configured. Kimi OAuth/API-key setup and official Kimi Datasource plugin installation remain explicit user actions. |

## Apple Coverage

| Surface | Current status | Notes |
| --- | --- | --- |
| Xcode | `Xcode.app` is installed under `/Applications`. | Apple platform work should prefer XcodeBuildMCP where available. |
| XcodeBuildMCP | Callable for enabled iOS simulator workflows, runnable with `npx -y xcodebuildmcp`, and registered in Claude/Kimi project MCP configs. | Claude Code lists it as pending approval. Device, macOS, debugging, and UI automation capabilities may require separate XcodeBuildMCP configuration. |
| Build iOS / macOS skills | Available from installed plugin skill surfaces. | Follow the relevant skill and XcodeBuildMCP session-default rules before build/run/test actions. |

## Windows And Microsoft Coverage

| Surface | Current status | Notes |
| --- | --- | --- |
| Windows / WinUI | `winui-app` skill installed. | Windows app work remains source-level unless a target runtime is explicitly configured. |
| ASP.NET Core / .NET | `aspnet-core` skill installed. | Server/app work remains repo-local unless deployment is approved. |
| Azure | Local Azure skills are present under the agent skill tree. | Cloud actions require target subscription/project, credential boundary, cost review, and approval. |
| Outlook Calendar / Outlook Email | Installable plugin candidates were visible in the plugin catalog and related skills are available in the session context. | Connector installation and mailbox writes require user approval. |
| Teams / SharePoint | Installable plugin candidates were visible in the plugin catalog and related skills are available in the session context. | Connector installation and workspace mutations require user approval. |

## Major Platform Coverage

| Platform | Current status |
| --- | --- |
| OpenAI | OpenAI Platform MCP is callable for secure API key setup flows; `openai-docs` and `chatgpt-apps` skills are installed. |
| Moonshot AI / Kimi | Official Kimi Code CLI is installed; project-local MCP and Skill config is present; provider/login/plugin setup remains approval-gated. |
| Anthropic / Claude | Claude Desktop and Claude Code CLI are installed; project MCP servers are pending user approval inside Claude Code. |
| GitHub | GitHub MCP is callable; `gh-address-comments` and `gh-fix-ci` skills are installed. |
| Figma | Figma MCP is callable; seven Figma skills are installed. |
| Cloudflare | Cloudflare MCP is callable; `cloudflare-deploy` skill is installed. |
| Vercel | Vercel MCP is callable; `vercel-deploy` skill is installed. |
| Netlify | `netlify-deploy` skill is installed; live deploy remains approval-gated. |
| Render | `render-deploy` skill is installed; live deploy remains approval-gated. |
| Linear | `linear` skill is installed; Linear tool use remains explicit-intent gated. |
| Sentry | `sentry` skill is installed; project mutations remain explicit-intent gated. |
| Microsoft ecosystem | `aspnet-core` and `winui-app` skills are installed; Teams, SharePoint, and Outlook remain connector/skill surfaces only when explicitly selected. |
| Supabase | Supabase MCP is callable; destructive project/database operations require approval. |
| Shopify | Shopify MCP discovery surfaced GraphQL validation; store mutations require explicit approval. |
| Slack | Slack MCP discovery surfaced file/message access; sending or channel changes require explicit approval. |
| Notion | Notion MCP is callable; workspace writes require explicit target and approval. |
| Asana | Asana MCP discovery surfaced team/task planning tools; mutations require explicit approval. |
| Clay | Clay MCP is callable; credit-costing enrichments require explicit user request. |
| Vantage | Vantage MCP discovery surfaced cost alert/reporting tools; alert or budget writes require explicit approval. |

## Rules

- Installed skills are local Codex capabilities, not project dependencies.
- Kimi CLI is a user-level tool installation; the repo stores only secrets-free
  Kimi project MCP and Skill config.
- Callable MCP surfaces are session capabilities, not production integration
  claims.
- Missing Key, Disabled, Planned, and Error states must stay distinct.
- No provider key, OAuth token, cookie, private key, service account, profile
  identity, or workspace private data may be stored in SEIS docs.
- Live cloud, deployment, billing, SSH, GitHub write, database, or provider
  mutation work requires explicit approval.

## Structured Record

Machine-readable details live in
`content/development/seis-big-tech-mcp-skill-inventory.json`.
