#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const paths = {
  schema: "content/development/seis-redacted-answer-log-schema.json",
  reportJson: "reports/seis-model-scaling/seis-redacted-answer-log-schema.json",
  reportMd: "reports/seis-model-scaling/seis-redacted-answer-log-schema.md",
  docs: "docs/ai/seis-redacted-answer-log-schema.md",
  noSecretAnswerLogScan: "content/development/seis-no-secret-answer-log-scan.json",
  citationScorer: "content/development/seis-retrieval-citation-scorer-dry-run.json",
  retrievalDryRun: "content/development/seis-retrieval-evaluation-dry-run.json",
  retrievalSourceProvenance: "content/development/seis-retrieval-source-provenance-manifest.json",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(paths.schema) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const noSecretAnswerLogScan = readJson(paths.noSecretAnswerLogScan, "no-secret answer log scan");
const citationScorer = readJson(paths.citationScorer, "retrieval citation scorer dry-run");
const retrievalDryRun = readJson(paths.retrievalDryRun, "retrieval evaluation dry-run");
const retrievalSourceProvenance = readJson(paths.retrievalSourceProvenance, "retrieval source provenance manifest");
const packageJson = readJson(paths.packageJson, "package.json");

if (!noSecretAnswerLogScan || !citationScorer || !retrievalDryRun || !retrievalSourceProvenance || !packageJson) {
  process.exit(1);
}

const schema = buildSchema({
  generatedAt,
  noSecretAnswerLogScan,
  citationScorer,
  retrievalDryRun,
  retrievalSourceProvenance,
  packageJson
});
const report = buildReport(schema);
const markdown = renderReportMarkdown(report);
const docs = renderDocs(schema, report);

if (mode === "write") {
  writeJson(paths.schema, schema);
  writeJson(paths.reportJson, report);
  writeText(paths.reportMd, markdown);
  writeText(paths.docs, docs);
  console.log("SEIS redacted answer log schema generated.");
  console.log(JSON.stringify({
    schema: paths.schema,
    report: paths.reportJson,
    markdown: paths.reportMd,
    docs: paths.docs
  }, null, 2));
} else {
  checkJson(paths.schema, schema, "redacted answer log schema");
  checkJson(paths.reportJson, report, "redacted answer log schema report");
  checkText(paths.reportMd, markdown, "redacted answer log schema markdown report");
  checkText(paths.docs, docs, "redacted answer log schema docs");
  validateSchema(schema, packageJson);
  finish("SEIS redacted answer log schema check passed.");
}

