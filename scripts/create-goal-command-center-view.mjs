#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const CHECK_MODE = process.argv.includes("--check");
const paths = {
  goals: "content/development/seis-goal-tracking.json",
  evidence: "content/development/seis-goal-evidence.json",
  execution: "content/development/seis-goal-execution.json",
  reviewCadence: "content/development/seis-goal-review-cadence.json",
  progressLedger: "content/development/seis-goal-progress-ledger.json",
  hierarchy: "content/development/seis-goal-hierarchy.json",
  archiveLedger: "content/development/seis-goal-archive-ledger.json",
  cyclePlan: "content/development/seis-goal-cycle-plan.json",
  riskRegister: "content/development/seis-goal-risk-register.json",
  validationSteps: "content/development/seis-goal-validation-steps.json",
  roadmapLinks: "content/development/seis-goal-roadmap-links.json",
  view: "content/development/seis-goal-command-center-view.json",
  page: "apps/web/goal-tracking.html"
};

const goals = readJson(paths.goals);
const evidence = readJson(paths.evidence);
const execution = readJson(paths.execution);
const reviewCadence = readJson(paths.reviewCadence);
const progressLedger = readJson(paths.progressLedger);
const hierarchy = readJson(paths.hierarchy);
const archiveLedger = readJson(paths.archiveLedger);
const cyclePlan = readJson(paths.cyclePlan);
const riskRegister = readJson(paths.riskRegister);
const validationSteps = readJson(paths.validationSteps);
const roadmapLinks = readJson(paths.roadmapLinks);
const view = buildView(goals, evidence, execution, reviewCadence, progressLedger, hierarchy, archiveLedger, cyclePlan, riskRegister, validationSteps, roadmapLinks);
const html = buildHtml(view);
const failures = validate(view, html);

