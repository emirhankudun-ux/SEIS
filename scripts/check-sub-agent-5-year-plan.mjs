import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, "content", "development", "seis-sub-agent-5-year-plan.json");
const REVIEW_PATH = path.join(ROOT, "docs", "reviews", "SUB_AGENT_LONG_HORIZON_AUDIT.md");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const WEB_INDEX_PATH = path.join(ROOT, "apps", "seis-demo-web", "index.html");
const WEB_SCRIPT_PATH = path.join(ROOT, "apps", "seis-demo-web", "script.js");
const WEB_STYLE_PATH = path.join(ROOT, "apps", "seis-demo-web", "styles.css");
const WEB_CONTRACT_PATH = path.join(ROOT, "apps", "seis-demo-web", "contracts", "seis-demo-contract.json");
const NATIVE_CONTRACT_PATH = path.join(ROOT, "packages", "seis_platform_swift", "Sources", "SeisAppleNativeShell", "Resources", "seis-demo-contract.json");
const EVIDENCE_SCRIPT_PATH = path.join(ROOT, "scripts", "create-sub-agent-five-year-demo-evidence.mjs");
const EVIDENCE_REPORT_JSON_PATH = path.join(ROOT, "reports", "seis-sub-agent-five-year-demo-evidence.json");
const EVIDENCE_REPORT_MD_PATH = path.join(ROOT, "reports", "seis-sub-agent-five-year-demo-evidence.md");
const DEMO_PROMOTION_MAP_PATH = path.join(ROOT, "apps", "seis-demo-web", "data", "seis-ai-core-version-promotion-map.json");
const DEMO_PLAN_VIEW_PATH = path.join(ROOT, "apps", "seis-demo-web", "data", "seis-sub-agent-five-year-plan-view.json");
const RUN_SCRIPT_PATH = path.join(ROOT, "scripts", "run-sub-agent-five-year-demo.mjs");
const RUN_REPORT_JSON_PATH = path.join(ROOT, "reports", "seis-sub-agent-five-year-demo-run.json");
const RUN_REPORT_MD_PATH = path.join(ROOT, "reports", "seis-sub-agent-five-year-demo-run.md");
const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`Cannot read ${path.relative(ROOT, filePath)}: ${error.message}`);
    return null;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`Cannot read ${path.relative(ROOT, filePath)}: ${error.message}`);
    return "";
  }
}

const plan = readJson(PLAN_PATH);
const review = readText(REVIEW_PATH);
const packageJson = readJson(PACKAGE_PATH);
const webIndex = readText(WEB_INDEX_PATH);
const webScript = readText(WEB_SCRIPT_PATH);
const webStyle = readText(WEB_STYLE_PATH);
const webContract = readJson(WEB_CONTRACT_PATH);
const nativeContract = readJson(NATIVE_CONTRACT_PATH);
const evidenceScript = readText(EVIDENCE_SCRIPT_PATH);
const evidenceReport = readJson(EVIDENCE_REPORT_JSON_PATH);
const evidenceReportMarkdown = readText(EVIDENCE_REPORT_MD_PATH);
const demoPromotionMap = readJson(DEMO_PROMOTION_MAP_PATH);
const demoPlanView = readJson(DEMO_PLAN_VIEW_PATH);
const runScript = readText(RUN_SCRIPT_PATH);
const runReport = readJson(RUN_REPORT_JSON_PATH);
const runReportMarkdown = readText(RUN_REPORT_MD_PATH);

