#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  protocol: "content/development/seis-agi-evaluation-protocol.json",
  apexProgram: "content/development/seis-512b-apex-model-program.json",
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  policy: "content/development/seis-model-frontier-escalation-policy.json",
  council: "content/development/seis-model-scaling-subagent-council.json",
  publicReadinessEvidence: "content/development/seis-agi-public-readiness-evidence.json",
  githubUserReadinessGates: "content/development/seis-agi-github-user-readiness-gates.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  mcpRuntime: "content/development/seis-ai-core-mcp-runtime-contract.json",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  mcpSmoke: "packages/seis-ai/test/mcp-smoke.test.mjs",
  protocolDoc: "docs/ai/seis-agi-evaluation-protocol.md",
  publicReadinessDoc: "docs/ai/seis-agi-public-readiness-evidence.md",
  scalingDoc: "docs/ai/seis-model-scaling.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  routerDoc: "docs/ai/model-router.md"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const protocol = readJson(paths.protocol, "AGI evaluation protocol");
const apexProgram = readJson(paths.apexProgram, "512B apex model program");
const profile = readJson(paths.profile, "model scaling profile");
const policy = readJson(paths.policy, "frontier escalation policy");
const council = readJson(paths.council, "model scaling council");
const publicReadinessEvidence = readJson(paths.publicReadinessEvidence, "AGI public readiness evidence");
const githubUserReadinessGates = readJson(paths.githubUserReadinessGates, "AGI GitHub user readiness gates");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration");
const mcpRuntime = readJson(paths.mcpRuntime, "MCP runtime contract");

const helper = readText(paths.helper, "AI Core helper");
const mcpServer = readText(paths.mcpServer, "MCP server");
const mcpSmoke = readText(paths.mcpSmoke, "MCP smoke tests");
const protocolDoc = readText(paths.protocolDoc, "AGI evaluation protocol docs");
const publicReadinessDoc = readText(paths.publicReadinessDoc, "AGI public readiness evidence docs");
const scalingDoc = readText(paths.scalingDoc, "model scaling docs");
const aiCoreDoc = readText(paths.aiCoreDoc, "AI Core docs");
const routerDoc = readText(paths.routerDoc, "model router docs");

