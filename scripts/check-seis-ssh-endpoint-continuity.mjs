#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));
const alias = args.alias || "SEIS-SSH";
const baselinePath = args.baseline || "reports/seis-ssh-public-access/endpoint-continuity-baseline.json";
const outputPath = args.output || "reports/seis-ssh-public-access/endpoint-continuity-latest.json";

if (args.help) {
  printHelp();
  process.exit(0);
}

const result = buildResult();

if (args.record && result.snapshot) {
  const existing = readJson(baselinePath);
  const changed = existing?.endpointFingerprintSha256Prefix
    && existing.endpointFingerprintSha256Prefix !== result.snapshot.endpointFingerprintSha256Prefix;
  const recordable = result.blockers.every((item) => [
    "continuity-baseline-required",
    "endpoint-fingerprint-or-port-does-not-match-baseline"
  ].includes(item));

  if (!recordable) {
    result.ok = false;
    result.status = "recording-refused-for-config-blocker";
    result.nextActions.unshift("Fix the SSH config policy blockers before recording a continuity baseline.");
  } else if (changed && !args["approve-endpoint-migration"]) {
    result.ok = false;
    result.status = "endpoint-changed-baseline-not-overwritten";
    result.blockers.push("baseline-mismatch-requires-explicit-endpoint-migration-approval");
    result.nextActions.unshift("Do not overwrite the baseline; review the server or port change and obtain explicit owner approval.");
  } else {
    writeJson(baselinePath, {
      version: 1,
      id: "seis-ssh-endpoint-continuity-baseline",
      recordedAt: new Date().toISOString(),
      alias,
      ...result.snapshot,
      migrationApproval: changed ? {
        required: true,
        supplied: true,
        reason: args.reason || "explicit owner approval was supplied outside this read-only check"
      } : {
        required: false,
        supplied: false
      }
    });
    result.blockers = result.blockers.filter((item) => item !== "continuity-baseline-required" && item !== "endpoint-fingerprint-or-port-does-not-match-baseline");
    result.warnings = [];
    result.baseline = { path: baselinePath, action: changed ? "updated-after-approved-migration" : "recorded" };
    result.status = changed ? "migration-recorded-after-approval" : "continuity-baseline-recorded";
    result.ok = result.blockers.length === 0;
    result.nextActions = ["Rerun npm run check:seis-ssh-endpoint-continuity to confirm the recorded baseline."].concat(
      changed ? ["Keep the approved migration reason with the review record; do not change the endpoint again without approval."] : []
    );
  }
}

if (args.write) writeJson(outputPath, result);
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);

function buildResult() {
  const blockers = [];
  const warnings = [];
  const contract = readJson("deploy/seis-ssh-public-access-contract.json");
  const continuity = contract?.endpointContinuity || {};
  const configured = inspectSshConfig(alias);

  if (alias !== "SEIS-SSH") blockers.push("endpoint-continuity-must-inspect-SEIS-SSH");
  if (continuity.mode !== "sanitized-runtime-snapshot") blockers.push("contract-endpoint-continuity-mode-is-invalid");
  if (continuity.migrationRequiresApproval !== true) blockers.push("endpoint-migration-must-require-owner-approval");
  if (!configured.configured) blockers.push("ssh-config-unavailable");
  if (configured.transport === "local-or-lan") blockers.push("SEIS-SSH-resolves-to-local-or-lan");
  if (configured.port !== String(continuity.currentObservedPort || "22")) {
    blockers.push("configured-port-does-not-match-recorded-current-port");
  }

  const snapshot = configured.configured ? {
    transport: configured.transport,
    hostnameKind: configured.hostnameKind,
    endpointFingerprintSha256Prefix: configured.endpointFingerprintSha256Prefix,
    proxyCommandShape: configured.proxyCommandShape,
    port: configured.port,
    liveConnectionAttempted: false,
    serverAndPortPreservedByPolicy: true
  } : null;

  const baseline = readJson(baselinePath);
  let status = blockers.length > 0 ? "blocked" : "baseline-required";
  if (snapshot && baseline?.endpointFingerprintSha256Prefix) {
    if (baseline.endpointFingerprintSha256Prefix === snapshot.endpointFingerprintSha256Prefix
      && String(baseline.port) === String(snapshot.port)) {
      status = "continuity-preserved";
    } else {
      blockers.push("endpoint-fingerprint-or-port-does-not-match-baseline");
      status = "endpoint-changed-owner-review-required";
    }
  } else if (!baseline && blockers.length === 0) {
    blockers.push("continuity-baseline-required");
    warnings.push("no-local-continuity-baseline-recorded");
  }

  return {
    id: "seis-ssh-endpoint-continuity-check",
    generatedAt: new Date().toISOString(),
    ok: blockers.length === 0 && status === "continuity-preserved",
    status,
    mode: "read-only-no-live-ssh-no-config-write",
    alias,
    baseline: { path: baselinePath, present: Boolean(baseline) },
    snapshot,
    blockers,
    warnings,
    nextActions: nextActions(status),
    safety: [
      "This check runs ssh -G only and never opens an SSH session.",
      "The endpoint fingerprint hashes the resolved host, port, and normalized ProxyCommand; raw values are never written to the report.",
      "A mismatch stops the check and never changes ~/.ssh/config or the baseline automatically.",
      "Changing HostName or Port remains approval-gated."
    ]
  };
}

