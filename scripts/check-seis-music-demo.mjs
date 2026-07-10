#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "apps/web/seis-music.html");
const docsPath = path.join(root, "docs/product/seis-music-demo.md");

const requiredTracks = [
  "Orbiting Graphite",
  "Glass Kernel",
  "Demo Runway",
  "Terminal Rain",
  "Canvas Bloom",
  "Searchlight Index"
];

const requiredAlbums = ["Command Focus", "Launch Sequence", "Design Studio", "Knowledge System"];
const requiredRecommendations = ["For deep work", "For demo review", "For design critique"];

const requiredMarkers = [
  "data-seis-music-demo",
  "data-action=\"toggle-play\"",
  "data-action=\"next-track\"",
  "data-action=\"previous-track\"",
  "data-action=\"reset-music\"",
  "data-track",
  "data-mood",
  "localStorage",
  "waveform",
  "AI recommendations",
  "mock safe mode"
];

const requiredSafetyPhrases = [
  "No API keys are required",
  "No audio stream is started",
  "No SSH is executed",
  "No GitHub mutation is performed",
  "No deployment is triggered",
  "No AI provider call is performed",
  "No branch protection is changed"
];

const forbiddenClaims = [
  "live AI provider calls are enabled",
  "real SSH is enabled",
  "GitHub mutation is enabled",
  "deployment mutation is enabled",
  "audio streaming is enabled",
  "branch protection bypass is enabled",
  "API keys are stored in localStorage",
  "private keys are stored"
];

function fail(message) {
  console.error(`SEIS Music demo check failed: ${message}`);
  process.exit(1);
}

for (const filePath of [pagePath, docsPath]) {
  if (!fs.existsSync(filePath)) {
    fail(`missing ${path.relative(root, filePath)}`);
  }
}

const page = fs.readFileSync(pagePath, "utf8");
const docs = fs.readFileSync(docsPath, "utf8");

if (!/<title>[\s\S]*?<\/title>/i.test(page)) {
  fail("Music page is missing a title");
}

if (!/<meta\s+name=["']viewport["']/i.test(page)) {
  fail("Music page is missing viewport metadata");
}

for (const marker of requiredMarkers) {
  if (!page.includes(marker)) {
    fail(`Music page is missing marker: ${marker}`);
  }
}

for (const track of requiredTracks) {
  if (!page.includes(track) || !docs.includes(track)) {
    fail(`Music demo is missing track: ${track}`);
  }
}

for (const album of requiredAlbums) {
  if (!page.includes(album) || !docs.includes(album)) {
    fail(`Music demo is missing album: ${album}`);
  }
}

for (const recommendation of requiredRecommendations) {
  if (!page.includes(recommendation) || !docs.includes(recommendation)) {
    fail(`Music demo is missing recommendation: ${recommendation}`);
  }
}

for (const phrase of requiredSafetyPhrases) {
  if (!docs.includes(phrase)) {
    fail(`Music docs are missing safety phrase: ${phrase}`);
  }
}

const combined = `${page}\n${docs}`.toLowerCase();
for (const claim of forbiddenClaims) {
  if (combined.includes(claim.toLowerCase())) {
    fail(`forbidden live/security claim found: ${claim}`);
  }
}

console.log("SEIS Music demo check passed.");
