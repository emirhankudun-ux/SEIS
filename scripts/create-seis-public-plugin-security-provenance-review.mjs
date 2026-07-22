#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "content/development/seis-public-plugin-security-provenance-review.json";
const reportPath = "reports/seis-public-plugin-security-provenance-review.md";
const familyPath = "content/development/seis-public-plugin-family.json";
const marketplacePath = ".agents/plugins/marketplace.json";
const lifecyclePath = "content/development/seis-public-plugin-lifecycle.json";
const freshTaskProofPath = "content/development/seis-public-plugin-fresh-task-proof.json";
const reloadEvidencePath = "content/development/seis-public-plugin-fresh-task-reload-evidence.json";
const unifiedSuitePath = "plugins/seis-ai-agent/assets/unified-suite.json";

const secretPatterns = [
  { id: "openai-api-key", category: "api_key", regex: /(^|[^A-Za-z0-9_])sk-[A-Za-z0-9]{20,}/ },
  { id: "aws-access-key", category: "cloud_key", regex: /AKIA[0-9A-Z]{16}/ },
  { id: "github-token", category: "github_token", regex: /ghp_[A-Za-z0-9_]{20,}/ },
  { id: "slack-token", category: "slack_token", regex: /xox[baprs]-[A-Za-z0-9-]{20,}/ },
  { id: "private-key-header", category: "private_key", regex: /BEGIN (RSA|OPENSSH|PRIVATE) KEY/ },
  { id: "inline-password-assignment", category: "password_assignment", regex: /password\s*=\s*['"][^'"]+['"]/i },
  { id: "inline-token-assignment", category: "token_assignment", regex: /token\s*=\s*['"][^'"]+['"]/i },
  { id: "inline-api-key-assignment", category: "api_key_assignment", regex: /api[_-]?key\s*=\s*['"][^'"]+['"]/i },
];

const scannedExtensions = new Set([
  ".json",
  ".md",
  ".mjs",
  ".js",
  ".cjs",
  ".ts",
  ".tsx",
  ".yml",
  ".yaml",
  ".sh",
  ".txt",
]);

const family = readJson(familyPath);
const marketplace = readJson(marketplacePath);
const lifecycle = readJson(lifecyclePath);
const freshTaskProof = readJson(freshTaskProofPath);
const reloadEvidence = readJson(reloadEvidencePath);
const unifiedSuite = readJson(unifiedSuitePath);

const bundleMembership = buildBundleMembership(family.bundlePackages || []);
const plugins = (family.publicPlugins || []).map((plugin) => reviewPlugin({
  ...plugin,
  sourceKind: "canonical-marketplace-card",
  distributionKind: "marketplace-card",
  marketplaceCard: true,
}));
const bundlePlugins = (family.bundlePackages || []).map((plugin) => reviewPlugin({
  ...plugin,
  name: plugin.name || plugin.id,
  sourceKind: "optional-bundle-marketplace-card",
  distributionKind: "marketplace-card",
  marketplaceCard: true,
}));
const migratedRootPlugins = (family.migratedRootPlugins || []).map((plugin) => reviewPlugin({
  ...plugin,
  sourceKind: "retained-root-source",
  distributionKind: "retained-source-capability",
  expectedMarketplaceBundleId: null,
}));
const applicationPlugins = (family.applicationPlugins || []).map((plugin) => reviewPlugin({
  ...plugin,
  sourceKind: "retained-application-source",
  distributionKind: "retained-source-capability",
  expectedMarketplaceBundleId: bundleMembership.byName.get(plugin.name)?.bundleId || null,
  expectedSourcePath: bundleMembership.byName.get(plugin.name)?.sourcePath || null,
  requireReadme: false,
}));
const embeddedModules = (family.embeddedModules || family.plugins || []).map((module) => reviewPlugin({
  ...module,
  installId: module.canonicalInstallId || "seis-ai-agent@seis-repo",
  sourceKind: "embedded-source-module",
  distributionKind: "embedded-source-module",
  marketplaceCard: false,
}));
const topicPlugins = (family.topicPlugins || []).map((plugin) => reviewPlugin({
  ...plugin,
  sourceKind: "retained-topic-source",
  distributionKind: "retained-source-capability",
  expectedMarketplaceBundleId: bundleMembership.byName.get(plugin.name)?.bundleId || null,
  expectedSourcePath: bundleMembership.byName.get(plugin.name)?.sourcePath || null,
}));
const retainedSourceCapabilities = [...migratedRootPlugins, ...applicationPlugins, ...topicPlugins];
const reviewedUnits = [...plugins, ...bundlePlugins, ...retainedSourceCapabilities, ...embeddedModules];
const secretFindings = reviewedUnits.flatMap((plugin) => plugin.secretFindings);
const blockingFindings = [...bundleMembership.findings, ...reviewedUnits.flatMap((plugin) => plugin.blockingFindings)];
const hygieneFindings = reviewedUnits.flatMap((plugin) => plugin.hygieneFindings);
const reviewPassed = blockingFindings.length === 0 && secretFindings.length === 0;
const applicationBundleCount = bundlePlugins.filter((plugin) => plugin.family === "application").length;
const topicBundleCount = bundlePlugins.filter((plugin) => plugin.family === "topic").length;
const marketplaceCardCount = plugins.length + bundlePlugins.length;
const expectedMarketplaceProjection = [...plugins, ...bundlePlugins]
  .map((plugin) => `${plugin.name}\u0000${plugin.sourcePath}`)
  .sort();
