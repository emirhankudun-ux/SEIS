import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-evidence-retention.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-evidence-retention.mjs");

test("retains bounded public-only evidence for Wave 4 step 99", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const retention = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(retention.status, "completed-public-evidence-retention");
  assert.equal(retention.step, 99);
  assert.equal(retention.stateAtCheckpoint.completedStepCountBeforeTrackerUpdate, 98);
  assert.equal(retention.stateAtCheckpoint.activeStepBeforeTrackerUpdate, 99);
  assert.equal(retention.stateAtCheckpoint.nextPlannedDecisionStep, 100);
  assert.ok(Object.values(retention.checks).every(Boolean));
  assert.equal(retention.retention.status, "bounded-public-evidence-retained");
  assert.equal(retention.retention.relativePathOnly, true);
  assert.equal(retention.retention.rawContentStored, false);
  assert.equal(retention.retention.deletionPerformed, false);
  assert.equal(retention.retention.externalStorageUsed, false);
  assert.equal(retention.retention.nextActiveStep, 100);
  assert.equal(retention.retention.retainedArtifactCount, retention.retention.retainedEvidence.length);
  assert.ok(retention.retention.retainedEvidence.every((entry) => entry.regularFile && !entry.symlink && entry.bytes > 0));
  assert.equal(retention.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(retention.publicBoundary.personalMarketplaceRead, false);
  assert.equal(retention.publicBoundary.personalMarketplaceMutation, false);
  assert.ok(Object.values(retention.externalClaims).every((value) => value === false));
  assert.equal(JSON.stringify(retention).includes(repositoryRoot), false);
});
