#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { pluginIntegrationStatus } from "../packages/seis-ai/src/lib/plugin-integration.mjs";

const CURATED_TOPOLOGY = Object.freeze({
  marketplaceCardCount: 34,
  canonicalCardCount: 1,
  bundleCardCount: 33,
  applicationBundleCardCount: 6,
  topicBundleCardCount: 27,
  rootSourceModuleCount: 5,
  applicationSourcePackageCount: 75,
  topicSourcePackageCount: 300,
  retainedSourceCapabilityCount: 380,
  bundledSourceMemberCount: 375,
  maximumBundleMemberCount: 15,
});

const root = process.cwd();
const failures = [];
const options = parseOptions(process.argv.slice(2));
const { requireInstalled, runMcpSmoke, selectedBundleId } = options;
const cacheRoot = process.env.SEIS_CODEX_PLUGIN_CACHE_ROOT || path.join(os.homedir(), ".codex", "plugins", "cache");
const marketplaceName = "seis-repo";
const marketplaceCacheRoot = path.join(cacheRoot, marketplaceName);

const publicFamily = readJson("content/development/seis-public-plugin-family.json", "public plugin family contract");
const marketplace = readJson(".agents/plugins/marketplace.json", "repo marketplace");
const bundleCatalog = readJson("content/development/seis-public-plugin-bundle-catalog.json", "public bundle catalog");
const integration = pluginIntegrationStatus(root);
const installer = runInstallerCheck();
const retiredCompatibilityInstaller = runInstallerCheck(["--with-standalone-lanes"]);

const entries = Array.isArray(publicFamily?.marketplace?.entries) ? publicFamily.marketplace.entries : [];
const marketplaceCards = Array.isArray(marketplace?.plugins) ? marketplace.plugins : [];
const bundles = Array.isArray(bundleCatalog?.bundles) ? bundleCatalog.bundles : [];
const canonicalNames = ["seis-ai-agent"];
const expectedMigratedRootNames = pluginNames(publicFamily?.migratedRootPlugins);
const expectedApplicationNames = pluginNames(publicFamily?.applicationPlugins);
const expectedTopicNames = pluginNames(publicFamily?.topicPlugins);
const expectedEmbeddedModuleNames = (publicFamily?.embeddedModules || []).map((module) => module.name);
const bundleIds = bundles.map((bundle) => bundle?.id).filter(Boolean);
const expectedMarketplaceNames = [...canonicalNames, ...bundleIds];
const sourceCapabilityNames = [
  ...expectedMigratedRootNames,
  ...expectedApplicationNames,
  ...expectedTopicNames,
];
const expectedBundledMemberNames = [...expectedApplicationNames, ...expectedTopicNames];
const directSourceCardNames = marketplaceCards
  .map((card) => card?.name)
  .filter((name) => sourceCapabilityNames.includes(name));
const selectedBundle = selectedBundleId ? bundles.find((bundle) => bundle.id === selectedBundleId) || null : null;
if (selectedBundleId) ensure(Boolean(selectedBundle), `unknown optional bundle selection: ${selectedBundleId}`);

