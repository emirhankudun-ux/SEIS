#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  ladder: "content/development/seis-model-parameter-ladder.json",
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  modelCardTemplate: "content/development/seis-20b-model-card-template.json",
  datasetCardTemplate: "content/development/seis-20b-dataset-card-template.json",
  benchmarkDryRun: "reports/seis-model-scaling/20b-benchmark-dry-run.json",
  scalingDoc: "docs/ai/seis-model-scaling.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  modelRouterDoc: "docs/ai/model-router.md",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  mcpRuntimeContract: "content/development/seis-ai-core-mcp-runtime-contract.json",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  mcpSmokeTest: "packages/seis-ai/test/mcp-smoke.test.mjs",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(relativePath, label);
}

const ladder = readJson(paths.ladder, "parameter ladder");
const profile = readJson(paths.profile, "model scaling hardware profile");
const modelCardTemplate = readJson(paths.modelCardTemplate, "20B model card template");
const datasetCardTemplate = readJson(paths.datasetCardTemplate, "20B dataset card template");
const benchmarkDryRun = readJson(paths.benchmarkDryRun, "20B benchmark dry-run");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration manifest");
const mcpRuntimeContract = readJson(paths.mcpRuntimeContract, "MCP runtime contract");
const packageJson = readJson(paths.packageJson, "package.json");
const scalingDoc = readText(paths.scalingDoc, "model scaling docs");
const aiCoreDoc = readText(paths.aiCoreDoc, "AI Core docs");
const modelRouterDoc = readText(paths.modelRouterDoc, "model router docs");
const helper = readText(paths.helper, "AI Core helper");
const mcpServer = readText(paths.mcpServer, "MCP server");
const mcpSmokeTest = readText(paths.mcpSmokeTest, "MCP smoke test");

