import { spawnSync } from "node:child_process";

const checks = [
  {
    id: "env-example",
    command: "scripts/check-seis-env-example.mjs"
  },
  {
    id: "public-readiness-docs",
    command: "scripts/check-seis-public-readiness-docs.mjs"
  },
  {
    id: "public-readiness-status",
    command: "scripts/check-seis-public-readiness-status.mjs"
  },
  {
    id: "brain-context-packs",
    command: "scripts/check-seis-brain-context-packs.mjs"
  }
];

const failures = [];

for (const check of checks) {
  const result = spawnSync(process.execPath, [check.command, ...(check.args || [])], {
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.stdout.trim()) {
    console.log(result.stdout.trim());
  }

  if (result.stderr.trim()) {
    console.error(result.stderr.trim());
  }

  if (result.status !== 0) {
    failures.push(`${check.id} failed with exit code ${result.status}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS public readiness aggregate check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS public readiness aggregate check passed.");
