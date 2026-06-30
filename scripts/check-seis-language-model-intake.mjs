#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  registry: "content/development/seis-language-model-intake-registry.json",
  installTrainingLedger: "content/development/seis-language-model-install-training-ledger.json",
  installTrainingLedgerReport: "reports/seis-model-scaling/seis-language-model-install-training-ledger.json",
  knowledgeRetrievalTraining: "content/development/seis-knowledge-retrieval-training-contract.json",
  trainingPlan: "content/development/seis-ai-workforce-training-plan.json",
  trainingDoc: "docs/ai/ai-workforce-training.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  modelScalingDoc: "docs/ai/seis-model-scaling.md",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(files)) {
  ensureFile(relativePath, label);
}

const registry = readJson(files.registry, "language model intake registry");
const installTrainingLedger = readJson(files.installTrainingLedger, "language model install/training ledger");
const installTrainingLedgerReport = readJson(files.installTrainingLedgerReport, "language model install/training ledger report");
const knowledgeRetrievalTraining = readJson(files.knowledgeRetrievalTraining, "knowledge retrieval training contract");
const trainingPlan = readJson(files.trainingPlan, "AI workforce training plan");
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

if (installTrainingLedger && registry) {
  ensure(installTrainingLedger.id === "seis-language-model-install-training-ledger", "install/training ledger id mismatch");
  ensure(installTrainingLedger.status === "safety-gated-install-and-training-ledger", "install/training ledger status mismatch");
  ensure(installTrainingLedger.qualityGate === "npm run check:seis-language-model-install-training-ledger", "install/training ledger quality gate mismatch");
  ensure(installTrainingLedger.reportCommand === "npm run report:seis-language-model-install-training-ledger", "install/training ledger report command mismatch");

  for (const [field, expected] of Object.entries({
    allModelInstall: false,
    languageModelDownloads: false,
    checkpointHandling: false,
    providerCalls: false,
    datasetDownloads: false,
    adapterTraining: false,
    fineTuning: false,
    foundationPretraining: false,
    repoLocalSeedModelTraining: true
  })) {
    ensure(installTrainingLedger.approvedToday?.[field] === expected, `install/training ledger approvedToday.${field} must be ${expected}`);
  }

  const registryFamilyIds = new Set((registry.candidateModelFamilies || []).map((family) => family.id));
  const ledgerFamilies = new Map((installTrainingLedger.modelFamilies || []).map((family) => [family.id, family]));
  ensure(ledgerFamilies.size === registryFamilyIds.size, "install/training ledger must cover every registry family");
  for (const familyId of registryFamilyIds) {
    const family = ledgerFamilies.get(familyId);
    ensure(Boolean(family), `install/training ledger missing family ${familyId}`);
    if (!family) continue;
    ensure(family.installDecision === "blocked-until-per-model-approval", `${familyId}: install decision must remain blocked`);
    ensure(family.trainingDecision === "blocked-not-authorized", `${familyId}: training decision must remain blocked`);
  }

  ensure(installTrainingLedger.allowedTrainingNow?.length === 1, "ledger must allow only one current training lane");
  ensure(installTrainingLedger.allowedTrainingNow?.[0]?.id === "repo-local-seed-models", "ledger must allow only repo-local seed training today");
  ensure(installTrainingLedger.sourceOfTruth?.knowledgeRetrievalTraining === files.knowledgeRetrievalTraining, "install/training ledger must link knowledge retrieval training contract");
  ensure(
    installTrainingLedger.safeSequence?.some((step) => step.id === "knowledge-retrieval-contract" && step.status === "contract-defined-not-indexed"),
    "install/training ledger safe sequence must include knowledge retrieval contract"
  );
  ensure(installTrainingLedger.publicClaims?.canClaimAllModelsInstalled === false, "ledger must forbid all-model-installed claim");
  ensure(installTrainingLedger.publicClaims?.canClaimSEISTrainedFoundationModel === false, "ledger must forbid foundation-model training claim");
  ensure(installTrainingLedger.publicClaims?.canClaim512BOrAGI === false, "ledger must forbid 512B/AGI claim");
}