if (plan) {
  ensure(plan.id === "sub-agent-5-year-plan", "plan id must be sub-agent-5-year-plan");
  ensure(plan.status === "documented", "plan status must remain documented until runtime evidence exists");
  ensure(plan.governance?.writerPolicy === "single-writer", "plan must keep single-writer policy");
  ensure(plan.governance?.defaultWriter === "codex", "plan must keep Codex as default writer");
  ensure(Array.isArray(plan.governance?.forbiddenAutonomy) && plan.governance.forbiddenAutonomy.includes("deploy"), "plan must forbid autonomous deploy");
  ensure(plan.governance?.forbiddenAutonomy?.includes("secret-access"), "plan must forbid autonomous secret access");
  ensure(plan.governance?.forbiddenAutonomy?.includes("push-to-main"), "plan must forbid push-to-main");
  ensure(Array.isArray(plan.subAgentLifecycleStates) && plan.subAgentLifecycleStates.includes("blocked"), "plan must define blocked lifecycle state");
  ensure(Array.isArray(plan.lanes) && plan.lanes.length >= 6, "plan must define at least six sub-agent lanes");

  const laneIds = new Set((plan.lanes || []).map((lane) => lane.id));
  for (const requiredLane of [
    "architecture-agent",
    "implementation-agent",
    "security-agent",
    "documentation-agent",
    "validation-agent",
    "design-agent"
  ]) {
    ensure(laneIds.has(requiredLane), `plan missing lane ${requiredLane}`);
  }

  ensure(Array.isArray(plan.years) && plan.years.length === 5, "plan must cover exactly five years");
  const quarterIds = new Set();
  for (const year of plan.years || []) {
    ensure(Number.isInteger(year.year) && year.year >= 1 && year.year <= 5, `invalid year: ${year.year}`);
    ensure(Array.isArray(year.quarters) && year.quarters.length === 4, `year ${year.year} must contain four quarters`);
    for (const quarter of year.quarters || []) {
      quarterIds.add(quarter.id);
      ensure(/^Y[1-5]-Q[1-4]$/.test(quarter.id), `invalid quarter id: ${quarter.id}`);
      ensure(typeof quarter.focus === "string" && quarter.focus.length > 24, `${quarter.id} needs a concrete focus`);
      ensure(Array.isArray(quarter.primaryLanes) && quarter.primaryLanes.length >= 3, `${quarter.id} must assign at least three lanes`);
      for (const lane of quarter.primaryLanes || []) {
        ensure(laneIds.has(lane), `${quarter.id} references unknown lane ${lane}`);
      }
      ensure(Array.isArray(quarter.outcomes) && quarter.outcomes.length >= 3, `${quarter.id} must include at least three outcomes`);
      ensure(Array.isArray(quarter.gates) && quarter.gates.length >= 4, `${quarter.id} must include at least four gates`);
    }
  }
  ensure(quarterIds.size === 20, "plan must contain 20 unique quarter records");
}

for (const required of [
  "# SEIS Sub-Agent Long-Horizon Audit",
  "Sub-Agent Used",
  "5-Year Gap",
  "Safe Changes",
  "Validation"
]) {
  ensure(review.includes(required), `review missing section marker: ${required}`);
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-sub-agent-5-year-plan"] === "node scripts/check-sub-agent-5-year-plan.mjs",
    "package.json must expose check:seis-sub-agent-5-year-plan"
  );
  ensure(
    packageJson.scripts?.["check:seis-sub-agent-five-year-demo-evidence"] === "node scripts/create-sub-agent-five-year-demo-evidence.mjs --check",
    "package.json must expose check:seis-sub-agent-five-year-demo-evidence"
  );
  ensure(
    packageJson.scripts?.["demo:seis-sub-agent-five-year"] === "node scripts/run-sub-agent-five-year-demo.mjs",
    "package.json must expose demo:seis-sub-agent-five-year"
  );
  ensure(
    packageJson.scripts?.["check:seis-sub-agent-five-year-demo-run"] === "node scripts/run-sub-agent-five-year-demo.mjs --check",
    "package.json must expose check:seis-sub-agent-five-year-demo-run"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-sub-agent-5-year-plan"),
    "quality:governance must include check:seis-sub-agent-5-year-plan"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-sub-agent-five-year-demo-run"),
    "quality:governance must include check:seis-sub-agent-five-year-demo-run"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-sub-agent-five-year-demo-evidence"),
    "quality:governance must include check:seis-sub-agent-five-year-demo-evidence"
  );
}

for (const required of [
  "reports/seis-sub-agent-five-year-demo-evidence.json",
  "reports/seis-sub-agent-five-year-demo-evidence.md",
  "apps/seis-demo-web/data/seis-ai-core-version-promotion-map.json",
  "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json",
  "content/development/seis-ai-core-version-registry.json",
  "content/development/seis-ai-core-version-promotion-gates.json",
  "deterministic-plan-simulation",
  "local-demo-only",
  "promotionDryRunDecision",
  "promotionValidationCommands",
  "--check"
]) {
  ensure(evidenceScript.includes(required), `evidence generator missing marker: ${required}`);
}

