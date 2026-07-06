#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  program: "content/development/seis-512b-apex-model-program.json",
  agiEvaluationProtocol: "content/development/seis-agi-evaluation-protocol.json",
  agiPublicReadinessEvidence: "content/development/seis-agi-public-readiness-evidence.json",
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  ladder: "content/development/seis-model-parameter-ladder.json",
  policy: "content/development/seis-model-frontier-escalation-policy.json",
  council: "content/development/seis-model-scaling-subagent-council.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  mcpRuntime: "content/development/seis-ai-core-mcp-runtime-contract.json",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  mcpSmoke: "packages/seis-ai/test/mcp-smoke.test.mjs",
  agentTest: "packages/seis-ai/test/agent.test.mjs",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  scalingDoc: "docs/ai/seis-model-scaling.md",
  routerDoc: "docs/ai/model-router.md",
  statusDoc: "docs/STATUS.md",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const program = readJson(paths.program, "512B apex model program");
const agiEvaluationProtocol = readJson(paths.agiEvaluationProtocol, "AGI evaluation protocol");
const agiPublicReadinessEvidence = readJson(paths.agiPublicReadinessEvidence, "AGI public readiness evidence");
const profile = readJson(paths.profile, "model scaling profile");
const ladder = readJson(paths.ladder, "parameter ladder");
const policy = readJson(paths.policy, "frontier escalation policy");
const council = readJson(paths.council, "model scaling council");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration");
const mcpRuntime = readJson(paths.mcpRuntime, "MCP runtime contract");
const packageJson = readJson(paths.packageJson, "package.json");

const helper = readText(paths.helper, "AI Core helper");
const mcpServer = readText(paths.mcpServer, "MCP server");
const mcpSmoke = readText(paths.mcpSmoke, "MCP smoke tests");
const agentTest = readText(paths.agentTest, "agent tests");
const aiCoreDoc = readText(paths.aiCoreDoc, "AI Core docs");
const scalingDoc = readText(paths.scalingDoc, "model scaling docs");
const routerDoc = readText(paths.routerDoc, "model router docs");
const statusDoc = readText(paths.statusDoc, "status docs");

