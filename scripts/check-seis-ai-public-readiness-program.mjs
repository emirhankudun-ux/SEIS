#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  program: "content/development/seis-ai-public-readiness-program.json",
  languageModelIntakeRegistry: "content/development/seis-language-model-intake-registry.json",
  languageModelTrainingCurriculum: "content/development/seis-language-model-training-curriculum.json",
  aiWorkforceTrainingPlan: "content/development/seis-ai-workforce-training-plan.json",
  modelScalingHardwareProfile: "content/development/seis-model-scaling-hardware-profile.json",
  modelParameterLadder: "content/development/seis-model-parameter-ladder.json",
  modelScalingSubagentCouncil: "content/development/seis-model-scaling-subagent-council.json",
  apexModelProgram: "content/development/seis-512b-apex-model-program.json",
  agiEvaluationProtocol: "content/development/seis-agi-evaluation-protocol.json",
  agiPublicReadinessEvidence: "content/development/seis-agi-public-readiness-evidence.json",
  agiGithubUserReadinessGates: "content/development/seis-agi-github-user-readiness-gates.json",
  agiIndependentEvidenceLedger: "content/development/seis-agi-independent-evidence-ledger.json",
  freshCloneReadiness: "content/development/seis-ai-fresh-clone-readiness.json",
  doc: "docs/ai/seis-ai-public-readiness-program.md",
  githubReadinessDoc: "docs/ai/seis-agi-github-user-readiness-gates.md",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const program = readJson(paths.program, "AI public readiness program");
const intake = readJson(paths.languageModelIntakeRegistry, "language model intake registry");
const curriculum = readJson(paths.languageModelTrainingCurriculum, "language model training curriculum");
const workforce = readJson(paths.aiWorkforceTrainingPlan, "AI workforce training plan");
const scaling = readJson(paths.modelScalingHardwareProfile, "model scaling hardware profile");
const ladder = readJson(paths.modelParameterLadder, "model parameter ladder");
const council = readJson(paths.modelScalingSubagentCouncil, "model scaling subagent council");
const apex = readJson(paths.apexModelProgram, "512B apex program");
const protocol = readJson(paths.agiEvaluationProtocol, "AGI evaluation protocol");
const publicReadiness = readJson(paths.agiPublicReadinessEvidence, "AGI public readiness evidence");
const githubGates = readJson(paths.agiGithubUserReadinessGates, "AGI GitHub user readiness gates");
const independentLedger = readJson(paths.agiIndependentEvidenceLedger, "AGI independent evidence ledger");
const freshCloneReadiness = readJson(paths.freshCloneReadiness, "AI fresh-clone readiness");
const packageJson = readJson(paths.packageJson, "package.json");
const doc = readText(paths.doc, "AI public readiness docs");
const githubReadinessDoc = readText(paths.githubReadinessDoc, "AGI GitHub user readiness docs");

