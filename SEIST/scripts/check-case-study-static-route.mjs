import { existsSync, readFileSync } from "node:fs";

const routePath = "apps/web/case-studies/seis-foundation.html";
const stylePath = "apps/web/case-studies/case-study.css";
const proposalPath = "content/case-studies/detail-route-proposal.json";
const modelPath = "content/case-studies/detail-model.json";

const failures = [];

for (const path of [routePath, stylePath, proposalPath, modelPath]) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
  }
}

const route = existsSync(routePath) ? readFileSync(routePath, "utf8") : "";
const proposal = existsSync(proposalPath)
  ? JSON.parse(readFileSync(proposalPath, "utf8"))
  : null;
const model = existsSync(modelPath)
  ? JSON.parse(readFileSync(modelPath, "utf8"))
  : null;

for (const requiredText of [
  "SEIS Foundation",
  "Editorial Narrative",
  "Accessibility Notes",
  "Search Metadata",
  "Quality Path",
  "Skip to content",
  "real HTML text"
]) {
  if (!route.includes(requiredText)) {
    failures.push(`missing "${requiredText}" in ${routePath}`);
  }
}

if (!route.includes('href="../../../packages/design-tokens/seis.tokens.css"')) {
  failures.push("case study route must use source design tokens before packaging rewrite");
}

if (proposal?.routeShape?.initialCaseStudyId !== "seis-foundation") {
  failures.push("case study static route must match proposal initial case study");
}

const initialCaseStudy = (model?.caseStudies || []).find(item => item.id === proposal?.routeShape?.initialCaseStudyId);
if (!initialCaseStudy) {
  failures.push("case study static route must map to a detail model case study");
} else {
  for (const value of [
    initialCaseStudy.title,
    initialCaseStudy.summary,
    initialCaseStudy.narrative?.context,
    initialCaseStudy.narrative?.challenge,
    initialCaseStudy.narrative?.response,
    initialCaseStudy.narrative?.nextStep
  ]) {
    if (value && !route.includes(value)) {
      failures.push(`case study route missing model text: ${value}`);
    }
  }

  for (const note of initialCaseStudy.accessibilityNotes || []) {
    if (!route.includes(note)) {
      failures.push(`case study route missing accessibility note: ${note}`);
    }
  }

  for (const command of initialCaseStudy.qualityProof || []) {
    if (!route.includes(command)) {
      failures.push(`case study route missing quality proof: ${command}`);
    }
  }

  if (!route.includes(initialCaseStudy.searchMetadata?.canonicalTheme || "")) {
    failures.push("case study route missing canonical search theme");
  }
}

if (failures.length > 0) {
  console.error("SEIS case study static route check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS case study static route check passed.");
