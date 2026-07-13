#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  schema: "content/development/seis-prompt-pack-schema.json",
  fixtures: "content/development/seis-prompt-pack-fixtures.json",
  promptDoc: "docs/ai/prompt-engine.md",
  packageJson: "package.json",
};

const requiredPackFields = [
  "id",
  "title",
  "version",
  "ownerArea",
  "intendedCapability",
  "allowedContext",
  "deniedContext",
  "providerCapabilityRequirements",
  "outputSchema",
  "evaluationFixture",
  "rollbackNote",
  "allowedActions",
  "forbiddenActions",
  "safetyBoundaries",
  "validationMethod",
  "reviewState",
  "executionPolicy",
];
const requiredPackIds = [
  "base-seis-identity",
  "repo-audit",
  "security-review",
  "pr-rescue",
  "clean-room-demo-packaging",
];
const requiredDeniedTokens = ["API keys", "private keys", "cookies"];
const requiredForbiddenActions = ["print secrets", "force push"];
const executionFlags = [
  "promptExecuted",
  "providerCalled",
  "credentialRead",
  "archivePromoted",
  "browserSecretAllowed",
  "liveRoutingAllowed",
];
const forbiddenContentPatterns = [
  /-----BEGIN OPENSSH PRIVATE KEY-----/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /api[_-]?key\s*[:=]\s*['\"][A-Za-z0-9_-]{12,}/i,
  /access[_-]?token\s*[:=]\s*['\"][A-Za-z0-9_-]{12,}/i,
  /providerCalled"\s*:\s*true/,
  /credentialRead"\s*:\s*true/,
  /liveRoutingAllowed"\s*:\s*true/,
];

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(abs(relativePath), label);
}

const schema = readJson(paths.schema, "prompt-pack schema");
const fixtures = readJson(paths.fixtures, "prompt-pack fixtures");
const promptDoc = readText(paths.promptDoc, "prompt engine docs");
const packageJson = readJson(paths.packageJson, "package.json");
const schemaText = readText(paths.schema, "prompt-pack schema text");
const fixtureText = readText(paths.fixtures, "prompt-pack fixture text");

ensure(schema?.id === "seis-prompt-pack-schema", "schema id mismatch");
ensure(schema?.status === "documented-schema", "schema status must be documented-schema");
ensure(schema?.qualityGate === "npm run check:seis-prompt-pack-contracts", "schema quality gate mismatch");
ensureArrayIncludesAll(schema?.requiredFields, requiredPackFields, "schema.requiredFields");
ensureArrayIncludesAll(schema?.publicSafetyInvariants, [
  "Prompt packs must not contain API keys, private keys, real tokens, cookies, or private host credentials.",
  "Prompt packs must not enable browser-side live provider calls.",
], "schema.publicSafetyInvariants");
for (const flag of executionFlags) {
  ensure(schema?.executionPolicyInvariant?.[flag] === false, `schema executionPolicyInvariant.${flag} must stay false`);
}

ensure(fixtures?.id === "seis-prompt-pack-fixtures", "fixtures id mismatch");
ensure(fixtures?.status === "reviewed-fixture-set", "fixtures status must be reviewed-fixture-set");
ensure(fixtures?.qualityGate === "npm run check:seis-prompt-pack-contracts", "fixtures quality gate mismatch");
ensure(fixtures?.sourceOfTruth?.schema === paths.schema, "fixtures must point to prompt-pack schema");
ensure(fixtures?.sourceOfTruth?.promptEngineDoc === paths.promptDoc, "fixtures must point to prompt engine docs");
for (const flag of executionFlags) {
  ensure(fixtures?.executionPolicyInvariant?.[flag] === false, `fixtures executionPolicyInvariant.${flag} must stay false`);
}

const packs = Array.isArray(fixtures?.promptPacks) ? fixtures.promptPacks : [];
ensure(packs.length >= 3, "at least three reviewed prompt fixtures required");
ensureArrayIncludesAll(packs.map((pack) => pack.id), requiredPackIds, "promptPacks.ids");
for (const pack of packs) {
  for (const field of requiredPackFields) {
    ensure(pack[field] !== undefined, `${pack.id || "unknown-pack"} missing ${field}`);
  }
  ensure(/^[a-z0-9-]+$/.test(String(pack.id || "")), `${pack.id} id must be kebab-case`);
  ensure(String(pack.version || "").match(/^\d+\.\d+\.\d+$/), `${pack.id} version must be semver-style`);
  ensure(pack.reviewState === "reviewed-fixture", `${pack.id} must stay reviewed-fixture`);
  ensure(Array.isArray(pack.allowedContext) && pack.allowedContext.length > 0, `${pack.id}.allowedContext required`);
  ensure(Array.isArray(pack.deniedContext) && pack.deniedContext.length > 0, `${pack.id}.deniedContext required`);
  ensure(Array.isArray(pack.allowedActions) && pack.allowedActions.length > 0, `${pack.id}.allowedActions required`);
  ensure(Array.isArray(pack.forbiddenActions) && pack.forbiddenActions.length > 0, `${pack.id}.forbiddenActions required`);
  ensure(Array.isArray(pack.safetyBoundaries) && pack.safetyBoundaries.length > 0, `${pack.id}.safetyBoundaries required`);
  ensure(typeof pack.rollbackNote === "string" && pack.rollbackNote.length > 24, `${pack.id}.rollbackNote must be meaningful`);
  ensure(pack.outputSchema?.type === "object", `${pack.id}.outputSchema.type must be object`);
  ensure(Array.isArray(pack.outputSchema?.required) && pack.outputSchema.required.length > 0, `${pack.id}.outputSchema.required required`);
  ensure(typeof pack.evaluationFixture?.name === "string" && pack.evaluationFixture.name.length > 0, `${pack.id}.evaluationFixture.name required`);
  for (const flag of executionFlags) {
    ensure(pack.executionPolicy?.[flag] === false, `${pack.id}.executionPolicy.${flag} must stay false`);
  }
}

const allDeniedContext = packs.flatMap((pack) => pack.deniedContext || []);
for (const token of requiredDeniedTokens) {
  ensure(allDeniedContext.some((entry) => String(entry).includes(token)), `deniedContext missing ${token}`);
}
const allForbiddenActions = packs.flatMap((pack) => pack.forbiddenActions || []);
for (const action of requiredForbiddenActions) {
  ensure(allForbiddenActions.some((entry) => String(entry).includes(action)), `forbiddenActions missing ${action}`);
}

for (const [text, label] of [
  [schemaText, "prompt-pack schema"],
  [fixtureText, "prompt-pack fixtures"],
  [promptDoc, "prompt engine docs"],
]) {
  for (const pattern of forbiddenContentPatterns) {
    ensure(!pattern.test(text), `${label} contains forbidden pattern ${pattern}`);
  }
}

for (const token of [
  "content/development/seis-prompt-pack-schema.json",
  "content/development/seis-prompt-pack-fixtures.json",
  "npm run check:seis-prompt-pack-contracts",
  "reviewed-fixture-set",
  "promptExecuted: false",
  "providerCalled: false",
  "credentialRead: false",
]) {
  ensure(promptDoc.includes(token), `prompt engine docs missing ${token}`);
}
ensure(
  packageJson?.scripts?.["check:seis-prompt-pack-contracts"] === "node scripts/check-seis-prompt-pack-contracts.mjs",
  "package.json must expose check:seis-prompt-pack-contracts"
);

if (failures.length) {
  console.error("SEIS prompt-pack contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SEIS prompt-pack contract check passed. Prompt packs: ${packs.length}.`);

function abs(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) {
    ensure(values.has(item), `${label} missing ${item}`);
  }
}

function readJson(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}
