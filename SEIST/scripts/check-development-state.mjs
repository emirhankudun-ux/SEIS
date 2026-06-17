import { existsSync, readFileSync } from "node:fs";

const backlogPath = "content/development/backlog.json";
const decisionsPath = "content/development/decision-log.json";
const mobileMatrixPath = "content/development/mobile-path-matrix.json";
const branchContractPath = "content/development/uixappttr-branch.json";
const branchConsolidationPath = "content/development/branch-consolidation.json";
const premiumLocalFoundationPath = "content/development/premium-local-foundation-subagent.json";
const subAgentRunsPath = "content/development/sub-agent-runs.json";
const longTermProgramPath = "content/development/long-term-program.json";
const summaryPath = "docs/development/development-summary.md";
const failures = [];

for (const file of [backlogPath, decisionsPath, mobileMatrixPath, branchContractPath, branchConsolidationPath, premiumLocalFoundationPath, subAgentRunsPath, longTermProgramPath, summaryPath]) {
  if (!existsSync(file)) {
    failures.push(`missing development file: ${file}`);
  }
}

const backlog = readJson(backlogPath);
const decisions = readJson(decisionsPath);
const mobileMatrix = readJson(mobileMatrixPath);
const branchContract = readJson(branchContractPath);
const branchConsolidation = readJson(branchConsolidationPath);
const premiumLocalFoundation = readJson(premiumLocalFoundationPath);
const subAgentRuns = readJson(subAgentRunsPath);
const longTermProgram = readJson(longTermProgramPath);

const itemIds = new Set();
for (const item of backlog?.items || []) {
  if (!item.id || !item.lane || !item.status || !item.priority || !item.gate) {
    failures.push(`backlog item is incomplete: ${item.id || "unknown"}`);
  }
  if (itemIds.has(item.id)) {
    failures.push(`duplicate backlog item id: ${item.id}`);
  }
  itemIds.add(item.id);
}

if (!itemIds.has("SEIS-003")) {
  failures.push("server target blocker SEIS-003 must remain tracked");
}

if (!itemIds.has("SEIS-005")) {
  failures.push("mobile path decision SEIS-005 must remain tracked");
}

if (!itemIds.has("SEIS-006")) {
  failures.push("UIXAppTTR sub-agent governance SEIS-006 must remain tracked");
}

if (!itemIds.has("SEIS-007")) {
  failures.push("premium-local-foundation absorption SEIS-007 must remain tracked");
}

const acceptedDecisions = (decisions?.decisions || []).filter(decision => decision.status === "accepted");
if (acceptedDecisions.length < 2) {
  failures.push("expected at least two accepted architecture decisions");
}

if (mobileMatrix?.recommendedPath !== "pwa-first") {
  failures.push("mobile path must remain pwa-first until a native-only requirement is documented");
}

if (branchContract?.branch !== "UIXAppTTR") {
  failures.push("development branch contract must be UIXAppTTR");
}
if (branchContract?.repositoryName !== "UIXApps") {
  failures.push("development branch contract must name UIXApps");
}

if (branchConsolidation?.activeBranch !== "UIXAppTTR") {
  failures.push("branch consolidation must keep UIXAppTTR active");
}

if (branchConsolidation?.consolidationStatus !== "completed") {
  failures.push("branch consolidation status must be completed");
}

if ((branchConsolidation?.localBranchesAfterConsolidation || []).join(",") !== "UIXAppTTR") {
  failures.push("branch consolidation must leave only UIXAppTTR locally");
}

const absorbedNames = new Set((branchConsolidation?.absorbedBranches || []).map(branch => branch.name));
if (!absorbedNames.has("codex/premium-local-foundation")) {
  failures.push("branch consolidation must include codex/premium-local-foundation");
}

if (premiumLocalFoundation?.status !== "absorbed_as_sub_agent") {
  failures.push("premium-local-foundation must be absorbed as sub-agent");
}

const contractAgentIds = new Set((branchContract?.subAgents || []).map(agent => agent.id));
const runAgentIds = new Set((subAgentRuns?.agents || []).map(agent => agent.id));
for (const agentId of contractAgentIds) {
  if (!runAgentIds.has(agentId)) {
    failures.push(`sub-agent run ledger missing ${agentId}`);
  }
}
if ((subAgentRuns?.agents || []).length < 5) {
  failures.push("sub-agent run ledger must include at least five agents");
}

if (!contractAgentIds.has("premium-local-foundation-agent")) {
  failures.push("branch contract must include premium-local-foundation-agent");
}

if (!runAgentIds.has("premium-local-foundation-agent")) {
  failures.push("sub-agent run ledger must include premium-local-foundation-agent");
}

if (longTermProgram?.branch !== "UIXAppTTR") {
  failures.push("long-term program must remain attached to UIXAppTTR");
}

if ((longTermProgram?.phases || []).length < 6) {
  failures.push("long-term program must include at least six phases");
}

if (!(longTermProgram?.standingRules || []).includes("main stays protected")) {
  failures.push("long-term program must keep main protected");
}

if (failures.length > 0) {
  console.error("SEIS development state check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  backlogItems: itemIds.size,
  acceptedDecisions: acceptedDecisions.length,
  recommendedMobilePath: mobileMatrix.recommendedPath,
  branch: branchContract.branch,
  repositoryName: branchContract.repositoryName,
  subAgentRuns: runAgentIds.size,
  longTermPhases: longTermProgram.phases.length
}, null, 2));

function readJson(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}
