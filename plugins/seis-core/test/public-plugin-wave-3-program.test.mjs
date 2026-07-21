import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const programPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-program.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-program.mjs");

test("closes Wave 3 as an evidence-led public SEIS Repo implementation with one approved card", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const program = JSON.parse(fs.readFileSync(programPath, "utf8"));
  assert.equal(program.status, "completed");
  assert.equal(program.maturity, "prototype");
  assert.equal(program.wave.number, 3);
  assert.equal(program.steps.length, 100);
  assert.equal(program.progress.completedStepCount, 100);
  assert.equal(program.progress.plannedStepCount, 0);
  assert.deepEqual(program.progress.inProgressStepNumbers, []);
  assert.equal(program.progress.completedRoundCount, 5);
  assert.equal(program.progress.nextStepNumber, null);
  assert.equal(program.selection.status, "implementation-approved");
  assert.equal(program.selection.selectedCapability, "seis-swift-concurrency-audit");
  assert.equal(program.selection.implementationStarted, true);
  assert.equal(program.selection.additionalPublicCardAdded, true);
  assert.equal(program.evidence.round3CheckpointPath, "content/development/seis-public-plugin-wave-3-round-3-checkpoint.json");
  assert.equal(program.evidence.round4ReviewPath, "content/development/seis-public-plugin-wave-3-round-4-review.json");
  assert.equal(program.evidence.handoffReadinessPath, "content/development/seis-public-plugin-wave-3-handoff-readiness.json");
  assert.equal(program.evidence.finalValidationPath, "content/development/seis-public-plugin-wave-3-final-validation.json");
  assert.equal(program.evidence.finalPreflightPath, "content/development/seis-public-plugin-wave-3-final-preflight.json");
  assert.equal(program.evidence.deliveryEvidencePath, "content/development/seis-public-plugin-wave-3-delivery-evidence.json");
  assert.equal(program.evidence.repositoryLocalHandoffPath, "content/development/seis-public-plugin-wave-3-repository-local-handoff.json");
  assert.equal(program.evidence.followingWaveReviewPath, "content/development/seis-public-plugin-wave-3-following-wave-review.json");
  assert.equal(program.evidence.wave4ProgramPath, "content/development/seis-public-plugin-wave-4-program.json");
  assert.equal(program.evidence.closeoutPath, "content/development/seis-public-plugin-wave-3-closeout.json");
  assert.equal(program.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(program.publicBoundary.marketplaceDisplayName, "SEIS Repo");
  assert.equal(program.publicBoundary.personalMarketplaceRead, false);
  assert.equal(program.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(program.publicBoundary.network, false);
  assert.equal(program.publicBoundary.externalWrites, false);
  assert.equal(program.publicBoundary.secrets, false);
  assert.equal(program.publicBoundary.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(program).includes(repositoryRoot), false);
});
