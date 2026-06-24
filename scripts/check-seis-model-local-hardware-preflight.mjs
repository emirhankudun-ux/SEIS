#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const paths = {
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json",
  benchmarkDryRun: "reports/seis-model-scaling/20b-benchmark-dry-run.json",
  modelCardTemplate: "content/development/seis-20b-model-card-template.json",
  datasetCardTemplate: "content/development/seis-20b-dataset-card-template.json",
  inspector: "scripts/inspect-seis-model-local-hardware.mjs",
  localHardwarePreflightCheck: "scripts/check-seis-model-local-hardware-preflight.mjs"
};

const failures = [];

const profile = readJson(paths.profile, "model scaling profile");
const benchmarkManifest = readJson(paths.benchmarkManifest, "20B benchmark manifest");
const benchmarkDryRun = readJson(paths.benchmarkDryRun, "20B benchmark dry-run");
const modelCardTemplate = readJson(paths.modelCardTemplate, "20B model card template");
const datasetCardTemplate = readJson(paths.datasetCardTemplate, "20B dataset card template");
const hostPreflight = runHostPreflight();

validateProfile(profile);
validateBenchmarkManifest(benchmarkManifest);
validateDryRun(benchmarkDryRun);
validateCards(modelCardTemplate, datasetCardTemplate);
validateHostPreflight(hostPreflight);

