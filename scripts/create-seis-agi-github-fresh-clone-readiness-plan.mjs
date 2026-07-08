#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const files = {
  plan: "content/development/seis-agi-github-fresh-clone-readiness-plan.json",
  reportJson: "reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.json",
  reportMd: "reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.md",
  docs: "docs/ai/seis-agi-github-fresh-clone-readiness-plan.md",
  githubUserGates: "content/development/seis-agi-github-user-readiness-gates.json",
  publicReadinessEvidence: "content/development/seis-agi-public-readiness-evidence.json",
  agiEvaluationProtocol: "content/development/seis-agi-evaluation-protocol.json",
  localRuntimeMatrix: "content/development/seis-local-ai-runtime-matrix.json",
  modelEcosystemCatalog: "content/development/seis-ai-model-ecosystem-catalog.json",
  pluginMcpContinuityMap: "content/development/seis-plugin-mcp-ten-year-continuity-map.json",
  freshCloneLocalSmoke: "content/development/seis-ai-github-fresh-clone-local-smoke.json",
  aiPrStagingDryRun: "content/development/seis-ai-pr-staging-dry-run.json",
  aiGithubReadinessChainScript: "scripts/check-seis-ai-github-readiness-chain.mjs",
  aiWorkforceDoc: "docs/ai/ai-workforce-training.md",
  githubUserGatesDoc: "docs/ai/seis-agi-github-user-readiness-gates.md",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(files.plan) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const githubUserGates = readJson(files.githubUserGates, "AGI GitHub user readiness gates");
const publicReadinessEvidence = readJson(files.publicReadinessEvidence, "AGI public readiness evidence");
const agiEvaluationProtocol = readJson(files.agiEvaluationProtocol, "AGI evaluation protocol");
const localRuntimeMatrix = readJson(files.localRuntimeMatrix, "local AI runtime matrix");
const modelEcosystemCatalog = readJson(files.modelEcosystemCatalog, "AI model ecosystem catalog");
const pluginMcpContinuityMap = readJson(files.pluginMcpContinuityMap, "Plugin/MCP ten-year continuity map");
const packageJson = readJson(files.packageJson, "package.json");
const aiGithubReadinessChainScript = readText(files.aiGithubReadinessChainScript);
const aiWorkforceDoc = readText(files.aiWorkforceDoc);
const githubUserGatesDoc = readText(files.githubUserGatesDoc);

if (!githubUserGates || !publicReadinessEvidence || !agiEvaluationProtocol || !localRuntimeMatrix || !modelEcosystemCatalog || !pluginMcpContinuityMap || !packageJson) finish();

const plan = buildPlan();
const report = buildReport(plan);
const markdown = renderMarkdown(report);
const docs = renderDocs(plan, report);

if (mode === "write") {
  writeJson(files.plan, plan);
  writeJson(files.reportJson, report);
  writeText(files.reportMd, markdown);
  writeText(files.docs, docs);
  console.log("SEIS AGI GitHub fresh-clone readiness plan generated.");
  console.log(JSON.stringify({
    plan: files.plan,
    report: files.reportJson,
    markdown: files.reportMd,
    docs: files.docs
  }, null, 2));
} else {
  checkJson(files.plan, plan, "AGI GitHub fresh-clone readiness plan");
  checkJson(files.reportJson, report, "AGI GitHub fresh-clone readiness report");
  checkText(files.reportMd, markdown, "AGI GitHub fresh-clone readiness markdown");
  checkText(files.docs, docs, "AGI GitHub fresh-clone readiness docs");
  validate(plan, report);
  finish("SEIS AGI GitHub fresh-clone readiness plan check passed.");
}

