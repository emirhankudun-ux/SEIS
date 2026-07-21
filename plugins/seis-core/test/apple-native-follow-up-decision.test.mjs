import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const decisionPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-2-follow-up-decision.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-2-follow-up-decision.mjs");

test("keeps the Apple-native follow-up decision evidence-based and non-duplicative", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const decision = JSON.parse(fs.readFileSync(decisionPath, "utf8"));
  assert.equal(decision.status, "completed-no-additional-public-plugin-selected");
  assert.equal(decision.decision.selectedCapability, null);
  assert.equal(decision.decision.outcome, "no-additional-public-plugin-selected");
  assert.equal(decision.swiftPmEvidence.packageGraph.externalDependencyCount, 0);
  assert.equal(decision.swiftPmEvidence.localToolingObservation.swiftTestCompletionClaim, "not-completed-and-not-claimed");
  assert.equal(decision.swiftPmEvidence.validationBoundary.testPassClaim, false);
  assert.equal(decision.publicDistribution.marketplaceName, "seis-repo");
  assert.equal(decision.publicDistribution.applicationPluginCount, 74);
  assert.equal(decision.publicDistribution.publicCardCount, 380);
  assert.equal(decision.publicDistribution.additionalCardAdded, false);
  assert.equal(decision.publicDistribution.personalMarketplaceRead, false);
  assert.equal(decision.publicDistribution.personalMarketplaceMutation, false);
  assert.equal(decision.publicDistribution.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(decision).includes(repositoryRoot), false);
});
