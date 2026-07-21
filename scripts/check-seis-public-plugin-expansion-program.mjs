#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const recordPath = path.join(root, "content", "development", "seis-public-plugin-expansion-program.json");
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
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
  ensure(wave?.status === "not-planned", `wave ${index + 1} must remain not-planned until a review`);
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
