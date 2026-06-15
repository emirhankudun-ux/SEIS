import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const requiredFiles = [
  "AGENTS.md",
  "README.md",
  "apps/web/index.html",
  "apps/web/case-studies/seis-foundation.html",
  "apps/web/case-studies/case-study.css",
  "apps/web/manifest.webmanifest",
  "apps/web/robots.txt",
  "apps/web/sitemap.xml",
  "apps/web/src/scripts/motion-system.js",
  "apps/web/src/scripts/development-mode.js",
  "apps/web/src/scripts/efficiency-governor.js",
  "apps/web/src/scripts/weekly-usage-governor.js",
  "apps/web/src/scripts/gallery-system.js",
  "apps/web/src/scripts/handoff-system.js",
  "apps/web/src/scripts/i18n-system.js",
  "apps/web/src/scripts/pwa-system.js",
  "apps/web/src/scripts/system-pulse.js",
  "apps/web/service-worker.js",
  "apps/web/src/i18n/locales.js",
  "apps/web/src/content/artworks.js",
  "content/lab/operating-system.json",
  "content/lab/development-process.json",
  "content/lab/development-mode.json",
  "content/lab/system-pulse.json",
  "content/lab/efficiency-governor.json",
  "content/lab/efficiency-mode.json",
  "content/lab/weekly-usage-governor.json",
  "content/lab/handoff-checklist.json",
  "content/lab/long-development-roadmap.json",
  "content/lab/accessibility-review.json",
  "content/lab/framework-decision.json",
  "content/site/metadata.json",
  "content/case-studies/detail-model.json",
  "content/case-studies/content-quality-review.json",
  "content/case-studies/detail-route-proposal.json",
  "deploy/server-targets.json",
  "deploy/server-targets.local.example.json",
  "packages/design-tokens/seis.tokens.css",
  "packages/asset-registry/legacy-assets.json",
  "docs/reports/zip-analysis-2026-05-24.md",
  "docs/seo/metadata-plan.md",
  "docs/architecture/web-mobile-foundation.md",
  "docs/architecture/animation-system-plan.md",
  "docs/architecture/case-study-detail-route-proposal.md",
  "docs/decisions/framework-decision-record.md",
  "docs/quality/responsive-performance-accessibility.md",
  "docs/quality/manual-accessibility-review.md",
  "docs/quality/case-study-content-quality-review.md",
  "docs/strategy/ui-ux-digital-lab-operating-system.md",
  "docs/strategy/case-study-detail-model.md",
  "docs/deployment/workspace-routing.md",
  "docs/deployment/full-efficiency-shipment.md",
  "docs/deployment/server-target-selection.md",
  "docs/governance/development-process.md",
  "docs/plans/long-development-roadmap.md",
  "docs/plans/first-commit-plan.md",
  "scripts/full-efficiency-ship.mjs",
  "scripts/check-seo-metadata.mjs"
];

