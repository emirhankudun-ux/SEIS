import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ROADMAP_FILE = path.join(ROOT, "content", "development", "seis-plugin-interface-roadmap.json");
const PACKAGE_FILE = path.join(ROOT, "package.json");
const WEB_APP_FILE = path.join(ROOT, "apps", "web", "app.js");
const WEB_COCKPIT_FILE = path.join(ROOT, "apps", "web", "seis-cockpit.html");
const WEB_STYLE_FILE = path.join(ROOT, "apps", "web", "styles.css");
const QA_FILE = path.join(ROOT, "docs", "reviews", "PLUGIN_INTERFACE_SUITE_QA.md");
const failures = [];

const requiredInterfaceIds = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"];
const requiredYears = ["2026", "2027", "2028", "2029", "2030"];
const requiredPeriods = ["H1", "H2"];
const allowedRisks = new Set(["low", "medium", "high"]);
const allowedStages = new Set([
  "foundation",
  "approval-gated",
  "contract",
  "quality-gates",
  "schema-registry"
]);

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${path.relative(ROOT, file)}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`);
    return null;
  }
}

function assertPathExists(label, relativePath) {
  ensure(!String(relativePath).startsWith("/"), `${label} must use repository-relative path: ${relativePath}`);
  ensure(!String(relativePath).includes(".."), `${label} must not traverse directories: ${relativePath}`);
  ensure(fs.existsSync(path.join(ROOT, relativePath)), `${label} evidence path does not exist: ${relativePath}`);
}

function validateInterface(record) {
  const label = record?.id || "unknown interface";

  ensure(requiredInterfaceIds.includes(record?.id), `${label} is not an allowed interface id`);
  ensure(record?.handle === `@${record?.id}`, `${label} handle must match @${record?.id}`);
  ensure(typeof record?.title === "string" && record.title.length > 0, `${label} title is required`);
  ensure(typeof record?.status === "string" && record.status.length > 0, `${label} status is required`);
  ensure(allowedStages.has(record?.stage), `${label} has unsupported stage: ${record?.stage}`);
  ensure(allowedRisks.has(record?.risk), `${label} has unsupported risk: ${record?.risk}`);
  ensure(typeof record?.purpose === "string" && record.purpose.length >= 30, `${label} purpose must be specific`);
  ensure(typeof record?.currentSurface === "string" && record.currentSurface.length >= 12, `${label} currentSurface is required`);
  ensure(typeof record?.nextAction === "string" && record.nextAction.length >= 20, `${label} nextAction is required`);
  ensure(Array.isArray(record?.evidence) && record.evidence.length > 0, `${label} must include evidence paths`);

  for (const evidencePath of record?.evidence || []) {
    assertPathExists(label, evidencePath);
  }
}

function validateHorizon(record) {
  const label = record?.year || "unknown year";

  ensure(requiredYears.includes(record?.year), `${label} is not in the required five-year horizon`);
  ensure(typeof record?.phase === "string" && record.phase.length > 0, `${label} phase is required`);
  ensure(typeof record?.focus === "string" && record.focus.length >= 30, `${label} focus must be specific`);
  ensure(typeof record?.validation === "string" && record.validation.length >= 20, `${label} validation is required`);
}

function validateDevelopmentProgram(record) {
  const label = record?.year || "unknown program year";

  ensure(requiredYears.includes(record?.year), `${label} is not in the required development program horizon`);
  ensure(typeof record?.theme === "string" && record.theme.length >= 8, `${label} theme is required`);
  ensure(
    typeof record?.operatingPosture === "string" && record.operatingPosture.length >= 25,
    `${label} operatingPosture must be specific`
  );
  ensure(Array.isArray(record?.laneCommitments), `${label} laneCommitments must be an array`);

  const commitmentIds = new Set();
  for (const commitment of record?.laneCommitments || []) {
    const commitmentLabel = `${label}/${commitment?.id || "unknown lane"}`;
    ensure(requiredInterfaceIds.includes(commitment?.id), `${commitmentLabel} is not an allowed interface id`);
    ensure(!commitmentIds.has(commitment?.id), `${label} duplicate lane commitment: ${commitment?.id}`);
    commitmentIds.add(commitment?.id);
    ensure(typeof commitment?.focus === "string" && commitment.focus.length >= 30, `${commitmentLabel} focus is required`);
    ensure(
      typeof commitment?.interfaceOutcome === "string" && commitment.interfaceOutcome.length >= 30,
      `${commitmentLabel} interfaceOutcome is required`
    );
    ensure(
      typeof commitment?.validationGate === "string" && commitment.validationGate.length >= 25,
      `${commitmentLabel} validationGate is required`
    );
  }

  for (const requiredId of requiredInterfaceIds) {
    ensure(commitmentIds.has(requiredId), `${label} missing lane commitment: ${requiredId}`);
  }
}

function validateDevelopmentCadence(cadence) {
  ensure(typeof cadence === "object" && cadence !== null, "developmentCadence must be an object");
  ensure(Array.isArray(cadence?.periods), "developmentCadence.periods must be an array");
  ensure(Array.isArray(cadence?.laneRoutines), "developmentCadence.laneRoutines must be an array");

  const periodIds = new Set();
  for (const period of cadence?.periods || []) {
    const label = period?.id || "unknown period";
    ensure(requiredPeriods.includes(period?.id), `${label} is not an allowed development cadence period`);
    ensure(!periodIds.has(period?.id), `duplicate development cadence period: ${period?.id}`);
    periodIds.add(period?.id);
    ensure(typeof period?.label === "string" && period.label.length >= 4, `${label} label is required`);
    ensure(typeof period?.purpose === "string" && period.purpose.length >= 30, `${label} purpose must be specific`);
    ensure(typeof period?.reviewGate === "string" && period.reviewGate.length >= 30, `${label} reviewGate must be specific`);
  }

  for (const period of requiredPeriods) {
    ensure(periodIds.has(period), `missing development cadence period: ${period}`);
  }

  const routineIds = new Set();
  for (const routine of cadence?.laneRoutines || []) {
    const label = routine?.id || "unknown routine";
    ensure(requiredInterfaceIds.includes(routine?.id), `${label} is not an allowed cadence lane id`);
    ensure(!routineIds.has(routine?.id), `duplicate development cadence lane routine: ${routine?.id}`);
    routineIds.add(routine?.id);
    ensure(typeof routine?.h1 === "string" && routine.h1.length >= 30, `${label} h1 routine must be specific`);
    ensure(typeof routine?.h2 === "string" && routine.h2.length >= 30, `${label} h2 routine must be specific`);
  }

  for (const requiredId of requiredInterfaceIds) {
    ensure(routineIds.has(requiredId), `missing development cadence lane routine: ${requiredId}`);
  }
}

function validateMaturitySignals(signals) {
  ensure(typeof signals === "object" && signals !== null, "maturitySignals must be an object");
  ensure(typeof signals?.headline === "string" && signals.headline.length >= 20, "maturitySignals.headline is required");
  ensure(typeof signals?.posture === "string" && signals.posture.length >= 40, "maturitySignals.posture must be specific");
  ensure(Array.isArray(signals?.markers), "maturitySignals.markers must be an array");
  ensure((signals?.markers || []).length >= 4, "maturitySignals must include at least four markers");

  for (const marker of signals?.markers || []) {
    const label = marker?.label || "unknown maturity marker";
    ensure(typeof marker?.label === "string" && marker.label.length >= 4, `${label} label is required`);
    ensure(String(marker?.value || "").length > 0, `${label} value is required`);
    ensure(typeof marker?.detail === "string" && marker.detail.length >= 20, `${label} detail is required`);
  }
}

function validateInterfaceReadiness(records) {
  ensure(Array.isArray(records), "interfaceReadiness must be an array");
  const ids = new Set();

  for (const record of records || []) {
    const label = record?.id || "unknown readiness record";
    ensure(requiredInterfaceIds.includes(record?.id), `${label} is not an allowed readiness id`);
    ensure(!ids.has(record?.id), `duplicate readiness record: ${record?.id}`);
    ids.add(record?.id);
    ensure(typeof record?.currentMode === "string" && record.currentMode.length >= 10, `${label} currentMode is required`);
    ensure(Array.isArray(record?.allowedActions) && record.allowedActions.length >= 2, `${label} allowedActions must include at least two entries`);
    ensure(Array.isArray(record?.blockedActions) && record.blockedActions.length >= 2, `${label} blockedActions must include at least two entries`);
    ensure(typeof record?.nextReview === "string" && record.nextReview.length >= 6, `${label} nextReview is required`);
    ensure(typeof record?.reviewCadence === "string" && record.reviewCadence.includes("H1/H2"), `${label} reviewCadence must include H1/H2`);
    ensure(typeof record?.evidenceGate === "string" && record.evidenceGate.length >= 25, `${label} evidenceGate is required`);
    ensure(typeof record?.promotionGate === "string" && record.promotionGate.length >= 25, `${label} promotionGate is required`);
  }

  for (const requiredId of requiredInterfaceIds) {
    ensure(ids.has(requiredId), `missing readiness record: ${requiredId}`);
  }
}

const roadmap = readJson(ROADMAP_FILE);
const packageJson = readJson(PACKAGE_FILE);
const packageScripts = new Set(Object.keys(packageJson?.scripts || {}));

if (roadmap) {
  ensure(/^\d{4}-\d{2}-\d{2}$/.test(roadmap.generatedAt || ""), "generatedAt must use YYYY-MM-DD");
  ensure(roadmap.status === "documented-static-interface", "status must remain documented-static-interface");
  ensure(typeof roadmap.summary === "string" && roadmap.summary.includes("@seis"), "summary must name SEIS plugin lanes");
  ensure(Array.isArray(roadmap.interfaces), "interfaces must be an array");
  ensure(Array.isArray(roadmap.fiveYearHorizon), "fiveYearHorizon must be an array");
  ensure(Array.isArray(roadmap.developmentProgram), "developmentProgram must be an array");
  validateDevelopmentCadence(roadmap.developmentCadence);
  validateMaturitySignals(roadmap.maturitySignals);
  validateInterfaceReadiness(roadmap.interfaceReadiness);

  const ids = new Set();
  for (const record of roadmap.interfaces || []) {
    ensure(!ids.has(record?.id), `duplicate interface id: ${record?.id}`);
    ids.add(record?.id);
    validateInterface(record);
  }

  for (const requiredId of requiredInterfaceIds) {
    ensure(ids.has(requiredId), `missing interface lane: ${requiredId}`);
  }

  const years = new Set();
  for (const record of roadmap.fiveYearHorizon || []) {
    ensure(!years.has(record?.year), `duplicate horizon year: ${record?.year}`);
    years.add(record?.year);
    validateHorizon(record);
  }

  for (const requiredYear of requiredYears) {
    ensure(years.has(requiredYear), `missing five-year horizon year: ${requiredYear}`);
  }

  const programYears = new Set();
  for (const record of roadmap.developmentProgram || []) {
    ensure(!programYears.has(record?.year), `duplicate development program year: ${record?.year}`);
    programYears.add(record?.year);
    validateDevelopmentProgram(record);
  }

  for (const requiredYear of requiredYears) {
    ensure(programYears.has(requiredYear), `missing development program year: ${requiredYear}`);
  }
}

ensure(packageScripts.has("check:plugin-interface-roadmap"), "package.json must expose check:plugin-interface-roadmap");
ensure(fs.existsSync(WEB_APP_FILE), "apps/web/app.js must exist");
ensure(fs.existsSync(WEB_COCKPIT_FILE), "apps/web/seis-cockpit.html must exist");
ensure(fs.existsSync(WEB_STYLE_FILE), "apps/web/styles.css must exist");
ensure(fs.existsSync(path.join(ROOT, "apps", "web", "favicon.ico")), "apps/web/favicon.ico must exist as browser fallback.");
ensure(fs.existsSync(path.join(ROOT, "apps", "web", "favicon.svg")), "apps/web/favicon.svg must exist.");
ensure(fs.existsSync(QA_FILE), "docs/reviews/PLUGIN_INTERFACE_SUITE_QA.md must exist");

if (fs.existsSync(WEB_COCKPIT_FILE)) {
  const html = fs.readFileSync(WEB_COCKPIT_FILE, "utf8");
  ensure(html.includes('href="./favicon.svg"'), "web cockpit must link SVG favicon.");
  ensure(html.includes('href="./favicon.ico"'), "web cockpit must link ICO fallback favicon.");
  ensure(html.includes('id="plugin-interfaces"'), "web cockpit must include plugin-interfaces section");
  ensure(html.includes("data-five-year-controls"), "web cockpit must include five-year controls");
  ensure(html.includes("data-five-year-detail"), "web cockpit must include five-year detail");
  ensure(html.includes("data-plugin-interface-coverage"), "web cockpit must include plugin coverage metrics");
  ensure(html.includes("data-plugin-maturity-signals"), "web cockpit must include maturity signals");
  ensure(html.includes("data-plugin-interface-readiness"), "web cockpit must include readiness gates");
  for (const id of requiredInterfaceIds) {
    ensure(html.includes(`data-plugin-interface-tab="${id}"`), `web cockpit missing tab for ${id}`);
  }
}

if (fs.existsSync(WEB_APP_FILE)) {
  const js = fs.readFileSync(WEB_APP_FILE, "utf8");
  ensure(js.includes("loadPluginInterfaces"), "web app must load plugin interface roadmap");
  ensure(js.includes("renderPluginInterfaces"), "web app must render plugin interfaces");
  ensure(js.includes("renderPluginCoverage"), "web app must render plugin coverage metrics");
  ensure(js.includes("renderPluginMaturitySignals"), "web app must render plugin maturity signals");
  ensure(js.includes("renderPluginReadiness"), "web app must render plugin readiness gates");
  ensure(js.includes("setupPluginYearControls"), "web app must wire five-year controls");
  ensure(js.includes("renderPluginDevelopmentProgram"), "web app must render development program");
  ensure(js.includes("data-plugin-period"), "web app must wire development cadence period controls");
  ensure(js.includes("lane-year commitments"), "web app must render lane-year commitment metric");
  ensure(js.includes("live actions"), "web app must render live-action boundary metric");
  ensure(js.includes("seis-plugin-interface-roadmap.json"), "web app must reference plugin roadmap source");
}

if (fs.existsSync(WEB_STYLE_FILE)) {
  const css = fs.readFileSync(WEB_STYLE_FILE, "utf8");
  ensure(css.includes(".plugin-interface-layout"), "web styles must include plugin interface layout");
  ensure(css.includes(".plugin-interface-coverage"), "web styles must include plugin coverage metrics");
  ensure(css.includes(".plugin-maturity-signals"), "web styles must include maturity signals");
  ensure(css.includes(".plugin-interface-readiness"), "web styles must include readiness gates");
  ensure(css.includes(".five-year-grid"), "web styles must include five-year grid");
  ensure(css.includes(".five-year-controls"), "web styles must include five-year controls");
  ensure(css.includes(".five-year-detail"), "web styles must include five-year detail");
  ensure(css.includes(".five-year-period-controls"), "web styles must include cadence period controls");
  ensure(css.includes(".five-year-cadence"), "web styles must include cadence panel");
}

if (fs.existsSync(QA_FILE)) {
  const qa = fs.readFileSync(QA_FILE, "utf8");
  for (const id of requiredInterfaceIds) {
    ensure(qa.includes(`@${id}`), `QA report must mention @${id}`);
  }
  for (const year of requiredYears) {
    ensure(qa.includes(year), `QA report must mention ${year}`);
  }
  for (const period of requiredPeriods) {
    ensure(qa.includes(period), `QA report must mention ${period}`);
  }
  ensure(qa.includes("Mobile overflow"), "QA report must include mobile overflow result");
  ensure(qa.includes("Coverage metrics"), "QA report must include coverage metrics result");
  ensure(qa.includes("25 lane-year commitments"), "QA report must include lane-year coverage");
  ensure(qa.includes("5 readiness gates"), "QA report must include readiness gate coverage");
  ensure(qa.includes("0 live actions"), "QA report must include live-action boundary");
  ensure(qa.includes("Application data HTTP errors"), "QA report must include application data HTTP error result");
  ensure(qa.includes("HTTP Notes"), "QA report must include HTTP notes");
}

if (failures.length > 0) {
  console.error("SEIS plugin interface roadmap check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS plugin interface roadmap check passed.");