if (failures.length) {
  console.error("SEIS model local hardware preflight check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS model local hardware preflight contract check passed.");

function validateProfile(candidate) {
  ensure(candidate?.id === "seis-model-scaling-hardware-profile", "profile id mismatch");
  ensure(candidate?.status === "planned-compatibility-contract", "profile status must stay planned-compatibility-contract");
  ensure(candidate?.currentTarget?.parameterClass === "20B", "current target must remain 20B");
  ensure(candidate?.currentTarget?.minimumSystemRamGb === 16, "current target minimum RAM must remain 16GB");
  ensure(candidate?.currentTarget?.compatibilityStatus === "planned-not-validated", "20B compatibility must remain planned-not-validated");
  ensure(candidate?.currentTarget?.weightsAvailable === false, "20B weights must remain unavailable");
  ensure(candidate?.currentTarget?.inferenceAvailable === false, "20B inference must remain unavailable");
  ensure(candidate?.currentTarget?.runtimeAuthority === false, "20B runtime authority must remain false");
  ensure(candidate?.memoryBudgetContract?.compatibilityClaim === "not-verified", "memory budget compatibility claim must remain not-verified");
  ensure(candidate?.memoryBudgetContract?.status === "planning-estimate-not-benchmark-evidence", "memory budget must remain planning-only");
  ensure(candidate?.routerPolicy?.blockedToday?.includes("20B live inference"), "router policy must block 20B live inference");
  ensure(candidate?.forbiddenClaims?.includes("Do not mark 16GB+ compatibility as verified before benchmark evidence exists."), "profile must forbid unverified 16GB+ compatibility claims");
}

function validateBenchmarkManifest(candidate) {
  ensure(candidate?.id === "seis-20b-16gb-memory-benchmark", "benchmark manifest id mismatch");
  ensure(candidate?.status === "template-not-measured", "benchmark manifest must remain template-not-measured");
  ensure(candidate?.compatibilityClaim === "not-verified", "benchmark compatibility claim must remain not-verified");
  ensure(candidate?.benchmarkEvidenceAvailable === false, "benchmark evidence must remain unavailable");
  ensure(candidate?.routeEligibleToday === false, "benchmark manifest must not grant route eligibility");
  ensure(candidate?.runtimeAuthority === false, "benchmark manifest must not grant runtime authority");
  ensure(candidate?.measurementTemplate?.machineRamGb === null, "benchmark template must not contain measured machine RAM");
  ensure(candidate?.measurementTemplate?.peakResidentMemoryGb === null, "benchmark template must not contain measured peak memory");
  ensure(candidate?.measurementTemplate?.tokensPerSecond === null, "benchmark template must not contain throughput measurements");
  ensure(candidate?.forbiddenInCompletedManifest?.includes("provider keys"), "benchmark manifest must forbid provider keys");
  ensure(candidate?.nonClaims?.includes("SEIS has not verified 16GB+ compatibility."), "benchmark manifest must preserve non-claim for 16GB+ compatibility");
}

function validateDryRun(candidate) {
  ensure(candidate?.id === "seis-20b-benchmark-dry-run", "dry-run id mismatch");
  ensure(candidate?.status === "dry-run-not-measured", "dry-run must remain dry-run-not-measured");
  ensure(candidate?.sourceOfTruth?.hostHardwarePreflight === paths.inspector, "dry-run must reference the host hardware preflight inspector");
  ensure(candidate?.sourceOfTruth?.localHardwarePreflightCheck === paths.localHardwarePreflightCheck, "dry-run must reference the local hardware preflight check");
  ensure(candidate?.dryRunResult?.canRequestRealBenchmarkToday === false, "dry-run must block real benchmark request");
  ensure(candidate?.dryRunResult?.modelCompatibilityVerified === false, "dry-run must not verify model compatibility");
  ensure(candidate?.dryRunResult?.measuredBenchmark === false, "dry-run must not claim measured benchmark");
  ensure(candidate?.dryRunResult?.routeEligibleToday === false, "dry-run must keep route eligibility blocked");
  ensure(candidate?.readinessGates?.some((gate) => gate.id === "host-preflight" && gate.status === "available-not-sufficient"), "dry-run must keep host preflight insufficient");
  ensure(candidate?.forbiddenClaims?.includes("SEIS has verified 16GB+ compatibility."), "dry-run must forbid verified compatibility claims");
}

function validateCards(modelCard, datasetCard) {
  ensure(modelCard?.status === "template-not-filled", "model card must remain template-not-filled");
  ensure(modelCard?.parameterClass === "20B", "model card parameter class must remain 20B");
  ensure(modelCard?.weightsAvailable === false, "model card must not expose weights");
  ensure(modelCard?.benchmarkEvidenceAvailable === false, "model card must not claim benchmark evidence");
  ensure(modelCard?.routeEligibleToday === false, "model card must not grant route eligibility");
  ensure(modelCard?.forbiddenClaims?.includes("SEIS has verified 16GB+ compatibility."), "model card must forbid verified compatibility claims");

  ensure(datasetCard?.status === "template-not-filled", "dataset card must remain template-not-filled");
  ensure(datasetCard?.parameterClass === "20B", "dataset card parameter class must remain 20B");
  ensure(datasetCard?.datasetDownloadAuthorized === false, "dataset card must not authorize dataset downloads");
  ensure(datasetCard?.trainingAuthorized === false, "dataset card must not authorize training");
  ensure(datasetCard?.benchmarkDatasetAuthorized === false, "dataset card must not authorize benchmark datasets");
  ensure(datasetCard?.forbiddenSourceClasses?.includes("secrets, tokens, credentials, or keys"), "dataset card must forbid secret-bearing sources");
}

function validateHostPreflight(candidate) {
  ensure(candidate?.id === "seis-model-local-hardware-preflight", "host preflight id mismatch");
  ensure(candidate?.status === "host-observed-not-benchmark", "host preflight must remain host-observed-not-benchmark");
  ensure(candidate?.target?.parameterClass === "20B", "host preflight target must remain 20B");
  ensure(candidate?.target?.targetRamClass === "16GB+ RAM", "host preflight RAM target mismatch");
  ensure(Number.isFinite(candidate?.host?.totalRamGb) && candidate.host.totalRamGb > 0, "host total RAM must be observed");
  ensure(typeof candidate?.host?.hostRamFloorObserved === "boolean", "host RAM floor observation must be boolean");
  ensure(["observed", "below-target-floor"].includes(candidate?.host?.ramFloorStatus), "host RAM floor status must be observed or below-target-floor");
  ensure(candidate?.result?.hostRamFloorObserved === candidate?.host?.hostRamFloorObserved, "result must mirror the host RAM floor observation");
  ensure(candidate?.result?.ramFloorStatus === candidate?.host?.ramFloorStatus, "result RAM floor status must mirror the host RAM floor status");
  if (candidate?.host?.totalRamGb >= 16) {
    ensure(candidate.host.hostRamFloorObserved === true, "16GB+ host must record the RAM floor as observed");
    ensure(candidate.host.ramFloorStatus === "observed", "16GB+ host RAM floor status must be observed");
  } else {
    ensure(candidate?.host?.hostRamFloorObserved === false, "below-floor host must not record the RAM floor as observed");
    ensure(candidate?.host?.ramFloorStatus === "below-target-floor", "below-floor host RAM floor status must be below-target-floor");
  }
  ensure(candidate?.result?.compatibilityClaim === "not-verified", "host preflight compatibility claim must remain not-verified");
  ensure(candidate?.result?.modelCompatibilityVerified === false, "host preflight must not verify model compatibility");
  ensure(candidate?.result?.measuredBenchmark === false, "host preflight must not claim benchmark evidence");
  ensure(candidate?.result?.routeEligibleToday === false, "host preflight must keep route eligibility blocked");
  ensure(candidate?.result?.runtimeAuthority === false, "host preflight must not grant runtime authority");
  ensure(candidate?.result?.productionReady === false, "host preflight must not mark production ready");
  ensure(candidate?.truthBoundary?.some((item) => item.includes("not model benchmark evidence")), "host preflight must distinguish observation from benchmark evidence");
  ensure(candidate?.forbiddenClaims?.includes("SEIS has verified 16GB+ compatibility."), "host preflight must forbid verified compatibility claims");
}

function runHostPreflight() {
  const result = spawnSync(process.execPath, [paths.inspector], {
    cwd: root,
    encoding: "utf8"
  });

  if (result.error) {
    failures.push(`host hardware preflight failed to start: ${result.error.message}`);
    return null;
  }

  if (result.status !== 0) {
    failures.push(`host hardware preflight exited with ${result.status}: ${result.stderr.trim()}`);
    return null;
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    failures.push(`host hardware preflight emitted invalid JSON: ${error.message}`);
    return null;
  }
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

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
