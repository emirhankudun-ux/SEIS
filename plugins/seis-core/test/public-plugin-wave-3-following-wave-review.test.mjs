import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-following-wave-review.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-following-wave-review.mjs");

test("preserves the Wave 3 candidate snapshot after one bounded Wave 4 integration", () => {
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
  assert.equal(review.stateAtCheckpoint.wave3Completed, false);
  assert.equal(review.stateAtCheckpoint.wave4Activated, false);
  assert.ok(Object.values(review.checks).every(Boolean));
  assert.equal(review.followingWaveDecision.wave, 4);
  assert.equal(review.followingWaveDecision.status, "candidate-identified-plan-required");
  assert.equal(review.followingWaveDecision.selectedCapability, "seis-swift-package-topology");
  assert.equal(review.followingWaveDecision.implementationApproved, false);
  assert.equal(review.followingWaveDecision.activationApproved, false);
  assert.equal(review.followingWaveDecision.candidatePackageExists, false);
  assert.equal(review.followingWaveDecision.candidatePublicCardExists, false);
  assert.equal(review.candidateContract.input.fixedManifestPath, "packages/seis_platform_swift/Package.swift");
  assert.equal(review.candidateContract.permissions.write.length, 0);
  assert.equal(review.candidateContract.permissions.network.length, 0);
  assert.equal(review.candidateContract.permissions.secrets.length, 0);
  assert.equal(review.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(review.publicBoundary.personalMarketplaceRead, false);
  assert.equal(review.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(review.externalClaims.compiledSwift, false);
  assert.equal(review.externalClaims.swiftPmTestPass, false);
  assert.equal(review.externalClaims.publicRelease, false);
  assert.equal(JSON.stringify(review).includes(repositoryRoot), false);

  const sourceManifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "apps/seis-core/data/seis-core-plugin-sources.json"), "utf8"));
  const marketplace = JSON.parse(fs.readFileSync(path.join(repositoryRoot, ".agents/plugins/marketplace.json"), "utf8"));
  assert.equal(sourceManifest.pluginCount, 74);
  assert.equal(marketplace.plugins.length, 380);
  assert.ok(sourceManifest.plugins.some((entry) => entry.name === "seis-swift-package-topology"));
  assert.ok(marketplace.plugins.some((entry) => entry.name === "seis-swift-package-topology" && entry.source?.path === "./plugins/seis-core/seis-swift-package-topology"));
});