for (const required of [
  "reports/seis-sub-agent-five-year-demo-run.json",
  "reports/seis-sub-agent-five-year-demo-run.md",
  "deterministic-cli-dry-run",
  "local-demo-only",
  "cancelledPrivilegedActions",
  "realElapsedFiveYears",
  "externalMutationPerformed",
  "credentialAccessPerformed",
  "sshExecutionPerformed",
  "deploymentPerformed",
  "npm run demo:seis-sub-agent-five-year",
  "npm run check:seis-sub-agent-five-year-demo-run",
  "--check"
]) {
  ensure(runScript.includes(required), `CLI dry-run script missing marker: ${required}`);
}

if (evidenceReport) {
  ensure(evidenceReport.id === "seis-sub-agent-five-year-demo-evidence", "evidence report id mismatch");
  ensure(evidenceReport.status === "repo-local-demo-evidence", "evidence report status mismatch");
  ensure(evidenceReport.mode === "deterministic-plan-simulation", "evidence report mode mismatch");
  ensure(evidenceReport.demoBoundary === "local-demo-only", "evidence report must keep local-demo-only boundary");
  ensure(evidenceReport.sourcePlan === "content/development/seis-sub-agent-5-year-plan.json", "evidence report source plan mismatch");
  ensure(
    evidenceReport.seisSubAgentPlanView === "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json",
    "evidence report must link the generated demo plan view"
  );
  ensure(
    evidenceReport.seisAiCoreVersionRegistry === "content/development/seis-ai-core-version-registry.json",
    "evidence report must link the AI Core version registry"
  );
  ensure(
    evidenceReport.seisAiCoreVersionPromotionGates === "content/development/seis-ai-core-version-promotion-gates.json",
    "evidence report must link the AI Core version promotion gates"
  );
  ensure(
    evidenceReport.seisAiCoreMcpRuntimeContract === "content/development/seis-ai-core-mcp-runtime-contract.json",
    "evidence report must link the AI Core MCP runtime contract"
  );
  ensure(
    evidenceReport.seisAiCoreProviderRegistry === "content/development/seis-ai-core-provider-registry.json",
    "evidence report must link the AI Core provider registry"
  );
  ensure(evidenceReport.quarterCount === 20, "evidence report must cover 20 quarters");
  ensure(evidenceReport.recordedQuarterCount === 20, "evidence report must record 20 quarters");
  ensure(evidenceReport.completionPercent === 100, "evidence report must show 100% deterministic demo completion");
  ensure(evidenceReport.versionTargetCount === 5, "evidence report must include five AI Core version targets");
  ensure(evidenceReport.promotionGateCount === 5, "evidence report must include five AI Core promotion gates");
  ensure(evidenceReport.mcpRuntimeToolCount === 34, "evidence report must include 34 MCP tools");
  ensure(evidenceReport.mcpRuntimeResourceCount === 27, "evidence report must include 27 MCP resources");
  ensure(evidenceReport.mcpRuntimePromptCount === 3, "evidence report must include 3 MCP prompts");
  ensure(evidenceReport.providerRegistryProviderCount >= 7, "evidence report must include provider registry provider count");
  ensure(evidenceReport.providerRegistryRequiredForCoreCount === 0, "evidence report must keep provider registry core key count at zero");
  ensure(
    evidenceReport.mcpRuntimeContract?.resourceUri === "seis://ai/mcp-runtime-contract.json",
    "evidence report must include the MCP runtime contract resource URI"
  );
  ensure(evidenceReport.dryRunOnly === true, "evidence report must preserve dry-run-only promotion boundary");
  ensure(evidenceReport.releasePromotionAllowed === false, "evidence report must not allow release promotion");
  ensure(Array.isArray(evidenceReport.versionTargets) && evidenceReport.versionTargets.length === 5, "evidence report must include version target summary");
  ensure(Array.isArray(evidenceReport.records) && evidenceReport.records.length === 20, "evidence report must include 20 records");
  ensure(Array.isArray(evidenceReport.laneCoverage) && evidenceReport.laneCoverage.length >= 6, "evidence report must include lane coverage");
  ensure(evidenceReport.validation?.includes("npm run check:seis-sub-agent-five-year-demo-evidence"), "evidence report must include its check command");
  ensure(evidenceReport.validation?.includes("npm run check:seis-ai-core-version-registry"), "evidence report must include AI Core version registry check");
  ensure(
    evidenceReport.validation?.includes("npm run check:seis-ai-core-version-promotion-gates"),
    "evidence report must include AI Core version promotion gate check"
  );
  ensure(
    typeof evidenceReport.truthBoundary === "string" && evidenceReport.truthBoundary.includes("does not prove real five-year autonomous execution"),
    "evidence report must declare the real-execution truth boundary"
  );

  for (const record of evidenceReport.records || []) {
    ensure(/^v(0\.[1-4]|1\.0)-/.test(record.aiCoreVersionTarget), `${record.sourcePlanQuarter} missing AI Core version target`);
    ensure(
      ["eligible-for-internal-review", "blocked-until-evidence", "blocked-human-approval", "not-ready"].includes(record.promotionDryRunDecision),
      `${record.sourcePlanQuarter} has invalid promotion dry-run decision`
    );
    ensure(record.promotionReleaseAllowed === false, `${record.sourcePlanQuarter} must not allow release promotion`);
    ensure(record.realExecutionBlocked === true, `${record.sourcePlanQuarter} must block real execution`);
    ensure(record.externalMutationPerformed === false, `${record.sourcePlanQuarter} must not perform external mutation`);
    ensure(record.credentialAccessPerformed === false, `${record.sourcePlanQuarter} must not access credentials`);
    ensure(
      Array.isArray(record.promotionEvidenceRequired) && record.promotionEvidenceRequired.length >= 5,
      `${record.sourcePlanQuarter} must include promotion evidence requirements`
    );
    ensure(
      Array.isArray(record.promotionValidationCommands) && record.promotionValidationCommands.length >= 2,
      `${record.sourcePlanQuarter} must include promotion validation commands`
    );
    ensure(
      typeof record.promotionNextSafeAction === "string" && record.promotionNextSafeAction.length > 24,
      `${record.sourcePlanQuarter} must include a concrete promotion next safe action`
    );
  }
}

