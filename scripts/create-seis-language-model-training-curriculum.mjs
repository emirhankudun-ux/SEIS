#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const paths = {
  registry: "content/development/seis-language-model-intake-registry.json",
  workforcePlan: "content/development/seis-ai-workforce-training-plan.json",
  scalingProfile: "content/development/seis-model-scaling-hardware-profile.json",
  parameterLadder: "content/development/seis-model-parameter-ladder.json",
  curriculumArtifactPath: "content/development/seis-language-model-training-curriculum.json",
  curriculumReportPath: "reports/seis-model-scaling/seis-language-model-training-curriculum.json",
  curriculumReportMarkdownPath: "reports/seis-model-scaling/seis-language-model-training-curriculum.md"
};

const existingCurriculum = mode === "check" ? readOptionalJson(paths.curriculumArtifactPath) : null;
const generatedAt = mode === "check" && existingCurriculum?.generatedAt ? existingCurriculum.generatedAt : new Date().toISOString();
const registry = readJson(paths.registry);
const workforcePlan = readJson(paths.workforcePlan);
const scalingProfile = readJson(paths.scalingProfile);
const parameterLadder = readJson(paths.parameterLadder);

if (!registry || !workforcePlan || !scalingProfile || !parameterLadder) {
  process.exit(1);
}

const curriculum = buildCurriculum({
  generatedAt,
  registry,
  workforcePlan,
  scalingProfile,
  parameterLadder
});

if (mode === "write") {
  writeJson(paths.curriculumArtifactPath, curriculum);
  writeJson(paths.curriculumReportPath, curriculum.report);
  writeText(paths.curriculumReportMarkdownPath, renderReportMarkdown(curriculum.report));

  console.log("SEIS language model training curriculum generated.");
  console.log(JSON.stringify({ path: paths.curriculumArtifactPath, status: "ok" }, null, 2));
} else {
  checkJson(paths.curriculumArtifactPath, curriculum, "curriculum contract");
  checkJson(paths.curriculumReportPath, curriculum.report, "curriculum report");
  checkText(paths.curriculumReportMarkdownPath, renderReportMarkdown(curriculum.report), "curriculum markdown report");
  ensure(curriculum.status === "planned-training-contract", "curriculum status mismatch");
  ensure(curriculum.truthBoundary.includes("No cloud or local model training is executed by this process."), "truth boundary must block training execution");
  ensure(curriculum.scalingTargets.some((target) => target.id === "512B" && target.allowedRoute === false), "512B target must stay route-blocked");
  ensure(curriculum.safeControls.includes("No foundation pretraining"), "safe controls must block foundation pretraining");
  finish("SEIS language model training curriculum check passed.");
}

