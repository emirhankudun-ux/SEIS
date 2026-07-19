#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const coveragePath = "content/development/seis-ai-core-personal-plugin-coverage.json";
const familyPath = "content/development/seis-public-plugin-family.json";
const marketplacePath = ".agents/plugins/marketplace.json";

const coverage = readJson(coveragePath);
const family = readJson(familyPath);
const marketplace = readJson(marketplacePath);
const historicalPluginIds = coverage?.personalMarketplace?.pluginIds || [];
const migratedRootPlugins = family?.migratedRootPlugins || [];
const applicationPlugins = family?.applicationPlugins || [];
const topicPlugins = family?.topicPlugins || [];
const canonicalPlugins = family?.publicPlugins || [];
const migratedRootNames = new Set(migratedRootPlugins.map((plugin) => plugin.name));
const marketplaceEntries = Array.isArray(marketplace?.plugins) ? marketplace.plugins : [];
const expectedMarketplaceCount = canonicalPlugins.length + migratedRootPlugins.length + applicationPlugins.length + topicPlugins.length;

ensure(historicalPluginIds.length === 55, "historical coverage must retain 55 SEIS plugin IDs");
ensure(migratedRootPlugins.length === 5, "public family must publish all five migrated root packages");
ensure(family?.marketplace?.migratedRootPluginCount === migratedRootPlugins.length, "public family migrated root count must match the root package list");
ensure(applicationPlugins.length === 60, "public family must retain every app-owned package");
ensure(topicPlugins.length === 300, "public family must retain every objective-derived topic package");
ensure(canonicalPlugins.length === 1 && canonicalPlugins[0]?.name === "seis-ai-agent", "SEIS-Agent must remain the sole canonical default install");
ensure(marketplaceEntries.length === expectedMarketplaceCount, "repo marketplace count must match canonical, root, app, and topic package families");
ensure(family?.marketplace?.publicPluginCount === expectedMarketplaceCount, "public family marketplace count must be current");
ensure(new Set(marketplaceEntries.map((entry) => entry.name)).size === marketplaceEntries.length, "repo marketplace plugin names must be unique");

for (const id of historicalPluginIds) {
  const expectedPath = migratedRootNames.has(id) ? `./plugins/${id}` : `./plugins/seis-core/${id}`;
  const entry = marketplaceEntries.find((candidate) => candidate?.name === id);
  ensure(Boolean(entry), `historical personal card is not available from seis-repo: ${id}`);
  if (!entry) continue;
  ensure(entry.source?.source === "local", `${id} marketplace source must be local`);
  ensure(entry.source?.path === expectedPath, `${id} must use its canonical repo source path`);
  ensure(entry.policy?.installation === "AVAILABLE", `${id} must be AVAILABLE in seis-repo`);
  ensure(entry.policy?.authentication === "ON_INSTALL", `${id} must authenticate ON_INSTALL in seis-repo`);

  const sourceRoot = path.join(root, expectedPath);
  const manifestPath = path.join(sourceRoot, ".codex-plugin", "plugin.json");
  const mcpPath = path.join(sourceRoot, ".mcp.json");
  ensure(fs.existsSync(manifestPath), `${id} repo manifest is missing`);
  ensure(fs.existsSync(mcpPath), `${id} repo MCP manifest is missing`);
  if (fs.existsSync(manifestPath)) {
    const manifest = readJson(path.relative(root, manifestPath));
    ensure(manifest?.name === id, `${id} manifest name must match its marketplace card`);
    ensure(manifest?.license === "MIT", `${id} manifest must be MIT before public marketplace visibility`);
  }
}

for (const plugin of migratedRootPlugins) {
  ensure(migratedRootNames.has(plugin.name), `${plugin.name} must stay in the migrated root package list`);
  ensure(plugin.sourcePath === `./plugins/${plugin.name}`, `${plugin.name} root source path must be repo-owned`);
  ensure(plugin.installId === `${plugin.name}@seis-repo`, `${plugin.name} root install id must use seis-repo`);
}

const report = {
  ok: failures.length === 0,
  status: failures.length === 0 ? "historical-personal-cards-covered-by-public-seis-repo" : "migration-coverage-failed",
  scope: "repo-only-static-validation",
  personalConfigRead: false,
  personalConfigMutated: false,
  historicalPersonalPluginCount: historicalPluginIds.length,
  migratedRootMarketplacePluginCount: migratedRootPlugins.length,
  applicationMarketplacePluginCount: applicationPlugins.length,
  topicMarketplacePluginCount: topicPlugins.length,
  canonicalDefaultInstallCount: canonicalPlugins.length,
  repoMarketplaceEntryCount: marketplaceEntries.length,
  expectedMarketplaceEntryCount: expectedMarketplaceCount,
  failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}
