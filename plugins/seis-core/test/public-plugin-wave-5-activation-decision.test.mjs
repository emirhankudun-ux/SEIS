import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-5-activation-decision.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-5-activation-decision.mjs");

test("records a separate public-only Wave 5 activation decision", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const decision = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(decision.id, "seis-public-plugin-wave-5-activation-decision");
  assert.equal(decision.goalId, "SEIS-GOAL-021");
  assert.equal(decision.wave, 5);
  assert.equal(decision.status, "approved-public-local-wave-5-activation");
  assert.equal(decision.authority.source, "active-thread-user-continuation-objective");
  assert.equal(decision.decision.selectedCapability, "seis-plugin-capability-coverage");
  assert.equal(decision.decision.activationApproved, true);
  assert.equal(decision.decision.implementationApproved, true);
  assert.equal(decision.decision.implementationStarted, true);
  assert.equal(decision.decision.candidatePackageExists, true);
  assert.equal(decision.decision.candidatePublicCardExists, true);
  assert.equal(decision.decision.publicReleaseApproved, false);
  assert.ok(Object.values(decision.preconditions).every(Boolean));
  assert.equal(decision.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(decision.publicBoundary.personalMarketplaceRead, false);
  assert.equal(decision.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(decision.publicBoundary.network, false);
  assert.equal(decision.publicBoundary.externalWrites, false);
  assert.equal(decision.publicBoundary.secrets, false);
  assert.equal(decision.publicBoundary.protectedDefaultBranchWrites, false);
  assert.equal(decision.publicBoundary.publicReleaseAllowed, false);
  assert.deepEqual(decision.permissions.write, []);
  assert.deepEqual(decision.permissions.network, []);
  assert.deepEqual(decision.permissions.secrets, []);
  assert.ok(Object.values(decision.externalClaims).every((value) => value === false));
  assert.equal(JSON.stringify(decision).includes(repositoryRoot), false);
});
