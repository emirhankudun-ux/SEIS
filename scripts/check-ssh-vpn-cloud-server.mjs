#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];
const requiredFiles = [
  "scripts/check-ssh-wireguard-cloud-readiness.mjs",
  "scripts/provision-ssh-wireguard-cloud-server.mjs",
  "scripts/create-wireguard-peer-config.mjs",
  "server/cloud/ssh-wireguard/install-seis-cloud-host.sh",
  "docs/deployment/ssh-wireguard-vps-cloud-server.md",
  "deploy/cloud-access-policy.json",
  "deploy/provider-matrix.json",
  "deploy/server-targets.json",
  "deploy/cloud-environment.json"
];

for (const file of requiredFiles) {
  if (!existsSync(file)) failures.push(`missing ${file}`);
}

const packageJson = readJson("package.json");
const providerMatrix = readJson("deploy/provider-matrix.json");
const serverTargets = readJson("deploy/server-targets.json");
const cloudEnvironment = readJson("deploy/cloud-environment.json");
const localExample = readJson("deploy/server-targets.local.example.json");

const scripts = packageJson?.scripts || {};
ensure(scripts["cloud:ssh-vpn:readiness"] === "node scripts/check-ssh-wireguard-cloud-readiness.mjs", "missing cloud:ssh-vpn:readiness script");
ensure(scripts["cloud:ssh-vpn:readiness:strict"] === "node scripts/check-ssh-wireguard-cloud-readiness.mjs --require-ready", "missing cloud:ssh-vpn:readiness:strict script");
ensure(scripts["cloud:ssh-vpn:server:plan"] === "node scripts/provision-ssh-wireguard-cloud-server.mjs", "missing cloud:ssh-vpn:server:plan script");
ensure(scripts["check:ssh-vpn-cloud-server"] === "node scripts/check-ssh-vpn-cloud-server.mjs", "missing check:ssh-vpn-cloud-server script");

const matrixProvider = (providerMatrix?.providers || []).find((provider) => provider.id === "ssh-wireguard-vps");
const targetCandidate = (serverTargets?.candidates || []).find((candidate) => candidate.id === "ssh-wireguard-vps");
const cloudProvider = (cloudEnvironment?.providers || []).find((provider) => provider.id === "ssh-wireguard-vps");
const example = localExample?.["ssh-wireguard-vps"] || {};

ensure(Boolean(matrixProvider), "provider matrix must include ssh-wireguard-vps");
ensure(Boolean(targetCandidate), "server targets must include ssh-wireguard-vps");
ensure(Boolean(cloudProvider), "cloud environment must include ssh-wireguard-vps");
ensure(matrixProvider?.audience === "workplaces-and-teams", "ssh-wireguard-vps provider matrix audience must be workplaces-and-teams");
ensure(cloudProvider?.audience === "workplaces-and-teams", "ssh-wireguard-vps cloud provider audience must be workplaces-and-teams");
ensure(cloudProvider?.kind === "team-vpn-cloud-existing-ssh-server", "ssh-wireguard-vps cloud provider kind must be team-vpn-cloud-existing-ssh-server");
ensure(targetCandidate?.type === "team-vpn-cloud-existing-ssh-server", "ssh-wireguard-vps target type must be team-vpn-cloud-existing-ssh-server");
ensure(matrixProvider?.readinessCommand === "npm run cloud:ssh-vpn:readiness -- --ssh-target USER@HOST", "ssh-wireguard-vps provider matrix must expose readiness command");
ensure(cloudProvider?.readinessCommand === "npm run cloud:ssh-vpn:readiness -- --ssh-target USER@HOST", "ssh-wireguard-vps cloud provider must expose readiness command");
ensure((matrixProvider?.requiredFiles || []).includes("scripts/check-ssh-wireguard-cloud-readiness.mjs"), "ssh-wireguard-vps provider must require readiness checker");
ensure((matrixProvider?.requiredFiles || []).includes("server/cloud/ssh-wireguard/install-seis-cloud-host.sh"), "ssh-wireguard-vps provider must require installer");
ensure((targetCandidate?.requiredInput || []).includes("ssh_target"), "ssh-wireguard-vps target must require ssh_target");
ensure((targetCandidate?.requiredInput || []).includes("vpn_admin_peer"), "ssh-wireguard-vps target must require vpn_admin_peer");
ensure((targetCandidate?.requiredInput || []).includes("rollback_contact"), "ssh-wireguard-vps target must require rollback_contact");
ensure(example.vpn_admin_peer && example.vpn_admin_peer.includes("CLIENT_PUBLIC_KEY"), "local example must include a placeholder VPN admin peer");