if (demoPromotionMap) {
  ensure(demoPromotionMap.id === "seis-ai-core-version-promotion-map", "demo promotion map id mismatch");
  ensure(demoPromotionMap.status === "generated-from-source", "demo promotion map must be generated from source");
  ensure(demoPromotionMap.sourcePlan === "content/development/seis-sub-agent-5-year-plan.json", "demo promotion map source plan mismatch");
  ensure(
    demoPromotionMap.seisAiCoreVersionRegistry === "content/development/seis-ai-core-version-registry.json",
    "demo promotion map must link the AI Core version registry"
  );
  ensure(
    demoPromotionMap.seisAiCoreVersionPromotionGates === "content/development/seis-ai-core-version-promotion-gates.json",
    "demo promotion map must link the AI Core version promotion gates"
  );
  ensure(demoPromotionMap.versionTargetCount === 5, "demo promotion map must include five version targets");
  ensure(demoPromotionMap.promotionGateCount === 5, "demo promotion map must include five promotion gates");
  ensure(demoPromotionMap.dryRunOnly === true, "demo promotion map must remain dry-run only");
  ensure(demoPromotionMap.releasePromotionAllowed === false, "demo promotion map must not allow release promotion");
  ensure(
    demoPromotionMap.versionTargets?.[0]?.versionTarget === "v0.1-foundation",
    "demo promotion map first target must be v0.1-foundation"
  );
  ensure(
    demoPromotionMap.versionTargets?.[4]?.versionTarget === "v1.0-public-enterprise-candidate",
    "demo promotion map fifth target must be v1.0-public-enterprise-candidate"
  );
}

