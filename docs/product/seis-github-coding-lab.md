# SEIS GitHub Coding Lab

SEIS GitHub Coding Lab is a local-first browser demo for turning a rough feature idea into a safe GitHub execution package.

It lives at:

```text
apps/web/seis-github-coding-lab.html
```

## Purpose

The page helps a maintainer, contributor, or AI coding agent draft a reviewable GitHub workflow before touching production surfaces.

It generates:

- a branch name
- a commit message
- a scoped file plan
- validation commands
- a pull request brief
- a review checklist

The workflow is intentionally small and reversible. It does not create branches, commit code, open pull requests, execute SSH, call provider APIs, deploy, or read private data by itself.

## Safety boundary

The page is marked as `Local Demo` and stores only the current draft in browser `localStorage` under:

```text
seis.githubCodingLab.v1
```

The page must keep these boundaries explicit:

- no provider keys
- no SSH execution
- no GitHub mutation from the browser
- no private hostnames
- no secrets
- no external runtime dependency
- no claim that generated steps have already been executed

## Product lanes

The intake supports five SEIS-aligned lanes:

| Lane | Intent |
| --- | --- |
| Web demo / static route | Add a browser-facing static or interactive route. |
| Documentation / governance | Add or improve governance, strategy, or operating documentation. |
| Automation / validation script | Add scripts, reports, and repeatable checks. |
| Apple-first product direction | Add Apple-first Swift, SwiftUI, macOS, iPadOS, or iOS planning surfaces. |
| Second Brain / Obsidian memory | Add public-safe memory and Obsidian-compatible context surfaces. |

## Validation

Run the dedicated static gate after changing the page, route registry, service worker, sitemap, or this document:

```bash
node scripts/check-seis-github-coding-lab.mjs
```

Recommended wider checks:

```bash
npm run check:seis-code
npm run check:static-build
```

## Review checklist

Before merge, verify that:

- `apps/web/seis-github-coding-lab.html` is additive and mobile-safe.
- `apps/web/src/config/routes.json` registers `/seis-github-coding-lab.html`.
- `apps/web/service-worker.js` precaches the route and bumps the cache version.
- `apps/web/sitemap.xml` exposes the public route.
- The validation script passes locally.
- Any future live GitHub write action remains server-side and approval-gated.

## Future upgrade path

Possible next steps:

1. Add a link from the SEIS Code route or website product hub.
2. Add a small browser smoke test that verifies form input, localStorage restore, and copy fallback.
3. Add a server-side, approval-gated GitHub PR creator only after the safety model is documented and reviewed.
4. Add Apple-first export templates for SwiftUI issue briefs and Xcode implementation plans.
