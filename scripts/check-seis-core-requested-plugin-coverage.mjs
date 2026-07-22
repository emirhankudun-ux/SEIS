#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const objectivePath = option("--objective");
const requestedPluginIds = objectivePath
  ? parseObjective(path.resolve(root, objectivePath))
  : [
      "seis",
      "seis-cloud",
      "seis-code",
      "seis-design",
      "seis-data",
      "seis-workspace-inspector",
      "seis-goal-integrity",
      "seis-repository-health",
      "seis-canonical-registry-validator",
      "seis-source-provenance",
      "seis-technology-ontology",
      "seis-route-explainer",
      "seis-agent-contract-validator",
      "seis-doc-indexer",
      "seis-design-token-audit",
      "seis-release-readiness",
      "seis-secret-boundary-scan",
      "seis-workflow-linter",
      "seis-repository-scorecard",
      "seis-changelog-validator",
      "seis-semver-audit",
      "seis-codeowners-audit",
      "seis-docs-freshness",
      "seis-public-safe-scan",
      "seis-a11y-regression",
      "seis-mcp-inventory",
      "seis-release-cadence",
      "seis-dependency-freshness",
      "seis-workflow-permission-audit",
      "seis-provider-health",
      "seis-model-fallback",
      "seis-rag-citation-coverage",
      "seis-agent-audit",
      "seis-localization-coverage",
      "seis-performance-budget",
      "seis-sbom-generator",
      "seis-license-compatibility",
      "seis-community-health",
      "seis-migration-guide-check",
      "seis-action-pin-audit",
      "seis-vulnerability-triage",
      "seis-test-flakiness",
      "seis-dora-metrics",
      "seis-pr-cycle-time",
      "seis-issue-triage",
      "seis-contributor-map",
      "seis-context-efficiency",
      "seis-download-anomaly",
      "seis-github-metrics-collector",
      "seis-maintainer-risk",
      "seis-artifact-attestation",
      "seis-branch-protection-audit",
      "seis-package-adoption",
      "seis-plugin-migration",
      "seis-plugin-discovery",
      "seis-ai-agent",
    ];

const uniqueRequested = [...new Set(requestedPluginIds)].sort();
const appSources = readJson("apps/seis-core/data/seis-core-plugin-sources.json");
const appCatalog = readJson("apps/seis-core/data/seis-core-plugin-catalog.json");
const suite = readJson("plugins/seis-ai-agent/assets/unified-suite.json");
const bundleCatalog = readJson("content/development/seis-public-plugin-bundle-catalog.json");
const failures = [];
const appIds = new Set((appSources.plugins || []).map((plugin) => plugin.name));
const appSuiteIds = new Set((suite.applicationDistribution?.plugins || []).map((plugin) => plugin.moduleId));
const applicationBundles = (bundleCatalog.bundles || []).filter((bundle) => bundle?.family === "application");
const expectedBundleBySource = buildExpectedBundleMap(applicationBundles);
const expectedApplicationSourceNames = [...expectedBundleBySource.keys()];
const applicationBundleIds = new Set(applicationBundles.map((bundle) => bundle.id));
const publicIds = new Set((suite.components || []).map((plugin) => plugin.moduleId));
const repoIds = new Set([...appIds, ...publicIds]);
const missingFromRepo = uniqueRequested.filter((id) => !repoIds.has(id));
const missingFromAppSuite = [...appIds].filter((id) => !appSuiteIds.has(id));
const missingSourcePaths = uniqueRequested
  .filter((id) => appIds.has(id))
  .map((id) => appSources.plugins.find((plugin) => plugin.name === id))
  .filter((plugin) => !plugin || !fs.existsSync(path.join(root, plugin.sourcePath)));
const appRequested = uniqueRequested.filter((id) => appIds.has(id));
const publicRequested = uniqueRequested.filter((id) => publicIds.has(id));

