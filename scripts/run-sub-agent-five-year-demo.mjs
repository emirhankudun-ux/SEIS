import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const planRelativePath = "content/development/seis-sub-agent-5-year-plan.json";
const versionRegistryRelativePath = "content/development/seis-ai-core-version-registry.json";
const promotionGatesRelativePath = "content/development/seis-ai-core-version-promotion-gates.json";
const runJsonRelativePath = "reports/seis-sub-agent-five-year-demo-run.json";
const runMdRelativePath = "reports/seis-sub-agent-five-year-demo-run.md";

const planPath = path.join(root, planRelativePath);
const versionRegistryPath = path.join(root, versionRegistryRelativePath);
const promotionGatesPath = path.join(root, promotionGatesRelativePath);
const runJsonPath = path.join(root, runJsonRelativePath);
const runMdPath = path.join(root, runMdRelativePath);
const checkOnly = process.argv.includes("--check");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function mapByYear(entries) {
  return new Map((entries || []).map((entry) => [entry.year, entry]));
}

function gateChecks(quarter, promotionGate) {
  return [
    ...(quarter.gates || []).map((gate) => ({
      id: gate,
      status: "passed-in-simulation",
      evidence: "documented-quarter-gate",
      scope: quarter.id
    })),
    ...(promotionGate?.validationCommands || []).map((command) => ({
      id: command,
      status: "scheduled-for-human-reviewed-validation",
      evidence: "promotion-gate-validation-command",
      scope: `year-${promotionGate.year}`
    }))
  ];
}

function laneAction(lane, quarter, promotionGate) {
  const actionByLane = {
    "architecture-agent": "Check module boundaries, version gates, and source-of-truth consistency.",
    "implementation-agent": "Prepare a bounded implementation slice and avoid unrelated worktree edits.",
    "security-agent": "Review forbidden autonomy, credential isolation, and approval requirements.",
    "documentation-agent": "Write current-versus-planned evidence and handoff notes.",
    "validation-agent": "Map required checks, smoke tests, and promotion evidence.",
    "design-agent": "Review operator UX clarity, accessibility, and demo truth labels."
  };

  return {
    laneId: lane.id,
    role: lane.role,
    authority: lane.defaultAuthority,
    wipLimit: lane.wipLimit,
    action: actionByLane[lane.id] || "Review assigned sub-agent lane.",
    output: `${quarter.id}: ${quarter.focus}`,
    promotionDecisionObserved: promotionGate?.dryRunDecision || "not-ready",
    externalMutationPerformed: false,
    credentialAccessPerformed: false,
    dryRunOnly: true
  };
}

function buildRun(plan, versionRegistry, promotionGates) {
  const lanesById = new Map((plan.lanes || []).map((lane) => [lane.id, lane]));
  const roadmapByYear = mapByYear(versionRegistry.fiveYearVersionRoadmap);
  const gatesByYear = mapByYear(promotionGates.gates);
  const steps = [];

  for (const year of plan.years || []) {
    const versionTarget = roadmapByYear.get(year.year);
    const promotionGate = gatesByYear.get(year.year);

    for (const quarter of year.quarters || []) {
      steps.push({
        sequence: steps.length + 1,
        id: `dry-run-${quarter.id.toLowerCase()}`,
        quarterId: quarter.id,
        year: year.year,
        theme: year.theme,
        focus: quarter.focus,
        aiCoreVersionTarget: versionTarget?.versionTarget || "unknown",
        aiCoreVersionTheme: versionTarget?.theme || "unknown",
        promotionGate: versionTarget?.promotionGate || "unknown",
        promotionGateStatus: promotionGate?.status || "unknown",
        promotionDryRunDecision: promotionGate?.dryRunDecision || "not-ready",
        promotionReleaseAllowed: promotionGate?.releasePromotionAllowed === true,
        promotionHumanApprovalRequired: promotionGate?.humanApprovalRequired !== false,
        primaryLanes: quarter.primaryLanes,
        actions: (quarter.primaryLanes || []).map((laneId) => laneAction(lanesById.get(laneId) || { id: laneId }, quarter, promotionGate)),
        outcomes: quarter.outcomes,
        gateChecks: gateChecks(quarter, promotionGate),
        dryRunOnly: true,
        realElapsedFiveYears: false,
        externalMutationPerformed: false,
        credentialAccessPerformed: false,
        gitHubWritePerformed: false,
        sshExecutionPerformed: false,
        deploymentPerformed: false
      });
    }
  }

  return {
    id: "seis-sub-agent-five-year-demo-run",
    version: 1,
    status: "repo-local-dry-run-complete",
    mode: "deterministic-cli-dry-run",
    generatedAt: "deterministic-plan-derived",
    generatedBy: "scripts/run-sub-agent-five-year-demo.mjs",
    sourcePlan: planRelativePath,
    seisAiCoreVersionRegistry: versionRegistryRelativePath,
    seisAiCoreVersionPromotionGates: promotionGatesRelativePath,
    demoBoundary: "local-demo-only",
    truthBoundary: "This CLI dry-run demonstrates all documented five-year sub-agent quarters. It does not prove real elapsed five-year autonomous execution.",
    writerPolicy: plan.governance?.writerPolicy || "single-writer",
    defaultWriter: plan.governance?.defaultWriter || "codex",
    forbiddenAutonomy: plan.governance?.forbiddenAutonomy || [],
    requiredControls: plan.governance?.requiredControls || [],
    dryRunOnly: true,
    realElapsedFiveYears: false,
    externalMutationPerformed: false,
    credentialAccessPerformed: false,
    gitHubWritePerformed: false,
    sshExecutionPerformed: false,
    deploymentPerformed: false,
    releasePromotionAllowed: false,
    terminalDemoCommands: [
      "npm run demo:seis-sub-agent-five-year",
      "npm run check:seis-sub-agent-five-year-demo-run"
    ],
    validation: [
      "node --check scripts/run-sub-agent-five-year-demo.mjs",
      "npm run demo:seis-sub-agent-five-year",
      "npm run check:seis-sub-agent-five-year-demo-run",
      "npm run check:seis-sub-agent-five-year-demo-evidence",
      "npm run check:seis-sub-agent-5-year-plan"
    ],
    yearCount: (plan.years || []).length,
    quarterCount: steps.length,
    recordedStepCount: steps.length,
    completionPercent: steps.length === 20 ? 100 : Math.round((steps.length / 20) * 100),
    laneCount: (plan.lanes || []).length,
    cancelledPrivilegedActions: [
      "merge",
      "push-to-main",
      "deploy",
      "secret-access",
      "ssh-execution",
      "history-rewrite",
      "provider-key-collection",
      "model-training",
      "public-visibility-change"
    ],
    steps
  };
}

