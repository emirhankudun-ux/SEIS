#!/usr/bin/env node
/* eslint-disable no-console */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const scope = readScope(process.argv.slice(2));
const failures = [];

const files = {
  gates: "content/development/seis-agi-github-readiness-gates.json",
  ledger: "content/development/seis-agi-independent-evidence-ledger.json",
  freshClone: "content/development/seis-agi-github-fresh-clone-readiness-plan.json",
  docs: "docs/ai/seis-agi-github-readiness-gates.md",
  status: "docs/STATUS.md",
  queue: "docs/roadmap/NEXT_PR_QUEUE.md",
  package: "package.json",
  chain: "scripts/check-seis-ai-github-readiness-chain.mjs",
  independentLedgerCheck: "scripts/check-seis-agi-independent-evidence-ledger.mjs",
  workflow: ".github/workflows/seis-agi-github-readiness.yml"
};

const requiredGateIds = [
  "independent-agi-evaluation",
  "seis-20b-runtime-evidence",
  "seis-512b-training-inference-evidence",
  "independent-safety-security-review",
  "fresh-clone-user-smoke",
  "external-reproducibility-review",
  "human-release-approval"
];

const expectedIndependentEvidenceByGate = new Map([
  ["independent-agi-evaluation", true],
  ["seis-20b-runtime-evidence", true],
  ["seis-512b-training-inference-evidence", true],
  ["independent-safety-security-review", true],
  ["fresh-clone-user-smoke", false],
  ["external-reproducibility-review", true],
  ["human-release-approval", false]
]);

const requiredReleaseEvidence = [
  "versioned model card and data provenance record",
  "independent evaluator identity and signed result",
  "reproducible evaluation configuration and raw metrics",
  "negative-control and failure-case evidence",
  "security review with no-secret confirmation",
  "rollback and incident owner",
  "human release approval"
];

const requiredForbiddenClaims = [
  "SEIS has achieved real AGI.",
  "SEIS has a verified 20B local runtime on every 16GB machine.",
  "SEIS has trained or owns a 20B foundation model.",
  "SEIS has trained a 512B foundation model.",
  "SEIS can route 512B inference for GitHub users today.",
  "A CI check, plugin inventory, or model catalog proves AGI.",
  "A provider wrapper or assistant name proves a model capability."
];

const requiredWorkflowPaths = [
  "content/development/seis-agi-*.json",
  "docs/STATUS.md",
  "docs/ai/seis-agi-github-readiness-gates.md",
  "docs/ai/seis-agi-github-user-readiness-gates.md",
  "docs/ai/seis-agi-public-readiness-evidence.md",
  "docs/roadmap/NEXT_PR_QUEUE.md",
  "package.json",
  "package-lock.json",
  "scripts/check-seis-agi-github-readiness-gates.mjs",
  "scripts/check-seis-agi-independent-evidence-ledger.mjs",
  "scripts/check-seis-ai-github-readiness-chain.mjs",
  "test/seis-agi-github-readiness-gates.test.mjs",
  ".github/workflows/seis-agi-github-readiness.yml"
];

for (const [label, relativePath] of Object.entries(files)) {
  ensureFile(relativePath, label);
}

const gates = readJson(files.gates, "AGI GitHub readiness gates");
const ledger = readJson(files.ledger, "AGI independent evidence ledger");
const freshClone = readJson(files.freshClone, "AGI GitHub fresh clone plan");
const packageJson = readJson(files.package, "package.json");
const docs = readText(files.docs, "AGI GitHub readiness documentation");
const status = readText(files.status, "STATUS");
const queue = readText(files.queue, "NEXT_PR_QUEUE");
const chain = readText(files.chain, "AGI GitHub readiness chain");
const workflow = readText(files.workflow, "AGI GitHub readiness workflow");

for (const relativePath of [
  files.gates,
  files.freshClone,
  files.docs,
  files.chain,
  files.workflow
]) {
  requireNoCredentialPattern(relativePath);
}

if (scope === "all" || scope === "gates") {
  validateGates(gates);
  validateDocumentation(docs, status, queue);
  validatePackageScripts(packageJson);
  validateReadinessChain(chain);
  validateWorkflow(workflow);
}

if (scope === "all" || scope === "ledger") {
  validateLedger(ledger);
}

if (scope === "all" || scope === "fresh-clone") {
  validateFreshClonePlan(freshClone);
}

if (scope === "all") {
  validateCrossLinks(gates, ledger, freshClone);
}

