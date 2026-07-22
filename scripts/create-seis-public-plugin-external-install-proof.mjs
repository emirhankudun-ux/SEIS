#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH,
  inspectIndependentRunnerEvidence,
} from "./check-seis-public-plugin-independent-runner-evidence.mjs";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "content/development/seis-public-plugin-external-install-proof.json";
const reportPath = "reports/seis-public-plugin-external-install-proof.md";
const familyPath = "content/development/seis-public-plugin-family.json";
const marketplacePath = ".agents/plugins/marketplace.json";
const independentRunnerEvidenceContractPath = INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH;
const independentRunnerEvidenceContractReportPath = "reports/seis-public-plugin-independent-runner-evidence-contract.md";
const unifiedSuitePath = "plugins/seis-ai-agent/assets/unified-suite.json";

const family = readJson(familyPath);
const marketplace = readJson(marketplacePath);
const artifactStaging = stagePublicPluginArtifacts(family, marketplace);
const independentRunnerEvidence = inspectIndependentRunnerEvidence(root);
const unifiedSuite = readJson(unifiedSuitePath);

const proof = {
  id: "seis-public-plugin-external-install-proof",
  version: 2,
  generatedAt,
  status: proofStatus(artifactStaging, independentRunnerEvidence),
  decision: "not-ready-for-public-preview",
  sourcePath,
  reportPath,
  publicPluginFamily: familyPath,
  marketplace: marketplacePath,
  independentRunnerEvidenceContract: independentRunnerEvidenceContractPath,
  independentRunnerEvidenceContractReport: independentRunnerEvidenceContractReportPath,
  unifiedSuite: {
    path: unifiedSuitePath,
    status: unifiedSuite?.status || "missing",
    releaseVersion: unifiedSuite?.releaseVersion || null,
    canonicalInstallId: unifiedSuite?.canonicalInstall?.installId || null,
    defaultInstallMode: unifiedSuite?.canonicalInstall?.defaultInstallMode || null,
    componentCount: unifiedSuite?.componentCount || 0,
    publicPluginCount: unifiedSuite?.publicDistribution?.publicPluginCount || 0,
    embeddedModuleCount: unifiedSuite?.publicDistribution?.embeddedModuleCount || 0,
  },
  publicReleaseAllowed: false,
  purpose:
    "Stage the 34-card curated marketplace and all 380 retained source capabilities in a disposable clean directory, verify marketplace-card and source-coverage contracts separately, and retain independent runner/public installation proof as an explicit release gate.",
  repoLocalArtifactStaging: artifactStaging,
  externalCleanRunnerEvidence: {
    status: externalEvidenceStatus(independentRunnerEvidence),
    evidencePath: independentRunnerEvidence.evidencePath,
    evidenceRecorded: independentRunnerEvidence.evidenceRecorded === true,
    evidenceValid: independentRunnerEvidence.evidenceValid === true,
    validationFailures: independentRunnerEvidence.failures || [],
    repoLocalStagingIsNotIndependentProof: true,
    requiredEvidence: [
      "A clean runner or machine that cannot read the original working tree or existing Codex plugin cache.",
      "The public SEIS marketplace source or published package revision used for the install, including its immutable revision identifier.",
      "Installation evidence for seis-ai-agent@seis-repo plus any explicitly selected optional bundle cards from the seis-repo marketplace, including the embedded module inventory.",
      "MCP initialization, tools/list, and representative tool-call evidence from the independent runner.",
      "A newly opened Codex task after the independent installation, with the SEIS AI public-plugin-family bridge visible.",
      "Sanitized runner metadata: operating system, Node major version, Codex version, and command exit summaries only.",
    ],
    prohibitedEvidence: [
      "API keys, tokens, cookies, credentials, private keys, .env contents, or private repository data.",
      "Claims that repo-local staging, a local cache, or a static manifest alone proves an external installation.",
    ],
  },
  releaseBoundary: {
    externalNetworkAccessUsed: false,
    publicMarketplacePublicationUsed: false,
    liveProviderAccessUsed: false,
    liveSshUsed: false,
    publicReleaseAllowed: false,
  },
  remainingReleaseBlockers: buildBlockers(artifactStaging, independentRunnerEvidence),
  qualityGates: [
    "npm run check:seis-public-plugin-external-install-proof",
    "npm run check:seis-public-plugin-independent-runner-evidence-contract",
    "npm run check:seis-public-plugin-independent-runner-evidence",
    "npm run check:seis-public-plugin-independent-runner-evidence:recorded",
    "npm run check:seis-unified-plugin-suite",
    "npm run check:seis-public-plugin-security-provenance-review",
    "npm run check:seis-public-plugin-install-smoke:local:mcp",
    "npm run check:seis-agent-plugin-integration",
  ],
  completionRule:
    "This record is complete for internal review when the disposable clean artifact stage validates every public plugin and the independent-runner evidence intake is available while publicReleaseAllowed remains false. Public preview remains blocked until strict independent clean-runner/public installation evidence and human approval are recorded.",
};

const report = renderReport(proof);

if (checkMode) {
  assertSame(sourcePath, `${JSON.stringify(proof, null, 2)}\n`);
  assertSame(reportPath, report);
  validateProof(proof);
  console.log("SEIS public plugin external-install proof check passed.");
} else {
  writeFile(sourcePath, `${JSON.stringify(proof, null, 2)}\n`);
  writeFile(reportPath, report);
  validateProof(proof);
  console.log(`Wrote ${sourcePath}`);
  console.log(`Wrote ${reportPath}`);
}

