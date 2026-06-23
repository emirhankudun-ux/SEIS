import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/data/schemas/knowledge-source-classification.schema.json";
const fixturePath = "packages/data/fixtures/knowledge-source-classification.json";
const dataReadmePath = "packages/data/README.md";
const contextBoundaryPath = "docs/ai/context-memory-boundary.md";
const evaluationStrategyPath = "docs/evals/evaluation-strategy.md";
const sharedDocsPath = "docs/architecture/ai-core-app-shared-contracts.md";
const sharedFixturePath = "packages/shared-types/fixtures/ai-core-command-center-foundation.json";
const appFixturePath = "apps/seis-core/ai-core-contract-fixture.js";
const reviewPath = "docs/reviews/SEIS_5_YEAR_DEVELOPMENT_PROGRAM_REVIEW.md";
const roadmapPath = "roadmap/seis-ai-core-command-center-5-year-development-program.md";

const failures = [];

const requiredTopLevel = [
  "version",
  "id",
  "status",
  "sourceDocuments",
  "sourceClasses",
  "retrievalStates",
  "privacyModes",
  "knowledgeSources",
  "excludedUnsafePatterns",
  "nonClaims"
];

const requiredSourceClasses = [
  "official",
  "review",
  "archive",
  "mock",
  "scan-generated",
  "live",
  "planned",
  "unknown"
];

const requiredRetrievalStates = [
  "approved",
  "pending-review",
  "local-only",
  "redacted",
  "restricted",
  "expired",
  "blocked"
];

const requiredPrivacyModes = [
  "local-only",
  "local-preferred",
  "external-provider-allowed",
  "external-provider-redacted",
  "metadata-only",
  "offline",
  "disabled",
  "research-only"
];

const requiredKnowledgeSourceIds = [
  "knowledge-official-ai-core-docs",
  "knowledge-generated-evaluation-reports",
  "knowledge-local-fixture-contracts",
  "knowledge-seis-10m-token-feed-plan",
  "knowledge-discarded-assistant-archive"
];

const requiredUnsafePatternTerms = [
  "automatic push or merge",
  "active countermeasure",
  "poisoned data injection",
  "memetic manipulation",
  "autonomous payment",
  "autonomous infrastructure",
  "fake BCI",
  "fake trained model ownership"
];

