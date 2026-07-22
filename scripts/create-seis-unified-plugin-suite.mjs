#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "plugins/seis-ai-agent/assets/unified-suite.json";
const publicFamilyPath = "content/development/seis-public-plugin-family.json";
const publicBundleCatalogPath = "content/development/seis-public-plugin-bundle-catalog.json";
const canonicalizationPath = "content/development/seis-plugin-canonicalization.json";
const agentManifestPath = "plugins/seis-ai-agent/.codex-plugin/plugin.json";
const applicationPluginSourcesPath = "apps/seis-core/data/seis-core-plugin-sources.json";
const applicationReleaseTrainPath = "content/development/seis-core-plugin-release-train.json";

const family = readJson(publicFamilyPath);
const bundleCatalog = readJson(publicBundleCatalogPath);
const canonicalization = readJson(canonicalizationPath);
const agentManifest = readJson(agentManifestPath);
const applicationPluginSources = readJson(applicationPluginSourcesPath);
const applicationReleaseTrain = readJson(applicationReleaseTrainPath);
const discoveredPluginNames = discoverSeisPluginNames();
const discoveredApplicationPluginNames = discoverApplicationPluginNames();
const publicPlugins = family.publicPlugins || [];
const embeddedModules = family.embeddedModules || family.plugins || [];
const familyMarketplace = family.marketplace || {};
const curatedMarketplace = family.mode === "public_seis_agent_with_curated_bounded_repository_bundle_cards";
const bundleMembership = buildBundleMembership(bundleCatalog);
const embeddedModuleNames = embeddedModules.map((plugin) => plugin.name);
const uncoveredSourcePlugins = discoveredPluginNames.filter((name) => !embeddedModuleNames.includes(name));
const applicationPlugins = buildApplicationPlugins(applicationPluginSources, bundleMembership);
const applicationPluginNames = applicationPlugins.map((plugin) => plugin.moduleId);
const uncoveredApplicationSourcePlugins = discoveredApplicationPluginNames.filter((name) => !applicationPluginNames.includes(name));
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
    "Define the canonical public SEIS-Agent install surface, preserve public repository source packages under SEIS, and keep live external capabilities approval-gated.",
  canonicalInstall: {
    installId: "seis-ai-agent@seis-repo",
    pluginName: "seis-ai-agent",
    defaultInstallMode: "single-public-plugin",
    installCommand: "npm run install:seis-ai-agent",
  },
  sourceContracts: {
    publicPluginFamily: publicFamilyPath,
    publicBundleCatalog: publicBundleCatalogPath,
    canonicalization: canonicalizationPath,
    agentManifest: agentManifestPath,
  },
  sourceDiscovery: {
    pattern: "plugins/seis-*/.codex-plugin/plugin.json plus plugins/seis/.codex-plugin/plugin.json",
    discoveredPluginNames,
    embeddedModuleNames,
    uncoveredSourcePlugins,
    applicationPattern: "plugins/seis-core/*/.codex-plugin/plugin.json",
    discoveredApplicationPluginNames,
    applicationPluginNames,
    uncoveredApplicationSourcePlugins,
    directRepoSourceRoots: ["plugins", "plugins/seis-core", "plugins/seis-bundles"],
    rule: "Every current or future SEIS plugin manifest must be registered as an embedded module in this single SEIS-Agent suite before it can be treated as a SEIS capability.",
  },
  publicDistribution: {
    publicPluginCount: publicPlugins.length,
    publicInstallIds: publicPlugins.map((plugin) => plugin.installId),
    marketplaceCardCount: familyMarketplace.publicPluginCount,
    optionalBundleCardCount: familyMarketplace.bundlePluginCount,
    applicationBundleCardCount: familyMarketplace.applicationBundlePluginCount,
    topicBundleCardCount: familyMarketplace.topicBundlePluginCount,
    sourceCapabilityCount: familyMarketplace.sourceCapabilityCount,
    embeddedModuleCount: components.length,
    applicationOwnedPluginCount: applicationPlugins.length,
    applicationMarketplacePluginCount: familyMarketplace.applicationBundlePluginCount,
    applicationSourceRoot: applicationPluginSources.sourceRoot,
    applicationSourceManifest: applicationPluginSourcesPath,
  },
  componentCount: components.length,
  components,
  applicationDistribution: {
    applicationId: applicationPluginSources.application?.id || "seis-core",
    applicationPath: "apps/seis-core",
    displayName: applicationPluginSources.application?.displayName || "SEIS Command Center",
    ownership: "apps/seis-core",
    sourceRoot: applicationPluginSources.sourceRoot,
    sourceManifest: applicationPluginSourcesPath,
    releaseTrain: applicationReleaseTrainPath,
    releaseLabel: applicationReleaseTrain.currentRelease?.label || null,
    releaseSemver: applicationReleaseTrain.currentRelease?.semver || null,
    pluginCount: applicationPlugins.length,
    sourceAvailableInRepository: true,
    publicRepositoryAvailable: true,
    publicAudience: "everyone",
    publicDistribution: "curated-bounded-public-bundles",
    marketplaceName: "seis-repo",
    publicMarketplace: true,
    marketplaceEntryCount: familyMarketplace.applicationBundlePluginCount,
    marketplaceCardCount: familyMarketplace.publicPluginCount,
    sourceCapabilityCount: familyMarketplace.sourceCapabilityCount,
    installSurface: "repo-source-app",
    executionMode: applicationPluginSources.application?.sourceExecution || "task-scoped-local-demo-only",
    publicReleaseAllowed: false,
    liveExternalCapabilities: "approval-gated",
    coreSourceOwner: false,
    plugins: applicationPlugins,
  },
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
      "create or update a public source module under plugins/seis-* or an app-owned source package under plugins/seis-core/<plugin-name>",
      "regenerate the apps/seis-core source inventory and catalog for every app-owned package",
      "register the package in this suite's generated source coverage and canonical route",
      "update the app-owned release train or shared SEIS-Agent suite release version only on its own evidence-gated track",
      "regenerate assets/unified-suite.json",
      "validate app catalog status, SEIS AI status, MCP routing, installer plan, and compatibility smoke",
    ],
    defaultInstallRule: "New SEIS plugins are embedded in seis-ai-agent and must not become separate public plugin or install targets.",
    applicationDefaultInstallRule: "New plugins for the user's SEIS Command Center application belong under plugins/seis-core, remain app-owned MIT source packages, and are added to a reviewed bounded public bundle when a marketplace card is justified without entering packages/seis-ai.",
  },
  releaseBoundary: {
    publicReleaseAllowed: false,
    publicRepositoryAvailable: true,
    publicAudience: "everyone",
    publicRepositoryRule: "Repository source is public and MIT-licensed; live external capabilities remain approval-gated.",
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
  if (record.publicDistribution.publicPluginCount !== 1 || record.publicDistribution.publicInstallIds[0] !== "seis-ai-agent@seis-repo") failures.push("SEIS-Agent must remain the canonical public orchestrator");
  if (!curatedMarketplace || familyMarketplace.publicPluginCount !== 34 || familyMarketplace.bundlePluginCount !== 33 || familyMarketplace.applicationBundlePluginCount !== 6 || familyMarketplace.topicBundlePluginCount !== 27 || familyMarketplace.sourceCapabilityCount !== 380) failures.push("curated public bundle family is invalid");
  if (record.publicDistribution.marketplaceCardCount !== familyMarketplace.publicPluginCount || record.publicDistribution.optionalBundleCardCount !== familyMarketplace.bundlePluginCount || record.publicDistribution.applicationBundleCardCount !== familyMarketplace.applicationBundlePluginCount || record.publicDistribution.topicBundleCardCount !== familyMarketplace.topicBundlePluginCount || record.publicDistribution.sourceCapabilityCount !== familyMarketplace.sourceCapabilityCount) failures.push("public distribution curated card counts are stale");
  if (record.publicDistribution.applicationMarketplacePluginCount !== familyMarketplace.applicationBundlePluginCount) failures.push("public distribution application bundle count is stale");
  if (record.publicDistribution.embeddedModuleCount !== record.componentCount) failures.push("public distribution must expose every embedded module");
  if (!Array.isArray(record.sourceDiscovery?.discoveredPluginNames) || record.sourceDiscovery.discoveredPluginNames.length !== record.componentCount) failures.push("suite discovery must cover every current SEIS plugin manifest");
  if (record.sourceDiscovery.uncoveredSourcePlugins.length !== 0) failures.push(`unified suite is missing source plugins: ${record.sourceDiscovery.uncoveredSourcePlugins.join(", ")}`);
  if (record.publicDistribution.applicationOwnedPluginCount !== record.applicationDistribution?.pluginCount) failures.push("application distribution count must match public distribution metadata");
  if (record.applicationDistribution?.applicationId !== "seis-core") failures.push("application distribution must target the SEIS Core app");
  if (record.applicationDistribution?.applicationPath !== "apps/seis-core") failures.push("application distribution must point at apps/seis-core");
  if (record.applicationDistribution?.ownership !== "apps/seis-core") failures.push("application-owned plugins must remain owned by apps/seis-core");
  if (record.applicationDistribution?.sourceRoot !== "plugins/seis-core") failures.push("application distribution source root is invalid");
  if (record.applicationDistribution?.sourceManifest !== applicationPluginSourcesPath) failures.push("application distribution source manifest is invalid");
  if (record.applicationDistribution?.releaseTrain !== applicationReleaseTrainPath) failures.push("application distribution release train is invalid");
  if (record.applicationDistribution?.releaseLabel !== applicationReleaseTrain.currentRelease?.label) failures.push("application distribution release label is stale");
  if (record.applicationDistribution?.releaseSemver !== applicationReleaseTrain.currentRelease?.semver) failures.push("application distribution release semver is stale");
  if (record.applicationDistribution?.sourceAvailableInRepository !== true) failures.push("application-owned sources must be available in the repository");
  if (record.applicationDistribution?.publicRepositoryAvailable !== true) failures.push("application-owned sources must be public-repository available");
  if (record.applicationDistribution?.publicAudience !== "everyone") failures.push("application-owned sources must declare everyone as the public audience");
  if (record.applicationDistribution?.publicDistribution !== "curated-bounded-public-bundles") failures.push("application-owned sources must use curated bounded public bundles");
  if (record.applicationDistribution?.marketplaceName !== "seis-repo") failures.push("app-owned sources must use the seis-repo marketplace");
  if (record.applicationDistribution?.publicMarketplace !== true) failures.push("app-owned sources must be public marketplace entries");
  if (record.applicationDistribution?.marketplaceEntryCount !== familyMarketplace.applicationBundlePluginCount || record.applicationDistribution?.marketplaceCardCount !== familyMarketplace.publicPluginCount || record.applicationDistribution?.sourceCapabilityCount !== familyMarketplace.sourceCapabilityCount) failures.push("app-owned curated marketplace counts are stale");
  if (record.applicationDistribution?.publicReleaseAllowed !== false) failures.push("live external public release must remain gated");
  if (record.applicationDistribution?.coreSourceOwner !== false) failures.push("packages/seis-ai must not own app plugin sources");
  if (!Array.isArray(record.applicationDistribution?.plugins) || record.applicationDistribution.plugins.length !== applicationPluginSources.pluginCount) failures.push("suite must cover every app-owned plugin source");
  if (!Array.isArray(record.sourceDiscovery?.discoveredApplicationPluginNames) || record.sourceDiscovery.discoveredApplicationPluginNames.length !== applicationPluginSources.pluginCount) failures.push("suite discovery must cover every app-owned plugin manifest");
  if (record.sourceDiscovery.uncoveredApplicationSourcePlugins.length !== 0) failures.push(`unified suite is missing app-owned source plugins: ${record.sourceDiscovery.uncoveredApplicationSourcePlugins.join(", ")}`);
  if (new Set(record.applicationDistribution.plugins.map((plugin) => plugin.moduleId)).size !== record.applicationDistribution.plugins.length) failures.push("app-owned module ids must be unique");
  if (!record.applicationDistribution.plugins.every((plugin) => plugin.sourcePath.startsWith("plugins/seis-core/") && plugin.publicMarketplace === false && typeof plugin.marketplaceBundleId === "string" && plugin.canonicalApplicationId === "seis-core" && plugin.canonicalInstallId === `${plugin.moduleId}@seis-repo`)) failures.push("app-owned modules must stay as retained sources with a bounded marketplace bundle");
  if (!record.futurePluginIntake?.applicationDefaultInstallRule?.includes("plugins/seis-core") || !record.futurePluginIntake?.applicationDefaultInstallRule?.includes("bounded public bundle")) failures.push("suite must define the curated app-owned intake rule");
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

function discoverApplicationPluginNames() {
  const applicationRoot = path.join(root, "plugins", "seis-core");
  if (!fs.existsSync(applicationRoot)) return [];
  return fs
    .readdirSync(applicationRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(applicationRoot, entry.name, ".codex-plugin", "plugin.json")))
    .map((entry) => entry.name)
    .sort();
}

