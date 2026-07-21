import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const handoffPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-2-handoff.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-2-handoff.mjs");

test("keeps the Wave 2 handoff public-only, evidence-led, and explicit about native limits", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const handoff = JSON.parse(fs.readFileSync(handoffPath, "utf8"));
  assert.equal(handoff.status, "completed-repository-local-handoff");
  assert.equal(handoff.program.completedStepCount, 100);
  assert.equal(handoff.program.completedRoundCount, 5);
  assert.equal(handoff.program.selectedCapability, "seis-apple-native-readiness");
  assert.equal(handoff.marketplace.name, "seis-repo");
  assert.equal(handoff.marketplace.displayName, "SEIS Repo");
  assert.equal(handoff.marketplace.applicationPluginCount, 72);
  assert.equal(handoff.marketplace.publicCardCount, 378);
  assert.equal(handoff.publicBoundary.personalMarketplaceRead, false);
  assert.equal(handoff.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(handoff.publicBoundary.network, false);
  assert.equal(handoff.publicBoundary.externalWrites, false);
  assert.equal(handoff.publicBoundary.secrets, false);
  assert.equal(handoff.publicBoundary.publicReleaseAllowed, false);
  assert.equal(handoff.nativeValidationBoundary.swiftTestCompletionClaim, "not-completed-and-not-claimed");
  assert.equal(handoff.nativeValidationBoundary.testPassClaim, false);
  assert.equal(handoff.releaseReadiness.promoted, false);
  assert.equal(handoff.nextWave.number, 3);
  assert.equal(handoff.nextWave.status, "planned");
  assert.equal(handoff.nextWave.selectionStatus, "discovery-required");
  assert.equal(handoff.nextWave.selectedCapability, null);
  assert.equal(JSON.stringify(handoff).includes(repositoryRoot), false);
});
