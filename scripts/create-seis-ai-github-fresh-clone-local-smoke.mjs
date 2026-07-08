#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const files = {
  smoke: "content/development/seis-ai-github-fresh-clone-local-smoke.json",
  docs: "docs/ai/seis-ai-github-fresh-clone-local-smoke.md",
  reportJson: "reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.json",
  reportMd: "reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.md",
  packageJson: "package.json",
  ciWorkflow: ".github/workflows/seis-ai.yml",
  readinessChain: "scripts/check-seis-ai-github-readiness-chain.mjs",
  freshClonePlan: "content/development/seis-agi-github-fresh-clone-readiness-plan.json",
  prPackage: "content/development/seis-ai-github-pr-package.json",
  stagingDryRun: "content/development/seis-ai-pr-staging-dry-run.json"
};

const existing = mode === "check" ? readOptionalJson(files.smoke) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const packageJson = readJson(files.packageJson, "package.json");
const freshClonePlan = readJson(files.freshClonePlan, "fresh-clone readiness plan");
const prPackage = readJson(files.prPackage, "AI + Plugin/MCP PR package");
const stagingDryRun = readJson(files.stagingDryRun, "AI + Plugin/MCP staging dry-run");
const ciWorkflow = readText(files.ciWorkflow);
const readinessChain = readText(files.readinessChain);

if (!packageJson || !freshClonePlan || !prPackage || !stagingDryRun) finish();

const smoke = buildSmoke();
const report = buildReport(smoke);
const docs = renderDocs(smoke, report);
const reportMd = renderReport(report);

if (mode === "write") {
  writeJson(files.smoke, smoke);
  writeJson(files.reportJson, report);
  writeText(files.docs, docs);
  writeText(files.reportMd, reportMd);
  console.log("SEIS AI GitHub fresh-clone local smoke generated.");
  console.log(JSON.stringify({
    smoke: files.smoke,
    docs: files.docs,
    report: files.reportJson,
    markdownReport: files.reportMd
  }, null, 2));
} else {
  checkJson(files.smoke, smoke, "SEIS AI GitHub fresh-clone local smoke");
  checkJson(files.reportJson, report, "SEIS AI GitHub fresh-clone local smoke report");
  checkText(files.docs, docs, "SEIS AI GitHub fresh-clone local smoke docs");
  checkText(files.reportMd, reportMd, "SEIS AI GitHub fresh-clone local smoke markdown report");
  validate(smoke, report);
  finish("SEIS AI GitHub fresh-clone local smoke check passed.");
}

