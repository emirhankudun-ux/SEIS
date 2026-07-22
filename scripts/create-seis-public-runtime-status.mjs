#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const GENERATED_AT = "2026-07-22";
const OUTPUT_PATH = "content/development/seis-public-runtime-status.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const FAMILY_PATH = "content/development/seis-public-plugin-family.json";
const INSTALL_STATE_PATH = "content/development/seis-public-install-state.json";

const state = buildState();
const expected = `${JSON.stringify(state, null, 2)}\n`;

if (CHECK_MODE) {
  const actual = readText(OUTPUT_PATH);
  if (actual !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-runtime-status`);
    process.exit(1);
  }
  console.log("SEIS public runtime status check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for ${state.publicCards.count} public SEIS Repo cards.`);
}

function buildState() {
  const marketplace = readJson(MARKETPLACE_PATH);
  const family = readJson(FAMILY_PATH);
  const installState = readJson(INSTALL_STATE_PATH);
  const cards = array(marketplace.plugins);
  const canonicalCards = array(family.publicPlugins);
  const bundleCards = array(family.bundlePackages);
  const applicationBundleCards = bundleCards.filter((bundle) => bundle?.family === "application");
  const topicBundleCards = bundleCards.filter((bundle) => bundle?.family === "topic");
  const rootCapabilities = array(family.migratedRootPlugins);
  const applicationCapabilities = array(family.applicationPlugins);
  const topicCapabilities = array(family.topicPlugins);
  const expectedCardCount = canonicalCards.length + bundleCards.length;
  const expectedSourceCapabilityCount = rootCapabilities.length + applicationCapabilities.length + topicCapabilities.length;
  const runtimeStatusBundle = findCapabilityBundle(bundleCards, "seis-public-runtime-status");
  const runtimeStatusCard = cards.find((card) => card?.name === runtimeStatusBundle?.id);

  assert(marketplace.name === "seis-repo", "marketplace must be seis-repo");
  assert(marketplace.interface?.displayName === "SEIS Repo", "marketplace display name must be SEIS Repo");
  assert(cards.length === expectedCardCount, "marketplace card count must match the public plugin family");
  assert(cardsMatchProjection(cards, family.marketplace?.entries), "marketplace cards must match the curated family projection");
  assert(cardsHavePublicSource(cards), "every marketplace card must retain a bounded public repository source");
  assert(family.marketplace?.publicPluginCount === expectedCardCount, "public plugin family card count must match the marketplace");
  assert(family.marketplace?.bundlePluginCount === bundleCards.length, "public plugin family bundle count must match the marketplace");
  assert(family.marketplace?.sourceCapabilityCount === expectedSourceCapabilityCount, "public plugin family source capability count must match the retained inventory");
  assert(installState.publicCards?.count === expectedCardCount, "public install state card count must match the marketplace");
  assert(installState.sourceCapabilities?.count === expectedSourceCapabilityCount, "public install state source capability count must match the retained inventory");
  assert(Boolean(runtimeStatusBundle), "runtime-status source capability must be covered by a bundle");
  assert(Boolean(runtimeStatusCard), "marketplace must include the runtime-status capability bundle");
  assert(runtimeStatusCard?.source?.path === runtimeStatusBundle?.sourcePath, "runtime status bundle card source path is invalid");
  assert(runtimeStatusCard?.policy?.installation === "AVAILABLE", "runtime status card must be available");
  assert(runtimeStatusCard?.policy?.authentication === "ON_INSTALL", "runtime status card authentication is invalid");

  return {
    schemaVersion: 2,
    id: "seis-public-runtime-status",
    goalId: "SEIS-GOAL-021",
    generatedAt: GENERATED_AT,
    status: "public-seis-repo-runtime-cache-observation",
    decision: "runtime-cache-observation-is-not-release-or-activation-proof",
    purpose: "Compare declared public SEIS Repo card versions with bounded local cache manifests while keeping cache presence, Codex enablement, independent installation proof, and release approval visibly separate.",
    plugin: {
      name: "seis-public-runtime-status",
      displayName: "SEIS Public Runtime Status",
      marketplaceName: "seis-repo",
      sourcePath: "plugins/seis-core/seis-public-runtime-status",
      distributionMode: "bundled-source-capability",
      marketplaceCardName: runtimeStatusBundle.id,
      marketplaceCardSourcePath: runtimeStatusBundle.sourcePath,
      publicAudience: "everyone",
      publicMarketplace: true
    },
    publicCards: {
      marketplaceName: marketplace.name,
      marketplaceDisplayName: marketplace.interface?.displayName,
      count: cards.length,
      canonicalOrchestratorCount: canonicalCards.length,
      bundleCardCount: bundleCards.length,
      applicationBundleCardCount: applicationBundleCards.length,
      topicBundleCardCount: topicBundleCards.length,
      sourceAvailability: "public-repository-source-available",
      installationPolicy: "AVAILABLE",
      authenticationPolicy: "ON_INSTALL"
    },
    sourceCapabilities: {
      count: expectedSourceCapabilityCount,
      migratedRootCount: rootCapabilities.length,
      applicationCount: applicationCapabilities.length,
      topicCount: topicCapabilities.length,
      separateMarketplaceCards: false,
      retentionMode: "repository-source-capabilities-behind-curated-cards"
    },
    observationBoundary: {
      cacheScope: "bounded-seis-repo-cache-manifests-only",
      sourceScope: "declared-public-seis-repo-card-manifests-only",
      cacheRecordIsInstallationProof: false,
      cacheRecordIsEnablementProof: false,
      cacheRecordIsIndependentProof: false,
      publicReleaseAllowed: false,
      writesAllowed: false,
      networkAllowed: false,
      secretsRead: false
    },
    stateModel: [
      {
        id: "current-cache-record",
        meaning: "A declared card has a local cache manifest whose package version matches its public repository source manifest."
      },
      {
        id: "stale-cache-record",
        meaning: "A declared card has a valid local cache manifest but no observed package version matching its current public source manifest."
      },
      {
        id: "missing-cache-record",
        meaning: "A declared card has no observed cache directory in the bounded seis-repo cache root."
      },
      {
        id: "invalid-cache-record",
        meaning: "A declared cache directory lacks a safe, parseable manifest matching its directory name."
      },
      {
        id: "undeclared-cache-record",
        meaning: "A bounded cache directory is present but is not a card in the current public marketplace contract."
      }
    ],
    limitations: [
      "A local cache record is not proof that Codex currently enables a package.",
      "A local cache record is not independent clean-runner or public installation evidence.",
      "A local cache record does not authorize publication, credentials, external writes, or release activity."
    ],
    safety: {
      reads: [
        MARKETPLACE_PATH,
        FAMILY_PATH,
        INSTALL_STATE_PATH,
        "declared public plugin manifests",
        "bounded seis-repo cache manifests"
      ],
      write: [],
      network: [],
      secrets: [],
      installationMutation: false,
      enablementMutation: false,
      publicationMutation: false
    }
  };
}

function cardsHavePublicSource(cards) {
  return cards.length > 0 && cards.every((card) =>
    typeof card?.name === "string"
    && card.source?.source === "local"
    && typeof card.source?.path === "string"
    && card.source.path.startsWith("./plugins/")
    && !card.source.path.includes("..")
    && card.policy?.installation === "AVAILABLE"
    && card.policy?.authentication === "ON_INSTALL"
  );
}

function cardsMatchProjection(cards, entries) {
  const projection = array(entries);
  if (cards.length !== projection.length) return false;
  const expected = new Map(projection.map((entry) => [text(entry?.name), text(entry?.sourcePath)]));
  return expected.size === projection.length && cards.every((card) => expected.get(text(card?.name)) === text(card?.source?.path));
}

function findCapabilityBundle(bundles, capabilityName) {
  return bundles.find((bundle) => array(bundle?.members).some((member) => text(member?.name) === capabilityName)) || null;
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public runtime status: ${message}`);
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
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
