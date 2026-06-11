#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "reports", "automation-refresh-seis-surface-summary.json");
const START_TIME = Date.now();

const PIPELINE = [
  {
    id: "automation:ecosystem-intake",
    label: "SEIS ecosystem intake",
    command: ["run", "automation:ecosystem-intake"],
    check: "check:ecosystem-intake",
    paths: [
      "content/development/third-party-adaptation-plan.json",
      "content/development/toolchain-runtime-readiness.json",
      "content/development/desktop-app-integration.json",
      "reports/third-party-adaptation-plan.md",
      "reports/toolchain-runtime-readiness.md",
      "reports/desktop-app-integration.md"
    ]
  },
  {
    id: "automation:plugin-environment-sources",
    label: "Plugin environment sources",
    command: ["run", "automation:plugin-environment-sources"],
    check: "check:plugin-environment-sources",
    paths: [
      "deploy/cloud-environment.json",
      "reports/local-ai-tool-readiness.json",
      "reports/third-party-ai-tool-inventory.json"
    ]
  },
  {
    id: "automation:universal-capability-kernel",
    label: "SEIS universal capability kernel",
    command: ["run", "automation:universal-capability-kernel"],
    check: "check:universal-capability-kernel",
    paths: [
      "content/development/seis-universal-capability-kernel.json",
      "reports/seis-universal-capability-kernel.json",
      "reports/seis-universal-capability-kernel.md"
    ]
  },
  {
    id: "automation:ai-release-manifest",
    label: "AI release manifest",
    command: ["run", "automation:ai-release-manifest"],
    check: "check:ai-release-manifest",
    paths: [
      "content/development/ai-release-manifest.json",
      "reports/ai-release-manifest.json",
      "reports/ai-release-manifest.md"
    ]
  },
  {
    id: "automation:fullstack-language-matrix",
    label: "Full-stack language matrix",
    command: ["run", "automation:fullstack-language-matrix"],
    check: "check:fullstack-language-matrix",
    paths: [
      "content/development/fullstack-language-matrix.json",
      "reports/fullstack-language-matrix.json",
      "reports/fullstack-language-matrix.md"
    ]
  },
  {
    id: "automation:language-distribution",
    label: "Language distribution budget",
    command: ["run", "automation:language-distribution"],
    check: "check:language-distribution",
    paths: [
      ".gitattributes",
      ".gitignore",
      "reports/language-distribution.json",
      "reports/language-distribution.md"
    ]
  },
  {
    id: "automation:refresh-release",
    label: "Release web sync",
    command: ["run", "automation:refresh-release"],
    check: "check:release-sync",
    paths: ["release/web/app.js", "release/web/index.html", "release/web/styles.css"]
  }
];

const BASE_VALIDATION_CHECKS = [
  { id: "check:workspace", label: "Workspace integrity" },
  { id: "check:release-sync", label: "Release sync" },
  { id: "check:ecosystem-intake", label: "SEIS ecosystem intake" },
  { id: "check:plugin-environment-sources", label: "Plugin environment sources" },
  { id: "check:universal-capability-kernel", label: "SEIS universal capability kernel" },
  { id: "check:ai-release-manifest", label: "AI release manifest" },
  { id: "check:llm-orchestration-policy", label: "LLM orchestration policy" },
  { id: "check:fullstack-language-matrix", label: "Full-stack language matrix" },
  { id: "check:language-distribution", label: "Language distribution budget" },
  { id: "check:motion-evidence", label: "Motion evidence" },
  { id: "check:mobile-ergonomics", label: "Mobile ergonomics" },
  { id: "check:cloud-environment", label: "Cloud environment" }
];

const CI_EXTRA_CHECKS = [
  { id: "check:foundation", label: "Foundation" },
  { id: "check:seis-plugin-bundle", label: "SEIS plugin bundle" },
  { id: "check:ai-launcher-offline", label: "AI launcher offline fallback" }
];

const SUPPORTED_FLAGS = new Set(["--help", "-h", "--summary", "--verbose", "--ci"]);

const args = process.argv.slice(2);
const options = {
  summary: args.includes("--summary"),
  verbose: args.includes("--verbose"),
  ci: args.includes("--ci")
};