function buildSmoke() {
  const requiredCommands = [
    "npm run check:seis-plugin-mcp-ten-year-continuity-map",
    "npm run check:seis-ai-model-ecosystem-catalog",
    "npm run check:seis-public-ai-readiness",
    "npm run check:seis-ai-github-pr-package",
    "npm run check:seis-ai-pr-staging-dry-run",
    "npm run check:seis-ai-github-readiness-chain"
  ];
  const requiredFiles = [
    files.packageJson,
    files.ciWorkflow,
    files.readinessChain,
    files.freshClonePlan,
    files.prPackage,
    files.stagingDryRun,
    "scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs",
    "scripts/create-seis-ai-model-ecosystem-catalog.mjs",
    "content/development/seis-ai-model-ecosystem-catalog.json",
    "docs/ai/seis-ai-model-ecosystem-catalog.md",
    "reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.json",
    "reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.md",
    "scripts/create-seis-ai-github-pr-package.mjs",
    "scripts/create-seis-ai-pr-staging-dry-run.mjs"
  ];
  const missingFiles = requiredFiles.filter((file) => !existsSync(path.join(root, file)));

  return {
    id: "seis-ai-github-fresh-clone-local-smoke",
    version: "2026.07.08",
    generatedAt,
    status: missingFiles.length === 0 ? "local-smoke-defined-external-clean-clone-missing" : "local-smoke-incomplete",
    qualityGate: "npm run check:seis-ai-github-fresh-clone-local-smoke",
    reportCommand: "npm run report:seis-ai-github-fresh-clone-local-smoke",
    purpose: "Record the no-key local smoke gate that must pass before SEIS can collect real external fresh-clone evidence for AI + Plugin/MCP readiness.",
    sourceOfTruth: {
      packageJson: files.packageJson,
      ciWorkflow: files.ciWorkflow,
      readinessChain: files.readinessChain,
      modelEcosystemCatalog: "content/development/seis-ai-model-ecosystem-catalog.json",
      freshClonePlan: files.freshClonePlan,
      aiGithubPrPackage: files.prPackage,
      aiPrStagingDryRun: files.stagingDryRun,
      docs: files.docs
    },
    currentEvidence: {
      localRepositorySmokeDefined: true,
      localRepositorySmokeCheckMode: true,
      externalCleanCloneExecuted: false,
      remoteGitHubActionsExecuted: false,
      providerCallsExecuted: false,
      modelDownloadsExecuted: false,
      trainingExecuted: false,
      sshExecuted: false,
      gitPushExecuted: false,
      gitMergeExecuted: false
    },
    requiredCommands,
    requiredFiles,
    missingFiles,
    forbiddenActionsWithoutApproval: [
      "git clone remote release proof",
      "git push",
      "git merge",
      "provider API call",
      "model download",
      "training",
      "SSH execution",
      "deployment"
    ],
    publicClaimBoundary: {
      canClaimLocalSmokeGateExists: true,
      canClaimLocalSmokeGatePassed: missingFiles.length === 0,
      canClaimExternalFreshCloneVerified: false,
      canClaimRemoteCiPassed: false,
      canClaimGithubReadyForEveryone: false,
      canClaimRealAgi: false
    },
    nextEvidenceNeeded: [
      "Run the no-key command set in a clean external clone after a human-approved branch exists.",
      "Attach OS, Node, npm, commit SHA, and command output logs from the clean checkout.",
      "Run the same readiness set in GitHub Actions before changing fresh-clone verification claims.",
      "Keep provider, model, SSH, deployment, push, and merge actions approval-gated."
    ]
  };
}

function buildReport(smoke) {
  return {
    id: "seis-ai-github-fresh-clone-local-smoke-report",
    generatedAt: smoke.generatedAt,
    status: smoke.status,
    sourceSmoke: files.smoke,
    summary: {
      requiredCommands: smoke.requiredCommands.length,
      requiredFiles: smoke.requiredFiles.length,
      missingFiles: smoke.missingFiles,
      externalCleanCloneExecuted: smoke.currentEvidence.externalCleanCloneExecuted,
      remoteGitHubActionsExecuted: smoke.currentEvidence.remoteGitHubActionsExecuted,
      githubReadyForEveryone: smoke.publicClaimBoundary.canClaimGithubReadyForEveryone,
      realAgiClaimAllowed: smoke.publicClaimBoundary.canClaimRealAgi
    },
    requiredCommands: smoke.requiredCommands,
    nextEvidenceNeeded: smoke.nextEvidenceNeeded
  };
}

