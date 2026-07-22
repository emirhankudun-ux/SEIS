#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
  SEIS_PUBLIC_RELEASE_CHANGE_KIND,
} from "./lib/seis-public-release-version.mjs";

const root = process.cwd();
const jsonMode = process.argv.includes("--json");
const failures = [];
const expected = {
  marketplaceCards: 10,
  generalPlugins: 10,
  internalPackages: 30,
  packagesPerGeneralPlugin: 3,
  maximumPackageSize: 15,
  sourceCapabilities: 380,
  packagedSourceCapabilities: 375,
};

const marketplace = readJson(".agents/plugins/marketplace.json");
const family = readJson("content/development/seis-public-plugin-family.json");
const catalog = readJson("content/development/seis-public-plugin-bundle-catalog.json");
const guide = readJson("content/development/seis-public-plugin-selection-guide.json");
const policy = readJson("content/development/seis-public-plugin-release-policy.json");
const agentManifest = readJson("plugins/seis-ai-agent/.codex-plugin/plugin.json");
const agentProfile = readJson("plugins/seis-ai-agent/assets/agent-profile.json");

validateMarketplace();
validateFamily();
validateCatalog();
validateGuide();
validateArtifacts();
validateRelease();
validateProjectManifest();

const report = {
  status: failures.length ? "invalid" : "valid",
  model: "ten-general-plugins-with-thirty-internal-packages",
  releaseVersion: CURRENT_SEIS_PUBLIC_RELEASE_VERSION,
  expected,
  failureCount: failures.length,
  failures,
};

if (jsonMode) console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  if (!jsonMode) {
    console.error("SEIS ten-general-plugin distribution check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
  }
  process.exit(1);
}
if (!jsonMode) console.log("SEIS ten-general-plugin distribution contract passed.");

function validateMarketplace() {
  const entries = list(marketplace?.plugins);
  ensure(marketplace?.name === "seis-repo", "marketplace name must be seis-repo");
  ensure(entries.length === expected.marketplaceCards, "marketplace must expose exactly 10 public cards");
  ensure(entries[0]?.name === "seis-ai-agent", "SEIS-Agent must be the first canonical marketplace card");
  ensure(new Set(entries.map((entry) => entry?.name)).size === entries.length, "marketplace card names must be unique");
  ensure(entries.every((entry) => entry?.policy?.installation === "AVAILABLE" && entry?.policy?.authentication === "ON_INSTALL"), "every general plugin must keep the approved install/authentication policy");
  ensure(entries.every((entry) => typeof entry?.source?.path === "string" && !entry.source.path.startsWith("./plugins/seis-bundles/")), "internal packages must never be marketplace cards");
  ensure(entries.every((entry) => !/topic.*(?:01|02|03)|application.*(?:01|02|03)/i.test(entry?.name || "")), "numbered duplicate topic/application cards must not remain visible");
}

function validateFamily() {
  const entries = list(marketplace?.plugins);
  const generalPlugins = list(family?.generalPlugins);
  const internalPackages = list(family?.internalPackages);
  ensure(family?.version === 6, "family projection version must be 6");
  ensure(family?.mode === "ten_general_seis_plugins_with_thirty_internal_packages", "family mode is invalid");
  ensure(family?.marketplace?.publicPluginCount === expected.marketplaceCards, "family public card count is invalid");
  ensure(family?.marketplace?.generalPluginCount === expected.generalPlugins, "family general plugin count is invalid");
  ensure(family?.marketplace?.internalPackageCount === expected.internalPackages, "family internal package count is invalid");
  ensure(family?.marketplace?.internalPackageMarketplaceCardCount === 0, "family must expose no internal package marketplace cards");
  ensure(family?.marketplace?.sourceCapabilityCount === expected.sourceCapabilities, "family source capability count is invalid");
  ensure(generalPlugins.length === expected.generalPlugins, "family must define ten general plugins");
  ensure(internalPackages.length === expected.internalPackages, "family must define thirty internal packages");
  ensure(generalPlugins.filter((plugin) => plugin?.canonical === true).length === 1, "family must define exactly one canonical plugin");
  ensure(generalPlugins.find((plugin) => plugin?.canonical === true)?.name === "seis-ai-agent", "SEIS-Agent must be the canonical general plugin");
  ensure(generalPlugins.every((plugin) => plugin?.status === "release-ready-not-published" && list(plugin?.internalPackageIds).length === expected.packagesPerGeneralPlugin && plugin?.internalPackageCount === expected.packagesPerGeneralPlugin), "each general plugin must expose exactly three release-ready internal packages");
  ensure(new Set(generalPlugins.map((plugin) => plugin?.displayName)).size === generalPlugins.length, "general plugin display names must be unique");
  const assignedPackageIds = generalPlugins.flatMap((plugin) => list(plugin?.internalPackageIds));
  ensure(assignedPackageIds.length === expected.internalPackages && new Set(assignedPackageIds).size === expected.internalPackages, "internal packages must belong to exactly one general plugin");
  ensure(setEquals(assignedPackageIds, internalPackages.map((item) => item?.id)), "general profile package assignments must cover the internal package plan exactly once");
  ensure(internalPackages.every((item) => Number.isInteger(item?.memberCount) && item.memberCount > 0 && item.memberCount <= expected.maximumPackageSize), "each internal package must contain one through fifteen capabilities");
  ensure(internalPackages.reduce((sum, item) => sum + (item?.memberCount || 0), 0) === expected.packagedSourceCapabilities, "internal packages must retain all 375 app/topic source capabilities");
  ensure(setEquals(entries.map((entry) => entry?.name), generalPlugins.map((plugin) => plugin?.name)), "marketplace entries must match the ten general profiles");
}

