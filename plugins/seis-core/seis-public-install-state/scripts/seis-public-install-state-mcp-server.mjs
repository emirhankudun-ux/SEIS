#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_FINDINGS = 100;
const CONTRACTS = Object.freeze({
  marketplace: ".agents/plugins/marketplace.json",
  family: "content/development/seis-public-plugin-family.json",
  externalProof: "content/development/seis-public-plugin-external-install-proof.json",
  independentContract: "content/development/seis-public-plugin-independent-runner-evidence-contract.json",
  freshTaskProof: "content/development/seis-public-plugin-fresh-task-proof.json",
  installState: "content/development/seis-public-install-state.json"
});

function status() {
  const report = validateInstallState();
  return {
    plugin: "seis-public-install-state",
    status: report.ok ? "ready" : report.state,
    mode: "public-seis-repo-install-evidence-read-only",
    marketplace: compactMarketplace(report),
    readiness: report.readiness || null,
    network: "disabled-by-design",
    installsPackages: false,
    executesPluginCode: false,
    writes: "disabled-by-design",
    secrets: "not-read"
  };
}

function validateInstallState() {
  const located = findRepoRoot();
  if (!located) return unavailable("seis-repo-marketplace-not-found");
  const loaded = readContracts(located.repoRoot);
  if (loaded.error) return unavailable(loaded.error);

  const { marketplace, family, externalProof, independentContract, freshTaskProof, installState } = loaded.contracts;
  const findings = [];
  const cards = safeArray(marketplace.plugins);
  const canonicalCards = safeArray(family.publicPlugins);
  const bundleCards = safeArray(family.bundlePackages);
  const applicationBundleCards = bundleCards.filter((bundle) => bundle?.family === "application");
  const topicBundleCards = bundleCards.filter((bundle) => bundle?.family === "topic");
  const rootCapabilities = safeArray(family.migratedRootPlugins);
  const applicationCapabilities = safeArray(family.applicationPlugins);
  const topicCapabilities = safeArray(family.topicPlugins);
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
  const independentEvidence = readOptionalEvidence(located.repoRoot, independentContract.evidencePath);
  const independentEvidenceStatus = text(independentEvidence?.status) || "pending-independent-clean-runner-or-public-install";
  const independentInstallationVerified = independentEvidenceStatus === "recorded-independent-clean-runner-evidence";
  const freshTaskStatus = text(freshTaskProof.reloadEvidence?.status) || "not-recorded";

  ensure(marketplace.name === "seis-repo", findings, "marketplace-name-invalid");
  ensure(marketplace.interface?.displayName === "SEIS Repo", findings, "marketplace-display-name-invalid");
  ensure(cards.length === expectedCardCount, findings, "marketplace-card-count-mismatch");
  ensure(cardsMatchProjection(cards, family.marketplace?.entries), findings, "marketplace-curated-projection-mismatch");
  ensure(cardsHavePublicSource(cards), findings, "marketplace-public-source-boundary-invalid");
  ensure(family.marketplace?.publicPluginCount === expectedCardCount, findings, "family-card-count-mismatch");
  ensure(family.marketplace?.canonicalOrchestratorCount === canonicalCards.length, findings, "family-canonical-count-mismatch");
  ensure(family.marketplace?.bundlePluginCount === bundleCards.length, findings, "family-bundle-count-mismatch");
  ensure(family.marketplace?.applicationBundlePluginCount === applicationBundleCards.length, findings, "family-application-bundle-count-mismatch");
  ensure(family.marketplace?.topicBundlePluginCount === topicBundleCards.length, findings, "family-topic-bundle-count-mismatch");
  ensure(family.marketplace?.migratedRootPluginCount === rootCapabilities.length, findings, "family-root-source-count-mismatch");
  ensure(family.marketplace?.applicationPluginCount === applicationCapabilities.length, findings, "family-application-source-count-mismatch");
  ensure(family.marketplace?.topicPluginCount === topicCapabilities.length, findings, "family-topic-source-count-mismatch");
  ensure(family.marketplace?.sourceCapabilityCount === expectedSourceCapabilityCount, findings, "family-source-capability-count-mismatch");
  ensure(Boolean(installStateBundle), findings, "install-state-capability-bundle-missing");
  ensure(Boolean(installStateCard), findings, "install-state-bundle-card-missing");
  ensure(installStateCard?.source?.path === installStateBundle?.sourcePath, findings, "install-state-bundle-card-source-path-invalid");
  ensure(installStateCard?.policy?.installation === "AVAILABLE", findings, "install-state-card-installation-invalid");
  ensure(installStateCard?.policy?.authentication === "ON_INSTALL", findings, "install-state-card-authentication-invalid");
  ensure(installState.id === "seis-public-install-state", findings, "install-state-id-invalid");
  ensure(installState.goalId === "SEIS-GOAL-021", findings, "install-state-goal-invalid");
  ensure(installState.plugin?.name === "seis-public-install-state", findings, "install-state-plugin-name-invalid");
  ensure(installState.plugin?.marketplaceName === "seis-repo", findings, "install-state-plugin-marketplace-invalid");
  ensure(installState.plugin?.sourcePath === "plugins/seis-core/seis-public-install-state", findings, "install-state-plugin-source-path-invalid");
  ensure(installState.plugin?.distributionMode === "bundled-source-capability", findings, "install-state-distribution-mode-invalid");
  ensure(installState.plugin?.marketplaceCardName === installStateBundle?.id, findings, "install-state-bundle-name-invalid");
  ensure(installState.plugin?.marketplaceCardSourcePath === installStateBundle?.sourcePath, findings, "install-state-bundle-source-path-invalid");
  ensure(installState.publicCards?.count === expectedCardCount, findings, "install-state-card-count-invalid");
  ensure(installState.publicCards?.canonicalOrchestratorCount === canonicalCards.length, findings, "install-state-canonical-count-invalid");
  ensure(installState.publicCards?.bundleCardCount === bundleCards.length, findings, "install-state-bundle-count-invalid");
  ensure(installState.publicCards?.applicationBundleCardCount === applicationBundleCards.length, findings, "install-state-application-bundle-count-invalid");
  ensure(installState.publicCards?.topicBundleCardCount === topicBundleCards.length, findings, "install-state-topic-bundle-count-invalid");
  ensure(installState.sourceCapabilities?.count === expectedSourceCapabilityCount, findings, "install-state-source-capability-count-invalid");
  ensure(installState.sourceCapabilities?.migratedRootCount === rootCapabilities.length, findings, "install-state-root-source-count-invalid");
  ensure(installState.sourceCapabilities?.applicationCount === applicationCapabilities.length, findings, "install-state-application-source-count-invalid");
  ensure(installState.sourceCapabilities?.topicCount === topicCapabilities.length, findings, "install-state-topic-source-count-invalid");
  ensure(installState.sourceCapabilities?.separateMarketplaceCards === false, findings, "install-state-source-card-boundary-invalid");
  ensure(installState.publicCards?.sourceAvailability === "public-repository-source-available", findings, "install-state-source-availability-invalid");
  ensure(installState.publicCards?.externalInstallationProven === independentInstallationVerified, findings, "install-state-independent-installation-stale");
  ensure(installState.canonicalDefaultInstall?.installId === "seis-ai-agent@seis-repo", findings, "install-state-canonical-install-id-invalid");
  ensure(installState.evidence?.historicalRepoLocalArtifactStage?.verified === true, findings, "install-state-historical-artifact-stage-invalid");
  ensure(installState.evidence?.historicalRepoLocalArtifactStage?.historicalSnapshot === true, findings, "install-state-historical-artifact-label-invalid");
  ensure(installState.evidence?.historicalRepoLocalArtifactStage?.capturedMarketplaceCardCount === historicalArtifactCardCount, findings, "install-state-historical-artifact-card-count-invalid");
  ensure(installState.evidence?.historicalRepoLocalArtifactStage?.capturedSourceCapabilityCount === historicalSourceCapabilityCount, findings, "install-state-historical-artifact-source-count-invalid");
  ensure(installState.evidence?.historicalRepoLocalArtifactStage?.currentMarketplaceCardCount === expectedCardCount, findings, "install-state-current-card-count-invalid");
  ensure(installState.evidence?.historicalRepoLocalArtifactStage?.status === externalProof.status, findings, "install-state-historical-artifact-status-stale");
  ensure(installState.evidence?.freshTaskReload?.status === freshTaskStatus, findings, "install-state-fresh-task-status-stale");
  ensure(installState.evidence?.independentRunner?.contractStatus === independentContract.status, findings, "install-state-independent-contract-status-stale");
  ensure(installState.evidence?.independentRunner?.evidenceStatus === independentEvidenceStatus, findings, "install-state-independent-evidence-status-stale");
  ensure(installState.readiness?.repositorySourceAvailable === true, findings, "install-state-repository-source-readiness-invalid");
  ensure(installState.readiness?.currentMarketplaceProjectionVerified === true, findings, "install-state-current-marketplace-readiness-invalid");
  ensure(installState.readiness?.historicalSourceArtifactStageVerified === true, findings, "install-state-historical-artifact-readiness-invalid");
  ensure(installState.readiness?.independentInstallationVerified === independentInstallationVerified, findings, "install-state-independent-readiness-stale");
  ensure(installState.readiness?.publicReleaseAllowed === false, findings, "install-state-must-not-claim-public-release");
  ensure(artifactStage.ok === true, findings, "external-artifact-stage-not-verified");
  ensure(historicalCanonicalCardCount === canonicalCards.length, findings, "external-artifact-stage-canonical-count-stale");
  ensure(historicalSourceCapabilityCount === expectedSourceCapabilityCount, findings, "external-artifact-stage-source-count-stale");
  ensure(historicalArtifactCardCount === canonicalCards.length + historicalSourceCapabilityCount, findings, "external-artifact-stage-historical-projection-invalid");
  ensure(externalProof.publicReleaseAllowed === false, findings, "external-artifact-stage-must-not-claim-public-release");
  ensure(independentContract.status === "active-evidence-intake-contract", findings, "independent-evidence-contract-invalid");
  ensure(independentContract.publicReleaseAllowed === false, findings, "independent-evidence-contract-must-not-claim-public-release");
  ensure(!/\bpersonal\b/i.test(JSON.stringify(installState)), findings, "install-state-visible-personal-terminology");
  ensure(!/(?:^\/|^~\/|^[A-Za-z]:[\\/]|\/Users\/|\/home\/)/.test(JSON.stringify(installState)), findings, "install-state-machine-path");

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  return {
    state: errorCount ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "public-seis-repo-install-evidence-read-only",
    marketplaceName: marketplace.name === "seis-repo" ? "seis-repo" : null,
    marketplaceDisplayName: marketplace.interface?.displayName === "SEIS Repo" ? "SEIS Repo" : null,
    publicCards: {
      count: cards.length,
      canonicalOrchestratorCount: canonicalCards.length,
      bundleCardCount: bundleCards.length,
      applicationBundleCardCount: applicationBundleCards.length,
      topicBundleCardCount: topicBundleCards.length,
      sourceAvailability: installState.publicCards?.sourceAvailability || null
    },
    sourceCapabilities: {
      count: expectedSourceCapabilityCount,
      migratedRootCount: rootCapabilities.length,
      applicationCount: applicationCapabilities.length,
      topicCount: topicCapabilities.length,
      separateMarketplaceCards: false
    },
    readiness: installState.readiness || null,
    evidence: installState.evidence || null,
    nextRequiredEvidence: safeArray(installState.nextRequiredEvidence),
    errorCount,
    findings: findings.slice(0, MAX_FINDINGS),
    permissions: permissionBoundary(),
    limitations: [
      "This plugin reads fixed public SEIS repository contracts only.",
      "An AVAILABLE card is public source visibility, not an installation, authentication, independent-runner, publication, or release approval claim.",
      "Validation does not install, enable, publish, deploy, push, or authorize any plugin capability."
    ]
  };
}

