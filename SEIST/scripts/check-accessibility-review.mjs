import { existsSync, readFileSync } from "node:fs";

const registryPath = "content/lab/accessibility-review.json";
const documentPath = "docs/quality/manual-accessibility-review.md";
const motionStylesPath = "apps/web/src/styles/motion.css";
const localePath = "apps/web/src/i18n/locales.js";

const failures = [];

for (const path of [registryPath, documentPath]) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
  }
}

const registry = existsSync(registryPath)
  ? JSON.parse(readFileSync(registryPath, "utf8"))
  : null;
const documentText = existsSync(documentPath)
  ? readFileSync(documentPath, "utf8")
  : "";
const motionStyles = existsSync(motionStylesPath)
  ? readFileSync(motionStylesPath, "utf8")
  : "";
const locales = existsSync(localePath)
  ? readFileSync(localePath, "utf8")
  : "";

if (registry) {
  if (registry.requiredBeforeRelease !== true) {
    failures.push("accessibility review must be required before release");
  }

  const areas = registry.reviewAreas || [];
  if (areas.length < 5) {
    failures.push("accessibility review must cover at least five areas");
  }

  const areaIds = new Set(areas.map(area => area.id));
  for (const requiredArea of ["keyboard", "motion", "language", "cognitive-load", "responsive"]) {
    if (!areaIds.has(requiredArea)) {
      failures.push(`accessibility review missing area: ${requiredArea}`);
    }
  }

  if ((registry.releaseBlockers || []).length < 5) {
    failures.push("accessibility review must name release blockers");
  }

  const evidenceTemplate = registry.reviewEvidenceTemplate || {};
  const requiredEvidenceFields = new Set(evidenceTemplate.requiredFields || []);
  for (const field of [
    "reviewDate",
    "reviewer",
    "viewportCoverage",
    "keyboardResult",
    "motionResult",
    "languageDirectionResult",
    "blockers",
    "releaseDecision"
  ]) {
    if (!requiredEvidenceFields.has(field)) {
      failures.push(`accessibility review evidence template missing field: ${field}`);
    }
  }

  const acceptedDecisions = new Set(evidenceTemplate.acceptedReleaseDecisions || []);
  for (const decision of ["blocked", "approved-for-local-demo", "approved-for-server-upload"]) {
    if (!acceptedDecisions.has(decision)) {
      failures.push(`accessibility review evidence template missing release decision: ${decision}`);
    }
  }

  const viewportCoverage = new Set(evidenceTemplate.minimumViewportCoverage || []);
  for (const viewport of ["mobile", "tablet", "desktop"]) {
    if (!viewportCoverage.has(viewport)) {
      failures.push(`accessibility review evidence template missing viewport: ${viewport}`);
    }
  }
}

for (const requiredText of [
  "Manual Accessibility Review",
  "Keyboard and focus",
  "Motion comfort",
  "Release Blockers",
  "Evidence Template",
  "approved-for-server-upload",
  "Arabic"
]) {
  if (!documentText.includes(requiredText)) {
    failures.push(`missing "${requiredText}" in ${documentPath}`);
  }
}

if (!motionStyles.includes("prefers-reduced-motion")) {
  failures.push("motion styles must include prefers-reduced-motion support");
}

if (!locales.includes("ar: \"rtl\"")) {
  failures.push("locale configuration must keep Arabic rtl support");
}

if (failures.length > 0) {
  console.error("SEIS accessibility review check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS accessibility review check passed.");
