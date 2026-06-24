# SEIS Full-Stack Transition

Date: 2026-06-24

## Purpose

SEIS full-stack work means the complete product path: browser operating-system
surfaces, a server/API boundary, durable data contracts, provider status,
agent-task records, audit logs, and security gates that keep the demo usable
without API keys.

This is not a migration away from the current static demo. The static demo stays
the golden acceptance surface while SEIS adds backend capability in small,
validated slices.

## Current State

Working now:

- SEIS Desktop OS and SEIS Linux Replica frontend shells.
- Browser-local VFS, locale, theme, window, and demo app state.
- Local Demo AI, Sub-Agent Control, provider-status fixtures, and dry-run agent
  evidence.
- Existing `node:http` static server with read-only `/_server/*` JSON routes.
- `content/development/seis-fullstack-contract.json` as the first full-stack
  API/data/session contract.

Still mock, planned, or disabled:

- Authentication.
- External database.
- Live AI provider routing.
- SSH execution.
- Deployment.
- Cloud sync.
- Background autonomous agent execution.

## Contract Routes

The first server/API slice is read-only and fixture-backed:

| Route | Purpose | Mode |
| --- | --- | --- |
| `/_server/session` | Anonymous Local Demo session and capability summary. | read-only |
| `/_server/capabilities` | Frontend/backend/AI/cloud/SSH/deployment capability states. | read-only |
| `/_server/projects` | Demo project/workspace records. | read-only |
| `/_server/app-installs` | Store install/update/enable state records. | read-only |
| `/_server/provider-status` | Provider status rows without credential values. | read-only |
| `/_server/audit-log` | Redacted Local Demo audit events. | read-only |
| `/_server/agent-tasks` | Dry-run agent task records and approval gates. | read-only |
| `/_server/fullstack-contract` | Complete contract payload for validation. | read-only |

These routes are implemented by `server/node/static-server.mjs` and validated by
`npm run check:seis-fullstack-contract`. Runtime endpoint behavior is verified
by `npm run check:seis-fullstack-server-smoke`, which starts the local
`node:http` server, fetches every `/_server/*` route, and then shuts it down.
The static fallback path is verified by
`npm run check:seis-fullstack-no-server-fallback-smoke`, which starts a
static-only server that deliberately returns 404 for `/_server/*` and then
browser-smokes Desktop and the Website hub.

## Security Boundary

Backend-only means provider credentials may only be read by an approved server
runtime in a later implementation. The current contract does not read provider
credentials, does not call providers, and does not serialize secrets.

Forbidden in browser storage:

- API keys.
- Tokens.
- Passwords.
- SSH private keys.
- Service accounts.
- Provider credentials.
- Private host fingerprints.

Allowed in browser storage:

- Locale preference.
- Theme preference.
- Browser-local VFS demo files.
- Window/session geometry.
- Local Demo app install toggles.

## Provider Policy

Provider states must remain explicit:

- `Available`
- `Missing Key`
- `Disabled`
- `Rate Limited`
- `Error`

`Missing Key` is not an error. SEIS must not silently switch to a cloud provider.
Local-only mode must not route to a cloud provider. Live provider use requires
backend-only env validation, a provider health check, redacted audit logging, and
human approval before any public readiness claim.

## Agent Policy

Agent task records are dry-run fixtures until a later runtime promotion. Agents
must define allowed actions, forbidden actions, approval requirements, and
validation. They cannot access secrets, run forever, expand their permissions,
deploy, SSH, push, merge, or approve destructive actions themselves.

## Next Implementation Order

1. Keep `npm run check:seis-fullstack-contract` passing.
2. Keep `npm run check:seis-fullstack-server-smoke` passing for every
   read-only `/_server/*` route.
3. Keep `npm run check:seis-fullstack-no-server-fallback-smoke` passing so the
   product remains usable without the API server.
4. Add database/auth only after approval and after the static demo still passes.
5. Add backend-only provider health checks only after the secret boundary is
   validated and the user approves live provider calls.

## Validation

Run:

```bash
npm run check:seis-fullstack-contract
npm run check:seis-fullstack-server-smoke
npm run check:seis-fullstack-no-server-fallback-smoke
npm run check:data-schema-registry
npm run check:seis-ultimate-demo
git diff --check
```

Do not claim production full-stack readiness until auth, database, live-provider
gates, deployment gates, security review, and browser smoke coverage exist.
