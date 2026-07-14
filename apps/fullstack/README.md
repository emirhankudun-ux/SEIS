# Full-stack Lane

The full-stack lane coordinates frontend product surfaces, backend/API
contracts, auth, durable storage, deployment, and live product state. The
current runnable SEIS demo remains Local Demo first and requires zero provider
keys.

## Initial Direction

The first backend step is not a framework migration. SEIS now starts with a
no-new-dependencies `node:http` contract:

- `content/development/seis-fullstack-contract.json`
- `server/node/static-server.mjs`
- `docs/architecture/seis-full-stack-transition.md`
- `npm run check:seis-fullstack-contract`
- `npm run check:seis-fullstack-server-smoke`
- `npm run check:seis-fullstack-no-server-fallback-smoke`

This contract exposes read-only Local Demo data for session, capabilities,
projects, app installs, provider status, audit logs, and dry-run agent tasks.
Provider credentials remain backend-only. The provider preflight may inspect
presence and shape metadata on the server, but never returns values,
authenticates credentials, calls providers, or stores secrets in browser
storage. SEIS Code requests this preflight only when the user opens provider
status and keeps a Local Demo fallback when the route is unavailable.

Convex can still be the preferred later backend for reactive state. Supabase can
be added later for Postgres-heavy data, SQL reporting, storage, or auth
requirements. Both require explicit approval, dependency review, and validation
that the static Local Demo still works without keys.

## Convex Setup Notes

For a Next.js App Router app:

```bash
npm install convex
npx convex dev --once
npx convex ai-files install
```

Add a client provider in the app shell and ensure `NEXT_PUBLIC_CONVEX_URL` is available before the web server starts.

## Plugin Stack

- Convex
- Supabase
- Vercel
- Build Web Apps
- GitHub
- SEIS plugin

## First Build Tasks

1. Keep `npm run check:seis-fullstack-contract` passing.
2. Keep the server smoke for the read-only `/_server/*` endpoints passing.
3. Keep the no-server fallback smoke passing so Desktop and Website still run
   when `/_server/*` is unavailable.
4. Define auth provider and JWT strategy after approval.
5. Decide Convex-first or Supabase-first only after the contract validator,
   provider secret boundary, and Local Demo fallback are stable.
6. Add repo visibility and migration status models.
7. Add Drive/Calendar integration metadata only after connector approval.

## Approval Gates

Approval is required for:

- New backend dependencies.
- Live AI provider calls.
- External databases.
- Auth providers.
- Deployment.
- SSH execution.
- Real credential handling.