if (failures.length > 0) {
  console.error("SEIS Goal Command Center view is invalid:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const viewJson = `${JSON.stringify(view, null, 2)}\n`;

if (CHECK_MODE) {
  checkFresh(paths.view, viewJson);
  checkFresh(paths.page, html);
  console.log("SEIS Goal Command Center view check passed.");
  process.exit(0);
}

writeGenerated(paths.view, viewJson);
writeGenerated(paths.page, html);
console.log(`SEIS Goal Command Center view written: ${paths.view}`);
console.log(`SEIS Goal Tracking Center page written: ${paths.page}`);

function buildView(goalRegistry, evidenceLedger, executionBoard, reviewCadenceRecords, progressLedgerRecords, hierarchyRecords, archiveLedgerRecords, cyclePlanRecords, riskRegisterRecords, validationStepRecords, roadmapLinkRecords) {
  const goalRecords = goalRegistry.goals || [];
  const evidenceRecords = evidenceLedger.records || [];
  const tasks = executionBoard.tasks || [];
  const blockers = executionBoard.blockers || [];
  const decisions = executionBoard.decisions || [];
  const reviews = reviewCadenceRecords.records || [];
  const completedItems = progressLedgerRecords.completedItems || [];
  const deferredItems = progressLedgerRecords.deferredItems || [];
  const followUpActions = progressLedgerRecords.followUpActions || [];
  const horizons = hierarchyRecords.horizons || [];
  const activeProjects = hierarchyRecords.activeProjects || [];
  const epics = hierarchyRecords.epics || [];
  const subtasks = hierarchyRecords.subtasks || [];
  const archiveItems = archiveLedgerRecords.archiveItems || [];
  const yearlyGoals = cyclePlanRecords.yearlyGoals || [];
  const quarterlyGoals = cyclePlanRecords.quarterlyGoals || [];
  const monthlyGoals = cyclePlanRecords.monthlyGoals || [];
  const weeklyPriorities = cyclePlanRecords.weeklyPriorities || [];
  const risks = riskRegisterRecords.risks || [];
  const validationSteps = validationStepRecords.steps || [];
  const roadmapLinks = roadmapLinkRecords.links || [];
  const activeBlockers = blockers.filter((blocker) => blocker.status === "active");
  const finalState = activeBlockers.length > 0 ? "blocked_by_repository_hygiene" : "ready_for_review";

  return {
    schemaVersion: 1,
    id: "seis-goal-command-center-view",
    updated: "2026-06-22",
    mode: "non_llm_command_center_goal_view",
    sourceRecords: [paths.goals, paths.evidence, paths.execution, paths.reviewCadence, paths.progressLedger, paths.hierarchy, paths.archiveLedger, paths.cyclePlan, paths.riskRegister, paths.validationSteps, paths.roadmapLinks],
    summary: {
      finalState,
      totalGoals: goalRecords.length,
      goalsByStatus: countBy(goalRecords, "status"),
      totalCategories: goalRegistry.categories.length,
      totalEvidenceRecords: evidenceRecords.length,
      evidenceByStatus: countBy(evidenceRecords, "status"),
      totalTasks: tasks.length,
      tasksByStatus: countBy(tasks, "status"),
      totalBlockers: blockers.length,
      blockersByStatus: countBy(blockers, "status"),
      totalDecisions: decisions.length,
      totalReviewRecords: reviews.length,
      reviewRecordsByStatus: countBy(reviews, "status"),
      totalCompletedItems: completedItems.length,
      totalDeferredItems: deferredItems.length,
      totalFollowUpActions: followUpActions.length,
      followUpActionsByStatus: countBy(followUpActions, "status"),
      totalHorizons: horizons.length,
      horizonsByLevel: countBy(horizons, "level"),
      horizonsByStatus: countBy(horizons, "status"),
      totalActiveProjects: activeProjects.length,
      activeProjectsByStatus: countBy(activeProjects, "status"),
      totalEpics: epics.length,
      epicsByStatus: countBy(epics, "status"),
      totalSubtasks: subtasks.length,
      subtasksByStatus: countBy(subtasks, "status"),
      totalArchiveItems: archiveItems.length,
      archiveItemsByStatus: countBy(archiveItems, "status"),
      totalYearlyGoals: yearlyGoals.length,
      yearlyGoalsByStatus: countBy(yearlyGoals, "status"),
      totalQuarterlyGoals: quarterlyGoals.length,
      quarterlyGoalsByStatus: countBy(quarterlyGoals, "status"),
      totalMonthlyGoals: monthlyGoals.length,
      monthlyGoalsByStatus: countBy(monthlyGoals, "status"),
      totalWeeklyPriorities: weeklyPriorities.length,
      weeklyPrioritiesByStatus: countBy(weeklyPriorities, "status"),
      totalRisks: risks.length,
      risksByStatus: countBy(risks, "status"),
      risksBySeverity: countBy(risks, "severity"),
      totalValidationSteps: validationSteps.length,
      validationStepsByStatus: countBy(validationSteps, "status"),
      totalRoadmapLinks: roadmapLinks.length,
      roadmapLinksByStatus: countBy(roadmapLinks, "status"),
      nextSafeAction: activeBlockers.length > 0
        ? "Keep unrelated tracked deletions out of Goal Tracking commits and handle repository hygiene in a dedicated PR."
        : "Open a scoped review PR for the Goal Tracking OS foundation."
    },
    progressCards: [
      card("goals", "Goals", goalRecords.length, "Tracked strategic goals across all required categories."),
      card("active", "Active", countBy(goalRecords, "status").active || 0, "Goals with current local evidence."),
      card("blocked", "Blocked", countBy(goalRecords, "status").blocked || 0, "Goals blocked by named conditions."),
      card("planned", "Planned", countBy(goalRecords, "status").planned || 0, "Goals visible without unsupported completion claims."),
      card("evidence", "Evidence", evidenceRecords.length, "Evidence records with limitations and next actions."),
      card("tasks", "Tasks", tasks.length, "Execution tasks tied to goals and evidence."),
      card("reviews", "Reviews", reviews.length, "Daily, weekly, and monthly cadence records."),
      card("completed", "Completed", completedItems.length, "Scoped items finished with evidence."),
      card("deferred", "Deferred", deferredItems.length, "Work delayed with approval or dependency notes."),
      card("followups", "Follow-ups", followUpActions.length, "Continuing safe actions after this slice."),
      card("horizons", "Horizons", horizons.length, "Yearly, quarterly, monthly, and weekly planning records."),
      card("projects", "Projects", activeProjects.length, "Active, blocked, or planned project records."),
      card("epics", "Epics", epics.length, "Project-level execution groupings."),
      card("subtasks", "Subtasks", subtasks.length, "Task-backed execution detail records."),
      card("archive", "Archive", archiveItems.length, "Historical, deferred, and review-candidate records."),
      card("cycle", "Cycle Plan", yearlyGoals.length + quarterlyGoals.length + monthlyGoals.length + weeklyPriorities.length, "Yearly, quarterly, monthly, and weekly execution records."),
      card("risks", "Risks", risks.length, "Risk records with severity and mitigation."),
      card("validation", "Validation Steps", validationSteps.length, "Scoped checks with success conditions."),
      card("roadmap", "Roadmap Links", roadmapLinks.length, "Goal-to-roadmap and PR queue mappings.")
    ],
    panels: {
      goalList: goalRecords.map((goal) => ({
        id: goal.id,
        title: goal.title,
        category: goal.category,
        priority: goal.priority,
        status: goal.status,
        ownerRole: goal.owner_role,
        createdAt: goal.created_at,
        relatedMilestone: goal.related_milestone,
        relatedEpic: goal.related_epic,
        lastReviewed: goal.last_reviewed,
        reviewCadence: goal.review_cadence,
        notes: goal.notes,
        evidenceLinks: goal.evidence_links,
        blockers: goal.blockers,
        nextAction: goal.next_action
      })),
      milestoneTimeline: [
        milestone("SEIS-MS-001", "Goal docs foundation", "active", ["SEIS-GOAL-003", "SEIS-GOAL-005", "SEIS-GOAL-020"], "Keep documentation aligned with structured records."),
        milestone("SEIS-MS-002", "Structured goal records", "active", ["SEIS-GOAL-003"], "Keep JSON records validator-clean."),
        milestone("SEIS-MS-003", "Local validator", "active", ["SEIS-GOAL-003", "SEIS-GOAL-006"], "Run npm run check:goal-tracking before every commit."),
        milestone("SEIS-MS-004", "Static Command Center Goal view", "active", ["SEIS-GOAL-002", "SEIS-GOAL-003"], "Keep generated view and page fresh from source records."),
        milestone("SEIS-MS-005", "Repository hygiene recovery", "blocked", ["SEIS-GOAL-007", "SEIS-GOAL-008", "SEIS-GOAL-009"], "Handle tracked deletions in a dedicated repository hygiene PR."),
        milestone("SEIS-MS-006", "Repository intelligence scanner", "planned", ["SEIS-GOAL-004"], "Design read-only scanner outputs after foundation review.")
      ],
      nextActionQueue: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        ownerRole: task.owner_role,
        supportsGoalIds: task.supports_goal_ids,
        evidenceIds: task.evidence_ids,
        nextAction: task.next_action
      })),
      blockedItems: blockers.map((blocker) => ({
        id: blocker.id,
        title: blocker.title,
        status: blocker.status,
        severity: blocker.severity,
        supportsGoalIds: blocker.supports_goal_ids,
        evidenceIds: blocker.evidence_ids,
        nextAction: blocker.next_action
      })),
      evidence: evidenceRecords.map((record) => ({
        id: record.id,
        title: record.title,
        type: record.type,
        status: record.status,
        supportsGoalIds: record.supports_goal_ids,
        summary: record.summary,
        limitations: record.limitations,
        nextAction: record.next_action
      })),
      readinessConnections: ["Public Readiness", "Release Readiness", "SEIS AI Core", "SEIS App / Command Center", "SEIS Universe Research"].map((category) => {
        const goal = goalRecords.find((item) => item.category === category);
        return {
          category,
          status: goal?.status || "unknown",
          evidenceLinks: goal?.evidence_links || ["evidence unavailable"],
          nextAction: goal?.next_action || "Add an evidence-backed goal record."
        };
      }),
      decisions: decisions.map((decision) => ({
        id: decision.id,
        title: decision.title,
        status: decision.status,
        decision: decision.decision,
        consequence: decision.consequence
      })),
      reviewCadence: reviews.map((record) => ({
        id: record.id,
        title: record.title,
        cadence: record.cadence,
        status: record.status,
        ownerRole: record.owner_role,
        relatedGoalIds: record.related_goal_ids,
        relatedTaskIds: record.related_task_ids,
        evidenceIds: record.evidence_ids,
        checklist: record.checklist,
        completionRule: record.completion_rule,
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
      planningHorizons: horizons.map((item) => ({
        id: item.id,
        level: item.level,
        title: item.title,
        status: item.status,
        supportsGoalIds: item.supports_goal_ids,
        evidenceIds: item.evidence_ids,
        successCondition: item.success_condition,
        nextAction: item.next_action
      })),
      activeProjects: activeProjects.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        ownerRole: item.owner_role,
        supportsGoalIds: item.supports_goal_ids,
        milestoneIds: item.milestone_ids,
        evidenceIds: item.evidence_ids,
        nextAction: item.next_action
      })),
      epics: epics.map((item) => ({
        id: item.id,
        projectId: item.project_id,
        title: item.title,
        status: item.status,
        supportsGoalIds: item.supports_goal_ids,
        evidenceIds: item.evidence_ids,
        nextAction: item.next_action
      })),
      subtasks: subtasks.map((item) => ({
        id: item.id,
        taskId: item.task_id,
        epicId: item.epic_id,
        title: item.title,
        status: item.status,
        supportsGoalIds: item.supports_goal_ids,
        evidenceIds: item.evidence_ids,
        nextAction: item.next_action
      })),
      archiveItems: archiveItems.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        classification: item.classification,
        relatedGoalIds: item.related_goal_ids,
        evidenceIds: item.evidence_ids,
        promotionRule: item.promotion_rule,
        risk: item.risk,
        nextAction: item.next_action
      })),
      yearlyGoals: yearlyGoals.map(mapCycleItem),
      quarterlyGoals: quarterlyGoals.map(mapCycleItem),
      monthlyGoals: monthlyGoals.map(mapCycleItem),
      weeklyPriorities: weeklyPriorities.map(mapCycleItem),
      risks: risks.map((risk) => ({
        id: risk.id,
        title: risk.title,
        status: risk.status,
        severity: risk.severity,
        category: risk.category,
        ownerRole: risk.owner_role,
        supportsGoalIds: risk.supports_goal_ids,
        evidenceIds: risk.evidence_ids,
        mitigation: risk.mitigation,
        nextAction: risk.next_action
      })),
      validationSteps: validationSteps.map((step) => ({
        id: step.id,
        title: step.title,
        status: step.status,
        priority: step.priority,
        command: step.command,
        ownerRole: step.owner_role,
        supportsGoalIds: step.supports_goal_ids,
        evidenceIds: step.evidence_ids,
        successCondition: step.success_condition,
        nextAction: step.next_action
      })),
      roadmapLinks: roadmapLinks.map((link) => ({
        id: link.id,
        goalId: link.goal_id,
        title: link.title,
        status: link.status,
        roadmapRefs: link.roadmap_refs,
        prQueueRefs: link.pr_queue_refs,
        statusRefs: link.status_refs,
        nextAction: link.next_action
      }))
    },
    uxGuards: [
      "No fake progress bars or percentages.",
      "Completed and validated states require evidence.",
      "Blocked and approval-needed states remain visible.",
      "The page is generated from local files and does not require an LLM."
    ]
  };
}

