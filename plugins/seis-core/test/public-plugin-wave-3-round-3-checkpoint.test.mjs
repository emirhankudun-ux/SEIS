import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-round-3-checkpoint.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-round-3-checkpoint.mjs");

test("reconciles Wave 3 implementation steps through a public-only feature-branch checkpoint", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const checkpoint = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(checkpoint.status, "completed-repository-local-checkpoint");
  assert.deepEqual(checkpoint.completedSteps, Array.from({ length: 14 }, (_, index) => index + 47));
  assert.equal(checkpoint.selectedCapability.id, "seis-swift-concurrency-audit");
  assert.equal(checkpoint.selectedCapability.historicalAdditionalDirectCardAddedAtExecution, true);
  assert.equal(checkpoint.historicalWave3Distribution.marketplaceName, "seis-repo");
  assert.equal(checkpoint.historicalWave3Distribution.applicationPluginCount, 73);
  assert.equal(checkpoint.historicalWave3Distribution.marketplaceCardCount, 379);
  assert.equal(checkpoint.historicalWave3Distribution.marketplaceCardPresentAtCheckpoint, true);
  assert.equal(checkpoint.historicalWave3Distribution.selectedCapabilityHadDirectMarketplaceCard, true);
  assert.equal(checkpoint.currentMarketplaceProjection.marketplaceName, "seis-repo");
  assert.equal(checkpoint.currentMarketplaceProjection.publicCardCount, 34);
  assert.equal(checkpoint.currentMarketplaceProjection.canonicalCardCount, 1);
  assert.equal(checkpoint.currentMarketplaceProjection.bundleCardCount, 33);
  assert.equal(checkpoint.currentMarketplaceProjection.applicationBundleCardCount, 6);
  assert.equal(checkpoint.currentMarketplaceProjection.topicBundleCardCount, 27);
  assert.equal(checkpoint.currentMarketplaceProjection.sourceCapabilityInventory.rootSourceModuleCount, 5);
  assert.equal(checkpoint.currentMarketplaceProjection.sourceCapabilityInventory.applicationSourcePackageCount, 75);
  assert.equal(checkpoint.currentMarketplaceProjection.sourceCapabilityInventory.topicSourcePackageCount, 300);
  assert.equal(checkpoint.currentMarketplaceProjection.sourceCapabilityInventory.retainedSourcePackageCount, 380);
  assert.equal(checkpoint.currentMarketplaceProjection.selectedApplicationCapability.directMarketplaceCardRequired, false);
  assert.equal(checkpoint.currentMarketplaceProjection.selectedApplicationCapability.bundleId, "seis-application-bundle-06");
  assert.equal(checkpoint.currentMarketplaceProjection.selectedApplicationCapability.bundleCardCount, 1);
  assert.equal(checkpoint.permissions.write.length, 0);
  assert.equal(checkpoint.permissions.network.length, 0);
  assert.equal(checkpoint.permissions.secrets.length, 0);
  assert.equal(checkpoint.lifecycle.publicReleaseAllowed, false);
  assert.equal(checkpoint.lifecycle.externalProofReleaseAllowed, false);
  assert.equal(checkpoint.delivery.featureBranchOnly, true);
  assert.equal(checkpoint.delivery.protectedDefaultBranchWritten, false);
  assert.equal(checkpoint.delivery.remoteReferenceVerified, true);
  assert.equal(JSON.stringify(checkpoint).includes(repositoryRoot), false);
});
