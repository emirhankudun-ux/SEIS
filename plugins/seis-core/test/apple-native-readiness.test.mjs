import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { APPLE_NATIVE_READINESS_ID, auditAppleNativeReadiness } from "../seis-apple-native-readiness/runtime/apple-native-readiness.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");

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
