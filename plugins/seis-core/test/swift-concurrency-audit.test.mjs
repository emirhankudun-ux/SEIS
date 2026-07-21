import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  SWIFT_CONCURRENCY_AUDIT_ID,
  SWIFT_CONCURRENCY_AUDIT_LIMITS,
  auditSwiftConcurrency,
} from "../seis-swift-concurrency-audit/runtime/swift-concurrency-audit.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const serverPath = path.join(repositoryRoot, "plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs");

test("reports bounded static Swift concurrency signals for checked-in SEIS source", () => {
  const report = auditSwiftConcurrency(repositoryRoot);

  assert.equal(report.plugin, SWIFT_CONCURRENCY_AUDIT_ID);
  assert.equal(report.state, "attention");
  assert.equal(report.ok, true);
  assert.equal(report.classification, "bounded-static-concurrency-signals-only");
  assert.equal(report.permissions.write.length, 0);
  assert.equal(report.permissions.network.length, 0);
  assert.equal(report.permissions.secrets.length, 0);
  assert.equal(report.summary.scannedSwiftFileCount, 30);
  assert.equal(report.summary.signalCounts.uncheckedSendable, 3);
  assert.equal(report.summary.signalCounts.mainActor, 8);
  assert.equal(report.summary.signalCounts.sendableDeclaration, 55);
  assert.equal(report.summary.signalCounts.taskDetached, 0);
  assert.equal(report.summary.signalCounts.taskMainActor, 4);
  assert.equal(report.summary.signalCounts.dispatchQueue, 2);
  assert.equal(report.summary.signalCounts.await, 12);
  assert.equal(report.outputBoundary.rawSourceReturned, false);
  assert.equal(report.outputBoundary.rawMatchedValuesReturned, false);
  assert.equal(report.outputBoundary.absolutePathsReturned, false);
  assert.ok(report.findings.some((finding) => finding.code === "unchecked-sendable-review-required"));
  assert.equal(JSON.stringify(report).includes(repositoryRoot), false);
});

