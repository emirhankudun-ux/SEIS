#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  program: "content/development/seis-150b-frontier-model-program.json",
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  parameterLadder: "content/development/seis-model-parameter-ladder.json",
  frontierPolicy: "content/development/seis-model-frontier-escalation-policy.json",
  council: "content/development/seis-model-scaling-subagent-council.json",
  scalingDoc: "docs/ai/seis-model-scaling.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  modelRouterDoc: "docs/ai/model-router.md",
  statusDoc: "docs/STATUS.md",
  reviewDoc: "docs/reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md",
  nextPrQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  mcpSmoke: "packages/seis-ai/test/mcp-smoke.test.mjs",
  agentTest: "packages/seis-ai/test/agent.test.mjs",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  mcpRuntimeContract: "content/development/seis-ai-core-mcp-runtime-contract.json",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(relativePath, label);
}

const program = readJson(paths.program, "150B frontier model program");
const profile = readJson(paths.profile, "model scaling profile");
const parameterLadder = readJson(paths.parameterLadder, "parameter ladder");
const frontierPolicy = readJson(paths.frontierPolicy, "frontier escalation policy");
const council = readJson(paths.council, "model scaling sub-agent council");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration");
const mcpRuntimeContract = readJson(paths.mcpRuntimeContract, "MCP runtime contract");
const packageJson = readJson(paths.packageJson, "package.json");

const scalingDoc = readText(paths.scalingDoc, "model scaling docs");
const aiCoreDoc = readText(paths.aiCoreDoc, "AI Core docs");
const modelRouterDoc = readText(paths.modelRouterDoc, "model router docs");
const statusDoc = readText(paths.statusDoc, "status docs");
const reviewDoc = readText(paths.reviewDoc, "foundation review docs");
const nextPrQueue = readText(paths.nextPrQueue, "next PR queue");
const helper = readText(paths.helper, "AI Core helper");
const mcpServer = readText(paths.mcpServer, "MCP server");
const mcpSmoke = readText(paths.mcpSmoke, "MCP smoke tests");
const agentTest = readText(paths.agentTest, "agent tests");

if (program) {
  ensure(program.id === "seis-150b-frontier-model-program", "program id mismatch");
  ensure(program.status === "frontier-program-plan-only", "program status must stay frontier-program-plan-only");
  ensure(program.resourceUri === "seis://ai/150b-frontier-model-program.json", "program MCP resource URI mismatch");
  ensure(program.qualityGate === "npm run check:seis-150b-frontier-model-program", "program quality gate mismatch");
  ensure(program.coreCredentialRequirement === "none", "program must require no core credential");
  ensure(program.defaultRuntimeMode === "seis-local-demo", "program default runtime must be seis-local-demo");
  ensure(program.routeEligibleToday === false, "program must not be route eligible today");
  ensure(program.runtimeAuthority === false, "program must not grant runtime authority");
  ensure(program.trainingStatus === "not-started", "program training must remain not-started");
  ensure(program.weightsAvailable === false, "program must not mark weights available");
  ensure(program.inferenceAvailable === false, "program must not mark inference available");
  ensure(program.benchmarkStatus === "not-run", "program benchmark must remain not-run");
  ensure(program.productionReady === false, "program must not be production ready");
  ensure(String(program.truthBoundary || "").includes("does not download models"), "truth boundary must forbid model downloads");
  ensure(String(program.truthBoundary || "").includes("train"), "truth boundary must forbid training");
  ensure(String(program.truthBoundary || "").includes("run inference"), "truth boundary must forbid inference");
  ensure(String(program.truthBoundary || "").includes("claim SEIS owns"), "truth boundary must forbid ownership claims");

  ensure(program.sourceOfTruth?.modelScalingProfile === paths.profile, "program source modelScalingProfile mismatch");
  ensure(program.sourceOfTruth?.parameterLadder === paths.parameterLadder, "program source parameterLadder mismatch");
  ensure(program.sourceOfTruth?.frontierEscalationPolicy === paths.frontierPolicy, "program source frontierEscalationPolicy mismatch");
  ensure(program.sourceOfTruth?.modelScalingSubagentCouncil === paths.council, "program source modelScalingSubagentCouncil mismatch");

  ensure(program.target?.parameterClass === "150B", "target parameterClass must be 150B");
  ensure(program.target?.parameterCountBillion === 150, "target parameter count must be 150");
  ensure(String(program.target?.minimumPrerequisite || "").includes("20B and 70B evidence accepted"), "target must require 20B and 70B evidence first");

  const stages = Array.isArray(program.programStages) ? program.programStages : [];
  ensureArrayIncludesAll(stages.map((stage) => stage.id), [
    "stage-0-charter",
    "stage-1-clean-room-data",
    "stage-2-architecture-selection",
    "stage-3-distributed-runtime",
    "stage-4-training-readiness",
    "stage-5-evaluation-and-safety"
  ], "programStages");
  ensure(stages.every((stage) => stage.routeEligibleToday === false), "all 150B program stages must be route-ineligible");
  ensure(stages.some((stage) => stage.id === "stage-4-training-readiness" && stage.status === "not-authorized"), "training readiness must remain not-authorized");
  ensure(stages.some((stage) => stage.id === "stage-5-evaluation-and-safety" && stage.status === "not-run"), "evaluation and safety must remain not-run");

  ensure(program.architecturePlan?.status === "not-selected", "architecture must remain not-selected");
  ensureArrayIncludesAll(program.architecturePlan?.candidateFamilies, ["dense-transformer", "mixture-of-experts", "hybrid-retrieval-augmented"], "architecture candidate families");
  ensure(program.agentCouncil?.status === "plan-only", "agent council must remain plan-only");
  ensure(program.agentCouncil?.source === paths.council, "agent council source mismatch");
  ensureArrayIncludesAll(program.agentCouncil?.leadAgents, ["architect-agent", "research-agent", "cloud-agent", "security-agent", "qa-agent"], "agent council leadAgents");
  ensureArrayIncludesAll(program.promotionGates, [
    "20B evidence accepted",
    "70B evidence accepted",
    "clean-room frontier training plan accepted",
    "distributed runtime budget accepted",
    "explicit human approval recorded"
  ], "promotionGates");
  ensure(program.fallbackPolicy?.fallbackRuntime === "seis-local-demo", "fallback runtime must be seis-local-demo");
  ensure(program.fallbackPolicy?.silentCloudFallbackAllowed === false, "silent cloud fallback must be blocked");
  ensureArrayIncludesAll(program.forbiddenClaimRules, [
    "no-trained-150b-weights-claim",
    "no-routeable-150b-inference-claim",
    "no-150b-benchmark-claim",
    "no-provider-wrapper-as-foundation-model-claim",
    "no-subagent-approval-as-runtime-authority-claim"
  ], "forbiddenClaimRules");
  ensureArrayIncludesAll(program.humanApprovalRequiredFor, [
    "model download",
    "dataset download",
    "runtime adapter execution",
    "benchmark execution",
    "training run",
    "fine-tuning run",
    "GPU or cloud provisioning",
    "SSH execution",
    "deployment",
    "route eligibility change"
  ], "humanApprovalRequiredFor");
}

