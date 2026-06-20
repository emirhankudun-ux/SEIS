#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const HELP_MODE = process.argv.includes("--help") || process.argv.includes("-h");

const paths = {
  goals: "content/development/seis-goal-tracking.json",
  evidence: "content/development/seis-goal-evidence.json",
  execution: "content/development/seis-goal-execution.json",
  reviewCadence: "content/development/seis-goal-review-cadence.json",
  reviewLog: "content/development/seis-goal-review-log.json",
  planningHorizons: "content/development/seis-goal-planning-horizons.json",
  progressLedger: "content/development/seis-goal-progress-ledger.json",
  objectiveCoverage: "content/development/seis-goal-objective-coverage.json",
  completionGate: "content/development/seis-goal-completion-gate.json",
  requirementMatrix: "content/development/seis-goal-requirement-matrix.json",
  output: "content/development/seis-goal-command-center-view.json"
};

if (HELP_MODE) {
  console.log(`SEIS Goal Command Center View

Commands:
  node scripts/create-goal-command-center-view.mjs
  node scripts/create-goal-command-center-view.mjs --check

Builds the static non-LLM Command Center Goal Tracking view model from the
goal, evidence, execution, review cadence, planning horizon, and progress
ledger registries, plus performed review logs, objective coverage, and the
completion gate and requirement matrix.
`);
  process.exit(0);
}

const goals = readJson(paths.goals);
const evidence = readJson(paths.evidence);
const execution = readJson(paths.execution);
const reviewCadence = readJson(paths.reviewCadence);
const reviewLog = readJson(paths.reviewLog);
const planningHorizons = readJson(paths.planningHorizons);
const progressLedger = readJson(paths.progressLedger);
const objectiveCoverage = readJson(paths.objectiveCoverage);
const completionGate = readJson(paths.completionGate);
const requirementMatrix = readJson(paths.requirementMatrix);
const view = buildView(goals, evidence, execution, reviewCadence, reviewLog, planningHorizons, progressLedger, objectiveCoverage, completionGate, requirementMatrix);
const failures = validateView(view, goals, evidence, execution, reviewCadence, reviewLog, planningHorizons, progressLedger, objectiveCoverage, completionGate, requirementMatrix);

