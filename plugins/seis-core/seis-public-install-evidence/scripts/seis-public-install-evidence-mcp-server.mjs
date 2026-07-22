#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_INDEPENDENT_RUNNER_EVIDENCE_PATH,
  INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH,
  inspectIndependentRunnerEvidence,
} from "../../runtime/public-install-evidence-runtime.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_FINDINGS = 100;
const CONTRACTS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  family: "content/development/seis-public-plugin-family.json",
  evidenceContract: INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH,
  installEvidence: "content/development/seis-public-install-evidence.json",
});

function status() {
  const validation = validatePublicInstallEvidence();
  const evidence = inspectPublicInstallEvidence();
  return {
    plugin: "seis-public-install-evidence",
    status: validation.ok ? "ready" : validation.state,
    mode: "public-seis-repo-independent-install-evidence-read-only",
    marketplace: compactMarketplace(validation),
    evidenceGate: compactEvidence(evidence),
    publicReleaseAllowed: false,
    network: "disabled-by-design",
    installsPackages: false,
    enablesPackages: false,
    writes: "disabled-by-design",
    secrets: "not-read",
  };
}

function validatePublicInstallEvidence() {
  const located = findRepoRoot();
  if (!located) return unavailable("seis-repo-marketplace-not-found");
  const loaded = readContracts(located.repoRoot);
  if (loaded.error) return unavailable(loaded.error);

  const { marketplace, family, evidenceContract, installEvidence } = loaded.contracts;
  const findings = [];
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
  const expectedInstallIds = canonicalCards.map((item) => text(item?.installId)).filter(Boolean).sort();
  const expectedEmbeddedIds = array(family.embeddedModules || family.plugins).map((item) => text(item?.name)).filter(Boolean).sort();
  const evidenceBundle = findCapabilityBundle(bundleCards, "seis-public-install-evidence");
  const evidenceCard = cards.find((card) => card?.name === evidenceBundle?.id);

  ensure(marketplace.name === "seis-repo", findings, "marketplace-name-invalid");
  ensure(marketplace.interface?.displayName === "SEIS Repo", findings, "marketplace-display-name-invalid");
  ensure(cards.length === expectedCardCount, findings, "marketplace-card-count-mismatch");
  ensure(cardsMatchProjection(cards, family.marketplace?.entries), findings, "marketplace-curated-projection-mismatch");
  ensure(cardsHavePublicSource(cards), findings, "marketplace-public-source-boundary-invalid");
  ensure(family.marketplace?.publicPluginCount === expectedCardCount, findings, "family-card-count-mismatch");
  ensure(family.marketplace?.bundlePluginCount === bundleCards.length, findings, "family-bundle-count-mismatch");
  ensure(family.marketplace?.sourceCapabilityCount === expectedSourceCapabilityCount, findings, "family-source-capability-count-mismatch");
  ensure(Boolean(evidenceBundle), findings, "install-evidence-capability-bundle-missing");
  ensure(Boolean(evidenceCard), findings, "install-evidence-bundle-card-missing");
  ensure(evidenceCard?.source?.path === evidenceBundle?.sourcePath, findings, "install-evidence-bundle-card-source-path-invalid");
  ensure(evidenceCard?.policy?.installation === "AVAILABLE", findings, "install-evidence-card-installation-invalid");
  ensure(evidenceCard?.policy?.authentication === "ON_INSTALL", findings, "install-evidence-card-authentication-invalid");
  ensure(evidenceContract.id === "seis-public-plugin-independent-runner-evidence-contract", findings, "evidence-contract-id-invalid");
  ensure(evidenceContract.evidencePath === DEFAULT_INDEPENDENT_RUNNER_EVIDENCE_PATH, findings, "evidence-contract-path-invalid");
  ensure(evidenceContract.publicReleaseAllowed === false, findings, "evidence-contract-must-not-allow-release");
  ensure(sameStringSet(evidenceContract.expectedPluginIds, expectedInstallIds), findings, "evidence-contract-install-id-mismatch");
  ensure(sameStringSet(evidenceContract.expectedEmbeddedModuleIds, expectedEmbeddedIds), findings, "evidence-contract-embedded-module-mismatch");
  ensure(installEvidence.id === "seis-public-install-evidence", findings, "install-evidence-id-invalid");
  ensure(installEvidence.goalId === "SEIS-GOAL-021", findings, "install-evidence-goal-invalid");
  ensure(installEvidence.plugin?.name === "seis-public-install-evidence", findings, "install-evidence-plugin-name-invalid");
  ensure(installEvidence.plugin?.marketplaceName === "seis-repo", findings, "install-evidence-plugin-marketplace-invalid");
  ensure(installEvidence.plugin?.sourcePath === "plugins/seis-core/seis-public-install-evidence", findings, "install-evidence-plugin-source-path-invalid");
  ensure(installEvidence.plugin?.distributionMode === "bundled-source-capability", findings, "install-evidence-distribution-mode-invalid");
  ensure(installEvidence.plugin?.marketplaceCardName === evidenceBundle?.id, findings, "install-evidence-bundle-name-invalid");
  ensure(installEvidence.plugin?.marketplaceCardSourcePath === evidenceBundle?.sourcePath, findings, "install-evidence-bundle-source-path-invalid");
  ensure(installEvidence.publicCards?.count === expectedCardCount, findings, "install-evidence-card-count-invalid");
  ensure(installEvidence.publicCards?.canonicalOrchestratorCount === canonicalCards.length, findings, "install-evidence-canonical-count-invalid");
  ensure(installEvidence.publicCards?.bundleCardCount === bundleCards.length, findings, "install-evidence-bundle-count-invalid");
  ensure(installEvidence.publicCards?.applicationBundleCardCount === applicationBundleCards.length, findings, "install-evidence-application-bundle-count-invalid");
  ensure(installEvidence.publicCards?.topicBundleCardCount === topicBundleCards.length, findings, "install-evidence-topic-bundle-count-invalid");
  ensure(installEvidence.sourceCapabilities?.count === expectedSourceCapabilityCount, findings, "install-evidence-source-capability-count-invalid");
  ensure(installEvidence.sourceCapabilities?.migratedRootCount === rootCapabilities.length, findings, "install-evidence-root-source-count-invalid");
  ensure(installEvidence.sourceCapabilities?.applicationCount === applicationCapabilities.length, findings, "install-evidence-application-source-count-invalid");
  ensure(installEvidence.sourceCapabilities?.topicCount === topicCapabilities.length, findings, "install-evidence-topic-source-count-invalid");
  ensure(installEvidence.sourceCapabilities?.separateMarketplaceCards === false, findings, "install-evidence-source-card-boundary-invalid");
  ensure(installEvidence.independentEvidence?.contractPath === CONTRACTS.evidenceContract, findings, "install-evidence-contract-reference-invalid");
  ensure(installEvidence.independentEvidence?.evidencePath === DEFAULT_INDEPENDENT_RUNNER_EVIDENCE_PATH, findings, "install-evidence-record-reference-invalid");
  ensure(installEvidence.independentEvidence?.strictRecordedEvidenceGate === "npm run check:seis-public-plugin-independent-runner-evidence:recorded", findings, "install-evidence-strict-gate-invalid");
  ensure(sameStringSet(installEvidence.independentEvidence?.expectedPluginIds, expectedInstallIds), findings, "install-evidence-expected-install-ids-invalid");
  ensure(installEvidence.independentEvidence?.expectedEmbeddedModuleCount === expectedEmbeddedIds.length, findings, "install-evidence-embedded-count-invalid");
  ensure(installEvidence.releaseBoundary?.publicReleaseAllowed === false, findings, "install-evidence-must-not-allow-release");
  ensure(installEvidence.releaseBoundary?.evidenceRecordIsPublicReleaseProof === false, findings, "install-evidence-must-not-treat-evidence-as-release");
  ensure(installEvidence.releaseBoundary?.humanApprovalRequired === true, findings, "install-evidence-human-approval-boundary-invalid");
  ensure(installEvidence.safety?.write?.length === 0, findings, "install-evidence-write-boundary-invalid");
  ensure(installEvidence.safety?.network?.length === 0, findings, "install-evidence-network-boundary-invalid");
  ensure(installEvidence.safety?.secrets?.length === 0, findings, "install-evidence-secret-boundary-invalid");
  ensure(!/\bpersonal\b/i.test(JSON.stringify(installEvidence)), findings, "install-evidence-visible-personal-terminology");
  ensure(!/(?:^\/|^~\/|^[A-Za-z]:[\\/]|\/Users\/|\/home\/)/.test(JSON.stringify(installEvidence)), findings, "install-evidence-machine-path");

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  return {
    state: errorCount ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "public-seis-repo-independent-install-evidence-read-only",
    marketplaceName: marketplace.name === "seis-repo" ? "seis-repo" : null,
    marketplaceDisplayName: marketplace.interface?.displayName === "SEIS Repo" ? "SEIS Repo" : null,
    publicCards: {
      count: cards.length,
      canonicalOrchestratorCount: canonicalCards.length,
      bundleCardCount: bundleCards.length,
      applicationBundleCardCount: applicationBundleCards.length,
      topicBundleCardCount: topicBundleCards.length,
    },
    sourceCapabilities: {
      count: expectedSourceCapabilityCount,
      migratedRootCount: rootCapabilities.length,
      applicationCount: applicationCapabilities.length,
      topicCount: topicCapabilities.length,
      separateMarketplaceCards: false,
    },
    expectedInstallIds,
    expectedEmbeddedModuleCount: expectedEmbeddedIds.length,
    errorCount,
    findings: findings.slice(0, MAX_FINDINGS),
    permissions: permissionBoundary(),
    limitations: [
      "Validation reads fixed public SEIS Repo contracts only.",
      "A valid independent-runner evidence record is not current Codex enablement, release approval, authorization, or a license to perform external writes.",
      "Validation does not install, enable, update, publish, deploy, push, or authorize any plugin capability.",
    ],
  };
}

