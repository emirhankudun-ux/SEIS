# GitHub Remote Configuration

SEIS has a public-safe remote identity record for the intended GitHub development surface. The canonical identity is the repository slug, not a permanent local folder or dated branch.

Machine-readable source: [`content/development/github-remote-configuration.json`](../../content/development/github-remote-configuration.json)

## Configured Remote

| Field | Value |
| --- | --- |
| Remote name | `origin` |
| Canonical repository slug | `emirhankudun-ux/SEIS` |
| Remote URL | `git@github.com:emirhankudun-ux/SEIS.git` |
| Target branch | `main` |
| Local execution strategy | One task-scoped PR branch per Goal and worktree |
| Permanent local execution branch | None |
| Routing registry | `data/seis-local-workspace-registry.json` |

## Publication Rule

The remote is configured locally, but publication remains gated. A task-scoped PR branch may publish reviewed work only after its upstream and remote head are verified; a release or protected-branch publication still requires the `main` branch contract.

Branch protection and signature rules can still block or warn on direct pushes. Treat a successful local remote configuration as necessary evidence, not as proof that GitHub accepted the update. When publishing, verify the actual push or PR state and then check GitHub Actions, CodeQL, and open code-scanning alerts.

## Validation

Run the focused remote configuration check:

```bash
npm run check:github-remote-configuration
npm run check:seis-local-workspace-registry
```

Pair it with the SEIS model and workspace checks before any publication claim:

```bash
npm run check:seis-evolution-model
npm run check:workspace-routing
```

## Rollback

If the GitHub target changes, first revert or supersede the versioned contract
and this document. Any actual `origin` or branch-tracking mutation requires a
separate approved Goal with a configuration backup, explicit rollback, and
post-change verification; OPS-GOAL-0002 grants no such mutation authority.
