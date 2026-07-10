#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "apps/web/seis-live-demo-index.html");
const docsPath = path.join(root, "docs/product/seis-live-demo-index.md");

const requiredRoutes = [
  "index.html",
  "desktop.html",
  "seis-linux-replica.html",
  "seis-code.html",
  "wow-gallery.html"
];

const requiredBeats = [
  "Opening cinematic landing page",
  "Command Center appears",
  "User opens SEIS Desktop",
  "Desktop shows apps and system status",
  "User opens SEIS AI Core",
  "Provider registry and model router shown",
  "User opens SEIS Code",
  "Browser IDE shows mock repo and AI panel",
  "User opens SEIS Design",
  "Design tokens and premium components shown",
  "User opens SEIS Search",
  "Search finds modules/docs/agents",
  "User opens Cloud/SSH",
  "GitHub/CI/status logs shown",
  "Final Showcase summarizes SEIS ecosystem"
];

function fail(message) {
  console.error(`SEIS live demo index check failed: ${message}`);
  process.exit(1);
}

for (const filePath of [pagePath, docsPath]) {
  if (!fs.existsSync(filePath)) {
    fail(`missing ${path.relative(root, filePath)}`);
  }
}

const page = fs.readFileSync(pagePath, "utf8");
const docs = fs.readFileSync(docsPath, "utf8");

if (!page.includes("data-seis-live-demo-index")) {
  fail("page is missing live demo index marker");
}

for (const route of requiredRoutes) {
  if (!page.includes(`data-real-route="${route}"`)) {
    fail(`page is missing real route marker: ${route}`);
  }
  if (!docs.includes(`apps/web/${route}`)) {
    fail(`docs are missing real route: apps/web/${route}`);
  }
  if (!fs.existsSync(path.join(root, "apps/web", route))) {
    fail(`real route file does not exist: apps/web/${route}`);
  }
}

for (const beat of requiredBeats) {
  if (!page.includes(beat)) {
    fail(`page is missing demo beat: ${beat}`);
  }
}

for (const state of ["real", "mock", "planned"]) {
  if (!page.includes(`data-state="${state}"`)) {
    fail(`page is missing visible ${state} state`);
  }
}

const boundary = [
  "does not execute SSH",
  "call GitHub",
  "deploy",
  "call AI providers",
  "store secrets",
  "weaken branch protection"
];

for (const phrase of boundary) {
  if (!page.includes(phrase) && !docs.includes(phrase)) {
    fail(`missing safety boundary phrase: ${phrase}`);
  }
}

const forbiddenClaims = [
  "live AI provider calls are enabled",
  "real SSH is enabled",
  "GitHub mutation is enabled",
  "deployment mutation is enabled",
  "branch protection bypass is enabled"
];

const combined = `${page}\n${docs}`.toLowerCase();
for (const claim of forbiddenClaims) {
  if (combined.includes(claim.toLowerCase())) {
    fail(`forbidden live claim found: ${claim}`);
  }
}

console.log("SEIS live demo index check passed.");
