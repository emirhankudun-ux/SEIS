#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const webRoot = path.join(root, "apps/web");
const docsPath = path.join(root, "docs/product/seis-critical-demo-click-flow.md");

const flows = [
  {
    id: "website-to-desktop",
    source: "index.html",
    target: "desktop.html"
  },
  {
    id: "website-to-linux-replica",
    source: "index.html",
    target: "seis-linux-replica.html"
  },
  {
    id: "website-to-code",
    source: "index.html",
    target: "seis-code.html"
  },
  {
    id: "desktop-to-linux-replica",
    source: "desktop.html",
    target: "seis-linux-replica.html"
  },
  {
    id: "desktop-to-code",
    source: "desktop.html",
    target: "seis-code.html"
  },
  {
    id: "desktop-to-wow-gallery",
    source: "desktop.html",
    target: "wow-gallery.html"
  },
  {
    id: "public-linux-entry",
    source: "seis-linux-replica-public-demo.html",
    target: "seis-linux-replica.html"
  },
  {
    id: "cockpit-to-desktop",
    source: "seis-cockpit.html",
    target: "desktop.html"
  }
];

const forbiddenClaims = [
  "live AI provider calls are enabled",
  "real SSH is enabled",
  "GitHub mutation is enabled",
  "deployment mutation is enabled",
  "branch protection bypass is enabled",
  "API keys are stored in localStorage",
  "private keys are stored"
];

const requiredSafetyPhrases = [
  "No API keys are required",
  "No SSH is executed",
  "No GitHub mutation is performed",
  "No deployment is triggered",
  "No AI provider call is performed",
  "No branch protection is changed",
  "Mock and planned states must remain labeled"
];

function fail(message) {
  console.error(`SEIS critical demo click flow check failed: ${message}`);
  process.exit(1);
}

function readRequired(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`missing ${path.relative(root, filePath)}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

const docs = readRequired(docsPath);
const htmlCache = new Map();

function readHtml(fileName) {
  if (!htmlCache.has(fileName)) {
    htmlCache.set(fileName, readRequired(path.join(webRoot, fileName)));
  }
  return htmlCache.get(fileName);
}

for (const flow of flows) {
  if (!docs.includes(flow.id)) {
    fail(`docs are missing flow id: ${flow.id}`);
  }
  if (!docs.includes(`apps/web/${flow.source}`)) {
    fail(`docs are missing source for ${flow.id}: ${flow.source}`);
  }
  if (!docs.includes(`apps/web/${flow.target}`)) {
    fail(`docs are missing target for ${flow.id}: ${flow.target}`);
  }

  const sourceHtml = readHtml(flow.source);
  const targetHtml = readHtml(flow.target);

  if (sourceHtml.trim().length < 500) {
    fail(`${flow.source} is unexpectedly small`);
  }
  if (targetHtml.trim().length < 500) {
    fail(`${flow.target} is unexpectedly small`);
  }
  if (!/<title>[\s\S]*?<\/title>/i.test(targetHtml)) {
    fail(`${flow.target} is missing a title`);
  }
  if (!/<meta\s+name=["']viewport["']/i.test(targetHtml)) {
    fail(`${flow.target} is missing a viewport meta tag`);
  }
}

for (const phrase of requiredSafetyPhrases) {
  if (!docs.includes(phrase)) {
    fail(`docs are missing safety phrase: ${phrase}`);
  }
}

const combined = [docs, ...htmlCache.values()].join("\n").toLowerCase();

for (const claim of forbiddenClaims) {
  if (combined.includes(claim.toLowerCase())) {
    fail(`forbidden live/security claim found: ${claim}`);
  }
}

console.log("SEIS critical demo click flow check passed.");
