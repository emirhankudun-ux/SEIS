import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  APP_PLUGIN_EXPANSION_TARGET,
} from "../runtime/plugin-audit-definitions.mjs";
import {
  buildApplicationPluginCatalog,
  createApplicationPluginActivationPlan,
  inspectApplicationPlugin,
  searchApplicationPlugins,
} from "../runtime/plugin-catalog.mjs";
import {
  createApplicationPluginInstallPlan,
  readApplicationPluginSurface,
} from "../runtime/plugin-surface.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");
const cliPath = path.join(pluginRoot, "bin", "seis-core-plugins.mjs");
const releaseTrain = JSON.parse(readFileSync(path.join(repoRoot, "content/development/seis-core-plugin-release-train.json"), "utf8"));

test("application catalog is sourced from the complete SEIS Core plugin expansion", () => {
  const catalog = buildApplicationPluginCatalog(repoRoot);
  assert.equal(catalog.application, "apps/seis-core");
  assert.equal(catalog.sourceRoot, "plugins/seis-core");
  assert.equal(catalog.distribution.repository, "SEIS");
  assert.equal(catalog.distribution.sourceAvailableInRepository, true);
  assert.equal(catalog.distribution.publicRepositoryAvailable, true);
  assert.equal(catalog.distribution.publicAudience, "everyone");
  assert.equal(catalog.distribution.distributionScope, "direct-repository-source");
  assert.equal(catalog.distribution.sourceManifest, "apps/seis-core/data/seis-core-plugin-sources.json");
  assert.equal(catalog.distribution.installSurface, "repo-source-app");
  assert.equal(catalog.distribution.marketplaceName, "seis-repo");
  assert.equal(catalog.distribution.publicMarketplace, true);
  assert.equal(catalog.distribution.marketplaceEntryCount, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(catalog.distribution.coreSourceOwner, false);
  assert.equal(catalog.counts.discovered, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(catalog.counts.returned, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(catalog.counts.contractValid, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(catalog.policy.sourceMutation, false);
  assert.deepEqual(catalog.policy.allowedInspectionActions, ["inspect", "status"]);
  assert.deepEqual(catalog.policy.allowedReportActions, ["report"]);
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

  const auditPlugin = inspectApplicationPlugin(repoRoot, "seis-approval-gate-review");
  assert.equal(auditPlugin.audit.mode, "read-only-report");
  assert.equal(auditPlugin.activation.report.ok, true);
  assert.deepEqual(auditPlugin.activation.report.command.slice(1), ["--report"]);
  const statusOnlyReport = inspectApplicationPlugin(repoRoot, "seis-release-readiness");
  assert.equal(statusOnlyReport.activation.report.ok, false);
  assert.equal(statusOnlyReport.activation.report.approvalRequired, true);
});

test("status mode executes only the bounded local status contract", () => {
  const catalog = buildApplicationPluginCatalog(repoRoot, { includeStatus: true, limit: APP_PLUGIN_EXPANSION_TARGET });
  assert.equal(catalog.counts.statusOk, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(catalog.counts.statusReady + catalog.counts.statusAttention, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(catalog.counts.statusFailed, 0);
  assert.equal(catalog.counts.statusNotChecked, 0);
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

test("direct repository surface covers the app source, catalog, and unified suite", () => {
  const surface = readApplicationPluginSurface(repoRoot);
  assert.equal(surface.ok, true);
  assert.equal(surface.repository, "SEIS");
  assert.equal(surface.application, "apps/seis-core");
  assert.equal(surface.installSurface, "repo-source-app");
  assert.equal(surface.policy.publicRepositoryAvailable, true);
  assert.equal(surface.policy.publicAudience, "everyone");
  assert.equal(surface.counts.source, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(surface.counts.catalog, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(surface.counts.unifiedSuite, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(surface.counts.marketplaceEntries, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(surface.policy.marketplaceName, "seis-repo");
  assert.equal(surface.policy.publicMarketplace, true);
  assert.equal(surface.policy.coreSourceOwner, false);
  assert.deepEqual(surface.failures, []);
});

test("direct repository install plan is non-mutating and validates all app sources", () => {
  const plan = createApplicationPluginInstallPlan(repoRoot);
  assert.equal(plan.ok, true);
  assert.equal(plan.mode, "repo-source-plan");
  assert.equal(plan.executes, false);
  assert.equal(plan.approvalRequired, false);
  assert.equal(plan.pluginCount, APP_PLUGIN_EXPANSION_TARGET);
  assert.ok(plan.commands.includes("npm run check:seis-core-requested-plugin-coverage"));
  assert.ok(plan.commands.includes("npm run check:seis-core-plugin-sources"));
  assert.ok(plan.reason.includes("public MIT-licensed"));
  assert.ok(plan.reason.includes("packages/seis-ai"));
});

test("CLI exposes direct repository surface and install plan", () => {
  const surfaceOutput = execFileSync(process.execPath, [cliPath, "surface-status", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { PATH: process.env.PATH || "", LANG: "C", TZ: "UTC" },
  });
  const surface = JSON.parse(surfaceOutput);
  assert.equal(surface.command, "surface-status");
  assert.equal(surface.ok, true);
  assert.equal(surface.counts.source, APP_PLUGIN_EXPANSION_TARGET);
  const planOutput = execFileSync(process.execPath, [cliPath, "install-plan", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { PATH: process.env.PATH || "", LANG: "C", TZ: "UTC" },
  });
  const plan = JSON.parse(planOutput);
  assert.equal(plan.command, "install-plan");
  assert.equal(plan.executes, false);
  assert.equal(plan.pluginCount, APP_PLUGIN_EXPANSION_TARGET);
});
