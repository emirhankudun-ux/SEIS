# GitHub Remote Configuration

SEIS now has a local Git remote configuration record for the intended GitHub development surface.

Machine-readable source: [`content/development/github-remote-configuration.json`](../../content/development/github-remote-configuration.json)

## Configured Remote

| Field | Value |
| --- | --- |
| Remote name | `origin` |
| Remote URL | `https://github.com/emirhankudun-ux/SEIS` |
| Target branch | `seis/product-experience-suite` |
| Local execution branch | `seis/product-experience-suite` |
| Local tracking target | `origin/seis/product-experience-suite` |

## Publication Rule

The remote is configured locally, but publication remains gated. A push should not be claimed until the repository is clean, GitHub authentication is ready, remote branch state is reviewed, human approval is explicit, and the publish path stays off `main`.

The current network probe status is `not-run-in-current-local-pass`, so this record treats remote configuration as local Git configuration only, not proof of GitHub authentication or push readiness.

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
