#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  policy: "content/development/seis-model-frontier-escalation-policy.json",
  frontierModelProgram: "content/development/seis-150b-frontier-model-program.json",
  apexModelProgram: "content/development/seis-512b-apex-model-program.json",
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  scalingDoc: "docs/ai/seis-model-scaling.md",
  benchmarkDryRun: "reports/seis-model-scaling/20b-benchmark-dry-run.json",
  benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json",
  modelCardTemplate: "content/development/seis-20b-model-card-template.json",
  datasetCardTemplate: "content/development/seis-20b-dataset-card-template.json",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(relativePath, label);
}

const policy = readJson(paths.policy, "frontier escalation policy");
const profile = readJson(paths.profile, "model scaling profile");
const benchmarkDryRun = readJson(paths.benchmarkDryRun, "20B benchmark dry-run report");
const scalingDoc = readText(paths.scalingDoc, "model scaling docs");
const helper = readText(paths.helper, "AI Core helper");
const packageJson = readJson(paths.packageJson, "package.json");

if (policy) {
  ensure(policy.id === "seis-model-frontier-escalation-policy", "policy id mismatch");
  ensure(policy.status === "policy-active-research-gated", "policy status must stay policy-active-research-gated");
  ensure(policy.resourceUri === "seis://ai/model-frontier-escalation-policy.json", "policy resourceUri mismatch");
  ensure(policy.qualityGate === "npm run check:seis-model-frontier-escalation-policy", "policy qualityGate mismatch");
  ensure(policy.coreCredentialRequirement === "none", "policy must require no core credential");
  ensure(policy.defaultRuntimeMode === "local-demo", "policy default runtime mode must stay local-demo");
  ensure(policy.routeEligibleToday === false, "policy must not grant route eligibility today");
  ensure(String(policy.truthBoundary || "").includes("does not download models"), "policy truthBoundary must forbid model downloads");
  ensure(String(policy.truthBoundary || "").includes("run inference"), "policy truthBoundary must forbid inference claims");
  ensure(String(policy.truthBoundary || "").includes("train"), "policy truthBoundary must forbid training claims");
  ensure(String(policy.truthBoundary || "").includes("benchmark memory"), "policy truthBoundary must forbid benchmark claims");
  ensure(String(policy.truthBoundary || "").includes("trained 20B, 70B, 150B, 512B, AGI"), "policy truthBoundary must forbid model ownership and AGI claims");

  ensure(policy.sourceOfTruth?.modelScalingProfile === paths.profile, "policy source modelScalingProfile mismatch");
  ensure(policy.sourceOfTruth?.frontierModelProgram === paths.frontierModelProgram, "policy source frontierModelProgram mismatch");
  ensure(policy.sourceOfTruth?.apexModelProgram === paths.apexModelProgram, "policy source apexModelProgram mismatch");
  ensure(policy.sourceOfTruth?.modelScalingDoc === paths.scalingDoc, "policy source modelScalingDoc mismatch");
  ensure(policy.sourceOfTruth?.benchmarkDryRun === paths.benchmarkDryRun, "policy source benchmarkDryRun mismatch");
  ensure(policy.sourceOfTruth?.benchmarkManifest === paths.benchmarkManifest, "policy source benchmarkManifest mismatch");
  ensure(policy.sourceOfTruth?.modelCardTemplate === paths.modelCardTemplate, "policy source modelCardTemplate mismatch");
  ensure(policy.sourceOfTruth?.datasetCardTemplate === paths.datasetCardTemplate, "policy source datasetCardTemplate mismatch");

  const rules = Array.isArray(policy.decisionRules) ? policy.decisionRules : [];
  ensure(rules.some((rule) => rule.id === "no-skip-20b" && rule.enforcedStatus === "blocked"), "policy must block skipping 20B gates");
  ensure(rules.some((rule) => rule.id === "no-silent-provider-fallback" && rule.enforcedStatus === "active"), "policy must block silent provider fallback");
  ensure(rules.some((rule) => rule.id === "human-approval-before-real-runtime" && rule.enforcedStatus === "active"), "policy must require human approval before runtime");
  ensure(rules.some((rule) => rule.id === "evidence-before-ownership" && rule.enforcedStatus === "active"), "policy must require evidence before ownership claims");

  const stages = Array.isArray(policy.escalationStages) ? policy.escalationStages : [];
  ensure(stages.length >= 5, "policy must include at least five escalation stages");
  ensure(stages.some((stage) => stage.id === "stage-0-local-demo" && stage.parameterClass === "demo-only" && stage.allowedToday === true && stage.routeEligibleToday === true), "policy must keep Local Demo as the only active route");
  ensure(stages.some((stage) => stage.id === "stage-1-20b-local-compatibility" && stage.parameterClass === "20B" && stage.status === "planned-not-validated" && stage.allowedToday === false && stage.routeEligibleToday === false), "policy must include blocked 20B stage");
  ensure(stages.some((stage) => stage.id === "stage-2-70b-research" && stage.parameterClass === "70B" && stage.status === "research-roadmap" && stage.allowedToday === false && stage.routeEligibleToday === false), "policy must include blocked 70B research stage");
  ensure(stages.some((stage) => stage.id === "stage-3-150b-frontier" && stage.parameterClass === "150B" && stage.status === "frontier-research-roadmap" && stage.allowedToday === false && stage.routeEligibleToday === false), "policy must include blocked 150B frontier stage");
  ensure(stages.some((stage) => stage.id === "stage-4-512b-apex" && stage.parameterClass === "512B" && stage.status === "apex-program-plan-only" && stage.allowedToday === false && stage.routeEligibleToday === false), "policy must include blocked 512B apex stage");
  ensure(stages.some((stage) => stage.id === "stage-5-highest-available-future" && stage.parameterClass === "highest-available-future" && stage.status === "not-scoped" && stage.allowedToday === false && stage.routeEligibleToday === false), "policy must include not-scoped highest future stage");
  ensure(stages.every((stage) => stage.parameterClass === "demo-only" || stage.routeEligibleToday === false), "non-demo stages must not be route eligible");

  const stage20b = stages.find((stage) => stage.id === "stage-1-20b-local-compatibility") || {};
  ensureArrayIncludesAll(stage20b.requiredEvidenceBeforeNext, [
    "human-approved model artifact selection",
    "filled 20B model card with clean-room provenance",
    "measured 16GB+ memory benchmark",
    "local-only fallback proof",
    "redacted runtime logs",
    "safety and regression evaluation summary"
  ], "20B stage requiredEvidenceBeforeNext");

  const stage70b = stages.find((stage) => stage.id === "stage-2-70b-research") || {};
  ensureArrayIncludesAll(stage70b.requiredEvidenceBeforeNext, [
    "20B gate evidence reviewed and accepted",
    "70B hardware and cost plan",
    "independent evaluation suite",
    "privacy and safety review",
    "explicit human approval"
  ], "70B stage requiredEvidenceBeforeNext");

  const stage150b = stages.find((stage) => stage.id === "stage-3-150b-frontier") || {};
  ensureArrayIncludesAll(stage150b.requiredEvidenceBeforeNext, [
    "20B and 70B gate evidence reviewed and accepted",
    "clean-room training plan",
    "distributed runtime budget",
    "dataset provenance and contamination-control plan",
    "safety evaluation and red-team plan",
    "observability and kill-switch plan",
    "rollback and cost-stop plan",
    "explicit human approval"
  ], "150B stage requiredEvidenceBeforeNext");

  const stage512b = stages.find((stage) => stage.id === "stage-4-512b-apex") || {};
  ensureArrayIncludesAll(stage512b.requiredEvidenceBeforeNext, [
    "20B, 70B, 150B, and 300B+ gate evidence reviewed and accepted",
    "clean-room 512B training plan",
    "frontier-scale distributed runtime budget",
    "AGI capability evaluation protocol",
    "safety evaluation and red-team plan",
    "observability and kill-switch plan",
    "rollback and cost-stop plan",
    "all installed AI and sub-agent council review recorded",
    "explicit human approval"
  ], "512B stage requiredEvidenceBeforeNext");

  ensureArrayIncludesAll(policy.requiredGlobalEvidence, [
    "dataset provenance",
    "training or fine-tuning logs before any training claim",
    "checkpoint governance before any checkpoint claim",
    "model card before any model ownership claim",
    "evaluation report before any benchmark claim"
  ], "requiredGlobalEvidence");

  ensureArrayIncludesAll(policy.forbiddenClaims, [
    "SEIS has trained a 20B foundation model.",
    "SEIS has trained a 70B foundation model.",
    "SEIS has trained a 150B foundation model.",
    "SEIS has trained a 512B foundation model.",
    "SEIS has achieved real AGI.",
    "SEIS has routeable 20B weights.",
    "SEIS has routeable 70B weights.",
    "SEIS has routeable 150B weights.",
    "SEIS has routeable 512B weights.",
    "SEIS has benchmarked 512B or AGI capability.",
    "SEIS can skip 20B evidence and move directly to 70B, 150B, or 512B runtime scope."
  ], "forbiddenClaims");

  ensureArrayIncludesAll(policy.humanApprovalRequiredFor, [
    "model download",
    "dataset download",
    "runtime adapter execution",
    "benchmark execution",
    "training run",
    "fine-tuning run",
    "checkpoint publication",
    "provider credential setup",
    "GPU or cloud provisioning",
    "SSH execution",
    "deployment",
    "public model or dataset release"
  ], "humanApprovalRequiredFor");

  ensure(policy.fallbackPolicy?.fallbackRuntime === "seis-local-demo", "fallback runtime must be seis-local-demo");
  ensure(policy.fallbackPolicy?.silentCloudFallbackAllowed === false, "silent cloud fallback must be blocked");
  ensure(policy.fallbackPolicy?.missingKeyIsError === false, "missing key must not be treated as error");
  ensure(policy.fallbackPolicy?.providerAndModelMustBeVisible === true, "provider/model visibility must be required");
  ensure(policy.fallbackPolicy?.localOnlyModeMustBeRespected === true, "local-only mode must be respected");
}

