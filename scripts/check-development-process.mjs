import { existsSync, readFileSync } from "node:fs";

const registryPath = "content/lab/development-process.json";
const roadmapPath = "content/lab/long-development-roadmap.json";
const documentPath = "docs/governance/development-process.md";

const failures = [];

if (!existsSync(registryPath)) {
  failures.push(`missing ${registryPath}`);
}

if (!existsSync(documentPath)) {
  failures.push(`missing ${documentPath}`);
}

if (!existsSync(roadmapPath)) {
  failures.push(`missing ${roadmapPath}`);
}

let registry = null;
if (existsSync(registryPath)) {
  registry = JSON.parse(readFileSync(registryPath, "utf8"));
}

const documentText = existsSync(documentPath)
  ? readFileSync(documentPath, "utf8")
  : "";
const roadmap = existsSync(roadmapPath)
  ? JSON.parse(readFileSync(roadmapPath, "utf8"))
  : null;

if (registry) {
  if (registry.mode !== "high-efficiency-low-power") {
    failures.push("development process must stay in high-efficiency-low-power mode");
  }

  if (registry.activeBranchPolicy?.strategy !== "task-scoped-pr-branches") {
    failures.push("development process must use task-scoped PR branches");
  }

  if (registry.activeBranchPolicy?.protectedDefaultBranch !== "main") {
    failures.push("development process must keep main as the protected default branch");
  }

  if (registry.activeBranchPolicy?.directDefaultBranchWritesAllowed !== false) {
    failures.push("development process must forbid direct default-branch writes");
  }

  if (registry.workspaceRouting?.registry !== "data/seis-local-workspace-registry.json") {
    failures.push("development process must reference the local workspace registry");
  }

  if (!existsSync(registry.workspaceRouting?.registry || "")) {
    failures.push("development process workspace registry must exist");
  }

  if (registry.workspaceRouting?.qualitySignal !== "npm run check:seis-local-workspace-registry") {
    failures.push("development process must route workspace checks through the offline registry validator");
  }

  if (registry.workspaceRouting?.publishReadinessSignal !== "npm run automation:publish-readiness") {
    failures.push("development process must expose npm run automation:publish-readiness as the publish readiness signal");
  }

  if (!String(registry.workspaceRouting?.rule || "").includes("task-scoped")) {
    failures.push("development process must define the task-scoped worktree rule");
  }

  if (!String(registry.workspaceRouting?.rule || "").includes("dirty common roots remain read-only or blocked")) {
    failures.push("development process must block dirty common roots from writable routing");
  }

  const claimPolicy = registry.workspaceRouting?.remoteShipmentClaimPolicy || {};
  if (claimPolicy.stagingMode !== "review-branch-only") {
    failures.push("development process must keep remote claims review-branch-only");
  }

  if (claimPolicy.disallowClaimWhenNonGitOrBlocked !== true) {
    failures.push("development process must disallow claims from non-Git or blocked workspaces");
  }

  const claimRequirements = claimPolicy.claimRequires || [];
  for (const requiredClaimRequirement of [
    "git checkout detected",
    "canonical SEIS repository identity verified",
    "git checkout detected",
    "task-scoped review branch selected",
    "clean worktree before publication",
    "branch upstream and remote head verified",
    "GitHub authentication ready",
    "protected-branch policy satisfied"
  ]) {
    if (!claimRequirements.includes(requiredClaimRequirement)) {
      failures.push(`development process missing remote claim requirement: ${requiredClaimRequirement}`);
    }
  }

  const phaseNames = new Set((registry.cadence || []).map(item => item.phase));
  for (const phase of ["orient", "compose", "verify", "publish"]) {
    if (!phaseNames.has(phase)) {
      failures.push(`development process missing cadence phase: ${phase}`);
    }
  }

  const validationProfiles = registry.validationProfiles || {};
  const lowPowerProfile = validationProfiles.lowPowerDefault || {};
  const lowPowerCommands = lowPowerProfile.commands || [];
  for (const requiredCommand of [
    "npm run check:seis-local-workspace-registry",
    "npm run test:seis-local-workspace-registry",
    "npm run check:workspace-routing",
    "node scripts/check-development-process.mjs",
    "node --check scripts/check-development-process.mjs",
    "node --check scripts/check-workspace-routing.mjs"
  ]) {
    if (!lowPowerCommands.includes(requiredCommand)) {
      failures.push(`development process missing low-power validation command: ${requiredCommand}`);
    }
  }

  const lowPowerDisallow = lowPowerProfile.disallow || [];
  for (const blockedCommand of ["npm install", "npm run build", "playwright"]) {
    if (!lowPowerDisallow.includes(blockedCommand)) {
      failures.push(`development process low-power profile must disallow: ${blockedCommand}`);
    }
  }

  const expandedFoundationProfile = validationProfiles.expandedFoundation || {};
  const expandedCommands = expandedFoundationProfile.commands || [];
  if (!expandedCommands.includes("npm run check:foundation")) {
    failures.push("development process expanded foundation profile must include npm run check:foundation");
  }

  const workstreams = registry.activeSprint?.workstreams || [];
  if (workstreams.length < 4) {
    failures.push("development process must define at least four active sprint workstreams");
  }

  const highPriorityOpenItems = (registry.openBacklog || []).filter(item => item.priority === "high");
  if (highPriorityOpenItems.length < 1) {
    failures.push("development process must keep a high-priority open backlog item");
  }
}

if (roadmap && (roadmap.phases || []).length < 6) {
  failures.push("development process must be paired with the long roadmap phases");
}

for (const requiredText of [
  "Task-Scoped Branch Contract",
  "Workspace Routing",
  "non-Git intake",
  "dirty common roots",
  "Development Cadence",
  "Proportional Validation Profiles",
  "Active Sprint",
  "Open Backlog",
  "Stop Conditions",
  "GitHub authentication",
  "automation:publish-readiness"
]) {
  if (!documentText.includes(requiredText)) {
    failures.push(`missing "${requiredText}" in ${documentPath}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS development process check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS development process check passed.");
