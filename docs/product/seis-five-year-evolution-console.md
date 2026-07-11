# SEIS Five-Year Evolution Console

The Linux-like SEIS demo now exposes the existing five-year sub-agent plan as
an interactive, browser-local `Evolution Console`.

## Source of truth

- Canonical plan: `content/development/seis-sub-agent-5-year-plan.json`
- Browser presentation adapter: `apps/web/seis-five-year-plan.js`
- Runtime surface: `apps/web/seis-linux-replica.html`
- Alignment check: `npm run check:seis-linux-five-year-roadmap`

The adapter is intentionally presentation-focused. The checker compares its
five year themes and all 20 quarter IDs to the canonical plan so the UI cannot
silently drift into a second roadmap.

## Truth boundary

The console says `documented` and `deterministic local presentation`. It does
not claim that five years have elapsed, that sub-agents have autonomous write
authority, or that SEIS owns a trained foundation model. Merge, push, deploy,
SSH, secret access, provider-key collection, and model training remain outside
the browser demo and require separate human-approved work.

## Operator workflow

1. Open `apps/web/seis-linux-replica.html?demo=live`.
2. Launch `Evolution Console` from the side rail or app launcher.
3. Select a year, then a quarter, to inspect its documented delivery theme.
4. Copy the local handoff or open the existing Goal Tracking OS route.
5. Validate the roadmap adapter before publishing a later slice.

## Five-year progression

| Horizon | Theme | Current evidence boundary |
| --- | --- | --- |
| Year 1 | Foundation, evidence, and safe agent lanes | Documented contracts and local checks |
| Year 2 | Product runtime and controlled automation | Planned runtime hardening and dry-run controls |
| Year 3 | Integrated Command Center and AI Core alpha | Backend-only and approval-gated preparation |
| Year 4 | Scale, reliability, and controlled federation | Read-only federation, observability, and privacy planning |
| Year 5 | Sustainable autonomous assistance and research readiness | Evidence-backed next-phase planning, not completion |

The next implementation slice should deepen one bounded Year 2 workflow while
keeping the Local Demo, no-secret, no-SSH, and single-writer boundaries intact.
