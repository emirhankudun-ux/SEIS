#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const failures = [];
const files = {
  boundary720b: "content/development/seis-720b-agi-frontier-boundary.json",
  truthLanguage: "content/development/seis-ai-truth-boundary-language-policy.json",
  swarmRoundLedger: "content/development/seis-ai-core-subagent-swarm-round-ledger.json",
  roundExecutionLedger: "content/development/seis-ai-core-subagent-round-execution-evidence-ledger.json"
};

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return {};
  }

  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`invalid JSON in ${file}: ${error.message}`);
    return {};
  }
}

function includesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function scanPublicSafe(file, value) {
  const serialized = JSON.stringify(value);
  const localUserPathMarker = ["/", "Users", "/"].join("");
  const privateKeyMarker = ["BEGIN", "PRIVATE KEY"].join(" ");
  const providerKeyMarker = ["sk", "-"].join("");
  ensure(!serialized.includes(localUserPathMarker), `${file} must not contain machine-local user paths`);
  ensure(!serialized.includes(privateKeyMarker), `${file} must not contain private key markers`);
  ensure(!serialized.includes(providerKeyMarker), `${file} must not contain provider-key markers`);
}

const boundary720b = readJson(files.boundary720b);
const truthLanguage = readJson(files.truthLanguage);
const swarmRoundLedger = readJson(files.swarmRoundLedger);
const roundExecutionLedger = readJson(files.roundExecutionLedger);

for (const [label, file] of Object.entries(files)) {
  const value = { boundary720b, truthLanguage, swarmRoundLedger, roundExecutionLedger }[label];
  scanPublicSafe(file, value);
}

ensure(boundary720b.id === "seis-720b-agi-frontier-boundary", "720B boundary id mismatch");
ensure(boundary720b.status === "agi-frontier-boundary-plan-only", "720B boundary must remain plan-only");
ensure(boundary720b.routeEligibleToday === false, "720B boundary must not be route eligible");
ensure(boundary720b.runtimeAuthority === false, "720B boundary must not grant runtime authority");
ensure(boundary720b.trainingStatus === "not-started", "720B training must remain not-started");
ensure(boundary720b.weightsAvailable === false, "720B weights must not be available");
ensure(boundary720b.inferenceAvailable === false, "720B inference must not be available");
ensure(boundary720b.benchmarkStatus === "not-run", "720B benchmark must remain not-run");
ensure(boundary720b.productionReady === false, "720B boundary must not be production ready");
ensure(boundary720b.agiClaimAllowed === false, "720B boundary must block AGI claims");
ensure(String(boundary720b.truthBoundary || "").includes("does not download models"), "720B boundary must reject downloads");
ensure(String(boundary720b.truthBoundary || "").includes("call providers"), "720B boundary must reject provider calls");
ensure(String(boundary720b.truthBoundary || "").includes("execute SSH"), "720B boundary must reject SSH execution");
ensure(String(boundary720b.truthBoundary || "").includes("deploy infrastructure"), "720B boundary must reject deployment");
includesAll(boundary720b.supervisedCadence?.roundWindows, [15, 30], "720B supervised cadence windows");
includesAll(boundary720b.forbiddenClaimRules, [
  "no-trained-720b-weights-claim",
  "no-routeable-720b-inference-claim",
  "no-720b-benchmark-claim",
  "no-720b-cloud-or-ssh-claim",
  "no-720b-agi-capability-claim",
  "no-continuous-autonomous-background-agent-claim"
], "720B forbidden claim rules");

ensure(truthLanguage.id === "seis-ai-truth-boundary-language-policy", "truth-boundary policy id mismatch");
ensure(truthLanguage.status === "active-governance-check", "truth-boundary policy must stay active");
ensure(String(truthLanguage.truthBoundary || "").includes("does not train models"), "truth policy must reject model training");
ensure(String(truthLanguage.truthBoundary || "").includes("call providers"), "truth policy must reject provider calls");
ensure(String(truthLanguage.truthBoundary || "").includes("execute SSH"), "truth policy must reject SSH execution");
ensure(String(truthLanguage.truthBoundary || "").includes("deploy infrastructure"), "truth policy must reject deployment");
ensure(Array.isArray(truthLanguage.disallowedPatterns) && truthLanguage.disallowedPatterns.length >= 5, "truth policy needs disallowed wording rules");
ensure(Array.isArray(truthLanguage.requiredPhrases) && truthLanguage.requiredPhrases.length >= 4, "truth policy needs required safe wording rules");

