import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const APP_PLUGIN_SOURCE_ROOT = "plugins/seis-core";
export const APP_PLUGIN_GOAL_ID = "SEIS-GOAL-021";
export const APP_PLUGIN_STATUS_STATES = new Set(["ready", "active", "healthy", "ok", "attention", "partial", "not-verified"]);
export const DENY_BY_DEFAULT_PERMISSIONS = Object.freeze({ write: [], network: [], secrets: [] });

export function applicationPluginRoot(repoRoot) {
  return path.join(repoRoot, ...APP_PLUGIN_SOURCE_ROOT.split("/"));
}

export function discoverApplicationPlugins(repoRoot) {
  const root = applicationPluginRoot(repoRoot);
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(root, name, ".codex-plugin", "plugin.json")))
    .sort()
    .map((name) => readPluginBundle(repoRoot, name));
}

export function readPluginBundle(repoRoot, name) {
  const root = applicationPluginRoot(repoRoot);
  const pluginRoot = path.join(root, name);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const profilePath = path.join(pluginRoot, "assets", "plugin-profile.json");
  const manifest = readJson(manifestPath);
  const profile = readJson(profilePath);
  const entrypoint = profile.entrypoint || null;
  return {
    name,
    root: pluginRoot,
    manifestPath,
    profilePath,
    manifest,
    profile,
    entrypoint,
    entrypointPath: entrypoint ? path.join(pluginRoot, entrypoint) : null,
  };
}

export function validatePluginContract(bundle, currentRelease) {
  const failures = [];
  const { name, root, manifest, profile, entrypoint, entrypointPath } = bundle;
  if (manifest.name !== name) failures.push("manifest-name-mismatch");
  if (profile.stableId !== name) failures.push("profile-id-mismatch");
  if (manifest.version !== currentRelease.semver) failures.push("manifest-version-mismatch");
  if (profile.version !== currentRelease.semver) failures.push("profile-version-mismatch");
  if (profile.releaseTrainVersion !== currentRelease.label) failures.push("release-label-mismatch");
  if (profile.releaseMajor !== currentRelease.major) failures.push("release-major-mismatch");
  if (profile.releaseRevision !== currentRelease.revision) failures.push("release-revision-mismatch");
  if ((profile.releaseMicroUnits ?? null) !== (currentRelease.microUnits ?? null)) failures.push("release-micro-units-mismatch");
  if (profile.implementationState !== "functional-local-demo") failures.push("implementation-state-not-functional-local-demo");
  if (profile.status !== "approved-public-readonly") failures.push("profile-not-approved-public-readonly");
  if (manifest.license !== "MIT") failures.push("manifest-not-public-mit");
  if (profile.license !== "MIT") failures.push("profile-not-public-mit");
  if (profile.publicRepositoryAvailable !== true) failures.push("public-repository-availability-missing");
  if (profile.publicAudience !== "everyone") failures.push("public-audience-not-everyone");
  if (profile.publicMarketplace !== true) failures.push("public-marketplace-availability-missing");
  if (profile.marketplaceDiscoverable !== true) failures.push("marketplace-discoverability-missing");
  if (profile.marketplaceCard !== false) failures.push("retained-source-must-not-be-marketplace-card");
  if (!/^seis-application-bundle-\d{2}$/.test(profile.marketplaceBundleId || "")) failures.push("application-bundle-mapping-missing");
  for (const permission of ["write", "network", "secrets"]) {
    if (!Array.isArray(profile.permissions?.[permission]) || profile.permissions[permission].length !== 0) {
      failures.push(`permission-${permission}-not-empty`);
    }
  }
  if (!entrypoint || entrypoint.startsWith("/") || entrypoint.includes("..")) failures.push("entrypoint-not-relative");
  if (!entrypointPath || !isInside(root, entrypointPath) || !fs.existsSync(entrypointPath)) failures.push("entrypoint-missing-or-escapes-plugin");
  return failures;
}

export function runPluginStatus(bundle, repoRoot, { timeoutMs = 5000 } = {}) {
  const failures = validatePluginContract(bundle, readCurrentRelease(repoRoot));
  if (failures.length) return { state: "invalid-contract", ok: false, failures, execution: "skipped" };
  try {
    const output = execFileSync(process.execPath, [bundle.entrypointPath, "--status"], {
      cwd: bundle.root,
      env: {
        PATH: process.env.PATH || "",
        LANG: "C",
        TZ: "UTC",
        SEIS_WORKSPACE_ROOT: repoRoot,
        SEIS_PLUGIN_ROOT: bundle.root,
      },
      encoding: "utf8",
      timeout: timeoutMs,
      maxBuffer: 256 * 1024,
    });
    const payload = JSON.parse(output);
    const state = String(payload.status ?? payload.state ?? "unknown");
    return {
      state,
      ok: APP_PLUGIN_STATUS_STATES.has(state),
      payload,
      execution: "status-only",
      writes: "disabled-by-contract",
      network: "disabled-by-contract",
      secrets: "not-read",
    };
  } catch (error) {
    return {
      state: "execution-failed",
      ok: false,
      execution: "status-only",
      failures: [error.code || error.message || "status-command-failed"],
      writes: "disabled-by-contract",
      network: "disabled-by-contract",
      secrets: "not-read",
    };
  }
}

export function readCurrentRelease(repoRoot) {
  return readJson(path.join(repoRoot, "content", "development", "seis-core-plugin-release-train.json")).currentRelease;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function isInside(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}
