#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { UI_STATE_CONTRACT, auditUiStateContract } from "../plugins/seis-core/seis-ui-state-contract-audit/runtime/static-ui-state-audit.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-ui-state-contract-audit.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const RELEASE_TRAIN_PATH = "content/development/seis-core-plugin-release-train.json";
const PLUGIN_ID = "seis-ui-state-contract-audit";
const REQUIRED_STATE_IDS = UI_STATE_CONTRACT.map((state) => state.id);
const SURFACES = [
  {
    id: "seis-command-center",
    root: "apps/seis-core",
    files: ["index.html", "script.js", "styles.css"],
  },
  {
    id: "seis-desktop-second-brain",
    root: "apps/web",
    files: ["desktop.html", "desktop.js", "desktop.css"],
  },
];

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-ui-state-contract-audit`);
    process.exit(1);
  }
  console.log("SEIS UI-state contract static evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for ${record.surfaces.length} SEIS UI surfaces.`);
}

function buildRecord() {
  const releaseTrain = readJson(RELEASE_TRAIN_PATH);
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const currentRelease = releaseTrain.currentRelease || {};
  const pluginEntry = (sourceManifest.plugins || []).find((plugin) => plugin?.name === PLUGIN_ID);
  assert(pluginEntry, "public app source manifest must contain the UI-state contract audit plugin");
  assert(pluginEntry.version === currentRelease.semver, "UI-state contract audit plugin version is stale");
  assert(pluginEntry.releaseTrainVersion === currentRelease.label, "UI-state contract audit release train is stale");

  const surfaces = SURFACES.map((surface) => {
    const audit = auditUiStateContract(path.join(ROOT, surface.root), {
      files: surface.files,
      states: REQUIRED_STATE_IDS,
    });
    assert(audit.ok, `${surface.id}: static UI-state audit must complete`);
    assert(audit.findings.every((finding) => finding.severity !== "error"), `${surface.id}: static UI-state audit contains an error`);
    return {
      id: surface.id,
      sourceRoot: surface.root,
      sourceFiles: surface.files.map((file) => `${surface.root}/${file}`),
      state: audit.state,
      filesScanned: audit.filesScanned,
      observedStateIds: audit.states.filter((state) => state.observed).map((state) => state.id),
      missingStateIds: audit.missingStateIds,
      states: audit.states,
      findings: audit.findings,
      manualEvidenceStillRequired: [
        "loading-to-ready browser transcript",
        "empty, offline, unavailable, rate-limit, and degraded-state interaction review",
        "validation and provider-error recovery review",
        "approval-gated action review",
        "demo/live boundary review",
        "human product and accessibility approval",
      ],
    };
  });
  const commandCenterStateBoundary = inspectCommandCenterStateBoundary();
  const missingStateIds = [...new Set(surfaces.flatMap((surface) => surface.missingStateIds))].sort();
  const overallState = surfaces.every((surface) => surface.state === "ready") ? "ready" : "attention";

  const record = {
    schemaVersion: 1,
    id: "seis-ui-state-contract-audit",
    goalId: "SEIS-GOAL-021",
    backlogId: "SEIS-BL-038",
    generatedAt: "2026-07-21",
    status: "active-static-source-evidence",
    purpose: "Keep static UI-state marker evidence visible for key SEIS UI surfaces without treating source text as a runtime state-machine, provider, browser, or release proof.",
    portfolioPosition: {
      nonDuplicative: true,
      complements: [
        "seis-offline-mode-check: local-first and offline posture evidence",
        "seis-a11y-regression: declared JSON accessibility coverage",
        "seis-focus-navigation-audit: keyboard, focus, semantic-control, ARIA, and motion source evidence",
      ],
      adds: "Static source evidence for loading, empty, degraded, offline, unavailable, rate-limited, validation, provider-failure, approval, demo, and live-boundary markers.",
    },
    plugin: {
      name: PLUGIN_ID,
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      sourcePath: `plugins/seis-core/${PLUGIN_ID}`,
      releaseLabel: currentRelease.label,
      releaseSemver: currentRelease.semver,
      publicAudience: "everyone",
      publicMarketplace: true,
    },
    sourceManifest: SOURCE_MANIFEST_PATH,
    requiredStateIds: REQUIRED_STATE_IDS,
    staticAuditCompleted: true,
    overallState,
    missingStateIds,
    surfaces,
    commandCenterStateBoundary,
    manualEvidenceRequired: [
      "browser loading, empty, offline, degraded, validation, provider failure, approval, and recovery transcripts",
      "keyboard and assistive-technology review for state announcements",
      "manual demo/live boundary and public-release approval review",
    ],
    safety: {
      reads: [
        "bounded local HTML, JavaScript, and CSS source for the declared surfaces",
        SOURCE_MANIFEST_PATH,
        RELEASE_TRAIN_PATH,
      ],
      write: [],
      network: [],
      secrets: [],
      executesUi: false,
      publicReleaseAllowed: false,
    },
    limitations: [
      "Missing static evidence is an attention finding, not a claim that a runtime failure occurred.",
      "Static source evidence cannot prove rendered state transitions, data recovery, provider behavior, network conditions, or screen-reader announcements.",
      "Public release remains gated on manual product, accessibility, security, and approval evidence.",
    ],
  };
  validateRecord(record, currentRelease);
  return record;
}

