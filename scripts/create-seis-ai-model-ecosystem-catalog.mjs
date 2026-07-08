#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const files = {
  catalog: "content/development/seis-ai-model-ecosystem-catalog.json",
  docs: "docs/ai/seis-ai-model-ecosystem-catalog.md",
  reportJson: "reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.json",
  reportMd: "reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.md",
  languageModelIntake: "content/development/seis-language-model-intake-registry.json",
  localRuntimeMatrix: "content/development/seis-local-ai-runtime-matrix.json",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(files.catalog) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const intake = readJson(files.languageModelIntake, "language model intake registry");
const runtimeMatrix = readJson(files.localRuntimeMatrix, "local AI runtime matrix");
const packageJson = readJson(files.packageJson, "package.json");

if (!intake || !runtimeMatrix || !packageJson) finish();

const catalog = buildCatalog();
const report = buildReport(catalog);
const docs = renderDocs(catalog, report);
const reportMd = renderReport(report);

if (mode === "write") {
  writeJson(files.catalog, catalog);
  writeJson(files.reportJson, report);
  writeText(files.docs, docs);
  writeText(files.reportMd, reportMd);
  console.log("SEIS AI model ecosystem catalog generated.");
  console.log(JSON.stringify({
    catalog: files.catalog,
    docs: files.docs,
    report: files.reportJson,
    markdownReport: files.reportMd
  }, null, 2));
} else {
  checkJson(files.catalog, catalog, "SEIS AI model ecosystem catalog");
  checkJson(files.reportJson, report, "SEIS AI model ecosystem catalog report");
  checkText(files.docs, docs, "SEIS AI model ecosystem catalog docs");
  checkText(files.reportMd, reportMd, "SEIS AI model ecosystem catalog markdown report");
  validate(catalog, report);
  finish("SEIS AI model ecosystem catalog check passed.");
}

