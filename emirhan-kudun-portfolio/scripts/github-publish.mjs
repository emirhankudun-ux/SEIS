import { spawnSync } from "node:child_process";

const defaultBranch = "codex/seis-ux-cinematic-premium-foundation";
const branch = process.argv[2] || defaultBranch;

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run("node", ["scripts/origin-push-preflight.mjs", branch]);
run("git", ["push", "-u", "origin", branch]);