if (failures.length > 0) {
  console.error("SEIS Goal Command Center view is invalid:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const output = stableJson(view);
const outputPath = path.join(ROOT, paths.output);

if (CHECK_MODE) {
  if (!existsSync(outputPath)) {
    console.error(`SEIS Goal Command Center view check failed: missing ${paths.output}`);
    process.exit(1);
  }

  const current = readFileSync(outputPath, "utf8");
  if (current !== output) {
    console.error(`SEIS Goal Command Center view check failed: stale ${paths.output}`);
    console.error("Run: npm run automation:goal-command-center-view");
    process.exit(1);
  }

  console.log("SEIS Goal Command Center view check passed.");
  process.exit(0);
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, output, "utf8");
console.log(`SEIS Goal Command Center view written: ${paths.output}`);

function buildView(goalRegistry, evidenceLedger, executionRegistry, reviewCadenceRegistry, reviewLogRegistry, planningHorizonsRegistry, progressLedger, objectiveCoverageRegistry, completionGateRegistry, requirementMatrixRegistry) {
  const goalRecords = goalRegistry.goals || [];
  const evidenceRecords = evidenceLedger.records || [];
  const taskRecords = executionRegistry.tasks || [];
  const blockerRecords = executionRegistry.blockers || [];
  const decisionRecords = executionRegistry.decisions || [];
  const reviewRecords = reviewCadenceRegistry.records || [];
  const reviewLogRecords = reviewLogRegistry.records || [];
  const horizonRecords = planningHorizonsRegistry.horizons || [];
  const projectRecords = planningHorizonsRegistry.activeProjects || [];
  const completedItems = progressLedger.completedItems || [];
  const deferredItems = progressLedger.deferredItems || [];
  const followUpActions = progressLedger.followUpActions || [];
  const objectiveCoverageRecords = objectiveCoverageRegistry.records || [];
  const completionGateRecords = completionGateRegistry.records || [];
  const requirementMatrixRecords = requirementMatrixRegistry.records || [];

  const goalsByStatus = countBy(goalRecords, "status");
  const goalsByCategory = countBy(goalRecords, "category");
  const tasksByStatus = countBy(taskRecords, "status");
  const blockersByStatus = countBy(blockerRecords, "status");
  const evidenceByStatus = countBy(evidenceRecords, "status");
  const reviewsByStatus = countBy(reviewRecords, "status");
  const reviewLogByStatus = countBy(reviewLogRecords, "status");
  const horizonsByStatus = countBy(horizonRecords, "status");
  const projectsByStatus = countBy(projectRecords, "status");
  const objectiveCoverageByStatus = countBy(objectiveCoverageRecords, "status");
  const completionGateByStatus = countBy(completionGateRecords, "status");
  const requirementMatrixByStatus = countBy(requirementMatrixRecords, "status");

  const activeCriticalBlockers = blockerRecords.filter((blocker) => blocker.status === "active" && blocker.severity === "critical");
  const finalState = activeCriticalBlockers.length > 0
    ? "blocked_by_repository_hygiene"
    : "ready_for_static_goal_view";

  return {
    schemaVersion: 1,
    id: "seis-goal-command-center-view",
    updated: "2026-06-20",
    mode: "non_llm_command_center_goal_view",
    sourceRecords: [
      paths.goals,
      paths.evidence,
      paths.execution,
      paths.reviewCadence,
      paths.reviewLog,
      paths.planningHorizons,
      paths.progressLedger,
      paths.objectiveCoverage,
      paths.completionGate,
      paths.requirementMatrix
    ],
    summary: {
      finalState,
      totalGoals: goalRecords.length,
      totalCategories: Object.keys(goalsByCategory).length,
      goalsByStatus,
      totalEvidenceRecords: evidenceRecords.length,
      evidenceByStatus,
      totalTasks: taskRecords.length,
      tasksByStatus,
      totalBlockers: blockerRecords.length,
      blockersByStatus,
      totalDecisions: decisionRecords.length,
      totalReviewRecords: reviewRecords.length,
      reviewsByStatus,
      totalReviewLogRecords: reviewLogRecords.length,
      reviewLogByStatus,
      totalPlanningHorizons: horizonRecords.length,
      horizonsByStatus,
      totalActiveProjects: projectRecords.length,
      projectsByStatus,
      totalCompletedItems: completedItems.length,
      totalDeferredItems: deferredItems.length,
      totalFollowUpActions: followUpActions.length,
      totalObjectiveCoverageRecords: objectiveCoverageRecords.length,
      objectiveCoverageByStatus,
      totalCompletionGateRecords: completionGateRecords.length,
      completionGateByStatus,
      totalRequirementMatrixRecords: requirementMatrixRecords.length,
      requirementMatrixByStatus,
      completionGateDecision: completionGateRegistry.finalDecision,
      nextSafeAction: activeCriticalBlockers.length > 0
        ? "Resolve P0 repository hygiene blockers before public or release readiness claims."
        : "Render the static Goal Tracking Center from the generated view model."
    },
    progressCards: [
      card("active-goals", "Active goals", goalsByStatus.active || 0, "active", "Goals currently carrying foundation work."),
      card("planned-goals", "Planned goals", goalsByStatus.planned || 0, "planned", "Goals visible but not claimed complete."),
      card("blocked-goals", "Blocked goals", goalsByStatus.blocked || 0, "blocked", "Goals blocked by named conditions."),
      card("evidence-records", "Evidence records", evidenceRecords.length, "active", "Structured proof, blocker, validation, and review records."),
      card("execution-tasks", "Execution tasks", taskRecords.length, "active", "Structured tasks and subtasks backing next actions."),
      card("active-blockers", "Active blockers", blockersByStatus.active || 0, "blocked", "Blockers that must remain visible."),
      card("review-cadence", "Review cadence", reviewRecords.length, "planned", "Planned daily, weekly, and monthly review records."),
      card("performed-reviews", "Performed reviews", reviewLogRecords.length, "active", "Actual review records backed by current evidence."),
      card("active-projects", "Active projects", projectRecords.length, "active", "Current project lanes linked to goals and evidence."),
      card("completed-items", "Completed items", completedItems.length, "active", "Scoped completed work with evidence and limitations."),
      card("objective-coverage", "Objective coverage", objectiveCoverageRecords.length, "active", "Mission requirements mapped to evidence and limitations."),
      card("requirement-matrix", "Requirement matrix", requirementMatrixRecords.length, "active", "Requirement-level coverage records with proof, gaps, and next actions."),
      card("completion-gate", "Completion gate", completionGateRegistry.finalDecision, "blocked", "Strict final-state audit for the Goal Tracking OS objective.")
    ],
    panels: {
      activeGoals: goalRecords
        .filter((goal) => goal.status === "active")
        .map(goalSummary),
      blockedGoals: goalRecords
        .filter((goal) => goal.status === "blocked")
        .map(goalSummary),
      categoryStatus: goalRegistry.categories.map((category) => {
        const categoryGoals = goalRecords.filter((goal) => goal.category === category);
        const primaryGoal = categoryGoals[0] || null;
        return {
          category,
          status: primaryGoal?.status || "unknown",
          priority: primaryGoal?.priority || "unknown",
          nextMilestone: primaryGoal?.related_milestone || "none",
          blockers: primaryGoal?.blockers || [],
          evidenceLinks: primaryGoal?.evidence_links || ["evidence unavailable"],
          nextAction: primaryGoal?.next_action || "Add a goal record for this category."
        };
      }),
      nextActionQueue: taskRecords
        .slice()
        .sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority))
        .map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          ownerRole: task.owner_role,
          supportsGoalIds: task.supports_goal_ids,
          blockerIds: task.blocker_ids,
          evidenceIds: task.evidence_ids,
          nextAction: task.next_action
        })),
      blockedItems: blockerRecords
        .filter((blocker) => blocker.status === "active")
        .map((blocker) => ({
          id: blocker.id,
          title: blocker.title,
          severity: blocker.severity,
          supportsGoalIds: blocker.supports_goal_ids,
          evidenceIds: blocker.evidence_ids,
          requiredApproval: blocker.required_approval,
          nextAction: blocker.next_action
        })),
      validationStatus: evidenceRecords
        .filter((record) => ["validation", "security-scan", "repository-state", "blocker", "review"].includes(record.type))
        .map((record) => ({
          id: record.id,
          title: record.title,
          type: record.type,
          status: record.status,
          supportsGoalIds: record.supports_goal_ids,
          summary: record.summary,
          limitations: record.limitations,
          nextAction: record.next_action
        })),
      decisions: decisionRecords.map((decision) => ({
        id: decision.id,
        title: decision.title,
        status: decision.status,
        supportsGoalIds: decision.supports_goal_ids,
        evidenceIds: decision.evidence_ids,
        decision: decision.decision,
        consequence: decision.consequence
      })),
      reviewCadence: reviewRecords.map((record) => ({
        id: record.id,
        title: record.title,
        cadence: record.cadence,
        status: record.status,
        ownerRole: record.owner_role,
        relatedGoalIds: record.related_goal_ids,
        relatedTaskIds: record.related_task_ids,
        evidenceIds: record.evidence_ids,
        checklist: record.checklist,
        requiredEvidence: record.required_evidence,
        completionRule: record.completion_rule,
        nextAction: record.next_action
      })),
      actualReviews: reviewLogRecords.map((record) => ({
        id: record.id,
        title: record.title,
        cadence: record.cadence,
        status: record.status,
        reviewDate: record.review_date,
        ownerRole: record.owner_role,
        relatedReviewId: record.related_review_id,
        relatedGoalIds: record.related_goal_ids,
        relatedTaskIds: record.related_task_ids,
        evidenceIds: record.evidence_ids,
        whatChanged: record.what_changed,
        activeBlockers: record.active_blockers,
        validationPerformed: record.validation_performed,
        validationNeeded: record.validation_needed,
        limitations: record.limitations,
        nextSafeAction: record.next_safe_action
      })),
      planningHorizons: horizonRecords.map((record) => ({
        id: record.id,
        title: record.title,
        horizon: record.horizon,
        timeframe: record.timeframe,
        status: record.status,
        priority: record.priority,
        ownerRole: record.owner_role,
        relatedGoalIds: record.related_goal_ids,
        relatedTaskIds: record.related_task_ids,
        evidenceIds: record.evidence_ids,
        focus: record.focus,
        successSignal: record.success_signal,
        blockers: record.blockers,
        nextAction: record.next_action
      })),
      activeProjects: projectRecords.map((record) => ({
        id: record.id,
        title: record.title,
        status: record.status,
        priority: record.priority,
        ownerRole: record.owner_role,
        relatedGoalIds: record.related_goal_ids,
        relatedTaskIds: record.related_task_ids,
        evidenceIds: record.evidence_ids,
        relatedHorizonIds: record.related_horizon_ids,
        blockers: record.blockers,
        nextAction: record.next_action
      })),
      completedItems: completedItems.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        completedAt: item.completed_at,
        supportsGoalIds: item.supports_goal_ids,
        evidenceIds: item.evidence_ids,
        summary: item.summary,
        limitations: item.limitations,
        nextAction: item.next_action
      })),
      deferredItems: deferredItems.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        reason: item.reason,
        supportsGoalIds: item.supports_goal_ids,
        approvalRequired: item.approval_required,
        nextAction: item.next_action
      })),
      followUpActions: followUpActions.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        priority: item.priority,
        supportsGoalIds: item.supports_goal_ids,
        relatedTaskIds: item.related_task_ids,
        evidenceIds: item.evidence_ids,
        nextAction: item.next_action
      })),
      objectiveCoverage: objectiveCoverageRecords.map((record) => ({
        id: record.id,
        objectiveSection: record.objective_section,
        requirement: record.requirement,
        status: record.status,
        evidenceIds: record.evidence_ids,
        relatedGoalIds: record.related_goal_ids,
        relatedPaths: record.related_paths,
        proof: record.proof,
        limitations: record.limitations,
        nextAction: record.next_action
      })),
      completionGate: completionGateRecords.map((record) => ({
        id: record.id,
        requirement: record.requirement,
        status: record.status,
        evidenceIds: record.evidence_ids,
        relatedGoalIds: record.related_goal_ids,
        relatedPaths: record.related_paths,
        proof: record.proof,
        gap: record.gap,
        nextAction: record.next_action
      })),
      requirementMatrix: requirementMatrixRecords.map((record) => ({
        id: record.id,
        requirementGroup: record.requirement_group,
        requirement: record.requirement,
        status: record.status,
        evidenceIds: record.evidence_ids,
        relatedGoalIds: record.related_goal_ids,
        relatedPaths: record.related_paths,
        proof: record.proof,
        gaps: record.gaps,
        nextAction: record.next_action
      })),
      readinessConnections: [
        "Public Readiness",
        "Release Readiness",
        "SEIS AI Core",
        "SEIS App / Command Center",
        "SEIS Universe Research"
      ].map((category) => {
        const goal = goalRecords.find((item) => item.category === category);
        return {
          category,
          status: goal?.status || "unknown",
          evidenceLinks: goal?.evidence_links || ["evidence unavailable"],
          nextAction: goal?.next_action || "Add evidence-backed goal state."
        };
      })
    },
    uxGuards: [
      guard("no-fake-progress-bars", "Do not show fake progress bars.", "enforced_by_numeric_cards"),
      guard("completed-needs-evidence", "Completed goals must show evidence.", "validated_by_goal_check"),
      guard("blocked-items-visible", "Blocked goals and blockers must remain visible.", "enforced_by_blocked_panels"),
      guard("planned-labeled-planned", "Planned goals must remain labeled planned.", "enforced_by_status_fields"),
      guard("validation-clear", "Validation status must be clear and limitation-aware.", "enforced_by_evidence_panel")
    ]
  };
}

