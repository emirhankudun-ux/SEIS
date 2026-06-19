import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/shared-types/schemas/ai-core-app-contract.schema.json";
const fixturePath = "packages/shared-types/fixtures/ai-core-command-center-foundation.json";
const docsPath = "docs/architecture/ai-core-app-shared-contracts.md";

const failures = [];

function fail(message) {
  failures.push(message);
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

function readText(filePath) {
  if (!existsSync(filePath)) {
    fail(`missing ${filePath}`);
    return "";
  }

  return readFileSync(filePath, "utf8");
}

const schema = readJson(schemaPath);
const fixture = readJson(fixturePath);
const docs = readText(docsPath);

const requiredTopLevel = [
  "version",
  "id",
  "status",
  "sourceDocuments",
  "stateVocabulary",
  "llmExecutionModes",
  "moduleMaturities",
  "modelRoutes",
  "promptVersions",
  "agentTasks",
  "approvalRequests",
  "evaluationResults",
  "auditEvents",
  "repositoryFindings",
  "documentationStatuses",
  "securityFindings",
  "roadmapItems",
  "aiSurfaces",
  "repositoryIntelligence",
  "goalTrackingStates"
];

const expectedStates = [
  "ready",
  "draft",
  "planned",
  "blocked",
  "approval-needed",
  "degraded",
  "unknown",
  "running",
  "failed",
  "validated"
];

const expectedExecutionModes = [
  "local-only",
  "local-preferred",
  "external-provider-allowed",
  "external-provider-redacted",
  "metadata-only",
  "offline",
  "disabled",
  "research-only"
];

const expectedMaturities = [
  "planned",
  "draft",
  "fixture-backed",
  "local-alpha",
  "provider-alpha",
  "beta",
  "stable",
  "research-only",
  "blocked"
];

const objectToArray = {
  modelRoute: "modelRoutes",
  promptVersion: "promptVersions",
  agentTask: "agentTasks",
  approvalRequest: "approvalRequests",
  evaluationResult: "evaluationResults",
  auditEvent: "auditEvents",
  repositoryFinding: "repositoryFindings",
  documentationStatus: "documentationStatuses",
  securityFinding: "securityFindings",
  roadmapItem: "roadmapItems",
  aiSurface: "aiSurfaces",
  repositoryIntelligence: "repositoryIntelligence",
  goalTrackingState: "goalTrackingStates"
};

const secretPatterns = [
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])ghp_[A-Za-z0-9_]{20,}/,
  /(^|[^A-Za-z0-9_])gho_[A-Za-z0-9_]{20,}/,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /id_ed25519/,
  /id_rsa/
];

function assertArrayIncludesAll(name, actual, expected) {
  if (!Array.isArray(actual)) {
    fail(`${name} must be an array`);
    return;
  }

  for (const item of expected) {
    if (!actual.includes(item)) {
      fail(`${name} missing ${item}`);
    }
  }
}

function assertNonEmptyArray(name, value) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${name} must be a non-empty array`);
  }
}

function assertEvidencePath(label, value) {
  if (typeof value !== "string") {
    fail(`${label} evidence must be a string`);
    return;
  }

  if (!/^(docs|packages|roadmap|reports|apps|content|data|scripts)\//.test(value)) {
    fail(`${label} evidence must be a relative repository path: ${value}`);
  }

  if (value.startsWith("/")) {
    fail(`${label} evidence must not be an absolute path: ${value}`);
  }
}

function assertAllowed(label, value, allowed) {
  if (!allowed.includes(value)) {
    fail(`${label} has unsupported value: ${value}`);
  }
}

for (const key of requiredTopLevel) {
  if (!(key in fixture)) {
    fail(`fixture missing top-level key: ${key}`);
  }

  if (!schema.required?.includes(key)) {
    fail(`schema.required missing ${key}`);
  }
}

if (schema.$id !== "https://seis.dev/schemas/ai-core-app-contract.schema.json") {
  fail("schema $id must remain stable");
}

for (const [definition, arrayName] of Object.entries(objectToArray)) {
  if (!schema.$defs?.[definition]) {
    fail(`schema missing $defs.${definition}`);
  }
  assertNonEmptyArray(arrayName, fixture[arrayName]);
}

assertArrayIncludesAll("stateVocabulary", fixture.stateVocabulary, expectedStates);
assertArrayIncludesAll("llmExecutionModes", fixture.llmExecutionModes, expectedExecutionModes);
assertArrayIncludesAll("moduleMaturities", fixture.moduleMaturities, expectedMaturities);

for (const source of fixture.sourceDocuments || []) {
  assertEvidencePath("sourceDocuments", source);
}

for (const collectionName of Object.values(objectToArray)) {
  const collection = fixture[collectionName] || [];
  const ids = new Set();

  for (const item of collection) {
    if (!item.id) {
      fail(`${collectionName} item missing id`);
    } else if (ids.has(item.id)) {
      fail(`${collectionName} has duplicate id: ${item.id}`);
    } else {
      ids.add(item.id);
    }

    if ("status" in item) {
      assertAllowed(`${collectionName}.${item.id}.status`, item.status, expectedStates);
    }

    if ("maturity" in item) {
      assertAllowed(`${collectionName}.${item.id}.maturity`, item.maturity, expectedMaturities);
    }

    if ("privacyMode" in item) {
      assertAllowed(
        `${collectionName}.${item.id}.privacyMode`,
        item.privacyMode,
        expectedExecutionModes
      );
    }

    if ("evidence" in item) {
      assertEvidencePath(`${collectionName}.${item.id}`, item.evidence);
    } else {
      fail(`${collectionName}.${item.id} missing evidence`);
    }
  }
}

for (const route of fixture.modelRoutes || []) {
  if (route.dataClass === "secret") {
    fail(`modelRoute ${route.id} must not route secret data`);
  }

  if (route.privacyMode.startsWith("external-provider") && route.approvalState !== "approval-needed") {
    fail(`modelRoute ${route.id} external provider route must require approval in fixture`);
  }
}

for (const approval of fixture.approvalRequests || []) {
  if (approval.riskClass === "high" && approval.decisionState !== "approval-needed") {
    fail(`approvalRequest ${approval.id} high risk fixture must remain approval-needed`);
  }
}

for (const goal of fixture.goalTrackingStates || []) {
  if (goal.progressState === "complete" && goal.completionEvidence !== "validated") {
    fail(`goalTrackingState ${goal.id} cannot be complete without validated evidence`);
  }
}

const fixtureText = JSON.stringify(fixture);
for (const pattern of secretPatterns) {
  if (pattern.test(fixtureText)) {
    fail(`fixture appears to contain sensitive material matching ${pattern}`);
  }
}

for (const objectName of Object.keys(objectToArray)) {
  if (!docs.includes(`\`${objectName}\``)) {
    fail(`shared contract docs must mention ${objectName}`);
  }
}

if (!docs.includes("ai-core-app-contract.schema.json")) {
  fail("shared contract docs must link the schema");
}

if (!docs.includes("ai-core-command-center-foundation.json")) {
  fail("shared contract docs must link the fixture");
}

if (failures.length > 0) {
  console.error("SEIS AI Core/App contract check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS AI Core/App contract check passed.");
