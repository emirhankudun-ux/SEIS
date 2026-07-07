#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  boundary: "content/development/seis-720b-agi-frontier-boundary.json",
  fiveYearPlan: "content/development/seis-sub-agent-5-year-plan.json",
  nextFrontierBoundary: "content/development/seis-520b-next-frontier-boundary.json",
  apexModelProgram: "content/development/seis-512b-apex-model-program.json",
  agiEvaluationProtocol: "content/development/seis-agi-evaluation-protocol.json",
  agiPublicReadinessEvidence: "content/development/seis-agi-public-readiness-evidence.json",
  mcpRuntimeContract: "content/development/seis-ai-core-mcp-runtime-contract.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  mcpSmokeTest: "packages/seis-ai/test/mcp-smoke.test.mjs",
  scalingDoc: "docs/ai/seis-model-scaling.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  statusDoc: "docs/STATUS.md",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const boundary = readJson(paths.boundary, "720B AGI frontier boundary");
const fiveYearPlan = readJson(paths.fiveYearPlan, "five-year sub-agent plan");
const nextFrontierBoundary = readJson(paths.nextFrontierBoundary, "520B next-frontier boundary");
const apexModelProgram = readJson(paths.apexModelProgram, "512B apex model program");
const agiEvaluationProtocol = readJson(paths.agiEvaluationProtocol, "AGI evaluation protocol");
const agiPublicReadinessEvidence = readJson(paths.agiPublicReadinessEvidence, "AGI public readiness evidence");
const mcpRuntimeContract = readJson(paths.mcpRuntimeContract, "MCP runtime contract");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration manifest");
const mcpServer = readText(paths.mcpServer, "MCP server");
const mcpSmokeTest = readText(paths.mcpSmokeTest, "MCP smoke test");
const scalingDoc = readText(paths.scalingDoc, "model scaling docs");
const aiCoreDoc = readText(paths.aiCoreDoc, "AI Core docs");
const statusDoc = readText(paths.statusDoc, "status docs");
const packageJson = readJson(paths.packageJson, "package.json");