function inspectPublicInstallEvidence() {
  const located = findRepoRoot();
  if (!located) return unavailable("seis-repo-marketplace-not-found");
  const validation = validatePublicInstallEvidence();
  if (!validation.ok) {
    return {
      ...validation,
      reason: "public-install-evidence-contract-invalid",
      evidenceObserved: false,
    };
  }

  const report = inspectIndependentRunnerEvidence(located.repoRoot, {
    contractPath: CONTRACTS.evidenceContract,
    inputPath: DEFAULT_INDEPENDENT_RUNNER_EVIDENCE_PATH,
    requireRecorded: false,
  });
  const state = report.status === "not-recorded"
    ? "not-recorded"
    : report.evidenceValid
      ? "recorded-valid-awaiting-human-approval"
      : "invalid";
  return {
    state,
    ok: report.ok,
    mode: "public-seis-repo-independent-install-evidence-read-only",
    marketplaceName: validation.marketplaceName,
    marketplaceDisplayName: validation.marketplaceDisplayName,
    publicCards: validation.publicCards,
    sourceCapabilities: validation.sourceCapabilities,
    evidenceObserved: report.evidenceRecorded === true,
    evidenceRecorded: report.evidenceRecorded === true,
    evidenceValid: report.evidenceValid === true,
    expectedPluginCount: report.expectedPluginCount ?? validation.expectedInstallIds.length,
    expectedEmbeddedModuleCount: report.expectedEmbeddedModuleCount ?? validation.expectedEmbeddedModuleCount,
    failureCount: array(report.failures).length,
    failures: array(report.failures).slice(0, MAX_FINDINGS),
    blockers: array(report.blockers).slice(0, MAX_FINDINGS),
    publicReleaseAllowed: false,
    nextAction: nextAction(state),
    permissions: permissionBoundary(),
    limitations: [
      "The designated record is the only evidence file this plugin inspects.",
      "Raw evidence fields, command output, machine-specific paths, and secret-like values are never returned.",
      "A valid record leaves the human release-approval gate closed.",
    ],
  };
}

