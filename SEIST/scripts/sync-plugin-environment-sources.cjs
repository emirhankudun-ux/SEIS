#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const environmentPath = path.join(ROOT, "deploy", "cloud-environment.json");
const inventoryPath = path.join(ROOT, "content", "development", "requested-plugin-inventory.json");
const reportPath = path.join(ROOT, "reports", "requested-plugin-trace.json");
const capabilityLanesPath = path.join(ROOT, "content", "development", "plugin-capability-lanes.json");
const capabilityLanesReportPath = path.join(ROOT, "reports", "plugin-capability-lanes.json");
const downloadReadinessPath = path.join(ROOT, "content", "development", "plugin-download-readiness.json");
const downloadReadinessReportPath = path.join(ROOT, "reports", "plugin-download-readiness.json");
const requestedSoftwareStackPath = path.join(ROOT, "content", "development", "requested-software-stack.json");
const requestedSoftwareStackReportPath = path.join(ROOT, "reports", "requested-software-stack.json");
const fullstackLanguageMatrixPath = path.join(ROOT, "content", "development", "fullstack-language-matrix.json");
const fullstackLanguageMatrixReportPath = path.join(ROOT, "reports", "fullstack-language-matrix.json");

const environment = readJson(environmentPath);
const inventory = readJson(inventoryPath);
const plugins = Array.isArray(inventory.plugins) ? inventory.plugins : [];
const sourceCounts = plugins.reduce((counts, plugin) => {
  counts[plugin.source] = (counts[plugin.source] || 0) + 1;
  return counts;
}, {});

const submittedPluginInventory = {
  id: inventory.id,
  path: path.relative(ROOT, inventoryPath),
  reportPath: path.relative(ROOT, reportPath),
  updatedAt: inventory.updatedAt,
  totalLinks: inventory.summary?.totalLinks || plugins.length,
  uniquePlugins: plugins.length,
  sourceCounts,
  activationPolicy: "activate_only_when_relevant_authenticated_scoped_and_user_approved",
  plugins: plugins.map((plugin) => ({
    order: plugin.order,
    id: plugin.id,
    label: plugin.label,
    source: plugin.source,
    uri: plugin.uri,
    status: plugin.status
  }))
};

const submittedPluginCapabilityLanes = fs.existsSync(capabilityLanesPath)
  ? createCapabilityLaneSource(readJson(capabilityLanesPath))
  : null;
const pluginDownloadReadiness = fs.existsSync(downloadReadinessPath)
  ? createDownloadReadinessSource(readJson(downloadReadinessPath))
  : null;
const requestedSoftwareStack = fs.existsSync(requestedSoftwareStackPath)
  ? createRequestedSoftwareStackSource(readJson(requestedSoftwareStackPath))
  : null;
const fullstackLanguageMatrix = fs.existsSync(fullstackLanguageMatrixPath)
  ? createFullstackLanguageMatrixSource(readJson(fullstackLanguageMatrixPath))
  : null;

const expected = withSubmittedPluginSources(
  environment,
  submittedPluginInventory,
  submittedPluginCapabilityLanes,
  pluginDownloadReadiness,
  requestedSoftwareStack,
  fullstackLanguageMatrix
);
const expectedText = `${JSON.stringify(expected, null, 2)}\n`;

