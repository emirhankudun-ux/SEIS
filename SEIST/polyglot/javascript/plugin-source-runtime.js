export const requestedRuntimeStack = Object.freeze([
  "javascript",
  "nodejs",
  "mysql",
  "react",
  "expressjs",
  "typescript"
]);

export function summarizeEnvironmentSources(environment) {
  const sources = environment?.sources || {};
  const inventory = sources.submittedPluginInventory || {};
  const lanes = sources.submittedPluginCapabilityLanes || {};
  const stack = sources.requestedSoftwareStack || {};

  return {
    sourceKeys: Object.keys(sources),
    pluginCount: inventory.uniquePlugins || 0,
    capabilityLaneCount: lanes.laneCount || 0,
    requestedStackCount: stack.technologyCount || 0,
    requestedRuntimeStack
  };
}

export function isRequestedRuntimeStackVisible(environment) {
  const technologies = environment?.sources?.requestedSoftwareStack?.technologies || [];
  const visibleIds = new Set(technologies.map((technology) => technology.id));

  return requestedRuntimeStack.every((id) => visibleIds.has(id));
}
