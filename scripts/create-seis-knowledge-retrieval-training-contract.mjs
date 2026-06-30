#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const paths = {
  contract: "content/development/seis-knowledge-retrieval-training-contract.json",
  reportJson: "reports/seis-model-scaling/seis-knowledge-retrieval-training-contract.json",
  reportMd: "reports/seis-model-scaling/seis-knowledge-retrieval-training-contract.md",
  retrievalSourceProvenance: "content/development/seis-retrieval-source-provenance-manifest.json",
  retrievalEvaluationFixtures: "content/development/seis-retrieval-evaluation-fixtures.json",
  installTrainingLedger: "content/development/seis-language-model-install-training-ledger.json",
  modelScalingProfile: "content/development/seis-model-scaling-hardware-profile.json",
  agiEvaluationProtocol: "content/development/seis-agi-evaluation-protocol.json",
  doc: "docs/ai/seis-knowledge-retrieval-training.md",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(paths.contract) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const retrievalSourceProvenance = readJson(paths.retrievalSourceProvenance, "retrieval source provenance manifest");
const retrievalEvaluationFixtures = readJson(paths.retrievalEvaluationFixtures, "retrieval evaluation fixtures");
const installTrainingLedger = readJson(paths.installTrainingLedger, "language model install/training ledger");
const modelScalingProfile = readJson(paths.modelScalingProfile, "model scaling profile");
const agiEvaluationProtocol = readJson(paths.agiEvaluationProtocol, "AGI evaluation protocol");
const packageJson = readJson(paths.packageJson, "package.json");

if (!retrievalSourceProvenance || !retrievalEvaluationFixtures || !installTrainingLedger || !modelScalingProfile || !agiEvaluationProtocol || !packageJson) {
  process.exit(1);
}

const contract = buildContract({
  generatedAt,
  retrievalSourceProvenance,
  retrievalEvaluationFixtures,
  installTrainingLedger,
  modelScalingProfile,
  agiEvaluationProtocol
});
const report = buildReport(contract);
const markdown = renderMarkdown(report);

if (mode === "write") {
  writeJson(paths.contract, contract);
  writeJson(paths.reportJson, report);
  writeText(paths.reportMd, markdown);
  writeText(paths.doc, renderDoc(contract, report));
  console.log("SEIS knowledge retrieval training contract generated.");
  console.log(JSON.stringify({
    contract: paths.contract,
    report: paths.reportJson,
    markdown: paths.reportMd,
    docs: paths.doc
  }, null, 2));
} else {
  checkJson(paths.contract, contract, "knowledge retrieval training contract");
  checkJson(paths.reportJson, report, "knowledge retrieval training report");
  checkText(paths.reportMd, markdown, "knowledge retrieval training markdown report");
  checkText(paths.doc, renderDoc(contract, report), "knowledge retrieval training docs");
  validateContract(contract, packageJson);
  finish("SEIS knowledge retrieval training contract check passed.");
}