test("uses attention for unchecked Sendable review without claiming a blocking compiler failure", () => {
  const temporaryRoot = createReadyFixture();
  try {
    writeFixtureFile(
      temporaryRoot,
      "packages/seis_platform_swift/Sources/SeisPlatformKit/Unchecked.swift",
      "final class Marker: @unchecked Sendable { let value = 1 }\n// fixture-raw-source-marker\n",
    );

    const report = auditSwiftConcurrency(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.equal(report.ok, true);
    assert.equal(report.signals.uncheckedSendable.count, 1);
    assert.equal(report.signals.uncheckedSendable.relativePaths.length, 1);
    assert.ok(report.findings.some((finding) => finding.code === "unchecked-sendable-review-required"));
    assert.equal(JSON.stringify(report).includes(temporaryRoot), false);
    assert.equal(JSON.stringify(report).includes("fixture-raw-source-marker"), false);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("returns blocking attention for missing fixed source roots without exposing the fixture path", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-swift-concurrency-audit-"));
  try {
    const report = auditSwiftConcurrency(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-area-missing"));
    assert.equal(JSON.stringify(report).includes(temporaryRoot), false);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("returns blocking attention for an empty fixed Swift source area", () => {
  const temporaryRoot = createReadyFixture();
  try {
    fs.rmSync(path.join(temporaryRoot, "packages/seis_platform_swift/Sources/SeisPlatformKit/Base.swift"));

    const report = auditSwiftConcurrency(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-area-empty"));
    assert.equal(JSON.stringify(report).includes(temporaryRoot), false);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("refuses source trees beyond the declared depth without returning raw source", () => {
  const temporaryRoot = createReadyFixture();
  try {
    let nested = path.join(temporaryRoot, "packages/seis_platform_swift/Sources/SeisPlatformKit");
    for (let index = 0; index <= SWIFT_CONCURRENCY_AUDIT_LIMITS.maxSourceDepth; index += 1) {
      nested = path.join(nested, `nested-${index}`);
    }
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, "TooDeep.swift"), "// hidden-concurrency-source\n");

    const report = auditSwiftConcurrency(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-depth-limit-exceeded"));
    assert.equal(JSON.stringify(report).includes("hidden-concurrency-source"), false);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("refuses a direct source-area symlink without following it", () => {
  const temporaryRoot = createReadyFixture();
  try {
    const sourceArea = path.join(temporaryRoot, "packages/seis_platform_swift/Sources/SeisPlatformKit");
    const symlinkTarget = path.join(temporaryRoot, "untrusted-source-area");
    fs.renameSync(sourceArea, symlinkTarget);
    fs.symlinkSync(symlinkTarget, sourceArea, "dir");

    const report = auditSwiftConcurrency(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-area-unsafe"));
    assert.equal(JSON.stringify(report).includes(symlinkTarget), false);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("refuses oversized Swift source before reading it", () => {
  const temporaryRoot = createReadyFixture();
  try {
    writeFixtureFile(
      temporaryRoot,
      "packages/seis_platform_swift/Sources/SeisPlatformKit/Oversized.swift",
      "x".repeat(SWIFT_CONCURRENCY_AUDIT_LIMITS.maxFileBytes + 1),
    );

    const report = auditSwiftConcurrency(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-file-size-limit-exceeded"));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("refuses Swift source file counts above the declared limit", () => {
  const temporaryRoot = createReadyFixture();
  try {
    for (let index = 0; index < SWIFT_CONCURRENCY_AUDIT_LIMITS.maxSwiftFiles; index += 1) {
      writeFixtureFile(
        temporaryRoot,
        `packages/seis_platform_swift/Sources/SeisPlatformKit/Generated${index}.swift`,
        `struct Generated${index} {}\n`,
      );
    }

    const report = auditSwiftConcurrency(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-file-limit-exceeded"));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("refuses aggregate Swift source bytes above the declared limit", () => {
  const temporaryRoot = createReadyFixture();
  try {
    const safeFileSize = SWIFT_CONCURRENCY_AUDIT_LIMITS.maxFileBytes - 32;
    for (let index = 0; index < 9; index += 1) {
      writeFixtureFile(
        temporaryRoot,
        `packages/seis_platform_swift/Sources/SeisPlatformKit/Bounded${index}.swift`,
        "x".repeat(safeFileSize),
      );
    }

    const report = auditSwiftConcurrency(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "swift-source-total-byte-limit-exceeded"));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("refuses an exact credential-assignment marker without returning its value", () => {
  const temporaryRoot = createReadyFixture();
  try {
    writeFixtureFile(
      temporaryRoot,
      "packages/seis_platform_swift/Sources/SeisPlatformKit/Credential.swift",
      "let api_key = \"fixture-secret-value\"\n",
    );

    const report = auditSwiftConcurrency(temporaryRoot);

    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "credential-assignment-marker-found"));
    assert.equal(JSON.stringify(report).includes("fixture-secret-value"), false);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("serves bounded MCP responses and refuses an arbitrary audit path", () => {
  const toolsResponse = sendMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  const auditResponse = sendMcpRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "seis_swift_concurrency_audit",
      arguments: { path: "../../.." },
    },
  });

  assert.equal(toolsResponse.result.tools.length, 3);
  assert.equal(auditResponse.result.state, "attention");
  assert.equal(auditResponse.result.ok, false);
  assert.equal(auditResponse.result.findings[0].code, "invalid-audit-path");
  assert.equal(JSON.stringify(auditResponse).includes(repositoryRoot), false);
});

function createReadyFixture() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-swift-concurrency-audit-"));
  writeFixtureFile(temporaryRoot, "packages/seis_platform_swift/Sources/SeisPlatformKit/Base.swift", "@MainActor final class Base {}\n");
  writeFixtureFile(temporaryRoot, "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Shell.swift", "struct Shell { func run() async { await ready() } }\n");
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
