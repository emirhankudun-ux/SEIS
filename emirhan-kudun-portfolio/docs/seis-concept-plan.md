# SEIS Concept Branch Plan

`seis-concept` is the isolated fast-track branch for consolidating SEIS portfolio and UIX web work into one maintainable monorepo.

## Current Decision

- Primary monorepo: `emirhan-kudun-portfolio`
- Migration source: `UIX-Apps/apps/web`
- Migration target: `apps/uix-web`
- Content bridge: `packages/content/src/uix-static.ts`
- Runtime bridge: `packages/runtime/src/seis-concept.ts`
- Static build tooling: `scripts/build-static-app.mjs`, `scripts/check-static-app.mjs`, `scripts/serve-static-app.mjs`

## Migration Shape

The first phase keeps `apps/uix-web` as an independent static workspace. This keeps the migration reversible, avoids forcing a framework rewrite, and lets the portfolio monorepo validate the UIX surface with lightweight scripts before deeper integration.

`packages/content` exposes imported UIX route and content metadata so the monorepo can reason about the migrated surface without duplicating every app concern into the portfolio UI.

`packages/runtime` tracks the SEIS Concept surfaces so future automation can detect which parts of the monorepo are active, planned, or still external.

## Unified Scripts

- `npm run dev:uix`
- `npm run check:uix`
- `npm run build:uix`
- `npm run typecheck`
- `npm run build`

The root `typecheck` now includes the static UIX check. The root `build` now builds the two portfolio apps and the migrated UIX static app.

## Planning Questions

1. Should `apps/uix-web` stay as a standalone static workspace, or should it become a Next route such as `/uix` inside `apps/site-next`?
2. Should UIX static content become source-of-truth data in `packages/content`, or should `packages/content` only expose bridge metadata while `apps/uix-web` owns the raw files?
3. Should `packages/design-tokens` be applied to the portfolio apps immediately, or staged after a visual/a11y review?
4. Should `packages/asset-registry` stay documentation-first for now, or become a typed runtime import in the next phase?
5. Should the next commit focus on UI integration, content governance, runtime automation, or GitHub cleanup/archive workflow?

## Next Phase Guardrails

- Keep `main` untouched.
- Keep each follow-up commit small and reversible.
- Avoid framework rewrites until the static migration is reviewed.
- Validate with lightweight checks before heavier builds.
- Preserve generated outputs out of source control unless they are required release assets.
