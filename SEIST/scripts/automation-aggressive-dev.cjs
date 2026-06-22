const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const steps = [
  { id: "check:workspace", command: "npm", args: ["run", "check:workspace"] },
  { id: "check:foundation", command: "npm", args: ["run", "check:foundation"] },
  { id: "check:release-sync", command: "npm", args: ["run", "check:release-sync"] },
  { id: "check:motion-evidence", command: "npm", args: ["run", "check:motion-evidence"] },
  { id: "check:mobile-ergonomics", command: "npm", args: ["run", "check:mobile-ergonomics"] },
  { id: "check:cloud-environment", command: "npm", args: ["run", "check:cloud-environment"] },
  { id: "check:server-target", command: "npm", args: ["run", "check:server-target"] },
  { id: "check:code-automation-plan", command: "npm", args: ["run", "check:code-automation-plan"] },
  { id: "check:monthly-branch-hardening", command: "npm", args: ["run", "check:monthly-branch-hardening"] },
  { id: "check:aggressive-capability-map", command: "npm", args: ["run", "check:aggressive-capability-map"] },
  { id: "automation:connector-activation-report", command: "npm", args: ["run", "automation:connector-activation-report"] },
  { id: "check:connector-activation-report", command: "npm", args: ["run", "check:connector-activation-report"] },
  { id: "automation:server-cloud-report", command: "npm", args: ["run", "automation:server-cloud-report"] },
  { id: "check:server-cloud-report", command: "npm", args: ["run", "check:server-cloud-report"] },
  { id: "automation:publish-readiness", command: "npm", args: ["run", "automation:publish-readiness"] },
  { id: "automation:develop", command: "npm", args: ["run", "automation:develop"] }
];

function runStep(step) {
  const result = spawnSync(step.command, step.args, {
    cwd: ROOT,
    encoding: "utf8"
  });

  return {
    ...step,
    ok: result.status === 0,
    status: result.status,
    stdout: String(result.stdout || "").trim(),
    stderr: String(result.stderr || "").trim()
  };
}

const results = [];
for (const step of steps) {
  const result = runStep(step);
  results.push(result);
  if (!result.ok) break;
}

const failed = results.find((result) => !result.ok);

console.log("SEIS aggressive development automation");
for (const result of results) {
  console.log(`- ${result.id}: ${result.ok ? "pass" : "fail"}`);
}

if (failed) {
  if (failed.stdout) console.log(`\n${failed.stdout}`);
  if (failed.stderr) console.error(`\n${failed.stderr}`);
  process.exit(1);
}

console.log("\nAll aggressive development checks passed.");
