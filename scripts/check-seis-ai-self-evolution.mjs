#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const contractPath = "data/seis-ai-self-evolution-contract.json";
const packagePath = "package.json";
const servicePath = "server/ai_ecosystem_api/services.py";
const routesPath = "server/ai_ecosystem_api/routes.py";
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

function assertArrayIncludesAll(name, actual, expected) {
  if (!Array.isArray(actual)) {
    fail(`${name} must be an array`);
    return;
  }

  for (const item of expected) {
    if (!actual.includes(item)) {
      fail(`${name} must include ${item}`);
    }
  }
}

const contract = readJson(contractPath);
const packageJson = readJson(packagePath);
const serviceText = textOf(servicePath);
const routesText = textOf(routesPath);
const serialized = JSON.stringify(contract);

if (contract.id !== "seis-ai-self-evolution-contract") {
  fail("contract id must be seis-ai-self-evolution-contract");
}

if (contract.mode !== "human-supervised-self-improvement") {
  fail("self-evolution mode must be human-supervised-self-improvement");
}

assertArrayIncludesAll("improvementCycle", contract.improvementCycle, [
  "Analyze",
  "Learn",
  "Improve",
  "Build",
  "Test",
  "Document",
  "Evolve"
]);

for (const engineId of [
  "self-analysis-engine",
  "self-improvement-engine",
  "knowledge-expansion-engine",
  "autonomous-learning-engine",
  "goal-driven-evolution-engine",
  "architecture-evolution-engine",
  "agent-evolution-engine",
  "plugin-evolution-engine",
  "memory-optimization-engine"
]) {
  const engine = contract.engines?.find((item) => item.id === engineId);
  if (!engine) {
    fail(`missing engine ${engineId}`);
    continue;
  }
  if (!Array.isArray(engine.allowedOutputs) || engine.allowedOutputs.length === 0) {
    fail(`${engineId} must declare allowedOutputs`);
  }
  if (!Array.isArray(engine.blockedActions) || engine.blockedActions.length === 0) {
    fail(`${engineId} must declare blockedActions`);
  }
}

assertArrayIncludesAll("modelOrchestration.supportedProviderFamilies", contract.modelOrchestration?.supportedProviderFamilies, [
  "OpenAI",
  "Anthropic",
  "Gemini",
  "Qwen",
  "Gemma",
  "DeepSeek",
  "Mistral",
  "Llama",
  "Ollama Local Models"
]);

assertArrayIncludesAll("modelOrchestration.allowedModes", contract.modelOrchestration?.allowedModes, [
  "local-only",
  "metadata-only",
  "approval-needed"
]);

assertArrayIncludesAll("modelOrchestration.blockedClaims", contract.modelOrchestration?.blockedClaims, [
  "live provider comparison complete",
  "provider credential available",
  "model training complete",
  "SEIS foundation model created"
]);

assertArrayIncludesAll("knowledgeGraphs", (contract.knowledgeGraphs ?? []).map((graph) => graph.id), [
  "documentation-graph",
  "architecture-graph",
  "project-graph",
  "goal-graph",
  "memory-graph",
  "agent-graph"
]);

assertArrayIncludesAll("humanApprovalRequiredBefore", contract.humanApprovalRequiredBefore, [
  "writing official memory records",
  "changing agent permissions",
  "installing or publishing plugins",
  "live SSH host mutation",
  "provider credential use",
  "deployment",
  "model training or model version promotion",
  "push, merge, branch deletion, or history rewrite"
]);

for (const sourcePath of contract.sourceBasis ?? []) {
  if (!existsSync(sourcePath)) {
    fail(`missing sourceBasis entry ${sourcePath}`);
  }
}

for (const token of ["self_evolution", "knowledge_graphs", "seis-ai-self-evolution-contract"]) {
  if (!serviceText.includes(token)) {
    fail(`services.py must include ${token}`);
  }
}

for (const route of ["/self-evolution", "/knowledge-graphs"]) {
  if (!routesText.includes(`"${route}"`)) {
    fail(`routes.py must expose ${route}`);
  }
}

if (packageJson.scripts?.["check:seis-ai-self-evolution"] !== "node scripts/check-seis-ai-self-evolution.mjs") {
  fail("package.json must expose check:seis-ai-self-evolution");
}

if (!`${packageJson.scripts?.["check:seis-ai-local-integration"] ?? ""}`.includes("check:seis-ai-self-evolution")) {
  fail("check:seis-ai-local-integration must include self-evolution check");
}

for (const forbidden of [
  /\/Users\//,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])gh[pousr]_[A-Za-z0-9_]{20,}/
]) {
  if (forbidden.test(serialized) || forbidden.test(serviceText) || forbidden.test(routesText)) {
    fail(`self-evolution files contain forbidden sensitive or machine-specific pattern: ${forbidden}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS AI self-evolution check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS AI self-evolution check passed.");
