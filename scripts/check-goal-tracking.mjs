import { existsSync, readFileSync } from "node:fs";

const registryPath = "content/development/seis-goal-tracking.json";
const evidencePath = "content/development/seis-goal-evidence.json";
const executionPath = "content/development/seis-goal-execution.json";
const reviewCadencePath = "content/development/seis-goal-review-cadence.json";
const commandCenterViewPath = "content/development/seis-goal-command-center-view.json";
const commandCenterStaticPath = "apps/command-center/goal-tracking/index.html";
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
  "docs/goals/execution-board.md",
  "docs/goals/review-cadence.md",
  "docs/goals/command-center-view-model.md",
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

if (!existsSync(executionPath)) {
  failures.push(`missing goal execution registry: ${executionPath}`);
}

if (!existsSync(reviewCadencePath)) {
  failures.push(`missing goal review cadence registry: ${reviewCadencePath}`);
}

if (!existsSync(commandCenterViewPath)) {
  failures.push(`missing Goal Command Center view: ${commandCenterViewPath}`);
}

if (!existsSync(commandCenterStaticPath)) {
  failures.push(`missing Goal Command Center static surface: ${commandCenterStaticPath}`);
}

const registry = existsSync(registryPath)
  ? JSON.parse(readFileSync(registryPath, "utf8"))
  : null;

const evidenceLedger = existsSync(evidencePath)
  ? JSON.parse(readFileSync(evidencePath, "utf8"))
  : null;

const executionRegistry = existsSync(executionPath)
  ? JSON.parse(readFileSync(executionPath, "utf8"))
  : null;

const reviewCadenceRegistry = existsSync(reviewCadencePath)
  ? JSON.parse(readFileSync(reviewCadencePath, "utf8"))
  : null;

const commandCenterView = existsSync(commandCenterViewPath)
  ? JSON.parse(readFileSync(commandCenterViewPath, "utf8"))
  : null;

let knownGoalIds = new Set();
let knownEvidenceIds = new Set();
let knownTaskIds = new Set();

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
  knownEvidenceIds = new Set(records.map((record) => record.id));

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

if (executionRegistry) {
  if (executionRegistry.schemaVersion !== 1) {
    failures.push("goal execution registry schemaVersion must be 1");
  }

  if (executionRegistry.mode !== "non_llm_goal_execution_foundation") {
    failures.push("goal execution registry mode must be non_llm_goal_execution_foundation");
  }

  const allowedTaskStatuses = new Set(executionRegistry.allowedTaskStatuses || []);
  const allowedDecisionStatuses = new Set(executionRegistry.allowedDecisionStatuses || []);
  const allowedBlockerStatuses = new Set(executionRegistry.allowedBlockerStatuses || []);
  const tasks = executionRegistry.tasks || [];
  const blockers = executionRegistry.blockers || [];
  const decisions = executionRegistry.decisions || [];
  const blockerIds = new Set(blockers.map((blocker) => blocker.id));
  const decisionIds = new Set(decisions.map((decision) => decision.id));
  knownTaskIds = new Set(tasks.map((task) => task.id));

  if (!Array.isArray(tasks) || tasks.length === 0) {
    failures.push("goal execution registry must contain tasks");
  }

  if (!Array.isArray(blockers) || blockers.length === 0) {
    failures.push("goal execution registry must contain blockers");
  }

  if (!Array.isArray(decisions) || decisions.length === 0) {
    failures.push("goal execution registry must contain decisions");
  }

  validateExecutionTasks(tasks, allowedTaskStatuses, blockerIds, decisionIds);
  validateExecutionBlockers(blockers, allowedBlockerStatuses);
  validateExecutionDecisions(decisions, allowedDecisionStatuses);
}

if (reviewCadenceRegistry) {
  validateReviewCadence(reviewCadenceRegistry);
}

if (commandCenterView) {
  validateCommandCenterView(commandCenterView);
}

