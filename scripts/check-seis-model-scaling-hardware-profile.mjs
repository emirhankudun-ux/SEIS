#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  profile: "content/development/seis-model-scaling-hardware-profile.json",
  modelCardTemplate: "content/development/seis-20b-model-card-template.json",
  datasetCardTemplate: "content/development/seis-20b-dataset-card-template.json",
  benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json",
  benchmarkDryRun: "reports/seis-model-scaling/20b-benchmark-dry-run.json",
  parameterLadder: "content/development/seis-model-parameter-ladder.json",
  frontierEscalationPolicy: "content/development/seis-model-frontier-escalation-policy.json",
  frontierModelProgram: "content/development/seis-150b-frontier-model-program.json",
  apexModelProgram: "content/development/seis-512b-apex-model-program.json",
  scalingDoc: "docs/ai/seis-model-scaling.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  modelRouterDoc: "docs/ai/model-router.md",
  providerRegistry: "content/development/seis-ai-core-provider-registry.json",
  workforceTrainingPlan: "content/development/seis-ai-workforce-training-plan.json",
  modelFamilyRegistry: "packages/seis-ai/models/seis-model-family-registry.json",
  modelPromotionPolicy: "packages/seis-ai/models/seis-model-promotion-policy.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  tools: "packages/seis-ai/src/agent/tools.mjs",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  mcpSmokeTest: "packages/seis-ai/test/mcp-smoke.test.mjs",
  localHardwarePreflight: "scripts/inspect-seis-model-local-hardware.mjs",
  benchmarkDryRunScript: "scripts/create-seis-20b-benchmark-dry-run.mjs",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(relativePath, label);
}

const profile = readJson(paths.profile, "model scaling profile");
const modelCardTemplate = readJson(paths.modelCardTemplate, "20B model card template");
const datasetCardTemplate = readJson(paths.datasetCardTemplate, "20B dataset card template");
const benchmarkManifestTemplate = readJson(paths.benchmarkManifest, "20B benchmark manifest template");
const benchmarkDryRun = readJson(paths.benchmarkDryRun, "20B benchmark dry-run report");
const parameterLadder = readJson(paths.parameterLadder, "model parameter ladder");
const frontierEscalationPolicy = readJson(paths.frontierEscalationPolicy, "frontier escalation policy");
const frontierModelProgram = readJson(paths.frontierModelProgram, "150B frontier model program");
const apexModelProgram = readJson(paths.apexModelProgram, "512B apex model program");
const scalingDoc = readText(paths.scalingDoc, "model scaling docs");
const aiCoreDoc = readText(paths.aiCoreDoc, "AI Core docs");
const modelRouterDoc = readText(paths.modelRouterDoc, "model router docs");
const providerRegistry = readJson(paths.providerRegistry, "provider registry");
const workforceTrainingPlan = readJson(paths.workforceTrainingPlan, "workforce training plan");
const modelPromotionPolicy = readJson(paths.modelPromotionPolicy, "model promotion policy");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration manifest");
const helper = readText(paths.helper, "AI Core helper");
const tools = readText(paths.tools, "agent tools");
const mcpServer = readText(paths.mcpServer, "MCP server");
const mcpSmokeTest = readText(paths.mcpSmokeTest, "MCP smoke test");
const localHardwarePreflight = readText(paths.localHardwarePreflight, "local hardware preflight");
const benchmarkDryRunScript = readText(paths.benchmarkDryRunScript, "20B benchmark dry-run script");
const packageJson = readJson(paths.packageJson, "package.json");

