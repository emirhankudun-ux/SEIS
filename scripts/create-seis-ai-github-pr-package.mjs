#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const files = {
  package: "content/development/seis-ai-github-pr-package.json",
  docs: "docs/ai/seis-ai-github-pr-package.md",
  reportMd: "reports/seis-model-scaling/seis-ai-github-pr-package.md",
  reportJson: "reports/seis-model-scaling/seis-ai-github-pr-package.json",
  gitignore: ".gitignore",
  packageJson: "package.json",
  aiWorkforceDoc: "docs/ai/ai-workforce-training.md",
  githubReadinessDoc: "docs/ai/seis-agi-github-user-readiness-gates.md",
  languageModelIntakeCheck: "scripts/check-seis-language-model-intake.mjs",
  modelEcosystemCatalog: "content/development/seis-ai-model-ecosystem-catalog.json",
  modelEcosystemCatalogDocs: "docs/ai/seis-ai-model-ecosystem-catalog.md",
  modelEcosystemCatalogReportJson: "reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.json",
  modelEcosystemCatalogReportMd: "reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.md",
  modelEcosystemCatalogScript: "scripts/create-seis-ai-model-ecosystem-catalog.mjs",
  freshClonePlan: "content/development/seis-agi-github-fresh-clone-readiness-plan.json",
  freshCloneLocalSmoke: "content/development/seis-ai-github-fresh-clone-local-smoke.json",
  freshCloneLocalSmokeDocs: "docs/ai/seis-ai-github-fresh-clone-local-smoke.md",
  freshCloneLocalSmokeReportJson: "reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.json",
  freshCloneLocalSmokeReportMd: "reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.md",
  freshCloneLocalSmokeScript: "scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs",
  publicReadiness: "content/development/seis-agi-public-readiness-evidence.json",
  pluginMcpContinuityMap: "content/development/seis-plugin-mcp-ten-year-continuity-map.json",
  pluginMcpContinuityReportJson: "reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.json",
  pluginMcpContinuityDoc: "docs/platform/seis-plugin-mcp-ten-year-continuity-map.md",
  readinessChain: "scripts/check-seis-ai-github-readiness-chain.mjs",
  pluginMcpContinuityScript: "scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs",
  publicReadinessCheck: "scripts/check-seis-public-ai-readiness.mjs",
  stagingDryRun: "content/development/seis-ai-pr-staging-dry-run.json",
  stagingDryRunDocs: "docs/ai/seis-ai-pr-staging-dry-run.md",
  stagingDryRunReport: "reports/seis-model-scaling/seis-ai-pr-staging-dry-run.md",
  stagingDryRunScript: "scripts/create-seis-ai-pr-staging-dry-run.mjs",
  ciWorkflow: ".github/workflows/seis-ai.yml"
};

const generatedOutputs = new Set([
  files.package,
  files.docs,
  files.reportMd,
  files.reportJson,
  files.modelEcosystemCatalog,
  files.modelEcosystemCatalogDocs,
  files.modelEcosystemCatalogReportJson,
  files.modelEcosystemCatalogReportMd,
  files.freshCloneLocalSmoke,
  files.freshCloneLocalSmokeDocs,
  files.freshCloneLocalSmokeReportJson,
  files.freshCloneLocalSmokeReportMd,
  files.stagingDryRun,
  files.stagingDryRunDocs,
  files.stagingDryRunReport
]);

const existing = mode === "check" ? readOptionalJson(files.package) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const packageJson = readJson(files.packageJson, "package.json");
const freshClonePlan = readJson(files.freshClonePlan, "fresh-clone readiness plan");
const publicReadiness = readJson(files.publicReadiness, "AGI public readiness evidence");
const modelEcosystemCatalog = readJson(files.modelEcosystemCatalog, "AI model ecosystem catalog");
const pluginMcpContinuityMap = readJson(files.pluginMcpContinuityMap, "Plugin/MCP ten-year continuity map");
const pluginMcpContinuityReport = readJson(files.pluginMcpContinuityReportJson, "Plugin/MCP ten-year continuity report");
const aiWorkforceDoc = readText(files.aiWorkforceDoc);
const githubReadinessDoc = readText(files.githubReadinessDoc);
const ciWorkflow = readText(files.ciWorkflow);

if (!packageJson || !freshClonePlan || !publicReadiness || !modelEcosystemCatalog || !pluginMcpContinuityMap || !pluginMcpContinuityReport) finish();

