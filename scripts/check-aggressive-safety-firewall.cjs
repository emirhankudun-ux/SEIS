const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "content", "development", "aggressive-safety-firewall.json");
const CHECK_MODE = process.argv.includes("--check");

const BLOCKED_PATTERNS = [
  { id: "force-push", pattern: /git\s+push\s+.*(--force|-f|--force-with-lease)/i },
  { id: "remote-delete", pattern: /git\s+push\s+\S+\s+:(main|UIXAppTTR|master)/i },
  { id: "destructive-remove", pattern: /rm\s+-rf\s+(\.|\/|~|\*)/i },
  { id: "secret-print", pattern: /(cat|echo|printenv)\s+.*(TOKEN|SECRET|PASSWORD|PRIVATE_KEY)/i },
  { id: "blind-production-deploy", pattern: /(vercel|netlify|firebase|wrangler)\s+.*(deploy|publish).*(--prod|production)/i },
  { id: "github-repo-delete", pattern: /gh\s+repo\s+delete/i }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function collectCommands() {
  const manifest = readJson("package.json");
  const plan = readJson("content/development/aggressive-execution-plan.json");
  const localRun = readJson("content/development/aggressive-local-run-report.json");

  const packageCommands = Object.entries(manifest.scripts || {}).map(([id, command]) => ({
    surface: "package.json",
    id,
    command
  }));

  const planCommands = [
    ...(plan.fastTrackCommands || []).map((command, index) => ({
      surface: "aggressive-execution-plan.fastTrackCommands",
      id: `fast-${index + 1}`,
      command
    })),
    ...(plan.executionBatches || []).flatMap((batch) =>
      (batch.qualityCommands || []).map((command, index) => ({
        surface: `aggressive-execution-plan.${batch.id}`,
        id: `quality-${index + 1}`,
        command
      }))
    )
  ];

  const runCommands = (localRun.commands || []).map((entry, index) => ({
    surface: "aggressive-local-run-report.commands",
    id: `run-${index + 1}`,
    command: entry.command
  }));

  return [...packageCommands, ...planCommands, ...runCommands];
}

function buildReport() {
  const commands = collectCommands();
  const plan = readJson("content/development/aggressive-execution-plan.json");
  const localRun = readJson("content/development/aggressive-local-run-report.json");
  const publishGate = readJson("content/development/publish-gate-contract.json");

  const violations = [];
  for (const entry of commands) {
    for (const blocked of BLOCKED_PATTERNS) {
      if (blocked.pattern.test(entry.command || "")) {
        violations.push({ ...entry, blockedPattern: blocked.id });
      }
    }
  }

  const hardStops = [
    ...(plan.doNotCross || []),
    ...(localRun.doNotCross || []),
    ...(publishGate.readinessLevels || []).flatMap((level) => level.blocks || [])
  ];

  return {
    id: "seis-aggressive-safety-firewall",
    version: 1,
    mode: "command-and-publish-boundary-firewall",
    scannedCommandCount: commands.length,
    blockedPatterns: BLOCKED_PATTERNS.map((item) => item.id),
    violations,
    publishBoundary: {
      pushAllowed: false,
      deployAllowed: false,
      reason: publishGate.currentEnvironmentPolicy?.expectedResult || "configured-but-not-publish-ready"
    },
    hardStops: Array.from(new Set(hardStops)).slice(0, 20),
    passed: violations.length === 0
  };
}

function stable(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const next = stable(buildReport());

if (CHECK_MODE) {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error("Aggressive safety firewall report is missing. Run npm run automation:aggressive-safety-firewall.");
    process.exit(1);
  }

  const current = fs.readFileSync(REPORT_PATH, "utf8");
  if (current !== next) {
    console.error("Aggressive safety firewall report is out of date. Run npm run automation:aggressive-safety-firewall.");
    process.exit(1);
  }

  const report = JSON.parse(current);
  if (!report.passed || report.violations.length > 0 || report.publishBoundary.pushAllowed !== false) {
    console.error("Aggressive safety firewall check failed.");
    process.exit(1);
  }

  console.log("Aggressive safety firewall check passed.");
  process.exit(0);
}

fs.writeFileSync(REPORT_PATH, next);
console.log(`Aggressive safety firewall report written: ${path.relative(ROOT, REPORT_PATH)}`);

if (!JSON.parse(next).passed) process.exit(1);