function validateRecord(record, release) {
  assert(record.id === PLUGIN_ID, "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
  assert(record.backlogId === "SEIS-BL-038", "backlog linkage is invalid");
  assert(record.plugin?.name === PLUGIN_ID, "plugin name is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo", "marketplace name is invalid");
  assert(record.plugin?.marketplaceDisplayName === "SEIS Repo", "marketplace display name is invalid");
  assert(record.plugin?.releaseLabel === release.label, "plugin release label is stale");
  assert(record.plugin?.releaseSemver === release.semver, "plugin release semver is stale");
  assert(record.plugin?.publicAudience === "everyone" && record.plugin?.publicMarketplace === true, "public distribution contract is invalid");
  assert(record.portfolioPosition?.nonDuplicative === true, "portfolio overlap decision is missing");
  assert(Array.isArray(record.requiredStateIds) && record.requiredStateIds.length === REQUIRED_STATE_IDS.length, "state contract is incomplete");
  assert(record.staticAuditCompleted === true, "static audit completion marker is missing");
  assert(["ready", "attention"].includes(record.overallState), "overall state is invalid");
  assert(Array.isArray(record.surfaces) && record.surfaces.length === SURFACES.length, "surface evidence is incomplete");
  for (const surface of record.surfaces) {
    assert(["ready", "attention"].includes(surface.state), `${surface.id}: static source state is invalid`);
    assert(Array.isArray(surface.sourceFiles) && surface.sourceFiles.length === 3, `${surface.id}: source file contract is incomplete`);
    assert(Array.isArray(surface.missingStateIds), `${surface.id}: missing-state list is invalid`);
    assert(Array.isArray(surface.findings) && surface.findings.every((finding) => finding.severity !== "error"), `${surface.id}: static source errors are not allowed`);
    assert(Array.isArray(surface.manualEvidenceStillRequired) && surface.manualEvidenceStillRequired.length > 0, `${surface.id}: manual evidence boundary is missing`);
  }
  assert(record.commandCenterStateBoundary?.state === "ready", "Command Center state-boundary source review is not ready");
  assert(Object.values(record.commandCenterStateBoundary?.staticEvidence || {}).every((value) => value === true), "Command Center state-boundary evidence is incomplete");
  assert(Array.isArray(record.commandCenterStateBoundary?.manualEvidenceStillRequired) && record.commandCenterStateBoundary.manualEvidenceStillRequired.length > 0, "Command Center state-boundary manual evidence boundary is missing");
  assert(record.safety?.write?.length === 0 && record.safety?.network?.length === 0 && record.safety?.secrets?.length === 0, "safety permissions must remain empty");
  assert(record.safety?.executesUi === false && record.safety?.publicReleaseAllowed === false, "non-executing safety boundary is invalid");
  const serialized = JSON.stringify(record);
  assert(!/(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m.test(serialized), "record must not contain machine-specific paths");
}

function inspectCommandCenterStateBoundary() {
  const markup = readText("apps/seis-core/index.html");
  const source = readText("apps/seis-core/script.js");
  const styles = readText("apps/seis-core/styles.css");
  const start = source.indexOf("function renderPluginStateBoundaries()");
  const end = source.indexOf("function renderPluginReleaseReadiness()", start);
  const renderer = start >= 0 && end > start ? source.slice(start, end) : "";
  const staticEvidence = {
    semanticSection: /<section class="panel plugin-state-boundary-panel" aria-labelledby="plugin-state-boundary-title">/.test(markup),
    headingHierarchy: /<h3 id="plugin-state-boundary-title">Operational State Boundaries<\/h3>/.test(markup) && /<h4>\$\{escapeHtml\(boundary\.label\)\}<\/h4>/.test(renderer),
    politeAnnouncementBoundary: /id="plugin-state-boundary-grid" aria-live="polite"/.test(markup),
    semanticCards: /<article class="plugin-state-boundary-card" data-state-boundary=/.test(renderer),
    textStatusCues: /Current: \$\{escapeHtml\(boundary\.current\)\}/.test(renderer) && /status-pill/.test(renderer),
    noActionControls: !/<(?:button|input|select|textarea)\b/i.test(renderer),
    noProviderRequest: !/\b(?:fetch|XMLHttpRequest)\b/.test(renderer),
    noStorageMutation: !/\b(?:localStorage|sessionStorage|saveState)\b/.test(renderer),
    filterIsolation: !/\b(?:app-plugin-filter|pluginQuery)\b/.test(renderer),
    responsiveLayout: /\.plugin-state-boundary-grid\s*\{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/.test(styles) && /\.plugin-state-boundary-grid,/.test(styles),
  };
  return {
    state: Object.values(staticEvidence).every((value) => value === true) ? "ready" : "attention",
    staticEvidence,
    scope: "The Command Center panel is static, informational, and no-key; this source review is not a browser, screen-reader, provider, or runtime-transition claim.",
    manualEvidenceStillRequired: [
      "keyboard-only browser reading-order review",
      "screen-reader announcement review for the polite region",
      "contrast and non-color-cue review across supported themes",
      "responsive viewport review for the two-column-to-one-column layout",
    ],
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS UI-state contract audit: ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
}

function writeText(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}
