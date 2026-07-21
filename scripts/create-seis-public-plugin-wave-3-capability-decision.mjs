#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-3-capability-decision.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const WAVE_2_HANDOFF_PATH = "content/development/seis-public-plugin-wave-2-handoff.json";
const WAVE_3_PROGRAM_PATH = "content/development/seis-public-plugin-wave-3-program.json";
const CANDIDATE_ID = "seis-swift-concurrency-audit";
const SOURCE_ROOTS = Object.freeze([
  "packages/seis_platform_swift/Sources/SeisPlatformKit",
  "packages/seis_platform_swift/Sources/SeisAppleNativeShell",
]);
const LIMITS = Object.freeze({
  maxSwiftFiles: 64,
  maxFileBytes: 128 * 1024,
  maxTotalBytes: 1024 * 1024,
  maxRelativeDepth: 4,
  maxReportedPaths: 24,
});
const SIGNALS = Object.freeze({
  uncheckedSendable: /@unchecked\s+Sendable/g,
  mainActor: /@MainActor\b/g,
  actorDeclaration: /\bactor\s+[A-Za-z_][A-Za-z0-9_]*/g,
  sendableDeclaration: /\bSendable\b/g,
  taskDetached: /\bTask\s*\.\s*detached\b/g,
  taskMainActor: /\bTask\s*\{\s*@MainActor\b/g,
  dispatchQueue: /\bDispatchQueue\b/g,
  await: /\bawait\b/g,
});
const MACHINE_PATH_PATTERN = /(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m;
const CREDENTIAL_ASSIGNMENT_PATTERN = /\b(?:api[_-]?key|access[_-]?token|auth(?:entication)?[_-]?token|password|secret)\b\s*[:=]\s*["'][^"'\r\n]+["']/gi;

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-plugin-wave-3-capability-decision`);
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 3 capability decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for the bounded ${CANDIDATE_ID} repository-local implementation.`);
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const wave2Handoff = readJson(WAVE_2_HANDOFF_PATH);
  const wave3Program = readJson(WAVE_3_PROGRAM_PATH);
  const sourceEntries = list(sourceManifest.plugins);
  const marketplaceEntries = list(marketplace.plugins);
  const sourceCandidate = sourceEntries.find((entry) => entry?.name === CANDIDATE_ID) || null;
  const marketplaceCandidate = marketplaceEntries.find((entry) => entry?.name === CANDIDATE_ID) || null;
  const sourceSnapshot = collectSourceSnapshot();

  const record = {
    schemaVersion: 1,
    id: "seis-public-plugin-wave-3-capability-decision",
    goalId: "SEIS-GOAL-021",
    backlogId: "SEIS-BL-021",
    generatedAt: "2026-07-21",
    status: "approved-public-local-implementation",
    wave: 3,
    purpose: "Record the one non-duplicative, bounded, public-only Swift concurrency audit package and SEIS Repo card now implemented through repository-local evidence. This remains static-only and does not claim an external installation, provider, deployment, native runtime, or public release.",
    decision: {
      selectedCapability: CANDIDATE_ID,
      displayName: "SEIS Swift Concurrency Audit",
      implementationStarted: true,
      additionalPublicCardAdded: true,
      selectionReason: "The existing public Apple Native Readiness package verifies declared Swift Package, source/test-presence, and platform-strategy evidence, but deliberately does not inspect concurrency annotations or static risk signals. A focused concurrency audit can provide a distinct, bounded review of checked-in Swift source markers without compiling, running, or claiming concurrency correctness.",
      implementationGate: "The Wave 3 program is active because a focused package contract, deny-by-default runtime, deterministic fixtures, structural validation, and the public SEIS Repo card now exist. Full repository-local regression, provenance, lifecycle, fresh-task, and handoff evidence remain required before any Wave 3 completion or release claim.",
      overlapReview: [
        {
          plugin: "seis-apple-native-readiness",
          decision: "retain",
          reason: "It owns Swift Package and Apple platform static readiness, not concurrency annotation or actor-isolation signal review.",
        },
        {
          plugin: "seis-workspace-inspector",
          decision: "retain",
          reason: "It inventories workspace metadata and does not provide a bounded Swift concurrency signal analysis.",
        },
        {
          plugin: "seis-technology-ontology",
          decision: "retain",
          reason: "It classifies declared technologies rather than evaluating source-level concurrency markers.",
        },
        {
          plugin: "seis-source-provenance",
          decision: "retain",
          reason: "It records source provenance and hashes without classifying Swift concurrency signals.",
        },
      ],
    },
    scope: {
      repositories: ["SEIS"],
      sourceInputs: SOURCE_ROOTS,
      dataClassification: "public-checked-in-Swift-source-metadata-and-derived-static-signals",
      outcome: "Provide a bounded static-only concurrency signal review using aggregate counts and capped repository-relative filenames, never raw source content.",
    },
    nonGoals: [
      "Compiling, testing, building, running, signing, provisioning, deploying, or releasing a Swift package or native application.",
      "Claiming actor isolation, Sendable conformance, data-race freedom, runtime correctness, simulator/device behavior, or a completed SwiftPM test result.",
      "Reading arbitrary workspace paths, following symlinks, returning raw source, machine paths, private context, or credential-like values.",
      "Reading or mutating a personal marketplace, making network calls, writing external state, or adding a card merely to increase counts.",
    ],
    acceptanceCriteria: [
      "The package uses only the fixed source roots and rejects arbitrary paths and symlinks.",
      "The package enforces file-count, file-size, total-byte, depth, and output-path limits.",
      "Its output distinguishes static attention signals from a concurrency-correctness claim and excludes raw source.",
      "Its write, network, and secret permissions remain empty.",
      "The public SEIS Repo card is reconciled with focused tests, plugin validation, metadata generation, and current repository-local evidence.",
    ],
    implementation: {
      sourcePath: sourceCandidate?.sourcePath || null,
      marketplaceSourcePath: marketplaceCandidate?.source?.path || null,
      packageExists: sourceCandidate !== null,
      publicCardExists: marketplaceCandidate !== null,
      implementationStarted: true,
      additionalPublicCardAdded: true,
    },
    preconditions: {
      wave2HandoffId: wave2Handoff.id || null,
      wave2HandoffStatus: wave2Handoff.status || null,
      wave3ProgramId: wave3Program.id || null,
      wave3ProgramStatus: wave3Program.status || null,
      wave3ProgramSelectionStatus: wave3Program.selection?.status || null,
      wave3ProgramSelectedCapability: wave3Program.selection?.selectedCapability ?? null,
    },
    publicDistribution: {
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      publicAudience: "everyone",
      applicationPluginCount: sourceEntries.length,
      expectedApplicationPluginCount: APP_PLUGIN_EXPANSION_TARGET,
      publicCardCount: marketplaceEntries.length,
      expectedPublicCardCount: APP_PLUGIN_EXPANSION_TARGET + 306,
      additionalPublicCardAdded: true,
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      publicReleaseAllowed: false,
    },
    staticEvidence: sourceSnapshot,
    publicBoundary: {
      marketplaceName: marketplace.name || null,
      marketplaceDisplayName: marketplace.interface?.displayName || null,
      publicAudience: "everyone",
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      publicReleaseAllowed: false,
      sourceCodeExecuted: false,
      compilerInvoked: false,
      nativeRuntimeStarted: false,
    },
    validation: [
      "npm run check:seis-public-plugin-wave-3-program",
      "npm run check:seis-public-plugin-wave-3-capability-decision",
      "node --test plugins/seis-core/test/public-plugin-wave-3-capability-decision.test.mjs",
      "npm run check:seis-repo-marketplace",
      "npm run check:seis-agent-plugin-integration",
    ],
    risks: [
      {
        id: "RISK-W3-001",
        status: "tracked",
        description: "Static annotations and keyword counts can be mistaken for compiler or runtime concurrency verification.",
        mitigation: "Label every result static-only, preserve no-build/no-runtime claims, and require a separately controlled execution record for any future runtime assertion.",
      },
      {
        id: "RISK-W3-002",
        status: "tracked",
        description: "A broad source scan could expose source text or machine-specific information.",
        mitigation: "Use fixed relative roots, refuse symlinks and bounds violations, emit aggregate counts and capped relative paths only, and do not serialize source text or raw matches.",
      },
      {
        id: "RISK-W3-003",
        status: "tracked",
        description: "The public marketplace could gain a duplicate or premature card.",
        mitigation: "Keep the selected package singular, retain its overlap review, and require focused and broad repository-local validation before Wave 3 handoff or any external release decision.",
      },
    ],
    rollback: {
      strategy: "revert",
      scope: "Revert the focused Wave 3 package, its SEIS Repo card, generated evidence, decision, tests, and documentation on the feature branch. It creates no external state or data migration.",
      dataMigrationRequired: false,
    },
  };
  validateRecord(record);
  return record;
}

