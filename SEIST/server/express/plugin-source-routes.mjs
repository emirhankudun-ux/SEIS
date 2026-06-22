export function registerPluginSourceRoutes(app, options = {}) {
  if (!app || typeof app.get !== "function") {
    throw new TypeError("registerPluginSourceRoutes expects an Express-compatible app with app.get().");
  }

  app.get("/_server/plugin-sources", (_request, response) => {
    response.json(buildPluginSourcePayload(options.sources || {}));
  });

  app.get("/_server/software-stack", (_request, response) => {
    response.json(buildSoftwareStackPayload(options.sources?.requestedSoftwareStack || {}));
  });
}

export function buildPluginSourcePayload(sources) {
  return {
    ok: true,
    source: "express-plugin-source-routes",
    sourceKeys: Object.keys(sources),
    uniquePlugins: sources.submittedPluginInventory?.uniquePlugins || 0,
    capabilityLanes: sources.submittedPluginCapabilityLanes?.laneCount || 0,
    requestedTechnologies: sources.requestedSoftwareStack?.technologyCount || 0
  };
}

export function buildSoftwareStackPayload(stackSource) {
  return {
    ok: true,
    source: "express-plugin-source-routes",
    technologyCount: stackSource.technologyCount || 0,
    technologies: stackSource.technologies || []
  };
}
