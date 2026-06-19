import { existsSync, readFileSync } from "node:fs";

const registryPath = "content/development/seis-goal-tracking.json";
const evidencePath = "content/development/seis-goal-evidence.json";
const sensitiveTextPatterns = [
  new RegExp(["/", "Users"].join(""), "i"),
  new RegExp(`file:${"/".repeat(2)}|vscode:${"/".repeat(2)}`, "i"),
  new RegExp(`${["BEGIN", ".*KEY"].join(" ")}|${["PRIVATE", "KEY"].join(" ")}`, "i"),
  new RegExp(["token", "="].join(""), "i"),
  new RegExp(["api", "[_-]?", "key"].join(""), "i")
];

const requiredDocs = [
  "docs/goals/seis-vision.md",
  "docs/goals/long-term-goals.md",
  "docs/goals/goal-tracking-system.md",
  "docs/goals/goal-schema.md",
  "docs/goals/milestone-map.md",
  "docs/goals/progress-review.md",
  "docs/goals/evidence-ledger.md",
  "docs/goals/weekly-priorities-template.md",
  "docs/goals/monthly-review-template.md",
  "docs/roadmap/MASTER_BACKLOG.md",
  "docs/roadmap/NEXT_PR_QUEUE.md",
  "docs/product/goal-tracking-center.md",
  "docs/product/command-center-goals-view.md",
  "docs/reviews/GOAL_TRACKING_REVIEW.md"
];

const requiredCategories = [
  "SEIS AI Core",
  "SEIS App / Command Center",
  "Goal Tracking OS",
  "Repository Intelligence",
  "Documentation System",
  "Security and Governance",
  "GitHub Workflow",
  "Public Readiness",
  "Release Readiness",
  "Design System",
  "Agent Runtime",
  "Automation Queue",
  "Model Router",
  "Prompt Engine",
  "Evaluation Lab",
  "Knowledge Graph",
  "SSH / Cloud Workspace",
  "SEIS Universe Research",
  "Portfolio / Creative Systems",
  "Long-Term Product Vision"
];

const requiredGoalFields = [
  "id",
  "title",
  "description",
  "category",
  "priority",
  "status",
  "owner_role",
  "created_date",
  "target_phase",
  "related_roadmap_item",
  "related_docs",
  "related_files",
  "related_milestone",
  "related_epic",
  "dependencies",
  "blockers",
  "risk_level",
  "risks",
  "evidence_links",
  "validation_method",
  "validation_evidence",
  "next_action",
  "last_reviewed",
  "review_cadence"
];

const failures = [];

for (const file of requiredDocs) {
  if (!existsSync(file)) {
    failures.push(`missing required goal deliverable: ${file}`);
  }
}

if (!existsSync(registryPath)) {
  failures.push(`missing goal registry: ${registryPath}`);
}

if (!existsSync(evidencePath)) {
  failures.push(`missing goal evidence ledger: ${evidencePath}`);
}

const registry = existsSync(registryPath)
  ? JSON.parse(readFileSync(registryPath, "utf8"))
  : null;

const evidenceLedger = existsSync(evidencePath)
  ? JSON.parse(readFileSync(evidencePath, "utf8"))
  : null;

let knownGoalIds = new Set();

