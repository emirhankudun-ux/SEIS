#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const GENERATED_AT = "2026-07-20";
const OUTPUT_PATH = "content/development/seis-public-install-evidence.json";
const MARKETPLACE_PATH = ".agents/plugins/marketplace.json";
const FAMILY_PATH = "content/development/seis-public-plugin-family.json";
const EVIDENCE_CONTRACT_PATH = "content/development/seis-public-plugin-independent-runner-evidence-contract.json";
const EVIDENCE_PATH = "content/development/seis-public-plugin-independent-runner-evidence.json";
const STRICT_RECORDED_GATE = "npm run check:seis-public-plugin-independent-runner-evidence:recorded";

const state = buildState();
const expected = `${JSON.stringify(state, null, 2)}\n`;

if (CHECK_MODE) {
  const actual = readText(OUTPUT_PATH);
  if (actual !== expected) {
    console.error(`${OUTPUT_PATH} is stale. Run: npm run automation:seis-public-install-evidence`);
    process.exit(1);
  }
  console.log("SEIS public install-evidence check passed.");
} else {
  writeText(OUTPUT_PATH, expected);
  console.log(`Wrote ${OUTPUT_PATH} for ${state.publicCards.count} public SEIS Repo cards.`);
}

function buildState() {
  const marketplace = readJson(MARKETPLACE_PATH);
  const family = readJson(FAMILY_PATH);
  const evidenceContract = readJson(EVIDENCE_CONTRACT_PATH);
  const cards = array(marketplace.plugins);
  const canonicalCards = array(family.publicPlugins);
  const rootCards = array(family.migratedRootPlugins);
  const applicationCards = array(family.applicationPlugins);
  const topicCards = array(family.topicPlugins);
  const expectedCardCount = canonicalCards.length + rootCards.length + applicationCards.length + topicCards.length;
  const expectedPluginIds = canonicalCards.map((item) => text(item?.installId)).filter(Boolean).sort();
  const expectedEmbeddedModuleIds = array(family.embeddedModules || family.plugins).map((item) => text(item?.name)).filter(Boolean).sort();
  const evidenceCard = cards.find((card) => card?.name === "seis-public-install-evidence");

  assert(marketplace.name === "seis-repo", "marketplace must be seis-repo");
  assert(marketplace.interface?.displayName === "SEIS Repo", "marketplace display name must be SEIS Repo");
  assert(cards.length === expectedCardCount, "marketplace card count must match the public plugin family");
  assert(cardsHavePublicSource(cards), "every marketplace card must retain a bounded public repository source");
  assert(family.marketplace?.publicPluginCount === expectedCardCount, "public plugin family card count must match the marketplace");
  assert(family.marketplace?.applicationPluginCount === applicationCards.length, "public plugin family application count must match the marketplace");
  assert(Boolean(evidenceCard), "marketplace must include seis-public-install-evidence");
  assert(evidenceCard?.source?.path === "./plugins/seis-core/seis-public-install-evidence", "install evidence card source path is invalid");
  assert(evidenceCard?.policy?.installation === "AVAILABLE", "install evidence card must be available");
  assert(evidenceCard?.policy?.authentication === "ON_INSTALL", "install evidence card authentication is invalid");
  assert(evidenceContract.id === "seis-public-plugin-independent-runner-evidence-contract", "independent runner evidence contract is invalid");
  assert(evidenceContract.evidencePath === EVIDENCE_PATH, "independent runner evidence path is invalid");
  assert(evidenceContract.publicReleaseAllowed === false, "independent runner evidence contract must not allow release");
  assert(sameStringSet(evidenceContract.expectedPluginIds, expectedPluginIds), "independent runner expected plugin ids are stale");
  assert(sameStringSet(evidenceContract.expectedEmbeddedModuleIds, expectedEmbeddedModuleIds), "independent runner expected embedded module ids are stale");

  const record = {
    schemaVersion: 1,
    id: "seis-public-install-evidence",
    goalId: "SEIS-GOAL-021",
    generatedAt: GENERATED_AT,
    status: "public-seis-repo-independent-install-evidence-gate",
    decision: "independent-evidence-may-validate-but-human-release-approval-remains-required",
    purpose: "Expose the current independent clean-runner evidence gate for the public SEIS Repo marketplace without accepting arbitrary paths, emitting raw evidence, or turning a valid evidence record into release approval.",
    plugin: {
      name: "seis-public-install-evidence",
      displayName: "SEIS Public Install Evidence",
      marketplaceName: "seis-repo",
      sourcePath: "plugins/seis-core/seis-public-install-evidence",
      publicAudience: "everyone",
      publicMarketplace: true,
    },
    publicCards: {
      marketplaceName: marketplace.name,
      marketplaceDisplayName: marketplace.interface?.displayName,
      count: cards.length,
      canonicalOrchestratorCount: canonicalCards.length,
      migratedRootPluginCount: rootCards.length,
      applicationPluginCount: applicationCards.length,
      topicPluginCount: topicCards.length,
      sourceAvailability: "public-repository-source-available",
      installationPolicy: "AVAILABLE",
      authenticationPolicy: "ON_INSTALL",
    },
    independentEvidence: {
      contractPath: EVIDENCE_CONTRACT_PATH,
      evidencePath: EVIDENCE_PATH,
      defaultEvidenceGate: "npm run check:seis-public-plugin-independent-runner-evidence",
      strictRecordedEvidenceGate: STRICT_RECORDED_GATE,
      expectedPluginIds,
      expectedEmbeddedModuleCount: expectedEmbeddedModuleIds.length,
      sourceWorktreeMustBeInaccessible: true,
      existingCacheMustBeInaccessible: true,
      rawCommandOutputAllowed: false,
      privatePathsAllowed: false,
    },
    evidenceStateModel: [
      {
        id: "not-recorded",
        meaning: "No designated evidence record exists; public release remains blocked.",
      },
      {
        id: "invalid",
        meaning: "The designated evidence record exists but violates the independent-runner or public-safe redaction contract.",
      },
      {
        id: "recorded-valid-awaiting-human-approval",
        meaning: "The designated evidence record validates, but release, publication, external writes, and credentialed activation remain blocked until explicit human approval.",
      },
    ],
    releaseBoundary: {
      evidenceRecordIsPublicReleaseProof: false,
      publicReleaseAllowed: false,
      humanApprovalRequired: true,
      approvalRequiredFor: [
        "public preview",
        "release",
        "publish",
        "push",
        "merge",
        "tag",
        "deploy",
        "SSH",
        "live provider access",
      ],
    },
    limitations: [
      "The plugin reads only one designated evidence record inside the public repository contract.",
      "It does not create independent-runner evidence, perform an installation, or inspect a local cache as evidence.",
      "It does not expose raw command output, private paths, credential-like data, or human approval decisions.",
    ],
    safety: {
      reads: [
        MARKETPLACE_PATH,
        FAMILY_PATH,
        EVIDENCE_CONTRACT_PATH,
        EVIDENCE_PATH,
      ],
      write: [],
      network: [],
      secrets: [],
      installationMutation: false,
      enablementMutation: false,
      publicationMutation: false,
    },
  };
  validateRecord(record, { expectedCardCount, applicationCards, expectedPluginIds, expectedEmbeddedModuleIds });
  return record;
}

