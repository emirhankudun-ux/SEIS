#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const marketplace = "seis-repo";
const primaryInstallId = "seis-ai-agent@seis-repo";
const standaloneTargets = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"].map((name) => `${name}@${marketplace}`);
const includeStandaloneTargets = args.has("--with-lanes") && !args.has("--agent-only");
const targets = [primaryInstallId, ...(includeStandaloneTargets ? standaloneTargets : [])];

if (args.has("--help") || args.has("-h")) {
  console.log("Usage: node scripts/install-seis-ai-agent.mjs [--apply] [--check-only] [--with-lanes] [--agent-only]");
  process.exit(0);
}

const readiness = {
  repoRoot,
  platform: process.platform,
  nodeVersion: process.version,
  marketplaceExists: fs.existsSync(path.join(repoRoot, ".agents", "plugins", "marketplace.json")),
  codexAvailable: commandExists("codex"),
  primaryInstallId,
  standaloneTargets,
  includeStandaloneTargets,
  consolidationPolicy: "default installs only SEIS-Agent; standalone SEIS lane plugins remain repo-contained optional packages",
  targets,
};

if (args.has("--check-only")) {
  console.log(JSON.stringify(readiness, null, 2));
  process.exit(readiness.marketplaceExists ? 0 : 1);
}

if (!readiness.marketplaceExists) fail("repo marketplace is missing");
if (!args.has("--apply")) {
  console.log(JSON.stringify({
    mode: "plan-only",
    applyCommand: "npm run install:seis-ai-agent -- --apply",
    readiness,
    commands: [
      ["codex", "plugin", "marketplace", "add", repoRoot],
      ...targets.map((target) => ["codex", "plugin", "add", target])
    ]
  }, null, 2));
  process.exit(0);
}

if (!readiness.codexAvailable) fail("codex CLI is not available in PATH");
run("codex", ["plugin", "marketplace", "add", repoRoot]);
for (const target of targets) run("codex", ["plugin", "add", target]);
console.log("SEIS-AI Agent terminal install completed.");
console.log(`Installed targets: ${targets.join(", ")}`);
console.log("Start a new Codex thread to pick up refreshed skills and MCP tools.");
function commandExists(command) { return spawnSync(command, ["--version"], { stdio: "ignore", shell: process.platform === "win32" }).status === 0; }
function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { cwd: repoRoot, stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) fail(`${command} failed to start: ${result.error.message}`);
  if (result.status !== 0) fail(`${command} ${commandArgs.join(" ")} exited with ${result.status}`);
}
function fail(message) { console.error(`SEIS-AI Agent install failed: ${message}`); process.exit(1); }