const prPackage = buildPackage();
const report = buildReport(prPackage);
const docs = renderDocs(prPackage, report);
const reportMd = renderReport(report);

if (mode === "write") {
  writeJson(files.package, prPackage);
  writeJson(files.reportJson, report);
  writeText(files.docs, docs);
  writeText(files.reportMd, reportMd);
  console.log("SEIS AI GitHub PR package generated.");
  console.log(JSON.stringify({
    package: files.package,
    report: files.reportJson,
    docs: files.docs,
    markdownReport: files.reportMd
  }, null, 2));
} else {
  checkJson(files.package, prPackage, "SEIS AI GitHub PR package");
  checkJson(files.reportJson, report, "SEIS AI GitHub PR package report");
  checkText(files.docs, docs, "SEIS AI GitHub PR package docs");
  checkText(files.reportMd, reportMd, "SEIS AI GitHub PR package markdown report");
  validate(prPackage, report);
  finish("SEIS AI GitHub PR package check passed.");
}

function buildPackage() {
  return {
    id: "seis-ai-github-pr-package",
    version: "2026.07.08",
    generatedAt,
    status: "ready-for-ai-plugin-mcp-pr-review-not-ready-for-push",
    qualityGate: "npm run check:seis-ai-github-pr-package",
    reportCommand: "npm run report:seis-ai-github-pr-package",
    purpose: "Define the AI plus Plugin/MCP readiness PR package needed to move SEIS toward GitHub-ready local-demo review without mixing unrelated dirty worktree changes.",
    sourceOfTruth: {
      modelEcosystemCatalog: files.modelEcosystemCatalog,
      freshCloneReadinessPlan: files.freshClonePlan,
      freshCloneLocalSmoke: files.freshCloneLocalSmoke,
      gitignore: files.gitignore,
      publicReadinessEvidence: files.publicReadiness,
      pluginMcpContinuityMap: files.pluginMcpContinuityMap,
      pluginMcpContinuityReportJson: files.pluginMcpContinuityReportJson,
      pluginMcpContinuityDoc: files.pluginMcpContinuityDoc,
      stagingDryRun: files.stagingDryRun,
      languageModelIntakeCheck: files.languageModelIntakeCheck,
      aiReadinessChain: files.readinessChain,
      modelEcosystemCatalogScript: files.modelEcosystemCatalogScript,
      pluginMcpContinuityScript: files.pluginMcpContinuityScript,
      publicReadinessCheck: files.publicReadinessCheck,
      freshCloneLocalSmokeScript: files.freshCloneLocalSmokeScript,
      ciWorkflow: files.ciWorkflow,
      docs: files.docs
    },
    currentDecision: {
      localAiReadinessChainPassingRequired: true,
      packageReadyForReview: true,
      safeToPushNow: false,
      safeToMergeNow: false,
      reasonPushBlocked: "The worktree contains unrelated modified and untracked files. Stage only the selected AI files in a clean review branch before push."
    },
    selectedAiFiles: uniqueFileRows([
      fileRow("package.json", "script wiring for AI readiness checks"),
      fileRow(".gitignore", "tracked report JSON allowlist for AI readiness evidence"),
      fileRow("scripts/check-seis-language-model-intake.mjs", "language model intake guardrail linked to the model ecosystem catalog"),
      fileRow("scripts/create-seis-local-ai-runtime-matrix.mjs", "local AI runtime matrix generator"),
      fileRow("content/development/seis-local-ai-runtime-matrix.json", "local runtime matrix source record"),
      fileRow("docs/ai/seis-local-ai-runtime-matrix.md", "local runtime matrix docs"),
      fileRow("reports/seis-model-scaling/seis-local-ai-runtime-matrix.md", "local runtime matrix markdown report"),
      fileRow("scripts/create-seis-ai-model-ecosystem-catalog.mjs", "AI model ecosystem catalog generator and validator"),
      fileRow("content/development/seis-ai-model-ecosystem-catalog.json", "AI model ecosystem metadata catalog"),
      fileRow("docs/ai/seis-ai-model-ecosystem-catalog.md", "AI model ecosystem catalog docs"),
      fileRow("reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.json", "AI model ecosystem catalog JSON report"),
      fileRow("reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.md", "AI model ecosystem catalog markdown report"),
      fileRow("scripts/check-seis-public-ai-readiness.mjs", "public AI claim and source-of-truth guardrail"),
      fileRow("scripts/check-seis-ai-github-readiness-chain.mjs", "one-command local AI GitHub readiness chain"),
      fileRow("scripts/create-seis-agi-github-fresh-clone-readiness-plan.mjs", "fresh-clone readiness plan generator"),
      fileRow("content/development/seis-agi-github-fresh-clone-readiness-plan.json", "fresh-clone readiness plan source record"),
      fileRow("docs/ai/seis-agi-github-fresh-clone-readiness-plan.md", "fresh-clone readiness docs"),
      fileRow("reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.json", "fresh-clone readiness JSON report"),
      fileRow("reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.md", "fresh-clone readiness markdown report"),
      fileRow("scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs", "fresh-clone local smoke generator and validator"),
      fileRow("content/development/seis-ai-github-fresh-clone-local-smoke.json", "fresh-clone local smoke source record"),
      fileRow("docs/ai/seis-ai-github-fresh-clone-local-smoke.md", "fresh-clone local smoke docs"),
      fileRow("reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.json", "fresh-clone local smoke JSON report"),
      fileRow("reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.md", "fresh-clone local smoke markdown report"),
      fileRow("scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs", "Plugin/MCP ten-year continuity map generator"),
      fileRow("content/development/seis-plugin-mcp-ten-year-continuity-map.json", "Plugin/MCP continuity source contract"),
      fileRow("docs/platform/seis-plugin-mcp-ten-year-continuity-map.md", "Plugin/MCP continuity platform docs"),
      fileRow("reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.json", "Plugin/MCP continuity JSON report"),
      fileRow("reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.md", "Plugin/MCP continuity markdown report"),
      fileRow("docs/ai/ai-workforce-training.md", "AI workforce docs with no-key readiness commands"),
      fileRow("docs/ai/seis-agi-github-user-readiness-gates.md", "GitHub user readiness docs with blocker commands"),
      fileRow(".github/workflows/seis-ai.yml", "no-key AI plus Plugin/MCP GitHub Actions readiness workflow"),
      fileRow("content/development/seis-ai-github-pr-package.json", "this AI plus Plugin/MCP PR package contract"),
      fileRow("docs/ai/seis-ai-github-pr-package.md", "human-readable AI plus Plugin/MCP PR package docs"),
      fileRow("reports/seis-model-scaling/seis-ai-github-pr-package.json", "AI plus Plugin/MCP PR package JSON report"),
      fileRow("reports/seis-model-scaling/seis-ai-github-pr-package.md", "AI plus Plugin/MCP PR package markdown report"),
      fileRow("scripts/create-seis-ai-github-pr-package.mjs", "AI plus Plugin/MCP PR package generator and validator"),
      fileRow("scripts/create-seis-ai-pr-staging-dry-run.mjs", "AI plus Plugin/MCP staging dry-run generator and validator"),
      fileRow("content/development/seis-ai-pr-staging-dry-run.json", "AI plus Plugin/MCP staging dry-run source record"),
      fileRow("docs/ai/seis-ai-pr-staging-dry-run.md", "AI plus Plugin/MCP staging dry-run docs"),
      fileRow("reports/seis-model-scaling/seis-ai-pr-staging-dry-run.json", "AI plus Plugin/MCP staging dry-run JSON report"),
      fileRow("reports/seis-model-scaling/seis-ai-pr-staging-dry-run.md", "AI plus Plugin/MCP staging dry-run markdown report")
    ]),
    excludedDirtyPatterns: [
      "apps/web/*",
      "docs/product/*",
      "docs/reviews/*",
      "reports/seis-public-demo/* except plugin-mcp-ten-year-continuity-map-latest.md/json",
      "scripts/check-desktop-os*.mjs",
      "scripts/check-seis-linux-replica-browser-smoke.mjs"
    ],
    requiredValidation: [
      "npm run report:seis-ai-github-pr-package",
      "npm run check:seis-ai-github-pr-package",
      "npm run report:seis-ai-model-ecosystem-catalog",
      "npm run check:seis-ai-model-ecosystem-catalog",
      "npm run report:seis-ai-pr-staging-dry-run",
      "npm run check:seis-ai-pr-staging-dry-run",
      "npm run check:seis-ai-github-fresh-clone-local-smoke",
      "npm run check:seis-ai-github-readiness-chain",
      "npm run check:seis-plugin-mcp-ten-year-continuity-map",
      "npm run check:seis-public-ai-readiness",
      "npm run check:seis-agi-github-fresh-clone-readiness-plan"
    ],
    officialGitHubBaseline: [
      {
        id: "github-protected-branches",
        url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches",
        implication: "Pushes to protected branches should be gated by pull request review and successful required checks."
      },
      {
        id: "github-actions-secure-use",
        url: "https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions",
        implication: "Workflow and readiness checks must use least-privilege tokens and avoid plaintext secrets in logs."
      },
      {
        id: "openssf-scorecard",
        url: "https://github.com/ossf/scorecard",
        implication: "Security posture should be measurable, but Scorecard-style metrics are not AGI, training, or benchmark evidence."
      }
    ],
    forbiddenActionsWithoutApproval: [
      "git push",
      "git merge",
      "force push",
      "branch deletion",
      "model download",
      "Ollama pull",
      "dataset download",
      "training",
      "fine-tuning",
      "inference benchmark",
      "cloud/GPU provisioning",
      "provider API call",
      "SSH execution",
      "deployment",
      "release publication"
    ],
    publicClaimBoundary: {
      canClaimAiPrPackageExists: true,
      canClaimReadinessChainExists: true,
      canClaimSafeToPushNow: false,
      canClaimGithubReadyForEveryone: false,
      canClaimModelInstalled: false,
      canClaimTrainingExecuted: false,
      canClaim512bRouteEligible: false,
      canClaimRealAgi: false
    },
    nextHumanReviewedSteps: [
      "Move the selected AI files into a clean review branch or clean worktree.",
      "Run npm run check:seis-ai-github-readiness-chain.",
      "Confirm Plugin/MCP continuity artifacts match npm run check:seis-plugin-mcp-ten-year-continuity-map.",
      "Confirm no selected file contains secrets or model artifacts.",
      "Open a PR with protected-branch checks and human review.",
      "Keep unrelated Desktop, product-demo, platform, and public-demo files out of the AI plus Plugin/MCP readiness PR."
    ]
  };
}

