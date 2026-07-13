#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const paths = {
  agents: "AGENTS.md",
  workforce: "SEIS_AGENT_WORKFORCE.md",
  subAgents: "SEIS_SUB_AGENTS.md",
  registryDoc: "docs/AGENT_REGISTRY.md",
  registry: "content/development/seis-agent-registry.json",
  packageJson: "package.json",
  laneStatus: "content/development/seis-agent-lane-status.json",
  secondBrain: "content/development/seis-second-brain-system.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json"
};

const expectedCounts = {
  detailedLaneStatusRecords: 14,
  secondBrainManagedLanes: 9,
  secondBrainAgentRoles: 13,
  personalExecutablePlanningLanes: 5,
  routerLanes: 10
};

const registryGateCommands = [
  "npm run check:seis-agent-registry",
  "node --check scripts/check-seis-agent-registry.mjs",
  "node scripts/check-seis-agent-registry.mjs",
  "jq empty content/development/seis-agent-registry.json",
  "git diff --check"
];

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(relativePath, label);
}

const registry = readJson(paths.registry, "agent registry");
const laneStatus = readJson(paths.laneStatus, "agent lane status source");
const secondBrain = readJson(paths.secondBrain, "Second Brain source");
const pluginIntegration = readJson(paths.pluginIntegration, "agent plugin integration source");
const workforceDoc = readText(paths.workforce, "workforce policy");
const registryDoc = readText(paths.registryDoc, "agent registry documentation");
const subAgentsDoc = readText(paths.subAgents, "sub-agent documentation");
const packageJson = readJson(paths.packageJson, "package.json");

validateRegistryShape(registry);
validateAuthority(registry, laneStatus, secondBrain, pluginIntegration);
validateInventories(registry, laneStatus, secondBrain, pluginIntegration);
validateBoundaries(registry);
validateQualityGates(registry, laneStatus, secondBrain, pluginIntegration);
validatePublicSafety(registry);
validateDocumentation(registryDoc, subAgentsDoc, workforceDoc);
ensure(
  packageJson?.scripts?.["check:seis-agent-registry"] === "node scripts/check-seis-agent-registry.mjs",
  "package.json must expose check:seis-agent-registry"
);