function buildContract({ generatedAt, retrievalSourceProvenance, retrievalEvaluationFixtures, installTrainingLedger, modelScalingProfile, agiEvaluationProtocol }) {
  return {
    id: "seis-knowledge-retrieval-training-contract",
    version: "2026.07.01",
    generatedAt,
    status: "contract-defined-not-indexed",
    qualityGate: "npm run check:seis-knowledge-retrieval-training",
    reportCommand: "npm run report:seis-knowledge-retrieval-training",
    purpose: "Define the safe knowledge and retrieval foundation required before SEIS can become genuinely useful, public-ready, or eligible for future model training claims.",
    truthBoundary: [
      "This contract builds no retrieval index.",
      "It installs no embedding or reranker model.",
      "It sends no repository data to external providers.",
      "It downloads no datasets.",
      "It runs no fine-tune, LoRA, adapter training, foundation pretraining, or benchmark.",
      "It does not prove SEIS is fully knowledgeable, routeable 512B, or AGI."
    ],
    sourceOfTruth: {
      retrievalSourceProvenance: paths.retrievalSourceProvenance,
      retrievalEvaluationFixtures: paths.retrievalEvaluationFixtures,
      installTrainingLedger: paths.installTrainingLedger,
      modelScalingProfile: paths.modelScalingProfile,
      agiEvaluationProtocol: paths.agiEvaluationProtocol,
      docs: paths.doc
    },
    internetResearchBaseline: [
      {
        id: "huggingface-transformers",
        sourceType: "official-docs",
        url: "https://huggingface.co/docs/transformers/index",
        usedFor: "Framework boundary for model training/inference planning; checkpoint provenance remains separate."
      },
      {
        id: "ollama-library",
        sourceType: "official-catalog",
        url: "https://ollama.com/library",
        usedFor: "Local model family discovery; catalog presence does not grant SEIS install permission."
      },
      {
        id: "meta-llama-3-1-405b",
        sourceType: "official-announcement",
        url: "https://ai.meta.com/blog/meta-llama-3-1/",
        usedFor: "Frontier-scale parameter baseline showing why 405B/512B must remain research-scale."
      },
      {
        id: "deepseek-v3",
        sourceType: "primary-repo",
        url: "https://github.com/deepseek-ai/DeepSeek-V3",
        usedFor: "MoE scale reference; total and active parameters must be tracked separately."
      },
      {
        id: "nist-ai-rmf",
        sourceType: "official-guidance",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        usedFor: "Risk management baseline for public AI readiness and governance."
      }
    ],
    approvedToday: {
      localSourceInventory: true,
      metadataOnlySourceCatalog: true,
      retrievalArchitecturePlanning: true,
      sourceProvenanceManifest: retrievalSourceProvenance.status === "manifest-defined-index-blocked",
      retrievalEvaluationFixtures: retrievalEvaluationFixtures.status === "fixtures-defined-not-run",
      retrievalIndexBuild: false,
      embeddingModelInstall: false,
      rerankerModelInstall: false,
      providerEmbeddingCalls: false,
      externalWebCrawl: false,
      datasetDownload: false,
      trainingOnRetrievedSources: false,
      runtimeAuthority: false
    },
    knowledgeDefinition: {
      term: "tam-bilgili-seis",
      meaning: "Source-grounded SEIS knowledge over approved repository, documentation, governance, roadmap, security, AI, model, and public-source metadata with measurable retrieval/eval quality.",
      nonMeaning: "Not a claim that one model has memorized all knowledge, trained on all sources, or achieved AGI."
    },
    sourceClasses: [
      {
        id: "repo-public-docs",
        status: "candidate-allowlisted",
        examples: ["README.md", "ARCHITECTURE.md", "ROADMAP.md", "SECURITY.md", "docs/**"],
        allowedToday: "metadata inventory only",
        beforeIndexBuild: ["path allowlist", "secret scan", "license/provenance note", "chunking strategy"]
      },
      {
        id: "repo-governance-json",
        status: "candidate-allowlisted",
        examples: ["content/development/seis-*.json", "packages/seis-ai/models/*.json"],
        allowedToday: "metadata inventory only",
        beforeIndexBuild: ["schema validation", "secret scan", "source-of-truth mapping", "staleness check"]
      },
      {
        id: "repo-reports",
        status: "candidate-allowlisted",
        examples: ["reports/seis-model-scaling/*.md", "reports/seis-ai-workforce-training/*.md"],
        allowedToday: "metadata inventory only",
        beforeIndexBuild: ["generated artifact check", "stale report check", "claim boundary review"]
      },
      {
        id: "official-public-ai-sources",
        status: "metadata-only",
        examples: ["official model docs", "official model cards", "NIST guidance", "primary papers"],
        allowedToday: "citation and metadata only",
        beforeIndexBuild: ["license review", "citation record", "no bulk scrape", "cache policy"]
      },
      {
        id: "private-user-data",
        status: "blocked",
        examples: [".env", "tokens", "SSH keys", "cookies", "private notes", "unreviewed attachments"],
        allowedToday: "blocked",
        beforeIndexBuild: ["never index without explicit separate policy"]
      }
    ],
    requiredBeforeRetrievalIndexBuild: [
      "path allowlist for source files",
      "source provenance manifest accepted",
      "retrieval evaluation fixtures accepted",
      "secret and credential scan",
      "private data exclusion policy",
      "chunk schema and source URI policy",
      "provenance manifest with source type and license notes",
      "staleness detection for generated reports",
      "local-only fallback behavior",
      "redacted logs",
      "human approval"
    ],
    requiredBeforeEmbeddingOrRerankerInstall: [
      "specific model id and version",
      "license and acceptable-use review",
      "checkpoint source and checksum",
      "model card",
      "disk/RAM/GPU budget",
      "rollback and deletion plan",
      "no-secret prompt/log boundary",
      "human approval"
    ],
    requiredBeforeFullyKnowledgeableClaim: [
      "retrieval index built from approved sources",
      "retrieval precision and recall evaluation",
      "citation faithfulness evaluation",
      "hallucination regression suite",
      "security redaction test",
      "fresh clone validation",
      "public documentation explaining real/mock/planned states",
      "independent review"
    ],
    agentResponsibilities: [
      agent("architect", "Own retrieval architecture, source-of-truth mapping, and promotion boundaries."),
      agent("code", "Implement indexers only after allowlists and secret scans are accepted."),
      agent("design", "Keep Command Center knowledge surfaces honest and readable."),
      agent("ui-ux", "Expose source citations, stale states, and fallback modes clearly."),
      agent("research", "Maintain primary-source citations and current model landscape notes."),
      agent("search", "Define retrieval quality metrics and query fixtures."),
      agent("security", "Block secrets, private files, and unsafe provider routing."),
      agent("devops", "Plan local-only build, cache, and rollback workflows."),
      agent("documentation", "Document source classes, non-claims, and run commands."),
      agent("qa", "Validate precision/recall, citation, and hallucination fixtures."),
      agent("cloud", "Keep cloud/provider paths disabled until approved."),
      agent("automation", "Keep reports reproducible and stale checks strict.")
    ],
    routeEligibility: {
      localDemoKnowledgeSurface: true,
      retrievalIndexRoute: false,
      embeddingRoute: false,
      rerankerRoute: false,
      cloudKnowledgeRoute: false,
      trainingDataRoute: false,
      agiRoute: false,
      evidence: {
        installTrainingLedgerStatus: installTrainingLedger.status,
        retrievalSourceProvenanceStatus: retrievalSourceProvenance.status,
        retrievalSourceSecretFindings: retrievalSourceProvenance.secretScan?.findingsCount ?? null,
        retrievalEvaluationFixtureStatus: retrievalEvaluationFixtures.status,
        retrievalEvaluationRunApproved: retrievalEvaluationFixtures.approvedToday?.evaluationRun === true,
        modelScalingApexStatus: modelScalingProfile.apexTarget?.compatibilityStatus || "not-scoped",
        agiClaimAllowed: agiEvaluationProtocol.agiClaimAllowed === true
      }
    },
    publicClaims: {
      canClaimKnowledgeContractDefined: true,
      canClaimRetrievalIndexBuilt: false,
      canClaimEmbeddingModelInstalled: false,
      canClaimSEISTrainedOnKnowledgeBase: false,
      canClaimFullyKnowledgeableAI: false,
      canClaimAGI: false
    }
  };
}

