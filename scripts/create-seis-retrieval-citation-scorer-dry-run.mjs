#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const paths = {
  scorer: "content/development/seis-retrieval-citation-scorer-dry-run.json",
  reportJson: "reports/seis-model-scaling/seis-retrieval-citation-scorer-dry-run.json",
  reportMd: "reports/seis-model-scaling/seis-retrieval-citation-scorer-dry-run.md",
  docs: "docs/ai/seis-retrieval-citation-scorer-dry-run.md",
  dryRun: "content/development/seis-retrieval-evaluation-dry-run.json",
  fixtures: "content/development/seis-retrieval-evaluation-fixtures.json",
  retrievalSourceProvenance: "content/development/seis-retrieval-source-provenance-manifest.json",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(paths.scorer) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const dryRun = readJson(paths.dryRun, "retrieval evaluation dry-run");
const fixtures = readJson(paths.fixtures, "retrieval evaluation fixtures");
const retrievalSourceProvenance = readJson(paths.retrievalSourceProvenance, "retrieval source provenance manifest");
const packageJson = readJson(paths.packageJson, "package.json");

if (!dryRun || !fixtures || !retrievalSourceProvenance || !packageJson) process.exit(1);

const scorer = buildScorer({ generatedAt, dryRun, fixtures, retrievalSourceProvenance, packageJson });
const report = buildReport(scorer);
const markdown = renderReportMarkdown(report);
const docs = renderDocs(scorer, report);

if (mode === "write") {
  writeJson(paths.scorer, scorer);
  writeJson(paths.reportJson, report);
  writeText(paths.reportMd, markdown);
  writeText(paths.docs, docs);
  console.log("SEIS retrieval citation scorer dry-run generated.");
  console.log(JSON.stringify({
    scorer: paths.scorer,
    report: paths.reportJson,
    markdown: paths.reportMd,
    docs: paths.docs
  }, null, 2));
} else {
  checkJson(paths.scorer, scorer, "retrieval citation scorer dry-run");
  checkJson(paths.reportJson, report, "retrieval citation scorer dry-run report");
  checkText(paths.reportMd, markdown, "retrieval citation scorer dry-run markdown report");
  checkText(paths.docs, docs, "retrieval citation scorer dry-run docs");
  validateScorer(scorer, packageJson);
  finish("SEIS retrieval citation scorer dry-run check passed.");
}

