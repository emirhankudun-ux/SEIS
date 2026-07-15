import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_ID = "seis-core-plugin-change-evidence";
export const SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_THRESHOLD = 500;
export const SEIS_CORE_PLUGIN_CHANGE_SCOPE = Object.freeze([
  "plugins/seis-core",
  "apps/seis-core",
  "packages/seis-ai",
  "scripts",
]);

export function collectSeisCorePluginChangeEvidence(repoRoot, options = {}) {
  const threshold = Number.isSafeInteger(options.threshold) && options.threshold > 0
    ? options.threshold
    : SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_THRESHOLD;
  const files = new Map();

  for (const row of git(repoRoot, ["diff", "--numstat", "HEAD", "--", ...SEIS_CORE_PLUGIN_CHANGE_SCOPE]).split("\n")) {
    if (!row.trim()) continue;
    const [added, removed, ...pathParts] = row.split("\t");
    const relativePath = pathParts.join("\t");
    if (!isCodePath(relativePath)) continue;
    files.set(relativePath, {
      path: relativePath,
      added: parseNumstat(added),
      removed: parseNumstat(removed),
      state: "tracked-diff",
    });
  }

  for (const relativePath of git(repoRoot, ["ls-files", "--others", "--exclude-standard", "--", ...SEIS_CORE_PLUGIN_CHANGE_SCOPE]).split("\n")) {
    if (!relativePath || !isCodePath(relativePath) || files.has(relativePath)) continue;
    const absolutePath = path.join(repoRoot, ...relativePath.split("/"));
    const added = countLines(fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "");
    files.set(relativePath, { path: relativePath, added, removed: 0, state: "untracked" });
  }

  const entries = [...files.values()]
    .map((entry) => ({ ...entry, changed: entry.added + entry.removed }))
    .sort((left, right) => right.changed - left.changed || left.path.localeCompare(right.path));
  const codeLinesAdded = entries.reduce((sum, entry) => sum + entry.added, 0);
  const codeLinesRemoved = entries.reduce((sum, entry) => sum + entry.removed, 0);
  const codeLinesChanged = codeLinesAdded + codeLinesRemoved;
  const baseCommit = codeLinesChanged > 0 ? git(repoRoot, ["rev-parse", "HEAD"]).trim() : null;

  return {
    schemaVersion: 1,
    id: SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_ID,
    goalId: "SEIS-GOAL-021",
    baseCommit,
    generatedAt: "2026-07-15",
    scope: {
      application: "apps/seis-core",
      sourceRoot: "plugins/seis-core",
      paths: SEIS_CORE_PLUGIN_CHANGE_SCOPE,
      codeExtensions: [".cjs", ".css", ".go", ".html", ".js", ".mjs", ".py", ".rs", ".sh", ".swift", ".ts", ".tsx"],
    },
    threshold,
    codeLinesAdded,
    codeLinesRemoved,
    codeLinesChanged,
    eligible: codeLinesChanged >= threshold,
    files: entries,
  };
}

export function isCodePath(relativePath) {
  const normalized = String(relativePath || "").replaceAll(path.sep, "/");
  if (!normalized || normalized.includes("\t")) return false;
  if (/(^|\/)(node_modules|content|docs|assets|skills|data)(\/|$)/.test(normalized)) return false;
  if (normalized.endsWith(".json") || normalized.endsWith(".md") || normalized.endsWith(".svg")) return false;
  return /\.(cjs|css|go|html|js|mjs|py|rs|sh|swift|ts|tsx)$/.test(normalized);
}

function git(repoRoot, args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" });
}

function parseNumstat(value) {
  return value === "-" ? 0 : Number(value) || 0;
}

function countLines(value) {
  if (!value) return 0;
  return value.endsWith("\n") ? value.split("\n").length - 1 : value.split("\n").length;
}
