#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const shouldWrite = Boolean(args.write);
const shouldCheck = Boolean(args.check);

const paths = {
  accessibilityContract: "content/development/seis-second-brain-accessibility-focus-qa.json",
  secondBrain: "content/development/seis-second-brain-system.json",
  desktopJs: "apps/web/desktop.js",
  desktopCss: "apps/web/desktop.css",
  browserSmoke: "scripts/check-seis-second-brain-browser-smoke.mjs",
  evidenceManifest: "reports/seis-public-demo/evidence-manifest-latest.json",
  outputJson: typeof args.output === "string" ? args.output : "reports/seis-public-demo/second-brain-accessibility-focus-latest.json",
  outputMarkdown: typeof args.markdown === "string" ? args.markdown : "reports/seis-public-demo/second-brain-accessibility-focus-latest.md"
};

const failures = [];

const contract = readJson(paths.accessibilityContract, "Second Brain accessibility/focus QA contract");
const secondBrain = readJson(paths.secondBrain, "Second Brain contract");
const desktopJs = readText(paths.desktopJs, "Desktop runtime");
const desktopCss = readText(paths.desktopCss, "Desktop CSS");
const browserSmoke = readText(paths.browserSmoke, "Second Brain browser smoke");
const evidenceManifest = fs.existsSync(path.join(root, paths.evidenceManifest))
  ? readJson(paths.evidenceManifest, "public demo evidence manifest")
  : null;

const report = buildReport(contract, secondBrain, desktopJs, desktopCss, browserSmoke, evidenceManifest, new Date().toISOString());
validateReport(report, contract, "generated accessibility/focus report");

if (shouldWrite) {
  writeJson(paths.outputJson, report);
  writeText(paths.outputMarkdown, renderMarkdown(report));
}

if (shouldCheck) {
  ensureFile(paths.outputJson, "Second Brain accessibility/focus JSON artifact");
  ensureFile(paths.outputMarkdown, "Second Brain accessibility/focus Markdown artifact");
  const existingJson = readJson(paths.outputJson, "Second Brain accessibility/focus JSON artifact");
  const existingMarkdown = readText(paths.outputMarkdown, "Second Brain accessibility/focus Markdown artifact");
  if (existingJson) validateReport(existingJson, contract, "existing accessibility/focus artifact");
  for (const phrase of [
    "SEIS Second Brain Accessibility Focus QA",
    "manual keyboard transcript",
    "screen-reader transcript",
    "human accessibility review approval",
    "NO-GO-human-accessibility-review-required",
    "No private Obsidian import, provider call, SSH, GitHub mutation, or deployment is performed"
  ]) {
    ensure(existingMarkdown.includes(phrase), `Markdown artifact missing phrase: ${phrase}.`);
  }
}

