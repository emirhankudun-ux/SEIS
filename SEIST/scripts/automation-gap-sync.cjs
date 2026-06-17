const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { getPublishReadinessState } = require("./lib/publish-readiness-state.cjs");

const ROOT = process.cwd();
const GAP_FILE = path.join(ROOT, "data", "gap-closure-register.json");

function run(command, args) {
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8"
  });
}

function isOk(result) {
  return result && result.status === 0;
}

function trimmed(stdout) {
  return String(stdout || "").trim();
}

function updateGap(gap, state) {
  const next = { ...gap };

  if (gap.id === "workspace-git-init") {
    next.status = state.gitInside ? "ready" : "blocked";
    next.nextAction = state.gitInside
      ? "Keep branch policy visible and preserve non-destructive publish flow."
      : "Initialize or attach this workspace to the intended repository root.";
    return next;
  }

  if (gap.id === "publish-auth") {
    next.status = state.publishReady ? "ready" : "blocked";
    next.nextAction = state.publishReady
      ? "Run bounded publish preflight and push only intended changes."
      : state.publishNextAction;
    return next;
  }

  if (gap.id === "accessibility-coverage") {
    next.status = state.workspaceCheckOk ? "ready" : "watch";
    next.nextAction = state.workspaceCheckOk
      ? "Keep reduced-motion checks active in every workspace quality pass."
      : "Fix workspace check failures before adding motion-heavy changes.";
    return next;
  }

  if (gap.id === "release-refresh") {
    next.status = state.releaseSyncOk ? "ready" : "watch";
    next.nextAction = state.releaseSyncOk
      ? "Refresh release folder only after source changes."
      : "Run npm run automation:refresh-release to remove source/release drift.";
    return next;
  }

  if (gap.id === "motion-evidence") {
    next.status = state.motionEvidenceOk ? "ready" : "watch";
    next.nextAction = state.motionEvidenceOk
      ? "Keep motion evidence checks active before adding heavier cinematic layers."
      : "Fix motion evidence check failures before expanding cinematic behavior.";
    next.closureMetric = "Static motion evidence verifies reduced-motion, balanced, and cinematic hooks.";
    next.qualityCommands = ["npm run check:motion-evidence"];
    return next;
  }

  if (gap.id === "mobile-ergonomics") {
    next.status = state.mobileErgonomicsOk ? "ready" : "watch";
    next.nextAction = state.mobileErgonomicsOk
      ? "Keep mobile ergonomics checks active before adding denser sections."
      : "Fix mobile ergonomics check failures before adding new controls.";
    next.closureMetric = "Static mobile ergonomics verifies breakpoint, wrapping, touch sizing, and overflow guards.";
    next.qualityCommands = ["npm run check:mobile-ergonomics"];
    return next;
  }

  return next;
}

function summarize(gaps, prevSummary) {
  const counts = { ready: 0, watch: 0, blocked: 0 };
  for (const gap of gaps) {
    if (gap.status in counts) counts[gap.status] += 1;
  }
  return {
    ...prevSummary,
    gaps: gaps.length,
    ready: counts.ready,
    watch: counts.watch,
    blocked: counts.blocked
  };
}

if (!fs.existsSync(GAP_FILE)) {
  console.error(`Gap register missing: ${GAP_FILE}`);
  process.exit(1);
}

const publishState = getPublishReadinessState(ROOT);
const gitInside = publishState.gitInside;
const publishReady = publishState.ready;
const publishNextAction = publishState.ready
  ? "Run bounded publish preflight and push only intended changes."
  : `${publishState.action.charAt(0).toUpperCase()}${publishState.action.slice(1)}.`;
const workspaceCheckOk = isOk(run("node", ["scripts/check-workspace.cjs"]));
const releaseSyncOk = isOk(run("node", ["scripts/check-release-sync.cjs"]));
const motionEvidenceOk = isOk(run("node", ["scripts/check-motion-evidence.cjs"]));
const mobileErgonomicsOk = isOk(run("node", ["scripts/check-mobile-ergonomics.cjs"]));

const state = {
  gitInside,
  publishReady,
  publishNextAction,
  workspaceCheckOk,
  releaseSyncOk,
  motionEvidenceOk,
  mobileErgonomicsOk
};

const payload = JSON.parse(fs.readFileSync(GAP_FILE, "utf8"));
const nextGaps = payload.gaps.map((gap) => updateGap(gap, state));
const nextSummary = summarize(nextGaps, payload.summary || {});
const nextPayload = { ...payload, summary: nextSummary, gaps: nextGaps };

fs.writeFileSync(GAP_FILE, `${JSON.stringify(nextPayload, null, 2)}\n`);

console.log("Gap register synchronized.");
console.log(
  `- summary: ready=${nextSummary.ready}, watch=${nextSummary.watch}, blocked=${nextSummary.blocked}`
);
console.log(`- git: ${gitInside ? "connected" : "missing"}`);
console.log(`- publish: ${publishReady ? "ready" : "blocked"}`);