function buildReport(contract) {
  return {
    id: "seis-knowledge-retrieval-training-contract-report",
    generatedAt: contract.generatedAt,
    status: "contract-ready-index-not-built",
    sourceContract: paths.contract,
    summary: {
      sourceClassCount: contract.sourceClasses.length,
      internetResearchSourceCount: contract.internetResearchBaseline.length,
      agentResponsibilityCount: contract.agentResponsibilities.length,
      sourceProvenanceManifest: contract.approvedToday.sourceProvenanceManifest,
      retrievalEvaluationFixtures: contract.approvedToday.retrievalEvaluationFixtures,
      retrievalIndexBuild: contract.approvedToday.retrievalIndexBuild,
      embeddingModelInstall: contract.approvedToday.embeddingModelInstall,
      providerEmbeddingCalls: contract.approvedToday.providerEmbeddingCalls,
      canClaimFullyKnowledgeableAI: contract.publicClaims.canClaimFullyKnowledgeableAI,
      canClaimAGI: contract.publicClaims.canClaimAGI
    },
    safeNextCommands: [
      "npm run report:seis-knowledge-retrieval-training",
      "npm run check:seis-retrieval-source-provenance",
      "npm run check:seis-retrieval-evaluation-fixtures",
      "npm run check:seis-knowledge-retrieval-training",
      "npm run check:seis-language-model-install-training-ledger",
      "npm run check:seis-agi-evaluation-protocol"
    ],
    nextHumanApprovalNeededBefore: [
      "building a persistent retrieval index",
      "installing an embedding or reranker model",
      "calling an external embedding provider",
      "using private user data",
      "training on retrieved sources",
      "claiming fully knowledgeable AI or AGI"
    ]
  };
}