if (protocol) {
  ensure(protocol.id === "seis-agi-evaluation-protocol", "protocol id mismatch");
  ensure(protocol.status === "protocol-draft-not-run", "protocol must stay protocol-draft-not-run");
  ensure(protocol.resourceUri === "seis://ai/agi-evaluation-protocol.json", "protocol resource URI mismatch");
  ensure(protocol.qualityGate === "node scripts/check-seis-agi-evaluation-protocol.mjs", "protocol quality gate mismatch");
  ensure(protocol.coreCredentialRequirement === "none", "protocol core credential requirement must be none");
  ensure(protocol.defaultRuntimeMode === "seis-local-demo", "protocol default runtime must be seis-local-demo");
  ensure(protocol.routeEligibleToday === false, "protocol must not be route eligible");
  ensure(protocol.runtimeAuthority === false, "protocol must not grant runtime authority");
  ensure(protocol.agiClaimAllowed === false, "protocol must not allow AGI claims");
  ensure(protocol.evaluationRunStatus === "not-run", "protocol evaluationRunStatus must remain not-run");
  ensure(protocol.benchmarkStatus === "not-run", "protocol benchmark status must remain not-run");
  ensure(protocol.trainingStatus === "not-started", "protocol training status must remain not-started");
  ensure(protocol.weightsAvailable === false, "protocol must not mark weights available");
  ensure(protocol.inferenceAvailable === false, "protocol must not mark inference available");
  ensure(protocol.productionReady === false, "protocol must not be production ready");
  ensure(String(protocol.truthBoundary || "").includes("does not prove AGI"), "truth boundary must forbid AGI proof claims");
  ensure(String(protocol.truthBoundary || "").includes("train or download models"), "truth boundary must forbid training and model downloads");
  ensure(String(protocol.truthBoundary || "").includes("run inference"), "truth boundary must forbid inference");
  ensure(String(protocol.truthBoundary || "").includes("provision cloud/GPU"), "truth boundary must forbid cloud/GPU provisioning");

  ensure(protocol.sourceOfTruth?.apexModelProgram === paths.apexProgram, "sourceOfTruth.apexModelProgram mismatch");
  ensure(protocol.sourceOfTruth?.modelScalingProfile === paths.profile, "sourceOfTruth.modelScalingProfile mismatch");
  ensure(protocol.sourceOfTruth?.frontierEscalationPolicy === paths.policy, "sourceOfTruth.frontierEscalationPolicy mismatch");
  ensure(protocol.sourceOfTruth?.modelScalingSubagentCouncil === paths.council, "sourceOfTruth.modelScalingSubagentCouncil mismatch");
  ensure(protocol.sourceOfTruth?.protocolDoc === paths.protocolDoc, "sourceOfTruth.protocolDoc mismatch");
  ensure(protocol.sourceOfTruth?.publicReadinessEvidence === paths.publicReadinessEvidence, "sourceOfTruth.publicReadinessEvidence mismatch");
  ensure(protocol.sourceOfTruth?.publicReadinessDoc === paths.publicReadinessDoc, "sourceOfTruth.publicReadinessDoc mismatch");

  ensure(protocol.publicResearchBaseline?.status === "public-sources-reviewed", "public research baseline status mismatch");
  ensure(protocol.publicResearchBaseline?.updatedAt === "2026-06-29", "public research baseline date mismatch");
  ensureArrayIncludesAll(
    (protocol.publicResearchBaseline?.sources || []).map((source) => source.id),
    [
      "meta-llama-3-1-405b",
      "megatron-turing-nlg-530b",
      "deepseek-v3-671b-moe",
      "qwen3-235b-a22b-instruct",
      "nist-ai-risk-management-framework",
      "anthropic-responsible-scaling-policy",
      "nist-generative-ai-profile-ai-600-1",
      "metr-long-task-horizon-evaluation",
      "google-deepmind-frontier-safety-framework",
      "arc-agi-abstract-reasoning"
    ],
    "publicResearchBaseline.sources"
  );
  for (const source of protocol.publicResearchBaseline?.sources || []) {
    ensureNonEmpty(source.url, `${source.id}.url`);
    ensureNonEmpty(source.evidenceType, `${source.id}.evidenceType`);
    ensureNonEmpty(source.seisImplication, `${source.id}.seisImplication`);
  }

  const sourceDerivedGates = Array.isArray(protocol.sourceDerivedReadinessGates) ? protocol.sourceDerivedReadinessGates : [];
  ensure(sourceDerivedGates.length >= 4, "protocol must define source-derived readiness gates");
  ensureArrayIncludesAll(
    sourceDerivedGates.map((gate) => gate.id),
    [
      "generative-ai-risk-profile-gate",
      "long-task-autonomy-gate",
      "frontier-safety-threshold-gate",
      "abstract-generalization-gate"
    ],
    "sourceDerivedReadinessGates"
  );
  for (const gate of sourceDerivedGates) {
    ensure(gate.status === "not-run", `${gate.id}.status must remain not-run`);
    ensure(Array.isArray(gate.sourceIds) && gate.sourceIds.length >= 1, `${gate.id}.sourceIds must be populated`);
    ensure(Array.isArray(gate.requiredEvidence) && gate.requiredEvidence.length >= 3, `${gate.id}.requiredEvidence must be populated`);
  }

  const dimensions = Array.isArray(protocol.evaluationDimensions) ? protocol.evaluationDimensions : [];
  ensure(dimensions.length >= 11, "protocol must define at least eleven evaluation dimensions");
  ensureArrayIncludesAll(
    dimensions.map((dimension) => dimension.id),
    [
      "multi-domain-reasoning",
      "long-horizon-planning",
      "agentic-autonomy-time-horizon",
      "tool-use-reliability",
      "out-of-distribution-generalization",
      "abstract-skill-acquisition",
      "memory-and-learning-boundary",
      "safety-and-misuse-resistance",
      "frontier-safety-threshold-governance",
      "security-and-data-governance",
      "human-alignment-and-review"
    ],
    "evaluationDimensions"
  );
  for (const dimension of dimensions) {
    ensure(dimension.status === "not-run", `${dimension.id}.status must remain not-run`);
    ensure(Array.isArray(dimension.requiredEvidence) && dimension.requiredEvidence.length >= 3, `${dimension.id}.requiredEvidence must be populated`);
  }

  ensureArrayIncludesAll(protocol.minimumEvidenceBeforeAnyAgiClaim, [
    "20B gate evidence accepted",
    "70B gate evidence accepted",
    "150B gate evidence accepted",
    "300B+ feasibility accepted",
    "512B training or inference evidence independently verified",
    "independent multi-domain capability evaluation passed",
    "long-horizon planning evaluation passed",
    "agentic autonomy time-horizon evaluation passed",
    "tool-use reliability evaluation passed",
    "abstract skill-acquisition evaluation accepted",
    "safety and misuse evaluation accepted",
    "frontier safety threshold review accepted",
    "generative AI risk profile accepted",
    "training logs and checkpoint governance reviewed",
    "external review completed",
    "explicit human approval recorded"
  ], "minimumEvidenceBeforeAnyAgiClaim");

  ensureArrayIncludesAll(protocol.negativeControls, [
    "parameter count alone is not AGI evidence",
    "provider API access is not SEIS-owned AGI",
    "Local Demo behavior is not live model capability",
    "sub-agent council consensus is not benchmark evidence",
    "green CI is not AGI proof"
  ], "negativeControls");

  ensureArrayIncludesAll(protocol.requiredReviewers, [
    "architect-agent",
    "code-agent",
    "research-agent",
    "security-agent",
    "devops-agent",
    "documentation-agent",
    "qa-agent",
    "cloud-agent",
    "automation-agent",
    "human-owner",
    "external-reviewer"
  ], "requiredReviewers");

  ensure(protocol.promotionDecisionModel?.defaultDecision === "blocked", "promotion default decision must be blocked");
  ensure(protocol.promotionDecisionModel?.silentPromotionAllowed === false, "silent promotion must be blocked");
  ensure(protocol.promotionDecisionModel?.selfApprovalAllowed === false, "self approval must be blocked");
  ensure(protocol.promotionDecisionModel?.providerWrapperPromotionAllowed === false, "provider wrapper promotion must be blocked");
  ensure(protocol.promotionDecisionModel?.publicClaimRequiresExternalReview === true, "public AGI claim must require external review");
  ensure(protocol.promotionDecisionModel?.routeEligibilityRequiresHumanApproval === true, "route eligibility must require human approval");

  ensureArrayIncludesAll(protocol.forbiddenClaims, [
    "SEIS has achieved real AGI.",
    "SEIS has proven AGI capability.",
    "SEIS has trained a 512B foundation model.",
    "SEIS has routeable 512B inference.",
    "SEIS can skip 20B, 70B, 150B, or 300B+ evidence.",
    "Installed AI or sub-agents prove AGI."
  ], "forbiddenClaims");
}

