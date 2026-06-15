# GitHub SEIS Operating Model

This model turns GitHub work into a calm, traceable SEIS flow. It does not replace the branch policy; it clarifies how intent, source edits, verification, and publication should be named before anyone claims shipment.

## Purpose

SEIS should develop inside GitHub without creating status ambiguity. Local progress, committed source, authenticated remote publication, and live deployment are separate states. A change is healthier when each state can be inspected and rolled back independently.

## Active Repository Contract

- Active GitHub branch: `UIXAppTTR`
- Remote identity: `UIX-Apps`
- Branch posture: single active development branch
- Main-branch posture: sacred, not a casual working surface
- Shipment posture: no remote shipment claim until authenticated GitHub publication is confirmed

## Cadence

| Phase | Owner | Gate | GitHub Signal |
| --- | --- | --- | --- |
| Intent capture | governance-agent | Scope is small enough to review and rollback. | Issue, commit note, or traceable doc explains why the work exists. |
| Source shaping | interface-agent | HTML, CSS, JavaScript, JSON, and docs stay modular and dependency-light. | Changed files are readable in a focused diff before release refresh. |
| Local verification | release-agent | Proportional checks match the changed surface. | Commit message and PR body list exact checks and limitations. |
| GitHub publication | release-agent | Clean worktree, expected branch, upstream, remote, and authentication are confirmed. | Remote shipment is claimed only after the authenticated push exists. |

## Readiness Signals

```bash
npm run check:development-program
npm run check:workspace
npm run automation:publish-readiness
```

Use `automation:publish-readiness` as the final GitHub preflight. If it blocks on upstream, remote, authentication, or dirty worktree state, the correct status is still local-only or committed-only, not shipped.

## Rollback Rules

- Prefer one small reversible commit over broad unreviewable imports.
- Refresh `release/web` only when the visible web surface changes.
- Do not bulk-import archives, nested Git directories, personal media, or symlink mirrors.
- Separate GitHub publication from live server deployment in every status statement.

## Web Cockpit Surface

The web cockpit reads `content/development/github-seis-model.json` to show the cadence as a calm GitHub model board. If the JSON cannot be loaded, the static HTML still names the same branch, verification, and publication gates.
