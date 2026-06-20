import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/agent-runtime/schemas/agent-runtime-task-lifecycle.schema.json";
const fixturePath = "packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json";
const readmePath = "packages/agent-runtime/README.md";
const agentRuntimeDocPath = "docs/ai/agent-runtime.md";
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
  "lifecycleStates",
  "approvalStates",
  "runs",
  "nonClaims"
];

const requiredLifecycleStates = [
  "planned",
  "ready",
  "running",
  "approval-needed",
  "blocked",
  "failed",
  "validated"
];

const requiredApprovalStates = [
  "not-required",
  "approval-needed",
  "approved",
  "denied",
  "blocked"
];

const requiredRunIds = [
  "run-docs-foundation-review-validated",
  "run-provider-routing-approval-needed",
  "run-ssh-deployment-review-blocked"
];

const requiredNonClaimTerms = [
  "No live autonomous orchestration",
  "No agent self-approval",
  "No GitHub write action",
  "No SSH command",
  "No external provider call"
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

const repoPathPattern = /^(docs|packages|roadmap|reports|apps|content|data|scripts)\/|^SECURITY\.md$/;

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
  [readmePath, readText(readmePath)],
  [agentRuntimeDocPath, readText(agentRuntimeDocPath)],
  [sharedDocsPath, readText(sharedDocsPath)],
  [reviewPath, readText(reviewPath)],
  [roadmapPath, readText(roadmapPath)]
]) {
  assertNoSensitivePatterns(filePath, text);
}

if (schema.$id !== "https://seis.dev/schemas/agent-runtime-task-lifecycle.schema.json") {
  fail("agent-runtime task lifecycle schema $id must remain stable");
}

for (const key of requiredTopLevel) {
  if (!(key in fixture)) {
    fail(`fixture missing top-level key: ${key}`);
  }

  if (!schema.required?.includes(key)) {
    fail(`schema.required missing ${key}`);
  }
}

if (fixture.id !== "agent-runtime-task-lifecycle") {
  fail("fixture id must be agent-runtime-task-lifecycle");
}

if (fixture.status !== "fixture-backed") {
  fail("fixture status must be fixture-backed");
}

assertIncludesAll("lifecycleStates", fixture.lifecycleStates, requiredLifecycleStates);
assertIncludesAll("approvalStates", fixture.approvalStates, requiredApprovalStates);
assertIncludesAll("runs", (fixture.runs || []).map((run) => run.id), requiredRunIds);
textIncludesAll("nonClaims", fixture.nonClaims, requiredNonClaimTerms);

for (const sourceDocument of fixture.sourceDocuments || []) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

const seenRunIds = new Set();
for (const run of fixture.runs || []) {
  if (seenRunIds.has(run.id)) {
    fail(`duplicate run id: ${run.id}`);
  }
  seenRunIds.add(run.id);

  if (run.lifecycleState !== run.status) {
    fail(`${run.id} lifecycleState and status must match in this fixture`);
  }

  if (run.approvalState === "approval-needed" && run.lifecycleState !== "approval-needed") {
    fail(`${run.id} approval-needed run must use approval-needed lifecycle state`);
  }

  if (run.approvalState === "blocked" && run.lifecycleState !== "blocked") {
    fail(`${run.id} blocked run must use blocked lifecycle state`);
  }

  if (run.validation?.result === "pass" && run.status !== "validated") {
    fail(`${run.id} pass validation requires validated status`);
  }

  for (const field of [
    "toolCallsPerformed",
    "writesPerformed",
    "externalProviderCalled",
    "privilegedOperationPerformed"
  ]) {
    if (run.auditMetadata?.[field] !== false) {
      fail(`${run.id}.auditMetadata.${field} must be false`);
    }
  }

  const forbidden = JSON.stringify(run.forbiddenActions || []).toLowerCase();
  for (const term of ["self-approve", "write secrets"]) {
    if (!forbidden.includes(term)) {
      fail(`${run.id} forbiddenActions must include ${term}`);
    }
  }

  if (!run.auditMetadata?.safeMetadata?.includes("run id")) {
    fail(`${run.id} audit metadata must include run id`);
  }

  for (const sourceLink of run.sourceLinks || []) {
    assertRepoPath(`${run.id}.sourceLinks`, sourceLink);
  }
  assertRepoPath(`${run.id}.validation.evidence`, run.validation?.evidence);
}

const sharedText = JSON.stringify(sharedFixture);
const appText = JSON.stringify(appFixture);
for (const requiredText of [
  "agent-runtime-task-lifecycle",
  "eval-agent-runtime-lifecycle",
  "audit-agent-runtime-lifecycle"
]) {
  if (!sharedText.includes(requiredText)) {
    fail(`${sharedFixturePath} must include ${requiredText}`);
  }
  if (!appText.includes(requiredText)) {
    fail(`${appFixturePath} must include ${requiredText}`);
  }
}

for (const [filePath, requiredText] of [
  [readmePath, "agent-runtime-task-lifecycle.json"],
  [readmePath, "check:agent-runtime-lifecycle"],
  [agentRuntimeDocPath, "agent-runtime-task-lifecycle.json"],
  [agentRuntimeDocPath, "check:agent-runtime-lifecycle"],
  [sharedDocsPath, "agent-runtime-task-lifecycle.json"],
  [reviewPath, "check:agent-runtime-lifecycle"],
  [roadmapPath, "check:agent-runtime-lifecycle"]
]) {
  const text = readText(filePath);
  if (!text.includes(requiredText)) {
    fail(`${filePath} must include ${requiredText}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS agent-runtime lifecycle check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS agent-runtime lifecycle check passed.");
