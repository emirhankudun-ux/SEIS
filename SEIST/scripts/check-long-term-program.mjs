import { existsSync, readFileSync } from "node:fs";

const programPath = "content/development/long-term-program.json";
const docPath = "docs/development/long-term-development-program.md";
const htmlPath = "apps/web/index.html";
const failures = [];

for (const file of [programPath, docPath, htmlPath]) {
  if (!existsSync(file)) {
    failures.push(`missing long-term program file: ${file}`);
  }
}

const program = readJson(programPath);
const doc = readText(docPath);
const html = readText(htmlPath);

if (program?.branch !== "UIXAppTTR") {
  failures.push("long-term program must stay on UIXAppTTR");
}

if (program?.horizon !== "long-term") {
  failures.push("long-term program horizon must be explicit");
}

if ((program?.phases || []).length < 6) {
  failures.push("long-term program must define at least six phases");
}

const requiredPhases = [
  "phase-01-foundation",
  "phase-02-cinematic-interface",
  "phase-03-mobile-product-path",
  "phase-04-server-preservation",
  "phase-05-polyglot-services",
  "phase-06-observability-governance"
];

const phaseIds = new Set((program?.phases || []).map(phase => phase.id));
for (const phaseId of requiredPhases) {
  if (!phaseIds.has(phaseId)) {
    failures.push(`missing long-term phase: ${phaseId}`);
  }
}

const requiredRules = [
  "main stays protected",
  "UIXAppTTR remains the single active development branch",
  "server upload remains blocked until the active target is confirmed",
  "reduced-motion and mobile performance remain mandatory"
];

for (const rule of requiredRules) {
  if (!(program?.standingRules || []).includes(rule)) {
    failures.push(`missing standing rule: ${rule}`);
  }
}

if (!doc.includes("Phase Plan")) {
  failures.push("long-term program doc must include Phase Plan");
}

if (!html.includes("data-long-term-program")) {
  failures.push("web cockpit must expose data-long-term-program");
}

if (failures.length > 0) {
  console.error("SEIS long-term program check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  branch: program.branch,
  phases: program.phases.length,
  standingRules: program.standingRules.length,
  horizon: program.horizon
}, null, 2));

function readText(file) {
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

function readJson(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}