if (program) {
  ensure(program.id === "seis-512b-apex-model-program", "program id mismatch");
  ensure(program.status === "apex-program-plan-only", "program must stay apex-program-plan-only");
  ensure(program.resourceUri === "seis://ai/512b-apex-model-program.json", "program MCP resource URI mismatch");
  ensure(program.qualityGate === "npm run check:seis-512b-apex-model-program", "program quality gate mismatch");
  ensure(program.routeEligibleToday === false, "program must not be route eligible");
  ensure(program.runtimeAuthority === false, "program must not grant runtime authority");
  ensure(program.trainingStatus === "not-started", "program training must remain not-started");
  ensure(program.weightsAvailable === false, "program must not mark weights available");
  ensure(program.inferenceAvailable === false, "program must not mark inference available");
  ensure(program.benchmarkStatus === "not-run", "program benchmark must remain not-run");
  ensure(program.productionReady === false, "program must not be production ready");
  ensure(program.target?.parameterClass === "512B", "target parameterClass must be 512B");
  ensure(program.target?.parameterCountBillion === 512, "target parameter count must be 512");
  ensure(String(program.truthBoundary || "").includes("does not download models"), "truth boundary must forbid model downloads");
  ensure(String(program.truthBoundary || "").includes("train"), "truth boundary must forbid training");
  ensure(String(program.truthBoundary || "").includes("run inference"), "truth boundary must forbid inference");
  ensure(String(program.truthBoundary || "").includes("claim SEIS owns"), "truth boundary must forbid ownership claims");
  ensureArrayIncludesAll(program.sourceOfTruth ? Object.values(program.sourceOfTruth) : [], [
    paths.profile,
    paths.ladder,
    paths.policy,
    "content/development/seis-150b-frontier-model-program.json",
    paths.council,
    paths.agiEvaluationProtocol,
    paths.agiPublicReadinessEvidence
  ], "program.sourceOfTruth values");
  ensure((program.programStages || []).length === 7, "program must expose seven 512B stages");
  ensure((program.programStages || []).every((stage) => stage.routeEligibleToday === false), "all 512B stages must be route-ineligible");
  ensure(program.internetResearchBaseline?.status === "current-public-evidence-reviewed", "program must include current public internet research baseline");
  ensure(program.internetResearchBaseline?.updatedAt === "2026-06-29", "internet research baseline date mismatch");
  ensureArrayIncludesAll(
    (program.internetResearchBaseline?.sources || []).map((source) => source.id),
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
    "program.internetResearchBaseline.sources"
  );
  for (const source of program.internetResearchBaseline?.sources || []) {
    ensureNonEmpty(source.url, `${source.id}.url`);
    ensureNonEmpty(source.evidenceType, `${source.id}.evidenceType`);
    ensureNonEmpty(source.seisImplication, `${source.id}.seisImplication`);
  }
  ensure(program.agiReadinessDefinition?.status === "definition-only-not-demonstrated", "AGI readiness definition must stay not demonstrated");
  ensure(program.agiReadinessDefinition?.claimStatus === "real-agi-not-proven", "AGI claim status must remain not proven");
  ensure(program.agiReadinessDefinition?.protocol === paths.agiEvaluationProtocol, "AGI readiness definition must link the AGI evaluation protocol");
  ensure(program.agiReadinessDefinition?.resourceUri === "seis://ai/agi-evaluation-protocol.json", "AGI readiness definition must link the AGI evaluation protocol MCP resource");
  ensureArrayIncludesAll(program.agiReadinessDefinition?.minimumEvidenceBeforeAnyAgiClaim, [
    "independent multi-domain capability evaluation",
    "long-horizon planning evaluation",
    "agentic autonomy time-horizon evaluation",
    "abstract skill-acquisition evaluation",
    "frontier safety threshold review",
    "generative AI risk profile",
    "safety and misuse evaluation",
    "training logs and checkpoint governance",
    "human approval and external review"
  ], "program.agiReadinessDefinition.minimumEvidenceBeforeAnyAgiClaim");
  ensureArrayIncludesAll(program.agiReadinessDefinition?.requiredNegativeControls, [
    "prompt/RAG/provider wrapper is not AGI",
    "parameter count alone is not AGI evidence",
    "installed AI presence is not training evidence",
    "sub-agent council approval is not runtime authority",
    "Local Demo behavior is not live model capability"
  ], "program.agiReadinessDefinition.requiredNegativeControls");
  ensureArrayIncludesAll(
    (program.githubPublicReadinessGates || []).map((gate) => gate.id),
    ["open-source-contract", "reproducible-local-demo", "frontier-non-claim-guard", "ci-and-release-safety"],
    "program.githubPublicReadinessGates"
  );
  for (const gate of program.githubPublicReadinessGates || []) {
    ensure(gate.status === "required-before-public-readiness", `${gate.id}.status must stay required-before-public-readiness`);
    ensure(Array.isArray(gate.requiredEvidence) && gate.requiredEvidence.length >= 4, `${gate.id}.requiredEvidence must be populated`);
  }
  ensureArrayIncludesAll(program.agentCouncil?.leadAgents, [
    "architect-agent",
    "code-agent",
    "design-agent",
    "ui-ux-agent",
    "research-agent",
    "search-agent",
    "security-agent",
    "devops-agent",
    "documentation-agent",
    "qa-agent",
    "cloud-agent",
    "automation-agent"
  ], "program.agentCouncil.leadAgents");
  ensureArrayIncludesAll(program.promotionGates, [
    "20B evidence accepted",
    "70B evidence accepted",
    "150B evidence accepted",
    "300B+ feasibility accepted",
    "AGI evaluation protocol accepted",
    "generative AI risk profile accepted",
    "agentic autonomy time-horizon evidence accepted",
    "frontier safety threshold review accepted",
    "abstract generalization evidence accepted",
    "all installed AI and sub-agent council review recorded",
    "explicit human approval recorded"
  ], "program.promotionGates");
  ensureArrayIncludesAll(program.forbiddenClaimRules, [
    "no-trained-512b-weights-claim",
    "no-routeable-512b-inference-claim",
    "no-512b-benchmark-claim",
    "no-installed-ai-presence-as-training-evidence-claim"
  ], "program.forbiddenClaimRules");
}

