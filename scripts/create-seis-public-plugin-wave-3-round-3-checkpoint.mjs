#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-round-3-checkpoint.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const MATRIX_PATH = "content/development/seis-core-plugin-matrix.json";
const DECISION_PATH = "content/development/seis-public-plugin-wave-3-capability-decision.json";
const AUDIT_PATH = "content/development/seis-swift-concurrency-audit.json";
const MCP_PERMISSION_PATH = "content/development/seis-mcp-permission-risk-matrix.json";
const LIFECYCLE_PATH = "content/development/seis-public-plugin-lifecycle.json";
const EXTERNAL_PROOF_PATH = "content/development/seis-public-plugin-external-install-proof.json";
const PACKAGE_PATH = "plugins/seis-core/seis-swift-concurrency-audit";
const CHECKPOINT_COMMIT = "d6bfaab79ec26451d8ef9ca1c9556c5cb689f186";
const FEATURE_BRANCH = "plugins/seis-plugin-root-20260715";
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-3-round-3-checkpoint");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 round 3 checkpoint check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " with steps 47-60 reconciled.");
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const matrix = readJson(MATRIX_PATH);
  const decision = readJson(DECISION_PATH);
  const audit = readJson(AUDIT_PATH);
  const mcpPermission = readJson(MCP_PERMISSION_PATH);
  const lifecycle = readJson(LIFECYCLE_PATH);
  const externalProof = readJson(EXTERNAL_PROOF_PATH);
  const sourceEntry = list(sourceManifest.plugins).find((entry) => entry?.name === "seis-swift-concurrency-audit");
  const marketplaceEntry = list(marketplace.plugins).find((entry) => entry?.name === "seis-swift-concurrency-audit");
  const matrixEntry = list(matrix.plugins).find((entry) => entry?.name === "seis-swift-concurrency-audit");
  const mcpEntry = list(mcpPermission.records).find((entry) => entry?.name === "seis-swift-concurrency-audit");
  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-round-3-checkpoint",
    goalId: "SEIS-GOAL-021",
    wave: 3,
    round: 3,
    status: "completed-repository-local-checkpoint",
    generatedAt: "2026-07-21",
    purpose: "Reconcile the completed public SEIS Repo implementation and integration steps for the bounded Swift concurrency audit without converting repository-local evidence into an installation, native-runtime, provider, deployment, or release claim.",
    completedSteps: range(47, 60),
    selectedCapability: {
      id: decision.decision?.selectedCapability || null,
      implementationStarted: decision.decision?.implementationStarted === true,
      additionalPublicCardAdded: decision.decision?.additionalPublicCardAdded === true,
      packagePresent: fs.existsSync(path.join(ROOT, PACKAGE_PATH)),
    },
    publicDistribution: {
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      marketplaceCardPresent: marketplaceEntry?.source?.path === "./plugins/seis-core/seis-swift-concurrency-audit",
      applicationPluginCount: list(sourceManifest.plugins).length,
      marketplaceCardCount: list(marketplace.plugins).length,
      matrixPluginCount: matrix.pluginCount || 0,
      matrixReadyCount: matrix.readyCount || 0,
      matrixAttentionCount: matrix.attentionCount || 0,
      matrixFailureCount: matrix.failureCount || 0,
    },
    localEvidence: {
      staticAuditPath: AUDIT_PATH,
      staticAuditStatus: audit.status || null,
      staticAuditOk: audit.audit?.ok === true,
      staticAuditState: audit.audit?.state || null,
      staticAuditBlockingFindingCount: audit.audit?.blockingFindingCount || 0,
      sourceManifestRegistered: sourceEntry?.sourcePath === PACKAGE_PATH,
      matrixStatus: matrixEntry?.status || null,
      matrixOk: matrixEntry?.ok === true,
      publicReleaseAllowed: audit.safety?.publicReleaseAllowed === true,
    },
    permissions: {
      write: list(mcpEntry?.permissions?.write),
      network: list(mcpEntry?.permissions?.network),
      secrets: list(mcpEntry?.permissions?.secrets),
      transport: mcpEntry?.transport || null,
      remoteEndpointDeclared: mcpEntry?.remoteEndpointDeclared === true,
      environmentInjectionDeclared: mcpEntry?.environmentInjectionDeclared === true,
    },
    lifecycle: {
      status: lifecycle.status || null,
      publicReleaseAllowed: lifecycle.externalInstallProofSummary?.publicReleaseAllowed === true,
      externalProofStatus: externalProof.status || null,
      externalProofReleaseAllowed: externalProof.publicReleaseAllowed === true,
      freshTaskReloadEvidence: lifecycle.freshTaskReloadEvidence || null,
    },
    delivery: {
      commit: CHECKPOINT_COMMIT,
      branch: FEATURE_BRANCH,
      remoteReference: "refs/heads/plugins/seis-plugin-root-20260715",
      featureBranchOnly: true,
      protectedDefaultBranchWritten: false,
      remoteReferenceVerified: true,
    },
    validation: [
      "npm run check:seis-swift-concurrency-audit",
      "node --test plugins/seis-core/test/swift-concurrency-audit.test.mjs",
      "node --test plugins/seis-core/test/swift-concurrency-audit-evidence.test.mjs",
      "npm run check:seis-repo-marketplace",
      "npm run seis:check",
      "git diff --check",
    ],
    externalGaps: [
      "Swift compilation, SwiftPM test completion, and native runtime behavior are not run or claimed by this checkpoint.",
      "Independent fresh-task reload and independent installation evidence remain external release gates.",
      "No provider, deployment, signing, marketplace publication, or public release was performed.",
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused feature-branch package, its public card, generated records, and checkpoint references; no external state or data migration exists.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-3-round-3-checkpoint" && record.goalId === "SEIS-GOAL-021" && record.wave === 3 && record.round === 3, "checkpoint identity is invalid");
  assert(record.status === "completed-repository-local-checkpoint" && list(record.completedSteps).join(",") === range(47, 60).join(","), "completed step range is invalid");
  assert(record.selectedCapability?.id === "seis-swift-concurrency-audit" && record.selectedCapability?.implementationStarted === true && record.selectedCapability?.additionalPublicCardAdded === true && record.selectedCapability?.packagePresent === true, "selected capability evidence is invalid");
  assert(record.publicDistribution?.marketplaceName === "seis-repo" && record.publicDistribution?.marketplaceDisplayName === "SEIS Repo" && record.publicDistribution?.marketplaceCardPresent === true, "public distribution identity is invalid");
  assert(record.publicDistribution?.applicationPluginCount === 73 && record.publicDistribution?.marketplaceCardCount === 379 && record.publicDistribution?.matrixPluginCount === 73 && record.publicDistribution?.matrixFailureCount === 0, "public counts are invalid");
  assert(record.localEvidence?.staticAuditStatus === "attention-public-static-concurrency-evidence" && record.localEvidence?.staticAuditOk === true && record.localEvidence?.staticAuditState === "attention" && record.localEvidence?.staticAuditBlockingFindingCount === 0 && record.localEvidence?.sourceManifestRegistered === true && record.localEvidence?.matrixStatus === "attention" && record.localEvidence?.matrixOk === true && record.localEvidence?.publicReleaseAllowed === false, "local static evidence is invalid");
  assert(record.permissions?.write?.length === 0 && record.permissions?.network?.length === 0 && record.permissions?.secrets?.length === 0 && record.permissions?.transport === "local-stdio" && record.permissions?.remoteEndpointDeclared === false && record.permissions?.environmentInjectionDeclared === false, "permission boundary is invalid");
  assert(record.lifecycle?.publicReleaseAllowed === false && record.lifecycle?.externalProofReleaseAllowed === false && record.delivery?.commit === CHECKPOINT_COMMIT && record.delivery?.branch === FEATURE_BRANCH && record.delivery?.featureBranchOnly === true && record.delivery?.protectedDefaultBranchWritten === false && record.delivery?.remoteReferenceVerified === true, "lifecycle or delivery boundary is invalid");
  assert(record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false && list(record.externalGaps).length === 3, "rollback or external gap record is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "checkpoint must not contain a machine-specific path");
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 3 round 3 checkpoint: " + message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error("SEIS public plugin Wave 3 round 3 checkpoint: required input is missing: " + relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
