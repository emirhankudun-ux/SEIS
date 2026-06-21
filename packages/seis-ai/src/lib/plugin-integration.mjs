import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const PLUGIN_INTEGRATION_PATH = "content/development/seis-agent-plugin-integration.json";

export function readPluginIntegration(repoRoot) {
  const filePath = path.join(repoRoot, ...PLUGIN_INTEGRATION_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS plugin integration manifest is missing: ${PLUGIN_INTEGRATION_PATH}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function pluginIntegrationStatus(repoRoot, options = {}) {
  try {
    const manifest = readPluginIntegration(repoRoot);
    const lanes = Array.isArray(manifest.lanes) ? manifest.lanes : [];
    const personalPlugins = Array.isArray(manifest.personalPlugins) ? manifest.personalPlugins : [];
    const payload = {
      ok: true,
      manifestPath: PLUGIN_INTEGRATION_PATH,
      id: manifest.id,
      status: manifest.status,
      primaryInstallId: manifest.primaryInstallId,
      installedEnabledCount: manifest.auditedSnapshot?.installedEnabledCount ?? null,
      notInstalledCount: manifest.auditedSnapshot?.notInstalledCount ?? null,
      personalPluginCount: personalPlugins.length,
      personalPlugins: personalPlugins.map((plugin) => ({
        id: plugin.id,
        status: plugin.status,
        embeddedAs: plugin.embeddedAs
      })),
      laneCount: lanes.length,
      lanes: lanes.map((lane) => ({
        id: lane.id,
        displayName: lane.displayName,
        role: lane.role,
        mcpTools: lane.mcpTools,
        defaultGate: lane.defaultGate
      })),
      helperPluginUniverse: manifest.helperPluginUniverse,
      qualityCommands: manifest.qualityCommands
    };

    if (options.includeFullManifest === true) {
      payload.manifest = manifest;
    }

    return payload;
  } catch (error) {
    return {
      ok: false,
      manifestPath: PLUGIN_INTEGRATION_PATH,
      error: error.message
    };
  }
}