const actualMarketplaceProjection = (marketplace.plugins || [])
  .map((plugin) => `${plugin.name}\u0000${plugin.source?.path || ""}`)
  .sort();
const marketplaceProjectionExact = JSON.stringify(actualMarketplaceProjection) === JSON.stringify(expectedMarketplaceProjection);
const retainedSourceCapabilityCount = retainedSourceCapabilities.length;
const bundledSources = [...applicationPlugins, ...topicPlugins];
const bundledSourceCapabilityCount = bundledSources.length;
const retainedSourceIdentityUnique =
  new Set(retainedSourceCapabilities.map((plugin) => plugin.name)).size === retainedSourceCapabilityCount
  && new Set(retainedSourceCapabilities.map((plugin) => plugin.sourcePath)).size === retainedSourceCapabilityCount;
const retainedRootSourceIdentityExact = sameUniqueStrings(
  migratedRootPlugins.map((plugin) => plugin.name),
  ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"],
);
const bundledSourceIdentityExact =
  new Set(bundledSources.map((plugin) => plugin.name)).size === bundledSourceCapabilityCount
  && new Set(bundledSources.map((plugin) => plugin.sourcePath)).size === bundledSourceCapabilityCount
  && [...bundleMembership.byName.keys()].every((name) => bundledSources.some((plugin) => plugin.name === name));
const bundleMembershipExactOnce =
  bundleMembership.findings.length === 0
  && bundleMembership.byName.size === bundledSourceCapabilityCount
  && bundledSourceIdentityExact
  && applicationPlugins.every((plugin) => bundleMembership.byName.get(plugin.name)?.family === "application")
  && topicPlugins.every((plugin) => bundleMembership.byName.get(plugin.name)?.family === "topic")
  && bundledSources.every((plugin) => bundleMembership.byName.get(plugin.name)?.bundleId === plugin.marketplaceBundleId);

