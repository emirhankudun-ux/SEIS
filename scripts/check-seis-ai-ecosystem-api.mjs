#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const contractPath = "data/seis-ai-ecosystem-api-contract.json";
const packagePath = "package.json";
const files = [
  "server/ai_ecosystem_api/app.py",
  "server/ai_ecosystem_api/routes.py",
  "server/ai_ecosystem_api/services.py",
  "server/ai_ecosystem_api/storage.py",
  "server/ai_ecosystem_api/models.py",
  "server/ai_ecosystem_api/requirements.txt",
  "server/ai_ecosystem_api/README.md",
  "server/ai_ecosystem_api/tests/test_services.py"
];
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

function textOf(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

const contract = readJson(contractPath);
const packageJson = readJson(packagePath);
const routesText = textOf("server/ai_ecosystem_api/routes.py");
const appText = textOf("server/ai_ecosystem_api/app.py");
const servicesText = textOf("server/ai_ecosystem_api/services.py");
const storageText = textOf("server/ai_ecosystem_api/storage.py");
const readmeText = textOf("server/ai_ecosystem_api/README.md");
const requirementsText = textOf("server/ai_ecosystem_api/requirements.txt");
const serializedContract = JSON.stringify(contract);

if (contract.id !== "seis-ai-ecosystem-api-contract") {
  fail("contract id must be seis-ai-ecosystem-api-contract");
}

if (contract.backendFramework !== "FastAPI") {
  fail("backendFramework must be FastAPI");
}

if (!`${contract.storage}`.includes("SQLite")) {
  fail("contract must declare SQLite local storage");
}

for (const filePath of files) {
  if (!existsSync(filePath)) {
    fail(`missing API file ${filePath}`);
  }
}

for (const sourcePath of contract.sourceBasis ?? []) {
  if (!existsSync(sourcePath)) {
    fail(`missing sourceBasis entry ${sourcePath}`);
  }
}

for (const system of [
  "SEIS AI Core",
  "Autonomous Agent Orchestrator",
  "Plugin Registry",
  "Plugin Feeding System",
  "SSH Connector Layer",
  "Local AI Model Connector",
  "Remote AI Model Connector",
  "Website Builder Agent",
  "Goal Tracking Agent",
  "Memory Agent",
  "Deployment Agent",
  "Repository Governance Agent"
]) {
  if (!contract.systems?.includes(system)) {
    fail(`contract systems must include ${system}`);
  }
}

for (const endpoint of contract.endpoints ?? []) {
  const routePath = `${endpoint.path}`.replace(/^\/api\/v1/, "") || "/";
  if (!routesText.includes(`"${routePath}"`)) {
    fail(`routes.py must expose ${endpoint.method} ${endpoint.path}`);
  }
}

for (const engine of [
  "Self Analysis Engine",
  "Self Improvement Engine",
  "Knowledge Expansion Engine",
  "Autonomous Learning Engine",
  "Goal Driven Evolution Engine",
  "Architecture Evolution Engine",
  "Agent Evolution Engine",
  "Plugin Evolution Engine",
  "Memory Optimization Engine"
]) {
  if (!contract.selfEvolutionEngines?.includes(engine)) {
    fail(`contract selfEvolutionEngines must include ${engine}`);
  }
}

for (const token of ["FastAPI", "create_app", "create_router"]) {
  if (!appText.includes(token)) {
    fail(`app.py must include ${token}`);
  }
}

for (const token of ["EcosystemService", "overview", "agents", "plugins", "websites", "goals", "memory", "ssh", "model_connectors", "self_evolution", "knowledge_graphs"]) {
  if (!servicesText.includes(token)) {
    fail(`services.py must include ${token}`);
  }
}

for (const token of ["sqlite3", "goals", "memory_events", "upsert_goal", "record_memory_event"]) {
  if (!storageText.includes(token)) {
    fail(`storage.py must include ${token}`);
  }
}

if (!requirementsText.includes("fastapi") || !requirementsText.includes("uvicorn")) {
  fail("requirements.txt must include fastapi and uvicorn");
}

for (const token of ["uvicorn server.ai_ecosystem_api.app:app", "GET /api/v1/health", "POST /api/v1/memory/events", "GET /api/v1/self-evolution", "GET /api/v1/knowledge-graphs"]) {
  if (!readmeText.includes(token)) {
    fail(`README must include ${token}`);
  }
}

if (packageJson.scripts?.["test:seis-ai-ecosystem-api"] !== "python3 -m unittest server.ai_ecosystem_api.tests.test_services") {
  fail("package.json must expose test:seis-ai-ecosystem-api");
}

if (packageJson.scripts?.["check:seis-ai-ecosystem-api"] !== "npm run test:seis-ai-ecosystem-api && node scripts/check-seis-ai-ecosystem-api.mjs") {
  fail("package.json must expose check:seis-ai-ecosystem-api");
}

if (!`${packageJson.scripts?.["check:seis-ai-local-integration"] ?? ""}`.includes("check:seis-ai-ecosystem-api")) {
  fail("check:seis-ai-local-integration must include ecosystem API check");
}

if (packageJson.scripts?.["check:seis-ai-self-evolution"] !== "node scripts/check-seis-ai-self-evolution.mjs") {
  fail("package.json must expose check:seis-ai-self-evolution");
}

for (const boundary of [
  "No API key, token, SSH key, or credential is hardcoded.",
  "Provider credentials remain environment-only and server-side.",
  "SSH endpoints expose safe modes and contract metadata only; live host mutation remains approval-gated.",
  "Plugin endpoints expose metadata and plans only; permission expansion is blocked without review."
]) {
  if (!contract.securityBoundaries?.includes(boundary)) {
    fail(`contract securityBoundaries must include: ${boundary}`);
  }
}

for (const forbidden of [
  /\/Users\//,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])gh[pousr]_[A-Za-z0-9_]{20,}/
]) {
  if (forbidden.test(serializedContract) || forbidden.test(appText) || forbidden.test(routesText) || forbidden.test(servicesText) || forbidden.test(storageText)) {
    fail(`API files contain forbidden sensitive or machine-specific pattern: ${forbidden}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS AI ecosystem API check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS AI ecosystem API check passed.");
