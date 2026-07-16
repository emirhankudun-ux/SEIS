# SEIS Evolution Model

The SEIS evolution model turns broad GitHub improvement work into small, traceable, humane system upgrades. It keeps the repository aligned with cinematic minimalism, accessibility, branch safety, task-scoped PR branches, and low-power development while still allowing the ecosystem to grow.

Machine-readable source: [`content/development/seis-evolution-model.json`](../../content/development/seis-evolution-model.json)

## Purpose

SEIS should improve through modular layers instead of broad, irreversible pushes. Every meaningful change should be understandable as one of these layers:

- **Experience**: interface clarity, premium hierarchy, content quality, motion restraint, accessibility.
- **Governance**: branch policy, workspace intake, documentation, publication rules, rollback safety.
- **Automation**: scripts, plugin routing, AI-native work loops, validation commands.
- **Content**: portfolio records, case studies, metadata, lab/system records.
- **Deployment**: release artifacts, server handoff, hosting target readiness.

## Maturity Levels

| Level | Model layer | Meaning | Evidence |
| --- | --- | --- | --- |
| 1 | Foundation Integrity | The repository has a stable operating spine before expansion. | Docs are discoverable, JSON parses, and focused checks pass. |
| 2 | Calm Experience System | User-facing surfaces improve without overstimulation or accessibility regression. | Semantic structure, reduced-motion support, and mobile budgets are preserved. |
| 3 | Governed Automation | AI-native and script-driven acceleration remains auditable. | Automation has a focused check and no destructive publish behavior. |
| 4 | Platform Readiness | SEIS can grow across deployment, plugins, and integrations without losing clarity. | Targets are explicit, handoff artifacts are current, and release gates are proven. |

## Development Loop

1. **Sense** - Name the smallest GitHub-visible SEIS improvement that matters now.
2. **Shape** - Choose the model layer that should change and keep the edit traceable.
3. **Ship local** - Validate with the lightest local command that proves the change.
4. **Publish gated** - Claim publication only when branch, remote, authentication, and deployment state are explicit.

## Current Focus

The current evolution focus is **GitHub SEIS model hardening**: turn the model from a descriptive artifact into an actionable operating layer for upcoming repository increments. The active bias is to improve the static, accessible, rollback-safe foundation before adding frameworks, deployment automation, or heavier visual systems.

Primary backlog links:

- `SEIS-001` - refine development cockpit hierarchy.
- `SEIS-002` - tune mobile motion timing.
- `SEIS-003` - confirm production server target before upload claims.
- `SEIS-005` - choose the mobile starting path.
- `SEIS-006` - keep agent workstreams on focused PR branches in registry-approved task worktrees.

## Activation Queue

| ID | Backlog | Layer | Next action | Acceptance focus |
| --- | --- | --- | --- | --- |
| `evo-001` | `SEIS-001` | Experience | Improve one visible cockpit hierarchy issue without dependency growth. | Clearer editorial hierarchy, intact semantics, unchanged reduced-motion behavior. |
| `evo-002` | `SEIS-002` | Experience | Tune mobile reveal pressure only after checking the current motion policy. | Reduced-motion support, subtle mobile animation, no GPU-heavy effects. |
| `evo-003` | `SEIS-003` | Deployment | Collect domain, host, document root, upload method, and rollback path. | Explicit server target, documented rollback, no automatic deploy. |
| `evo-004` | `SEIS-005` | Platform | Compare PWA-first, Expo, and native paths against accessibility, cost, and rollback constraints. | Documented mobile path decision before native expansion. |
| `evo-005` | `SEIS-006` | Automation | Keep agent-driven work as small commits on task-scoped PR branches. | Traceable output, no forced push, checks before commit. |

## Decision Matrix

- If a request is broad or strategic, update a governance or strategy record before runtime surfaces.
- If a request changes visible UI, ship one calm, accessible, reduced-motion-aware interface slice.
- If a request asks for deployment, check branch, remote, auth, target, artifact, and rollback readiness first.
- If a request asks for automation, keep outputs auditable through records, focused validators, and small commits.

## Signals

Preferred signals are focused check pass rate, reversible slices shipped, preserved accessibility/reduced-motion protections, and explicit publish gates. Anti-signals are dependency growth without a decision record, large binary import pressure, automatic deploy before confirmed target, and branch sprawl.

## Quality Gates

Use the focused model validator for this layer:

```bash
npm run check:seis-evolution-model
```

Pair it with existing low-power checks when the change touches wider governance:

```bash
npm run check:seis-local-workspace-registry
node scripts/check-development-process.mjs
```

The routing source is
[`data/seis-local-workspace-registry.json`](../../data/seis-local-workspace-registry.json).
It identifies the repository by canonical remote slug and permits edits only in
worktrees classified as task-scoped; a non-Git intake path or dirty common root
is never promoted to a writable source of truth.

## Rollback Policy

The default rollback is the smallest commit revert or restoration of the previous documentation/JSON pair. The model continues to block large binary imports, nested Git intake, automatic deployment without a confirmed target, and remote branch deletion without explicit authentication plus branch review.