if (agiEvaluationProtocol) {
  ensure(agiEvaluationProtocol.id === "seis-agi-evaluation-protocol", "AGI evaluation protocol id mismatch");
  ensure(agiEvaluationProtocol.status === "protocol-draft-not-run", "AGI evaluation protocol must stay protocol-draft-not-run");
  ensure(agiEvaluationProtocol.resourceUri === "seis://ai/agi-evaluation-protocol.json", "AGI evaluation protocol resource URI mismatch");
  ensure(agiEvaluationProtocol.agiClaimAllowed === false, "AGI evaluation protocol must not allow AGI claims");
  ensure(agiEvaluationProtocol.routeEligibleToday === false, "AGI evaluation protocol must not be route eligible");
  ensure(agiEvaluationProtocol.runtimeAuthority === false, "AGI evaluation protocol must not grant runtime authority");
  ensure(agiEvaluationProtocol.evaluationRunStatus === "not-run", "AGI evaluation protocol must not claim an evaluation run");
  ensure((agiEvaluationProtocol.evaluationDimensions || []).length >= 11, "AGI evaluation protocol must define at least eleven evaluation dimensions");
  ensureArrayIncludesAll(
    (agiEvaluationProtocol.publicResearchBaseline?.sources || []).map((source) => source.id),
    [
      "nist-generative-ai-profile-ai-600-1",
      "metr-long-task-horizon-evaluation",
      "google-deepmind-frontier-safety-framework",
      "arc-agi-abstract-reasoning"
    ],
    "AGI evaluation protocol publicResearchBaseline.sources"
  );
  ensureArrayIncludesAll(
    (agiEvaluationProtocol.sourceDerivedReadinessGates || []).map((gate) => gate.id),
    [
      "generative-ai-risk-profile-gate",
      "long-task-autonomy-gate",
      "frontier-safety-threshold-gate",
      "abstract-generalization-gate"
    ],
    "AGI evaluation protocol sourceDerivedReadinessGates"
  );
  ensureArrayIncludesAll(agiEvaluationProtocol.minimumEvidenceBeforeAnyAgiClaim, [
    "20B gate evidence accepted",
    "70B gate evidence accepted",
    "150B gate evidence accepted",
    "300B+ feasibility accepted",
    "512B training or inference evidence independently verified",
    "agentic autonomy time-horizon evaluation passed",
    "abstract skill-acquisition evaluation accepted",
    "frontier safety threshold review accepted",
    "generative AI risk profile accepted",
    "external review completed",
    "explicit human approval recorded"
  ], "AGI evaluation protocol minimumEvidenceBeforeAnyAgiClaim");
  ensureArrayIncludesAll(agiEvaluationProtocol.negativeControls, [
    "parameter count alone is not AGI evidence",
    "Local Demo behavior is not live model capability",
    "green CI is not AGI proof"
  ], "AGI evaluation protocol negativeControls");
}

if (agiPublicReadinessEvidence) {
  ensure(agiPublicReadinessEvidence.id === "seis-agi-public-readiness-evidence", "AGI public readiness evidence id mismatch");
  ensure(agiPublicReadinessEvidence.status === "blocked-missing-real-agi-evidence", "AGI public readiness evidence must stay blocked");
  ensure(agiPublicReadinessEvidence.qualityGate === "node scripts/check-seis-agi-public-readiness-evidence.mjs", "AGI public readiness evidence quality gate mismatch");
  ensure(agiPublicReadinessEvidence.routeEligibleToday === false, "AGI public readiness evidence must not be route eligible");
  ensure(agiPublicReadinessEvidence.runtimeAuthority === false, "AGI public readiness evidence must not grant runtime authority");
  ensure(agiPublicReadinessEvidence.agiClaimAllowed === false, "AGI public readiness evidence must block AGI claims");
  ensure(agiPublicReadinessEvidence.publicReadyAsAgi === false, "AGI public readiness evidence must not be public-ready as AGI");
  ensure(agiPublicReadinessEvidence.publicReadyAsLocalDemo === true, "AGI public readiness evidence must allow Local Demo public use");
  ensure(agiPublicReadinessEvidence.readinessSummary?.minimumClaimEvidenceCount === (agiEvaluationProtocol?.minimumEvidenceBeforeAnyAgiClaim || []).length, "AGI public readiness evidence minimum count must match protocol");
  ensure(agiPublicReadinessEvidence.readinessSummary?.acceptedClaimEvidenceCount === 0, "AGI public readiness evidence accepted count must be zero");
  ensureArrayIncludesAll(
    (agiPublicReadinessEvidence.sourceDerivedGateMatrix || []).map((gate) => gate.gateId),
    (agiEvaluationProtocol?.sourceDerivedReadinessGates || []).map((gate) => gate.id),
    "AGI public readiness evidence sourceDerivedGateMatrix"
  );
  ensureArrayIncludesAll(
    (agiPublicReadinessEvidence.minimumClaimEvidenceMatrix || []).map((item) => item.requirement),
    agiEvaluationProtocol?.minimumEvidenceBeforeAnyAgiClaim || [],
    "AGI public readiness evidence minimumClaimEvidenceMatrix"
  );
}

