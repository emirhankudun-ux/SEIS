#!/usr/bin/env node

import { createHash } from "node:crypto";
import { accessSync, constants, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const requireReady = Boolean(args["require-ready"]);
const outputJson = args.output || "reports/seis-ssh-oracle-free-tier-plan.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-free-tier-plan.md";
const workspaceRoot = resolve(process.cwd(), "..");

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = buildReport();

if (write) {
  writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(report));
}

if (!write) {
  console.log(JSON.stringify(report, null, 2));
}

if (check && report.integrityBlockers.length > 0) {
  process.exit(1);
}

if (requireReady && !report.readyForDirectCloudActivation) {
  process.exit(1);
}

function buildReport() {
  const integrityBlockers = [];
  const contract = readJson("deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json", integrityBlockers);
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const packageJson = readJson("package.json", integrityBlockers);
  const publicKey = inspectPublicKey();
  const oci = inspectOci();
  const ssh = inspectSshAlias("SEIS-SSH");
  const directEndpoint = inspectDirectEndpoint();
  const localPreflightReady = oci.available && publicKey.present;
  const readyForDirectCloudActivation = localPreflightReady && directEndpoint.present;

  if (contract?.id !== "seis-ssh-oracle-free-tier-direct-cloud-plan") {
    integrityBlockers.push("Oracle plan id must be stable");
  }
  if (contract?.providerId !== "oracle-cloud-free-tier") {
    integrityBlockers.push("Oracle plan must target oracle-cloud-free-tier");
  }
  if (contract?.planner?.script !== "scripts/create-seis-ssh-oracle-free-tier-plan.mjs") {
    integrityBlockers.push("Oracle plan must link this planner script");
  }
  if (contract?.planner?.runbook !== "docs/deployment/seis-ssh-oracle-free-tier-direct-cloud.md") {
    integrityBlockers.push("Oracle plan must link its runbook");
  }
  if (contract?.planner?.callsProviderApis !== false || contract?.planner?.createsVm !== false) {
    integrityBlockers.push("Oracle planner must remain non-mutating");
  }
  if (matrix?.oracleFreeTierPlanner?.script !== "scripts/create-seis-ssh-oracle-free-tier-plan.mjs") {
    integrityBlockers.push("provider matrix must link Oracle planner script");
  }
  if (packageJson?.scripts?.["check:seis-ssh-oracle-free-tier-plan"] !== "node scripts/create-seis-ssh-oracle-free-tier-plan.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-free-tier-plan must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-free-tier:plan"] !== "node scripts/create-seis-ssh-oracle-free-tier-plan.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:oracle-free-tier:plan must be declared");
  }

  const readinessBlockers = [
    ...(!oci.available ? ["OCI CLI is not available locally"] : []),
    ...(!publicKey.present ? ["SEIS public key is missing"] : []),
    ...(!directEndpoint.present ? ["Oracle VM endpoint input is missing"] : []),
    ...(ssh.transport !== "direct-cloud" ? ["SEIS-SSH is not direct-cloud yet"] : []),
    "Oracle account session, tenancy, compartment, and VM capacity are not proven by this local plan",
    "Oracle cloud-init handoff has not been applied to a real VM",
    "Strict direct-cloud probe and doctor have not passed"
  ];

  return {
    id: "seis-ssh-oracle-free-tier-plan-report",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status: statusFor({ localPreflightReady, readyForDirectCloudActivation }),
    mode: "read-only-no-auth-no-cloud-mutation-no-config-write-no-live-ssh",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    localPreflightReady,
    readyForDirectCloudActivation,
    mobile24x7Ready: false,
    contract: {
      source: "deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json",
      qualityGate: contract?.qualityGate || null,
      runbook: contract?.planner?.runbook || null
    },
    currentSsh: ssh,
    oracle: oci,
    directEndpoint,
    publicKey,
    readinessBlockers,
    integrityBlockers,
    nextActions: nextActions({ oci, publicKey, directEndpoint, ssh }),
    commands: {
      localPlan: "npm run cloud:ssh:oracle-free-tier:plan",
      localCheck: "npm run check:seis-ssh-oracle-free-tier-plan",
      cloudInitHandoff: "npm run cloud:ssh:oracle-cloud-init:handoff",
      cloudInitHandoffCheck: "npm run check:seis-ssh-oracle-cloud-init-handoff",
      oracleLogin: `oci session authenticate --region ${oci.region} --no-browser --profile-name ${oci.profile}`,
      afterVmExists: "npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      strictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
      strictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict"
    },
    safety: [
      "This planner does not authenticate to Oracle.",
      "This planner does not call Oracle APIs.",
      "This planner does not create or mutate cloud resources.",
      "This planner does not open a live SSH session.",
      "This planner does not write ~/.ssh/config.",
      "This planner never reads or prints SSH private key material.",
      "OCI config/session file contents are not read; only path existence is reported.",
      "Direct-cloud activation output is redacted and uses endpoint kind plus SHA-256 prefix for continuity.",
      "Oracle hostnames, IPs, OCIDs, and profile details stay redacted in reports."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function statusFor({ localPreflightReady, readyForDirectCloudActivation }) {
  if (readyForDirectCloudActivation) return "endpoint-input-ready-owner-approval-required";
  if (localPreflightReady) return "local-preflight-ready-waiting-for-oracle-vm";
  return "blocked-missing-local-oracle-inputs";
}

function inspectOci() {
  const profile = args.profile || process.env.SEIS_OCI_PROFILE || process.env.OCI_CLI_PROFILE || "SEIS";
  const region = args.region || process.env.SEIS_ORACLE_REGION || process.env.OCI_CLI_REGION || "eu-frankfurt-1";
  const configFile = args["oci-config"]
    || process.env.SEIS_OCI_CONFIG_FILE
    || process.env.OCI_CLI_CONFIG_FILE
    || process.env.OCI_CONFIG_FILE
    || join(homedir(), ".oci", "config");
  const sessionDir = process.env.OCI_CLI_AUTH === "security_token"
    ? join(dirname(configFile), "sessions")
    : join(dirname(configFile), "sessions");
  const tool = toolProbe("oci", [
    process.env.SEIS_OCI_BIN,
    join(process.cwd(), ".local", "oci-cli-venv", "bin", "oci"),
    join(workspaceRoot, ".local", "oci-cli-venv", "bin", "oci"),
    join(homedir(), ".local", "bin", "oci"),
    "oci"
  ], ["--version"]);

  return {
    ...tool,
    profile: redactLabel(profile),
    region: redactLabel(region),
    configFilePresent: existsSync(configFile),
    configFilePath: sanitizePath(configFile),
    sessionDirectoryPresent: existsSync(sessionDir),
    sessionDirectoryPath: sanitizePath(sessionDir),
    authenticated: "not-checked",
    providerApiCalled: false,
    configContentsRead: false
  };
}

function inspectPublicKey() {
  const keyPath = args["public-key"] || process.env.SEIS_SSH_PUBLIC_KEY_FILE || join(homedir(), ".ssh", "id_ed25519_seis_codex.pub");
  if (!existsSync(keyPath)) {
    return {
      present: false,
      path: sanitizePath(keyPath),
      fingerprint: null,
      comment: null
    };
  }

  const text = readOptional(keyPath).trim();
  const parts = text.split(/\s+/);
  const keygen = spawnSync("ssh-keygen", ["-lf", keyPath], {
    encoding: "utf8",
    timeout: 8000
  });
  const fingerprint = (keygen.status ?? 1) === 0
    ? parseOpenSshFingerprint(keygen.stdout)
    : (text ? `SHA256:${sha256Base64(parts[1] || text)}` : null);

  return {
    present: true,
    path: sanitizePath(keyPath),
    fingerprint,
    comment: parts.slice(2).join(" ") || null
  };
}

function inspectSshAlias(alias) {
  const result = spawnSync("ssh", ["-G", alias], {
    encoding: "utf8",
    timeout: 10000
  });

  if ((result.status ?? 1) !== 0) {
    return {
      checked: true,
      configured: false,
      alias,
      transport: "unknown",
      hostnameKind: "missing",
      hostnameSha256Prefix: null,
      port: "22",
      proxyCommandPresent: false,
      liveConnectionAttempted: false,
      error: sanitize(result.stderr || "ssh -G failed")
    };
  }

  const values = parseSshConfig(result.stdout || "");
  const hostname = values.hostname || "";
  const proxyCommand = normalizeNone(values.proxycommand);
  const transport = detectTransport(hostname, proxyCommand);

  return {
    checked: true,
    configured: true,
    alias,
    transport,
    hostnameKind: classifyHostname(hostname, transport),
    hostnameSha256Prefix: hostname ? sha256HexPrefix(hostname) : null,
    port: values.port || "22",
    proxyCommandPresent: Boolean(proxyCommand),
    identityFileConfigured: Boolean(normalizeNone(values.identityfile)),
    pickerLikelyCompatible: transport === "direct-cloud",
    liveConnectionAttempted: false
  };
}

function inspectDirectEndpoint() {
  const host = args["direct-host"]
    || args["public-ip"]
    || process.env.SEIS_CLOUD_DIRECT_HOST
    || process.env.SEIS_CLOUD_PUBLIC_IP
    || process.env.SEIS_SSH_HOST
    || "";
  const port = String(args["direct-port"] || process.env.SEIS_CLOUD_DIRECT_PORT || process.env.SEIS_SSH_PORT || "22");

  return {
    present: Boolean(host),
    hostKind: host ? classifyEndpoint(host) : "missing",
    hostSha256Prefix: host ? sha256HexPrefix(host) : null,
    port,
    source: endpointSource(args),
    liveProbeAttempted: false
  };
}

function nextActions({ oci, publicKey, directEndpoint, ssh }) {
  const actions = [];
  if (!oci.available) actions.push("Make OCI CLI available locally before continuing the Oracle path.");
  if (!publicKey.present) actions.push("Create or restore the SEIS public key; do not copy private keys into git.");
  if (publicKey.present) actions.push("Generate and review the Oracle cloud-init handoff before creating the VM.");
  if (oci.available && publicKey.present && !directEndpoint.present) actions.push("Complete Oracle login, select tenancy/region/compartment, and create or select an Always Free VM outside git.");
  if (directEndpoint.present) actions.push("Use the owner-approved direct-cloud activation command, then run strict probe and doctor.");
  if (ssh.transport === "codespace") actions.push("Keep Codespaces as fallback until Oracle direct-cloud proof exists.");
  actions.push("Use Cloudflare only after the Oracle VM origin exists and the access policy is identity-gated.");
  return actions;
}

function toolProbe(name, candidates, versionArgs) {
  let firstInstalledFailure = null;
  for (const candidate of candidates.filter(Boolean)) {
    if (candidate.includes("/") && !isExecutable(candidate)) continue;
    const result = spawnSync(candidate, versionArgs, {
      encoding: "utf8",
      env: process.env,
      timeout: 8000
    });
    if ((result.status ?? 1) === 0) {
      const version = sanitize(`${result.stdout || ""}\n${result.stderr || ""}`).split(/\r?\n/).find(Boolean) || "available";
      return {
        available: true,
        installed: true,
        command: name,
        resolved: sanitizePath(candidate),
        version,
        error: null
      };
    }
    if (candidate.includes("/") && !firstInstalledFailure) {
      firstInstalledFailure = {
        available: false,
        installed: true,
        command: name,
        resolved: sanitizePath(candidate),
        version: null,
        error: sanitize(`${result.stderr || ""}\n${result.stdout || ""}`).split(/\r?\n/).find(Boolean) || "version probe failed"
      };
    }
  }
  return firstInstalledFailure || {
    available: false,
    installed: false,
    command: name,
    resolved: null,
    version: null,
    error: null
  };
}

function parseSshConfig(output) {
  const values = {};
  for (const line of output.split(/\r?\n/)) {
    const index = line.indexOf(" ");
    if (index < 0) continue;
    const key = line.slice(0, index).trim().toLowerCase();
    if (!Object.hasOwn(values, key)) values[key] = line.slice(index + 1).trim();
  }
  return values;
}

function detectTransport(hostname, proxyCommand) {
  const host = String(hostname || "").toLowerCase();
  if (host === "github.codespaces" && String(proxyCommand || "").includes("gh cs ssh")) return "codespace";
  if (isLocalHost(host) || isPrivateHost(host)) return "local-or-lan";
  if (host && !proxyCommand) return "direct-cloud";
  return "unknown";
}

function classifyHostname(hostname, transport) {
  if (!hostname) return "missing";
  if (transport === "codespace") return "github.codespaces";
  if (transport === "local-or-lan") return "blocked-local-or-lan";
  if (transport === "direct-cloud") return "redacted-direct-cloud-host";
  return "redacted-unknown-host";
}

function classifyEndpoint(host) {
  const value = String(host || "").toLowerCase();
  if (isLocalHost(value)) return "blocked-local-host";
  if (isPrivateHost(value)) return "private-network-host";
  if (/^\d+\.\d+\.\d+\.\d+$/.test(value)) return "public-ip-or-unverified-ip";
  return "dns-name";
}

function endpointSource(parsedArgs) {
  if (parsedArgs["direct-host"]) return "arg:direct-host";
  if (parsedArgs["public-ip"]) return "arg:public-ip";
  if (process.env.SEIS_CLOUD_DIRECT_HOST) return "env:SEIS_CLOUD_DIRECT_HOST";
  if (process.env.SEIS_CLOUD_PUBLIC_IP) return "env:SEIS_CLOUD_PUBLIC_IP";
  if (process.env.SEIS_SSH_HOST) return "env:SEIS_SSH_HOST";
  return null;
}

function normalizeNone(value) {
  if (!value || value === "none") return null;
  return value;
}

function isLocalHost(host) {
  const value = String(host || "").toLowerCase();
  return value === "localhost"
    || value === "127.0.0.1"
    || value === "::1"
    || value.endsWith(".local");
}

function isPrivateHost(host) {
  const match = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(String(host || ""));
  if (!match) return false;
  const first = Number(match[1]);
  const second = Number(match[2]);
  return first === 10
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168);
}

function isExecutable(file) {
  try {
    accessSync(file, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function readJson(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function readOptional(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function sha256HexPrefix(value) {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, 12);
}

function sha256Base64(value) {
  return createHash("sha256").update(String(value)).digest("base64").replace(/=+$/g, "");
}

function parseOpenSshFingerprint(output) {
  const match = /\b(SHA256:[^\s]+)/.exec(String(output || ""));
  return match ? match[1] : null;
}

function sanitizePath(value) {
  return String(value || "").replaceAll(homedir(), "~");
}

function redactLabel(value) {
  const text = String(value || "");
  if (!text) return "none";
  if (/^ocid1\./i.test(text)) return "redacted-ocid";
  if (/^\d+\.\d+\.\d+\.\d+$/.test(text)) return "redacted-ip";
  return text.replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 80);
}

function sanitize(value) {
  return String(value || "")
    .replaceAll(homedir(), "~")
    .replace(/ocid1\.[A-Za-z0-9_.-]+/g, "[redacted-ocid]")
    .replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, "[redacted-private-key]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[redacted-api-key]")
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .slice(0, 600);
}

function renderMarkdown(report) {
  return `# SEIS SSH Oracle Free Tier Plan

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Alias: ${report.targetAlias}
Provider: ${report.providerId}

## Readiness

| Field | Value |
| --- | --- |
| Local preflight ready | ${report.localPreflightReady ? "yes" : "no"} |
| Direct-cloud activation input ready | ${report.readyForDirectCloudActivation ? "yes" : "no"} |
| Mobile 24x7 ready | no |

## Oracle Local State

| Field | Value |
| --- | --- |
| OCI CLI available | ${report.oracle.available ? "yes" : "no"} |
| Resolved | ${report.oracle.resolved || "none"} |
| Version / error | ${report.oracle.version || report.oracle.error || "unknown"} |
| Profile | ${report.oracle.profile} |
| Region | ${report.oracle.region} |
| Config file present | ${report.oracle.configFilePresent ? "yes" : "no"} |
| Config file path | ${report.oracle.configFilePath} |
| Session directory present | ${report.oracle.sessionDirectoryPresent ? "yes" : "no"} |
| Provider API called | no |
| Config contents read | no |

## Current SEIS-SSH

| Field | Value |
| --- | --- |
| Configured | ${report.currentSsh.configured ? "yes" : "no"} |
| Transport | ${report.currentSsh.transport} |
| Hostname kind | ${report.currentSsh.hostnameKind} |
| Host fingerprint | ${report.currentSsh.hostnameSha256Prefix || "none"} |
| Port | ${report.currentSsh.port} |
| ProxyCommand present | ${report.currentSsh.proxyCommandPresent ? "yes" : "no"} |
| Live SSH attempted | no |

## Direct Endpoint Input

| Field | Value |
| --- | --- |
| Present | ${report.directEndpoint.present ? "yes" : "no"} |
| Host kind | ${report.directEndpoint.hostKind} |
| Host fingerprint | ${report.directEndpoint.hostSha256Prefix || "none"} |
| Port | ${report.directEndpoint.port} |
| Source | ${report.directEndpoint.source || "none"} |
| Live probe attempted | no |

## Public Key

| Field | Value |
| --- | --- |
| Present | ${report.publicKey.present ? "yes" : "no"} |
| Path | ${report.publicKey.path} |
| Fingerprint | ${report.publicKey.fingerprint || "none"} |
| Comment | ${report.publicKey.comment || "none"} |

## Readiness Blockers

${renderList(report.readinessBlockers, "none")}

## Integrity Blockers

${renderList(report.integrityBlockers, "none")}

## Next Actions

${renderList(report.nextActions, "none")}

## Commands

\`\`\`bash
${Object.values(report.commands).join("\n")}
\`\`\`

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
  npm run cloud:ssh:oracle-free-tier:plan
  npm run check:seis-ssh-oracle-free-tier-plan
  node scripts/create-seis-ssh-oracle-free-tier-plan.mjs --write

Options:
  --write                 Write JSON and Markdown reports.
  --check                 Validate planner integrity without requiring Oracle login.
  --require-ready         Exit non-zero unless a direct-cloud endpoint input exists.
  --direct-host HOST      Optional Oracle direct-cloud host. Redacted in reports.
  --public-ip IP          Optional Oracle public IP. Redacted in reports.
  --direct-port PORT      Optional SSH port. Default: 22.
  --public-key PATH       Optional public key path. Default: ~/.ssh/id_ed25519_seis_codex.pub.
  --profile NAME          Oracle CLI profile label for the owner-side login command.
  --region REGION         Oracle region label for the owner-side login command.
  --oci-config PATH       Optional OCI config path existence check. Contents are not read.
  --output PATH           JSON output path.
  --markdown PATH         Markdown output path.
`);
}
