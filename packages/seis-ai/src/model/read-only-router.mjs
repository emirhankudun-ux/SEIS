import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const READ_ONLY_ROUTER_RUNTIME_ID = "seis-ai-core-read-only-router-runtime-v1";
export const READ_ONLY_ROUTER_TOOL = "seis_ai_core_read_only_route";
export const READ_ONLY_ROUTER_CONTRACT_PATH = "content/development/seis-read-only-model-router-contract.json";
export const READ_ONLY_ROUTER_RUNTIME_PATH = "content/development/seis-ai-core-read-only-router-runtime.json";
export const PROVIDER_REGISTRY_PATH = "content/development/seis-ai-core-provider-registry.json";
export const SUBAGENT_OPERATING_MODEL_PATH = "content/development/seis-ai-core-subagent-operating-model.json";

export const ROUTER_PRIVACY_MODES = Object.freeze(["local-only", "standard", "review-gated"]);
export const ROUTER_PROVIDER_STATES = Object.freeze([
  "Local Demo",
  "Available",
  "Missing Key",
  "Disabled",
  "Rate Limited",
  "Error",
  "Unknown",
]);

const ROUTER_LANES = Object.freeze([
  { id: "seis-cloud", keywords: ["cloud", "deploy", "deployment", "provider", "ssh", "vpn", "server"] },
  { id: "seis-design", keywords: ["design", "ui", "ux", "accessibility", "motion", "layout", "visual"] },
  { id: "seis-data", keywords: ["data", "dataset", "schema", "memory", "rag", "provenance", "knowledge"] },
  { id: "seis-code", keywords: ["code", "runtime", "test", "tests", "mcp", "plugin", "script", "package", "bug", "validation", "repository", "implementation"] },
  { id: "seis", keywords: ["governance", "architecture", "roadmap", "github", "release", "plan", "review"] },
]);

const PRIVATE_CONTENT_PATTERN = /\b(private|personal|obsidian|vault|note[- ]content|journal)\b/i;
const FRONTIER_MODEL_PATTERN = /\b(20b|70b|150b|300b|512b|frontier|apex|foundation[- ]model|model[- ]weights)\b/i;
const SECRET_KEY_PATTERN = /(api[_-]?key|access[_-]?token|auth[_-]?token|credential|password|cookie|private[_-]?key|service[_-]?account|secret|ssh)/i;
const FORBIDDEN_VALUE_PATTERN = /(sk-[a-z0-9_-]{8,}|sk-ant-[a-z0-9_-]{8,}|ghp_[a-z0-9_-]{12,}|github_pat_[a-z0-9_-]{12,}|xox[baprs]-[a-z0-9-]{12,}|AIza[a-z0-9_-]{12,}|AKIA[a-z0-9]{12,}|bearer\s+[a-z0-9._-]{20,}|-----begin [a-z ]+private key-----)/i;

const DEFAULT_INPUT = Object.freeze({
  taskType: "general-assistant-task",
  capability: "general-chat-demo",
  privacyMode: "local-only",
  localOnly: true,
  costPreference: "balanced",
  speedPreference: "balanced",
  contextSizeRequired: 0,
  toolSupportRequired: false,
  fallbackPolicy: "explicit-local-demo-then-feature-disabled",
});

export function loadReadOnlyRouterSources(root) {
  const routerRoot = resolveRouterRoot(root);
  return {
    contract: readJson(routerRoot, READ_ONLY_ROUTER_CONTRACT_PATH),
    providerRegistry: readJson(routerRoot, PROVIDER_REGISTRY_PATH),
    operatingModel: readJson(routerRoot, SUBAGENT_OPERATING_MODEL_PATH),
    runtime: readJson(routerRoot, READ_ONLY_ROUTER_RUNTIME_PATH),
  };
}

