#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-5-round-3-checkpoint.json";
const CANDIDATE = "seis-plugin-capability-coverage";
const COMPLETED_STEPS = Object.freeze(Array.from({ length: 20 }, (_, index) => index + 41));
const PATHS = Object.freeze({
  activationDecision: "content/development/seis-public-plugin-wave-5-activation-decision.json",
  capabilityEvidence: "content/development/seis-plugin-capability-coverage.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  marketplace: ".agents/plugins/marketplace.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  profile: "plugins/seis-core/seis-plugin-capability-coverage/assets/plugin-profile.json",
  manifest: "plugins/seis-core/seis-plugin-capability-coverage/.codex-plugin/plugin.json",
  runtime: "plugins/seis-core/seis-plugin-capability-coverage/runtime/plugin-capability-coverage.mjs",
  test: "plugins/seis-core/test/plugin-capability-coverage.test.mjs",
  skill: "plugins/seis-core/seis-plugin-capability-coverage/skills/seis-plugin-capability-coverage/SKILL.md",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-5-round-3-checkpoint`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 5 round 3 checkpoint check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for Wave 5 steps ${COMPLETED_STEPS[0]}-${COMPLETED_STEPS.at(-1)}.`);
}

function buildRecord() {
  const activation = readJson(PATHS.activationDecision);
  const evidence = readJson(PATHS.capabilityEvidence);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const profile = readJson(PATHS.profile);
  const manifest = readJson(PATHS.manifest);
  const runtimeSource = readText(PATHS.runtime);
  const testSource = readText(PATHS.test);
  const skillSource = readText(PATHS.skill);
  const sourceEntries = list(sourceManifest.plugins);
  const catalogEntries = list(catalog.plugins);
  const matrixEntries = list(matrix.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const applicationBundleMembers = list(bundleCatalog.bundles)
    .filter((bundle) => bundle?.family === "application")
    .flatMap((bundle) => list(bundle?.memberNames));
  const expectedPublicCardCount = 34;
  const checks = {
    activation: activation?.id === "seis-public-plugin-wave-5-activation-decision"
      && activation?.status === "approved-public-local-wave-5-activation"
      && activation?.decision?.selectedCapability === CANDIDATE
      && activation?.decision?.activationApproved === true
      && activation?.decision?.implementationApproved === true
      && activation?.decision?.publicReleaseApproved === false,
    boundedEvidence: evidence?.id === CANDIDATE
      && evidence?.status === "ready-public-static-capability-coverage-evidence"
      && evidence?.audit?.ok === true
      && evidence?.audit?.reconciliation?.reconciled === true
      && evidence?.fixedRegistrySafetyCoverage?.status === "ready-fixed-registry-safety-coverage"
      && list(evidence?.fixedRegistrySafetyCoverage?.coveredFailureModes).length === 7,
    malformedRegistryTests: [
      "invalid-source-manifest-plugins",
      "invalid-catalog-plugins",
      "invalid-matrix-plugins",
      "invalid-marketplace-plugins",
      "invalid-bundle-catalog-bundles",
    ].every((marker) => testSource.includes(marker)),
    duplicateAndLimitTests: testSource.includes("duplicate-plugin-name")
      && testSource.includes("category-kind-limit-exceeded")
      && testSource.includes("capability-token-kind-limit-exceeded")
      && testSource.includes("maxReturnedCapabilityTokenKinds"),
    fixedRootAndEvidenceTests: testSource.includes("invalid-report-path")
      && testSource.includes("SEIS_WORKSPACE_ROOT")
      && testSource.includes("evidence.evidence, null"),
    aggregateOutputBounds: evidence?.outputBounds?.aggregateOnly === true
      && evidence?.outputBounds?.maxReturnedCategoryKinds === 128
      && evidence?.outputBounds?.maxReturnedCapabilityTokenKinds === 256
      && evidence?.outputBounds?.maxReturnedFindings === 64
      && evidence?.outputBounds?.categoryCountsTruncated === false
      && evidence?.outputBounds?.capabilityTokenFrequenciesTruncated === false
      && runtimeSource.includes("maxReturnedCapabilityTokenKinds"),
    compatibilityDocumentation: skillSource.includes("Registry evolution and compatibility")
      && skillSource.includes("lower-case ASCII kebab tokens")
      && skillSource.includes("review the bounded static evidence"),
    profilePermissions: list(profile?.permissions?.write).length === 0
      && list(profile?.permissions?.network).length === 0
      && list(profile?.permissions?.secrets).length === 0
      && profile?.audit?.maxReturnedCategoryKinds === 128
      && profile?.audit?.maxReturnedCapabilityTokenKinds === 256
      && profile?.audit?.maxReturnedFindings === 64,
    projectionCounts: sourceEntries.length === APP_PLUGIN_EXPANSION_TARGET
      && catalogEntries.length === APP_PLUGIN_EXPANSION_TARGET
      && matrixEntries.length === APP_PLUGIN_EXPANSION_TARGET
      && applicationBundleMembers.length === APP_PLUGIN_EXPANSION_TARGET
      && new Set(applicationBundleMembers).size === APP_PLUGIN_EXPANSION_TARGET
      && marketplaceEntries.length === expectedPublicCardCount,
    terminology: marketplace?.name === "seis-repo"
      && marketplace?.interface?.displayName === "SEIS Repo"
      && manifest?.interface?.displayName === "SEIS Plugin Capability Coverage"
      && !JSON.stringify(manifest?.interface || {}).toLowerCase().includes("personal"),
    nonClaims: evidence?.safety?.writesFiles === false
      && evidence?.safety?.usesNetwork === false
      && evidence?.safety?.readsSecrets === false
      && evidence?.safety?.installsPlugins === false
      && evidence?.safety?.invokesProviders === false
      && evidence?.safety?.deploysArtifacts === false
      && evidence?.safety?.signsArtifacts === false
      && evidence?.safety?.publicReleaseAllowed === false,
  };
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-5-round-3-checkpoint",
    goalId: "SEIS-GOAL-021",
    parentProgramId: "seis-public-plugin-wave-5-program",
    wave: 5,
    round: 3,
    status: "completed-repository-local-round-3-checkpoint",
    maturity: "prototype",
    generatedAt: "2026-07-21",
    completedSteps: COMPLETED_STEPS,
    purpose: "Record bounded Wave 5 coverage interpretation, malformed-input resilience, output limits, public-contract review, and next-tranche readiness without collecting private data or claiming external runtime proof.",
    capability: {
      id: CANDIDATE,
      sourcePath: "plugins/seis-core/seis-plugin-capability-coverage",
      publicMarketplace: "seis-repo",
      publicMarketplaceDisplayName: "SEIS Repo",
      additionalPublicCardAdded: false,
    },
    boundedCoverage: {
      sourcePluginCount: sourceEntries.length,
      catalogPluginCount: catalogEntries.length,
      matrixPluginCount: matrixEntries.length,
      bundleApplicationMemberCount: applicationBundleMembers.length,
      marketplacePublicCardCount: marketplaceEntries.length,
      declaredCategoryCount: evidence?.audit?.declaredCategoryCount || 0,
      reportedCategoryCount: evidence?.audit?.reportedCategoryCount || 0,
      declaredCapabilityTokenKindCount: evidence?.audit?.declaredCapabilityTokenKindCount || 0,
      reportedCapabilityTokenKindCount: evidence?.audit?.reportedCapabilityTokenKindCount || 0,
      coverageOutputTruncated: evidence?.audit?.coverageOutputTruncated === true,
      rawRegistryContentStored: false,
    },
    outputContract: {
      aggregateOnly: true,
      normalizedCategoryTerminology: "lower-case-ascii-kebab",
      attentionDisposition: "review-required-not-alarm",
      maxReturnedCategoryKinds: evidence?.outputBounds?.maxReturnedCategoryKinds || 0,
      maxReturnedCapabilityTokenKinds: evidence?.outputBounds?.maxReturnedCapabilityTokenKinds || 0,
      maxReturnedFindings: evidence?.outputBounds?.maxReturnedFindings || 0,
      arbitraryRootsAllowed: false,
      rawRegistryContentReturned: false,
    },
    worktreeAndDriftReview: {
      repositoryLocalOnly: true,
      generatedArtifactCheckRequiredBeforeCommit: true,
      featureBranchDeliveryRequiredWhenAuthorized: true,
      protectedDefaultBranchWrites: false,
      backgroundExecutionClaimed: false,
    },
    evidence: PATHS,
    checks,
    validation: [
      "node --test plugins/seis-core/test/plugin-capability-coverage.test.mjs",
      "node --test plugins/seis-core/test/plugin-capability-coverage-evidence.test.mjs",
      "npm run check:seis-plugin-capability-coverage",
      "npm run check:seis-public-plugin-wave-5-round-3-checkpoint",
      "npm run check:seis-public-plugin-wave-5-program",
      "npm run check:seis-public-plugin-continuity",
      "npm run check:seis-repo-marketplace",
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
      independentInstallation: false,
      nativeRuntime: false,
      liveProvider: false,
      deployment: false,
      signing: false,
      publicRelease: false,
    },
    risks: [
      {
        id: "RISK-W5-003",
        status: "tracked",
        description: "A future public registry vocabulary may exceed safe aggregate output bounds.",
        mitigation: "Keep declared totals, cap returned aggregate vocabularies, and require a reviewed contract change before widening limits.",
      },
      {
        id: "RISK-W5-004",
        status: "tracked",
        description: "Schema evolution could make a formerly supported fixed projection ambiguous.",
        mitigation: "Fail closed to attention for malformed required shapes and document compatibility assumptions in the public skill.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the bounded runtime, tests, skill, profile, checkpoint, and generated evidence changes on the feature branch; no external system or registry data is changed.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-5-round-3-checkpoint" && record.goalId === "SEIS-GOAL-021" && record.parentProgramId === "seis-public-plugin-wave-5-program" && record.wave === 5 && record.round === 3 && record.status === "completed-repository-local-round-3-checkpoint" && record.maturity === "prototype", "record identity is invalid");
  assert(list(record.completedSteps).join(",") === COMPLETED_STEPS.join(","), "completed step range is invalid");
  assert(record.capability?.id === CANDIDATE && record.capability?.publicMarketplace === "seis-repo" && record.capability?.additionalPublicCardAdded === false, "capability scope is invalid");
  assert(record.boundedCoverage?.sourcePluginCount === APP_PLUGIN_EXPANSION_TARGET && record.boundedCoverage?.catalogPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.boundedCoverage?.matrixPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.boundedCoverage?.bundleApplicationMemberCount === APP_PLUGIN_EXPANSION_TARGET && record.boundedCoverage?.marketplacePublicCardCount === 34 && record.boundedCoverage?.declaredCategoryCount > 0 && record.boundedCoverage?.reportedCategoryCount > 0 && record.boundedCoverage?.declaredCapabilityTokenKindCount > 0 && record.boundedCoverage?.reportedCapabilityTokenKindCount > 0 && record.boundedCoverage?.coverageOutputTruncated === false && record.boundedCoverage?.rawRegistryContentStored === false, "bounded coverage is invalid");
  assert(record.outputContract?.aggregateOnly === true && record.outputContract?.normalizedCategoryTerminology === "lower-case-ascii-kebab" && record.outputContract?.attentionDisposition === "review-required-not-alarm" && record.outputContract?.maxReturnedCategoryKinds === 128 && record.outputContract?.maxReturnedCapabilityTokenKinds === 256 && record.outputContract?.maxReturnedFindings === 64 && record.outputContract?.arbitraryRootsAllowed === false && record.outputContract?.rawRegistryContentReturned === false, "output contract is invalid");
  assert(record.worktreeAndDriftReview?.repositoryLocalOnly === true && record.worktreeAndDriftReview?.generatedArtifactCheckRequiredBeforeCommit === true && record.worktreeAndDriftReview?.featureBranchDeliveryRequiredWhenAuthorized === true && record.worktreeAndDriftReview?.protectedDefaultBranchWrites === false && record.worktreeAndDriftReview?.backgroundExecutionClaimed === false, "worktree and drift boundary is invalid");
  assert(Object.values(record.checks || {}).every(Boolean), "required round 3 checks are not current");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo" && record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.protectedDefaultBranchWrites === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(list(record.risks).length === 2 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "checkpoint must not contain a machine-specific path");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 5 round 3 checkpoint: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 5 round 3 checkpoint: ${message}`);
}
