#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  gates: "content/development/seis-agi-github-user-readiness-gates.json",
  publicReadiness: "content/development/seis-agi-public-readiness-evidence.json",
  protocol: "content/development/seis-agi-evaluation-protocol.json",
  apexProgram: "content/development/seis-512b-apex-model-program.json",
  independentEvidenceLedger: "content/development/seis-agi-independent-evidence-ledger.json",
  mcpRuntime: "content/development/seis-ai-core-mcp-runtime-contract.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  doc: "docs/ai/seis-agi-github-user-readiness-gates.md",
  publicReadinessDoc: "docs/ai/seis-agi-public-readiness-evidence.md",
  aiCoreDoc: "docs/ai/seis-ai-core.md",
  helper: "packages/seis-ai/src/lib/plugin-integration.mjs",
  mcpServer: "packages/seis-ai/src/mcp/server.mjs",
  mcpSmoke: "packages/seis-ai/test/mcp-smoke.test.mjs"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const gates = readJson(paths.gates, "AGI GitHub user readiness gates");
const publicReadiness = readJson(paths.publicReadiness, "AGI public readiness evidence");
const protocol = readJson(paths.protocol, "AGI evaluation protocol");
const apexProgram = readJson(paths.apexProgram, "512B apex program");
const mcpRuntime = readJson(paths.mcpRuntime, "MCP runtime contract");
const independentEvidenceLedger = readJson(paths.independentEvidenceLedger, "AGI independent evidence ledger");
const pluginIntegration = readJson(paths.pluginIntegration, "plugin integration");
const doc = readText(paths.doc, "AGI GitHub user readiness docs");
const publicReadinessDoc = readText(paths.publicReadinessDoc, "AGI public readiness docs");
const aiCoreDoc = readText(paths.aiCoreDoc, "AI Core docs");
const helper = readText(paths.helper, "AI Core helper");
const mcpServer = readText(paths.mcpServer, "MCP server");
const mcpSmoke = readText(paths.mcpSmoke, "MCP smoke tests");