function agent(id, responsibility) {
  return {
    id,
    responsibility,
    authority: "plan-review-validate-only",
    runtimeAuthority: false
  };
}

function validateContract(contract, packageJson) {
  ensure(contract.id === "seis-knowledge-retrieval-training-contract", "contract id mismatch");
  ensure(contract.status === "contract-defined-not-indexed", "contract status mismatch");
  ensure(contract.qualityGate === "npm run check:seis-knowledge-retrieval-training", "qualityGate mismatch");
  ensure(contract.reportCommand === "npm run report:seis-knowledge-retrieval-training", "reportCommand mismatch");
  ensure(contract.sourceOfTruth?.retrievalSourceProvenance === paths.retrievalSourceProvenance, "retrieval source provenance link mismatch");
  ensure(contract.sourceOfTruth?.retrievalEvaluationFixtures === paths.retrievalEvaluationFixtures, "retrieval evaluation fixtures link mismatch");

  for (const phrase of [
    "builds no retrieval index",
    "installs no embedding or reranker model",
    "sends no repository data to external providers",
    "downloads no datasets",
    "does not prove SEIS is fully knowledgeable"
  ]) {
    ensure(contract.truthBoundary.some((item) => item.includes(phrase)), `truthBoundary missing ${phrase}`);
  }

  for (const [field, expected] of Object.entries({
    localSourceInventory: true,
    metadataOnlySourceCatalog: true,
    retrievalArchitecturePlanning: true,
    sourceProvenanceManifest: true,
    retrievalEvaluationFixtures: true,
    retrievalIndexBuild: false,
    embeddingModelInstall: false,
    rerankerModelInstall: false,
    providerEmbeddingCalls: false,
    externalWebCrawl: false,
    datasetDownload: false,
    trainingOnRetrievedSources: false,
    runtimeAuthority: false
  })) {
    ensure(contract.approvedToday?.[field] === expected, `approvedToday.${field} must be ${expected}`);
  }

  ensure(contract.internetResearchBaseline.length >= 5, "internet research baseline must include at least five primary sources");
  for (const id of ["huggingface-transformers", "ollama-library", "meta-llama-3-1-405b", "deepseek-v3", "nist-ai-rmf"]) {
    ensure(contract.internetResearchBaseline.some((source) => source.id === id), `internet research baseline missing ${id}`);
  }

  const sourceClasses = new Map(contract.sourceClasses.map((source) => [source.id, source]));
  ensure(sourceClasses.get("private-user-data")?.status === "blocked", "private user data must be blocked");
  ensure(sourceClasses.get("official-public-ai-sources")?.status === "metadata-only", "public AI sources must stay metadata-only");
  ensure(contract.requiredBeforeRetrievalIndexBuild.includes("source provenance manifest accepted"), "retrieval index build must require provenance manifest");
  ensure(contract.requiredBeforeRetrievalIndexBuild.includes("retrieval evaluation fixtures accepted"), "retrieval index build must require retrieval evaluation fixtures");
  ensure(contract.requiredBeforeRetrievalIndexBuild.includes("secret and credential scan"), "retrieval index build must require secret scan");
  ensure(contract.routeEligibility?.evidence?.retrievalSourceProvenanceStatus === "manifest-defined-index-blocked", "route evidence must include provenance manifest status");
  ensure(contract.routeEligibility?.evidence?.retrievalSourceSecretFindings === 0, "route evidence must include zero provenance secret findings");
  ensure(contract.routeEligibility?.evidence?.retrievalEvaluationFixtureStatus === "fixtures-defined-not-run", "route evidence must include retrieval evaluation fixture status");
  ensure(contract.routeEligibility?.evidence?.retrievalEvaluationRunApproved === false, "route evidence must show retrieval evaluation run is not approved");
  ensure(contract.requiredBeforeEmbeddingOrRerankerInstall.includes("checkpoint source and checksum"), "embedding/reranker install must require checksum");
  ensure(contract.requiredBeforeFullyKnowledgeableClaim.includes("independent review"), "fully knowledgeable claim must require independent review");
  ensure(contract.agentResponsibilities.length === 12, "contract must cover all 12 AI sub-agent roles");
  ensure(contract.agentResponsibilities.every((agent) => agent.runtimeAuthority === false), "all agent runtime authority must remain false");

  for (const [field, expected] of Object.entries({
    retrievalIndexRoute: false,
    embeddingRoute: false,
    rerankerRoute: false,
    cloudKnowledgeRoute: false,
    trainingDataRoute: false,
    agiRoute: false
  })) {
    ensure(contract.routeEligibility?.[field] === expected, `routeEligibility.${field} must be ${expected}`);
  }

  for (const [field, expected] of Object.entries({
    canClaimKnowledgeContractDefined: true,
    canClaimRetrievalIndexBuilt: false,
    canClaimEmbeddingModelInstalled: false,
    canClaimSEISTrainedOnKnowledgeBase: false,
    canClaimFullyKnowledgeableAI: false,
    canClaimAGI: false
  })) {
    ensure(contract.publicClaims?.[field] === expected, `publicClaims.${field} must be ${expected}`);
  }

  ensure(
    packageJson.scripts?.["check:seis-knowledge-retrieval-training"] === "node scripts/create-seis-knowledge-retrieval-training-contract.mjs",
    "package.json must expose check:seis-knowledge-retrieval-training"
  );
  ensure(
    packageJson.scripts?.["report:seis-knowledge-retrieval-training"] === "node scripts/create-seis-knowledge-retrieval-training-contract.mjs --write",
    "package.json must expose report:seis-knowledge-retrieval-training"
  );
  ensure(
    packageJson.scripts?.["check:seis-retrieval-source-provenance"] === "node scripts/create-seis-retrieval-source-provenance-manifest.mjs",
    "package.json must expose check:seis-retrieval-source-provenance"
  );
  ensure(
    packageJson.scripts?.["report:seis-retrieval-source-provenance"] === "node scripts/create-seis-retrieval-source-provenance-manifest.mjs --write",
    "package.json must expose report:seis-retrieval-source-provenance"
  );
  ensure(
    packageJson.scripts?.["check:seis-retrieval-evaluation-fixtures"] === "node scripts/create-seis-retrieval-evaluation-fixtures.mjs",
    "package.json must expose check:seis-retrieval-evaluation-fixtures"
  );
  ensure(
    packageJson.scripts?.["report:seis-retrieval-evaluation-fixtures"] === "node scripts/create-seis-retrieval-evaluation-fixtures.mjs --write",
    "package.json must expose report:seis-retrieval-evaluation-fixtures"
  );
}

