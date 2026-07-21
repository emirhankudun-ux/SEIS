import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-continuity-cadence.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-continuity-cadence.mjs");

test("keeps the requested 30-step bootstrap and five 100-step waves evidence-led and public-only", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const cadence = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(cadence.status, "active-evidence-led-cadence");
  assert.equal(cadence.cadence.bootstrap.totalSteps, 30);
  assert.equal(cadence.cadence.bootstrap.roundCount, 5);
  assert.equal(cadence.cadence.bootstrap.stepsPerRound, 6);
  assert.equal(cadence.cadence.waveSeries.waveCount, 5);
  assert.equal(cadence.cadence.waveSeries.stepsPerWave, 100);
  assert.equal(cadence.cadence.waveSeries.totalPlannedWaveSteps, 500);
  assert.equal(cadence.waves.length, 5);
  assert.equal(cadence.waves[0].status, "completed");
  assert.equal(cadence.waves[1].status, "completed");
  assert.equal(cadence.waves[2].status, "in-progress");
  assert.equal(cadence.waves[2].completedSteps, 79);
  assert.deepEqual(cadence.waves[2].inProgressSteps, [80]);
  assert.equal(cadence.waves[3].status, "planned-gated");
  assert.equal(cadence.waves[4].status, "planned-gated");
  assert.equal(cadence.futureWaveTemplate.steps.length, 100);
  assert.equal(cadence.executionBoundary.personalMarketplaceRead, false);
  assert.equal(cadence.executionBoundary.personalMarketplaceMutation, false);
  assert.equal(cadence.executionBoundary.backgroundExecutionClaimed, false);
  assert.equal(cadence.executionBoundary.protectedDefaultBranchWrites, false);
  assert.equal(JSON.stringify(cadence).includes(repositoryRoot), false);
});
