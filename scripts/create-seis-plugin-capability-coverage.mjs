#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import {
  PLUGIN_CAPABILITY_COVERAGE_ID,
  auditPluginCapabilityCoverage,
} from "../plugins/seis-core/seis-plugin-capability-coverage/runtime/plugin-capability-coverage.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-plugin-capability-coverage.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const CATALOG_PATH = "apps/seis-core/data/seis-core-plugin-catalog.json";
const MATRIX_PATH = "content/development/seis-core-plugin-matrix.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const BUNDLE_CATALOG_PATH = "content/development/seis-public-plugin-bundle-catalog.json";
const ACTIVATION_DECISION_PATH = "content/development/seis-public-plugin-wave-5-activation-decision.json";
const RUNTIME_PATH = "plugins/seis-core/seis-plugin-capability-coverage/runtime/plugin-capability-coverage.mjs";
const TEST_PATH = "plugins/seis-core/test/plugin-capability-coverage.test.mjs";
const SKILL_PATH = "plugins/seis-core/seis-plugin-capability-coverage/skills/seis-plugin-capability-coverage/SKILL.md";
const PROFILE_PATH = "plugins/seis-core/seis-plugin-capability-coverage/assets/plugin-profile.json";
const CANONICAL_ORCHESTRATOR_COUNT = 1;
const PUBLIC_BUNDLE_COUNT = 33;
const TOPIC_PLUGIN_COUNT = 300;
const EXPECTED_PUBLIC_CARD_COUNT = CANONICAL_ORCHESTRATOR_COUNT + PUBLIC_BUNDLE_COUNT;
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-plugin-capability-coverage`);
    process.exit(1);
  }
  console.log("SEIS plugin capability coverage evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with ${record.audit.declaredCapabilityTokenKindCount} declared capability-token kinds.`);
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const catalog = readJson(CATALOG_PATH);
  const matrix = readJson(MATRIX_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const bundleCatalog = readJson(BUNDLE_CATALOG_PATH);
  const activation = readJson(ACTIVATION_DECISION_PATH);
  const sourceEntry = list(sourceManifest.plugins).find((entry) => entry?.name === PLUGIN_CAPABILITY_COVERAGE_ID);
  const catalogEntry = list(catalog.plugins).find((entry) => entry?.name === PLUGIN_CAPABILITY_COVERAGE_ID);
  const matrixEntry = list(matrix.plugins).find((entry) => entry?.name === PLUGIN_CAPABILITY_COVERAGE_ID);
  const bundleMemberships = list(bundleCatalog.bundles).filter((bundle) => list(bundle?.memberNames).includes(PLUGIN_CAPABILITY_COVERAGE_ID));
  const bundleMembership = bundleMemberships.length === 1 ? bundleMemberships[0] : null;
  const marketplaceEntry = list(marketplace.plugins).find((entry) => entry?.name === bundleMembership?.id);
  const audit = auditPluginCapabilityCoverage(ROOT);
  const runtimeSource = readText(RUNTIME_PATH);
  const testSource = readText(TEST_PATH);
  const skillSource = readText(SKILL_PATH);
  const profile = readJson(PROFILE_PATH);
  const record = {
    schemaVersion: 1,
    id: PLUGIN_CAPABILITY_COVERAGE_ID,
    goalId: "SEIS-GOAL-021",
    wave: 5,
    generatedAt: "2026-07-21",
    status: "ready-public-static-capability-coverage-evidence",
    purpose: "Record one bounded, read-only public SEIS Repo registry capability-coverage summary without returning raw registry content or claiming manifest correctness, installation, runtime, provider access, deployment, signing, or public release.",
    plugin: {
      name: sourceEntry?.name || null,
      sourcePath: sourceEntry?.sourcePath || null,
      version: sourceEntry?.version || null,
      releaseTrainVersion: sourceEntry?.releaseTrainVersion || null,
      catalogStatus: catalogEntry?.status?.state || null,
      matrixStatus: matrixEntry?.status || null,
      matrixOk: matrixEntry?.ok === true,
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      marketplaceCategory: marketplaceEntry?.category || null,
      publicAudience: "everyone",
      directMarketplaceCard: false,
      publicBundleId: bundleMembership?.id || null,
      publicMarketplace: Boolean(bundleMembership && marketplaceEntry?.source?.path === `./plugins/seis-bundles/${bundleMembership.id}`),
    },
    marketplace: {
      publicCardCount: list(marketplace.plugins).length,
      expectedPublicCardCount: EXPECTED_PUBLIC_CARD_COUNT,
      applicationPluginCount: list(sourceManifest.plugins).length,
      expectedApplicationPluginCount: APP_PLUGIN_EXPANSION_TARGET,
      canonicalOrchestratorCount: CANONICAL_ORCHESTRATOR_COUNT,
      bundlePluginCount: PUBLIC_BUNDLE_COUNT,
      applicationBundleMemberCount: list(bundleCatalog.bundles)
        .filter((bundle) => bundle?.family === "application")
        .flatMap((bundle) => list(bundle?.memberNames)).length,
      topicPluginCount: TOPIC_PLUGIN_COUNT,
    },
    activation: {
      id: activation.id || null,
      status: activation.status || null,
      selectedCapability: activation.decision?.selectedCapability || null,
      activationApproved: activation.decision?.activationApproved === true,
      implementationAuthorized: activation.decision?.implementationApproved === true,
      implementationObserved: Boolean(sourceEntry && catalogEntry && matrixEntry && bundleMembership && marketplaceEntry),
      publicReleaseApproved: activation.decision?.publicReleaseApproved === true,
    },
    audit: {
      state: audit.state,
      ok: audit.ok === true,
      classification: audit.classification,
      reconciliationAvailable: audit.summary.reconciliationAvailable,
      sourcePluginCount: audit.summary.sourcePluginCount,
      catalogPluginCount: audit.summary.catalogPluginCount,
      matrixPluginCount: audit.summary.matrixPluginCount,
      bundleApplicationMemberCount: audit.summary.bundleApplicationMemberCount,
      marketplacePublicCardCount: audit.summary.marketplacePublicCardCount,
      declaredCategoryCount: audit.summary.declaredCategoryCount,
      reportedCategoryCount: audit.summary.reportedCategoryCount,
      declaredCapabilityTokenKindCount: audit.summary.declaredCapabilityTokenKindCount,
      reportedCapabilityTokenKindCount: audit.summary.reportedCapabilityTokenKindCount,
      declaredCapabilityTokenCount: audit.summary.declaredCapabilityTokenCount,
      coverageOutputTruncated: audit.summary.coverageOutputTruncated,
      findingCodes: audit.findings.map((finding) => finding.code).filter(Boolean).sort(),
      reconciliation: audit.reconciliation,
      categoryCounts: audit.coverage.categoryCounts,
      capabilityTokenFrequencies: audit.coverage.capabilityTokenFrequencies,
    },
    outputBounds: {
      aggregateOnly: audit.outputBoundary.aggregateOutputBounded === true,
      maxReturnedCategoryKinds: audit.limits.maxReturnedCategoryKinds,
      maxReturnedCapabilityTokenKinds: audit.limits.maxReturnedCapabilityTokenKinds,
      maxReturnedFindings: audit.limits.maxReturnedFindings,
      categoryCountsTruncated: audit.coverage.categoryCountsTruncated,
      capabilityTokenFrequenciesTruncated: audit.coverage.capabilityTokenFrequenciesTruncated,
    },
    fixedRegistrySafetyCoverage: {
      status: "ready-fixed-registry-safety-coverage",
      coveredFailureModes: [
        "missing-fixed-registry",
        "non-regular-or-symlinked-registry",
        "oversized-registry",
        "invalid-registry-json",
        "projection-mismatch",
        "machine-path-and-credential-marker-redaction",
        "MCP-arbitrary-report-path",
      ],
      testPath: TEST_PATH,
    },
    safety: {
      write: audit.permissions.write,
      network: audit.permissions.network,
      secrets: audit.permissions.secrets,
      readsPersonalMarketplace: audit.safety.readsPersonalMarketplace,
      writesFiles: audit.safety.writesFiles,
      usesNetwork: audit.safety.usesNetwork,
      readsSecrets: audit.safety.readsSecrets,
      installsPlugins: audit.safety.installsPlugins,
      invokesProviders: audit.safety.invokesProviders,
      deploysArtifacts: audit.safety.deploysArtifacts,
      signsArtifacts: audit.safety.signsArtifacts,
      publicReleaseAllowed: audit.safety.publicReleaseAllowed,
    },
    publicBoundary: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      publicReleaseAllowed: false,
    },
    validation: [
      "node plugins/seis-core/seis-plugin-capability-coverage/scripts/seis-plugin-capability-coverage-mcp-server.mjs --status",
      "node plugins/seis-core/seis-plugin-capability-coverage/scripts/seis-plugin-capability-coverage-mcp-server.mjs --report --path .",
      "node plugins/seis-core/seis-plugin-capability-coverage/scripts/seis-plugin-capability-coverage-mcp-server.mjs --evidence",
      "npm run check:seis-plugin-capability-coverage",
      `node --test ${TEST_PATH}`,
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the local package, its optional bundle membership, and generated evidence record; no registry source, external system, or release state is mutated by the plugin runtime.",
      dataMigrationRequired: false,
    },
    publicSafetyReview: {
      runtimeContainsFixedScope: runtimeSource.includes("PLUGIN_CAPABILITY_COVERAGE_SCOPE"),
      runtimeRefusesSymlinks: runtimeSource.includes("isSymbolicLink"),
      runtimeAvoidsRawRegistryOutput: runtimeSource.includes("rawRegistryContentReturned: false"),
      runtimeBoundsAggregateOutput: runtimeSource.includes("maxReturnedCapabilityTokenKinds"),
      testCoversRedaction: testSource.includes("credential-assignment-marker-found"),
      skillStatesStaticOnlyBoundary: skillSource.includes("static coverage view"),
      skillDocumentsRegistryEvolution: skillSource.includes("Registry evolution and compatibility"),
      profileMatchesReadOnlyBoundary: list(profile?.permissions?.write).length === 0
        && list(profile?.permissions?.network).length === 0
        && list(profile?.permissions?.secrets).length === 0
        && profile?.audit?.maxReturnedCapabilityTokenKinds === audit.limits.maxReturnedCapabilityTokenKinds,
      rawValuesStored: false,
    },
    outputBoundary: audit.outputBoundary,
    nativeExecution: "not-run-and-not-claimed",
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === PLUGIN_CAPABILITY_COVERAGE_ID && record.goalId === "SEIS-GOAL-021" && record.wave === 5, "record identity is invalid");
  assert(record.status === "ready-public-static-capability-coverage-evidence", "record status is invalid");
  assert(record.plugin?.name === PLUGIN_CAPABILITY_COVERAGE_ID && record.plugin?.sourcePath === `plugins/seis-core/${PLUGIN_CAPABILITY_COVERAGE_ID}` && record.plugin?.catalogStatus === "ready" && record.plugin?.matrixStatus === "ready" && record.plugin?.matrixOk === true, "plugin projection is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo" && record.plugin?.marketplaceDisplayName === "SEIS Repo" && record.plugin?.marketplaceCategory === "Developer" && record.plugin?.directMarketplaceCard === false && typeof record.plugin?.publicBundleId === "string" && record.plugin?.publicMarketplace === true, "public marketplace contract is invalid");
  assert(record.marketplace?.publicCardCount === EXPECTED_PUBLIC_CARD_COUNT && record.marketplace?.bundlePluginCount === PUBLIC_BUNDLE_COUNT && record.marketplace?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.marketplace?.applicationBundleMemberCount === APP_PLUGIN_EXPANSION_TARGET, "public count contract is invalid");
  assert(record.activation?.id === "seis-public-plugin-wave-5-activation-decision" && record.activation?.selectedCapability === PLUGIN_CAPABILITY_COVERAGE_ID && record.activation?.activationApproved === true && record.activation?.implementationAuthorized === true && record.activation?.implementationObserved === true && record.activation?.publicReleaseApproved === false, "Wave 5 activation linkage is invalid");
  assert(record.audit?.state === "ready" && record.audit?.ok === true && record.audit?.classification === "bounded-declared-seis-plugin-capability-coverage" && record.audit?.reconciliationAvailable === true && record.audit?.sourcePluginCount === APP_PLUGIN_EXPANSION_TARGET && record.audit?.catalogPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.audit?.matrixPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.audit?.bundleApplicationMemberCount === APP_PLUGIN_EXPANSION_TARGET && record.audit?.reconciliation?.reconciled === true && record.audit?.reconciliation?.mismatchCount === 0, "capability coverage audit is invalid");
  assert(record.audit?.declaredCategoryCount > 0 && record.audit?.reportedCategoryCount > 0 && record.audit?.declaredCapabilityTokenKindCount > 0 && record.audit?.reportedCapabilityTokenKindCount > 0 && record.audit?.declaredCapabilityTokenCount > 0 && record.audit?.coverageOutputTruncated === false && list(record.audit?.findingCodes).length === 0, "coverage summary is invalid");
  assert(record.outputBounds?.aggregateOnly === true && record.outputBounds?.maxReturnedCategoryKinds === 128 && record.outputBounds?.maxReturnedCapabilityTokenKinds === 256 && record.outputBounds?.maxReturnedFindings === 64 && record.outputBounds?.categoryCountsTruncated === false && record.outputBounds?.capabilityTokenFrequenciesTruncated === false, "output bounds are invalid");
  assert(record.fixedRegistrySafetyCoverage?.status === "ready-fixed-registry-safety-coverage" && list(record.fixedRegistrySafetyCoverage?.coveredFailureModes).length === 7, "fixed registry safety coverage is invalid");
  assert(record.safety?.write?.length === 0 && record.safety?.network?.length === 0 && record.safety?.secrets?.length === 0 && record.safety?.readsPersonalMarketplace === false && record.safety?.writesFiles === false && record.safety?.usesNetwork === false && record.safety?.readsSecrets === false && record.safety?.installsPlugins === false && record.safety?.invokesProviders === false && record.safety?.deploysArtifacts === false && record.safety?.signsArtifacts === false && record.safety?.publicReleaseAllowed === false, "execution boundary is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false, "public boundary is invalid");
  assert(record.publicSafetyReview?.runtimeContainsFixedScope === true && record.publicSafetyReview?.runtimeRefusesSymlinks === true && record.publicSafetyReview?.runtimeAvoidsRawRegistryOutput === true && record.publicSafetyReview?.runtimeBoundsAggregateOutput === true && record.publicSafetyReview?.testCoversRedaction === true && record.publicSafetyReview?.skillStatesStaticOnlyBoundary === true && record.publicSafetyReview?.skillDocumentsRegistryEvolution === true && record.publicSafetyReview?.profileMatchesReadOnlyBoundary === true && record.publicSafetyReview?.rawValuesStored === false, "public safety review is invalid");
  assert(record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "rollback boundary is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "record must not contain a machine-specific path");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS plugin capability coverage evidence: required input is missing: ${relativePath}`);
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
  if (!condition) throw new Error(`SEIS plugin capability coverage evidence: ${message}`);
}
