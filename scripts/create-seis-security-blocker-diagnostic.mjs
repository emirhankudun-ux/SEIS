#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const paths = {
  diagnostic: "content/development/seis-security-blocker-diagnostic.json",
  reportJson: "reports/seis-model-scaling/seis-security-blocker-diagnostic.json",
  reportMd: "reports/seis-model-scaling/seis-security-blocker-diagnostic.md",
  docs: "docs/ai/seis-security-blocker-diagnostic.md",
  publicReadinessProgram: "content/development/seis-ai-public-readiness-program.json",
  redactedAnswerLogSchema: "content/development/seis-redacted-answer-log-schema.json",
  noSecretAnswerLogScan: "content/development/seis-no-secret-answer-log-scan.json",
  securityWorkflow: ".github/workflows/security-guardian.yml",
  gitleaksConfig: ".gitleaks.toml",
  nextPrQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(paths.diagnostic) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const program = readJson(paths.publicReadinessProgram, "AI public readiness program");
const redactedAnswerLogSchema = readJson(paths.redactedAnswerLogSchema, "redacted answer log schema");
const noSecretAnswerLogScan = readJson(paths.noSecretAnswerLogScan, "no-secret answer log scan");
const packageJson = readJson(paths.packageJson, "package.json");
const securityWorkflow = readText(paths.securityWorkflow, "security workflow");
const gitleaksConfig = readText(paths.gitleaksConfig, "gitleaks config");
const nextPrQueue = readText(paths.nextPrQueue, "next PR queue");

if (!program || !redactedAnswerLogSchema || !noSecretAnswerLogScan || !packageJson) process.exit(1);

const diagnostic = buildDiagnostic({
  generatedAt,
  program,
  redactedAnswerLogSchema,
  noSecretAnswerLogScan,
  packageJson,
  securityWorkflow,
  gitleaksConfig,
  nextPrQueue
});
const report = buildReport(diagnostic);
const markdown = renderReportMarkdown(report);
const docs = renderDocs(diagnostic, report);

if (mode === "write") {
  writeJson(paths.diagnostic, diagnostic);
  writeJson(paths.reportJson, report);
  writeText(paths.reportMd, markdown);
  writeText(paths.docs, docs);
  console.log("SEIS security blocker diagnostic generated.");
  console.log(JSON.stringify({
    diagnostic: paths.diagnostic,
    report: paths.reportJson,
    markdown: paths.reportMd,
    docs: paths.docs
  }, null, 2));
} else {
  checkJson(paths.diagnostic, diagnostic, "security blocker diagnostic");
  checkJson(paths.reportJson, report, "security blocker diagnostic report");
  checkText(paths.reportMd, markdown, "security blocker diagnostic markdown report");
  checkText(paths.docs, docs, "security blocker diagnostic docs");
  validateDiagnostic(diagnostic, packageJson);
  finish("SEIS security blocker diagnostic check passed.");
}

