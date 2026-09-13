import { createHash } from 'node:crypto';

export const WORKSPACE_SESSION_INPUT_CONTRACT_ID = 'seis-workspace-session-input-v1';
export const WORKSPACE_SESSION_PLAN_CONTRACT_ID = 'seis-workspace-session-plan-v1';

const STAGES = Object.freeze(['prepare', 'build', 'verify', 'handoff']);
const STAGE_INDEX = new Map(STAGES.map((stage, index) => [stage, index]));
const APPROVALS = new Set(['none', 'owner-required']);
const SENSITIVE_KEY = /(api.?key|access.?token|password|private.?key|client.?secret|credential|secret)/i;
const SENSITIVE_VALUE = /(?:^|[^A-Za-z0-9])(ghp_|github_pat_|sk-[A-Za-z0-9]{12,}|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY)/;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isObject(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
}

function validIdentifier(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validateText(value, label, errors, minimum) {
  if (typeof value !== 'string' || value.trim() !== value || value.length < minimum) {
    errors.push(`${label} must be a trimmed string of at least ${minimum} characters`);
  }
}

function validateIdentifierList(value, label, errors, { minimum = 0 } = {}) {
  if (!Array.isArray(value) || value.length < minimum) {
    errors.push(`${label} must contain at least ${minimum} item(s)`);
    return [];
  }
  const seen = new Set();
  value.forEach((item, index) => {
    if (!validIdentifier(item)) errors.push(`${label}[${index}] must be a safe identifier`);
    if (seen.has(item)) errors.push(`${label} contains duplicate identifier: ${item}`);
    seen.add(item);
  });
  return value;
}

function scanSensitive(value, trail, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanSensitive(item, [...trail, String(index)], errors));
    return;
  }
  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (SENSITIVE_KEY.test(key)) errors.push(`sensitive-shaped key is forbidden: ${[...trail, key].join('.')}`);
      scanSensitive(child, [...trail, key], errors);
    }
    return;
  }
  if (typeof value === 'string' && SENSITIVE_VALUE.test(value)) {
    errors.push(`sensitive-shaped value is forbidden: ${trail.join('.') || 'root'}`);
  }
}

function detectCycles(tasksById, errors) {
  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  const visit = (taskId) => {
    if (visited.has(taskId)) return;
    if (visiting.has(taskId)) {
      const start = stack.indexOf(taskId);
      errors.push(`dependency cycle detected: ${[...stack.slice(start), taskId].join(' -> ')}`);
      return;
    }
    visiting.add(taskId);
    stack.push(taskId);
    for (const dependencyId of tasksById.get(taskId)?.dependsOn ?? []) {
      if (tasksById.has(dependencyId)) visit(dependencyId);
    }
    stack.pop();
    visiting.delete(taskId);
    visited.add(taskId);
  };
  [...tasksById.keys()].sort().forEach(visit);
}

