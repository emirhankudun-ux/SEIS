#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  readme: "seis-brain/README.md",
  index: "seis-brain/vault/00_Index/SEIS Brain Index.md",
  codex: "seis-brain/vault/12_Context_Packs/SEIS Codex Context.md",
  apple: "seis-brain/vault/12_Context_Packs/SEIS Apple Context.md",
  ssh: "seis-brain/vault/12_Context_Packs/SEIS SSH Context.md",
  obsidian: "seis-brain/vault/12_Context_Packs/SEIS Obsidian Context.md",
  demo: "seis-brain/vault/12_Context_Packs/SEIS Demo Context.md",
  publicReadiness: "seis-brain/vault/12_Context_Packs/SEIS Public Readiness Context.md",
  boundary: "seis-brain/vault/13_Public_Private_Boundaries/Public Safe Boundary.md",
  secondBrain: "content/development/seis-second-brain-system.json",
  productDocs: "docs/product/seis-second-brain.md",
  docsIndex: "docs/INDEX.md",
  packageJson: "package.json"
};

for (const [label, filePath] of Object.entries(files)) {
  ensureFile(filePath, label);
}

const readme = readText(files.readme, "SEIS Brain README");
const index = readText(files.index, "SEIS Brain index");
const codex = readText(files.codex, "Codex context pack");
const apple = readText(files.apple, "Apple context pack");
const ssh = readText(files.ssh, "SSH context pack");
const obsidian = readText(files.obsidian, "Obsidian context pack");
const demo = readText(files.demo, "Demo context pack");
const publicReadiness = readText(files.publicReadiness, "Public readiness context pack");
const boundary = readText(files.boundary, "public/private boundary");
const secondBrain = readJson(files.secondBrain, "Second Brain contract");
const productDocs = readText(files.productDocs, "Second Brain docs");
const docsIndex = readText(files.docsIndex, "docs index");
const packageJson = readJson(files.packageJson, "package.json");

for (const [label, text] of [
  ["readme", readme],
  ["index", index],
  ["codex", codex],
  ["apple", apple],
  ["ssh", ssh],
  ["obsidian", obsidian],
  ["demo", demo],
  ["publicReadiness", publicReadiness],
  ["boundary", boundary]
]) {
  ensure(text.includes("visibility: public"), `${label} must use public visibility frontmatter`);
  ensure(!text.includes("visibility: private"), `${label} must not be private`);
  validateNoSensitivePatterns(label, text);
}

for (const phrase of [
  "SEIS Brain",
  "public-safe",
  "not a private Obsidian vault import",
  "npm run check:seis-brain-context-packs"
]) {
  ensure(readme.includes(phrase), `README missing phrase: ${phrase}`);
}

for (const link of [
  "[[SEIS Codex Context]]",
  "[[SEIS Apple Context]]",
  "[[SEIS SSH Context]]",
  "[[SEIS Obsidian Context]]",
  "[[SEIS Demo Context]]",
  "[[SEIS Public Readiness Context]]",
  "[[Public Safe Boundary]]"
]) {
  ensure(index.includes(link), `index missing link: ${link}`);
}

for (const phrase of [
  "Codex remains the default repository writer",
  "swift test --package-path packages/seis_platform_swift",
  "git diff --check"
]) {
  ensure(codex.includes(phrase), `Codex context missing phrase: ${phrase}`);
}

for (const phrase of [
  "Apple-first",
  "packages/seis_platform_swift",
  "Xcode presence is not build or",
  "Do not add filler Swift files"
]) {
  ensure(apple.includes(phrase), `Apple context missing phrase: ${phrase}`);
}

for (const phrase of [
  "SEIS-SSH",
  "SEIS-SSH`",
  "does not prove live SSH access",
  "npm run check:seis-ssh-access-model",
  "Run SSH, deployment, push, merge, or release commands without explicit human"
]) {
  ensure(ssh.includes(phrase), `SSH context missing phrase: ${phrase}`);
}

