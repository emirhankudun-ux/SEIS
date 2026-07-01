#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const refresh = Boolean(args.refresh);
const outputJson = args.output || "reports/seis-ssh-oracle-direct-cloud-pipeline.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-direct-cloud-pipeline.md";
const endpointInput = args["direct-host"] || args["public-ip"] || process.env.SEIS_ORACLE_PUBLIC_IP || process.env.SEIS_CLOUD_PUBLIC_IP || process.env.SEIS_CLOUD_DIRECT_HOST || "";
const defaultOwnerInputsFile = "reports/seis-ssh-oracle-owner-input-template.env";
const ownerInputsFile = args["owner-inputs-file"] || process.env.SEIS_ORACLE_OWNER_INPUTS_FILE || defaultOwnerInputsFile;
const ownerInputsFilePresent = Boolean(ownerInputsFile && existsSync(ownerInputsFile));

if (args.help) {
  printHelp();
  process.exit(0);
}

const refreshResults = refresh ? refreshLocalReports() : [];
const report = buildReport(refreshResults);

if (write) {
  writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(report));
}

if (!write) console.log(JSON.stringify(report, null, 2));

if (check && report.integrityBlockers.length > 0) process.exit(1);

function buildReport(localRefreshResults) {
  const integrityBlockers = [];
  const packageJson = readJson("package.json", integrityBlockers);
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const oraclePlan = readJson("deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json", integrityBlockers);
  const reports = {
    freeTier: readJsonOptional("reports/seis-ssh-oracle-free-tier-plan.json"),
    cloudInit: readJsonOptional("reports/seis-ssh-oracle-cloud-init-handoff.json"),
    instanceLaunch: readJsonOptional("reports/seis-ssh-oracle-instance-launch-plan.json"),
    ownerPreflight: readJsonOptional("reports/seis-ssh-oracle-owner-preflight.json"),
    ownerLaunchCommand: readJsonOptional("reports/seis-ssh-oracle-owner-launch-command.json"),
    postBoot: readJsonOptional("reports/seis-ssh-oracle-postboot-handoff.json"),
    readinessClaim: readJsonOptional("reports/seis-ssh-direct-cloud-readiness-claim.json")
  };

  if (packageJson?.scripts?.["check:seis-ssh-oracle-direct-cloud-pipeline"] !== "node scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-direct-cloud-pipeline must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-direct-cloud:pipeline"] !== "node scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs --write --refresh") {
    integrityBlockers.push("package script cloud:ssh:oracle-direct-cloud:pipeline must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-owner:template"] !== "node scripts/create-seis-ssh-oracle-owner-input-template.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:oracle-owner:template must be declared");
  }
  if (matrix?.oracleDirectCloudPipeline?.script !== "scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs") {
    integrityBlockers.push("provider matrix must link Oracle direct-cloud pipeline script");
  }
  if (matrix?.oracleOwnerInputTemplate?.script !== "scripts/create-seis-ssh-oracle-owner-input-template.mjs") {
    integrityBlockers.push("provider matrix must link Oracle owner input template script");
  }
  if (matrix?.oracleOwnerLaunchCommand?.script !== "scripts/create-seis-ssh-oracle-owner-launch-command.mjs") {
    integrityBlockers.push("provider matrix must link Oracle owner launch command script");
  }
  if (oraclePlan?.ownerLaunchCommand?.script !== "scripts/create-seis-ssh-oracle-owner-launch-command.mjs") {
    integrityBlockers.push("Oracle plan must link owner launch command script");
  }
  if (matrix?.oracleDirectCloudPipeline?.opensSshSession !== false || matrix?.oracleDirectCloudPipeline?.callsProviderApis !== false) {
    integrityBlockers.push("Oracle direct-cloud pipeline must remain local-only");
  }
  if (oraclePlan?.directCloudPipeline?.script !== "scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs") {
    integrityBlockers.push("Oracle plan must link direct-cloud pipeline script");
  }

  const endpoint = summarizeEndpoint(endpointInput);
  const stages = [
    stage("free-tier-plan", reports.freeTier, "reports/seis-ssh-oracle-free-tier-plan.json", (value) => value?.ok === true),
    stage("cloud-init-handoff", reports.cloudInit, "reports/seis-ssh-oracle-cloud-init-handoff.json", (value) => value?.ok === true),
    stage("instance-launch-plan", reports.instanceLaunch, "reports/seis-ssh-oracle-instance-launch-plan.json", (value) => value?.ok === true),
    stage("owner-preflight", reports.ownerPreflight, "reports/seis-ssh-oracle-owner-preflight.json", (value) => value?.ok === true),
    stage("owner-launch-command", reports.ownerLaunchCommand, "reports/seis-ssh-oracle-owner-launch-command.json", (value) => value?.ok === true),
    stage("post-boot-handoff", reports.postBoot, "reports/seis-ssh-oracle-postboot-handoff.json", (value) => value?.ok === true),
    stage("readiness-claim", reports.readinessClaim, "reports/seis-ssh-direct-cloud-readiness-claim.json", (value) => value?.claimAllowed === true)
  ];

  const ownerReadiness = reports.ownerPreflight.value?.readiness || {};
  const postBootEndpointPresent = reports.postBoot.value?.endpoint?.present === true;
  const claimAllowed = reports.readinessClaim.value?.claimAllowed === true;
  const currentStage = currentStageFor({ integrityBlockers, stages, ownerReadiness, postBootEndpointPresent, claimAllowed });
  const blocked = currentStage.id !== "ready";

  return {
    id: "seis-ssh-oracle-direct-cloud-pipeline",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status: blocked ? "blocked-progressing" : "ready-claim-allowed",
    mode: "local-pipeline-report-no-provider-api-no-live-ssh-no-config-write",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    currentStage,
    endpoint,
    stages,
    sourceStatus: {
      ownerPreflightStatus: reports.ownerPreflight.value?.status || null,
      ownerLaunchCommandStatus: reports.ownerLaunchCommand.value?.status || null,
      postBootStatus: reports.postBoot.value?.status || null,
      readinessClaimStatus: reports.readinessClaim.value?.status || null,
      claimAllowed
    },
    localRefresh: {
      requested: refresh,
      commandsRun: localRefreshResults
    },
    ownerInputsFile: {
      defaultPath: defaultOwnerInputsFile,
      explicitOverride: Boolean(args["owner-inputs-file"] || process.env.SEIS_ORACLE_OWNER_INPUTS_FILE),
      present: ownerInputsFilePresent,
      passedToOwnerPreflight: ownerInputsFilePresent,
      rawValuesPrinted: false
    },
    nextOwnerAction: nextOwnerActionFor(currentStage),
    commands: {
      pipeline: "npm run cloud:ssh:oracle-direct-cloud:pipeline",
      ownerInputTemplate: "npm run cloud:ssh:oracle-owner:template",
      ownerLogin: "oci session authenticate --region eu-frankfurt-1 --no-browser --profile-name SEIS",
      ownerPreflight: "npm run cloud:ssh:oracle-owner:preflight -- --owner-inputs-file reports/seis-ssh-oracle-owner-input-template.env",
      ownerLaunchCommand: "npm run cloud:ssh:oracle-owner:launch-command",
      postBootHandoff: "npm run cloud:ssh:oracle-postboot:handoff -- --public-ip <PUBLIC_IP>",
      switchPlan: "npm run cloud:ssh:direct-cloud:switch -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      activate: "npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user aiuser",
      strictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
      strictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict",
      claimGate: "npm run cloud:ssh:direct-cloud:claim"
    },
    blockers: blockersFor({ currentStage, ownerReadiness, postBootEndpointPresent, claimAllowed }),
    integrityBlockers,
    safety: [
      "This pipeline only refreshes local reports from existing non-mutating SEIS commands.",
      "This pipeline does not call Oracle APIs, create VMs, open SSH, write SSH config, or run strict live probes.",
      "This pipeline does not run strict live probes.",
      "Endpoint continuity is reported only as kind plus SHA-256 prefix.",
      "Reports are ignored and must not carry private keys, provider tokens, OCIDs, or public endpoints in full."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function refreshLocalReports() {
  const commands = [
    ["oracle-free-tier-plan", ["run", "cloud:ssh:oracle-free-tier:plan"]],
    ["oracle-cloud-init-handoff", ["run", "cloud:ssh:oracle-cloud-init:handoff"]],
    ["oracle-instance-plan", ["run", "cloud:ssh:oracle-instance:plan"]],
    ["oracle-owner-preflight", ["run", "cloud:ssh:oracle-owner:preflight", "--", ...ownerInputsFileArgs(), ...endpointArgs()]],
    ["oracle-owner-launch-command", ["run", "cloud:ssh:oracle-owner:launch-command", "--", ...ownerInputsFileArgs()]],
    ["oracle-postboot-handoff", ["run", "cloud:ssh:oracle-postboot:handoff", "--", ...endpointArgs()]],
    ["direct-cloud-claim", ["run", "cloud:ssh:direct-cloud:claim"]]
  ];

  return commands.map(([id, argv]) => {
    const result = spawnSync("npm", argv, {
      encoding: "utf8",
      timeout: 120000
    });
    return {
      id,
      status: result.status ?? 1,
      ok: (result.status ?? 1) === 0,
      command: redactedCommand(argv),
      stdoutSummary: sanitizeOutput(result.stdout),
      stderrSummary: sanitizeOutput(result.stderr)
    };
  });
}

function endpointArgs() {
  if (!endpointInput) return [];
  return ["--public-ip", endpointInput];
}

function ownerInputsFileArgs() {
  if (!ownerInputsFilePresent) return [];
  return ["--owner-inputs-file", ownerInputsFile];
}

function redactedCommand(argv) {
  return ["npm", ...argv].map((part) => {
    if (part === endpointInput && endpointInput) return "<PUBLIC_IP_OR_DNS>";
    if (part === ownerInputsFile && ownerInputsFilePresent) return "<OWNER_INPUTS_FILE>";
    return part;
  }).join(" ");
}

function stage(id, report, path, predicate) {
  return {
    id,
    report: path,
    present: report.present,
    status: report.value?.status || null,
    ok: report.present && predicate(report.value),
    blocksReadyClaim: id === "readiness-claim"
  };
}

function currentStageFor({ integrityBlockers, stages, ownerReadiness, postBootEndpointPresent, claimAllowed }) {
  if (integrityBlockers.length > 0) return currentStage("blocked-integrity", "Fix local wiring before continuing.");
  const missingStage = stages.find((item) => !item.present);
  if (missingStage) return currentStage("local-report-missing", `Generate missing report: ${missingStage.report}`);
  const brokenStage = stages.slice(0, 6).find((item) => !item.ok);
  if (brokenStage) return currentStage("local-report-blocked", `Fix local stage: ${brokenStage.id}`);
  if (!ownerReadiness.ownerInputsReady) return currentStage("owner-input-required", "Add Oracle availability domain, compartment, subnet, and image inputs outside git.");
  if (!ownerReadiness.oracleSessionHintsPresent) return currentStage("oracle-login-required", "Authenticate to Oracle outside git.");
  if (!postBootEndpointPresent) return currentStage("postboot-endpoint-required", "Create or select the Oracle VM and capture its public endpoint.");
  if (!claimAllowed) return currentStage("live-proof-required", "Run activation, strict probe, strict doctor, and the claim gate.");
  return currentStage("ready", "SEIS-SSH direct-cloud readiness claim is allowed.");
}

function currentStage(id, message) {
  return { id, message };
}

function nextOwnerActionFor(stageInfo) {
  const map = {
    "blocked-integrity": "Fix repo wiring and rerun npm run check:seis-ssh-oracle-direct-cloud-pipeline.",
    "local-report-missing": "Run npm run cloud:ssh:oracle-direct-cloud:pipeline to refresh all local-only reports.",
    "local-report-blocked": "Inspect the failing local report and fix local prerequisites.",
    "owner-input-required": "Provide Oracle owner inputs outside git, then rerun owner preflight.",
    "oracle-login-required": "Run Oracle browser/device login outside git, then rerun owner preflight.",
    "postboot-endpoint-required": "Create/select the Oracle VM and rerun post-boot handoff with the public endpoint.",
    "live-proof-required": "Run switch/activate, strict probe, strict doctor, then direct-cloud claim.",
    ready: "Use SEIS-SSH."
  };
  return map[stageInfo.id] || "Inspect reports and continue from the first blocked gate.";
}

function blockersFor({ currentStage, ownerReadiness, postBootEndpointPresent, claimAllowed }) {
  return [
    ...(ownerReadiness.ownerInputsReady ? [] : ["Oracle owner inputs are missing or incomplete"]),
    ...(ownerReadiness.oracleSessionHintsPresent ? [] : ["Oracle login/session hints are missing"]),
    ...(postBootEndpointPresent ? [] : ["Oracle post-boot public endpoint is missing"]),
    ...(claimAllowed ? [] : ["Direct-cloud readiness claim is blocked until strict live evidence passes"]),
    ...(currentStage.id === "ready" ? [] : [`current stage: ${currentStage.id}`])
  ];
}

function summarizeEndpoint(value) {
  const text = String(value || "").trim();
  return {
    present: text.length > 0,
    kind: classifyEndpoint(text),
    sha256Prefix: text ? sha256HexPrefix(text) : null,
    redacted: text ? (classifyEndpoint(text) === "dns-name" ? "redacted-direct-cloud-dns" : "redacted-direct-cloud-host") : null
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
  return `# SEIS SSH Oracle Direct-Cloud Pipeline

Generated: ${report.generatedAt}

Status: ${report.status}
Current stage: ${report.currentStage.id}
Next owner action: ${report.nextOwnerAction}

## Stages

| Stage | Present | OK | Status |
| --- | --- | --- | --- |
${report.stages.map((item) => `| ${item.id} | ${item.present ? "yes" : "no"} | ${item.ok ? "yes" : "no"} | ${item.status || "none"} |`).join("\n")}

## Blockers

${renderList(report.blockers, "none")}

## Commands

\`\`\`bash
${report.commands.pipeline}
${report.commands.ownerInputTemplate}
${report.commands.ownerLogin}
${report.commands.ownerPreflight}
${report.commands.ownerLaunchCommand}
${report.commands.postBootHandoff}
${report.commands.switchPlan}
${report.commands.activate}
${report.commands.strictProbe}
${report.commands.strictDoctor}
${report.commands.claimGate}
\`\`\`

## Safety

${renderList(report.safety, "none")}
`;
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function sanitizeOutput(value) {
  return String(value || "")
    .replace(/ocid1\.[A-Za-z0-9_.-]+/g, "[redacted-ocid]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted-ip]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-************************************")
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(0, 3)
    .join(" | ");
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
    if (["write", "check", "help", "refresh"].includes(key)) {
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
  npm run cloud:ssh:oracle-direct-cloud:pipeline
  npm run check:seis-ssh-oracle-direct-cloud-pipeline
  node scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs --write --refresh

Options:
  --write              Write JSON and Markdown reports.
  --check              Validate wiring without requiring live endpoint.
  --refresh            Refresh all local-only reports before summarizing.
  --public-ip VALUE    Optional post-boot Oracle public IP. Redacted in reports.
  --direct-host VALUE  Optional post-boot Oracle DNS. Redacted in reports.
  --owner-inputs-file PATH
                       Optional local ignored env file for owner preflight.
  --output PATH        JSON output path.
  --markdown PATH      Markdown output path.
`);
}