if (demoPlanView) {
  ensure(demoPlanView.id === "seis-sub-agent-five-year-plan-view", "demo plan view id mismatch");
  ensure(demoPlanView.status === "generated-from-source", "demo plan view must be generated from source");
  ensure(demoPlanView.sourcePlan === "content/development/seis-sub-agent-5-year-plan.json", "demo plan view source plan mismatch");
  ensure(demoPlanView.demoBoundary === "local-demo-only", "demo plan view must keep local-demo-only boundary");
  ensure(demoPlanView.releasePromotionAllowed === false, "demo plan view must not allow release promotion");
  ensure(demoPlanView.writerPolicy === "single-writer", "demo plan view must preserve single-writer policy");
  ensure(demoPlanView.defaultWriter === "codex", "demo plan view must preserve Codex default writer");
  ensure(Array.isArray(demoPlanView.forbiddenAutonomy) && demoPlanView.forbiddenAutonomy.includes("deploy"), "demo plan view must forbid deploy");
  ensure(Array.isArray(demoPlanView.requiredControls) && demoPlanView.requiredControls.length >= 5, "demo plan view must include required controls");
  ensure(demoPlanView.yearCount === 5, "demo plan view must cover five years");
  ensure(demoPlanView.quarterCount === 20, "demo plan view must cover 20 quarters");
  ensure(demoPlanView.laneCount >= 6, "demo plan view must include at least six lanes");
  ensure(demoPlanView.mcpRuntimeResourceCount === 27, "demo plan view must include 27 MCP resources");
  ensure(
    demoPlanView.seisAiCoreProviderRegistry === "content/development/seis-ai-core-provider-registry.json",
    "demo plan view must link the AI Core provider registry"
  );
  ensure(
    demoPlanView.mcpRuntimeContract?.sourcePath === "content/development/seis-ai-core-mcp-runtime-contract.json",
    "demo plan view must include the MCP runtime source path"
  );
  ensure(Array.isArray(demoPlanView.lanes) && demoPlanView.lanes.every((lane) => lane.label && lane.authority), "demo plan view lanes need labels and authority");
  ensure(Array.isArray(demoPlanView.years) && demoPlanView.years.length === 5, "demo plan view must include five year groups");
  ensure(demoPlanView.years?.[0]?.quarters?.[0]?.id === "Y1-Q1", "demo plan view first quarter mismatch");
  ensure(demoPlanView.years?.[4]?.quarters?.[3]?.id === "Y5-Q4", "demo plan view final quarter mismatch");
  for (const year of demoPlanView.years || []) {
    ensure(Array.isArray(year.quarters) && year.quarters.length === 4, `demo plan view year ${year.year} must contain four quarters`);
    for (const quarter of year.quarters || []) {
      ensure(Array.isArray(quarter.lanes) && quarter.lanes.length >= 3, `demo plan view ${quarter.id} must include lanes`);
      ensure(Array.isArray(quarter.outcomes) && quarter.outcomes.length >= 3, `demo plan view ${quarter.id} must include outcomes`);
      ensure(Array.isArray(quarter.gates) && quarter.gates.length >= 4, `demo plan view ${quarter.id} must include gates`);
    }
  }
}

