#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const force = Boolean(args.force);
const outputEnv = args.env || "reports/seis-ssh-oracle-owner-input-template.env";
const outputJson = args.output || "reports/seis-ssh-oracle-owner-input-template.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-owner-input-template.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = buildReport();

if (write) {
  if (report.writePlan.envWillBeWritten) writeFile(outputEnv, renderEnvTemplate());
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
  const ownerPreflightSource = readText("scripts/create-seis-ssh-oracle-owner-preflight.mjs", integrityBlockers);
  const pipelineSource = readText("scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs", integrityBlockers);
  const template = renderEnvTemplate();
  const existingEnv = inspectExistingEnv(outputEnv);

  if (packageJson?.scripts?.["check:seis-ssh-oracle-owner-input-template"] !== "node scripts/create-seis-ssh-oracle-owner-input-template.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-owner-input-template must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-owner:template"] !== "node scripts/create-seis-ssh-oracle-owner-input-template.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:oracle-owner:template must be declared");
  }
  if (matrix?.oracleOwnerInputTemplate?.script !== "scripts/create-seis-ssh-oracle-owner-input-template.mjs") {
    integrityBlockers.push("provider matrix must link Oracle owner input template script");
  }
  if (matrix?.oracleOwnerInputTemplate?.printsSecrets !== false || matrix?.oracleOwnerInputTemplate?.committable !== false) {
    integrityBlockers.push("Oracle owner input template must be ignored and must not print secrets");
  }
  if (oraclePlan?.ownerInputTemplate?.script !== "scripts/create-seis-ssh-oracle-owner-input-template.mjs") {
    integrityBlockers.push("Oracle plan must link owner input template script");
  }
  if (oraclePlan?.ownerInputTemplate?.committable !== false || oraclePlan?.ownerInputTemplate?.callsProviderApis !== false) {
    integrityBlockers.push("Oracle owner input template must remain local-only and ignored");
  }
  if (!ownerPreflightSource.includes("--owner-inputs-file")) {
    integrityBlockers.push("Oracle owner preflight must accept --owner-inputs-file");
  }
  if (!ownerPreflightSource.includes("shapeLooksValid")) {
    integrityBlockers.push("Oracle owner preflight must validate owner input shape before readiness");
  }
  if (!pipelineSource.includes("--owner-inputs-file")) {
    integrityBlockers.push("Oracle pipeline must pass an owner inputs file to preflight when present");
  }
  if (secretPattern().test(template)) {
    integrityBlockers.push("owner input template must not contain credential-looking values");
  }
  if (existingEnv.present && existingEnv.containsDangerousPattern) {
    integrityBlockers.push("existing owner input template contains a dangerous credential-looking pattern");
  }

  const envWillBeWritten = write && (!existingEnv.present || force);
  const envWillBePreserved = existingEnv.present && !force;
  const status = integrityBlockers.length > 0
    ? "blocked-integrity"
    : existingEnv.present && !force
      ? "template-present-preserved-local-only"
      : "template-ready-local-only";

  return {
    id: "seis-ssh-oracle-owner-input-template",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status,
    mode: "local-template-only-no-provider-api-no-vm-create-no-live-ssh-no-secret-output",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    outputs: {
      env: outputEnv,
      json: outputJson,
      markdown: outputMarkdown,
      ignored: true,
      committable: false
    },
    writePlan: {
      force,
      envAlreadyPresent: existingEnv.present,
      envWillBeWritten,
      envWillBePreserved,
      existingEnv: {
        present: existingEnv.present,
        path: existingEnv.path,
        parsedKeys: existingEnv.parsedKeys,
        nonEmptyKeys: existingEnv.nonEmptyKeys,
        sha256Prefix: existingEnv.sha256Prefix,
        containsDangerousPattern: existingEnv.containsDangerousPattern,
        rawValuesPrinted: false
      }
    },
    template: {
      keys: [
        "SEIS_ORACLE_AVAILABILITY_DOMAIN",
        "SEIS_ORACLE_COMPARTMENT_OCID",
        "SEIS_ORACLE_SUBNET_OCID",
        "SEIS_ORACLE_IMAGE_OCID",
        "SEIS_ORACLE_PUBLIC_IP",
        "SEIS_CLOUD_DIRECT_USER",
        "SEIS_CLOUD_DIRECT_PORT"
      ],
      blankValues: true,
      sourceableAfterOwnerFillsValues: true,
      sha256Prefix: sha256HexPrefix(template)
    },
    commands: {
      createTemplate: "npm run cloud:ssh:oracle-owner:template",
      forceRegenerateTemplate: "node scripts/create-seis-ssh-oracle-owner-input-template.mjs --write --force",
      ownerPreflightFromTemplate: "npm run cloud:ssh:oracle-owner:preflight -- --owner-inputs-file reports/seis-ssh-oracle-owner-input-template.env",
      directCloudPipeline: "npm run cloud:ssh:oracle-direct-cloud:pipeline"
    },
    safety: [
      "The generated env file is local-only and ignored.",
      "The template ships with blank values, not placeholder OCIDs or endpoints.",
      "An existing owner input env file is preserved by default; use --force only after review.",
      "Owner-provided values are read only by local preflight and reported as presence, kind, and SHA-256 prefixes.",
      "This script does not call Oracle APIs, create VMs, open SSH, write SSH config, or read private keys.",
      "Do not paste tokens, private keys, OCI config contents, or session files into the template."
    ],
    integrityBlockers
  };
}