function validate(smoke, report) {
  const scripts = packageJson.scripts || {};
  ensure(smoke.id === "seis-ai-github-fresh-clone-local-smoke", "smoke id mismatch");
  ensure(smoke.status === "local-smoke-defined-external-clean-clone-missing", "smoke status mismatch");
  ensure(smoke.qualityGate === "npm run check:seis-ai-github-fresh-clone-local-smoke", "smoke quality gate mismatch");
  ensure(smoke.reportCommand === "npm run report:seis-ai-github-fresh-clone-local-smoke", "smoke report command mismatch");
  ensure(smoke.missingFiles.length === 0, "fresh-clone local smoke required files must exist");
  ensure(smoke.currentEvidence.externalCleanCloneExecuted === false, "local smoke must not claim external fresh clone execution");
  ensure(smoke.currentEvidence.remoteGitHubActionsExecuted === false, "local smoke must not claim remote GitHub Actions execution");
  ensure(smoke.currentEvidence.providerCallsExecuted === false, "local smoke must not claim provider calls");
  ensure(smoke.currentEvidence.modelDownloadsExecuted === false, "local smoke must not claim model downloads");
  ensure(smoke.currentEvidence.trainingExecuted === false, "local smoke must not claim training");
  ensure(smoke.currentEvidence.sshExecuted === false, "local smoke must not claim SSH execution");
  ensure(smoke.publicClaimBoundary.canClaimExternalFreshCloneVerified === false, "must not claim external fresh clone verification");
  ensure(smoke.publicClaimBoundary.canClaimRemoteCiPassed === false, "must not claim remote CI passed");
  ensure(smoke.publicClaimBoundary.canClaimGithubReadyForEveryone === false, "must not claim GitHub ready for everyone");
  ensure(smoke.publicClaimBoundary.canClaimRealAgi === false, "must not claim real AGI");
  ensureArrayIncludesAll(smoke.requiredCommands, [
    "npm run check:seis-plugin-mcp-ten-year-continuity-map",
    "npm run check:seis-ai-model-ecosystem-catalog",
    "npm run check:seis-public-ai-readiness",
    "npm run check:seis-ai-github-pr-package",
    "npm run check:seis-ai-pr-staging-dry-run",
    "npm run check:seis-ai-github-readiness-chain"
  ], "requiredCommands");
  ensure(scripts["check:seis-ai-github-fresh-clone-local-smoke"] === "node scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs", "package.json must expose fresh-clone local smoke check");
  ensure(scripts["report:seis-ai-github-fresh-clone-local-smoke"] === "node scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs --write", "package.json must expose fresh-clone local smoke report");
  ensure(scripts["check:seis-ai-model-ecosystem-catalog"] === "node scripts/create-seis-ai-model-ecosystem-catalog.mjs", "package.json must expose model ecosystem catalog check");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-ai-github-fresh-clone-local-smoke"), "quality:governance must include fresh-clone local smoke check");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-ai-model-ecosystem-catalog"), "quality:governance must include model ecosystem catalog check");
  ensure(ciWorkflow.includes("check:seis-ai-github-fresh-clone-local-smoke"), "CI workflow must include fresh-clone local smoke check");
  ensure(ciWorkflow.includes("check:seis-ai-model-ecosystem-catalog"), "CI workflow must include model ecosystem catalog check");
  ensure(readinessChain.includes("check:seis-ai-github-fresh-clone-local-smoke"), "readiness chain must include fresh-clone local smoke check");
  ensure(readinessChain.includes("check:seis-ai-model-ecosystem-catalog"), "readiness chain must include model ecosystem catalog check");
  ensure(freshClonePlan.sourceOfTruth?.freshCloneLocalSmoke === files.smoke, "fresh-clone plan must link local smoke source");
  ensure(freshClonePlan.sourceOfTruth?.modelEcosystemCatalog === "content/development/seis-ai-model-ecosystem-catalog.json", "fresh-clone plan must link model ecosystem catalog");
  ensure(freshClonePlan.commandPlan?.includes("npm run check:seis-ai-github-fresh-clone-local-smoke"), "fresh-clone plan command plan must include local smoke check");
  ensure(freshClonePlan.commandPlan?.includes("npm run check:seis-ai-model-ecosystem-catalog"), "fresh-clone plan command plan must include model ecosystem catalog check");
  ensure(prPackage.sourceOfTruth?.freshCloneLocalSmoke === files.smoke, "PR package must link fresh-clone local smoke source");
  ensure(prPackage.sourceOfTruth?.modelEcosystemCatalog === "content/development/seis-ai-model-ecosystem-catalog.json", "PR package must link model ecosystem catalog source");
  ensure(prPackage.requiredValidation?.includes("npm run check:seis-ai-model-ecosystem-catalog"), "PR package must require model ecosystem catalog validation");
  ensure(prPackage.requiredValidation?.includes("npm run check:seis-ai-github-fresh-clone-local-smoke"), "PR package must require local smoke validation");
  ensure(stagingDryRun.selectedAiFiles?.includes(files.smoke), "staging dry-run must include local smoke source");
  ensure(stagingDryRun.selectedAiFiles?.includes("content/development/seis-ai-model-ecosystem-catalog.json"), "staging dry-run must include model ecosystem catalog source");
  ensure(report.status === smoke.status, "report status mismatch");
  ensure(report.summary.externalCleanCloneExecuted === false, "report must not claim external fresh clone execution");
  ensure(report.summary.remoteGitHubActionsExecuted === false, "report must not claim remote CI passed");
}

