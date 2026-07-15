import path from "node:path";

import {
  APP_PLUGIN_GOAL_ID,
  APP_PLUGIN_SOURCE_ROOT,
  discoverApplicationPlugins,
  readCurrentRelease,
  runPluginStatus,
  validatePluginContract,
} from "./plugin-contract.mjs";

export const APP_PLUGIN_CATALOG_ID = "seis-core-application-plugin-catalog";
export const APP_PLUGIN_CATALOG_MODE = "local-read-only";
export const APP_PLUGIN_CATALOG_LIMIT = 100;
export const APP_PLUGIN_ALLOWED_INSPECTION_ACTIONS = Object.freeze(["inspect", "status"]);
export const APP_PLUGIN_APPROVAL_REQUIRED_ACTIONS = Object.freeze(["run", "write", "network", "secrets"]);

export function buildApplicationPluginCatalog(repoRoot, options = {}) {
  const currentRelease = readCurrentRelease(repoRoot);
  const query = normalizeQuery(options.query);
  const includeStatus = options.includeStatus === true;
  const limit = normalizeLimit(options.limit, APP_PLUGIN_CATALOG_LIMIT);
  const plugins = discoverApplicationPlugins(repoRoot)
    .map((bundle) => toCatalogEntry(bundle, repoRoot, currentRelease, { includeStatus }))
    .filter((plugin) => matchesQuery(plugin, query))
    .slice(0, limit);

  const allPlugins = discoverApplicationPlugins(repoRoot)
    .map((bundle) => toCatalogEntry(bundle, repoRoot, currentRelease, { includeStatus: false }));

  return {
    schemaVersion: 1,
    id: APP_PLUGIN_CATALOG_ID,
    goalId: APP_PLUGIN_GOAL_ID,
    application: "apps/seis-core",
    mode: APP_PLUGIN_CATALOG_MODE,
    sourceRoot: APP_PLUGIN_SOURCE_ROOT,
    release: compactRelease(currentRelease),
    policy: {
      sourceOwnership: "apps/seis-core",
      sourceMutation: false,
      network: "disabled-by-default",
      secrets: "not-read",
      write: "approval-required",
      executableAction: "status-only",
      allowedInspectionActions: APP_PLUGIN_ALLOWED_INSPECTION_ACTIONS,
      approvalRequiredActions: APP_PLUGIN_APPROVAL_REQUIRED_ACTIONS,
    },
    counts: {
      discovered: allPlugins.length,
      returned: plugins.length,
      contractValid: allPlugins.filter((plugin) => plugin.contract.valid).length,
      contractInvalid: allPlugins.filter((plugin) => !plugin.contract.valid).length,
      statusReady: plugins.filter((plugin) => plugin.status.state === "ready").length,
      statusNotChecked: plugins.filter((plugin) => plugin.status.state === "not-checked").length,
    },
    query: query || null,
    plugins,
  };
}

export function searchApplicationPlugins(repoRoot, query, options = {}) {
  return buildApplicationPluginCatalog(repoRoot, { ...options, query });
}

export function getApplicationPlugin(repoRoot, name, options = {}) {
  const requestedName = String(name || "").trim();
  if (!requestedName) return null;
  const catalog = buildApplicationPluginCatalog(repoRoot, {
    ...options,
    limit: APP_PLUGIN_CATALOG_LIMIT,
  });
  return catalog.plugins.find((plugin) => plugin.name === requestedName) || null;
}

