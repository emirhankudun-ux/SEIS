#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const files = {
  registry: "content/development/seis-language-model-intake-registry.json",
  hardwareProfile: "content/development/seis-model-scaling-hardware-profile.json",
  parameterLadder: "content/development/seis-model-parameter-ladder.json",
  matrix: "content/development/seis-local-ai-runtime-matrix.json",
  reportJson: "reports/seis-model-scaling/seis-local-ai-runtime-matrix.json",
  reportMd: "reports/seis-model-scaling/seis-local-ai-runtime-matrix.md",
  docs: "docs/ai/seis-local-ai-runtime-matrix.md",
  modelScalingDoc: "docs/ai/seis-model-scaling.md",
  workforceDoc: "docs/ai/ai-workforce-training.md",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(files.matrix) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const registry = readJson(files.registry, "language model intake registry");
const hardwareProfile = readJson(files.hardwareProfile, "model scaling hardware profile");
const parameterLadder = readJson(files.parameterLadder, "model parameter ladder");
const packageJson = readJson(files.packageJson, "package.json");
const modelScalingDoc = readText(files.modelScalingDoc, "model scaling docs");
const workforceDoc = readText(files.workforceDoc, "AI workforce training docs");

if (!registry || !hardwareProfile || !parameterLadder || !packageJson) finish();

const matrix = buildMatrix();
const report = buildReport(matrix);
const markdown = renderMarkdown(report);
const docs = renderDocs(matrix, report);

if (mode === "write") {
  writeJson(files.matrix, matrix);
  writeJson(files.reportJson, report);
  writeText(files.reportMd, markdown);
  writeText(files.docs, docs);
  console.log("SEIS local AI runtime matrix generated.");
  console.log(JSON.stringify({
    matrix: files.matrix,
    report: files.reportJson,
    markdown: files.reportMd,
    docs: files.docs
  }, null, 2));
} else {
  checkJson(files.matrix, matrix, "local AI runtime matrix");
  checkJson(files.reportJson, report, "local AI runtime matrix report");
  checkText(files.reportMd, markdown, "local AI runtime matrix markdown");
  checkText(files.docs, docs, "local AI runtime matrix docs");
  validate(matrix, report);
  finish("SEIS local AI runtime matrix check passed.");
}

