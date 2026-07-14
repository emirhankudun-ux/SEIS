import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const registryPath = "data/seis-enterprise-expansion-v3.json";
const schemaPath = "schemas/seis-enterprise-expansion-v3.schema.json";
const documentationPath = "docs/governance/seis-enterprise-expansion-v3.md";
const manifestPath = "project.ecosystem.yaml";
const goalRegistryPath = "content/development/seis-goal-tracking.json";
const failures = [];

const expectedDomains = new Map([
  ["architecture-governance", [
    "Architecture Registry", "Architecture Graph", "Architecture Ownership",
    "Architecture Validation", "Architecture Evolution", "Architecture Compatibility",
    "Architecture Metrics", "Architecture Risk", "Architecture Decisions", "Architecture Review"
  ]],
  ["execution-engine", [
    "Execution Context", "Execution Scope", "Execution Boundary", "Execution Policy",
    "Execution Strategy", "Execution Evidence", "Execution Timeline", "Execution State",
    "Execution Audit", "Execution Rollback", "Execution Replay", "Execution History",
    "Execution Metrics", "Execution Optimization"
  ]],
  ["validation-matrix", [
    "Syntax Validation", "Schema Validation", "Contract Validation", "Dependency Validation",
    "Repository Validation", "Goal Validation", "Security Validation", "Performance Validation",
    "Accessibility Validation", "Localization Validation", "Storage Validation", "Database Validation",
    "Workflow Validation", "Plugin Validation", "MCP Validation", "Provider Validation",
    "Model Validation", "AI Validation", "Design Validation", "Build Validation",
    "Release Validation", "Rollback Validation"
  ]],
  ["observability", [
    "Metrics", "Tracing", "Logging", "Events", "Audit Trails", "Repository Timeline",
    "Agent Timeline", "Workflow Timeline", "Goal Timeline", "Knowledge Timeline",
    "Model Timeline", "Plugin Timeline", "Security Timeline", "Architecture Timeline"
  ]],
  ["design-governance", [
    "Design Language", "Component Ownership", "Design Tokens", "Spacing Tokens",
    "Typography Tokens", "Motion Tokens", "Icon Registry", "Illustration Registry",
    "Asset Registry", "Theme Registry", "Brand Registry", "Accessibility Rules",
    "Platform Guidelines", "Visual Consistency"
  ]],
  ["ai-governance", [
    "Reasoning Policy", "Prompt Policy", "Context Policy", "Memory Policy", "Knowledge Policy", "Routing Policy", "Safety Policy",
    "Evaluation Policy", "Model Policy", "Provider Policy", "Autonomy Policy", "Approval Policy", "Human Review Policy", "Audit Policy"
  ]],
  ["knowledge-graph", [
    "Projects", "Repositories", "Goals", "Tasks", "Agents", "Models", "Providers",
    "Workflows", "Plugins", "MCP Servers", "Datasets", "Assets", "Templates",
    "Design Systems", "Architectures", "Policies", "Evidence", "Validation", "Research", "Technology"
  ]],
  ["long-term-evolution", [
    "1 Month", "3 Months", "6 Months", "12 Months", "24 Months", "36 Months", "60 Months",
    "10 Years", "Technology Forecast", "Architecture Forecast", "AI Forecast", "Platform Forecast",
    "Research Forecast", "Innovation Forecast", "Civilization Forecast"
  ]]
]);

const expectedNodeFields = [
  "relationships", "dependencies", "version_history", "ownership", "confidence",
  "evidence", "references", "risk", "lifecycle"
];
const expectedHorizonLabels = ["1 Month", "3 Months", "6 Months", "12 Months", "24 Months", "36 Months", "60 Months", "10 Years"];
const expectedForecastLabels = ["Technology Forecast", "Architecture Forecast", "AI Forecast", "Platform Forecast", "Research Forecast", "Innovation Forecast", "Civilization Forecast"];
const expectedFinalStrengths = ["Architecture", "Knowledge", "Security", "Maintainability", "Accessibility", "Performance", "Human Experience", "Long-Term Sustainability"];
const expectedNotClaimed = [
  "production implementation of every listed term",
  "live observability or timeline ingestion",
  "live knowledge graph synchronization",
  "live provider, model, plugin, or MCP execution",
  "background agent execution",
  "enterprise release readiness"
];
const expectedPluginReferences = [
  "template-creator",
  "sites",
  "app-69312da8e4dc81919370cb86fd172b6c",
  "app-699d522f170c81919c824678c7c03732",
  "canva",
  "figma",
  "nvidia",
  "lovable",
  "openai-developers",
  "twilio-developer-kit",
  "wix"
];

