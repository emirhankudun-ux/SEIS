#!/usr/bin/env node

import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const directHostArg = args["direct-host"] || process.env.SEIS_CLOUD_DIRECT_HOST || "";
const directPublicIp = args["public-ip"] || process.env.SEIS_CLOUD_PUBLIC_IP || "";
const provider = args.provider || process.env.SEIS_CLOUD_PROVIDER || "";
const project = args.project || process.env.SEIS_CLOUD_PROJECT || "";
const directUser = args["direct-user"] || process.env.SEIS_CLOUD_DIRECT_USER || "root";
const directPort = args["direct-port"] || process.env.SEIS_CLOUD_DIRECT_PORT || "22";
const directIdentityFile = expandHome(
  args["identity-file"]
  || process.env.SEIS_CLOUD_DIRECT_IDENTITY_FILE
  || `${homedir()}/.ssh/id_ed25519_seis_codex`
);
const skipMobileCheck = Boolean(args["skip-mobile-check"]);

const resolvedHost = resolveDirectHost(directHostArg, directPublicIp, provider, project);
const errors = [];

if (!resolvedHost.value) {
  errors.push("--direct-host/--public-ip veya --provider + --project için karşılık gelen host bilgisi gerekli.");
}
if (!directUser || !/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(directUser)) {
  errors.push("--direct-user invalid.");
}
if (!/^[0-9]+$/.test(String(directPort)) || Number(directPort) < 1 || Number(directPort) > 65535) {
  errors.push("--direct-port must be 1-65535.");
}
if (!existsSync(directIdentityFile)) {
  errors.push(`direct-cloud-identity-file-missing: ${redactHome(directIdentityFile)}`);
}

if (errors.length > 0) {
  console.log(JSON.stringify({
    ok: false,
    mode: "blocked",
    errors
  }, null, 2));
  process.exit(1);
}

const switchResult = run("npm", [
  "run",
  "cloud:ssh:direct-cloud:switch",
  "--",
  "--direct-host",
  resolvedHost.value,
  "--direct-user",
  directUser,
  "--direct-port",
  String(directPort),
  "--identity-file",
  directIdentityFile,
  "--apply"
]);

if (switchResult.status !== 0) {
  console.log(JSON.stringify({
    ok: false,
    mode: "blocked",
    switchResult: {
      status: switchResult.status,
      stderr: sanitize(switchResult.stderr),
      stdout: sanitize(switchResult.stdout)
    },
    errors: ["direct-cloud-switch-failed"]
  }, null, 2));
  process.exit(1);
}

let mobileCheck = null;
if (!skipMobileCheck) {
  const mobileResult = run("npm", [
    "run",
    "cloud:ssh:mobile-24x7:strict"
  ]);
  mobileCheck = {
    ok: mobileResult.status === 0,
    status: mobileResult.status,
    stdout: sanitize(mobileResult.stdout),
    stderr: sanitize(mobileResult.stderr)
  };
}

console.log(JSON.stringify({
  ok: !skipMobileCheck ? (mobileCheck?.ok ?? false) : true,
  mode: "ready",
  targetAlias: "SEIS-SSH",
  transport: "direct-cloud",
  directHost: redactEndpoint(resolvedHost.value),
  directHostKind: classifyEndpoint(resolvedHost.value),
  directHostSha256Prefix: sha256HexPrefix(resolvedHost.value),
  directHostSource: resolvedHost.source,
  directUser,
  directPort,
  directIdentityFile: redactHome(directIdentityFile),
  switchResult: {
    status: switchResult.status,
    stdout: sanitize(switchResult.stdout)
  },
  mobile24x7Ready: mobileCheck ? mobileCheck.ok : null,
  mobileCheck
}, null, 2));

function resolveDirectHost(directHost, publicIp, cloudProvider, cloudProject) {
  if (directHost) {
    return { source: "direct-host", value: directHost };
  }
  if (publicIp) {
    return { source: "public-ip", value: publicIp };
  }
  if (cloudProvider && cloudProject) {
    const lookupKey = `SEIS_CLOUD_${normalizeLookup(cloudProvider)}_${normalizeLookup(cloudProject)}_HOST`;
    const fromEnv = process.env[lookupKey] || "";
    if (fromEnv) {
      return { source: `env:${lookupKey}`, value: fromEnv };
    }
  }
  return { source: null, value: null };
}

function normalizeLookup(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9_]+/g, "_");
}

function run(command, argv) {
  const out = spawnSync(command, argv, {
    encoding: "utf8",
    shell: false,
    timeout: 120000
  });
  return {
    status: out.status ?? 1,
    stdout: out.stdout || "",
    stderr: out.stderr || ""
  };
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "apply" || key === "skip-mobile-check") {
      parsed[key] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

function expandHome(value) {
  const text = String(value || "");
  if (text === "~") return homedir();
  if (text.startsWith("~/")) return join(homedir(), text.slice(2));
  return text;
}

function redactHome(value) {
  return String(value || "").replaceAll(homedir(), "~");
}

function classifyEndpoint(targetHost) {
  const value = String(targetHost || "").toLowerCase();
  if (!value) return "missing";
  if (value === "localhost" || value === "127.0.0.1" || value === "::1" || value.endsWith(".local")) {
    return "blocked-local-host";
  }
  const privateMatch = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (privateMatch) {
    const first = Number(privateMatch[1]);
    const second = Number(privateMatch[2]);
    if (first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168)) {
      return "private-network-host";
    }
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(value)) return "public-ip-or-unverified-ip";
  return "dns-name";
}

function redactEndpoint(value) {
  if (!value) return null;
  return classifyEndpoint(value) === "dns-name" ? "redacted-direct-cloud-dns" : "redacted-direct-cloud-host";
}

function sha256HexPrefix(value) {
  return value ? createHash("sha256").update(String(value)).digest("hex").slice(0, 12) : null;
}

function sanitize(value) {
  return String(value || "")
    .replaceAll(homedir(), "~")
    .replace(/ocid1\.[A-Za-z0-9_.-]+/g, "[redacted-ocid]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted-ip]")
    .replace(/("directHost"\s*:\s*)"[^"]+"/g, `$1"${redactEndpoint(resolvedHost.value) || "redacted-direct-cloud-host"}"`)
    .replace(/("identityFile"\s*:\s*)"[^"]+"/g, `$1"~/.ssh/[redacted-identity-file]"`)
    .replace(/gho_[A-Za-z0-9_]+/g, "gho_************************************")
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[redacted-github-token]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-************************************")
    .trim();
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh:direct-cloud:activate -- --public-ip 203.0.113.10 --direct-user root
  npm run cloud:ssh:direct-cloud:activate -- --direct-host 21.0.3.171 --direct-user root
  npm run cloud:ssh:direct-cloud:activate -- --provider digitalocean --project seis-prod --public-ip 203.0.113.10 --direct-user root
  npm run cloud:ssh:direct-cloud:activate -- --public-ip 203.0.113.10 --skip-mobile-check

Options:
  --public-ip IP               Public IP to use as direct-cloud endpoint.
  --direct-host HOST           Direct cloud SSH hostname or IP.
  --provider PROVIDER          Optional provider identifier (env lookup key).
  --project PROJECT            Optional provider project identifier.
  --direct-user USER           SSH user. Default: root.
  --direct-port PORT           SSH port. Default: 22.
  --identity-file PATH         Identity file for direct-cloud mode.
  --skip-mobile-check          Skip strict mobile 24/7 gate at the end.
`);
}
