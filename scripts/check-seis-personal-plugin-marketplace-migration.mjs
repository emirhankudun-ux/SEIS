#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const coveragePath = "content/development/seis-ai-core-personal-plugin-coverage.json";
const familyPath = "content/development/seis-public-plugin-family.json";
const bundleCatalogPath = "content/development/seis-public-plugin-bundle-catalog.json";
const marketplacePath = ".agents/plugins/marketplace.json";
const unifiedSuitePath = "plugins/seis-ai-agent/assets/unified-suite.json";

const coverage = readJson(coveragePath);
const family = readJson(familyPath);
const bundleCatalog = readJson(bundleCatalogPath);
const marketplace = readJson(marketplacePath);
const unifiedSuite = readJson(unifiedSuitePath);
const historicalPluginIds = coverage?.personalMarketplace?.pluginIds || [];
const migratedRootPlugins = family?.migratedRootPlugins || [];
const applicationPlugins = family?.applicationPlugins || [];
const topicPlugins = family?.topicPlugins || [];
const canonicalPlugins = family?.publicPlugins || [];
const bundles = Array.isArray(bundleCatalog?.bundles) ? bundleCatalog.bundles : [];
const migratedRootNames = new Set(migratedRootPlugins.map((plugin) => plugin.name));
const applicationNames = new Set(applicationPlugins.map((plugin) => plugin.name));
const topicNames = new Set(topicPlugins.map((plugin) => plugin.name));
const sourceCapabilityNames = new Set([...applicationNames, ...topicNames]);
const bundleMemberNames = bundles.flatMap((bundle) => Array.isArray(bundle?.memberNames) ? bundle.memberNames : []);
const bundleMemberNameSet = new Set(bundleMemberNames);
const bundlesByMemberName = new Map();
for (const bundle of bundles) {
  for (const memberName of bundle?.memberNames || []) {
    const memberships = bundlesByMemberName.get(memberName) || [];
    memberships.push(bundle);
    bundlesByMemberName.set(memberName, memberships);
  }
}
const marketplaceEntries = Array.isArray(marketplace?.plugins) ? marketplace.plugins : [];
const expectedMarketplaceCount = canonicalPlugins.length + bundles.length;
const retainedSourceCapabilityCount = migratedRootPlugins.length + applicationPlugins.length + topicPlugins.length;
const legacyPublicRenames = Array.isArray(coverage?.repository?.legacyPublicRenames)
  ? coverage.repository.legacyPublicRenames
  : [];
const publicNameForLegacyId = new Map(legacyPublicRenames.map((rename) => [rename?.legacyPluginId, rename?.publicPluginId]));

ensure(historicalPluginIds.length === 55, "historical coverage must retain 55 SEIS plugin IDs");
ensure(migratedRootPlugins.length === 5, "public family must publish all five migrated root packages");
ensure(family?.marketplace?.migratedRootPluginCount === migratedRootPlugins.length, "public family migrated root count must match the root package list");
ensure(applicationPlugins.length === APP_PLUGIN_EXPANSION_TARGET, `public family must retain every ${APP_PLUGIN_EXPANSION_TARGET} app-owned packages`);
ensure(topicPlugins.length === 300, "public family must retain every objective-derived topic package");
ensure(canonicalPlugins.length === 1 && canonicalPlugins[0]?.name === "seis-ai-agent", "SEIS-Agent must remain the sole canonical default install");
ensure(bundles.length === 33, "bundle catalog must expose 33 curated optional bundles");
ensure(bundles.filter((bundle) => bundle?.family === "application").length === 6, "bundle catalog must expose six application bundles");
ensure(bundles.filter((bundle) => bundle?.family === "topic").length === 27, "bundle catalog must expose 27 topic bundles");
ensure(bundleMemberNames.length === 375, "bundle catalog must retain all 75 application and 300 topic capabilities");
ensure(bundleMemberNameSet.size === bundleMemberNames.length, "each source capability must belong to exactly one curated bundle");
ensure(bundleMemberNameSet.size === sourceCapabilityNames.size && [...sourceCapabilityNames].every((name) => bundleMemberNameSet.has(name)), "bundle membership must exactly cover the retained application and topic sources");
ensure(bundles.every((bundle) => Number.isInteger(bundle?.memberCount) && bundle.memberCount === bundle.memberNames?.length && bundle.memberCount >= 1 && bundle.memberCount <= 15), "every curated bundle must contain between one and 15 declared capabilities");
ensure(marketplaceEntries.length === expectedMarketplaceCount, "repo marketplace count must match the canonical card plus curated bundle cards");
ensure(family?.marketplace?.publicPluginCount === expectedMarketplaceCount, "public family marketplace count must be current");
ensure(new Set(marketplaceEntries.map((entry) => entry.name)).size === marketplaceEntries.length, "repo marketplace plugin names must be unique");
ensure(retainedSourceCapabilityCount === 380, "all 380 root, application, and topic source capabilities must remain retained");
ensure(legacyPublicRenames.length === 1, "historical coverage must declare the one public card rename");
ensure(publicNameForLegacyId.get("seis-personal-plugin-discovery") === "seis-plugin-discovery", "legacy discovery card must resolve to the public discovery card");

