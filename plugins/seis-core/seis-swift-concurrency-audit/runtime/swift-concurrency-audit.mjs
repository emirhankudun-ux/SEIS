import fs from "node:fs";
import path from "node:path";

export const SWIFT_CONCURRENCY_AUDIT_ID = "seis-swift-concurrency-audit";
export const SWIFT_CONCURRENCY_AUDIT_SCOPE = Object.freeze({
  platformKitSources: "packages/seis_platform_swift/Sources/SeisPlatformKit",
  appleShellSources: "packages/seis_platform_swift/Sources/SeisAppleNativeShell",
});
export const SWIFT_CONCURRENCY_AUDIT_LIMITS = Object.freeze({
  maxSwiftFiles: 64,
  maxFileBytes: 128 * 1024,
  maxTotalBytes: 1024 * 1024,
  maxSourceDepth: 4,
  maxReportedPaths: 24,
});

const SOURCE_AREAS = Object.freeze([
  ["platform-kit-sources", SWIFT_CONCURRENCY_AUDIT_SCOPE.platformKitSources],
  ["apple-shell-sources", SWIFT_CONCURRENCY_AUDIT_SCOPE.appleShellSources],
]);
const SIGNAL_PATTERNS = Object.freeze({
  uncheckedSendable: /@unchecked\s+Sendable/g,
  mainActor: /@MainActor\b/g,
  actorDeclaration: /\bactor\s+[A-Za-z_][A-Za-z0-9_]*/g,
  sendableDeclaration: /\bSendable\b/g,
  taskDetached: /\bTask\s*\.\s*detached\b/g,
  taskMainActor: /\bTask\s*\{\s*@MainActor\b/g,
  dispatchQueue: /\bDispatchQueue\b/g,
  await: /\bawait\b/g,
});
const MACHINE_PATH_PATTERN = /(?:\/Users\/|\/home\/|[A-Za-z]:\\|[A-Za-z]:\/(?!\/))/g;
const CREDENTIAL_ASSIGNMENT_PATTERN = /\b(?:api[_-]?key|access[_-]?token|auth(?:entication)?[_-]?token|password|secret)\b\s*[:=]\s*["'][^"'\r\n]+["']/gi;

export function auditSwiftConcurrency(rootPath) {
  const root = path.resolve(rootPath);
  const findings = [];
  const signals = createSignals();
  const counters = {
    discoveredSwiftFileCount: 0,
    scannedSwiftFileCount: 0,
    boundedSwiftByteCount: 0,
    maxFileBytesObserved: 0,
    maxRelativeDepthObserved: 0,
    symlinkCount: 0,
    unreadableFileCount: 0,
    machineSpecificPathMarkerCount: 0,
    credentialAssignmentFindingCount: 0,
  };
  const roots = SOURCE_AREAS.map(([id, relativePath]) => inspectSourceArea(root, id, relativePath, counters, signals, findings));

  const signalCounts = Object.fromEntries(Object.entries(signals).map(([name, signal]) => [name, signal.count]));
  if (signals.uncheckedSendable.count > 0) {
    findings.push({ severity: "attention", code: "unchecked-sendable-review-required", count: signals.uncheckedSendable.count });
  }
  if (signals.taskDetached.count > 0) {
    findings.push({ severity: "attention", code: "task-detached-review-required", count: signals.taskDetached.count });
  }
  if (counters.machineSpecificPathMarkerCount > 0) {
    findings.push({ severity: "attention", code: "machine-path-marker-redacted", count: counters.machineSpecificPathMarkerCount });
  }
  if (counters.credentialAssignmentFindingCount > 0) {
    findings.push({ severity: "error", code: "credential-assignment-marker-found", count: counters.credentialAssignmentFindingCount });
  }

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  const attentionCount = findings.filter((finding) => finding.severity === "attention").length;
  return {
    state: errorCount > 0 || attentionCount > 0 ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "swift-concurrency-static-signal-read-only",
    classification: "bounded-static-concurrency-signals-only",
    plugin: SWIFT_CONCURRENCY_AUDIT_ID,
    summary: {
      sourceRoots: roots,
      discoveredSwiftFileCount: counters.discoveredSwiftFileCount,
      scannedSwiftFileCount: counters.scannedSwiftFileCount,
      boundedSwiftByteCount: counters.boundedSwiftByteCount,
      maxFileBytesObserved: counters.maxFileBytesObserved,
      maxRelativeDepthObserved: counters.maxRelativeDepthObserved,
      signalCounts,
      reviewRequired: attentionCount > 0,
      blockingFindingCount: errorCount,
      attentionFindingCount: attentionCount,
    },
    signals,
    checks: roots.map((sourceRoot) => ({
      id: sourceRoot.id,
      state: sourceRoot.safe ? "ready" : "attention",
    })),
    errorCount,
    warningCount: attentionCount,
    findings,
    limits: SWIFT_CONCURRENCY_AUDIT_LIMITS,
    permissions: {
      read: [
        "two fixed checked-in Swift source roots",
        "bounded Swift source metadata and derived static concurrency markers",
      ],
      write: [],
      network: [],
      secrets: [],
    },
    outputBoundary: {
      rawSourceReturned: false,
      rawMatchedValuesReturned: false,
      absolutePathsReturned: false,
      maximumReportedPathsPerSignal: SWIFT_CONCURRENCY_AUDIT_LIMITS.maxReportedPaths,
    },
    limitations: [
      "This audit reads bounded static Swift source evidence only and does not compile or run Swift.",
      "Static markers do not prove Sendable conformance, actor isolation, data-race freedom, task safety, compiler diagnostics, test success, or runtime behavior.",
      "The audit never returns raw source or matched values, writes files, follows symlinks, calls a provider, uses a network, reads credentials, or changes release state.",
    ],
  };
}

function createSignals() {
  return Object.fromEntries(Object.keys(SIGNAL_PATTERNS).map((name) => [name, { count: 0, relativePaths: [] }]));
}

function inspectSourceArea(root, id, relativePath, counters, signals, findings) {
  const absolutePath = resolveBoundedPath(root, relativePath);
  const result = {
    id,
    relativePath,
    discoveredSwiftFileCount: 0,
    scannedSwiftFileCount: 0,
    symlinkCount: 0,
    unreadableFileCount: 0,
    safe: false,
  };
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    findings.push({ severity: "error", code: "swift-source-area-missing", marker: id });
    return result;
  }
  try {
    const stat = fs.lstatSync(absolutePath);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      findings.push({ severity: "error", code: "swift-source-area-unsafe", marker: id });
      return result;
    }
    const state = { fileLimitExceeded: false, fileSizeLimitExceeded: false, totalByteLimitExceeded: false, depthLimitExceeded: false };
    walkSwiftFiles(absolutePath, absolutePath, root, result, counters, signals, findings, state);
    if (state.fileLimitExceeded) findings.push({ severity: "error", code: "swift-source-file-limit-exceeded", marker: id });
    if (state.fileSizeLimitExceeded) findings.push({ severity: "error", code: "swift-source-file-size-limit-exceeded", marker: id });
    if (state.totalByteLimitExceeded) findings.push({ severity: "error", code: "swift-source-total-byte-limit-exceeded", marker: id });
    if (state.depthLimitExceeded) findings.push({ severity: "error", code: "swift-source-depth-limit-exceeded", marker: id });
    if (result.scannedSwiftFileCount === 0) findings.push({ severity: "error", code: "swift-source-area-empty", marker: id });
    result.safe = result.scannedSwiftFileCount > 0
      && !state.fileLimitExceeded
      && !state.fileSizeLimitExceeded
      && !state.totalByteLimitExceeded
      && !state.depthLimitExceeded
      && result.unreadableFileCount === 0
      && result.symlinkCount === 0;
    return result;
  } catch {
    findings.push({ severity: "error", code: "swift-source-area-unreadable", marker: id });
    return result;
  }
}

