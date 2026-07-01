#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-oracle-owner-preflight.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-owner-preflight.md";
const publicKeyPath = expandHome(args["public-key"] || process.env.SEIS_SSH_PUBLIC_KEY_FILE || "~/.ssh/id_ed25519_seis_codex.pub");
const ociConfigPath = expandHome(args["oci-config"] || process.env.OCI_CONFIG_FILE || "~/.oci/config");
const ociSessionDir = expandHome(args["oci-session-dir"] || "~/.oci/sessions");
const cloudInitYaml = args["cloud-init-yaml"] || "reports/seis-ssh-oracle-cloud-init-handoff.yaml";
const instanceLaunchReport = args["instance-launch-report"] || "reports/seis-ssh-oracle-instance-launch-plan.json";
const profile = args.profile || process.env.SEIS_OCI_PROFILE || "SEIS";
const region = args.region || process.env.SEIS_ORACLE_REGION || "eu-frankfurt-1";
const ownerInputsFilePath = expandHome(args["owner-inputs-file"] || process.env.SEIS_ORACLE_OWNER_INPUTS_FILE || "");
const ownerInputsFile = readOwnerInputsFile(ownerInputsFilePath);
const ownerInputsFileValues = ownerInputsFile.values;

const ownerInputs = {
  availabilityDomain: firstNonEmpty(args["availability-domain"], process.env.SEIS_ORACLE_AVAILABILITY_DOMAIN, ownerInputsFileValues.SEIS_ORACLE_AVAILABILITY_DOMAIN),
  compartmentId: firstNonEmpty(args["compartment-id"], process.env.SEIS_ORACLE_COMPARTMENT_OCID, ownerInputsFileValues.SEIS_ORACLE_COMPARTMENT_OCID),
  subnetId: firstNonEmpty(args["subnet-id"], process.env.SEIS_ORACLE_SUBNET_OCID, ownerInputsFileValues.SEIS_ORACLE_SUBNET_OCID),
  imageId: firstNonEmpty(args["image-id"], process.env.SEIS_ORACLE_IMAGE_OCID, ownerInputsFileValues.SEIS_ORACLE_IMAGE_OCID),
  publicIp: firstNonEmpty(
    args["public-ip"],
    process.env.SEIS_ORACLE_PUBLIC_IP,
    process.env.SEIS_CLOUD_PUBLIC_IP,
    process.env.SEIS_CLOUD_DIRECT_HOST,
    ownerInputsFileValues.SEIS_ORACLE_PUBLIC_IP,
    ownerInputsFileValues.SEIS_CLOUD_PUBLIC_IP,
    ownerInputsFileValues.SEIS_CLOUD_DIRECT_HOST
  )
};

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
  const publicKey = readPublicKey(publicKeyPath);
  const oci = probeOci();
  const launchReport = readJsonOptional(instanceLaunchReport);
  const cloudInit = inspectLocalFile(cloudInitYaml);
  const ownerInputState = summarizeOwnerInputs(ownerInputs);

  if (packageJson?.scripts?.["check:seis-ssh-oracle-owner-preflight"] !== "node scripts/create-seis-ssh-oracle-owner-preflight.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-owner-preflight must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-owner:preflight"] !== "node scripts/create-seis-ssh-oracle-owner-preflight.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:oracle-owner:preflight must be declared");
  }
  if (packageJson?.scripts?.["check:seis-ssh-oracle-owner-input-template"] !== "node scripts/create-seis-ssh-oracle-owner-input-template.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-owner-input-template must be declared");
  }
  if (contract?.ownerPreflight?.script !== "scripts/create-seis-ssh-oracle-owner-preflight.mjs") {
    integrityBlockers.push("Oracle plan must link owner preflight script");
  }
  if (contract?.ownerInputTemplate?.script !== "scripts/create-seis-ssh-oracle-owner-input-template.mjs") {
    integrityBlockers.push("Oracle plan must link owner input template script");
  }
  if (contract?.ownerPreflight?.callsProviderApis !== false || contract?.ownerPreflight?.createsVm !== false) {
    integrityBlockers.push("Oracle owner preflight must remain local-only and non-mutating");
  }
  if (matrix?.oracleOwnerPreflight?.script !== "scripts/create-seis-ssh-oracle-owner-preflight.mjs") {
    integrityBlockers.push("provider matrix must link Oracle owner preflight script");
  }
  if (matrix?.oracleOwnerInputTemplate?.script !== "scripts/create-seis-ssh-oracle-owner-input-template.mjs") {
    integrityBlockers.push("provider matrix must link Oracle owner input template script");
  }
  if (matrix?.oracleOwnerPreflight?.readsOciConfigContents !== false) {
    integrityBlockers.push("Oracle owner preflight must not read OCI config contents");
  }
  if (publicKey.present && !isSshPublicKey(publicKey.value)) {
    integrityBlockers.push("public key file must contain one SSH public key");
  }
  if (launchReport.present && launchReport.value?.mode !== "local-plan-only-no-provider-api-no-vm-create-no-live-ssh") {
    integrityBlockers.push("instance launch report must remain local-plan-only");
  }
  if (cloudInit.present && cloudInitSecretPattern().test(cloudInit.preview)) {
    integrityBlockers.push("cloud-init YAML must not contain private keys or provider secrets");
  }

  const localArtifactsReady = Boolean(
    publicKey.present
      && publicKey.valid
      && cloudInit.present
      && launchReport.present
      && launchReport.value?.ok === true
  );
  const ownerInputsReady = ownerInputState.required.every((input) => input.present && input.shapeLooksValid);
  const oracleSessionHintsPresent = existsSync(ociConfigPath) || existsSync(ociSessionDir);
  const readyToRunOwnerLaunchTemplate = Boolean(localArtifactsReady && oci.available && ownerInputsReady && oracleSessionHintsPresent);
  const status = integrityBlockers.length > 0
    ? "blocked-integrity"
    : readyToRunOwnerLaunchTemplate
      ? "owner-ready-to-run-launch-template"
      : localArtifactsReady
        ? "local-preflight-ready-owner-input-required"
        : "blocked-missing-local-preflight";

  const readinessBlockers = [
    ...(!oci.available ? ["OCI CLI is not available locally"] : []),
    ...(!existsSync(ociConfigPath) ? ["OCI config file is not present; authenticate outside git"] : []),
    ...(!existsSync(ociSessionDir) ? ["OCI session directory is not present; browser/device login may still be required"] : []),
    ...(!publicKey.present ? ["SEIS public key is missing"] : []),
    ...(publicKey.present && !publicKey.valid ? ["SEIS public key format is invalid"] : []),
    ...(!cloudInit.present ? ["Oracle cloud-init handoff YAML has not been generated"] : []),
    ...(!launchReport.present ? ["Oracle instance launch plan report has not been generated"] : []),
    ...ownerInputBlockers(ownerInputState.byKey.availabilityDomain, "availability domain"),
    ...ownerInputBlockers(ownerInputState.byKey.compartmentId, "compartment OCID"),
    ...ownerInputBlockers(ownerInputState.byKey.subnetId, "public subnet OCID"),
    ...ownerInputBlockers(ownerInputState.byKey.imageId, "image OCID"),
    "Always Free capacity is not proven by this local preflight",
    "No provider API is called, no VM is created, and no live SSH probe is attempted"
  ];

  return {
    id: "seis-ssh-oracle-owner-preflight",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status,
    mode: "local-owner-preflight-no-provider-api-no-vm-create-no-live-ssh-no-config-read",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    profile: redactLabel(profile),
    region: redactLabel(region),
    oci: {
      available: oci.available,
      resolved: oci.resolved,
      version: oci.version,
      configFilePresent: existsSync(ociConfigPath),
      configFilePath: redactHome(ociConfigPath),
      sessionDirectoryPresent: existsSync(ociSessionDir),
      sessionDirectoryPath: redactHome(ociSessionDir),
      providerApiCalled: false,
      configContentsRead: false
    },
    publicKey: {
      present: publicKey.present,
      valid: publicKey.valid,
      path: redactHome(publicKeyPath),
      fingerprint: publicKey.fingerprint,
      comment: publicKey.comment
    },
    localArtifacts: {
      cloudInitYaml: {
        path: cloudInitYaml,
        present: cloudInit.present,
        sha256Prefix: cloudInit.sha256Prefix
      },
      instanceLaunchReport: {
        path: instanceLaunchReport,
        present: launchReport.present,
        ok: launchReport.value?.ok === true,
        status: launchReport.value?.status || null,
        mode: launchReport.value?.mode || null
      }
    },
    ownerInputs: ownerInputState,
    readiness: {
      localArtifactsReady,
      ownerInputsReady,
      oracleSessionHintsPresent,
      readyToRunOwnerLaunchTemplate,
      directEndpointPresent: ownerInputState.byKey.publicIp.present
    },
    commands: {
      generatePlan: "npm run cloud:ssh:oracle-free-tier:plan",
      generateCloudInit: "npm run cloud:ssh:oracle-cloud-init:handoff",
      generateInstanceLaunchPlan: "npm run cloud:ssh:oracle-instance:plan",
      generateOwnerInputTemplate: "npm run cloud:ssh:oracle-owner:template",
      ownerPreflight: "npm run cloud:ssh:oracle-owner:preflight",
      ownerPreflightFromTemplate: "npm run cloud:ssh:oracle-owner:preflight -- --owner-inputs-file reports/seis-ssh-oracle-owner-input-template.env",
      ownerLogin: `oci session authenticate --region ${shellQuote(region)} --no-browser --profile-name ${shellQuote(profile)}`,
      launchTemplateSource: instanceLaunchReport,
      afterVmBoots: "npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      strictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
      strictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict"
    },
    readinessBlockers,
    integrityBlockers,
    safety: [
      "This script checks local file existence plus owner-provided input presence and shape validity.",
      "This script does not run oci compute instance launch.",
      "This script does not call Oracle APIs, create VMs, open SSH, write SSH config, or read OCI config contents.",
      "OCIDs, availability domains, public IPs, hostnames, and local identity paths are never printed in full.",
      "Private SSH key material is never read."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function summarizeOwnerInputs(values) {
  const required = [
    summarizeInput("availabilityDomain", "availability-domain", values.availabilityDomain, "label"),
    summarizeInput("compartmentId", "compartment-ocid", values.compartmentId, "ocid"),
    summarizeInput("subnetId", "public-subnet-ocid", values.subnetId, "ocid"),
    summarizeInput("imageId", "image-ocid", values.imageId, "ocid")
  ];
  const optional = [
    summarizeInput("publicIp", "post-boot-public-ip", values.publicIp, "endpoint")
  ];
  return {
    source: {
      precedence: "cli-args -> environment -> owner-inputs-file",
      ownerInputsFile: {
        configured: ownerInputsFile.configured,
        present: ownerInputsFile.present,
        path: ownerInputsFile.path,
        parsedKeys: ownerInputsFile.parsedKeys,
        rawValuesPrinted: false
      }
    },
    redaction: "presence-kind-sha256-prefix-only",
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

function classifyValue(value) {
  if (!value) return "missing";
  if (/^ocid1\./i.test(value)) return "ocid";
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return "ipv4";
  if (/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) return "hostname";
  return "label";
}

function inputShapeLooksValid(value, expectedKind) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/^<[^>]+>$/.test(text)) return false;
  if (/^(?:todo|tbd|placeholder|null|undefined)$/i.test(text)) return false;
  if (expectedKind === "ocid") return /^ocid1\.[A-Za-z0-9_.-]+$/i.test(value);
  if (expectedKind === "endpoint") return classifyValue(value) === "ipv4" || classifyValue(value) === "hostname";
  return value.length >= 3;
}

function cloudInitSecretPattern() {
  const providerAssignments = [
    ["OPENAI", "API", "KEY"],
    ["ANTHROPIC", "API", "KEY"],
    ["GEMINI", "API", "KEY"],
    ["AWS", "SECRET", "ACCESS", "KEY"]
  ].map((parts) => `${parts.join("_")}=`);
  return new RegExp([
    "BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY",
    ...providerAssignments.map(escapeRegExp),
    ["password", "="].join(""),
    ["token", "="].join("")
  ].join("|"), "i");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ownerInputBlockers(input, label) {
  if (!input.present) return [`${label} is missing`];
  if (!input.shapeLooksValid) return [`${label} is present but does not match the expected ${input.expectedKind} shape`];
  return [];
}

function readOwnerInputsFile(file) {
  if (!file) {
    return {
      configured: false,
      present: false,
      path: null,
      parsedKeys: [],
      values: {}
    };
  }
  if (!existsSync(file)) {
    return {
      configured: true,
      present: false,
      path: redactHome(file),
      parsedKeys: [],
      values: {}
    };
  }

  const values = parseOwnerInputsEnv(readFileSync(file, "utf8"));
  return {
    configured: true,
    present: true,
    path: redactHome(file),
    parsedKeys: Object.keys(values).sort(),
    values
  };
}

function parseOwnerInputsEnv(text) {
  const values = {};
  for (const line of String(text || "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const withoutExport = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
    const separator = withoutExport.indexOf("=");
    if (separator <= 0) continue;
    const key = withoutExport.slice(0, separator).trim();
    const rawValue = withoutExport.slice(separator + 1).trim();
    if (!/^SEIS_(?:ORACLE|CLOUD)_[A-Z0-9_]+$/.test(key)) continue;
    values[key] = stripEnvQuotes(rawValue);
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

function firstNonEmpty(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
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
  if (!existsSync(file)) {
    return { present: false, sha256Prefix: null, preview: "" };
  }
  const text = readFileSync(file, "utf8");
  return {
    present: true,
    sha256Prefix: sha256HexPrefix(text),
    preview: text.slice(0, 20000)
  };
}

function readPublicKey(file) {
  if (!existsSync(file)) return { present: false, valid: false, value: "", fingerprint: null, comment: null };
  const value = readFileSync(file, "utf8").trim();
  const parts = value.split(/\s+/);
  return {
    present: true,
    valid: isSshPublicKey(value),
    value,
    fingerprint: fingerprintPublicKey(value),
    comment: parts.slice(2).join(" ") || null
  };
}

function isSshPublicKey(value) {
  return /^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp(?:256|384|521)|sk-ssh-ed25519@openssh.com|sk-ecdsa-sha2-nistp256@openssh.com)\s+[A-Za-z0-9+/=]+(?:\s+.*)?$/.test(value);
}

function fingerprintPublicKey(value) {
  const parts = String(value || "").split(/\s+/);
  if (parts.length < 2) return null;
  try {
    const digest = createHash("sha256").update(Buffer.from(parts[1], "base64")).digest("base64").replace(/=+$/g, "");
    return `SHA256:${digest}`;
  } catch {
    return null;
  }
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
  return `# SEIS SSH Oracle Owner Preflight

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Provider: ${report.providerId}
Alias: ${report.targetAlias}

## Local Oracle State

| Field | Value |
| --- | --- |
| OCI CLI available | ${report.oci.available ? "yes" : "no"} |
| OCI CLI version | ${report.oci.version || "none"} |
| OCI config present | ${report.oci.configFilePresent ? "yes" : "no"} |
| OCI session dir present | ${report.oci.sessionDirectoryPresent ? "yes" : "no"} |
| OCI config contents read | no |
| Provider API called | no |

## Local Artifacts

| Artifact | Present | SHA-256 prefix |
| --- | --- | --- |
| Cloud-init YAML | ${report.localArtifacts.cloudInitYaml.present ? "yes" : "no"} | ${report.localArtifacts.cloudInitYaml.sha256Prefix || "none"} |
| Instance launch report | ${report.localArtifacts.instanceLaunchReport.present ? "yes" : "no"} | ${report.localArtifacts.instanceLaunchReport.status || "none"} |

## Owner Inputs

${renderInputTable(report.ownerInputs.required)}

## Optional Endpoint

${renderInputTable(report.ownerInputs.optional)}

## Readiness

| Gate | Value |
| --- | --- |
| Local artifacts ready | ${report.readiness.localArtifactsReady ? "yes" : "no"} |
| Owner inputs ready | ${report.readiness.ownerInputsReady ? "yes" : "no"} |
| Oracle session hints present | ${report.readiness.oracleSessionHintsPresent ? "yes" : "no"} |
| Ready to run owner launch template | ${report.readiness.readyToRunOwnerLaunchTemplate ? "yes" : "no"} |
| Direct endpoint present | ${report.readiness.directEndpointPresent ? "yes" : "no"} |

## Commands

\`\`\`bash
${report.commands.generatePlan}
${report.commands.generateCloudInit}
${report.commands.generateInstanceLaunchPlan}
${report.commands.generateOwnerInputTemplate}
${report.commands.ownerPreflight}
${report.commands.ownerPreflightFromTemplate}
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
  npm run cloud:ssh:oracle-owner:preflight
  npm run check:seis-ssh-oracle-owner-preflight
  node scripts/create-seis-ssh-oracle-owner-preflight.mjs --write

Options:
  --write                       Write JSON and Markdown reports.
  --check                       Validate local wiring without requiring owner inputs.
  --availability-domain VALUE   Owner-selected availability domain. Redacted in reports.
  --compartment-id OCID         Owner-selected compartment OCID. Redacted in reports.
  --subnet-id OCID              Owner-selected public subnet OCID. Redacted in reports.
  --image-id OCID               Owner-selected image OCID. Redacted in reports.
  --public-ip VALUE             Optional public IP or hostname after VM boot. Redacted in reports.
  --owner-inputs-file PATH      Optional local ignored env file with owner inputs.
  --profile NAME                OCI profile label. Default: SEIS.
  --region REGION               OCI region label. Default: eu-frankfurt-1.
  --oci-config PATH             OCI config existence check. Contents are not read.
  --cloud-init-yaml PATH        Cloud-init YAML path.
  --instance-launch-report PATH Instance launch plan report path.
  --output PATH                 JSON output path.
  --markdown PATH               Markdown output path.
`);
}