if (registry) {
  if (registry.schemaVersion !== 1) {
    failures.push("goal registry schemaVersion must be 1");
  }

  if (registry.mode !== "non_llm_goal_tracking_foundation") {
    failures.push("goal registry mode must be non_llm_goal_tracking_foundation");
  }

  for (const category of requiredCategories) {
    if (!registry.categories?.includes(category)) {
      failures.push(`goal registry missing category: ${category}`);
    }
  }

  const allowedStatuses = new Set(registry.allowedStatuses || []);
  const allowedPriorities = new Set(registry.allowedPriorities || []);
  const allowedRiskLevels = new Set(registry.allowedRiskLevels || []);
  const categories = new Set(registry.categories || []);
  const goals = registry.goals || [];
  const ids = new Set();
  knownGoalIds = new Set(goals.map((goal) => goal.id));

  if (goals.length < requiredCategories.length) {
    failures.push("goal registry should cover the strategic categories");
  }

  for (const category of requiredCategories) {
    if (!goals.some((goal) => goal.category === category)) {
      failures.push(`no goal record for category: ${category}`);
    }
  }

  for (const goal of goals) {
    const label = goal.id || "(missing id)";

    for (const field of requiredGoalFields) {
      if (!(field in goal)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }

    if (ids.has(goal.id)) {
      failures.push(`duplicate goal id: ${goal.id}`);
    }
    ids.add(goal.id);

    if (!/^SEIS-GOAL-\d{3}$/.test(goal.id || "")) {
      failures.push(`${label} id must match SEIS-GOAL-000 format`);
    }

    if (!categories.has(goal.category)) {
      failures.push(`${label} has unknown category: ${goal.category}`);
    }

    if (!allowedStatuses.has(goal.status)) {
      failures.push(`${label} has invalid status: ${goal.status}`);
    }

    if (!allowedPriorities.has(goal.priority)) {
      failures.push(`${label} has invalid priority: ${goal.priority}`);
    }

    if (!allowedRiskLevels.has(goal.risk_level)) {
      failures.push(`${label} has invalid risk_level: ${goal.risk_level}`);
    }

    for (const field of ["related_docs", "related_files", "dependencies", "blockers", "risks", "evidence_links", "validation_evidence"]) {
      if (!Array.isArray(goal[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }

    if (goal.status === "active" && hasUnavailableEvidence(goal)) {
      failures.push(`${label} is active but has unavailable evidence`);
    }

    if (goal.status === "blocked" && (!goal.blockers?.length || goal.blockers.includes("none"))) {
      failures.push(`${label} is blocked but does not name blockers`);
    }

    if ((goal.status === "completed" || goal.status === "validated") && !goal.validation_evidence?.length) {
      failures.push(`${label} is ${goal.status} without validation_evidence`);
    }

    if (!String(goal.next_action || "").trim()) {
      failures.push(`${label} must define next_action`);
    }

    for (const link of goal.evidence_links || []) {
      validateEvidenceLink(label, link);
    }

    for (const link of goal.related_docs || []) {
      validateRelativePath(label, link, "related_docs");
    }
  }
}

if (evidenceLedger) {
  if (evidenceLedger.schemaVersion !== 1) {
    failures.push("goal evidence ledger schemaVersion must be 1");
  }

  if (evidenceLedger.mode !== "non_llm_goal_evidence_foundation") {
    failures.push("goal evidence ledger mode must be non_llm_goal_evidence_foundation");
  }

  const allowedStatuses = new Set(evidenceLedger.allowedStatuses || []);
  const allowedTypes = new Set(evidenceLedger.allowedTypes || []);
  const records = evidenceLedger.records || [];
  const ids = new Set();

  if (!Array.isArray(records) || records.length === 0) {
    failures.push("goal evidence ledger must contain records");
  }

  for (const record of records) {
    const label = record.id || "(missing evidence id)";
    for (const field of [
      "id",
      "title",
      "type",
      "status",
      "observed_at",
      "command",
      "supports_goal_ids",
      "related_paths",
      "summary",
      "limitations",
      "next_action"
    ]) {
      if (!(field in record)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }

    if (ids.has(record.id)) {
      failures.push(`duplicate evidence id: ${record.id}`);
    }
    ids.add(record.id);

    if (!/^SEIS-EVID-\d{3}$/.test(record.id || "")) {
      failures.push(`${label} id must match SEIS-EVID-000 format`);
    }

    if (!allowedTypes.has(record.type)) {
      failures.push(`${label} has invalid type: ${record.type}`);
    }

    if (!allowedStatuses.has(record.status)) {
      failures.push(`${label} has invalid status: ${record.status}`);
    }

    for (const field of ["supports_goal_ids", "related_paths", "limitations"]) {
      if (!Array.isArray(record[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }

    for (const goalId of record.supports_goal_ids || []) {
      if (!knownGoalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }

    for (const relatedPath of record.related_paths || []) {
      validateRelativePath(label, relatedPath, "related_paths", {
        allowMissing: record.status === "blocked" || record.status === "failed"
      });
    }

    for (const [field, value] of Object.entries({
      title: record.title,
      command: record.command,
      summary: record.summary,
      next_action: record.next_action
    })) {
      validateSafeText(label, field, value);
    }

    for (const limitation of record.limitations || []) {
      validateSafeText(label, "limitations", limitation);
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS goal tracking check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const byStatus = countBy(registry.goals, "status");
const byPriority = countBy(registry.goals, "priority");
const byCategory = countBy(registry.goals, "category");

console.log(JSON.stringify({
  ok: true,
  registry: registryPath,
  goals: registry.goals.length,
  categories: Object.keys(byCategory).length,
  byStatus,
  byPriority,
  docs: requiredDocs.length,
  evidenceRecords: evidenceLedger.records.length
}, null, 2));

function hasUnavailableEvidence(goal) {
  return (goal.evidence_links || []).includes("evidence unavailable");
}

function validateEvidenceLink(label, link) {
  if (link === "evidence unavailable") {
    return;
  }
  validateRelativePath(label, link, "evidence_links");
}

function validateRelativePath(label, link, field, options = {}) {
  if (typeof link !== "string" || link.length === 0) {
    failures.push(`${label} ${field} contains an empty link`);
    return;
  }
  if (link.startsWith("/") || link.includes("://") || link.includes("..\\") || link.includes("\\\\")) {
    failures.push(`${label} ${field} must use repo-relative paths only: ${link}`);
    return;
  }
  if (!options.allowMissing && !existsSync(link)) {
    failures.push(`${label} ${field} points to missing path: ${link}`);
  }
}

function validateSafeText(label, field, value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    failures.push(`${label} ${field} must be a non-empty string`);
    return;
  }

  if (sensitiveTextPatterns.some((pattern) => pattern.test(value))) {
    failures.push(`${label} ${field} contains a private path or sensitive-looking pattern`);
  }
}

function countBy(items, key) {
  const counts = {};
  for (const item of items) {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
  }
  return counts;
}
