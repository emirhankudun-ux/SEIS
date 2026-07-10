#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const shouldWrite = Boolean(args.write);
const shouldCheck = Boolean(args.check);

const paths = {
  obsidianContract: "content/development/seis-obsidian-bridge-safe-import-contract.json",
  secondBrain: "content/development/seis-second-brain-system.json",
  outputJson: typeof args.output === "string" ? args.output : "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json",
  outputMarkdown: typeof args.markdown === "string" ? args.markdown : "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md"
};

const failures = [];
const warnings = [];

const obsidianContract = readJson(paths.obsidianContract, "Obsidian safe import contract");
const secondBrain = readJson(paths.secondBrain, "Second Brain contract");
const generatedAt = new Date().toISOString();
const report = buildDryRunReport(obsidianContract, secondBrain, generatedAt);

validateDryRunReport(report, obsidianContract, secondBrain, "generated dry-run report");

if (shouldWrite) {
  writeJson(paths.outputJson, report);
  writeText(paths.outputMarkdown, renderMarkdown(report));
}

if (shouldCheck) {
  ensureFile(paths.outputJson, "Obsidian safe-import dry-run JSON artifact");
  ensureFile(paths.outputMarkdown, "Obsidian safe-import dry-run Markdown artifact");
  const existingJson = readJson(paths.outputJson, "Obsidian safe-import dry-run JSON artifact");
  const existingMarkdown = readText(paths.outputMarkdown, "Obsidian safe-import dry-run Markdown artifact");
  if (existingJson) validateDryRunReport(existingJson, obsidianContract, secondBrain, "existing dry-run artifact");
  for (const phrase of [
    "SEIS Obsidian Safe Import Dry-Run",
    "repo-owned seed notes only",
    "No private Obsidian vault was read",
    "metadata-only-by-default",
    "humanApprovalState: not-requested"
  ]) {
    ensure(existingMarkdown.includes(phrase), `Markdown artifact missing phrase: ${phrase}.`);
  }
}