const requiredTextChecks = [
  // apps/web/index.html — current portfolio surface (emirhankudun.com)
  ["apps/web/index.html", "Emirhan Kudun"],
  ["apps/web/index.html", "emirhankudun.com"],
  ["apps/web/index.html", "id=\"hero\""],
  ["apps/web/index.html", "id=\"about\""],
  ["apps/web/index.html", "id=\"work\""],
  ["apps/web/index.html", "id=\"contact\""],
  ["apps/web/index.html", "data-i18n"],
  // robots.txt / sitemap — production domain
  ["apps/web/robots.txt", "Sitemap: https://emirhankudun.com/sitemap.xml"],
  ["apps/web/sitemap.xml", "https://emirhankudun.com/"],
  // case-study page
  ["apps/web/case-studies/seis-foundation.html", "Editorial Narrative"],
  // content JSON — lab surface
  ["content/lab/operating-system.json", "experienceModes"],
  ["content/lab/development-process.json", "activeSprint"],
  ["content/lab/development-mode.json", "development-continuation"],
  ["content/lab/system-pulse.json", "static-release"],
  ["content/lab/efficiency-governor.json", "high-cognition-low-machine-load"],
  ["content/lab/efficiency-mode.json", "full-efficiency-low-pressure"],
  ["content/lab/weekly-usage-governor.json", "productive-weekly-usage"],
  ["content/lab/handoff-checklist.json", "confirm-target"],
  ["content/lab/long-development-roadmap.json", "phase-06-release-system"],
  ["content/lab/accessibility-review.json", "cognitive-load"],
  ["content/lab/framework-decision.json", "static-html-css-js"],
  ["content/site/metadata.json", "emirhankudun.com"],
  ["content/case-studies/detail-model.json", "contentQualityRubric"],
  ["content/case-studies/content-quality-review.json", "requiredBeforeDetailRoute"],
  ["content/case-studies/detail-route-proposal.json", "framework-neutral-route-planning"],
  // docs
  ["docs/strategy/ui-ux-digital-lab-operating-system.md", "Experience Modes"],
  ["docs/governance/development-process.md", "Active Sprint"],
  ["docs/plans/long-development-roadmap.md", "Framework decision"],
  ["docs/decisions/framework-decision-record.md", "Status: deferred"],
  ["docs/decisions/framework-decision-record.md", "Dependency Budget"],
  ["docs/quality/manual-accessibility-review.md", "Release Blockers"],
  ["docs/strategy/case-study-detail-model.md", "No new dependency"],
  ["docs/quality/case-study-content-quality-review.md", "Review Sequence"],
  ["docs/architecture/case-study-detail-route-proposal.md", "Rollback Path"],
  ["docs/deployment/workspace-routing.md", "GitHub branch target"],
  ["docs/deployment/full-efficiency-shipment.md", "npm run ship:full-efficiency"],
  ["docs/deployment/server-target-selection.md", "Confirmation Flow"],
  ["docs/deployment/server-target-selection.md", "rollback owner"],
  ["docs/seo/metadata-plan.md", "Readiness Contract"],
  // service worker — cache mechanism (not specific cached files)
  ["apps/web/service-worker.js", "CACHE_NAME"],
  // i18n
  ["apps/web/src/i18n/locales.js", "supportedLocales"],
  ["apps/web/src/i18n/locales.js", "ar"],
  // motion / scripts
  ["apps/web/src/styles/motion.css", "prefers-reduced-motion"],
  ["apps/web/src/scripts/motion-system.js", "requestAnimationFrame"],
  ["apps/web/src/scripts/motion-system.js", "initDevelopmentMode"],
  ["apps/web/src/scripts/development-mode.js", "DEVELOPMENT_MODE_SOURCE"],
  ["apps/web/src/scripts/motion-system.js", "initEfficiencyGovernor"],
  ["apps/web/src/scripts/efficiency-governor.js", "GOVERNOR_SOURCE"],
  ["apps/web/src/scripts/motion-system.js", "initWeeklyUsageGovernor"],
  ["apps/web/src/scripts/weekly-usage-governor.js", "WEEKLY_USAGE_SOURCE"],
  ["apps/web/src/scripts/motion-system.js", "initSystemPulse"],
  ["apps/web/src/scripts/motion-system.js", "initHandoffSystem"],
  // ship / server (skipped automatically if file does not exist in CI)
  ["scripts/full-efficiency-ship.mjs", "UIXAppTTR"],
  ["server/node/static-server.mjs", "/_server/development-mode"],
  ["server/node/static-server.mjs", "/_server/efficiency"],
  ["server/node/static-server.mjs", "/_server/weekly-usage"],
  ["server/node/static-server.mjs", "/_server/handoff"],
  ["docs/reports/zip-analysis-2026-05-24.md", "Valuable Assets"]
];

const forbiddenTextChecks = [
  ["apps/web/robots.txt", "example.com"],
  ["apps/web/sitemap.xml", "example.com"],
  ["content/site/metadata.json", "example.com"]
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`missing required file: ${file}`);
  }
}

for (const [file, needle] of requiredTextChecks) {
  if (!existsSync(file)) {
    continue;
  }
  const contents = readFileSync(file, "utf8");
  if (!contents.includes(needle)) {
    failures.push(`missing "${needle}" in ${file}`);
  }
}

for (const [file, needle] of forbiddenTextChecks) {
  if (!existsSync(file)) {
    continue;
  }
  const contents = readFileSync(file, "utf8");
  if (contents.includes(needle)) {
    failures.push(`forbidden "${needle}" in ${file}`);
  }
}

// Drawing assets — only enforce when the directory is present.
// Binary media is not required to be checked out in all CI environments.
const drawingDir = "apps/web/public/media/drawings";
if (existsSync(drawingDir)) {
  const drawings = readdirSync(drawingDir).filter(name => name.endsWith(".jpg"));
  const bytes = drawings.reduce((total, name) => total + statSync(join(drawingDir, name)).size, 0);
  if (drawings.length !== 20) {
    failures.push(`expected 20 curated drawing assets, found ${drawings.length}`);
  }
  if (bytes > 7_000_000) {
    failures.push(`curated drawing assets exceed lightweight budget: ${bytes} bytes`);
  }
}

if (failures.length > 0) {
  console.error("SEIS foundation check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS foundation check passed.");
