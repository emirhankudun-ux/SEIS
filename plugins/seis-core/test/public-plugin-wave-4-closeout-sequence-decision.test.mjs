import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-4-closeout-sequence-decision.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-4-closeout-sequence-decision.mjs");

test("records Wave 4 closeout ordering as a proposal without changing terminal state", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const decision = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(decision.status, "proposed-owner-decision-required");
  assert.equal(decision.maturity, "specification");
  assert.equal(decision.parentGoalId, "SEIS-GOAL-021");
  assert.equal(decision.stateAtDecision.completedStepCount, 95);
  assert.equal(decision.stateAtDecision.activeStep, 96);
  assert.deepEqual(decision.stateAtDecision.plannedStepNumbers, [97, 98, 99, 100]);
  assert.ok(Object.values(decision.currentEvidence).every(Boolean));
  assert.equal(decision.decisionBoundary.approvalRequired, true);
  assert.equal(decision.decisionBoundary.approved, false);
  assert.equal(decision.decisionBoundary.appliedToCanonicalProgram, false);
  assert.equal(decision.decisionBoundary.automaticStepStatusChangesAllowed, false);
  assert.equal(decision.decisionBoundary.terminalHandoffPublished, false);
  assert.equal(decision.decisionBoundary.waveCompleted, false);
  assert.equal(decision.decisionBoundary.wave5ActivationApproved, false);
  assert.equal(decision.proposedResolution.noStepStatusChanges, true);
  assert.equal(decision.ownerOptions.length, 3);
  assert.ok(Object.values(decision.externalClaims).every((value) => value === false));
  assert.equal(decision.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(decision.publicBoundary.personalMarketplaceRead, false);
  assert.equal(decision.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(JSON.stringify(decision).includes(repositoryRoot), false);
});
