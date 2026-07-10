#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const webRoot = path.join(root, "apps/web");
const docsPath = path.join(root, "docs/product/seis-public-demo-smoke-matrix.md");

const realEntrypoints = [
  {
    id: "website",
    file: "index.html",
    purpose: "public landing and product story"
  },
  {
    id: "desktop-os",
    file: "desktop.html",
    purpose: "browser desktop OS shell"
  },
  {
    id: "linux-replica",
    file: "seis-linux-replica.html",
    purpose: "Linux-like supplied-reference demo"
  },
  {
    id: "linux-replica-public",
    file: "seis-linux-replica-public-demo.html",
    purpose: "public Linux replica entry"
  },
  {
    id: "seis-code",
    file: "seis-code.html",
    purpose: "browser IDE demo"
  },
  {
    id: "wow-gallery",
    file: "wow-gallery.html",
    purpose: "cinematic visual showcase"
  },
  {
    id: "cockpit",
    file: "seis-cockpit.html",
    purpose: "SEIS cockpit demo surface"
  }
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
  console.error(`SEIS public demo smoke matrix failed: ${message}`);
  process.exit(1);
}

function readRequired(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`missing ${path.relative(root, filePath)}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

const docs = readRequired(docsPath);

for (const entry of realEntrypoints) {
  const filePath = path.join(webRoot, entry.file);
  const html = readRequired(filePath);
  if (html.trim().length < 500) {
    fail(`${entry.file} is unexpectedly small`);
  }
  if (!/<title>[\s\S]*?<\/title>/i.test(html)) {
    fail(`${entry.file} is missing a title`);
  }
  if (!/<meta\s+name=["']viewport["']/i.test(html)) {
    fail(`${entry.file} is missing a viewport meta tag`);
  }
  if (!docs.includes(entry.file)) {
    fail(`docs do not list ${entry.file}`);
  }
  if (!docs.includes(entry.purpose)) {
    fail(`docs do not explain purpose for ${entry.file}`);
  }
}

const combined = [
  docs,
  ...realEntrypoints.map((entry) => fs.readFileSync(path.join(webRoot, entry.file), "utf8"))
]
  .join("\n")
  .toLowerCase();

for (const claim of forbiddenClaims) {
  if (combined.includes(claim.toLowerCase())) {
    fail(`forbidden live/security claim found: ${claim}`);
  }
}

const requiredBoundaryPhrases = [
  "No API keys are required",
  "No SSH is executed",
  "No GitHub mutation is performed",
  "No deployment is triggered",
  "No branch protection is changed"
];

for (const phrase of requiredBoundaryPhrases) {
  if (!docs.includes(phrase)) {
    fail(`docs are missing safety boundary phrase: ${phrase}`);
  }
}

console.log("SEIS public demo smoke matrix passed.");
