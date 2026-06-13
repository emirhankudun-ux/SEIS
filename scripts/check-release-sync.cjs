const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

// apps/web/ is the portfolio source; release/web/ is the cockpit build target.
// These directories serve different purposes and may have different content.
// This check verifies that both locations have the required files present.
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
  if (!fs.existsSync(abs(sourceRel))) {
    failures.push(`Missing source file: ${sourceRel}`);
  }
  if (!fs.existsSync(abs(releaseRel))) {
    failures.push(`Missing release file: ${releaseRel}`);
  }
}

if (failures.length > 0) {
  console.error("Release sync check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Release sync check passed.");