function buildScorer({ generatedAt, dryRun, fixtures, retrievalSourceProvenance, packageJson }) {
  const citationQuery = fixtures.goldenQueries.find((query) => query.id === "citation-policy");
  const fileRecordChecks = retrievalSourceProvenance.fileRecords.map((record) => ({
    path: record.path,
    groupId: record.groupId,
    sourceUriPresent: typeof record.sourceUri === "string" && record.sourceUri.startsWith("seis://retrieval/source/"),
    sha256Present: typeof record.sha256 === "string" && record.sha256.length === 64,
    mediaTypePresent: typeof record.mediaType === "string" && record.mediaType.length > 0
  }));

  const scoringRules = [
    rule("source-uri-required", "Every supported answer citation must carry a source URI."),
    rule("source-hash-required", "Every supported answer citation must resolve to a SHA-256 source record."),
    rule("unsupported-claim-block", "Unsupported claims must be flagged, not silently scored as supported."),
    rule("answerless-dry-run", "This dry-run must not generate answers or score live answer quality."),
    rule("redacted-log-required", "Future scorer logs must preserve source ids without secret values or private data.")
  ];

  const citationChecks = [
    {
      id: "citation-policy-query-present",
      status: citationQuery ? "passed" : "failed",
      evidence: citationQuery ? citationQuery.requiredBehavior : "citation-policy golden query missing"
    },
    {
      id: "source-uri-coverage",
      status: fileRecordChecks.every((record) => record.sourceUriPresent) ? "passed" : "failed",
      evidence: `${fileRecordChecks.filter((record) => record.sourceUriPresent).length}/${fileRecordChecks.length} records include sourceUri`
    },
    {
      id: "sha256-coverage",
      status: fileRecordChecks.every((record) => record.sha256Present) ? "passed" : "failed",
      evidence: `${fileRecordChecks.filter((record) => record.sha256Present).length}/${fileRecordChecks.length} records include SHA-256`
    },
    {
      id: "dry-run-answerless",
      status: dryRun.approvedToday?.answerGeneration === false && dryRun.approvedToday?.retrievalIndexQuery === false ? "passed" : "failed",
      evidence: "dry-run answer generation and retrieval index query remain false"
    },
    {
      id: "metric-not-measured",
      status: fixtures.metricsPlan?.metrics?.some((metric) => metric.id === "citationCoverage" && metric.status === "not-measured") ? "passed" : "failed",
      evidence: "citationCoverage is defined but not measured"
    }
  ];

  const passed = citationChecks.every((check) => check.status === "passed");

  return {
    id: "seis-retrieval-citation-scorer-dry-run",
    version: "2026.07.01",
    generatedAt,
    status: passed ? "citation-scorer-dry-run-passed-not-measured" : "citation-scorer-dry-run-failed-not-measured",
    qualityGate: "npm run check:seis-retrieval-citation-scorer-dry-run",
    reportCommand: "npm run report:seis-retrieval-citation-scorer-dry-run",
    resourceUri: "seis://ai/retrieval-citation-scorer-dry-run.json",
    truthBoundary: [
      "This is a citation scorer dry-run harness only.",
      "It checks citation rule coverage and source record structure.",
      "It does not generate answers.",
      "It does not score live answer quality.",
      "It does not query a retrieval index.",
      "It does not call external providers.",
      "It does not run benchmarks, train models, grant 512B route eligibility, or prove AGI."
    ],
    sourceOfTruth: {
      dryRun: paths.dryRun,
      fixtures: paths.fixtures,
      retrievalSourceProvenance: paths.retrievalSourceProvenance,
      docs: paths.docs
    },
    internetResearchBaseline: [
      {
        id: "ragas",
        sourceType: "primary-paper",
        url: "https://arxiv.org/abs/2309.15217",
        usedFor: "RAG faithfulness and context-use evaluation framing."
      },
      {
        id: "helm",
        sourceType: "primary-paper",
        url: "https://arxiv.org/abs/2211.09110",
        usedFor: "Scenario-based evaluation and metric reporting discipline."
      },
      {
        id: "nist-ai-rmf",
        sourceType: "official-guidance",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        usedFor: "Measurement, governance, and promotion-gate discipline."
      }
    ],
    approvedToday: {
      citationRuleDryRun: true,
      sourceUriCoverageCheck: true,
      sha256CoverageCheck: true,
      liveCitationScoring: false,
      answerGeneration: false,
      retrievalIndexQuery: false,
      providerCall: false,
      benchmarkRun: false,
      trainingRun: false,
      runtimeAuthority: false
    },
    scoringRules,
    citationChecks,
    fileRecordSummary: {
      totalRecords: fileRecordChecks.length,
      sourceUriPresent: fileRecordChecks.filter((record) => record.sourceUriPresent).length,
      sha256Present: fileRecordChecks.filter((record) => record.sha256Present).length,
      mediaTypePresent: fileRecordChecks.filter((record) => record.mediaTypePresent).length
    },
    metricsPreview: {
      status: "rules-defined-not-measured",
      citationCoverage: "not-measured",
      sourceFaithfulness: "not-measured",
      unsupportedClaimRate: "not-measured"
    },
    requiredBeforeLiveCitationScoring: [
      "local retrieval index query approved",
      "answer generation harness approved",
      "citation scorer implementation reviewed",
      "redacted logs implemented",
      "no-secret answer scan implemented",
      "human approval recorded"
    ],
    publicClaims: {
      canClaimCitationScorerDryRunPassed: passed,
      canClaimCitationCoverageMeasured: false,
      canClaimSourceFaithfulnessMeasured: false,
      canClaimEvaluationRun: false,
      canClaimBenchmarkPassed: false,
      canClaimFullyKnowledgeableAI: false,
      canClaimAGI: false,
      canClaim512BRouteEligible: false
    },
    linkedStatuses: {
      dryRun: dryRun.status,
      fixtures: fixtures.status,
      retrievalSourceProvenance: retrievalSourceProvenance.status,
      retrievalSourceSecretFindings: retrievalSourceProvenance.secretScan?.findingsCount ?? null
    },
    packageScripts: {
      check: packageJson.scripts?.["check:seis-retrieval-citation-scorer-dry-run"] || null,
      report: packageJson.scripts?.["report:seis-retrieval-citation-scorer-dry-run"] || null
    }
  };
}

