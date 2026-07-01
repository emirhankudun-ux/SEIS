#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const refresh = Boolean(args.refresh);
const outputJson = args.output || "reports/seis-ssh-provider-status-board.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-provider-status-board.md";

if (args.help) {
  printHelp();
  process.exit(0);
}

const refreshRuns = refresh ? runRefreshCommands() : [];
const report = buildReport(refreshRuns);

if (write) {
  writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(report));
}

if (!write) console.log(JSON.stringify(report, null, 2));

if (check && report.integrityBlockers.length > 0) process.exit(1);

function buildReport(refreshRuns) {
  const integrityBlockers = [];
  const packageJson = readJson("package.json", integrityBlockers);
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const publicContract = readJson("deploy/seis-ssh-public-access-contract.json", integrityBlockers);
  const accessModel = readJson("deploy/seis-ssh-access-model.json", integrityBlockers);
  const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json", integrityBlockers);

  const oraclePipeline = readJsonOptional("reports/seis-ssh-oracle-direct-cloud-pipeline.json");
  const githubFallback = readJsonOptional("reports/seis-ssh-github-codespaces-fallback-plan.json");
  const cloudflareAccess = readJsonOptional("reports/seis-ssh-cloudflare-access-plan.json");
  const readinessClaim = readJsonOptional("reports/seis-ssh-direct-cloud-readiness-claim.json");
  const publicAccess = readJsonOptional("reports/seis-ssh-public-access/latest.json");

  const expectedCheck = "node scripts/create-seis-ssh-provider-status-board.mjs --check";
  const expectedReport = "node scripts/create-seis-ssh-provider-status-board.mjs --write --refresh";
  if (packageJson?.scripts?.["check:seis-ssh-provider-status-board"] !== expectedCheck) {
    integrityBlockers.push("package script check:seis-ssh-provider-status-board must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:provider-status:board"] !== expectedReport) {
    integrityBlockers.push("package script cloud:ssh:provider-status:board must be declared");
  }
  if (matrix?.providerStatusBoard?.script !== "scripts/create-seis-ssh-provider-status-board.mjs") {
    integrityBlockers.push("provider matrix must link SEIS SSH provider status board script");
  }
  if (matrix?.providerStatusBoard?.callsProviderApis !== false || matrix?.providerStatusBoard?.opensSshSession !== false) {
    integrityBlockers.push("provider status board must remain local-only");
  }
  if (!(publicContract?.requiredCommands || []).includes("npm run check:seis-ssh-provider-status-board")) {
    integrityBlockers.push("public access contract must require provider status board check");
  }
  if (!(publicContract?.evidenceSurfaces || []).includes("scripts/create-seis-ssh-provider-status-board.mjs")) {
    integrityBlockers.push("public access contract must include provider status board evidence surface");
  }
  if (!(accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-provider-status-board")) {
    integrityBlockers.push("access model quality commands must include provider status board check");
  }
  if (!(roadmap?.validationCommands || []).includes("npm run check:seis-ssh-provider-status-board")) {
    integrityBlockers.push("roadmap validation commands must include provider status board check");
  }

  const claimAllowed = readinessClaim.value?.claimAllowed === true;
  const lanes = [
    oracleLane(oraclePipeline),
    githubLane(githubFallback, publicAccess),
    cloudflareLane(cloudflareAccess),
    readinessLane(readinessClaim)
  ];
  const refreshFailures = refreshRuns.filter((run) => run.ok !== true);
  const status = integrityBlockers.length > 0
    ? "blocked-integrity"
    : claimAllowed
      ? "direct-cloud-ready-claim-allowed"
      : lanes.some((lane) => lane.id === "github-codespaces" && lane.status === "fallback-terminal-compatible-not-24x7")
        ? "fallback-active-direct-cloud-blocked"
        : "planning-active-refresh-needed";

  return {
    id: "seis-ssh-provider-status-board",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status,
    mode: "local-provider-status-board-no-provider-api-no-live-ssh-no-config-write",
    targetAlias: "SEIS-SSH",
    providerPath: matrix?.decisionPolicy?.activeRecommendation?.path || "oracle-cloud-free-tier -> direct-cloud SSH -> optional Cloudflare Access layer -> SEIS-SSH",
    refreshed: refresh,
    refreshRuns,
    lanes,
    nextOwnerAction: nextOwnerAction(lanes, readinessClaim),
    blockers: [
      ...refreshFailures.map((run) => `refresh failed: ${run.id}`),
      ...lanes.flatMap((lane) => lane.blockers.map((blocker) => `${lane.id}: ${blocker}`))
    ],
    integrityBlockers,
    safety: [
      "This board does not call provider APIs.",
      "This board does not open SSH.",
      "This board does not write SSH config.",
      "This board does not print private keys, tokens, raw endpoints, ProxyCommand details, or provider credentials.",
      "Generated status board reports stay ignored; source contracts and docs stay committable."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown
    }
  };
}

function oracleLane(report) {
  const value = report.value || {};
  return {
    id: "oracle-cloud-free-tier",
    label: "Oracle Cloud Free Tier",
    role: "primary-direct-cloud-candidate",
    reportPresent: report.present,
    status: value.status || "not-generated",
    currentStage: value.currentStage?.id || null,
    currentStageMessage: value.currentStage?.message || null,
    readyForClaim: value.sourceStatus?.claimAllowed === true,
    evidence: report.present ? "reports/seis-ssh-oracle-direct-cloud-pipeline.json" : null,
    nextAction: value.nextOwnerAction || "Run npm run cloud:ssh:oracle-direct-cloud:pipeline",
    blockers: value.blockers || (report.present ? [] : ["Oracle direct-cloud pipeline report is missing"])
  };
}

function githubLane(report, publicAccess) {
  const value = report.value || {};
  const publicValue = publicAccess.value || {};
  return {
    id: "github-codespaces",
    label: "GitHub Codespaces",
    role: "terminal-compatible-development-fallback",
    reportPresent: report.present,
    status: value.status || "not-generated",
    fallbackOnly: value.fallbackOnly === true,
    terminalCompatible: value.readiness?.terminalCompatible === true || publicValue.localSshConfig?.transport === "codespace",
    pickerCompatible: false,
    mobile24x7Ready: false,
    evidence: report.present ? "reports/seis-ssh-github-codespaces-fallback-plan.json" : null,
    nextAction: "Keep Codespaces as fallback; move to direct-cloud only after owner-approved endpoint migration.",
    blockers: value.blockers || (report.present ? [] : ["GitHub Codespaces fallback plan report is missing"])
  };
}

function cloudflareLane(report) {
  const value = report.value || {};
  return {
    id: "cloudflare-access-tunnel",
    label: "Cloudflare Access / Tunnel",
    role: "identity-access-layer-after-real-cloud-origin",
    reportPresent: report.present,
    status: value.status || "not-generated",
    cloudflaredAvailable: value.readiness?.cloudflaredAvailable === true,
    approvedCloudOriginPresent: value.readiness?.approvedCloudOriginPresent === true,
    accessPlanReady: value.readiness?.accessPlanReady === true,
    evidence: report.present ? "reports/seis-ssh-cloudflare-access-plan.json" : null,
    nextAction: "Create or verify the cloud VM origin before Cloudflare login or tunnel setup.",
    blockers: value.blockers || (report.present ? [] : ["Cloudflare Access plan report is missing"])
  };
}

function readinessLane(report) {
  const value = report.value || {};
  return {
    id: "direct-cloud-readiness-claim",
    label: "Direct-cloud readiness claim",
    role: "final-mobile-codex-24x7-claim-gate",
    reportPresent: report.present,
    status: value.status || "not-generated",
    claimAllowed: value.claimAllowed === true,
    evidence: report.present ? "reports/seis-ssh-direct-cloud-readiness-claim.json" : null,
    nextAction: value.claimAllowed === true
      ? "Direct-cloud readiness claim is allowed by current evidence."
      : "Run strict probe and doctor only after a real direct-cloud endpoint exists.",
    blockers: value.blockers || (report.present ? [] : ["Direct-cloud readiness claim report is missing"])
  };
}

function nextOwnerAction(lanes, readinessClaim) {
  if (readinessClaim.value?.claimAllowed === true) {
    return "Record the owner-approved readiness evidence and keep the same SEIS-SSH alias.";
  }

  const oracle = lanes.find((lane) => lane.id === "oracle-cloud-free-tier");
  if (oracle?.nextAction) return oracle.nextAction;
  return "Refresh the provider status board after running the Oracle, Codespaces, Cloudflare, and readiness claim reports.";
}

function runRefreshCommands() {
  const commands = [
    {
      id: "oracle-direct-cloud-pipeline",
      argv: ["scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs", "--write", "--refresh"]
    },
    {
      id: "github-codespaces-fallback-plan",
      argv: ["scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs", "--write"]
    },
    {
      id: "cloudflare-access-plan",
      argv: ["scripts/create-seis-ssh-cloudflare-access-plan.mjs", "--write"]
    },
    {
      id: "direct-cloud-readiness-claim",
      argv: ["scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs", "--write"]
    }
  ];

  return commands.map((command) => {
    const result = spawnSync(process.execPath, command.argv, {
      encoding: "utf8",
      timeout: 30000,
      env: cleanEnv(process.env)
    });
    return {
      id: command.id,
      ok: (result.status ?? 1) === 0,
      status: result.status ?? 1,
      command: `node ${command.argv.join(" ")}`,
      stdoutSummary: summarize(result.stdout),
      stderrSummary: summarize(result.stderr)
    };
  });
}

function renderMarkdown(report) {
  return `# SEIS SSH Provider Status Board

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Alias: ${report.targetAlias}
Refreshed: ${report.refreshed ? "yes" : "no"}

## Provider Lanes

| Lane | Status | Evidence | Next action |
| --- | --- | --- | --- |
${report.lanes.map((lane) => `| ${lane.label} | ${lane.status} | ${lane.evidence || "missing"} | ${lane.nextAction} |`).join("\n")}

## Next Owner Action

${report.nextOwnerAction}

## Blockers

${renderList(report.blockers, "none")}

## Integrity Blockers

${renderList(report.integrityBlockers, "none")}

## Safety

${renderList(report.safety, "none")}
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

function summarize(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function cleanEnv(env) {
  const next = { ...env };
  for (const key of Object.keys(next)) {
    if (/TOKEN|SECRET|PASSWORD|PRIVATE|KEY|COOKIE|CERT/i.test(key)) delete next[key];
  }
  return next;
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
  console.log(`Usage: node scripts/create-seis-ssh-provider-status-board.mjs [--check] [--write] [--refresh]

Creates a local-only SEIS-SSH provider status board across Oracle, GitHub
Codespaces, Cloudflare, and the direct-cloud readiness claim.

Options:
  --check          Validate integrity and print JSON.
  --write          Write ignored JSON and Markdown reports.
  --refresh        Refresh local-only provider reports before building the board.
  --output PATH    JSON output path. Default: reports/seis-ssh-provider-status-board.json.
  --markdown PATH  Markdown output path. Default: reports/seis-ssh-provider-status-board.md.
`);
}
