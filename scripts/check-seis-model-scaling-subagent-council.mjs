#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  council: "content/development/seis-model-scaling-subagent-council.json",
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  parameterLadder: "content/development/seis-model-parameter-ladder.json",
  frontierPolicy: "content/development/seis-model-frontier-escalation-policy.json",
  frontierModelProgram: "content/development/seis-150b-frontier-model-program.json",
  apexModelProgram: "content/development/seis-512b-apex-model-program.json",
  benchmarkDryRun: "reports/seis-model-scaling/20b-benchmark-dry-run.json",
  benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json",
  modelCardTemplate: "content/development/seis-20b-model-card-template.json",
  datasetCardTemplate: "content/development/seis-20b-dataset-card-template.json",
  subagentOperatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
  scalingDoc: "docs/ai/seis-model-scaling.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  reviewDoc: "docs/reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md",
  nextPrQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(relativePath, label);
}

const council = readJson(paths.council, "model scaling sub-agent council");
const profile = readJson(paths.profile, "model scaling profile");
const frontierPolicy = readJson(paths.frontierPolicy, "frontier escalation policy");
const frontierModelProgram = readJson(paths.frontierModelProgram, "150B frontier model program");
const apexModelProgram = readJson(paths.apexModelProgram, "512B apex model program");
const subagentOperatingModel = readJson(paths.subagentOperatingModel, "sub-agent operating model");
const scalingDoc = readText(paths.scalingDoc, "model scaling docs");
const aiCoreDoc = readText(paths.aiCoreDoc, "AI Core docs");
const reviewDoc = readText(paths.reviewDoc, "foundation review");
const nextPrQueue = readText(paths.nextPrQueue, "next PR queue");
const helper = readText(paths.helper, "AI Core helper");
const packageJson = readJson(paths.packageJson, "package.json");

