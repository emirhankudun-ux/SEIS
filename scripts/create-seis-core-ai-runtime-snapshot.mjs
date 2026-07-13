import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  AI_CORE_RUNTIME_SNAPSHOT_PATH,
  buildAiCoreRuntimeSnapshot,
} from "../packages/seis-ai/src/model/core-runtime-snapshot.mjs";

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, ...AI_CORE_RUNTIME_SNAPSHOT_PATH.split("/"));
const expected = `${JSON.stringify(buildAiCoreRuntimeSnapshot(repoRoot), null, 2)}\n`;
const write = process.argv.includes("--write");
const check = process.argv.includes("--check");

if (write && check) {
  throw new Error("Choose either --write or --check for the SEIS AI Core runtime snapshot.");
}

if (write) {
  await writeFile(outputPath, expected, "utf8");
  console.log(`Wrote ${AI_CORE_RUNTIME_SNAPSHOT_PATH}`);
} else if (check) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== expected) {
    console.error(`SEIS AI Core runtime snapshot is stale: ${AI_CORE_RUNTIME_SNAPSHOT_PATH}`);
    console.error("Run npm run automation:seis-core-ai-runtime-snapshot and review the generated diff.");
    process.exitCode = 1;
  } else {
    console.log("SEIS AI Core runtime snapshot check passed.");
  }
} else {
  console.log(expected.trimEnd());
}
