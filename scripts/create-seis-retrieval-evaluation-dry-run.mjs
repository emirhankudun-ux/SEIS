#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const paths = {
  dryRun: "content/development/seis-retrieval-evaluation-dry-run.json",
  reportJson: "reports/seis-model-scaling/seis-retrieval-evaluation-dry-run.json",
  reportMd: "reports/seis-model-scaling/seis-retrieval-evaluation-dry-run.md",
  docs: "docs/ai/seis-retrieval-evaluation-dry-run.md",
  fixtures: "content/development/seis-retrieval-evaluation-fixtures.json",
  retrievalSourceProvenance: "content/development/seis-retrieval-source-provenance-manifest.json",
  knowledgeRetrievalTraining: "content/development/seis-knowledge-retrieval-training-contract.json",
  agiEvaluationProtocol: "content/development/seis-agi-evaluation-protocol.json",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(paths.dryRun) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const fixtures = readJson(paths.fixtures, "retrieval evaluation fixtures");
const retrievalSourceProvenance = readJson(paths.retrievalSourceProvenance, "retrieval source provenance manifest");
const knowledgeRetrievalTraining = readJson(paths.knowledgeRetrievalTraining, "knowledge retrieval training contract");
const agiEvaluationProtocol = readJson(paths.agiEvaluationProtocol, "AGI evaluation protocol");
const packageJson = readJson(paths.packageJson, "package.json");

if (!fixtures || !retrievalSourceProvenance || !knowledgeRetrievalTraining || !agiEvaluationProtocol || !packageJson) process.exit(1);

const dryRun = buildDryRun({
  generatedAt,
  fixtures,
  retrievalSourceProvenance,
  knowledgeRetrievalTraining,
  agiEvaluationProtocol,
  packageJson
});
const report = buildReport(dryRun);
const markdown = renderReportMarkdown(report);
const docs = renderDocs(dryRun, report);

if (mode === "write") {
  writeJson(paths.dryRun, dryRun);
  writeJson(paths.reportJson, report);
  writeText(paths.reportMd, markdown);
  writeText(paths.docs, docs);
  console.log("SEIS retrieval evaluation dry-run generated.");
  console.log(JSON.stringify({
    dryRun: paths.dryRun,
    report: paths.reportJson,
    markdown: paths.reportMd,
    docs: paths.docs
  }, null, 2));
} else {
  checkJson(paths.dryRun, dryRun, "retrieval evaluation dry-run");
  checkJson(paths.reportJson, report, "retrieval evaluation dry-run report");
  checkText(paths.reportMd, markdown, "retrieval evaluation dry-run markdown report");
  checkText(paths.docs, docs, "retrieval evaluation dry-run docs");
  validateDryRun(dryRun, packageJson);
  finish("SEIS retrieval evaluation dry-run check passed.");
}

