import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-public-boundary-decision.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-public-boundary-decision.mjs");

test("records Wave 4 policy observations and public-proof limits without a release claim", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const decision = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(decision.status, "completed-repository-local-public-boundary-decision");
  assert.equal(decision.maturity, "prototype");
  assert.deepEqual(decision.completedSteps, [91, 92, 93, 94, 95]);
  assert.equal(decision.stateAtCheckpoint.completedStepCountBeforeTrackerUpdate, 90);
  assert.equal(decision.stateAtCheckpoint.activeStepBeforeTrackerUpdate, 91);
  assert.equal(decision.stateAtCheckpoint.nextPlannedStep, 96);
  assert.ok(Object.values(decision.checks).every(Boolean));
  assert.equal(decision.remotePolicyObservations.validationDeliveryCommit, "6f94f08612839984fc841ac56f01e224010456c3");
  assert.equal(decision.remotePolicyObservations.remoteReferenceVerified, true);
  assert.equal(decision.remotePolicyObservations.protectedDefaultBranchWritten, false);
  assert.equal(decision.remotePolicyObservations.hostReported.length, 4);
  assert.equal(decision.historicalWave4Distribution.marketplaceName, "seis-repo");
  assert.equal(decision.historicalWave4Distribution.applicationPluginCount, 74);
  assert.equal(decision.historicalWave4Distribution.publicCardCount, 380);
  assert.equal(decision.historicalWave4Distribution.topologyCardCount, 1);
  assert.equal(decision.historicalWave4Distribution.selectedCapabilityHadDirectMarketplaceCard, true);
  assert.equal(decision.currentMarketplaceProjection.marketplaceName, "seis-repo");
  assert.equal(decision.currentMarketplaceProjection.publicCardCount, 34);
  assert.equal(decision.currentMarketplaceProjection.canonicalCardCount, 1);
  assert.equal(decision.currentMarketplaceProjection.bundleCardCount, 33);
  assert.equal(decision.currentMarketplaceProjection.applicationBundleCardCount, 6);
  assert.equal(decision.currentMarketplaceProjection.topicBundleCardCount, 27);
  assert.equal(decision.currentMarketplaceProjection.sourceCapabilityInventory.rootSourceModuleCount, 5);
  assert.equal(decision.currentMarketplaceProjection.sourceCapabilityInventory.applicationSourcePackageCount, 75);
  assert.equal(decision.currentMarketplaceProjection.sourceCapabilityInventory.topicSourcePackageCount, 300);
  assert.equal(decision.currentMarketplaceProjection.sourceCapabilityInventory.retainedSourcePackageCount, 380);
  assert.equal(decision.currentMarketplaceProjection.selectedApplicationCapability.directMarketplaceCardRequired, false);
  assert.equal(decision.currentMarketplaceProjection.selectedApplicationCapability.directMarketplaceCardCount, 0);
  assert.equal(decision.currentMarketplaceProjection.selectedApplicationCapability.bundleId, "seis-application-bundle-06");
  assert.equal(decision.currentMarketplaceProjection.selectedApplicationCapability.bundleCardCount, 1);
  assert.equal(decision.publicBoundary.personalMarketplaceRead, false);
  assert.equal(decision.publicBoundary.personalMarketplaceMutation, false);
  assert.ok(Object.values(decision.externalClaims).every((value) => value === false));
  assert.equal(decision.externalProofAndApprovals.publicReleaseAllowed, false);
  assert.equal(decision.recommendedFollowUp.status, "proposed-not-created");
  assert.equal(JSON.stringify(decision).includes(repositoryRoot), false);
});
