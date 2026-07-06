import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const contractPath = "content/development/seis-five-year-agency-orchestration-contract.json";
const requiredSourceFiles = [
  "content/development/seis-sub-agent-5-year-plan.json",
  "content/development/seis-source-provenance-intake.json",
  "content/development/seis-installed-ai-tools-registry.json",
  "content/development/seis-agent-plugin-integration.json",
  "content/development/seis-ai-core-subagent-operating-model.json",
  "content/development/seis-ai-core-mcp-runtime-contract.json",
  "content/development/seis-ai-core-provider-registry.json",
  "scripts/check-seis-source-provenance-intake.mjs",
  "scripts/check-seis-ai-core-subagent-operating-model.mjs",
  "AGENTS.md"
];

const requiredAgentLanes = [
  "seis",
  "seis-governance",
  "seis-cloud",
  "seis-code",
  "seis-design",
  "seis-data",
  "seis-security",
  "seis-research",
  "seis-automation",
  "seis-product"
];

const requiredToolIds = [
  "codex-current-session",
  "xcode-seis-platform-swift",
  "claude-code-cli-auth-gated",
  "gemini-cli-auth-gated",
  "kimi-code-cli-login-required",
  "cursor-desktop-secondary-review",
  "lm-studio-local-model-lab",
  "openai-cli-auth-gated",
  "aider-cli-patch-helper",
  "goose-cli-automation-helper",
  "hermes-desktop-auth-gated"
];

const requiredDepartments = [
  "strategy-office",
  "creative-studio",
  "engineering-studio",
  "ai-core-lab",
  "data-provenance",
  "cloud-ops",
  "security-qa",
  "release-governance",
  "research-intelligence",
  "automation-office"
];

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readText(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function ensureArray(value, message) {
  ensure(Array.isArray(value), message);
  return Array.isArray(value) ? value : [];
}

function ensureArrayIncludesAll(actualValues, expectedValues, label) {
  const actualSet = new Set(actualValues);
  for (const expected of expectedValues) {
    ensure(actualSet.has(expected), `${label} missing ${expected}`);
  }
}

function collectIds(value, ids = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, ids);
    return ids;
  }

  if (value && typeof value === "object") {
    if (typeof value.id === "string") {
      ids.add(value.id);
    }
    if (typeof value.toolId === "string") {
      ids.add(value.toolId);
    }
    if (typeof value.agentLane === "string") {
      ids.add(value.agentLane);
    }
    for (const item of Object.values(value)) {
      collectIds(item, ids);
    }
  }

  return ids;
}

