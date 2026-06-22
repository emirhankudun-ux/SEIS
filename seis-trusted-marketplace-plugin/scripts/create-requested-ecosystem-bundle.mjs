#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const bundlePath = path.join(root, "assets", "requested-ecosystem-bundle.json");
const readinessRelativePath = "content/development/plugin-download-readiness.json";

const localRequestedPlugins = [
  {
    id: "seis-trusted-marketplace",
    label: "seis-trusted-marketplace",
    source: "personal",
    uri: "plugin://seis-trusted-marketplace@personal",
    primaryLane: "security-quality-and-governance"
  },
  {
    id: "magicpath",
    label: "magicpath",
    source: "openai-curated",
    uri: "plugin://magicpath@openai-curated",
    primaryLane: "builder-and-prototyping"
  },
  {
    id: "superhuman",
    label: "superhuman",
    source: "openai-curated",
    uri: "plugin://superhuman@openai-curated",
    primaryLane: "collaboration-calendar-and-support"
  }
];

const laneToSeisCapability = {
  "builder-and-prototyping": "development",
  "creative-production-and-design": "design",
  "analytics-observability-and-growth": "monitoring",
  "ai-workflow-docs-and-knowledge": "learning",
  "backend-data-and-api": "data-engineering",
  "sales-gtm-and-market-intelligence": "productivity",
  "collaboration-calendar-and-support": "productivity",
  "platform-native-and-polyglot": "development",
  "security-quality-and-governance": "security",
  "cloud-devops-and-release": "development",
  "specialized-domain-and-research": "learning",
  "finance-investing-and-payments": "data-engineering"
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function normalizePlugin(plugin, order) {
  const primaryLane = plugin.primaryLane || "ai-workflow-docs-and-knowledge";
  return {
    order,
    id: plugin.id,
    label: plugin.label || plugin.id,
    source: plugin.source,
    uri: plugin.uri,
    requestedStatus: plugin.requestedStatus || plugin.status || "submitted-not-activated",
    primaryLane,
    seisCapability: laneToSeisCapability[primaryLane] || "productivity",
    matchedLanes: plugin.matchedLanes?.length ? plugin.matchedLanes : [primaryLane],
    installReadiness: plugin.installReadiness || "ready_to_request_install_or_enable",
    useReadiness: plugin.useReadiness || "ready_when_tool_available_authenticated_and_scoped",
    activationPolicy: plugin.activationPolicy || "activate_only_when_relevant_authenticated_scoped_and_user_approved",
    gates: plugin.gates || [
      "plugin_uri_matches_submitted_inventory",
      "plugin_or_app_is_available_in_current_environment_or_install_catalog",
      "account_authentication_present_when_required",
      "task_scope_matches_capability_lane",
      "no_secrets_committed",
      "targeted_validation_passed"
    ]
  };
}

function deriveReadinessFromExistingBundle() {
  if (!fs.existsSync(bundlePath)) {
    throw new Error(`Missing ${readinessRelativePath} and ${path.relative(root, bundlePath)} fallback.`);
  }

  const existingBundle = readJson(bundlePath);
  const localUris = new Set(localRequestedPlugins.map((plugin) => plugin.uri));
  const plugins = (existingBundle.plugins || []).filter((plugin) => !localUris.has(plugin.uri));

  return {
    summary: {
      uniquePlugins: existingBundle.summary?.upstreamPlugins || plugins.length
    },
    plugins
  };
}

function readReadiness(connection) {
  const readinessPath = path.join(connection.repository.localWorkspace, readinessRelativePath);

  if (fs.existsSync(readinessPath)) {
    return readJson(readinessPath);
  }

  return deriveReadinessFromExistingBundle();
}

function buildBundle() {
  const connection = readJson(path.join(root, "assets", "seis-repo-connection.json"));
  const readiness = readReadiness(connection);
  const pluginsByUri = new Map();

  for (const plugin of localRequestedPlugins) {
    pluginsByUri.set(plugin.uri, plugin);
  }

  for (const plugin of readiness.plugins || []) {
    if (!pluginsByUri.has(plugin.uri)) {
      pluginsByUri.set(plugin.uri, plugin);
    }
  }

  const plugins = Array.from(pluginsByUri.values()).map((plugin, index) => normalizePlugin(plugin, index + 1));
  const uniquePluginIds = new Set(plugins.map((plugin) => plugin.id));
  const uniquePluginUris = new Set(plugins.map((plugin) => plugin.uri));

  return {
    version: 1,
    id: "seis-requested-ecosystem-bundle",
    mode: "curated-not-activated",
    sourceReferences: [
      {
        id: "uix-plugin-download-readiness",
        path: readinessRelativePath,
        repository: connection.repository.githubRemote,
        branch: connection.repository.branch
      },
      {
        id: "personal-requested-additions",
        path: "chat-request",
        summary: "Local personal plugin plus newly requested MagicPath and Superhuman entries."
      }
    ],
    policy: {
      activationPolicy: "activate_only_when_relevant_authenticated_scoped_and_user_approved",
      installPolicy: "download_or_enable_only_for_submitted_plugins_when_available_authenticated_scoped_and_user_approved",
      liveActivation: "blocked_until_target_auth_approval_and_rollback_are_explicit",
      requiredLocalUris: localRequestedPlugins.map((plugin) => plugin.uri)
    },
    summary: {
      upstreamPlugins: readiness.summary?.uniquePlugins || (readiness.plugins || []).length,
      localRequestedAdditions: localRequestedPlugins.length,
      totalPlugins: plugins.length,
      uniquePluginIds: uniquePluginIds.size,
      uniquePluginUris: uniquePluginUris.size,
      sourceCounts: countBy(plugins, (plugin) => plugin.source),
      laneCounts: countBy(plugins, (plugin) => plugin.primaryLane),
      seisCapabilityCounts: countBy(plugins, (plugin) => plugin.seisCapability)
    },
    plugins
  };
}

const bundle = buildBundle();
const expected = stableJson(bundle);

if (checkOnly) {
  const current = fs.existsSync(bundlePath) ? fs.readFileSync(bundlePath, "utf8") : "";
  if (current !== expected) {
    console.error("Requested ecosystem bundle is stale.");
    console.error("Run npm run ecosystem:bundle to refresh assets/requested-ecosystem-bundle.json.");
    process.exit(1);
  }
  console.log("Requested ecosystem bundle check passed.");
} else {
  fs.writeFileSync(bundlePath, expected);
  console.log(`Requested ecosystem bundle written: ${path.relative(root, bundlePath)}`);
}
