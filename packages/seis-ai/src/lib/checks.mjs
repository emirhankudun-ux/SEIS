import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

function readWebFile(webRoot, name) {
  return readFileSync(path.join(webRoot, name), "utf8");
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

/* ------------------------------------------------------------------ */
/* i18n                                                               */
/* ------------------------------------------------------------------ */

export function loadTranslations(webRoot) {
  return JSON.parse(readWebFile(webRoot, "translations.json"));
}

/**
 * Extract every i18n key referenced statically by the site:
 * data-i18n / data-i18n-placeholder / data-i18n-aria-label attributes in
 * index.html plus literal getT("...") calls in script.js. Keys built by
 * string concatenation at runtime cannot be detected statically.
 */
export function collectReferencedI18nKeys(webRoot) {
  const html = readWebFile(webRoot, "index.html");
  const js = readWebFile(webRoot, "script.js");
  const keys = [];
  for (const match of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) {
    keys.push(match[1]);
  }
  for (const match of js.matchAll(/getT\(\s*"([^"]+)"/g)) {
    keys.push(match[1]);
  }
  return uniqueSorted(keys);
}

/**
 * Key-parity report for translations.json.
 * Fails when: locales disagree on keys, a referenced key is missing from
 * any locale, or a value is empty in every locale (a key that is
 * intentionally empty in SOME locales, like a grammatical suffix, is fine).
 */
export function i18nStatus(webRoot) {
  const translations = loadTranslations(webRoot);
  const locales = Object.keys(translations);
  const allKeys = uniqueSorted(locales.flatMap((l) => Object.keys(translations[l])));
  const referenced = collectReferencedI18nKeys(webRoot);

  const missingByLocale = {};
  for (const locale of locales) {
    const missing = allKeys.filter((k) => !(k in translations[locale]));
    if (missing.length) {
      missingByLocale[locale] = missing;
    }
  }

  const referencedMissing = referenced.filter((key) =>
    locales.some((l) => !(key in translations[l]))
  );
  const emptyEverywhere = allKeys.filter((key) =>
    locales.every((l) => String(translations[l][key] ?? "") === "")
  );
  const unreferenced = allKeys.filter((k) => !referenced.includes(k));

  const ok =
    Object.keys(missingByLocale).length === 0 &&
    referencedMissing.length === 0 &&
    emptyEverywhere.length === 0;

  return {
    ok,
    locales,
    keyCount: allKeys.length,
    referencedCount: referenced.length,
    missingByLocale,
    referencedMissing,
    emptyEverywhere,
    unreferenced,
  };
}

export function i18nGet(webRoot, key) {
  const translations = loadTranslations(webRoot);
  const values = {};
  for (const locale of Object.keys(translations)) {
    values[locale] = translations[locale][key] ?? null;
  }
  return { key, values };
}

export function i18nSearch(webRoot, query) {
  const translations = loadTranslations(webRoot);
  const locales = Object.keys(translations);
  const needle = String(query).toLowerCase();
  const hits = [];
  const seen = new Set();
  for (const locale of locales) {
    for (const [key, value] of Object.entries(translations[locale])) {
      if (seen.has(key)) continue;
      if (
        key.toLowerCase().includes(needle) ||
        String(value).toLowerCase().includes(needle)
      ) {
        seen.add(key);
        hits.push({ key, values: Object.fromEntries(locales.map((l) => [l, translations[l][key] ?? null])) });
      }
    }
  }
  return { query, count: hits.length, hits: hits.slice(0, 40) };
}

/* ------------------------------------------------------------------ */
/* SEO                                                                */
/* ------------------------------------------------------------------ */

export function seoAudit(webRoot) {
  const html = readWebFile(webRoot, "index.html");
  const has = (re) => re.test(html);
  const checks = [
    { id: "title", ok: has(/<title>[^<]{10,}<\/title>/), detail: "<title> present and non-trivial" },
    { id: "meta-description", ok: has(/<meta\s+name="description"\s+content="[^"]{30,}"/), detail: "meta description ≥ 30 chars" },
    { id: "canonical", ok: has(/<link\s+rel="canonical"/), detail: "canonical link" },
    { id: "og-title", ok: has(/property="og:title"/), detail: "Open Graph title" },
    { id: "og-description", ok: has(/property="og:description"/), detail: "Open Graph description" },
    { id: "og-image", ok: has(/property="og:image"/), detail: "Open Graph image" },
    { id: "twitter-card", ok: has(/name="twitter:card"/), detail: "Twitter card" },
    { id: "hreflang", ok: (html.match(/hreflang="/g) || []).length >= 5, detail: "≥ 5 hreflang alternates" },
    { id: "json-ld", ok: has(/application\/ld\+json/), detail: "Schema.org JSON-LD" },
    { id: "manifest", ok: has(/<link\s+rel="manifest"/), detail: "PWA manifest link" },
    { id: "theme-color", ok: has(/name="theme-color"/), detail: "theme-color meta" },
    { id: "viewport", ok: has(/name="viewport"/), detail: "viewport meta" },
    { id: "lang-attr", ok: has(/<html\s+lang="/), detail: "html lang attribute" },
    { id: "robots", ok: existsSync(path.join(webRoot, "robots.txt")), detail: "robots.txt exists" },
    { id: "sitemap", ok: existsSync(path.join(webRoot, "sitemap.xml")), detail: "sitemap.xml exists" },
  ];
  const failed = checks.filter((c) => !c.ok);
  return { ok: failed.length === 0, checks, failed: failed.map((c) => c.id) };
}

/* ------------------------------------------------------------------ */
/* HTML <-> JS contract                                               */
/* ------------------------------------------------------------------ */

/**
 * Verify that every element selector referenced from script.js exists in
 * index.html. This is the regression class that previously broke the site:
 * markup rewritten without honouring the IDs/classes the script expects.
 *
 * A selector counts as satisfied when the id/class appears in index.html,
 * or when script.js itself creates it (className/classList/innerHTML/
 * createElement usage mentions the bare name outside the query call).
 */
export function contractCheck(webRoot) {
  const html = readWebFile(webRoot, "index.html");
  const js = readWebFile(webRoot, "script.js");

  const htmlIds = new Set([...html.matchAll(/\sid="([^"\s]+)"/g)].map((m) => m[1]));
  const htmlClasses = new Set(
    [...html.matchAll(/\sclass="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/))
  );

  // Selectors referenced via q("...") / qa("...") / querySelector("...").
  const selectorLiterals = [
    ...js.matchAll(/\bqa?\(\s*"([^"]+)"/g),
    ...js.matchAll(/querySelector(?:All)?\(\s*"([^"]+)"/g),
  ].map((m) => m[1]);

  const missing = [];
  const checked = new Set();
  for (const literal of selectorLiterals) {
    // Split compound selector lists ("a, button") and inspect each simple
    // selector's leading id/class token. Descendant/attribute parts are
    // skipped — presence of the leading token is the contract we enforce.
    for (const part of literal.split(",")) {
      // Extract the first #id or .class, stopping at pseudo-classes (:),
      // combinators, attribute brackets, and compound-class dots so that
      // selectors like ".form-group.invalid" or ".card:not(.hidden)" resolve
      // to ".form-group" and ".card" respectively — the static HTML contract.
      const tokenMatch = part.trim().match(/^([#.][^#.:\s>+~[\]()]+)/);
      const token = tokenMatch ? tokenMatch[1] : part.trim().split(/[\s>+~[:.]/)[0];
      if (!token || checked.has(token)) continue;
      checked.add(token);
      if (token.startsWith("#")) {
        const id = token.slice(1);
        if (!htmlIds.has(id) && !jsCreates(js, id)) {
          missing.push({ selector: token, kind: "id" });
        }
      } else if (token.startsWith(".")) {
        const cls = token.slice(1);
        if (!htmlClasses.has(cls) && !jsCreates(js, cls)) {
          missing.push({ selector: token, kind: "class" });
        }
      }
    }
  }

  return {
    ok: missing.length === 0,
    checkedSelectors: checked.size,
    htmlIds: htmlIds.size,
    htmlClasses: htmlClasses.size,
    missing,
  };
}

function jsCreates(js, name) {
  // The name appearing in a string assignment/manipulation context outside
  // a selector means the script constructs that element itself.
  const creationPatterns = [
    `classList.add("${name}"`,
    `classList.toggle("${name}"`,
    `className = "${name}`,
    `className += " ${name}`,
    `class=\\"${name}`,
    `class="${name}`,
    `id = "${name}"`,
    `setAttribute("id", "${name}")`,
  ];
  if (creationPatterns.some((p) => js.includes(p))) {
    return true;
  }
  // innerHTML templates often hold multi-class strings.
  const innerHtmlClass = new RegExp(`class=\\\\?"[^"]*\\b${escapeRe(name)}\\b`);
  return innerHtmlClass.test(js);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ------------------------------------------------------------------ */
/* Drawings / media                                                   */
/* ------------------------------------------------------------------ */

/**
 * Catalogue drawing images on disk and cross-check the <img> sources in
 * index.html so a renamed or missing file is caught before deploy.
 */
export function drawingsCatalog(webRoot) {
  const html = readWebFile(webRoot, "index.html");
  const drawingsDir = path.join(webRoot, "public", "media", "drawings");

  const files = [];
  if (existsSync(drawingsDir)) {
    walk(drawingsDir, files);
  }
  const fileSet = new Set(files.map((f) => f.path));

  const referenced = uniqueSorted(
    [...html.matchAll(/(?:src|data-src)="(public\/media\/drawings\/[^"]+)"/g)].map((m) => m[1])
  );
  const missingOnDisk = referenced.filter((rel) => !fileSet.has(rel));
  const unreferencedOnDisk = files
    .map((f) => f.path)
    .filter((rel) => !referenced.includes(rel));

  return {
    ok: missingOnDisk.length === 0,
    fileCount: files.length,
    totalBytes: files.reduce((sum, f) => sum + f.bytes, 0),
    referencedCount: referenced.length,
    missingOnDisk,
    unreferencedOnDisk,
    files,
  };

  function walk(dir, out) {
    for (const entry of readdirSync(dir)) {
      const abs = path.join(dir, entry);
      const st = statSync(abs);
      if (st.isDirectory()) {
        walk(abs, out);
      } else if (/\.(jpe?g|png|webp|gif|avif|svg)$/i.test(entry)) {
        out.push({ path: path.relative(webRoot, abs).split(path.sep).join("/"), bytes: st.size });
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Style                                                              */
/* ------------------------------------------------------------------ */

/**
 * Static CSS audit for style.css:
 * - undefined custom properties: var(--x) used with no --x definition in
 *   CSS, an inline HTML style, or a JS setProperty call — these silently
 *   compute to invalid/fallback values, so they FAIL the check.
 * - unused CSS classes and HTML classes with no styling are reported as
 *   informational only (JS hooks and runtime-built class strings make a
 *   static "unused" verdict unreliable).
 */
export function styleAudit(webRoot) {
  const cssPath = path.join(webRoot, "style.css");
  if (!existsSync(cssPath)) {
    return { ok: true, skipped: true };
  }
  const css = readFileSync(cssPath, "utf8");
  const html = readWebFile(webRoot, "index.html");
  const js = readWebFile(webRoot, "script.js");

  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // Reduce to selector text by repeatedly dropping innermost {...} blocks
  // (handles @media / @keyframes nesting), then harvest .class tokens.
  let selectorText = noComments;
  let prev;
  do {
    prev = selectorText;
    selectorText = selectorText.replace(/\{[^{}]*\}/g, " ");
  } while (selectorText !== prev);

  const cssClasses = new Set(
    [...selectorText.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1])
  );

  const htmlClasses = new Set(
    [...html.matchAll(/\sclass="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/))
  );
  const jsClasses = new Set();
  for (const m of js.matchAll(/classList\.(?:add|remove|toggle|contains)\(\s*"([^"]+)"/g)) {
    jsClasses.add(m[1]);
  }
  for (const m of js.matchAll(/\bqa?\(\s*"\.([a-zA-Z_][\w-]*)/g)) jsClasses.add(m[1]);
  for (const m of js.matchAll(/class=\\?"([^"\\]+)/g)) {
    for (const c of m[1].split(/\s+/)) jsClasses.add(c);
  }
  for (const m of js.matchAll(/className\s*[+]?=\s*"\s*([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) jsClasses.add(c);
  }
  const used = new Set([...htmlClasses, ...jsClasses]);

  const unusedCss = [...cssClasses].filter((c) => !used.has(c)).sort();
  const unstyledHtml = [...htmlClasses].filter((c) => !cssClasses.has(c)).sort();

  // Custom properties: definitions can live in CSS, inline HTML styles, or
  // JS style.setProperty("--x", ...) calls.
  const definedVars = new Set([...noComments.matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]));
  for (const m of html.matchAll(/--([\w-]+)\s*:/g)) definedVars.add(m[1]);
  for (const m of js.matchAll(/setProperty\(\s*["']--([\w-]+)["']/g)) definedVars.add(m[1]);
  const usedVars = new Set([...noComments.matchAll(/var\(\s*--([\w-]+)/g)].map((m) => m[1]));
  const undefinedVars = [...usedVars].filter((v) => !definedVars.has(v)).sort();
  const unusedVars = [...definedVars].filter((v) => !usedVars.has(v)).sort();

  return {
    ok: undefinedVars.length === 0,
    cssClassCount: cssClasses.size,
    definedVarCount: definedVars.size,
    undefinedVars,
    unusedVars,
    unusedCss,
    unstyledHtml,
  };
}

/* ------------------------------------------------------------------ */
/* Accessibility                                                      */
/* ------------------------------------------------------------------ */

/**
 * Static accessibility audit for index.html:
 * FAILS on: <img> missing alt=, interactive <input>/<select>/<textarea>
 *   without an associated label, and <button> with no accessible name.
 * Advisory (no FAIL): positive tabindex values that break natural focus order.
 *
 * The audit understands SEIS conventions:
 * - data-i18n / data-i18n-aria-label count as providing accessible text at runtime.
 * - aria-hidden="true" on a button marks it intentionally invisible to screen readers.
 */
export function a11yAudit(webRoot) {
  const html = readWebFile(webRoot, "index.html");

  // 1. <img> missing alt= entirely (alt="" is fine for decorative images)
  const imgsWithoutAlt = [...html.matchAll(/<img\b[^>]*>/g)]
    .filter((m) => !/\balt=/.test(m[0]))
    .map((m) => {
      const s = m[0].match(/(?:src|data-src)="([^"]+)"/);
      return s ? s[1] : "(no src)";
    });

  // 2. Interactive form controls without an associated label
  const labeledIds = new Set(
    [...html.matchAll(/<label\s[^>]*\bfor="([^"]+)"/g)].map((m) => m[1])
  );
  const TEXT_INPUT_RE = /^(text|email|tel|password|search|url|number|date|time|month|week)$/i;

  function isLabeled(attrs) {
    if (/\baria-label=/.test(attrs) || /\baria-labelledby=/.test(attrs)) return true;
    if (/\baria-hidden="true"/.test(attrs)) return true;
    const idM = attrs.match(/\bid="([^"]+)"/);
    return idM ? labeledIds.has(idM[1]) : false;
  }

  const unlabeledInputs = [];
  for (const m of html.matchAll(/<input\b([^>]*)>/g)) {
    const attrs = m[1];
    const typeM = attrs.match(/\btype="([^"]+)"/i);
    const type = typeM ? typeM[1] : "text";
    if (!TEXT_INPUT_RE.test(type)) continue;
    if (isLabeled(attrs)) continue;
    const idM = attrs.match(/\bid="([^"]+)"/);
    unlabeledInputs.push(idM ? `#${idM[1]}` : `(input[type="${type}"])`);
  }
  for (const m of html.matchAll(/<(?:select|textarea)\b([^>]*)>/g)) {
    if (isLabeled(m[1])) continue;
    const idM = m[1].match(/\bid="([^"]+)"/);
    unlabeledInputs.push(idM ? `#${idM[1]}` : `(${m[0].split(" ")[0].replace("<", "")})`);
  }

  // 3. <button> with no accessible name
  const inaccessibleButtons = [];
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const attrs = m[1];
    const innerHtml = m[2];
    if (/\baria-hidden="true"/.test(attrs)) continue;
    if (/\baria-label=/.test(attrs) || /\bdata-i18n-aria-label=/.test(attrs)) continue;
    if (/\bdata-i18n=/.test(attrs) || /\btitle=/.test(attrs)) continue;
    if (/\bdata-i18n=/.test(innerHtml)) continue;
    const innerText = innerHtml.replace(/<[^>]+>/g, "").trim();
    if (innerText) continue;
    const idM = attrs.match(/\bid="([^"]+)"/);
    const classM = attrs.match(/\bclass="([^"]+)"/);
    inaccessibleButtons.push(
      idM ? `#${idM[1]}` : classM ? `.${classM[1].trim().split(/\s+/)[0]}` : "(unnamed button)"
    );
  }

  // 4. Positive tabindex — breaks natural focus order (advisory only)
  const positiveTabindex = [...html.matchAll(/\btabindex="([0-9]+)"/g)]
    .filter((m) => parseInt(m[1]) > 0)
    .map((m) => parseInt(m[1]));

  return {
    ok: imgsWithoutAlt.length === 0 && unlabeledInputs.length === 0 && inaccessibleButtons.length === 0,
    imgsWithoutAlt,
    unlabeledInputs,
    inaccessibleButtons,
    positiveTabindex,
  };
}

/* ------------------------------------------------------------------ */
/* Performance budget                                                */
/* ------------------------------------------------------------------ */

const PERF_BUDGETS_BYTES = {
  html:  100 * 1024,  // 100 KB
  css:   100 * 1024,  // 100 KB
  js:    150 * 1024,  // 150 KB
  total: 300 * 1024,  // 300 KB
};

/**
 * Static performance budget checker for apps/web:
 * FAILS on: file size budget violations, render-blocking <script src> in <head>.
 * Advisory (no FAIL): images without loading="lazy", images missing width+height.
 */
export function perfAudit(webRoot) {
  function fileBytes(name) {
    const p = path.join(webRoot, name);
    try { return statSync(p).size; } catch { return 0; }
  }

  const htmlBytes  = fileBytes("index.html");
  const cssBytes   = fileBytes("style.css");
  const jsBytes    = fileBytes("script.js");
  const totalBytes = htmlBytes + cssBytes + jsBytes;

  const htmlPath = path.join(webRoot, "index.html");
  const html = existsSync(htmlPath) ? readFileSync(htmlPath, "utf8") : "";

  // Extract content before <body> as the <head> region.
  const bodyStart = html.search(/<body/i);
  const headHtml = bodyStart >= 0 ? html.slice(0, bodyStart) : html;

  // Render-blocking: <script src="..."> in head without defer or async.
  const renderBlockingScripts = [];
  for (const m of headHtml.matchAll(/<script\s[^>]*src="([^"]+)"[^>]*>/g)) {
    if (!/\b(?:defer|async)\b/.test(m[0])) {
      renderBlockingScripts.push(m[1]);
    }
  }

  // Images without loading="lazy" and without explicit dimensions.
  const allImgTags = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const imgsWithoutLazy = allImgTags
    .filter((tag) => !/\bloading=["']lazy["']/.test(tag))
    .map((tag) => {
      const s = tag.match(/(?:src|data-src)="([^"]+)"/);
      return s ? s[1] : "(no src)";
    });
  const imgsWithoutDimensions = allImgTags
    .filter((tag) => !/\bwidth=/.test(tag) || !/\bheight=/.test(tag))
    .map((tag) => {
      const s = tag.match(/(?:src|data-src)="([^"]+)"/);
      return s ? s[1] : "(no src)";
    });

  const budgetViolations = [];
  if (htmlBytes  > PERF_BUDGETS_BYTES.html)  budgetViolations.push({ file: "index.html", bytes: htmlBytes,  budget: PERF_BUDGETS_BYTES.html });
  if (cssBytes   > PERF_BUDGETS_BYTES.css)   budgetViolations.push({ file: "style.css",  bytes: cssBytes,   budget: PERF_BUDGETS_BYTES.css });
  if (jsBytes    > PERF_BUDGETS_BYTES.js)    budgetViolations.push({ file: "script.js",  bytes: jsBytes,    budget: PERF_BUDGETS_BYTES.js });
  if (totalBytes > PERF_BUDGETS_BYTES.total) budgetViolations.push({ file: "(total)",    bytes: totalBytes, budget: PERF_BUDGETS_BYTES.total });

  return {
    ok: budgetViolations.length === 0 && renderBlockingScripts.length === 0,
    htmlBytes,
    cssBytes,
    jsBytes,
    totalBytes,
    budgets: PERF_BUDGETS_BYTES,
    budgetViolations,
    renderBlockingScripts,
    imgsWithoutLazy,
    imgsWithoutDimensions,
  };
}

/* ------------------------------------------------------------------ */
/* Site config                                                        */
/* ------------------------------------------------------------------ */

export function siteConfig(webRoot) {
  return JSON.parse(readWebFile(webRoot, "site-config.json"));
}

/* ------------------------------------------------------------------ */
/* Aggregate                                                          */
/* ------------------------------------------------------------------ */

export function runAllChecks(webRoot) {
  const i18n = i18nStatus(webRoot);
  const seo = seoAudit(webRoot);
  const contract = contractCheck(webRoot);
  const drawings = drawingsCatalog(webRoot);
  const style = styleAudit(webRoot);
  const perf = perfAudit(webRoot);
  const a11y = a11yAudit(webRoot);
  return {
    ok: i18n.ok && seo.ok && contract.ok && drawings.ok && style.ok && perf.ok && a11y.ok,
    i18n,
    seo,
    contract,
    drawings,
    style,
    perf,
    a11y,
  };
}
