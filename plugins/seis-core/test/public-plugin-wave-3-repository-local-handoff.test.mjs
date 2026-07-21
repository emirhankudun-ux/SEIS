import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-repository-local-handoff.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-repository-local-handoff.mjs");

test("publishes a repository-local Wave 3 handoff while keeping the wave and Wave 4 gated", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const handoff = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(handoff.status, "completed-repository-local-handoff");
  assert.equal(handoff.step, 97);
  assert.equal(handoff.stateAtCheckpoint.completedStepCountBeforeTrackerUpdate, 96);
  assert.equal(handoff.stateAtCheckpoint.activeStepBeforeTrackerUpdate, 97);
  assert.equal(handoff.stateAtCheckpoint.nextPlannedDecisionStep, 98);
  assert.equal(handoff.stateAtCheckpoint.waveCompleted, false);
  assert.equal(handoff.stateAtCheckpoint.wave4Activated, false);
  assert.ok(Object.values(handoff.checks).every(Boolean));
  assert.equal(handoff.handoff.delivery.featureBranch, "plugins/seis-plugin-root-20260715");
  assert.equal(handoff.handoff.delivery.priorDeliveryEvidenceRemoteVerified, true);
  assert.equal(handoff.handoff.delivery.protectedDefaultBranchWritten, false);
  assert.equal(handoff.handoff.knownLimits.length, 4);
  assert.equal(handoff.publicBoundary.personalMarketplaceRead, false);
  assert.equal(handoff.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(handoff.publicBoundary.publicReleaseAllowed, false);
  assert.equal(handoff.externalClaims.independentInstallation, false);
  assert.equal(handoff.externalClaims.publicRelease, false);
  assert.equal(handoff.futureWaveDecision.activationApproved, false);
  assert.equal(JSON.stringify(handoff).includes(repositoryRoot), false);
});
