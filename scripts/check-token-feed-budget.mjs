import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/data/schemas/token-feed-budget.schema.json";
const fixturePath = "packages/data/fixtures/seis-10m-token-feed-budget.json";
const dataReadmePath = "packages/data/README.md";
const modelRouterReadmePath = "packages/model-router/README.md";
const contextBoundaryPath = "docs/ai/context-memory-boundary.md";
const modelRouterDocPath = "docs/ai/model-router.md";
const evaluationStrategyPath = "docs/evals/evaluation-strategy.md";
const sharedDocsPath = "docs/architecture/ai-core-app-shared-contracts.md";
const roadmapPath = "roadmap/seis-ai-core-command-center-5-year-development-program.md";
const reviewPath = "docs/reviews/SEIS_5_YEAR_DEVELOPMENT_PROGRAM_REVIEW.md";
const modelRouterFixturePath = "packages/model-router/fixtures/model-router-route-contracts.json";
const knowledgeFixturePath = "packages/data/fixtures/knowledge-source-classification.json";
const sharedFixturePath = "packages/shared-types/fixtures/ai-core-command-center-foundation.json";
const appFixturePath = "apps/seis-core/ai-core-contract-fixture.js";
const packageJsonPath = "package.json";

const requiredTargetTokenBudget = 10_000_000;

const requiredNonClaimTerms = [
  "No 10,000,000 token ingestion has been executed",
  "No live model execution",
  "No provider key",
  "No model training",
  "budget and routing contract only"
];

const requiredGateTerms = [
  "metadata-only",
  "No raw repository content",
  "External provider routing",
  "not an executed token spend"
];

const secretPatterns = [
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])ghp_[A-Za-z0-9_]{20,}/,
  /(^|[^A-Za-z0-9_])gho_[A-Za-z0-9_]{20,}/,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /id_ed25519/,
  /id_rsa/,
  /\/Users\//
];

