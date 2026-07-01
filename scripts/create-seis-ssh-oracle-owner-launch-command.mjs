#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const force = Boolean(args.force);
const ownerInputsFile = expandHome(args["owner-inputs-file"] || process.env.SEIS_ORACLE_OWNER_INPUTS_FILE || "reports/seis-ssh-oracle-owner-input-template.env");
const cloudInitYaml = args["cloud-init-yaml"] || "reports/seis-ssh-oracle-cloud-init-handoff.yaml";
const ownerPreflightReport = args["owner-preflight-report"] || "reports/seis-ssh-oracle-owner-preflight.json";
const instanceLaunchReport = args["instance-launch-report"] || "reports/seis-ssh-oracle-instance-launch-plan.json";
const outputJson = args.output || "reports/seis-ssh-oracle-owner-launch-command.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-owner-launch-command.md";
const outputShell = args.shell || "reports/seis-ssh-oracle-owner-launch-command.sh";
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
  if (report.shellScript.willWrite) {
    const ownerInputsForShell = readOwnerInputs(ownerInputsFile);
    writeFile(outputShell, buildShellScript(ownerInputsForShell.values));
  }
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
  const ownerInputs = readOwnerInputs(ownerInputsFile);
  const ownerInputSummary = summarizeOwnerInputs(ownerInputs.values);
  const cloudInit = inspectLocalFile(cloudInitYaml);
  const preflight = readJsonOptional(ownerPreflightReport);
  const launchPlan = readJsonOptional(instanceLaunchReport);
  const oci = probeOci();
  const shellAlreadyPresent = existsSync(outputShell);
  const inputsReady = ownerInputSummary.required.every((input) => input.present && input.shapeLooksValid);
  const localArtifactsReady = Boolean(cloudInit.present && launchPlan.present && launchPlan.value?.ok === true);
  const readyToWriteShell = Boolean(inputsReady && localArtifactsReady && oci.available && !ownerInputs.containsDangerousPattern);

  if (packageJson?.scripts?.["check:seis-ssh-oracle-owner-launch-command"] !== "node scripts/create-seis-ssh-oracle-owner-launch-command.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-owner-launch-command must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-owner:launch-command"] !== "node scripts/create-seis-ssh-oracle-owner-launch-command.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:oracle-owner:launch-command must be declared");
  }
  if (matrix?.oracleOwnerLaunchCommand?.script !== "scripts/create-seis-ssh-oracle-owner-launch-command.mjs") {
    integrityBlockers.push("provider matrix must link Oracle owner launch command script");
  }
  if (matrix?.oracleOwnerLaunchCommand?.callsProviderApis !== false || matrix?.oracleOwnerLaunchCommand?.createsVm !== false) {
    integrityBlockers.push("Oracle owner launch command handoff must remain local-only and non-mutating");
  }
  if (oraclePlan?.ownerLaunchCommand?.script !== "scripts/create-seis-ssh-oracle-owner-launch-command.mjs") {
    integrityBlockers.push("Oracle plan must link owner launch command script");
  }
  if (oraclePlan?.ownerLaunchCommand?.shellScriptCommittable !== false) {
    integrityBlockers.push("Oracle owner launch command shell script must be non-committable");
  }
  if (ownerInputs.present && ownerInputs.containsDangerousPattern) {
    integrityBlockers.push("owner inputs file contains a dangerous credential-looking pattern");
  }
  if (cloudInit.present && secretPattern().test(cloudInit.preview)) {
    integrityBlockers.push("cloud-init YAML must not contain private keys or provider secrets");
  }
  if (launchPlan.present && launchPlan.value?.mode !== "local-plan-only-no-provider-api-no-vm-create-no-live-ssh") {
    integrityBlockers.push("instance launch plan report must remain local-plan-only");
  }
  if (!/^[0-9]+(?:\.[0-9]+)?$/.test(ocpus)) integrityBlockers.push("ocpus must be numeric");
  if (!/^[0-9]+(?:\.[0-9]+)?$/.test(memoryGb)) integrityBlockers.push("memory-gb must be numeric");

  const shellCommand = inputsReady ? buildLaunchCommand(ownerInputs.values) : "";
  const willWriteShell = Boolean(write && readyToWriteShell && (!shellAlreadyPresent || force));
  const status = integrityBlockers.length > 0
    ? "blocked-integrity"
    : readyToWriteShell
      ? shellAlreadyPresent && !force
        ? "owner-launch-command-ready-preserved-local-only"
        : "owner-launch-command-ready-local-only"
      : "blocked-owner-input-required";

  const readinessBlockers = [
    ...(!ownerInputs.present ? ["owner inputs file is missing"] : []),
    ...ownerInputBlockers(ownerInputSummary.byKey.availabilityDomain, "availability domain"),
    ...ownerInputBlockers(ownerInputSummary.byKey.compartmentId, "compartment OCID"),
    ...ownerInputBlockers(ownerInputSummary.byKey.subnetId, "public subnet OCID"),
    ...ownerInputBlockers(ownerInputSummary.byKey.imageId, "image OCID"),
    ...(!cloudInit.present ? ["Oracle cloud-init handoff YAML is missing"] : []),
    ...(!launchPlan.present ? ["Oracle instance launch plan report is missing"] : []),
    ...(launchPlan.present && launchPlan.value?.ok !== true ? ["Oracle instance launch plan is not OK"] : []),
    ...(!oci.available ? ["OCI CLI is not available locally"] : []),
    ...(ownerInputs.containsDangerousPattern ? ["owner inputs file contains a dangerous credential-looking pattern"] : []),
    "Oracle login/session, Always Free capacity, and VM creation remain owner-side steps",
    "This handoff does not run the launch command"
  ];

  return {
    id: "seis-ssh-oracle-owner-launch-command",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status,
    mode: "local-launch-command-handoff-no-provider-api-no-vm-create-no-live-ssh-no-config-write",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    profile: redactLabel(profile),
    region: redactLabel(region),
    launchShape: {
      displayName,
      shape,
      ocpus: Number(ocpus),
      memoryInGBs: Number(memoryGb)
    },
    oci: {
      available: oci.available,
      resolved: oci.resolved,
      version: oci.version,
      providerApiCalled: false
    },
    ownerInputs: {
      source: {
        path: redactHome(ownerInputs.path),
        present: ownerInputs.present,
        parsedKeys: ownerInputs.parsedKeys,
        nonEmptyKeys: ownerInputs.nonEmptyKeys,
        containsDangerousPattern: ownerInputs.containsDangerousPattern,
        rawValuesPrinted: false
      },
      redaction: "presence-kind-sha256-prefix-only",
      required: ownerInputSummary.required,
      optional: ownerInputSummary.optional,
      byKey: ownerInputSummary.byKey
    },
    localArtifacts: {
      cloudInitYaml: {
        path: cloudInitYaml,
        present: cloudInit.present,
        sha256Prefix: cloudInit.sha256Prefix
      },
      instanceLaunchReport: {
        path: instanceLaunchReport,
        present: launchPlan.present,
        ok: launchPlan.value?.ok === true,
        status: launchPlan.value?.status || null
      },
      ownerPreflightReport: {
        path: ownerPreflightReport,
        present: preflight.present,
        status: preflight.value?.status || null,
        ownerInputsReady: preflight.value?.readiness?.ownerInputsReady === true
      }
    },
    readiness: {
      ownerInputsReady: inputsReady,
      localArtifactsReady,
      readyToWriteShell,
      shellAlreadyPresent,
      shellWillBeWritten: willWriteShell,
      shellWillBePreserved: shellAlreadyPresent && !force,
      force
    },
    shellScript: {
      path: outputShell,
      present: shellAlreadyPresent,
      willWrite: willWriteShell,
      willPreserveExisting: shellAlreadyPresent && !force,
      committable: false,
      containsOwnerValuesWhenWritten: readyToWriteShell,
      sha256Prefix: shellCommand ? sha256HexPrefix(shellCommand) : null,
      rawValuesPrinted: false
    },
    commands: {
      ownerInputTemplate: "npm run cloud:ssh:oracle-owner:template",
      ownerPreflight: "npm run cloud:ssh:oracle-owner:preflight -- --owner-inputs-file reports/seis-ssh-oracle-owner-input-template.env",
      ownerLaunchCommand: "npm run cloud:ssh:oracle-owner:launch-command",
      forceRegenerateShell: "node scripts/create-seis-ssh-oracle-owner-launch-command.mjs --write --force",
      afterVmBoots: "npm run cloud:ssh:oracle-postboot:handoff -- --public-ip <PUBLIC_IP>",
      strictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
      strictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict"
    },
    readinessBlockers,
    integrityBlockers,
    safety: [
      "This handoff reads owner inputs from a local ignored env file.",
      "This handoff never prints OCIDs, availability domains, endpoints, or the raw launch command in JSON or Markdown reports.",
      "If inputs are valid, the raw OCI launch command is written only to an ignored local shell script.",
      "Existing shell handoff files are preserved by default; use --force only after review.",
      "This handoff does not call Oracle APIs, create VMs, open SSH, write SSH config, or read OCI config contents.",
      "Private SSH key material is never read."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown,
      shell: outputShell
    }
  };
}

