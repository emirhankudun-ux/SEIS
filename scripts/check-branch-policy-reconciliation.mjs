import { existsSync, readFileSync } from "node:fs";

const files = {
  reconciliation: "docs/governance/branch-policy-reconciliation.md",
  branchPolicy: "docs/governance/branch-policy.md",
  readme: "README.md",
  contributing: "CONTRIBUTING.md",
  codex: "CODEX.md",
  ci: ".github/workflows/ci.yml",
  foundationWorkflow: ".github/workflows/foundation-check.yml",
  governanceWorkflow: ".github/workflows/seis-open-source-governance.yml",
  packageJson: "package.json"
};

const classifiedLegacyPaths = [
  "docs/repository-visibility-and-main-sync.md",
  "docs/governance/development-process.md",
  "docs/development/uixapps-repository-model.md",
  "docs/development/uixappttr-branch-model.md",
  "docs/development/long-term-development-program.md",
  "docs/strategy/seis-evolution-model.md",
  "scripts/check-uixappttr-branch.mjs",
  "scripts/check-development-process.mjs",
  "scripts/check-development-state.mjs",
  "scripts/check-seis-evolution-model.mjs"
];

const activeSurfaces = [
  files.readme,
  files.contributing,
  files.codex,
  files.branchPolicy,
  files.ci,
  files.foundationWorkflow,
  files.governanceWorkflow
];

const failures = [];

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }

  return readFileSync(file, "utf8");
}

function ensureIncludes(file, phrase) {
  const text = read(file);
  if (!text.includes(phrase)) {
    failures.push(`${file} must include ${phrase}`);
  }
}

const reconciliation = read(files.reconciliation);
const packageJsonText = read(files.packageJson);
let packageJson = {};

try {
  packageJson = packageJsonText ? JSON.parse(packageJsonText) : {};
} catch (error) {
  failures.push(`invalid ${files.packageJson}: ${error.message}`);
}

for (const phrase of [
  "active-main-centered-reconciled",
  "`main` is the only permanent branch for SEIS",
  "`UIXAppTTR` is not the current SEIS target branch",
  "Classified Legacy Surfaces",
  "Active Surface Rule",
  "npm run check:branch-policy-reconciliation",
  "does not inspect or mutate remote GitHub settings"
]) {
  if (!reconciliation.includes(phrase)) {
    failures.push(`${files.reconciliation} must include ${phrase}`);
  }
}

for (const legacyPath of classifiedLegacyPaths) {
  if (!existsSync(legacyPath)) {
    failures.push(`classified legacy path is missing: ${legacyPath}`);
  }
  if (!reconciliation.includes(`\`${legacyPath}\``)) {
    failures.push(`${files.reconciliation} must classify ${legacyPath}`);
  }
}

for (const file of activeSurfaces) {
  const text = read(file);
  if (text.includes("UIXAppTTR")) {
    failures.push(`${file} must not target UIXAppTTR in active branch policy surfaces`);
  }
}

ensureIncludes(files.readme, "`main` is the only permanent branch");
ensureIncludes(files.contributing, "`main` is the only permanent branch");
ensureIncludes(files.branchPolicy, "`main` is the only permanent branch for SEIS");
ensureIncludes(files.codex, "Keep work on `main` or a short-lived review branch");

for (const workflow of [files.ci, files.foundationWorkflow, files.governanceWorkflow]) {
  ensureIncludes(workflow, "main");
}

if (
  packageJson.scripts?.["check:branch-policy-reconciliation"] !==
  "node scripts/check-branch-policy-reconciliation.mjs"
) {
  failures.push(`${files.packageJson} must expose check:branch-policy-reconciliation`);
}

const sensitivePatterns = [
  ["SSH private key", /BEGIN (OPENSSH|RSA|EC) PRIVATE KEY/],
  ["GitHub token", /ghp_|github_pat_/],
  ["strict OpenAI key token", /sk-[A-Za-z0-9_-]{20,}/],
  ["OpenAI key assignment", /OPENAI_API_KEY=/],
  ["Anthropic key assignment", /ANTHROPIC_API_KEY=/],
  ["Gemini key assignment", /GEMINI_API_KEY=/],
  ["Private key assignment", /PRIVATE_KEY=/],
  ["AWS secret key", /AWS_SECRET_ACCESS_KEY/],
  ["Password assignment", /password=/i],
  ["Token assignment", /token=/i]
];

for (const [label, pattern] of sensitivePatterns) {
  if (pattern.test(reconciliation)) {
    failures.push(`${files.reconciliation} must not include ${label}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS branch policy reconciliation check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS branch policy reconciliation check passed.");
