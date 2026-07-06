#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];

const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json");
const accessModel = readJson("deploy/seis-ssh-access-model.json");
const closedRuntime = readJson("deploy/seis-ssh-closed-runtime-contract.json");
const enterpriseBenchmark = readJson("deploy/seis-ssh-5-year-enterprise-benchmark.json");
const packageJson = readJson("package.json");
const docs = readText("docs/deployment/seis-ssh-cloud-roadmap.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-closed-developer-runtime.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-new-device-bootstrap.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-access-model.md");
const installer = readText("scripts/install-seis-cloud-ssh-config.mjs");
const onlineCheck = readText("scripts/check-seis-cloud-ssh-online.mjs");

ensure(roadmap?.id === "seis-ssh-cloud-roadmap", "roadmap id must be seis-ssh-cloud-roadmap");
ensure(roadmap?.sourceModel === "deploy/seis-ssh-access-model.json", "roadmap must point at the access model");
ensure(roadmap?.targetAlias === "SEIS-SSH", "roadmap target alias must be SEIS-SSH");
ensure(roadmap?.strategy === "cloud-only-long-horizon", "roadmap strategy must be cloud-only-long-horizon");
ensure(roadmap?.status === "active", "roadmap status must be active");
ensure(roadmap?.enterpriseBenchmarkSource === "deploy/seis-ssh-5-year-enterprise-benchmark.json", "roadmap must link enterprise benchmark source");
ensure(accessModel?.longTermDevelopment?.roadmapSource === "deploy/seis-ssh-cloud-roadmap.json", "access model must link to roadmap source");
ensure(accessModel?.longTermDevelopment?.closedRuntimeContract === "deploy/seis-ssh-closed-runtime-contract.json", "access model must link to closed runtime contract");
ensure(accessModel?.longTermDevelopment?.enterpriseBenchmarkSource === "deploy/seis-ssh-5-year-enterprise-benchmark.json", "access model must link to enterprise benchmark source");
ensure(accessModel?.longTermDevelopment?.pickerCompatibilityCheck === "npm run check:seis-ssh-picker-compatibility", "access model must link picker compatibility check");
ensure(accessModel?.longTermDevelopment?.operatingModel === "single-cloud-entrypoint-with-profile-specific-controls", "access model must define the long-term operating model");
ensure(roadmap?.portableBootstrap?.artifact === "docs/deployment/seis-ssh-new-device-bootstrap.md", "roadmap must link the new-device bootstrap doc");
ensure(roadmap?.portableBootstrap?.requiredAlias === "SEIS-SSH", "portable bootstrap must require SEIS-SSH");
ensure((roadmap?.portableBootstrap?.requiredCommands || []).includes("gh auth refresh -h github.com -s codespace"), "portable bootstrap must document Codespaces auth refresh");
ensure((roadmap?.portableBootstrap?.requiredCommands || []).includes("npm run cloud:ssh-config:install"), "portable bootstrap must document SSH config install");
ensure((roadmap?.portableBootstrap?.requiredCommands || []).includes("npm run cloud:ssh:online:strict"), "portable bootstrap must document strict online verification");
ensure((roadmap?.portableBootstrap?.forbiddenBootstrapPatterns || []).includes("use-localhost-as-remote"), "portable bootstrap must forbid localhost remotes");
ensure(roadmap?.pickerCompatibility?.checkCommand === "npm run check:seis-ssh-picker-compatibility", "roadmap must link picker compatibility check");
ensure(roadmap?.pickerCompatibility?.singleAlias === "SEIS-SSH", "roadmap picker compatibility must keep SEIS-SSH as the single alias");
ensure(roadmap?.pickerCompatibility?.pickerPreferredTransport === "direct-cloud", "roadmap must define direct-cloud as picker-preferred transport");
ensure(roadmap?.closedDeveloperRuntime?.contract === "deploy/seis-ssh-closed-runtime-contract.json", "roadmap must link closed runtime contract");
ensure(roadmap?.closedDeveloperRuntime?.runbook === "docs/deployment/seis-ssh-closed-developer-runtime.md", "roadmap must link closed runtime runbook");
ensure(roadmap?.closedDeveloperRuntime?.runtimeType === "closed-cloud-development-system", "roadmap must preserve closed cloud runtime type");
ensure(closedRuntime?.id === "seis-ssh-closed-runtime-contract", "closed runtime contract id must be seis-ssh-closed-runtime-contract");
ensure(closedRuntime?.targetAlias === "SEIS-SSH", "closed runtime contract must target SEIS-SSH");
ensure(closedRuntime?.localFallbackAllowed === false, "closed runtime contract must reject local fallback");
ensure(closedRuntime?.privateRuntimeState?.storedInRepo === false, "closed runtime contract must keep private state out of repo");
ensure(enterpriseBenchmark?.id === "seis-ssh-5-year-enterprise-benchmark", "enterprise benchmark id must be seis-ssh-5-year-enterprise-benchmark");
ensure(enterpriseBenchmark?.targetControlPlane?.year5Default === "identity-aware-ssh-broker", "enterprise benchmark must target identity-aware SSH broker by year 5");
ensure((enterpriseBenchmark?.officialReferenceBaseline || []).length >= 7, "enterprise benchmark must include official reference baseline");

