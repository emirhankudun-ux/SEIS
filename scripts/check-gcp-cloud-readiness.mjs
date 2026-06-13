#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const project = args.project || process.env.GCP_PROJECT || process.env.CLOUDSDK_CORE_PROJECT || "";
const zone = args.zone || process.env.GCP_ZONE || "us-central1-a";
const instance = args.instance || process.env.GCP_INSTANCE || "seis-cloud-dev";
const sshFirewallRule = args["ssh-firewall-rule"] || "seis-allow-ssh-codex";
const vpnFirewallRule = args["vpn-firewall-rule"] || "seis-allow-wireguard-vpn";
const networkTag = args["network-tag"] || "seis-codex-ssh";
const vpnPort = args["vpn-port"] || process.env.SEIS_VPN_PORT || "51820";
const requireReady = Boolean(args["require-ready"]);

if (args.help) {
  printHelp();
  process.exit(0);
}

const blockers = [];
const warnings = [];
const checks = {
  gcloud: { available: false },
  account: { active: false, value: null },
  project: { selected: Boolean(project), value: project || null },
  billing: { enabled: false, checked: false },
  billingAccounts: { checked: false, available: false, count: 0, openCount: 0, accounts: [] },
  computeApi: { enabled: false, checked: false },
  instance: { exists: false, checked: false, name: instance, zone, externalIp: null },
  sshFirewall: { exists: false, checked: false, sourceRanges: [] },
  vpnFirewall: { exists: false, checked: false, sourceRanges: [] }
};

const gcloudVersion = runGcloud(["version", "--format=json"]);
checks.gcloud = {
  available: gcloudVersion.status === 0,
  version: gcloudVersion.status === 0 ? parseJson(gcloudVersion.stdout, {}) : null
};

if (!checks.gcloud.available) {
  blockers.push("gcloud-missing-or-unavailable");
}

if (!project) {
  blockers.push("project-not-selected");
}

if (checks.gcloud.available) {
  const accountResult = runGcloud(["config", "get-value", "account"]);
  const account = normalizeGcloudValue(accountResult.stdout);
  checks.account = {
    active: accountResult.status === 0 && Boolean(account),
    value: account || null
  };
  if (!checks.account.active) blockers.push("gcloud-account-not-active");

  const activeProjectResult = runGcloud(["config", "get-value", "project"]);
  const activeProject = normalizeGcloudValue(activeProjectResult.stdout);
  checks.project.activeConfigValue = activeProject || null;
  if (project && activeProject && activeProject !== project) {
    warnings.push(`active-gcloud-project-differs:${activeProject}`);
  }
}

if (checks.gcloud.available && project) {
  const billingResult = runGcloud(["billing", "projects", "describe", project, "--format=json"]);
  const billing = parseJson(billingResult.stdout, {});
  checks.billing = {
    checked: true,
    enabled: Boolean(billing.billingEnabled),
    billingAccountName: billing.billingAccountName || null,
    rawStatus: billingResult.status
  };
  if (!checks.billing.enabled) blockers.push("billing-disabled");

  const billingAccountsResult = runGcloud(["billing", "accounts", "list", "--format=json(name,displayName,open)"]);
  const billingAccounts = parseJson(billingAccountsResult.stdout, []);
  const accounts = Array.isArray(billingAccounts)
    ? billingAccounts.map((account) => ({
      name: account.name || null,
      displayName: account.displayName || null,
      open: Boolean(account.open)
    }))
    : [];
  const openAccounts = accounts.filter((account) => account.open);
  checks.billingAccounts = {
    checked: true,
    available: billingAccountsResult.status === 0 && openAccounts.length > 0,
    count: accounts.length,
    openCount: openAccounts.length,
    accounts,
    rawStatus: billingAccountsResult.status
  };
  if (!checks.billing.enabled && billingAccountsResult.status === 0 && openAccounts.length === 0) {
    blockers.push("billing-account-unavailable");
  }
  if (billingAccountsResult.status !== 0) {
    warnings.push("billing-accounts-list-unavailable");
  }

  const servicesResult = runGcloud([
    "services",
    "list",
    "--enabled",
    "--project",
    project,
    "--filter=config.name:compute.googleapis.com",
    "--format=json(config.name,state)"
  ]);
  const services = parseJson(servicesResult.stdout, []);
  checks.computeApi = {
    checked: true,
    enabled: Array.isArray(services) && services.some((service) => service?.config?.name === "compute.googleapis.com" || service?.name === "compute.googleapis.com"),
    rawStatus: servicesResult.status
  };
  if (!checks.computeApi.enabled) blockers.push("compute-api-disabled");
}