const readiness = readText("scripts/check-ssh-wireguard-cloud-readiness.mjs");
ensure(readiness.includes("mode: \"read-only\""), "readiness checker must declare read-only mode");
ensure(readiness.includes("ssh-target-missing"), "readiness checker must report missing SSH target");
ensure(readiness.includes("wireguard-interface-inactive"), "readiness checker must report inactive WireGuard interface");
ensure(readiness.includes("codex-missing"), "readiness checker must report missing Codex");
ensure(readiness.includes("git-missing"), "readiness checker must report missing git");
ensure(readiness.includes("rsync-missing"), "readiness checker must report missing rsync");
ensure(readiness.includes("release-root-missing"), "readiness checker must report missing release root");
ensure(readiness.includes("current-release-root-missing"), "readiness checker must report missing current release root");
ensure(readiness.includes("workplaces-and-teams"), "readiness checker must preserve team/workplace audience");

const peerHelper = readText("scripts/create-wireguard-peer-config.mjs");
ensure(peerHelper.includes("isValidWireGuardPeerAddress"), "WireGuard peer helper must use strict peer address validation");
ensure(peerHelper.includes("octet >= 2 && octet <= 254"), "WireGuard peer helper must reserve server/broadcast peer addresses");

const provisioner = readText("scripts/provision-ssh-wireguard-cloud-server.mjs");
ensure(provisioner.includes("mode: \"plan\""), "provisioner must stay plan-first");
ensure(provisioner.includes("Existing SSH/VPS provisioning is plan-only"), "provisioner must reject direct apply");
ensure(provisioner.includes("Plan requires at least one --vpn-peer approved workplace/team peer."), "provisioner must require at least one approved WireGuard peer");
ensure(provisioner.includes("--vpn-peer"), "provisioner must support approved WireGuard peers");
ensure(provisioner.includes("isValidWireGuardPeerAddress"), "provisioner must use strict WireGuard peer address validation");
ensure(provisioner.includes("octet >= 2 && octet <= 254"), "provisioner must reserve WireGuard server/broadcast peer addresses");

const installer = readText("server/cloud/ssh-wireguard/install-seis-cloud-host.sh");
ensure(installer.includes("valid_seis_user"), "installer must validate the SEIS user before account or sshd writes");
ensure(installer.includes("SEIS_WG_PEERS"), "installer must consume approved WireGuard peers");
ensure(installer.includes("VALID_WG_PEER_COUNT"), "installer must fail when no valid WireGuard peers are configured");
ensure(installer.includes("10#${peer_octet}"), "installer must parse WireGuard peer octets in base 10");
ensure(installer.includes("wg-quick@wg0"), "installer must enable WireGuard wg0");
ensure(installer.includes("PasswordAuthentication no"), "installer must disable password SSH");
ensure(installer.includes("${SEIS_ROOT}/releases"), "installer must create release handoff root");
ensure(installer.includes("${SEIS_ROOT}/current"), "installer must create current release root");
ensure(installer.includes("https://chatgpt.com/codex/install.sh"), "installer must install standalone Codex");

const docs = readText("docs/deployment/ssh-wireguard-vps-cloud-server.md");
ensure(docs.includes("Public cloud remains the surface for everyone"), "SSH/VPN runbook must separate public cloud from team VPN cloud");
ensure(docs.includes("npm run cloud:ssh-vpn:readiness"), "SSH/VPN runbook must document readiness command");
ensure(docs.includes("npm run cloud:ssh-vpn:server:plan"), "SSH/VPN runbook must document plan command");
ensure(docs.includes("WireGuard"), "SSH/VPN runbook must document WireGuard");
ensure(docs.includes("Full SSH Cloud Coverage"), "SSH/VPN runbook must document full SSH cloud coverage");
ensure(docs.includes("/opt/seis/releases"), "SSH/VPN runbook must document release handoff root");

if (failures.length > 0) {
  console.error("SEIS SSH VPN cloud server check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH VPN cloud server check passed.");

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