function buildCatalog() {
  return {
    id: "seis-ai-model-ecosystem-catalog",
    version: "2026.07.08",
    generatedAt,
    status: "catalog-ready-no-install-no-training",
    qualityGate: "npm run check:seis-ai-model-ecosystem-catalog",
    reportCommand: "npm run report:seis-ai-model-ecosystem-catalog",
    purpose: "Track major local, open-weight, provider-routed, embedding, code, multimodal, and frontier model families for SEIS without bulk installation, blind downloads, unsafe training, or unsupported AGI claims.",
    truthBoundary: [
      "This catalog does not install models, download weights, call providers, submit jobs, run inference, train, fine-tune, benchmark, push, merge, deploy, or prove AGI.",
      "Model-family coverage is broad but not exhaustive; every concrete model id still requires license, checksum, hardware, dataset, benchmark, rollback, and human approval evidence.",
      "A 512B SEIS target remains a research gate, not a trained checkpoint, routeable model, public benchmark, or AGI proof."
    ],
    sourceOfTruth: {
      languageModelIntake: files.languageModelIntake,
      localRuntimeMatrix: files.localRuntimeMatrix,
      docs: files.docs
    },
    officialResearchBaseline: [
      source("hf-transformers", "https://huggingface.co/docs/transformers/index", "Transformers covers model definitions for text, vision, audio, video, and multimodal models plus inference and training surfaces."),
      source("hf-peft", "https://huggingface.co/docs/peft/index", "PEFT documents adapter and LoRA-style parameter-efficient fine-tuning that trains only a small number of extra parameters."),
      source("ollama-library", "https://ollama.com/library", "Ollama lists major local model families and sizes across Llama, Qwen, Gemma, DeepSeek, Mistral, Phi, embeddings, code, and gpt-oss."),
      source("google-gemma-docs", "https://ai.google.dev/gemma/docs", "Google documents Gemma open models, variants such as EmbeddingGemma and ShieldGemma, local runtimes, and tuning routes."),
      source("qwen-blog", "https://qwenlm.github.io/", "Qwen publishes model-family updates including Qwen3 safety, image, translation, and RL research posts."),
      source("mistral-models", "https://docs.mistral.ai/models/overview", "Mistral documents model families, model selection, frontier models, specialist models, and self-deployment paths."),
      source("deepseek-r1", "https://github.com/deepseek-ai/DeepSeek-R1", "DeepSeek-R1 documents 671B MoE reasoning models plus distilled Qwen/Llama checkpoints and local-use recommendations."),
      source("openai-gpt-oss-20b", "https://huggingface.co/openai/gpt-oss-20b", "OpenAI gpt-oss-20b is tracked as an open-weight candidate with downloads and inference examples but remains blocked in SEIS until approved."),
      source("openai-gpt-oss-120b", "https://huggingface.co/openai/gpt-oss-120b", "OpenAI gpt-oss-120b is tracked as a larger open-weight candidate, not a SEIS-owned model.")
    ],
    ecosystemScope: {
      coverageMode: "major-family-catalog-not-exhaustive",
      includesInstalledAiAssistants: true,
      includesLocalOpenWeightCandidates: true,
      includesProviderRoutedCandidates: true,
      includesEmbeddingAndRerankerCandidates: true,
      includesCodeSpecialistCandidates: true,
      includesMultimodalAndSafetyCandidates: true,
      includes512bResearchGate: true
    },
    candidateFamilies: [
      family("llama", "Meta Llama", ["1B-8B local", "70B research", "405B frontier"], "license-review-required", "local/provider candidate"),
      family("qwen", "Qwen", ["0.6B-32B dense", "30B/235B MoE", "coder, VL, image, safety"], "license-review-required-per-checkpoint", "local/provider candidate"),
      family("gemma", "Google Gemma", ["Gemma 4", "EmbeddingGemma", "ShieldGemma", "PaliGemma"], "license-review-required", "local/edge candidate"),
      family("mistral", "Mistral", ["Ministral", "Devstral", "Mistral Small", "Mistral Large"], "license-review-required-per-model", "local/provider candidate"),
      family("deepseek", "DeepSeek", ["R1 distilled", "R1 671B MoE", "V3/R1 research"], "license-review-required-per-checkpoint", "reasoning research candidate"),
      family("phi", "Microsoft Phi", ["small local", "reasoning", "vision"], "license-review-required", "small local candidate"),
      family("openai-gpt-oss", "OpenAI gpt-oss", ["20B", "120B"], "license-and-model-card-review-required", "open-weight candidate"),
      family("embedding-reranker", "Embeddings and rerankers", ["Nomic", "mixedbread", "EmbeddingGemma", "Sentence Transformers"], "license-review-required", "retrieval-first candidate"),
      family("code-specialist", "Code-specialist models", ["Qwen Coder", "CodeLlama", "Devstral", "Codestral-style"], "license-review-required-per-checkpoint", "code assistant candidate"),
      family("multimodal-safety", "Multimodal and safety models", ["Gemma variants", "Shield models", "OCR/VL/audio"], "license-and-safety-review-required", "safety/support candidate"),
      family("provider-routed", "External provider models", ["OpenAI", "Anthropic", "Gemini", "Qwen API", "Mistral API"], "backend-secret-review-required", "server-only provider candidate"),
      family("seis-512b-apex", "Future SEIS 512B AGI research target", ["512B", "highest-future"], "research-gate-only", "not routeable")
    ],
    approvalStages: [
      "family discovery",
      "exact model id and revision selection",
      "license and acceptable-use review",
      "checkpoint checksum and provenance",
      "hardware and cost estimate",
      "dataset card and clean-room provenance for training",
      "model card or adapter card",
      "benchmark plan and stop condition",
      "security review and no-secret logging",
      "human approval before install, inference, fine-tune, push, merge, or release"
    ],
    allowedToday: {
      metadataCatalog: true,
      localDemo: true,
      deterministicSeedModels: true,
      retrievalPlanning: true,
      modelInstall: false,
      checkpointDownload: false,
      inference: false,
      providerCalls: false,
      sft: false,
      lora: false,
      fullFineTune: false,
      foundationPretraining: false,
      benchmarkExecution: false,
      githubPushOrMerge: false,
      agiClaim: false
    },
    publicClaimBoundary: {
      canClaimCatalogExists: true,
      canClaimAllModelsInstalled: false,
      canClaimTrainingExecuted: false,
      canClaimAnyCheckpointDownloaded: false,
      canClaimProviderAccessVerified: false,
      canClaim20bRuntimeReady: false,
      canClaim512bRouteEligible: false,
      canClaimSEISOwnedFoundationModel: false,
      canClaimRealAgi: false
    },
    nextSafeActions: [
      "Keep adding model families as metadata records only until exact model approval exists.",
      "Prioritize retrieval/embedding evaluation before any LLM install.",
      "Use the local runtime matrix to decide whether a model is only metadata, approval-required, benchmark-required, or blocked.",
      "Create separate model cards, dataset cards, and benchmark manifests before any adapter or fine-tune experiment."
    ]
  };
}

function source(id, url, evidenceSummary) {
  return { id, url, observedDate: "2026-07-08", evidenceSummary };
}