function buildSchema({ generatedAt, noSecretAnswerLogScan, citationScorer, retrievalDryRun, retrievalSourceProvenance, packageJson }) {
  const allowedFields = [
    field("recordId", "opaque-id", true, "Opaque local record id; no user id, email, IP, or account identifier."),
    field("schemaVersion", "semver-like-string", true, "Schema version for future migrations."),
    field("createdAt", "iso-8601-timestamp", true, "Timestamp only; no timezone-derived location inference."),
    field("runtimeMode", "enum", true, "Allowed values: local-demo, approval-needed, blocked."),
    field("questionIntent", "enum", true, "Coarse intent label only; prompt body is forbidden."),
    field("promptHash", "sha256", true, "Hash of prompt text if logging is approved; prompt body is forbidden."),
    field("answerHash", "sha256", true, "Hash of answer text if logging is approved; answer body is forbidden."),
    field("sourceUris", "seis-source-uri-array", true, "Reviewed source URIs only, never raw source content."),
    field("citationIds", "opaque-id-array", false, "Citation record ids without quoted answer text."),
    field("redactionSummary", "category-counts", true, "Counts by redaction category only."),
    field("safetyDecision", "enum", true, "Allowed values: allowed, refused, blocked, needs-human-review."),
    field("claimBoundary", "enum-array", true, "Explicit claim boundaries such as no-agi, no-512b-route, local-demo-only.")
  ];

  const forbiddenFields = [
    "promptBody",
    "answerBody",
    "rawConversation",
    "providerApiKey",
    "providerToken",
    "password",
    "cookie",
    "sshPrivateKey",
    "envFileContents",
    "privateSourceText",
    "unredactedStackTrace",
    "userEmail",
    "ipAddress",
    "paymentIdentifier"
  ];

  const redactionRules = [
    rule("secret-shaped-values", "Reject token-shaped, password-shaped, key-shaped, and credential assignment values."),
    rule("private-key-material", "Reject private key headers and any key body material."),
    rule("env-and-config", "Reject environment file contents and local credential config values."),
    rule("private-user-data", "Reject direct personal identifiers and private source text."),
    rule("claim-boundary", "Require no-AGI and no-512B route boundaries for every local-demo answer log record.")
  ];

  const sampleRecords = [
    sampleRecord("supported-citation-metadata", "retrieval-query", ["seis://retrieval/source/ai-docs/examplehash001"], "allowed"),
    sampleRecord("env-refusal-metadata", "secret-request", [], "refused"),
    sampleRecord("agi-claim-block-metadata", "claim-boundary", [], "blocked")
  ];

  const schemaChecks = [
    check("allowed-fields-present", allowedFields.length >= 10, `${allowedFields.length} allowed metadata fields defined`),
    check("forbidden-fields-present", forbiddenFields.length >= 10, `${forbiddenFields.length} forbidden fields defined`),
    check("no-body-fields-allowed", !allowedFields.some((item) => item.id.toLowerCase().includes("body")), "promptBody and answerBody are not allowed fields"),
    check("sample-records-metadata-only", sampleRecords.every(isMetadataOnlySample), "all sample records are metadata-only"),
    check("no-secret-scan-linked", noSecretAnswerLogScan.status === "no-secret-answer-log-scan-passed-no-answers", noSecretAnswerLogScan.status),
    check("citation-scorer-linked", citationScorer.status === "citation-scorer-dry-run-passed-not-measured", citationScorer.status)
  ];

  const passed = schemaChecks.every((item) => item.status === "passed") &&
    retrievalDryRun.status === "dry-run-passed-no-index-no-model" &&
    retrievalSourceProvenance.secretScan?.findingsCount === 0;

  return {
    id: "seis-redacted-answer-log-schema",
    version: "2026.07.01",
    generatedAt,
    status: passed ? "redacted-answer-log-schema-ready-no-real-logs" : "redacted-answer-log-schema-failed-no-real-logs",
    qualityGate: "npm run check:seis-redacted-answer-log-schema",
    reportCommand: "npm run report:seis-redacted-answer-log-schema",
    resourceUri: "seis://ai/redacted-answer-log-schema.json",
    truthBoundary: [
      "This is a schema contract for future answer-log records only.",
      "It does not collect or persist real answer logs.",
      "It does not store prompt bodies or answer bodies.",
      "It does not generate answers.",
      "It does not query a retrieval index.",
      "It does not call external providers.",
      "It runs no benchmarks, trains no model, grants no 512B route eligibility, and proves no AGI."
    ],
    sourceOfTruth: {
      noSecretAnswerLogScan: paths.noSecretAnswerLogScan,
      citationScorer: paths.citationScorer,
      retrievalDryRun: paths.retrievalDryRun,
      retrievalSourceProvenance: paths.retrievalSourceProvenance,
      docs: paths.docs
    },
    internetResearchBaseline: [
      {
        id: "github-secret-scanning",
        sourceType: "official-docs",
        url: "https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning",
        usedFor: "Credential-shaped value categories and GitHub review readiness."
      },
      {
        id: "owasp-sensitive-information-disclosure",
        sourceType: "official-guidance",
        url: "https://genai.owasp.org/llmrisk/llm02-sensitive-information-disclosure/",
        usedFor: "Sensitive information disclosure controls for answer logs."
      },
      {
        id: "nist-ai-rmf",
        sourceType: "official-guidance",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        usedFor: "Measurement, governance, and risk-management framing."
      }
    ],
    approvedToday: {
      schemaDefinition: true,
      metadataOnlySampleRecords: true,
      realAnswerLogCollection: false,
      logPersistence: false,
      promptBodyStorage: false,
      answerBodyStorage: false,
      answerGeneration: false,
      retrievalIndexQuery: false,
      providerCall: false,
      benchmarkRun: false,
      trainingRun: false,
      runtimeAuthority: false
    },
    allowedFields,
    forbiddenFields,
    redactionRules,
    sampleRecords,
    schemaChecks,
    linkedStatuses: {
      noSecretAnswerLogScan: noSecretAnswerLogScan.status,
      noSecretFindings: noSecretAnswerLogScan.scanResult?.findingsCount ?? null,
      citationScorer: citationScorer.status,
      retrievalDryRun: retrievalDryRun.status,
      retrievalSourceProvenance: retrievalSourceProvenance.status,
      retrievalSourceSecretFindings: retrievalSourceProvenance.secretScan?.findingsCount ?? null
    },
    requiredBeforeRealLogPersistence: [
      "human security review accepts this schema",
      "log retention window accepted",
      "redaction implementation reviewed",
      "real answer logging explicitly approved",
      "provider and retrieval logging separately approved",
      "delete/export policy accepted",
      "human approval recorded"
    ],
    publicClaims: {
      canClaimRedactedSchemaDefined: passed,
      canClaimRealAnswerLogsCollected: false,
      canClaimPromptBodiesStored: false,
      canClaimAnswerBodiesStored: false,
      canClaimNoSecretRealAnswerLogs: false,
      canClaimAnswerSafetyProven: false,
      canClaimEvaluationRun: false,
      canClaimBenchmarkPassed: false,
      canClaimFullyKnowledgeableAI: false,
      canClaimAGI: false,
      canClaim512BRouteEligible: false
    },
    packageScripts: {
      check: packageJson.scripts?.["check:seis-redacted-answer-log-schema"] || null,
      report: packageJson.scripts?.["report:seis-redacted-answer-log-schema"] || null
    }
  };
}

