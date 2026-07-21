#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const recordPath = path.join(root, "content", "development", "seis-public-plugin-expansion-program.json");
const handoffPath = path.join(root, "content", "development", "seis-public-plugin-wave-1-handoff.json");
const wave2ProgramPath = path.join(root, "content", "development", "seis-public-plugin-wave-2-program.json");
const wave2HandoffPath = path.join(root, "content", "development", "seis-public-plugin-wave-2-handoff.json");
const wave3ProgramPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-program.json");
const wave3DecisionPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-capability-decision.json");
const wave3Round3CheckpointPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-round-3-checkpoint.json");
const wave3Round4ReviewPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-round-4-review.json");
const wave3HandoffReadinessPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-handoff-readiness.json");
const wave3FinalValidationPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-final-validation.json");
const wave3FinalPreflightPath = path.join(root, "content", "development", "seis-public-plugin-wave-3-final-preflight.json");
const wave3DeliveryEvidencePath = path.join(root, "content", "development", "seis-public-plugin-wave-3-delivery-evidence.json");
const continuityCadencePath = path.join(root, "content", "development", "seis-public-plugin-continuity-cadence.json");
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const handoff = fs.existsSync(handoffPath) ? JSON.parse(fs.readFileSync(handoffPath, "utf8")) : null;
const wave2Program = fs.existsSync(wave2ProgramPath) ? JSON.parse(fs.readFileSync(wave2ProgramPath, "utf8")) : null;
const wave2Handoff = fs.existsSync(wave2HandoffPath) ? JSON.parse(fs.readFileSync(wave2HandoffPath, "utf8")) : null;
const wave3Program = fs.existsSync(wave3ProgramPath) ? JSON.parse(fs.readFileSync(wave3ProgramPath, "utf8")) : null;
const wave3Decision = fs.existsSync(wave3DecisionPath) ? JSON.parse(fs.readFileSync(wave3DecisionPath, "utf8")) : null;
const wave3Round3Checkpoint = fs.existsSync(wave3Round3CheckpointPath) ? JSON.parse(fs.readFileSync(wave3Round3CheckpointPath, "utf8")) : null;
const wave3Round4Review = fs.existsSync(wave3Round4ReviewPath) ? JSON.parse(fs.readFileSync(wave3Round4ReviewPath, "utf8")) : null;
const wave3HandoffReadiness = fs.existsSync(wave3HandoffReadinessPath) ? JSON.parse(fs.readFileSync(wave3HandoffReadinessPath, "utf8")) : null;
const wave3FinalValidation = fs.existsSync(wave3FinalValidationPath) ? JSON.parse(fs.readFileSync(wave3FinalValidationPath, "utf8")) : null;
const wave3FinalPreflight = fs.existsSync(wave3FinalPreflightPath) ? JSON.parse(fs.readFileSync(wave3FinalPreflightPath, "utf8")) : null;
const wave3DeliveryEvidence = fs.existsSync(wave3DeliveryEvidencePath) ? JSON.parse(fs.readFileSync(wave3DeliveryEvidencePath, "utf8")) : null;
const continuityCadence = fs.existsSync(continuityCadencePath) ? JSON.parse(fs.readFileSync(continuityCadencePath, "utf8")) : null;
const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

