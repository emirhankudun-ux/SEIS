#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const requireReady = Boolean(args["require-ready"]);
const outputJson = args.output || "reports/seis-ssh-direct-cloud-readiness-claim.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-direct-cloud-readiness-claim.md";
const ownerPreflightPath = args["owner-preflight"] || "reports/seis-ssh-oracle-owner-preflight.json";
const readinessReportPath = args["readiness-report"] || "reports/seis-ssh-mobile-24x7-readiness.json";

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = buildReport();

if (write) {
  writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(report));
}

if (!write) console.log(JSON.stringify(report, null, 2));

if (check && report.integrityBlockers.length > 0) process.exit(1);
if (requireReady && !report.claimAllowed) process.exit(1);

function buildReport() {
  const integrityBlockers = [];
  const packageJson = readJson("package.json", integrityBlockers);
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const contract = readJson("content/development/seis-ssh-mobile-direct-cloud-contract.json", integrityBlockers);
  const ledger = readJson("content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json", integrityBlockers);
  const ownerPreflight = readJsonOptional(ownerPreflightPath);
  const readinessReport = readJsonOptional(readinessReportPath);

  if (packageJson?.scripts?.["check:seis-ssh-direct-cloud-readiness-claim"] !== "node scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-direct-cloud-readiness-claim must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:direct-cloud:claim"] !== "node scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:direct-cloud:claim must be declared");
  }
  if (matrix?.readinessClaimGate?.script !== "scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs") {
    integrityBlockers.push("provider matrix must link direct-cloud readiness claim gate script");
  }
  if (matrix?.readinessClaimGate?.callsProviderApis !== false || matrix?.readinessClaimGate?.opensSshSession !== false) {
    integrityBlockers.push("readiness claim gate must remain local-only and non-mutating");
  }
  if (contract?.readiness?.claimCommand !== "npm run cloud:ssh:direct-cloud:claim") {
    integrityBlockers.push("mobile direct-cloud contract must link readiness claim command");
  }
  if (!Array.isArray(contract?.evidenceSurfaces) || !contract.evidenceSurfaces.includes("scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs")) {
    integrityBlockers.push("mobile direct-cloud contract must cite readiness claim script");
  }
  const ledgerEvidenceIds = new Set((ledger?.evidenceMap || []).map((entry) => entry.id));
  if (!ledgerEvidenceIds.has("readiness-claim-gate")) {
    integrityBlockers.push("acceptance ledger must include readiness-claim-gate evidence");
  }

  const gates = [
    gate("owner-preflight-report", ownerPreflight.present, ownerPreflightPath, "Oracle owner preflight report exists"),
    gate(
      "owner-direct-endpoint-present",
      ownerPreflight.value?.readiness?.directEndpointPresent === true,
      ownerPreflightPath,
      "Oracle owner preflight has a post-boot endpoint hint"
    ),
    gate(
      "owner-ready-to-run-template",
      ownerPreflight.value?.readiness?.readyToRunOwnerLaunchTemplate === true || ownerPreflight.value?.readiness?.directEndpointPresent === true,
      ownerPreflightPath,
      "Oracle owner preflight has launch inputs or post-boot endpoint continuity"
    ),
    gate("strict-doctor-report", readinessReport.present, readinessReportPath, "strict doctor report exists"),
    gate("strict-doctor-ok", readinessReport.value?.ok === true, readinessReportPath, "strict doctor passed"),
    gate("direct-cloud-transport", readinessReport.value?.transport === "direct-cloud", readinessReportPath, "transport is direct-cloud"),
    gate("picker-compatible", readinessReport.value?.pickerCompatible === true, readinessReportPath, "generic SSH picker compatibility is proven"),
    gate("mobile-compatible", readinessReport.value?.mobile24x7Compatible === true, readinessReportPath, "mobile 24x7 compatibility is proven"),
    gate(
      "runtime-checks-present",
      readinessReport.value?.checks?.sshAuth?.authenticated === true && readinessReport.value?.checks?.remoteRuntime?.online === true,
      readinessReportPath,
      "SSH auth and remote runtime are proven"
    )
  ];

  const claimAllowed = integrityBlockers.length === 0 && gates.every((item) => item.passed);
  const blockers = [
    ...integrityBlockers,
    ...gates.filter((item) => !item.passed).map((item) => `${item.id}: ${item.description}`)
  ];

  return {
    id: "seis-ssh-direct-cloud-readiness-claim",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    claim: "SEIS-SSH is ChatGPT mobile/Codex 24x7 ready",
    claimAllowed,
    status: claimAllowed ? "ready-claim-allowed" : "blocked-missing-live-evidence",
    targetAlias: "SEIS-SSH",
    mode: "local-claim-gate-no-provider-api-no-live-ssh-no-config-write",
    providerPath: "oracle-cloud-free-tier -> direct-cloud SSH -> optional Cloudflare Access layer -> SEIS-SSH",
    evidenceSources: {
      ownerPreflight: ownerPreflightPath,
      strictDoctorReport: readinessReportPath,
      providerMatrix: "deploy/seis-ssh-direct-cloud-provider-matrix.json",
      mobileContract: "content/development/seis-ssh-mobile-direct-cloud-contract.json",
      acceptanceLedger: "content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json"
    },
    sourceStatus: {
      ownerPreflightPresent: ownerPreflight.present,
      ownerPreflightStatus: ownerPreflight.value?.status || null,
      strictDoctorReportPresent: readinessReport.present,
      strictDoctorStatus: readinessReport.value?.status || null,
      strictDoctorTransport: readinessReport.value?.transport || null
    },
    gates,
    blockers,
    integrityBlockers,
    commands: {
      ownerPreflight: "npm run cloud:ssh:oracle-owner:preflight",
      strictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
      strictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict",
      claimGate: "npm run cloud:ssh:direct-cloud:claim",
      claimGateStrict: "node scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs --write --require-ready"
    },
    nonEvidence: [
      "A green provider matrix check does not prove the VM is reachable.",
      "A local Oracle launch plan does not prove the VM exists.",
      "Owner preflight without a strict doctor report does not prove mobile 24x7 readiness.",
      "Codespaces transport does not prove direct-cloud mobile readiness.",
      ...((ledger?.nonEvidence || []).filter((item) => typeof item === "string"))
    ],
    safety: [
      "This script reads local reports and contracts only.",
      "This script does not call provider APIs, create VMs, open SSH, write SSH config, or print endpoints in full.",
      "Private keys, provider tokens, OCIDs, public IPs, and hostnames must remain outside public git output.",
      "The readiness claim stays blocked until strict probe and strict doctor evidence exists."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function gate(id, passed, evidence, description) {
  return {
    id,
    passed: Boolean(passed),
    evidence,
    description,
    requiredForClaim: true
  };
}

function readJson(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function readJsonOptional(file) {
  if (!existsSync(file)) return { present: false, value: null };
  try {
    return { present: true, value: JSON.parse(readFileSync(file, "utf8")) };
  } catch {
    return { present: true, value: null };
  }
}

function renderMarkdown(report) {
  return `# SEIS SSH Direct-Cloud Readiness Claim

Generated: ${report.generatedAt}

Status: ${report.status}
Claim allowed: ${report.claimAllowed ? "yes" : "no"}
Claim: ${report.claim}

## Evidence Sources

| Source | Path |
| --- | --- |
| Owner preflight | ${report.evidenceSources.ownerPreflight} |
| Strict doctor report | ${report.evidenceSources.strictDoctorReport} |
| Provider matrix | ${report.evidenceSources.providerMatrix} |
| Mobile contract | ${report.evidenceSources.mobileContract} |
| Acceptance ledger | ${report.evidenceSources.acceptanceLedger} |

## Gates

| Gate | Passed | Evidence |
| --- | --- | --- |
${report.gates.map((item) => `| ${item.id} | ${item.passed ? "yes" : "no"} | ${item.evidence} |`).join("\n")}

## Blockers

${renderList(report.blockers, "none")}

## Commands

\`\`\`bash
${report.commands.ownerPreflight}
${report.commands.strictProbe}
${report.commands.strictDoctor}
${report.commands.claimGate}
\`\`\`

## Non-Evidence

${renderList(report.nonEvidence, "none")}

## Safety

${renderList(report.safety, "none")}
`;
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function writeFile(file, content) {
  const absolute = resolve(file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (["write", "check", "help", "require-ready"].includes(key)) {
      parsed[key] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh:direct-cloud:claim
  npm run check:seis-ssh-direct-cloud-readiness-claim
  node scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs --write --require-ready

Options:
  --write                  Write JSON and Markdown reports.
  --check                  Validate local wiring without requiring live readiness.
  --require-ready          Exit non-zero unless the readiness claim is allowed.
  --owner-preflight PATH   Oracle owner preflight report path.
  --readiness-report PATH  Strict doctor report path.
  --output PATH            JSON output path.
  --markdown PATH          Markdown output path.
`);
}