if (profile) {
  ensure(profile.id === "seis-model-scaling-hardware-profile", "profile id mismatch");
  ensure(profile.status === "planned-compatibility-contract", "profile must stay planned-compatibility-contract");
  ensure(profile.qualityGate === "npm run check:seis-model-scaling-hardware-profile", "qualityGate must point to package script");
  ensure(profile.coreCredentialRequirement === "none", "coreCredentialRequirement must stay none");
  ensure(String(profile.truthBoundary || "").includes("no trained 20B, 70B, 150B, 512B, or AGI weights"), "truth boundary must forbid trained 20B/70B/150B/512B/AGI weight claims");
  ensure(String(profile.truthBoundary || "").includes("no inference"), "truth boundary must forbid inference claims");
  ensure(String(profile.truthBoundary || "").includes("no benchmark"), "truth boundary must forbid benchmark claims");
  ensure(String(profile.truthBoundary || "").includes("no live provider calls"), "truth boundary must forbid live provider calls");
  ensure(String(profile.truthBoundary || "").includes("does not claim SEIS owns a trained foundation model or a real AGI"), "truth boundary must forbid foundation model and AGI ownership claims");

  ensure(profile.sourceOfTruth?.scalingDoc === paths.scalingDoc, "sourceOfTruth.scalingDoc mismatch");
  ensure(profile.sourceOfTruth?.benchmarkManifest === paths.benchmarkManifest, "sourceOfTruth.benchmarkManifest mismatch");
  ensure(profile.sourceOfTruth?.benchmarkDryRun === paths.benchmarkDryRun, "sourceOfTruth.benchmarkDryRun mismatch");
  ensure(profile.sourceOfTruth?.parameterLadder === paths.parameterLadder, "sourceOfTruth.parameterLadder mismatch");
  ensure(profile.sourceOfTruth?.frontierEscalationPolicy === paths.frontierEscalationPolicy, "sourceOfTruth.frontierEscalationPolicy mismatch");
  ensure(profile.sourceOfTruth?.frontierModelProgram === paths.frontierModelProgram, "sourceOfTruth.frontierModelProgram mismatch");
  ensure(profile.sourceOfTruth?.apexModelProgram === paths.apexModelProgram, "sourceOfTruth.apexModelProgram mismatch");
  ensure(profile.sourceOfTruth?.modelCardTemplate === paths.modelCardTemplate, "sourceOfTruth.modelCardTemplate mismatch");
  ensure(profile.sourceOfTruth?.datasetCardTemplate === paths.datasetCardTemplate, "sourceOfTruth.datasetCardTemplate mismatch");
  ensure(profile.sourceOfTruth?.aiCoreDoc === paths.aiCoreDoc, "sourceOfTruth.aiCoreDoc mismatch");
  ensure(profile.sourceOfTruth?.modelRouterDoc === paths.modelRouterDoc, "sourceOfTruth.modelRouterDoc mismatch");
  ensure(profile.sourceOfTruth?.providerRegistry === paths.providerRegistry, "sourceOfTruth.providerRegistry mismatch");
  ensure(profile.sourceOfTruth?.workforceTrainingPlan === paths.workforceTrainingPlan, "sourceOfTruth.workforceTrainingPlan mismatch");

  const target = profile.currentTarget || {};
  ensure(target.id === "seis-20b-local-compatibility-target", "current target id mismatch");
  ensure(target.parameterClass === "20B", "current target must be 20B");
  ensure(target.parameterCountBillion === 20, "current target must record 20 billion parameters");
  ensure(target.minimumSystemRamGb === 16, "current target must preserve 16GB+ minimum RAM class");
  ensure(target.targetRamClass === "16GB+ RAM", "current target RAM class mismatch");
  ensure(target.compatibilityStatus === "planned-not-validated", "20B compatibility must remain planned-not-validated");
  ensure(target.trainingStatus === "not-started", "20B training must remain not-started");
  ensure(target.weightsAvailable === false, "20B weights must not be marked available");
  ensure(target.inferenceAvailable === false, "20B inference must not be marked available");
  ensure(target.runtimeAuthority === false, "20B runtime authority must remain false");
  ensure(target.productionReady === false, "20B productionReady must remain false");
  ensure(target.quantizationRequired === true, "20B profile must require quantization before compatibility");
  ensure(target.quantizationStatus === "planned-not-benchmarked", "20B quantization must not be benchmarked");

  const frontierTarget = profile.frontierTarget || {};
  ensure(frontierTarget.id === "seis-150b-frontier-research-target", "frontierTarget id mismatch");
  ensure(frontierTarget.parameterClass === "150B", "frontierTarget must be 150B");
  ensure(frontierTarget.parameterCountBillion === 150, "frontierTarget must record 150 billion parameters");
  ensure(frontierTarget.compatibilityStatus === "not-scoped", "150B compatibility must remain not-scoped");
  ensure(frontierTarget.trainingStatus === "not-started", "150B training must remain not-started");
  ensure(frontierTarget.weightsAvailable === false, "150B weights must not be marked available");
  ensure(frontierTarget.inferenceAvailable === false, "150B inference must not be marked available");
  ensure(frontierTarget.runtimeAuthority === false, "150B runtime authority must remain false");
  ensure(frontierTarget.productionReady === false, "150B productionReady must remain false");
  ensure(String(frontierTarget.routerEligibility || "").includes("blocked"), "150B router eligibility must stay blocked");

  const apexTarget = profile.apexTarget || {};
  ensure(apexTarget.id === "seis-512b-apex-frontier-target", "apexTarget id mismatch");
  ensure(apexTarget.parameterClass === "512B", "apexTarget must be 512B");
  ensure(apexTarget.parameterCountBillion === 512, "apexTarget must record 512 billion parameters");
  ensure(apexTarget.compatibilityStatus === "not-scoped", "512B compatibility must remain not-scoped");
  ensure(apexTarget.trainingStatus === "not-started", "512B training must remain not-started");
  ensure(apexTarget.weightsAvailable === false, "512B weights must not be marked available");
  ensure(apexTarget.inferenceAvailable === false, "512B inference must not be marked available");
  ensure(apexTarget.benchmarkStatus === "not-run", "512B benchmark must remain not-run");
  ensure(apexTarget.agiCapabilityStatus === "not-demonstrated", "AGI capability must remain not-demonstrated");
  ensure(apexTarget.runtimeAuthority === false, "512B runtime authority must remain false");
  ensure(apexTarget.productionReady === false, "512B productionReady must remain false");
  ensure(String(apexTarget.routerEligibility || "").includes("blocked"), "512B router eligibility must stay blocked");

  const memoryBudget = profile.memoryBudgetContract || {};
  ensure(memoryBudget.id === "seis-20b-16gb-memory-budget-contract", "memoryBudgetContract id mismatch");
  ensure(memoryBudget.status === "planning-estimate-not-benchmark-evidence", "memoryBudgetContract must stay planning-estimate-not-benchmark-evidence");
  ensure(memoryBudget.targetRamClass === "16GB+ RAM", "memoryBudgetContract target RAM class mismatch");
  ensure(memoryBudget.parameterClass === "20B", "memoryBudgetContract parameter class mismatch");
  ensure(memoryBudget.compatibilityClaim === "not-verified", "memoryBudgetContract compatibilityClaim must remain not-verified");
  ensureArrayIncludesAll(memoryBudget.requiredMeasurements, [
    "cold start peak resident memory",
    "prompt prefill memory at declared context length",
    "tokens per second with hardware profile",
    "redacted logs proving no provider key or secret exposure",
    "KV-cache memory and OS memory pressure"
  ], "memoryBudgetContract.requiredMeasurements");
  ensureArrayIncludesAll(memoryBudget.minimumBenchmarkFields, [
    "machineRamGb",
    "runtimeName",
    "modelArtifactId",
    "quantization",
    "peakResidentMemoryGb",
    "kvCacheMemoryGb",
    "tokensPerSecond",
    "fallbackVerified",
    "secretsRedacted",
    "localOnlyFallbackPassed",
    "measuredAt"
  ], "memoryBudgetContract.minimumBenchmarkFields");
  ensure(memoryBudget.plannedArtifactPath === "reports/seis-model-scaling/20b-16gb-memory-benchmark.json", "memoryBudgetContract plannedArtifactPath mismatch");
  ensure(String(memoryBudget.requiredFailureBehavior || "").includes("seis-local-demo"), "memoryBudgetContract must require local demo fallback");

  const compatibilityProfiles = Array.isArray(profile.compatibilityProfiles) ? profile.compatibilityProfiles : [];
  ensure(compatibilityProfiles.length >= 5, "compatibilityProfiles must include at least five RAM/scaling lanes");
  ensure(compatibilityProfiles.some((item) => item.id === "ram-16gb-plus-local-demo-floor" && item.ramClass === "16GB+" && item.targetParameterClass === "20B" && item.routeEligibleToday === false), "compatibilityProfiles must include blocked 16GB+ 20B developer floor");
  ensure(compatibilityProfiles.some((item) => item.id === "ram-32gb-plus-20b-validation" && item.targetParameterClass === "20B" && item.routeEligibleToday === false), "compatibilityProfiles must include blocked 32GB+ 20B validation lane");
  ensure(compatibilityProfiles.some((item) => item.id === "ram-64gb-plus-70b-research" && item.targetParameterClass === "70B" && item.status === "research-roadmap"), "compatibilityProfiles must include 64GB+ 70B research lane");
  ensure(compatibilityProfiles.some((item) => item.id === "distributed-150b-plus-frontier" && item.targetParameterClass === "150B+" && item.status === "not-scoped"), "compatibilityProfiles must include disabled 150B+ frontier lane");
  ensure(compatibilityProfiles.every((item) => item.routeEligibleToday === false), "compatibilityProfiles must not be route eligible today");

  const benchmarkManifest = profile.benchmarkManifestContract || {};
  ensure(benchmarkManifest.id === "seis-20b-compatibility-benchmark-manifest", "benchmarkManifestContract id mismatch");
  ensure(benchmarkManifest.status === "required-before-compatibility-claim", "benchmarkManifestContract must be required before compatibility claims");
  ensure(benchmarkManifest.artifactPath === "reports/seis-model-scaling/20b-16gb-memory-benchmark.json", "benchmarkManifestContract artifactPath mismatch");
  ensure(benchmarkManifest.mustBeHumanReviewed === true, "benchmarkManifestContract must require human review");
  ensure(benchmarkManifest.mustStayLocalOnly === true, "benchmarkManifestContract must stay local-only");
  ensureArrayIncludesAll(benchmarkManifest.requiredFields, [
    "machineRamGb",
    "modelArtifactLicense",
    "kvCacheMemoryGb",
    "osMemoryPressure",
    "tokensPerSecond",
    "fallbackVerified",
    "secretsRedacted",
    "localOnlyFallbackPassed",
    "verifiedBy"
  ], "benchmarkManifestContract.requiredFields");
  ensureArrayIncludesAll(benchmarkManifest.forbiddenInManifest, [
    "provider keys",
    "SSH private keys",
    "access tokens",
    "claims that training happened without training logs"
  ], "benchmarkManifestContract.forbiddenInManifest");

  const creationStages = Array.isArray(profile.creationStages) ? profile.creationStages : [];
  ensure(creationStages.length >= 6, "creationStages must include current, 20B, 70B, 150B, 512B, and highest-future stages");
  ensure(creationStages.some((item) => item.stage === "stage-1-20b-local-compatibility" && item.parameterClass === "20B" && item.status === "planned-not-validated"), "creationStages must include planned 20B local compatibility stage");
  ensure(creationStages.some((item) => item.stage === "stage-2-70b-research" && item.parameterClass === "70B" && item.status === "research-roadmap"), "creationStages must include 70B research stage");
  ensure(creationStages.some((item) => item.stage === "stage-3-150b-frontier" && item.parameterClass === "150B" && item.status === "frontier-research-roadmap"), "creationStages must include 150B frontier stage");
  ensure(creationStages.some((item) => item.stage === "stage-4-512b-apex" && item.parameterClass === "512B" && item.status === "apex-program-plan-only"), "creationStages must include 512B apex plan-only stage");
  ensure(creationStages.some((item) => item.stage === "stage-5-highest-available-future" && item.parameterClass === "highest-available-future" && item.status === "not-scoped"), "creationStages must include not-scoped highest future stage");

  const quantizationProfiles = Array.isArray(profile.quantizationProfiles) ? profile.quantizationProfiles : [];
  ensure(quantizationProfiles.length >= 3, "quantizationProfiles must include at least three planned lanes");
  ensure(quantizationProfiles.some((item) => item.id === "q4-planned-20b-16gb-candidate" && item.status === "planned-not-benchmarked" && item.routeEligibleToday === false), "quantizationProfiles must include a blocked Q4 20B candidate");
  ensure(quantizationProfiles.every((item) => item.routeEligibleToday === false), "quantizationProfiles must not be route eligible today");

  const runtimeCandidates = Array.isArray(profile.localRuntimeCandidates) ? profile.localRuntimeCandidates : [];
  ensure(runtimeCandidates.some((item) => item.id === "llama-cpp-compatible-runtime" && item.status === "candidate-only" && item.credentialRequirement === "none"), "localRuntimeCandidates must include a no-key llama.cpp-compatible candidate");
  ensure(runtimeCandidates.some((item) => item.id === "ollama-local-runtime" && item.status === "candidate-only" && item.credentialRequirement === "none"), "localRuntimeCandidates must include a no-key Ollama candidate");
  ensure(runtimeCandidates.every((item) => item.approvalRequiredBeforeUse === true), "localRuntimeCandidates must require approval before use");

  const ladder = Array.isArray(profile.scaleLadder) ? profile.scaleLadder : [];
  ensure(ladder.some((item) => item.parameterClass === "20B" && item.status === "planned-not-validated"), "scale ladder must include planned 20B target");
  ensure(ladder.some((item) => item.parameterClass === "70B" && item.status === "research-roadmap"), "scale ladder must include future 70B roadmap");
  ensure(ladder.some((item) => item.parameterClass === "150B" && item.status === "frontier-research-roadmap"), "scale ladder must include future 150B frontier roadmap");
  ensure(ladder.some((item) => item.parameterClass === "512B" && item.status === "apex-program-plan-only"), "scale ladder must include 512B apex plan-only target");
  ensure(ladder.some((item) => item.parameterClass === "highest-available-future" && item.status === "not-scoped"), "scale ladder must include unscoped highest future target");

  ensureArrayIncludesAll(
    (profile.hardwareTiers || []).map((tier) => tier.id),
    ["developer-16gb-plus", "workstation-32gb-plus", "research-64gb-plus", "cloud-research-runtime"],
    "hardwareTiers"
  );

  ensureArrayIncludesAll(profile.promotionGates, [
    "clean-room dataset plan",
    "16GB+ memory ceiling benchmark for 20B target",
    "150B frontier research plan with distributed runtime budget, privacy review, safety eval, observability, rollback plan, and explicit human approval",
    "512B apex AGI research plan with frontier cluster budget, AGI capability evaluation protocol, safety red-team, observability, rollback, cost-stop, all-agent review, and explicit human approval",
    "no-key core startup remains passing",
    "human approval before download, training, fine-tuning, publication, deployment, SSH, or paid benchmark"
  ], "promotionGates");

  ensure(profile.routerPolicy?.localOnlyRespected === true, "routerPolicy.localOnlyRespected must be true");
  ensure(profile.routerPolicy?.silentCloudFallbackAllowed === false, "routerPolicy must block silent cloud fallback");
  ensure(profile.routerPolicy?.missingKeyIsError === false, "routerPolicy must not confuse Missing Key with Error");
  ensure(profile.routerPolicy?.actualProviderAndModelMustBeVisible === true, "routerPolicy must keep actual provider/model visible");
  ensureArrayIncludesAll(profile.routerPolicy?.blockedToday, ["20B live inference", "70B live inference", "150B live inference", "512B live inference"], "routerPolicy.blockedToday");

  ensureArrayIncludesAll(profile.forbiddenClaims, [
    "SEIS has trained a 20B foundation model.",
    "SEIS has trained a 70B foundation model.",
    "SEIS has trained a 150B foundation model.",
    "SEIS has trained a 512B foundation model.",
    "SEIS has achieved real AGI.",
    "SEIS has downloadable or routeable 150B weights.",
    "Do not mark 16GB+ compatibility as verified before benchmark evidence exists."
  ], "forbiddenClaims");

  ensureArrayIncludesAll(profile.humanApprovalRequiredFor, [
    "model download",
    "training run",
    "fine-tuning run",
    "paid benchmark",
    "GPU or cloud provisioning",
    "SSH execution",
    "deployment",
    "provider credential setup"
  ], "humanApprovalRequiredFor");
}

