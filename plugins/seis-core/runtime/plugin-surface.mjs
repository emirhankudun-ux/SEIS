import fs from "node:fs";
import path from "node:path";

import { buildApplicationPluginCatalog } from "./plugin-catalog.mjs";

export const APPLICATION_PLUGIN_SURFACE_ID = "seis-core-direct-repo-plugin-surface";
export const APPLICATION_PLUGIN_SOURCE_MANIFEST = "apps/seis-core/data/seis-core-plugin-sources.json";
export const APPLICATION_PLUGIN_CATALOG = "apps/seis-core/data/seis-core-plugin-catalog.json";
export const APPLICATION_PLUGIN_UNIFIED_SUITE = "plugins/seis-ai-agent/assets/unified-suite.json";
export const APPLICATION_PLUGIN_RELEASE_TRAIN = "content/development/seis-core-plugin-release-train.json";
export const APPLICATION_PLUGIN_INSTALL_SURFACE = "repo-source-app";

export function readApplicationPluginSurface(repoRoot, options = {}) {
  const sourceManifest = readJson(repoRoot, APPLICATION_PLUGIN_SOURCE_MANIFEST);
  const catalog = readJson(repoRoot, APPLICATION_PLUGIN_CATALOG);
  const unifiedSuite = readJson(repoRoot, APPLICATION_PLUGIN_UNIFIED_SUITE);
  const releaseTrain = readJson(repoRoot, APPLICATION_PLUGIN_RELEASE_TRAIN);
  const currentRelease = releaseTrain.currentRelease || {};
  const sourcePlugins = Array.isArray(sourceManifest.plugins) ? sourceManifest.plugins : [];
  const catalogPlugins = Array.isArray(catalog.plugins) ? catalog.plugins : [];
  const suitePlugins = Array.isArray(unifiedSuite.applicationDistribution?.plugins)
    ? unifiedSuite.applicationDistribution.plugins
    : [];
  const sourceIds = sourcePlugins.map((plugin) => plugin.name).sort();
  const catalogIds = catalogPlugins.map((plugin) => plugin.name).sort();
  const suiteIds = suitePlugins.map((plugin) => plugin.moduleId).sort();
  const failures = [];

  ensure(sourceManifest.owner === "apps/seis-core", "source manifest ownership is not apps/seis-core", failures);
  ensure(sourceManifest.sourceRoot === "plugins/seis-core", "source manifest root is not plugins/seis-core", failures);
  ensure(sourceManifest.pluginCount === sourcePlugins.length, "source manifest count does not match its plugins", failures);
  ensure(catalog.sourceRoot === "plugins/seis-core", "catalog source root is not plugins/seis-core", failures);
  ensure(catalog.distribution?.repository === "SEIS", "catalog repository is not SEIS", failures);
  ensure(catalog.distribution?.sourceAvailableInRepository === true, "catalog does not mark source as repo-available", failures);
  ensure(catalog.distribution?.publicRepositoryAvailable === true, "catalog does not mark source as public-repository available", failures);
  ensure(catalog.distribution?.publicAudience === "everyone", "catalog public audience is not everyone", failures);
  ensure(catalog.distribution?.distributionScope === "direct-repository-source", "catalog distribution scope is not direct-repository-source", failures);
  ensure(catalog.distribution?.installSurface === APPLICATION_PLUGIN_INSTALL_SURFACE, "catalog install surface is not repo-source-app", failures);
  ensure(catalog.distribution?.publicMarketplace === true, "catalog must mark app plugins as public marketplace entries", failures);
  ensure(catalog.distribution?.marketplaceName === "seis-repo", "catalog marketplace must be seis-repo", failures);
  ensure(catalog.distribution?.marketplaceEntryCount === sourceIds.length, "catalog marketplace count must match app source count", failures);
  ensure(catalog.distribution?.coreSourceOwner === false, "catalog must keep core out of app source ownership", failures);
  ensure(unifiedSuite.applicationDistribution?.applicationId === "seis-core", "unified suite application id is not seis-core", failures);
  ensure(unifiedSuite.applicationDistribution?.sourceRoot === "plugins/seis-core", "unified suite app source root is stale", failures);
  ensure(unifiedSuite.applicationDistribution?.sourceAvailableInRepository === true, "unified suite does not mark app source as repo-available", failures);
  ensure(unifiedSuite.applicationDistribution?.publicRepositoryAvailable === true, "unified suite does not mark app source as public-repository available", failures);
  ensure(unifiedSuite.applicationDistribution?.publicAudience === "everyone", "unified suite public audience is not everyone", failures);
  ensure(unifiedSuite.applicationDistribution?.publicDistribution === "direct-repository-source", "unified suite distribution is not direct-repository-source", failures);
  ensure(unifiedSuite.applicationDistribution?.installSurface === APPLICATION_PLUGIN_INSTALL_SURFACE, "unified suite install surface is not repo-source-app", failures);
  ensure(unifiedSuite.applicationDistribution?.publicMarketplace === true, "unified suite must mark app plugins as public marketplace entries", failures);
  ensure(unifiedSuite.applicationDistribution?.marketplaceName === "seis-repo", "unified suite marketplace must be seis-repo", failures);
  ensure(unifiedSuite.applicationDistribution?.marketplaceEntryCount === sourceIds.length, "unified suite marketplace count must match app source count", failures);
  ensure(unifiedSuite.applicationDistribution?.coreSourceOwner === false, "unified suite must keep core out of app source ownership", failures);
  ensure(sourceManifest.releaseTrainVersion === currentRelease.label, "source manifest release label is stale", failures);
  ensure(catalog.release?.label === currentRelease.label, "catalog release label is stale", failures);
  ensure(unifiedSuite.applicationDistribution?.releaseLabel === currentRelease.label, "unified suite app release label is stale", failures);
  ensure(sameIds(sourceIds, catalogIds), "source manifest and catalog plugin ids differ", failures);
  ensure(sameIds(sourceIds, suiteIds), "source manifest and unified suite app ids differ", failures);
  ensure(sourcePlugins.every((plugin) => plugin.sourcePath.startsWith("plugins/seis-core/")), "an app source path escapes plugins/seis-core", failures);
  ensure(sourcePlugins.every((plugin) => fs.existsSync(path.join(repoRoot, plugin.sourcePath))), "an app source package is missing from the repository", failures);

  const catalogSummary = options.includeCatalog === true
    ? buildApplicationPluginCatalog(repoRoot, { limit: 100, includeStatus: options.includeStatus === true })
    : null;

  return {
    ok: failures.length === 0,
    id: APPLICATION_PLUGIN_SURFACE_ID,
    application: "apps/seis-core",
    repository: "SEIS",
    sourceRoot: "plugins/seis-core",
    sourceManifest: APPLICATION_PLUGIN_SOURCE_MANIFEST,
    catalog: APPLICATION_PLUGIN_CATALOG,
    unifiedSuite: APPLICATION_PLUGIN_UNIFIED_SUITE,
    releaseTrain: APPLICATION_PLUGIN_RELEASE_TRAIN,
    installSurface: APPLICATION_PLUGIN_INSTALL_SURFACE,
    release: compactRelease(currentRelease),
    counts: {
      source: sourceIds.length,
      catalog: catalogIds.length,
      unifiedSuite: suiteIds.length,
      marketplaceEntries: unifiedSuite.applicationDistribution?.marketplaceEntryCount ?? null,
    },
    policy: {
      sourceOwnership: "apps/seis-core",
      sourceAvailableInRepository: true,
      publicRepositoryAvailable: true,
      publicAudience: "everyone",
      distributionScope: "direct-repository-source",
      coreSourceOwner: false,
      marketplaceName: "seis-repo",
      publicMarketplace: true,
      marketplaceEntryCount: unifiedSuite.applicationDistribution?.marketplaceEntryCount ?? null,
      defaultPermissions: { write: [], network: [], secrets: [] },
      execution: "task-scoped-local-demo-only",
      publicReleaseAllowed: false,
      liveExternalCapabilities: "approval-gated",
    },
    pluginIds: sourceIds,
    catalogSummary,
    failures,
  };
}

