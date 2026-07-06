#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(repoRoot, "content", "development", "seis-source-provenance-intake.json");

function fail(message) {
  console.error(`SEIS source provenance intake check failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

const raw = fs.readFileSync(manifestPath, "utf8");
assert(!/\/Users\/|~\/|[A-Za-z]:\\/.test(raw), "manifest must not commit local absolute paths");

let manifest;
try {
  manifest = JSON.parse(raw);
} catch (error) {
  fail(`manifest is not valid JSON: ${error.message}`);
}

assert(manifest.visibility === "public-safe", "visibility must be public-safe");
assert(manifest.sourceLocationPolicy?.localPathsCommitted === false, "local paths must be excluded");
assert(manifest.intakePolicy?.originalsModified === false, "source archives must stay unmodified");
assert(manifest.intakePolicy?.repoImportMode === "manifest-first", "repo import mode must be manifest-first");
assert(manifest.intakePolicy?.binaryImport === "deferred-manual-review", "binary imports must remain deferred");
assert(manifest.intakePolicy?.fullReferenceDump === "blocked-manual-review", "full reference dumps must remain blocked");
assert(manifest.intakePolicy?.noLiveAIClaims === true, "live AI claims must be disabled");
assert(manifest.intakePolicy?.noSecrets === true, "no-secrets boundary must be explicit");

const requiredArchives = [
  "Kimi_Agent_Deployment_v1.zip",
  "Kimi_Agent_Deployment_v2.zip",
  "Kimi_Agent_Deployment_v3.zip",
  "Kimi_Agent_Deployment_v4.zip",
  "Kimi_Agent_Deployment_v5.zip",
  "Kimi_Agent_Deployment_v6.zip",
  "Kimi_Agent_Deployment_v7.zip",
  "stitch_web_based_linux_desktop.zip",
  "stitch_yapay_zeka_web_platformu.zip"
];

assert(Array.isArray(manifest.archives), "archives must be an array");
assert(manifest.archives.length === requiredArchives.length, `expected ${requiredArchives.length} archives`);

const names = new Set(manifest.archives.map((archive) => archive.archiveName));
for (const archiveName of requiredArchives) {
  assert(names.has(archiveName), `missing archive ${archiveName}`);
}

for (const archive of manifest.archives) {
  assert(/^[a-f0-9]{64}$/.test(archive.sha256), `${archive.archiveName} must have a sha256 checksum`);
  assert(Number.isInteger(archive.byteSize) && archive.byteSize > 0, `${archive.archiveName} must have byteSize`);
  assert(Number.isInteger(archive.fileCount) && archive.fileCount > 0, `${archive.archiveName} must have fileCount`);
  assert(Array.isArray(archive.blockedUse) && archive.blockedUse.length > 0, `${archive.archiveName} must list blockedUse`);
}

const kimiV7 = manifest.archives.find((archive) => archive.archiveName === "Kimi_Agent_Deployment_v7.zip");
assert(kimiV7?.role === "primary-reference", "Kimi v7 must be the primary reference");

for (const version of [1, 2, 3, 4, 5, 6]) {
  const archive = manifest.archives.find((item) => item.archiveName === `Kimi_Agent_Deployment_v${version}.zip`);
  assert(archive?.role === "evolution-evidence", `Kimi v${version} must be evolution evidence`);
}

assert(Array.isArray(manifest.decisionMatrix), "decisionMatrix must be an array");
for (const decision of manifest.decisionMatrix) {
  assert(Array.isArray(decision.selected), `${decision.topic} must list selected options`);
  for (const option of ["A", "B", "C"]) {
    assert(decision.selected.includes(option), `${decision.topic} must include option ${option}`);
  }
}

assert(Array.isArray(manifest.swarmBacklog?.rounds), "swarmBacklog.rounds must be an array");
assert(manifest.swarmBacklog.rounds.length === 30, "swarm backlog must contain 30 rounds");
for (const round of manifest.swarmBacklog.rounds) {
  assert(round.id && round.specialist && round.objective && round.output && round.verification, `${round.id ?? "round"} is incomplete`);
}

console.log(`SEIS source provenance intake check passed: ${manifest.archives.length} archives, ${manifest.swarmBacklog.rounds.length} swarm rounds.`);