if (boundary) {
  ensure(boundary.id === "seis-720b-agi-frontier-boundary", "boundary id mismatch");
  ensure(boundary.status === "agi-frontier-boundary-plan-only", "boundary must stay plan-only");
  ensure(boundary.resourceUri === "seis://ai/720b-agi-frontier-boundary.json", "boundary resource URI mismatch");
  ensure(boundary.qualityGate === "npm run check:seis-720b-agi-frontier-boundary", "boundary quality gate mismatch");
  ensure(boundary.coreCredentialRequirement === "none", "boundary coreCredentialRequirement must stay none");
  ensure(boundary.defaultRuntimeMode === "seis-local-demo", "boundary default runtime mode must stay Local Demo");
  ensure(boundary.routeEligibleToday === false, "boundary must not be route eligible today");
  ensure(boundary.runtimeAuthority === false, "boundary must not grant runtime authority");
  ensure(boundary.trainingStatus === "not-started", "boundary trainingStatus must stay not-started");
  ensure(boundary.weightsAvailable === false, "boundary must not mark weights available");
  ensure(boundary.inferenceAvailable === false, "boundary must not mark inference available");
  ensure(boundary.benchmarkStatus === "not-run", "boundary benchmarkStatus must stay not-run");
  ensure(boundary.productionReady === false, "boundary must not be production ready");
  ensure(boundary.agiClaimAllowed === false, "boundary must not allow AGI claims");

  ensure(String(boundary.truthBoundary || "").includes("plan-only 720B AGI"), "truth boundary must mark 720B AGI as plan-only");
  ensure(String(boundary.truthBoundary || "").includes("does not download models"), "truth boundary must forbid model downloads");
  ensure(String(boundary.truthBoundary || "").includes("train"), "truth boundary must forbid training claims");
  ensure(String(boundary.truthBoundary || "").includes("run inference"), "truth boundary must forbid inference claims");
  ensure(String(boundary.truthBoundary || "").includes("benchmark"), "truth boundary must forbid benchmark claims");
  ensure(String(boundary.truthBoundary || "").includes("provision GPU/cloud capacity"), "truth boundary must forbid GPU/cloud provisioning");
  ensure(String(boundary.truthBoundary || "").includes("run continuous background agents"), "truth boundary must forbid uncontrolled background agents");
  ensure(String(boundary.truthBoundary || "").includes("real AGI"), "truth boundary must forbid AGI proof claims");

  ensureArrayIncludesAll(boundary.sourceOfTruth ? Object.values(boundary.sourceOfTruth) : [], [
    paths.fiveYearPlan,
    paths.nextFrontierBoundary,
    paths.apexModelProgram,
    paths.agiEvaluationProtocol,
    paths.agiPublicReadinessEvidence,
    paths.mcpRuntimeContract,
    paths.scalingDoc
  ], "boundary.sourceOfTruth values");

  ensure(boundary.target?.id === "seis-720b-agi-frontier-target", "target id mismatch");
  ensure(boundary.target?.parameterClass === "720B", "target parameterClass must be 720B");
  ensure(boundary.target?.parameterCountBillion === 720, "target parameterCountBillion must be 720");
  ensure(String(boundary.target?.allowedToday || "").includes("Local Demo"), "target allowedToday must stay Local Demo only");
  ensure(String(boundary.target?.minimumPrerequisite || "").includes("520B evidence accepted"), "target must require 520B evidence first");

  ensure(boundary.supervisedCadence?.requestedDuration === "five-years", "boundary must preserve five-year cadence");
  ensureArrayIncludesAll(boundary.supervisedCadence?.roundWindows, [15, 30], "boundary.supervisedCadence.roundWindows");
  ensure(String(boundary.supervisedCadence?.operatingMode || "").includes("not-uncontrolled-background-runtime"), "cadence must reject uncontrolled background runtime");
  ensure(boundary.supervisedCadence?.singleWriter === "codex", "cadence must keep Codex as single writer");

  ensure(boundary.mcpBoundary?.defaultPermission === "read-only-or-plan-only", "MCP boundary must default to read-only or plan-only");
  ensure(boundary.mcpBoundary?.sourceContract === paths.mcpRuntimeContract, "MCP boundary must link the MCP runtime contract");

  ensureArrayIncludesAll(boundary.evidenceRequiredBeforeAny720BClaim, [
    "20B, 70B, 150B, 300B+, 512B, and 520B evidence accepted",
    "720B dense-vs-MoE frontier architecture decision recorded",
    "AGI evaluation protocol completed with independent review",
    "observability, kill-switch, rollback, and cost-stop plan",
    "explicit human approval recorded"
  ], "boundary.evidenceRequiredBeforeAny720BClaim");

  ensureArrayIncludesAll(boundary.forbiddenClaimRules, [
    "no-trained-720b-weights-claim",
    "no-routeable-720b-inference-claim",
    "no-720b-benchmark-claim",
    "no-720b-cloud-or-ssh-claim",
    "no-720b-agi-capability-claim",
    "no-continuous-autonomous-background-agent-claim"
  ], "boundary.forbiddenClaimRules");

  ensureArrayIncludesAll(boundary.forbiddenClaims, [
    "SEIS has trained a 720B foundation model.",
    "SEIS has routeable 720B inference.",
    "SEIS has benchmarked a 720B model.",
    "SEIS has provisioned 720B cloud or GPU runtime.",
    "SEIS has achieved real AGI through the 720B roadmap.",
    "SEIS is running uncontrolled five-year autonomous background agents."
  ], "boundary.forbiddenClaims");
}

ensure(fiveYearPlan?.frontierTarget?.sourceOfTruth === paths.boundary, "five-year plan must point to the 720B boundary");
ensure(fiveYearPlan?.frontierTarget?.agiClaimAllowed === false, "five-year plan must block AGI claims");
ensure(fiveYearPlan?.continuousOperatingCadence?.defaultRoundWindow === 15, "five-year plan must default to 15-round windows");
ensure(fiveYearPlan?.continuousOperatingCadence?.expandedRoundWindowRequiresOwnerApproval === true, "30-round expansion must require owner approval");
ensureArrayIncludesAll(fiveYearPlan?.continuousOperatingCadence?.roundWindowOptions, [15, 30], "five-year plan round windows");
ensure(fiveYearPlan?.mcpSelectionPolicy?.sourceContract === paths.mcpRuntimeContract, "five-year plan must link MCP runtime contract");
ensure(fiveYearPlan?.mcpSelectionPolicy?.defaultPermission === "read-only-or-plan-only", "five-year plan MCP policy must default to read-only/plan-only");

