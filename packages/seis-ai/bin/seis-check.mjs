#!/usr/bin/env node
import { watch } from "node:fs";
import { resolveRepoRoot, resolveWebRoot } from "../src/lib/repo.mjs";
import { runAllChecks } from "../src/lib/checks.mjs";

const args = process.argv.slice(2);
const watchMode = args.includes("--watch") || args.includes("-w");

const repoRoot = resolveRepoRoot();
const webRoot = resolveWebRoot(repoRoot);

const mark = (ok) => (ok ? "PASS" : "FAIL");

function printReport(report) {
  const ts = watchMode ? `[${new Date().toLocaleTimeString()}] ` : "";
  console.log(`${ts}SEIS web audit — ${webRoot}`);
  console.log("");
  console.log(`[${mark(report.i18n.ok)}] i18n      ${report.i18n.locales.length} locales × ${report.i18n.keyCount} keys, ${report.i18n.referencedCount} referenced`);
  if (Object.keys(report.i18n.missingByLocale).length) {
    for (const [locale, keys] of Object.entries(report.i18n.missingByLocale)) {
      console.log(`        missing in ${locale}: ${keys.join(", ")}`);
    }
  }
  if (report.i18n.referencedMissing.length) {
    console.log(`        referenced but undefined: ${report.i18n.referencedMissing.join(", ")}`);
  }
  if (report.i18n.emptyEverywhere.length) {
    console.log(`        empty in every locale: ${report.i18n.emptyEverywhere.join(", ")}`);
  }

  console.log(`[${mark(report.seo.ok)}] seo       ${report.seo.checks.length - report.seo.failed.length}/${report.seo.checks.length} checks`);
  for (const id of report.seo.failed) {
    console.log(`        failed: ${id}`);
  }

  console.log(`[${mark(report.contract.ok)}] contract  ${report.contract.checkedSelectors} selectors vs ${report.contract.htmlIds} ids / ${report.contract.htmlClasses} classes`);
  for (const miss of report.contract.missing) {
    console.log(`        missing in HTML: ${miss.selector}`);
  }

  console.log(`[${mark(report.drawings.ok)}] drawings  ${report.drawings.referencedCount} referenced, ${report.drawings.fileCount} on disk (${(report.drawings.totalBytes / 1024 / 1024).toFixed(1)} MB)`);
  for (const rel of report.drawings.missingOnDisk) {
    console.log(`        referenced but missing: ${rel}`);
  }

  if (report.style.skipped) {
    console.log(`[PASS] style     (style.css not found — skipped)`);
  } else {
    console.log(`[${mark(report.style.ok)}] style     ${report.style.cssClassCount} css classes, ${report.style.definedVarCount} custom props`);
    for (const v of report.style.undefinedVars) {
      console.log(`        var(--${v}) used but never defined`);
    }
    if (report.style.unusedCss.length) {
      console.log(`        info: ${report.style.unusedCss.length} css classes unused statically`);
    }
  }

  const kb = (n) => (n / 1024).toFixed(0);
  console.log(`[${mark(report.perf.ok)}] perf      ${kb(report.perf.totalBytes)} KB total (html:${kb(report.perf.htmlBytes)} css:${kb(report.perf.cssBytes)} js:${kb(report.perf.jsBytes)})`);
  for (const v of report.perf.budgetViolations) {
    console.log(`        budget exceeded: ${v.file} ${kb(v.bytes)} KB > ${kb(v.budget)} KB`);
  }
  for (const s of report.perf.renderBlockingScripts) {
    console.log(`        render-blocking script in <head>: ${s}`);
  }
  if (report.perf.imgsWithoutLazy.length) {
    console.log(`        info: ${report.perf.imgsWithoutLazy.length} images without loading="lazy"`);
  }
  if (report.perf.imgsWithoutDimensions.length) {
    console.log(`        info: ${report.perf.imgsWithoutDimensions.length} images without explicit width/height`);
  }

  console.log(`[${mark(report.a11y.ok)}] a11y      imgs:${report.a11y.imgsWithoutAlt.length === 0 ? "ok" : report.a11y.imgsWithoutAlt.length + " missing alt"} inputs:${report.a11y.unlabeledInputs.length === 0 ? "ok" : report.a11y.unlabeledInputs.length + " unlabeled"} buttons:${report.a11y.inaccessibleButtons.length === 0 ? "ok" : report.a11y.inaccessibleButtons.length + " unnamed"}`);
  for (const src of report.a11y.imgsWithoutAlt) {
    console.log(`        img missing alt: ${src}`);
  }
  for (const id of report.a11y.unlabeledInputs) {
    console.log(`        unlabeled input: ${id}`);
  }
  for (const btn of report.a11y.inaccessibleButtons) {
    console.log(`        button without accessible name: ${btn}`);
  }
  if (report.a11y.positiveTabindex.length) {
    console.log(`        info: ${report.a11y.positiveTabindex.length} element(s) with positive tabindex`);
  }

  console.log(`[${mark(report.security.ok)}] security  blank-links:${report.security.unsafeBlankLinks.length === 0 ? "ok" : report.security.unsafeBlankLinks.length + " unsafe"} js-hrefs:${report.security.jsHrefs.length === 0 ? "ok" : report.security.jsHrefs.length + " found"} http:${report.security.insecureResources.length === 0 ? "ok" : report.security.insecureResources.length + " found"}`);
  for (const link of report.security.unsafeBlankLinks) {
    console.log(`        target="_blank" without noopener/noreferrer: ${link}`);
  }
  for (const href of report.security.jsHrefs) {
    console.log(`        javascript: href: ${href}`);
  }
  for (const url of report.security.insecureResources) {
    console.log(`        http:// resource: ${url}`);
  }
  if (!report.security.hasCsp) {
    console.log(`        info: no Content-Security-Policy meta tag`);
  }
  if (report.security.externalNoIntegrity.length) {
    console.log(`        info: ${report.security.externalNoIntegrity.length} external resource(s) without integrity=`);
  }

  console.log("");
  console.log(report.ok ? "All checks passed." : "Checks FAILED.");
}

function runOnce() {
  const report = runAllChecks(webRoot);
  printReport(report);
  return report.ok;
}

if (!watchMode) {
  const ok = runOnce();
  process.exit(ok ? 0 : 1);
} else {
  console.error(`seis-check --watch · watching ${webRoot}`);
  runOnce();

  // Debounce: coalesce rapid saves into one re-run
  let debounceTimer;
  const trigger = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log("\n--- file changed ---");
      runOnce();
    }, 200);
  };

  const WATCH_FILES = ["index.html", "script.js", "translations.json", "style.css", "site-config.json"];
  for (const file of WATCH_FILES) {
    try {
      watch(`${webRoot}/${file}`, trigger);
    } catch {
      // file may not exist — skip silently
    }
  }

  // Keep the process alive; Ctrl-C to stop
  process.on("SIGINT", () => { console.error("\nseis-check --watch stopped."); process.exit(0); });
}