if (checkMode) {
  const currentText = fs.readFileSync(environmentPath, "utf8");
  if (currentText !== expectedText) {
    console.error("Plugin environment sources are stale.");
    console.error("Run node scripts/sync-plugin-environment-sources.cjs to refresh deploy/cloud-environment.json.");
    process.exit(1);
  }

  console.log("Plugin environment sources check passed.");
} else {
  fs.writeFileSync(environmentPath, expectedText);
  console.log("Plugin environment sources synced: deploy/cloud-environment.json");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function createCapabilityLaneSource(capabilityLanes) {
  const lanes = Array.isArray(capabilityLanes.laneSummaries) ? capabilityLanes.laneSummaries : [];
  const assignments = Array.isArray(capabilityLanes.assignments) ? capabilityLanes.assignments : [];

  return {
    id: capabilityLanes.id,
    path: path.relative(ROOT, capabilityLanesPath),
    reportPath: path.relative(ROOT, capabilityLanesReportPath),
    generatedAt: capabilityLanes.generatedAt,
    activationPolicy: capabilityLanes.policy?.activationPolicy || "activate_only_when_relevant_authenticated_scoped_and_user_approved",
    uniquePlugins: capabilityLanes.summary?.uniquePlugins || assignments.length,
    laneCount: lanes.length,
    laneCounts: capabilityLanes.summary?.laneCounts || {},
    remotePlugins: (capabilityLanes.remotePlugins || []).map((plugin) => ({
      id: plugin.id,
      uri: plugin.uri,
      primaryLane: plugin.primaryLane,
      matchedLanes: plugin.matchedLanes || []
    })),
    lanes: lanes.map((lane) => ({
      id: lane.id,
      label: lane.label,
      pluginCount: lane.pluginCount,
      qualityCommands: lane.qualityCommands
    }))
  };
}

function createDownloadReadinessSource(downloadReadiness) {
  const plugins = Array.isArray(downloadReadiness.plugins) ? downloadReadiness.plugins : [];

  return {
    id: downloadReadiness.id,
    path: path.relative(ROOT, downloadReadinessPath),
    reportPath: path.relative(ROOT, downloadReadinessReportPath),
    generatedAt: downloadReadiness.generatedAt,
    mode: downloadReadiness.mode,
    policy: downloadReadiness.policy || {},
    totalLinks: downloadReadiness.summary?.totalLinks || plugins.length,
    uniquePlugins: plugins.length,
    downloadReadyPlugins: downloadReadiness.summary?.downloadReadyPlugins || plugins.length,
    installReadyPlugins: downloadReadiness.summary?.installReadyPlugins || plugins.length,
    useReadyPlugins: downloadReadiness.summary?.useReadyPlugins || plugins.length,
    sourceCounts: downloadReadiness.summary?.sourceCounts || {},
    laneCounts: downloadReadiness.summary?.laneCounts || {},
    plugins: plugins.map((plugin) => ({
      order: plugin.order,
      id: plugin.id,
      label: plugin.label,
      source: plugin.source,
      uri: plugin.uri,
      primaryLane: plugin.primaryLane,
      downloadStatus: plugin.downloadStatus,
      installReadiness: plugin.installReadiness,
      useReadiness: plugin.useReadiness,
      downloadTarget: plugin.downloadTarget,
      requestedByUser: plugin.requestedByUser,
      installPolicy: plugin.installPolicy,
      activationPolicy: plugin.activationPolicy
    }))
  };
}

function createRequestedSoftwareStackSource(stackSource) {
  const technologies = Array.isArray(stackSource.technologies) ? stackSource.technologies : [];

  return {
    id: stackSource.id,
    path: path.relative(ROOT, requestedSoftwareStackPath),
    reportPath: path.relative(ROOT, requestedSoftwareStackReportPath),
    generatedAt: stackSource.generatedAt,
    mode: stackSource.mode,
    activationPolicy: stackSource.activationPolicy,
    technologyCount: technologies.length,
    entrypointCount: stackSource.summary?.entrypointCount || 0,
    sourceReferences: stackSource.sourceReferences || {},
    technologies: technologies.map((technology) => ({
      id: technology.id,
      label: technology.label,
      runtimeRole: technology.runtimeRole,
      primaryLane: technology.primaryLane,
      entrypoints: technology.entrypoints,
      supportingPlugins: technology.supportingPlugins
    }))
  };
}

function createFullstackLanguageMatrixSource(matrixSource) {
  const layers = Array.isArray(matrixSource.layers) ? matrixSource.layers : [];
  const languages = Array.isArray(matrixSource.languages) ? matrixSource.languages : [];

  return {
    id: matrixSource.id,
    path: path.relative(ROOT, fullstackLanguageMatrixPath),
    reportPath: path.relative(ROOT, fullstackLanguageMatrixReportPath),
    generatedAt: matrixSource.generatedAt,
    mode: matrixSource.mode,
    activationPolicy: matrixSource.activationPolicy,
    languageCount: languages.length,
    layerCount: layers.length,
    entrypointCount: matrixSource.summary?.entrypointCount || 0,
    sourceReferences: matrixSource.sourceReferences || {},
    layers: layers.map((layer) => ({
      id: layer.id,
      label: layer.label,
      languageCount: layer.languageCount
    })),
    languages: languages.map((language) => ({
      order: language.order,
      language: language.language,
      layer: language.layer,
      layerLabel: language.layerLabel,
      role: language.role,
      entrypoints: language.entrypoints,
      requestedCoreStack: language.requestedCoreStack
    }))
  };
}

function withSubmittedPluginSources(
  payload,
  submittedPluginInventorySource,
  submittedPluginCapabilityLaneSource,
  pluginDownloadReadinessSource,
  requestedSoftwareStackSource,
  fullstackLanguageMatrixSource
) {
  const existingSources = payload.sources && typeof payload.sources === "object"
    ? payload.sources
    : {};
  const nextSources = {
    ...existingSources,
    submittedPluginInventory: submittedPluginInventorySource
  };

  if (submittedPluginCapabilityLaneSource) {
    nextSources.submittedPluginCapabilityLanes = submittedPluginCapabilityLaneSource;
  }

  if (pluginDownloadReadinessSource) {
    nextSources.pluginDownloadReadiness = pluginDownloadReadinessSource;
  }

  if (requestedSoftwareStackSource) {
    nextSources.requestedSoftwareStack = requestedSoftwareStackSource;
  }

  if (fullstackLanguageMatrixSource) {
    nextSources.fullstackLanguageMatrix = fullstackLanguageMatrixSource;
  }

  const next = {};
  let inserted = false;

  for (const [key, value] of Object.entries(payload)) {
    if (key === "sources") continue;
    next[key] = value;

    if (key === "environment") {
      next.sources = nextSources;
      inserted = true;
    }
  }

  if (!inserted) next.sources = nextSources;
  return next;
}
