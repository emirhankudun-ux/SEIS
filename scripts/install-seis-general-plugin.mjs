#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const marketplaceName = "seis-repo";
const guide = readJson("content/development/seis-public-plugin-selection-guide.json");
const catalog = readJson("content/development/seis-public-plugin-bundle-catalog.json");
const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log([
    "Usage: npm run install:seis-ai-agent -- [--general-plugin <id>|--journey <id>] [--check-only]",
    "       npm run install:seis-ai-agent -- --find <short-local-need>",
    "       npm run install:seis-ai-agent -- --apply [--general-plugin <id>]",
    "",
    "The default is a plan for canonical SEIS-Agent. A scoped task selects at most one of ten general plugins.",
    "The 30 internal packages are metadata only: they are not marketplace cards, automatic installs, or direct targets.",
    "--apply performs the explicitly requested local Codex CLI commands only after a human reviews the plan.",
  ].join("\n"));
  process.exit(0);
}

validateGuide();
if (args.findQuery !== null) {
  const finder = findPlugins(args.findQuery);
  console.log(JSON.stringify({
    mode: "find-only",
    marketplace: marketplaceName,
    query: finder.query,
    maximumResults: guide.finder.maximumResults,
    installationPerformed: false,
    candidates: finder.candidates,
    nextSteps: finder.candidates.length
      ? ["Choose exactly one returned general plugin.", "Review its plan command before using --apply.", "Do not install internal packages directly."]
      : ["Refine the local task wording; no network search was performed."],
  }, null, 2));
  process.exit(0);
}

const selected = selectPlugin(args.generalPluginId);
const planCommand = commandFor(selected.id, false);
const applyCommand = commandFor(selected.id, true);
const readiness = {
  marketplaceExists: fs.existsSync(path.join(root, ".agents", "plugins", "marketplace.json")),
  marketplaceName,
  selectedGeneralPlugin: {
    id: selected.id,
    name: selected.name,
    displayName: selected.displayName,
    installId: selected.installId,
    canonical: selected.id === "ai-intelligence",
    internalPackageCount: selected.internalPackageIds.length,
  },
  selectionBoundary: {
    maximumGeneralPluginSelectionsPerTask: 1,
    maximumInternalPackageSelectionsPerPlugin: 3,
    internalPackagesAutoInstalled: false,
    sourceMembersAutoInstalled: false,
    bulkInstallAllowed: false,
    applyRequiresExplicitFlag: true,
  },
  planCommand,
  applyCommand,
  publicReleaseAllowed: false,
};

if (args.checkOnly) {
  console.log(JSON.stringify({ mode: "check-only", ...readiness }, null, 2));
  process.exit(readiness.marketplaceExists ? 0 : 1);
}
if (!readiness.marketplaceExists) fail("repo marketplace is missing");
if (!args.apply) {
  console.log(JSON.stringify({
    mode: "plan-only",
    ...readiness,
    commands: [
      ["codex", "plugin", "marketplace", "add", root],
      ["codex", "plugin", "add", selected.installId],
    ],
  }, null, 2));
  process.exit(0);
}

if (!commandExists("codex")) fail("codex CLI is not available in PATH");
run("codex", ["plugin", "marketplace", "add", root]);
run("codex", ["plugin", "add", selected.installId]);
console.log(`Installed one selected general SEIS plugin: ${selected.installId}`);
console.log("Internal packages were not installed directly. Start a new Codex task to load the refreshed plugin surface.");

function parseArgs(argv) {
  const parsed = { apply: false, checkOnly: false, help: false, generalPluginId: null, findQuery: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") { parsed.help = true; continue; }
    if (arg === "--apply") { if (parsed.apply) fail("--apply may be supplied only once"); parsed.apply = true; continue; }
    if (arg === "--check-only") { if (parsed.checkOnly) fail("--check-only may be supplied only once"); parsed.checkOnly = true; continue; }
    if (arg === "--bundle" || arg.startsWith("--bundle=")) fail("internal package ids are not install targets; use --general-plugin");
    const inlineFind = arg.startsWith("--find=") ? arg.slice("--find=".length) : null;
    if (arg === "--find" || inlineFind !== null) {
      if (parsed.findQuery !== null) fail("only one --find may be supplied for a scoped task");
      const value = inlineFind ?? argv[index += 1];
      if (typeof value !== "string" || !value.trim() || value.startsWith("--")) fail("--find requires one short local need statement");
      parsed.findQuery = value;
      continue;
    }
    const inlineSelection = arg.startsWith("--general-plugin=") ? arg.slice("--general-plugin=".length) : arg.startsWith("--journey=") ? arg.slice("--journey=".length) : null;
    if (arg === "--general-plugin" || arg === "--journey" || inlineSelection !== null) {
      if (parsed.generalPluginId !== null) fail("only one general plugin may be selected for a scoped task");
      const value = inlineSelection ?? argv[index += 1];
      if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(value || "")) fail("--general-plugin must name a known general SEIS plugin");
      parsed.generalPluginId = value;
      continue;
    }
    fail(`unsupported option: ${arg}`);
  }
  if (parsed.apply && parsed.checkOnly) fail("--apply cannot be combined with --check-only");
  if (parsed.findQuery !== null && (parsed.apply || parsed.checkOnly || parsed.generalPluginId !== null)) fail("--find cannot be combined with --apply, --check-only, or a selection");
  return parsed;
}

