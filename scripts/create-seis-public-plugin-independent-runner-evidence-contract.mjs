#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "content/development/seis-public-plugin-independent-runner-evidence-contract.json";
const reportPath = "reports/seis-public-plugin-independent-runner-evidence-contract.md";
const familyPath = "content/development/seis-public-plugin-family.json";
const evidencePath = "content/development/seis-public-plugin-independent-runner-evidence.json";
const defaultGate = "npm run check:seis-public-plugin-independent-runner-evidence";
const recordedGate = "npm run check:seis-public-plugin-independent-runner-evidence:recorded";

const family = readJson(familyPath);
const expectedPluginIds = (family.publicPlugins || []).map((plugin) => plugin.installId);
const expectedEmbeddedModuleIds = (family.embeddedModules || family.plugins || []).map((module) => module.name);

const contract = {
  id: "seis-public-plugin-independent-runner-evidence-contract",
  version: 1,
  generatedAt,
  status: "active-evidence-intake-contract",
  decision: "not-ready-for-public-preview",
  sourcePath,
  reportPath,
  publicPluginFamily: familyPath,
  evidencePath,
  publicReleaseAllowed: false,
  purpose:
    "Define the sanitized evidence required from an independent clean runner or public installation of the single SEIS-Agent plugin without treating a repo-local working tree, cache, manifest, or template as public release proof.",
  expectedPluginIds,
  expectedEmbeddedModuleIds,
  runnerIndependenceRequirements: [
    "The runner cannot read the original SEIS working tree used to create this proof contract.",
    "The runner cannot use the pre-existing local Codex plugin cache as installation evidence.",
    "The runner records the immutable public marketplace or package revision used for installation.",
    "The runner opens a fresh Codex task after installation before observing the SEIS AI public plugin family bridge.",
  ],
  redactionBoundary: {
    allowedMetadata: [
      "sanitized task reference",
      "operating system family",
      "CPU architecture",
      "Node major version",
      "Codex version",
      "public marketplace or package revision",
      "plugin ids and aggregate command counts",
    ],
    prohibitedData: [
      "API keys, tokens, cookies, passwords, credentials, private keys, .env contents, private filesystem paths, raw command output, or private repository data",
    ],
    rawCommandOutputAllowed: false,
    privatePathsAllowed: false,
  },
  requiredAssertions: [
    "The single expected seis-ai-agent@seis-repo plugin id is installed from the declared public source.",
    "The installed SEIS-Agent MCP server initializes, lists tools, and completes representative lane calls.",
    "The observed embedded source-module inventory exactly matches the current SEIS module contract.",
    "A fresh task opened after installation reports publicPluginCount=1, embeddedModuleCount=current contract count, connected counts, and runtimeConnected=true through SEIS AI.",
    "The evidence explicitly says publicReleaseAllowed=false; human approval remains a separate gate.",
  ],
  submissionTemplate: {
    id: "seis-public-plugin-independent-runner-evidence",
    version: 1,
    status: "recorded-independent-clean-runner-evidence",
    recordedAt: "<ISO-8601-UTC>",
    publicReleaseAllowed: false,
    source: {
      marketplaceName: "seis-repo",
      artifactKind: "public-marketplace-or-package",
      immutableRevision: "<public-commit-or-package-revision>",
    },
    runner: {
      classification: "independent-clean-runner",
      sourceWorktreeAccessible: false,
      existingCodexCacheAccessible: false,
      os: "<operating-system-family>",
      architecture: "<cpu-architecture>",
      nodeMajor: 24,
      codexVersion: "<codex-version>",
    },
    installation: {
      expectedPluginIds,
      installedPluginIds: expectedPluginIds,
      installedCount: expectedPluginIds.length,
      expectedEmbeddedModuleIds,
      observedEmbeddedModuleIds: expectedEmbeddedModuleIds,
      embeddedModuleCount: expectedEmbeddedModuleIds.length,
      publicSourceInstalled: true,
    },
    mcpSmoke: {
      pluginCount: expectedPluginIds.length,
      initializedCount: expectedPluginIds.length,
      toolsListCount: expectedPluginIds.length,
      representativeCallCount: expectedPluginIds.length,
      allPassed: true,
    },
    freshTask: {
      observedAfterInstall: true,
      taskReference: "<sanitized-task-reference>",
      seisAiPublicPluginFamily: {
        publicPluginCount: expectedPluginIds.length,
        connectedPluginCount: expectedPluginIds.length,
        embeddedModuleCount: expectedEmbeddedModuleIds.length,
        connectedModuleCount: expectedEmbeddedModuleIds.length,
        runtimeConnected: true,
      },
    },
    redaction: {
      rawCommandOutputIncluded: false,
      secretsIncluded: false,
      privatePathsIncluded: false,
    },
    attestation: {
      evidenceSource: "external-runner",
      operatorRole: "maintainer",
    },
  },
  validation: {
    contractGate: defaultGate,
    strictRecordedEvidenceGate: recordedGate,
    explicitInputExample:
      "node scripts/check-seis-public-plugin-independent-runner-evidence.mjs --require-recorded --input /safe/sanitized-evidence.json",
  },
  completionRule:
    "The intake contract is complete for internal review when it validates its schema and remains publicReleaseAllowed=false. Public preview remains blocked until a strict recorded evidence check passes and a human owner approves the release action.",
};