function buildPlan() {
  return {
    id: "seis-agi-github-fresh-clone-readiness-plan",
    version: "2026.07.08",
    generatedAt,
    status: "fresh-clone-plan-ready-evidence-missing",
    qualityGate: "npm run check:seis-agi-github-fresh-clone-readiness-plan",
    reportCommand: "npm run report:seis-agi-github-fresh-clone-readiness-plan",
    purpose: "Turn the AGI GitHub user readiness fresh-clone gap into a concrete, no-key, no-model-download, validator-backed local demo path.",
    truthBoundary: [
      "This plan does not make SEIS a real AGI.",
      "This plan does not train, fine-tune, download, serve, benchmark, or route a 512B model.",
      "This plan does not call providers, read secrets, provision cloud/GPU resources, execute SSH, deploy, push, merge, or approve release.",
      "This plan only defines the evidence required before GitHub users can be told the Local Demo readiness path is reproducible."
    ],
    sourceOfTruth: {
      githubUserGates: files.githubUserGates,
      publicReadinessEvidence: files.publicReadinessEvidence,
      agiEvaluationProtocol: files.agiEvaluationProtocol,
      localRuntimeMatrix: files.localRuntimeMatrix,
      modelEcosystemCatalog: files.modelEcosystemCatalog,
      pluginMcpContinuityMap: files.pluginMcpContinuityMap,
      freshCloneLocalSmoke: files.freshCloneLocalSmoke,
      aiPrStagingDryRun: files.aiPrStagingDryRun,
      aiGithubReadinessChainScript: files.aiGithubReadinessChainScript,
      docs: files.docs
    },
    currentState: {
      githubUserGatesStatus: githubUserGates.status,
      publicReadinessStatus: publicReadinessEvidence.status,
      agiProtocolStatus: agiEvaluationProtocol.status,
      localRuntimeMatrixStatus: localRuntimeMatrix.status,
      githubReadyForEveryone: githubUserGates.githubReadyForEveryone,
      publicReadyForLocalDemo: githubUserGates.publicReadyForLocalDemo,
      publicReadyAsAgi: githubUserGates.publicReadyAsAgi,
      routeEligibleToday: githubUserGates.routeEligibleToday,
      agiClaimAllowed: githubUserGates.agiClaimAllowed
    },
    officialResearchBaseline: [
      {
        id: "github-protected-branches",
        url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches",
        observedDate: "2026-07-08",
        seisImplication: "Everyone-ready GitHub status must be gated by protected-branch style review, required checks, and no direct unsafe main mutation."
      },
      {
        id: "github-actions-secure-use",
        url: "https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions",
        observedDate: "2026-07-08",
        seisImplication: "AI readiness workflows must keep secrets least-privilege, avoid plaintext credentials, and prevent secret leakage into logs."
      },
      {
        id: "openssf-scorecard",
        url: "https://github.com/ossf/scorecard",
        observedDate: "2026-07-08",
        seisImplication: "Public readiness should include measurable repository security posture signals, but a score is not AGI evidence."
      }
    ],
    oneCommandCandidate: {
      command: "npm run check:seis-ai-github-readiness-chain",
      status: "defined-not-release-approved",
      requiresSecrets: false,
      downloadsModels: false,
      trainsModels: false,
      callsProviders: false,
      grantsAgiClaim: false
    },
    readinessChecks: [
      checkRow("fresh-clone-command-documentation", "partial", "Documented command exists, but fresh clone evidence is not recorded from a clean external checkout.", ["README command block", "docs/ai/seis-agi-github-fresh-clone-readiness-plan.md", "docs/ai/seis-ai-github-fresh-clone-local-smoke.md", "human-readable no-key instructions"]),
      checkRow("zero-key-ai-readiness-chain", "defined", "The check chain is defined and must stay no-key/no-provider while covering local AI, public AI, and Plugin/MCP continuity gates.", ["check:seis-local-ai-runtime-matrix", "check:seis-language-model-intake", "check:seis-agi-github-user-readiness-gates", "check:seis-plugin-mcp-ten-year-continuity-map"]),
      checkRow("model-ecosystem-catalog", "defined", "Major model families are cataloged as metadata-only candidates with no install, download, training, or AGI authority.", ["check:seis-ai-model-ecosystem-catalog", "content/development/seis-ai-model-ecosystem-catalog.json"]),
      checkRow("cross-platform-fresh-clone-smoke", "missing", "No macOS/Linux/Windows fresh clone smoke evidence is attached to this plan.", ["clean clone logs", "node/npm version record", "local demo startup evidence"]),
      checkRow("secret-and-model-download-proof", "defined", "Existing gates block secrets, provider calls, model downloads, and training.", ["secret scan evidence", "local runtime matrix", "public readiness evidence"]),
      checkRow("release-approval", "missing", "No human release approval exists for everyone-ready status.", ["PR review approval", "required checks", "rollback plan"]),
      checkRow("agi-claim-proof", "blocked", "AGI and 512B claims remain blocked until independent evidence exists.", ["independent AGI evaluation", "512B training or inference evidence", "external review"])
    ],
    commandPlan: [
      "npm run check:seis-local-ai-runtime-matrix",
      "npm run check:seis-ai-model-ecosystem-catalog",
      "npm run check:seis-plugin-mcp-ten-year-continuity-map",
      "npm run check:seis-language-model-intake",
      "npm run check:seis-ai-workforce-training",
      "npm run check:seis-agi-evaluation-protocol",
      "npm run check:seis-agi-public-readiness-evidence",
      "npm run check:seis-agi-github-user-readiness-gates",
      "npm run check:seis-512b-apex-model-program",
      "npm run check:seis-agi-github-fresh-clone-readiness-plan",
      "npm run check:seis-ai-github-fresh-clone-local-smoke",
      "npm run check:seis-public-ai-readiness",
      "npm run check:seis-ai-github-pr-package",
      "npm run check:seis-ai-pr-staging-dry-run",
      "npm run check:seis-ai-github-readiness-chain"
    ],
    publicClaimBoundary: {
      canClaimFreshClonePlanExists: true,
      canClaimFreshCloneVerified: false,
      canClaimEveryoneReady: false,
      canClaimLocalDemoReviewAllowed: true,
      canClaimAnyModelInstalled: false,
      canClaim512BRouteEligible: false,
      canClaimRealAgi: false
    },
    blockersBeforeEveryoneReady: [
      "fresh clone local demo path verified on a clean checkout",
      "one-command AI readiness validator documented and passing in CI",
      "cross-platform smoke evidence recorded",
      "secret scan and no-model-download proof attached",
      "human release approval recorded",
      "protected branch or equivalent PR review policy confirmed",
      "AGI and 512B claim boundaries preserved"
    ],
    nextSafeActions: [
      "Run this plan in check mode after every AI readiness change.",
      "Attach clean clone logs before changing githubReadyForEveryone.",
      "Keep AGI claims blocked until independent evaluation and 512B evidence exist."
    ]
  };
}

