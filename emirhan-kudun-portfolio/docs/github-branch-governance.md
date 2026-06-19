# GitHub Branch Governance

The active SEIS Concept migration branch is `seis-concept`.

## Repository Target

- GitHub repository: `emirhankudun-ux/emirhan-kudun-portfolio`
- Preferred origin URL: `https://github.com/emirhankudun-ux/emirhan-kudun-portfolio.git`
- Main branch stays protected by convention; publish and review work happens from the Codex branch.

## Branch Policy

- Use `seis-concept` for the current aggressive migration work.
- Keep changes in small reversible commits.
- Future phase branches may use:
  - `codex/seis-ux-*` for portfolio foundation work.
  - `codex/3d-*` for motion and WebGL work.
  - `codex/content-*` for Behance, drawings, copy and localization.
  - `codex/deploy-*` for GitHub, Vercel or server publishing.
- Do not merge to `main` until the branch has passed local checks and GitHub Actions.

## Push Preflight

Run this before pushing:

```bash
npm run github:preflight
```

If `origin` is missing:

```bash
git remote add origin https://github.com/emirhankudun-ux/emirhan-kudun-portfolio.git
```

If GitHub CLI auth is missing:

```bash
gh auth login -h github.com
gh auth status -h github.com
```

Only after preflight passes:

```bash
npm run github:publish
```

`github:publish` runs the preflight first, disables interactive terminal prompts, and performs one push attempt. If GitHub auth is missing, it stops before pushing.

## Review Gates

- `npm run check:content`
- `npm run check:uix`
- `npm run lint`
- `npm run typecheck`
- `npm run check:runtime`
- `npm run check:source-boundaries`
- `npm run build --workspace apps/site-next`
- `npm run build --workspace apps/site-vite`

GitHub Actions runs the same validation on `main`, `codex/**`, and pull requests.
