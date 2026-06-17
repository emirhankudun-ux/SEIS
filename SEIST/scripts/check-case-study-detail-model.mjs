import { existsSync, readFileSync } from "node:fs";

const modelPath = "content/case-studies/detail-model.json";
const documentPath = "docs/strategy/case-study-detail-model.md";
const roadmapPath = "content/lab/long-development-roadmap.json";

const failures = [];

for (const path of [modelPath, documentPath]) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
  }
}

const model = existsSync(modelPath)
  ? JSON.parse(readFileSync(modelPath, "utf8"))
  : null;
const documentText = existsSync(documentPath)
  ? readFileSync(documentPath, "utf8")
  : "";
const roadmap = existsSync(roadmapPath)
  ? JSON.parse(readFileSync(roadmapPath, "utf8"))
  : null;

if (model) {
  if (model.model !== "seis-case-study-detail") {
    failures.push("case study detail model id is incorrect");
  }

  const requiredFields = new Set(model.requiredFields || []);
  for (const field of ["narrative", "experienceMode", "accessibilityNotes", "qualityProof", "searchMetadata", "contentQualityRubric"]) {
    if (!requiredFields.has(field)) {
      failures.push(`case study model missing required field: ${field}`);
    }
  }

  const caseStudies = model.caseStudies || [];
  if (caseStudies.length < 1) {
    failures.push("case study model must include at least one case study");
  }

  for (const item of caseStudies) {
    if (!item.narrative?.context || !item.narrative?.challenge || !item.narrative?.response) {
      failures.push(`case study missing narrative blocks: ${item.id || "unknown"}`);
    }
    if ((item.accessibilityNotes || []).length < 2) {
      failures.push(`case study missing accessibility notes: ${item.id || "unknown"}`);
    }
    if (!(item.qualityProof || []).some(command => command.includes("check:foundation"))) {
      failures.push(`case study missing foundation quality proof: ${item.id || "unknown"}`);
    }
    if ((item.searchMetadata?.keywords || []).length < 4) {
      failures.push(`case study missing search metadata keywords: ${item.id || "unknown"}`);
    }
    if ((item.contentQualityRubric || []).length < 4) {
      failures.push(`case study missing content quality rubric: ${item.id || "unknown"}`);
    }
  }
}

for (const requiredText of [
  "Case Study Detail Model",
  "framework",
  "Accessibility notes",
  "Search metadata",
  "Content quality",
  "No new dependency"
]) {
  if (!documentText.includes(requiredText)) {
    failures.push(`missing "${requiredText}" in ${documentPath}`);
  }
}

const longAction = (roadmap?.nextLongRunActions || []).find(action => action.id === "long-003");
if (!["started", "route_proposed"].includes(longAction?.status)) {
  failures.push("long-003 must stay started or route_proposed while case study detail modeling is underway");
}

if (failures.length > 0) {
  console.error("SEIS case study detail model check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS case study detail model check passed.");
