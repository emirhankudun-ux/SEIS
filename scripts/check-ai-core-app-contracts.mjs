import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/shared-types/schemas/ai-core-app-contract.schema.json";
const fixturePath = "packages/shared-types/fixtures/ai-core-command-center-foundation.json";
const appFixturePath = "apps/seis-core/ai-core-contract-fixture.js";
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
const appFixtureText = readText(appFixturePath);
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
  "toolRegistryEntries",
  "knowledgeSources",
  "retrievalQueryAdapters",
  "retrievalFilterControls",
  "retrievalEmptyStateTestCases",
  "retrievalResultCards",
  "noContentSearchTranscripts",
  "approvalRequests",
  "evaluationResults",
  "auditEvents",
  "repositoryFindings",
  "documentationStatuses",
  "securityFindings",
  "roadmapItems",
  "aiSurfaces",
  "repositoryIntelligence",
  "goalEvidenceGates",
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

const expectedEvaluationTargetTypes = [
  "prompt",
  "route",
  "agent",
  "tool",
  "app-state",
  "retrieval",
  "model-research"
];

const expectedAuditRedactionStates = [
  "redacted",
  "metadata-only",
  "not-sensitive"
];

const expectedRetrievalStates = [
  "approved",
  "pending-review",
  "local-only",
  "redacted",
  "restricted",
  "expired",
  "blocked"
];

const expectedGoalGateTypes = [
  "documentation",
  "schema",
  "fixture",
  "validation",
  "browser-evidence",
  "security-boundary",
  "human-approval",
  "non-claim"
];

const expectedGoalGateStatuses = [
  "pass",
  "fail",
  "blocked",
  "unknown"
];

const objectToArray = {
  modelRoute: "modelRoutes",
  promptVersion: "promptVersions",
  agentTask: "agentTasks",
  toolRegistryEntry: "toolRegistryEntries",
  knowledgeSource: "knowledgeSources",
  retrievalQueryAdapter: "retrievalQueryAdapters",
  retrievalFilterControl: "retrievalFilterControls",
  retrievalEmptyStateTestCase: "retrievalEmptyStateTestCases",
  retrievalResultCard: "retrievalResultCards",
  noContentSearchTranscript: "noContentSearchTranscripts",
  approvalRequest: "approvalRequests",
  evaluationResult: "evaluationResults",
  auditEvent: "auditEvents",
  repositoryFinding: "repositoryFindings",
  documentationStatus: "documentationStatuses",
  securityFinding: "securityFindings",
  roadmapItem: "roadmapItems",
  aiSurface: "aiSurfaces",
  repositoryIntelligence: "repositoryIntelligence",
  goalEvidenceGate: "goalEvidenceGates",
  goalTrackingState: "goalTrackingStates"
};

const secretPatterns = [
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])ghp_[A-Za-z0-9_]{20,}/,
  /(^|[^A-Za-z0-9_])gho_[A-Za-z0-9_]{20,}/,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /id_ed25519/,
  /id_rsa/,
  /\/Users\//
];

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

const appFixture = readAppFixture(appFixtureText);

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

for (const tool of fixture.toolRegistryEntries || []) {
  if (["external-write", "privileged", "destructive"].includes(tool.riskClass)) {
    if (!["approval-needed", "blocked"].includes(tool.permissionState)) {
      fail(`toolRegistryEntry ${tool.id} high-risk tool must be approval-needed or blocked`);
    }
    if (!["approval-needed", "blocked"].includes(tool.approvalState)) {
      fail(`toolRegistryEntry ${tool.id} high-risk tool must require or block approval`);
    }
  }
}

for (const source of fixture.knowledgeSources || []) {
  assertAllowed(
    `knowledgeSource.${source.id}.retrievalState`,
    source.retrievalState,
    expectedRetrievalStates
  );

  if (source.sourceClass === "archive") {
    if (!["pending-review", "restricted", "blocked"].includes(source.retrievalState)) {
      fail(`knowledgeSource ${source.id} archive source must be pending-review, restricted, or blocked`);
    }
    if (source.externalRoutingAllowed !== false) {
      fail(`knowledgeSource ${source.id} archive source must not allow external provider routing`);
    }
    if (source.storesRawContent !== false) {
      fail(`knowledgeSource ${source.id} archive source must not store raw content`);
    }
  }

  if (source.externalRoutingAllowed && !source.privacyMode.startsWith("external-provider")) {
    fail(`knowledgeSource ${source.id} external routing must use an external-provider privacy mode`);
  }

  if (source.privacyMode === "disabled" && source.status !== "blocked") {
    fail(`knowledgeSource ${source.id} disabled source must be blocked`);
  }
}

