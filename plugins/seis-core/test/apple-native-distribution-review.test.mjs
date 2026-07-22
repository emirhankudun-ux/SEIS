import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const reviewPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-2-distribution-review.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-2-distribution-review.mjs");
const sourceManifestPath = path.join(repositoryRoot, "apps/seis-core/data/seis-core-plugin-sources.json");
const marketplacePath = path.join(repositoryRoot, ".agents/plugins/marketplace.json");

test("keeps the Wave 2 public distribution review deterministic and release-gated", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8"));
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
  assert.equal(review.status, "completed-repository-local-distribution-maintenance-review");
  assert.equal(review.distribution.marketplaceName, "seis-repo");
  assert.equal(review.historicalWave2Distribution.applicationSourcePackageCount, 72);
  assert.equal(review.historicalWave2Distribution.marketplaceCardCount, 378);
  assert.equal(review.historicalWave2Distribution.directApplicationCardCount, 72);
  assert.equal(review.distribution.distributionMode, "curated-bounded-public-bundles");
  assert.equal(review.distribution.marketplaceCardCount, marketplace.plugins.length);
  assert.equal(review.distribution.marketplaceCardCount, 34);
  assert.equal(review.distribution.bundleCardCount, 33);
  assert.equal(review.distribution.applicationBundleCardCount, 6);
  assert.equal(review.distribution.topicBundleCardCount, 27);
  assert.equal(review.distribution.retainedSourceCapabilityCount, 380);
  assert.equal(review.distribution.applicationSourceCapabilityCount, sourceManifest.plugins.length);
  assert.equal(review.distribution.applicationSourceCapabilityCount, 75);
  assert.equal(review.distribution.appleReadiness.marketplaceCard, false);
  assert.equal(review.distribution.appleReadiness.distributionBundleId, "seis-application-bundle-04");
  assert.equal(review.distribution.appleReadiness.bundleMembershipCount, 1);
  assert.equal(review.contracts.permissions.writePermissionGrantCount, 0);
  assert.equal(review.contracts.permissions.networkPermissionGrantCount, 0);
  assert.equal(review.contracts.permissions.secretPermissionGrantCount, 0);
  assert.equal(review.contracts.installAndRuntime.freshTaskReloadRecorded, false);
  assert.equal(review.contracts.installAndRuntime.freshTaskReloadState, "incomplete-local-fresh-task-evidence");
  assert.equal(review.contracts.provenanceAndRelease.releasePromoted, false);
  assert.equal(review.publicBoundary.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(review).includes(repositoryRoot), false);
});
