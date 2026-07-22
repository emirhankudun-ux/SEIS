import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  SEIS_GENERAL_PLUGIN_TARGET,
  SEIS_INTERNAL_PACKAGE_TARGET,
  SEIS_PUBLIC_BUNDLE_SIZE,
  buildSeisPublicBundlePlan,
} from "../../../scripts/lib/seis-public-bundle-plan.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const family = readJson("content/development/seis-public-plugin-family.json");
const catalog = readJson("content/development/seis-public-plugin-bundle-catalog.json");
const marketplace = readJson(".agents/plugins/marketplace.json");
const guide = readJson("content/development/seis-public-plugin-selection-guide.json");
const agentGuide = readJson("plugins/seis-ai-agent/assets/public-bundle-selection-guide.json");

test("partitions 375 app and topic sources into 30 exact-once bounded internal packages", () => {
  const plan = buildSeisPublicBundlePlan({
    applicationPlugins: family.applicationPlugins,
    topicPlugins: family.topicPlugins,
  });
  assert.equal(plan.generalPlugins.length, SEIS_GENERAL_PLUGIN_TARGET);
  assert.equal(plan.internalPackages.length, SEIS_INTERNAL_PACKAGE_TARGET);
  assert.ok(plan.internalPackages.every((candidate) => candidate.memberCount > 0 && candidate.memberCount <= SEIS_PUBLIC_BUNDLE_SIZE));
  const members = plan.internalPackages.flatMap((candidate) => candidate.members);
  assert.equal(members.length, 375);
  assert.equal(new Set(members.map((member) => member.name)).size, 375);
  assert.equal(new Set(members.map((member) => member.sourcePath)).size, 375);
  assert.deepEqual(
    [...members.map((member) => member.name)].sort(),
    [...family.applicationPlugins, ...family.topicPlugins].map((plugin) => plugin.name).sort(),
  );
});

test("assigns exactly three uniquely owned internal packages to each general plugin", () => {
  const generalPlugins = family.generalPlugins;
  const internalPackages = family.internalPackages;
  assert.equal(generalPlugins.length, 10);
  assert.equal(internalPackages.length, 30);
  const assignedIds = generalPlugins.flatMap((plugin) => plugin.internalPackageIds);
  assert.equal(assignedIds.length, 30);
  assert.equal(new Set(assignedIds).size, 30);
  assert.deepEqual([...assignedIds].sort(), internalPackages.map((candidate) => candidate.id).sort());
  for (const plugin of generalPlugins) {
    assert.equal(plugin.internalPackageIds.length, 3, plugin.name);
    assert.equal(plugin.internalPackageCount, 3, plugin.name);
  }
  for (const candidate of internalPackages) {
    const owner = generalPlugins.find((plugin) => plugin.internalPackageIds.includes(candidate.id));
    assert.ok(owner, candidate.id);
    assert.equal(candidate.generalPlugin.name, owner.name, candidate.id);
  }
});

test("exposes ten general marketplace cards and zero internal package cards", () => {
  assert.equal(marketplace.plugins.length, 10);
  assert.equal(marketplace.plugins[0].name, "seis-ai-agent");
  assert.equal(new Set(marketplace.plugins.map((plugin) => plugin.name)).size, 10);
  assert.deepEqual(
    [...marketplace.plugins.map((plugin) => plugin.name)].sort(),
    family.generalPlugins.map((plugin) => plugin.name).sort(),
  );
  assert.ok(marketplace.plugins.every((plugin) => !plugin.source.path.startsWith("./plugins/seis-bundles/")));
  assert.equal(catalog.marketplace.publicCardCount, 10);
  assert.equal(catalog.marketplace.generalPluginCardCount, 10);
  assert.equal(catalog.marketplace.internalPackageCount, 30);
  assert.equal(catalog.marketplace.internalPackageCardCount, 0);
});

test("keeps the generated package and general-plugin directory sets closed", () => {
  const packageDirectories = directories("plugins/seis-bundles");
  const generalDirectories = directories("plugins/seis-general");
  assert.deepEqual(packageDirectories, family.internalPackages.map((candidate) => candidate.id).sort());
  assert.deepEqual(
    generalDirectories,
    family.generalPlugins.filter((plugin) => !plugin.canonical).map((plugin) => plugin.name).sort(),
  );
  assert.ok(packageDirectories.every((name) => name.startsWith("seis-internal-")));
});

test("publishes a bounded v2 guide for one general plugin per task", () => {
  assert.equal(guide.version, 2);
  assert.equal(guide.id, "seis-general-plugin-selection-guide");
  assert.equal(guide.marketplace.publicCardCount, 10);
  assert.equal(guide.marketplace.generalPluginCardCount, 10);
  assert.equal(guide.marketplace.internalPackageCount, 30);
  assert.equal(guide.marketplace.internalPackageCardCount, 0);
  assert.equal(guide.selectionBoundary.maximumGeneralPluginSelectionsPerTask, 1);
  assert.equal(guide.selectionBoundary.maximumInternalPackageSelectionsPerPlugin, 3);
  assert.equal(guide.selectionBoundary.bulkInstallAllowed, false);
  assert.equal(guide.selectionBoundary.internalPackagesAutoInstalled, false);
  assert.equal(guide.selectionBoundary.sourceMembersAutoInstalled, false);
  assert.equal(guide.starterPaths.length, 10);
  assert.equal(guide.journeys.length, 10);
  assert.deepEqual(agentGuide, guide);
  assert.ok(guide.journeys.every((journey) => journey.generalPlugin.internalPackageIds.length === 3));
});

test("keeps canonical and compatibility generators fresh", () => {
  for (const script of [
    "scripts/create-seis-general-plugin-distribution.mjs",
    "scripts/create-seis-public-plugin-family.mjs",
    "scripts/create-seis-public-plugin-bundles.mjs",
  ]) {
    const result = spawnSync(process.execPath, [path.join(repositoryRoot, script), "--check"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `${script}: ${result.stderr}`);
  }
  const contract = spawnSync(process.execPath, [path.join(repositoryRoot, "scripts/check-seis-general-plugin-distribution.mjs")], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(contract.status, 0, contract.stderr);
});

test("rejects a source capability duplicated across application and topic inputs", () => {
  const applicationPlugins = family.applicationPlugins.map((plugin) => ({ ...plugin }));
  const topicPlugins = family.topicPlugins.map((plugin) => ({ ...plugin }));
  topicPlugins[0] = {
    ...topicPlugins[0],
    name: applicationPlugins[0].name,
    sourcePath: applicationPlugins[0].sourcePath,
  };
  assert.throws(
    () => buildSeisPublicBundlePlan({ applicationPlugins, topicPlugins }),
    /coverage is not exact-once|assigned more than once/i,
  );
});

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8"));
}

function directories(relativePath) {
  return fs.readdirSync(path.join(repositoryRoot, relativePath), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
    .map((entry) => entry.name)
    .sort();
}
