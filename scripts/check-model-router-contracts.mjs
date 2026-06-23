import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/model-router/schemas/model-router-route-contract.schema.json";
const fixturePath = "packages/model-router/fixtures/model-router-route-contracts.json";
const readmePath = "packages/model-router/README.md";
const modelRouterDocPath = "docs/ai/model-router.md";
const providerPolicyPath = "docs/ai/provider-routing-policy.md";
const reviewPath = "docs/reviews/SEIS_5_YEAR_DEVELOPMENT_PROGRAM_REVIEW.md";
const roadmapPath = "roadmap/seis-ai-core-command-center-5-year-development-program.md";

const failures = [];

const requiredTopLevel = [
  "version",
  "id",
  "status",
  "sourceDocuments",
  "routeModes",
  "routes",
  "nonClaims"
];

const requiredRouteModes = [
  "local-only",
  "metadata-only",
  "approval-needed"
];

const requiredRouteIds = [
  "route-contract-local-repository-review",
  "route-contract-metadata-documentation-summary",
  "route-contract-provider-redacted-approval-needed"
];

const requiredNonClaimTerms = [
  "No live provider adapter",
  "No provider API key",
  "No provider call",
  "Approval-needed routes are blocked fixtures",
  "Browser clients do not receive provider keys"
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

function collectLinks(route) {
  return [
    ...(route.sourceLinks || []),
    ...(route.request?.sourceLinks || []),
    ...(route.response?.sourceLinks || [])
  ];
}

const schemaText = readText(schemaPath);
const fixtureText = readText(fixturePath);
const schema = readJson(schemaPath);
const fixture = readJson(fixturePath);

for (const [filePath, text] of [
  [schemaPath, schemaText],
  [fixturePath, fixtureText],
  [readmePath, readText(readmePath)],
  [modelRouterDocPath, readText(modelRouterDocPath)],
  [providerPolicyPath, readText(providerPolicyPath)],
  [reviewPath, readText(reviewPath)],
  [roadmapPath, readText(roadmapPath)]
]) {
  assertNoSensitivePatterns(filePath, text);
}

if (schema.$id !== "https://seis.dev/schemas/model-router-route-contract.schema.json") {
  fail("model-router route contract schema $id must remain stable");
}

for (const key of requiredTopLevel) {
  if (!(key in fixture)) {
    fail(`fixture missing top-level key: ${key}`);
  }

  if (!schema.required?.includes(key)) {
    fail(`schema.required missing ${key}`);
  }
}

if (fixture.id !== "model-router-route-contracts") {
  fail("fixture id must be model-router-route-contracts");
}

if (fixture.status !== "fixture-backed") {
  fail("fixture status must be fixture-backed");
}

assertIncludesAll("routeModes", fixture.routeModes, requiredRouteModes);
assertIncludesAll("routes", (fixture.routes || []).map((route) => route.id), requiredRouteIds);
textIncludesAll("nonClaims", fixture.nonClaims, requiredNonClaimTerms);

for (const sourceDocument of fixture.sourceDocuments || []) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

const seenRouteIds = new Set();
for (const route of fixture.routes || []) {
  if (seenRouteIds.has(route.id)) {
    fail(`duplicate route id: ${route.id}`);
  }
  seenRouteIds.add(route.id);

  if (route.id.includes("provider") && route.status !== "approval-needed") {
    fail(`${route.id} must remain approval-needed`);
  }

  if (route.request?.dataClass === "secret") {
    fail(`${route.id} must not route secret data`);
  }

  if (route.decision?.routeMode === "approval-needed") {
    if (route.decision.allowed !== false) {
      fail(`${route.id} approval-needed route must not be allowed`);
    }
    if (route.decision.approvalRequired !== true) {
      fail(`${route.id} approval-needed route must require approval`);
    }
    if (!route.response?.blockedReason || route.response.blockedReason === "not-blocked") {
      fail(`${route.id} approval-needed route must return blockedReason`);
    }
  }

  if (route.decision?.routeMode === "local-only") {
    if (route.request?.privacyMode !== "local-only" || route.response?.privacyMode !== "local-only") {
      fail(`${route.id} local-only route must stay local-only end to end`);
    }
    if (route.auditMetadata?.providerCallPerformed !== false) {
      fail(`${route.id} local-only route must not perform provider call`);
    }
  }

  if (route.decision?.routeMode === "metadata-only") {
    if (route.request?.privacyMode !== "metadata-only" || route.response?.privacyMode !== "metadata-only") {
      fail(`${route.id} metadata route must stay metadata-only end to end`);
    }
    if (route.decision.redactionRequired !== true) {
      fail(`${route.id} metadata route must require redaction/metadata boundary`);
    }
  }

  for (const booleanField of [
    "promptContentStored",
    "secretMaterialStored",
    "providerCallPerformed",
    "browserReceivesProviderKey"
  ]) {
    if (route.auditMetadata?.[booleanField] !== false) {
      fail(`${route.id}.auditMetadata.${booleanField} must be false`);
    }
  }

  if (!route.auditMetadata?.safeMetadata?.includes("route id")) {
    fail(`${route.id} audit metadata must include route id`);
  }

  for (const link of collectLinks(route)) {
    assertRepoPath(`${route.id}.sourceLinks`, link);
  }
}

for (const [filePath, requiredText] of [
  [readmePath, "model-router-route-contracts.json"],
  [readmePath, "check:model-router-contracts"],
  [modelRouterDocPath, "model-router-route-contracts.json"],
  [modelRouterDocPath, "check:model-router-contracts"],
  [providerPolicyPath, "model-router-route-contracts.json"],
  [providerPolicyPath, "check:model-router-contracts"],
  [reviewPath, "check:model-router-contracts"],
  [roadmapPath, "check:model-router-contracts"]
]) {
  const text = readText(filePath);
  if (!text.includes(requiredText)) {
    fail(`${filePath} must include ${requiredText}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS model-router contract check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS model-router contract check passed.");