if (ladder) {
  ensure(ladder.id === "seis-model-parameter-ladder", "ladder id mismatch");
  ensure(ladder.status === "planning-contract-not-runtime", "ladder must stay planning-contract-not-runtime");
  ensure(ladder.resourceUri === "seis://ai/model-parameter-ladder.json", "ladder resourceUri mismatch");
  ensure(ladder.qualityGate === "npm run check:seis-model-parameter-ladder", "ladder qualityGate mismatch");
  ensure(ladder.coreCredentialRequirement === "none", "ladder coreCredentialRequirement must be none");
  ensure(ladder.defaultRoute === "seis-local-demo", "ladder default route must be Local Demo");
  ensure(ladder.routeEligibleToday === false, "ladder must not be route eligible today");
  ensure(String(ladder.truthBoundary || "").includes("creates no trained model"), "truth boundary must forbid trained model claims");
  ensure(String(ladder.truthBoundary || "").includes("runs no inference"), "truth boundary must forbid inference claims");
  ensure(String(ladder.truthBoundary || "").includes("calls no provider"), "truth boundary must forbid provider calls");
  ensure(String(ladder.truthBoundary || "").includes("executes no SSH"), "truth boundary must forbid SSH execution");
  ensure(String(ladder.truthBoundary || "").includes("does not claim SEIS owns 20B, 70B, 150B, 512B, AGI"), "truth boundary must forbid ownership and AGI claims");

  ensure(ladder.sourceOfTruth?.modelScalingProfile === paths.profile, "ladder source modelScalingProfile mismatch");
  ensure(ladder.sourceOfTruth?.modelCardTemplate === paths.modelCardTemplate, "ladder source modelCardTemplate mismatch");
  ensure(ladder.sourceOfTruth?.datasetCardTemplate === paths.datasetCardTemplate, "ladder source datasetCardTemplate mismatch");
  ensure(ladder.sourceOfTruth?.benchmarkDryRun === paths.benchmarkDryRun, "ladder source benchmarkDryRun mismatch");
  ensure(ladder.sourceOfTruth?.scalingDoc === paths.scalingDoc, "ladder source scalingDoc mismatch");

  const targets = Array.isArray(ladder.targets) ? ladder.targets : [];
  ensure(targets.length >= 6, "ladder must include at least six targets");
  ensureTarget(targets, {
    id: "seis-20b-16gb-plus-local-compatibility",
    parameterClass: "20B",
    parameterCountBillion: 20,
    status: "planned-not-validated",
    minimumRamClass: "16GB+ RAM",
    allowedToday: "Local Demo"
  });
  ensureTarget(targets, {
    id: "seis-70b-research-lane",
    parameterClass: "70B",
    parameterCountBillion: 70,
    status: "research-roadmap",
    minimumRamClass: "64GB+ RAM"
  });
  ensureTarget(targets, {
    id: "seis-150b-frontier-research-lane",
    parameterClass: "150B",
    parameterCountBillion: 150,
    status: "frontier-research-roadmap",
    minimumRamClass: "approved distributed"
  });
  ensureTarget(targets, {
    id: "seis-300b-plus-exploration-boundary",
    parameterClass: "300B+",
    parameterCountBillion: 300,
    status: "not-scoped",
    minimumRamClass: "not scoped"
  });
  ensureTarget(targets, {
    id: "seis-512b-agi-apex-research-lane",
    parameterClass: "512B",
    parameterCountBillion: 512,
    status: "apex-program-plan-only",
    minimumRamClass: "approved frontier-scale distributed research cluster only"
  });
  ensureTarget(targets, {
    id: "seis-highest-available-future-boundary",
    parameterClass: "highest-available-future",
    parameterCountBillion: null,
    status: "not-scoped",
    minimumRamClass: "defined only after measured lower-tier evidence"
  });

  for (const target of targets) {
    ensure(target.trainingStatus === "not-started", `${target.id} trainingStatus must stay not-started`);
    ensure(target.weightsAvailable === false, `${target.id} weightsAvailable must stay false`);
    ensure(target.inferenceAvailable === false, `${target.id} inferenceAvailable must stay false`);
    ensure(target.benchmarkEvidenceAvailable === false, `${target.id} benchmarkEvidenceAvailable must stay false`);
    ensure(target.routeEligibleToday === false, `${target.id} routeEligibleToday must stay false`);
    ensure(target.runtimeAuthority === false, `${target.id} runtimeAuthority must stay false`);
    ensure(target.productionReady === false, `${target.id} productionReady must stay false`);
    ensure(Array.isArray(target.evidenceRequiredBeforeRoute) && target.evidenceRequiredBeforeRoute.length >= 6, `${target.id} evidenceRequiredBeforeRoute must be populated`);
  }

  ensureArrayIncludesAll(
    (ladder.ramCompatibilityPolicy || []).map((item) => item.ramClass),
    ["16GB+", "32GB+", "64GB+", "distributed"],
    "ramCompatibilityPolicy.ramClass"
  );
  ensure((ladder.ramCompatibilityPolicy || []).every((item) => item.routeEligibleToday === false), "ramCompatibilityPolicy entries must not be route eligible");
  ensureArrayIncludesAll(ladder.promotionOrder, ["local-demo", "20B", "70B", "150B", "300B+", "512B", "highest-available-future"], "promotionOrder");
  ensureArrayIncludesAll(ladder.forbiddenClaims, [
    "SEIS has trained a 20B foundation model.",
    "SEIS has trained a 70B foundation model.",
    "SEIS has trained a 150B foundation model.",
    "SEIS has trained a 512B foundation model.",
    "SEIS has achieved real AGI.",
    "SEIS has routeable 20B, 70B, 150B, 512B, AGI, or frontier weights today.",
    "16GB+ compatibility is verified before measured benchmark evidence exists."
  ], "forbiddenClaims");
  ensureArrayIncludesAll(ladder.humanApprovalRequiredFor, [
    "model download",
    "dataset download",
    "runtime adapter setup",
    "training run",
    "benchmark execution",
    "paid GPU or cloud provisioning",
    "SSH execution",
    "deployment",
    "provider credential setup",
    "route eligibility change"
  ], "humanApprovalRequiredFor");
}

if (profile) {
  ensure(profile.sourceOfTruth?.parameterLadder === paths.ladder, "model scaling profile must point to parameter ladder");
  ensure((profile.scaleLadder || []).some((item) => item.parameterClass === "20B"), "profile scale ladder missing 20B");
  ensure((profile.scaleLadder || []).some((item) => item.parameterClass === "70B"), "profile scale ladder missing 70B");
  ensure((profile.scaleLadder || []).some((item) => item.parameterClass === "150B"), "profile scale ladder missing 150B");
  ensure((profile.scaleLadder || []).some((item) => item.parameterClass === "512B"), "profile scale ladder missing 512B");
  ensure((profile.scaleLadder || []).some((item) => item.parameterClass === "highest-available-future"), "profile scale ladder missing highest future");
}