ensure(missingFromRepo.length === 0, `requested plugins missing from SEIS repo: ${missingFromRepo.join(", ")}`);
ensure(missingFromAppSuite.length === 0, `app-owned plugins missing from unified suite: ${missingFromAppSuite.join(", ")}`);
ensure(missingSourcePaths.length === 0, `requested app source paths missing: ${missingSourcePaths.map((plugin) => plugin?.name || "unknown").join(", ")}`);
ensure(appSources.owner === "apps/seis-core", "app source inventory must remain owned by apps/seis-core");
ensure(appCatalog.distribution?.sourceAvailableInRepository === true, "app catalog must expose direct repo availability");
ensure(appCatalog.distribution?.installSurface === "repo-source-app", "app catalog must expose the direct repo app surface");
ensure(appCatalog.distribution?.marketplaceName === "seis-repo", "app catalog must identify the public seis-repo marketplace");
ensure(appSources.publicDistribution?.distributionMode === "curated-bounded-public-bundles", "app source inventory must use curated bounded public bundles");
ensure(appSources.publicDistribution?.marketplaceEntryCount === 6, "app source inventory must expose six application bundle cards");
ensure(appSources.publicDistribution?.marketplaceCardCount === 34, "app source inventory must expose the 34-card marketplace total");
ensure(appSources.pluginCount === 75, "app source inventory must retain all 75 application sources");
ensure(appSources.publicDistribution?.sourceCapabilityCount === appSources.pluginCount, "app source inventory capability count must match app source count");
ensure(appSources.publicDistribution?.separateMarketplaceCards === false, "app sources must not be exposed as separate marketplace cards");
ensure(applicationBundles.length === 6 && applicationBundleIds.size === 6, "bundle catalog must contain exactly six uniquely identified application bundles");
ensure(sameUniqueStrings(appSources.publicDistribution?.bundleIds, [...applicationBundleIds]), "app source inventory bundle ids must match the canonical bundle catalog");
ensure(expectedBundleBySource.size === appSources.pluginCount, "application bundle catalog must cover every app source exactly once");
ensure(sameUniqueStrings((appSources.plugins || []).map((plugin) => plugin.name), expectedApplicationSourceNames), "app source inventory must contain every canonical bundled source exactly once");
ensure(sameUniqueStrings((suite.applicationDistribution?.plugins || []).map((plugin) => plugin.moduleId), expectedApplicationSourceNames), "unified suite must contain every canonical bundled app source exactly once");
ensure(applicationBundles.every((bundle) => Array.isArray(bundle.memberNames) && bundle.memberNames.length >= 1 && bundle.memberNames.length <= 15 && bundle.memberCount === bundle.memberNames.length), "every application bundle must contain 1..15 members and declare its exact member count");
ensure(appCatalog.distribution?.publicMarketplace === true, "app-owned sources must remain discoverable through the public curated marketplace");
ensure(appCatalog.distribution?.distributionScope === "curated-bounded-public-bundles", "app catalog must use curated bounded public bundles");
ensure(appCatalog.distribution?.marketplaceEntryCount === applicationBundleIds.size, "app catalog marketplace count must match the application bundle count");
ensure(appCatalog.distribution?.marketplaceCardCount === 34, "app catalog must expose the 34-card marketplace total");
ensure(appCatalog.distribution?.sourceCapabilityCount === appSources.pluginCount, "app catalog source capability count must match app source count");
ensure(appCatalog.distribution?.separateMarketplaceCards === false, "app catalog must not expose app sources as separate marketplace cards");
ensure(suite.applicationDistribution?.sourceAvailableInRepository === true, "suite must expose direct repo app availability");
ensure(suite.applicationDistribution?.marketplaceName === "seis-repo", "suite must identify the public seis-repo marketplace");
ensure(suite.applicationDistribution?.publicMarketplace === true, "suite app-owned sources must remain discoverable through the public curated marketplace");
ensure(suite.applicationDistribution?.publicDistribution === "curated-bounded-public-bundles", "suite app-owned distribution must use curated bounded public bundles");
ensure(suite.applicationDistribution?.marketplaceEntryCount === applicationBundleIds.size, "suite marketplace count must match the application bundle count");
ensure(suite.applicationDistribution?.marketplaceCardCount === 34, "suite must expose the 34-card marketplace total");
ensure(suite.applicationDistribution?.pluginCount === appSources.pluginCount, "suite source plugin count must match app source count");
ensure((suite.applicationDistribution?.plugins || []).every((plugin) => plugin.publicMarketplace === false), "suite app sources must not be separate marketplace cards");
ensure((suite.applicationDistribution?.plugins || []).every((plugin) => plugin.marketplaceBundleId === expectedBundleBySource.get(plugin.moduleId)), "every suite app source must resolve through its exact canonical application bundle");
ensure((appSources.plugins || []).every((plugin) => plugin.marketplaceBundleId === expectedBundleBySource.get(plugin.name) && plugin.marketplaceCard === false && plugin.marketplaceDiscoverable === true), "every app source record must expose its exact bundle and non-card semantics");

const report = {
  ok: failures.length === 0,
  id: "seis-core-requested-plugin-coverage",
  objectivePath: objectivePath ? path.relative(root, path.resolve(root, objectivePath)) : null,
  requestedLinkCount: requestedPluginIds.length,
  uniqueRequestedPluginCount: uniqueRequested.length,
  appOwnedRequestedPluginCount: appRequested.length,
  publicRepoRequestedPluginCount: publicRequested.length,
  appOwnedPluginCount: appIds.size,
  publicSourceModuleCount: publicIds.size,
  repoSourceCount: repoIds.size,
  missingFromRepo,
  missingFromAppSuite,
  missingSourcePaths: missingSourcePaths.map((plugin) => plugin?.name || null),
  directRepoSurface: {
    repository: "SEIS",
    application: "apps/seis-core",
    sourceRoot: "plugins/seis-core",
    sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
    installSurface: "repo-source-app",
    marketplaceName: "seis-repo",
    marketplaceDiscovery: "curated-bounded-public-bundles",
    separateMarketplaceCards: false,
    applicationBundleCardCount: applicationBundleIds.size,
    marketplaceCardCount: appCatalog.distribution?.marketplaceCardCount || null,
    sourceCapabilityCount: appSources.pluginCount,
    exactOnceBundleMembership: expectedBundleBySource.size === appSources.pluginCount,
  },
  failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);

function parseObjective(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  return [...text.matchAll(/\[@([^\]]+)\]\(plugin:\/\/[^)]+\)/g)].map((match) => match[1]);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function option(name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value.`);
  return value;
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function buildExpectedBundleMap(bundles) {
  const mapping = new Map();
  for (const bundle of bundles) {
    for (const name of bundle.memberNames || []) {
      if (mapping.has(name)) {
        failures.push(`${name}: application source appears in multiple canonical bundles`);
        continue;
      }
      mapping.set(name, bundle.id);
    }
  }
  return mapping;
}

function sameUniqueStrings(actual, expected) {
  const left = [...new Set(Array.isArray(actual) ? actual : [])].sort();
  const right = [...new Set(Array.isArray(expected) ? expected : [])].sort();
  return left.length === (Array.isArray(actual) ? actual.length : 0) && JSON.stringify(left) === JSON.stringify(right);
}
