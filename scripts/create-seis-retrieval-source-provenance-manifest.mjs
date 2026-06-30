#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const generatedArtifactExclusions = new Set([
  "docs/ai/seis-retrieval-source-provenance.md",
  "docs/ai/seis-knowledge-retrieval-training.md",
  "reports/seis-model-scaling/seis-retrieval-source-provenance-manifest.json",
  "reports/seis-model-scaling/seis-retrieval-source-provenance-manifest.md",
  "reports/seis-model-scaling/seis-knowledge-retrieval-training-contract.json",
  "reports/seis-model-scaling/seis-knowledge-retrieval-training-contract.md"
]);

const paths = {
  manifest: "content/development/seis-retrieval-source-provenance-manifest.json",
  reportJson: "reports/seis-model-scaling/seis-retrieval-source-provenance-manifest.json",
  reportMd: "reports/seis-model-scaling/seis-retrieval-source-provenance-manifest.md",
  knowledgeRetrievalTraining: "content/development/seis-knowledge-retrieval-training-contract.json",
  securityPolicy: "SECURITY.md",
  docs: "docs/ai/seis-retrieval-source-provenance.md",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(paths.manifest) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const packageJson = readJson(paths.packageJson, "package.json");
const knowledgeRetrievalTraining = readJson(paths.knowledgeRetrievalTraining, "knowledge retrieval training contract");

if (!packageJson || !knowledgeRetrievalTraining) process.exit(1);

const manifest = buildManifest({ generatedAt, packageJson, knowledgeRetrievalTraining });
const report = buildReport(manifest);
const markdown = renderReportMarkdown(report);
const docs = renderDocs(manifest, report);

if (mode === "write") {
  writeJson(paths.manifest, manifest);
  writeJson(paths.reportJson, report);
  writeText(paths.reportMd, markdown);
  writeText(paths.docs, docs);
  console.log("SEIS retrieval source provenance manifest generated.");
  console.log(JSON.stringify({
    manifest: paths.manifest,
    report: paths.reportJson,
    markdown: paths.reportMd,
    docs: paths.docs
  }, null, 2));
} else {
  checkJson(paths.manifest, manifest, "retrieval source provenance manifest");
  checkJson(paths.reportJson, report, "retrieval source provenance report");
  checkText(paths.reportMd, markdown, "retrieval source provenance markdown report");
  checkText(paths.docs, docs, "retrieval source provenance docs");
  validateManifest(manifest, packageJson);
  finish("SEIS retrieval source provenance manifest check passed.");
}

function buildManifest({ generatedAt, packageJson, knowledgeRetrievalTraining }) {
  const sourceGroups = [
    {
      id: "root-governance-docs",
      status: "candidate-allowlisted-metadata-only",
      provenanceLabel: "repo-owned-governance",
      include: ["AGENTS.md", "README.md", "ARCHITECTURE.md", "ROADMAP.md", "SECURITY.md", "CONTRIBUTING.md", "CHANGELOG.md", "LICENSE"],
      requiredBeforeIndex: ["secret scan zero findings", "chunk policy accepted", "source URI policy accepted"]
    },
    {
      id: "ai-docs",
      status: "candidate-allowlisted-metadata-only",
      provenanceLabel: "repo-owned-ai-docs",
      include: ["docs/ai/**/*.md"],
      requiredBeforeIndex: ["secret scan zero findings", "claim-boundary review", "staleness review"]
    },
    {
      id: "ai-governance-json",
      status: "candidate-allowlisted-metadata-only",
      provenanceLabel: "repo-owned-ai-json",
      include: [
        "content/development/seis-ai-*.json",
        "content/development/seis-agi-*.json",
        "content/development/seis-language-model-*.json",
        "content/development/seis-model-*.json"
      ],
      requiredBeforeIndex: ["schema validation", "secret scan zero findings", "source-of-truth mapping"]
    },
    {
      id: "ai-readiness-reports",
      status: "candidate-allowlisted-metadata-only",
      provenanceLabel: "generated-ai-readiness-report",
      include: [
        "reports/seis-ai-public-readiness/**/*.{json,md}",
        "reports/seis-model-scaling/seis-*.{json,md}"
      ],
      requiredBeforeIndex: ["generated artifact freshness check", "claim-boundary review", "secret scan zero findings"]
    }
  ];

  const fileRecords = [];
  for (const group of sourceGroups) {
    const files = expandIncludes(group.include);
    for (const relativePath of files) {
      const text = readText(relativePath, relativePath);
      const hash = sha256(text);
      fileRecords.push({
        groupId: group.id,
        path: relativePath,
        sourceUri: `seis://retrieval/source/${group.id}/${hash.slice(0, 16)}`,
        provenanceLabel: group.provenanceLabel,
        bytes: Buffer.byteLength(text),
        sha256: hash,
        mediaType: mediaTypeFor(relativePath),
        indexApprovedToday: false
      });
    }
  }

  const secretScan = scanFiles(fileRecords);

  return {
    id: "seis-retrieval-source-provenance-manifest",
    version: "2026.07.01",
    generatedAt,
    status: "manifest-defined-index-blocked",
    qualityGate: "npm run check:seis-retrieval-source-provenance",
    reportCommand: "npm run report:seis-retrieval-source-provenance",
    resourceUri: "seis://ai/retrieval-source-provenance-manifest.json",
    truthBoundary: [
      "This manifest inventories candidate retrieval sources only.",
      "It builds no persistent retrieval index.",
      "It installs no embedding, reranker, or language model.",
      "It calls no external providers.",
      "It sends no repository content outside the local checkout.",
      "It trains no model and proves no AGI or 512B route eligibility."
    ],
    sourceOfTruth: {
      knowledgeRetrievalTraining: paths.knowledgeRetrievalTraining,
      securityPolicy: paths.securityPolicy,
      docs: paths.docs
    },
    internetResearchBaseline: [
      {
        id: "nist-ai-rmf",
        sourceType: "official-guidance",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        usedFor: "Risk management baseline for source governance and public AI readiness."
      },
      {
        id: "owasp-llm-prompt-injection",
        sourceType: "official-guidance",
        url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
        usedFor: "Prompt-injection and untrusted-content boundary for retrieval source intake."
      },
      {
        id: "github-secret-scanning",
        sourceType: "official-docs",
        url: "https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning",
        usedFor: "Secret-scanning baseline for GitHub-ready repository source intake."
      }
    ],
    approvedToday: {
      sourceInventory: true,
      provenanceManifest: true,
      localSecretScanDryRun: true,
      persistentRetrievalIndex: false,
      embeddingModelInstall: false,
      providerEmbeddingCalls: false,
      privateDataIndexing: false,
      trainingOnIndexedSources: false,
      runtimeAuthority: false
    },
    sourceGroups,
    blockedPathClasses: [
      { id: "environment-files", patterns: [".env", ".env.*", "*.env.*"], reason: "credential risk" },
      { id: "ssh-and-private-keys", patterns: ["*.pem", "*.key", "id_rsa", "id_ed25519*"], reason: "private key risk" },
      { id: "private-brain-notes", patterns: ["seis-brain/private/**", "seis-brain/local-only/**"], reason: "private user data" },
      { id: "dependencies-and-builds", patterns: ["node_modules/**", "dist/**", "build/**", ".next/**"], reason: "generated or third-party volume" },
      { id: "archives-and-binaries", patterns: ["*.zip", "*.tar", "*.gz", "*.7z", "*.rar"], reason: "opaque binary/archive content" }
    ],
    chunkPolicy: {
      status: "defined-not-executed",
      maxChunkChars: 2400,
      overlapChars: 160,
      sourceUriRequired: true,
      sha256Required: true,
      redactedLogRequired: true
    },
    secretScan,
    fileRecords,
    requiredBeforePersistentIndexBuild: [
      "all source groups reviewed by a human",
      "secretScan.findingsCount stays 0 on the target commit",
      "blocked path classes remain excluded",
      "chunk policy and source URI policy accepted",
      "provenance labels reviewed",
      "prompt-injection handling plan accepted",
      "retrieval evaluation fixtures created",
      "human approval recorded"
    ],
    publicClaims: {
      canClaimSourceInventoryDefined: true,
      canClaimProvenanceManifestDefined: true,
      canClaimRetrievalIndexBuilt: false,
      canClaimEmbeddingModelInstalled: false,
      canClaimProviderEmbeddingUsed: false,
      canClaimFullyKnowledgeableAI: false,
      canClaimAGI: false,
      canClaim512BRouteEligible: false
    },
    linkedKnowledgeContractStatus: knowledgeRetrievalTraining.status,
    packageScripts: {
      check: packageJson.scripts?.["check:seis-retrieval-source-provenance"] || null,
      report: packageJson.scripts?.["report:seis-retrieval-source-provenance"] || null
    }
  };
}

function buildReport(manifest) {
  const groupRows = manifest.sourceGroups.map((group) => {
    const files = manifest.fileRecords.filter((record) => record.groupId === group.id);
    return {
      id: group.id,
      status: group.status,
      provenanceLabel: group.provenanceLabel,
      fileCount: files.length
    };
  });

  return {
    id: "seis-retrieval-source-provenance-report",
    generatedAt: manifest.generatedAt,
    status: "source-inventory-ready-index-blocked",
    sourceManifest: paths.manifest,
    summary: {
      sourceGroupCount: manifest.sourceGroups.length,
      fileRecordCount: manifest.fileRecords.length,
      scannedFileCount: manifest.secretScan.scannedFileCount,
      findingsCount: manifest.secretScan.findingsCount,
      persistentRetrievalIndex: manifest.approvedToday.persistentRetrievalIndex,
      embeddingModelInstall: manifest.approvedToday.embeddingModelInstall,
      providerEmbeddingCalls: manifest.approvedToday.providerEmbeddingCalls,
      privateDataIndexing: manifest.approvedToday.privateDataIndexing
    },
    groups: groupRows,
    blockedPathClasses: manifest.blockedPathClasses,
    safeNextCommands: [
      "npm run report:seis-retrieval-source-provenance",
      "npm run check:seis-retrieval-source-provenance",
      "npm run check:seis-knowledge-retrieval-training",
      "npm run check:seis-ai-public-readiness"
    ],
    humanApprovalNeededBefore: [
      "building a persistent retrieval index",
      "installing an embedding or reranker model",
      "calling an external embedding provider",
      "indexing private user data",
      "training on indexed content",
      "claiming fully knowledgeable AI, 512B route eligibility, or AGI"
    ]
  };
}

function validateManifest(manifest, packageJson) {
  ensure(manifest.id === "seis-retrieval-source-provenance-manifest", "manifest id mismatch");
  ensure(manifest.status === "manifest-defined-index-blocked", "manifest status mismatch");
  ensure(manifest.qualityGate === "npm run check:seis-retrieval-source-provenance", "manifest qualityGate mismatch");
  ensure(manifest.reportCommand === "npm run report:seis-retrieval-source-provenance", "manifest reportCommand mismatch");
  ensure(manifest.resourceUri === "seis://ai/retrieval-source-provenance-manifest.json", "manifest resource URI mismatch");
  ensure(manifest.sourceOfTruth?.knowledgeRetrievalTraining === paths.knowledgeRetrievalTraining, "knowledge retrieval link mismatch");
  ensure(manifest.sourceGroups.length >= 4, "manifest must include at least four source groups");
  ensure(manifest.fileRecords.length > 10, "manifest must include concrete source records");
  ensure(manifest.secretScan.scannedFileCount === manifest.fileRecords.length, "secret scan file count mismatch");
  ensure(manifest.secretScan.findingsCount === 0, "secret scan findings must stay zero");
  ensure(manifest.blockedPathClasses.some((item) => item.id === "environment-files"), "environment files must be blocked");
  ensure(manifest.blockedPathClasses.some((item) => item.id === "private-brain-notes"), "private brain notes must be blocked");

  for (const [field, expected] of Object.entries({
    sourceInventory: true,
    provenanceManifest: true,
    localSecretScanDryRun: true,
    persistentRetrievalIndex: false,
    embeddingModelInstall: false,
    providerEmbeddingCalls: false,
    privateDataIndexing: false,
    trainingOnIndexedSources: false,
    runtimeAuthority: false
  })) {
    ensure(manifest.approvedToday?.[field] === expected, `approvedToday.${field} must be ${expected}`);
  }

  for (const [field, expected] of Object.entries({
    canClaimSourceInventoryDefined: true,
    canClaimProvenanceManifestDefined: true,
    canClaimRetrievalIndexBuilt: false,
    canClaimEmbeddingModelInstalled: false,
    canClaimProviderEmbeddingUsed: false,
    canClaimFullyKnowledgeableAI: false,
    canClaimAGI: false,
    canClaim512BRouteEligible: false
  })) {
    ensure(manifest.publicClaims?.[field] === expected, `publicClaims.${field} must be ${expected}`);
  }

  ensure(
    packageJson.scripts?.["check:seis-retrieval-source-provenance"] === "node scripts/create-seis-retrieval-source-provenance-manifest.mjs",
    "package.json must expose check:seis-retrieval-source-provenance"
  );
  ensure(
    packageJson.scripts?.["report:seis-retrieval-source-provenance"] === "node scripts/create-seis-retrieval-source-provenance-manifest.mjs --write",
    "package.json must expose report:seis-retrieval-source-provenance"
  );
}

function expandIncludes(patterns) {
  const files = new Set();
  for (const pattern of patterns) {
    for (const file of expandPattern(pattern)) files.add(file);
  }
  return [...files].filter(isReadableTextFile).sort();
}

function expandPattern(pattern) {
  if (pattern.includes("**/*.")) {
    const [directory, extensionPart] = pattern.split("/**/*.");
    const extensions = extensionPart.replace(/[{}]/g, "").split(",").map((item) => `.${item}`);
    return walk(directory).filter((file) => extensions.some((extension) => file.endsWith(extension)));
  }
  if (pattern.endsWith("/*.json")) {
    return listDirectory(path.dirname(pattern)).filter((file) => file.endsWith(".json"));
  }
  if (pattern.endsWith("/*.md")) {
    return listDirectory(path.dirname(pattern)).filter((file) => file.endsWith(".md"));
  }
  if (pattern.includes("*")) {
    const directory = path.dirname(pattern);
    const basename = path.basename(pattern);
    const [prefix, suffix] = basename.split("*");
    return listDirectory(directory).filter((file) => path.basename(file).startsWith(prefix) && path.basename(file).endsWith(suffix || ""));
  }
  return existsSync(path.join(root, pattern)) ? [pattern] : [];
}

function listDirectory(relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return [];
  return readdirSync(absoluteDirectory)
    .map((entry) => path.join(relativeDirectory, entry).replaceAll(path.sep, "/"))
    .filter((relativePath) => existsSync(path.join(root, relativePath)) && statSync(path.join(root, relativePath)).isFile());
}

function walk(relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return [];
  const entries = [];
  for (const entry of readdirSync(absoluteDirectory)) {
    const relativePath = path.join(relativeDirectory, entry).replaceAll(path.sep, "/");
    const absolutePath = path.join(root, relativePath);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) entries.push(...walk(relativePath));
    if (stats.isFile()) entries.push(relativePath);
  }
  return entries;
}