ensure(Array.isArray(publicFamily?.marketplace?.entries), "public plugin family entries must be an array");
ensure(Array.isArray(marketplace?.plugins), "repo marketplace plugins must be an array");
ensure(Array.isArray(bundleCatalog?.bundles), "public bundle catalog bundles must be an array");
ensure(entries.length === CURATED_TOPOLOGY.marketplaceCardCount, "public plugin family must expose exactly 34 curated marketplace cards");
ensure(marketplaceCards.length === CURATED_TOPOLOGY.marketplaceCardCount, "repo marketplace must expose exactly 34 curated cards");
ensure(publicFamily?.marketplace?.publicPluginCount === CURATED_TOPOLOGY.marketplaceCardCount, "public plugin family marketplace card count must be 34");
ensure(publicFamily?.marketplace?.canonicalOrchestratorCount === CURATED_TOPOLOGY.canonicalCardCount, "public plugin family must keep one canonical orchestrator");
ensure(publicFamily?.marketplace?.bundlePluginCount === CURATED_TOPOLOGY.bundleCardCount, "public plugin family must expose 33 optional bundle cards");
ensure(publicFamily?.marketplace?.applicationBundlePluginCount === CURATED_TOPOLOGY.applicationBundleCardCount, "public plugin family must expose six application bundle cards");
ensure(publicFamily?.marketplace?.topicBundlePluginCount === CURATED_TOPOLOGY.topicBundleCardCount, "public plugin family must expose 27 topic bundle cards");
ensure(publicFamily?.marketplace?.migratedRootPluginCount === CURATED_TOPOLOGY.rootSourceModuleCount, "public plugin family must retain five root source modules");
ensure(publicFamily?.marketplace?.applicationPluginCount === CURATED_TOPOLOGY.applicationSourcePackageCount, "public plugin family must retain 75 application source packages");
ensure(publicFamily?.marketplace?.topicPluginCount === CURATED_TOPOLOGY.topicSourcePackageCount, "public plugin family must retain 300 topic source packages");
ensure(publicFamily?.marketplace?.sourceCapabilityCount === CURATED_TOPOLOGY.retainedSourceCapabilityCount, "public plugin family must retain 380 source capabilities");
ensure(expectedMigratedRootNames.length === CURATED_TOPOLOGY.rootSourceModuleCount, "root source inventory must contain five modules");
ensure(expectedApplicationNames.length === CURATED_TOPOLOGY.applicationSourcePackageCount, "application source inventory must contain 75 packages");
ensure(expectedTopicNames.length === CURATED_TOPOLOGY.topicSourcePackageCount, "topic source inventory must contain 300 packages");
ensure(sourceCapabilityNames.length === CURATED_TOPOLOGY.retainedSourceCapabilityCount, "combined retained source inventory must contain 380 capabilities");
ensure(uniqueStrings(sourceCapabilityNames), "retained source capability names must be unique across root, application, and topic inventories");
ensure(directSourceCardNames.length === 0, "retained source capabilities must not be required as direct marketplace cards");
ensure(sameUniqueStrings(entries.map((entry) => entry?.name), expectedMarketplaceNames), "public family marketplace entries must match the canonical card and 33 bundle cards exactly");
ensure(sameUniqueStrings(marketplaceCards.map((card) => card?.name), expectedMarketplaceNames), "repo marketplace cards must match the canonical card and 33 bundle cards exactly");
ensure(marketplaceCards.every((card) => card?.name === "seis-ai-agent" || card?.source?.path?.startsWith("./plugins/seis-bundles/")), "repo marketplace must not project retained source packages as direct cards");

ensure(bundleCatalog?.marketplace?.publicCardCount === CURATED_TOPOLOGY.marketplaceCardCount, "bundle catalog must declare 34 public cards");
ensure(bundleCatalog?.marketplace?.canonicalCardCount === CURATED_TOPOLOGY.canonicalCardCount, "bundle catalog must declare one canonical card");
ensure(bundleCatalog?.marketplace?.bundleCardCount === CURATED_TOPOLOGY.bundleCardCount, "bundle catalog must declare 33 bundle cards");
ensure(bundleCatalog?.marketplace?.applicationBundleCardCount === CURATED_TOPOLOGY.applicationBundleCardCount, "bundle catalog must declare six application bundle cards");
ensure(bundleCatalog?.marketplace?.topicBundleCardCount === CURATED_TOPOLOGY.topicBundleCardCount, "bundle catalog must declare 27 topic bundle cards");
ensure(bundleCatalog?.sourceCapabilityInventory?.rootSourceModuleCount === CURATED_TOPOLOGY.rootSourceModuleCount, "bundle catalog must retain five root source modules");
ensure(bundleCatalog?.sourceCapabilityInventory?.applicationSourcePackageCount === CURATED_TOPOLOGY.applicationSourcePackageCount, "bundle catalog must retain 75 application source packages");
ensure(bundleCatalog?.sourceCapabilityInventory?.topicSourcePackageCount === CURATED_TOPOLOGY.topicSourcePackageCount, "bundle catalog must retain 300 topic source packages");
ensure(bundleCatalog?.sourceCapabilityInventory?.retainedSourcePackageCount === CURATED_TOPOLOGY.retainedSourceCapabilityCount, "bundle catalog must retain 380 source packages");
ensure(bundleCatalog?.sourceCapabilityInventory?.sourcePackagesDeleted === false, "bundle catalog must preserve retained source packages");
ensure(bundleCatalog?.installationPolicy?.bulkInstallRequired === false, "bundle catalog must not require bulk installation");
ensure(bundleCatalog?.installationPolicy?.bundleMembersAutoInstalled === false, "bundle catalog must not auto-install bundle members");
ensure(bundleCatalog?.installationPolicy?.bundleMembersRemainRepositorySources === true, "bundle catalog must keep bundle members as repository sources");
ensure(bundles.length === CURATED_TOPOLOGY.bundleCardCount, "bundle catalog must contain exactly 33 bundles");
ensure(uniqueStrings(bundleIds), "bundle catalog ids must be unique");
ensure(bundles.filter((bundle) => bundle?.family === "application").length === CURATED_TOPOLOGY.applicationBundleCardCount, "bundle catalog must contain six application bundles");
ensure(bundles.filter((bundle) => bundle?.family === "topic").length === CURATED_TOPOLOGY.topicBundleCardCount, "bundle catalog must contain 27 topic bundles");