function family(id, displayName, representativeClasses, licenseGate, role) {
  return {
    id,
    displayName,
    representativeClasses,
    licenseGate,
    role,
    installAuthorized: false,
    downloadAuthorized: false,
    inferenceAuthorized: false,
    providerCallAuthorized: false,
    trainingAuthorized: false,
    routeEligibleToday: id === "seis-512b-apex" ? false : false
  };
}

function buildReport(catalog) {
  return {
    id: "seis-ai-model-ecosystem-catalog-report",
    generatedAt: catalog.generatedAt,
    status: "model-ecosystem-catalog-defined-runtime-blocked",
    sourceCatalog: files.catalog,
    summary: {
      sources: catalog.officialResearchBaseline.length,
      candidateFamilies: catalog.candidateFamilies.length,
      installsAuthorized: catalog.candidateFamilies.filter((item) => item.installAuthorized).length,
      downloadsAuthorized: catalog.candidateFamilies.filter((item) => item.downloadAuthorized).length,
      trainingAuthorized: catalog.candidateFamilies.filter((item) => item.trainingAuthorized).length,
      routeEligibleFamilies: catalog.candidateFamilies.filter((item) => item.routeEligibleToday).length,
      canClaimRealAgi: catalog.publicClaimBoundary.canClaimRealAgi
    },
    publicClaimBoundary: catalog.publicClaimBoundary,
    nextSafeActions: catalog.nextSafeActions
  };
}

function validate(catalog, report) {
  const scripts = packageJson.scripts || {};
  ensure(catalog.id === "seis-ai-model-ecosystem-catalog", "catalog id mismatch");
  ensure(catalog.status === "catalog-ready-no-install-no-training", "catalog status mismatch");
  ensure(catalog.qualityGate === "npm run check:seis-ai-model-ecosystem-catalog", "catalog quality gate mismatch");
  ensure(catalog.reportCommand === "npm run report:seis-ai-model-ecosystem-catalog", "catalog report command mismatch");
  ensure(catalog.sourceOfTruth.languageModelIntake === files.languageModelIntake, "catalog must link language model intake");
  ensure(catalog.sourceOfTruth.localRuntimeMatrix === files.localRuntimeMatrix, "catalog must link local runtime matrix");
  ensure(catalog.ecosystemScope.coverageMode === "major-family-catalog-not-exhaustive", "catalog must not claim exhaustive coverage");
  ensureArrayIncludesAll(catalog.officialResearchBaseline.map((item) => item.id), [
    "hf-transformers",
    "hf-peft",
    "ollama-library",
    "google-gemma-docs",
    "qwen-blog",
    "mistral-models",
    "deepseek-r1",
    "openai-gpt-oss-20b",
    "openai-gpt-oss-120b"
  ], "officialResearchBaseline");
  ensureArrayIncludesAll(catalog.candidateFamilies.map((item) => item.id), [
    "llama",
    "qwen",
    "gemma",
    "mistral",
    "deepseek",
    "phi",
    "openai-gpt-oss",
    "embedding-reranker",
    "code-specialist",
    "multimodal-safety",
    "provider-routed",
    "seis-512b-apex"
  ], "candidateFamilies");
  ensure(catalog.candidateFamilies.length >= 12, "catalog must track at least 12 model family lanes");
  ensure(catalog.candidateFamilies.every((item) => item.installAuthorized === false), "no family may authorize install");
  ensure(catalog.candidateFamilies.every((item) => item.downloadAuthorized === false), "no family may authorize download");
  ensure(catalog.candidateFamilies.every((item) => item.trainingAuthorized === false), "no family may authorize training");
  ensure(catalog.candidateFamilies.every((item) => item.routeEligibleToday === false), "no family may be route eligible today");
  ensure(catalog.allowedToday.metadataCatalog === true, "metadata catalog should be allowed");
  ensure(catalog.allowedToday.modelInstall === false, "model install must remain false");
  ensure(catalog.allowedToday.checkpointDownload === false, "checkpoint download must remain false");
  ensure(catalog.allowedToday.inference === false, "inference must remain false");
  ensure(catalog.allowedToday.sft === false, "SFT must remain false");
  ensure(catalog.allowedToday.lora === false, "LoRA must remain false");
  ensure(catalog.allowedToday.fullFineTune === false, "full fine-tune must remain false");
  ensure(catalog.allowedToday.foundationPretraining === false, "foundation pretraining must remain false");
  ensure(catalog.publicClaimBoundary.canClaimCatalogExists === true, "catalog existence claim should be true");
  ensure(catalog.publicClaimBoundary.canClaimAllModelsInstalled === false, "all-models-installed claim must be false");
  ensure(catalog.publicClaimBoundary.canClaimTrainingExecuted === false, "training claim must be false");
  ensure(catalog.publicClaimBoundary.canClaimAnyCheckpointDownloaded === false, "checkpoint download claim must be false");
  ensure(catalog.publicClaimBoundary.canClaim512bRouteEligible === false, "512B route claim must be false");
  ensure(catalog.publicClaimBoundary.canClaimSEISOwnedFoundationModel === false, "SEIS-owned foundation model claim must be false");
  ensure(catalog.publicClaimBoundary.canClaimRealAgi === false, "real AGI claim must be false");
  ensure(report.status === "model-ecosystem-catalog-defined-runtime-blocked", "report status mismatch");
  ensure(report.summary.candidateFamilies >= 12, "report family count mismatch");
  ensure(report.summary.installsAuthorized === 0, "report must show zero installs authorized");
  ensure(report.summary.downloadsAuthorized === 0, "report must show zero downloads authorized");
  ensure(report.summary.trainingAuthorized === 0, "report must show zero training authorized");
  ensure(report.summary.routeEligibleFamilies === 0, "report must show zero route eligible families");
  ensure(scripts["check:seis-ai-model-ecosystem-catalog"] === "node scripts/create-seis-ai-model-ecosystem-catalog.mjs", "package.json must expose catalog check");
  ensure(scripts["report:seis-ai-model-ecosystem-catalog"] === "node scripts/create-seis-ai-model-ecosystem-catalog.mjs --write", "package.json must expose catalog report");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-ai-model-ecosystem-catalog"), "quality:governance must include model ecosystem catalog");
  ensure(intake.status === "active-intake-contract", "intake registry status mismatch");
  ensure(runtimeMatrix.status === "runtime-matrix-ready-no-install", "runtime matrix status mismatch");
}

