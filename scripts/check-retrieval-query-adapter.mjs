import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/data/schemas/retrieval-query-adapter.schema.json";
const fixturePath = "packages/data/fixtures/local-readonly-retrieval-query-adapter.json";
const knowledgeFixturePath = "packages/data/fixtures/knowledge-source-classification.json";
const sharedFixturePath = "packages/shared-types/fixtures/ai-core-command-center-foundation.json";
const appFixturePath = "apps/seis-core/ai-core-contract-fixture.js";
const dataReadmePath = "packages/data/README.md";
const commandCenterReadmePath = "apps/seis-core/README.md";
const sharedDocsPath = "docs/architecture/ai-core-app-shared-contracts.md";
const contextBoundaryPath = "docs/ai/context-memory-boundary.md";
const evaluationStrategyPath = "docs/evals/evaluation-strategy.md";
const roadmapPath = "roadmap/seis-ai-core-command-center-5-year-development-program.md";
const reviewPath = "docs/reviews/SEIS_5_YEAR_DEVELOPMENT_PROGRAM_REVIEW.md";

const failures = [];

const requiredTopLevel = [
  "version",
  "id",
  "status",
  "mode",
  "readOnly",
  "externalProviderRouting",
  "providerCallPerformed",
  "browserReceivesProviderKey",
  "secretMaterialStored",
  "storesRawContent",
  "writesPersistentMemory",
  "createsEmbeddingIndex",
  "sourceDocuments",
  "queryIntents",
  "allowedSourceClasses",
  "forbiddenSourceClasses",
  "allowedRetrievalStates",
  "blockedRetrievalStates",
  "queryAdapters",
  "auditMetadata",
  "nonClaims"
];

const requiredAdapterIds = [
  "adapter-command-center-evidence",
  "adapter-discarded-archive-block"
];

const requiredNonClaimTerms = [
  "No live provider adapter",
  "No provider key",
  "No raw assistant archive",
  "No embedding index",
  "No GitHub push",
  "No browser client",
  "No benchmark",
  "No absolute machine path"
];

