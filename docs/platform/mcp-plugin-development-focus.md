# SEIS MCP And Plugin Development Focus

## Purpose

This document turns the "use all plugins and MCPs" direction into a safe SEIS
development operating model. It does not claim every plugin, connector, MCP
server, account, provider, or remote workspace is authenticated or live.

SEIS uses installed and callable tools first, records what was actually used,
and keeps every external write behind explicit intent, authorization, and
rollback notes.

## Source Of Truth

Use these records together:

- `docs/platform/plugin-stack.md`
- `docs/platform/installed-plugin-operating-model.md`
- `docs/platform/seis-agent-plugin-integration.md`
- `docs/platform/big-tech-mcp-skill-inventory.md`
- `content/development/seis-big-tech-mcp-skill-inventory.json`
- `content/development/seis-agent-plugin-integration.json`

The source of truth is the repository record plus the tools currently callable
in the active session. A plugin name in a prompt, marketplace, note, or old
memory is not enough to mark it active.

## Development Focus Lanes

| Lane | Use first | Safe SEIS output |
| --- | --- | --- |
| Repository and governance | GitHub, CodeRabbit, CircleCI, Codex Security, SEIS-Agent | PRs, review packets, CI fixes, governance docs, security-safe queues |
| Web demo and product UI | Build Web Apps, Browser, Chrome, Figma, Canva, Lovable, Replit, Base44 | Static demo polish, route checks, accessibility notes, design-system evidence |
| AI Core and agent runtime | OpenAI Developers, Hugging Face, NVIDIA, SEIS-Agent, local MCP resources | Provider metadata, model-router docs, prompt-engine contracts, no-key Local Demo state |
| Cloud, SSH, and deploy planning | Cloudflare, Vercel, Netlify, Render, Supabase, Convex, Neon, SEIS Cloud lane | Dry-run plans, readiness docs, backend-only secret rules, approval-gated deploy notes |
| Workspace and knowledge | Google Drive, Gmail, Calendar, Notion, Atlassian, Linear, Slack, Documents | Indexed plans, public-safe summaries, exact-target write gates, no private data copying |
| Media, design, and showcase | Figma, Canva, Cloudinary, Shutterstock, HeyGen, Fal, Game Studio | Licensed/provenance-aware creative references, original SEIS assets, demo-safe media plans |

## State Labels

Use these labels in docs, UI, and PRs:

- `callable`: available as a tool in the current session and used or usable now.
- `installed-recorded`: present in repository/plugin inventory but not proven
  callable in the current session.
- `planned`: desired future integration with no current callable proof.
- `approval-gated`: requires user auth, billing, credentials, SSH, deployment, or
  external write approval.
- `disabled`: intentionally unavailable for safety or scope reasons.
- `mock-safe`: local demo behavior only, clearly labeled and reversible.

Do not replace these labels with vague words such as "connected" unless the
connection was actually verified in the active context.

## Write Gates

External write actions need explicit target and intent before execution:

- GitHub: branch, commit, PR, reviewer, label, merge, release, or issue mutation.
- Google Workspace: exact Drive/Docs/Sheets/Calendar/Gmail target and action.
- Cloud/deploy: provider, project, environment, cost/billing posture, rollback.
- SSH: host alias, server/port preservation, command, expected output, rollback.
- AI providers: backend-only route, no browser secrets, configured key state, model.
- Media/design tools: source/license/provenance and export destination.

If approval is missing, record the task as approval-gated rather than silently
skipping it or faking readiness.

## No-Secret And No-Overclaim Rules

- Do not copy tokens, cookies, `.env` values, API keys, private SSH keys, service
  accounts, or private user data into repository docs.
- Do not claim live AI, live SSH, deployment, cloud sync, provider routing, or
  authenticated connector access unless it was verified.
- Do not store private provider keys in frontend state, browser storage, public
  fixtures, generated reports, prompts, or screenshots.
- Do not use connector inventory alone as proof of real authentication.
- Do not let plugin output overwrite SEIS identity, source assets, or existing
  working demo routes without review.

## PR Workflow

Every plugin/MCP-backed change should include:

1. The active tool or connector used.
2. Whether the action was read-only, local write, or external write.
3. The exact files changed.
4. Validation commands and honest results.
5. Mock/local/real/planned state labels.
6. Approval-gated actions that were deferred.
7. Rollback notes.

Keep one branch to one responsibility. Push through PRs and branch protection;
do not push directly to `main`, force push, or merge without the configured
review/auto-merge path.

## Recommended Checks

Use the smallest relevant check set first:

```bash
npm run check:seis-agent-plugin-integration
npm run check:plugin-capability-lanes
npm run check:plugin-environment-sources
npm run check:requested-plugin-trace
git diff --check
```

Use broader checks only when the change touches the corresponding surface.

## Current Boundary

This document improves operating discipline only. It does not install new
connectors, authenticate accounts, start servers, provision cloud resources,
open SSH, call model providers, deploy, publish, rotate secrets, or mark SEIS
public-ready.
