import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import {
  i18nStatus,
  i18nGet,
  i18nSearch,
  contractCheck,
  seoAudit,
  drawingsCatalog,
  runAllChecks,
  styleAudit,
  perfAudit,
  a11yAudit,
} from "../src/lib/checks.mjs";

/* ------------------------------------------------------------------ */
/* Fixture helpers                                                     */
/* ------------------------------------------------------------------ */

let webRoot;

function setup(files) {
  webRoot = path.join(tmpdir(), `seis-test-${process.pid}-${Date.now()}`);
  mkdirSync(webRoot, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    const abs = path.join(webRoot, name);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
  }
  return webRoot;
}

function teardown() {
  rmSync(webRoot, { recursive: true, force: true });
}

const FIVE_LOCALES = (val) => ({ tr: val, en: val, fr: val, it: val, de: val });

const minTranslations = JSON.stringify({
  tr: { "hero.title": "Başlık", "nav.home": "Ana Sayfa" },
  en: { "hero.title": "Title", "nav.home": "Home" },
  fr: { "hero.title": "Titre", "nav.home": "Accueil" },
  it: { "hero.title": "Titolo", "nav.home": "Home" },
  de: { "hero.title": "Titel", "nav.home": "Startseite" },
});

const minHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <title>Test Site — Long Enough Title</title>
  <meta name="description" content="A description long enough for the SEO check to pass (≥30 chars).">
  <link rel="canonical" href="https://example.com/">
  <meta property="og:title" content="Test">
  <meta property="og:description" content="Desc">
  <meta property="og:image" content="img.jpg">
  <meta name="twitter:card" content="summary">
  <link rel="alternate" hreflang="tr" href="/">
  <link rel="alternate" hreflang="en" href="/">
  <link rel="alternate" hreflang="fr" href="/">
  <link rel="alternate" hreflang="it" href="/">
  <link rel="alternate" hreflang="de" href="/">
  <script type="application/ld+json">{}</script>
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#000">
  <meta name="viewport" content="width=device-width">
</head>
<body>
  <h1 id="hero-title" data-i18n="hero.title">Title</h1>
  <nav id="main-nav">
    <a class="nav-link" data-i18n="nav.home">Home</a>
  </nav>
