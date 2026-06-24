import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RECORD_PATH = path.join(ROOT, "content", "development", "seis-universe-omega-goal-system.json");
const PHASE_EVIDENCE_PATH = path.join(ROOT, "content", "development", "seis-universe-omega-phase-evidence.json");
const DOC_PATH = path.join(ROOT, "docs", "goals", "seis-universe-omega-goal-system.md");
const PHASE_EVIDENCE_DOC_PATH = path.join(ROOT, "docs", "goals", "seis-universe-omega-phase-evidence.md");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const failures = [];

const expectedPhases = [
  "Foundation Layer",
  "AI Core",
  "Memory System",
  "Knowledge Graph",
  "Agent Civilization",
  "Agent Governance",
  "Plugin Ecosystem",
  "SSH and Infrastructure",
  "Command Center",
  "Goal Execution Engine",
  "Design Intelligence",
  "Creative Studio",
  "Research Lab",
  "Product Factory",
  "Business Engine",
  "Security Center",
  "Observability Grid",
  "Simulation Engine",
  "Self Improvement",
  "Learning Engine",
  "World Model",
  "Economic Engine",
  "Organization System",
  "Personal OS"
];

const requiredCapabilityTerms = [
  "Core Backend",
  "Model Router",
  "Memory Retrieval",
  "Goal Graph",
  "CEO Agent",
  "Agent Permissions",
  "Plugin Validation",
  "SSH Profiles",
  "Goal Status",
  "KPI Tracking",
  "Typography Systems",
  "3D",
  "Market Research",
  "Website Builder",
  "Investor Readiness",
  "Threat Analysis",
  "Agent Monitoring",
  "Organization Twin",
  "Architecture Evolution",
  "Knowledge Synthesis",
  "Technology Landscape",
  "Token Costs",
  "Operations",
  "Habit Tracking"
];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`Cannot read ${path.relative(ROOT, filePath)}: ${error.message}`);
    return null;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`Cannot read ${path.relative(ROOT, filePath)}: ${error.message}`);
    return "";
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

const record = readJson(RECORD_PATH);
const phaseEvidence = readJson(PHASE_EVIDENCE_PATH);
const doc = readText(DOC_PATH);
const phaseEvidenceDoc = readText(PHASE_EVIDENCE_DOC_PATH);
const packageJson = readJson(PACKAGE_PATH);

if (record) {
  ensure(record.schemaVersion === 1, "Omega record schemaVersion must be 1");
  ensure(record.id === "seis-universe-omega-goal-system", "Omega record id is invalid");
  ensure(record.status === "documented", "Omega record must stay documented until runtime evidence exists");
  ensure(record.objectiveStatus === "ACTIVE", "Omega objective status must be ACTIVE");
  ensure(record.priority === "MAXIMUM", "Omega priority must be MAXIMUM");
  ensure(record.versionTarget === "SEIS Universe Omega", "Omega version target is invalid");
  ensure(record.coverageSummary?.totalPhases === 24, "Omega coverage summary must declare 24 total phases");
  ensure(record.coverageSummary?.coveredPhases === 24, "Omega coverage summary must cover all 24 phases");
  ensure(record.coverageSummary?.implementedPhases === 0, "Omega record must not claim implemented phases in this pass");
  ensure(record.coverageSummary?.validatedPhases === 0, "Omega record must not claim validated phases in this pass");
  ensure(record.coverageSummary?.completionClaim === false, "Omega record must not claim completion");
  ensure(Array.isArray(record.honestyRules) && record.honestyRules.length >= 5, "Omega record needs honesty rules");
  ensure(Array.isArray(record.phases) && record.phases.length === 24, "Omega record must contain exactly 24 phases");

  const phaseNumbers = new Set();
  const phaseTitles = new Map();
  const capabilityText = JSON.stringify(record.phases || []);

  for (const phase of record.phases || []) {
    const label = phase.id || `(phase ${phase.number || "unknown"})`;
    ensure(Number.isInteger(phase.number) && phase.number >= 1 && phase.number <= 24, `${label} has invalid phase number`);
    ensure(!phaseNumbers.has(phase.number), `duplicate phase number: ${phase.number}`);
    phaseNumbers.add(phase.number);
    phaseTitles.set(phase.number, phase.title);
    ensure(/^omega-phase-\d{2}-[a-z0-9-]+$/.test(phase.id || ""), `${label} id must use omega-phase-00-slug`);
    ensure(["planned", "documented"].includes(phase.status), `${label} status must be planned or documented`);
    ensure(Array.isArray(phase.systems) && phase.systems.length >= 1, `${label} must list systems`);
    ensure(Array.isArray(phase.capabilities) && phase.capabilities.length >= 5, `${label} must list at least five capabilities`);
    ensure(typeof phase.primaryGoalCategory === "string" && phase.primaryGoalCategory.length > 0, `${label} needs a primary goal category`);
    ensure(Array.isArray(phase.evidencePaths) && phase.evidencePaths.length >= 1, `${label} needs evidence paths`);
    ensure(typeof phase.nextSafeAction === "string" && phase.nextSafeAction.length > 24, `${label} needs a next safe action`);
    for (const evidencePath of phase.evidencePaths || []) {
      ensure(!evidencePath.startsWith("/"), `${label} evidence path must be repository-relative: ${evidencePath}`);
    }
  }

  for (let index = 0; index < expectedPhases.length; index += 1) {
    const expectedNumber = index + 1;
    ensure(phaseTitles.get(expectedNumber) === expectedPhases[index], `phase ${expectedNumber} title must be ${expectedPhases[index]}`);
  }

  for (const term of requiredCapabilityTerms) {
    ensure(capabilityText.includes(term), `Omega record missing required capability term: ${term}`);
  }
}

