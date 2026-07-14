import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { toolDefinitions, executeTool } from "../src/agent/tools.mjs";
import { runAgent, resolveModel, MODEL_ALIASES, DEFAULT_MODEL } from "../src/agent/loop.mjs";

/* ------------------------------------------------------------------ */
/* Fixture                                                            */
/* ------------------------------------------------------------------ */

let repoRoot;
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function makeRepo(files = {}) {
  repoRoot = path.join(tmpdir(), `seis-agent-test-${process.pid}-${Date.now()}`);
  mkdirSync(repoRoot, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    const abs = path.join(repoRoot, name);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
  }
  return repoRoot;
}

afterEach(() => {
  if (repoRoot) rmSync(repoRoot, { recursive: true, force: true });
  repoRoot = undefined;
});

/* ------------------------------------------------------------------ */
/* Model aliases                                                      */
/* ------------------------------------------------------------------ */

describe("resolveModel", () => {
  it("maps aliases case-insensitively", () => {
    assert.equal(resolveModel("opus"), MODEL_ALIASES.opus);
    assert.equal(resolveModel("SONNET"), MODEL_ALIASES.sonnet);
  });

  it("passes through full model ids", () => {
    assert.equal(resolveModel("claude-opus-4-8"), "claude-opus-4-8");
  });

  it("defaults when empty", () => {
    assert.equal(resolveModel(undefined), DEFAULT_MODEL);
  });
});

/* ------------------------------------------------------------------ */
/* toolDefinitions                                                    */
/* ------------------------------------------------------------------ */

describe("toolDefinitions", () => {
  it("excludes write tools by default", () => {
    const names = toolDefinitions().map((t) => t.name);
    assert.ok(names.includes("read_file"));
    assert.ok(names.includes("git_diff"));
    assert.ok(names.includes("git_log"));
    assert.ok(names.includes("seis_cloud_status"));
    assert.ok(names.includes("seis_code_plan"));
    assert.ok(names.includes("seis_design_status"));
    assert.ok(names.includes("seis_data_plan"));
    assert.ok(names.includes("seis_ai_core_provider_status"));
    assert.ok(names.includes("seis_ai_core_read_only_route"));
    assert.ok(names.includes("seis_ai_core_model_scaling_status"));
    assert.ok(names.includes("seis_ai_core_version_status"));
    assert.ok(names.includes("seis_ai_core_version_promotion_dry_run"));
    assert.ok(names.includes("seis_ai_core_subagent_model"));
    assert.ok(names.includes("seis_ai_core_subagent_dry_run"));
    assert.ok(names.includes("seis_ai_core_subagent_review_ledger"));
    assert.ok(!names.includes("write_file"));
    assert.ok(!names.includes("edit_file"));
  });

  it("includes edit_file and write_file with allowWrite", () => {
    const names = toolDefinitions({ allowWrite: true }).map((t) => t.name);
    assert.ok(names.includes("write_file"));
    assert.ok(names.includes("edit_file"));
    assert.ok(names.includes("git_diff"));
    assert.ok(names.includes("git_log"));
  });
});

/* ------------------------------------------------------------------ */
/* executeTool                                                        */
/* ------------------------------------------------------------------ */

