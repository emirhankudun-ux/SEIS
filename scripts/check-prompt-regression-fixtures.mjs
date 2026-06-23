import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/prompt-engine/schemas/prompt-regression-suite.schema.json";
const fixturePath = "packages/prompt-engine/fixtures/assistant-surface-regression-suite.json";
const promptEngineReadmePath = "packages/prompt-engine/README.md";
const promptRegressionDocPath = "docs/testing/prompt-regression-suite.md";
const promptEngineDocPath = "docs/ai/prompt-engine.md";
const evaluationStrategyDocPath = "docs/evals/evaluation-strategy.md";
const reviewDocPath = "docs/reviews/SEIS_5_YEAR_DEVELOPMENT_PROGRAM_REVIEW.md";

const failures = [];

const requiredTopLevel = [
  "version",
  "id",
  "status",
  "sourceDocuments",
  "suiteRules",
  "fixtures"
];

const expectedSurfaces = [
  "repository-assistant",
  "documentation-assistant",
  "architecture-reviewer",
  "security-reviewer",
  "pr-reviewer",
  "roadmap-assistant",
  "research-assistant"
];

const expectedSourceDocuments = [
  "docs/testing/prompt-regression-suite.md",
  "docs/ai/prompt-engine.md",
  "docs/product/ai-app-surfaces.md",
  "roadmap/seis-ai-core-command-center-5-year-development-program.md"
];

const requiredDocs = [
  promptEngineReadmePath,
  promptRegressionDocPath,
  promptEngineDocPath,
  evaluationStrategyDocPath,
  reviewDocPath
];

const repoPathPattern = /^(docs|packages|roadmap|reports|apps|content|data|scripts)\//;
const idPattern = /^[a-z0-9][a-z0-9-]*$/;

const secretPatterns = [
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])ghp_[A-Za-z0-9_]{20,}/,
  /(^|[^A-Za-z0-9_])gho_[A-Za-z0-9_]{20,}/,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /id_ed25519/,
  /id_rsa/
];

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
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${filePath}: ${error.message}`);
    return {};
  }
}

function assertNonEmptyArray(label, value) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${label} must be a non-empty array`);
  }
}

