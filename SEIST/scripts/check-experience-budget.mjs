import { readFileSync } from "node:fs";

const files = {
  packageJson: "package.json",
  html: "apps/web/index.html",
  motionScript: "apps/web/src/scripts/motion-system.js",
  motionCss: "apps/web/src/styles/motion.css",
  responsiveCss: "apps/web/src/styles/responsive.css",
  budgetDoc: "docs/quality/experience-budget.md"
};

const read = file => readFileSync(file, "utf8");
const packageJson = JSON.parse(read(files.packageJson));
const html = read(files.html);
const motionScript = read(files.motionScript);
const motionCss = read(files.motionCss);
const responsiveCss = read(files.responsiveCss);
const budgetDoc = read(files.budgetDoc);

const failures = [];

if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
  failures.push("runtime foundation should not add production dependencies yet");
}

const requiredChecks = [
  [html, "data-quality-budget", "visible experience budget panel"],
  [html, "data-motion-toggle", "explicit low-motion toggle"],
  [motionScript, "prefers-reduced-motion: reduce", "system reduced-motion query"],
  [motionScript, "window.localStorage.setItem(\"seis-motion-mode\"", "persisted motion mode"],
  [motionScript, "window.innerWidth < 720 ? 1 : 1.4", "capped canvas density"],
  [motionScript, "initTouchFeedback", "mobile touch feedback"],
  [motionCss, "html[data-motion=\"low\"]", "manual low-motion CSS mode"],
  [motionCss, "@media (prefers-reduced-motion: reduce)", "OS reduced-motion CSS fallback"],
  [responsiveCss, "min-height: 44px", "minimum mobile touch target"],
  [budgetDoc, "Promotion Rule", "documented promotion rule"],
  [budgetDoc, "SHA-256", "release hash budget"]
];

for (const [contents, needle, label] of requiredChecks) {
  if (!contents.includes(needle)) {
    failures.push(`missing ${label}: ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS experience budget check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS experience budget check passed.");