const bundledMemberNames = [];
for (const bundle of bundles) {
  const memberNames = Array.isArray(bundle?.memberNames) ? bundle.memberNames : [];
  const familySourceNames = bundle?.family === "application" ? expectedApplicationNames : bundle?.family === "topic" ? expectedTopicNames : [];
  const expectedPath = `./plugins/seis-bundles/${bundle?.id || "missing-id"}`;
  ensure(["application", "topic"].includes(bundle?.family), `${bundle?.id || "bundle"} must declare an application or topic family`);
  ensure(bundle?.sourcePath === expectedPath, `${bundle?.id || "bundle"} source path must stay under plugins/seis-bundles`);
  ensureFile(bundle?.sourcePath || "", `${bundle?.id || "bundle"} source path`);
  ensure(memberNames.length > 0 && memberNames.length <= CURATED_TOPOLOGY.maximumBundleMemberCount, `${bundle?.id || "bundle"} must contain between one and 15 source members`);
  ensure(bundle?.memberCount === memberNames.length, `${bundle?.id || "bundle"} member count must match memberNames`);
  ensure(uniqueStrings(memberNames), `${bundle?.id || "bundle"} member names must be unique within the bundle`);
  ensure(memberNames.every((name) => familySourceNames.includes(name)), `${bundle?.id || "bundle"} must contain only ${bundle?.family || "declared-family"} source members`);
  bundledMemberNames.push(...memberNames);

  const profile = readJson(`${bundle?.sourcePath || ""}/assets/bundle-profile.json`, `${bundle?.id || "bundle"} profile`);
  ensure(profile?.id === bundle?.id, `${bundle?.id || "bundle"} profile id must match the catalog`);
  ensure(profile?.memberCount === memberNames.length, `${bundle?.id || "bundle"} profile member count must match the catalog`);
  ensure(profile?.installationPolicy?.defaultInstall === false, `${bundle?.id || "bundle"} must not be a default install`);
  ensure(profile?.installationPolicy?.optionalSelectionBundle === true, `${bundle?.id || "bundle"} must be explicitly selectable`);
  ensure(profile?.installationPolicy?.bundleMembersAutoInstalled === false, `${bundle?.id || "bundle"} must not auto-install member sources`);
  ensure(profile?.installationPolicy?.sourcePackagesRetained === true, `${bundle?.id || "bundle"} must retain source packages`);
}

const bundledMemberCoverageExactOnce =
  bundledMemberNames.length === CURATED_TOPOLOGY.bundledSourceMemberCount &&
  uniqueStrings(bundledMemberNames) &&
  sameUniqueStrings(bundledMemberNames, expectedBundledMemberNames);
