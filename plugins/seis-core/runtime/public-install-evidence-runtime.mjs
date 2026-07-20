import fs from "node:fs";
import path from "node:path";

export const INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH = "content/development/seis-public-plugin-independent-runner-evidence-contract.json";
export const DEFAULT_INDEPENDENT_RUNNER_EVIDENCE_PATH = "content/development/seis-public-plugin-independent-runner-evidence.json";

const secretPatterns = [
  /(^|[^A-Za-z0-9_])sk-[A-Za-z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /ghp_[A-Za-z0-9_]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /BEGIN (RSA|OPENSSH|PRIVATE) KEY/,
];

export function inspectIndependentRunnerEvidence(repoRoot, options = {}) {
  const contractPath = options.contractPath || INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH;
  const resolvedContractPath = resolveInputPath(repoRoot, contractPath);
  const contract = readJson(resolvedContractPath);
  if (!contract) {
    return {
      ok: false,
      status: "missing-evidence-contract",
      evidenceRecorded: false,
      evidenceValid: false,
      evidencePath: null,
      failures: ["independent-runner evidence contract is missing or invalid"],
    };
  }

  const configuredInput = options.inputPath || process.env.SEIS_INDEPENDENT_RUNNER_EVIDENCE_PATH || contract.evidencePath || DEFAULT_INDEPENDENT_RUNNER_EVIDENCE_PATH;
  const evidencePath = resolveInputPath(repoRoot, configuredInput);
  const requireRecorded = options.requireRecorded === true;

  if (!fs.existsSync(evidencePath)) {
    return {
      ok: !requireRecorded,
      status: "not-recorded",
      evidenceRecorded: false,
      evidenceValid: false,
      evidencePath: displayPath(repoRoot, evidencePath),
      expectedPluginCount: contract.expectedPluginIds?.length || 0,
      expectedEmbeddedModuleCount: contract.expectedEmbeddedModuleIds?.length || 0,
      failures: requireRecorded ? ["independent-runner evidence record has not been supplied"] : [],
      blockers: ["Independent clean-runner or public package installation proof has not been recorded."],
    };
  }

  const stat = fs.statSync(evidencePath);
  if (!stat.isFile() || stat.size > 512 * 1024) {
    return {
      ok: false,
      status: "invalid-independent-runner-evidence",
      evidenceRecorded: true,
      evidenceValid: false,
      evidencePath: displayPath(repoRoot, evidencePath),
      expectedPluginCount: contract.expectedPluginIds?.length || 0,
      expectedEmbeddedModuleCount: contract.expectedEmbeddedModuleIds?.length || 0,
      failures: ["independent-runner evidence must be a JSON file no larger than 512 KiB"],
      blockers: ["Independent clean-runner evidence exists but does not meet the evidence intake contract."],
    };
  }

  const raw = fs.readFileSync(evidencePath, "utf8");
  const evidence = parseJson(raw);
  const failures = validateEvidence(evidence, contract, raw);
  return {
    ok: failures.length === 0,
    status: failures.length === 0 ? "recorded-independent-clean-runner-evidence" : "invalid-independent-runner-evidence",
    evidenceRecorded: true,
    evidenceValid: failures.length === 0,
    evidencePath: displayPath(repoRoot, evidencePath),
    expectedPluginCount: contract.expectedPluginIds?.length || 0,
    expectedEmbeddedModuleCount: contract.expectedEmbeddedModuleIds?.length || 0,
    runner: summarizeRunner(evidence),
    installation: summarizeInstallation(evidence),
    mcpSmoke: summarizeMcpSmoke(evidence),
    freshTask: summarizeFreshTask(evidence),
    failures,
    blockers: failures.length ? ["Independent clean-runner evidence exists but does not meet the evidence intake contract."] : [],
  };
}

export function buildIndependentRunnerEvidenceTemplate(repoRoot) {
  const contract = readJson(resolveInputPath(repoRoot, INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH));
  return contract?.submissionTemplate || null;
}

function validateEvidence(evidence, contract, raw) {
  const failures = [];
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return ["independent-runner evidence must be a JSON object"];
  }
  const rawSecretPattern = secretPatterns.some((pattern) => pattern.test(raw));
  if (rawSecretPattern) failures.push("evidence contains a high-confidence secret-like pattern");
  if (containsPrivatePath(raw)) failures.push("evidence contains a private filesystem path");

  requireExactKeys(evidence, ["id", "version", "status", "recordedAt", "publicReleaseAllowed", "source", "runner", "installation", "mcpSmoke", "freshTask", "redaction", "attestation"], "root", failures);
  if (evidence.id !== "seis-public-plugin-independent-runner-evidence") failures.push("evidence id is invalid");
  if (evidence.version !== 1) failures.push("evidence version must be 1");
  if (evidence.status !== "recorded-independent-clean-runner-evidence") failures.push("evidence status must record independent runner evidence");
  if (!isIsoDate(evidence.recordedAt)) failures.push("recordedAt must be an ISO-8601 UTC timestamp");
  if (evidence.publicReleaseAllowed !== false) failures.push("evidence must not independently allow public release");

  validateSource(evidence.source, failures);
  validateRunner(evidence.runner, failures);
  validateInstallation(evidence.installation, contract.expectedPluginIds || [], contract.expectedEmbeddedModuleIds || [], failures);
  validateMcpSmoke(evidence.mcpSmoke, contract.expectedPluginIds?.length || 0, failures);
  validateFreshTask(evidence.freshTask, contract.expectedPluginIds?.length || 0, contract.expectedEmbeddedModuleIds?.length || 0, failures);
  validateRedaction(evidence.redaction, failures);
  validateAttestation(evidence.attestation, failures);
  return failures;
}

