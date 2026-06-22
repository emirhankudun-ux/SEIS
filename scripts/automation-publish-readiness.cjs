const { getPublishReadinessState } = require("./lib/publish-readiness-state.cjs");

function print(line) {
  console.log(line);
}

const state = getPublishReadinessState(process.cwd());

if (!state.gitInside) {
  print("Publish readiness: blocked");
  print(`- reason: ${state.blocker}`);
  print(`- action: ${state.action}`);
  process.exit(1);
}

print("Publish readiness: report");
print(`- branch: ${state.branchName || "unknown"}`);
print(`- branch status: ${state.statusLine || "unknown"}`);
print(`- remote configured: ${state.hasRemote ? "yes" : "no"}`);
print(`- expected branch (${state.expectedBranch}): ${state.isExpectedBranch ? "yes" : "no"}`);
print(`- worktree clean: ${state.worktreeClean ? "yes" : "no"}`);
print(`- dirty files: ${state.worktreeClean ? "none" : state.dirtyFiles.join(", ")}`);
print(`- upstream: ${state.hasUpstream ? state.upstreamName : "missing"}`);
print(`- expected upstream (${state.expectedUpstream}): ${state.hasUpstream && state.isExpectedUpstream ? "yes" : "no"}`);
print(`- upstream sync: ${state.syncLabel}`);
print(`- gh cli available: ${state.ghAvailable ? "yes" : "no"}`);
print(`- github auth: ${state.authReady ? "ready" : "missing"}`);

if (!state.ready) {
  print(`- blocker: ${state.blocker}`);
  print(`- action: ${state.action}`);
  process.exit(1);
}

print("- result: ready for bounded publish preflight");
