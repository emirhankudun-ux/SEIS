import { existsSync, readFileSync } from "node:fs";

const requiredDocs = [
  "docs/goals/seis-vision.md",
  "docs/goals/long-term-goals.md",
  "docs/goals/goal-tracking-system.md",
  "docs/goals/goal-schema.md",
  "docs/goals/milestone-map.md",
  "docs/goals/horizon-map.md",
  "docs/goals/project-epic-task-map.md",
  "docs/goals/progress-review.md",
  "docs/goals/review-cadence.md",
  "docs/goals/progress-ledger.md",
  "docs/goals/evidence-ledger.md",
  "docs/goals/execution-board.md",
  "docs/goals/command-center-view-model.md",
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
const reviewCadencePath = "content/development/seis-goal-review-cadence.json";
const progressLedgerPath = "content/development/seis-goal-progress-ledger.json";
const hierarchyPath = "content/development/seis-goal-hierarchy.json";
const viewPath = "content/development/seis-goal-command-center-view.json";
const staticPagePath = "apps/web/goal-tracking.html";
const failures = [];

for (const file of requiredDocs) {
  if (!existsSync(file)) {
    failures.push(`missing required goal doc: ${file}`);
  }
}

for (const file of [registryPath, evidencePath, executionPath, reviewCadencePath, progressLedgerPath, hierarchyPath, viewPath, staticPagePath]) {
  if (!existsSync(file)) {
    failures.push(`missing required goal source: ${file}`);
  }
}

const registry = existsSync(registryPath) ? readJson(registryPath) : null;
const evidence = existsSync(evidencePath) ? readJson(evidencePath) : null;
const execution = existsSync(executionPath) ? readJson(executionPath) : null;
const reviewCadence = existsSync(reviewCadencePath) ? readJson(reviewCadencePath) : null;
const progressLedger = existsSync(progressLedgerPath) ? readJson(progressLedgerPath) : null;
const hierarchy = existsSync(hierarchyPath) ? readJson(hierarchyPath) : null;
const commandCenterView = existsSync(viewPath) ? readJson(viewPath) : null;

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

if (reviewCadence && registry && evidence && execution) {
  assert(reviewCadence.schemaVersion === 1, "goal review cadence schemaVersion must be 1");
  assert(reviewCadence.mode === "non_llm_goal_review_cadence", "goal review cadence mode is invalid");
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const evidenceIds = new Set(evidence.records.map((record) => record.id));
  const taskIds = new Set(execution.tasks.map((task) => task.id));
  const allowedCadenceStatuses = new Set(["planned", "performed", "blocked", "deferred", "skipped"]);
  const allowedCadences = new Set(["daily", "weekly", "monthly"]);
  const recordIds = new Set();

  assert(Array.isArray(reviewCadence.records), "goal review cadence records must be an array");
  if ((reviewCadence.records || []).length < 3) {
    failures.push("goal review cadence must include daily, weekly, and monthly records");
  }

  for (const record of reviewCadence.records || []) {
    const label = record.id || "(missing review id)";
    if (!/^SEIS-REVIEW-\d{3}$/.test(record.id || "")) {
      failures.push(`${label} id must match SEIS-REVIEW-000`);
    }
    if (recordIds.has(record.id)) {
      failures.push(`duplicate review id: ${record.id}`);
    }
    recordIds.add(record.id);
    if (!allowedCadences.has(record.cadence)) {
      failures.push(`${label} cadence is not allowed: ${record.cadence}`);
    }
    if (!allowedCadenceStatuses.has(record.status)) {
      failures.push(`${label} status is not allowed: ${record.status}`);
    }
    for (const field of ["related_goal_ids", "related_task_ids", "evidence_ids", "checklist"]) {
      if (!Array.isArray(record[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }
    for (const goalId of record.related_goal_ids || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }
    for (const taskId of record.related_task_ids || []) {
      if (!taskIds.has(taskId)) {
        failures.push(`${label} references unknown task id: ${taskId}`);
      }
    }
    for (const evidenceId of record.evidence_ids || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }
    if (record.status === "performed") {
      failures.push(`${label} must not be marked performed without dated review evidence in this foundation pass`);
    }
  }
}

if (progressLedger && registry && evidence && execution) {
  assert(progressLedger.schemaVersion === 1, "goal progress ledger schemaVersion must be 1");
  assert(progressLedger.mode === "non_llm_goal_progress_ledger", "goal progress ledger mode is invalid");
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const evidenceIds = new Set(evidence.records.map((record) => record.id));
  const taskIds = new Set(execution.tasks.map((task) => task.id));
  const allowedFollowUpStatuses = new Set(["planned", "active", "blocked", "deferred", "completed"]);

  for (const field of ["completedItems", "deferredItems", "followUpActions"]) {
    if (!Array.isArray(progressLedger[field])) {
      failures.push(`goal progress ledger ${field} must be an array`);
    }
  }

  validateLedgerItems(progressLedger.completedItems || [], {
    idPattern: /^SEIS-COMPLETE-\d{3}$/,
    idLabel: "SEIS-COMPLETE-000",
    expectedStatus: "completed",
    goalIds,
    evidenceIds,
    taskIds,
    requireEvidence: true
  });
  validateLedgerItems(progressLedger.deferredItems || [], {
    idPattern: /^SEIS-DEFER-\d{3}$/,
    idLabel: "SEIS-DEFER-000",
    expectedStatus: "deferred",
    goalIds,
    evidenceIds,
    taskIds
  });
  validateLedgerItems(progressLedger.followUpActions || [], {
    idPattern: /^SEIS-FOLLOWUP-\d{3}$/,
    idLabel: "SEIS-FOLLOWUP-000",
    allowedStatuses: allowedFollowUpStatuses,
    goalIds,
    evidenceIds,
    taskIds
  });
}

if (hierarchy && registry && evidence && execution) {
  assert(hierarchy.schemaVersion === 1, "goal hierarchy schemaVersion must be 1");
  assert(hierarchy.mode === "non_llm_goal_hierarchy_foundation", "goal hierarchy mode is invalid");
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const evidenceIds = new Set(evidence.records.map((record) => record.id));
  const taskIds = new Set(execution.tasks.map((task) => task.id));
  const allowedHierarchyStatuses = new Set(["planned", "active", "blocked", "deferred", "completed"]);
  const allowedHorizonLevels = new Set(["yearly", "quarterly", "monthly", "weekly"]);

  for (const field of ["horizons", "activeProjects", "epics", "subtasks"]) {
    if (!Array.isArray(hierarchy[field])) {
      failures.push(`goal hierarchy ${field} must be an array`);
    }
  }

  const projectIds = new Set();
  const epicIds = new Set();

  for (const horizon of hierarchy.horizons || []) {
    const label = horizon.id || "(missing horizon id)";
    if (!/^SEIS-HORIZON-\d{3}$/.test(horizon.id || "")) {
      failures.push(`${label} id must match SEIS-HORIZON-000`);
    }
    if (!allowedHorizonLevels.has(horizon.level)) {
      failures.push(`${label} level is not allowed: ${horizon.level}`);
    }
    validateHierarchyCommon(horizon, label, { allowedHierarchyStatuses, goalIds, evidenceIds });
  }

  const levels = new Set((hierarchy.horizons || []).map((horizon) => horizon.level));
  for (const requiredLevel of allowedHorizonLevels) {
    if (!levels.has(requiredLevel)) {
      failures.push(`goal hierarchy missing ${requiredLevel} horizon`);
    }
  }

  for (const project of hierarchy.activeProjects || []) {
    const label = project.id || "(missing project id)";
    if (!/^SEIS-PROJECT-\d{3}$/.test(project.id || "")) {
      failures.push(`${label} id must match SEIS-PROJECT-000`);
    }
    if (projectIds.has(project.id)) {
      failures.push(`duplicate project id: ${project.id}`);
    }
    projectIds.add(project.id);
    validateHierarchyCommon(project, label, { allowedHierarchyStatuses, goalIds, evidenceIds });
    if (!Array.isArray(project.milestone_ids) || project.milestone_ids.length === 0) {
      failures.push(`${label} milestone_ids must be a non-empty array`);
    }
    for (const milestoneId of project.milestone_ids || []) {
      if (!/^SEIS-MS-\d{3}$/.test(milestoneId)) {
        failures.push(`${label} references invalid milestone id: ${milestoneId}`);
      }
    }
  }

  for (const epic of hierarchy.epics || []) {
    const label = epic.id || "(missing epic id)";
    if (!/^SEIS-EPIC-\d{3}$/.test(epic.id || "")) {
      failures.push(`${label} id must match SEIS-EPIC-000`);
    }
    if (epicIds.has(epic.id)) {
      failures.push(`duplicate epic id: ${epic.id}`);
    }
    epicIds.add(epic.id);
    if (!projectIds.has(epic.project_id)) {
      failures.push(`${label} references unknown project id: ${epic.project_id}`);
    }
    validateHierarchyCommon(epic, label, { allowedHierarchyStatuses, goalIds, evidenceIds });
  }

  for (const subtask of hierarchy.subtasks || []) {
    const label = subtask.id || "(missing subtask id)";
    if (!/^SEIS-SUBTASK-\d{3}$/.test(subtask.id || "")) {
      failures.push(`${label} id must match SEIS-SUBTASK-000`);
    }
    if (!taskIds.has(subtask.task_id)) {
      failures.push(`${label} references unknown task id: ${subtask.task_id}`);
    }
    if (!epicIds.has(subtask.epic_id)) {
      failures.push(`${label} references unknown epic id: ${subtask.epic_id}`);
    }
    validateHierarchyCommon(subtask, label, { allowedHierarchyStatuses, goalIds, evidenceIds });
  }
}

if (commandCenterView && registry && evidence && execution && reviewCadence && progressLedger && hierarchy) {
  assert(commandCenterView.schemaVersion === 1, "command center view schemaVersion must be 1");
  assert(commandCenterView.mode === "non_llm_command_center_goal_view", "command center view mode is invalid");
  if (commandCenterView.summary?.totalGoals !== registry.goals.length) {
    failures.push("command center view totalGoals does not match goal registry");
  }
  if (commandCenterView.summary?.totalEvidenceRecords !== evidence.records.length) {
    failures.push("command center view totalEvidenceRecords does not match evidence ledger");
  }
  if (commandCenterView.summary?.totalTasks !== execution.tasks.length) {
    failures.push("command center view totalTasks does not match execution board");
  }
  if (commandCenterView.summary?.totalReviewRecords !== reviewCadence.records.length) {
    failures.push("command center view totalReviewRecords does not match review cadence");
  }
  if (commandCenterView.summary?.totalCompletedItems !== progressLedger.completedItems.length) {
    failures.push("command center view totalCompletedItems does not match progress ledger");
  }
  if (commandCenterView.summary?.totalDeferredItems !== progressLedger.deferredItems.length) {
    failures.push("command center view totalDeferredItems does not match progress ledger");
  }
  if (commandCenterView.summary?.totalFollowUpActions !== progressLedger.followUpActions.length) {
    failures.push("command center view totalFollowUpActions does not match progress ledger");
  }
  if (commandCenterView.summary?.totalHorizons !== hierarchy.horizons.length) {
    failures.push("command center view totalHorizons does not match hierarchy");
  }
  if (commandCenterView.summary?.totalActiveProjects !== hierarchy.activeProjects.length) {
    failures.push("command center view totalActiveProjects does not match hierarchy");
  }
  if (commandCenterView.summary?.totalEpics !== hierarchy.epics.length) {
    failures.push("command center view totalEpics does not match hierarchy");
  }
  if (commandCenterView.summary?.totalSubtasks !== hierarchy.subtasks.length) {
    failures.push("command center view totalSubtasks does not match hierarchy");
  }
  for (const source of [registryPath, evidencePath, executionPath, reviewCadencePath, progressLedgerPath, hierarchyPath]) {
    if (!commandCenterView.sourceRecords?.includes(source)) {
      failures.push(`command center view missing source: ${source}`);
    }
  }
  for (const panel of ["goalList", "milestoneTimeline", "nextActionQueue", "blockedItems", "evidence", "readinessConnections", "reviewCadence", "completedItems", "deferredItems", "followUpActions", "planningHorizons", "activeProjects", "epics", "subtasks"]) {
    if (!Array.isArray(commandCenterView.panels?.[panel]) || commandCenterView.panels[panel].length === 0) {
      failures.push(`command center view missing panel: ${panel}`);
    }
  }
}

if (existsSync(staticPagePath)) {
  const html = readFileSync(staticPagePath, "utf8");
  for (const text of ["Goal Tracking Center", "Milestone Timeline", "Next Safe Actions", "Blocked Items", "Review Cadence", "Completed Work", "Deferred Work", "Follow-Up Actions", "Planning Horizons", "Active Projects", "Epics", "Subtasks", "SEIS-GOAL-003", "SEIS-BLOCKER-001", "SEIS-MS-001", "SEIS-REVIEW-001", "SEIS-COMPLETE-001", "SEIS-DEFER-001", "SEIS-FOLLOWUP-001", "SEIS-HORIZON-001", "SEIS-PROJECT-001", "SEIS-EPIC-001", "SEIS-SUBTASK-001"]) {
    if (!html.includes(text)) {
      failures.push(`static Goal Tracking page missing: ${text}`);
    }
  }
  if (/%\s*complete|role="progressbar"|aria-valuenow/i.test(html)) {
    failures.push("static Goal Tracking page must not render fake progress indicators");
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
  decisions: execution.decisions.length,
  reviewRecords: reviewCadence.records.length,
  completedItems: progressLedger.completedItems.length,
  deferredItems: progressLedger.deferredItems.length,
  followUpActions: progressLedger.followUpActions.length,
  horizons: hierarchy.horizons.length,
  activeProjects: hierarchy.activeProjects.length,
  epics: hierarchy.epics.length,
  subtasks: hierarchy.subtasks.length,
  commandCenterView: commandCenterView.id,
  staticPage: staticPagePath
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

function validateLedgerItems(items, options) {
  const itemIds = new Set();
  for (const item of items) {
    const label = item.id || "(missing ledger item id)";
    if (!options.idPattern.test(item.id || "")) {
      failures.push(`${label} id must match ${options.idLabel}`);
    }
    if (itemIds.has(item.id)) {
      failures.push(`duplicate ledger item id: ${item.id}`);
    }
    itemIds.add(item.id);
    if (options.expectedStatus && item.status !== options.expectedStatus) {
      failures.push(`${label} status must be ${options.expectedStatus}`);
    }
    if (options.allowedStatuses && !options.allowedStatuses.has(item.status)) {
      failures.push(`${label} status is not allowed: ${item.status}`);
    }
    const goalRefs = item.supports_goal_ids || [];
    if (!Array.isArray(goalRefs)) {
      failures.push(`${label} supports_goal_ids must be an array`);
    }
    for (const goalId of goalRefs) {
      if (!options.goalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }
    for (const taskId of item.related_task_ids || []) {
      if (!options.taskIds.has(taskId)) {
        failures.push(`${label} references unknown task id: ${taskId}`);
      }
    }
    const evidenceRefs = item.evidence_ids || [];
    if (options.requireEvidence && evidenceRefs.length === 0) {
      failures.push(`${label} must include evidence_ids`);
    }
    for (const evidenceId of evidenceRefs) {
      if (!options.evidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }
    for (const path of item.related_paths || []) {
      validatePath(label, path);
    }
  }
}

function validateHierarchyCommon(item, label, options) {
  if (!options.allowedHierarchyStatuses.has(item.status)) {
    failures.push(`${label} status is not allowed: ${item.status}`);
  }
  if (!Array.isArray(item.supports_goal_ids) || item.supports_goal_ids.length === 0) {
    failures.push(`${label} supports_goal_ids must be a non-empty array`);
  }
  for (const goalId of item.supports_goal_ids || []) {
    if (!options.goalIds.has(goalId)) {
      failures.push(`${label} references unknown goal id: ${goalId}`);
    }
  }
  if (!Array.isArray(item.evidence_ids) || item.evidence_ids.length === 0) {
    failures.push(`${label} evidence_ids must be a non-empty array`);
  }
  for (const evidenceId of item.evidence_ids || []) {
    if (!options.evidenceIds.has(evidenceId)) {
      failures.push(`${label} references unknown evidence id: ${evidenceId}`);
    }
  }
  for (const path of item.related_paths || []) {
    validatePath(label, path);
  }
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
    return counts;
  }, {});
}
