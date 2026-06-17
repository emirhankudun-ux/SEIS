import { existsSync, readFileSync } from "node:fs";

const reviewPath = "content/case-studies/content-quality-review.json";
const documentPath = "docs/quality/case-study-content-quality-review.md";
const modelPath = "content/case-studies/detail-model.json";

const failures = [];

for (const path of [reviewPath, documentPath, modelPath]) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
  }
}

const review = existsSync(reviewPath)
  ? JSON.parse(readFileSync(reviewPath, "utf8"))
  : null;
const documentText = existsSync(documentPath)
  ? readFileSync(documentPath, "utf8")
  : "";
const model = existsSync(modelPath)
  ? JSON.parse(readFileSync(modelPath, "utf8"))
  : null;

if (review) {
  if (review.requiredBeforeDetailRoute !== true) {
    failures.push("content quality review must be required before detail routes");
  }

  const steps = review.reviewSequence || [];
  if (steps.length < 5) {
    failures.push("content quality review must include at least five review steps");
  }

  const stepNames = new Set(steps.map(item => item.step));
  for (const step of ["narrative", "evidence", "accessibility", "search", "rollback"]) {
    if (!stepNames.has(step)) {
      failures.push(`content quality review missing step: ${step}`);
    }
  }

  if ((review.releaseBlockers || []).length < 5) {
    failures.push("content quality review must name release blockers");
  }
}

if (model) {
  for (const item of model.caseStudies || []) {
    if ((item.contentQualityRubric || []).length < 4) {
      failures.push(`case study lacks content quality rubric: ${item.id || "unknown"}`);
    }
  }
}

for (const requiredText of [
  "Case Study Content Quality Review",
  "Review Sequence",
  "Release Blockers",
  "framework",
  "portable JSON"
]) {
  if (!documentText.includes(requiredText)) {
    failures.push(`missing "${requiredText}" in ${documentPath}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS case study content quality review check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS case study content quality review check passed.");
