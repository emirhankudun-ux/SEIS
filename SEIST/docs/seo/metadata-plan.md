# SEO And Metadata Plan

## Current State

The foundation uses `noindex, nofollow` because the final production domain
is not confirmed yet. Static crawl assets now point at the GitHub Pages
publication surface so placeholder URLs cannot leak into a release package.

Canonical base:

```text
https://emirhankudun-ux.github.io/UIX-Apps
```

Sitemap:

```text
https://emirhankudun-ux.github.io/UIX-Apps/sitemap.xml
```

## Production Requirements

Before production:

- Confirm whether the GitHub Pages URL remains canonical or should be
  replaced by the final custom domain.
- Set page-level canonical tags after the final domain is confirmed.
- Add Open Graph image.
- Add JSON-LD for the final brand/person/portfolio structure.
- Change robots to `index, follow`.
- Keep primary copy as readable HTML, not canvas text.
- Run `npm run check:seo` before any publish attempt.

## Readiness Contract

- `content/site/metadata.json` is the canonical source for the current
  foundation URL policy.
- `apps/web/sitemap.xml` must not contain `example.com`, `localhost`, or other
  placeholder origins.
- `apps/web/robots.txt` must reference the same sitemap URL as metadata.
- The foundation may stay `noindex` until the final domain and public release
  window are confirmed.

## Legacy Patterns To Preserve

From the analyzed portfolio zip:

- canonical
- Open Graph
- Twitter card
- hreflang
- JSON-LD
- sitemap
- robots
- manifest

These should be migrated as patterns, not copied as a monolithic legacy head block.
