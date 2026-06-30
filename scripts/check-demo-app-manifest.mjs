#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "apps/web/seis-demo-app-manifest.json");
const launcherPath = path.join(root, "apps/web/seis-demo-app-launcher.html");
const docsPath = path.join(root, "docs/product/seis-demo-app-manifest.md");

const requiredIds = [
  "command-center",
  "desktop-os",
  "ai-core",
  "search",
  "seis-code",
  "design-studio",
  "cloud-ssh",
  "store",
  "music",
  "launchpad",
  "files",
  "terminal",
  "website",
  "agents",
  "plugins"
];

const validStates = new Set(["real", "mock", "planned"]);

function fail(message) {
  console.error(`SEIS demo app manifest check failed: ${message}`);
  process.exit(1);
}

for (const filePath of [manifestPath, launcherPath, docsPath]) {
  if (!fs.existsSync(filePath)) {
    fail(`missing ${path.relative(root, filePath)}`);
  }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const launcher = fs.readFileSync(launcherPath, "utf8");
const docs = fs.readFileSync(docsPath, "utf8");

if (manifest.schema !== "seis.demo.apps.v1") {
  fail("unexpected manifest schema");
}

if (!manifest.safety || manifest.safety.requiresApiKeys !== false || manifest.safety.executesSsh !== false || manifest.safety.mutatesGithub !== false) {
  fail("manifest safety boundary must explicitly disable keys, SSH, and GitHub mutation");
}

if (!Array.isArray(manifest.apps) || manifest.apps.length < requiredIds.length) {
  fail("manifest app list is missing or too small");
}

const ids = new Set();

for (const app of manifest.apps) {
  if (!app.id || !app.name || !app.category || !app.state || !app.route || !app.demoAction) {
    fail(`app entry is incomplete: ${JSON.stringify(app)}`);
  }
  if (ids.has(app.id)) {
    fail(`duplicate app id: ${app.id}`);
  }
  ids.add(app.id);
  if (!validStates.has(app.state)) {
    fail(`invalid state for ${app.id}: ${app.state}`);
  }
  if (app.route.startsWith("http://") || app.route.startsWith("https://")) {
    fail(`route must stay local for ${app.id}: ${app.route}`);
  }
  if (app.state === "real") {
    const routeFile = app.route.split("#")[0];
    const fullRoute = path.join(root, "apps/web", routeFile);
    if (!fs.existsSync(fullRoute)) {
      fail(`real app route is missing for ${app.id}: ${routeFile}`);
    }
  }
}

for (const requiredId of requiredIds) {
  if (!ids.has(requiredId)) {
    fail(`required app is missing: ${requiredId}`);
  }
}

for (const state of validStates) {
  if (!manifest.apps.some((app) => app.state === state)) {
    fail(`manifest must include at least one ${state} app`);
  }
  if (!launcher.includes(`data-state="${state}"`)) {
    fail(`launcher is missing visible ${state} state marker`);
  }
}

const requiredLauncherMarkers = [
  "data-seis-demo-app-launcher",
  "Open Desktop OS",
  "Open Linux Replica",
  "Open SEIS Code",
  "Open WOW Gallery",
  "No secrets",
  "does not execute SSH",
  "call GitHub",
  "store secrets",
  "Mock and planned items must stay labeled"
];

for (const marker of requiredLauncherMarkers) {
  if (!launcher.includes(marker) && !docs.includes(marker)) {
    fail(`missing launcher/docs marker: ${marker}`);
  }
}

const forbiddenClaims = [
  "live AI provider calls are enabled",
  "real SSH is enabled",
  "GitHub mutation is enabled",
  "deployment mutation is enabled",
  "branch protection bypass is enabled"
];

const combined = `${JSON.stringify(manifest)}\n${launcher}\n${docs}`.toLowerCase();
for (const claim of forbiddenClaims) {
  if (combined.includes(claim.toLowerCase())) {
    fail(`forbidden live claim found: ${claim}`);
  }
}

console.log("SEIS demo app manifest check passed.");
