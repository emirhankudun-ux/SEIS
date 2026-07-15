import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  APP_PLUGIN_SOURCE_ROOT,
  discoverApplicationPlugins,
  readCurrentRelease,
  validatePluginContract,
} from "../runtime/plugin-contract.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");

test("SEIS Core owns exactly 50 local plugins inside plugins/seis-core", () => {
  const plugins = discoverApplicationPlugins(repoRoot);
  assert.equal(plugins.length, 50);
  assert.ok(plugins.every((plugin) => plugin.root.startsWith(path.join(repoRoot, APP_PLUGIN_SOURCE_ROOT))));
  assert.ok(plugins.every((plugin) => validatePluginContract(plugin, readCurrentRelease(repoRoot)).length === 0));
});

test("all personal plugin profiles remain deny-by-default", () => {
  const plugins = discoverApplicationPlugins(repoRoot);
  for (const plugin of plugins) {
    assert.deepEqual(plugin.profile.permissions.write, []);
    assert.deepEqual(plugin.profile.permissions.network, []);
    assert.deepEqual(plugin.profile.permissions.secrets, []);
    assert.equal(plugin.profile.implementationState, "functional-local-demo");
  }
});

test("status matrix is deterministic and does not mutate plugin sources", () => {
  const before = new Map(discoverApplicationPlugins(repoRoot).map((plugin) => [plugin.name, fs.statSync(plugin.manifestPath).mtimeMs]));
  const output = execFileSync(process.execPath, [path.join(pluginRoot, "scripts", "run-plugin-matrix.mjs"), "--json", "--strict"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { PATH: process.env.PATH || "", LANG: "C", TZ: "UTC" },
    maxBuffer: 1024 * 1024,
  });
  const matrix = JSON.parse(output);
  assert.equal(matrix.sourceRoot, APP_PLUGIN_SOURCE_ROOT);
  assert.equal(matrix.pluginCount, 50);
  assert.equal(matrix.failureCount, 0);
  for (const plugin of discoverApplicationPlugins(repoRoot)) {
    assert.equal(fs.statSync(plugin.manifestPath).mtimeMs, before.get(plugin.name));
  }
});