function fileRow(pathName, purpose) {
  return {
    path: pathName,
    purpose,
    exists: existsSync(path.join(root, pathName)) || generatedOutputs.has(pathName)
  };
}

function uniqueFileRows(rows) {
  const byPath = new Map();
  for (const row of rows) byPath.set(row.path, row);
  return [...byPath.values()];
}

function buildReport(prPackage) {
  const missingSelectedFiles = prPackage.selectedAiFiles.filter((item) => !item.exists).map((item) => item.path);
  return {
    id: "seis-ai-github-pr-package-report",
    generatedAt: prPackage.generatedAt,
    status: missingSelectedFiles.length === 0 ? "ai-plugin-mcp-package-defined-push-blocked" : "package-incomplete",
    sourcePackage: files.package,
    summary: {
      selectedAiFiles: prPackage.selectedAiFiles.length,
      missingSelectedFiles,
      requiredValidation: prPackage.requiredValidation.length,
      safeToPushNow: prPackage.currentDecision.safeToPushNow,
      safeToMergeNow: prPackage.currentDecision.safeToMergeNow,
      githubReadyForEveryone: false,
      realAgiClaimAllowed: false
    },
    selectedAiFiles: prPackage.selectedAiFiles.map((item) => item.path),
    excludedDirtyPatterns: prPackage.excludedDirtyPatterns,
    requiredValidation: prPackage.requiredValidation,
    nextHumanReviewedSteps: prPackage.nextHumanReviewedSteps
  };
}

