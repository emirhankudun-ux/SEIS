#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];

const files = {
  evidence: "content/development/seis-ssh-live-readiness-evidence.json",
  doc: "docs/deployment/seis-ssh-live-readiness-evidence.md",
  contract: "deploy/seis-ssh-public-access-contract.json",
  accessModel: "deploy/seis-ssh-access-model.json",
  roadmap: "deploy/seis-ssh-cloud-roadmap.json",
  packageJson: "package.json",
  status: "docs/STATUS.md",
  backlog: "docs/roadmap/MASTER_BACKLOG.md",
  queue: "docs/roadmap/NEXT_PR_QUEUE.md"
};

for (const file of Object.values(files)) read(file);

const evidence = readJson(files.evidence);
const contract = readJson(files.contract);
const accessModel = readJson(files.accessModel);
const roadmap = readJson(files.roadmap);
const packageJson = readJson(files.packageJson);
const scripts = packageJson?.scripts || {};
const docs = [
  files.doc,
  files.status,
  files.backlog,
  files.queue
].map(read).join("\n");

ensure(evidence?.id === "seis-ssh-live-readiness-evidence", "live readiness evidence id must be stable");
ensure(evidence?.status === "blocked-provider-billing", "live readiness evidence must stay blocked until live readiness is proven");
ensure(evidence?.targetAlias === "SEIS-SSH", "live readiness evidence must target SEIS-SSH");
ensure(evidence?.serverAndPortPolicy?.preservationMode === "preserve-existing-server-and-port", "live readiness evidence must preserve server and port policy");
ensure(evidence?.serverAndPortPolicy?.serverOrPortChanged === false, "live readiness evidence must not record server or port changes");
ensure(evidence?.serverAndPortPolicy?.invariant === "Keep the same server and port.", "live readiness evidence must include English invariant");
ensure(evidence?.serverAndPortPolicy?.turkishInvariant === "Ayni sunucu ve baglanti noktasi korunur.", "live readiness evidence must include Turkish invariant");

const probe = evidence?.liveProbe || {};
ensure(probe.command === "npm run cloud:ssh:online -- --connect-timeout 12", "live readiness evidence must record the bounded live probe command");
ensure(probe.liveSshAttempted === true, "live readiness evidence must record that live SSH was attempted");
ensure(probe.strictReady === false, "live readiness evidence must not claim strict readiness");
ensure(probe.transport === "codespace", "live readiness evidence must record current Codespaces transport");
ensure(probe.hostnameKind === "github.codespaces", "live readiness evidence must classify Codespaces hostname");
ensure(probe.port === "22", "live readiness evidence must record preserved port 22");
ensure(probe.cloudOnly === true, "live readiness evidence must confirm cloud-only config");
ensure(probe.remoteOnline === false, "live readiness evidence must record remote offline");
ensure(probe.repoPresent === false, "live readiness evidence must not claim remote repo proof");
ensure(probe.codexAvailable === false, "live readiness evidence must not claim remote Codex proof");
ensure(probe.rawSecretOutputStored === false, "live readiness evidence must not store raw secret output");
ensure(String(probe.sanitizedProviderError || "").includes("HTTP 402 billing issue"), "live readiness evidence must record sanitized provider billing blocker");

const blockerIds = new Set((evidence?.blockers || []).map((item) => item.id));
for (const blocker of [
  "github-codespaces-billing-issue",
  "ssh-remote-offline",
  "picker-proxycommand-warning"
]) {
  ensure(blockerIds.has(blocker), `live readiness evidence must include blocker ${blocker}`);
}

for (const forbidden of [
  "Do not claim SEIS-SSH is live-ready.",
  "Do not claim ChatGPT mobile 24x7 readiness.",
  "Do not claim GUI picker compatibility.",
  "Do not change HostName or Port to bypass the billing issue."
]) {
  ensure((evidence?.claimsForbidden || []).includes(forbidden), `live readiness evidence must forbid: ${forbidden}`);
}

ensure(contract?.targetAlias === "SEIS-SSH", "public access contract must still target SEIS-SSH");
ensure(contract?.serverAndPortPolicy?.mode === "preserve-existing-server-and-port", "public access contract must preserve server and port");
ensure(accessModel?.publicAccessContract === files.contract, "access model must link public access contract");
ensure(roadmap?.publicAccessContract === files.contract, "roadmap must link public access contract");

ensure(scripts["check:seis-ssh-live-readiness-evidence"] === "node scripts/check-seis-ssh-live-readiness-evidence.mjs", "package script check:seis-ssh-live-readiness-evidence must be declared");
ensure((scripts["quality:governance"] || "").includes("npm run check:seis-ssh-live-readiness-evidence"), "quality:governance must include live readiness evidence check");
ensure((accessModel?.longTermDevelopment?.qualityCommands || []).includes("npm run check:seis-ssh-live-readiness-evidence"), "access model quality commands must include live readiness evidence check");
ensure((roadmap?.validationCommands || []).includes("npm run check:seis-ssh-live-readiness-evidence"), "roadmap validation commands must include live readiness evidence check");

for (const token of [
  "SEIS SSH Live Readiness Evidence",
  "blocked",
  "HTTP 402 billing issue",
  "Keep the same server and port.",
  "Ayni sunucu ve baglanti noktasi korunur.",
  "npm run check:seis-ssh-live-readiness-evidence",
  "content/development/seis-ssh-live-readiness-evidence.json",
  "docs/deployment/seis-ssh-live-readiness-evidence.md"
]) {
  ensure(docs.includes(token), `docs must include ${token}`);
}

for (const file of Object.values(files)) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /gh[pousr]_[A-Za-z0-9_]{20,}/, "GitHub tokens");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /(password|token|secret)\s*[:=]\s*["'][^"']{8,}/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS SSH live readiness evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS SSH live readiness evidence check passed.");

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    failures.push(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) failures.push(`${file} must not include ${reason}`);
}