ensure(record?.schemaVersion === 1, "schemaVersion must be 1");
ensure(record?.id === "seis-public-plugin-expansion-program", "program id is invalid");
ensure(record?.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
ensure(record?.executionBoundary?.publicMarketplace === "seis-repo", "program must target the public seis-repo marketplace");
ensure(record?.executionBoundary?.personalMarketplaceRead === false, "program must not read the personal marketplace");
ensure(record?.executionBoundary?.personalMarketplaceMutation === false, "program must not mutate the personal marketplace");
ensure(record?.executionBoundary?.backgroundExecutionClaimed === false, "program must not claim background execution");
ensure(record?.cadence?.programSteps === 30, "program must contain exactly 30 steps");
ensure(record?.cadence?.roundCount === 5 && record?.cadence?.stepsPerRound === 6, "program cadence must be five rounds of six steps");
ensure(record?.cadence?.githubDelivery?.enabled === true, "program must require validated checkpoint delivery");
ensure(record?.cadence?.githubDelivery?.protectedDefaultBranchWrites === false, "program must preserve protected default branch safety");
ensure(record?.cadence?.afterProgram?.nextWaveCount === 5 && record?.cadence?.afterProgram?.stepsPerWave === 100, "post-program cadence must define five 100-step waves");
ensure(record?.cadence?.afterProgram?.continuityCadencePath === "content/development/seis-public-plugin-continuity-cadence.json", "post-program cadence must link the continuity record");
ensure(record?.cadence?.afterProgram?.afterFiveWavesRule?.includes("30-step scope"), "post-program cadence must define the next-series scope gate");
ensure(Array.isArray(record?.rounds) && record.rounds.length === 5, "program must define five rounds");
ensure(Array.isArray(record?.steps) && record.steps.length === 30, "program must define 30 steps");
ensure(Array.isArray(record?.nextWaves) && record.nextWaves.length === 5, "program must define five next waves");

for (let index = 0; index < 30; index += 1) {
  const step = record.steps?.[index];
  const expectedNumber = index + 1;
  const expectedRound = Math.ceil(expectedNumber / 6);
  ensure(step?.number === expectedNumber, `step ${expectedNumber} number is invalid`);
  ensure(step?.round === expectedRound, `step ${expectedNumber} must belong to round ${expectedRound}`);
  ensure(typeof step?.title === "string" && step.title.length > 0, `step ${expectedNumber} needs a title`);
  ensure(typeof step?.validation === "string" && step.validation.length > 0, `step ${expectedNumber} needs validation`);
}

for (let index = 0; index < 5; index += 1) {
  const round = record.rounds?.[index];
  const wave = record.nextWaves?.[index];
  ensure(round?.round === index + 1, `round ${index + 1} is invalid`);
  ensure(Array.isArray(round?.steps) && round.steps.length === 6, `round ${index + 1} must contain six step references`);
  ensure(wave?.wave === index + 1 && wave?.steps === 100, `wave ${index + 1} must contain 100 steps`);
  if (index === 0) {
    ensure(wave?.status === "completed", "wave 1 must be completed after its release-quality handoff");
    ensure(wave?.programId === "seis-public-plugin-wave-1-program", "wave 1 must identify its 100-step program");
    ensure(wave?.handoffEvidencePath === "content/development/seis-public-plugin-wave-1-handoff.json", "wave 1 must identify its handoff evidence");
    ensure(handoff?.id === "seis-public-plugin-wave-1-handoff" && handoff?.status === "completed-repository-local-handoff", "wave 1 handoff evidence is invalid");
  } else if (index === 1) {
    ensure(wave?.status === "completed", "wave 2 must be completed only after current evidence, scope review, and risk review");
    ensure(wave?.programId === "seis-public-plugin-wave-2-program", "wave 2 must identify its 100-step program");
    ensure(wave?.scopeRiskReviewPath === "content/development/seis-public-plugin-wave-1-handoff.json", "wave 2 must identify its scope and risk review");
    ensure(wave?.capabilityDecisionPath === "content/development/seis-public-plugin-wave-2-capability-decision.json", "wave 2 must identify its capability decision");
    ensure(wave?.handoffEvidencePath === "content/development/seis-public-plugin-wave-2-handoff.json", "wave 2 must identify its handoff evidence");
    ensure(wave2Program?.id === "seis-public-plugin-wave-2-program" && wave2Program?.status === "completed" && wave2Program?.progress?.completedStepCount === 100, "wave 2 program evidence is invalid");
    ensure(Array.isArray(wave2Program?.steps) && wave2Program.steps.length === 100 && wave2Program.steps.every((step) => step?.status === "completed"), "wave 2 must contain one hundred completed steps");
    ensure(wave2Handoff?.id === "seis-public-plugin-wave-2-handoff" && wave2Handoff?.status === "completed-repository-local-handoff", "wave 2 handoff evidence is invalid");
  } else if (index === 2) {
    ensure(wave?.status === "in-progress", "wave 3 must be active only after its discovery and capability-selection gate passes");
    ensure(wave?.programId === "seis-public-plugin-wave-3-program", "wave 3 must identify its 100-step program");
    ensure(wave?.scopeRiskReviewPath === "content/development/seis-public-plugin-wave-2-handoff.json", "wave 3 must identify its Wave 2 scope and risk review");
    ensure(wave?.capabilityDecisionPath === "content/development/seis-public-plugin-wave-3-capability-decision.json", "wave 3 must identify its capability decision");
    ensure(wave3Program?.id === "seis-public-plugin-wave-3-program" && wave3Program?.status === "in-progress" && wave3Program?.progress?.completedStepCount === 96 && wave3Program?.progress?.plannedStepCount === 3 && Array.isArray(wave3Program?.progress?.inProgressStepNumbers) && wave3Program.progress.inProgressStepNumbers.length === 1 && wave3Program.progress.inProgressStepNumbers[0] === 97, "wave 3 program evidence is invalid");
    ensure(wave3Program?.selection?.status === "implementation-approved" && wave3Program?.selection?.selectedCapability === "seis-swift-concurrency-audit" && wave3Program?.selection?.implementationStarted === true && wave3Program?.selection?.additionalPublicCardAdded === true, "wave 3 selection evidence is invalid");
    ensure(Array.isArray(wave3Program?.steps) && wave3Program.steps.length === 100 && wave3Program.steps.every((step, stepIndex) => step?.status === (stepIndex < 96 ? "completed" : stepIndex === 96 ? "in-progress" : "planned")), "wave 3 step state is invalid");
    ensure(wave3Decision?.id === "seis-public-plugin-wave-3-capability-decision" && wave3Decision?.status === "approved-public-local-implementation" && wave3Decision?.decision?.selectedCapability === "seis-swift-concurrency-audit" && wave3Decision?.decision?.implementationStarted === true && wave3Decision?.decision?.additionalPublicCardAdded === true, "wave 3 decision evidence is invalid");
    ensure(wave3Round3Checkpoint?.id === "seis-public-plugin-wave-3-round-3-checkpoint" && wave3Round3Checkpoint?.status === "completed-repository-local-checkpoint" && Array.isArray(wave3Round3Checkpoint?.completedSteps) && wave3Round3Checkpoint.completedSteps.length === 14, "wave 3 round 3 checkpoint evidence is invalid");
    ensure(wave3Round4Review?.id === "seis-public-plugin-wave-3-round-4-review" && wave3Round4Review?.status === "completed-repository-local-round-review" && Array.isArray(wave3Round4Review?.completedSteps) && wave3Round4Review.completedSteps.length === 19, "wave 3 round 4 review evidence is invalid");
    ensure(wave3HandoffReadiness?.id === "seis-public-plugin-wave-3-handoff-readiness" && wave3HandoffReadiness?.status === "completed-repository-local-handoff-readiness" && wave3HandoffReadiness?.step === 80 && wave3HandoffReadiness?.futureWaveDecision?.activationApproved === false, "wave 3 handoff readiness evidence is invalid");
    ensure(wave3FinalValidation?.id === "seis-public-plugin-wave-3-final-validation" && wave3FinalValidation?.status === "completed-repository-local-final-validation" && wave3FinalValidation?.step === 81 && wave3FinalValidation?.futureWaveDecision?.activationApproved === false, "wave 3 final validation evidence is invalid");
    ensure(wave3FinalPreflight?.id === "seis-public-plugin-wave-3-final-preflight" && wave3FinalPreflight?.status === "completed-repository-local-final-preflight" && Array.isArray(wave3FinalPreflight?.completedSteps) && wave3FinalPreflight.completedSteps.length === 10 && wave3FinalPreflight.completedSteps.every((step, stepIndex) => step === stepIndex + 82) && wave3FinalPreflight?.futureWaveDecision?.activationApproved === false, "wave 3 final preflight evidence is invalid");
    ensure(wave3DeliveryEvidence?.id === "seis-public-plugin-wave-3-delivery-evidence" && wave3DeliveryEvidence?.status === "completed-repository-local-delivery-evidence" && Array.isArray(wave3DeliveryEvidence?.completedSteps) && wave3DeliveryEvidence.completedSteps.length === 5 && wave3DeliveryEvidence.completedSteps.every((step, stepIndex) => step === stepIndex + 92) && wave3DeliveryEvidence?.observedDelivery?.remoteReferenceVerified === true && wave3DeliveryEvidence?.futureWaveDecision?.activationApproved === false, "wave 3 delivery evidence is invalid");
  } else {
    ensure(wave?.status === "planned-gated", `wave ${index + 1} must remain planned-gated until its activation review`);
    ensure(wave?.programId === `seis-public-plugin-wave-${index + 1}-program`, `wave ${index + 1} must identify its future program`);
    ensure(wave?.stepTemplateId === "seis-public-plugin-future-wave-template", `wave ${index + 1} must identify the 100-step template`);
    ensure(wave?.continuityCadencePath === "content/development/seis-public-plugin-continuity-cadence.json", `wave ${index + 1} must link the continuity record`);
  }
}

ensure(continuityCadence?.id === "seis-public-plugin-continuity-cadence" && continuityCadence?.status === "active-evidence-led-cadence", "continuity cadence evidence is invalid");
ensure(continuityCadence?.cadence?.bootstrap?.totalSteps === 30 && continuityCadence?.cadence?.waveSeries?.waveCount === 5 && continuityCadence?.cadence?.waveSeries?.stepsPerWave === 100 && continuityCadence?.cadence?.waveSeries?.totalPlannedWaveSteps === 500, "continuity cadence shape is invalid");
ensure(Array.isArray(continuityCadence?.waves) && continuityCadence.waves.length === 5 && continuityCadence.waves[2]?.completedSteps === 96 && Array.isArray(continuityCadence.waves[2]?.inProgressSteps) && continuityCadence.waves[2].inProgressSteps[0] === 97 && Array.isArray(continuityCadence?.futureWaveTemplate?.steps) && continuityCadence.futureWaveTemplate.steps.length === 100, "continuity cadence wave evidence is invalid");

const completeSteps = record.steps.filter((step) => step.status === "completed").length;
const inProgressSteps = record.steps.filter((step) => step.status === "in-progress").length;
ensure(inProgressSteps <= 1, "only one program step may be in progress");

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, id: record.id, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  id: record.id,
  goalId: record.goalId,
  steps: record.steps.length,
  rounds: record.rounds.length,
  completedSteps: completeSteps,
  inProgressSteps,
  nextWaves: record.nextWaves.length,
  publicMarketplace: record.executionBoundary.publicMarketplace
}, null, 2));
