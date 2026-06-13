#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];

const requiredFiles = [
  "scripts/check-gcp-cloud-readiness.mjs",
  "scripts/provision-gcp-cloud-server.mjs",
  "scripts/create-wireguard-peer-config.mjs",
  "scripts/check-cloud-access-policy.mjs",
  "server/cloud/gcp/startup-seis-cloud.sh",
  "docs/deployment/gcp-compute-cloud-server.md",
  "docs/deployment/cloud-access-policy.md",
  "deploy/cloud-access-policy.json",
  "deploy/provider-matrix.json",
  "deploy/server-targets.json",
  "deploy/cloud-environment.json"
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
  }
}

const packageJson = readJson("package.json");
const providerMatrix = readJson("deploy/provider-matrix.json");
const serverTargets = readJson("deploy/server-targets.json");
const cloudEnvironment = readJson("deploy/cloud-environment.json");

const scripts = packageJson?.scripts || {};
ensure(scripts["cloud:gcp:readiness"] === "node scripts/check-gcp-cloud-readiness.mjs", "missing cloud:gcp:readiness script");
ensure(scripts["cloud:gcp:readiness:strict"] === "node scripts/check-gcp-cloud-readiness.mjs --require-ready", "missing cloud:gcp:readiness:strict script");
ensure(scripts["cloud:gcp:server:plan"] === "node scripts/provision-gcp-cloud-server.mjs", "missing cloud:gcp:server:plan script");
ensure(scripts["cloud:gcp:server:apply"] === "node scripts/provision-gcp-cloud-server.mjs --apply", "missing cloud:gcp:server:apply script");
ensure(scripts["check:cloud-access-policy"] === "node scripts/check-cloud-access-policy.mjs", "missing check:cloud-access-policy script");
ensure(scripts["check:gcp-cloud-server"] === "node scripts/check-gcp-cloud-server.mjs", "missing check:gcp-cloud-server script");
ensure(scripts["vpn:wireguard:peer"] === "node scripts/create-wireguard-peer-config.mjs", "missing vpn:wireguard:peer script");

const matrixProvider = (providerMatrix?.providers || []).find((provider) => provider.id === "gcp-compute-vm");
const targetCandidate = (serverTargets?.candidates || []).find((candidate) => candidate.id === "gcp-compute-vm");
const cloudProvider = (cloudEnvironment?.providers || []).find((provider) => provider.id === "gcp-compute-vm");

ensure(Boolean(matrixProvider), "provider matrix must include gcp-compute-vm");
ensure(Boolean(targetCandidate), "server targets must include gcp-compute-vm");
ensure(Boolean(cloudProvider), "cloud environment must include gcp-compute-vm");
ensure(matrixProvider?.audience === "workplaces-and-teams", "gcp provider matrix audience must be workplaces-and-teams");
ensure(cloudProvider?.audience === "workplaces-and-teams", "gcp cloud provider audience must be workplaces-and-teams");
ensure(cloudProvider?.kind === "team-vpn-cloud-compute-server", "gcp cloud provider kind must be team-vpn-cloud-compute-server");
ensure(matrixProvider?.readinessCommand === "npm run cloud:gcp:readiness -- --project PROJECT_ID", "gcp provider matrix must expose readiness command");
ensure(cloudProvider?.readinessCommand === "npm run cloud:gcp:readiness -- --project PROJECT_ID", "gcp cloud provider must expose readiness command");
ensure((matrixProvider?.requiredFiles || []).includes("scripts/check-gcp-cloud-readiness.mjs"), "gcp provider must require the readiness checker");
ensure((matrixProvider?.requiredFiles || []).includes("scripts/provision-gcp-cloud-server.mjs"), "gcp provider must require the provisioner");
ensure((matrixProvider?.requiredFiles || []).includes("scripts/create-wireguard-peer-config.mjs"), "gcp provider must require the WireGuard peer helper");
ensure((matrixProvider?.requiredFiles || []).includes("server/cloud/gcp/startup-seis-cloud.sh"), "gcp provider must require the startup script");
ensure((targetCandidate?.requiredInput || []).includes("ssh_source_range"), "gcp target must require ssh_source_range");
ensure((targetCandidate?.requiredInput || []).includes("vpn_source_range"), "gcp target must require vpn_source_range");
ensure((targetCandidate?.requiredInput || []).includes("vpn_admin_peer"), "gcp target must require vpn_admin_peer");
ensure((targetCandidate?.requiredInput || []).includes("rollback_contact"), "gcp target must require rollback_contact");
ensure((cloudProvider?.qualityCommands || []).includes("npm run check:gcp-cloud-server"), "gcp cloud provider must reference the checker");

