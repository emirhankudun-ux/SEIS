#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-oracle-owner-handoff-bundle.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-owner-handoff-bundle.md";

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

function buildReport() {
  const integrityBlockers = [];
  const packageJson = readJson("package.json", integrityBlockers);
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const oraclePlan = readJson("deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json", integrityBlockers);
  const reports = {
    pipeline: readJsonOptional("reports/seis-ssh-oracle-direct-cloud-pipeline.json"),
    ownerInputTemplate: readJsonOptional("reports/seis-ssh-oracle-owner-input-template.json"),
    ownerPreflight: readJsonOptional("reports/seis-ssh-oracle-owner-preflight.json"),
    ownerLaunchCommand: readJsonOptional("reports/seis-ssh-oracle-owner-launch-command.json"),
    cloudInit: readJsonOptional("reports/seis-ssh-oracle-cloud-init-handoff.json"),
    instanceLaunch: readJsonOptional("reports/seis-ssh-oracle-instance-launch-plan.json"),
    postBoot: readJsonOptional("reports/seis-ssh-oracle-postboot-handoff.json"),
    readinessClaim: readJsonOptional("reports/seis-ssh-direct-cloud-readiness-claim.json")
  };

  if (packageJson?.scripts?.["check:seis-ssh-oracle-owner-handoff"] !== "node scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-owner-handoff must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-owner:handoff"] !== "node scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:oracle-owner:handoff must be declared");
  }
  if (matrix?.oracleOwnerHandoffBundle?.script !== "scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs") {
    integrityBlockers.push("provider matrix must link Oracle owner handoff bundle script");
  }
  if (matrix?.oracleOwnerHandoffBundle?.printsRawOwnerValues !== false || matrix?.oracleOwnerHandoffBundle?.callsProviderApis !== false) {
    integrityBlockers.push("Oracle owner handoff bundle must remain redacted and local-only");
  }
  if (oraclePlan?.ownerHandoffBundle?.script !== "scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs") {
    integrityBlockers.push("Oracle plan must link owner handoff bundle script");
  }
  if (oraclePlan?.ownerHandoffBundle?.printsRawOwnerValues !== false || oraclePlan?.ownerHandoffBundle?.callsProviderApis !== false) {
    integrityBlockers.push("Oracle owner handoff bundle plan must remain redacted and local-only");
  }

  const pipelineStage = reports.pipeline.value?.currentStage || null;
  const nextOwnerAction = reports.pipeline.value?.nextOwnerAction || "Run npm run cloud:ssh:oracle-direct-cloud:pipeline.";
  const ownerInputsReady = reports.ownerPreflight.value?.readiness?.ownerInputsReady === true;
  const ownerLaunchReady = reports.ownerLaunchCommand.value?.readiness?.readyToWriteShell === true;
  const postBootEndpointPresent = reports.postBoot.value?.endpoint?.present === true;
  const claimAllowed = reports.readinessClaim.value?.claimAllowed === true;
  const status = integrityBlockers.length > 0
    ? "blocked-integrity"
    : claimAllowed
      ? "handoff-complete-direct-cloud-claim-allowed"
      : ownerInputsReady
        ? "handoff-ready-for-owner-launch-review"
        : "handoff-ready-owner-input-required";

  return {
    id: "seis-ssh-oracle-owner-handoff-bundle",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status,
    mode: "local-owner-handoff-bundle-no-provider-api-no-vm-create-no-live-ssh-no-config-write",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    currentStage: pipelineStage,
    nextOwnerAction,
    stageSummary: [
      summarizeStage("owner-input-template", reports.ownerInputTemplate, "reports/seis-ssh-oracle-owner-input-template.json"),
      summarizeStage("owner-preflight", reports.ownerPreflight, "reports/seis-ssh-oracle-owner-preflight.json"),
      summarizeStage("owner-launch-command", reports.ownerLaunchCommand, "reports/seis-ssh-oracle-owner-launch-command.json"),
      summarizeStage("post-boot-handoff", reports.postBoot, "reports/seis-ssh-oracle-postboot-handoff.json"),
      summarizeStage("readiness-claim", reports.readinessClaim, "reports/seis-ssh-direct-cloud-readiness-claim.json")
    ],
    readiness: {
      ownerInputsReady,
      ownerLaunchReady,
      postBootEndpointPresent,
      claimAllowed
    },
    ownerRunOrder: [
      "npm run cloud:ssh:oracle-owner:template",
      "Fill reports/seis-ssh-oracle-owner-input-template.env outside git.",
      "npm run cloud:ssh:oracle-owner:preflight -- --owner-inputs-file reports/seis-ssh-oracle-owner-input-template.env",
      "npm run cloud:ssh:oracle-owner:launch-command",
      "Review and run reports/seis-ssh-oracle-owner-launch-command.sh only from the local machine after Oracle login and capacity review.",
      "npm run cloud:ssh:oracle-postboot:handoff -- --public-ip <PUBLIC_IP>",
      "npm run cloud:ssh:direct-cloud:switch -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      "npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      "npm run cloud:ssh:mobile-direct:probe:strict",
      "npm run cloud:ssh:mobile-direct:doctor:strict",
      "npm run cloud:ssh:direct-cloud:claim"
    ],
    blockers: [
      ...(ownerInputsReady ? [] : ["Oracle owner inputs are missing or invalid"]),
      ...(ownerLaunchReady ? [] : ["Oracle owner launch shell is not ready to write"]),
      ...(postBootEndpointPresent ? [] : ["Oracle post-boot endpoint is missing"]),
      ...(claimAllowed ? [] : ["Direct-cloud readiness claim is still blocked until strict live evidence passes"])
    ],
    integrityBlockers,
    safety: [
      "This bundle only reads local redacted SEIS reports.",
      "This bundle does not call Oracle APIs, create VMs, open SSH, write SSH config, or read OCI config contents.",
      "This bundle does not print raw OCIDs, availability domains, public IPs, hostnames, tokens, or private keys.",
      "The only file that may contain raw owner launch values is the ignored local shell handoff, and only after owner inputs pass shape checks."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function summarizeStage(id, report, path) {
  return {
    id,
    report: path,
    present: report.present,
    ok: report.value?.ok === true,
    status: report.value?.status || null
  };
}

function renderMarkdown(report) {
  return `# SEIS SSH Oracle Owner Handoff Bundle

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Provider: ${report.providerId}
Alias: ${report.targetAlias}
Current stage: ${report.currentStage?.id || "unknown"}
Next owner action: ${report.nextOwnerAction}

## Stage Summary

| Stage | Present | OK | Status |
| --- | --- | --- | --- |
${report.stageSummary.map((stage) => `| ${stage.id} | ${stage.present ? "yes" : "no"} | ${stage.ok ? "yes" : "no"} | ${stage.status || "none"} |`).join("\n")}

## Readiness

| Gate | Value |
| --- | --- |
| Owner inputs ready | ${report.readiness.ownerInputsReady ? "yes" : "no"} |
| Owner launch ready | ${report.readiness.ownerLaunchReady ? "yes" : "no"} |
| Post-boot endpoint present | ${report.readiness.postBootEndpointPresent ? "yes" : "no"} |
| Claim allowed | ${report.readiness.claimAllowed ? "yes" : "no"} |

## Owner Run Order

${report.ownerRunOrder.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## Blockers

${renderList(report.blockers, "none")}

## Integrity Blockers

${renderList(report.integrityBlockers, "none")}

## Safety

${renderList(report.safety, "none")}
`;
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
    if (["write", "check", "help"].includes(key)) {
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
  npm run cloud:ssh:oracle-owner:handoff
  npm run check:seis-ssh-oracle-owner-handoff
  node scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs --write

Options:
  --write          Write JSON and Markdown reports.
  --check          Validate local wiring.
  --output PATH    JSON output path.
  --markdown PATH  Markdown output path.
`);
}
