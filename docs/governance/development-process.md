# Development Process

SEIS development starts from a calm, modular, low-power rhythm. Each change should improve one explainable layer without forcing a broad rebuild, dependency expansion, or remote operation before the repository state is clear.

## Task-Scoped Branch Contract

- `main` is the protected default branch and receives accepted work through review.
- Implementation uses a focused, temporary PR branch rather than one permanent local execution branch.
- Direct writes to `main`, force pushes, branch deletion, and repository-setting changes require separate authorization.
- Local conflict resolution and remote branch cleanup are separate operations.

## Development Cadence

| Phase | Purpose | Lightweight Proof |
| --- | --- | --- |
| Orient | Read the nearest docs, scripts, and target files. | Current surface is named before edits. |
| Compose | Make one reversible modular improvement. | The change has a rollback path. |
| Verify | Run the smallest relevant checks. | Syntax and focused governance checks pass. |
| Publish | Ship only after auth and branch state are explicit. | Remote head and branch list are confirmed. |

## Workspace Routing

The machine-readable routing source is
[`data/seis-local-workspace-registry.json`](../../data/seis-local-workspace-registry.json).
It identifies the canonical repository by remote slug, not by a permanent local
folder name.

Write only in a healthy Git worktree classified as `task-scoped`. Non-Git
intake folders, incomplete Git metadata, dirty common roots, archives, and backups are
read-only or blocked. These surfaces may be inspected without printing file
names or contents, but they are never implicit staging surfaces.

```bash
npm run check:seis-local-workspace-registry
npm run test:seis-local-workspace-registry
npm run check:workspace-routing
```

Publish readiness stays explicit and local-safe through:

```bash
npm run automation:publish-readiness
```

## Proportional Validation Profiles

Choose the smallest validation profile that can prove the change:

- `lowPowerDefault` for narrow, reversible updates in a task-scoped worktree:
  - `npm run check:seis-local-workspace-registry`
  - `npm run test:seis-local-workspace-registry`
  - `npm run check:workspace-routing`
  - `node scripts/check-development-process.mjs`
  - `node --check scripts/check-development-process.mjs`
  - `node --check scripts/check-workspace-routing.mjs`
- `expandedFoundation` when edits span multiple governance/runtime contracts:
  - `npm run check:foundation`

Low-power mode explicitly avoids heavyweight actions during normal development loops: `npm install`, broad `npm run build` flows, and browser-automation surfaces such as Playwright.

## Development Automation

Long development sessions should begin with the low-power automation loop:

```bash
npm run automation:develop
```

This command runs workspace, foundation, JavaScript syntax, and deploy-readiness checks, then reports Git and GitHub authentication readiness. Missing Git or GitHub auth blocks publishing, not local development.
It should also block publish claims when the worktree is still dirty or the branch has no configured upstream.

## First Slice

The current governance slice is workspace truth and recovery:

- Maintain a redacted local-workspace registry and schema.
- Keep discovery read-only and print-only by default.
- Reject unsafe paths, credential-bearing remotes, dirty writable roots, and non-Git canonical claims.
- Route edits to a clean, task-scoped worktree without pruning or repairing user-owned state.

## Active Sprint

The current sprint establishes workspace truth and a non-destructive recovery guard before further product expansion.

| Workstream | Status | Proof |
| --- | --- | --- |
| Redacted registry | In progress | Immutable opaque-ID snapshot and schema remain aligned. |
| Read-only discovery | In progress | Bounded local inspection emits public-safe stdout and performs no mutation. |
| Fail-closed validation | Active | Offline checks and adversarial fixtures reject unsafe routing and disclosure drift. |
| Recovery governance | Active | Routing, status, backlog, queue, and approvals share one contract. |

## Builder Platform Preference

Lovable is the preferred AI-native builder and prototyping surface for SEIS interface drafts, product iteration, and visual app exploration. Wix stays secondary and should be used only when the task explicitly depends on Wix hosting, Wix CMS, or an existing Wix project.

Lovable output must remain portable back into this repository: modular structure, accessible interaction states, reduced-motion awareness, and clear rollback notes matter more than builder speed.

## Open Backlog

| ID | Priority | Missing Surface |
| --- | --- | --- |
| `dev-002` | High | Server target confirmation flow. |
| `dev-003` | Medium | Case study detail model. |
| `dev-004` | Medium | Accessibility review checklist. |
| `dev-005` | Low | Framework migration decision record. |

## Stop Conditions

Stop and report clearly when:

- GitHub authentication is missing.
- The current folder is not a registry-approved task-scoped Git worktree.
- Discovery finds a non-Git intake path, incomplete Git metadata, or dirty common root where a writable target was expected.
- A change would require a heavy build, broad indexing, or dependency installation without explicit need.
- Branch cleanup would delete remote history without confirming the protected branch first.

## Quality Bias

Prefer small, composable changes with visible acceptance criteria. Keep motion restrained, accessibility explicit, and documentation close enough to the code that future changes stay explainable.
