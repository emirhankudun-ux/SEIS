import { existsSync, readFileSync } from "node:fs";

const runnerPath = "scripts/capture-seis-core-ai-core-panel-navigation.mjs";
const reportPath = "reports/evals/ai-core-panel-navigation-browser-qa.md";
const jsonReportPath = "reports/evals/ai-core-panel-navigation-browser-qa.json";
const packagePath = "package.json";
const readmePath = "apps/seis-core/README.md";
const evaluationStrategyPath = "docs/evals/evaluation-strategy.md";
const reviewPath = "docs/reviews/SEIS_5_YEAR_DEVELOPMENT_PROGRAM_REVIEW.md";

const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(filePath) {
  if (!existsSync(filePath)) {
    fail(`missing ${filePath}`);
    return "";
  }
  return readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    fail(`missing ${filePath}`);
    return {};
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`invalid JSON in ${filePath}: ${error.message}`);
    return {};
  }
}

function requireIncludes(label, text, needles) {
  for (const needle of needles) {
    if (!text.includes(needle)) {
      fail(`${label} missing ${needle}`);
    }
  }
}

const runner = readText(runnerPath);
const report = readText(reportPath);
const packageJson = readJson(packagePath);
const readme = readText(readmePath);
const evaluationStrategy = readText(evaluationStrategyPath);
const review = readText(reviewPath);
const jsonReport = readJson(jsonReportPath);

requireIncludes(runnerPath, runner, [
  "JSDOM",
  "data-view=\"ai-core\"",
  "provider keys",
  "Secret and credential lookup is not a supported retrieval task.",
  "command-input",
  "global-search",
  "ai-core-panel-navigation-browser-qa.md",
  "providerCallsPerformed: false",
  "externalProviderRouting: false",
  "writesPersistentMemory: false",
  "createsEmbeddingIndex: false"
]);

const scripts = packageJson.scripts || {};
if (scripts["qa:seis-core:ai-core-panels"] !== "node scripts/capture-seis-core-ai-core-panel-navigation.mjs") {
  fail("package.json missing qa:seis-core:ai-core-panels script");
}
if (scripts["check:ai-core-browser-qa-evidence"] !== "node scripts/check-ai-core-browser-qa-evidence.mjs") {
  fail("package.json missing check:ai-core-browser-qa-evidence script");
}

requireIncludes(reportPath, report, [
  "# AI Core Panel Navigation Browser QA",
  "Status: passed",
  "dashboard-initial",
  "sidebar-ai-core-navigation",
  "ai-core-contract-card-counts",
  "retrieval-query-provider-keys",
  "retrieval-reset",
  "command-palette-ai-core",
  "global-search-ai-core",
  "goals-navigation-sanity",
  "providerCallsPerformed",
  "externalProviderRouting",
  "writesPersistentMemory",
  "createsEmbeddingIndex",
  "claimsModelTraining"
]);

if (jsonReport.status !== "passed") {
  fail("JSON report status must be passed");
}

const scenarioIds = new Set((jsonReport.scenarios || []).map((scenario) => scenario.id));
for (const scenarioId of [
  "dashboard-initial",
  "sidebar-ai-core-navigation",
  "ai-core-contract-card-counts",
  "retrieval-query-provider-keys",
  "retrieval-reset",
  "command-palette-ai-core",
  "global-search-ai-core",
  "goals-navigation-sanity"
]) {
  if (!scenarioIds.has(scenarioId)) {
    fail(`JSON report missing scenario ${scenarioId}`);
  }
}

for (const [flag, value] of Object.entries(jsonReport.safetyFlags || {})) {
  if (value !== false) {
    fail(`JSON report safety flag must remain false: ${flag}`);
  }
}

for (const [key, value] of Object.entries(jsonReport.counts || {})) {
  if (!Number.isInteger(value) || value < 0) {
    fail(`JSON report count must be a non-negative integer: ${key}`);
  }
}

requireIncludes(readmePath, readme, [
  "npm run qa:seis-core:ai-core-panels",
  "npm run check:ai-core-browser-qa-evidence",
  "reports/evals/ai-core-panel-navigation-browser-qa.md"
]);

requireIncludes(evaluationStrategyPath, evaluationStrategy, [
  "qa:seis-core:ai-core-panels",
  "check:ai-core-browser-qa-evidence",
  "reports/evals/ai-core-panel-navigation-browser-qa.md",
  "JSDOM"
]);

requireIncludes(reviewPath, review, [
  "JSDOM AI Core Panel Navigation QA Recovery Slice",
  "scripts/capture-seis-core-ai-core-panel-navigation.mjs",
  "scripts/check-ai-core-browser-qa-evidence.mjs",
  "reports/evals/ai-core-panel-navigation-browser-qa.md",
  "npm run qa:seis-core:ai-core-panels",
  "npm run check:ai-core-browser-qa-evidence"
]);

const forbiddenClaims = [
  "providerCallsPerformed: true",
  "externalProviderRouting: true",
  "writesPersistentMemory: true",
  "createsEmbeddingIndex: true",
  "claimsModelTraining: true",
  "claimsBenchmarkRun: true"
];

for (const claim of forbiddenClaims) {
  if (runner.includes(claim) || report.includes(claim)) {
    fail(`unsafe evidence claim found: ${claim}`);
  }
}

if (failures.length) {
  console.error("AI Core browser QA evidence check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("AI Core browser QA evidence check passed.");
