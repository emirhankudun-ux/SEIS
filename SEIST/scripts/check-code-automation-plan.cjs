const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const CONTRACT_FILE = path.join(ROOT, "content", "development", "code-automation-plan.json");
const REPORT_FILE = path.join(ROOT, "reports", "code-automation-plan.md");
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

const contract = readJson(CONTRACT_FILE);
const report = fs.existsSync(REPORT_FILE) ? fs.readFileSync(REPORT_FILE, "utf8") : "";

ensure(report.includes("# SEIS Code Automation Plan"), "code automation report must keep its title");

if (contract) {
  ensure(contract.id === "seis-code-automation-plan", "contract id must remain seis-code-automation-plan");
  ensure(contract.branchTarget === "UIXAppTTR", "code automation must target UIXAppTTR");
  ensure(contract.remoteTarget === "origin", "code automation must target origin");
  ensure(contract.cloudMode === "provider-neutral-preflight", "cloud mode must remain provider-neutral-preflight");
  ensure(contract.connectorMode === "explicit-auth-only", "connector mode must remain explicit-auth-only");
  ensure(contract.policy?.executionMode === "high-efficiency-machine-light", "execution mode must stay machine-light");
  ensure(contract.policy?.changeScope === "one-small-reversible-source-improvement", "change scope must stay reversible");
  ensure(String(contract.policy?.pushRule || "").includes("fast-forward-safe"), "push rule must require fast-forward safety");

  for (const command of [
    "npm run check:branch",
    "npm run check:software-languages",
    "npm run check:seis-cloud-environment",
    "npm run check:server-target",
    "npm run quality",
    "npm run publish:preflight"
  ]) {
    ensure(contract.validationCommands?.includes(command), `missing validation command: ${command}`);
    ensure(report.includes(command), `report missing validation command: ${command}`);
  }

  ensure((contract.nextCodingLoop || []).length >= 5, "next coding loop must define at least five steps");
  ensure((contract.connectorCandidates || []).length >= 8, "connector candidates must include at least eight entries");
  ensure((contract.cloudProviderCandidates || []).length >= 5, "cloud provider candidates must include at least five entries");
  ensure((contract.guardrails || []).includes("Do not commit secrets."), "guardrails must forbid committed secrets");
}

if (failures.length > 0) {
  console.error("SEIS code automation plan check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS code automation plan check passed.");