function stagePublicPluginArtifacts(publicFamily, repoMarketplace) {
  const canonicalCards = (Array.isArray(publicFamily.publicPlugins) ? publicFamily.publicPlugins : [])
    .map((plugin) => ({ ...plugin, sourceKind: "canonical-marketplace-card", distributionKind: "marketplace-card" }));
  const bundleCards = (Array.isArray(publicFamily.bundlePackages) ? publicFamily.bundlePackages : [])
    .map((plugin) => ({ ...plugin, name: plugin.name || plugin.id, sourceKind: "optional-bundle-card", distributionKind: "marketplace-card" }));
  const marketplaceCards = [...canonicalCards, ...bundleCards];
  const migratedRootSources = (Array.isArray(publicFamily.migratedRootPlugins) ? publicFamily.migratedRootPlugins : [])
    .map((plugin) => ({ ...plugin, sourceKind: "retained-root-source", distributionKind: "retained-source-capability" }));
  const applicationSources = (Array.isArray(publicFamily.applicationPlugins) ? publicFamily.applicationPlugins : [])
    .map((plugin) => ({ ...plugin, sourceKind: "retained-application-source", distributionKind: "retained-source-capability" }));
  const topicSources = (Array.isArray(publicFamily.topicPlugins) ? publicFamily.topicPlugins : [])
    .map((plugin) => ({ ...plugin, sourceKind: "retained-topic-source", distributionKind: "retained-source-capability" }));
  const retainedSources = [...migratedRootSources, ...applicationSources, ...topicSources];
  const stagedArtifacts = [...marketplaceCards, ...retainedSources];
  const embeddedModules = Array.isArray(publicFamily.embeddedModules) ? publicFamily.embeddedModules : (publicFamily.plugins || []);
  const failures = [];
  const excludedSourceArtifacts = [];
  const disallowedSourceArtifacts = [];
  const marketplaceCardResults = [];
  const sourceCapabilityResults = [];
  const embeddedModuleFindings = validateEmbeddedSourceModules(embeddedModules);
  const bundleMembership = validateBundleMembership(bundleCards, applicationSources, topicSources);
  failures.push(...embeddedModuleFindings);
  failures.push(...bundleMembership.failures);
  let stagingRoot = null;
  let result;

  try {
    stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-public-plugin-artifacts-"));
    const stagingMarketplacePath = path.join(stagingRoot, ".agents", "plugins", "marketplace.json");
    fs.mkdirSync(path.dirname(stagingMarketplacePath), { recursive: true });
    fs.copyFileSync(path.join(root, marketplacePath), stagingMarketplacePath);

    const stagedMarketplace = readJsonAt(stagingMarketplacePath);
    const stagedMarketplacePlugins = Array.isArray(stagedMarketplace?.plugins) ? stagedMarketplace.plugins : [];
    const expectedCardPairs = marketplaceCards
      .map((plugin) => `${plugin.name}\u0000${plugin.sourcePath}`)
      .sort();
    const stagedCardPairs = stagedMarketplacePlugins
      .map((plugin) => `${plugin.name}\u0000${plugin.source?.path || ""}`)
      .sort();
    if (JSON.stringify(stagedCardPairs) !== JSON.stringify(expectedCardPairs)) {
      failures.push(`staged marketplace must contain the exact ${expectedCardPairs.length}-card curated projection`);
    }

    for (const plugin of stagedArtifacts) {
      const pluginFailures = [];
      const normalizedSourcePath = normalizeSourcePath(plugin.sourcePath);
      const marketplaceEntry = plugin.distributionKind === "marketplace-card"
        ? repoMarketplace.plugins?.find((entry) => entry.name === plugin.name)
        : null;
      const sourceRoot = normalizedSourcePath ? path.join(root, normalizedSourcePath) : null;
      const stagedRoot = normalizedSourcePath ? path.join(stagingRoot, normalizedSourcePath) : null;

      if (!normalizedSourcePath) pluginFailures.push("plugin source path must be a safe relative path");
      if (plugin.distributionKind === "marketplace-card") {
        if (!marketplaceEntry) pluginFailures.push("marketplace card is missing from the repo marketplace");
        if (marketplaceEntry?.source?.path !== plugin.sourcePath) pluginFailures.push("marketplace card source path does not match the public family");
        if (marketplaceEntry?.policy?.installation !== "AVAILABLE") pluginFailures.push("marketplace card installation policy must be AVAILABLE");
        if (marketplaceEntry?.policy?.authentication !== "ON_INSTALL") pluginFailures.push("marketplace card authentication policy must be ON_INSTALL");
      } else if (plugin.sourceKind === "retained-application-source" || plugin.sourceKind === "retained-topic-source") {
        const membership = bundleMembership.byName.get(plugin.name);
        if (!membership) pluginFailures.push("retained source capability is missing from the curated bundle plan");
        if (membership?.sourcePath !== plugin.sourcePath) pluginFailures.push("retained source capability path differs from its bundle member path");
      }
      if (!sourceRoot || !fs.existsSync(sourceRoot)) {
        pluginFailures.push("plugin source directory is missing");
      } else if (stagedRoot) {
        const sourceRootFailures = validatePluginSourceRoot(sourceRoot);
        pluginFailures.push(...sourceRootFailures);
        const copyResult = sourceRootFailures.length === 0
          ? copyPluginTree(sourceRoot, stagedRoot)
          : { sourceFileCount: 0, stagedFileCount: 0, excluded: [], disallowed: [], failures: [] };
        excludedSourceArtifacts.push(...copyResult.excluded);
        disallowedSourceArtifacts.push(...copyResult.disallowed);
        pluginFailures.push(...copyResult.failures);
        pluginFailures.push(...validateStagedPlugin(plugin, stagedRoot, { requireReadme: plugin.sourceKind !== "retained-application-source" }));
        if (plugin.sourceKind === "optional-bundle-card") {
          pluginFailures.push(...validateStagedBundlePackage(plugin, stagedRoot));
        } else if (plugin.sourceKind === "retained-application-source") {
          pluginFailures.push(...validateStagedApplicationPackage(plugin, stagedRoot, bundleMembership.byName.get(plugin.name)?.bundleId || null));
        } else if (plugin.sourceKind === "retained-topic-source") {
          pluginFailures.push(...validateStagedTopicPackage(plugin, stagedRoot, bundleMembership.byName.get(plugin.name)?.bundleId || null));
        } else {
          pluginFailures.push(...validateStagedEmbeddedSuite(plugin, stagedRoot, embeddedModules));
        }
        const itemResult = {
          name: plugin.name,
          sourcePath: plugin.sourcePath,
          distributionKind: plugin.distributionKind,
          sourceKind: plugin.sourceKind,
          bundleId: bundleMembership.byName.get(plugin.name)?.bundleId || null,
          sourceFileCount: copyResult.sourceFileCount,
          stagedFileCount: copyResult.stagedFileCount,
          excludedArtifactCount: copyResult.excluded.length,
          disallowedArtifactCount: copyResult.disallowed.length,
          mcpEntryScriptCount: countMcpEntryScripts(stagedRoot),
          stageReady: pluginFailures.length === 0,
          findings: pluginFailures,
        };
        (plugin.distributionKind === "marketplace-card" ? marketplaceCardResults : sourceCapabilityResults).push(itemResult);
      }

      const targetResults = plugin.distributionKind === "marketplace-card" ? marketplaceCardResults : sourceCapabilityResults;
      if (!targetResults.some((entry) => entry.name === plugin.name)) {
        targetResults.push({
          name: plugin.name,
          sourcePath: plugin.sourcePath,
          distributionKind: plugin.distributionKind,
          sourceKind: plugin.sourceKind,
          bundleId: bundleMembership.byName.get(plugin.name)?.bundleId || null,
          sourceFileCount: 0,
          stagedFileCount: 0,
          excludedArtifactCount: 0,
          disallowedArtifactCount: 0,
          mcpEntryScriptCount: 0,
          stageReady: false,
          findings: pluginFailures,
        });
      }
      failures.push(...pluginFailures.map((finding) => `${plugin.name}: ${finding}`));
    }

    const stagedFiles = listFiles(stagingRoot);
    const stagedForbiddenArtifacts = stagedFiles
      .map((file) => toPosix(path.relative(stagingRoot, file)))
      .filter((relativePath) => forbiddenArtifactId(relativePath));
    if (stagedForbiddenArtifacts.length) {
      failures.push("staged artifact contains forbidden files");
    }

    result = {
      ok: failures.length === 0,
      mode: "temporary-local-clean-artifact-staging",
      externalNetworkAccessUsed: false,
      existingCodexCacheUsed: false,
      publicMarketplacePublished: false,
      canonicalMarketplaceCardCount: canonicalCards.length,
      bundleMarketplaceCardCount: bundleCards.length,
      applicationBundleCardCount: bundleCards.filter((plugin) => plugin.family === "application").length,
      topicBundleCardCount: bundleCards.filter((plugin) => plugin.family === "topic").length,
      marketplaceEntryCount: stagedMarketplacePlugins.length,
      expectedMarketplaceCardCount: marketplaceCards.length,
      migratedRootSourceCapabilityCount: migratedRootSources.length,
      applicationSourceCapabilityCount: applicationSources.length,
      topicSourceCapabilityCount: topicSources.length,
      retainedSourceCapabilityCount: retainedSources.length,
      bundledSourceCapabilityCount: bundleMembership.byName.size,
      bundleMembershipExactOnce: bundleMembership.exactOnce,
      maximumBundleSize: bundleMembership.maximumBundleSize,
      expectedStagedArtifactCount: stagedArtifacts.length,
      embeddedModuleCount: embeddedModules.length,
      embeddedModuleFindings,
      stagedMarketplaceCardCount: marketplaceCardResults.filter((plugin) => plugin.stageReady).length,
      stagedSourceCapabilityCount: sourceCapabilityResults.filter((plugin) => plugin.stageReady).length,
      stagedArtifactCount: [...marketplaceCardResults, ...sourceCapabilityResults].filter((plugin) => plugin.stageReady).length,
      stagedManifestCount: stagedArtifacts.filter((plugin) => manifestExists(stagingRoot, plugin.sourcePath)).length,
      stagedMcpEntryScriptCount: [...marketplaceCardResults, ...sourceCapabilityResults].reduce((sum, plugin) => sum + plugin.mcpEntryScriptCount, 0),
      stagedFileCount: stagedFiles.length,
      excludedSourceArtifactCount: excludedSourceArtifacts.length,
      excludedSourceArtifacts: excludedSourceArtifacts.sort((a, b) => a.path.localeCompare(b.path)),
      disallowedSourceArtifactCount: disallowedSourceArtifacts.length,
      disallowedSourceArtifacts: disallowedSourceArtifacts.sort((a, b) => a.path.localeCompare(b.path)),
      stagedForbiddenArtifactCount: stagedForbiddenArtifacts.length,
      stagedForbiddenArtifacts: stagedForbiddenArtifacts.sort(),
      stageDeletedAfterValidation: false,
      historicalPreConsolidationSnapshot: {
        marketplaceCardCount: 381,
        status: "historical-direct-card-projection-not-current",
      },
      marketplaceCards: marketplaceCardResults,
      sourceCapabilities: sourceCapabilityResults,
      failures,
    };
  } catch (error) {
    result = {
      ok: false,
      mode: "temporary-local-clean-artifact-staging",
      externalNetworkAccessUsed: false,
      existingCodexCacheUsed: false,
      publicMarketplacePublished: false,
      canonicalMarketplaceCardCount: canonicalCards.length,
      bundleMarketplaceCardCount: bundleCards.length,
      applicationBundleCardCount: bundleCards.filter((plugin) => plugin.family === "application").length,
      topicBundleCardCount: bundleCards.filter((plugin) => plugin.family === "topic").length,
      marketplaceEntryCount: Array.isArray(repoMarketplace?.plugins) ? repoMarketplace.plugins.length : 0,
      expectedMarketplaceCardCount: marketplaceCards.length,
      migratedRootSourceCapabilityCount: migratedRootSources.length,
      applicationSourceCapabilityCount: applicationSources.length,
      topicSourceCapabilityCount: topicSources.length,
      retainedSourceCapabilityCount: retainedSources.length,
      bundledSourceCapabilityCount: bundleMembership.byName.size,
      bundleMembershipExactOnce: bundleMembership.exactOnce,
      maximumBundleSize: bundleMembership.maximumBundleSize,
      expectedStagedArtifactCount: stagedArtifacts.length,
      embeddedModuleCount: embeddedModules.length,
      embeddedModuleFindings,
      stagedMarketplaceCardCount: 0,
      stagedSourceCapabilityCount: 0,
      stagedArtifactCount: 0,
      stagedManifestCount: 0,
      stagedMcpEntryScriptCount: 0,
      stagedFileCount: 0,
      excludedSourceArtifactCount: excludedSourceArtifacts.length,
      excludedSourceArtifacts,
      disallowedSourceArtifactCount: disallowedSourceArtifacts.length,
      disallowedSourceArtifacts,
      stagedForbiddenArtifactCount: 0,
      stagedForbiddenArtifacts: [],
      stageDeletedAfterValidation: false,
      historicalPreConsolidationSnapshot: {
        marketplaceCardCount: 381,
        status: "historical-direct-card-projection-not-current",
      },
      marketplaceCards: marketplaceCardResults,
      sourceCapabilities: sourceCapabilityResults,
      failures: [...failures, `artifact staging failed: ${sanitizeError(error)}`],
    };
  } finally {
    if (stagingRoot) {
      fs.rmSync(stagingRoot, { recursive: true, force: true });
    }
  }

  result.stageDeletedAfterValidation = Boolean(stagingRoot) && !fs.existsSync(stagingRoot);
  if (!result.stageDeletedAfterValidation) {
    result.ok = false;
    result.failures.push("temporary artifact staging directory was not removed");
  }
  return result;
}