function buildMarkdown(run) {
  const lines = [
    "# SEIS Sub-Agent Five-Year CLI Demo Run",
    "",
    "## Purpose",
    "",
    "Provide a terminal-runnable, deterministic dry-run transcript for the five-year sub-agent plan.",
    "",
    "## Current Status",
    "",
    `- Status: ${run.status}`,
    `- Mode: ${run.mode}`,
    `- Boundary: ${run.demoBoundary}`,
    `- Recorded steps: ${run.recordedStepCount}/${run.quarterCount}`,
    `- Completion: ${run.completionPercent}%`,
    `- Real elapsed five years: ${run.realElapsedFiveYears}`,
    `- Release promotion allowed: ${run.releasePromotionAllowed}`,
    "",
    run.truthBoundary,
    "",
    "## Terminal Commands",
    "",
    ...run.terminalDemoCommands.map((command) => `- \`${command}\``),
    "",
    "## Simulated Terminal Transcript",
    "",
    "```text",
    "seis-sub-agent-demo$ npm run demo:seis-sub-agent-five-year",
    `loaded ${run.sourcePlan}`,
    `mode ${run.mode}`,
    `boundary ${run.demoBoundary}`,
    `steps ${run.recordedStepCount}/${run.quarterCount}`,
    ...run.steps.map((step) => `${String(step.sequence).padStart(2, "0")} ${step.quarterId} year=${step.year} version=${step.aiCoreVersionTarget} lanes=${step.primaryLanes.join("+")} decision=${step.promotionDryRunDecision}`),
    "result dry-run-complete external-mutations=0 credentials=0 deployments=0 github-writes=0 ssh-executions=0",
    "```",
    "",
    "## Step Matrix",
    "",
    "| Step | Quarter | Year | Version Target | Decision | Lanes | Gate Checks |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...run.steps.map((step) => `| ${step.sequence} | ${step.quarterId} | ${step.year} | ${step.aiCoreVersionTarget} | ${step.promotionDryRunDecision} | ${step.primaryLanes.join(", ")} | ${step.gateChecks.length} |`),
    "",
    "## Safety Boundary",
    "",
    ...run.cancelledPrivilegedActions.map((action) => `- ${action}: cancelled/not performed`),
    "",
    "## Validation",
    "",
    ...run.validation.map((command) => `- \`${command}\``),
    "",
    "## Next Safe Action",
    "",
    "Keep this CLI run, the browser Local Demo, and the deterministic evidence report in sync before expanding sub-agent behavior beyond dry-run or review-only scopes.",
    ""
  ];

  return `${lines.join("\n")}\n`;
}

function ensureCurrent(filePath, expected) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing generated dry-run file: ${path.relative(root, filePath)}`);
  }
  const actual = fs.readFileSync(filePath, "utf8");
  if (actual !== expected) {
    throw new Error(`Generated dry-run file is stale: ${path.relative(root, filePath)}`);
  }
}

const plan = readJson(planPath);
const versionRegistry = readJson(versionRegistryPath);
const promotionGates = readJson(promotionGatesPath);
const run = buildRun(plan, versionRegistry, promotionGates);
const jsonOutput = stableJson(run);
const markdownOutput = buildMarkdown(run);

if (checkOnly) {
  ensureCurrent(runJsonPath, jsonOutput);
  ensureCurrent(runMdPath, markdownOutput);
  console.log("SEIS sub-agent five-year CLI demo run check passed.");
} else {
  fs.mkdirSync(path.dirname(runJsonPath), { recursive: true });
  fs.writeFileSync(runJsonPath, jsonOutput);
  fs.writeFileSync(runMdPath, markdownOutput);
  console.log(`Wrote ${path.relative(root, runJsonPath)}`);
  console.log(`Wrote ${path.relative(root, runMdPath)}`);
  console.log(`SEIS sub-agent five-year CLI dry-run recorded ${run.recordedStepCount}/${run.quarterCount} quarters.`);
  console.log("Boundary: local-demo-only; no external mutation, credential access, deployment, SSH execution, or GitHub write was performed.");
}
