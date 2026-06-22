# Runtime Activation Playbook

This project treats runtime activation as a status model, not as automatic external service execution.

## Status Meanings

- `active`: local capability works without credentials.
- `configured`: required environment variables are present.
- `needs_credentials`: the capability is modeled but cannot call the external service yet.
- `unavailable`: the capability is intentionally blocked or missing platform setup.
- `skipped_with_reason`: the capability was discovered but not invoked because it is write-capable, account-scoped, archive-only, or missing safe run context.

## Activation Steps

1. Add required environment variables in the deployment platform or local shell.
2. Re-run `npm run check:runtime`.
3. Open `/ops` and confirm the status moved from `needs_credentials` to `configured`.
4. Add a focused integration test before making any credentialed call from user-facing flows.

## MCP Readiness

- Refresh the live MCP snapshot with `npm run collect:mcp-readiness`.
- The script reads `codex mcp list`, compares it with the infra-v1 MCP catalog, and writes `packages/runtime/src/mcp-readiness.generated.json`.
- The script is intentionally read-only. It does not call connector tools, deploy, send messages, move money, mutate remote systems, or write outside the readiness snapshot.

## Deployment Readiness

- Check `/api/deployment-targets` before any publish attempt.
- `github-origin`, `vercel-preview`, and `custom-server` stay `needs_credentials` until their auth or environment values exist.
- Run `npm run github:preflight` before pushing the active Codex branch to GitHub.
- Run `npm run github:publish` only after preflight passes; it performs one non-interactive push attempt.
- Server upload commands are documented but not run automatically; they need a concrete target and separate confirmation.
- The static fallback stays available as a low-dependency rollback path.

## Guardrails

- Never commit tokens, keys, encrypted credentials, or generated service exports.
- Do not call external connectors from render-only portfolio sections.
- Keep failures visible as status cards instead of crashing pages.
- Treat write/deploy/message/payment connectors as explicit-approval work, not automatic portfolio runtime behavior.