function nextAction(state) {
  if (state === "not-recorded") return "Record sanitized evidence from a genuinely independent clean runner; do not use this repository worktree or an existing local cache as proof.";
  if (state === "invalid") return "Correct only the designated sanitized evidence record, then rerun the strict recorded-evidence gate.";
  if (state === "recorded-valid-awaiting-human-approval") return "Request explicit human approval before any public preview, release, publish, push, merge, tag, deploy, SSH, or live-provider action.";
  return "Repair the fixed public evidence contracts before recording external evidence.";
}

function compactMarketplace(report) {
  return {
    state: report.state,
    available: report.ok,
    marketplaceName: report.marketplaceName || null,
    marketplaceDisplayName: report.marketplaceDisplayName || null,
    publicCardCount: report.publicCards?.count ?? null,
    bundleCardCount: report.publicCards?.bundleCardCount ?? null,
    sourceCapabilityCount: report.sourceCapabilities?.count ?? null,
  };
}

function compactEvidence(report) {
  return {
    state: report.state,
    recorded: report.evidenceRecorded === true,
    valid: report.evidenceValid === true,
    expectedPluginCount: report.expectedPluginCount ?? null,
    expectedEmbeddedModuleCount: report.expectedEmbeddedModuleCount ?? null,
    failureCount: report.failureCount ?? 0,
    publicReleaseAllowed: false,
  };
}

