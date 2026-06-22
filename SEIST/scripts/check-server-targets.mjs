import { existsSync, readFileSync } from "node:fs";

const targetsPath = "deploy/server-targets.json";
const matrixPath = "deploy/provider-matrix.json";
const docsPath = "docs/deployment/server-target-selection.md";
const serverCommandDocs = [
  "docs/deployment/server-target-selection.md",
  "docs/deployment/server-upload-runbook.md",
  "docs/deployment/server-drop-handoff.md",
  "docs/deployment/release-backup-plan.md",
  "handoff/server/upload-checklist.md",
  "deploy/upload-plan.json",
  "handoff/server/upload-plan.json",
  "handoff/server/server-upload-manifest.json"
];
const obsoleteCommands = [
  "npm run release:ready",
  "npm run check:release",
  "npm run deploy:server",
  "npm run restore:latest",
  "npm run check:history",
  "npm run package:server",
  "npm run backup:release"
];
const strictFiles = process.argv.includes("--strict-files");
const failures = [];

if (!existsSync(targetsPath)) failures.push(`missing ${targetsPath}`);
if (!existsSync(matrixPath)) failures.push(`missing ${matrixPath}`);

let targets = null;
let matrix = null;

if (existsSync(targetsPath)) {
  targets = JSON.parse(readFileSync(targetsPath, "utf8"));
}

if (existsSync(matrixPath)) {
  matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
}

const docs = existsSync(docsPath) ? readFileSync(docsPath, "utf8") : "";
if (!docs) {
  failures.push(`missing ${docsPath}`);
} else {
  if (!docs.includes("npm run check:deploy-readiness")) {
    failures.push("server target docs must include check:deploy-readiness");
  }
}

for (const file of serverCommandDocs) {
  const content = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (!content) {
    failures.push(`missing ${file}`);
    continue;
  }
  for (const command of obsoleteCommands) {
    if (content.includes(command)) {
      failures.push(`${file} must not reference missing command: ${command}`);
    }
  }
}

const candidates = targets?.candidates || [];
const providers = matrix?.providers || [];
const candidateIds = new Set(candidates.map(candidate => candidate.id));
const providerIds = new Set(providers.map(provider => provider.id));

for (const candidate of candidates) {
  if (!providerIds.has(candidate.id)) {
    failures.push(`target candidate missing provider matrix entry: ${candidate.id}`);
  }
  if (!Array.isArray(candidate.requiredInput)) {
    failures.push(`target candidate requiredInput must be an array: ${candidate.id}`);
  }
}

for (const provider of providers) {
  if (!candidateIds.has(provider.id)) {
    failures.push(`provider matrix entry missing target candidate: ${provider.id}`);
  }
  for (const field of ["uploadModel", "requiredFiles", "verifyRoutes", "rollback"]) {
    if (!provider[field]) {
      failures.push(`provider ${provider.id} missing ${field}`);
    }
  }
  for (const requiredFile of provider.requiredFiles || []) {
    if ((strictFiles || !requiredFile.startsWith("dist/")) && !existsSync(requiredFile)) {
      failures.push(`provider ${provider.id} references missing file: ${requiredFile}`);
    }
  }
}

const activeTarget = targets?.activeTarget || null;
if (activeTarget && !candidateIds.has(activeTarget)) {
  failures.push(`active target is not a known candidate: ${activeTarget}`);
}

const activeCandidate = activeTarget
  ? candidates.find(candidate => candidate.id === activeTarget)
  : null;
const activeValues = targets?.targetConfig?.values || {};
const missingActiveInput = activeCandidate
  ? (activeCandidate.requiredInput || []).filter(key => !activeValues[key])
  : [];

if (activeCandidate && missingActiveInput.length > 0) {
  failures.push(`active target missing configured input: ${missingActiveInput.join(", ")}`);
}

const requiredQuestions = targets?.confirmationFlow?.requiredQuestions || [];
const missingConfirmationQuestions = activeTarget
  ? requiredQuestions
      .filter(question => {
        const blocks = question.blocks || [];
        if (blocks.includes("activeTarget")) return false;
        return !blocks.some(key => Boolean(activeValues[key]));
      })
      .map(question => ({
        id: question.id,
        blocks: question.blocks || []
      }))
  : [];

if (missingConfirmationQuestions.length > 0) {
  failures.push(`active target missing confirmation answers: ${missingConfirmationQuestions.map(question => question.id).join(", ")}`);
}

const blockedBy = activeTarget
  ? []
  : requiredQuestions.map(question => ({
      id: question.id,
      question: question.question,
      blocks: question.blocks || []
    }));

const candidateRequirements = candidates.map(candidate => ({
  id: candidate.id,
  status: candidate.status,
  requiredInput: candidate.requiredInput || []
}));

if (failures.length > 0) {
  console.error("SEIS server target check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  activeTarget,
  liveUploadBlocked: !activeTarget,
  activeTargetReady: Boolean(activeTarget && missingActiveInput.length === 0 && missingConfirmationQuestions.length === 0),
  missingActiveInput,
  missingConfirmationQuestions,
  blockedBy,
  candidateRequirements,
  nextCommand: activeTarget ? "npm run server-upload:dry-run" : "node scripts/configure-server-target.mjs <target-id> --key value",
  providerCount: providers.length,
  strictFiles
}, null, 2));
