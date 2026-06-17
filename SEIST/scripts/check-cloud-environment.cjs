const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const FILE = path.join(ROOT, "deploy", "cloud-environment.json");
const REGISTRY_FILE = path.join(ROOT, "content", "development", "connector-capability-registry.json");
const PLUGIN_INVENTORY_FILE = path.join(ROOT, "content", "development", "requested-plugin-inventory.json");
const PLUGIN_CAPABILITY_LANES_FILE = path.join(ROOT, "content", "development", "plugin-capability-lanes.json");
const PLUGIN_DOWNLOAD_READINESS_FILE = path.join(ROOT, "content", "development", "plugin-download-readiness.json");
const REQUESTED_SOFTWARE_STACK_FILE = path.join(ROOT, "content", "development", "requested-software-stack.json");
const FULLSTACK_LANGUAGE_MATRIX_FILE = path.join(ROOT, "content", "development", "fullstack-language-matrix.json");
const SERVER_TARGETS_FILE = path.join(ROOT, "deploy", "server-targets.json");
const PACKAGE_FILE = path.join(ROOT, "package.json");
const failures = [];
const REQUIRED_ENVIRONMENT_SOURCE_KEYS = [
  "submittedPluginInventory",
  "submittedPluginCapabilityLanes",
  "pluginDownloadReadiness",
  "requestedSoftwareStack",
  "fullstackLanguageMatrix"
];
const REQUIRED_REQUESTED_PLUGIN_IDS = [
  "base44",
  "wix",
  "fal",
  "picsart",
  "posthog",
  "nvidia-skills",
  "lovable",
  "replit",
  "shutterstock",
  "convex",
  "apollo",
  "supabase",
  "github",
  "vercel",
  "figma",
  "slack",
  "google-calendar",
  "data-analytics"
];
const REQUIRED_FULLSTACK_SOURCE_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Node.js",
  "MySQL",
  "React",
  "Express.js",
  "Python",
  "Go",
  "Rust",
  "SQL",
  "GraphQL",
  "OpenAPI",
  "Docker"
];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${path.relative(ROOT, file)}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`);
    return null;
  }
}

const payload = readJson(FILE);
const registry = readJson(REGISTRY_FILE);
const pluginInventory = readJson(PLUGIN_INVENTORY_FILE);
const pluginCapabilityLanes = readJson(PLUGIN_CAPABILITY_LANES_FILE);
const pluginDownloadReadiness = readJson(PLUGIN_DOWNLOAD_READINESS_FILE);
const requestedSoftwareStack = readJson(REQUESTED_SOFTWARE_STACK_FILE);
const fullstackLanguageMatrix = readJson(FULLSTACK_LANGUAGE_MATRIX_FILE);
const serverTargets = readJson(SERVER_TARGETS_FILE);
const packageJson = readJson(PACKAGE_FILE);
const packageScripts = new Set(Object.keys(packageJson?.scripts || {}));

function ensureQualityCommandsExist(commands, owner) {
  ensure(Array.isArray(commands) && commands.length > 0, `${owner} must define qualityCommands`);

  for (const command of commands || []) {
    const npmScript = String(command).match(/^npm run ([^\s]+)/)?.[1];
    const nodeScript = String(command).match(/^node (scripts\/[^\s]+)/)?.[1];

    ensure(Boolean(npmScript || nodeScript), `${owner} quality command must use npm run <script> or node scripts/<file>: ${command}`);
    if (npmScript) {
      ensure(packageScripts.has(npmScript), `${owner} references missing package script ${npmScript}`);
    }
    if (nodeScript) {
      ensure(fs.existsSync(path.join(ROOT, nodeScript)), `${owner} references missing node script ${nodeScript}`);
    }
  }
}

if (payload) {
ensure(typeof payload.id === "string" && payload.id.length > 0, "cloud id must be defined");
ensure(payload.branch === "UIXAppTTR", "branch must remain UIXAppTTR");
ensure(payload.remote === "origin", "remote must remain origin");
ensure(typeof payload.releasePackage === "string" && payload.releasePackage.includes("dist/"), "releasePackage must point to dist artifact");
ensure(payload.sources && typeof payload.sources === "object", "cloud environment must expose sources");
for (const key of REQUIRED_ENVIRONMENT_SOURCE_KEYS) {
  ensure(Boolean(payload.sources?.[key]), `cloud environment sources must expose ${key}`);
}
ensure(Array.isArray(payload.providers) && payload.providers.length >= 5, "providers list must include at least five candidates");
ensure(
  Array.isArray(payload.guardrails) && payload.guardrails.length >= 4,
  "guardrails must define at least four operational rules"
);

const requiredDeployVars = payload.environment?.requiredAtDeployTime || [];
ensure(
  Array.isArray(requiredDeployVars) && requiredDeployVars.includes("SEIS_SITE_URL") && requiredDeployVars.includes("SEIS_CLOUD_PROVIDER"),
  "requiredAtDeployTime must include SEIS_SITE_URL and SEIS_CLOUD_PROVIDER"
);

const providerIds = new Set((payload.providers || []).map((provider) => provider.id));
for (const id of ["github-pages", "cloudflare-pages", "vercel-static", "netlify-static"]) {
  ensure(providerIds.has(id), `provider ${id} must be declared`);
}

const secretProviderIds = new Set(
  (payload.environment?.secrets || []).flatMap((secret) => secret.requiredFor || [])
);
for (const id of ["azure-static-web-apps", "aws-amplify-static", "firebase-hosting"]) {
  ensure(secretProviderIds.has(id), `provider ${id} must have a declared secret gate`);
}

const languages = new Set([
  ...(payload.polyglotRuntime?.primary || []),
  ...(payload.polyglotRuntime?.expansion || [])
]);
ensure(languages.size >= 16, "polyglot runtime must define at least sixteen language surfaces");
ensure(
  JSON.stringify(payload.environment?.public || {}).includes("full-efficiency-low-pressure"),
  "public environment must preserve full-efficiency-low-pressure mode"
);

for (const provider of payload.providers || []) {
  ensure(provider.uploadModel, `provider ${provider.id || "unknown"} must define uploadModel`);
  ensureQualityCommandsExist(provider.qualityCommands, `provider ${provider.id || "unknown"}`);
  ensure(provider.rollback, `provider ${provider.id || "unknown"} must define rollback`);
}

if (pluginInventory) {
  const source = payload.sources?.submittedPluginInventory;
  const inventoryPlugins = Array.isArray(pluginInventory.plugins) ? pluginInventory.plugins : [];
  const sourcePlugins = Array.isArray(source?.plugins) ? source.plugins : [];
  const sourceUris = new Set(sourcePlugins.map((plugin) => plugin.uri));

  ensure(source, "cloud environment sources must include submittedPluginInventory");
  ensure(source?.path === "content/development/requested-plugin-inventory.json", "submittedPluginInventory source path must point to the requested plugin inventory");
  ensure(source?.reportPath === "reports/requested-plugin-trace.json", "submittedPluginInventory report path must point to requested plugin trace report");
  ensure(source?.uniquePlugins === inventoryPlugins.length, "submittedPluginInventory uniquePlugins must match inventory length");
  ensure(source?.uniquePlugins >= 300, "submittedPluginInventory must expose at least 300 unique requested plugins");
  ensure(source?.totalLinks >= 300, "submittedPluginInventory must preserve the submitted plugin list scale");
  ensure(sourcePlugins.length === inventoryPlugins.length, "submittedPluginInventory plugins must mirror inventory plugins");

  for (const plugin of inventoryPlugins) {
    ensure(sourceUris.has(plugin.uri), `cloud environment sources missing plugin ${plugin.uri}`);
  }

  const sourcePluginIds = new Set(sourcePlugins.map((plugin) => plugin.id));
  for (const id of REQUIRED_REQUESTED_PLUGIN_IDS) {
    ensure(sourcePluginIds.has(id), `cloud environment sources must expose requested plugin ${id}`);
  }

  for (const uri of [
    "plugin://public-equity-investing@openai-curated-remote",
    "plugin://product-design@openai-curated-remote",
    "plugin://investment-banking@openai-curated-remote",
    "plugin://creative-production@openai-curated-remote",
    "plugin://sales@openai-curated-remote",
    "plugin://data-analytics@openai-curated-remote"
  ]) {
    ensure(sourceUris.has(uri), `cloud environment sources must expose ${uri}`);
  }
}

if (pluginCapabilityLanes && pluginInventory) {
  const source = payload.sources?.submittedPluginCapabilityLanes;
  const inventoryPlugins = Array.isArray(pluginInventory.plugins) ? pluginInventory.plugins : [];
  const assignments = Array.isArray(pluginCapabilityLanes.assignments) ? pluginCapabilityLanes.assignments : [];
  const lanes = Array.isArray(pluginCapabilityLanes.laneSummaries) ? pluginCapabilityLanes.laneSummaries : [];
  const assignmentByUri = new Map(assignments.map((assignment) => [assignment.uri, assignment]));
  const sourceLanes = Array.isArray(source?.lanes) ? source.lanes : [];
  const sourceRemotePlugins = Array.isArray(source?.remotePlugins) ? source.remotePlugins : [];

  ensure(source, "cloud environment sources must include submittedPluginCapabilityLanes");
  ensure(source?.path === "content/development/plugin-capability-lanes.json", "submittedPluginCapabilityLanes source path must point to plugin capability lanes");
  ensure(source?.reportPath === "reports/plugin-capability-lanes.json", "submittedPluginCapabilityLanes report path must point to plugin capability lane report");
  ensure(source?.uniquePlugins === inventoryPlugins.length, "submittedPluginCapabilityLanes uniquePlugins must match inventory length");
  ensure(source?.laneCount === lanes.length, "submittedPluginCapabilityLanes laneCount must match lane summaries");
  ensure(sourceLanes.length === lanes.length, "submittedPluginCapabilityLanes lanes must mirror lane summaries");

  for (const plugin of inventoryPlugins) {
    const assignment = assignmentByUri.get(plugin.uri);
    ensure(Boolean(assignment), `plugin capability lanes missing assignment for ${plugin.uri}`);
    ensure(Boolean(assignment?.primaryLane), `plugin capability lanes missing primary lane for ${plugin.uri}`);
  }

  for (const uri of [
    "plugin://public-equity-investing@openai-curated-remote",
    "plugin://product-design@openai-curated-remote",
    "plugin://investment-banking@openai-curated-remote",
    "plugin://creative-production@openai-curated-remote",
    "plugin://sales@openai-curated-remote",
    "plugin://data-analytics@openai-curated-remote"
  ]) {
    const assignment = assignmentByUri.get(uri);
    ensure(Boolean(assignment?.primaryLane), `plugin capability lanes must expose a primary lane for ${uri}`);
    ensure(
      sourceRemotePlugins.some((plugin) => plugin.uri === uri && plugin.primaryLane === assignment?.primaryLane),
      `cloud environment sources must expose remote capability lane for ${uri}`
    );
  }
}

if (pluginDownloadReadiness && pluginInventory) {
  const source = payload.sources?.pluginDownloadReadiness;
  const inventoryPlugins = Array.isArray(pluginInventory.plugins) ? pluginInventory.plugins : [];
  const readinessPlugins = Array.isArray(pluginDownloadReadiness.plugins) ? pluginDownloadReadiness.plugins : [];
  const sourcePlugins = Array.isArray(source?.plugins) ? source.plugins : [];
  const readinessUris = new Set(readinessPlugins.map((plugin) => plugin.uri));
  const sourceUris = new Set(sourcePlugins.map((plugin) => plugin.uri));
  const readinessByUri = new Map(readinessPlugins.map((plugin) => [plugin.uri, plugin]));
  const sourceByUri = new Map(sourcePlugins.map((plugin) => [plugin.uri, plugin]));

  ensure(source, "cloud environment sources must include pluginDownloadReadiness");
  ensure(source?.path === "content/development/plugin-download-readiness.json", "pluginDownloadReadiness source path must point to plugin download readiness");
  ensure(source?.reportPath === "reports/plugin-download-readiness.json", "pluginDownloadReadiness report path must point to plugin download readiness report");
  ensure(source?.uniquePlugins === inventoryPlugins.length, "pluginDownloadReadiness uniquePlugins must match inventory length");
  ensure(source?.downloadReadyPlugins === inventoryPlugins.length, "pluginDownloadReadiness must mark every submitted plugin download-ready");
  ensure(source?.installReadyPlugins === inventoryPlugins.length, "pluginDownloadReadiness must mark every submitted plugin install-ready");
  ensure(source?.useReadyPlugins === inventoryPlugins.length, "pluginDownloadReadiness must mark every submitted plugin use-ready");
  ensure(sourcePlugins.length === inventoryPlugins.length, "pluginDownloadReadiness plugins must mirror inventory plugins");
  ensure(
    source?.policy?.installPolicy === "download_or_enable_only_for_submitted_plugins_when_available_authenticated_scoped_and_user_approved",
    "pluginDownloadReadiness must preserve scoped install policy"
  );
  ensure(
    source?.policy?.installStrategy === "prefer_existing_available_plugin_then_request_install_for_exact_submitted_uri",
    "pluginDownloadReadiness must preserve scoped install strategy"
  );
  ensure(
    source?.policy?.useStrategy === "activate_plugin_only_for_matching_task_and_authenticated_account",
    "pluginDownloadReadiness must preserve scoped use strategy"
  );
  ensure(
    source?.policy?.downloadTarget === "codex_plugin_catalog_or_current_session_capabilities",
    "pluginDownloadReadiness must preserve safe download target"
  );
  ensure(source?.policy?.secretHandling === "never_commit_tokens", "pluginDownloadReadiness must forbid committed tokens");

  for (const plugin of inventoryPlugins) {
    const readinessPlugin = readinessByUri.get(plugin.uri);
    const sourcePlugin = sourceByUri.get(plugin.uri);

    ensure(readinessUris.has(plugin.uri), `plugin download readiness missing plugin ${plugin.uri}`);
    ensure(sourceUris.has(plugin.uri), `cloud environment download readiness missing plugin ${plugin.uri}`);
    ensure(readinessPlugin?.installReadiness === "ready_to_request_install_or_enable", `plugin download readiness must mark ${plugin.uri} install-ready`);
    ensure(sourcePlugin?.installReadiness === "ready_to_request_install_or_enable", `cloud environment download readiness must expose install readiness for ${plugin.uri}`);
    ensure(readinessPlugin?.useReadiness === "ready_when_tool_available_authenticated_and_scoped", `plugin download readiness must mark ${plugin.uri} use-ready`);
    ensure(sourcePlugin?.useReadiness === "ready_when_tool_available_authenticated_and_scoped", `cloud environment download readiness must expose use readiness for ${plugin.uri}`);
    ensure(readinessPlugin?.downloadTarget === "codex_plugin_catalog_or_current_session_capabilities", `plugin download readiness must expose safe download target for ${plugin.uri}`);
    ensure(sourcePlugin?.downloadTarget === "codex_plugin_catalog_or_current_session_capabilities", `cloud environment download readiness must expose safe download target for ${plugin.uri}`);
    ensure(readinessPlugin?.requestedByUser === true, `plugin download readiness must preserve user request flag for ${plugin.uri}`);
    ensure(sourcePlugin?.requestedByUser === true, `cloud environment download readiness must expose user request flag for ${plugin.uri}`);
  }
}

if (requestedSoftwareStack) {
  const source = payload.sources?.requestedSoftwareStack;
  const technologies = Array.isArray(requestedSoftwareStack.technologies) ? requestedSoftwareStack.technologies : [];
  const sourceTechnologies = Array.isArray(source?.technologies) ? source.technologies : [];
  const sourceTechnologyIds = new Set(sourceTechnologies.map((technology) => technology.id));
  const requestedTechnologyIds = new Set(technologies.map((technology) => technology.id));

  ensure(source, "cloud environment sources must include requestedSoftwareStack");
  ensure(source?.path === "content/development/requested-software-stack.json", "requestedSoftwareStack source path must point to requested software stack");
  ensure(source?.reportPath === "reports/requested-software-stack.json", "requestedSoftwareStack report path must point to requested software stack report");
  ensure(source?.technologyCount === technologies.length, "requestedSoftwareStack technologyCount must match stack technologies");
  ensure(sourceTechnologies.length === technologies.length, "requestedSoftwareStack technologies must mirror stack source");

  for (const id of ["javascript", "nodejs", "mysql", "react", "expressjs", "typescript"]) {
    ensure(requestedTechnologyIds.has(id), `requested software stack must include ${id}`);
    ensure(sourceTechnologyIds.has(id), `cloud environment sources must expose requested software stack ${id}`);
  }

  for (const technology of technologies) {
    for (const entrypoint of technology.entrypoints || []) {
      ensure(fs.existsSync(path.join(ROOT, entrypoint)), `requested software stack entrypoint missing: ${entrypoint}`);
    }
  }
}

if (fullstackLanguageMatrix) {
  const source = payload.sources?.fullstackLanguageMatrix;
  const languages = Array.isArray(fullstackLanguageMatrix.languages) ? fullstackLanguageMatrix.languages : [];
  const layers = Array.isArray(fullstackLanguageMatrix.layers) ? fullstackLanguageMatrix.layers : [];
  const sourceLanguages = Array.isArray(source?.languages) ? source.languages : [];
  const sourceLayers = Array.isArray(source?.layers) ? source.layers : [];
  const sourceLanguageNames = new Set(sourceLanguages.map((language) => language.language));

  ensure(source, "cloud environment sources must include fullstackLanguageMatrix");
  ensure(source?.path === "content/development/fullstack-language-matrix.json", "fullstackLanguageMatrix source path must point to full-stack language matrix");
  ensure(source?.reportPath === "reports/fullstack-language-matrix.json", "fullstackLanguageMatrix report path must point to full-stack language matrix report");
  ensure(source?.languageCount === languages.length, "fullstackLanguageMatrix languageCount must match matrix source");
  ensure(source?.layerCount === layers.length, "fullstackLanguageMatrix layerCount must match matrix layers");
  ensure(sourceLanguages.length === languages.length, "fullstackLanguageMatrix languages must mirror matrix source");
  ensure(sourceLayers.length === layers.length, "fullstackLanguageMatrix layers must mirror matrix source");
  ensure(languages.length >= 108, "fullstackLanguageMatrix must include all polyglot language surfaces");

  for (const language of ["JavaScript", "Node.js", "MySQL", "React", "Express.js", "TypeScript"]) {
    ensure(sourceLanguageNames.has(language), `fullstackLanguageMatrix must expose ${language}`);
  }

  for (const language of REQUIRED_FULLSTACK_SOURCE_LANGUAGES) {
    ensure(sourceLanguageNames.has(language), `fullstackLanguageMatrix must keep ${language} visible in environment sources`);
  }

  for (const language of languages) {
    for (const entrypoint of language.entrypoints || []) {
      ensure(fs.existsSync(path.join(ROOT, entrypoint)), `fullstackLanguageMatrix entrypoint missing: ${entrypoint}`);
    }
  }
}
}

if (registry) {
  const connectors = Array.isArray(registry.connectors) ? registry.connectors : [];
  const skills = Array.isArray(registry.skills) ? registry.skills : [];

  ensure(registry.mode === "explicit-auth-only", "connector registry must use explicit-auth-only mode");
  ensure(registry.policy?.secretHandling === "never_commit_tokens", "connector registry must forbid committed tokens");
  ensure(connectors.length >= 8, "connector registry must include at least eight connector candidates");
  ensure(skills.length >= 8, "skills registry must include at least eight candidates");

  for (const connector of connectors) {
    ensure(connector.id, "every connector must define id");
    ensure(connector.surface, `connector ${connector.id || "unknown"} must define surface`);
    ensure(connector.activationPolicy, `connector ${connector.id || "unknown"} must define activationPolicy`);
    ensure(
      Array.isArray(connector.blockedWithout) && connector.blockedWithout.length > 0,
      `connector ${connector.id || "unknown"} must define blockedWithout`
    );
    ensureQualityCommandsExist(connector.qualityCommands, `connector ${connector.id || "unknown"}`);
  }
}

if (serverTargets) {
  ensure(serverTargets.requiresUserConfirmation === true, "server targets must require user confirmation");
  ensure(Array.isArray(serverTargets.candidates) && serverTargets.candidates.length >= 5, "server targets must define at least five candidates");
  ensure(
    serverTargets.activeTarget === null || (serverTargets.candidates || []).some((candidate) => candidate.id === serverTargets.activeTarget),
    "activeTarget must be null or match a known candidate"
  );
}

if (failures.length > 0) {
  console.error("Cloud environment check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Cloud environment check passed.");