if (runReport) {
  ensure(runReport.id === "seis-sub-agent-five-year-demo-run", "CLI run report id mismatch");
  ensure(runReport.status === "repo-local-dry-run-complete", "CLI run report status mismatch");
  ensure(runReport.mode === "deterministic-cli-dry-run", "CLI run report mode mismatch");
  ensure(runReport.demoBoundary === "local-demo-only", "CLI run report must keep local-demo-only boundary");
  ensure(runReport.sourcePlan === "content/development/seis-sub-agent-5-year-plan.json", "CLI run report source plan mismatch");
  ensure(runReport.quarterCount === 20, "CLI run report must cover 20 quarters");
  ensure(runReport.recordedStepCount === 20, "CLI run report must record 20 steps");
  ensure(runReport.completionPercent === 100, "CLI run report must show 100% completion");
  ensure(runReport.dryRunOnly === true, "CLI run report must preserve dry-run-only boundary");
  ensure(runReport.realElapsedFiveYears === false, "CLI run report must not claim real elapsed five years");
  ensure(runReport.externalMutationPerformed === false, "CLI run report must not perform external mutation");
  ensure(runReport.credentialAccessPerformed === false, "CLI run report must not access credentials");
  ensure(runReport.gitHubWritePerformed === false, "CLI run report must not perform GitHub writes");
  ensure(runReport.sshExecutionPerformed === false, "CLI run report must not perform SSH execution");
  ensure(runReport.deploymentPerformed === false, "CLI run report must not deploy");
  ensure(runReport.releasePromotionAllowed === false, "CLI run report must not allow release promotion");
  ensure(Array.isArray(runReport.steps) && runReport.steps.length === 20, "CLI run report must include 20 steps");
  ensure(Array.isArray(runReport.cancelledPrivilegedActions) && runReport.cancelledPrivilegedActions.includes("deploy"), "CLI run report must cancel privileged deploy actions");
  ensure(runReport.validation?.includes("npm run check:seis-sub-agent-five-year-demo-run"), "CLI run report must include its check command");
  ensure(
    typeof runReport.truthBoundary === "string" && runReport.truthBoundary.includes("does not prove real elapsed five-year autonomous execution"),
    "CLI run report must declare the elapsed-time truth boundary"
  );

  for (const step of runReport.steps || []) {
    ensure(/^Y[1-5]-Q[1-4]$/.test(step.quarterId), `${step.id} has invalid quarter id`);
    ensure(Array.isArray(step.actions) && step.actions.length >= 3, `${step.quarterId} must include at least three lane actions`);
    ensure(Array.isArray(step.gateChecks) && step.gateChecks.length >= 6, `${step.quarterId} must include quarter and promotion gate checks`);
    ensure(step.dryRunOnly === true, `${step.quarterId} must be dry-run-only`);
    ensure(step.realElapsedFiveYears === false, `${step.quarterId} must not claim real elapsed five years`);
    ensure(step.externalMutationPerformed === false, `${step.quarterId} must not perform external mutation`);
    ensure(step.credentialAccessPerformed === false, `${step.quarterId} must not access credentials`);
    ensure(step.gitHubWritePerformed === false, `${step.quarterId} must not perform GitHub writes`);
    ensure(step.sshExecutionPerformed === false, `${step.quarterId} must not perform SSH execution`);
    ensure(step.deploymentPerformed === false, `${step.quarterId} must not deploy`);
  }
}

for (const required of [
  "# SEIS Sub-Agent Five-Year Demo Evidence",
  "deterministic repository-local evidence artifact",
  "Recorded quarters: 20/20",
  "AI Core Version Promotion Map",
  "MCP Runtime Contract",
  "content/development/seis-ai-core-mcp-runtime-contract.json",
  "Demo plan view: apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json",
  "v0.1-foundation",
  "blocked-human-approval",
  "does not prove real five-year autonomous execution",
  "npm run check:seis-sub-agent-five-year-demo-evidence"
]) {
  ensure(evidenceReportMarkdown.includes(required), `evidence report markdown missing marker: ${required}`);
}

for (const required of [
  "# SEIS Sub-Agent Five-Year CLI Demo Run",
  "terminal-runnable, deterministic dry-run transcript",
  "Recorded steps: 20/20",
  "Simulated Terminal Transcript",
  "result dry-run-complete external-mutations=0 credentials=0 deployments=0 github-writes=0 ssh-executions=0",
  "does not prove real elapsed five-year autonomous execution",
  "npm run check:seis-sub-agent-five-year-demo-run"
]) {
  ensure(runReportMarkdown.includes(required), `CLI run report markdown missing marker: ${required}`);
}

for (const required of [
  "seis-hero-3d-canvas",
  "seis-hero-3d-status",
  "seis-hero-3d-rotate",
  "seis-hero-3d-sync",
  "seis-hero-3d-pause",
  "seis-hero-3d-version",
  "hero-visual",
  "sub-agent-plan-panel",
  "sub-agent-plan-grid",
  "sub-agent-quarter-list",
  "sub-agent-quarter-detail",
  "sub-agent-run-ledger",
  "sub-agent-run-list",
  "sub-agent-run-full-demo",
  "sub-agent-version-map",
  "sub-agent-version-map-title",
  "sub-agent-export-evidence",
  "sub-agent-export-status",
  "sub-agent-reset-demo",
  "Dry-run 5 years",
  "Export evidence JSON",
  "Run demo pulse"
]) {
  ensure(webIndex.includes(required), `web demo missing sub-agent panel marker: ${required}`);
}

