#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const paths = {
  program: "content/development/seis-ai-public-readiness-program.json",
  freshClone: "content/development/seis-ai-fresh-clone-readiness.json",
  githubGates: "content/development/seis-agi-github-user-readiness-gates.json",
  publicEvidence: "content/development/seis-agi-public-readiness-evidence.json",
  independentLedger: "content/development/seis-agi-independent-evidence-ledger.json",
  reportJson: "reports/seis-ai-public-readiness/latest.json",
  reportMarkdown: "reports/seis-ai-public-readiness/latest.md"
};

const existingReport = mode === "check" ? readOptionalJson(paths.reportJson) : null;
const generatedAt = mode === "check" && existingReport?.generatedAt ? existingReport.generatedAt : new Date().toISOString();

const program = readJson(paths.program, "AI public readiness program");
const freshClone = readJson(paths.freshClone, "AI fresh-clone readiness");
const githubGates = readJson(paths.githubGates, "AGI GitHub user readiness gates");
const publicEvidence = readJson(paths.publicEvidence, "AGI public readiness evidence");
const independentLedger = readJson(paths.independentLedger, "AGI independent evidence ledger");

if (!program || !freshClone || !githubGates || !publicEvidence || !independentLedger) {
  process.exit(1);
}

const report = buildReport({ generatedAt, program, freshClone, githubGates, publicEvidence, independentLedger });
const markdown = renderMarkdown(report);

if (mode === "write") {
  writeJson(paths.reportJson, report);
  writeText(paths.reportMarkdown, markdown);
  console.log("SEIS AI public readiness report generated.");
  console.log(JSON.stringify({ report: paths.reportJson, markdown: paths.reportMarkdown, status: "ok" }, null, 2));
} else {
  checkJson(paths.reportJson, report, "AI public readiness report JSON");
  checkText(paths.reportMarkdown, markdown, "AI public readiness report markdown");
  ensure(report.status === "local-demo-public-review-ready-not-agi", "report status mismatch");
  ensure(report.decision.githubReadyForEveryone === false, "report must not mark GitHub ready for everyone");
  ensure(report.decision.publicReadyAsAgi === false, "report must not mark public-ready as AGI");
  ensure(report.boundary.grantsAgiClaim === false, "report must not grant AGI claim");
  ensure(report.boundary.grants512bRouteEligibility === false, "report must not grant 512B route eligibility");
  ensure(report.blockers.some((blocker) => blocker.id === "fresh-clone-release-path"), "report must include fresh-clone blocker");
  ensure(report.blockers.some((blocker) => blocker.id === "real-512b-evidence"), "report must include real 512B evidence blocker");
  finish("SEIS AI public readiness report check passed.");
}

function buildReport({ generatedAt, program, freshClone, githubGates, publicEvidence, independentLedger }) {
  const blockers = [
    ...collectBlockingGates(program.readinessGates || [], "public-readiness-program"),
    ...collectBlockingGates(freshClone.freshCloneAcceptanceGates || [], "fresh-clone-readiness"),
    ...collectBlockingGates(githubGates.readinessGates || [], "github-user-readiness-gates")
  ];

  return {
    id: "seis-ai-public-readiness-report",
    generatedAt,
    status: program.status,
    sourceOfTruth: {
      program: paths.program,
      freshClone: paths.freshClone,
      githubGates: paths.githubGates,
      publicEvidence: paths.publicEvidence,
      independentLedger: paths.independentLedger
    },
    oneCommandReadinessValidator: program.oneCommandReadinessValidator,
    decision: {
      publicReadyForLocalDemo: program.publicReadyForLocalDemo === true,
      githubReadyForEveryone: program.githubReadyForEveryone === true,
      publicReadyAsAgi: program.publicReadyAsAgi === true,
      freshCloneVerified: freshClone.freshCloneVerified === true,
      routeEligibleToday: program.routeEligibleToday === true,
      runtimeAuthority: program.runtimeAuthority === true,
      agiClaimAllowed: publicEvidence.agiClaimAllowed === true
    },
    boundary: {
      installsModels: false,
      downloadsCheckpoints: false,
      trainsModels: false,
      callsProviders: false,
      provisionsCloudOrGpu: false,
      executesSsh: false,
      pushesOrMerges: false,
      deploysOrReleases: false,
      grantsAgiClaim: false,
      grants512bRouteEligibility: false
    },
    githubAudienceModes: program.githubAudienceModes || [],
    requiredFreshCloneCommands: freshClone.requiredFreshCloneCommands || [],
    requiredBeforeGithubReadyForEveryone: program.requiredBeforeGithubReadyForEveryone || [],
    requiredBeforeAnyAgiClaim: program.requiredBeforeAnyAgiClaim || [],
    blockers,
    evidenceLedger: {
      status: independentLedger.status,
      agiClaimAllowed: independentLedger.agiClaimAllowed,
      githubReadyForEveryone: independentLedger.githubReadyForEveryone
    },
    publicEvidenceSummary: publicEvidence.readinessSummary || {},
    internetResearchBaseline: program.internetResearchBaseline || [],
    nextSafeActions: program.nextSafeActions || []
  };
}

