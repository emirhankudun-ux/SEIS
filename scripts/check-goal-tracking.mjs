import { existsSync, readFileSync } from "node:fs";

const requiredDocs = [
  "docs/goals/seis-vision.md",
  "docs/goals/long-term-goals.md",
  "docs/goals/goal-tracking-system.md",
  "docs/goals/goal-schema.md",
  "docs/goals/milestone-map.md",
  "docs/goals/horizon-map.md",
  "docs/goals/project-epic-task-map.md",
  "docs/goals/archive-ledger.md",
  "docs/goals/cycle-plan.md",
  "docs/goals/risk-register.md",
  "docs/goals/validation-steps.md",
  "docs/goals/roadmap-links.md",
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
const archiveLedgerPath = "content/development/seis-goal-archive-ledger.json";
const cyclePlanPath = "content/development/seis-goal-cycle-plan.json";
const riskRegisterPath = "content/development/seis-goal-risk-register.json";
const validationStepsPath = "content/development/seis-goal-validation-steps.json";
const roadmapLinksPath = "content/development/seis-goal-roadmap-links.json";
const viewPath = "content/development/seis-goal-command-center-view.json";
const staticPagePath = "apps/web/goal-tracking.html";
const failures = [];

for (const file of requiredDocs) {
  if (!existsSync(file)) {
    failures.push(`missing required goal doc: ${file}`);
  }
}

for (const file of [registryPath, evidencePath, executionPath, reviewCadencePath, progressLedgerPath, hierarchyPath, archiveLedgerPath, cyclePlanPath, riskRegisterPath, validationStepsPath, roadmapLinksPath, viewPath, staticPagePath]) {
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
const archiveLedger = existsSync(archiveLedgerPath) ? readJson(archiveLedgerPath) : null;
const cyclePlan = existsSync(cyclePlanPath) ? readJson(cyclePlanPath) : null;
const riskRegister = existsSync(riskRegisterPath) ? readJson(riskRegisterPath) : null;
const validationSteps = existsSync(validationStepsPath) ? readJson(validationStepsPath) : null;
const roadmapLinks = existsSync(roadmapLinksPath) ? readJson(roadmapLinksPath) : null;
const commandCenterView = existsSync(viewPath) ? readJson(viewPath) : null;

if (registry) {
  assert(registry.schemaVersion === 1, "goal registry schemaVersion must be 1");
  assert(registry.mode === "non_llm_goal_tracking_foundation", "goal registry mode is invalid");
  assert(Array.isArray(registry.goals), "goal registry goals must be an array");

  const categories = new Set(registry.categories || []);
  const statuses = new Set(registry.allowedStatuses || []);
  const priorities = new Set(registry.allowedPriorities || []);
  const riskLevels = new Set(registry.allowedRiskLevels || []);
  const reviewCadences = new Set(["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]);
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
      "created_at",
      "target_phase",
      "related_milestone",
      "related_epic",
      "related_docs",
      "related_files",
      "dependencies",
      "blockers",
      "risks",
      "evidence_links",
      "validation_method",
      "next_action",
      "last_reviewed",
      "review_cadence",
      "notes"
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(goal.created_at || "")) {
      failures.push(`${label} created_at must use YYYY-MM-DD`);
    }
    if (!/^SEIS-MS-\d{3}$/.test(goal.related_milestone || "") && goal.related_milestone !== "milestone not assigned") {
      failures.push(`${label} related_milestone is invalid: ${goal.related_milestone}`);
    }
    if (!/^SEIS-EPIC-\d{3}$/.test(goal.related_epic || "") && goal.related_epic !== "epic not assigned") {
      failures.push(`${label} related_epic is invalid: ${goal.related_epic}`);
    }
    if (typeof goal.last_reviewed !== "string" || goal.last_reviewed.length === 0) {
      failures.push(`${label} last_reviewed must be a string placeholder or date`);
    }
    if (!reviewCadences.has(goal.review_cadence)) {
      failures.push(`${label} review_cadence is not allowed: ${goal.review_cadence}`);
    }
    for (const field of ["related_docs", "related_files", "dependencies", "blockers", "risks", "evidence_links", "notes"]) {
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

if (archiveLedger && registry && evidence) {
  assert(archiveLedger.schemaVersion === 1, "goal archive ledger schemaVersion must be 1");
  assert(archiveLedger.mode === "non_llm_goal_archive_ledger", "goal archive ledger mode is invalid");
  assert(Array.isArray(archiveLedger.archiveItems), "goal archive ledger archiveItems must be an array");
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const evidenceIds = new Set(evidence.records.map((record) => record.id));
  const allowedArchiveStatuses = new Set(["historical-reference", "review-candidate", "deferred-readiness", "blocked", "archived"]);
  const allowedArchiveClassifications = new Set(["archive_only", "repository_hygiene", "unsupported_claim", "historical_reference"]);
  const archiveIds = new Set();

  for (const item of archiveLedger.archiveItems || []) {
    const label = item.id || "(missing archive id)";
    if (!/^SEIS-ARCHIVE-\d{3}$/.test(item.id || "")) {
      failures.push(`${label} id must match SEIS-ARCHIVE-000`);
    }
    if (archiveIds.has(item.id)) {
      failures.push(`duplicate archive item id: ${item.id}`);
    }
    archiveIds.add(item.id);
    if (!allowedArchiveStatuses.has(item.status)) {
      failures.push(`${label} status is not allowed: ${item.status}`);
    }
    if (!allowedArchiveClassifications.has(item.classification)) {
      failures.push(`${label} classification is not allowed: ${item.classification}`);
    }
    for (const field of ["related_goal_ids", "evidence_ids", "related_paths"]) {
      if (!Array.isArray(item[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }
    for (const goalId of item.related_goal_ids || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }
    for (const evidenceId of item.evidence_ids || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }
    for (const path of item.related_paths || []) {
      validatePath(label, path);
    }
    for (const field of ["promotion_rule", "risk", "next_action"]) {
      if (typeof item[field] !== "string" || item[field].length === 0) {
        failures.push(`${label} ${field} must be a non-empty string`);
      }
    }
  }
}

if (cyclePlan && registry && evidence && hierarchy) {
  assert(cyclePlan.schemaVersion === 1, "goal cycle plan schemaVersion must be 1");
  assert(cyclePlan.mode === "non_llm_goal_cycle_plan", "goal cycle plan mode is invalid");
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const evidenceIds = new Set(evidence.records.map((record) => record.id));
  const horizonIds = new Set(hierarchy.horizons.map((horizon) => horizon.id));
  const priorities = new Set(registry.allowedPriorities || []);
  const allowedCycleStatuses = new Set(["planned", "active", "blocked", "deferred", "completed"]);

  const groups = [
    ["yearlyGoals", /^SEIS-YEAR-\d{3}$/, "SEIS-YEAR-000"],
    ["quarterlyGoals", /^SEIS-QUARTER-\d{3}$/, "SEIS-QUARTER-000"],
    ["monthlyGoals", /^SEIS-MONTH-\d{3}$/, "SEIS-MONTH-000"],
    ["weeklyPriorities", /^SEIS-WEEK-\d{3}$/, "SEIS-WEEK-000"]
  ];

  for (const [field, idPattern, idLabel] of groups) {
    if (!Array.isArray(cyclePlan[field]) || cyclePlan[field].length === 0) {
      failures.push(`goal cycle plan ${field} must be a non-empty array`);
      continue;
    }
    const ids = new Set();
    for (const item of cyclePlan[field]) {
      const label = item.id || `(missing ${field} id)`;
      if (!idPattern.test(item.id || "")) {
        failures.push(`${label} id must match ${idLabel}`);
      }
      if (ids.has(item.id)) {
        failures.push(`duplicate cycle item id: ${item.id}`);
      }
      ids.add(item.id);
      if (!allowedCycleStatuses.has(item.status)) {
        failures.push(`${label} status is not allowed: ${item.status}`);
      }
      if (!priorities.has(item.priority)) {
        failures.push(`${label} priority is not allowed: ${item.priority}`);
      }
      if (!horizonIds.has(item.horizon_id)) {
        failures.push(`${label} references unknown horizon id: ${item.horizon_id}`);
      }
      for (const arrayField of ["supports_goal_ids", "evidence_ids", "related_paths"]) {
        if (!Array.isArray(item[arrayField])) {
          failures.push(`${label} ${arrayField} must be an array`);
        }
      }
      for (const goalId of item.supports_goal_ids || []) {
        if (!goalIds.has(goalId)) {
          failures.push(`${label} references unknown goal id: ${goalId}`);
        }
      }
      for (const evidenceId of item.evidence_ids || []) {
        if (!evidenceIds.has(evidenceId)) {
          failures.push(`${label} references unknown evidence id: ${evidenceId}`);
        }
      }
      for (const path of item.related_paths || []) {
        validatePath(label, path);
      }
      if (typeof item.next_action !== "string" || item.next_action.length === 0) {
        failures.push(`${label} next_action must be a non-empty string`);
      }
    }
  }
}

if (riskRegister && registry && evidence) {
  assert(riskRegister.schemaVersion === 1, "goal risk register schemaVersion must be 1");
  assert(riskRegister.mode === "non_llm_goal_risk_register", "goal risk register mode is invalid");
  assert(Array.isArray(riskRegister.risks), "goal risk register risks must be an array");
  if ((riskRegister.risks || []).length === 0) {
    failures.push("goal risk register must include at least one risk");
  }
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const evidenceIds = new Set(evidence.records.map((record) => record.id));
  const riskLevels = new Set(registry.allowedRiskLevels || []);
  const allowedRiskStatuses = new Set(["active", "monitored", "mitigated", "accepted", "deferred"]);
  const riskIds = new Set();

  for (const risk of riskRegister.risks || []) {
    const label = risk.id || "(missing risk id)";
    if (!/^SEIS-RISK-\d{3}$/.test(risk.id || "")) {
      failures.push(`${label} id must match SEIS-RISK-000`);
    }
    if (riskIds.has(risk.id)) {
      failures.push(`duplicate risk id: ${risk.id}`);
    }
    riskIds.add(risk.id);
    if (!allowedRiskStatuses.has(risk.status)) {
      failures.push(`${label} status is not allowed: ${risk.status}`);
    }
    if (!riskLevels.has(risk.severity)) {
      failures.push(`${label} severity is not allowed: ${risk.severity}`);
    }
    for (const field of ["title", "category", "owner_role", "mitigation", "next_action"]) {
      if (typeof risk[field] !== "string" || risk[field].length === 0) {
        failures.push(`${label} ${field} must be a non-empty string`);
      }
    }
    for (const field of ["supports_goal_ids", "evidence_ids", "related_paths"]) {
      if (!Array.isArray(risk[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }
    for (const goalId of risk.supports_goal_ids || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }
    for (const evidenceId of risk.evidence_ids || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }
    for (const path of risk.related_paths || []) {
      validatePath(label, path);
    }
  }
}

if (validationSteps && registry && evidence) {
  assert(validationSteps.schemaVersion === 1, "goal validation steps schemaVersion must be 1");
  assert(validationSteps.mode === "non_llm_goal_validation_steps", "goal validation steps mode is invalid");
  assert(Array.isArray(validationSteps.steps), "goal validation steps must be an array");
  if ((validationSteps.steps || []).length === 0) {
    failures.push("goal validation steps must include at least one step");
  }
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const evidenceIds = new Set(evidence.records.map((record) => record.id));
  const priorities = new Set(registry.allowedPriorities || []);
  const allowedValidationStatuses = new Set(["planned", "active", "blocked", "passed", "failed", "skipped"]);
  const stepIds = new Set();

  for (const step of validationSteps.steps || []) {
    const label = step.id || "(missing validation step id)";
    if (!/^SEIS-VAL-\d{3}$/.test(step.id || "")) {
      failures.push(`${label} id must match SEIS-VAL-000`);
    }
    if (stepIds.has(step.id)) {
      failures.push(`duplicate validation step id: ${step.id}`);
    }
    stepIds.add(step.id);
    if (!allowedValidationStatuses.has(step.status)) {
      failures.push(`${label} status is not allowed: ${step.status}`);
    }
    if (!priorities.has(step.priority)) {
      failures.push(`${label} priority is not allowed: ${step.priority}`);
    }
    for (const field of ["title", "command", "owner_role", "success_condition", "next_action"]) {
      if (typeof step[field] !== "string" || step[field].length === 0) {
        failures.push(`${label} ${field} must be a non-empty string`);
      }
    }
    for (const field of ["supports_goal_ids", "evidence_ids", "related_paths"]) {
      if (!Array.isArray(step[field])) {
        failures.push(`${label} ${field} must be an array`);
      }
    }
    for (const goalId of step.supports_goal_ids || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${label} references unknown goal id: ${goalId}`);
      }
    }
    for (const evidenceId of step.evidence_ids || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${label} references unknown evidence id: ${evidenceId}`);
      }
    }
    for (const path of step.related_paths || []) {
      validatePath(label, path);
    }
  }
}

if (roadmapLinks && registry) {
  assert(roadmapLinks.schemaVersion === 1, "goal roadmap links schemaVersion must be 1");
  assert(roadmapLinks.mode === "non_llm_goal_roadmap_links", "goal roadmap links mode is invalid");
  assert(Array.isArray(roadmapLinks.links), "goal roadmap links must be an array");
  const goalIds = new Set(registry.goals.map((goal) => goal.id));
  const statuses = new Set(registry.allowedStatuses || []);
  const linkGoalIds = new Set();
  const linkIds = new Set();

  for (const link of roadmapLinks.links || []) {
    const label = link.id || "(missing roadmap link id)";
    if (!/^SEIS-ROADMAP-LINK-\d{3}$/.test(link.id || "")) {
      failures.push(`${label} id must match SEIS-ROADMAP-LINK-000`);
    }
    if (linkIds.has(link.id)) {
      failures.push(`duplicate roadmap link id: ${link.id}`);
    }
    linkIds.add(link.id);
    if (!goalIds.has(link.goal_id)) {
      failures.push(`${label} references unknown goal id: ${link.goal_id}`);
    }
    if (linkGoalIds.has(link.goal_id)) {
      failures.push(`${label} duplicates roadmap coverage for goal id: ${link.goal_id}`);
    }
    linkGoalIds.add(link.goal_id);
    if (!statuses.has(link.status)) {
      failures.push(`${label} status is not allowed: ${link.status}`);
    }
    for (const field of ["title", "next_action"]) {
      if (typeof link[field] !== "string" || link[field].length === 0) {
        failures.push(`${label} ${field} must be a non-empty string`);
      }
    }
    for (const field of ["roadmap_refs", "pr_queue_refs", "status_refs", "related_paths"]) {
      if (!Array.isArray(link[field]) || link[field].length === 0) {
        failures.push(`${label} ${field} must be a non-empty array`);
      }
    }
    for (const path of link.related_paths || []) {
      validatePath(label, path);
    }
  }

  for (const goalId of goalIds) {
    if (!linkGoalIds.has(goalId)) {
      failures.push(`goal roadmap links missing coverage for goal id: ${goalId}`);
    }
  }
}

if (commandCenterView && registry && evidence && execution && reviewCadence && progressLedger && hierarchy && archiveLedger && cyclePlan && riskRegister && validationSteps && roadmapLinks) {
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
  if (commandCenterView.summary?.totalArchiveItems !== archiveLedger.archiveItems.length) {
    failures.push("command center view totalArchiveItems does not match archive ledger");
  }
  if (commandCenterView.summary?.totalYearlyGoals !== cyclePlan.yearlyGoals.length) {
    failures.push("command center view totalYearlyGoals does not match cycle plan");
  }
  if (commandCenterView.summary?.totalQuarterlyGoals !== cyclePlan.quarterlyGoals.length) {
    failures.push("command center view totalQuarterlyGoals does not match cycle plan");
  }
  if (commandCenterView.summary?.totalMonthlyGoals !== cyclePlan.monthlyGoals.length) {
    failures.push("command center view totalMonthlyGoals does not match cycle plan");
  }
  if (commandCenterView.summary?.totalWeeklyPriorities !== cyclePlan.weeklyPriorities.length) {
    failures.push("command center view totalWeeklyPriorities does not match cycle plan");
  }
  if (commandCenterView.summary?.totalRisks !== riskRegister.risks.length) {
    failures.push("command center view totalRisks does not match risk register");
  }
  if (commandCenterView.summary?.totalValidationSteps !== validationSteps.steps.length) {
    failures.push("command center view totalValidationSteps does not match validation steps");
  }
  if (commandCenterView.summary?.totalRoadmapLinks !== roadmapLinks.links.length) {
    failures.push("command center view totalRoadmapLinks does not match roadmap links");
  }
  for (const source of [registryPath, evidencePath, executionPath, reviewCadencePath, progressLedgerPath, hierarchyPath, archiveLedgerPath, cyclePlanPath, riskRegisterPath, validationStepsPath, roadmapLinksPath]) {
    if (!commandCenterView.sourceRecords?.includes(source)) {
      failures.push(`command center view missing source: ${source}`);
    }
  }
  for (const panel of ["goalList", "milestoneTimeline", "nextActionQueue", "blockedItems", "evidence", "readinessConnections", "reviewCadence", "completedItems", "deferredItems", "followUpActions", "planningHorizons", "activeProjects", "epics", "subtasks", "archiveItems", "yearlyGoals", "quarterlyGoals", "monthlyGoals", "weeklyPriorities", "risks", "validationSteps", "roadmapLinks"]) {
    if (!Array.isArray(commandCenterView.panels?.[panel]) || commandCenterView.panels[panel].length === 0) {
      failures.push(`command center view missing panel: ${panel}`);
    }
  }
}

if (existsSync(staticPagePath)) {
  const html = readFileSync(staticPagePath, "utf8");
  for (const text of ["Goal Tracking Center", "Milestone Timeline", "Next Safe Actions", "Blocked Items", "Review Cadence", "Completed Work", "Deferred Work", "Follow-Up Actions", "Planning Horizons", "Active Projects", "Epics", "Subtasks", "Archive Ledger", "Cycle Plan", "Yearly Goals", "Quarterly Goals", "Monthly Goals", "Weekly Priorities", "Risk Register", "Validation Steps", "Roadmap Links", "SEIS-GOAL-003", "SEIS-BLOCKER-001", "SEIS-MS-001", "SEIS-REVIEW-001", "SEIS-COMPLETE-001", "SEIS-DEFER-001", "SEIS-FOLLOWUP-001", "SEIS-HORIZON-001", "SEIS-PROJECT-001", "SEIS-EPIC-001", "SEIS-SUBTASK-001", "SEIS-ARCHIVE-001", "SEIS-YEAR-001", "SEIS-QUARTER-001", "SEIS-MONTH-001", "SEIS-WEEK-001", "SEIS-RISK-001", "SEIS-VAL-001", "SEIS-ROADMAP-LINK-001"]) {
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
  archiveItems: archiveLedger.archiveItems.length,
  yearlyGoals: cyclePlan.yearlyGoals.length,
  quarterlyGoals: cyclePlan.quarterlyGoals.length,
  monthlyGoals: cyclePlan.monthlyGoals.length,
  weeklyPriorities: cyclePlan.weeklyPriorities.length,
  risks: riskRegister.risks.length,
  validationSteps: validationSteps.steps.length,
  roadmapLinks: roadmapLinks.links.length,
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
