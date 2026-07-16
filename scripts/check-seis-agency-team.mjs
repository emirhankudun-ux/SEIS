#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = "content/development/seis-agency-team.json";
const goalTrackingPath = "content/development/seis-goal-tracking.json";
const operatingModelPath = "docs/governance/SEIS_AGENCY_OPERATING_MODEL.md";
const briefTemplatePath = "docs/governance/SEIS_AGENCY_BRIEF_TEMPLATE.md";
const failures = [];

const expectedRoleNames = [
  "Architect Agent",
  "Code Agent",
  "Design Agent",
  "UI/UX Agent",
  "Research Agent",
  "Search Agent",
  "Security Agent",
  "DevOps Agent",
  "Documentation Agent",
  "QA Agent",
  "Cloud Agent",
  "Automation Agent",
  "Product Agent"
];

const allowedBacklogStatuses = new Set(["ready", "planned", "in-progress", "blocked", "completed"]);

const registry = readJson(registryPath);
const goalTracking = readJson(goalTrackingPath);

ensureFile(operatingModelPath, "operating model");
ensureFile(briefTemplatePath, "brief template");

validateTopLevel(registry);
validateHeadcount(registry);
validateSources(registry, goalTracking);
validateRolesAndPods(registry);
validateServices(registry);
validateWorkflow(registry);
validateIntake(registry);
validateApprovals(registry);
validateBacklog(registry, goalTracking);
validatePublicSafety(registry);
validateDocumentation();