if (council) {
  ensure(council.id === "seis-model-scaling-subagent-council", "council id mismatch");
  ensure(council.status === "active-plan-only", "council status must stay active-plan-only");
  ensure(council.qualityGate === "npm run check:seis-model-scaling-subagent-council", "council qualityGate mismatch");
  ensure(council.runtimeBoundary === "status-and-plan-only", "council runtime boundary must stay status-and-plan-only");
  ensure(council.coreCredentialRequirement === "none", "council must require no core credential");
  ensure(council.defaultRuntimeMode === "seis-local-demo", "council default runtime mode must stay seis-local-demo");
  ensure(council.routeEligibleToday === false, "council must not grant route eligibility today");
  ensure(String(council.truthBoundary || "").includes("does not run agents"), "truth boundary must state no agents are run");
  ensure(String(council.truthBoundary || "").includes("download models"), "truth boundary must forbid model downloads");
  ensure(String(council.truthBoundary || "").includes("train"), "truth boundary must forbid training");
  ensure(String(council.truthBoundary || "").includes("benchmark memory"), "truth boundary must forbid benchmark claims");
  ensure(String(council.truthBoundary || "").includes("trained 20B, 70B, 150B, 512B, AGI"), "truth boundary must forbid trained-model and AGI ownership claims");

  ensure(council.sourceOfTruth?.modelScalingProfile === paths.profile, "council source modelScalingProfile mismatch");
  ensure(council.sourceOfTruth?.parameterLadder === paths.parameterLadder, "council source parameterLadder mismatch");
  ensure(council.sourceOfTruth?.frontierEscalationPolicy === paths.frontierPolicy, "council source frontierEscalationPolicy mismatch");
  ensure(council.sourceOfTruth?.frontierModelProgram === paths.frontierModelProgram, "council source frontierModelProgram mismatch");
  ensure(council.sourceOfTruth?.apexModelProgram === paths.apexModelProgram, "council source apexModelProgram mismatch");
  ensure(council.sourceOfTruth?.benchmarkDryRun === paths.benchmarkDryRun, "council source benchmarkDryRun mismatch");
  ensure(council.sourceOfTruth?.benchmarkManifest === paths.benchmarkManifest, "council source benchmarkManifest mismatch");
  ensure(council.sourceOfTruth?.modelCardTemplate === paths.modelCardTemplate, "council source modelCardTemplate mismatch");
  ensure(council.sourceOfTruth?.datasetCardTemplate === paths.datasetCardTemplate, "council source datasetCardTemplate mismatch");
  ensure(council.sourceOfTruth?.subagentOperatingModel === paths.subagentOperatingModel, "council source subagentOperatingModel mismatch");

  ensureArrayIncludesAll(
    (council.councilRules || []).map((rule) => rule.id),
    ["no-runtime-authority", "20b-first", "evidence-before-claim", "local-demo-fallback"],
    "councilRules"
  );
  ensure((council.councilRules || []).every((rule) => rule.status === "active"), "all council rules must be active");

  const agents = Array.isArray(council.agents) ? council.agents : [];
  ensure(agents.length === 12, "council must define exactly 12 agents");
  ensureArrayIncludesAll(
    agents.map((agent) => agent.id),
    [
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
    ],
    "agents"
  );
  for (const agent of agents) {
    ensure(agent.authority === "plan-only", `${agent.id}.authority must stay plan-only`);
    ensureNonEmpty(agent.primaryDuty, `${agent.id}.primaryDuty`);
    ensure(Array.isArray(agent.allowedActions) && agent.allowedActions.length >= 3, `${agent.id}.allowedActions must be populated`);
    ensure(Array.isArray(agent.forbiddenActions) && agent.forbiddenActions.length >= 3, `${agent.id}.forbiddenActions must be populated`);
    ensure(Array.isArray(agent.requiredEvidence) && agent.requiredEvidence.length >= 3, `${agent.id}.requiredEvidence must be populated`);
    ensureNonEmpty(agent.validationGate, `${agent.id}.validationGate`);
  }

  const stages = Array.isArray(council.stageAssignments) ? council.stageAssignments : [];
  ensureArrayIncludesAll(stages.map((stage) => stage.stage), ["20B", "70B", "150B", "512B", "highest-available-future"], "stageAssignments");
  ensure(stages.every((stage) => stage.routeEligibleToday === false), "all council stage assignments must keep routeEligibleToday false");
  ensure(stages.some((stage) => stage.stage === "20B" && stage.status === "planned-not-validated"), "20B stage must remain planned-not-validated");
  ensure(stages.some((stage) => stage.stage === "70B" && stage.status === "research-roadmap"), "70B stage must remain research-roadmap");
  ensure(stages.some((stage) => stage.stage === "150B" && stage.status === "frontier-research-roadmap"), "150B stage must remain frontier-research-roadmap");
  ensure(stages.some((stage) => stage.stage === "150B" && (stage.requiredBeforePromotion || []).includes("explicit human approval")), "150B stage must require explicit human approval");
  ensure(stages.some((stage) => stage.stage === "512B" && stage.status === "apex-program-plan-only"), "512B stage must remain apex-program-plan-only");
  ensure(stages.some((stage) => stage.stage === "512B" && (stage.leadAgents || []).length === 12), "512B stage must assign all 12 council agents");
  ensure(stages.some((stage) => stage.stage === "512B" && (stage.requiredBeforePromotion || []).includes("AGI capability evaluation protocol")), "512B stage must require AGI capability evaluation protocol");

  ensureArrayIncludesAll(council.forbiddenClaims, [
    "SEIS has trained a 20B foundation model.",
    "SEIS has trained a 70B foundation model.",
    "SEIS has trained a 150B foundation model.",
    "SEIS has trained a 512B foundation model.",
    "SEIS has achieved real AGI.",
    "SEIS has routeable 20B, 70B, 150B, or 512B weights.",
    "A plan-only sub-agent assignment is runtime evidence."
  ], "forbiddenClaims");
  ensureArrayIncludesAll(council.humanApprovalRequiredFor, [
    "model download",
    "dataset download",
    "runtime adapter execution",
    "benchmark execution",
    "training run",
    "fine-tuning run",
    "provider credential setup",
    "GPU or cloud provisioning",
    "SSH execution",
    "deployment",
    "route eligibility change",
    "public model or dataset release"
  ], "humanApprovalRequiredFor");
}