if (program) {
  ensure(program.id === "seis-ai-public-readiness-program", "program id mismatch");
  ensure(program.status === "local-demo-public-review-ready-not-agi", "program status mismatch");
  ensure(program.resourceUri === "seis://ai/public-readiness-program.json", "program resource URI mismatch");
  ensure(program.qualityGate === "npm run check:seis-ai-public-readiness-program", "program qualityGate mismatch");
  ensure(program.oneCommandReadinessValidator === "npm run check:seis-ai-public-readiness", "program one-command validator mismatch");
  ensure(program.reportCommand === "npm run report:seis-ai-public-readiness", "program report command mismatch");
  ensure(program.reportCheck === "npm run check:seis-ai-public-readiness-report", "program report check mismatch");
  ensure(program.reportArtifacts?.json === "reports/seis-ai-public-readiness/latest.json", "program report JSON path mismatch");
  ensure(program.reportArtifacts?.markdown === "reports/seis-ai-public-readiness/latest.md", "program report markdown path mismatch");
  ensure(program.coreCredentialRequirement === "none", "coreCredentialRequirement must remain none");
  ensure(program.defaultRuntimeMode === "seis-local-demo", "defaultRuntimeMode must stay seis-local-demo");
  ensure(program.publicReadyForLocalDemo === true, "publicReadyForLocalDemo must be true");
  ensure(program.githubReadyForEveryone === false, "githubReadyForEveryone must remain false before release evidence");
  ensure(program.publicReadyAsAgi === false, "publicReadyAsAgi must remain false");
  ensure(program.routeEligibleToday === false, "routeEligibleToday must remain false");
  ensure(program.runtimeAuthority === false, "runtimeAuthority must remain false");
  ensure(program.trainingStatus === "not-started", "trainingStatus must remain not-started");
  ensure(program.weightsAvailable === false, "weightsAvailable must remain false");
  ensure(program.inferenceAvailable === false, "inferenceAvailable must remain false");
  ensure(program.benchmarkStatus === "not-run", "benchmarkStatus must remain not-run");
  ensure(program.researchBaselineVerifiedAt === "2026-06-30", "researchBaselineVerifiedAt must record the current source verification date");

  for (const phrase of [
    "does not prove AGI",
    "install models",
    "download checkpoints",
    "train a 512B model",
    "run inference",
    "run benchmarks",
    "call providers",
    "provision cloud/GPU resources",
    "execute SSH",
    "push, merge, deploy",
    "grant runtime authority"
  ]) {
    ensure(String(program.truthBoundary || "").includes(phrase), `truthBoundary missing phrase: ${phrase}`);
  }

  ensureSource(program, "languageModelIntakeRegistry", paths.languageModelIntakeRegistry);
  ensureSource(program, "languageModelTrainingCurriculum", paths.languageModelTrainingCurriculum);
  ensureSource(program, "aiWorkforceTrainingPlan", paths.aiWorkforceTrainingPlan);
  ensureSource(program, "modelScalingHardwareProfile", paths.modelScalingHardwareProfile);
  ensureSource(program, "modelParameterLadder", paths.modelParameterLadder);
  ensureSource(program, "modelScalingSubagentCouncil", paths.modelScalingSubagentCouncil);
  ensureSource(program, "apexModelProgram", paths.apexModelProgram);
  ensureSource(program, "agiEvaluationProtocol", paths.agiEvaluationProtocol);
  ensureSource(program, "agiPublicReadinessEvidence", paths.agiPublicReadinessEvidence);
  ensureSource(program, "agiGithubUserReadinessGates", paths.agiGithubUserReadinessGates);
  ensureSource(program, "agiIndependentEvidenceLedger", paths.agiIndependentEvidenceLedger);
  ensureSource(program, "freshCloneReadiness", paths.freshCloneReadiness);
  ensureSource(program, "doc", paths.doc);

  ensureArrayIncludesAll(
    (program.internetResearchBaseline || []).map((source) => source.id),
    ["llama-3-1-405b", "megatron-turing-nlg-530b", "deepseek-v3-671b", "nist-ai-rmf", "nist-ai-600-1", "metr-long-task-horizon"],
    "internetResearchBaseline"
  );
  for (const source of program.internetResearchBaseline || []) {
    ensureNonEmpty(source.url, `${source.id}.url`);
    ensureNonEmpty(source.evidenceType, `${source.id}.evidenceType`);
    ensureNonEmpty(source.seisImplication, `${source.id}.seisImplication`);
  }

  ensureArrayIncludesAll(
    (program.githubAudienceModes || []).map((mode) => mode.id),
    ["github-local-demo-user", "github-maintainer", "external-researcher", "real-agi-user"],
    "githubAudienceModes"
  );
  ensure((program.githubAudienceModes || []).some((mode) => mode.id === "github-local-demo-user" && mode.status === "allowed"), "github local demo user mode must be allowed");
  ensure((program.githubAudienceModes || []).some((mode) => mode.id === "real-agi-user" && mode.status === "blocked"), "real AGI user mode must remain blocked");

  ensureArrayIncludesAll(
    (program.readinessGates || []).map((gate) => gate.id),
    [
      "local-demo-readiness",
      "one-command-ai-readiness",
      "fresh-clone-release-path",
      "human-release-approval",
      "real-512b-evidence",
      "independent-agi-evidence"
    ],
    "readinessGates"
  );
  for (const gate of program.readinessGates || []) {
    ensure(gate.blocksAgiClaim === true, `${gate.id}.blocksAgiClaim must stay true`);
    ensure(Array.isArray(gate.evidence) && gate.evidence.length >= 1, `${gate.id}.evidence must be populated`);
  }
  ensure((program.readinessGates || []).some((gate) => gate.id === "fresh-clone-release-path" && gate.status === "partial" && gate.blocksGithubReadyForEveryone === true), "fresh clone gate must block everyone-ready status");
  ensure((program.readinessGates || []).some((gate) => gate.id === "human-release-approval" && gate.status === "approval-gated" && gate.blocksGithubReadyForEveryone === true), "human release gate must block everyone-ready status");
  ensure((program.readinessGates || []).some((gate) => gate.id === "real-512b-evidence" && gate.status === "missing"), "real 512B evidence gate must remain missing");
  ensure((program.readinessGates || []).some((gate) => gate.id === "independent-agi-evidence" && gate.status === "missing"), "independent AGI evidence gate must remain missing");

  ensure(program.subAgentCouncilUse?.status === "plan-only-review", "sub-agent council use status mismatch");
  ensure(program.subAgentCouncilUse?.source === paths.modelScalingSubagentCouncil, "sub-agent council source mismatch");
  ensureArrayIncludesAll(program.subAgentCouncilUse?.allowedActions, ["plan", "review", "document", "validate", "gate"], "subAgentCouncilUse.allowedActions");
  ensureArrayIncludesAll(program.subAgentCouncilUse?.forbiddenActions, ["train", "download", "benchmark", "deploy", "provision cloud or GPU", "execute SSH", "read credentials", "approve own promotion"], "subAgentCouncilUse.forbiddenActions");

  ensureArrayIncludesAll(program.requiredBeforeGithubReadyForEveryone, [
    "fresh clone local demo path verified",
    "npm run check:seis-ai-fresh-clone-readiness passes on the target commit",
    "npm run check:seis-ai-public-readiness passes on the target commit",
    "required CI checks green on the target commit",
    "human release approval recorded",
    "release notes and rollback plan accepted",
    "AGI and 512B claim boundaries preserved"
  ], "requiredBeforeGithubReadyForEveryone");

  ensureArrayIncludesAll(program.requiredBeforeAnyAgiClaim, [
    "real 512B training or inference evidence independently verified",
    "multi-domain capability evaluation accepted",
    "long-horizon planning evaluation accepted",
    "agentic autonomy time-horizon evaluation accepted",
    "abstract generalization evaluation accepted",
    "frontier safety threshold review accepted",
    "generative AI risk profile accepted",
    "privacy, data-rights, and clean-room review accepted",
    "red-team report accepted",
    "model card and system card published",
    "training logs and checkpoint governance reviewed",
    "external review completed",
    "explicit human approval recorded"
  ], "requiredBeforeAnyAgiClaim");

  ensureArrayIncludesAll(program.forbiddenClaims, [
    "SEIS has achieved real AGI.",
    "SEIS includes trained 512B weights.",
    "GitHub users can run routeable 512B inference today.",
    "Installed AI systems prove SEIS AGI.",
    "Sub-agent council review grants runtime authority.",
    "Passing validators proves AGI.",
    "Provider API access is SEIS-owned AGI."
  ], "forbiddenClaims");
}

