#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const outputPath = "dist/qa/model-scaling/local-hardware-preflight.json";
const targetRamGb = 16;
const targetParameterClass = "20B";
const failures = [];

const report = buildReport();
validateReport(report);

if (failures.length) {
  console.error("SEIS model local hardware preflight failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (args.has("--write")) {
  const absoluteOutputPath = path.join(root, outputPath);
  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
  fs.writeFileSync(absoluteOutputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`SEIS model local hardware preflight written: ${outputPath}`);
} else if (args.has("--check")) {
  console.log("SEIS model local hardware preflight check passed.");
} else {
  console.log(JSON.stringify(report, null, 2));
}

function buildReport() {
  const totalRamGb = roundGb(os.totalmem());
  const freeRamGb = roundGb(os.freemem());
  const hostRamFloorObserved = totalRamGb >= targetRamGb;
  return {
    id: "seis-model-local-hardware-preflight",
    status: "host-observed-not-benchmark",
    generatedAt: new Date().toISOString(),
    outputPath,
    target: {
      profileId: "seis-model-scaling-hardware-profile",
      targetId: "seis-20b-local-compatibility-target",
      parameterClass: targetParameterClass,
      targetRamClass: "16GB+ RAM",
      benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json"
    },
    host: {
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      totalRamGb,
      freeRamGb,
      ramClass: classifyRam(totalRamGb),
      hostRamFloorObserved
    },
    result: {
      hostRamFloorObserved,
      compatibilityClaim: "not-verified",
      modelCompatibilityVerified: false,
      measuredBenchmark: false,
      routeEligibleToday: false,
      runtimeAuthority: false,
      productionReady: false
    },
    truthBoundary: [
      "This is a local host hardware preflight, not model benchmark evidence.",
      "It does not download a model, run inference, train weights, call providers, execute SSH, deploy infrastructure, or prove 16GB+ model compatibility.",
      "A host with 16GB+ RAM can satisfy the RAM-floor observation while SEIS 20B route eligibility remains blocked."
    ],
    requiredNextEvidence: [
      "human-approved local runtime adapter",
      "clean-room model card and dataset card",
      "approved quantized 20B artifact path",
      "measured peak resident memory and KV-cache memory",
      "tokens-per-second measurement",
      "local-only fallback verification",
      "redacted benchmark logs",
      "human review before any 20B compatibility claim"
    ],
    forbiddenClaims: [
      "SEIS has trained a 20B foundation model.",
      "SEIS has run 20B inference.",
      "SEIS has benchmarked 20B memory usage.",
      "SEIS has verified 16GB+ compatibility.",
      "SEIS has routeable 20B, 70B, or 150B weights."
    ]
  };
}

function validateReport(candidate) {
  ensure(candidate.id === "seis-model-local-hardware-preflight", "report id mismatch");
  ensure(candidate.status === "host-observed-not-benchmark", "report status must stay host-observed-not-benchmark");
  ensure(candidate.outputPath === outputPath, "report outputPath mismatch");
  ensure(candidate.target?.parameterClass === targetParameterClass, "target parameter class must stay 20B");
  ensure(candidate.target?.targetRamClass === "16GB+ RAM", "target RAM class must stay 16GB+ RAM");
  ensure(candidate.host?.totalRamGb > 0, "host total RAM must be positive");
  ensure(typeof candidate.host?.hostRamFloorObserved === "boolean", "host RAM floor observation must be boolean");
  ensure(candidate.result?.compatibilityClaim === "not-verified", "compatibility claim must remain not-verified");
  ensure(candidate.result?.modelCompatibilityVerified === false, "preflight must not verify model compatibility");
  ensure(candidate.result?.measuredBenchmark === false, "preflight must not claim measured benchmark evidence");
  ensure(candidate.result?.routeEligibleToday === false, "preflight must keep route eligibility blocked");
  ensure(candidate.result?.runtimeAuthority === false, "preflight must not grant runtime authority");
  ensure(candidate.result?.productionReady === false, "preflight must not mark productionReady");
  ensure(candidate.truthBoundary.some((item) => item.includes("not model benchmark evidence")), "truth boundary must separate preflight from benchmark evidence");
  ensure(candidate.truthBoundary.some((item) => item.includes("does not download a model")), "truth boundary must forbid model downloads");
  ensure(candidate.forbiddenClaims.includes("SEIS has verified 16GB+ compatibility."), "forbidden claims must block verified compatibility claims");
}

function classifyRam(totalRamGb) {
  if (totalRamGb >= 128) return "128GB+ frontier workstation";
  if (totalRamGb >= 64) return "64GB+ research lane";
  if (totalRamGb >= 32) return "32GB+ validation lane";
  if (totalRamGb >= 24) return "24GB+ candidate lane";
  if (totalRamGb >= 16) return "16GB+ developer floor";
  return "below 16GB target floor";
}

function roundGb(bytes) {
  return Math.round((bytes / 1024 ** 3) * 10) / 10;
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
