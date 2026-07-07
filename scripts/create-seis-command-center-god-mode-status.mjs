#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { godModeStatus, GOD_MODE_STATUS_RESOURCE_URI, GOD_MODE_STATUS_TOOL } from "../packages/seis-ai/src/lib/plugin-integration.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const root = path.join(path.dirname(scriptPath), "..");
const outputPath = path.join(root, "apps", "seis-core", "data", "seis-god-mode-status.json");
const checkOnly = process.argv.includes("--check");

function buildArtifact() {
  const status = godModeStatus(root);
  if (!status.ok) {
    throw new Error(`SEIS God Mode status could not be built: ${status.error || "unknown error"}`);
  }

  return {
    artifactId: "seis-command-center-god-mode-status",
    schemaVersion: "1.0.0",
    generatedBy: "scripts/create-seis-command-center-god-mode-status.mjs",
    sourceTool: GOD_MODE_STATUS_TOOL,
    sourceResource: GOD_MODE_STATUS_RESOURCE_URI,
    sourcePolicy: "packages/seis-ai/src/lib/plugin-integration.mjs#godModeStatus",
    sourceRecords: [
      status.contractPath,
      status.moduleCoveragePath,
      status.runStatePath,
      status.workPackagePath,
    ],
    summary: {
      status: status.status,
      requiredLayerCount: status.requiredLayerCount,
      moduleCount: status.moduleCount,
      runState: status.runState?.current ?? null,
      commitReadiness: status.commitReadiness,
      releaseReadiness: status.releaseReadiness,
      nextSafeActionCount: status.nextSafeActions.length,
    },
    status,
  };
}

function serializeArtifact(artifact) {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}

const nextContent = serializeArtifact(buildArtifact());

if (checkOnly) {
  const currentContent = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (currentContent !== nextContent) {
    throw new Error(`SEIS Command Center God Mode status artifact is stale: ${path.relative(root, outputPath)}`);
  }
  console.log(`SEIS Command Center God Mode status artifact is current: ${path.relative(root, outputPath)}`);
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, nextContent);
  console.log(`SEIS Command Center God Mode status artifact written: ${path.relative(root, outputPath)}`);
}