function renderDocs(catalog, report) {
  return `# SEIS AI Model Ecosystem Catalog

This catalog is the safe answer to the request to install every language model
and train SEIS into a fully knowledgeable AI. SEIS tracks the model ecosystem,
but it does not bulk-install models, download checkpoints, run inference, call
providers, train, fine-tune, benchmark, push, merge, or claim AGI from this
catalog.

Status: ${catalog.status}

## Summary

| Field | Value |
| --- | --- |
| Candidate family lanes | ${report.summary.candidateFamilies} |
| Installs authorized | ${report.summary.installsAuthorized} |
| Downloads authorized | ${report.summary.downloadsAuthorized} |
| Training authorized | ${report.summary.trainingAuthorized} |
| Route-eligible families today | ${report.summary.routeEligibleFamilies} |
| Real AGI claim allowed | ${String(report.summary.canClaimRealAgi)} |

## Candidate Families

${catalog.candidateFamilies.map((item) => `- \`${item.id}\` - ${item.displayName}: ${item.representativeClasses.join(", ")}; ${item.licenseGate}; ${item.role}.`).join("\n")}

## Approval Stages

${catalog.approvalStages.map((item) => `- ${item}`).join("\n")}

## Public Claim Boundary

${Object.entries(catalog.publicClaimBoundary).map(([key, value]) => `- ${key}: ${String(value)}`).join("\n")}
`;
}

function renderReport(report) {
  return `# SEIS AI Model Ecosystem Catalog Report

Generated: ${report.generatedAt}

Status: ${report.status}

| Field | Value |
| --- | --- |
| Sources | ${report.summary.sources} |
| Candidate families | ${report.summary.candidateFamilies} |
| Installs authorized | ${report.summary.installsAuthorized} |
| Downloads authorized | ${report.summary.downloadsAuthorized} |
| Training authorized | ${report.summary.trainingAuthorized} |
| Route-eligible families | ${report.summary.routeEligibleFamilies} |
| Real AGI claim allowed | ${String(report.summary.canClaimRealAgi)} |

## Next Safe Actions

${report.nextSafeActions.map((item) => `- ${item}`).join("\n")}
`;
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readOptionalJson(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const filePath = path.join(root, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, value);
}

function checkJson(relativePath, expected, label) {
  const actual = readJson(relativePath, label);
  if (!actual) return;
  if (JSON.stringify(actual, null, 2) !== JSON.stringify(expected, null, 2)) {
    failures.push(`${label} is stale. Run npm run report:seis-ai-model-ecosystem-catalog.`);
  }
}

function checkText(relativePath, expected, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(filePath, "utf8");
  if (actual !== expected) failures.push(`${label} is stale. Run npm run report:seis-ai-model-ecosystem-catalog.`);
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
    console.error("SEIS AI model ecosystem catalog check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  if (successMessage) console.log(successMessage);
}
