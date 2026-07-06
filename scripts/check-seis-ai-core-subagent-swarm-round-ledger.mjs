#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  ledger: "content/development/seis-ai-core-subagent-swarm-round-ledger.json",
  plan: "content/development/seis-sub-agent-5-year-plan.json",
  operatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  mcpRuntimeContract: "content/development/seis-ai-core-mcp-runtime-contract.json",
  packageJson: "package.json",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  mcpSmoke: "packages/seis-ai/test/mcp-smoke.test.mjs",
  evidenceReport: "reports/seis-sub-agent-five-year-demo-evidence.json",
  demoPlanView: "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const ledger = readJson(paths.ledger, "sub-agent swarm round ledger");
const plan = readJson(paths.plan, "five-year sub-agent plan");
const operatingModel = readJson(paths.operatingModel, "sub-agent operating model");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration manifest");
const mcpRuntimeContract = readJson(paths.mcpRuntimeContract, "MCP runtime contract");
const packageJson = readJson(paths.packageJson, "package.json");
const helper = readText(paths.helper, "plugin integration helper");
const mcpServer = readText(paths.mcpServer, "MCP server");
const mcpSmoke = readText(paths.mcpSmoke, "MCP smoke test");
const evidenceReport = readJson(paths.evidenceReport, "five-year evidence report");
const demoPlanView = readJson(paths.demoPlanView, "demo plan view");

if (ledger) {
  ensure(ledger.id === "seis-ai-core-subagent-swarm-round-ledger", "ledger id mismatch");
  ensure(ledger.status === "plan-only-supervised-ledger", "ledger must remain plan-only supervised");
  ensure(ledger.resourceUri === "seis://ai/subagent-swarm-round-ledger.json", "ledger resource URI mismatch");
  ensure(ledger.qualityGate === "npm run check:seis-ai-core-subagent-swarm-round-ledger", "ledger quality gate mismatch");
  ensure(String(ledger.truthBoundary || "").includes("does not prove uninterrupted five-year execution"), "truth boundary must reject uninterrupted execution proof");
  ensure(String(ledger.truthBoundary || "").includes("completed 720B training"), "truth boundary must reject completed 720B training");
  ensure(String(ledger.truthBoundary || "").includes("AGI capability"), "truth boundary must reject AGI capability claims");
  ensure(ledger.ownerObjectiveMap?.duration === "five-years", "owner objective duration mismatch");
  ensure(ledger.ownerObjectiveMap?.target === "720B AGI", "owner objective target mismatch");
  ensure(ledger.ownerObjectiveMap?.targetStatus === "plan-only-boundary", "720B target must stay plan-only");
  ensure(ledger.ownerObjectiveMap?.defaultRoundWindow === 15, "default round window must be 15");
  ensure(ledger.ownerObjectiveMap?.expandedRoundWindow === 30, "expanded round window must be 30");
  ensure(ledger.ownerObjectiveMap?.expandedRoundWindowRequiresOwnerApproval === true, "30-round expansion must require owner approval");
  ensure(ledger.ownerObjectiveMap?.singleWriter === "codex", "single writer must remain Codex");
  ensure(ledger.runtimeBoundary?.continuousBackgroundRuntime === "not-authorized", "continuous background runtime must not be authorized");
  ensure(ledger.runtimeBoundary?.credentialAccess === "forbidden", "credential access must be forbidden");
  ensure(ledger.runtimeBoundary?.sshExecution === "forbidden", "SSH execution must be forbidden");
  ensure(ledger.runtimeBoundary?.cloudProvisioning === "forbidden", "cloud provisioning must be forbidden");
  ensure(ledger.runtimeBoundary?.modelTraining === "forbidden", "model training must be forbidden");
  ensure(ledger.runtimeBoundary?.agiClaimAllowed === false, "AGI claim must be blocked");
  ensure(ledger.runtimeBoundary?.routeEligibleToday === false, "ledger must not make routes eligible");
  ensureArrayIncludesAll(ledger.sourceOfTruth ? Object.values(ledger.sourceOfTruth) : [], [
    paths.plan,
    paths.operatingModel,
    "content/development/seis-ai-core-subagent-runtime-fixtures.json",
    "content/development/seis-ai-core-subagent-review-ledger.json",
    paths.mcpRuntimeContract,
    "content/development/seis-720b-agi-frontier-boundary.json"
  ], "ledger.sourceOfTruth values");

  const windowProfiles = Array.isArray(ledger.roundWindowProfiles) ? ledger.roundWindowProfiles : [];
  const defaultWindow = windowProfiles.find((profile) => profile.roundCount === 15);
  const expandedWindow = windowProfiles.find((profile) => profile.roundCount === 30);
  ensure(defaultWindow?.approvalRequired === false, "15-round window must not require owner approval");
  ensure(expandedWindow?.approvalRequired === true, "30-round window must require owner approval");
  ensure(defaultWindow?.forbiddenNow?.includes("deploy"), "default window must forbid deploy");
  ensure(defaultWindow?.forbiddenNow?.includes("ssh"), "default window must forbid ssh");
  ensure(defaultWindow?.forbiddenNow?.includes("claim AGI"), "default window must forbid AGI claims");

  const laneIds = new Set((ledger.laneAssignments || []).map((lane) => lane.laneId));
  ensureArrayIncludesAll(laneIds, [
    "architecture-agent",
    "implementation-agent",
    "security-agent",
    "documentation-agent",
    "validation-agent",
    "design-agent"
  ], "ledger.laneAssignments");

  ensure(Array.isArray(ledger.roundAssignments) && ledger.roundAssignments.length === 15, "ledger must define 15 default round assignments");
  const rounds = new Set((ledger.roundAssignments || []).map((round) => round.round));
  for (let index = 1; index <= 15; index += 1) {
    ensure(rounds.has(index), `ledger missing round ${index}`);
  }
  for (const round of ledger.roundAssignments || []) {
    ensure(laneIds.has(round.laneId), `round ${round.round} references unknown lane ${round.laneId}`);
    ensure(round.status === "repo-tracked-plan-ready", `round ${round.round} must stay repo-tracked plan-ready`);
    ensure(Array.isArray(round.requiredEvidence) && round.requiredEvidence.length >= 2, `round ${round.round} needs evidence`);
  }
  ensure(ledger.expandedRounds16To30?.status === "not-started-owner-approval-required", "rounds 16-30 must remain owner-approved expansion only");
  ensureArrayIncludesAll(ledger.forbiddenClaims, [
    "SEIS is running uninterrupted autonomous agents for five years.",
    "SEIS has completed the 720B AGI target.",
    "SEIS has trained or benchmarked 720B weights.",
    "SEIS has routeable 720B inference.",
    "SEIS has provisioned cloud/GPU/SSH runtime for 720B.",
    "SEIS can use all installed MCPs without authentication, scope, or human approval."
  ], "ledger.forbiddenClaims");
  ensureArrayIncludesAll(ledger.validation, [
    "npm run check:seis-ai-core-subagent-swarm-round-ledger",
    "node --test packages/seis-ai/test/mcp-smoke.test.mjs"
  ], "ledger.validation");
}

