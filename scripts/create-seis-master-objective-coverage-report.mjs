#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");

const coveragePath = "data/seis-master-objective-coverage.json";
const sshHardeningOperationContractPath = "data/ssh-hardening-operation-contract.json";
const reportPath = "reports/seis-master-objective-coverage.md";

function read(relativePath) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`missing ${relativePath}`);
  }
  return readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function tableRow(cells) {
  return `| ${cells.map(cell => String(cell ?? "").replaceAll("|", "\\|")).join(" | ")} |`;
}

function renderList(values) {
  return values.map(value => `- ${value}`).join("\n");
}

function renderReport() {
  const coverage = readJson(coveragePath);
  const sshHardeningOperationContract = readJson(sshHardeningOperationContractPath);
  const items = Array.isArray(coverage.coverage) ? coverage.coverage : [];
  const requiredCommands = Array.isArray(coverage.requiredCommands) ? coverage.requiredCommands : [];
  const modeIsolation = sshHardeningOperationContract.modeIsolation || {};
  const firewallAndLockoutSafety = sshHardeningOperationContract.firewallAndLockoutSafety || {};
  const idempotencyAndFailureHandling = sshHardeningOperationContract.idempotencyAndFailureHandling || {};

  const coverageRows = items
    .map(item =>
      tableRow([
        item.id,
        item.status,
        item.requirement,
        Array.isArray(item.evidence) ? item.evidence.join("; ") : "missing evidence",
        Array.isArray(item.checks) ? item.checks.join("; ") : "missing checks",
        item.gap || "missing gap"
      ])
    )
    .join("\n");

  const statusRows = [
    ["Contract", coverage.contract],
    ["Status", coverage.status],
    ["Coverage source", coveragePath],
    ["SSH hardening operation contract", sshHardeningOperationContractPath],
    ["Coverage report", reportPath],
    ["Coverage items", items.length],
    ["Completion rule", coverage.completionRule],
  ].map(tableRow).join("\n");

  const sshOperationRows = [
    [
      "Mode isolation",
      [
        `hardenDisallowsNormalUserCreation=${modeIsolation.hardenDisallowsNormalUserCreation === true}`,
        `fullSetupRequiresUserSetupStep=${modeIsolation.fullSetupRequiresUserSetupStep === true}`,
        `auditMutatesHost=${modeIsolation.auditMutatesHost === true}`,
        `dashboardMutatesHost=${modeIsolation.dashboardMutatesHost === true}`,
        `verifyMutatesHost=${modeIsolation.verifyMutatesHost === true}`,
        `dryRunMutatesHost=${modeIsolation.dryRunMutatesHost === true}`
      ].join("; "),
      "Security and privacy; user-work protection; reliability"
    ],
    [
      "Firewall and lockout safety",
      Object.entries(firewallAndLockoutSafety).map(([key, value]) => `${key}=${value}`).join("; "),
      "Security and privacy; cloud automation; operational reliability"
    ],
    [
      "Idempotency and failure handling",
      Object.entries(idempotencyAndFailureHandling).map(([key, value]) => `${key}=${value}`).join("; "),
      "Maintainability; rollback readiness; testability"
    ]
  ].map(tableRow).join("\n");

  return `# SEIS Master Objective Coverage Report

This report is generated from \`${coveragePath}\`.

It maps the active SEIS Master Prompt objective to concrete repository evidence,
focused checks, coverage status, and remaining gaps. It does not claim
completion; it makes incompleteness reviewable.
It also summarizes \`${sshHardeningOperationContractPath}\` because SSH and
firewall changes are lockout-sensitive security operations.

## Status

| Field | Value |
| --- | --- |
${statusRows}

## Coverage Matrix

| ID | Status | Requirement | Evidence | Checks | Gap |
| --- | --- | --- | --- | --- | --- |
${coverageRows}

## SSH Hardening Operation Coverage

| Area | Contract evidence | Covered objective areas |
| --- | --- | --- |
${sshOperationRows}

## Required Validation Path

\`\`\`bash
${requiredCommands.join("\n")}
\`\`\`

## Completion Rule

${coverage.completionRule}

## Current Limitation

The coverage items are mapped, not validated, until the required checks are run
or explicitly waived by the maintainer.
`;
}

const next = renderReport();
const checkMode = process.argv.includes("--check");

if (checkMode) {
  const current = read(reportPath);
  if (current !== next) {
    console.error(`${reportPath} is stale. Run npm run automation:seis-master-objective-coverage-report.`);
    process.exit(1);
  }
  console.log("SEIS master objective coverage report is current.");
} else {
  writeFileSync(resolve(root, reportPath), next);
  console.log(`Wrote ${reportPath}`);
}