function findRepoRoot() {
  const candidates = [process.env.SEIS_REPO_ROOT, process.env.SEIS_ROOT, process.env.SEIS_WORKSPACE_ROOT, pluginRoot]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => path.resolve(value));
  for (const candidate of candidates) {
    let current = candidate;
    while (true) {
      const marketplacePath = path.join(current, CONTRACTS.marketplace);
      if (isRegularFile(marketplacePath)) {
        const result = readJson(marketplacePath);
        if (result.data?.name === "seis-repo" && Array.isArray(result.data?.plugins)) return { repoRoot: current };
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

function readContracts(repoRoot) {
  const contracts = {};
  for (const [name, relativePath] of Object.entries(CONTRACTS)) {
    const absolutePath = path.resolve(repoRoot, relativePath);
    if (!isInside(repoRoot, absolutePath) || !isRegularFile(absolutePath)) return { error: "public-install-evidence-contract-missing-or-unsafe" };
    const result = readJson(absolutePath);
    if (result.error) return { error: "public-install-evidence-contract-invalid" };
    contracts[name] = result.data;
  }
  return { contracts };
}

function cardsHavePublicSource(cards) {
  return cards.length > 0 && cards.every((card) =>
    text(card?.name)
    && card?.source?.source === "local"
    && text(card?.source?.path).startsWith("./plugins/")
    && !text(card?.source?.path).includes("..")
    && card?.policy?.installation === "AVAILABLE"
    && card?.policy?.authentication === "ON_INSTALL"
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

function sameStringSet(actual, expected) {
  if (!Array.isArray(actual) || actual.length !== expected.length) return false;
  return actual.every((value) => typeof value === "string") && new Set(actual).size === actual.length && actual.every((value) => expected.includes(value));
}

function unavailable(reason) {
  return {
    state: "unavailable",
    ok: false,
    mode: "public-seis-repo-independent-install-evidence-read-only",
    reason,
    findings: [],
    permissions: permissionBoundary(),
  };
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function ensure(condition, findings, code) {
  if (condition || findings.length >= MAX_FINDINGS) return;
  findings.push({ severity: "error", code });
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function isRegularFile(filePath) {
  try {
    const stat = fs.lstatSync(filePath);
    return !stat.isSymbolicLink() && stat.isFile();
  } catch {
    return false;
  }
}

function readJson(filePath) {
  try {
    return { data: JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch {
    return { error: "invalid-json" };
  }
}

function permissionBoundary() {
  return {
    read: ["fixed public SEIS Repo evidence contracts and one designated sanitized evidence record"],
    write: [],
    network: [],
    secrets: [],
  };
}

const tools = [
  {
    name: "seis_public_install_evidence_status",
    description: "Inspect the designated public SEIS Repo independent-installation evidence state without installing, enabling, publishing, or authorizing a release.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_public_install_evidence_validate",
    description: "Validate fixed public SEIS Repo install-evidence contracts without reading arbitrary paths, writing files, or using the network.",
    inputSchema: { type: "object", properties: {} },
  },
];

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

let pending = Buffer.alloc(0);

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-public-install-evidence", version: "0.1.0" } } });
  } else if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  } else if (message.method === "tools/call") {
    const name = message.params?.name;
    if (name === "seis_public_install_evidence_status") send({ jsonrpc: "2.0", id: message.id, result: inspectPublicInstallEvidence() });
    else if (name === "seis_public_install_evidence_validate") send({ jsonrpc: "2.0", id: message.id, result: validatePublicInstallEvidence() });
    else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${String(name || "undefined")}` } });
  }
}

function processStream() {
  while (true) {
    const separator = pending.indexOf("\r\n\r\n");
    if (separator < 0) return;
    const match = /Content-Length:\s*(\d+)/i.exec(pending.slice(0, separator).toString("utf8"));
    if (!match) {
      pending = pending.slice(separator + 4);
      continue;
    }
    const length = Number.parseInt(match[1], 10);
    const start = separator + 4;
    if (pending.length < start + length) return;
    try {
      handle(JSON.parse(pending.slice(start, start + length).toString("utf8")));
    } catch {
      // Ignore malformed MCP frames without writing or exposing input data.
    }
    pending = pending.slice(start + length);
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
} else if (args.includes("--validate")) {
  console.log(JSON.stringify(validatePublicInstallEvidence(), null, 2));
} else if (args.includes("--evidence")) {
  console.log(JSON.stringify(inspectPublicInstallEvidence(), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
