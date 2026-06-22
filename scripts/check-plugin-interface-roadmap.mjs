import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ROADMAP_FILE = path.join(ROOT, "content", "development", "seis-plugin-interface-roadmap.json");
const PACKAGE_FILE = path.join(ROOT, "package.json");
const WEB_APP_FILE = path.join(ROOT, "apps", "web", "app.js");
const WEB_INDEX_FILE = path.join(ROOT, "apps", "web", "index.html");
const WEB_STYLE_FILE = path.join(ROOT, "apps", "web", "styles.css");
const QA_FILE = path.join(ROOT, "docs", "reviews", "PLUGIN_INTERFACE_SUITE_QA.md");
const failures = [];

const requiredInterfaceIds = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"];
const requiredYears = ["2026", "2027", "2028", "2029", "2030"];
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
ensure(fs.existsSync(WEB_INDEX_FILE), "apps/web/index.html must exist");
ensure(fs.existsSync(WEB_STYLE_FILE), "apps/web/styles.css must exist");
ensure(fs.existsSync(QA_FILE), "docs/reviews/PLUGIN_INTERFACE_SUITE_QA.md must exist");

if (fs.existsSync(WEB_INDEX_FILE)) {
  const html = fs.readFileSync(WEB_INDEX_FILE, "utf8");
  ensure(html.includes('id="plugin-interfaces"'), "web index must include plugin-interfaces section");
  ensure(html.includes("data-five-year-controls"), "web index must include five-year controls");
  ensure(html.includes("data-five-year-detail"), "web index must include five-year detail");
  for (const id of requiredInterfaceIds) {
    ensure(html.includes(`data-plugin-interface-tab="${id}"`), `web index missing tab for ${id}`);
  }
}

if (fs.existsSync(WEB_APP_FILE)) {
  const js = fs.readFileSync(WEB_APP_FILE, "utf8");
  ensure(js.includes("loadPluginInterfaces"), "web app must load plugin interface roadmap");
  ensure(js.includes("renderPluginInterfaces"), "web app must render plugin interfaces");
  ensure(js.includes("setupPluginYearControls"), "web app must wire five-year controls");
  ensure(js.includes("renderPluginDevelopmentProgram"), "web app must render development program");
  ensure(js.includes("seis-plugin-interface-roadmap.json"), "web app must reference plugin roadmap source");
}

if (fs.existsSync(WEB_STYLE_FILE)) {
  const css = fs.readFileSync(WEB_STYLE_FILE, "utf8");
  ensure(css.includes(".plugin-interface-layout"), "web styles must include plugin interface layout");
  ensure(css.includes(".five-year-grid"), "web styles must include five-year grid");
  ensure(css.includes(".five-year-controls"), "web styles must include five-year controls");
  ensure(css.includes(".five-year-detail"), "web styles must include five-year detail");
}

if (fs.existsSync(QA_FILE)) {
  const qa = fs.readFileSync(QA_FILE, "utf8");
  for (const id of requiredInterfaceIds) {
    ensure(qa.includes(`@${id}`), `QA report must mention @${id}`);
  }
  for (const year of requiredYears) {
    ensure(qa.includes(year), `QA report must mention ${year}`);
  }
  ensure(qa.includes("Mobile overflow"), "QA report must include mobile overflow result");
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
