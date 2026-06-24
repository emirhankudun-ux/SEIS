#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const outputPath = "reports/seis-model-scaling/20b-benchmark-dry-run.json";
const paths = {
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json",
  modelCardTemplate: "content/development/seis-20b-model-card-template.json",
  datasetCardTemplate: "content/development/seis-20b-dataset-card-template.json",
  hostHardwarePreflight: "scripts/inspect-seis-model-local-hardware.mjs"
};
const failures = [];

const report = buildReport();
validateReport(report);

if (failures.length) {
  console.error("SEIS 20B benchmark dry-run failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (args.has("--write")) {
  writeJson(outputPath, report);
  console.log(`SEIS 20B benchmark dry-run written: ${outputPath}`);
} else if (args.has("--check")) {
  const existing = readJson(outputPath, "20B benchmark dry-run report");
  if (!existing) process.exit(1);
  const expected = stableStringify(report);
  const actual = stableStringify(existing);
  if (expected !== actual) {
    console.error(`SEIS 20B benchmark dry-run report is stale: ${outputPath}`);
    console.error("Run: npm run automation:seis-20b-benchmark-dry-run");
    process.exit(1);
  }
  console.log("SEIS 20B benchmark dry-run check passed.");
} else {
  console.log(stableStringify(report));
}

function buildReport() {
  const profile = readJson(paths.profile, "model scaling profile");
  const benchmarkManifest = readJson(paths.benchmarkManifest, "20B benchmark manifest");
  const modelCardTemplate = readJson(paths.modelCardTemplate, "20B model card template");
  const datasetCardTemplate = readJson(paths.datasetCardTemplate, "20B dataset card template");

  const currentTarget = profile?.currentTarget || {};
  const memoryBudget = profile?.memoryBudgetContract || {};

  return {
    id: "seis-20b-benchmark-dry-run",
    version: "2026.06.24",
    status: "dry-run-not-measured",
    targetId: "seis-20b-local-compatibility-target",
    parameterClass: "20B",
    targetRamClass: "16GB+ RAM",
    outputPath,
    generatedBy: "scripts/create-seis-20b-benchmark-dry-run.mjs",
    purpose: "Verify that SEIS has a complete non-executing benchmark preparation contract before any future 20B local compatibility benchmark can be requested.",
    truthBoundary: "Dry-run report only. It does not download a model, download a dataset, run inference, train, fine-tune, benchmark memory, call providers, execute SSH, deploy infrastructure, publish weights, or make 20B/70B/150B route eligibility claims.",
    sourceOfTruth: {
      modelScalingProfile: paths.profile,
      benchmarkManifestTemplate: paths.benchmarkManifest,
      modelCardTemplate: paths.modelCardTemplate,
      datasetCardTemplate: paths.datasetCardTemplate,
      hostHardwarePreflight: paths.hostHardwarePreflight
    },
    sourceStatuses: {
      profileStatus: profile?.status || "missing",
      targetCompatibilityStatus: currentTarget.compatibilityStatus || "missing",
      targetTrainingStatus: currentTarget.trainingStatus || "missing",
      benchmarkManifestStatus: benchmarkManifest?.status || "missing",
      benchmarkCompatibilityClaim: benchmarkManifest?.compatibilityClaim || "missing",
      modelCardStatus: modelCardTemplate?.status || "missing",
      datasetCardStatus: datasetCardTemplate?.status || "missing",
      memoryBudgetStatus: memoryBudget.status || "missing"
    },
    dryRunResult: {
      canRequestRealBenchmarkToday: false,
      routeEligibleToday: false,
      runtimeAuthority: false,
      productionReady: false,
      measuredBenchmark: false,
      modelCompatibilityVerified: false,
      modelDownloadAuthorized: false,
      datasetDownloadAuthorized: false,
      trainingAuthorized: false,
      fineTuningAuthorized: false,
      providerCallAuthorized: false,
      sshAuthorized: false,
      deploymentAuthorized: false
    },
    readinessGates: [
      {
        id: "model-artifact-review",
        status: "blocked",
        requiredEvidence: "Filled and reviewed model card with artifact id, license, clean-room provenance, quantization, safety notes, and benchmark reference."
      },
      {
        id: "dataset-provenance-review",
        status: "blocked",
        requiredEvidence: "Filled and reviewed dataset card with source inventory, license map, rights review, privacy review, PII/secret scan, and split plan."
      },
      {
        id: "runtime-adapter-approval",
        status: "blocked",
        requiredEvidence: "Human-approved local-only runtime adapter with no provider key, no SSH, no deployment, and safe fallback behavior."
      },
      {
        id: "host-preflight",
        status: "available-not-sufficient",
        requiredEvidence: "Optional host RAM preflight may observe RAM class but cannot prove 20B compatibility."
      },
      {
        id: "measured-memory-benchmark",
        status: "blocked",
        requiredEvidence: "Peak resident memory, KV-cache memory, OS pressure, context length, tokens per second, local fallback, redacted logs, and human reviewer."
      }
    ],
    requiredBeforeRealBenchmark: [
      "explicit human approval for model artifact selection",
      "explicit human approval for local runtime adapter setup",
      "completed 20B model card",
      "completed 20B dataset card or benchmark-data card",
      "secret scan and redaction plan",
      "local-only fallback plan",
      "measurement command that cannot upload prompts, files, logs, or repo data to providers",
      "rollback plan for failed or memory-exhausting benchmark run"
    ],
    forbiddenClaims: [
      "SEIS has trained a 20B foundation model.",
      "SEIS has downloaded 20B weights.",
      "SEIS has run 20B inference.",
      "SEIS has benchmarked 20B memory usage.",
      "SEIS has verified 16GB+ compatibility.",
      "SEIS can route to 20B, 70B, or 150B models today."
    ],
    nextSafeActions: [
      "Keep this dry-run report synchronized with the model scaling profile.",
      "Keep Command Center route eligibility blocked.",
      "Only after human approval, fill model and dataset cards before any real benchmark runner is introduced.",
      "Treat 70B and 150B as research lanes until 20B evidence exists."
    ]
  };
}

function validateReport(candidate) {
  ensure(candidate.id === "seis-20b-benchmark-dry-run", "report id mismatch");
  ensure(candidate.status === "dry-run-not-measured", "status must remain dry-run-not-measured");
  ensure(candidate.targetId === "seis-20b-local-compatibility-target", "target id mismatch");
  ensure(candidate.parameterClass === "20B", "parameter class must stay 20B");
  ensure(candidate.targetRamClass === "16GB+ RAM", "target RAM class mismatch");
  ensure(candidate.outputPath === outputPath, "outputPath mismatch");
  ensure(String(candidate.truthBoundary || "").includes("does not download a model"), "truth boundary must forbid model downloads");
  ensure(String(candidate.truthBoundary || "").includes("benchmark memory"), "truth boundary must state no memory benchmark is run");
  ensure(candidate.sourceStatuses.profileStatus === "planned-compatibility-contract", "profile status mismatch");
  ensure(candidate.sourceStatuses.targetCompatibilityStatus === "planned-not-validated", "20B target must remain planned-not-validated");
  ensure(candidate.sourceStatuses.targetTrainingStatus === "not-started", "20B training must remain not-started");
  ensure(candidate.sourceStatuses.benchmarkManifestStatus === "template-not-measured", "benchmark manifest must stay template-not-measured");
  ensure(candidate.sourceStatuses.benchmarkCompatibilityClaim === "not-verified", "benchmark compatibility claim must stay not-verified");
  ensure(candidate.sourceStatuses.modelCardStatus === "template-not-filled", "model card must stay template-not-filled");
  ensure(candidate.sourceStatuses.datasetCardStatus === "template-not-filled", "dataset card must stay template-not-filled");
  ensure(candidate.sourceStatuses.memoryBudgetStatus === "planning-estimate-not-benchmark-evidence", "memory budget status mismatch");

  for (const [key, value] of Object.entries(candidate.dryRunResult || {})) {
    ensure(value === false, `dryRunResult.${key} must remain false`);
  }

  ensure(Array.isArray(candidate.readinessGates) && candidate.readinessGates.length >= 5, "readinessGates must include benchmark blockers");
  ensure(candidate.readinessGates.some((gate) => gate.id === "host-preflight" && gate.status === "available-not-sufficient"), "host preflight must remain insufficient for benchmark claims");
  ensure(candidate.readinessGates.some((gate) => gate.id === "measured-memory-benchmark" && gate.status === "blocked"), "measured memory benchmark gate must remain blocked");
  ensure(candidate.requiredBeforeRealBenchmark.includes("completed 20B model card"), "real benchmark prerequisites must require model card");
  ensure(candidate.requiredBeforeRealBenchmark.includes("completed 20B dataset card or benchmark-data card"), "real benchmark prerequisites must require dataset card");
  ensure(candidate.forbiddenClaims.includes("SEIS has verified 16GB+ compatibility."), "forbidden claims must block compatibility claims");
}

function readJson(relativePath, label) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function writeJson(relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${stableStringify(value)}\n`);
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}`;
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
