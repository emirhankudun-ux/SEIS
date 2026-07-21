import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-following-wave-review.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-following-wave-review.mjs");

test("keeps Wave 5 capability coverage planned and public-only after Wave 4 step 98", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const review = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(review.status, "completed-following-wave-scope-review");
  assert.equal(review.step, 98);
  assert.equal(review.stateAtCheckpoint.completedStepCountBeforeTrackerUpdate, 97);
  assert.equal(review.stateAtCheckpoint.activeStepBeforeTrackerUpdate, 98);
  assert.equal(review.stateAtCheckpoint.nextPlannedDecisionStep, 99);
  assert.ok(Object.values(review.checks).every(Boolean));
  assert.equal(review.followingWaveDecision.wave, 5);
  assert.equal(review.followingWaveDecision.selectedCapability, "seis-plugin-capability-coverage");
  assert.equal(review.followingWaveDecision.implementationApproved, false);
  assert.equal(review.followingWaveDecision.activationApproved, false);
  assert.equal(review.followingWaveDecision.candidatePackageExists, false);
  assert.equal(review.followingWaveDecision.candidatePublicCardExists, false);
  assert.deepEqual(review.candidateContract.permissions.write, []);
  assert.deepEqual(review.candidateContract.permissions.network, []);
  assert.deepEqual(review.candidateContract.permissions.secrets, []);
  assert.ok(Object.values(review.externalClaims).every((value) => value === false));
  assert.equal(review.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(review.publicBoundary.personalMarketplaceRead, false);
  assert.equal(review.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(JSON.stringify(review).includes(repositoryRoot), false);
});