function validateView(view, goalRegistry, evidenceLedger, executionRegistry, reviewCadenceRegistry, reviewLogRegistry, planningHorizonsRegistry, progressLedger, objectiveCoverageRegistry, completionGateRegistry, requirementMatrixRegistry) {
  const failures = [];
  const goalIds = new Set((goalRegistry.goals || []).map((goal) => goal.id));
  const evidenceIds = new Set((evidenceLedger.records || []).map((record) => record.id));
  const blockerIds = new Set((executionRegistry.blockers || []).map((blocker) => blocker.id));
  const taskIds = new Set((executionRegistry.tasks || []).map((task) => task.id));
  const reviewIds = new Set((reviewCadenceRegistry.records || []).map((record) => record.id));
  const reviewLogIds = new Set((reviewLogRegistry.records || []).map((record) => record.id));
  const horizonIds = new Set((planningHorizonsRegistry.horizons || []).map((record) => record.id));
  const projectIds = new Set((planningHorizonsRegistry.activeProjects || []).map((record) => record.id));
  const objectiveCoverageIds = new Set((objectiveCoverageRegistry.records || []).map((record) => record.id));
  const completionGateIds = new Set((completionGateRegistry.records || []).map((record) => record.id));
  const requirementMatrixIds = new Set((requirementMatrixRegistry.records || []).map((record) => record.id));

  if (view.schemaVersion !== 1) {
    failures.push("view schemaVersion must be 1");
  }

  if (view.mode !== "non_llm_command_center_goal_view") {
    failures.push("view mode must be non_llm_command_center_goal_view");
  }

  for (const source of [paths.goals, paths.evidence, paths.execution, paths.reviewCadence, paths.reviewLog, paths.planningHorizons, paths.progressLedger, paths.objectiveCoverage, paths.completionGate, paths.requirementMatrix]) {
    if (!view.sourceRecords.includes(source)) {
      failures.push(`view missing source record: ${source}`);
    }
  }

  if (view.summary.totalGoals !== (goalRegistry.goals || []).length) {
    failures.push("view summary totalGoals does not match goal registry");
  }

  if (view.summary.totalEvidenceRecords !== (evidenceLedger.records || []).length) {
    failures.push("view summary totalEvidenceRecords does not match evidence ledger");
  }

  if (view.summary.totalTasks !== (executionRegistry.tasks || []).length) {
    failures.push("view summary totalTasks does not match execution registry");
  }

  if (view.summary.totalReviewRecords !== (reviewCadenceRegistry.records || []).length) {
    failures.push("view summary totalReviewRecords does not match review cadence registry");
  }

  if (view.summary.totalReviewLogRecords !== (reviewLogRegistry.records || []).length) {
    failures.push("view summary totalReviewLogRecords does not match review log registry");
  }

  if (view.summary.totalPlanningHorizons !== (planningHorizonsRegistry.horizons || []).length) {
    failures.push("view summary totalPlanningHorizons does not match planning horizons registry");
  }

  if (view.summary.totalActiveProjects !== (planningHorizonsRegistry.activeProjects || []).length) {
    failures.push("view summary totalActiveProjects does not match planning horizons registry");
  }

  if (view.summary.totalCompletedItems !== (progressLedger.completedItems || []).length) {
    failures.push("view summary totalCompletedItems does not match progress ledger");
  }

  if (view.summary.totalDeferredItems !== (progressLedger.deferredItems || []).length) {
    failures.push("view summary totalDeferredItems does not match progress ledger");
  }

  if (view.summary.totalFollowUpActions !== (progressLedger.followUpActions || []).length) {
    failures.push("view summary totalFollowUpActions does not match progress ledger");
  }

  if (view.summary.totalObjectiveCoverageRecords !== (objectiveCoverageRegistry.records || []).length) {
    failures.push("view summary totalObjectiveCoverageRecords does not match objective coverage registry");
  }

  if (view.summary.totalCompletionGateRecords !== (completionGateRegistry.records || []).length) {
    failures.push("view summary totalCompletionGateRecords does not match completion gate registry");
  }

  if (view.summary.totalRequirementMatrixRecords !== (requirementMatrixRegistry.records || []).length) {
    failures.push("view summary totalRequirementMatrixRecords does not match requirement matrix");
  }

  if (view.summary.completionGateDecision !== completionGateRegistry.finalDecision) {
    failures.push("view summary completionGateDecision does not match completion gate registry");
  }

  if (view.progressCards.length < 6) {
    failures.push("view should expose the core progress cards");
  }

  if (!view.panels.blockedItems.length) {
    failures.push("view must expose active blockers");
  }

  if (!view.panels.nextActionQueue.length) {
    failures.push("view must expose next action queue");
  }

  if (!view.panels.reviewCadence.length) {
    failures.push("view must expose review cadence");
  }

  if (!view.panels.actualReviews.length) {
    failures.push("view must expose actual reviews");
  }

  if (!view.panels.planningHorizons.length) {
    failures.push("view must expose planning horizons");
  }

  if (!view.panels.activeProjects.length) {
    failures.push("view must expose active projects");
  }

  if (!view.panels.completedItems.length) {
    failures.push("view must expose completed items");
  }

  if (!view.panels.deferredItems.length) {
    failures.push("view must expose deferred items");
  }

  if (!view.panels.followUpActions.length) {
    failures.push("view must expose follow-up actions");
  }

  if (!view.panels.objectiveCoverage.length) {
    failures.push("view must expose objective coverage");
  }

  if (!view.panels.completionGate.length) {
    failures.push("view must expose completion gate");
  }

  if (!view.panels.requirementMatrix.length) {
    failures.push("view must expose requirement matrix");
  }

  for (const panelName of ["activeGoals", "blockedGoals"]) {
    for (const goal of view.panels[panelName]) {
      if (!goalIds.has(goal.id)) {
        failures.push(`${panelName} references unknown goal id: ${goal.id}`);
      }
    }
  }

  for (const item of view.panels.nextActionQueue) {
    for (const goalId of item.supportsGoalIds || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${item.id} references unknown goal id: ${goalId}`);
      }
    }
    for (const blockerId of item.blockerIds || []) {
      if (!blockerIds.has(blockerId)) {
        failures.push(`${item.id} references unknown blocker id: ${blockerId}`);
      }
    }
    for (const evidenceId of item.evidenceIds || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${item.id} references unknown evidence id: ${evidenceId}`);
      }
    }
  }

  for (const item of view.panels.validationStatus) {
    if (!evidenceIds.has(item.id)) {
      failures.push(`validationStatus references unknown evidence id: ${item.id}`);
    }
  }

  for (const item of view.panels.reviewCadence) {
    if (!reviewIds.has(item.id)) {
      failures.push(`reviewCadence references unknown review id: ${item.id}`);
    }
    if (item.status === "performed" && !item.evidenceIds?.length) {
      failures.push(`${item.id} must not be marked performed without review evidence`);
    }
    for (const goalId of item.relatedGoalIds || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${item.id} references unknown goal id: ${goalId}`);
      }
    }
    for (const taskId of item.relatedTaskIds || []) {
      if (!taskIds.has(taskId)) {
        failures.push(`${item.id} references unknown task id: ${taskId}`);
      }
    }
    for (const evidenceId of item.evidenceIds || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${item.id} references unknown evidence id: ${evidenceId}`);
      }
    }
  }

  for (const item of view.panels.actualReviews) {
    if (!reviewLogIds.has(item.id)) {
      failures.push(`actualReviews references unknown review log id: ${item.id}`);
    }
    if (!reviewIds.has(item.relatedReviewId)) {
      failures.push(`${item.id} references unknown cadence review id: ${item.relatedReviewId}`);
    }
    validateGoalTaskEvidenceRefs(item, goalIds, taskIds, evidenceIds, failures);
    if (item.status === "performed" && !item.evidenceIds?.length) {
      failures.push(`${item.id} performed review must expose evidence ids`);
    }
  }

  for (const item of view.panels.planningHorizons) {
    if (!horizonIds.has(item.id)) {
      failures.push(`planningHorizons references unknown horizon id: ${item.id}`);
    }
    validateGoalTaskEvidenceRefs(item, goalIds, taskIds, evidenceIds, failures);
  }

  for (const item of view.panels.activeProjects) {
    if (!projectIds.has(item.id)) {
      failures.push(`activeProjects references unknown project id: ${item.id}`);
    }
    validateGoalTaskEvidenceRefs(item, goalIds, taskIds, evidenceIds, failures);
    for (const horizonId of item.relatedHorizonIds || []) {
      if (!horizonIds.has(horizonId)) {
        failures.push(`${item.id} references unknown horizon id: ${horizonId}`);
      }
    }
  }

  for (const item of view.panels.completedItems) {
    validateGoalTaskEvidenceRefs(item, goalIds, taskIds, evidenceIds, failures);
    if (!item.evidenceIds?.length) {
      failures.push(`${item.id} completed item must expose evidence ids`);
    }
  }

  for (const item of view.panels.followUpActions) {
    validateGoalTaskEvidenceRefs(item, goalIds, taskIds, evidenceIds, failures);
  }

  for (const item of view.panels.objectiveCoverage) {
    if (!objectiveCoverageIds.has(item.id)) {
      failures.push(`objectiveCoverage references unknown objective coverage id: ${item.id}`);
    }
    for (const goalId of item.relatedGoalIds || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${item.id} references unknown goal id: ${goalId}`);
      }
    }
    for (const evidenceId of item.evidenceIds || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${item.id} references unknown evidence id: ${evidenceId}`);
      }
    }
  }

  for (const item of view.panels.completionGate) {
    if (!completionGateIds.has(item.id)) {
      failures.push(`completionGate references unknown completion gate id: ${item.id}`);
    }
    for (const goalId of item.relatedGoalIds || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${item.id} references unknown goal id: ${goalId}`);
      }
    }
    for (const evidenceId of item.evidenceIds || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${item.id} references unknown evidence id: ${evidenceId}`);
      }
    }
  }

  for (const item of view.panels.requirementMatrix) {
    if (!requirementMatrixIds.has(item.id)) {
      failures.push(`requirementMatrix references unknown requirement id: ${item.id}`);
    }
    for (const goalId of item.relatedGoalIds || []) {
      if (!goalIds.has(goalId)) {
        failures.push(`${item.id} references unknown goal id: ${goalId}`);
      }
    }
    for (const evidenceId of item.evidenceIds || []) {
      if (!evidenceIds.has(evidenceId)) {
        failures.push(`${item.id} references unknown evidence id: ${evidenceId}`);
      }
    }
    if (["partial", "blocked", "planned"].includes(item.status) && !item.gaps?.length) {
      failures.push(`${item.id} must expose gaps for non-proved status`);
    }
  }

  return failures;
}