function checkRow(id, status, currentEvidence, requiredEvidence) {
  return {
    id,
    status,
    currentEvidence,
    requiredEvidence,
    blocksEveryoneReady: status !== "defined",
    blocksAgiClaim: true
  };
}

function buildReport(plan) {
  const blockedCount = plan.readinessChecks.filter((item) => item.blocksEveryoneReady).length;
  return {
    id: "seis-agi-github-fresh-clone-readiness-plan-report",
    generatedAt: plan.generatedAt,
    status: "fresh-clone-readiness-defined-everyone-ready-blocked",
    sourcePlan: files.plan,
    summary: {
      readinessChecks: plan.readinessChecks.length,
      blockedEveryoneReadyChecks: blockedCount,
      githubReadyForEveryone: plan.currentState.githubReadyForEveryone,
      publicReadyForLocalDemo: plan.currentState.publicReadyForLocalDemo,
      publicReadyAsAgi: plan.currentState.publicReadyAsAgi,
      routeEligibleToday: plan.currentState.routeEligibleToday,
      agiClaimAllowed: plan.currentState.agiClaimAllowed
    },
    publicClaimBoundary: plan.publicClaimBoundary,
    blockersBeforeEveryoneReady: plan.blockersBeforeEveryoneReady
  };
}

function validate(plan, report) {
  ensure(plan.id === "seis-agi-github-fresh-clone-readiness-plan", "plan id mismatch");
  ensure(plan.status === "fresh-clone-plan-ready-evidence-missing", "plan status mismatch");
  ensure(plan.qualityGate === "npm run check:seis-agi-github-fresh-clone-readiness-plan", "plan quality gate mismatch");
  ensure(plan.reportCommand === "npm run report:seis-agi-github-fresh-clone-readiness-plan", "plan report command mismatch");
  ensure(plan.sourceOfTruth.githubUserGates === files.githubUserGates, "plan must link GitHub user gates");
  ensure(plan.sourceOfTruth.publicReadinessEvidence === files.publicReadinessEvidence, "plan must link public readiness evidence");
  ensure(plan.sourceOfTruth.agiEvaluationProtocol === files.agiEvaluationProtocol, "plan must link AGI protocol");
  ensure(plan.sourceOfTruth.localRuntimeMatrix === files.localRuntimeMatrix, "plan must link local runtime matrix");
  ensure(plan.sourceOfTruth.modelEcosystemCatalog === files.modelEcosystemCatalog, "plan must link AI model ecosystem catalog");
  ensure(plan.sourceOfTruth.pluginMcpContinuityMap === files.pluginMcpContinuityMap, "plan must link Plugin/MCP continuity map");
  ensure(plan.sourceOfTruth.freshCloneLocalSmoke === files.freshCloneLocalSmoke, "plan must link fresh-clone local smoke");
  ensure(plan.sourceOfTruth.aiPrStagingDryRun === files.aiPrStagingDryRun, "plan must link AI PR staging dry-run");
  ensure(plan.sourceOfTruth.aiGithubReadinessChainScript === files.aiGithubReadinessChainScript, "plan must link AI GitHub readiness chain script");
  ensure(plan.currentState.githubReadyForEveryone === false, "plan must keep everyone-ready false");
  ensure(plan.currentState.publicReadyForLocalDemo === true, "plan must keep local demo review allowed");
  ensure(plan.currentState.publicReadyAsAgi === false, "plan must keep public-ready-as-AGI false");
  ensure(plan.currentState.routeEligibleToday === false, "plan must keep route eligibility false");
  ensure(plan.currentState.agiClaimAllowed === false, "plan must keep AGI claim false");
  ensure(plan.oneCommandCandidate.requiresSecrets === false, "one-command candidate must require no secrets");
  ensure(plan.oneCommandCandidate.downloadsModels === false, "one-command candidate must not download models");
  ensure(plan.oneCommandCandidate.trainsModels === false, "one-command candidate must not train models");
  ensure(plan.oneCommandCandidate.callsProviders === false, "one-command candidate must not call providers");
  ensure(plan.oneCommandCandidate.grantsAgiClaim === false, "one-command candidate must not grant AGI claim");
  ensureArrayIncludesAll(plan.officialResearchBaseline.map((item) => item.id), ["github-protected-branches", "github-actions-secure-use", "openssf-scorecard"], "officialResearchBaseline");
  ensureArrayIncludesAll(plan.readinessChecks.map((item) => item.id), [
    "fresh-clone-command-documentation",
    "zero-key-ai-readiness-chain",
    "model-ecosystem-catalog",
    "cross-platform-fresh-clone-smoke",
    "secret-and-model-download-proof",
    "release-approval",
    "agi-claim-proof"
  ], "readinessChecks");
  ensure(plan.readinessChecks.some((item) => item.id === "cross-platform-fresh-clone-smoke" && item.status === "missing"), "cross-platform smoke must remain missing");
  ensure(plan.readinessChecks.some((item) => item.id === "agi-claim-proof" && item.status === "blocked"), "AGI claim proof must remain blocked");
  ensureArrayIncludesAll(plan.commandPlan, [
    "npm run check:seis-local-ai-runtime-matrix",
    "npm run check:seis-ai-model-ecosystem-catalog",
    "npm run check:seis-plugin-mcp-ten-year-continuity-map",
    "npm run check:seis-agi-github-user-readiness-gates",
    "npm run check:seis-512b-apex-model-program",
    "npm run check:seis-agi-github-fresh-clone-readiness-plan",
    "npm run check:seis-ai-github-fresh-clone-local-smoke",
    "npm run check:seis-public-ai-readiness",
    "npm run check:seis-ai-github-pr-package",
    "npm run check:seis-ai-pr-staging-dry-run",
    "npm run check:seis-ai-github-readiness-chain"
  ], "commandPlan");
  ensure(plan.publicClaimBoundary.canClaimFreshClonePlanExists === true, "plan existence claim should be true");
  ensure(plan.publicClaimBoundary.canClaimFreshCloneVerified === false, "fresh clone verified claim must be false");
  ensure(plan.publicClaimBoundary.canClaimEveryoneReady === false, "everyone-ready claim must be false");
  ensure(plan.publicClaimBoundary.canClaimRealAgi === false, "real AGI claim must be false");
  ensure(report.status === "fresh-clone-readiness-defined-everyone-ready-blocked", "report status mismatch");
  ensure(report.summary.githubReadyForEveryone === false, "report must keep everyone-ready false");
  ensure(report.summary.agiClaimAllowed === false, "report must keep AGI claim false");
  ensure(packageJson.scripts?.["check:seis-agi-github-fresh-clone-readiness-plan"] === "node scripts/create-seis-agi-github-fresh-clone-readiness-plan.mjs", "package.json must expose fresh-clone readiness check");
  ensure(packageJson.scripts?.["check:seis-ai-model-ecosystem-catalog"] === "node scripts/create-seis-ai-model-ecosystem-catalog.mjs", "package.json must expose AI model ecosystem catalog");
  ensure(packageJson.scripts?.["check:seis-plugin-mcp-ten-year-continuity-map"] === "node scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs --check", "package.json must expose Plugin/MCP continuity check");
  ensure(packageJson.scripts?.["report:seis-agi-github-fresh-clone-readiness-plan"] === "node scripts/create-seis-agi-github-fresh-clone-readiness-plan.mjs --write", "package.json must expose fresh-clone readiness report");
  ensure(packageJson.scripts?.["check:seis-ai-github-readiness-chain"] === "node scripts/check-seis-ai-github-readiness-chain.mjs", "package.json must expose AI GitHub readiness chain");
  ensure(packageJson.scripts?.["check:seis-ai-github-fresh-clone-local-smoke"] === "node scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs", "package.json must expose fresh-clone local smoke");
  ensure(packageJson.scripts?.["check:seis-ai-github-pr-package"] === "node scripts/create-seis-ai-github-pr-package.mjs", "package.json must expose AI GitHub PR package");
  ensure(packageJson.scripts?.["check:seis-ai-pr-staging-dry-run"] === "node scripts/create-seis-ai-pr-staging-dry-run.mjs", "package.json must expose AI PR staging dry-run");
  ensure(aiGithubReadinessChainScript.includes("check:seis-plugin-mcp-ten-year-continuity-map"), "AI GitHub readiness chain must include Plugin/MCP continuity check");
  ensure(aiGithubReadinessChainScript.includes("check:seis-ai-model-ecosystem-catalog"), "AI GitHub readiness chain must include AI model ecosystem catalog");
  ensure(aiGithubReadinessChainScript.includes("check:seis-ai-pr-staging-dry-run"), "AI GitHub readiness chain must include AI PR staging dry-run");
  ensure(aiGithubReadinessChainScript.includes("check:seis-ai-github-fresh-clone-local-smoke"), "AI GitHub readiness chain must include fresh-clone local smoke");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-agi-github-fresh-clone-readiness-plan"), "quality:governance must include fresh-clone readiness plan");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-model-ecosystem-catalog"), "quality:governance must include AI model ecosystem catalog");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-github-fresh-clone-local-smoke"), "quality:governance must include fresh-clone local smoke");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-github-readiness-chain"), "quality:governance must include AI GitHub readiness chain");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-github-pr-package"), "quality:governance must include AI GitHub PR package");
  ensure(aiWorkforceDoc.includes("seis-agi-github-fresh-clone-readiness-plan"), "AI workforce docs must link fresh-clone readiness plan");
  ensure(githubUserGatesDoc.includes("seis-agi-github-fresh-clone-readiness-plan"), "GitHub user readiness docs must link fresh-clone readiness plan");
}

