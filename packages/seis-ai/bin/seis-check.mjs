#!/usr/bin/env node
import { resolveRepoRoot, resolveWebRoot } from "../src/lib/repo.mjs";
import { runAllChecks } from "../src/lib/checks.mjs";

const repoRoot = resolveRepoRoot();
const webRoot = resolveWebRoot(repoRoot);
const report = runAllChecks(webRoot);

const mark = (ok) => (ok ? "PASS" : "FAIL");

console.log(`SEIS web audit — ${webRoot}`);
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

console.log("");
console.log(report.ok ? "All checks passed." : "Checks FAILED.");
process.exit(report.ok ? 0 : 1);