function validateGuide() {
  if (
    guide?.id !== "seis-general-plugin-selection-guide"
    || guide?.marketplace?.name !== marketplaceName
    || guide?.marketplace?.publicCardCount !== 10
    || guide?.marketplace?.generalPluginCardCount !== 10
    || guide?.marketplace?.internalPackageCount !== 30
    || guide?.marketplace?.internalPackageCardCount !== 0
    || guide?.selectionBoundary?.maximumGeneralPluginSelectionsPerTask !== 1
    || guide?.selectionBoundary?.bulkInstallAllowed !== false
    || guide?.selectionBoundary?.internalPackagesAutoInstalled !== false
    || guide?.finder?.id !== "seis-general-plugin-finder"
    || guide?.finder?.maximumResults !== 3
    || guide?.finder?.externalAccess !== false
    || guide?.finder?.installation !== false
    || !Array.isArray(guide?.starterPaths)
    || guide.starterPaths.length !== 10
  ) fail("general plugin selection guide is unavailable or unsafe");
  if (catalog?.marketplace?.publicCardCount !== 10 || catalog?.marketplace?.internalPackageCount !== 30) fail("general plugin catalog is unavailable or unsafe");
}

function selectPlugin(id) {
  const requested = id || "ai-intelligence";
  const candidates = guide.starterPaths.filter((entry) => entry?.id === requested || entry?.generalPlugin?.name === requested);
  const entry = candidates[0];
  const plugin = entry?.generalPlugin;
  if (!entry || candidates.length !== 1 || !plugin || !Array.isArray(plugin.internalPackageIds) || plugin.internalPackageIds.length !== 3 || plugin.installId !== `${plugin.name}@${marketplaceName}`) {
    fail("--general-plugin must resolve to one reviewed general SEIS plugin");
  }
  return plugin;
}

function findPlugins(rawQuery) {
  const query = rawQuery.trim();
  if (!query || Array.from(query).length > guide.finder.maximumQueryLength) fail("--find requires a non-empty local need statement within 96 characters");
  const terms = termsFor(query);
  if (!terms.length) fail("--find requires a specific local need statement");
  const candidates = guide.starterPaths
    .map((entry) => {
      const search = new Set(termsFor([entry.id, entry.label, entry.category, ...(entry.keywords || [])].join(" ")));
      const matchCount = terms.filter((term) => search.has(term) || [...search].some((value) => value.startsWith(term))).length;
      return { entry, matchCount };
    })
    .filter((candidate) => candidate.matchCount > 0)
    .sort((left, right) => right.matchCount - left.matchCount || left.entry.id.localeCompare(right.entry.id))
    .slice(0, guide.finder.maximumResults)
    .map(({ entry, matchCount }) => ({
      id: entry.id,
      name: entry.generalPlugin.name,
      displayName: entry.label,
      installId: entry.generalPlugin.installId,
      internalPackageCount: entry.internalPackageIds.length,
      planCommand: commandFor(entry.id, false),
      matchedTermCount: matchCount,
    }));
  return { query, candidates };
}

function termsFor(value) {
  const stopWords = new Set(["a", "an", "and", "for", "the", "with", "seis", "plugin", "plugins", "general", "task"]);
  const normalized = String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return [...new Set((normalized.match(/[a-z0-9]+/g) || []).filter((term) => term.length >= 2 && !stopWords.has(term)))];
}

function commandFor(id, apply) {
  const flags = [apply ? "--apply" : null, `--general-plugin ${id}`].filter(Boolean).join(" ");
  return `npm run install:seis-ai-agent -- ${flags}`;
}
function readJson(relativePath) {
  try { return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")); } catch { return null; }
}
function commandExists(command) { return spawnSync(command, ["--version"], { stdio: "ignore", shell: process.platform === "win32" }).status === 0; }
function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (result.error || result.status !== 0) fail(`${command} ${commandArgs.join(" ")} failed`);
}
function fail(message) { console.error(`SEIS general plugin install failed: ${message}`); process.exit(1); }
