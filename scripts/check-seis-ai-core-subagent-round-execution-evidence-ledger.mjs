#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  ledger: "content/development/seis-ai-core-subagent-round-execution-evidence-ledger.json",
  swarmRoundLedger: "content/development/seis-ai-core-subagent-swarm-round-ledger.json",
  plan: "content/development/seis-sub-agent-5-year-plan.json",
  operatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  mcpRuntimeContract: "content/development/seis-ai-core-mcp-runtime-contract.json",
  evidenceReport: "reports/seis-sub-agent-five-year-demo-evidence.json",
  demoPlanView: "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json",
  packageJson: "package.json",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  mcpSmoke: "packages/seis-ai/test/mcp-smoke.test.mjs"
};
const machineLocalPathPattern =
  /(?:[A-Za-z]:\\Users\\|\/Users\/|\/private\/|\/var\/folders\/|\/tmp\/|\/home\/|\/Volumes\/|Mobile Documents|com~apple~CloudDocs|file:\/\/)/i;

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const ledger = readJson(paths.ledger, "round execution evidence ledger");
const swarmRoundLedger = readJson(paths.swarmRoundLedger, "swarm round ledger");
const plan = readJson(paths.plan, "five-year sub-agent plan");
const operatingModel = readJson(paths.operatingModel, "sub-agent operating model");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration manifest");
const mcpRuntimeContract = readJson(paths.mcpRuntimeContract, "MCP runtime contract");
const evidenceReport = readJson(paths.evidenceReport, "five-year evidence report");
const demoPlanView = readJson(paths.demoPlanView, "demo plan view");
const packageJson = readJson(paths.packageJson, "package.json");
const helper = readText(paths.helper, "plugin integration helper");
const mcpServer = readText(paths.mcpServer, "MCP server");
const mcpSmoke = readText(paths.mcpSmoke, "MCP smoke test");

if (ledger) {
  ensure(!machineLocalPathPattern.test(JSON.stringify(ledger)), "ledger must not store machine-local paths or local attachment paths");
  ensure(ledger.id === "seis-ai-core-subagent-round-execution-evidence-ledger", "ledger id mismatch");
  ensure(ledger.status === "repo-local-supervised-closeout-evidence", "ledger status must stay repo-local supervised evidence");
  ensure(ledger.resourceUri === "seis://ai/subagent-round-execution-evidence-ledger.json", "ledger resource URI mismatch");
  ensure(ledger.qualityGate === "npm run check:seis-ai-core-subagent-round-execution-evidence-ledger", "ledger quality gate mismatch");
  ensure(String(ledger.truthBoundary || "").includes("does not prove real five-year autonomous operation"), "truth boundary must reject real five-year proof");
  ensure(String(ledger.truthBoundary || "").includes("720B AGI completion"), "truth boundary must reject 720B AGI completion");
  ensure(String(ledger.truthBoundary || "").includes("credential access"), "truth boundary must reject credential access");
  ensure(ledger.runtimeBoundary?.currentLevel === "evidence-ledger-only", "runtime boundary must be evidence-ledger-only");
  ensure(ledger.runtimeBoundary?.backgroundAutomation === "disabled", "background automation must stay disabled");
  ensure(ledger.runtimeBoundary?.continuousBackgroundRuntime === "not-authorized", "continuous background runtime must not be authorized");
  for (const key of [
    "externalMutationPerformed",
    "credentialAccessPerformed",
    "sshExecutionPerformed",
    "deploymentPerformed",
    "githubMutationPerformed",
    "providerCallPerformed",
    "modelTrainingPerformed",
    "releasePromotionAllowed",
    "agiClaimAllowed",
    "routeEligibleToday"
  ]) {
    ensure(ledger.runtimeBoundary?.[key] === false, `runtimeBoundary.${key} must be false`);
  }
  ensure(ledger.roundWindowState?.defaultRoundWindow === 15, "default round window must be 15");
  ensure(ledger.roundWindowState?.expandedRoundWindow === 30, "expanded round window must be 30");
  ensure(ledger.roundWindowState?.expandedRoundWindowRequiresOwnerApproval === true, "30-round expansion must require owner approval");
  ensureArrayIncludesAll(ledger.roundWindowState?.requiredCloseoutFields, [
    "round",
    "laneId",
    "task",
    "scope",
    "filesTouched",
    "verification",
    "security",
    "risks",
    "handoff"
  ], "roundWindowState.requiredCloseoutFields");
  ensureArrayIncludesAll(ledger.sourceOfTruth ? Object.values(ledger.sourceOfTruth) : [], [
    paths.plan,
    paths.swarmRoundLedger,
    paths.operatingModel,
    paths.mcpRuntimeContract,
    "content/development/seis-720b-agi-frontier-boundary.json",
    paths.evidenceReport
  ], "ledger.sourceOfTruth values");

  const records = Array.isArray(ledger.closeoutRecords) ? ledger.closeoutRecords : [];
  ensure(records.length >= 5, "ledger must preserve at least five supervised closeout records");
  ensure(records.length === ledger.roundWindowState?.recordedCloseoutCount, "closeout record count must match roundWindowState");
  ensure(records.length === ledger.evidenceSummary?.totalCloseoutRecords, "closeout record count must match evidence summary");
  ensure(ledger.evidenceSummary?.defaultRoundCompletion === `${records.length}/15`, "default round completion must match closeout count");
  const seenRounds = new Set();
  for (const record of records) {
    ensure(Number.isInteger(record.round) && record.round >= 1 && record.round <= 15, `${record.id} round must be in the default window`);
    ensure(!seenRounds.has(record.round), `${record.id} duplicates round ${record.round}`);
    seenRounds.add(record.round);
    ensure(typeof record.laneId === "string" && record.laneId.endsWith("-agent"), `${record.id} lane id must be an agent lane`);
    ensure(Array.isArray(record.verification) && record.verification.length >= 1, `${record.id} must include verification`);
    ensure(typeof record.security === "string" && record.security.length > 20, `${record.id} must include security notes`);
    ensure(typeof record.handoff === "string" && record.handoff.length > 20, `${record.id} must include handoff`);
    ensure(!String(record.status || "").includes("autonomous-complete"), `${record.id} must not claim autonomous completion`);
  }
  ensure(ledger.evidenceSummary?.completionClaimAllowed === false, "completion claims must be blocked");
  ensure(ledger.evidenceSummary?.continuousRuntimeClaimAllowed === false, "continuous runtime claims must be blocked");
  ensure(ledger.evidenceSummary?.agiClaimAllowed === false, "AGI claims must be blocked");
  ensureArrayIncludesAll(ledger.forbiddenClaims, [
    "SEIS has completed a real uninterrupted five-year autonomous run.",
    "SEIS has completed all 15 or 30 rounds without supervised evidence.",
    "SEIS has achieved 720B AGI.",
    "SEIS has trained 720B weights.",
    "SEIS has routeable 720B inference.",
    "SEIS has run 720B benchmarks.",
    "SEIS used provider credentials, SSH, cloud, deployment, or GitHub mutation for these closeouts."
  ], "ledger.forbiddenClaims");
}

