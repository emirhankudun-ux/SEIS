#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const paths = {
  registry: "content/development/seis-language-model-intake-registry.json",
  curriculum: "content/development/seis-language-model-training-curriculum.json",
  hardwareProfile: "content/development/seis-model-scaling-hardware-profile.json",
  parameterLadder: "content/development/seis-model-parameter-ladder.json",
  knowledgeRetrievalTraining: "content/development/seis-knowledge-retrieval-training-contract.json",
  ledger: "content/development/seis-language-model-install-training-ledger.json",
  reportJson: "reports/seis-model-scaling/seis-language-model-install-training-ledger.json",
  reportMd: "reports/seis-model-scaling/seis-language-model-install-training-ledger.md",
  packageJson: "package.json"
};

const existingLedger = mode === "check" ? readOptionalJson(paths.ledger) : null;
const generatedAt = existingLedger?.generatedAt || new Date().toISOString();
const registry = readJson(paths.registry, "language model intake registry");
const curriculum = readJson(paths.curriculum, "language model training curriculum");
const hardwareProfile = readJson(paths.hardwareProfile, "model scaling hardware profile");
const parameterLadder = readJson(paths.parameterLadder, "model parameter ladder");
const packageJson = readJson(paths.packageJson, "package.json");

if (!registry || !curriculum || !hardwareProfile || !parameterLadder || !packageJson) {
  process.exit(1);
}

const ledger = buildLedger({
  generatedAt,
  registry,
  curriculum,
  hardwareProfile,
  parameterLadder
});

const report = buildReport(ledger);
const reportMd = renderReportMarkdown(report);

if (mode === "write") {
  writeJson(paths.ledger, ledger);
  writeJson(paths.reportJson, report);
  writeText(paths.reportMd, reportMd);
  console.log("SEIS language model install/training ledger generated.");
  console.log(JSON.stringify({
    ledger: paths.ledger,
    report: paths.reportJson,
    markdown: paths.reportMd
  }, null, 2));
} else {
  checkJson(paths.ledger, ledger, "install/training ledger");
  checkJson(paths.reportJson, report, "install/training report");
  checkText(paths.reportMd, reportMd, "install/training markdown report");
  validateLedger(ledger, registry, packageJson);
  finish("SEIS language model install/training ledger check passed.");
}

