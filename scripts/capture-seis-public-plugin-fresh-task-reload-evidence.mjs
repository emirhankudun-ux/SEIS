#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { pluginIntegrationStatus, publicPluginFamilyStatus } from "../packages/seis-ai/src/lib/plugin-integration.mjs";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-07-12";
const sourcePath = "content/development/seis-public-plugin-fresh-task-reload-evidence.json";
const reportPath = "reports/seis-public-plugin-fresh-task-reload-evidence.md";
const securityReviewPath = "content/development/seis-public-plugin-security-provenance-review.json";
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

if (checkMode) {
  const evidence = readJson(sourcePath);
  const report = readText(reportPath);
  validateEvidence(evidence, report);
  console.log("SEIS public plugin fresh-task reload evidence check passed.");
} else {
  const evidence = captureEvidence();
  const report = renderReport(evidence);
  writeFile(sourcePath, `${JSON.stringify(evidence, null, 2)}\n`);
  writeFile(reportPath, report);
  validateEvidence(evidence, report);
  console.log(`Wrote ${sourcePath}`);
  console.log(`Wrote ${reportPath}`);
}

function captureEvidence() {
  const taskThreadId = process.env.CODEX_THREAD_ID || process.env.SEIS_PUBLIC_PLUGIN_FRESH_TASK_ID || null;
  const taskIdSource = process.env.CODEX_THREAD_ID
    ? "CODEX_THREAD_ID"
    : process.env.SEIS_PUBLIC_PLUGIN_FRESH_TASK_ID
      ? "SEIS_PUBLIC_PLUGIN_FRESH_TASK_ID"
      : "not-exposed";

  const installSmoke = runCommand("install-smoke-local-mcp", [
    "run",
    "check:seis-public-plugin-install-smoke:local:mcp",
  ], { timeout: 30000 });
  installSmoke.summary = summarizeInstallSmoke(installSmoke.stdout);

  const agentIntegration = runCommand("agent-plugin-integration", ["run", "check:seis-agent-plugin-integration"], {
    timeout: 15000,
  });
  agentIntegration.summary = {
    passed: agentIntegration.ok,
    check: "npm run check:seis-agent-plugin-integration",
  };

  const packageTests = runCommand("seis-ai-package-tests", ["test", "--prefix", "packages/seis-ai"], {
    timeout: 60000,
  });
  packageTests.summary = summarizePackageTests(packageTests.stdout);

  const familyStatus = publicPluginFamilyStatus(root);
  const integrationStatus = pluginIntegrationStatus(root);
  const securityReview = readOptionalJson(securityReviewPath);
  const installSummary = installSmoke.summary || {};
  const packageSummary = packageTests.summary || {};
  const commandEvidenceOk = installSmoke.ok && agentIntegration.ok && packageTests.ok;
  const mcpInventoryOk =
    installSummary.ok === true &&
    installSummary.publicPluginCount === 1 &&
    installSummary.installedCount === 1 &&
    installSummary.embeddedModuleCount >= 10 &&
    installSummary.mcpSmokePassed === true;
  const seisAiBridgeOk =
    familyStatus.ok === true &&
    familyStatus.publicPluginCount === 1 &&
    familyStatus.connectedPluginCount === 1 &&
    familyStatus.embeddedModuleCount >= 10 &&
    familyStatus.connectedModuleCount >= 10 &&
    familyStatus.runtimeConnected === true;
  const taskIdRecorded = Boolean(taskThreadId);
  const testsOk = packageSummary.fail === 0 && packageTests.ok;
  const securityReviewPassed =
    securityReview?.status === "repo-local-security-provenance-reviewed" &&
    securityReview?.aggregate?.secretFindingCount === 0 &&
    securityReview?.aggregate?.blockingFindingCount === 0;

  return {
    id: "seis-public-plugin-fresh-task-reload-evidence",
    version: 1,
    generatedAt,
    status:
      taskIdRecorded && commandEvidenceOk && mcpInventoryOk && seisAiBridgeOk && testsOk
        ? "recorded-local-fresh-task-evidence"
        : "incomplete-local-fresh-task-evidence",
    decision: "not-ready-for-public-preview",
    sourcePath,
    reportPath,
    publicReleaseAllowed: false,
    releaseBoundary:
      "Fresh-task reload evidence is local proof only; public preview still requires security/provenance review and human approval.",
    task: {
      threadId: taskThreadId,
      idSource: taskIdSource,
      observedDate: generatedAt,
      freshTaskContinuation: true,
      note: taskThreadId
        ? "Captured from the current Codex task environment."
        : "The current runtime did not expose a task/thread identifier.",
    },
    commands: {
      installSmoke: stripCommand(installSmoke),
      agentIntegration: stripCommand(agentIntegration),
      packageTests: stripCommand(packageTests),
    },
    seisAiBridge: {
      ok: seisAiBridgeOk,
      tool: "seis_public_plugin_family",
      integrationTool: "seis_plugin_integration",
      publicPluginCount: familyStatus.publicPluginCount ?? null,
      connectedPluginCount: familyStatus.connectedPluginCount ?? null,
      embeddedModuleCount: familyStatus.embeddedModuleCount ?? null,
      connectedModuleCount: familyStatus.connectedModuleCount ?? null,
      runtimeConnected: familyStatus.runtimeConnected === true,
      currentChannel: familyStatus.currentChannel ?? null,
      publicPreviewRequires: familyStatus.publicPreviewRequires || [],
      integrationInstallMode: integrationStatus.installMode ?? null,
      integrationPublicPluginCount: integrationStatus.publicPluginCount ?? null,
      integrationEmbeddedModuleCount: integrationStatus.embeddedModuleCount ?? null,
    },
    securityProvenanceReview: {
      path: securityReviewPath,
      status: securityReview?.status || "missing",
      passed: securityReviewPassed,
      secretFindingCount: securityReview?.aggregate?.secretFindingCount ?? null,
      blockingFindingCount: securityReview?.aggregate?.blockingFindingCount ?? null,
      hygieneFindingCount: securityReview?.aggregate?.hygieneFindingCount ?? null,
    },
    mcpInventory: {
      ok: mcpInventoryOk,
      publicPluginCount: installSummary.publicPluginCount ?? null,
      installedCount: installSummary.installedCount ?? null,
      embeddedModuleCount: installSummary.embeddedModuleCount ?? null,
      mcpSmokePassed: installSummary.mcpSmokePassed === true,
      plugins: installSummary.plugins || [],
      representativeToolCalls: installSummary.representativeToolCalls || [],
    },
    packageTestSummary: packageSummary,
    remainingReleaseBlockers: [
      ...(!securityReviewPassed ? ["Security and provenance review for public preview has not passed."] : []),
      "Human approval for public preview, release, publish, push, merge, tag, deploy, live SSH, or provider credentials has not been recorded.",
      "External clean-runner or public package installation proof has not been recorded.",
    ],
    noSecretPolicy: {
      rawCommandOutputStored: false,
      credentialsStored: false,
      privateKeysStored: false,
      providerTokensStored: false,
    },
  };
}