function collectSourceSnapshot() {
  const signals = Object.fromEntries(Object.keys(SIGNALS).map((name) => [name, { count: 0, relativePaths: [] }]));
  const relativePathSets = Object.fromEntries(Object.keys(SIGNALS).map((name) => [name, new Set()]));
  const snapshot = {
    classification: "bounded-static-concurrency-signals-only",
    state: "bounded-static-signals-collected",
    sourceRoots: SOURCE_ROOTS,
    limits: LIMITS,
    rootCount: SOURCE_ROOTS.length,
    discoveredSwiftFileCount: 0,
    scannedSwiftFileCount: 0,
    boundedSwiftByteCount: 0,
    maxFileBytesObserved: 0,
    maxRelativeDepthObserved: 0,
    symlinkCount: 0,
    fileLimitExceeded: false,
    fileSizeLimitExceeded: false,
    totalByteLimitExceeded: false,
    depthLimitExceeded: false,
    unreadableFileCount: 0,
    machineSpecificPathFindingCount: 0,
    credentialAssignmentFindingCount: 0,
    rawSourceReturned: false,
    sourceFilesCompiled: false,
    roots: [],
    signals,
  };

  for (const rootRelativePath of SOURCE_ROOTS) {
    const rootPath = repositoryPath(rootRelativePath);
    const rootStat = fs.lstatSync(rootPath);
    assert(rootStat.isDirectory() && !rootStat.isSymbolicLink(), `${rootRelativePath} must be a real directory`);
    const rootRecord = { relativePath: rootRelativePath, discoveredSwiftFileCount: 0, scannedSwiftFileCount: 0 };
    snapshot.roots.push(rootRecord);
    walkSourceTree(rootPath, rootPath, rootRecord, snapshot, signals, relativePathSets);
  }

  for (const [name, pathSet] of Object.entries(relativePathSets)) {
    signals[name].relativePaths = [...pathSet].sort().slice(0, LIMITS.maxReportedPaths);
  }
  snapshot.inputSafety = {
    machineSpecificPathMarkerState: snapshot.machineSpecificPathFindingCount > 0 ? "attention" : "clear",
    credentialAssignmentMarkerState: snapshot.credentialAssignmentFindingCount > 0 ? "attention" : "clear",
    rawMatchedValuesStored: false,
  };
  return snapshot;
}

