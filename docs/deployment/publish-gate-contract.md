# Publish Gate Contract

The publish gate contract separates **local remote configuration** from **actual push readiness**. SEIS can have a configured `origin` remote while still blocking publication until branch, upstream, worktree, authentication, and deployment target state are explicit.

Machine-readable source: [`content/development/publish-gate-contract.json`](../../content/development/publish-gate-contract.json)

## Readiness Levels

| Level | Meaning | Allows | Still blocks |
| --- | --- | --- | --- |
| `configured` | `origin` points at the configured SEIS repository (`https://github.com/emirhankudun-ux/SEIS.git`). | Local validation, commits, readiness reporting. | Push claims and deployment claims. |
| `publish-preflight` | Branch is `main`, upstream is `origin/main`, worktree is clean, and GitHub auth is ready. | Bounded push preflight and fast-forward-safe publish attempt. | Automatic deploy without confirmed target. |
| `deployment-ready` | Publish preflight is ready and server/deployment target has domain, path, owner, and rollback confirmation. | Release artifact upload after human confirmation. | Unconfirmed overwrite and branch cleanup without review. |

## Current Environment Policy

This environment is expected to be **configured but not publish-ready** unless `main`, upstream, clean worktree, and GitHub authentication all become available. The previous network probe returned `Branch protection and signature rules can still block or warn on direct pushes`, so remote configuration should not be treated as GitHub authentication or push proof.

## Validation

Run the focused contract check:

```bash
npm run check:publish-gate-contract
```

Use the existing publish-readiness reporter to see the current blocker:

```bash
npm run automation:publish-readiness
```

A blocked publish-readiness result is acceptable during local development when the blocker is explicit and the contract still proves that `origin` points at `SEIS`.
