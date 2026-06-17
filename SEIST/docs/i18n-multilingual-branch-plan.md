# Multilingual Branch Plan

## Branch Name

Recommended branch:

```text
feature/multilingual-cinematic-foundation
```

## Active Locales

The web shell now supports:

- `tr`
- `en`
- `fr`
- `it`
- `de`
- `es`
- `ar`

Arabic is included to prove right-to-left layout readiness.

## Implementation

- Locale dictionaries live in `apps/web/src/i18n/locales.js`.
- Runtime language switching lives in `apps/web/src/scripts/i18n-system.js`.
- Text nodes use `data-i18n` attributes.
- The document `lang`, `dir`, and title update when language changes.
- Locale choice persists in local storage.

## Production Follow-Up

Before production:

- Human-review every translation.
- Add localized SEO metadata per route.
- Add localized sitemap/hreflang output.
- Decide whether URLs should be query-based (`?lang=tr`) or route-based (`/tr/`).