function runCommand(id, args, { timeout }) {
  const result = spawnSync(npmBin, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
    timeout,
  });
  return {
    id,
    command: [npmBin, ...args].join(" "),
    ok: result.status === 0,
    exitCode: result.status,
    signal: result.signal || null,
    stdout: String(result.stdout || ""),
    stderr: String(result.stderr || ""),
  };
}

function stripCommand(command) {
  return {
    id: command.id,
    command: command.command.replace(npmBin, "npm"),
    ok: command.ok,
    exitCode: command.exitCode,
    signal: command.signal,
    summary: command.summary || {},
  };
}

function summarizeInstallSmoke(stdout) {
  const payload = extractJson(stdout);
  if (!payload) {
    return { ok: false, error: "install smoke JSON payload was not found" };
  }
  return {
    ok: payload.ok === true,
    mode: payload.mode,
    status: payload.status,
    publicPluginCount: payload.publicPluginCount,
    installedCount: payload.installedCount,
    embeddedModuleCount: payload.embeddedModuleCount,
    mcpSmokePassed: payload.mcpSmokePassed === true,
    runtime: payload.runtime,
    plugins: (payload.plugins || []).map((plugin) => ({
      name: plugin.name,
      installId: plugin.installId,
      installed: plugin.installed === true,
      version: plugin.version,
      manifestPresent: plugin.manifestPresent === true,
      mcpPresent: plugin.mcpPresent === true,
    })),
    representativeToolCalls: (payload.mcpSmoke || []).map((smoke) => ({
      name: smoke.name,
      ok: smoke.ok === true,
      serverName: smoke.serverName,
      toolCount: smoke.toolCount,
      requiredTools: smoke.requiredTools || [],
      callCount: smoke.callCount,
      missingTools: smoke.missingTools || [],
      callErrors: smoke.callErrors || [],
      missingResponses: smoke.missingResponses || [],
    })),
  };
}