if (profile) {
  ensure(profile.sourceOfTruth?.frontierModelProgram === paths.program, "model scaling profile must point to 150B frontier model program");
}

if (parameterLadder) {
  ensure((parameterLadder.targets || []).some((target) => target.parameterClass === "150B" && target.routeEligibleToday === false), "parameter ladder must keep 150B route-ineligible");
}

if (frontierPolicy) {
  ensure(frontierPolicy.sourceOfTruth?.frontierModelProgram === paths.program, "frontier policy must point to 150B frontier model program");
  ensure((frontierPolicy.escalationStages || []).some((stage) => stage.id === "stage-3-150b-frontier" && stage.routeEligibleToday === false), "frontier policy must keep 150B route-ineligible");
}

if (council) {
  ensure(council.sourceOfTruth?.frontierModelProgram === paths.program, "model scaling sub-agent council must point to 150B frontier model program");
  ensure((council.stageAssignments || []).some((stage) => stage.stage === "150B" && stage.routeEligibleToday === false), "council must keep 150B route-ineligible");
}

if (pluginIntegration) {
  ensureArrayIncludesAll(pluginIntegration.runtimeIntegration?.mcpResources, [
    "seis://ai/150b-frontier-model-program.json"
  ], "pluginIntegration.runtimeIntegration.mcpResources");
  ensureArrayIncludesAll(pluginIntegration.qualityCommands, [
    "npm run check:seis-150b-frontier-model-program"
  ], "pluginIntegration.qualityCommands");
}

if (mcpRuntimeContract) {
  ensure(mcpRuntimeContract.resourceCount === 32, "MCP runtime contract must record 32 resources");
  const resourceSurface = (mcpRuntimeContract.surfaces || []).find((surface) => surface.id === "resources") || {};
  ensure(String(resourceSurface.evidence || "").includes("150B frontier model program"), "MCP resource evidence must mention 150B frontier model program");
  ensure(String(resourceSurface.evidence || "").includes("AGI evaluation protocol"), "MCP resource evidence must mention AGI evaluation protocol");
  ensure(String(resourceSurface.evidence || "").includes("AGI public readiness evidence"), "MCP resource evidence must mention AGI public readiness evidence");
  ensure(String(resourceSurface.duty || "").includes("150B frontier program"), "MCP resource duty must mention 150B frontier program");
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-150b-frontier-model-program"] === "node scripts/check-seis-150b-frontier-model-program.mjs",
    "package.json must expose check:seis-150b-frontier-model-program"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-150b-frontier-model-program"),
    "quality:governance must include check:seis-150b-frontier-model-program"
  );
}

for (const [text, label] of [
  [scalingDoc, "model scaling docs"],
  [aiCoreDoc, "AI Core docs"],
  [modelRouterDoc, "model router docs"],
  [statusDoc, "status docs"],
  [reviewDoc, "foundation review"],
  [nextPrQueue, "next PR queue"],
  [helper, "AI Core helper"],
  [mcpServer, "MCP server"],
  [mcpSmoke, "MCP smoke tests"],
  [agentTest, "agent tests"]
]) {
  ensure(text.includes("seis-150b-frontier-model-program"), `${label} must reference 150B frontier model program id/path`);
  ensure(text.includes("seis://ai/150b-frontier-model-program.json"), `${label} must reference 150B frontier model program MCP URI`);
}

ensure(helper.includes("AI_CORE_150B_FRONTIER_MODEL_PROGRAM_PATH"), "AI Core helper must expose 150B program path constant");
ensure(helper.includes("frontierModelProgram"), "AI Core helper must expose frontierModelProgram payload");
ensure(mcpServer.includes("ai-core-150b-frontier-model-program"), "MCP server must expose the 150B frontier model program resource");

finish("SEIS 150B frontier model program check passed.");

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
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
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
    console.error("SEIS 150B frontier model program check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}