if (failures.length > 0) {
  console.error("SEIS agency team check failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}

console.log(
  "SEIS agency team check passed: 5 pods, 13 agency roles, "
    + registry.headcountModel.totalEmployees
    + "-employee planning model, "
    + registry.serviceCatalog.length
    + " services, "
    + registry.workflow.length
    + " workflow stages, and "
    + registry.initialBacklog.length
    + " backlog items."
);

function validateTopLevel(value) {
  ensureObject(value, "agency registry");
  ensure(value.schemaVersion === "1.0.0", "schemaVersion must be 1.0.0");
  ensure(value.id === "seis-agency-team", "id must be seis-agency-team");
  ensure(value.status === "active-public-safe", "status must be active-public-safe");
  ensureNonEmptyString(value.purpose, "purpose");
  ensure(Array.isArray(value.relatedGoalIds), "relatedGoalIds must be an array");
  ensure(value.truthBoundary?.organizationalOverlay === true, "organizationalOverlay must be true");
  ensure(value.truthBoundary?.runtimeAuthority === false, "runtimeAuthority must be false");
  ensure(value.truthBoundary?.backgroundExecution === false, "backgroundExecution must be false");
  ensure(value.truthBoundary?.providerCalls === false, "providerCalls must be false");
  ensure(value.truthBoundary?.secretAccess === false, "secretAccess must be false");
  ensure(value.truthBoundary?.privateContentAccess === false, "privateContentAccess must be false");
  ensure(value.truthBoundary?.externalMutation === "human-approval-required", "external mutation boundary is invalid");
  ensure(value.agency?.model === "supervised-pod-agency", "agency model must be supervised-pod-agency");
  ensure(value.agency?.accountableLeadRoleId === "architect-agent", "architect must be the accountable lead");
  ensure(value.agency?.frontDoorRoleId === "product-agent", "product must be the front door");
  ensure(value.qualityGate === "npm run check:seis-agency-team", "qualityGate command is invalid");
  ensure(Array.isArray(value.pods) && value.pods.length === 5, "exactly 5 pods are required");
  ensure(Array.isArray(value.roles) && value.roles.length === 13, "exactly 13 roles are required");
  ensure(Array.isArray(value.serviceCatalog) && value.serviceCatalog.length === 9, "exactly 9 services are required");
  ensure(Array.isArray(value.workflow) && value.workflow.length === 7, "exactly 7 workflow stages are required");
  ensure(Array.isArray(value.initialBacklog) && value.initialBacklog.length === 5, "exactly 5 initial backlog items are required");
}

function validateHeadcount(value) {
  const model = value.headcountModel;
  ensure(model?.status === "planning-model-not-payroll-evidence", "headcount status must remain planning-model-not-payroll-evidence");
  ensure(model?.totalEmployees === 300, "headcount total must be exactly 300 employees");
  ensure(model?.unitCount === 8, "headcount model must contain exactly 8 units");
  ensure(Array.isArray(model?.units) && model.units.length === model.unitCount, "headcount unit count is inconsistent");
  ensure(Array.isArray(model?.notClaims) && model.notClaims.length >= 4, "headcount non-claims are incomplete");

  const podIds = new Set((value.pods || []).map((pod) => pod.id));
  const unitIds = (model?.units || []).map((unit) => unit.id);
  ensureUnique(unitIds, "headcount unit ids");
  const total = (model?.units || []).reduce((sum, unit) => sum + (Number.isInteger(unit.employees) ? unit.employees : 0), 0);
  ensure(total === model?.totalEmployees, "headcount unit allocation must sum to exactly 300");

  for (const unit of model?.units || []) {
    ensureNonEmptyString(unit.name, "headcount unit name: " + unit.id);
    ensure(Number.isInteger(unit.employees) && unit.employees >= 0, "headcount employees must be a non-negative integer: " + unit.id);
    ensure(Array.isArray(unit.podIds), "headcount podIds must be an array: " + unit.id);
    for (const podId of unit.podIds) ensure(podIds.has(podId), "headcount unit references unknown pod: " + unit.id);
    ensureNonEmptyString(unit.mandate, "headcount mandate: " + unit.id);
  }
}

function validateSources(value, goals) {
  ensureObject(goals, "goal tracking");
  for (const [label, relativePath] of Object.entries(value.sourceOfTruth || {})) {
    ensureFile(relativePath, "sourceOfTruth." + label);
  }

  const goalIds = new Set((goals.goals || []).map((goal) => goal?.id));
  for (const goalId of value.relatedGoalIds || []) {
    ensure(goalIds.has(goalId), "related Goal ID is missing from canonical goal tracking: " + goalId);
  }
  for (const item of value.initialBacklog || []) {
    ensure(goalIds.has(item.goalId), "backlog Goal ID is missing from canonical goal tracking: " + item.goalId);
  }
}

function validateRolesAndPods(value) {
  const roleIds = value.roles.map((role) => role.id);
  const podIds = value.pods.map((pod) => pod.id);
  ensureUnique(roleIds, "role ids");
  ensureUnique(podIds, "pod ids");

  const sourceNames = new Set(expectedRoleNames);
  const assignedRoleIds = new Set();
  for (const pod of value.pods) {
    ensureNonEmptyString(pod.name, "pod name");
    ensureNonEmptyString(pod.mandate, "pod mandate");
    ensure(pod.roleIds.includes(pod.leadRoleId), "pod lead must belong to its roleIds: " + pod.id);
    for (const roleId of pod.roleIds) {
      ensure(roleIds.includes(roleId), "pod references unknown role: " + roleId);
      ensure(!assignedRoleIds.has(roleId), "role is assigned to multiple pods: " + roleId);
      assignedRoleIds.add(roleId);
    }
    for (const serviceId of pod.serviceIds) ensureNonEmptyString(serviceId, "pod service id");
  }
  ensure(assignedRoleIds.size === value.roles.length, "every role must belong to exactly one pod");

  for (const role of value.roles) {
    ensure(sourceNames.has(role.sourceRole), "role is not in the agency role catalog: " + role.sourceRole);
    ensure(podIds.includes(role.podId), "role references unknown pod: " + role.id);
    ensure(roleIds.filter((id) => id === role.id).length === 1, "role id must be unique: " + role.id);
    ensureNonEmptyString(role.duty, "role duty: " + role.id);
    ensureNonEmptyString(role.accountability, "role accountability: " + role.id);
  }
}

function validateServices(value) {
  const roleIds = new Set(value.roles.map((role) => role.id));
  const serviceIds = value.serviceCatalog.map((service) => service.id);
  ensureUnique(serviceIds, "service ids");
  const podServiceIds = value.pods.flatMap((pod) => pod.serviceIds);
  ensureUnique(podServiceIds, "pod service assignments");
  ensure(arraysEqual([...serviceIds].sort(), [...podServiceIds].sort()), "every service must belong to exactly one pod");
  for (const service of value.serviceCatalog) {
    ensure(roleIds.has(service.ownerRoleId), "service owner is unknown: " + service.id);
    ensure(Array.isArray(service.reviewerRoleIds) && service.reviewerRoleIds.length > 0, "service needs reviewers: " + service.id);
    for (const roleId of service.reviewerRoleIds) ensure(roleIds.has(roleId), "service reviewer is unknown: " + roleId);
    ensureNonEmptyString(service.output, "service output: " + service.id);
    ensureNonEmptyString(service.validation, "service validation: " + service.id);
  }
}

function validateWorkflow(value) {
  const roleIds = new Set(value.roles.map((role) => role.id));
  const stageIds = value.workflow.map((stage) => stage.id);
  ensureUnique(stageIds, "workflow stage ids");
  value.workflow.forEach((stage, index) => {
    ensure(stage.order === index + 1, "workflow order must be sequential at stage " + stage.id);
    ensure(Array.isArray(stage.ownerRoleIds) && stage.ownerRoleIds.length > 0, "workflow owners are missing: " + stage.id);
    for (const roleId of stage.ownerRoleIds) ensure(roleIds.has(roleId), "workflow owner is unknown: " + roleId);
    ensureNonEmptyString(stage.output, "workflow output: " + stage.id);
    ensureNonEmptyString(stage.gate, "workflow gate: " + stage.id);
  });
}

function validateIntake(value) {
  const requiredFields = value.intakeContract?.requiredFields;
  ensure(Array.isArray(requiredFields) && requiredFields.length >= 12, "intake contract needs at least 12 required fields");
  ensureUnique(requiredFields, "intake fields");
  ensure(Array.isArray(value.intakeContract?.stopAndAskWhen) && value.intakeContract.stopAndAskWhen.length >= 3, "stop-and-ask rules are incomplete");
}

function validateApprovals(value) {
  const boundary = value.approvalBoundary;
  ensure(boundary?.agentMaySelfApprove === false, "agents may not self-approve");
  ensureNonEmptyString(boundary?.defaultMode, "approval default mode");
  ensure(Array.isArray(boundary?.humanApprovalRequiredFor) && boundary.humanApprovalRequiredFor.length >= 8, "human approval boundary is incomplete");
  ensure(Array.isArray(boundary?.completionRequires) && boundary.completionRequires.length >= 5, "completion requirements are incomplete");
}

function validateBacklog(value, goals) {
  const ids = value.initialBacklog.map((item) => item.id);
  ensureUnique(ids, "backlog ids");
  for (const item of value.initialBacklog) {
    ensure(allowedBacklogStatuses.has(item.status), "invalid backlog status: " + item.id);
    ensureNonEmptyString(item.title, "backlog title: " + item.id);
    ensureNonEmptyString(item.ownerRoleId, "backlog owner: " + item.id);
    ensure((goals.goals || []).some((goal) => goal.id === item.goalId), "backlog goal is not canonical: " + item.id);
    ensureNonEmptyString(item.acceptance, "backlog acceptance: " + item.id);
  }
}

function validatePublicSafety(value) {
  const serialized = JSON.stringify(value);
  const forbiddenPatterns = [
    /-----BEGIN [^-]+ PRIVATE KEY-----/,
    /\b(sk|ghp|github_pat|AKIA)[A-Za-z0-9_-]{8,}/,
    /(?:^|\/)(?:Users|home|private|tmp)\/[A-Za-z0-9_. -]+/
  ];
  for (const pattern of forbiddenPatterns) {
    ensure(!pattern.test(serialized), "registry contains a forbidden secret or machine-specific path pattern");
  }
}

function validateDocumentation() {
  const operatingModel = readText(operatingModelPath);
  const briefTemplate = readText(briefTemplatePath);
  ensure(operatingModel.includes("SEIS Agency"), "operating model must name the agency");
  ensure(operatingModel.includes("300-person company model"), "operating model must include the 300-person company model");
  ensure(operatingModel.includes("**Total**"), "operating model must include the headcount total");
  ensure(operatingModel.includes("does not create background workers"), "operating model must state the runtime boundary");
  ensure(operatingModel.includes("First 30-day runway"), "operating model must include the initial runway");
  ensure(briefTemplate.includes("## Objective"), "brief template must include Objective");
  ensure(briefTemplate.includes("## Acceptance and validation"), "brief template must include validation");
  ensure(briefTemplate.includes("## Security and privacy"), "brief template must include security");
  ensure(briefTemplate.includes("## Risks and rollback"), "brief template must include rollback");
}

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    failures.push("cannot read JSON " + relativePath + ": " + error.message);
    return {};
  }
}

function readText(relativePath) {
  try {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  } catch (error) {
    failures.push("cannot read text " + relativePath + ": " + error.message);
    return "";
  }
}

function ensureFile(relativePath, label) {
  ensure(typeof relativePath === "string" && fs.existsSync(path.join(root, relativePath)), label + " is missing: " + relativePath);
}

function ensureObject(value, label) {
  ensure(Boolean(value) && typeof value === "object" && !Array.isArray(value), label + " must be an object");
}

function ensureNonEmptyString(value, label) {
  ensure(typeof value === "string" && value.trim().length > 0, label + " must be a non-empty string");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureUnique(values, label) {
  ensure(new Set(values).size === values.length, label + " must be unique");
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