ensure(bundledMemberCoverageExactOnce, "the 375 application and topic source packages must appear in bundles exactly once");
ensure(expectedMigratedRootNames.every((name) => !bundledMemberNames.includes(name)), "root source modules must remain separate from application and topic bundle membership");

for (const source of [
  ...(publicFamily?.migratedRootPlugins || []),
  ...(publicFamily?.applicationPlugins || []),
  ...(publicFamily?.topicPlugins || []),
]) {
  ensureFile(source?.sourcePath || "", `${source?.name || "retained source capability"} source path`);
}

for (const name of expectedMarketplaceNames) {
  const entry = entries.find((candidate) => candidate.name === name);
  const marketplaceEntry = marketplaceCards.find((candidate) => candidate.name === name);
  const expectedPath = name === "seis-ai-agent"
    ? "./plugins/seis-ai-agent"
    : bundles.find((bundle) => bundle.id === name)?.sourcePath;
  ensure(Boolean(entry), `public plugin family missing marketplace card ${name}`);
  ensure(Boolean(marketplaceEntry), `repo marketplace missing card ${name}`);
  ensure(entry?.sourcePath === expectedPath, `public family source path mismatch for ${name}`);
  ensure(marketplaceEntry?.source?.source === "local", `repo marketplace ${name} must use a local source`);
  ensure(marketplaceEntry?.source?.path === expectedPath, `repo marketplace path mismatch for ${name}`);
  ensure(entry?.installation === "AVAILABLE", `${name} must be AVAILABLE in the public family`);
  ensure(entry?.authentication === "ON_INSTALL", `${name} must authenticate ON_INSTALL in the public family`);
  ensure(marketplaceEntry?.policy?.installation === "AVAILABLE", `repo marketplace ${name} must be AVAILABLE`);
  ensure(marketplaceEntry?.policy?.authentication === "ON_INSTALL", `repo marketplace ${name} must authenticate ON_INSTALL`);
  ensureFile(expectedPath || "", `${name} marketplace source path`);
}

ensure(publicFamily?.defaultInstall?.installId === "seis-ai-agent@seis-repo", "public plugin family must keep SEIS-Agent as the canonical install");
ensure(publicFamily?.defaultInstall?.mode === "single-public-plugin", "public plugin family must use single-public-plugin mode");
ensure(publicFamily?.defaultInstall?.unifiedSuite === "plugins/seis-ai-agent/assets/unified-suite.json", "public plugin family must point at the unified suite");
ensure(expectedEmbeddedModuleNames.length >= 10, "public plugin family must retain every SEIS source module");
ensure(integration.ok === true, "SEIS AI plugin integration must load");
ensure(integration.installMode === "single-public-plugin", "SEIS AI integration must use single-public-plugin mode");
ensure(integration.standaloneLaneInstallMode === "source-module-only", "SEIS AI integration must keep lane packages as source modules only");
ensure(integration.publicPluginCount === CURATED_TOPOLOGY.canonicalCardCount, "SEIS AI integration must expose one canonical public plugin");
ensure(integration.embeddedModuleCount === expectedEmbeddedModuleNames.length, "SEIS AI integration must expose every embedded source module");
ensure(integration.unifiedSuite?.canonicalInstallId === "seis-ai-agent@seis-repo", "SEIS AI integration must expose the unified suite canonical install");
ensure(integration.unifiedSuite?.componentCount >= expectedEmbeddedModuleNames.length, "SEIS AI unified suite must contain every embedded source module");
ensure(integration.applicationOwnedPluginCount === CURATED_TOPOLOGY.applicationSourcePackageCount, "SEIS AI integration must expose every app-owned source package");
ensure(integration.applicationPluginSourceRoot === "plugins/seis-core", "SEIS AI integration must expose the app-owned source root");
ensure(integration.applicationPluginManifest === "apps/seis-core/data/seis-core-plugin-sources.json", "SEIS AI integration must expose the app-owned source manifest");
ensure(integration.applicationPluginInstallSurface === "repo-source-app", "SEIS AI integration must expose the direct repo app surface");
ensure(integration.applicationPluginSourceAvailableInRepository === true, "SEIS AI integration must mark app-owned sources as repo-available");
ensure(integration.applicationPluginPublicRepositoryAvailable === true, "SEIS AI integration must mark app-owned sources as public-repository available");
ensure(integration.applicationPluginPublicAudience === "everyone", "SEIS AI integration app public audience must be everyone");
ensure(integration.applicationPluginDistribution === "curated-bounded-public-bundles", "app-owned sources must use curated bounded public bundles");
ensure(integration.applicationPluginMarketplaceEntryCount === CURATED_TOPOLOGY.applicationBundleCardCount, "app-owned sources must project six application bundle cards");