function buildHtml(model) {
  const panels = model.panels;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SEIS Goal Tracking Center</title>
  <style>
    :root {
      --bg: #f7f6f2;
      --panel: #ffffff;
      --ink: #181b1f;
      --muted: #616a72;
      --line: #d9ddd8;
      --active: #1f7a4d;
      --planned: #8a6500;
      --blocked: #bd3f37;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-size: 14px; line-height: 1.45; }
    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 48px; }
    header { display: grid; gap: 10px; margin-bottom: 22px; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(28px, 4vw, 44px); letter-spacing: 0; line-height: 1.08; }
    h2 { font-size: 18px; margin-bottom: 12px; }
    h3 { font-size: 14px; }
    .muted { color: var(--muted); }
    .status { display: flex; flex-wrap: wrap; gap: 8px; }
    .badge { display: inline-flex; align-items: center; min-height: 24px; border: 1px solid var(--line); border-radius: 8px; padding: 3px 8px; background: var(--panel); color: var(--muted); font-size: 12px; }
    .badge.active { color: var(--active); }
    .badge.blocked { color: var(--blocked); }
    .badge.planned { color: var(--planned); }
    .grid { display: grid; gap: 14px; }
    .cards { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin: 20px 0; }
    .card, .panel, .row { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }
    .card { padding: 14px; min-height: 112px; display: grid; align-content: space-between; }
    .card strong { font-size: 24px; }
    .section { margin-top: 18px; }
    .panel { padding: 16px; }
    .stack { display: grid; gap: 10px; }
    .row { padding: 12px; }
    .row-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; border-top: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { color: var(--muted); font-weight: 600; }
    .table-wrap { overflow-x: auto; }
    @media (max-width: 760px) {
      main { width: min(100% - 24px, 1180px); padding-top: 20px; }
      .row-head { display: grid; }
    }
  </style>
</head>
<body data-seis-goal-center>
  <main>
    <header>
      <p class="muted">SEIS Command Center</p>
      <h1>Goal Tracking Center</h1>
      <p class="muted">Generated from structured non-LLM records. This page shows real, planned, blocked, evidence-backed, and next-action states without fake progress indicators.</p>
      <div class="status">
        <span class="badge blocked">${escapeHtml(model.summary.finalState)}</span>
        <span class="badge">Updated ${escapeHtml(model.updated)}</span>
        <span class="badge">Source records ${escapeHtml(String(model.sourceRecords.length))}</span>
      </div>
    </header>

    <section class="grid cards" aria-label="Goal summary cards">
      ${model.progressCards.map(renderCard).join("\n      ")}
    </section>

    <section class="panel section">
      <h2>Milestone Timeline</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Milestone</th><th>Status</th><th>Goals</th><th>Next Action</th></tr></thead>
          <tbody>${panels.milestoneTimeline.map(renderMilestone).join("")}</tbody>
        </table>
      </div>
    </section>

    <section class="grid section" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div class="panel">
        <h2>Next Safe Actions</h2>
        <div class="stack">${panels.nextActionQueue.map(renderTask).join("")}</div>
      </div>
      <div class="panel">
        <h2>Blocked Items</h2>
        <div class="stack">${panels.blockedItems.map(renderBlocker).join("")}</div>
      </div>
    </section>

    <section class="panel section">
      <h2>Goal List</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Goal</th><th>Status</th><th>Category</th><th>Planning Link</th><th>Evidence</th><th>Next Action</th></tr></thead>
          <tbody>${panels.goalList.map(renderGoal).join("")}</tbody>
        </table>
      </div>
    </section>

    <section class="panel section">
      <h2>Review Cadence</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Review</th><th>Status</th><th>Cadence</th><th>Evidence</th><th>Next Action</th></tr></thead>
          <tbody>${panels.reviewCadence.map(renderReview).join("")}</tbody>
        </table>
      </div>
    </section>

    <section class="grid section" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div class="panel">
        <h2>Completed Work</h2>
        <div class="stack">${panels.completedItems.map(renderCompleted).join("")}</div>
      </div>
      <div class="panel">
        <h2>Deferred Work</h2>
        <div class="stack">${panels.deferredItems.map(renderDeferred).join("")}</div>
      </div>
      <div class="panel">
        <h2>Follow-Up Actions</h2>
        <div class="stack">${panels.followUpActions.map(renderFollowUp).join("")}</div>
      </div>
    </section>

    <section class="panel section">
      <h2>Planning Horizons</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Horizon</th><th>Status</th><th>Level</th><th>Evidence</th><th>Next Action</th></tr></thead>
          <tbody>${panels.planningHorizons.map(renderHorizon).join("")}</tbody>
        </table>
      </div>
    </section>

    <section class="grid section" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div class="panel">
        <h2>Active Projects</h2>
        <div class="stack">${panels.activeProjects.map(renderProject).join("")}</div>
      </div>
      <div class="panel">
        <h2>Epics</h2>
        <div class="stack">${panels.epics.map(renderEpic).join("")}</div>
      </div>
      <div class="panel">
        <h2>Subtasks</h2>
        <div class="stack">${panels.subtasks.map(renderSubtask).join("")}</div>
      </div>
    </section>

    <section class="panel section">
      <h2>Archive Ledger</h2>
      <div class="stack">${panels.archiveItems.map(renderArchiveItem).join("")}</div>
    </section>

    <section class="grid section" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div class="panel">
        <h2>Yearly Goals</h2>
        <div class="stack">${panels.yearlyGoals.map(renderCycleItem).join("")}</div>
      </div>
      <div class="panel">
        <h2>Quarterly Goals</h2>
        <div class="stack">${panels.quarterlyGoals.map(renderCycleItem).join("")}</div>
      </div>
      <div class="panel">
        <h2>Monthly Goals</h2>
        <div class="stack">${panels.monthlyGoals.map(renderCycleItem).join("")}</div>
      </div>
      <div class="panel">
        <h2>Weekly Priorities</h2>
        <div class="stack">${panels.weeklyPriorities.map(renderCycleItem).join("")}</div>
      </div>
    </section>

    <section class="grid section" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div class="panel">
        <h2>Risk Register</h2>
        <div class="stack">${panels.risks.map(renderRisk).join("")}</div>
      </div>
      <div class="panel">
        <h2>Validation Steps</h2>
        <div class="stack">${panels.validationSteps.map(renderValidationStep).join("")}</div>
      </div>
    </section>

    <section class="panel section">
      <h2>Roadmap Links</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Goal</th><th>Status</th><th>Roadmap</th><th>Queue</th><th>Next Action</th></tr></thead>
          <tbody>${panels.roadmapLinks.map(renderRoadmapLink).join("")}</tbody>
        </table>
      </div>
    </section>

    <section class="grid section" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div class="panel">
        <h2>Evidence Links</h2>
        <div class="stack">${panels.evidence.map(renderEvidence).join("")}</div>
      </div>
      <div class="panel">
        <h2>Readiness Connections</h2>
        <div class="stack">${panels.readinessConnections.map(renderReadiness).join("")}</div>
      </div>
    </section>

    <section class="panel section">
      <h2>Decisions And UX Guardrails</h2>
      <div class="stack">${panels.decisions.map(renderDecision).join("")}</div>
      <div class="stack" style="margin-top: 12px;">${model.uxGuards.map((guard) => `<p class="muted">${escapeHtml(guard)}</p>`).join("")}</div>
    </section>
  </main>
</body>
</html>
`;
}

function renderCard(card) {
  return `<article class="card"><p class="muted">${escapeHtml(card.label)}</p><strong>${escapeHtml(String(card.value))}</strong><p class="muted">${escapeHtml(card.description)}</p></article>`;
}

function renderGoal(goal) {
  const planning = `${goal.relatedMilestone} · ${goal.relatedEpic} · ${goal.reviewCadence}`;
  return `<tr><td><strong>${escapeHtml(goal.id)}</strong><br>${escapeHtml(goal.title)}<br><span class="muted">Created ${escapeHtml(goal.createdAt)} · reviewed ${escapeHtml(goal.lastReviewed)}</span></td><td><span class="badge ${statusClass(goal.status)}">${escapeHtml(goal.status)}</span></td><td>${escapeHtml(goal.category)}</td><td>${escapeHtml(planning)}</td><td>${escapeHtml((goal.evidenceLinks || []).join(", "))}</td><td>${escapeHtml(goal.nextAction)}</td></tr>`;
}

function renderMilestone(item) {
  return `<tr><td><strong>${escapeHtml(item.id)}</strong><br>${escapeHtml(item.title)}</td><td><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td><td>${escapeHtml((item.relatedGoalIds || []).join(", "))}</td><td>${escapeHtml(item.nextAction)}</td></tr>`;
}

function renderTask(task) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(task.title)}</h3><p class="muted">${escapeHtml(task.id)}</p></div><span class="badge ${statusClass(task.status)}">${escapeHtml(task.status)}</span></div><p>${escapeHtml(task.nextAction)}</p></article>`;
}