function validate(prPackage, report) {
  ensure(prPackage.id === "seis-ai-github-pr-package", "package id mismatch");
  ensure(prPackage.status === "ready-for-ai-plugin-mcp-pr-review-not-ready-for-push", "package status mismatch");
  ensure(prPackage.qualityGate === "npm run check:seis-ai-github-pr-package", "quality gate mismatch");
  ensure(prPackage.reportCommand === "npm run report:seis-ai-github-pr-package", "report command mismatch");
  ensure(prPackage.currentDecision.packageReadyForReview === true, "package should be ready for review");
  ensure(prPackage.currentDecision.safeToPushNow === false, "package must keep safeToPushNow false");
  ensure(prPackage.currentDecision.safeToMergeNow === false, "package must keep safeToMergeNow false");
  ensureArrayIncludesAll(prPackage.selectedAiFiles.map((item) => item.path), [
    "package.json",
    ".gitignore",
    "scripts/check-seis-language-model-intake.mjs",
    "scripts/check-seis-ai-github-readiness-chain.mjs",
    "scripts/check-seis-public-ai-readiness.mjs",
    "scripts/create-seis-ai-model-ecosystem-catalog.mjs",
    "content/development/seis-ai-model-ecosystem-catalog.json",
    "docs/ai/seis-ai-model-ecosystem-catalog.md",
    "reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.json",
    "reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.md",
    "scripts/create-seis-agi-github-fresh-clone-readiness-plan.mjs",
    "content/development/seis-agi-github-fresh-clone-readiness-plan.json",
    "docs/ai/seis-agi-github-fresh-clone-readiness-plan.md",
    "reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.json",
    "scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs",
    "content/development/seis-ai-github-fresh-clone-local-smoke.json",
    "docs/ai/seis-ai-github-fresh-clone-local-smoke.md",
    "reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.json",
    "reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.md",
    "scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs",
    "content/development/seis-plugin-mcp-ten-year-continuity-map.json",
    "docs/platform/seis-plugin-mcp-ten-year-continuity-map.md",
    "reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.json",
    "reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.md",
    ".github/workflows/seis-ai.yml",
    "docs/ai/ai-workforce-training.md",
    "docs/ai/seis-agi-github-user-readiness-gates.md",
    "content/development/seis-ai-github-pr-package.json",
    "docs/ai/seis-ai-github-pr-package.md",
    "reports/seis-model-scaling/seis-ai-github-pr-package.md",
    "scripts/create-seis-ai-github-pr-package.mjs",
    "scripts/create-seis-ai-pr-staging-dry-run.mjs",
    "content/development/seis-ai-pr-staging-dry-run.json",
    "docs/ai/seis-ai-pr-staging-dry-run.md",
    "reports/seis-model-scaling/seis-ai-github-pr-package.json",
    "reports/seis-model-scaling/seis-ai-pr-staging-dry-run.json",
    "reports/seis-model-scaling/seis-ai-pr-staging-dry-run.md"
  ], "selectedAiFiles");
  ensure(prPackage.selectedAiFiles.every((item) => item.exists === true), "all selected AI files must exist");
  ensureArrayIncludesAll(prPackage.requiredValidation, [
    "npm run check:seis-ai-github-pr-package",
    "npm run report:seis-ai-model-ecosystem-catalog",
    "npm run check:seis-ai-pr-staging-dry-run",
    "npm run check:seis-ai-model-ecosystem-catalog",
    "npm run check:seis-ai-github-fresh-clone-local-smoke",
    "npm run check:seis-ai-github-readiness-chain",
    "npm run check:seis-plugin-mcp-ten-year-continuity-map",
    "npm run check:seis-public-ai-readiness"
  ], "requiredValidation");
  ensureArrayIncludesAll(prPackage.officialGitHubBaseline.map((item) => item.id), [
    "github-protected-branches",
    "github-actions-secure-use",
    "openssf-scorecard"
  ], "officialGitHubBaseline");
  ensureArrayIncludesAll(prPackage.forbiddenActionsWithoutApproval, [
    "git push",
    "git merge",
    "model download",
    "training",
    "provider API call",
    "SSH execution",
    "deployment"
  ], "forbiddenActionsWithoutApproval");
  ensure(prPackage.publicClaimBoundary.canClaimSafeToPushNow === false, "safe-to-push claim must stay false");
  ensure(prPackage.publicClaimBoundary.canClaimGithubReadyForEveryone === false, "GitHub everyone-ready claim must stay false");
  ensure(prPackage.publicClaimBoundary.canClaimModelInstalled === false, "model-installed claim must stay false");
  ensure(prPackage.publicClaimBoundary.canClaimTrainingExecuted === false, "training-executed claim must stay false");
  ensure(prPackage.publicClaimBoundary.canClaim512bRouteEligible === false, "512B route claim must stay false");
  ensure(prPackage.publicClaimBoundary.canClaimRealAgi === false, "real AGI claim must stay false");
  ensure(report.status === "ai-plugin-mcp-package-defined-push-blocked", "report status mismatch");
  ensure(report.summary.safeToPushNow === false, "report must keep safeToPushNow false");
  ensure(report.summary.realAgiClaimAllowed === false, "report must keep real AGI claim false");
  ensure(packageJson.scripts?.["check:seis-ai-github-pr-package"] === "node scripts/create-seis-ai-github-pr-package.mjs", "package.json must expose AI GitHub PR package check");
  ensure(packageJson.scripts?.["report:seis-ai-github-pr-package"] === "node scripts/create-seis-ai-github-pr-package.mjs --write", "package.json must expose AI GitHub PR package report");
  ensure(packageJson.scripts?.["check:seis-ai-model-ecosystem-catalog"] === "node scripts/create-seis-ai-model-ecosystem-catalog.mjs", "package.json must expose model ecosystem catalog check");
  ensure(packageJson.scripts?.["report:seis-ai-model-ecosystem-catalog"] === "node scripts/create-seis-ai-model-ecosystem-catalog.mjs --write", "package.json must expose model ecosystem catalog report");
  ensure(packageJson.scripts?.["check:seis-ai-pr-staging-dry-run"] === "node scripts/create-seis-ai-pr-staging-dry-run.mjs", "package.json must expose AI PR staging dry-run check");
  ensure(packageJson.scripts?.["check:seis-ai-github-fresh-clone-local-smoke"] === "node scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs", "package.json must expose fresh-clone local smoke check");
  ensure(packageJson.scripts?.["report:seis-ai-pr-staging-dry-run"] === "node scripts/create-seis-ai-pr-staging-dry-run.mjs --write", "package.json must expose AI PR staging dry-run report");
  ensure(packageJson.scripts?.["check:seis-plugin-mcp-ten-year-continuity-map"] === "node scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs --check", "package.json must expose Plugin/MCP continuity check");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-github-pr-package"), "quality:governance must include AI GitHub PR package check");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-model-ecosystem-catalog"), "quality:governance must include model ecosystem catalog check");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-pr-staging-dry-run"), "quality:governance must include AI PR staging dry-run check");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-github-fresh-clone-local-smoke"), "quality:governance must include fresh-clone local smoke check");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-model-ecosystem-catalog"), "quality:governance must include model ecosystem catalog check");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-plugin-mcp-ten-year-continuity-map"), "quality:governance must include Plugin/MCP continuity check");
  ensure(freshClonePlan.oneCommandCandidate?.command === "npm run check:seis-ai-github-readiness-chain", "fresh-clone plan must use AI GitHub readiness chain as one-command candidate");
  ensure(freshClonePlan.sourceOfTruth?.modelEcosystemCatalog === files.modelEcosystemCatalog, "fresh-clone plan must link model ecosystem catalog");
  ensure(freshClonePlan.commandPlan?.includes("npm run check:seis-ai-model-ecosystem-catalog"), "fresh-clone plan must include model ecosystem catalog in command plan");
  ensure(modelEcosystemCatalog.qualityGate === "npm run check:seis-ai-model-ecosystem-catalog", "model ecosystem catalog quality gate mismatch");
  ensure(modelEcosystemCatalog.publicClaimBoundary?.canClaimAllModelsInstalled === false, "model ecosystem catalog must block all-model install claims");
  ensure(modelEcosystemCatalog.publicClaimBoundary?.canClaimTrainingExecuted === false, "model ecosystem catalog must block training claims");
  ensure(modelEcosystemCatalog.publicClaimBoundary?.canClaim512bRouteEligible === false, "model ecosystem catalog must block 512B route claims");
  ensure(modelEcosystemCatalog.publicClaimBoundary?.canClaimRealAgi === false, "model ecosystem catalog must block real AGI claims");
  ensure(freshClonePlan.sourceOfTruth?.freshCloneLocalSmoke === files.freshCloneLocalSmoke, "fresh-clone plan must link fresh-clone local smoke");
  ensure(freshClonePlan.sourceOfTruth?.pluginMcpContinuityMap === files.pluginMcpContinuityMap, "fresh-clone plan must link Plugin/MCP continuity map");
  ensure(freshClonePlan.sourceOfTruth?.aiPrStagingDryRun === files.stagingDryRun, "fresh-clone plan must link AI PR staging dry-run");
  ensure(freshClonePlan.commandPlan?.includes("npm run check:seis-ai-pr-staging-dry-run"), "fresh-clone plan must include AI PR staging dry-run in command plan");
  ensure(pluginMcpContinuityMap.qualityGate === "npm run check:seis-plugin-mcp-ten-year-continuity-map", "Plugin/MCP continuity quality gate mismatch");
  ensure(pluginMcpContinuityReport.validation?.aiGithubReadinessChain === "npm run check:seis-ai-github-readiness-chain", "Plugin/MCP continuity must link AI GitHub readiness chain");
  ensure(ciWorkflow.includes("check:seis-ai-github-readiness-chain"), "CI workflow must include AI GitHub readiness chain");
  ensure(ciWorkflow.includes("check:seis-ai-model-ecosystem-catalog"), "CI workflow must include model ecosystem catalog check");
  ensure(ciWorkflow.includes("check:seis-ai-github-fresh-clone-local-smoke"), "CI workflow must include fresh-clone local smoke check");
  ensure(ciWorkflow.includes("check:seis-plugin-mcp-ten-year-continuity-map"), "CI workflow must include Plugin/MCP continuity check");
  ensure(ciWorkflow.includes("check:seis-ai-pr-staging-dry-run"), "CI workflow must include staging dry-run check");
  ensure(publicReadiness.publicReadyAsAgi === false, "public readiness must keep AGI public-ready false");
  ensure(aiWorkforceDoc.includes("check:seis-ai-github-readiness-chain"), "AI workforce docs must mention readiness chain");
  ensure(githubReadinessDoc.includes("check:seis-ai-github-readiness-chain"), "GitHub readiness docs must mention readiness chain");
}

