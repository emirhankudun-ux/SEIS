#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const handoffPath = path.join(
  root,
  "docs/roadmap/SEIS_LIVE_DEMO_CONTINUITY_HANDOFF.md",
);
const readmePath = path.join(root, "README.md");

const requiredFiles = [handoffPath, readmePath];
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error("Missing required files:");
  for (const file of missingFiles) {
    console.error(`- ${path.relative(root, file)}`);
  }
  process.exit(1);
}

const handoff = fs.readFileSync(handoffPath, "utf8");
const readme = fs.readFileSync(readmePath, "utf8");

const handoffMarkers = [
  "Primary Continuation Path",
  "seis-linux-replica.html?demo=live",
  "seis-linux-replica-public-demo.html",
  "desktop.html",
  "Local Demo mode",
  "No SSH is executed",
  "No provider key is required",
  "Do not delete supplied ZIP/reference-bank assets",
  "Mock vs Real Status",
  "Auto-Merge Continuity",
  "Human Approval Needed",
  "Recommended Next PR Queue",
  "SEIS Desktop OS",
  "SEIS AI Core",
  "SEIS Search",
  "SEIS Code IDE",
  "SEIS Design Studio",
  "SEIS Cloud",
  "SEIS Store",
  "SEIS Music",
  "SEIS Launchpad",
  "SEIS Files",
  "SEIS Terminal / SSH Center",
  "SEIS Website",
  "SEIS Agents",
  "SEIS Plugins",
  "SEIS Command Center",
];

const readmeMarkers = [
  "seis-linux-replica.html?demo=live",
  "Local Demo mode",
  "apps/web/reference-banks/",
];

function collectMissing(source, markers) {
  return markers.filter((marker) => !source.includes(marker));
}

const missingHandoff = collectMissing(handoff, handoffMarkers);
const missingReadme = collectMissing(readme, readmeMarkers);

if (missingHandoff.length > 0 || missingReadme.length > 0) {
  if (missingHandoff.length > 0) {
    console.error("Continuity handoff is missing markers:");
    for (const marker of missingHandoff) {
      console.error(`- ${marker}`);
    }
  }

  if (missingReadme.length > 0) {
    console.error("README demo continuity anchors are missing:");
    for (const marker of missingReadme) {
      console.error(`- ${marker}`);
    }
  }

  process.exit(1);
}

console.log("SEIS live demo continuity handoff markers verified.");