if (gates) {
  ensure(gates.id === "seis-agi-github-user-readiness-gates", "gates id mismatch");
  ensure(gates.status === "review-gated-local-demo-ready", "gates status mismatch");
  ensure(gates.resourceUri === "seis://ai/agi-github-user-readiness-gates.json", "gates resource URI mismatch");
  ensure(gates.qualityGate === "node scripts/check-seis-agi-github-user-readiness-gates.mjs", "gates qualityGate mismatch");
  ensure(gates.coreCredentialRequirement === "none", "core credential requirement must remain none");
  ensure(gates.defaultRuntimeMode === "seis-local-demo", "default runtime mode must stay Local Demo");
  ensure(gates.routeEligibleToday === false, "gates must not grant route eligibility");
  ensure(gates.runtimeAuthority === false, "gates must not grant runtime authority");
  ensure(gates.agiClaimAllowed === false, "gates must not allow AGI claims");
  ensure(gates.publicReadyAsAgi === false, "gates must not mark public-ready as AGI");
  ensure(gates.publicReadyForLocalDemo === true, "gates must allow Local Demo review");
  ensure(gates.githubReadyForEveryone === false, "gates must keep everyone-ready false until release evidence exists");
  ensure(gates.claimDecision === "github-users-can-review-local-demo-not-real-agi", "claim decision mismatch");
  ensure(gates.oneCommandReadinessValidator?.status === "available-local-demo-gate", "one-command readiness validator status mismatch");
  ensure(gates.oneCommandReadinessValidator?.command === "npm run check:seis-ai-public-readiness", "one-command readiness validator command mismatch");
  ensure(gates.oneCommandReadinessValidator?.mode === "local-demo-readiness-only", "one-command readiness validator mode mismatch");
  for (const field of [
    "installsModels",
    "downloadsCheckpoints",
    "trainsModels",
    "callsProviders",
    "provisionsCloudOrGpu",
    "executesSsh",
    "pushesOrMerges",
    "grantsAgiClaim",
    "grants512bRouteEligibility"
  ]) {
    ensure(gates.oneCommandReadinessValidator?.[field] === false, `oneCommandReadinessValidator.${field} must remain false`);
  }
  ensureArrayIncludesAll(gates.oneCommandReadinessValidator?.checks, [
    "check:seis-language-model-intake",
    "check:seis-language-model-training-curriculum",
    "check:seis-ai-workforce-training",
    "check:seis-agent-workforce",
    "check:seis-model-scaling-hardware-profile",
    "check:seis-model-parameter-ladder",
    "check:seis-model-scaling-subagent-council",
    "check:seis-512b-apex-model-program",
    "check:seis-agi-evaluation-protocol",
    "check:seis-agi-public-readiness-evidence",
    "check:seis-agi-github-user-readiness-gates",
    "check:seis-agi-independent-evidence-ledger"
  ], "oneCommandReadinessValidator.checks");
  ensure(String(gates.truthBoundary || "").includes("does not prove SEIS AGI"), "truth boundary must block AGI proof claims");
  ensure(String(gates.truthBoundary || "").includes("train or download a 512B model"), "truth boundary must block 512B training/download claims");
  ensure(String(gates.truthBoundary || "").includes("approve release"), "truth boundary must block release approval claims");

  ensure(gates.sourceOfTruth?.agiEvaluationProtocol === paths.protocol, "sourceOfTruth.agiEvaluationProtocol mismatch");
  ensure(gates.sourceOfTruth?.agiPublicReadinessEvidence === paths.publicReadiness, "sourceOfTruth.agiPublicReadinessEvidence mismatch");
  ensure(gates.sourceOfTruth?.apexModelProgram === paths.apexProgram, "sourceOfTruth.apexModelProgram mismatch");
  ensure(gates.sourceOfTruth?.mcpRuntimeContract === paths.mcpRuntime, "sourceOfTruth.mcpRuntimeContract mismatch");
  ensure(gates.sourceOfTruth?.pluginIntegration === paths.pluginIntegration, "sourceOfTruth.pluginIntegration mismatch");
  ensure(gates.sourceOfTruth?.agiIndependentEvidenceLedger === paths.independentEvidenceLedger, "sourceOfTruth.agiIndependentEvidenceLedger mismatch");
  ensure(gates.sourceOfTruth?.doc === paths.doc, "sourceOfTruth.doc mismatch");

  ensureArrayIncludesAll(
    (gates.researchBaseline || []).map((entry) => entry.id),
    ["nist-ai-rmf", "nist-ai-600-1", "metr-long-task-evaluations", "arc-agi"],
    "researchBaseline"
  );
  for (const entry of gates.researchBaseline || []) {
    ensureNonEmpty(entry.url, `${entry.id}.url`);
    ensureNonEmpty(entry.seisImplication, `${entry.id}.seisImplication`);
  }

  ensureArrayIncludesAll(
    (gates.githubUserModes || []).map((entry) => entry.id),
    ["local-demo-review", "validator-review", "real-agi-use", "live-provider-use"],
    "githubUserModes"
  );
  ensure((gates.githubUserModes || []).some((entry) => entry.id === "local-demo-review" && entry.status === "allowed" && entry.requiresSecrets === false), "local demo review must be allowed without secrets");
  ensure((gates.githubUserModes || []).some((entry) => entry.id === "validator-review" && entry.status === "allowed" && entry.requiresSecrets === false), "validator review must be allowed without secrets");
  ensure((gates.githubUserModes || []).some((entry) => entry.id === "real-agi-use" && entry.status === "blocked"), "real AGI use must stay blocked");
  ensure((gates.githubUserModes || []).some((entry) => entry.id === "live-provider-use" && entry.status === "disabled-until-configured" && entry.requiresSecrets === true), "live provider use must remain disabled until configured");

  const readinessGates = Array.isArray(gates.readinessGates) ? gates.readinessGates : [];
  ensureArrayIncludesAll(
    readinessGates.map((entry) => entry.id),
    [
      "zero-key-local-demo",
      "mcp-resource-contract",
      "claim-boundary",
      "fresh-clone-user-path",
      "independent-agi-evaluations",
      "512b-training-inference-evidence",
      "public-release-approval"
    ],
    "readinessGates"
  );
  for (const gate of readinessGates) {
    ensure(Array.isArray(gate.ownerAgents) && gate.ownerAgents.length >= 1, `${gate.id}.ownerAgents must be populated`);
    ensure(Array.isArray(gate.requiredEvidence) && gate.requiredEvidence.length >= 3, `${gate.id}.requiredEvidence must be populated`);
    ensure(gate.blocksAgiClaim === true, `${gate.id}.blocksAgiClaim must remain true`);
  }
  ensure(readinessGates.some((gate) => gate.id === "fresh-clone-user-path" && gate.status === "partial" && gate.blocksGithubLocalDemo === true), "fresh clone gate must block everyone-ready status");
  ensure(readinessGates.some((gate) => gate.id === "independent-agi-evaluations" && gate.status === "missing"), "independent AGI evaluation gate must remain missing");
  ensure(readinessGates.some((gate) => gate.id === "512b-training-inference-evidence" && gate.status === "missing"), "512B evidence gate must remain missing");
  ensure(readinessGates.some((gate) => gate.id === "public-release-approval" && gate.status === "approval-gated" && gate.blocksGithubLocalDemo === true), "public release approval gate must remain approval-gated");

  ensureArrayIncludesAll(gates.requiredBeforeEveryoneReady, [
    "fresh clone local demo path verified",
    "one-command AI readiness validator documented and passing",
    "all required CI checks green on the target commit",
    "human release approval recorded",
    "independent AGI evidence ledger not completed",
    "no secrets or private keys exposed",
    "AGI and 512B claim boundaries preserved"
  ], "requiredBeforeEveryoneReady");

  ensureArrayIncludesAll(gates.forbiddenClaims, [
    "SEIS has achieved real AGI.",
    "SEIS includes trained 512B weights.",
    "GitHub users can run routeable 512B inference today.",
    "Passing CI or CodeQL proves AGI.",
    "Installed AI or sub-agents prove AGI.",
    "Provider API access is SEIS-owned AGI."
  ], "forbiddenClaims");
}

