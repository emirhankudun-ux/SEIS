import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const evidencePath = path.join(repositoryRoot, "content/development/seis-swift-package-topology.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-swift-package-topology.mjs");
const sourceManifestPath = path.join(repositoryRoot, "apps/seis-core/data/seis-core-plugin-sources.json");
const marketplacePath = path.join(repositoryRoot, ".agents/plugins/marketplace.json");

test("reconciles bounded Swift Package topology evidence with the public SEIS Repo contract", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8"));
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
  assert.equal(evidence.id, "seis-swift-package-topology");
  assert.equal(evidence.goalId, "SEIS-GOAL-021");
  assert.equal(evidence.wave, 4);
  assert.equal(evidence.status, "ready-public-static-topology-evidence");
  assert.equal(evidence.plugin.marketplaceName, "seis-repo");
  assert.equal(evidence.plugin.marketplaceDisplayName, "SEIS Repo");
  assert.equal(evidence.plugin.marketplaceCategory, "Developer");
  assert.equal(evidence.plugin.publicMarketplace, true);
  assert.equal(evidence.plugin.directMarketplaceCard, false);
  assert.equal(evidence.plugin.distributionBundleId, "seis-application-bundle-06");
  assert.equal(evidence.plugin.distributionBundleMembershipCount, 1);
  assert.equal(evidence.marketplace.applicationSourceCapabilityCount, sourceManifest.plugins.length);
  assert.equal(evidence.marketplace.publicCardCount, marketplace.plugins.length);
  assert.equal(evidence.marketplace.bundleCardCount, 33);
  assert.equal(evidence.marketplace.retainedSourceCapabilityCount, 380);
  assert.equal(evidence.activation.selectedCapability, "seis-swift-package-topology");
  assert.equal(evidence.activation.implementationObserved, true);
  assert.equal(evidence.activation.publicReleaseApproved, false);
  assert.equal(evidence.audit.state, "ready");
  assert.equal(evidence.audit.ok, true);
  assert.equal(evidence.audit.classification, "bounded-static-swift-package-manifest-topology");
  assert.equal(evidence.audit.declaredPlatformCount, 2);
  assert.equal(evidence.audit.productCount, 2);
  assert.equal(evidence.audit.targetCount, 3);
  assert.equal(evidence.audit.targetDependencyEdgeCount, 1);
  assert.equal(evidence.audit.testTargetDependencyCount, 1);
  assert.equal(evidence.audit.executableResourceCount, 2);
  assert.equal(evidence.safety.write.length, 0);
  assert.equal(evidence.safety.network.length, 0);
  assert.equal(evidence.safety.secrets.length, 0);
  assert.equal(evidence.safety.resolvesSwiftPackages, false);
  assert.equal(evidence.safety.compilesSwift, false);
  assert.equal(evidence.safety.runsSwiftTests, false);
  assert.equal(evidence.safety.startsNativeApplication, false);
  assert.equal(evidence.safety.publicReleaseAllowed, false);
  assert.equal(evidence.publicBoundary.personalMarketplaceRead, false);
  assert.equal(evidence.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(evidence.publicBoundary.network, false);
  assert.equal(evidence.publicBoundary.externalWrites, false);
  assert.equal(evidence.publicBoundary.secrets, false);
  assert.equal(evidence.publicBoundary.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(evidence).includes(repositoryRoot), false);
});