if (providerRegistry) {
  ensure(providerRegistry.coreCredentialRequirement === "none", "provider registry coreCredentialRequirement must stay none");
  ensure(providerRegistry.defaultRoutingMode === "local-demo", "provider registry defaultRoutingMode must stay local-demo");
  ensure(providerRegistry.localOnlyRespected === true, "provider registry must respect local-only mode");
}

if (benchmarkManifestTemplate) {
  ensure(benchmarkManifestTemplate.id === "seis-20b-16gb-memory-benchmark", "benchmark manifest template id mismatch");
  ensure(benchmarkManifestTemplate.status === "template-not-measured", "benchmark manifest must stay template-not-measured until real measurements exist");
  ensure(benchmarkManifestTemplate.profileId === "seis-model-scaling-hardware-profile", "benchmark manifest profileId mismatch");
  ensure(benchmarkManifestTemplate.targetId === "seis-20b-local-compatibility-target", "benchmark manifest targetId mismatch");
  ensure(benchmarkManifestTemplate.targetParameterClass === "20B", "benchmark manifest targetParameterClass must be 20B");
  ensure(benchmarkManifestTemplate.targetRamClass === "16GB+ RAM", "benchmark manifest targetRamClass must be 16GB+ RAM");
  ensure(benchmarkManifestTemplate.compatibilityClaim === "not-verified", "benchmark manifest must keep compatibilityClaim not-verified");
  ensure(benchmarkManifestTemplate.benchmarkEvidenceAvailable === false, "benchmark manifest must not claim benchmark evidence");
  ensure(benchmarkManifestTemplate.runtimeAuthority === false, "benchmark manifest must not grant runtime authority");
  ensure(benchmarkManifestTemplate.routeEligibleToday === false, "benchmark manifest must not be route eligible");
  ensure(benchmarkManifestTemplate.productionReady === false, "benchmark manifest must not be production ready");
  ensure(String(benchmarkManifestTemplate.truthBoundary || "").includes("template only"), "benchmark manifest truthBoundary must say template only");
  ensure(String(benchmarkManifestTemplate.truthBoundary || "").includes("no measured memory evidence"), "benchmark manifest truthBoundary must forbid measured evidence claims");
  ensureArrayIncludesAll(benchmarkManifestTemplate.requiredBeforeUse, [
    "human approval for any model artifact download or runtime setup",
    "16GB+ memory ceiling benchmark measured on real hardware",
    "local-only fallback verified when memory ceiling is exceeded",
    "model card and dataset card reviewed"
  ], "benchmarkManifest.requiredBeforeUse");
  ensureArrayIncludesAll(Object.keys(benchmarkManifestTemplate.measurementTemplate || {}), [
    "machineRamGb",
    "runtimeName",
    "runtimeVersion",
    "modelArtifactId",
    "modelArtifactLicense",
    "quantization",
    "contextTokens",
    "peakResidentMemoryGb",
    "kvCacheMemoryGb",
    "osMemoryPressure",
    "wallClockStartupSeconds",
    "tokensPerSecond",
    "fallbackVerified",
    "secretsRedacted",
    "localOnlyFallbackPassed",
    "measuredAt",
    "verifiedBy"
  ], "benchmarkManifest.measurementTemplate");
  ensure(benchmarkManifestTemplate.measurementTemplate?.machineRamGb === null, "benchmark manifest must not include measured RAM yet");
  ensure(benchmarkManifestTemplate.measurementTemplate?.tokensPerSecond === null, "benchmark manifest must not include throughput yet");
  ensure(benchmarkManifestTemplate.measurementTemplate?.fallbackVerified === false, "benchmark manifest fallbackVerified must remain false before measurement");
  ensure(benchmarkManifestTemplate.measurementTemplate?.localOnlyFallbackPassed === false, "benchmark manifest localOnlyFallbackPassed must remain false before measurement");
  ensureArrayIncludesAll(benchmarkManifestTemplate.nonClaims, [
    "SEIS has not trained a 20B foundation model.",
    "SEIS has not run 20B inference.",
    "SEIS has not benchmarked 20B memory usage.",
    "SEIS has not verified 16GB+ compatibility."
  ], "benchmarkManifest.nonClaims");
}

