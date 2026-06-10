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
