#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  ledger: "content/development/seis-agi-independent-evidence-ledger.json",
  githubUserReadinessGates: "content/development/seis-agi-github-user-readiness-gates.json",
  publicReadinessEvidence: "content/development/seis-agi-public-readiness-evidence.json",
  agiEvaluationProtocol: "content/development/seis-agi-evaluation-protocol.json",
  status: "docs/STATUS.md",
  queue: "docs/roadmap/NEXT_PR_QUEUE.md",
  agiGithubDoc: "docs/ai/seis-agi-github-user-readiness-gates.md",
  agiPublicDoc: "docs/ai/seis-agi-public-readiness-evidence.md"
};

const requiredGateIds = [
  "zero-key-local-demo",
  "mcp-resource-contract",
  "claim-boundary",
  "fresh-clone-user-path",
  "independent-agi-evaluations",
  "512b-training-inference-evidence",
  "public-release-approval"
];

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(relativePath, label);
}

const ledger = readJson(paths.ledger, "AGI independent evidence ledger");
const githubUserReadinessGates = readJson(paths.githubUserReadinessGates, "AGI GitHub user readiness gates");
const publicReadinessEvidence = readJson(paths.publicReadinessEvidence, "AGI public readiness evidence");
const protocol = readJson(paths.agiEvaluationProtocol, "AGI evaluation protocol");

const status = readText(paths.status, "STATUS");
const queue = readText(paths.queue, "next PR queue");
const githubDoc = readText(paths.agiGithubDoc, "AGI GitHub user readiness docs");
const publicDoc = readText(paths.agiPublicDoc, "AGI public readiness docs");

if (ledger) {
  ensure(ledger.id === "seis-agi-independent-evidence-ledger", "ledger id mismatch");
  ensure(ledger.version === "2026.06.29", "ledger version must remain 2026.06.29");
  ensure(ledger.status === "planned-without-independent-evidence", "ledger status must remain planned without independent evidence");
  ensure(Array.isArray(ledger.readinessChecks?.gateIds) && ledger.readinessChecks.gateIds.length >= 7, "readinessChecks.gateIds must include all required gates");
  ensureArrayIncludesAll(ledger.readinessChecks.gateIds, requiredGateIds, "readinessChecks.gateIds");
  ensure(ledger.routeEligibleToday === false, "ledger must block route eligibility");
  ensure(ledger.runtimeAuthority === false, "ledger must not grant runtime authority");
  ensure(ledger.agiClaimAllowed === false, "ledger must block AGI claims");
  ensure(ledger.publicReadyAsAgi === false, "ledger must not be public-ready as AGI");
  ensure(ledger.publicReadyForLocalDemo === true, "ledger must allow Local Demo as the public working boundary");
  ensure(ledger.githubReadyForEveryone === false, "ledger must keep GitHub ready false");

  ensure(ledger.sourceOfTruth === paths.publicReadinessEvidence, "sourceOfTruth must point to the public readiness evidence file");
  ensure(ledger.targetCapability.includes("AGI"), "targetCapability should mention AGI readiness");
  ensure(String(ledger.truthBoundary || "").includes("does not prove AGI"), "truthBoundary must block AGI proof claims");
  ensure(String(ledger.truthBoundary || "").includes("does not authorize"), "truthBoundary must include authorization limit");
  ensure(String(ledger.truthBoundary || "").includes("downloads"), "truthBoundary must forbid internet download claims");

  ensure((ledger.researchBaseline || []).length >= 4, "researchBaseline must include baseline sources");
  ensureArrayIncludesAll(
    (ledger.researchBaseline || []).map((entry) => entry.id),
    ["nist-ai-rmf", "nist-ai-600-1", "arc-agi", "metr-long-task-evaluations"],
    "researchBaseline"
  );
  for (const source of ledger.researchBaseline || []) {
    ensureNonEmpty(source.source, `${source.id || "research source"}.source`);
    ensureNonEmpty(source.url, `${source.id || "research source"}.url`);
  }

  ensure(Array.isArray(ledger.pendingExternalInquiries), "pendingExternalInquiries must be an array");
  ensure(ledger.pendingExternalInquiries.length >= 3, "pendingExternalInquiries must include required independent evidence requests");
  for (const inquiry of ledger.pendingExternalInquiries) {
    ensureNonEmpty(inquiry.id, `${inquiry.id || "inquiry"}.id`);
    ensure(inquiry.status === "missing", `${inquiry.id}.status must remain missing`);
    ensure(inquiry.requiredBeforePublicClaim === true, `${inquiry.id}.requiredBeforePublicClaim must be true`);
    ensure(Array.isArray(inquiry.ownerAgents) && inquiry.ownerAgents.length >= 2, `${inquiry.id}.ownerAgents must be populated`);
    ensure(Array.isArray(inquiry.requiredEvidence) && inquiry.requiredEvidence.length >= 4, `${inquiry.id}.requiredEvidence must be populated`);
  }

  const requiredArtifacts = ledger.readinessChecks?.requiredArtifacts || [];
  ensure(Array.isArray(requiredArtifacts) && requiredArtifacts.length >= 7, "readinessChecks.requiredArtifacts must include required AGI artifacts");
  for (const artifact of requiredArtifacts) ensureFile(artifact, `required artifact ${artifact}`);

  ensure(Array.isArray(ledger.humanApprovalNeeded?.gates), "humanApprovalNeeded.gates must be an array");
  ensureArrayIncludesAll(ledger.humanApprovalNeeded?.gates || [], ["human-owner", "security-agent", "devops-agent"], "humanApprovalNeeded.gates");
  ensure(ledger.humanApprovalNeeded?.decision === "not-recorded", "humanApprovalNeeded.decision should remain not-recorded");
  ensure(Array.isArray(ledger.nextSafeActions) && ledger.nextSafeActions.length >= 3, "nextSafeActions must be populated");
  ensureArrayIncludesAll(ledger.forbiddenClaims, [
    "SEIS has achieved real AGI.",
    "SEIS has trained a 512B foundation model.",
    "GitHub users can run routeable 512B inference today.",
    "CI or check scripts alone prove AGI.",
    "Installed sub-agents prove AGI."
  ], "forbiddenClaims");
}