function buildShellScript(values) {
  return `#!/usr/bin/env bash
set -euo pipefail

# SEIS SSH Oracle owner launch command.
# Local-only. Ignored by git. Review before running.
# This file may contain Oracle OCIDs and availability-domain values.

oci compute instance launch \\
  --profile ${shellQuote(profile)} \\
  --region ${shellQuote(region)} \\
  --availability-domain ${shellQuote(values.SEIS_ORACLE_AVAILABILITY_DOMAIN)} \\
  --compartment-id ${shellQuote(values.SEIS_ORACLE_COMPARTMENT_OCID)} \\
  --subnet-id ${shellQuote(values.SEIS_ORACLE_SUBNET_OCID)} \\
  --image-id ${shellQuote(values.SEIS_ORACLE_IMAGE_OCID)} \\
  --shape ${shellQuote(shape)} \\
  --shape-config ${shellQuote(JSON.stringify({ ocpus: Number(ocpus), memoryInGBs: Number(memoryGb) }))} \\
  --assign-public-ip true \\
  --display-name ${shellQuote(displayName)} \\
  --user-data-file ${shellQuote(cloudInitYaml)} \\
  --wait-for-state RUNNING
`;
}

function buildLaunchCommand(values) {
  return buildShellScript(values)
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("set "))
    .join("\n");
}