if (checks.gcloud.available && project && checks.computeApi.enabled) {
  const instanceResult = runGcloud([
    "compute",
    "instances",
    "describe",
    instance,
    "--project",
    project,
    "--zone",
    zone,
    "--format=json"
  ]);
  const instancePayload = parseJson(instanceResult.stdout, {});
  const externalIp = instancePayload?.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP || null;
  checks.instance = {
    checked: true,
    exists: instanceResult.status === 0,
    name: instance,
    zone,
    externalIp,
    status: instancePayload.status || null,
    rawStatus: instanceResult.status
  };
  if (!checks.instance.exists) blockers.push("instance-missing");
  if (checks.instance.exists && checks.instance.status !== "RUNNING") blockers.push("instance-not-running");

  checks.sshFirewall = firewallReadiness(sshFirewallRule, "tcp:22");
  if (!checks.sshFirewall.exists) blockers.push("ssh-firewall-missing");
  if (checks.sshFirewall.exists && !checks.sshFirewall.allowsExpectedTraffic) blockers.push("ssh-firewall-wrong-port");
  if (checks.sshFirewall.exists && !checks.sshFirewall.targetsInstanceTag) blockers.push("ssh-firewall-wrong-target-tag");
  if (hasBroadCidr(checks.sshFirewall.sourceRanges)) blockers.push("ssh-firewall-too-broad");

  checks.vpnFirewall = firewallReadiness(vpnFirewallRule, `udp:${vpnPort}`);
  if (!checks.vpnFirewall.exists) blockers.push("wireguard-firewall-missing");
  if (checks.vpnFirewall.exists && !checks.vpnFirewall.allowsExpectedTraffic) blockers.push("wireguard-firewall-wrong-port");
  if (checks.vpnFirewall.exists && !checks.vpnFirewall.targetsInstanceTag) blockers.push("wireguard-firewall-wrong-target-tag");
  if (hasBroadCidr(checks.vpnFirewall.sourceRanges)) blockers.push("wireguard-firewall-too-broad");
}

const ready = blockers.length === 0;
const output = {
  ok: ready,
  status: ready ? "ready" : "blocked",
  mode: "read-only",
  provider: "gcp-compute-vm",
  audience: "workplaces-and-teams",
  publicCloud: {
    audience: "everyone",
    vpnRequired: false
  },
  teamVpnCloud: {
    audience: "workplaces-and-teams",
    vpnRequired: true,
    vpn: "wireguard"
  },
  project: project || null,
  zone,
  instance,
  networkTag,
  vpnPort: Number(vpnPort),
  checks,
  blockers,
  warnings,
  nextActions: nextActions(blockers),
  safety: [
    "This command is read-only and does not create billable cloud resources.",
    "Use npm run cloud:gcp:server:apply only after billing, Compute API, scoped SSH, scoped VPN source ranges, and an approved WireGuard admin peer are confirmed.",
    "Do not treat a visible project or authenticated account as cloud readiness."
  ]
};

console.log(JSON.stringify(output, null, 2));

if (requireReady && !ready) {
  process.exit(1);
}

