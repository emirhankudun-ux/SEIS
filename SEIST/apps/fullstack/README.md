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
