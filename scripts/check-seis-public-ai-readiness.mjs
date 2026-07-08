#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const dangerousLiteralClaims = [
  "SEIS has achieved real AGI.",
  "SEIS includes trained 512B weights.",
  "GitHub users can run routeable 512B inference today.",
  "Passing CI or CodeQL proves AGI.",
  "Installed AI or sub-agents prove AGI.",
  "Provider API access is SEIS-owned AGI.",
  "SEIS is a real AGI.",
  "SEIS has routeable 512B weights.",
  "SEIS has routeable 512B inference."
];

const dangerousMarkdownPatterns = [
  {
    regex: /\bPublic ready as AGI\b\s*\|\s*True\b/i,
    message: "must not mark public-ready-as-AGI true"
  },
  {
    regex: /\bAGI claim allowed\b\s*\|\s*True\b/i,
    message: "must not mark AGI claim allowed true"
  },
  {
    regex: /\bGitHub ready for everyone\b\s*\|\s*True\b/i,
    message: "must not mark GitHub everyone-ready true"
  },
  {
    regex: /\b512B route eligible today\b\s*\|\s*True\b/i,
    message: "must not mark 512B route eligible today true"
  }
];

const paths = {
  packageJson: "package.json",
  readme: "README.md",
  aiDocsDir: "docs/ai",
  publicReadiness: "content/development/seis-agi-public-readiness-evidence.json",
  githubUserGates: "content/development/seis-agi-github-user-readiness-gates.json",
  freshClonePlan: "content/development/seis-agi-github-fresh-clone-readiness-plan.json",
  aiPrPackage: "content/development/seis-ai-github-pr-package.json",
  aiPrStagingDryRun: "content/development/seis-ai-pr-staging-dry-run.json",
  modelEcosystemCatalog: "content/development/seis-ai-model-ecosystem-catalog.json",
  agiProtocol: "content/development/seis-agi-evaluation-protocol.json",
  independentLedger: "content/development/seis-agi-independent-evidence-ledger.json",
  apexProgram: "content/development/seis-512b-apex-model-program.json",
  localRuntimeMatrix: "content/development/seis-local-ai-runtime-matrix.json",
  languageModelIntake: "content/development/seis-language-model-intake-registry.json",
  scalingProfile: "content/development/seis-model-scaling-hardware-profile.json",
  parameterLadder: "content/development/seis-model-parameter-ladder.json",
  frontierPolicy: "content/development/seis-model-frontier-escalation-policy.json",
  scalingCouncil: "content/development/seis-model-scaling-subagent-council.json"
};

const jsonPaths = [
  paths.publicReadiness,
  paths.githubUserGates,
  paths.freshClonePlan,
  paths.aiPrPackage,
  paths.aiPrStagingDryRun,
  paths.modelEcosystemCatalog,
  paths.agiProtocol,
  paths.independentLedger,
  paths.apexProgram,
  paths.localRuntimeMatrix,
  paths.languageModelIntake,
  paths.scalingProfile,
  paths.parameterLadder,
  paths.frontierPolicy,
  paths.scalingCouncil
];

for (const relativePath of [
  paths.packageJson,
  paths.readme,
  paths.publicReadiness,
  paths.githubUserGates,
  paths.agiProtocol,
  paths.independentLedger,
  paths.apexProgram,
  paths.localRuntimeMatrix,
  paths.languageModelIntake,
  paths.scalingProfile,
  paths.aiPrPackage,
  paths.aiPrStagingDryRun,
  paths.modelEcosystemCatalog
]) {
  ensureFile(relativePath);
}

ensureDir(paths.aiDocsDir);

const packageJson = readJson(paths.packageJson, "package.json");
const publicReadiness = readJson(paths.publicReadiness, "AGI public readiness evidence");
const githubUserGates = readJson(paths.githubUserGates, "AGI GitHub user readiness gates");
const freshClonePlan = readOptionalJson(paths.freshClonePlan);
const aiPrPackage = readOptionalJson(paths.aiPrPackage);
const aiPrStagingDryRun = readOptionalJson(paths.aiPrStagingDryRun);
const modelEcosystemCatalog = readOptionalJson(paths.modelEcosystemCatalog);
const agiProtocol = readJson(paths.agiProtocol, "AGI evaluation protocol");
const independentLedger = readJson(paths.independentLedger, "AGI independent evidence ledger");
const apexProgram = readJson(paths.apexProgram, "512B apex model program");
const localRuntimeMatrix = readJson(paths.localRuntimeMatrix, "local AI runtime matrix");
const languageModelIntake = readJson(paths.languageModelIntake, "language model intake registry");
const scalingProfile = readJson(paths.scalingProfile, "model scaling hardware profile");

