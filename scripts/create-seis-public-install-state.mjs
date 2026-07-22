#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const GENERATED_AT = "2026-07-22";
const OUTPUT_PATH = "content/development/seis-public-install-state.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const FAMILY_PATH = "content/development/seis-public-plugin-family.json";
const EXTERNAL_PROOF_PATH = "content/development/seis-public-plugin-external-install-proof.json";
const INDEPENDENT_CONTRACT_PATH = "content/development/seis-public-plugin-independent-runner-evidence-contract.json";
const FRESH_TASK_PROOF_PATH = "content/development/seis-public-plugin-fresh-task-proof.json";

const state = buildState();
const expected = `${JSON.stringify(state, null, 2)}\n`;

if (CHECK_MODE) {
  const actual = readText(OUTPUT_PATH);
  if (actual !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-install-state`);
    process.exit(1);
  }
  console.log("SEIS public install state check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for ${state.publicCards.count} public SEIS Repo cards.`);
}

function buildState() {
  const marketplace = readJson(MARKETPLACE_PATH);
  const family = readJson(FAMILY_PATH);
  const externalProof = readJson(EXTERNAL_PROOF_PATH);
  const independentContract = readJson(INDEPENDENT_CONTRACT_PATH);
  const freshTaskProof = readJson(FRESH_TASK_PROOF_PATH);
  const independentEvidencePath = text(independentContract.evidencePath);
  const independentEvidence = independentEvidencePath ? readOptionalJson(independentEvidencePath) : null;
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
  const installStateBundle = findCapabilityBundle(bundleCards, "seis-public-install-state");
  const installStateCard = cards.find((card) => card?.name === installStateBundle?.id);
  const artifactStage = externalProof.repoLocalArtifactStaging || {};
  const historicalArtifactCardCount = artifactStage.historicalPreConsolidationSnapshot?.marketplaceCardCount
    ?? artifactStage.marketplaceEntryCount
    ?? null;
  const historicalCanonicalCardCount = artifactStage.canonicalMarketplaceCardCount
    ?? artifactStage.canonicalOrchestratorCount
    ?? null;
  const historicalRootSourceCapabilityCount = artifactStage.migratedRootSourceCapabilityCount
    ?? artifactStage.migratedRootPluginCount
    ?? null;
  const historicalApplicationSourceCapabilityCount = artifactStage.applicationSourceCapabilityCount
    ?? artifactStage.applicationPluginCount
    ?? null;
  const historicalTopicSourceCapabilityCount = artifactStage.topicSourceCapabilityCount
    ?? artifactStage.topicPluginCount
    ?? null;
  const historicalSourceCapabilityCount = Number(historicalRootSourceCapabilityCount || 0)
    + Number(historicalApplicationSourceCapabilityCount || 0)
    + Number(historicalTopicSourceCapabilityCount || 0);

  assert(marketplace.name === "seis-repo", "marketplace must be seis-repo");
  assert(marketplace.interface?.displayName === "SEIS Repo", "marketplace display name must be SEIS Repo");
  assert(cards.length === expectedCardCount, "marketplace card count must match the public plugin family");
  assert(cardsMatchProjection(cards, family.marketplace?.entries), "marketplace cards must match the curated family projection");
  assert(family.marketplace?.publicPluginCount === expectedCardCount, "public plugin family card count must match the marketplace");
  assert(family.marketplace?.canonicalOrchestratorCount === canonicalCards.length, "canonical card count must match the public plugin family");
  assert(family.marketplace?.bundlePluginCount === bundleCards.length, "bundle card count must match the public plugin family");
  assert(family.marketplace?.applicationBundlePluginCount === applicationBundleCards.length, "application bundle card count must match the public plugin family");
  assert(family.marketplace?.topicBundlePluginCount === topicBundleCards.length, "topic bundle card count must match the public plugin family");
  assert(family.marketplace?.migratedRootPluginCount === rootCapabilities.length, "root source capability count must match the public plugin family");
  assert(family.marketplace?.applicationPluginCount === applicationCapabilities.length, "application source capability count must match the public plugin family");
  assert(family.marketplace?.topicPluginCount === topicCapabilities.length, "topic source capability count must match the public plugin family");
  assert(family.marketplace?.sourceCapabilityCount === expectedSourceCapabilityCount, "source capability count must match the public plugin family");
  assert(cardsHavePublicSource(cards), "every marketplace card must retain a bounded public repository source");
  assert(Boolean(installStateBundle), "install-state source capability must be covered by a bundle");
  assert(Boolean(installStateCard), "marketplace must include the install-state capability bundle");
  assert(installStateCard?.source?.path === installStateBundle?.sourcePath, "install-state bundle card source path is invalid");
  assert(installStateCard?.policy?.installation === "AVAILABLE", "install-state card must be available");
  assert(installStateCard?.policy?.authentication === "ON_INSTALL", "install-state card authentication is invalid");
  assert(artifactStage.ok === true, "repo-local clean artifact staging must be recorded as successful");
  assert(historicalCanonicalCardCount === canonicalCards.length, "historical artifact stage canonical count must match the retained source snapshot");
  assert(historicalRootSourceCapabilityCount === rootCapabilities.length, "historical artifact stage root source count must match the retained source inventory");
  assert(historicalApplicationSourceCapabilityCount === applicationCapabilities.length, "historical artifact stage application source count must match the retained source inventory");
  assert(historicalTopicSourceCapabilityCount === topicCapabilities.length, "historical artifact stage topic source count must match the retained source inventory");
  assert(historicalSourceCapabilityCount === expectedSourceCapabilityCount, "historical artifact stage source capability count must match the retained source inventory");
  assert(historicalArtifactCardCount === canonicalCards.length + historicalSourceCapabilityCount, "historical artifact stage must retain its pre-bundle card projection");
  assert(externalProof.publicReleaseAllowed === false, "artifact staging must not claim public release approval");
  assert(independentContract.status === "active-evidence-intake-contract", "independent runner evidence contract must remain active");
  assert(independentContract.publicReleaseAllowed === false, "independent runner evidence contract must not claim public release approval");

  const independentEvidenceStatus = text(independentEvidence?.status) || "pending-independent-clean-runner-or-public-install";
  const independentInstallationVerified = independentEvidenceStatus === "recorded-independent-clean-runner-evidence";
  const freshTaskStatus = text(freshTaskProof.reloadEvidence?.status) || "not-recorded";
  const sourceAvailable = cardsHavePublicSource(cards);

  return {
    schemaVersion: 2,
    id: "seis-public-install-state",
    goalId: "SEIS-GOAL-021",
    generatedAt: GENERATED_AT,
    status: independentInstallationVerified
      ? "public-seis-repo-source-available-independent-install-recorded"
      : "public-seis-repo-source-available-independent-install-pending",
    decision: "not-ready-for-public-release",
    purpose: "Make public SEIS Repo source availability, local artifact evidence, independent installation proof, and human release approval visibly distinct so marketplace cards never overstate their runtime or release status.",
    plugin: {
      name: "seis-public-install-state",
      displayName: "SEIS Public Install State",
      marketplaceName: "seis-repo",
      sourcePath: "plugins/seis-core/seis-public-install-state",
      distributionMode: "bundled-source-capability",
      marketplaceCardName: installStateBundle.id,
      marketplaceCardSourcePath: installStateBundle.sourcePath,
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
      sourceAvailability: sourceAvailable ? "public-repository-source-available" : "attention",
      installationPolicy: "AVAILABLE",
      authenticationPolicy: "ON_INSTALL",
      externalInstallationProven: independentInstallationVerified
    },
    sourceCapabilities: {
      count: expectedSourceCapabilityCount,
      migratedRootCount: rootCapabilities.length,
      applicationCount: applicationCapabilities.length,
      topicCount: topicCapabilities.length,
      separateMarketplaceCards: false,
      retentionMode: "repository-source-capabilities-behind-curated-cards"
    },
    canonicalDefaultInstall: {
      installId: family.defaultInstall?.installId || "seis-ai-agent@seis-repo",
      mode: family.defaultInstall?.mode || "single-public-plugin",
      sourceAvailability: "public-repository-source-available",
      independentInstallationProven: independentInstallationVerified,
      note: "The canonical default install remains distinct from the 33 optional curated bundle cards and their retained source capabilities."
    },
    evidence: {
      historicalRepoLocalArtifactStage: {
        status: externalProof.status,
        verified: externalProof.repoLocalArtifactStaging?.ok === true,
        historicalSnapshot: true,
        capturedMarketplaceCardCount: historicalArtifactCardCount,
        capturedSourceCapabilityCount: historicalSourceCapabilityCount,
        currentMarketplaceCardCount: expectedCardCount,
        matchesCurrentMarketplaceProjection: historicalArtifactCardCount === expectedCardCount,
        stageDeletedAfterValidation: externalProof.repoLocalArtifactStaging?.stageDeletedAfterValidation === true,
        scope: "historical-pre-bundle-repo-local-clean-artifact-staging"
      },
      freshTaskReload: {
        status: freshTaskStatus,
        recorded: freshTaskStatus === "recorded-local-fresh-task-evidence",
        scope: "canonical-default-install-local-evidence"
      },
      independentRunner: {
        contractStatus: independentContract.status,
        evidencePath: independentEvidencePath || null,
        evidenceStatus: independentEvidenceStatus,
        recorded: independentInstallationVerified,
        scope: "independent-clean-runner-or-public-install"
      }
    },
    readiness: {
      repositorySourceAvailable: sourceAvailable,
      currentMarketplaceProjectionVerified: cardsMatchProjection(cards, family.marketplace?.entries),
      historicalSourceArtifactStageVerified: externalProof.repoLocalArtifactStaging?.ok === true,
      freshTaskReloadRecorded: freshTaskStatus === "recorded-local-fresh-task-evidence",
      independentInstallationVerified,
      humanReleaseApprovalRecorded: false,
      publicReleaseAllowed: false,
      releaseState: independentInstallationVerified
        ? "human-approval-required"
        : "independent-install-proof-and-human-approval-required"
    },
    stateModel: [
      {
        id: "public-source-available",
        meaning: "The bounded curated SEIS Repo cards and their retained repository source capabilities are visible to everyone."
      },
      {
        id: "historical-source-artifact-validated",
        meaning: "The preserved pre-bundle disposable stage validated the canonical package and retained source capabilities without proving the current curated bundle projection."
      },
      {
        id: "independently-installed",
        meaning: "A sanitized clean-runner or public package installation record is required before this state can be claimed."
      },
      {
        id: "release-approved",
        meaning: "A human owner must separately approve any release, publication, credentialed activation, or external write."
      }
    ],
    nextRequiredEvidence: independentInstallationVerified
      ? ["Human owner approval before any public release, publication, credentialed activation, or external write."]
      : [
          "Sanitized independent clean-runner or public package installation evidence.",
          "Human owner approval before any public release, publication, credentialed activation, or external write."
        ],
    safety: {
      reads: [
        MARKETPLACE_PATH,
        FAMILY_PATH,
        EXTERNAL_PROOF_PATH,
        INDEPENDENT_CONTRACT_PATH,
        FRESH_TASK_PROOF_PATH
      ],
      write: [],
      network: [],
      secrets: [],
      installationMutation: false,
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

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public install state: ${message}`);
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function readOptionalJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
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
