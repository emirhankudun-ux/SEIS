import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const checkerPath = path.join(repositoryRoot, "scripts/check-seis-public-plugin-install-smoke.mjs");

test("validates the curated topology while smoking only the canonical install by default", (context) => {
  const cacheRoot = temporaryCache(context);
  const result = runChecker([], cacheRoot);
  assert.equal(result.status, 0, result.stderr);
  const report = parseReport(result.stdout);

  assert.equal(report.ok, true);
  assert.equal(report.publicPluginCount, 1);
  assert.equal(report.marketplaceCardCount, 34);
  assert.equal(report.canonicalCardCount, 1);
  assert.equal(report.bundleCardCount, 33);
  assert.equal(report.applicationBundleCardCount, 6);
  assert.equal(report.topicBundleCardCount, 27);
  assert.equal(report.repoMarketplaceEntryCount, 34);
  assert.deepEqual(report.sourceCapabilities, {
    retainedCount: 380,
    rootSourceModuleCount: 5,
    applicationSourcePackageCount: 75,
    topicSourcePackageCount: 300,
    bundledApplicationAndTopicMemberCount: 375,
    bundledApplicationAndTopicExactOnce: true,
    maximumBundleMemberCount: 15,
    directMarketplaceCardCount: 0,
  });
  assert.deepEqual(report.smokeTargets, ["seis-ai-agent@seis-repo"]);
  assert.equal(report.smokeTargetCount, 1);
  assert.equal(report.plugins.length, 1);
  assert.equal(report.plugins[0].name, "seis-ai-agent");
  assert.equal(report.bundleSelection.selectedId, null);
  assert.equal(report.bundleSelection.explicit, false);
  assert.deepEqual(report.installer.targets, ["seis-ai-agent@seis-repo"]);
});

test("adds one explicitly selected optional bundle to installed-cache and MCP smoke", (context) => {
  const cacheRoot = temporaryCache(context);
  installCachePlugin(cacheRoot, "seis-ai-agent", "plugins/seis-ai-agent");
  installCachePlugin(cacheRoot, "seis-application-bundle-04", "plugins/seis-bundles/seis-application-bundle-04");

  const result = runChecker([
    "--bundle",
    "seis-application-bundle-04",
    "--require-installed",
    "--mcp-smoke",
  ], cacheRoot);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = parseReport(result.stdout);

  assert.equal(report.ok, true);
  assert.equal(report.bundleSelection.requestedId, "seis-application-bundle-04");
  assert.equal(report.bundleSelection.selectedId, "seis-application-bundle-04");
  assert.equal(report.bundleSelection.explicit, true);
  assert.equal(report.bundleSelection.defaultInstall, false);
  assert.equal(report.bundleSelection.bundleMembersAutoInstalled, false);
  assert.deepEqual(report.smokeTargets, [
    "seis-ai-agent@seis-repo",
    "seis-application-bundle-04@seis-repo",
  ]);
  assert.equal(report.smokeTargetCount, 2);
  assert.equal(report.installedCount, 2);
  assert.equal(report.currentInstalledCount, 2);
  assert.equal(report.mcpSmokePassed, true);
  assert.deepEqual(report.mcpSmoke.map((smoke) => smoke.name), [
    "seis-ai-agent",
    "seis-application-bundle-04",
  ]);
  assert.ok(report.mcpSmoke.every((smoke) => smoke.ok));
});

test("rejects a retained source id because it is not a direct marketplace bundle card", (context) => {
  const result = runChecker(["--bundle=seis-a11y-regression"], temporaryCache(context));
  assert.equal(result.status, 1);
  const report = parseReport(result.stdout);
  assert.equal(report.ok, false);
  assert.equal(report.bundleSelection.requestedId, "seis-a11y-regression");
  assert.equal(report.bundleSelection.selectedId, null);
  assert.ok(report.failures.includes("unknown optional bundle selection: seis-a11y-regression"));
});

function temporaryCache(context) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "seis-install-smoke-"));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function installCachePlugin(cacheRoot, name, sourcePath) {
  const sourceRoot = path.join(repositoryRoot, sourcePath);
  const manifest = JSON.parse(fs.readFileSync(path.join(sourceRoot, ".codex-plugin/plugin.json"), "utf8"));
  const installedRoot = path.join(cacheRoot, "seis-repo", name, manifest.version);
  fs.mkdirSync(path.dirname(installedRoot), { recursive: true });
  fs.cpSync(sourceRoot, installedRoot, { recursive: true });
}

function runChecker(args, cacheRoot) {
  return spawnSync(process.execPath, [checkerPath, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    timeout: 30000,
    env: {
      ...process.env,
      SEIS_CODEX_PLUGIN_CACHE_ROOT: cacheRoot,
    },
  });
}

function parseReport(output) {
  return JSON.parse(String(output || ""));
}
