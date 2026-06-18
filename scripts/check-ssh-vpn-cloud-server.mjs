#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];
const requiredFiles = [
  "scripts/check-ssh-wireguard-cloud-readiness.mjs",
  "scripts/check-seis-cloud-ssh-online.mjs",
  "scripts/check-seis-ssh-access-model.mjs",
  "scripts/check-seis-ssh-cloud-roadmap.mjs",
  "scripts/check-seis-ssh-closed-runtime.mjs",
  "scripts/provision-ssh-wireguard-cloud-server.mjs",
  "scripts/install-seis-cloud-ssh-config.mjs",
  "scripts/create-self-hosted-seis-cloud-kit.mjs",
  "scripts/create-wireguard-peer-config.mjs",
  "server/cloud/ssh-wireguard/install-seis-cloud-host.sh",
  "server/cloud/self-hosted/README.md",
  "docs/deployment/ssh-wireguard-vps-cloud-server.md",
  "docs/deployment/seis-ssh-access-model.md",
  "docs/deployment/seis-ssh-cloud-roadmap.md",
  "docs/deployment/seis-ssh-closed-developer-runtime.md",
  "docs/deployment/seis-ssh-new-device-bootstrap.md",
  "deploy/seis-ssh-access-model.json",
  "deploy/seis-ssh-cloud-roadmap.json",
  "deploy/seis-ssh-closed-runtime-contract.json",
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
ensure(scripts["cloud:ssh-config:install"] === "node scripts/install-seis-cloud-ssh-config.mjs", "missing cloud:ssh-config:install script");
ensure(scripts["cloud:ssh:online"] === "node scripts/check-seis-cloud-ssh-online.mjs", "missing cloud:ssh:online script");
ensure(scripts["cloud:ssh:online:strict"] === "node scripts/check-seis-cloud-ssh-online.mjs --require-ready", "missing cloud:ssh:online:strict script");
ensure(scripts["check:seis-ssh-access-model"] === "node scripts/check-seis-ssh-access-model.mjs", "missing check:seis-ssh-access-model script");
ensure(scripts["check:seis-ssh-cloud-roadmap"] === "node scripts/check-seis-ssh-cloud-roadmap.mjs", "missing check:seis-ssh-cloud-roadmap script");
ensure(scripts["check:seis-ssh-closed-runtime"] === "node scripts/check-seis-ssh-closed-runtime.mjs", "missing check:seis-ssh-closed-runtime script");
ensure(scripts["cloud:self-hosted:kit"] === "node scripts/create-self-hosted-seis-cloud-kit.mjs", "missing cloud:self-hosted:kit script");
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

const selfHostedKit = readText("scripts/create-self-hosted-seis-cloud-kit.mjs");
ensure(selfHostedKit.includes("mode: \"self-hosted-kit\""), "self-hosted kit must declare self-hosted mode");
ensure(selfHostedKit.includes("No private SSH or WireGuard keys were generated or written."), "self-hosted kit must avoid private key generation");
ensure(selfHostedKit.includes("dist/seis-cloud-self-hosted-kit"), "self-hosted kit must write generated handoff under dist");
ensure(selfHostedKit.includes("SEIS_REMOTE_HOST_READY=1") || selfHostedKit.includes("ready-to-apply-after-host-is-reachable"), "self-hosted kit must preserve readiness handoff");
ensure(selfHostedKit.includes("isValidWireGuardPeerAddress"), "self-hosted kit must validate WireGuard peer addresses");

const sshConfigInstaller = readText("scripts/install-seis-cloud-ssh-config.mjs");
ensure(sshConfigInstaller.includes("remoteOnly: true"), "SSH config installer must declare remote-only mode");
ensure(sshConfigInstaller.includes("cloudOnly: true"), "SSH config installer must declare cloud-only mode");
ensure(sshConfigInstaller.includes("Local Mac aliases"), "SSH config installer must exclude local Mac aliases");
ensure(sshConfigInstaller.includes("GitHub Codespaces transport"), "SSH config installer must use an online cloud transport");
ensure(sshConfigInstaller.includes("Host SEIS-SSH"), "SSH config installer must expose one visible SEIS SSH alias");
ensure(sshConfigInstaller.includes("aliases: [\"SEIS-SSH\"]"), "SSH config installer must report one visible alias");
ensure(sshConfigInstaller.includes("BEGIN SEIS CLOUD REMOTE SSH"), "SSH config installer must use managed block markers");
ensure(sshConfigInstaller.includes("removeUnmanagedSeisCloudBlocks"), "SSH config installer must remove duplicate unmanaged SEIS Cloud aliases");
ensure(!sshConfigInstaller.includes("--transport vps"), "SSH config installer must not expose VPS transport in cloud-only mode");
ensure(!sshConfigInstaller.includes("Invalid --transport"), "SSH config installer must not accept non-cloud transports");

const onlineCheck = readText("scripts/check-seis-cloud-ssh-online.mjs");
ensure(onlineCheck.includes("provider: \"github-codespaces\""), "online SSH check must verify GitHub Codespaces provider");
ensure(onlineCheck.includes("codex-cli-missing"), "online SSH check must report missing remote Codex CLI");
ensure(onlineCheck.includes("ssh-config-not-cloud-only"), "online SSH check must reject non-cloud SSH config");

const sshAccessModel = readJson("deploy/seis-ssh-access-model.json");
ensure(sshAccessModel?.defaultVisibleAlias === "SEIS-SSH", "SSH access model must use SEIS-SSH");
ensure((sshAccessModel?.profiles || []).some((profile) => profile.id === "individual-cloud" && profile.vpnRequired === false), "SSH access model must allow normal individual cloud SSH");
ensure((sshAccessModel?.profiles || []).some((profile) => profile.id === "organization-vpn-cloud" && profile.vpnRequired === true), "SSH access model must require VPN for organizations");
ensure((sshAccessModel?.profiles || []).some((profile) => profile.id === "developer-closed-system" && profile.developmentSystem === "closed-cloud-development-system"), "SSH access model must require closed developer system");
ensure(sshAccessModel?.longTermDevelopment?.roadmapSource === "deploy/seis-ssh-cloud-roadmap.json", "SSH access model must link the cloud roadmap");

const sshRoadmap = readJson("deploy/seis-ssh-cloud-roadmap.json");
ensure(sshRoadmap?.targetAlias === "SEIS-SSH", "SSH cloud roadmap must use SEIS-SSH");
ensure(sshRoadmap?.strategy === "cloud-only-long-horizon", "SSH cloud roadmap must preserve long-horizon cloud-only strategy");
ensure(sshRoadmap?.portableBootstrap?.artifact === "docs/deployment/seis-ssh-new-device-bootstrap.md", "SSH cloud roadmap must link new-device bootstrap");
ensure(sshRoadmap?.closedDeveloperRuntime?.contract === "deploy/seis-ssh-closed-runtime-contract.json", "SSH cloud roadmap must link closed runtime contract");
ensure((sshRoadmap?.tracks || []).some((track) => track.profile === "organization-vpn-cloud" && track.vpnRequired === true), "SSH cloud roadmap must preserve team VPN track");
ensure((sshRoadmap?.tracks || []).some((track) => track.profile === "developer-closed-system" && track.currentProvider === "cloud-isolated-workspace"), "SSH cloud roadmap must preserve closed developer cloud track");

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
ensure(docs.includes("npm run cloud:self-hosted:kit"), "SSH/VPN runbook must document self-hosted kit command");
ensure(docs.includes("WireGuard"), "SSH/VPN runbook must document WireGuard");
ensure(docs.includes("Full SSH Cloud Coverage"), "SSH/VPN runbook must document full SSH cloud coverage");
ensure(docs.includes("/opt/seis/releases"), "SSH/VPN runbook must document release handoff root");

const selfHostedDocs = readText("server/cloud/self-hosted/README.md");
ensure(selfHostedDocs.includes("SEIS self-hosted cloud kit"), "self-hosted docs must identify the kit");
ensure(selfHostedDocs.includes("npm run cloud:self-hosted:kit"), "self-hosted docs must show the kit command");
ensure(selfHostedDocs.includes("npm run cloud:ssh-config:install"), "self-hosted docs must show the portable SSH config command");

const roadmapDocs = readText("docs/deployment/seis-ssh-cloud-roadmap.md");
ensure(roadmapDocs.includes("SEIS SSH Cloud Roadmap"), "SSH cloud roadmap docs must exist");
ensure(roadmapDocs.includes("Organization VPN Access"), "SSH cloud roadmap docs must document organization VPN access");
ensure(roadmapDocs.includes("Developer Closed Cloud System"), "SSH cloud roadmap docs must document developer closed cloud system");

const bootstrapDocs = readText("docs/deployment/seis-ssh-new-device-bootstrap.md");
ensure(bootstrapDocs.includes("SEIS SSH New Device Bootstrap"), "SSH new-device bootstrap docs must exist");
ensure(bootstrapDocs.includes("ChatGPT mobile and Codex surfaces"), "SSH new-device bootstrap docs must cover ChatGPT/Codex surfaces");
ensure(bootstrapDocs.includes("gh auth refresh -h github.com -s codespace"), "SSH new-device bootstrap docs must cover codespace auth");
ensure(bootstrapDocs.includes("npm run cloud:ssh:online:strict"), "SSH new-device bootstrap docs must cover online verification");

const closedRuntime = readJson("deploy/seis-ssh-closed-runtime-contract.json");
ensure(closedRuntime?.targetAlias === "SEIS-SSH", "closed runtime contract must use SEIS-SSH");
ensure(closedRuntime?.runtimeType === "closed-cloud-development-system", "closed runtime contract must require closed cloud development system");
ensure(closedRuntime?.privateRuntimeState?.storedInRepo === false, "closed runtime contract must keep private runtime state out of repo");

const closedRuntimeDocs = readText("docs/deployment/seis-ssh-closed-developer-runtime.md");
ensure(closedRuntimeDocs.includes("SEIS SSH Closed Developer Runtime"), "closed runtime docs must exist");
ensure(closedRuntimeDocs.includes("deploy/seis-ssh-closed-runtime-contract.json"), "closed runtime docs must link contract");
ensure(closedRuntimeDocs.includes("secretDisclosure"), "closed runtime docs must document sanitized handoff");

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
