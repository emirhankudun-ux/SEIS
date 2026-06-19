#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const HELP_MODE = process.argv.includes("--help") || process.argv.includes("-h");
const VIEW_PATH = "content/development/seis-goal-command-center-view.json";
const OUTPUT_PATH = "apps/command-center/goal-tracking/index.html";

if (HELP_MODE) {
  console.log(`SEIS Goal Command Center Static Surface

Commands:
  node scripts/create-goal-command-center-static.mjs
  node scripts/create-goal-command-center-static.mjs --check

Builds a static, non-LLM Goal Tracking Center page from the generated
Command Center view model.
`);
  process.exit(0);
}

const view = readJson(VIEW_PATH);
const html = buildHtml(view);
const failures = validateHtml(html, view);

if (failures.length > 0) {
  console.error("SEIS Goal Command Center static surface is invalid:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const outputPath = path.join(ROOT, OUTPUT_PATH);

if (CHECK_MODE) {
  if (!existsSync(outputPath)) {
    console.error(`SEIS Goal Command Center static check failed: missing ${OUTPUT_PATH}`);
    process.exit(1);
  }

  const current = readFileSync(outputPath, "utf8");
  if (current !== html) {
    console.error(`SEIS Goal Command Center static check failed: stale ${OUTPUT_PATH}`);
    console.error("Run: npm run automation:goal-command-center-static");
    process.exit(1);
  }

  console.log("SEIS Goal Command Center static check passed.");
  process.exit(0);
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html, "utf8");
console.log(`SEIS Goal Command Center static surface written: ${OUTPUT_PATH}`);

function buildHtml(model) {
  const summary = model.summary || {};
  const panels = model.panels || {};
  const cards = model.progressCards || [];
  const activeGoals = panels.activeGoals || [];
  const blockedGoals = panels.blockedGoals || [];
  const nextActions = panels.nextActionQueue || [];
  const blockers = panels.blockedItems || [];
  const validation = panels.validationStatus || [];
  const decisions = panels.decisions || [];
  const reviewCadence = panels.reviewCadence || [];
  const readiness = panels.readinessConnections || [];
  const categoryStatus = panels.categoryStatus || [];
  const uxGuards = model.uxGuards || [];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>SEIS Goal Tracking Center</title>
  <style>
    :root {
      --bg: #f4f3ef;
      --panel: #ffffff;
      --panel-2: #f8f9f7;
      --line: #d7dcd6;
      --text: #202326;
      --muted: #626b72;
      --soft: #8b949b;
      --blue: #2f6fed;
      --green: #248a52;
      --yellow: #9a6500;
      --red: #c2413c;
      --focus: #7656d6;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-size: 14px;
      line-height: 1.45;
    }

    a {
      color: inherit;
    }

    .shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 248px minmax(0, 1fr);
    }

    .sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      border-right: 1px solid var(--line);
      background: #111315;
      color: #f5f3ee;
      padding: 20px 16px;
      overflow: auto;
    }

    .brand {
      display: grid;
      gap: 4px;
      margin-bottom: 24px;
    }

    .brand strong {
      font-size: 15px;
      font-weight: 650;
    }

    .brand span,
    .nav-label,
    .meta-label,
    .card-label,
    .eyebrow {
      color: var(--muted);
      font-size: 12px;
    }

    .sidebar .brand span {
      color: #aeb7b2;
    }

    .nav {
      display: grid;
      gap: 6px;
    }

    .nav a {
      color: #c9d0cc;
      text-decoration: none;
      padding: 8px 10px;
      border-radius: 8px;
    }

    .nav a:focus-visible,
    .nav a:hover {
      color: #ffffff;
      background: #242928;
      outline: 2px solid transparent;
    }

    .main {
      min-width: 0;
      padding: 24px;
    }

    .topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      font-size: 28px;
      line-height: 1.15;
      font-weight: 680;
    }

    h2 {
      font-size: 16px;
      margin-bottom: 12px;
    }

    h3 {
      font-size: 14px;
      font-weight: 650;
    }

    .status-line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      color: var(--muted);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 24px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 3px 8px;
      color: var(--muted);
      background: var(--panel);
      font-size: 12px;
      white-space: nowrap;
    }

    .badge::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--soft);
    }

    .badge.active::before,
    .badge.passed::before {
      background: var(--green);
    }

    .badge.planned::before,
    .badge.partial::before,
    .badge.observed::before {
      background: var(--yellow);
    }

    .badge.blocked::before {
      background: var(--red);
    }

    .grid {
      display: grid;
      gap: 14px;
    }

    .cards {
      grid-template-columns: repeat(6, minmax(0, 1fr));
      margin: 18px 0;
    }

    .card,
    .row,
    .table-wrap {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
    }

    .card {
      min-height: 112px;
      padding: 14px;
      display: grid;
      align-content: space-between;
      gap: 10px;
    }

    .card-value {
      font-size: 30px;
      font-weight: 700;
      line-height: 1;
    }

    .section-grid {
      grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
      align-items: start;
      margin-top: 18px;
    }

    .review-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .panel {
      padding: 12px 0;
    }

    .stack {
      display: grid;
      gap: 10px;
    }

    .row {
      padding: 12px;
      background: var(--panel-2);
    }

    .row-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
      margin-bottom: 8px;
    }

    .row-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }

    .next-action {
      color: var(--text);
      margin-top: 8px;
    }

    .muted {
      color: var(--muted);
    }

    .table-wrap {
      overflow: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }

    th,
    td {
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--line);
      padding: 10px;
    }

    th {
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
      background: #eef1ed;
      position: sticky;
      top: 0;
    }

    tr:last-child td {
      border-bottom: 0;
    }

    .footer {
      margin-top: 18px;
      color: var(--muted);
      font-size: 12px;
    }

    :focus-visible {
      outline: 2px solid var(--focus);
      outline-offset: 2px;
    }

    @media (max-width: 1120px) {
      .shell {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: static;
        height: auto;
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .nav {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .cards {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .section-grid {
        grid-template-columns: 1fr;
      }

      .review-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 720px) {
      .main {
        padding: 18px;
      }

      .cards {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .nav {
        grid-template-columns: 1fr 1fr;
      }

      h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="shell" data-seis-goal-center data-state="${escapeAttr(summary.finalState || "unknown")}">
    <aside class="sidebar" aria-label="Goal Tracking Center navigation">
      <div class="brand">
        <strong>SEIS Command Center</strong>
        <span>Goal Tracking OS</span>
      </div>
      <nav class="nav" aria-label="Goal Tracking sections">
        <a href="#overview">Overview</a>
        <a href="#next-actions">Next Actions</a>
        <a href="#blockers">Blockers</a>
        <a href="#goals">Goals</a>
        <a href="#validation">Validation</a>
        <a href="#reviews">Reviews</a>
        <a href="#decisions">Decisions</a>
      </nav>
    </aside>

    <main class="main">
      <header class="topbar" id="overview">
        <div>
          <p class="eyebrow">Generated static surface</p>
          <h1>Goal Tracking Center</h1>
        </div>
        <div class="status-line">
          <span class="badge blocked">${escapeHtml(summary.finalState || "unknown")}</span>
          <span class="badge observed">${escapeHtml(model.updated || "unknown")}</span>
        </div>
      </header>

      <section class="panel">
        <h2>Current Next Safe Action</h2>
        <p>${escapeHtml(summary.nextSafeAction || "No next action recorded.")}</p>
      </section>

      <section class="grid cards" aria-label="Progress cards">
        ${cards.map(renderCard).join("\n        ")}
      </section>

      <section class="grid section-grid">
        <div class="panel" id="next-actions">
          <h2>Next Action Queue</h2>
          <div class="stack">
            ${nextActions.map(renderNextAction).join("\n            ")}
          </div>
        </div>

        <div class="panel" id="blockers">
          <h2>Active Blockers</h2>
          <div class="stack">
            ${blockers.map(renderBlocker).join("\n            ")}
          </div>
        </div>
      </section>

      <section class="grid section-grid" id="goals">
        <div class="panel">
          <h2>Active Goals</h2>
          <div class="stack">
            ${activeGoals.map(renderGoal).join("\n            ")}
          </div>
        </div>

        <div class="panel">
          <h2>Blocked Goals</h2>
          <div class="stack">
            ${blockedGoals.map(renderGoal).join("\n            ")}
          </div>
        </div>
      </section>

      <section class="panel">
        <h2>Category Status</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Next Milestone</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              ${categoryStatus.map(renderCategoryRow).join("\n              ")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="grid section-grid" id="validation">
        <div class="panel">
          <h2>Validation Status</h2>
          <div class="stack">
            ${validation.slice(0, 8).map(renderValidation).join("\n            ")}
          </div>
        </div>

        <div class="panel">
          <h2>Readiness Connections</h2>
          <div class="stack">
            ${readiness.map(renderReadiness).join("\n            ")}
          </div>
        </div>
      </section>

      <section class="panel" id="reviews">
        <h2>Review Cadence</h2>
        <div class="grid review-grid">
          ${reviewCadence.map(renderReviewCadence).join("\n          ")}
        </div>
      </section>

      <section class="grid section-grid" id="decisions">
        <div class="panel">
          <h2>Decisions</h2>
          <div class="stack">
            ${decisions.map(renderDecision).join("\n            ")}
          </div>
        </div>

        <div class="panel">
          <h2>UX Guardrails</h2>
          <div class="stack">
            ${uxGuards.map(renderGuard).join("\n            ")}
          </div>
        </div>
      </section>

      <footer class="footer">
        Source: ${model.sourceRecords.map((source) => `<code>${escapeHtml(source)}</code>`).join(", ")}.
        This static page is generated and should not be edited by hand.
      </footer>
    </main>
  </div>
</body>
</html>
`;
}

function renderCard(card) {
  return `<article class="card">
  <div>
    <p class="card-label">${escapeHtml(card.label)}</p>
    <div class="card-value">${escapeHtml(String(card.value))}</div>
  </div>
  <p class="muted">${escapeHtml(card.description)}</p>
</article>`;
}

function renderGoal(goal) {
  return `<article class="row">
  <div class="row-head">
    <div>
      <h3>${escapeHtml(goal.title)}</h3>
      <p class="muted">${escapeHtml(goal.id)} · ${escapeHtml(goal.category)}</p>
    </div>
    <span class="badge ${statusClass(goal.status)}">${escapeHtml(goal.status)}</span>
  </div>
  <p class="next-action">${escapeHtml(goal.nextAction)}</p>
  <div class="row-meta">
    <span class="badge">${escapeHtml(goal.priority)}</span>
    <span class="badge">${escapeHtml(goal.relatedMilestone || "none")}</span>
  </div>
</article>`;
}

function renderNextAction(task) {
  return `<article class="row">
  <div class="row-head">
    <div>
      <h3>${escapeHtml(task.title)}</h3>
      <p class="muted">${escapeHtml(task.id)} · ${escapeHtml(task.ownerRole)}</p>
    </div>
    <span class="badge ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
  </div>
  <p class="next-action">${escapeHtml(task.nextAction)}</p>
  <div class="row-meta">
    <span class="badge">${escapeHtml(task.priority)}</span>
    <span class="badge">Goals: ${escapeHtml((task.supportsGoalIds || []).join(", "))}</span>
  </div>
</article>`;
}

function renderBlocker(blocker) {
  return `<article class="row">
  <div class="row-head">
    <div>
      <h3>${escapeHtml(blocker.title)}</h3>
      <p class="muted">${escapeHtml(blocker.id)} · ${escapeHtml(blocker.severity)}</p>
    </div>
    <span class="badge blocked">active</span>
  </div>
  <p class="next-action">${escapeHtml(blocker.nextAction)}</p>
  <p class="muted">${escapeHtml(blocker.requiredApproval)}</p>
</article>`;
}

function renderCategoryRow(item) {
  return `<tr>
  <td>${escapeHtml(item.category)}</td>
  <td><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
  <td>${escapeHtml(item.priority)}</td>
  <td>${escapeHtml(item.nextMilestone)}</td>
  <td>${escapeHtml(item.nextAction)}</td>
</tr>`;
}

function renderValidation(record) {
  return `<article class="row">
  <div class="row-head">
    <div>
      <h3>${escapeHtml(record.title)}</h3>
      <p class="muted">${escapeHtml(record.id)} · ${escapeHtml(record.type)}</p>
    </div>
    <span class="badge ${statusClass(record.status)}">${escapeHtml(record.status)}</span>
  </div>
  <p>${escapeHtml(record.summary)}</p>
  <p class="muted">${escapeHtml((record.limitations || []).join(" "))}</p>
</article>`;
}

function renderDecision(decision) {
  return `<article class="row">
  <div class="row-head">
    <div>
      <h3>${escapeHtml(decision.title)}</h3>
      <p class="muted">${escapeHtml(decision.id)}</p>
    </div>
    <span class="badge ${statusClass(decision.status)}">${escapeHtml(decision.status)}</span>
  </div>
  <p>${escapeHtml(decision.decision)}</p>
  <p class="muted">${escapeHtml(decision.consequence)}</p>
</article>`;
}

function renderReadiness(item) {
  return `<article class="row">
  <div class="row-head">
    <h3>${escapeHtml(item.category)}</h3>
    <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
  </div>
  <p class="next-action">${escapeHtml(item.nextAction)}</p>
</article>`;
}

function renderReviewCadence(item) {
  return `<article class="row">
  <div class="row-head">
    <div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.cadence)}</p>
    </div>
    <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
  </div>
  <p>${escapeHtml(item.completionRule)}</p>
  <p class="next-action">${escapeHtml(item.nextAction)}</p>
  <div class="row-meta">
    <span class="badge">${escapeHtml(item.ownerRole)}</span>
    <span class="badge">Evidence: ${escapeHtml((item.evidenceIds || []).join(", ") || "none")}</span>
  </div>
</article>`;
}

function renderGuard(guard) {
  return `<article class="row">
  <h3>${escapeHtml(guard.rule)}</h3>
  <p class="muted">${escapeHtml(guard.id)} · ${escapeHtml(guard.enforcement)}</p>
</article>`;
}

function validateHtml(html, model) {
  const failures = [];

  for (const required of [
    "data-seis-goal-center",
    "Goal Tracking Center",
    "Next Action Queue",
    "Active Blockers",
    "Validation Status",
    "Review Cadence",
    "Readiness Connections",
    "UX Guardrails"
  ]) {
    if (!html.includes(required)) {
      failures.push(`missing required surface text: ${required}`);
    }
  }

  if (!html.includes(escapeHtml(model.summary?.finalState || ""))) {
    failures.push("static surface must show final state");
  }

  if ((model.panels?.blockedItems || []).length > 0 && !html.includes("SEIS-BLOCKER-001")) {
    failures.push("static surface must expose blocker ids");
  }

  if ((model.panels?.nextActionQueue || []).length > 0 && !html.includes("SEIS-TASK-001")) {
    failures.push("static surface must expose task ids");
  }

  if ((model.panels?.reviewCadence || []).length > 0 && !html.includes("SEIS-REVIEW-001")) {
    failures.push("static surface must expose review cadence ids");
  }

  if (/%\s*complete|aria-valuenow|role="progressbar"/i.test(html)) {
    failures.push("static surface must not render fake progress bars or percentages");
  }

  return failures;
}

function readJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required source: ${relativePath}`);
  }
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (["active", "passed", "accepted", "completed", "validated"].includes(normalized)) {
    return "active";
  }
  if (["blocked", "failed", "critical"].includes(normalized)) {
    return "blocked";
  }
  if (["planned", "partial", "observed", "proposed", "deferred"].includes(normalized)) {
    return "planned";
  }
  return "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
