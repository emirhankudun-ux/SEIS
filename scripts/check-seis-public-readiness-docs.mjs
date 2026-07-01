import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }

  return readFileSync(absolutePath, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function requireIncludes(relativePath, phrases) {
  const text = read(relativePath);
  for (const phrase of phrases) {
    ensure(text.includes(phrase), `${relativePath} must include ${phrase}`);
  }
  return text;
}

const gettingStarted = requireIncludes("docs/GETTING_STARTED.md", [
  "no-key",
  "Apple native",
  "SEIS Brain",
  "SEIS-SSH",
  "npm run check:seis-public-readiness",
  "npm run check:seis-public-readiness-docs",
  "docs/development/first-run-quickstart.md",
  "Never commit private notes",
]);

const troubleshooting = requireIncludes("docs/TROUBLESHOOTING.md", [
  "npm Is Not Available",
  "Demo mode should not require API keys",
  "SEIS-SSH Looks Offline",
  "Do not print the matching value",
  "git status --short",
]);

const publicReadiness = requireIncludes("docs/PUBLIC_READINESS.md", [
  "no-key demo path",
  "content/development/seis-public-readiness-status.json",
  "docs/governance/public-readiness-status.md",
  "active-review-matrix-not-release-claim",
  "Required Public Surface",
  "No-Key Demo Gate",
  "Apple-First Gate",
  "Second Brain Gate",
  "Local AI Gate",
  "SEIS-SSH Gate",
  "Public Indexing Gate",
  "Release Artifact Gate",
  "Branch Policy Gate",
  "docs/OBSIDIAN_SECOND_BRAIN.md",
  "docs/LOCAL_AI_SETUP.md",
  "docs/SEIS_SSH_SETUP.md",
  "npm run check:seis-public-readiness",
  "npm run check:seis-env-example",
  "npm run check:seis-public-readiness-status",
  "pre-production-noindex",
  "suggested PR title and body",
  "Honest blocked status is part of SEIS quality",
]);

const obsidian = requireIncludes("docs/OBSIDIAN_SECOND_BRAIN.md", [
  "planned-gated",
  "SEIS does not import a private Obsidian vault today",
  "No required Obsidian plugin",
  "Do not commit private note bodies",
  "npm run check:seis-brain-context-packs",
]);

const localAI = requireIncludes("docs/LOCAL_AI_SETUP.md", [
  "optional helper lane",
  "No local AI setup is required for the no-key demo path",
  "Keep exactly one tool in writer mode",
  "Never paste provider keys",
  "npm run check:seis-brain-context-packs",
]);

const seisSSH = requireIncludes("docs/SEIS_SSH_SETUP.md", [
  "credential-free",
  "Safe First Checks",
  "Live Claim Gate",
  "strict online check",
  "Do not use passing docs checks as proof of a live SSH session",
]);

const index = requireIncludes("docs/INDEX.md", [
  "[GETTING_STARTED.md](GETTING_STARTED.md)",
  "[TROUBLESHOOTING.md](TROUBLESHOOTING.md)",
  "[PUBLIC_READINESS.md](PUBLIC_READINESS.md)",
  "governance/public-readiness-status.md",
  "seis-public-readiness-status.json",
  "[OBSIDIAN_SECOND_BRAIN.md](OBSIDIAN_SECOND_BRAIN.md)",
  "[LOCAL_AI_SETUP.md](LOCAL_AI_SETUP.md)",
  "[SEIS_SSH_SETUP.md](SEIS_SSH_SETUP.md)",
]);

const readme = requireIncludes("README.md", [
  "docs/GETTING_STARTED.md",
  "docs/TROUBLESHOOTING.md",
  "docs/PUBLIC_READINESS.md",
  "docs/OBSIDIAN_SECOND_BRAIN.md",
  "docs/LOCAL_AI_SETUP.md",
  "docs/SEIS_SSH_SETUP.md",
]);

const packageJson = JSON.parse(read("package.json") || "{}");
ensure(
  packageJson.scripts?.["check:seis-public-readiness"] ===
    "node scripts/check-seis-public-readiness.mjs",
  "package.json must expose check:seis-public-readiness",
);
ensure(
  packageJson.scripts?.["check:seis-public-readiness-docs"] ===
    "node scripts/check-seis-public-readiness-docs.mjs",
  "package.json must expose check:seis-public-readiness-docs",
);
ensure(
  packageJson.scripts?.["check:seis-env-example"] ===
    "node scripts/check-seis-env-example.mjs",
  "package.json must expose check:seis-env-example",
);
ensure(
  packageJson.scripts?.["check:seis-public-readiness-status"] ===
    "node scripts/check-seis-public-readiness-status.mjs",
  "package.json must expose check:seis-public-readiness-status",
);

const sensitivePatterns = [
  ["SSH private key", /BEGIN (OPENSSH|RSA|EC) PRIVATE KEY/],
  ["GitHub token", /ghp_|github_pat_/],
  ["OpenAI key assignment", /OPENAI_API_KEY=/],
  ["Anthropic key assignment", /ANTHROPIC_API_KEY=/],
  ["Gemini key assignment", /GEMINI_API_KEY=/],
  ["Private key assignment", /PRIVATE_KEY=/],
  ["AWS secret key", /AWS_SECRET_ACCESS_KEY/],
  ["Password assignment", /password=/i],
  ["Token assignment", /token=/i],
];

for (const [file, text] of [
  ["docs/GETTING_STARTED.md", gettingStarted],
  ["docs/TROUBLESHOOTING.md", troubleshooting],
  ["docs/PUBLIC_READINESS.md", publicReadiness],
  ["docs/OBSIDIAN_SECOND_BRAIN.md", obsidian],
  ["docs/LOCAL_AI_SETUP.md", localAI],
  ["docs/SEIS_SSH_SETUP.md", seisSSH],
  ["docs/INDEX.md", index],
  ["README.md", readme],
]) {
  for (const [label, pattern] of sensitivePatterns) {
    ensure(!pattern.test(text), `${file} must not include ${label}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS public readiness docs check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS public readiness docs check passed.");
