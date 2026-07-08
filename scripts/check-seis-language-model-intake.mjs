#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  registry: "content/development/seis-language-model-intake-registry.json",
  trainingPlan: "content/development/seis-ai-workforce-training-plan.json",
  localAiRuntimeMatrix: "content/development/seis-local-ai-runtime-matrix.json",
  localAiRuntimeMatrixReport: "reports/seis-model-scaling/seis-local-ai-runtime-matrix.json",
  localAiRuntimeMatrixMarkdown: "reports/seis-model-scaling/seis-local-ai-runtime-matrix.md",
  localAiRuntimeMatrixDocs: "docs/ai/seis-local-ai-runtime-matrix.md",
  trainingDoc: "docs/ai/ai-workforce-training.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  modelScalingDoc: "docs/ai/seis-model-scaling.md",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(files)) {
  ensureFile(relativePath, label);
}

const registry = readJson(files.registry, "language model intake registry");
const trainingPlan = readJson(files.trainingPlan, "AI workforce training plan");
const localAiRuntimeMatrix = readJson(files.localAiRuntimeMatrix, "local AI runtime matrix");
const localAiRuntimeMatrixReport = readJson(files.localAiRuntimeMatrixReport, "local AI runtime matrix report");
const localAiRuntimeMatrixMarkdown = readText(files.localAiRuntimeMatrixMarkdown, "local AI runtime matrix markdown");
const localAiRuntimeMatrixDocs = readText(files.localAiRuntimeMatrixDocs, "local AI runtime matrix docs");
const trainingDoc = readText(files.trainingDoc, "AI workforce training docs");
const aiCoreDoc = readText(files.aiCoreDoc, "AI Core docs");
const modelScalingDoc = readText(files.modelScalingDoc, "model scaling docs");
const packageJson = readJson(files.packageJson, "package.json");

if (registry) {
  ensure(registry.id === "seis-language-model-intake-registry", "registry id mismatch");
  ensure(registry.status === "active-intake-contract", "registry status must be active-intake-contract");
  ensure(registry.qualityGate === "npm run check:seis-language-model-intake", "registry qualityGate mismatch");
  ensure(String(registry.truthBoundary || "").includes("installs no models"), "truth boundary must forbid installs");
  ensure(String(registry.truthBoundary || "").includes("trains no foundation model"), "truth boundary must forbid foundation model training");
  ensure(String(registry.truthBoundary || "").includes("proves no AGI capability"), "truth boundary must forbid AGI proof claims");

  const installPolicy = registry.installPolicy || {};
  for (const [field, expected] of Object.entries({
    bulkInstallAllowed: false,
    downloadAuthorized: false,
    runtimeAuthorityGranted: false,
    providerCallAuthorized: false,
    trainingAuthorized: false,
    fineTuningAuthorized: false,
    adapterTrainingAuthorized: false,
    datasetDownloadAuthorized: false,
    secretReadAllowed: false,
    browserSecretAllowed: false
  })) {
    ensure(installPolicy[field] === expected, `installPolicy.${field} must remain ${expected}`);
  }

  ensureArrayIncludesAll(registry.requiredBeforeAnyModelInstall, [
    "human approval for the specific model id and quantization",
    "license and acceptable-use review",
    "checkpoint source, checksum, and provenance record",
    "rollback and deletion plan"
  ], "requiredBeforeAnyModelInstall");

  ensureArrayIncludesAll(registry.requiredBeforeAnyTraining, [
    "completed dataset card with source inventory and license map",
    "PII, secrets, credentials, and private-data scan",
    "clean-room provenance statement",
    "eval suite and held-out benchmark definition",
    "checkpoint governance and model card",
    "human approval recorded before execution"
  ], "requiredBeforeAnyTraining");

  const sources = new Set((registry.sourceResearch || []).map((source) => source.id));
  for (const id of ["ollama-library", "huggingface-transformers", "meta-llama-3-1"]) {
    ensure(sources.has(id), `sourceResearch missing ${id}`);
  }

  const families = new Map((registry.candidateModelFamilies || []).map((family) => [family.id, family]));
  for (const id of [
    "llama",
    "qwen",
    "gemma",
    "mistral",
    "deepseek",
    "openai-open-weight",
    "embedding-and-reranker",
    "code-specialist"
  ]) {
    const family = families.get(id);
    ensure(Boolean(family), `candidate model family missing: ${id}`);
    if (!family) continue;
    ensure(family.allowedToday === "metadata-only", `${id}: allowedToday must remain metadata-only`);
    ensure(family.installState === "not-installed-by-registry", `${id}: installState must stay not-installed-by-registry`);
    ensure(family.trainingUse === "not-authorized", `${id}: trainingUse must stay not-authorized`);
    ensure(String(family.licenseReviewStatus || "").includes("required"), `${id}: license review must be required`);
  }

  const hardwareLanes = new Map((registry.hardwareInstallLanes || []).map((lane) => [lane.id, lane]));
  ensure(hardwareLanes.get("developer-16gb")?.allowedToday === "metadata and deterministic seed-model lab only", "16GB lane must remain metadata/seed-model only");
  ensure((hardwareLanes.get("developer-16gb")?.blockedClasses || []).includes("512B"), "16GB lane must block 512B");
  ensure(hardwareLanes.get("frontier-distributed")?.allowedToday === "disabled", "frontier distributed lane must remain disabled");

  const trainingLanes = new Map((registry.trainingLanes || []).map((lane) => [lane.id, lane]));
  ensure(trainingLanes.get("repo-local-seed-models")?.allowedToday === true, "repo-local seed models should remain the only active training lane");
  for (const id of ["retrieval-knowledge-layer", "lora-or-adapter-experiment", "full-fine-tune", "foundation-pretraining"]) {
    ensure(trainingLanes.get(id)?.allowedToday === false, `${id}: allowedToday must remain false`);
  }
  ensure(trainingLanes.get("foundation-pretraining")?.foundationModelTraining === true, "foundation pretraining lane must be explicit");
  ensure(trainingLanes.get("foundation-pretraining")?.status === "disabled", "foundation pretraining must remain disabled");

  ensure(String(registry.knowledgeStrategy?.goal || "").includes("retrieval"), "knowledge strategy must prefer retrieval-backed knowledge");
  ensure(String(registry.knowledgeStrategy?.forbiddenShortcut || "").includes("download everything"), "knowledge strategy must forbid download-everything shortcut");

  ensureArrayIncludesAll(registry.forbiddenClaims, [
    "SEIS installed every language model.",
    "SEIS trained a 512B model.",
    "SEIS is a real AGI.",
    "SEIS can use all model checkpoints without license review."
  ], "forbiddenClaims");
}

