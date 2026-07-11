#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const alias = args.host || "SEIS-SSH";
const outputJson = args.output || "reports/seis-ssh-public-access/latest.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-public-access/latest.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = buildReport(alias);

if (write) {
  writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(report));
}

if (!write) {
  console.log(JSON.stringify(report, null, 2));
}

if (check && !report.ok) {
  process.exit(1);
}

function buildReport(targetAlias) {
  const failures = [];
  const warnings = [];
  const contract = readJson("deploy/seis-ssh-public-access-contract.json", failures);
  const accessModel = readJson("deploy/seis-ssh-access-model.json", failures);
  const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json", failures);
  const packageJson = readJson("package.json", failures);
  const runbook = readText("docs/deployment/seis-ssh-public-github-access.md", failures);
  const desktop = readText("apps/web/desktop.js", failures);

  if (contract?.targetAlias !== "SEIS-SSH") failures.push("contract targetAlias must be SEIS-SSH");
  if (contract?.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") failures.push("contract must preserve existing server and port");
  if (contract?.endpointContinuity?.mode !== "sanitized-runtime-snapshot") failures.push("contract must define sanitized endpoint continuity evidence");
  if (packageJson?.scripts?.["check:seis-ssh-endpoint-continuity"] !== "node scripts/check-seis-ssh-endpoint-continuity.mjs") failures.push("endpoint continuity check script must be declared");
  if (accessModel?.publicAccessContract !== "deploy/seis-ssh-public-access-contract.json") failures.push("access model must link public access contract");
  if (roadmap?.publicAccessContract !== "deploy/seis-ssh-public-access-contract.json") failures.push("roadmap must link public access contract");
  if (packageJson?.scripts?.["report:seis-ssh-public-access"] !== "node scripts/create-seis-ssh-public-access-report.mjs --write") failures.push("package report script must be declared");
  if (packageJson?.scripts?.["check:seis-ssh-public-access-report"] !== "node scripts/create-seis-ssh-public-access-report.mjs --check") failures.push("package report check script must be declared");
  if (!runbook.includes("npm run report:seis-ssh-public-access")) failures.push("runbook must document report command");
  if (!desktop.includes("report:seis-ssh-public-access")) warnings.push("Desktop surface does not mention the report command");

  const sshConfig = inspectSshConfig(targetAlias);
  if (!sshConfig.configured) warnings.push("local SEIS-SSH config was not resolved by ssh -G");
  if (sshConfig.transport === "local-or-lan") failures.push("SEIS-SSH must not resolve to localhost or .local");
  if (sshConfig.alias !== "SEIS-SSH") failures.push("public report must inspect SEIS-SSH");

  const ok = failures.length === 0;
  const readinessReady = ok && sshConfig.configured === true;
  return {
    id: "seis-ssh-public-access-report",
    generatedAt: new Date().toISOString(),
    ok,
    status: readinessReady ? "review-ready" : "blocked",
    readinessReady,
    mode: "read-only-no-live-ssh",
    alias: targetAlias,
    contract: "deploy/seis-ssh-public-access-contract.json",
    runbook: "docs/deployment/seis-ssh-public-github-access.md",
    serverAndPortPolicy: {
      invariant: "Keep the same server and port.",
      turkishInvariant: "Ayni sunucu ve baglanti noktasi korunur.",
      preservationMode: contract?.serverAndPortPolicy?.mode || "unknown",
      mutationAllowed: false,
      migrationRequiresApproval: true
    },
    localSshConfig: sshConfig,
    evidence: {
      packageScripts: {
        check: packageJson?.scripts?.["check:seis-ssh-public-access"] || null,
        report: packageJson?.scripts?.["report:seis-ssh-public-access"] || null,
        reportCheck: packageJson?.scripts?.["check:seis-ssh-public-access-report"] || null
      },
      docs: [
        "docs/deployment/seis-ssh-public-github-access.md",
        "docs/deployment/seis-ssh-access-model.md",
        "docs/deployment/seis-ssh-cloud-roadmap.md",
        "README.md",
        "docs/STATUS.md"
      ],
      staticGates: contract?.requiredCommands || []
    },
    blockers: failures,
    warnings,
    nextActions: nextActions(failures, warnings, sshConfig),
    safety: [
      "This report does not open a live SSH session.",
      "This report does not print private keys, tokens, cookies, or provider credentials.",
      "Direct hostnames are redacted; endpoint continuity is checked separately from this public report.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function inspectSshConfig(targetAlias) {
  const configText = safeRead(join(homedir(), ".ssh", "config"));
  if (!hasExplicitHostBlock(configText, targetAlias)) {
    return {
      checked: true,
      configured: false,
      explicitHostBlock: false,
      alias: targetAlias,
      error: "explicit-host-block-missing"
    };
  }

  const result = spawnSync("ssh", ["-G", targetAlias], {
    encoding: "utf8",
    timeout: 10000
  });
  if (result.status !== 0) {
    return {
      checked: true,
      configured: false,
      explicitHostBlock: true,
      alias: targetAlias,
      error: sanitize(result.stderr || "ssh -G failed")
    };
  }

  const values = parseSshConfig(result.stdout || "");
  const hostname = values.hostname || "";
  const proxyCommand = normalizeNone(values.proxycommand);
  const port = values.port || "22";
  const transport = detectTransport(hostname, proxyCommand);

  return {
    checked: true,
    configured: true,
    explicitHostBlock: true,
    alias: targetAlias,
    transport,
    hostnameKind: classifyHostname(hostname, transport),
    endpointFingerprintSha256Prefix: hostname ? endpointFingerprint(hostname, port, proxyCommand) : null,
    proxyCommandShape: normalizeProxyCommandShape(proxyCommand),
    port,
    userPresent: Boolean(values.user),
    proxyCommandPresent: Boolean(proxyCommand),
    identityFileConfigured: Boolean(normalizeNone(values.identityfile)),
    pickerLikelyCompatible: transport === "direct-cloud",
    liveConnectionAttempted: false,
    serverAndPortPreservedByPolicy: true,
    continuityState: "sanitized-config-snapshot-no-committed-baseline"
  };
}

function hasExplicitHostBlock(configText, targetAlias) {
  return configText.split(/\r?\n/).some((line) => {
    const match = /^\s*Host\s+(.+)$/.exec(line);
    return Boolean(match && match[1].trim().split(/\s+/).includes(targetAlias));
  });
}

function safeRead(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
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

function normalizeNone(value) {
  if (!value || value === "none") return null;
  return value;
}

function detectTransport(hostname, proxyCommand) {
  const host = String(hostname || "").toLowerCase();
  if (host === "github.codespaces" && String(proxyCommand || "").includes("gh cs ssh")) return "codespace";
  if (isLocalHost(host)) return "local-or-lan";
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

function isLocalHost(host) {
  const value = String(host || "").toLowerCase();
  const ipv4 = value.split(".").map(Number);
  const privateIpv4 = ipv4.length === 4 && ipv4.every(Number.isInteger) && ipv4.every((part) => part >= 0 && part <= 255)
    && (ipv4[0] === 10 || (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) || (ipv4[0] === 192 && ipv4[1] === 168) || (ipv4[0] === 169 && ipv4[1] === 254));
  const ipv6 = value.replace(/^\[|\]$/g, "").split("%")[0];
  const privateIpv6 = /^(?:fc|fd)[0-9a-f]{2}:|^fe[89ab][0-9a-f]:/i.test(ipv6);
  return value === "localhost"
    || value === "127.0.0.1"
    || value === "::1"
    || value.endsWith(".local")
    || privateIpv4
    || privateIpv6;
}

function endpointFingerprint(hostname, port, proxyCommand) {
  return createHash("sha256")
    .update([hostname, port, proxyCommand || "none"].join("\0"))
    .digest("hex")
    .slice(0, 16);
}

function normalizeProxyCommandShape(value) {
  if (!value) return null;
  const normalized = String(value).replace(/\s+/g, " ").trim();
  if (/(?:^|\s)(?:\S+\/)?gh\s+cs\s+ssh(?:\s|$)/.test(normalized)) {
    return "gh cs ssh <codespace-endpoint>";
  }
  return "proxy-command-present";
}

function sanitize(value) {
  return String(value || "")
    .replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, "[redacted-private-key]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[redacted-api-key]")
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .slice(0, 400);
}

function nextActions(failures, warnings, sshConfig) {
  const actions = [];
  if (failures.length > 0) actions.push("Fix public access contract blockers, then rerun npm run check:seis-ssh-public-access-report.");
  if (!sshConfig.configured) actions.push("Install or restore the single SEIS-SSH alias before live readiness review.");
  if (sshConfig.transport === "codespace") actions.push("Codespaces is terminal-compatible; use an approved direct-cloud endpoint only if picker compatibility or mobile 24x7 is required.");
  if (sshConfig.transport === "direct-cloud") actions.push("Run strict live checks only after owner approval: npm run cloud:ssh:online:strict.");
  if (warnings.length > 0) actions.push("Review warnings before public release claims.");
  if (actions.length === 0) actions.push("Attach this sanitized report to the SEIS-SSH public access PR review.");
  return actions;
}

function renderMarkdown(report) {
  return `# SEIS SSH Public Access Report

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Alias: ${report.alias}

## Server And Port Policy

- ${report.serverAndPortPolicy.invariant}
- ${report.serverAndPortPolicy.turkishInvariant}
- Preservation mode: ${report.serverAndPortPolicy.preservationMode}
- Migration requires approval: ${report.serverAndPortPolicy.migrationRequiresApproval ? "yes" : "no"}

## Local SSH Config Snapshot

- Configured: ${report.localSshConfig.configured ? "yes" : "no"}
- Transport: ${report.localSshConfig.transport || "unknown"}
- Hostname kind: ${report.localSshConfig.hostnameKind || "unknown"}
- Port: ${report.localSshConfig.port || "unknown"}
- ProxyCommand present: ${report.localSshConfig.proxyCommandPresent ? "yes" : "no"}
- Identity file configured: ${report.localSshConfig.identityFileConfigured ? "yes" : "no"}
- Live connection attempted: no

## Blockers

${report.blockers.length ? report.blockers.map((item) => `- ${item}`).join("\n") : "- none"}

## Warnings

${report.warnings.length ? report.warnings.map((item) => `- ${item}`).join("\n") : "- none"}

## Next Actions

${report.nextActions.map((item) => `- ${item}`).join("\n")}

## Safety

${report.safety.map((item) => `- ${item}`).join("\n")}
`;
}

function readJson(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function readText(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function writeFile(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
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
  npm run check:seis-ssh-public-access-report
  npm run report:seis-ssh-public-access
  node scripts/create-seis-ssh-public-access-report.mjs --host SEIS-SSH --write

Options:
  --host HOST        SSH alias to inspect with ssh -G. Default: SEIS-SSH.
  --write            Write JSON and Markdown reports.
  --check            Exit non-zero if static contract/report wiring is blocked.
  --output PATH      JSON output path. Default: reports/seis-ssh-public-access/latest.json.
  --markdown PATH    Markdown output path. Default: reports/seis-ssh-public-access/latest.md.
`);
}
