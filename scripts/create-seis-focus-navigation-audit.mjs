#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { auditStaticUi } from "../plugins/seis-core/seis-focus-navigation-audit/runtime/static-ui-audit.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-focus-navigation-audit.json";
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const RELEASE_TRAIN_PATH = "content/development/seis-core-plugin-release-train.json";
const PLUGIN_ID = "seis-focus-navigation-audit";
const SURFACES = [
  {
    id: "seis-command-center",
    root: "apps/seis-core",
    files: ["index.html", "script.js", "styles.css"],
    requiredEvidence: ["semanticInteractiveControls", "keyboardEventHandler", "focusStyle", "reducedMotionStyle"],
  },
  {
    id: "seis-desktop-second-brain",
    root: "apps/web",
    files: ["desktop.html", "desktop.js", "desktop.css"],
    requiredEvidence: ["semanticInteractiveControls", "keyboardEventHandler", "focusManagement", "focusStyle", "reducedMotionStyle", "ariaState"],
  },
];

const record = buildRecord();
const expected = `${JSON.stringify(record, null, 2)}\n`;

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-focus-navigation-audit`);
    process.exit(1);
  }
  console.log("SEIS focus-navigation static evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for ${record.surfaces.length} SEIS UI surfaces.`);
}

function buildRecord() {
  const releaseTrain = readJson(RELEASE_TRAIN_PATH);
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const currentRelease = releaseTrain.currentRelease || {};
  const pluginEntry = (sourceManifest.plugins || []).find((plugin) => plugin?.name === PLUGIN_ID);
  assert(pluginEntry, "public app source manifest must contain the focus-navigation audit plugin");
  assert(pluginEntry.version === currentRelease.semver, "focus-navigation audit plugin version is stale");
  assert(pluginEntry.releaseTrainVersion === currentRelease.label, "focus-navigation audit release train is stale");

  const surfaces = SURFACES.map((surface) => {
    const audit = auditStaticUi(path.join(ROOT, surface.root), { files: surface.files });
    assert(audit.ok, `${surface.id}: static UI audit must be ready`);
    for (const key of surface.requiredEvidence) assert(audit.staticEvidence?.[key] === true, `${surface.id}: missing ${key} evidence`);
    return {
      id: surface.id,
      sourceRoot: surface.root,
      sourceFiles: surface.files.map((file) => `${surface.root}/${file}`),
      state: audit.state,
      filesScanned: audit.filesScanned,
      staticEvidence: audit.staticEvidence,
      evidenceCounts: audit.evidenceCounts,
      findings: audit.findings,
      manualEvidenceStillRequired: [
        "keyboard-only browser transcript",
        "screen-reader transcript",
        "desktop and mobile focus-order review",
        "focus-obscuration review",
        "reduced-motion visual review",
        "human accessibility approval",
      ],
    };
  });
  const commandCenterStateBoundary = inspectCommandCenterStateBoundary();

  const record = {
    schemaVersion: 1,
    id: "seis-focus-navigation-audit",
    goalId: "SEIS-GOAL-021",
    backlogId: "SEIS-BL-028",
    generatedAt: "2026-07-21",
    status: "active-static-source-evidence",
    purpose: "Keep keyboard, focus, semantic-control, ARIA, and reduced-motion source evidence visible for key SEIS UI surfaces without treating static markers as browser or assistive-technology proof.",
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
    surfaces,
    commandCenterStateBoundary,
    manualEvidenceRequired: [
      "keyboard-only browser transcript",
      "screen-reader transcript",
      "mobile assistive-technology review",
      "manual focus-order and focus-obscuration review",
      "human accessibility approval before public release",
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
      launchesBrowser: false,
      controlsScreenReader: false,
      publicReleaseAllowed: false,
    },
    limitations: [
      "Static source evidence cannot prove rendered focus visibility, keyboard reachability, focus order, focus visibility under themes, or assistive-technology behavior.",
      "A native semantic control may be keyboard reachable without a JavaScript key handler, so static markers are evidence rather than a compliance score.",
      "Public release remains blocked on manual accessibility evidence and human approval.",
    ],
  };
  validateRecord(record, currentRelease);
  return record;
}

