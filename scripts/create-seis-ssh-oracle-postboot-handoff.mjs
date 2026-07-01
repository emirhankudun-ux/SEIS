#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-oracle-postboot-handoff.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-postboot-handoff.md";
const ownerPreflightPath = args["owner-preflight"] || "reports/seis-ssh-oracle-owner-preflight.json";
const claimReportPath = args["claim-report"] || "reports/seis-ssh-direct-cloud-readiness-claim.json";
const directHost = args["direct-host"] || args["public-ip"] || process.env.SEIS_ORACLE_PUBLIC_IP || process.env.SEIS_CLOUD_PUBLIC_IP || process.env.SEIS_CLOUD_DIRECT_HOST || "";
const directUser = args["direct-user"] || process.env.SEIS_CLOUD_DIRECT_USER || "aiuser";
const directPort = String(args["direct-port"] || process.env.SEIS_CLOUD_DIRECT_PORT || "22");

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
  const oraclePlan = readJson("deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json", integrityBlockers);
  const ownerPreflight = readJsonOptional(ownerPreflightPath);
  const claimReport = readJsonOptional(claimReportPath);
  const endpoint = summarizeEndpoint(directHost);

  if (packageJson?.scripts?.["check:seis-ssh-oracle-postboot-handoff"] !== "node scripts/create-seis-ssh-oracle-postboot-handoff.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-postboot-handoff must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-postboot:handoff"] !== "node scripts/create-seis-ssh-oracle-postboot-handoff.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:oracle-postboot:handoff must be declared");
  }
  if (matrix?.oraclePostBootHandoff?.script !== "scripts/create-seis-ssh-oracle-postboot-handoff.mjs") {
    integrityBlockers.push("provider matrix must link Oracle post-boot handoff script");
  }
  if (matrix?.oraclePostBootHandoff?.opensSshSession !== false || matrix?.oraclePostBootHandoff?.writesSshConfig !== false) {
    integrityBlockers.push("Oracle post-boot handoff must remain report-only");
  }
  if (oraclePlan?.postBootHandoff?.script !== "scripts/create-seis-ssh-oracle-postboot-handoff.mjs") {
    integrityBlockers.push("Oracle plan must link post-boot handoff script");
  }
  if (!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(directUser)) integrityBlockers.push("direct user must be a safe Linux user name");
  if (!/^[0-9]+$/.test(directPort) || Number(directPort) < 1 || Number(directPort) > 65535) {
    integrityBlockers.push("direct port must be 1-65535");
  }

  const status = integrityBlockers.length > 0
    ? "blocked-integrity"
    : endpoint.present
      ? "postboot-endpoint-captured-owner-run-required"
      : "blocked-waiting-for-postboot-endpoint";

  return {
    id: "seis-ssh-oracle-postboot-handoff",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status,
    mode: "local-postboot-handoff-no-provider-api-no-live-ssh-no-config-write",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    endpoint,
    directUser,
    directPort,
    evidenceSources: {
      ownerPreflight: ownerPreflightPath,
      readinessClaim: claimReportPath,
      providerMatrix: "deploy/seis-ssh-direct-cloud-provider-matrix.json",
      oraclePlan: "deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json"
    },
    sourceStatus: {
      ownerPreflightPresent: ownerPreflight.present,
      ownerPreflightStatus: ownerPreflight.value?.status || null,
      readinessClaimPresent: claimReport.present,
      readinessClaimAllowed: claimReport.value?.claimAllowed === true,
      readinessClaimStatus: claimReport.value?.status || null
    },
    ownerRunOrder: [
      "npm run cloud:ssh:oracle-owner:preflight -- --public-ip <PUBLIC_IP>",
      "npm run cloud:ssh:direct-cloud:switch -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      "npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      "npm run cloud:ssh:mobile-direct:probe:strict",
      "npm run cloud:ssh:mobile-direct:doctor:strict",
      "npm run cloud:ssh:direct-cloud:claim"
    ],
    concreteCommands: concreteCommands(endpoint),
    readinessGates: [
      gate("postboot-endpoint-present", endpoint.present, "Oracle assigned a public IP or DNS endpoint after VM boot"),
      gate("owner-preflight-refreshed-with-endpoint", ownerPreflight.value?.readiness?.directEndpointPresent === true, ownerPreflightPath),
      gate("switch-plan-probes-endpoint-before-apply", true, "npm run cloud:ssh:direct-cloud:switch without --apply"),
      gate("activation-applies-single-alias-only-after-probes", true, "npm run cloud:ssh:direct-cloud:activate"),
      gate("strict-probe-required", false, "npm run cloud:ssh:mobile-direct:probe:strict"),
      gate("strict-doctor-required", false, "npm run cloud:ssh:mobile-direct:doctor:strict"),
      gate("claim-gate-required", claimReport.value?.claimAllowed === true, claimReportPath)
    ],
    blockers: [
      ...(!endpoint.present ? ["Oracle post-boot public IP or DNS endpoint is missing"] : []),
      ...(ownerPreflight.value?.readiness?.directEndpointPresent === true ? [] : ["Owner preflight has not been refreshed with the post-boot endpoint"]),
      ...(claimReport.value?.claimAllowed === true ? [] : ["Direct-cloud readiness claim is still blocked until strict live evidence passes"])
    ],
    integrityBlockers,
    safety: [
      "This handoff reads local reports and optional endpoint input only.",
      "This handoff does not call Oracle APIs, create VMs, open SSH, write SSH config, or print endpoints in full.",
      "This handoff does not open SSH.",
      "Endpoint continuity is represented by kind plus SHA-256 prefix.",
      "The only visible SSH alias remains SEIS-SSH.",
      "The final readiness claim remains blocked until strict probe, strict doctor, and claim gate pass."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function concreteCommands(endpoint) {
  if (!endpoint.present) {
    return {
      ownerPreflightWithEndpoint: "npm run cloud:ssh:oracle-owner:preflight -- --public-ip <PUBLIC_IP>",
      switchPlan: "npm run cloud:ssh:direct-cloud:switch -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      activate: "npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      strictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
      strictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict",
      claimGate: "npm run cloud:ssh:direct-cloud:claim"
    };
  }

  return {
    ownerPreflightWithEndpoint: `npm run cloud:ssh:oracle-owner:preflight -- --public-ip ${shellPlaceholder(endpoint)}`,
    switchPlan: `npm run cloud:ssh:direct-cloud:switch -- --public-ip ${shellPlaceholder(endpoint)} --direct-user ${directUser}`,
    activate: `npm run cloud:ssh:direct-cloud:activate -- --public-ip ${shellPlaceholder(endpoint)} --direct-user ${directUser}`,
    strictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
    strictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict",
    claimGate: "npm run cloud:ssh:direct-cloud:claim"
  };
}

function gate(id, passed, evidence) {
  return {
    id,
    passed: Boolean(passed),
    evidence,
    required: true
  };
}

function summarizeEndpoint(value) {
  const text = String(value || "").trim();
  return {
    present: text.length > 0,
    kind: classifyEndpoint(text),
    sha256Prefix: text ? sha256HexPrefix(text) : null,
    redacted: text ? (classifyEndpoint(text) === "dns-name" ? "redacted-direct-cloud-dns" : "redacted-direct-cloud-host") : null,
    shapeLooksValid: text ? endpointShapeLooksValid(text) : false
  };
}

function classifyEndpoint(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "missing";
  if (text === "localhost" || text === "127.0.0.1" || text === "::1" || text.endsWith(".local")) return "blocked-local-host";
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(text)) return "ipv4";
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(text)) return "dns-name";
  return "label";
}