function buildReport(scorer) {
  return {
    id: "seis-retrieval-citation-scorer-dry-run-report",
    generatedAt: scorer.generatedAt,
    status: scorer.status,
    sourceScorer: paths.scorer,
    summary: {
      scoringRules: scorer.scoringRules.length,
      citationChecks: scorer.citationChecks.length,
      failedCitationChecks: scorer.citationChecks.filter((check) => check.status !== "passed").length,
      sourceRecords: scorer.fileRecordSummary.totalRecords,
      sourceUriPresent: scorer.fileRecordSummary.sourceUriPresent,
      sha256Present: scorer.fileRecordSummary.sha256Present,
      liveCitationScoring: scorer.approvedToday.liveCitationScoring,
      answerGeneration: scorer.approvedToday.answerGeneration,
      retrievalIndexQuery: scorer.approvedToday.retrievalIndexQuery,
      providerCall: scorer.approvedToday.providerCall
    },
    safeNextCommands: [
      "npm run report:seis-retrieval-citation-scorer-dry-run",
      "npm run check:seis-retrieval-citation-scorer-dry-run",
      "npm run check:seis-retrieval-evaluation-dry-run",
      "npm run check:seis-ai-public-readiness"
    ],
    humanApprovalNeededBefore: scorer.requiredBeforeLiveCitationScoring
  };
}

function validateScorer(scorer, packageJson) {
  ensure(scorer.id === "seis-retrieval-citation-scorer-dry-run", "citation scorer id mismatch");
  ensure(scorer.status === "citation-scorer-dry-run-passed-not-measured", "citation scorer status mismatch");
  ensure(scorer.qualityGate === "npm run check:seis-retrieval-citation-scorer-dry-run", "citation scorer qualityGate mismatch");
  ensure(scorer.reportCommand === "npm run report:seis-retrieval-citation-scorer-dry-run", "citation scorer reportCommand mismatch");
  ensure(scorer.resourceUri === "seis://ai/retrieval-citation-scorer-dry-run.json", "citation scorer resource URI mismatch");
  ensure(scorer.sourceOfTruth?.dryRun === paths.dryRun, "dry-run link mismatch");
  ensure(scorer.sourceOfTruth?.fixtures === paths.fixtures, "fixtures link mismatch");
  ensure(scorer.sourceOfTruth?.retrievalSourceProvenance === paths.retrievalSourceProvenance, "retrieval source provenance link mismatch");
  ensure(scorer.scoringRules.length >= 5, "citation scorer must define at least five scoring rules");
  ensure(scorer.citationChecks.length >= 5, "citation scorer must define at least five citation checks");
  ensure(scorer.citationChecks.every((check) => check.status === "passed"), "all citation checks must pass");
  ensure(scorer.fileRecordSummary.totalRecords > 10, "citation scorer must inspect concrete file records");
  ensure(scorer.fileRecordSummary.sourceUriPresent === scorer.fileRecordSummary.totalRecords, "all file records must include sourceUri");
  ensure(scorer.fileRecordSummary.sha256Present === scorer.fileRecordSummary.totalRecords, "all file records must include SHA-256");

  for (const phrase of [
    "does not generate answers",
    "does not score live answer quality",
    "does not query a retrieval index",
    "does not call external providers",
    "does not run benchmarks, train models, grant 512B route eligibility, or prove AGI"
  ]) {
    ensure(scorer.truthBoundary.some((line) => line.includes(phrase)), `truthBoundary missing phrase: ${phrase}`);
  }

  for (const [field, expected] of Object.entries({
    citationRuleDryRun: true,
    sourceUriCoverageCheck: true,
    sha256CoverageCheck: true,
    liveCitationScoring: false,
    answerGeneration: false,
    retrievalIndexQuery: false,
    providerCall: false,
    benchmarkRun: false,
    trainingRun: false,
    runtimeAuthority: false
  })) {
    ensure(scorer.approvedToday?.[field] === expected, `approvedToday.${field} must be ${expected}`);
  }

  for (const [field, expected] of Object.entries({
    canClaimCitationScorerDryRunPassed: true,
    canClaimCitationCoverageMeasured: false,
    canClaimSourceFaithfulnessMeasured: false,
    canClaimEvaluationRun: false,
    canClaimBenchmarkPassed: false,
    canClaimFullyKnowledgeableAI: false,
    canClaimAGI: false,
    canClaim512BRouteEligible: false
  })) {
    ensure(scorer.publicClaims?.[field] === expected, `publicClaims.${field} must be ${expected}`);
  }

  ensure(scorer.linkedStatuses?.dryRun === "dry-run-passed-no-index-no-model", "dry-run status link mismatch");
  ensure(scorer.linkedStatuses?.retrievalSourceSecretFindings === 0, "citation scorer must link zero retrieval source secret findings");
  ensure(scorer.requiredBeforeLiveCitationScoring.includes("human approval recorded"), "live citation scoring must require human approval");
  ensure(
    packageJson.scripts?.["check:seis-retrieval-citation-scorer-dry-run"] === "node scripts/create-seis-retrieval-citation-scorer-dry-run.mjs",
    "package.json must expose check:seis-retrieval-citation-scorer-dry-run"
  );
  ensure(
    packageJson.scripts?.["report:seis-retrieval-citation-scorer-dry-run"] === "node scripts/create-seis-retrieval-citation-scorer-dry-run.mjs --write",
    "package.json must expose report:seis-retrieval-citation-scorer-dry-run"
  );
}

