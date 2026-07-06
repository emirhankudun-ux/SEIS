import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const matrixPath = "content/development/seis-mcp-permission-risk-matrix.json";
const runtimePath = "content/development/seis-ai-core-mcp-runtime-contract.json";
const pluginPath = "content/development/seis-agent-plugin-integration.json";

const requiredSourceFiles = [
  "AGENTS.md",
  "content/development/seis-five-year-agency-orchestration-contract.json",
  runtimePath,
  pluginPath,
  "content/development/seis-installed-ai-tools-registry.json"
];

const requiredRecordIds = [
  "local-stdio-mcp-runtime",
  "repo-backed-resource-reads",
  "repo-backed-check-tools",
  "status-and-plan-tools",
  "prompt-rendering-tools",
  "installed-safe-external-mcp",
  "candidate-mcp-ecosystem-pool",
  "package-runner-mcp",
  "credentialed-provider-mcp",
  "external-mutation-mcp",
  "browser-automation-mcp",
  "ssh-cloud-deploy-mcp"
];

const requiredRecordFields = [
  "id",
  "name",
  "source",
  "officialStatus",
  "purpose",
  "permissions",
  "authentication",
  "secretsRequired",
  "localOrCloud",
  "externalMutationRisk",
  "publicRepoSafety",
  "seisValue",
  "recommendedPriority",
  "riskLevel",
  "allowedMode",
  "requiredEvidence",
  "safeConfigurationNotes"
];

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readText(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function ensureArray(value, message) {
  ensure(Array.isArray(value), message);
  return Array.isArray(value) ? value : [];
}

function ensureIncludesAll(actualValues, expectedValues, label) {
  const actualSet = new Set(actualValues);
  for (const expected of expectedValues) {
    ensure(actualSet.has(expected), `${label} missing ${expected}`);
  }
}

const matrixText = readText(matrixPath);
ensure(!/\/Users\/[A-Za-z0-9._ -]+/.test(matrixText), "Matrix must not contain machine-local /Users paths.");
ensure(!/(^|[\s"'])~\/[A-Za-z0-9._/-]+/m.test(matrixText), "Matrix must not contain home-directory shorthand paths.");
ensure(!/(sk-[A-Za-z0-9_-]{16,}|BEGIN [A-Z ]*PRIVATE KEY)/.test(matrixText), "Matrix must not contain secret-like values.");

const matrix = readJson(matrixPath);
const runtime = readJson(runtimePath);
const plugin = readJson(pluginPath);

if (matrix) {
  ensure(matrix.id === "seis-mcp-permission-risk-matrix", "Matrix id must be stable.");
  ensure(matrix.status === "draft-public-safe", "Matrix status must be draft-public-safe.");
  ensure(matrix.visibility === "public-safe", "Matrix visibility must be public-safe.");

  const sourceFiles = Object.values(matrix.sourceOfTruth ?? {});
  ensureIncludesAll(sourceFiles, requiredSourceFiles, "sourceOfTruth");
  for (const relativePath of requiredSourceFiles) {
    ensure(fs.existsSync(path.join(repoRoot, relativePath)), `Source-of-truth file does not exist: ${relativePath}`);
  }

  ensure(matrix.runtimeSnapshot?.transport === "stdio JSON-RPC", "Runtime transport must remain stdio JSON-RPC.");
  ensure(matrix.runtimeSnapshot?.toolCount === 35, "Runtime snapshot must record 35 tools.");
  ensure(matrix.runtimeSnapshot?.resourceCount === 32, "Runtime snapshot must record 32 resources.");
  ensure(matrix.runtimeSnapshot?.promptCount === 3, "Runtime snapshot must record 3 prompts.");
  ensure(matrix.runtimeSnapshot?.runtimeAuthority === "local-smoke-and-repo-backed-status-only", "Runtime authority must stay local smoke and repo-backed status only.");

  ensure(matrix.activationPolicy?.activationDefault === "official-or-owner-approved-only", "Activation default must require official or owner-approved MCPs.");
  ensure(matrix.activationPolicy?.installedMcpUse === "verified-only", "Installed MCPs must be verified-only.");
  ensure(matrix.activationPolicy?.candidateUse === "document-only-until-reviewed", "Candidate MCPs must remain documentation-only.");
  ensure(matrix.activationPolicy?.packageRunnerDefault === "disabled-or-approval-gated", "Package runners must be disabled or approval-gated.");
  ensure(matrix.activationPolicy?.externalMutationRequiresUserConfirmation === true, "External mutation must require user confirmation.");
  ensure(matrix.activationPolicy?.noBlanketActivation === true, "Blanket activation must be blocked.");
  ensure(matrix.activationPolicy?.noSecretDisclosure === true, "Secret disclosure must be blocked.");
  ensure(matrix.activationPolicy?.credentialStorageAllowed === false, "Credential storage must be blocked.");
  ensure(matrix.activationPolicy?.providerCallsAllowedByDefault === false, "Provider calls must be disabled by default.");

  const riskLevels = ensureArray(matrix.riskLevels, "riskLevels must be an array.").map((level) => level.id);
  ensureIncludesAll(riskLevels, ["low", "medium", "high", "blocked"], "riskLevels");

  const records = ensureArray(matrix.records, "records must be an array.");
  ensure(records.length >= requiredRecordIds.length, "Matrix must include all required MCP risk records.");
  ensureIncludesAll(records.map((record) => record.id), requiredRecordIds, "records");

  for (const record of records) {
    for (const field of requiredRecordFields) {
      ensure(Object.hasOwn(record, field), `Record ${record.id ?? "unknown"} missing ${field}`);
    }
    ensure(Array.isArray(record.permissions) && record.permissions.length > 0, `Record ${record.id} must declare permissions.`);
    ensure(Array.isArray(record.requiredEvidence) && record.requiredEvidence.length > 0, `Record ${record.id} must declare required evidence.`);
    ensure(riskLevels.includes(record.riskLevel), `Record ${record.id} must use a declared risk level.`);
    ensure(typeof record.allowedMode === "string" && record.allowedMode.length > 0, `Record ${record.id} must define allowedMode.`);
    ensure(typeof record.safeConfigurationNotes === "string" && record.safeConfigurationNotes.length > 0, `Record ${record.id} must define safe configuration notes.`);
  }

  const recordsById = new Map(records.map((record) => [record.id, record]));
  ensure(recordsById.get("candidate-mcp-ecosystem-pool")?.allowedMode === "document-only", "Candidate MCP pool must be document-only.");
  ensure(recordsById.get("package-runner-mcp")?.allowedMode === "disabled-or-approval-gated", "Package-runner MCPs must be disabled or approval-gated.");
  ensure(recordsById.get("external-mutation-mcp")?.riskLevel === "blocked", "External mutation MCPs must be blocked by default.");
  ensure(recordsById.get("ssh-cloud-deploy-mcp")?.riskLevel === "blocked", "SSH/cloud/deploy MCPs must be blocked by default.");
  ensure(recordsById.get("credentialed-provider-mcp")?.allowedMode === "metadata-only-until-auth-isolated", "Credentialed provider MCPs must stay metadata-only until auth is isolated.");

  const qualityGates = ensureArray(matrix.qualityGates, "qualityGates must be an array.");
  ensure(qualityGates.length >= 8, "Matrix must include practical quality gates.");
  ensure(qualityGates.some((gate) => gate.includes("No blanket MCP activation")), "Quality gates must block blanket activation.");
  ensure(qualityGates.some((gate) => gate.includes("No secret disclosure")), "Quality gates must block secret disclosure.");
  ensure(qualityGates.some((gate) => gate.includes("External mutation requires owner confirmation")), "Quality gates must require owner confirmation for external mutation.");
}

if (matrix && runtime) {
  ensure(runtime.transport === matrix.runtimeSnapshot.transport, "Runtime transport must match MCP runtime contract.");
  ensure(runtime.toolCount === matrix.runtimeSnapshot.toolCount, "Tool count must match MCP runtime contract.");
  ensure(runtime.resourceCount === matrix.runtimeSnapshot.resourceCount, "Resource count must match MCP runtime contract.");
  ensure(runtime.promptCount === matrix.runtimeSnapshot.promptCount, "Prompt count must match MCP runtime contract.");
  ensure(typeof runtime.boundary === "string" && runtime.boundary.includes("do not call remote MCP servers"), "Runtime boundary must keep remote MCP calls blocked.");
  ensure(typeof runtime.credentialBoundary === "string" && runtime.credentialBoundary.includes("No provider keys"), "Runtime credential boundary must block provider keys.");
}

if (matrix && plugin) {
  ensure(plugin.activationPolicy?.noBlanketActivation === matrix.activationPolicy.noBlanketActivation, "Matrix blanket activation policy must match plugin integration.");
  ensure(plugin.activationPolicy?.noSecretDisclosure === matrix.activationPolicy.noSecretDisclosure, "Matrix secret disclosure policy must match plugin integration.");
  ensure(plugin.activationPolicy?.externalMutationRequiresUserConfirmation === matrix.activationPolicy.externalMutationRequiresUserConfirmation, "Matrix mutation policy must match plugin integration.");
}

if (failures.length > 0) {
  console.error("SEIS MCP permission risk matrix check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS MCP permission risk matrix check passed.");
