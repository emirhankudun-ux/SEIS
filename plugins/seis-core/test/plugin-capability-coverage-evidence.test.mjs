import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { APP_PLUGIN_EXPANSION_TARGET } from "../runtime/plugin-audit-definitions.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const evidencePath = path.join(repositoryRoot, "content/development/seis-plugin-capability-coverage.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-plugin-capability-coverage.mjs");

test("reconciles bounded public SEIS Repo capability coverage evidence", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  assert.equal(evidence.id, "seis-plugin-capability-coverage");
  assert.equal(evidence.goalId, "SEIS-GOAL-021");
  assert.equal(evidence.wave, 5);
  assert.equal(evidence.status, "ready-public-static-capability-coverage-evidence");
  assert.equal(evidence.plugin.marketplaceName, "seis-repo");
  assert.equal(evidence.plugin.marketplaceDisplayName, "SEIS Repo");
  assert.equal(evidence.plugin.marketplaceCategory, "Developer");
  assert.equal(evidence.plugin.publicMarketplace, true);
  assert.equal(evidence.marketplace.applicationPluginCount, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(evidence.marketplace.publicCardCount, APP_PLUGIN_EXPANSION_TARGET + 306);
  assert.equal(evidence.activation.selectedCapability, "seis-plugin-capability-coverage");
  assert.equal(evidence.activation.activationApproved, true);
  assert.equal(evidence.activation.implementationObserved, true);
  assert.equal(evidence.activation.publicReleaseApproved, false);
  assert.equal(evidence.audit.state, "ready");
  assert.equal(evidence.audit.ok, true);
  assert.equal(evidence.audit.classification, "bounded-declared-seis-plugin-capability-coverage");
  assert.equal(evidence.audit.sourcePluginCount, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(evidence.audit.catalogPluginCount, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(evidence.audit.matrixPluginCount, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(evidence.audit.marketplaceApplicationCardCount, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(evidence.audit.reconciliation.reconciled, true);
  assert.equal(evidence.audit.reconciliation.mismatchCount, 0);
  assert.ok(evidence.audit.declaredCategoryCount > 0);
  assert.ok(evidence.audit.declaredCapabilityTokenKindCount > 0);
  assert.equal(evidence.fixedRegistrySafetyCoverage.status, "ready-fixed-registry-safety-coverage");
  assert.equal(evidence.fixedRegistrySafetyCoverage.coveredFailureModes.length, 7);
  assert.deepEqual(evidence.safety.write, []);
  assert.deepEqual(evidence.safety.network, []);
  assert.deepEqual(evidence.safety.secrets, []);
  assert.equal(evidence.safety.readsPersonalMarketplace, false);
  assert.equal(evidence.safety.writesFiles, false);
  assert.equal(evidence.safety.usesNetwork, false);
  assert.equal(evidence.safety.installsPlugins, false);
  assert.equal(evidence.safety.invokesProviders, false);
  assert.equal(evidence.safety.publicReleaseAllowed, false);
  assert.equal(evidence.publicBoundary.personalMarketplaceRead, false);
  assert.equal(evidence.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(evidence.publicBoundary.network, false);
  assert.equal(evidence.publicBoundary.externalWrites, false);
  assert.equal(evidence.publicBoundary.secrets, false);
  assert.equal(evidence.publicBoundary.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(evidence).includes(repositoryRoot), false);
});