if (modelCardTemplate) {
  ensure(modelCardTemplate.status === "template-not-filled", "model card template must remain unfilled");
  ensure(modelCardTemplate.routeEligibleToday === false, "model card template must not be route eligible");
}

if (datasetCardTemplate) {
  ensure(datasetCardTemplate.status === "template-not-filled", "dataset card template must remain unfilled");
  ensure(datasetCardTemplate.trainingAuthorized === false, "dataset card template must not authorize training");
}

if (benchmarkDryRun) {
  ensure(benchmarkDryRun.status === "dry-run-not-measured", "benchmark dry-run must stay dry-run-not-measured");
  ensure(benchmarkDryRun.dryRunResult?.routeEligibleToday === false, "benchmark dry-run must not make 20B route eligible");
}

if (pluginIntegration) {
  ensureArrayIncludesAll(pluginIntegration.runtimeIntegration?.mcpResources, [
    "seis://ai/model-parameter-ladder.json",
    "seis://ai/150b-frontier-model-program.json",
    "seis://ai/agi-evaluation-protocol.json"
  ], "pluginIntegration.runtimeIntegration.mcpResources");
  ensureArrayIncludesAll(pluginIntegration.qualityCommands, [
    "npm run check:seis-model-parameter-ladder"
  ], "pluginIntegration.qualityCommands");
}

if (mcpRuntimeContract) {
  ensure(mcpRuntimeContract.resourceCount === 29, "MCP runtime contract must record 29 resources");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("parameter ladder"), "MCP resource evidence must mention parameter ladder");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI evaluation protocol"), "MCP resource evidence must mention AGI evaluation protocol");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI public readiness evidence"), "MCP resource evidence must mention AGI public readiness evidence");
  ensure(String(mcpRuntimeContract.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI GitHub user readiness gates"), "MCP resource evidence must mention AGI GitHub user readiness gates");
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-model-parameter-ladder"] === "node scripts/check-seis-model-parameter-ladder.mjs",
    "package.json must expose check:seis-model-parameter-ladder"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-model-parameter-ladder"),
    "quality:governance must include check:seis-model-parameter-ladder"
  );
}

for (const [text, label] of [
  [scalingDoc, "model scaling docs"],
  [aiCoreDoc, "AI Core docs"],
  [modelRouterDoc, "model router docs"],
  [helper, "AI Core helper"],
  [mcpServer, "MCP server"],
  [mcpSmokeTest, "MCP smoke test"]
]) {
  ensure(text.includes("seis-model-parameter-ladder"), `${label} must reference seis-model-parameter-ladder`);
  ensure(text.includes("seis://ai/model-parameter-ladder.json"), `${label} must reference model parameter ladder resource URI`);
}

ensure(helper.includes("parameterLadder"), "AI Core helper must expose parameterLadder");
ensure(mcpServer.includes("ai-core-model-parameter-ladder"), "MCP server must expose model parameter ladder resource");

finish("SEIS model parameter ladder check passed.");

function ensureTarget(targets, expected) {
  const target = targets.find((entry) => entry.id === expected.id);
  ensure(Boolean(target), `target missing: ${expected.id}`);
  if (!target) return;
  ensure(target.parameterClass === expected.parameterClass, `${expected.id}.parameterClass mismatch`);
  ensure(target.parameterCountBillion === expected.parameterCountBillion, `${expected.id}.parameterCountBillion mismatch`);
  ensure(target.status === expected.status, `${expected.id}.status mismatch`);
  ensure(String(target.minimumRamClass || "").includes(expected.minimumRamClass), `${expected.id}.minimumRamClass mismatch`);
  if (expected.allowedToday) {
    ensure(String(target.allowedToday || "").includes(expected.allowedToday), `${expected.id}.allowedToday mismatch`);
  }
}

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
    console.error("SEIS model parameter ladder check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