export function buildReadOnlyRouteDecision(input = {}, options = {}) {
  const routerRoot = resolveRouterRoot(options.root);
  const sources = options.sources || loadReadOnlyRouterSources(routerRoot);
  const runtime = sources.runtime || readJson(routerRoot, READ_ONLY_ROUTER_RUNTIME_PATH);
  const normalized = normalizeRouterInput(input);
  const lane = selectLane(normalized, sources.operatingModel);
  const providerMediation = runtime?.providerMediation || {};
  const decisionIntegrity = runtime?.decisionIntegrity || {};
  const providers = Array.isArray(sources.providerRegistry?.providers)
    ? sources.providerRegistry.providers
    : [];
  const privateContentBlocked = PRIVATE_CONTENT_PATTERN.test(`${normalized.taskType} ${normalized.capability}`);
  const frontierModelBlocked = FRONTIER_MODEL_PATTERN.test(`${normalized.taskType} ${normalized.capability}`);
  const candidates = providers.map((provider) => describeCandidate(provider, normalized));

  let selected = null;
  let selectionBasis = "no-provider-selected";
  const blockedReasons = [
    "read-only router has no runtime authority",
    "live provider execution is disabled",
    "backend-only provider mediation is not implemented",
  ];

  if (privateContentBlocked) {
    blockedReasons.unshift("private Obsidian or personal note content is not routable");
    blockedReasons.push("explicit user-selected local source and separate approval are required");
  } else if (frontierModelBlocked) {
    blockedReasons.unshift("frontier and 512B model classes are planning records, not routeable models");
    blockedReasons.push("weights, runtime adapter, benchmark evidence, safety evaluation, and approval are missing");
  } else {
    const eligible = candidates
      .filter((candidate) => candidate.compatible && candidate.available)
      .sort(compareCandidates);
    selected = eligible[0] || null;

    if (selected) {
      selectionBasis = selected.id === "seis-local-demo"
        ? "explicit-local-demo-selection"
        : "available-provider-capability-match-without-runtime-authority";
    } else {
      const localDemo = candidates.find((candidate) => candidate.id === "seis-local-demo");
      if (localDemo?.available) {
        selected = localDemo;
        selectionBasis = "explicit-local-demo-fallback";
        blockedReasons.push("requested capability has no verified live provider route");
      } else {
        blockedReasons.unshift("no compatible available provider candidate");
      }
    }
  }

  if (normalized.localOnly) {
    blockedReasons.push("local-only mode never routes to cloud providers");
  }
  if (normalized.contextSizeRequired > 0) {
    blockedReasons.push("context-size compatibility is not verified by the local provider fixture");
  }
  if (normalized.toolSupportRequired) {
    blockedReasons.push("tool-support compatibility is not verified by the local provider fixture");
  }

  const selectedProvider = selected?.id || "none";
  const selectedModel = selected?.actualModel || "none";
  const providerState = privateContentBlocked || frontierModelBlocked
    ? "Disabled"
    : selected?.id === "seis-local-demo"
      ? "Local Demo"
      : selected?.publicStatus || "Disabled";
  const registryProviderState = selected?.publicStatus || null;
  const uniqueBlockedReasons = [...new Set(blockedReasons)];
  const decision = {
    runtimeId: READ_ONLY_ROUTER_RUNTIME_ID,
    contractId: sources.contract?.id || "seis-read-only-model-router-contract",
    mode: "provider-neutral-read-only",
    status: "review-only-no-runtime-authority",
    taskType: normalized.taskType,
    capability: normalized.capability,
    privacyMode: normalized.privacyMode,
    localOnly: normalized.localOnly,
    routingInputSummary: {
      costPreference: normalized.costPreference,
      speedPreference: normalized.speedPreference,
      contextSizeRequired: normalized.contextSizeRequired,
      toolSupportRequired: normalized.toolSupportRequired,
    },
    selectedProvider,
    selectedModel,
    providerState,
    registryProviderState,
    selectionBasis,
    routeEligible: false,
    executionPerformed: false,
    providerCallsPerformed: false,
    fallbackUsed: false,
    fallbackPolicy: normalized.fallbackPolicy,
    fallbackPlan: selected?.id === "seis-local-demo" ? "seis-local-demo" : "feature-disabled",
    agentLane: {
      id: lane.id,
      displayName: lane.displayName,
      subAgentRole: lane.subAgentRole,
      permissionLevel: lane.currentPermissionLevel,
      permissionBoundary: "plan-only",
      permissionSourceStatus: lane.permissionSourceStatus,
      statusTool: lane.statusTool,
      planTool: lane.planTool,
      qualityGate: lane.qualityGate,
      executionPerformed: false,
    },
    providerMediation: {
      mode: providerMediation.mode ?? null,
      frontendSecretAllowed: providerMediation.frontendSecretAllowed ?? null,
      routeExecutionEnabled: providerMediation.routeExecutionEnabled ?? null,
      status: providerMediation.status ?? null,
    },
    providerCandidates: candidates.map(toPublicCandidate),
    requiredApprovals: [
      "human approval before live provider routing",
      "backend-only provider mediation and typed environment validation",
    ],
    blockedReasons: uniqueBlockedReasons,
    decisionIntegrity: { ...decisionIntegrity },
    modelClaimBoundary: {
      isTrainedModel: false,
      isFoundationModel: false,
      isAgi: false,
      parameterCountBillion: null,
      providerRoutingIsModelOwnership: false,
      promptEngineeringIsTraining: false,
      ragIsTraining: false,
    },
    safetyBoundary: {
      credentialsRead: false,
      promptBodyRead: false,
      privateContentRead: false,
      networkCalled: false,
      sshExecuted: false,
      deploymentPerformed: false,
      githubMutationPerformed: false,
    },
  };

  decision.decisionHash = hashDecision(decision);
  const validation = validateReadOnlyRouteDecision(decision);
  if (!validation.ok) {
    throw new Error(`read-only router mediation contract failed: ${validation.failures.join("; ")}`);
  }
  return decision;
}