for (const required of [
  "SUB_AGENT_DEMO_PLAN",
  "SUB_AGENT_DEMO_PLAN_CONFIG",
  "hero3dStorageKey",
  "initHero3dMap",
  "drawHero3dScene",
  "buildHero3dGraph",
  "recordHero3dInteraction",
  "hero3dDiagnostics",
  "requestAnimationFrame",
  "hero3dCanvas.dataset.hero3dReady",
  "content/development/seis-sub-agent-5-year-plan.json",
  "content/development/seis-ai-core-version-registry.json",
  "content/development/seis-ai-core-version-promotion-gates.json",
  "data/seis-sub-agent-five-year-plan-view.json",
  "data/seis-ai-core-version-promotion-map.json",
  "loadSubAgentPlanView",
  "loadSubAgentVersionPromotionMap",
  "planViewStatus",
  "currentSubAgentVersionTargets",
  "versionTargets",
  "subAgentVersionTargetForYear",
  "renderSubAgentVersionMap",
  "seis_demo_sub_agent_version_map_viewed",
  "aiCoreVersionTarget",
  "promotionDryRunDecision",
  "subAgentQuarterStorageKey",
  "subAgentRunStorageKey",
  "subAgentEvidenceStorageKey",
  "renderSubAgentPlan",
  "renderSubAgentRunLedger",
  "selectSubAgentQuarter",
  "runSubAgentDemoPulse",
  "runSubAgentFullDemo",
  "createSubAgentEvidenceReport",
  "exportSubAgentEvidenceReport",
  "recordSubAgentDemoPulse",
  "seis_demo_sub_agent_plan_viewed",
  "seis_demo_sub_agent_quarter_selected",
  "seis_demo_sub_agent_pulse_recorded",
  "seis_demo_sub_agent_ledger_reset",
  "seis_demo_sub_agent_full_run_recorded",
  "seis_demo_sub_agent_evidence_exported",
  "seis_demo_ai_core_3d_interacted",
  "demoBoundary: \"local-demo-only\""
]) {
  ensure(webScript.includes(required), `web demo script missing sub-agent marker: ${required}`);
}

for (const required of [
  ".hero-visual",
  ".hero-visual-toolbar",
  "#seis-hero-3d-canvas",
  ".hero-visual-panel",
  ".sub-agent-plan-panel",
  ".sub-agent-plan-grid",
  ".sub-agent-quarter-shell",
  ".sub-agent-quarter-list",
  ".sub-agent-quarter-detail",
  ".sub-agent-version-map",
  ".sub-agent-version-card",
  ".sub-agent-run-ledger",
  ".sub-agent-run-list",
  ".sub-agent-export-status"
]) {
  ensure(webStyle.includes(required), `web demo styles missing sub-agent marker: ${required}`);
}

for (const contract of [
  ["web", webContract],
  ["native", nativeContract]
]) {
  const [label, value] = contract;
  const events = new Set((value?.analytics_events || []).map((event) => event.name));
  ensure(events.has("seis_demo_sub_agent_plan_viewed"), `${label} contract missing sub-agent plan viewed event`);
  ensure(events.has("seis_demo_sub_agent_version_map_viewed"), `${label} contract missing sub-agent version map viewed event`);
  ensure(events.has("seis_demo_sub_agent_quarter_selected"), `${label} contract missing sub-agent quarter selected event`);
  ensure(events.has("seis_demo_sub_agent_pulse_recorded"), `${label} contract missing sub-agent pulse recorded event`);
  ensure(events.has("seis_demo_sub_agent_ledger_reset"), `${label} contract missing sub-agent ledger reset event`);
  ensure(events.has("seis_demo_sub_agent_full_run_recorded"), `${label} contract missing sub-agent full run recorded event`);
  ensure(events.has("seis_demo_sub_agent_evidence_exported"), `${label} contract missing sub-agent evidence exported event`);
  ensure(events.has("seis_demo_ai_core_3d_interacted"), `${label} contract missing AI Core 3D interaction event`);
}

if (failures.length) {
  console.error("Sub-agent 5-year plan check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sub-agent 5-year plan check passed.");