if (failures.length > 0) {
  console.error("SEIS Obsidian safe-import dry-run check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (shouldWrite) {
  console.log(`Wrote ${paths.outputJson}`);
  console.log(`Wrote ${paths.outputMarkdown}`);
} else if (shouldCheck) {
  console.log("SEIS Obsidian safe-import dry-run check passed.");
} else {
  console.log(JSON.stringify(report, null, 2));
}

function buildDryRunReport(contract, secondBrainContract, checkedAt) {
  const seedNotes = Array.isArray(secondBrainContract?.vaultNotes) ? secondBrainContract.vaultNotes : [];
  const scopedSecretFindings = scanScopedFiles([paths.obsidianContract, paths.secondBrain]);
  const sourceFingerprint = fingerprint("repo-owned-second-brain-seed-notes-only");
  const dryRunManifest = {
    sourcePathFingerprint: sourceFingerprint,
    selectedByUser: false,
    candidateNoteCount: seedNotes.length,
    blockedFileCount: 0,
    blockedPathMatches: [],
    secretScanSummary: {
      status: scopedSecretFindings.length === 0 ? "passed" : "blocked",
      scannedScope: "repo-owned Obsidian contract and Second Brain seed-note metadata only",
      scannedPrivateVault: false,
      hostFilesystemScanned: false,
      findings: scopedSecretFindings.length,
      findingCategories: unique(scopedSecretFindings.map((finding) => finding.category))
    },
    provenanceLabels: {
      "repo-owned-seed": seedNotes.length,
      "private-vault": 0,
      "unknown-source": 0
    },
    publishabilityLabels: {
      "public-safe-metadata-only": seedNotes.length,
      "needs-redaction": 0,
      "needs-provenance-review": 0,
      "blocked-private": 0,
      "blocked-secret-risk": scopedSecretFindings.length,
      "blocked-attachment-risk": 0
    },
    redactionSummary: {
      privatePathStored: false,
      privateBodyTextCopied: false,
      privateVaultContentCopied: false,
      redactedFields: ["absolute private source path", "private note body"],
      notes: "This repo artifact uses browser-local seed note metadata only."
    },
    attachmentReviewSummary: {
      attachmentsObserved: 0,
      attachmentsCopied: 0,
      status: "not-applicable-no-attachment-import"
    },
    bodyImportPolicy: contract?.dryRunManifestSchema?.bodyImportPolicy || "metadata-only-by-default",
    humanApprovalState: "not-requested"
  };

  return {
    id: "seis-obsidian-safe-import-dry-run-pr54",
    title: "SEIS Obsidian Safe Import Dry-Run",
    generatedAt: checkedAt,
    status: "repo-owned-seed-notes-only",
    mode: "dry-run-no-private-vault-read",
    decision: "NO-GO-private-vault-import-not-approved",
    contractPath: paths.obsidianContract,
    secondBrainPath: paths.secondBrain,
    sourceKind: "repo-owned-second-brain-seed-contract",
    sourcePathFingerprint: dryRunManifest.sourcePathFingerprint,
    selectedByUser: dryRunManifest.selectedByUser,
    candidateNoteCount: dryRunManifest.candidateNoteCount,
    blockedFileCount: dryRunManifest.blockedFileCount,
    blockedPathMatches: dryRunManifest.blockedPathMatches,
    secretScanSummary: dryRunManifest.secretScanSummary,
    provenanceLabels: dryRunManifest.provenanceLabels,
    publishabilityLabels: dryRunManifest.publishabilityLabels,
    redactionSummary: dryRunManifest.redactionSummary,
    attachmentReviewSummary: dryRunManifest.attachmentReviewSummary,
    bodyImportPolicy: dryRunManifest.bodyImportPolicy,
    humanApprovalState: dryRunManifest.humanApprovalState,
    dryRunManifest,
    candidateNotes: seedNotes.map((note) => ({
      id: note.id,
      title: note.title,
      folder: note.folder,
      path: note.path,
      status: note.status,
      tags: note.tags || [],
      links: note.links || [],
      provenanceLabel: "repo-owned-seed",
      publishabilityLabel: "public-safe-metadata-only",
      bodyImported: false
    })),
    safetyBoundary: {
      privateVaultReadPerformed: false,
      hostFilesystemScanned: false,
      obsidianPluginInstalled: false,
      githubMutationPerformed: false,
      providerCallsPerformed: false,
      sshExecuted: false,
      deploymentPerformed: false,
      writesOutsideReportsDirectory: false
    },
    requiredNextApproval: [
      "explicit user-selected local vault path",
      "human approval before scanning selected files",
      "human approval before generating any public fixture",
      "separate approval before GitHub publication"
    ],
    warnings
  };
}

function validateDryRunReport(value, contract, secondBrainContract, label) {
  ensure(value?.id === "seis-obsidian-safe-import-dry-run-pr54", `${label} id mismatch.`);
  ensure(value?.title === "SEIS Obsidian Safe Import Dry-Run", `${label} title mismatch.`);
  ensure(value?.status === "repo-owned-seed-notes-only", `${label} status must remain repo-owned seed notes only.`);
  ensure(value?.mode === "dry-run-no-private-vault-read", `${label} mode must show no private vault read.`);
  ensure(value?.decision === "NO-GO-private-vault-import-not-approved", `${label} decision must block private vault import.`);
  ensure(value?.contractPath === paths.obsidianContract, `${label} contract path mismatch.`);
  ensure(value?.secondBrainPath === paths.secondBrain, `${label} Second Brain path mismatch.`);
  ensure(value?.selectedByUser === false, `${label} selectedByUser must be false until a user explicitly selects a vault.`);
  ensure(value?.sourcePathFingerprint === value?.dryRunManifest?.sourcePathFingerprint, `${label} sourcePathFingerprint must match dryRunManifest.`);
  ensure(
    /^sha256:[a-f0-9]{64}$/.test(String(value?.sourcePathFingerprint || "")),
    `${label} sourcePathFingerprint must be a sha256 fingerprint, not a private path.`
  );
  ensure(value?.candidateNoteCount === (secondBrainContract?.vaultNotes || []).length, `${label} candidate note count mismatch.`);
  ensure(value?.blockedFileCount === 0, `${label} blockedFileCount must be 0 for repo-owned seed metadata.`);
  ensure(Array.isArray(value?.blockedPathMatches) && value.blockedPathMatches.length === 0, `${label} blockedPathMatches must be empty.`);
  ensure(value?.bodyImportPolicy === "metadata-only-by-default", `${label} bodyImportPolicy must be metadata-only-by-default.`);
  ensure(value?.humanApprovalState === "not-requested", `${label} humanApprovalState must remain not-requested.`);
  ensure(value?.secretScanSummary?.scannedPrivateVault === false, `${label} must not scan a private vault.`);
  ensure(value?.secretScanSummary?.hostFilesystemScanned === false, `${label} must not scan host filesystem.`);
  ensure(value?.secretScanSummary?.findings === 0, `${label} secret scan summary must have zero findings.`);
  ensure(value?.provenanceLabels?.["repo-owned-seed"] === value?.candidateNoteCount, `${label} provenance label count mismatch.`);
  ensure(value?.publishabilityLabels?.["public-safe-metadata-only"] === value?.candidateNoteCount, `${label} publishability label count mismatch.`);
  ensure(value?.redactionSummary?.privatePathStored === false, `${label} must not store private paths.`);
  ensure(value?.redactionSummary?.privateBodyTextCopied === false, `${label} must not copy private note body text.`);
  ensure(value?.attachmentReviewSummary?.attachmentsCopied === 0, `${label} must not copy attachments.`);
  ensure(value?.safetyBoundary?.privateVaultReadPerformed === false, `${label} must not read private vaults.`);
  ensure(value?.safetyBoundary?.githubMutationPerformed === false, `${label} must not mutate GitHub.`);
  ensure(value?.safetyBoundary?.providerCallsPerformed === false, `${label} must not call providers.`);
  ensure(value?.safetyBoundary?.sshExecuted === false, `${label} must not execute SSH.`);
  ensure(Array.isArray(value?.candidateNotes), `${label} candidateNotes must be an array.`);
  ensure(!JSON.stringify(value || {}).includes("file://"), `${label} must not include file:// paths.`);
  ensure(!JSON.stringify(value || {}).includes("/Users/"), `${label} must not include absolute private /Users paths.`);

  for (const field of contract?.dryRunManifestSchema?.requiredFields || []) {
    ensure(Object.hasOwn(value || {}, field), `${label} missing required dry-run field ${field}.`);
    ensure(Object.hasOwn(value?.dryRunManifest || {}, field), `${label} dryRunManifest missing required field ${field}.`);
  }
}

function scanScopedFiles(filePaths) {
  const patterns = [
    ["OpenAI-style API key", /sk-[A-Za-z0-9_-]{20,}/g],
    ["private key block", /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/g],
    ["inline credential assignment", /\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/gi]
  ];
  const findings = [];
  for (const filePath of filePaths) {
    const text = readText(filePath, filePath);
    for (const [category, pattern] of patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) {
        findings.push({ filePath, category });
      }
    }
  }
  return findings;
}

