# SEIS SEO Metadata Plan

Status: pre-production-noindex

SEIS keeps public-indexing posture explicit while the repository is still a
public-readiness candidate. The web demo may be browsed and reviewed, but search
engine indexing stays blocked until the maintainer confirms the final production
domain and release gate.

## Current Source Of Truth

- Metadata record: `content/site/metadata.json`
- Sitemap: `apps/web/sitemap.xml`
- Robots file: `apps/web/robots.txt`
- Home page metadata: `apps/web/index.html`
- Validator: `npm run check:seo`

Current canonical base:

```text
https://emirhankudun-ux.github.io/UIX-Apps
```

Current sitemap:

```text
https://emirhankudun-ux.github.io/UIX-Apps/sitemap.xml
```

## Current Policy

- `seoPolicy.canonicalBase` must be an HTTPS URL.
- `seoPolicy.sitemapUrl` must live under the canonical base.
- Placeholder domains are not allowed in metadata, robots, or sitemap records.
- The home page and case-study page must keep `noindex, nofollow` before final
  production-domain confirmation.
- Open Graph URL and image metadata must use the canonical base.

## Release Boundary

Passing `npm run check:seo` means the pre-production metadata contract is
internally consistent. It is not a public release approval, Pages publication
approval, or production indexing approval.

Before changing to `index, follow`, require a separate reviewed PR that confirms:

1. Final production domain.
2. Canonical URL ownership.
3. Sitemap destination.
4. Social preview asset provenance.
5. Public-readiness status has no blocking security, demo, Apple-first,
   Second Brain, local AI, or SEIS-SSH issues.

## Production Requirements

Before production:

- Confirm whether the GitHub Pages URL remains canonical or should be replaced
  by the final custom domain.
- Keep primary copy as readable HTML, not canvas text.
- Add or confirm JSON-LD for the final brand/person/portfolio structure.
- Preserve canonical, Open Graph, Twitter card, hreflang, sitemap, robots, and
  manifest patterns as reviewed metadata, not as an unreviewed legacy head copy.
- Run `npm run check:seo` before any publish attempt.

## Verification

```bash
npm run check:seo
npm run check:seis-public-readiness
```

These commands must not require API keys, SSH credentials, private vault
material, paid providers, or live cloud accounts.