function buildReport(schema) {
  return {
    id: "seis-redacted-answer-log-schema-report",
    generatedAt: schema.generatedAt,
    status: schema.status,
    sourceSchema: paths.schema,
    summary: {
      allowedFields: schema.allowedFields.length,
      forbiddenFields: schema.forbiddenFields.length,
      redactionRules: schema.redactionRules.length,
      sampleRecords: schema.sampleRecords.length,
      failedChecks: schema.schemaChecks.filter((item) => item.status !== "passed").length,
      realAnswerLogCollection: schema.approvedToday.realAnswerLogCollection,
      logPersistence: schema.approvedToday.logPersistence,
      promptBodyStorage: schema.approvedToday.promptBodyStorage,
      answerBodyStorage: schema.approvedToday.answerBodyStorage,
      providerCall: schema.approvedToday.providerCall
    },
    safeNextCommands: [
      "npm run report:seis-redacted-answer-log-schema",
      "npm run check:seis-redacted-answer-log-schema",
      "npm run check:seis-security-blocker-diagnostic",
      "npm run check:seis-no-secret-answer-log-scan",
      "npm run check:seis-ai-public-readiness"
    ],
    humanApprovalNeededBefore: schema.requiredBeforeRealLogPersistence
  };
}

function validateSchema(schema, packageJson) {
  ensure(schema.id === "seis-redacted-answer-log-schema", "redacted answer log schema id mismatch");
  ensure(schema.status === "redacted-answer-log-schema-ready-no-real-logs", "redacted answer log schema status mismatch");
  ensure(schema.qualityGate === "npm run check:seis-redacted-answer-log-schema", "redacted schema qualityGate mismatch");
  ensure(schema.reportCommand === "npm run report:seis-redacted-answer-log-schema", "redacted schema reportCommand mismatch");
  ensure(schema.resourceUri === "seis://ai/redacted-answer-log-schema.json", "redacted schema resource URI mismatch");
  ensure(schema.allowedFields.length >= 10, "redacted schema must define at least ten allowed metadata fields");
  ensure(schema.forbiddenFields.includes("promptBody"), "promptBody must be forbidden");
  ensure(schema.forbiddenFields.includes("answerBody"), "answerBody must be forbidden");
  ensure(schema.forbiddenFields.includes("providerApiKey"), "providerApiKey must be forbidden");
  ensure(schema.forbiddenFields.includes("sshPrivateKey"), "sshPrivateKey must be forbidden");
  ensure(schema.schemaChecks.every((item) => item.status === "passed"), "all schema checks must pass");
  ensure(schema.sampleRecords.length >= 3, "redacted schema must include sample metadata records");
  ensure(schema.sampleRecords.every(isMetadataOnlySample), "sample records must be metadata-only");
  ensure(schema.linkedStatuses?.noSecretAnswerLogScan === "no-secret-answer-log-scan-passed-no-answers", "no-secret scan link mismatch");
  ensure(schema.linkedStatuses?.noSecretFindings === 0, "no-secret scan findings must stay zero");
  ensure(schema.linkedStatuses?.retrievalSourceSecretFindings === 0, "retrieval source secret findings must stay zero");

  for (const phrase of [
    "does not collect or persist real answer logs",
    "does not store prompt bodies or answer bodies",
    "does not generate answers",
    "does not query a retrieval index",
    "does not call external providers",
    "runs no benchmarks, trains no model, grants no 512B route eligibility, and proves no AGI"
  ]) {
    ensure(schema.truthBoundary.some((line) => line.includes(phrase)), `truthBoundary missing phrase: ${phrase}`);
  }

  for (const [field, expected] of Object.entries({
    schemaDefinition: true,
    metadataOnlySampleRecords: true,
    realAnswerLogCollection: false,
    logPersistence: false,
    promptBodyStorage: false,
    answerBodyStorage: false,
    answerGeneration: false,
    retrievalIndexQuery: false,
    providerCall: false,
    benchmarkRun: false,
    trainingRun: false,
    runtimeAuthority: false
  })) {
    ensure(schema.approvedToday?.[field] === expected, `approvedToday.${field} must be ${expected}`);
  }

  for (const [field, expected] of Object.entries({
    canClaimRedactedSchemaDefined: true,
    canClaimRealAnswerLogsCollected: false,
    canClaimPromptBodiesStored: false,
    canClaimAnswerBodiesStored: false,
    canClaimNoSecretRealAnswerLogs: false,
    canClaimAnswerSafetyProven: false,
    canClaimEvaluationRun: false,
    canClaimBenchmarkPassed: false,
    canClaimFullyKnowledgeableAI: false,
    canClaimAGI: false,
    canClaim512BRouteEligible: false
  })) {
    ensure(schema.publicClaims?.[field] === expected, `publicClaims.${field} must be ${expected}`);
  }

  ensure(schema.requiredBeforeRealLogPersistence.includes("human approval recorded"), "real log persistence must require human approval");
  ensure(
    packageJson.scripts?.["check:seis-redacted-answer-log-schema"] === "node scripts/create-seis-redacted-answer-log-schema.mjs",
    "package.json must expose check:seis-redacted-answer-log-schema"
  );
  ensure(
    packageJson.scripts?.["report:seis-redacted-answer-log-schema"] === "node scripts/create-seis-redacted-answer-log-schema.mjs --write",
    "package.json must expose report:seis-redacted-answer-log-schema"
  );
}

