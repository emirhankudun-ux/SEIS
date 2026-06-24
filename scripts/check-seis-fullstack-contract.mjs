#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  contract: "content/development/seis-fullstack-contract.json",
  server: "server/node/static-server.mjs",
  serverSmoke: "scripts/check-seis-fullstack-server-smoke.mjs",
  noServerFallbackSmoke: "scripts/check-seis-fullstack-no-server-fallback-smoke.mjs",
  packageJson: "package.json",
  dataSchemaRegistry: "content/development/seis-data-schema-registry.json",
  architectureDoc: "docs/architecture/seis-full-stack-transition.md",
  fullstackReadme: "apps/fullstack/README.md",
  readme: "README.md",
  status: "docs/STATUS.md",
  docsIndex: "docs/INDEX.md",
  masterIndex: "docs/SEIS_MASTER_INDEX.md",
  masterBacklog: "docs/roadmap/MASTER_BACKLOG.md",
  nextPrQueue: "docs/roadmap/NEXT_PR_QUEUE.md"
};

const requiredRoutes = [
  "/_server/session",
  "/_server/capabilities",
  "/_server/projects",
  "/_server/app-installs",
  "/_server/provider-status",
  "/_server/audit-log",
  "/_server/agent-tasks",
  "/_server/fullstack-contract"
];
const requiredSourceKeys = ["session", "capabilities", "projects", "appInstalls", "providerStatus", "auditLogs", "agentTasks"];
const allowedProviderStates = new Set(["Available", "Missing Key", "Disabled", "Rate Limited", "Error"]);
const publicEnvPrefixes = ["NEXT_PUBLIC_", "VITE_", "PUBLIC_", "REACT_APP_", "NUXT_PUBLIC_", "EXPO_PUBLIC_", "ASTRO_PUBLIC_"];
const secretLikePatterns = [
  /sk-[A-Za-z0-9_-]{16,}/,
  /ghp_[A-Za-z0-9_]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/
];

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(relativePath, label);
}

const contract = readJson(paths.contract, "full-stack contract");
const server = readText(paths.server, "static server");
const packageJson = readJson(paths.packageJson, "package.json");
const dataSchemaRegistry = readJson(paths.dataSchemaRegistry, "data schema registry");
const architectureDoc = readText(paths.architectureDoc, "architecture doc");
const fullstackReadme = readText(paths.fullstackReadme, "full-stack README");
const readme = readText(paths.readme, "README");
const status = readText(paths.status, "status");
const docsIndex = readText(paths.docsIndex, "docs index");
const masterIndex = readText(paths.masterIndex, "master index");
const masterBacklog = readText(paths.masterBacklog, "master backlog");
const nextPrQueue = readText(paths.nextPrQueue, "next PR queue");

