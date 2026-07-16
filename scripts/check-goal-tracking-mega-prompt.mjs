import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertBuildPathsIgnored,
  buildSummary,
  compileGoalTrackingPrompt,
  verifyExpectedBuild,
  verifyWrittenBuild,
} from './lib/goal-tracking-mega-prompt.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function main() {
  const first = compileGoalTrackingPrompt(root);
  const second = compileGoalTrackingPrompt(root);

  if (first.prompt !== second.prompt)
    throw new Error('two compiler runs produced different prompt bytes');
  if (first.manifestText !== second.manifestText)
    throw new Error('two compiler runs produced different manifests');
  if (
    first.outputSha256 !== second.outputSha256 ||
    first.manifestSha256 !== second.manifestSha256
  ) {
    throw new Error('two compiler runs produced different integrity digests');
  }
  assertBuildPathsIgnored(root, first);
  verifyExpectedBuild(root, first);
  if (existsSync(resolve(root, first.buildDirectory))) verifyWrittenBuild(root, first);

  const summary = buildSummary(first);
  process.stdout.write(
    `Goal Tracking mega prompt check passed: ${summary.codePoints} code points, ${summary.scenarioCount} scenarios, ${summary.semanticFitDirectiveCount} exact-fit directives, ${summary.chunkCount} chunks, SHA-256 ${summary.outputSha256}\n`,
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`Goal Tracking mega prompt check failed: ${error.message}\n`);
  process.exitCode = 1;
}