if (benchmarkDryRun) {
  ensure(benchmarkDryRun.id === "seis-20b-benchmark-dry-run", "benchmark dry-run id mismatch");
  ensure(benchmarkDryRun.status === "dry-run-not-measured", "benchmark dry-run must stay dry-run-not-measured");
  ensure(benchmarkDryRun.targetId === "seis-20b-local-compatibility-target", "benchmark dry-run targetId mismatch");
  ensure(benchmarkDryRun.parameterClass === "20B", "benchmark dry-run parameterClass must be 20B");
  ensure(benchmarkDryRun.targetRamClass === "16GB+ RAM", "benchmark dry-run target RAM class mismatch");
  ensure(benchmarkDryRun.outputPath === paths.benchmarkDryRun, "benchmark dry-run outputPath mismatch");
  ensure(benchmarkDryRun.generatedBy === paths.benchmarkDryRunScript, "benchmark dry-run generatedBy mismatch");
  ensure(String(benchmarkDryRun.truthBoundary || "").includes("does not download a model"), "benchmark dry-run must forbid model downloads");
  ensure(String(benchmarkDryRun.truthBoundary || "").includes("benchmark memory"), "benchmark dry-run must not claim memory benchmark execution");
  ensure(benchmarkDryRun.sourceOfTruth?.modelScalingProfile === paths.profile, "benchmark dry-run source profile mismatch");
  ensure(benchmarkDryRun.sourceOfTruth?.benchmarkManifestTemplate === paths.benchmarkManifest, "benchmark dry-run source benchmark template mismatch");
  ensure(benchmarkDryRun.sourceOfTruth?.modelCardTemplate === paths.modelCardTemplate, "benchmark dry-run source model card mismatch");
  ensure(benchmarkDryRun.sourceOfTruth?.datasetCardTemplate === paths.datasetCardTemplate, "benchmark dry-run source dataset card mismatch");
  ensure(benchmarkDryRun.sourceOfTruth?.hostHardwarePreflight === paths.localHardwarePreflight, "benchmark dry-run source host preflight mismatch");
  ensure(benchmarkDryRun.sourceStatuses?.profileStatus === "planned-compatibility-contract", "benchmark dry-run profile status mismatch");
  ensure(benchmarkDryRun.sourceStatuses?.targetCompatibilityStatus === "planned-not-validated", "benchmark dry-run target compatibility status mismatch");
  ensure(benchmarkDryRun.sourceStatuses?.targetTrainingStatus === "not-started", "benchmark dry-run target training status mismatch");
  ensure(benchmarkDryRun.sourceStatuses?.benchmarkManifestStatus === "template-not-measured", "benchmark dry-run manifest status mismatch");
  ensure(benchmarkDryRun.sourceStatuses?.benchmarkCompatibilityClaim === "not-verified", "benchmark dry-run compatibility claim mismatch");
  ensure(benchmarkDryRun.sourceStatuses?.modelCardStatus === "template-not-filled", "benchmark dry-run model card status mismatch");
  ensure(benchmarkDryRun.sourceStatuses?.datasetCardStatus === "template-not-filled", "benchmark dry-run dataset card status mismatch");
  ensure(benchmarkDryRun.sourceStatuses?.memoryBudgetStatus === "planning-estimate-not-benchmark-evidence", "benchmark dry-run memory budget status mismatch");
  for (const [key, value] of Object.entries(benchmarkDryRun.dryRunResult || {})) {
    ensure(value === false, `benchmark dry-run ${key} must remain false`);
  }
  ensure(Array.isArray(benchmarkDryRun.readinessGates) && benchmarkDryRun.readinessGates.length >= 5, "benchmark dry-run must include readiness gates");
  ensure(benchmarkDryRun.readinessGates.some((gate) => gate.id === "host-preflight" && gate.status === "available-not-sufficient"), "benchmark dry-run must keep host preflight insufficient");
  ensure(benchmarkDryRun.readinessGates.some((gate) => gate.id === "measured-memory-benchmark" && gate.status === "blocked"), "benchmark dry-run must block measured benchmark");
  ensureArrayIncludesAll(benchmarkDryRun.requiredBeforeRealBenchmark, [
    "explicit human approval for model artifact selection",
    "completed 20B model card",
    "completed 20B dataset card or benchmark-data card",
    "measurement command that cannot upload prompts, files, logs, or repo data to providers"
  ], "benchmarkDryRun.requiredBeforeRealBenchmark");
  ensureArrayIncludesAll(benchmarkDryRun.forbiddenClaims, [
    "SEIS has trained a 20B foundation model.",
    "SEIS has run 20B inference.",
    "SEIS has benchmarked 20B memory usage.",
    "SEIS has verified 16GB+ compatibility."
  ], "benchmarkDryRun.forbiddenClaims");
}

