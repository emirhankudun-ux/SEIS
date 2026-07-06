import path from "node:path";

export function evaluateSubagentRuntimePolicy({
  repoRoot,
  task,
  role,
  permission,
  cancellationFixture,
  approvalFixture,
  signal = "",
  requestedTool = "",
  requestedPath = "",
} = {}) {
  if (!task || typeof task !== "object") {
    return { ok: false, error: "task is required" };
  }

  const cancellation = evaluateCancellationSignal(cancellationFixture, signal);
  const tool = evaluateRequestedTool(role, requestedTool);
  const pathDecision = evaluateRequestedPath(repoRoot, requestedPath, task.targetScope);
  const approvalRequired =
    task.approvalRequired === true ||
    permission?.approvalRequired === true ||
    permission?.approvalRequired === "task-scoped" ||
    task.state === "awaiting-approval";

  let decision = "allowed";
  let nextState = task.state;
  let reason = "task can be evaluated in dry-run mode only";

  if (cancellation.cancelled) {
    decision = "cancelled";
    nextState = "cancelled";
    reason = cancellation.reason;
  } else if (cancellation.allowed === false) {
    decision = "denied";
    reason = cancellation.reason;
  } else if (tool.allowed === false) {
    decision = "denied";
    reason = tool.reason;
  } else if (pathDecision.allowed === false) {
    decision = "denied";
    reason = pathDecision.reason;
  } else if (approvalRequired) {
    decision = "blocked";
    nextState = "awaiting-approval";
    reason = "task requires explicit human approval before execution";
  }

  return {
    ok: true,
    decision,
    nextState,
    reason,
    approvalRequired,
    approvalModel: approvalFixture?.approvalModel ?? null,
    blanketApprovalAllowed: approvalFixture?.blanketApprovalAllowed === true,
    requiredApprovalEvidence: approvalFixture?.sampleRequests?.find((request) => request.executionBlocked === true)?.requiredEvidence || [],
    cancellation,
    requestedTool: tool,
    requestedPath: pathDecision,
    realExecutionBlocked: true,
    externalMutationPerformed: false,
    fileMutationPerformed: false,
  };
}

export function evaluateCancellationSignal(cancellationFixture, signal) {
  if (!signal) return { allowed: true, cancelled: false, signal: null };
  const supportedSignals = Array.isArray(cancellationFixture?.supportedSignals) ? cancellationFixture.supportedSignals : [];
  if (!supportedSignals.includes(signal)) {
    return {
      allowed: false,
      cancelled: false,
      signal,
      reason: `unsupported cancellation signal: ${signal}`,
    };
  }

  return {
    allowed: true,
    cancelled: true,
    signal,
    toState: "cancelled",
    artifactsPreserved: cancellationFixture?.sampleCancellation?.artifactsPreserved === true,
    laterToolCallsAllowed: false,
    reason: `dry-run task cancelled by ${signal}`,
  };
}

export function evaluateRequestedTool(role, requestedTool) {
  if (!requestedTool) return { allowed: true, tool: null, reason: "no tool requested" };
  const deniedTools = Array.isArray(role?.deniedTools) ? role.deniedTools : [];
  if (deniedTools.includes(requestedTool)) {
    return { allowed: false, tool: requestedTool, reason: `tool denied by role policy: ${requestedTool}` };
  }

  const allowedTools = Array.isArray(role?.allowedTools) ? role.allowedTools : [];
  if (allowedTools.length > 0 && !allowedTools.includes(requestedTool)) {
    return { allowed: false, tool: requestedTool, reason: `tool is not in role allowlist: ${requestedTool}` };
  }

  return { allowed: true, tool: requestedTool, reason: "tool allowed for dry-run evaluation" };
}

export function evaluateRequestedPath(repoRoot, requestedPath, targetScope) {
  if (!requestedPath) return { allowed: true, path: null, reason: "no path requested" };

  const root = path.resolve(repoRoot || process.cwd());
  const resolved = path.resolve(root, requestedPath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return { allowed: false, path: requestedPath, reason: "path traversal denied" };
  }

  const normalizedPath = path.relative(root, resolved).split(path.sep).join("/");
  const scopes = Array.isArray(targetScope) ? targetScope : [];
  const withinScope = scopes.some((scope) => matchesScope(normalizedPath, scope));
  return {
    allowed: withinScope,
    path: requestedPath,
    normalizedPath,
    targetScope: scopes,
    reason: withinScope ? "path is inside task target scope" : "path is outside task target scope",
  };
}

export function matchesScope(normalizedPath, scope) {
  if (typeof scope !== "string" || !scope) return false;
  if (scope.endsWith("/**")) {
    const prefix = scope.slice(0, -3);
    return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
  }
  if (scope.endsWith("/*")) {
    const prefix = scope.slice(0, -2);
    const remainder = normalizedPath.slice(prefix.length + 1);
    return normalizedPath.startsWith(`${prefix}/`) && remainder.length > 0 && !remainder.includes("/");
  }
  if (scope.includes("*")) return false;
  return normalizedPath === scope;
}
