#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const HELP_MODE = process.argv.includes("--help") || process.argv.includes("-h");
const SOURCE_PATH = "content/development/seis-command-center-shell.json";
const OUTPUT_PATH = "apps/command-center/index.html";
const allowedStatuses = new Set(["active", "planned", "blocked"]);
const allowedPriorities = new Set(["P0 critical", "P1 high", "P2 medium", "P3 low", "P4 future"]);

if (HELP_MODE) {
  console.log(`SEIS Command Center Shell

Commands:
  node scripts/create-command-center-shell.mjs
  node scripts/create-command-center-shell.mjs --check

Builds the static non-LLM Command Center shell from the local shell contract.
`);
  process.exit(0);
}

const shell = readJson(SOURCE_PATH);
const failures = validateShell(shell);

if (failures.length > 0) {
  console.error("SEIS Command Center shell source is invalid:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const html = buildHtml(shell);
const htmlFailures = validateHtml(html, shell);

if (htmlFailures.length > 0) {
  console.error("SEIS Command Center shell output is invalid:");
  for (const failure of htmlFailures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const outputPath = path.join(ROOT, OUTPUT_PATH);

if (CHECK_MODE) {
  if (!existsSync(outputPath)) {
    console.error(`SEIS Command Center shell check failed: missing ${OUTPUT_PATH}`);
    process.exit(1);
  }

  const current = readFileSync(outputPath, "utf8");
  if (current !== html) {
    console.error(`SEIS Command Center shell check failed: stale ${OUTPUT_PATH}`);
    console.error("Run: npm run automation:command-center-shell");
    process.exit(1);
  }

  console.log("SEIS Command Center shell check passed.");
  process.exit(0);
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html, "utf8");
console.log(`SEIS Command Center shell written: ${OUTPUT_PATH}`);

function readJson(file) {
  return JSON.parse(readFileSync(path.join(ROOT, file), "utf8"));
}

function validateShell(shell) {
  const failures = [];

  if (shell.schemaVersion !== 1) {
    failures.push("schemaVersion must be 1");
  }

  if (shell.mode !== "non_llm_command_center_shell") {
    failures.push("mode must be non_llm_command_center_shell");
  }

  if (shell.finalState !== "blocked_by_repository_hygiene") {
    failures.push("finalState must keep repository hygiene blocker visible");
  }

  for (const field of ["id", "updated", "sourceRecords", "principles", "summary", "modules", "guardrails"]) {
    if (!(field in shell)) {
      failures.push(`missing field: ${field}`);
    }
  }

  for (const source of shell.sourceRecords || []) {
    validateRelativePath(failures, "sourceRecords", source);
  }

  if (!Array.isArray(shell.modules) || shell.modules.length < 8) {
    failures.push("modules must include at least 8 Command Center modules");
  }

  const moduleIds = new Set();
  for (const module of shell.modules || []) {
    const label = module.id || "(missing module id)";
    for (const field of ["id", "title", "status", "priority", "href", "description", "evidenceIds", "relatedPaths", "nextAction"]) {
      if (!(field in module)) {
        failures.push(`${label} missing field: ${field}`);
      }
    }

    if (moduleIds.has(module.id)) {
      failures.push(`duplicate module id: ${module.id}`);
    }
    moduleIds.add(module.id);

    if (!/^[a-z0-9-]+$/.test(module.id || "")) {
      failures.push(`${label} id must be lowercase kebab-case`);
    }

    if (!allowedStatuses.has(module.status)) {
      failures.push(`${label} invalid status: ${module.status}`);
    }

    if (!allowedPriorities.has(module.priority)) {
      failures.push(`${label} invalid priority: ${module.priority}`);
    }

    if (!Array.isArray(module.evidenceIds) || module.evidenceIds.length === 0) {
      failures.push(`${label} evidenceIds must be a non-empty array`);
    }

    for (const evidenceId of module.evidenceIds || []) {
      if (!/^SEIS-EVID-\d{3}$/.test(evidenceId)) {
        failures.push(`${label} invalid evidence id: ${evidenceId}`);
      }
    }

    if (!Array.isArray(module.relatedPaths) || module.relatedPaths.length === 0) {
      failures.push(`${label} relatedPaths must be a non-empty array`);
    }

    for (const relatedPath of module.relatedPaths || []) {
      validateRelativePath(failures, `${label} relatedPaths`, relatedPath);
    }

    for (const [field, value] of Object.entries({
      title: module.title,
      description: module.description,
      nextAction: module.nextAction
    })) {
      validateSafeText(failures, label, field, value);
    }
  }

  for (const required of ["command-center-goals", "repository-hygiene", "roadmap-center", "evidence-locker", "approval-center", "readiness-center"]) {
    if (!moduleIds.has(required)) {
      failures.push(`missing required module: ${required}`);
    }
  }

  if (!shell.modules?.some((module) => module.status === "blocked")) {
    failures.push("at least one blocked module must remain visible");
  }

  if (!Array.isArray(shell.guardrails) || shell.guardrails.length < 4) {
    failures.push("guardrails must include at least 4 records");
  }

  return failures;
}

function validateRelativePath(failures, label, value) {
  if (typeof value !== "string" || value.length === 0) {
    failures.push(`${label} contains an empty path`);
    return;
  }

  if (value.startsWith("/") || value.includes("://") || value.includes("..\\") || value.includes("\\\\")) {
    failures.push(`${label} must use repo-relative paths only: ${value}`);
    return;
  }

  if (!existsSync(path.join(ROOT, value))) {
    failures.push(`${label} points to missing path: ${value}`);
  }
}

function validateSafeText(failures, label, field, value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    failures.push(`${label} ${field} must be a non-empty string`);
    return;
  }

  if (/\/Users\//i.test(value) || /file:\/\//i.test(value) || /vscode:\/\//i.test(value) || /-----BEGIN [A-Z0-9 ]*KEY-----/i.test(value)) {
    failures.push(`${label} ${field} contains private-path or sensitive-looking text`);
  }
}

function validateHtml(html, shell) {
  const failures = [];
  const requiredText = [
    "data-seis-command-center-shell",
    "SEIS Command Center",
    "Goal Tracking Center",
    "Repository Hygiene",
    "Roadmap Center",
    "Evidence Locker",
    "Approval Center",
    "Release And Public Readiness",
    "No External Actions",
    "blocked_by_repository_hygiene"
  ];

  for (const text of requiredText) {
    if (!html.includes(escapeHtml(text))) {
      failures.push(`shell HTML missing: ${text}`);
    }
  }

  for (const module of shell.modules || []) {
    if (!html.includes(`id="${escapeHtml(module.id)}"`)) {
      failures.push(`shell HTML missing module id: ${module.id}`);
    }
  }

  if (/role="progressbar"|aria-valuenow|%\s*complete/i.test(html)) {
    failures.push("shell HTML must not render fake progress bars or percentages");
  }

  return failures;
}

function buildHtml(shell) {
  const modules = shell.modules || [];
  const guardrails = shell.guardrails || [];
  const summary = shell.summary || {};
  const activeCount = modules.filter((module) => module.status === "active").length;
  const plannedCount = modules.filter((module) => module.status === "planned").length;
  const blockedCount = modules.filter((module) => module.status === "blocked").length;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${escapeHtml(summary.title || "SEIS Command Center")}</title>
  <style>
    :root {
      --bg: #f5f4f0;
      --ink: #202326;
      --muted: #626b72;
      --line: #d8ddd7;
      --panel: #ffffff;
      --panel-soft: #f9faf7;
      --dark: #111315;
      --dark-line: #2a302e;
      --green: #247a4f;
      --amber: #9a6500;
      --red: #be3d38;
      --blue: #2f6fed;
      --violet: #6f58d9;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      color: var(--ink);
      background: var(--bg);
      font-size: 14px;
      line-height: 1.45;
    }

    a { color: inherit; }

    .shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 248px minmax(0, 1fr);
    }

    .sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: auto;
      padding: 20px 16px;
      background: var(--dark);
      color: #f5f3ee;
      border-right: 1px solid var(--dark-line);
    }

    .brand { display: grid; gap: 4px; margin-bottom: 24px; }
    .brand strong { font-size: 15px; font-weight: 680; }
    .brand span, .eyebrow, .meta, .card-label { color: var(--muted); font-size: 12px; }
    .sidebar .brand span, .sidebar .meta { color: #aeb7b2; }

    .nav { display: grid; gap: 6px; }
    .nav a {
      color: #cbd1cd;
      text-decoration: none;
      padding: 8px 10px;
      border-radius: 8px;
    }
    .nav a:hover, .nav a:focus-visible {
      color: #fff;
      background: #242928;
      outline: 2px solid transparent;
    }

    .main { min-width: 0; padding: 24px; }

    .topbar {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 30px; line-height: 1.12; font-weight: 700; }
    h2 { font-size: 16px; margin-bottom: 12px; }
    h3 { font-size: 14px; font-weight: 650; }

    .lede { max-width: 760px; margin-top: 8px; color: var(--muted); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .button {
      display: inline-flex;
      align-items: center;
      min-height: 34px;
      border-radius: 8px;
      padding: 6px 11px;
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--ink);
      text-decoration: none;
      font-weight: 600;
    }
    .button.primary { background: var(--dark); color: #fff; border-color: var(--dark); }
    .button:focus-visible { outline: 2px solid var(--violet); outline-offset: 2px; }

    .status-strip {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 18px;
    }

    .stat, .module, .guardrail {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
    }

    .stat strong { display: block; font-size: 22px; line-height: 1.1; margin-top: 4px; }

    .section { margin-top: 22px; }
    .module-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .module { display: grid; gap: 10px; min-width: 0; }
    .module-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--line);
      border-radius: 8px;
      min-height: 24px;
      padding: 3px 8px;
      background: var(--panel-soft);
      color: var(--muted);
      font-size: 12px;
      white-space: nowrap;
    }
    .badge::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--muted);
    }
    .badge.active::before { background: var(--green); }
    .badge.planned::before { background: var(--amber); }
    .badge.blocked::before { background: var(--red); }

    .module p, .guardrail p { color: var(--muted); }
    .module-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
    }
    .module a.open { color: var(--blue); font-weight: 650; text-decoration: none; }
    .module a.open:focus-visible { outline: 2px solid var(--violet); outline-offset: 2px; }

    .evidence {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      color: var(--muted);
      font-size: 12px;
    }

    .guardrail-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    @media (max-width: 900px) {
      .shell { grid-template-columns: 1fr; }
      .sidebar { position: relative; height: auto; }
      .status-strip, .module-grid, .guardrail-grid { grid-template-columns: 1fr; }
      h1 { font-size: 25px; }
    }
  </style>