if (trainingPlan) {
  ensure(trainingPlan.sourceOfTruth?.languageModelIntakeRegistry === files.registry, "training plan must link language model intake registry");
  ensure(
    (trainingPlan.trainingLoops || []).some((loop) => loop.id === "language_model_intake_review"),
    "training plan must include language_model_intake_review loop"
  );
}

if (trainingDoc) {
  for (const phrase of [
    "Language Model Intake Registry",
    "Local AI Runtime Matrix",
    "not bulk installation",
    "metadata-only",
    "retrieval first"
  ]) {
    ensure(trainingDoc.includes(phrase), `training doc missing phrase: ${phrase}`);
  }
}

if (aiCoreDoc) {
  ensure(aiCoreDoc.includes("Language model intake registry"), "AI Core docs must mention language model intake registry");
  ensure(aiCoreDoc.includes("seis-language-model-intake-registry.json"), "AI Core docs must link language model intake registry");
}

if (modelScalingDoc) {
  ensure(modelScalingDoc.includes("Language Model Intake Registry"), "model scaling docs must mention language model intake registry");
  ensure(modelScalingDoc.includes("seis-language-model-intake-registry.json"), "model scaling docs must link language model intake registry");
  ensure(modelScalingDoc.includes("Local AI Runtime Matrix"), "model scaling docs must mention local AI runtime matrix");
  ensure(modelScalingDoc.includes("seis-local-ai-runtime-matrix.json"), "model scaling docs must link local AI runtime matrix");
}

