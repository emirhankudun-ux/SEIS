#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const failures = [];
const model = readJson("deploy/seis-ssh-access-model.json");
const packageJson = readJson("package.json");
const accessPolicy = readJson("deploy/cloud-access-policy.json");
const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json");
const closedRuntime = readJson("deploy/seis-ssh-closed-runtime-contract.json");
const enterpriseBenchmark = readJson("deploy/seis-ssh-5-year-enterprise-benchmark.json");
const docs = readText("docs/deployment/seis-ssh-access-model.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-closed-developer-runtime.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-cloud-roadmap.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-new-device-bootstrap.md")
  + "\n"
  + readText("server/cloud/self-hosted/README.md")
  + "\n"
  + readText("plugins/seis-cloud/skills/seis-cloud/SKILL.md")
  + "\n"
  + readText("plugins/seis/skills/seis-cloud/SKILL.md");
const installer = readText("scripts/install-seis-cloud-ssh-config.mjs");
const onlineCheck = readText("scripts/check-seis-cloud-ssh-online.mjs");
const sshConfig = readText(join(homedir(), ".ssh", "config"), { optional: true });

ensure(model?.id === "seis-ssh-access-model", "access model id must be seis-ssh-access-model");
ensure(model?.defaultVisibleAlias === "SEIS-SSH", "default visible alias must be SEIS-SSH");
ensure(arrayEquals(model?.visibility?.activeAliases, ["SEIS-SSH"]), "only SEIS-SSH may be active in the model");
ensure(model?.visibility?.localMachineHostsAllowed === false, "local machine hosts must be disallowed");
ensure(model?.visibility?.directVpsAliasesAllowedInCodexPicker === false, "direct VPS aliases must not appear in Codex picker");

const profiles = new Map((model?.profiles || []).map((profile) => [profile.id, profile]));
ensure(profiles.has("individual-cloud"), "model must include individual-cloud profile");
ensure(profiles.has("organization-vpn-cloud"), "model must include organization-vpn-cloud profile");
ensure(profiles.has("developer-closed-system"), "model must include developer-closed-system profile");

const individual = profiles.get("individual-cloud") || {};
ensure(individual.audience === "individual-users", "individual profile audience must be individual-users");
ensure(individual.transport === "github-codespaces", "individual profile must use GitHub Codespaces");
ensure(individual.vpnRequired === false, "individual profile must not require VPN");
ensure(individual.visibleAlias === "SEIS-SSH", "individual profile must use SEIS-SSH");

const organization = profiles.get("organization-vpn-cloud") || {};
ensure(organization.audience === "companies-and-teams", "organization profile audience must be companies-and-teams");
ensure(organization.vpnRequired === true, "organization profile must require VPN");
ensure((organization.requiredControls || []).includes("wireguard-or-equivalent-peer-authenticated-vpn"), "organization profile must require peer-authenticated VPN");
ensure((organization.requiredControls || []).includes("no-broad-vpn-source-ranges"), "organization profile must reject broad VPN ranges");

const developer = profiles.get("developer-closed-system") || {};
ensure(developer.audience === "developers", "developer profile audience must be developers");
ensure(developer.developmentSystem === "closed-cloud-development-system", "developer profile must require closed cloud development system");
ensure(developer.publicInboundRequired === false, "developer profile must not require public inbound access");
ensure((developer.requiredControls || []).includes("no-local-mac-dependency"), "developer profile must reject local Mac dependency");
ensure((developer.requiredControls || []).includes("remote-codex-cli-present"), "developer profile must require remote Codex CLI");

