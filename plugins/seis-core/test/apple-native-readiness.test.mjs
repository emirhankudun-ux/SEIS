import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  APPLE_NATIVE_READINESS_ID,
  APPLE_NATIVE_READINESS_LIMITS,
  auditAppleNativeReadiness,
} from "../seis-apple-native-readiness/runtime/apple-native-readiness.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const serverPath = path.join(repositoryRoot, "plugins/seis-core/seis-apple-native-readiness/scripts/seis-apple-native-readiness-mcp-server.mjs");

test("reports bounded static Apple-native readiness for the checked-in SEIS source", () => {
  const report = auditAppleNativeReadiness(repositoryRoot);

  assert.equal(report.plugin, APPLE_NATIVE_READINESS_ID);
  assert.equal(report.state, "ready");
  assert.equal(report.ok, true);
  assert.equal(report.classification, "documented-static-readiness-only");
  assert.equal(report.permissions.write.length, 0);
  assert.equal(report.permissions.network.length, 0);
  assert.equal(report.permissions.secrets.length, 0);
  assert.equal(report.summary.package, "SeisPlatformKit");
  assert.deepEqual(report.summary.declaredPlatforms, ["macOS 13+", "iOS 16+"]);
  assert.ok(report.summary.sourceAreas.every((area) => area.swiftFileCount > 0 && area.safe));
  assert.equal(report.summary.presentTestFileCount, report.summary.requiredTestFileCount);
  assert.ok(report.checks.length >= 16);
});

test("returns attention without reading an arbitrary missing workspace", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-apple-native-readiness-"));
  try {
    const report = auditAppleNativeReadiness(temporaryRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "package-manifest-missing"));
    assert.ok(report.findings.some((finding) => finding.code === "apple-strategy-missing"));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("marks a source tree beyond the declared traversal depth as attention", () => {
  const temporaryRoot = createReadyFixture();
  try {
    let nested = path.join(temporaryRoot, "packages/seis_platform_swift/Sources/SeisPlatformKit");
    for (let index = 0; index <= APPLE_NATIVE_READINESS_LIMITS.maxSourceDepth; index += 1) {
      nested = path.join(nested, `nested-${index}`);
    }
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, "Hidden.swift"), "struct Hidden {}\n");

    const report = auditAppleNativeReadiness(temporaryRoot);
    const sourceArea = report.summary.sourceAreas.find((area) => area.id === "platform-kit-sources");

    assert.equal(report.state, "attention");
    assert.equal(sourceArea?.safe, false);
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-depth-limit-exceeded"));
    assert.equal(JSON.stringify(report).includes(temporaryRoot), false);
    assert.equal(JSON.stringify(report).includes("struct Hidden"), false);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("marks a direct Swift source-area symlink as attention without following it", () => {
  const temporaryRoot = createReadyFixture();
  try {
    const sourceArea = path.join(temporaryRoot, "packages/seis_platform_swift/Sources/SeisPlatformKit");
    const symlinkTarget = path.join(temporaryRoot, "untrusted-source-area");
    fs.renameSync(sourceArea, symlinkTarget);
    fs.symlinkSync(symlinkTarget, sourceArea, "dir");

    const report = auditAppleNativeReadiness(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-area-unsafe"));
    assert.equal(JSON.stringify(report).includes(symlinkTarget), false);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("marks oversized strategy text as attention before it is read", () => {
  const temporaryRoot = createReadyFixture();
  try {
    writeFixtureFile(
      temporaryRoot,
      "docs/APPLE_PLATFORM_STRATEGY.md",
      "x".repeat(APPLE_NATIVE_READINESS_LIMITS.maxTextBytes + 1),
    );

    const report = auditAppleNativeReadiness(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.ok(report.findings.some((finding) => finding.code === "apple-strategy-too-large"));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("marks Swift source areas above the declared file limit as attention", () => {
  const temporaryRoot = createReadyFixture();
  try {
    for (let index = 0; index < APPLE_NATIVE_READINESS_LIMITS.maxSwiftFilesPerArea; index += 1) {
      writeFixtureFile(
        temporaryRoot,
        `packages/seis_platform_swift/Sources/SeisPlatformKit/Generated${index}.swift`,
        `struct Generated${index} {}\n`,
      );
    }

    const report = auditAppleNativeReadiness(temporaryRoot);
    const sourceArea = report.summary.sourceAreas.find((area) => area.id === "platform-kit-sources");

    assert.equal(report.state, "attention");
    assert.equal(sourceArea?.safe, false);
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-file-limit-exceeded"));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("marks empty source areas and missing focused tests as attention", () => {
  const temporaryRoot = createReadyFixture();
  try {
    fs.rmSync(path.join(temporaryRoot, "packages/seis_platform_swift/Sources/SeisPlatformKit/Base.swift"));
    fs.rmSync(path.join(temporaryRoot, "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift"));

    const report = auditAppleNativeReadiness(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.ok(report.checks.some((check) => check.id === "platform-kit-sources" && check.state === "attention"));
    assert.ok(report.checks.some((check) => check.id === "test-seisplatformpolicytests" && check.state === "attention"));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("serves bounded MCP responses and refuses an external audit path", () => {
  const toolsResponse = sendMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  const auditResponse = sendMcpRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "seis_apple_native_readiness_audit",
      arguments: { path: "../../.." },
    },
  });

  assert.equal(toolsResponse.result.tools.length, 3);
  assert.equal(auditResponse.result.state, "attention");
  assert.equal(auditResponse.result.findings[0].code, "invalid-audit-path");
  assert.equal(JSON.stringify(auditResponse).includes(repositoryRoot), false);
});

function createReadyFixture() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-apple-native-readiness-"));
  writeFixtureFile(temporaryRoot, "packages/seis_platform_swift/Package.swift", [
    'name: "SeisPlatformKit"',
    ".macOS(.v13)",
    ".iOS(.v16)",
    '.library(name: "SeisPlatformKit"',
    '.executable(name: "SeisAppleNativeShell"',
    '.target(name: "SeisPlatformKit")',
    ".executableTarget(",
    '.testTarget(name: "SeisPlatformKitTests"',
  ].join("\n"));
  writeFixtureFile(temporaryRoot, "docs/APPLE_PLATFORM_STRATEGY.md", [
    "macOS is the primary native Command Center.",
    "iPadOS is the SEIS Brain, review, and creative-planning surface.",
    "iOS is the status, alert, search, and quick-note companion.",
    "Do not add symbolic Swift files",
  ].join("\n"));
  writeFixtureFile(temporaryRoot, "packages/seis_platform_swift/Sources/SeisPlatformKit/Base.swift", "struct Base {}\n");
  writeFixtureFile(temporaryRoot, "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Shell.swift", "struct Shell {}\n");
  writeFixtureFile(temporaryRoot, "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformKitSmokeTests.swift", "struct Smoke {}\n");
  writeFixtureFile(temporaryRoot, "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift", "struct Policy {}\n");
  return temporaryRoot;
}

function writeFixtureFile(root, relativePath, contents) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

function sendMcpRequest(request) {
  const payload = JSON.stringify(request);
  const result = spawnSync(process.execPath, [serverPath], {
    cwd: repositoryRoot,
    encoding: "utf8",
    input: `Content-Length: ${Buffer.byteLength(payload, "utf8")}\r\n\r\n${payload}`,
  });
  assert.equal(result.status, 0, result.stderr);
  const separator = result.stdout.indexOf("\r\n\r\n");
  assert.ok(separator >= 0, result.stdout);
  return JSON.parse(result.stdout.slice(separator + 4));
}