if (parameterLadder) {
  ensure(parameterLadder.id === "seis-model-parameter-ladder", "parameter ladder id mismatch");
  ensure(parameterLadder.status === "planning-contract-not-runtime", "parameter ladder must stay planning-contract-not-runtime");
  ensure(parameterLadder.resourceUri === "seis://ai/model-parameter-ladder.json", "parameter ladder resource URI mismatch");
  ensure(parameterLadder.routeEligibleToday === false, "parameter ladder must not be route eligible today");
  ensure(String(parameterLadder.truthBoundary || "").includes("creates no trained model"), "parameter ladder must forbid trained model claims");
  ensureArrayIncludesAll(
    (parameterLadder.targets || []).map((target) => target.parameterClass),
    ["20B", "70B", "150B", "300B+", "512B", "highest-available-future"],
    "parameterLadder.targets.parameterClass"
  );
  ensure((parameterLadder.targets || []).every((target) => target.routeEligibleToday === false), "parameter ladder targets must not be route eligible");
  ensure((parameterLadder.targets || []).every((target) => target.runtimeAuthority === false), "parameter ladder targets must not grant runtime authority");
  ensure((parameterLadder.targets || []).every((target) => target.trainingStatus === "not-started"), "parameter ladder targets must keep training not-started");
  ensureArrayIncludesAll(parameterLadder.promotionOrder, ["20B", "70B", "150B", "300B+", "512B", "highest-available-future"], "parameterLadder.promotionOrder");
}

if (frontierEscalationPolicy) {
  ensure(frontierEscalationPolicy.id === "seis-model-frontier-escalation-policy", "frontier escalation policy id mismatch");
  ensure(frontierEscalationPolicy.status === "policy-active-research-gated", "frontier escalation policy status mismatch");
  ensure(frontierEscalationPolicy.resourceUri === "seis://ai/model-frontier-escalation-policy.json", "frontier escalation policy resourceUri mismatch");
  ensure(frontierEscalationPolicy.qualityGate === "npm run check:seis-model-frontier-escalation-policy", "frontier escalation policy qualityGate mismatch");
  ensure(frontierEscalationPolicy.routeEligibleToday === false, "frontier escalation policy must not grant route eligibility today");
  ensure((frontierEscalationPolicy.escalationStages || []).some((stage) => stage.id === "stage-3-150b-frontier" && stage.status === "frontier-research-roadmap"), "frontier escalation policy must include the 150B frontier stage");
  ensure((frontierEscalationPolicy.decisionRules || []).some((rule) => rule.id === "no-skip-20b" && rule.enforcedStatus === "blocked"), "frontier escalation policy must enforce no-skip-20b");
}

