import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const sprintPath = "content/development/sprint-zero.json";
const backlogPath = "content/development/backlog.json";
const decisionPath = "content/development/decision-log.json";
const mobileMatrixPath = "content/development/mobile-path-matrix.json";
const branchConsolidationPath = "content/development/branch-consolidation.json";
const premiumLocalFoundationPath = "content/development/premium-local-foundation-subagent.json";
const subAgentRunsPath = "content/development/sub-agent-runs.json";
const longTermProgramPath = "content/development/long-term-program.json";
const outputPath = "docs/development/development-summary.md";

for (const file of [sprintPath, backlogPath, decisionPath, mobileMatrixPath, branchConsolidationPath, premiumLocalFoundationPath, subAgentRunsPath, longTermProgramPath]) {
  if (!existsSync(file)) {
    throw new Error(`Missing development input: ${file}`);
  }
}

const sprint = JSON.parse(readFileSync(sprintPath, "utf8"));
const backlog = JSON.parse(readFileSync(backlogPath, "utf8"));
const decisions = JSON.parse(readFileSync(decisionPath, "utf8"));
const mobileMatrix = JSON.parse(readFileSync(mobileMatrixPath, "utf8"));
const branchConsolidation = JSON.parse(readFileSync(branchConsolidationPath, "utf8"));
const premiumLocalFoundation = JSON.parse(readFileSync(premiumLocalFoundationPath, "utf8"));
const subAgentRuns = JSON.parse(readFileSync(subAgentRunsPath, "utf8"));
const longTermProgram = JSON.parse(readFileSync(longTermProgramPath, "utf8"));
const statusCounts = countBy(backlog.items, "status");
const priorityCounts = countBy(backlog.items, "priority");
const blockedItems = backlog.items.filter(item => item.status === "blocked" || item.status === "needs-decision");

const summary = `# Development Summary

## Sprint

- Name: ${sprint.name}
- Branch: \`${sprint.branch}\`
- Purpose: ${sprint.purpose}

## Backlog Health

| Metric | Value |
| --- | --- |
| Total items | ${backlog.items.length} |
| Ready | ${statusCounts.ready || 0} |
| Planned | ${statusCounts.planned || 0} |
| Blocked | ${statusCounts.blocked || 0} |
| Needs decision | ${statusCounts["needs-decision"] || 0} |
| Critical | ${priorityCounts.critical || 0} |
| High | ${priorityCounts.high || 0} |

## Blockers And Decisions

${blockedItems.map(item => `- ${item.id}: ${item.title} (${item.status})`).join("\n")}

## Decision Log

${decisions.decisions.map(decision => `- ${decision.id}: ${decision.title} - ${decision.status}`).join("\n")}

## Mobile Path

- Recommended path: ${mobileMatrix.recommendedPath}
- Decision gate: ${mobileMatrix.decisionGate}

## Branch Consolidation

- Repository: ${branchConsolidation.repositoryName}
- Active branch: ${branchConsolidation.activeBranch}
- Status: ${branchConsolidation.consolidationStatus}
- Local branches: ${branchConsolidation.localBranchesAfterConsolidation.join(", ")}
- Absorbed branches: ${branchConsolidation.absorbedBranches.map(branch => branch.name).join(", ")}

## Premium Local Foundation

- Former branch: ${premiumLocalFoundation.formerBranchName}
- Sub-agent: ${premiumLocalFoundation.subAgentId}
- Status: ${premiumLocalFoundation.status}
- Rule: ${premiumLocalFoundation.rule}

## Sub-Agent Run

- Run ID: ${subAgentRuns.runId}
- Mode: ${subAgentRuns.mode}
- Active agents: ${subAgentRuns.agents.filter(agent => agent.status === "active").map(agent => agent.id).join(", ")}

## Long-Term Program

- Horizon: ${longTermProgram.horizon}
- Operating mode: ${longTermProgram.operatingMode}
- Phases: ${longTermProgram.phases.length}
- Active phase: ${longTermProgram.phases.filter(phase => phase.status === "active").map(phase => phase.name).join(", ")}
- Blocked phase: ${longTermProgram.phases.filter(phase => phase.status === "blocked").map(phase => phase.name).join(", ")}
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, summary);
console.log(`Development summary ready: ${outputPath}`);

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}
