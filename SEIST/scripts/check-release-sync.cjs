const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const pairs = [
  ["apps/web/index.html", "release/web/index.html"],
  ["apps/web/styles.css", "release/web/styles.css"],
  ["apps/web/app.js", "release/web/app.js"]
];

const failures = [];

function abs(file) {
  return path.join(ROOT, file);
}

for (const [sourceRel, releaseRel] of pairs) {
  const source = abs(sourceRel);
  const release = abs(releaseRel);

  if (!fs.existsSync(source)) {
    failures.push(`Missing source file: ${sourceRel}`);
    continue;
  }

  if (!fs.existsSync(release)) {
    failures.push(`Missing release file: ${releaseRel}`);
    continue;
  }

  const sourceText = fs.readFileSync(source, "utf8");
  const releaseText = fs.readFileSync(release, "utf8");

  if (sourceText !== releaseText) {
    failures.push(`Release drift detected: ${releaseRel} is out of sync with ${sourceRel}`);
  }
}

if (failures.length > 0) {
  console.error("Release sync check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error("- action: run npm run automation:refresh-release");
  process.exit(1);
}

console.log("Release sync check passed.");
