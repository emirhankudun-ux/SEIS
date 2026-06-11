const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const failures = [];

const requiredFiles = [
  "README.md",
  "package.json",
  "docs/governance/ui-ux-digital-lab-master-directive.md",
  "docs/governance/ui-ux-digital-lab-automation-brief.md",
  "docs/governance/full-efficiency-low-pressure-mode.md",
  "docs/deployment/cloud-environment.md",
  "docs/development/trusted-marketplace-intake.md",
  "data/gap-closure-register.json",
  "deploy/cloud-environment.json",
  "content/development/connector-capability-registry.json",
  "content/development/trusted-marketplace-intake.json",
  "content/development/publish-gate-contract.json",
  "apps/web/index.html",
  "apps/web/styles.css",
  "apps/web/app.js",
  "scripts/automation-develop.cjs",
  "scripts/automation-gap-sync.cjs",
  "scripts/automation-refresh-release.cjs",
  "scripts/automation-publish-readiness.cjs",
  "scripts/create-code-automation-plan.cjs",
  "scripts/create-aggressive-execution-plan.cjs",
  "scripts/run-aggressive-local-cycle.cjs",
  "scripts/check-aggressive-safety-firewall.cjs",
  "scripts/check-cloud-environment.cjs",
  "scripts/check-trusted-marketplace-intake.cjs",
  "scripts/check-release-sync.cjs",
  "scripts/check-motion-evidence.cjs",
  "scripts/check-mobile-ergonomics.cjs"
];

function readText(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

for (const file of requiredFiles) {
  ensure(fs.existsSync(path.join(ROOT, file)), `Missing required file: ${file}`);
}

if (failures.length > 0) {
  console.error("Workspace check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const data = JSON.parse(readText("data/gap-closure-register.json"));
const css = readText("apps/web/styles.css");
const js = readText("apps/web/app.js");
const html = readText("apps/web/index.html");

ensure(Array.isArray(data.gaps), "gap-closure-register must define gaps array.");
ensure(data.summary.gaps === data.gaps.length, "Gap summary count must match gap records.");
ensure(
  data.gaps.every(
    (gap) =>
      gap.id &&
      gap.status &&
      gap.priority &&
      gap.nextAction &&
      gap.closureMetric &&
      Array.isArray(gap.qualityCommands) &&
      gap.qualityCommands.length > 0
  ),
  "Every gap must include id, status, priority, nextAction, closureMetric, and qualityCommands."
);
ensure(css.includes("prefers-reduced-motion"), "styles.css must include reduced motion support.");
ensure(js.includes("prefers-reduced-motion"), "app.js must include reduced motion behavior.");
ensure(html.includes("id=\"motion-mode\""), "index.html must include motion mode control.");
ensure(html.includes("id=\"gap-board\""), "index.html must include gap board.");
ensure(html.includes("href=\"#plugins\""), "index.html must expose the plugins nav link.");
ensure(html.includes("id=\"plugins\""), "index.html must include the visible plugins marketplace section.");
ensure(html.includes("id=\"marketplace\""), "index.html must keep the marketplace hash alias.");
ensure(html.includes("data-marketplace-channels"), "index.html must include visible marketplace channels.");
ensure(html.includes("data-marketplace-sources"), "index.html must include visible marketplace sources.");
ensure(html.includes("data-evolution-queue-panel"), "index.html must include visible evolution queue panel.");
ensure(html.includes("data-aggressive-lanes-panel"), "index.html must include visible aggressive lanes panel.");
ensure(html.includes("data-execution-plan-panel"), "index.html must include visible aggressive execution plan panel.");
ensure(html.includes("data-local-cycle-panel"), "index.html must include visible aggressive local cycle panel.");
ensure(html.includes("data-safety-firewall-panel"), "index.html must include visible aggressive safety firewall panel.");
ensure(js.includes("trusted-marketplace-intake.json"), "app.js must load trusted marketplace intake data.");
ensure(js.includes("publish-gate-contract.json"), "app.js must load publish gate contract data.");
ensure(js.includes("renderMarketplace"), "app.js must render trusted marketplace data.");
ensure(js.includes("renderPublishGate"), "app.js must render publish gate data.");

const releaseSync = spawnSync("node", ["scripts/check-release-sync.cjs"], {
  cwd: ROOT,
  encoding: "utf8"
});
ensure(releaseSync.status === 0, "release/web must stay synchronized with apps/web (run npm run automation:refresh-release).");

const motionEvidence = spawnSync("node", ["scripts/check-motion-evidence.cjs"], {
  cwd: ROOT,
  encoding: "utf8"
});
ensure(motionEvidence.status === 0, "motion evidence checks must pass.");

const mobileErgonomics = spawnSync("node", ["scripts/check-mobile-ergonomics.cjs"], {
  cwd: ROOT,
  encoding: "utf8"
});
ensure(mobileErgonomics.status === 0, "mobile ergonomics checks must pass.");

const cloudEnvironment = spawnSync("node", ["scripts/check-cloud-environment.cjs"], {
  cwd: ROOT,
  encoding: "utf8"
});
ensure(cloudEnvironment.status === 0, "cloud environment checks must pass.");

const trustedMarketplaceIntake = spawnSync("node", ["scripts/check-trusted-marketplace-intake.cjs"], {
  cwd: ROOT,
  encoding: "utf8"
});
ensure(trustedMarketplaceIntake.status === 0, "trusted marketplace intake checks must pass.");

if (failures.length > 0) {
  console.error("Workspace check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Workspace check passed.");