const review = {
  id: "seis-public-plugin-security-provenance-review",
  version: 2,
  generatedAt,
  status: reviewPassed ? "repo-local-security-provenance-reviewed" : "blocked-by-security-provenance-findings",
  decision: "not-ready-for-public-preview",
  sourcePath,
  reportPath,
  publicPluginFamily: familyPath,
  marketplace: marketplacePath,
  lifecycleContract: lifecyclePath,
  freshTaskProof: freshTaskProofPath,
  freshTaskReloadEvidence: reloadEvidencePath,
  unifiedSuite: unifiedSuitePath,
  publicReleaseAllowed: false,
  scope:
    "Repo-local security and provenance review for the current 34-card marketplace, all 380 retained repository source capabilities, and the embedded SEIS source modules before any public preview, publication, deployment, push, merge, tag, or release claim.",
  evidenceInputs: {
    publicPluginCount: plugins.length,
    bundlePluginCount: bundlePlugins.length,
    marketplaceCardCount,
    repoMarketplaceEntryCount: actualMarketplaceProjection.length,
    marketplaceProjectionExact,
    applicationBundleCount,
    topicBundleCount,
    migratedRootPluginCount: migratedRootPlugins.length,
    applicationPluginCount: applicationPlugins.length,
    embeddedModuleCount: embeddedModules.length,
    topicPluginCount: topicPlugins.length,
    retainedSourceCapabilityCount,
    retainedSourceIdentityUnique,
    retainedRootSourceIdentityExact,
    bundledSourceCapabilityCount,
    bundledSourceIdentityExact,
    bundleMembershipExactOnce,
    maximumBundleSize: bundleMembership.maximumBundleSize,
    lifecycleStatus: lifecycle.status,
    freshTaskReloadEvidenceStatus: reloadEvidence.status,
    freshTaskProofReloadEvidenceStatus: freshTaskProof.reloadEvidence?.status || null,
    unifiedSuiteReleaseVersion: unifiedSuite.releaseVersion || null,
    unifiedSuiteComponentCount: unifiedSuite.componentCount || 0,
    unifiedSuitePublicPluginCount: unifiedSuite.publicDistribution?.publicPluginCount || 0,
    unifiedSuiteEmbeddedModuleCount: unifiedSuite.publicDistribution?.embeddedModuleCount || 0,
  },
  reviewCriteria: [
    "The canonical SEIS-Agent card and all 33 optional bundle cards exist in the repository and form the complete current 34-card marketplace projection.",
    "All 380 retained source capabilities remain repository-owned sources: 5 roots, 75 application sources, and 300 topic sources.",
    "Every retained source has a source identity, marketplaceCard false, no standalone install id, and the exact optional bundle id when it belongs to the application or topic families.",
    "Every reviewed unit has a .codex-plugin/plugin.json manifest with matching name and MIT license.",
    "Every reviewed unit has an .mcp.json boundary; marketplace cards, root/topic sources, and embedded modules also have README.md documentation.",
    "Every MCP server command uses node with repo-local script arguments.",
    "The one-file unified suite contains every current embedded source module and keeps SEIS-Agent as the canonical default install.",
    "Every objective-derived topic source has a repo-local MIT manifest, README, MCP boundary, and no write, network, or secret permission.",
    "No high-confidence secret patterns are present in scanned plugin text files.",
    "Public availability does not imply live cloud, SSH, provider, private data, GitHub write, deploy, merge, tag, or publish authority.",
    "Provenance is repo-local and release remains human-approved.",
  ],
  aggregate: {
    pluginCount: plugins.length,
    reviewedPluginCount: plugins.filter((plugin) => plugin.reviewStatus === "pass").length,
    bundlePluginCount: bundlePlugins.length,
    reviewedBundlePluginCount: bundlePlugins.filter((plugin) => plugin.reviewStatus === "pass").length,
    marketplaceCardCount,
    reviewedMarketplaceCardCount: [...plugins, ...bundlePlugins].filter((plugin) => plugin.reviewStatus === "pass").length,
    applicationBundleCount,
    topicBundleCount,
    migratedRootPluginCount: migratedRootPlugins.length,
    reviewedMigratedRootPluginCount: migratedRootPlugins.filter((plugin) => plugin.reviewStatus === "pass").length,
    applicationPluginCount: applicationPlugins.length,
    reviewedApplicationPluginCount: applicationPlugins.filter((plugin) => plugin.reviewStatus === "pass").length,
    embeddedModuleCount: embeddedModules.length,
    reviewedEmbeddedModuleCount: embeddedModules.filter((module) => module.reviewStatus === "pass").length,
    topicPluginCount: topicPlugins.length,
    reviewedTopicPluginCount: topicPlugins.filter((plugin) => plugin.reviewStatus === "pass").length,
    retainedSourceCapabilityCount,
    reviewedRetainedSourceCapabilityCount: retainedSourceCapabilities.filter((plugin) => plugin.reviewStatus === "pass").length,
    retainedSourceIdentityUnique,
    retainedRootSourceIdentityExact,
    bundledSourceCapabilityCount,
    bundledSourceIdentityExact,
    bundleMembershipExactOnce,
    maximumBundleSize: bundleMembership.maximumBundleSize,
    secretFindingCount: secretFindings.length,
    blockingFindingCount: blockingFindings.length,
    hygieneFindingCount: hygieneFindings.length,
    scannedFileCount: reviewedUnits.reduce((sum, plugin) => sum + plugin.scannedFileCount, 0),
    totalFileCount: reviewedUnits.reduce((sum, plugin) => sum + plugin.fileCount, 0),
  },
  findings: {
    blocking: blockingFindings,
    secrets: secretFindings,
    hygiene: hygieneFindings,
  },
  releaseBoundary: {
    reviewType: "static-repo-local-review",
    rawSecretValuesStored: false,
    externalNetworkAccessUsed: false,
    liveProviderAccessUsed: false,
    liveSshUsed: false,
    publicReleaseAllowed: false,
    approvalRequiredFor: lifecycle.releasePolicy.forbiddenWithoutApproval,
  },
  historicalPreConsolidationSnapshot: {
    marketplaceCardCount: 381,
    status: "historical-direct-card-projection-not-current",
  },
  remainingReleaseBlockers: [
    "Human approval for public preview, release, publish, push, merge, tag, deploy, live SSH, or provider credentials has not been recorded.",
    "External clean-runner or public package installation proof has not been recorded.",
  ],
  plugins,
  bundlePlugins,
  migratedRootPlugins,
  applicationPlugins,
  embeddedModules,
  topicPlugins,
  qualityGates: [
    "npm run check:seis-public-plugin-security-provenance-review",
    "npm run check:seis-public-plugin-fresh-task-proof",
    "npm run check:seis-public-plugin-fresh-task-reload-evidence",
    "npm run check:seis-public-plugin-external-install-proof",
    "npm run check:seis-topic-plugin-matrix",
    "npm run check:seis-unified-plugin-suite",
    "npm run check:seis-public-plugin-install-smoke:local:mcp",
    "npm run check:seis-agent-plugin-integration",
  ],
  completionRule:
    "This review is complete for internal review when the canonical SEIS-Agent card, all 33 optional bundle cards, all 380 retained source capabilities, and every embedded source module pass their applicable manifest, license, MCP, source, documentation, bundle-membership, and secret-scan checks. Public release remains blocked until human approval and external clean-runner/public install proof exist.",
};