function renderMarkdown(report) {
  const commands = report.safeNextCommands.map((command) => `- \`${command}\``).join("\n");
  const approvals = report.nextHumanApprovalNeededBefore.map((item) => `- ${item}`).join("\n");

  return `# SEIS Knowledge Retrieval Training Contract

Generated: ${report.generatedAt}

Status: ${report.status}

## Summary

| Field | Value |
| --- | --- |
| Source classes | ${report.summary.sourceClassCount} |
| Internet research sources | ${report.summary.internetResearchSourceCount} |
| Agent responsibilities | ${report.summary.agentResponsibilityCount} |
| Source provenance manifest accepted | ${String(report.summary.sourceProvenanceManifest)} |
| Retrieval evaluation fixtures accepted | ${String(report.summary.retrievalEvaluationFixtures)} |
| Retrieval index build approved | ${String(report.summary.retrievalIndexBuild)} |
| Embedding model install approved | ${String(report.summary.embeddingModelInstall)} |
| Provider embedding calls approved | ${String(report.summary.providerEmbeddingCalls)} |
| Fully knowledgeable AI claim allowed | ${String(report.summary.canClaimFullyKnowledgeableAI)} |
| AGI claim allowed | ${String(report.summary.canClaimAGI)} |

## Safe Next Commands

${commands}

## Human Approval Needed Before

${approvals}
`;
}