if (contract) {
  ensure(contract.id === "seis-fullstack-contract", "contract id must remain seis-fullstack-contract");
  ensure(contract.schemaVersion === 1, "contract schemaVersion must be 1");
  ensure(contract.status === "validated-contract", "contract status must be validated-contract");
  ensure(contract.mode === "local-demo-no-key-fullstack-foundation", "contract mode mismatch");
  ensure(contract.qualityGate === "npm run check:seis-fullstack-contract", "contract qualityGate mismatch");
  ensure(contract.runtimeGate === "npm run check:seis-fullstack-server-smoke", "contract runtimeGate mismatch");
  ensure(contract.fallbackGate === "npm run check:seis-fullstack-no-server-fallback-smoke", "contract fallbackGate mismatch");
  ensure(contract.coreCredentialRequirement === "none", "core credential requirement must be none");
  ensure(contract.localDemoFirst === true, "localDemoFirst must be true");
  ensure(contract.staticDemoFallbackRequired === true, "staticDemoFallbackRequired must be true");

  for (const [label, relativePath] of Object.entries(contract.sourceOfTruth || {})) {
    ensure(typeof relativePath === "string" && relativePath.length > 0, `sourceOfTruth.${label} is required`);
    ensureFile(relativePath, `sourceOfTruth.${label}`);
  }

  ensureArrayIncludesAll(contract.securityInvariants, [
    "Core SEIS must start with zero cloud provider keys.",
    "Provider secrets must never be stored in browser localStorage, IndexedDB, route config, static JSON, or frontend bundles.",
    "Local Demo fallback must remain available when every optional provider key is missing."
  ], "securityInvariants");

  ensureArrayIncludesAll(contract.frontendState?.forbiddenClientPersistence, [
    "API keys",
    "tokens",
    "passwords",
    "SSH private keys",
    "service accounts",
    "provider credentials"
  ], "frontendState.forbiddenClientPersistence");
  ensure(String(contract.frontendState?.fallbackContract || "").includes("without the server endpoints"), "frontend fallback contract must preserve no-server startup");

  ensure(contract.serverBoundary?.runtime === "node:http static server", "serverBoundary.runtime mismatch");
  ensure(contract.serverBoundary?.dependencyPolicy === "no-new-dependencies-first", "serverBoundary.dependencyPolicy mismatch");
  ensure(contract.serverBoundary?.writePolicy === "read-only endpoints for first contract slice", "serverBoundary.writePolicy mismatch");
  ensureArrayIncludesAll(contract.serverBoundary?.approvalRequiredFor, [
    "new runtime dependencies",
    "external database",
    "authentication provider",
    "live AI provider calls",
    "SSH execution",
    "deployment",
    "real credential handling"
  ], "serverBoundary.approvalRequiredFor");

  const endpoints = Array.isArray(contract.publicEndpoints) ? contract.publicEndpoints : [];
  ensureArrayIncludesAll(endpoints.map((endpoint) => endpoint.route), requiredRoutes, "publicEndpoints.route");
  ensureArrayIncludesAll(endpoints.map((endpoint) => endpoint.sourceKey), [...requiredSourceKeys, "self"], "publicEndpoints.sourceKey");
  for (const endpoint of endpoints) {
    ensure(endpoint.method === "GET", `${endpoint.route} must remain GET`);
    ensure(endpoint.mode === "read-only", `${endpoint.route} must remain read-only`);
    ensure(endpoint.status === "working-local-demo", `${endpoint.route} must stay working-local-demo`);
    if (endpoint.sourceKey !== "self") {
      ensure(Object.prototype.hasOwnProperty.call(contract, endpoint.sourceKey), `${endpoint.route} sourceKey missing data: ${endpoint.sourceKey}`);
    }
  }

  for (const key of requiredSourceKeys) {
    const value = contract[key];
    ensure(value !== undefined, `contract missing ${key}`);
    ensure(Array.isArray(value) ? value.length > 0 : typeof value === "object", `${key} must contain data`);
  }

  ensure(contract.session?.sessionId === "local-demo-session", "session must remain local-demo-session");
  ensure(contract.session?.auth?.status === "planned", "auth must remain planned in first contract");
  ensure(contract.session?.capabilitySummary?.ssh === "disabled", "session SSH summary must remain disabled");
  ensure(contract.session?.capabilitySummary?.deployment === "disabled", "session deployment summary must remain disabled");

  const capabilityIds = (contract.capabilities || []).map((capability) => capability.id);
  ensureArrayIncludesAll(capabilityIds, [
    "frontend-os-shell",
    "browser-local-vfs",
    "server-api-fixtures",
    "provider-router",
    "external-database",
    "ssh-execution",
    "deployment"
  ], "capabilities");

  for (const provider of contract.providerStatus || []) {
    ensure(allowedProviderStates.has(provider.status), `${provider.providerId} has invalid status ${provider.status}`);
    ensure(provider.backendOnly === true, `${provider.providerId} must be backendOnly`);
    ensure(provider.frontendSecretAllowed === false, `${provider.providerId} must forbid frontend secrets`);
    ensure(provider.liveCallVerified === false, `${provider.providerId} must not claim live verification`);
    for (const envName of provider.expectedEnv || []) {
      ensure(!publicEnvPrefixes.some((prefix) => envName.startsWith(prefix)), `${provider.providerId} exposes public env prefix: ${envName}`);
    }
    if (provider.status !== "Available") {
      ensure(provider.routeEligible === false, `${provider.providerId} cannot be route eligible while ${provider.status}`);
    }
  }

  for (const event of contract.auditLogs || []) {
    ensure(event.redacted === true, `${event.id} audit log must be redacted`);
  }

  for (const task of contract.agentTasks || []) {
    ensure(Array.isArray(task.forbiddenActions) && task.forbiddenActions.length > 0, `${task.taskId} must list forbidden actions`);
    ensure(task.forbiddenActions.includes("secret access") || task.forbiddenActions.includes("print secret") || task.approvalRequired === true, `${task.taskId} must block secrets or require approval`);
    ensure(typeof task.validation === "string" && task.validation.length > 0, `${task.taskId} must define validation`);
  }

  scanForSecretLikeValues(contract, "contract");
}

