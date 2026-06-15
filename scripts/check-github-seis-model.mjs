import { existsSync, readFileSync } from "node:fs";

const modelPath = "content/development/github-seis-model.json";
const docsPath = "docs/development/github-seis-model.md";
const webPath = "release/web/index.html";
const appPath = "release/web/app.js";

const failures = [];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

for (const path of [modelPath, docsPath, webPath, appPath]) {
  if (!existsSync(path)) failures.push(`missing ${path}`);
}

const model = existsSync(modelPath) ? readJson(modelPath) : null;
const docs = readText(docsPath);
const web = readText(webPath);
const app = readText(appPath);

if (model) {
  if (model.model !== "seis-github-operating-model") {
    failures.push("GitHub SEIS model id must be seis-github-operating-model");
  }

  if (model.branch?.active !== "UIXAppTTR") {
    failures.push("GitHub SEIS model must target UIXAppTTR");
  }

  if (model.branch?.singleRemoteBranch !== true) {
    failures.push("GitHub SEIS model must keep single remote branch posture");
  }

  const cadenceIds = new Set((model.cadence || []).map(item => item.id));
  for (const id of ["intent", "source", "verification", "publication"]) {
    if (!cadenceIds.has(id)) failures.push(`GitHub SEIS model missing cadence phase: ${id}`);
  }

  const readinessCommands = new Set((model.readinessSignals || []).map(item => item.command));
  for (const command of [
    "npm run check:development-program",
    "npm run check:workspace",
    "npm run automation:publish-readiness"
  ]) {
    if (!readinessCommands.has(command)) failures.push(`GitHub SEIS model missing readiness command: ${command}`);
  }

  if ((model.rollbackRules || []).length < 4) {
    failures.push("GitHub SEIS model must include at least four rollback rules");
  }
}

for (const requiredText of [
  "UIXAppTTR",
  "automation:publish-readiness",
  "GitHub publication",
  "Rollback Rules",
  "local-only or committed-only"
]) {
  if (!docs.includes(requiredText)) failures.push(`missing "${requiredText}" in ${docsPath}`);
}

for (const requiredWebText of [
  "id=\"github-model\"",
  "data-github-model-status",
  "data-github-model-grid",
  "data-github-readiness-list"
]) {
  if (!web.includes(requiredWebText)) failures.push(`web cockpit missing ${requiredWebText}`);
}

for (const requiredAppText of [
  "github-seis-model.json",
  "renderGithubModel",
  "loadGithubModel"
]) {
  if (!app.includes(requiredAppText)) failures.push(`app runtime missing ${requiredAppText}`);
}

if (failures.length > 0) {
  console.error("GitHub SEIS model check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("GitHub SEIS model check passed.");
