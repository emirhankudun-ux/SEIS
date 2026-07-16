#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const sourceRoot = path.join(root, "plugins", "seis-core");
const sourceRootLabel = "plugins/seis-core";
const corePluginSourceRoot = path.join(root, "packages", "seis-ai", "plugins");
const releaseTrainPath = path.join(root, "content", "development", "seis-core-plugin-release-train.json");
const registryPath = path.join(root, "content", "development", "seis-ai-core-plugin-registry.json");
const failures = [];
const records = [];
const releaseTrain = readJsonIfPresent(releaseTrainPath);
const currentRelease = releaseTrain?.currentRelease || {};

if (!fs.existsSync(sourceRoot)) fail("SEIS Command Center app plugin source root is missing");
if (fs.existsSync(corePluginSourceRoot)) {
  const corePluginDirectories = fs.readdirSync(corePluginSourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(corePluginSourceRoot, entry.name, ".codex-plugin", "plugin.json")));
  if (corePluginDirectories.length > 0) fail("personal plugin sources must not live under packages/seis-ai/plugins");
}
const entries = fs.existsSync(sourceRoot)
  ? fs.readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(sourceRoot, entry.name, ".codex-plugin", "plugin.json")))
    .sort((a, b) => a.name.localeCompare(b.name))
  : [];

for (const entry of entries) {
  const pluginRoot = path.join(sourceRoot, entry.name);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const profilePath = path.join(pluginRoot, "assets", "plugin-profile.json");
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
    if (manifest.name !== entry.name) fail(`${entry.name}: manifest name does not match directory`);
    if (manifest.version !== currentRelease.semver) fail(`${entry.name}: manifest version is not the active app release semver`);
    if (profile.stableId !== entry.name) fail(`${entry.name}: profile stableId does not match directory`);
    if (profile.version !== currentRelease.semver) fail(`${entry.name}: profile version is not the active app release semver`);
    if (profile.releaseTrainVersion !== currentRelease.label) fail(`${entry.name}: profile releaseTrainVersion is not the active app release label`);
    if (profile.releaseMajor !== currentRelease.major) fail(`${entry.name}: profile releaseMajor is not the active app release major`);
    if (profile.releaseRevision !== currentRelease.revision) fail(`${entry.name}: profile releaseRevision is not the active app release revision`);
    if ((profile.releaseMicroUnits ?? null) !== (currentRelease.microUnits ?? null)) fail(`${entry.name}: profile releaseMicroUnits is not the active app release micro units`);
    if (profile.implementationState !== "functional-local-demo") fail(`${entry.name}: implementation state is not functional-local-demo`);
    if (profile.status !== "approved-public-readonly") fail(`${entry.name}: status is not approved-public-readonly`);
    if (manifest.license !== "MIT") fail(`${entry.name}: manifest must use the public MIT license`);
    if (profile.license !== "MIT") fail(`${entry.name}: profile must use the public MIT license`);
    if (profile.publicRepositoryAvailable !== true) fail(`${entry.name}: profile must be public-repository available`);
    if (profile.publicAudience !== "everyone") fail(`${entry.name}: profile public audience must be everyone`);
    if (profile.publicMarketplace !== true) fail(`${entry.name}: app-owned plugin must be available in the public seis-repo marketplace`);
    if (!Array.isArray(profile.permissions?.write) || profile.permissions.write.length !== 0) fail(`${entry.name}: write permissions are not empty`);
    if (!Array.isArray(profile.permissions?.network) || profile.permissions.network.length !== 0) fail(`${entry.name}: network permissions are not empty`);
    if (!Array.isArray(profile.permissions?.secrets) || profile.permissions.secrets.length !== 0) fail(`${entry.name}: secret permissions are not empty`);
    if (typeof profile.entrypoint !== "string" || profile.entrypoint.startsWith("/") || profile.entrypoint.includes("..")) fail(`${entry.name}: entrypoint is not repository-relative`);
    const entrypoint = path.join(pluginRoot, profile.entrypoint || "");
    if (!fs.existsSync(entrypoint)) fail(`${entry.name}: entrypoint is missing`);
    let statusOutput = "";
    if (fs.existsSync(entrypoint)) {
      try {
        statusOutput = execFileSync(process.execPath, [entrypoint, "--status"], {
          cwd: pluginRoot,
          env: { PATH: process.env.PATH || "", SEIS_WORKSPACE_ROOT: root },
          encoding: "utf8",
          timeout: 5000,
          maxBuffer: 256 * 1024,
        });
      } catch (error) {
        fail(`${entry.name}: --status failed with exit ${error.status ?? "unknown"}`);
      }
    }
    if (statusOutput) {
      try {
        const payload = JSON.parse(statusOutput);
        const status = payload.status ?? payload.state;
        if (!["ready", "active", "healthy", "ok", "attention"].includes(String(status))) {
          fail(`${entry.name}: --status returned an unsupported state`);
        }
      } catch {
        fail(`${entry.name}: --status did not return JSON`);
      }
    }
    records.push({ name: entry.name, version: manifest.version, releaseTrainVersion: profile.releaseTrainVersion, releaseMajor: profile.releaseMajor, releaseRevision: profile.releaseRevision, releaseMicroUnits: profile.releaseMicroUnits ?? null, entrypoint: profile.entrypoint });
  } catch {
    fail(`${entry.name}: manifest or profile is invalid or missing`);
  }
}

try {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  if (registry.target?.appOwnedPluginCount !== records.length) fail("registry app-owned count does not match physical application source count");
  if (registry.target?.functionalLocalDemoCount !== records.length) fail("registry functional local-demo count does not match source count");
  if (registry.target?.appReleaseLabel !== currentRelease.label) fail("registry app release label does not match active release train");
  if (registry.target?.appReleaseSemver !== currentRelease.semver) fail("registry app release semver does not match active release train");
  if (registry.target?.appReleaseMajor !== currentRelease.major) fail("registry app release major does not match active release train");
  if (registry.target?.appReleaseRevision !== currentRelease.revision) fail("registry app release revision does not match active release train");
  if ((registry.target?.appReleaseMicroUnits ?? null) !== (currentRelease.microUnits ?? null)) fail("registry app release micro units do not match active release train");
  const physical = registry.entries.filter((entry) => entry.sourcePath?.startsWith(`${sourceRootLabel}/`));
  if (physical.length !== records.length) fail("registry physical source entries do not match source count");
  if (physical.some((entry) => entry.releaseTrainVersion !== currentRelease.label || entry.releaseSemver !== currentRelease.semver || entry.releaseMajor !== currentRelease.major || entry.releaseRevision !== currentRelease.revision || (entry.releaseMicroUnits ?? null) !== (currentRelease.microUnits ?? null))) fail("registry app-owned entries are not on the active release train");
} catch {
  fail("AI Core plugin registry is missing or invalid");
}

if (failures.length) {
  console.error("SEIS Command Center app plugin source check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  sourceRoot: sourceRootLabel,
  physicalPluginCount: records.length,
  statusChecksPassed: records.length,
  networkPermissions: "empty",
  writePermissions: "empty",
  secretPermissions: "empty",
  sourceCodeExecutionScope: "entrypoint --status only",
}, null, 2));

function fail(message) {
  failures.push(message);
}

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    fail("SEIS app release train is missing or invalid");
    return null;
  }
}