if (failures.length > 0) {
  console.error("SEIS agent registry check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "SEIS agent registry check passed: 14 detailed lanes, 9 Second Brain managed lanes, "
    + "13 Second Brain agent roles, 5 personal planning lanes, and 10 router lanes."
);

function validateRegistryShape(value) {
  ensureObject(value, "registry");
  ensureExactKeys(value, [
    "schemaVersion",
    "id",
    "status",
    "purpose",
    "truthBoundary",
    "authority",
    "counts",
    "inventories",
    "runtimeBoundary",
    "approvalBoundary",
    "qualityGates"
  ], "registry");
  ensure(value?.schemaVersion === "1.0.0", "registry schemaVersion must be 1.0.0");
  ensure(value?.id === "seis-agent-registry", "registry id must be seis-agent-registry");
  ensure(value?.status === "active-public-safe", "registry status must be active-public-safe");
  ensureNonEmptyString(value?.purpose, "registry purpose");

  ensureExactKeys(value?.truthBoundary, [
    "classification",
    "sourceBacked",
    "sourceParityRequired",
    "inventoriesAreIndependent",
    "nineManagedLanesToThirteenAgentRolesMappingDeclared",
    "inferredCrossInventoryMappingAllowed",
    "excludedContent"
  ], "truthBoundary");
  ensure(value?.truthBoundary?.classification === "public-safe", "truthBoundary must be public-safe");
  ensure(value?.truthBoundary?.sourceBacked === true, "truthBoundary must be source-backed");
  ensure(value?.truthBoundary?.sourceParityRequired === true, "truthBoundary must require source parity");
  ensure(value?.truthBoundary?.inventoriesAreIndependent === true, "inventories must be explicitly independent");
  ensure(
    value?.truthBoundary?.nineManagedLanesToThirteenAgentRolesMappingDeclared === false,
    "registry must not declare a 9-lane-to-13-agent mapping"
  );
  ensure(
    value?.truthBoundary?.inferredCrossInventoryMappingAllowed === false,
    "registry must forbid inferred cross-inventory mappings"
  );
  ensureUniqueStrings(value?.truthBoundary?.excludedContent, "truthBoundary.excludedContent");

  ensureExactKeys(value?.authority, [
    "globalGovernance",
    "canonicalMachineReadableRegistry",
    "humanReadableWorkforcePolicy",
    "sourceContracts",
    "preferenceRules"
  ], "authority");
  ensureExactKeys(value?.counts, Object.keys(expectedCounts), "counts");
  ensureExactKeys(value?.inventories, Object.keys(expectedCounts), "inventories");

  const inventoryShapes = {
    detailedLaneStatusRecords: ["scope", "sourcePath", "sourcePointer", "count", "records"],
    secondBrainManagedLanes: ["scope", "sourcePath", "sourcePointer", "count", "records"],
    secondBrainAgentRoles: ["scope", "sourcePath", "sourcePointer", "count", "records"],
    personalExecutablePlanningLanes: ["scope", "runtimeMode", "sourcePath", "sourcePointer", "count", "records"],
    routerLanes: ["scope", "runtimeMode", "sourcePath", "sourcePointer", "count", "records"]
  };
  for (const [key, expectedKeys] of Object.entries(inventoryShapes)) {
    ensureExactKeys(value?.inventories?.[key], expectedKeys, `inventories.${key}`);
    ensureNonEmptyString(value?.inventories?.[key]?.scope, `inventories.${key}.scope`);
    ensure(Array.isArray(value?.inventories?.[key]?.records), `inventories.${key}.records must be an array`);
  }

  ensureExactKeys(value?.runtimeBoundary, [
    "mode",
    "singleWriter",
    "currentWriter",
    "reviewerDefault",
    "registryGrantsPermissions",
    "liveCapabilities"
  ], "runtimeBoundary");
  ensureExactKeys(value?.approvalBoundary, [
    "humanApprovalRequired",
    "agentsMaySelfApprove",
    "implicitApprovalAllowed",
    "defaultWithoutApproval",
    "requiredFor"
  ], "approvalBoundary");
  ensureExactKeys(value?.qualityGates, ["registry", "sourceContracts"], "qualityGates");
}

function validateAuthority(value, laneStatus, secondBrain, pluginIntegration) {
  ensureExactKeys(value?.authority?.globalGovernance, ["path", "role"], "authority.globalGovernance");
  ensure(value?.authority?.globalGovernance?.path === paths.agents, "AGENTS.md must be the global governance source");
  ensure(
    value?.authority?.globalGovernance?.role === "highest-repository-governance",
    "global governance role mismatch"
  );

  ensureExactKeys(
    value?.authority?.canonicalMachineReadableRegistry,
    ["path", "role"],
    "authority.canonicalMachineReadableRegistry"
  );
  ensure(
    value?.authority?.canonicalMachineReadableRegistry?.path === paths.registry,
    "canonical machine-readable registry path mismatch"
  );
  ensure(
    value?.authority?.canonicalMachineReadableRegistry?.role === "canonical-machine-readable-agent-registry",
    "canonical machine-readable registry role mismatch"
  );

  ensureExactKeys(
    value?.authority?.humanReadableWorkforcePolicy,
    ["path", "role"],
    "authority.humanReadableWorkforcePolicy"
  );
  ensure(
    value?.authority?.humanReadableWorkforcePolicy?.path === paths.workforce,
    "human-readable workforce policy path mismatch"
  );
  ensure(
    value?.authority?.humanReadableWorkforcePolicy?.role === "human-readable-workforce-policy",
    "human-readable workforce policy role mismatch"
  );

  const expectedSources = [
    {
      id: laneStatus?.id,
      path: paths.laneStatus,
      status: laneStatus?.status,
      authorityScope: "detailed-lane-status-records",
      jsonPointers: ["/lanes", "/qualityGate"]
    },
    {
      id: secondBrain?.id,
      path: paths.secondBrain,
      status: secondBrain?.status,
      authorityScope: "second-brain-managed-lanes-agent-roles-and-safety-boundary",
      jsonPointers: ["/managedSubAgentLanes", "/autonomousAgentRoster", "/securityBoundary", "/qualityGate"]
    },
    {
      id: pluginIntegration?.id,
      path: paths.pluginIntegration,
      status: pluginIntegration?.status,
      authorityScope: "personal-executable-planning-lanes-and-router-lanes",
      jsonPointers: ["/personalPlugins", "/lanes", "/activationPolicy", "/qualityCommands"]
    }
  ];
  ensure(
    isDeepStrictEqual(value?.authority?.sourceContracts, expectedSources),
    "authority.sourceContracts must exactly match the three scoped source contracts"
  );

  const rules = value?.authority?.preferenceRules;
  ensure(Array.isArray(rules), "authority.preferenceRules must be an array");
  ensure((rules || []).length === 6, "authority.preferenceRules must contain six ordered rules");
  ensureUniqueRecords(rules, "id", "authority.preferenceRules");
  ensureUniqueRecords(rules, "priority", "authority.preferenceRules priorities");
  ensure(
    isDeepStrictEqual((rules || []).map((rule) => rule.priority), [1, 2, 3, 4, 5, 6]),
    "authority.preferenceRules priorities must be ordered 1 through 6"
  );
  for (const [index, rule] of (rules || []).entries()) {
    ensureExactKeys(rule, ["priority", "id", "rule"], `authority.preferenceRules[${index}]`);
    ensureNonEmptyString(rule?.id, `authority.preferenceRules[${index}].id`);
    ensureNonEmptyString(rule?.rule, `authority.preferenceRules[${index}].rule`);
  }
}

function validateInventories(value, laneStatus, secondBrain, pluginIntegration) {
  const definitions = [
    {
      key: "detailedLaneStatusRecords",
      sourcePath: paths.laneStatus,
      sourcePointer: "/lanes",
      sourceRecords: laneStatus?.lanes,
      idField: "id"
    },
    {
      key: "secondBrainManagedLanes",
      sourcePath: paths.secondBrain,
      sourcePointer: "/managedSubAgentLanes",
      sourceRecords: secondBrain?.managedSubAgentLanes,
      idField: null
    },
    {
      key: "secondBrainAgentRoles",
      sourcePath: paths.secondBrain,
      sourcePointer: "/autonomousAgentRoster",
      sourceRecords: secondBrain?.autonomousAgentRoster,
      idField: "agent"
    },
    {
      key: "personalExecutablePlanningLanes",
      sourcePath: paths.pluginIntegration,
      sourcePointer: "/personalPlugins",
      sourceRecords: pluginIntegration?.personalPlugins,
      idField: "id",
      runtimeMode: "status-and-plan-only"
    },
    {
      key: "routerLanes",
      sourcePath: paths.pluginIntegration,
      sourcePointer: "/lanes",
      sourceRecords: pluginIntegration?.lanes,
      idField: "id",
      runtimeMode: "status-and-plan-only"
    }
  ];

  for (const definition of definitions) {
    const inventory = value?.inventories?.[definition.key];
    const sourceRecords = definition.sourceRecords;
    ensure(Array.isArray(sourceRecords), `${definition.key} source records must be an array`);
    ensure(
      (sourceRecords || []).length === expectedCounts[definition.key],
      `${definition.key} source count must be exactly ${expectedCounts[definition.key]}`
    );
    ensure(
      value?.counts?.[definition.key] === expectedCounts[definition.key],
      `counts.${definition.key} must be exactly ${expectedCounts[definition.key]}`
    );
    ensure(inventory?.sourcePath === definition.sourcePath, `${definition.key} sourcePath mismatch`);
    ensure(inventory?.sourcePointer === definition.sourcePointer, `${definition.key} sourcePointer mismatch`);
    ensure(inventory?.count === expectedCounts[definition.key], `${definition.key} inventory count mismatch`);
    ensure(
      (inventory?.records || []).length === expectedCounts[definition.key],
      `${definition.key} record count mismatch`
    );
    ensure(
      isDeepStrictEqual(inventory?.records, sourceRecords),
      `${definition.key} records must preserve exact source parity`
    );
    if (definition.runtimeMode) {
      ensure(inventory?.runtimeMode === definition.runtimeMode, `${definition.key} runtimeMode mismatch`);
    }

    if (definition.idField) {
      const registryIds = (inventory?.records || []).map((record) => record?.[definition.idField]);
      const sourceIds = (sourceRecords || []).map((record) => record?.[definition.idField]);
      ensure(
        isDeepStrictEqual(registryIds, sourceIds),
        `${definition.key} IDs must exactly match source IDs and order`
      );
      ensureUniqueRecords(inventory?.records, definition.idField, `${definition.key} records`);
    } else {
      ensureUniqueStrings(inventory?.records, `${definition.key} records`);
    }
  }

  ensure(
    !Object.hasOwn(value?.inventories?.secondBrainManagedLanes || {}, "agentRoleMapping"),
    "Second Brain managed lanes must not contain an agent-role mapping"
  );
  ensure(
    !Object.hasOwn(value?.inventories?.secondBrainAgentRoles || {}, "managedLaneMapping"),
    "Second Brain agent roles must not contain a managed-lane mapping"
  );
}

function validateBoundaries(value) {
  ensure(value?.runtimeBoundary?.mode === "single-writer-supervised-status-and-plan-only", "runtime mode mismatch");
  ensure(value?.runtimeBoundary?.singleWriter === true, "runtimeBoundary must enforce a single writer");
  ensure(value?.runtimeBoundary?.currentWriter === "Codex", "runtimeBoundary current writer must be Codex");
  ensure(value?.runtimeBoundary?.reviewerDefault === "read-only-or-plan-only", "reviewer default must be read-only or plan-only");
  ensure(value?.runtimeBoundary?.registryGrantsPermissions === false, "registry must not grant permissions");

  const expectedLiveCapabilityKeys = [
    "storesSecrets",
    "secretAccess",
    "credentialAccess",
    "providerCalls",
    "providerAuthentication",
    "sshExecution",
    "deployment",
    "githubMutation",
    "externalConnectorMutation",
    "autonomousWriteExecution",
    "backgroundRunner",
    "privateContentAccess",
    "promptBodiesStored"
  ];
  ensureExactKeys(value?.runtimeBoundary?.liveCapabilities, expectedLiveCapabilityKeys, "runtimeBoundary.liveCapabilities");
  for (const capability of expectedLiveCapabilityKeys) {
    ensure(
      value?.runtimeBoundary?.liveCapabilities?.[capability] === false,
      `runtimeBoundary.liveCapabilities.${capability} must be false`
    );
  }

  ensure(value?.approvalBoundary?.humanApprovalRequired === true, "human approval must be required");
  ensure(value?.approvalBoundary?.agentsMaySelfApprove === false, "agents must not self-approve");
  ensure(value?.approvalBoundary?.implicitApprovalAllowed === false, "implicit approval must be forbidden");
  ensure(value?.approvalBoundary?.defaultWithoutApproval === "blocked", "actions without approval must be blocked");
  ensureUniqueStrings(value?.approvalBoundary?.requiredFor, "approvalBoundary.requiredFor");
  const approvalText = (value?.approvalBoundary?.requiredFor || []).join(" ").toLowerCase();
  for (const requiredTerm of ["destructive", "provider", "ssh", "deployment", "github", "write-gated"]) {
    ensure(approvalText.includes(requiredTerm), `approvalBoundary.requiredFor must cover ${requiredTerm}`);
  }
}

function validateQualityGates(value, laneStatus, secondBrain, pluginIntegration) {
  ensure(
    isDeepStrictEqual(value?.qualityGates?.registry, registryGateCommands),
    "qualityGates.registry must contain the deterministic registry validation commands"
  );

  const expectedSourceGates = [
    {
      sourcePath: paths.laneStatus,
      commands: [laneStatus?.qualityGate]
    },
    {
      sourcePath: paths.secondBrain,
      commands: [secondBrain?.qualityGate]
    },
    {
      sourcePath: paths.pluginIntegration,
      commands: pluginIntegration?.qualityCommands
    }
  ];
  ensure(
    isDeepStrictEqual(value?.qualityGates?.sourceContracts, expectedSourceGates),
    "qualityGates.sourceContracts must preserve exact source command parity"
  );
  ensureUniqueRecords(value?.qualityGates?.sourceContracts, "sourcePath", "qualityGates.sourceContracts");
}

function validatePublicSafety(value) {
  const expectedExclusions = [
    "local app inventory",
    "absolute vault paths",
    "credentials or secrets",
    "provider authentication state",
    "prompt bodies",
    "private content"
  ];
  ensure(
    isDeepStrictEqual(value?.truthBoundary?.excludedContent, expectedExclusions),
    "truthBoundary.excludedContent must preserve the public-safe exclusion list"
  );

  for (const entry of collectEntries(value)) {
    if (typeof entry.value !== "string") continue;
    ensure(
      !/(^|\s)(\/Users\/|\/home\/|\/private\/|\/Volumes\/|[A-Za-z]:\\)/.test(entry.value),
      `${entry.path} must not contain an absolute local path`
    );
    ensure(
      !/(\bsk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(entry.value),
      `${entry.path} appears to contain secret material`
    );
  }
}

function validateDocumentation(registryMarkdown, subAgentsMarkdown, workforceMarkdown) {
  const canonicalStatement = "`content/development/seis-agent-registry.json` is the canonical machine-readable agent registry.";
  const workforceStatement = "`SEIS_AGENT_WORKFORCE.md` remains the human-readable workforce policy.";

  for (const [label, markdown] of [
    [paths.registryDoc, registryMarkdown],
    [paths.subAgents, subAgentsMarkdown]
  ]) {
    ensure(markdown.includes(canonicalStatement), `${label} must identify the canonical machine-readable registry`);
    ensure(markdown.includes(workforceStatement), `${label} must preserve the human-readable workforce policy`);
    ensure(markdown.includes("AGENTS.md"), `${label} must identify AGENTS.md as global governance`);
  }

  ensure(workforceMarkdown.includes("# SEIS Agent Workforce"), "workforce policy heading is missing");
  ensure(
    workforceMarkdown.includes("planning and execution model"),
    "SEIS_AGENT_WORKFORCE.md must remain a human-readable planning and execution policy"
  );
  ensure(
    workforceMarkdown.includes("explicit human approval"),
    "SEIS_AGENT_WORKFORCE.md must preserve explicit human approval"
  );
}

function ensureFile(relativePath, label) {
  const absolutePath = path.join(root, relativePath);
  ensure(fs.existsSync(absolutePath), `${label} source file is missing: ${relativePath}`);
  if (fs.existsSync(absolutePath)) {
    ensure(fs.statSync(absolutePath).isFile(), `${label} must be a file: ${relativePath}`);
  }
}

function readJson(relativePath, label) {
  const text = readText(relativePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return "";
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`Could not read ${label}: ${error.message}`);
    return "";
  }
}

function ensureObject(value, label) {
  ensure(Boolean(value) && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
}

function ensureExactKeys(value, expectedKeys, label) {
  ensureObject(value, label);
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  ensure(isDeepStrictEqual(actualKeys, sortedExpectedKeys), `${label} keys do not match the required shape`);
}

function ensureNonEmptyString(value, label) {
  ensure(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
}

function ensureUniqueRecords(records, key, label) {
  ensure(Array.isArray(records), `${label} must be an array`);
  if (!Array.isArray(records)) return;
  const values = records.map((record) => record?.[key]);
  ensure(values.every((value) => value !== undefined && value !== null && value !== ""), `${label} must define ${key}`);
  ensure(new Set(values).size === values.length, `${label} must contain unique ${key} values`);
}

function ensureUniqueStrings(values, label) {
  ensure(Array.isArray(values), `${label} must be an array`);
  if (!Array.isArray(values)) return;
  ensure(values.every((value) => typeof value === "string" && value.length > 0), `${label} must contain non-empty strings`);
  ensure(new Set(values).size === values.length, `${label} must contain unique values`);
}

function collectEntries(value, currentPath = "registry") {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectEntries(item, `${currentPath}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => collectEntries(item, `${currentPath}.${key}`));
  }
  return [{ path: currentPath, value }];
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
