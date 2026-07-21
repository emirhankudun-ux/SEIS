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

test("keeps the Wave 2 public distribution review deterministic and release-gated", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  assert.equal(review.status, "completed-repository-local-distribution-maintenance-review");
  assert.equal(review.distribution.marketplaceName, "seis-repo");
  assert.equal(review.distribution.publicCardCount, 380);
  assert.equal(review.distribution.applicationPluginCount, 74);
  assert.equal(review.contracts.permissions.writePermissionGrantCount, 0);
  assert.equal(review.contracts.permissions.networkPermissionGrantCount, 0);
  assert.equal(review.contracts.permissions.secretPermissionGrantCount, 0);
  assert.equal(review.contracts.installAndRuntime.freshTaskReloadRecorded, false);
  assert.equal(review.contracts.installAndRuntime.freshTaskReloadState, "incomplete-local-fresh-task-evidence");
  assert.equal(review.contracts.provenanceAndRelease.releasePromoted, false);
  assert.equal(review.publicBoundary.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(review).includes(repositoryRoot), false);
});