const contractText = readText(contractPath);
ensure(!contractText.includes("/Users/"), "Contract must not include machine-local /Users paths.");
ensure(!contractText.includes("Downloads"), "Contract must not include local Downloads paths.");
ensure(!/(^|[\s"'])~\//m.test(contractText), "Contract must not include home-directory shorthand paths.");
ensure(!/(OPENAI_API_KEY|ANTHROPIC_API_KEY|PRIVATE KEY|BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9_-]{16,})/.test(contractText), "Contract must not include secret-like values.");

const contract = readJson(contractPath);
if (contract) {
  ensure(contract.id === "seis-five-year-agency-orchestration-contract", "Contract id must be stable.");
  ensure(contract.status === "draft-public-safe", "Contract status must be draft-public-safe.");
  ensure(contract.visibility === "public-safe", "Contract visibility must be public-safe.");
  ensure(contract.mode === "agency-grade-supervised-continuation", "Contract mode must describe supervised agency continuation.");

  ensure(contract.cycleContract?.years === 5, "Cycle contract must cover five years.");
  ensure(contract.cycleContract?.roundsPerRun === 30, "Cycle contract must define 30 rounds per run.");
  ensure(contract.cycleContract?.stepsPerProgram === 50, "Cycle contract must define 50 program steps.");
  ensure(contract.cycleContract?.ownerSelectedThirtyRoundRun === true, "30-round execution must be marked as owner selected.");
  ensure(contract.cycleContract?.legacySwarmLedgerDefaultRounds === 15, "Legacy swarm ledger default round count must remain documented.");
  ensure(contract.cycleContract?.literalContinuousRuntimeClaimAllowed === false, "Literal continuous runtime claims must be blocked.");
  ensure(contract.cycleContract?.backgroundAgents === "platform-dependent", "Background agents must remain platform-dependent.");

  ensure(contract.truthBoundary?.liveAiClaimAllowed === false, "Live AI claims must be blocked.");
  ensure(contract.truthBoundary?.mcpInstallClaimAllowedWithoutVerification === false, "MCP install claims without verification must be blocked.");
  ensure(contract.truthBoundary?.credentialStorageAllowed === false, "Credential storage must be blocked.");
  ensure(contract.truthBoundary?.externalMutationRequiresApproval === true, "External mutations must require approval.");
  ensure(contract.truthBoundary?.subagentsMayWrite === false, "Subagents must remain read-only unless explicitly approved.");
  ensure(contract.truthBoundary?.providerCallsAllowed === false, "Provider calls must be disabled for this public-safe contract.");
  ensure(contract.truthBoundary?.demoModeMustRemainNoKey === true, "Demo mode must remain no-key.");
  ensure(contract.truthBoundary?.rawArchiveDumpAllowedWithoutReview === false, "Raw archive dumps must be blocked without review.");

  const sourceFiles = Object.values(contract.sourceOfTruth ?? {});
  ensureArrayIncludesAll(sourceFiles, requiredSourceFiles, "sourceOfTruth");
  for (const relativePath of requiredSourceFiles) {
    ensure(fs.existsSync(path.join(repoRoot, relativePath)), `Source-of-truth file does not exist: ${relativePath}`);
  }

  ensure(contract.mcpPolicy?.activationDefault === "official-or-owner-approved-only", "MCP activation default must be official or owner approved.");
  ensure(contract.mcpPolicy?.installedMcpUse === "verified-only", "Installed MCP use must be verified-only.");
  ensure(contract.mcpPolicy?.candidateUse === "document-only-until-reviewed", "Candidate MCPs must remain documentation-only.");
  ensure(contract.mcpPolicy?.packageRunnerDefault === "disabled-or-approval-gated", "Package runners must be disabled or approval-gated.");
  ensure(contract.mcpPolicy?.permissionReviewRequired === true, "MCP permission review must be required.");

  const matrix = contract.decisionMatrix ?? {};
  for (const [key, value] of Object.entries(matrix)) {
    ensure(Array.isArray(value) && value.length >= 3, `Decision matrix entry ${key} must preserve A/B/C selections.`);
  }
  ensure(Object.keys(matrix).length >= 16, "Decision matrix must cover all user-selected categories.");

  const departments = ensureArray(contract.agencyDepartments, "agencyDepartments must be an array.");
  ensure(departments.length >= requiredDepartments.length, "Agency departments must cover the full agency operating model.");
  ensureArrayIncludesAll(departments.map((department) => department.id), requiredDepartments, "agencyDepartments");
  for (const department of departments) {
    ensure(typeof department.displayName === "string" && department.displayName.length > 0, `Department ${department.id} must have a displayName.`);
    ensure(Array.isArray(department.agents) && department.agents.length > 0, `Department ${department.id} must assign agents.`);
    ensure(Array.isArray(department.tools) && department.tools.length > 0, `Department ${department.id} must assign tools.`);
    ensure(Array.isArray(department.featureAreas) && department.featureAreas.length > 0, `Department ${department.id} must define feature areas.`);
    ensure(typeof department.qualityGate === "string" && department.qualityGate.length > 0, `Department ${department.id} must define a quality gate.`);
  }

  const agentAssignments = ensureArray(contract.agentFeatureAssignments, "agentFeatureAssignments must be an array.");
  ensure(agentAssignments.length >= requiredAgentLanes.length, "Agent feature assignments must cover all required lanes.");
  ensureArrayIncludesAll(agentAssignments.map((assignment) => assignment.agentLane), requiredAgentLanes, "agentFeatureAssignments");
  for (const assignment of agentAssignments) {
    ensure(Array.isArray(assignment.ownsFeatures) && assignment.ownsFeatures.length >= 3, `Agent ${assignment.agentLane} must own at least three features.`);
    ensure(Array.isArray(assignment.primaryTools) && assignment.primaryTools.length > 0, `Agent ${assignment.agentLane} must define primary tools.`);
    ensure(Array.isArray(assignment.gates) && assignment.gates.length > 0, `Agent ${assignment.agentLane} must define quality gates.`);
    ensure(Array.isArray(assignment.forbiddenClaims) && assignment.forbiddenClaims.length > 0, `Agent ${assignment.agentLane} must define forbidden claims.`);
  }

  const toolAssignments = ensureArray(contract.toolFeatureAssignments, "toolFeatureAssignments must be an array.");
  ensure(toolAssignments.length >= requiredToolIds.length, "Tool feature assignments must cover all required tools.");
  ensureArrayIncludesAll(toolAssignments.map((assignment) => assignment.toolId), requiredToolIds, "toolFeatureAssignments");
  for (const assignment of toolAssignments) {
    ensure(typeof assignment.statusClass === "string" && assignment.statusClass.length > 0, `Tool ${assignment.toolId} must define statusClass.`);
    ensure(typeof assignment.allowedMode === "string" && assignment.allowedMode.length > 0, `Tool ${assignment.toolId} must define allowedMode.`);
    ensure(Array.isArray(assignment.developsFeatures) && assignment.developsFeatures.length > 0, `Tool ${assignment.toolId} must define feature responsibilities.`);
    ensure(typeof assignment.evidenceRequired === "string" && assignment.evidenceRequired.length > 0, `Tool ${assignment.toolId} must define required evidence.`);
  }

  const rounds = ensureArray(contract.runTemplate?.rounds, "runTemplate.rounds must be an array.");
  ensure(rounds.length === 30, "Run template must contain exactly 30 rounds.");
  ensureArrayIncludesAll(rounds.map((round) => round.round), Array.from({ length: 30 }, (_, index) => index + 1), "runTemplate.rounds");
  for (const round of rounds) {
    ensure(requiredDepartments.includes(round.department), `Round ${round.round} must reference a known department.`);
    ensure(typeof round.focus === "string" && round.focus.length > 0, `Round ${round.round} must define focus.`);
    ensure(typeof round.output === "string" && round.output.length > 0, `Round ${round.round} must define output.`);
    ensure(typeof round.verification === "string" && round.verification.length > 0, `Round ${round.round} must define verification.`);
  }

  const steps = ensureArray(contract.developmentSteps, "developmentSteps must be an array.");
  ensure(steps.length === 50, "Development ladder must contain exactly 50 steps.");
  ensureArrayIncludesAll(steps.map((step) => step.step), Array.from({ length: 50 }, (_, index) => index + 1), "developmentSteps");
  for (const step of steps) {
    ensure(requiredAgentLanes.includes(step.owner), `Step ${step.step} must reference a known owner lane.`);
    ensure(typeof step.phase === "string" && step.phase.length > 0, `Step ${step.step} must define phase.`);
    ensure(typeof step.feature === "string" && step.feature.length > 0, `Step ${step.step} must define feature.`);
    ensure(typeof step.evidence === "string" && step.evidence.length > 0, `Step ${step.step} must define evidence.`);
  }

  const knownIds = collectIds(contract);
  ensureArrayIncludesAll([...knownIds], requiredAgentLanes, "contract id coverage");
  ensureArrayIncludesAll([...knownIds], requiredToolIds, "contract tool coverage");

  const toolsRegistry = readJson("content/development/seis-installed-ai-tools-registry.json");
  if (toolsRegistry) {
    const registryIds = collectIds(toolsRegistry);
    ensureArrayIncludesAll([...registryIds], requiredToolIds, "installed tools registry");
  }

  const pluginIntegration = readJson("content/development/seis-agent-plugin-integration.json");
  if (pluginIntegration) {
    const pluginIds = collectIds(pluginIntegration);
    ensureArrayIncludesAll([...pluginIds], requiredAgentLanes, "agent plugin integration");
  }
}

if (failures.length > 0) {
  console.error("SEIS five-year agency orchestration contract check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS five-year agency orchestration contract check passed.");
