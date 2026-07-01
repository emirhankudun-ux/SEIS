#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  boundary: "content/development/seis-520b-next-frontier-boundary.json",
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  ladder: "content/development/seis-model-parameter-ladder.json",
  apexModelProgram: "content/development/seis-512b-apex-model-program.json",
  agiEvaluationProtocol: "content/development/seis-agi-evaluation-protocol.json",
  agiPublicReadinessEvidence: "content/development/seis-agi-public-readiness-evidence.json",
  scalingDoc: "docs/ai/seis-model-scaling.md",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const boundary = readJson(paths.boundary, "520B next-frontier boundary");
const profile = readJson(paths.profile, "model scaling hardware profile");
const ladder = readJson(paths.ladder, "parameter ladder");
const apexModelProgram = readJson(paths.apexModelProgram, "512B apex model program");
const agiEvaluationProtocol = readJson(paths.agiEvaluationProtocol, "AGI evaluation protocol");
const agiPublicReadinessEvidence = readJson(paths.agiPublicReadinessEvidence, "AGI public readiness evidence");
const scalingDoc = readText(paths.scalingDoc, "model scaling docs");
const packageJson = readJson(paths.packageJson, "package.json");

if (boundary) {
  ensure(boundary.id === "seis-520b-next-frontier-boundary", "boundary id mismatch");
  ensure(boundary.status === "next-frontier-boundary-plan-only", "boundary must stay plan-only");
  ensure(boundary.resourceUri === "seis://ai/520b-next-frontier-boundary.json", "boundary resource URI mismatch");
  ensure(boundary.qualityGate === "npm run check:seis-520b-next-frontier-boundary", "boundary quality gate mismatch");
  ensure(boundary.coreCredentialRequirement === "none", "boundary coreCredentialRequirement must stay none");
  ensure(boundary.defaultRuntimeMode === "seis-local-demo", "boundary default runtime mode must stay Local Demo");
  ensure(boundary.routeEligibleToday === false, "boundary must not be route eligible today");
  ensure(boundary.runtimeAuthority === false, "boundary must not grant runtime authority");
  ensure(boundary.trainingStatus === "not-started", "boundary trainingStatus must stay not-started");
  ensure(boundary.weightsAvailable === false, "boundary must not mark weights available");
  ensure(boundary.inferenceAvailable === false, "boundary must not mark inference available");
  ensure(boundary.benchmarkStatus === "not-run", "boundary benchmarkStatus must stay not-run");
  ensure(boundary.productionReady === false, "boundary must not be production ready");

  ensure(String(boundary.truthBoundary || "").includes("plan-only 520B"), "truth boundary must mark 520B as plan-only");
  ensure(String(boundary.truthBoundary || "").includes("does not download models"), "truth boundary must forbid model downloads");
  ensure(String(boundary.truthBoundary || "").includes("train"), "truth boundary must forbid training claims");
  ensure(String(boundary.truthBoundary || "").includes("run inference"), "truth boundary must forbid inference claims");
  ensure(String(boundary.truthBoundary || "").includes("benchmark"), "truth boundary must forbid benchmark claims");
  ensure(String(boundary.truthBoundary || "").includes("provision GPU/cloud capacity"), "truth boundary must forbid GPU/cloud provisioning");
  ensure(String(boundary.truthBoundary || "").includes("claim SEIS owns a trained 520B foundation model"), "truth boundary must forbid 520B ownership claims");

  ensureArrayIncludesAll(boundary.sourceOfTruth ? Object.values(boundary.sourceOfTruth) : [], [
    paths.profile,
    paths.ladder,
    paths.apexModelProgram,
    paths.agiEvaluationProtocol,
    paths.agiPublicReadinessEvidence,
    paths.scalingDoc
  ], "boundary.sourceOfTruth values");

  ensure(boundary.target?.id === "seis-520b-next-frontier-target", "target id mismatch");
  ensure(boundary.target?.parameterClass === "520B", "target parameterClass must be 520B");
  ensure(boundary.target?.parameterCountBillion === 520, "target parameterCountBillion must be 520");
  ensure(String(boundary.target?.allowedToday || "").includes("Local Demo"), "target allowedToday must stay Local Demo only");
  ensure(String(boundary.target?.minimumPrerequisite || "").includes("512B apex evidence accepted"), "target must require 512B apex evidence first");

  ensureArrayIncludesAll(
    (boundary.periodicMilestones || []).map((milestone) => milestone.parameterClass),
    ["20B", "70B", "150B", "300B+", "512B", "520B"],
    "boundary.periodicMilestones.parameterClass"
  );
  ensure((boundary.periodicMilestones || []).every((milestone) => String(milestone.promotionGate || "").includes("approval") || String(milestone.promotionGate || "").includes("accepted")), "each milestone must keep an approval or evidence gate");

  ensureArrayIncludesAll(boundary.evidenceRequiredBeforeAny520BClaim, [
    "512B apex evidence accepted",
    "dense versus MoE architecture decision recorded",
    "frontier-scale distributed runtime feasibility proof",
    "frontier safety and misuse evaluation",
    "observability, kill-switch, rollback, and cost-stop plan",
    "explicit human approval recorded"
  ], "boundary.evidenceRequiredBeforeAny520BClaim");

  ensureArrayIncludesAll(boundary.forbiddenClaimRules, [
    "no-trained-520b-weights-claim",
    "no-routeable-520b-inference-claim",
    "no-520b-benchmark-claim",
    "no-520b-cloud-or-ssh-claim",
    "no-520b-agi-capability-claim"
  ], "boundary.forbiddenClaimRules");

  ensureArrayIncludesAll(boundary.forbiddenClaims, [
    "SEIS has trained a 520B foundation model.",
    "SEIS has routeable 520B inference.",
    "SEIS has benchmarked a 520B model.",
    "SEIS has provisioned 520B cloud or GPU runtime.",
    "SEIS has achieved real AGI through the 520B roadmap."
  ], "boundary.forbiddenClaims");
}

