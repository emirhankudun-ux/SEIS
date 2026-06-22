#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const trackerPath = "data/seis-operational-goal-tracker.json";
const packagePath = "package.json";
const implementationMapPath = "data/seis-master-prompt-implementation-map.json";
const acceptanceCriteriaPath = "data/seis-master-prompt-acceptance-criteria.json";
const masterPromptPath = "docs/governance/seis-master-prompt.md";
const readmePath = "README.md";

const tracker = readJson(trackerPath);
const packageJson = readJson(packagePath);
const implementationMap = readJson(implementationMapPath);
const acceptanceCriteria = readJson(acceptanceCriteriaPath);

requireIncludes(masterPromptPath, trackerPath, "Master Prompt must link the operational goal tracker");
requireIncludes(readmePath, trackerPath, "README must link the operational goal tracker");
requireIncludes(implementationMapPath, trackerPath, "implementation map must reference the goal tracker");
requireIncludes(implementationMapPath, "scripts/check-seis-operational-goal-tracker.mjs", "implementation map must reference this check");
requireIncludes(acceptanceCriteriaPath, trackerPath, "acceptance criteria must reference the goal tracker");
requireIncludes(acceptanceCriteriaPath, "scripts/check-seis-operational-goal-tracker.mjs", "acceptance criteria must reference this check");

