# SEIS Official Vendor MCP Integration Candidates

## Status

Public-safe research manifest. No MCP in this document is installed, enabled, authenticated, or claimed live.

## Purpose

This document converts the owner request to use original big-company MCP plugins into a safe SEIS adoption lane. The first step is not blanket installation. The first step is an evidence-backed catalog of official or vendor-owned MCP surfaces, their risk class, and the activation proof required before SEIS can use them.

Source manifest:

```text
content/development/seis-official-vendor-mcp-integration-candidates.json
```

Direct checker:

```bash
node scripts/check-seis-official-vendor-mcp-integration-candidates.mjs
```

## Boundary

- This is documentation and governance evidence only.
- It does not store credentials.
- It does not call providers.
- It does not enable remote MCP servers.
- It does not authorize package runners.
- It does not mutate GitHub, cloud, databases, payment systems, docs tools, or workspaces.
- It keeps public demo mode no-key.

## Candidate Summary

| Candidate | Source posture | Priority | Default mode |
| --- | --- | --- | --- |
| GitHub MCP Server | Official GitHub repository | P0 | Document-only until owner approval |
| OpenAI MCP tools/connectors | Official OpenAI docs | P0 | Document-only until owner approval |
| Google Workspace MCP | Official Google docs | P1 | Document-only until owner approval |
| Cloudflare MCP servers | Official Cloudflare docs | P1 | Document-only until owner approval |
| Vercel MCP | Official Vercel docs | P1 | Document-only until owner approval |
| Sentry MCP | Official Sentry docs | P1 | Document-only until owner approval |
| Atlassian Rovo MCP | Official Atlassian docs/blog | P1 | Document-only until owner approval |
| Notion MCP | Official Notion docs | P1 | Document-only until owner approval |
| Supabase MCP | Official Supabase docs | P1 | Document-only until owner approval |
| Stripe MCP | Official Stripe docs | P2 | Sandbox-only approval-gated |
| Microsoft MCP family | Official Microsoft Learn docs | P2 | Document-only until product scope is selected |
| Linear MCP | No official server confirmed | P3 | Do not install |

## Official Source Links

- GitHub: https://github.com/github/github-mcp-server
- OpenAI: https://developers.openai.com/api/docs/mcp
- Google Workspace: https://developers.google.com/workspace/guides/configure-mcp-servers
- Cloudflare: https://developers.cloudflare.com/agents/model-context-protocol/
- Vercel: https://vercel.com/docs/mcp
- Sentry: https://docs.sentry.io/product/sentry-mcp/
- Atlassian: https://support.atlassian.com/atlassian-rovo-mcp-server/docs/use-atlassian-rovo-mcp-server/
- Notion: https://developers.notion.com/guides/mcp/overview
- Stripe: https://docs.stripe.com/mcp
- Supabase: https://supabase.com/docs/guides/ai-tools/mcp
- Microsoft: https://learn.microsoft.com/en-us/visualstudio/ide/mcp-servers?view=visualstudio

## Activation Requirements

Every vendor MCP requires a separate activation PR or owner-approved runbook with:

- explicit owner approval for that vendor,
- least-privilege tool and scope allowlist,
- credential isolation outside the public repository,
- read-only or sandbox proof before writes,
- rollback notes for mutation-capable tools,
- redacted logs that never print secret values,
- a clear demo/live boundary.

## SEIS Priority

P0 and P1 candidates are strategically useful, but still blocked from live use until proof exists. GitHub is the strongest first runtime candidate because SEIS uses GitHub as engineering memory. OpenAI is the strongest first architecture candidate because it informs connector and provider boundaries. Stripe is intentionally lower priority and sandbox-only because financial data and mutations are high-risk.

## Next Handoff

The next safe step is to pick one vendor, probably GitHub or OpenAI, and write a separate activation design that lists the exact tools, scopes, dry-run command, rollback plan, and redaction expectations. Do not install all candidates together.