const knowledgeSourcesById = new Map((fixture.knowledgeSources || []).map((source) => [source.id, source]));
const retrievalAdaptersById = new Map((fixture.retrievalQueryAdapters || []).map((adapter) => [adapter.id, adapter]));
for (const adapter of fixture.retrievalQueryAdapters || []) {
  if (adapter.readOnly !== true) {
    fail(`retrievalQueryAdapter ${adapter.id} must be read-only`);
  }

  for (const flag of [
    "providerCallPerformed",
    "externalProviderRouting",
    "browserReceivesProviderKey",
    "secretMaterialStored",
    "storesRawContent",
    "writesPersistentMemory",
    "createsEmbeddingIndex"
  ]) {
    if (adapter[flag] !== false) {
      fail(`retrievalQueryAdapter ${adapter.id} must keep ${flag} false`);
    }
  }

  if (adapter.status === "validated" && adapter.mode !== "local-only") {
    fail(`retrievalQueryAdapter ${adapter.id} validated adapter must be local-only`);
  }

  if (adapter.status === "blocked" && adapter.approvalState !== "blocked") {
    fail(`retrievalQueryAdapter ${adapter.id} blocked adapter must have blocked approvalState`);
  }

  if (!adapter.forbiddenKnowledgeSourceIds?.includes("knowledge-discarded-assistant-archive")) {
    fail(`retrievalQueryAdapter ${adapter.id} must forbid discarded assistant archive`);
  }

  for (const sourceId of adapter.allowedKnowledgeSourceIds || []) {
    const source = knowledgeSourcesById.get(sourceId);
    if (!source) {
      fail(`retrievalQueryAdapter ${adapter.id} references unknown source ${sourceId}`);
      continue;
    }

    if (["archive", "live", "unknown"].includes(source.sourceClass)) {
      fail(`retrievalQueryAdapter ${adapter.id} allowed source must not be ${source.sourceClass}: ${sourceId}`);
    }

    if (!["approved", "local-only"].includes(source.retrievalState)) {
      fail(`retrievalQueryAdapter ${adapter.id} allowed source must be approved or local-only: ${sourceId}`);
    }

    if (source.externalRoutingAllowed !== false || source.storesRawContent !== false) {
      fail(`retrievalQueryAdapter ${adapter.id} allowed source must not route externally or store raw content: ${sourceId}`);
    }
  }
}

for (const control of fixture.retrievalFilterControls || []) {
  if (!["text", "select", "button"].includes(control.controlType)) {
    fail(`retrievalFilterControl ${control.id} has unsupported controlType ${control.controlType}`);
  }
  if (!["query", "sourceClass", "transcriptState", "reset"].includes(control.target)) {
    fail(`retrievalFilterControl ${control.id} has unsupported target ${control.target}`);
  }
  for (const flag of ["providerCallPerformed", "externalProviderRouting", "writesPersistentMemory"]) {
    if (control[flag] !== false) {
      fail(`retrievalFilterControl ${control.id} must keep ${flag} false`);
    }
  }
}

const retrievalFilterTargets = new Set((fixture.retrievalFilterControls || []).map((control) => control.target));
for (const target of ["query", "sourceClass", "transcriptState", "reset"]) {
  if (!retrievalFilterTargets.has(target)) {
    fail(`retrievalFilterControls missing ${target}`);
  }
}

for (const testCase of fixture.retrievalEmptyStateTestCases || []) {
  if (testCase.expectedResultCardCount !== 0 || testCase.expectedTranscriptCount !== 0) {
    fail(`retrievalEmptyStateTestCase ${testCase.id} must expect zero result cards and zero transcripts`);
  }
  if (testCase.expectedResultMessage !== "No local metadata card matches the current filters.") {
    fail(`retrievalEmptyStateTestCase ${testCase.id} must use the standard result-card empty-state message`);
  }
  if (testCase.expectedTranscriptMessage !== "No local no-content transcript matches the current filters.") {
    fail(`retrievalEmptyStateTestCase ${testCase.id} must use the standard transcript empty-state message`);
  }
  for (const flag of ["providerCallPerformed", "externalProviderRouting", "writesPersistentMemory"]) {
    if (testCase[flag] !== false) {
      fail(`retrievalEmptyStateTestCase ${testCase.id} must keep ${flag} false`);
    }
  }
}