function assertString(label, value) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string`);
  }
}

function assertRepoPath(label, value) {
  if (typeof value !== "string") {
    fail(`${label} must be a string path`);
    return;
  }

  if (value.startsWith("/") || value.includes("..") || !repoPathPattern.test(value)) {
    fail(`${label} must be a relative repository path: ${value}`);
  }

  if (!existsSync(value)) {
    fail(`${label} must point to an existing file: ${value}`);
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

function joined(value) {
  return Array.isArray(value) ? value.join(" ").toLowerCase() : "";
}

function includesAny(value, needles) {
  const text = joined(value);
  return needles.some(needle => text.includes(needle));
}

function assertNoSecretPatterns(filePath, text) {
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      fail(`${filePath} contains a disallowed secret-like pattern: ${pattern}`);
    }
  }
}

const schemaText = readText(schemaPath);
const fixtureText = readText(fixturePath);
const schema = readJson(schemaPath);
const suite = readJson(fixturePath);

assertNoSecretPatterns(schemaPath, schemaText);
assertNoSecretPatterns(fixturePath, fixtureText);

if (schema.$id !== "https://seis.dev/schemas/prompt-regression-suite.schema.json") {
  fail("schema $id must remain stable");
}

for (const key of requiredTopLevel) {
  if (!(key in suite)) {
    fail(`fixture suite missing top-level key: ${key}`);
  }

  if (!schema.required?.includes(key)) {
    fail(`schema.required missing ${key}`);
  }
}

if (suite.id !== "assistant-surface-regression-suite") {
  fail("fixture suite id must be assistant-surface-regression-suite");
}

if (suite.status !== "fixture-backed") {
  fail("fixture suite status must be fixture-backed");
}

if (suite.suiteRules?.executionMode !== "fixture-only") {
  fail("fixture suite must remain fixture-only");
}

assertIncludesAll("sourceDocuments", suite.sourceDocuments, expectedSourceDocuments);
for (const sourceDocument of suite.sourceDocuments || []) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

for (const ruleSet of ["dataPolicy", "nonClaims", "approvalRules"]) {
  assertNonEmptyArray(`suiteRules.${ruleSet}`, suite.suiteRules?.[ruleSet]);
}

if (!includesAny(suite.suiteRules?.dataPolicy, ["synthetic", "public"])) {
  fail("suiteRules.dataPolicy must require synthetic or public examples");
}

if (!includesAny(suite.suiteRules?.dataPolicy, ["secret", "provider key", "private"])) {
  fail("suiteRules.dataPolicy must prohibit secrets, provider keys, or private data");
}

if (!includesAny(suite.suiteRules?.nonClaims, ["no live model", "no benchmark", "no provider routing", "no training"])) {
  fail("suiteRules.nonClaims must preserve fixture-only non-claim boundaries");
}

if (!includesAny(suite.suiteRules?.approvalRules, ["human approval", "security", "ssh", "deployment"])) {
  fail("suiteRules.approvalRules must name human approval and privileged surfaces");
}

assertNonEmptyArray("fixtures", suite.fixtures);

const fixtureIds = new Set();
const surfaces = new Set();

for (const fixture of suite.fixtures || []) {
  assertString("fixture.id", fixture.id);

  if (!idPattern.test(fixture.id || "")) {
    fail(`fixture id must be lowercase slug: ${fixture.id}`);
  } else if (fixtureIds.has(fixture.id)) {
    fail(`duplicate fixture id: ${fixture.id}`);
  } else {
    fixtureIds.add(fixture.id);
  }

  surfaces.add(fixture.assistantSurface);

  if (!expectedSurfaces.includes(fixture.assistantSurface)) {
    fail(`unsupported assistant surface: ${fixture.assistantSurface}`);
  }

  if (!idPattern.test(fixture.promptVersionId || "")) {
    fail(`${fixture.id} promptVersionId must be a lowercase slug`);
  }

  for (const field of [
    "purpose",
    "syntheticUserInput",
    "sourceDocument",
    "status"
  ]) {
    assertString(`${fixture.id}.${field}`, fixture[field]);
  }

  if (fixture.status !== "fixture-backed") {
    fail(`${fixture.id} status must be fixture-backed`);
  }

  assertRepoPath(`${fixture.id}.sourceDocument`, fixture.sourceDocument);

  for (const field of [
    "allowedContext",
    "forbiddenContext",
    "expectedOutputFields",
    "blockedScenarios",
    "approvalTriggers",
    "evidenceRequired",
    "auditMetadata"
  ]) {
    assertNonEmptyArray(`${fixture.id}.${field}`, fixture[field]);
  }

  if ((fixture.expectedOutputFields || []).length < 4) {
    fail(`${fixture.id}.expectedOutputFields must contain at least four fields`);
  }

  if (!includesAny(fixture.forbiddenContext, ["secret", "private", "restricted", "key", "credential"])) {
    fail(`${fixture.id}.forbiddenContext must include privacy or secret boundaries`);
  }

  if (!includesAny(fixture.approvalTriggers, ["approval", "push", "merge", "comment", "credential", "ssh", "training", "public", "roadmap", "framework", "commit", "pull request"])) {
    fail(`${fixture.id}.approvalTriggers must include a meaningful approval boundary`);
  }

  if (!includesAny(fixture.blockedScenarios, ["without approval", "secret", "trained", "benchmark", "claim", "push", "merge", "print", "rewrite", "framework", "dependency", "adr"])) {
    fail(`${fixture.id}.blockedScenarios must include a safety, privacy, or claim boundary`);
  }
}

assertIncludesAll("assistant surfaces", [...surfaces], expectedSurfaces);

const bySurface = new Map((suite.fixtures || []).map(fixture => [fixture.assistantSurface, fixture]));

if (!bySurface.get("security-reviewer")?.forbiddenContext?.some(item => /secret values|ssh private keys|provider credentials/i.test(item))) {
  fail("security-reviewer fixture must explicitly forbid secret values, SSH private keys, and provider credentials");
}

if (!bySurface.get("pr-reviewer")?.approvalTriggers?.some(item => /github comment|merge|push/i.test(item))) {
  fail("pr-reviewer fixture must gate GitHub comments, merges, and pushes");
}

if (!bySurface.get("roadmap-assistant")?.blockedScenarios?.some(item => /five-year goal complete/i.test(item))) {
  fail("roadmap-assistant fixture must block marking the five-year goal complete without evidence");
}

const researchFixture = bySurface.get("research-assistant");
for (const field of ["requiredProof", "nonClaim"]) {
  if (!researchFixture?.expectedOutputFields?.includes(field)) {
    fail(`research-assistant fixture expectedOutputFields must include ${field}`);
  }
}

if (!researchFixture?.evidenceRequired?.some(item => /training logs/i.test(item))) {
  fail("research-assistant fixture must require training logs before model ownership claims");
}

for (const docPath of requiredDocs) {
  const doc = readText(docPath);
  assertNoSecretPatterns(docPath, doc);

  if (!doc.includes("assistant-surface-regression-suite.json")) {
    fail(`${docPath} must reference assistant-surface-regression-suite.json`);
  }

  if (!doc.includes("check:prompt-regression-fixtures")) {
    fail(`${docPath} must reference check:prompt-regression-fixtures`);
  }
}

if (failures.length > 0) {
  console.error("SEIS prompt regression fixture check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS prompt regression fixture check passed.");
