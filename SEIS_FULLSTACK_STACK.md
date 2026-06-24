# SEIS Full-Stack Production Stack

Status: governance map of the real production-stack layers behind SEIS.

This document answers "what full-stack *actually* means" for SEIS. SEIS is **not**
a vibe-coded frontend or a single AI prompt — most production layers already exist
as governed, tested lanes. This map is enforced by
`scripts/check-seis-fullstack-stack.mjs` (`npm run check:seis-fullstack-stack`),
which fails if a `present`/`partial` layer loses its evidence on disk or a `target`
layer loses its contract section below.

## Layer map

| Layer | Status | Evidence in repo |
|-------|--------|------------------|
| Frontend | present | `apps/web/index.html` |
| Backend / APIs | partial | `polyglot/php/contact-endpoint.php` (reference endpoint) |
| Database & storage | present | `polyglot/sql/audit_ledger.sqlite.sql` |
| Auth & permissions | present | `packages/seis-ai/models/permission-policy-seed-v0.json` |
| Hosting & deployment | present | `scripts/build-static.mjs` |
| Cloud & compute | present | `scripts/provision-gcp-cloud-server.mjs` |
| CI/CD & version control | present | `.github/workflows/ci.yml` |
| Security | present | `SECURITY.md` + `security_audit` MCP tool |
| Rate limiting | partial | `polyglot/php/contact-endpoint.php` (honeypot/anti-injection) |
| Caching & CDN | partial | `polyglot/python/seis_sw_cache_audit.py` (service-worker precache) |
| Monitoring & logging | partial | `.github/workflows/security-guardian.yml` + governance ledgers |
| Backups & recovery | present | `scripts/restore-latest-release.mjs` |
| Testing | present | `scripts/polyglot-check.sh` + `node --test` |
| Load balancing & scaling | target | this doc — see contract below |
| Observability (errors & traces) | partial | `polyglot/go/cmd/seis-serve/main.go` — `/healthz` JSON + structured access logs |

`present` = a real, governed artifact exists. `partial` = a reference/seed exists,
not full production runtime. `target` = a documented contract, not built here
(cluster-scale runtime is out of scope for this repo, like `seis-flagship-150b`).

## Target: Load balancing & scaling

Contract for when SEIS runs a real backend fleet (not buildable in this repo):

- Stateless app instances behind a load balancer; health checks gate rotation.
- Horizontal autoscaling on CPU/latency/queue-depth signals.
- Graceful drain + zero-downtime rollout (tie into `scripts/build-static.mjs`
  and the cloud provisioning scripts).
- Capacity budget recorded alongside the experience budget
  (`scripts/check-experience-budget.mjs`).

Acceptance: a scaling policy file + a check that asserts the policy's thresholds
exist before a fleet deploy. Not yet implemented — tracked as a target.

## Observability (errors & traces) — partial

Implemented (real code, tested):

- `/healthz` JSON endpoint on the preview server (`polyglot/go/cmd/seis-serve/main.go`)
  for uptime checks and load-balancer health probes.
- Structured access logs — one line per request (method, path, status, duration).

Remaining (still target):

- Error tracking with alerting (a Sentry MCP server is available to wire in).
- Trace/request-id propagation across backend lanes.
- Uptime/availability SLOs with a recovery runbook
  (extends `scripts/restore-latest-release.mjs`).

## Honest position

- SEIS already governs ~80% of this stack as audit/governance lanes — it is far
  past "frontend + backend in one cylinder."
- The two real gaps are **scaling** and **observability**; both are captured here
  as enforceable contracts so they cannot be quietly forgotten.
- On the model side, SEIS's place is `seis-orchestrator` today (routing Claude
  backbones) with `seis-flagship-150b` as a documented target — see
  `SEIS_UNIVERSE_MODEL_FAMILY.md`.
