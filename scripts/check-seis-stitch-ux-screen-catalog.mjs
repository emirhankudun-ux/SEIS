import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const catalogPath = "content/development/seis-stitch-ux-screen-catalog.json";
const requiredSourceFiles = [
  "content/development/seis-source-provenance-intake.json",
  "content/development/seis-five-year-agency-orchestration-contract.json",
  "content/development/seis-mcp-permission-risk-matrix.json",
  "AGENTS.md"
];

const expectedArchives = {
  "stitch-web-based-linux-desktop": {
    archiveName: "stitch_web_based_linux_desktop.zip",
    entryCount: 490,
    screenCount: 162,
    codeHtmlCount: 148,
    designDocCount: 8
  },
  "stitch-yapay-zeka-web-platformu": {
    archiveName: "stitch_yapay_zeka_web_platformu.zip",
    entryCount: 220,
    screenCount: 72,
    codeHtmlCount: 71,
    designDocCount: 1
  }
};

const requiredModuleFamilies = [
  "command-center",
  "ai-core",
  "agent-swarm",
  "apple-shell",
  "security-and-compliance",
  "cloud-and-ssh",
  "data-and-infrastructure",
  "knowledge-and-academy",
  "creative-lab",
  "release-and-marketplace"
];

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readText(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function ensureArray(value, message) {
  ensure(Array.isArray(value), message);
  return Array.isArray(value) ? value : [];
}

function ensureIncludesAll(actualValues, expectedValues, label) {
  const actualSet = new Set(actualValues);
  for (const expected of expectedValues) {
    ensure(actualSet.has(expected), `${label} missing ${expected}`);
  }
}

const catalogText = readText(catalogPath);
ensure(!/\/Users\/[A-Za-z0-9._ -]+/.test(catalogText), "Catalog must not contain machine-local /Users paths.");
ensure(!/(^|[\s"'])~\/[A-Za-z0-9._/-]+/m.test(catalogText), "Catalog must not contain home-directory shorthand paths.");
ensure(!/(sk-[A-Za-z0-9_-]{16,}|BEGIN [A-Z ]*PRIVATE KEY)/.test(catalogText), "Catalog must not contain secret-like values.");

const catalog = readJson(catalogPath);
if (catalog) {
  ensure(catalog.id === "seis-stitch-ux-screen-catalog", "Catalog id must be stable.");
  ensure(catalog.status === "draft-public-safe", "Catalog status must be draft-public-safe.");
  ensure(catalog.visibility === "public-safe", "Catalog visibility must be public-safe.");

  const sourceFiles = Object.values(catalog.sourceOfTruth ?? {});
  ensureIncludesAll(sourceFiles, requiredSourceFiles, "sourceOfTruth");
  for (const relativePath of requiredSourceFiles) {
    ensure(fs.existsSync(path.join(repoRoot, relativePath)), `Source-of-truth file does not exist: ${relativePath}`);
  }

  ensure(catalog.usageBoundary?.originalArchivesMutable === false, "Original archives must remain immutable.");
  ensure(catalog.usageBoundary?.rawArchiveDumpAllowed === false, "Raw archive dump must be blocked.");
  ensure(catalog.usageBoundary?.codeCopyAllowedWithoutReview === false, "Code copy must require review.");
  ensure(catalog.usageBoundary?.selectedAssetsAllowedAfterReview === true, "Selected assets must be allowed only after review.");
  ensure(catalog.usageBoundary?.licenseReviewRequired === true, "License review must be required.");
  ensure(catalog.usageBoundary?.sizeReviewRequired === true, "Size review must be required.");
  ensure(catalog.usageBoundary?.publicSafeReviewRequired === true, "Public-safe review must be required.");

  const archives = ensureArray(catalog.archives, "archives must be an array.");
  ensure(archives.length === 2, "Catalog must contain exactly two Stitch archives.");
  ensureIncludesAll(archives.map((archive) => archive.id), Object.keys(expectedArchives), "archives");

  let totalScreens = 0;
  let totalCodeHtml = 0;
  let totalDesignDocs = 0;

  for (const archive of archives) {
    const expected = expectedArchives[archive.id];
    if (!expected) continue;

    ensure(archive.archiveName === expected.archiveName, `Archive ${archive.id} name must match.`);
    ensure(archive.observedFromZipListing === true, `Archive ${archive.id} must be observed from zip listing.`);
    ensure(archive.entryCount === expected.entryCount, `Archive ${archive.id} entry count must match observed listing.`);
    ensure(archive.screenCount === expected.screenCount, `Archive ${archive.id} screen count must match observed listing.`);
    ensure(archive.codeHtmlCount === expected.codeHtmlCount, `Archive ${archive.id} code.html count must match observed listing.`);
    ensure(archive.designDocCount === expected.designDocCount, `Archive ${archive.id} design doc count must match observed listing.`);
    ensure(Array.isArray(archive.primarySignals) && archive.primarySignals.length >= 8, `Archive ${archive.id} must include primary signals.`);
    ensure(Array.isArray(archive.representativeScreens) && archive.representativeScreens.length >= 20, `Archive ${archive.id} must include representative screens.`);
    ensure(typeof archive.categoryCounts === "object" && archive.categoryCounts !== null, `Archive ${archive.id} must include category counts.`);

    totalScreens += archive.screenCount;
    totalCodeHtml += archive.codeHtmlCount;
    totalDesignDocs += archive.designDocCount;
  }

  ensure(totalScreens === 234, "Catalog total screen count must be 234.");
  ensure(totalCodeHtml === 219, "Catalog total code.html count must be 219.");
  ensure(totalDesignDocs === 9, "Catalog total design doc count must be 9.");

  const families = ensureArray(catalog.moduleFamilies, "moduleFamilies must be an array.");
  ensure(families.length >= requiredModuleFamilies.length, "Catalog must include all required module families.");
  ensureIncludesAll(families.map((family) => family.id), requiredModuleFamilies, "moduleFamilies");
  for (const family of families) {
    ensure(typeof family.label === "string" && family.label.length > 0, `Module family ${family.id} must have a label.`);
    ensure(Array.isArray(family.sourceSignals) && family.sourceSignals.length >= 3, `Module family ${family.id} must include at least three source signals.`);
    ensure(typeof family.seisUse === "string" && family.seisUse.length > 0, `Module family ${family.id} must define SEIS use.`);
    ensure(typeof family.priority === "string" && family.priority.length > 0, `Module family ${family.id} must define priority.`);
    ensure(typeof family.allowedNextStep === "string" && family.allowedNextStep.length > 0, `Module family ${family.id} must define an allowed next step.`);
  }

  const stages = ensureArray(catalog.adoptionStages, "adoptionStages must be an array.");
  ensureIncludesAll(stages.map((stage) => stage.id), ["catalog-only", "design-review", "public-safe-asset-selection", "seis-native-adaptation"], "adoptionStages");

  const qualityGates = ensureArray(catalog.qualityGates, "qualityGates must be an array.");
  ensure(qualityGates.length >= 8, "Catalog must include practical quality gates.");
  ensure(qualityGates.some((gate) => gate.includes("Original zip archives remain unchanged")), "Quality gates must preserve original archives.");
  ensure(qualityGates.some((gate) => gate.includes("Raw HTML is not imported")), "Quality gates must block raw HTML import.");
  ensure(qualityGates.some((gate) => gate.includes("license")), "Quality gates must require license review.");
}

if (failures.length > 0) {
  console.error("SEIS Stitch UX screen catalog check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS Stitch UX screen catalog check passed.");