const requiredNonClaimTerms = [
  "No raw assistant archive content",
  "No external provider call",
  "No embedding index",
  "No 10,000,000 token ingestion",
  "No automatic push",
  "No active countermeasure",
  "No BCI",
  "No secret values"
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
    fail(`${label} must be a relative repository evidence path: ${value}`);
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
const schema = readJson(schemaPath);
const fixture = readJson(fixturePath);
const sharedFixture = readJson(sharedFixturePath);
const appFixture = readAppFixture(readText(appFixturePath));

for (const [filePath, text] of [
  [schemaPath, schemaText],
  [fixturePath, fixtureText],
  [dataReadmePath, readText(dataReadmePath)],
  [contextBoundaryPath, readText(contextBoundaryPath)],
  [evaluationStrategyPath, readText(evaluationStrategyPath)],
  [sharedDocsPath, readText(sharedDocsPath)],
  [reviewPath, readText(reviewPath)],
  [roadmapPath, readText(roadmapPath)]
]) {
  assertNoSensitivePatterns(filePath, text);
}

if (schema.$id !== "https://seis.dev/schemas/knowledge-source-classification.schema.json") {
  fail("knowledge source classification schema $id must remain stable");
}

for (const key of requiredTopLevel) {
  if (!(key in fixture)) {
    fail(`fixture missing top-level key: ${key}`);
  }

  if (!schema.required?.includes(key)) {
    fail(`schema.required missing ${key}`);
  }
}

if (fixture.id !== "knowledge-source-classification") {
  fail("fixture id must be knowledge-source-classification");
}

if (fixture.status !== "fixture-backed") {
  fail("fixture status must be fixture-backed");
}

assertIncludesAll("sourceClasses", fixture.sourceClasses, requiredSourceClasses);
assertIncludesAll("retrievalStates", fixture.retrievalStates, requiredRetrievalStates);
assertIncludesAll("privacyModes", fixture.privacyModes, requiredPrivacyModes);
assertIncludesAll("knowledgeSources", (fixture.knowledgeSources || []).map((source) => source.id), requiredKnowledgeSourceIds);
textIncludesAll("excludedUnsafePatterns", fixture.excludedUnsafePatterns, requiredUnsafePatternTerms);
textIncludesAll("nonClaims", fixture.nonClaims, requiredNonClaimTerms);

for (const sourceDocument of fixture.sourceDocuments || []) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

const seenSourceIds = new Set();
for (const source of fixture.knowledgeSources || []) {
  if (seenSourceIds.has(source.id)) {
    fail(`duplicate knowledge source id: ${source.id}`);
  }
  seenSourceIds.add(source.id);

  assertRepoPath(`${source.id}.evidence`, source.evidence);

  if (source.sourceClass === "archive") {
    if (!["pending-review", "restricted", "blocked"].includes(source.retrievalState)) {
      fail(`${source.id} archive source must be pending-review, restricted, or blocked`);
    }
    if (source.externalRoutingAllowed !== false) {
      fail(`${source.id} archive source must not allow external routing`);
    }
    if (source.storesRawContent !== false) {
      fail(`${source.id} archive source must not store raw content`);
    }
  }

  if (source.privacyMode === "disabled" && source.status !== "blocked") {
    fail(`${source.id} disabled privacy mode must be blocked`);
  }

  if (source.externalRoutingAllowed && !source.privacyMode.startsWith("external-provider")) {
    fail(`${source.id} external routing requires an external-provider privacy mode`);
  }

  if (!Array.isArray(source.forbiddenUses) || source.forbiddenUses.length === 0) {
    fail(`${source.id} forbiddenUses must be non-empty`);
  }
}

const blockedArchive = (fixture.knowledgeSources || []).find((source) => source.id === "knowledge-discarded-assistant-archive");
if (!blockedArchive) {
  fail("missing blocked discarded assistant archive source");
} else {
  if (blockedArchive.status !== "blocked" || blockedArchive.retrievalState !== "blocked" || blockedArchive.privacyMode !== "disabled") {
    fail("discarded assistant archive must remain blocked and disabled");
  }
  textIncludesAll("discarded assistant archive forbiddenUses", blockedArchive.forbiddenUses, requiredUnsafePatternTerms);
}

const sharedText = JSON.stringify(sharedFixture);
const appText = JSON.stringify(appFixture);
for (const requiredText of [
  "knowledge-source-classification",
  "eval-knowledge-source-classification",
  "audit-knowledge-source-classification"
]) {
  if (!sharedText.includes(requiredText)) {
    fail(`${sharedFixturePath} must include ${requiredText}`);
  }
  if (!appText.includes(requiredText)) {
    fail(`${appFixturePath} must include ${requiredText}`);
  }
}

for (const [filePath, requiredText] of [
  [dataReadmePath, "knowledge-source-classification.json"],
  [dataReadmePath, "check:knowledge-source-classification"],
  [contextBoundaryPath, "knowledge-source-classification.json"],
  [contextBoundaryPath, "check:knowledge-source-classification"],
  [evaluationStrategyPath, "knowledge-source-classification"],
  [sharedDocsPath, "knowledgeSource"],
  [reviewPath, "check:knowledge-source-classification"],
  [roadmapPath, "check:knowledge-source-classification"]
]) {
  const text = readText(filePath);
  if (!text.includes(requiredText)) {
    fail(`${filePath} must mention ${requiredText}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS knowledge source classification check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS knowledge source classification check passed.");
