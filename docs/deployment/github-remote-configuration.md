# GitHub Remote Configuration

SEIS now has a local Git remote configuration record for the intended GitHub development surface.

Machine-readable source: [`content/development/github-remote-configuration.json`](../../content/development/github-remote-configuration.json)

## Configured Remote

| Field | Value |
| --- | --- |
| Remote name | `origin` |
| Remote URL | `git@github.com:emirhankudun-ux/SEIS.git` |
| Target branch | `main` |
| Local execution branch | `codex/publish-local-seis-20260618-163043` |
| Local tracking target | `origin/codex/publish-local-seis-20260618-163043` |

## Publication Rule

The remote is configured locally, but publication remains gated. A branch push can publish reviewed work to `origin/codex/publish-local-seis-20260618-163043`; a release or protected-branch publication still requires the `main` branch contract.

Branch protection and signature rules can still block or warn on direct pushes. Treat a successful local remote configuration as necessary evidence, not as proof that GitHub accepted the update. When publishing, verify the actual push or PR state and then check GitHub Actions, CodeQL, and open code-scanning alerts.

## Validation

Run the focused remote configuration check:

```bash
npm run check:github-remote-configuration
```

Pair it with the SEIS model and workspace checks before any publication claim:

```bash
npm run check:seis-evolution-model
npm run check:workspace
```

## Rollback

If the GitHub target changes, remove or reset the local `origin` remote and restore branch tracking config before making any publish claim.