function buildDryRun({ generatedAt, fixtures, retrievalSourceProvenance, knowledgeRetrievalTraining, agiEvaluationProtocol, packageJson }) {
  const sourceGroupCounts = Object.fromEntries(
    retrievalSourceProvenance.sourceGroups.map((group) => [
      group.id,
      retrievalSourceProvenance.fileRecords.filter((record) => record.groupId === group.id).length
    ])
  );
  const knownGroups = new Set(Object.keys(sourceGroupCounts));

  const goldenQueryChecks = fixtures.goldenQueries.map((query) => {
    const missingGroups = query.expectedSourceGroups.filter((groupId) => !knownGroups.has(groupId));
    const emptyGroups = query.expectedSourceGroups.filter((groupId) => sourceGroupCounts[groupId] === 0);
    return {
      id: query.id,
      status: missingGroups.length === 0 && emptyGroups.length === 0 ? "passed-local-fixture-check" : "failed-local-fixture-check",
      promptHash: hashText(query.prompt),
      expectedSourceGroups: query.expectedSourceGroups,
      missingGroups,
      emptyGroups,
      forbiddenClaimCount: query.forbiddenClaims.length,
      requiredBehaviorDefined: query.requiredBehavior.length > 0,
      answerGenerated: false,
      indexQueried: false
    };
  });

  const negativeControlChecks = fixtures.negativeControls.map((control) => {
    const behavior = control.requiredBehavior.toLowerCase();
    const hasRefusalPolicy = behavior.includes("refuse") || behavior.includes("ignore");
    return {
      id: control.id,
      status: hasRefusalPolicy ? "passed-policy-fixture-check" : "failed-policy-fixture-check",
      promptHash: hashText(control.prompt),
      refusalOrIgnorePolicyDefined: hasRefusalPolicy,
      answerGenerated: false,
      indexQueried: false,
      providerCalled: false
    };
  });

  const invariantChecks = [
    invariant("provenance-status", retrievalSourceProvenance.status === "manifest-defined-index-blocked"),
    invariant("provenance-secret-findings-zero", retrievalSourceProvenance.secretScan?.findingsCount === 0),
    invariant("fixtures-status", fixtures.status === "fixtures-defined-not-run"),
    invariant("fixtures-evaluation-run-false", fixtures.approvedToday?.evaluationRun === false),
    invariant("fixtures-index-query-false", fixtures.approvedToday?.retrievalIndexQuery === false),
    invariant("fixtures-provider-call-false", fixtures.approvedToday?.providerCall === false),
    invariant("knowledge-status", knowledgeRetrievalTraining.status === "contract-defined-not-indexed"),
    invariant("agi-claim-blocked", agiEvaluationProtocol.agiClaimAllowed === false),
    invariant("runtime-authority-blocked", agiEvaluationProtocol.runtimeAuthority === false)
  ];

  const passed =
    goldenQueryChecks.every((check) => check.status === "passed-local-fixture-check") &&
    negativeControlChecks.every((check) => check.status === "passed-policy-fixture-check") &&
    invariantChecks.every((check) => check.status === "passed");

  return {
    id: "seis-retrieval-evaluation-dry-run",
    version: "2026.07.01",
    generatedAt,
    status: passed ? "dry-run-passed-no-index-no-model" : "dry-run-failed-no-index-no-model",
    qualityGate: "npm run check:seis-retrieval-evaluation-dry-run",
    reportCommand: "npm run report:seis-retrieval-evaluation-dry-run",
    resourceUri: "seis://ai/retrieval-evaluation-dry-run.json",
    truthBoundary: [
      "This dry-run validates retrieval evaluation fixtures and source-group coverage only.",
      "It does not generate answers.",
      "It does not build or query a retrieval index.",
      "It does not install embedding, reranker, or language models.",
      "It does not call external providers.",
      "It does not run a benchmark or score live model quality.",
      "It does not prove SEIS is fully knowledgeable, routeable 512B, or AGI."
    ],
    sourceOfTruth: {
      fixtures: paths.fixtures,
      retrievalSourceProvenance: paths.retrievalSourceProvenance,
      knowledgeRetrievalTraining: paths.knowledgeRetrievalTraining,
      agiEvaluationProtocol: paths.agiEvaluationProtocol,
      docs: paths.docs
    },
    internetResearchBaseline: fixtures.internetResearchBaseline,
    approvedToday: {
      localFixtureDryRun: true,
      sourceGroupCoverageCheck: true,
      negativeControlPolicyCheck: true,
      answerGeneration: false,
      retrievalIndexBuild: false,
      retrievalIndexQuery: false,
      embeddingModelInstall: false,
      providerCall: false,
      benchmarkRun: false,
      trainingRun: false,
      runtimeAuthority: false
    },
    sourceGroupCounts,
    goldenQueryChecks,
    negativeControlChecks,
    invariantChecks,
    metricsPreview: {
      status: "dry-run-structural-only",
      citationCoverage: "not-measured",
      sourceFaithfulness: "not-measured",
      unsupportedClaimRate: "not-measured",
      refusalAccuracy: "not-measured",
      secretLeakageFindings: "not-measured"
    },
    requiredBeforeRealEvaluationRun: [
      "human reviewer accepts dry-run output",
      "local-only retrieval index build separately approved",
      "retrieval runner implementation reviewed",
      "redacted answer logs implemented",
      "citation scorer implemented",
      "no-secret output scan implemented",
      "human approval recorded"
    ],
    publicClaims: {
      canClaimDryRunPassed: passed,
      canClaimEvaluationRun: false,
      canClaimRetrievalQualityMeasured: false,
      canClaimBenchmarkPassed: false,
      canClaimFullyKnowledgeableAI: false,
      canClaimAGI: false,
      canClaim512BRouteEligible: false
    },
    linkedStatuses: {
      fixtures: fixtures.status,
      retrievalSourceProvenance: retrievalSourceProvenance.status,
      retrievalSourceSecretFindings: retrievalSourceProvenance.secretScan?.findingsCount ?? null,
      knowledgeRetrievalTraining: knowledgeRetrievalTraining.status,
      agiEvaluationProtocol: agiEvaluationProtocol.status,
      agiClaimAllowed: agiEvaluationProtocol.agiClaimAllowed === true
    },
    packageScripts: {
      check: packageJson.scripts?.["check:seis-retrieval-evaluation-dry-run"] || null,
      report: packageJson.scripts?.["report:seis-retrieval-evaluation-dry-run"] || null
    }
  };
}