const scripts = packageJson?.scripts || {};
ensure(scripts["check:seis-ssh-cloud-roadmap"] === "node scripts/check-seis-ssh-cloud-roadmap.mjs", "missing check:seis-ssh-cloud-roadmap script");
ensure(scripts["check:seis-ssh-picker-compatibility"] === "node scripts/check-seis-ssh-picker-compatibility.mjs", "missing check:seis-ssh-picker-compatibility script");
ensure(scripts["check:seis-ssh-closed-runtime"] === "node scripts/check-seis-ssh-closed-runtime.mjs", "missing check:seis-ssh-closed-runtime script");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-cloud-roadmap"), "quality governance must include SSH cloud roadmap check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-picker-compatibility"), "quality governance must include SSH picker compatibility check");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-closed-runtime"), "quality governance must include SSH closed runtime check");

const profileIds = new Set((accessModel?.profiles || []).map((profile) => profile.id));
const trackProfiles = new Set((roadmap?.tracks || []).map((track) => track.profile));
for (const profileId of ["individual-cloud", "organization-vpn-cloud", "developer-closed-system"]) {
  ensure(profileIds.has(profileId), `access model must include ${profileId}`);
  ensure(trackProfiles.has(profileId), `roadmap must include a track for ${profileId}`);
}

const invariants = new Map((roadmap?.invariants || []).map((item) => [item.id, item]));
for (const invariant of [
  "single-visible-alias",
  "cloud-only-entrypoint",
  "individual-normal-cloud",
  "organization-vpn",
  "developer-closed-system"
]) {
  ensure(invariants.has(invariant), `roadmap must include ${invariant} invariant`);
}

const tracks = new Map((roadmap?.tracks || []).map((track) => [track.id, track]));
ensure(tracks.get("individual-cloud-access")?.vpnRequired === false, "individual track must not require VPN");
ensure(tracks.get("individual-cloud-access")?.currentProvider === "github-codespaces", "individual track must use GitHub Codespaces");
ensure(tracks.get("organization-vpn-access")?.vpnRequired === true, "organization track must require VPN");
ensure((tracks.get("organization-vpn-access")?.currentProvider || "").includes("wireguard"), "organization track must preserve WireGuard or equivalent provider");
ensure(tracks.get("developer-closed-cloud-system")?.vpnRequired === true, "developer closed system track must require VPN for sensitive work");
ensure(tracks.get("developer-closed-cloud-system")?.currentProvider === "cloud-isolated-workspace", "developer track must use cloud-isolated-workspace");

const phaseIds = new Set((roadmap?.maturityPhases || []).map((phase) => phase.id));
for (const phaseId of [
  "phase-0-current-lock",
  "phase-1-portable-bootstrap",
  "phase-2-team-vpn-hardening",
  "phase-3-closed-developer-runtime"
]) {
  ensure(phaseIds.has(phaseId), `roadmap must include ${phaseId}`);
}

