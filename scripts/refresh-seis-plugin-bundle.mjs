#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();

const args = parseArgs(process.argv.slice(2));

  if (args.help) {
  console.log(`
Usage:
  node scripts/refresh-seis-plugin-bundle.mjs [options]

Options:
  --source <repo-root>      Source repository root (default: process.cwd())
  --local <plugin-root>     Local plugin root (auto-detected)
  --marketplace <market>    Plugin marketplace namespace (default: personal)
  --plugin <name>           Plugin name for install command (default: seis)
  --install                 Run "codex plugin add <plugin>@<marketplace>" after sync/check
  --check-only              Run check without syncing or reinstall
  --no-sync                 Skip sync step
  --check                   Force check step (default)
  --no-check                Skip check step
  --strict                  Run check in strict mode
  --no-cachebuster           Skip cachebuster regeneration
  --help                    Show usage
`);
  process.exit(0);
}

const sourceRoot = resolvePath(args.source || ROOT);
const localRoot = resolveLocalPluginRoot(args.local);
const marketplace = args.marketplace || "personal";
const plugin = args.plugin || "seis";

const doSync = !Boolean(args["check-only"]) && args["no-sync"] !== true;
const doCheck = Boolean(args.check) || args["no-check"] !== true;
const doInstall = Boolean(args.install) && !Boolean(args["check-only"]);
const doCacheBuster = !Boolean(args["check-only"]) && args["no-cachebuster"] !== true;
const strict = Boolean(args.strict);
const errors = [];

const samePath = path.resolve(localRoot) === path.resolve(path.join(sourceRoot, "plugins", "seis"));
const runSync = doSync && !samePath;

if (args["check-only"]) {
  console.log("Running preflight check only.");
} else if (samePath) {
  console.log("Local plugin root matches source plugin root; skipping sync to avoid self-copy.");
} else if (runSync) {
  console.log("Syncing plugin bundle: repo -> local plugin");
  runNodeSync(["scripts/sync-seis-plugin-bundle.mjs", "--source", sourceRoot, "--local", localRoot]);
}

if (doCheck) {
  const checkArgs = ["scripts/check-seis-plugin-bundle.mjs", "--source", sourceRoot, "--local", localRoot];
  if (strict) {
    checkArgs.push("--strict");
  }
  runNodeSync(checkArgs.filter(Boolean));
}

if (doCacheBuster) {
  runCachebuster(localRoot);
}

if (doInstall) {
  const installTarget = `${plugin}@${marketplace}`;
  const installResult = spawnSync("codex", ["plugin", "add", installTarget], { stdio: "inherit", encoding: "utf8" });
  if (installResult.error) {
    fail("Install failed: 'codex' command not found. Install Codex plugin runtime or set command in PATH.");
  }
  if (installResult.status !== 0) {
    fail(`Plugin install failed with code ${installResult.status}.`);
  }
}

if (errors.length > 0) {
  console.error("SEIS plugin bundle refresh failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("SEIS plugin bundle refresh completed.");

function runNodeSync(argsList) {
  const result = spawnSync(process.execPath, argsList, {
    stdio: "inherit",
    cwd: ROOT,
    encoding: "utf8",
  });

  if (result.error) {
    fail(`Command failed to start: ${result.error.message}`);
    return;
  }

  if (result.status !== 0) {
    fail(`Command exited with status ${result.status}: node ${argsList.join(" ")}`);
  }
}

function runCachebuster(pluginRoot) {
  const scriptPath = "/Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/update_plugin_cachebuster.py";
  if (!fs.existsSync(scriptPath)) {
    console.log(`[skip] cachebuster script not found: ${scriptPath}`);
    return;
  }

  const scriptDir = path.dirname(pluginRoot);
  const result = spawnSync("python3", [scriptPath, pluginRoot], {
    stdio: "inherit",
    cwd: scriptDir,
    encoding: "utf8",
  });

  if (result.error) {
    fail(`Cachebuster script failed to start: ${result.error.message}`);
    return;
  }

  if (result.status !== 0) {
    fail(`Cachebuster script failed with status ${result.status}`);
  }
}

function fail(message) {
  errors.push(message);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token?.startsWith("--")) {
      continue;
    }

    if (["--help", "--install", "--check-only", "--no-sync", "--strict", "--no-cachebuster", "--check", "--no-check"].includes(token)) {
      out[token.replace(/^--/, "")] = true;
      continue;
    }

    const value = argv[i + 1];
    if (value && !value.startsWith("--")) {
      out[token.replace(/^--/, "")] = value;
      i += 1;
    } else {
      out[token.replace(/^--/, "")] = true;
    }
  }

  return out;
}

function resolvePath(candidate) {
  return path.resolve(candidate);
}

function resolveLocalPluginRoot(explicit) {
  if (explicit) {
    return resolvePath(explicit);
  }

  const explicitCandidates = [
    process.env.PLUGIN_ROOT,
    process.env.SEIS_PLUGIN_ROOT,
  ].filter(Boolean).map(resolvePath);

  const fallbackCandidates = [
    ...explicitCandidates,
    "/Users/emirhankudun/plugins/seis",
    path.join(process.env.HOME || "", "Library", "Mobile Documents", "com~apple~CloudDocs", "Github", "SEIS", "SEIS", "plugins", "seis"),
    path.join(process.cwd(), "plugins", "seis"),
  ].filter(Boolean);

  for (const candidate of fallbackCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return resolvePath("/Users/emirhankudun/plugins/seis");
}
