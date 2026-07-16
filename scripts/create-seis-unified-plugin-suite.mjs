#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "plugins/seis-ai-agent/assets/unified-suite.json";
const publicFamilyPath = "content/development/seis-public-plugin-family.json";
const canonicalizationPath = "content/development/seis-plugin-canonicalization.json";
const agentManifestPath = "plugins/seis-ai-agent/.codex-plugin/plugin.json";

const family = readJson(publicFamilyPath);
const canonicalization = readJson(canonicalizationPath);
const agentManifest = readJson(agentManifestPath);
const discoveredPluginNames = discoverSeisPluginNames();
const publicPlugins = family.publicPlugins || [];
const embeddedModules = family.embeddedModules || family.plugins || [];
const embeddedModuleNames = embeddedModules.map((plugin) => plugin.name);
const uncoveredSourcePlugins = discoveredPluginNames.filter((name) => !embeddedModuleNames.includes(name));
const components = embeddedModules.map((plugin) => {
  const sourcePath = normalizeSourcePath(plugin.sourcePath);
  const manifestPath = `${sourcePath}/.codex-plugin/plugin.json`;
  const manifest = readJson(manifestPath);
  return {
    moduleId: plugin.name,
    role: plugin.role,
    sourcePath,
    version: manifest.version,
    license: manifest.license,
    canonicalInstallId: "seis-ai-agent@seis-repo",
    embeddedInSeisAiAgent: true,
    sourceModuleStatus: plugin.name === "seis-ai-agent" ? "public-plugin-root" : "embedded-source-module",
  };
});

const suite = {
  id: "seis-unified-plugin-suite",
  version: 1,
  generatedAt,
  status: "active-single-public-plugin",
  releaseVersion: agentManifest.version,
  publicReleaseAllowed: false,
  purpose:
    "Define the one public SEIS-Agent install surface that embeds every SEIS source module while preserving older personal installations as non-destructive aliases.",
  canonicalInstall: {
    installId: "seis-ai-agent@seis-repo",
    pluginName: "seis-ai-agent",
    defaultInstallMode: "single-public-plugin",
    installCommand: "npm run install:seis-ai-agent",
  },
  sourceContracts: {
    publicPluginFamily: publicFamilyPath,
    canonicalization: canonicalizationPath,
    agentManifest: agentManifestPath,
  },
  sourceDiscovery: {
    pattern: "plugins/seis-*/.codex-plugin/plugin.json plus plugins/seis/.codex-plugin/plugin.json",
    discoveredPluginNames,
    embeddedModuleNames,
    uncoveredSourcePlugins,
    rule: "Every current or future SEIS plugin manifest must be registered as an embedded module in this single SEIS-Agent suite before it can be treated as a SEIS capability.",
  },
  publicDistribution: {
    publicPluginCount: publicPlugins.length,
    publicInstallIds: publicPlugins.map((plugin) => plugin.installId),
    embeddedModuleCount: components.length,
  },
  componentCount: components.length,
  components,
  compatibility: {
    standaloneLaneInstallMode: "source-module-only",
    legacyAliasCount: canonicalization.legacyAliasCount,
    duplicateResolutionMode: canonicalization.duplicateResolutionMode,
    personalMarketplaceMutation: false,
    personalAliases: canonicalization.aliases.map((alias) => ({
      legacyInstallId: alias.legacyInstallId,
      canonicalInstallId: alias.canonicalInstallId,
      moduleId: alias.canonicalModuleId || alias.lane,
      userPluginPreserved: alias.userPluginPreserved === true,
    })),
  },
  runtime: {
    mcpServer: "scripts/seis-ai-agent-mcp-server.mjs",
    embeddedSkillRoot: "skills",
    embeddedLaneProfileRoot: "assets/lanes",
    seisAiConnection: "SEIS AI reports one public SEIS-Agent install and exposes all source modules through its embedded lane tools.",
  },
  futurePluginIntake: {
    owner: "seis-ai-agent",
    requiredOrder: [
      "create or update the source plugin under plugins/seis-*",
      "add the plugin to the embedded module generator and canonical route",
      "update the shared SEIS-Agent suite release version when the module is released",
      "regenerate assets/unified-suite.json",
      "validate SEIS AI status, MCP routing, installer plan, and compatibility smoke",
    ],
    defaultInstallRule: "New SEIS plugins are embedded in seis-ai-agent and must not become separate public plugin or install targets.",
  },
  releaseBoundary: {
    publicReleaseAllowed: false,
    forbiddenWithoutHumanApproval: [
      "removing or rewriting personal marketplace entries",
      "deleting embedded source-module directories",
      "publish marketplace listing",
      "push",
      "merge",
      "tag",
      "release",
      "deploy",
      "live SSH",
      "provider credential use",
    ],
  },
  qualityGates: [
    "npm run check:seis-unified-plugin-suite",
    "npm run check:seis-plugin-canonicalization",
    "npm run check:seis-agent-plugin-integration",
    "npm run check:seis-ai-agent",
    "npm run check:seis-public-plugin-install-smoke:local:mcp",
  ],
  completionRule:
    "The unified suite is complete for internal review when the single public SEIS-Agent plugin embeds every current source module at the shared release version, five personal aliases resolve to it without mutation, and SEIS AI reports the suite. Public release remains separately approval-gated.",
};