if (profile) {
  ensure(profile.sourceOfTruth?.modelScalingSubagentCouncil === paths.council, "model scaling profile must point to council");
}

if (frontierPolicy) {
  ensure((frontierPolicy.escalationStages || []).some((stage) => stage.id === "stage-3-150b-frontier"), "frontier policy must still include 150B stage");
  ensure((frontierPolicy.escalationStages || []).some((stage) => stage.id === "stage-4-512b-apex"), "frontier policy must include 512B apex stage");
}

if (frontierModelProgram) {
  ensure(frontierModelProgram.id === "seis-150b-frontier-model-program", "150B frontier model program id mismatch");
  ensure(frontierModelProgram.status === "frontier-program-plan-only", "150B frontier model program must remain plan-only");
  ensure(frontierModelProgram.routeEligibleToday === false, "150B frontier model program must stay route-ineligible");
}

if (apexModelProgram) {
  ensure(apexModelProgram.id === "seis-512b-apex-model-program", "512B apex model program id mismatch");
  ensure(apexModelProgram.status === "apex-program-plan-only", "512B apex model program must remain plan-only");
  ensure(apexModelProgram.routeEligibleToday === false, "512B apex model program must stay route-ineligible");
}

if (subagentOperatingModel) {
  ensure(
    subagentOperatingModel.sourceOfTruth?.modelScalingSubagentCouncil === paths.council,
    "sub-agent operating model must point to council"
  );
  ensure(
    (subagentOperatingModel.evidenceRequirements || []).includes("20B/70B/150B/512B model-scaling sub-agent council"),
    "sub-agent operating model evidenceRequirements must include council"
  );
}

for (const [text, label] of [
  [scalingDoc, "model scaling docs"],
  [aiCoreDoc, "AI Core docs"],
  [reviewDoc, "foundation review"],
  [nextPrQueue, "next PR queue"],
  [helper, "AI Core helper"]
]) {
  ensure(text.includes("seis-model-scaling-subagent-council"), `${label} must reference council id`);
  ensure(text.includes("content/development/seis-model-scaling-subagent-council.json"), `${label} must reference council path`);
  ensure(text.includes("seis-150b-frontier-model-program"), `${label} must reference 150B frontier model program id/path`);
  ensure(text.includes("seis-512b-apex-model-program"), `${label} must reference 512B apex model program id/path`);
}

ensure(helper.includes("modelScalingSubagentCouncil"), "AI Core helper must expose modelScalingSubagentCouncil");
ensure(helper.includes("frontierModelProgram"), "AI Core helper must expose frontierModelProgram");
ensure(helper.includes("apexModelProgram"), "AI Core helper must expose apexModelProgram");

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-model-scaling-subagent-council"] === "node scripts/check-seis-model-scaling-subagent-council.mjs",
    "package.json must expose check:seis-model-scaling-subagent-council"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-model-scaling-subagent-council"),
    "quality:governance must include council check"
  );
}

for (const [relativePath, label] of [
  [paths.council, "model scaling sub-agent council"],
  [paths.profile, "model scaling profile"],
  [paths.scalingDoc, "model scaling docs"]
]) {
  requireNoPrematureClaims(relativePath, label);
}

finish("SEIS model scaling sub-agent council check passed.");

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

function ensureNonEmpty(value, label) {
  ensure(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
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

function requireNoPrematureClaims(relativePath, label) {
  const text = readText(relativePath, label).replace(/\s+/g, " ").toLowerCase();
  const forbidden = [
    "trained 20b foundation model",
    "trained 70b foundation model",
    "trained 150b foundation model",
    "20b model is available",
    "70b model is available",
    "150b model is available",
    "20b inference is available",
    "70b inference is available",
    "150b inference is available",
    "production-ready 20b",
    "production-ready 150b"
  ];
  for (const phrase of forbidden) {
    ensure(!text.includes(phrase), `${label} contains premature claim phrase: ${phrase}`);
  }
}

function finish(message) {
  if (failures.length) {
    console.error("SEIS model scaling sub-agent council check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}