function renderDocs(smoke, report) {
  return `# SEIS AI GitHub Fresh-Clone Local Smoke

This local smoke gate proves the no-key AI plus Plugin/MCP readiness command set
is wired in the repository. It does not prove an external clean clone, remote
GitHub Actions run, provider call, model download, training run, SSH session,
deployment, push, merge, or release.

Status: ${smoke.status}

## Current Evidence

| Field | Value |
| --- | --- |
| Local repository smoke defined | ${String(smoke.currentEvidence.localRepositorySmokeDefined)} |
| External clean clone executed | ${String(smoke.currentEvidence.externalCleanCloneExecuted)} |
| Remote GitHub Actions executed | ${String(smoke.currentEvidence.remoteGitHubActionsExecuted)} |
| Provider calls executed | ${String(smoke.currentEvidence.providerCallsExecuted)} |
| Model downloads executed | ${String(smoke.currentEvidence.modelDownloadsExecuted)} |
| Training executed | ${String(smoke.currentEvidence.trainingExecuted)} |
| GitHub ready for everyone | ${String(smoke.publicClaimBoundary.canClaimGithubReadyForEveryone)} |
| Real AGI claim allowed | ${String(smoke.publicClaimBoundary.canClaimRealAgi)} |

## Required Commands

\`\`\`bash
${smoke.requiredCommands.join("\n")}
\`\`\`

## Next Evidence Needed

${smoke.nextEvidenceNeeded.map((item) => `- ${item}`).join("\n")}
`;
}

function renderReport(report) {
  return `# SEIS AI GitHub Fresh-Clone Local Smoke Report

Generated: ${report.generatedAt}

Status: ${report.status}

| Field | Value |
| --- | --- |
| Required commands | ${report.summary.requiredCommands} |
| Required files | ${report.summary.requiredFiles} |
| Missing files | ${report.summary.missingFiles.length} |
| External clean clone executed | ${String(report.summary.externalCleanCloneExecuted)} |
| Remote GitHub Actions executed | ${String(report.summary.remoteGitHubActionsExecuted)} |
| GitHub ready for everyone | ${String(report.summary.githubReadyForEveryone)} |
| Real AGI claim allowed | ${String(report.summary.realAgiClaimAllowed)} |

## Required Commands

${report.requiredCommands.map((item) => `- ${item}`).join("\n")}

## Next Evidence Needed

${report.nextEvidenceNeeded.map((item) => `- ${item}`).join("\n")}
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

function readText(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8");
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
  if (JSON.stringify(actual, null, 2) !== JSON.stringify(expected, null, 2)) failures.push(`${label} is stale. Run npm run report:seis-ai-github-fresh-clone-local-smoke.`);
}

function checkText(relativePath, expected, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(filePath, "utf8");
  if (actual !== expected) failures.push(`${label} is stale. Run npm run report:seis-ai-github-fresh-clone-local-smoke.`);
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
    console.error("SEIS AI GitHub fresh-clone local smoke check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  if (successMessage) console.log(successMessage);
}
