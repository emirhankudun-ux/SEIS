# Full Usage MCP Binding

Date: 2026-07-07

## Scope

This runbook binds MCP usage into the SEIS full-usage operating mode. The
default usable MCP surface is the repo-owned `seis` stdio server from
`.mcp.json`. External MCPs stay candidate, verified-task-scoped, or blocked
according to the MCP permission risk matrix.

## Active Local Binding

| Item | Value |
| --- | --- |
| MCP server | `seis` |
| Config | `.mcp.json` |
| Entrypoint | `packages/seis-ai/bin/seis-mcp.mjs` |
| Transport | stdio JSON-RPC |
| Resource | `seis://ai/full-usage-mcp-binding.json` |
| Counts | 35 tools, 33 resources, 3 prompts |

This binding is local and public-safe. It does not prove external MCP auth,
provider credentials, browser-session safety, SSH, deployment, billing,
GitHub mutation, or private-data access.

## Router Candidate Boundary

`9router` was reviewed as npm metadata only through `npm view 9router --json`.
It was not installed. The observed package declares a postinstall hook, installs
runtime dependencies into a user-home runtime directory, and presents a
CLI/server/proxy surface, so SEIS treats it as
`candidate-package-runner-not-installed` until explicit owner approval, tarball
or source review, no-credential execution conditions, and rollback notes exist.

The safe immediate route is Hermes Agent as the supervised router surface:
Hermes may receive one public-safe SEIS prompt at a time, with repo-only ledger
evidence, while the repo-owned `seis` MCP binding remains the first context and
verification surface.

## Use Order

1. Use repo-owned local MCP resources first.
2. Use repo-backed status and bounded check tools when their evidence is
   captured.
3. Render public-safe prompts only when useful.
4. Treat installed external MCPs as task-scoped only after identity,
   permission, auth boundary, and safe failure behavior are recorded.
5. Keep package-runner, credentialed provider, browser-auth, SSH/cloud/deploy,
   and external mutation MCPs blocked until explicit owner approval.

## Per-Use Ledger

Every future MCP-assisted task should record:

- repo id
- work item id
- MCP server id
- risk record id
- selected tool, prompt, or resource
- allowed mode
- permission class
- auth boundary
- whether secrets were requested
- whether external mutation was intended
- whether output was captured
- validator command
- fallback state
- next safe action

## Verification

```bash
node scripts/check-seis-full-usage-mcp-binding.mjs
node scripts/check-seis-mcp-permission-risk-matrix.mjs
node --test packages/seis-ai/test/mcp-smoke.test.mjs
npm run check:seis-full-usage-operating-mode
```

## Next Handoff

Use `seis://ai/full-usage-mcp-binding.json` as the first MCP context resource
before future MCP-assisted SEIS work. Keep Codex as the writer; MCPs provide
context, status, bounded checks, and public-safe prompts unless a separate
owner-approved handoff exists.