ensure(profile?.sourceOfTruth?.apexModelProgram === paths.program, "profile must point to 512B apex model program");
ensure((profile?.scaleLadder || []).some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"), "profile scale ladder must include 512B plan-only target");
ensure((profile?.creationStages || []).some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"), "profile creation stages must include 512B plan-only target");

ensure((ladder?.promotionOrder || []).includes("512B"), "parameter ladder promotionOrder must include 512B");
ensure((ladder?.targets || []).some((target) => target.parameterClass === "512B" && target.parameterCountBillion === 512 && target.routeEligibleToday === false), "parameter ladder must keep 512B route-ineligible");

ensure(policy?.sourceOfTruth?.apexModelProgram === paths.program, "frontier policy must point to 512B apex model program");
ensure((policy?.escalationStages || []).some((stage) => stage.id === "stage-4-512b-apex" && stage.parameterClass === "512B" && stage.routeEligibleToday === false), "frontier policy must include blocked 512B apex stage");

ensure(council?.sourceOfTruth?.apexModelProgram === paths.program, "council must point to 512B apex model program");
ensure((council?.stageAssignments || []).some((stage) => stage.stage === "512B" && stage.routeEligibleToday === false && (stage.leadAgents || []).length === 12), "council must assign all 12 agents to 512B plan-only stage");
ensureArrayIncludesAll(
  (council?.apex512bCouncilDuties || []).map((entry) => entry.agentId),
  program?.agentCouncil?.leadAgents || [],
  "council.apex512bCouncilDuties"
);
for (const duty of council?.apex512bCouncilDuties || []) {
  ensureNonEmpty(duty.duty, `${duty.agentId}.apex512b duty`);
  ensure(Array.isArray(duty.evidence) && duty.evidence.length >= 3, `${duty.agentId}.apex512b evidence must be populated`);
}

ensureArrayIncludesAll(pluginIntegration?.runtimeIntegration?.mcpResources, ["seis://ai/512b-apex-model-program.json"], "pluginIntegration.runtimeIntegration.mcpResources");
ensureArrayIncludesAll(pluginIntegration?.runtimeIntegration?.mcpResources, ["seis://ai/agi-evaluation-protocol.json"], "pluginIntegration.runtimeIntegration.mcpResources");
ensureArrayIncludesAll(pluginIntegration?.runtimeIntegration?.mcpResources, ["seis://ai/agi-public-readiness-evidence.json"], "pluginIntegration.runtimeIntegration.mcpResources");
ensureArrayIncludesAll(pluginIntegration?.qualityCommands, ["npm run check:seis-512b-apex-model-program"], "pluginIntegration.qualityCommands");
ensureArrayIncludesAll(pluginIntegration?.qualityCommands, ["node scripts/check-seis-agi-evaluation-protocol.mjs"], "pluginIntegration.qualityCommands");
ensure(mcpRuntime?.resourceCount === 32, "MCP runtime contract must record 32 resources");

if (packageJson) {
  ensure(packageJson.scripts?.["check:seis-512b-apex-model-program"] === "node scripts/check-seis-512b-apex-model-program.mjs", "package.json must expose check:seis-512b-apex-model-program");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-512b-apex-model-program"), "quality:governance must include check:seis-512b-apex-model-program");
}

for (const [text, label] of [
  [helper, "AI Core helper"],
  [mcpServer, "MCP server"],
  [mcpSmoke, "MCP smoke tests"],
  [agentTest, "agent tests"],
  [aiCoreDoc, "AI Core docs"],
  [scalingDoc, "model scaling docs"],
  [routerDoc, "model router docs"],
  [statusDoc, "status docs"]
]) {
  ensure(text.includes("seis-512b-apex-model-program"), `${label} must reference 512B apex model program id/path`);
  ensure(text.includes("seis://ai/512b-apex-model-program.json"), `${label} must reference 512B apex model program MCP URI`);
}

for (const [text, label] of [
  [helper, "AI Core helper"],
  [mcpServer, "MCP server"],
  [mcpSmoke, "MCP smoke tests"],
  [aiCoreDoc, "AI Core docs"],
  [scalingDoc, "model scaling docs"],
  [routerDoc, "model router docs"]
]) {
  ensure(text.includes("seis-agi-evaluation-protocol"), `${label} must reference AGI evaluation protocol id/path`);
  ensure(text.includes("seis://ai/agi-evaluation-protocol.json"), `${label} must reference AGI evaluation protocol MCP URI`);
}

for (const [text, label] of [
  [helper, "AI Core helper"],
  [mcpServer, "MCP server"],
  [mcpSmoke, "MCP smoke tests"]
]) {
  ensure(text.includes("seis-agi-public-readiness-evidence"), `${label} must reference AGI public readiness evidence`);
  ensure(text.includes("seis://ai/agi-public-readiness-evidence.json"), `${label} must reference AGI public readiness evidence MCP URI`);
}

finish("SEIS 512B apex model program check passed.");

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
    console.error("SEIS 512B apex model program check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}