function renderBlocker(blocker) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(blocker.title)}</h3><p class="muted">${escapeHtml(blocker.id)} · ${escapeHtml(blocker.severity)}</p></div><span class="badge blocked">${escapeHtml(blocker.status)}</span></div><p>${escapeHtml(blocker.nextAction)}</p></article>`;
}

function renderEvidence(record) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(record.title)}</h3><p class="muted">${escapeHtml(record.id)} · ${escapeHtml(record.type)}</p></div><span class="badge ${statusClass(record.status)}">${escapeHtml(record.status)}</span></div><p>${escapeHtml(record.summary)}</p><p class="muted">${escapeHtml((record.limitations || []).join(" "))}</p></article>`;
}

function renderReadiness(item) {
  return `<article class="row"><div class="row-head"><h3>${escapeHtml(item.category)}</h3><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderDecision(decision) {
  return `<article class="row"><h3>${escapeHtml(decision.id)} · ${escapeHtml(decision.title)}</h3><p>${escapeHtml(decision.decision)}</p><p class="muted">${escapeHtml(decision.consequence)}</p></article>`;
}

function renderReview(record) {
  return `<tr><td><strong>${escapeHtml(record.id)}</strong><br>${escapeHtml(record.title)}</td><td><span class="badge ${statusClass(record.status)}">${escapeHtml(record.status)}</span></td><td>${escapeHtml(record.cadence)}</td><td>${escapeHtml((record.evidenceIds || []).join(", "))}</td><td>${escapeHtml(record.nextAction)}</td></tr>`;
}

function renderCompleted(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.completedAt)}</p></div><span class="badge active">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.summary)}</p><p class="muted">${escapeHtml((item.limitations || []).join(" "))}</p><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderDeferred(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)}</p></div><span class="badge planned">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.reason)}</p><p class="muted">${escapeHtml(item.approvalRequired)}</p><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderFollowUp(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.priority)}</p></div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderHorizon(item) {
  return `<tr><td><strong>${escapeHtml(item.id)}</strong><br>${escapeHtml(item.title)}</td><td><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td><td>${escapeHtml(item.level)}</td><td>${escapeHtml((item.evidenceIds || []).join(", "))}</td><td>${escapeHtml(item.nextAction)}</td></tr>`;
}

function renderProject(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.ownerRole)}</p></div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p class="muted">${escapeHtml((item.milestoneIds || []).join(", "))}</p><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderEpic(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.projectId)}</p></div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderSubtask(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.taskId)} · ${escapeHtml(item.epicId)}</p></div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderArchiveItem(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.classification)}</p></div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.promotionRule)}</p><p class="muted">${escapeHtml(item.risk)}</p><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderCycleItem(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.priority)} · ${escapeHtml(item.horizonId)}</p></div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderRisk(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.severity)} · ${escapeHtml(item.category)}</p></div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.mitigation)}</p><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderValidationStep(item) {
  return `<article class="row"><div class="row-head"><div><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.priority)}</p></div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><p><strong>${escapeHtml(item.command)}</strong></p><p class="muted">${escapeHtml(item.successCondition)}</p><p>${escapeHtml(item.nextAction)}</p></article>`;
}

function renderRoadmapLink(item) {
  return `<tr><td><strong>${escapeHtml(item.id)}</strong><br>${escapeHtml(item.goalId)} · ${escapeHtml(item.title)}</td><td><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td><td>${escapeHtml((item.roadmapRefs || []).join(", "))}</td><td>${escapeHtml((item.prQueueRefs || []).join(", "))}</td><td>${escapeHtml(item.nextAction)}</td></tr>`;
}

function validate(view, html) {
  const failures = [];
  for (const text of ["Goal Tracking Center", "Milestone Timeline", "Next Safe Actions", "Blocked Items", "Goal List", "Review Cadence", "Completed Work", "Deferred Work", "Follow-Up Actions", "Planning Horizons", "Active Projects", "Epics", "Subtasks", "Archive Ledger", "Yearly Goals", "Quarterly Goals", "Monthly Goals", "Weekly Priorities", "Risk Register", "Validation Steps", "Roadmap Links", "Evidence Links", "Readiness Connections", "SEIS-GOAL-003", "SEIS-BLOCKER-001", "SEIS-MS-001", "SEIS-REVIEW-001", "SEIS-COMPLETE-001", "SEIS-DEFER-001", "SEIS-FOLLOWUP-001", "SEIS-HORIZON-001", "SEIS-PROJECT-001", "SEIS-EPIC-001", "SEIS-SUBTASK-001", "SEIS-ARCHIVE-001", "SEIS-YEAR-001", "SEIS-QUARTER-001", "SEIS-MONTH-001", "SEIS-WEEK-001", "SEIS-RISK-001", "SEIS-VAL-001", "SEIS-ROADMAP-LINK-001"]) {
    if (!html.includes(text)) {
      failures.push(`static page missing required text: ${text}`);
    }
  }
  if (/%\s*complete|role="progressbar"|aria-valuenow/i.test(html)) {
    failures.push("static page must not contain fake progress indicators");
  }
  if (view.summary.totalGoals !== (readJson(paths.goals).goals || []).length) {
    failures.push("view summary totalGoals does not match registry");
  }
  return failures;
}

function card(id, label, value, description) {
  return { id, label, value, description };
}

function milestone(id, title, status, relatedGoalIds, nextAction) {
  return { id, title, status, relatedGoalIds, nextAction };
}

function mapCycleItem(item) {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    priority: item.priority,
    horizonId: item.horizon_id,
    supportsGoalIds: item.supports_goal_ids,
    evidenceIds: item.evidence_ids,
    successCondition: item.success_condition,
    nextAction: item.next_action
  };
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
    return counts;
  }, {});
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(relativePath, "utf8"));
}

function writeGenerated(relativePath, contents) {
  mkdirSync(path.dirname(relativePath), { recursive: true });
  writeFileSync(relativePath, contents, "utf8");
}

function checkFresh(relativePath, expected) {
  if (!existsSync(relativePath)) {
    console.error(`missing generated file: ${relativePath}`);
    process.exit(1);
  }
  const current = readFileSync(relativePath, "utf8");
  if (current !== expected) {
    console.error(`stale generated file: ${relativePath}`);
    console.error("Run: npm run automation:goal-command-center-view");
    process.exit(1);
  }
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (["active", "passed", "accepted"].includes(normalized)) return "active";
  if (["blocked", "failed"].includes(normalized)) return "blocked";
  return "planned";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
