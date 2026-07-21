import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  SWIFT_PACKAGE_TOPOLOGY_ID,
  SWIFT_PACKAGE_TOPOLOGY_LIMITS,
  auditSwiftPackageTopology,
} from "../seis-swift-package-topology/runtime/swift-package-topology.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../..");
const serverPath = path.join(repositoryRoot, "plugins/seis-core/seis-swift-package-topology/scripts/seis-swift-package-topology-mcp-server.mjs");

test("reports bounded declared Swift Package topology for the checked-in manifest", () => {
  const report = auditSwiftPackageTopology(repositoryRoot);

  assert.equal(report.plugin, SWIFT_PACKAGE_TOPOLOGY_ID);
  assert.equal(report.state, "ready");
  assert.equal(report.ok, true);
  assert.equal(report.classification, "bounded-static-swift-package-manifest-topology");
  assert.equal(report.summary.manifestReadable, true);
  assert.deepEqual(report.topology.platforms, [
    { name: "iOS", version: "v16" },
    { name: "macOS", version: "v13" },
  ]);
  assert.deepEqual(report.topology.products, [
    { kind: "executable", name: "SeisAppleNativeShell", targets: ["SeisAppleNativeShell"] },
    { kind: "library", name: "SeisPlatformKit", targets: ["SeisPlatformKit"] },
  ]);
  assert.deepEqual(report.topology.targets, [
    { kind: "executable-target", name: "SeisAppleNativeShell" },
    { kind: "target", name: "SeisPlatformKit" },
    { kind: "test-target", name: "SeisPlatformKitTests" },
  ]);
  assert.deepEqual(report.topology.targetDependencies, [{ from: "SeisAppleNativeShell", to: "SeisPlatformKit" }]);
  assert.deepEqual(report.topology.testTargetDependencies, [{ from: "SeisPlatformKitTests", to: "SeisPlatformKit" }]);
  assert.deepEqual(report.topology.executableResources, [
    { target: "SeisAppleNativeShell", resource: "Resources/seis-demo-contract.json" },
    { target: "SeisAppleNativeShell", resource: "Resources/seisdemo-urlscheme-template.plist" },
  ]);
  assert.equal(report.permissions.write.length, 0);
  assert.equal(report.permissions.network.length, 0);
  assert.equal(report.permissions.secrets.length, 0);
  assert.equal(report.safety.compilesSwift, false);
  assert.equal(report.safety.runsSwiftTests, false);
  assert.equal(report.outputBoundary.rawManifestReturned, false);
  assert.equal(report.outputBoundary.absolutePathsReturned, false);
  assert.equal(JSON.stringify(report).includes(repositoryRoot), false);
});

test("keeps deterministic target, dependency, test-target, and resource ordering", () => {
  const temporaryRoot = createFixture();
  try {
    const report = auditSwiftPackageTopology(temporaryRoot);
    assert.equal(report.state, "ready");
    assert.deepEqual(report.topology.products.map((product) => product.name), ["App", "Core"]);
    assert.deepEqual(report.topology.targets.map((target) => target.name), ["App", "Core", "CoreTests"]);
    assert.deepEqual(report.topology.targetDependencies, [{ from: "App", to: "Core" }]);
    assert.deepEqual(report.topology.testTargetDependencies, [{ from: "CoreTests", to: "Core" }]);
    assert.deepEqual(report.topology.executableResources, [
      { target: "App", resource: "Resources/a.json" },
      { target: "App", resource: "Resources/z.json" },
    ]);
  } finally {
    removeFixture(temporaryRoot);
  }
});

test("reports a missing fixed manifest without exposing the fixture path", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-swift-package-topology-"));
  try {
    const report = auditSwiftPackageTopology(temporaryRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "manifest-missing"));
    assert.equal(JSON.stringify(report).includes(temporaryRoot), false);
  } finally {
    removeFixture(temporaryRoot);
  }
});

test("refuses an oversized fixed manifest before reading it", () => {
  const temporaryRoot = createFixture("x".repeat(SWIFT_PACKAGE_TOPOLOGY_LIMITS.maxManifestBytes + 1));
  try {
    const report = auditSwiftPackageTopology(temporaryRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "manifest-byte-limit-exceeded"));
    assert.equal(JSON.stringify(report).includes("x".repeat(32)), false);
  } finally {
    removeFixture(temporaryRoot);
  }
});

test("refuses a direct fixed-manifest symlink without following it", () => {
  const temporaryRoot = createFixture();
  try {
    const manifestPath = fixedManifestPath(temporaryRoot);
    const unsafeTarget = path.join(temporaryRoot, "untrusted-manifest.swift");
    fs.renameSync(manifestPath, unsafeTarget);
    fs.symlinkSync(unsafeTarget, manifestPath, "file");

    const report = auditSwiftPackageTopology(temporaryRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "manifest-not-regular-file"));
    assert.equal(JSON.stringify(report).includes(unsafeTarget), false);
  } finally {
    removeFixture(temporaryRoot);
  }
});

