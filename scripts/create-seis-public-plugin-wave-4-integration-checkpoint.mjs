#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-4-integration-checkpoint.json";
const CAPABILITY = "seis-swift-package-topology";
const SOURCE_PATH = "plugins/seis-core/seis-swift-package-topology";
const PATHS = Object.freeze({
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  catalog: "apps/seis-core/data/seis-core-plugin-catalog.json",
  matrix: "content/development/seis-core-plugin-matrix.json",
  marketplace: ".agents/plugins/marketplace.json",
  topologyEvidence: "content/development/seis-swift-package-topology.json",
  permissionMatrix: "content/development/seis-mcp-permission-risk-matrix.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  installState: "content/development/seis-public-install-state.json",
  installEvidence: "content/development/seis-public-install-evidence.json",
  runtimeStatus: "content/development/seis-public-runtime-status.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;
const SECRET_PATTERNS = [
  { id: "openai-like-api-key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "private-key-header", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-4-integration-checkpoint");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 4 integration checkpoint check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for Wave 4 steps 74-80.");
}

function buildRecord() {
  const sourceManifest = readJson(PATHS.sourceManifest);
  const catalog = readJson(PATHS.catalog);
  const matrix = readJson(PATHS.matrix);
  const marketplace = readJson(PATHS.marketplace);
  const topologyEvidence = readJson(PATHS.topologyEvidence);
  const permissionMatrix = readJson(PATHS.permissionMatrix);
  const lifecycle = readJson(PATHS.lifecycle);
  const installState = readJson(PATHS.installState);
  const installEvidence = readJson(PATHS.installEvidence);
  const runtimeStatus = readJson(PATHS.runtimeStatus);
  const securityReview = readJson(PATHS.securityReview);
  const sourceEntry = exactOne(sourceManifest.plugins, CAPABILITY, "source manifest");
  const catalogEntry = exactOne(catalog.plugins, CAPABILITY, "catalog");
  const matrixEntry = exactOne(matrix.plugins, CAPABILITY, "matrix");
  const marketplaceEntry = exactOne(marketplace.plugins, CAPABILITY, "marketplace");
  const permissionEntry = exactOne(permissionMatrix.records, CAPABILITY, "permission matrix");
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-4-integration-checkpoint",
    goalId: "SEIS-GOAL-021",
    wave: 4,
    round: 4,
    status: "completed-repository-local-integration-checkpoint",
    maturity: "prototype",
    generatedAt: "2026-07-21",
    purpose: "Record the completed public-repository integration steps for one bounded static Swift Package topology plugin. This checkpoint reconciles source, catalog, matrix, SEIS Repo card, generated evidence, and deny-by-default permissions without treating repository-local checks as independent installation, SwiftPM, compiler, runtime, provider, deployment, signing, or public-release proof.",
    completedSteps: range(74, 80),
    capability: {
      id: CAPABILITY,
      sourceDirectoryPresent: fs.existsSync(path.join(ROOT, SOURCE_PATH)),
      fixedManifestPath: "packages/seis_platform_swift/Package.swift",
      staticOnly: true,
      sourceManifestRegistered: sourceEntry?.sourcePath === SOURCE_PATH,
      catalogRegistered: catalogEntry?.sourcePath === SOURCE_PATH,
      matrixRegistered: matrixEntry?.status === "ready" && matrixEntry?.ok === true,
      marketplaceCardRegistered: marketplaceEntry?.source?.path === "./" + SOURCE_PATH,
    },
    publicProjection: {
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      applicationPluginCount: list(sourceManifest.plugins).length,
      catalogPluginCount: catalog.counts?.discovered || 0,
      matrixPluginCount: matrix.pluginCount || 0,
      matrixFailureCount: matrix.failureCount || 0,
      publicCardCount: list(marketplace.plugins).length,
      marketplaceCategory: marketplaceEntry?.category || null,
      installationPolicy: marketplaceEntry?.policy?.installation || null,
      authenticationPolicy: marketplaceEntry?.policy?.authentication || null,
    },
    topologyEvidence: {
      path: PATHS.topologyEvidence,
      status: topologyEvidence.status || null,
      auditOk: topologyEvidence.audit?.ok === true,
      auditState: topologyEvidence.audit?.state || null,
      declaredPlatformCount: topologyEvidence.audit?.declaredPlatformCount || 0,
      productCount: topologyEvidence.audit?.productCount || 0,
      targetCount: topologyEvidence.audit?.targetCount || 0,
      targetDependencyEdgeCount: topologyEvidence.audit?.targetDependencyEdgeCount || 0,
      testTargetDependencyCount: topologyEvidence.audit?.testTargetDependencyCount || 0,
      executableResourceCount: topologyEvidence.audit?.executableResourceCount || 0,
      staticOnlyClaims: {
        compilesSwift: topologyEvidence.safety?.compilesSwift === true,
        runsSwiftTests: topologyEvidence.safety?.runsSwiftTests === true,
        startsNativeApplication: topologyEvidence.safety?.startsNativeApplication === true,
        publicReleaseAllowed: topologyEvidence.safety?.publicReleaseAllowed === true,
      },
    },
    permissions: {
      transport: permissionEntry?.transport || null,
      permissionState: permissionEntry?.permissionState || null,
      write: list(permissionEntry?.permissions?.write),
      network: list(permissionEntry?.permissions?.network),
      secrets: list(permissionEntry?.permissions?.secrets),
      remoteEndpointDeclared: permissionEntry?.remoteEndpointDeclared === true,
      environmentInjectionDeclared: permissionEntry?.environmentInjectionDeclared === true,
      risk: permissionEntry?.risk || null,
    },
    publicSafety: {
      lifecycleStatus: lifecycle.status || null,
      lifecyclePublicReleaseAllowed: lifecycle.externalInstallProofSummary?.publicReleaseAllowed === true,
      installStateStatus: installState.status || null,
      installStatePublicReleaseAllowed: installState.releaseGate?.publicReleaseAllowed === true,
      installEvidenceStatus: installEvidence.status || null,
      installEvidencePublicReleaseAllowed: installEvidence.releaseBoundary?.publicReleaseAllowed === true,
      runtimeStatus: runtimeStatus.status || null,
      runtimePublicReleaseAllowed: runtimeStatus.runtimeBoundary?.publicReleaseAllowed === true,
      securityReviewStatus: securityReview.status || null,
      securityReviewPublicReleaseAllowed: securityReview.publicReleaseAllowed === true,
    },
    externalClaims: {
      independentInstallation: false,
      compiledSwift: false,
      swiftPmTestPass: false,
      nativeRuntime: false,
      liveProvider: false,
      deployment: false,
      signing: false,
      publicRelease: false,
    },
    validation: [
      "npm run check:seis-swift-package-topology",
      "node --test plugins/seis-core/test/swift-package-topology.test.mjs",
      "node --test plugins/seis-core/test/swift-package-topology-evidence.test.mjs",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-public-marketplace-terminology",
      "npm run check:seis-public-plugin-security-provenance-review",
      "npm run check:seis-public-plugin-continuity",
    ],
    externalGaps: [
      "Independent clean-runner or public-install evidence remains pending and is not created by this checkpoint.",
      "SwiftPM resolution, compilation, tests, and native runtime behavior are not run or claimed by this static topology package.",
      "No provider, deployment, signing, marketplace publication, protected-branch update, or public release was performed.",
    ],
    risks: [
      {
        id: "RISK-W4-008",
        status: "tracked",
        description: "A public SEIS Repo card could be mistaken for independent installation or release proof.",
        mitigation: "Keep the independent evidence and human-approval gates false and link their current repository records.",
      },
      {
        id: "RISK-W4-009",
        status: "tracked",
        description: "A static parser result could be mistaken for a compiler, SwiftPM, or runtime validation result.",
        mitigation: "Expose only derived manifest topology and preserve all execution claims as false.",
      },
      {
        id: "RISK-W4-010",
        status: "tracked",
        description: "Projection metadata could drift across source, catalog, matrix, marketplace, and permission records.",
        mitigation: "Require exact single-entry reconciliation and generated evidence checks before a feature-branch delivery.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused source package, its one SEIS Repo card, generated topology evidence, integration checkpoint, and aligned projections on the feature branch; no manifest mutation, external state, release, or data migration exists.",
      dataMigrationRequired: false,
    },
    inputSafetyScan: scanPublicSafeInputs(Object.values(PATHS)),
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-4-integration-checkpoint" && record.goalId === "SEIS-GOAL-021" && record.wave === 4 && record.round === 4 && record.status === "completed-repository-local-integration-checkpoint" && record.maturity === "prototype", "checkpoint identity is invalid");
  assert(list(record.completedSteps).join(",") === range(74, 80).join(","), "completed step range is invalid");
  assert(record.capability?.id === CAPABILITY && record.capability?.sourceDirectoryPresent === true && record.capability?.fixedManifestPath === "packages/seis_platform_swift/Package.swift" && record.capability?.staticOnly === true && record.capability?.sourceManifestRegistered === true && record.capability?.catalogRegistered === true && record.capability?.matrixRegistered === true && record.capability?.marketplaceCardRegistered === true, "capability projection is invalid");
  assert(record.publicProjection?.marketplaceName === "seis-repo" && record.publicProjection?.marketplaceDisplayName === "SEIS Repo" && record.publicProjection?.applicationPluginCount === 74 && record.publicProjection?.catalogPluginCount === 74 && record.publicProjection?.matrixPluginCount === 74 && record.publicProjection?.matrixFailureCount === 0 && record.publicProjection?.publicCardCount === 380 && record.publicProjection?.marketplaceCategory === "Developer" && record.publicProjection?.installationPolicy === "AVAILABLE" && record.publicProjection?.authenticationPolicy === "ON_INSTALL", "public projection is invalid");
  assert(record.topologyEvidence?.status === "ready-public-static-topology-evidence" && record.topologyEvidence?.auditOk === true && record.topologyEvidence?.auditState === "ready" && record.topologyEvidence?.declaredPlatformCount === 2 && record.topologyEvidence?.productCount === 2 && record.topologyEvidence?.targetCount === 3 && record.topologyEvidence?.targetDependencyEdgeCount === 1 && record.topologyEvidence?.testTargetDependencyCount === 1 && record.topologyEvidence?.executableResourceCount === 2 && Object.values(record.topologyEvidence?.staticOnlyClaims || {}).every((value) => value === false), "topology evidence is invalid");
  assert(record.permissions?.transport === "local-stdio" && record.permissions?.permissionState === "deny-by-default" && list(record.permissions?.write).length === 0 && list(record.permissions?.network).length === 0 && list(record.permissions?.secrets).length === 0 && record.permissions?.remoteEndpointDeclared === false && record.permissions?.environmentInjectionDeclared === false && record.permissions?.risk === "low", "permission boundary is invalid");
  assert(record.publicSafety?.lifecycleStatus === "active-local-proof-public-release-gated" && record.publicSafety?.lifecyclePublicReleaseAllowed === false && record.publicSafety?.installStateStatus === "public-seis-repo-source-available-independent-install-pending" && record.publicSafety?.installStatePublicReleaseAllowed === false && record.publicSafety?.installEvidenceStatus === "public-seis-repo-independent-install-evidence-gate" && record.publicSafety?.installEvidencePublicReleaseAllowed === false && record.publicSafety?.runtimeStatus === "public-seis-repo-runtime-cache-observation" && record.publicSafety?.runtimePublicReleaseAllowed === false && record.publicSafety?.securityReviewStatus === "repo-local-security-provenance-reviewed" && record.publicSafety?.securityReviewPublicReleaseAllowed === false, "public safety boundary is invalid");
  assert(Object.values(record.externalClaims || {}).every((value) => value === false), "external claims must remain false");
  assert(list(record.validation).length === 7 && list(record.externalGaps).length === 3 && list(record.risks).length === 3, "validation, gaps, or risks are incomplete");
  assert(record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "rollback boundary is invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0 && record.inputSafetyScan?.rawValuesStored === false, "checkpoint inputs contain unsafe values");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "checkpoint must not contain a machine-specific path");
}

function exactOne(entries, name, label) {
  const matches = list(entries).filter((entry) => entry?.name === name);
  assert(matches.length === 1, label + " must contain exactly one " + name + " entry");
  return matches[0];
}

function scanPublicSafeInputs(paths) {
  const findings = [];
  for (const relativePath of paths) {
    const source = readText(relativePath);
    if (MACHINE_PATH_PATTERN.test(source)) findings.push({ path: relativePath, category: "machine-specific-path" });
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(source)) findings.push({ path: relativePath, category: pattern.id });
    }
  }
  return {
    inputCount: paths.length,
    machineSpecificPathFindingCount: findings.filter((finding) => finding.category === "machine-specific-path").length,
    secretLikeFindingCount: findings.filter((finding) => finding.category !== "machine-specific-path").length,
    findings,
    rawValuesStored: false,
  };
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 4 integration checkpoint: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 4 integration checkpoint: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
