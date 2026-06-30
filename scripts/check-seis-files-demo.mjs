#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "apps/web/seis-files.html");
const docsPath = path.join(root, "docs/product/seis-files-demo.md");

const requiredSeedItems = [
  "Desktop OS",
  "AI Core Notes.md",
  "SEIS Code Workspace",
  "Design Tokens.json",
  "Music Session.playlist",
  "Store Catalog.local",
  "Cloud SSH Boundary.md",
  "Demo Readiness"
];

const requiredMarkers = [
  "data-seis-files-demo",
  "data-action=\"create-file\"",
  "data-action=\"create-folder\"",
  "data-action=\"rename-selected\"",
  "data-action=\"delete-selected\"",
  "data-action=\"reset-files\"",
  "data-action=\"view-grid\"",
  "data-action=\"view-list\"",
  "data-file",
  "data-location",
  "localStorage",
  "safe virtual mode",
  "recent files",
  "Delete safe-mode"
];

const requiredSafetyPhrases = [
  "No API keys are required",
  "No real filesystem read is performed",
  "No real filesystem write is performed",
  "No real filesystem rename is performed",
  "No real filesystem delete is performed",
  "No upload or sync is performed",
  "No SSH is executed",
  "No GitHub mutation is performed",
  "No deployment is triggered",
  "No AI provider call is performed",
  "No branch protection is changed"
];

const forbiddenClaims = [
  "real filesystem write is enabled",
  "real filesystem delete is enabled",
  "real filesystem rename is enabled",
  "upload is enabled",
  "sync is enabled",
  "real SSH is enabled",
  "GitHub mutation is enabled",
  "deployment mutation is enabled",
  "live AI provider calls are enabled",
  "branch protection bypass is enabled",
  "private keys are stored"
];

function fail(message) {
  console.error(`SEIS Files demo check failed: ${message}`);
  process.exit(1);
}

for (const filePath of [pagePath, docsPath]) {
  if (!fs.existsSync(filePath)) {
    fail(`missing ${path.relative(root, filePath)}`);
  }
}

const page = fs.readFileSync(pagePath, "utf8");
const docs = fs.readFileSync(docsPath, "utf8");

if (!/<title>[\s\S]*?<\/title>/i.test(page)) {
  fail("Files page is missing a title");
}

if (!/<meta\s+name=["']viewport["']/i.test(page)) {
  fail("Files page is missing viewport metadata");
}

for (const marker of requiredMarkers) {
  if (!page.includes(marker) && !docs.includes(marker)) {
    fail(`Files demo is missing marker: ${marker}`);
  }
}

for (const item of requiredSeedItems) {
  if (!page.includes(item) || !docs.includes(item)) {
    fail(`Files demo is missing seed item: ${item}`);
  }
}

for (const phrase of requiredSafetyPhrases) {
  if (!docs.includes(phrase)) {
    fail(`Files docs are missing safety phrase: ${phrase}`);
  }
}

const combined = `${page}\n${docs}`.toLowerCase();
for (const claim of forbiddenClaims) {
  if (combined.includes(claim.toLowerCase())) {
    fail(`forbidden live/security claim found: ${claim}`);
  }
}

console.log("SEIS Files demo check passed.");