finish("SEIS AGI GitHub readiness gates check passed (" + scope + ").");

function readScope(args) {
  let value = "all";
  const inline = args.find((arg) => arg.startsWith("--scope="));
  if (inline) value = inline.split("=")[1];
  if (args.includes("--scope")) {
    const index = args.indexOf("--scope");
    value = args[index + 1] || "";
  }
  const supported = new Set(["all", "gates", "ledger", "fresh-clone"]);
  if (!supported.has(value)) {
    console.error("Unknown readiness scope: " + (value || "(missing)"));
    process.exit(1);
  }
  return value;
}

function validateGates(value) {
  if (!value) return;

  ensure(value.id === "seis-agi-github-readiness-gates", "gates id mismatch");
  ensure(value.version === "2026.07.10", "gates version must be 2026.07.10");
  ensure(value.status === "blocked-pending-independent-evidence", "gates must stay blocked pending independent evidence");
  ensure(value.qualityGate === "npm run check:seis-agi-github-readiness-gates", "gates quality gate mismatch");
  ensure(value.chainCommand === "npm run check:seis-ai-github-readiness-chain", "gates chain command mismatch");
  ensure(value.defaultRuntimeMode === "seis-local-demo", "default runtime must remain Local Demo");
  ensure(value.claimDecision === "github-users-can-review-local-demo-not-agi-or-model-runtime", "claim decision must remain Local Demo only");

  ensure(value.allowedToday?.localDemoReview === true, "Local Demo review must remain allowed");
  ensure(value.allowedToday?.metadataPlanning === true, "metadata planning must remain allowed");
  ensure(value.allowedToday?.deterministicSeedArtifacts === true, "deterministic seed artifacts must remain allowed");
  for (const key of [
    "modelInstall",
    "modelWeightDownload",
    "localInference",
    "providerCall",
    "training",
    "fineTune",
    "benchmarkExecution",
    "cloudGpuProvisioning",
    "sshExecution",
    "deployment",
    "githubMutationByGate"
  ]) {
    ensure(value.allowedToday?.[key] === false, "allowedToday." + key + " must remain false");
  }

  ensure(value.publicClaimBoundary?.canClaimLocalDemoReview === true, "Local Demo review claim should remain allowed");
  for (const key of [
    "canClaimFreshCloneVerified",
    "canClaim20bRuntimeReady",
    "canClaim70bRuntimeReady",
    "canClaim512bRouteEligible",
    "canClaimTrainingExecuted",
    "canClaimSEISOwnedFoundationModel",
    "canClaimIndependentAgiEvaluation",
    "canClaimRealAgi"
  ]) {
    ensure(value.publicClaimBoundary?.[key] === false, "publicClaimBoundary." + key + " must remain false");
  }

  const modelPlan = value.modelPlan || {};
  validateModelLane(modelPlan.seis20b, {
    id: "seis20b",
    parameterClass: "20B",
    hardwareClass: "16GB+ RAM",
    status: "planned-quantized-evaluation-only",
    requiredEvidence: [
      "exact checkpoint and license approval",
      "hardware and memory measurement",
      "local inference benchmark with reproducible logs",
      "security and privacy review",
      "human release approval"
    ]
  });
  validateModelLane(modelPlan.seis70b, {
    id: "seis70b",
    parameterClass: "70B",
    hardwareClass: "approved high-memory or distributed evaluation environment",
    status: "research-gate-only"
  });
  validateModelLane(modelPlan.seis512b, {
    id: "seis512b",
    parameterClass: "512B and higher future classes",
    hardwareClass: "approved distributed research environment",
    status: "independent-evidence-gate-only"
  });

  const readinessGates = Array.isArray(value.readinessGates) ? value.readinessGates : [];
  ensure(Array.isArray(value.readinessGates), "readinessGates must be an array");
  const gateIds = readinessGates.map((gate) => (isRecord(gate) ? gate.id : null));
  ensureExactStringSet(gateIds, requiredGateIds, "readiness gate ids");
  for (const gate of readinessGates) {
    if (!isRecord(gate)) {
      ensure(false, "every readiness gate must be an object");
      continue;
    }
    ensure(gate.status === "missing", gate.id + " must remain missing until evidence is attached");
    ensure(Array.isArray(gate.unlocks) && gate.unlocks.length > 0, gate.id + ".unlocks must be populated");
    ensure(expectedIndependentEvidenceByGate.has(gate.id), "unexpected readiness gate id: " + gate.id);
    if (expectedIndependentEvidenceByGate.has(gate.id)) {
      ensure(
        gate.independentEvidenceRequired === expectedIndependentEvidenceByGate.get(gate.id),
        gate.id + ".independentEvidenceRequired must remain " + expectedIndependentEvidenceByGate.get(gate.id)
      );
    }
  }

  ensureExactStringSet(value.requiredEvidence, requiredReleaseEvidence, "requiredEvidence");
  ensureExactStringSet(value.forbiddenClaims, requiredForbiddenClaims, "forbidden claims");
  ensure(Array.isArray(value.nextSafeActions) && value.nextSafeActions.length >= 4, "nextSafeActions must be populated");
}

