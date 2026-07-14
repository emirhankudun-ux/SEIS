#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const args = parseArgs(process.argv.slice(2));

  if (args.help) {
  console.log(`
Usage:
  node scripts/sync-seis-plugin-bundle.mjs [options]

Options:
  --source <repo-root>      Source repository root (default: process.cwd())
  --local <plugin-root>     Local plugin root (auto-detected)
  --clean                   Remove unknown target files before copy (default)
  --no-clean                Keep existing local target files that are not in source
  --dry-run                 Show planned operations without writing
  --help                    Show usage
`);
  process.exit(0);
}

const sourceRoot = resolvePath(args.source || ROOT);
const localRoot = resolveLocalPluginRoot(args.local, sourceRoot);
const sourcePluginRoot = path.join(sourceRoot, "plugins", "seis");
const cleanTarget = args.clean !== false;

if (!fs.existsSync(sourcePluginRoot) || !fs.statSync(sourcePluginRoot).isDirectory()) {
  console.error(`Source plugin root not found: ${sourcePluginRoot}`);
  process.exit(1);
}

if (path.resolve(localRoot) === path.resolve(sourcePluginRoot)) {
  console.error("Local plugin root must not be the same as source plugin root.");
  process.exit(1);
}

if (args["dry-run"]) {
  console.log(`Dry-run enabled. No files will be copied.`);
  console.log(`source: ${sourcePluginRoot}`);
  console.log(`local: ${localRoot}`);
  console.log(`clean: ${cleanTarget}`);
  process.exit(0);
}

if (cleanTarget) {
  fs.rmSync(localRoot, { recursive: true, force: true });
}

fs.mkdirSync(localRoot, { recursive: true });

fs.cpSync(sourcePluginRoot, localRoot, {
  recursive: true,
  force: true,
  preserveTimestamps: true,
  filter: (sourcePath) => !sourcePath.endsWith(".DS_Store"),
});

for (const targetPath of [
  path.join(localRoot, "scripts", "seis-mcp-bundle-audit.sh"),
  path.join(localRoot, "scripts", "seis-mcp-launcher.mjs"),
  path.join(localRoot, ".mcp.json"),
  path.join(localRoot, ".codex-plugin", "plugin.json"),
]) {
  if (fs.existsSync(targetPath)) {
    const mode = fs.statSync(targetPath).mode;
    fs.chmodSync(targetPath, mode | 0o111);
  }
}

console.log(`SEIS plugin bundle synced: ${sourcePluginRoot} -> ${localRoot}`);

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token?.startsWith("--")) {
      continue;
    }

    if (token === "--clean") {
      result.clean = true;
      continue;
    }

    if (token === "--no-clean") {
      result.clean = false;
      continue;
    }

    if (token === "--help") {
      result.help = true;
      continue;
    }

    if (token === "--dry-run") {
      result["dry-run"] = true;
      continue;
    }

    const value = argv[i + 1];
    if (value && !value.startsWith("--")) {
      result[token.replace(/^--/, "")] = value;
      i += 1;
      continue;
    }

    result[token.replace(/^--/, "")] = true;
  }

  return result;
}

function resolvePath(candidate) {
  return path.resolve(candidate);
}

function resolveLocalPluginRoot(explicit, sourceRoot) {
  if (explicit) {
    return resolvePath(explicit);
  }

  const explicitCandidates = [
    process.env.PLUGIN_ROOT,
    process.env.SEIS_PLUGIN_ROOT,
  ].filter(Boolean).map(resolvePath);

  const fallbackCandidates = [
    ...explicitCandidates,
    path.join(sourceRoot, "plugins", "seis"),
    path.join(process.cwd(), "plugins", "seis"),
    path.join(process.env.HOME || "", "Library", "Mobile Documents", "com~apple~CloudDocs", "Github", "SEIS", "SEIS", "plugins", "seis"),
    "/Users/emirhankudun/plugins/seis",
  ].filter(Boolean);

  for (const candidate of fallbackCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(sourceRoot, "plugins", "seis");
}
