#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const args = parseArgs(process.argv.slice(2));
const outputJson = args.json === true;
const strict = args.strict === true;
const outputPath = args.output;

const findings = [];
const recommendations = [];

collectLocalTargetFindings();
collectDocFindings();

const migrationNeeded = findings.some((item) => item.severity === "high");

if (findings.length === 0) {
  recommendations.push("No local SSH-heavy deployment remnants detected in the audited files.");
  recommendations.push("Keep team/workplace SSH+WireGuard lane checks in place for private infrastructure.");
}

if (findings.some((item) => item.type === "local-preview")) {
  recommendations.push("Treat 127.0.0.1 and localhost examples as local preview only, not as release targets.");
  recommendations.push("Use public cloud provider readiness before any public handoff.");
}

if (findings.some((item) => item.type === "team-ssh")) {
  recommendations.push("Use team VPN lanes: `npm run cloud:gcp:readiness` or `npm run cloud:ssh-vpn:readiness` before handoff.");
}

if (!recommendations.some((item) => item.includes("cloud:migration:audit"))) {
  recommendations.push("Run `npm run cloud:migration:audit -- --json` and store output with the release notes if needed.");
}

const report = {
  generatedAt: new Date().toISOString(),
  migrationNeeded,
  findings,
  recommendations,
  commands: {
    preferredPublicCloudPath: "npm run cloud:public:readiness -- --repo <OWNER/REPO>",
    preferredTeamVpnPath: "npm run cloud:ssh-vpn:readiness -- --ssh-target USER@HOST",
    preferredCloudComputePath: "npm run cloud:gcp:readiness -- --project PROJECT_ID"
  }
};

if (outputJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printTextReport(report);
}

if (outputPath) {
  writeOutputReport(outputPath, report);
}

if (strict && migrationNeeded) {
  process.exit(1);
}

function writeOutputReport(outputPath, report) {
  try {
    writeFileSync(outputPath, JSON.stringify(report, null, 2));
  } catch (err) {
    console.error(`Unable to write migration report to ${outputPath}: ${err?.message || String(err)}`);
    process.exit(1);
  }
}

function collectLocalTargetFindings() {
  const file = "deploy/server-targets.local.example.json";
  if (!existsSync(file)) {
    findings.push({
      file,
      line: null,
      severity: "high",
      type: "missing-file",
      issue: "Missing server target local example, so migration checks cannot be performed reliably.",
      suggestion: "Restore the file before a migration audit.",
      command: "npm run cloud:migration:audit"
    });
    return;
  }

  let localTargets;
  try {
    localTargets = JSON.parse(readText(file));
  } catch (err) {
    findings.push({
      file,
      line: null,
      severity: "high",
      type: "invalid-json",
      issue: "Invalid JSON in local server target example.",
      suggestion: "Fix JSON syntax so migration audit can read local examples.",
      command: "node -c scripts/cloud-migration-audit.mjs"
    });
    return;
  }

  if (localTargets?.["docker-node-static"]?.host === "127.0.0.1") {
    findings.push({
      file,
      line: null,
      severity: "high",
      type: "local-preview",
      issue: "Local preview placeholder points to 127.0.0.1.",
      suggestion: "Use this entry for local validation only; never publish through this placeholder.",
      command: "docker-node-static --host 127.0.0.1 --port 4177"
    });
  }

  if (localTargets?.["generic-sftp"]?.auth_method === "ssh") {
    findings.push({
      file,
      line: null,
      severity: "medium",
      type: "team-ssh",
      issue: "Generic SFTP target still models direct SSH auth.",
      suggestion: "Use approved cloud VPN providers for repeatable team operations.",
      command: "npm run cloud:ssh-vpn:readiness -- --ssh-target USER@HOST"
    });
  }

  if (localTargets?.["ssh-wireguard-vps"]?.ssh_target && /\bexample\b/.test(localTargets?.["ssh-wireguard-vps"].ssh_target)) {
    findings.push({
      file,
      line: null,
      severity: "low",
      type: "placeholder",
      issue: "SSH target placeholder is intentionally example-based.",
      suggestion: "Replace with the approved workplace/team VPN host at handoff time.",
      command: "npm run cloud:ssh-vpn:readiness -- --ssh-target USER@HOST"
    });
  }
}

function collectDocFindings() {
  scanText("docs/deployment/server-target-selection.md", [
    {
      pattern: /docker-node-static\s+--host\s+127\.0\.0\.1/,
      severity: "high",
      type: "local-preview",
      issue: "Server target documentation includes a localhost entry in the deployment lane.",
      suggestion: "Keep as local preview; require explicit cloud lanes for release handoff.",
      command: "npm run cloud:public:readiness -- --repo OWNER/REPO"
    },
    {
      pattern: /node-vps|generic-sftp/i,
      severity: "medium",
      type: "team-ssh",
      issue: "Legacy SSH-oriented target type appears in server selection examples.",
      suggestion: "Prefer `gcp-compute-vm` and `ssh-wireguard-vps` team VPN lanes for persistent work.",
      command: "npm run cloud:ssh-vpn:readiness -- --ssh-target USER@HOST"
    }
  ]);
}

function scanText(file, rules) {
  if (!existsSync(file)) {
    findings.push({
      file,
      line: null,
      severity: "high",
      type: "missing-file",
      issue: "Expected file missing for migration audit.",
      suggestion: "Restore file before running migration audit.",
      command: "npm run cloud:migration:audit"
    });
    return;
  }

  const lines = readText(file).split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const rule of rules) {
      if (rule.pattern.test(line)) {
        findings.push({
          file,
          line: index + 1,
          severity: rule.severity,
          type: rule.type,
          issue: rule.issue,
          suggestion: rule.suggestion,
          command: rule.command
        });
      }
    }
  });
}

function printTextReport(report) {
  console.log("Cloud migration audit");
  console.log(`Generated at: ${report.generatedAt}`);
  console.log(`Migration needed: ${report.migrationNeeded ? "YES" : "NO"}`);
  console.log(`Total findings: ${report.findings.length}`);
  console.log("");

  if (report.findings.length === 0) {
    console.log("No migration blockers found in scanned files.");
    return;
  }

  console.log("Findings:");
  for (const item of report.findings) {
    const location = `${item.file}${item.line ? `:${item.line}` : ""}`;
    console.log(`- [${item.severity}] ${location}`);
    console.log(`  issue: ${item.issue}`);
    console.log(`  suggestion: ${item.suggestion}`);
    if (item.command) {
      console.log(`  command: ${item.command}`);
    }
  }

  console.log("");
  console.log("Recommended next steps:");
  for (const recommendation of report.recommendations) {
    console.log(`- ${recommendation}`);
  }
}

function readText(file) {
  return readFileSync(file, "utf8");
}

function parseArgs(rawArgs) {
  let i = 0;
  const output = {
    strict: false,
    json: false,
    output: null
  };

  for (i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i];
    if (arg === "--strict") output.strict = true;
    if (arg === "--json") output.json = true;
    if (arg === "--output") {
      output.output = rawArgs[i + 1] || null;
      if (output.output) i += 1;
    }
    if (arg.startsWith("--output=")) output.output = arg.slice("--output=".length);
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
  }

  return output;
}

function printHelp() {
  console.log("Usage:");
  console.log("  node scripts/cloud-migration-audit.mjs");
  console.log("  node scripts/cloud-migration-audit.mjs --json");
  console.log("  node scripts/cloud-migration-audit.mjs --strict");
  console.log("  node scripts/cloud-migration-audit.mjs --strict --json --output <path>");
  console.log("\nThe command audits local deployment placeholders and SSH-oriented examples.");
}