if (localAiRuntimeMatrix) {
  ensure(localAiRuntimeMatrix.id === "seis-local-ai-runtime-matrix", "local AI runtime matrix id mismatch");
  ensure(localAiRuntimeMatrix.status === "runtime-matrix-ready-no-install", "local AI runtime matrix status mismatch");
  ensure(localAiRuntimeMatrix.qualityGate === "npm run check:seis-local-ai-runtime-matrix", "local AI runtime matrix quality gate mismatch");
  ensure(localAiRuntimeMatrix.reportCommand === "npm run report:seis-local-ai-runtime-matrix", "local AI runtime matrix report command mismatch");
  ensure(localAiRuntimeMatrix.sourceOfTruth?.registry === files.registry, "local AI runtime matrix must link registry");
  ensure(localAiRuntimeMatrix.sourceOfTruth?.hardwareProfile === "content/development/seis-model-scaling-hardware-profile.json", "local AI runtime matrix must link hardware profile");
  ensure(localAiRuntimeMatrix.sourceOfTruth?.parameterLadder === "content/development/seis-model-parameter-ladder.json", "local AI runtime matrix must link parameter ladder");
  ensureArrayIncludesAll((localAiRuntimeMatrix.officialResearchBaseline || []).map((source) => source.id), [
    "hf-transformers-bitsandbytes",
    "hf-peft",
    "hf-trl-sft-trainer",
    "hf-jobs",
    "ollama-library"
  ], "local AI runtime matrix official sources");
  ensureArrayIncludesAll((localAiRuntimeMatrix.runtimeRows || []).map((row) => row.id), [
    "seis-local-demo",
    "deterministic-seed-models",
    "small-embedding-reranker",
    "ollama-small-llm-0_5b-8b",
    "ollama-14b-20b",
    "small-sft-lora-pilot",
    "hf-jobs-small-training",
    "seis-70b-research",
    "seis-512b-apex-agi"
  ], "local AI runtime matrix runtime rows");
  ensure((localAiRuntimeMatrix.runtimeRows || []).find((row) => row.id === "seis-local-demo")?.routeEligibleToday === true, "local AI runtime matrix should keep Local Demo route eligible");
  ensure((localAiRuntimeMatrix.runtimeRows || []).filter((row) => row.id !== "seis-local-demo").every((row) => row.routeEligibleToday === false), "local AI runtime matrix non-demo rows must be route ineligible");
  ensure((localAiRuntimeMatrix.runtimeRows || []).every((row) => row.downloadsCheckpoints === false), "local AI runtime matrix must not download checkpoints");
  ensure((localAiRuntimeMatrix.runtimeRows || []).every((row) => row.runsInference === false), "local AI runtime matrix must not run inference");
  ensure((localAiRuntimeMatrix.runtimeRows || []).every((row) => row.callsProviders === false), "local AI runtime matrix must not call providers");
  for (const [field, expected] of Object.entries({
    modelInstall: false,
    checkpointDownload: false,
    ollamaPull: false,
    localInference: false,
    sftTraining: false,
    loraTraining: false,
    foundationPretraining: false,
    hfJobSubmission: false,
    providerCalls: false,
    cloudGpuProvisioning: false,
    sshExecution: false,
    githubPushOrMerge: false,
    routePromotion: false,
    agiClaim: false
  })) {
    ensure(localAiRuntimeMatrix.approvedToday?.[field] === expected, `local AI runtime matrix approvedToday.${field} must be ${expected}`);
  }
  ensure(localAiRuntimeMatrix.publicClaims?.canClaimAnyModelInstalled === false, "local AI runtime matrix must block installed-model claim");
  ensure(localAiRuntimeMatrix.publicClaims?.canClaimLocalInferenceReady === false, "local AI runtime matrix must block local inference claim");
  ensure(localAiRuntimeMatrix.publicClaims?.canClaimTrainingExecuted === false, "local AI runtime matrix must block training claim");
  ensure(localAiRuntimeMatrix.publicClaims?.canClaimSEISOwnedFoundationModel === false, "local AI runtime matrix must block SEIS-owned model claim");
  ensure(localAiRuntimeMatrix.publicClaims?.canClaim512BReady === false, "local AI runtime matrix must block 512B readiness claim");
  ensure(localAiRuntimeMatrix.publicClaims?.canClaimAGI === false, "local AI runtime matrix must block AGI claim");
}

if (localAiRuntimeMatrixReport) {
  ensure(localAiRuntimeMatrixReport.status === "runtime-matrix-defined-runtime-blocked", "local AI runtime matrix report status mismatch");
  ensure(localAiRuntimeMatrixReport.sourceMatrix === files.localAiRuntimeMatrix, "local AI runtime matrix report source mismatch");
  ensure(localAiRuntimeMatrixReport.summary?.installAllowed === false, "local AI runtime matrix report must block install");
  ensure(localAiRuntimeMatrixReport.summary?.localInferenceAllowed === false, "local AI runtime matrix report must block local inference");
  ensure(localAiRuntimeMatrixReport.summary?.trainingAllowed === false, "local AI runtime matrix report must block training");
  ensure(localAiRuntimeMatrixReport.summary?.hfJobSubmissionAllowed === false, "local AI runtime matrix report must block HF Jobs");
  ensure(localAiRuntimeMatrixReport.summary?.agiClaim === false, "local AI runtime matrix report must block AGI claim");
}

if (localAiRuntimeMatrixMarkdown) {
  ensure(localAiRuntimeMatrixMarkdown.includes("SEIS Local AI Runtime Matrix"), "local AI runtime matrix markdown title missing");
  ensure(localAiRuntimeMatrixMarkdown.includes("Install allowed"), "local AI runtime matrix markdown must include install boundary");
  ensure(localAiRuntimeMatrixMarkdown.includes("HF Job submission allowed"), "local AI runtime matrix markdown must include HF Job boundary");
}

if (localAiRuntimeMatrixDocs) {
  ensure(localAiRuntimeMatrixDocs.includes("16GB Rule"), "local AI runtime matrix docs must include 16GB rule");
  ensure(localAiRuntimeMatrixDocs.includes("does not train"), "local AI runtime matrix docs must block training");
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-language-model-intake"] === "node scripts/check-seis-language-model-intake.mjs",
    "package.json must expose check:seis-language-model-intake"
  );
  ensure(
    packageJson.scripts?.["check:seis-local-ai-runtime-matrix"] === "node scripts/create-seis-local-ai-runtime-matrix.mjs",
    "package.json must expose check:seis-local-ai-runtime-matrix"
  );
  ensure(
    packageJson.scripts?.["report:seis-local-ai-runtime-matrix"] === "node scripts/create-seis-local-ai-runtime-matrix.mjs --write",
    "package.json must expose report:seis-local-ai-runtime-matrix"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-local-ai-runtime-matrix"),
    "quality:governance must include local AI runtime matrix"
  );
}

finish("SEIS language model intake check passed.");

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

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS language model intake check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