function buildLedger({ generatedAt, registry, curriculum, hardwareProfile, parameterLadder }) {
  const families = (registry.candidateModelFamilies || [])
    .map((family) => ({
      id: family.id,
      displayName: family.displayName,
      source: family.source,
      representativeClasses: family.representativeClasses || [],
      installState: family.installState,
      allowedToday: family.allowedToday,
      trainingUse: family.trainingUse,
      licenseReviewStatus: family.licenseReviewStatus,
      installDecision: "blocked-until-per-model-approval",
      trainingDecision: "blocked-not-authorized",
      allowedLocalActionToday: allowedLocalActionFor(family.id),
      requiredBeforeInstall: registry.requiredBeforeAnyModelInstall || [],
      requiredBeforeTraining: registry.requiredBeforeAnyTraining || [],
      nextSafeStep: nextSafeStepFor(family.id)
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const developerLane = (registry.hardwareInstallLanes || []).find((lane) => lane.id === "developer-16gb") || {};
  const currentTarget = hardwareProfile.currentTarget || {};
  const ladderTargets = Array.isArray(parameterLadder.targets) ? parameterLadder.targets : [];

  return {
    id: "seis-language-model-install-training-ledger",
    version: "2026.07.01",
    generatedAt,
    status: "safety-gated-install-and-training-ledger",
    qualityGate: "npm run check:seis-language-model-install-training-ledger",
    reportCommand: "npm run report:seis-language-model-install-training-ledger",
    truthBoundary: [
      "This ledger plans model intake, install readiness, and training readiness only.",
      "It downloads no model weights.",
      "It installs no language model.",
      "It runs no inference.",
      "It runs no provider call.",
      "It runs no dataset download.",
      "It runs no fine-tune, LoRA, adapter training, or foundation pretraining.",
      "It proves no AGI capability and creates no SEIS-owned foundation model checkpoint."
    ],
    userRequestInterpretation: {
      requestedGoal: "Install all language models and train SEIS AI to be fully knowledgeable.",
      safeInterpretation: "Do not bulk-install everything. Build a gated install/training ledger, then promote one approved model lane at a time with license, hardware, dataset, benchmark, and human-review evidence.",
      knowledgeDefinition: "Tam bilgili SEIS means source-grounded retrieval, clean provenance, evaluation, and safe routing. It does not mean pretending a single model memorized every possible source."
    },
    sourceOfTruth: {
      registry: paths.registry,
      curriculum: paths.curriculum,
      hardwareProfile: paths.hardwareProfile,
      parameterLadder: paths.parameterLadder,
      knowledgeRetrievalTraining: paths.knowledgeRetrievalTraining,
      planScript: "scripts/plan-seis-language-model-install.mjs"
    },
    approvedToday: {
      allModelInstall: false,
      languageModelDownloads: false,
      checkpointHandling: false,
      providerCalls: false,
      datasetDownloads: false,
      retrievalIndexImplementation: false,
      adapterTraining: false,
      fineTuning: false,
      foundationPretraining: false,
      repoLocalSeedModelTraining: true
    },
    operatingPolicy: {
      bulkInstallAllowed: registry.installPolicy?.bulkInstallAllowed === true,
      downloadAuthorized: registry.installPolicy?.downloadAuthorized === true,
      trainingAuthorized: registry.installPolicy?.trainingAuthorized === true,
      adapterTrainingAuthorized: registry.installPolicy?.adapterTrainingAuthorized === true,
      fineTuningAuthorized: registry.installPolicy?.fineTuningAuthorized === true,
      runtimeAuthorityGranted: registry.installPolicy?.runtimeAuthorityGranted === true,
      secretReadAllowed: registry.installPolicy?.secretReadAllowed === true,
      browserSecretAllowed: registry.installPolicy?.browserSecretAllowed === true
    },
    currentHardwareBoundary: {
      laneId: developerLane.id || "developer-16gb",
      ramClass: developerLane.ramClass || "16GB+",
      allowedToday: developerLane.allowedToday || "metadata and deterministic seed-model lab only",
      blockedClasses: developerLane.blockedClasses || [],
      currentTargetParameterClass: currentTarget.parameterClass || "20B",
      currentTargetCompatibilityStatus: currentTarget.compatibilityStatus || "planned-not-validated",
      currentTargetTrainingStatus: currentTarget.trainingStatus || "not-started",
      currentTargetRouteEligibleToday: currentTarget.routeEligibleToday === true,
      currentTargetRuntimeAuthority: currentTarget.runtimeAuthority === true
    },
    modelFamilies: families,
    safeSequence: [
      {
        order: 1,
        id: "metadata-intake",
        status: "active",
        action: "Keep all language-model families metadata-only and run registry validators."
      },
      {
        order: 2,
        id: "hardware-preflight",
        status: "active-not-benchmark",
        action: "Observe local RAM/host profile without claiming compatibility."
      },
      {
        order: 3,
        id: "knowledge-retrieval-contract",
        status: "contract-defined-not-indexed",
        action: "Use the knowledge retrieval training contract to define approved source classes, provenance, and eval gates."
      },
      {
        order: 4,
        id: "knowledge-retrieval-first",
        status: "planned",
        action: "Build SEIS retrieval/knowledge provenance before any fine-tune."
      },
      {
        order: 5,
        id: "single-small-local-pilot",
        status: "approval-required",
        action: "Select exactly one small or quantized local checkpoint after license, checksum, disk, RAM, and rollback review."
      },
      {
        order: 6,
        id: "adapter-experiment",
        status: "blocked",
        action: "Run only after dataset card, model card, eval plan, safety review, and human approval."
      },
      {
        order: 7,
        id: "20b-compatibility-benchmark",
        status: "planned-not-validated",
        action: "Benchmark a selected quantized 20B candidate before any router eligibility claim."
      },
      {
        order: 8,
        id: "frontier-scale-research",
        status: "disabled",
        action: "70B, 150B, 300B+, 512B, and higher classes stay disabled until lower gates produce real evidence."
      }
    ],
    allowedTrainingNow: [
      {
        id: "repo-local-seed-models",
        command: "npm run automation:seis-ai-workforce-training",
        meaning: "Rebuild deterministic SEIS-owned seed artifacts for policy, memory ranking, eval criticism, and routing.",
        foundationModelTraining: false,
        runtimeAuthority: false
      }
    ],
    blockedTrainingNow: [
      "retrieval embedding model install",
      "LoRA or adapter training",
      "full fine-tune",
      "foundation pretraining",
      "20B live inference",
      "70B/150B/512B route eligibility",
      "public AGI claim"
    ],
    publicClaims: {
      canClaimAllModelsInstalled: false,
      canClaimSEISTrainedFoundationModel: false,
      canClaim20BRouteable: false,
      canClaim512BOrAGI: false,
      canClaimFullyKnowledgeableModel: false,
      canClaimKnowledgeProgramDefined: true
    },
    ladderSnapshot: ladderTargets.map((target) => ({
      id: target.id,
      status: target.status,
      routeEligibleToday: target.routeEligibleToday === true
    })),
    evidenceArtifacts: [
      paths.registry,
      paths.curriculum,
      paths.hardwareProfile,
      paths.parameterLadder,
      paths.ledger,
      paths.reportJson,
      paths.reportMd,
      paths.knowledgeRetrievalTraining
    ]
  };
}

function buildReport(ledger) {
  const blockedFamilies = ledger.modelFamilies.filter((family) => family.installDecision !== "ready");
  return {
    id: "seis-language-model-install-training-ledger-report",
    generatedAt: ledger.generatedAt,
    status: "blocked-for-live-install-safe-for-planning",
    sourceLedger: paths.ledger,
    summary: {
      candidateFamilyCount: ledger.modelFamilies.length,
      blockedInstallFamilyCount: blockedFamilies.length,
      allModelInstall: ledger.approvedToday.allModelInstall,
      languageModelDownloads: ledger.approvedToday.languageModelDownloads,
      foundationPretraining: ledger.approvedToday.foundationPretraining,
      repoLocalSeedModelTraining: ledger.approvedToday.repoLocalSeedModelTraining
    },
    safeNextCommands: [
      "npm run check:seis-language-model-intake",
      "npm run plan:seis-language-model-install -- --json",
      "npm run inspect:seis-model-local-hardware",
      "npm run automation:seis-ai-workforce-training",
      "npm run check:seis-ai-workforce-training"
    ],
    humanApprovalNeededBefore: [
      "any model download",
      "any checkpoint handling",
      "any dataset download",
      "any adapter, LoRA, fine-tune, or foundation pretraining",
      "any provider call with repository data",
      "any route eligibility claim",
      "any public AGI or trained-model claim"
    ],
    families: ledger.modelFamilies.map((family) => ({
      id: family.id,
      displayName: family.displayName,
      installDecision: family.installDecision,
      trainingDecision: family.trainingDecision,
      allowedLocalActionToday: family.allowedLocalActionToday,
      nextSafeStep: family.nextSafeStep
    }))
  };
}

function allowedLocalActionFor(familyId) {
  if (familyId === "embedding-and-reranker") {
    return "metadata-only plus retrieval architecture planning";
  }
  if (familyId === "code-specialist") {
    return "metadata-only plus clean-room code-assistant evaluation planning";
  }
  return "metadata-only plus license/hardware review planning";
}

function nextSafeStepFor(familyId) {
  if (familyId === "embedding-and-reranker") {
    return "Prepare a provenance-safe local retrieval pilot without downloading a checkpoint yet.";
  }
  if (familyId === "code-specialist") {
    return "Prepare a code-eval fixture and security checks before selecting a coding checkpoint.";
  }
  return "Keep candidate metadata only until a single model id, license, quantization, checksum, and rollback plan are approved.";
}

function validateLedger(ledger, registry, packageJson) {
  ensure(ledger.id === "seis-language-model-install-training-ledger", "ledger id mismatch");
  ensure(ledger.status === "safety-gated-install-and-training-ledger", "ledger status mismatch");
  ensure(ledger.qualityGate === "npm run check:seis-language-model-install-training-ledger", "ledger qualityGate mismatch");
  ensure(ledger.reportCommand === "npm run report:seis-language-model-install-training-ledger", "ledger reportCommand mismatch");

  for (const phrase of [
    "downloads no model weights",
    "installs no language model",
    "runs no inference",
    "runs no provider call",
    "runs no dataset download",
    "foundation pretraining"
  ]) {
    ensure(ledger.truthBoundary.some((item) => item.includes(phrase)), `truth boundary missing: ${phrase}`);
  }

  for (const [field, expected] of Object.entries({
    allModelInstall: false,
    languageModelDownloads: false,
    checkpointHandling: false,
    providerCalls: false,
    datasetDownloads: false,
    adapterTraining: false,
    fineTuning: false,
    foundationPretraining: false,
    repoLocalSeedModelTraining: true
  })) {
    ensure(ledger.approvedToday?.[field] === expected, `approvedToday.${field} must be ${expected}`);
  }

  for (const [field, expected] of Object.entries({
    bulkInstallAllowed: false,
    downloadAuthorized: false,
    trainingAuthorized: false,
    adapterTrainingAuthorized: false,
    fineTuningAuthorized: false,
    runtimeAuthorityGranted: false,
    secretReadAllowed: false,
    browserSecretAllowed: false
  })) {
    ensure(ledger.operatingPolicy?.[field] === expected, `operatingPolicy.${field} must be ${expected}`);
  }

  const registryFamilies = new Set((registry.candidateModelFamilies || []).map((family) => family.id));
  const ledgerFamilies = new Map((ledger.modelFamilies || []).map((family) => [family.id, family]));
  ensure(ledgerFamilies.size === registryFamilies.size, "ledger must cover every registry family exactly once");
  for (const familyId of registryFamilies) {
    const family = ledgerFamilies.get(familyId);
    ensure(Boolean(family), `ledger missing family ${familyId}`);
    if (!family) continue;
    ensure(family.installDecision === "blocked-until-per-model-approval", `${familyId}: install must be approval-blocked`);
    ensure(family.trainingDecision === "blocked-not-authorized", `${familyId}: training must be blocked`);
    ensure(Array.isArray(family.requiredBeforeInstall) && family.requiredBeforeInstall.length > 0, `${familyId}: install requirements missing`);
    ensure(Array.isArray(family.requiredBeforeTraining) && family.requiredBeforeTraining.length > 0, `${familyId}: training requirements missing`);
  }

  ensure(ledger.currentHardwareBoundary?.ramClass === "16GB+", "ledger must preserve 16GB+ hardware floor");
  ensure(ledger.currentHardwareBoundary?.currentTargetCompatibilityStatus === "planned-not-validated", "20B compatibility must remain unvalidated");
  ensure(ledger.currentHardwareBoundary?.currentTargetRouteEligibleToday === false, "20B route eligibility must remain false");
  ensure(ledger.currentHardwareBoundary?.currentTargetRuntimeAuthority === false, "runtime authority must remain false");
  ensure((ledger.currentHardwareBoundary?.blockedClasses || []).includes("512B"), "16GB lane must block 512B");

  ensure(ledger.safeSequence.some((step) => step.id === "single-small-local-pilot" && step.status === "approval-required"), "safe sequence must require approval for local pilot");
  ensure(ledger.safeSequence.some((step) => step.id === "knowledge-retrieval-contract" && step.status === "contract-defined-not-indexed"), "safe sequence must include knowledge retrieval contract");
  ensure(ledger.safeSequence.some((step) => step.id === "frontier-scale-research" && step.status === "disabled"), "frontier scale must stay disabled");
  ensure(ledger.allowedTrainingNow.length === 1, "only one training lane should be allowed now");
  ensure(ledger.allowedTrainingNow[0]?.id === "repo-local-seed-models", "only repo-local seed models can be allowed now");

  for (const [field, expected] of Object.entries({
    canClaimAllModelsInstalled: false,
    canClaimSEISTrainedFoundationModel: false,
    canClaim20BRouteable: false,
    canClaim512BOrAGI: false,
    canClaimFullyKnowledgeableModel: false,
    canClaimKnowledgeProgramDefined: true
  })) {
    ensure(ledger.publicClaims?.[field] === expected, `publicClaims.${field} must be ${expected}`);
  }

  ensure(
    packageJson.scripts?.["check:seis-language-model-install-training-ledger"] === "node scripts/create-seis-language-model-install-training-ledger.mjs",
    "package.json must expose check:seis-language-model-install-training-ledger"
  );
  ensure(
    packageJson.scripts?.["report:seis-language-model-install-training-ledger"] === "node scripts/create-seis-language-model-install-training-ledger.mjs --write",
    "package.json must expose report:seis-language-model-install-training-ledger"
  );
}

function renderReportMarkdown(report) {
  const rows = report.families
    .map((family) => `| ${family.id} | ${family.installDecision} | ${family.trainingDecision} | ${family.allowedLocalActionToday} |`)
    .join("\n");

  const commands = report.safeNextCommands.map((command) => `- \`${command}\``).join("\n");
  const approvals = report.humanApprovalNeededBefore.map((item) => `- ${item}`).join("\n");

  return `# SEIS Language Model Install and Training Ledger

Generated: ${report.generatedAt}

Status: ${report.status}

## Summary

| Field | Value |
| --- | --- |
| Candidate families | ${report.summary.candidateFamilyCount} |
| Blocked installs | ${report.summary.blockedInstallFamilyCount} |
| All-model install approved | ${String(report.summary.allModelInstall)} |
| Language model downloads approved | ${String(report.summary.languageModelDownloads)} |
| Foundation pretraining approved | ${String(report.summary.foundationPretraining)} |
| Repo-local seed training approved | ${String(report.summary.repoLocalSeedModelTraining)} |

## Family Decisions

| Family | Install decision | Training decision | Allowed local action today |
| --- | --- | --- | --- |
${rows}

## Safe Next Commands

${commands}

## Human Approval Needed Before

${approvals}
`;
}

function readJson(relativePath, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return null;
  }

  try {
    return JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readOptionalJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return null;
  try {
    return JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, value);
}

function checkJson(relativePath, expected, label) {
  const actual = readJson(relativePath, label);
  if (!actual) return;

  const actualJson = JSON.stringify(actual, null, 2);
  const expectedJson = JSON.stringify(expected, null, 2);
  if (actualJson !== expectedJson) {
    failures.push(`${label} is stale. Run npm run report:seis-language-model-install-training-ledger.`);
  }
}

function checkText(relativePath, expected, label) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }

  const actual = readFileSync(absolutePath, "utf8");
  if (actual !== expected) {
    failures.push(`${label} is stale. Run npm run report:seis-language-model-install-training-ledger.`);
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS language model install/training ledger check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