ensure(swarmRoundLedger.id === "seis-ai-core-subagent-swarm-round-ledger", "swarm round ledger id mismatch");
ensure(swarmRoundLedger.status === "plan-only-supervised-ledger", "swarm round ledger must remain plan-only");
ensure(swarmRoundLedger.ownerObjectiveMap?.duration === "five-years", "swarm round ledger must preserve five-year objective");
ensure(swarmRoundLedger.ownerObjectiveMap?.defaultRoundWindow === 15, "swarm round ledger default window must be 15");
ensure(swarmRoundLedger.ownerObjectiveMap?.expandedRoundWindow === 30, "swarm round ledger expanded window must be 30");
ensure(swarmRoundLedger.ownerObjectiveMap?.expandedRoundWindowRequiresOwnerApproval === true, "30-round expansion must require owner approval");
ensure(swarmRoundLedger.runtimeBoundary?.continuousBackgroundRuntime === "not-authorized", "swarm round ledger must block continuous background runtime");
ensure(swarmRoundLedger.runtimeBoundary?.credentialAccess === "forbidden", "swarm round ledger must block credentials");
ensure(swarmRoundLedger.runtimeBoundary?.sshExecution === "forbidden", "swarm round ledger must block SSH");
ensure(swarmRoundLedger.runtimeBoundary?.cloudProvisioning === "forbidden", "swarm round ledger must block cloud provisioning");
ensure(swarmRoundLedger.runtimeBoundary?.modelTraining === "forbidden", "swarm round ledger must block model training");
ensure(swarmRoundLedger.runtimeBoundary?.agiClaimAllowed === false, "swarm round ledger must block AGI claims");
ensure(Array.isArray(swarmRoundLedger.roundAssignments) && swarmRoundLedger.roundAssignments.length === 15, "swarm round ledger must define 15 default rounds");

ensure(roundExecutionLedger.id === "seis-ai-core-subagent-round-execution-evidence-ledger", "round execution ledger id mismatch");
ensure(roundExecutionLedger.status === "repo-local-supervised-closeout-evidence", "round execution ledger must remain supervised evidence");
ensure(roundExecutionLedger.runtimeBoundary?.currentLevel === "evidence-ledger-only", "round execution ledger must remain evidence-only");
ensure(roundExecutionLedger.runtimeBoundary?.backgroundAutomation === "disabled", "round execution ledger must keep background automation disabled");
ensure(roundExecutionLedger.runtimeBoundary?.continuousBackgroundRuntime === "not-authorized", "round execution ledger must block continuous runtime");
for (const key of [
  "externalMutationPerformed",
  "credentialAccessPerformed",
  "sshExecutionPerformed",
  "deploymentPerformed",
  "githubMutationPerformed",
  "providerCallPerformed",
  "modelTrainingPerformed",
  "releasePromotionAllowed",
  "agiClaimAllowed",
  "routeEligibleToday"
]) {
  ensure(roundExecutionLedger.runtimeBoundary?.[key] === false, `roundExecutionLedger.runtimeBoundary.${key} must be false`);
}
ensure(roundExecutionLedger.roundWindowState?.defaultRoundWindow === 15, "round execution ledger default window must be 15");
ensure(roundExecutionLedger.roundWindowState?.expandedRoundWindow === 30, "round execution ledger expanded window must be 30");
ensure(roundExecutionLedger.roundWindowState?.expandedRoundWindowRequiresOwnerApproval === true, "round execution ledger 30-round expansion must require owner approval");
ensure(Array.isArray(roundExecutionLedger.closeoutRecords) && roundExecutionLedger.closeoutRecords.length >= 5, "round execution ledger needs supervised closeout evidence");
ensure(roundExecutionLedger.evidenceSummary?.completionClaimAllowed === false, "round execution ledger must block completion claims");
ensure(roundExecutionLedger.evidenceSummary?.continuousRuntimeClaimAllowed === false, "round execution ledger must block continuous-runtime claims");
ensure(roundExecutionLedger.evidenceSummary?.agiClaimAllowed === false, "round execution ledger must block AGI claims");

if (failures.length > 0) {
  console.error("SEIS AI truth-boundary core check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS AI truth-boundary core check passed.");
