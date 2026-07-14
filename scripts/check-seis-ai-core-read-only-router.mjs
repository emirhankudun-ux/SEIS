#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { runReadOnlyRouterSmokeChecks } from "../packages/seis-ai/src/model/read-only-router.mjs";

const root = process.cwd();
const contractPath = "content/development/seis-ai-core-read-only-router-runtime.json";
const contractFile = path.join(root, ...contractPath.split("/"));
const failures = [];

if (!fs.existsSync(contractFile)) {
  failures.push(`runtime contract missing: ${contractPath}`);
}

let contract = null;
if (fs.existsSync(contractFile)) {
  try {
    contract = JSON.parse(fs.readFileSync(contractFile, "utf8"));
  } catch (error) {
    failures.push(`runtime contract is invalid JSON: ${error.message}`);
  }
}

if (contract) {
  ensure(contract.id === "seis-ai-core-read-only-router-runtime", "runtime contract id mismatch");
  ensure(contract.status === "local-read-only-runtime", "runtime contract must remain local-read-only-runtime");
  ensure(contract.runtimeBoundary?.runtimeAuthority === false, "runtime authority must remain false");
  ensure(contract.runtimeBoundary?.providerCalls === false, "provider calls must remain false");
  ensure(contract.runtimeBoundary?.credentialRead === false, "credential reads must remain false");
  ensure(contract.runtimeBoundary?.agentExecution === false, "agent execution must remain false");
  ensure(contract.runtimeBoundary?.externalMutation === false, "external mutation must remain false");
  ensure(contract.providerMediation?.mode === "backend-only", "provider mediation must remain backend-only");
  ensure(contract.providerMediation?.frontendSecretAllowed === false, "frontend provider secrets must remain forbidden");
  ensure(contract.providerMediation?.routeExecutionEnabled === false, "provider route execution must remain disabled");
  ensure(contract.providerMediation?.status === "required-before-live-routing", "provider mediation status must remain pre-live");
  for (const [key, expected] of [
    ["readOnlyOnly", true],
    ["runtimeAuthority", false],
    ["executionPerformedAlwaysFalse", true],
    ["noPromptBodyInDecision", true],
    ["noCredentialMaterialInDecision", true],
    ["decisionLogsRedacted", true],
    ["providerStateNamed", true],
    ["selectedProviderExplicit", true],
    ["fallbackExplicit", true],
    ["blockedReasonsRequired", true],
    ["backendOnlyProvidersRequired", true],
    ["privateObsidianContentRoutable", false]
  ]) {
    ensure(contract.decisionIntegrity?.[key] === expected, `router runtime decision integrity ${key} must be ${expected}`);
  }
  ensure(contract.sourceOfTruth?.agentTool === "seis_ai_core_read_only_route", "runtime contract must expose the read-only agent tool");
  ensure(contract.sourceOfTruth?.mcpResource === "seis://ai/read-only-router-runtime.json", "runtime contract must expose the read-only MCP resource");
  ensure(contract.modelClaimBoundary?.isAgi === false, "runtime must not claim AGI");
  ensure(contract.modelClaimBoundary?.["512BRouteEligible"] === false, "512B route eligibility must remain false");
  for (const lane of ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]) {
    ensure(contract.agentLaneCoverage?.includes(lane), `runtime contract missing lane: ${lane}`);
  }
}

const smoke = runReadOnlyRouterSmokeChecks(root);
ensure(smoke.ok, `router smoke matrix failed: ${smoke.passed}/${smoke.total}`);

if (failures.length) {
  console.error("SEIS AI Core read-only router check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SEIS AI Core read-only router check passed (${smoke.passed}/${smoke.total}).`);

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
