import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const manifestPath = "content/development/seis-swift-apple-bridge-manifest.json";
const packagePath = "packages/seis_platform_swift/Package.swift";

const requiredSourceFiles = [
  "AGENTS.md",
  packagePath,
  "packages/seis_platform_swift/README.md",
  "content/development/seis-five-year-agency-orchestration-contract.json",
  "content/development/seis-source-provenance-intake.json",
  "content/development/seis-mcp-permission-risk-matrix.json",
  "content/development/seis-stitch-ux-screen-catalog.json"
];

const requiredSwiftModels = [
  "SeisAgencyOrchestrationContract",
  "SeisMCPPermissionRiskRecord",
  "SeisStitchModuleFamily",
  "SeisSourceProvenanceArchive",
  "SeisAgentRunRound",
  "SeisAppleShellModule"
];

const requiredPanels = [
  "agency-command-center-panel",
  "agent-swarm-ledger-panel",
  "mcp-risk-panel",
  "stitch-module-gallery-panel",
  "ai-core-boundary-panel"
];

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readText(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function ensureArray(value, message) {
  ensure(Array.isArray(value), message);
  return Array.isArray(value) ? value : [];
}

function ensureIncludesAll(actualValues, expectedValues, label) {
  const actualSet = new Set(actualValues);
  for (const expected of expectedValues) {
    ensure(actualSet.has(expected), `${label} missing ${expected}`);
  }
}

const manifestText = readText(manifestPath);
ensure(!/\/Users\/[A-Za-z0-9._ -]+/.test(manifestText), "Manifest must not contain machine-local /Users paths.");
ensure(!/(^|[\s"'])~\/[A-Za-z0-9._/-]+/m.test(manifestText), "Manifest must not contain home-directory shorthand paths.");
ensure(!/(sk-[A-Za-z0-9_-]{16,}|BEGIN [A-Z ]*PRIVATE KEY)/.test(manifestText), "Manifest must not contain secret-like values.");

const manifest = readJson(manifestPath);
const packageText = readText(packagePath);

if (manifest) {
  ensure(manifest.id === "seis-swift-apple-bridge-manifest", "Manifest id must be stable.");
  ensure(manifest.status === "draft-public-safe", "Manifest status must be draft-public-safe.");
  ensure(manifest.visibility === "public-safe", "Manifest visibility must be public-safe.");

  const sourceFiles = Object.values(manifest.sourceOfTruth ?? {});
  ensureIncludesAll(sourceFiles, requiredSourceFiles, "sourceOfTruth");
  for (const relativePath of requiredSourceFiles) {
    ensure(fs.existsSync(path.join(repoRoot, relativePath)), `Source-of-truth file does not exist: ${relativePath}`);
  }

  const snapshot = manifest.swiftPackageSnapshot ?? {};
  ensure(snapshot.packageRelativePath === "packages/seis_platform_swift", "Swift package path must remain stable.");
  ensure(snapshot.packageName === "SeisPlatformKit", "Swift package name must be SeisPlatformKit.");
  ensureIncludesAll(snapshot.platforms ?? [], ["macOS v13", "iOS v16"], "swiftPackageSnapshot.platforms");
  ensureIncludesAll(snapshot.products ?? [], ["SeisPlatformKit", "SeisAppleNativeShell"], "swiftPackageSnapshot.products");
  ensureIncludesAll(snapshot.targets ?? [], ["SeisPlatformKit", "SeisAppleNativeShell", "SeisPlatformKitTests"], "swiftPackageSnapshot.targets");
  ensure(snapshot.currentSliceTouchesSwiftSource === false, "This slice must not touch Swift source.");
  ensure(snapshot.swiftCheckRequiredForThisSlice === false, "Swift checks must not be required for this manifest-only slice.");
  ensure(snapshot.swiftCheckRequiredWhenSwiftChanges === true, "Swift checks must be required when Swift changes.");

  const principles = ensureArray(manifest.bridgePrinciples, "bridgePrinciples must be an array.");
  ensure(principles.length >= 7, "Bridge must include practical principles.");
  ensure(principles.some((principle) => principle.includes("real architectural value")), "Bridge must block symbolic Swift files.");
  ensure(principles.some((principle) => principle.includes("demo/live boundaries")), "Bridge must preserve AI demo/live boundaries.");

  const models = ensureArray(manifest.proposedSwiftModels, "proposedSwiftModels must be an array.");
  ensureIncludesAll(models.map((model) => model.id), requiredSwiftModels, "proposedSwiftModels");
  for (const model of models) {
    ensure(model.status === "planned", `Model ${model.id} must remain planned in this slice.`);
    ensure(model.codable === true, `Model ${model.id} must be Codable-ready.`);
    ensure(["SeisPlatformKit", "SeisAppleNativeShell"].includes(model.target), `Model ${model.id} must target a known Swift target.`);
    ensure(Array.isArray(model.requiredTests) && model.requiredTests.length >= 2, `Model ${model.id} must define required tests.`);
  }

  const panels = ensureArray(manifest.swiftuiShellQueue, "swiftuiShellQueue must be an array.");
  ensureIncludesAll(panels.map((panel) => panel.id), requiredPanels, "swiftuiShellQueue");
  for (const panel of panels) {
    ensure(panel.status === "planned", `Panel ${panel.id} must remain planned in this slice.`);
    ensure(panel.target === "SeisAppleNativeShell", `Panel ${panel.id} must target SeisAppleNativeShell.`);
    ensure(typeof panel.accessibilityRequirement === "string" && panel.accessibilityRequirement.length > 0, `Panel ${panel.id} must define accessibility requirement.`);
    ensure(typeof panel.demoBoundary === "string" && panel.demoBoundary.length > 0, `Panel ${panel.id} must define demo boundary.`);
  }

  const stages = ensureArray(manifest.implementationStages, "implementationStages must be an array.");
  ensureIncludesAll(stages.map((stage) => stage.id), ["manifest-only", "swift-models", "swiftui-shell-panels", "native-demo-routing"], "implementationStages");
  ensure(stages.find((stage) => stage.id === "manifest-only")?.status === "active", "Manifest-only stage must be active.");

  ensure(manifest.validation?.directChecker === "node scripts/check-seis-swift-apple-bridge-manifest.mjs", "Validation must name the direct checker.");
  ensure(manifest.validation?.swiftDescribeCommand === "swift package describe --package-path packages/seis_platform_swift", "Validation must name swift package describe.");
  ensure(manifest.validation?.swiftTestCommand === "swift test --package-path packages/seis_platform_swift", "Validation must name swift test.");
  ensure(manifest.validation?.swiftChecksRequiredNow === false, "Swift checks are not required now because no Swift source changed.");
  ensure(Array.isArray(manifest.validation?.swiftChecksRequiredWhen) && manifest.validation.swiftChecksRequiredWhen.length >= 4, "Validation must define when Swift checks are required.");

  const qualityGates = ensureArray(manifest.qualityGates, "qualityGates must be an array.");
  ensure(qualityGates.length >= 8, "Manifest must include practical quality gates.");
  ensure(qualityGates.some((gate) => gate.includes("No Swift source is touched")), "Quality gates must state no Swift source is touched.");
  ensure(qualityGates.some((gate) => gate.includes("No symbolic Swift files")), "Quality gates must block symbolic Swift files.");
  ensure(qualityGates.some((gate) => gate.includes("web demo remains no-key")), "Quality gates must preserve no-key web demo.");
}

ensure(packageText.includes("swift-tools-version: 6.0"), "Package.swift must use Swift tools 6.0.");
ensure(packageText.includes("name: \"SeisPlatformKit\""), "Package.swift must name SeisPlatformKit.");
ensure(packageText.includes(".macOS(.v13)"), "Package.swift must declare macOS v13.");
ensure(packageText.includes(".iOS(.v16)"), "Package.swift must declare iOS v16.");
ensure(packageText.includes(".library(name: \"SeisPlatformKit\""), "Package.swift must expose SeisPlatformKit library.");
ensure(packageText.includes(".executable(name: \"SeisAppleNativeShell\""), "Package.swift must expose SeisAppleNativeShell executable.");
ensure(packageText.includes(".testTarget(name: \"SeisPlatformKitTests\""), "Package.swift must expose SeisPlatformKitTests.");

if (failures.length > 0) {
  console.error("SEIS Swift Apple bridge manifest check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS Swift Apple bridge manifest check passed.");