if (installTrainingLedgerReport) {
  ensure(installTrainingLedgerReport.status === "blocked-for-live-install-safe-for-planning", "install/training ledger report status mismatch");
  ensure(installTrainingLedgerReport.sourceLedger === files.installTrainingLedger, "install/training ledger report source mismatch");
  ensure(installTrainingLedgerReport.summary?.allModelInstall === false, "install/training ledger report must block all-model install");
  ensure(installTrainingLedgerReport.summary?.foundationPretraining === false, "install/training ledger report must block foundation pretraining");
  ensure(
    (installTrainingLedgerReport.humanApprovalNeededBefore || []).includes("any model download"),
    "install/training ledger report must require approval before any model download"
  );
}

if (knowledgeRetrievalTraining) {
  ensure(knowledgeRetrievalTraining.id === "seis-knowledge-retrieval-training-contract", "knowledge retrieval training contract id mismatch");
  ensure(knowledgeRetrievalTraining.status === "contract-defined-not-indexed", "knowledge retrieval training contract status mismatch");
  ensure(knowledgeRetrievalTraining.qualityGate === "npm run check:seis-knowledge-retrieval-training", "knowledge retrieval quality gate mismatch");
  ensure(knowledgeRetrievalTraining.approvedToday?.retrievalIndexBuild === false, "knowledge retrieval must not mark retrieval index as built");
  ensure(knowledgeRetrievalTraining.approvedToday?.embeddingModelInstall === false, "knowledge retrieval must not install embedding model");
  ensure(knowledgeRetrievalTraining.approvedToday?.providerEmbeddingCalls === false, "knowledge retrieval must not approve provider embedding calls");
  ensure(knowledgeRetrievalTraining.approvedToday?.trainingOnRetrievedSources === false, "knowledge retrieval must not approve training on retrieved sources");
  ensure(knowledgeRetrievalTraining.publicClaims?.canClaimFullyKnowledgeableAI === false, "knowledge retrieval must forbid fully knowledgeable AI claim");
  ensure(knowledgeRetrievalTraining.publicClaims?.canClaimAGI === false, "knowledge retrieval must forbid AGI claim");
  ensure(
    (knowledgeRetrievalTraining.sourceClasses || []).some((source) => source.id === "private-user-data" && source.status === "blocked"),
    "knowledge retrieval must block private user data"
  );
  ensure(
    (knowledgeRetrievalTraining.requiredBeforeRetrievalIndexBuild || []).includes("secret and credential scan"),
    "knowledge retrieval index build must require secret and credential scan"
  );
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
    "Install and Training Ledger",
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
  ensure(modelScalingDoc.includes("Language Model Install and Training Ledger"), "model scaling docs must mention install/training ledger");
  ensure(modelScalingDoc.includes("seis-language-model-install-training-ledger.json"), "model scaling docs must link install/training ledger");
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-language-model-intake"] === "node scripts/check-seis-language-model-intake.mjs",
    "package.json must expose check:seis-language-model-intake"
  );
  ensure(
    packageJson.scripts?.["check:seis-language-model-install-training-ledger"] === "node scripts/create-seis-language-model-install-training-ledger.mjs",
    "package.json must expose check:seis-language-model-install-training-ledger"
  );
  ensure(
    packageJson.scripts?.["report:seis-language-model-install-training-ledger"] === "node scripts/create-seis-language-model-install-training-ledger.mjs --write",
    "package.json must expose report:seis-language-model-install-training-ledger"
  );
  ensure(
    packageJson.scripts?.["check:seis-knowledge-retrieval-training"] === "node scripts/create-seis-knowledge-retrieval-training-contract.mjs",
    "package.json must expose check:seis-knowledge-retrieval-training"
  );
  ensure(
    packageJson.scripts?.["report:seis-knowledge-retrieval-training"] === "node scripts/create-seis-knowledge-retrieval-training-contract.mjs --write",
    "package.json must expose report:seis-knowledge-retrieval-training"
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
