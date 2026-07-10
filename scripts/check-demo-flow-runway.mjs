#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const runwayPath = path.join(root, "apps/web/seis-demo-runway.html");
const docsPath = path.join(root, "docs/product/seis-demo-flow-runway.md");

const requiredSteps = [
  "Opening cinematic landing page",
  "Command Center appears",
  "User opens SEIS Desktop",
  "Desktop shows apps and system status",
  "User opens SEIS AI Core",
  "Provider registry and model router shown",
  "User opens SEIS Code",
  "Browser IDE shows mock repo and AI panel",
  "User opens SEIS Design",
  "Design tokens and premium components shown",
  "User opens SEIS Search",
  "Search finds modules/docs/agents",
  "User opens Cloud/SSH",
  "GitHub/CI/status logs shown",
  "Final Showcase summarizes SEIS ecosystem"
];

const requiredControls = [
  'data-action="start-runway"',
  'data-action="next-step"',
  'data-action="previous-step"',
  'data-action="reset-runway"',
  'data-action="open-current-app"',
  'data-action="mark-reviewed"',
  "ArrowRight",
  "ArrowLeft",
  "localStorage",
  'data-runway-stage',
  'data-runway-timeline',
  'data-runway-log'
];

const requiredStateLabels = ['data-state="real"', 'data-state="mock"', 'data-state="planned"'];

function fail(message) {
  console.error(`SEIS demo runway check failed: ${message}`);
  process.exit(1);
}

for (const filePath of [runwayPath, docsPath]) {
  if (!fs.existsSync(filePath)) {
    fail(`missing ${path.relative(root, filePath)}`);
  }
}

const runway = fs.readFileSync(runwayPath, "utf8");
const docs = fs.readFileSync(docsPath, "utf8");

for (const step of requiredSteps) {
  if (!runway.includes(step)) {
    fail(`runway is missing step: ${step}`);
  }
  if (!docs.includes(step)) {
    fail(`docs are missing step: ${step}`);
  }
}

for (const control of requiredControls) {
  if (!runway.includes(control)) {
    fail(`runway is missing interactive control marker: ${control}`);
  }
}

for (const stateLabel of requiredStateLabels) {
  if (!runway.includes(stateLabel)) {
    fail(`runway is missing state label: ${stateLabel}`);
  }
}

const forbiddenLiveClaims = [
  "live provider call is enabled",
  "real SSH is enabled",
  "GitHub mutation is enabled",
  "live deployment mutation is enabled"
];

for (const claim of forbiddenLiveClaims) {
  if (runway.toLowerCase().includes(claim.toLowerCase()) || docs.toLowerCase().includes(claim.toLowerCase())) {
    fail(`forbidden live claim found: ${claim}`);
  }
}

const localBoundary = [
  "No provider, SSH, GitHub, or deployment mutation is enabled",
  "does not execute SSH",
  "does not execute SSH, call GitHub, deploy, call provider APIs, request credentials, store secrets, or weaken branch protection"
];

for (const boundary of localBoundary) {
  if (!runway.includes(boundary) && !docs.includes(boundary)) {
    fail(`missing safety boundary: ${boundary}`);
  }
}

console.log("SEIS demo runway check passed.");