function collectBlockingGates(gates, source) {
  return gates
    .filter((gate) => gate.blocksGithubReadyForEveryone === true || gate.blocksGithubLocalDemo === true || gate.status === "missing" || gate.status === "approval-gated" || gate.status === "partial" || gate.status === "required-before-everyone-ready")
    .map((gate) => ({
      source,
      id: gate.id,
      status: gate.status,
      blocksGithubReadyForEveryone: gate.blocksGithubReadyForEveryone === true || gate.blocksGithubLocalDemo === true,
      blocksAgiClaim: gate.blocksAgiClaim === true,
      evidence: gate.evidence || gate.requiredEvidence || []
    }));
}

function renderMarkdown(report) {
  const blockerRows = report.blockers
    .map((blocker) => `| ${blocker.source} | ${blocker.id} | ${blocker.status} | ${blocker.blocksGithubReadyForEveryone} | ${blocker.blocksAgiClaim} |`)
    .join("\n");

  const commandRows = report.requiredFreshCloneCommands.map((command) => `- \`${command}\``).join("\n");
  const publicRequirements = report.requiredBeforeGithubReadyForEveryone.map((item) => `- ${item}`).join("\n");
  const agiRequirements = report.requiredBeforeAnyAgiClaim.map((item) => `- ${item}`).join("\n");
  const sourceRows = report.internetResearchBaseline.map((source) => `- ${source.id}: ${source.url}`).join("\n");

  return `# SEIS AI Public Readiness Report

Generated: ${report.generatedAt}

Status: \`${report.status}\`

## Decision

| Decision | Value |
| --- | --- |
| Public ready for Local Demo | ${report.decision.publicReadyForLocalDemo} |
| GitHub ready for everyone | ${report.decision.githubReadyForEveryone} |
| Public ready as AGI | ${report.decision.publicReadyAsAgi} |
| Fresh clone verified | ${report.decision.freshCloneVerified} |
| Route eligible today | ${report.decision.routeEligibleToday} |
| Runtime authority | ${report.decision.runtimeAuthority} |
| AGI claim allowed | ${report.decision.agiClaimAllowed} |

## One-Command Validator

\`${report.oneCommandReadinessValidator}\`

## Boundary

This report does not install models, download checkpoints, train models, call
providers, provision cloud/GPU resources, execute SSH, push, merge, deploy,
release, grant AGI status, or make the 512B route eligible.

## Fresh-Clone Commands

${commandRows}

## Blockers

| Source | Gate | Status | Blocks GitHub Everyone | Blocks AGI Claim |
| --- | --- | --- | --- | --- |
${blockerRows}

## Required Before GitHub Ready For Everyone

${publicRequirements}

## Required Before Any AGI Claim

${agiRequirements}

## Research Baseline

${sourceRows}
`;
}

function checkJson(relativePath, expected, label) {
  const actual = readJson(relativePath, label);
  if (!actual) return;
  if (stableStringify(actual) !== stableStringify(expected)) failures.push(`${label} is out of date: run npm run report:seis-ai-public-readiness`);
}

function checkText(relativePath, expected, label) {
  const actual = readText(relativePath, label);
  if (actual !== expected) failures.push(`${label} is out of date: run npm run report:seis-ai-public-readiness`);
}

function readOptionalJson(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return "";
  }
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} unreadable: ${error.message}`);
    return "";
  }
}

function writeJson(relativePath, value) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS AI public readiness report check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
