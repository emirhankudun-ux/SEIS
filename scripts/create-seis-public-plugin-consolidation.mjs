#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import {
  buildSeisPublicBundlePlan,
  SEIS_PUBLIC_BUNDLE_SIZE,
  SEIS_PUBLIC_MARKETPLACE_MAX_CARD_COUNT,
  SEIS_PUBLIC_MARKETPLACE_MIN_CARD_COUNT,
} from "./lib/seis-public-bundle-plan.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-consolidation.json";
const MAX_INPUT_BYTES = 16 * 1024 * 1024;
const PATHS = Object.freeze({
  publicFamily: "content/development/seis-public-plugin-family.json",
  unifiedSuite: "plugins/seis-ai-agent/assets/unified-suite.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  marketplace: ".agents/plugins/marketplace.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  goal: "goals/active/SEIS-GOAL-0024--curated-public-plugin-capability-packages.yaml",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-consolidation`);
    process.exit(1);
  }
  console.log(`SEIS public plugin consolidation check passed (${record.inventory.publicCardCount} cards / ${record.inventory.retainedSourceCapabilityCount} retained source capabilities).`);
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with the curated public capability-package inventory.`);
}

function buildRecord() {
  const publicFamily = readJson(PATHS.publicFamily);
  const unifiedSuite = readJson(PATHS.unifiedSuite);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const marketplace = readJson(PATHS.marketplace);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const sourcePlugins = list(sourceManifest.plugins);
  const catalogPlugins = list(catalog.plugins);
  const applicationPlugins = list(publicFamily.applicationPlugins);
  const topicPlugins = list(publicFamily.topicPlugins);
  const rootPlugins = list(publicFamily.migratedRootPlugins);
  const marketplaceEntries = list(marketplace.plugins);
  const familyBundles = list(publicFamily.bundlePackages);
  const bundlePlan = buildSeisPublicBundlePlan({ applicationPlugins, topicPlugins });
  const bundleEntries = marketplaceEntries.filter((entry) => sourcePath(entry).startsWith("./plugins/seis-bundles/"));
  const canonicalEntries = marketplaceEntries.filter((entry) => entry?.name === "seis-ai-agent");
  const applicationBundles = bundlePlan.applicationBundles;
  const topicBundles = bundlePlan.topicBundles;
  const expectedPreviousCardCount = 1 + rootPlugins.length + applicationPlugins.length + topicPlugins.length;
  const memberNames = familyBundles.flatMap((bundle) => list(bundle.members).map((member) => member?.name));
  const bundleCatalogMemberNames = list(bundleCatalog?.bundles).flatMap((bundle) => list(bundle?.memberNames));
  const sourceNames = [...applicationPlugins, ...topicPlugins].map((plugin) => plugin?.name);
  const applicationNames = applicationPlugins.map((plugin) => plugin?.name);
  const sourceManifestNames = sourcePlugins.map((plugin) => plugin?.name);
  const catalogNames = catalogPlugins.map((plugin) => plugin?.name);
  const profileSummary = summarizeCapabilityProfiles(catalogPlugins);
  const categoryCoverage = countCategories(marketplaceEntries);
  const bundleSizes = familyBundles.map((bundle) => bundle?.memberCount);
  const sourceDirectoriesReady = [...rootPlugins, ...applicationPlugins, ...topicPlugins]
    .every((plugin) => sourceDirectoryReady(plugin?.sourcePath));
  const packageArtifactsReady = familyBundles.every((bundle) => bundleArtifactReady(bundle));
  const protectedTopicCategories = ["ELENI-NEFERI", "PANTECHNOEPISTEMONOESIS", "SEIS"];

  const checks = {
    goalRecord: regularFileReady(PATHS.goal, 256 * 1024),
    publicFamily: publicFamily?.id === "seis-public-plugin-family"
      && publicFamily?.defaultInstall?.installId === "seis-ai-agent@seis-repo"
      && publicFamily?.defaultInstall?.mode === "single-public-plugin"
      && publicFamily?.marketplace?.name === "seis-repo"
      && publicFamily?.marketplace?.publicPluginCount === bundlePlan.targetMarketplaceCardCount
      && publicFamily?.marketplace?.bundlePluginCount === bundlePlan.publicBundleCardCount
      && publicFamily?.marketplace?.applicationBundlePluginCount === applicationBundles.length
      && publicFamily?.marketplace?.topicBundlePluginCount === topicBundles.length
      && sameBundleProjection(familyBundles, bundlePlan.bundles),
    unifiedSuite: unifiedSuite?.id === "seis-unified-plugin-suite"
      && unifiedSuite?.status === "active-single-public-plugin"
      && unifiedSuite?.canonicalInstall?.installId === "seis-ai-agent@seis-repo"
      && unifiedSuite?.canonicalInstall?.defaultInstallMode === "single-public-plugin"
      && list(unifiedSuite?.publicDistribution?.publicInstallIds).length === 1
      && unifiedSuite?.publicDistribution?.publicInstallIds?.[0] === "seis-ai-agent@seis-repo"
      && list(unifiedSuite?.sourceDiscovery?.uncoveredSourcePlugins).length === 0,
    marketplaceProjection: marketplace?.name === "seis-repo"
      && marketplace?.interface?.displayName === "SEIS Repo"
      && marketplaceEntries.length === bundlePlan.targetMarketplaceCardCount
      && marketplaceEntries.length >= SEIS_PUBLIC_MARKETPLACE_MIN_CARD_COUNT
      && marketplaceEntries.length <= SEIS_PUBLIC_MARKETPLACE_MAX_CARD_COUNT
      && canonicalEntries.length === 1
      && bundleEntries.length === bundlePlan.publicBundleCardCount
      && sameOrderedValues(marketplaceEntries.map((entry) => entry?.name), ["seis-ai-agent", ...bundlePlan.bundles.map((bundle) => bundle.id)]),
    exactSourceCoverage: sourcePlugins.length === APP_PLUGIN_EXPANSION_TARGET
      && catalogPlugins.length === APP_PLUGIN_EXPANSION_TARGET
      && applicationPlugins.length === APP_PLUGIN_EXPANSION_TARGET
      && topicPlugins.length === 300
      && sameSet(sourceManifestNames, applicationNames)
      && sameSet(catalogNames, applicationNames)
      && sameSet(memberNames, sourceNames)
      && sameSet(bundleCatalogMemberNames, sourceNames)
      && memberNames.length === sourceNames.length
      && bundleCatalogMemberNames.length === sourceNames.length,
    bundleShape: familyBundles.length === bundlePlan.publicBundleCardCount
      && applicationBundles.length === 6
      && topicBundles.length === 27
      && bundleSizes.every((size) => Number.isInteger(size) && size > 0 && size <= SEIS_PUBLIC_BUNDLE_SIZE)
      && Math.max(...bundleSizes) === SEIS_PUBLIC_BUNDLE_SIZE,
    protectedProjectBoundaries: protectedTopicCategories.every((category) => topicBundles.some((bundle) => bundle.categoryLabels.length === 1 && bundle.categoryLabels[0] === category)),
    bundlePackageArtifacts: packageArtifactsReady
      && bundleCatalog?.id === "seis-public-plugin-bundle-catalog"
      && bundleCatalog?.marketplace?.publicCardCount === bundlePlan.targetMarketplaceCardCount
      && bundleCatalog?.marketplace?.bundleCardCount === bundlePlan.publicBundleCardCount
      && sameBundleCatalogProjection(list(bundleCatalog?.bundles), bundlePlan.bundles),
    retainedSourceDirectories: sourceDirectoriesReady,
    boundedMergeReview: profileSummary.exactNormalizedProfileGroupCount > 0
      && profileSummary.exactProfileCandidatePluginCount > 0
      && profileSummary.maximumCandidateGroupSize > 1
      && profileSummary.candidateNamesReturned === false,
    permissionBoundary: list(bundleCatalog?.permissions?.write).length === 0
      && list(bundleCatalog?.permissions?.network).length === 0
      && list(bundleCatalog?.permissions?.secrets).length === 0,
  };

  const result = {
    schemaVersion: 3,
    id: "seis-public-plugin-consolidation",
    goalId: "SEIS-GOAL-0024",
    parentGoalId: "SEIS-GOAL-021",
    status: "implemented-repository-local-not-published",
    maturity: "prototype",
    generatedAt: "2026-07-22",
    purpose: `Keep SEIS Repo discoverable with one canonical public install and ${bundlePlan.publicBundleCardCount} curated optional bundle cards, while retaining all source packages and preserving explicit project and category boundaries.`,
    installationPolicy: {
      canonicalInstallId: "seis-ai-agent@seis-repo",
      canonicalPluginName: "seis-ai-agent",
      defaultInstallMode: "single-public-plugin",
      publicDefaultInstallCount: 1,
      publicDiscoveryCardsAreDefaultInstalls: false,
      userRecommendation: `Install SEIS-Agent by default; choose at most one optional bundle of no more than ${SEIS_PUBLIC_BUNDLE_SIZE} capabilities when its named journey matches the task.`,
      bundleMembersAutoInstalled: false,
    },
    inventory: {
      previousMarketplaceCardCount: expectedPreviousCardCount,
      publicCardCount: marketplaceEntries.length,
      canonicalCardCount: canonicalEntries.length,
      bundleCardCount: bundleEntries.length,
      applicationBundleCardCount: applicationBundles.length,
      topicBundleCardCount: topicBundles.length,
      retainedRootSourceModuleCount: rootPlugins.length,
      applicationSourcePluginCount: applicationPlugins.length,
      applicationCatalogPluginCount: catalogPlugins.length,
      topicSourcePluginCount: topicPlugins.length,
      retainedSourceCapabilityCount: rootPlugins.length + applicationPlugins.length + topicPlugins.length,
      categoryCoverage,
    },
    bundlePlan: {
      status: "implemented-repository-local-not-published",
      maximumBundleSize: SEIS_PUBLIC_BUNDLE_SIZE,
      minimumBundleMemberCount: Math.min(...bundleSizes),
      maximumBundleMemberCount: Math.max(...bundleSizes),
      targetMarketplaceCardCount: bundlePlan.targetMarketplaceCardCount,
      projectedCardReduction: expectedPreviousCardCount - bundlePlan.targetMarketplaceCardCount,
      sourcePackagesDeleted: false,
      marketplaceProjectionGenerated: true,
      bundlePackagesCreated: packageArtifactsReady,
      sourcePackagesRetained: sourceDirectoriesReady,
      exactOnceCoverage: checks.exactSourceCoverage,
      applicationBundles: applicationBundles.map(bundleSummary),
      topicBundles: topicBundles.map(bundleSummary),
      userExperienceRule: "One canonical install remains the default. Optional bundles are named by user journey or topic boundary and are never silently installed together.",
    },
    identityBoundaries: {
      mergeProducts: false,
      protectedTopicCategories,
      rule: "SEIS, Eleni-Neferi, and Pantechnoesis remain distinct product identities; marketplace bundling changes discovery only.",
    },
    consolidationReview: {
      exactNormalizedProfileGroupCount: profileSummary.exactNormalizedProfileGroupCount,
      exactProfileCandidatePluginCount: profileSummary.exactProfileCandidatePluginCount,
      maximumCandidateGroupSize: profileSummary.maximumCandidateGroupSize,
      candidateNamesReturned: false,
      automaticPhysicalMerge: false,
      physicalMergePerformed: false,
      requiredBeforeSourceMerge: [
        "Behavior and compatibility review",
        "Canonical owner and redirect decision",
        "Focused rollback and migration plan",
        "Current human approval",
      ],
    },
    evidence: PATHS,
    checks,
    validation: [
      "npm run check:seis-public-plugin-family",
      "npm run check:seis-public-plugin-bundles",
      "npm run check:seis-public-plugin-consolidation",
      "node --test plugins/seis-core/test/public-plugin-bundles.test.mjs",
      "node --test plugins/seis-core/test/public-plugin-consolidation.test.mjs",
      "npm run check:seis-repo-marketplace",
      "git diff --check",
    ],
    publicBoundary: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      publicAudience: "everyone",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      protectedDefaultBranchWrites: false,
      publicReleaseAllowed: false,
    },
    externalClaims: {
      providerConnectivity: false,
      deployment: false,
      signing: false,
      publicRelease: false,
      githubPush: false,
    },
    rollback: {
      strategy: "revert",
      scope: "Revert the focused marketplace projection, generated bundle packages, and evidence record. The canonical SEIS-Agent package and every retained source package remain intact.",
      dataMigrationRequired: false,
    },
  };

  validateRecord(result);
  return result;
}

