import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const branchContractPath = "content/development/uixappttr-branch.json";
const branchConsolidationPath = "content/development/branch-consolidation.json";
const premiumLocalFoundationPath = "content/development/premium-local-foundation-subagent.json";
const briefIndexPath = "docs/development/agents/README.md";
const failures = [];

if (!existsSync(branchContractPath)) {
  failures.push(`missing ${branchContractPath}`);
}
if (!existsSync(branchConsolidationPath)) {
  failures.push(`missing ${branchConsolidationPath}`);
}
if (!existsSync(premiumLocalFoundationPath)) {
  failures.push(`missing ${premiumLocalFoundationPath}`);
}
if (!existsSync(briefIndexPath)) {
  failures.push(`missing ${briefIndexPath}`);
}

const currentBranch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
const localBranches = execFileSync("git", ["branch", "--format=%(refname:short)"], { encoding: "utf8" })
  .split("\n")
  .map(branch => branch.trim())
  .filter(Boolean);
if (currentBranch !== "UIXAppTTR") {
  failures.push(`expected active branch UIXAppTTR, found ${currentBranch || "unknown"}`);
}
const extraBranches = localBranches.filter(branch => branch !== "UIXAppTTR");
if (extraBranches.length > 0) {
  failures.push(`expected UIXAppTTR to be the only local branch, found extra branches: ${extraBranches.join(", ")}`);
}
if (localBranches.includes("codex/premium-local-foundation")) {
  failures.push("codex/premium-local-foundation must be a sub-agent lane, not a local branch");
}

const contract = existsSync(branchContractPath)
  ? JSON.parse(readFileSync(branchContractPath, "utf8"))
  : null;
const consolidation = existsSync(branchConsolidationPath)
  ? JSON.parse(readFileSync(branchConsolidationPath, "utf8"))
  : null;
const premiumLocalFoundation = existsSync(premiumLocalFoundationPath)
  ? JSON.parse(readFileSync(premiumLocalFoundationPath, "utf8"))
  : null;

if (contract?.repositoryName !== "UIXApps") {
  failures.push("branch contract must name UIXApps as the repository");
}

if (contract?.branch !== "UIXAppTTR") {
  failures.push("branch contract must name UIXAppTTR");
}
if (contract?.policy?.localBranchCount !== "UIXAppTTR_only") {
  failures.push("branch contract must enforce UIXAppTTR_only local branch count");
}

const subAgentIds = new Set((contract?.subAgents || []).map(agent => agent.id));
if (!subAgentIds.has("premium-local-foundation-agent")) {
  failures.push("UIXAppTTR must include premium-local-foundation-agent");
}

if (consolidation?.repositoryName !== "UIXApps") {
  failures.push("branch consolidation must name UIXApps");
}

if (consolidation?.activeBranch !== "UIXAppTTR") {
  failures.push("branch consolidation must keep UIXAppTTR active");
}

if (consolidation?.consolidationStatus !== "completed") {
  failures.push("branch consolidation must be completed");
}

const absorbedNames = new Set((consolidation?.absorbedBranches || []).map(branch => branch.name));
if (!absorbedNames.has("codex/premium-local-foundation")) {
  failures.push("branch consolidation must record codex/premium-local-foundation");
}

if (premiumLocalFoundation?.formerBranchName !== "codex/premium-local-foundation") {
  failures.push("premium local foundation contract must name codex/premium-local-foundation");
}

if (premiumLocalFoundation?.subAgentId !== "premium-local-foundation-agent") {
  failures.push("premium local foundation contract must map to premium-local-foundation-agent");
}

if (premiumLocalFoundation?.status !== "absorbed_as_sub_agent") {
  failures.push("premium local foundation must be absorbed as sub-agent");
}

const subAgents = contract?.subAgents || [];
if (subAgents.length < 5) {
  failures.push("UIXAppTTR requires at least five sub-agent workstreams");
}

for (const agent of subAgents) {
  if (!agent.id || !agent.lane || !agent.mission || !Array.isArray(agent.allowedSurfaces)) {
    failures.push(`sub-agent is incomplete: ${agent.id || "unknown"}`);
  }
  const briefPath = `docs/development/agents/${agent.id}.md`;
  if (!existsSync(briefPath)) {
    failures.push(`missing sub-agent brief: ${briefPath}`);
  }
}

if (failures.length > 0) {
  console.error("UIXAppTTR branch check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  branch: currentBranch,
  localBranches,
  subAgents: subAgents.length
}, null, 2));
