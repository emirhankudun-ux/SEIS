#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  plan: "content/development/seis-ai-workforce-training-plan.json",
  docs: "docs/ai/ai-workforce-training.md",
  aiCore: "docs/ai/seis-ai-core.md",
  workforce: "content/development/ai-workforce-assignments.json",
  providerRegistry: "content/development/seis-ai-core-provider-registry.json",
  languageModelIntakeRegistry: "content/development/seis-language-model-intake-registry.json",
  modelFamilyRegistry: "packages/seis-ai/models/seis-model-family-registry.json",
  modelPromotionPolicy: "packages/seis-ai/models/seis-model-promotion-policy.json",
  modelBenchmarkSuite: "packages/seis-ai/models/seis-model-benchmark-suite.json"
};

for (const [label, filePath] of Object.entries(files)) {
  ensureFile(filePath, label);
}

const plan = readJson(files.plan, "training plan");
const docs = readText(files.docs, "training docs");
const aiCore = readText(files.aiCore, "AI Core docs");
const workforce = readJson(files.workforce, "workforce assignments");
const providerRegistry = readJson(files.providerRegistry, "provider registry");
const languageModelIntakeRegistry = readJson(files.languageModelIntakeRegistry, "language model intake registry");
const promotionPolicy = readJson(files.modelPromotionPolicy, "model promotion policy");

if (plan) {
  ensure(plan.id === "seis-ai-workforce-training-plan", "plan id must be seis-ai-workforce-training-plan");
  ensure(plan.status === "active-local-seed-training-contract", "plan status must be active-local-seed-training-contract");
  ensure(plan.qualityGate === "npm run check:seis-ai-workforce-training", "plan qualityGate must point to package script");
  ensure(plan.automationCommand === "npm run automation:seis-ai-workforce-training", "plan automation command must be declared");
  ensure(String(plan.truthBoundary || "").includes("no live provider calls"), "truth boundary must forbid live provider calls");
  ensure(String(plan.truthBoundary || "").includes("no cloud fine-tuning"), "truth boundary must forbid cloud fine-tuning");
  ensure(String(plan.trainingMeaning?.currentMeaning || "").includes("deterministic seed-model"), "training meaning must use deterministic seed-model language");
  ensure(plan.sourceOfTruth?.languageModelIntakeRegistry === files.languageModelIntakeRegistry, "plan sourceOfTruth must link language model intake registry");
  ensureArrayWithMinimum(plan.trainingMeaning?.notMeaning, 6, "trainingMeaning.notMeaning");

  for (const phrase of ["cloud provider fine-tuning", "foundation model ownership", "dataset scraping or download", "secret-bearing prompt sharing"]) {
    ensure(plan.trainingMeaning.notMeaning.includes(phrase), `trainingMeaning.notMeaning missing: ${phrase}`);
  }

  const installedRoutes = new Set(plan.currentLauncherEvidence?.installedRoutes || []);
  for (const route of ["seis-agent", "codex", "qwen", "ollama", "opencode", "hermes", "goose", "open-design"]) {
    ensure(installedRoutes.has(route), `installed route inventory missing: ${route}`);
  }

  ensureArrayWithMinimum(plan.trainerRoles, 8, "trainerRoles");
  const trainerRoles = new Map((plan.trainerRoles || []).map((role) => [role.id, role]));
  for (const id of ["codex", "seis-agent", "qwen", "ollama", "opencode", "hermes", "goose", "open-design"]) {
    ensure(trainerRoles.has(id), `trainer role missing: ${id}`);
  }
  for (const role of plan.trainerRoles || []) {
    ensure(role.secretAccessAllowed === false, `${role.id}: secret access must be false`);
    ensure(role.liveProviderCallAllowed === false, `${role.id}: live provider calls must be false`);
    ensure(role.externalTrainingAllowed === false, `${role.id}: external training must be false`);
    ensureNonEmptyString(role.allowedContribution, `${role.id}.allowedContribution`);
    ensureNonEmptyString(role.outputStatus, `${role.id}.outputStatus`);
  }

  const loopIds = new Set((plan.trainingLoops || []).map((loop) => loop.id));
  for (const id of [
    "intake_sanitization",
    "installed_ai_review",
    "language_model_intake_review",
    "dataset_candidate_review",
    "deterministic_seed_rebuild",
    "promotion_gate_review",
    "human_handoff"
  ]) {
    ensure(loopIds.has(id), `training loop missing: ${id}`);
  }

  const targets = new Map((plan.modelTargets || []).map((target) => [target.id, target]));
  for (const id of ["permission-policy", "memory-ranker", "eval-critic", "agent-router"]) {
    const target = targets.get(id);
    ensure(Boolean(target), `model target missing: ${id}`);
    if (!target) continue;
    ensureFile(target.datasetPath, `${id} dataset`);
    ensureFile(target.artifactPath, `${id} artifact`);
    ensure(String(target.trainingCommand || "").startsWith("npm run automation:"), `${id}: training command must use npm automation`);
    ensure(String(target.validationCommand || "").startsWith("npm run check:"), `${id}: validation command must use npm check`);
    ensure(target.runtimeAuthority === false, `${id}: runtime authority must remain false`);
  }

  ensureArrayWithMinimum(plan.safetyRules, 8, "safetyRules");
  for (const phrase of [
    "No secrets",
    "No browser code",
    "No cloud fine-tuning",
    "Installed AI output is untrusted",
    "SEIS-owned synthetic examples",
    "zero-key",
    "Fallback identity",
    "runtime authority false"
  ]) {
    ensure(plan.safetyRules.some((rule) => String(rule).includes(phrase)), `safety rule missing phrase: ${phrase}`);
  }

  for (const gate of [
    "no-secret-material",
    "no-live-provider-call",
    "zero-key-core",
    "seis-owned-synthetic-data-only",
    "seed-artifacts-rebuilt",
    "benchmark-suite-passes",
    "promotion-policy-no-runtime-authority",
    "human-approval-boundaries-documented"
  ]) {
    ensure(plan.acceptanceGates?.includes(gate), `acceptance gate missing: ${gate}`);
  }
}