function validateGoalTaskEvidenceRefs(item, goalIds, taskIds, evidenceIds, failures) {
  for (const goalId of item.relatedGoalIds || []) {
    if (!goalIds.has(goalId)) {
      failures.push(`${item.id} references unknown goal id: ${goalId}`);
    }
  }
  for (const taskId of item.relatedTaskIds || []) {
    if (!taskIds.has(taskId)) {
      failures.push(`${item.id} references unknown task id: ${taskId}`);
    }
  }
  for (const evidenceId of item.evidenceIds || []) {
    if (!evidenceIds.has(evidenceId)) {
      failures.push(`${item.id} references unknown evidence id: ${evidenceId}`);
    }
  }
}

function goalSummary(goal) {
  return {
    id: goal.id,
    title: goal.title,
    category: goal.category,
    priority: goal.priority,
    status: goal.status,
    ownerRole: goal.owner_role,
    targetPhase: goal.target_phase,
    relatedRoadmapItem: goal.related_roadmap_item,
    relatedMilestone: goal.related_milestone,
    evidenceLinks: goal.evidence_links,
    blockers: goal.blockers,
    validationMethod: goal.validation_method,
    nextAction: goal.next_action
  };
}

function card(id, label, value, status, description) {
  return { id, label, value, status, description };
}

function guard(id, rule, enforcement) {
  return { id, rule, enforcement };
}

function priorityRank(priority) {
  const ranks = {
    "P0 critical": 0,
    "P1 high": 1,
    "P2 medium": 2,
    "P3 low": 3,
    "P4 future": 4
  };
  return ranks[priority] ?? 99;
}

function countBy(items, key) {
  const counts = {};
  for (const item of items || []) {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
  }
  return counts;
}

function readJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required source: ${relativePath}`);
  }
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function stableJson(data) {
  return JSON.stringify(data, null, 2) + "\n";
}