function validateBundleMembership(bundleCards, applicationSources, topicSources) {
  const failures = [];
  const byName = new Map();
  const seenPaths = new Set();
  let maximumBundleSize = 0;
  for (const bundle of bundleCards) {
    const members = Array.isArray(bundle.members) ? bundle.members : [];
    maximumBundleSize = Math.max(maximumBundleSize, members.length);
    if (!bundle.name || !["application", "topic"].includes(bundle.family)) failures.push("bundle card identity or family is invalid");
    if (members.length < 1 || members.length > 15 || bundle.memberCount !== members.length) failures.push(`${bundle.name || "bundle"}: bundle member count is invalid`);
    for (const member of members) {
      if (!member?.name || !member?.sourcePath) {
        failures.push(`${bundle.name || "bundle"}: bundle member identity is invalid`);
        continue;
      }
      if (byName.has(member.name) || seenPaths.has(member.sourcePath)) {
        failures.push(`${member.name}: retained source capability appears in multiple bundles`);
        continue;
      }
      byName.set(member.name, { bundleId: bundle.name, family: bundle.family, sourcePath: member.sourcePath });
      seenPaths.add(member.sourcePath);
    }
  }

  const expectedSources = [...applicationSources, ...topicSources];
  const expectedNames = new Set(expectedSources.map((plugin) => plugin.name));
  for (const source of expectedSources) {
    const membership = byName.get(source.name);
    const expectedFamily = source.sourceKind === "retained-application-source" ? "application" : "topic";
    if (!membership) failures.push(`${source.name}: retained source capability is not bundled`);
    if (membership?.family !== expectedFamily) failures.push(`${source.name}: retained source capability is in the wrong bundle family`);
    if (membership?.sourcePath !== source.sourcePath) failures.push(`${source.name}: retained source capability bundle path is stale`);
  }
  for (const name of byName.keys()) {
    if (!expectedNames.has(name)) failures.push(`${name}: bundle member is not present in the retained source inventory`);
  }
  const exactOnce = failures.length === 0 && byName.size === expectedSources.length;
  if (!exactOnce) failures.push("application and topic source capability bundle coverage must be exact-once");
  return { byName, exactOnce, maximumBundleSize, failures };
}

