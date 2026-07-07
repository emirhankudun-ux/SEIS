import { existsSync, readFileSync } from "node:fs";

const files = {
  sequence: "content/development/seis-pr0-pr1-pr2-implementation-sequence.json",
  pr0StagingPathspec: "content/development/seis-pr0-foundation-staging-pathspec.json",
  backlog: "docs/roadmap/MASTER_BACKLOG.md",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  swiftMcpModel: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisMCPPermissionRiskRecord.swift",
  swiftStitchModel: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisStitchModuleFamily.swift",
  swiftTests: "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisFoundationManifestLoadingTests.swift"
};

const failures = [];

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(file) {
  const text = read(file);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`invalid JSON in ${file}: ${error.message}`);
    return {};
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

const sequence = readJson(files.sequence);
const backlog = read(files.backlog);
const nextQueue = read(files.nextQueue);
const swiftMcpModel = read(files.swiftMcpModel);
const swiftStitchModel = read(files.swiftStitchModel);
const swiftTests = read(files.swiftTests);

ensure(sequence.id === "seis-pr0-pr1-pr2-implementation-sequence", "sequence id mismatch");
ensure(sequence.visibility === "public-safe", "sequence must be public-safe");
ensure(sequence.backlogId === "SEIS-BL-051", "sequence must map to SEIS-BL-051");
ensure(sequence.sourceRefs?.pr0StagingPathspec === files.pr0StagingPathspec, "sequence must reference PR0 staging pathspec");
ensure(Array.isArray(sequence.sequence), "sequence must contain sequence array");
ensure(sequence.sequence?.length === 3, "sequence must contain PR0, PR1, and PR2");
ensure(Array.isArray(sequence.pr0AcceptanceOrder), "sequence must define PR0 acceptance order");
ensure(sequence.pr0AcceptanceOrder?.length === 5, "PR0 acceptance order must have five ordered gates");
ensure(sequence.pr0AcceptanceOrder?.at(0)?.commands?.includes("node scripts/check-seis-source-provenance-intake.mjs"), "PR0 acceptance order must start with direct manifest checkers");
ensure(sequence.pr0AcceptanceOrder?.some((gate) => gate.commands?.includes("node scripts/check-seis-pr0-staged-boundary.mjs")), "PR0 acceptance order must include staged boundary checker");
ensure(sequence.pr0AcceptanceOrder?.some((gate) => gate.commands?.includes("npm run check:js")), "PR0 acceptance order must include adjacent npm/js check");
ensure(sequence.pr0AcceptanceOrder?.some((gate) => gate.commands?.includes("node --test packages/seis-ai/test/mcp-smoke.test.mjs")), "PR0 acceptance order must include local MCP smoke");

const entries = new Map((sequence.sequence || []).map((entry) => [entry.id, entry]));
for (const id of [
  "pr0-foundation-manifest-package",
  "pr1-swift-model-foundation",
  "pr2-web-demo-visibility-data-first"
]) {
  ensure(entries.has(id), `missing sequence entry ${id}`);
}

const pr0 = entries.get("pr0-foundation-manifest-package") || {};
const pr1 = entries.get("pr1-swift-model-foundation") || {};
const pr2 = entries.get("pr2-web-demo-visibility-data-first") || {};

ensure(pr0.nonGoals?.includes("Swift source changes"), "PR0 must keep Swift source out of scope");
ensure(pr0.validation?.includes("npm run check:js"), "PR0 validation must include adjacent npm/js check");
ensure(pr0.validation?.includes("node --test packages/seis-ai/test/mcp-smoke.test.mjs"), "PR0 validation must include local MCP smoke");
ensure(pr1.nonGoals?.includes("SwiftUI shell"), "PR1 must exclude SwiftUI shell");
ensure(pr1.nonGoals?.includes("Package.swift edit"), "PR1 must exclude Package.swift edits");
ensure(pr2.nonGoals?.some((goal) => goal.includes("apps/seis-demo-web/script.js") && goal.includes("PR2")), "PR2 must protect the existing web script in PR2 without explicit approval");
ensure(pr2.validation?.includes("no-key/fake-live scan"), "PR2 must include no-key/fake-live scan");

for (const [label, file] of Object.entries(sequence.sourceRefs || {})) {
  ensure(typeof file === "string" && file.length > 0, `sourceRefs.${label} must be a path`);
  ensure(existsSync(file), `sourceRefs.${label} path missing: ${file}`);
}

ensure(backlog.includes("SEIS-BL-051"), "MASTER_BACKLOG must include SEIS-BL-051");
ensure(backlog.includes("seis-pr0-pr1-pr2-implementation-sequence.json"), "MASTER_BACKLOG must reference sequence JSON");
ensure(nextQueue.includes("Current PR0/PR1/PR2 Foundation Sequence"), "NEXT_PR_QUEUE must expose current PR0/PR1/PR2 sequence");
ensure(nextQueue.includes("pr0-foundation-manifest-package"), "NEXT_PR_QUEUE must mention PR0 sequence id");
ensure(nextQueue.includes("pr1-swift-model-foundation"), "NEXT_PR_QUEUE must mention PR1 sequence id");
ensure(nextQueue.includes("pr2-web-demo-visibility-data-first"), "NEXT_PR_QUEUE must mention PR2 sequence id");

ensure(swiftMcpModel.includes("public struct SeisMCPPermissionRiskRecord"), "Swift MCP risk model missing");
ensure(swiftMcpModel.includes("SeisMCPRequirementValue"), "Swift MCP mixed requirement value missing");
ensure(swiftStitchModel.includes("public struct SeisStitchModuleFamily"), "Swift Stitch module model missing");
ensure(swiftTests.includes("mcpPermissionRiskRecordsLoadFromPublicSafeManifest"), "Swift MCP fixture test missing");
ensure(swiftTests.includes("stitchModuleFamiliesLoadFromPublicSafeCatalog"), "Swift Stitch fixture test missing");

const serialized = JSON.stringify(sequence);
ensure(!serialized.includes("/Users/"), "sequence must not contain machine-local /Users paths");
ensure(!serialized.includes("BEGIN PRIVATE KEY"), "sequence must not contain private key blocks");
ensure(!/sk-[A-Za-z0-9_-]{16,}/.test(serialized), "sequence must not contain provider API key-shaped values");

if (failures.length > 0) {
  console.error("SEIS PR0/PR1/PR2 implementation sequence check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS PR0/PR1/PR2 implementation sequence check passed.");
