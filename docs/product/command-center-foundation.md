# SEIS Command Center Foundation

## Purpose

Define the Command Center as the evidence-backed operating interface for SEIS,
not as a decorative dashboard or chatbot wrapper.

## Scope

The first Command Center foundation covers:

- goal tracking
- repository status
- lane status for cloud, code, design, and data
- validation evidence
- blockers
- next PR queue
- approval-gated actions

## Current Status

| Module | Status | Evidence | Next Safe Action |
| --- | --- | --- | --- |
| Goal Tracking Center | Scaffolded static page | `apps/web/goal-tracking.html`, `content/development/seis-goal-command-center-view.json` | Keep generated from source records. |
| Plugin Interface Suite | Documented static interface | `apps/web/index.html`, `content/development/seis-plugin-interface-roadmap.json`, `docs/product/plugin-interface-suite.md` | Add browser QA and schema validation before expanding actions. |
| Repository Health | Planned | `docs/STATUS.md` | Add read-only repository scan contract. |
| AI Control Center | Planned | `docs/ai/seis-ai-core.md` | Define provider status and no-key startup before UI. |
| Cloud Center | Planned | `docs/operations/seis-cloud-foundation.md` | Keep live actions disabled until approval. |
| SEIS Code | Planned | `docs/product/seis-code-foundation.md` | Build browser-safe MVP only after contracts. |
| Design System | Planned | `docs/design-system/seis-design-foundation.md` | Add component inventory and visual QA. |
| Data Center | Planned | `docs/data/seis-data-foundation.md` | Add schema registry and freshness rules. |

## Rules / Policy

- Every clickable control must either perform a real action, be disabled with a
  reason, or be marked planned.
- Health claims require evidence links.
- Mock data must be labeled mock.
- Unknown status must remain unknown.
- Dangerous actions require approval and audit notes.
- The interface must remain useful without an LLM provider.

## Evidence Requirements

Command Center cards must cite at least one of:

- source record
- validator result
- generated report
- manual review
- test output
- known blocker

## Related Documents

- [goal-tracking-center.md](goal-tracking-center.md)
- [../architecture/seis-platform-lanes.md](../architecture/seis-platform-lanes.md)
- [../STATUS.md](../STATUS.md)
- [../roadmap/NEXT_PR_QUEUE.md](../roadmap/NEXT_PR_QUEUE.md)

## Next Safe Action

Add validation for the plugin interface roadmap record and keep the read-only
lane status view current. Do not wire live cloud, SSH, provider, or GitHub
write actions in this phase.