if (checkMode) {
  assertSame(sourcePath, `${JSON.stringify(suite, null, 2)}\n`);
  validateSuite(suite);
  console.log("SEIS unified plugin suite check passed.");
} else {
  writeFile(sourcePath, `${JSON.stringify(suite, null, 2)}\n`);
  validateSuite(suite);
  console.log(`Wrote ${sourcePath}`);
}

function validateSuite(record) {
  const failures = [];
  if (record.id !== "seis-unified-plugin-suite") failures.push("suite id is invalid");
  if (record.status !== "active-single-public-plugin") failures.push("suite status is invalid");
  if (record.publicReleaseAllowed !== false) failures.push("suite must not independently allow public release");
  if (record.canonicalInstall.installId !== "seis-ai-agent@seis-repo") failures.push("SEIS-Agent must remain the canonical install id");
  if (record.canonicalInstall.defaultInstallMode !== "single-public-plugin") failures.push("suite must use single-public-plugin default mode");
  if (record.componentCount < 10 || record.components.length !== record.componentCount) failures.push("suite must include every current SEIS component");
  if (new Set(record.components.map((component) => component.moduleId)).size !== record.componentCount) failures.push("suite module ids must be unique");
  if (!record.components.every((component) => component.canonicalInstallId === "seis-ai-agent@seis-repo")) failures.push("suite modules must share the SEIS-Agent canonical install");
  if (!record.components.every((component) => component.version === record.releaseVersion)) failures.push("all suite components must share the unified release version");
  if (!record.components.every((component) => component.license === "MIT")) failures.push("all suite components must be MIT");
  if (record.compatibility.legacyAliasCount !== 5) failures.push("suite must preserve five personal aliases");
  if (record.compatibility.personalMarketplaceMutation !== false) failures.push("suite must not mutate the personal marketplace");
  if (record.compatibility.standaloneLaneInstallMode !== "source-module-only") failures.push("standalone lanes must remain source modules only");
  if (record.compatibility.personalAliases.length !== 5) failures.push("suite must expose five personal aliases");
  if (!record.compatibility.personalAliases.every((alias) => alias.userPluginPreserved === true)) failures.push("suite must preserve every personal alias");
  if (record.publicDistribution.publicPluginCount !== 1 || record.publicDistribution.publicInstallIds[0] !== "seis-ai-agent@seis-repo") failures.push("only SEIS-Agent may be public");
  if (record.publicDistribution.embeddedModuleCount !== record.componentCount) failures.push("public distribution must expose every embedded module");
  if (!Array.isArray(record.sourceDiscovery?.discoveredPluginNames) || record.sourceDiscovery.discoveredPluginNames.length !== record.componentCount) failures.push("suite discovery must cover every current SEIS plugin manifest");
  if (record.sourceDiscovery.uncoveredSourcePlugins.length !== 0) failures.push(`unified suite is missing source plugins: ${record.sourceDiscovery.uncoveredSourcePlugins.join(", ")}`);
  if (!record.futurePluginIntake?.defaultInstallRule?.includes("must not become separate public plugin")) failures.push("suite must keep future plugins under the single public install surface");
  if (failures.length) {
    console.error("SEIS unified plugin suite validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function normalizeSourcePath(value) {
  return typeof value === "string" ? value.replace(/^\.\//, "") : "";
}

function discoverSeisPluginNames() {
  const pluginsRoot = path.join(root, "plugins");
  if (!fs.existsSync(pluginsRoot)) return [];
  return fs
    .readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && (entry.name === "seis" || entry.name.startsWith("seis-")))
    .filter((entry) => fs.existsSync(path.join(pluginsRoot, entry.name, ".codex-plugin", "plugin.json")))
    .map((entry) => entry.name)
    .sort();
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeFile(file, body) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), body);
}

function assertSame(file, expected) {
  const filePath = path.join(root, file);
  const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${file} is out of date. Run: npm run automation:seis-unified-plugin-suite`);
    process.exit(1);
  }
}