for (const route of requiredRoutes) {
  ensure(server.includes(route), `static server missing route ${route}`);
}
ensure(server.includes("buildFullstackPayload"), "static server must expose buildFullstackPayload");
ensure(server.includes("seis-fullstack-contract.json"), "static server must read seis-fullstack-contract.json");

ensure(
  packageJson?.scripts?.["check:seis-fullstack-contract"] === "node scripts/check-seis-fullstack-contract.mjs",
  "package.json must expose check:seis-fullstack-contract"
);
ensure(
  packageJson?.scripts?.["check:seis-fullstack-server-smoke"] === "node scripts/check-seis-fullstack-server-smoke.mjs",
  "package.json must expose check:seis-fullstack-server-smoke"
);
ensure(
  packageJson?.scripts?.["check:seis-fullstack-no-server-fallback-smoke"] === "node scripts/check-seis-fullstack-no-server-fallback-smoke.mjs",
  "package.json must expose check:seis-fullstack-no-server-fallback-smoke"
);
ensure(
  String(packageJson?.scripts?.["quality:governance"] || "").includes("npm run check:seis-fullstack-contract"),
  "quality:governance must include check:seis-fullstack-contract"
);

const schemaRecord = (dataSchemaRegistry?.records || []).find((record) => record.id === "seis-fullstack-contract");
ensure(schemaRecord, "data schema registry missing seis-fullstack-contract record");
if (schemaRecord) {
  ensure(schemaRecord.path === paths.contract, "schema record path mismatch");
  ensure(schemaRecord.expectedShape === "object", "schema record expectedShape mismatch");
  ensure((schemaRecord.validationCommands || []).includes("npm run check:seis-fullstack-contract"), "schema record missing validator command");
  ensure((schemaRecord.validationCommands || []).includes("npm run check:seis-fullstack-server-smoke"), "schema record missing server smoke command");
  ensure((schemaRecord.validationCommands || []).includes("npm run check:seis-fullstack-no-server-fallback-smoke"), "schema record missing no-server fallback smoke command");
  ensureArrayIncludesAll(schemaRecord.requiredTopLevelKeys, ["schemaVersion", "id", "updated", "publicEndpoints", "session", "providerStatus", "agentTasks"], "schemaRecord.requiredTopLevelKeys");
}

for (const [text, label] of [
  [architectureDoc, "architecture doc"],
  [fullstackReadme, "full-stack README"],
  [readme, "README"],
  [status, "status"],
  [docsIndex, "docs index"],
  [masterIndex, "master index"],
  [masterBacklog, "master backlog"],
  [nextPrQueue, "next PR queue"]
]) {
  ensure(text.includes("seis-fullstack-contract"), `${label} missing seis-fullstack-contract`);
}

for (const [text, label] of [
  [architectureDoc, "architecture doc"],
  [fullstackReadme, "full-stack README"],
  [nextPrQueue, "next PR queue"]
]) {
  ensure(text.includes("backend-only"), `${label} must call out backend-only secrets/providers`);
  ensure(text.includes("Local Demo"), `${label} must preserve Local Demo language`);
}

if (failures.length > 0) {
  console.error("SEIS full-stack contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SEIS full-stack contract check passed: ${requiredRoutes.length} read-only endpoints, ${requiredSourceKeys.length} data groups.`);

function abs(relativePath) {
  return path.join(root, ...String(relativePath).split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  if (!fs.existsSync(abs(relativePath))) {
    failures.push(`${label} missing: ${relativePath}`);
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

function scanForSecretLikeValues(value, trail) {
  if (typeof value === "string") {
    for (const pattern of secretLikePatterns) {
      ensure(!pattern.test(value), `secret-like value found at ${trail}`);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForSecretLikeValues(item, `${trail}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(value)) {
      scanForSecretLikeValues(nestedValue, `${trail}.${key}`);
    }
  }
}