function endpointShapeLooksValid(value) {
  return ["ipv4", "dns-name"].includes(classifyEndpoint(value));
}

function shellPlaceholder(endpoint) {
  if (!endpoint.present) return "<PUBLIC_IP>";
  return endpoint.kind === "dns-name" ? "<DIRECT_CLOUD_DNS>" : "<PUBLIC_IP>";
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
  return `# SEIS SSH Oracle Post-Boot Handoff

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Provider: ${report.providerId}
Alias: ${report.targetAlias}

## Endpoint

| Field | Value |
| --- | --- |
| Present | ${report.endpoint.present ? "yes" : "no"} |
| Kind | ${report.endpoint.kind} |
| SHA-256 prefix | ${report.endpoint.sha256Prefix || "none"} |
| Shape valid | ${report.endpoint.shapeLooksValid ? "yes" : "no"} |

## Owner Run Order

\`\`\`bash
${Object.values(report.concreteCommands).join("\n")}
\`\`\`

## Readiness Gates

| Gate | Passed | Evidence |
| --- | --- | --- |
${report.readinessGates.map((item) => `| ${item.id} | ${item.passed ? "yes" : "no"} | ${item.evidence} |`).join("\n")}

## Blockers

${renderList(report.blockers, "none")}

## Integrity Blockers

${renderList(report.integrityBlockers, "none")}

## Safety

${renderList(report.safety, "none")}
`;
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
  npm run cloud:ssh:oracle-postboot:handoff
  npm run check:seis-ssh-oracle-postboot-handoff
  node scripts/create-seis-ssh-oracle-postboot-handoff.mjs --write

Options:
  --write                Write JSON and Markdown reports.
  --check                Validate wiring without requiring live endpoint.
  --public-ip VALUE      Post-boot Oracle public IP. Redacted in reports.
  --direct-host VALUE    Post-boot Oracle DNS name. Redacted in reports.
  --direct-user USER     Runtime SSH user. Default: aiuser.
  --direct-port PORT     Runtime SSH port. Default: 22.
  --owner-preflight PATH Owner preflight report path.
  --claim-report PATH    Direct-cloud readiness claim report path.
  --output PATH          JSON output path.
  --markdown PATH        Markdown output path.
`);
}