const canonicalEntry = marketplaceEntries.find((entry) => entry?.name === "seis-ai-agent");
ensure(Boolean(canonicalEntry), "canonical SEIS-Agent marketplace card must remain available");
const embeddedModuleNames = new Set(unifiedSuite?.sourceDiscovery?.embeddedModuleNames || []);

for (const bundle of bundles) {
  const entry = marketplaceEntries.find((candidate) => candidate?.name === bundle.id);
  ensure(Boolean(entry), `curated bundle is not available from seis-repo: ${bundle.id}`);
  if (!entry) continue;
  ensure(entry.source?.source === "local", `${bundle.id} marketplace source must be local`);
  ensure(entry.source?.path === bundle.sourcePath, `${bundle.id} must use its catalog source path`);
  ensure(entry.policy?.installation === "AVAILABLE", `${bundle.id} must be AVAILABLE in seis-repo`);
  ensure(entry.policy?.authentication === "ON_INSTALL", `${bundle.id} must authenticate ON_INSTALL in seis-repo`);
}

for (const legacyId of historicalPluginIds) {
  const id = publicNameForLegacyId.get(legacyId) || legacyId;
  const expectedPath = migratedRootNames.has(id) ? `./plugins/${id}` : `./plugins/seis-core/${id}`;
  ensure(migratedRootNames.has(id) || applicationNames.has(id), `historical capability must resolve to a retained root or application source: ${legacyId} -> ${id}`);
  ensure(!marketplaceEntries.some((candidate) => candidate?.name === id), `retained source capability must not reappear as a direct marketplace card: ${id}`);

  if (migratedRootNames.has(id)) {
    ensure(embeddedModuleNames.has(id), `${id} must remain embedded in the canonical SEIS-Agent suite`);
  } else {
    const memberships = bundlesByMemberName.get(id) || [];
    ensure(memberships.length === 1, `${id} must be discoverable through exactly one curated marketplace bundle`);
    if (memberships.length === 1) {
      ensure(marketplaceEntries.some((entry) => entry?.name === memberships[0].id), `${id} bundle card must remain available in seis-repo`);
    }
  }

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

for (const rename of legacyPublicRenames) {
  const legacyId = rename?.legacyPluginId;
  const publicId = rename?.publicPluginId;
  ensure(typeof legacyId === "string" && historicalPluginIds.includes(legacyId), "legacy public rename must reference a historical card");
  ensure(typeof publicId === "string" && (bundlesByMemberName.get(publicId) || []).length === 1, "legacy public rename must resolve through exactly one available curated bundle");
  ensure(!marketplaceEntries.some((entry) => entry.name === publicId), `renamed source capability must not remain a separate marketplace card: ${publicId}`);
  ensure(!marketplaceEntries.some((entry) => entry.name === legacyId), `legacy card must not remain visible in seis-repo: ${legacyId}`);
}

for (const plugin of migratedRootPlugins) {
  ensure(migratedRootNames.has(plugin.name), `${plugin.name} must stay in the migrated root package list`);
  ensure(plugin.sourcePath === `./plugins/${plugin.name}`, `${plugin.name} root source path must be repo-owned`);
  ensure(plugin.installId === `${plugin.name}@seis-repo`, `${plugin.name} root install id must use seis-repo`);
}

const report = {
  ok: failures.length === 0,
  status: failures.length === 0 ? "historical-personal-capabilities-covered-by-curated-public-seis-repo" : "migration-coverage-failed",
  scope: "repo-only-static-validation",
  personalConfigRead: false,
  personalConfigMutated: false,
  historicalPersonalPluginCount: historicalPluginIds.length,
  legacyPublicRenameCount: legacyPublicRenames.length,
  legacyPublicRenames,
  migratedRootSourceCapabilityCount: migratedRootPlugins.length,
  applicationSourceCapabilityCount: applicationPlugins.length,
  topicSourceCapabilityCount: topicPlugins.length,
  retainedSourceCapabilityCount,
  canonicalDefaultInstallCount: canonicalPlugins.length,
  bundleMarketplaceCardCount: bundles.length,
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