function validateRecord(record, release) {
  assert(record.id === "seis-focus-navigation-audit", "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "goal linkage is invalid");
  assert(record.backlogId === "SEIS-BL-028", "backlog linkage is invalid");
  assert(record.plugin?.name === PLUGIN_ID, "plugin name is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo", "marketplace name is invalid");
  assert(record.plugin?.marketplaceDisplayName === "SEIS Repo", "marketplace display name is invalid");
  assert(record.plugin?.releaseLabel === release.label, "plugin release label is stale");
  assert(record.plugin?.releaseSemver === release.semver, "plugin release semver is stale");
  assert(record.plugin?.publicAudience === "everyone" && record.plugin?.publicMarketplace === true, "public distribution contract is invalid");
  assert(Array.isArray(record.surfaces) && record.surfaces.length === SURFACES.length, "surface evidence is incomplete");
  for (const surface of record.surfaces) {
    assert(surface.state === "ready", `${surface.id}: static source evidence is not ready`);
    assert(Array.isArray(surface.findings) && surface.findings.length === 0, `${surface.id}: unresolved static findings remain`);
    assert(Array.isArray(surface.sourceFiles) && surface.sourceFiles.length === 3, `${surface.id}: source file contract is incomplete`);
    assert(Array.isArray(surface.manualEvidenceStillRequired) && surface.manualEvidenceStillRequired.length > 0, `${surface.id}: manual evidence boundary is missing`);
  }
  assert(record.commandCenterStateBoundary?.state === "ready", "Command Center state-boundary focus evidence is not ready");
  assert(Object.values(record.commandCenterStateBoundary?.staticEvidence || {}).every((value) => value === true), "Command Center state-boundary focus evidence is incomplete");
  assert(record.safety?.write?.length === 0 && record.safety?.network?.length === 0 && record.safety?.secrets?.length === 0, "safety permissions must remain empty");
  assert(record.safety?.launchesBrowser === false && record.safety?.controlsScreenReader === false && record.safety?.publicReleaseAllowed === false, "non-executing safety boundary is invalid");
  const serialized = JSON.stringify(record);
  assert(!/(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m.test(serialized), "record must not contain machine-specific paths");
}

function inspectCommandCenterStateBoundary() {
  const markup = readText("apps/seis-core/index.html");
  const source = readText("apps/seis-core/script.js");
  const start = source.indexOf("function renderPluginStateBoundaries()");
  const end = source.indexOf("function renderPluginReleaseReadiness()", start);
  const renderer = start >= 0 && end > start ? source.slice(start, end) : "";
  const staticEvidence = {
    labelledSection: /<section class="panel plugin-state-boundary-panel" aria-labelledby="plugin-state-boundary-title">/.test(markup),
    headingOrder: /<h3 id="plugin-state-boundary-title">Operational State Boundaries<\/h3>/.test(markup) && /<h4>\$\{escapeHtml\(boundary\.label\)\}<\/h4>/.test(renderer),
    politeRegion: /id="plugin-state-boundary-grid" aria-live="polite"/.test(markup),
    semanticCards: /<article class="plugin-state-boundary-card" data-state-boundary=/.test(renderer),
    noAdditionalFocusTarget: !/<(?:button|input|select|textarea|a)\b/i.test(renderer),
  };
  return {
    state: Object.values(staticEvidence).every((value) => value === true) ? "ready" : "attention",
    staticEvidence,
    manualEvidenceStillRequired: [
      "keyboard-only browser reading-order review",
      "screen-reader review for the labelled, polite region",
      "manual focus-order and focus-obscuration review",
    ],
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS focus-navigation audit: ${message}`);
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
