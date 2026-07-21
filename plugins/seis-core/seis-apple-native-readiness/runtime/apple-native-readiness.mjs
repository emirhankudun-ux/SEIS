import fs from "node:fs";
import path from "node:path";

export const APPLE_NATIVE_READINESS_ID = "seis-apple-native-readiness";
export const APPLE_NATIVE_READINESS_SCOPE = Object.freeze({
  packageManifest: "packages/seis_platform_swift/Package.swift",
  platformKitSources: "packages/seis_platform_swift/Sources/SeisPlatformKit",
  appleShellSources: "packages/seis_platform_swift/Sources/SeisAppleNativeShell",
  platformKitTests: "packages/seis_platform_swift/Tests/SeisPlatformKitTests",
  appleStrategy: "docs/APPLE_PLATFORM_STRATEGY.md",
});

export const APPLE_NATIVE_READINESS_LIMITS = Object.freeze({
  maxTextBytes: 128 * 1024,
  maxSwiftFilesPerArea: 128,
  maxSourceDepth: 8,
});

const MAX_TEXT_BYTES = APPLE_NATIVE_READINESS_LIMITS.maxTextBytes;
const MAX_SWIFT_FILES_PER_AREA = APPLE_NATIVE_READINESS_LIMITS.maxSwiftFilesPerArea;
const MAX_SOURCE_DEPTH = APPLE_NATIVE_READINESS_LIMITS.maxSourceDepth;

const PACKAGE_MARKERS = Object.freeze([
  ["package-name", 'name: "SeisPlatformKit"'],
  ["platform-macos", ".macOS(.v13)"],
  ["platform-ios", ".iOS(.v16)"],
  ["library-product", '.library(name: "SeisPlatformKit"'],
  ["shell-executable-product", '.executable(name: "SeisAppleNativeShell"'],
  ["platform-kit-target", '.target(name: "SeisPlatformKit")'],
  ["shell-executable-target", ".executableTarget("],
  ["platform-kit-test-target", '.testTarget(name: "SeisPlatformKitTests"'],
]);

const STRATEGY_MARKERS = Object.freeze([
  ["strategy-macos-role", "macOS is the primary native Command Center."],
  ["strategy-ipados-role", "iPadOS is the SEIS Brain, review, and creative-planning surface."],
  ["strategy-ios-role", "iOS is the status, alert, search, and quick-note companion."],
  ["strategy-no-symbolic-swift", "Do not add symbolic Swift files"],
]);

const REQUIRED_TEST_FILES = Object.freeze([
  "SeisPlatformKitSmokeTests.swift",
  "SeisPlatformPolicyTests.swift",
]);

export function auditAppleNativeReadiness(rootPath) {
  const root = path.resolve(rootPath);
  const findings = [];
  const checks = [];
  const packageText = readBoundedText(root, APPLE_NATIVE_READINESS_SCOPE.packageManifest, findings, "package-manifest");
  const strategyText = readBoundedText(root, APPLE_NATIVE_READINESS_SCOPE.appleStrategy, findings, "apple-strategy");

  for (const [id, marker] of PACKAGE_MARKERS) {
    addCheck(checks, findings, id, typeof packageText === "string" && packageText.includes(marker));
  }

  const sourceAreas = [
    inspectSwiftArea(root, APPLE_NATIVE_READINESS_SCOPE.platformKitSources, "platform-kit-sources", findings),
    inspectSwiftArea(root, APPLE_NATIVE_READINESS_SCOPE.appleShellSources, "apple-shell-sources", findings),
  ];
  for (const area of sourceAreas) {
    addCheck(checks, findings, area.id, area.swiftFileCount > 0 && area.safe);
  }

  for (const filename of REQUIRED_TEST_FILES) {
    const observed = isBoundedRegularFile(root, path.posix.join(APPLE_NATIVE_READINESS_SCOPE.platformKitTests, filename));
    addCheck(checks, findings, `test-${filename.replace(/\.swift$/, "").toLowerCase()}`, observed);
  }

  for (const [id, marker] of STRATEGY_MARKERS) {
    addCheck(checks, findings, id, typeof strategyText === "string" && strategyText.includes(marker));
  }

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  return {
    state: errorCount === 0 ? "ready" : "attention",
    ok: errorCount === 0,
    mode: "apple-native-static-readiness-read-only",
    classification: "documented-static-readiness-only",
    plugin: APPLE_NATIVE_READINESS_ID,
    summary: {
      package: packageText?.includes('name: "SeisPlatformKit"') ? "SeisPlatformKit" : null,
      declaredPlatforms: [
        packageText?.includes(".macOS(.v13)") ? "macOS 13+" : null,
        packageText?.includes(".iOS(.v16)") ? "iOS 16+" : null,
      ].filter(Boolean),
      sourceAreas: sourceAreas.map(({ id, swiftFileCount, safe }) => ({ id, swiftFileCount, safe })),
      requiredTestFileCount: REQUIRED_TEST_FILES.length,
      presentTestFileCount: REQUIRED_TEST_FILES.filter((filename) => isBoundedRegularFile(root, path.posix.join(APPLE_NATIVE_READINESS_SCOPE.platformKitTests, filename))).length,
      staticCheckCount: checks.length,
      readyCheckCount: checks.filter((check) => check.state === "ready").length,
    },
    checks,
    errorCount,
    warningCount: findings.filter((finding) => finding.severity === "warning").length,
    findings,
    permissions: {
      read: [
        "bounded Swift Package manifest markers",
        "bounded Swift source and test filenames",
        "checked-in Apple platform strategy markers",
      ],
      write: [],
      network: [],
      secrets: [],
    },
    limitations: [
      "This audit reads bounded static repository evidence only and does not compile Swift code.",
      "A ready result does not prove a macOS, iPadOS, iOS, visionOS, simulator, device, signing, provisioning, App Store, or deployment outcome.",
      "The audit does not start an app, call a provider, use a network, read credentials, or change a source file.",
    ],
  };
}