ensure(swarmRoundLedger?.id === "seis-ai-core-subagent-swarm-round-ledger", "swarm round ledger must exist");
ensure(plan?.roundExecutionEvidenceLedger === paths.ledger, "five-year plan must link the round execution evidence ledger");
ensure(operatingModel?.sourceOfTruth?.roundExecutionEvidenceLedger === paths.ledger, "operating model must link the round execution evidence ledger");
ensure(pluginIntegration?.fiveYearSubagentDevelopment?.roundExecutionEvidenceLedger === paths.ledger, "plugin integration must link the round execution evidence ledger");
ensure(pluginIntegration?.runtimeIntegration?.mcpResources?.includes("seis://ai/subagent-round-execution-evidence-ledger.json"), "plugin integration MCP resources must include the round execution evidence ledger");
ensure(mcpRuntimeContract?.resourceCount >= 32, "MCP runtime contract must include the round execution evidence ledger resource");
ensure(JSON.stringify(mcpRuntimeContract?.surfaces || []).includes("round execution evidence ledger"), "MCP runtime resource surface must mention the round execution evidence ledger");
ensure(evidenceReport?.roundExecutionEvidenceLedger?.id === "seis-ai-core-subagent-round-execution-evidence-ledger", "evidence report must include the round execution evidence ledger");
ensure(demoPlanView?.roundExecutionEvidenceLedger?.id === "seis-ai-core-subagent-round-execution-evidence-ledger", "demo plan view must include the round execution evidence ledger");
if (ledger && evidenceReport) {
  ensure(
    evidenceReport.roundExecutionEvidenceLedger?.roundWindowState?.recordedCloseoutCount === ledger.roundWindowState?.recordedCloseoutCount,
    "evidence report round execution ledger closeout count must match the source ledger"
  );
  ensure(
    evidenceReport.roundExecutionEvidenceLedger?.evidenceSummary?.totalCloseoutRecords === ledger.evidenceSummary?.totalCloseoutRecords,
    "evidence report round execution ledger evidence summary must match the source ledger"
  );
  ensure(
    evidenceReport.roundExecutionEvidenceLedger?.evidenceSummary?.defaultRoundCompletion === ledger.evidenceSummary?.defaultRoundCompletion,
    "evidence report round execution ledger completion summary must match the source ledger"
  );
}
if (ledger && demoPlanView) {
  ensure(
    demoPlanView.roundExecutionEvidenceLedger?.roundWindowState?.recordedCloseoutCount === ledger.roundWindowState?.recordedCloseoutCount,
    "demo plan view round execution ledger closeout count must match the source ledger"
  );
  ensure(
    demoPlanView.roundExecutionEvidenceLedger?.evidenceSummary?.totalCloseoutRecords === ledger.evidenceSummary?.totalCloseoutRecords,
    "demo plan view round execution ledger evidence summary must match the source ledger"
  );
  ensure(
    demoPlanView.roundExecutionEvidenceLedger?.evidenceSummary?.defaultRoundCompletion === ledger.evidenceSummary?.defaultRoundCompletion,
    "demo plan view round execution ledger completion summary must match the source ledger"
  );
}
ensure(packageJson?.scripts?.["check:seis-ai-core-subagent-round-execution-evidence-ledger"] === "node scripts/check-seis-ai-core-subagent-round-execution-evidence-ledger.mjs", "package.json must expose check:seis-ai-core-subagent-round-execution-evidence-ledger");
ensure(helper.includes("SUBAGENT_ROUND_EXECUTION_EVIDENCE_LEDGER_PATH"), "helper must expose the round execution evidence ledger path");
ensure(mcpServer.includes("seis://ai/subagent-round-execution-evidence-ledger.json"), "MCP server must expose the round execution evidence ledger");
ensure(mcpSmoke.includes("seis://ai/subagent-round-execution-evidence-ledger.json"), "MCP smoke must cover the round execution evidence ledger");

if (failures.length > 0) {
  console.error("SEIS AI Core sub-agent round execution evidence ledger check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS AI Core sub-agent round execution evidence ledger check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) failures.push(`${label} missing: ${relativePath}`);
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