function walkSourceTree(directoryPath, sourceRootPath, rootRecord, snapshot, signals, relativePathSets) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isSymbolicLink()) {
      snapshot.symlinkCount += 1;
      continue;
    }
    if (entry.isDirectory()) {
      walkSourceTree(entryPath, sourceRootPath, rootRecord, snapshot, signals, relativePathSets);
      continue;
    }
    if (!entry.isFile() || path.extname(entry.name) !== ".swift") continue;

    const fileStat = fs.statSync(entryPath);
    const relativePath = relativeRepositoryPath(entryPath);
    const relativeDepth = sourceRelativeDepth(sourceRootPath, entryPath);
    snapshot.discoveredSwiftFileCount += 1;
    rootRecord.discoveredSwiftFileCount += 1;
    snapshot.maxFileBytesObserved = Math.max(snapshot.maxFileBytesObserved, fileStat.size);
    snapshot.maxRelativeDepthObserved = Math.max(snapshot.maxRelativeDepthObserved, relativeDepth);

    if (snapshot.discoveredSwiftFileCount > LIMITS.maxSwiftFiles) {
      snapshot.fileLimitExceeded = true;
      continue;
    }
    if (fileStat.size > LIMITS.maxFileBytes) {
      snapshot.fileSizeLimitExceeded = true;
      continue;
    }
    if (snapshot.boundedSwiftByteCount + fileStat.size > LIMITS.maxTotalBytes) {
      snapshot.totalByteLimitExceeded = true;
      continue;
    }
    if (relativeDepth > LIMITS.maxRelativeDepth) {
      snapshot.depthLimitExceeded = true;
      continue;
    }

    let source;
    try {
      source = fs.readFileSync(entryPath, "utf8");
    } catch {
      snapshot.unreadableFileCount += 1;
      continue;
    }
    snapshot.scannedSwiftFileCount += 1;
    rootRecord.scannedSwiftFileCount += 1;
    snapshot.boundedSwiftByteCount += fileStat.size;
    snapshot.machineSpecificPathFindingCount += countMatches(source, /(?:\/Users\/|\/home\/|[A-Za-z]:\\|[A-Za-z]:\/(?!\/))/g);
    snapshot.credentialAssignmentFindingCount += countMatches(source, CREDENTIAL_ASSIGNMENT_PATTERN);

    for (const [name, pattern] of Object.entries(SIGNALS)) {
      const count = countMatches(source, pattern);
      if (count === 0) continue;
      signals[name].count += count;
      relativePathSets[name].add(relativePath);
    }
  }
}