if (existsSync(commandCenterStaticPath)) {
  validateCommandCenterStatic(readFileSync(commandCenterStaticPath, "utf8"));
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
  evidenceRecords: evidenceLedger.records.length,
  executionTasks: executionRegistry.tasks.length,
  executionBlockers: executionRegistry.blockers.length,
  executionDecisions: executionRegistry.decisions.length,
  reviewRecords: reviewCadenceRegistry.records.length,
  commandCenterView: commandCenterView.id,
  commandCenterStatic: commandCenterStaticPath
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

function validateExecutionTasks(tasks, allowedStatuses, blockerIds, decisionIds) {
  const taskIds = new Set();
  const subtaskIds = new Set();

  for (const task of tasks) {
    const label = task.id || "(missing task id)";
    for (const field of [
      "id",
      "title",
      "status",
      "priority",
      "owner_role",
      "supports_goal_ids",
      "related_milestone",
      "related_epic",
      "blocker_ids",
      "decision_ids",
      "evidence_ids",
      "related_paths",
      "subtasks",
      "next_action",
      "notes"
    ]) {
      if (!(field in task)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }

    if (taskIds.has(task.id)) {
      failures.push(`duplicate task id: ${task.id}`);
    }
    taskIds.add(task.id);

    if (!/^SEIS-TASK-\d{3}$/.test(task.id || "")) {
      failures.push(`${label} id must match SEIS-TASK-000 format`);
    }

    if (!allowedStatuses.has(task.status)) {
      failures.push(`${label} has invalid status: ${task.status}`);
    }

    if (!new Set(registry.allowedPriorities || []).has(task.priority)) {
      failures.push(`${label} has invalid priority: ${task.priority}`);
    }

    for (const field of ["supports_goal_ids", "blocker_ids", "decision_ids", "evidence_ids", "related_paths", "subtasks"]) {
      if (!Array.isArray(task[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }

    for (const goalId of task.supports_goal_ids || []) {
      if (!knownGoalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }

    for (const blockerId of task.blocker_ids || []) {
      if (!blockerIds.has(blockerId)) {
        failures.push(`${label} references unknown blocker id: ${blockerId}`);
      }
    }

    for (const decisionId of task.decision_ids || []) {
      if (!decisionIds.has(decisionId)) {
        failures.push(`${label} references unknown decision id: ${decisionId}`);
      }
    }

    for (const evidenceId of task.evidence_ids || []) {
      if (!knownEvidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }

    for (const relatedPath of task.related_paths || []) {
      validateRelativePath(label, relatedPath, "related_paths");
    }

    for (const [field, value] of Object.entries({
      title: task.title,
      owner_role: task.owner_role,
      next_action: task.next_action,
      notes: task.notes
    })) {
      validateSafeText(label, field, value);
    }

    for (const subtask of task.subtasks || []) {
      const subtaskLabel = subtask.id || `${label} subtask`;
      for (const field of ["id", "title", "status", "next_action"]) {
        if (!(field in subtask)) {
          failures.push(`${subtaskLabel} missing field: ${field}`);
        }
      }

      if (subtaskIds.has(subtask.id)) {
        failures.push(`duplicate subtask id: ${subtask.id}`);
      }
      subtaskIds.add(subtask.id);

      if (!/^SEIS-SUBTASK-\d{3}$/.test(subtask.id || "")) {
        failures.push(`${subtaskLabel} id must match SEIS-SUBTASK-000 format`);
      }

      if (!allowedStatuses.has(subtask.status)) {
        failures.push(`${subtaskLabel} has invalid status: ${subtask.status}`);
      }

      validateSafeText(subtaskLabel, "title", subtask.title);
      validateSafeText(subtaskLabel, "next_action", subtask.next_action);
    }
  }
}

function validateExecutionBlockers(blockers, allowedStatuses) {
  const ids = new Set();
  const allowedSeverities = new Set(["critical", "high", "medium", "low", "unknown"]);

  for (const blocker of blockers) {
    const label = blocker.id || "(missing blocker id)";
    for (const field of [
      "id",
      "title",
      "status",
      "severity",
      "supports_goal_ids",
      "evidence_ids",
      "related_paths",
      "required_approval",
      "next_action"
    ]) {
      if (!(field in blocker)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }

    if (ids.has(blocker.id)) {
      failures.push(`duplicate blocker id: ${blocker.id}`);
    }
    ids.add(blocker.id);

    if (!/^SEIS-BLOCKER-\d{3}$/.test(blocker.id || "")) {
      failures.push(`${label} id must match SEIS-BLOCKER-000 format`);
    }

    if (!allowedStatuses.has(blocker.status)) {
      failures.push(`${label} has invalid status: ${blocker.status}`);
    }

    if (!allowedSeverities.has(blocker.severity)) {
      failures.push(`${label} has invalid severity: ${blocker.severity}`);
    }

    for (const field of ["supports_goal_ids", "evidence_ids", "related_paths"]) {
      if (!Array.isArray(blocker[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }

    for (const goalId of blocker.supports_goal_ids || []) {
      if (!knownGoalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }

    for (const evidenceId of blocker.evidence_ids || []) {
      if (!knownEvidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }

    for (const relatedPath of blocker.related_paths || []) {
      validateRelativePath(label, relatedPath, "related_paths");
    }

    for (const [field, value] of Object.entries({
      title: blocker.title,
      required_approval: blocker.required_approval,
      next_action: blocker.next_action
    })) {
      validateSafeText(label, field, value);
    }
  }
}

function validateExecutionDecisions(decisions, allowedStatuses) {
  const ids = new Set();

  for (const decision of decisions) {
    const label = decision.id || "(missing decision id)";
    for (const field of [
      "id",
      "title",
      "status",
      "date",
      "supports_goal_ids",
      "evidence_ids",
      "related_paths",
      "decision",
      "consequence"
    ]) {
      if (!(field in decision)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }

    if (ids.has(decision.id)) {
      failures.push(`duplicate decision id: ${decision.id}`);
    }
    ids.add(decision.id);

    if (!/^SEIS-DEC-\d{3}$/.test(decision.id || "")) {
      failures.push(`${label} id must match SEIS-DEC-000 format`);
    }

    if (!allowedStatuses.has(decision.status)) {
      failures.push(`${label} has invalid status: ${decision.status}`);
    }

    for (const field of ["supports_goal_ids", "evidence_ids", "related_paths"]) {
      if (!Array.isArray(decision[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }

    for (const goalId of decision.supports_goal_ids || []) {
      if (!knownGoalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }

    for (const evidenceId of decision.evidence_ids || []) {
      if (!knownEvidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }

    for (const relatedPath of decision.related_paths || []) {
      validateRelativePath(label, relatedPath, "related_paths");
    }

    for (const [field, value] of Object.entries({
      title: decision.title,
      decision: decision.decision,
      consequence: decision.consequence
    })) {
      validateSafeText(label, field, value);
    }
  }
}

function validateReviewCadence(cadenceRegistry) {
  if (cadenceRegistry.schemaVersion !== 1) {
    failures.push("goal review cadence registry schemaVersion must be 1");
  }

  if (cadenceRegistry.mode !== "non_llm_goal_review_cadence") {
    failures.push("goal review cadence registry mode must be non_llm_goal_review_cadence");
  }

  const allowedCadences = new Set(cadenceRegistry.allowedCadences || []);
  const allowedStatuses = new Set(cadenceRegistry.allowedStatuses || []);
  const records = cadenceRegistry.records || [];
  const ids = new Set();

  if (!Array.isArray(records) || records.length < 3) {
    failures.push("goal review cadence registry must include daily, weekly, and monthly records");
  }

  for (const cadence of ["daily", "weekly", "monthly"]) {
    if (!records.some((record) => record.cadence === cadence)) {
      failures.push(`goal review cadence registry missing cadence: ${cadence}`);
    }
  }

  for (const record of records) {
    const label = record.id || "(missing review id)";
    for (const field of [
      "id",
      "title",
      "cadence",
      "status",
      "owner_role",
      "related_goal_ids",
      "related_task_ids",
      "evidence_ids",
      "related_paths",
      "checklist",
      "required_evidence",
      "completion_rule",
      "next_action"
    ]) {
      if (!(field in record)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }

    if (ids.has(record.id)) {
      failures.push(`duplicate review id: ${record.id}`);
    }
    ids.add(record.id);

    if (!/^SEIS-REVIEW-\d{3}$/.test(record.id || "")) {
      failures.push(`${label} id must match SEIS-REVIEW-000 format`);
    }

    if (!allowedCadences.has(record.cadence)) {
      failures.push(`${label} has invalid cadence: ${record.cadence}`);
    }

    if (!allowedStatuses.has(record.status)) {
      failures.push(`${label} has invalid status: ${record.status}`);
    }

    for (const field of ["related_goal_ids", "related_task_ids", "evidence_ids", "related_paths", "checklist", "required_evidence"]) {
      if (!Array.isArray(record[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }

    for (const goalId of record.related_goal_ids || []) {
      if (!knownGoalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }

    for (const taskId of record.related_task_ids || []) {
      if (!knownTaskIds.has(taskId)) {
        failures.push(`${label} references unknown task id: ${taskId}`);
      }
    }

    for (const evidenceId of record.evidence_ids || []) {
      if (!knownEvidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }

    for (const relatedPath of record.related_paths || []) {
      validateRelativePath(label, relatedPath, "related_paths");
    }

    for (const [field, value] of Object.entries({
      title: record.title,
      owner_role: record.owner_role,
      completion_rule: record.completion_rule,
      next_action: record.next_action
    })) {
      validateSafeText(label, field, value);
    }

    for (const item of [...(record.checklist || []), ...(record.required_evidence || [])]) {
      validateSafeText(label, "review checklist/evidence", item);
    }

    if (record.status === "performed" && !record.evidence_ids?.length) {
      failures.push(`${label} cannot be marked performed without evidence_ids`);
    }
  }
}

function validateCommandCenterView(view) {
  const label = view.id || "(missing command center view id)";
  if (!registry || !evidenceLedger || !executionRegistry || !reviewCadenceRegistry) {
    failures.push(`${label} cannot be validated until source registries load`);
    return;
  }

  if (view.schemaVersion !== 1) {
    failures.push(`${label} schemaVersion must be 1`);
  }

  if (view.mode !== "non_llm_command_center_goal_view") {
    failures.push(`${label} mode must be non_llm_command_center_goal_view`);
  }

  for (const source of [registryPath, evidencePath, executionPath, reviewCadencePath]) {
    if (!view.sourceRecords?.includes(source)) {
      failures.push(`${label} missing source record: ${source}`);
    }
  }

  if (view.summary?.totalGoals !== registry.goals.length) {
    failures.push(`${label} totalGoals does not match goal registry`);
  }

  if (view.summary?.totalEvidenceRecords !== evidenceLedger.records.length) {
    failures.push(`${label} totalEvidenceRecords does not match evidence ledger`);
  }

  if (view.summary?.totalTasks !== executionRegistry.tasks.length) {
    failures.push(`${label} totalTasks does not match execution registry`);
  }

  if (view.summary?.totalReviewRecords !== reviewCadenceRegistry.records.length) {
    failures.push(`${label} totalReviewRecords does not match review cadence registry`);
  }

  if (!Array.isArray(view.progressCards) || view.progressCards.length < 6) {
    failures.push(`${label} must expose core progress cards`);
  }

  if (!view.panels?.blockedItems?.length) {
    failures.push(`${label} must expose blocked items`);
  }

  if (!view.panels?.nextActionQueue?.length) {
    failures.push(`${label} must expose next action queue`);
  }

  if (!view.panels?.reviewCadence?.length) {
    failures.push(`${label} must expose review cadence`);
  }

  if (!view.uxGuards?.some((guard) => guard.id === "completed-needs-evidence")) {
    failures.push(`${label} must expose completed-needs-evidence UX guard`);
  }
}

function validateCommandCenterStatic(html) {
  const requiredText = [
    "data-seis-goal-center",
    "Goal Tracking Center",
    "Next Action Queue",
    "Active Blockers",
    "Validation Status",
    "Review Cadence",
    "Readiness Connections",
    "UX Guardrails",
    "SEIS-BLOCKER-001",
    "SEIS-TASK-001",
    "SEIS-REVIEW-001"
  ];

  for (const text of requiredText) {
    if (!html.includes(text)) {
      failures.push(`static Goal Tracking Center missing: ${text}`);
    }
  }

  if (/%\s*complete|aria-valuenow|role="progressbar"/i.test(html)) {
    failures.push("static Goal Tracking Center must not render fake progress bars or percentages");
  }
}

function countBy(items, key) {
  const counts = {};
  for (const item of items) {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
  }
  return counts;
}
