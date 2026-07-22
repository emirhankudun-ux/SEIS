#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const requireInstalled = process.argv.includes("--require-installed");
const mcpSmoke = process.argv.includes("--mcp-smoke");
const failures = [];
const checks = [];

runCheck("distribution", ["scripts/check-seis-general-plugin-distribution.mjs"]);
const defaultPlan = runJson("installer canonical plan", ["scripts/install-seis-general-plugin.mjs", "--check-only"]);
const cloudPlan = runJson("installer selected plan", ["scripts/install-seis-general-plugin.mjs", "--general-plugin", "cloud-devsecops"]);
const finder = runJson("installer finder", ["scripts/install-seis-general-plugin.mjs", "--find", "frontend accessibility design"]);
ensure(defaultPlan?.selectedGeneralPlugin?.installId === "seis-ai-agent@seis-repo", "canonical installer plan must target SEIS-Agent");
ensure(defaultPlan?.selectionBoundary?.maximumGeneralPluginSelectionsPerTask === 1, "installer must enforce one general plugin per task");
ensure(defaultPlan?.selectionBoundary?.internalPackagesAutoInstalled === false && defaultPlan?.selectionBoundary?.sourceMembersAutoInstalled === false, "installer must not auto-install internal packages or members");
ensure(cloudPlan?.selectedGeneralPlugin?.installId === "seis-general-cloud-devsecops@seis-repo" && cloudPlan?.selectedGeneralPlugin?.internalPackageCount === 3, "selected plan must target exactly one reviewed general plugin");
ensure(Array.isArray(finder?.candidates) && finder.candidates.length > 0 && finder.candidates.length <= 3 && finder.installationPerformed === false, "finder must return at most three plan-only candidates");
if (requireInstalled) validateLocalInstallState();
if (mcpSmoke) {
  const output = runJson("MCP smoke", ["plugins/seis-ai-agent/scripts/seis-general-plugin-mcp-server.mjs", "--smoke"]);
  ensure(output?.status === "ok" && output?.generalPluginCount === 10 && output?.internalPackageCount === 30 && output?.writeAccess === false && output?.networkAccess === false, "MCP smoke must expose the read-only ten/30 contract");
}

const report = {
  status: failures.length ? "failed" : "passed",
  requireInstalled,
  mcpSmoke,
  marketplaceCardCount: 10,
  generalPluginCardCount: 10,
  internalPackageCount: 30,
  maximumPackageSize: 15,
  checks,
  failures,
};
if (failures.length) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(report, null, 2));

function runCheck(label, commandArgs) {
  const result = spawnSync(process.execPath, commandArgs, { cwd: root, encoding: "utf8" });
  checks.push({ label, status: result.status, stdout: result.stdout.trim() });
  if (result.status !== 0) failures.push(`${label} failed: ${result.stderr.trim() || result.stdout.trim()}`);
}

function runJson(label, commandArgs) {
  const result = spawnSync(process.execPath, commandArgs, { cwd: root, encoding: "utf8" });
  checks.push({ label, status: result.status });
  if (result.status !== 0) {
    failures.push(`${label} failed: ${result.stderr.trim() || result.stdout.trim()}`);
    return null;
  }
  try { return JSON.parse(result.stdout); } catch { failures.push(`${label} did not return JSON`); return null; }
}

function validateLocalInstallState() {
  const configPath = path.join(os.homedir(), ".agents", "plugins", "marketplace.json");
  if (!fs.existsSync(configPath)) {
    failures.push("local installed-state check requested but the Codex marketplace config is unavailable");
    return;
  }
  let config;
  try { config = JSON.parse(fs.readFileSync(configPath, "utf8")); } catch { failures.push("local installed-state config is invalid"); return; }
  const text = JSON.stringify(config);
  ensure(text.includes("seis-ai-agent@seis-repo") || text.includes("seis-general-"), "local installed-state config does not include a SEIS general plugin reference");
}

function ensure(condition, message) { if (!condition) failures.push(message); }