function buildDiagnostic({ generatedAt, program, redactedAnswerLogSchema, noSecretAnswerLogScan, packageJson, securityWorkflow, gitleaksConfig, nextPrQueue }) {
  const workflowChecks = [
    check("security-workflow-present", securityWorkflow.includes("Secret & Vulnerability Scan"), "security workflow defines Secret & Vulnerability Scan"),
    check("gitleaks-used", securityWorkflow.includes("gitleaks detect"), "security workflow invokes gitleaks detect"),
    check("full-history-scan", securityWorkflow.includes("fetch-depth: 0"), "security workflow fetches full history"),
    check("security-summary-derived", securityWorkflow.includes("needs.security-scan.result"), "Security Summary derives from security-scan result"),
    check("gitleaks-config-present", gitleaksConfig.includes("[extend]") && gitleaksConfig.includes("useDefault = true"), "gitleaks config extends default rules")
  ];

  const blockerLine = (nextPrQueue.split("\n").find((line) => line.includes("Current blocker") && line.includes("Secret & Vulnerability Scan")) || "").trim();
  const queueChecks = [
    check("next-pr-queue-records-blocker", blockerLine.length > 0, "NEXT_PR_QUEUE records PR #100 security blocker"),
    check("blocker-attributed-to-full-history", blockerLine.includes("full-history GitLeaks scan"), "blocker attributed to full-history GitLeaks scan"),
    check("blocker-not-new-diff-secret", blockerLine.includes("not from new secret material in this PR diff"), "blocker not attributed to new PR diff secret material"),
    check("no-secret-value-output-required", nextPrQueue.includes("Do not print or copy any secret value"), "queue explicitly forbids printing or copying secret values"),
    check("approval-required-for-security-posture", nextPrQueue.includes("security allowlist push") && nextPrQueue.includes("history rewrite") && nextPrQueue.includes("secret rotation"), "queue requires approval for security posture changes")
  ];

  const safetyChecks = [
    check("program-everyone-ready-blocked", program.githubReadyForEveryone === false, "program keeps githubReadyForEveryone false"),
    check("redacted-schema-no-real-logs", redactedAnswerLogSchema.approvedToday?.realAnswerLogCollection === false, "redacted answer schema collects no real logs"),
    check("no-secret-scan-synthetic-only", noSecretAnswerLogScan.approvedToday?.realAnswerLogScan === false, "no-secret scan uses no real answer logs")
  ];

  const allChecks = [...workflowChecks, ...queueChecks, ...safetyChecks];
  const passed = allChecks.every((item) => item.status === "passed");

  return {
    id: "seis-security-blocker-diagnostic",
    version: "2026.07.01",
    generatedAt,
    status: passed ? "security-blocker-diagnostic-ready-approval-gated" : "security-blocker-diagnostic-failed-approval-gated",
    qualityGate: "npm run check:seis-security-blocker-diagnostic",
    reportCommand: "npm run report:seis-security-blocker-diagnostic",
    resourceUri: "seis://ai/security-blocker-diagnostic.json",
    truthBoundary: [
      "This diagnostic records the PR #100 security blocker without printing, copying, or storing secret values.",
      "It does not change the gitleaks allowlist.",
      "It does not rewrite git history.",
      "It does not rotate secrets.",
      "It does not mark GitHub ready for everyone.",
      "It does not merge, release, deploy, call providers, run benchmarks, train models, grant 512B route eligibility, or prove AGI."
    ],
    sourceOfTruth: {
      publicReadinessProgram: paths.publicReadinessProgram,
      redactedAnswerLogSchema: paths.redactedAnswerLogSchema,
      noSecretAnswerLogScan: paths.noSecretAnswerLogScan,
      securityWorkflow: paths.securityWorkflow,
      gitleaksConfig: paths.gitleaksConfig,
      nextPrQueue: paths.nextPrQueue,
      docs: paths.docs
    },
    internetResearchBaseline: [
      {
        id: "github-secret-scanning",
        sourceType: "official-docs",
        url: "https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning",
        usedFor: "Secret scanning remediation and review framing."
      },
      {
        id: "gitleaks",
        sourceType: "official-project",
        url: "https://github.com/gitleaks/gitleaks",
        usedFor: "Understanding the full-history scanner used by the workflow."
      },
      {
        id: "nist-ai-rmf",
        sourceType: "official-guidance",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        usedFor: "Risk governance and approval-gate discipline."
      }
    ],
    blockerSummary: {
      prNumber: 100,
      failingChecks: ["Secret & Vulnerability Scan", "Security Summary"],
      derivedFailure: "Security Summary derives from Secret & Vulnerability Scan.",
      currentAttribution: "full-history GitLeaks scan against older generated aggregate bundle path",
      newDiffSecretMaterialAttributed: false,
      secretValuesPrintedOrStored: false,
      remediationStatus: "approval-gated",
      sourceLine: blockerLine
    },
    approvedToday: {
      diagnosticReport: true,
      localWorkflowInspection: true,
      secretValueOutput: false,
      gitleaksAllowlistChange: false,
      historyRewrite: false,
      secretRotation: false,
      mergeOrRelease: false,
      deployment: false,
      providerCall: false,
      benchmarkRun: false,
      trainingRun: false,
      runtimeAuthority: false
    },
    checks: allChecks,
    requiredHumanDecisionBeforeRemediation: [
      "choose narrow gitleaks allowlist vs history cleanup vs rotation plan",
      "confirm whether the older generated aggregate bundle path may be allowlisted",
      "confirm whether any exposed secret requires rotation",
      "approve any history rewrite before execution",
      "approve any security allowlist push before execution",
      "approve PR #100 merge only after security checks are green"
    ],
    publicClaims: {
      canClaimSecurityBlockerDiagnosed: passed,
      canClaimSecurityBlockerFixed: false,
      canClaimGithubReadyForEveryone: false,
      canClaimNoSecretHistory: false,
      canClaimAgiReady: false,
      canClaim512BRouteEligible: false
    },
    linkedStatuses: {
      publicReadinessProgram: program.status,
      githubReadyForEveryone: program.githubReadyForEveryone,
      redactedAnswerLogSchema: redactedAnswerLogSchema.status,
      noSecretAnswerLogScan: noSecretAnswerLogScan.status
    },
    packageScripts: {
      check: packageJson.scripts?.["check:seis-security-blocker-diagnostic"] || null,
      report: packageJson.scripts?.["report:seis-security-blocker-diagnostic"] || null
    }
  };
}