if (tracker) {
  ensure(tracker.contract === "SEIS Operational Goal Tracker", `${trackerPath} must define the SEIS Operational Goal Tracker contract`);
  ensure(tracker.status === "active", `${trackerPath} must be active`);
  ensure(Array.isArray(tracker.requiredFields), `${trackerPath} must define requiredFields`);
  ensure(Array.isArray(tracker.activeTracks), `${trackerPath} must define activeTracks`);
  ensure(tracker.activeTracks.length >= 7, `${trackerPath} must track at least seven active SEIS work tracks`);

  const requiredFields = ["goal", "priority", "status", "risks", "validation", "validationStatus", "lastValidation", "successCriteria", "nextStep"];
  for (const field of requiredFields) {
    ensure(tracker.requiredFields.includes(field), `${trackerPath} requiredFields must include ${field}`);
  }

  const statusValues = new Set(tracker.statusValues || []);
  const validationStatusValues = new Set(tracker.validationStatusValues || []);
  const priorityValues = new Set(tracker.priorityOrder || []);
  const trackIds = new Set();

  for (const track of tracker.activeTracks || []) {
    ensure(track && typeof track === "object", `${trackerPath} activeTracks entries must be objects`);
    ensure(typeof track.id === "string" && track.id.length > 0, `${trackerPath} every track must define id`);
    ensure(!trackIds.has(track.id), `${trackerPath} duplicate track id: ${track.id}`);
    trackIds.add(track.id);
    for (const field of requiredFields) {
      ensure(track[field] !== undefined, `${trackerPath} ${track.id || "<unknown>"} must define ${field}`);
    }
    ensure(priorityValues.has(track.priority), `${trackerPath} ${track.id} priority must match priorityOrder`);
    ensure(statusValues.has(track.status), `${trackerPath} ${track.id} status must match statusValues`);
    ensure(validationStatusValues.has(track.validationStatus), `${trackerPath} ${track.id} validationStatus must match validationStatusValues`);
    ensure(Array.isArray(track.risks) && track.risks.length > 0, `${trackerPath} ${track.id} must list risks`);
    ensure(Array.isArray(track.validation) && track.validation.length > 0, `${trackerPath} ${track.id} must list validation`);
    ensure(Array.isArray(track.successCriteria) && track.successCriteria.length > 0, `${trackerPath} ${track.id} must list successCriteria`);
    ensure(track.lastValidation && typeof track.lastValidation === "object", `${trackerPath} ${track.id} must define lastValidation`);
    ensure(validationStatusValues.has(track.lastValidation?.status), `${trackerPath} ${track.id} lastValidation.status must match validationStatusValues`);
    ensure(typeof track.lastValidation?.evidence === "string" && track.lastValidation.evidence.length > 0, `${trackerPath} ${track.id} lastValidation must include evidence`);
    ensure(typeof track.nextStep === "string" && track.nextStep.length > 0, `${trackerPath} ${track.id} must define nextStep`);
    if (track.status === "complete") {
      ensure(
        track.validationStatus === "passed" || track.validationStatus === "waived",
        `${trackerPath} ${track.id} cannot be complete unless validationStatus is passed or waived`
      );
    }
  }

  for (const expectedTrack of [
    "master-prompt-governance",
    "ssh-hardening-safety",
    "plugin-skill-governance",
    "apple-first-platform-foundation",
    "design-accessibility-experience",
    "open-source-readiness",
    "ai-data-cloud-strategy",
    "governance-long-horizon-throttle",
  ]) {
    ensure(trackIds.has(expectedTrack), `${trackerPath} must include ${expectedTrack}`);
  }

  const sshTrack = findTrack(tracker, "ssh-hardening-safety");
  if (sshTrack) {
    requireTrackIncludes(sshTrack, "validation", "npm run check:ssh-hardening-contract", "SSH hardening track must require the SSH contract check");
    requireTrackIncludes(sshTrack, "validation", "python3 -m unittest scripts.tests.test_ultra_ssh_manager", "SSH hardening track must require the SSH manager unit tests");
    requireTrackIncludes(sshTrack, "risks", "Mode drift", "SSH hardening track must track harden/full-setup mode drift risk");
    requireTrackIncludes(sshTrack, "risks", "UFW and firewalld", "SSH hardening track must track firewall backend lockout risk");
    requireTrackIncludes(sshTrack, "successCriteria", "Harden and full-setup remain separate code paths", "SSH hardening track must require harden/full-setup separation");
    requireTrackIncludes(sshTrack, "successCriteria", "Dry-run, audit, dashboard, and verify modes remain non-mutating", "SSH hardening track must require non-mutating observation modes");
    requireTrackIncludes(sshTrack, "successCriteria", "Live apply requires reviewed plan", "SSH hardening track must require reviewed live-apply evidence");
    ensure(
      String(sshTrack.nextStep || "").includes("dry-run plan") && String(sshTrack.nextStep || "").includes("recovery playbook"),
      "SSH hardening track nextStep must require dry-run plan and recovery playbook review"
    );
  }

  const longHorizonTrack = findTrack(tracker, "governance-long-horizon-throttle");
  if (longHorizonTrack) {
    requireTrackIncludes(
      longHorizonTrack,
      "validation",
      "npm run check:seis-long-horizon-throttle",
      "long-horizon track must require throttle validation command"
    );
    requireTrackIncludes(
      longHorizonTrack,
      "validation",
      "npm run check:seis-enterprise-gates",
      "long-horizon track must require enterprise gates validation"
    );
    requireTrackIncludes(
      longHorizonTrack,
      "risks",
      "metric drift",
      "long-horizon track must track metric drift risk"
    );
    ensure(
      String(longHorizonTrack.nextStep).includes("check:seis-long-horizon-throttle"),
      `${trackerPath} long-horizon track nextStep must include check:seis-long-horizon-throttle`
    );
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  ensure(
    scripts["check:seis-operational-goal-tracker"] === "node scripts/check-seis-operational-goal-tracker.mjs",
    "package.json must expose check:seis-operational-goal-tracker"
  );
  ensure(
    String(scripts["quality:governance"] || "").includes("npm run check:seis-operational-goal-tracker"),
    "quality:governance must include npm run check:seis-operational-goal-tracker"
  );
}

if (implementationMap) {
  ensure(implementationMap.goalTrackerPath === trackerPath, `${implementationMapPath} must expose goalTrackerPath`);
  ensure(
    implementationMap.goalTrackerCheckPath === "scripts/check-seis-operational-goal-tracker.mjs",
    `${implementationMapPath} must expose goalTrackerCheckPath`
  );
}

if (acceptanceCriteria) {
  const requiredCommands = acceptanceCriteria.requiredCommands || [];
  ensure(
    requiredCommands.includes("npm run check:seis-operational-goal-tracker"),
    `${acceptanceCriteriaPath} must require npm run check:seis-operational-goal-tracker`
  );
}

for (const file of [trackerPath, implementationMapPath, acceptanceCriteriaPath, masterPromptPath, readmePath]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /\b(?:password|token|secret)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS operational goal tracker check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS operational goal tracker check passed.");

function read(file) {
  const absolutePath = path.join(root, file);
  if (!fs.existsSync(absolutePath)) {
    fail(`missing ${file}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function requireIncludes(file, token, reason = token) {
  if (!read(file).includes(token)) {
    fail(`${file} must include ${reason}`);
  }
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) {
    fail(`${file} must not include ${reason}`);
  }
}

function ensure(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function findTrack(tracker, id) {
  return (tracker.activeTracks || []).find((track) => track && track.id === id);
}

function requireTrackIncludes(track, field, token, reason) {
  const values = Array.isArray(track[field]) ? track[field] : [];
  ensure(
    values.some((value) => String(value).includes(token)),
    `${trackerPath} ${track.id} ${reason}`
  );
}

function fail(message) {
  failures.push(message);
}