</body>
</html>`;

const minScript = `
"use strict";
function q(sel) { return document.querySelector(sel); }
function qa(sel) { return document.querySelectorAll(sel); }
var title = q("#hero-title");
var nav = q("#main-nav");
var links = qa(".nav-link");
`;

/* ------------------------------------------------------------------ */
/* i18n                                                               */
/* ------------------------------------------------------------------ */

describe("i18nStatus", () => {
  beforeEach(() => setup({
    "translations.json": minTranslations,
    "index.html": minHtml,
    "script.js": minScript,
    "robots.txt": "User-agent: *\nAllow: /",
    "sitemap.xml": "<urlset></urlset>",
  }));
  afterEach(teardown);

  it("passes when all keys are present in every locale", () => {
    const r = i18nStatus(webRoot);
    assert.equal(r.ok, true);
    assert.equal(r.locales.length, 5);
    assert.equal(r.keyCount, 2);
  });

  it("fails when a locale is missing a key", () => {
    const t = JSON.parse(minTranslations);
    delete t.de["nav.home"];
    writeFileSync(path.join(webRoot, "translations.json"), JSON.stringify(t));
    const r = i18nStatus(webRoot);
    assert.equal(r.ok, false);
    assert.ok(r.missingByLocale.de.includes("nav.home"));
  });

  it("flags keys referenced in HTML but absent from translations", () => {
    const t = JSON.parse(minTranslations);
    for (const l of Object.keys(t)) delete t[l]["nav.home"];
    writeFileSync(path.join(webRoot, "translations.json"), JSON.stringify(t));
    const r = i18nStatus(webRoot);
    assert.equal(r.ok, false);
    assert.ok(r.referencedMissing.includes("nav.home"));
  });
});

describe("i18nGet", () => {
  beforeEach(() => setup({ "translations.json": minTranslations, "index.html": minHtml, "script.js": minScript }));
  afterEach(teardown);

  it("returns values for all locales", () => {
    const r = i18nGet(webRoot, "hero.title");
    assert.equal(r.values.tr, "Başlık");
    assert.equal(r.values.en, "Title");
  });

  it("returns null for a missing key", () => {
    const r = i18nGet(webRoot, "does.not.exist");
    assert.equal(r.values.tr, null);
  });
});

describe("i18nSearch", () => {
  beforeEach(() => setup({ "translations.json": minTranslations, "index.html": minHtml, "script.js": minScript }));
  afterEach(teardown);

  it("finds keys by key name fragment", () => {
    const r = i18nSearch(webRoot, "hero");
    assert.equal(r.count, 1);
    assert.equal(r.hits[0].key, "hero.title");
  });

  it("finds keys by value fragment", () => {
    const r = i18nSearch(webRoot, "Titel"); // German value
    assert.equal(r.count, 1);
  });

  it("returns empty when no match", () => {
    const r = i18nSearch(webRoot, "zzznomatch");
    assert.equal(r.count, 0);
  });
});

/* ------------------------------------------------------------------ */
/* Contract                                                           */
/* ------------------------------------------------------------------ */

describe("contractCheck", () => {
  afterEach(teardown);

  it("passes when all selectors resolve to HTML elements", () => {
    setup({ "index.html": minHtml, "script.js": minScript });
    const r = contractCheck(webRoot);
    assert.equal(r.ok, true);
    assert.deepEqual(r.missing, []);
  });

  it("fails when a referenced id is absent from HTML", () => {
    const js = 'var x = q("#ghost-element");';
    setup({ "index.html": minHtml, "script.js": js });
    const r = contractCheck(webRoot);
    assert.equal(r.ok, false);
    assert.ok(r.missing.some((m) => m.selector === "#ghost-element"));
  });

  it("passes for compound class selectors — checks only leading class", () => {
    // .nav-link.active — .nav-link is in HTML, .active is runtime-added
    const js = 'var x = q(".nav-link.active");';
    setup({ "index.html": minHtml, "script.js": js });
    const r = contractCheck(webRoot);
    assert.equal(r.ok, true);
  });

  it("passes for pseudo-class selectors — checks only the base class", () => {
    // .nav-link:not(.active) — base class exists in HTML
    const js = 'var x = qa(".nav-link:not(.active)");';
    setup({ "index.html": minHtml, "script.js": js });
    const r = contractCheck(webRoot);
    assert.equal(r.ok, true);
  });

  it("passes when the id is dynamically created by the script", () => {
    const js = `
      document.getElementById("ghost-element");
      var el = document.createElement("div");
      el.id = "ghost-element";
    `;
    setup({ "index.html": minHtml, "script.js": js });
    const r = contractCheck(webRoot);
    assert.equal(r.ok, true);
  });

  it("passes when the class is added via classList.add", () => {
    const js = `
      var x = q(".runtime-class");
      x.classList.add("runtime-class");
    `;
    setup({ "index.html": minHtml, "script.js": js });
    const r = contractCheck(webRoot);
    assert.equal(r.ok, true);
  });
});

/* ------------------------------------------------------------------ */
/* SEO audit                                                          */
/* ------------------------------------------------------------------ */

describe("seoAudit", () => {
  afterEach(teardown);

  it("passes with complete SEO markup", () => {
    setup({ "index.html": minHtml, "robots.txt": "User-agent: *", "sitemap.xml": "<urlset/>" });
    const r = seoAudit(webRoot);
    assert.equal(r.ok, true);
    assert.equal(r.failed.length, 0);
  });

  it("fails when robots.txt is absent", () => {
    setup({ "index.html": minHtml });
    const r = seoAudit(webRoot);
    assert.ok(r.failed.includes("robots"));
  });

  it("fails when meta description is too short", () => {
    const html = minHtml.replace(
      /meta name="description" content="[^"]+"/,
      'meta name="description" content="short"'
    );
    setup({ "index.html": html, "robots.txt": "x", "sitemap.xml": "x" });
    const r = seoAudit(webRoot);
    assert.ok(r.failed.includes("meta-description"));
  });
});

/* ------------------------------------------------------------------ */
/* Drawings                                                           */
/* ------------------------------------------------------------------ */

describe("drawingsCatalog", () => {
  afterEach(teardown);

  it("passes when all referenced images exist on disk", () => {
    const html = `<img src="public/media/drawings/test.jpg">`;
    setup({
      "index.html": html,
      "public/media/drawings/test.jpg": "fakejpg",
    });
    const r = drawingsCatalog(webRoot);
    assert.equal(r.ok, true);
    assert.equal(r.missingOnDisk.length, 0);
  });

  it("fails when a referenced image is missing from disk", () => {
    const html = `<img src="public/media/drawings/ghost.jpg">`;
    setup({ "index.html": html });
    const r = drawingsCatalog(webRoot);
    assert.equal(r.ok, false);
    assert.ok(r.missingOnDisk.includes("public/media/drawings/ghost.jpg"));
  });

  it("passes with no drawings referenced and no drawings dir", () => {
    setup({ "index.html": "<html></html>" });
    const r = drawingsCatalog(webRoot);
    assert.equal(r.ok, true);
  });
});

/* ------------------------------------------------------------------ */
/* Style audit                                                        */
/* ------------------------------------------------------------------ */

describe("styleAudit", () => {
  afterEach(teardown);

  it("passes when every var() is defined", () => {
    setup({
      "style.css": ":root { --accent: #fff; } .nav-link { color: var(--accent); }",
      "index.html": minHtml,
      "script.js": minScript,
    });
    const r = styleAudit(webRoot);
    assert.equal(r.ok, true);
    assert.deepEqual(r.undefinedVars, []);
  });

  it("fails when a var() has no definition anywhere", () => {
    setup({
      "style.css": ".nav-link { color: var(--ghost-color); }",
      "index.html": minHtml,
      "script.js": minScript,
    });
    const r = styleAudit(webRoot);
    assert.equal(r.ok, false);
    assert.deepEqual(r.undefinedVars, ["ghost-color"]);
  });

  it("accepts vars defined via JS setProperty", () => {
    setup({
      "style.css": ".nav-link { left: var(--cursor-x); }",
      "index.html": minHtml,
      "script.js": minScript + '\ndocument.body.style.setProperty("--cursor-x", "0px");',
    });
    const r = styleAudit(webRoot);
    assert.equal(r.ok, true);
  });

  it("reports statically-unused CSS classes as informational", () => {
    setup({
      "style.css": ".nav-link { color: red; } .never-used { color: blue; }",
      "index.html": minHtml,
      "script.js": minScript,
    });
    const r = styleAudit(webRoot);
    assert.equal(r.ok, true); // informational — does not fail
    assert.deepEqual(r.unusedCss, ["never-used"]);
  });

  it("counts classList-managed classes as used", () => {
    setup({
      "style.css": ".runtime-only { opacity: 0; }",
      "index.html": minHtml,
      "script.js": minScript + '\nel.classList.add("runtime-only");',
    });
    const r = styleAudit(webRoot);
    assert.deepEqual(r.unusedCss, []);
  });

  it("skips gracefully when style.css is absent", () => {
    setup({ "index.html": minHtml, "script.js": minScript });
    const r = styleAudit(webRoot);
    assert.equal(r.ok, true);
    assert.equal(r.skipped, true);
  });

  it("handles nested @media blocks when harvesting selectors", () => {
    setup({
      "style.css": "@media (hover: hover) { .nav-link:hover { color: var(--accent); } } :root { --accent: red; }",
      "index.html": minHtml,
      "script.js": minScript,
    });
    const r = styleAudit(webRoot);
    assert.equal(r.ok, true);
    assert.deepEqual(r.unusedCss, []);
  });
});

/* ------------------------------------------------------------------ */
/* Performance audit                                                  */
/* ------------------------------------------------------------------ */

describe("perfAudit", () => {
  afterEach(teardown);

  it("passes with small files and no render-blocking scripts", () => {
    setup({ "index.html": minHtml, "style.css": ".x{color:red}", "script.js": "var x=1;" });
    const r = perfAudit(webRoot);
    assert.equal(r.ok, true);
    assert.equal(r.budgetViolations.length, 0);
    assert.equal(r.renderBlockingScripts.length, 0);
  });

  it("fails when index.html exceeds the HTML budget", () => {
    const bigHtml = minHtml + " ".repeat(100 * 1024 + 1);
    setup({ "index.html": bigHtml, "style.css": "", "script.js": "" });
    const r = perfAudit(webRoot);
    assert.equal(r.ok, false);
    assert.ok(r.budgetViolations.some((v) => v.file === "index.html"));
  });

  it("fails when a render-blocking script is in <head>", () => {
    const html = minHtml.replace(
      "</head>",
      '<script src="vendor.js"></script>\n</head>'
    );
    setup({ "index.html": html, "style.css": "", "script.js": "" });
    const r = perfAudit(webRoot);
    assert.equal(r.ok, false);
    assert.ok(r.renderBlockingScripts.includes("vendor.js"));
  });

  it("does not flag a deferred script as render-blocking", () => {
    const html = minHtml.replace(
      "</head>",
      '<script src="app.js" defer></script>\n</head>'
    );
    setup({ "index.html": html, "style.css": "", "script.js": "" });
    const r = perfAudit(webRoot);
    assert.equal(r.renderBlockingScripts.length, 0);
  });

  it("reports images without loading=lazy as advisory, not failure", () => {
    const html = minHtml.replace(
      "</body>",
      '<img src="photo.jpg" width="100" height="100">\n</body>'
    );
    setup({ "index.html": html, "style.css": "", "script.js": "" });
    const r = perfAudit(webRoot);
    assert.equal(r.ok, true);
    assert.ok(r.imgsWithoutLazy.includes("photo.jpg"));
  });

  it("does not flag an image with loading=lazy", () => {
    const html = minHtml.replace(
      "</body>",
      '<img src="photo.jpg" loading="lazy" width="100" height="100">\n</body>'
    );
    setup({ "index.html": html, "style.css": "", "script.js": "" });
    const r = perfAudit(webRoot);
    assert.equal(r.imgsWithoutLazy.length, 0);
  });

  it("returns zero bytes for absent files, still passes", () => {
    setup({ "index.html": minHtml });
    const r = perfAudit(webRoot);
    assert.equal(r.cssBytes, 0);
    assert.equal(r.jsBytes, 0);
    assert.equal(r.ok, true);
  });
});

/* ------------------------------------------------------------------ */
/* Accessibility audit                                               */
/* ------------------------------------------------------------------ */

describe("a11yAudit", () => {
  afterEach(teardown);

  it("passes with clean HTML (no imgs, no inputs, no buttons)", () => {
    setup({ "index.html": minHtml, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.ok, true);
    assert.equal(r.imgsWithoutAlt.length, 0);
    assert.equal(r.unlabeledInputs.length, 0);
    assert.equal(r.inaccessibleButtons.length, 0);
  });

  it("fails when an img is missing the alt attribute", () => {
    const html = minHtml.replace("</body>", '<img src="photo.jpg">\n</body>');
    setup({ "index.html": html, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.ok, false);
    assert.ok(r.imgsWithoutAlt.includes("photo.jpg"));
  });

  it("passes for img with alt='' (decorative)", () => {
    const html = minHtml.replace("</body>", '<img src="deco.jpg" alt="">\n</body>');
    setup({ "index.html": html, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.imgsWithoutAlt.length, 0);
  });

  it("fails when an input has no label", () => {
    const html = minHtml.replace("</body>", '<input type="text" id="name-field">\n</body>');
    setup({ "index.html": html, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.ok, false);
    assert.ok(r.unlabeledInputs.includes("#name-field"));
  });

  it("passes when an input is associated via <label for>", () => {
    const html = minHtml.replace("</body>", '<label for="nm">Name</label><input type="text" id="nm">\n</body>');
    setup({ "index.html": html, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.unlabeledInputs.length, 0);
  });

  it("passes when an input has aria-label", () => {
    const html = minHtml.replace("</body>", '<input type="email" aria-label="Email address">\n</body>');
    setup({ "index.html": html, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.unlabeledInputs.length, 0);
  });

  it("fails when a button has no accessible name", () => {
    const html = minHtml.replace("</body>", '<button class="icon-btn"></button>\n</body>');
    setup({ "index.html": html, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.ok, false);
    assert.ok(r.inaccessibleButtons.includes(".icon-btn"));
  });

  it("passes for button with aria-label", () => {
    const html = minHtml.replace("</body>", '<button aria-label="Close dialog"></button>\n</body>');
    setup({ "index.html": html, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.inaccessibleButtons.length, 0);
  });

  it("passes for button with data-i18n (runtime text)", () => {
    const html = minHtml.replace("</body>", '<button data-i18n="action.submit"></button>\n</body>');
    setup({ "index.html": html, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.inaccessibleButtons.length, 0);
  });

  it("passes for button with aria-hidden (intentionally decorative)", () => {
    const html = minHtml.replace("</body>", '<button aria-hidden="true"></button>\n</body>');
    setup({ "index.html": html, "script.js": minScript });
    const r = a11yAudit(webRoot);
    assert.equal(r.inaccessibleButtons.length, 0);
  });
});

/* ------------------------------------------------------------------ */
/* runAllChecks                                                       */
/* ------------------------------------------------------------------ */

describe("runAllChecks", () => {
  it("aggregates ok=true when every sub-check passes", () => {
    setup({
      "translations.json": minTranslations,
      "index.html": minHtml,
      "script.js": minScript,
      "style.css": ":root { --bg: #000; } .nav-link { color: var(--bg); }",
      "robots.txt": "User-agent: *",
      "sitemap.xml": "<urlset/>",
    });
    const r = runAllChecks(webRoot);
    assert.equal(r.ok, true);
    assert.equal(r.i18n.ok, true);
    assert.equal(r.seo.ok, true);
    assert.equal(r.contract.ok, true);
    assert.equal(r.drawings.ok, true);
    assert.equal(r.style.ok, true);
    assert.equal(r.perf.ok, true);
    assert.equal(r.a11y.ok, true);
    teardown();
  });

  it("aggregates ok=false when the style check fails", () => {
    setup({
      "translations.json": minTranslations,
      "index.html": minHtml,
      "script.js": minScript,
      "style.css": ".nav-link { color: var(--missing-var); }",
      "robots.txt": "User-agent: *",
      "sitemap.xml": "<urlset/>",
    });
    const r = runAllChecks(webRoot);
    assert.equal(r.ok, false);
    assert.equal(r.style.ok, false);
    assert.equal(r.perf.ok, true);
    assert.equal(r.a11y.ok, true);
    teardown();
  });

  it("aggregates ok=false when the perf check fails", () => {
    setup({
      "translations.json": minTranslations,
      "index.html": minHtml.replace("</head>", '<script src="vendor.js"></script>\n</head>'),
      "script.js": minScript,
      "style.css": ":root { --bg: #000; } .nav-link { color: var(--bg); }",
      "robots.txt": "User-agent: *",
      "sitemap.xml": "<urlset/>",
    });
    const r = runAllChecks(webRoot);
    assert.equal(r.ok, false);
    assert.equal(r.perf.ok, false);
    assert.ok(r.perf.renderBlockingScripts.includes("vendor.js"));
    teardown();
  });

  it("aggregates ok=false when the a11y check fails", () => {
    setup({
      "translations.json": minTranslations,
      "index.html": minHtml.replace("</body>", '<img src="logo.png">\n</body>'),
      "script.js": minScript,
      "style.css": ":root { --bg: #000; } .nav-link { color: var(--bg); }",
      "robots.txt": "User-agent: *",
      "sitemap.xml": "<urlset/>",
    });
    const r = runAllChecks(webRoot);
    assert.equal(r.ok, false);
    assert.equal(r.a11y.ok, false);
    assert.ok(r.a11y.imgsWithoutAlt.includes("logo.png"));
    teardown();
  });
});
