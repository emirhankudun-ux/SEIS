#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import { buildWave1MarketplaceCompatibility } from "./lib/seis-wave-1-marketplace-compatibility.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-1-evidence-index.json";
const PATHS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  publicFamily: "content/development/seis-public-plugin-family.json",
  bundleCatalog: "content/development/seis-public-plugin-bundle-catalog.json",
  sourceManifest: "apps/seis-core/data/seis-core-plugin-sources.json",
  releaseTrain: "content/development/seis-core-plugin-release-train.json",
  installState: "content/development/seis-public-install-state.json",
  installEvidence: "content/development/seis-public-install-evidence.json",
  runtimeStatus: "content/development/seis-public-runtime-status.json",
  mcpPermission: "content/development/seis-mcp-permission-risk-matrix.json",
  focusAudit: "content/development/seis-focus-navigation-audit.json",
  uiAudit: "content/development/seis-ui-state-contract-audit.json",
  manifestAudit: "content/development/seis-project-manifest-audit.json",
  lifecycle: "content/development/seis-public-plugin-lifecycle.json",
  securityReview: "content/development/seis-public-plugin-security-provenance-review.json",
  capabilityDecision: "content/development/seis-public-plugin-wave-1-capability-decision.json",
  waveProgram: "content/development/seis-public-plugin-wave-1-program.json",
});
const EXPECTED_DESKTOP_GAPS = ["degraded", "loading", "provider-failed", "validation-failed"];
const SECRET_PATTERNS = [
  { id: "openai-like-api-key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "private-key-header", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-1-evidence-index`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 1 evidence-index check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} with ${record.contracts.length} cross-contract checks.`);
}

function buildRecord() {
  const marketplace = readJson(PATHS.marketplace);
  const family = readJson(PATHS.publicFamily);
  const bundleCatalog = readJson(PATHS.bundleCatalog);
  const sourceManifest = readJson(PATHS.sourceManifest);
  const releaseTrain = readJson(PATHS.releaseTrain);
  const installState = readJson(PATHS.installState);
  const installEvidence = readJson(PATHS.installEvidence);
  const runtimeStatus = readJson(PATHS.runtimeStatus);
  const mcpPermission = readJson(PATHS.mcpPermission);
  const focusAudit = readJson(PATHS.focusAudit);
  const uiAudit = readJson(PATHS.uiAudit);
  const manifestAudit = readJson(PATHS.manifestAudit);
  const lifecycle = readJson(PATHS.lifecycle);
  const securityReview = readJson(PATHS.securityReview);
  const capabilityDecision = readJson(PATHS.capabilityDecision);
  const waveProgram = readJson(PATHS.waveProgram);
  const cards = list(marketplace.plugins);
  const applicationPlugins = list(sourceManifest.plugins);
  const release = releaseTrain.currentRelease || {};
  const commandCenter = findSurface(uiAudit, "seis-command-center");
  const desktop = findSurface(uiAudit, "seis-desktop-second-brain");
  const safetyScan = scanPublicSafeInputs(Object.values(PATHS));
  const publicCardCount = cards.length;
  const compatibility = buildWave1MarketplaceCompatibility({
    marketplace,
    publicFamily: family,
    sourceManifest,
    bundleCatalog,
  });
  const currentProjection = compatibility.currentMarketplaceProjection;
  const contracts = [
    {
      id: "public-marketplace-family",
      state: publicCardCount === currentProjection.publicCardCount
        && family.marketplace?.name === "seis-repo"
        && currentProjection.selectedApplicationCapability.bundleCardCount === 1
        ? "ready"
        : "attention",
      summary: "The current 34-card marketplace and bundle catalog retain the selected Wave 1 source capability through exactly one application bundle card.",
      evidencePaths: [PATHS.marketplace, PATHS.publicFamily, PATHS.bundleCatalog],
    },
    {
      id: "app-source-and-release-train",
      state: applicationPlugins.length === currentProjection.sourceCapabilityInventory.applicationSourcePackageCount && applicationPlugins.every((plugin) => plugin?.version === release.semver && plugin?.releaseTrainVersion === release.label) ? "ready" : "attention",
      summary: "Every app-owned public package matches the active app release train.",
      evidencePaths: [PATHS.sourceManifest, PATHS.releaseTrain],
    },
    {
      id: "public-install-and-runtime-boundaries",
      state: [installState, installEvidence, runtimeStatus].every((record) => record?.publicCards?.count === publicCardCount && record?.plugin?.marketplaceName === "seis-repo") ? "ready" : "attention",
      summary: "Public source, independent-evidence, and runtime-cache records agree on the current marketplace contract without claiming an external installation.",
      evidencePaths: [PATHS.installState, PATHS.installEvidence, PATHS.runtimeStatus],
    },
    {
      id: "mcp-permission-boundary",
      state: emptyPermissions(mcpPermission.safety) && mcpPermission.safety?.publicReleaseAllowed === false ? "ready" : "attention",
      summary: "Declared public MCP capabilities remain read-only, offline, secret-free, and non-releasing.",
      evidencePaths: [PATHS.mcpPermission],
    },
    {
      id: "focus-and-project-governance",
      state: list(focusAudit.surfaces).every((surface) => surface?.state === "ready") && manifestAudit.overallState === "ready" ? "ready" : "attention",
      summary: "Focused static navigation evidence and project-manifest governance remain ready for their bounded scopes.",
      evidencePaths: [PATHS.focusAudit, PATHS.manifestAudit],
    },
    {
      id: "ui-state-contract",
      state: commandCenter?.state === "ready" && desktop?.state === "attention" ? "attention" : "invalid",
      summary: "The Command Center static state contract is ready; desktop source markers remain a separate tracked gap.",
      evidencePaths: [PATHS.uiAudit],
    },
    {
      id: "security-and-provenance",
      state: number(securityReview.aggregate?.secretFindingCount) === 0 && number(securityReview.aggregate?.blockingFindingCount) === 0 ? "ready" : "attention",
      summary: "The existing public security/provenance review contains no secret or blocking finding.",
      evidencePaths: [PATHS.securityReview],
    },
    {
      id: "round-4-capability-decision",
      state: capabilityDecision.id === "seis-public-plugin-wave-1-capability-decision"
        && capabilityDecision.status === "approved-public-local-implementation"
        && capabilityDecision.decision?.selectedCapability === "seis-evidence-index"
        && capabilityDecision.publicBoundary?.marketplaceName === "seis-repo"
        && capabilityDecision.publicBoundary?.personalMarketplaceRead === false
        && capabilityDecision.publicBoundary?.personalMarketplaceMutation === false
        && capabilityDecision.publicBoundary?.network === false
        && capabilityDecision.publicBoundary?.externalWrites === false
        && capabilityDecision.publicBoundary?.secrets === false
        && capabilityDecision.publicBoundary?.publicReleaseAllowed === false
        && capabilityDecision.historicalWave1Snapshot?.publicCardCount === 377
        && capabilityDecision.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1
        && capabilityDecision.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false
        ? "ready"
        : "attention",
      summary: "The Round 4 evidence-index capability decision remains public-only, read-only, no-network, no-secret, and non-releasing.",
      evidencePaths: [PATHS.capabilityDecision],
    },
    {
      id: "wave-1-tracker",
      state: waveProgram.status === "completed" && completedStepCount(waveProgram) === 100 && inProgressStepNumbers(waveProgram).length === 0 ? "ready" : "attention",
      summary: "Wave 1 records all five rounds as complete after its bounded release-quality handoff.",
      evidencePaths: [PATHS.waveProgram],
    },
  ];
  const knownGaps = [
    {
      id: "desktop-ui-state-contract",
      state: "attention",
      surface: desktop?.id || "seis-desktop-second-brain",
      missingStateIds: sortedStrings(desktop?.missingStateIds),
      decision: "Keep this source-only gap separate from the Command Center checkpoint; do not convert it into a provider, browser, or release failure claim.",
    },
    {
      id: "independent-public-install-proof",
      state: "approval-required",
      decision: "Public release remains gated on independent installation evidence and explicit human approval.",
    },
  ];
  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-1-evidence-index",
    goalId: "SEIS-GOAL-021",
    generatedAt: "2026-07-21",
    status: "completed-repo-local-evidence-index",
    historicalWave1Snapshot: compatibility.historicalWave1Snapshot,
    currentMarketplaceProjection: currentProjection,
    scope: {
      programId: waveProgram.id,
      wave: 1,
      round: 5,
      marketplace: "seis-repo",
      publicAudience: "everyone",
      sourceOnly: true,
    },
    purpose: "Reconcile current public SEIS Repo evidence without turning repository-local checks into browser, provider, installation, publication, deployment, or human-approval claims.",
    release: {
      label: release.label || null,
      semver: release.semver || null,
      appPluginCount: applicationPlugins.length,
      maturity: release.maturity || null,
      publicReleaseBlocked: releaseTrain.policy?.publicReleaseAllowed === false,
    },
    contracts,
    knownGaps,
    inputSafetyScan: safetyScan,
    releaseBoundary: {
      publicReleaseAllowed: false,
      externalInstallationProven: installState.publicCards?.externalInstallationProven === true,
      independentEvidenceIsReleaseProof: false,
      humanApprovalRequired: true,
      lifecycleChannel: lifecycle.releasePolicy?.currentChannel || null,
      forbiddenWithoutApproval: list(lifecycle.releasePolicy?.forbiddenWithoutApproval),
    },
    safety: {
      reads: Object.values(PATHS),
      write: [],
      network: [],
      secrets: [],
      executesUi: false,
      startsMcpServers: false,
      installationMutation: false,
      publicationMutation: false,
    },
    limitations: [
      "The index compares checked-in repository records only; it does not execute a UI, provider, MCP server, or installation.",
      "The index does not make the desktop UI-state gap a live failure claim.",
      "The index does not prove an independent installation, publication, release, deployment, or human approval.",
    ],
    qualityGates: [
      "npm run check:seis-public-plugin-wave-1-program",
      "npm run check:seis-public-plugin-wave-1-evidence-index",
      "npm run check:seis-public-plugin-wave-1-capability-decision",
      "npm run check:seis-evidence-index",
      "npm run check:seis-repo-marketplace",
      "npm run check:seis-agent-plugin-integration",
    ],
  };
  validateRecord(record, { commandCenter, desktop });
  return record;
}

