# SEIS UIXAppTTR Branch Binding

This plugin is designed to work with the SEIS UIX-Apps branch contract, not as a
detached extension drawer.

## Bound Repository

- Product repository: `https://github.com/emirhankudun-ux/UIX-Apps.git`
- Branch: `UIXAppTTR`
- Local workspace:
  `/Users/emirhan/Library/Mobile Documents/com~apple~CloudDocs/Github/_SEIS_WORKSPACE/UIX-Apps-origin-clean`
- Repo-side contract:
  `content/development/seis-trusted-marketplace-plugin.json`
- Plugin-side connection asset: `assets/seis-repo-connection.json`

## Working Rule

When Codex uses this plugin for SEIS work, it should first confirm the target
repo and branch, then choose the smallest useful capability lane:

- data engineering
- development
- design
- learning
- monitoring
- productivity
- security
- testing

The plugin should never imply that a local plugin update means the product repo
has been pushed, or that a pushed branch means a live deployment happened.

## Safe Publish Contract

Use this order before publishing product-repo changes:

```bash
git status --short --branch
npm run check:workspace
npm run check:trusted-marketplace-intake
npm run check:seis-trusted-marketplace-plugin
npm run automation:publish-readiness
```

Only push `UIXAppTTR` when publish readiness is clean and the branch is not
behind the remote.
