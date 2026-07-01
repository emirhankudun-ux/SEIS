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
const outputJson = args.output || "reports/seis-ssh-direct-cloud-activation-plan.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-direct-cloud-activation-plan.md";
const workspaceRoot = resolve(process.cwd(), "..");
const bundledPython = join(homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "bin", "python3");

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = buildPlan();

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

if (requireReady && !report.activationReady) {
  process.exit(1);
}

function buildPlan() {
  const integrityBlockers = [];
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const packageJson = readJson("package.json", integrityBlockers);
  const publicKey = inspectPublicKey();
  const ssh = inspectSshAlias("SEIS-SSH");
  const tools = inspectTools();
  const directEndpoint = inspectDirectEndpoint();

  if (matrix?.targetAlias !== "SEIS-SSH") integrityBlockers.push("provider matrix must target SEIS-SSH");
  if (matrix?.activationPlanner?.script !== "scripts/create-seis-ssh-direct-cloud-activation-plan.mjs") {
    integrityBlockers.push("provider matrix must link activation planner script");
  }
  if (packageJson?.scripts?.["cloud:ssh:direct-cloud:plan"] !== "node scripts/create-seis-ssh-direct-cloud-activation-plan.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:direct-cloud:plan must be declared");
  }
  if (packageJson?.scripts?.["check:seis-ssh-direct-cloud-activation-plan"] !== "node scripts/create-seis-ssh-direct-cloud-activation-plan.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-direct-cloud-activation-plan must be declared");
  }

  const readinessBlockers = [];
  if (ssh.transport !== "direct-cloud") readinessBlockers.push("SEIS-SSH is not direct-cloud yet");
  if (!directEndpoint.present) readinessBlockers.push("No direct-cloud endpoint env/input is present");
  if (!publicKey.present) readinessBlockers.push("SEIS public key is missing");
  if (!tools.oci.available) readinessBlockers.push("Oracle CLI is not available locally");
  readinessBlockers.push("Strict direct-cloud probe and doctor still need a real approved endpoint");

  const activationReady = readinessBlockers.length === 1
    && readinessBlockers[0] === "Strict direct-cloud probe and doctor still need a real approved endpoint";

  return {
    id: "seis-ssh-direct-cloud-activation-plan",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status: activationReady ? "activation-inputs-ready" : "blocked-waiting-for-cloud-endpoint",
    mode: "read-only-no-auth-no-cloud-mutation-no-config-write-no-live-ssh",
    targetAlias: "SEIS-SSH",
    activationReady,
    providerRecommendation: matrix?.decisionPolicy?.activeRecommendation || null,
    providerOrder: matrix?.decisionPolicy?.recommendedOrder || [],
    currentSsh: ssh,
    directEndpoint,
    publicKey,
    localTools: tools,
    providerReadiness: providerReadiness({ tools, ssh, directEndpoint, publicKey }),
    readinessBlockers,
    integrityBlockers,
    nextActions: nextActions({ tools, ssh, directEndpoint, publicKey }),
    commands: {
      safePlan: "npm run cloud:ssh:direct-cloud:plan",
      verifyPlan: "npm run check:seis-ssh-direct-cloud-activation-plan",
      oracleLogin: "oci session authenticate --region eu-frankfurt-1 --no-browser --profile-name SEIS",
      oracleAfterVm: "npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      directCloudStrictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
      directCloudStrictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict",
      cloudflareAfterOrigin: "cloudflared tunnel login",
      codespacesFallbackCheck: "npm run check:seis-ssh-picker-compatibility"
    },
    safety: [
      "This plan does not call cloud provider APIs.",
      "This plan does not call gh auth status or print GitHub tokens.",
      "This plan does not open a live SSH session.",
      "This plan does not write ~/.ssh/config.",
      "This plan never reads or prints SSH private key material.",
      "Cloudflare is allowed only as an access layer after a real cloud origin exists.",
      "Changing SEIS-SSH HostName or Port remains owner-approval gated."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function inspectTools() {
  return {
    node: toolProbe("node", [process.execPath], ["--version"]),
    gh: toolProbe("gh", [
      process.env.SEIS_GH_BIN,
      join(homedir(), ".local", "bin", "gh"),
      join(workspaceRoot, ".local", "bin", "gh"),
      "gh"
    ], ["--version"]),
    oci: toolProbe("oci", [
      process.env.SEIS_OCI_BIN,
      join(process.cwd(), ".local", "oci-cli-venv", "bin", "oci"),
      join(workspaceRoot, ".local", "oci-cli-venv", "bin", "oci"),
      join(homedir(), ".local", "bin", "oci"),
      "oci"
    ], ["--version"]),
    cloudflared: toolProbe("cloudflared", [
      process.env.SEIS_CLOUDFLARED_BIN,
      join(process.cwd(), ".local", "bin", "cloudflared"),
      join(workspaceRoot, ".local", "bin", "cloudflared"),
      join(homedir(), ".local", "bin", "cloudflared"),
      "cloudflared"
    ], ["--version"]),
    gcloud: toolProbe("gcloud", [
      process.env.SEIS_GCLOUD_BIN,
      join(process.cwd(), ".local", "google-cloud-sdk", "bin", "gcloud"),
      join(workspaceRoot, ".local", "google-cloud-sdk", "bin", "gcloud"),
      join(homedir(), "google-cloud-sdk", "bin", "gcloud"),
      "gcloud"
    ], ["--version"], {
      CLOUDSDK_PYTHON: process.env.CLOUDSDK_PYTHON || (existsSync(bundledPython) ? bundledPython : undefined),
      CLOUDSDK_CONFIG: process.env.CLOUDSDK_CONFIG || join(workspaceRoot, ".local", "gcloud-config")
    })
  };
}

function toolProbe(name, candidates, versionArgs, envOverrides = {}) {
  let firstInstalledFailure = null;
  for (const candidate of candidates.filter(Boolean)) {
    if (candidate.includes("/") && !isExecutable(candidate)) continue;
    const result = spawnSync(candidate, versionArgs, {
      encoding: "utf8",
      env: cleanEnv({
        ...process.env,
        ...envOverrides
      }),
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

function cleanEnv(env) {
  return Object.fromEntries(Object.entries(env).filter(([, value]) => value !== undefined && value !== null));
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
      userPresent: false,
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
    userPresent: Boolean(values.user),
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

function providerReadiness({ tools, ssh, directEndpoint, publicKey }) {
  return [
    {
      id: "oracle-cloud-free-tier",
      state: tools.oci.available ? "cli-present-login-or-vm-still-required" : "cli-missing",
      next: tools.oci.available
        ? "Complete OCI browser session and create/select the VM outside git."
        : "Install or expose OCI CLI, then authenticate outside git.",
      canProceedWithoutSecrets: tools.oci.available && publicKey.present,
      blockers: [
        ...(!tools.oci.available ? ["oci-cli-missing"] : []),
        ...(!publicKey.present ? ["seis-public-key-missing"] : []),
        ...(!directEndpoint.present ? ["oracle-vm-public-endpoint-missing"] : [])
      ]
    },
    {
      id: "github-codespaces",
      state: ssh.transport === "codespace" ? "current-terminal-fallback" : "not-current",
      next: "Use only as terminal-compatible fallback; it is not mobile 24x7 direct-cloud.",
      canProceedWithoutSecrets: tools.gh.available,
      blockers: ssh.transport === "codespace" ? ["not-mobile-24x7", "proxycommand-picker-warning"] : []
    },
    {
      id: "cloudflare-access-tunnel",
      state: tools.cloudflared.available ? "cli-present-origin-still-required" : "cli-missing",
      next: "Use Cloudflare only after Oracle/GCP or another real cloud origin exists.",
      canProceedWithoutSecrets: tools.cloudflared.available && directEndpoint.present,
      blockers: [
        ...(!tools.cloudflared.available ? ["cloudflared-cli-missing"] : []),
        ...(!directEndpoint.present ? ["real-cloud-origin-missing"] : [])
      ]
    },
    {
      id: "google-cloud-compute",
      state: tools.gcloud.available
        ? "cli-present-billing-iam-still-required"
        : (tools.gcloud.installed ? "cli-installed-runtime-blocked" : "cli-missing"),
      next: "Use after billing, Compute API, IAM, and firewall scope are verified.",
      canProceedWithoutSecrets: tools.gcloud.available && publicKey.present,
      blockers: [
        ...(!tools.gcloud.available ? [tools.gcloud.installed ? "gcloud-runtime-blocked" : "gcloud-cli-missing"] : []),
        "billing-and-iam-not-proven"
      ]
    }
  ];
}

function nextActions({ tools, ssh, directEndpoint, publicKey }) {
  const actions = [];
  if (!publicKey.present) actions.push("Create or restore the public key file for SEIS-SSH; do not copy private keys into git.");
  if (!tools.oci.available) actions.push("Make OCI CLI available before continuing the Oracle path.");
  if (tools.oci.available && !directEndpoint.present) actions.push("Complete Oracle login and create/select a free-tier VM outside git.");
  if (ssh.transport === "codespace") actions.push("Keep Codespaces as fallback until a direct-cloud endpoint exists.");
  if (tools.cloudflared.available && !directEndpoint.present) actions.push("Wait to use Cloudflare until a real cloud origin exists.");
  if (directEndpoint.present) actions.push("After owner approval, run strict direct-cloud probe and doctor before changing readiness claims.");
  if (actions.length === 0) actions.push("Run npm run cloud:ssh:direct-cloud:plan after selecting the provider path.");
  return actions;
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

function sanitize(value) {
  return String(value || "")
    .replaceAll(homedir(), "~")
    .replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, "[redacted-private-key]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[redacted-api-key]")
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .slice(0, 600);
}

function renderMarkdown(report) {
  return `# SEIS SSH Direct-Cloud Activation Plan

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Alias: ${report.targetAlias}

## Recommendation

${report.providerRecommendation?.path || "No provider recommendation found."}

${report.providerRecommendation?.reason || ""}

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

## Local Tools

| Tool | Installed | Available | Resolved | Version / error |
| --- | --- | --- | --- | --- |
${Object.entries(report.localTools).map(([name, item]) => `| ${name} | ${item.installed ? "yes" : "no"} | ${item.available ? "yes" : "no"} | ${item.resolved || "none"} | ${item.version || item.error || "unknown"} |`).join("\n")}

## Provider Readiness

${report.providerReadiness.map((provider) => `### ${provider.id}

- State: ${provider.state}
- Can proceed without secrets: ${provider.canProceedWithoutSecrets ? "yes" : "no"}
- Next: ${provider.next}
- Blockers: ${provider.blockers.length ? provider.blockers.join(", ") : "none"}`).join("\n\n")}

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
  npm run cloud:ssh:direct-cloud:plan
  npm run check:seis-ssh-direct-cloud-activation-plan
  node scripts/create-seis-ssh-direct-cloud-activation-plan.mjs --write

Options:
  --write                 Write JSON and Markdown reports.
  --check                 Validate planner integrity without requiring a live endpoint.
  --require-ready         Exit non-zero unless direct-cloud activation inputs look ready.
  --direct-host HOST      Optional direct-cloud host. Redacted in reports.
  --public-ip IP          Optional direct-cloud public IP. Redacted in reports.
  --direct-port PORT      Optional SSH port. Default: 22.
  --public-key PATH       Optional public key path. Default: ~/.ssh/id_ed25519_seis_codex.pub.
  --output PATH           JSON output path.
  --markdown PATH         Markdown output path.
`);
}
