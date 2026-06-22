import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/data/schemas/retrieval-search-transcript.schema.json";
const fixturePath = "packages/data/fixtures/local-readonly-retrieval-search-transcript.json";
const adapterFixturePath = "packages/data/fixtures/local-readonly-retrieval-query-adapter.json";
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
  "providerCallPerformed",
  "externalProviderRouting",
  "browserReceivesProviderKey",
  "storesRawContent",
  "rawContentReturned",
  "writesPersistentMemory",
  "createsEmbeddingIndex",
  "sourceDocuments",
  "retrievalResultCards",
  "noContentSearchTranscripts",
  "nonClaims"
];

const requiredSharedTexts = [
  "local-readonly-retrieval-search-transcript",
  "result-official-ai-core-docs",
  "transcript-blocked-discarded-archive",
  "eval-local-readonly-retrieval-search-transcript",
  "audit-local-readonly-retrieval-search-transcript"
];

const forbiddenCardSourceClasses = ["archive", "live", "unknown"];
const allowedCardRetrievalStates = ["approved", "local-only"];
const falseFlags = [
  "providerCallPerformed",
  "externalProviderRouting",
  "storesRawContent",
  "rawContentReturned",
  "writesPersistentMemory",
  "createsEmbeddingIndex"
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

function assertFalseFlags(label, item) {
  for (const flag of falseFlags) {
    if (item[flag] !== false) {
      fail(`${label} must keep ${flag} false`);
    }
  }
}

function assertUniqueIds(label, records) {
  const ids = new Set();
  for (const record of records || []) {
    if (!record.id) {
      fail(`${label} item missing id`);
      continue;
    }
    if (ids.has(record.id)) {
      fail(`${label} has duplicate id: ${record.id}`);
    }
    ids.add(record.id);
  }
}

function textIncludesAll(label, value, requiredTerms) {
  const text = JSON.stringify(value).toLowerCase();
  for (const term of requiredTerms) {
    if (!text.includes(term.toLowerCase())) {
      fail(`${label} must mention ${term}`);
    }
  }
}

const schemaText = readText(schemaPath);
const fixtureText = readText(fixturePath);
const adapterFixtureText = readText(adapterFixturePath);
const knowledgeFixtureText = readText(knowledgeFixturePath);
const sharedFixtureText = readText(sharedFixturePath);
const appFixtureText = readText(appFixturePath);

const schema = readJson(schemaPath);
const fixture = readJson(fixturePath);
const adapterFixture = readJson(adapterFixturePath);
const knowledgeFixture = readJson(knowledgeFixturePath);
const sharedFixture = readJson(sharedFixturePath);
const appFixture = readAppFixture(appFixtureText);

for (const [filePath, text] of [
  [schemaPath, schemaText],
  [fixturePath, fixtureText],
  [adapterFixturePath, adapterFixtureText],
  [knowledgeFixturePath, knowledgeFixtureText],
  [sharedFixturePath, sharedFixtureText],
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

if (schema.$id !== "https://seis.dev/schemas/retrieval-search-transcript.schema.json") {
  fail("retrieval search transcript schema $id must remain stable");
}

for (const key of requiredTopLevel) {
  if (!(key in fixture)) {
    fail(`fixture missing top-level key: ${key}`);
  }

  if (!schema.required?.includes(key)) {
    fail(`schema.required missing ${key}`);
  }
}

if (fixture.id !== "local-readonly-retrieval-search-transcript") {
  fail("fixture id must be local-readonly-retrieval-search-transcript");
}

if (
  fixture.mode !== "local-only" ||
  fixture.readOnly !== true ||
  fixture.providerCallPerformed !== false ||
  fixture.externalProviderRouting !== false ||
  fixture.browserReceivesProviderKey !== false ||
  fixture.storesRawContent !== false ||
  fixture.rawContentReturned !== false ||
  fixture.writesPersistentMemory !== false ||
  fixture.createsEmbeddingIndex !== false
) {
  fail("top-level retrieval transcript fixture must remain local-only, read-only, and no-provider/no-secret/no-memory-write");
}

for (const sourceDocument of fixture.sourceDocuments || []) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

const adapterIds = new Set((adapterFixture.queryAdapters || []).map((adapter) => adapter.id));
const sourceById = new Map((knowledgeFixture.knowledgeSources || []).map((source) => [source.id, source]));

assertUniqueIds("retrievalResultCards", fixture.retrievalResultCards);
for (const card of fixture.retrievalResultCards || []) {
  if (!adapterIds.has(card.adapterId)) {
    fail(`${card.id} references unknown adapterId: ${card.adapterId}`);
  }

  const source = sourceById.get(card.sourceId);
  if (!source) {
    fail(`${card.id} references unknown sourceId: ${card.sourceId}`);
  } else {
    if (card.sourceClass !== source.sourceClass) {
      fail(`${card.id} sourceClass must match knowledge source ${card.sourceId}`);
    }
    if (card.retrievalState !== source.retrievalState) {
      fail(`${card.id} retrievalState must match knowledge source ${card.sourceId}`);
    }
    if (forbiddenCardSourceClasses.includes(source.sourceClass)) {
      fail(`${card.id} must not expose forbidden source class ${source.sourceClass}`);
    }
    if (!allowedCardRetrievalStates.includes(source.retrievalState)) {
      fail(`${card.id} source must be approved or local-only`);
    }
    if (source.externalRoutingAllowed !== false || source.storesRawContent !== false) {
      fail(`${card.id} source must not route externally or store raw content`);
    }
  }

  assertRepoPath(`${card.id}.evidence`, card.evidence);
  assertFalseFlags(card.id, card);
}

assertUniqueIds("noContentSearchTranscripts", fixture.noContentSearchTranscripts);
for (const transcript of fixture.noContentSearchTranscripts || []) {
  if (!adapterIds.has(transcript.adapterId)) {
    fail(`${transcript.id} references unknown adapterId: ${transcript.adapterId}`);
  }
  if (transcript.resultCount !== 0) {
    fail(`${transcript.id} must keep resultCount at 0`);
  }
  if (!["empty", "blocked"].includes(transcript.decisionState)) {
    fail(`${transcript.id} decisionState must be empty or blocked`);
  }
  if (transcript.decisionState === "blocked" && !transcript.blockedSources?.includes("knowledge-discarded-assistant-archive")) {
    fail(`${transcript.id} blocked transcript must include knowledge-discarded-assistant-archive`);
  }
  for (const sourceId of transcript.blockedSources || []) {
    const source = sourceById.get(sourceId);
    if (!source) {
      fail(`${transcript.id} references unknown blocked source: ${sourceId}`);
      continue;
    }
    if (source.externalRoutingAllowed !== false || source.storesRawContent !== false) {
      fail(`${transcript.id} blocked source must not route externally or store raw content`);
    }
  }
  assertRepoPath(`${transcript.id}.evidence`, transcript.evidence);
  assertFalseFlags(transcript.id, transcript);
}

textIncludesAll("nonClaims", fixture.nonClaims, [
  "No live search",
  "No raw assistant archive content",
  "No persistent memory write",
  "No benchmark"
]);

for (const requiredText of requiredSharedTexts) {
  if (!sharedFixtureText.includes(requiredText)) {
    fail(`${sharedFixturePath} must include ${requiredText}`);
  }
  if (!appFixtureText.includes(requiredText)) {
    fail(`${appFixturePath} must include ${requiredText}`);
  }
}

if (JSON.stringify(sharedFixture.retrievalResultCards) !== JSON.stringify(appFixture.retrievalResultCards)) {
  fail("app fixture projection is out of sync for retrievalResultCards");
}

if (JSON.stringify(sharedFixture.noContentSearchTranscripts) !== JSON.stringify(appFixture.noContentSearchTranscripts)) {
  fail("app fixture projection is out of sync for noContentSearchTranscripts");
}

for (const [filePath, requiredText] of [
  [dataReadmePath, "local-readonly-retrieval-search-transcript.json"],
  [dataReadmePath, "check:retrieval-search-transcript"],
  [commandCenterReadmePath, "Retrieval Result Cards"],
  [sharedDocsPath, "retrievalResultCard"],
  [sharedDocsPath, "noContentSearchTranscript"],
  [contextBoundaryPath, "local-readonly-retrieval-search-transcript"],
  [evaluationStrategyPath, "local-readonly-retrieval-search-transcript"],
  [roadmapPath, "check:retrieval-search-transcript"],
  [reviewPath, "check:retrieval-search-transcript"]
]) {
  const text = readText(filePath);
  if (!text.includes(requiredText)) {
    fail(`${filePath} must mention ${requiredText}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS retrieval search transcript check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS retrieval search transcript check passed.");
