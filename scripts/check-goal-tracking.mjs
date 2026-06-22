import { existsSync, readFileSync } from "node:fs";

const requiredDocs = [
  "docs/goals/seis-vision.md",
  "docs/goals/long-term-goals.md",
  "docs/goals/goal-tracking-system.md",
  "docs/goals/goal-schema.md",
  "docs/goals/milestone-map.md",
  "docs/goals/progress-review.md",
  "docs/goals/evidence-ledger.md",
  "docs/goals/execution-board.md",
  "docs/goals/daily-review-template.md",
  "docs/goals/weekly-priorities-template.md",
  "docs/goals/monthly-review-template.md",
  "docs/product/goal-tracking-center.md",
  "docs/product/command-center-goals-view.md",
  "docs/reviews/GOAL_TRACKING_REVIEW.md",
  "docs/roadmap/MASTER_BACKLOG.md",
  "docs/roadmap/NEXT_PR_QUEUE.md",
  "docs/STATUS.md",
  "docs/INDEX.md"
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

const registryPath = "content/development/seis-goal-tracking.json";
const evidencePath = "content/development/seis-goal-evidence.json";
const executionPath = "content/development/seis-goal-execution.json";
const failures = [];

for (const file of requiredDocs) {
  if (!existsSync(file)) {
    failures.push(`missing required goal doc: ${file}`);
  }
}

for (const file of [registryPath, evidencePath, executionPath]) {
  if (!existsSync(file)) {
    failures.push(`missing required goal source: ${file}`);
  }
}

const registry = existsSync(registryPath) ? readJson(registryPath) : null;
const evidence = existsSync(evidencePath) ? readJson(evidencePath) : null;
const execution = existsSync(executionPath) ? readJson(executionPath) : null;

if (registry) {
  assert(registry.schemaVersion === 1, "goal registry schemaVersion must be 1");
  assert(registry.mode === "non_llm_goal_tracking_foundation", "goal registry mode is invalid");
  assert(Array.isArray(registry.goals), "goal registry goals must be an array");

  const categories = new Set(registry.categories || []);
  const statuses = new Set(registry.allowedStatuses || []);
  const priorities = new Set(registry.allowedPriorities || []);
  const riskLevels = new Set(registry.allowedRiskLevels || []);
  const goalIds = new Set();

  for (const category of requiredCategories) {
    if (!categories.has(category)) {
      failures.push(`missing required category: ${category}`);
    }
    if (!registry.goals?.some((goal) => goal.category === category)) {
      failures.push(`missing goal for category: ${category}`);
    }
  }

  for (const goal of registry.goals || []) {
    const label = goal.id || "(missing goal id)";
    for (const field of [
      "id",
      "title",
      "description",
      "category",
      "priority",
      "status",
      "owner_role",
      "target_phase",
      "related_docs",
      "related_files",
      "dependencies",
      "blockers",
      "risks",
      "evidence_links",
      "validation_method",
      "next_action"
    ]) {
      if (!(field in goal)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }
    if (!/^SEIS-GOAL-\d{3}$/.test(goal.id || "")) {
      failures.push(`${label} id must match SEIS-GOAL-000`);
    }
    if (goalIds.has(goal.id)) {
      failures.push(`duplicate goal id: ${goal.id}`);
    }
    goalIds.add(goal.id);
    if (!categories.has(goal.category)) {
      failures.push(`${label} category is not allowed: ${goal.category}`);
    }
    if (!statuses.has(goal.status)) {
      failures.push(`${label} status is not allowed: ${goal.status}`);
    }
    if (!priorities.has(goal.priority)) {
      failures.push(`${label} priority is not allowed: ${goal.priority}`);
    }
    if (!riskLevels.has(goal.risk_level)) {
      failures.push(`${label} risk_level is not allowed: ${goal.risk_level}`);
    }
    for (const field of ["related_docs", "related_files", "dependencies", "blockers", "risks", "evidence_links"]) {
      if (!Array.isArray(goal[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }
    for (const path of [...(goal.related_docs || []), ...(goal.related_files || [])]) {
      validatePath(label, path);
    }
    if (goal.status === "active" && (goal.evidence_links || []).includes("evidence unavailable")) {
      failures.push(`${label} is active with unavailable evidence`);
    }
    if (["completed", "validated"].includes(goal.status)) {
      failures.push(`${label} must not be marked ${goal.status} in this foundation pass`);
    }
  }
}

if (evidence && registry) {
  assert(evidence.schemaVersion === 1, "goal evidence schemaVersion must be 1");
  assert(evidence.mode === "non_llm_goal_evidence_foundation", "goal evidence mode is invalid");
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const evidenceIds = new Set();
  for (const record of evidence.records || []) {
    const label = record.id || "(missing evidence id)";
    if (!/^SEIS-EVID-\d{3}$/.test(record.id || "")) {
      failures.push(`${label} id must match SEIS-EVID-000`);
    }
    if (evidenceIds.has(record.id)) {
      failures.push(`duplicate evidence id: ${record.id}`);
    }
    evidenceIds.add(record.id);
    for (const goalId of record.supports_goal_ids || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }
    for (const path of record.related_paths || []) {
      validatePath(label, path, { allowMissing: record.status === "blocked" });
    }
  }
}

if (execution && registry && evidence) {
  assert(execution.schemaVersion === 1, "goal execution schemaVersion must be 1");
  assert(execution.mode === "non_llm_goal_execution_foundation", "goal execution mode is invalid");
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const evidenceIds = new Set(evidence.records.map((record) => record.id));
  for (const task of execution.tasks || []) {
    const label = task.id || "(missing task id)";
    if (!/^SEIS-TASK-\d{3}$/.test(task.id || "")) {
      failures.push(`${label} id must match SEIS-TASK-000`);
    }
    for (const goalId of task.supports_goal_ids || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }
    for (const evidenceId of task.evidence_ids || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
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
console.log(JSON.stringify({
  ok: true,
  goals: registry.goals.length,
  categories: registry.categories.length,
  byStatus,
  evidenceRecords: evidence.records.length,
  tasks: execution.tasks.length,
  blockers: execution.blockers.length,
  decisions: execution.decisions.length
}, null, 2));

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function validatePath(label, path, options = {}) {
  if (path === "evidence unavailable" || path === "none") {
    return;
  }
  if (typeof path !== "string" || path.length === 0) {
    failures.push(`${label} has empty path`);
    return;
  }
  if (path.startsWith("/") || path.includes("://") || path.includes("..\\")) {
    failures.push(`${label} must use repo-relative paths only: ${path}`);
    return;
  }
  if (!options.allowMissing && !existsSync(path)) {
    failures.push(`${label} points to missing path: ${path}`);
  }
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
    return counts;
  }, {});
}