function validateSource(value, failures) {
  requireExactKeys(value, ["marketplaceName", "artifactKind", "immutableRevision"], "source", failures);
  if (value?.marketplaceName !== "seis-repo") failures.push("source marketplaceName must be seis-repo");
  if (value?.artifactKind !== "public-marketplace-or-package") failures.push("source artifactKind is invalid");
  if (!isSafeRevision(value?.immutableRevision)) failures.push("source immutableRevision must be a sanitized public revision identifier");
}

function validateRunner(value, failures) {
  requireExactKeys(value, ["classification", "sourceWorktreeAccessible", "existingCodexCacheAccessible", "os", "architecture", "nodeMajor", "codexVersion"], "runner", failures);
  if (value?.classification !== "independent-clean-runner") failures.push("runner classification must be independent-clean-runner");
  if (value?.sourceWorktreeAccessible !== false) failures.push("runner must not have access to the source worktree");
  if (value?.existingCodexCacheAccessible !== false) failures.push("runner must not have access to the existing Codex cache");
  if (!isSafeLabel(value?.os)) failures.push("runner os must be sanitized metadata");
  if (!isSafeLabel(value?.architecture)) failures.push("runner architecture must be sanitized metadata");
  if (!Number.isInteger(value?.nodeMajor) || value.nodeMajor < 18 || value.nodeMajor > 99) failures.push("runner nodeMajor must be a supported integer");
  if (!isSafeVersion(value?.codexVersion)) failures.push("runner codexVersion must be sanitized metadata");
}

function validateInstallation(value, expectedPluginIds, expectedEmbeddedModuleIds, failures) {
  requireExactKeys(value, ["expectedPluginIds", "installedPluginIds", "installedCount", "expectedEmbeddedModuleIds", "observedEmbeddedModuleIds", "embeddedModuleCount", "publicSourceInstalled"], "installation", failures);
  if (!sameStringSet(value?.expectedPluginIds, expectedPluginIds)) failures.push("installation expectedPluginIds do not match the public plugin family");
  if (!sameStringSet(value?.installedPluginIds, expectedPluginIds)) failures.push("installation installedPluginIds do not match the public plugin family");
  if (value?.installedCount !== expectedPluginIds.length) failures.push("installation installedCount does not match the public plugin family");
  if (!sameStringSet(value?.expectedEmbeddedModuleIds, expectedEmbeddedModuleIds)) failures.push("installation expectedEmbeddedModuleIds do not match the embedded module contract");
  if (!sameStringSet(value?.observedEmbeddedModuleIds, expectedEmbeddedModuleIds)) failures.push("installation observedEmbeddedModuleIds do not match the embedded module contract");
  if (value?.embeddedModuleCount !== expectedEmbeddedModuleIds.length) failures.push("installation embeddedModuleCount does not match the embedded module contract");
  if (value?.publicSourceInstalled !== true) failures.push("installation must attest public source installation");
}

function validateMcpSmoke(value, expectedPluginCount, failures) {
  requireExactKeys(value, ["pluginCount", "initializedCount", "toolsListCount", "representativeCallCount", "allPassed"], "mcpSmoke", failures);
  for (const field of ["pluginCount", "initializedCount", "toolsListCount", "representativeCallCount"]) {
    if (value?.[field] !== expectedPluginCount) failures.push(`mcpSmoke ${field} must equal ${expectedPluginCount}`);
  }
  if (value?.allPassed !== true) failures.push("mcpSmoke allPassed must be true");
}