export function validateWorkspaceSessionInput(input) {
  const errors = [];
  if (!isObject(input)) return { ok: false, errors: ['input must be an object'] };
  scanSensitive(input, [], errors);

  if (input.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (input.contractId !== WORKSPACE_SESSION_INPUT_CONTRACT_ID) errors.push(`contractId must be ${WORKSPACE_SESSION_INPUT_CONTRACT_ID}`);
  if (!validIdentifier(input.sessionId)) errors.push('sessionId must be a lowercase hyphenated identifier');
  if (input.mode !== 'local-planning') errors.push('mode must remain local-planning');
  validateText(input.mission?.title, 'mission.title', errors, 5);
  validateText(input.mission?.objective, 'mission.objective', errors, 40);
  if (!Number.isInteger(input.timeboxMinutes) || input.timeboxMinutes < 15 || input.timeboxMinutes > 1440) {
    errors.push('timeboxMinutes must be an integer between 15 and 1440');
  }
  const capabilities = validateIdentifierList(input.availableCapabilities, 'availableCapabilities', errors, { minimum: 1 });
  const available = new Set(capabilities);

  if (!Array.isArray(input.tasks) || input.tasks.length < 2) {
    errors.push('tasks must contain at least two entries');
  }

  const tasksById = new Map();
  let totalDuration = 0;
  for (const [index, task] of (input.tasks ?? []).entries()) {
    const label = `tasks[${index}]`;
    if (!isObject(task)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    if (!validIdentifier(task.id)) errors.push(`${label}.id must be a lowercase hyphenated identifier`);
    if (tasksById.has(task.id)) errors.push(`duplicate task id: ${task.id}`);
    tasksById.set(task.id, task);
    validateText(task.label, `${label}.label`, errors, 4);
    if (!STAGE_INDEX.has(task.stage)) errors.push(`${label}.stage must be one of ${STAGES.join(', ')}`);
    if (!Number.isInteger(task.durationMinutes) || task.durationMinutes < 1 || task.durationMinutes > 480) {
      errors.push(`${label}.durationMinutes must be an integer between 1 and 480`);
    } else {
      totalDuration += task.durationMinutes;
    }
    validateIdentifierList(task.dependsOn, `${label}.dependsOn`, errors);
    validateIdentifierList(task.requiredCapabilities, `${label}.requiredCapabilities`, errors);
    if (!APPROVALS.has(task.approval)) errors.push(`${label}.approval must be none or owner-required`);
    validateIdentifierList(task.evidence, `${label}.evidence`, errors, { minimum: 1 });
  }

  for (const task of tasksById.values()) {
    for (const dependencyId of task.dependsOn ?? []) {
      const dependency = tasksById.get(dependencyId);
      if (!dependency) {
        errors.push(`${task.id} depends on unknown task: ${dependencyId}`);
        continue;
      }
      if (dependencyId === task.id) errors.push(`dependency cycle detected: ${task.id} -> ${task.id}`);
      const dependencyStage = STAGE_INDEX.get(dependency.stage);
      const taskStage = STAGE_INDEX.get(task.stage);
      if (dependencyStage !== undefined && taskStage !== undefined && dependencyStage > taskStage) {
        errors.push(`${task.id} violates stage order by depending on later-stage task ${dependencyId}`);
      }
    }
    for (const capability of task.requiredCapabilities ?? []) {
      if (!validIdentifier(capability)) continue;
      // Missing capability is a plan blocker rather than invalid input.
      void available.has(capability);
    }
  }
  detectCycles(tasksById, errors);

  if (Number.isInteger(input.timeboxMinutes) && totalDuration > input.timeboxMinutes) {
    errors.push(`timeboxMinutes ${input.timeboxMinutes} is smaller than total planned duration ${totalDuration}`);
  }

  const expectedPolicy = {
    providerExecution: false,
    externalWrites: false,
    deployment: false,
    privateData: false,
    automaticExecution: false,
    humanApprovalRequired: true,
  };
  for (const [key, expected] of Object.entries(expectedPolicy)) {
    if (input.policy?.[key] !== expected) errors.push(`policy.${key} must be ${expected}`);
  }

  return { ok: errors.length === 0, errors };
}

function topologicalOrder(tasks) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const indegree = new Map(tasks.map((task) => [task.id, task.dependsOn.length]));
  const dependents = new Map(tasks.map((task) => [task.id, []]));
  for (const task of tasks) {
    for (const dependencyId of task.dependsOn) dependents.get(dependencyId).push(task.id);
  }
  const sortReady = (ids) => ids.sort((leftId, rightId) => {
    const left = byId.get(leftId);
    const right = byId.get(rightId);
    return STAGE_INDEX.get(left.stage) - STAGE_INDEX.get(right.stage) || left.id.localeCompare(right.id);
  });
  let ready = sortReady([...indegree.entries()].filter(([, count]) => count === 0).map(([id]) => id));
  const ordered = [];
  while (ready.length) {
    const currentId = ready.shift();
    ordered.push(byId.get(currentId));
    const next = [];
    for (const dependentId of dependents.get(currentId).sort()) {
      const count = indegree.get(dependentId) - 1;
      indegree.set(dependentId, count);
      if (count === 0) next.push(dependentId);
    }
    ready = sortReady([...ready, ...next]);
  }
  return ordered;
}

export function buildWorkspaceSessionPlan(input) {
  const source = structuredClone(input);
  const validation = validateWorkspaceSessionInput(source);
  if (!validation.ok) throw new Error(`Invalid ${WORKSPACE_SESSION_INPUT_CONTRACT_ID}:\n- ${validation.errors.join('\n- ')}`);

  const available = new Set(source.availableCapabilities);
  const blockers = [];
  for (const task of source.tasks) {
    for (const capability of task.requiredCapabilities) {
      if (!available.has(capability)) blockers.push({ type: 'missing-capability', taskId: task.id, capability });
    }
    if (task.approval === 'owner-required') blockers.push({ type: 'owner-approval', taskId: task.id });
  }
  blockers.sort((left, right) => left.taskId.localeCompare(right.taskId) || left.type.localeCompare(right.type));

  let cursor = 0;
  const executionOrder = topologicalOrder(source.tasks).map((task, index) => {
    const startMinute = cursor;
    cursor += task.durationMinutes;
    return {
      ...structuredClone(task),
      order: index + 1,
      startMinute,
      endMinute: cursor,
      blocked: blockers.some((blocker) => blocker.taskId === task.id),
    };
  });

  const stageOrder = STAGES.filter((stage) => executionOrder.some((task) => task.stage === stage));
  const stages = stageOrder.map((stage) => {
    const tasks = executionOrder.filter((task) => task.stage === stage);
    return {
      stage,
      taskIds: tasks.map((task) => task.id),
      durationMinutes: tasks.reduce((sum, task) => sum + task.durationMinutes, 0),
      blockedTaskCount: tasks.filter((task) => task.blocked).length,
    };
  });

  const checkpoints = stages.map((stage) => {
    const tasks = executionOrder.filter((task) => task.stage === stage.stage);
    return {
      stage: stage.stage,
      afterTaskId: tasks.at(-1).id,
      requiredEvidence: [...new Set(tasks.flatMap((task) => task.evidence))].sort(),
      status: 'planned',
      humanReviewRequired: stage.stage === 'verify' || stage.stage === 'handoff',
    };
  });

  const recovery = checkpoints.map((checkpoint, index) => ({
    checkpointStage: checkpoint.stage,
    resumeAfterTaskId: checkpoint.afterTaskId,
    resumeWithTaskId: stages[index + 1]?.taskIds[0] ?? null,
    preserveEvidence: [...checkpoint.requiredEvidence],
    instruction: stages[index + 1]
      ? `Resume with ${stages[index + 1].taskIds[0]} only after reviewing the ${checkpoint.stage} checkpoint evidence.`
      : 'Session handoff is complete; start a new reviewed session before additional work.',
  }));

  return {
    schemaVersion: 1,
    contractId: WORKSPACE_SESSION_PLAN_CONTRACT_ID,
    sessionId: source.sessionId,
    sourceDigest: `sha256:${digest(source)}`,
    status: blockers.length ? 'blocked' : 'ready-for-local-execution',
    mission: structuredClone(source.mission),
    stageOrder,
    stages,
    executionOrder,
    checkpoints,
    recovery,
    blockers,
    summary: {
      taskCount: executionOrder.length,
      stageCount: stages.length,
      checkpointCount: checkpoints.length,
      blockedTaskCount: new Set(blockers.map((blocker) => blocker.taskId)).size,
      availableCapabilityCount: source.availableCapabilities.length,
      totalPlannedMinutes: cursor,
      timeboxMinutes: source.timeboxMinutes,
      remainingMinutes: source.timeboxMinutes - cursor,
    },
    policy: {
      humanApprovalRequired: true,
      executionPerformed: false,
      providerExecutionPerformed: false,
      externalWritePerformed: false,
      deploymentPerformed: false,
      privateDataRead: false,
    },
  };
}

export function summarizeWorkspaceSessionPlan(plan) {
  if (!isObject(plan) || plan.contractId !== WORKSPACE_SESSION_PLAN_CONTRACT_ID) {
    throw new Error('workspace session plan is invalid');
  }
  return {
    sessionId: plan.sessionId,
    title: plan.mission.title,
    status: plan.status,
    taskCount: plan.summary.taskCount,
    stageCount: plan.summary.stageCount,
    checkpointCount: plan.summary.checkpointCount,
    blockerCount: plan.blockers.length,
    totalPlannedMinutes: plan.summary.totalPlannedMinutes,
    remainingMinutes: plan.summary.remainingMinutes,
    sourceDigest: plan.sourceDigest,
  };
}
