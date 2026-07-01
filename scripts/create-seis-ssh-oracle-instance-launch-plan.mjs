#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-oracle-instance-launch-plan.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-instance-launch-plan.md";
const cloudInitYaml = args["cloud-init-yaml"] || "reports/seis-ssh-oracle-cloud-init-handoff.yaml";
const profile = args.profile || process.env.SEIS_OCI_PROFILE || "SEIS";
const region = args.region || process.env.SEIS_ORACLE_REGION || "eu-frankfurt-1";
const displayName = args["display-name"] || "seis-direct-cloud";
const shape = args.shape || "VM.Standard.A1.Flex";
const ocpus = String(args.ocpus || "1");
const memoryGb = String(args["memory-gb"] || "6");

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
  const contract = readJson("deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json", integrityBlockers);
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const ociHelp = inspectOciLaunchHelp();
  const commandTemplate = buildLaunchCommand();

  if (packageJson?.scripts?.["check:seis-ssh-oracle-instance-launch-plan"] !== "node scripts/create-seis-ssh-oracle-instance-launch-plan.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-instance-launch-plan must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-instance:plan"] !== "node scripts/create-seis-ssh-oracle-instance-launch-plan.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:oracle-instance:plan must be declared");
  }
  if (contract?.instanceLaunchPlan?.script !== "scripts/create-seis-ssh-oracle-instance-launch-plan.mjs") {
    integrityBlockers.push("Oracle plan must link instance launch plan script");
  }
  if (contract?.instanceLaunchPlan?.callsProviderApis !== false || contract?.instanceLaunchPlan?.createsVm !== false) {
    integrityBlockers.push("Oracle instance launch plan must remain local-only and non-mutating");
  }
  if (matrix?.oracleInstanceLaunchPlan?.script !== "scripts/create-seis-ssh-oracle-instance-launch-plan.mjs") {
    integrityBlockers.push("provider matrix must link Oracle instance launch plan script");
  }
  if (!existsSync(cloudInitYaml)) {
    integrityBlockers.push("cloud-init handoff YAML must exist before launch plan is ready");
  }
  for (const flag of ["--user-data-file", "--assign-public-ip", "--subnet-id", "--image-id", "--shape"]) {
    if (!ociHelp.text.includes(flag)) integrityBlockers.push(`local OCI launch help must include ${flag}`);
  }
  if (!/^[0-9]+(?:\.[0-9]+)?$/.test(ocpus)) integrityBlockers.push("ocpus must be numeric");
  if (!/^[0-9]+(?:\.[0-9]+)?$/.test(memoryGb)) integrityBlockers.push("memory-gb must be numeric");

  return {
    id: "seis-ssh-oracle-instance-launch-plan",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status: "owner-input-required-no-provider-call",
    mode: "local-plan-only-no-provider-api-no-vm-create-no-live-ssh",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    profile: redactLabel(profile),
    region: redactLabel(region),
    displayName,
    shape,
    shapeConfig: {
      ocpus: Number(ocpus),
      memoryInGBs: Number(memoryGb)
    },
    requiredOwnerInputs: [
      "availability-domain",
      "compartment OCID",
      "public subnet OCID",
      "image OCID",
      "Oracle account session",
      "Always Free capacity confirmation"
    ],
    placeholders: {
      availabilityDomain: "<AVAILABILITY_DOMAIN>",
      compartmentId: "<COMPARTMENT_OCID>",
      subnetId: "<PUBLIC_SUBNET_OCID>",
      imageId: "<IMAGE_OCID>",
      publicIp: "<PUBLIC_IP_AFTER_BOOT>"
    },
    cloudInit: {
      yaml: cloudInitYaml,
      exists: existsSync(cloudInitYaml),
      passedAs: "--user-data-file",
      containsPublicKey: existsSync(cloudInitYaml),
      localOnly: true
    },
    commands: {
      generateCloudInit: "npm run cloud:ssh:oracle-cloud-init:handoff",
      launchTemplate: commandTemplate,
      afterVmBoots: "npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      strictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
      strictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict"
    },
    readinessBlockers: [
      "Owner must authenticate to Oracle outside git.",
      "Owner must choose tenancy, compartment, availability domain, subnet, and image.",
      "Owner must confirm Always Free capacity before running the launch command.",
      "This plan does not prove an instance exists or has a public IP.",
      "Strict direct-cloud probe and doctor still need the real endpoint."
    ],
    integrityBlockers,
    ociCliEvidence: {
      launchHelpChecked: ociHelp.checked,
      commandAvailable: ociHelp.available,
      supportsUserDataFile: ociHelp.text.includes("--user-data-file"),
      supportsAssignPublicIp: ociHelp.text.includes("--assign-public-ip"),
      providerApiCalled: false
    },
    safety: [
      "This script only reads local contracts and OCI CLI help text.",
      "This script does not run oci compute instance launch.",
      "This script does not read OCI config contents, session tokens, private keys, hostnames, public IPs, or OCIDs.",
      "All owner-specific OCIDs remain placeholders in public-safe output."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function buildLaunchCommand() {
  const shapeConfig = JSON.stringify({ ocpus: Number(ocpus), memoryInGBs: Number(memoryGb) });
  return [
    "oci compute instance launch",
    `  --profile ${shellQuote(profile)}`,
    `  --region ${shellQuote(region)}`,
    "  --availability-domain <AVAILABILITY_DOMAIN>",
    "  --compartment-id <COMPARTMENT_OCID>",
    "  --subnet-id <PUBLIC_SUBNET_OCID>",
    "  --image-id <IMAGE_OCID>",
    `  --shape ${shellQuote(shape)}`,
    `  --shape-config ${shellQuote(shapeConfig)}`,
    "  --assign-public-ip true",
    `  --display-name ${shellQuote(displayName)}`,
    `  --user-data-file ${shellQuote(cloudInitYaml)}`,
    "  --wait-for-state RUNNING"
  ].join(" \\\n");
}

function inspectOciLaunchHelp() {
  const candidates = [
    process.env.SEIS_OCI_BIN,
    "../.local/oci-cli-venv/bin/oci",
    ".local/oci-cli-venv/bin/oci",
    `${homedir()}/.local/bin/oci`,
    "oci"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes("/") && !existsSync(candidate)) continue;
    const result = spawnSync(candidate, ["compute", "instance", "launch", "--help"], {
      encoding: "utf8",
      timeout: 10000
    });
    if ((result.status ?? 1) === 0) {
      return {
        checked: true,
        available: true,
        resolved: redactHome(candidate),
        text: sanitizeHelp(`${result.stdout || ""}\n${result.stderr || ""}`)
      };
    }
  }

  return {
    checked: true,
    available: false,
    resolved: null,
    text: ""
  };
}

function renderMarkdown(report) {
  return `# SEIS SSH Oracle Instance Launch Plan

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Provider: ${report.providerId}
Alias: ${report.targetAlias}

## Required Owner Inputs

${renderList(report.requiredOwnerInputs, "none")}

## Local Cloud-Init

| Field | Value |
| --- | --- |
| YAML | ${report.cloudInit.yaml} |
| Exists | ${report.cloudInit.exists ? "yes" : "no"} |
| Passed as | ${report.cloudInit.passedAs} |
| Local only | yes |

## Launch Template

\`\`\`bash
${report.commands.launchTemplate}
\`\`\`

## After VM Boots

\`\`\`bash
${report.commands.afterVmBoots}
${report.commands.strictProbe}
${report.commands.strictDoctor}
\`\`\`

## Readiness Blockers

${renderList(report.readinessBlockers, "none")}

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

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function sanitizeHelp(value) {
  return String(value || "")
    .replaceAll(homedir(), "~")
    .replace(/ocid1\.[A-Za-z0-9_.-]+/g, "[redacted-ocid]")
    .slice(0, 40000);
}

function redactHome(value) {
  return String(value || "").replaceAll(homedir(), "~");
}

function redactLabel(value) {
  return String(value || "").replace(/ocid1\.[A-Za-z0-9_.-]+/g, "redacted-ocid").replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 80);
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
  npm run cloud:ssh:oracle-instance:plan
  npm run check:seis-ssh-oracle-instance-launch-plan
  node scripts/create-seis-ssh-oracle-instance-launch-plan.mjs --write

Options:
  --write                 Write JSON and Markdown reports.
  --check                 Validate local wiring and OCI launch help.
  --cloud-init-yaml PATH  Cloud-init YAML path.
  --profile NAME          OCI profile label. Default: SEIS.
  --region REGION         OCI region label. Default: eu-frankfurt-1.
  --display-name NAME     Instance display name.
  --shape NAME            OCI shape. Default: VM.Standard.A1.Flex.
  --ocpus NUMBER          Flex OCPU count. Default: 1.
  --memory-gb NUMBER      Flex memory GB. Default: 6.
  --output PATH           JSON output path.
  --markdown PATH         Markdown output path.
`);
}
