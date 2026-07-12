import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY_FILE = path.join(ROOT, "content", "development", "seis-data-schema-registry.json");
const PACKAGE_FILE = path.join(ROOT, "package.json");
const failures = [];

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

const registry = readJson(REGISTRY_FILE);
const packageJson = readJson(PACKAGE_FILE);
const packageScripts = new Set(Object.keys(packageJson?.scripts || {}));
const validStatuses = new Set(registry?.statusVocabulary || []);
const validShapes = new Set(["object", "array", "text"]);

function commandExists(command) {
  const npmScript = String(command).match(/^npm run ([^\s]+)/)?.[1];
  const nodeScript = String(command).match(/^node (scripts\/[^\s]+)/)?.[1];

  if (npmScript) return packageScripts.has(npmScript);
  if (nodeScript) return fs.existsSync(path.join(ROOT, nodeScript));
  return false;
}

function validateRecord(record) {
  const label = record?.id || "unknown record";

  ensure(typeof record?.id === "string" && record.id.length > 0, "record id is required");
  ensure(typeof record?.path === "string" && record.path.length > 0, `${label} must define path`);
  ensure(typeof record?.lane === "string" && record.lane.startsWith("@seis"), `${label} must define a SEIS lane`);
  ensure(validStatuses.has(record?.currentStatus), `${label} has unsupported currentStatus ${record?.currentStatus}`);
  ensure(typeof record?.sourceType === "string" && record.sourceType.length > 0, `${label} must define sourceType`);
  ensure(validShapes.has(record?.expectedShape), `${label} has unsupported expectedShape ${record?.expectedShape}`);
  ensure(Array.isArray(record?.requiredTopLevelKeys), `${label} must define requiredTopLevelKeys array`);
  ensure(Array.isArray(record?.validationCommands) && record.validationCommands.length > 0, `${label} must define validationCommands`);
  ensure(typeof record?.freshness === "string" && record.freshness.length > 0, `${label} must define freshness`);
  ensure(typeof record?.secretPolicy === "string" && record.secretPolicy.length > 0, `${label} must define secretPolicy`);

  for (const command of record?.validationCommands || []) {
    ensure(commandExists(command), `${label} references missing validation command: ${command}`);
  }

  const targetPath = path.join(ROOT, record?.path || "");
  ensure(fs.existsSync(targetPath), `${label} path does not exist: ${record?.path}`);

  if (!fs.existsSync(targetPath)) return;

  if (record.expectedShape === "text") {
    const text = fs.readFileSync(targetPath, "utf8");
    ensure(text.trim().length > 0, `${label} text file is empty`);
    return;
  }

  const parsed = readJson(targetPath);
  if (!parsed) return;

  if (record.expectedShape === "object") {
    ensure(!Array.isArray(parsed) && parsed && typeof parsed === "object", `${label} must be a JSON object`);
  }

  if (record.expectedShape === "array") {
    ensure(Array.isArray(parsed), `${label} must be a JSON array`);
  }

  for (const key of record.requiredTopLevelKeys || []) {
    ensure(Object.prototype.hasOwnProperty.call(parsed, key), `${label} missing required top-level key: ${key}`);
  }

  if (
    record.sourceType === "training-evidence-json-schema" ||
    record.sourceType === "model-release-trust-root-json-schema" ||
    record.sourceType === "conversation-session-json-schema" ||
    record.sourceType === "conversation-envelope-json-schema"
  ) {
    ensure(
      parsed.$schema === "https://json-schema.org/draft/2020-12/schema",
      `${label} must use JSON Schema Draft 2020-12`,
    );
    ensure(parsed.additionalProperties === false, `${label} must reject unknown top-level fields`);
  }
}

if (registry) {
  ensure(registry.id === "seis-data-schema-registry", "registry id must remain seis-data-schema-registry");
  ensure(registry.schemaVersion === 1, "registry schemaVersion must be 1");
  ensure(Array.isArray(registry.statusVocabulary) && registry.statusVocabulary.length >= 5, "registry must define statusVocabulary");
  ensure(Array.isArray(registry.records) && registry.records.length >= 10, "registry must define at least ten records");

  const ids = new Set();
  for (const record of registry.records || []) {
    ensure(!ids.has(record?.id), `duplicate registry id: ${record?.id}`);
    ids.add(record?.id);
    validateRecord(record);
  }

  for (const requiredId of [
    "model-dataset-manifest-schema",
    "model-compute-approval-schema",
    "model-training-run-schema",
    "checkpoint-record-schema",
    "model-evaluation-report-schema",
    "model-release-decision-schema",
    "model-release-trust-root-schema",
    "seis-model-release-trust-root",
    "seis-conversation-session-schema",
    "seis-conversation-envelope-schema",
    "seis-conversation-nexus",
  ]) {
    ensure(ids.has(requiredId), `registry missing required AI data contract: ${requiredId}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS data schema registry check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS data schema registry check passed.");