for (const card of fixture.retrievalResultCards || []) {
  const adapter = retrievalAdaptersById.get(card.adapterId);
  if (!adapter) {
    fail(`retrievalResultCard ${card.id} references unknown adapter ${card.adapterId}`);
  }

  const source = knowledgeSourcesById.get(card.sourceId);
  if (!source) {
    fail(`retrievalResultCard ${card.id} references unknown source ${card.sourceId}`);
  } else {
    if (card.sourceClass !== source.sourceClass) {
      fail(`retrievalResultCard ${card.id} sourceClass must match ${card.sourceId}`);
    }
    if (card.retrievalState !== source.retrievalState) {
      fail(`retrievalResultCard ${card.id} retrievalState must match ${card.sourceId}`);
    }
    if (["archive", "live", "unknown"].includes(source.sourceClass)) {
      fail(`retrievalResultCard ${card.id} must not expose forbidden source class ${source.sourceClass}`);
    }
    if (!["approved", "local-only"].includes(source.retrievalState)) {
      fail(`retrievalResultCard ${card.id} source must be approved or local-only`);
    }
    if (source.externalRoutingAllowed !== false || source.storesRawContent !== false) {
      fail(`retrievalResultCard ${card.id} source must not route externally or store raw content`);
    }
  }

  for (const flag of [
    "providerCallPerformed",
    "externalProviderRouting",
    "storesRawContent",
    "rawContentReturned",
    "writesPersistentMemory",
    "createsEmbeddingIndex"
  ]) {
    if (card[flag] !== false) {
      fail(`retrievalResultCard ${card.id} must keep ${flag} false`);
    }
  }
}

for (const transcript of fixture.noContentSearchTranscripts || []) {
  const adapter = retrievalAdaptersById.get(transcript.adapterId);
  if (!adapter) {
    fail(`noContentSearchTranscript ${transcript.id} references unknown adapter ${transcript.adapterId}`);
  }

  if (transcript.resultCount !== 0) {
    fail(`noContentSearchTranscript ${transcript.id} must keep resultCount at 0`);
  }

  if (!["empty", "blocked"].includes(transcript.decisionState)) {
    fail(`noContentSearchTranscript ${transcript.id} decisionState must be empty or blocked`);
  }

  if (transcript.decisionState === "blocked" && !transcript.blockedSources?.includes("knowledge-discarded-assistant-archive")) {
    fail(`noContentSearchTranscript ${transcript.id} blocked transcript must include knowledge-discarded-assistant-archive`);
  }

  for (const sourceId of transcript.blockedSources || []) {
    const source = knowledgeSourcesById.get(sourceId);
    if (!source) {
      fail(`noContentSearchTranscript ${transcript.id} references unknown blocked source ${sourceId}`);
      continue;
    }
    if (source.externalRoutingAllowed !== false || source.storesRawContent !== false) {
      fail(`noContentSearchTranscript ${transcript.id} blocked source must not route externally or store raw content`);
    }
  }

  for (const flag of [
    "providerCallPerformed",
    "externalProviderRouting",
    "storesRawContent",
    "rawContentReturned",
    "writesPersistentMemory",
    "createsEmbeddingIndex"
  ]) {
    if (transcript[flag] !== false) {
      fail(`noContentSearchTranscript ${transcript.id} must keep ${flag} false`);
    }
  }
}

for (const evaluation of fixture.evaluationResults || []) {
  assertAllowed(
    `evaluationResult.${evaluation.id}.targetType`,
    evaluation.targetType,
    expectedEvaluationTargetTypes
  );
}

for (const auditEvent of fixture.auditEvents || []) {
  assertAllowed(
    `auditEvent.${auditEvent.id}.redactionState`,
    auditEvent.redactionState,
    expectedAuditRedactionStates
  );
}

for (const goal of fixture.goalTrackingStates || []) {
  if (goal.progressState === "complete" && goal.completionEvidence !== "validated") {
    fail(`goalTrackingState ${goal.id} cannot be complete without validated evidence`);
  }
}

const goalsById = new Map((fixture.goalTrackingStates || []).map((goal) => [goal.id, goal]));
const gatesByGoalId = new Map();