ensure(intake?.status === "active-intake-contract", "language model intake registry must remain active");
ensure(curriculum?.status === "planned-training-contract", "language model curriculum must stay plan-only");
ensure(workforce?.status === "active-local-seed-training-contract", "AI workforce training plan status mismatch");
ensure(scaling?.apexTarget?.parameterClass === "512B", "model scaling profile must keep 512B apex target");
ensure(scaling?.apexTarget?.runtimeAuthority === false, "model scaling 512B runtime authority must be false");
ensure(ladder?.defaultRoute === "seis-local-demo", "parameter ladder default route must remain Local Demo");
ensure(council?.status === "active-plan-only", "subagent council must stay plan-only");
ensure(apex?.status === "apex-program-plan-only", "512B apex program must stay plan-only");
ensure(apex?.runtimeAuthority === false, "512B apex program runtime authority must remain false");
ensure(protocol?.agiClaimAllowed === false, "AGI evaluation protocol must block AGI claims");
ensure(publicReadiness?.status === "blocked-missing-real-agi-evidence", "AGI public readiness evidence must stay blocked");
ensure(githubGates?.oneCommandReadinessValidator?.command === "npm run check:seis-ai-public-readiness", "GitHub gates must expose one-command readiness validator");
ensure(independentLedger?.status === "planned-without-independent-evidence", "independent evidence ledger must remain planned without independent evidence");
ensure(freshCloneReadiness?.status === "contract-defined-not-release-evidence", "fresh-clone readiness must remain contract-defined");
ensure(freshCloneReadiness?.freshCloneVerified === false, "fresh-clone readiness must not claim verified clone evidence");
ensure(packageJson?.scripts?.["check:seis-ai-public-readiness-program"] === "node scripts/check-seis-ai-public-readiness-program.mjs", "package.json must expose check:seis-ai-public-readiness-program");
ensure(packageJson?.scripts?.["check:seis-ai-public-readiness"] === "node scripts/check-seis-ai-public-readiness.mjs", "package.json must expose check:seis-ai-public-readiness");
ensure(packageJson?.scripts?.["check:seis-ai-fresh-clone-readiness"] === "node scripts/check-seis-ai-fresh-clone-readiness.mjs", "package.json must expose check:seis-ai-fresh-clone-readiness");
ensure(packageJson?.scripts?.["report:seis-ai-public-readiness"] === "node scripts/create-seis-ai-public-readiness-report.mjs --write", "package.json must expose report:seis-ai-public-readiness");
ensure(packageJson?.scripts?.["check:seis-ai-public-readiness-report"] === "node scripts/create-seis-ai-public-readiness-report.mjs", "package.json must expose check:seis-ai-public-readiness-report");

for (const [text, label] of [
  [doc, "AI public readiness docs"],
  [githubReadinessDoc, "AGI GitHub user readiness docs"]
]) {
  ensure(text.includes("seis-ai-public-readiness-program"), `${label} must reference the AI public readiness program`);
  ensure(text.includes("seis://ai/public-readiness-program.json"), `${label} must reference the AI public readiness MCP URI`);
  ensure(text.includes("npm run check:seis-ai-public-readiness"), `${label} must document the one-command readiness validator`);
}

finish("SEIS AI public readiness program check passed.");

function ensureSource(program, key, expected) {
  ensure(program.sourceOfTruth?.[key] === expected, `sourceOfTruth.${key} mismatch`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!relativePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) failures.push(`${label} missing: ${relativePath}`);
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function ensureNonEmpty(value, label) {
  ensure(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} unreadable: ${error.message}`);
    return "";
  }
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS AI public readiness program check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