validatePackageScripts(packageJson);
validateCoreClaimStates({
  publicReadiness,
  githubUserGates,
  freshClonePlan,
  aiPrPackage,
  aiPrStagingDryRun,
  modelEcosystemCatalog,
  agiProtocol,
  independentLedger,
  apexProgram,
  localRuntimeMatrix,
  languageModelIntake,
  scalingProfile
});
scanJsonPublicClaims();
scanMarkdownPublicClaims();

finish("SEIS public AI readiness check passed.");

function validatePackageScripts(pkg) {
  if (!pkg) return;
  const scripts = pkg.scripts || {};
  ensure(scripts["check:seis-public-ai-readiness"] === "node scripts/check-seis-public-ai-readiness.mjs", "package.json must expose check:seis-public-ai-readiness");
  ensure(scripts["check:seis-agi-public-readiness-evidence"] === "node scripts/check-seis-agi-public-readiness-evidence.mjs", "package.json must expose AGI public readiness evidence check");
  ensure(scripts["check:seis-agi-github-user-readiness-gates"] === "node scripts/check-seis-agi-github-user-readiness-gates.mjs", "package.json must expose AGI GitHub user readiness check");
  ensure(scripts["check:seis-agi-github-fresh-clone-readiness-plan"] === "node scripts/create-seis-agi-github-fresh-clone-readiness-plan.mjs", "package.json must expose fresh-clone readiness check");
  ensure(scripts["check:seis-ai-github-readiness-chain"] === "node scripts/check-seis-ai-github-readiness-chain.mjs", "package.json must expose check:seis-ai-github-readiness-chain");
  ensure(scripts["check:seis-ai-github-fresh-clone-local-smoke"] === "node scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs", "package.json must expose check:seis-ai-github-fresh-clone-local-smoke");
  ensure(scripts["check:seis-ai-github-pr-package"] === "node scripts/create-seis-ai-github-pr-package.mjs", "package.json must expose check:seis-ai-github-pr-package");
  ensure(scripts["report:seis-ai-github-pr-package"] === "node scripts/create-seis-ai-github-pr-package.mjs --write", "package.json must expose report:seis-ai-github-pr-package");
  ensure(scripts["check:seis-ai-pr-staging-dry-run"] === "node scripts/create-seis-ai-pr-staging-dry-run.mjs", "package.json must expose check:seis-ai-pr-staging-dry-run");
  ensure(scripts["report:seis-ai-pr-staging-dry-run"] === "node scripts/create-seis-ai-pr-staging-dry-run.mjs --write", "package.json must expose report:seis-ai-pr-staging-dry-run");
  ensure(scripts["check:seis-ai-model-ecosystem-catalog"] === "node scripts/create-seis-ai-model-ecosystem-catalog.mjs", "package.json must expose check:seis-ai-model-ecosystem-catalog");
  ensure(scripts["report:seis-ai-model-ecosystem-catalog"] === "node scripts/create-seis-ai-model-ecosystem-catalog.mjs --write", "package.json must expose report:seis-ai-model-ecosystem-catalog");
  ensure(scripts["check:seis-plugin-mcp-ten-year-continuity-map"] === "node scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs --check", "package.json must expose check:seis-plugin-mcp-ten-year-continuity-map");
  ensure(scripts["check:seis-512b-apex-model-program"] === "node scripts/check-seis-512b-apex-model-program.mjs", "package.json must expose 512B apex model program check");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-public-ai-readiness"), "quality:governance must include check:seis-public-ai-readiness");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-ai-github-readiness-chain"), "quality:governance must include check:seis-ai-github-readiness-chain");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-ai-github-fresh-clone-local-smoke"), "quality:governance must include check:seis-ai-github-fresh-clone-local-smoke");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-ai-github-pr-package"), "quality:governance must include check:seis-ai-github-pr-package");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-ai-pr-staging-dry-run"), "quality:governance must include check:seis-ai-pr-staging-dry-run");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-ai-model-ecosystem-catalog"), "quality:governance must include check:seis-ai-model-ecosystem-catalog");
  ensure(String(scripts["quality:governance"] || "").includes("check:seis-plugin-mcp-ten-year-continuity-map"), "quality:governance must include check:seis-plugin-mcp-ten-year-continuity-map");
}

