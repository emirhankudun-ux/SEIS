#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildApplicationPluginCatalog,
  createApplicationPluginActivationPlan,
  inspectApplicationPlugin,
} from "../runtime/plugin-catalog.mjs";
import {
  createApplicationPluginInstallPlan,
  readApplicationPluginSurface,
} from "../runtime/plugin-surface.mjs";

const binRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(binRoot, "../../..");
const args = process.argv.slice(2);
const command = args[0] || "list";
const jsonOutput = args.includes("--json");

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

try {
  const result = executeCommand();
  if (jsonOutput || result.forceJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result);
  }
  process.exit(result.ok === false ? 1 : 0);
} catch (error) {
  const result = { ok: false, command, error: error.message };
  if (jsonOutput) console.error(JSON.stringify(result, null, 2));
  else console.error(`SEIS Core plugin command failed: ${error.message}`);
  process.exit(1);
}

function executeCommand() {
  if (["list", "search"].includes(command)) {
    const query = option("--query") || (command === "search" ? args[1] : "");
    return buildApplicationPluginCatalog(repoRoot, {
      query,
      limit: option("--limit"),
      includeStatus: args.includes("--status"),
    });
  }

  if (command === "inspect") {
    const name = args[1];
    const plugin = inspectApplicationPlugin(repoRoot, name, { includeStatus: args.includes("--status") });
    if (!plugin) return { ok: false, command, plugin: name || null, error: "Application-owned plugin was not found." };
    return { ok: true, command, plugin };
  }

  if (command === "activation-plan") {
    const name = args[1];
    const action = option("--action") || "status";
    return { command, ...createApplicationPluginActivationPlan(repoRoot, name, action) };
  }

  if (command === "surface-status") {
    return { command, ...readApplicationPluginSurface(repoRoot, { includeCatalog: args.includes("--catalog"), includeStatus: args.includes("--status") }) };
  }

  if (command === "install-plan") {
    return { command, ...createApplicationPluginInstallPlan(repoRoot) };
  }

  return { ok: false, command, error: `Unknown command: ${command}. Use list, search, inspect, activation-plan, surface-status, or install-plan.` };
}

function printHuman(result) {
  if (result.command === "activation-plan") {
    console.log(`SEIS Core activation plan: ${result.plugin || "unknown"} / ${result.action}`);
    console.log(`Mode: ${result.mode}; executes: ${result.executes}; approval required: ${result.approvalRequired}.`);
    console.log(result.reason || result.error);
    return;
  }

  if (result.command === "inspect") {
    const plugin = result.plugin;
    console.log(`${plugin.displayName} (${plugin.name})`);
    console.log(`Release: ${plugin.release.label} / ${plugin.release.semver}; status: ${plugin.status.state}.`);
    console.log(`Source: ${plugin.sourcePath}; permissions: read=${plugin.permissions.read.length}, write=${plugin.permissions.write.length}, network=${plugin.permissions.network.length}, secrets=${plugin.permissions.secrets.length}.`);
    return;
  }

  if (result.command === "surface-status") {
    console.log(`SEIS Core direct repo surface: ${result.ok ? "ready" : "blocked"}.`);
    console.log(`Application: ${result.application}; source: ${result.sourceRoot}; plugins: ${result.counts.source}.`);
    console.log(`Release: ${result.release.label} / ${result.release.semver}; marketplace cards: ${result.counts.marketplaceEntries}.`);
    if (result.failures.length) console.log(`Failures: ${result.failures.join("; ")}`);
    return;
  }

  if (result.command === "install-plan") {
    console.log(`SEIS Core direct repo install plan: ${result.ok ? "ready" : "blocked"}.`);
    console.log(`Mode: ${result.mode}; executes: ${result.executes}; plugins: ${result.pluginCount}.`);
    console.log(result.reason);
    return;
  }

  console.log(`SEIS Core app plugin catalog: ${result.counts.returned}/${result.counts.discovered} returned at ${result.release.label}.`);
  console.log(`Contract valid: ${result.counts.contractValid}; status-ready: ${result.counts.statusReady}; mode: ${result.mode}.`);
  for (const plugin of result.plugins) {
    console.log(`- ${plugin.name}: ${plugin.status.state} / ${plugin.category} / ${plugin.release.semver}`);
  }
}

function option(name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value.`);
  return value;
}

function printHelp() {
  console.log(`seis-core-plugins — inspect plugins owned by the SEIS Command Center app

Usage:
  node plugins/seis-core/bin/seis-core-plugins.mjs list [--status] [--query term] [--limit 20] [--json]
  node plugins/seis-core/bin/seis-core-plugins.mjs search term [--status] [--limit 20] [--json]
  node plugins/seis-core/bin/seis-core-plugins.mjs inspect <plugin-name> [--status] [--json]
  node plugins/seis-core/bin/seis-core-plugins.mjs activation-plan <plugin-name> [--action status|inspect|run] [--json]
  node plugins/seis-core/bin/seis-core-plugins.mjs surface-status [--catalog] [--status] [--json]
  node plugins/seis-core/bin/seis-core-plugins.mjs install-plan [--json]

The app boundary is read-only by default. Status plans may be inspected; run,
write, network, and secret actions return an approval-required plan and never execute.
The direct repo surface never copies app-owned packages into packages/seis-ai or
creates separate marketplace cards.
`);
}
