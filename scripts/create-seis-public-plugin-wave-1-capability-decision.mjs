#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  buildWave1MarketplaceCompatibility,
  WAVE_1_SELECTED_CAPABILITY,
} from "./lib/seis-wave-1-marketplace-compatibility.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const OUTPUT_PATH = "content/development/seis-public-plugin-wave-1-capability-decision.json";
const PLUGIN_ID = WAVE_1_SELECTED_CAPABILITY;
const SOURCE_MANIFEST_PATH = "apps/seis-core/data/seis-core-plugin-sources.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const PUBLIC_FAMILY_PATH = "content/development/seis-public-plugin-family.json";
const BUNDLE_CATALOG_PATH = "content/development/seis-public-plugin-bundle-catalog.json";

const record = buildRecord();
const expected = JSON.stringify(record, null, 2) + "\n";

if (CHECK_MODE) {
  if (readText(OUTPUT_PATH) !== expected) {
    console.error(OUTPUT_PATH + " is stale. Run: npm run automation:seis-public-plugin-wave-1-capability-decision");
    process.exit(1);
  }
  console.log("SEIS public plugin Wave 1 capability decision check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log("Wrote " + OUTPUT_PATH + " for the selected public evidence-index capability.");
}

function buildRecord() {
  const sourceManifest = readJson(SOURCE_MANIFEST_PATH);
  const marketplace = readJson(MARKETPLACE_PATH);
  const publicFamily = readJson(PUBLIC_FAMILY_PATH);
  const bundleCatalog = readJson(BUNDLE_CATALOG_PATH);
  const sourceEntry = (sourceManifest.plugins || []).find((plugin) => plugin?.name === PLUGIN_ID);
  const compatibility = buildWave1MarketplaceCompatibility({
    marketplace,
    publicFamily,
    sourceManifest,
    bundleCatalog,
    selectedCapability: PLUGIN_ID,
  });

  const record = {
    schemaVersion: 2,
    id: "seis-public-plugin-wave-1-capability-decision",
    goalId: "SEIS-GOAL-021",
    backlogId: "SEIS-BL-021",
    generatedAt: "2026-07-21",
    status: "approved-public-local-implementation",
    historicalWave1Snapshot: compatibility.historicalWave1Snapshot,
    currentMarketplaceProjection: compatibility.currentMarketplaceProjection,
    decision: {
      selectedCapability: PLUGIN_ID,
      displayName: "SEIS Evidence Index",
      selectionReason: "The capability existed only as a plan-only AI Core catalog slot. No public app-owned package safely summarized the checked-in Wave 1 evidence index, its known attention states, and its program progress without returning raw source records.",
      priorCatalogState: {
        implementationState: "catalog-contract",
        availability: "plan-only",
        evidence: "The selection review ran before this physical app package was introduced; the public package now takes precedence over the generated plan-only slot.",
      },
      scope: [
        "Read two bounded checked-in Wave 1 JSON records and one generated plugin evidence record.",
        "Return only derived marketplace, release, progress, and recorded-attention summaries.",
        "Expose three local MCP tools for status, bounded audit, and committed evidence metadata.",
      ],
      nonGoals: [
        "Replacing project-manifest, UI-state, focus-navigation, distribution, provenance, install, or lifecycle audits.",
        "Reading or mutating a personal marketplace.",
        "Writing evidence, program, marketplace, source, GitHub, provider, or release state from the runtime.",
        "Claiming an external installation, public release, live provider, browser, deployment, or GitHub verification.",
      ],
    },
    overlapReview: [
      {
        capability: "seis-project-manifest-audit",
        relationship: "Validates ownership and count declarations.",
        decision: "Complementary; it does not summarize Wave 1 evidence or its recorded attention states.",
      },
      {
        capability: "seis-ui-state-contract-audit",
        relationship: "Audits static UI-state source markers.",
        decision: "Complementary; it remains the authoritative source for UI-state findings.",
      },
      {
        capability: "seis-focus-navigation-audit",
        relationship: "Audits focus and navigation source evidence.",
        decision: "Complementary; it remains the authoritative source for focus findings.",
      },
      {
        capability: "seis-public-distribution-audit",
        relationship: "Audits public marketplace projection and local distribution metadata.",
        decision: "Complementary; it remains the authoritative source for distribution findings.",
      },
      {
        capability: "seis-public-install-evidence",
        relationship: "Records bounded install evidence and release gates.",
        decision: "Complementary; it remains the authoritative source for install-state evidence.",
      },
    ],
    publicBoundary: {
      marketplaceName: "seis-repo",
      marketplaceDisplayName: "SEIS Repo",
      publicAudience: "everyone",
      publicMarketplace: true,
      personalMarketplaceRead: false,
      personalMarketplaceMutation: false,
      network: false,
      externalWrites: false,
      secrets: false,
      publicReleaseAllowed: false,
      protectedDefaultBranchWrites: false,
    },
    sourceInputs: [
      "content/development/seis-public-plugin-wave-1-evidence-index.json",
      "content/development/seis-public-plugin-wave-1-program.json",
    ],
    boundedOutput: {
      fields: [
        "marketplace identity and counts",
        "release label and semver",
        "recorded attention contract identifiers",
        "completed and in-progress Wave 1 step numbers",
        "concise structural finding codes",
      ],
      excludes: [
        "raw JSON inputs",
        "machine-specific paths",
        "secret-like values",
        "provider credentials",
        "external installation or release assertions",
      ],
    },
    deterministicFixtures: [
      "checked-in repository evidence index and program",
      "temporary malformed bounded fixture with a redacted unsafe-input finding",
      "Content-Length framed MCP initialize, tool list, audit, and evidence requests",
    ],
    mcpBoundary: {
      tools: ["seis_evidence_index_status", "seis_evidence_index", "seis_evidence_index_evidence"],
      writes: [],
      network: [],
      secrets: [],
      pathScope: "SEIS_REPO_ROOT only",
    },
    implementation: {
      sourcePath: "plugins/seis-core/" + PLUGIN_ID,
      sourceManifest: SOURCE_MANIFEST_PATH,
      marketplacePath: MARKETPLACE_PATH,
      bundleCatalogPath: BUNDLE_CATALOG_PATH,
      entrypoint: sourceEntry.entrypoint,
      releaseTrainVersion: sourceEntry.releaseTrainVersion,
      releaseSemver: sourceEntry.version,
      implementationState: sourceEntry.implementationState,
      currentMarketplacePresentation: "retained-source-through-bundle-card",
      currentBundleId: compatibility.currentMarketplaceProjection.selectedApplicationCapability.bundleId,
      currentBundleSourcePath: compatibility.currentMarketplaceProjection.selectedApplicationCapability.bundleSourcePath,
      directMarketplaceCardRequired: false,
    },
    validation: [
      "plugin-creator structural validation for plugins/seis-core/seis-evidence-index",
      "node --test plugins/seis-core/test/evidence-index.test.mjs",
      "node scripts/create-seis-evidence-index.mjs --check",
      "npm run check:seis-public-plugin-bundles",
      "npm run check:seis-repo-marketplace",
    ],
    rollback: {
      historicalWave1Strategy: "At the Wave 1 handoff, revert the focused package, its direct marketplace card, the capability decision record, and generated outputs together.",
      currentCompatibilityStrategy: "Revert this compatibility update and regenerate the curated bundle projection; do not restore hundreds of direct source cards.",
      dataMigrationRequired: false,
      externalCleanupRequired: false,
      releaseClaimRollback: "No external installation or release claim is created by this local package.",
    },
  };
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  assert(record.id === "seis-public-plugin-wave-1-capability-decision", "decision id is invalid");
  assert(record.schemaVersion === 2, "schema version is invalid");
  assert(record.goalId === "SEIS-GOAL-021" && record.backlogId === "SEIS-BL-021", "goal linkage is invalid");
  assert(record.decision?.selectedCapability === PLUGIN_ID, "selected capability is invalid");
  assert(record.historicalWave1Snapshot?.projectionModel === "direct-source-cards" && record.historicalWave1Snapshot?.publicCardCount === 377 && record.historicalWave1Snapshot?.applicationPluginCount === 71 && record.historicalWave1Snapshot?.selectedCapabilityDirectCardCount === 1, "historical Wave 1 marketplace snapshot is invalid");
  assert(record.currentMarketplaceProjection?.projectionModel === "curated-bundle-cards" && record.currentMarketplaceProjection?.publicCardCount === 34 && record.currentMarketplaceProjection?.bundleCardCount === 33, "current curated marketplace projection is invalid");
  assert(record.currentMarketplaceProjection?.selectedApplicationCapability?.id === PLUGIN_ID && record.currentMarketplaceProjection?.selectedApplicationCapability?.retainedSource === true && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardRequired === false && record.currentMarketplaceProjection?.selectedApplicationCapability?.directMarketplaceCardCount === 0 && record.currentMarketplaceProjection?.selectedApplicationCapability?.bundleCardCount === 1, "current selected-capability bundle resolution is invalid");
  assert(record.publicBoundary?.marketplaceName === "seis-repo" && record.publicBoundary?.marketplaceDisplayName === "SEIS Repo", "public marketplace boundary is invalid");
  assert(record.publicBoundary?.personalMarketplaceRead === false && record.publicBoundary?.personalMarketplaceMutation === false, "personal marketplace boundary is invalid");
  assert(record.publicBoundary?.network === false && record.publicBoundary?.externalWrites === false && record.publicBoundary?.secrets === false, "runtime permission boundary is invalid");
  assert(record.publicBoundary?.publicReleaseAllowed === false && record.publicBoundary?.protectedDefaultBranchWrites === false, "release boundary is invalid");
  assert(Array.isArray(record.overlapReview) && record.overlapReview.length >= 5, "overlap review is incomplete");
  assert(Array.isArray(record.sourceInputs) && record.sourceInputs.length === 2, "source input contract is incomplete");
  assert(Array.isArray(record.mcpBoundary?.tools) && record.mcpBoundary.tools.length === 3, "MCP tool boundary is incomplete");
  assert(record.implementation?.currentMarketplacePresentation === "retained-source-through-bundle-card" && record.implementation?.currentBundleId === record.currentMarketplaceProjection.selectedApplicationCapability.bundleId && record.implementation?.directMarketplaceCardRequired === false, "current implementation presentation is invalid");
  assert(!/(?:^|["'\s])(?:~\/|\/Users\/|\/home\/|[A-Za-z]:[\\/])/m.test(JSON.stringify(record)), "decision record must not contain machine-specific paths");
}

function assert(condition, message) {
  if (!condition) throw new Error("SEIS public plugin Wave 1 capability decision: " + message);
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