function validateCoreClaimStates(state) {
  ensure(state.publicReadiness?.status === "blocked-missing-real-agi-evidence", "public readiness status must stay blocked");
  ensure(state.publicReadiness?.publicReadyAsAgi === false, "public readiness must not mark AGI ready");
  ensure(state.publicReadiness?.publicReadyAsLocalDemo === true, "public readiness must keep Local Demo review allowed");
  ensure(state.publicReadiness?.agiClaimAllowed === false, "public readiness must block AGI claims");
  ensure(state.publicReadiness?.routeEligibleToday === false, "public readiness must block route eligibility");
  ensure(state.publicReadiness?.runtimeAuthority === false, "public readiness must not grant runtime authority");

  ensure(state.githubUserGates?.githubReadyForEveryone === false, "GitHub user gates must keep everyone-ready false");
  ensure(state.githubUserGates?.publicReadyForLocalDemo === true, "GitHub user gates must allow Local Demo review");
  ensure(state.githubUserGates?.publicReadyAsAgi === false, "GitHub user gates must not mark public-ready as AGI");
  ensure(state.githubUserGates?.agiClaimAllowed === false, "GitHub user gates must block AGI claims");
  ensure(state.githubUserGates?.routeEligibleToday === false, "GitHub user gates must block route eligibility");
  ensure(state.githubUserGates?.runtimeAuthority === false, "GitHub user gates must not grant runtime authority");

  if (state.freshClonePlan) {
    ensure(state.freshClonePlan.status === "fresh-clone-plan-ready-evidence-missing", "fresh-clone plan status must stay evidence-missing");
    ensure(state.freshClonePlan.publicClaimBoundary?.canClaimFreshClonePlanExists === true, "fresh-clone plan may claim the plan exists");
    ensure(state.freshClonePlan.publicClaimBoundary?.canClaimFreshCloneVerified === false, "fresh-clone plan must not claim fresh-clone verification");
    ensure(state.freshClonePlan.publicClaimBoundary?.canClaimEveryoneReady === false, "fresh-clone plan must not claim everyone-ready status");
    ensure(state.freshClonePlan.publicClaimBoundary?.canClaimAnyModelInstalled === false, "fresh-clone plan must not claim model installation");
    ensure(state.freshClonePlan.publicClaimBoundary?.canClaim512BRouteEligible === false, "fresh-clone plan must not claim 512B route eligibility");
    ensure(state.freshClonePlan.publicClaimBoundary?.canClaimRealAgi === false, "fresh-clone plan must not claim real AGI");
    ensure(state.freshClonePlan.sourceOfTruth?.freshCloneLocalSmoke === "content/development/seis-ai-github-fresh-clone-local-smoke.json", "fresh-clone plan must link local smoke evidence");
    ensure(state.freshClonePlan.commandPlan?.includes("npm run check:seis-ai-github-fresh-clone-local-smoke"), "fresh-clone plan must include local smoke command");
  }

  if (state.aiPrPackage) {
    ensure(state.aiPrPackage.status === "ready-for-ai-plugin-mcp-pr-review-not-ready-for-push", "AI PR package status mismatch");
    ensure(state.aiPrPackage.currentDecision?.safeToPushNow === false, "AI PR package must keep safeToPushNow false");
    ensure(state.aiPrPackage.currentDecision?.safeToMergeNow === false, "AI PR package must keep safeToMergeNow false");
    ensure(state.aiPrPackage.sourceOfTruth?.modelEcosystemCatalog === "content/development/seis-ai-model-ecosystem-catalog.json", "AI PR package must link model ecosystem catalog");
    ensure(state.aiPrPackage.requiredValidation?.includes("npm run check:seis-ai-model-ecosystem-catalog"), "AI PR package must require model ecosystem catalog validation");
    ensure(state.aiPrPackage.publicClaimBoundary?.canClaimRealAgi === false, "AI PR package must block real AGI claim");
    ensure(state.aiPrPackage.publicClaimBoundary?.canClaim512bRouteEligible === false, "AI PR package must block 512B route eligibility claim");
  }

  if (state.aiPrStagingDryRun) {
    ensure(state.aiPrStagingDryRun.status === "staging-plan-ready-push-blocked" || state.aiPrStagingDryRun.status === "staging-plan-ready-clean-ai-only", "AI PR staging dry-run status mismatch");
    ensure(state.aiPrStagingDryRun.currentDecision?.dryRunOnly === true, "AI PR staging dry-run must remain dry-run only");
    ensure(state.aiPrStagingDryRun.currentDecision?.gitAddExecuted === false, "AI PR staging dry-run must not claim git add");
    ensure(state.aiPrStagingDryRun.currentDecision?.commitExecuted === false, "AI PR staging dry-run must not claim commit");
    ensure(state.aiPrStagingDryRun.currentDecision?.pushExecuted === false, "AI PR staging dry-run must not claim push");
    ensure(state.aiPrStagingDryRun.currentDecision?.mergeExecuted === false, "AI PR staging dry-run must not claim merge");
    ensure(state.aiPrStagingDryRun.currentDecision?.safeToPushNow === false, "AI PR staging dry-run must keep safeToPushNow false");
    ensure(state.aiPrStagingDryRun.publicClaimBoundary?.canClaimRealAgi === false, "AI PR staging dry-run must block real AGI claim");
  }

  if (state.modelEcosystemCatalog) {
    ensure(state.modelEcosystemCatalog.status === "catalog-ready-no-install-no-training", "model ecosystem catalog status mismatch");
    ensure(state.modelEcosystemCatalog.allowedToday?.modelInstall === false, "model ecosystem catalog must block model install");
    ensure(state.modelEcosystemCatalog.allowedToday?.checkpointDownload === false, "model ecosystem catalog must block checkpoint download");
    ensure(state.modelEcosystemCatalog.allowedToday?.providerCalls === false, "model ecosystem catalog must block provider calls");
    ensure(state.modelEcosystemCatalog.allowedToday?.foundationPretraining === false, "model ecosystem catalog must block foundation pretraining");
    ensure(state.modelEcosystemCatalog.publicClaimBoundary?.canClaimAllModelsInstalled === false, "model ecosystem catalog must block all-model install claim");
    ensure(state.modelEcosystemCatalog.publicClaimBoundary?.canClaimTrainingExecuted === false, "model ecosystem catalog must block training claim");
    ensure(state.modelEcosystemCatalog.publicClaimBoundary?.canClaim512bRouteEligible === false, "model ecosystem catalog must block 512B route claim");
    ensure(state.modelEcosystemCatalog.publicClaimBoundary?.canClaimRealAgi === false, "model ecosystem catalog must block real AGI claim");
  }

  ensure(state.agiProtocol?.status === "protocol-draft-not-run", "AGI protocol must remain draft-not-run");
  ensure(state.agiProtocol?.evaluationRunStatus === "not-run", "AGI protocol must not claim an evaluation run");
  ensure(state.agiProtocol?.agiClaimAllowed === false, "AGI protocol must block AGI claims");
  ensure(state.agiProtocol?.routeEligibleToday === false, "AGI protocol must block route eligibility");
  ensure(state.agiProtocol?.runtimeAuthority === false, "AGI protocol must not grant runtime authority");

  ensure(state.independentLedger?.status === "planned-without-independent-evidence", "independent evidence ledger must remain planned without evidence");
  ensure(state.independentLedger?.agiClaimAllowed === false, "independent evidence ledger must block AGI claims");
  ensure(state.independentLedger?.routeEligibleToday === false, "independent evidence ledger must block route eligibility");

  ensure(state.apexProgram?.status === "apex-program-plan-only", "512B apex program must stay plan-only");
  ensure(state.apexProgram?.trainingStatus === "not-started", "512B apex program must not claim training started");
  ensure(state.apexProgram?.weightsAvailable === false, "512B apex program must not claim weights exist");
  ensure(state.apexProgram?.inferenceAvailable === false, "512B apex program must not claim inference");
  ensure(state.apexProgram?.benchmarkStatus === "not-run", "512B apex program must not claim benchmarks");
  ensure(state.apexProgram?.routeEligibleToday === false, "512B apex program must block route eligibility");
  ensure(state.apexProgram?.runtimeAuthority === false, "512B apex program must not grant runtime authority");
  ensure(state.apexProgram?.productionReady === false, "512B apex program must not be production ready");

  ensure(state.localRuntimeMatrix?.status === "runtime-matrix-ready-no-install", "local runtime matrix status mismatch");
  ensure(state.localRuntimeMatrix?.publicClaims?.canClaimAnyModelInstalled === false, "local runtime matrix must not claim any model installed");
  ensure(state.localRuntimeMatrix?.publicClaims?.canClaimLocalInferenceReady === false, "local runtime matrix must not claim inference readiness");
  ensure(state.localRuntimeMatrix?.publicClaims?.canClaim512BReady === false, "local runtime matrix must not claim 512B readiness");
  ensure(state.localRuntimeMatrix?.publicClaims?.canClaimSEISFullyKnowledgeable === false, "local runtime matrix must not claim fully knowledgeable AI");
  ensure(state.localRuntimeMatrix?.publicClaims?.canClaimAGI === false, "local runtime matrix must not claim AGI");

  ensure(state.languageModelIntake?.status === "active-intake-contract", "language model intake must remain active intake contract");
  ensure(state.scalingProfile?.status === "planned-compatibility-contract", "model scaling profile must remain a planned compatibility contract");
  ensure(state.scalingProfile?.currentTarget?.runtimeAuthority === false, "20B target must not grant runtime authority");
  ensure(state.scalingProfile?.currentTarget?.inferenceAvailable === false, "20B target must not claim inference availability");
  ensure(state.scalingProfile?.apexTarget?.runtimeAuthority === false, "512B apex target must not grant runtime authority");
}