function copyPluginTree(sourceRoot, stagedRoot) {
  const result = {
    sourceFileCount: 0,
    stagedFileCount: 0,
    excluded: [],
    disallowed: [],
    failures: [],
  };

  const copyDirectory = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from).sort()) {
      const sourcePath = path.join(from, entry);
      const stagedPath = path.join(to, entry);
      const relativePath = toPosix(path.relative(root, sourcePath));
      const stat = fs.lstatSync(sourcePath);

      if (entry === ".DS_Store") {
        result.excluded.push({ path: relativePath, reason: "macos-metadata" });
        continue;
      }
      const disallowedId = forbiddenArtifactId(relativePath);
      if (disallowedId) {
        result.disallowed.push({ path: relativePath, reason: disallowedId });
        continue;
      }
      if (stat.isSymbolicLink()) {
        result.disallowed.push({ path: relativePath, reason: "symbolic-link" });
        continue;
      }
      if (stat.isDirectory()) {
        copyDirectory(sourcePath, stagedPath);
        continue;
      }
      if (!stat.isFile()) {
        result.disallowed.push({ path: relativePath, reason: "unsupported-artifact-type" });
        continue;
      }
      result.sourceFileCount += 1;
      fs.copyFileSync(sourcePath, stagedPath);
      result.stagedFileCount += 1;
    }
  };

  copyDirectory(sourceRoot, stagedRoot);
  if (result.disallowed.length) result.failures.push("source contains disallowed release artifacts");
  return result;
}

function validatePluginSourceRoot(sourceRoot) {
  const failures = [];
  try {
    const stat = fs.lstatSync(sourceRoot);
    if (!stat.isDirectory() || stat.isSymbolicLink()) failures.push("plugin source root must be a regular directory and not a symbolic link");
    const repositoryRealPath = fs.realpathSync(root);
    const sourceRealPath = fs.realpathSync(sourceRoot);
    if (!isInside(repositoryRealPath, sourceRealPath) || sourceRealPath === repositoryRealPath) failures.push("plugin source root resolves outside the repository boundary");
  } catch (error) {
    failures.push(`plugin source root validation failed: ${sanitizeError(error)}`);
  }
  return failures;
}

function validateStagedPlugin(plugin, stagedRoot, { requireReadme = true } = {}) {
  const failures = [];
  const manifestPath = path.join(stagedRoot, ".codex-plugin", "plugin.json");
  const mcpPath = path.join(stagedRoot, ".mcp.json");
  const readmePath = path.join(stagedRoot, "README.md");
  if (!fs.existsSync(manifestPath)) failures.push("staged plugin manifest is missing");
  if (!fs.existsSync(mcpPath)) failures.push("staged MCP manifest is missing");
  if (requireReadme && !fs.existsSync(readmePath)) failures.push("staged README is missing");

  const manifest = readJsonAt(manifestPath);
  if (manifest?.name !== plugin.name) failures.push("staged manifest name does not match plugin name");
  if (manifest?.license !== "MIT") failures.push("staged manifest license must be MIT");
  if (!manifest?.version) failures.push("staged manifest version is missing");

  const mcp = readJsonAt(mcpPath);
  const servers = Object.entries(mcp?.mcpServers || {});
  if (!servers.length) failures.push("staged MCP manifest has no server");
  for (const [serverName, server] of servers) {
    if (server.command !== "node") failures.push(`staged MCP server ${serverName} must use node`);
    if (!Array.isArray(server.args) || !server.args.length) {
      failures.push(`staged MCP server ${serverName} has no script arguments`);
      continue;
    }
    for (const arg of server.args) {
      const resolved = typeof arg === "string" ? path.resolve(stagedRoot, arg) : null;
      if (!resolved || path.isAbsolute(arg) || arg.includes("..") || !isInside(stagedRoot, resolved)) {
        failures.push(`staged MCP server ${serverName} has an unsafe script argument`);
      } else if (!fs.existsSync(resolved)) {
        failures.push(`staged MCP server ${serverName} script is missing from the artifact`);
      }
    }
  }
  return failures;
}

