#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  APP_PLUGIN_RELEASE_INITIAL_LABEL,
  APP_PLUGIN_RELEASE_MAX_LABEL,
  APP_PLUGIN_RELEASE_SEED_LABEL,
  nextLargeCodeRelease,
  nextMajorRelease,
  parseReleaseLabel,
} from "./seis-core-plugin-release-policy.mjs";
import { collectSeisCorePluginChangeEvidence } from "./seis-core-plugin-change-evidence.mjs";

const root = process.cwd();
const releaseTrainPath = path.join(root, "content", "development", "seis-core-plugin-release-train.json");
const outputPath = path.join(root, "apps", "seis-core", "data", "seis-core-plugin-release-readiness.json");
const checkMode = process.argv.includes("--check");
const releaseTrain = JSON.parse(fs.readFileSync(releaseTrainPath, "utf8"));
const current = parseReleaseLabel(releaseTrain.currentRelease.label);
const threshold = releaseTrain.policy?.largeCodeChangeThreshold ?? 500;
const evidence = collectSeisCorePluginChangeEvidence(root, { threshold });
const nextLargeCode = safeNext(() => nextLargeCodeRelease(current));
const nextAnnual = safeNext(() => nextMajorRelease(current));
const nextAnnualYear = releaseTrain.cadence?.nextAnnualYear ?? new Date().getUTCFullYear() + 1;
const record = {
  schemaVersion: 1,
  id: "seis-core-plugin-release-readiness",
  goalId: "SEIS-GOAL-021",
  application: "apps/seis-core",
  sourceRoot: "plugins/seis-core",
  generatedAt: "2026-07-15",
  currentRelease: compactRelease(current, releaseTrain.currentRelease.kind),
  next: {
    largeCode: nextLargeCode ? compactRelease(nextLargeCode, "large-code-change") : null,
    annual: nextAnnual ? { ...compactRelease(nextAnnual, "annual"), year: nextAnnualYear } : null,
  },
  policy: {
    minimumLabel: APP_PLUGIN_RELEASE_SEED_LABEL,
    initialLabel: APP_PLUGIN_RELEASE_INITIAL_LABEL,
    maximumLabel: APP_PLUGIN_RELEASE_MAX_LABEL,
    largeCodeChangeThreshold: threshold,
    largeCodeChangeRequiresEvidence: true,
    annualPromotionCommand: "npm run promote:seis-core-plugin-annual-release",
    largeCodeEvidenceCommand: "npm run automation:seis-core-plugin-change-evidence",
    largeCodePromotionCommand: "npm run promote:seis-core-plugin-release -- --evidence content/development/seis-core-plugin-change-evidence.json",
    bulkPromotionAllowed: false,
  },
  workingTree: {
    baseCommit: evidence.baseCommit,
    codeLinesAdded: evidence.codeLinesAdded,
    codeLinesRemoved: evidence.codeLinesRemoved,
    codeLinesChanged: evidence.codeLinesChanged,
    changedCodeFileCount: evidence.files.length,
    largeCodeEligible: evidence.eligible,
    evidenceArtifact: "content/development/seis-core-plugin-change-evidence.json",
  },
  decision: evidence.eligible
    ? "large-code-promotion-evidence-ready"
    : "continue-code-before-large-code-promotion",
};
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (checkMode) {
  const actual = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (actual !== expected) {
    console.error("SEIS Core release readiness artifact is stale. Run: npm run automation:seis-core-plugin-release-readiness");
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, id: record.id, current: record.currentRelease.label, nextLargeCode: record.next.largeCode?.label || null, nextAnnual: record.next.annual?.label || null, codeLinesChanged: record.workingTree.codeLinesChanged, decision: record.decision }, null, 2));
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, expected);
console.log(JSON.stringify({ ok: true, outputPath, current: record.currentRelease.label, nextLargeCode: record.next.largeCode?.label || null, nextAnnual: record.next.annual?.label || null, codeLinesChanged: record.workingTree.codeLinesChanged, decision: record.decision }, null, 2));

function compactRelease(release, kind) {
  return {
    label: release.label,
    semver: release.semver,
    major: release.major,
    revision: release.revision,
    microUnits: release.microUnits ?? null,
    kind,
  };
}

function safeNext(callback) {
  try {
    return callback();
  } catch {
    return null;
  }
}