ensure(plan?.swarmRoundLedger === paths.ledger, "five-year plan must link the swarm round ledger");
ensure(plan?.continuousOperatingCadence?.defaultRoundWindow === 15, "plan default round window must remain 15");
ensure(plan?.continuousOperatingCadence?.expandedRoundWindowRequiresOwnerApproval === true, "plan 30-round expansion must require owner approval");
ensure(operatingModel?.sourceOfTruth?.swarmRoundLedger === paths.ledger, "operating model must link the swarm round ledger");
ensure(pluginIntegration?.fiveYearSubagentDevelopment?.swarmRoundLedger === paths.ledger, "plugin integration must link the swarm round ledger");
ensure(
  Array.isArray(pluginIntegration?.runtimeIntegration?.mcpResources) &&
    pluginIntegration.runtimeIntegration.mcpResources.includes("seis://ai/subagent-swarm-round-ledger.json"),
  "plugin integration MCP resources must include the swarm round ledger"
);
ensure(mcpRuntimeContract?.resourceCount >= 31, "MCP runtime contract must include the swarm round ledger resource");
ensure(
  JSON.stringify(mcpRuntimeContract?.surfaces || []).includes("sub-agent swarm round ledger"),
  "MCP runtime resource surface must mention the sub-agent swarm round ledger"
);
ensure(
  packageJson?.scripts?.["check:seis-ai-core-subagent-swarm-round-ledger"] ===
    "node scripts/check-seis-ai-core-subagent-swarm-round-ledger.mjs",
  "package.json must expose check:seis-ai-core-subagent-swarm-round-ledger"
);
ensure(
  String(packageJson?.scripts?.["quality:governance"] || "").includes("check:seis-ai-core-subagent-swarm-round-ledger"),
  "quality:governance must include check:seis-ai-core-subagent-swarm-round-ledger"
);
ensure(helper.includes("SUBAGENT_SWARM_ROUND_LEDGER_PATH"), "helper must expose SUBAGENT_SWARM_ROUND_LEDGER_PATH");
ensure(helper.includes("SUBAGENT_SWARM_ROUND_LEDGER_RESOURCE_URI"), "helper must expose SUBAGENT_SWARM_ROUND_LEDGER_RESOURCE_URI");
ensure(mcpServer.includes("seis://ai/subagent-swarm-round-ledger.json"), "MCP server must expose the swarm round ledger resource");
ensure(mcpSmoke.includes("seis://ai/subagent-swarm-round-ledger.json"), "MCP smoke test must cover the swarm round ledger resource");
ensure(evidenceReport?.swarmRoundLedger?.id === "seis-ai-core-subagent-swarm-round-ledger", "evidence report must include the swarm round ledger");
ensure(demoPlanView?.swarmRoundLedger?.id === "seis-ai-core-subagent-swarm-round-ledger", "demo plan view must include the swarm round ledger");

if (failures.length > 0) {
  console.error("SEIS AI Core sub-agent swarm round ledger check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS AI Core sub-agent swarm round ledger check passed.");

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
  const values = candidate instanceof Set ? candidate : new Set(Array.isArray(candidate) ? candidate : []);
  if (!(candidate instanceof Set) && !Array.isArray(candidate)) failures.push(`${label} must be an array`);
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
