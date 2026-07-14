import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const contractPath = "data/seis-goal-tracking-update-prompt.json";
const promptPath = "docs/governance/seis-goal-tracking-update-prompt.md";
const proposalSchemaPath = "schemas/seis-goal-tracking-update.schema.json";
const failures = [];

function absolute(relativePath) {
  return resolve(root, relativePath);
}

function read(relativePath) {
  const file = absolute(relativePath);
  if (!existsSync(file)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function requireValue(condition, message) {
  if (!condition) failures.push(message);
}

let contract = {};
try {
  contract = JSON.parse(read(contractPath) || "{}");
} catch (error) {
  failures.push(`${contractPath} must contain valid JSON: ${error.message}`);
}

const prompt = read(promptPath);
const budget = contract.characterBudget || {};
const chunks = Array.isArray(contract.chunks) ? contract.chunks : [];

requireValue(contract.schemaVersion === 1, `${contractPath} schemaVersion must be 1`);
requireValue(contract.id === "seis-goal-tracking-update-orchestrator", `${contractPath} id is invalid`);
requireValue(contract.goalId === "SEIS-GOAL-003", `${contractPath} must link SEIS-GOAL-003`);
requireValue(contract.promptPath === promptPath, `${contractPath} promptPath must point to ${promptPath}`);
requireValue(contract.proposalSchemaPath === proposalSchemaPath, `${contractPath} proposalSchemaPath must point to ${proposalSchemaPath}`);
requireValue(typeof contract.proposalPath === "string" && contract.proposalPath.length > 0, `${contractPath} must define proposalPath`);
requireValue(contract.validationCommand === "npm run check:seis-goal-tracking-update-prompt", `${contractPath} validationCommand is invalid`);
requireValue(budget.requestedAggregateCharacterBudget === 5000000, `${contractPath} must record the requested five-million-character budget`);
requireValue(budget.isLiteralBodyRequirement === false, `${contractPath} must reject a literal five-million-character body`);
requireValue(budget.singlePromptCharacterLimit === 16384, `${contractPath} must retain the Prompt Engine limit`);
requireValue(budget.maxChunkCharacters > 0 && budget.maxChunkCharacters <= budget.singlePromptCharacterLimit, `${contractPath} maxChunkCharacters must fit the single prompt limit`);
requireValue(budget.paddingAllowed === false, `${contractPath} must disallow prompt padding`);
requireValue(budget.unusedBudgetMustRemainUnused === true, `${contractPath} must preserve unused budget`);

const canonicalSources = Array.isArray(contract.canonicalSources) ? contract.canonicalSources : [];
for (const source of canonicalSources) {
  requireValue(existsSync(absolute(source)), `${contractPath} references missing source: ${source}`);
}
requireValue(existsSync(absolute(proposalSchemaPath)), `missing ${proposalSchemaPath}`);
let proposalSchema = {};
try {
  proposalSchema = JSON.parse(readFileSync(absolute(proposalSchemaPath), "utf8"));
} catch (error) {
  failures.push(`${proposalSchemaPath} must contain valid JSON: ${error.message}`);
}
requireValue(proposalSchema.schema_version === undefined, `${proposalSchemaPath} must be a JSON Schema, not an emitted proposal`);
requireValue(proposalSchema.$schema === "https://json-schema.org/draft/2020-12/schema", `${proposalSchemaPath} must use JSON Schema 2020-12`);
requireValue(proposalSchema.properties?.goal_id?.pattern === "^SEIS-GOAL-[0-9]{3,}$", `${proposalSchemaPath} must validate canonical goal ids`);
for (const field of contract.outputContract?.requiredJsonFields || []) {
  requireValue(Boolean(proposalSchema.properties?.[field]), `${proposalSchemaPath} must define ${field}`);
}
let proposal = {};
try {
  proposal = JSON.parse(read(contract.proposalPath) || "{}");
} catch (error) {
  failures.push(`${contract.proposalPath} must contain valid JSON: ${error.message}`);
}
for (const field of proposalSchema.required || []) {
  requireValue(Object.prototype.hasOwnProperty.call(proposal, field), `${contract.proposalPath} must include ${field}`);
}
requireValue(proposal.$schema === proposalSchema.$id, `${contract.proposalPath} must point to ${proposalSchemaPath}`);
requireValue(proposal.goal_id === contract.goalId, `${contract.proposalPath} must target ${contract.goalId}`);
requireValue(proposal.current_status === proposal.proposed_status, `${contract.proposalPath} must preserve the current goal status in this update`);

requireValue(prompt.length <= budget.singlePromptCharacterLimit, `${promptPath} exceeds ${budget.singlePromptCharacterLimit} characters (${prompt.length})`);
for (const term of contract.requiredPromptTerms || []) {
  requireValue(prompt.includes(term), `${promptPath} must include ${term}`);
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
  for (const source of chunk.requiredSources || []) {
    requireValue(canonicalSources.includes(source), `${label} source is not canonical: ${source}`);
    requireValue(existsSync(absolute(source)), `${label} references missing source: ${source}`);
  }
}
requireValue(chunks.length === 8, `${contractPath} must define the eight bounded execution chunks`);
requireValue(chunks.every((chunk, index) => chunk.order === index + 1), `${contractPath} chunk order must be contiguous`);
requireValue(chunks.length <= budget.maxChunks, `${contractPath} exceeds maxChunks`);

for (const claim of contract.forbiddenClaims || []) {
  requireValue(typeof claim === "string" && claim.length > 0, `${contractPath} forbiddenClaims must contain non-empty strings`);
}

for (const pattern of [
  /-----BEGIN [A-Z ]+-----/,
  /(?:sk|ghp|github_pat)_[A-Za-z0-9_-]{12,}/,
  /AKIA[0-9A-Z]{12,}/
]) {
  requireValue(!pattern.test(prompt), `${promptPath} contains a secret-shaped value`);
}

if (failures.length > 0) {
  console.error("SEIS goal-tracking update prompt check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`SEIS goal-tracking update prompt check passed (${prompt.length} characters, ${chunks.length} chunks).`);
}