function renderDoc(contract, report) {
  const sources = contract.internetResearchBaseline
    .map((source) => `- [${source.id}](${source.url}) - ${source.usedFor}`)
    .join("\n");
  const classes = contract.sourceClasses
    .map((source) => `| ${source.id} | ${source.status} | ${source.allowedToday} |`)
    .join("\n");

  return `# SEIS Knowledge Retrieval Training

SEIS'in "tam bilgili" hedefi tek bir modelin her seyi ezberlemesi olarak
tanımlanmaz. Guvenli hedef; kaynak-provenansli retrieval, olculebilir kalite,
redaksiyon, yerel fallback ve claim kapilaridir.

## Current Status

- Contract status: ${contract.status}
- Retrieval source provenance manifest accepted: ${String(contract.approvedToday.sourceProvenanceManifest)}
- Retrieval evaluation fixtures accepted: ${String(contract.approvedToday.retrievalEvaluationFixtures)}
- Retrieval index built: ${String(contract.approvedToday.retrievalIndexBuild)}
- Embedding model installed: ${String(contract.approvedToday.embeddingModelInstall)}
- Provider embedding calls: ${String(contract.approvedToday.providerEmbeddingCalls)}
- Fully knowledgeable AI claim: ${String(contract.publicClaims.canClaimFullyKnowledgeableAI)}
- AGI claim: ${String(contract.publicClaims.canClaimAGI)}

## Source Classes

| Source class | Status | Allowed today |
| --- | --- | --- |
${classes}

## Internet Research Baseline

${sources}

## Required Before Retrieval Index Build

${contract.requiredBeforeRetrievalIndexBuild.map((item) => `- ${item}`).join("\n")}

## Required Before Fully Knowledgeable Claim

${contract.requiredBeforeFullyKnowledgeableClaim.map((item) => `- ${item}`).join("\n")}

## Commands

\`\`\`bash
npm run report:seis-knowledge-retrieval-training
npm run check:seis-retrieval-source-provenance
npm run check:seis-retrieval-evaluation-fixtures
npm run check:seis-knowledge-retrieval-training
\`\`\`

## Report

Reviewer report:
\`reports/seis-model-scaling/seis-knowledge-retrieval-training-contract.md\`
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

  const actualJson = JSON.stringify(actual, null, 2);
  const expectedJson = JSON.stringify(expected, null, 2);
  if (actualJson !== expectedJson) {
    failures.push(`${label} is stale. Run npm run report:seis-knowledge-retrieval-training.`);
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
    failures.push(`${label} is stale. Run npm run report:seis-knowledge-retrieval-training.`);
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS knowledge retrieval training contract check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
