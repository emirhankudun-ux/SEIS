#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-cloudflare-access-plan.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-cloudflare-access-plan.md";

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
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const publicContract = readJson("deploy/seis-ssh-public-access-contract.json", integrityBlockers);
  const postBoot = readJsonOptional("reports/seis-ssh-oracle-postboot-handoff.json");
  const readinessClaim = readJsonOptional("reports/seis-ssh-direct-cloud-readiness-claim.json");
  const activationPlan = readJsonOptional("reports/seis-ssh-direct-cloud-activation-plan.json");
  const cloudflared = toolProbe("cloudflared", [
    process.env.SEIS_CLOUDFLARED_BIN,
    join(process.cwd(), ".local", "bin", "cloudflared"),
    join(workspaceRoot(), ".local", "bin", "cloudflared"),
    join(homedir(), ".local", "bin", "cloudflared"),
    "cloudflared"
  ]);

  if (packageJson?.scripts?.["check:seis-ssh-cloudflare-access-plan"] !== "node scripts/create-seis-ssh-cloudflare-access-plan.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-cloudflare-access-plan must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:cloudflare-access:plan"] !== "node scripts/create-seis-ssh-cloudflare-access-plan.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:cloudflare-access:plan must be declared");
  }
  if (matrix?.cloudflareAccessPlan?.script !== "scripts/create-seis-ssh-cloudflare-access-plan.mjs") {
    integrityBlockers.push("provider matrix must link Cloudflare Access plan script");
  }
  if (matrix?.cloudflareAccessPlan?.requiresApprovedCloudOrigin !== true || matrix?.cloudflareAccessPlan?.localMacOriginAllowed !== false) {
    integrityBlockers.push("Cloudflare Access plan must require approved cloud origin and reject local Mac origin");
  }
  if (matrix?.cloudflareAccessPlan?.callsProviderApis !== false || matrix?.cloudflareAccessPlan?.opensSshSession !== false) {
    integrityBlockers.push("Cloudflare Access plan must remain local-only");
  }
  if (!(publicContract?.requiredCommands || []).includes("npm run check:seis-ssh-cloudflare-access-plan")) {
    integrityBlockers.push("public access contract must require Cloudflare Access plan check");
  }

  const endpoint = postBoot.value?.endpoint || {};
  const approvedCloudOriginPresent = endpoint.present === true && endpoint.shapeLooksValid === true;
  const claimAllowed = readinessClaim.value?.claimAllowed === true;
  const activationReady = activationPlan.value?.activationReady === true;
  const accessPlanReady = cloudflared.available && approvedCloudOriginPresent;
  const status = integrityBlockers.length > 0
    ? "blocked-integrity"
    : accessPlanReady
      ? "access-plan-ready-for-owner-cloudflare-login"
      : "blocked-waiting-for-approved-cloud-origin";

  return {
    id: "seis-ssh-cloudflare-access-plan",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status,
    mode: "local-cloudflare-access-plan-no-provider-api-no-login-no-live-ssh-no-config-write",
    targetAlias: "SEIS-SSH",
    providerId: "cloudflare-access-tunnel",
    providerRole: "identity-access-layer-after-real-cloud-origin",
    cloudflared,
    originEvidence: {
      postBootReportPresent: postBoot.present,
      endpointPresent: endpoint.present === true,
      endpointKind: endpoint.kind || "missing",
      endpointSha256Prefix: endpoint.sha256Prefix || null,
      endpointShapeLooksValid: endpoint.shapeLooksValid === true,
      rawEndpointPrinted: false,
      approvedCloudOriginPresent,
      localMacOriginAllowed: false
    },
    sourceStatus: {
      activationPlanPresent: activationPlan.present,
      activationReady,
      readinessClaimPresent: readinessClaim.present,
      readinessClaimStatus: readinessClaim.value?.status || null,
      readinessClaimAllowed: claimAllowed
    },
    readiness: {
      cloudflaredAvailable: cloudflared.available,
      approvedCloudOriginPresent,
      accessPlanReady,
      cloudflareLoginRequiredOutsideGit: true,
      claimAllowedAfterCloudflare: false
    },
    ownerRunOrder: [
      "Create or verify the Oracle/GCP/direct-cloud VM first; do not use the local Mac as the default origin.",
      "Run npm run cloud:ssh:oracle-postboot:handoff -- --public-ip <PUBLIC_IP> after the cloud VM boots.",
      "Run npm run check:seis-ssh-cloudflare-access-plan.",
      "Complete Cloudflare login, tunnel, and Access policy setup outside git only after the approved cloud origin exists.",
      "Keep tunnel tokens, certs, Access policies, hostnames, and origin credentials outside public reports.",
      "Run npm run cloud:ssh:mobile-direct:probe:strict.",
      "Run npm run cloud:ssh:mobile-direct:doctor:strict.",
      "Run npm run cloud:ssh:direct-cloud:claim."
    ],
    blockers: [
      ...(!cloudflared.available ? ["cloudflared CLI is missing or unavailable"] : []),
      ...(approvedCloudOriginPresent ? [] : ["Approved cloud origin endpoint is missing"]),
      ...(claimAllowed ? [] : ["Direct-cloud readiness claim is still blocked until strict live evidence passes"])
    ],
    integrityBlockers,
    safety: [
      "This plan does not call Cloudflare APIs.",
      "This plan does not run cloudflared tunnel login.",
      "This plan does not create tunnels, open SSH, write SSH config, or read tunnel credentials.",
      "Cloudflare is modeled only as an identity/access layer after a real cloud VM origin exists.",
      "The local Mac must not become the default SEIS-SSH origin.",
      "Raw origins, tokens, certs, hostnames, and public IPs are not printed."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function renderMarkdown(report) {
  return `# SEIS SSH Cloudflare Access Plan

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Provider: ${report.providerId}
Alias: ${report.targetAlias}

## Origin Evidence

| Gate | Value |
| --- | --- |
| cloudflared available | ${report.readiness.cloudflaredAvailable ? "yes" : "no"} |
| approved cloud origin present | ${report.readiness.approvedCloudOriginPresent ? "yes" : "no"} |
| endpoint kind | ${report.originEvidence.endpointKind} |
| endpoint SHA-256 prefix | ${report.originEvidence.endpointSha256Prefix || "none"} |
| local Mac origin allowed | no |

## Owner Run Order

${report.ownerRunOrder.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## Blockers

${renderList(report.blockers, "none")}

## Integrity Blockers

${renderList(report.integrityBlockers, "none")}

## Safety

${renderList(report.safety, "none")}
`;
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
        loginAttempted: false
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
    loginAttempted: false
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

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function writeFile(file, content) {
  const absolute = resolve(file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function workspaceRoot() {
  return resolve(process.cwd(), "..");
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
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .trim();
}

function redactHome(value) {
  return String(value || "").replaceAll(homedir(), "~");
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
  console.log(`Usage: node scripts/create-seis-ssh-cloudflare-access-plan.mjs [--check] [--write]

Creates a local-only Cloudflare Access plan for SEIS-SSH after a real cloud
origin exists.

Options:
  --check          Validate integrity and print JSON.
  --write          Write ignored JSON and Markdown reports.
  --output PATH    JSON output path. Default: reports/seis-ssh-cloudflare-access-plan.json.
  --markdown PATH  Markdown output path. Default: reports/seis-ssh-cloudflare-access-plan.md.
`);
}
