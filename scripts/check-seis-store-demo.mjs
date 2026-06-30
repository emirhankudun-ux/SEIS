#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "apps/web/seis-store.html");
const docsPath = path.join(root, "docs/product/seis-store-demo.md");

const requiredCatalogNames = [
  "SEIS AI Core",
  "SEIS Code IDE",
  "SEIS Design Studio",
  "SEIS Search",
  "SEIS Store",
  "SEIS Music",
  "Architect Agent",
  "Security Agent",
  "Graphite Cinema Theme",
  "GitHub Governance Plugin",
  "Ollama Local Toolkit",
  "Demo Readiness Tool"
];

const requiredMarkers = [
  "data-seis-store-demo",
  "data-action=\"install-featured\"",
  "data-action=\"clear-state\"",
  "data-action=\"install\"",
  "data-action=\"toggle\"",
  "localStorage",
  "data-state=\"real\"",
  "data-state=\"mock\"",
  "data-state=\"planned\"",
  "app",
  "agent",
  "plugin",
  "theme",
  "tool"
];

const requiredSafetyPhrases = [
  "No API keys are required",
  "No SSH is executed",
  "No GitHub mutation is performed",
  "No deployment is triggered",
  "No AI provider call is performed",
  "No package manager install is performed",
  "No branch protection is changed"
];

const forbiddenClaims = [
  "live AI provider calls are enabled",
  "real SSH is enabled",
  "GitHub mutation is enabled",
  "deployment mutation is enabled",
  "package manager install is enabled",
  "branch protection bypass is enabled",
  "API keys are stored in localStorage",
  "private keys are stored"
];

function fail(message) {
  console.error(`SEIS Store demo check failed: ${message}`);
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
  fail("Store page is missing a title");
}

if (!/<meta\s+name=["']viewport["']/i.test(page)) {
  fail("Store page is missing viewport metadata");
}

for (const marker of requiredMarkers) {
  if (!page.includes(marker)) {
    fail(`Store page is missing marker: ${marker}`);
  }
}

for (const name of requiredCatalogNames) {
  if (!page.includes(name)) {
    fail(`Store catalog is missing ${name}`);
  }
  if (!docs.includes(name)) {
    fail(`Store docs are missing ${name}`);
  }
}

for (const phrase of requiredSafetyPhrases) {
  if (!docs.includes(phrase)) {
    fail(`Store docs are missing safety phrase: ${phrase}`);
  }
}

const combined = `${page}\n${docs}`.toLowerCase();
for (const claim of forbiddenClaims) {
  if (combined.includes(claim.toLowerCase())) {
    fail(`forbidden live/security claim found: ${claim}`);
  }
}

console.log("SEIS Store demo check passed.");