describe("executeTool", () => {
  beforeEach(() =>
    makeRepo({
      "apps/web/index.html": "<html><body id=\"app\">hello world</body></html>",
      "apps/web/script.js": "var app = document.querySelector(\"#app\");",
      "content/development/seis-agent-plugin-integration.json": JSON.stringify({
        id: "seis-agent-plugin-integration",
        status: "active",
        primaryInstallId: "seis-ai-agent@seis-repo",
        auditedSnapshot: { installedEnabledCount: 185, notInstalledCount: 5, authenticationClaim: "not-claimed" },
        canonicalAgent: { standaloneLaneInstallMode: "disabled" },
        activationPolicy: { mode: "task-scoped-lane-activation", externalMutationRequiresUserConfirmation: true },
        personalPlugins: [{ id: "seis@personal", status: "installed-enabled-audited", embeddedAs: "seis" }],
        lanes: [
          {
            id: "seis",
            displayName: "SEIS Hub",
            role: "repo governance",
            sourceMirror: "plugins/seis",
            embeddedSkill: "plugins/seis-ai-agent/skills/seis-hub/SKILL.md",
            mcpTools: ["seis_hub_status", "seis_hub_plan"],
            defaultGate: "npm run check:seis-ai-agent"
          },
          {
            id: "seis-cloud",
            displayName: "SEIS Cloud",
            role: "cloud readiness",
            sourceMirror: "plugins/seis-cloud",
            embeddedSkill: "plugins/seis-ai-agent/skills/seis-cloud/SKILL.md",
            mcpTools: ["seis_cloud_status", "seis_cloud_plan"],
            defaultGate: "npm run check:cloud-access-policy"
          },
          {
            id: "seis-code",
            displayName: "SEIS-Code",
            role: "engineering",
            sourceMirror: "plugins/seis-code",
            embeddedSkill: "plugins/seis-ai-agent/skills/seis-code/SKILL.md",
            mcpTools: ["seis_code_status", "seis_code_plan"],
            defaultGate: "npm run check:seis-plugin-bundle"
          },
          {
            id: "seis-design",
            displayName: "SEIS-Design",
            role: "design",
            sourceMirror: "plugins/seis-design",
            embeddedSkill: "plugins/seis-ai-agent/skills/seis-design/SKILL.md",
            mcpTools: ["seis_design_status", "seis_design_plan"],
            defaultGate: "npm run check:motion-evidence"
          },
          {
            id: "seis-data",
            displayName: "SEIS-DATA",
            role: "data",
            sourceMirror: "plugins/seis-data",
            embeddedSkill: "plugins/seis-ai-agent/skills/seis-data/SKILL.md",
            mcpTools: ["seis_data_status", "seis_data_plan"],
            defaultGate: "npm run check:plugin-capability-lanes"
          }
        ],
        runtimeIntegration: {
          toolLoopTool: "seis_plugin_integration",
          versionRegistryTool: "seis_ai_core_version_status",
          versionPromotionTool: "seis_ai_core_version_promotion_dry_run",
          subagentOperatingModelTool: "seis_ai_core_subagent_model",
          mcpResources: [
            "seis://agent/plugin-integration.json",
            "seis://ai/version-registry.json",
            "seis://ai/version-promotion-gates.json",
            "seis://ai/subagent-operating-model.json",
            "seis://ai/sub-agent-5-year-plan.json",
            "seis://ai/agent-role-schema.json",
            "seis://ai/agent-permission-matrix.json",
            "seis://ai/dry-run-task-queue.json",
            "seis://ai/cancellation-fixture.json",
            "seis://ai/approval-fixture.json",
            "seis://ai/redaction-fixture.json",
            "seis://ai/execution-ledger-fixture.json",
            "seis://ai/subagent-runtime-fixtures.json",
            "seis://ai/subagent-review-ledger.json"
          ]
        },
        fiveYearSubagentDevelopment: {
          currentRuntimeBoundary: "status-and-plan-only",
          versionRegistry: "content/development/seis-ai-core-version-registry.json",
          versionPromotionGates: "content/development/seis-ai-core-version-promotion-gates.json",
          operatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
          longHorizonPlan: "content/development/seis-sub-agent-5-year-plan.json",
          roleSchema: "content/development/seis-ai-core-agent-role-schema.json",
          permissionMatrix: "content/development/seis-ai-core-agent-permission-matrix.json",
          dryRunTaskQueue: "content/development/seis-ai-core-dry-run-task-queue.json",
          cancellationFixture: "content/development/seis-ai-core-cancellation-fixture.json",
          approvalFixture: "content/development/seis-ai-core-approval-fixture.json",
          redactionFixture: "content/development/seis-ai-core-redaction-fixture.json",
          executionLedgerFixture: "content/development/seis-ai-core-execution-ledger-fixture.json",
          runtimeFixtures: "content/development/seis-ai-core-subagent-runtime-fixtures.json",
          reviewLedger: "content/development/seis-ai-core-subagent-review-ledger.json"
        },
        helperPluginUniverse: { uniquePlugins: 300 },
        qualityCommands: [
          "npm run check:seis-agent-plugin-integration",
          "npm run check:seis-ai-core-version-registry",
          "npm run check:seis-ai-core-version-promotion-gates"
        ]
      }),
      "content/development/seis-ai-core-provider-registry.json": JSON.stringify({
        id: "seis-ai-core-provider-registry",
        version: 1,
        status: "documented-fixture",
        qualityGate: "npm run check:seis-ai-core-provider-registry",
        truthBoundary: "fixture only; no live provider calls",
        publicStates: ["Available", "Missing Key", "Disabled", "Rate Limited", "Error"],
        stateModel: [
          { state: "Available", routingEligible: true, meaning: "usable" },
          { state: "Missing Key", routingEligible: false, meaning: "missing server-only key" },
          { state: "Disabled", routingEligible: false, meaning: "disabled" },
          { state: "Rate Limited", routingEligible: false, meaning: "quota" },
          { state: "Error", routingEligible: false, meaning: "redacted error" }
        ],
        coreCredentialRequirement: "none",
        defaultRoutingMode: "local-demo",
        localOnlyRespected: true,
        requiredForCore: [],
        fallbackOrder: ["local-demo", "feature-disabled"],
        providers: [
          {
            id: "seis-local-demo",
            displayName: "SEIS Local Demo Runtime",
            category: "local-demo",
            publicStatus: "Available",
            credentialRequirement: "none",
            configured: true,
            enabled: true,
            routingEligible: true,
            privacyClass: "browser-local-demo",
            capabilities: ["general-chat-demo"],
            modelAliases: ["local-demo"],
            actualModel: "none-local-demo",
            backendOnly: true,
            frontendSecretAllowed: false,
            fallbackEligible: true
          },
          {
            id: "anthropic-claude",
            displayName: "Anthropic Claude",
            category: "cloud-model-provider",
            publicStatus: "Missing Key",
            credentialRequirement: "optional-live-feature",
            expectedEnv: ["ANTHROPIC_API_KEY"],
            configured: false,
            enabled: false,
            routingEligible: false,
            privacyClass: "server-only-cloud",
            capabilities: ["architecture-review"],
            modelAliases: ["claude-review-profile"],
            actualModel: "not-configured",
            backendOnly: true,
            frontendSecretAllowed: false,
            fallbackEligible: false
          }
        ],
        optionalForLiveFeatures: [{ providerId: "anthropic-claude", env: ["ANTHROPIC_API_KEY"], scope: "server-only review" }],
        noKeyProviders: ["seis-local-demo"],
        securityInvariants: ["Core SEIS AI must start with zero cloud provider keys."],
        nextSafeActions: ["Keep provider routing disabled until adapter tests exist."]
      }),
      "content/development/seis-model-scaling-hardware-profile.json": JSON.stringify({
        id: "seis-model-scaling-hardware-profile",
        version: "2026.06.23",
        status: "planned-compatibility-contract",
        truthBoundary: "Repository-local profile only; no trained 20B, 70B, 150B, or 512B weights, no AGI claim, no inference, no benchmark, no live provider calls, and no foundation model ownership claim.",
        sourceOfTruth: {
          parameterLadder: "content/development/seis-model-parameter-ladder.json",
          frontierEscalationPolicy: "content/development/seis-model-frontier-escalation-policy.json",
          frontierModelProgram: "content/development/seis-150b-frontier-model-program.json",
          apexModelProgram: "content/development/seis-512b-apex-model-program.json",
          benchmarkManifest: "reports/seis-model-scaling/20b-16gb-memory-benchmark.json",
          benchmarkDryRun: "reports/seis-model-scaling/20b-benchmark-dry-run.json",
          localHardwarePreflightCheck: "scripts/check-seis-model-local-hardware-preflight.mjs",
          modelCardTemplate: "content/development/seis-20b-model-card-template.json",
          datasetCardTemplate: "content/development/seis-20b-dataset-card-template.json"
        },
        coreCredentialRequirement: "none",
        defaultMode: "local-demo-until-validated",
        currentTarget: {
          id: "seis-20b-local-compatibility-target",
          displayName: "SEIS 20B Local Compatibility Target",
          parameterClass: "20B",
          parameterCountBillion: 20,
          minimumSystemRamGb: 16,
          targetRamClass: "16GB+ RAM",
          compatibilityStatus: "planned-not-validated",
          trainingStatus: "not-started",
          weightsAvailable: false,
          inferenceAvailable: false,
          benchmarkStatus: "not-run",
          runtimeAuthority: false,
          productionReady: false,
          quantizationRequired: true,
          quantizationStatus: "planned-not-benchmarked",
          routerEligibility: "blocked-until-validation",
          localDemoFallback: "seis-local-demo"
        },
        frontierTarget: {
          id: "seis-150b-frontier-research-target",
          displayName: "SEIS 150B Frontier Research Target",
          parameterClass: "150B",
          parameterCountBillion: 150,
          targetHardwareClass: "approved distributed research runtime",
          compatibilityStatus: "not-scoped",
          trainingStatus: "not-started",
          weightsAvailable: false,
          inferenceAvailable: false,
          benchmarkStatus: "not-run",
          runtimeAuthority: false,
          productionReady: false,
          routerEligibility: "blocked-until-frontier-evidence",
          localDemoFallback: "seis-local-demo"
        },
        apexTarget: {
          id: "seis-512b-apex-frontier-target",
          displayName: "SEIS 512B AGI Apex Research Target",
          parameterClass: "512B",
          parameterCountBillion: 512,
          targetHardwareClass: "frontier-scale distributed research cluster",
          compatibilityStatus: "not-scoped",
          trainingStatus: "not-started",
          weightsAvailable: false,
          inferenceAvailable: false,
          benchmarkStatus: "not-run",
          agiCapabilityStatus: "not-demonstrated",
          runtimeAuthority: false,
          productionReady: false,
          routerEligibility: "blocked-until-apex-evidence",
          localDemoFallback: "seis-local-demo"
        },
        scaleLadder: [
          { id: "seis-20b-local-target", parameterClass: "20B", horizon: "now", targetHardwareClass: "16GB+ RAM", status: "planned-not-validated", promotionGate: "memory benchmark" },
          { id: "seis-70b-research-target", parameterClass: "70B", horizon: "future", targetHardwareClass: "approved high-memory runtime", status: "research-roadmap", promotionGate: "explicit approval" },
          { id: "seis-150b-frontier-research-target", parameterClass: "150B", horizon: "future-frontier", targetHardwareClass: "approved distributed research runtime", status: "frontier-research-roadmap", promotionGate: "explicit approval" },
          { id: "seis-512b-agi-apex-target", parameterClass: "512B", horizon: "apex-frontier", targetHardwareClass: "frontier-scale distributed research cluster", status: "apex-program-plan-only", promotionGate: "explicit approval" }
        ],
        hardwareTiers: [
          { id: "developer-16gb-plus", label: "16GB+ RAM developer machine", allowedToday: "Local Demo only", modelTarget: "20B planned compatibility target", claimStatus: "target-not-validated" }
        ],
        routerPolicy: {
          localOnlyRespected: true,
          silentCloudFallbackAllowed: false,
          missingKeyIsError: false,
          actualProviderAndModelMustBeVisible: true,
          blockedToday: ["20B live inference", "70B live inference", "150B live inference", "512B live inference"]
        },
        promotionGates: ["16GB+ memory ceiling benchmark for 20B target"],
        forbiddenClaims: ["SEIS has trained a 20B foundation model.", "SEIS has trained a 150B foundation model."],
        humanApprovalRequiredFor: ["model download", "training run"],
        nextSafeActions: ["Keep Local Demo active."]
      }),
      "reports/seis-model-scaling/20b-16gb-memory-benchmark.json": JSON.stringify({
        id: "seis-20b-16gb-memory-benchmark",
        status: "template-not-measured",
        targetParameterClass: "20B",
        targetRamClass: "16GB+ RAM",
        compatibilityClaim: "not-verified",
        benchmarkEvidenceAvailable: false,
        runtimeAuthority: false,
        routeEligibleToday: false,
        productionReady: false,
        measurementTemplate: {
          machineRamGb: null,
          peakResidentMemoryGb: null,
          tokensPerSecond: null
        }
      }),
      "reports/seis-model-scaling/20b-benchmark-dry-run.json": JSON.stringify({
        id: "seis-20b-benchmark-dry-run",
        status: "dry-run-not-measured",
        targetId: "seis-20b-local-compatibility-target",
        parameterClass: "20B",
        targetRamClass: "16GB+ RAM",
        sourceOfTruth: {
          hostHardwarePreflight: "scripts/inspect-seis-model-local-hardware.mjs",
          localHardwarePreflightCheck: "scripts/check-seis-model-local-hardware-preflight.mjs"
        },
        dryRunResult: {
          canRequestRealBenchmarkToday: false,
          routeEligibleToday: false,
          runtimeAuthority: false,
          productionReady: false,
          measuredBenchmark: false,
          modelCompatibilityVerified: false
        },
        readinessGates: [
          { id: "host-preflight", status: "available-not-sufficient" },
          { id: "measured-memory-benchmark", status: "blocked" }
        ],
        forbiddenClaims: ["SEIS has verified 16GB+ compatibility."]
      }),
      "content/development/seis-model-parameter-ladder.json": JSON.stringify({
        id: "seis-model-parameter-ladder",
        status: "planning-contract-not-runtime",
        resourceUri: "seis://ai/model-parameter-ladder.json",
        defaultRoute: "seis-local-demo",
        routeEligibleToday: false,
        promotionOrder: ["local-demo", "20B", "70B", "150B", "300B+", "512B", "highest-available-future"],
        targets: [
          { id: "seis-20b-16gb-plus-local-compatibility", displayName: "SEIS 20B", parameterClass: "20B", parameterCountBillion: 20, horizon: "current-planning-target", minimumRamClass: "16GB+ RAM", status: "planned-not-validated", allowedToday: "Local Demo only", trainingStatus: "not-started", weightsAvailable: false, inferenceAvailable: false, benchmarkEvidenceAvailable: false, routeEligibleToday: false, runtimeAuthority: false, productionReady: false, evidenceRequiredBeforeRoute: ["model card", "dataset card", "benchmark", "fallback", "redacted logs", "human approval"] },
          { id: "seis-70b-research-lane", displayName: "SEIS 70B", parameterClass: "70B", parameterCountBillion: 70, horizon: "future-research", minimumRamClass: "64GB+ RAM", status: "research-roadmap", allowedToday: "Planning only", trainingStatus: "not-started", weightsAvailable: false, inferenceAvailable: false, benchmarkEvidenceAvailable: false, routeEligibleToday: false, runtimeAuthority: false, productionReady: false, evidenceRequiredBeforeRoute: ["20B gates", "model card", "dataset card", "hardware budget", "safety", "human approval"] },
          { id: "seis-150b-frontier-research-lane", displayName: "SEIS 150B", parameterClass: "150B", parameterCountBillion: 150, horizon: "frontier-research", minimumRamClass: "approved distributed", status: "frontier-research-roadmap", allowedToday: "Disabled", trainingStatus: "not-started", weightsAvailable: false, inferenceAvailable: false, benchmarkEvidenceAvailable: false, routeEligibleToday: false, runtimeAuthority: false, productionReady: false, evidenceRequiredBeforeRoute: ["20B evidence", "70B evidence", "training plan", "budget", "safety", "human approval"] },
          { id: "seis-300b-plus-exploration-boundary", displayName: "SEIS 300B+", parameterClass: "300B+", parameterCountBillion: 300, horizon: "long-term-frontier", minimumRamClass: "not scoped", status: "not-scoped", allowedToday: "Disabled", trainingStatus: "not-started", weightsAvailable: false, inferenceAvailable: false, benchmarkEvidenceAvailable: false, routeEligibleToday: false, runtimeAuthority: false, productionReady: false, evidenceRequiredBeforeRoute: ["150B evidence", "governance", "hardware", "cost", "safety", "human approval"] },
          { id: "seis-512b-agi-apex-research-lane", displayName: "SEIS 512B", parameterClass: "512B", parameterCountBillion: 512, horizon: "apex-frontier", minimumRamClass: "frontier-scale distributed", status: "apex-program-plan-only", allowedToday: "Disabled", trainingStatus: "not-started", weightsAvailable: false, inferenceAvailable: false, benchmarkEvidenceAvailable: false, routeEligibleToday: false, runtimeAuthority: false, productionReady: false, evidenceRequiredBeforeRoute: ["20B evidence", "70B evidence", "150B evidence", "300B feasibility", "AGI eval protocol", "human approval"] },
          { id: "seis-highest-available-future-boundary", displayName: "SEIS Highest Future", parameterClass: "highest-available-future", parameterCountBillion: null, horizon: "future-undefined", minimumRamClass: "defined only after measured lower-tier evidence", status: "not-scoped", allowedToday: "Disabled", trainingStatus: "not-started", weightsAvailable: false, inferenceAvailable: false, benchmarkEvidenceAvailable: false, routeEligibleToday: false, runtimeAuthority: false, productionReady: false, evidenceRequiredBeforeRoute: ["20B evidence", "70B evidence", "150B evidence", "frontier review", "safety", "human approval"] }
        ],
        ramCompatibilityPolicy: [
          { ramClass: "16GB+", highestTargetToday: "20B planning target only", routeEligibleToday: false, claimStatus: "compatibility-not-verified", requiredProof: "Measured 20B benchmark." }
        ],
        forbiddenClaims: ["SEIS has trained a 20B foundation model."],
        humanApprovalRequiredFor: ["model download", "runtime adapter setup", "training run", "benchmark execution", "route eligibility change"]
      }),
      "content/development/seis-model-frontier-escalation-policy.json": JSON.stringify({
        id: "seis-model-frontier-escalation-policy",
        status: "policy-active-research-gated",
        resourceUri: "seis://ai/model-frontier-escalation-policy.json",
        qualityGate: "npm run check:seis-model-frontier-escalation-policy",
        routeEligibleToday: false,
        currentAllowedMode: "Local Demo and deterministic seed-model lab only",
        decisionRules: [
          { id: "no-skip-20b", enforcedStatus: "blocked" },
          { id: "no-silent-provider-fallback", enforcedStatus: "active" }
        ],
        escalationStages: [
          { id: "stage-0-local-demo", parameterClass: "demo-only", status: "active", allowedToday: true, routeEligibleToday: true },
          { id: "stage-1-20b-local-compatibility", parameterClass: "20B", status: "planned-not-validated", allowedToday: false, routeEligibleToday: false },
          { id: "stage-2-70b-research", parameterClass: "70B", status: "research-roadmap", allowedToday: false, routeEligibleToday: false },
          { id: "stage-3-150b-frontier", parameterClass: "150B", status: "frontier-research-roadmap", allowedToday: false, routeEligibleToday: false },
          { id: "stage-4-512b-apex", parameterClass: "512B", status: "apex-program-plan-only", allowedToday: false, routeEligibleToday: false }
        ],
        forbiddenClaims: ["SEIS has trained a 150B foundation model."],
        humanApprovalRequiredFor: ["model download", "benchmark execution", "training run", "GPU or cloud provisioning"]
      }),
      "content/development/seis-150b-frontier-model-program.json": JSON.stringify({
        id: "seis-150b-frontier-model-program",
        status: "frontier-program-plan-only",
        resourceUri: "seis://ai/150b-frontier-model-program.json",
        qualityGate: "npm run check:seis-150b-frontier-model-program",
        routeEligibleToday: false,
        runtimeAuthority: false,
        trainingStatus: "not-started",
        weightsAvailable: false,
        inferenceAvailable: false,
        benchmarkStatus: "not-run",
        productionReady: false,
        target: {
          parameterClass: "150B",
          parameterCountBillion: 150,
          prerequisite: "20B and 70B evidence accepted before 150B scoping"
        },
        programStages: [
          { id: "stage-0-charter", label: "Charter", status: "planned", routeEligibleToday: false },
          { id: "stage-1-clean-room-data", label: "Clean-room data", status: "blocked", routeEligibleToday: false },
          { id: "stage-2-architecture-selection", label: "Architecture selection", status: "not-selected", routeEligibleToday: false },
          { id: "stage-3-distributed-runtime", label: "Distributed runtime", status: "approval-needed", routeEligibleToday: false },
          { id: "stage-4-training-readiness", label: "Training readiness", status: "not-authorized", routeEligibleToday: false },
          { id: "stage-5-evaluation-and-safety", label: "Evaluation and safety", status: "not-run", routeEligibleToday: false }
        ],
        promotionGates: ["20B evidence", "70B evidence", "clean-room training plan", "distributed runtime budget", "safety review", "human approval"],
        humanApprovalRequiredFor: ["training run", "benchmark execution", "GPU or cloud provisioning"]
      }),
      "content/development/seis-512b-apex-model-program.json": JSON.stringify({
        id: "seis-512b-apex-model-program",
        status: "apex-program-plan-only",
        resourceUri: "seis://ai/512b-apex-model-program.json",
        qualityGate: "npm run check:seis-512b-apex-model-program",
        routeEligibleToday: false,
        runtimeAuthority: false,
        trainingStatus: "not-started",
        weightsAvailable: false,
        inferenceAvailable: false,
        benchmarkStatus: "not-run",
        productionReady: false,
        target: {
          parameterClass: "512B",
          parameterCountBillion: 512,
          prerequisite: "20B, 70B, 150B, and 300B+ evidence accepted before 512B scoping"
        },
        programStages: [
          { id: "stage-0-apex-charter", label: "512B charter", status: "planned", routeEligibleToday: false },
          { id: "stage-1-installed-ai-council", label: "Installed AI council", status: "plan-only", routeEligibleToday: false },
          { id: "stage-2-clean-room-frontier-data", label: "Clean-room frontier data", status: "blocked", routeEligibleToday: false },
          { id: "stage-3-apex-architecture-selection", label: "Architecture selection", status: "not-selected", routeEligibleToday: false },
          { id: "stage-4-frontier-cluster-plan", label: "Frontier cluster plan", status: "approval-needed", routeEligibleToday: false },
          { id: "stage-5-training-readiness", label: "Training readiness", status: "not-authorized", routeEligibleToday: false },
          { id: "stage-6-evaluation-safety-and-release", label: "Evaluation and safety", status: "not-run", routeEligibleToday: false }
        ],
        promotionGates: ["20B evidence", "70B evidence", "150B evidence", "300B+ feasibility", "all installed AI and sub-agent council review recorded", "explicit human approval recorded"],
        forbiddenClaimRules: ["no-trained-512b-weights-claim", "no-routeable-512b-inference-claim", "no-512b-benchmark-claim", "no-installed-ai-presence-as-training-evidence-claim"],
        humanApprovalRequiredFor: ["training run", "benchmark execution", "GPU or cloud provisioning", "route eligibility change"]
      }),
      "content/development/seis-20b-model-card-template.json": JSON.stringify({
        id: "seis-20b-model-card-template",
        status: "template-not-filled",
        targetId: "seis-20b-local-compatibility-target",
        parameterClass: "20B",
        routeEligibleToday: false,
        runtimeAuthority: false,
        productionReady: false,
        weightsAvailable: false,
        trainingStatus: "not-started",
        benchmarkEvidenceAvailable: false,
        requiredBeforeFilled: ["model artifact id and version", "clean-room provenance statement"]
      }),
      "content/development/seis-20b-dataset-card-template.json": JSON.stringify({
        id: "seis-20b-dataset-card-template",
        status: "template-not-filled",
        targetId: "seis-20b-local-compatibility-target",
        parameterClass: "20B",
        datasetDownloadAuthorized: false,
        trainingAuthorized: false,
        fineTuningAuthorized: false,
        benchmarkDatasetAuthorized: false,
        routeEligibleToday: false,
        requiredBeforeFilled: ["source inventory", "license map"]
      }),
      "content/development/seis-ai-core-version-registry.json": JSON.stringify({
        id: "seis-ai-core-version-registry",
        version: "0.1.0",
        status: "documented-fixture",
        qualityGate: "npm run check:seis-ai-core-version-registry",
        sourceOfTruth: {
          pluginIntegration: "content/development/seis-agent-plugin-integration.json",
          promotionGates: "content/development/seis-ai-core-version-promotion-gates.json",
          operatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
          runtimeFixtures: "content/development/seis-ai-core-subagent-runtime-fixtures.json",
          reviewLedger: "content/development/seis-ai-core-subagent-review-ledger.json",
          fiveYearPlan: "content/development/seis-sub-agent-5-year-plan.json"
        },
        currentVersion: {
          id: "seis-ai-core-v0.1",
          displayName: "SEIS AI Core v0.1",
          languageVersion: "SEIS Language v0.1",
          agentRuntimeVersion: "SEIS Agent Runtime v0.1",
          modelRouterVersion: "SEIS Model Router v0.1",
          promptEngineVersion: "SEIS Prompt Engine v0.1",
          runtimeBoundary: "status-and-plan-only",
          providerMode: "zero-key-core"
        },
        truthBoundaries: {
          isFoundationModel: false,
          isTrainedModel: false,
          autonomousWriteRuntimeEnabled: false,
          externalMutationPerformed: false,
          credentialAccessPerformed: false
        },
        runtimeBoundary: {
          currentLevel: "status-and-plan-only",
          writeExecution: "disabled",
          backgroundAutomation: "disabled",
          credentialAccess: "forbidden",
          coreRequiresCloudApiKey: false
        },
        versionComponents: [
          { id: "language-profile", name: "SEIS Language v0.1", kind: "application-layer-profile", status: "documented", validation: "npm run check:seis-ai-core-version-registry" },
          { id: "agent-runtime", name: "SEIS Agent Runtime v0.1", kind: "human-supervised-agent-contract", status: "documented-fixture", validation: "npm run check:seis-ai-core-subagent-runtime-fixtures" }
        ],
        linkedSubAgentLanes: [
          { laneId: "seis", displayName: "SEIS Hub", statusTool: "seis_hub_status", planTool: "seis_hub_plan", permissionLevel: "plan-only", versionDuty: "Governance" },
          { laneId: "seis-cloud", displayName: "SEIS Cloud", statusTool: "seis_cloud_status", planTool: "seis_cloud_plan", permissionLevel: "plan-only", versionDuty: "Cloud" },
          { laneId: "seis-code", displayName: "SEIS-Code", statusTool: "seis_code_status", planTool: "seis_code_plan", permissionLevel: "plan-only", versionDuty: "Code" },
          { laneId: "seis-design", displayName: "SEIS-Design", statusTool: "seis_design_status", planTool: "seis_design_plan", permissionLevel: "plan-only", versionDuty: "Design" },
          { laneId: "seis-data", displayName: "SEIS-DATA", statusTool: "seis_data_status", planTool: "seis_data_plan", permissionLevel: "plan-only", versionDuty: "Data" }
        ],
        fiveYearVersionRoadmap: [
          { year: 1, versionTarget: "v0.1-foundation", theme: "Foundation", promotionGate: "Registry validates" },
          { year: 2, versionTarget: "v0.2-read-only", theme: "Read-only", promotionGate: "Evidence validates" },
          { year: 3, versionTarget: "v0.3-write-gated", theme: "Write gated", promotionGate: "Approvals validate" },
          { year: 4, versionTarget: "v0.4-cloud", theme: "Cloud", promotionGate: "External gates validate" },
          { year: 5, versionTarget: "v1.0-candidate", theme: "Public", promotionGate: "Release evidence validates" }
        ],
        promotionEvidenceRequired: ["version registry validation"],
        nextSafeActions: ["Expose this registry in SEIS AI Core and Command Center as read-only version evidence."]
      }),
      "content/development/seis-ai-core-version-promotion-gates.json": JSON.stringify({
        id: "seis-ai-core-version-promotion-gates",
        version: "0.1.0",
        status: "documented-fixture",
        qualityGate: "npm run check:seis-ai-core-version-promotion-gates",
        sourceOfTruth: {
          versionRegistry: "content/development/seis-ai-core-version-registry.json",
          pluginIntegration: "content/development/seis-agent-plugin-integration.json",
          operatingModel: "content/development/seis-ai-core-subagent-operating-model.json",
          runtimeFixtures: "content/development/seis-ai-core-subagent-runtime-fixtures.json",
          reviewLedger: "content/development/seis-ai-core-subagent-review-ledger.json",
          fiveYearPlan: "content/development/seis-sub-agent-5-year-plan.json"
        },
        tooling: {
          tool: "seis_ai_core_version_promotion_dry_run",
          mcpResource: "seis://ai/version-promotion-gates.json"
        },
        runtimeBoundary: {
          currentLevel: "status-and-plan-only",
          writeExecution: "disabled",
          backgroundAutomation: "disabled",
          credentialAccess: "forbidden",
          coreRequiresCloudApiKey: false,
          dryRunOnly: true
        },
        truthBoundaries: {
          promotionDryRunIsReleaseApproval: false,
          dryRunPermitsExternalMutation: false,
          dryRunPermitsCredentialAccess: false
        },
        decisionStates: ["eligible-for-internal-review", "blocked-until-evidence", "blocked-human-approval", "not-ready"],
        currentDryRun: {
          requestedVersionTarget: "v0.1-foundation",
          decision: "eligible-for-internal-review",
          releasePromotionAllowed: false,
          realExecutionBlocked: true,
          externalMutationPerformed: false,
          credentialAccessPerformed: false
        },
        laneResponsibilities: [
          { laneId: "seis", displayName: "SEIS Hub", promotionDuty: "Governance" },
          { laneId: "seis-cloud", displayName: "SEIS Cloud", promotionDuty: "Cloud" },
          { laneId: "seis-code", displayName: "SEIS-Code", promotionDuty: "Code" },
          { laneId: "seis-design", displayName: "SEIS-Design", promotionDuty: "Design" },
          { laneId: "seis-data", displayName: "SEIS-DATA", promotionDuty: "Data" }
        ],
        gates: [
          {
            year: 1,
            versionTarget: "v0.1-foundation",
            status: "documented-validated",
            dryRunDecision: "eligible-for-internal-review",
            humanApprovalRequired: false,
            releasePromotionAllowed: false,
            requiredEvidence: ["version registry validation", "plugin integration validation"],
            validationCommands: ["npm run check:seis-ai-core-version-promotion-gates"],
            blockers: ["No public release approval exists."],
            nextSafeAction: "Surface internal review evidence."
          },
          { year: 2, versionTarget: "v0.2-read-only", status: "planned", dryRunDecision: "blocked-until-evidence", humanApprovalRequired: false, releasePromotionAllowed: false, requiredEvidence: ["read-only surface"], validationCommands: ["future"], blockers: [], nextSafeAction: "Create evidence fixtures." },
          { year: 3, versionTarget: "v0.3-write-gated", status: "planned", dryRunDecision: "blocked-human-approval", humanApprovalRequired: true, releasePromotionAllowed: false, requiredEvidence: ["approval tests"], validationCommands: ["future"], blockers: ["Write disabled."], nextSafeAction: "Add permission tests." },
          { year: 4, versionTarget: "v0.4-cloud", status: "planned", dryRunDecision: "blocked-human-approval", humanApprovalRequired: true, releasePromotionAllowed: false, requiredEvidence: ["cloud preflight"], validationCommands: ["future"], blockers: ["No target."], nextSafeAction: "Keep cloud disabled." },
          { year: 5, versionTarget: "v1.0-candidate", status: "planned", dryRunDecision: "blocked-until-evidence", humanApprovalRequired: true, releasePromotionAllowed: false, requiredEvidence: ["release evidence"], validationCommands: ["future"], blockers: ["No release approval."], nextSafeAction: "Build evidence pack." }
        ],
        forbiddenPromotionClaims: ["Do not claim public release readiness from dry-run output."]
      }),
      "content/development/seis-ai-core-subagent-operating-model.json": JSON.stringify({
        id: "seis-ai-core-subagent-operating-model",
        status: "active",
        qualityGate: "npm run check:seis-ai-core-subagent-operating-model",
        sourceOfTruth: {
          versionRegistry: "content/development/seis-ai-core-version-registry.json",
          versionPromotionGates: "content/development/seis-ai-core-version-promotion-gates.json",
          longHorizonPlan: "content/development/seis-sub-agent-5-year-plan.json",
          longHorizonReview: "docs/reviews/SUB_AGENT_LONG_HORIZON_AUDIT.md",
          roleSchema: "content/development/seis-ai-core-agent-role-schema.json",
          permissionMatrix: "content/development/seis-ai-core-agent-permission-matrix.json",
          dryRunTaskQueue: "content/development/seis-ai-core-dry-run-task-queue.json",
          cancellationFixture: "content/development/seis-ai-core-cancellation-fixture.json",
          approvalFixture: "content/development/seis-ai-core-approval-fixture.json",
          redactionFixture: "content/development/seis-ai-core-redaction-fixture.json",
          executionLedgerFixture: "content/development/seis-ai-core-execution-ledger-fixture.json",
          runtimeFixtures: "content/development/seis-ai-core-subagent-runtime-fixtures.json",
          reviewLedger: "content/development/seis-ai-core-subagent-review-ledger.json"
        },
        runtimeBoundary: {
          currentLevel: "status-and-plan-only",
          writeMode: "disabled",
          backgroundAutomation: "disabled",
          externalMutation: "requires-explicit-human-approval",
          connectorAuthenticationClaim: "not-claimed"
        },
        permissionMatrix: [
          { level: "read-only", status: "enabled", approvalRequired: false },
          { level: "plan-only", status: "enabled", approvalRequired: false },
          { level: "write-gated", status: "planned", approvalRequired: "task-scoped" }
        ],
        lanes: [
          { id: "seis", displayName: "SEIS Hub", subAgentRole: "governance", statusTool: "seis_hub_status", planTool: "seis_hub_plan", currentPermissionLevel: "plan-only", qualityGate: "npm run check:seis-ai-agent", fiveYearDuty: "Governance" },
          { id: "seis-cloud", displayName: "SEIS Cloud", subAgentRole: "cloud", statusTool: "seis_cloud_status", planTool: "seis_cloud_plan", currentPermissionLevel: "plan-only", qualityGate: "npm run check:cloud-access-policy", fiveYearDuty: "Cloud readiness" },
          { id: "seis-code", displayName: "SEIS-Code", subAgentRole: "engineering", statusTool: "seis_code_status", planTool: "seis_code_plan", currentPermissionLevel: "plan-only", qualityGate: "npm run seis:check", fiveYearDuty: "Implementation" },
          { id: "seis-design", displayName: "SEIS-Design", subAgentRole: "design", statusTool: "seis_design_status", planTool: "seis_design_plan", currentPermissionLevel: "plan-only", qualityGate: "npm run check:motion-evidence", fiveYearDuty: "Design" },
          { id: "seis-data", displayName: "SEIS-DATA", subAgentRole: "data", statusTool: "seis_data_status", planTool: "seis_data_plan", currentPermissionLevel: "plan-only", qualityGate: "npm run check:plugin-capability-lanes", fiveYearDuty: "Data provenance" }
        ],
        fiveYearRoadmap: [
          { year: 1, theme: "Foundation", promotionGate: "Status tools", requiredEvidence: ["tools"] },
          { year: 2, theme: "Read-only intelligence", promotionGate: "Evidence dashboards", requiredEvidence: ["evidence"] },
          { year: 3, theme: "Write-gated implementation", promotionGate: "Approval fixtures", requiredEvidence: ["approval"] },
          { year: 4, theme: "Cloud readiness", promotionGate: "External gates", requiredEvidence: ["rollback"] },
          { year: 5, theme: "Public readiness", promotionGate: "Release evidence", requiredEvidence: ["security"] }
        ],
        cadence: { quarterly: "five-year roadmap promotion-gate review" },
        evidenceRequirements: ["agent role schema", "permission matrix"]
      }),
      "content/development/seis-ai-core-agent-role-schema.json": JSON.stringify({
        id: "seis-ai-core-agent-role-schema",
        status: "documented-fixture",
        runtimeBoundary: "status-and-plan-only",
        roles: [
          {
            id: "repository-governance-subagent",
            laneId: "seis",
            allowedTools: ["seis_hub_status", "seis_hub_plan", "seis_ai_core_subagent_model"],
            deniedTools: ["git_push", "git_merge"]
          },
          {
            id: "cloud-readiness-subagent",
            laneId: "seis-cloud",
            allowedTools: ["seis_cloud_status", "seis_cloud_plan", "seis_ai_core_subagent_model"],
            deniedTools: ["cloud_deploy", "ssh", "credential_access"]
          },
          {
            id: "engineering-subagent",
            laneId: "seis-code",
            allowedTools: ["seis_code_status", "seis_code_plan", "seis_ai_core_subagent_model"],
            deniedTools: ["dependency_install", "write_file", "ci_gate_disable"]
          },
          { id: "product-design-subagent", laneId: "seis-design", allowedTools: ["seis_design_status"], deniedTools: ["external_asset_generation"] },
          { id: "data-provenance-subagent", laneId: "seis-data", allowedTools: ["seis_data_status"], deniedTools: ["dataset_download"] }
        ]
      }),
      "content/development/seis-ai-core-agent-permission-matrix.json": JSON.stringify({
        id: "seis-ai-core-agent-permission-matrix",
        status: "documented-fixture",
        runtimeBoundary: "status-and-plan-only",
        levels: [
          { level: "read-only", approvalRequired: false },
          { level: "plan-only", approvalRequired: false },
          { level: "write-gated", approvalRequired: "task-scoped" },
          { level: "external-gated", approvalRequired: true },
          { level: "forbidden", approvalRequired: "separate security and recovery plan required" }
        ]
      }),
      "content/development/seis-ai-core-read-only-router-runtime.json": JSON.stringify({
        id: "seis-ai-core-read-only-router-runtime",
        runtimeBoundary: { providerCalls: false },
        providerMediation: {
          mode: "backend-only",
          frontendSecretAllowed: false,
          routeExecutionEnabled: false,
          status: "required-before-live-routing"
        },
        decisionIntegrity: {
          readOnlyOnly: true,
          runtimeAuthority: false,
          executionPerformedAlwaysFalse: true,
          noPromptBodyInDecision: true,
          noCredentialMaterialInDecision: true,
          decisionLogsRedacted: true,
          providerStateNamed: true,
          selectedProviderExplicit: true,
          fallbackExplicit: true,
          blockedReasonsRequired: true,
          backendOnlyProvidersRequired: true,
          privateObsidianContentRoutable: false
        }
      }),
      "content/development/seis-ai-core-dry-run-task-queue.json": JSON.stringify({
        id: "seis-ai-core-dry-run-task-queue",
        status: "dry-run-only",
        dryRunOnly: true,
        states: ["queued", "assigned", "running", "awaiting-approval", "cancelled", "failed", "validated", "archived"],
        sampleTasks: [
          {
            id: "dry-run-seis-hub-foundation-review",
            laneId: "seis",
            roleId: "repository-governance-subagent",
            permissionLevel: "plan-only",
            state: "validated",
            dryRunOnly: true,
            approvalRequired: false,
            externalMutation: false,
            targetScope: ["docs/**", "content/development/**"],
            validator: "npm run check:seis-ai-core-subagent-runtime-fixtures",
            rollbackNote: "No mutation performed."
          },
          {
            id: "dry-run-seis-code-patch-plan",
            laneId: "seis-code",
            roleId: "engineering-subagent",
            permissionLevel: "plan-only",
            state: "running",
            dryRunOnly: true,
            approvalRequired: false,
            externalMutation: false,
            targetScope: ["apps/**", "packages/**", "scripts/**", "docs/**"],
            validator: "npm run test:web",
            rollbackNote: "No file edits performed by this dry-run task."
          },
          {
            id: "approval-gated-cloud-deploy-preview",
            laneId: "seis-cloud",
            roleId: "cloud-readiness-subagent",
            permissionLevel: "external-gated",
            state: "awaiting-approval",
            dryRunOnly: true,
            approvalRequired: true,
            externalMutation: false,
            targetScope: ["deploy/**"],
            validator: "provider-neutral preflight required before execution",
            rollbackNote: "Deployment remains blocked."
          }
        ]
      }),
      "content/development/seis-ai-core-cancellation-fixture.json": JSON.stringify({
        id: "seis-ai-core-cancellation-fixture",
        status: "documented-fixture",
        cancellationTokenRequired: true,
        supportedSignals: ["operator-cancel", "timeout", "policy-deny", "validation-failure"],
        sampleCancellation: {
          taskId: "dry-run-seis-code-patch-plan",
          fromState: "running",
          toState: "cancelled",
          reason: "operator-cancel",
          artifactsPreserved: true,
          externalMutationPerformed: false,
          laterToolCallsAllowed: false
        }
      }),
      "content/development/seis-ai-core-approval-fixture.json": JSON.stringify({
        id: "seis-ai-core-approval-fixture",
        status: "documented-fixture",
        approvalModel: "scoped-action-specific-expiring",
        blanketApprovalAllowed: false,
        sampleRequests: [
          {
            id: "approval-cloud-deploy-preview",
            status: "pending-human-approval",
            executionBlocked: true,
            requiredEvidence: ["target", "rollback plan", "credential boundary", "dry-run result"]
          }
        ]
      }),
      "content/development/seis-ai-core-redaction-fixture.json": JSON.stringify({
        id: "seis-ai-core-redaction-fixture",
        status: "documented-fixture",
        runtimeBoundary: "status-and-plan-only",
        promptAndResponseLoggingDefault: "disabled",
        rawProviderErrorsExposed: false,
        sampleOutputContainsSecretValue: false,
        redactionRequiredFor: ["api keys", "bearer tokens", "authorization headers", "private keys"],
        forbiddenOutputs: ["full credential value", "partial credential prefix or suffix", "raw provider error body", "private key material"],
        sampleRecords: [
          {
            id: "redaction-dry-run-tool-output",
            containsSecretValue: false,
            usesPlaceholders: true,
            forbiddenDiagnosticFields: ["rawErrorBody", "authorizationHeader", "credentialValue"]
          }
        ]
      }),
      "content/development/seis-ai-core-execution-ledger-fixture.json": JSON.stringify({
        id: "seis-ai-core-execution-ledger-fixture",
        status: "documented-fixture",
        runtimeBoundary: "status-and-plan-only",
        mode: "append-only-planned",
        writerPolicy: "single-writer",
        recordsForbidden: ["secret values", "private keys", "raw provider errors", "unapproved external mutation"],
        requiredFields: [
          "id",
          "taskId",
          "laneId",
          "roleId",
          "permissionLevel",
          "decision",
          "stateBefore",
          "stateAfter",
          "dryRunOnly",
          "realExecutionBlocked",
          "externalMutationPerformed",
          "fileMutationPerformed",
          "approvalRequired",
          "approvalRecordId",
          "cancellationSignal",
          "validator",
          "rollbackNote",
          "redactionStatus",
          "createdAt"
        ],
        sampleRecords: [
          {
            id: "ledger-dry-run-seis-code-patch-plan",
            taskId: "dry-run-seis-code-patch-plan",
            laneId: "seis-code",
            roleId: "engineering-subagent",
            permissionLevel: "plan-only",
            decision: "cancelled",
            stateBefore: "validated",
            stateAfter: "cancelled",
            dryRunOnly: true,
            realExecutionBlocked: true,
            externalMutationPerformed: false,
            fileMutationPerformed: false,
            approvalRequired: false,
            approvalRecordId: null,
            cancellationSignal: "operator-cancel",
            validator: "npm run test:web",
            rollbackNote: "No file edits performed by this dry-run task.",
            redactionStatus: "passed",
            secretValuesStored: false,
            createdAt: "2026-06-23T00:00:00.000Z"
          }
        ]
      }),
      "content/development/seis-ai-core-subagent-runtime-fixtures.json": JSON.stringify({
        id: "seis-ai-core-subagent-runtime-fixtures",
        status: "documented-fixture",
        runtimeBoundary: {
          currentLevel: "status-and-plan-only",
          writeExecution: "disabled"
        },
        fixtures: [
          { path: "content/development/seis-ai-core-agent-role-schema.json" },
          { path: "content/development/seis-ai-core-agent-permission-matrix.json" },
          { path: "content/development/seis-ai-core-dry-run-task-queue.json" },
          { path: "content/development/seis-ai-core-cancellation-fixture.json" },
          { path: "content/development/seis-ai-core-approval-fixture.json" },
          { path: "content/development/seis-ai-core-redaction-fixture.json" },
          { path: "content/development/seis-ai-core-execution-ledger-fixture.json" }
        ]
      }),
      "content/development/seis-ai-core-subagent-review-ledger.json": JSON.stringify({
        id: "seis-ai-core-subagent-review-ledger",
        status: "documented-fixture",
        qualityGate: "npm run check:seis-ai-core-subagent-review-ledger",
        cadence: {
          reviewCadence: "quarterly",
          horizonYears: 5,
          totalQuarterRecords: 20,
          currentHorizonQuarter: "Y1-Q2",
          nextReviewQuarter: "Y1-Q3"
        },
        runtimeBoundary: {
          currentLevel: "status-and-plan-only",
          writeExecution: "disabled",
          backgroundAutomation: "disabled",
          externalMutation: "requires-explicit-human-approval",
          credentialAccess: "forbidden"
        },
        summary: {
          documentedValidatedQuarterCount: 2,
          plannedQuarterCount: 18,
          externalMutationPerformed: false,
          credentialAccessPerformed: false,
          autonomousMergeOrDeployPerformed: false
        },
        quarters: [
          { id: "Y1-Q1", status: "documented-validated", evidence: ["content/development/seis-sub-agent-5-year-plan.json"], humanApprovalNeeded: false },
          { id: "Y1-Q2", status: "documented-validated", evidence: ["content/development/seis-ai-core-subagent-runtime-fixtures.json"], humanApprovalNeeded: false },
          ...Array.from({ length: 18 }, (_, index) => ({
            id: `Y${Math.floor((index + 2) / 4) + 1}-Q${((index + 2) % 4) + 1}`,
            status: "planned",
            evidence: [],
            humanApprovalNeeded: index >= 6,
          }))
        ],
        nextSafeActions: ["Expose this ledger in SEIS AI Core and Command Center as read-only evidence."]
      }),
      "deploy/seis-ssh-public-access-contract.json": JSON.stringify({
        id: "seis-ssh-public-access-contract",
        status: "active",
        targetAlias: "SEIS-SSH",
        serverAndPortPolicy: { mode: "preserve-existing-server-and-port" },
        endpointContinuity: { currentObservedPort: "22" },
        approvalGates: ["execute-live-ssh", "change-server-or-port"]
      }),
      "content/development/seis-ssh-live-readiness-evidence.json": JSON.stringify({
        id: "seis-ssh-live-readiness-evidence",
        status: "blocked-provider-billing",
        liveProbe: {
          transport: "codespace",
          hostnameKind: "github.codespaces",
          port: "22",
          strictReady: false,
          pickerLikelyCompatible: false,
          liveSshAttempted: true
        },
        blockers: [
          {
            id: "github-codespaces-billing-issue",
            severity: "P0",
            summary: "Codespaces billing is not ready in this fixture.",
            safeNextAction: "Resolve billing before a strict live probe."
          }
        ]
      }),
      "content/development/seis-sub-agent-5-year-plan.json": JSON.stringify({
        id: "sub-agent-5-year-plan",
        status: "documented",
        governance: {
          writerPolicy: "single-writer",
          defaultWriter: "codex",
          forbiddenAutonomy: ["deploy", "secret-access", "push-to-main"]
        },
        lanes: [
          { id: "architecture-agent" },
          { id: "implementation-agent" },
          { id: "security-agent" },
          { id: "documentation-agent" },
          { id: "validation-agent" },
          { id: "design-agent" }
        ],
        years: [1, 2, 3, 4, 5].map((year) => ({
          year,
          quarters: [1, 2, 3, 4].map((quarter) => ({ id: `Y${year}-Q${quarter}` }))
        }))
      }),
      "docs/reviews/SUB_AGENT_LONG_HORIZON_AUDIT.md": "# SEIS Sub-Agent Long-Horizon Audit\n\n## Human Approval Needed\n",
      "plugins/seis/.codex-plugin/plugin.json": "{}",
      "plugins/seis-ai-agent/skills/seis-hub/SKILL.md": "# SEIS Hub",
      "plugins/seis-cloud/assets/lane-profile.json": JSON.stringify({ id: "seis-cloud", qualityCommands: ["npm run check:cloud-access-policy"] }),
      "plugins/seis-ai-agent/skills/seis-cloud/SKILL.md": "# SEIS Cloud",
      "plugins/seis-code/assets/lane-profile.json": JSON.stringify({ id: "seis-code", intent: "engineering", qualityCommands: ["npm run seis:check"] }),
      "plugins/seis-ai-agent/skills/seis-code/SKILL.md": "# SEIS-Code",
      "plugins/seis-design/assets/lane-profile.json": JSON.stringify({ id: "seis-design", qualityCommands: ["npm run check:web"] }),
      "plugins/seis-ai-agent/skills/seis-design/SKILL.md": "# SEIS-Design",
      "plugins/seis-data/assets/lane-profile.json": JSON.stringify({ id: "seis-data", qualityCommands: ["npm run check:plugin-capability-lanes"] }),
      "plugins/seis-ai-agent/skills/seis-data/SKILL.md": "# SEIS-DATA",
      "notes.md": "alpha\nbeta needle gamma\ndelta",
    })
  );

  function ctx(extra = {}) {
    return { repoRoot, webRoot: path.join(repoRoot, "apps", "web"), ...extra };
  }

  it("list_files lists entries with directory suffix", () => {
    const out = executeTool("list_files", { dir: "." }, ctx());
    assert.ok(out.includes("apps/"));
    assert.ok(out.includes("notes.md"));
  });

  it("list_files skips node_modules", () => {
    mkdirSync(path.join(repoRoot, "node_modules", "junk"), { recursive: true });
    const out = executeTool("list_files", { dir: "." }, ctx());
    assert.ok(!out.includes("node_modules"));
  });

  it("read_file returns file content", () => {
    const out = executeTool("read_file", { file: "notes.md" }, ctx());
    assert.ok(out.includes("beta needle gamma"));
  });

  it("read_file refuses path traversal", () => {
    assert.throws(
      () => executeTool("read_file", { file: "../../../etc/passwd" }, ctx()),
      /escapes repository root/
    );
  });

  it("grep_repo finds matches with file:line locations", () => {
    const out = executeTool("grep_repo", { pattern: "needle", dir: "." }, ctx());
    assert.ok(out.includes("notes.md:2"));
  });

  it("grep_repo reports no matches", () => {
    const out = executeTool("grep_repo", { pattern: "zzz-nothing", dir: "." }, ctx());
    assert.equal(out, "(no matches)");
  });

  it("write_file is blocked without allowWrite", () => {
    assert.throws(
      () => executeTool("write_file", { file: "new.txt", content: "x" }, ctx()),
      /--write/
    );
  });

  it("write_file writes with allowWrite and creates directories", () => {
    const out = executeTool(
      "write_file",
      { file: "deep/dir/new.txt", content: "hello" },
      ctx({ allowWrite: true })
    );
    assert.ok(out.includes("5 bytes"));
    assert.equal(readFileSync(path.join(repoRoot, "deep/dir/new.txt"), "utf8"), "hello");
  });

  it("write_file refuses path traversal even with allowWrite", () => {
    assert.throws(
      () => executeTool("write_file", { file: "../outside.txt", content: "x" }, ctx({ allowWrite: true })),
      /escapes repository root/
    );
    assert.ok(!existsSync(path.join(path.dirname(repoRoot), "outside.txt")));
  });

  it("edit_file replaces a unique string", () => {
    executeTool(
      "edit_file",
      { file: "notes.md", old_string: "beta needle gamma", new_string: "beta REPLACED gamma" },
      ctx({ allowWrite: true })
    );
    const out = readFileSync(path.join(repoRoot, "notes.md"), "utf8");
    assert.ok(out.includes("beta REPLACED gamma"));
    assert.ok(!out.includes("needle"));
  });

  it("edit_file does not expand $-patterns in new_string", () => {
    executeTool(
      "edit_file",
      { file: "notes.md", old_string: "needle", new_string: "$&$'x$1" },
      ctx({ allowWrite: true })
    );
    const out = readFileSync(path.join(repoRoot, "notes.md"), "utf8");
    assert.ok(out.includes("beta $&$'x$1 gamma"));
  });

  it("edit_file rejects a missing old_string", () => {
    assert.throws(
      () => executeTool("edit_file", { file: "notes.md", old_string: "zzz", new_string: "x" }, ctx({ allowWrite: true })),
      /not found/
    );
  });

  it("edit_file rejects an ambiguous old_string", () => {
    writeFileSync(path.join(repoRoot, "dup.txt"), "same\nsame\n");
    assert.throws(
      () => executeTool("edit_file", { file: "dup.txt", old_string: "same", new_string: "x" }, ctx({ allowWrite: true })),
      /occurs 2 times/
    );
  });

  it("edit_file is blocked without allowWrite", () => {
    assert.throws(
      () => executeTool("edit_file", { file: "notes.md", old_string: "alpha", new_string: "x" }, ctx()),
      /--write/
    );
  });

  it("run_checks accepts the style scope", () => {
    writeFileSync(path.join(repoRoot, "apps/web/style.css"), ":root { --c: red; } .x { color: var(--c); }");
    const out = executeTool("run_checks", { scope: "style" }, ctx());
    const r = JSON.parse(out);
    assert.equal(r.ok, true);
  });

  it("run_checks accepts the perf scope", () => {
    const out = executeTool("run_checks", { scope: "perf" }, ctx());
    const r = JSON.parse(out);
    assert.ok(typeof r.ok === "boolean");
    assert.ok(typeof r.totalBytes === "number");
  });

  it("git_diff returns a string result", () => {
    const out = executeTool("git_diff", {}, { repoRoot: process.cwd(), webRoot: "" });
    assert.ok(typeof out === "string");
  });

  it("git_diff staged flag is accepted", () => {
    const out = executeTool("git_diff", { staged: true }, { repoRoot: process.cwd(), webRoot: "" });
    assert.ok(typeof out === "string");
  });

  it("git_diff returns (no changes) or a diff for a non-git tmpdir", () => {
    const out = executeTool("git_diff", {}, ctx());
    assert.ok(typeof out === "string");
  });

  it("git_log returns a string result from the real repo", () => {
    const out = executeTool("git_log", {}, { repoRoot: process.cwd(), webRoot: "" });
    assert.ok(typeof out === "string");
  });

  it("git_log respects the count parameter", () => {
    const out = executeTool("git_log", { count: 3 }, { repoRoot: process.cwd(), webRoot: "" });
    assert.ok(typeof out === "string");
    const lines = out.trim().split("\n").filter(Boolean);
    assert.ok(lines.length <= 3);
  });

  it("seis_plugin_integration returns the compact integration manifest", () => {
    const out = executeTool("seis_plugin_integration", {}, ctx());
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-agent-plugin-integration");
    assert.equal(payload.primaryInstallId, "seis-ai-agent@seis-repo");
    assert.equal(payload.personalPlugins[0].id, "seis@personal");
    assert.equal(payload.capabilityCatalog.id, "seis-plugin-capability-catalog");
    assert.equal(typeof payload.capabilityCatalog.manifestCapabilityCount, "number");
    assert.ok(Array.isArray(payload.capabilityCatalog.qualityCommandGaps));
    assert.equal(payload.capabilityCatalog.boundary.externalMutationPerformed, false);
  });

  it("seis_ai_core_subagent_model returns the bounded operating model and five-year linkage", () => {
    const out = executeTool("seis_ai_core_subagent_model", {}, ctx());
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-ai-core-subagent-operating-model");
    assert.equal(payload.runtimeBoundary.currentLevel, "status-and-plan-only");
    assert.equal(payload.runtimeBoundary.connectorAuthenticationClaim, "not-claimed");
    assert.equal(payload.laneCount, 5);
    assert.equal(payload.runtimeFixtures.versionRegistry.id, "seis-ai-core-version-registry");
    assert.equal(payload.runtimeFixtures.versionRegistry.currentVersionId, "seis-ai-core-v0.1");
    assert.equal(payload.runtimeFixtures.versionRegistry.languageVersion, "SEIS Language v0.1");
    assert.equal(payload.runtimeFixtures.versionPromotionGates.id, "seis-ai-core-version-promotion-gates");
    assert.equal(payload.runtimeFixtures.versionPromotionGates.tool, "seis_ai_core_version_promotion_dry_run");
    assert.equal(payload.runtimeFixtures.versionPromotionGates.currentDecision, "eligible-for-internal-review");
    assert.equal(payload.runtimeFixtures.reviewLedger.id, "seis-ai-core-subagent-review-ledger");
    assert.equal(payload.runtimeFixtures.reviewLedger.quarterCount, 20);
    assert.equal(payload.runtimeFixtures.runtimeFixturePack.id, "seis-ai-core-subagent-runtime-fixtures");
    assert.equal(payload.runtimeFixtures.runtimeFixturePack.fixtureCount, 7);
    assert.equal(payload.runtimeFixtures.roleSchema.id, "seis-ai-core-agent-role-schema");
    assert.equal(payload.runtimeFixtures.roleSchema.roleCount, 5);
    assert.equal(payload.runtimeFixtures.dryRunTaskQueue.dryRunOnly, true);
    assert.equal(payload.runtimeFixtures.approvalFixture.blanketApprovalAllowed, false);
    assert.equal(payload.runtimeFixtures.redactionFixture.sampleOutputContainsSecretValue, false);
    assert.equal(payload.runtimeFixtures.executionLedgerFixture.mode, "append-only-planned");
    assert.equal(payload.longHorizonPlan.id, "sub-agent-5-year-plan");
    assert.equal(payload.longHorizonPlan.quarterCount, 20);
    assert.equal(payload.pluginIntegration.currentRuntimeBoundary, "status-and-plan-only");
  });

  it("seis_ai_core_provider_status returns the zero-key provider registry", () => {
    const out = executeTool("seis_ai_core_provider_status", {}, ctx());
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-ai-core-provider-registry");
    assert.equal(payload.coreCredentialRequirement, "none");
    assert.equal(payload.defaultRoutingMode, "local-demo");
    assert.equal(payload.providerCount, 2);
    assert.equal(payload.noKeyProviderCount, 1);
    assert.ok(payload.publicStates.includes("Rate Limited"));
    assert.ok(payload.providers.some((provider) => provider.id === "seis-local-demo" && provider.routingEligible === true));
    assert.ok(payload.providers.some((provider) => provider.id === "anthropic-claude" && provider.publicStatus === "Missing Key"));
  });

  it("seis_ai_core_read_only_route returns a bounded provider and lane decision", () => {
    const out = executeTool(
      "seis_ai_core_read_only_route",
      { taskType: "repository-validation", capability: "validation", localOnly: true, privacyMode: "local-only" },
      { repoRoot: workspaceRoot, webRoot: path.join(workspaceRoot, "apps", "web") },
    );
    const payload = JSON.parse(out);
    assert.equal(payload.selectedProvider, "codex-operator");
    assert.equal(payload.agentLane.id, "seis-code");
    assert.equal(payload.routeEligible, false);
    assert.equal(payload.executionPerformed, false);
    assert.equal(payload.safetyBoundary.networkCalled, false);
  });

  it("seis_ai_core_model_scaling_status returns the 20B local compatibility target", () => {
    const out = executeTool("seis_ai_core_model_scaling_status", {}, ctx());
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-model-scaling-hardware-profile");
    assert.equal(payload.coreCredentialRequirement, "none");
    assert.equal(payload.currentTarget.parameterClass, "20B");
    assert.equal(payload.currentTarget.parameterCountBillion, 20);
    assert.equal(payload.currentTarget.minimumSystemRamGb, 16);
    assert.equal(payload.currentTarget.compatibilityStatus, "planned-not-validated");
    assert.equal(payload.currentTarget.weightsAvailable, false);
    assert.equal(payload.currentTarget.inferenceAvailable, false);
    assert.equal(payload.currentTarget.runtimeAuthority, false);
    assert.equal(payload.benchmarkManifestPath, "reports/seis-model-scaling/20b-16gb-memory-benchmark.json");
    assert.equal(payload.benchmarkDryRunPath, "reports/seis-model-scaling/20b-benchmark-dry-run.json");
    assert.equal(payload.localHardwarePreflightCheckPath, "scripts/check-seis-model-local-hardware-preflight.mjs");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.ok, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.status, "ready");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.ok, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.status, "ready");
    assert.equal(payload.benchmarkEvidence.manifestStatus, "template-not-measured");
    assert.equal(payload.benchmarkEvidence.compatibilityClaim, "not-verified");
    assert.equal(payload.benchmarkEvidence.benchmarkEvidenceAvailable, false);
    assert.equal(payload.benchmarkEvidence.routeEligibleToday, false);
    assert.equal(payload.benchmarkEvidence.runtimeAuthority, false);
    assert.equal(payload.benchmarkEvidence.dryRunStatus, "dry-run-not-measured");
    assert.equal(payload.benchmarkEvidence.canRequestRealBenchmarkToday, false);
    assert.equal(payload.benchmarkEvidence.measuredBenchmark, false);
    assert.equal(payload.benchmarkEvidence.modelCompatibilityVerified, false);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.ok, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.status, "ready");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.path, "reports/seis-model-scaling/20b-16gb-memory-benchmark.json");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.ok, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.status, "ready");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.path, "reports/seis-model-scaling/20b-benchmark-dry-run.json");
    assert.equal(payload.parameterLadderPath, "content/development/seis-model-parameter-ladder.json");
    assert.equal(payload.parameterLadder.id, "seis-model-parameter-ladder");
    assert.equal(payload.parameterLadder.resourceUri, "seis://ai/model-parameter-ladder.json");
    assert.equal(payload.parameterLadder.targetCount, 6);
    assert.equal(payload.parameterLadder.routeEligibleToday, false);
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "20B" && entry.minimumRamClass === "16GB+ RAM"));
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "70B" && entry.status === "research-roadmap"));
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "300B+" && entry.status === "not-scoped"));
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"));
    assert.ok(payload.parameterLadder.targets.every((entry) => entry.routeEligibleToday === false));
    assert.equal(payload.frontierEscalationPolicyPath, "content/development/seis-model-frontier-escalation-policy.json");
    assert.equal(payload.frontierEscalationPolicy.id, "seis-model-frontier-escalation-policy");
    assert.equal(payload.frontierEscalationPolicy.resourceUri, "seis://ai/model-frontier-escalation-policy.json");
    assert.equal(payload.frontierEscalationPolicy.routeEligibleToday, false);
    assert.ok(payload.frontierEscalationPolicy.decisionRuleIds.includes("no-skip-20b"));
    assert.ok(payload.frontierEscalationPolicy.escalationStages.some((entry) => entry.parameterClass === "150B" && entry.routeEligibleToday === false));
    assert.equal(payload.frontierModelProgramPath, "content/development/seis-150b-frontier-model-program.json");
    assert.equal(payload.frontierModelProgram.id, "seis-150b-frontier-model-program");
    assert.equal(payload.frontierModelProgram.resourceUri, "seis://ai/150b-frontier-model-program.json");
    assert.equal(payload.frontierModelProgram.trainingStatus, "not-started");
    assert.equal(payload.frontierModelProgram.weightsAvailable, false);
    assert.equal(payload.frontierModelProgram.inferenceAvailable, false);
    assert.equal(payload.frontierModelProgram.benchmarkStatus, "not-run");
    assert.equal(payload.frontierModelProgram.stageCount, 6);
    assert.equal(payload.apexModelProgramPath, "content/development/seis-512b-apex-model-program.json");
    assert.equal(payload.apexModelProgram.id, "seis-512b-apex-model-program");
    assert.equal(payload.apexModelProgram.resourceUri, "seis://ai/512b-apex-model-program.json");
    assert.equal(payload.apexModelProgram.trainingStatus, "not-started");
    assert.equal(payload.apexModelProgram.weightsAvailable, false);
    assert.equal(payload.apexModelProgram.inferenceAvailable, false);
    assert.equal(payload.apexModelProgram.benchmarkStatus, "not-run");
    assert.equal(payload.apexModelProgram.stageCount, 7);
    assert.equal(payload.modelCardTemplatePath, "content/development/seis-20b-model-card-template.json");
    assert.equal(payload.datasetCardTemplatePath, "content/development/seis-20b-dataset-card-template.json");
    assert.equal(payload.evidenceTemplates.modelCard.status, "template-not-filled");
    assert.equal(payload.evidenceTemplates.modelCard.routeEligibleToday, false);
    assert.equal(payload.evidenceTemplates.modelCard.weightsAvailable, false);
    assert.equal(payload.evidenceTemplates.datasetCard.status, "template-not-filled");
    assert.equal(payload.evidenceTemplates.datasetCard.datasetDownloadAuthorized, false);
    assert.equal(payload.evidenceTemplates.datasetCard.trainingAuthorized, false);
    assert.equal(payload.evidenceTemplates.datasetCard.routeEligibleToday, false);
    assert.equal(payload.frontierTarget.parameterClass, "150B");
    assert.equal(payload.frontierTarget.parameterCountBillion, 150);
    assert.equal(payload.frontierTarget.compatibilityStatus, "not-scoped");
    assert.equal(payload.frontierTarget.weightsAvailable, false);
    assert.equal(payload.frontierTarget.inferenceAvailable, false);
    assert.equal(payload.apexTarget.parameterClass, "512B");
    assert.equal(payload.apexTarget.parameterCountBillion, 512);
    assert.equal(payload.apexTarget.weightsAvailable, false);
    assert.equal(payload.apexTarget.inferenceAvailable, false);
    assert.equal(payload.apexTarget.runtimeAuthority, false);
    assert.ok(payload.scaleLadder.some((entry) => entry.parameterClass === "70B" && entry.status === "research-roadmap"));
    assert.ok(payload.scaleLadder.some((entry) => entry.parameterClass === "150B" && entry.status === "frontier-research-roadmap"));
    assert.ok(payload.scaleLadder.some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"));
    assert.ok(payload.routerPolicy.blockedToday.includes("150B live inference"));
    assert.ok(payload.routerPolicy.blockedToday.includes("512B live inference"));
    assert.equal(payload.routerPolicy.silentCloudFallbackAllowed, false);
  });

  it("seis_ai_core_model_scaling_status surfaces missing or invalid benchmark evidence sources", () => {
    rmSync(path.join(repoRoot, "reports/seis-model-scaling/20b-16gb-memory-benchmark.json"), { force: true });
    writeFileSync(path.join(repoRoot, "reports/seis-model-scaling/20b-benchmark-dry-run.json"), "{bad-json", "utf8");

    const out = executeTool("seis_ai_core_model_scaling_status", {}, ctx());
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.ok, false);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.exists, false);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.status, "missing");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.ok, false);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.exists, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.parseOk, false);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.status, "invalid-json");
    assert.equal(payload.benchmarkEvidence.benchmarkEvidenceAvailable, false);
    assert.equal(payload.benchmarkEvidence.routeEligibleToday, false);
    assert.equal(payload.benchmarkEvidence.measuredBenchmark, false);
    assert.equal(payload.benchmarkEvidence.modelCompatibilityVerified, false);
  });

  it("seis_ai_core_version_status returns the bounded AI Core version identity", () => {
    const out = executeTool("seis_ai_core_version_status", {}, ctx());
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-ai-core-version-registry");
    assert.equal(payload.currentVersion.id, "seis-ai-core-v0.1");
    assert.equal(payload.currentVersion.languageVersion, "SEIS Language v0.1");
    assert.equal(payload.runtimeBoundary.currentLevel, "status-and-plan-only");
    assert.equal(payload.runtimeBoundary.coreRequiresCloudApiKey, false);
    assert.equal(payload.truthBoundaries.isFoundationModel, false);
    assert.equal(payload.truthBoundaries.isTrainedModel, false);
    assert.equal(payload.laneCount, 5);
    assert.equal(payload.linkedEvidence.reviewLedger.quarterCount, 20);
    assert.equal(payload.linkedEvidence.pluginIntegration.versionRegistryTool, "seis_ai_core_version_status");
    assert.equal(payload.linkedEvidence.pluginIntegration.versionPromotionTool, "seis_ai_core_version_promotion_dry_run");
    assert.equal(payload.linkedEvidence.promotionGates.id, "seis-ai-core-version-promotion-gates");
    assert.equal(payload.linkedEvidence.promotionGates.currentDecision, "eligible-for-internal-review");
    assert.equal(payload.linkedEvidence.providerRegistry.id, "seis-ai-core-provider-registry");
    assert.equal(payload.linkedEvidence.providerRegistry.coreCredentialRequirement, "none");
  });

  it("seis_ai_core_version_promotion_dry_run returns evidence-only version readiness", () => {
    const out = executeTool(
      "seis_ai_core_version_promotion_dry_run",
      { versionTarget: "v0.1-foundation" },
      ctx()
    );
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.tool, "seis_ai_core_version_promotion_dry_run");
    assert.equal(payload.versionTarget, "v0.1-foundation");
    assert.equal(payload.dryRunDecision, "eligible-for-internal-review");
    assert.equal(payload.releasePromotionAllowed, false);
    assert.equal(payload.realExecutionBlocked, true);
    assert.equal(payload.externalMutationPerformed, false);
    assert.equal(payload.credentialAccessPerformed, false);
    assert.equal(payload.humanApprovalRequired, false);
    assert.equal(payload.laneEvidence.length, 5);
    assert.equal(payload.pluginIntegration.versionPromotionTool, "seis_ai_core_version_promotion_dry_run");
  });

  it("seis_ai_core_subagent_review_ledger returns quarterly five-year evidence without execution", () => {
    const out = executeTool(
      "seis_ai_core_subagent_review_ledger",
      { quarterId: "Y1-Q2" },
      ctx()
    );
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-ai-core-subagent-review-ledger");
    assert.equal(payload.runtimeBoundary.currentLevel, "status-and-plan-only");
    assert.equal(payload.runtimeBoundary.writeExecution, "disabled");
    assert.equal(payload.summary.quarterCount, 20);
    assert.equal(payload.summary.documentedValidatedQuarterCount, 2);
    assert.equal(payload.selectedQuarter.id, "Y1-Q2");
    assert.equal(payload.currentQuarter.id, "Y1-Q2");
    assert.equal(payload.nextReviewQuarter.id, "Y1-Q3");
  });

  it("seis_ai_core_subagent_dry_run allows an in-scope plan-only dry-run task", () => {
    const out = executeTool(
      "seis_ai_core_subagent_dry_run",
      {
        taskId: "dry-run-seis-hub-foundation-review",
        requestedTool: "seis_hub_plan",
        requestedPath: "docs/ai/agent-runtime.md"
      },
      ctx()
    );
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.decision, "allowed");
    assert.equal(payload.dryRunOnly, true);
    assert.equal(payload.realExecutionBlocked, true);
    assert.equal(payload.externalMutationPerformed, false);
    assert.equal(payload.requestedPath.allowed, true);
    assert.equal(payload.executionLedgerEvidence.mode, "append-only-planned");
    assert.equal(payload.executionLedgerEvidence.writerPolicy, "single-writer");
    assert.equal(payload.executionLedgerEvidence.requiredFieldCount, 19);
    assert.equal(payload.executionLedgerEvidence.persistence, "disabled");
    assert.equal(payload.executionLedgerEvidence.recordWritten, false);
    assert.match(payload.executionLedgerEvidence.truthBoundary, /no durable record is persisted/);
    assert.equal(payload.permissionEvidence.level, "plan-only");
    assert.equal(payload.permissionEvidence.decision, "recognized");
    assert.equal(payload.permissionEvidence.matrixRuntimeBoundary, "status-and-plan-only");
    assert.equal(payload.providerMediationEvidence.mode, "backend-only");
    assert.equal(payload.providerMediationEvidence.frontendSecretAllowed, false);
    assert.equal(payload.providerMediationEvidence.routeExecutionEnabled, false);
    assert.equal(payload.providerMediationEvidence.providerCallsPerformed, false);
    assert.match(payload.providerMediationEvidence.truthBoundary, /no provider call/);
  });

  it("seis_ai_core_subagent_dry_run blocks approval-gated external tasks", () => {
    const out = executeTool(
      "seis_ai_core_subagent_dry_run",
      {
        taskId: "approval-gated-cloud-deploy-preview",
        requestedTool: "seis_cloud_plan",
        requestedPath: "deploy/preview-plan.md"
      },
      ctx()
    );
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.decision, "blocked");
    assert.equal(payload.approvalRequired, true);
    assert.equal(payload.nextState, "awaiting-approval");
    assert.deepEqual(payload.requiredApprovalEvidence, ["target", "rollback plan", "credential boundary", "dry-run result"]);
  });

  it("seis_ai_core_subagent_dry_run fails closed when ledger evidence is invalid", () => {
    writeFileSync(
      path.join(repoRoot, "content/development/seis-ai-core-execution-ledger-fixture.json"),
      JSON.stringify({
        id: "seis-ai-core-execution-ledger-fixture",
        status: "documented-fixture",
        runtimeBoundary: "status-and-plan-only",
        mode: "append-only-planned",
        writerPolicy: "single-writer",
        requiredFields: [],
        recordsForbidden: [],
        sampleRecords: []
      }),
      "utf8"
    );

    const payload = JSON.parse(executeTool(
      "seis_ai_core_subagent_dry_run",
      { taskId: "dry-run-seis-hub-foundation-review" },
      ctx()
    ));
    assert.equal(payload.ok, false);
    assert.match(payload.error, /execution ledger fixture is missing or violates/);
  });

  it("seis_ai_core_subagent_dry_run fails closed when router mediation evidence is invalid", () => {
    const routerPath = path.join(repoRoot, "content/development/seis-ai-core-read-only-router-runtime.json");
    const routerRuntime = JSON.parse(readFileSync(routerPath, "utf8"));
    routerRuntime.providerMediation.frontendSecretAllowed = true;
    writeFileSync(routerPath, JSON.stringify(routerRuntime), "utf8");

    const payload = JSON.parse(executeTool(
      "seis_ai_core_subagent_dry_run",
      { taskId: "dry-run-seis-hub-foundation-review" },
      ctx()
    ));
    assert.equal(payload.ok, false);
    assert.match(payload.error, /router mediation fixture is missing or violates/);
  });

  it("seis_ai_core_subagent_dry_run denies forbidden and unknown permission levels", () => {
    const queuePath = path.join(repoRoot, "content/development/seis-ai-core-dry-run-task-queue.json");
    const queue = JSON.parse(readFileSync(queuePath, "utf8"));
    queue.sampleTasks.push(
      {
        id: "forbidden-seis-code-task",
        laneId: "seis-code",
        roleId: "engineering-subagent",
        permissionLevel: "forbidden",
        state: "running",
        dryRunOnly: true,
        approvalRequired: false,
        externalMutation: false,
        targetScope: ["apps/**"],
        validator: "npm run test:web",
        rollbackNote: "Forbidden task remains unexecuted."
      },
      {
        id: "unknown-permission-seis-code-task",
        laneId: "seis-code",
        roleId: "engineering-subagent",
        permissionLevel: "unknown-level",
        state: "running",
        dryRunOnly: true,
        approvalRequired: false,
        externalMutation: false,
        targetScope: ["apps/**"],
        validator: "npm run test:web",
        rollbackNote: "Unknown permission task remains unexecuted."
      }
    );
    writeFileSync(queuePath, JSON.stringify(queue), "utf8");

    const forbidden = JSON.parse(executeTool(
      "seis_ai_core_subagent_dry_run",
      { taskId: "forbidden-seis-code-task", requestedPath: "apps/web/index.html" },
      ctx()
    ));
    assert.equal(forbidden.ok, true);
    assert.equal(forbidden.decision, "denied");
    assert.equal(forbidden.permissionEvidence.level, "forbidden");
    assert.equal(forbidden.permissionEvidence.decision, "denied");
    assert.match(forbidden.reason, /separate security and recovery plan/);

    const unknown = JSON.parse(executeTool(
      "seis_ai_core_subagent_dry_run",
      { taskId: "unknown-permission-seis-code-task", requestedPath: "apps/web/index.html" },
      ctx()
    ));
    assert.equal(unknown.ok, true);
    assert.equal(unknown.decision, "denied");
    assert.equal(unknown.permissionEvidence.level, null);
    assert.equal(unknown.permissionEvidence.decision, "denied");
    assert.match(unknown.reason, /missing from the permission matrix/);
  });

  it("seis_ai_core_subagent_dry_run cancels with a supported signal", () => {
    const out = executeTool(
      "seis_ai_core_subagent_dry_run",
      { taskId: "dry-run-seis-code-patch-plan", signal: "operator-cancel" },
      ctx()
    );
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.decision, "cancelled");
    assert.equal(payload.nextState, "cancelled");
    assert.equal(payload.cancellation.laterToolCallsAllowed, false);
    assert.equal(payload.externalMutationPerformed, false);
    assert.equal(payload.executionLedgerEvidence.recordWritten, false);
  });

  it("seis_ai_core_subagent_dry_run denies out-of-scope paths and denied tools", () => {
    const outOfScope = executeTool(
      "seis_ai_core_subagent_dry_run",
      { taskId: "dry-run-seis-code-patch-plan", requestedPath: "deploy/prod.yml" },
      ctx()
    );
    assert.equal(JSON.parse(outOfScope).decision, "denied");

    const deniedTool = executeTool(
      "seis_ai_core_subagent_dry_run",
      { taskId: "dry-run-seis-code-patch-plan", requestedTool: "dependency_install" },
      ctx()
    );
    assert.equal(JSON.parse(deniedTool).decision, "denied");
  });

  it("personal SEIS lane status tools read repo-backed lane posture", () => {
    const out = executeTool("seis_code_status", {}, ctx());
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.laneId, "seis-code");
    assert.equal(payload.status, "ready");
    assert.equal(payload.authenticationClaim, "not-claimed");
    assert.equal(payload.externalMutationRequiresUserConfirmation, true);
    assert.deepEqual(payload.mcpTools, ["seis_code_status", "seis_code_plan"]);
  });

  it("SEIS Cloud status exposes the safe SEIS-SSH binding", () => {
    const out = executeTool("seis_cloud_status", {}, ctx());
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.laneId, "seis-cloud");
    assert.equal(payload.sshBinding.alias, "SEIS-SSH");
    assert.equal(payload.sshBinding.port, "22");
    assert.equal(payload.sshBinding.serverAndPortPolicy, "preserve-existing-server-and-port");
    assert.equal(payload.sshBinding.runtimeMode, "static-read-only");
    assert.equal(payload.sshBinding.liveClaimBlocked, true);
    assert.equal(payload.sshBinding.liveSshAttempted, true);
    assert.equal(payload.sshBinding.safety.length, 3);
  });

  it("personal SEIS lane plan tools return plan-only execution guidance", () => {
    const out = executeTool("seis_cloud_plan", { request: "prepare deployment readiness" }, ctx());
    const payload = JSON.parse(out);
    assert.equal(payload.ok, true);
    assert.equal(payload.laneId, "seis-cloud");
    assert.equal(payload.request, "prepare deployment readiness");
    assert.ok(payload.steps.some((step) => step.includes("provider-neutral preflight")));
    assert.ok(payload.approvalBoundary.includes("explicit human approval"));
    assert.deepEqual(payload.defaultChecks, ["npm run check:cloud-access-policy"]);
    assert.equal(payload.sshBinding.alias, "SEIS-SSH");
    assert.ok(payload.steps.some((step) => step.includes("SEIS-SSH")));
  });

  it("run_checks accepts the a11y scope", () => {
    const out = executeTool("run_checks", { scope: "a11y" }, ctx());
    const r = JSON.parse(out);
    assert.ok(typeof r.ok === "boolean");
    assert.ok(Array.isArray(r.imgsWithoutAlt));
  });

  it("run_checks accepts the security scope", () => {
    const out = executeTool("run_checks", { scope: "security" }, ctx());
    const r = JSON.parse(out);
    assert.ok(typeof r.ok === "boolean");
    assert.ok(Array.isArray(r.unsafeBlankLinks));
    assert.ok(Array.isArray(r.jsHrefs));
    assert.ok(Array.isArray(r.insecureResources));
  });

  it("throws on unknown tool", () => {
    assert.throws(() => executeTool("nope", {}, ctx()), /Unknown tool/);
  });
});