function compactMarketplace(report) {
  return {
    state: report.state,
    available: report.ok,
    marketplaceName: report.marketplaceName || null,
    marketplaceDisplayName: report.marketplaceDisplayName || null,
    publicCardCount: report.publicCards?.count ?? null,
    bundleCardCount: report.publicCards?.bundleCardCount ?? null,
    sourceCapabilityCount: report.sourceCapabilities?.count ?? null
  };
}

function findRepoRoot() {
  const candidates = [process.env.SEIS_REPO_ROOT, process.env.SEIS_ROOT, pluginRoot]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => path.resolve(value));
  for (const candidate of candidates) {
    let current = candidate;
    while (true) {
      const marketplacePath = path.join(current, CONTRACTS.marketplace);
      if (isRegularFile(marketplacePath)) {
        const result = readJsonFile(marketplacePath);
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
    if (!isInside(repoRoot, absolutePath) || !isRegularFile(absolutePath)) return { error: "public-install-contract-missing-or-unsafe" };
    const result = readJsonFile(absolutePath);
    if (result.error) return { error: "public-install-contract-invalid" };
    contracts[name] = result.data;
  }
  return { contracts };
}

function readOptionalEvidence(repoRoot, relativePath) {
  const candidate = text(relativePath);
  if (!candidate || candidate.includes("..") || path.isAbsolute(candidate)) return null;
  const absolutePath = path.resolve(repoRoot, candidate);
  if (!isInside(repoRoot, absolutePath) || !isRegularFile(absolutePath)) return null;
  return readJsonFile(absolutePath).data || null;
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
  const projection = safeArray(entries);
  if (cards.length !== projection.length) return false;
  const expected = new Map(projection.map((entry) => [text(entry?.name), text(entry?.sourcePath)]));
  return expected.size === projection.length && cards.every((card) => expected.get(text(card?.name)) === text(card?.source?.path));
}

function findCapabilityBundle(bundles, capabilityName) {
  return bundles.find((bundle) => safeArray(bundle?.members).some((member) => text(member?.name) === capabilityName)) || null;
}

function unavailable(reason) {
  return {
    state: "unavailable",
    ok: false,
    mode: "public-seis-repo-install-evidence-read-only",
    reason,
    findings: [],
    permissions: permissionBoundary()
  };
}

function safeArray(value) {
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

function readJsonFile(filePath) {
  try {
    return { data: JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch {
    return { error: "invalid-json" };
  }
}

function permissionBoundary() {
  return {
    read: [
      "bounded public SEIS Repo marketplace and install-evidence contracts"
    ],
    write: [],
    network: [],
    secrets: []
  };
}

const tools = [
  {
    name: "seis_public_install_state_status",
    description: "Report public SEIS Repo source and install-evidence state without installing packages.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "seis_public_install_state_validate",
    description: "Validate public SEIS Repo install-evidence state without writes or network access.",
    inputSchema: { type: "object", properties: {} }
  }
];

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

let pending = Buffer.alloc(0);

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-public-install-state", version: "0.1.0" } } });
  } else if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  } else if (message.method === "tools/call") {
    const name = message.params?.name;
    if (name === "seis_public_install_state_status") send({ jsonrpc: "2.0", id: message.id, result: status() });
    else if (name === "seis_public_install_state_validate") send({ jsonrpc: "2.0", id: message.id, result: validateInstallState() });
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
      // Ignore malformed MCP frames without echoing caller input.
    }
    pending = pending.slice(start + length);
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
} else if (args.includes("--validate")) {
  console.log(JSON.stringify(validateInstallState(), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