function validateStagedApplicationPackage(plugin, stagedRoot, expectedBundleId) {
  const failures = [];
  const profilePath = path.join(stagedRoot, "assets", "plugin-profile.json");
  const skillPath = path.join(stagedRoot, "skills", plugin.name, "SKILL.md");
  if (!fs.existsSync(profilePath)) failures.push("staged app package profile is missing");
  if (!fs.existsSync(skillPath)) failures.push("staged app package skill is missing");
  const profile = readJsonAt(profilePath);
  if (profile?.stableId !== plugin.name) failures.push("staged app package profile id does not match plugin name");
  if (profile?.license !== "MIT") failures.push("staged app package profile license must be MIT");
  if (profile?.publicRepositoryAvailable !== true) failures.push("staged app package must be public-repository available");
  if (profile?.publicAudience !== "everyone") failures.push("staged app package audience must be everyone");
  if (profile?.publicMarketplace !== true) failures.push("staged app package must be available in the public marketplace");
  if (profile?.marketplaceDiscoverable !== true) failures.push("staged app source must be marketplace-discoverable through a bundle");
  if (profile?.marketplaceCard !== false) failures.push("staged app source must not be a direct marketplace card");
  if (profile?.marketplaceBundleId !== expectedBundleId) failures.push("staged app source bundle id must match exact bundle membership");
  for (const permission of ["write", "network", "secrets"]) {
    if (!Array.isArray(profile?.permissions?.[permission]) || profile.permissions[permission].length !== 0) {
      failures.push(`staged app package ${permission} permissions must be empty`);
    }
  }
  return failures;
}

function validateStagedTopicPackage(plugin, stagedRoot, expectedBundleId) {
  const failures = [];
  const profilePath = path.join(stagedRoot, "assets", "topic-profile.json");
  const skillPath = path.join(stagedRoot, "skills", plugin.name, "SKILL.md");
  const runtimePath = path.join(stagedRoot, "runtime", "topic-plugin-runtime.mjs");
  if (!fs.existsSync(profilePath)) failures.push("staged topic package profile is missing");
  if (!fs.existsSync(skillPath)) failures.push("staged topic package skill is missing");
  if (!fs.existsSync(runtimePath)) failures.push("staged topic package runtime is missing");
  const profile = readJsonAt(profilePath);
  if (profile?.id !== plugin.name) failures.push("staged topic package profile id does not match plugin name");
  if (profile?.license !== "MIT") failures.push("staged topic package profile license must be MIT");
  if (profile?.publicAudience !== "everyone") failures.push("staged topic package audience must be everyone");
  if (profile?.publicMarketplace !== true) failures.push("staged topic package must be available in the public marketplace");
  if (profile?.marketplaceDiscoverable !== true) failures.push("staged topic source must be marketplace-discoverable through a bundle");
  if (profile?.marketplaceCard !== false) failures.push("staged topic source must not be a direct marketplace card");
  if (profile?.marketplaceBundleId !== expectedBundleId) failures.push("staged topic source bundle id must match exact bundle membership");
  if (profile?.marketplace !== "seis-repo") failures.push("staged topic package marketplace must be seis-repo");
  if (profile?.sourcePath !== plugin.sourcePath) failures.push("staged topic package source path must match the public family");
  for (const permission of ["write", "network", "secrets"]) {
    if (!Array.isArray(profile?.permissions?.[permission]) || profile.permissions[permission].length !== 0) {
      failures.push(`staged topic package ${permission} permissions must be empty`);
    }
  }
  return failures;
}

function validateStagedBundlePackage(plugin, stagedRoot) {
  const failures = [];
  const profilePath = path.join(stagedRoot, "assets", "bundle-profile.json");
  if (!fs.existsSync(profilePath)) return ["staged bundle profile is missing"];
  const profile = readJsonAt(profilePath);
  const expectedMembers = (plugin.members || []).map(({ name, displayName, sourcePath, category }) => ({ name, displayName, sourcePath, category }));
  if (profile?.id !== plugin.name || profile?.family !== plugin.family) failures.push("staged bundle identity or family differs from the public family");
  if (profile?.memberCount !== plugin.memberCount || profile?.memberCount !== expectedMembers.length) failures.push("staged bundle member count differs from the public family");
  if (JSON.stringify(profile?.members || []) !== JSON.stringify(expectedMembers)) failures.push("staged bundle members differ from the public family");
  if (profile?.installationPolicy?.defaultInstall !== false || profile?.installationPolicy?.optionalSelectionBundle !== true || profile?.installationPolicy?.bundleMembersAutoInstalled !== false || profile?.installationPolicy?.sourcePackagesRetained !== true || profile?.installationPolicy?.sourcePackagesDeleted !== false) failures.push("staged bundle installation policy is invalid");
  for (const permission of ["write", "network", "secrets"]) {
    if (!Array.isArray(profile?.permissions?.[permission]) || profile.permissions[permission].length !== 0) failures.push(`staged bundle ${permission} permissions must be empty`);
  }
  for (const claim of ["providerConnectivity", "deployment", "publicRelease", "automaticMerge", "sourceDeletion"]) {
    if (profile?.externalClaims?.[claim] !== false) failures.push(`staged bundle ${claim} claim must remain false`);
  }
  return failures;
}

