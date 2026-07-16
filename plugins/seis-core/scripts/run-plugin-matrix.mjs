#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  APP_PLUGIN_EXPANSION_TARGET,
} from "../runtime/plugin-audit-definitions.mjs";
import {
  APP_PLUGIN_GOAL_ID,
  APP_PLUGIN_SOURCE_ROOT,
  discoverApplicationPlugins,
  readCurrentRelease,
  runPluginStatus,
  validatePluginContract,
  writeJson,
} from "../runtime/plugin-contract.mjs";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(scriptRoot, "../..");
const artifactPath = path.join(repoRoot, "content", "development", "seis-core-plugin-matrix.json");
const checkMode = process.argv.includes("--check");
const jsonMode = process.argv.includes("--json");
const strictMode = process.argv.includes("--strict") || checkMode;
const timeoutMs = readIntegerOption("--timeout-ms") ?? 5000;

const record = buildMatrix();
if (strictMode && record.failureCount > 0) {
  printRecord(record, jsonMode);
  process.exit(1);
}

if (checkMode) {
  const expected = `${JSON.stringify(record, null, 2)}\n`;
  const actual = fs.existsSync(artifactPath) ? fs.readFileSync(artifactPath, "utf8") : "";
  if (actual !== expected) {
    console.error("plugins/seis-core matrix artifact is stale. Run: npm run automation:seis-core-plugin-matrix");
    process.exit(1);
  }
} else if (!jsonMode) {
  writeJson(artifactPath, record);
}

printRecord(record, jsonMode || checkMode);

function buildMatrix() {
  const currentRelease = readCurrentRelease(repoRoot);
  const bundles = discoverApplicationPlugins(repoRoot);
  const plugins = bundles.map((bundle) => {
    const contractFailures = validatePluginContract(bundle, currentRelease);
    const status = contractFailures.length
      ? { state: "invalid-contract", ok: false, failures: contractFailures, execution: "skipped" }
      : runPluginStatus(bundle, repoRoot, { timeoutMs });
    return {
      name: bundle.name,
      version: bundle.manifest.version,
      releaseTrainVersion: bundle.profile.releaseTrainVersion,
      entrypoint: bundle.entrypoint,
      implementationState: bundle.profile.implementationState,
      permissionBoundary: {
        write: bundle.profile.permissions?.write || null,
        network: bundle.profile.permissions?.network || null,
        secrets: bundle.profile.permissions?.secrets || null,
      },
      status: status.state,
      ok: status.ok === true,
      execution: status.execution,
      failures: status.failures || [],
    };
  });
  const failures = plugins.filter((plugin) => !plugin.ok);
  return {
    schemaVersion: 1,
    id: "seis-core-plugin-matrix",
    goalId: APP_PLUGIN_GOAL_ID,
    application: "apps/seis-core",
    sourceRoot: APP_PLUGIN_SOURCE_ROOT,
    generatedAt: "2026-07-15",
    release: {
      label: currentRelease.label,
      semver: currentRelease.semver,
      kind: currentRelease.kind,
      major: currentRelease.major,
      revision: currentRelease.revision,
      microUnits: currentRelease.microUnits ?? null,
    },
    policy: {
      mode: "status-only-local-runtime",
      sourceMutation: false,
      network: "disabled-by-default",
      secrets: "not-read",
      writePermissionsRequired: false,
      timeoutMs,
    },
    pluginCount: plugins.length,
    expectedPluginCount: APP_PLUGIN_EXPANSION_TARGET,
    readyCount: plugins.filter((plugin) => plugin.ok && plugin.status === "ready").length,
    attentionCount: plugins.filter((plugin) => plugin.ok && plugin.status === "attention").length,
    failureCount: failures.length,
    failures: failures.map((plugin) => ({ name: plugin.name, status: plugin.status, failures: plugin.failures })),
    plugins,
  };
}

function printRecord(record, forceJson) {
  if (forceJson) {
    console.log(JSON.stringify(record, null, 2));
    return;
  }
  console.log(`SEIS Core plugin matrix: ${record.pluginCount}/${record.expectedPluginCount} discovered, ${record.readyCount} ready, ${record.failureCount} failed at ${record.release.label}.`);
  console.log(`Source mutation: ${record.policy.sourceMutation}; network: ${record.policy.network}; secrets: ${record.policy.secrets}.`);
  if (record.failureCount > 0) {
    for (const failure of record.failures) console.log(`- ${failure.name}: ${failure.status} (${failure.failures.join(", ")})`);
  }
}

function readIntegerOption(name) {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  const value = Number(process.argv[index + 1]);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  return value;
}
