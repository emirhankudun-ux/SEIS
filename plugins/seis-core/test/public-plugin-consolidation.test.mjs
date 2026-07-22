import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-consolidation.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-consolidation.mjs");

test("records the implemented local marketplace projection without publication claims", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(record.schemaVersion, 3);
  assert.equal(record.id, "seis-public-plugin-consolidation");
  assert.equal(record.goalId, "SEIS-GOAL-0024");
  assert.equal(record.parentGoalId, "SEIS-GOAL-021");
  assert.equal(record.status, "implemented-repository-local-not-published");
  assert.equal(record.installationPolicy.canonicalInstallId, "seis-ai-agent@seis-repo");
  assert.equal(record.installationPolicy.publicDefaultInstallCount, 1);
  assert.equal(record.installationPolicy.bundleMembersAutoInstalled, false);

  assert.equal(record.inventory.previousMarketplaceCardCount, 381);
  assert.equal(record.inventory.publicCardCount, 34);
  assert.equal(record.inventory.canonicalCardCount, 1);
  assert.equal(record.inventory.bundleCardCount, 33);
  assert.equal(record.inventory.applicationBundleCardCount, 6);
  assert.equal(record.inventory.topicBundleCardCount, 27);
  assert.equal(record.inventory.applicationSourcePluginCount, 75);
  assert.equal(record.inventory.topicSourcePluginCount, 300);
  assert.equal(record.inventory.retainedSourceCapabilityCount, 380);

  assert.equal(record.bundlePlan.maximumBundleSize, 15);
  assert.ok(record.bundlePlan.minimumBundleMemberCount > 0);
  assert.ok(record.bundlePlan.maximumBundleMemberCount <= 15);
  assert.equal(record.bundlePlan.targetMarketplaceCardCount, 34);
  assert.equal(record.bundlePlan.projectedCardReduction, 347);
  assert.equal(record.bundlePlan.sourcePackagesDeleted, false);
  assert.equal(record.bundlePlan.marketplaceProjectionGenerated, true);
  assert.equal(record.bundlePlan.bundlePackagesCreated, true);
  assert.equal(record.bundlePlan.sourcePackagesRetained, true);
  assert.equal(record.bundlePlan.exactOnceCoverage, true);
  assert.equal(record.bundlePlan.applicationBundles.length, 6);
  assert.equal(record.bundlePlan.topicBundles.length, 27);

  assert.equal(record.identityBoundaries.mergeProducts, false);
  assert.deepEqual(record.identityBoundaries.protectedTopicCategories, [
    "ELENI-NEFERI",
    "PANTECHNOEPISTEMONOESIS",
    "SEIS",
  ]);
  assert.ok(Object.values(record.checks).every(Boolean));
  assert.equal(record.publicBoundary.personalMarketplaceRead, false);
  assert.equal(record.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(record.publicBoundary.network, false);
  assert.equal(record.publicBoundary.externalWrites, false);
  assert.equal(record.publicBoundary.secrets, false);
  assert.equal(record.publicBoundary.publicReleaseAllowed, false);
  assert.ok(Object.values(record.externalClaims).every((value) => value === false));
  assert.equal(JSON.stringify(record).includes(repositoryRoot), false);
});
