import fs from 'node:fs';
import {
  buildWorkspaceSessionPlan,
  summarizeWorkspaceSessionPlan,
} from '../packages/seis-workspace-planner/src/workspace-session-planner.mjs';

const inputPath = process.argv[3] ?? 'packages/seis-workspace-planner/fixtures/public-session.json';
const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const plan = buildWorkspaceSessionPlan(input);
const command = process.argv[2] ?? 'summary';

switch (command) {
  case 'summary':
    console.log(JSON.stringify(summarizeWorkspaceSessionPlan(plan), null, 2));
    break;
  case 'json':
  case 'plan':
    console.log(JSON.stringify(plan, null, 2));
    break;
  case 'tasks':
    console.log(JSON.stringify(plan.executionOrder, null, 2));
    break;
  case 'stages':
    console.log(JSON.stringify(plan.stages, null, 2));
    break;
  case 'checkpoints':
    console.log(JSON.stringify(plan.checkpoints, null, 2));
    break;
  case 'recovery':
    console.log(JSON.stringify(plan.recovery, null, 2));
    break;
  case 'blockers':
    console.log(JSON.stringify(plan.blockers, null, 2));
    break;
  default:
    throw new Error(`unknown command: ${command}`);
}