function validateCatalog() {
  ensure(catalog?.schemaVersion === 2 && catalog?.id === "seis-public-plugin-package-catalog", "package catalog identity is invalid");
  ensure(catalog?.marketplace?.publicCardCount === expected.marketplaceCards, "catalog public card count is invalid");
  ensure(catalog?.marketplace?.generalPluginCardCount === expected.generalPlugins, "catalog general plugin count is invalid");
  ensure(catalog?.marketplace?.internalPackageCount === expected.internalPackages && catalog?.marketplace?.internalPackageCardCount === 0, "catalog internal package boundary is invalid");
  ensure(catalog?.marketplace?.maximumPackageSize === expected.maximumPackageSize, "catalog package cap is invalid");
  ensure(catalog?.installationPolicy?.maximumGeneralPluginSelectionsPerTask === 1, "catalog must enforce one general plugin per scoped task");
  ensure(catalog?.installationPolicy?.internalPackagesAutoInstalled === false && catalog?.installationPolicy?.sourceMembersAutoInstalled === false, "catalog must not auto-install internal packages or source members");
}

function validateGuide() {
  ensure(guide?.version === 2 && guide?.id === "seis-general-plugin-selection-guide", "selection guide identity is invalid");
  ensure(guide?.marketplace?.publicCardCount === expected.marketplaceCards && guide?.marketplace?.generalPluginCardCount === expected.generalPlugins, "selection guide card counts are invalid");
  ensure(guide?.marketplace?.internalPackageCount === expected.internalPackages && guide?.marketplace?.internalPackageCardCount === 0, "selection guide internal package boundary is invalid");
  ensure(guide?.selectionBoundary?.maximumGeneralPluginSelectionsPerTask === 1 && guide?.selectionBoundary?.bulkInstallAllowed === false, "selection guide must retain the one-general-plugin boundary");
  ensure(guide?.finder?.id === "seis-general-plugin-finder" && guide?.finder?.maximumResults === 3 && guide?.finder?.externalAccess === false && guide?.finder?.installation === false, "selection finder safety boundary is invalid");
  ensure(list(guide?.starterPaths).length === expected.generalPlugins, "selection guide must list the ten general plugins");
  const agentGuide = readJson("plugins/seis-ai-agent/assets/public-bundle-selection-guide.json");
  ensure(JSON.stringify(agentGuide) === JSON.stringify(guide), "SEIS-Agent selection guide asset must match the public guide");
}