const repoPathPattern = /^(docs|packages|roadmap|reports|apps|content|data|scripts)\//;
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
  const text = readText(filePath);
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${filePath}: ${error.message}`);
    return {};
  }
}

function readAppFixture(text) {
  const match = text.match(/window\.seisAiCoreContractFixture\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!match) {
    fail(`missing window.seisAiCoreContractFixture assignment in ${appFixturePath}`);
    return {};
  }

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch (error) {
    fail(`invalid app fixture projection in ${appFixturePath}: ${error.message}`);
    return {};
  }
}

function assertNoSensitivePatterns(filePath, text) {
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      fail(`${filePath} contains disallowed sensitive or machine-specific pattern: ${pattern}`);
    }
  }
}

function assertRepoPath(label, value) {
  if (typeof value !== "string" || value.startsWith("/") || value.includes("..") || !repoPathPattern.test(value)) {
    fail(`${label} must be a relative repository path: ${value}`);
    return;
  }

  if (!existsSync(value)) {
    fail(`${label} must exist: ${value}`);
  }
}

function assertIncludesTerm(label, values, term) {
  const haystack = JSON.stringify(values).toLowerCase();
  if (!haystack.includes(term.toLowerCase())) {
    fail(`${label} must mention ${term}`);
  }
}

const schemaText = readText(schemaPath);
const fixtureText = readText(fixturePath);
const modelRouterFixtureText = readText(modelRouterFixturePath);
const knowledgeFixtureText = readText(knowledgeFixturePath);
const sharedFixtureText = readText(sharedFixturePath);
const appFixtureText = readText(appFixturePath);

for (const [filePath, text] of [
  [schemaPath, schemaText],
  [fixturePath, fixtureText],
  [modelRouterFixturePath, modelRouterFixtureText],
  [knowledgeFixturePath, knowledgeFixtureText],
  [sharedFixturePath, sharedFixtureText],
  [appFixturePath, appFixtureText],
  [dataReadmePath, readText(dataReadmePath)],
  [modelRouterReadmePath, readText(modelRouterReadmePath)],
  [contextBoundaryPath, readText(contextBoundaryPath)],
  [modelRouterDocPath, readText(modelRouterDocPath)],
  [evaluationStrategyPath, readText(evaluationStrategyPath)],
  [sharedDocsPath, readText(sharedDocsPath)],
  [roadmapPath, readText(roadmapPath)],
  [reviewPath, readText(reviewPath)]
]) {
  assertNoSensitivePatterns(filePath, text);
}

const schema = readJson(schemaPath);
const fixture = readJson(fixturePath);
const modelRouterFixture = readJson(modelRouterFixturePath);
const knowledgeFixture = readJson(knowledgeFixturePath);
const sharedFixture = readJson(sharedFixturePath);
const appFixture = readAppFixture(appFixtureText);
const packageJson = readJson(packageJsonPath);

if (schema.$id !== "https://seis.dev/schemas/token-feed-budget.schema.json") {
  fail("token feed budget schema $id must remain stable");
}

if (fixture.id !== "seis-10m-token-feed-budget") {
  fail("token feed budget fixture id must be seis-10m-token-feed-budget");
}

if (fixture.status !== "fixture-backed") {
  fail("token feed budget fixture must be fixture-backed");
}

if (fixture.targetTokenBudget !== requiredTargetTokenBudget) {
  fail(`targetTokenBudget must be ${requiredTargetTokenBudget}`);
}

if (fixture.tokensExecuted !== 0) {
  fail("tokensExecuted must remain 0; this fixture must not claim executed ingestion");
}

if (fixture.budgetMode !== "metadata-only-feed-plan" || fixture.privacyMode !== "metadata-only") {
  fail("token feed budget must remain metadata-only");
}

for (const sourceDocument of fixture.sourceDocuments || []) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

let plannedTokenTotal = 0;
const allocationIds = new Set();
for (const allocation of fixture.allocations || []) {
  if (allocationIds.has(allocation.id)) {
    fail(`duplicate allocation id: ${allocation.id}`);
  }
  allocationIds.add(allocation.id);

  plannedTokenTotal += allocation.plannedTokens || 0;
  assertRepoPath(`${allocation.id}.evidence`, allocation.evidence);

  if (allocation.storesRawContent !== false) {
    fail(`${allocation.id} must not store raw content`);
  }

  if (allocation.externalRoutingAllowed !== false) {
    fail(`${allocation.id} must not allow external routing`);
  }

  if (allocation.sourceClass === "archive") {
    if (allocation.retrievalState !== "blocked" || allocation.privacyMode !== "disabled" || allocation.plannedTokens !== 0) {
      fail(`${allocation.id} archive allocation must be blocked, disabled, and 0 tokens`);
    }
  } else if (allocation.privacyMode !== "metadata-only") {
    fail(`${allocation.id} non-archive allocation must be metadata-only`);
  }
}

if (plannedTokenTotal !== requiredTargetTokenBudget) {
  fail(`planned token allocations must total ${requiredTargetTokenBudget}; found ${plannedTokenTotal}`);
}

for (const field of [
  "rawContentStored",
  "embeddingIndexCreated",
  "persistentMemoryWritePerformed",
  "providerCallPerformed",
  "modelTrainingPerformed",
  "browserReceivesProviderKey"
]) {
  if (fixture.auditMetadata?.[field] !== false) {
    fail(`auditMetadata.${field} must be false`);
  }
}

for (const term of requiredNonClaimTerms) {
  assertIncludesTerm("nonClaims", fixture.nonClaims, term);
}

for (const term of requiredGateTerms) {
  assertIncludesTerm("gateRules", fixture.gateRules, term);
}

for (const targetPath of [
  fixture.integrationTargets?.sharedContractFixture,
  fixture.integrationTargets?.commandCenterProjection
]) {
  assertRepoPath("integrationTargets", targetPath);
}

const routeId = fixture.integrationTargets?.modelRouterRouteId;
const route = (modelRouterFixture.routes || []).find((item) => item.id === routeId);
if (!route) {
  fail(`${modelRouterFixturePath} missing route ${routeId}`);
} else {
  if (route.request?.costBudget?.maxTokens !== requiredTargetTokenBudget) {
    fail(`${routeId} maxTokens must be ${requiredTargetTokenBudget}`);
  }
  if (route.request?.costBudget?.maxUsd !== 0) {
    fail(`${routeId} maxUsd must remain 0 in fixture`);
  }
  if (route.decision?.routeMode !== "metadata-only" || route.response?.privacyMode !== "metadata-only") {
    fail(`${routeId} must remain metadata-only end to end`);
  }
  if (route.auditMetadata?.providerCallPerformed !== false) {
    fail(`${routeId} must not perform provider calls`);
  }
}

const knowledgeSourceId = fixture.integrationTargets?.knowledgeSourceId;
for (const [label, contract] of [
  [knowledgeFixturePath, knowledgeFixture],
  [sharedFixturePath, sharedFixture],
  [appFixturePath, appFixture]
]) {
  if (!JSON.stringify(contract).includes(knowledgeSourceId)) {
    fail(`${label} must include ${knowledgeSourceId}`);
  }
}

for (const [label, contract] of [
  [sharedFixturePath, sharedFixture],
  [appFixturePath, appFixture]
]) {
  for (const requiredId of [
    route?.response?.routeId,
    fixture.integrationTargets?.agentTaskId,
    "eval-seis-10m-token-feed-budget",
    "audit-seis-10m-token-feed-budget"
  ]) {
    if (!JSON.stringify(contract).includes(requiredId)) {
      fail(`${label} must include ${requiredId}`);
    }
  }
}

for (const [filePath, requiredText] of [
  [dataReadmePath, "seis-10m-token-feed-budget.json"],
  [dataReadmePath, "check:token-feed-budget"],
  [modelRouterReadmePath, "10,000,000"],
  [contextBoundaryPath, "seis-10m-token-feed-budget.json"],
  [contextBoundaryPath, "check:token-feed-budget"],
  [modelRouterDocPath, "route-contract-seis-10m-token-feed-metadata"],
  [evaluationStrategyPath, "check:token-feed-budget"],
  [sharedDocsPath, "seis-10m-token-feed-budget"],
  [roadmapPath, "10,000,000"],
  [reviewPath, "10,000,000"]
]) {
  if (!readText(filePath).includes(requiredText)) {
    fail(`${filePath} must mention ${requiredText}`);
  }
}

if (packageJson.scripts?.["check:token-feed-budget"] !== "node scripts/check-token-feed-budget.mjs") {
  fail("package.json must expose check:token-feed-budget");
}

if (failures.length > 0) {
  console.error("SEIS token feed budget check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS token feed budget check passed.");