function buildMatrix() {
  return {
    id: "seis-local-ai-runtime-matrix",
    version: "2026.07.08",
    generatedAt,
    status: "runtime-matrix-ready-no-install",
    qualityGate: "npm run check:seis-local-ai-runtime-matrix",
    reportCommand: "npm run report:seis-local-ai-runtime-matrix",
    purpose: "Define a safe local AI path for SEIS on 16GB+ machines without downloading checkpoints, running inference, training, submitting jobs, provisioning cloud/GPU, using SSH, or claiming AGI.",
    truthBoundary: [
      "This matrix is planning evidence only.",
      "It installs no models, downloads no checkpoints, runs no inference, calls no provider, trains no model, submits no job, provisions no cloud or GPU, executes no SSH, and pushes nothing to GitHub.",
      "It does not approve SFT, LoRA, full fine-tuning, foundation pretraining, benchmark execution, route promotion, 512B readiness, fully knowledgeable AI, or AGI claims.",
      "16GB+ support means Local Demo plus approval-gated candidate lanes, not verified 20B runtime compatibility."
    ],
    officialResearchBaseline: [
      {
        id: "hf-transformers-bitsandbytes",
        url: "https://huggingface.co/docs/transformers/quantization/bitsandbytes",
        observedDate: "2026-07-08",
        evidenceSummary: "Hugging Face documents 8-bit and 4-bit quantization, QLoRA, hardware compatibility, and memory-footprint checks.",
        seisImplication: "SEIS can plan quantized local lanes, but must block runtime/training claims until measured on approved hardware."
      },
      {
        id: "hf-peft",
        url: "https://huggingface.co/docs/peft/en/index",
        observedDate: "2026-07-08",
        evidenceSummary: "PEFT trains a small number of extra parameters instead of all model parameters.",
        seisImplication: "Small LoRA/adapters are a future research lane after dataset, model-card, and approval gates; they are not foundation-model training."
      },
      {
        id: "hf-trl-sft-trainer",
        url: "https://huggingface.co/docs/trl/en/sft_trainer",
        observedDate: "2026-07-08",
        evidenceSummary: "TRL exposes SFTTrainer for supervised fine-tuning workflows with model, datasets, processing class, and PEFT config inputs.",
        seisImplication: "SEIS can prepare an SFT approval packet later, but no SFT command is authorized by this matrix."
      },
      {
        id: "hf-jobs",
        url: "https://huggingface.co/docs/huggingface_hub/en/guides/jobs",
        observedDate: "2026-07-08",
        evidenceSummary: "HF Jobs require login, positive credit balance, hardware flavor selection, and environment/secrets handling.",
        seisImplication: "HF Jobs remain blocked until explicit cost, secret, monitoring, rollback, and human approval evidence exists."
      },
      {
        id: "ollama-library",
        url: "https://ollama.com/library",
        observedDate: "2026-07-08",
        evidenceSummary: "Ollama lists local model families and sizes, including Qwen, Gemma, Llama, Mistral, DeepSeek, code, and embedding families.",
        seisImplication: "SEIS can track model-family candidates, but every pull/run needs model-specific license, artifact, RAM, checksum, and rollback approval."
      }
    ],
    sourceOfTruth: {
      registry: files.registry,
      hardwareProfile: files.hardwareProfile,
      parameterLadder: files.parameterLadder,
      docs: files.docs
    },
    currentState: {
      registryStatus: registry.status,
      hardwareProfileStatus: hardwareProfile.status,
      parameterLadderStatus: parameterLadder.status,
      current20bCompatibilityStatus: hardwareProfile.currentTarget?.compatibilityStatus || "unknown",
      apex512bStatus: hardwareProfile.apexTarget?.compatibilityStatus || "unknown",
      apexTrainingStatus: hardwareProfile.apexTarget?.trainingStatus || "unknown",
      agiCapabilityStatus: hardwareProfile.apexTarget?.agiCapabilityStatus || "unknown"
    },
    approvedToday: {
      matrixGenerated: true,
      localDemoRuntime: true,
      deterministicSeedModels: true,
      modelInstall: false,
      checkpointDownload: false,
      ollamaPull: false,
      localInference: false,
      retrievalIndexRuntime: false,
      embeddingModelRuntime: false,
      sftTraining: false,
      loraTraining: false,
      fullFineTune: false,
      foundationPretraining: false,
      hfJobSubmission: false,
      providerCalls: false,
      cloudGpuProvisioning: false,
      sshExecution: false,
      githubPushOrMerge: false,
      routePromotion: false,
      agiClaim: false
    },
    hardwareRuntimeLanes: [
      lane("local-demo-any-supported-machine", "any-supported-local-demo-host", "SEIS Local Demo and deterministic seed-model artifacts", true),
      lane("developer-16gb-no-gpu", "16GB system RAM, no approved accelerator", "metadata, docs, runtime planning, deterministic seed-model lab", false),
      lane("developer-16gb-gpu-approval-required", "16GB RAM plus explicitly approved accelerator profile", "planning only", false),
      lane("workstation-32gb-64gb", "32GB-64GB+", "planning and future approved benchmark work only", false),
      lane("frontier-distributed-70b-to-512b", "approved distributed research cluster only", "disabled", false)
    ],
    runtimeRows: [
      runtimeRow("seis-local-demo", "SEIS Local Demo", "active", "none", true),
      runtimeRow("deterministic-seed-models", "SEIS deterministic seed models", "active-lab", "none", false),
      runtimeRow("small-embedding-reranker", "Small embedding/reranker candidate", "approval-required", "single-model approval", false),
      runtimeRow("ollama-small-llm-0_5b-8b", "Ollama small local LLM candidate", "approval-required", "model-specific approval", false),
      runtimeRow("ollama-14b-20b", "Ollama 14B/20B candidate", "benchmark-required", "model-specific approval plus benchmark", false),
      runtimeRow("small-sft-lora-pilot", "Small SFT/LoRA pilot", "approval-packet-required", "filled approval packet", false),
      runtimeRow("hf-jobs-small-training", "HF Jobs small training pilot", "blocked", "HF login/credit/secret/cost approval", false),
      runtimeRow("seis-70b-research", "SEIS 70B research lane", "research-roadmap", "frontier approval", false),
      runtimeRow("seis-512b-apex-agi", "SEIS 512B AGI apex lane", "apex-plan-only", "frontier cluster approval", false)
    ],
    requiredBeforeModelInstall: registry.requiredBeforeAnyModelInstall || [],
    requiredBeforeTraining: registry.requiredBeforeAnyTraining || [],
    requiredBeforeAnyRuntimePromotion: [
      "exact model id, revision, file list, license, and checksum evidence",
      "hardware profile with RAM/GPU/CPU/disk/thermal budget",
      "no-secret logs and client bundle scan",
      "local-only fallback verified",
      "benchmark or dry-run evidence appropriate to the route",
      "human approval recorded for that exact route"
    ],
    publicClaims: {
      canClaimRuntimeMatrixExists: true,
      canClaim16gbLocalDemoSupported: true,
      canClaimAnyModelInstalled: false,
      canClaimOllamaModelPulled: false,
      canClaimLocalInferenceReady: false,
      canClaim20bRuntimeReady: false,
      canClaimTrainingExecuted: false,
      canClaimHFJobSubmitted: false,
      canClaimSEISOwnedFoundationModel: false,
      canClaimSEISFullyKnowledgeable: false,
      canClaim512BReady: false,
      canClaimAGI: false
    },
    blockedBy: [
      "no per-model human approval",
      "no approved model artifact checksum",
      "no measured runtime benchmark",
      "no approved dataset card for training",
      "no approved secret storage reference for HF Jobs",
      "no training logs or checkpoints",
      "no independent AGI evaluation evidence"
    ]
  };
}