function validateModelLane(lane, expected) {
  ensure(lane && typeof lane === "object", expected.id + " model lane must exist");
  if (!lane || typeof lane !== "object") return;
  ensure(lane.parameterClass === expected.parameterClass, expected.id + ".parameterClass mismatch");
  ensure(lane.hardwareClass === expected.hardwareClass, expected.id + ".hardwareClass mismatch");
  ensure(lane.status === expected.status, expected.id + ".status mismatch");
  for (const key of ["modelInstalled", "runtimeVerified", "trainingExecuted", "claimReady"]) {
    ensure(lane[key] === false, expected.id + "." + key + " must remain false");
  }
  ensure(typeof lane.truthBoundary === "string" && lane.truthBoundary.length > 40, expected.id + ".truthBoundary must be explicit");
  if (expected.requiredEvidence) {
    ensureArrayIncludesAll(lane.minimumEvidence || [], expected.requiredEvidence, expected.id + ".minimumEvidence");
  }
}

function validateLedger(value) {
  if (!value) return;

  ensure(value.id === "seis-agi-independent-evidence-ledger", "ledger id mismatch");
  ensure(value.version === "2026.06.29", "ledger version must remain 2026.06.29");
  ensure(value.status === "planned-without-independent-evidence", "ledger must remain planned without independent evidence");
  ensure(typeof value.targetCapability === "string" && value.targetCapability.includes("AGI") && value.targetCapability.includes("512B"), "ledger target capability must cover AGI and 512B");
  ensure(value.defaultRuntimeMode === "seis-local-demo", "ledger default runtime must remain Local Demo");
  ensure(value.sourceOfTruth === "content/development/seis-agi-public-readiness-evidence.json", "ledger source of truth must remain public readiness evidence");
  for (const key of [
    "routeEligibleToday",
    "runtimeAuthority",
    "agiClaimAllowed",
    "publicReadyAsAgi",
    "githubReadyForEveryone"
  ]) {
    ensure(value[key] === false, "ledger." + key + " must remain false");
  }
  ensure(value.publicReadyForLocalDemo === true, "ledger must allow Local Demo review");

  const pendingExternalInquiries = Array.isArray(value.pendingExternalInquiries) ? value.pendingExternalInquiries : [];
  ensure(Array.isArray(value.pendingExternalInquiries), "pendingExternalInquiries must be an array");
  const inquiryIds = pendingExternalInquiries.map((item) => item.id);
  ensureArrayIncludesAll(inquiryIds, [
    "independent-agi-reviewer-report",
    "independent-512b-training-evidence",
    "independent-long-horizon-evidence"
  ], "ledger inquiry ids");
  ensure(pendingExternalInquiries.length >= 3, "ledger must retain independent evidence inquiries");
  for (const item of pendingExternalInquiries) {
    ensure(item.status === "missing", item.id + ".status must remain missing");
    ensure(item.requiredBeforePublicClaim === true, item.id + ".requiredBeforePublicClaim must remain true");
    ensure(Array.isArray(item.ownerAgents) && item.ownerAgents.length > 0, item.id + ".ownerAgents must be populated");
    ensure(Array.isArray(item.requiredEvidence) && item.requiredEvidence.length >= 4, item.id + ".requiredEvidence must be populated");
  }

  ensureArrayIncludesAll(value.readinessChecks?.gateIds || [], [
    "zero-key-local-demo",
    "mcp-resource-contract",
    "claim-boundary",
    "fresh-clone-user-path",
    "independent-agi-evaluations",
    "512b-training-inference-evidence",
    "public-release-approval"
  ], "ledger readiness gate ids");
  ensure(value.humanApprovalNeeded?.decision === "not-recorded", "human approval must remain not recorded");
  ensure(Array.isArray(value.humanApprovalNeeded?.gates) && value.humanApprovalNeeded.gates.length >= 3, "human approval gates must be populated");
  ensure(typeof value.truthBoundary === "string" && value.truthBoundary.includes("does not prove"), "ledger truth boundary must block proof claims");
  ensureArrayIncludesAll(value.forbiddenClaims || [], [
    "SEIS has achieved real AGI.",
    "SEIS has trained a 512B foundation model.",
    "GitHub users can run routeable 512B inference today."
  ], "ledger forbidden claims");
}