export function validateReadOnlyRouteDecision(decision) {
  const failures = [];
  ensure(decision?.runtimeId === READ_ONLY_ROUTER_RUNTIME_ID, "runtime id mismatch", failures);
  ensure(decision?.mode === "provider-neutral-read-only", "router mode must be provider-neutral-read-only", failures);
  ensure(decision?.status === "review-only-no-runtime-authority", "router status must remain review-only", failures);
  ensure(decision?.routeEligible === false, "routeEligible must remain false", failures);
  ensure(decision?.executionPerformed === false, "executionPerformed must remain false", failures);
  ensure(decision?.providerCallsPerformed === false, "providerCallsPerformed must remain false", failures);
  ensure(decision?.fallbackUsed === false, "fallbackUsed must remain false until execution exists", failures);
  ensure(decision?.providerMediation?.mode === "backend-only", "provider mediation must remain backend-only", failures);
  ensure(decision?.providerMediation?.frontendSecretAllowed === false, "frontend provider secrets must remain forbidden", failures);
  ensure(decision?.providerMediation?.routeExecutionEnabled === false, "provider route execution must remain disabled", failures);
  ensure(decision?.providerMediation?.status === "required-before-live-routing", "provider mediation must remain pre-live", failures);
  ensure(typeof decision?.selectedProvider === "string" && decision.selectedProvider.length > 0, "selected provider must be explicit", failures);
  ensure(typeof decision?.selectedModel === "string" && decision.selectedModel.length > 0, "selected model must be explicit", failures);
  ensure(ROUTER_PROVIDER_STATES.includes(decision?.providerState), "provider state is not in the public state model", failures);
  ensure(Array.isArray(decision?.blockedReasons) && decision.blockedReasons.length > 0, "blocked reasons are required", failures);
  ensure(decision?.decisionIntegrity?.noPromptBodyInDecision === true, "decision must exclude prompt bodies", failures);
  ensure(decision?.decisionIntegrity?.noCredentialMaterialInDecision === true, "decision must exclude credential material", failures);
  ensure(decision?.decisionIntegrity?.backendOnlyProvidersRequired === true, "provider mediation must remain backend-only", failures);
  ensure(decision?.decisionIntegrity?.privateObsidianContentRoutable === false, "private Obsidian content must not be routable", failures);
  ensure(decision?.modelClaimBoundary?.isAgi === false, "decision must not claim AGI", failures);
  ensure(decision?.modelClaimBoundary?.isTrainedModel === false, "decision must not claim a trained model", failures);
  ensure(decision?.agentLane?.permissionLevel === "plan-only", "agent lane must remain plan-only", failures);
  ensure(decision?.agentLane?.permissionBoundary === "plan-only", "agent lane permission boundary must remain plan-only", failures);
  ensure(["verified", "fail-closed"].includes(decision?.agentLane?.permissionSourceStatus), "agent lane permission source must be verified or fail-closed", failures);
  ensure(decision?.agentLane?.executionPerformed === false, "agent lane must not execute", failures);
  const selectedCandidate = decision?.providerCandidates?.find((candidate) => candidate.id === decision.selectedProvider);
  ensure(
    !selectedCandidate || selectedCandidate.compatible === true || decision.selectionBasis === "explicit-local-demo-fallback",
    "selected provider must be compatible unless the explicit local demo fallback is selected",
    failures,
  );
  ensure(!selectedCandidate || selectedCandidate.securityCompatible === true, "selected provider must satisfy backend mediation security", failures);
  ensure(!containsForbiddenKey(decision), "decision contains a forbidden secret-like key", failures);
  ensure(!containsForbiddenValue(decision), "decision contains a forbidden secret-like value", failures);

  if (decision?.decisionHash) {
    const copy = { ...decision };
    delete copy.decisionHash;
    ensure(decision.decisionHash === hashDecision(copy), "decision hash mismatch", failures);
  }

  return { ok: failures.length === 0, failures };
}