function renderMarkdown(report) {
  return `# SEIS AGI GitHub Fresh-Clone Readiness Plan

Generated: ${report.generatedAt}

Status: ${report.status}

## Summary

| Field | Value |
| --- | --- |
| Readiness checks | ${report.summary.readinessChecks} |
| Blocked everyone-ready checks | ${report.summary.blockedEveryoneReadyChecks} |
| GitHub ready for everyone | ${String(report.summary.githubReadyForEveryone)} |
| Public ready for Local Demo | ${String(report.summary.publicReadyForLocalDemo)} |
| Public ready as AGI | ${String(report.summary.publicReadyAsAgi)} |
| Route eligible today | ${String(report.summary.routeEligibleToday)} |
| AGI claim allowed | ${String(report.summary.agiClaimAllowed)} |

## Blockers Before Everyone Ready

${report.blockersBeforeEveryoneReady.map((item) => `- ${item}`).join("\n")}
`;
}

function renderDocs(plan, report) {
  return `# SEIS AGI GitHub Fresh-Clone Readiness Plan

This plan turns the GitHub user readiness fresh-clone gap into a concrete,
no-key, local-demo-first checklist. It does not make SEIS a real AGI and does
not approve 512B training, inference, benchmarks, provider calls, cloud/GPU,
SSH, deployment, push, merge, or release.

## Status

- Plan status: ${plan.status}
- Report status: ${report.status}
- GitHub ready for everyone: ${String(report.summary.githubReadyForEveryone)}
- Public ready for Local Demo: ${String(report.summary.publicReadyForLocalDemo)}
- Public ready as AGI: ${String(report.summary.publicReadyAsAgi)}
- AGI claim allowed: ${String(report.summary.agiClaimAllowed)}

## Commands

\`\`\`bash
npm run report:seis-agi-github-fresh-clone-readiness-plan
npm run check:seis-agi-github-fresh-clone-readiness-plan
npm run check:seis-ai-model-ecosystem-catalog
npm run check:seis-ai-github-fresh-clone-local-smoke
npm run check:seis-plugin-mcp-ten-year-continuity-map
npm run check:seis-ai-github-readiness-chain
\`\`\`

## One-Command Candidate

\`${plan.oneCommandCandidate.command}\`

This command must remain no-key, no-provider, no-model-download, and no-training.

## Everyone-Ready Blockers

${plan.blockersBeforeEveryoneReady.map((item) => `- ${item}`).join("\n")}
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
  if (JSON.stringify(actual, null, 2) !== JSON.stringify(expected, null, 2)) failures.push(`${label} is stale. Run npm run report:seis-agi-github-fresh-clone-readiness-plan.`);
}

function checkText(relativePath, expected, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(filePath, "utf8");
  if (actual !== expected) failures.push(`${label} is stale. Run npm run report:seis-agi-github-fresh-clone-readiness-plan.`);
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
    console.error("SEIS AGI GitHub fresh-clone readiness plan check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  if (successMessage) console.log(successMessage);
}