function validateStagedEmbeddedSuite(plugin, stagedRoot, modules) {
  if (plugin.name !== "seis-ai-agent") return [];

  const failures = [];
  const suitePath = path.join(stagedRoot, "assets", "unified-suite.json");
  const suite = readJsonAt(suitePath);
  const expectedModuleNames = modules.map((module) => module.name).sort();
  const suiteModuleNames = (suite?.components || []).map((component) => component.moduleId).sort();

  if (suite?.canonicalInstall?.installId !== "seis-ai-agent@seis-repo") {
    failures.push("staged unified suite must retain the SEIS-Agent canonical install");
  }
  if (suite?.publicDistribution?.publicPluginCount !== 1) {
    failures.push("staged unified suite must expose one public plugin");
  }
  if (suite?.publicDistribution?.embeddedModuleCount !== expectedModuleNames.length) {
    failures.push("staged unified suite embedded module count is invalid");
  }
  if (JSON.stringify(suiteModuleNames) !== JSON.stringify(expectedModuleNames)) {
    failures.push("staged unified suite does not contain the complete embedded module inventory");
  }

  for (const module of modules) {
    const skillName = module.name === "seis" ? "seis-hub" : module.name;
    const skillPath = path.join(stagedRoot, "skills", skillName, "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      failures.push(`staged unified suite is missing embedded skill for ${module.name}`);
    }

    if (module.name === "seis-ai-agent") continue;
    const profileName = module.name === "seis" ? "seis-governance" : module.name;
    const profilePath = path.join(stagedRoot, "assets", "lanes", `${profileName}.json`);
    if (!fs.existsSync(profilePath)) {
      failures.push(`staged unified suite is missing embedded lane profile for ${module.name}`);
    }
  }

  return failures;
}

function validateEmbeddedSourceModules(modules) {
  const findings = [];
  if (modules.length < 10) findings.push("embedded source module contract must contain every current SEIS module");
  for (const module of modules) {
    const sourcePath = normalizeSourcePath(module.sourcePath);
    if (!sourcePath || !fs.existsSync(path.join(root, sourcePath))) {
      findings.push(`${module.name || "embedded module"}: source module directory is missing`);
    }
    if (module.canonicalInstallId !== "seis-ai-agent@seis-repo") {
      findings.push(`${module.name || "embedded module"}: canonical install must be seis-ai-agent@seis-repo`);
    }
  }
  return findings;
}

function countMcpEntryScripts(stagedRoot) {
  const mcp = readJsonAt(path.join(stagedRoot, ".mcp.json"));
  return Object.values(mcp?.mcpServers || {}).reduce((sum, server) => sum + (Array.isArray(server.args) ? server.args.length : 0), 0);
}

function manifestExists(stagingRoot, sourcePath) {
  const normalized = normalizeSourcePath(sourcePath);
  return Boolean(normalized && fs.existsSync(path.join(stagingRoot, normalized, ".codex-plugin", "plugin.json")));
}

