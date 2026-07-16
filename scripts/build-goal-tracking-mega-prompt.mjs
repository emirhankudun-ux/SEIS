import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertBuildPathsIgnored,
  buildSummary,
  compileGoalTrackingPrompt,
  goldenRecord,
  verifyExpectedBuild,
  verifyWrittenBuild,
  writeBuild,
} from './lib/goal-tracking-mega-prompt.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const allowed = new Set(['--json', '--skip-expected', '--print-golden']);

function main() {
  for (const arg of args) {
    if (!allowed.has(arg)) throw new Error(`unknown argument: ${arg}`);
  }
  const build = compileGoalTrackingPrompt(root);
  assertBuildPathsIgnored(root, build);
  if (!args.has('--skip-expected')) verifyExpectedBuild(root, build);
  writeBuild(root, build);
  verifyWrittenBuild(root, build);

  if (args.has('--print-golden')) {
    process.stdout.write(`${JSON.stringify(goldenRecord(build), null, 2)}\n`);
  } else {
    const summary = buildSummary(build);
    if (args.has('--json')) process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    else {
      process.stdout.write(
        `Goal Tracking mega prompt built: ${summary.codePoints} code points, ${summary.chunkCount} chunks, SHA-256 ${summary.outputSha256}\n${summary.buildDirectory}\n`,
      );
    }
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`Goal Tracking mega prompt build failed: ${error.message}\n`);
  process.exitCode = 1;
}
