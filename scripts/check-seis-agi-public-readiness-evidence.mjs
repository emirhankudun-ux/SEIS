#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  evidence: "content/development/seis-agi-public-readiness-evidence.json",
  protocol: "content/development/seis-agi-evaluation-protocol.json",
  apexProgram: "content/development/seis-512b-apex-model-program.json",
  modelScalingProfile: "content/development/seis-model-scaling-hardware-profile.json",
  council: "content/development/seis-model-scaling-subagent-council.json",
  doc: "docs/ai/seis-agi-public-readiness-evidence.md",
  protocolDoc: "docs/ai/seis-agi-evaluation-protocol.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  modelRouterDoc: "docs/ai/model-router.md"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const evidence = readJson(paths.evidence, "AGI public readiness evidence");
const protocol = readJson(paths.protocol, "AGI evaluation protocol");
const apexProgram = readJson(paths.apexProgram, "512B apex model program");
const profile = readJson(paths.modelScalingProfile, "model scaling profile");
const council = readJson(paths.council, "model scaling council");
const doc = readText(paths.doc, "AGI public readiness evidence docs");
const protocolDoc = readText(paths.protocolDoc, "AGI evaluation protocol docs");
const aiCoreDoc = readText(paths.aiCoreDoc, "AI Core docs");
const modelRouterDoc = readText(paths.modelRouterDoc, "model router docs");

if (evidence) {
  ensure(evidence.id === "seis-agi-public-readiness-evidence", "evidence id mismatch");
  ensure(evidence.status === "blocked-missing-real-agi-evidence", "evidence status must stay blocked");
  ensure(evidence.resourceUri === "seis://ai/agi-public-readiness-evidence.json", "resource URI mismatch");
  ensure(evidence.qualityGate === "node scripts/check-seis-agi-public-readiness-evidence.mjs", "qualityGate mismatch");
  ensure(evidence.coreCredentialRequirement === "none", "core credential requirement must stay none");
  ensure(evidence.defaultRuntimeMode === "seis-local-demo", "default runtime must be seis-local-demo");
  ensure(evidence.routeEligibleToday === false, "evidence must not be route eligible");
  ensure(evidence.runtimeAuthority === false, "evidence must not grant runtime authority");
  ensure(evidence.agiClaimAllowed === false, "AGI claim must remain blocked");
  ensure(evidence.publicReadyAsAgi === false, "publicReadyAsAgi must remain false");
  ensure(evidence.publicReadyAsLocalDemo === true, "publicReadyAsLocalDemo must remain true");
  ensure(evidence.claimDecision === "not-ready-for-agi-or-512b-public-claim", "claim decision mismatch");
  ensure(String(evidence.truthBoundary || "").includes("does not run evaluations"), "truth boundary must forbid evaluation run claims");
  ensure(String(evidence.truthBoundary || "").includes("train or download models"), "truth boundary must forbid training/download claims");
  ensure(String(evidence.truthBoundary || "").includes("run inference"), "truth boundary must forbid inference claims");
  ensure(String(evidence.truthBoundary || "").includes("provision GPU/cloud"), "truth boundary must forbid GPU/cloud claims");

  ensure(evidence.sourceOfTruth?.agiEvaluationProtocol === paths.protocol, "sourceOfTruth.agiEvaluationProtocol mismatch");
  ensure(evidence.sourceOfTruth?.apexModelProgram === paths.apexProgram, "sourceOfTruth.apexModelProgram mismatch");
  ensure(evidence.sourceOfTruth?.modelScalingProfile === paths.modelScalingProfile, "sourceOfTruth.modelScalingProfile mismatch");
  ensure(evidence.sourceOfTruth?.modelScalingCouncil === paths.council, "sourceOfTruth.modelScalingCouncil mismatch");
  ensure(evidence.sourceOfTruth?.publicReadinessDoc === paths.doc, "sourceOfTruth.publicReadinessDoc mismatch");

  ensure(evidence.readinessSummary?.protocolStatus === "protocol-draft-not-run", "protocolStatus mismatch");
  ensure(evidence.readinessSummary?.apexProgramStatus === "apex-program-plan-only", "apexProgramStatus mismatch");
  ensure(evidence.readinessSummary?.acceptedClaimEvidenceCount === 0, "accepted claim evidence count must remain zero");
  ensure(String(evidence.readinessSummary?.allowedPublicUse || "").includes("Local Demo"), "allowed public use must be scoped to Local Demo");

  const sourceGateMatrix = Array.isArray(evidence.sourceDerivedGateMatrix) ? evidence.sourceDerivedGateMatrix : [];
  const claimMatrix = Array.isArray(evidence.minimumClaimEvidenceMatrix) ? evidence.minimumClaimEvidenceMatrix : [];

  ensure(sourceGateMatrix.length === (protocol?.sourceDerivedReadinessGates || []).length, "source-derived gate count must match protocol");
  ensure(evidence.readinessSummary?.sourceDerivedGateCount === sourceGateMatrix.length, "sourceDerivedGateCount must match matrix length");
  ensure(evidence.readinessSummary?.evaluationDimensionCount === (protocol?.evaluationDimensions || []).length, "evaluationDimensionCount must match protocol");
  ensure(evidence.readinessSummary?.minimumClaimEvidenceCount === (protocol?.minimumEvidenceBeforeAnyAgiClaim || []).length, "minimumClaimEvidenceCount must match protocol");
  ensure(evidence.readinessSummary?.missingClaimEvidenceCount === claimMatrix.length, "missingClaimEvidenceCount must match matrix length");

  ensureArrayIncludesAll(
    sourceGateMatrix.map((gate) => gate.gateId),
    (protocol?.sourceDerivedReadinessGates || []).map((gate) => gate.id),
    "sourceDerivedGateMatrix.gateId"
  );
  for (const gate of sourceGateMatrix) {
    ensure(gate.status === "not-run", `${gate.gateId}.status must stay not-run`);
    ensure(gate.evidenceStatus === "missing", `${gate.gateId}.evidenceStatus must stay missing`);
    ensure(gate.requiredBeforePublicClaim === true, `${gate.gateId}.requiredBeforePublicClaim must be true`);
    ensureNonEmpty(gate.blockingReason, `${gate.gateId}.blockingReason`);
  }

  ensureArrayIncludesAll(
    claimMatrix.map((item) => item.requirement),
    protocol?.minimumEvidenceBeforeAnyAgiClaim || [],
    "minimumClaimEvidenceMatrix.requirement"
  );
  ensureArrayIncludesAll(
    protocol?.minimumEvidenceBeforeAnyAgiClaim || [],
    claimMatrix.map((item) => item.requirement),
    "protocol.minimumEvidenceBeforeAnyAgiClaim coverage"
  );

  for (const item of claimMatrix) {
    ensure(["missing", "not-run"].includes(item.status), `${item.id}.status must remain missing or not-run`);
    ensureNonEmpty(item.currentEvidence, `${item.id}.currentEvidence`);
    ensure(Array.isArray(item.requiredEvidence) && item.requiredEvidence.length >= 3, `${item.id}.requiredEvidence must be populated`);
    ensure(Array.isArray(item.ownerAgents) && item.ownerAgents.length >= 1, `${item.id}.ownerAgents must be populated`);
    ensure(item.routeEligibleIfMissing === false, `${item.id}.routeEligibleIfMissing must be false`);
    ensure(item.claimAllowedIfMissing === false, `${item.id}.claimAllowedIfMissing must be false`);
  }

  ensure(claimMatrix.some((item) => item.requirement === "explicit human approval recorded" && item.ownerAgents.includes("human-owner")), "matrix must keep explicit human approval owned by human-owner");
  ensure(claimMatrix.some((item) => item.requirement === "external review completed" && item.ownerAgents.includes("external-reviewer")), "matrix must require external reviewer for external review");
  ensure(claimMatrix.some((item) => item.requirement === "512B training or inference evidence independently verified" && item.status === "missing"), "matrix must keep 512B evidence missing");

  ensureArrayIncludesAll(evidence.forbiddenGreenlights, [
    "Passing CI alone cannot make SEIS AGI-ready.",
    "Passing CodeQL cannot prove AGI, 512B training, route eligibility, or benchmark success.",
    "A Local Demo, provider wrapper, RAG route, or prompt profile cannot satisfy 512B model evidence.",
    "Installed AI or sub-agent consensus cannot replace external review and human approval."
  ], "forbiddenGreenlights");
}