function buildCurriculum({ generatedAt, registry, workforcePlan, scalingProfile, parameterLadder }) {
  const families = (registry.candidateModelFamilies || []).map((family) => ({
    id: family.id,
    displayName: family.displayName,
    source: family.source,
    representativeClasses: family.representativeClasses || [],
    allowedToday: family.allowedToday,
    installState: family.installState,
    trainingUse: family.trainingUse,
    licenseReviewStatus: family.licenseReviewStatus,
    safetyNotes: family.notes || [],
    gate: {
      trainingLane: inferTrainingLane(family.id, registry.trainingLanes || []),
      readiness: inferReadiness(family.allowedToday, family.trainingUse, family.installState)
    },
    preconditionsForAnyInstall: registry.requiredBeforeAnyModelInstall || []
  }));

  const sortedFamilies = families.sort((a, b) => a.id.localeCompare(b.id));

  const trainingLanes = (registry.trainingLanes || []).map((lane) => ({
    id: lane.id,
    status: lane.status,
    allowedToday: lane.allowedToday,
    foundationModelTraining: lane.foundationModelTraining,
    meaning: lane.meaning
  }));

  const hardwareLanes = (registry.hardwareInstallLanes || []).map((lane) => ({
    id: lane.id,
    ramClass: lane.ramClass,
    allowedToday: lane.allowedToday,
    blockedClasses: lane.blockedClasses || [],
    candidateModelClass: lane.candidateModelClass
  }));

  const scalingTargets = buildScalingTargets(scalingProfile, parameterLadder);

  const curriculumPlan = [
    {
      phase: "metadata-intake",
      purpose: "Evaluate candidate families without download, install, or live provider routing.",
      commands: ["npm run check:seis-language-model-intake", "npm run check:seis-ai-workforce-training"],
      status: "active"
    },
    {
      phase: "fleet-readiness-contracts",
      purpose: "Keep runway safe: model cards, dataset cards, benchmark contracts, approval gates.",
      commands: [
        "npm run check:seis-model-scaling-hardware-profile",
        "npm run check:seis-model-parameter-ladder",
        "npm run check:seis-language-model-intake"
      ],
      status: "active"
    },
    {
      phase: "local-seed-rebuild",
      purpose: "Rebuild deterministic local seed artifacts for policy, memory ranker, eval critic, and routing.",
      commands: ["npm run automation:seis-ai-workforce-training", "npm run check:seis-ai-workforce-training"],
      status: "active"
    },
    {
      phase: "human-reviewed-readiness",
      purpose: "Produce measurable approvals before any model training or benchmark execution.",
      commands: [
        "npm run automation:seis-20b-benchmark-dry-run",
        "npm run check:seis-20b-benchmark-dry-run"
      ],
      status: "planning"
    }
  ];

  const report = {
    id: "seis-language-model-training-curriculum",
    version: workforcePlan.version || "2026.06.24",
    generatedAt,
    status: "planned-training-contract",
    truthBoundary: [
      "Language model training curriculum is planning-only.",
      "No model is installed, downloaded, or imported as a claim from this artifact.",
      "No cloud or local model training is executed by this process.",
      "No provider keys are read from prompts, datasets, logs, or generated artifacts.",
      "No benchmark is executed by this process."
    ],
    sourceOfTruth: {
      registry: paths.registry,
      workforcePlan: paths.workforcePlan,
      modelScalingHardwareProfile: paths.scalingProfile,
      modelParameterLadder: paths.parameterLadder
    },
    targetHardwareFloor: "16GB+ RAM (development floor)",
    familyCandidates: sortedFamilies,
    trainingLanes,
    hardwareLanes,
    scalingTargets,
    curriculum: curriculumPlan,
    safeControls: [
      "No bulk install",
      "No checkpoint download",
      "No foundation pretraining",
      "No provider call authorization",
      "No dataset download",
      "No fine-tuning",
      "No adapter training in current contract",
      "Local-seed model only"
    ],
    nextApprovalNeeded: [
      "Model class and lane must pass explicit human approval before any install step.",
      "License and checksum review must be complete before any checkpoint handling.",
      "Dataset card and model card completion needed before any retrieval/adapter proposal.",
      "Observed benchmark evidence needed before any route eligibility changes."
    ],
    evidenceArtifacts: [
      "content/development/seis-language-model-intake-registry.json",
      "content/development/seis-ai-workforce-training-plan.json",
      "content/development/seis-model-scaling-hardware-profile.json",
      "content/development/seis-model-parameter-ladder.json",
      "reports/seis-model-scaling/20b-benchmark-dry-run.json",
      "reports/seis-ai-workforce-training/latest.json",
      "reports/seis-ai-workforce-training/latest.md"
    ],
    commandArtifacts: {
      contract: paths.curriculumArtifactPath,
      report: paths.curriculumReportPath,
      reportMarkdown: paths.curriculumReportMarkdownPath
    }
  };

  return {
    ...report,
    report
  };
}

function buildScalingTargets(scalingProfile, parameterLadder) {
  const currentTarget = scalingProfile.currentTarget || {};
  const frontierTarget = scalingProfile.frontierTarget || {};
  const apexTarget = scalingProfile.apexTarget || {};
  const ladderTargets = Array.isArray(parameterLadder.targets) ? parameterLadder.targets : [];

  return [
    {
      id: "20B",
      source: "content/development/seis-model-scaling-hardware-profile.json",
      status: currentTarget.compatibilityStatus || "planned-not-validated",
      allowedRoute: currentTarget.routeEligibleToday ?? false,
      trainingStatus: currentTarget.trainingStatus || "not-started",
      runtimeAuthority: currentTarget.runtimeAuthority || false,
      weightsAvailable: currentTarget.weightsAvailable || false,
      inferenceAvailable: currentTarget.inferenceAvailable || false,
      benchmarkEvidenceAvailable: currentTarget.benchmarkEvidenceAvailable || false,
      gate: "No measured benchmark yet, no local inference claim."
    },
    {
      id: "70B",
      source: "content/development/seis-model-parameter-ladder.json",
      status: ladderTargets.find((target) => target.id === "seis-70b-research-lane")?.status || "research-roadmap",
      allowedRoute: false,
      trainingStatus: "not-started",
      runtimeAuthority: false,
      gate: "Research lane; blocked for routeability."
    },
    {
      id: "150B",
      source: "content/development/seis-model-scaling-hardware-profile.json",
      status: frontierTarget.compatibilityStatus || "not-scoped",
      allowedRoute: false,
      trainingStatus: frontierTarget.trainingStatus || "not-started",
      runtimeAuthority: frontierTarget.runtimeAuthority || false,
      gate: "Frontier pretraining remains plan-only and gated."
    },
    {
      id: "512B",
      source: "content/development/seis-model-scaling-hardware-profile.json",
      status: apexTarget.compatibilityStatus || "not-scoped",
      allowedRoute: false,
      trainingStatus: apexTarget.trainingStatus || "not-started",
      runtimeAuthority: apexTarget.runtimeAuthority || false,
      gate: "Apex lane is plan-only and gated by policy, safety, and approval."
    }
  ];
}