function absolute(relativePath) {
  return resolve(root, relativePath);
}

function requireValue(condition, message) {
  if (!condition) failures.push(message);
}

function readText(relativePath) {
  const file = absolute(relativePath);
  if (!existsSync(file)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${relativePath} must contain valid JSON: ${error.message}`);
    return {};
  }
}

const registry = readJson(registryPath);
const schema = readJson(schemaPath);
const manifest = readJson(manifestPath);
const goalRegistry = readJson(goalRegistryPath);
const documentation = readText(documentationPath);

requireValue(schema.$schema === "https://json-schema.org/draft/2020-12/schema", `${schemaPath} must use JSON Schema 2020-12`);
requireValue(schema.$id === "https://seis.dev/schemas/seis-enterprise-expansion-v3.schema.json", `${schemaPath} has an invalid $id`);
requireValue(registry.schema_version === 1, `${registryPath} schema_version must be 1`);
requireValue(registry.id === "seis-enterprise-expansion-v3", `${registryPath} id is invalid`);
requireValue(registry.title === "SEIS Enterprise Expansion V3", `${registryPath} title is invalid`);
requireValue(registry.status === "active", `${registryPath} status must be active`);
requireValue(registry.maturity === "specification", `${registryPath} maturity must remain specification`);
requireValue(registry.project === "seis", `${registryPath} project must be seis`);
requireValue(registry.related_goal_id === "SEIS-GOAL-003", `${registryPath} must link SEIS-GOAL-003`);
requireValue(registry.security_classification === "public-safe", `${registryPath} must remain public-safe`);
requireValue(registry.privacy_impact === "none", `${registryPath} privacy_impact must be none`);
requireValue(registry.registry_path === registryPath, `${registryPath} registry_path must be canonical`);
requireValue(registry.schema_path === schemaPath, `${registryPath} schema_path must be canonical`);
requireValue(registry.documentation_path === documentationPath, `${registryPath} documentation_path must be canonical`);
requireValue(registry.validation_command === "npm run check:seis-enterprise-expansion-v3", `${registryPath} validation_command is invalid`);

for (const path of [registryPath, schemaPath, documentationPath]) {
  requireValue(existsSync(absolute(path)), `${registryPath} references missing artifact: ${path}`);
}

const activeGoalIds = manifest.goal_tracking?.active_goal_ids;
requireValue(manifest.project?.id === "seis", `${manifestPath} project.id must be seis`);
requireValue(Array.isArray(activeGoalIds) && activeGoalIds.includes(registry.related_goal_id), `${manifestPath} must list ${registry.related_goal_id} as active`);
const goals = Array.isArray(goalRegistry.goals) ? goalRegistry.goals : [];
const relatedGoal = goals.find((goal) => goal.id === registry.related_goal_id);
requireValue(Boolean(relatedGoal), `${goalRegistryPath} must contain ${registry.related_goal_id}`);
requireValue(relatedGoal?.status === "active", `${registry.related_goal_id} must remain active while the registry is specification-only`);

const domains = Array.isArray(registry.domains) ? registry.domains : [];
requireValue(domains.length === expectedDomains.size, `${registryPath} must define exactly ${expectedDomains.size} domains`);
requireValue(new Set(domains.map((domain) => domain.id)).size === domains.length, `${registryPath} domain ids must be unique`);

const termIds = new Set();
for (const [domainId, expectedLabels] of expectedDomains) {
  const domain = domains.find((candidate) => candidate.id === domainId);
  requireValue(Boolean(domain), `${registryPath} is missing domain ${domainId}`);
  if (!domain) continue;
  requireValue(domain.status === "specified", `${domainId} must remain specification-only`);
  const labels = Array.isArray(domain.terms) ? domain.terms.map((term) => term.label) : [];
  requireValue(JSON.stringify(labels) === JSON.stringify(expectedLabels), `${domainId} terms do not match the Enterprise Expansion V3 brief`);
  requireValue(new Set(labels).size === labels.length, `${domainId} term labels must be unique within the domain`);
  for (const term of domain.terms || []) {
    requireValue(!termIds.has(term.id), `${registryPath} contains duplicate term id ${term.id}`);
    termIds.add(term.id);
    requireValue(term.status === "specified", `${term.id} must remain specification-only`);
  }
  requireValue(Array.isArray(domain.required_evidence) && domain.required_evidence.length > 0, `${domainId} must define required evidence`);
}

const nodeFields = registry.universal_node_contract?.required_fields || [];
requireValue(JSON.stringify(nodeFields) === JSON.stringify(expectedNodeFields), `${registryPath} universal node fields are incomplete or reordered`);
requireValue(typeof registry.universal_node_contract?.completion_rule === "string", `${registryPath} must define a node completion rule`);
requireValue(JSON.stringify(registry.final_enterprise_rule?.required_strengths) === JSON.stringify(expectedFinalStrengths), `${registryPath} final enterprise strengths are incomplete or reordered`);
requireValue(registry.final_enterprise_rule?.prohibited_optimization === "Never optimize only for the current iteration.", `${registryPath} must prohibit current-iteration-only optimization`);
requireValue(registry.final_enterprise_rule?.long_term_rule === "Always optimize for the long-term evolution of the SEIS ecosystem.", `${registryPath} must preserve the long-term evolution rule`);
const pluginReferences = Array.isArray(registry.requested_plugin_references) ? registry.requested_plugin_references : [];
requireValue(JSON.stringify(pluginReferences.map((reference) => reference.id)) === JSON.stringify(expectedPluginReferences), `${registryPath} requested plugin references are incomplete or reordered`);
for (const reference of pluginReferences) {
  requireValue(reference.status === "requested", `${reference.id} plugin reference must remain requested`);
  requireValue(reference.runtime_status === "unverified", `${reference.id} plugin runtime must remain unverified`);
  requireValue(reference.write_access === "not-granted", `${reference.id} plugin write access must remain not-granted`);
}
requireValue(JSON.stringify(registry.implementation_boundary?.not_claimed) === JSON.stringify(expectedNotClaimed), `${registryPath} implementation boundary must preserve explicit non-claims`);
requireValue(JSON.stringify(domains.find((domain) => domain.id === "long-term-evolution")?.horizons) === JSON.stringify(expectedHorizonLabels), `${registryPath} long-term horizons are invalid`);
requireValue(JSON.stringify(domains.find((domain) => domain.id === "long-term-evolution")?.forecasts) === JSON.stringify(expectedForecastLabels), `${registryPath} long-term forecasts are invalid`);

for (const label of [...expectedDomains.values()].flat()) {
  requireValue(registry.domains.some((domain) => domain.terms?.some((term) => term.label === label)), `${registryPath} is missing term ${label}`);
}
requireValue(documentation.includes("specification"), `${documentationPath} must disclose specification maturity`);
requireValue(documentation.includes("does not claim"), `${documentationPath} must disclose non-claims`);
for (const domain of domains) {
  requireValue(documentation.includes(domain.title), `${documentationPath} must document ${domain.title}`);
}

const secretPatterns = [
  /-----BEGIN [A-Z ]+-----/,
  /(?:sk|ghp|github_pat)_[A-Za-z0-9_-]{12,}/,
  /AKIA[0-9A-Z]{12,}/,
  /(?:file|vscode|cursor):\/\//
];
const inspectedText = [JSON.stringify(registry), JSON.stringify(schema), documentation].join("\n");
for (const pattern of secretPatterns) {
  requireValue(!pattern.test(inspectedText), `${registryPath} governance artifacts contain a secret-shaped or machine-local URI value`);
}

if (failures.length > 0) {
  console.error("SEIS Enterprise Expansion V3 check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  const termCount = domains.reduce((count, domain) => count + domain.terms.length, 0);
  console.log(`SEIS Enterprise Expansion V3 check passed (${domains.length} domains, ${termCount} specified terms, ${termIds.size} unique term ids).`);
}
