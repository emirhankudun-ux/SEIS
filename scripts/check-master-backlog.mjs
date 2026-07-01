import { existsSync, readFileSync } from "node:fs";

const files = {
  backlog: "docs/roadmap/MASTER_BACKLOG.md",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  packageJson: "package.json"
};

const failures = [];

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }

  return readFileSync(file, "utf8");
}

function lineNumberForOffset(text, offset) {
  return text.slice(0, offset).split("\n").length;
}

function collectBacklogRows(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) {
    failures.push(`missing section marker: ${startMarker}`);
    return [];
  }

  const end = endMarker ? text.indexOf(endMarker, start + startMarker.length) : text.length;
  if (endMarker && end === -1) {
    failures.push(`missing section marker: ${endMarker}`);
    return [];
  }

  const section = text.slice(start, end === -1 ? text.length : end);
  const matches = [...section.matchAll(/^\| `(?<id>SEIS-BL-\d{3})` \|(?<rest>.*)$/gm)];

  return matches.map((match) => ({
    id: match.groups.id,
    row: match[0],
    line: lineNumberForOffset(text, start + match.index)
  }));
}

function ensureUnique(rows, label) {
  const seen = new Map();
  for (const row of rows) {
    if (seen.has(row.id)) {
      const first = seen.get(row.id);
      failures.push(`${label} duplicate ${row.id} at lines ${first.line} and ${row.line}`);
    } else {
      seen.set(row.id, row);
    }
  }
  return seen;
}

const backlog = read(files.backlog);
const nextQueue = read(files.nextQueue);
const packageJsonText = read(files.packageJson);
let packageJson = {};

try {
  packageJson = packageJsonText ? JSON.parse(packageJsonText) : {};
} catch (error) {
  failures.push(`invalid ${files.packageJson}: ${error.message}`);
}

const summaryRows = collectBacklogRows(backlog, "| ID | Priority | Lane | Work | Acceptance evidence |", "## Detailed Next Work");
const detailRows = collectBacklogRows(backlog, "| ID | Suggested branch | Suggested PR title | Risk | Approval required | Next safe action |", "## Deferred Dangerous Work");

const summaryIds = ensureUnique(summaryRows, "summary backlog table");
const detailIds = ensureUnique(detailRows, "detailed next work table");

if (summaryRows.length < 40) {
  failures.push(`summary backlog table should contain at least 40 entries, found ${summaryRows.length}`);
}

for (const row of detailRows) {
  if (!summaryIds.has(row.id)) {
    failures.push(`detailed next work ${row.id} has no matching summary backlog entry`);
  }
}

for (const row of summaryRows) {
  const cells = row.row.split("|").map((cell) => cell.trim()).filter(Boolean);
  if (cells.length !== 5) {
    failures.push(`summary row ${row.id} must have 5 cells`);
  }
}

for (const row of detailRows) {
  const cells = row.row.split("|").map((cell) => cell.trim()).filter(Boolean);
  if (cells.length !== 6) {
    failures.push(`detailed next work row ${row.id} must have 6 cells`);
  }
}

if (!summaryIds.has("SEIS-BL-037")) {
  failures.push("summary backlog must include SEIS-BL-037");
}

if (!detailIds.has("SEIS-BL-037")) {
  failures.push("detailed next work must include SEIS-BL-037");
}

if (!backlog.includes("npm run check:master-backlog")) {
  failures.push(`${files.backlog} must reference npm run check:master-backlog`);
}

if (!nextQueue.includes("SEIS-BL-037") || !nextQueue.includes("docs/backlog-id-validator")) {
  failures.push(`${files.nextQueue} must reference SEIS-BL-037 backlog-id validator work`);
}

if (packageJson.scripts?.["check:master-backlog"] !== "node scripts/check-master-backlog.mjs") {
  failures.push(`${files.packageJson} must expose check:master-backlog`);
}

if (failures.length > 0) {
  console.error("SEIS master backlog check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEIS master backlog check passed. Summary entries: ${summaryRows.length}. Detailed entries: ${detailRows.length}.`);
