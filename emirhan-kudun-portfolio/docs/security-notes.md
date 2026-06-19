# Security Notes

## npm audit: Next.js / PostCSS

`npm audit --omit=dev` currently reports a moderate PostCSS advisory through the stable `next@16.2.6` dependency chain.

Actions intentionally not taken:

- `npm audit fix --force` is not used because npm proposes a breaking downgrade to `next@9.3.3`.
- `next@canary` is not used because this project should stay on stable framework releases unless a dedicated upgrade branch is created.

Recommended follow-up:

- Re-run `npm audit --omit=dev` after the next stable Next.js release.
- Upgrade Next.js once the stable release includes the patched PostCSS dependency.

## Vercel config dependency

This project uses `vercel.json` instead of `vercel.ts` for now. `vercel.ts` is the preferred modern Vercel configuration path, but the current `@vercel/config` package pulled a vulnerable dev dependency chain during implementation. The JSON config keeps deployment readiness without adding that vulnerable dependency.
