import fs from "node:fs";
import path from "node:path";

const DEFAULT_IGNORED = new Set([
  ".git",
  ".next",
  "build",
  "cache",
  "caches",
  "coverage",
  "dist",
  "node_modules",
  "target",
  "vendor",
]);
const SOURCE_EXTENSIONS = new Set([".css", ".cjs", ".html", ".htm", ".js", ".jsx", ".mjs", ".ts", ".tsx"]);

export const UI_STATE_CONTRACT = Object.freeze([
  {
    id: "loading",
    label: "Loading",
    patterns: [/\bloading\b/i],
    description: "A visible initial or in-progress state marker.",
  },
  {
    id: "ready",
    label: "Ready",
    patterns: [/\bready\b/i],
    description: "A visible ready or completed state marker.",
  },
  {
    id: "empty",
    label: "Empty",
    patterns: [/\bempty(?:[-\s]state)?\b/i],
    description: "A visible empty-result or empty-content state marker.",
  },
  {
    id: "degraded",
    label: "Degraded",
    patterns: [/\bdegraded\b/i],
    description: "A visible reduced-capability state marker.",
  },
  {
    id: "offline",
    label: "Offline",
    patterns: [/\boffline\b/i],
    description: "A visible local/offline state marker.",
  },
  {
    id: "unavailable",
    label: "Unavailable",
    patterns: [/\bunavailable\b/i, /\bmissing key\b/i, /\bdisabled\b/i],
    description: "A visible unavailable, missing-credential, or disabled state marker.",
  },
  {
    id: "rate-limited",
    label: "Rate limited",
    patterns: [/\brate[ -]?limited\b/i],
    description: "A visible rate-limit state marker.",
  },
  {
    id: "validation-failed",
    label: "Validation failed",
    patterns: [/\bvalidation failed\b/i, /\bvalidation error\b/i, /\binvalid(?: input| form| state)?\b/i],
    description: "A visible validation-failure state marker.",
  },
  {
    id: "provider-failed",
    label: "Provider failed",
    patterns: [/\bprovider (?:failed|error|unavailable)\b/i, /\bprovider failure\b/i],
    description: "A visible provider failure or unavailable state marker.",
  },
  {
    id: "approval-required",
    label: "Approval required",
    patterns: [/\b(?:human )?approval required\b/i, /\brequires? (?:explicit )?approval\b/i],
    description: "A visible approval-gated state marker.",
  },
  {
    id: "demo",
    label: "Demo",
    patterns: [/\b(?:local|browser-local|static) demo\b/i],
    description: "A visible demo-mode boundary marker.",
  },
  {
    id: "live-boundary",
    label: "Live boundary",
    patterns: [/\blive\b/i],
    description: "A source marker that distinguishes live behavior from demo or blocked behavior.",
  },
]);

const CONTRACT_BY_ID = new Map(UI_STATE_CONTRACT.map((state) => [state.id, state]));

export function auditUiStateContract(inputRoot, options = {}) {
  const root = path.resolve(String(inputRoot || process.cwd()));
  const selected = normalizeStateSelection(options.states);
  const result = {
    state: "not-verified",
    ok: false,
    mode: "local-static-ui-state-contract-read-only",
    filesScanned: 0,
    filesSkipped: 0,
    requestedStateIds: selected.ids,
    states: [],
    missingStateIds: [],
    findings: [],
    limitations: [
      "This is static source evidence only; it does not execute a UI, call a provider, inspect network state, or prove a rendered state transition.",
      "A source marker can be a comment, fixture, or latent path, so human product and accessibility review remain required before release approval.",
      "The audit reports source evidence gaps; it does not certify a state machine, error recovery, offline storage, or public runtime availability.",
    ],
  };

  if (!selected.ok) {
    result.reason = "invalid-state-selection";
    result.findings.push({ severity: "error", code: "unknown-ui-state", stateIds: selected.unknown });
    return result;
  }
  if (!isDirectory(root)) {
    result.reason = "directory-not-found";
    return result;
  }

  const discovery = collectSourceFiles(root, options);
  result.filesSkipped = discovery.skipped;
  if (discovery.files.length === 0) {
    result.reason = "no-supported-ui-source-found";
    return result;
  }

  const observations = new Map(selected.ids.map((id) => [id, { markerCount: 0, files: [] }]));
  for (const file of discovery.files) {
    const relative = toPortable(path.relative(root, file));
    const text = readBoundedText(file);
    if (text === null) {
      result.filesSkipped += 1;
      continue;
    }
    result.filesScanned += 1;
    for (const stateId of selected.ids) {
      const state = CONTRACT_BY_ID.get(stateId);
      const markers = findMarkers(text, state.patterns, relative);
      if (markers.length === 0) continue;
      const observation = observations.get(stateId);
      observation.markerCount += markers.length;
      observation.files.push(...markers);
    }
  }

  result.states = selected.ids.map((id) => {
    const state = CONTRACT_BY_ID.get(id);
    const observation = observations.get(id);
    const files = compactFileMarkers(observation.files);
    return {
      id,
      label: state.label,
      description: state.description,
      observed: observation.markerCount > 0,
      markerCount: observation.markerCount,
      files,
    };
  });
  result.missingStateIds = result.states.filter((state) => !state.observed).map((state) => state.id);
  for (const stateId of result.missingStateIds) {
    result.findings.push({ severity: "warning", code: "missing-static-ui-state-evidence", stateId });
  }

  if (result.filesScanned === 0) {
    result.reason = "no-readable-ui-source-found";
    return result;
  }
  result.ok = true;
  result.state = result.missingStateIds.length === 0 ? "ready" : "attention";
  return result;
}

