#!/usr/bin/env node

const { mkdirSync, writeFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const isCiMode = Boolean(args.ci);
const emitJson = Boolean(args.json) || Boolean(args.artifact);
const compact = Boolean(args.compact || isCiMode);
const writeArtifact = Boolean(args.writeArtifact) || Boolean(args.artifact);
const artifactPath = resolve(args.artifact || "reports/quality-governance-publish-report.json");

const checks = [
  "check:publish-gate-contract",
  "check:open-source-governance",
  "check:seis-master-prompt-report",
  "check:seis-master-prompt",
  "check:seis-operating-identities",
  "check:workspace",
  "check:cloud-access-policy",
  "check:seis-ssh-access-model",
  "check:seis-ssh-picker-compatibility",
  "check:seis-ssh-enterprise-benchmark",
  "check:seis-platform-language-policy",
  "check:seis-platform-kernel",
  "seis:check",
  "check:language-distribution",
  "check:fullstack-language-matrix",
  "check:seis-technology-stack",
];

const steps = [];
let firstFailure = null;

for (const check of checks) {
  const result = runCheck(check);
  steps.push(result);
  if (!result.ok && !firstFailure) {
    firstFailure = result;
    if (!args.continue) {
      break;
    }
  }
}

const blockers = steps
  .filter((step) => !step.ok)
  .map((step) => ({
    area: step.id,
    reason: step.reason,
    status: step.status,
    command: step.command,
  }));

const report = {
  ok: blockers.length === 0,
  mode: "quality:governance:publish",
  generatedAt: new Date().toISOString(),
  nextStep: blockers.length === 0
    ? null
    : `npm run ${blockers[0].area}`,
  steps,
  blockers,
  summary: {
    total: steps.length,
    failed: blockers.length,
    continue: Boolean(args.continue),
  },
};

if (writeArtifact) {
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (!report.ok) {
  const blockerNames = blockers.map((item) => item.area).join(",");
  const oneLine = `quality:governance:publish=blocked; blockers=${blockerNames}; next=${blockers[0].area}`;
  if (compact) {
    console.log(oneLine);
  } else {
    console.log(oneLine);
    if (firstFailure) {
      console.log(`reason=${firstFailure.reason}`);
      if (firstFailure.stderrSummary) {
        console.log(firstFailure.stderrSummary);
      }
      if (firstFailure.stdoutSummary) {
        console.log(firstFailure.stdoutSummary);
      }
    }
  }
} else if (compact) {
  console.log("quality:governance:publish=ok");
}

if (emitJson) {
  console.log(JSON.stringify(report, null, 2));
}

process.exit(report.ok ? 0 : 1);

function parseArgs(tokens) {
  const parsed = {};
  for (let idx = 0; idx < tokens.length; idx += 1) {
    const token = tokens[idx];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    if (key === "help") {
      parsed.help = true;
      continue;
    }
    if (key === "json" || key === "ci" || key === "continue") {
      parsed[key] = true;
      continue;
    }
    if (key === "write-artifact") {
      parsed.writeArtifact = true;
      continue;
    }
    if (key === "artifact") {
      const value = tokens[idx + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      parsed.artifact = value;
      idx += 1;
      continue;
    }
    if (key === "compact") {
      parsed.compact = true;
    }
  }

  if (parsed.help) {
    console.log([
      "Usage: node scripts/quality-governance-publish.cjs [--json] [--ci] [--compact] [--continue]",
      "       [--artifact <path>] [--write-artifact]",
    ].join("\n"));
    process.exit(0);
  }

  return parsed;
}

function runCheck(scriptName) {
  const command = `npm run ${scriptName}`;
  const result = spawnSync("npm", ["run", scriptName], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
    },
  });
  const stdoutText = result.stdout ? String(result.stdout) : "";
  const stderrText = result.stderr ? String(result.stderr) : "";
  const ok = result.status === 0;
  const reason = ok ? null : firstNonEmptyLine(`${stdoutText}\n${stderrText}`) || `command failed with exit ${result.status}`;
  return {
    id: scriptName,
    command,
    ok,
    status: result.status ?? 1,
    stdoutSummary: summarizeText(stdoutText),
    stderrSummary: summarizeText(stderrText),
    reason,
  };
}

function summarizeText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;
  return trimmed.length > 1000 ? `${trimmed.slice(0, 1000)}...` : trimmed;
}

function firstNonEmptyLine(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
}
