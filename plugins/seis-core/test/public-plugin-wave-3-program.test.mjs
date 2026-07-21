import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const programPath = path.join(repositoryRoot, "content/development/seis-public-plugin-wave-3-program.json");
const generatorPath = path.join(repositoryRoot, "scripts/create-seis-public-plugin-wave-3-program.mjs");

test("keeps Wave 3 as a discovery-first public SEIS Repo plan without a preselected card", () => {
  const result = spawnSync(process.execPath, [generatorPath, "--check"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const program = JSON.parse(fs.readFileSync(programPath, "utf8"));
  assert.equal(program.status, "planned");
  assert.equal(program.maturity, "specification");
  assert.equal(program.wave.number, 3);
  assert.equal(program.steps.length, 100);
  assert.equal(program.progress.completedStepCount, 0);
  assert.equal(program.progress.plannedStepCount, 100);
  assert.equal(program.selection.status, "discovery-required");
  assert.equal(program.selection.selectedCapability, null);
  assert.equal(program.selection.additionalPublicCardAdded, false);
  assert.equal(program.publicBoundary.marketplaceName, "seis-repo");
  assert.equal(program.publicBoundary.marketplaceDisplayName, "SEIS Repo");
  assert.equal(program.publicBoundary.personalMarketplaceRead, false);
  assert.equal(program.publicBoundary.personalMarketplaceMutation, false);
  assert.equal(program.publicBoundary.network, false);
  assert.equal(program.publicBoundary.externalWrites, false);
  assert.equal(program.publicBoundary.secrets, false);
  assert.equal(program.publicBoundary.publicReleaseAllowed, false);
  assert.equal(JSON.stringify(program).includes(repositoryRoot), false);
});
