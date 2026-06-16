# Full-stack Lane

The full-stack lane coordinates backend, auth, deployment, and live product state.

## Initial Direction

Convex is the preferred first backend for reactive state. Supabase can be added for Postgres-heavy data, SQL reporting, storage, or auth requirements.

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

1. Decide backend ownership: Convex-first or Supabase-first.
2. Define auth provider and JWT strategy.
3. Add repo visibility and migration status models.
4. Add Drive/Calendar integration metadata.

## Capability-first Boundary

Full-stack work should begin as contracts before runtime expansion: database schema, API policy, auth boundaries, cloud cost, observability, rollback, and security gates. For this acceleration pass, do not add new JavaScript or Python application code; use SQL, YAML, TOML, CUE, Rego, OpenAPI, AsyncAPI, GraphQL, C#, Go, Rust, or platform-owned contracts when a non-Apple backend surface is needed.

## Market-readiness Focus

A full-stack SEIS surface is not market-ready until auth, data retention, privacy, backup, migration, incident response, rate limits, monitoring, support, and rollback are documented.