for (const phrase of [
  "Obsidian-compatible",
  "Private Obsidian import remains planned-gated",
  "explicitly user-selected",
  "npm run check:seis-second-brain-readiness-contracts",
  "Publish imported material to GitHub without explicit approval"
]) {
  ensure(obsidian.includes(phrase), `Obsidian context missing phrase: ${phrase}`);
}

for (const phrase of [
  "Demo mode must work without provider keys",
  "mock provider metadata",
  "Require API keys for the core demo",
  "name any browser-smoke, deployment, provider, or SSH checks that were not run"
]) {
  ensure(demo.includes(phrase), `Demo context missing phrase: ${phrase}`);
}

for (const phrase of [
  "Public readiness means SEIS can be reviewed safely on GitHub",
  "not public/release ready merely because docs or local checks exist",
  "content/development/seis-public-demo-release-checklist-pr54.json",
  "Do not claim live SSH access from docs",
  "suggested PR title/body"
]) {
  ensure(publicReadiness.includes(phrase), `Public readiness context missing phrase: ${phrase}`);
}

for (const phrase of [
  "Real API keys",
  "SSH private keys",
  "Private Obsidian note bodies",
  "Unreviewed assistant output"
]) {
  ensure(boundary.includes(phrase), `boundary missing phrase: ${phrase}`);
}

if (secondBrain) {
  ensure(secondBrain.id === "seis-second-brain-system", "Second Brain contract id mismatch");
  ensure(secondBrain.securityBoundary?.storesSecrets === false, "Second Brain must not store secrets");
  ensure(secondBrain.securityBoundary?.githubMutation === false, "Second Brain must not mutate GitHub");
  ensure(secondBrain.obsidianBridge?.status === "planned", "Obsidian bridge must remain planned");
}

if (productDocs) {
  ensure(productDocs.includes("seis-brain/vault/12_Context_Packs"), "Second Brain docs must mention context-pack vault path");
  ensure(productDocs.includes("npm run check:seis-brain-context-packs"), "Second Brain docs must mention context-pack validator");
  ensure(productDocs.includes("SEIS-SSH"), "Second Brain docs must mention SEIS-SSH context pack");
  ensure(productDocs.includes("Obsidian"), "Second Brain docs must mention Obsidian context pack");
  ensure(productDocs.includes("Demo"), "Second Brain docs must mention Demo context pack");
  ensure(productDocs.includes("Public Readiness"), "Second Brain docs must mention Public Readiness context pack");
}

if (docsIndex) {
  ensure(docsIndex.includes("seis-brain/README.md"), "docs index must link SEIS Brain README");
  ensure(docsIndex.includes("SEIS Brain Context Packs"), "docs index must mention context packs");
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-brain-context-packs"] === "node scripts/check-seis-brain-context-packs.mjs",
    "package.json must expose check:seis-brain-context-packs"
  );
}

finish("SEIS Brain context packs check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    failures.push(`${label} missing: ${relativePath}`);
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function readJson(relativePath, label) {
  const text = readText(relativePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function validateNoSensitivePatterns(label, text) {
  const privateKeyPattern = new RegExp("BEGIN " + "(OPENSSH|RSA|EC)" + " PRIVATE KEY");
  const githubTokenPattern = new RegExp("ghp" + "_|" + "github" + "_pat" + "_");
  const apiKeyAssignmentPattern = new RegExp(
    "(?:" +
      ["OPENAI", "ANTHROPIC", "GEMINI"].map((provider) => provider + "_API" + "_KEY").join("|") +
      "|" +
      "PRIVATE" +
      "_KEY" +
      "|" +
      "AWS" +
      "_SECRET" +
      "_ACCESS" +
      "_KEY" +
      ")="
  );
  const passwordAssignmentPattern = new RegExp("password" + "=", "i");
  const tokenAssignmentPattern = new RegExp("token" + "=", "i");

  for (const [kind, pattern] of [
    ["private key block", privateKeyPattern],
    ["GitHub token", githubTokenPattern],
    ["API key assignment", apiKeyAssignmentPattern],
    ["password assignment", passwordAssignmentPattern],
    ["token assignment", tokenAssignmentPattern]
  ]) {
    ensure(!pattern.test(text), `${label} contains sensitive pattern category: ${kind}`);
  }
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS Brain context packs check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