const report = renderReport(contract);

if (checkMode) {
  assertSame(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  assertSame(reportPath, report);
  validateContract(contract);
  console.log("SEIS public plugin independent-runner evidence contract check passed.");
} else {
  writeFile(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  writeFile(reportPath, report);
  validateContract(contract);
  console.log(`Wrote ${sourcePath}`);
  console.log(`Wrote ${reportPath}`);
}

function validateContract(record) {
  const failures = [];
  if (record.id !== "seis-public-plugin-independent-runner-evidence-contract") failures.push("evidence contract id is invalid");
  if (record.publicReleaseAllowed !== false) failures.push("evidence contract must not allow public release");
  if (record.evidencePath !== evidencePath) failures.push("evidence path is invalid");
  if (record.expectedPluginIds.length !== 1 || record.expectedPluginIds[0] !== "seis-ai-agent@seis-repo") failures.push("evidence contract must cover only the public SEIS-Agent install id");
  if (record.expectedEmbeddedModuleIds.length < 10) failures.push("evidence contract must cover every current embedded source module");
  if (new Set(record.expectedPluginIds).size !== record.expectedPluginIds.length) failures.push("expected plugin ids must be unique");
  if (new Set(record.expectedEmbeddedModuleIds).size !== record.expectedEmbeddedModuleIds.length) failures.push("expected embedded module ids must be unique");
  if (!record.expectedPluginIds.every((id) => id.endsWith("@seis-repo"))) failures.push("expected plugin ids must use seis-repo");
  if (record.submissionTemplate.publicReleaseAllowed !== false) failures.push("submission template must keep public release blocked");
  if (record.submissionTemplate.runner.sourceWorktreeAccessible !== false) failures.push("submission template must require source worktree isolation");
  if (record.submissionTemplate.runner.existingCodexCacheAccessible !== false) failures.push("submission template must require cache isolation");
  if (!record.validation.strictRecordedEvidenceGate.includes(":recorded")) failures.push("contract must define a strict recorded-evidence gate");
  if (!record.redactionBoundary.prohibitedData.length) failures.push("contract must define prohibited data");
  if (failures.length) {
    console.error("SEIS public plugin independent-runner evidence contract validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function renderReport(record) {
  const pluginRows = record.expectedPluginIds.map((id) => `| ${id} | required |`).join("\n");
  const moduleRows = record.expectedEmbeddedModuleIds.map((id) => `| ${id} | embedded source module |`).join("\n");
  const assertions = record.requiredAssertions.map((item) => `- ${item}`).join("\n");
  const prohibited = record.redactionBoundary.prohibitedData.map((item) => `- ${item}`).join("\n");
  return `# SEIS Public Plugin Independent Runner Evidence Contract

- Generated: ${record.generatedAt}
- Status: ${record.status}
- Decision: ${record.decision}
- Public release allowed: ${record.publicReleaseAllowed ? "yes" : "no"}
- Evidence record path: \`${record.evidencePath}\`

## Independence Requirements

${record.runnerIndependenceRequirements.map((item) => `- ${item}`).join("\n")}

## Required Plugin Install Ids

| install id | required |
| --- | --- |
${pluginRows}

## Required Embedded Source Modules

| module id | requirement |
| --- | --- |
${moduleRows}

## Required Assertions

${assertions}

## Redaction Boundary

Allowed metadata:

${record.redactionBoundary.allowedMetadata.map((item) => `- ${item}`).join("\n")}

Prohibited data:

${prohibited}

## Validation

\`\`\`bash
${record.validation.contractGate}
${record.validation.strictRecordedEvidenceGate}
${record.validation.explicitInputExample}
\`\`\`

## Decision

NO-GO for public preview. This is an intake contract, not independent runner
evidence. A validated record and explicit human approval are still required.
`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeFile(file, body) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), body);
}

function assertSame(file, expected) {
  const filePath = path.join(root, file);
  const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (actual !== expected) {
    console.error(`${file} is out of date. Run: npm run automation:seis-public-plugin-independent-runner-evidence-contract`);
    process.exit(1);
  }
}
