#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "project.ecosystem.yaml");
const packagePath = path.join(root, "package.json");
const goalPath = path.join(root, "content", "development", "seis-goal-tracking.json");
const failures = [];

const manifest = readJson(manifestPath, "project.ecosystem.yaml");
const packageJson = readJson(packagePath, "package.json");
const goals = readJson(goalPath, "goal registry");

if (manifest) {
  ensure(manifest.schema_version === 1, "schema_version must be 1");
  ensure(manifest.project?.id === "seis", "project.id must be seis");
  ensure(manifest.project?.lifecycle === "active", "project.lifecycle must be active");
  ensure(manifest.project?.visibility === "public-safe", "project.visibility must be public-safe");
  ensure(manifest.platforms?.native_first === true, "platforms.native_first must be true");
  ensure(manifest.platforms?.primary?.includes("macos"), "macos must be a primary platform");
  ensure(manifest.architecture?.native_center === "Swift and SwiftUI", "native center must remain Swift and SwiftUI");
  ensure(manifest.security?.frontend_secrets_allowed === false, "frontend secrets must remain disabled");
  ensure(manifest.security?.live_provider_calls === false, "manifest must not claim live provider calls");
  ensure(manifest.security?.live_mcp_sessions === false, "manifest must not claim live MCP sessions");
  ensure(manifest.architecture?.ai_core?.execution_authority === false, "AI Core execution authority must remain false in this local snapshot");

  for (const relativePath of [
    ...(manifest.architecture?.shared_packages || []),
    ...(manifest.source_contracts || []),
    manifest.goal_tracking?.canonical_registry,
  ]) {
    ensureFile(relativePath, `manifest path ${relativePath}`);
  }

  for (const command of Object.values(manifest.commands || {})) {
    if (typeof command !== "string") continue;
    const scriptName = command.match(/^npm run ([^\s]+)/)?.[1];
    if (scriptName) {
      ensure(
        typeof packageJson?.scripts?.[scriptName] === "string",
        `manifest command is missing from package.json scripts: ${scriptName}`,
      );
    }
  }
}

if (goals && manifest) {
  const goalIds = new Set((goals.goals || []).map((goal) => goal.id));
  for (const goalId of manifest.goal_tracking?.active_goal_ids || []) {
    ensure(goalIds.has(goalId), `manifest active goal is missing from goal registry: ${goalId}`);
  }
}

finish("Project ecosystem manifest check passed.");

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} is missing`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON-compatible YAML: ${error.message}`);
    return null;
  }
}

function ensureFile(relativePath, label) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    failures.push(`${label} is not a path`);
    return;
  }
  const absolutePath = path.resolve(root, relativePath);
  if (!absolutePath.startsWith(`${root}${path.sep}`) && absolutePath !== root) {
    failures.push(`${label} escapes repository root`);
    return;
  }
  if (!fs.existsSync(absolutePath)) failures.push(`${label} is missing`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("Project ecosystem manifest check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