const unknown = args.filter((arg, index) => {
  if (!arg.startsWith("--")) {
    if (arg.startsWith("-") && arg !== "-h") {
      return true;
    }
    return false;
  }

  if (arg.startsWith("--skip") || arg === "--no-check" || arg === "--json-only" || arg === "--no-summary") {
    return true;
  }

  if (!SUPPORTED_FLAGS.has(arg)) {
    return true;
  }

  return false;
});

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

if (unknown.length > 0) {
  console.error("❌ Desteklenmeyen seçenek bulundu.");
  console.error(`Önerilen seçenekler: ${Array.from(SUPPORTED_FLAGS).join(", ")}`);
  printHelp();
  process.exit(1);
}

const colorEnabled = process.stdout.isTTY;
const colors = {
  reset: colorEnabled ? "\u001b[0m" : "",
  dim: colorEnabled ? "\u001b[2m" : "",
  green: colorEnabled ? "\u001b[32m" : "",
  yellow: colorEnabled ? "\u001b[33m" : "",
  red: colorEnabled ? "\u001b[31m" : "",
  cyan: colorEnabled ? "\u001b[36m" : ""
};

const report = {
  command: "npm run automation:refresh-seis-surface",
  startedAt: new Date().toISOString(),
  ciMode: options.ci,
  durationMs: null,
  completedAt: null,
  result: "success",
  failedAt: null,
  suggestion: null,
  steps: [],
  checks: [],
  changedPaths: []
};

logInfo("SEIS tek tuşlu yüzey yenileme akışı başlatıldı.");
logInfo(`Adım sırası: ${PIPELINE.map((step) => step.id).join(" -> ")}`);
if (options.ci) {
  logWarn("CI modu aktif: genişletilmiş doğrulama seti eklendi.");
}

const trackedPaths = allTrackedPaths();
const baseSnapshot = snapshotFiles(trackedPaths);
let failed = false;

for (let i = 0; i < PIPELINE.length; i += 1) {
  const step = PIPELINE[i];
  const stepOrder = `${i + 1}/${PIPELINE.length}`;
  logStepHeader(stepOrder, step.label, step.id);

  const before = snapshotFiles(step.paths);
  const command = [`npm`, ...step.command].join(" ");
  const runRecord = {
    id: step.id,
    label: step.label,
    command,
    check: step.check,
    status: "success",
    stepMs: 0,
    exitCode: 0,
    changedPaths: [],
    stdout: null,
    stderr: null
  };

  const runStart = Date.now();
  const commandResult = runNpm(step.command);
  runRecord.stepMs = Date.now() - runStart;
  runRecord.exitCode = commandResult.status;
  if (commandResult.stdout) runRecord.stdout = preview(commandResult.stdout);
  if (commandResult.stderr) runRecord.stderr = preview(commandResult.stderr);

  if (options.verbose && commandResult.stdout) {
    console.log(`${colors.dim}--- ${command} output ---${colors.reset}`);
    console.log(commandResult.stdout);
  }

  if (commandResult.status !== 0) {
    runRecord.status = "failed";
    failed = true;
    report.result = "failed";
    report.failedAt = {
      stage: step.id,
      command,
      check: null,
      exitCode: commandResult.status
    };
    report.suggestion = `npm run ${step.id}`;
    runRecord.changedPaths = [];
    runRecord.error = commandResult.stderr || "command failed without stderr";
    report.steps.push(runRecord);
    logFailureSingleLine(runRecord, step.id);
    printFailureAdvice(report.failedAt, report.suggestion);
    break;
  }

  const after = snapshotFiles(step.paths);
  runRecord.changedPaths = diffSnapshots(before, after);
  report.steps.push(runRecord);
  logSuccessLine(step.id, command, runRecord.stepMs, runRecord.changedPaths, step.paths);

  const checkStart = Date.now();
  const checkCommand = `npm run ${step.check}`;
  const checkResult = runNpm(["run", step.check]);
  const checkRecord = {
    id: step.check,
    label: `${step.label} check`,
    command: checkCommand,
    status: checkResult.status === 0 ? "success" : "failed",
    stepMs: Date.now() - checkStart,
    exitCode: checkResult.status,
    changedPaths: [],
    stdout: preview(checkResult.stdout),
    stderr: preview(checkResult.stderr)
  };

  if (options.verbose && checkResult.stdout) {
    console.log(`${colors.dim}--- ${checkCommand} output ---${colors.reset}`);
    console.log(checkResult.stdout);
  }

  report.checks.push(checkRecord);
  if (checkResult.status !== 0) {
    failed = true;
    report.result = "failed";
    report.failedAt = {
      stage: step.id,
      command,
      check: step.check,
      exitCode: checkResult.status
    };
    report.suggestion = `npm run ${step.check} && npm run ${step.id}`;
    logCheckFailure(step.id, checkCommand, checkRecord.stepMs, checkResult);
    printFailureAdvice(report.failedAt, report.suggestion);
    break;
  }

  logCheckSuccessLine(step.check, checkRecord.stepMs);
}

