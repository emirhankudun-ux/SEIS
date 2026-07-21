import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const programPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-program.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-program.mjs");

test("records the first bounded Wave 4 topology integration checkpoint", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const program = JSON.parse(fs.readFileSync(programPath, "utf8"));
  assert.equal(program.status, "in-progress");
  assert.equal(program.maturity, "prototype");
  assert.equal(program.wave.number, 4);
  assert.equal(program.wave.totalSteps, 100);
  assert.equal(program.rounds.length, 5);
  assert.equal(program.steps.length, 100);
  assert.ok(program.steps.every((step, index) => step.number === index + 1 && step.status === (index < 80 ? "completed" : index === 80 ? "in-progress" : "planned")));
  assert.equal(program.scope.selectedCapability, "seis-swift-package-topology");
  assert.equal(program.activationGate.status, "implemented-repository-local");
  assert.equal(program.activationGate.activationDecisionPath, "content/development/seis-public-plugin-wave-4-activation-decision.json");
  assert.equal(program.activationGate.implementationStarted, true);
  assert.equal(program.activationGate.candidatePackageExists, true);
  assert.equal(program.activationGate.candidatePublicCardExists, true);
  assert.deepEqual(program.progress.inProgressStepNumbers, [81]);
  assert.equal(program.progress.completedStepCount, 80);
  assert.equal(program.progress.completedRoundCount, 4);
  assert.equal(program.progress.plannedStepCount, 19);
  assert.equal(program.evidence.integrationCheckpointPath, "content/development/seis-public-plugin-wave-4-integration-checkpoint.json");
  assert.ok(Object.values(program.checks).every(Boolean));
  assert.equal(program.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(program.publicBoundary.personalMarketplaceRead, false);
  assert.equal(program.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(program.publicBoundary.network, false);
  assert.equal(program.publicBoundary.externalWrites, false);
  assert.equal(program.publicBoundary.secrets, false);
  assert.equal(program.externalClaims.compiledSwift, false);
  assert.equal(program.externalClaims.swiftPmTestPass, false);
  assert.equal(program.externalClaims.publicRelease, false);
  assert.equal(JSON.stringify(program).includes(repositoryRoot), false);
});