function normalizeSourcePath(sourcePath) {
  if (typeof sourcePath !== "string" || !sourcePath.trim() || path.isAbsolute(sourcePath)) return null;
  const normalized = sourcePath.replace(/^\.\//, "").replaceAll("\\", "/");
  if (normalized.split("/").some((part) => !part || part === "." || part === "..")) return null;
  return normalized;
}

function forbiddenArtifactId(relativePath) {
  const normalized = toPosix(relativePath);
  const parts = normalized.split("/");
  const base = parts.at(-1) || "";
  if (base === ".DS_Store") return "macos-metadata";
  if (parts.some((part) => [".git", "node_modules", "dist", "build", "coverage", "vendor", ".cache", ".next", ".turbo", ".venv", "__pycache__", ".secrets", "secrets", ".private", "local-data"].includes(part))) {
    return "generated-or-secret-directory";
  }
  if (base === ".env" || (base.startsWith(".env.") && !base.endsWith(".example"))) return "environment-file";
  if (["credentials.local.json", "credentials.json", "tokens.json", "id_rsa", "id_ed25519"].includes(base) || /^service-account.*\.json$/i.test(base)) return "credential-file";
  if (/\.log$/i.test(base)) return "log-artifact";
  if (/\.(pem|key|p12|pfx|zip|rar|7z|tar|gz)$/i.test(base)) return "private-or-archive-artifact";
  return null;
}

function proofStatus(artifactStaging, independentRunnerEvidence) {
  if (!artifactStaging.ok) return "blocked-by-artifact-hygiene";
  if (independentRunnerEvidence.evidenceRecorded && !independentRunnerEvidence.evidenceValid) {
    return "blocked-by-independent-runner-evidence";
  }
  if (independentRunnerEvidence.evidenceValid) {
    return "repo-local-artifact-and-independent-runner-evidence-recorded-human-approval-pending";
  }
  return "repo-local-clean-artifact-staged-external-proof-pending";
}

function externalEvidenceStatus(independentRunnerEvidence) {
  if (independentRunnerEvidence.evidenceValid) return "recorded-independent-clean-runner-evidence";
  if (independentRunnerEvidence.evidenceRecorded) return "invalid-independent-runner-evidence";
  return "pending-independent-clean-runner-or-public-install";
}

function buildBlockers(artifactStaging, independentRunnerEvidence) {
  const blockers = [];
  if (!artifactStaging.ok) blockers.push("Repo-local clean artifact staging did not pass; inspect the recorded artifact findings before any release discussion.");
  if (independentRunnerEvidence.evidenceRecorded && !independentRunnerEvidence.evidenceValid) {
    blockers.push("Independent clean-runner evidence was supplied but does not meet the sanitized evidence contract.");
  } else if (!independentRunnerEvidence.evidenceValid) {
    blockers.push("Independent clean-runner or public package installation proof has not been recorded.");
  }
  blockers.push("Human approval for public preview, release, publish, push, merge, tag, deploy, live SSH, or provider credentials has not been recorded.");
  return blockers;
}

function validateProof(record) {
  const failures = [];
  if (record.id !== "seis-public-plugin-external-install-proof") failures.push("external install proof id is invalid");
  if (record.version !== 2) failures.push("external install proof schema version is invalid");
  if (record.publicReleaseAllowed !== false) failures.push("public release must remain blocked");
  if (record.unifiedSuite.status !== "active-single-public-plugin") failures.push("unified suite must be active");
  if (record.unifiedSuite.canonicalInstallId !== "seis-ai-agent@seis-repo" || record.unifiedSuite.defaultInstallMode !== "single-public-plugin") failures.push("unified suite must keep SEIS-Agent as the single public install");
  if (record.unifiedSuite.componentCount < 10) failures.push("unified suite must include all current SEIS components");
  if (record.unifiedSuite.publicPluginCount !== 1 || record.unifiedSuite.embeddedModuleCount < 10) failures.push("unified suite must expose one public plugin and every embedded source module");
  if (record.repoLocalArtifactStaging.marketplaceEntryCount !== marketplace.plugins.length || record.repoLocalArtifactStaging.marketplaceEntryCount !== 34) failures.push("artifact staging marketplace count must match the current 34-card repo marketplace");
  if (record.repoLocalArtifactStaging.expectedMarketplaceCardCount !== 34) failures.push("artifact staging must expect exactly 34 current marketplace cards");
  if (record.repoLocalArtifactStaging.canonicalMarketplaceCardCount !== 1) failures.push("artifact staging must include one canonical SEIS-Agent card");
  if (record.repoLocalArtifactStaging.bundleMarketplaceCardCount !== 33) failures.push("artifact staging must include 33 optional bundle cards");
  if (record.repoLocalArtifactStaging.applicationBundleCardCount !== 6 || record.repoLocalArtifactStaging.topicBundleCardCount !== 27) failures.push("artifact staging bundle family counts are invalid");
  if (record.repoLocalArtifactStaging.migratedRootSourceCapabilityCount !== family.migratedRootPlugins.length || record.repoLocalArtifactStaging.migratedRootSourceCapabilityCount !== 5) failures.push("artifact staging must retain all five root source capabilities");
  if (record.repoLocalArtifactStaging.applicationSourceCapabilityCount !== family.applicationPlugins.length || record.repoLocalArtifactStaging.applicationSourceCapabilityCount !== 75) failures.push("artifact staging must retain every app source capability");
  if (record.repoLocalArtifactStaging.topicSourceCapabilityCount !== family.topicPlugins.length || record.repoLocalArtifactStaging.topicSourceCapabilityCount !== 300) failures.push("artifact staging must retain every topic source capability");
  if (record.repoLocalArtifactStaging.retainedSourceCapabilityCount !== 380) failures.push("artifact staging must retain 380 source capabilities");
  if (record.repoLocalArtifactStaging.bundledSourceCapabilityCount !== 375 || record.repoLocalArtifactStaging.bundleMembershipExactOnce !== true) failures.push("artifact staging must cover all 375 application/topic sources exactly once through bundles");
  if (record.repoLocalArtifactStaging.maximumBundleSize > 15) failures.push("artifact staging bundle size exceeds the reviewed cap");
  if (record.repoLocalArtifactStaging.expectedStagedArtifactCount !== 414) failures.push("artifact staging must separate 34 cards from 380 retained sources");
  if (record.repoLocalArtifactStaging.historicalPreConsolidationSnapshot?.marketplaceCardCount !== 381 || record.repoLocalArtifactStaging.historicalPreConsolidationSnapshot?.status !== "historical-direct-card-projection-not-current") failures.push("historical 381-card snapshot must remain explicitly non-current");
  if (record.repoLocalArtifactStaging.embeddedModuleCount < 10) failures.push("artifact staging must validate every embedded source module");
  if (record.repoLocalArtifactStaging.embeddedModuleFindings.length) failures.push("embedded source module validation must pass");
  if (!record.repoLocalArtifactStaging.stageDeletedAfterValidation) failures.push("temporary stage must be deleted after validation");
  if (record.repoLocalArtifactStaging.stagedForbiddenArtifactCount !== 0) failures.push("staged artifact must not contain forbidden files");
  if (record.repoLocalArtifactStaging.disallowedSourceArtifactCount !== 0) failures.push("source artifacts must not contain disallowed release files");
  if (!record.repoLocalArtifactStaging.ok) failures.push("artifact staging must pass for every current card and retained source capability");
  if (record.repoLocalArtifactStaging.ok && record.repoLocalArtifactStaging.stagedMarketplaceCardCount !== 34) failures.push("successful artifact staging must include every current marketplace card");
  if (record.repoLocalArtifactStaging.ok && record.repoLocalArtifactStaging.stagedSourceCapabilityCount !== 380) failures.push("successful artifact staging must include every retained source capability");
  if (record.repoLocalArtifactStaging.ok && record.repoLocalArtifactStaging.stagedArtifactCount !== record.repoLocalArtifactStaging.expectedStagedArtifactCount) failures.push("successful artifact staging must include every card and source artifact");
  if (record.repoLocalArtifactStaging.ok && record.repoLocalArtifactStaging.stagedManifestCount !== record.repoLocalArtifactStaging.expectedStagedArtifactCount) failures.push("successful artifact staging must include every current card and retained-source manifest");
  if (record.repoLocalArtifactStaging.ok && record.repoLocalArtifactStaging.stagedMcpEntryScriptCount < 1) failures.push("successful artifact staging must include the public MCP entry script");
  if (![
    "pending-independent-clean-runner-or-public-install",
    "invalid-independent-runner-evidence",
    "recorded-independent-clean-runner-evidence",
  ].includes(record.externalCleanRunnerEvidence.status)) failures.push("independent runner evidence status is invalid");
  if (record.externalCleanRunnerEvidence.repoLocalStagingIsNotIndependentProof !== true) failures.push("repo-local staging must not be presented as independent proof");
  if (record.externalCleanRunnerEvidence.evidenceValid && record.externalCleanRunnerEvidence.status !== "recorded-independent-clean-runner-evidence") failures.push("valid independent runner evidence must be recorded");
  if (!record.externalCleanRunnerEvidence.evidenceRecorded && record.externalCleanRunnerEvidence.status !== "pending-independent-clean-runner-or-public-install") failures.push("missing independent runner evidence must remain pending");
  if (!record.qualityGates.includes("npm run check:seis-public-plugin-external-install-proof")) failures.push("quality gates must include this check");
  if (!record.qualityGates.includes("npm run check:seis-unified-plugin-suite")) failures.push("quality gates must include the unified suite check");
  if (!record.remainingReleaseBlockers.some((blocker) => blocker.includes("Independent clean-runner"))) failures.push("independent runner blocker must remain visible");
  if (failures.length) {
    console.error("SEIS public plugin external-install proof validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function renderReport(record) {
  const artifactRows = [...record.repoLocalArtifactStaging.marketplaceCards, ...record.repoLocalArtifactStaging.sourceCapabilities]
    .map((plugin) => `| ${plugin.name} | ${plugin.distributionKind} | ${plugin.bundleId || "n/a"} | ${plugin.sourceFileCount} | ${plugin.stagedFileCount} | ${plugin.excludedArtifactCount} | ${plugin.mcpEntryScriptCount} | ${plugin.stageReady ? "pass" : "fail"} |`)
    .join("\n");
  const excludedRows = record.repoLocalArtifactStaging.excludedSourceArtifacts.length
    ? record.repoLocalArtifactStaging.excludedSourceArtifacts.map((item) => `| ${item.path} | ${item.reason} |`).join("\n")
    : "| none | none |";
  const disallowedRows = record.repoLocalArtifactStaging.disallowedSourceArtifacts.length
    ? record.repoLocalArtifactStaging.disallowedSourceArtifacts.map((item) => `| ${item.path} | ${item.reason} |`).join("\n")
    : "| none | none |";
  return `# SEIS Public Plugin External Install Proof

- Generated: ${record.generatedAt}
- Status: ${record.status}
- Decision: ${record.decision}
- Public release allowed: ${record.publicReleaseAllowed ? "yes" : "no"}

## Repo-Local Clean Artifact Staging

- Mode: ${record.repoLocalArtifactStaging.mode}
  - Expected public marketplace cards: ${record.repoLocalArtifactStaging.expectedMarketplaceCardCount}
  - Canonical card: ${record.repoLocalArtifactStaging.canonicalMarketplaceCardCount}
  - Optional bundle cards: ${record.repoLocalArtifactStaging.bundleMarketplaceCardCount} (${record.repoLocalArtifactStaging.applicationBundleCardCount} application + ${record.repoLocalArtifactStaging.topicBundleCardCount} topic)
  - Retained source capabilities: ${record.repoLocalArtifactStaging.retainedSourceCapabilityCount} (${record.repoLocalArtifactStaging.migratedRootSourceCapabilityCount} root + ${record.repoLocalArtifactStaging.applicationSourceCapabilityCount} application + ${record.repoLocalArtifactStaging.topicSourceCapabilityCount} topic)
  - Exact-once bundled source capabilities: ${record.repoLocalArtifactStaging.bundledSourceCapabilityCount}
- Staged marketplace cards: ${record.repoLocalArtifactStaging.stagedMarketplaceCardCount}
- Staged retained source capabilities: ${record.repoLocalArtifactStaging.stagedSourceCapabilityCount}
- Staged artifacts total: ${record.repoLocalArtifactStaging.stagedArtifactCount}
- Embedded source modules: ${record.repoLocalArtifactStaging.embeddedModuleCount}
- Staged manifests: ${record.repoLocalArtifactStaging.stagedManifestCount}
- Staged MCP entry scripts: ${record.repoLocalArtifactStaging.stagedMcpEntryScriptCount}
- Staged files: ${record.repoLocalArtifactStaging.stagedFileCount}
- Excluded source metadata files: ${record.repoLocalArtifactStaging.excludedSourceArtifactCount}
- Disallowed source artifacts: ${record.repoLocalArtifactStaging.disallowedSourceArtifactCount}
- Forbidden files in stage: ${record.repoLocalArtifactStaging.stagedForbiddenArtifactCount}
- Temporary stage removed: ${record.repoLocalArtifactStaging.stageDeletedAfterValidation ? "yes" : "no"}
- External network used: ${record.repoLocalArtifactStaging.externalNetworkAccessUsed ? "yes" : "no"}
- Existing Codex cache used: ${record.repoLocalArtifactStaging.existingCodexCacheUsed ? "yes" : "no"}

The historical pre-consolidation 381-card projection is retained only as a
non-current snapshot. The current install surface is 34 cards; retained source
capabilities are validated separately and are not direct cards.

| artifact | distribution | bundle | source files | staged files | excluded metadata | MCP entry scripts | stage |
| --- | --- | --- | --- | --- | --- | --- | --- |
${artifactRows}

## Excluded Source Metadata

| path | reason |
| --- | --- |
${excludedRows}

## Disallowed Source Artifacts

| path | reason |
| --- | --- |
${disallowedRows}

## Single Public Install

- Suite file: ${record.unifiedSuite.path}
- Suite status: ${record.unifiedSuite.status}
- Release version: ${record.unifiedSuite.releaseVersion}
- Canonical install: ${record.unifiedSuite.canonicalInstallId}
- Default install mode: ${record.unifiedSuite.defaultInstallMode}
- Components: ${record.unifiedSuite.componentCount}
- Public plugin count: ${record.unifiedSuite.publicPluginCount}
- Embedded module count: ${record.unifiedSuite.embeddedModuleCount}

## Independent Clean-Runner Evidence Still Required

Repo-local staging validates artifact structure only. It is not an independent
installation or public release proof.

- Evidence intake contract: \`${record.independentRunnerEvidenceContract}\`
- Evidence record: \`${record.externalCleanRunnerEvidence.evidencePath || "not recorded"}\`
- Evidence status: ${record.externalCleanRunnerEvidence.status}
- Evidence recorded: ${record.externalCleanRunnerEvidence.evidenceRecorded ? "yes" : "no"}
- Evidence valid: ${record.externalCleanRunnerEvidence.evidenceValid ? "yes" : "no"}

${record.externalCleanRunnerEvidence.validationFailures.length ? `Validation findings:\n\n${record.externalCleanRunnerEvidence.validationFailures.map((item) => `- ${item}`).join("\n")}\n` : ""}

${record.externalCleanRunnerEvidence.requiredEvidence.map((item) => `- ${item}`).join("\n")}

## Current Blockers

${record.remainingReleaseBlockers.map((blocker) => `- ${blocker}`).join("\n")}

## Quality Gates

\`\`\`bash
${record.qualityGates.join("\n")}
\`\`\`

## Decision

NO-GO for public preview. The artifact stage is local evidence only; an
independent clean runner or public installation and human approval remain
required.
`;
}

function listFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir).sort()) {
    const filePath = path.join(dir, entry);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) files.push(...listFiles(filePath));
    else if (stat.isFile()) files.push(filePath);
  }
  return files;
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function readJsonAt(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function sanitizeError(error) {
  return String(error?.message || error || "unknown error").replaceAll(root, "<repo>");
}

function writeFile(file, body) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), body);
}

function assertSame(file, expected) {
  const filePath = path.join(root, file);
  const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${file} is out of date. Run: npm run automation:seis-public-plugin-external-install-proof`);
    process.exit(1);
  }
}