function isReadableTextFile(relativePath) {
  if (isBlockedPath(relativePath)) return false;
  if (generatedArtifactExclusions.has(relativePath)) return false;
  const extension = path.extname(relativePath);
  return [".md", ".json", ".txt", ""].includes(extension);
}

function isBlockedPath(relativePath) {
  return [
    ".env",
    ".env.",
    "node_modules/",
    "dist/",
    "build/",
    ".next/",
    "seis-brain/private/",
    "seis-brain/local-only/"
  ].some((blocked) => relativePath === blocked || relativePath.startsWith(blocked));
}

function scanFiles(fileRecords) {
  const patterns = [
    { id: "private-key-header", regex: /-----BEGIN (?:OPENSSH|RSA|DSA|EC|PRIVATE) KEY-----/g },
    { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
    { id: "openai-token", regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
    { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/g }
  ];
  const findings = [];
  for (const record of fileRecords) {
    const text = readText(record.path, record.path);
    for (const pattern of patterns) {
      if (pattern.regex.test(text)) {
        findings.push({ path: record.path, patternId: pattern.id });
      }
      pattern.regex.lastIndex = 0;
    }
  }
  return {
    status: findings.length === 0 ? "passed-redacted-local-dry-run" : "failed-redacted-local-dry-run",
    scannedFileCount: fileRecords.length,
    findingsCount: findings.length,
    patternsChecked: patterns.map((pattern) => pattern.id),
    findings
  };
}

function renderReportMarkdown(report) {
  const groupRows = report.groups
    .map((group) => `| ${group.id} | ${group.status} | ${group.provenanceLabel} | ${group.fileCount} |`)
    .join("\n");
  const blocks = report.blockedPathClasses.map((item) => `- ${item.id}: ${item.reason}`).join("\n");
  const commands = report.safeNextCommands.map((command) => `- \`${command}\``).join("\n");
  const approvals = report.humanApprovalNeededBefore.map((item) => `- ${item}`).join("\n");

  return `# SEIS Retrieval Source Provenance Report

Generated: ${report.generatedAt}

Status: ${report.status}

## Summary

| Field | Value |
| --- | --- |
| Source groups | ${report.summary.sourceGroupCount} |
| File records | ${report.summary.fileRecordCount} |
| Scanned files | ${report.summary.scannedFileCount} |
| Secret-scan findings | ${report.summary.findingsCount} |
| Persistent retrieval index approved | ${report.summary.persistentRetrievalIndex} |
| Embedding model install approved | ${report.summary.embeddingModelInstall} |
| Provider embedding calls approved | ${report.summary.providerEmbeddingCalls} |
| Private data indexing approved | ${report.summary.privateDataIndexing} |

## Source Groups

| Group | Status | Provenance label | Files |
| --- | --- | --- | --- |
${groupRows}

## Blocked Path Classes

${blocks}

## Safe Next Commands

${commands}

## Human Approval Needed Before

${approvals}
`;
}

function renderDocs(manifest, report) {
  const groups = report.groups
    .map((group) => `| ${group.id} | ${group.status} | ${group.provenanceLabel} | ${group.fileCount} |`)
    .join("\n");
  const requirements = manifest.requiredBeforePersistentIndexBuild.map((item) => `- ${item}`).join("\n");
  const sources = manifest.internetResearchBaseline.map((source) => `- [${source.id}](${source.url}) - ${source.usedFor}`).join("\n");

  return `# SEIS Retrieval Source Provenance

This document tracks the candidate source inventory for future SEIS retrieval.
It is not a retrieval index, embedding runtime, provider integration, dataset
download, training run, 512B route, or AGI proof.

## Current Status

- Manifest status: ${manifest.status}
- Source inventory defined: ${String(manifest.approvedToday.sourceInventory)}
- Secret-scan dry run: ${manifest.secretScan.status}
- Secret-scan findings: ${manifest.secretScan.findingsCount}
- Persistent retrieval index approved: ${String(manifest.approvedToday.persistentRetrievalIndex)}
- Embedding model install approved: ${String(manifest.approvedToday.embeddingModelInstall)}
- Provider embedding calls approved: ${String(manifest.approvedToday.providerEmbeddingCalls)}
- Private data indexing approved: ${String(manifest.approvedToday.privateDataIndexing)}

## Source Groups

| Group | Status | Provenance label | Files |
| --- | --- | --- | --- |
${groups}

## Required Before Persistent Index Build

${requirements}

## Research Baseline

${sources}

## Commands

\`\`\`bash
npm run report:seis-retrieval-source-provenance
npm run check:seis-retrieval-source-provenance
\`\`\`

## Report

Reviewer report:
\`reports/seis-model-scaling/seis-retrieval-source-provenance-manifest.md\`
`;
}

function mediaTypeFor(relativePath) {
  if (relativePath.endsWith(".json")) return "application/json";
  if (relativePath.endsWith(".md")) return "text/markdown";
  return "text/plain";
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
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

function readText(relativePath, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return "";
  }
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
    failures.push(`${label} is stale. Run npm run report:seis-retrieval-source-provenance.`);
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
    failures.push(`${label} is stale. Run npm run report:seis-retrieval-source-provenance.`);
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS retrieval source provenance manifest check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
