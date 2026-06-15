import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "AGENTS.md",
  "CODEX.md",
  "CLAUDE.md",
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTORS.md",
  "LICENSE",
  "package.json",
  "apps/web/index.html",
  "apps/web/seis-cockpit.html",
  "apps/web/script.js",
  "apps/web/style.css",
  "apps/web/service-worker.js",
  "packages/seis-ai/bin/seis-check.mjs",
  "packages/seis-ai/bin/seis-agent.mjs",
  "packages/seis-ai/src/mcp/server.mjs",
  "mcp/seis-mcp-server.mjs",
  "plugins/seis/README.md",
  "script/build_and_run.sh",
  "docs/development/first-run-quickstart.md",
  "apps/macos/README.md",
  "docs/governance/branch-policy.md",
  "docs/governance/open-source-governance.md",
  "docs/governance/seis-supreme-v12-constitution.md",
  ".github/workflows/codeql.yml",
  "scripts/check-open-source-governance.mjs"
];

const requiredTextChecks = [
  ["README.md", "AI-native open source platform"],
  ["README.md", "`main` is the only permanent branch"],
  ["README.md", "MCP servers"],
  ["README.md", "first-run-quickstart.md"],
  ["README.md", "GitHub Growth Strategy"],
  ["README.md", "plugins/seis-ai-agent"],
  ["README.md", "Do not add filler code"],
  ["AGENTS.md", "Open Source Platform Direction"],
  ["AGENTS.md", "active GitHub development surface for SEIS"],
  ["CODEX.md", "GitHub -> Codex Cloud -> Branch -> Commit -> Pull Request -> Review -> Merge"],
  ["CODEX.md", "SEIS-Agent"],
  ["CODEX.md", "Ed25519"],
  ["CLAUDE.md", "Claude Code Guide"],
  ["docs/development/first-run-quickstart.md", "npm run quality"],
  ["docs/development/first-run-quickstart.md", "./script/build_and_run.sh --verify"],
  ["docs/development/first-run-quickstart.md", "Do not install Swift, Xcode, Android Studio"],
  ["apps/macos/README.md", "./script/build_and_run.sh --verify"],
  ["apps/macos/README.md", "SeisAppleNativeShell"],
  ["CONTRIBUTING.md", "Do not ask contributors to install every language toolchain"],
  ["SECURITY.md", "MCP tools, plugins, and agent workflows"],
  ["SECURITY.md", "GitHub CodeQL code scanning"],
  ["CONTRIBUTORS.md", "OpenAI Codex / ChatGPT"],
  ["CONTRIBUTORS.md", "Claude"],
  ["docs/governance/branch-policy.md", "`main` is the only permanent branch"],
  ["docs/governance/open-source-governance.md", "GitHub Update Rule"],
  ["docs/governance/open-source-governance.md", ".github/workflows/codeql.yml"],
  ["docs/governance/seis-supreme-v12-constitution.md", "open-source AI-native"],
  ["docs/polyglot/language-balance-plan.md", "GitHub Language Balance"],
  ["docs/polyglot/language-balance-plan.md", "Do not add filler code only to change language percentages"],
  ["package.json", "\"check:open-source-governance\""],
  [".github/workflows/ci.yml", "npm run check:open-source-governance"],
  [".github/workflows/seis-open-source-governance.yml", "SEIS Open Source Governance"]
];

const forbiddenTextChecks = [
  ["README.md", "# SEIS CLOSED CODE"],
  [".github/workflows/ci.yml", "UIXAppTTR"],
  [".github/workflows/foundation-check.yml", "UIXAppTTR"],
  [".github/workflows/seis-open-source-governance.yml", "UIXAppTTR"]
];

const failures = [];

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

for (const file of requiredFiles) {
  read(file);
}

for (const [file, needle] of requiredTextChecks) {
  const contents = read(file);
  if (contents && !contents.includes(needle)) {
    failures.push(`missing "${needle}" in ${file}`);
  }
}

for (const [file, needle] of forbiddenTextChecks) {
  const contents = read(file);
  if (contents.includes(needle)) {
    failures.push(`forbidden "${needle}" in ${file}`);
  }
}

const packageJson = JSON.parse(read("package.json") || "{}");
if (packageJson.scripts?.["check:foundation"] !== "node scripts/check-foundation.mjs") {
  failures.push("package.json must expose check:foundation");
}

if (failures.length > 0) {
  console.error("SEIS foundation check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS foundation check passed.");