function scanJsonPublicClaims() {
  for (const relativePath of jsonPaths) {
    const value = readOptionalJson(relativePath);
    if (!value) continue;
    inspectJsonStrings(value, relativePath, []);
  }
}

function inspectJsonStrings(value, relativePath, keyPath) {
  if (typeof value === "string") {
    for (const claim of dangerousLiteralClaims) {
      if (value.includes(claim) && !allowedClaimContext(keyPath, value)) {
        failures.push(`${relativePath}:${keyPath.join(".")} contains unguarded public AI claim: ${claim}`);
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectJsonStrings(item, relativePath, keyPath.concat(String(index))));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) inspectJsonStrings(item, relativePath, keyPath.concat(key));
  }
}

function scanMarkdownPublicClaims() {
  const markdownFiles = [
    paths.readme,
    ...collectFiles(paths.aiDocsDir).filter((file) => file.endsWith(".md"))
  ];

  for (const relativePath of markdownFiles) {
    const text = readText(relativePath);
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const claim of dangerousLiteralClaims) {
        if (line.includes(claim) && !isGuardedLine(line)) {
          failures.push(`${relativePath}:${index + 1} contains unguarded public AI claim: ${claim}`);
        }
      }
      for (const pattern of dangerousMarkdownPatterns) {
        if (pattern.regex.test(line) && !isGuardedLine(line)) {
          failures.push(`${relativePath}:${index + 1} ${pattern.message}`);
        }
      }
    });
  }
}

