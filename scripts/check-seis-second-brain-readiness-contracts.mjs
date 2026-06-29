#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  obsidianContract: "content/development/seis-obsidian-bridge-safe-import-contract.json",
  accessibilityContract: "content/development/seis-second-brain-accessibility-focus-qa.json",
  routerContract: "content/development/seis-read-only-model-router-contract.json",
  releaseChecklist: "content/development/seis-public-demo-release-checklist-pr54.json",
  obsidianDoc: "docs/product/seis-obsidian-bridge-safe-import.md",
  accessibilityDoc: "docs/reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md",
  routerDoc: "docs/ai/read-only-model-router-contract.md",
  releaseDoc: "docs/releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md",
  secondBrainDoc: "docs/product/seis-second-brain.md",
  modelRouterDoc: "docs/ai/model-router.md",
  desktopJs: "apps/web/desktop.js",
  desktopCss: "apps/web/desktop.css",
  packageJson: "package.json",
  status: "docs/STATUS.md",
  index: "docs/INDEX.md",
  masterIndex: "docs/SEIS_MASTER_INDEX.md",
  backlog: "docs/roadmap/MASTER_BACKLOG.md",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  readme: "README.md"
};

for (const [label, filePath] of Object.entries(paths)) {
  ensureFile(filePath, label);
}

const obsidianContract = readJson(paths.obsidianContract, "Obsidian bridge safe import contract");
const accessibilityContract = readJson(paths.accessibilityContract, "Second Brain accessibility focus QA contract");
const routerContract = readJson(paths.routerContract, "read-only model-router contract");
const releaseChecklist = readJson(paths.releaseChecklist, "PR 54 public demo release checklist");
const desktopJs = readText(paths.desktopJs, "Desktop runtime");
const desktopCss = readText(paths.desktopCss, "Desktop styles");
const packageJson = readJson(paths.packageJson, "package.json");

if (obsidianContract) validateObsidianContract(obsidianContract);
if (accessibilityContract) validateAccessibilityContract(accessibilityContract);
if (routerContract) validateRouterContract(routerContract);
if (releaseChecklist) validateReleaseChecklist(releaseChecklist);
if (packageJson) validatePackage(packageJson);
validateDesktopAccessibility(desktopJs, desktopCss);
validateDocsAndIndexes();
validateNoSecrets();