function buildReport(dryRun) {
  return {
    id: "seis-retrieval-evaluation-dry-run-report",
    generatedAt: dryRun.generatedAt,
    status: dryRun.status,
    sourceDryRun: paths.dryRun,
    summary: {
      goldenQueryChecks: dryRun.goldenQueryChecks.length,
      negativeControlChecks: dryRun.negativeControlChecks.length,
      invariantChecks: dryRun.invariantChecks.length,
      failedGoldenQueryChecks: dryRun.goldenQueryChecks.filter((check) => check.status !== "passed-local-fixture-check").length,
      failedNegativeControlChecks: dryRun.negativeControlChecks.filter((check) => check.status !== "passed-policy-fixture-check").length,
      failedInvariantChecks: dryRun.invariantChecks.filter((check) => check.status !== "passed").length,
      answerGeneration: dryRun.approvedToday.answerGeneration,
      retrievalIndexQuery: dryRun.approvedToday.retrievalIndexQuery,
      providerCall: dryRun.approvedToday.providerCall,
      benchmarkRun: dryRun.approvedToday.benchmarkRun,
      trainingRun: dryRun.approvedToday.trainingRun
    },
    safeNextCommands: [
      "npm run report:seis-retrieval-evaluation-dry-run",
      "npm run check:seis-retrieval-evaluation-dry-run",
      "npm run check:seis-retrieval-evaluation-fixtures",
      "npm run check:seis-retrieval-source-provenance",
      "npm run check:seis-ai-public-readiness"
    ],
    humanApprovalNeededBefore: dryRun.requiredBeforeRealEvaluationRun
  };
}