ensure(apexProgram?.sourceOfTruth?.agiEvaluationProtocol === paths.protocol, "512B apex program must point to the AGI evaluation protocol");
ensure(apexProgram?.sourceOfTruth?.agiPublicReadinessEvidence === paths.publicReadinessEvidence, "512B apex program must point to AGI public readiness evidence");
ensure(apexProgram?.agiReadinessDefinition?.protocol === paths.protocol, "512B AGI readiness definition must link protocol path");
ensure(apexProgram?.agiReadinessDefinition?.resourceUri === "seis://ai/agi-evaluation-protocol.json", "512B AGI readiness definition must link protocol MCP URI");
ensure(apexProgram?.agiReadinessDefinition?.claimStatus === "real-agi-not-proven", "512B AGI claim status must remain not proven");
ensure(profile?.apexTarget?.agiCapabilityStatus === "not-demonstrated", "model scaling profile must keep AGI capability not-demonstrated");
ensure((policy?.escalationStages || []).some((stage) => stage.id === "stage-4-512b-apex" && stage.routeEligibleToday === false), "frontier policy must keep 512B route blocked");
ensure((council?.stageAssignments || []).some((stage) => stage.stage === "512B" && stage.routeEligibleToday === false), "council must keep 512B stage route blocked");
ensure(publicReadinessEvidence?.status === "blocked-missing-real-agi-evidence", "public readiness evidence must stay blocked");
ensure(publicReadinessEvidence?.agiClaimAllowed === false, "public readiness evidence must block AGI claims");
ensure(publicReadinessEvidence?.publicReadyAsAgi === false, "public readiness evidence must not be public-ready as AGI");
ensure(publicReadinessEvidence?.sourceOfTruth?.githubUserReadinessGates === paths.githubUserReadinessGates, "public readiness evidence must point to GitHub user readiness gates");
ensure(publicReadinessEvidence?.readinessSummary?.minimumClaimEvidenceCount === protocol?.minimumEvidenceBeforeAnyAgiClaim?.length, "public readiness evidence minimum evidence count must match protocol");
ensure((publicReadinessEvidence?.minimumClaimEvidenceMatrix || []).every((item) => item.claimAllowedIfMissing === false && item.routeEligibleIfMissing === false), "public readiness evidence must block missing claim evidence");
ensure(githubUserReadinessGates?.status === "review-gated-local-demo-ready", "GitHub user readiness gates must remain review-gated Local Demo ready");
ensure(githubUserReadinessGates?.githubReadyForEveryone === false, "GitHub user readiness gates must not mark everyone-ready");
ensure(githubUserReadinessGates?.publicReadyForLocalDemo === true, "GitHub user readiness gates must allow Local Demo review");
ensure(githubUserReadinessGates?.agiClaimAllowed === false, "GitHub user readiness gates must block AGI claims");