if (githubUserReadinessGates) {
  ensure(githubUserReadinessGates.id === "seis-agi-github-user-readiness-gates", "GitHub user readiness gates id mismatch");
  ensure(Array.isArray(githubUserReadinessGates.readinessGates), "GitHub user readiness gates must expose readinessGates");
  for (const requiredId of requiredGateIds) {
    ensure(githubUserReadinessGates.readinessGates.some((gate) => gate.id === requiredId), `GitHub user readiness gates must include ${requiredId}`);
  }
}

if (publicReadinessEvidence) {
  ensure(publicReadinessEvidence.id === "seis-agi-public-readiness-evidence", "public readiness evidence id mismatch");
  ensure(publicReadinessEvidence.status === "blocked-missing-real-agi-evidence", "public readiness evidence must remain blocked");
  ensure(publicReadinessEvidence.agiClaimAllowed === false, "public readiness evidence must block AGI claims");
  ensure(publicReadinessEvidence.publicReadyAsAgi === false, "public readiness evidence must not be public-ready as AGI");
}

if (protocol) {
  ensure(protocol.id === "seis-agi-evaluation-protocol", "protocol id mismatch");
  ensure(protocol.protocolStatus === undefined || protocol.status === "protocol-draft-not-run", "protocol must remain draft status");
  ensure(protocol.routeEligibleToday === false, "protocol must stay route ineligible");
  ensure(protocol.agiClaimAllowed === false, "protocol must block AGI claims");
}

if (status) {
  ensure(status.includes("AGI") || status.includes("512B"), "STATUS should document AGI/512B readiness posture");
}
if (queue) {
  ensure(queue.includes("PR 4G") || queue.includes("AGI GitHub readiness gates"), "NEXT_PR_QUEUE should retain prior AGI gate PR entry");
}
if (githubDoc) {
  ensure(githubDoc.includes("seis-agi-github-user-readiness-gates"), "AGI GitHub user docs should be present");
  ensure(githubDoc.includes("blocked"), "AGI GitHub user docs must state claim blocking");
}
if (publicDoc) {
  ensure(publicDoc.includes("blocked-missing-real-agi-evidence"), "AGI public readiness docs should show blocked status");
  ensure(publicDoc.includes("external review"), "AGI public readiness docs should require external review");
}

finish("SEIS AGI independent evidence ledger check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!relativePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    failures.push(`${label} missing: ${relativePath}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function ensureNonEmpty(value, label) {
  ensure(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} unreadable: ${error.message}`);
    return "";
  }
}

function finish(message) {
  if (failures.length > 0) {
    console.error("SEIS AGI independent evidence ledger check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}
