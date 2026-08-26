# Error Tracking Decision Record

Date: 2026-08-26

SEIS chooses Sentry for runtime error tracking on the eventual deployed
surface. This decides the *choice*; *configuration* (SDK install, DSN,
project creation) is deferred, so the `deployment` gate's error-tracking
condition stays only partially met — see Status below.

## Current Decision

Status: **choice decided; configuration not started.**

- Service: **Sentry**, per the workbench security row and the comparison in
  `docs/research/notes/2026-08-26-error-tracking-reference.md`.
- Scope at decision time: error/exception capture for the web cockpit
  (browser) and Convex backend functions once both exist. Session replay and
  performance tracing are available in the same product but not scoped in
  or out here — a follow-up when configuration happens.
- Not chosen: Datadog (broader observability platform than this gate needs)
  and any custom/self-hosted error-tracking build.

## Why This Shape

| Need | Choice | Reason |
| --- | --- | --- |
| Runtime error visibility before any real deploy | Sentry | Narrowest tool that satisfies the gate's literal requirement; free tier fits current single-owner, low-volume scale. |
| Dependency weight | Single focused SDK, not a platform | Matches the framework decision record's default-no-new-dependency posture until there's a concrete deploy to attach it to. |
| Timing | Decide now, configure at deploy time | Same pattern as `backend-state-decision-record.md` and `auth-jwt-decision-record.md`: a written decision can exist before the runtime it describes is provisioned. |

## Dependency Budget

No Sentry package is added yet. Per `framework-decision-record.md`'s
dependency-budget rule, the SDK is installed only once a deploy target is
chosen and the Convex backend is provisioned — the same trigger already
governing auth provisioning.

## Acceptance Criteria For Configuration

Configure Sentry (create project, add SDK, wire DSN via backend env — never
committed, per the secret-scan posture) when:

- A deploy target (Vercel, Netlify, or Cloudflare — still undecided, see
  `apps/web/app.js` `cloud-hosting-and-deployment` capability) is chosen.
- The Convex backend is provisioned per `backend-state-decision-record.md`.

Only after configuration is complete does this decision satisfy its half of
the `deployment` gate condition; the gate also separately requires a
rollback contract, which this record does not attempt to write — a rollback
contract for a surface with no chosen deploy target yet would be
speculative, not evidence-backed.

## Rollback Path

- This is a choice-only record; nothing runtime exists to roll back.
- If Sentry turns out to be a poor fit once configured, swapping the
  provider means removing one SDK and its init call — no data migration,
  since error events are not SEIS's source of truth for anything.