const report = renderReport(review);

if (checkMode) {
  assertSame(sourcePath, `${JSON.stringify(review, null, 2)}\n`);
  assertSame(reportPath, report);
  validateReview(review, report);
  console.log("SEIS public plugin security/provenance review check passed.");
} else {
  writeFile(sourcePath, `${JSON.stringify(review, null, 2)}\n`);
  writeFile(reportPath, report);
  validateReview(review, report);
  console.log(`Wrote ${sourcePath}`);
  console.log(`Wrote ${reportPath}`);
}

function reviewPlugin(plugin) {
  const sourcePath = plugin.sourcePath.replace(/^\.\//, "");
  const pluginRoot = path.join(root, sourcePath);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const mcpPath = path.join(pluginRoot, ".mcp.json");
  const readmePath = path.join(pluginRoot, "README.md");
  const blockingFindings = [];
  const hygieneFindings = [];
  const secretFindings = [];

  if (!fs.existsSync(pluginRoot)) blockingFindings.push(finding(plugin.name, "missing-source", sourcePath, "Plugin source path is missing."));
  if (!fs.existsSync(manifestPath)) blockingFindings.push(finding(plugin.name, "missing-manifest", path.relative(root, manifestPath), "Plugin manifest is missing."));
  if (!fs.existsSync(mcpPath)) blockingFindings.push(finding(plugin.name, "missing-mcp", path.relative(root, mcpPath), "MCP manifest is missing."));
  if (plugin.requireReadme !== false && !fs.existsSync(readmePath)) blockingFindings.push(finding(plugin.name, "missing-readme", path.relative(root, readmePath), "README is missing."));

  const manifest = fs.existsSync(manifestPath) ? readJson(path.relative(root, manifestPath)) : null;
  const mcp = fs.existsSync(mcpPath) ? readJson(path.relative(root, mcpPath)) : null;
  if (manifest) {
    if (manifest.name !== plugin.name) blockingFindings.push(finding(plugin.name, "manifest-name-mismatch", path.relative(root, manifestPath), "Manifest name does not match public family plugin name."));
    if (manifest.license !== "MIT") blockingFindings.push(finding(plugin.name, "license-not-mit", path.relative(root, manifestPath), "Manifest license must be MIT for this public plugin family."));
    if (!manifest.version) blockingFindings.push(finding(plugin.name, "missing-version", path.relative(root, manifestPath), "Manifest version is missing."));
  }
  if (plugin.distributionKind === "retained-source-capability") {
    const expectedBundleId = plugin.expectedMarketplaceBundleId ?? null;
    const actualBundleId = plugin.marketplaceBundleId ?? null;
    if (plugin.marketplaceCard !== false) {
      blockingFindings.push(finding(plugin.name, "retained-source-marked-as-card", familyPath, "Retained source capabilities must declare marketplaceCard false."));
    }
    if (plugin.marketplaceDiscoverable !== true) {
      blockingFindings.push(finding(plugin.name, "retained-source-not-discoverable", familyPath, "Retained source capabilities must remain discoverable through the curated marketplace."));
    }
    if (actualBundleId !== expectedBundleId) {
      blockingFindings.push(finding(plugin.name, "retained-source-bundle-mismatch", familyPath, `Expected ${expectedBundleId || "no bundle"}; found ${actualBundleId || "no bundle"}.`));
    }
    if (plugin.sourceKind !== "retained-root-source" && !expectedBundleId) {
      blockingFindings.push(finding(plugin.name, "retained-source-bundle-missing", familyPath, "Application and topic sources must resolve through exactly one optional bundle."));
    }
    if (plugin.expectedSourcePath && plugin.expectedSourcePath !== plugin.sourcePath) {
      blockingFindings.push(finding(plugin.name, "retained-source-path-mismatch", familyPath, "Retained source path differs from its canonical bundle-member path."));
    }
  }
  const serverReviews = reviewMcpServers(plugin.name, mcp, mcpPath, blockingFindings);
  const files = fs.existsSync(pluginRoot) ? listFiles(pluginRoot) : [];
  for (const file of files) {
    const relative = path.relative(root, file);
    if (path.basename(file) === ".DS_Store") {
      hygieneFindings.push(finding(plugin.name, "macos-ds-store", relative, "macOS metadata file should be excluded from public release artifacts."));
      continue;
    }
    if (!isTextScanCandidate(file)) continue;
    const body = safeRead(file);
    if (body === null) continue;
    for (const pattern of secretPatterns) {
      if (pattern.regex.test(body)) {
        secretFindings.push({
          plugin: plugin.name,
          id: pattern.id,
          category: pattern.category,
          path: relative,
          detail: "Potential secret-like pattern detected. Value intentionally not recorded.",
        });
      }
    }
  }

  return {
    name: plugin.name,
    sourceIdentity: plugin.distributionKind === "retained-source-capability" ? plugin.name : null,
    installId: plugin.distributionKind === "retained-source-capability" ? null : plugin.installId,
    distributionKind: plugin.distributionKind || "embedded-source-module",
    sourceKind: plugin.sourceKind || "public-plugin",
    marketplaceCard: plugin.marketplaceCard === true,
    marketplaceDiscoverable: plugin.marketplaceDiscoverable === true,
    marketplaceBundleId: plugin.marketplaceBundleId ?? null,
    family: plugin.family || null,
    memberCount: Array.isArray(plugin.members) ? plugin.members.length : null,
    role: plugin.role,
    sourcePath: plugin.sourcePath,
    reviewStatus: blockingFindings.length === 0 && secretFindings.length === 0 ? "pass" : "fail",
    provenance: {
      origin: "repo-local-seis-plugin-family",
      sourcePath: plugin.sourcePath,
      manifestLicense: manifest?.license || null,
      manifestVersion: manifest?.version || null,
      externalDependencyManifestPresent: fs.existsSync(path.join(pluginRoot, "package.json")),
    },
    files: {
      manifest: fs.existsSync(manifestPath),
      mcp: fs.existsSync(mcpPath),
      readme: fs.existsSync(readmePath),
    },
    mcpServers: serverReviews,
    fileCount: files.length,
    scannedFileCount: files.filter(isTextScanCandidate).length,
    blockingFindings,
    secretFindings,
    hygieneFindings,
  };
}

function buildBundleMembership(bundles) {
  const byName = new Map();
  const sourcePaths = new Set();
  const findings = [];
  const bundleIds = new Set();
  let maximumBundleSize = 0;

  for (const bundle of bundles) {
    const bundleId = bundle?.id || bundle?.name || null;
    const members = Array.isArray(bundle?.members) ? bundle.members : [];
    if (!bundleId) {
      findings.push(finding("distribution-topology", "bundle-id-missing", familyPath, "Every optional marketplace bundle must have an id."));
      continue;
    }
    if (bundleIds.has(bundleId)) {
      findings.push(finding(bundleId, "duplicate-bundle-id", familyPath, "Optional marketplace bundle ids must be unique."));
    }
    bundleIds.add(bundleId);
    maximumBundleSize = Math.max(maximumBundleSize, members.length);
    if (members.length < 1 || members.length > 15) {
      findings.push(finding(bundleId, "bundle-size-out-of-range", familyPath, "Optional marketplace bundles must contain between 1 and 15 retained sources."));
    }
    if (bundle.memberCount !== members.length) {
      findings.push(finding(bundleId, "bundle-member-count-mismatch", familyPath, "Bundle memberCount must equal the exact member array length."));
    }
    for (const member of members) {
      if (!member?.name || !member?.sourcePath) {
        findings.push(finding(bundleId, "bundle-member-identity-missing", familyPath, "Every bundle member must have a source name and source path."));
        continue;
      }
      if (byName.has(member.name)) {
        findings.push(finding(member.name, "duplicate-bundle-membership", familyPath, "A retained source may appear in exactly one optional bundle."));
        continue;
      }
      if (sourcePaths.has(member.sourcePath)) {
        findings.push(finding(member.name, "duplicate-bundle-source-path", familyPath, "A retained source path may appear in exactly one optional bundle member."));
        continue;
      }
      sourcePaths.add(member.sourcePath);
      byName.set(member.name, { bundleId, sourcePath: member.sourcePath, family: bundle.family || null });
    }
  }

  return { byName, findings, maximumBundleSize };
}

function sameUniqueStrings(actual, expected) {
  const left = [...new Set(actual)].sort();
  const right = [...new Set(expected)].sort();
  return left.length === actual.length && JSON.stringify(left) === JSON.stringify(right);
}

function reviewMcpServers(pluginName, mcp, mcpPath, blockingFindings) {
  const servers = Object.entries(mcp?.mcpServers || {});
  if (servers.length === 0) {
    blockingFindings.push(finding(pluginName, "missing-mcp-server", path.relative(root, mcpPath), "No MCP server is declared."));
    return [];
  }
  return servers.map(([name, server]) => {
    const command = server.command || null;
    const args = Array.isArray(server.args) ? server.args : [];
    const commandOk = command === "node";
    const argsOk =
      args.length > 0 &&
      args.every((arg) => typeof arg === "string") &&
      args.every((arg) => !path.isAbsolute(arg)) &&
      args.every((arg) => !arg.includes("..")) &&
      args.some((arg) => arg.endsWith(".mjs") || arg.endsWith(".js"));
    if (!commandOk) blockingFindings.push(finding(pluginName, "mcp-command-not-node", path.relative(root, mcpPath), `MCP server ${name} must use node.`));
    if (!argsOk) blockingFindings.push(finding(pluginName, "mcp-args-not-repo-local", path.relative(root, mcpPath), `MCP server ${name} must use repo-local script arguments.`));
    return {
      name,
      command,
      args,
      commandOk,
      argsOk,
      envKeys: Object.keys(server.env || {}),
    };
  });
}

function validateReview(review, report) {
  const failures = [];
  if (review.id !== "seis-public-plugin-security-provenance-review") failures.push("review id is invalid");
  if (review.version !== 2) failures.push("review schema version is invalid");
  if (review.publicReleaseAllowed !== false) failures.push("public release must remain blocked");
  if (review.aggregate.pluginCount !== 1 || review.aggregate.reviewedPluginCount !== 1) failures.push("review must pass the canonical SEIS-Agent marketplace card");
  if (review.aggregate.bundlePluginCount !== 33 || review.aggregate.reviewedBundlePluginCount !== 33) failures.push("review must pass all 33 optional bundle marketplace cards");
  if (review.aggregate.marketplaceCardCount !== 34 || review.aggregate.reviewedMarketplaceCardCount !== 34) failures.push("review must pass the complete current 34-card marketplace");
  if (review.aggregate.applicationBundleCount !== 6 || review.aggregate.topicBundleCount !== 27) failures.push("review bundle family counts are invalid");
  if (review.evidenceInputs.repoMarketplaceEntryCount !== 34 || review.evidenceInputs.marketplaceProjectionExact !== true) failures.push("repo marketplace must match the exact current 34-card projection");
  if (review.aggregate.migratedRootPluginCount !== 5) failures.push("review must cover all five retained root source capabilities");
  if (review.aggregate.reviewedMigratedRootPluginCount !== review.aggregate.migratedRootPluginCount) failures.push("every retained root source capability must pass review");
  if (review.aggregate.applicationPluginCount !== 75) failures.push("review must cover all 75 retained application source capabilities");
  if (review.aggregate.reviewedApplicationPluginCount !== review.aggregate.applicationPluginCount) failures.push("every retained application source capability must pass review");
  if (review.aggregate.embeddedModuleCount < 10) failures.push("review must cover every current embedded source module");
  if (review.aggregate.reviewedEmbeddedModuleCount !== review.aggregate.embeddedModuleCount) failures.push("every embedded source module must pass review");
  if (review.aggregate.topicPluginCount !== 300 || review.aggregate.topicPluginCount !== family.topicPlugins.length) failures.push("review must cover all 300 retained topic source capabilities");
  if (review.aggregate.reviewedTopicPluginCount !== review.aggregate.topicPluginCount) failures.push("every retained topic source capability must pass review");
  if (review.aggregate.retainedSourceCapabilityCount !== 380 || review.aggregate.reviewedRetainedSourceCapabilityCount !== 380) failures.push("review must pass all 380 retained source capabilities");
  if (review.aggregate.retainedSourceIdentityUnique !== true || review.aggregate.retainedRootSourceIdentityExact !== true) failures.push("retained source identities and the five-root inventory must be exact and unique");
  if (review.aggregate.bundledSourceIdentityExact !== true) failures.push("application/topic source identities must exactly match the canonical bundle membership map");
  if (review.aggregate.bundledSourceCapabilityCount !== 375 || review.aggregate.bundleMembershipExactOnce !== true) failures.push("review must map all 375 application/topic sources through exactly one bundle");
  if (review.aggregate.maximumBundleSize > 15) failures.push("review bundle size exceeds the 15-source cap");
  if (review.aggregate.blockingFindingCount !== 0) failures.push("blocking findings must be zero for internal review");
  if (review.aggregate.secretFindingCount !== 0) failures.push("secret findings must be zero for internal review");
  if (review.evidenceInputs.unifiedSuiteComponentCount < 10) failures.push("unified suite must contain every current SEIS component");
  if (review.evidenceInputs.unifiedSuitePublicPluginCount !== 1 || review.evidenceInputs.unifiedSuiteEmbeddedModuleCount < 10) failures.push("unified suite must expose one public plugin and every embedded source module");
  if (review.evidenceInputs.unifiedSuiteReleaseVersion !== "0.3.0+codex.20260712") failures.push("unified suite release version is invalid");
  if (review.releaseBoundary.rawSecretValuesStored !== false) failures.push("raw secret values must not be stored");
  if (review.historicalPreConsolidationSnapshot?.marketplaceCardCount !== 381 || review.historicalPreConsolidationSnapshot?.status !== "historical-direct-card-projection-not-current") failures.push("the 381-card value may appear only as an explicit non-current historical snapshot");
  for (const plugin of [...review.plugins, ...review.bundlePlugins]) {
    if (plugin.distributionKind !== "marketplace-card" || plugin.marketplaceCard !== true || plugin.installId !== `${plugin.name}@seis-repo`) {
      failures.push(`${plugin.name}: marketplace-card identity is invalid`);
    }
  }
  for (const plugin of review.migratedRootPlugins) {
    if (!validRetainedSource(plugin, null)) failures.push(`${plugin.name}: retained root source semantics are invalid`);
  }
  for (const plugin of [...review.applicationPlugins, ...review.topicPlugins]) {
    const expectedBundleId = bundleMembership.byName.get(plugin.name)?.bundleId || null;
    if (!validRetainedSource(plugin, expectedBundleId)) failures.push(`${plugin.name}: retained bundled source semantics are invalid`);
  }
  if (!review.qualityGates.includes("npm run check:seis-public-plugin-security-provenance-review")) failures.push("quality gates must include this check");
  if (!review.qualityGates.includes("npm run check:seis-public-plugin-external-install-proof")) failures.push("quality gates must include the external install proof check");
  if (!review.qualityGates.includes("npm run check:seis-unified-plugin-suite")) failures.push("quality gates must include the unified suite check");
  if (!report.includes("NO-GO for public preview")) failures.push("report must keep public preview as NO-GO");
  if (!report.includes("Current marketplace cards: 34") || !report.includes("Optional bundle cards: 33 (6 application + 27 topic)")) failures.push("report must expose the current marketplace topology");
  if (!report.includes("Retained source capabilities: 380 (5 root + 75 application + 300 topic)")) failures.push("report must expose the retained source topology");
  if (!report.includes("Historical pre-consolidation snapshot: 381 cards (not current)")) failures.push("report must label the 381-card projection as historical and non-current");
  if (!report.includes("## Retained Root Source Review")) failures.push("report must present root packages only as retained source capabilities");
  if (failures.length) {
    console.error("SEIS public plugin security/provenance review validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function validRetainedSource(plugin, expectedBundleId) {
  return plugin.sourceIdentity === plugin.name
    && plugin.installId === null
    && plugin.distributionKind === "retained-source-capability"
    && plugin.marketplaceCard === false
    && plugin.marketplaceDiscoverable === true
    && plugin.marketplaceBundleId === expectedBundleId;
}

function renderReport(review) {
  const pluginRows = review.plugins
    .map((plugin) => `| ${plugin.name} | ${plugin.installId} | ${plugin.reviewStatus} | ${plugin.provenance.manifestLicense || "n/a"} | ${plugin.mcpServers.length} | ${plugin.secretFindings.length} | ${plugin.hygieneFindings.length} |`)
    .join("\n");
  const bundleRows = review.bundlePlugins
    .map((plugin) => `| ${plugin.name} | ${plugin.installId} | ${plugin.family} | ${plugin.memberCount} | ${plugin.reviewStatus} | ${plugin.provenance.manifestLicense || "n/a"} | ${plugin.mcpServers.length} | ${plugin.secretFindings.length} |`)
    .join("\n");
  const moduleRows = review.embeddedModules
    .map((module) => `| ${module.name} | ${module.installId} | ${module.reviewStatus} | ${module.provenance.manifestLicense || "n/a"} | ${module.secretFindings.length} |`)
    .join("\n");
  const migratedRootRows = review.migratedRootPlugins
    .map((plugin) => retainedSourceRow(plugin))
    .join("\n");
  const applicationRows = review.applicationPlugins
    .map((plugin) => retainedSourceRow(plugin))
    .join("\n");
  const topicRows = review.topicPlugins
    .map((plugin) => retainedSourceRow(plugin))
    .join("\n");
  const hygieneRows = review.findings.hygiene.length
    ? review.findings.hygiene.map((item) => `| ${item.plugin} | ${item.id} | ${item.path} | ${item.detail} |`).join("\n")
    : "| none | none | none | none |";
  const blockerRows = review.findings.blocking.length
    ? review.findings.blocking.map((item) => `| ${item.plugin} | ${item.id} | ${item.path} | ${item.detail} |`).join("\n")
    : "| none | none | none | none |";
  return `# SEIS Public Plugin Security Provenance Review

- Generated: ${review.generatedAt}
- Status: ${review.status}
- Decision: ${review.decision}
- Public release allowed: ${review.publicReleaseAllowed ? "yes" : "no"}
- Secret findings: ${review.aggregate.secretFindingCount}
- Blocking findings: ${review.aggregate.blockingFindingCount}
- Hygiene findings: ${review.aggregate.hygieneFindingCount}
- Current marketplace cards: ${review.aggregate.marketplaceCardCount}
- Optional bundle cards: ${review.aggregate.bundlePluginCount} (${review.aggregate.applicationBundleCount} application + ${review.aggregate.topicBundleCount} topic)
- Retained source capabilities: ${review.aggregate.retainedSourceCapabilityCount} (${review.aggregate.migratedRootPluginCount} root + ${review.aggregate.applicationPluginCount} application + ${review.aggregate.topicPluginCount} topic)
- Exact-once bundled sources: ${review.aggregate.bundledSourceCapabilityCount}
- Historical pre-consolidation snapshot: ${review.historicalPreConsolidationSnapshot.marketplaceCardCount} cards (not current)

## Canonical Marketplace Card Review

| plugin | install id | review | license | MCP servers | secrets | hygiene |
| --- | --- | --- | --- | --- | --- | --- |
${pluginRows}

## Optional Bundle Marketplace Card Review

| card | install id | family | members | review | license | MCP servers | secrets |
| --- | --- | --- | --- | --- | --- | --- | --- |
${bundleRows}

## Retained Root Source Review

| source identity | source path | marketplace card | bundle | review | license | MCP servers | secrets |
| --- | --- | --- | --- | --- | --- | --- | --- |
${migratedRootRows}

## Retained Application Source Review

| source identity | source path | marketplace card | bundle | review | license | MCP servers | secrets |
| --- | --- | --- | --- | --- | --- | --- | --- |
${applicationRows}

## Embedded Source Module Review

| module | canonical install | review | license | secrets |
| --- | --- | --- | --- | --- |
${moduleRows}

## Retained Objective-Derived Topic Source Review

| source identity | source path | marketplace card | bundle | review | license | MCP servers | secrets |
| --- | --- | --- | --- | --- | --- | --- | --- |
${topicRows}

## Blocking Findings

| plugin | id | path | detail |
| --- | --- | --- | --- |
${blockerRows}

## Hygiene Findings

| plugin | id | path | detail |
| --- | --- | --- | --- |
${hygieneRows}

## Release Boundary

- Raw secret values stored: ${review.releaseBoundary.rawSecretValuesStored ? "yes" : "no"}
- External network access used: ${review.releaseBoundary.externalNetworkAccessUsed ? "yes" : "no"}
- Live provider access used: ${review.releaseBoundary.liveProviderAccessUsed ? "yes" : "no"}
- Live SSH used: ${review.releaseBoundary.liveSshUsed ? "yes" : "no"}

## Remaining Release Blockers

${review.remainingReleaseBlockers.map((blocker) => `- ${blocker}`).join("\n")}

## Quality Gates

\`\`\`bash
${review.qualityGates.join("\n")}
\`\`\`

## Decision

NO-GO for public preview until human approval and external clean-runner or
public package installation proof are recorded.
`;
}

function retainedSourceRow(plugin) {
  return `| ${plugin.sourceIdentity} | ${plugin.sourcePath} | ${plugin.marketplaceCard ? "yes" : "no"} | ${plugin.marketplaceBundleId || "none"} | ${plugin.reviewStatus} | ${plugin.provenance.manifestLicense || "n/a"} | ${plugin.mcpServers.length} | ${plugin.secretFindings.length} |`;
}

function finding(plugin, id, filePath, detail) {
  return { plugin, id, path: filePath, detail };
}

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const file = path.join(dir, entry);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) out.push(...listFiles(file));
    else if (stat.isFile()) out.push(file);
  }
  return out;
}

function isTextScanCandidate(file) {
  return scannedExtensions.has(path.extname(file)) || path.basename(file) === ".mcp.json";
}

function safeRead(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
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
    console.error(`${file} is out of date. Run: npm run automation:seis-public-plugin-security-provenance-review`);
    process.exit(1);
  }
}
