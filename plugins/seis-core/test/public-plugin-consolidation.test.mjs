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
  assert.equal(record.schemaVersion, 4);
  assert.equal(record.id, "seis-public-plugin-consolidation");
  assert.equal(record.goalId, "SEIS-GOAL-0029");
  assert.equal(record.parentGoalId, "SEIS-GOAL-0024");
  assert.equal(record.status, "implemented-repository-local-not-published");
  assert.equal(record.installationPolicy.canonicalInstallId, "seis-ai-agent@seis-repo");
  assert.equal(record.installationPolicy.maximumGeneralPluginSelectionsPerTask, 1);
  assert.equal(record.installationPolicy.internalPackagesAreInstallTargets, false);
  assert.equal(record.installationPolicy.sourceMembersAutoInstalled, false);

  assert.equal(record.inventory.previousMarketplaceCardCount, 34);
  assert.equal(record.inventory.publicCardCount, 10);
  assert.equal(record.inventory.generalPluginCardCount, 10);
  assert.equal(record.inventory.internalPackageCount, 30);
  assert.equal(record.inventory.internalPackageCardCount, 0);
  assert.equal(record.inventory.applicationSourcePluginCount, 75);
  assert.equal(record.inventory.topicSourcePluginCount, 300);
  assert.equal(record.inventory.packagedSourceCapabilityCount, 375);
  assert.equal(record.inventory.retainedSourceCapabilityCount, 380);

  assert.equal(record.packagePlan.maximumPackageSize, 15);
  assert.ok(record.packagePlan.minimumPackageMemberCount > 0);
  assert.ok(record.packagePlan.maximumPackageMemberCount <= 15);
  assert.equal(record.packagePlan.internalPackagesPerGeneralPlugin, 3);
  assert.equal(record.packagePlan.sourcePackagesDeleted, false);
  assert.equal(record.packagePlan.internalPackagesMarketplaceVisible, false);
  assert.equal(record.packagePlan.exactOnceCoverage, true);

  assert.equal(record.identityBoundaries.mergeProducts, false);
  assert.deepEqual(record.identityBoundaries.protectedProjectFamilies, [
    "SEIS",
    "ELENI-NEFERI",
    "PANTECHNOEPISTEMONOESIS",
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