for (const module of publicFamily?.embeddedModules || []) {
  ensure(module?.canonicalInstallId === "seis-ai-agent@seis-repo", `${module?.name || "embedded module"} must resolve to SEIS-Agent`);
  ensure(["public-plugin", "embedded-retained-source-module"].includes(module?.publicStatus), `${module?.name || "embedded module"} must declare its current public status`);
  ensureFile(module?.sourcePath || "", `${module?.name || "embedded module"} source path`);
}

ensure(installer.ok, "installer check-only command must succeed");
ensure(installer.payload?.primaryInstallId === "seis-ai-agent@seis-repo", "installer readiness must expose SEIS-Agent as primary install");
ensure(installer.payload?.defaultInstallMode === "single-public-plugin", "installer must default to one public plugin");
ensure(installer.payload?.targets?.length === 1, "default installer plan must contain only SEIS-Agent");
ensure(installer.payload?.targets?.[0] === "seis-ai-agent@seis-repo", "default installer target must be SEIS-Agent");
ensure(!retiredCompatibilityInstaller.ok, "retired standalone lane installer option must be rejected");

const smokeTargetNames = [...canonicalNames, ...(selectedBundle ? [selectedBundle.id] : [])];
const expectedReleaseVersions = Object.fromEntries(smokeTargetNames.map((name) => {
  const card = marketplaceCards.find((candidate) => candidate.name === name);
  const manifest = readJson(`${card?.source?.path || ""}/.codex-plugin/plugin.json`, `${name} source manifest`);
  return [name, manifest?.version || null];
}));
const cacheEntries = smokeTargetNames.map((name) => inspectCachePlugin(name, expectedReleaseVersions[name]));
const installedCount = cacheEntries.filter((entry) => entry.installed).length;
const currentInstalledCount = cacheEntries.filter((entry) => entry.installed && entry.currentVersion).length;
const cacheComplete = currentInstalledCount === smokeTargetNames.length;
if (requireInstalled) {
  ensure(cacheComplete, `local Codex plugin cache must contain every explicitly selected smoke target; found ${currentInstalledCount} current of ${smokeTargetNames.length} installed`);
}

const mcpSmoke = runMcpSmoke ? cacheEntries.map((entry) => smokeInstalledMcp(entry)) : [];
const mcpSmokePassed = mcpSmoke.every((entry) => entry.ok);
if (runMcpSmoke) {
  ensure(mcpSmokePassed, "installed canonical and explicitly selected bundle MCP smoke must pass");
}

