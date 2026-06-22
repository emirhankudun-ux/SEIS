#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { getPublishReadinessState } = require("./lib/publish-readiness-state.cjs");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const reportFile = path.join(ROOT, "reports", "code-automation-plan.md");
const contractFile = path.join(ROOT, "content", "development", "code-automation-plan.json");
const cloud = JSON.parse(fs.readFileSync(path.join(ROOT, "deploy", "cloud-environment.json"), "utf8"));
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "development", "connector-capability-registry.json"), "utf8"));
const existingContract = readExistingContract(contractFile);
const generatedAt = process.env.SEIS_CODE_PLAN_REFRESH_TIMESTAMP === "1" || !existingContract?.generatedAt
  ? new Date().toISOString()
  : existingContract.generatedAt;
const publishState = getPublishReadinessState(ROOT);
const nextCodingLoop = [
  "Inspect current dirty files and keep unrelated changes untouched.",
  "Pick one reversible product, cloud, governance, or quality slice.",
  "Run local static checks before remote actions.",
  "Refresh release artifacts only after source changes.",
  "Push only when publish readiness is clean."
];
const validationCommands = [
  "npm run check:branch",
  "npm run check:software-languages",
  "npm run check:seis-cloud-environment",
  "npm run check:server-target",
  "npm run quality",
  "npm run publish:preflight"
];

const contract = {
  version: 1,
  id: "seis-code-automation-plan",
  generatedAt,
  branchTarget: cloud.branch,
  remoteTarget: cloud.remote,
  cloudMode: cloud.mode,
  connectorMode: registry.mode,
  policy: {
    executionMode: "high-efficiency-machine-light",
    changeScope: "one-small-reversible-source-improvement",
    connectorActivation: registry.policy?.execution || "use_only_when_relevant_to_the_current_task",
    pushRule: "fast-forward-safe-only-after-clean-publish-readiness"
  },
  nextCodingLoop,
  validationCommands,
  connectorCandidates: registry.connectors.map((connector) => ({
    id: connector.id,
    surface: connector.surface,
    status: connector.status,
    activationPolicy: connector.activationPolicy,
    qualityCommands: connector.qualityCommands || []
  })),
  cloudProviderCandidates: cloud.providers.map((provider) => ({
    id: provider.id,
    kind: provider.kind,
    status: provider.status,
    uploadModel: provider.uploadModel,
    rollback: provider.rollback,
    qualityCommands: provider.qualityCommands || []
  })),
  guardrails: cloud.guardrails
};

const lines = [
  "# SEIS Code Automation Plan",
  "",
  `- Generated: ${generatedAt}`,
  `- Branch target: ${contract.branchTarget}`,
  `- Remote target: ${contract.remoteTarget}`,
  `- Cloud mode: ${contract.cloudMode}`,
  `- Connector mode: ${contract.connectorMode}`,
  "",
  "## Publish Readiness Snapshot",
  "",
  `- Branch status: ${publishState.statusLine || "unknown"}`,
  `- Worktree clean: ${publishState.worktreeClean ? "yes" : "no"}`,
  `- Upstream: ${publishState.hasUpstream ? publishState.upstreamName : "missing"}`,
  `- Upstream sync: ${publishState.syncLabel}`,
  `- GitHub auth: ${publishState.authReady ? "ready" : "missing"}`,
  `- Publish state: ${publishState.ready ? "ready" : "blocked"}`,
  `- Next publish action: ${publishState.ready ? "bounded push attempt is allowed" : publishState.action}`,
  "",
  "## Next Coding Loop",
  "",
  ...nextCodingLoop.map((step, index) => `${index + 1}. ${step}`),
  "",
  "## Validation Commands",
  "",
  ...validationCommands.map((command) => `- \`${command}\``),
  "",
  "## Connector Candidates",
  "",
  ...registry.connectors.map((connector) => {
    const blockedWithout = Array.isArray(connector.blockedWithout) && connector.blockedWithout.length > 0
      ? connector.blockedWithout.join(", ")
      : "none";
    return `- ${connector.id}: ${connector.surface} (${connector.activationPolicy}); blockedWithout=${blockedWithout}`;
  }),
  "",
  "## Cloud Provider Candidates",
  "",
  ...cloud.providers.map((provider) => `- ${provider.id}: ${provider.uploadModel}; rollback=${provider.rollback}`),
  "",
  "## Guardrails",
  "",
  ...cloud.guardrails.map((rule) => `- ${rule}`),
  ""
];

fs.mkdirSync(path.dirname(reportFile), { recursive: true });
fs.mkdirSync(path.dirname(contractFile), { recursive: true });
const reportText = `${lines.join("\n")}\n`;
const contractText = `${JSON.stringify(contract, null, 2)}\n`;

if (checkMode) {
  const drift = [];
  if (readText(reportFile) !== reportText) {
    drift.push(path.relative(ROOT, reportFile));
  }
  if (readText(contractFile) !== contractText) {
    drift.push(path.relative(ROOT, contractFile));
  }
  if (drift.length > 0) {
    console.error("Code automation plan is stale:");
    for (const file of drift) {
      console.error(`- ${file}`);
    }
    console.error("Run npm run automation:code-plan to refresh generated files.");
    process.exit(1);
  }
  console.log("Code automation plan check passed.");
} else {
  fs.writeFileSync(reportFile, reportText);
  fs.writeFileSync(contractFile, contractText);
  console.log(`Code automation plan written: ${path.relative(ROOT, reportFile)}`);
  console.log(`Code automation contract written: ${path.relative(ROOT, contractFile)}`);
}

function readExistingContract(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_error) {
    return null;
  }
}

function readText(file) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}
