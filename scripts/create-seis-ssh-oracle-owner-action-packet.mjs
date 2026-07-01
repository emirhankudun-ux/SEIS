#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const refresh = Boolean(args.refresh);
const ownerInputsFile = args["owner-inputs-file"] || "reports/seis-ssh-oracle-owner-input-template.env";
const outputJson = args.output || "reports/seis-ssh-oracle-owner-action-packet.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-owner-action-packet.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const refreshRuns = refresh ? runRefreshCommands() : [];
const report = buildReport(refreshRuns);

if (write) {
  writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(report));
}

if (!write) console.log(JSON.stringify(report, null, 2));

if (check && report.integrityBlockers.length > 0) process.exit(1);

function buildReport(refreshRuns) {
  const integrityBlockers = [];
  const packageJson = readJson("package.json", integrityBlockers);
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const oraclePlan = readJson("deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json", integrityBlockers);
  const publicContract = readJson("deploy/seis-ssh-public-access-contract.json", integrityBlockers);
  const accessModel = readJson("deploy/seis-ssh-access-model.json", integrityBlockers);
  const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json", integrityBlockers);
  const template = readJsonOptional("reports/seis-ssh-oracle-owner-input-template.json");
  const preflight = readJsonOptional("reports/seis-ssh-oracle-owner-preflight.json");
  const handoff = readJsonOptional("reports/seis-ssh-oracle-owner-handoff-bundle.json");
  const board = readJsonOptional("reports/seis-ssh-provider-status-board.json");

  const expectedCheck = "node scripts/create-seis-ssh-oracle-owner-action-packet.mjs --check";
  const expectedReport = "node scripts/create-seis-ssh-oracle-owner-action-packet.mjs --write --refresh";
  if (packageJson?.scripts?.["check:seis-ssh-oracle-owner-action-packet"] !== expectedCheck) {
    integrityBlockers.push("package script check:seis-ssh-oracle-owner-action-packet must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-owner:action-packet"] !== expectedReport) {
    integrityBlockers.push("package script cloud:ssh:oracle-owner:action-packet must be declared");
  }
  if (matrix?.oracleOwnerActionPacket?.script !== "scripts/create-seis-ssh-oracle-owner-action-packet.mjs") {
    integrityBlockers.push("provider matrix must link Oracle owner action packet script");
  }
  if (matrix?.oracleOwnerActionPacket?.callsProviderApis !== false || matrix?.oracleOwnerActionPacket?.opensSshSession !== false) {
    integrityBlockers.push("Oracle owner action packet must remain local-only");
  }
  if (oraclePlan?.ownerActionPacket?.script !== "scripts/create-seis-ssh-oracle-owner-action-packet.mjs") {
    integrityBlockers.push("Oracle plan must link owner action packet script");
  }
  if (!(publicContract?.requiredCommands || []).includes("npm run check:seis-ssh-oracle-owner-action-packet")) {
    integrityBlockers.push("public access contract must require Oracle owner action packet check");
  }
  if (!(publicContract?.evidenceSurfaces || []).includes("scripts/create-seis-ssh-oracle-owner-action-packet.mjs")) {
    integrityBlockers.push("public access contract must include Oracle owner action packet evidence surface");
  }
  if (!(accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-oracle-owner-action-packet")) {
    integrityBlockers.push("access model quality commands must include Oracle owner action packet check");
  }
  if (!(roadmap?.validationCommands || []).includes("npm run check:seis-ssh-oracle-owner-action-packet")) {
    integrityBlockers.push("roadmap validation commands must include Oracle owner action packet check");
  }

  const missingInputs = missingOwnerInputs(preflight.value);
  const blockedSession = sessionBlockers(preflight.value);
  const ownerInputsReady = preflight.value?.readiness?.ownerInputsReady === true;
  const claimAllowed = handoff.value?.readiness?.claimAllowed === true;
  const refreshFailures = refreshRuns.filter((run) => run.ok !== true);
  const status = integrityBlockers.length > 0
    ? "blocked-integrity"
    : claimAllowed
      ? "action-packet-complete-claim-allowed"
      : ownerInputsReady
        ? "action-packet-ready-for-owner-launch-review"
        : "action-packet-ready-inputs-required";

  return {
    id: "seis-ssh-oracle-owner-action-packet",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status,
    mode: "local-owner-action-packet-no-provider-api-no-live-ssh-no-config-write",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    ownerInputsFile: {
      path: ownerInputsFile,
      present: existsSync(ownerInputsFile),
      committable: false,
      rawValuesPrinted: false,
      templateReportPresent: template.present,
      templateStatus: template.value?.status || null
    },
    currentEvidence: {
      ownerPreflightPresent: preflight.present,
      ownerPreflightStatus: preflight.value?.status || null,
      ownerHandoffPresent: handoff.present,
      ownerHandoffStatus: handoff.value?.status || null,
      providerStatusBoardPresent: board.present,
      providerStatusBoardStatus: board.value?.status || null
    },
    checklist: {
      missingRequiredOwnerInputs: missingInputs,
      sessionBlockers: blockedSession,
      optionalAfterBoot: [
        {
          id: "post-boot-public-ip",
          envKey: "SEIS_ORACLE_PUBLIC_IP",
          requiredNow: false,
          requiredAfterVmBoots: true,
          valuePrinted: false
        }
      ]
    },
    nextCommands: [
      "npm run cloud:ssh:oracle-owner:template",
      "Fill reports/seis-ssh-oracle-owner-input-template.env outside git.",
      "oci session authenticate --region eu-frankfurt-1 --no-browser --profile-name SEIS",
      "npm run cloud:ssh:oracle-owner:preflight -- --owner-inputs-file reports/seis-ssh-oracle-owner-input-template.env",
      "npm run cloud:ssh:oracle-owner:launch-command",
      "npm run cloud:ssh:oracle-owner:handoff",
      "npm run cloud:ssh:provider-status:board"
    ],
    nextOwnerAction: ownerInputsReady
      ? "Review the ignored owner launch command locally after Oracle login and capacity review."
      : "Fill the missing Oracle owner inputs outside git, authenticate to Oracle outside git, then rerun owner preflight.",
    blockers: [
      ...refreshFailures.map((run) => `refresh failed: ${run.id}`),
      ...missingInputs.map((input) => `${input.envKey} is missing or invalid`),
      ...blockedSession.map((blocker) => blocker.message),
      ...(ownerInputsReady ? [] : ["Oracle owner inputs are not ready"]),
      ...(claimAllowed ? [] : ["Direct-cloud readiness claim is still blocked until strict live evidence passes"])
    ],
    integrityBlockers,
    refreshed: refresh,
    refreshRuns,
    safety: [
      "This action packet reads local redacted reports only.",
      "This action packet does not call Oracle APIs, create VMs, open SSH, write SSH config, or read OCI config contents.",
      "Owner OCIDs, availability domains, public IPs, hostnames, tokens, and private keys are never printed.",
      "The owner input env and owner launch shell remain ignored local artifacts."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function missingOwnerInputs(preflight) {
  const required = preflight?.ownerInputs?.required || [];
  const envKeys = {
    availabilityDomain: "SEIS_ORACLE_AVAILABILITY_DOMAIN",
    compartmentId: "SEIS_ORACLE_COMPARTMENT_OCID",
    subnetId: "SEIS_ORACLE_SUBNET_OCID",
    imageId: "SEIS_ORACLE_IMAGE_OCID"
  };
  return required
    .filter((input) => input.present !== true || input.shapeLooksValid !== true)
    .map((input) => ({
      id: input.key,
      label: input.label,
      envKey: envKeys[input.key] || input.key,
      expectedKind: input.expectedKind,
      detectedKind: input.detectedKind,
      valuePrinted: false
    }));
}

function sessionBlockers(preflight) {
  const oci = preflight?.oci || {};
  const blockers = [];
  if (oci.configFilePresent !== true) {
    blockers.push({
      id: "oci-config-missing",
      message: "OCI config file is missing; authenticate outside git."
    });
  }
  if (oci.sessionDirectoryPresent !== true) {
    blockers.push({
      id: "oci-session-missing",
      message: "OCI session directory is missing; browser/device login may still be required."
    });
  }
  return blockers;
}

function runRefreshCommands() {
  const commands = [
    {
      id: "owner-input-template",
      argv: ["scripts/create-seis-ssh-oracle-owner-input-template.mjs", "--write"]
    },
    {
      id: "owner-preflight",
      argv: ["scripts/create-seis-ssh-oracle-owner-preflight.mjs", "--write", "--owner-inputs-file", ownerInputsFile]
    },
    {
      id: "owner-handoff",
      argv: ["scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs", "--write"]
    },
    {
      id: "provider-status-board",
      argv: ["scripts/create-seis-ssh-provider-status-board.mjs", "--write", "--refresh"]
    }
  ];

  return commands.map((command) => {
    const result = spawnSync(process.execPath, command.argv, {
      encoding: "utf8",
      timeout: 30000,
      env: cleanEnv(process.env)
    });
    return {
      id: command.id,
      ok: (result.status ?? 1) === 0,
      status: result.status ?? 1,
      command: `node ${command.argv.join(" ")}`,
      stdoutSummary: summarize(result.stdout),
      stderrSummary: summarize(result.stderr)
    };
  });
}

function renderMarkdown(report) {
  return `# SEIS SSH Oracle Owner Action Packet

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Provider: ${report.providerId}
Alias: ${report.targetAlias}
Refreshed: ${report.refreshed ? "yes" : "no"}

## Next Owner Action

${report.nextOwnerAction}

## Missing Required Inputs

| Input | Env key | Expected kind | Detected kind |
| --- | --- | --- | --- |
${renderInputRows(report.checklist.missingRequiredOwnerInputs)}

## Session Blockers

${renderList(report.checklist.sessionBlockers.map((blocker) => blocker.message), "none")}

## Next Commands

\`\`\`bash
${report.nextCommands.join("\n")}
\`\`\`

## Blockers

${renderList(report.blockers, "none")}

## Integrity Blockers

${renderList(report.integrityBlockers, "none")}

## Safety

${renderList(report.safety, "none")}
`;
}

function renderInputRows(inputs) {
  if (!Array.isArray(inputs) || inputs.length === 0) return "| none | none | none | none |";
  return inputs.map((input) => `| ${input.label} | ${input.envKey} | ${input.expectedKind} | ${input.detectedKind} |`).join("\n");
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

function summarize(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function cleanEnv(env) {
  const next = { ...env };
  for (const key of Object.keys(next)) {
    if (/TOKEN|SECRET|PASSWORD|PRIVATE|KEY|COOKIE|CERT/i.test(key)) delete next[key];
  }
  return next;
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/create-seis-ssh-oracle-owner-action-packet.mjs [--check] [--write] [--refresh]

Creates a local-only owner action packet for the Oracle SEIS-SSH direct-cloud
handoff. It lists missing input names and command order without printing owner
values.

Options:
  --check                    Validate integrity and print JSON.
  --write                    Write ignored JSON and Markdown reports.
  --refresh                  Refresh local owner reports before building the packet.
  --owner-inputs-file PATH   Local ignored owner input env. Default: reports/seis-ssh-oracle-owner-input-template.env.
  --output PATH              JSON output path. Default: reports/seis-ssh-oracle-owner-action-packet.json.
  --markdown PATH            Markdown output path. Default: reports/seis-ssh-oracle-owner-action-packet.md.
`);
}