function addCheck(checks, findings, id, observed) {
  checks.push({ id, state: observed ? "ready" : "attention" });
  if (!observed) findings.push({ severity: "error", code: "static-readiness-check-failed", marker: id });
}

function inspectSwiftArea(root, relativePath, id, findings) {
  const absolutePath = resolveBoundedPath(root, relativePath);
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    findings.push({ severity: "error", code: "swift-source-area-missing", marker: id });
    return { id, swiftFileCount: 0, safe: false };
  }
  try {
    const stat = fs.lstatSync(absolutePath);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      findings.push({ severity: "error", code: "swift-source-area-unsafe", marker: id });
      return { id, swiftFileCount: 0, safe: false };
    }
    const result = countSwiftFiles(absolutePath);
    if (result.fileLimitExceeded) findings.push({ severity: "error", code: "swift-source-file-limit-exceeded", marker: id });
    if (result.depthLimitExceeded) findings.push({ severity: "error", code: "swift-source-depth-limit-exceeded", marker: id });
    if (result.unreadable) findings.push({ severity: "error", code: "swift-source-area-unreadable", marker: id });
    return {
      id,
      swiftFileCount: result.count,
      safe: !result.fileLimitExceeded && !result.depthLimitExceeded && !result.unreadable,
    };
  } catch {
    findings.push({ severity: "error", code: "swift-source-area-unreadable", marker: id });
    return { id, swiftFileCount: 0, safe: false };
  }
}

function countSwiftFiles(directory) {
  let count = 0;
  let fileLimitExceeded = false;
  let depthLimitExceeded = false;
  let unreadable = false;
  const visit = (currentPath, depth) => {
    if (fileLimitExceeded || depthLimitExceeded || unreadable) return;
    if (depth > MAX_SOURCE_DEPTH) {
      depthLimitExceeded = true;
      return;
    }
    let entries;
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      unreadable = true;
      return;
    }
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (fileLimitExceeded || depthLimitExceeded || unreadable || entry.isSymbolicLink()) continue;
      const child = path.join(currentPath, entry.name);
      if (entry.isDirectory()) visit(child, depth + 1);
      else if (entry.isFile() && entry.name.endsWith(".swift")) {
        count += 1;
        if (count > MAX_SWIFT_FILES_PER_AREA) fileLimitExceeded = true;
      }
    }
  };
  visit(directory, 0);
  return {
    count: Math.min(count, MAX_SWIFT_FILES_PER_AREA),
    fileLimitExceeded,
    depthLimitExceeded,
    unreadable,
  };
}

function readBoundedText(root, relativePath, findings, label) {
  const absolutePath = resolveBoundedPath(root, relativePath);
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    findings.push({ severity: "error", code: `${label}-missing` });
    return null;
  }
  try {
    const stat = fs.lstatSync(absolutePath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      findings.push({ severity: "error", code: `${label}-unsafe` });
      return null;
    }
    if (stat.size > MAX_TEXT_BYTES) {
      findings.push({ severity: "error", code: `${label}-too-large` });
      return null;
    }
    return fs.readFileSync(absolutePath, "utf8");
  } catch {
    findings.push({ severity: "error", code: `${label}-unreadable` });
    return null;
  }
}

function isBoundedRegularFile(root, relativePath) {
  const absolutePath = resolveBoundedPath(root, relativePath);
  if (!absolutePath || !fs.existsSync(absolutePath)) return false;
  try {
    const stat = fs.lstatSync(absolutePath);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function resolveBoundedPath(root, relativePath) {
  if (typeof relativePath !== "string" || !relativePath.trim()) return null;
  const resolved = path.resolve(root, relativePath);
  return resolved === root || resolved.startsWith(root + path.sep) ? resolved : null;
}
