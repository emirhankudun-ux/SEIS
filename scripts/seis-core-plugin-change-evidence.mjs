import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_ID = "seis-core-plugin-change-evidence";
export const SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_THRESHOLD = 500;
export const SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_PATH = "content/development/seis-core-plugin-change-evidence.json";
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

export function readSeisCorePluginChangeEvidenceArtifact(repoRoot, options = {}) {
  const relativePath = options.relativePath || SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_PATH;
  const evidencePath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(repoRoot, ...relativePath.split("/"));
  if (!fs.existsSync(evidencePath)) {
    throw new Error(`SEIS Core plugin change-evidence artifact is missing: ${relativePath}`);
  }

  let evidence;
  try {
    evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  } catch (error) {
    throw new Error(`SEIS Core plugin change-evidence artifact is not valid JSON: ${relativePath} (${error.message})`);
  }

  return assertSeisCorePluginChangeEvidence(evidence, { ...options, repoRoot });
}

export function assertSeisCorePluginChangeEvidence(evidence, options = {}) {
  const expectedThreshold = Number.isSafeInteger(options.threshold) && options.threshold > 0
    ? options.threshold
    : null;
  const failures = [];
  const ensure = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const expectedExtensions = [".cjs", ".css", ".go", ".html", ".js", ".mjs", ".py", ".rs", ".sh", ".swift", ".ts", ".tsx"];

  ensure(evidence && typeof evidence === "object" && !Array.isArray(evidence), "artifact must be an object");
  ensure(evidence?.schemaVersion === 1, "schemaVersion must be 1");
  ensure(evidence?.id === SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_ID, `id must be ${SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_ID}`);
  ensure(evidence?.goalId === "SEIS-GOAL-021", "goalId must be SEIS-GOAL-021");
  ensure(typeof evidence?.generatedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(evidence.generatedAt), "generatedAt must use YYYY-MM-DD");
  ensure(Number.isSafeInteger(evidence?.threshold) && evidence.threshold > 0, "threshold must be a positive integer");
  if (expectedThreshold !== null) ensure(evidence?.threshold === expectedThreshold, `threshold must be ${expectedThreshold}`);
  ensure(sameArray(evidence?.scope?.paths, SEIS_CORE_PLUGIN_CHANGE_SCOPE), "scope paths are invalid");
  ensure(evidence?.scope?.application === "apps/seis-core", "scope application is invalid");
  ensure(evidence?.scope?.sourceRoot === "plugins/seis-core", "scope sourceRoot is invalid");
  ensure(sameArray(evidence?.scope?.codeExtensions, expectedExtensions), "scope codeExtensions are invalid");
  ensure(Number.isSafeInteger(evidence?.codeLinesAdded) && evidence.codeLinesAdded >= 0, "codeLinesAdded must be a non-negative integer");
  ensure(Number.isSafeInteger(evidence?.codeLinesRemoved) && evidence.codeLinesRemoved >= 0, "codeLinesRemoved must be a non-negative integer");
  ensure(Number.isSafeInteger(evidence?.codeLinesChanged) && evidence.codeLinesChanged >= 0, "codeLinesChanged must be a non-negative integer");
  ensure(evidence?.codeLinesChanged === evidence?.codeLinesAdded + evidence?.codeLinesRemoved, "codeLinesChanged must equal additions plus removals");
  ensure(evidence?.eligible === (evidence?.codeLinesChanged >= evidence?.threshold), "eligible must match the recorded threshold decision");
  ensure(evidence?.baseCommit === null || /^[0-9a-f]{40}$/.test(evidence?.baseCommit || ""), "baseCommit must be a full commit SHA or null");
  ensure(Array.isArray(evidence?.files), "files must be an array");

  const seenPaths = new Set();
  let filesAdded = 0;
  let filesRemoved = 0;
  const files = Array.isArray(evidence?.files) ? evidence.files : [];
  for (const [index, entry] of files.entries()) {
    ensure(entry && typeof entry === "object" && !Array.isArray(entry), `files[${index}] must be an object`);
    ensure(typeof entry?.path === "string" && isWithinChangeScope(entry.path) && isCodePath(entry.path), `files[${index}] path is outside the code-change scope`);
    ensure(!seenPaths.has(entry?.path), `files[${index}] duplicates ${entry?.path}`);
    seenPaths.add(entry?.path);
    ensure(Number.isSafeInteger(entry?.added) && entry.added >= 0, `files[${index}] added count is invalid`);
    ensure(Number.isSafeInteger(entry?.removed) && entry.removed >= 0, `files[${index}] removed count is invalid`);
    ensure(Number.isSafeInteger(entry?.changed) && entry.changed > 0, `files[${index}] changed count is invalid`);
    ensure(entry?.changed === entry?.added + entry?.removed, `files[${index}] changed count is inconsistent`);
    ensure(entry?.state === "tracked-diff" || entry?.state === "untracked", `files[${index}] state is invalid`);
    filesAdded += Number.isSafeInteger(entry?.added) ? entry.added : 0;
    filesRemoved += Number.isSafeInteger(entry?.removed) ? entry.removed : 0;
    if (index > 0) {
      const previous = files[index - 1];
      const outOfOrder = previous?.changed < entry?.changed
        || (previous?.changed === entry?.changed && previous?.path.localeCompare(entry?.path) > 0);
      ensure(!outOfOrder, "files must be sorted by changed lines descending, then path");
    }
  }

  ensure(filesAdded === evidence?.codeLinesAdded, "file additions do not match codeLinesAdded");
  ensure(filesRemoved === evidence?.codeLinesRemoved, "file removals do not match codeLinesRemoved");
  ensure(evidence?.files?.length > 0 || evidence?.codeLinesChanged === 0, "zero-file evidence must report zero changed lines");
  ensure(evidence?.codeLinesChanged === 0 || typeof evidence?.baseCommit === "string", "non-empty evidence must record its generation base commit");
  ensure(evidence?.codeLinesChanged > 0 || evidence?.baseCommit === null, "empty evidence must not record a generation base commit");

  if (options.repoRoot && typeof evidence?.baseCommit === "string") {
    try {
      git(options.repoRoot, ["cat-file", "-e", `${evidence.baseCommit}^{commit}`]);
    } catch {
      failures.push("baseCommit is not available as a local commit");
    }
  }

  if (failures.length > 0) {
    throw new Error(`SEIS Core plugin change-evidence artifact is invalid:\n- ${failures.join("\n- ")}`);
  }

  return evidence;
}

export function isCodePath(relativePath) {
  const normalized = String(relativePath || "").replaceAll(path.sep, "/");
  if (!normalized || normalized.includes("\t")) return false;
  if (/(^|\/)(node_modules|content|docs|assets|skills|data)(\/|$)/.test(normalized)) return false;
  if (normalized.endsWith(".json") || normalized.endsWith(".md") || normalized.endsWith(".svg")) return false;
  return /\.(cjs|css|go|html|js|mjs|py|rs|sh|swift|ts|tsx)$/.test(normalized);
}

function isWithinChangeScope(relativePath) {
  const normalized = String(relativePath || "").replaceAll(path.sep, "/");
  return SEIS_CORE_PLUGIN_CHANGE_SCOPE.some((scope) => normalized === scope || normalized.startsWith(`${scope}/`));
}

function sameArray(left, right) {
  return Array.isArray(left)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
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