function validateFreshClonePlan(value) {
  if (!value) return;

  ensure(value.id === "seis-agi-github-fresh-clone-readiness-plan", "fresh clone plan id mismatch");
  ensure(value.version === "2026.07.10", "fresh clone plan version must be 2026.07.10");
  ensure(value.status === "planned-not-verified", "fresh clone plan must remain planned, not verified");
  ensure(value.qualityGate === "npm run check:seis-agi-github-fresh-clone-readiness-plan", "fresh clone quality gate mismatch");
  ensure(value.sourceOfTruth === files.gates, "fresh clone source of truth must point to gates");
  for (const key of [
    "freshCloneEvidenceRecorded",
    "canClaimFreshCloneVerified",
    "canClaimEveryoneReady",
    "canClaimRealAgi"
  ]) {
    ensure(value[key] === false, "fresh clone " + key + " must remain false");
  }

  const expectedCommands = new Map([
    ["install-dependencies", "npm ci"],
    ["validate-gates", "npm run check:seis-agi-github-readiness-gates"],
    ["validate-ledger", "npm run check:seis-agi-independent-evidence-ledger"],
    ["run-readiness-chain", "npm run check:seis-ai-github-readiness-chain"]
  ]);
  const safeCommands = Array.isArray(value.safeCommands) ? value.safeCommands : [];
  ensure(Array.isArray(value.safeCommands), "safeCommands must be an array");
  const safeCommandIds = safeCommands.map((item) => (isRecord(item) ? item.id : null));
  ensureExactStringSet(safeCommandIds, [...expectedCommands.keys()], "fresh clone safe command ids");
  for (const item of safeCommands) {
    if (!isRecord(item)) {
      ensure(false, "every fresh clone safe command must be an object");
      continue;
    }
    ensure(expectedCommands.get(item.id) === item.command, "unexpected fresh clone command: " + item.id);
    for (const key of ["downloadsModelWeights", "callsProvider", "trainsModel", "mutatesGitHub"]) {
      ensure(item[key] === false, item.id + "." + key + " must remain false");
    }
    ensure(!containsForbiddenExecution(item.command), item.id + " contains a forbidden execution command");
  }

  ensure(Array.isArray(value.requiredHumanEvidence) && value.requiredHumanEvidence.length >= 5, "fresh clone plan must define human evidence");
  ensure(typeof value.truthBoundary === "string" && value.truthBoundary.includes("does not prove"), "fresh clone truth boundary must block proof claims");
  ensureArrayIncludesAll(value.nextSafeActions || [], [
    "Run the plan in an actual clean checkout and attach the resulting logs.",
    "Keep freshCloneEvidenceRecorded false until a reviewer attaches reproducible evidence."
  ], "fresh clone next safe actions");
}

function validateDocumentation(docsText, statusText, queueText) {
  for (const phrase of [
    "Local Demo",
    "independent evidence",
    "20B",
    "512B",
    "blocked",
    "npm run check:seis-ai-github-readiness-chain"
  ]) {
    ensure(docsText.includes(phrase), "AGI readiness documentation missing " + phrase);
  }
  for (const phrase of [
    "AGI GitHub Readiness",
    "Local Demo",
    "blocked"
  ]) {
    ensure(statusText.includes(phrase), "STATUS missing " + phrase);
  }
  for (const phrase of [
    "feat(ai): add AGI GitHub readiness gates",
    "independent evidence",
    "512B"
  ]) {
    ensure(queueText.includes(phrase), "NEXT_PR_QUEUE missing " + phrase);
  }
}

function validatePackageScripts(value) {
  if (!value) return;
  const expected = {
    "check:seis-agi-github-readiness-gates": "node scripts/check-seis-agi-github-readiness-gates.mjs --scope gates",
    "check:seis-agi-independent-evidence-ledger": "node scripts/check-seis-agi-independent-evidence-ledger.mjs",
    "check:seis-agi-github-fresh-clone-readiness-plan": "node scripts/check-seis-agi-github-readiness-gates.mjs --scope fresh-clone",
    "check:seis-ai-github-readiness-chain": "node scripts/check-seis-ai-github-readiness-chain.mjs"
  };
  for (const [name, command] of Object.entries(expected)) {
    ensure(value.scripts?.[name] === command, "package.json script mismatch: " + name);
  }
}