function renderMarkdown(report) {
  return `# SEIS SSH Oracle Owner Launch Command Handoff

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Provider: ${report.providerId}
Alias: ${report.targetAlias}

## Readiness

| Gate | Value |
| --- | --- |
| Owner inputs ready | ${report.readiness.ownerInputsReady ? "yes" : "no"} |
| Local artifacts ready | ${report.readiness.localArtifactsReady ? "yes" : "no"} |
| Ready to write shell | ${report.readiness.readyToWriteShell ? "yes" : "no"} |
| Shell already present | ${report.readiness.shellAlreadyPresent ? "yes" : "no"} |
| Shell will be written | ${report.readiness.shellWillBeWritten ? "yes" : "no"} |
| Shell will be preserved | ${report.readiness.shellWillBePreserved ? "yes" : "no"} |

## Owner Inputs

${renderInputTable(report.ownerInputs.required)}

## Shell Handoff

| Field | Value |
| --- | --- |
| Path | ${report.shellScript.path} |
| Present | ${report.shellScript.present ? "yes" : "no"} |
| Will write | ${report.shellScript.willWrite ? "yes" : "no"} |
| Committable | no |
| Raw values printed here | no |

## Commands

\`\`\`bash
${report.commands.ownerInputTemplate}
${report.commands.ownerPreflight}
${report.commands.ownerLaunchCommand}
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

function readOwnerInputs(file) {
  if (!existsSync(file)) {
    return {
      present: false,
      path: file,
      values: {},
      parsedKeys: [],
      nonEmptyKeys: [],
      containsDangerousPattern: false
    };
  }
  const text = readFileSync(file, "utf8");
  const values = parseEnvValues(text);
  return {
    present: true,
    path: file,
    values,
    parsedKeys: Object.keys(values).sort(),
    nonEmptyKeys: Object.entries(values).filter(([, value]) => String(value || "").trim()).map(([key]) => key).sort(),
    containsDangerousPattern: secretPattern().test(text)
  };
}

function parseEnvValues(text) {
  const values = {};
  for (const line of String(text || "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const normalized = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
    const separator = normalized.indexOf("=");
    if (separator <= 0) continue;
    const key = normalized.slice(0, separator).trim();
    if (!/^SEIS_(?:ORACLE|CLOUD)_[A-Z0-9_]+$/.test(key)) continue;
    values[key] = stripEnvQuotes(normalized.slice(separator + 1).trim());
  }
  return values;
}

function stripEnvQuotes(value) {
  const text = String(value || "").trim();
  if ((text.startsWith("\"") && text.endsWith("\"")) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  return text;
}

function summarizeOwnerInputs(values) {
  const required = [
    summarizeInput("availabilityDomain", "availability-domain", values.SEIS_ORACLE_AVAILABILITY_DOMAIN, "label"),
    summarizeInput("compartmentId", "compartment-ocid", values.SEIS_ORACLE_COMPARTMENT_OCID, "ocid"),
    summarizeInput("subnetId", "public-subnet-ocid", values.SEIS_ORACLE_SUBNET_OCID, "ocid"),
    summarizeInput("imageId", "image-ocid", values.SEIS_ORACLE_IMAGE_OCID, "ocid")
  ];
  const optional = [
    summarizeInput("publicIp", "post-boot-public-ip", values.SEIS_ORACLE_PUBLIC_IP, "endpoint")
  ];
  return {
    required,
    optional,
    byKey: Object.fromEntries([...required, ...optional].map((input) => [input.key, input]))
  };
}

function summarizeInput(key, label, value, expectedKind) {
  const text = String(value || "").trim();
  return {
    key,
    label,
    present: text.length > 0,
    expectedKind,
    detectedKind: classifyValue(text),
    sha256Prefix: text ? sha256HexPrefix(text) : null,
    shapeLooksValid: text ? inputShapeLooksValid(text, expectedKind) : false
  };
}

function inputShapeLooksValid(value, expectedKind) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/^<[^>]+>$/.test(text)) return false;
  if (/^(?:todo|tbd|placeholder|null|undefined)$/i.test(text)) return false;
  if (expectedKind === "ocid") return /^ocid1\.[A-Za-z0-9_.-]+$/i.test(text);
  if (expectedKind === "endpoint") return classifyValue(text) === "ipv4" || classifyValue(text) === "hostname";
  return text.length >= 3;
}

function ownerInputBlockers(input, label) {
  if (!input.present) return [`${label} is missing`];
  if (!input.shapeLooksValid) return [`${label} is present but does not match the expected ${input.expectedKind} shape`];
  return [];
}

function classifyValue(value) {
  const text = String(value || "").trim();
  if (!text) return "missing";
  if (/^ocid1\./i.test(text)) return "ocid";
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(text)) return "ipv4";
  if (/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(text)) return "hostname";
  return "label";
}

function probeOci() {
  const candidates = [
    process.env.SEIS_OCI_BIN,
    "../.local/oci-cli-venv/bin/oci",
    ".local/oci-cli-venv/bin/oci",
    `${homedir()}/.local/bin/oci`,
    "oci"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes("/") && !existsSync(candidate)) continue;
    const result = spawnSync(candidate, ["--version"], {
      encoding: "utf8",
      timeout: 10000
    });
    if ((result.status ?? 1) === 0) {
      return {
        available: true,
        resolved: redactHome(candidate),
        version: sanitizeCliOutput(`${result.stdout || ""}${result.stderr || ""}`.trim())
      };
    }
  }
  return {
    available: false,
    resolved: null,
    version: null
  };
}

function inspectLocalFile(file) {
  if (!existsSync(file)) return { present: false, sha256Prefix: null, preview: "" };
  const text = readFileSync(file, "utf8");
  return {
    present: true,
    sha256Prefix: sha256HexPrefix(text),
    preview: text.slice(0, 20000)
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

function secretPattern() {
  const providerAssignments = [
    ["OPENAI", "API", "KEY"],
    ["ANTHROPIC", "API", "KEY"],
    ["GEMINI", "API", "KEY"],
    ["AWS", "SECRET", "ACCESS", "KEY"]
  ].map((parts) => `${parts.join("_")}=`);
  const tokenPrefixes = [["gh", "p_"].join(""), ["github", "_pat_"].join("")];
  return new RegExp([
    "-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----",
    ...tokenPrefixes.map(escapeRegExp),
    "sk-[A-Za-z0-9_-]{20,}",
    ...providerAssignments.map(escapeRegExp),
    ["password", "\\s*", "="].join(""),
    ["token", "\\s*", "="].join("")
  ].join("|"), "i");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderInputTable(inputs) {
  return [
    "| Input | Present | Kind | SHA-256 prefix | Shape valid |",
    "| --- | --- | --- | --- | --- |",
    ...inputs.map((input) => `| ${input.label} | ${input.present ? "yes" : "no"} | ${input.detectedKind} | ${input.sha256Prefix || "none"} | ${input.shapeLooksValid ? "yes" : "no"} |`)
  ].join("\n");
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function sanitizeCliOutput(value) {
  return String(value || "")
    .replaceAll(homedir(), "~")
    .replace(/ocid1\.[A-Za-z0-9_.-]+/g, "[redacted-ocid]")
    .slice(0, 200);
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function sha256HexPrefix(value) {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, 12);
}

function redactHome(value) {
  return String(value || "").replaceAll(homedir(), "~");
}

function redactLabel(value) {
  return String(value || "").replace(/ocid1\.[A-Za-z0-9_.-]+/g, "redacted-ocid").replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 80);
}

function expandHome(value) {
  return String(value || "").replace(/^~(?=$|\/)/, homedir());
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
    if (["write", "check", "help", "force"].includes(key)) {
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
  npm run cloud:ssh:oracle-owner:launch-command
  npm run check:seis-ssh-oracle-owner-launch-command
  node scripts/create-seis-ssh-oracle-owner-launch-command.mjs --write

Options:
  --write                       Write JSON and Markdown reports, and shell handoff when ready.
  --check                       Validate wiring without requiring owner inputs.
  --force                       Overwrite an existing shell handoff after review.
  --owner-inputs-file PATH      Local ignored env file with owner inputs.
  --cloud-init-yaml PATH        Cloud-init YAML path.
  --owner-preflight-report PATH Owner preflight report path.
  --instance-launch-report PATH Instance launch plan report path.
  --profile NAME                OCI profile label. Default: SEIS.
  --region REGION               OCI region label. Default: eu-frankfurt-1.
  --output PATH                 JSON output path.
  --markdown PATH               Markdown output path.
  --shell PATH                  Local ignored shell handoff path.
`);
}