function buildApplicationPlugins(sourceManifest, membership) {
  return (sourceManifest.plugins || []).map((sourcePlugin) => {
    const sourcePath = normalizeSourcePath(sourcePlugin.sourcePath);
    const manifestPath = `${sourcePath}/.codex-plugin/plugin.json`;
    const profilePath = `${sourcePath}/assets/plugin-profile.json`;
    const manifest = readJson(manifestPath);
    const profile = readJson(profilePath);
    return {
      moduleId: sourcePlugin.name,
      displayName: manifest.interface?.displayName || sourcePlugin.name,
      category: manifest.interface?.category || profile.category || "Developer",
      sourcePath,
      version: manifest.version,
      license: manifest.license,
      sourceClassification: profile.sourceClassification || "original-SEIS-local",
      lifecycleStatus: profile.status || "unknown",
      implementationState: profile.implementationState || "unknown",
      releaseTrainVersion: profile.releaseTrainVersion || sourcePlugin.releaseTrainVersion || null,
      releaseSemver: manifest.version || sourcePlugin.version || null,
      canonicalApplicationId: "seis-core",
      applicationPath: "apps/seis-core",
      canonicalInstallId: `${sourcePlugin.name}@seis-repo`,
      installSurface: "repo-source-app",
      publicMarketplace: false,
      marketplaceBundleId: membership.get(sourcePlugin.name) || null,
      publicRepositoryAvailable: true,
      publicAudience: "everyone",
      publicStatus: "retained-public-repository-source",
      publicReleaseAllowed: false,
      sourceModuleStatus: "retained-application-source-module",
      permissions: profile.permissions || { read: [], write: [], network: [], secrets: [] },
    };
  }).sort((left, right) => left.moduleId.localeCompare(right.moduleId));
}

function buildBundleMembership(catalog) {
  const membership = new Map();
  for (const bundle of Array.isArray(catalog?.bundles) ? catalog.bundles : []) {
    for (const member of Array.isArray(bundle?.memberNames) ? bundle.memberNames : []) {
      if (typeof member === "string" && !membership.has(member)) membership.set(member, bundle.id);
    }
  }
  return membership;
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