function buildReport(diagnostic) {
  return {
    id: "seis-security-blocker-diagnostic-report",
    generatedAt: diagnostic.generatedAt,
    status: diagnostic.status,
    sourceDiagnostic: paths.diagnostic,
    summary: {
      prNumber: diagnostic.blockerSummary.prNumber,
      failingChecks: diagnostic.blockerSummary.failingChecks.length,
      failedDiagnosticChecks: diagnostic.checks.filter((item) => item.status !== "passed").length,
      secretValuesPrintedOrStored: diagnostic.blockerSummary.secretValuesPrintedOrStored,
      blockerFixed: diagnostic.publicClaims.canClaimSecurityBlockerFixed,
      githubReadyForEveryone: diagnostic.publicClaims.canClaimGithubReadyForEveryone,
      gitleaksAllowlistChange: diagnostic.approvedToday.gitleaksAllowlistChange,
      historyRewrite: diagnostic.approvedToday.historyRewrite,
      secretRotation: diagnostic.approvedToday.secretRotation
    },
    safeNextCommands: [
      "npm run report:seis-security-blocker-diagnostic",
      "npm run check:seis-security-blocker-diagnostic",
      "npm run check:seis-ai-public-readiness"
    ],
    humanApprovalNeededBefore: diagnostic.requiredHumanDecisionBeforeRemediation
  };
}

function validateDiagnostic(diagnostic, packageJson) {
  ensure(diagnostic.id === "seis-security-blocker-diagnostic", "security blocker diagnostic id mismatch");
  ensure(diagnostic.status === "security-blocker-diagnostic-ready-approval-gated", "security blocker diagnostic status mismatch");
  ensure(diagnostic.qualityGate === "npm run check:seis-security-blocker-diagnostic", "security blocker diagnostic qualityGate mismatch");
  ensure(diagnostic.reportCommand === "npm run report:seis-security-blocker-diagnostic", "security blocker diagnostic reportCommand mismatch");
  ensure(diagnostic.resourceUri === "seis://ai/security-blocker-diagnostic.json", "security blocker diagnostic resource URI mismatch");
  ensure(diagnostic.checks.length >= 10, "security blocker diagnostic must include concrete checks");
  ensure(diagnostic.checks.every((item) => item.status === "passed"), "all security blocker diagnostic checks must pass");
  ensure(diagnostic.blockerSummary.prNumber === 100, "diagnostic must target PR #100");
  ensure(diagnostic.blockerSummary.failingChecks.includes("Secret & Vulnerability Scan"), "diagnostic must name Secret & Vulnerability Scan");
  ensure(diagnostic.blockerSummary.failingChecks.includes("Security Summary"), "diagnostic must name Security Summary");
  ensure(diagnostic.blockerSummary.newDiffSecretMaterialAttributed === false, "diagnostic must not attribute blocker to new diff secret material");
  ensure(diagnostic.blockerSummary.secretValuesPrintedOrStored === false, "diagnostic must not print or store secret values");

  for (const phrase of [
    "without printing, copying, or storing secret values",
    "does not change the gitleaks allowlist",
    "does not rewrite git history",
    "does not rotate secrets",
    "does not mark GitHub ready for everyone",
    "does not merge, release, deploy, call providers, run benchmarks, train models, grant 512B route eligibility, or prove AGI"
  ]) {
    ensure(diagnostic.truthBoundary.some((line) => line.includes(phrase)), `truthBoundary missing phrase: ${phrase}`);
  }

  for (const [field, expected] of Object.entries({
    diagnosticReport: true,
    localWorkflowInspection: true,
    secretValueOutput: false,
    gitleaksAllowlistChange: false,
    historyRewrite: false,
    secretRotation: false,
    mergeOrRelease: false,
    deployment: false,
    providerCall: false,
    benchmarkRun: false,
    trainingRun: false,
    runtimeAuthority: false
  })) {
    ensure(diagnostic.approvedToday?.[field] === expected, `approvedToday.${field} must be ${expected}`);
  }

  for (const [field, expected] of Object.entries({
    canClaimSecurityBlockerDiagnosed: true,
    canClaimSecurityBlockerFixed: false,
    canClaimGithubReadyForEveryone: false,
    canClaimNoSecretHistory: false,
    canClaimAgiReady: false,
    canClaim512BRouteEligible: false
  })) {
    ensure(diagnostic.publicClaims?.[field] === expected, `publicClaims.${field} must be ${expected}`);
  }

  ensure(diagnostic.requiredHumanDecisionBeforeRemediation.includes("approve any security allowlist push before execution"), "security allowlist push must require human approval");
  ensure(diagnostic.requiredHumanDecisionBeforeRemediation.includes("approve any history rewrite before execution"), "history rewrite must require human approval");
  ensure(
    packageJson.scripts?.["check:seis-security-blocker-diagnostic"] === "node scripts/create-seis-security-blocker-diagnostic.mjs",
    "package.json must expose check:seis-security-blocker-diagnostic"
  );
  ensure(
    packageJson.scripts?.["report:seis-security-blocker-diagnostic"] === "node scripts/create-seis-security-blocker-diagnostic.mjs --write",
    "package.json must expose report:seis-security-blocker-diagnostic"
  );
}

