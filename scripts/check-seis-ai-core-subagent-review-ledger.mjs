#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  ledger: "content/development/seis-ai-core-subagent-review-ledger.json",
  plan: "content/development/seis-sub-agent-5-year-plan.json",
  operatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
  runtimeFixtures: "content/development/seis-ai-core-subagent-runtime-fixtures.json",
  versionRegistry: "content/development/seis-ai-core-version-registry.json",
  versionPromotionGates: "content/development/seis-ai-core-version-promotion-gates.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  agentRuntimeDoc: "docs/ai/agent-runtime.md",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  tools: "packages/seis-ai/src/agent/tools.mjs",
  mcp: "packages/seis-ai/src/mcp/server.mjs",
  packageJson: "package.json",
};

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(abs(relativePath), label);
}

const ledger = readJson(paths.ledger, "sub-agent review ledger");
const plan = readJson(paths.plan, "five-year plan");
const operatingModel = readJson(paths.operatingModel, "sub-agent operating model");
const runtimeFixtures = readJson(paths.runtimeFixtures, "runtime fixture pack");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration manifest");
const aiCoreDoc = readText(paths.aiCoreDoc, "SEIS AI Core docs");
const agentRuntimeDoc = readText(paths.agentRuntimeDoc, "agent runtime docs");
const helper = readText(paths.helper, "plugin integration helper");
const tools = readText(paths.tools, "tool loop");
const mcp = readText(paths.mcp, "MCP server");
const packageJson = readJson(paths.packageJson, "package.json");

const expectedQuarterIds = [];
for (let year = 1; year <= 5; year += 1) {
  for (let quarter = 1; quarter <= 4; quarter += 1) {
    expectedQuarterIds.push(`Y${year}-Q${quarter}`);
  }
}

if (ledger) {
  ensure(ledger.id === "seis-ai-core-subagent-review-ledger", "ledger id mismatch");
  ensure(ledger.status === "documented-fixture", "ledger must stay documented-fixture");
  ensure(
    ledger.qualityGate === "npm run check:seis-ai-core-subagent-review-ledger",
    "ledger quality gate mismatch"
  );
  ensure(ledger.sourceOfTruth?.fiveYearPlan === paths.plan, "ledger must point to five-year plan");
  ensure(ledger.sourceOfTruth?.operatingModel === paths.operatingModel, "ledger must point to operating model");
  ensure(ledger.sourceOfTruth?.runtimeFixtures === paths.runtimeFixtures, "ledger must point to runtime fixtures");
  ensure(ledger.sourceOfTruth?.pluginIntegration === paths.pluginIntegration, "ledger must point to plugin integration");
  ensure(ledger.sourceOfTruth?.versionRegistry === paths.versionRegistry, "ledger must point to version registry");
  ensure(ledger.sourceOfTruth?.versionPromotionGates === paths.versionPromotionGates, "ledger must point to version promotion gates");
  ensure(ledger.cadence?.reviewCadence === "quarterly", "ledger review cadence must be quarterly");
  ensure(ledger.cadence?.horizonYears === 5, "ledger horizon must be five years");
  ensure(ledger.cadence?.totalQuarterRecords === 20, "ledger must declare 20 quarter records");
  ensure(ledger.runtimeBoundary?.currentLevel === "status-and-plan-only", "ledger must keep status-and-plan-only boundary");
  ensure(ledger.runtimeBoundary?.backgroundAutomation === "disabled", "ledger background automation must stay disabled");
  ensure(ledger.runtimeBoundary?.writeExecution === "disabled", "ledger write execution must stay disabled");
  ensure(ledger.runtimeBoundary?.credentialAccess === "forbidden", "ledger credential access must stay forbidden");
  ensure(ledger.summary?.externalMutationPerformed === false, "ledger summary must not claim external mutation");
  ensure(ledger.summary?.credentialAccessPerformed === false, "ledger summary must not claim credential access");
  ensure(ledger.summary?.autonomousMergeOrDeployPerformed === false, "ledger summary must not claim autonomous merge/deploy");
  ensureArrayIncludesAll(ledger.requiredEvidencePerReview, [
    "quarter id",
    "source five-year plan quarter",
    "responsible lanes",
    "outcomes",
    "gates",
    "validator",
    "approval boundary",
    "next safe action",
  ], "ledger.requiredEvidencePerReview");

  const quarters = Array.isArray(ledger.quarters) ? ledger.quarters : [];
  ensure(quarters.length === 20, "ledger must include exactly 20 quarter records");
  assertUnique(quarters.map((quarter) => quarter.id), "ledger quarter ids");
  ensureArrayIncludesAll(quarters.map((quarter) => quarter.id), expectedQuarterIds, "ledger.quarters");

  const planQuarterIds = new Set((plan?.years || []).flatMap((year) => (year.quarters || []).map((quarter) => quarter.id)));
  for (const quarter of quarters) {
    ensure(planQuarterIds.has(quarter.sourcePlanQuarter), `${quarter.id}.sourcePlanQuarter must exist in five-year plan`);
    ensure(quarter.sourcePlanQuarter === quarter.id, `${quarter.id}.sourcePlanQuarter must match id`);
    ensure(["documented-validated", "planned", "blocked-human-approval", "deferred", "archived"].includes(quarter.status), `${quarter.id}.status invalid`);
    ensure(Array.isArray(quarter.primaryLanes) && quarter.primaryLanes.length >= 3, `${quarter.id}.primaryLanes must include at least three lanes`);
    ensure(typeof quarter.validator === "string" && quarter.validator.length > 0, `${quarter.id}.validator must be set`);
    ensure(quarter.externalMutationPerformed === false, `${quarter.id}.externalMutationPerformed must be false`);
    ensure(typeof quarter.humanApprovalNeeded === "boolean", `${quarter.id}.humanApprovalNeeded must be boolean`);
    ensure(typeof quarter.nextSafeAction === "string" && quarter.nextSafeAction.length > 0, `${quarter.id}.nextSafeAction must be set`);
  }

  const validated = quarters.filter((quarter) => quarter.status === "documented-validated");
  const planned = quarters.filter((quarter) => quarter.status === "planned");
  ensure(validated.length === ledger.summary?.documentedValidatedQuarterCount, "ledger validated count must match records");
  ensure(planned.length === ledger.summary?.plannedQuarterCount, "ledger planned count must match records");
  ensure(validated.every((quarter) => Array.isArray(quarter.evidence) && quarter.evidence.length > 0), "validated quarters must include evidence");
  ensure(quarters.find((quarter) => quarter.id === ledger.cadence?.currentHorizonQuarter), "current horizon quarter must exist");
  ensure(quarters.find((quarter) => quarter.id === ledger.cadence?.nextReviewQuarter), "next review quarter must exist");
  ensureArrayIncludesAll(ledger.nextSafeActions, [
    "Expose this ledger in SEIS AI Core and Command Center as read-only evidence.",
  ], "ledger.nextSafeActions");
}