if (failures.length > 0) {
  console.error("SEIS Second Brain accessibility/focus QA check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (shouldWrite) {
  console.log(`Wrote ${paths.outputJson}`);
  console.log(`Wrote ${paths.outputMarkdown}`);
} else if (shouldCheck) {
  console.log("SEIS Second Brain accessibility/focus QA check passed.");
} else {
  console.log(JSON.stringify(report, null, 2));
}

function buildReport(accessibilityContract, secondBrainContract, js, css, smoke, manifest, generatedAt) {
  const browserSmokeItem = (manifest?.items || []).find((item) => item.id === "current-browser-smoke");
  const browserSmokePassed = browserSmokeItem?.status === "passed";
  const markerChecks = {
    rootSelector: js.includes("data-second-brain-app"),
    noteListRole: js.includes("role=\"listbox\"") && js.includes("Second Brain Markdown notes"),
    noteOptionRole: js.includes("role=\"option\"") && js.includes("aria-selected"),
    graphListRole: js.includes("Second Brain knowledge graph") && js.includes("aria-activedescendant"),
    graphOptionControls: js.includes("aria-controls=\"second-brain-inspector-panel\""),
    inspectorLive: js.includes("data-second-brain-inspector") && js.includes("aria-live=\"polite\""),
    inspectorFocusable: js.includes("tabindex=\"0\"") && js.includes("focusSecondBrainInspector"),
    visibleFocusCss: css.includes(":focus-visible") && css.includes("[tabindex]:focus-visible"),
    noClaimBoundaryCopy: js.includes("No Obsidian plugin install") && js.includes("credential access"),
    mobileSmokeTargetAudit: smoke.includes("targetCount >= 10") && smoke.includes("crampedTargets <= 4") && smoke.includes("horizontalOverflow")
  };

  const automatedEvidence = Object.entries(markerChecks).map(([id, passed]) => ({
    id,
    status: passed ? "passed" : "failed",
    source: id === "visibleFocusCss" ? paths.desktopCss : id === "mobileSmokeTargetAudit" ? paths.browserSmoke : paths.desktopJs
  }));

  const requiredEvidence = [
    {
      id: "current-browser-smoke-result",
      requirement: "current browser smoke result",
      status: browserSmokePassed ? "passed" : "blocked",
      evidence: browserSmokePassed ? paths.evidenceManifest : "Run npm run check:seis-second-brain-browser-smoke and regenerate go/no-go evidence."
    },
    {
      id: "manual-keyboard-transcript",
      requirement: "manual keyboard transcript",
      status: "blocked",
      evidence: "Human keyboard-only transcript required before public release."
    },
    {
      id: "screen-reader-transcript",
      requirement: "screen-reader transcript",
      status: "blocked",
      evidence: "Human screen-reader transcript required before public release."
    },
    {
      id: "mobile-viewport-target-audit",
      requirement: "mobile viewport target audit",
      status: markerChecks.mobileSmokeTargetAudit && browserSmokePassed ? "passed" : "blocked",
      evidence: markerChecks.mobileSmokeTargetAudit ? paths.browserSmoke : "Dedicated mobile target audit missing."
    },
    {
      id: "reduced-motion-review-note",
      requirement: "reduced-motion review note",
      status: "blocked",
      evidence: "Human reduced-motion review note required before public release."
    },
    {
      id: "human-accessibility-review-approval",
      requirement: "human accessibility review approval",
      status: "blocked",
      evidence: "Explicit human accessibility approval required before public release."
    }
  ];

  return {
    id: "seis-second-brain-accessibility-focus-qa-pr54",
    title: "SEIS Second Brain Accessibility Focus QA",
    generatedAt,
    status: "review-gated-human-accessibility-needed",
    mode: "repo-static-and-browser-smoke-evidence",
    decision: "NO-GO-human-accessibility-review-required",
    contractPath: paths.accessibilityContract,
    secondBrainPath: paths.secondBrain,
    linkedSmoke: accessibilityContract?.linkedSmoke || accessibilityContract?.linkedBrowserSmoke,
    selectors: accessibilityContract?.selectors || {},
    focusOrder: accessibilityContract?.focusOrder || [],
    installedAiProfileCount: secondBrainContract?.installedAiProfiles?.length || 0,
    managedSubAgentLaneCount: secondBrainContract?.managedSubAgentLanes?.length || 0,
    autonomousAgentRosterCount: secondBrainContract?.autonomousAgentRoster?.length || 0,
    automatedEvidence,
    requiredEvidence,
    summary: {
      automatedPassed: automatedEvidence.filter((item) => item.status === "passed").length,
      automatedFailed: automatedEvidence.filter((item) => item.status === "failed").length,
      requiredPassed: requiredEvidence.filter((item) => item.status === "passed").length,
      requiredBlocked: requiredEvidence.filter((item) => item.status === "blocked").length
    },
    safetyBoundary: {
      privateObsidianImportPerformed: false,
      providerCallsPerformed: false,
      credentialAccessPerformed: false,
      sshExecuted: false,
      deploymentPerformed: false,
      githubMutationPerformed: false,
      releaseApprovalGranted: false
    }
  };
}

function validateReport(value, accessibilityContract, label) {
  ensure(value?.id === "seis-second-brain-accessibility-focus-qa-pr54", `${label} id mismatch.`);
  ensure(value?.title === "SEIS Second Brain Accessibility Focus QA", `${label} title mismatch.`);
  ensure(value?.status === "review-gated-human-accessibility-needed", `${label} status mismatch.`);
  ensure(value?.mode === "repo-static-and-browser-smoke-evidence", `${label} mode mismatch.`);
  ensure(value?.decision === "NO-GO-human-accessibility-review-required", `${label} decision must block public release.`);
  ensure(value?.contractPath === paths.accessibilityContract, `${label} contract path mismatch.`);
  ensure(value?.secondBrainPath === paths.secondBrain, `${label} Second Brain path mismatch.`);
  ensure(value?.linkedSmoke === "npm run check:seis-second-brain-browser-smoke", `${label} linked smoke mismatch.`);
  ensure(value?.installedAiProfileCount >= 6, `${label} installed AI profile count too low.`);
  ensure(value?.managedSubAgentLaneCount >= 6, `${label} managed sub-agent lane count too low.`);
  ensure(value?.autonomousAgentRosterCount >= 12, `${label} autonomous agent roster count too low.`);
  ensure(Array.isArray(value?.automatedEvidence) && value.automatedEvidence.length >= 10, `${label} automated evidence missing.`);
  ensure(Array.isArray(value?.requiredEvidence) && value.requiredEvidence.length >= 6, `${label} required evidence missing.`);
  ensure(value?.summary?.automatedFailed === 0, `${label} automated evidence must have zero failed items.`);
  ensure(value?.summary?.requiredBlocked >= 3, `${label} required evidence must keep manual review blockers visible.`);
  for (const required of accessibilityContract?.evidenceRequiredBeforePublicDemo || []) {
    ensure(
      (value.requiredEvidence || []).some((item) => item.requirement === required),
      `${label} missing required evidence item: ${required}.`
    );
  }
  for (const [key, expected] of [
    ["privateObsidianImportPerformed", false],
    ["providerCallsPerformed", false],
    ["credentialAccessPerformed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["githubMutationPerformed", false],
    ["releaseApprovalGranted", false]
  ]) {
    ensure(value?.safetyBoundary?.[key] === expected, `${label} safetyBoundary.${key} must be ${expected}.`);
  }
  ensure((value.requiredEvidence || []).some((item) => item.id === "manual-keyboard-transcript" && item.status === "blocked"), `${label} must block manual keyboard transcript.`);
  ensure((value.requiredEvidence || []).some((item) => item.id === "screen-reader-transcript" && item.status === "blocked"), `${label} must block screen-reader transcript.`);
  ensure((value.requiredEvidence || []).some((item) => item.id === "human-accessibility-review-approval" && item.status === "blocked"), `${label} must block human accessibility approval.`);
  const serialized = JSON.stringify(value);
  ensure(!serialized.includes("file://"), `${label} must not include file:// paths.`);
  ensure(!serialized.includes("/Users/"), `${label} must not include absolute private /Users paths.`);
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), `${label} must not contain OpenAI-style API keys.`);
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), `${label} must not contain private keys.`);
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), `${label} must not contain inline credential assignments.`);
}

