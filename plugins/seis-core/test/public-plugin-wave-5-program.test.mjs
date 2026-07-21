import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const programPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-5-program.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-5-program.mjs");

test("tracks Wave 5 after the completed second public-only delivery tranche", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const program = JSON.parse(fs.readFileSync(programPath, "utf8"));
  assert.equal(program.id, "seis-public-plugin-wave-5-program");
  assert.equal(program.goalId, "SEIS-GOAL-021");
  assert.equal(program.status, "in-progress");
  assert.equal(program.maturity, "prototype");
  assert.equal(program.wave.number, 5);
  assert.equal(program.wave.totalSteps, 100);
  assert.equal(program.rounds.length, 5);
  assert.equal(program.steps.length, 100);
  assert.equal(program.scope.selectedCapability, "seis-plugin-capability-coverage");
  assert.equal(program.activationGate.status, "implemented-repository-local");
  assert.equal(program.activationGate.implementationStarted, true);
  assert.equal(program.activationGate.candidatePackageExists, true);
  assert.equal(program.activationGate.candidatePublicCardExists, true);
  assert.equal(program.activationGate.publicReleaseApproved, false);
  assert.equal(program.steps.filter((step) => step.status === "completed").length, 40);
  assert.deepEqual(program.steps.filter((step) => step.status === "in-progress").map((step) => step.number), [41]);
  assert.equal(program.steps.filter((step) => step.status === "planned").length, 59);
  assert.equal(program.progress.completedStepCount, 40);
  assert.equal(program.progress.plannedStepCount, 59);
  assert.deepEqual(program.progress.inProgressStepNumbers, [41]);
  assert.equal(program.progress.completedRoundCount, 2);
  assert.equal(program.progress.nextStepNumber, 41);
  assert.equal(program.progress.firstDeliveryTranche.totalSteps, 30);
  assert.equal(program.progress.firstDeliveryTranche.status, "completed-repository-local");
  assert.equal(program.progress.secondDeliveryTranche.stepRange, "21-40");
  assert.equal(program.progress.secondDeliveryTranche.status, "completed-repository-local");
  assert.equal(program.rounds[0].status, "completed");
  assert.equal(program.rounds[1].status, "completed");
  assert.equal(program.rounds[2].status, "in-progress");
  assert.equal(program.checks.fixedRegistrySafetyCoverage, true);
  assert.ok(Object.values(program.checks).every(Boolean));
  assert.equal(program.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(program.publicBoundary.personalMarketplaceRead, false);
  assert.equal(program.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(program.publicBoundary.network, false);
  assert.equal(program.publicBoundary.externalWrites, false);
  assert.equal(program.publicBoundary.secrets, false);
  assert.equal(program.publicBoundary.protectedDefaultBranchWrites, false);
  assert.equal(program.publicBoundary.publicReleaseAllowed, false);
  assert.ok(Object.values(program.externalClaims).every((value) => value === false));
  assert.equal(JSON.stringify(program).includes(repositoryRoot), false);
});
