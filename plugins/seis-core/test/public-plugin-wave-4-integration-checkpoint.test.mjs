import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-integration-checkpoint.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-integration-checkpoint.mjs");

test("records Wave 4 steps 74-80 as a public-only repository-local integration checkpoint", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const checkpoint = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(checkpoint.status, "completed-repository-local-integration-checkpoint");
  assert.equal(checkpoint.maturity, "prototype");
  assert.equal(checkpoint.wave, 4);
  assert.equal(checkpoint.round, 4);
  assert.deepEqual(checkpoint.completedSteps, [74, 75, 76, 77, 78, 79, 80]);
  assert.equal(checkpoint.capability.id, "seis-swift-package-topology");
  assert.equal(checkpoint.capability.sourceDirectoryPresent, true);
  assert.equal(checkpoint.capability.staticOnly, true);
  assert.equal(checkpoint.capability.currentSourceRetained, true);
  assert.equal(checkpoint.capability.currentDirectMarketplaceCard, false);
  assert.equal(checkpoint.capability.currentDirectMarketplaceCardCount, 0);
  assert.equal(checkpoint.capability.currentDistributionBundleId, "seis-application-bundle-06");
  assert.equal(checkpoint.capability.currentDistributionBundleCardPresent, true);
  assert.equal(checkpoint.capability.currentDistributionBundleMembershipCount, 1);
  assert.equal(checkpoint.historicalWave4Distribution.marketplaceName, "seis-repo");
  assert.equal(checkpoint.historicalWave4Distribution.applicationPluginCount, 74);
  assert.equal(checkpoint.historicalWave4Distribution.catalogPluginCount, 74);
  assert.equal(checkpoint.historicalWave4Distribution.matrixPluginCount, 74);
  assert.equal(checkpoint.historicalWave4Distribution.publicCardCount, 380);
  assert.equal(checkpoint.historicalWave4Distribution.selectedCapabilityHadDirectMarketplaceCard, true);
  assert.equal(checkpoint.currentRegistryReconciliation.applicationSourceManifestCount, 75);
  assert.equal(checkpoint.currentRegistryReconciliation.applicationCatalogCount, 75);
  assert.equal(checkpoint.currentRegistryReconciliation.applicationMatrixCount, 75);
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
  assert.equal(checkpoint.topologyEvidence.auditOk, true);
  assert.equal(checkpoint.permissions.permissionState, "deny-by-default");
  assert.deepEqual(checkpoint.permissions.write, []);
  assert.deepEqual(checkpoint.permissions.network, []);
  assert.deepEqual(checkpoint.permissions.secrets, []);
  assert.equal(checkpoint.publicSafety.lifecyclePublicReleaseAllowed, false);
  assert.equal(checkpoint.publicSafety.installStatePublicReleaseAllowed, false);
  assert.equal(checkpoint.publicSafety.installEvidencePublicReleaseAllowed, false);
  assert.equal(checkpoint.publicSafety.runtimePublicReleaseAllowed, false);
  assert.equal(checkpoint.publicSafety.securityReviewPublicReleaseAllowed, false);
  assert.ok(Object.values(checkpoint.externalClaims).every((value) => value === false));
  assert.equal(checkpoint.rollback.dataMigrationRequired, false);
  assert.equal(JSON.stringify(checkpoint).includes(repositoryRoot), false);
});