if (frontierModelProgram) {
  ensure(frontierModelProgram.id === "seis-150b-frontier-model-program", "150B frontier model program id mismatch");
  ensure(frontierModelProgram.status === "frontier-program-plan-only", "150B frontier model program must remain plan-only");
  ensure(frontierModelProgram.resourceUri === "seis://ai/150b-frontier-model-program.json", "150B frontier model program resourceUri mismatch");
  ensure(frontierModelProgram.qualityGate === "npm run check:seis-150b-frontier-model-program", "150B frontier model program qualityGate mismatch");
  ensure(frontierModelProgram.routeEligibleToday === false, "150B frontier model program must not be route eligible");
  ensure(frontierModelProgram.runtimeAuthority === false, "150B frontier model program must not grant runtime authority");
  ensure(frontierModelProgram.trainingStatus === "not-started", "150B frontier model program training must stay not-started");
  ensure(frontierModelProgram.weightsAvailable === false, "150B frontier model program must not claim weights");
  ensure(frontierModelProgram.inferenceAvailable === false, "150B frontier model program must not claim inference");
  ensure(frontierModelProgram.benchmarkStatus === "not-run", "150B frontier model program benchmark must stay not-run");
  ensure(frontierModelProgram.productionReady === false, "150B frontier model program must not be production ready");
  ensure((frontierModelProgram.programStages || []).length === 6, "150B frontier model program must expose six stages");
}

if (modelCardTemplate) {
  ensure(modelCardTemplate.id === "seis-20b-model-card-template", "model card template id mismatch");
  ensure(modelCardTemplate.status === "template-not-filled", "model card template must stay template-not-filled");
  ensure(modelCardTemplate.targetId === "seis-20b-local-compatibility-target", "model card template targetId mismatch");
  ensure(modelCardTemplate.profileId === "seis-model-scaling-hardware-profile", "model card template profileId mismatch");
  ensure(modelCardTemplate.parameterClass === "20B", "model card template parameterClass must be 20B");
  ensure(modelCardTemplate.routeEligibleToday === false, "model card template must not be route eligible");
  ensure(modelCardTemplate.runtimeAuthority === false, "model card template must not grant runtime authority");
  ensure(modelCardTemplate.productionReady === false, "model card template must not be production ready");
  ensure(modelCardTemplate.weightsAvailable === false, "model card template must not claim weights");
  ensure(modelCardTemplate.trainingStatus === "not-started", "model card template must keep training not-started");
  ensure(modelCardTemplate.benchmarkEvidenceAvailable === false, "model card template must not claim benchmark evidence");
  ensure(String(modelCardTemplate.truthBoundary || "").includes("Template only"), "model card template truthBoundary must say template only");
  ensure(String(modelCardTemplate.truthBoundary || "").includes("does not claim SEIS owns trained foundation-model weights"), "model card template must forbid foundation-model ownership claims");
  ensureArrayIncludesAll(modelCardTemplate.requiredBeforeFilled, [
    "model artifact id and version",
    "model artifact license and redistribution rights review",
    "clean-room provenance statement",
    "safety evaluation summary",
    "memory benchmark reference",
    "redacted runtime logs"
  ], "modelCardTemplate.requiredBeforeFilled");
  ensureArrayIncludesAll(modelCardTemplate.approvalRequiredFor, [
    "model download",
    "runtime adapter setup",
    "benchmark execution",
    "training run",
    "fine-tuning run",
    "publication",
    "route eligibility change"
  ], "modelCardTemplate.approvalRequiredFor");
  ensureArrayIncludesAll(modelCardTemplate.forbiddenClaims, [
    "SEIS has trained a 20B foundation model.",
    "SEIS has downloaded 20B weights.",
    "SEIS has run 20B inference.",
    "SEIS has benchmarked 20B memory usage.",
    "SEIS has verified 16GB+ compatibility.",
    "SEIS has routeable 20B weights."
  ], "modelCardTemplate.forbiddenClaims");
}

if (datasetCardTemplate) {
  ensure(datasetCardTemplate.id === "seis-20b-dataset-card-template", "dataset card template id mismatch");
  ensure(datasetCardTemplate.status === "template-not-filled", "dataset card template must stay template-not-filled");
  ensure(datasetCardTemplate.targetId === "seis-20b-local-compatibility-target", "dataset card template targetId mismatch");
  ensure(datasetCardTemplate.profileId === "seis-model-scaling-hardware-profile", "dataset card template profileId mismatch");
  ensure(datasetCardTemplate.parameterClass === "20B", "dataset card template parameterClass must be 20B");
  ensure(datasetCardTemplate.datasetDownloadAuthorized === false, "dataset card template must not authorize dataset download");
  ensure(datasetCardTemplate.trainingAuthorized === false, "dataset card template must not authorize training");
  ensure(datasetCardTemplate.fineTuningAuthorized === false, "dataset card template must not authorize fine-tuning");
  ensure(datasetCardTemplate.benchmarkDatasetAuthorized === false, "dataset card template must not authorize benchmark datasets");
  ensure(datasetCardTemplate.routeEligibleToday === false, "dataset card template must not be route eligible");
  ensure(String(datasetCardTemplate.truthBoundary || "").includes("Template only"), "dataset card template truthBoundary must say template only");
  ensureArrayIncludesAll(datasetCardTemplate.allowedSourceClasses, [
    "SEIS-owned synthetic data after review",
    "user-authored data with explicit permission",
    "public-domain data with provenance review",
    "permissively licensed data with license compatibility review"
  ], "datasetCardTemplate.allowedSourceClasses");
  ensureArrayIncludesAll(datasetCardTemplate.forbiddenSourceClasses, [
    "private user data without explicit permission",
    "secrets, tokens, credentials, or keys",
    "unclear-license scraped data",
    "leaked, proprietary, or access-controlled material",
    "personal data without privacy review",
    "copyrighted material copied without rights"
  ], "datasetCardTemplate.forbiddenSourceClasses");
  ensureArrayIncludesAll(datasetCardTemplate.requiredBeforeFilled, [
    "source inventory",
    "license map",
    "rights and attribution review",
    "PII and secret scan",
    "safety and toxicity review",
    "deduplication plan",
    "dataset split plan"
  ], "datasetCardTemplate.requiredBeforeFilled");
  ensureArrayIncludesAll(datasetCardTemplate.approvalRequiredFor, [
    "dataset download",
    "dataset ingestion",
    "training run",
    "fine-tuning run",
    "benchmark execution",
    "provider upload",
    "dataset publication"
  ], "datasetCardTemplate.approvalRequiredFor");
  ensureArrayIncludesAll(datasetCardTemplate.forbiddenClaims, [
    "SEIS has approved a 20B training dataset.",
    "SEIS has downloaded a 20B training dataset.",
    "SEIS has completed dataset rights review.",
    "SEIS has completed dataset privacy review.",
    "SEIS has trained or fine-tuned a 20B foundation model."
  ], "datasetCardTemplate.forbiddenClaims");
}

