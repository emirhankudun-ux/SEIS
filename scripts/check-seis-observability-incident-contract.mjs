#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];

const paths = {
  contract: "content/development/seis-observability-incident-contract.json",
  runbook: "docs/operations/seis-observability-incident-contract.md",
  fullUsage: "content/development/seis-full-usage-operating-mode.json",
  operationsReadiness: "content/development/seis-command-center-operations-readiness.json",
  sshAccessModel: "deploy/seis-ssh-access-model.json",
  docsIndex: "docs/INDEX.md"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(abs(relativePath), label);

const contract = readJson(paths.contract, "observability incident contract");
const runbook = readText(paths.runbook, "observability incident runbook");
const fullUsage = readJson(paths.fullUsage, "full usage operating mode");
const operationsReadiness = readJson(paths.operationsReadiness, "operations readiness");
const sshAccessModel = readJson(paths.sshAccessModel, "SSH access model");
const docsIndex = readText(paths.docsIndex, "docs index");

const requiredReadinessLevels = [
  "local-only",
  "dry-run",
  "pr-ready",
  "release-candidate",
  "production-gated",
  "incident",
  "restore-drill",
  "iac-plan",
  "iac-apply"
];
const requiredSeverityIds = ["sev0", "sev1", "sev2", "sev3"];
const requiredIncidentStates = [
  "detected",
  "triage",
  "contained",
  "mitigated",
  "resolved",
  "postmortem",
  "follow-up"
];
const requiredAuditFields = [
  "timestamp",
  "repoId",
  "branch",
  "commit",
  "actorRole",
  "eventType",
  "severity",
  "readinessLevel",
  "evidencePath",
  "redactionStatus",
  "approvalReference",
  "rollbackAction",
  "externalMutationPerformed",
  "secretValueIncluded"
];
const requiredRestoreFields = [
  "scope",
  "riskClass",
  "rtoTarget",
  "rpoTarget",
  "rollbackCommandOrNote",
  "dataLossRisk",
  "approvalRequirement",
  "postDrillFinding"
];

if (contract) {
  ensure(contract.id === "seis-observability-incident-contract", "contract id mismatch");
  ensure(contract.status === "documented-contract", "contract status mismatch");
  ensure(contract.qualityGate === "node scripts/check-seis-observability-incident-contract.mjs", "quality gate mismatch");
  ensure(contract.sourceOfTruth?.runbook === paths.runbook, "contract must point to runbook");
  ensure(contract.sourceOfTruth?.fullUsageOperatingMode === paths.fullUsage, "contract must point to full usage mode");
  ensure(contract.sourceOfTruth?.operationsReadiness === paths.operationsReadiness, "contract must point to operations readiness");
  ensure(contract.sourceOfTruth?.sshAccessModel === paths.sshAccessModel, "contract must point to SSH access model");
  ensure(String(contract.purpose || "").includes("DevOps/SRE"), "purpose must name DevOps/SRE");
  ensure(String(contract.truthBoundary || "").includes("not live monitoring"), "truth boundary must reject live monitoring claims");
  ensure(String(contract.truthBoundary || "").includes("not proof"), "truth boundary must reject proof claims");
  ensureArrayIncludesAll(contract.ownerRoles, [
    "Lead Architect Agent",
    "DevOps Agent",
    "Security Agent",
    "Release Agent",
    "AI Core Agent"
  ], "ownerRoles");
  ensureArrayIncludesAll((contract.readinessLevels || []).map((level) => level.id), requiredReadinessLevels, "readinessLevels");
  for (const level of contract.readinessLevels || []) {
    ensureNonEmptyString(level.meaning, `${level.id}.meaning`);
    ensure(Array.isArray(level.allows) && level.allows.length >= 2, `${level.id}.allows must include at least two items`);
    ensure(Array.isArray(level.blocks) && level.blocks.length >= 2, `${level.id}.blocks must include at least two items`);
    ensure(Array.isArray(level.requiredEvidence) && level.requiredEvidence.length >= 2, `${level.id}.requiredEvidence must include at least two items`);
    ensureNonEmptyString(level.externalMutationAuthority, `${level.id}.externalMutationAuthority`);
  }
  for (const blockedLevelId of ["production-gated", "incident", "iac-apply"]) {
    const level = (contract.readinessLevels || []).find((item) => item.id === blockedLevelId);
    ensure(
      level?.externalMutationAuthority === "blocked-without-explicit-approval",
      `${blockedLevelId} must be blocked without explicit approval`
    );
  }
  ensure(Array.isArray(contract.sliSloCatalog) && contract.sliSloCatalog.length >= 4, "sliSloCatalog must include at least four signals");
  for (const signal of contract.sliSloCatalog || []) {
    ensureNonEmptyString(signal.id, "sliSloCatalog.id");
    ensureNonEmptyString(signal.sli, `${signal.id}.sli`);
    ensureNonEmptyString(signal.slo, `${signal.id}.slo`);
    ensureNonEmptyString(signal.measurementSource, `${signal.id}.measurementSource`);
    ensureNonEmptyString(signal.currentStatus, `${signal.id}.currentStatus`);
    ensure(["local-evidence-only", "tracked-policy-only", "planned-ledger-needed", "policy-evidence-only"].includes(signal.currentStatus), `${signal.id}.currentStatus must use an allowed non-live state`);
  }
  ensureArrayIncludesAll((contract.alertSeverities || []).map((severity) => severity.id), requiredSeverityIds, "alertSeverities");
  for (const severity of contract.alertSeverities || []) {
    ensureNonEmptyString(severity.label, `${severity.id}.label`);
    ensureNonEmptyString(severity.response, `${severity.id}.response`);
    ensure(typeof severity.requiresOwnerApproval === "boolean", `${severity.id}.requiresOwnerApproval must be boolean`);
  }
  ensureArrayIncludesAll(contract.incidentStates, requiredIncidentStates, "incidentStates");
  ensureArrayIncludesAll(contract.auditLogFields, requiredAuditFields, "auditLogFields");
  ensureArrayIncludesAll(contract.restoreDrillRequirements, requiredRestoreFields, "restoreDrillRequirements");
  ensureArrayIncludesAll(contract.forbiddenClaims, [
    "live monitoring is active",
    "production telemetry is connected",
    "incident automation is executing",
    "cloud resources were changed",
    "SSH execution occurred",
    "provider dashboards were queried"
  ], "forbiddenClaims");
  ensureArrayIncludesAll(contract.requiredChecks, [
    "node scripts/check-seis-observability-incident-contract.mjs",
    "npm run check:seis-full-usage-operating-mode",
    "npm run check:seis-command-center-operations-readiness",
    "npm run check:seis-governance-index"
  ], "requiredChecks");
  ensureArrayIncludesAll(contract.completionDefinition, [
    "Readiness levels cover local-only, dry-run, pr-ready, release-candidate, production-gated, incident, restore-drill, iac-plan, and iac-apply.",
    "SLI/SLO records identify measurement source and current status without claiming live monitoring.",
    "Incident severities and states define response behavior without printing secrets or mutating external systems.",
    "Audit log fields include approval, rollback, redaction, and external mutation markers.",
    "The runbook, docs index, checker script, and full-usage backlog all point to this contract."
  ], "completionDefinition");
}

if (fullUsage) {
  const backlogItem = (fullUsage.domainGapBacklog || []).find((item) => item.id === "devops-observability-incident-contract");
  ensure(Boolean(backlogItem), "full usage backlog must include devops-observability-incident-contract");
  ensure(backlogItem?.status === "implemented", "full usage backlog item must be marked implemented");
  ensure(backlogItem?.artifact === paths.contract, "full usage backlog item must point to observability contract");
  ensure(backlogItem?.qualityGate === "node scripts/check-seis-observability-incident-contract.mjs", "full usage backlog item must declare quality gate");
}

ensure(operationsReadiness?.id === "seis-command-center-operations-readiness", "operations readiness id mismatch");
ensure(sshAccessModel?.id === "seis-ssh-access-model", "SSH access model id mismatch");
ensureNotIgnored(paths.runbook, "observability incident runbook");

for (const token of [
  "SEIS Observability Incident Contract",
  "local-only",
  "dry-run",
  "pr-ready",
  "release-candidate",
  "production-gated",
  "incident",
  "restore-drill",
  "iac-plan",
  "iac-apply",
  "SLI / SLO Catalog",
  "sev0",
  "secretValueIncluded",
  "node scripts/check-seis-observability-incident-contract.mjs"
]) {
  ensure(runbook.includes(token), `runbook missing ${token}`);
}

for (const token of [
  "seis-observability-incident-contract.json",
  "seis-observability-incident-contract.md"
]) {
  ensure(docsIndex.includes(token), `docs index missing ${token}`);
}


for (const [relativePath, label] of [
  [paths.contract, "observability incident contract"],
  [paths.runbook, "observability incident runbook"],
  [paths.docsIndex, "docs index"]
]) {
  const text = readText(relativePath, label);
  requireNotMatches(text, /\/Users\//, `${label} must not include local user paths`);
  requireNotMatches(text, /Mobile Documents/, `${label} must not include local iCloud paths`);
  requireNotMatches(text, /BEGIN [A-Z ]*PRIVATE KEY/, `${label} must not include private key blocks`);
  requireNotMatches(text, /gh[pousr]_[A-Za-z0-9_]{20,}/, `${label} must not include GitHub token-shaped values`);
  requireNotMatches(text, /AKIA[0-9A-Z]{16}/, `${label} must not include AWS key-shaped values`);
  requireNotMatches(text, /(?:^|[^A-Za-z])sk-(?:proj-|live-|test-|svcacct-|admin-|org-|user-)?[A-Za-z0-9_]{20,}/, `${label} must not include provider key-shaped values`);
}

if (failures.length > 0) {
  console.error("SEIS observability incident contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS observability incident contract check passed.");

function abs(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  if (!Array.isArray(candidate)) return;
  const values = new Set(candidate);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function ensureNonEmptyString(candidate, label) {
  ensure(typeof candidate === "string" && candidate.trim().length > 0, `${label} must be a non-empty string`);
}

function readJson(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function requireNotMatches(text, pattern, message) {
  if (pattern.test(text)) failures.push(message);
}

function ensureNotIgnored(relativePath, label) {
  if (!fs.existsSync(path.join(root, ".git"))) return;
  const result = spawnSync("git", ["check-ignore", "-q", relativePath], { cwd: root });
  if (result.status === 0) failures.push(`${label} must be committable and not ignored`);
}
