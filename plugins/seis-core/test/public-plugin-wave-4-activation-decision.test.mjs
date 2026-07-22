import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-activation-decision.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-activation-decision.mjs");

test("authorizes a bounded public Wave 4 topology implementation without a release claim", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const decision = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(decision.status, "approved-public-local-wave-4-activation");
  assert.equal(decision.maturity, "implementation-authorized");
  assert.equal(decision.wave, 4);
  assert.equal(decision.step, 0);
  assert.equal(decision.stateAtDecision.wave3Completed, true);
  assert.equal(decision.stateAtDecision.wave4PreviouslyActivated, false);
  assert.equal(decision.stateAtDecision.candidatePackageExisted, false);
  assert.equal(decision.stateAtDecision.candidatePublicCardExisted, false);
  assert.equal(decision.stateAtDecision.current, false);
  assert.equal(decision.stateAtDecision.immutableHistoricalEvidence, true);
  assert.deepEqual(decision.currentMarketplaceProjection, {
    current: true,
    projectionModel: "curated-bundle-cards",
    publicCardCount: 34,
    canonicalCardCount: 1,
    bundleCardCount: 33,
    applicationBundleCardCount: 6,
    topicBundleCardCount: 27,
    retainedSourceCapabilityCount: 380,
    directSourceCapabilityCardCount: 0,
  });
  assert.equal(decision.historicalDirectCardSnapshots.length, 3);
  assert.ok(decision.historicalDirectCardSnapshots.every((snapshot) => snapshot.current === false && snapshot.immutableHistoricalEvidence === true));
  assert.equal(decision.historicalDirectCardSnapshots[2].publicCardCount, 381);
  assert.equal(decision.decision.selectedCapability, "seis-swift-package-topology");
  assert.equal(decision.decision.activationApproved, true);
  assert.equal(decision.decision.implementationApproved, true);
  assert.equal(decision.decision.implementationStarted, false);
  assert.equal(decision.decision.publicReleaseApproved, false);
  assert.equal(decision.scope.fixedManifestPath, "packages/seis_platform_swift/Package.swift");
  assert.equal(decision.scope.maximumManifestBytes, 131072);
  assert.ok(Object.values(decision.checks).every(Boolean));
  assert.equal(decision.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(decision.publicBoundary.personalMarketplaceRead, false);
  assert.equal(decision.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(decision.publicBoundary.network, false);
  assert.equal(decision.publicBoundary.externalWrites, false);
  assert.equal(decision.publicBoundary.secrets, false);
  assert.equal(decision.externalClaims.compiledSwift, false);
  assert.equal(decision.externalClaims.swiftPmTestPass, false);
  assert.equal(decision.externalClaims.publicRelease, false);
  assert.equal(JSON.stringify(decision).includes(repositoryRoot), false);
});
