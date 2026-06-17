# Development Process

SEIS development starts from a calm, modular, low-power rhythm. Each change should improve one explainable layer without forcing a broad rebuild, dependency expansion, or remote operation before the repository state is clear.

## Active Branch Contract

- GitHub should keep `UIXAppTTR` as the single remote branch for this project.
- `main` remains sacred as a philosophy, but it should not exist as an active remote branch for the current UIXAppTTR-only GitHub shape.
- Remote branch deletion requires working GitHub authentication before execution.
- Local conflict resolution and remote branch cleanup are separate operations.

## Development Cadence

| Phase | Purpose | Lightweight Proof |
| --- | --- | --- |
| Orient | Read the nearest docs, scripts, and target files. | Current surface is named before edits. |
| Compose | Make one reversible modular improvement. | The change has a rollback path. |
| Verify | Run the smallest relevant checks. | Syntax and focused governance checks pass. |
| Publish | Ship only after auth and branch state are explicit. | Remote head and branch list are confirmed. |

## Workspace Routing

`Github/New project` can operate as local staging when it is not inside a Git checkout. In that mode, local checks and portable source edits are allowed, but remote shipment must not be claimed.

When the folder is a Git checkout, it must use `UIXAppTTR` and the UIX-Apps GitHub remote.
Publish claims also require a clean worktree and an explicit upstream for `UIXAppTTR`.

```bash
npm run check:workspace
```

Publish readiness stays explicit and local-safe through:

```bash
npm run automation:publish-readiness
```

## Proportional Validation Profiles

Choose the smallest validation profile that can prove the change:

- `lowPowerDefault` for narrow, reversible updates in local staging:
  - `npm run check:workspace`
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

The first development slice is calm foundation hardening:

- Add a machine-readable development process registry.
- Add this human-readable governance protocol.
- Add a lightweight script that checks the protocol exists and remains aligned with the UIXAppTTR branch contract.

## Active Sprint

The current sprint adds a visible development cockpit and closes missing operational surfaces without introducing a new dependency stack.

| Workstream | Status | Proof |
| --- | --- | --- |
| Experience cockpit | In progress | Public shell exposes the active development cadence. |
| Server handoff | Ready for confirmed target | `dist/server-drop` contains zip, manifest, upload plan, and latest pointer. |
| Polyglot branch | Expanded | Language surfaces stay small contracts without dependency bloat. |
| Quality gates | Active | Syntax, foundation, release, history, and server-drop checks stay green. |

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
- The current folder is not the intended Git working tree.
- A change would require a heavy build, broad indexing, or dependency installation without explicit need.
- Branch cleanup would delete remote history without confirming the protected branch first.

## Quality Bias

Prefer small, composable changes with visible acceptance criteria. Keep motion restrained, accessibility explicit, and documentation close enough to the code that future changes stay explainable.