if (!failed) {
  const checks = options.ci ? [...BASE_VALIDATION_CHECKS, ...CI_EXTRA_CHECKS] : BASE_VALIDATION_CHECKS;
  for (const check of checks) {
    const checkStart = Date.now();
    const checkCommand = `npm run ${check.id}`;
    const checkResult = runNpm(["run", check.id]);

    const checkRecord = {
      id: check.id,
      label: check.label,
      command: checkCommand,
      status: checkResult.status === 0 ? "success" : "failed",
      stepMs: Date.now() - checkStart,
      exitCode: checkResult.status,
      changedPaths: [],
      stdout: preview(checkResult.stdout),
      stderr: preview(checkResult.stderr)
    };

    if (options.verbose && checkResult.stdout) {
      console.log(`${colors.dim}--- ${checkCommand} output ---${colors.reset}`);
      console.log(checkResult.stdout);
    }

    report.checks.push(checkRecord);
    if (checkResult.status !== 0) {
      failed = true;
      report.result = "failed";
      report.failedAt = {
        stage: check.id,
        command: checkCommand,
        check: check.id,
        exitCode: checkResult.status
      };
      report.suggestion = `npm run ${check.id}`;
      logCheckFailure(check.id, checkCommand, checkRecord.stepMs, checkResult, "post-check");
      printFailureAdvice(report.failedAt, report.suggestion);
      break;
    }

    logCheckSuccessLine(check.id, checkRecord.stepMs);
  }
}

const finalSnapshot = snapshotFiles(trackedPaths);
report.changedPaths = diffSnapshots(baseSnapshot, finalSnapshot).sort();
report.durationMs = Date.now() - START_TIME;
report.completedAt = new Date().toISOString();

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (failed) {
  logFailSummary(report.failedAt);
  if (options.summary) {
    console.log(JSON.stringify(report, null, 2));
  }
  process.exit(1);
}

printSuccessSummary();
if (options.summary) {
  console.log(JSON.stringify(report, null, 2));
}

function runNpm(commandArgs) {
  const result = spawnSync("npm", commandArgs, {
    cwd: ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });

  return {
    status: result.status === null || result.status === undefined ? 1 : result.status,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim()
  };
}

function snapshotFiles(relPaths) {
  const snapshot = {};

  for (const relPath of relPaths) {
    const absolutePath = path.join(ROOT, relPath);
    if (!fs.existsSync(absolutePath)) {
      snapshot[relPath] = { exists: false, hash: null, bytes: 0 };
      continue;
    }

    const content = fs.readFileSync(absolutePath);
    snapshot[relPath] = {
      exists: true,
      hash: crypto.createHash("sha256").update(content).digest("hex"),
      bytes: content.length
    };
  }

  return snapshot;
}

function diffSnapshots(before, after) {
  const changed = [];

  for (const relPath of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const beforeItem = before[relPath];
    const afterItem = after[relPath];
    if (
      beforeItem?.exists !== afterItem?.exists ||
      beforeItem?.hash !== afterItem?.hash ||
      beforeItem?.bytes !== afterItem?.bytes
    ) {
      changed.push(relPath);
    }
  }

  return changed.sort();
}

function allTrackedPaths() {
  const paths = PIPELINE.flatMap((step) => step.paths);
  return Array.from(new Set(paths));
}

function preview(text) {
  if (!text) {
    return null;
  }
  const safeText = String(text);
  if (safeText.length < 1800) {
    return safeText;
  }
  return `${safeText.slice(0, 1800)}...`;
}

