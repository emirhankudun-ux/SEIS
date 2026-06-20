import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/repository-assistant/schemas/local-readonly-repository-assistant.schema.json";
const fixturePath = "packages/repository-assistant/fixtures/local-readonly-repository-assistant.json";
const readmePath = "packages/repository-assistant/README.md";
const productDocPath = "docs/product/repository-assistant.md";
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
  "sourceDocuments",
  "allowedCommands",
  "forbiddenActions",
  "assistantOutput",
  "auditMetadata",
  "nonClaims"
];

const requiredOutputBlocks = [
  "repositoryCondition",
  "evidence",
  "risks",
  "validationStatus",
  "recommendedBranchPlan",
  "excludedMaterial",
  "nextSafeAction"
];

const requiredForbiddenActionTerms = [
  "stage",
  "commit",
  "push",
  "merge",
  "delete",
  "rewrite",
  "ssh",
  "deploy",
  "provider",
  "secret"
];

const requiredNonClaimTerms = [
  "No external provider routing",
  "No GitHub write action",
  "No SSH",
  "No model training",
  "No secret"
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

function assertRepoPath(label, value) {
  if (typeof value !== "string") {
    fail(`${label} must be a string path`);
    return;
  }

  if (value.startsWith("/") || value.includes("..") || !repoPathPattern.test(value)) {
    fail(`${label} must be a relative evidence path: ${value}`);
  }

  if (!existsSync(value)) {
    fail(`${label} must exist: ${value}`);
  }
}

function assertNoSensitivePatterns(filePath, text) {
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      fail(`${filePath} contains disallowed sensitive or machine-specific pattern: ${pattern}`);
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

function collectSourceLinks(value, links = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectSourceLinks(item, links);
    }
    return links;
  }

  if (value && typeof value === "object") {
    if (Array.isArray(value.sourceLinks)) {
      links.push(...value.sourceLinks);
    }

    for (const nested of Object.values(value)) {
      collectSourceLinks(nested, links);
    }
  }

  return links;
}

const schemaText = readText(schemaPath);
const fixtureText = readText(fixturePath);
const schema = readJson(schemaPath);
const fixture = readJson(fixturePath);

for (const [filePath, text] of [
  [schemaPath, schemaText],
  [fixturePath, fixtureText],
  [readmePath, readText(readmePath)],
  [productDocPath, readText(productDocPath)],
  [roadmapPath, readText(roadmapPath)],
  [reviewPath, readText(reviewPath)]
]) {
  assertNoSensitivePatterns(filePath, text);
}

if (schema.$id !== "https://seis.dev/schemas/local-readonly-repository-assistant.schema.json") {
  fail("schema $id must remain stable");
}

for (const key of requiredTopLevel) {
  if (!(key in fixture)) {
    fail(`fixture missing top-level key: ${key}`);
  }

  if (!schema.required?.includes(key)) {
    fail(`schema.required missing ${key}`);
  }
}

if (fixture.id !== "local-readonly-repository-assistant") {
  fail("fixture id must be local-readonly-repository-assistant");
}

if (fixture.status !== "local-alpha") {
  fail("fixture status must be local-alpha");
}

if (fixture.mode !== "local-only" || fixture.auditMetadata?.privacyMode !== "local-only") {
  fail("repository assistant prototype must remain local-only");
}

if (fixture.readOnly !== true || fixture.auditMetadata?.writesPerformed !== false) {
  fail("repository assistant prototype must remain read-only with no writes performed");
}

if (fixture.externalProviderRouting !== false || fixture.auditMetadata?.providerProfile !== "none-local-prototype") {
  fail("repository assistant prototype must not enable external provider routing");
}

assertNonEmptyArray("sourceDocuments", fixture.sourceDocuments);
for (const sourceDocument of fixture.sourceDocuments || []) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

assertNonEmptyArray("allowedCommands", fixture.allowedCommands);
textIncludesAll("allowedCommands", fixture.allowedCommands, ["git status", "git diff", "git log"]);

for (const forbiddenCommand of ["git add", "git commit", "git push", "gh pr merge", "ssh ", "deploy"]) {
  if (JSON.stringify(fixture.allowedCommands).toLowerCase().includes(forbiddenCommand)) {
    fail(`allowedCommands must not include write or privileged command: ${forbiddenCommand}`);
  }
}

assertNonEmptyArray("forbiddenActions", fixture.forbiddenActions);
textIncludesAll("forbiddenActions", fixture.forbiddenActions, requiredForbiddenActionTerms);

for (const key of requiredOutputBlocks) {
  if (!(key in (fixture.assistantOutput || {}))) {
    fail(`assistantOutput missing ${key}`);
  }
}

const sourceLinks = collectSourceLinks(fixture.assistantOutput);
if (sourceLinks.length < 10) {
  fail("assistantOutput must include at least ten source links");
}

for (const sourceLink of sourceLinks) {
  assertRepoPath("assistantOutput.sourceLinks", sourceLink);
}

for (const evidence of fixture.assistantOutput?.evidence || []) {
  if (!["git-state", "doc", "package", "validation", "roadmap", "security"].includes(evidence.kind)) {
    fail(`unsupported evidence kind: ${evidence.kind}`);
  }
}

assertNonEmptyArray("validationStatus", fixture.assistantOutput?.validationStatus);
for (const validation of fixture.assistantOutput?.validationStatus || []) {
  if (!["pass", "fail", "blocked", "not-run"].includes(validation.status)) {
    fail(`unsupported validation status: ${validation.status}`);
  }

  if (validation.status === "pass" && !validation.command.startsWith("npm run ")) {
    fail(`passing validation must reference an npm script command: ${validation.command}`);
  }
}

textIncludesAll("excludedMaterial", fixture.assistantOutput?.excludedMaterial, [
  "external provider calls",
  "provider keys",
  "GitHub writes",
  "SSH execution",
  "deployment",
  "model training",
  "benchmark claims",
  "secret values"
]);

textIncludesAll("nonClaims", fixture.nonClaims, requiredNonClaimTerms);

for (const [filePath, requiredText] of [
  [readmePath, "local-readonly-repository-assistant.json"],
  [readmePath, "check:repository-assistant-prototype"],
  [productDocPath, "local-readonly-repository-assistant.json"],
  [productDocPath, "check:repository-assistant-prototype"],
  [roadmapPath, "check:repository-assistant-prototype"],
  [reviewPath, "check:repository-assistant-prototype"]
]) {
  const text = readText(filePath);
  if (!text.includes(requiredText)) {
    fail(`${filePath} must include ${requiredText}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS repository assistant prototype check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS repository assistant prototype check passed.");
