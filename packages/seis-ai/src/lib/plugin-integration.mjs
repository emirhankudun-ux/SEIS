import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { assertNoCredentialLikeJsonContent } from "./credential-safety.mjs";
import { resolveInside } from "./repo.mjs";

export const PLUGIN_INTEGRATION_PATH = "content/development/seis-agent-plugin-integration.json";
export const MCP_RUNTIME_CONTRACT_PATH = "content/development/seis-ai-core-mcp-runtime-contract.json";
export const AI_CORE_PROVIDER_REGISTRY_PATH = "content/development/seis-ai-core-provider-registry.json";
export const AI_CORE_READ_ONLY_ROUTER_RUNTIME_PATH = "content/development/seis-ai-core-read-only-router-runtime.json";
export const AI_CORE_READ_ONLY_ROUTER_RUNTIME_RESOURCE_URI = "seis://ai/read-only-router-runtime.json";
export const AI_CORE_MODEL_SCALING_PROFILE_PATH = "content/development/seis-model-scaling-hardware-profile.json";
export const AI_CORE_FRONTIER_TRAINING_LAUNCH_PLAN_PATH = "content/development/seis-frontier-training-launch-plan.json";
export const AI_CORE_FRONTIER_TRAINING_LAUNCH_PLAN_RESOURCE_URI = "seis://ai/frontier-training-launch-plan.json";
export const AI_CORE_MODEL_PARAMETER_LADDER_PATH = "content/development/seis-model-parameter-ladder.json";
export const AI_CORE_MODEL_PARAMETER_LADDER_RESOURCE_URI = "seis://ai/model-parameter-ladder.json";
export const AI_CORE_MODEL_FRONTIER_ESCALATION_POLICY_PATH = "content/development/seis-model-frontier-escalation-policy.json";
export const AI_CORE_MODEL_FRONTIER_ESCALATION_POLICY_RESOURCE_URI = "seis://ai/model-frontier-escalation-policy.json";
export const AI_CORE_MODEL_SCALING_SUBAGENT_COUNCIL_PATH = "content/development/seis-model-scaling-subagent-council.json";
export const AI_CORE_150B_FRONTIER_MODEL_PROGRAM_PATH = "content/development/seis-150b-frontier-model-program.json";
export const AI_CORE_150B_FRONTIER_MODEL_PROGRAM_RESOURCE_URI = "seis://ai/150b-frontier-model-program.json";
export const AI_CORE_512B_APEX_MODEL_PROGRAM_PATH = "content/development/seis-512b-apex-model-program.json";
export const AI_CORE_512B_APEX_MODEL_PROGRAM_RESOURCE_URI = "seis://ai/512b-apex-model-program.json";
export const AI_CORE_AGI_EVALUATION_PROTOCOL_PATH = "content/development/seis-agi-evaluation-protocol.json";
export const AI_CORE_AGI_EVALUATION_PROTOCOL_RESOURCE_URI = "seis://ai/agi-evaluation-protocol.json";
export const AI_CORE_AGI_PUBLIC_READINESS_EVIDENCE_PATH = "content/development/seis-agi-public-readiness-evidence.json";
export const AI_CORE_AGI_PUBLIC_READINESS_EVIDENCE_RESOURCE_URI = "seis://ai/agi-public-readiness-evidence.json";
export const AI_CORE_AGI_GITHUB_USER_READINESS_GATES_PATH = "content/development/seis-agi-github-user-readiness-gates.json";
export const AI_CORE_AGI_GITHUB_USER_READINESS_GATES_RESOURCE_URI = "seis://ai/agi-github-user-readiness-gates.json";
export const AI_CORE_20B_MODEL_CARD_TEMPLATE_PATH = "content/development/seis-20b-model-card-template.json";
export const AI_CORE_20B_DATASET_CARD_TEMPLATE_PATH = "content/development/seis-20b-dataset-card-template.json";
export const AI_CORE_20B_BENCHMARK_MANIFEST_PATH = "reports/seis-model-scaling/20b-16gb-memory-benchmark.json";
export const AI_CORE_20B_BENCHMARK_DRY_RUN_PATH = "reports/seis-model-scaling/20b-benchmark-dry-run.json";
export const AI_CORE_LOCAL_HARDWARE_PREFLIGHT_CHECK_PATH = "scripts/check-seis-model-local-hardware-preflight.mjs";
export const AI_CORE_VERSION_REGISTRY_PATH = "content/development/seis-ai-core-version-registry.json";
export const AI_CORE_VERSION_PROMOTION_GATES_PATH = "content/development/seis-ai-core-version-promotion-gates.json";
export const SUBAGENT_OPERATING_MODEL_PATH = "content/development/seis-ai-core-subagent-operating-model.json";
export const SUBAGENT_LONG_HORIZON_PLAN_PATH = "content/development/seis-sub-agent-5-year-plan.json";
export const SUBAGENT_LONG_HORIZON_PLAN_VIEW_PATH = "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json";
export const SUBAGENT_LONG_HORIZON_REVIEW_PATH = "docs/reviews/SUB_AGENT_LONG_HORIZON_AUDIT.md";
export const SUBAGENT_ROLE_SCHEMA_PATH = "content/development/seis-ai-core-agent-role-schema.json";
export const SUBAGENT_PERMISSION_MATRIX_PATH = "content/development/seis-ai-core-agent-permission-matrix.json";
export const SUBAGENT_DRY_RUN_QUEUE_PATH = "content/development/seis-ai-core-dry-run-task-queue.json";
export const SUBAGENT_CANCELLATION_FIXTURE_PATH = "content/development/seis-ai-core-cancellation-fixture.json";
export const SUBAGENT_APPROVAL_FIXTURE_PATH = "content/development/seis-ai-core-approval-fixture.json";
export const SUBAGENT_REDACTION_FIXTURE_PATH = "content/development/seis-ai-core-redaction-fixture.json";
export const SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH = "content/development/seis-ai-core-execution-ledger-fixture.json";
export const SUBAGENT_RUNTIME_FIXTURES_PATH = "content/development/seis-ai-core-subagent-runtime-fixtures.json";
export const SUBAGENT_REVIEW_LEDGER_PATH = "content/development/seis-ai-core-subagent-review-ledger.json";
export const SUBAGENT_OPERATING_MODEL_TOOL = "seis_ai_core_subagent_model";
export const SUBAGENT_DRY_RUN_TASK_TOOL = "seis_ai_core_subagent_dry_run";
export const SUBAGENT_REVIEW_LEDGER_TOOL = "seis_ai_core_subagent_review_ledger";
export const AI_CORE_PROVIDER_STATUS_TOOL = "seis_ai_core_provider_status";
export const AI_CORE_MODEL_SCALING_STATUS_TOOL = "seis_ai_core_model_scaling_status";
export const AI_CORE_FRONTIER_TRAINING_STATUS_TOOL = "seis_ai_core_frontier_training_status";
export const AI_CORE_VERSION_STATUS_TOOL = "seis_ai_core_version_status";
export const AI_CORE_VERSION_PROMOTION_TOOL = "seis_ai_core_version_promotion_dry_run";
const FRONTIER_TRAINING_REQUIRED_AGENT_IDS = [
  "architect-agent",
  "code-agent",
  "design-agent",
  "ui-ux-agent",
  "research-agent",
  "search-agent",
  "security-agent",
  "devops-agent",
  "documentation-agent",
  "qa-agent",
  "cloud-agent",
  "automation-agent",
];
const FRONTIER_TRAINING_FALSE_FIELDS = [
  "trainingAuthorized",
  "externalJobAuthorized",
  "routeEligibleToday",
  "runtimeAuthority",
  "checkpointExists",
  "benchmarkEvidenceAvailable",
  "agiClaimAllowed",
];
export const PERSONAL_PLUGIN_LANE_TOOLS = [
  {
    laneId: "seis",
    displayName: "SEIS Hub",
    statusTool: "seis_hub_status",
    planTool: "seis_hub_plan",
  },
  {
    laneId: "seis-cloud",
    displayName: "SEIS Cloud",
    statusTool: "seis_cloud_status",
    planTool: "seis_cloud_plan",
  },
  {
    laneId: "seis-code",
    displayName: "SEIS-Code",
    statusTool: "seis_code_status",
    planTool: "seis_code_plan",
  },
  {
    laneId: "seis-design",
    displayName: "SEIS-Design",
    statusTool: "seis_design_status",
    planTool: "seis_design_plan",
  },
  {
    laneId: "seis-data",
    displayName: "SEIS-DATA",
    statusTool: "seis_data_status",
    planTool: "seis_data_plan",
  },
];

const LANE_PLAN_STEPS = {
  "seis": [
    "Inspect git status, active branch, remote, and SEIS source-of-truth documents.",
    "Classify the request as governance, migration, plugin coordination, repository safety, or product build routing.",
    "Use existing SEIS manifests, docs, scripts, and validation gates before creating parallel records.",
    "Keep deletion, publication, and GitHub mutation behind explicit human approval.",
    "Record validation, uncertainty, and the next safe action before making readiness claims.",
  ],
  "seis-cloud": [
    "Inspect git status, branch, remote, and current cloud target records.",
    "Classify the access audience as public cloud or team/workplace VPN cloud.",
    "Identify provider, server target, secrets boundary, public URL, rollback owner, and authentication scope.",
    "Run or update provider-neutral preflight records before any provider-specific mutation.",
    "Keep apply, deploy, SSH, firewall, VPN, and credential changes behind explicit human approval.",
  ],
  "seis-code": [
    "Inspect git status, branch, remote, package manifests, tests, scripts, and nearby docs.",
    "Map the affected lane: web, backend/API, MCP/plugin, automation, CI, native platform, security, or docs.",
    "Implement the smallest durable engineering change that follows existing patterns.",
    "Run scoped tests or checks tied to touched paths.",
    "Record validation, risks, rollback notes, and changed files.",
  ],
  "seis-design": [
    "Read the current product surface and audience context.",
    "Map workflow, accessibility, responsive, reduced-motion, and content-design requirements.",
    "Reuse existing typography, spacing, tokens, components, routes, and interaction patterns.",
    "Validate with browser screenshots or static UI checks when a runnable surface exists.",
    "Document durable design decisions and remaining risks.",
  ],
  "seis-data": [
    "Classify the source record, generated output, schema, analytics artifact, knowledge item, or dataset.",
    "Check sensitivity and provenance before reading, transforming, exporting, or committing data.",
    "Find the source of truth and generator before editing records.",
    "Preserve deterministic ordering and regenerate paired reports when source records change.",
    "Validate JSON, schema expectations, privacy, provenance, and relevant checks.",
  ],
};