function validateRecord(record, context) {
  assert(record.id === "seis-public-plugin-wave-1-evidence-index", "record id is invalid");
  assert(record.schemaVersion === 2, "schema version is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
  assert(record.status === "completed-repo-local-evidence-index", "record status is invalid");
  assert(record.scope?.programId === "seis-public-plugin-wave-1-program" && record.scope?.wave === 1 && record.scope?.round === 5, "Wave 1 scope is invalid");
  assert(record.historicalWave1Snapshot?.projectionModel === "direct-source-cards" && record.historicalWave1Snapshot?.publicCardCount === 377 && record.historicalWave1Snapshot?.applicationPluginCount === 71 && record.historicalWave1Snapshot?.selectedCapabilityDirectCardCount === 1, "historical Wave 1 marketplace snapshot is invalid");
  assert(record.currentMarketplaceProjection?.marketplaceName === "seis-repo" && record.currentMarketplaceProjection?.marketplaceDisplayName === "SEIS Repo", "current public marketplace identity is invalid");
  assert(record.currentMarketplaceProjection?.publicCardCount === 34 && record.currentMarketplaceProjection?.canonicalCardCount === 1 && record.currentMarketplaceProjection?.bundleCardCount === 33 && record.currentMarketplaceProjection?.applicationBundleCardCount === 6 && record.currentMarketplaceProjection?.topicBundleCardCount === 27, "current curated marketplace counts are invalid");
  assert(record.currentMarketplaceProjection?.sourceCapabilityInventory?.applicationSourcePackageCount === APP_PLUGIN_EXPANSION_TARGET && record.currentMarketplaceProjection?.sourceCapabilityInventory?.retainedSourcePackageCount === 380, "current retained source counts are invalid");
  assert(record.currentMarketplaceProjection?.selectedApplicationCapability?.id === "seis-evidence-index" && record.currentMarketplaceProjection?.selectedApplicationCapability?.retainedSource === true && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardCount === 0 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1, "current selected-capability bundle resolution is invalid");
  assert(record.release?.label === "0.00000002" && record.release?.semver === "0.0.20" && record.release?.appPluginCount === APP_PLUGIN_EXPANSION_TARGET, "app release reconciliation is invalid");
  assert(record.release?.publicReleaseBlocked === true, "app release policy must retain the public-release block");
  assert(Array.isArray(record.contracts) && record.contracts.length === 9, "cross-contract evidence is incomplete");
  assert(record.contracts.filter((contract) => contract.state === "ready").length === 8, "expected ready cross-contract evidence is incomplete");
  assert(record.contracts.find((contract) => contract.id === "round-4-capability-decision")?.state === "ready", "Round 4 capability decision evidence is incomplete");
  assert(record.contracts.find((contract) => contract.id === "ui-state-contract")?.state === "attention", "desktop UI-state evidence must remain an attention finding");
  assert(context.commandCenter?.state === "ready", "Command Center state evidence is not ready");
  assert(context.desktop?.state === "attention" && sameStrings(sortedStrings(context.desktop?.missingStateIds), EXPECTED_DESKTOP_GAPS), "desktop UI-state gap is invalid");
  assert(Array.isArray(record.knownGaps) && record.knownGaps.length === 2, "known gaps are incomplete");
  assert(sameStrings(record.knownGaps[0]?.missingStateIds, EXPECTED_DESKTOP_GAPS), "known desktop state gaps are invalid");
  assert(record.inputSafetyScan?.machineSpecificPathFindingCount === 0 && record.inputSafetyScan?.secretLikeFindingCount === 0, "public evidence inputs contain unsafe findings");
  assert(record.releaseBoundary?.publicReleaseAllowed === false && record.releaseBoundary?.externalInstallationProven === false && record.releaseBoundary?.independentEvidenceIsReleaseProof === false && record.releaseBoundary?.humanApprovalRequired === true, "release boundary is invalid");
  assert(emptyPermissions(record.safety) && record.safety?.executesUi === false && record.safety?.startsMcpServers === false && record.safety?.installationMutation === false && record.safety?.publicationMutation === false, "safety boundary is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "record must not contain machine-specific paths");
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

function emptyPermissions(safety) {
  return list(safety?.write).length === 0 && list(safety?.network).length === 0 && list(safety?.secrets).length === 0;
}

function findSurface(record, id) {
  return list(record?.surfaces).find((surface) => surface?.id === id) || null;
}

function completedStepCount(record) {
  return list(record?.steps).filter((step) => step?.status === "completed").length;
}

function inProgressStepNumbers(record) {
  return list(record?.steps).filter((step) => step?.status === "in-progress").map((step) => step.number).sort((left, right) => left - right);
}

function sortedStrings(value) {
  return list(value).map((item) => String(item)).sort();
}

function sameStrings(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function number(value) {
  return Number.isFinite(value) ? value : 0;
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 1 evidence index: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
