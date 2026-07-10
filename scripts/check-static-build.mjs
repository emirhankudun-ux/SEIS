import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { supportedLocales } from "../apps/web/src/i18n/locales.js";

const root = "dist/seis-static";
const failures = [];

for (const file of [
  "index.html",
  "case-studies/seis-foundation.html",
  "service-worker.js",
  ".htaccess",
  "release.json",
  "health.json",
  "sitemap.xml",
  "favicon.ico",
  "favicon.svg",
  "manifest.webmanifest",
  "content/lab/operating-system.json",
  "content/lab/development-process.json",
  "docs/strategy/ui-ux-digital-lab-operating-system.md",
  "docs/governance/development-process.md",
  "docs/deployment/server-upload-runbook.md",
  "docs/deployment/server-drop-handoff.md",
  "contracts/polyglot/seis-experience-contract.json",
  "_deploy/server-targets.json"
]) {
  if (!existsSync(join(root, file))) {
    failures.push(`missing static build file: ${file}`);
  }
}

if (existsSync(join(root, "case-studies/seis-foundation.html"))) {
  const caseStudyHtml = readFileSync(join(root, "case-studies/seis-foundation.html"), "utf8");
  if (!caseStudyHtml.includes("../assets/styles/seis.tokens.css")) {
    failures.push("case study route does not use packaged design token path");
  }
}

if (!existsSync(join(root, "_server/health.php"))) {
  failures.push("missing PHP health fallback: _server/health.php");
}

for (const locale of supportedLocales) {
  const localeIndex = join(root, locale, "index.html");
  if (!existsSync(localeIndex)) {
    failures.push(`missing locale route: ${locale}/index.html`);
    continue;
  }
  const html = readFileSync(localeIndex, "utf8");
  if (!html.includes(`lang="${locale}"`)) {
    failures.push(`locale route does not set lang="${locale}": ${locale}/index.html`);
  }
}

const drawingDir = join(root, "public/media/drawings");
if (!existsSync(drawingDir)) {
  failures.push("missing static drawing directory");
} else {
  const drawings = readdirSync(drawingDir).filter(name => name.endsWith(".jpg"));
  if (drawings.length !== 20) {
    failures.push(`expected 20 static drawing assets, found ${drawings.length}`);
  }
}

const zipPath = "dist/seis-static.zip";
if (!existsSync(zipPath)) {
  failures.push("missing dist/seis-static.zip");
} else if (statSync(zipPath).size < 1_000_000) {
  failures.push("server zip looks unexpectedly small");
}

if (failures.length > 0) {
  console.error("SEIS static build check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEIS static build check passed for ${supportedLocales.length} locale routes.`);