function renderDocs(prPackage, report) {
  return `# SEIS AI + Plugin/MCP GitHub PR Package

This package defines the AI plus Plugin/MCP PR slice for SEIS readiness work.
It is designed to keep 512B and AGI roadmap work reviewable without mixing in
unrelated Desktop, product-demo, SSH, or public-demo changes.

Status: ${prPackage.status}

## Current Decision

| Field | Value |
| --- | --- |
| Package ready for review | ${String(prPackage.currentDecision.packageReadyForReview)} |
| Safe to push now | ${String(prPackage.currentDecision.safeToPushNow)} |
| Safe to merge now | ${String(prPackage.currentDecision.safeToMergeNow)} |
| Selected AI files | ${report.summary.selectedAiFiles} |
| Missing selected files | ${report.summary.missingSelectedFiles.length} |

Reason push is blocked: ${prPackage.currentDecision.reasonPushBlocked}

## Selected AI Files

${prPackage.selectedAiFiles.map((item) => `- \`${item.path}\` - ${item.purpose}`).join("\n")}

## Required Validation

\`\`\`bash
${prPackage.requiredValidation.join("\n")}
\`\`\`

## Forbidden Without Approval

${prPackage.forbiddenActionsWithoutApproval.map((item) => `- ${item}`).join("\n")}

## Next Human-Reviewed Steps

${prPackage.nextHumanReviewedSteps.map((item) => `- ${item}`).join("\n")}
`;
}

