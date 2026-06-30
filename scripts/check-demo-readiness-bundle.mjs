#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bundlePath = path.join(root, "docs/product/seis-demo-readiness-bundle.md");

const browserArtifacts = [
  "apps/web/index.html",
  "apps/web/desktop.html",
  "apps/web/seis-linux-replica.html",
  "apps/web/seis-linux-replica-public-demo.html",
  "apps/web/seis-code.html",
  "apps/web/wow-gallery.html",
  "apps/web/seis-cockpit.html"
];

const docsArtifacts = [
  "README.md",
  "AGENTS.md",
  "SECURITY.md",
  "docs/STATUS.md",
  "docs/product/seis-demo-status.md",
  "docs/product/seis-desktop-os.md"
];

const requiredStateTerms = ["real", "mock", "planned"];

const requiredBoundaryPhrases = [
  "No API keys are required",
  "No SSH is executed",
  "No GitHub mutation is performed",
  "No deployment is triggered",
  "No AI provider call is performed",
  "No branch protection is changed",
  "Mock and planned states must remain labeled"
];

const forbiddenClaims = [
  "live AI provider calls are enabled",
  "real SSH is enabled",
  "GitHub mutation is enabled",
  "deployment mutation is enabled",
  "branch protection bypass is enabled",
  "API keys are stored in localStorage",
  "private keys are stored"
];

function fail(message) {
  console.error(`SEIS demo readiness bundle check failed: ${message}`);
  process.exit(1);
}

function readRequired(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`missing ${relativePath}`);
  }
  return fs.readFileSync(fullPath, "utf8");
}

const bundle = readRequired("docs/product/seis-demo-readiness-bundle.md");

for (const artifact of browserArtifacts) {
  if (!bundle.includes(artifact)) {
    fail(`bundle does not list browser artifact: ${artifact}`);
  }
  const html = readRequired(artifact);
  if (html.trim().length < 500) {
    fail(`${artifact} is unexpectedly small`);
  }
  if (!/<title>[\s\S]*?<\/title>/i.test(html)) {
    fail(`${artifact} is missing a title`);
  }
  if (!/<meta\s+name=["']viewport["']/i.test(html)) {
    fail(`${artifact} is missing a viewport meta tag`);
  }
}

for (const artifact of docsArtifacts) {
  if (!bundle.includes(artifact)) {
    fail(`bundle does not list docs artifact: ${artifact}`);
  }
  const content = readRequired(artifact);
  if (content.trim().length < 200) {
    fail(`${artifact} is unexpectedly small`);
  }
}

for (const state of requiredStateTerms) {
  if (!bundle.includes(`\`${state}\``)) {
    fail(`bundle is missing state term: ${state}`);
  }
}

for (const phrase of requiredBoundaryPhrases) {
  if (!bundle.includes(phrase)) {
    fail(`bundle is missing safety phrase: ${phrase}`);
  }
}

const combined = bundle.toLowerCase();
for (const claim of forbiddenClaims) {
  if (combined.includes(claim.toLowerCase())) {
    fail(`forbidden live/security claim found: ${claim}`);
  }
}

console.log("SEIS demo readiness bundle check passed.");
