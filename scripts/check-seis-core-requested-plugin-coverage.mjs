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
      "seis-personal-plugin-discovery",
      "seis-ai-agent",
    ];

const uniqueRequested = [...new Set(requestedPluginIds)].sort();
const appSources = readJson("apps/seis-core/data/seis-core-plugin-sources.json");
const appCatalog = readJson("apps/seis-core/data/seis-core-plugin-catalog.json");
const suite = readJson("plugins/seis-ai-agent/assets/unified-suite.json");
const appIds = new Set((appSources.plugins || []).map((plugin) => plugin.name));
const appSuiteIds = new Set((suite.applicationDistribution?.plugins || []).map((plugin) => plugin.moduleId));
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
const failures = [];

ensure(missingFromRepo.length === 0, `requested plugins missing from SEIS repo: ${missingFromRepo.join(", ")}`);
ensure(missingFromAppSuite.length === 0, `app-owned plugins missing from unified suite: ${missingFromAppSuite.join(", ")}`);
ensure(missingSourcePaths.length === 0, `requested app source paths missing: ${missingSourcePaths.map((plugin) => plugin?.name || "unknown").join(", ")}`);
ensure(appSources.owner === "apps/seis-core", "app source inventory must remain owned by apps/seis-core");
ensure(appCatalog.distribution?.sourceAvailableInRepository === true, "app catalog must expose direct repo availability");
ensure(appCatalog.distribution?.installSurface === "repo-source-app", "app catalog must expose the direct repo app surface");
ensure(appCatalog.distribution?.marketplaceName === "seis-repo", "app catalog must identify the public seis-repo marketplace");
ensure(appCatalog.distribution?.publicMarketplace === true, "app-owned plugins must be public marketplace cards");
ensure(appCatalog.distribution?.marketplaceEntryCount === appSources.pluginCount, "app catalog marketplace count must match app source count");
ensure(suite.applicationDistribution?.sourceAvailableInRepository === true, "suite must expose direct repo app availability");
ensure(suite.applicationDistribution?.marketplaceName === "seis-repo", "suite must identify the public seis-repo marketplace");
ensure(suite.applicationDistribution?.publicMarketplace === true, "suite app-owned distribution must be public marketplace cards");
ensure(suite.applicationDistribution?.marketplaceEntryCount === appSources.pluginCount, "suite marketplace count must match app source count");

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
    publicMarketplace: true,
    marketplaceEntryCount: appSources.pluginCount,
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