function renderMarkdown(value) {
  const noteRows = value.candidateNotes
    .map((note) => `| ${note.id} | ${note.status} | ${note.provenanceLabel} | ${note.publishabilityLabel} |`)
    .join("\n");

  return `# SEIS Obsidian Safe Import Dry-Run

Generated: ${value.generatedAt}
Status: ${value.status}
Mode: ${value.mode}
Decision: ${value.decision}

## Scope

This artifact is repo-owned seed notes only. No private Obsidian vault was read,
no host filesystem vault was scanned, no Obsidian plugin was installed, no note
body was imported, no provider was called, no SSH was executed, and no GitHub
mutation was performed.

## Dry-Run Manifest

- sourcePathFingerprint: ${value.sourcePathFingerprint}
- selectedByUser: ${value.selectedByUser}
- candidateNoteCount: ${value.candidateNoteCount}
- blockedFileCount: ${value.blockedFileCount}
- blockedPathMatches: ${value.blockedPathMatches.length}
- secretScanSummary: ${value.secretScanSummary.status}, findings ${value.secretScanSummary.findings}
- bodyImportPolicy: ${value.bodyImportPolicy}
- humanApprovalState: ${value.humanApprovalState}

## Candidate Seed Notes

| Note | Status | Provenance | Publishability |
| --- | --- | --- | --- |
${noteRows}

## Approval Boundary

Private Obsidian import stays blocked until a user explicitly selects a local
vault path, approves a dry-run scan, reviews provenance/redaction output, and
separately approves any public GitHub fixture or publication.
`;
}

function parseArgs(values) {
  return values.reduce((acc, value, index) => {
    if (!value.startsWith("--")) return acc;
    const key = value.slice(2);
    const next = values[index + 1];
    acc[key] = next && !next.startsWith("--") ? next : true;
    return acc;
  }, {});
}

function fingerprint(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function unique(values) {
  return Array.from(new Set(values));
}

function safeOutputPath(targetPath) {
  const absolutePath = path.resolve(root, targetPath);
  const relativePath = path.relative(root, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    failures.push(`refusing to write outside repository: ${targetPath}`);
    return path.join(root, "reports", "seis-public-demo", "obsidian-safe-import-refused-output.txt");
  }
  return absolutePath;
}

function writeJson(filePath, value) {
  const absolutePath = safeOutputPath(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  const absolutePath = safeOutputPath(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${label}: ${filePath}`);
    return "";
  }
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`unable to read ${label}: ${error.message}`);
    return "";
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}
