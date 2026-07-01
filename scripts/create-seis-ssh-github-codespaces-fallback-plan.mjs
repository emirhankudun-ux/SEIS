#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const alias = args.host || "SEIS-SSH";
const outputJson = args.output || "reports/seis-ssh-github-codespaces-fallback-plan.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-github-codespaces-fallback-plan.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = buildReport(alias);

if (write) {
  writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(report));
}

if (!write) console.log(JSON.stringify(report, null, 2));

if (check && report.integrityBlockers.length > 0) process.exit(1);

function buildReport(targetAlias) {
  const integrityBlockers = [];
  const packageJson = readJson("package.json", integrityBlockers);
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const publicContract = readJson("deploy/seis-ssh-public-access-contract.json", integrityBlockers);
  const gh = toolProbe("gh", ["gh", join(homedir(), ".local", "bin", "gh")]);
  const ssh = inspectSshConfig(targetAlias);

  if (packageJson?.scripts?.["check:seis-ssh-github-codespaces-fallback-plan"] !== "node scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-github-codespaces-fallback-plan must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:github-codespaces:fallback-plan"] !== "node scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:github-codespaces:fallback-plan must be declared");
  }
  if (matrix?.githubCodespacesFallbackPlan?.script !== "scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs") {
    integrityBlockers.push("provider matrix must link GitHub Codespaces fallback plan script");
  }
  if (matrix?.githubCodespacesFallbackPlan?.fallbackOnly !== true || matrix?.githubCodespacesFallbackPlan?.supportsMobile24x7WhenVerified !== false) {
    integrityBlockers.push("GitHub Codespaces fallback plan must stay fallback-only and not mobile 24x7");
  }
  if (matrix?.githubCodespacesFallbackPlan?.callsProviderApis !== false || matrix?.githubCodespacesFallbackPlan?.opensSshSession !== false) {
    integrityBlockers.push("GitHub Codespaces fallback plan must remain local-only");
  }
  if (!(publicContract?.requiredCommands || []).includes("npm run check:seis-ssh-github-codespaces-fallback-plan")) {
    integrityBlockers.push("public access contract must require GitHub Codespaces fallback plan check");
  }

  const fallbackMatchesCurrentAlias = ssh.configured === true && ssh.transport === "codespace";
  const status = integrityBlockers.length > 0
    ? "blocked-integrity"
    : fallbackMatchesCurrentAlias
      ? "fallback-terminal-compatible-not-24x7"
      : "fallback-plan-ready-current-alias-not-codespaces";

  return {
    id: "seis-ssh-github-codespaces-fallback-plan",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status,
    mode: "local-github-codespaces-fallback-plan-no-auth-status-no-live-ssh-no-config-write",
    targetAlias,
    providerId: "github-codespaces",
    providerRole: "terminal-compatible-development-fallback",
    fallbackOnly: true,
    supportsMobile24x7WhenVerified: false,
    gh,
    sshConfig: ssh,
    readiness: {
      ghCliAvailable: gh.available,
      aliasConfigured: ssh.configured === true,
      terminalCompatible: ssh.terminalCompatible === true,
      pickerCompatible: false,
      mobile24x7Ready: false,
      directCloudReady: false,
      fallbackMatchesCurrentAlias
    },
    ownerRunOrder: [
      "Use Codespaces only as a terminal-compatible fallback while Oracle direct-cloud is blocked.",
      "Do not claim Codespaces is ChatGPT mobile 24x7 direct-cloud readiness.",
      "Use npm run check:seis-ssh-picker-compatibility to keep the ProxyCommand warning visible.",
      "Move SEIS-SSH to an approved Oracle or other direct-cloud endpoint only after owner-approved endpoint migration.",
      "Keep GitHub auth, Codespaces identity files, tokens, and private keys outside git."
    ],
    blockers: [
      ...(!gh.available ? ["gh CLI is missing or unavailable"] : []),
      ...(ssh.configured ? [] : ["SEIS-SSH alias is not configured locally"]),
      ...(ssh.transport === "codespace" ? ["Codespaces can sleep and is not mobile 24x7 direct-cloud readiness"] : []),
      ...(ssh.proxyCommandPresent ? ["ProxyCommand may render offline in generic SSH pickers"] : [])
    ],
    integrityBlockers,
    safety: [
      "This fallback plan does not call GitHub APIs.",
      "This fallback plan does not run gh auth status.",
      "This fallback plan does not open SSH.",
      "This fallback plan does not write SSH config.",
      "This fallback plan does not print ProxyCommand, tokens, private keys, or Codespaces identity files.",
      "Codespaces remains fallbackOnly until a verified direct-cloud endpoint replaces it with owner approval."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function inspectSshConfig(targetAlias) {
  const result = spawnSync("ssh", ["-G", targetAlias], {
    encoding: "utf8",
    timeout: 10000,
    env: cleanEnv(process.env)
  });

  if ((result.status ?? 1) !== 0) {
    return {
      checked: true,
      configured: false,
      alias: targetAlias,
      error: sanitize(result.stderr || "ssh -G failed"),
      liveConnectionAttempted: false
    };
  }

  const values = parseSshConfig(result.stdout || "");
  const hostname = values.hostname || "";
  const proxyCommand = normalizeNone(values.proxycommand);
  const transport = detectTransport(hostname, proxyCommand);

  return {
    checked: true,
    configured: Boolean(hostname),
    alias: targetAlias,
    transport,
    hostnameKind: classifyHostname(hostname, transport),
    hostnameSha256Prefix: hostname ? sha256Prefix(hostname) : null,
    port: values.port || "22",
    userPresent: Boolean(values.user),
    proxyCommandPresent: Boolean(proxyCommand),
    proxyCommandPrinted: false,
    identityFileConfigured: Boolean(normalizeNone(values.identityfile)),
    terminalCompatible: transport === "codespace" || transport === "direct-cloud",
    pickerCompatible: transport === "direct-cloud",
    liveConnectionAttempted: false
  };
}

function toolProbe(name, candidates) {
  for (const candidate of candidates.filter(Boolean)) {
    if (candidate.includes("/") && !existsSync(candidate)) continue;
    const result = spawnSync(candidate, ["--version"], {
      encoding: "utf8",
      timeout: 8000,
      env: cleanEnv(process.env)
    });
    if ((result.status ?? 1) === 0) {
      const version = sanitize(`${result.stdout || ""}\n${result.stderr || ""}`).split(/\r?\n/).find(Boolean) || "available";
      return {
        available: true,
        installed: true,
        command: name,
        resolved: redactHome(candidate),
        version,
        providerApiCalled: false,
        authStatusChecked: false
      };
    }
  }
  return {
    available: false,
    installed: false,
    command: name,
    resolved: null,
    version: null,
    providerApiCalled: false,
    authStatusChecked: false
  };
}

function renderMarkdown(report) {
  return `# SEIS SSH GitHub Codespaces Fallback Plan

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Provider: ${report.providerId}
Alias: ${report.targetAlias}

## Fallback Evidence

| Gate | Value |
| --- | --- |
| gh CLI available | ${report.readiness.ghCliAvailable ? "yes" : "no"} |
| alias configured | ${report.readiness.aliasConfigured ? "yes" : "no"} |
| terminal compatible | ${report.readiness.terminalCompatible ? "yes" : "no"} |
| picker compatible | no |
| mobile 24x7 ready | no |
| ProxyCommand present | ${report.sshConfig.proxyCommandPresent ? "yes" : "no"} |

## Owner Run Order

${report.ownerRunOrder.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## Blockers And Limits

${renderList(report.blockers, "none")}

## Integrity Blockers

${renderList(report.integrityBlockers, "none")}

## Safety

${renderList(report.safety, "none")}
`;
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
  if (host && !proxyCommand && !isLocalHost(host)) return "direct-cloud";
  if (isLocalHost(host)) return "local-or-lan";
  return "unknown";
}

function classifyHostname(hostname, transport) {
  if (!hostname) return "missing";
  if (transport === "codespace") return "github.codespaces";
  if (transport === "direct-cloud") return "redacted-direct-cloud-host";
  if (transport === "local-or-lan") return "blocked-local-or-lan";
  return "redacted-unknown-host";
}

function isLocalHost(host) {
  const value = String(host || "").toLowerCase();
  return value === "localhost"
    || value === "127.0.0.1"
    || value === "::1"
    || value.endsWith(".local");
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

function writeFile(file, content) {
  const absolute = resolve(file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function cleanEnv(env) {
  const next = { ...env };
  for (const key of Object.keys(next)) {
    if (/TOKEN|SECRET|PASSWORD|PRIVATE|KEY|COOKIE|CERT/i.test(key)) delete next[key];
  }
  return next;
}

function sanitize(value) {
  return String(value || "")
    .replaceAll(homedir(), "~")
    .replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, "[redacted-private-key]")
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[redacted-api-key]")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .trim();
}

function redactHome(value) {
  return String(value || "").replaceAll(homedir(), "~");
}

function sha256Prefix(value) {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, 12);
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
  console.log(`Usage: node scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs [--check] [--write]

Creates a local-only GitHub Codespaces fallback plan for SEIS-SSH.

Options:
  --check          Validate integrity and print JSON.
  --write          Write ignored JSON and Markdown reports.
  --host NAME      SSH alias to inspect. Default: SEIS-SSH.
  --output PATH    JSON output path. Default: reports/seis-ssh-github-codespaces-fallback-plan.json.
  --markdown PATH  Markdown output path. Default: reports/seis-ssh-github-codespaces-fallback-plan.md.
`);
}