function renderReport(report) {
  return `# SEIS AI + Plugin/MCP GitHub PR Package Report

Generated: ${report.generatedAt}

Status: ${report.status}

| Field | Value |
| --- | --- |
| Selected AI files | ${report.summary.selectedAiFiles} |
| Missing selected files | ${report.summary.missingSelectedFiles.length} |
| Required validation commands | ${report.summary.requiredValidation} |
| Safe to push now | ${String(report.summary.safeToPushNow)} |
| Safe to merge now | ${String(report.summary.safeToMergeNow)} |
| GitHub ready for everyone | ${String(report.summary.githubReadyForEveryone)} |
| Real AGI claim allowed | ${String(report.summary.realAgiClaimAllowed)} |

## Required Validation

${report.requiredValidation.map((item) => `- \`${item}\``).join("\n")}
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
  if (JSON.stringify(actual, null, 2) !== JSON.stringify(expected, null, 2)) {
    failures.push(`${label} is stale. Run npm run report:seis-ai-github-pr-package.`);
  }
}

function checkText(relativePath, expected, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(filePath, "utf8");
  if (actual !== expected) failures.push(`${label} is stale. Run npm run report:seis-ai-github-pr-package.`);
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
    console.error("SEIS AI GitHub PR package check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  if (successMessage) console.log(successMessage);
}