ensure(accessPolicy?.teamVpnCloud?.vpnRequired === true, "team VPN cloud policy must require VPN");
ensure((accessPolicy?.teamVpnCloud?.rules || []).some((rule) => rule.includes("0.0.0.0/0")), "team VPN cloud policy must reject broad VPN source ranges");
ensure(model?.longTermDevelopment?.roadmapSource === "deploy/seis-ssh-cloud-roadmap.json", "access model must link long-term roadmap source");
ensure(model?.longTermDevelopment?.closedRuntimeContract === "deploy/seis-ssh-closed-runtime-contract.json", "access model must link closed runtime contract");
ensure(model?.longTermDevelopment?.enterpriseBenchmarkSource === "deploy/seis-ssh-5-year-enterprise-benchmark.json", "access model must link enterprise benchmark source");
ensure(model?.longTermDevelopment?.publicAccessContract === "deploy/seis-ssh-public-access-contract.json", "access model must link public access contract");
ensure(model?.longTermDevelopment?.operatingModel === "single-cloud-entrypoint-with-profile-specific-controls", "access model must define single cloud entrypoint operating model");
ensure(roadmap?.id === "seis-ssh-cloud-roadmap", "roadmap id must be seis-ssh-cloud-roadmap");
ensure(roadmap?.targetAlias === "SEIS-SSH", "roadmap target alias must be SEIS-SSH");
ensure(roadmap?.enterpriseBenchmarkSource === "deploy/seis-ssh-5-year-enterprise-benchmark.json", "roadmap must link enterprise benchmark source");
ensure(roadmap?.portableBootstrap?.artifact === "docs/deployment/seis-ssh-new-device-bootstrap.md", "roadmap must link new-device bootstrap");
ensure(closedRuntime?.id === "seis-ssh-closed-runtime-contract", "closed runtime contract id must be seis-ssh-closed-runtime-contract");
ensure(closedRuntime?.targetAlias === "SEIS-SSH", "closed runtime contract target alias must be SEIS-SSH");
ensure(closedRuntime?.runtimeType === "closed-cloud-development-system", "closed runtime contract must require closed cloud development system");
ensure(enterpriseBenchmark?.targetControlPlane?.year5Default === "identity-aware-ssh-broker", "enterprise benchmark must target identity-aware SSH broker");
ensure((model?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-enterprise-benchmark"), "qualityCommands must include enterprise benchmark check");
ensure((model?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-access"), "qualityCommands must include public access check");
ensure((model?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-onboarding"), "qualityCommands must include public onboarding check");
ensure((model?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-public-contributor-doctor"), "qualityCommands must include public contributor doctor check");
ensure((model?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-live-readiness-evidence"), "qualityCommands must include live readiness evidence check");
ensure((roadmap?.tracks || []).some((track) => track.profile === "individual-cloud" && track.vpnRequired === false), "roadmap must preserve individual normal cloud SSH");
ensure((roadmap?.tracks || []).some((track) => track.profile === "organization-vpn-cloud" && track.vpnRequired === true), "roadmap must preserve organization VPN SSH");
ensure((roadmap?.tracks || []).some((track) => track.profile === "developer-closed-system" && track.currentProvider === "cloud-isolated-workspace"), "roadmap must preserve developer closed cloud system");

ensure(packageJson?.scripts?.["cloud:ssh:online:strict"] === "node scripts/check-seis-cloud-ssh-online.mjs --require-ready", "missing cloud:ssh:online:strict script");
ensure(packageJson?.scripts?.["cloud:ssh:ensure-online"] === "node scripts/ensure-seis-ssh-online.mjs", "missing cloud:ssh:ensure-online script");
ensure(packageJson?.scripts?.["cloud:ssh:direct-cloud:switch"] === "node scripts/switch-seis-ssh-direct-cloud.mjs", "missing cloud:ssh:direct-cloud:switch script");
ensure(packageJson?.scripts?.["check:seis-ssh-access-model"] === "node scripts/check-seis-ssh-access-model.mjs", "missing check:seis-ssh-access-model script");
ensure(packageJson?.scripts?.["check:seis-ssh-picker-compatibility"] === "node scripts/check-seis-ssh-picker-compatibility.mjs", "missing check:seis-ssh-picker-compatibility script");
ensure(packageJson?.scripts?.["check:seis-ssh-public-access"] === "node scripts/check-seis-ssh-public-access.mjs", "missing check:seis-ssh-public-access script");
ensure(packageJson?.scripts?.["check:seis-ssh-public-onboarding"] === "node scripts/create-seis-ssh-public-onboarding-pack.mjs --check", "missing check:seis-ssh-public-onboarding script");
ensure(packageJson?.scripts?.["check:seis-ssh-public-contributor-doctor"] === "node scripts/check-seis-ssh-public-contributor-doctor.mjs --check", "missing check:seis-ssh-public-contributor-doctor script");
ensure(packageJson?.scripts?.["check:seis-ssh-live-readiness-evidence"] === "node scripts/check-seis-ssh-live-readiness-evidence.mjs", "missing check:seis-ssh-live-readiness-evidence script");
ensure(packageJson?.scripts?.["check:seis-ssh-cloud-roadmap"] === "node scripts/check-seis-ssh-cloud-roadmap.mjs", "missing check:seis-ssh-cloud-roadmap script");
ensure(packageJson?.scripts?.["check:seis-ssh-closed-runtime"] === "node scripts/check-seis-ssh-closed-runtime.mjs", "missing check:seis-ssh-closed-runtime script");

ensure(installer.includes("cloudOnly: true"), "installer must declare cloudOnly true");
ensure(installer.includes("aliases: [\"SEIS-SSH\"]"), "installer must report one alias");
ensure(installer.includes("--transport direct-cloud"), "installer must support direct-cloud picker-compatible transport");
ensure(readText("scripts/switch-seis-ssh-direct-cloud.mjs").includes("It refuses to switch if the direct cloud endpoint is not reachable."), "direct-cloud switch must refuse unreachable endpoints");
ensure(readText("scripts/ensure-seis-ssh-online.mjs").includes("strict-online-check"), "ensure-online script must run strict online check");
ensure(!installer.includes("--transport vps"), "installer must not expose direct VPS transport");
ensure(!installer.includes("Host seis-cloud-vps"), "installer must not write direct VPS alias");
ensure(onlineCheck.includes("ssh-config-not-cloud-only"), "online check must reject non-cloud config");
ensure(onlineCheck.includes("require-picker-compatible"), "online check must support picker-compatible readiness");
ensure(onlineCheck.includes("codex-cli-missing"), "online check must verify remote Codex CLI");

ensure(docs.includes("SEIS-SSH"), "docs must name SEIS-SSH");
ensure(docs.includes("individual-cloud"), "docs must document individual-cloud");
ensure(docs.includes("organization-vpn-cloud"), "docs must document organization-vpn-cloud");
ensure(docs.includes("developer-closed-system"), "docs must document developer-closed-system");
ensure(docs.includes("closed cloud development system"), "docs must document closed cloud development system");
ensure(docs.includes("SEIS SSH Cloud Roadmap"), "docs must document SEIS SSH Cloud Roadmap");
ensure(docs.includes("SEIS SSH New Device Bootstrap"), "docs must document SEIS SSH New Device Bootstrap");
ensure(docs.includes("SEIS SSH Closed Developer Runtime"), "docs must document SEIS SSH Closed Developer Runtime");
ensure(docs.includes("Picker Compatibility"), "docs must document picker compatibility");
ensure(docs.includes("read-only onboarding pack"), "docs must document read-only public onboarding pack");
ensure(docs.includes("read-only contributor doctor"), "docs must document read-only contributor doctor");
ensure(docs.includes("live readiness evidence"), "docs must document live readiness evidence");
ensure(docs.includes("Phase 3: Closed Developer Runtime"), "docs must document long-term closed developer runtime phase");

if (sshConfig) {
  const hostLines = sshConfig.split(/\r?\n/).filter((line) => /^Host\s+/.test(line));
  const visibleSeisHosts = hostLines
    .map((line) => line.replace(/^Host\s+/, "").trim())
    .filter((value) => value !== "github.com");
  ensure(visibleSeisHosts.length === 1 && visibleSeisHosts[0] === "SEIS-SSH", "local SSH config must expose only SEIS-SSH");
  ensure(!sshConfig.includes("Host seis-local-mac"), "local SSH config must not expose local Mac alias");
  ensure(!sshConfig.includes("Host seis-lan-mac"), "local SSH config must not expose LAN Mac alias");
  ensure(!sshConfig.includes("Host seis-cloud-vps"), "local SSH config must not expose direct VPS alias");
}

if (failures.length > 0) {
  console.error("SEIS SSH access model check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH access model check passed.");

function readJson(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function readText(file, options = {}) {
  if (!existsSync(file)) {
    if (!options.optional) failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function arrayEquals(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}