function validateArtifacts() {
  const generalPlugins = list(family?.generalPlugins);
  const internalPackages = list(family?.internalPackages);
  for (const internalPackage of internalPackages) {
    const base = `plugins/seis-bundles/${internalPackage.id}`;
    const manifest = readJson(`${base}/.codex-plugin/plugin.json`);
    const profile = readJson(`${base}/assets/package-profile.json`);
    ensure(manifest?.name === internalPackage.id && manifest?.version === CURRENT_SEIS_PUBLIC_RELEASE_VERSION, `internal package manifest is invalid: ${internalPackage.id}`);
    ensure(list(manifest?.interface?.capabilities).length > 0 && list(manifest?.interface?.capabilities).length <= expected.maximumPackageSize, `internal package manifest exceeds the fifteen-capability limit: ${internalPackage.id}`);
    ensure(profile?.id === internalPackage.id && profile?.visibility === "internal-not-marketplace-card" && profile?.memberCount === internalPackage.memberCount && profile?.maximumMemberCount === expected.maximumPackageSize, `internal package profile is invalid: ${internalPackage.id}`);
    const expectedOwner = generalPlugins.find((plugin) => list(plugin?.internalPackageIds).includes(internalPackage.id));
    ensure(profile?.generalPlugin?.name === expectedOwner?.name, `internal package owner is invalid: ${internalPackage.id}`);
  }
  for (const plugin of generalPlugins.filter((item) => !item.canonical)) {
    const base = plugin.sourcePath.replace(/^\.\//, "");
    const manifest = readJson(`${base}/.codex-plugin/plugin.json`);
    const profile = readJson(`${base}/assets/general-plugin-profile.json`);
    ensure(manifest?.name === plugin.name && manifest?.version === CURRENT_SEIS_PUBLIC_RELEASE_VERSION, `general plugin manifest is invalid: ${plugin.name}`);
    ensure(list(manifest?.interface?.capabilities).length > 0 && list(manifest?.interface?.capabilities).length <= expected.maximumPackageSize, `general plugin manifest exceeds the fifteen-capability limit: ${plugin.name}`);
    ensure(profile?.id === plugin.id && profile?.name === plugin.name && profile?.visibility === "public-general-plugin" && profile?.internalPackageCount === expected.packagesPerGeneralPlugin, `general plugin profile is invalid: ${plugin.name}`);
    ensure(setEquals(profile?.internalPackageIds, plugin.internalPackageIds), `general plugin package profile is stale: ${plugin.name}`);
  }
  ensure(agentManifest?.name === "seis-ai-agent" && agentManifest?.version === CURRENT_SEIS_PUBLIC_RELEASE_VERSION, "SEIS-Agent release manifest is invalid");
  ensure(list(agentManifest?.interface?.capabilities).length > 0 && list(agentManifest?.interface?.capabilities).length <= expected.maximumPackageSize, "SEIS-Agent manifest exceeds the fifteen-capability limit");
  ensure(agentProfile?.releaseVersion === CURRENT_SEIS_PUBLIC_RELEASE_VERSION, "SEIS-Agent profile release version is invalid");
  ensure(agentProfile?.consolidationPolicy?.marketplacePolicy === "ten-general-seis-plugins-with-thirty-hidden-bounded-internal-packages", "SEIS-Agent policy is stale");
  ensure(agentProfile?.applicationSourceBoundary?.publicMarketplaceCardCount === expected.marketplaceCards && agentProfile?.applicationSourceBoundary?.internalPackageCount === expected.internalPackages, "SEIS-Agent application-source boundary is stale");
  ensure(agentProfile?.applicationSourceBoundary?.publicMarketplaceBundleCount === undefined, "SEIS-Agent profile must not retain a legacy bundle-count field");
}

function validateRelease() {
  ensure(policy?.currentRelease?.version === CURRENT_SEIS_PUBLIC_RELEASE_VERSION, "release policy current version is invalid");
  ensure(policy?.currentRelease?.changeKind === SEIS_PUBLIC_RELEASE_CHANGE_KIND, "release policy change kind is invalid");
  ensure(policy?.validation?.semverIncreased === true, "release policy must record a semver increase");
  ensure(policy?.policy?.structuralDistributionChangeRequiresVersionIncrease === true, "release policy must require a version increase for future structural changes");
  ensure(policy?.validation?.publicMarketplaceCardCount === expected.marketplaceCards && policy?.validation?.internalPackageCount === expected.internalPackages, "release policy distribution metrics are invalid");
}

function validateProjectManifest() {
  const manifest = readText("project.ecosystem.yaml");
  ensure(/card_count: 10/.test(manifest), "project manifest must declare ten marketplace cards");
  ensure(/general_plugin_card_count: 10/.test(manifest), "project manifest must declare ten general plugin cards");
  ensure(/internal_package_count: 30/.test(manifest), "project manifest must declare thirty internal packages");
  ensure(/internal_package_card_count: 0/.test(manifest), "project manifest must declare zero internal package cards");
}

function readJson(relativePath) {
  try {
    return JSON.parse(readText(relativePath));
  } catch {
    failures.push(`invalid or missing JSON: ${relativePath}`);
    return null;
  }
}

function readText(relativePath) {
  try {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  } catch {
    failures.push(`missing file: ${relativePath}`);
    return "";
  }
}

function list(value) { return Array.isArray(value) ? value : []; }
function ensure(condition, message) { if (!condition) failures.push(message); }
function setEquals(left, right) {
  const a = new Set(list(left));
  const b = new Set(list(right));
  return a.size === b.size && [...a].every((value) => b.has(value));
}