if (failures.length > 0) {
  console.error("SEIS Second Brain readiness contracts check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Second Brain readiness contracts check passed.");

function validateObsidianContract(contract) {
  ensure(contract.id === "seis-obsidian-bridge-safe-import-contract", "Obsidian contract id mismatch.");
  ensure(contract.status === "planned-gated", "Obsidian bridge must stay planned-gated.");
  ensure(contract.mode === "explicit-user-selected-import-only", "Obsidian import mode must require explicit user selection.");
  ensure(
    contract.qualityGate === "npm run check:seis-second-brain-readiness-contracts",
    "Obsidian contract must point at the readiness contracts quality gate."
  );
  ensure(contract.currentRuntime?.privateVaultImportEnabled === false, "Private vault import must remain disabled.");
  ensure(contract.currentRuntime?.hostVaultReadEnabled === false, "Host vault reads must remain disabled.");
  ensure(contract.currentRuntime?.externalMutationEnabled === false, "External mutation must remain disabled.");
  ensureIncludes(contract.requiredGates, "explicit user-selected source path", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "dry-run manifest before any import", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "no secret values copied", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "no private note body committed", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "provenance record for every imported note", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "human approval before GitHub publication", "Obsidian required gates");
  ensureIncludes(contract.forbiddenActions, "automatic home-directory vault discovery", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "automatic Obsidian plugin installation", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "committing private note body content", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "copying .obsidian workspace state", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "sending imported note content to AI providers", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "GitHub push, merge, release, or Pages publication without explicit approval", "Obsidian forbidden actions");
}

function validateAccessibilityContract(contract) {
  ensure(contract.id === "seis-second-brain-accessibility-focus-qa", "Accessibility QA contract id mismatch.");
  ensure(contract.status === "contract-active", "Accessibility QA contract must be active.");
  ensure(
    contract.linkedSmoke === "npm run check:seis-second-brain-browser-smoke",
    "Accessibility QA contract must reference the Second Brain browser smoke."
  );
  ensure(contract.selectors?.root === "[data-second-brain-app]", "Accessibility root selector mismatch.");
  ensure(contract.selectors?.noteList === ".second-brain-note-list[role=\"listbox\"]", "Accessibility note list selector mismatch.");
  ensure(contract.selectors?.noteOption === ".second-brain-note-list [role=\"option\"]", "Accessibility note option selector mismatch.");
  ensure(contract.selectors?.graphList === ".second-brain-graph[role=\"listbox\"]", "Accessibility graph selector mismatch.");
  ensure(contract.selectors?.graphOption === ".second-brain-graph [role=\"option\"]", "Accessibility graph option selector mismatch.");
  ensure(contract.selectors?.inspector === "#second-brain-inspector-panel[data-second-brain-inspector]", "Accessibility inspector selector mismatch.");
  for (const phrase of [
    "role=listbox",
    "role=option",
    "aria-selected",
    "aria-controls",
    "aria-live polite",
    "focus-visible",
    "zero cramped or overlapping controls"
  ]) {
    ensureIncludes(contract.acceptanceCriteria, phrase, "Accessibility acceptance criteria");
  }
}

function validateRouterContract(contract) {
  ensure(contract.id === "seis-read-only-model-router-contract", "Read-only model-router contract id mismatch.");
  ensure(contract.status === "planned-read-only-contract", "Read-only model-router contract status mismatch.");
  for (const [key, expected] of [
    ["runtimeAuthority", false],
    ["providerCalls", false],
    ["credentialValidation", false],
    ["browserSecrets", false],
    ["silentFallback", false],
    ["localOnlyCanUseCloud", false]
  ]) {
    const value = contract.boundary?.[key] ?? contract[key];
    ensure(value === expected, `Model-router boundary ${key} must be ${expected}.`);
  }
  for (const state of ["Local Demo", "Available", "Missing Key", "Disabled", "Rate Limited", "Error", "Unknown"]) {
    ensureIncludes(contract.providerStates, state, "Model-router provider states");
  }
  for (const rule of [
    "Local-only mode never routes to cloud providers.",
    "Missing Key is not Error",
    "Live execution stays blocked until backend-only provider mediation exists."
  ]) {
    ensureIncludes(contract.routingRules, rule, "Model-router routing rules");
  }
  ensureArrayMin(contract.blockedModelClasses, 6, "blockedModelClasses");
  ensureListEntryContains(contract.blockedModelClasses, "150B", "blockedModelClasses");
  ensureListEntryContains(contract.blockedModelClasses, "512B", "blockedModelClasses");
}

function validateReleaseChecklist(checklist) {
  ensure(checklist.id === "seis-public-demo-release-checklist-pr54", "PR 54 release checklist id mismatch.");
  ensure(checklist.status === "review-gated-not-released", "PR 54 release checklist must stay review-gated.");
  ensure(checklist.pullRequest?.number === 54, "PR number must be 54.");
  ensure(checklist.pullRequest?.url === "https://github.com/emirhankudun-ux/SEIS/pull/54", "PR 54 URL mismatch.");
  ensure(checklist.pullRequest?.base === "main", "PR 54 base branch must be main.");
  ensure(checklist.pullRequest?.head === "codex/seis-demo-github-upload-20260624", "PR 54 head branch mismatch.");
  for (const action of [
    "merge to main",
    "GitHub Pages publication",
    "Obsidian private vault import",
    "live provider routing",
    "SSH execution",
    "deployment"
  ]) {
    ensureListEntryContains(checklist.blockedActions, action, "PR 54 blocked actions");
  }
  for (const gate of [
    "npm run check:seis-second-brain-readiness-contracts",
    "npm run check:product-experience-browser-smoke",
    "npm test",
    "git diff --check"
  ]) {
    ensureIncludes(checklist.requiredValidation, gate, "PR 54 required validation");
  }
}

function validatePackage(packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-second-brain-readiness-contracts"] ===
      "node scripts/check-seis-second-brain-readiness-contracts.mjs",
    "package.json must expose check:seis-second-brain-readiness-contracts."
  );
}

