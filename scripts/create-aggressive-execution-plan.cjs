const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "content", "development", "aggressive-execution-plan.json");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildPlan() {
  const evolution = readJson("content/development/seis-evolution-model.json");
  const aggressive = readJson("content/development/aggressive-capability-map.json");
  const publishGate = readJson("content/development/publish-gate-contract.json");
  const remote = readJson("content/development/github-remote-configuration.json");

  const lanes = aggressive.capabilityLanes || [];
  const queue = evolution.activationQueue || [];
  const qualityCommands = unique([
    ...(evolution.qualityGates || []).map((gate) => gate.command),
    ...(aggressive.capabilityLanes || []).flatMap((lane) => lane.qualityCommands || []),
    ...(publishGate.qualityCommands || []),
    ...(remote.qualityCommands || [])
  ]);

  return {
    id: "seis-aggressive-execution-plan",
    version: 1,
    mode: "maximum-safe-aggression",
    branch: aggressive.branch || evolution.branch || "UIXAppTTR",
    remote: remote.repository?.remoteName || publishGate.remote?.name || "origin",
    sprintWindowMinutes: aggressive.timeboxMinutes || 10,
    publishState: {
      configuredRemote: remote.publishReadiness?.remoteConfigured === true,
      pushAllowed: publishGate.currentEnvironmentPolicy?.expectedResult === "publish-ready",
      expectedBlocker: publishGate.currentEnvironmentPolicy?.expectedResult || "configured-but-not-publish-ready"
    },
    executionBatches: queue.slice(0, 5).map((item, index) => {
      const lane = lanes[index % Math.max(lanes.length, 1)] || {};
      return {
        id: `batch-${String(index + 1).padStart(2, "0")}`,
        sourceBacklogId: item.backlogId,
        layer: item.layer,
        lane: lane.id || "local-safe-default",
        action: item.nextAction,
        acceptanceCriteria: item.acceptanceCriteria || [],
        validationProfile: item.validationProfile,
        qualityCommands: unique([...(lane.qualityCommands || []), ...(evolution.qualityGates || []).map((gate) => gate.command)]).slice(0, 4),
        rollback: item.rollback
      };
    }),
    fastTrackCommands: qualityCommands.slice(0, 12),
    doNotCross: unique([
      ...(publishGate.readinessLevels || []).flatMap((level) => level.blocks || []),
      ...(evolution.rollbackPolicy?.blocks || []),
      ...(aggressive.capabilityLanes || []).flatMap((lane) => lane.blockedActions || [])
    ]).slice(0, 16),
    sourceRecords: [
      "content/development/seis-evolution-model.json",
      "content/development/aggressive-capability-map.json",
      "content/development/publish-gate-contract.json",
      "content/development/github-remote-configuration.json"
    ]
  };
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const next = stableStringify(buildPlan());
const checkMode = process.argv.includes("--check");

if (checkMode) {
  if (!fs.existsSync(OUTPUT)) {
    console.error(`Missing aggressive execution plan: ${path.relative(ROOT, OUTPUT)}`);
    process.exit(1);
  }

  const current = fs.readFileSync(OUTPUT, "utf8");
  if (current !== next) {
    console.error("Aggressive execution plan is out of date. Run npm run automation:aggressive-execution-plan.");
    process.exit(1);
  }

  console.log("Aggressive execution plan check passed.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, next);
console.log(`Aggressive execution plan written: ${path.relative(ROOT, OUTPUT)}`);
