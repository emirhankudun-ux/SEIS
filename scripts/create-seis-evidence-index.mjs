#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { auditEvidenceIndex, EVIDENCE_INDEX_ID } from "../plugins/seis-core/seis-evidence-index/runtime/evidence-index.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-evidence-index.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const RELEASE_TRAIN_PATH = "content/development/seis-core-plugin-release-train.json";
const DECISION_PATH = "content/development/seis-public-plugin-wave-1-capability-decision.json";

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-evidence-index");
    process.exit(1);
  }
  console.log("SEIS evidence-index plugin evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for the public SEIS evidence-index package.");
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const releaseTrain = readJson(RELEASE_TRAIN_PATH);
  const decision = readJson(DECISION_PATH);
  const currentRelease = releaseTrain.currentRelease || {};
  const sourceEntry = (sourceManifest.plugins || []).find((plugin) => plugin?.name === EVIDENCE_INDEX_ID);
  assert(sourceEntry, "app source manifest must contain the evidence-index package");
  assert(sourceEntry.version === currentRelease.semver && sourceEntry.releaseTrainVersion === currentRelease.label, "evidence-index release metadata is stale");
  assert(decision?.decision?.selectedCapability === EVIDENCE_INDEX_ID, "capability decision must select the evidence-index package");

  const audit = auditEvidenceIndex(ROOT);
  assert(audit.ok, "bounded Wave 1 evidence inputs must pass before generated plugin evidence is written");
  assert(audit.errorCount === 0, "generated plugin evidence must not conceal input errors");

  const record = {
    schemaVersion: 1,
    id: EVIDENCE_INDEX_ID,
    goalId: "SEIS-GOAL-021",
    backlogId: "SEIS-BL-021",
    generatedAt: "2026-07-21",
    status: "completed-public-evidence-index",
    purpose: "Summarize bounded Wave 1 public marketplace, release, program, and recorded-attention evidence without returning raw records or creating a live installation, provider, GitHub, publication, deployment, or release claim.",
    capabilityDecision: {
      id: decision.id,
      status: decision.status,
      selectedCapability: decision.decision.selectedCapability,
      priorCatalogState: decision.decision.priorCatalogState,
    },
    plugin: {
      name: EVIDENCE_INDEX_ID,
      marketplaceName: decision.publicBoundary.marketplaceName,
      marketplaceDisplayName: decision.publicBoundary.marketplaceDisplayName,
      sourcePath: "plugins/seis-core/" + EVIDENCE_INDEX_ID,
      releaseLabel: currentRelease.label,
      releaseSemver: currentRelease.semver,
      implementationState: sourceEntry.implementationState,
      publicAudience: decision.publicBoundary.publicAudience,
      publicMarketplace: decision.publicBoundary.publicMarketplace,
    },
    inputs: {
      waveEvidenceIndex: "content/development/seis-public-plugin-wave-1-evidence-index.json",
      waveProgram: "content/development/seis-public-plugin-wave-1-program.json",
      capabilityDecision: DECISION_PATH,
      sourceManifest: SOURCE_MANIFEST_PATH,
    },
    summary: audit.summary,
    checks: audit.checks,
    findings: audit.findings,
    safety: {
      read: audit.permissions.read,
      write: [],
      network: [],
      secrets: [],
      publicReleaseAllowed: false,
      rawInputValuesReturned: false,
    },
    limitations: [
      "This generated record is bounded local evidence, not an external installation, publication, release, GitHub, provider, browser, or deployment proof.",
      "Recorded attention contract identifiers remain visible and are not converted into a release decision.",
      "The plugin does not replace the underlying focused audit packages or their validation.",
    ],
  };
  validateRecord(record, currentRelease);
  return record;
}

function validateRecord(record, release) {
  assert(record.id === EVIDENCE_INDEX_ID, "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021" && record.backlogId === "SEIS-BL-021", "goal linkage is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo" && record.plugin?.marketplaceDisplayName === "SEIS Repo", "marketplace identity is invalid");
  assert(record.plugin?.releaseLabel === release.label && record.plugin?.releaseSemver === release.semver, "release metadata is invalid");
  assert(record.status === "completed-public-evidence-index", "evidence record status is invalid");
  assert(record.plugin?.implementationState === "functional-local-demo", "implementation state is invalid");
  assert(record.plugin?.publicAudience === "everyone" && record.plugin?.publicMarketplace === true, "public distribution contract is invalid");
  assert(record.summary?.publicCardCount === record.summary?.expectedCardCount, "public marketplace evidence is inconsistent");
  assert(Array.isArray(record.summary?.recordedAttentionContractIds), "recorded attention summary is invalid");
  assert(record.safety?.write?.length === 0 && record.safety?.network?.length === 0 && record.safety?.secrets?.length === 0, "safety permissions must be empty");
  assert(record.safety?.publicReleaseAllowed === false && record.safety?.rawInputValuesReturned === false, "release and raw-input boundary is invalid");
  assert(!/(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m.test(JSON.stringify(record)), "record must not contain machine-specific paths");
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS evidence-index plugin evidence: " + message);
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