const report = {
  ok: failures.length === 0,
  mode: runMcpSmoke ? (requireInstalled ? "require-installed-mcp-smoke" : "repo-contract-mcp-smoke") : (requireInstalled ? "require-installed" : "repo-contract"),
  repoRoot: root,
  marketplaceName,
  cacheRoot,
  status: cacheComplete ? "repo-and-local-cache-ready" : "repo-ready-local-cache-partial-or-missing",
  publicPluginCount: CURATED_TOPOLOGY.canonicalCardCount,
  marketplaceCardCount: CURATED_TOPOLOGY.marketplaceCardCount,
  canonicalCardCount: CURATED_TOPOLOGY.canonicalCardCount,
  bundleCardCount: CURATED_TOPOLOGY.bundleCardCount,
  applicationBundleCardCount: CURATED_TOPOLOGY.applicationBundleCardCount,
  topicBundleCardCount: CURATED_TOPOLOGY.topicBundleCardCount,
  migratedRootPluginCount: expectedMigratedRootNames.length,
  repoMarketplaceEntryCount: marketplaceCards.length,
  topicPluginCount: expectedTopicNames.length,
  topicPluginMarketplaceEntryCount: CURATED_TOPOLOGY.topicBundleCardCount,
  embeddedModuleCount: expectedEmbeddedModuleNames.length,
  applicationOwnedPluginCount: integration.applicationOwnedPluginCount,
  applicationPluginSourceRoot: integration.applicationPluginSourceRoot,
  applicationPluginManifest: integration.applicationPluginManifest,
  applicationPluginReleaseLabel: integration.applicationPluginReleaseLabel,
  applicationPluginReleaseSemver: integration.applicationPluginReleaseSemver,
  applicationPluginInstallSurface: integration.applicationPluginInstallSurface,
  applicationPluginSourceAvailableInRepository: integration.applicationPluginSourceAvailableInRepository,
  applicationPluginPublicRepositoryAvailable: integration.applicationPluginPublicRepositoryAvailable,
  applicationPluginPublicAudience: integration.applicationPluginPublicAudience,
  applicationPluginMarketplaceEntryCount: integration.applicationPluginMarketplaceEntryCount,
  sourceCapabilities: {
    retainedCount: sourceCapabilityNames.length,
    rootSourceModuleCount: expectedMigratedRootNames.length,
    applicationSourcePackageCount: expectedApplicationNames.length,
    topicSourcePackageCount: expectedTopicNames.length,
    bundledApplicationAndTopicMemberCount: bundledMemberNames.length,
    bundledApplicationAndTopicExactOnce: bundledMemberCoverageExactOnce,
    maximumBundleMemberCount: Math.max(0, ...bundles.map((bundle) => Number(bundle?.memberCount) || 0)),
    directMarketplaceCardCount: directSourceCardNames.length,
  },
  bundleSelection: {
    requestedId: selectedBundleId,
    selectedId: selectedBundle?.id || null,
    explicit: Boolean(selectedBundle),
    defaultInstall: false,
    bundleMembersAutoInstalled: false,
  },
  smokeTargetCount: smokeTargetNames.length,
  smokeTargets: smokeTargetNames.map((name) => `${name}@${marketplaceName}`),
  installedCount,
  currentInstalledCount,
  requireInstalled,
  mcpSmokeRequested: runMcpSmoke,
  mcpSmokePassed,
  runtime: {
    ok: integration.ok,
    installMode: integration.installMode,
    standaloneLaneInstallMode: integration.standaloneLaneInstallMode,
    publicPluginCount: integration.publicPluginCount,
    embeddedModuleCount: integration.embeddedModuleCount,
    primaryInstallId: integration.primaryInstallId,
    unifiedSuite: integration.unifiedSuite,
  },
  installer: {
    ok: installer.ok,
    targetCount: installer.payload?.targets?.length ?? 0,
    targets: installer.payload?.targets || [],
    retiredStandaloneLaneOptionRejected: !retiredCompatibilityInstaller.ok,
    retiredStandaloneLaneOptionError: retiredCompatibilityInstaller.error || null,
  },
  plugins: cacheEntries,
  mcpSmoke,
  failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);

function parseOptions(argv) {
  const parsed = {
    requireInstalled: false,
    runMcpSmoke: false,
    selectedBundleId: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--require-installed") {
      parsed.requireInstalled = true;
      continue;
    }
    if (argument === "--mcp-smoke") {
      parsed.runMcpSmoke = true;
      continue;
    }
    if (argument === "--bundle" || argument.startsWith("--bundle=")) {
      const value = argument === "--bundle" ? argv[index + 1] : argument.slice("--bundle=".length);
      if (argument === "--bundle") index += 1;
      if (!value || value.startsWith("--")) {
        failures.push("--bundle requires one explicit bundle card id");
        if (value?.startsWith("--")) index -= 1;
        continue;
      }
      if (parsed.selectedBundleId !== null) {
        failures.push("only one optional bundle may be selected for install smoke");
        continue;
      }
      parsed.selectedBundleId = value;
      continue;
    }
    failures.push(`unsupported install smoke option: ${argument}`);
  }
  return parsed;
}

