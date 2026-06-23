import { existsSync, readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const files = {
  packageJson: "package.json",
  browserQaScript: "scripts/capture-seis-core-ai-core-panel-navigation.mjs",
  browserQaReport: "reports/evals/ai-core-panel-navigation-browser-qa.md",
  fixtureReportJson: "reports/evals/ai-core-fixture-evaluation-report.json",
  fixtureReportMarkdown: "reports/evals/ai-core-fixture-evaluation-report.md",
  fixtureReportGenerator: "scripts/create-ai-core-fixture-evaluation-report.mjs",
  commandCenterCheck: "scripts/check-seis-command-center.mjs",
  ciWorkflow: ".github/workflows/ci.yml",
  browserEvidenceWorkflow: ".github/workflows/ai-core-browser-evidence.yml",
  schema: "packages/evals/schemas/fixture-evaluation-report.schema.json",
  evalsReadme: "packages/evals/README.md",
  browserEvidenceGates: "docs/evals/ai-core-browser-evidence-gates.md",
  browserCiProposal: "docs/evals/ai-core-browser-ci-proposal.md",
  browserCiActivationApproval: "docs/evals/ai-core-browser-ci-activation-approval.md",
  browserCiWorkflowDraft: "docs/evals/ai-core-browser-ci-workflow-draft.md",
  browserCiDispatchReview: "docs/evals/ai-core-browser-workflow-dispatch-review.md",
  readme: "apps/seis-core/README.md",
  evaluationStrategy: "docs/evals/evaluation-strategy.md",
  roadmap: "roadmap/seis-ai-core-command-center-5-year-development-program.md",
  programReview: "docs/reviews/SEIS_5_YEAR_DEVELOPMENT_PROGRAM_REVIEW.md"
};

const requireArtifacts = process.argv.includes("--require-artifacts");
const artifactRoot = "reports/tmp/seis-core-ai-core-panel-navigation";
const manifestPath = `${artifactRoot}/manifest.json`;
const expectedScenarios = [
  {
    id: "desktop-ai-core-panel-navigation",
    viewport: { width: 1440, height: 900 }
  },
  {
    id: "mobile-ai-core-panel-navigation",
    viewport: { width: 390, height: 844 }
  }
];
const expectedSteps = ["initial-dashboard", "sidebar-ai-core", "command-palette-ai-core", "global-search-ai-core"];
const requiredPanelMinimums = {
  summaryCards: 10,
  boundaryCards: 6,
  routeCards: 4,
  promptCards: 2,
  agentTaskCards: 5,
  approvalCards: 5,
  retrievalAdapterCards: 2,
  retrievalResultCards: 3,
  noContentTranscriptCards: 2,
  evidenceCards: 10
};

const failures = [];
const secretPatterns = [
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])ghp_[A-Za-z0-9_]{20,}/,
  /(^|[^A-Za-z0-9_])gho_[A-Za-z0-9_]{20,}/,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /id_ed25519/,
  /id_rsa/,
  /\/Users\//
];

function fail(message) {
  failures.push(message);
}

function readText(filePath, options = {}) {
  if (!existsSync(filePath)) {
    fail(`missing ${filePath}`);
    return "";
  }

  const text = readFileSync(filePath, "utf8");
  if (options.scanSecrets !== false) {
    for (const pattern of secretPatterns) {
      if (pattern.test(text)) {
        fail(`${filePath} contains disallowed sensitive or machine-specific pattern: ${pattern}`);
      }
    }
  }

  return text;
}