if (profile) {
  ensure(profile.sourceOfTruth?.frontierEscalationPolicy === paths.policy, "profile sourceOfTruth.frontierEscalationPolicy mismatch");
}

if (benchmarkDryRun) {
  ensure(String(benchmarkDryRun.truthBoundary || "").includes("20B/70B/150B route eligibility claims"), "benchmark dry-run must keep 20B/70B/150B route eligibility non-claim");
}

for (const token of [
  "Frontier Escalation Policy",
  "content/development/seis-model-frontier-escalation-policy.json",
  "seis://ai/model-frontier-escalation-policy.json",
  "npm run check:seis-model-frontier-escalation-policy",
  "content/development/seis-150b-frontier-model-program.json",
  "seis://ai/150b-frontier-model-program.json",
  "npm run check:seis-150b-frontier-model-program",
  "no-skip-20b",
  "stage-3-150b-frontier"
]) {
  ensure(scalingDoc.includes(token), `model scaling docs missing ${token}`);
}

for (const token of [
  "AI_CORE_MODEL_FRONTIER_ESCALATION_POLICY_PATH",
  "AI_CORE_MODEL_FRONTIER_ESCALATION_POLICY_RESOURCE_URI",
  "AI_CORE_150B_FRONTIER_MODEL_PROGRAM_PATH",
  "frontierEscalationPolicy",
  "frontierModelProgram",
  "seis-model-frontier-escalation-policy.json"
]) {
  ensure(helper.includes(token), `AI Core helper missing ${token}`);
}