function lane(id, ramClass, allowedToday, routeEligibleToday) {
  return { id, ramClass, allowedToday, routeEligibleToday, installsModels: false, trainsModels: false };
}

function runtimeRow(id, displayName, status, approvalRequirement, routeEligibleToday) {
  return {
    id,
    displayName,
    status,
    approvalRequirement,
    allowedToday: routeEligibleToday,
    installsModels: false,
    downloadsCheckpoints: false,
    runsInference: false,
    trainsModels: false,
    callsProviders: false,
    provisionsCloudOrGpu: false,
    routeEligibleToday,
    notes: "Planning row only; no runtime authority."
  };
}

function buildReport(matrix) {
  return {
    id: "seis-local-ai-runtime-matrix-report",
    generatedAt: matrix.generatedAt,
    status: "runtime-matrix-defined-runtime-blocked",
    sourceMatrix: files.matrix,
    summary: {
      runtimeRows: matrix.runtimeRows.length,
      hardwareRuntimeLanes: matrix.hardwareRuntimeLanes.length,
      installAllowed: matrix.approvedToday.modelInstall,
      checkpointDownloadAllowed: matrix.approvedToday.checkpointDownload,
      localInferenceAllowed: matrix.approvedToday.localInference,
      trainingAllowed: matrix.approvedToday.sftTraining || matrix.approvedToday.loraTraining || matrix.approvedToday.foundationPretraining,
      hfJobSubmissionAllowed: matrix.approvedToday.hfJobSubmission,
      agiClaim: matrix.approvedToday.agiClaim
    },
    publicClaims: matrix.publicClaims,
    blockedBy: matrix.blockedBy
  };
}

function validate(matrix, report) {
  ensure(matrix.id === "seis-local-ai-runtime-matrix", "matrix id mismatch");
  ensure(matrix.status === "runtime-matrix-ready-no-install", "matrix status mismatch");
  ensure(matrix.qualityGate === "npm run check:seis-local-ai-runtime-matrix", "matrix quality gate mismatch");
  ensure(matrix.reportCommand === "npm run report:seis-local-ai-runtime-matrix", "matrix report command mismatch");
  ensure(matrix.sourceOfTruth?.registry === files.registry, "matrix must link registry");
  ensure(matrix.sourceOfTruth?.hardwareProfile === files.hardwareProfile, "matrix must link hardware profile");
  ensure(matrix.sourceOfTruth?.parameterLadder === files.parameterLadder, "matrix must link parameter ladder");
  ensure(registry.status === "active-intake-contract", "registry must stay active");
  ensure(hardwareProfile.status === "planned-compatibility-contract", "hardware profile must stay planning only");
  ensure(parameterLadder.status === "planning-contract-not-runtime", "parameter ladder must stay non-runtime");

  ensureArrayIncludesAll((matrix.officialResearchBaseline || []).map((source) => source.id), [
    "hf-transformers-bitsandbytes",
    "hf-peft",
    "hf-trl-sft-trainer",
    "hf-jobs",
    "ollama-library"
  ], "officialResearchBaseline");

  ensureArrayIncludesAll((matrix.runtimeRows || []).map((row) => row.id), [
    "seis-local-demo",
    "deterministic-seed-models",
    "small-embedding-reranker",
    "ollama-small-llm-0_5b-8b",
    "ollama-14b-20b",
    "small-sft-lora-pilot",
    "hf-jobs-small-training",
    "seis-70b-research",
    "seis-512b-apex-agi"
  ], "runtimeRows");

  ensure((matrix.runtimeRows || []).find((row) => row.id === "seis-local-demo")?.routeEligibleToday === true, "Local Demo route should remain eligible");
  ensure((matrix.runtimeRows || []).filter((row) => row.id !== "seis-local-demo").every((row) => row.routeEligibleToday === false), "only Local Demo can be route eligible");
  ensure((matrix.runtimeRows || []).every((row) => row.downloadsCheckpoints === false), "runtime rows must not download checkpoints");
  ensure((matrix.runtimeRows || []).every((row) => row.runsInference === false), "runtime rows must not run inference");
  ensure((matrix.runtimeRows || []).every((row) => row.callsProviders === false), "runtime rows must not call providers");

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
    ensure(matrix.approvedToday?.[field] === expected, `approvedToday.${field} must be ${expected}`);
  }

  ensure(report.status === "runtime-matrix-defined-runtime-blocked", "report status mismatch");
  ensure(report.summary.installAllowed === false, "report must block install");
  ensure(report.summary.localInferenceAllowed === false, "report must block local inference");
  ensure(report.summary.trainingAllowed === false, "report must block training");
  ensure(report.summary.hfJobSubmissionAllowed === false, "report must block HF Jobs");
  ensure(report.summary.agiClaim === false, "report must block AGI claim");

  ensure(packageJson.scripts?.["check:seis-local-ai-runtime-matrix"] === "node scripts/create-seis-local-ai-runtime-matrix.mjs", "package.json must expose check:seis-local-ai-runtime-matrix");
  ensure(packageJson.scripts?.["report:seis-local-ai-runtime-matrix"] === "node scripts/create-seis-local-ai-runtime-matrix.mjs --write", "package.json must expose report:seis-local-ai-runtime-matrix");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-local-ai-runtime-matrix"), "quality:governance must include local matrix");
  ensure(modelScalingDoc.includes("Local AI Runtime Matrix"), "model scaling docs must mention Local AI Runtime Matrix");
  ensure(modelScalingDoc.includes("seis-local-ai-runtime-matrix.json"), "model scaling docs must link local matrix JSON");
  ensure(workforceDoc.includes("Local AI Runtime Matrix"), "AI workforce docs must mention Local AI Runtime Matrix");
}

