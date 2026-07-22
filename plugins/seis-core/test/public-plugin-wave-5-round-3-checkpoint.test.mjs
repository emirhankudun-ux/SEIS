import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const checkpointPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-5-round-3-checkpoint.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-5-round-3-checkpoint.mjs");

test("records bounded Wave 5 round 3 resilience and public-contract evidence", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, "utf8"));
  assert.equal(checkpoint.id, "seis-public-plugin-wave-5-round-3-checkpoint");
  assert.equal(checkpoint.goalId, "SEIS-GOAL-021");
  assert.equal(checkpoint.wave, 5);
  assert.equal(checkpoint.round, 3);
  assert.equal(checkpoint.status, "completed-repository-local-round-3-checkpoint");
  assert.deepEqual(checkpoint.completedSteps, Array.from({ length: 20 }, (_, index) => index + 41));
  assert.equal(checkpoint.capability.id, "seis-plugin-capability-coverage");
  assert.equal(checkpoint.capability.additionalPublicCardAdded, false);
  assert.equal(checkpoint.boundedCoverage.sourcePluginCount, 75);
  assert.equal(checkpoint.boundedCoverage.catalogPluginCount, 75);
  assert.equal(checkpoint.boundedCoverage.matrixPluginCount, 75);
  assert.equal(checkpoint.boundedCoverage.bundleApplicationMemberCount, 75);
  assert.equal(checkpoint.boundedCoverage.marketplacePublicCardCount, 34);
  assert.equal(checkpoint.boundedCoverage.coverageOutputTruncated, false);
  assert.equal(checkpoint.outputContract.maxReturnedCategoryKinds, 128);
  assert.equal(checkpoint.outputContract.maxReturnedCapabilityTokenKinds, 256);
  assert.equal(checkpoint.outputContract.maxReturnedFindings, 64);
  assert.equal(checkpoint.outputContract.arbitraryRootsAllowed, false);
  assert.ok(Object.values(checkpoint.checks).every(Boolean));
  assert.equal(checkpoint.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(checkpoint.publicBoundary.personalMarketplaceRead, false);
  assert.equal(checkpoint.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(checkpoint.publicBoundary.network, false);
  assert.equal(checkpoint.publicBoundary.externalWrites, false);
  assert.equal(checkpoint.publicBoundary.secrets, false);
  assert.equal(checkpoint.publicBoundary.publicReleaseAllowed, false);
  assert.ok(Object.values(checkpoint.externalClaims).every((value) => value === false));
  assert.equal(JSON.stringify(checkpoint).includes(repositoryRoot), false);
});