ensure(profile?.sourceOfTruth?.nextFrontierBoundary === paths.boundary, "profile must point to 520B boundary");
ensure(profile?.nextFrontierTarget?.parameterClass === "520B", "profile must expose nextFrontierTarget 520B");
ensure(profile?.nextFrontierTarget?.routeEligibleToday === false, "profile nextFrontierTarget routeEligibleToday must stay false");
ensure(profile?.nextFrontierTarget?.runtimeAuthority === false, "profile nextFrontierTarget runtimeAuthority must stay false");
ensure(profile?.nextFrontierTarget?.weightsAvailable === false, "profile nextFrontierTarget weightsAvailable must stay false");
ensure(profile?.nextFrontierTarget?.inferenceAvailable === false, "profile nextFrontierTarget inferenceAvailable must stay false");
ensure((profile?.creationStages || []).some((stage) => stage.stage === "stage-5-520b-next-frontier" && stage.parameterClass === "520B"), "profile creation stages must include 520B");
ensure((profile?.scaleLadder || []).some((entry) => entry.parameterClass === "520B" && entry.status === "next-frontier-boundary-plan-only"), "profile scale ladder must include 520B plan-only target");
ensure((profile?.routerPolicy?.blockedToday || []).includes("520B live inference"), "profile router policy must block 520B live inference");
ensure((profile?.forbiddenClaims || []).includes("SEIS has trained a 520B foundation model."), "profile forbidden claims must block 520B training claim");

ensure(ladder?.sourceOfTruth?.nextFrontierBoundary === paths.boundary, "ladder must point to 520B boundary");
ensure((ladder?.targets || []).some((target) => target.id === "seis-520b-next-frontier-boundary" && target.parameterClass === "520B" && target.routeEligibleToday === false), "ladder targets must include blocked 520B");
ensure((ladder?.promotionOrder || []).includes("520B"), "ladder promotionOrder must include 520B");
ensure((ladder?.forbiddenClaims || []).includes("SEIS has trained a 520B foundation model."), "ladder forbiddenClaims must block 520B training claim");

ensure(apexModelProgram?.id === "seis-512b-apex-model-program", "512B apex model program must exist before 520B");
ensure(agiEvaluationProtocol?.agiClaimAllowed === false, "AGI evaluation protocol must still block AGI claims");
ensure(agiPublicReadinessEvidence?.agiClaimAllowed === false, "AGI public readiness evidence must still block AGI claims");

ensure(scalingDoc.includes("520B Next Frontier Boundary"), "model scaling docs must describe 520B boundary");
ensure(scalingDoc.includes("content/development/seis-520b-next-frontier-boundary.json"), "model scaling docs must link the 520B boundary file");
ensure(scalingDoc.includes("npm run check:seis-520b-next-frontier-boundary"), "model scaling docs must list the 520B quality gate");
ensure(scalingDoc.includes("No 520B"), "model scaling docs must include 520B non-claim language");

ensure(
  packageJson?.scripts?.["check:seis-520b-next-frontier-boundary"] === "node scripts/check-seis-520b-next-frontier-boundary.mjs",
  "package.json must expose check:seis-520b-next-frontier-boundary"
);
ensure(
  String(packageJson?.scripts?.["quality:governance"] || "").includes("check:seis-520b-next-frontier-boundary"),
  "quality:governance must include check:seis-520b-next-frontier-boundary"
);

finish("SEIS 520B next-frontier boundary check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    failures.push(`${label} missing: ${relativePath}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function finish(successMessage) {
  if (failures.length) {
    console.error("SEIS 520B next-frontier boundary check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(successMessage);
}
