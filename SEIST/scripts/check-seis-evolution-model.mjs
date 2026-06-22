import { existsSync, readFileSync } from "node:fs";

const modelPath = "content/development/seis-evolution-model.json";
const docsPath = "docs/strategy/seis-evolution-model.md";
const packagePath = "package.json";
const backlogPath = "content/development/backlog.json";

const failures = [];

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const ensure = (condition, message) => {
  if (!condition) {
    failures.push(message);
  }
};

for (const path of [modelPath, docsPath, packagePath, backlogPath]) {
  ensure(existsSync(path), `missing ${path}`);
}

const model = existsSync(modelPath) ? readJson(modelPath) : null;
const docs = existsSync(docsPath) ? readFileSync(docsPath, "utf8") : "";
const manifest = existsSync(packagePath) ? readJson(packagePath) : null;
const backlog = existsSync(backlogPath) ? readJson(backlogPath) : null;
const backlogIds = new Set((backlog?.items || []).map((item) => item.id));

if (model) {
  ensure(model.id === "seis-evolution-model", "model id must stay stable");
  ensure(model.branch === "UIXAppTTR", "model must target UIXAppTTR");
  ensure(model.mode === "calm-ai-native-evolution", "model mode must stay calm-ai-native-evolution");
  ensure(Array.isArray(model.operatingPrinciples) && model.operatingPrinciples.length >= 5, "model must define at least five operating principles");

  const levels = model.maturityLevels || [];
  ensure(levels.length >= 4, "model must define at least four maturity levels");
  const levelIds = new Set(levels.map((level) => level.id));
  for (const requiredLevel of ["foundation", "experience", "automation", "platform"]) {
    ensure(levelIds.has(requiredLevel), `model missing maturity level: ${requiredLevel}`);
  }

  for (const level of levels) {
    ensure(Number.isInteger(level.level), `maturity level ${level.id || "unknown"} must define a numeric level`);
    ensure(level.name, `maturity level ${level.id || "unknown"} must define a name`);
    ensure(level.intent, `maturity level ${level.id || "unknown"} must define intent`);
    ensure(Array.isArray(level.entrySignals) && level.entrySignals.length >= 3, `maturity level ${level.id || "unknown"} must define entry signals`);
    ensure(Array.isArray(level.exitSignals) && level.exitSignals.length >= 3, `maturity level ${level.id || "unknown"} must define exit signals`);
  }

  const loopPhases = new Set((model.developmentLoop || []).map((phase) => phase.phase));
  for (const requiredPhase of ["sense", "shape", "ship-local", "publish-gated"]) {
    ensure(loopPhases.has(requiredPhase), `development loop missing phase: ${requiredPhase}`);
  }

  const qualityCommands = new Set((model.qualityGates || []).map((gate) => gate.command));
  for (const requiredCommand of [
    "npm run check:seis-evolution-model",
    "npm run check:workspace",
    "node scripts/check-development-process.mjs"
  ]) {
    ensure(qualityCommands.has(requiredCommand), `quality gates missing command: ${requiredCommand}`);
  }

  const rollbackBlocks = model.rollbackPolicy?.blocks || [];
  for (const blockedAction of ["large binary imports", "nested Git repository intake", "automatic deploy without confirmed target"]) {
    ensure(rollbackBlocks.includes(blockedAction), `rollback policy missing block: ${blockedAction}`);
  }

  ensure(model.currentFocus?.status === "active", "model must define an active current focus");
  ensure(Array.isArray(model.currentFocus?.primaryBacklogIds) && model.currentFocus.primaryBacklogIds.length >= 5, "current focus must link at least five backlog ids");
  for (const backlogId of model.currentFocus?.primaryBacklogIds || []) {
    ensure(backlogIds.has(backlogId), `current focus references unknown backlog id: ${backlogId}`);
  }

  const activationQueue = model.activationQueue || [];
  ensure(activationQueue.length >= 5, "model must define at least five activation queue items");
  for (const item of activationQueue) {
    ensure(item.id, "each activation queue item must define id");
    ensure(backlogIds.has(item.backlogId), `activation queue item ${item.id || "unknown"} references unknown backlog id: ${item.backlogId}`);
    ensure(["experience", "governance", "automation", "content", "deployment", "platform"].includes(item.layer), `activation queue item ${item.id || "unknown"} has unsupported layer`);
    ensure(item.nextAction, `activation queue item ${item.id || "unknown"} must define nextAction`);
    ensure(Array.isArray(item.acceptanceCriteria) && item.acceptanceCriteria.length >= 3, `activation queue item ${item.id || "unknown"} must define at least three acceptance criteria`);
    ensure(["lowPowerDefault", "expandedFoundation"].includes(item.validationProfile), `activation queue item ${item.id || "unknown"} must use a known validation profile`);
    ensure(item.rollback, `activation queue item ${item.id || "unknown"} must define rollback`);
  }

  ensure(Array.isArray(model.decisionMatrix) && model.decisionMatrix.length >= 4, "model must define at least four decision matrix routes");
  for (const route of model.decisionMatrix || []) {
    ensure(route.when && route.route && route.avoid, "each decision matrix route must define when, route, and avoid");
  }

  ensure((model.metrics?.preferredSignals || []).length >= 4, "model must define preferred signals");
  ensure((model.metrics?.antiSignals || []).length >= 4, "model must define anti-signals");
}

for (const requiredText of [
  "SEIS Evolution Model",
  "content/development/seis-evolution-model.json",
  "Maturity Levels",
  "Development Loop",
  "npm run check:seis-evolution-model",
  "UIXAppTTR",
  "Activation Queue",
  "Decision Matrix",
  "SEIS-001",
  "evo-001"
]) {
  ensure(docs.includes(requiredText), `docs missing required text: ${requiredText}`);
}

ensure(
  manifest?.scripts?.["check:seis-evolution-model"] === "node scripts/check-seis-evolution-model.mjs",
  "package.json must expose check:seis-evolution-model"
);

if (failures.length > 0) {
  console.error("SEIS evolution model check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS evolution model check passed.");
