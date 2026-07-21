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
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const handoff = fs.existsSync(handoffPath) ? JSON.parse(fs.readFileSync(handoffPath, "utf8")) : null;
const wave2Program = fs.existsSync(wave2ProgramPath) ? JSON.parse(fs.readFileSync(wave2ProgramPath, "utf8")) : null;
const wave2Handoff = fs.existsSync(wave2HandoffPath) ? JSON.parse(fs.readFileSync(wave2HandoffPath, "utf8")) : null;
const wave3Program = fs.existsSync(wave3ProgramPath) ? JSON.parse(fs.readFileSync(wave3ProgramPath, "utf8")) : null;
const wave3Decision = fs.existsSync(wave3DecisionPath) ? JSON.parse(fs.readFileSync(wave3DecisionPath, "utf8")) : null;
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
    ensure(wave3Program?.id === "seis-public-plugin-wave-3-program" && wave3Program?.status === "in-progress" && wave3Program?.progress?.completedStepCount === 46 && wave3Program?.progress?.plannedStepCount === 53 && Array.isArray(wave3Program?.progress?.inProgressStepNumbers) && wave3Program.progress.inProgressStepNumbers.length === 1 && wave3Program.progress.inProgressStepNumbers[0] === 47, "wave 3 program evidence is invalid");
    ensure(wave3Program?.selection?.status === "implementation-approved" && wave3Program?.selection?.selectedCapability === "seis-swift-concurrency-audit" && wave3Program?.selection?.implementationStarted === true && wave3Program?.selection?.additionalPublicCardAdded === true, "wave 3 selection evidence is invalid");
    ensure(Array.isArray(wave3Program?.steps) && wave3Program.steps.length === 100 && wave3Program.steps.every((step, stepIndex) => step?.status === (stepIndex < 46 ? "completed" : stepIndex === 46 ? "in-progress" : "planned")), "wave 3 step state is invalid");
    ensure(wave3Decision?.id === "seis-public-plugin-wave-3-capability-decision" && wave3Decision?.status === "approved-public-local-implementation" && wave3Decision?.decision?.selectedCapability === "seis-swift-concurrency-audit" && wave3Decision?.decision?.implementationStarted === true && wave3Decision?.decision?.additionalPublicCardAdded === true, "wave 3 decision evidence is invalid");
  } else {
    ensure(wave?.status === "not-planned", `wave ${index + 1} must remain not-planned until its review`);
  }
}

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