function formatMs(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

function logInfo(message) {
  console.log(`${colors.cyan}${message}${colors.reset}`);
}

function logWarn(message) {
  console.log(`${colors.yellow}${message}${colors.reset}`);
}

function logStepHeader(stepOrder, label, id) {
  console.log(`${colors.cyan}[${stepOrder}] ${label} (${id})${colors.reset}`);
}

function logSuccessLine(id, command, duration, changedPaths, expectedPaths) {
  const changedText = changedPaths.length > 0 ? `${changedPaths.join(", ")}` : "değişim yok";
  const expectedText = expectedPaths.join(", ");
  console.log(`${colors.green}✅ ${command} => ${id} (${formatMs(duration)})${colors.reset}`);
  console.log(`${colors.dim}   path listesi: ${expectedText}${colors.reset}`);
  console.log(`${colors.dim}   değişen: ${changedText}${colors.reset}`);
}

function logCheckSuccessLine(id, duration) {
  console.log(`${colors.green}✅ check: ${id} (${formatMs(duration)})${colors.reset}`);
}

function logCheckFailure(id, checkCommand, duration, result, kind = "inline") {
  const scope = kind === "post-check" ? "post-check" : "step-check";
  console.log(`${colors.red}❌ ${scope} hata: ${id} - ${checkCommand} (${formatMs(duration)}, exit ${result.status})${colors.reset}`);
  if (result.stderr) {
    console.error(`${colors.red}${result.stderr}${colors.reset}`);
  }
}

function logFailureSingleLine(runRecord, id) {
  console.log(`${colors.red}❌ Komut hatası: ${id} - ${runRecord.command} (exit ${runRecord.exitCode})${colors.reset}`);
  if (runRecord.stderr) {
    console.error(`${colors.red}${runRecord.stderr}${colors.reset}`);
  }
}

function logFailSummary(failedAt) {
  console.log(`${colors.red}⚠️  Başarısız adım: ${failedAt.stage}${colors.reset}`);
  console.log(`${colors.red}   Tek satır özet: ${failedAt.command}${failedAt.check ? ` -> ${failedAt.check}` : ""} (exit ${failedAt.exitCode})${colors.reset}`);
}

function printFailureAdvice(failedAt, suggestion) {
  console.log(`${colors.yellow}Tekrar denemek için: ${suggestion}${colors.reset}`);
  console.log(`${colors.yellow}Rapor dosyası: ${path.relative(ROOT, REPORT_PATH)}${colors.reset}`);
  console.log(`${colors.yellow}Not: Hata bilgisi için adım kodunu ve exit kodunu birlikte kullanın.${colors.reset}`);
  console.error("Abort refresh pipeline. Fix the failure, then rerun.");
}

function printSuccessSummary() {
  console.log(`${colors.green}🚀 SEIS surface refresh complete.${colors.reset}`);
  console.log(`${colors.cyan}Süre: ${formatMs(report.durationMs)}${colors.reset}`);
  console.log(`${colors.cyan}Kontrol adımları: ${PIPELINE.length + BASE_VALIDATION_CHECKS.length + (options.ci ? CI_EXTRA_CHECKS.length : 0)}${colors.reset}`);
  console.log(`${colors.dim}değişen dosyalar: ${report.changedPaths.length > 0 ? report.changedPaths.join(", ") : "değişiklik yok"}${colors.reset}`);
  console.log(`${colors.dim}özet dosyası: ${path.relative(ROOT, REPORT_PATH)}${colors.reset}`);
  console.log(`${colors.dim}next step: ikinci çalıştırmada tekrar aynı sonuç vermeli (idempotent)${colors.reset}`);
}

function printHelp() {
  console.log(`
SEIS Tek Tuşlu Yüzey Yenileme

Komut:
  npm run automation:refresh-seis-surface

Akış:
  1) npm run automation:ecosystem-intake -> check:ecosystem-intake
  2) npm run automation:plugin-environment-sources -> check:plugin-environment-sources
  3) npm run automation:universal-capability-kernel -> check:universal-capability-kernel
  4) npm run automation:ai-release-manifest -> check:ai-release-manifest
  5) npm run automation:fullstack-language-matrix -> check:fullstack-language-matrix
  6) npm run automation:language-distribution -> check:language-distribution
  7) npm run automation:refresh-release -> check:release-sync

Seçenekler:
  --summary     Sonuç raporunu JSON olarak döndürür.
  --verbose     Hata anında komut çıktısını gösterir.
  --ci          İsteğe bağlı genişletilmiş doğrulama seti (tek tuş akışına ek).
  --help,-h     Bu yardım metnini gösterir.

Desteklenmeyen seçenekler:
  --skip-check, --no-check, --json-only
`);
}