if (phaseEvidence) {
  ensure(phaseEvidence.schemaVersion === 1, "Omega phase evidence schemaVersion must be 1");
  ensure(phaseEvidence.id === "seis-universe-omega-phase-evidence", "Omega phase evidence id is invalid");
  ensure(phaseEvidence.status === "documented", "Omega phase evidence must stay documented until runtime evidence exists");
  ensure(Array.isArray(phaseEvidence.rules) && phaseEvidence.rules.length >= 4, "Omega phase evidence needs rules");
  ensure(Array.isArray(phaseEvidence.phaseEvidence) && phaseEvidence.phaseEvidence.length === 4, "Omega phase evidence must contain exactly Phase 01, Phase 02, Phase 03, and Phase 10 records");

  const evidenceByPhase = new Map((phaseEvidence.phaseEvidence || []).map((item) => [item.phaseNumber, item]));
  for (const phaseNumber of [1, 2, 3, 10]) {
    const item = evidenceByPhase.get(phaseNumber);
    ensure(Boolean(item), `Omega phase evidence missing phase ${phaseNumber}`);
    if (!item) continue;
    ensure(item.status === "documented", `${item.phaseId} evidence must stay documented`);
    ensure(Array.isArray(item.dependencies) && item.dependencies.length >= 3, `${item.phaseId} needs at least three dependencies`);
    ensure(Array.isArray(item.kpis) && item.kpis.length >= 3, `${item.phaseId} needs at least three KPIs`);
    ensure(Array.isArray(item.successMetrics) && item.successMetrics.length >= 2, `${item.phaseId} needs at least two success metrics`);
    ensure(typeof item.nextSafeAction === "string" && item.nextSafeAction.length > 24, `${item.phaseId} needs a next safe action`);

    for (const dependency of item.dependencies || []) {
      ensure(/^OMEGA-P(01|02|03|10)-DEP-\d{3}$/.test(dependency.id || ""), `${item.phaseId} dependency id is invalid: ${dependency.id}`);
      ensure(["partial", "blocked", "planned", "documented"].includes(dependency.status), `${dependency.id} has invalid status`);
      ensure(Array.isArray(dependency.evidencePaths) && dependency.evidencePaths.length >= 1, `${dependency.id} needs evidence paths`);
      for (const evidencePath of dependency.evidencePaths || []) {
        ensure(!evidencePath.startsWith("/"), `${dependency.id} evidence path must be repository-relative`);
      }
    }

    for (const kpi of item.kpis || []) {
      ensure(/^OMEGA-P(01|02|03|10)-KPI-\d{3}$/.test(kpi.id || ""), `${item.phaseId} KPI id is invalid: ${kpi.id}`);
      ensure(typeof kpi.metric === "string" && kpi.metric.length > 0, `${kpi.id} needs a metric`);
      ensure(typeof kpi.target === "string" && kpi.target.length > 0, `${kpi.id} needs a target`);
      ensure(["evidence-collected", "blocked", "planned", "partial"].includes(kpi.status), `${kpi.id} has invalid status`);
    }

    for (const metric of item.successMetrics || []) {
      ensure(/^OMEGA-P(01|02|03|10)-SUCCESS-\d{3}$/.test(metric.id || ""), `${item.phaseId} success metric id is invalid: ${metric.id}`);
      ensure(metric.promotionAllowed === false, `${metric.id} must not allow promotion in this foundation pass`);
      ensure(Array.isArray(metric.requiredEvidence) && metric.requiredEvidence.length >= 1, `${metric.id} needs required evidence`);
    }
  }
}

for (const required of [
  "# SEIS Universe Omega Goal System",
  "24-phase vision",
  "Validation command",
  "Planned phases must not be presented as implemented",
  "Next Safe Action"
]) {
  ensure(doc.includes(required), `Omega doc missing marker: ${required}`);
}

for (const required of [
  "# SEIS Universe Omega Phase Evidence",
  "Phase 01 Foundation Layer",
  "Phase 02 AI Core",
  "Phase 03 Memory System",
  "Phase 10 Goal Execution Engine",
  "Promotion is not allowed",
  "Next Safe Action"
]) {
  ensure(phaseEvidenceDoc.includes(required), `Omega phase evidence doc missing marker: ${required}`);
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-universe-omega-goal-system"] === "node scripts/check-seis-universe-omega-goal-system.mjs",
    "package.json must expose check:seis-universe-omega-goal-system"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-universe-omega-goal-system"),
    "quality:governance must include check:seis-universe-omega-goal-system"
  );
}

if (failures.length) {
  console.error("SEIS Universe Omega goal system check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Universe Omega goal system check passed.");