ensureArrayIncludesAll(pluginIntegration?.runtimeIntegration?.mcpResources, [
  "seis://ai/agi-evaluation-protocol.json",
  "seis://ai/agi-public-readiness-evidence.json",
  "seis://ai/agi-github-user-readiness-gates.json"
], "pluginIntegration.runtimeIntegration.mcpResources");
ensureArrayIncludesAll(pluginIntegration?.qualityCommands, ["node scripts/check-seis-agi-evaluation-protocol.mjs"], "pluginIntegration.qualityCommands");
ensure(mcpRuntime?.resourceCount === 29, "MCP runtime contract must record 29 resources");

for (const [text, label] of [
  [helper, "AI Core helper"],
  [mcpServer, "MCP server"],
  [mcpSmoke, "MCP smoke tests"],
  [protocolDoc, "AGI evaluation docs"],
  [publicReadinessDoc, "AGI public readiness evidence docs"],
  [scalingDoc, "model scaling docs"],
  [aiCoreDoc, "AI Core docs"],
  [routerDoc, "model router docs"]
]) {
  ensure(text.includes("seis-agi-evaluation-protocol"), `${label} must reference the AGI evaluation protocol id/path`);
  ensure(text.includes("seis://ai/agi-evaluation-protocol.json"), `${label} must reference the AGI evaluation protocol MCP URI`);
}

for (const [text, label] of [
  [helper, "AI Core helper"],
  [mcpServer, "MCP server"],
  [mcpSmoke, "MCP smoke tests"],
  [publicReadinessDoc, "AGI public readiness evidence docs"]
]) {
  ensure(text.includes("seis-agi-public-readiness-evidence"), `${label} must reference AGI public readiness evidence`);
  ensure(text.includes("seis://ai/agi-public-readiness-evidence.json"), `${label} must reference the AGI public readiness evidence MCP URI`);
}

finish("SEIS AGI evaluation protocol check passed.");

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
    console.error("SEIS AGI evaluation protocol check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}