if (workforceTrainingPlan) {
  ensure(String(workforceTrainingPlan.truthBoundary || "").includes("no cloud fine-tuning"), "workforce plan must still forbid cloud fine-tuning");
  ensure(String(workforceTrainingPlan.truthBoundary || "").includes("no claim that SEIS owns a trained foundation model"), "workforce plan must still forbid foundation-model ownership claims");
}

if (modelPromotionPolicy) {
  ensure(modelPromotionPolicy.totals?.runtimeAuthorityCount === 0, "promotion policy must keep runtime authority count at zero");
  ensure(modelPromotionPolicy.totals?.productionBlockedCount === modelPromotionPolicy.totals?.modelCount, "all current seed models must remain production-blocked");
}

if (pluginIntegration) {
  ensure(pluginIntegration.runtimeIntegration?.modelScalingTool === "seis_ai_core_model_scaling_status", "plugin integration must expose model scaling tool");
  ensureArrayIncludesAll(pluginIntegration.runtimeIntegration?.mcpResources, [
    "seis://ai/model-scaling-hardware-profile.json",
    "seis://ai/model-parameter-ladder.json",
    "seis://ai/model-frontier-escalation-policy.json",
    "seis://ai/150b-frontier-model-program.json",
    "seis://ai/20b-model-card-template.json",
    "seis://ai/20b-dataset-card-template.json"
  ], "pluginIntegration.runtimeIntegration.mcpResources");
  ensureArrayIncludesAll(pluginIntegration.qualityCommands, [
    "npm run check:seis-model-scaling-hardware-profile",
    "npm run check:seis-model-frontier-escalation-policy",
    "npm run check:seis-150b-frontier-model-program",
    "npm run check:seis-model-parameter-ladder"
  ], "pluginIntegration.qualityCommands");
}

for (const [text, label] of [
  [scalingDoc, "model scaling docs"],
  [aiCoreDoc, "AI Core docs"],
  [modelRouterDoc, "model router docs"]
]) {
  for (const token of [
    "content/development/seis-model-scaling-hardware-profile.json",
    "seis_ai_core_model_scaling_status",
    "20B",
    "70B",
    "150B",
    "16GB+"
  ]) {
    ensure(text.includes(token), `${label} missing ${token}`);
  }
}

for (const token of [
  "memory budget contract",
  "16GB+ Compatibility Profiles",
  "Benchmark Manifest Contract",
  "20B Benchmark Dry-Run",
  "Frontier Escalation Policy",
  "150B Frontier Model Program",
  "Command Center 20B Local Preflight",
  "Host Hardware Preflight",
  "20B Model And Dataset Card Templates",
  "What SEIS 20B Means Right Now",
  "Creation Stages",
  "Q4-class",
  "llama.cpp-compatible local runtime",
  "Ollama local runtime",
  "150B Frontier Research Target"
]) {
  ensure(scalingDoc.includes(token), `model scaling docs missing ${token}`);
}

ensure(scalingDoc.includes("/home/seis/Documents/seis-20b-local-preflight.md"), "model scaling docs must describe the Command Center preflight export path");
ensure(scalingDoc.includes("It is not benchmark evidence"), "model scaling docs must keep Command Center preflight separate from benchmark evidence");
ensure(scalingDoc.includes("npm run inspect:seis-model-local-hardware"), "model scaling docs must describe the host hardware preflight command");
ensure(scalingDoc.includes("dist/qa/model-scaling/local-hardware-preflight.json"), "model scaling docs must describe the ignored host hardware preflight output");
ensure(scalingDoc.includes("reports/seis-model-scaling/20b-benchmark-dry-run.json"), "model scaling docs must describe the 20B benchmark dry-run report path");
ensure(scalingDoc.includes("content/development/seis-model-parameter-ladder.json"), "model scaling docs must describe the model parameter ladder path");
ensure(scalingDoc.includes("seis://ai/model-parameter-ladder.json"), "model scaling docs must describe the model parameter ladder MCP resource");
ensure(scalingDoc.includes("content/development/seis-model-frontier-escalation-policy.json"), "model scaling docs must describe the frontier escalation policy path");
ensure(scalingDoc.includes("seis://ai/model-frontier-escalation-policy.json"), "model scaling docs must describe the frontier escalation policy MCP resource URI");
ensure(scalingDoc.includes("npm run check:seis-model-frontier-escalation-policy"), "model scaling docs must describe the frontier escalation policy check command");
ensure(scalingDoc.includes("content/development/seis-150b-frontier-model-program.json"), "model scaling docs must describe the 150B frontier model program path");
ensure(scalingDoc.includes("seis://ai/150b-frontier-model-program.json"), "model scaling docs must describe the 150B frontier model program MCP resource URI");
ensure(scalingDoc.includes("npm run check:seis-150b-frontier-model-program"), "model scaling docs must describe the 150B frontier model program check command");
ensure(scalingDoc.includes("no-skip-20b"), "model scaling docs must describe the no-skip-20b escalation rule");
ensure(scalingDoc.includes("npm run automation:seis-20b-benchmark-dry-run"), "model scaling docs must describe the 20B benchmark dry-run automation command");
ensure(scalingDoc.includes("npm run check:seis-20b-benchmark-dry-run"), "model scaling docs must describe the 20B benchmark dry-run check command");
ensure(scalingDoc.includes("content/development/seis-20b-model-card-template.json"), "model scaling docs must describe the 20B model card template path");
ensure(scalingDoc.includes("content/development/seis-20b-dataset-card-template.json"), "model scaling docs must describe the 20B dataset card template path");
ensure(scalingDoc.includes("template-not-filled"), "model scaling docs must describe template-not-filled evidence card status");

for (const [text, label] of [
  [helper, "AI Core helper"],
  [tools, "agent tools"]
]) {
  ensure(text.includes("AI_CORE_MODEL_SCALING_STATUS_TOOL"), `${label} must expose AI_CORE_MODEL_SCALING_STATUS_TOOL`);
  ensure(text.includes("aiCoreModelScalingStatus"), `${label} must reference aiCoreModelScalingStatus`);
  ensure(text.includes("seis-model-scaling-hardware-profile.json"), `${label} must reference model scaling profile path`);
}

