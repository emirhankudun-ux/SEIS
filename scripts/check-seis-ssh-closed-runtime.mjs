#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const failures = [];

const contract = readJson("deploy/seis-ssh-closed-runtime-contract.json");
const accessModel = readJson("deploy/seis-ssh-access-model.json");
const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json");
const packageJson = readJson("package.json");
const docs = readText("docs/deployment/seis-ssh-closed-developer-runtime.md")
  + "\n"
  + readText("docs/deployment/seis-remote-codex-cli-bridge.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-cloud-roadmap.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-access-model.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-new-device-bootstrap.md");
const onlineCheck = readText("scripts/check-seis-cloud-ssh-online.mjs");
const remoteCodexBridge = readText("scripts/check-seis-remote-codex-bridge.mjs");
const installer = readText("scripts/install-seis-cloud-ssh-config.mjs");
const pickerCheck = readText("scripts/check-seis-ssh-picker-compatibility.mjs");
const sshConfig = readText(join(homedir(), ".ssh", "config"), { optional: true });

ensure(contract?.id === "seis-ssh-closed-runtime-contract", "contract id must be seis-ssh-closed-runtime-contract");
ensure(contract?.sourceModel === "deploy/seis-ssh-access-model.json", "contract must point to the access model");
ensure(contract?.sourceRoadmap === "deploy/seis-ssh-cloud-roadmap.json", "contract must point to the SSH roadmap");
ensure(contract?.targetAlias === "SEIS-SSH", "closed runtime target alias must be SEIS-SSH");
ensure(contract?.audience === "developers", "closed runtime audience must be developers");
ensure(contract?.runtimeType === "closed-cloud-development-system", "runtime type must be closed-cloud-development-system");
ensure(contract?.transport === "cloud-isolated-workspace", "closed runtime transport must be cloud-isolated-workspace");
ensure(contract?.vpnRequiredForSensitiveWork === true, "closed runtime must require VPN for sensitive work");
ensure(contract?.publicInboundRequired === false, "closed runtime must not require public inbound access");
ensure(contract?.localFallbackAllowed === false, "closed runtime must forbid local fallback");
ensure(contract?.directPublicVpsDevelopmentDefaultAllowed === false, "closed runtime must forbid direct public VPS as default");
ensure(contract?.repoVisibility === "open-source-artifacts-only", "closed runtime repo visibility must be open-source-artifacts-only");
ensure(contract?.privateRuntimeState?.storedInRepo === false, "private runtime state must not be stored in repo");
ensure(contract?.remoteCodexBridge?.runbook === "docs/deployment/seis-remote-codex-cli-bridge.md", "contract must link remote Codex bridge runbook");
ensure(contract?.remoteCodexBridge?.statusCommand === "npm run cloud:ssh:remote-codex:status", "contract must expose remote Codex status command");
ensure(contract?.remoteCodexBridge?.strictCommand === "npm run cloud:ssh:remote-codex:strict", "contract must expose remote Codex strict command");
ensure(contract?.remoteCodexBridge?.script === "scripts/check-seis-remote-codex-bridge.mjs", "contract must link remote Codex bridge script");
ensure(contract?.remoteCodexBridge?.mode === "read-only-no-prompt-execution", "remote Codex bridge must stay read-only no-prompt execution");
ensure(contract?.remoteCodexBridge?.promptExecutionAllowedByDefault === false, "remote Codex bridge must not allow prompt execution by default");
ensure(contract?.remoteCodexBridge?.remoteMutationAllowedByDefault === false, "remote Codex bridge must not allow remote mutation by default");

ensure(accessModel?.longTermDevelopment?.closedRuntimeContract === "deploy/seis-ssh-closed-runtime-contract.json", "access model must link closed runtime contract");
ensure(roadmap?.closedDeveloperRuntime?.contract === "deploy/seis-ssh-closed-runtime-contract.json", "roadmap must link closed runtime contract");
ensure(roadmap?.closedDeveloperRuntime?.runbook === "docs/deployment/seis-ssh-closed-developer-runtime.md", "roadmap must link closed runtime runbook");
ensure(roadmap?.closedDeveloperRuntime?.targetAlias === "SEIS-SSH", "roadmap closed runtime alias must be SEIS-SSH");
ensure(roadmap?.closedDeveloperRuntime?.privateRuntimeState === true, "roadmap must preserve private runtime state");
ensure(roadmap?.closedDeveloperRuntime?.publicInboundRequired === false, "roadmap must forbid public inbound for closed runtime");

const developerProfile = (accessModel?.profiles || []).find((profile) => profile.id === "developer-closed-system") || {};
ensure(developerProfile.developmentSystem === "closed-cloud-development-system", "developer profile must require closed cloud development system");
ensure(developerProfile.publicInboundRequired === false, "developer profile must not require public inbound access");
ensure((developerProfile.requiredControls || []).includes("secrets-kept-out-of-repo"), "developer profile must keep secrets out of repo");
ensure((developerProfile.requiredControls || []).includes("private-development-runtime-for-sensitive-work"), "developer profile must require private development runtime");

const scripts = packageJson?.scripts || {};
ensure(scripts["check:seis-ssh-closed-runtime"] === "node scripts/check-seis-ssh-closed-runtime.mjs", "missing check:seis-ssh-closed-runtime script");
ensure(scripts["check:seis-ssh-picker-compatibility"] === "node scripts/check-seis-ssh-picker-compatibility.mjs", "missing check:seis-ssh-picker-compatibility script");
ensure(scripts["cloud:ssh:remote-codex:status"] === "node scripts/check-seis-remote-codex-bridge.mjs", "missing cloud:ssh:remote-codex:status script");
ensure(scripts["cloud:ssh:remote-codex:strict"] === "node scripts/check-seis-remote-codex-bridge.mjs --require-ready", "missing cloud:ssh:remote-codex:strict script");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-closed-runtime"), "quality governance must include closed runtime check");

