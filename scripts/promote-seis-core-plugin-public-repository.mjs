#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const sourceRoot = path.join(root, "plugins", "seis-core");
const failures = [];
let count = 0;

for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const pluginRoot = path.join(sourceRoot, entry.name);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const profilePath = path.join(pluginRoot, "assets", "plugin-profile.json");
  if (!fs.existsSync(manifestPath) || !fs.existsSync(profilePath)) continue;

  const manifest = readJson(manifestPath);
  const profile = readJson(profilePath);
  const nextManifest = {
    ...manifest,
    license: "MIT",
    keywords: unique([...(manifest.keywords || []), "public-repository", "read-only"]),
  };
  const nextProfile = {
    ...profile,
    sourceClassification: "public-SEIS-repository",
    license: "MIT",
    status: "approved-public-readonly",
    reviewState: "public-repository-preview",
    publicRepositoryAvailable: true,
    publicAudience: "everyone",
    publicMarketplace: true,
    liveRuntimeStatus: "local-demo-or-auth-gated",
  };
  const expectedManifest = `${JSON.stringify(nextManifest, null, 2)}\n`;
  const expectedProfile = `${JSON.stringify(nextProfile, null, 2)}\n`;
  if (checkMode) {
    if (readText(manifestPath) !== expectedManifest) failures.push(path.relative(root, manifestPath));
    if (readText(profilePath) !== expectedProfile) failures.push(path.relative(root, profilePath));
  } else {
    fs.writeFileSync(manifestPath, expectedManifest);
    fs.writeFileSync(profilePath, expectedProfile);
  }
  count += 1;
}

if (failures.length) {
  console.error("SEIS public repository plugin metadata is stale:");
  for (const file of failures) console.error(`- ${file}`);
  console.error("Run: npm run automation:seis-core-plugin-public-repository");
  process.exit(1);
}

console.log(`${checkMode ? "SEIS public repository plugin metadata check passed" : "Promoted"} for ${count} app-owned plugins.`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