function renderReportMarkdown(report) {
  const commands = report.safeNextCommands.map((command) => `- \`${command}\``).join("\n");
  const approvals = report.humanApprovalNeededBefore.map((item) => `- ${item}`).join("\n");
  return `# SEIS Security Blocker Diagnostic Report

Generated: ${report.generatedAt}

Status: ${report.status}

## Summary

| Field | Value |
| --- | --- |
| PR | #${report.summary.prNumber} |
| Failing checks | ${report.summary.failingChecks} |
| Failed diagnostic checks | ${report.summary.failedDiagnosticChecks} |
| Secret values printed or stored | ${String(report.summary.secretValuesPrintedOrStored)} |
| Blocker fixed | ${String(report.summary.blockerFixed)} |
| GitHub ready for everyone | ${String(report.summary.githubReadyForEveryone)} |
| Gitleaks allowlist changed | ${String(report.summary.gitleaksAllowlistChange)} |
| History rewrite approved | ${String(report.summary.historyRewrite)} |
| Secret rotation approved | ${String(report.summary.secretRotation)} |

## Safe Next Commands

${commands}

## Human Approval Needed Before Remediation

${approvals}
`;
}

function renderDocs(diagnostic, report) {
  const checks = diagnostic.checks.map((item) => `| ${item.id} | ${item.status} | ${item.evidence} |`).join("\n");
  const approvals = diagnostic.requiredHumanDecisionBeforeRemediation.map((item) => `- ${item}`).join("\n");
  const sources = diagnostic.internetResearchBaseline.map((source) => `- [${source.id}](${source.url}) - ${source.usedFor}`).join("\n");

  return `# SEIS Security Blocker Diagnostic

This document records the current PR #100 security blocker without printing,
copying, or storing secret values. It does not change the gitleaks allowlist,
rewrite git history, rotate secrets, mark GitHub ready for everyone, merge,
release, deploy, call providers, run benchmarks, train a model, grant 512B
route eligibility, or prove AGI.

## Current Status

- Diagnostic status: ${diagnostic.status}
- PR: #${diagnostic.blockerSummary.prNumber}
- Failing checks: ${diagnostic.blockerSummary.failingChecks.join(", ")}
- Derived failure: ${diagnostic.blockerSummary.derivedFailure}
- Current attribution: ${diagnostic.blockerSummary.currentAttribution}
- New diff secret material attributed: ${String(diagnostic.blockerSummary.newDiffSecretMaterialAttributed)}
- Secret values printed or stored: ${String(diagnostic.blockerSummary.secretValuesPrintedOrStored)}
- Blocker fixed: ${String(diagnostic.publicClaims.canClaimSecurityBlockerFixed)}
- GitHub ready for everyone: ${String(diagnostic.publicClaims.canClaimGithubReadyForEveryone)}

## Diagnostic Checks

| Check | Status | Evidence |
| --- | --- | --- |
${checks}

## Human Approval Needed Before Remediation

${approvals}

## Research Baseline

${sources}

## Commands

\`\`\`bash
npm run report:seis-security-blocker-diagnostic
npm run check:seis-security-blocker-diagnostic
\`\`\`

## Report

Reviewer report:
\`reports/seis-model-scaling/seis-security-blocker-diagnostic.md\`
`;
}

function check(id, condition, evidence) {
  return { id, status: condition ? "passed" : "failed", evidence };
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

function readText(relativePath, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function checkJson(relativePath, expected, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = JSON.parse(readFileSync(absolutePath, "utf8"));
  if (stableStringify(actual) !== stableStringify(expected)) failures.push(`${label} is stale. Run npm run report:seis-security-blocker-diagnostic.`);
}

function checkText(relativePath, expected, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(absolutePath, "utf8");
  if (actual !== expected) failures.push(`${label} is stale. Run npm run report:seis-security-blocker-diagnostic.`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(message) {
  if (failures.length > 0) {
    console.error("SEIS security blocker diagnostic check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2);
}
