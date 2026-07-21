import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-round-4-review.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-round-4-review.mjs");

test("closes Wave 3 resilience review without widening public permissions or release claims", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const review = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(review.status, "completed-repository-local-round-review");
  assert.deepEqual(review.completedSteps, Array.from({ length: 19 }, (_, index) => index + 61));
  assert.equal(review.overlapReview.nonDuplicative, true);
  assert.equal(review.pathAndLimitReview.fixedSourceRootCount, 2);
  assert.equal(review.pathAndLimitReview.arbitraryPathRefusalCovered, true);
  assert.equal(review.stateAndOutputReview.rawSourceReturned, false);
  assert.equal(review.stateAndOutputReview.rawMatchedValuesReturned, false);
  assert.equal(review.accessibilityAndPerformance.publicUiSurfaceChanged, false);
  assert.equal(review.permissionsAndClaims.write.length, 0);
  assert.equal(review.permissionsAndClaims.network.length, 0);
  assert.equal(review.permissionsAndClaims.secrets.length, 0);
  assert.equal(review.permissionsAndClaims.publicReleaseAllowed, false);
  assert.equal(review.lifecycleAndCounts.marketplaceCardCount, 379);
  assert.equal(review.checkpointDiff.changedFileCount, 67);
  assert.equal(review.checkpointDiff.unexpectedPathCount, 0);
  assert.equal(JSON.stringify(review).includes(repositoryRoot), false);
});
