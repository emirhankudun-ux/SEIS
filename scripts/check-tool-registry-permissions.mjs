import { existsSync, readFileSync } from "node:fs";

const schemaPath = "packages/tool-registry/schemas/tool-registry-permissions.schema.json";
const fixturePath = "packages/tool-registry/fixtures/tool-registry-permissions.json";
const readmePath = "packages/tool-registry/README.md";
const toolUsePolicyPath = "docs/ai/tool-use-policy.md";
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
  "riskClasses",
  "permissionStates",
  "tools",
  "nonClaims"
];

const requiredRiskClasses = [
  "read-only",
  "local-write",
  "external-read",
  "external-write",
  "privileged",
  "destructive"
];

const requiredPermissionStates = [
  "allowed",
  "scoped",
  "approval-needed",
  "blocked",
  "disabled"
];

const requiredToolIds = [
  "tool-local-repository-inspection",
  "tool-scoped-local-file-edit",
  "tool-github-pr-publish",
  "tool-ssh-deployment-command"
];

const requiredNonClaimTerms = [
  "No tool execution",
  "No plugin install",
  "No SSH command",
  "No secret values",
  "Browser clients do not receive"
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
  [toolUsePolicyPath, readText(toolUsePolicyPath)],
  [sharedDocsPath, readText(sharedDocsPath)],
  [reviewPath, readText(reviewPath)],
  [roadmapPath, readText(roadmapPath)]
]) {
  assertNoSensitivePatterns(filePath, text);
}

if (schema.$id !== "https://seis.dev/schemas/tool-registry-permissions.schema.json") {
  fail("tool-registry permission schema $id must remain stable");
}

for (const key of requiredTopLevel) {
  if (!(key in fixture)) {
    fail(`fixture missing top-level key: ${key}`);
  }

  if (!schema.required?.includes(key)) {
    fail(`schema.required missing ${key}`);
  }
}

if (fixture.id !== "tool-registry-permissions") {
  fail("fixture id must be tool-registry-permissions");
}

if (fixture.status !== "fixture-backed") {
  fail("fixture status must be fixture-backed");
}

assertIncludesAll("riskClasses", fixture.riskClasses, requiredRiskClasses);
assertIncludesAll("permissionStates", fixture.permissionStates, requiredPermissionStates);
assertIncludesAll("tools", (fixture.tools || []).map((tool) => tool.id), requiredToolIds);
textIncludesAll("nonClaims", fixture.nonClaims, requiredNonClaimTerms);

for (const sourceDocument of fixture.sourceDocuments || []) {
  assertRepoPath("sourceDocuments", sourceDocument);
}

const seenToolIds = new Set();
for (const tool of fixture.tools || []) {
  if (seenToolIds.has(tool.id)) {
    fail(`duplicate tool id: ${tool.id}`);
  }
  seenToolIds.add(tool.id);

  if (["external-write", "privileged", "destructive"].includes(tool.riskClass)) {
    if (!["approval-needed", "blocked"].includes(tool.permissionState)) {
      fail(`${tool.id} high-risk tool must be approval-needed or blocked`);
    }
    if (!["approval-needed", "blocked"].includes(tool.approvalState)) {
      fail(`${tool.id} high-risk tool must require or block approval`);
    }
  }

  if (tool.permissionState === "blocked" && tool.status !== "blocked") {
    fail(`${tool.id} blocked tool must use blocked status`);
  }

  if (tool.permissionState === "approval-needed" && tool.status !== "approval-needed") {
    fail(`${tool.id} approval-needed tool must use approval-needed status`);
  }

  for (const field of [
    "toolExecuted",
    "writesPerformed",
    "externalNetworkUsed",
    "privilegedOperationPerformed",
    "secretMaterialAccessible"
  ]) {
    if (tool.auditMetadata?.[field] !== false) {
      fail(`${tool.id}.auditMetadata.${field} must be false`);
    }
  }

  const forbidden = JSON.stringify(tool.forbiddenActions || []).toLowerCase();
  for (const term of ["secrets", "self-approve"]) {
    if (!forbidden.includes(term)) {
      fail(`${tool.id} forbiddenActions must include ${term}`);
    }
  }

  if (!tool.auditMetadata?.safeMetadata?.includes("tool id")) {
    fail(`${tool.id} audit metadata must include tool id`);
  }

  for (const sourceLink of tool.sourceLinks || []) {
    assertRepoPath(`${tool.id}.sourceLinks`, sourceLink);
  }
  assertRepoPath(`${tool.id}.validation.evidence`, tool.validation?.evidence);
}

const sharedText = JSON.stringify(sharedFixture);
const appText = JSON.stringify(appFixture);
for (const requiredText of [
  "tool-registry-permissions",
  "eval-tool-registry-permissions",
  "audit-tool-registry-permissions"
]) {
  if (!sharedText.includes(requiredText)) {
    fail(`${sharedFixturePath} must include ${requiredText}`);
  }
  if (!appText.includes(requiredText)) {
    fail(`${appFixturePath} must include ${requiredText}`);
  }
}

for (const [filePath, requiredText] of [
  [readmePath, "tool-registry-permissions.json"],
  [readmePath, "check:tool-registry-permissions"],
  [toolUsePolicyPath, "tool-registry-permissions.json"],
  [toolUsePolicyPath, "check:tool-registry-permissions"],
  [sharedDocsPath, "tool-registry-permissions.json"],
  [reviewPath, "check:tool-registry-permissions"],
  [roadmapPath, "check:tool-registry-permissions"]
]) {
  const text = readText(filePath);
  if (!text.includes(requiredText)) {
    fail(`${filePath} must include ${requiredText}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS tool-registry permission check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS tool-registry permission check passed.");
