# SEIS Open Source Platform Architecture

Compatibility note: this file keeps its historical path so older references and
checks stay stable, but the active SEIS governance model is open source,
main-centered, and GitHub-visible.

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
| Governance | open-source policy, migration gates, repo sync | GitHub, SEIS-Agent |

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

## Open Source Governance Constraints

- Keep public-facing source under the repository's open-source governance policy.
- Do not assume source repository deletion means content is safely imported.
- Do not commit large binary archives directly.
- Keep `main` as the canonical GitHub branch.
- Keep Drive/Calendar links in `integrations/google-workspace.json`.