function renderReportMarkdown(report) {
  const commands = report.safeNextCommands.map((command) => `- \`${command}\``).join("\n");
  const approvals = report.humanApprovalNeededBefore.map((item) => `- ${item}`).join("\n");
  return `# SEIS Redacted Answer Log Schema Report

Generated: ${report.generatedAt}

Status: ${report.status}

## Summary

| Field | Value |
| --- | --- |
| Allowed metadata fields | ${report.summary.allowedFields} |
| Forbidden fields | ${report.summary.forbiddenFields} |
| Redaction rules | ${report.summary.redactionRules} |
| Sample records | ${report.summary.sampleRecords} |
| Failed checks | ${report.summary.failedChecks} |
| Real answer log collection approved | ${String(report.summary.realAnswerLogCollection)} |
| Log persistence approved | ${String(report.summary.logPersistence)} |
| Prompt body storage approved | ${String(report.summary.promptBodyStorage)} |
| Answer body storage approved | ${String(report.summary.answerBodyStorage)} |
| Provider call approved | ${String(report.summary.providerCall)} |

## Safe Next Commands

${commands}

## Human Approval Needed Before Real Log Persistence

${approvals}
`;
}

function renderDocs(schema, report) {
  const allowed = schema.allowedFields.map((item) => `| ${item.id} | ${item.type} | ${item.required} | ${item.boundary} |`).join("\n");
  const forbidden = schema.forbiddenFields.map((item) => `- \`${item}\``).join("\n");
  const rules = schema.redactionRules.map((item) => `| ${item.id} | ${item.description} |`).join("\n");
  const checks = schema.schemaChecks.map((item) => `| ${item.id} | ${item.status} | ${item.evidence} |`).join("\n");
  const sources = schema.internetResearchBaseline.map((source) => `- [${source.id}](${source.url}) - ${source.usedFor}`).join("\n");

  return `# SEIS Redacted Answer Log Schema

This document defines the metadata-only answer-log schema SEIS can use before
any future real answer logging is approved. It does not collect or persist real
answer logs, store prompt bodies, store answer bodies, generate answers, query a
retrieval index, call providers, run benchmarks, train a model, grant 512B route
eligibility, or prove AGI.

## Current Status

- Schema status: ${schema.status}
- Allowed metadata fields: ${schema.allowedFields.length}
- Forbidden fields: ${schema.forbiddenFields.length}
- Redaction rules: ${schema.redactionRules.length}
- Failed checks: ${report.summary.failedChecks}
- Real answer log collection approved: ${String(schema.approvedToday.realAnswerLogCollection)}
- Prompt body storage approved: ${String(schema.approvedToday.promptBodyStorage)}
- Answer body storage approved: ${String(schema.approvedToday.answerBodyStorage)}

## Allowed Metadata Fields

| Field | Type | Required | Boundary |
| --- | --- | --- | --- |
${allowed}

## Forbidden Fields

${forbidden}

## Redaction Rules

| Rule | Description |
| --- | --- |
${rules}

## Schema Checks

| Check | Status | Evidence |
| --- | --- | --- |
${checks}

## Research Baseline

${sources}

## Commands

\`\`\`bash
npm run report:seis-redacted-answer-log-schema
npm run check:seis-redacted-answer-log-schema
\`\`\`

## Report

Reviewer report:
\`reports/seis-model-scaling/seis-redacted-answer-log-schema.md\`
`;
}

