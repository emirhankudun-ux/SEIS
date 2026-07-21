import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-handoff-preparation.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-handoff-preparation.mjs");

test("keeps Wave 4 step 96 as a non-terminal handoff preparation gate", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const preparation = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(preparation.status, "in-progress-repository-local-handoff-preparation");
  assert.equal(preparation.step, 96);
  assert.equal(preparation.stateAtPreparation.completedStepCount, 95);
  assert.equal(preparation.stateAtPreparation.activeStep, 96);
  assert.deepEqual(preparation.stateAtPreparation.remainingStepNumbers, [97, 98, 99, 100]);
  assert.ok(Object.values(preparation.completedEvidence).every(Boolean));
  assert.equal(preparation.handoffGate.ready, false);
  assert.equal(preparation.handoffGate.allOneHundredStepsHaveCurrentEvidence, false);
  assert.equal(preparation.handoffGate.terminalHandoffPublished, false);
  assert.equal(preparation.handoffGate.waveCompleted, false);
  assert.equal(preparation.handoffGate.wave5ActivationApproved, false);
  assert.ok(Object.values(preparation.externalClaims).every((value) => value === false));
  assert.equal(preparation.recommendedFollowUp.status, "created-proposed-owner-decision-required");
  assert.equal(preparation.recommendedFollowUp.decisionPath, "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json");
  assert.equal(JSON.stringify(preparation).includes(repositoryRoot), false);
});
