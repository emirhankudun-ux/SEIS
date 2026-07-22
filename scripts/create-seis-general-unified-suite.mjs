#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { CURRENT_SEIS_PUBLIC_RELEASE_VERSION } from "./lib/seis-public-release-version.mjs";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const outputPath = "plugins/seis-ai-agent/assets/unified-suite.json";
const family = readJson("content/development/seis-public-plugin-family.json");
const catalog = readJson("content/development/seis-public-plugin-bundle-catalog.json");
const agentManifest = readJson("plugins/seis-ai-agent/.codex-plugin/plugin.json");
const suite = buildSuite();
const output = `${JSON.stringify(suite, null, 2)}\n`;

validate(suite);
if (checkMode) {
  const current = readText(outputPath);
  if (current !== output) {
    console.error(`SEIS unified suite is stale: ${outputPath}`);
    process.exit(1);
  }
  console.log("SEIS ten-general-plugin unified suite check passed.");
} else {
  fs.writeFileSync(path.join(root, outputPath), output);
  console.log(`Wrote ${outputPath}`);
}

function buildSuite() {
  const generalPlugins = list(family?.generalPlugins).map((plugin) => ({
    id: plugin.id,
    name: plugin.name,
    displayName: plugin.displayName,
    installId: plugin.installId,
    canonical: plugin.canonical === true,
    status: plugin.status,
    category: plugin.category,
    internalPackageIds: list(plugin.internalPackageIds),
  }));
  return {
    schemaVersion: 2,
    id: "seis-unified-plugin-suite",
    generatedAt: "2026-07-22",
    status: "active-ten-general-plugin-suite",
    releaseVersion: agentManifest?.version,
    publicReleaseAllowed: false,
    purpose: "Define the concise public SEIS plugin surface: ten general plugins, thirty bounded internal packages, and one task-matched installation at a time.",
    canonicalInstall: {
      installId: "seis-ai-agent@seis-repo",
      pluginName: "seis-ai-agent",
      defaultInstallMode: "canonical-general-plugin",
      installCommand: "npm run install:seis-ai-agent",
    },
    sourceContracts: {
      publicPluginFamily: "content/development/seis-public-plugin-family.json",
      publicPackageCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
      selectionGuide: "content/development/seis-public-plugin-selection-guide.json",
      releasePolicy: "content/development/seis-public-plugin-release-policy.json",
      agentManifest: "plugins/seis-ai-agent/.codex-plugin/plugin.json",
    },
    publicDistribution: {
      marketplaceName: "seis-repo",
      marketplaceCardCount: 10,
      canonicalCardCount: 1,
      generalPluginCardCount: 10,
      internalPackageCardCount: 0,
      internalPackageCount: 30,
      internalPackagesPerGeneralPlugin: 3,
      maximumInternalPackageSize: 15,
      sourceCapabilityCount: 380,
      packagedSourceCapabilityCount: 375,
      selectedGeneralPluginsPerTask: 1,
      sourcePackagesRetained: true,
      sourcePackagesDeleted: false,
      publicInstallIds: generalPlugins.map((plugin) => plugin.installId),
    },
    generalPlugins,
    sourceDiscovery: {
      migratedRootModuleCount: 5,
      applicationSourcePackageCount: 75,
      topicSourcePackageCount: 300,
      retainedSourceCapabilityCount: 380,
      embeddedModuleNames: list(family?.embeddedModules).map((module) => module?.name).filter(Boolean),
      rule: "Every future SEIS source capability belongs to one reviewed internal package and surfaces through one of the ten general plugins; it never creates a duplicate marketplace card by default.",
    },
    runtime: {
      mcpServer: "scripts/seis-general-plugin-mcp-server.mjs",
      embeddedSkillRoot: "skills",
      selectionToolPrefix: "seis_general_plugin_",
      executionMode: "foreground-sequential-reviewed",
    },
    releaseBoundary: {
      publicRepositoryAvailable: true,
      publicAudience: "everyone",
      publicReleaseAllowed: false,
      forbiddenWithoutHumanApproval: [
        "publish marketplace listing",
        "tag or release",
        "push to protected branch",
        "deploy",
        "provider credential use",
        "external write access",
      ],
    },
    qualityGates: [
      "npm run check:seis-public-plugin-family",
      "npm run check:seis-unified-plugin-suite",
      "npm run check:seis-public-plugin-release-policy",
      "npm run check:seis-ai-agent",
      "npm run check:seis-general-plugin-install-smoke",
    ],
    catalogChecksum: {
      marketplaceCardCount: catalog?.marketplace?.publicCardCount,
      internalPackageCount: catalog?.marketplace?.internalPackageCount,
      maximumPackageSize: catalog?.marketplace?.maximumPackageSize,
    },
  };
}

function validate(record) {
  const failures = [];
  if (record.releaseVersion !== CURRENT_SEIS_PUBLIC_RELEASE_VERSION) failures.push("release version is invalid");
  if (record.status !== "active-ten-general-plugin-suite") failures.push("suite status is invalid");
  if (record.publicReleaseAllowed !== false) failures.push("suite must not authorize public release");
  if (record.canonicalInstall?.installId !== "seis-ai-agent@seis-repo") failures.push("canonical install is invalid");
  if (record.publicDistribution?.marketplaceCardCount !== 10 || record.publicDistribution?.generalPluginCardCount !== 10 || record.publicDistribution?.internalPackageCount !== 30 || record.publicDistribution?.internalPackageCardCount !== 0) failures.push("public distribution counts are invalid");
  if (record.publicDistribution?.internalPackagesPerGeneralPlugin !== 3 || record.publicDistribution?.maximumInternalPackageSize !== 15 || record.publicDistribution?.selectedGeneralPluginsPerTask !== 1) failures.push("public selection boundary is invalid");
  if (record.runtime?.mcpServer !== "scripts/seis-general-plugin-mcp-server.mjs") failures.push("general-plugin MCP runtime is invalid");
  if (record.generalPlugins.length !== 10 || record.generalPlugins.filter((plugin) => plugin.canonical).length !== 1 || !record.generalPlugins.every((plugin) => plugin.internalPackageIds.length === 3)) failures.push("general profile topology is invalid");
  if (new Set(record.generalPlugins.flatMap((plugin) => plugin.internalPackageIds)).size !== 30) failures.push("internal package coverage is invalid");
  if (failures.length) {
    console.error("SEIS unified suite validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function readJson(relativePath) {
  try { return JSON.parse(readText(relativePath)); } catch { return null; }
}
function readText(relativePath) { return fs.readFileSync(path.join(root, relativePath), "utf8"); }
function list(value) { return Array.isArray(value) ? value : []; }