const provisioner = readText("scripts/provision-gcp-cloud-server.mjs");
ensure(provisioner.includes("--apply"), "provisioner must keep apply as an explicit mutation flag");
ensure(provisioner.includes("--ssh-source-range"), "provisioner must require a scoped SSH source range");
ensure(provisioner.includes("--vpn-source-range"), "provisioner must require a scoped VPN source range");
ensure(provisioner.includes("--vpn-peer"), "provisioner must support WireGuard peers");
ensure(provisioner.includes("hasBroadCidr"), "provisioner must reject broad VPN source ranges");
ensure(sourceContainsStringLiteral(provisioner, "compute.googleapis.com"), "provisioner must enable or check Compute Engine");
ensure(!provisioner.includes('sshSourceRange || "0.0.0.0/0"'), "provisioner must not default SSH to 0.0.0.0/0");
ensure(!provisioner.includes('vpnSourceRange || "0.0.0.0/0"'), "provisioner must not default VPN to 0.0.0.0/0");

const readiness = readText("scripts/check-gcp-cloud-readiness.mjs");
ensure(readiness.includes("mode: \"read-only\""), "readiness checker must declare read-only mode");
ensure(readiness.includes("billing-disabled"), "readiness checker must report disabled billing");
ensure(readiness.includes("compute-api-disabled"), "readiness checker must report disabled Compute Engine API");
ensure(readiness.includes("--require-ready"), "readiness checker must support strict mode");
ensure(readiness.includes("workplaces-and-teams"), "readiness checker must preserve team/workplace VPN audience");

const startup = readText("server/cloud/gcp/startup-seis-cloud.sh");
ensure(startup.includes("PasswordAuthentication no"), "startup script must disable password SSH");
ensure(startup.includes("PermitRootLogin no"), "startup script must disable root SSH login");
ensure(startup.includes("https://chatgpt.com/codex/install.sh"), "startup script must install standalone Codex");
ensure(startup.includes("wg-quick@wg0"), "startup script must enable WireGuard wg0");
ensure(startup.includes("seis-wg-peers"), "startup script must read WireGuard peers from metadata");
ensure(startup.includes("SEIS_REMOTE_HOST_READY=1"), "startup script must expose a readiness marker");

const peerHelper = readText("scripts/create-wireguard-peer-config.mjs");
ensure(peerHelper.includes("metadataPeer"), "WireGuard peer helper must emit metadataPeer");
ensure(peerHelper.includes("CLIENT_PRIVATE_KEY"), "WireGuard peer helper must avoid storing client private keys");

const docs = readText("docs/deployment/gcp-compute-cloud-server.md");
ensure(docs.includes("npm run cloud:gcp:readiness"), "GCP runbook must document readiness command");
ensure(docs.includes("npm run cloud:gcp:server:plan"), "GCP runbook must document plan command");
ensure(docs.includes("npm run cloud:gcp:server:apply"), "GCP runbook must document apply command");
ensure(docs.includes("ssh_source_range"), "GCP runbook must document SSH source scoping");
ensure(docs.includes("WireGuard"), "GCP runbook must document WireGuard");
ensure(docs.includes("Public cloud remains the surface for everyone"), "GCP runbook must separate public cloud from team VPN cloud");

if (failures.length > 0) {
  console.error("SEIS GCP cloud server check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS GCP cloud server check passed.");

function readJson(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

function readText(file) {
  if (!existsSync(file)) return "";
  return readFileSync(file, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function sourceContainsStringLiteral(source, literal) {
  const escapedLiteral = literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`["'\`]${escapedLiteral}["'\`]`, "u").test(source);
}
