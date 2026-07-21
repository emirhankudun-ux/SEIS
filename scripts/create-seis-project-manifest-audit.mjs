#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { auditProjectManifest, PROJECT_MANIFEST_AUDIT_ID, PROJECT_MANIFEST_PATH } from "../plugins/seis-core/seis-project-manifest-audit/runtime/project-manifest-audit.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-project-manifest-audit.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const RELEASE_TRAIN_PATH = "content/development/seis-core-plugin-release-train.json";
const PLUGIN_ID = PROJECT_MANIFEST_AUDIT_ID;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-project-manifest-audit`);
    process.exit(1);
  }
  console.log("SEIS project-manifest audit evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for the public SEIS Repo project boundary.`);
}

function buildRecord() {
  const releaseTrain = readJson(RELEASE_TRAIN_PATH);
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const currentRelease = releaseTrain.currentRelease || {};
  const pluginEntry = (sourceManifest.plugins || []).find((plugin) => plugin?.name === PLUGIN_ID);
  assert(pluginEntry, "public app source manifest must contain the project-manifest audit plugin");
  assert(pluginEntry.version === currentRelease.semver, "project-manifest audit plugin version is stale");
  assert(pluginEntry.releaseTrainVersion === currentRelease.label, "project-manifest audit release train is stale");

  const audit = auditProjectManifest(ROOT);
  assert(audit.ok, "project manifest governance audit must pass before evidence is generated");
  assert(audit.errorCount === 0 && audit.findings.length === 0, "project manifest evidence must not conceal errors");

  const record = {
    schemaVersion: 1,
    id: PLUGIN_ID,
    goalId: "SEIS-GOAL-021",
    backlogId: "SEIS-BL-021",
    generatedAt: "2026-07-21",
    status: "active-project-manifest-governance-evidence",
    purpose: "Keep the checked-in SEIS project manifest, app-owned source inventory, canonical ownership, and public SEIS Repo marketplace counts aligned without turning local metadata into a live GitHub, provider, or release claim.",
    portfolioPosition: {
      nonDuplicative: true,
      complements: [
        "seis-canonical-registry-validator: JSON registry IDs, owner fields, and duplicate-record evidence",
        "seis-public-distribution-audit: public marketplace projection consistency",
        "seis-goal-integrity: goal lifecycle and evidence-hint validation",
      ],
      adds: "Cross-file validation for project.ecosystem.yaml ownership, source-of-truth, public-distribution boundary, deny-by-default permissions, and marketplace count declarations.",
    },
    plugin: {
      name: PLUGIN_ID,
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      sourcePath: `plugins/seis-core/${PLUGIN_ID}`,
      releaseLabel: currentRelease.label,
      releaseSemver: currentRelease.semver,
      publicAudience: "everyone",
      publicMarketplace: true,
    },
    projectManifest: PROJECT_MANIFEST_PATH,
    sourceManifest: SOURCE_MANIFEST_PATH,
    manifestAuditCompleted: true,
    overallState: audit.state,
    checks: audit.checks,
    counts: audit.counts,
    findings: audit.findings,
    manualEvidenceRequired: [
      "human review before changing canonical ownership, visibility, or public/private policy",
      "GitHub remote and branch-protection verification before release, protected-branch write, or publication claims",
      "security review before broadening plugin permissions or enabling external writes",
    ],
    safety: {
      reads: audit.permissions.read,
      write: [],
      network: [],
      secrets: [],
      executesPlugin: false,
      publicReleaseAllowed: false,
    },
    limitations: [
      "The audit only validates checked-in local declarations and generated repository metadata.",
      "It cannot prove remote GitHub state, branch protection, marketplace installation, live provider health, or runtime behavior.",
      "A ready result requires separate human approval before any ownership transfer, publication, credentialed activation, external write, or release claim.",
    ],
  };
  validateRecord(record, currentRelease);
  return record;
}

function validateRecord(record, release) {
  assert(record.id === PLUGIN_ID, "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
  assert(record.backlogId === "SEIS-BL-021", "backlog linkage is invalid");
  assert(record.plugin?.name === PLUGIN_ID, "plugin name is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo" && record.plugin?.marketplaceDisplayName === "SEIS Repo", "marketplace identity is invalid");
  assert(record.plugin?.releaseLabel === release.label && record.plugin?.releaseSemver === release.semver, "plugin release is stale");
  assert(record.plugin?.publicAudience === "everyone" && record.plugin?.publicMarketplace === true, "public distribution contract is invalid");
  assert(record.portfolioPosition?.nonDuplicative === true, "portfolio overlap decision is missing");
  assert(record.manifestAuditCompleted === true && record.overallState === "ready", "project manifest audit must be ready");
  assert(Array.isArray(record.checks) && record.checks.length >= 15 && record.checks.every((check) => check.observed === true), "manifest check evidence is incomplete");
  assert(record.counts?.sourceManifestPluginCount === record.counts?.marketplaceApplicationPluginCount, "application source counts are inconsistent");
  assert(record.counts?.declaredMarketplaceEntryCount === record.counts?.marketplaceEntryCount, "marketplace counts are inconsistent");
  assert(Array.isArray(record.findings) && record.findings.length === 0, "manifest evidence findings are invalid");
  assert(record.safety?.write?.length === 0 && record.safety?.network?.length === 0 && record.safety?.secrets?.length === 0, "safety permissions must remain empty");
  assert(record.safety?.executesPlugin === false && record.safety?.publicReleaseAllowed === false, "non-executing safety boundary is invalid");
  assert(!/(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m.test(JSON.stringify(record)), "record must not contain machine-specific paths");
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS project-manifest audit: ${message}`);
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
