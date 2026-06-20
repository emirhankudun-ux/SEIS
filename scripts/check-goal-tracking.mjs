import { existsSync, readFileSync } from "node:fs";

const registryPath = "content/development/seis-goal-tracking.json";
const evidencePath = "content/development/seis-goal-evidence.json";
const executionPath = "content/development/seis-goal-execution.json";
const reviewCadencePath = "content/development/seis-goal-review-cadence.json";
const reviewLogPath = "content/development/seis-goal-review-log.json";
const planningHorizonsPath = "content/development/seis-goal-planning-horizons.json";
const progressLedgerPath = "content/development/seis-goal-progress-ledger.json";
const objectiveCoveragePath = "content/development/seis-goal-objective-coverage.json";
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
  "docs/reviews/GOAL_TRACKING_DAILY_REVIEW_2026-06-20.md",
  "docs/goals/planning-horizons.md",
  "docs/goals/progress-ledger.md",
  "docs/goals/command-center-view-model.md",
  "docs/goals/daily-review-template.md",
  "docs/goals/weekly-priorities-template.md",
  "docs/goals/monthly-review-template.md",
  "docs/roadmap/MASTER_BACKLOG.md",
  "docs/roadmap/NEXT_PR_QUEUE.md",
  "docs/product/goal-tracking-center.md",
  "docs/product/command-center-goals-view.md",
  "docs/reviews/GOAL_TRACKING_REVIEW.md",
  "docs/reviews/GOAL_TRACKING_OBJECTIVE_AUDIT.md"
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

if (!existsSync(reviewLogPath)) {
  failures.push(`missing goal review log registry: ${reviewLogPath}`);
}

if (!existsSync(planningHorizonsPath)) {
  failures.push(`missing goal planning horizons registry: ${planningHorizonsPath}`);
}

if (!existsSync(progressLedgerPath)) {
  failures.push(`missing goal progress ledger: ${progressLedgerPath}`);
}