if (languageModelIntakeRegistry) {
  ensure(languageModelIntakeRegistry.id === "seis-language-model-intake-registry", "language model intake registry id mismatch");
  ensure(languageModelIntakeRegistry.status === "active-intake-contract", "language model intake registry status mismatch");
  ensure(languageModelIntakeRegistry.installPolicy?.bulkInstallAllowed === false, "language model intake must forbid bulk installs");
  ensure(languageModelIntakeRegistry.installPolicy?.downloadAuthorized === false, "language model intake must forbid downloads by default");
  ensure(languageModelIntakeRegistry.installPolicy?.trainingAuthorized === false, "language model intake must forbid training by default");
  ensure(languageModelIntakeRegistry.installPolicy?.datasetDownloadAuthorized === false, "language model intake must forbid dataset downloads by default");
  ensure((languageModelIntakeRegistry.candidateModelFamilies || []).length >= 8, "language model intake must list candidate model families");
  ensure((languageModelIntakeRegistry.trainingLanes || []).some((lane) => lane.id === "repo-local-seed-models" && lane.allowedToday === true), "language model intake must keep repo-local seed training as the active lane");
  ensure((languageModelIntakeRegistry.trainingLanes || []).some((lane) => lane.id === "foundation-pretraining" && lane.status === "disabled"), "language model intake must keep foundation pretraining disabled");
}

if (workforce) {
  ensure(workforce.id === "seis-ai-workforce-assignments", "workforce assignment id mismatch");
  ensure(workforce.writerPolicy?.primaryWriter === "codex", "Codex must remain workforce primary writer");
  ensure(workforce.approvalRequiredFor?.includes("model training"), "workforce approvals must include model training");
  ensure(workforce.approvalRequiredFor?.includes("dataset download"), "workforce approvals must include dataset download");
}

if (providerRegistry) {
  ensure(providerRegistry.coreCredentialRequirement === "none", "core credential requirement must remain none");
  ensure(providerRegistry.defaultRoutingMode === "local-demo", "default routing mode must remain local-demo");
  ensure(providerRegistry.localOnlyRespected === true, "local-only mode must be respected");
}

if (promotionPolicy) {
  ensure(promotionPolicy.totals?.runtimeAuthorityCount === 0, "promotion policy must grant zero runtime authority");
  ensure(promotionPolicy.totals?.productionBlockedCount === promotionPolicy.totals?.modelCount, "all seed models must remain production-blocked");
}

if (docs) {
  for (const phrase of [
    "installed AI workforce",
    "not cloud fine-tuning",
    "npm run check:seis-ai-workforce-training",
    "npm run automation:seis-ai-workforce-training",
    "Language Model Intake Registry",
    "Runtime authority remains false",
    "Secondary AI output is candidate evidence"
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

if (aiCore) {
  ensure(aiCore.includes("AI Workforce Training"), "AI Core docs must link AI Workforce Training");
  ensure(aiCore.includes("seis-ai-workforce-training-plan.json"), "AI Core docs must mention the training plan record");
}

finish("SEIS AI workforce training check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  if (!relativePath || !fs.existsSync(path.join(root, relativePath)) || !fs.statSync(path.join(root, relativePath)).isFile()) {
    failures.push(`${label} missing: ${relativePath}`);
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

function ensureArrayWithMinimum(candidate, minimum, label) {
  ensure(Array.isArray(candidate) && candidate.length >= minimum, `${label} must include at least ${minimum} entries`);
}

function ensureNonEmptyString(candidate, label) {
  ensure(typeof candidate === "string" && candidate.trim().length > 0, `${label} must be a non-empty string`);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS AI workforce training check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
