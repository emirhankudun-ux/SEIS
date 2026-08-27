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

## Follow-on census: dangling references across the whole package

The gate ships covering the root `index.html` plus the 7 locale routes — 8 files,
160 references. The published package contains **475** HTML files. Applying the
same resolution rule to all of them turns up **194 dangling references in 10
files**, none of which any check sees today.

### Fixed in this pass

| File | Reference | Cause |
|---|---|---|
| `language-matrix.html` | `../content/development/seis-programming-language-purpose-matrix.json` | wrong depth — the file exists; from the package root the path is `./content/…`. The user-facing "View JSON contract" button 404'd. |
| `seis-conversation-hub.html` | `../docs/ai/seis-conversation-hub.md` | wrong depth **and** `docs/ai` was not among the doc directories `build-static.mjs` copied. Fixed both; the "Read contract" button now resolves. |

### Not fixed — the asset was never committed

- **`wow-pages/imported/*/index.html` — 190 refs across 7 gallery pages.** Each
  emits `<img src="png/NN_name.png">`, and the tree contains **zero** `.png`
  files: the imported packages landed with their `html/`, `assets/css` and
  `assets/js` committed but their `png/` directories missing. Two facts a
  maintainer needs before deciding:
  - **Every** missing PNG has a sibling `html/NN_name.html` that *does* exist
    (checked: 30 of 30 in Part 4). The content is present as HTML, not as
    screenshots.
  - Nothing outside `wow-pages/` links to these gallery indexes. They are
    orphaned but still copied into every published package.

  So the options are real ones — commit the PNGs, repoint the gallery at the
  `html/` siblings, or stop packaging the galleries — and picking among them is
  a content decision, not a mechanical fix. Rewriting 190 `<img>` tags in
  imported vendor artifacts on my own judgement would be the wrong call.

- **`universal-language-selector.html`** references `./universal-language-selector.css`
  and `./universal-language-selector.js`; **neither exists anywhere in the repo**,
  and they are the page's only styling and scripting. The page is inert. It is
  linked from one place.

- **`god-mode-command-center.html`** references `./god-mode-command-center.js`,
  which does not exist (its `.css` does). Nothing links to this page.

### Deliberately *not* counted as a defect

`desktop.js` names 24 of the same missing PNGs, but it never renders them as
`<img>`: `renderReferencePreview()` emits an accessible `role="img"` placeholder
reading "Preview unavailable — Supplied PNG is not present in this checkout"
with the path in a `<code>`. That is already the honest handling, so nothing was
changed there. The ad-hoc probe also flagged `./${app.route}` in
`seis-demo-app-launcher.html`; that string is inside a JS template literal in a
`<script>` block, not a real attribute — a false positive of the probe, not of
the shipped gate.

### Why the gate was not widened to all 475 files

It would go red immediately on the 194 references above, and a gate that fails
on `main` for reasons its own change set cannot fix is not a gate anyone keeps.
Widening it belongs in the same change that resolves the missing assets.

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