export function runReadOnlyRouterSmokeChecks(root = process.cwd()) {
  const cases = [
    {
      id: "default-local-demo",
      input: {},
      assertions: (decision) => decision.selectedProvider === "seis-local-demo" && decision.providerState === "Local Demo",
    },
    {
      id: "repo-local-code-lane",
      input: { taskType: "repository-validation", capability: "validation", privacyMode: "local-only", localOnly: true },
      assertions: (decision) => decision.selectedProvider === "codex-operator" && decision.agentLane.id === "seis-code",
    },
    {
      id: "missing-key-is-not-error",
      input: { taskType: "architecture-review", capability: "architecture-review", privacyMode: "standard" },
      assertions: (decision) => decision.providerCandidates.some((candidate) => candidate.publicStatus === "Missing Key")
        && decision.providerCandidates.every((candidate) => candidate.publicStatus !== "Missing Key" || candidate.available === false),
    },
    {
      id: "private-content-blocked",
      input: { taskType: "private-obsidian-vault-review", capability: "personal notes", privacyMode: "review-gated" },
      assertions: (decision) => decision.selectedProvider === "none" && decision.providerState === "Disabled",
    },
    {
      id: "frontier-class-blocked",
      input: { taskType: "512B apex model route", capability: "frontier inference", privacyMode: "review-gated" },
      assertions: (decision) => decision.selectedProvider === "none" && decision.modelClaimBoundary.isAgi === false,
    },
  ];

  const results = cases.map((testCase) => {
    const decision = buildReadOnlyRouteDecision(testCase.input, { root });
    const validation = validateReadOnlyRouteDecision(decision);
    const assertionPassed = testCase.assertions(decision);
    return {
      id: testCase.id,
      ok: validation.ok && assertionPassed,
      validation,
      assertionPassed,
      selectedProvider: decision.selectedProvider,
      agentLane: decision.agentLane.id,
    };
  });

  return { ok: results.every((result) => result.ok), total: results.length, passed: results.filter((result) => result.ok).length, results };
}

function normalizeRouterInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("router input must be an object");
  }
  assertSafeInput(input);

  const privacyMode = input.privacyMode ?? DEFAULT_INPUT.privacyMode;
  if (!ROUTER_PRIVACY_MODES.includes(privacyMode)) {
    throw new TypeError(`privacyMode must be one of: ${ROUTER_PRIVACY_MODES.join(", ")}`);
  }

  return {
    taskType: boundedString(input.taskType ?? DEFAULT_INPUT.taskType, "taskType"),
    capability: boundedString(input.capability ?? DEFAULT_INPUT.capability, "capability"),
    privacyMode,
    localOnly: input.localOnly === undefined ? privacyMode === "local-only" : Boolean(input.localOnly),
    costPreference: boundedString(input.costPreference ?? DEFAULT_INPUT.costPreference, "costPreference"),
    speedPreference: boundedString(input.speedPreference ?? DEFAULT_INPUT.speedPreference, "speedPreference"),
    contextSizeRequired: boundedNumber(input.contextSizeRequired ?? DEFAULT_INPUT.contextSizeRequired, "contextSizeRequired"),
    toolSupportRequired: Boolean(input.toolSupportRequired ?? DEFAULT_INPUT.toolSupportRequired),
    fallbackPolicy: boundedString(input.fallbackPolicy ?? DEFAULT_INPUT.fallbackPolicy, "fallbackPolicy"),
  };
}

function describeCandidate(provider, input) {
  const capabilityMatch = providerSupportsCapability(provider, input.capability, input.taskType);
  const privacyCompatible = isPrivacyCompatible(provider, input);
  const stateEligible = provider.publicStatus === "Available" && provider.enabled === true && provider.routingEligible === true;
  const securityCompatible = provider.frontendSecretAllowed !== true && provider.backendOnly === true;
  const blockers = [];

  if (!capabilityMatch) blockers.push("capability mismatch");
  if (!privacyCompatible) blockers.push(input.localOnly ? "local-only mode excludes cloud providers" : "privacy mode mismatch");
  if (!stateEligible) blockers.push(`provider state is ${provider.publicStatus || "Unknown"}`);
  if (provider.frontendSecretAllowed === true) blockers.push("frontend secrets are forbidden");
  if (provider.backendOnly !== true) blockers.push("backend-only provider mediation is required");

  return {
    id: String(provider.id || "unknown"),
    displayName: String(provider.displayName || provider.id || "Unknown provider"),
    category: String(provider.category || "unknown"),
    publicStatus: ROUTER_PROVIDER_STATES.includes(provider.publicStatus) ? provider.publicStatus : "Unknown",
    actualModel: String(provider.actualModel || "not-configured"),
    capabilities: Array.isArray(provider.capabilities) ? provider.capabilities.map(String).sort() : [],
    privacyClass: String(provider.privacyClass || "unknown"),
    fallbackEligible: provider.fallbackEligible === true,
    capabilityMatch,
    privacyCompatible,
    securityCompatible,
    available: stateEligible,
    compatible: capabilityMatch && privacyCompatible && stateEligible && securityCompatible,
    blockers,
  };
}

function providerSupportsCapability(provider, capability, taskType) {
  const requested = `${capability} ${taskType}`.toLowerCase();
  const capabilities = new Set((provider.capabilities || []).map((value) => String(value).toLowerCase()));
  if (provider.id === "seis-local-demo") {
    return capabilities.has(capability.toLowerCase())
      || /\b(general|chat|planning|status|demo|repository|tool|plugin)\b/.test(requested);
  }
  return [...capabilities].some((value) => requested.includes(value) || value.includes(capability.toLowerCase()));
}

function isPrivacyCompatible(provider, input) {
  if (!input.localOnly) return true;
  const privacyClass = String(provider.privacyClass || "").toLowerCase();
  const category = String(provider.category || "").toLowerCase();
  return !privacyClass.includes("cloud") && !category.includes("cloud-model");
}

function compareCandidates(left, right) {
  const score = (candidate) => {
    let value = 0;
    if (candidate.capabilityMatch) value += 30;
    if (candidate.id === "codex-operator") value += 20;
    if (candidate.id === "seis-local-demo") value += 10;
    if (candidate.fallbackEligible) value -= 2;
    return value;
  };
  return score(right) - score(left) || left.id.localeCompare(right.id);
}