test("treats an unsupported platform as attention instead of inferring a topology", () => {
  const temporaryRoot = createFixture(validManifest().replace(".iOS(.v16)", ".tvOS(.v17)"));
  try {
    const report = auditSwiftPackageTopology(temporaryRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "unsupported-platform-declaration"));
    assert.equal(report.summary.topologyAvailable, false);
    assert.equal(report.topology.products.length, 0);
  } finally {
    removeFixture(temporaryRoot);
  }
});

test("treats malformed product and target declarations as attention without raw manifest echo", () => {
  const temporaryRoot = createFixture(validManifest()
    .replace('targets: ["Core"]', "targets: [fixture_unquoted_product_marker]")
    .replace('.target(name: "Core")', '.target(name: "Core", unsupported: "fixture-raw-target-marker")'));
  try {
    const report = auditSwiftPackageTopology(temporaryRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "malformed-product-declaration"));
    assert.ok(report.findings.some((finding) => finding.code === "malformed-target-declaration"));
    assert.equal(JSON.stringify(report).includes("fixture_unquoted_product_marker"), false);
    assert.equal(JSON.stringify(report).includes("fixture-raw-target-marker"), false);
  } finally {
    removeFixture(temporaryRoot);
  }
});

test("treats unsupported dependency syntax as attention without guessed edges", () => {
  const temporaryRoot = createFixture(validManifest().replace('dependencies: ["Core"]', 'dependencies: [.product(name: "Remote")]'));
  try {
    const report = auditSwiftPackageTopology(temporaryRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "unsupported-target-dependency-syntax"));
    assert.equal(report.topology.targetDependencies.length, 0);
  } finally {
    removeFixture(temporaryRoot);
  }
});

test("treats malformed resource declarations as attention without raw manifest echo", () => {
  const temporaryRoot = createFixture(validManifest().replace('.copy("Resources/z.json")', '.copy("Resources/../fixture-raw-resource-marker")'));
  try {
    const report = auditSwiftPackageTopology(temporaryRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "malformed-resource-declaration"));
    assert.equal(JSON.stringify(report).includes("fixture-raw-resource-marker"), false);
  } finally {
    removeFixture(temporaryRoot);
  }
});

test("redacts machine paths and credential-assignment markers from bounded output", () => {
  const temporaryRoot = createFixture(validManifest() + '\n// /Users/example/fixture-machine-path\nlet api_key = "fixture-secret-value"\n');
  try {
    const report = auditSwiftPackageTopology(temporaryRoot);
    assert.equal(report.state, "attention");
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === "machine-path-marker-redacted"));
    assert.ok(report.findings.some((finding) => finding.code === "credential-assignment-marker-found"));
    assert.equal(JSON.stringify(report).includes("fixture-machine-path"), false);
    assert.equal(JSON.stringify(report).includes("fixture-secret-value"), false);
  } finally {
    removeFixture(temporaryRoot);
  }
});

test("MCP exposes only bounded tools and refuses arbitrary or outside-workspace paths", () => {
  const toolsResponse = sendMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  const auditResponse = sendMcpRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "seis_swift_package_topology_audit",
      arguments: { path: "../../outside-workspace" },
    },
  });

  assert.equal(toolsResponse.result.tools.length, 3);
  assert.equal(auditResponse.result.state, "attention");
  assert.equal(auditResponse.result.ok, false);
  assert.equal(auditResponse.result.findings[0].code, "invalid-audit-path");
  assert.equal(JSON.stringify(auditResponse).includes(repositoryRoot), false);
});

test("status remains non-mutating and does not install packages", () => {
  const manifestPath = path.join(repositoryRoot, "packages/seis_platform_swift/Package.swift");
  const before = fs.readFileSync(manifestPath, "utf8");
  const result = spawnSync(process.execPath, [serverPath, "--status"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  const status = JSON.parse(result.stdout);
  assert.equal(status.status, "ready");
  assert.equal(status.safety.installsPlugins, false);
  assert.equal(status.safety.compilesSwift, false);
  assert.equal(fs.readFileSync(manifestPath, "utf8"), before);
});

function validManifest() {
  return `// swift-tools-version: 6.0
import PackageDescription
let package = Package(
  name: "Fixture",
  platforms: [.macOS(.v13), .iOS(.v16)],
  products: [
    .library(name: "Core", targets: ["Core"]),
    .executable(name: "App", targets: ["App"])
  ],
  targets: [
    .target(name: "Core"),
    .executableTarget(
      name: "App",
      dependencies: ["Core"],
      resources: [.copy("Resources/z.json"), .copy("Resources/a.json")]
    ),
    .testTarget(name: "CoreTests", dependencies: ["Core"])
  ]
)
`;
}

function createFixture(contents = validManifest()) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "seis-swift-package-topology-"));
  const manifestPath = fixedManifestPath(temporaryRoot);
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, contents);
  return temporaryRoot;
}

function fixedManifestPath(root) {
  return path.join(root, "packages/seis_platform_swift/Package.swift");
}

function removeFixture(root) {
  if (root && fs.existsSync(root)) fs.rmSync(root, { recursive: true, force: true });
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
