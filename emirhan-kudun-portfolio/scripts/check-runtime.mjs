import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "packages/runtime/src/registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const deploymentTargetsPath = path.join(root, "packages/runtime/src/deployment-targets.json");
const deploymentTargets = JSON.parse(fs.readFileSync(deploymentTargetsPath, "utf8"));
const validStatuses = new Set(["active", "configured", "needs_credentials", "unavailable", "skipped_with_reason"]);
const errors = [];

for (const group of ["connectors", "skills"]) {
  for (const item of registry[group]) {
    if (!item.id || !item.name || !item.category || !item.scope) {
      errors.push(`${group}: item missing required fields`);
    }
    if (!Array.isArray(item.requiresEnv)) {
      errors.push(`${item.id}: requiresEnv must be an array`);
    }
    if (item.statusOverride && !validStatuses.has(item.statusOverride)) {
      errors.push(`${item.id}: invalid statusOverride ${item.statusOverride}`);
    }
  }
}

if (!registry.connectors.some((item) => item.statusOverride === "unavailable")) {
  errors.push("Expected at least one unavailable connector state.");
}

if (!Array.isArray(deploymentTargets) || deploymentTargets.length < 4) {
  errors.push("Expected at least 4 deployment targets.");
}

for (const target of deploymentTargets || []) {
  if (!target.id || !target.name || !target.category || !target.scope || !target.targetUrl || !target.command) {
    errors.push("Deployment target missing required fields.");
  }
  if (!Array.isArray(target.requiresEnv)) {
    errors.push(`${target.id}: deployment requiresEnv must be an array.`);
  }
  if (target.statusOverride && !validStatuses.has(target.statusOverride)) {
    errors.push(`${target.id}: invalid deployment statusOverride ${target.statusOverride}`);
  }
  if (typeof target.safety !== "string" || target.safety.trim().length < 12) {
    errors.push(`${target.id}: deployment target needs safety notes.`);
  }
}

if (!deploymentTargets.some((target) => target.id === "static-fallback-archive" && target.statusOverride === "active")) {
  errors.push("Expected active static fallback deployment target.");
}

const mcpPath = path.join(root, "packages/runtime/src/mcp-readiness.generated.json");
if (!fs.existsSync(mcpPath)) {
  errors.push("Missing MCP readiness snapshot.");
} else {
  const mcp = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
  if (!Array.isArray(mcp.items) || mcp.items.length < 1) {
    errors.push("MCP readiness snapshot must contain items.");
  }
  for (const item of mcp.items || []) {
    if (!validStatuses.has(item.status)) {
      errors.push(`${item.id}: invalid MCP status ${item.status}`);
    }
    if (typeof item.notes !== "string" || item.notes.trim().length < 8) {
      errors.push(`${item.id}: MCP readiness item needs clear notes.`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Runtime check passed: ${registry.connectors.length} connectors, ${registry.skills.length} skills, ${deploymentTargets.length} deployment targets.`);
