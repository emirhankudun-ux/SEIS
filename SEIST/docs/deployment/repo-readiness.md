# Repository And Deployment Readiness

## Current Blocker

Use the canonical iCloud checkout:

```text
/Users/emirhan/Library/Mobile Documents/com~apple~CloudDocs/Github/UIX-Apps
```

## Required GitHub Flow

1. Open the canonical iCloud checkout.
2. Confirm the `UIXAppTTR` branch tracks `origin/UIXAppTTR`.
3. Run:

```bash
npm run quality
npm run publish:preflight
```

4. Commit only intended files.
5. Push only after publish preflight is clean and the branch is not behind origin.

## Static Hosting Readiness

The `apps/web` surface is static and can be hosted as plain files.

For framework migration:

- keep `apps/web` as the reference shell
- create `apps/site` for Next.js or Astro
- move tokens/content/asset registry into shared packages

## Do Not Deploy Yet

Do not deploy publicly until:

- canonical domain is confirmed
- robots policy is changed
- artwork alt text is reviewed
- image derivatives are optimized
- 3D direction is approved
