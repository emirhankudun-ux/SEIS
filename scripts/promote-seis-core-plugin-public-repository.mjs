#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const sourceRoot = path.join(root, "plugins", "seis-core");
const bundleCatalog = readJson(path.join(root, "content", "development", "seis-public-plugin-bundle-catalog.json"));
const applicationBundleByMember = buildApplicationBundleMap(bundleCatalog);
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
  const marketplaceBundleId = applicationBundleByMember.get(entry.name);
  if (!marketplaceBundleId) {
    failures.push(`${path.relative(root, profilePath)}: missing exact-one application bundle mapping`);
    continue;
  }
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
    marketplaceDiscoverable: true,
    marketplaceCard: false,
    marketplaceBundleId,
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

function buildApplicationBundleMap(catalog) {
  const mapping = new Map();
  const bundles = Array.isArray(catalog?.bundles) ? catalog.bundles.filter((bundle) => bundle?.family === "application") : [];
  for (const bundle of bundles) {
    for (const name of bundle.memberNames || []) {
      if (mapping.has(name)) throw new Error(`duplicate application bundle member: ${name}`);
      mapping.set(name, bundle.id);
    }
  }
  if (bundles.length !== 6 || mapping.size !== 75) throw new Error("application bundle catalog must contain six cards and 75 exact-once members");
  return mapping;
}
