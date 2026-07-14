import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const contractPath = "data/seis-goal-tracking-update-prompt.json";
const promptPath = "docs/governance/seis-goal-tracking-update-prompt.md";
const proposalSchemaPath = "schemas/seis-goal-tracking-update.schema.json";
const projectManifestPath = "project.ecosystem.yaml";
const goalRegistryPath = "content/development/seis-goal-tracking.json";
const evidenceLedgerPath = "content/development/seis-goal-evidence.json";
const validationStepsPath = "content/development/seis-goal-validation-steps.json";
const failures = [];

function absolute(relativePath) {
  return resolve(root, relativePath);
}

function requireValue(condition, message) {
  if (!condition) failures.push(message);
}

function read(relativePath) {
  const file = absolute(relativePath);
  if (!existsSync(file)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(relativePath) {
  const text = read(relativePath);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${relativePath} must contain valid JSON: ${error.message}`);
    return {};
  }
}

const contract = readJson(contractPath);
const prompt = read(promptPath);
const proposalSchema = readJson(proposalSchemaPath);
const projectManifest = readJson(projectManifestPath);
const goalRegistry = readJson(goalRegistryPath);
const evidenceLedger = readJson(evidenceLedgerPath);
const validationSteps = readJson(validationStepsPath);
const budget = contract.budget || {};
const chunking = contract.chunking || {};
const chunks = Array.isArray(contract.chunks) ? contract.chunks : [];
const requiredOutputs = contract.required_outputs || {};
const canonicalSources = Array.isArray(contract.canonical_sources) ? contract.canonical_sources : [];
const relatedGoalId = contract.related_goal_id;

requireValue(contract.schemaVersion === 1, `${contractPath} schemaVersion must be 1`);
requireValue(contract.schema_version === 1, `${contractPath} schema_version must be 1`);
requireValue(contract.id === "seis-goal-tracking-update-orchestrator", `${contractPath} id is invalid`);
requireValue(contract.status === "active", `${contractPath} status must be active`);
requireValue(contract.maturity === "specification", `${contractPath} maturity must be specification`);
requireValue(contract.security_classification === "public-safe", `${contractPath} must remain public-safe`);
requireValue(contract.privacy_impact === "none", `${contractPath} privacy_impact must be none`);
requireValue(relatedGoalId === "SEIS-GOAL-003", `${contractPath} must link SEIS-GOAL-003`);
requireValue(contract.promptPath === promptPath, `${contractPath} promptPath must point to ${promptPath}`);
requireValue(contract.proposalSchemaPath === proposalSchemaPath, `${contractPath} proposalSchemaPath must point to ${proposalSchemaPath}`);
requireValue(typeof contract.proposalPath === "string" && contract.proposalPath.length > 0, `${contractPath} must define proposalPath`);
requireValue(contract.validationCommand === "npm run check:seis-goal-tracking-update-prompt", `${contractPath} validationCommand is invalid`);

requireValue(budget.requestedAggregateCharacterBudget === 5000000, `${contractPath} must record the requested five-million-character budget`);
requireValue(budget.isLiteralBodyRequirement === false, `${contractPath} must reject a literal five-million-character body`);
requireValue(budget.singlePromptCharacterLimit === 16384, `${contractPath} must retain the Prompt Engine limit`);
requireValue(Number.isInteger(budget.maxChunkCharacters) && budget.maxChunkCharacters > 0 && budget.maxChunkCharacters <= budget.singlePromptCharacterLimit, `${contractPath} maxChunkCharacters must fit the single prompt limit`);
requireValue(Number.isInteger(budget.maxChunks) && budget.maxChunks > 0, `${contractPath} maxChunks must be positive`);
requireValue(budget.paddingAllowed === false, `${contractPath} must disallow prompt padding`);
requireValue(budget.unusedBudgetMustRemainUnused === true, `${contractPath} must preserve unused budget`);
requireValue(chunking.maxChunks === budget.maxChunks, `${contractPath} chunking.maxChunks must match the budget`);
requireValue(chunking.maxChunkCharacters === budget.maxChunkCharacters, `${contractPath} chunking.maxChunkCharacters must match the budget`);
requireValue(chunking.sourceLinkedChunksOnly === true, `${contractPath} must require source-linked chunks`);
requireValue(chunking.requireChunkProvenance === true, `${contractPath} must require chunk provenance`);
requireValue(chunking.chunkRecordKey === "chunks", `${contractPath} chunkRecordKey must point to chunks`);

const requiredInputs = [
  "repository instructions",
  "project manifest",
  "active goal records",
  "goal schema",
  "evidence records",
  "execution records",
  "validation records",
  "roadmap links",
  "architecture decisions",
  "related docs",
  "source files only if needed for the selected goal"
];
requireValue(JSON.stringify(contract.required_inputs) === JSON.stringify(requiredInputs), `${contractPath} required_inputs must preserve the bounded input contract`);

for (const source of canonicalSources) {
  requireValue(existsSync(absolute(source)), `${contractPath} references missing source: ${source}`);
}
requireValue(canonicalSources.includes("data/seis-enterprise-expansion-v3.json"), `${contractPath} must include the Enterprise Expansion registry as a conditional source`);
requireValue(canonicalSources.includes("docs/governance/seis-enterprise-expansion-v3.md"), `${contractPath} must include the Enterprise Expansion governance document as a conditional source`);
requireValue(existsSync(absolute(proposalSchemaPath)), `missing ${proposalSchemaPath}`);
requireValue(proposalSchema.schema_version === undefined, `${proposalSchemaPath} must be a JSON Schema, not an emitted proposal`);
requireValue(proposalSchema.$schema === "https://json-schema.org/draft/2020-12/schema", `${proposalSchemaPath} must use JSON Schema 2020-12`);
requireValue(proposalSchema.properties?.goal_id?.pattern === "^SEIS-GOAL-[0-9]{3,}$", `${proposalSchemaPath} must validate canonical goal ids`);
for (const field of requiredOutputs.requiredJsonFields || []) {
  requireValue(Boolean(proposalSchema.properties?.[field]), `${proposalSchemaPath} must define ${field}`);
}

const proposal = readJson(contract.proposalPath);
for (const field of proposalSchema.required || []) {
  requireValue(Object.prototype.hasOwnProperty.call(proposal, field), `${contract.proposalPath} must include ${field}`);
}
requireValue(proposal.$schema === proposalSchema.$id, `${contract.proposalPath} must point to ${proposalSchemaPath}`);
requireValue(proposal.goal_id === relatedGoalId, `${contract.proposalPath} must target ${relatedGoalId}`);
requireValue(proposal.current_status === proposal.proposed_status, `${contract.proposalPath} must preserve the current goal status in this update`);

const activeGoalIds = projectManifest.goal_tracking?.active_goal_ids;
requireValue(Array.isArray(activeGoalIds) && activeGoalIds.includes(relatedGoalId), `${projectManifestPath} must list ${relatedGoalId} as active`);
const goals = Array.isArray(goalRegistry.goals) ? goalRegistry.goals : [];
const goal = goals.find((candidate) => candidate.id === relatedGoalId);
requireValue(Boolean(goal), `${goalRegistryPath} must contain ${relatedGoalId}`);
requireValue(goal?.status === "active", `${relatedGoalId} must remain active`);

const evidenceRecordId = contract.evidence?.record_id;
const validationStepId = contract.evidence?.validation_step_id;
const evidenceRecords = Array.isArray(evidenceLedger.records) ? evidenceLedger.records : [];
const evidence = evidenceRecords.find((record) => record.id === evidenceRecordId);
requireValue(Boolean(evidence), `${evidenceLedgerPath} must contain ${evidenceRecordId}`);
requireValue(evidence?.supports_goal_ids?.includes(relatedGoalId), `${evidenceRecordId} must support ${relatedGoalId}`);
for (const field of contract.evidence?.required_fields || []) {
  requireValue(Object.prototype.hasOwnProperty.call(evidence || {}, field), `${evidenceRecordId} must define ${field}`);
}
const steps = Array.isArray(validationSteps.steps) ? validationSteps.steps : [];
const validationStep = steps.find((step) => step.id === validationStepId);
requireValue(Boolean(validationStep), `${validationStepsPath} must contain ${validationStepId}`);
requireValue(validationStep?.supports_goal_ids?.includes(relatedGoalId), `${validationStepId} must support ${relatedGoalId}`);
requireValue(validationStep?.evidence_ids?.includes(evidenceRecordId), `${validationStepId} must link ${evidenceRecordId}`);
requireValue(validationStep?.command === contract.validationCommand, `${validationStepId} command must match ${contract.validationCommand}`);

requireValue(prompt.length <= budget.singlePromptCharacterLimit, `${promptPath} exceeds ${budget.singlePromptCharacterLimit} characters (${prompt.length})`);
for (const term of contract.required_prompt_terms || []) {
  requireValue(prompt.includes(term), `${promptPath} must include ${term}`);
}
for (const section of requiredOutputs.requiredSections || []) {
  requireValue(prompt.includes(section), `${promptPath} must include final report section ${section}`);
}
requireValue((contract.final_report_requirements || []).includes("Repository state:"), `${contractPath} must require the exact repository-state line`);
for (const claim of contract.prohibited_claims || []) {
  requireValue(typeof claim === "string" && claim.length > 0, `${contractPath} prohibited_claims must contain non-empty strings`);
}

const chunkIds = new Set();
for (const chunk of chunks) {
  const label = chunk.id || "(missing chunk id)";
  requireValue(!chunkIds.has(chunk.id), `duplicate chunk id: ${label}`);
  chunkIds.add(chunk.id);
  requireValue(Number.isInteger(chunk.order) && chunk.order > 0, `${label} must have a positive integer order`);
  requireValue(Number.isInteger(chunk.maxCharacters) && chunk.maxCharacters > 0 && chunk.maxCharacters <= budget.maxChunkCharacters, `${label} maxCharacters exceeds the chunk ceiling`);
  requireValue(typeof chunk.responsibility === "string" && chunk.responsibility.length > 0, `${label} must define responsibility`);
  requireValue(typeof chunk.output === "string" && chunk.output.length > 0, `${label} must define output`);
  requireValue(Array.isArray(chunk.requiredSources) && chunk.requiredSources.length > 0, `${label} must define source provenance`);
  for (const source of chunk.requiredSources || []) {
    requireValue(canonicalSources.includes(source), `${label} source is not canonical: ${source}`);
    requireValue(existsSync(absolute(source)), `${label} references missing source: ${source}`);
  }
}
requireValue(chunks.length === 8, `${contractPath} must define the eight bounded execution chunks`);
requireValue(chunks.every((chunk, index) => chunk.order === index + 1), `${contractPath} chunk order must be contiguous`);
requireValue(chunks.length <= budget.maxChunks, `${contractPath} exceeds maxChunks`);

for (const pattern of [
  /-----BEGIN [A-Z ]+-----/,
  /(?:sk|ghp|github_pat)_[A-Za-z0-9_-]{12,}/,
  /AKIA[0-9A-Z]{12,}/
]) {
  requireValue(!pattern.test(prompt), `${promptPath} contains a secret-shaped value`);
  requireValue(!pattern.test(JSON.stringify(contract)), `${contractPath} contains a secret-shaped value`);
}

if (failures.length > 0) {
  console.error("SEIS goal-tracking update prompt check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`SEIS goal-tracking update prompt check passed (${prompt.length} characters, ${chunks.length} chunks, ${relatedGoalId}).`);
}
