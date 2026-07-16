export const APP_PLUGIN_EXPANSION_TARGET = 60;

export const PLUGIN_AUDIT_DEFINITIONS = Object.freeze([
  {
    id: "seis-approval-gate-review",
    displayName: "SEIS Approval Gate Review",
    description: "Review human approval boundaries and release-gate evidence without executing gated work.",
    category: "Governance",
    capabilities: ["Approval boundary review", "Gate evidence summary", "Human handoff"],
    checks: [
      exists("content/development/seis-ai-core-agent-permission-matrix.json", "permission matrix"),
      contains("docs/SECURITY.md", "explicit approval", "security approval rule"),
      contains("apps/seis-core/data/seis-core-plugin-release-readiness.json", "largeCodeChangeRequiresEvidence", "release evidence gate"),
    ],
  },
  {
    id: "seis-architecture-drift",
    displayName: "SEIS Architecture Drift",
    description: "Detect local source-boundary drift between the Command Center application and AI Core metadata.",
    category: "Architecture",
    capabilities: ["Source boundary audit", "Canonical ownership check", "Drift report"],
    checks: [
      contains("apps/seis-core/data/seis-core-plugin-sources.json", "No personal plugin source", "core source prohibition"),
      contains("content/development/seis-ai-core-plugin-registry.json", "canonical-source-of-truth", "canonical repository ownership"),
      contains("docs/ARCHITECTURE.md", "approval gates", "architecture safety rule"),
    ],
  },
  {
    id: "seis-contract-compatibility",
    displayName: "SEIS Contract Compatibility",
    description: "Compare release, source inventory, catalog, and status matrix contracts for compatibility.",
    category: "Engineering",
    capabilities: ["Release contract check", "Generated artifact comparison", "Compatibility report"],
    checks: [
      releaseConsistency("release/source/catalog/matrix labels"),
      exists("apps/seis-core/data/seis-core-plugin-catalog.json", "application catalog"),
      exists("content/development/seis-core-plugin-matrix.json", "status matrix"),
    ],
  },
  {
    id: "seis-cost-latency-budget",
    displayName: "SEIS Cost and Latency Budget",
    description: "Verify that routing metadata keeps cost and latency considerations visible without calling providers.",
    category: "AI Core",
    capabilities: ["Cost metadata audit", "Latency metadata audit", "Provider-free report"],
    checks: [
      contains("content/development/seis-ai-core-plugin-registry.json", "latency", "latency metadata"),
      contains("content/development/seis-ai-core-plugin-registry.json", "cost", "cost metadata"),
      contains("apps/seis-core/script.js", "cost", "Command Center cost signal"),
    ],
  },
  {
    id: "seis-data-retention-audit",
    displayName: "SEIS Data Retention Audit",
    description: "Review data-contract and privacy documentation presence without reading private data or mutating schemas.",
    category: "Data and Privacy",
    capabilities: ["Schema registry audit", "Privacy boundary check", "Retention handoff"],
    checks: [
      exists("content/development/seis-data-schema-registry.json", "data schema registry"),
      contains("docs/data/schema-registry.md", "schema", "schema ownership documentation"),
      contains("docs/SECURITY.md", "Permission Boundaries", "privacy and permission boundary documentation"),
    ],
  },
  {
    id: "seis-offline-mode-check",
    displayName: "SEIS Offline Mode Check",
    description: "Confirm local-first and offline-safe surfaces remain explicit before any provider-backed activation.",
    category: "Reliability",
    capabilities: ["Offline posture audit", "Local fallback check", "Degraded-state report"],
    checks: [
      contains("docs/ai/installed-ai-collaboration-protocol.md", "offline", "offline operating mode"),
      contains("apps/seis-core/search-center.js", "localStorage", "browser-local persistence"),
      contains("apps/seis-core/script.js", "Local Models", "local model lane"),
    ],
  },
  {
    id: "seis-prompt-injection-audit",
    displayName: "SEIS Prompt Injection Audit",
    description: "Check that prompt safety documentation and approval boundaries remain present without executing untrusted content.",
    category: "AI Safety",
    capabilities: ["Prompt safety evidence", "Untrusted-content boundary", "Injection audit"],
    checks: [
      contains("docs/ai/prompt-engine.md", "prompt injection", "prompt injection control"),
      contains("content/development/seis-ai-core-agent-permission-matrix.json", "approvalRequired", "agent approval boundary"),
      contains("docs/SECURITY.md", "read-only", "read-only security default"),
    ],
  },
  {
    id: "seis-rollback-readiness",
    displayName: "SEIS Rollback Readiness",
    description: "Verify that release and operational surfaces retain a documented rollback path before handoff.",
    category: "Release",
    capabilities: ["Rollback evidence", "Release train audit", "Recovery handoff"],
    checks: [
      exists("docs/ROLLBACK.md", "rollback runbook"),
      contains("docs/ROLLBACK.md", "approval", "rollback approval boundary"),
      contains("apps/seis-core/data/seis-core-plugin-release-readiness.json", "\"decision\":", "release decision state"),
    ],
  },
  {
    id: "seis-tool-permission-audit",
    displayName: "SEIS Tool Permission Audit",
    description: "Audit tool, plugin, and agent permission defaults without enabling external writes.",
    category: "Security",
    capabilities: ["Permission matrix", "Deny-by-default review", "Tool scope report"],
    checks: [
      contains("content/development/seis-ai-core-agent-permission-matrix.json", "approvalRequired", "agent permission matrix"),
      contains("apps/seis-core/data/seis-core-plugin-sources.json", '"write": []', "app write deny default"),
      contains("content/development/seis-ai-core-plugin-registry.json", '"network": []', "registry network deny default"),
    ],
  },
  {
    id: "seis-goal-dependency-map",
    displayName: "SEIS Goal Dependency Map",
    description: "Summarize goal, evidence, and architecture dependencies before a plugin or release handoff.",
    category: "Planning",
    capabilities: ["Goal dependency review", "Evidence linkage", "Handoff map"],
    checks: [
      exists("content/development/seis-goal-tracking.json", "goal tracking registry"),
      contains("content/development/seis-agent-plugin-integration.json", "qualityCommands", "integration quality dependencies"),
      contains("docs/ARCHITECTURE.md", "dependency", "architecture dependency guidance"),
    ],
  },
]);

export function getPluginAuditDefinition(pluginId) {
  return PLUGIN_AUDIT_DEFINITIONS.find((definition) => definition.id === pluginId) || null;
}

function exists(path, label) {
  return { id: path.replaceAll("/", "-"), kind: "exists", path, label };
}

function contains(path, needle, label) {
  return { id: `${path.replaceAll("/", "-")}-${needle}`, kind: "contains", path, needle, label };
}

function releaseConsistency(label) {
  return { id: "release-consistency", kind: "release-consistency", label };
}
