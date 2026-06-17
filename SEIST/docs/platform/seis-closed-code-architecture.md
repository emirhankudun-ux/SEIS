# SEIS CLOSED CODE Architecture

Date: 2026-06-05

## Repository Shape

```text
apps/
  android/
  web/
  macos/
  fullstack/
packages/
  core/
  ui/
  data/
data/
integrations/
plugins/seis/
roadmap/
docs/platform/
```

## Platform Lanes

| Lane | Role | Primary tooling |
|---|---|---|
| Android | mobile app shell, native validation, device workflows | Expo, Test Android Apps |
| Web | browser product surface, dashboards, marketing-free app UI | Build Web Apps, Browser |
| macOS | desktop shell, local tools, SwiftUI/AppKit direction | Build macOS Apps |
| Full-stack | backend, auth, APIs, realtime data | Convex, Supabase, Vercel |
| Data | inventory, metrics, imports, dashboards | Data Analytics, Google Drive |
| Governance | closed-code policy, migration gates, repo sync | GitHub, SEIS plugin |

## Backend Direction

Convex is the preferred first backend for reactive product state. Supabase can be used for Postgres-heavy workloads, SQL analytics, and auth/storage needs when a relational model is better.

Recommended first stack:

- Next.js App Router for web/full-stack shell
- Convex for realtime backend functions and state
- Expo for Android shell
- SwiftUI for macOS shell
- Data Analytics reports for zip/repo inventory
- Google Drive for planning docs and sheets
- Google Calendar for build cadence

## Closed Code Constraints

- Keep proprietary source under this repository's closed-code policy.
- Do not assume source repository deletion means content is safely imported.
- Do not commit large binary archives directly.
- Keep `main` mirrored to the canonical SEIS branch until the GitHub default branch is switched.
- Keep Drive/Calendar links in `integrations/google-workspace.json`.