function renderMarkdown(value) {
  const automatedRows = value.automatedEvidence
    .map((item) => `| ${item.id} | ${item.status} | ${item.source} |`)
    .join("\n");
  const requiredRows = value.requiredEvidence
    .map((item) => `| ${item.requirement} | ${item.status} | ${item.evidence} |`)
    .join("\n");

  return `# SEIS Second Brain Accessibility Focus QA

Generated: ${value.generatedAt}
Status: ${value.status}
Mode: ${value.mode}
Decision: ${value.decision}

No private Obsidian import, provider call, SSH, GitHub mutation, or deployment is performed by this artifact.

## Scope

This report validates repo-static accessibility markers and the dedicated
Second Brain browser-smoke coverage contract. It does not claim that manual
keyboard, screen-reader, reduced-motion, mobile assistive-technology, or human
accessibility approval work is complete.

## Automated Evidence

| Check | Status | Source |
| --- | --- | --- |
${automatedRows}

## Public Demo Evidence Required

| Requirement | Status | Evidence |
| --- | --- | --- |
${requiredRows}

## Safety Boundary

- privateObsidianImportPerformed: ${value.safetyBoundary.privateObsidianImportPerformed}
- providerCallsPerformed: ${value.safetyBoundary.providerCallsPerformed}
- credentialAccessPerformed: ${value.safetyBoundary.credentialAccessPerformed}
- sshExecuted: ${value.safetyBoundary.sshExecuted}
- deploymentPerformed: ${value.safetyBoundary.deploymentPerformed}
- githubMutationPerformed: ${value.safetyBoundary.githubMutationPerformed}
- releaseApprovalGranted: ${value.safetyBoundary.releaseApprovalGranted}
`;
}

function parseArgs(values) {
  return values.reduce((acc, value, index) => {
    if (!value.startsWith("--")) return acc;
    const key = value.slice(2);
    const next = values[index + 1];
    acc[key] = next && !next.startsWith("--") ? next : true;
    return acc;
  }, {});
}

function safeOutputPath(targetPath) {
  const absolutePath = path.resolve(root, targetPath);
  const relativePath = path.relative(root, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    failures.push(`refusing to write outside repository: ${targetPath}`);
    return path.join(root, "reports", "seis-public-demo", "second-brain-accessibility-focus-refused-output.txt");
  }
  return absolutePath;
}

function writeJson(filePath, value) {
  const absolutePath = safeOutputPath(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  const absolutePath = safeOutputPath(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${label}: ${filePath}`);
    return "";
  }
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
