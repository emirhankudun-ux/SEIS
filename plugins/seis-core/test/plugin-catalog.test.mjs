import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildApplicationPluginCatalog,
  createApplicationPluginActivationPlan,
  inspectApplicationPlugin,
  searchApplicationPlugins,
} from "../runtime/plugin-catalog.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const cliPath = path.join(pluginRoot, "bin", "seis-core-plugins.mjs");
const releaseTrain = JSON.parse(readFileSync(path.join(repoRoot, "content/development/seis-core-plugin-release-train.json"), "utf8"));

test("application catalog is sourced from exactly 50 SEIS Core plugins", () => {
  const catalog = buildApplicationPluginCatalog(repoRoot);
  assert.equal(catalog.application, "apps/seis-core");
  assert.equal(catalog.sourceRoot, "plugins/seis-core");
  assert.equal(catalog.counts.discovered, 50);
  assert.equal(catalog.counts.returned, 50);
  assert.equal(catalog.counts.contractValid, 50);
  assert.equal(catalog.policy.sourceMutation, false);
  assert.deepEqual(catalog.policy.allowedInspectionActions, ["inspect", "status"]);
  assert.ok(catalog.plugins.every((plugin) => plugin.sourcePath.startsWith("plugins/seis-core/")));
});

test("catalog search and inspection expose app-owned plugin metadata", () => {
  const matches = searchApplicationPlugins(repoRoot, "release", { limit: 10 });
  assert.ok(matches.counts.returned >= 2);
  assert.ok(matches.plugins.some((plugin) => plugin.name === "seis-release-cadence"));

  const plugin = inspectApplicationPlugin(repoRoot, "seis-release-cadence");
  assert.equal(plugin.release.label, releaseTrain.currentRelease.label);
  assert.equal(plugin.status.state, "not-checked");
  assert.equal(plugin.activation.status.ok, true);
  assert.equal(plugin.activation.status.executes, false);
  assert.equal(plugin.activation.run.ok, false);
  assert.equal(plugin.activation.run.mode, "approval-required");
});

test("status mode executes only the bounded local status contract", () => {
  const catalog = buildApplicationPluginCatalog(repoRoot, { includeStatus: true, limit: 50 });
  assert.equal(catalog.counts.statusReady, 50);
  assert.ok(catalog.plugins.every((plugin) => plugin.status.execution === "status-only"));
  assert.ok(catalog.plugins.every((plugin) => plugin.permissions.write.length === 0));
  assert.ok(catalog.plugins.every((plugin) => plugin.permissions.network.length === 0));
  assert.ok(catalog.plugins.every((plugin) => plugin.permissions.secrets.length === 0));
});

test("activation plans deny non-read-only actions without executing them", () => {
  const statusPlan = createApplicationPluginActivationPlan(repoRoot, "seis-release-readiness", "status");
  assert.equal(statusPlan.ok, true);
  assert.equal(statusPlan.executes, false);
  assert.deepEqual(statusPlan.command.slice(1), ["--status"]);

  const runPlan = createApplicationPluginActivationPlan(repoRoot, "seis-release-readiness", "run");
  assert.equal(runPlan.ok, false);
  assert.equal(runPlan.approvalRequired, true);
  assert.equal(runPlan.executes, false);
});

test("CLI search returns the application catalog without invoking the core package source boundary", () => {
  const output = execFileSync(process.execPath, [cliPath, "search", "release", "--limit", "3", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { PATH: process.env.PATH || "", LANG: "C", TZ: "UTC" },
  });
  const result = JSON.parse(output);
  assert.equal(result.sourceRoot, "plugins/seis-core");
  assert.equal(result.counts.returned, 3);
  assert.ok(result.plugins.every((plugin) => plugin.sourcePath.startsWith("plugins/seis-core/")));
});