for (const gate of fixture.goalEvidenceGates || []) {
  assertAllowed(`goalEvidenceGate.${gate.id}.gateType`, gate.gateType, expectedGoalGateTypes);
  assertAllowed(`goalEvidenceGate.${gate.id}.gateStatus`, gate.gateStatus, expectedGoalGateStatuses);

  if (!goalsById.has(gate.goalId)) {
    fail(`goalEvidenceGate ${gate.id} references unknown goal ${gate.goalId}`);
  }

  assertEvidencePath(`goalEvidenceGate.${gate.id}`, gate.evidence);

  if (!existsSync(gate.evidence)) {
    fail(`goalEvidenceGate ${gate.id} evidence path does not exist: ${gate.evidence}`);
  }

  if (gate.gateStatus !== "pass" && gate.blocker === "none") {
    fail(`goalEvidenceGate ${gate.id} must name a blocker when gateStatus is ${gate.gateStatus}`);
  }

  if (!Array.isArray(gate.nonClaims) || gate.nonClaims.length === 0) {
    fail(`goalEvidenceGate ${gate.id} must include non-claims`);
  }

  if (!gatesByGoalId.has(gate.goalId)) {
    gatesByGoalId.set(gate.goalId, []);
  }
  gatesByGoalId.get(gate.goalId).push(gate);
}

for (const goal of fixture.goalTrackingStates || []) {
  const gates = gatesByGoalId.get(goal.id) || [];
  if (gates.length === 0) {
    fail(`goalTrackingState ${goal.id} must have at least one goalEvidenceGate`);
  }

  const requiredGates = gates.filter((gate) => gate.required === true);
  if (requiredGates.length === 0) {
    fail(`goalTrackingState ${goal.id} must have at least one required goalEvidenceGate`);
  }

  if (goal.progressState === "validated" || goal.progressState === "complete" || goal.completionEvidence === "validated") {
    const failingGate = requiredGates.find((gate) => gate.gateStatus !== "pass");
    if (failingGate) {
      fail(`goalTrackingState ${goal.id} cannot be validated or complete while required gate ${failingGate.id} is ${failingGate.gateStatus}`);
    }
  }
}

const fixtureText = JSON.stringify(fixture);
for (const pattern of secretPatterns) {
  if (pattern.test(fixtureText)) {
    fail(`fixture appears to contain sensitive material matching ${pattern}`);
  }
}

const appFixtureJson = JSON.stringify(appFixture);
for (const pattern of secretPatterns) {
  if (pattern.test(appFixtureJson)) {
    fail(`app fixture appears to contain sensitive material matching ${pattern}`);
  }
}

if (appFixture.sourceFixture !== fixturePath) {
  fail(`app fixture must reference ${fixturePath}`);
}

for (const key of [
  "id",
  "status",
  "stateVocabulary",
  "llmExecutionModes",
  "moduleMaturities",
  "modelRoutes",
  "promptVersions",
  "agentTasks",
  "toolRegistryEntries",
  "knowledgeSources",
  "retrievalQueryAdapters",
  "retrievalFilterControls",
  "retrievalEmptyStateTestCases",
  "retrievalResultCards",
  "noContentSearchTranscripts",
  "approvalRequests",
  "evaluationResults",
  "auditEvents",
  "repositoryFindings",
  "documentationStatuses",
  "securityFindings",
  "roadmapItems",
  "aiSurfaces",
  "repositoryIntelligence",
  "goalEvidenceGates",
  "goalTrackingStates"
]) {
  if (JSON.stringify(appFixture[key]) !== JSON.stringify(fixture[key])) {
    fail(`app fixture projection is out of sync for ${key}`);
  }
}

for (const requiredFixtureRecord of [
  "docs/ai/seis-ai-operating-model-5-year.md",
  "task-ai-operating-model",
  "eval-ai-operating-model",
  "audit-ai-operating-model",
  "roadmap-year-1-ai-operating-model",
  "gate-five-year-operating-model-doc",
  "gate-five-year-agent-runtime-validation",
  "gate-five-year-command-center-surface",
  "gate-five-year-provider-boundary"
]) {
  if (!JSON.stringify(fixture).includes(requiredFixtureRecord)) {
    fail(`${fixturePath} must include ${requiredFixtureRecord}`);
  }
  if (!JSON.stringify(appFixture).includes(requiredFixtureRecord)) {
    fail(`${appFixturePath} must include ${requiredFixtureRecord}`);
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