function renderMarkdown(report) {
  return `# SEIS Local AI Runtime Matrix

Generated: ${report.generatedAt}

Status: ${report.status}

## Summary

| Field | Value |
| --- | --- |
| Runtime rows | ${report.summary.runtimeRows} |
| Hardware lanes | ${report.summary.hardwareRuntimeLanes} |
| Install allowed | ${String(report.summary.installAllowed)} |
| Checkpoint download allowed | ${String(report.summary.checkpointDownloadAllowed)} |
| Local inference allowed | ${String(report.summary.localInferenceAllowed)} |
| Training allowed | ${String(report.summary.trainingAllowed)} |
| HF Job submission allowed | ${String(report.summary.hfJobSubmissionAllowed)} |
| AGI claim | ${String(report.summary.agiClaim)} |

## Blocked By

${report.blockedBy.map((item) => `- ${item}`).join("\n")}
`;
}

function renderDocs(matrix, report) {
  return `# SEIS Local AI Runtime Matrix

This matrix defines the safe local AI path for SEIS on 16GB+ machines and
larger future hardware classes. It is intentionally a planning artifact: it does
not install Ollama models, does not pull checkpoints, does not run inference,
does not train, does not submit HF Jobs, and does not claim SEIS has a 512B
model or real AGI.

## Status

- Matrix status: ${matrix.status}
- Runtime rows: ${report.summary.runtimeRows}
- Hardware lanes: ${report.summary.hardwareRuntimeLanes}
- Model install allowed: ${String(report.summary.installAllowed)}
- Checkpoint download allowed: ${String(report.summary.checkpointDownloadAllowed)}
- Local inference allowed: ${String(report.summary.localInferenceAllowed)}
- Training allowed: ${String(report.summary.trainingAllowed)}
- HF Job submission allowed: ${String(report.summary.hfJobSubmissionAllowed)}
- AGI claim allowed: ${String(report.summary.agiClaim)}

## 16GB Rule

16GB+ currently means SEIS Local Demo, deterministic seed-model artifacts, and
approval-gated metadata planning. It does not verify 20B runtime compatibility.
Small local models, embeddings, SFT, LoRA, Ollama pulls, and HF Jobs all require
separate model-specific approval and evidence.

## Commands

\`\`\`bash
npm run report:seis-local-ai-runtime-matrix
npm run check:seis-local-ai-runtime-matrix
\`\`\`
`;
}

function readJson(relativePath, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readOptionalJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return null;
  try {
    return JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch {
    return null;
  }
}

function readText(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return "";
  return readFileSync(absolutePath, "utf8");
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, value);
}

function checkJson(relativePath, expected, label) {
  const actual = readJson(relativePath, label);
  if (!actual) return;
  if (JSON.stringify(actual, null, 2) !== JSON.stringify(expected, null, 2)) {
    failures.push(`${label} is stale. Run npm run report:seis-local-ai-runtime-matrix.`);
  }
}

function checkText(relativePath, expected, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(absolutePath, "utf8");
  if (actual !== expected) {
    failures.push(`${label} is stale. Run npm run report:seis-local-ai-runtime-matrix.`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS local AI runtime matrix check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  if (successMessage) console.log(successMessage);
}