</head>
<body>
  <div class="shell" data-seis-command-center-shell="${escapeHtml(shell.id)}" data-final-state="${escapeHtml(shell.finalState)}">
    <aside class="sidebar" aria-label="Command Center navigation">
      <div class="brand">
        <strong>SEIS Command Center</strong>
        <span>Non-LLM platform shell</span>
      </div>
      <nav class="nav" aria-label="Modules">
        ${modules.map((module) => `<a href="#${escapeHtml(module.id)}">${escapeHtml(module.title)}</a>`).join("\n        ")}
      </nav>
      <p class="meta" style="margin-top: 22px;">Updated ${escapeHtml(shell.updated)}</p>
    </aside>
    <main class="main">
      <div class="topbar">
        <div>
          <p class="eyebrow">SEIS Platform OS</p>
          <h1>${escapeHtml(summary.title || "SEIS Command Center")}</h1>
          <p class="lede">${escapeHtml(summary.subtitle || "")}</p>
        </div>
        <div class="actions" aria-label="Primary actions">
          <a class="button primary" href="${escapeHtml(summary.primaryActionHref)}">${escapeHtml(summary.primaryActionLabel)}</a>
          <a class="button" href="${escapeHtml(summary.secondaryActionHref)}">${escapeHtml(summary.secondaryActionLabel)}</a>
        </div>
      </div>

      <section class="status-strip" aria-label="Command Center status">
        ${renderStat("Final state", shell.finalState)}
        ${renderStat("Active modules", activeCount)}
        ${renderStat("Planned modules", plannedCount)}
        ${renderStat("Blocked modules", blockedCount)}
      </section>

      <section class="section" aria-labelledby="modules-title">
        <h2 id="modules-title">Modules</h2>
        <div class="module-grid">
          ${modules.map(renderModule).join("\n          ")}
        </div>
      </section>

      <section class="section" aria-labelledby="guardrails-title">
        <h2 id="guardrails-title">Guardrails</h2>
        <div class="guardrail-grid">
          ${guardrails.map(renderGuardrail).join("\n          ")}
        </div>
      </section>

      <section class="section" aria-labelledby="next-safe-action">
        <h2 id="next-safe-action">Next Safe Action</h2>
        <div class="stat">
          <p>${escapeHtml(summary.nextSafeAction || "")}</p>
        </div>
      </section>
    </main>
  </div>
</body>
</html>
`;
}

function renderStat(label, value) {
  return `<div class="stat">
          <span class="card-label">${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </div>`;
}

function renderModule(module) {
  return `<article class="module" id="${escapeHtml(module.id)}">
            <div class="module-header">
              <div>
                <p class="eyebrow">${escapeHtml(module.priority)}</p>
                <h3>${escapeHtml(module.title)}</h3>
              </div>
              <span class="badge ${escapeHtml(module.status)}">${escapeHtml(module.status)}</span>
            </div>
            <p>${escapeHtml(module.description)}</p>
            <div class="evidence" aria-label="Evidence records">
              ${(module.evidenceIds || []).map((id) => `<span>${escapeHtml(id)}</span>`).join("")}
            </div>
            <p><strong>Next:</strong> ${escapeHtml(module.nextAction)}</p>
            <div class="module-footer">
              <a class="open" href="${escapeHtml(module.href)}">Open</a>
            </div>
          </article>`;
}

function renderGuardrail(guardrail) {
  return `<article class="guardrail">
            <p class="eyebrow">${escapeHtml(guardrail.id)}</p>
            <h3>${escapeHtml(guardrail.title)}</h3>
            <p>${escapeHtml(guardrail.description)}</p>
          </article>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
