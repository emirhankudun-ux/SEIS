import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const recordPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-handoff-readiness.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-handoff-readiness.mjs");

test("prepares Wave 3 handoff without completing the wave or activating Wave 4", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const readiness = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.equal(readiness.status, "completed-repository-local-handoff-readiness");
  assert.equal(readiness.step, 80);
  assert.equal(readiness.stateAtReadiness.completedStepCountBeforeReadiness, 79);
  assert.equal(readiness.stateAtReadiness.activeStepBeforeReadiness, 80);
  assert.equal(readiness.stateAtReadiness.finalWaveHandoffPublished, false);
  assert.equal(readiness.completedEvidence.staticAudit, true);
  assert.equal(readiness.completedEvidence.sourceAndMarketplace, true);
  assert.equal(readiness.completedEvidence.denyByDefaultMcp, true);
  assert.equal(readiness.publicBoundary.personalMarketplaceRead, false);
  assert.equal(readiness.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(readiness.publicBoundary.publicReleaseAllowed, false);
  assert.equal(readiness.futureWaveDecision.status, "planned-gated");
  assert.equal(readiness.futureWaveDecision.activationApproved, false);
  assert.equal(readiness.futureWaveDecision.selectedCapability, null);
  assert.equal(readiness.externalGaps.compiledSwiftClaim, false);
  assert.equal(readiness.externalGaps.freshTaskReloadStatus, "recorded-local-fresh-task-evidence");
  assert.equal(readiness.externalGaps.freshTaskReloadEvidence.current, true);
  assert.equal(readiness.externalGaps.freshTaskReloadEvidence.taskThreadIdRecorded, true);
  assert.equal(readiness.externalGaps.freshTaskReloadEvidence.commandEvidencePassed, true);
  assert.deepEqual(readiness.externalGaps.freshTaskReloadEvidence.currentMarketplaceProjection, {
    current: true,
    publicCardCount: 34,
    canonicalCardCount: 1,
    bundleCardCount: 33,
    applicationBundleCardCount: 6,
    topicBundleCardCount: 27,
    retainedSourceCapabilityCount: 380,
    directSourceCapabilityCardCount: 0,
  });
  assert.deepEqual(readiness.externalGaps.freshTaskReloadEvidence.historicalPreConsolidationMarketplaceProjection, {
    current: false,
    immutableHistoricalEvidence: true,
    publicCardCount: 381,
  });
  assert.equal(readiness.externalGaps.nativeRuntimeClaim, false);
  assert.equal(readiness.externalGaps.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(readiness).includes(repositoryRoot), false);
});