const validationCommands = roadmap?.validationCommands || [];
for (const command of [
  "npm run check:seis-ssh-cloud-roadmap",
  "npm run check:seis-ssh-report-boundary",
  "npm run check:seis-ssh-cloudflare-access-plan",
  "npm run check:seis-ssh-github-codespaces-fallback-plan",
  "npm run check:seis-ssh-provider-status-board",
  "npm run check:seis-ssh-oracle-owner-action-packet",
  "npm run check:seis-ssh-closed-runtime",
  "npm run check:seis-ssh-access-model",
  "npm run check:seis-ssh-picker-compatibility",
  "npm run check:seis-ssh-enterprise-benchmark",
  "npm run cloud:ssh:online:strict",
  "npm run check:ssh-vpn-cloud-server"
]) {
  ensure(validationCommands.includes(command), `roadmap validation commands must include ${command}`);
  ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes(command) || command === "npm run check:seis-ssh-cloud-roadmap", `access model quality commands should include ${command}`);
}

ensure((roadmap?.guardrails || []).some((rule) => rule.includes("local Mac")), "roadmap must forbid local Mac alias fallback");
ensure((roadmap?.guardrails || []).some((rule) => rule.includes("direct public VPS")), "roadmap must forbid direct public VPS picker aliases");
ensure((roadmap?.guardrails || []).some((rule) => rule.includes("private keys")), "roadmap must forbid secret/key disclosure");

ensure(docs.includes("SEIS SSH Cloud Roadmap"), "roadmap docs must have title");
ensure(docs.includes("SEIS-SSH"), "roadmap docs must name SEIS-SSH");
ensure(docs.includes("Individual Cloud Access"), "roadmap docs must document individual cloud access");
ensure(docs.includes("Organization VPN Access"), "roadmap docs must document organization VPN access");
ensure(docs.includes("Developer Closed Cloud System"), "roadmap docs must document developer closed cloud system");
ensure(docs.includes("Phase 3: Closed Developer Runtime"), "roadmap docs must document long-term phase 3");
ensure(docs.includes("SEIS SSH New Device Bootstrap"), "roadmap docs must include new-device bootstrap");
ensure(docs.includes("SEIS SSH Closed Developer Runtime"), "roadmap docs must include closed developer runtime");
ensure(docs.includes("Picker Compatibility"), "roadmap docs must include picker compatibility");
ensure(docs.includes("deploy/seis-ssh-closed-runtime-contract.json"), "closed runtime docs must link contract");
ensure(docs.includes("ChatGPT mobile and Codex surfaces"), "bootstrap docs must mention ChatGPT mobile and Codex surfaces");
ensure(docs.includes("gh auth refresh -h github.com -s codespace"), "bootstrap docs must document GitHub Codespaces auth refresh");
ensure(docs.includes("npm run cloud:ssh-config:install"), "bootstrap docs must document cloud SSH config install");
ensure(docs.includes("Do not commit private SSH keys"), "bootstrap docs must forbid private SSH keys in repo");

ensure(installer.includes("Host SEIS-SSH"), "installer must keep SEIS-SSH as the managed host");
ensure(installer.includes("cloudOnly: true"), "installer must declare cloud-only mode");
ensure(installer.includes("--transport direct-cloud"), "installer must support direct-cloud picker-compatible transport");
ensure(!installer.includes("Host seis-cloud-vps"), "installer must not write direct VPS picker aliases");
ensure(onlineCheck.includes("github-codespaces"), "online check must keep GitHub Codespaces provider evidence");
ensure(onlineCheck.includes("require-picker-compatible"), "online check must support picker-compatible readiness");
ensure(onlineCheck.includes("codex-cli-missing"), "online check must verify remote Codex CLI");

if (failures.length > 0) {
  console.error("SEIS SSH cloud roadmap check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH cloud roadmap check passed.");

function readJson(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function readText(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
