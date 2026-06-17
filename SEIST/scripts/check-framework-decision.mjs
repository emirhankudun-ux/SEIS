import { existsSync, readFileSync } from "node:fs";

const registryPath = "content/lab/framework-decision.json";
const documentPath = "docs/decisions/framework-decision-record.md";

const failures = [];

for (const path of [registryPath, documentPath]) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
  }
}

const registry = existsSync(registryPath)
  ? JSON.parse(readFileSync(registryPath, "utf8"))
  : null;
const documentText = existsSync(documentPath)
  ? readFileSync(documentPath, "utf8")
  : "";

if (registry) {
  if (registry.status !== "deferred") {
    failures.push("framework decision must stay deferred until acceptance criteria are met");
  }

  if (registry.currentSurface !== "static-html-css-js") {
    failures.push("framework decision must preserve the current static surface");
  }

  const candidates = new Set((registry.candidateFrameworks || []).map(item => item.id));
  for (const candidate of ["nextjs", "astro", "static-plus-modules"]) {
    if (!candidates.has(candidate)) {
      failures.push(`framework decision missing candidate: ${candidate}`);
    }
  }

  if ((registry.acceptanceCriteria || []).length < 5) {
    failures.push("framework decision must define migration acceptance criteria");
  }

  const approvalItems = new Set(registry.dependencyBudget?.approvalRequiredFor || []);
  for (const item of ["framework runtime", "3D rendering engine", "animation timeline engine"]) {
    if (!approvalItems.has(item)) {
      failures.push(`framework decision missing dependency approval item: ${item}`);
    }
  }

  if ((registry.rollbackPath || []).length < 3) {
    failures.push("framework decision must define a rollback path");
  }
}

for (const requiredText of [
  "Framework Decision Record",
  "Status: deferred",
  "Next.js",
  "Astro",
  "Dependency Budget",
  "Rollback Path"
]) {
  if (!documentText.includes(requiredText)) {
    failures.push(`missing "${requiredText}" in ${documentPath}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS framework decision check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS framework decision check passed.");