/* ------------------------------------------------------------------ */
/* runAgent loop (mock client)                                        */
/* ------------------------------------------------------------------ */

/**
 * Mock of the Anthropic SDK surface the loop touches:
 * client.messages.stream(params) -> { on(), finalMessage() }.
 * Returns scripted messages in order and records every request params.
 */
function mockClient(scripted) {
  const requests = [];
  let i = 0;
  return {
    requests,
    messages: {
      stream(params) {
        // Snapshot the messages array: the real SDK serialises at call time,
        // and the loop keeps mutating the same array afterwards.
        requests.push({ ...params, messages: [...params.messages] });
        const message = scripted[Math.min(i, scripted.length - 1)];
        i += 1;
        return {
          on() {},
          async finalMessage() {
            return message;
          },
        };
      },
    },
  };
}

const textMsg = (text, stop = "end_turn") => ({
  stop_reason: stop,
  content: [{ type: "text", text }],
});

describe("runAgent", () => {
  beforeEach(() =>
    makeRepo({
      "apps/web/index.html": "<html></html>",
      "readme.txt": "agent fixture",
    })
  );

  function opts(client, extra = {}) {
    return {
      client,
      task: "test task",
      repoRoot,
      webRoot: path.join(repoRoot, "apps", "web"),
      ...extra,
    };
  }

  it("returns final text on immediate end_turn", async () => {
    const client = mockClient([textMsg("done.")]);
    const result = await runAgent(opts(client));
    assert.equal(result.finalText, "done.");
    assert.equal(result.turns, 1);
    assert.equal(result.stopReason, "end_turn");
  });

  it("executes a tool call and feeds the result back", async () => {
    const client = mockClient([
      {
        stop_reason: "tool_use",
        content: [
          { type: "text", text: "reading..." },
          { type: "tool_use", id: "tu_1", name: "read_file", input: { file: "readme.txt" } },
        ],
      },
      textMsg("file says: agent fixture"),
    ]);
    const calls = [];
    const result = await runAgent(opts(client, { onToolCall: (n, i) => calls.push([n, i]) }));

    assert.equal(result.turns, 2);
    assert.equal(result.stopReason, "end_turn");
    assert.deepEqual(calls, [["read_file", { file: "readme.txt" }]]);

    // Second request must contain the tool_result keyed to the tool_use id.
    const second = client.requests[1];
    const toolResultMsg = second.messages.at(-1);
    assert.equal(toolResultMsg.role, "user");
    assert.equal(toolResultMsg.content[0].type, "tool_result");
    assert.equal(toolResultMsg.content[0].tool_use_id, "tu_1");
    assert.ok(toolResultMsg.content[0].content.includes("agent fixture"));
  });

  it("marks failed tool calls with is_error and keeps looping", async () => {
    const client = mockClient([
      {
        stop_reason: "tool_use",
        content: [{ type: "tool_use", id: "tu_err", name: "read_file", input: { file: "../escape" } }],
      },
      textMsg("recovered"),
    ]);
    const result = await runAgent(opts(client));
    assert.equal(result.stopReason, "end_turn");
    const toolResult = client.requests[1].messages.at(-1).content[0];
    assert.equal(toolResult.is_error, true);
    assert.ok(toolResult.content.includes("escapes repository root"));
  });

  it("stops at maxTurns", async () => {
    // Model never stops calling tools.
    const looping = {
      stop_reason: "tool_use",
      content: [{ type: "tool_use", id: "tu_x", name: "list_files", input: { dir: "." } }],
    };
    const client = mockClient([looping]);
    const result = await runAgent(opts(client, { maxTurns: 3 }));
    assert.equal(result.stopReason, "max_turns");
    assert.equal(result.turns, 3);
  });

  it("returns refusal stop reason without executing tools", async () => {
    const client = mockClient([textMsg("cannot help with that", "refusal")]);
    const result = await runAgent(opts(client));
    assert.equal(result.stopReason, "refusal");
  });

  it("continues after pause_turn without adding a user message", async () => {
    const client = mockClient([
      { stop_reason: "pause_turn", content: [{ type: "text", text: "thinking..." }] },
      textMsg("resumed and done"),
    ]);
    const result = await runAgent(opts(client));
    assert.equal(result.stopReason, "end_turn");
    assert.equal(result.finalText, "resumed and done");
    // Second request ends with the assistant message — no synthetic user turn.
    assert.equal(client.requests[1].messages.at(-1).role, "assistant");
  });

  it("streams text deltas through onText", async () => {
    // The mock's on() is a no-op, so just verify the loop tolerates a handler.
    const client = mockClient([textMsg("ok")]);
    const result = await runAgent(opts(client, { onText: () => {} }));
    assert.equal(result.finalText, "ok");
  });

  it("resumes from history and returns the full message log", async () => {
    const history = [
      { role: "user", content: "earlier task" },
      { role: "assistant", content: [{ type: "text", text: "earlier answer" }] },
    ];
    const client = mockClient([textMsg("follow-up answer")]);
    const result = await runAgent(opts(client, { history }));

    // Request must contain history + the new task appended as a user turn.
    const sent = client.requests[0].messages;
    assert.equal(sent.length, 3);
    assert.equal(sent[0].content, "earlier task");
    assert.equal(sent[2].content, "test task");

    // Returned log ends with the new assistant reply, ready to persist.
    assert.equal(result.messages.length, 4);
    assert.equal(result.messages.at(-1).role, "assistant");
    assert.equal(result.messages.at(-1).content[0].text, "follow-up answer");
    // Original history array must not be mutated.
    assert.equal(history.length, 2);
  });

  it("includes the final assistant message in the log without history too", async () => {
    const client = mockClient([textMsg("done.")]);
    const result = await runAgent(opts(client));
    assert.equal(result.messages.length, 2);
    assert.equal(result.messages[0].role, "user");
    assert.equal(result.messages[1].role, "assistant");
  });

  it("excludes write_file from tools sent to the API unless allowWrite", async () => {
    const client = mockClient([textMsg("ok")]);
    await runAgent(opts(client));
    const names = client.requests[0].tools.map((t) => t.name);
    assert.ok(!names.includes("write_file"));
    assert.ok(names.includes("seis_plugin_integration"));
    assert.ok(names.includes("seis_ai_core_version_status"));
    assert.ok(names.includes("seis_ai_core_version_promotion_dry_run"));
    assert.ok(names.includes("seis_ai_core_subagent_model"));
    assert.ok(names.includes("seis_ai_core_subagent_dry_run"));
    assert.ok(names.includes("seis_cloud_status"));
    assert.ok(names.includes("seis_code_plan"));

    const client2 = mockClient([textMsg("ok")]);
    await runAgent(opts(client2, { allowWrite: true }));
    const names2 = client2.requests[0].tools.map((t) => t.name);
    assert.ok(names2.includes("write_file"));
  });
});
