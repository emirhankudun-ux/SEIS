# Error Tracking Reference Note

Date: 2026-08-26
Decision link: `docs/decisions/error-tracking-decision-record.md`

## Question

Which runtime error-tracking service should the eventual deployed SEIS
surface (web cockpit + Convex backend) use, given the security quality
gate's `deployment` condition: "Runtime error tracking is chosen and
configured"?

## Sources Consulted

- `docs/platform/openai-curated-build-workbench.md` — names the security
  lane's plugin route as "Codex Security, Sentry, Datadog, CodeRabbit, Jam",
  so the realistic candidates are Sentry and Datadog (Codex Security and
  CodeRabbit are static/CI analysis, not runtime error tracking; Jam is
  bug-report capture, not a monitoring backend).
- `docs/security/security-quality-gate.md` — the gate this note unblocks;
  confirms the condition is "chosen and configured", i.e. two separate
  milestones.
- `docs/decisions/backend-state-decision-record.md` and
  `docs/decisions/auth-jwt-decision-record.md` — both establish the pattern
  this note follows: decide the shape now, defer package installation until
  the Convex backend and deployed surface actually exist.
- `docs/decisions/framework-decision-record.md` — "Dependency Budget: no new
  runtime framework dependency [or SDK] without written approval." A
  monitoring SDK falls under this budget the same way the auth SDK did.
- `apps/web/app.js` `fallbackCapabilities` — already lists "Cloud hosting and
  deployment" as `activationMode: "blocked-until-target"`, confirming no
  deploy target (Vercel/Netlify/Cloudflare) is chosen yet. Error tracking
  should not be wired to a specific hosting platform's integration before
  that target is picked.

## Comparison

| | Sentry | Datadog |
| --- | --- | --- |
| Scope | Error/exception tracking, session replay, performance traces. Purpose-built for this gate's need. | Full observability platform (logs, metrics, traces, RUM, errors) — much broader than "runtime error tracking". |
| Fit for a single-owner, pre-revenue cockpit | Free tier covers low-volume error tracking; minimal setup. | Free tier is limited and the platform is sized for teams with existing logs/metrics infrastructure SEIS doesn't have yet. |
| Convex + static-web fit | Official JS SDK works from both a Convex function and a browser bundle with no server framework assumption. | Also has a browser/RUM SDK, but the value proposition (unified logs+metrics+traces) doesn't apply until SEIS has services worth correlating. |
| Dependency weight | One focused SDK. | Heavier: typically pulls in a broader agent/SDK surface even when only using the error-tracking slice. |

## Conclusion

**Sentry**, matching what the workbench security row already named. It is
the narrowest fit for the gate's literal requirement (runtime error
tracking) without adopting a full observability platform SEIS doesn't yet
have the surface area to justify. This matches the same
narrowest-sufficient-tool reasoning as the Convex Auth / GitHub OAuth choice
in the auth-jwt note.

## Open Follow-ups

- SDK installation and DSN configuration are deferred until the Convex
  backend is provisioned and a deploy target is chosen (same trigger as
  auth provisioning and the `deployment` gate's own conditions).
- Revisit Datadog only if SEIS later needs correlated logs/metrics/traces
  across multiple deployed services — not justified by a single cockpit.