ensure(publicReadiness?.status === "blocked-missing-real-agi-evidence", "public readiness evidence must stay blocked");
ensure(publicReadiness?.sourceOfTruth?.githubUserReadinessGates === paths.gates, "public readiness evidence must point to GitHub user readiness gates");
ensure(protocol?.agiClaimAllowed === false, "AGI evaluation protocol must keep AGI claims blocked");
ensure(apexProgram?.sourceOfTruth?.githubUserReadinessGates === paths.gates, "512B apex program must point to GitHub user readiness gates");
ensure(independentEvidenceLedger?.status === "planned-without-independent-evidence", "independent evidence ledger must remain planned-without-independent-evidence while blocks are in force");
ensure(independentEvidenceLedger?.agiClaimAllowed === false, "independent evidence ledger must keep AGI claims blocked");
ensure(apexProgram?.routeEligibleToday === false, "512B apex program must stay route blocked");

ensureArrayIncludesAll(pluginIntegration?.runtimeIntegration?.mcpResources, [
  "seis://ai/agi-github-user-readiness-gates.json"
], "pluginIntegration.runtimeIntegration.mcpResources");
ensure(mcpRuntime?.resourceCount === 30, "MCP runtime contract must record 30 resources");
ensure(String(mcpRuntime?.surfaces?.find((surface) => surface.id === "resources")?.evidence || "").includes("AGI GitHub user readiness gates"), "MCP resource evidence must mention AGI GitHub user readiness gates");

for (const [text, label] of [
  [doc, "AGI GitHub user readiness docs"],
  [publicReadinessDoc, "AGI public readiness docs"],
  [aiCoreDoc, "AI Core docs"],
  [helper, "AI Core helper"],
  [mcpServer, "MCP server"],
  [mcpSmoke, "MCP smoke tests"]
]) {
  ensure(text.includes("seis-agi-github-user-readiness-gates"), `${label} must reference GitHub user readiness gates`);
  ensure(text.includes("seis://ai/agi-github-user-readiness-gates.json"), `${label} must reference GitHub user readiness MCP URI`);
}

finish("SEIS AGI GitHub user readiness gates check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!relativePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) failures.push(`${label} missing: ${relativePath}`);
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function ensureNonEmpty(value, label) {
  ensure(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} unreadable: ${error.message}`);
    return "";
  }
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS AGI GitHub user readiness gates check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