ensure(nextFrontierBoundary?.id === "seis-520b-next-frontier-boundary", "520B boundary must exist before 720B");
ensure(nextFrontierBoundary?.routeEligibleToday === false, "520B boundary must remain route-ineligible");
ensure(apexModelProgram?.id === "seis-512b-apex-model-program", "512B apex program must exist before 720B");
ensure(agiEvaluationProtocol?.agiClaimAllowed === false, "AGI evaluation protocol must still block AGI claims");
ensure(agiPublicReadinessEvidence?.agiClaimAllowed === false, "AGI public readiness evidence must still block AGI claims");
ensure(mcpRuntimeContract?.resourceUri === "seis://ai/mcp-runtime-contract.json", "MCP runtime contract must be linked");
ensure(mcpRuntimeContract?.toolCount >= 35, "MCP runtime contract must keep useful tool coverage");
ensure(mcpRuntimeContract?.resourceCount >= 30, "MCP runtime contract must include the 720B resource");
ensure(
  JSON.stringify(mcpRuntimeContract?.surfaces || []).includes("720B AGI frontier boundary"),
  "MCP runtime contract resource surface must mention the 720B AGI frontier boundary"
);
ensure(
  Array.isArray(pluginIntegration?.runtimeIntegration?.mcpResources)
    && pluginIntegration.runtimeIntegration.mcpResources.includes("seis://ai/720b-agi-frontier-boundary.json"),
  "plugin integration MCP resources must include the 720B frontier boundary"
);
ensure(mcpServer.includes("seis://ai/720b-agi-frontier-boundary.json"), "MCP server must expose the 720B frontier boundary resource");
ensure(mcpSmokeTest.includes("seis://ai/720b-agi-frontier-boundary.json"), "MCP smoke test must read the 720B frontier boundary resource");
ensure(mcpSmokeTest.includes("payload.target.parameterClass, \"720B\""), "MCP smoke test must assert the 720B frontier target");

ensure(scalingDoc.includes("720B AGI Frontier Boundary"), "model scaling docs must describe 720B boundary");
ensure(scalingDoc.includes("content/development/seis-720b-agi-frontier-boundary.json"), "model scaling docs must link the 720B boundary file");
ensure(scalingDoc.includes("npm run check:seis-720b-agi-frontier-boundary"), "model scaling docs must list the 720B quality gate");
ensure(scalingDoc.includes("No 720B"), "model scaling docs must include 720B non-claim language");
ensure(aiCoreDoc.includes("720B AGI frontier boundary"), "AI Core docs must describe the 720B AGI frontier boundary");
ensure(aiCoreDoc.includes("content/development/seis-720b-agi-frontier-boundary.json"), "AI Core docs must link the 720B boundary file");
ensure(aiCoreDoc.includes("seis://ai/720b-agi-frontier-boundary.json"), "AI Core docs must link the 720B MCP resource");
ensure(aiCoreDoc.includes("not trained weights"), "AI Core docs must keep 720B non-claim language");
ensure(statusDoc.includes("33 local MCP resources"), "status docs must show the current 33-resource MCP contract");
ensure(!statusDoc.includes("26 local MCP resources"), "status docs must not keep the stale 26-resource MCP count");
ensure(statusDoc.includes("content/development/seis-720b-agi-frontier-boundary.json"), "status docs must link the 720B boundary file");
ensure(statusDoc.includes("seis://ai/720b-agi-frontier-boundary.json"), "status docs must link the 720B MCP resource");
ensure(statusDoc.includes("not trained weights"), "status docs must keep 720B non-claim language");

ensure(
  packageJson?.scripts?.["check:seis-720b-agi-frontier-boundary"] === "node scripts/check-seis-720b-agi-frontier-boundary.mjs",
  "package.json must expose check:seis-720b-agi-frontier-boundary"
);
ensure(
  String(packageJson?.scripts?.["quality:governance"] || "").includes("check:seis-720b-agi-frontier-boundary"),
  "quality:governance must include check:seis-720b-agi-frontier-boundary"
);

finish("SEIS 720B AGI frontier boundary check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
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
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function finish(successMessage) {
  if (failures.length) {
    console.error("SEIS 720B AGI frontier boundary check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(successMessage);
}
