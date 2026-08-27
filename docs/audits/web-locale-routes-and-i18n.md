# Web locale routes and i18n — audit, 2026-08-27

Scope: `apps/web/index.html`, `apps/web/script.js`, `scripts/build-static.mjs`,
`scripts/check-static-build.mjs`, and the three translation dictionaries the
repository carries.

Everything below was reproduced locally against a real `npm run build:static`
package served over HTTP and driven in headless Chromium. Status codes and
attribute counts are measured, not inferred.

---

## Fixed in this pass

### 1. All seven generated locale routes served a broken page

`writeLocalizedRoutes()` emits `/tr/`, `/en/`, `/fr/`, `/it/`, `/de/`, `/es/`
and `/ar/` by copying `index.html` into a subdirectory. `rewriteForLocaleRoute()`
was supposed to repoint the copy's relative references, but it rewrote a
hand-maintained list of `./`-prefixed prefixes (`./public/`, `./assets/`,
`./src/`, `./docs/`, `./favicon.svg`, `./manifest.webmanifest`).

`index.html` uses none of those shapes. Its references are `style.css`,
`script.js`, `manifest.json`, `favicon.svg`, `icons/icon-512.png` and
`./desktop.html` — so **not one rewrite rule matched**, and every locale route
shipped with its stylesheet, script, manifest, icon and in-site links pointing
one directory too deep.

Measured against the built package, before the fix:

```
/de/              200
/de/style.css     404
/de/script.js     404
/de/manifest.json 404
/de/favicon.svg   404
```

A browser loading `/de/` got raw unstyled HTML with a broken image placeholder
and no JavaScript at all. This affected 7 of the 8 routes in every published
static package.

**Fix:** rewrite relative references by shape rather than by prefix, skipping
scheme-qualified, protocol-relative, root-relative, fragment-only and query-only
values. A path the page starts using later cannot silently fall through.

### 2. `script.js` discarded the route locale

`init()` called `applyLanguage("en")` unconditionally. It never read the URL
locale segment, never read the served `<html lang>`, and never persisted the
toggle. Consequences:

- `/tr/` was published with `lang="tr"` and then immediately overwritten back to
  `lang="en"` and rendered in English. The locale-route feature could not work
  even with correct asset paths.
- The language toggle reset to English on every reload and every navigation.

**Fix:** resolve the initial language from `?lang` → route segment → stored
preference → served `<html lang>`, and persist an explicit toggle. The order
mirrors the convention already used in `src/scripts/i18n-system.js`.

`/tr/` now renders Turkish. Verified in headless Chromium: hero copy reads
"AI Core, kod, tasarim, cloud, arama, SSH ve urun demolarini tek yonetilen
isletim sistemine bagla." with zero failed requests.

### 3. `check:static-build` could not fail on any of this

The locale-route gate asserted only that `<locale>/index.html` exists and
contains the substring `lang="<locale>"`. Both held for every broken route, so
the check printed `passed for 7 locale routes` while all seven were unusable.

**Fix:** resolve every local `href`/`src` in each route (and in the root
`index.html`) against the directory it is served from, and fail on any dangling
or package-escaping reference. A route that exposes zero references to check is
also a failure, so the check cannot pass vacuously.

**Negative control.** Rebuilt the package with the pre-fix build script and ran
the new gate against it: **exit 1, 140 dangling references across all 7 routes.**
Against the fixed build: exit 0. The gate is proven to fail before it is trusted
to pass.

---

## Open — needs an owner decision, deliberately not changed here

### A. Three disjoint translation dictionaries, one of them dead weight

| Source | Size | Keys | Read by |
|---|---|---|---|
| `apps/web/translations.json` | 61 KB | 5 locales × 217 | **nothing in the site** — only `seis-check` and the MCP i18n tools |
| `apps/web/src/i18n/locales.js` | — | 7 locales × 181 | `src/scripts/*`, which no HTML page loads; and `build-static.mjs` for route names and titles |
| `COPY` inline in `script.js` | — | 2 locales × 138 | the live page |

`translations.json` is listed in the service worker's `PRECACHE`, so **every
visitor downloads 61 KB of translation data that no code path reads.**

The `data-i18n` binding it served was removed by `1eb5e6ad` ("rebuild SEIS
one-page website", 2026-06-23): `index.html` went from **183** `data-i18n`
attributes to 0, and `script.js` from **45** `getT(` calls to 0. The rebuilt page
introduced a third convention, `data-copy-key`, with camelCase keys. Overlap
between the 138 live `data-copy-key` names and the 181 keys in `locales.js`:
**0**.

Deciding which dictionary is canonical — and whether to retire the other two —
is a product decision, not a mechanical one. Fabricating de/fr/it/es/ar copy to
fill the gap would be worse than leaving it visible.

### B. `CLAUDE.md` documents the dead contract

`CLAUDE.md` still describes `data-i18n` + `translations.json` + `getT()` as the
live i18n system and instructs "Never add a key to only one locale." That advice
now applies to a dictionary the site does not read. It should be updated once (A)
is decided, so the two changes stay consistent.

### C. `seis-check`'s i18n section cannot fail either

It reports `[PASS] i18n 5 locales × 217 keys, 0 referenced`. Zero referenced keys
is the exact symptom of this regression and it reads as a pass. The same is true
of the Lua lane `seis_i18n_attr_audit.lua`, which verifies `data-i18n` keys
against the `tr` locale and passes vacuously when there are no such attributes.

Making either fail is the right move, but it fails immediately on `main` until
(A) is resolved, so it belongs in the same change rather than ahead of it.

### D. `hreflang` advertises locales the site does not render

`index.html` declares alternates for `en`, `tr`, `de`, `fr`, `it` plus
`x-default`, while the build generates seven routes (adding `es` and `ar`) and
the page renders two languages. `/de/` now correctly self-labels `lang="en"`
because its content is English — which makes `hreflang="de"` a false signal.

Reducing the alternates to what the site actually serves would break
`polyglot/guile/seis_hreflang_audit.scm`, which hard-codes the five locales as
required. Fixing the tag and the governance audit together is one coherent
change; doing either alone regresses the other.

---

## Verification run for this pass

```
npm run build:static                     ok
npm run check:static-build               exit 0 (exit 1, 140 findings on the pre-fix build)
npm run seis:check                       8/8 pass
npm run seis:test                        198 tests, 30 suites, 198 pass / 0 fail
node --test apps/web/test/*.js           25 tests, 10 suites, 25 pass / 0 fail
npm run check:foundation                 pass
npm run check:seis-static-demo-routes    pass
./scripts/polyglot-check.sh              all pass (unavailable toolchains skip)
headless Chromium on the built package   / , /tr/ , /de/  -> 0 failed requests
                                         /tr/ renders Turkish, /de/ renders English
```