export function createApplicationPluginActivationPlan(repoRoot, name, action = "status") {
  const plugin = getApplicationPlugin(repoRoot, name, { includeStatus: false });
  if (!plugin) {
    return {
      ok: false,
      mode: "not-found",
      plugin: String(name || "").trim() || null,
      action,
      executes: false,
      error: "Application-owned plugin was not found.",
    };
  }

  const normalizedAction = String(action || "status").trim().toLowerCase();
  const inspectionAllowed = APP_PLUGIN_ALLOWED_INSPECTION_ACTIONS.includes(normalizedAction);
  if (!inspectionAllowed) {
    return {
      ok: false,
      mode: "approval-required",
      goalId: APP_PLUGIN_GOAL_ID,
      plugin: plugin.name,
      action: normalizedAction,
      executes: false,
      approvalRequired: true,
      reason: `The app-local boundary permits inspect/status only; ${normalizedAction} requires an explicit approval workflow.`,
      permissions: plugin.permissions,
    };
  }

  return {
    ok: true,
    mode: "read-only-plan",
    goalId: APP_PLUGIN_GOAL_ID,
    plugin: plugin.name,
    action: normalizedAction,
    executes: false,
    approvalRequired: false,
    command: [plugin.entrypoint, "--status"],
    sourcePath: plugin.sourcePath,
    release: plugin.release,
    permissions: plugin.permissions,
    reason: "The plan is evidence-only and does not activate a write, network, or secret capability.",
  };
}

export function inspectApplicationPlugin(repoRoot, name, options = {}) {
  const plugin = getApplicationPlugin(repoRoot, name, options);
  if (!plugin) return null;
  return {
    ...plugin,
    activation: {
      status: createApplicationPluginActivationPlan(repoRoot, plugin.name, "status"),
      run: createApplicationPluginActivationPlan(repoRoot, plugin.name, "run"),
    },
  };
}

function toCatalogEntry(bundle, repoRoot, currentRelease, { includeStatus }) {
  const contractFailures = validatePluginContract(bundle, currentRelease);
  const status = includeStatus && contractFailures.length === 0
    ? runPluginStatus(bundle, repoRoot)
    : null;
  const interfaceData = bundle.manifest.interface || {};
  const profile = bundle.profile || {};
  const sourcePath = path.relative(repoRoot, bundle.root).split(path.sep).join("/");

  return {
    id: bundle.name,
    name: bundle.name,
    displayName: interfaceData.displayName || bundle.name,
    description: bundle.manifest.description || interfaceData.shortDescription || "Application-owned local plugin.",
    category: interfaceData.category || profile.category || "SEIS Core",
    capabilities: Array.isArray(interfaceData.capabilities) ? interfaceData.capabilities : [],
    owner: profile.owner || interfaceData.developerName || "@seis-core",
    sourcePath,
    entrypoint: bundle.entrypoint,
    release: compactRelease(currentRelease),
    implementationState: profile.implementationState || "unknown",
    lifecycleStatus: profile.status || "unknown",
    risk: profile.risk || "unclassified",
    permissions: {
      read: Array.isArray(profile.permissions?.read) ? profile.permissions.read : [],
      write: Array.isArray(profile.permissions?.write) ? profile.permissions.write : [],
      network: Array.isArray(profile.permissions?.network) ? profile.permissions.network : [],
      secrets: Array.isArray(profile.permissions?.secrets) ? profile.permissions.secrets : [],
    },
    contract: {
      valid: contractFailures.length === 0,
      failures: contractFailures,
    },
    status: status
      ? {
          state: status.state,
          ok: status.ok === true,
          execution: status.execution,
          failures: status.failures || [],
        }
      : {
          state: contractFailures.length === 0 ? "not-checked" : "invalid-contract",
          ok: contractFailures.length === 0,
          execution: "not-run",
          failures: contractFailures,
        },
    validation: Array.isArray(profile.validation) ? profile.validation : [],
    rollback: profile.rollback || null,
  };
}

function compactRelease(release) {
  return {
    label: release.label,
    semver: release.semver,
    kind: release.kind,
    major: release.major,
    revision: release.revision,
    microUnits: release.microUnits ?? null,
  };
}

function matchesQuery(plugin, query) {
  if (!query) return true;
  return [
    plugin.id,
    plugin.name,
    plugin.displayName,
    plugin.description,
    plugin.category,
    plugin.owner,
    plugin.risk,
    ...plugin.capabilities,
  ].some((value) => String(value || "").toLowerCase().includes(query));
}

function normalizeQuery(query) {
  return typeof query === "string" ? query.trim().toLowerCase() : "";
}

function normalizeLimit(limit, fallback) {
  const value = Number(limit);
  if (!Number.isSafeInteger(value) || value < 1) return fallback;
  return Math.min(value, fallback);
}
