#!/usr/bin/env node

const { mkdirSync, writeFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const isCiMode = Boolean(args.ci);
const autoHealLanguageDistribution = Boolean(args.autoHeal || args.auto_heal || args.auto_heal_language_distribution);
const isDryRun = Boolean(args.dryRun);
const emitJson = Boolean(args.json) || Boolean(args.artifact);
const compact = Boolean(args.compact || isCiMode);
const writeArtifact = Boolean(args.writeArtifact) || Boolean(args.artifact);
const artifactPath = resolve(args.artifact || "reports/quality-governance-publish-report.json");
const summaryArtifactPath = resolve(
  args.summaryArtifact
    || deriveSummaryPath(args.artifact ? args.artifact : "reports/quality-governance-publish-report.json")
);
const writeSummaryArtifact = Boolean(args.summary || isCiMode);

const CHECK_PRESETS = {
  core: [
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
  ],
  publish: [
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
  ],
};

const allChecks = [...new Set([...CHECK_PRESETS.core, ...CHECK_PRESETS.publish])];
const checks = buildChecks(args.checks, args.preset);

const steps = [];
let firstFailure = null;
const blockers = [];

if (isDryRun) {
  for (const check of checks) {
    steps.push({
      id: check,
      command: `npm run ${check}`,
      ok: null,
      status: null,
      mode: "dry-run",
      reason: "Not executed (dry-run)",
    });
  }
} else {
  for (const check of checks) {
    const checkSteps = runCheckWithHealing(check);
    for (const result of checkSteps) {
      steps.push(result);
      if (!result.ok) {
        if (!firstFailure || firstFailure.allowContinue) {
          firstFailure = result;
        }
        if (!args.continue && !result.allowContinue) {
          break;
        }
      }
    }
    if (firstFailure && !args.continue && !firstFailure.allowContinue) {
      break;
    }
  }
}

if (!isDryRun) {
  blockers.push(...steps
    .filter((step) => !step.ok && !step.allowContinue)
    .map((step) => ({
      area: step.id,
      reason: step.reason,
      status: step.status,
      command: step.command,
    })));
} else {
  const firstDryRunStep = steps[0];
  blockers.length = 0;
  firstFailure = firstDryRunStep
    ? {
      ...firstDryRunStep,
      ok: true,
      reason: "dry-run completed",
      status: 0,
      command: firstDryRunStep.command,
    }
    : null;
}

const report = {
  ok: isDryRun ? true : blockers.length === 0,
  mode: "quality:governance:publish",
  generatedAt: new Date().toISOString(),
  nextStep: blockers.length === 0
    ? (isDryRun ? "npm run quality:governance:publish" : null)
    : `npm run ${blockers[0].area}`,
  steps,
  blockers,
  dryRun: isDryRun,
  summary: {
    total: steps.length,
    failed: blockers.length,
    continue: Boolean(args.continue),
  },
};

const summaryArtifact = {
  ok: report.ok,
  mode: report.mode,
  generatedAt: report.generatedAt,
  dryRun: report.dryRun,
  nextStep: report.nextStep,
  failedChecks: blockers.map((entry) => entry.area),
  blockers: report.blockers,
};

if (writeArtifact) {
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(report, null, 2)}\n`);
  if (writeSummaryArtifact) {
    writeFileSync(summaryArtifactPath, `${JSON.stringify(summaryArtifact, null, 2)}\n`);
  }
}

if (!report.ok && !isDryRun) {
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

if (isDryRun) {
  console.log("quality:governance:publish=dry-run");
  const list = steps.map((step) => step.id).join(", ");
  console.log(`checks=${steps.length}; plan=[${list}]`);
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
    if (key === "auto-heal" || key === "auto-heal-language-distribution") {
      parsed.autoHeal = true;
      parsed.auto_heal = true;
      continue;
    }
    if (key === "dry-run") {
      parsed.dryRun = true;
      continue;
    }
    if (key === "summary") {
      parsed.summary = true;
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
    if (key === "summary-artifact") {
      const value = tokens[idx + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      parsed.summaryArtifact = value;
      idx += 1;
      continue;
    }
    if (key === "preset") {
      const value = tokens[idx + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      parsed.preset = value;
      idx += 1;
      continue;
    }
    if (key === "checks") {
      const value = tokens[idx + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      parsed.checks = value;
      idx += 1;
      continue;
    }
    if (key === "compact") {
      parsed.compact = true;
    }
  }

  if (parsed.help) {
    console.log([
      "Usage: node scripts/quality-governance-publish.cjs [--json] [--ci] [--compact] [--continue] [--dry-run]",
      "       [--artifact <path>] [--write-artifact] [--auto-heal]",
      "       [--preset core|publish] [--checks <check1,check2>]",
      "       [--summary] [--summary-artifact <path>]",
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

function runCheckWithHealing(scriptName) {
  const firstRun = runCheck(scriptName);
  if (firstRun.ok) {
    return [firstRun];
  }

  if (!autoHealLanguageDistribution || scriptName !== "check:language-distribution") {
    return [firstRun];
  }

  const healRun = runCheck("automation:language-distribution");
  const healedRun = runCheck(scriptName);

  firstRun.reason = `${firstRun.reason} (auto-heal attempted: ${healRun.command})`;
  firstRun.allowContinue = true;

  return [
    firstRun,
    {
      ...healRun,
      id: "check:language-distribution:auto-heal",
      reason: healRun.ok ? "language distribution regenerated" : null,
      status: healRun.status,
      allowContinue: true,
    },
    healedRun,
  ];
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

function buildChecks(checksArg, presetArg) {
  if (checksArg) {
    const requested = checksArg.split(",").map((value) => value.trim()).filter(Boolean);
    const unknown = requested.filter((entry) => !allChecks.includes(entry));
    if (unknown.length > 0) {
      throw new Error(`Unknown check(s) for quality publish: ${unknown.join(", ")}`);
    }
    return requested;
  }

  const preset = (presetArg || "publish").toLowerCase();
  if (!CHECK_PRESETS[preset]) {
    throw new Error(`Unknown preset for quality publish: ${preset}. Available: ${Object.keys(CHECK_PRESETS).join(", ")}`);
  }
  return CHECK_PRESETS[preset];
}

function deriveSummaryPath(pathValue) {
  if (!pathValue || pathValue.endsWith(".json") === false) {
    return `${pathValue || "reports/quality-governance-publish-report"}-summary.json`;
  }
  return pathValue.replace(/\.json$/, "-summary.json");
}