const requiredControls = contract?.requiredControls || [];
for (const control of [
  "single-visible-ssh-alias",
  "cloud-only-transport",
  "remote-codex-cli-present",
  "remote-seis-repo-present",
  "no-local-mac-dependency",
  "no-lan-hostname-dependency",
  "no-direct-public-vps-development-default",
  "secrets-kept-out-of-repo",
  "vpn-required-for-sensitive-team-developer-work",
  "sanitized-handoff-manifest-only"
]) {
  ensure(requiredControls.includes(control), `contract must require ${control}`);
}

const validationCommands = contract?.validationCommands || [];
for (const command of [
  "npm run check:seis-ssh-closed-runtime",
  "npm run check:seis-ssh-cloud-roadmap",
  "npm run check:seis-ssh-access-model",
  "npm run cloud:ssh:online:strict",
  "npm run cloud:ssh:remote-codex:strict"
]) {
  ensure(validationCommands.includes(command), `contract validation must include ${command}`);
}

const manifestSpec = contract?.handoffManifestSpec || {};
ensure(manifestSpec.artifactPolicy === "write-only-sanitized-status", "handoff manifest policy must be sanitized status only");
ensure(manifestSpec.secretDisclosureMustEqual === "none", "handoff manifest must require secretDisclosure none");
for (const field of ["privateKey", "token", "password", "wireguardPrivateKey", "certificate"]) {
  ensure((manifestSpec.forbiddenFields || []).includes(field), `handoff manifest must forbid ${field}`);
}

ensure(docs.includes("SEIS SSH Closed Developer Runtime"), "closed runtime docs must exist");
ensure(docs.includes("deploy/seis-ssh-closed-runtime-contract.json"), "closed runtime docs must link contract");
ensure(docs.includes("SEIS Remote Codex CLI Bridge"), "remote Codex bridge docs must exist");
ensure(docs.includes("npm run cloud:ssh:remote-codex:status"), "remote Codex bridge docs must expose status command");
ensure(docs.includes("npm run cloud:ssh:remote-codex:strict"), "remote Codex bridge docs must expose strict command");
ensure(docs.includes("It does not run Codex prompts"), "remote Codex bridge docs must block prompt execution claims");
ensure(docs.includes("\"secretDisclosure\": \"none\""), "closed runtime docs must show sanitized manifest");
ensure(docs.includes("Forbidden fields"), "closed runtime docs must document forbidden fields");
ensure(docs.includes("Phase 3: Closed Developer Runtime"), "roadmap docs must preserve phase 3");
ensure(docs.includes("SEIS SSH New Device Bootstrap"), "bootstrap docs must remain linked");

ensure(onlineCheck.includes("codex-cli-missing"), "online check must verify remote Codex CLI");
ensure(onlineCheck.includes("seis-repo-missing"), "online check must verify remote SEIS repo");
ensure(onlineCheck.includes("ssh-config-not-cloud-only"), "online check must reject non-cloud SSH config");
ensure(onlineCheck.includes("require-picker-compatible"), "online check must support picker-compatible readiness");
ensure(remoteCodexBridge.includes("read-only-no-prompt-execution"), "remote Codex bridge must be read-only no-prompt execution");
ensure(remoteCodexBridge.includes("codex --version"), "remote Codex bridge must verify codex --version");
ensure(remoteCodexBridge.includes("prompt_executed=no"), "remote Codex bridge must not execute prompts");
ensure(remoteCodexBridge.includes("remote-origin-not-github"), "remote Codex bridge must classify remote origin");
ensure(remoteCodexBridge.includes("This bridge check does not mutate the remote repo."), "remote Codex bridge must declare no remote mutation");
ensure(installer.includes("Host SEIS-SSH"), "installer must keep SEIS-SSH");
ensure(installer.includes("cloudOnly: true"), "installer must remain cloud-only");
ensure(installer.includes("--transport direct-cloud"), "installer must support direct-cloud transport");
ensure(pickerCheck.includes("codespaces-proxycommand-may-render-offline-in-some-pickers"), "picker check must explain Codespaces ProxyCommand picker limitation");
ensure(pickerCheck.includes("direct-cloud"), "picker check must support direct-cloud mode");

if (sshConfig) {
  const hostLines = sshConfig.split(/\r?\n/).filter((line) => /^Host\s+/.test(line));
  const visibleSeisHosts = hostLines
    .map((line) => line.replace(/^Host\s+/, "").trim())
    .filter((value) => value !== "github.com");
  ensure(visibleSeisHosts.length === 1 && visibleSeisHosts[0] === "SEIS-SSH", "local SSH config must expose only SEIS-SSH");
  ensure(!sshConfig.includes("Host seis-local-mac"), "local SSH config must not expose local Mac alias");
  ensure(!sshConfig.includes("Host seis-lan-mac"), "local SSH config must not expose LAN alias");
  ensure(!sshConfig.includes("Host seis-cloud-vps"), "local SSH config must not expose direct VPS alias");
}

if (failures.length > 0) {
  console.error("SEIS SSH closed runtime check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH closed runtime check passed.");

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
