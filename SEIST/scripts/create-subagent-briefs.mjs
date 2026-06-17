import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const contractPath = "content/development/uixappttr-branch.json";
const runsPath = "content/development/sub-agent-runs.json";
const outputDir = "docs/development/agents";

for (const file of [contractPath, runsPath]) {
  if (!existsSync(file)) {
    throw new Error(`Missing sub-agent input: ${file}`);
  }
}

const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const runs = JSON.parse(readFileSync(runsPath, "utf8"));
const runByAgent = new Map(runs.agents.map(agent => [agent.id, agent]));

mkdirSync(outputDir, { recursive: true });

const indexRows = [];
for (const agent of contract.subAgents) {
  const run = runByAgent.get(agent.id);
  if (!run) {
    throw new Error(`Missing run entry for ${agent.id}`);
  }

  const brief = `# ${titleCase(agent.id)}

## Mission

${agent.mission}

## Current Focus

${run.focus}

## Next Action

${run.nextAction}

## Allowed Surfaces

${agent.allowedSurfaces.map(surface => `- \`${surface}\``).join("\n")}

## Guardrail

Work inside \`${contract.branch}\`; do not create a long-lived branch for this lane.
`;

  writeFileSync(join(outputDir, `${agent.id}.md`), brief);
  indexRows.push(`| ${agent.id} | ${agent.lane} | ${run.status} | ${run.focus} |`);
}

const index = `# UIXAppTTR Sub-Agent Briefs

Run: \`${runs.runId}\`

| Agent | Lane | Status | Focus |
| --- | --- | --- | --- |
${indexRows.join("\n")}
`;

writeFileSync(join(outputDir, "README.md"), index);
console.log(`Sub-agent briefs ready: ${outputDir}`);

function titleCase(value) {
  return value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