function readJson(filePath) {
  const text = readText(filePath);
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${filePath}: ${error.message}`);
    return {};
  }
}

function includesAll(label, text, requiredItems) {
  for (const requiredItem of requiredItems) {
    if (!text.includes(requiredItem)) {
      fail(`${label} missing required text: ${requiredItem}`);
    }
  }
}

function lowerIncludesAll(label, text, requiredItems) {
  const normalized = text.toLowerCase();
  for (const requiredItem of requiredItems) {
    if (!normalized.includes(requiredItem.toLowerCase())) {
      fail(`${label} missing required text: ${requiredItem}`);
    }
  }
}

function ensurePanelCounts(label, panels) {
  for (const [key, minimum] of Object.entries(requiredPanelMinimums)) {
    if (!Number.isInteger(panels?.[key]) || panels[key] < minimum) {
      fail(`${label} must report ${key} >= ${minimum}`);
    }
  }
}

function ensureScenarioSteps(label, steps) {
  const actualSteps = (steps || []).map((step) => step.step);
  if (actualSteps.join(",") !== expectedSteps.join(",")) {
    fail(`${label} must report steps ${expectedSteps.join(",")}; got ${actualSteps.join(",")}`);
  }

  for (const step of steps || []) {
    if (step.step === "initial-dashboard") {
      if (step.activeView !== "dashboard" || step.activeNav !== "dashboard") {
        fail(`${label} initial dashboard step must keep dashboard active`);
      }
    } else if (step.activeView !== "ai-core" || step.activeNav !== "ai-core" || !String(step.viewTitle || "").includes("AI Core")) {
      fail(`${label} step ${step.step} must activate the AI Core view`);
    }
  }
}

function validateArtifacts() {
  if (!existsSync(manifestPath)) {
    if (requireArtifacts) {
      fail(`missing browser QA artifact manifest: ${manifestPath}`);
    }
    return;
  }

  const manifest = readJson(manifestPath);
  if (manifest.id !== "seis-core-ai-core-browser-panel-navigation-qa") {
    fail("browser QA manifest id must identify the AI Core panel navigation QA");
  }

  if (manifest.app !== "apps/seis-core") {
    fail("browser QA manifest app must be apps/seis-core");
  }

  if (manifest.artifactRoot !== artifactRoot) {
    fail(`browser QA manifest artifactRoot must be ${artifactRoot}`);
  }

  for (const expectedScenario of expectedScenarios) {
    const scenario = (manifest.scenarios || []).find((item) => item.id === expectedScenario.id);
    if (!scenario) {
      fail(`browser QA manifest missing scenario: ${expectedScenario.id}`);
      continue;
    }

    if (scenario.viewport?.width !== expectedScenario.viewport.width || scenario.viewport?.height !== expectedScenario.viewport.height) {
      fail(`${expectedScenario.id} viewport must remain ${expectedScenario.viewport.width}x${expectedScenario.viewport.height}`);
    }

    ensureScenarioSteps(`${expectedScenario.id} manifest`, scenario.steps);
    ensurePanelCounts(`${expectedScenario.id} manifest`, scenario.panels);

    if (scenario.domDump !== `${artifactRoot}/${expectedScenario.id}.html`) {
      fail(`${expectedScenario.id} manifest domDump path is not stable`);
    }

    if (scenario.report !== `${artifactRoot}/${expectedScenario.id}.json`) {
      fail(`${expectedScenario.id} manifest report path is not stable`);
    }

    const report = readJson(scenario.report);
    if (report.id !== "ai-core-browser-panel-navigation-qa" || report.status !== "passed") {
      fail(`${expectedScenario.id} artifact report must be a passed AI Core browser panel navigation report`);
    }

    ensureScenarioSteps(`${expectedScenario.id} artifact report`, report.steps);
    ensurePanelCounts(`${expectedScenario.id} artifact report`, report.panels);

    for (const [key, value] of Object.entries({
      providerCallPerformed: false,
      rawContentReturned: false,
      persistentMemoryWrite: false,
      privilegedActionEnabled: false
    })) {
      if (report.safety?.[key] !== value) {
        fail(`${expectedScenario.id} artifact safety.${key} must be ${value}`);
      }
    }
  }

  lowerIncludesAll("browser QA manifest non-claims", (manifest.nonClaims || []).join("\n"), [
    "not live provider",
    "No live retrieval",
    "persistent memory write",
    "raw-content return",
    "GitHub write",
    "SSH",
    "deployment",
    "payment",
    "infrastructure mutation"
  ]);
}

const packageJson = readJson(files.packageJson);
const browserQaScript = readText(files.browserQaScript);
const browserQaReport = readText(files.browserQaReport);
const fixtureReport = readJson(files.fixtureReportJson);
const fixtureReportMarkdown = readText(files.fixtureReportMarkdown);
const fixtureReportGenerator = readText(files.fixtureReportGenerator, { scanSecrets: false });
const commandCenterCheck = readText(files.commandCenterCheck, { scanSecrets: false });
const ciWorkflow = readText(files.ciWorkflow, { scanSecrets: false });
const browserEvidenceWorkflow = readText(files.browserEvidenceWorkflow, { scanSecrets: false });
const schema = readText(files.schema);
const evalsReadme = readText(files.evalsReadme);
const browserEvidenceGates = readText(files.browserEvidenceGates);
const browserCiProposal = readText(files.browserCiProposal);
const browserCiActivationApproval = readText(files.browserCiActivationApproval);
const browserCiWorkflowDraft = readText(files.browserCiWorkflowDraft);
const browserCiDispatchReview = readText(files.browserCiDispatchReview);
const readme = readText(files.readme);
const evaluationStrategy = readText(files.evaluationStrategy);
const roadmap = readText(files.roadmap);
const programReview = readText(files.programReview);

if (packageJson.scripts?.["qa:seis-core:ai-core-panels"] !== "node scripts/capture-seis-core-ai-core-panel-navigation.mjs") {
  fail("package.json must expose qa:seis-core:ai-core-panels with the browser QA script");
}

if (
  packageJson.scripts?.["qa:seis-core:ai-core-evidence"] !==
  "npm run qa:seis-core:ai-core-panels && npm run check:ai-core-browser-qa-evidence -- --require-artifacts"
) {
  fail("package.json must expose qa:seis-core:ai-core-evidence as browser run plus artifact evidence check");
}

if (packageJson.scripts?.["check:ai-core-browser-qa-evidence"] !== "node scripts/check-ai-core-browser-qa-evidence.mjs") {
  fail("package.json must expose check:ai-core-browser-qa-evidence");
}

const fixtureReportFreshnessCheck = spawnSync("node", ["scripts/create-ai-core-fixture-evaluation-report.mjs", "--check"], {
  encoding: "utf8"
});
if (fixtureReportFreshnessCheck.status !== 0) {
  fail("fixture evaluation report must be fresh; run npm run automation:ai-core-fixture-evaluation-report");
}

includesAll("AI Core browser QA script", browserQaScript, [
  "desktop-ai-core-panel-navigation",
  "mobile-ai-core-panel-navigation",
  "outputRootRelative",
  "reports/tmp/seis-core-ai-core-panel-navigation",
  "qa-ai-core-panel-navigation-report",
  "sidebar-ai-core",
  "command-palette-ai-core",
  "global-search-ai-core",
  "providerCallPerformed: false",
  "rawContentReturned: false",
  "persistentMemoryWrite: false",
  "privilegedActionEnabled: false",
  "assertAiCorePanels",
  "Local Retrieval default status"
]);

lowerIncludesAll("AI Core browser QA report", browserQaReport, [
  "Browser-run AI Core panel navigation QA evidence",
  "npm run qa:seis-core:ai-core-panels",
  "npm run qa:seis-core:ai-core-evidence",
  "reports/tmp/seis-core-ai-core-panel-navigation/",
  "Desktop AI Core panel navigation",
  "Mobile AI Core panel navigation",
  "sidebar navigation",
  "command palette",
  "global search",
  "Model Routes",
  "Prompt Versions",
  "Agent Tasks",
  "Approvals",
  "Evaluation/Evidence",
  "Local Retrieval",
  "No provider key marker",
  "Non-Claims",
  "npm run check:ai-core-browser-qa-evidence"
]);

lowerIncludesAll("AI Core browser evidence gates doc", browserEvidenceGates, [
  "Metadata drift gate",
  "Aggregate metadata gate",
  "Browser artifact gate",
  "CI Policy",
  "Local Browser Policy",
  "npm run check:ai-core-browser-qa-evidence",
  "npm run check:ai-core-eval-evidence",
  "npm run qa:seis-core:ai-core-evidence",
  "SEIS_BROWSER_BIN",
  "reports/tmp/seis-core-ai-core-panel-navigation/",
  "desktop-ai-core-panel-navigation",
  "mobile-ai-core-panel-navigation",
  "initial-dashboard",
  "sidebar-ai-core",
  "command-palette-ai-core",
  "global-search-ai-core",
  "provider calls",
  "raw-content return",
  "persistent memory writes",
  "GitHub writes",
  "SSH",
  "deployment",
  "payment",
  "infrastructure mutation"
]);

lowerIncludesAll("AI Core browser CI proposal", browserCiProposal, [
  "AI Core Browser CI Proposal",
  "docs/evals/ai-core-browser-ci-activation-approval.md",
  "docs/evals/ai-core-browser-ci-workflow-draft.md",
  "browser-run AI Core QA evidence",
  "GitHub Actions",
  "does not enable",
  "Chrome/Chromium",
  "SEIS_BROWSER_BIN",
  "npm run check:ai-core-browser-qa-evidence",
  "npm run check:ai-core-eval-evidence",
  "npm run qa:seis-core:ai-core-evidence",
  "reports/tmp/seis-core-ai-core-panel-navigation/",
  "timeout",
  "artifact",
  "provider-free",
  "SSH",
  "deployment",
  "payment",
  "infrastructure mutation",
  "metadata-only",
  "future CI change"
]);

lowerIncludesAll("AI Core browser CI activation approval", browserCiActivationApproval, [
  "AI Core Browser CI Activation Approval Packet",
  "human approval boundary",
  "active manual workflow",
  "planning evidence only",
  "not browser QA pass evidence",
  "not a branch-protection approval",
  ".github/workflows/ai-core-browser-evidence.yml",
  "npm run qa:seis-core:ai-core-evidence",
  "npm run check:ai-core-eval-evidence",
  "actions/upload-artifact",
  "approved pinned SHA",
  "Chrome/Chromium",
  "SEIS_BROWSER_BIN",
  "SEIS_DATA_MODE=mock",
  "SEIS_PRIVACY_MODE=local-only",
  "workflow_dispatch",
  "contents permission",
  "metadata-only",
  "reports/tmp/seis-core-ai-core-panel-navigation/",
  "7 days or less",
  "fail-closed",
  "retention",
  "rollback plan",
  "provider-free",
  "SSH-free",
  "deployment-free",
  "payment-free",
  "infrastructure-mutation-free",
  "secret-free",
  "local-only",
  "mock-data-only",
  "live provider routing",
  "live retrieval",
  "backend integration",
  "cross-browser certification",
  "benchmark performance",
  "model safety",
  "SEIS-owned model training",
  "checkpoint validity",
  "deployment readiness",
  "production availability"
]);

for (const [label, text] of [
  ["AI Core browser CI proposal", browserCiProposal],
  ["AI Core browser CI workflow draft", browserCiWorkflowDraft],
  ["AI Core browser evidence gates doc", browserEvidenceGates],
  ["evals package README", evalsReadme],
  ["evaluation strategy", evaluationStrategy],
  ["five-year roadmap", roadmap],
  ["five-year review", programReview]
]) {
  lowerIncludesAll(`${label} activation approval link`, text, [
    "docs/evals/ai-core-browser-ci-activation-approval.md"
  ]);
}

lowerIncludesAll("AI Core browser CI workflow draft", browserCiWorkflowDraft, [
  "AI Core Browser CI Workflow Draft",
  "review-only",
  "not an active workflow",
  "workflow_dispatch",
  "permissions:",
  "contents: read",
  "timeout-minutes: 8",
  "SEIS_BROWSER_BIN",
  "SEIS_DATA_MODE: mock",
  "SEIS_PRIVACY_MODE: local-only",
  "actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10",
  "actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
  "test -x \"$SEIS_BROWSER_BIN\"",
  "npm run qa:seis-core:ai-core-evidence",
  "actions/upload-artifact@<approved-pinned-sha>",
  "retention-days: 7",
  "reports/tmp/seis-core-ai-core-panel-navigation/",
  "provider-free",
  "SSH",
  "deployment",
  "payment",
  "infrastructure mutation",
  "browser-run AI Core QA evidence"
]);

lowerIncludesAll("evals package README", evalsReadme, [
  "docs/evals/ai-core-browser-evidence-gates.md",
  "docs/evals/ai-core-browser-ci-proposal.md",
  "docs/evals/ai-core-browser-ci-activation-approval.md",
  "docs/evals/ai-core-browser-ci-workflow-draft.md",
  "docs/evals/ai-core-browser-workflow-dispatch-review.md",
  ".github/workflows/ai-core-browser-evidence.yml",
  "reports/evals/ai-core-panel-navigation-browser-qa.md",
  "npm run check:ai-core-browser-qa-evidence",
  "npm run check:ai-core-eval-evidence",
  "npm run qa:seis-core:ai-core-evidence",
  "metadata-only",
  "artifact gate",
  "workflow_dispatch",
  "manual evidence",
  "not a required branch-protection check"
]);

includesAll("fixture report generator", fixtureReportGenerator, [
  "panelNavigationQaReportPath",
  "browserCiProposalPath",
  "browserCiActivationApprovalPath",
  "browserCiWorkflowDraftPath",
  "browserCiActiveWorkflowPath",
  "browserCiDispatchReviewPath",
  "browserUiEvaluations",
  "eval-browser-ui-ai-core-panel-navigation-qa",
  "scripts/check-ai-core-browser-qa-evidence.mjs"
]);

includesAll("CI workflow", ciWorkflow, [
  "Metadata-only governance/quality closure",
  "npm run quality:governance"
]);

if (ciWorkflow.includes("qa:seis-core:ai-core-evidence") || ciWorkflow.includes("qa:seis-core:ai-core-panels")) {
  fail("CI workflow must remain metadata-only and must not run browser-required AI Core QA");
}

includesAll("AI Core browser evidence workflow", browserEvidenceWorkflow, [
  "name: AI Core Browser Evidence",
  "workflow_dispatch:",
  "permissions:",
  "contents: read",
  "timeout-minutes: 8",
  "SEIS_BROWSER_BIN: /usr/bin/google-chrome",
  "SEIS_DATA_MODE: mock",
  "SEIS_PRIVACY_MODE: local-only",
  "CI: \"true\"",
  "actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10",
  "actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
  "node-version: \"20\"",
  "Verify Chrome/Chromium binary",
  "test -x \"$SEIS_BROWSER_BIN\"",
  "\"$SEIS_BROWSER_BIN\" --version",
  "npm run qa:seis-core:ai-core-evidence",
  "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02",
  "reports/tmp/seis-core-ai-core-panel-navigation/",
  "if-no-files-found: error",
  "retention-days: 7"
]);

lowerIncludesAll("AI Core browser workflow dispatch review", browserCiDispatchReview, [
  "AI Core Browser Workflow Dispatch Review",
  ".github/workflows/ai-core-browser-evidence.yml",
  "seis/ai-core-app-foundation-continuation",
  "gh workflow run ai-core-browser-evidence.yml --ref seis/ai-core-app-foundation-continuation",
  "HTTP 404",
  "not found on the default branch",
  "No GitHub Actions run was created",
  "No browser artifacts were uploaded",
  "workflow visibility blocker",
  "human-approved merge",
  "workflow_dispatch",
  "GitHub run ID",
  "Artifact retention",
  "reports/tmp/seis-core-ai-core-panel-navigation/",
  "provider-free",
  "SSH-free",
  "deployment-free",
  "payment-free",
  "infrastructure-mutation-free",
  "secret-free",
  "local-only",
  "mock-data-only",
  "branch-protection decision",
  "live provider routing",
  "SEIS-owned model training"
]);

if (/(^|\n)\s+(push|pull_request|schedule):/.test(browserEvidenceWorkflow)) {
  fail("AI Core browser evidence workflow must remain manually triggered by workflow_dispatch only");
}

for (const workflowFile of readdirSync(".github/workflows").filter((name) => /\.ya?ml$/i.test(name))) {
  const workflowPath = `.github/workflows/${workflowFile}`;
  const workflowText = readText(workflowPath, { scanSecrets: false });
  const isApprovedBrowserWorkflow = workflowPath === files.browserEvidenceWorkflow;
  if (workflowText.includes("qa:seis-core:ai-core-evidence") || workflowText.includes("qa:seis-core:ai-core-panels")) {
    if (!isApprovedBrowserWorkflow) {
      fail(`${workflowPath} must not run browser-required AI Core QA; only ${files.browserEvidenceWorkflow} is approved`);
    }
  }
}

includesAll("fixture report schema", schema, [
  "\"browserUiEvaluationCount\"",
  "\"browser-ui\"",
  "\"retrieval-ui\"",
  "\"local-browser-fixture\""
]);

includesAll("Command Center check", commandCenterCheck, [
  "scripts/check-ai-core-browser-qa-evidence.mjs",
  "check:ai-core-browser-qa-evidence"
]);

for (const [label, text] of [
  ["apps/seis-core README", readme],
  ["evals package README", evalsReadme],
  ["browser evidence gates", browserEvidenceGates],
  ["browser CI proposal", browserCiProposal],
  ["browser CI activation approval", browserCiActivationApproval],
  ["browser CI workflow draft", browserCiWorkflowDraft],
  ["evaluation strategy", evaluationStrategy],
  ["five-year roadmap", roadmap],
  ["five-year review", programReview]
]) {
  lowerIncludesAll(label, text, [
    "npm run check:ai-core-browser-qa-evidence",
    "browser-run AI Core QA evidence"
  ]);
}

if (!fixtureReport.sourceDocuments?.includes(files.browserQaReport)) {
  fail("fixture report sourceDocuments must include the AI Core panel QA report");
}

if (!fixtureReport.sourceDocuments?.includes("scripts/check-ai-core-browser-qa-evidence.mjs")) {
  fail("fixture report sourceDocuments must include the browser QA evidence check script");
}

if (!fixtureReport.sourceDocuments?.includes(files.browserCiProposal)) {
  fail("fixture report sourceDocuments must include the AI Core browser CI proposal");
}

if (!fixtureReport.sourceDocuments?.includes(files.browserCiActivationApproval)) {
  fail("fixture report sourceDocuments must include the AI Core browser CI activation approval packet");
}

if (!fixtureReport.nextRecommendedSlice?.sourceLinks?.includes(files.browserCiActivationApproval)) {
  fail("fixture report nextRecommendedSlice sourceLinks must include the AI Core browser CI activation approval packet");
}

if (!fixtureReport.sourceDocuments?.includes(files.browserCiWorkflowDraft)) {
  fail("fixture report sourceDocuments must include the AI Core browser CI workflow draft");
}

if (!fixtureReport.sourceDocuments?.includes(files.browserEvidenceWorkflow)) {
  fail("fixture report sourceDocuments must include the active AI Core browser evidence workflow");
}

if (!fixtureReport.sourceDocuments?.includes(files.browserCiDispatchReview)) {
  fail("fixture report sourceDocuments must include the AI Core browser workflow dispatch review");
}

if (!fixtureReport.nextRecommendedSlice?.sourceLinks?.includes(files.browserEvidenceWorkflow)) {
  fail("fixture report nextRecommendedSlice sourceLinks must include the active AI Core browser evidence workflow");
}

if (!fixtureReport.nextRecommendedSlice?.sourceLinks?.includes(files.browserCiDispatchReview)) {
  fail("fixture report nextRecommendedSlice sourceLinks must include the AI Core browser workflow dispatch review");
}

if (fixtureReport.summary?.browserUiEvaluationCount !== 2) {
  fail("fixture report summary must count two browser UI evaluations");
}

const panelEvaluation = (fixtureReport.evaluations || []).find(
  (evaluation) => evaluation.id === "eval-browser-ui-ai-core-panel-navigation-qa"
);

if (!panelEvaluation) {
  fail("fixture report must include eval-browser-ui-ai-core-panel-navigation-qa");
} else {
  const expected = {
    layer: "browser-ui",
    targetType: "browser-ui",
    sourceFixture: files.browserQaReport,
    privacyClass: "local-browser-fixture",
    result: "pass",
    status: "validated"
  };

  for (const [key, value] of Object.entries(expected)) {
    if (panelEvaluation[key] !== value) {
      fail(`panel browser UI evaluation ${key} must be ${value}`);
    }
  }

  for (const evidenceLink of [
    files.browserQaReport,
    files.browserQaScript,
    "scripts/check-ai-core-browser-qa-evidence.mjs",
    files.readme
  ]) {
    if (!panelEvaluation.evidenceLinks?.includes(evidenceLink)) {
      fail(`panel browser UI evaluation missing evidence link: ${evidenceLink}`);
    }
  }

  for (const planningOnlyLink of [
    files.browserCiProposal,
    files.browserCiActivationApproval,
    files.browserCiWorkflowDraft,
    files.browserEvidenceWorkflow,
    files.browserCiDispatchReview
  ]) {
    if (panelEvaluation.evidenceLinks?.includes(planningOnlyLink)) {
      fail(`panel browser UI evaluation must not treat planning-only CI source as pass evidence: ${planningOnlyLink}`);
    }
  }

  lowerIncludesAll("panel browser UI pass criteria", (panelEvaluation.passCriteria || []).join("\n"), [
    "npm run qa:seis-core:ai-core-panels",
    "desktop and mobile",
    "sidebar",
    "command palette",
    "global search",
    "generated browser artifacts stay under ignored reports/tmp",
    "artifact-required check validates manifest",
    "non-claims exclude live providers"
  ]);
}

lowerIncludesAll("fixture report markdown", fixtureReportMarkdown, [
  "Browser UI evaluations: 2",
  "eval-browser-ui-ai-core-panel-navigation-qa",
  "scripts/check-ai-core-browser-qa-evidence.mjs"
]);

validateArtifacts();

const ignoredArtifactCheck = spawnSync(
  "git",
  [
    "check-ignore",
    "reports/tmp/seis-core-ai-core-panel-navigation/desktop-ai-core-panel-navigation.json",
    "reports/tmp/seis-core-ai-core-panel-navigation/mobile-ai-core-panel-navigation.json"
  ],
  { encoding: "utf8" }
);

if (ignoredArtifactCheck.status !== 0) {
  fail("AI Core browser QA reports/tmp artifacts must be ignored by Git");
}

if (failures.length > 0) {
  console.error("SEIS AI Core browser QA evidence check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS AI Core browser QA evidence check passed.");