function selectLane(input, operatingModel) {
  const text = `${input.taskType} ${input.capability}`.toLowerCase();
  const matched = ROUTER_LANES.find((lane) => lane.keywords.some((keyword) => text.includes(keyword)));
  const sourceLane = (operatingModel?.lanes || []).find((lane) => lane.id === (matched?.id || "seis")) || {};
  const permissionSourceStatus = sourceLane.currentPermissionLevel === "plan-only" ? "verified" : "fail-closed";
  return {
    id: sourceLane.id || matched?.id || "seis",
    displayName: sourceLane.displayName || "SEIS Hub",
    subAgentRole: sourceLane.subAgentRole || "repository-governance-subagent",
    currentPermissionLevel: "plan-only",
    permissionSourceStatus,
    statusTool: sourceLane.statusTool || "seis_hub_status",
    planTool: sourceLane.planTool || "seis_hub_plan",
    qualityGate: sourceLane.qualityGate || "npm run check:seis-ai-agent",
  };
}

function toPublicCandidate(candidate) {
  return {
    id: candidate.id,
    displayName: candidate.displayName,
    category: candidate.category,
    publicStatus: candidate.publicStatus,
    actualModel: candidate.actualModel,
    capabilities: candidate.capabilities,
    privacyClass: candidate.privacyClass,
    fallbackEligible: candidate.fallbackEligible,
    capabilityMatch: candidate.capabilityMatch,
    privacyCompatible: candidate.privacyCompatible,
    securityCompatible: candidate.securityCompatible,
    available: candidate.available,
    compatible: candidate.compatible,
    blockers: candidate.blockers,
  };
}

function assertSafeInput(value, location = "input") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeInput(item, `${location}[${index}]`));
    return;
  }
  if (typeof value === "string") {
    if (FORBIDDEN_VALUE_PATTERN.test(value)) {
      throw new TypeError(`${location} contains forbidden credential-like material`);
    }
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY_PATTERN.test(key) || /^(prompt|vault|obsidian|privatecontent)$/i.test(key)) {
      throw new TypeError(`${location}.${key} is forbidden; provide metadata only`);
    }
    assertSafeInput(child, `${location}.${key}`);
  }
}

function containsForbiddenKey(value) {
  if (Array.isArray(value)) return value.some(containsForbiddenKey);
  if (!value || typeof value !== "object") return false;
  const safeBoundaryKeys = new Set([
    "credentialsRead",
    "frontendSecretAllowed",
    "privateContentRead",
    "noCredentialMaterialInDecision",
    "noPromptBodyInDecision",
    "sshExecuted",
  ]);
  return Object.entries(value).some(([key, child]) =>
    (!safeBoundaryKeys.has(key) && SECRET_KEY_PATTERN.test(key)) || containsForbiddenKey(child),
  );
}

function containsForbiddenValue(value) {
  if (Array.isArray(value)) return value.some(containsForbiddenValue);
  if (!value || typeof value !== "object") return FORBIDDEN_VALUE_PATTERN.test(String(value));
  return Object.values(value).some(containsForbiddenValue);
}

function boundedString(value, label) {
  if (typeof value !== "string" || value.length > 160) {
    throw new TypeError(`${label} must be a string of at most 160 characters`);
  }
  if (FORBIDDEN_VALUE_PATTERN.test(value)) {
    throw new TypeError(`${label} contains forbidden credential-like material`);
  }
  return value.trim() || DEFAULT_INPUT[label] || "unspecified";
}

function boundedNumber(value, label) {
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000_000) {
    throw new TypeError(`${label} must be a finite non-negative number`);
  }
  return value;
}

function readJson(root, relativePath) {
  const filePath = path.join(root, ...relativePath.split("/"));
  if (!existsSync(filePath)) throw new Error(`missing router source: ${relativePath}`);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function resolveRouterRoot(root) {
  if (typeof root === "string" && root.length > 0) return root;
  if (typeof process.env.SEIS_REPO_ROOT === "string" && process.env.SEIS_REPO_ROOT.length > 0) {
    return process.env.SEIS_REPO_ROOT;
  }
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
}

function ensure(condition, message, failures) {
  if (!condition) failures.push(message);
}

function hashDecision(decision) {
  const payload = stableStringify(decision);
  return createHash("sha256").update(payload).digest("hex");
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (!value || typeof value !== "object") return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}