function summarizePackageTests(stdout) {
  const summary = {
    ok: false,
    tests: null,
    suites: null,
    pass: null,
    fail: null,
    mcpInventory: null,
  };
  const tests = /tests\s+(\d+)/.exec(stdout);
  const suites = /suites\s+(\d+)/.exec(stdout);
  const pass = /pass\s+(\d+)/.exec(stdout);
  const fail = /fail\s+(\d+)/.exec(stdout);
  const inventory = /initializes and lists\s+(\d+)\s+tools,\s+(\d+)\s+prompts,\s+(\d+)\s+resources/.exec(stdout);
  summary.tests = tests ? Number(tests[1]) : null;
  summary.suites = suites ? Number(suites[1]) : null;
  summary.pass = pass ? Number(pass[1]) : null;
  summary.fail = fail ? Number(fail[1]) : null;
  summary.ok = summary.fail === 0 && summary.pass !== null;
  if (inventory) {
    summary.mcpInventory = {
      tools: Number(inventory[1]),
      prompts: Number(inventory[2]),
      resources: Number(inventory[3]),
    };
  }
  return summary;
}

function extractJson(stdout) {
  const text = String(stdout || "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function validateEvidence(evidence, report) {
  const failures = [];
  if (evidence.id !== "seis-public-plugin-fresh-task-reload-evidence") failures.push("evidence id is invalid");
  if (evidence.publicReleaseAllowed !== false) failures.push("public release must remain blocked");
  if (!["recorded-local-fresh-task-evidence", "incomplete-local-fresh-task-evidence"].includes(evidence.status)) {
    failures.push("evidence status is invalid");
  }
  if (!evidence.noSecretPolicy || evidence.noSecretPolicy.rawCommandOutputStored !== false) {
    failures.push("evidence must not store raw command output");
  }
  if (Object.values(evidence.commands || {}).some((command) => "stdout" in command || "stderr" in command)) {
    failures.push("evidence commands must contain summaries only");
  }
  if (evidence.status === "recorded-local-fresh-task-evidence") {
    if (!evidence.task?.threadId) failures.push("recorded evidence must include a task/thread id");
    if (evidence.commands?.installSmoke?.ok !== true) failures.push("install smoke command must pass");
    if (evidence.commands?.agentIntegration?.ok !== true) failures.push("agent integration command must pass");
    if (evidence.commands?.packageTests?.ok !== true) failures.push("SEIS AI package tests must pass");
    if (evidence.mcpInventory?.publicPluginCount !== 1) failures.push("MCP inventory must cover the one public plugin");
    if (evidence.mcpInventory?.installedCount !== 1) failures.push("MCP inventory must show the one installed public plugin");
    if (evidence.mcpInventory?.embeddedModuleCount < 10) failures.push("MCP inventory must expose every embedded source module");
    if (evidence.mcpInventory?.mcpSmokePassed !== true) failures.push("MCP smoke must pass");
    if (evidence.seisAiBridge?.runtimeConnected !== true) failures.push("SEIS AI bridge must be runtime connected");
    if (evidence.packageTestSummary?.fail !== 0) failures.push("package test summary must have zero failures");
  }
  if (!report.includes("NO-GO for public preview")) failures.push("report must keep public preview as NO-GO");
  if (!report.includes("Fresh Task Reload Evidence")) failures.push("report must describe fresh task reload evidence");
  if (failures.length) {
    console.error("SEIS public plugin fresh-task reload evidence validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function renderReport(evidence) {
  const commandRows = Object.values(evidence.commands)
    .map((command) => `| ${command.id} | \`${command.command}\` | ${command.ok ? "pass" : "fail"} | ${command.exitCode ?? "n/a"} |`)
    .join("\n");
  const pluginRows = (evidence.mcpInventory.plugins || [])
    .map((plugin) => `| ${plugin.name} | ${plugin.installId} | ${plugin.installed ? "yes" : "no"} | ${plugin.mcpPresent ? "yes" : "no"} | ${plugin.version || "n/a"} |`)
    .join("\n");
  const toolRows = (evidence.mcpInventory.representativeToolCalls || [])
    .map((item) => `| ${item.name} | ${item.serverName} | ${item.ok ? "pass" : "fail"} | ${item.toolCount ?? "n/a"} | ${item.requiredTools.join(", ")} |`)
    .join("\n");
  return `# SEIS Public Plugin Fresh Task Reload Evidence

- Generated: ${evidence.generatedAt}
- Status: ${evidence.status}
- Decision: ${evidence.decision}
- Public release allowed: ${evidence.publicReleaseAllowed ? "yes" : "no"}
- Task/thread id source: ${evidence.task.idSource}
- Task/thread id recorded: ${evidence.task.threadId ? "yes" : "no"}

## Command Evidence

| evidence | command | status | exit |
| --- | --- | --- | --- |
${commandRows}

## SEIS AI Bridge

- Tool: ${evidence.seisAiBridge.tool}
- Runtime connected: ${evidence.seisAiBridge.runtimeConnected ? "yes" : "no"}
- Public plugins: ${evidence.seisAiBridge.publicPluginCount}
- Connected plugins: ${evidence.seisAiBridge.connectedPluginCount}
- Embedded source modules: ${evidence.seisAiBridge.embeddedModuleCount}
- Connected source modules: ${evidence.seisAiBridge.connectedModuleCount}
- Current channel: ${evidence.seisAiBridge.currentChannel}

## Security Provenance Review

- Status: ${evidence.securityProvenanceReview.status}
- Passed: ${evidence.securityProvenanceReview.passed ? "yes" : "no"}
- Secret findings: ${evidence.securityProvenanceReview.secretFindingCount}
- Blocking findings: ${evidence.securityProvenanceReview.blockingFindingCount}
- Hygiene findings: ${evidence.securityProvenanceReview.hygieneFindingCount}

## MCP Inventory

| plugin | install id | installed | MCP present | version |
| --- | --- | --- | --- | --- |
${pluginRows}

## Representative MCP Calls

| plugin | server | status | tool count | required tools |
| --- | --- | --- | --- | --- |
${toolRows}

## Package Test Summary

- Tests: ${evidence.packageTestSummary.tests}
- Suites: ${evidence.packageTestSummary.suites}
- Pass: ${evidence.packageTestSummary.pass}
- Fail: ${evidence.packageTestSummary.fail}
- MCP inventory: ${evidence.packageTestSummary.mcpInventory ? `${evidence.packageTestSummary.mcpInventory.tools} tools, ${evidence.packageTestSummary.mcpInventory.prompts} prompts, ${evidence.packageTestSummary.mcpInventory.resources} resources` : "not parsed"}

## Remaining Release Blockers

${evidence.remainingReleaseBlockers.map((blocker) => `- ${blocker}`).join("\n")}

## Decision

NO-GO for public preview until security/provenance review and human approval are
recorded. This file is fresh-task reload evidence only.
`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function readOptionalJson(file) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function writeFile(file, body) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), body);
}
