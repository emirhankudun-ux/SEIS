import { existsSync, readFileSync } from "node:fs";

const proposalPath = "content/case-studies/detail-route-proposal.json";
const documentPath = "docs/architecture/case-study-detail-route-proposal.md";
const modelPath = "content/case-studies/detail-model.json";
const qualityReviewPath = "content/case-studies/content-quality-review.json";

const failures = [];

for (const path of [proposalPath, documentPath, modelPath, qualityReviewPath]) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
  }
}

const proposal = existsSync(proposalPath)
  ? JSON.parse(readFileSync(proposalPath, "utf8"))
  : null;
const documentText = existsSync(documentPath)
  ? readFileSync(documentPath, "utf8")
  : "";
const model = existsSync(modelPath)
  ? JSON.parse(readFileSync(modelPath, "utf8"))
  : null;
const qualityReview = existsSync(qualityReviewPath)
  ? JSON.parse(readFileSync(qualityReviewPath, "utf8"))
  : null;

if (proposal) {
  if (proposal.mode !== "framework-neutral-route-planning") {
    failures.push("detail route proposal must remain framework-neutral");
  }

  if (proposal.routeShape?.staticPathPattern !== "case-studies/{id}.html") {
    failures.push("detail route proposal must define the static path pattern");
  }

  if ((proposal.layoutContract || []).length < 4) {
    failures.push("detail route proposal must define at least four layout regions");
  }

  if ((proposal.accessibilityContract || []).length < 4) {
    failures.push("detail route proposal must define accessibility expectations");
  }

  if (!String(proposal.rollbackPath || "").includes("portable JSON")) {
    failures.push("detail route proposal must preserve a portable JSON rollback path");
  }
}

if (!model?.caseStudies?.some(item => item.id === proposal?.routeShape?.initialCaseStudyId)) {
  failures.push("detail route proposal initial case study must exist in the model");
}

if (qualityReview?.requiredBeforeDetailRoute !== true) {
  failures.push("content quality review must stay required before detail routes");
}

for (const requiredText of [
  "Case Study Detail Route Proposal",
  "Route Shape",
  "Accessibility Contract",
  "Blocked Until",
  "Rollback Path"
]) {
  if (!documentText.includes(requiredText)) {
    failures.push(`missing "${requiredText}" in ${documentPath}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS case study detail route proposal check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS case study detail route proposal check passed.");