if (operatingModel) {
  ensure(operatingModel.sourceOfTruth?.reviewLedger === paths.ledger, "operating model must point to review ledger");
  ensure(operatingModel.sourceOfTruth?.versionRegistry === paths.versionRegistry, "operating model must point to version registry");
  ensure(operatingModel.sourceOfTruth?.versionPromotionGates === paths.versionPromotionGates, "operating model must point to version promotion gates");
  ensureArrayIncludesAll(operatingModel.evidenceRequirements, ["quarterly review ledger"], "operatingModel.evidenceRequirements");
}

if (runtimeFixtures) {
  ensure(runtimeFixtures.sourceOfTruth?.reviewLedger === paths.ledger, "runtime fixtures must point to review ledger");
  ensure(runtimeFixtures.sourceOfTruth?.versionRegistry === paths.versionRegistry, "runtime fixtures must point to version registry");
  ensure(runtimeFixtures.sourceOfTruth?.versionPromotionGates === paths.versionPromotionGates, "runtime fixtures must point to version promotion gates");
  ensure(runtimeFixtures.executionLedgerFixture?.reviewLedger === paths.ledger, "runtime fixtures execution ledger must point to review ledger");
}

if (pluginIntegration) {
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.reviewLedger === paths.ledger, "plugin integration must point to review ledger");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.versionRegistry === paths.versionRegistry, "plugin integration must point to version registry");
  ensure(pluginIntegration.fiveYearSubagentDevelopment?.versionPromotionGates === paths.versionPromotionGates, "plugin integration must point to version promotion gates");
  ensureArrayIncludesAll(pluginIntegration.runtimeIntegration?.mcpResources, [
    "seis://ai/version-registry.json",
    "seis://ai/version-promotion-gates.json",
    "seis://ai/subagent-review-ledger.json",
  ], "pluginIntegration.runtimeIntegration.mcpResources");
  ensureArrayIncludesAll(pluginIntegration.qualityCommands, [
    "npm run check:seis-ai-core-subagent-review-ledger",
    "npm run check:seis-ai-core-version-promotion-gates",
  ], "pluginIntegration.qualityCommands");
}

for (const [text, label] of [
  [aiCoreDoc, "SEIS AI Core docs"],
  [agentRuntimeDoc, "agent runtime docs"],
]) {
  for (const token of [
    "seis-ai-core-subagent-review-ledger.json",
    "seis-ai-core-version-promotion-gates.json",
    "quarterly review ledger",
    "seis_ai_core_version_promotion_dry_run",
    "seis_ai_core_subagent_review_ledger",
  ]) {
    ensure(text.includes(token), `${label} missing ${token}`);
  }
}

for (const [text, label] of [
  [helper, "helper"],
  [tools, "tool loop"],
  [mcp, "MCP server"],
]) {
  ensure(text.includes("SUBAGENT_REVIEW_LEDGER_TOOL"), `${label} must expose SUBAGENT_REVIEW_LEDGER_TOOL`);
}
ensure(helper.includes("subagentReviewLedgerStatus"), "helper must define subagentReviewLedgerStatus");
ensure(tools.includes("subagentReviewLedgerStatus"), "tool loop must call subagentReviewLedgerStatus");
ensure(mcp.includes("seis://ai/subagent-review-ledger.json"), "MCP server must expose review ledger resource");

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-ai-core-subagent-review-ledger"] ===
      "node scripts/check-seis-ai-core-subagent-review-ledger.mjs",
    "package.json must expose check:seis-ai-core-subagent-review-ledger"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-ai-core-subagent-review-ledger"),
    "quality:governance must include check:seis-ai-core-subagent-review-ledger"
  );
}

if (failures.length) {
  console.error("SEIS AI Core sub-agent review ledger check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS AI Core sub-agent review ledger check passed.");

function abs(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function assertUnique(values, label) {
  const filtered = values.filter(Boolean);
  ensure(new Set(filtered).size === filtered.length, `${label} must be unique`);
}

function readJson(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}