function field(id, type, required, boundary) {
  return { id, type, required, boundary };
}

function rule(id, description) {
  return { id, description };
}

function check(id, condition, evidence) {
  return { id, status: condition ? "passed" : "failed", evidence };
}

function sampleRecord(recordId, questionIntent, sourceUris, safetyDecision) {
  return {
    recordId,
    schemaVersion: "2026.07.01",
    createdAt: "2026-07-01T00:00:00.000Z",
    runtimeMode: "local-demo",
    questionIntent,
    promptHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    answerHash: "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
    sourceUris,
    citationIds: sourceUris.map((_, index) => `citation-${index + 1}`),
    redactionSummary: {
      secretShapedValues: 0,
      privateKeyMaterial: 0,
      privateUserData: 0
    },
    safetyDecision,
    claimBoundary: ["local-demo-only", "no-agi", "no-512b-route"]
  };
}

function isMetadataOnlySample(record) {
  const forbiddenKeys = new Set([
    "promptBody",
    "answerBody",
    "rawConversation",
    "providerApiKey",
    "providerToken",
    "password",
    "cookie",
    "sshPrivateKey",
    "envFileContents",
    "privateSourceText"
  ]);
  const hasForbiddenKey = Object.keys(record).some((key) => forbiddenKeys.has(key));
  const hashPattern = /^[a-f0-9]{64}$/;
  return !hasForbiddenKey &&
    hashPattern.test(record.promptHash || "") &&
    hashPattern.test(record.answerHash || "") &&
    Array.isArray(record.claimBoundary) &&
    record.claimBoundary.includes("no-agi") &&
    record.claimBoundary.includes("no-512b-route");
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${stableStringify(value)}\n`);
}

function writeText(relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, value);
}

function readJson(relativePath, label) {
  try {
    return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
  } catch {
    failures.push(`${label} missing or invalid JSON: ${relativePath}`);
    return null;
  }
}

function readOptionalJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return null;
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function checkJson(relativePath, expected, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = JSON.parse(readFileSync(absolutePath, "utf8"));
  if (stableStringify(actual) !== stableStringify(expected)) failures.push(`${label} is stale. Run npm run report:seis-redacted-answer-log-schema.`);
}

function checkText(relativePath, expected, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(absolutePath, "utf8");
  if (actual !== expected) failures.push(`${label} is stale. Run npm run report:seis-redacted-answer-log-schema.`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(message) {
  if (failures.length > 0) {
    console.error("SEIS redacted answer log schema check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2);
}
