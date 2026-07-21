import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const decisionPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-capability-decision.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-capability-decision.mjs");

test("records the bounded non-duplicative Wave 3 concurrency package and SEIS Repo card", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const decision = JSON.parse(fs.readFileSync(decisionPath, "utf8"));
  assert.equal(decision.status, "approved-public-local-implementation");
  assert.equal(decision.decision.selectedCapability, "seis-swift-concurrency-audit");
  assert.equal(decision.decision.implementationStarted, true);
  assert.equal(decision.decision.additionalPublicCardAdded, true);
  assert.equal(decision.implementation.packageExists, true);
  assert.equal(decision.implementation.publicCardExists, true);
  assert.equal(decision.implementation.sourcePath, "plugins/seis-core/seis-swift-concurrency-audit");
  assert.equal(decision.implementation.marketplaceSourcePath, "./plugins/seis-core/seis-swift-concurrency-audit");
  assert.equal(decision.preconditions.wave2HandoffStatus, "completed-repository-local-handoff");
  assert.equal(decision.preconditions.wave3ProgramStatus, "in-progress");
  assert.equal(decision.preconditions.wave3ProgramSelectionStatus, "implementation-approved");
  assert.equal(decision.preconditions.wave3ProgramSelectedCapability, "seis-swift-concurrency-audit");
  assert.equal(decision.publicDistribution.marketplaceName, "seis-repo");
  assert.equal(decision.publicDistribution.marketplaceDisplayName, "SEIS Repo");
  assert.equal(decision.publicDistribution.applicationPluginCount, 74);
  assert.equal(decision.publicDistribution.publicCardCount, 380);
  assert.equal(decision.publicDistribution.additionalPublicCardAdded, true);
  assert.equal(decision.publicDistribution.personalMarketplaceRead, false);
  assert.equal(decision.publicDistribution.personalMarketplaceMutation, false);
  assert.equal(decision.publicDistribution.network, false);
  assert.equal(decision.publicDistribution.externalWrites, false);
  assert.equal(decision.publicDistribution.secrets, false);
  assert.equal(decision.publicDistribution.publicReleaseAllowed, false);
  assert.equal(decision.staticEvidence.classification, "bounded-static-concurrency-signals-only");
  assert.ok(decision.staticEvidence.scannedSwiftFileCount > 0);
  assert.equal(decision.staticEvidence.scannedSwiftFileCount, decision.staticEvidence.discoveredSwiftFileCount);
  assert.equal(decision.staticEvidence.symlinkCount, 0);
  assert.equal(decision.staticEvidence.credentialAssignmentFindingCount, 0);
  assert.equal(decision.staticEvidence.rawSourceReturned, false);
  assert.equal(decision.staticEvidence.sourceFilesCompiled, false);
  assert.ok(decision.staticEvidence.signals.uncheckedSendable.count > 0);
  assert.ok(decision.staticEvidence.signals.sendableDeclaration.count > 0);
  assert.equal(decision.publicBoundary.compilerInvoked, false);
  assert.equal(decision.publicBoundary.nativeRuntimeStarted, false);
  assert.equal(JSON.stringify(decision).includes(repositoryRoot), false);
});
