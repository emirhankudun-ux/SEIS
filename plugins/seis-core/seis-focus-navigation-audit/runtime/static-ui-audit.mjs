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
const INTERACTIVE_ROLES = new Set(["button", "checkbox", "menuitem", "option", "radio", "slider", "switch", "tab", "treeitem"]);
const NATIVE_INTERACTIVE_TAGS = new Set(["button", "input", "option", "select", "summary", "textarea"]);

export function auditStaticUi(inputRoot, options = {}) {
  const root = path.resolve(String(inputRoot || process.cwd()));
  const result = {
    state: "not-verified",
    ok: false,
    mode: "local-static-ui-audit-read-only",
    filesScanned: 0,
    filesSkipped: 0,
    sourceKinds: { markup: 0, script: 0, style: 0 },
    staticEvidence: {
      semanticInteractiveControls: false,
      keyboardEventHandler: false,
      focusManagement: false,
      focusStyle: false,
      reducedMotionStyle: false,
      ariaState: false,
      pointerEventHandler: false,
    },
    evidenceCounts: {
      semanticInteractiveControls: 0,
      keyboardEventHandlers: 0,
      focusManagementCalls: 0,
      focusStyleRules: 0,
      reducedMotionRules: 0,
      ariaStateMarkers: 0,
      pointerEventHandlers: 0,
    },
    missingStaticEvidence: [],
    findings: [],
    files: [],
    limitations: [
      "This is static-source evidence only; it does not launch a browser, drive a screen reader, or inspect rendered pixels.",
      "Native controls can be keyboard reachable without a JavaScript key handler, so source markers do not prove complete keyboard behavior.",
      "Manual keyboard, screen-reader, viewport, focus-order, focus-obscuration, and reduced-motion review remain required before release approval.",
    ],
  };

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

  for (const file of discovery.files) {
    const relative = toPortable(path.relative(root, file));
    const text = readBoundedText(file);
    if (text === null) {
      result.filesSkipped += 1;
      continue;
    }
    const observation = inspectSource(relative, text);
    result.files.push(observation.file);
    result.filesScanned += 1;
    result.sourceKinds.markup += observation.file.kind === "markup" ? 1 : 0;
    result.sourceKinds.script += observation.file.kind === "script" ? 1 : 0;
    result.sourceKinds.style += observation.file.kind === "style" ? 1 : 0;
    mergeEvidence(result, observation);
    result.findings.push(...observation.findings);
  }

  result.staticEvidence.semanticInteractiveControls = result.evidenceCounts.semanticInteractiveControls > 0;
  result.staticEvidence.keyboardEventHandler = result.evidenceCounts.keyboardEventHandlers > 0;
  result.staticEvidence.focusManagement = result.evidenceCounts.focusManagementCalls > 0;
  result.staticEvidence.focusStyle = result.evidenceCounts.focusStyleRules > 0;
  result.staticEvidence.reducedMotionStyle = result.evidenceCounts.reducedMotionRules > 0;
  result.staticEvidence.ariaState = result.evidenceCounts.ariaStateMarkers > 0;
  result.staticEvidence.pointerEventHandler = result.evidenceCounts.pointerEventHandlers > 0;

  if (!result.staticEvidence.semanticInteractiveControls) result.missingStaticEvidence.push("semantic-interactive-control");
  if (!result.staticEvidence.focusStyle) result.missingStaticEvidence.push("focus-style");
  if (!result.staticEvidence.reducedMotionStyle) result.missingStaticEvidence.push("reduced-motion-style");
  if (!result.staticEvidence.keyboardEventHandler && !result.staticEvidence.semanticInteractiveControls) {
    result.missingStaticEvidence.push("keyboard-event-or-native-control");
  }

  const errors = result.findings.filter((finding) => finding.severity === "error");
  if (errors.length > 0) {
    result.state = "attention";
    result.ok = false;
  } else if (result.missingStaticEvidence.length > 0 || result.filesScanned === 0) {
    result.state = "not-verified";
    result.ok = false;
  } else {
    result.state = "ready";
    result.ok = true;
  }
  return result;
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

function inspectSource(file, text) {
  const extension = path.extname(file).toLowerCase();
  const kind = extension === ".css" ? "style" : [".html", ".htm"].includes(extension) ? "markup" : "script";
  const evidence = {
    semanticInteractiveControls: 0,
    keyboardEventHandlers: 0,
    focusManagementCalls: 0,
    focusStyleRules: 0,
    reducedMotionRules: 0,
    ariaStateMarkers: 0,
    pointerEventHandlers: 0,
  };
  const findings = [];

  if (kind !== "style") {
    inspectMarkup(file, text, evidence, findings);
    evidence.keyboardEventHandlers += countMatches(text, /\b(?:keydown|keyup|keypress)\b/gi);
    evidence.focusManagementCalls += countMatches(text, /\.(?:focus|blur)\s*\(/g);
    evidence.pointerEventHandlers += countMatches(text, /\b(?:click|pointerdown|pointerup|mousedown|mouseup|touchstart|touchend)\b/gi);
  }
  if (kind === "style") {
    evidence.focusStyleRules += countMatches(text, /:(?:focus-visible|focus)\b/g);
    evidence.reducedMotionRules += countMatches(text, /prefers-reduced-motion\s*:/g);
    if (/\boutline\s*:\s*(?:none|0(?:\s*!important)?)(?:\s*;|\s*})/i.test(text) && !/:(?:focus-visible|focus)\b/.test(text)) {
      findings.push(finding("warning", "outline-suppressed-without-local-focus-style", file, text.search(/\boutline\s*:/i), text));
    }
  }

  return { file: { path: file, kind, evidence }, evidence, findings };
}

function inspectMarkup(file, text, evidence, findings) {
  const tagPattern = /<([A-Za-z][A-Za-z0-9:-]*)\b([^<>]*)>/g;
  let match;
  while ((match = tagPattern.exec(text))) {
    const tagName = match[1].toLowerCase();
    const attributes = match[2] || "";
    const role = attributeValue(attributes, "role")?.toLowerCase() || null;
    const hasTabindex = /\btabindex\s*=/.test(attributes);
    const isNative = NATIVE_INTERACTIVE_TAGS.has(tagName) || (tagName === "a" && /\bhref\s*=/.test(attributes));
    if (isNative || (role && INTERACTIVE_ROLES.has(role))) evidence.semanticInteractiveControls += 1;
    if (/\baria-(?:selected|controls|live|label|labelledby|activedescendant)\s*=/.test(attributes)) {
      evidence.ariaStateMarkers += countMatches(attributes, /\baria-(?:selected|controls|live|label|labelledby|activedescendant)\s*=/g);
    }
    if (role && INTERACTIVE_ROLES.has(role) && !isNative && !hasTabindex) {
      findings.push(finding("error", "non-native-interactive-role-missing-tabindex", file, match.index, text, { role }));
    }
    if (role === "tab" && !/\baria-selected\s*=/.test(attributes)) {
      findings.push(finding("warning", "tab-role-missing-aria-selected", file, match.index, text));
    }
    if (/\bonclick\s*=/.test(attributes) && !isNative && !/\bon(?:keydown|keyup|keypress)\s*=/.test(attributes)) {
      findings.push(finding("warning", "non-native-pointer-handler-without-inline-keyboard-handler", file, match.index, text));
    }
  }
  const tabindexPattern = /\btabindex\s*=\s*(?:"([+-]?\d+)"|'([+-]?\d+)'|([+-]?\d+))/gi;
  while ((match = tabindexPattern.exec(text))) {
    const value = Number.parseInt(match[1] || match[2] || match[3], 10);
    if (Number.isFinite(value) && value > 0) {
      findings.push(finding("error", "positive-tabindex", file, match.index, text, { value }));
    }
  }
}

function mergeEvidence(result, observation) {
  for (const [key, value] of Object.entries(observation.evidence)) result.evidenceCounts[key] += value;
}

function finding(severity, code, file, offset, sourceText, details = undefined) {
  return {
    severity,
    code,
    file,
    line: lineAtOffset(offset, sourceText),
    ...(details ? { details } : {}),
  };
}

function lineAtOffset(offset, text) {
  if (!Number.isFinite(offset) || offset < 0) return null;
  return text.slice(0, offset).split("\n").length;
}

function attributeValue(attributes, name) {
  const matcher = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = matcher.exec(attributes);
  return match ? match[1] || match[2] || match[3] || "" : null;
}

function countMatches(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
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

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function toPortable(value) {
  return value.split(path.sep).join("/");
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