function inferTrainingLane(familyId, trainingLanes) {
  const map = new Map((trainingLanes || []).map((lane) => [lane.id, lane]));
  const active = map.get("repo-local-seed-models");
  if (!active || !active.allowedToday) {
    return "none";
  }

  if (familyId === "embedding-and-reranker") return "retrieval-knowledge-layer";
  if (familyId === "code-specialist") return "lora-or-adapter-experiment";
  return "repo-local-seed-models";
}

function inferReadiness(allowedToday, trainingUse, installState) {
  if (allowedToday === "metadata-only" && trainingUse === "not-authorized" && installState === "not-installed-by-registry") {
    return "metadata-plan-blocked";
  }
  if (allowedToday && trainingUse === "not-authorized") {
    return "blocked-by-policy";
  }
  return "requires-review";
}

function renderReportMarkdown(report) {
  const familyRows = report.familyCandidates
    .map((family) => `| ${family.id} | ${family.displayName} | ${family.allowedToday} | ${family.trainingUse} | ${family.installState} |`)
    .join("\n");

  const laneRows = report.trainingLanes
    .map((lane) => `| ${lane.id} | ${lane.status} | ${String(lane.allowedToday)} | ${String(lane.foundationModelTraining)} |`)
    .join("\n");

  return `# SEIS Language Model Training Curriculum

Generated: ${report.generatedAt}

## Hedef ve Kısıt

Bu curriculum, tüm aday dil modeli aileleri için güvenli yol haritası üretir.
Gerçek yükleme, eğitim veya dış provider çağrısı yapılmaz.

## Dil Ailesi Adayları

| Family ID | Display Name | Allowed Today | Training Use | Install State |
| --- | --- | --- | --- | --- |
${familyRows}

## Eğitim Yol Şeritleri

| Lane ID | Status | Allowed Today | Foundation Training |
| --- | --- | --- | --- |
${laneRows}

## Ölçek Hedefleri

- 20B: ${report.scalingTargets.find((target) => target.id === "20B")?.status}
- 70B: ${report.scalingTargets.find((target) => target.id === "70B")?.status}
- 150B: ${report.scalingTargets.find((target) => target.id === "150B")?.status}
- 512B: ${report.scalingTargets.find((target) => target.id === "512B")?.status}

## Eğitim Aşamaları

${report.curriculum
  .map((step, index) => `- ${index + 1}. **${step.phase}** — ${step.purpose}`)
  .join("\n")}

## Güvenli Yol Haritası

${report.nextApprovalNeeded.map((item) => `- ${item}`).join("\n")}
`;
}

function writeJson(relativePath, value) {
  const filePath = path.join(root, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const filePath = path.join(root, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, value);
}

function checkJson(relativePath, expected, label) {
  const actual = readOptionalJson(relativePath);
  if (!actual) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actualText = `${JSON.stringify(actual, null, 2)}\n`;
  const expectedText = `${JSON.stringify(expected, null, 2)}\n`;
  if (actualText !== expectedText) failures.push(`${label} stale: ${relativePath}`);
}

function checkText(relativePath, expected, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(filePath, "utf8");
  if (actual !== expected) failures.push(`${label} stale: ${relativePath}`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(message) {
  if (failures.length) {
    console.error("SEIS language model training curriculum check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(message);
}

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Cannot read ${relativePath}: ${error.message}`);
    return null;
  }
}

function readOptionalJson(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`Cannot parse ${relativePath}: ${error.message}`);
    return null;
  }
}