export function createApplicationPluginInstallPlan(repoRoot) {
  const surface = readApplicationPluginSurface(repoRoot);
  return {
    ok: surface.ok,
    id: "seis-core-direct-repo-install-plan",
    mode: "repo-source-plan",
    executes: false,
    approvalRequired: false,
    application: surface.application,
    repository: surface.repository,
    sourceRoot: surface.sourceRoot,
    sourceManifest: surface.sourceManifest,
    pluginCount: surface.counts.source,
    installSurface: surface.installSurface,
    commands: [
      "npm run check:seis-core-requested-plugin-coverage",
      "npm run check:seis-core-plugin-sources",
      "npm run check:seis-core-plugin-catalog",
      "node plugins/seis-core/bin/seis-core-plugins.mjs list --status --json",
    ],
    reason: "App-owned plugins are public MIT-licensed repository sources for everyone; the plan validates and discovers them without copying source into packages/seis-ai, creating personal ownership, or performing external writes.",
    failures: surface.failures,
  };
}

function compactRelease(release) {
  return {
    label: release.label || null,
    semver: release.semver || null,
    major: release.major ?? null,
    revision: release.revision ?? null,
    microUnits: release.microUnits ?? null,
  };
}

function sameIds(left, right) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function readJson(repoRoot, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function ensure(condition, message, failures) {
  if (!condition) failures.push(message);
}