function allowedClaimContext(keyPath, value) {
  const joined = keyPath.join(".").toLowerCase();
  if (/(forbidden|negative|truthboundary|nonclaim|blocked|blockingreason|claimboundary|forbiddengreenlights)/i.test(joined)) return true;
  return isGuardedLine(value);
}

function isGuardedLine(line) {
  return /\b(not|no|cannot|can not|must not|does not|blocked|forbidden|false|missing|not-run|plan-only|planned|disabled|boundary|remain|until|before|without|unavailable)\b/i.test(line);
}

function collectFiles(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const collected = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) collected.push(...collectFiles(relativePath));
    if (entry.isFile()) collected.push(relativePath);
  }
  return collected;
}

function ensureFile(relativePath) {
  const filePath = path.join(root, relativePath);
  ensure(fs.existsSync(filePath) && fs.statSync(filePath).isFile(), `missing file: ${relativePath}`);
}

function ensureDir(relativePath) {
  const dirPath = path.join(root, relativePath);
  ensure(fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory(), `missing directory: ${relativePath}`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(relativePath, label) {
  const value = readOptionalJson(relativePath);
  if (!value) failures.push(`${label} missing or invalid: ${relativePath}`);
  return value;
}

function readOptionalJson(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${relativePath} invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS public AI readiness check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