export function readPluginIntegration(repoRoot) {
  const filePath = path.join(repoRoot, ...PLUGIN_INTEGRATION_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS plugin integration manifest is missing: ${PLUGIN_INTEGRATION_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readSubagentOperatingModel(repoRoot) {
  const filePath = path.join(repoRoot, ...SUBAGENT_OPERATING_MODEL_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS AI Core sub-agent operating model is missing: ${SUBAGENT_OPERATING_MODEL_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readSubagentReviewLedger(repoRoot) {
  const filePath = path.join(repoRoot, ...SUBAGENT_REVIEW_LEDGER_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS AI Core sub-agent review ledger is missing: ${SUBAGENT_REVIEW_LEDGER_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readAiCoreVersionRegistry(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_VERSION_REGISTRY_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS AI Core version registry is missing: ${AI_CORE_VERSION_REGISTRY_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readAiCoreVersionPromotionGates(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_VERSION_PROMOTION_GATES_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS AI Core version promotion gates are missing: ${AI_CORE_VERSION_PROMOTION_GATES_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readAiCoreProviderRegistry(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_PROVIDER_REGISTRY_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS AI Core provider registry is missing: ${AI_CORE_PROVIDER_REGISTRY_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readAiCoreModelScalingProfile(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_MODEL_SCALING_PROFILE_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS model scaling hardware profile is missing: ${AI_CORE_MODEL_SCALING_PROFILE_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readAiCoreFrontierTrainingLaunchPlan(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_FRONTIER_TRAINING_LAUNCH_PLAN_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS frontier training launch plan is missing: ${AI_CORE_FRONTIER_TRAINING_LAUNCH_PLAN_PATH}`);
  }
  const raw = readFileSync(filePath, "utf8");
  const plan = JSON.parse(raw);
  assertNoCredentialLikeManifestContent(raw, plan);
  return plan;
}

export function assertNoCredentialLikeManifestContent(rawContent, parsedContent) {
  assertNoCredentialLikeJsonContent(rawContent, parsedContent, {
    label: "SEIS frontier training launch plan",
  });
}

export function readAiCoreModelParameterLadder(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_MODEL_PARAMETER_LADDER_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS model parameter ladder is missing: ${AI_CORE_MODEL_PARAMETER_LADDER_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readAiCore20BModelCardTemplate(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_20B_MODEL_CARD_TEMPLATE_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS 20B model card template is missing: ${AI_CORE_20B_MODEL_CARD_TEMPLATE_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readAiCore20BDatasetCardTemplate(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_20B_DATASET_CARD_TEMPLATE_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS 20B dataset card template is missing: ${AI_CORE_20B_DATASET_CARD_TEMPLATE_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readAiCoreAgiPublicReadinessEvidence(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_AGI_PUBLIC_READINESS_EVIDENCE_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS AGI public readiness evidence is missing: ${AI_CORE_AGI_PUBLIC_READINESS_EVIDENCE_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readAiCoreAgiGithubUserReadinessGates(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_AGI_GITHUB_USER_READINESS_GATES_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS AGI GitHub user readiness gates are missing: ${AI_CORE_AGI_GITHUB_USER_READINESS_GATES_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function aiCoreProviderStatus(repoRoot, options = {}) {
  try {
    const registry = readAiCoreProviderRegistry(repoRoot);
    const providers = Array.isArray(registry.providers) ? registry.providers : [];
    const stateModel = Array.isArray(registry.stateModel) ? registry.stateModel : [];
    const availableProviders = providers.filter((provider) => provider.publicStatus === "Available");
    const routingEligibleProviders = providers.filter((provider) => provider.routingEligible === true);
    const disabledProviders = providers.filter((provider) => provider.publicStatus === "Disabled");
    const missingKeyProviders = providers.filter((provider) => provider.publicStatus === "Missing Key");
    const optionalLiveFeatures = Array.isArray(registry.optionalForLiveFeatures)
      ? registry.optionalForLiveFeatures
      : [];
    const noKeyProviders = Array.isArray(registry.noKeyProviders) ? registry.noKeyProviders : [];

    const payload = {
      ok: true,
      tool: AI_CORE_PROVIDER_STATUS_TOOL,
      registryPath: AI_CORE_PROVIDER_REGISTRY_PATH,
      id: registry.id,
      version: registry.version,
      status: registry.status,
      truthBoundary: registry.truthBoundary,
      coreCredentialRequirement: registry.coreCredentialRequirement,
      defaultRoutingMode: registry.defaultRoutingMode,
      localOnlyRespected: registry.localOnlyRespected === true,
      requiredForCore: registry.requiredForCore || [],
      fallbackOrder: registry.fallbackOrder || [],
      providerCount: providers.length,
      availableProviderCount: availableProviders.length,
      routingEligibleProviderCount: routingEligibleProviders.length,
      missingKeyProviderCount: missingKeyProviders.length,
      disabledProviderCount: disabledProviders.length,
      optionalLiveProviderCount: optionalLiveFeatures.length,
      noKeyProviderCount: noKeyProviders.length,
      publicStates: registry.publicStates || [],
      stateModel: stateModel.map((state) => ({
        state: state.state,
        routingEligible: state.routingEligible === true,
        meaning: state.meaning,
      })),
      providers: providers.map((provider) => ({
        id: provider.id,
        displayName: provider.displayName,
        category: provider.category,
        publicStatus: provider.publicStatus,
        credentialRequirement: provider.credentialRequirement,
        configured: provider.configured === true,
        enabled: provider.enabled === true,
        routingEligible: provider.routingEligible === true,
        privacyClass: provider.privacyClass,
        capabilities: provider.capabilities || [],
        modelAliases: provider.modelAliases || [],
        actualModel: provider.actualModel,
        backendOnly: provider.backendOnly === true,
        frontendSecretAllowed: provider.frontendSecretAllowed === true,
        fallbackEligible: provider.fallbackEligible === true,
      })),
      optionalForLiveFeatures: optionalLiveFeatures,
      noKeyProviders,
      securityInvariants: registry.securityInvariants || [],
      nextSafeActions: registry.nextSafeActions || [],
    };

    if (options.includeFullRegistry === true) {
      payload.registry = registry;
    }

    return payload;
  } catch (error) {
    return {
      ok: false,
      tool: AI_CORE_PROVIDER_STATUS_TOOL,
      registryPath: AI_CORE_PROVIDER_REGISTRY_PATH,
      error: error.message,
    };
  }
}

export function aiCoreModelScalingStatus(repoRoot, options = {}) {
  try {
    const profile = readAiCoreModelScalingProfile(repoRoot);
    const target = profile.currentTarget || {};
    const frontierTarget = profile.frontierTarget || {};
    const apexTarget = profile.apexTarget || {};
    const memoryBudget = profile.memoryBudgetContract || {};
    const scaleLadder = Array.isArray(profile.scaleLadder) ? profile.scaleLadder : [];
    const hardwareTiers = Array.isArray(profile.hardwareTiers) ? profile.hardwareTiers : [];
    const quantizationProfiles = Array.isArray(profile.quantizationProfiles) ? profile.quantizationProfiles : [];
    const runtimeCandidates = Array.isArray(profile.localRuntimeCandidates) ? profile.localRuntimeCandidates : [];
    const compatibilityProfiles = Array.isArray(profile.compatibilityProfiles) ? profile.compatibilityProfiles : [];
    const creationStages = Array.isArray(profile.creationStages) ? profile.creationStages : [];
    const modelCardTemplatePath = profile.sourceOfTruth?.modelCardTemplate || AI_CORE_20B_MODEL_CARD_TEMPLATE_PATH;
    const datasetCardTemplatePath = profile.sourceOfTruth?.datasetCardTemplate || AI_CORE_20B_DATASET_CARD_TEMPLATE_PATH;
    const parameterLadderPath = profile.sourceOfTruth?.parameterLadder || AI_CORE_MODEL_PARAMETER_LADDER_PATH;
    const frontierEscalationPolicyPath = profile.sourceOfTruth?.frontierEscalationPolicy || AI_CORE_MODEL_FRONTIER_ESCALATION_POLICY_PATH;
    const modelScalingSubagentCouncilPath = profile.sourceOfTruth?.modelScalingSubagentCouncil || AI_CORE_MODEL_SCALING_SUBAGENT_COUNCIL_PATH;
    const frontierModelProgramPath = profile.sourceOfTruth?.frontierModelProgram || AI_CORE_150B_FRONTIER_MODEL_PROGRAM_PATH;
    const apexModelProgramPath = profile.sourceOfTruth?.apexModelProgram || AI_CORE_512B_APEX_MODEL_PROGRAM_PATH;
    const agiPublicReadinessEvidencePath =
      profile.sourceOfTruth?.agiPublicReadinessEvidence
      || apexTarget.sourceOfTruth?.agiPublicReadinessEvidence
      || AI_CORE_AGI_PUBLIC_READINESS_EVIDENCE_PATH;
    const agiGithubUserReadinessGatesPath =
      profile.sourceOfTruth?.agiGithubUserReadinessGates
      || apexTarget.sourceOfTruth?.githubUserReadinessGates
      || AI_CORE_AGI_GITHUB_USER_READINESS_GATES_PATH;
    const benchmarkManifestPath = profile.sourceOfTruth?.benchmarkManifest || AI_CORE_20B_BENCHMARK_MANIFEST_PATH;
    const benchmarkDryRunPath = profile.sourceOfTruth?.benchmarkDryRun || AI_CORE_20B_BENCHMARK_DRY_RUN_PATH;
    const localHardwarePreflightCheckPath =
      profile.sourceOfTruth?.localHardwarePreflightCheck || AI_CORE_LOCAL_HARDWARE_PREFLIGHT_CHECK_PATH;
    const modelCardTemplate = readJsonIfExists(repoRoot, modelCardTemplatePath) || {};
    const datasetCardTemplate = readJsonIfExists(repoRoot, datasetCardTemplatePath) || {};
    const parameterLadder = readJsonIfExists(repoRoot, parameterLadderPath) || {};
    const frontierEscalationPolicy = readJsonIfExists(repoRoot, frontierEscalationPolicyPath) || {};
    const modelScalingSubagentCouncil = readJsonIfExists(repoRoot, modelScalingSubagentCouncilPath) || {};
    const frontierModelProgram = readJsonIfExists(repoRoot, frontierModelProgramPath) || {};
    const apexModelProgram = readJsonIfExists(repoRoot, apexModelProgramPath) || {};
    const agiPublicReadinessEvidence = readJsonIfExists(repoRoot, agiPublicReadinessEvidencePath) || {};
    const agiGithubUserReadinessGates = readJsonIfExists(repoRoot, agiGithubUserReadinessGatesPath) || {};
    const benchmarkManifestSource = readJsonSource(repoRoot, benchmarkManifestPath);
    const benchmarkDryRunSource = readJsonSource(repoRoot, benchmarkDryRunPath);
    const benchmarkManifest = benchmarkManifestSource.data || {};
    const benchmarkDryRun = benchmarkDryRunSource.data || {};
    const parameterLadderTargets = Array.isArray(parameterLadder.targets) ? parameterLadder.targets : [];
    const parameterLadderRamPolicy = Array.isArray(parameterLadder.ramCompatibilityPolicy) ? parameterLadder.ramCompatibilityPolicy : [];
    const frontierEscalationStages = Array.isArray(frontierEscalationPolicy.escalationStages)
      ? frontierEscalationPolicy.escalationStages
      : [];
    const modelScalingCouncilAgents = Array.isArray(modelScalingSubagentCouncil.agents) ? modelScalingSubagentCouncil.agents : [];
    const modelScalingCouncilStages = Array.isArray(modelScalingSubagentCouncil.stageAssignments)
      ? modelScalingSubagentCouncil.stageAssignments
      : [];
    const frontierProgramStages = Array.isArray(frontierModelProgram.programStages)
      ? frontierModelProgram.programStages
      : [];
    const apexProgramStages = Array.isArray(apexModelProgram.programStages) ? apexModelProgram.programStages : [];

    const payload = {
      ok: true,
      tool: AI_CORE_MODEL_SCALING_STATUS_TOOL,
      profilePath: AI_CORE_MODEL_SCALING_PROFILE_PATH,
      parameterLadderPath,
      frontierEscalationPolicyPath,
      modelScalingSubagentCouncilPath,
      frontierModelProgramPath,
      apexModelProgramPath,
      agiPublicReadinessEvidencePath,
      agiGithubUserReadinessGatesPath,
      benchmarkManifestPath,
      benchmarkDryRunPath,
      localHardwarePreflightCheckPath,
      modelCardTemplatePath,
      datasetCardTemplatePath,
      id: profile.id,
      version: profile.version,
      status: profile.status,
      truthBoundary: profile.truthBoundary,
      coreCredentialRequirement: profile.coreCredentialRequirement,
      defaultMode: profile.defaultMode,
      currentTarget: {
        id: target.id,
        displayName: target.displayName,
        parameterClass: target.parameterClass,
        parameterCountBillion: target.parameterCountBillion,
        minimumSystemRamGb: target.minimumSystemRamGb,
        targetRamClass: target.targetRamClass,
        compatibilityStatus: target.compatibilityStatus,
        trainingStatus: target.trainingStatus,
        weightsAvailable: target.weightsAvailable === true,
        inferenceAvailable: target.inferenceAvailable === true,
        benchmarkStatus: target.benchmarkStatus,
        runtimeAuthority: target.runtimeAuthority === true,
        productionReady: target.productionReady === true,
        quantizationRequired: target.quantizationRequired === true,
        quantizationStatus: target.quantizationStatus,
        routerEligibility: target.routerEligibility,
        localDemoFallback: target.localDemoFallback,
      },
      frontierTarget: {
        id: frontierTarget.id,
        displayName: frontierTarget.displayName,
        parameterClass: frontierTarget.parameterClass,
        parameterCountBillion: frontierTarget.parameterCountBillion,
        targetHardwareClass: frontierTarget.targetHardwareClass,
        compatibilityStatus: frontierTarget.compatibilityStatus,
        trainingStatus: frontierTarget.trainingStatus,
        weightsAvailable: frontierTarget.weightsAvailable === true,
        inferenceAvailable: frontierTarget.inferenceAvailable === true,
        benchmarkStatus: frontierTarget.benchmarkStatus,
        runtimeAuthority: frontierTarget.runtimeAuthority === true,
        productionReady: frontierTarget.productionReady === true,
        routerEligibility: frontierTarget.routerEligibility,
        localDemoFallback: frontierTarget.localDemoFallback,
        notes: frontierTarget.notes || [],
      },
      apexTarget: {
        id: apexTarget.id,
        displayName: apexTarget.displayName,
        parameterClass: apexTarget.parameterClass,
        parameterCountBillion: apexTarget.parameterCountBillion,
        targetHardwareClass: apexTarget.targetHardwareClass,
        compatibilityStatus: apexTarget.compatibilityStatus,
        trainingStatus: apexTarget.trainingStatus,
        weightsAvailable: apexTarget.weightsAvailable === true,
        inferenceAvailable: apexTarget.inferenceAvailable === true,
        benchmarkStatus: apexTarget.benchmarkStatus,
        agiCapabilityStatus: apexTarget.agiCapabilityStatus,
        runtimeAuthority: apexTarget.runtimeAuthority === true,
        productionReady: apexTarget.productionReady === true,
        routerEligibility: apexTarget.routerEligibility,
        localDemoFallback: apexTarget.localDemoFallback,
        notes: apexTarget.notes || [],
      },
      memoryBudgetContract: {
        id: memoryBudget.id,
        status: memoryBudget.status,
        targetRamClass: memoryBudget.targetRamClass,
        parameterClass: memoryBudget.parameterClass,
        compatibilityClaim: memoryBudget.compatibilityClaim,
        requiredMeasurements: memoryBudget.requiredMeasurements || [],
        minimumBenchmarkFields: memoryBudget.minimumBenchmarkFields || [],
      },
      benchmarkEvidence: {
        manifestPath: benchmarkManifestPath,
        manifestId: benchmarkManifest.id,
        manifestStatus: benchmarkManifest.status,
        compatibilityClaim: benchmarkManifest.compatibilityClaim,
        benchmarkEvidenceAvailable: benchmarkManifest.benchmarkEvidenceAvailable === true,
        routeEligibleToday: benchmarkManifest.routeEligibleToday === true,
        runtimeAuthority: benchmarkManifest.runtimeAuthority === true,
        dryRunPath: benchmarkDryRunPath,
        dryRunId: benchmarkDryRun.id,
        dryRunStatus: benchmarkDryRun.status,
        localHardwarePreflightCheckPath,
        sourceHealth: {
          benchmarkManifest: benchmarkManifestSource.health,
          benchmarkDryRun: benchmarkDryRunSource.health,
        },
        canRequestRealBenchmarkToday: benchmarkDryRun.dryRunResult?.canRequestRealBenchmarkToday === true,
        measuredBenchmark: benchmarkDryRun.dryRunResult?.measuredBenchmark === true,
        modelCompatibilityVerified: benchmarkDryRun.dryRunResult?.modelCompatibilityVerified === true,
      },
      parameterLadder: {
        path: parameterLadderPath,
        id: parameterLadder.id,
        status: parameterLadder.status,
        resourceUri: parameterLadder.resourceUri || AI_CORE_MODEL_PARAMETER_LADDER_RESOURCE_URI,
        defaultRoute: parameterLadder.defaultRoute,
        routeEligibleToday: parameterLadder.routeEligibleToday === true,
        targetCount: parameterLadderTargets.length,
        promotionOrder: parameterLadder.promotionOrder || [],
        targets: parameterLadderTargets.map((targetEntry) => ({
          id: targetEntry.id,
          displayName: targetEntry.displayName,
          parameterClass: targetEntry.parameterClass,
          parameterCountBillion: targetEntry.parameterCountBillion ?? null,
          horizon: targetEntry.horizon,
          minimumRamClass: targetEntry.minimumRamClass,
          status: targetEntry.status,
          allowedToday: targetEntry.allowedToday,
          trainingStatus: targetEntry.trainingStatus,
          weightsAvailable: targetEntry.weightsAvailable === true,
          inferenceAvailable: targetEntry.inferenceAvailable === true,
          benchmarkEvidenceAvailable: targetEntry.benchmarkEvidenceAvailable === true,
          routeEligibleToday: targetEntry.routeEligibleToday === true,
          runtimeAuthority: targetEntry.runtimeAuthority === true,
          productionReady: targetEntry.productionReady === true,
          evidenceRequiredBeforeRoute: targetEntry.evidenceRequiredBeforeRoute || [],
        })),
        ramCompatibilityPolicy: parameterLadderRamPolicy.map((policy) => ({
          ramClass: policy.ramClass,
          highestTargetToday: policy.highestTargetToday,
          routeEligibleToday: policy.routeEligibleToday === true,
          claimStatus: policy.claimStatus,
          requiredProof: policy.requiredProof,
        })),
        forbiddenClaims: parameterLadder.forbiddenClaims || [],
        humanApprovalRequiredFor: parameterLadder.humanApprovalRequiredFor || [],
      },
      frontierEscalationPolicy: {
        path: frontierEscalationPolicyPath,
        id: frontierEscalationPolicy.id,
        status: frontierEscalationPolicy.status,
        resourceUri: frontierEscalationPolicy.resourceUri || AI_CORE_MODEL_FRONTIER_ESCALATION_POLICY_RESOURCE_URI,
        qualityGate: frontierEscalationPolicy.qualityGate,
        routeEligibleToday: frontierEscalationPolicy.routeEligibleToday === true,
        currentAllowedMode: frontierEscalationPolicy.currentAllowedMode,
        decisionRuleIds: Array.isArray(frontierEscalationPolicy.decisionRules)
          ? frontierEscalationPolicy.decisionRules.map((rule) => rule.id)
          : [],
        escalationStages: frontierEscalationStages.map((stage) => ({
          id: stage.id,
          parameterClass: stage.parameterClass,
          status: stage.status,
          allowedToday: stage.allowedToday === true,
          routeEligibleToday: stage.routeEligibleToday === true,
        })),
        forbiddenClaims: frontierEscalationPolicy.forbiddenClaims || [],
        humanApprovalRequiredFor: frontierEscalationPolicy.humanApprovalRequiredFor || [],
      },
      modelScalingSubagentCouncil: {
        path: modelScalingSubagentCouncilPath,
        id: modelScalingSubagentCouncil.id,
        status: modelScalingSubagentCouncil.status,
        qualityGate: modelScalingSubagentCouncil.qualityGate,
        runtimeBoundary: modelScalingSubagentCouncil.runtimeBoundary,
        routeEligibleToday: modelScalingSubagentCouncil.routeEligibleToday === true,
        agentCount: modelScalingCouncilAgents.length,
        planOnlyAgentCount: modelScalingCouncilAgents.filter((agent) => agent.authority === "plan-only").length,
        agentIds: modelScalingCouncilAgents.map((agent) => agent.id),
        stageAssignments: modelScalingCouncilStages.map((stage) => ({
          stage: stage.stage,
          status: stage.status,
          leadAgents: stage.leadAgents || [],
          routeEligibleToday: stage.routeEligibleToday === true,
        })),
        forbiddenClaims: modelScalingSubagentCouncil.forbiddenClaims || [],
        humanApprovalRequiredFor: modelScalingSubagentCouncil.humanApprovalRequiredFor || [],
      },
      frontierModelProgram: {
        path: frontierModelProgramPath,
        id: frontierModelProgram.id,
        status: frontierModelProgram.status,
        resourceUri: frontierModelProgram.resourceUri || AI_CORE_150B_FRONTIER_MODEL_PROGRAM_RESOURCE_URI,
        qualityGate: frontierModelProgram.qualityGate,
        routeEligibleToday: frontierModelProgram.routeEligibleToday === true,
        runtimeAuthority: frontierModelProgram.runtimeAuthority === true,
        trainingStatus: frontierModelProgram.trainingStatus,
        weightsAvailable: frontierModelProgram.weightsAvailable === true,
        inferenceAvailable: frontierModelProgram.inferenceAvailable === true,
        benchmarkStatus: frontierModelProgram.benchmarkStatus,
        productionReady: frontierModelProgram.productionReady === true,
        parameterClass: frontierModelProgram.target?.parameterClass,
        parameterCountBillion: frontierModelProgram.target?.parameterCountBillion ?? null,
        prerequisite: frontierModelProgram.target?.prerequisite || frontierModelProgram.target?.minimumPrerequisite,
        stageCount: frontierProgramStages.length,
        programStages: frontierProgramStages.map((stage) => ({
          id: stage.id,
          label: stage.label,
          status: stage.status,
          routeEligibleToday: stage.routeEligibleToday === true,
        })),
        promotionGates: frontierModelProgram.promotionGates || [],
        humanApprovalRequiredFor: frontierModelProgram.humanApprovalRequiredFor || [],
      },
      apexModelProgram: {
        path: apexModelProgramPath,
        id: apexModelProgram.id,
        status: apexModelProgram.status,
        resourceUri: apexModelProgram.resourceUri || AI_CORE_512B_APEX_MODEL_PROGRAM_RESOURCE_URI,
        qualityGate: apexModelProgram.qualityGate,
        routeEligibleToday: apexModelProgram.routeEligibleToday === true,
        runtimeAuthority: apexModelProgram.runtimeAuthority === true,
        trainingStatus: apexModelProgram.trainingStatus,
        weightsAvailable: apexModelProgram.weightsAvailable === true,
        inferenceAvailable: apexModelProgram.inferenceAvailable === true,
        benchmarkStatus: apexModelProgram.benchmarkStatus,
        productionReady: apexModelProgram.productionReady === true,
        parameterClass: apexModelProgram.target?.parameterClass,
        parameterCountBillion: apexModelProgram.target?.parameterCountBillion ?? null,
        prerequisite: apexModelProgram.target?.prerequisite || apexModelProgram.target?.minimumPrerequisite,
        stageCount: apexProgramStages.length,
        programStages: apexProgramStages.map((stage) => ({
          id: stage.id,
          label: stage.label,
          status: stage.status,
          routeEligibleToday: stage.routeEligibleToday === true,
        })),
        promotionGates: apexModelProgram.promotionGates || [],
        forbiddenClaimRules: apexModelProgram.forbiddenClaimRules || [],
        humanApprovalRequiredFor: apexModelProgram.humanApprovalRequiredFor || [],
      },
      agiPublicReadinessEvidence: {
        path: agiPublicReadinessEvidencePath,
        id: agiPublicReadinessEvidence.id,
        status: agiPublicReadinessEvidence.status,
        resourceUri:
          agiPublicReadinessEvidence.resourceUri || AI_CORE_AGI_PUBLIC_READINESS_EVIDENCE_RESOURCE_URI,
        qualityGate: agiPublicReadinessEvidence.qualityGate,
        routeEligibleToday: agiPublicReadinessEvidence.routeEligibleToday === true,
        runtimeAuthority: agiPublicReadinessEvidence.runtimeAuthority === true,
        agiClaimAllowed: agiPublicReadinessEvidence.agiClaimAllowed === true,
        publicReadyAsAgi: agiPublicReadinessEvidence.publicReadyAsAgi === true,
        publicReadyAsLocalDemo: agiPublicReadinessEvidence.publicReadyAsLocalDemo === true,
        minimumClaimEvidenceCount: agiPublicReadinessEvidence.readinessSummary?.minimumClaimEvidenceCount ?? null,
        acceptedClaimEvidenceCount: agiPublicReadinessEvidence.readinessSummary?.acceptedClaimEvidenceCount ?? null,
        missingClaimEvidenceCount: agiPublicReadinessEvidence.readinessSummary?.missingClaimEvidenceCount ?? null,
      },
      agiGithubUserReadinessGates: {
        path: agiGithubUserReadinessGatesPath,
        id: agiGithubUserReadinessGates.id,
        status: agiGithubUserReadinessGates.status,
        resourceUri:
          agiGithubUserReadinessGates.resourceUri || AI_CORE_AGI_GITHUB_USER_READINESS_GATES_RESOURCE_URI,
        qualityGate: agiGithubUserReadinessGates.qualityGate,
        routeEligibleToday: agiGithubUserReadinessGates.routeEligibleToday === true,
        runtimeAuthority: agiGithubUserReadinessGates.runtimeAuthority === true,
        agiClaimAllowed: agiGithubUserReadinessGates.agiClaimAllowed === true,
        publicReadyAsAgi: agiGithubUserReadinessGates.publicReadyAsAgi === true,
        publicReadyForLocalDemo: agiGithubUserReadinessGates.publicReadyForLocalDemo === true,
        githubReadyForEveryone: agiGithubUserReadinessGates.githubReadyForEveryone === true,
        readinessGateCount: Array.isArray(agiGithubUserReadinessGates.readinessGates)
          ? agiGithubUserReadinessGates.readinessGates.length
          : 0,
      },
      evidenceTemplates: {
        modelCard: {
          path: modelCardTemplatePath,
          id: modelCardTemplate.id,
          status: modelCardTemplate.status,
          targetId: modelCardTemplate.targetId,
          parameterClass: modelCardTemplate.parameterClass,
          routeEligibleToday: modelCardTemplate.routeEligibleToday === true,
          runtimeAuthority: modelCardTemplate.runtimeAuthority === true,
          productionReady: modelCardTemplate.productionReady === true,
          weightsAvailable: modelCardTemplate.weightsAvailable === true,
          trainingStatus: modelCardTemplate.trainingStatus,
          benchmarkEvidenceAvailable: modelCardTemplate.benchmarkEvidenceAvailable === true,
          requiredBeforeFilled: modelCardTemplate.requiredBeforeFilled || [],
        },
        datasetCard: {
          path: datasetCardTemplatePath,
          id: datasetCardTemplate.id,
          status: datasetCardTemplate.status,
          targetId: datasetCardTemplate.targetId,
          parameterClass: datasetCardTemplate.parameterClass,
          datasetDownloadAuthorized: datasetCardTemplate.datasetDownloadAuthorized === true,
          trainingAuthorized: datasetCardTemplate.trainingAuthorized === true,
          fineTuningAuthorized: datasetCardTemplate.fineTuningAuthorized === true,
          benchmarkDatasetAuthorized: datasetCardTemplate.benchmarkDatasetAuthorized === true,
          routeEligibleToday: datasetCardTemplate.routeEligibleToday === true,
          requiredBeforeFilled: datasetCardTemplate.requiredBeforeFilled || [],
        },
      },
      quantizationProfiles: quantizationProfiles.map((profileEntry) => ({
        id: profileEntry.id,
        label: profileEntry.label,
        status: profileEntry.status,
        expectedUse: profileEntry.expectedUse,
        routeEligibleToday: profileEntry.routeEligibleToday === true,
      })),
      localRuntimeCandidates: runtimeCandidates.map((candidate) => ({
        id: candidate.id,
        label: candidate.label,
        status: candidate.status,
        credentialRequirement: candidate.credentialRequirement,
        approvalRequiredBeforeUse: candidate.approvalRequiredBeforeUse === true,
      })),
      compatibilityProfiles: compatibilityProfiles.map((compatibilityProfile) => ({
        id: compatibilityProfile.id,
        label: compatibilityProfile.label,
        ramClass: compatibilityProfile.ramClass,
        targetParameterClass: compatibilityProfile.targetParameterClass,
        quantizationLane: compatibilityProfile.quantizationLane,
        status: compatibilityProfile.status,
        allowedToday: compatibilityProfile.allowedToday,
        routeEligibleToday: compatibilityProfile.routeEligibleToday === true,
      })),
      benchmarkManifestContract: profile.benchmarkManifestContract || {},
      creationStages: creationStages.map((stage) => ({
        stage: stage.stage,
        label: stage.label,
        status: stage.status,
        parameterClass: stage.parameterClass,
        evidenceRequiredToPromote: stage.evidenceRequiredToPromote,
      })),
      scaleTargetCount: scaleLadder.length,
      scaleLadder: scaleLadder.map((entry) => ({
        id: entry.id,
        parameterClass: entry.parameterClass,
        horizon: entry.horizon,
        targetHardwareClass: entry.targetHardwareClass,
        status: entry.status,
        promotionGate: entry.promotionGate,
      })),
      hardwareTiers: hardwareTiers.map((tier) => ({
        id: tier.id,
        label: tier.label,
        allowedToday: tier.allowedToday,
        modelTarget: tier.modelTarget,
        claimStatus: tier.claimStatus,
      })),
      routerPolicy: profile.routerPolicy || {},
      promotionGates: profile.promotionGates || [],
      forbiddenClaims: profile.forbiddenClaims || [],
      humanApprovalRequiredFor: profile.humanApprovalRequiredFor || [],
      nextSafeActions: profile.nextSafeActions || [],
    };

    if (options.includeFullProfile === true) {
      payload.profile = profile;
      payload.modelParameterLadder = parameterLadder;
      payload.modelFrontierEscalationPolicy = frontierEscalationPolicy;
      payload.modelScalingSubagentCouncil = modelScalingSubagentCouncil;
      payload.model150bFrontierProgram = frontierModelProgram;
      payload.model512bApexProgram = apexModelProgram;
      payload.agiPublicReadinessEvidenceFull = agiPublicReadinessEvidence;
      payload.agiGithubUserReadinessGatesFull = agiGithubUserReadinessGates;
      payload.model20bBenchmarkManifest = benchmarkManifest;
      payload.model20bBenchmarkDryRun = benchmarkDryRun;
      payload.modelCardTemplate = modelCardTemplate;
      payload.datasetCardTemplate = datasetCardTemplate;
    }

    return payload;
  } catch (error) {
    return {
      ok: false,
      tool: AI_CORE_MODEL_SCALING_STATUS_TOOL,
      profilePath: AI_CORE_MODEL_SCALING_PROFILE_PATH,
      error: error.message,
    };
  }
}

export function aiCoreFrontierTrainingStatus(repoRoot, options = {}) {
  try {
    const plan = readAiCoreFrontierTrainingLaunchPlan(repoRoot);
    const lanes = Array.isArray(plan.lanes) ? plan.lanes : [];
    const launchGates = Array.isArray(plan.globalLaunchGates) ? plan.globalLaunchGates : [];
    const backends = Array.isArray(plan.executionBackends) ? plan.executionBackends : [];
    const research = Array.isArray(plan.officialResearchBaseline) ? plan.officialResearchBaseline : [];
    const requiredAgentIds = Array.isArray(plan.installedAiCouncil?.requiredAgentIds)
      ? plan.installedAiCouncil.requiredAgentIds
      : [];
    const councilPath = plan.installedAiCouncil?.source || AI_CORE_MODEL_SCALING_SUBAGENT_COUNCIL_PATH;
    const councilPathAllowed = councilPath === AI_CORE_MODEL_SCALING_SUBAGENT_COUNCIL_PATH;
    const council = councilPathAllowed ? readJsonIfExists(repoRoot, councilPath) || {} : {};
    const councilAgentIds = Array.isArray(council.agents) ? council.agents.map((agent) => agent.id) : [];
    const unresolvedCouncilAgentIds = requiredAgentIds.filter((agentId) => !councilAgentIds.includes(agentId));
    const runtimeIssues = validateFrontierTrainingRuntime({
      plan,
      lanes,
      launchGates,
      backends,
      requiredAgentIds,
      council,
      councilPathAllowed,
      unresolvedCouncilAgentIds,
    });
    if (runtimeIssues.length > 0) {
      throw new Error(`SEIS frontier training launch plan failed runtime validation: ${runtimeIssues.join("; ")}`);
    }

    const payload = {
      ok: true,
      tool: AI_CORE_FRONTIER_TRAINING_STATUS_TOOL,
      planPath: AI_CORE_FRONTIER_TRAINING_LAUNCH_PLAN_PATH,
      councilPath,
      id: plan.id,
      version: plan.version,
      status: plan.status,
      resourceUri: plan.resourceUri || AI_CORE_FRONTIER_TRAINING_LAUNCH_PLAN_RESOURCE_URI,
      qualityGate: plan.qualityGate,
      truthBoundary: plan.truthBoundary,
      coreCredentialRequirement: plan.coreCredentialRequirement,
      executionMode: plan.executionMode,
      trainingAuthorized: plan.trainingAuthorized === true,
      externalJobAuthorized: plan.externalJobAuthorized === true,
      routeEligibleToday: plan.routeEligibleToday === true,
      runtimeAuthority: plan.runtimeAuthority === true,
      checkpointExists: plan.checkpointExists === true,
      benchmarkEvidenceAvailable: plan.benchmarkEvidenceAvailable === true,
      agiClaimAllowed: plan.agiClaimAllowed === true,
      launchableLaneCount: lanes.filter((lane) => lane.launchDecision === "allow").length,
      deniedLaneCount: lanes.filter((lane) => lane.launchDecision === "deny").length,
      allLaunchesDenied: lanes.length > 0 && lanes.every((lane) => lane.launchDecision === "deny"),
      laneCount: lanes.length,
      lanes: lanes.map((lane) => ({
        id: lane.id,
        parameterClass: lane.parameterClass,
        parameterCountBillion: lane.parameterCountBillion,
        status: lane.status,
        launchDecision: lane.launchDecision,
        trainingAuthorized: lane.trainingAuthorized === true,
        routeEligibleToday: lane.routeEligibleToday === true,
        runtimeAuthority: lane.runtimeAuthority === true,
        agiCapabilityStatus: lane.agiCapabilityStatus ?? null,
        blockedBy: lane.blockedBy || [],
        trainingLogCount: Array.isArray(lane.evidence?.trainingLogs) ? lane.evidence.trainingLogs.length : 0,
        checkpointCount: Array.isArray(lane.evidence?.checkpoints) ? lane.evidence.checkpoints.length : 0,
        evaluationReportCount: Array.isArray(lane.evidence?.evaluationReports)
          ? lane.evidence.evaluationReports.length
          : 0,
        approvalRecorded: Boolean(lane.evidence?.approvalRecord),
      })),
      globalLaunchGates: launchGates.map((gate) => ({
        id: gate.id,
        status: gate.status,
        requiredBeforeLaunch: gate.requiredBeforeLaunch === true,
      })),
      missingGlobalGateCount: launchGates.filter((gate) => gate.status !== "accepted").length,
      executionBackends: backends.map((backend) => ({
        id: backend.id,
        status: backend.status,
        selected: backend.selected === true,
      })),
      selectedExecutionBackendCount: backends.filter((backend) => backend.selected === true).length,
      installedAiCouncil: {
        status: plan.installedAiCouncil?.status,
        reviewState: plan.installedAiCouncil?.reviewState,
        runtimeAuthority: plan.installedAiCouncil?.runtimeAuthority === true,
        selfApprovalAllowed: plan.installedAiCouncil?.selfApprovalAllowed === true,
        requiredAgentCount: requiredAgentIds.length,
        availableCouncilAgentCount: councilAgentIds.length,
        unresolvedCouncilAgentIds,
      },
      evidenceCounts: plan.evidenceCounts || {},
      officialResearchBaseline: research.map((source) => ({
        id: source.id,
        url: source.url,
        type: source.type,
      })),
      decisionPolicy: plan.decisionPolicy || {},
      secretBoundary: plan.secretBoundary || {},
      forbiddenClaims: plan.forbiddenClaims || [],
      humanApprovalRequiredFor: plan.humanApprovalRequiredFor || [],
      nextSafeActions: plan.nextSafeActions || [],
      runtimeValidation: {
        valid: true,
        failClosed: true,
        issueCount: 0,
        issues: [],
      },
      executionEvidence: frontierTrainingDeniedExecutionEvidence(),
    };

    if (options.includeFullPlan === true) payload.plan = plan;
    return payload;
  } catch (error) {
    return {
      ok: false,
      tool: AI_CORE_FRONTIER_TRAINING_STATUS_TOOL,
      planPath: AI_CORE_FRONTIER_TRAINING_LAUNCH_PLAN_PATH,
      status: "invalid-fail-closed",
      trainingAuthorized: false,
      externalJobAuthorized: false,
      routeEligibleToday: false,
      runtimeAuthority: false,
      checkpointExists: false,
      benchmarkEvidenceAvailable: false,
      agiClaimAllowed: false,
      launchableLaneCount: 0,
      allLaunchesDenied: true,
      runtimeValidation: {
        valid: false,
        failClosed: true,
        issueCount: 1,
        issues: [error.message],
      },
      executionEvidence: frontierTrainingDeniedExecutionEvidence(),
      error: error.message,
    };
  }
}

function validateFrontierTrainingRuntime({
  plan,
  lanes,
  launchGates,
  backends,
  requiredAgentIds,
  council,
  councilPathAllowed,
  unresolvedCouncilAgentIds,
}) {
  const issues = [];
  if (plan.id !== "seis-frontier-training-launch-plan") issues.push("plan id mismatch");
  if (plan.status !== "preflight-only-not-authorized") issues.push("plan status is not preflight-only");
  if (plan.executionMode !== "dry-run-only") issues.push("execution mode is not dry-run-only");
  for (const field of FRONTIER_TRAINING_FALSE_FIELDS) {
    if (plan[field] !== false) issues.push(`${field} must be false`);
  }
  if (plan.decisionPolicy?.defaultDecision !== "deny" || plan.decisionPolicy?.failClosed !== true) {
    issues.push("decision policy must fail closed");
  }
  if (lanes.length !== 5) issues.push("exactly five scale lanes are required");
  const expectedLaneOrder = ["20B", "70B", "150B", "300B+", "512B"];
  if (JSON.stringify(lanes.map((lane) => lane.parameterClass)) !== JSON.stringify(expectedLaneOrder)) {
    issues.push("scale lane order mismatch");
  }
  for (const lane of lanes) {
    if (
      lane.launchDecision !== "deny" ||
      lane.trainingAuthorized !== false ||
      lane.routeEligibleToday !== false ||
      lane.runtimeAuthority !== false
    ) {
      issues.push(`${lane.id || lane.parameterClass || "unknown lane"} is not denied`);
    }
    if (
      lane.evidence?.datasetManifest !== null ||
      lane.evidence?.runManifest !== null ||
      !Array.isArray(lane.evidence?.trainingLogs) ||
      lane.evidence.trainingLogs.length !== 0 ||
      !Array.isArray(lane.evidence?.checkpoints) ||
      lane.evidence.checkpoints.length !== 0 ||
      !Array.isArray(lane.evidence?.evaluationReports) ||
      lane.evidence.evaluationReports.length !== 0 ||
      lane.evidence?.approvalRecord !== null
    ) {
      issues.push(`${lane.id || lane.parameterClass || "unknown lane"} contains unaccepted execution evidence`);
    }
  }
  if (
    launchGates.length < 8 ||
    launchGates.some((gate) => gate.requiredBeforeLaunch !== true || gate.status !== "missing")
  ) {
    issues.push("global launch gates are incomplete or not missing");
  }
  if (backends.some((backend) => backend.selected === true)) issues.push("an execution backend is selected");
  if (!councilPathAllowed) issues.push("council source path is not allowlisted");
  if (
    requiredAgentIds.length !== FRONTIER_TRAINING_REQUIRED_AGENT_IDS.length ||
    FRONTIER_TRAINING_REQUIRED_AGENT_IDS.some((agentId) => !requiredAgentIds.includes(agentId))
  ) {
    issues.push("required council roster mismatch");
  }
  if (
    plan.installedAiCouncil?.runtimeAuthority !== false ||
    plan.installedAiCouncil?.selfApprovalAllowed !== false ||
    plan.installedAiCouncil?.reviewState !== "not-recorded"
  ) {
    issues.push("council authority boundary mismatch");
  }
  if (unresolvedCouncilAgentIds.length > 0) issues.push("required council agents are unresolved");
  if (
    !Array.isArray(council.agents) ||
    council.agents.some((agent) => agent.authority !== "plan-only")
  ) {
    issues.push("council agents must remain plan-only");
  }
  const zeroEvidenceFields = [
    "authorizedTrainingRuns",
    "completedTrainingRuns",
    "acceptedCheckpoints",
    "acceptedBenchmarkReports",
    "acceptedAgiEvaluations",
    "recordedCouncilReviews",
    "activeHumanApprovals",
  ];
  if (zeroEvidenceFields.some((field) => plan.evidenceCounts?.[field] !== 0)) {
    issues.push("execution evidence counters must remain zero");
  }
  return issues;
}

function frontierTrainingDeniedExecutionEvidence() {
  return {
    modelDownloaded: false,
    datasetDownloaded: false,
    remoteJobSubmitted: false,
    trainingRunPerformed: false,
    inferenceRunPerformed: false,
    benchmarkRunPerformed: false,
    checkpointPublished: false,
    providerCalled: false,
    sshExecuted: false,
    deploymentPerformed: false,
    githubMutated: false,
  };
}

export function aiCoreVersionStatus(repoRoot, options = {}) {
  try {
    const registry = readAiCoreVersionRegistry(repoRoot);
    const providerRegistry = readJsonIfExists(repoRoot, registry.sourceOfTruth?.providerRegistry || AI_CORE_PROVIDER_REGISTRY_PATH);
    const operatingModel = readJsonIfExists(repoRoot, registry.sourceOfTruth?.operatingModel || SUBAGENT_OPERATING_MODEL_PATH);
    const reviewLedger = readJsonIfExists(repoRoot, registry.sourceOfTruth?.reviewLedger || SUBAGENT_REVIEW_LEDGER_PATH);
    const runtimeFixtures = readJsonIfExists(repoRoot, registry.sourceOfTruth?.runtimeFixtures || SUBAGENT_RUNTIME_FIXTURES_PATH);
    const pluginIntegration = readJsonIfExists(repoRoot, registry.sourceOfTruth?.pluginIntegration || PLUGIN_INTEGRATION_PATH);
    const mcpRuntimeContract = readJsonIfExists(repoRoot, registry.sourceOfTruth?.mcpRuntimeContract || MCP_RUNTIME_CONTRACT_PATH);
    const promotionGates = readJsonIfExists(repoRoot, registry.sourceOfTruth?.promotionGates || AI_CORE_VERSION_PROMOTION_GATES_PATH);
    const lanes = Array.isArray(registry.linkedSubAgentLanes) ? registry.linkedSubAgentLanes : [];
    const roadmap = Array.isArray(registry.fiveYearVersionRoadmap) ? registry.fiveYearVersionRoadmap : [];

    const payload = {
      ok: true,
      tool: AI_CORE_VERSION_STATUS_TOOL,
      registryPath: AI_CORE_VERSION_REGISTRY_PATH,
      id: registry.id,
      version: registry.version,
      status: registry.status,
      qualityGate: registry.qualityGate,
      currentVersion: registry.currentVersion,
      truthBoundaries: registry.truthBoundaries,
      runtimeBoundary: registry.runtimeBoundary,
      componentCount: Array.isArray(registry.versionComponents) ? registry.versionComponents.length : 0,
      versionComponents: (registry.versionComponents || []).map((component) => ({
        id: component.id,
        name: component.name,
        kind: component.kind,
        status: component.status,
        validation: component.validation,
      })),
      laneCount: lanes.length,
      linkedSubAgentLanes: lanes.map((lane) => ({
        laneId: lane.laneId,
        displayName: lane.displayName,
        statusTool: lane.statusTool,
        planTool: lane.planTool,
        permissionLevel: lane.permissionLevel,
        versionDuty: lane.versionDuty,
      })),
      fiveYearVersionRoadmap: roadmap.map((entry) => ({
        year: entry.year,
        versionTarget: entry.versionTarget,
        theme: entry.theme,
        promotionGate: entry.promotionGate,
      })),
      promotionEvidenceRequired: registry.promotionEvidenceRequired || [],
      linkedEvidence: {
        operatingModel: operatingModel
          ? {
              id: operatingModel.id,
              status: operatingModel.status,
              runtimeBoundary: operatingModel.runtimeBoundary?.currentLevel ?? null,
              laneCount: Array.isArray(operatingModel.lanes) ? operatingModel.lanes.length : 0,
            }
          : { missing: true, path: registry.sourceOfTruth?.operatingModel || SUBAGENT_OPERATING_MODEL_PATH },
        reviewLedger: reviewLedger
          ? {
              id: reviewLedger.id,
              status: reviewLedger.status,
              reviewCadence: reviewLedger.cadence?.reviewCadence ?? null,
              quarterCount: Array.isArray(reviewLedger.quarters) ? reviewLedger.quarters.length : 0,
              currentHorizonQuarter: reviewLedger.cadence?.currentHorizonQuarter ?? null,
              nextReviewQuarter: reviewLedger.cadence?.nextReviewQuarter ?? null,
            }
          : { missing: true, path: registry.sourceOfTruth?.reviewLedger || SUBAGENT_REVIEW_LEDGER_PATH },
        runtimeFixtures: runtimeFixtures
          ? {
              id: runtimeFixtures.id,
              status: runtimeFixtures.status,
              currentLevel: runtimeFixtures.runtimeBoundary?.currentLevel ?? null,
              writeExecution: runtimeFixtures.runtimeBoundary?.writeExecution ?? null,
            }
          : { missing: true, path: registry.sourceOfTruth?.runtimeFixtures || SUBAGENT_RUNTIME_FIXTURES_PATH },
        pluginIntegration: pluginIntegration
          ? {
              id: pluginIntegration.id,
              status: pluginIntegration.status,
              versionRegistryTool: pluginIntegration.runtimeIntegration?.versionRegistryTool ?? null,
              versionPromotionTool: pluginIntegration.runtimeIntegration?.versionPromotionTool ?? null,
              primaryInstallId: pluginIntegration.primaryInstallId ?? null,
            }
          : { missing: true, path: registry.sourceOfTruth?.pluginIntegration || PLUGIN_INTEGRATION_PATH },
        mcpRuntimeContract: mcpRuntimeContract
          ? {
              id: mcpRuntimeContract.id,
              status: mcpRuntimeContract.status,
              resourceUri: mcpRuntimeContract.resourceUri,
              toolCount: mcpRuntimeContract.toolCount,
              resourceCount: mcpRuntimeContract.resourceCount,
              promptCount: mcpRuntimeContract.promptCount,
              smokeTest: mcpRuntimeContract.smokeTest,
            }
          : { missing: true, path: registry.sourceOfTruth?.mcpRuntimeContract || MCP_RUNTIME_CONTRACT_PATH },
        promotionGates: promotionGates
          ? {
              id: promotionGates.id,
              status: promotionGates.status,
              dryRunTool: promotionGates.tooling?.tool ?? null,
              currentDecision: promotionGates.currentDryRun?.decision ?? null,
              gateCount: Array.isArray(promotionGates.gates) ? promotionGates.gates.length : 0,
            }
          : { missing: true, path: registry.sourceOfTruth?.promotionGates || AI_CORE_VERSION_PROMOTION_GATES_PATH },
        providerRegistry: providerRegistry
          ? {
              id: providerRegistry.id,
              status: providerRegistry.status,
              coreCredentialRequirement: providerRegistry.coreCredentialRequirement ?? null,
              providerCount: Array.isArray(providerRegistry.providers) ? providerRegistry.providers.length : 0,
              publicStates: providerRegistry.publicStates || [],
              qualityGate: providerRegistry.qualityGate ?? null,
            }
          : { missing: true, path: registry.sourceOfTruth?.providerRegistry || AI_CORE_PROVIDER_REGISTRY_PATH },
      },
      nextSafeActions: registry.nextSafeActions || [],
    };

    if (options.includeFullRegistry === true) {
      payload.registry = registry;
    }

    return payload;
  } catch (error) {
    return {
      ok: false,
      tool: AI_CORE_VERSION_STATUS_TOOL,
      registryPath: AI_CORE_VERSION_REGISTRY_PATH,
      error: error.message,
    };
  }
}

export function aiCoreVersionPromotionDryRun(repoRoot, input = {}) {
  try {
    const gates = readAiCoreVersionPromotionGates(repoRoot);
    const registry = readJsonIfExists(repoRoot, gates.sourceOfTruth?.versionRegistry || AI_CORE_VERSION_REGISTRY_PATH);
    const pluginIntegration = readJsonIfExists(repoRoot, gates.sourceOfTruth?.pluginIntegration || PLUGIN_INTEGRATION_PATH);
    const mcpRuntimeContract = readJsonIfExists(repoRoot, gates.sourceOfTruth?.mcpRuntimeContract || MCP_RUNTIME_CONTRACT_PATH);
    const operatingModel = readJsonIfExists(repoRoot, gates.sourceOfTruth?.operatingModel || SUBAGENT_OPERATING_MODEL_PATH);
    const reviewLedger = readJsonIfExists(repoRoot, gates.sourceOfTruth?.reviewLedger || SUBAGENT_REVIEW_LEDGER_PATH);
    const requestedVersionTarget = typeof input.versionTarget === "string" ? input.versionTarget.trim() : "";
    const requestedYear = Number.isInteger(input.year) ? input.year : null;
    const gate = (Array.isArray(gates.gates) ? gates.gates : []).find((candidate) => {
      if (requestedVersionTarget) return candidate.versionTarget === requestedVersionTarget;
      if (requestedYear !== null) return candidate.year === requestedYear;
      return candidate.versionTarget === gates.currentDryRun?.requestedVersionTarget;
    });

    if (!gate) {
      return {
        ok: false,
        tool: AI_CORE_VERSION_PROMOTION_TOOL,
        promotionGatesPath: AI_CORE_VERSION_PROMOTION_GATES_PATH,
        error: requestedVersionTarget
          ? `unknown version target: ${requestedVersionTarget}`
          : requestedYear !== null
            ? `unknown promotion year: ${requestedYear}`
            : "no current promotion gate is configured",
      };
    }

    const registryRoadmapEntry = (Array.isArray(registry?.fiveYearVersionRoadmap)
      ? registry.fiveYearVersionRoadmap
      : []).find((entry) => entry.year === gate.year || entry.versionTarget === gate.versionTarget);
    const laneResponsibilities = Array.isArray(gates.laneResponsibilities) ? gates.laneResponsibilities : [];
    const linkedLanes = Array.isArray(registry?.linkedSubAgentLanes) ? registry.linkedSubAgentLanes : [];
    const laneEvidence = laneResponsibilities.map((lane) => {
      const linkedLane = linkedLanes.find((candidate) => candidate.laneId === lane.laneId);
      return {
        laneId: lane.laneId,
        displayName: lane.displayName,
        promotionDuty: lane.promotionDuty,
        statusTool: linkedLane?.statusTool ?? null,
        planTool: linkedLane?.planTool ?? null,
        permissionLevel: linkedLane?.permissionLevel ?? null,
      };
    });

    return {
      ok: true,
      tool: AI_CORE_VERSION_PROMOTION_TOOL,
      promotionGatesPath: AI_CORE_VERSION_PROMOTION_GATES_PATH,
      executionMode: "dry-run-only",
      versionTarget: gate.versionTarget,
      year: gate.year,
      status: gate.status,
      dryRunDecision: gate.dryRunDecision,
      decisionStateAllowed: (gates.decisionStates || []).includes(gate.dryRunDecision),
      releasePromotionAllowed: false,
      realExecutionBlocked: true,
      externalMutationPerformed: false,
      credentialAccessPerformed: false,
      humanApprovalRequired: gate.humanApprovalRequired === true,
      requiredEvidence: gate.requiredEvidence || [],
      validationCommands: gate.validationCommands || [],
      blockers: gate.blockers || [],
      nextSafeAction: gate.nextSafeAction,
      registryRoadmapEntry: registryRoadmapEntry
        ? {
            year: registryRoadmapEntry.year,
            versionTarget: registryRoadmapEntry.versionTarget,
            theme: registryRoadmapEntry.theme,
            promotionGate: registryRoadmapEntry.promotionGate,
          }
        : null,
      currentRuntimeBoundary: {
        versionRegistry: registry?.runtimeBoundary?.currentLevel ?? null,
        operatingModel: operatingModel?.runtimeBoundary?.currentLevel ?? null,
        reviewLedger: reviewLedger?.runtimeBoundary?.currentLevel ?? null,
        pluginIntegration: pluginIntegration?.fiveYearSubagentDevelopment?.currentRuntimeBoundary ?? null,
      },
      pluginIntegration: pluginIntegration
        ? {
            id: pluginIntegration.id,
            status: pluginIntegration.status,
            primaryInstallId: pluginIntegration.primaryInstallId ?? null,
            versionPromotionTool: pluginIntegration.runtimeIntegration?.versionPromotionTool ?? null,
          }
        : { missing: true, path: gates.sourceOfTruth?.pluginIntegration || PLUGIN_INTEGRATION_PATH },
      mcpRuntimeContract: mcpRuntimeContract
        ? {
            id: mcpRuntimeContract.id,
            status: mcpRuntimeContract.status,
            resourceUri: mcpRuntimeContract.resourceUri,
            resourceCount: mcpRuntimeContract.resourceCount,
            smokeTest: mcpRuntimeContract.smokeTest,
          }
        : { missing: true, path: gates.sourceOfTruth?.mcpRuntimeContract || MCP_RUNTIME_CONTRACT_PATH },
      laneEvidence,
      truthBoundaries: gates.truthBoundaries,
      forbiddenPromotionClaims: gates.forbiddenPromotionClaims || [],
    };
  } catch (error) {
    return {
      ok: false,
      tool: AI_CORE_VERSION_PROMOTION_TOOL,
      promotionGatesPath: AI_CORE_VERSION_PROMOTION_GATES_PATH,
      error: error.message,
    };
  }
}

export function subagentReviewLedgerStatus(repoRoot, options = {}) {
  try {
    const ledger = readSubagentReviewLedger(repoRoot);
    const quarters = Array.isArray(ledger.quarters) ? ledger.quarters : [];
    const selectedQuarterId = typeof options.quarterId === "string" ? options.quarterId.trim() : "";
    const selectedQuarter = selectedQuarterId
      ? quarters.find((quarter) => quarter.id === selectedQuarterId) || null
      : null;
    const completed = quarters.filter((quarter) => quarter.status === "documented-validated");
    const planned = quarters.filter((quarter) => quarter.status === "planned");
    const humanApprovalNeeded = quarters.filter((quarter) => quarter.humanApprovalNeeded === true);

    const payload = {
      ok: true,
      tool: SUBAGENT_REVIEW_LEDGER_TOOL,
      ledgerPath: SUBAGENT_REVIEW_LEDGER_PATH,
      id: ledger.id,
      status: ledger.status,
      qualityGate: ledger.qualityGate,
      runtimeBoundary: {
        currentLevel: ledger.runtimeBoundary?.currentLevel ?? null,
        writeExecution: ledger.runtimeBoundary?.writeExecution ?? null,
        backgroundAutomation: ledger.runtimeBoundary?.backgroundAutomation ?? null,
        externalMutation: ledger.runtimeBoundary?.externalMutation ?? null,
        credentialAccess: ledger.runtimeBoundary?.credentialAccess ?? null,
      },
      cadence: ledger.cadence,
      summary: {
        ...ledger.summary,
        quarterCount: quarters.length,
        documentedValidatedQuarterCount: completed.length,
        plannedQuarterCount: planned.length,
        humanApprovalNeededQuarterCount: humanApprovalNeeded.length,
      },
      currentQuarter:
        quarters.find((quarter) => quarter.id === ledger.cadence?.currentHorizonQuarter) || null,
      nextReviewQuarter:
        quarters.find((quarter) => quarter.id === ledger.cadence?.nextReviewQuarter) || null,
      selectedQuarter,
      nextSafeActions: ledger.nextSafeActions || [],
    };

    if (options.includeQuarters === true) {
      payload.quarters = quarters;
    }

    return payload;
  } catch (error) {
    return {
      ok: false,
      tool: SUBAGENT_REVIEW_LEDGER_TOOL,
      ledgerPath: SUBAGENT_REVIEW_LEDGER_PATH,
      error: error.message,
    };
  }
}

export function subagentOperatingModelStatus(repoRoot, options = {}) {
  try {
    const model = readSubagentOperatingModel(repoRoot);
    const integration = readPluginIntegration(repoRoot);
    const longHorizonPlan =
      readJsonIfExists(repoRoot, model.sourceOfTruth?.longHorizonPlan || SUBAGENT_LONG_HORIZON_PLAN_PATH);
    const roleSchema = readJsonIfExists(repoRoot, model.sourceOfTruth?.roleSchema || SUBAGENT_ROLE_SCHEMA_PATH);
    const permissionMatrixFixture = readJsonIfExists(repoRoot, model.sourceOfTruth?.permissionMatrix || SUBAGENT_PERMISSION_MATRIX_PATH);
    const dryRunQueue = readJsonIfExists(repoRoot, model.sourceOfTruth?.dryRunTaskQueue || SUBAGENT_DRY_RUN_QUEUE_PATH);
    const cancellationFixture = readJsonIfExists(repoRoot, model.sourceOfTruth?.cancellationFixture || SUBAGENT_CANCELLATION_FIXTURE_PATH);
    const approvalFixture = readJsonIfExists(repoRoot, model.sourceOfTruth?.approvalFixture || SUBAGENT_APPROVAL_FIXTURE_PATH);
    const redactionFixture = readJsonIfExists(repoRoot, model.sourceOfTruth?.redactionFixture || SUBAGENT_REDACTION_FIXTURE_PATH);
    const executionLedgerFixture = readJsonIfExists(
      repoRoot,
      model.sourceOfTruth?.executionLedgerFixture || SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH
    );
    const runtimeFixturePack = readJsonIfExists(repoRoot, model.sourceOfTruth?.runtimeFixtures || SUBAGENT_RUNTIME_FIXTURES_PATH);
    const reviewLedger = readJsonIfExists(repoRoot, model.sourceOfTruth?.reviewLedger || SUBAGENT_REVIEW_LEDGER_PATH);
    const versionRegistry = readJsonIfExists(repoRoot, model.sourceOfTruth?.versionRegistry || AI_CORE_VERSION_REGISTRY_PATH);
    const versionPromotionGates = readJsonIfExists(
      repoRoot,
      model.sourceOfTruth?.versionPromotionGates || AI_CORE_VERSION_PROMOTION_GATES_PATH
    );
    const longHorizonReviewPath = model.sourceOfTruth?.longHorizonReview || SUBAGENT_LONG_HORIZON_REVIEW_PATH;
    const reviewExists = existsSync(path.join(repoRoot, ...longHorizonReviewPath.split("/")));
    const permissionLevels = Array.isArray(model.permissionMatrix) ? model.permissionMatrix : [];
    const lanes = Array.isArray(model.lanes) ? model.lanes : [];
    const fiveYearRoadmap = Array.isArray(model.fiveYearRoadmap) ? model.fiveYearRoadmap : [];

    const payload = {
      ok: true,
      modelPath: SUBAGENT_OPERATING_MODEL_PATH,
      id: model.id,
      status: model.status,
      qualityGate: model.qualityGate,
      runtimeBoundary: {
        currentLevel: model.runtimeBoundary?.currentLevel ?? null,
        writeMode: model.runtimeBoundary?.writeMode ?? null,
        backgroundAutomation: model.runtimeBoundary?.backgroundAutomation ?? null,
        externalMutation: model.runtimeBoundary?.externalMutation ?? null,
        connectorAuthenticationClaim: model.runtimeBoundary?.connectorAuthenticationClaim ?? null,
      },
      permissionLevels: permissionLevels.map((permission) => ({
        level: permission.level,
        status: permission.status,
        approvalRequired: permission.approvalRequired,
      })),
      laneCount: lanes.length,
      lanes: lanes.map((lane) => ({
        id: lane.id,
        displayName: lane.displayName,
        subAgentRole: lane.subAgentRole,
        statusTool: lane.statusTool,
        planTool: lane.planTool,
        currentPermissionLevel: lane.currentPermissionLevel,
        qualityGate: lane.qualityGate,
        fiveYearDuty: lane.fiveYearDuty,
      })),
      fiveYearRoadmap: fiveYearRoadmap.map((entry) => ({
        year: entry.year,
        theme: entry.theme,
        promotionGate: entry.promotionGate,
        requiredEvidence: entry.requiredEvidence,
      })),
      cadence: model.cadence,
      evidenceRequirements: model.evidenceRequirements,
      runtimeFixtures: {
        versionRegistry: versionRegistry
          ? {
              path: model.sourceOfTruth?.versionRegistry || AI_CORE_VERSION_REGISTRY_PATH,
              id: versionRegistry.id,
              version: versionRegistry.version,
              status: versionRegistry.status,
              currentVersionId: versionRegistry.currentVersion?.id ?? null,
              languageVersion: versionRegistry.currentVersion?.languageVersion ?? null,
              runtimeBoundary: versionRegistry.runtimeBoundary?.currentLevel ?? null,
            }
          : { path: model.sourceOfTruth?.versionRegistry || AI_CORE_VERSION_REGISTRY_PATH, missing: true },
        versionPromotionGates: versionPromotionGates
          ? {
              path: model.sourceOfTruth?.versionPromotionGates || AI_CORE_VERSION_PROMOTION_GATES_PATH,
              id: versionPromotionGates.id,
              status: versionPromotionGates.status,
              tool: versionPromotionGates.tooling?.tool ?? null,
              currentDecision: versionPromotionGates.currentDryRun?.decision ?? null,
              gateCount: Array.isArray(versionPromotionGates.gates) ? versionPromotionGates.gates.length : 0,
            }
          : { path: model.sourceOfTruth?.versionPromotionGates || AI_CORE_VERSION_PROMOTION_GATES_PATH, missing: true },
        reviewLedger: reviewLedger
          ? {
              path: model.sourceOfTruth?.reviewLedger || SUBAGENT_REVIEW_LEDGER_PATH,
              id: reviewLedger.id,
              status: reviewLedger.status,
              reviewCadence: reviewLedger.cadence?.reviewCadence ?? null,
              quarterCount: Array.isArray(reviewLedger.quarters) ? reviewLedger.quarters.length : 0,
              currentHorizonQuarter: reviewLedger.cadence?.currentHorizonQuarter ?? null,
              nextReviewQuarter: reviewLedger.cadence?.nextReviewQuarter ?? null,
            }
          : { path: model.sourceOfTruth?.reviewLedger || SUBAGENT_REVIEW_LEDGER_PATH, missing: true },
        runtimeFixturePack: runtimeFixturePack
          ? {
              path: model.sourceOfTruth?.runtimeFixtures || SUBAGENT_RUNTIME_FIXTURES_PATH,
              id: runtimeFixturePack.id,
              status: runtimeFixturePack.status,
              fixtureCount: Array.isArray(runtimeFixturePack.fixtures) ? runtimeFixturePack.fixtures.length : 0,
              currentLevel: runtimeFixturePack.runtimeBoundary?.currentLevel ?? null,
              writeExecution: runtimeFixturePack.runtimeBoundary?.writeExecution ?? null,
            }
          : { path: model.sourceOfTruth?.runtimeFixtures || SUBAGENT_RUNTIME_FIXTURES_PATH, missing: true },
        roleSchema: roleSchema
          ? {
              path: model.sourceOfTruth?.roleSchema || SUBAGENT_ROLE_SCHEMA_PATH,
              id: roleSchema.id,
              status: roleSchema.status,
              roleCount: Array.isArray(roleSchema.roles) ? roleSchema.roles.length : 0,
              runtimeBoundary: roleSchema.runtimeBoundary ?? null,
            }
          : { path: model.sourceOfTruth?.roleSchema || SUBAGENT_ROLE_SCHEMA_PATH, missing: true },
        permissionMatrix: permissionMatrixFixture
          ? {
              path: model.sourceOfTruth?.permissionMatrix || SUBAGENT_PERMISSION_MATRIX_PATH,
              id: permissionMatrixFixture.id,
              status: permissionMatrixFixture.status,
              levelCount: Array.isArray(permissionMatrixFixture.levels) ? permissionMatrixFixture.levels.length : 0,
              runtimeBoundary: permissionMatrixFixture.runtimeBoundary ?? null,
            }
          : { path: model.sourceOfTruth?.permissionMatrix || SUBAGENT_PERMISSION_MATRIX_PATH, missing: true },
        dryRunTaskQueue: dryRunQueue
          ? {
              path: model.sourceOfTruth?.dryRunTaskQueue || SUBAGENT_DRY_RUN_QUEUE_PATH,
              id: dryRunQueue.id,
              status: dryRunQueue.status,
              dryRunOnly: dryRunQueue.dryRunOnly === true,
              stateCount: Array.isArray(dryRunQueue.states) ? dryRunQueue.states.length : 0,
              sampleTaskCount: Array.isArray(dryRunQueue.sampleTasks) ? dryRunQueue.sampleTasks.length : 0,
            }
          : { path: model.sourceOfTruth?.dryRunTaskQueue || SUBAGENT_DRY_RUN_QUEUE_PATH, missing: true },
        cancellationFixture: cancellationFixture
          ? {
              path: model.sourceOfTruth?.cancellationFixture || SUBAGENT_CANCELLATION_FIXTURE_PATH,
              id: cancellationFixture.id,
              status: cancellationFixture.status,
              cancellationTokenRequired: cancellationFixture.cancellationTokenRequired === true,
            }
          : { path: model.sourceOfTruth?.cancellationFixture || SUBAGENT_CANCELLATION_FIXTURE_PATH, missing: true },
        approvalFixture: approvalFixture
          ? {
              path: model.sourceOfTruth?.approvalFixture || SUBAGENT_APPROVAL_FIXTURE_PATH,
              id: approvalFixture.id,
              status: approvalFixture.status,
              approvalModel: approvalFixture.approvalModel ?? null,
              blanketApprovalAllowed: approvalFixture.blanketApprovalAllowed === true,
              sampleRequestCount: Array.isArray(approvalFixture.sampleRequests) ? approvalFixture.sampleRequests.length : 0,
            }
          : { path: model.sourceOfTruth?.approvalFixture || SUBAGENT_APPROVAL_FIXTURE_PATH, missing: true },
        redactionFixture: redactionFixture
          ? {
              path: model.sourceOfTruth?.redactionFixture || SUBAGENT_REDACTION_FIXTURE_PATH,
              id: redactionFixture.id,
              status: redactionFixture.status,
              promptAndResponseLoggingDefault: redactionFixture.promptAndResponseLoggingDefault ?? null,
              sampleOutputContainsSecretValue: redactionFixture.sampleOutputContainsSecretValue === true,
              rawProviderErrorsExposed: redactionFixture.rawProviderErrorsExposed === true,
              redactionTargetCount: Array.isArray(redactionFixture.redactionRequiredFor)
                ? redactionFixture.redactionRequiredFor.length
                : 0,
            }
          : { path: model.sourceOfTruth?.redactionFixture || SUBAGENT_REDACTION_FIXTURE_PATH, missing: true },
        executionLedgerFixture: executionLedgerFixture
          ? {
              path: model.sourceOfTruth?.executionLedgerFixture || SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH,
              id: executionLedgerFixture.id,
              status: executionLedgerFixture.status,
              mode: executionLedgerFixture.mode ?? null,
              writerPolicy: executionLedgerFixture.writerPolicy ?? null,
              requiredFieldCount: Array.isArray(executionLedgerFixture.requiredFields)
                ? executionLedgerFixture.requiredFields.length
                : 0,
              sampleRecordCount: Array.isArray(executionLedgerFixture.sampleRecords)
                ? executionLedgerFixture.sampleRecords.length
                : 0,
            }
          : { path: model.sourceOfTruth?.executionLedgerFixture || SUBAGENT_EXECUTION_LEDGER_FIXTURE_PATH, missing: true },
      },
      longHorizonPlan: longHorizonPlan
        ? {
            path: model.sourceOfTruth?.longHorizonPlan || SUBAGENT_LONG_HORIZON_PLAN_PATH,
            id: longHorizonPlan.id,
            status: longHorizonPlan.status,
            writerPolicy: longHorizonPlan.governance?.writerPolicy ?? null,
            defaultWriter: longHorizonPlan.governance?.defaultWriter ?? null,
            laneCount: Array.isArray(longHorizonPlan.lanes) ? longHorizonPlan.lanes.length : 0,
            yearCount: Array.isArray(longHorizonPlan.years) ? longHorizonPlan.years.length : 0,
            quarterCount: Array.isArray(longHorizonPlan.years)
              ? longHorizonPlan.years.reduce((sum, year) => sum + (Array.isArray(year.quarters) ? year.quarters.length : 0), 0)
              : 0,
            forbiddenAutonomy: longHorizonPlan.governance?.forbiddenAutonomy || [],
          }
        : {
            path: model.sourceOfTruth?.longHorizonPlan || SUBAGENT_LONG_HORIZON_PLAN_PATH,
            missing: true,
          },
      longHorizonReview: {
        path: longHorizonReviewPath,
        exists: reviewExists,
      },
      pluginIntegration: {
        id: integration.id,
        status: integration.status,
        currentRuntimeBoundary: integration.fiveYearSubagentDevelopment?.currentRuntimeBoundary ?? null,
        operatingModel: integration.fiveYearSubagentDevelopment?.operatingModel ?? null,
        longHorizonPlan: integration.fiveYearSubagentDevelopment?.longHorizonPlan ?? null,
      },
    };

    if (options.includeFullModel === true) {
      payload.model = model;
    }
    if (options.includeLongHorizonPlan === true && longHorizonPlan) {
      payload.longHorizonPlanRecord = longHorizonPlan;
    }

    return payload;
  } catch (error) {
    return {
      ok: false,
      modelPath: SUBAGENT_OPERATING_MODEL_PATH,
      error: error.message,
    };
  }
}

export function subagentDryRunTaskDecision(repoRoot, input = {}) {
  try {
    const taskId = typeof input.taskId === "string" ? input.taskId.trim() : "";
    if (!taskId) {
      return { ok: false, tool: SUBAGENT_DRY_RUN_TASK_TOOL, error: "taskId is required" };
    }

    const model = readSubagentOperatingModel(repoRoot);
    const queue = readJsonIfExists(repoRoot, model.sourceOfTruth?.dryRunTaskQueue || SUBAGENT_DRY_RUN_QUEUE_PATH);
    const roleSchema = readJsonIfExists(repoRoot, model.sourceOfTruth?.roleSchema || SUBAGENT_ROLE_SCHEMA_PATH);
    const permissionMatrixFixture = readJsonIfExists(repoRoot, model.sourceOfTruth?.permissionMatrix || SUBAGENT_PERMISSION_MATRIX_PATH);
    const cancellationFixture = readJsonIfExists(repoRoot, model.sourceOfTruth?.cancellationFixture || SUBAGENT_CANCELLATION_FIXTURE_PATH);
    const approvalFixture = readJsonIfExists(repoRoot, model.sourceOfTruth?.approvalFixture || SUBAGENT_APPROVAL_FIXTURE_PATH);

    if (!queue || !Array.isArray(queue.sampleTasks)) {
      return { ok: false, tool: SUBAGENT_DRY_RUN_TASK_TOOL, taskId, error: "dry-run task queue fixture is missing or invalid" };
    }

    const task = queue.sampleTasks.find((candidate) => candidate.id === taskId);
    if (!task) {
      return { ok: false, tool: SUBAGENT_DRY_RUN_TASK_TOOL, taskId, error: `unknown dry-run task: ${taskId}` };
    }

    const role = (Array.isArray(roleSchema?.roles) ? roleSchema.roles : []).find((candidate) => candidate.id === task.roleId);
    const permissionLevels = Array.isArray(permissionMatrixFixture?.levels)
      ? permissionMatrixFixture.levels
      : Array.isArray(model.permissionMatrix)
        ? model.permissionMatrix
        : [];
    const permission = permissionLevels.find((candidate) => candidate.level === task.permissionLevel);
    const signal = typeof input.signal === "string" ? input.signal.trim() : "";
    const requestedTool = typeof input.requestedTool === "string" ? input.requestedTool.trim() : "";
    const requestedPath = typeof input.requestedPath === "string" ? input.requestedPath.trim() : "";

    const cancellation = evaluateCancellationSignal(cancellationFixture, signal);
    const tool = evaluateRequestedTool(role, requestedTool);
    const requestedPathDecision = evaluateRequestedPath(repoRoot, requestedPath, task.targetScope);
    const approvalRequired =
      task.approvalRequired === true ||
      permission?.approvalRequired === true ||
      permission?.approvalRequired === "task-scoped" ||
      task.state === "awaiting-approval";

    let decision = "allowed";
    let nextState = task.state;
    let reason = "task can be evaluated in dry-run mode only";

    if (cancellation.cancelled) {
      decision = "cancelled";
      nextState = "cancelled";
      reason = cancellation.reason;
    } else if (cancellation.allowed === false) {
      decision = "denied";
      reason = cancellation.reason;
    } else if (tool.allowed === false) {
      decision = "denied";
      reason = tool.reason;
    } else if (requestedPathDecision.allowed === false) {
      decision = "denied";
      reason = requestedPathDecision.reason;
    } else if (approvalRequired) {
      decision = "blocked";
      nextState = "awaiting-approval";
      reason = "task requires explicit human approval before execution";
    }

    return {
      ok: true,
      tool: SUBAGENT_DRY_RUN_TASK_TOOL,
      executionMode: "dry-run-only",
      taskId: task.id,
      laneId: task.laneId,
      roleId: task.roleId,
      permissionLevel: task.permissionLevel,
      state: task.state,
      nextState,
      decision,
      reason,
      dryRunOnly: queue.dryRunOnly === true && task.dryRunOnly === true,
      realExecutionBlocked: true,
      externalMutationPerformed: false,
      fileMutationPerformed: false,
      approvalRequired,
      approvalModel: approvalFixture?.approvalModel ?? null,
      blanketApprovalAllowed: approvalFixture?.blanketApprovalAllowed === true,
      requiredApprovalEvidence: approvalFixture?.sampleRequests?.find((request) => request.executionBlocked === true)?.requiredEvidence || [],
      cancellation,
      requestedTool: tool,
      requestedPath: requestedPathDecision,
      validator: task.validator ?? null,
      rollbackNote: task.rollbackNote ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      tool: SUBAGENT_DRY_RUN_TASK_TOOL,
      taskId: input?.taskId ?? null,
      error: error.message,
    };
  }
}

export function pluginIntegrationStatus(repoRoot, options = {}) {
  try {
    const manifest = readPluginIntegration(repoRoot);
    const lanes = Array.isArray(manifest.lanes) ? manifest.lanes : [];
    const personalPlugins = Array.isArray(manifest.personalPlugins) ? manifest.personalPlugins : [];
    const payload = {
      ok: true,
      manifestPath: PLUGIN_INTEGRATION_PATH,
      id: manifest.id,
      status: manifest.status,
      primaryInstallId: manifest.primaryInstallId,
      installedEnabledCount: manifest.auditedSnapshot?.installedEnabledCount ?? null,
      notInstalledCount: manifest.auditedSnapshot?.notInstalledCount ?? null,
      personalPluginCount: personalPlugins.length,
      personalPlugins: personalPlugins.map((plugin) => ({
        id: plugin.id,
        status: plugin.status,
        embeddedAs: plugin.embeddedAs
      })),
      laneCount: lanes.length,
      lanes: lanes.map((lane) => ({
        id: lane.id,
        displayName: lane.displayName,
        role: lane.role,
        mcpTools: lane.mcpTools,
        defaultGate: lane.defaultGate
      })),
      helperPluginUniverse: manifest.helperPluginUniverse,
      runtimeIntegration: {
        toolLoopTool: manifest.runtimeIntegration?.toolLoopTool ?? null,
        mcpTool: manifest.runtimeIntegration?.mcpTool ?? null,
        mcpResource: manifest.runtimeIntegration?.mcpResource ?? null,
        mcpResources: manifest.runtimeIntegration?.mcpResources ?? [],
        modelScalingTool: manifest.runtimeIntegration?.modelScalingTool ?? null,
        frontierTrainingTool: manifest.runtimeIntegration?.frontierTrainingTool ?? null,
        trainingEvidenceTool: manifest.runtimeIntegration?.trainingEvidenceTool ?? null,
        versionRegistryTool: manifest.runtimeIntegration?.versionRegistryTool ?? null,
        versionPromotionTool: manifest.runtimeIntegration?.versionPromotionTool ?? null,
        subagentOperatingModelTool: manifest.runtimeIntegration?.subagentOperatingModelTool ?? null,
      },
      qualityCommands: manifest.qualityCommands
    };

    if (options.includeFullManifest === true) {
      payload.manifest = manifest;
    }

    return payload;
  } catch (error) {
    return {
      ok: false,
      manifestPath: PLUGIN_INTEGRATION_PATH,
      error: error.message
    };
  }
}

export function resolvePersonalPluginLaneTool(toolName) {
  for (const laneTool of PERSONAL_PLUGIN_LANE_TOOLS) {
    if (toolName === laneTool.statusTool) return { ...laneTool, kind: "status" };
    if (toolName === laneTool.planTool) return { ...laneTool, kind: "plan" };
  }
  return null;
}

export function personalPluginLaneStatus(repoRoot, laneId) {
  try {
    const manifest = readPluginIntegration(repoRoot);
    const lane = findLane(manifest, laneId);
    if (!lane) {
      return {
        ok: false,
        laneId,
        manifestPath: PLUGIN_INTEGRATION_PATH,
        error: `Unknown SEIS plugin lane: ${laneId}`,
      };
    }

    const sourceMirror = lane.sourceMirror || null;
    const embeddedSkill = lane.embeddedSkill || null;
    const sourceProfilePath = sourceMirror ? `${sourceMirror}/assets/lane-profile.json` : null;
    const agentLaneProfilePath = `plugins/seis-ai-agent/assets/lanes/${lane.id}.json`;
    const sourceProfile = readJsonIfExists(repoRoot, sourceProfilePath);
    const agentLaneProfile = readJsonIfExists(repoRoot, agentLaneProfilePath);
    const sourceMirrorExists = sourceMirror ? existsSync(path.join(repoRoot, sourceMirror)) : false;
    const embeddedSkillExists = embeddedSkill ? existsSync(path.join(repoRoot, embeddedSkill)) : false;
    const mcpTools = Array.isArray(lane.mcpTools) ? lane.mcpTools : [];

    return {
      ok: true,
      laneId: lane.id,
      displayName: lane.displayName,
      role: lane.role,
      status: sourceMirrorExists && embeddedSkillExists ? "ready" : "partial",
      primaryInstallId: manifest.primaryInstallId,
      standaloneLaneInstallMode: manifest.canonicalAgent?.standaloneLaneInstallMode ?? null,
      authenticationClaim: manifest.auditedSnapshot?.authenticationClaim ?? "unknown",
      activationPolicy: manifest.activationPolicy?.mode ?? null,
      externalMutationRequiresUserConfirmation:
        manifest.activationPolicy?.externalMutationRequiresUserConfirmation === true,
      sourceMirror,
      sourceMirrorExists,
      embeddedSkill,
      embeddedSkillExists,
      sourceProfilePath,
      sourceProfileExists: sourceProfile !== null,
      agentLaneProfilePath,
      agentLaneProfileExists: agentLaneProfile !== null,
      profile: sourceProfile || agentLaneProfile || null,
      mcpTools,
      defaultGate: lane.defaultGate || null,
      qualityCommands: sourceProfile?.qualityCommands || [lane.defaultGate].filter(Boolean),
    };
  } catch (error) {
    return {
      ok: false,
      laneId,
      manifestPath: PLUGIN_INTEGRATION_PATH,
      error: error.message,
    };
  }
}

export function personalPluginLanePlan(repoRoot, laneId, request) {
  if (typeof request !== "string" || !request.trim()) {
    return {
      ok: false,
      laneId,
      error: "request is required",
    };
  }

  const status = personalPluginLaneStatus(repoRoot, laneId);
  if (!status.ok) {
    return status;
  }

  return {
    ok: true,
    laneId: status.laneId,
    displayName: status.displayName,
    request: request.trim(),
    role: status.role,
    focus: status.profile?.intent || status.role,
    activationPolicy: status.profile?.activationPolicy || status.activationPolicy,
    steps: LANE_PLAN_STEPS[status.laneId] || [
      "Inspect the relevant SEIS source-of-truth records.",
      "Classify scope, risk, validation, and approval boundaries.",
      "Apply the smallest safe change.",
      "Validate with the lane quality gate.",
      "Document remaining blockers and next safe action.",
    ],
    primaryPaths: status.profile?.primaryPaths || [],
    guardrails: status.profile?.guardrails || [
      "preserve user work",
      "do not expose secrets",
      "validate before completion",
    ],
    defaultChecks: status.qualityCommands,
    approvalBoundary: status.externalMutationRequiresUserConfirmation
      ? "External mutation, deployment, SSH, credential, destructive, or GitHub write actions require explicit human approval."
      : "Use repository governance and task scope to determine approval requirements.",
    authenticationClaim: status.authenticationClaim,
  };
}

function findLane(manifest, laneId) {
  return (Array.isArray(manifest.lanes) ? manifest.lanes : []).find((lane) => lane.id === laneId);
}

function readJsonIfExists(repoRoot, relativePath) {
  if (!relativePath) return null;
  let filePath;
  try {
    filePath = resolveInside(repoRoot, relativePath);
  } catch {
    return null;
  }
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readJsonSource(repoRoot, relativePath) {
  const baseHealth = {
    path: relativePath,
    exists: false,
    parseOk: false,
    ok: false,
    status: "missing",
    error: null,
  };

  if (!relativePath) {
    return {
      data: null,
      health: { ...baseHealth, status: "missing-path" },
    };
  }

  const filePath = path.join(repoRoot, ...relativePath.split("/"));
  if (!existsSync(filePath)) {
    return { data: null, health: baseHealth };
  }

  try {
    const data = JSON.parse(readFileSync(filePath, "utf8"));
    return {
      data,
      health: {
        ...baseHealth,
        exists: true,
        parseOk: true,
        ok: true,
        status: "ready",
      },
    };
  } catch (error) {
    return {
      data: null,
      health: {
        ...baseHealth,
        exists: true,
        status: "invalid-json",
        error: error.message,
      },
    };
  }
}

function evaluateCancellationSignal(cancellationFixture, signal) {
  if (!signal) return { allowed: true, cancelled: false, signal: null };
  const supportedSignals = Array.isArray(cancellationFixture?.supportedSignals) ? cancellationFixture.supportedSignals : [];
  if (!supportedSignals.includes(signal)) {
    return {
      allowed: false,
      cancelled: false,
      signal,
      reason: `unsupported cancellation signal: ${signal}`,
    };
  }

  return {
    allowed: true,
    cancelled: true,
    signal,
    toState: "cancelled",
    artifactsPreserved: cancellationFixture?.sampleCancellation?.artifactsPreserved === true,
    laterToolCallsAllowed: false,
    reason: `dry-run task cancelled by ${signal}`,
  };
}

function evaluateRequestedTool(role, requestedTool) {
  if (!requestedTool) return { allowed: true, tool: null, reason: "no tool requested" };
  const deniedTools = Array.isArray(role?.deniedTools) ? role.deniedTools : [];
  if (deniedTools.includes(requestedTool)) {
    return { allowed: false, tool: requestedTool, reason: `tool denied by role policy: ${requestedTool}` };
  }

  const allowedTools = Array.isArray(role?.allowedTools) ? role.allowedTools : [];
  if (allowedTools.length > 0 && !allowedTools.includes(requestedTool)) {
    return { allowed: false, tool: requestedTool, reason: `tool is not in role allowlist: ${requestedTool}` };
  }

  return { allowed: true, tool: requestedTool, reason: "tool allowed for dry-run evaluation" };
}

function evaluateRequestedPath(repoRoot, requestedPath, targetScope) {
  if (!requestedPath) return { allowed: true, path: null, reason: "no path requested" };

  const root = path.resolve(repoRoot);
  const resolved = path.resolve(repoRoot, requestedPath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return { allowed: false, path: requestedPath, reason: "path traversal denied" };
  }

  const normalizedPath = path.relative(root, resolved).split(path.sep).join("/");
  const scopes = Array.isArray(targetScope) ? targetScope : [];
  const withinScope = scopes.some((scope) => matchesScope(normalizedPath, scope));
  return {
    allowed: withinScope,
    path: requestedPath,
    normalizedPath,
    targetScope: scopes,
    reason: withinScope ? "path is inside task target scope" : "path is outside task target scope",
  };
}

function matchesScope(normalizedPath, scope) {
  if (typeof scope !== "string" || !scope) return false;
  if (scope.endsWith("/**")) {
    const prefix = scope.slice(0, -3);
    return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
  }
  if (scope.endsWith("/*")) {
    const prefix = scope.slice(0, -2);
    const remainder = normalizedPath.slice(prefix.length + 1);
    return normalizedPath.startsWith(`${prefix}/`) && remainder.length > 0 && !remainder.includes("/");
  }
  if (scope.includes("*")) return false;
  return normalizedPath === scope || normalizedPath.startsWith(`${scope}/`);
}