function pluginNames(plugins) {
  return Array.isArray(plugins) ? plugins.map((plugin) => plugin?.name).filter(Boolean) : [];
}

function uniqueStrings(values) {
  return Array.isArray(values) && values.every((value) => typeof value === "string" && value.length > 0) && new Set(values).size === values.length;
}

function sameUniqueStrings(actual, expected) {
  return uniqueStrings(actual) && uniqueStrings(expected) && actual.length === expected.length && actual.every((value) => expected.includes(value));
}

function inspectCachePlugin(name, expectedVersion) {
  const pluginCacheRoot = path.join(marketplaceCacheRoot, name);
  const versions = listDirectories(pluginCacheRoot);
  const latestVersion = versions.at(-1) || null;
  const installedRoot = latestVersion ? path.join(pluginCacheRoot, latestVersion) : null;
  const manifestPath = installedRoot ? path.join(installedRoot, ".codex-plugin", "plugin.json") : null;
  const mcpPath = installedRoot ? path.join(installedRoot, ".mcp.json") : null;
  let manifestName = null;
  if (manifestPath && fs.existsSync(manifestPath)) {
    try {
      manifestName = JSON.parse(fs.readFileSync(manifestPath, "utf8")).name;
    } catch {
      manifestName = null;
    }
  }
  return {
    name,
    installId: `${name}@${marketplaceName}`,
    cachePath: pluginCacheRoot,
    installedRoot,
    installed: Boolean(latestVersion && manifestName === name),
    version: latestVersion,
    expectedVersion,
    currentVersion: Boolean(latestVersion && expectedVersion && latestVersion === expectedVersion && manifestName === name),
    manifestPresent: Boolean(manifestPath && fs.existsSync(manifestPath)),
    mcpPresent: Boolean(mcpPath && fs.existsSync(mcpPath)),
  };
}

function smokeInstalledMcp(entry) {
  if (!entry.installedRoot) {
    return { name: entry.name, ok: false, error: "plugin is not installed" };
  }

  const mcpManifestPath = path.join(entry.installedRoot, ".mcp.json");
  const mcp = readJsonAt(mcpManifestPath);
  const serverName = Object.keys(mcp?.mcpServers || {})[0];
  const server = serverName ? mcp.mcpServers[serverName] : null;
  if (!server?.command || !Array.isArray(server.args)) {
    return { name: entry.name, ok: false, error: "MCP manifest has no runnable server" };
  }

  const toolContract = toolContractFor(entry.name);
  const requests = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    ...toolContract.calls.map((call, index) => ({
      jsonrpc: "2.0",
      id: index + 3,
      method: "tools/call",
      params: call,
    })),
  ];

  const env = {
    ...process.env,
    SEIS_ROOT: root,
    SEIS_REPO_ROOT: root,
    [envName(entry.name)]: entry.installedRoot,
  };
  const result = spawnSync(server.command, server.args, {
    cwd: entry.installedRoot,
    env,
    input: requests.map(frame).join(""),
    timeout: 8000,
  });

  if (result.error) {
    return { name: entry.name, ok: false, serverName, error: result.error.message };
  }
  if (result.status !== 0) {
    return {
      name: entry.name,
      ok: false,
      serverName,
      exitStatus: result.status,
      stderr: String(result.stderr || "").slice(0, 1000),
    };
  }

  let responses;
  try {
    responses = parseMcpResponses(result.stdout);
  } catch (error) {
    return { name: entry.name, ok: false, serverName, error: error.message };
  }

  const tools = responses.find((response) => response.id === 2)?.result?.tools || [];
  const toolNames = tools.map((tool) => tool.name).sort();
  const missingTools = toolContract.requiredTools.filter((tool) => !toolNames.includes(tool));
  const callErrors = responses
    .filter((response) => response.id >= 3 && response.error)
    .map((response) => ({ id: response.id, error: response.error }));
  const missingResponses = requests
    .filter((request) => request.id !== undefined && !responses.some((response) => response.id === request.id))
    .map((request) => request.id);
  const unifiedSuite = entry.name === "seis-ai-agent"
    ? responses.find((response) => response.id === 3)?.result?.unifiedSuite || null
    : null;
  const unifiedSuiteOk =
    entry.name !== "seis-ai-agent" ||
    (
      unifiedSuite?.status === "active-single-public-plugin" &&
      unifiedSuite?.releaseVersion === "0.3.0+codex.20260712" &&
      unifiedSuite?.canonicalInstallId === "seis-ai-agent@seis-repo" &&
      unifiedSuite?.defaultInstallMode === "single-public-plugin" &&
      unifiedSuite?.componentCount >= 10 &&
      unifiedSuite?.publicPluginCount === 1 &&
      unifiedSuite?.embeddedModuleCount >= 10 &&
      unifiedSuite?.personalMarketplaceMutation === false
    );

  return {
    name: entry.name,
    ok: missingTools.length === 0 && callErrors.length === 0 && missingResponses.length === 0 && unifiedSuiteOk,
    serverName,
    command: [server.command, ...server.args].join(" "),
    toolCount: toolNames.length,
    requiredTools: toolContract.requiredTools,
    missingTools,
    callCount: toolContract.calls.length,
    callErrors,
    missingResponses,
    unifiedSuite,
    unifiedSuiteOk,
  };
}