function validateDryRun(dryRun, packageJson) {
  ensure(dryRun.id === "seis-retrieval-evaluation-dry-run", "dry-run id mismatch");
  ensure(dryRun.status === "dry-run-passed-no-index-no-model", "dry-run status mismatch");
  ensure(dryRun.qualityGate === "npm run check:seis-retrieval-evaluation-dry-run", "dry-run qualityGate mismatch");
  ensure(dryRun.reportCommand === "npm run report:seis-retrieval-evaluation-dry-run", "dry-run reportCommand mismatch");
  ensure(dryRun.resourceUri === "seis://ai/retrieval-evaluation-dry-run.json", "dry-run resource URI mismatch");
  ensure(dryRun.sourceOfTruth?.fixtures === paths.fixtures, "fixtures link mismatch");
  ensure(dryRun.sourceOfTruth?.retrievalSourceProvenance === paths.retrievalSourceProvenance, "retrieval source provenance link mismatch");
  ensure(dryRun.sourceOfTruth?.knowledgeRetrievalTraining === paths.knowledgeRetrievalTraining, "knowledge retrieval training link mismatch");
  ensure(dryRun.sourceOfTruth?.agiEvaluationProtocol === paths.agiEvaluationProtocol, "AGI evaluation protocol link mismatch");
  ensure(Object.keys(dryRun.sourceGroupCounts || {}).length >= 4, "dry-run must cover source groups");
  ensure(dryRun.goldenQueryChecks.length >= 8, "dry-run must cover golden queries");
  ensure(dryRun.negativeControlChecks.length >= 5, "dry-run must cover negative controls");

  for (const phrase of [
    "does not generate answers",
    "does not build or query a retrieval index",
    "does not call external providers",
    "does not run a benchmark or score live model quality",
    "does not prove SEIS is fully knowledgeable, routeable 512B, or AGI"
  ]) {
    ensure(dryRun.truthBoundary.some((line) => line.includes(phrase)), `truthBoundary missing phrase: ${phrase}`);
  }

  for (const [field, expected] of Object.entries({
    localFixtureDryRun: true,
    sourceGroupCoverageCheck: true,
    negativeControlPolicyCheck: true,
    answerGeneration: false,
    retrievalIndexBuild: false,
    retrievalIndexQuery: false,
    embeddingModelInstall: false,
    providerCall: false,
    benchmarkRun: false,
    trainingRun: false,
    runtimeAuthority: false
  })) {
    ensure(dryRun.approvedToday?.[field] === expected, `approvedToday.${field} must be ${expected}`);
  }

  for (const [field, expected] of Object.entries({
    canClaimDryRunPassed: true,
    canClaimEvaluationRun: false,
    canClaimRetrievalQualityMeasured: false,
    canClaimBenchmarkPassed: false,
    canClaimFullyKnowledgeableAI: false,
    canClaimAGI: false,
    canClaim512BRouteEligible: false
  })) {
    ensure(dryRun.publicClaims?.[field] === expected, `publicClaims.${field} must be ${expected}`);
  }

  ensure(dryRun.goldenQueryChecks.every((check) => check.status === "passed-local-fixture-check"), "all golden query dry-run checks must pass");
  ensure(dryRun.goldenQueryChecks.every((check) => check.answerGenerated === false && check.indexQueried === false), "golden query dry-run must not generate answers or query index");
  ensure(dryRun.negativeControlChecks.every((check) => check.status === "passed-policy-fixture-check"), "all negative control policy checks must pass");
  ensure(dryRun.negativeControlChecks.every((check) => check.providerCalled === false && check.indexQueried === false), "negative-control dry-run must not call providers or query index");
  ensure(dryRun.invariantChecks.every((check) => check.status === "passed"), "all invariant checks must pass");
  ensure(dryRun.linkedStatuses?.retrievalSourceSecretFindings === 0, "dry-run must link zero retrieval source secret findings");
  ensure(dryRun.linkedStatuses?.agiClaimAllowed === false, "dry-run must keep AGI claim blocked");
  ensure(dryRun.requiredBeforeRealEvaluationRun.includes("human approval recorded"), "real evaluation run must require human approval");
  ensure(
    packageJson.scripts?.["check:seis-retrieval-evaluation-dry-run"] === "node scripts/create-seis-retrieval-evaluation-dry-run.mjs",
    "package.json must expose check:seis-retrieval-evaluation-dry-run"
  );
  ensure(
    packageJson.scripts?.["report:seis-retrieval-evaluation-dry-run"] === "node scripts/create-seis-retrieval-evaluation-dry-run.mjs --write",
    "package.json must expose report:seis-retrieval-evaluation-dry-run"
  );
}

function renderReportMarkdown(report) {
  const commands = report.safeNextCommands.map((command) => `- \`${command}\``).join("\n");
  const approvals = report.humanApprovalNeededBefore.map((item) => `- ${item}`).join("\n");
  return `# SEIS Retrieval Evaluation Dry-Run Report

Generated: ${report.generatedAt}

Status: ${report.status}

## Summary

| Field | Value |
| --- | --- |
| Golden query checks | ${report.summary.goldenQueryChecks} |
| Negative control checks | ${report.summary.negativeControlChecks} |
| Invariant checks | ${report.summary.invariantChecks} |
| Failed golden query checks | ${report.summary.failedGoldenQueryChecks} |
| Failed negative control checks | ${report.summary.failedNegativeControlChecks} |
| Failed invariant checks | ${report.summary.failedInvariantChecks} |
| Answer generation approved | ${String(report.summary.answerGeneration)} |
| Retrieval index query approved | ${String(report.summary.retrievalIndexQuery)} |
| Provider call approved | ${String(report.summary.providerCall)} |
| Benchmark run approved | ${String(report.summary.benchmarkRun)} |
| Training run approved | ${String(report.summary.trainingRun)} |

## Safe Next Commands

${commands}

## Human Approval Needed Before Real Evaluation Run

${approvals}
`;
}