function renderReportMarkdown(report) {
  const commands = report.safeNextCommands.map((command) => `- \`${command}\``).join("\n");
  const approvals = report.humanApprovalNeededBefore.map((item) => `- ${item}`).join("\n");
  return `# SEIS Retrieval Citation Scorer Dry-Run Report

Generated: ${report.generatedAt}

Status: ${report.status}

## Summary

| Field | Value |
| --- | --- |
| Scoring rules | ${report.summary.scoringRules} |
| Citation checks | ${report.summary.citationChecks} |
| Failed citation checks | ${report.summary.failedCitationChecks} |
| Source records | ${report.summary.sourceRecords} |
| Records with source URI | ${report.summary.sourceUriPresent} |
| Records with SHA-256 | ${report.summary.sha256Present} |
| Live citation scoring approved | ${String(report.summary.liveCitationScoring)} |
| Answer generation approved | ${String(report.summary.answerGeneration)} |
| Retrieval index query approved | ${String(report.summary.retrievalIndexQuery)} |
| Provider call approved | ${String(report.summary.providerCall)} |

## Safe Next Commands

${commands}

## Human Approval Needed Before Live Citation Scoring

${approvals}
`;
}

function renderDocs(scorer, report) {
  const rules = scorer.scoringRules.map((rule) => `| ${rule.id} | ${rule.description} |`).join("\n");
  const checks = scorer.citationChecks.map((check) => `| ${check.id} | ${check.status} | ${check.evidence} |`).join("\n");
  const requirements = scorer.requiredBeforeLiveCitationScoring.map((item) => `- ${item}`).join("\n");
  const sources = scorer.internetResearchBaseline.map((source) => `- [${source.id}](${source.url}) - ${source.usedFor}`).join("\n");

  return `# SEIS Retrieval Citation Scorer Dry-Run

This document records a local-only citation scorer dry-run harness for future
SEIS retrieval evaluation. It checks citation rule coverage and source record
structure without generating answers, scoring live model quality, querying a
retrieval index, calling providers, running benchmarks, training a model,
granting 512B route eligibility, or proving AGI.

## Current Status

- Citation scorer status: ${scorer.status}
- Scoring rules: ${scorer.scoringRules.length}
- Citation checks: ${scorer.citationChecks.length}
- Failed citation checks: ${report.summary.failedCitationChecks}
- Source records: ${scorer.fileRecordSummary.totalRecords}
- Live citation scoring approved: ${String(scorer.approvedToday.liveCitationScoring)}
- Answer generation approved: ${String(scorer.approvedToday.answerGeneration)}
- Retrieval index query approved: ${String(scorer.approvedToday.retrievalIndexQuery)}
- Provider call approved: ${String(scorer.approvedToday.providerCall)}

## Scoring Rules

| Rule | Description |
| --- | --- |
${rules}

## Citation Checks

| Check | Status | Evidence |
| --- | --- | --- |
${checks}

## Required Before Live Citation Scoring

${requirements}

## Research Baseline

${sources}

## Commands

\`\`\`bash
npm run report:seis-retrieval-citation-scorer-dry-run
npm run check:seis-retrieval-citation-scorer-dry-run
\`\`\`

## Report

Reviewer report:
\`reports/seis-model-scaling/seis-retrieval-citation-scorer-dry-run.md\`
`;
}

function rule(id, description) {
  return { id, description };
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
  if (stableStringify(actual) !== stableStringify(expected)) failures.push(`${label} is stale. Run npm run report:seis-retrieval-citation-scorer-dry-run.`);
}

function checkText(relativePath, expected, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(absolutePath, "utf8");
  if (actual !== expected) failures.push(`${label} is stale. Run npm run report:seis-retrieval-citation-scorer-dry-run.`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(message) {
  if (failures.length > 0) {
    console.error("SEIS retrieval citation scorer dry-run check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2);
}