function normalizeStateSelection(value) {
  if (value === undefined || value === null) return { ok: true, ids: UI_STATE_CONTRACT.map((state) => state.id), unknown: [] };
  if (!Array.isArray(value)) return { ok: false, ids: [], unknown: ["invalid-selection"] };
  const ids = [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))];
  const unknown = ids.filter((id) => !CONTRACT_BY_ID.has(id));
  return { ok: unknown.length === 0 && ids.length > 0, ids, unknown };
}

function collectSourceFiles(root, options) {
  const explicitFiles = Array.isArray(options.files) ? options.files : null;
  const maxFiles = boundedInteger(options.maxFiles, 240, 1, 500);
  const maxDepth = boundedInteger(options.maxDepth, 8, 1, 16);
  const files = [];
  let skipped = 0;

  if (explicitFiles) {
    for (const candidate of explicitFiles.slice(0, maxFiles)) {
      if (typeof candidate !== "string" || candidate.length === 0 || path.isAbsolute(candidate) || candidate.includes("..")) {
        skipped += 1;
        continue;
      }
      const absolute = path.resolve(root, candidate);
      if (!isWithin(root, absolute) || !isRegularSourceFile(absolute)) {
        skipped += 1;
        continue;
      }
      files.push(absolute);
    }
    return { files: uniqueSorted(files), skipped: skipped + Math.max(0, explicitFiles.length - maxFiles) };
  }

  function visit(directory, depth) {
    if (files.length >= maxFiles || depth > maxDepth) return;
    let entries = [];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      skipped += 1;
      return;
    }
    for (const entry of entries) {
      if (files.length >= maxFiles) return;
      if (entry.name.startsWith(".") || DEFAULT_IGNORED.has(entry.name)) continue;
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        skipped += 1;
        continue;
      }
      if (entry.isDirectory()) visit(full, depth + 1);
      else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(full);
    }
  }

  visit(root, 0);
  return { files: uniqueSorted(files), skipped };
}

function findMarkers(text, patterns, file) {
  const markers = [];
  for (const sourcePattern of patterns) {
    const flags = sourcePattern.flags.includes("g") ? sourcePattern.flags : `${sourcePattern.flags}g`;
    const pattern = new RegExp(sourcePattern.source, flags);
    let match;
    while ((match = pattern.exec(text))) {
      markers.push({ file, line: lineAtOffset(match.index, text) });
      if (match[0].length === 0) pattern.lastIndex += 1;
    }
  }
  return markers;
}

function compactFileMarkers(markers) {
  const unique = new Map();
  for (const marker of markers) {
    const key = `${marker.file}:${marker.line}`;
    if (!unique.has(key)) unique.set(key, marker);
    if (unique.size >= 24) break;
  }
  return [...unique.values()];
}

function lineAtOffset(offset, text) {
  if (!Number.isFinite(offset) || offset < 0) return null;
  return text.slice(0, offset).split("\n").length;
}

function boundedInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function readBoundedText(file) {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size > 1024 * 1024) return null;
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function isDirectory(file) {
  try {
    const stat = fs.lstatSync(file);
    return stat.isDirectory() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function isRegularSourceFile(file) {
  try {
    const stat = fs.lstatSync(file);
    return stat.isFile() && !stat.isSymbolicLink() && SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase());
  } catch {
    return false;
  }
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function uniqueSorted(files) {
  return [...new Set(files)].sort((left, right) => left.localeCompare(right));
}

function toPortable(file) {
  return file.split(path.sep).join("/");
}
