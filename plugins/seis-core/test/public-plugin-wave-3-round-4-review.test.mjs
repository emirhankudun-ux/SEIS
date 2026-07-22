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
  assert.equal(review.overlapReview.currentMarketplaceDirectCardCount, 0);
  assert.equal(review.overlapReview.currentMarketplaceSourceRetained, true);
  assert.equal(review.overlapReview.currentDistributionBundleId, "seis-application-bundle-06");
  assert.equal(review.overlapReview.currentDistributionBundleCardPresent, true);
  assert.equal(review.overlapReview.currentDistributionBundleMembershipCount, 1);
  assert.equal(review.pathAndLimitReview.fixedSourceRootCount, 2);
  assert.equal(review.pathAndLimitReview.arbitraryPathRefusalCovered, true);
  assert.equal(review.stateAndOutputReview.rawSourceReturned, false);
  assert.equal(review.stateAndOutputReview.rawMatchedValuesReturned, false);
  assert.equal(review.accessibilityAndPerformance.publicUiSurfaceChanged, false);
  assert.equal(review.permissionsAndClaims.write.length, 0);
  assert.equal(review.permissionsAndClaims.network.length, 0);
  assert.equal(review.permissionsAndClaims.secrets.length, 0);
  assert.equal(review.permissionsAndClaims.publicReleaseAllowed, false);
  assert.equal(review.lifecycleState.publicReleaseAllowed, false);
  assert.equal(review.historicalWave3Distribution.applicationPluginCount, 73);
  assert.equal(review.historicalWave3Distribution.marketplaceCardCount, 379);
  assert.equal(review.historicalWave3Distribution.selectedCapabilityHadDirectMarketplaceCard, true);
  assert.equal(review.currentMarketplaceProjection.publicCardCount, 34);
  assert.equal(review.currentMarketplaceProjection.canonicalCardCount, 1);
  assert.equal(review.currentMarketplaceProjection.bundleCardCount, 33);
  assert.equal(review.currentMarketplaceProjection.applicationBundleCardCount, 6);
  assert.equal(review.currentMarketplaceProjection.topicBundleCardCount, 27);
  assert.equal(review.currentMarketplaceProjection.sourceCapabilityInventory.rootSourceModuleCount, 5);
  assert.equal(review.currentMarketplaceProjection.sourceCapabilityInventory.applicationSourcePackageCount, 75);
  assert.equal(review.currentMarketplaceProjection.sourceCapabilityInventory.topicSourcePackageCount, 300);
  assert.equal(review.currentMarketplaceProjection.sourceCapabilityInventory.retainedSourcePackageCount, 380);
  assert.equal(review.currentMarketplaceProjection.selectedApplicationCapability.directMarketplaceCardRequired, false);
  assert.equal(review.currentMarketplaceProjection.selectedApplicationCapability.bundleId, "seis-application-bundle-06");
  assert.equal(review.currentMarketplaceProjection.selectedApplicationCapability.bundleCardCount, 1);
  assert.equal(review.checkpointDiff.changedFileCount, 67);
  assert.equal(review.checkpointDiff.unexpectedPathCount, 0);
  assert.equal(JSON.stringify(review).includes(repositoryRoot), false);
});