function inspectSshConfig(targetAlias) {
  const result = spawnSync("ssh", ["-G", targetAlias], { encoding: "utf8", timeout: 10000 });
  if (result.status !== 0) return { configured: false, alias: targetAlias };

  const values = parseSshConfig(result.stdout || "");
  const hostname = values.hostname || "";
  const proxyCommand = normalizeNone(values.proxycommand);
  const port = values.port || "22";
  const transport = detectTransport(hostname, proxyCommand);
  return {
    configured: true,
    alias: targetAlias,
    transport,
    hostnameKind: classifyHostname(hostname, transport),
    endpointFingerprintSha256Prefix: endpointFingerprint(hostname, port, proxyCommand),
    proxyCommandShape: normalizeProxyCommandShape(proxyCommand),
    port
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

function normalizeNone(value) {
  return !value || value === "none" ? null : value;
}

function normalizeProxyCommandShape(value) {
  if (!value) return null;
  return String(value)
    .replace(/^\S*\/gh(?=\s+cs\s+ssh)/, "gh")
    .replace(/(\s-c\s+)\S+/g, "$1<codespace>")
    .replace(/(\s-i\s+)\S+/g, "$1<identity-file>")
    .replace(/\s+/g, " ")
    .trim();
}

function endpointFingerprint(hostname, port, proxyCommand) {
  return createHash("sha256")
    .update([hostname, port, proxyCommand || "none"].join("\0"))
    .digest("hex")
    .slice(0, 16);
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
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local");
}

function nextActions(status) {
  if (status === "baseline-required") return [
    "Review the sanitized snapshot, then run npm run record:seis-ssh-endpoint-continuity once for this machine.",
    "Rerun npm run check:seis-ssh-endpoint-continuity and attach the sanitized result to the PR."
  ];
  if (status === "endpoint-changed-owner-review-required" || status === "endpoint-changed-baseline-not-overwritten") return [
    "Stop before migration; compare the sanitized fingerprint and port with the approved SEIS-SSH endpoint.",
    "Only after explicit owner approval, record a new baseline with --approve-endpoint-migration and --reason."
  ];
  if (status === "continuity-preserved") return ["Keep the existing SEIS-SSH server and port unchanged."];
  return ["Fix the endpoint check blockers, then rerun npm run check:seis-ssh-endpoint-continuity."];
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (["help", "record", "write", "approve-endpoint-migration"].includes(key)) {
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
  npm run check:seis-ssh-endpoint-continuity
  npm run record:seis-ssh-endpoint-continuity

Options:
  --record                         Record a sanitized local baseline; never writes SSH config.
  --write                          Write the sanitized result JSON.
  --approve-endpoint-migration     Permit replacing a mismatched baseline after owner approval.
  --reason TEXT                    Record the approval reason with an approved migration.
  --baseline PATH                  Baseline path. Default: ${baselinePath}
  --output PATH                    Result path. Default: ${outputPath}
`);
}
