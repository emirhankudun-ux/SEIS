#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const reportsDir = path.join(ROOT, "reports");
const jsonReport = path.join(reportsDir, "server-cloud-activation-report.json");
const mdReport = path.join(reportsDir, "server-cloud-activation-report.md");
const serverTargets = readJson("deploy/server-targets.json");
const cloudEnvironment = readJson("deploy/cloud-environment.json");
const existingReport = readExistingReport(jsonReport);
const generatedAt = process.env.SEIS_SERVER_CLOUD_REPORT_REFRESH_TIMESTAMP === "1" || !existingReport?.generatedAt
  ? new Date().toISOString()
  : existingReport.generatedAt;

function readJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return { missing: true, path: relativePath };
  }
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function envValue(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? "set" : "missing";
}

function buildSecretStatus(secrets) {
  return (secrets || []).map((secret) => ({
    name: secret.name,
    status: envValue(secret.name),
    scope: secret.scope,
    storage: secret.storage,
    requiredFor: secret.requiredFor || []
  }));
}

function chooseBlockers(targets, cloud, secrets) {
  const blockers = [];

  if (!targets.activeTarget) {
    blockers.push("server activeTarget is not configured");
  }
  if (envValue("SEIS_SITE_URL") === "missing") {
    blockers.push("SEIS_SITE_URL is missing");
  }
  if (envValue("SEIS_CLOUD_PROVIDER") === "missing") {
    blockers.push("SEIS_CLOUD_PROVIDER is missing");
  }
  if (!fs.existsSync(path.join(ROOT, cloud.releasePackage || ""))) {
    blockers.push(`release package is missing: ${cloud.releasePackage || "unknown"}`);
  }
  if (!fs.existsSync(path.join(ROOT, cloud.manifest || ""))) {
    blockers.push(`release manifest is missing: ${cloud.manifest || "unknown"}`);
  }

  const selectedProvider = process.env.SEIS_CLOUD_PROVIDER;
  const matchingProvider = (cloud.providers || []).find((provider) => provider.id === selectedProvider);
  if (selectedProvider && !matchingProvider) {
    blockers.push(`SEIS_CLOUD_PROVIDER does not match a candidate provider: ${selectedProvider}`);
  }

  const requiredSecrets = secrets.filter((secret) =>
    !selectedProvider || (secret.requiredFor || []).includes(selectedProvider)
  );
  const missingRequiredSecrets = requiredSecrets.filter((secret) => secret.status === "missing");
  if (selectedProvider && missingRequiredSecrets.length > 0) {
    blockers.push(`required provider secrets are missing: ${missingRequiredSecrets.map((secret) => secret.name).join(", ")}`);
  }

  return blockers;
}

const secretStatus = buildSecretStatus(cloudEnvironment.environment?.secrets);
const blockers = chooseBlockers(serverTargets, cloudEnvironment, secretStatus);
const report = {
  version: 1,
  id: "seis-server-cloud-activation-report",
  generatedAt,
  readyForLiveUpload: blockers.length === 0,
  branch: cloudEnvironment.branch,
  remote: cloudEnvironment.remote,
  activeTarget: serverTargets.activeTarget,
  selectedProvider: process.env.SEIS_CLOUD_PROVIDER || null,
  siteUrl: process.env.SEIS_SITE_URL || null,
  releasePackage: {
    path: cloudEnvironment.releasePackage,
    exists: fs.existsSync(path.join(ROOT, cloudEnvironment.releasePackage || ""))
  },
  manifest: {
    path: cloudEnvironment.manifest,
    exists: fs.existsSync(path.join(ROOT, cloudEnvironment.manifest || ""))
  },
  providerCandidates: cloudEnvironment.providers || [],
  secretStatus,
  blockers,
  nextActions: blockers.length === 0
    ? ["Run provider-specific upload adapter after final user confirmation."]
    : [
        "Select one server/cloud target.",
        "Set SEIS_SITE_URL and SEIS_CLOUD_PROVIDER.",
        "Store only the selected provider secret outside git.",
        "Rerun npm run automation:server-cloud-report."
      ]
};

const markdown = [
  "# SEIS Server Cloud Activation Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Ready for live upload: ${report.readyForLiveUpload ? "yes" : "no"}`,
  `- Branch: ${report.branch}`,
  `- Remote: ${report.remote}`,
  `- Active target: ${report.activeTarget || "not configured"}`,
  `- Selected provider: ${report.selectedProvider || "not configured"}`,
  `- Site URL: ${report.siteUrl || "not configured"}`,
  `- Release package: ${report.releasePackage.exists ? "present" : "missing"} (${report.releasePackage.path})`,
  `- Manifest: ${report.manifest.exists ? "present" : "missing"} (${report.manifest.path})`,
  "",
  "## Blockers",
  "",
  ...(report.blockers.length > 0 ? report.blockers.map((blocker) => `- ${blocker}`) : ["- none"]),
  "",
  "## Next Actions",
  "",
  ...report.nextActions.map((action) => `- ${action}`),
  ""
].join("\n");

fs.mkdirSync(reportsDir, { recursive: true });

if (checkMode) {
  const expectedJson = `${JSON.stringify(report, null, 2)}\n`;
  const expectedMarkdown = `${markdown}\n`;
  const drift = [];

  if (readText(jsonReport) !== expectedJson) drift.push(path.relative(ROOT, jsonReport));
  if (readText(mdReport) !== expectedMarkdown) drift.push(path.relative(ROOT, mdReport));

  if (drift.length > 0) {
    console.error("Server cloud activation report is stale:");
    for (const file of drift) console.error(`- ${file}`);
    console.error("Run npm run automation:server-cloud-report to refresh generated files.");
    process.exit(1);
  }

  console.log("Server cloud activation report check passed.");
} else {
  fs.writeFileSync(jsonReport, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdReport, `${markdown}\n`);
  console.log(`Server cloud activation report written: ${path.relative(ROOT, mdReport)}`);
  console.log(`Server cloud activation contract written: ${path.relative(ROOT, jsonReport)}`);
}

function readExistingReport(file) {
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