function renderDocs(dryRun, report) {
  const sourceGroups = Object.entries(dryRun.sourceGroupCounts).map(([id, count]) => `| ${id} | ${count} |`).join("\n");
  const golden = dryRun.goldenQueryChecks.map((item) => `| ${item.id} | ${item.status} | ${item.expectedSourceGroups.join(", ")} | ${item.answerGenerated} | ${item.indexQueried} |`).join("\n");
  const negatives = dryRun.negativeControlChecks.map((item) => `| ${item.id} | ${item.status} | ${item.refusalOrIgnorePolicyDefined} | ${item.providerCalled} |`).join("\n");
  const invariants = dryRun.invariantChecks.map((item) => `| ${item.id} | ${item.status} |`).join("\n");
  const requirements = dryRun.requiredBeforeRealEvaluationRun.map((item) => `- ${item}`).join("\n");
  const sources = dryRun.internetResearchBaseline.map((source) => `- [${source.id}](${source.url}) - ${source.usedFor}`).join("\n");

  return `# SEIS Retrieval Evaluation Dry-Run

This document records a local-only structural dry-run for SEIS retrieval
evaluation fixtures. It validates fixture coverage and safety invariants without
generating answers, building or querying an index, calling providers, running a
benchmark, training a model, granting 512B route eligibility, or proving AGI.

## Current Status

- Dry-run status: ${dryRun.status}
- Golden query checks: ${dryRun.goldenQueryChecks.length}
- Negative control checks: ${dryRun.negativeControlChecks.length}
- Invariant checks: ${dryRun.invariantChecks.length}
- Answer generation approved: ${String(dryRun.approvedToday.answerGeneration)}
- Retrieval index query approved: ${String(dryRun.approvedToday.retrievalIndexQuery)}
- Provider call approved: ${String(dryRun.approvedToday.providerCall)}
- Benchmark run approved: ${String(dryRun.approvedToday.benchmarkRun)}
- Training run approved: ${String(dryRun.approvedToday.trainingRun)}

## Source Group Coverage

| Source group | File records |
| --- | --- |
${sourceGroups}

## Golden Query Dry-Run Checks

| Query | Status | Expected groups | Answer generated | Index queried |
| --- | --- | --- | --- | --- |
${golden}

## Negative Control Policy Checks

| Control | Status | Refusal/ignore policy defined | Provider called |
| --- | --- | --- | --- |
${negatives}

## Invariants

| Invariant | Status |
| --- | --- |
${invariants}

## Required Before Real Evaluation Run

${requirements}

## Research Baseline

${sources}

## Commands

\`\`\`bash
npm run report:seis-retrieval-evaluation-dry-run
npm run check:seis-retrieval-evaluation-dry-run
\`\`\`

## Report

Reviewer report:
\`reports/seis-model-scaling/seis-retrieval-evaluation-dry-run.md\`
`;
}

function invariant(id, passed) {
  return { id, status: passed ? "passed" : "failed" };
}

function hashText(value) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash.toString(16).padStart(8, "0");
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
  } catch (error) {
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
  if (stableStringify(actual) !== stableStringify(expected)) failures.push(`${label} is stale. Run npm run report:seis-retrieval-evaluation-dry-run.`);
}

function checkText(relativePath, expected, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(absolutePath, "utf8");
  if (actual !== expected) failures.push(`${label} is stale. Run npm run report:seis-retrieval-evaluation-dry-run.`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(message) {
  if (failures.length > 0) {
    console.error("SEIS retrieval evaluation dry-run check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2);
}
