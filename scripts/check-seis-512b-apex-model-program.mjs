#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  program: "content/development/seis-512b-apex-model-program.json",
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
    paths.council
  ], "program.sourceOfTruth values");
  ensure((program.programStages || []).length === 7, "program must expose seven 512B stages");
  ensure((program.programStages || []).every((stage) => stage.routeEligibleToday === false), "all 512B stages must be route-ineligible");
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

ensure(profile?.sourceOfTruth?.apexModelProgram === paths.program, "profile must point to 512B apex model program");
ensure((profile?.scaleLadder || []).some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"), "profile scale ladder must include 512B plan-only target");
ensure((profile?.creationStages || []).some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"), "profile creation stages must include 512B plan-only target");

ensure((ladder?.promotionOrder || []).includes("512B"), "parameter ladder promotionOrder must include 512B");
ensure((ladder?.targets || []).some((target) => target.parameterClass === "512B" && target.parameterCountBillion === 512 && target.routeEligibleToday === false), "parameter ladder must keep 512B route-ineligible");

ensure(policy?.sourceOfTruth?.apexModelProgram === paths.program, "frontier policy must point to 512B apex model program");
ensure((policy?.escalationStages || []).some((stage) => stage.id === "stage-4-512b-apex" && stage.parameterClass === "512B" && stage.routeEligibleToday === false), "frontier policy must include blocked 512B apex stage");

ensure(council?.sourceOfTruth?.apexModelProgram === paths.program, "council must point to 512B apex model program");
ensure((council?.stageAssignments || []).some((stage) => stage.stage === "512B" && stage.routeEligibleToday === false && (stage.leadAgents || []).length === 12), "council must assign all 12 agents to 512B plan-only stage");

ensureArrayIncludesAll(pluginIntegration?.runtimeIntegration?.mcpResources, ["seis://ai/512b-apex-model-program.json"], "pluginIntegration.runtimeIntegration.mcpResources");
ensureArrayIncludesAll(pluginIntegration?.qualityCommands, ["npm run check:seis-512b-apex-model-program"], "pluginIntegration.qualityCommands");
ensure(mcpRuntime?.resourceCount === 26, "MCP runtime contract must record 26 resources");

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