function validateRecord(record, context) {
  assert(record.id === "seis-public-install-evidence", "record id is invalid");
  assert(record.goalId === "SEIS-GOAL-021", "record goal id is invalid");
  assert(record.plugin?.name === "seis-public-install-evidence", "record plugin name is invalid");
  assert(record.plugin?.marketplaceName === "seis-repo", "record marketplace name is invalid");
  assert(record.plugin?.sourcePath === "plugins/seis-core/seis-public-install-evidence", "record source path is invalid");
  assert(record.publicCards?.count === context.expectedCardCount, "record public card count is stale");
  assert(record.publicCards?.applicationPluginCount === context.applicationCards.length, "record application card count is stale");
  assert(record.independentEvidence?.contractPath === EVIDENCE_CONTRACT_PATH, "record evidence contract path is invalid");
  assert(record.independentEvidence?.evidencePath === EVIDENCE_PATH, "record evidence path is invalid");
  assert(record.independentEvidence?.strictRecordedEvidenceGate === STRICT_RECORDED_GATE, "record strict evidence gate is invalid");
  assert(sameStringSet(record.independentEvidence?.expectedPluginIds, context.expectedPluginIds), "record expected plugin ids are stale");
  assert(record.independentEvidence?.expectedEmbeddedModuleCount === context.expectedEmbeddedModuleIds.length, "record expected embedded module count is stale");
  assert(record.releaseBoundary?.publicReleaseAllowed === false, "record must not allow public release");
  assert(record.releaseBoundary?.evidenceRecordIsPublicReleaseProof === false, "record must not turn evidence into release proof");
  assert(record.releaseBoundary?.humanApprovalRequired === true, "record must retain the human approval gate");
  assert(record.safety?.write?.length === 0, "record writes must be empty");
  assert(record.safety?.network?.length === 0, "record network permissions must be empty");
  assert(record.safety?.secrets?.length === 0, "record secret permissions must be empty");
  const serialized = JSON.stringify(record);
  assert(!/\bpersonal\b/i.test(serialized), "record must not expose visible personal terminology");
  assert(!/(?:^\/|^~\/|^[A-Za-z]:[\\/]|\/Users\/|\/home\/)/.test(serialized), "record must not expose machine-specific paths");
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

function sameStringSet(actual, expected) {
  if (!Array.isArray(actual) || actual.length !== expected.length) return false;
  return actual.every((value) => typeof value === "string") && new Set(actual).size === actual.length && actual.every((value) => expected.includes(value));
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public install evidence: ${message}`);
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
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
