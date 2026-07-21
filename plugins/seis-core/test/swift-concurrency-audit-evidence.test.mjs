import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const evidencePath = path.join(repositoryRoot, "content/development/seis-swift-concurrency-audit.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-swift-concurrency-audit.mjs");

test("reconciles bounded Swift concurrency evidence with the public SEIS Repo contract", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  assert.equal(evidence.id, "seis-swift-concurrency-audit");
  assert.equal(evidence.goalId, "SEIS-GOAL-021");
  assert.equal(evidence.status, "attention-public-static-concurrency-evidence");
  assert.equal(evidence.plugin.marketplaceName, "seis-repo");
  assert.equal(evidence.plugin.marketplaceDisplayName, "SEIS Repo");
  assert.equal(evidence.plugin.publicAudience, "everyone");
  assert.equal(evidence.plugin.publicMarketplace, true);
  assert.equal(evidence.marketplace.applicationPluginCount, 73);
  assert.equal(evidence.marketplace.publicCardCount, 379);
  assert.equal(evidence.decision.selectedCapability, "seis-swift-concurrency-audit");
  assert.equal(evidence.decision.implementationStarted, true);
  assert.equal(evidence.decision.additionalPublicCardAdded, true);
  assert.equal(evidence.audit.state, "attention");
  assert.equal(evidence.audit.ok, true);
  assert.equal(evidence.audit.classification, "bounded-static-concurrency-signals-only");
  assert.equal(evidence.audit.blockingFindingCount, 0);
  assert.ok(evidence.audit.scannedSwiftFileCount > 0);
  assert.ok(evidence.audit.findingCodes.includes("unchecked-sendable-review-required"));
  assert.equal(evidence.safety.write.length, 0);
  assert.equal(evidence.safety.network.length, 0);
  assert.equal(evidence.safety.secrets.length, 0);
  assert.equal(evidence.safety.compilesSwift, false);
  assert.equal(evidence.safety.runsSwiftTests, false);
  assert.equal(evidence.safety.startsNativeApplication, false);
  assert.equal(evidence.safety.publicReleaseAllowed, false);
  assert.equal(evidence.inputSafety.credentialAssignmentFindingCount, 0);
  assert.equal(evidence.inputSafety.rawSourceReturned, false);
  assert.equal(evidence.inputSafety.rawMatchedValuesReturned, false);
  assert.equal(evidence.inputSafety.sourceFilesCompiled, false);
  assert.equal(evidence.publicBoundary.personalMarketplaceRead, false);
  assert.equal(evidence.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(evidence.publicBoundary.network, false);
  assert.equal(evidence.publicBoundary.externalWrites, false);
  assert.equal(evidence.publicBoundary.secrets, false);
  assert.equal(evidence.publicBoundary.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(evidence).includes(repositoryRoot), false);
});
