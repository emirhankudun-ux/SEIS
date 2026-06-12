import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const failures = [];

function read(relativePath) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function requireIncludes(file, text, reason = text) {
  const contents = read(file);
  if (!contents.includes(text)) {
    failures.push(`${file} must include ${reason}`);
  }
}

function requireNotIncludes(file, text, reason = text) {
  const contents = read(file);
  if (contents.includes(text)) {
    failures.push(`${file} must not include ${reason}`);
  }
}

function requireStartsWith(file, text) {
  const contents = read(file);
  if (!contents.startsWith(text)) {
    failures.push(`${file} must start with ${JSON.stringify(text)}`);
  }
}

requireStartsWith("README.md", "# SEIS\n");
for (const required of [
  "AI-native open source platform",
  "`main` is the only permanent branch",
  "MCP servers",
  "skills",
  "plugins",
  "LLM workflows",
  "GitHub Growth Strategy",
  "Unused SDKs, runtimes, and language toolchains are not installed by default",
  "OpenAI Codex / ChatGPT",
  "Claude"
]) {
  requireIncludes("README.md", required);
}
requireNotIncludes("README.md", "# SEIS CLOSED CODE", "closed-code title");

for (const [file, required] of [
  ["CONTRIBUTING.md", "`main` is the only permanent branch"],
  ["CONTRIBUTING.md", "Do not ask contributors to install every language toolchain"],
  ["CONTRIBUTING.md", "AI tools are allowed"],
  ["SECURITY.md", "Do not open a public issue for a vulnerability"],
  ["SECURITY.md", "MCP tools, plugins, and agent workflows"],
  ["CODE_OF_CONDUCT.md", "Contributor Covenant"],
  ["CONTRIBUTORS.md", "OpenAI Codex / ChatGPT"],
  ["CONTRIBUTORS.md", "Claude"],
  ["CONTRIBUTORS.md", "do not imply sponsorship"],
  ["docs/governance/branch-policy.md", "`main` is the only permanent branch"],
  ["docs/governance/open-source-governance.md", "GitHub Update Rule"],
  [".github/PULL_REQUEST_TEMPLATE.md", "Architecture Fit"],
  [".github/PULL_REQUEST_TEMPLATE.md", "Does not install unused SDKs"],
  [".github/ISSUE_TEMPLATE/feature_request.md", "Maintenance Cost"],
  [".github/ISSUE_TEMPLATE/bug_report.md", "follow `SECURITY.md`"]
]) {
  requireIncludes(file, required);
}

const license = read("LICENSE");
if (!license.startsWith("MIT License")) {
  failures.push("LICENSE must remain MIT unless the maintainer explicitly changes it");
}

const packageJson = JSON.parse(read("package.json") || "{}");
if (packageJson.scripts?.["check:open-source-governance"] !== "node scripts/check-open-source-governance.mjs") {
  failures.push("package.json must expose check:open-source-governance");
}

for (const workflow of [
  ".github/workflows/ci.yml",
  ".github/workflows/foundation-check.yml",
  ".github/workflows/seis-open-source-governance.yml"
]) {
  requireIncludes(workflow, "main");
  requireNotIncludes(workflow, "UIXAppTTR", "legacy UIXAppTTR branch trigger");
}

if (failures.length > 0) {
  console.error("SEIS open source governance check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS open source governance check passed.");
