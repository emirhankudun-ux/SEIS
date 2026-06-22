const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_FILE = path.join(REPORT_DIR, "latest-development-report.md");
const GAP_FILE = path.join(ROOT, "data", "gap-closure-register.json");

function runNode(scriptPath) {
  return spawnSync("node", [scriptPath], {
    cwd: ROOT,
    encoding: "utf8"
  });
}

function runCheck() {
  return runNode("scripts/check-workspace.cjs");
}

function runGapSync() {
  return runNode("scripts/automation-gap-sync.cjs");
}

function runPublishReadiness() {
  return runNode("scripts/automation-publish-readiness.cjs");
}

function toTableRow(columns) {
  return `| ${columns.join(" | ")} |`;
}

function renderGapRows(gaps) {
  return gaps
    .map((gap) =>
      toTableRow([
        gap.id,
        gap.status,
        gap.priority,
        gap.surface,
        String(gap.nextAction).replace(/\|/g, "/")
      ])
    )
    .join("\n");
}

function codeFence(text) {
  const output = String(text || "").trim();
  return output.length > 0 ? output : "no output";
}

const gapSync = runGapSync();
const check = runCheck();
const publishReadiness = runPublishReadiness();
const gapRegister = JSON.parse(fs.readFileSync(GAP_FILE, "utf8"));
fs.mkdirSync(REPORT_DIR, { recursive: true });

const report = [
  "# UI-UX Digital Lab Development Report",
  "",
  `- Timestamp: ${new Date().toISOString()}`,
  `- Workspace: \`${ROOT}\``,
  `- Gap sync: ${gapSync.status === 0 ? "pass" : "fail"}`,
  `- Check status: ${check.status === 0 ? "pass" : "fail"}`,
  `- Publish readiness: ${publishReadiness.status === 0 ? "ready" : "blocked"}`,
  "",
  "## Gap Snapshot",
  "",
  toTableRow(["id", "status", "priority", "surface", "nextAction"]),
  toTableRow(["---", "---", "---", "---", "---"]),
  renderGapRows(gapRegister.gaps),
  "",
  "## Publish Preflight Output",
  "",
  "```text",
  codeFence(publishReadiness.stdout),
  "```",
  "",
  "## Gap Sync Output",
  "",
  "```text",
  codeFence(gapSync.stdout),
  "```",
  "",
  "## Guardrail Reminder",
  "",
  "- Keep changes small and reversible.",
  "- Separate auth/server blockers from source quality.",
  "- Avoid heavy local processes unless explicitly needed.",
  ""
].join("\n");

const previousReport = fs.existsSync(REPORT_FILE) ? fs.readFileSync(REPORT_FILE, "utf8") : "";
const reportChanged = normalizeReport(previousReport) !== normalizeReport(report);

if (reportChanged) {
  fs.writeFileSync(REPORT_FILE, report);
}

if (gapSync.status !== 0 || check.status !== 0) {
  process.stdout.write(gapSync.stdout || "");
  process.stderr.write(gapSync.stderr || "");
  process.stdout.write(check.stdout || "");
  process.stderr.write(check.stderr || "");
  console.error(`Report written: ${REPORT_FILE}`);
  process.exit(1);
}

console.log(reportChanged ? `Development report written: ${REPORT_FILE}` : `Development report unchanged: ${REPORT_FILE}`);

function normalizeReport(reportText) {
  return String(reportText || "").replace(/^- Timestamp: .+$/m, "- Timestamp: <stable>");
}