function validateRecord(result) {
  assert(result.id === "seis-public-plugin-consolidation" && result.goalId === "SEIS-GOAL-0024" && result.parentGoalId === "SEIS-GOAL-021", "record identity is invalid");
  assert(result.status === "implemented-repository-local-not-published" && result.maturity === "prototype", "record status is invalid");
  assert(result.inventory?.previousMarketplaceCardCount === 381 && result.inventory?.publicCardCount === 34, "marketplace inventory is invalid");
  assert(result.inventory?.canonicalCardCount === 1 && result.inventory?.bundleCardCount === 33, "card allocation is invalid");
  assert(result.inventory?.applicationBundleCardCount === 6 && result.inventory?.topicBundleCardCount === 27, "bundle-family allocation is invalid");
  assert(result.inventory?.applicationSourcePluginCount === 75 && result.inventory?.topicSourcePluginCount === 300 && result.inventory?.retainedSourceCapabilityCount === 380, "retained source inventory is invalid");
  assert(result.bundlePlan?.maximumBundleSize === 15 && result.bundlePlan?.minimumBundleMemberCount > 0 && result.bundlePlan?.maximumBundleMemberCount <= 15, "bundle size boundary is invalid");
  assert(result.bundlePlan?.projectedCardReduction === 347 && result.bundlePlan?.sourcePackagesDeleted === false && result.bundlePlan?.exactOnceCoverage === true, "bundle projection is invalid");
  assert(result.identityBoundaries?.mergeProducts === false && list(result.identityBoundaries?.protectedTopicCategories).length === 3, "identity boundary is invalid");
  assert(Object.values(result.checks || {}).every(Boolean), "one or more required checks are not current");
  assert(Object.values(result.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(result.publicBoundary?.network === false && result.publicBoundary?.externalWrites === false && result.publicBoundary?.secrets === false && result.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(result)), "record must not contain a machine-specific path");
}

function bundleSummary(bundle) {
  return {
    id: bundle.id,
    journeyId: bundle.journeyId,
    journeyLabel: bundle.journeyLabel,
    journeyPart: bundle.journeyPart,
    journeyPartCount: bundle.journeyPartCount,
    memberCount: bundle.memberCount,
    categoryLabels: bundle.categoryLabels,
    sourcePath: bundle.sourcePath,
  };
}

function sameBundleProjection(actual, expected) {
  if (actual.length !== expected.length) return false;
  return actual.every((bundle, index) => {
    const planned = expected[index];
    return bundle?.id === planned.id
      && bundle?.journeyId === planned.journeyId
      && bundle?.journeyLabel === planned.journeyLabel
      && bundle?.journeyPart === planned.journeyPart
      && bundle?.journeyPartCount === planned.journeyPartCount
      && bundle?.memberCount === planned.memberCount
      && sameOrderedValues(list(bundle?.members).map((member) => member?.name), planned.members.map((member) => member.name));
  });
}

function sameBundleCatalogProjection(actual, expected) {
  if (actual.length !== expected.length) return false;
  return actual.every((bundle, index) => bundle?.id === expected[index].id
    && bundle?.family === expected[index].family
    && bundle?.memberCount === expected[index].memberCount
    && sameOrderedValues(list(bundle?.memberNames), expected[index].members.map((member) => member.name)));
}

function summarizeCapabilityProfiles(plugins) {
  const groups = new Map();
  for (const plugin of plugins) {
    const category = normalizeToken(plugin?.category || "unclassified");
    const capabilities = [...new Set(list(plugin?.capabilities).map(normalizeToken).filter(Boolean))].sort();
    const signature = JSON.stringify([category, capabilities]);
    groups.set(signature, (groups.get(signature) || 0) + 1);
  }
  const repeatedSizes = [...groups.values()].filter((size) => size > 1);
  return {
    exactNormalizedProfileGroupCount: repeatedSizes.length,
    exactProfileCandidatePluginCount: repeatedSizes.reduce((sum, size) => sum + size, 0),
    maximumCandidateGroupSize: repeatedSizes.length > 0 ? Math.max(...repeatedSizes) : 0,
    candidateNamesReturned: false,
  };
}

function countCategories(entries) {
  const counts = new Map();
  for (const entry of entries) {
    const category = String(entry?.category || "unclassified").trim();
    counts.set(category, (counts.get(category) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, publicCardCount]) => ({ category, publicCardCount }))
    .sort((left, right) => left.category.localeCompare(right.category));
}

function sourceDirectoryReady(value) {
  const relativePath = String(value || "").replace(/^\.\//, "");
  if (!relativePath.startsWith("plugins/") || relativePath.includes("..")) return false;
  const absolutePath = safePath(relativePath);
  if (!fs.existsSync(absolutePath)) return false;
  const stat = fs.lstatSync(absolutePath);
  return stat.isDirectory() && !stat.isSymbolicLink();
}

function bundleArtifactReady(bundle) {
  const base = String(bundle?.sourcePath || "").replace(/^\.\//, "");
  if (!base.startsWith("plugins/seis-bundles/") || base.includes("..")) return false;
  return [
    path.join(base, ".codex-plugin", "plugin.json"),
    path.join(base, ".mcp.json"),
    path.join(base, "assets", "bundle-profile.json"),
    path.join(base, "skills", String(bundle.id || ""), "SKILL.md"),
    path.join(base, "scripts", "seis-bundle-mcp-server.mjs"),
    path.join(base, "README.md"),
  ].every((relativePath) => regularFileReady(relativePath, 2 * 1024 * 1024));
}

function regularFileReady(relativePath, maximumBytes) {
  const absolutePath = safePath(relativePath);
  if (!fs.existsSync(absolutePath)) return false;
  const stat = fs.lstatSync(absolutePath);
  return stat.isFile() && !stat.isSymbolicLink() && stat.size <= maximumBytes;
}

function sourcePath(entry) {
  return typeof entry?.source?.path === "string" ? entry.source.path : "";
}

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sameSet(actual, expected) {
  const left = new Set(actual);
  const right = new Set(expected);
  return left.size === actual.length
    && right.size === expected.length
    && left.size === right.size
    && [...left].every((value) => right.has(value));
}

function sameOrderedValues(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin consolidation: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = safePath(relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin consolidation: required input is missing: ${relativePath}`);
  const stat = fs.lstatSync(absolutePath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_INPUT_BYTES) {
    throw new Error(`SEIS public plugin consolidation: required input must be a bounded regular file: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = safePath(relativePath);
  const parent = path.dirname(absolutePath);
  const parentStat = fs.lstatSync(parent);
  if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) {
    throw new Error(`SEIS public plugin consolidation: output parent must be a regular directory: ${path.relative(ROOT, parent)}`);
  }
  if (fs.existsSync(absolutePath)) {
    const outputStat = fs.lstatSync(absolutePath);
    if (!outputStat.isFile() || outputStat.isSymbolicLink()) {
      throw new Error(`SEIS public plugin consolidation: output must be a regular non-link file: ${relativePath}`);
    }
  }
  const temporaryPath = `${absolutePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, value, { flag: "wx", mode: 0o644 });
    fs.renameSync(temporaryPath, absolutePath);
  } catch (error) {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
    throw error;
  }
}

function safePath(relativePath) {
  if (typeof relativePath !== "string" || !relativePath || path.isAbsolute(relativePath)) {
    throw new Error(`SEIS public plugin consolidation: invalid repository-relative path: ${String(relativePath)}`);
  }
  const absolutePath = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, absolutePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`SEIS public plugin consolidation: path escapes repository root: ${relativePath}`);
  }
  return absolutePath;
}