if (!existsSync(objectiveCoveragePath)) {
  failures.push(`missing goal objective coverage registry: ${objectiveCoveragePath}`);
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

const reviewLogRegistry = existsSync(reviewLogPath)
  ? JSON.parse(readFileSync(reviewLogPath, "utf8"))
  : null;

const planningHorizonsRegistry = existsSync(planningHorizonsPath)
  ? JSON.parse(readFileSync(planningHorizonsPath, "utf8"))
  : null;

const progressLedger = existsSync(progressLedgerPath)
  ? JSON.parse(readFileSync(progressLedgerPath, "utf8"))
  : null;

const objectiveCoverage = existsSync(objectiveCoveragePath)
  ? JSON.parse(readFileSync(objectiveCoveragePath, "utf8"))
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

if (reviewLogRegistry) {
  validateReviewLog(reviewLogRegistry);
}

if (planningHorizonsRegistry) {
  validatePlanningHorizons(planningHorizonsRegistry);
}

if (progressLedger) {
  validateProgressLedger(progressLedger);
}

if (objectiveCoverage) {
  validateObjectiveCoverage(objectiveCoverage);
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
  reviewLogRecords: reviewLogRegistry.records.length,
  planningHorizons: planningHorizonsRegistry.horizons.length,
  activeProjects: planningHorizonsRegistry.activeProjects.length,
  completedItems: progressLedger.completedItems.length,
  deferredItems: progressLedger.deferredItems.length,
  followUpActions: progressLedger.followUpActions.length,
  objectiveCoverageRecords: objectiveCoverage.records.length,
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

function validateReviewLog(logRegistry) {
  if (logRegistry.schemaVersion !== 1) {
    failures.push("goal review log registry schemaVersion must be 1");
  }

  if (logRegistry.mode !== "non_llm_goal_review_log") {
    failures.push("goal review log registry mode must be non_llm_goal_review_log");
  }

  const allowedCadences = new Set(logRegistry.allowedCadences || []);
  const allowedStatuses = new Set(logRegistry.allowedStatuses || []);
  const cadenceRecordIds = new Set((reviewCadenceRegistry?.records || []).map((record) => record.id));
  const records = logRegistry.records || [];
  const ids = new Set();

  if (!Array.isArray(records) || records.length === 0) {
    failures.push("goal review log registry must include performed review records");
  }

  for (const record of records) {
    const label = record.id || "(missing review log id)";
    for (const field of [
      "id",
      "title",
      "cadence",
      "status",
      "review_date",
      "owner_role",
      "related_review_id",
      "related_goal_ids",
      "related_task_ids",
      "evidence_ids",
      "related_paths",
      "what_changed",
      "active_blockers",
      "validation_performed",
      "validation_needed",
      "limitations",
      "next_safe_action"
    ]) {
      if (!(field in record)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }

    if (ids.has(record.id)) {
      failures.push(`duplicate review log id: ${record.id}`);
    }
    ids.add(record.id);

    if (!/^SEIS-REVIEW-LOG-\d{3}$/.test(record.id || "")) {
      failures.push(`${label} id must match SEIS-REVIEW-LOG-000 format`);
    }

    if (!allowedCadences.has(record.cadence)) {
      failures.push(`${label} has invalid cadence: ${record.cadence}`);
    }

    if (!allowedStatuses.has(record.status)) {
      failures.push(`${label} has invalid status: ${record.status}`);
    }

    if (!cadenceRecordIds.has(record.related_review_id)) {
      failures.push(`${label} references unknown cadence record: ${record.related_review_id}`);
    }

    for (const field of [
      "related_goal_ids",
      "related_task_ids",
      "evidence_ids",
      "related_paths",
      "what_changed",
      "active_blockers",
      "validation_performed",
      "validation_needed",
      "limitations"
    ]) {
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
      review_date: record.review_date,
      owner_role: record.owner_role,
      next_safe_action: record.next_safe_action
    })) {
      validateSafeText(label, field, value);
    }

    for (const item of [
      ...(record.what_changed || []),
      ...(record.active_blockers || []),
      ...(record.validation_performed || []),
      ...(record.validation_needed || []),
      ...(record.limitations || [])
    ]) {
      validateSafeText(label, "review log item", item);
    }

    if (record.status === "performed" && !record.evidence_ids?.length) {
      failures.push(`${label} cannot be performed without evidence_ids`);
    }
  }
}

function validatePlanningHorizons(horizonRegistry) {
  if (horizonRegistry.schemaVersion !== 1) {
    failures.push("goal planning horizons registry schemaVersion must be 1");
  }

  if (horizonRegistry.mode !== "non_llm_goal_planning_horizons") {
    failures.push("goal planning horizons registry mode must be non_llm_goal_planning_horizons");
  }

  const allowedHorizons = new Set(horizonRegistry.allowedHorizons || []);
  const allowedStatuses = new Set(horizonRegistry.allowedStatuses || []);
  const horizons = horizonRegistry.horizons || [];
  const projects = horizonRegistry.activeProjects || [];
  const horizonIds = new Set(horizons.map((horizon) => horizon.id));
  const ids = new Set();

  if (!Array.isArray(horizons) || horizons.length < 4) {
    failures.push("goal planning horizons registry must include yearly, quarterly, monthly, and weekly horizons");
  }

  for (const horizon of ["yearly", "quarterly", "monthly", "weekly"]) {
    if (!horizons.some((record) => record.horizon === horizon)) {
      failures.push(`goal planning horizons registry missing horizon: ${horizon}`);
    }
  }

  for (const record of horizons) {
    validatePlanningRecord(record, {
      idPattern: /^SEIS-HORIZON-\d{3}$/,
      idDescription: "SEIS-HORIZON-000",
      ids,
      allowedStatuses,
      allowedHorizons
    });
  }

  if (!Array.isArray(projects) || projects.length === 0) {
    failures.push("goal planning horizons registry must include activeProjects");
  }

  const projectIds = new Set();
  for (const project of projects) {
    validatePlanningRecord(project, {
      idPattern: /^SEIS-PROJECT-\d{3}$/,
      idDescription: "SEIS-PROJECT-000",
      ids: projectIds,
      allowedStatuses,
      allowedHorizons: null,
      horizonIds
    });
  }
}

function validatePlanningRecord(record, options) {
  const label = record.id || "(missing planning id)";
  const requiredFields = [
    "id",
    "title",
    "status",
    "priority",
    "owner_role",
    "related_goal_ids",
    "related_task_ids",
    "evidence_ids",
    "related_paths",
    "blockers",
    "next_action"
  ];

  if (options.allowedHorizons) {
    requiredFields.push("horizon", "timeframe", "focus", "success_signal");
  } else {
    requiredFields.push("related_horizon_ids");
  }

  for (const field of requiredFields) {
    if (!(field in record)) {
      failures.push(`${label} missing field: ${field}`);
    }
  }

  if (options.ids.has(record.id)) {
    failures.push(`duplicate planning id: ${record.id}`);
  }
  options.ids.add(record.id);

  if (!options.idPattern.test(record.id || "")) {
    failures.push(`${label} id must match ${options.idDescription} format`);
  }

  if (!options.allowedStatuses.has(record.status)) {
    failures.push(`${label} has invalid status: ${record.status}`);
  }

  if (!new Set(registry.allowedPriorities || []).has(record.priority)) {
    failures.push(`${label} has invalid priority: ${record.priority}`);
  }

  if (options.allowedHorizons && !options.allowedHorizons.has(record.horizon)) {
    failures.push(`${label} has invalid horizon: ${record.horizon}`);
  }

  for (const field of ["related_goal_ids", "related_task_ids", "evidence_ids", "related_paths", "blockers"]) {
    if (!Array.isArray(record[field])) {
      failures.push(`${label} ${field} must be an array`);
    }
  }

  if (record.related_horizon_ids && !Array.isArray(record.related_horizon_ids)) {
    failures.push(`${label} related_horizon_ids must be an array`);
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

  for (const horizonId of record.related_horizon_ids || []) {
    if (!options.horizonIds?.has(horizonId)) {
      failures.push(`${label} references unknown horizon id: ${horizonId}`);
    }
  }

  for (const relatedPath of record.related_paths || []) {
    validateRelativePath(label, relatedPath, "related_paths");
  }

  for (const [field, value] of Object.entries({
    title: record.title,
    owner_role: record.owner_role,
    next_action: record.next_action,
    focus: record.focus || "not applicable",
    success_signal: record.success_signal || "not applicable"
  })) {
    validateSafeText(label, field, value);
  }

  for (const blocker of record.blockers || []) {
    validateSafeText(label, "blockers", blocker);
  }

  if (record.status === "completed" && !record.evidence_ids?.length) {
    failures.push(`${label} cannot be completed without evidence_ids`);
  }
}

function validateProgressLedger(ledger) {
  if (ledger.schemaVersion !== 1) {
    failures.push("goal progress ledger schemaVersion must be 1");
  }

  if (ledger.mode !== "non_llm_goal_progress_ledger") {
    failures.push("goal progress ledger mode must be non_llm_goal_progress_ledger");
  }

  validateCompletedItems(ledger.completedItems || []);
  validateDeferredItems(ledger.deferredItems || []);
  validateFollowUpActions(ledger.followUpActions || []);
}

function validateObjectiveCoverage(coverage) {
  if (coverage.schemaVersion !== 1) {
    failures.push("goal objective coverage registry schemaVersion must be 1");
  }

  if (coverage.mode !== "non_llm_goal_objective_coverage") {
    failures.push("goal objective coverage registry mode must be non_llm_goal_objective_coverage");
  }

  const allowedStatuses = new Set(coverage.allowedStatuses || []);
  const records = coverage.records || [];
  const ids = new Set();

  if (!Array.isArray(records) || records.length < 10) {
    failures.push("goal objective coverage registry must include objective coverage records");
  }

  for (const record of records) {
    const label = record.id || "(missing objective coverage id)";
    for (const field of [
      "id",
      "objective_section",
      "requirement",
      "status",
      "evidence_ids",
      "related_goal_ids",
      "related_paths",
      "proof",
      "limitations",
      "next_action"
    ]) {
      if (!(field in record)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }

    if (ids.has(record.id)) {
      failures.push(`duplicate objective coverage id: ${record.id}`);
    }
    ids.add(record.id);

    if (!/^SEIS-OBJ-\d{3}$/.test(record.id || "")) {
      failures.push(`${label} id must match SEIS-OBJ-000 format`);
    }

    if (!allowedStatuses.has(record.status)) {
      failures.push(`${label} has invalid status: ${record.status}`);
    }

    for (const field of ["evidence_ids", "related_goal_ids", "related_paths", "limitations"]) {
      if (!Array.isArray(record[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }

    for (const evidenceId of record.evidence_ids || []) {
      if (!knownEvidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }

    for (const goalId of record.related_goal_ids || []) {
      if (!knownGoalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }

    for (const relatedPath of record.related_paths || []) {
      validateRelativePath(label, relatedPath, "related_paths");
    }

    for (const [field, value] of Object.entries({
      objective_section: record.objective_section,
      requirement: record.requirement,
      proof: record.proof,
      next_action: record.next_action
    })) {
      validateSafeText(label, field, value);
    }

    for (const limitation of record.limitations || []) {
      validateSafeText(label, "limitations", limitation);
    }

    if (record.status === "passed" && !record.evidence_ids?.length) {
      failures.push(`${label} cannot be passed without evidence_ids`);
    }
  }
}

function validateCompletedItems(items) {
  const ids = new Set();
  if (!Array.isArray(items) || items.length === 0) {
    failures.push("goal progress ledger must include completedItems");
  }

  for (const item of items) {
    const label = item.id || "(missing completed id)";
    validateProgressFields(item, label, [
      "id",
      "title",
      "completed_at",
      "status",
      "supports_goal_ids",
      "evidence_ids",
      "related_paths",
      "summary",
      "limitations",
      "next_action"
    ]);

    if (ids.has(item.id)) {
      failures.push(`duplicate completed item id: ${item.id}`);
    }
    ids.add(item.id);

    if (!/^SEIS-COMPLETE-\d{3}$/.test(item.id || "")) {
      failures.push(`${label} id must match SEIS-COMPLETE-000 format`);
    }

    if (item.status !== "completed") {
      failures.push(`${label} status must be completed`);
    }

    if (!item.evidence_ids?.length) {
      failures.push(`${label} completed item requires evidence_ids`);
    }

    validateProgressRefs(item, label);
    validateSafeText(label, "summary", item.summary);
    validateSafeText(label, "next_action", item.next_action);
    for (const limitation of item.limitations || []) {
      validateSafeText(label, "limitations", limitation);
    }
  }
}

function validateDeferredItems(items) {
  const ids = new Set();
  if (!Array.isArray(items) || items.length === 0) {
    failures.push("goal progress ledger must include deferredItems");
  }

  for (const item of items) {
    const label = item.id || "(missing deferred id)";
    validateProgressFields(item, label, [
      "id",
      "title",
      "status",
      "reason",
      "supports_goal_ids",
      "related_paths",
      "approval_required",
      "next_action"
    ]);

    if (ids.has(item.id)) {
      failures.push(`duplicate deferred item id: ${item.id}`);
    }
    ids.add(item.id);

    if (!/^SEIS-DEFER-\d{3}$/.test(item.id || "")) {
      failures.push(`${label} id must match SEIS-DEFER-000 format`);
    }

    if (item.status !== "deferred") {
      failures.push(`${label} status must be deferred`);
    }

    validateProgressRefs(item, label, { evidenceOptional: true, tasksOptional: true });
    validateSafeText(label, "reason", item.reason);
    validateSafeText(label, "approval_required", item.approval_required);
    validateSafeText(label, "next_action", item.next_action);
  }
}

function validateFollowUpActions(items) {
  const ids = new Set();
  const allowedStatuses = new Set(["planned", "active", "blocked", "deferred", "completed"]);
  if (!Array.isArray(items) || items.length === 0) {
    failures.push("goal progress ledger must include followUpActions");
  }

  for (const item of items) {
    const label = item.id || "(missing follow-up id)";
    validateProgressFields(item, label, [
      "id",
      "title",
      "status",
      "priority",
      "supports_goal_ids",
      "related_task_ids",
      "evidence_ids",
      "related_paths",
      "next_action"
    ]);

    if (ids.has(item.id)) {
      failures.push(`duplicate follow-up id: ${item.id}`);
    }
    ids.add(item.id);

    if (!/^SEIS-FOLLOWUP-\d{3}$/.test(item.id || "")) {
      failures.push(`${label} id must match SEIS-FOLLOWUP-000 format`);
    }

    if (!allowedStatuses.has(item.status)) {
      failures.push(`${label} has invalid status: ${item.status}`);
    }

    if (!new Set(registry.allowedPriorities || []).has(item.priority)) {
      failures.push(`${label} has invalid priority: ${item.priority}`);
    }

    validateProgressRefs(item, label);
    validateSafeText(label, "next_action", item.next_action);
  }
}

function validateProgressFields(item, label, fields) {
  for (const field of fields) {
    if (!(field in item)) {
      failures.push(`${label} missing field: ${field}`);
    }
  }
}

function validateProgressRefs(item, label, options = {}) {
  for (const field of ["supports_goal_ids", "related_paths"]) {
    if (!Array.isArray(item[field])) {
      failures.push(`${label} ${field} must be an array`);
    }
  }

  for (const field of ["evidence_ids", "related_task_ids", "limitations"]) {
    if (field in item && !Array.isArray(item[field])) {
      failures.push(`${label} ${field} must be an array`);
    }
  }

  for (const goalId of item.supports_goal_ids || []) {
    if (!knownGoalIds.has(goalId)) {
      failures.push(`${label} references unknown goal id: ${goalId}`);
    }
  }

  if (!options.tasksOptional) {
    for (const taskId of item.related_task_ids || []) {
      if (!knownTaskIds.has(taskId)) {
        failures.push(`${label} references unknown task id: ${taskId}`);
      }
    }
  }

  if (!options.evidenceOptional) {
    for (const evidenceId of item.evidence_ids || []) {
      if (!knownEvidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }
  }

  for (const relatedPath of item.related_paths || []) {
    validateRelativePath(label, relatedPath, "related_paths");
  }
}

function validateCommandCenterView(view) {
  const label = view.id || "(missing command center view id)";
  if (!registry || !evidenceLedger || !executionRegistry || !reviewCadenceRegistry || !reviewLogRegistry || !planningHorizonsRegistry || !progressLedger || !objectiveCoverage) {
    failures.push(`${label} cannot be validated until source registries load`);
    return;
  }

  if (view.schemaVersion !== 1) {
    failures.push(`${label} schemaVersion must be 1`);
  }

  if (view.mode !== "non_llm_command_center_goal_view") {
    failures.push(`${label} mode must be non_llm_command_center_goal_view`);
  }

  for (const source of [registryPath, evidencePath, executionPath, reviewCadencePath, reviewLogPath, planningHorizonsPath, progressLedgerPath, objectiveCoveragePath]) {
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

  if (view.summary?.totalReviewLogRecords !== reviewLogRegistry.records.length) {
    failures.push(`${label} totalReviewLogRecords does not match review log registry`);
  }

  if (view.summary?.totalPlanningHorizons !== planningHorizonsRegistry.horizons.length) {
    failures.push(`${label} totalPlanningHorizons does not match planning horizons registry`);
  }

  if (view.summary?.totalActiveProjects !== planningHorizonsRegistry.activeProjects.length) {
    failures.push(`${label} totalActiveProjects does not match planning horizons registry`);
  }

  if (view.summary?.totalCompletedItems !== progressLedger.completedItems.length) {
    failures.push(`${label} totalCompletedItems does not match progress ledger`);
  }

  if (view.summary?.totalDeferredItems !== progressLedger.deferredItems.length) {
    failures.push(`${label} totalDeferredItems does not match progress ledger`);
  }

  if (view.summary?.totalFollowUpActions !== progressLedger.followUpActions.length) {
    failures.push(`${label} totalFollowUpActions does not match progress ledger`);
  }

  if (view.summary?.totalObjectiveCoverageRecords !== objectiveCoverage.records.length) {
    failures.push(`${label} totalObjectiveCoverageRecords does not match objective coverage registry`);
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

  if (!view.panels?.actualReviews?.length) {
    failures.push(`${label} must expose actual reviews`);
  }

  if (!view.panels?.planningHorizons?.length) {
    failures.push(`${label} must expose planning horizons`);
  }

  if (!view.panels?.activeProjects?.length) {
    failures.push(`${label} must expose active projects`);
  }

  if (!view.panels?.completedItems?.length) {
    failures.push(`${label} must expose completed items`);
  }

  if (!view.panels?.deferredItems?.length) {
    failures.push(`${label} must expose deferred items`);
  }

  if (!view.panels?.followUpActions?.length) {
    failures.push(`${label} must expose follow-up actions`);
  }

  if (!view.panels?.objectiveCoverage?.length) {
    failures.push(`${label} must expose objective coverage`);
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
    "Performed Reviews",
    "Planning Horizons",
    "Active Projects",
    "Completed Work",
    "Deferred Work",
    "Follow-Up Actions",
    "Objective Coverage",
    "Readiness Connections",
    "UX Guardrails",
    "SEIS-BLOCKER-001",
    "SEIS-TASK-001",
    "SEIS-REVIEW-001",
    "SEIS-REVIEW-LOG-001",
    "SEIS-HORIZON-001",
    "SEIS-PROJECT-001",
    "SEIS-COMPLETE-001",
    "SEIS-DEFER-001",
    "SEIS-FOLLOWUP-001",
    "SEIS-OBJ-001"
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