function validateRecord(record) {
  const evidence = record.staticEvidence || {};
  assert(record.id === "seis-public-plugin-wave-3-capability-decision" && record.goalId === "SEIS-GOAL-021" && record.backlogId === "SEIS-BL-021" && record.wave === 3, "decision identity is invalid");
  assert(record.status === "approved-public-local-implementation" && record.decision?.selectedCapability === CANDIDATE_ID && record.decision?.implementationStarted === true && record.decision?.additionalPublicCardAdded === true, "implementation decision state is invalid");
  assert(list(record.decision?.overlapReview).length === 4 && list(record.nonGoals).length === 4 && list(record.acceptanceCriteria).length === 5, "scope is incomplete");
  assert(record.implementation?.packageExists === true && record.implementation?.publicCardExists === true && record.implementation?.sourcePath === `plugins/seis-core/${CANDIDATE_ID}` && record.implementation?.marketplaceSourcePath === `./plugins/seis-core/${CANDIDATE_ID}` && record.implementation?.implementationStarted === true && record.implementation?.additionalPublicCardAdded === true, "implementation evidence is invalid");
  assert(record.preconditions?.wave2HandoffId === "seis-public-plugin-wave-2-handoff" && record.preconditions?.wave2HandoffStatus === "completed-repository-local-handoff", "Wave 2 handoff precondition is invalid");
  assert(record.preconditions?.wave3ProgramId === "seis-public-plugin-wave-3-program" && record.preconditions?.wave3ProgramStatus === "in-progress" && record.preconditions?.wave3ProgramSelectionStatus === "implementation-approved" && record.preconditions?.wave3ProgramSelectedCapability === CANDIDATE_ID, "Wave 3 implementation precondition is invalid");
  assert(record.publicDistribution?.marketplaceName === "seis-repo" && record.publicDistribution?.marketplaceDisplayName === "SEIS Repo" && record.publicDistribution?.publicAudience === "everyone" && record.publicDistribution?.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.publicDistribution?.expectedApplicationPluginCount === APP_PLUGIN_EXPANSION_TARGET && record.publicDistribution?.publicCardCount === APP_PLUGIN_EXPANSION_TARGET + 306 && record.publicDistribution?.expectedPublicCardCount === APP_PLUGIN_EXPANSION_TARGET + 306 && record.publicDistribution?.additionalPublicCardAdded === true, "public distribution contract is invalid");
  assert(record.publicDistribution?.personalMarketplaceRead === false && record.publicDistribution?.personalMarketplaceMutation === false && record.publicDistribution?.network === false && record.publicDistribution?.externalWrites === false && record.publicDistribution?.secrets === false && record.publicDistribution?.publicReleaseAllowed === false, "public distribution safety boundary is invalid");
  assert(evidence.classification === "bounded-static-concurrency-signals-only" && evidence.state === "bounded-static-signals-collected" && evidence.rootCount === SOURCE_ROOTS.length && evidence.discoveredSwiftFileCount > 0 && evidence.discoveredSwiftFileCount <= LIMITS.maxSwiftFiles && evidence.scannedSwiftFileCount === evidence.discoveredSwiftFileCount && evidence.boundedSwiftByteCount <= LIMITS.maxTotalBytes && evidence.maxFileBytesObserved <= LIMITS.maxFileBytes && evidence.maxRelativeDepthObserved <= LIMITS.maxRelativeDepth, "static source bounds are invalid");
  assert(evidence.symlinkCount === 0 && evidence.fileLimitExceeded === false && evidence.fileSizeLimitExceeded === false && evidence.totalByteLimitExceeded === false && evidence.depthLimitExceeded === false && evidence.unreadableFileCount === 0, "static source traversal is unsafe or incomplete");
  assert(evidence.machineSpecificPathFindingCount >= 0 && evidence.credentialAssignmentFindingCount === 0 && evidence.rawSourceReturned === false && evidence.sourceFilesCompiled === false && evidence.inputSafety?.rawMatchedValuesStored === false, "static evidence safety boundary is invalid");
  assert((evidence.signals?.uncheckedSendable?.count || 0) + (evidence.signals?.mainActor?.count || 0) + (evidence.signals?.sendableDeclaration?.count || 0) + (evidence.signals?.await?.count || 0) > 0, "candidate must have real static concurrency signals");
  assert(Object.values(evidence.signals || {}).every((signal) => signal?.relativePaths?.length <= LIMITS.maxReportedPaths), "reported paths exceed the output limit");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false && record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false && record.publicBoundary?.publicReleaseAllowed === false && record.publicBoundary?.sourceCodeExecuted === false && record.publicBoundary?.compilerInvoked === false && record.publicBoundary?.nativeRuntimeStarted === false, "public safety boundary is invalid");
  assert(list(record.risks).length === 3 && record.rollback?.strategy === "revert" && record.rollback?.dataMigrationRequired === false, "risk or rollback record is invalid");
  assert(!MACHINE_PATH_PATTERN.test(JSON.stringify(record)), "decision record must not contain a machine-specific path");
}

function repositoryPath(relativePath) {
  const repositoryRoot = path.resolve(ROOT);
  const absolutePath = path.resolve(repositoryRoot, relativePath);
  assert(absolutePath.startsWith(`${repositoryRoot}${path.sep}`), "source path escapes repository root");
  return absolutePath;
}

function relativeRepositoryPath(absolutePath) {
  return path.relative(ROOT, absolutePath).split(path.sep).join("/");
}

function sourceRelativeDepth(sourceRootPath, filePath) {
  const relative = path.relative(sourceRootPath, filePath);
  return Math.max(0, relative.split(path.sep).length - 1);
}

function countMatches(value, pattern) {
  const expression = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  return [...value.matchAll(expression)].length;
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = repositoryPath(relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`SEIS public plugin Wave 3 capability decision: required input is missing: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function writeText(relativePath, value) {
  const absolutePath = repositoryPath(relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public plugin Wave 3 capability decision: ${message}`);
}