function firewallReadiness(ruleName, expectedAllow) {
  const result = runGcloud([
    "compute",
    "firewall-rules",
    "describe",
    ruleName,
    "--project",
    project,
    "--format=json"
  ]);
  const payload = parseJson(result.stdout, {});
  const allowed = Array.isArray(payload.allowed)
    ? payload.allowed.flatMap((entry) => (entry.ports || []).map((port) => `${entry.IPProtocol}:${port}`))
    : [];
  return {
    checked: true,
    exists: result.status === 0,
    name: ruleName,
    sourceRanges: payload.sourceRanges || [],
    targetTags: payload.targetTags || [],
    allowsExpectedTraffic: allowed.includes(expectedAllow),
    targetsInstanceTag: Array.isArray(payload.targetTags) && payload.targetTags.includes(networkTag),
    rawStatus: result.status
  };
}

function nextActions(items) {
  const actions = [];
  if (items.includes("gcloud-missing-or-unavailable")) actions.push("Install or configure Google Cloud CLI.");
  if (items.includes("gcloud-account-not-active")) actions.push("Run gcloud auth login with the intended Google account.");
  if (items.includes("project-not-selected")) actions.push("Pass --project PROJECT_ID or set GCP_PROJECT.");
  if (items.includes("billing-account-unavailable")) actions.push("Create or gain access to an open Google Cloud billing account before enabling Compute resources.");
  if (items.includes("billing-disabled")) actions.push("Link an open billing account to the selected Google Cloud project before creating Compute resources.");
  if (items.includes("compute-api-disabled")) actions.push("Enable compute.googleapis.com for the selected project.");
  if (items.includes("instance-missing")) actions.push("Run the guarded apply command after billing/API and source ranges are confirmed.");
  if (items.includes("instance-not-running")) actions.push("Start the named VM or provision a replacement before declaring the cloud host ready.");
  if (items.includes("ssh-firewall-missing")) actions.push("Create the scoped SSH firewall rule with a narrow source range.");
  if (items.includes("wireguard-firewall-missing")) actions.push("Create the WireGuard UDP firewall rule with workplace/team source ranges.");
  if (items.includes("ssh-firewall-wrong-port")) actions.push("Update the SSH firewall rule so it allows tcp:22.");
  if (items.includes("wireguard-firewall-wrong-port")) actions.push(`Update the WireGuard firewall rule so it allows udp:${vpnPort}.`);
  if (items.includes("ssh-firewall-wrong-target-tag")) actions.push(`Update the SSH firewall rule target tags to include ${networkTag}.`);
  if (items.includes("wireguard-firewall-wrong-target-tag")) actions.push(`Update the WireGuard firewall rule target tags to include ${networkTag}.`);
  if (items.includes("ssh-firewall-too-broad")) actions.push("Narrow SSH source ranges; do not use 0.0.0.0/0.");
  if (items.includes("wireguard-firewall-too-broad")) actions.push("Narrow WireGuard source ranges; do not use 0.0.0.0/0 or ::/0.");
  return actions;
}

function runGcloud(commandArgs) {
  const result = spawnSync("gcloud", ["--quiet", ...commandArgs], {
    encoding: "utf8"
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : null
  };
}

function parseJson(text, fallback) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeGcloudValue(value) {
  const normalized = String(value || "").trim();
  if (!normalized || normalized === "(unset)") return "";
  return normalized;
}

function hasBroadCidr(sourceRanges) {
  return (sourceRanges || []).some((item) => item === "0.0.0.0/0" || item === "::/0");
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "require-ready") {
      parsed[key] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:gcp:readiness -- --project PROJECT_ID
  npm run cloud:gcp:readiness:strict -- --project PROJECT_ID

Options:
  --project PROJECT_ID          Google Cloud project id.
  --zone ZONE                   Compute zone. Default: us-central1-a.
  --instance NAME               VM name. Default: seis-cloud-dev.
  --ssh-firewall-rule NAME      SSH firewall rule name.
  --vpn-firewall-rule NAME      WireGuard firewall rule name.
  --network-tag TAG             GCE network tag. Default: ${networkTag}.
  --vpn-port PORT               WireGuard UDP port. Default: ${vpnPort}.
  --require-ready               Exit non-zero when the cloud host is not ready.
`);
}
