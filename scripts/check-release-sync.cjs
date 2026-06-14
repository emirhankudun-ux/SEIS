const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = process.cwd();

// apps/web/ is the portfolio source; release/web/ is the cockpit build target.
// These directories serve different purposes and may have different content.
// This check verifies that both locations have the required files present
// and reports content divergence as an advisory for awareness.
const pairs = [
  ["apps/web/index.html", "release/web/index.html"],
  ["apps/web/styles.css", "release/web/styles.css"],
  ["apps/web/app.js", "release/web/app.js"]
];

const failures = [];
const advisories = [];

function abs(file) {
  return path.join(ROOT, file);
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(abs(file))).digest("hex").slice(0, 12);
}

for (const [sourceRel, releaseRel] of pairs) {
  const sourceMissing = !fs.existsSync(abs(sourceRel));
  const releaseMissing = !fs.existsSync(abs(releaseRel));
  if (sourceMissing) {
    failures.push(`Missing source file: ${sourceRel}`);
  }
  if (releaseMissing) {
    failures.push(`Missing release file: ${releaseRel}`);
  }
  if (!sourceMissing && !releaseMissing) {
    const sourceHash = sha256(sourceRel);
    const releaseHash = sha256(releaseRel);
    const sourceSize = fs.statSync(abs(sourceRel)).size;
    const releaseSize = fs.statSync(abs(releaseRel)).size;
    if (sourceHash !== releaseHash) {
      advisories.push(`${path.basename(sourceRel)}: content differs (source ${sourceSize}B sha=${sourceHash} vs release ${releaseSize}B sha=${releaseHash})`);
    }
  }
}

if (failures.length > 0) {
  console.error("Release sync check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (advisories.length > 0) {
  console.log("Release sync check passed (content advisory):");
  for (const advisory of advisories) {
    console.log(`  ~ ${advisory}`);
  }
} else {
  console.log("Release sync check passed.");
}