function validateReadinessChain(value) {
  for (const phrase of ["scripts/check-seis-agi-github-readiness-gates.mjs", "scripts/check-seis-agi-independent-evidence-ledger.mjs"]) {
    ensure(value.includes(phrase), "AGI GitHub readiness chain missing " + phrase);
  }
}

function validateWorkflow(value) {
  const requiredPhrases = [
    "name: SEIS AGI GitHub Readiness",
    "branches: [main]",
    "contents: read",
    "persist-credentials: false",
    "npm ci",
    "npm run check:seis-ai-github-readiness-chain"
  ];
  for (const phrase of requiredPhrases) {
    ensure(value.includes(phrase), "AGI GitHub readiness workflow missing " + phrase);
  }
  for (const trigger of ["pull_request", "push"]) {
    const section = workflowTriggerSection(value, trigger);
    ensure(section.length > 0, "AGI GitHub readiness workflow missing " + trigger + " trigger");
    ensure(section.includes("paths:"), "AGI GitHub readiness workflow " + trigger + " trigger must define paths");
    for (const relativePath of requiredWorkflowPaths) {
      ensure(section.includes('- "' + relativePath + '"'), "AGI GitHub readiness workflow " + trigger + " paths missing " + relativePath);
    }
  }
  ensure(!containsForbiddenExecution(value), "AGI GitHub readiness workflow contains a forbidden execution command");
}

function validateCrossLinks(gatesValue, ledgerValue, freshCloneValue) {
  if (!gatesValue || !ledgerValue || !freshCloneValue) return;
  ensure(gatesValue.publicClaimBoundary.canClaimRealAgi === ledgerValue.agiClaimAllowed, "AGI claim boundary must agree with ledger");
  ensure(gatesValue.publicClaimBoundary.canClaim512bRouteEligible === ledgerValue.routeEligibleToday, "512B route boundary must agree with ledger");
  ensure(gatesValue.publicClaimBoundary.canClaimFreshCloneVerified === freshCloneValue.canClaimFreshCloneVerified, "fresh clone claim boundary must agree with plan");
}

function containsForbiddenExecution(command) {
  return [
    "ollama pull",
    "huggingface-cli download",
    "git push",
    "git merge",
    "ssh ",
    "scp ",
    "rsync ",
    "docker run",
    "kubectl ",
    "terraform ",
    "torchrun",
    "accelerate launch"
  ].some((blocked) => command.includes(blocked));
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  ensure(existsSync(filePath) && statSync(filePath).isFile(), label + " missing: " + relativePath);
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(label + " is invalid JSON: " + error.message);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(label + " missing: " + relativePath);
    return "";
  }
  return readFileSync(filePath, "utf8");
}

function requireNoCredentialPattern(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return;
  const source = readFileSync(filePath, "utf8");
  const patterns = [
    /ghp_[A-Za-z0-9]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /sk-[A-Za-z0-9_-]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/
  ];
  for (const pattern of patterns) {
    ensure(!pattern.test(source), relativePath + " may contain credential material");
  }
}

function ensureArrayIncludesAll(values, required, label) {
  ensure(Array.isArray(values), label + " must be an array");
  if (!Array.isArray(values)) return;
  const available = new Set(values);
  for (const item of required) ensure(available.has(item), label + " missing " + item);
}

function ensureExactStringSet(values, required, label) {
  ensure(Array.isArray(values), label + " must be an array");
  if (!Array.isArray(values)) return;
  ensure(values.length === required.length, label + " count must remain stable");
  const available = new Set(values);
  ensure(available.size === values.length, label + " must not contain duplicates");
  for (const item of required) ensure(available.has(item), label + " missing " + item);
}

function workflowTriggerSection(value, trigger) {
  const lines = value.split(/\r?\n/);
  const start = lines.findIndex((line) => line === "  " + trigger + ":");
  if (start < 0) return "";
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^ {2}[A-Za-z][A-Za-z0-9_-]*:$/.test(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(message) {
  if (failures.length > 0) {
    console.error("SEIS AGI GitHub readiness gates check failed:");
    for (const failure of failures) console.error("- " + failure);
    process.exit(1);
  }
  console.log(message);
}