const requiredForbiddenTerms = [
  "call external providers",
  "return raw archive content",
  "create embeddings",
  "write persistent memory",
  "read or expose secrets",
  "push",
  "merge",
  "SSH",
  "deployment",
  "payment",
  "infrastructure"
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

function assertIncludesAll(label, actual, expected) {
  if (!Array.isArray(actual)) {
    fail(`${label} must be an array`);
    return;
  }

  for (const item of expected) {
    if (!actual.includes(item)) {
      fail(`${label} missing ${item}`);
    }
  }
}

function textIncludesAll(label, values, requiredTerms) {
  const text = JSON.stringify(values).toLowerCase();
  for (const term of requiredTerms) {
    if (!text.includes(term.toLowerCase())) {
      fail(`${label} must mention ${term}`);
    }
  }
}

const schemaText = readText(schemaPath);
const fixtureText = readText(fixturePath);
const appFixtureText = readText(appFixturePath);
const schema = readJson(schemaPath);
const fixture = readJson(fixturePath);
const knowledgeFixture = readJson(knowledgeFixturePath);
const sharedFixture = readJson(sharedFixturePath);
const appFixture = readAppFixture(appFixtureText);

for (const [filePath, text] of [
  [schemaPath, schemaText],
  [fixturePath, fixtureText],
  [knowledgeFixturePath, readText(knowledgeFixturePath)],
  [sharedFixturePath, readText(sharedFixturePath)],
  [appFixturePath, appFixtureText],
  [dataReadmePath, readText(dataReadmePath)],
  [commandCenterReadmePath, readText(commandCenterReadmePath)],
  [sharedDocsPath, readText(sharedDocsPath)],
  [contextBoundaryPath, readText(contextBoundaryPath)],
  [evaluationStrategyPath, readText(evaluationStrategyPath)],
  [roadmapPath, readText(roadmapPath)],
  [reviewPath, readText(reviewPath)]
]) {
  assertNoSensitivePatterns(filePath, text);
}

if (schema.$id !== "https://seis.dev/schemas/retrieval-query-adapter.schema.json") {
  fail("retrieval query adapter schema $id must remain stable");
}

for (const key of requiredTopLevel) {
  if (!(key in fixture)) {
    fail(`fixture missing top-level key: ${key}`);
  }

  if (!schema.required?.includes(key)) {
    fail(`schema.required missing ${key}`);
  }
}

if (fixture.id !== "local-readonly-retrieval-query-adapter") {
  fail("fixture id must be local-readonly-retrieval-query-adapter");
}

if (
  fixture.mode !== "local-only" ||
  fixture.readOnly !== true ||
  fixture.externalProviderRouting !== false ||
  fixture.providerCallPerformed !== false ||
  fixture.browserReceivesProviderKey !== false ||
  fixture.secretMaterialStored !== false ||
  fixture.storesRawContent !== false ||
  fixture.writesPersistentMemory !== false ||
  fixture.createsEmbeddingIndex !== false
) {
  fail("top-level retrieval adapter fixture must remain local-only, read-only, and no-provider/no-secret/no-memory-write");
}

assertIncludesAll("queryAdapters", (fixture.queryAdapters || []).map((adapter) => adapter.id), requiredAdapterIds);
assertIncludesAll("allowedSourceClasses", fixture.allowedSourceClasses, ["official", "scan-generated", "mock", "planned"]);
assertIncludesAll("forbiddenSourceClasses", fixture.forbiddenSourceClasses, ["archive", "live", "unknown"]);
assertIncludesAll("allowedRetrievalStates", fixture.allowedRetrievalStates, ["approved", "local-only"]);
assertIncludesAll("blockedRetrievalStates", fixture.blockedRetrievalStates, ["blocked", "restricted", "pending-review"]);
textIncludesAll("nonClaims", fixture.nonClaims, requiredNonClaimTerms);

for (const sourceDocument of fixture.sourceDocuments || []) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

const sourceById = new Map((knowledgeFixture.knowledgeSources || []).map((source) => [source.id, source]));
const adapterIds = new Set();

for (const adapter of fixture.queryAdapters || []) {
  if (adapterIds.has(adapter.id)) {
    fail(`duplicate query adapter id: ${adapter.id}`);
  }
  adapterIds.add(adapter.id);

  assertRepoPath(`${adapter.id}.evidence`, adapter.evidence);

  if (
    adapter.readOnly !== true ||
    adapter.providerCallPerformed !== false ||
    adapter.externalProviderRouting !== false ||
    adapter.browserReceivesProviderKey !== false ||
    adapter.secretMaterialStored !== false ||
    adapter.storesRawContent !== false ||
    adapter.writesPersistentMemory !== false ||
    adapter.createsEmbeddingIndex !== false
  ) {
    fail(`${adapter.id} must remain read-only and no-provider/no-secret/no-memory-write`);
  }

  if (adapter.status === "validated" && adapter.mode !== "local-only") {
    fail(`${adapter.id} validated adapter must use local-only mode`);
  }

  if (adapter.status === "blocked" && adapter.approvalState !== "blocked") {
    fail(`${adapter.id} blocked adapter must have blocked approval state`);
  }

  if (!Array.isArray(adapter.forbiddenKnowledgeSourceIds) || !adapter.forbiddenKnowledgeSourceIds.includes("knowledge-discarded-assistant-archive")) {
    fail(`${adapter.id} must explicitly forbid discarded assistant archive`);
  }

  for (const sourceId of adapter.allowedKnowledgeSourceIds || []) {
    const source = sourceById.get(sourceId);
    if (!source) {
      fail(`${adapter.id} references unknown allowed source: ${sourceId}`);
      continue;
    }

    if (["archive", "live", "unknown"].includes(source.sourceClass)) {
      fail(`${adapter.id} allowed source must not use forbidden source class: ${sourceId}`);
    }
    if (!["approved", "local-only"].includes(source.retrievalState)) {
      fail(`${adapter.id} allowed source must be approved or local-only: ${sourceId}`);
    }
    if (source.externalRoutingAllowed !== false || source.storesRawContent !== false) {
      fail(`${adapter.id} allowed source must be no-external-routing and no-raw-storage: ${sourceId}`);
    }
  }

  textIncludesAll(`${adapter.id}.forbiddenActions`, adapter.forbiddenActions, requiredForbiddenTerms);
}

const sharedText = JSON.stringify(sharedFixture);
const appText = JSON.stringify(appFixture);
for (const requiredText of [
  "local-readonly-retrieval-query-adapter",
  "adapter-command-center-evidence",
  "adapter-discarded-archive-block",
  "eval-local-readonly-retrieval-query-adapter",
  "audit-local-readonly-retrieval-query-adapter"
]) {
  if (!sharedText.includes(requiredText)) {
    fail(`${sharedFixturePath} must include ${requiredText}`);
  }
  if (!appText.includes(requiredText)) {
    fail(`${appFixturePath} must include ${requiredText}`);
  }
}

for (const [filePath, requiredText] of [
  [dataReadmePath, "local-readonly-retrieval-query-adapter.json"],
  [dataReadmePath, "check:retrieval-query-adapter"],
  [commandCenterReadmePath, "Local Retrieval"],
  [sharedDocsPath, "retrievalQueryAdapter"],
  [contextBoundaryPath, "local-readonly-retrieval-query-adapter"],
  [evaluationStrategyPath, "local-readonly-retrieval-query-adapter"],
  [roadmapPath, "check:retrieval-query-adapter"],
  [reviewPath, "check:retrieval-query-adapter"]
]) {
  const text = readText(filePath);
  if (!text.includes(requiredText)) {
    fail(`${filePath} must mention ${requiredText}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS retrieval query adapter check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS retrieval query adapter check passed.");