function renderEnvTemplate() {
  return `# SEIS SSH Oracle owner input template.
# Local-only. This file is ignored and must not be committed.
# Fill these values from Oracle Console or OCI CLI outside git.
# Then run:
# npm run cloud:ssh:oracle-owner:preflight -- --owner-inputs-file reports/seis-ssh-oracle-owner-input-template.env

SEIS_ORACLE_AVAILABILITY_DOMAIN=""
SEIS_ORACLE_COMPARTMENT_OCID=""
SEIS_ORACLE_SUBNET_OCID=""
SEIS_ORACLE_IMAGE_OCID=""

# Optional after the VM boots.
SEIS_ORACLE_PUBLIC_IP=""

# Defaults used by the SEIS cloud-init handoff.
SEIS_CLOUD_DIRECT_USER="aiuser"
SEIS_CLOUD_DIRECT_PORT="22"
`;
}

function renderMarkdown(report) {
  return `# SEIS SSH Oracle Owner Input Template

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Provider: ${report.providerId}
Alias: ${report.targetAlias}

## Outputs

| Output | Path |
| --- | --- |
| env template | ${report.outputs.env} |
| JSON report | ${report.outputs.json} |
| Markdown report | ${report.outputs.markdown} |

The env template is ignored and local-only.

## Commands

\`\`\`bash
${report.commands.createTemplate}
${report.commands.forceRegenerateTemplate}
${report.commands.ownerPreflightFromTemplate}
${report.commands.directCloudPipeline}
\`\`\`

## Write Plan

| Field | Value |
| --- | --- |
| env already present | ${report.writePlan.envAlreadyPresent ? "yes" : "no"} |
| env will be written | ${report.writePlan.envWillBeWritten ? "yes" : "no"} |
| env will be preserved | ${report.writePlan.envWillBePreserved ? "yes" : "no"} |
| force | ${report.writePlan.force ? "yes" : "no"} |

## Template Keys

${report.template.keys.map((key) => `- ${key}`).join("\n")}

## Safety

${renderList(report.safety, "none")}

## Integrity Blockers

${renderList(report.integrityBlockers, "none")}
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

function readText(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function inspectExistingEnv(file) {
  if (!existsSync(file)) {
    return {
      present: false,
      path: file,
      parsedKeys: [],
      nonEmptyKeys: [],
      sha256Prefix: null,
      containsDangerousPattern: false
    };
  }
  const text = readFileSync(file, "utf8");
  const values = parseEnvValues(text);
  return {
    present: true,
    path: file,
    parsedKeys: Object.keys(values).sort(),
    nonEmptyKeys: Object.entries(values).filter(([, value]) => String(value || "").trim()).map(([key]) => key).sort(),
    sha256Prefix: sha256HexPrefix(text),
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

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function sha256HexPrefix(value) {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, 12);
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
  npm run cloud:ssh:oracle-owner:template
  npm run check:seis-ssh-oracle-owner-input-template
  node scripts/create-seis-ssh-oracle-owner-input-template.mjs --write

Options:
  --write          Write the local env template and reports.
  --check          Validate local wiring without writing files.
  --force          Overwrite an existing env template after review.
  --env PATH       Env template output path.
  --output PATH    JSON output path.
  --markdown PATH  Markdown output path.
`);
}
