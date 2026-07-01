import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

test("mobile 24/7 report keeps claims blocked when readiness is blocked", () => {
  const { report, markdown } = runReport(blockedReadiness());

  assert.equal(report.ok, false);
  assert.equal(report.status, "blocked");
  assert.equal(report.claimGate.id, "seis-ssh-mobile-24x7-claim-gate");
  assert.equal(report.claimGate.readyClaimAllowed, false);
  assert.equal(report.claimGate.continuityClaimAllowed, false);
  assert.equal(report.claimGate.macOffClaimAllowed, false);
  assert.equal(report.claimGate.strictDoctorPassed, false);
  assert.equal(report.claimGate.browserLocalProofAllowed, false);
  assert.equal(report.claimGate.codespacesContinuityAllowed, false);
  assert.equal(report.claimGate.directCloudTransport, false);
  assert.deepEqual(report.claimGate.blockedBy, ["mobile-24x7-requires-direct-cloud-transport"]);
  assert.equal(report.handoffReplay.replayableOnNewDevice, false);
  assert.equal(report.handoffReplay.browserLocalProofAllowed, false);
  assert.equal(report.handoffReplay.codespacesReplayAllowedFor24x7, false);
  assert.equal(report.handoffReplay.localMacReplayDependencyAllowed, false);
  assert.deepEqual(report.handoffReplay.blockedBy, ["mobile-24x7-requires-direct-cloud-transport"]);
  assert.equal(evidenceStatus(report, "profile-contract"), "blocked");
  assert.equal(evidenceStatus(report, "handoff-doctor"), "strict-doctor-required");
  assert.match(markdown, /Ready claim allowed \| no/);
  assert.match(markdown, /Mac-off continuity allowed \| no/);
  assert.match(markdown, /Replayable on new device \| no/);
});

test("mobile 24/7 report requires strict doctor before allowing claims", () => {
  const { report } = runReport(readyReadiness());

  assert.equal(report.ok, true);
  assert.equal(report.status, "mobile-24x7-ready");
  assert.equal(report.claimGate.status, "blocked");
  assert.equal(report.claimGate.allowedOnlyAfterCommand, "npm run cloud:ssh:mobile-direct:doctor:strict");
  assert.equal(report.claimGate.allowedOnlyAfterClaimScope, "mobile-24x7-ready");
  assert.equal(report.claimGate.strictDoctorRequired, true);
  assert.equal(report.claimGate.strictDoctorRequested, false);
  assert.equal(report.claimGate.strictDoctorPassed, false);
  assert.equal(report.claimGate.directCloudTransport, true);
  assert.equal(report.claimGate.readyClaimAllowed, false);
  assert.equal(report.claimGate.macOffClaimAllowed, false);
  assert.equal(report.claimGate.localMacDependencyAllowed, false);
  assert.deepEqual(report.claimGate.blockedBy, ["strict-doctor-required"]);
  assert.equal(report.handoffReplay.replayableOnNewDevice, false);
  assert.equal(report.handoffReplay.requiresStrictDoctor, true);
  assert.equal(report.handoffReplay.requiresDirectCloudTransport, true);
  assert.equal(report.handoffReplay.requiresSecretFreeReport, true);
  assert.deepEqual(report.handoffReplay.blockedBy, ["strict-doctor-required"]);
  assert.equal(evidenceStatus(report, "profile-contract"), "observed-direct-cloud");
  assert.equal(evidenceStatus(report, "readiness-probe"), "passed");
  assert.equal(evidenceStatus(report, "handoff-doctor"), "strict-doctor-required");
});

test("strict mobile 24/7 report opens claims only after ready evidence", () => {
  const { report } = runReport(readyReadiness(), ["--require-ready"]);

  assert.equal(report.ok, true);
  assert.equal(report.claimGate.status, "mobile-24x7-ready");
  assert.equal(report.claimGate.strictDoctorRequested, true);
  assert.equal(report.claimGate.strictDoctorPassed, true);
  assert.equal(report.claimGate.readyClaimAllowed, true);
  assert.equal(report.claimGate.continuityClaimAllowed, true);
  assert.equal(report.claimGate.macOffClaimAllowed, true);
  assert.deepEqual(report.claimGate.blockedBy, []);
  assert.equal(report.handoffReplay.replayableOnNewDevice, true);
  assert.equal(report.handoffReplay.commands.probeStrict, "npm run cloud:ssh:mobile-direct:probe:strict");
  assert.equal(report.handoffReplay.commands.doctorStrict, "npm run cloud:ssh:mobile-direct:doctor:strict");
  assert.deepEqual(report.handoffReplay.blockedBy, []);
  assert.equal(report.evidenceManifest.secretFree, true);
  assert.equal(report.evidenceManifest.credentialValuesIncluded, false);
  assert.equal(evidenceStatus(report, "handoff-doctor"), "passed");
  assert.equal(evidenceStatus(report, "contract-guard"), "separate-check-required");
});

function runReport(readiness, extraArgs = []) {
  const dir = mkdtempSync(join(tmpdir(), "seis-mobile-24x7-report-"));
  const readinessPath = join(dir, "readiness.json");
  const jsonOut = join(dir, "report.json");
  const mdOut = join(dir, "report.md");
  writeFileSync(readinessPath, `${JSON.stringify(readiness, null, 2)}\n`, "utf8");

  const run = spawnSync(process.execPath, [
    "scripts/create-seis-ssh-mobile-24x7-report.mjs",
    "--readiness-json",
    readinessPath,
    "--json-out",
    jsonOut,
    "--md-out",
    mdOut,
    ...extraArgs
  ], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 20000
  });

  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  return {
    report: JSON.parse(readFileSync(jsonOut, "utf8")),
    markdown: readFileSync(mdOut, "utf8")
  };
}

function evidenceStatus(report, id) {
  return report.evidenceManifest.entries.find((entry) => entry.id === id)?.status;
}

function blockedReadiness() {
  return {
    ok: false,
    status: "blocked",
    host: "SEIS-SSH",
    target: "chatgpt-mobile-24x7-ssh",
    blockers: ["mobile-24x7-requires-direct-cloud-transport"],
    warnings: ["codespaces-online-but-not-24x7-mobile-ssh"],
    checks: {
      sshConfig: {
        transport: "codespace",
        pickerCompatible: false,
        mobile24x7Compatible: false
      }
    },
    nextActions: [],
    safety: []
  };
}

function readyReadiness() {
  return {
    ok: true,
    status: "mobile-24x7-ready",
    host: "SEIS-SSH",
    target: "chatgpt-mobile-24x7-ssh",
    blockers: [],
    warnings: [],
    checks: {
      sshConfig: {
        transport: "direct-cloud",
        pickerCompatible: true,
        mobile24x7Compatible: true
      },
      tcp: {
        checked: true,
        reachable: true
      },
      sshAuth: {
        checked: true,
        authenticated: true
      },
      remoteRuntime: {
        checked: true,
        online: true,
        sshAiInstalled: true,
        sshAiDaemonActive: true,
        repoPresent: true,
        codexAvailable: true
      }
    },
    nextActions: [],
    safety: []
  };
}