function validateDesktopAccessibility(js, css) {
  for (const phrase of [
    "role=\"listbox\"",
    "role=\"option\"",
    "aria-selected",
    "aria-controls=\"second-brain-inspector-panel\"",
    "aria-live=\"polite\"",
    "tabindex=\"0\"",
    "focusSecondBrainInspector",
    "aria-activedescendant",
    "second-brain-inspector-heading"
  ]) {
    ensure(js.includes(phrase), `desktop.js missing accessibility marker: ${phrase}`);
  }
  for (const phrase of [":focus-visible", "[tabindex]:focus-visible"]) {
    ensure(css.includes(phrase), `desktop.css missing focus style marker: ${phrase}`);
  }
}

function validateDocsAndIndexes() {
  const requiredPhrases = [
    [paths.obsidianDoc, ["Obsidian Bridge Safe Import", "planned-gated", "No private note body", "npm run check:seis-second-brain-readiness-contracts"]],
    [paths.accessibilityDoc, ["Second Brain Accessibility Focus QA", "role=listbox", "focus-visible", "npm run check:seis-second-brain-browser-smoke"]],
    [paths.routerDoc, ["Read-Only Model Router Contract", "Missing Key is not Error", "backend-only provider mediation", "npm run check:seis-second-brain-readiness-contracts"]],
    [paths.releaseDoc, ["Public Demo Release Checklist", "PR #54", "review-gated-not-released", "Do not merge"]],
    [paths.secondBrainDoc, ["Obsidian bridge safe import contract", "Second Brain accessibility/focus QA", "npm run check:seis-second-brain-readiness-contracts"]],
    [paths.modelRouterDoc, ["read-only model-router contract", "Provider-neutral", "Missing Key is not Error"]],
    [paths.status, ["SEIS Second Brain readiness contracts", "Obsidian bridge safe import", "PR #54 public demo release checklist"]],
    [paths.index, ["SEIS Obsidian Bridge Safe Import", "Second Brain Accessibility Focus QA", "Read-Only Model Router Contract", "Public Demo Release Checklist PR54"]],
    [paths.masterIndex, ["SEIS Obsidian Bridge Safe Import", "Second Brain Accessibility Focus QA", "Read-Only Model Router Contract", "Public Demo Release Checklist PR54"]],
    [paths.backlog, ["Obsidian bridge safe import", "Second Brain accessibility/focus QA", "read-only model-router contract", "PR #54 public demo release checklist"]],
    [paths.nextQueue, ["Obsidian bridge safe import", "Second Brain accessibility/focus QA", "read-only model-router contract", "PR #54 public demo release checklist"]],
    [paths.readme, ["check:seis-second-brain-readiness-contracts", "Second Brain readiness contracts"]]
  ];

  for (const [filePath, phrases] of requiredPhrases) {
    const text = readText(filePath, filePath);
    for (const phrase of phrases) {
      ensure(text.includes(phrase), `${filePath} missing phrase: ${phrase}`);
    }
  }
}

function validateNoSecrets() {
  for (const filePath of [
    paths.obsidianContract,
    paths.accessibilityContract,
    paths.routerContract,
    paths.releaseChecklist,
    paths.obsidianDoc,
    paths.accessibilityDoc,
    paths.routerDoc,
    paths.releaseDoc,
    paths.secondBrainDoc,
    paths.modelRouterDoc,
    paths.status,
    paths.index,
    paths.masterIndex,
    paths.backlog,
    paths.nextQueue,
    paths.readme,
    "scripts/check-seis-second-brain-readiness-contracts.mjs"
  ]) {
    requireNotMatches(filePath, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
    requireNotMatches(filePath, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
    requireNotMatches(filePath, /\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function ensureArrayMin(value, minimum, label) {
  ensure(Array.isArray(value), `${label} must be an array.`);
  ensure(Array.isArray(value) && value.length >= minimum, `${label} must include at least ${minimum} records.`);
}

function ensureIncludes(values, expected, label) {
  ensure(Array.isArray(values), `${label} must be an array.`);
  ensure(Array.isArray(values) && values.includes(expected), `${label} missing ${expected}.`);
}

function ensureListEntryContains(values, expected, label) {
  ensure(Array.isArray(values), `${label} must be an array.`);
  ensure(
    Array.isArray(values) && values.some((value) => String(value).includes(expected)),
    `${label} missing entry containing ${expected}.`
  );
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) return "";
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`unable to read ${label}: ${error.message}`);
    return "";
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}

function requireNotMatches(filePath, pattern, label) {
  const text = readText(filePath, filePath);
  if (pattern.test(text)) failures.push(`${filePath} contains ${label}.`);
}