function toolContractFor(name) {
  if (name === "seis-ai-agent") {
    return {
      requiredTools: ["seis_ai_agent_status", "seis_agent_lanes"],
      calls: [
        { name: "seis_ai_agent_status", arguments: {} },
        { name: "seis_agent_lanes", arguments: {} },
      ],
    };
  }
  if (name === "seis") {
    return {
      requiredTools: ["seis_specialist_lanes"],
      calls: [{ name: "seis_specialist_lanes", arguments: {} }],
    };
  }
  const prefix = name.replace(/^seis-/, "seis_").replaceAll("-", "_");
  return {
    requiredTools: [`${prefix}_status`, `${prefix}_plan`],
    calls: [
      { name: `${prefix}_status`, arguments: {} },
      { name: `${prefix}_plan`, arguments: { request: `Smoke test ${name} public plugin lane.` } },
    ],
  };
}

function frame(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function parseMcpResponses(stdout) {
  const responses = [];
  let buffer = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
  while (buffer.length > 0) {
    const separator = buffer.indexOf("\r\n\r\n");
    if (separator < 0) break;
    const header = buffer.slice(0, separator).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) {
      throw new Error(`MCP response missing Content-Length header: ${header.slice(0, 120)}`);
    }
    const start = separator + 4;
    const end = start + Number(match[1]);
    if (buffer.length < end) break;
    responses.push(JSON.parse(buffer.slice(start, end).toString("utf8")));
    buffer = buffer.slice(end);
  }
  if (responses.length === 0) {
    throw new Error("MCP server returned no framed responses");
  }
  return responses;
}

function envName(name) {
  return `${name.toUpperCase().replaceAll("-", "_")}_PLUGIN_ROOT`;
}

function listDirectories(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((entry) => {
      try {
        return fs.statSync(path.join(dir, entry)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function runInstallerCheck(extraArgs = []) {
  const result = spawnSync(process.execPath, ["scripts/install-seis-ai-agent.mjs", "--check-only", ...extraArgs], {
    cwd: root,
    encoding: "utf8",
    timeout: 5000,
  });
  if (result.error) {
    return { ok: false, error: result.error.message };
  }
  if (result.status !== 0) {
    return { ok: false, error: String(result.stderr || result.stdout).trim() };
  }
  try {
    return { ok: true, payload: JSON.parse(result.stdout) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  } catch (error) {
    failures.push(`${label} missing or invalid: ${file}: ${error.message}`);
    return null;
  }
}

function readJsonAt(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(file, label) {
  ensure(Boolean(file), `${label} path missing`);
  if (file) ensure(fs.existsSync(path.join(root, file)), `${label} missing: ${file}`);
}