function validateFreshTask(value, expectedPluginCount, expectedEmbeddedModuleCount, failures) {
  requireExactKeys(value, ["observedAfterInstall", "taskReference", "seisAiPublicPluginFamily"], "freshTask", failures);
  if (value?.observedAfterInstall !== true) failures.push("freshTask must be observed after installation");
  if (!isSafeTaskReference(value?.taskReference)) failures.push("freshTask taskReference must be sanitized");
  const bridge = value?.seisAiPublicPluginFamily;
  requireExactKeys(bridge, ["publicPluginCount", "connectedPluginCount", "embeddedModuleCount", "connectedModuleCount", "runtimeConnected"], "freshTask.seisAiPublicPluginFamily", failures);
  if (bridge?.publicPluginCount !== expectedPluginCount) failures.push("fresh task publicPluginCount does not match the public plugin family");
  if (bridge?.connectedPluginCount !== expectedPluginCount) failures.push("fresh task connectedPluginCount does not match the public plugin family");
  if (bridge?.embeddedModuleCount !== expectedEmbeddedModuleCount) failures.push("fresh task embeddedModuleCount does not match the embedded module contract");
  if (bridge?.connectedModuleCount !== expectedEmbeddedModuleCount) failures.push("fresh task connectedModuleCount does not match the embedded module contract");
  if (bridge?.runtimeConnected !== true) failures.push("fresh task runtimeConnected must be true");
}

function validateRedaction(value, failures) {
  requireExactKeys(value, ["rawCommandOutputIncluded", "secretsIncluded", "privatePathsIncluded"], "redaction", failures);
  if (value?.rawCommandOutputIncluded !== false) failures.push("raw command output must not be included");
  if (value?.secretsIncluded !== false) failures.push("secrets must not be included");
  if (value?.privatePathsIncluded !== false) failures.push("private paths must not be included");
}

function validateAttestation(value, failures) {
  requireExactKeys(value, ["evidenceSource", "operatorRole"], "attestation", failures);
  if (value?.evidenceSource !== "external-runner") failures.push("attestation evidenceSource must be external-runner");
  if (!["maintainer", "reviewer", "automation"].includes(value?.operatorRole)) failures.push("attestation operatorRole must be maintainer, reviewer, or automation");
}

function requireExactKeys(value, expectedKeys, label, failures) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    failures.push(`${label} must be an object`);
    return;
  }
  const actualKeys = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (actualKeys.length !== expected.length || actualKeys.some((key, index) => key !== expected[index])) {
    failures.push(`${label} must contain only the documented fields`);
  }
}

function sameStringSet(actual, expected) {
  if (!Array.isArray(actual) || actual.length !== expected.length) return false;
  return actual.every((value) => typeof value === "string") && new Set(actual).size === actual.length && actual.every((value) => expected.includes(value));
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isSafeRevision(value) {
  return typeof value === "string" && value.length >= 7 && value.length <= 160 && /^[A-Za-z0-9._@/+:-]+$/.test(value);
}

function isSafeLabel(value) {
  return typeof value === "string" && value.length >= 1 && value.length <= 80 && /^[A-Za-z0-9 ._+-]+$/.test(value);
}

function isSafeVersion(value) {
  return typeof value === "string" && value.length >= 1 && value.length <= 80 && /^[A-Za-z0-9._+-]+$/.test(value);
}

function isSafeTaskReference(value) {
  return typeof value === "string" && value.length >= 4 && value.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(value);
}

function containsPrivatePath(raw) {
  return /(?:^|["'\s])(?:\/Users\/|\/home\/|[A-Za-z]:\\|~\/)/.test(raw);
}

function summarizeRunner(evidence) {
  if (!evidence?.runner) return null;
  return {
    classification: evidence.runner.classification,
    sourceWorktreeAccessible: evidence.runner.sourceWorktreeAccessible,
    existingCodexCacheAccessible: evidence.runner.existingCodexCacheAccessible,
    os: evidence.runner.os,
    architecture: evidence.runner.architecture,
    nodeMajor: evidence.runner.nodeMajor,
    codexVersion: evidence.runner.codexVersion,
  };
}

function summarizeInstallation(evidence) {
  if (!evidence?.installation) return null;
  return {
    installedCount: evidence.installation.installedCount,
    embeddedModuleCount: evidence.installation.embeddedModuleCount,
    publicSourceInstalled: evidence.installation.publicSourceInstalled,
  };
}

function summarizeMcpSmoke(evidence) {
  if (!evidence?.mcpSmoke) return null;
  return {
    pluginCount: evidence.mcpSmoke.pluginCount,
    initializedCount: evidence.mcpSmoke.initializedCount,
    toolsListCount: evidence.mcpSmoke.toolsListCount,
    representativeCallCount: evidence.mcpSmoke.representativeCallCount,
    allPassed: evidence.mcpSmoke.allPassed,
  };
}

function summarizeFreshTask(evidence) {
  if (!evidence?.freshTask) return null;
  return {
    observedAfterInstall: evidence.freshTask.observedAfterInstall,
    seisAiPublicPluginFamily: evidence.freshTask.seisAiPublicPluginFamily,
  };
}

function resolveInputPath(repoRoot, inputPath) {
  return path.isAbsolute(inputPath) ? path.resolve(inputPath) : path.resolve(repoRoot, inputPath);
}

function displayPath(repoRoot, absolutePath) {
  const relative = path.relative(repoRoot, absolutePath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative) ? relative.split(path.sep).join("/") : "external-input";
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