ensure(protocol?.status === "protocol-draft-not-run", "protocol must stay draft-not-run");
ensure(protocol?.agiClaimAllowed === false, "protocol must not allow AGI claims");
ensure(protocol?.routeEligibleToday === false, "protocol must not be route eligible");
ensure(apexProgram?.status === "apex-program-plan-only", "apex program must stay plan-only");
ensure(apexProgram?.routeEligibleToday === false, "apex program must not be route eligible");
ensure(profile?.apexTarget?.agiCapabilityStatus === "not-demonstrated", "profile must keep AGI capability not-demonstrated");
ensure((council?.stageAssignments || []).some((stage) => stage.stage === "512B" && stage.routeEligibleToday === false), "council must keep 512B route blocked");

for (const [text, label] of [
  [doc, "public readiness docs"],
  [protocolDoc, "AGI protocol docs"],
  [aiCoreDoc, "AI Core docs"],
  [modelRouterDoc, "model router docs"]
]) {
  ensure(text.includes("seis-agi-evaluation-protocol"), `${label} must reference AGI evaluation protocol`);
}

ensure(doc.includes("blocked-missing-real-agi-evidence"), "public readiness docs must state blocked status");
ensure(doc.includes("seis://ai/agi-public-readiness-evidence.json"), "public readiness docs must include MCP resource URI");
ensure(doc.includes("node scripts/check-seis-agi-public-readiness-evidence.mjs"), "public readiness docs must include validation command");

finish("SEIS AGI public readiness evidence check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!relativePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) failures.push(`${label} missing: ${relativePath}`);
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
  if (failures.length) {
    console.error("SEIS AGI public readiness evidence check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}