function walkSwiftFiles(directoryPath, sourceRootPath, repositoryRoot, area, counters, signals, findings, state, depth = 0) {
  if (state.fileLimitExceeded || state.fileSizeLimitExceeded || state.totalByteLimitExceeded || state.depthLimitExceeded) return;
  if (depth > SWIFT_CONCURRENCY_AUDIT_LIMITS.maxSourceDepth) {
    state.depthLimitExceeded = true;
    return;
  }
  let entries;
  try {
    entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  } catch {
    counters.unreadableFileCount += 1;
    area.unreadableFileCount += 1;
    findings.push({ severity: "error", code: "swift-source-area-unreadable", marker: area.id });
    return;
  }
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (state.fileLimitExceeded || state.fileSizeLimitExceeded || state.totalByteLimitExceeded || state.depthLimitExceeded) return;
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isSymbolicLink()) {
      counters.symlinkCount += 1;
      area.symlinkCount += 1;
      findings.push({ severity: "error", code: "swift-source-symlink-refused", marker: area.id });
      continue;
    }
    if (entry.isDirectory()) {
      walkSwiftFiles(entryPath, sourceRootPath, repositoryRoot, area, counters, signals, findings, state, depth + 1);
      continue;
    }
    if (!entry.isFile() || path.extname(entry.name) !== ".swift") continue;
    area.discoveredSwiftFileCount += 1;
    counters.discoveredSwiftFileCount += 1;
    if (counters.discoveredSwiftFileCount > SWIFT_CONCURRENCY_AUDIT_LIMITS.maxSwiftFiles) {
      state.fileLimitExceeded = true;
      continue;
    }

    let stat;
    try {
      stat = fs.statSync(entryPath);
    } catch {
      counters.unreadableFileCount += 1;
      area.unreadableFileCount += 1;
      findings.push({ severity: "error", code: "swift-source-file-unreadable", marker: area.id });
      continue;
    }
    const relativeDepth = sourceRelativeDepth(sourceRootPath, entryPath);
    counters.maxFileBytesObserved = Math.max(counters.maxFileBytesObserved, stat.size);
    counters.maxRelativeDepthObserved = Math.max(counters.maxRelativeDepthObserved, relativeDepth);
    if (stat.size > SWIFT_CONCURRENCY_AUDIT_LIMITS.maxFileBytes) {
      state.fileSizeLimitExceeded = true;
      continue;
    }
    if (counters.boundedSwiftByteCount + stat.size > SWIFT_CONCURRENCY_AUDIT_LIMITS.maxTotalBytes) {
      state.totalByteLimitExceeded = true;
      continue;
    }
    if (relativeDepth > SWIFT_CONCURRENCY_AUDIT_LIMITS.maxSourceDepth) {
      state.depthLimitExceeded = true;
      continue;
    }

    let source;
    try {
      source = fs.readFileSync(entryPath, "utf8");
    } catch {
      counters.unreadableFileCount += 1;
      area.unreadableFileCount += 1;
      findings.push({ severity: "error", code: "swift-source-file-unreadable", marker: area.id });
      continue;
    }
    counters.scannedSwiftFileCount += 1;
    area.scannedSwiftFileCount += 1;
    counters.boundedSwiftByteCount += stat.size;
    const relativePath = relativeRepositoryPath(repositoryRoot, entryPath);
    counters.machineSpecificPathMarkerCount += countMatches(source, MACHINE_PATH_PATTERN);
    counters.credentialAssignmentFindingCount += countMatches(source, CREDENTIAL_ASSIGNMENT_PATTERN);
    for (const [name, pattern] of Object.entries(SIGNAL_PATTERNS)) {
      const count = countMatches(source, pattern);
      if (count === 0) continue;
      signals[name].count += count;
      if (signals[name].relativePaths.length < SWIFT_CONCURRENCY_AUDIT_LIMITS.maxReportedPaths) {
        signals[name].relativePaths.push(relativePath);
      }
    }
  }
}

function resolveBoundedPath(root, relativePath) {
  if (typeof relativePath !== "string" || !relativePath.trim()) return null;
  const resolved = path.resolve(root, relativePath);
  return resolved === root || resolved.startsWith(root + path.sep) ? resolved : null;
}

function relativeRepositoryPath(root, absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join("/");
}

function sourceRelativeDepth(sourceRootPath, filePath) {
  const relativePath = path.relative(sourceRootPath, filePath);
  return Math.max(0, relativePath.split(path.sep).length - 1);
}

function countMatches(value, pattern) {
  const expression = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  return [...value.matchAll(expression)].length;
}