ensure(helper.includes("seis://ai/model-frontier-escalation-policy.json"), "AI Core helper must expose frontier escalation policy MCP resource URI");

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-model-frontier-escalation-policy"] === "node scripts/check-seis-model-frontier-escalation-policy.mjs",
    "package.json must expose check:seis-model-frontier-escalation-policy"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-model-frontier-escalation-policy"),
    "quality:governance must include frontier escalation policy check"
  );
}

for (const [relativePath, label] of [
  [paths.policy, "frontier escalation policy"],
  [paths.profile, "model scaling profile"],
  [paths.scalingDoc, "model scaling docs"]
]) {
  requireNoPrematureClaims(relativePath, label);
}

finish("SEIS model frontier escalation policy check passed.");

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

function requireNoPrematureClaims(relativePath, label) {
  const text = readText(relativePath, label);
  const restricted = [
    "20B route eligibility verified",
    "70B route eligibility verified",
    "150B route eligibility verified",
    "16GB+ compatibility is verified",
    "production-ready 20B",
    "production-ready 70B",
    "production-ready 150B",
    "SEIS owns a trained 20B foundation model",
    "SEIS owns a trained 70B foundation model",
    "SEIS owns a trained 150B foundation model"
  ];
  for (const phrase of restricted) {
    if (text.includes(phrase)) {
      failures.push(`${label} must not include premature claim: ${phrase}`);
    }
  }
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error(`SEIS model frontier escalation policy check failed (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