for (const token of [
  "memoryBudgetContract",
  "frontierEscalationPolicy",
  "frontierModelProgram",
  "compatibilityProfiles",
  "benchmarkManifestContract",
  "creationStages",
  "quantizationProfiles",
  "localRuntimeCandidates"
]) {
  ensure(helper.includes(token), `AI Core helper must expose ${token}`);
}

ensure(tools.includes("memory budget contract"), "agent tools must describe the memory budget contract");
ensure(tools.includes("compatibility profiles"), "agent tools must describe compatibility profiles");
ensure(tools.includes("benchmark manifest contract"), "agent tools must describe the benchmark manifest contract");
ensure(tools.includes("quantization lanes"), "agent tools must describe quantization lanes");
ensure(tools.includes("local runtime candidates"), "agent tools must describe local runtime candidates");
ensure(tools.includes("150B frontier research lane"), "agent tools must describe the 150B frontier research lane");
ensure(mcpServer.includes("AI_CORE_MODEL_SCALING_STATUS_TOOL"), "MCP server must expose AI_CORE_MODEL_SCALING_STATUS_TOOL");
ensure(mcpServer.includes("aiCoreModelScalingStatus"), "MCP server must reference aiCoreModelScalingStatus");
ensure(mcpServer.includes("seis://ai/model-scaling-hardware-profile.json"), "MCP server must expose model scaling profile resource");
ensure(mcpServer.includes("seis://ai/150b-frontier-model-program.json"), "MCP server must expose the 150B frontier model program resource");
ensure(mcpServer.includes("compatibility profiles"), "MCP server must describe compatibility profiles");
ensure(mcpServer.includes("benchmark manifest contract"), "MCP server must describe the benchmark manifest contract");
ensure(mcpServer.includes("memory budget contract"), "MCP server must describe the memory budget contract");
ensure(mcpServer.includes("quantization lanes"), "MCP server must describe quantization lanes");
ensure(mcpServer.includes("local runtime candidates"), "MCP server must describe local runtime candidates");
ensure(mcpServer.includes("150B frontier research lane"), "MCP server must describe the 150B frontier research lane");
ensure(mcpSmokeTest.includes("seis://ai/model-scaling-hardware-profile.json"), "MCP smoke test must read model scaling profile resource");
ensure(mcpSmokeTest.includes("seis://ai/150b-frontier-model-program.json"), "MCP smoke test must read 150B frontier model program resource");
ensure(mcpSmokeTest.includes("seis_ai_core_model_scaling_status"), "MCP smoke test must call model scaling status tool");

for (const token of [
  "os.totalmem()",
  "host-observed-not-benchmark",
  "compatibilityClaim: \"not-verified\"",
  "modelCompatibilityVerified: false",
  "measuredBenchmark: false",
  "routeEligibleToday: false",
  "SEIS has verified 16GB+ compatibility."
]) {
  ensure(localHardwarePreflight.includes(token), `local hardware preflight missing ${token}`);
}

for (const token of [
  "seis-20b-benchmark-dry-run",
  "dry-run-not-measured",
  "does not download a model",
  "canRequestRealBenchmarkToday: false",
  "routeEligibleToday: false",
  "modelDownloadAuthorized: false",
  "datasetDownloadAuthorized: false",
  "trainingAuthorized: false",
  "SEIS has verified 16GB+ compatibility."
]) {
  ensure(benchmarkDryRunScript.includes(token), `20B benchmark dry-run script missing ${token}`);
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-model-scaling-hardware-profile"] === "node scripts/check-seis-model-scaling-hardware-profile.mjs",
    "package.json must expose check:seis-model-scaling-hardware-profile"
  );
  ensure(
    packageJson.scripts?.["check:seis-model-parameter-ladder"] === "node scripts/check-seis-model-parameter-ladder.mjs",
    "package.json must expose check:seis-model-parameter-ladder"
  );
  ensure(
    packageJson.scripts?.["check:seis-model-local-hardware-preflight"] === "node scripts/inspect-seis-model-local-hardware.mjs --check",
    "package.json must expose check:seis-model-local-hardware-preflight"
  );
  ensure(
    packageJson.scripts?.["automation:seis-20b-benchmark-dry-run"] === "node scripts/create-seis-20b-benchmark-dry-run.mjs --write",
    "package.json must expose automation:seis-20b-benchmark-dry-run"
  );
  ensure(
    packageJson.scripts?.["check:seis-20b-benchmark-dry-run"] === "node scripts/create-seis-20b-benchmark-dry-run.mjs --check",
    "package.json must expose check:seis-20b-benchmark-dry-run"
  );
  ensure(
    packageJson.scripts?.["inspect:seis-model-local-hardware"] === "node scripts/inspect-seis-model-local-hardware.mjs",
    "package.json must expose inspect:seis-model-local-hardware"
  );
  ensure(
    packageJson.scripts?.["inspect:seis-model-local-hardware:write"] === "node scripts/inspect-seis-model-local-hardware.mjs --write",
    "package.json must expose inspect:seis-model-local-hardware:write"
  );
}

for (const [relativePath, label] of [
  [paths.profile, "model scaling profile"],
  [paths.scalingDoc, "model scaling docs"],
  [paths.benchmarkDryRun, "20B benchmark dry-run report"],
  [paths.aiCoreDoc, "AI Core docs"],
  [paths.modelRouterDoc, "model router docs"]
]) {
  requireNoPrematureClaims(relativePath, label);
}

finish("SEIS model scaling hardware profile check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  if (!relativePath || !fs.existsSync(path.join(root, relativePath)) || !fs.statSync(path.join(root, relativePath)).isFile()) {
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

function requireNoPrematureClaims(relativePath, label) {
  const text = readText(relativePath, label);
  const restricted = [
    "trained 20B foundation model",
    "trained 70B foundation model",
    "trained 150B foundation model",
    "20B model is available",
    "70B model is available",
    "150B model is available",
    "20B inference is available",
    "70B inference is available",
    "150B inference is available",
    "16GB+ compatibility is verified",
    "production-ready 20B",
    "production-ready 70B",
    "production-ready 150B"
  ];

  for (const phrase of restricted) {
    if (text.includes(phrase)) {
      failures.push(`${label} must not include premature claim: ${phrase}`);
    }
  }
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS model scaling hardware profile check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
